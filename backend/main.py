import base64
import io
import json
import numpy as np
import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

app = FastAPI(title="OpenCV Image Processing Lab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def decode_image(data: str) -> np.ndarray:
    if "," in data:
        data = data.split(",", 1)[1]
    img_bytes = base64.b64decode(data)
    arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image")
    return img


def encode_image(img: np.ndarray, fmt: str = ".png") -> str:
    success, buf = cv2.imencode(fmt, img)
    if not success:
        raise HTTPException(status_code=500, detail="Could not encode image")
    b64 = base64.b64encode(buf.tobytes()).decode()
    mime = "image/png" if fmt == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64}"


def histogram_to_base64(img: np.ndarray) -> str:
    fig, axes = plt.subplots(1, 1, figsize=(5, 3), facecolor="#40405e")
    ax = axes
    ax.set_facecolor('#16213e')
    colors_map = {'B': '#3b82f6', 'G': '#22c55e', 'R': '#ef4444'}
    if len(img.shape) == 2:
        hist = cv2.calcHist([img], [0], None, [256], [0, 256])
        ax.plot(hist, color='#94a3b8', linewidth=1.5)
        ax.fill_between(range(256), hist.flatten(), alpha=0.3, color='#94a3b8')
    else:
        for i, (color_name, color_hex) in enumerate(zip(['B', 'G', 'R'], ['#3b82f6', '#22c55e', '#ef4444'])):
            hist = cv2.calcHist([img], [i], None, [256], [0, 256])
            ax.plot(hist, color=color_hex, linewidth=1.5, label=color_name)
            ax.fill_between(range(256), hist.flatten(), alpha=0.2, color=color_hex)
    ax.set_xlim([0, 256])
    ax.tick_params(colors='#94a3b8', labelsize=8)
    for spine in ax.spines.values():
        spine.set_edgecolor('#334155')
    ax.legend(facecolor='#1e293b', edgecolor='#334155', labelcolor='#94a3b8', fontsize=8)
    plt.tight_layout(pad=0.5)
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=80, bbox_inches='tight', facecolor='#1a1a2e')
    plt.close()
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode()
    return f"data:image/png;base64,{b64}"


class ImageRequest(BaseModel):
    image: str
    params: Optional[dict] = {}


# ── Upload ────────────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    h, w = img.shape[:2]
    encoded = encode_image(img)
    return {"image": encoded, "width": w, "height": h, "channels": img.shape[2] if len(img.shape) == 3 else 1}


# ── Color Spaces ──────────────────────────────────────────────────────────────

@app.post("/api/color/grayscale")
async def to_grayscale(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return {"result": encode_image(gray)}


@app.post("/api/color/hsv")
async def to_hsv(req: ImageRequest):
    img = decode_image(req.image)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    return {"result": encode_image(hsv)}


@app.post("/api/color/channels")
async def split_channels(req: ImageRequest):
    img = decode_image(req.image)
    b, g, r = cv2.split(img)
    zeros = np.zeros_like(b)
    r_img = cv2.merge([zeros, zeros, r])
    g_img = cv2.merge([zeros, g, zeros])
    b_img = cv2.merge([b, zeros, zeros])
    return {
        "red": encode_image(r_img),
        "green": encode_image(g_img),
        "blue": encode_image(b_img),
    }


@app.post("/api/color/rgb")
async def to_rgb(req: ImageRequest):
    img = decode_image(req.image)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return {"result": encode_image(rgb)}


# ── Brightness & Contrast ─────────────────────────────────────────────────────

@app.post("/api/adjust/brightness-contrast")
async def brightness_contrast(req: ImageRequest):
    img = decode_image(req.image)
    alpha = float(req.params.get("contrast", 1.0))
    beta = int(req.params.get("brightness", 0))
    result = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    return {"result": encode_image(result)}


# ── Histogram ─────────────────────────────────────────────────────────────────

@app.post("/api/histogram/show")
async def show_histogram(req: ImageRequest):
    img = decode_image(req.image)
    hist_img = histogram_to_base64(img)
    return {"histogram": hist_img}


@app.post("/api/histogram/equalize")
async def equalize_histogram(req: ImageRequest):
    img = decode_image(req.image)
    if len(img.shape) == 2:
        eq = cv2.equalizeHist(img)
    else:
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        ycrcb[:, :, 0] = cv2.equalizeHist(ycrcb[:, :, 0])
        eq = cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)
    before_hist = histogram_to_base64(img)
    after_hist = histogram_to_base64(eq)
    return {"result": encode_image(eq), "before_histogram": before_hist, "after_histogram": after_hist}


@app.post("/api/histogram/stretch")
async def contrast_stretch(req: ImageRequest):
    img = decode_image(req.image)
    if len(img.shape) == 3:
        img_float = img.astype(np.float32)
        for i in range(3):
            ch = img_float[:, :, i]
            min_val, max_val = ch.min(), ch.max()
            if max_val > min_val:
                img_float[:, :, i] = (ch - min_val) / (max_val - min_val) * 255
        result = img_float.astype(np.uint8)
    else:
        min_val, max_val = img.min(), img.max()
        result = ((img.astype(np.float32) - min_val) / (max_val - min_val) * 255).astype(np.uint8)
    return {"result": encode_image(result)}


# ── Noise & Filtering ─────────────────────────────────────────────────────────

@app.post("/api/filter/noise")
async def add_noise(req: ImageRequest):
    img = decode_image(req.image)
    noise_type = req.params.get("type", "gaussian")
    if noise_type == "gaussian":
        sigma = float(req.params.get("sigma", 25))
        noise = np.random.normal(0, sigma, img.shape).astype(np.float32)
        noisy = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    else:  # salt & pepper
        amount = float(req.params.get("amount", 0.05))
        noisy = img.copy()
        num_salt = int(amount * img.size * 0.5)
        coords = [np.random.randint(0, ax, num_salt) for ax in img.shape[:2]]
        noisy[coords[0], coords[1]] = 255
        coords = [np.random.randint(0, ax, num_salt) for ax in img.shape[:2]]
        noisy[coords[0], coords[1]] = 0
    return {"result": encode_image(noisy)}


@app.post("/api/filter/mean")
async def mean_filter(req: ImageRequest):
    img = decode_image(req.image)
    ksize = int(req.params.get("kernel", 5))
    if ksize % 2 == 0:
        ksize += 1
    result = cv2.blur(img, (ksize, ksize))
    return {"result": encode_image(result)}


@app.post("/api/filter/median")
async def median_filter(req: ImageRequest):
    img = decode_image(req.image)
    ksize = int(req.params.get("kernel", 5))
    if ksize % 2 == 0:
        ksize += 1
    result = cv2.medianBlur(img, ksize)
    return {"result": encode_image(result)}


@app.post("/api/filter/gaussian")
async def gaussian_filter(req: ImageRequest):
    img = decode_image(req.image)
    ksize = int(req.params.get("kernel", 5))
    if ksize % 2 == 0:
        ksize += 1
    sigma = float(req.params.get("sigma", 0))
    result = cv2.GaussianBlur(img, (ksize, ksize), sigma)
    return {"result": encode_image(result)}


# ── Edge Detection ────────────────────────────────────────────────────────────

@app.post("/api/edge/sobel")
async def sobel_edge(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ksize = int(req.params.get("ksize", 3))
    sx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=ksize)
    sy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=ksize)
    magnitude = np.sqrt(sx**2 + sy**2)
    result = np.uint8(np.clip(magnitude, 0, 255))
    return {"result": encode_image(result)}


@app.post("/api/edge/laplacian")
async def laplacian_edge(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    result = np.uint8(np.clip(np.abs(lap), 0, 255))
    return {"result": encode_image(result)}


@app.post("/api/edge/canny")
async def canny_edge(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    t1 = int(req.params.get("threshold1", 100))
    t2 = int(req.params.get("threshold2", 200))
    result = cv2.Canny(gray, t1, t2)
    return {"result": encode_image(result)}


@app.post("/api/edge/compare")
async def compare_edges(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    sobel = np.uint8(np.clip(np.sqrt(sx**2 + sy**2), 0, 255))
    lap = np.uint8(np.clip(np.abs(cv2.Laplacian(gray, cv2.CV_64F)), 0, 255))
    canny = cv2.Canny(gray, 100, 200)
    return {
        "sobel": encode_image(sobel),
        "laplacian": encode_image(lap),
        "canny": encode_image(canny),
    }


# ── Thresholding ──────────────────────────────────────────────────────────────

@app.post("/api/threshold/binary")
async def binary_threshold(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = int(req.params.get("threshold", 127))
    _, result = cv2.threshold(gray, thresh, 255, cv2.THRESH_BINARY)
    return {"result": encode_image(result)}


@app.post("/api/threshold/adaptive")
async def adaptive_threshold(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    block = int(req.params.get("block_size", 11))
    if block % 2 == 0:
        block += 1
    c = int(req.params.get("C", 2))
    method = cv2.ADAPTIVE_THRESH_GAUSSIAN_C if req.params.get("method", "gaussian") == "gaussian" else cv2.ADAPTIVE_THRESH_MEAN_C
    result = cv2.adaptiveThreshold(gray, 255, method, cv2.THRESH_BINARY, block, c)
    return {"result": encode_image(result)}


@app.post("/api/threshold/otsu")
async def otsu_threshold(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh_val, result = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return {"result": encode_image(result), "threshold_value": float(thresh_val)}


# ── Morphological ─────────────────────────────────────────────────────────────

@app.post("/api/morphology/{operation}")
async def morphological(operation: str, req: ImageRequest):
    img = decode_image(req.image)
    ksize = int(req.params.get("kernel", 5))
    shape_map = {"rect": cv2.MORPH_RECT, "ellipse": cv2.MORPH_ELLIPSE, "cross": cv2.MORPH_CROSS}
    shape = shape_map.get(req.params.get("shape", "rect"), cv2.MORPH_RECT)
    kernel = cv2.getStructuringElement(shape, (ksize, ksize))
    ops = {
        "erosion": cv2.MORPH_ERODE,
        "dilation": cv2.MORPH_DILATE,
        "opening": cv2.MORPH_OPEN,
        "closing": cv2.MORPH_CLOSE,
    }
    if operation not in ops:
        raise HTTPException(status_code=400, detail="Unknown morphological operation")
    result = cv2.morphologyEx(img, ops[operation], kernel) if operation in ["opening", "closing"] else (
        cv2.erode(img, kernel) if operation == "erosion" else cv2.dilate(img, kernel)
    )
    return {"result": encode_image(result)}


# ── Segmentation ──────────────────────────────────────────────────────────────

@app.post("/api/segment/threshold")
async def threshold_segment(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    colored = cv2.applyColorMap(binary, cv2.COLORMAP_JET)
    return {"result": encode_image(colored), "mask": encode_image(binary)}


@app.post("/api/segment/kmeans")
async def kmeans_segment(req: ImageRequest):
    img = decode_image(req.image)
    k = int(req.params.get("k", 3))
    pixels = img.reshape((-1, 3)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    centers = np.uint8(centers)
    result = centers[labels.flatten()].reshape(img.shape)
    return {"result": encode_image(result)}


# ── Feature Extraction ────────────────────────────────────────────────────────

@app.post("/api/features/contours")
async def detect_contours(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    result = img.copy()
    cv2.drawContours(result, contours, -1, (0, 255, 0), 2)
    return {"result": encode_image(result), "count": len(contours)}


@app.post("/api/features/shapes")
async def detect_shapes(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    result = img.copy()
    shapes = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 500:
            continue
        approx = cv2.approxPolyDP(cnt, 0.04 * cv2.arcLength(cnt, True), True)
        x, y, w, h = cv2.boundingRect(cnt)
        n = len(approx)
        if n == 3:
            shape = "Triangle"
            color = (0, 255, 255)
        elif n == 4:
            ar = w / float(h)
            shape = "Square" if 0.95 <= ar <= 1.05 else "Rectangle"
            color = (255, 128, 0)
        elif n >= 8:
            shape = "Circle"
            color = (0, 0, 255)
        else:
            shape = f"Polygon({n})"
            color = (128, 0, 255)
        cv2.drawContours(result, [approx], -1, color, 2)
        cv2.rectangle(result, (x, y), (x+w, y+h), (0, 255, 0), 1)
        cv2.putText(result, shape, (x, y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        shapes.append({"shape": shape, "area": int(area), "x": x, "y": y, "w": w, "h": h})
    return {"result": encode_image(result), "shapes": shapes}


@app.post("/api/features/bounding-boxes")
async def bounding_boxes(req: ImageRequest):
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    result = img.copy()
    boxes = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 300:
            continue
        x, y, w, h = cv2.boundingRect(cnt)
        cv2.rectangle(result, (x, y), (x+w, y+h), (0, 200, 255), 2)
        boxes.append({"x": x, "y": y, "w": w, "h": h, "area": int(area)})
    return {"result": encode_image(result), "boxes": boxes, "count": len(boxes)}


@app.get("/api/health")
async def health():
    return {"status": "ok", "opencv_version": cv2.__version__}
