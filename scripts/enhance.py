"""Nivel A de mejora técnica de fotos (photos:build). Solo técnica: reduce ruido leve, balancea exposición y color.
No quita ni agrega nada, no reemplaza cielos, no retoca manchas. Se ejecuta con `python -I`.

  enhance.py analyze  entrada.png
      imprime JSON: ruido estimado (sigma), luma mediana y razones de color (R/G, B/G) sobre tonos medios.
  enhance.py apply    entrada.png salida.png  h=2.0  ev=0.1  wb=1.0,1.0,0.98  maxw=2000
      reduce ruido (h = fuerza, 0 = no), aplica ganancia de exposición (EV, en luz lineal) y de balance (R,G,B),
      y achica a maxw de ancho si el original es más ancho. Imprime JSON con lo aplicado.
"""
import json
import sys

import cv2
import numpy as np


def srgb_to_lin(a):
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(a):
    a = np.clip(a, 0, 1)
    return np.where(a <= 0.0031308, a * 12.92, 1.055 * a ** (1 / 2.4) - 0.055)


def load(path):
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"no se pudo leer {path}")
    return img  # BGR uint8


def noise_sigma(gray):
    """Estimador de Immerkaer (1996): ruido gaussiano sobre una imagen de grises, robusto a los bordes."""
    h, w = gray.shape
    k = np.array([[1, -2, 1], [-2, 4, -2], [1, -2, 1]], dtype=np.float32)
    conv = cv2.filter2D(gray.astype(np.float32), -1, k)[1:-1, 1:-1]
    return float(np.sqrt(np.pi / 2) * np.abs(conv).sum() / (6 * (w - 2) * (h - 2)))


def analyze(path):
    img = load(path)
    h, w = img.shape[:2]
    s = 900 / max(w, h)
    small = cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA) if s < 1 else img
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    # El ruido se mide a escala completa sobre un recorte central (la reducción a 900 px lo promedia).
    cy, cx = h // 2, w // 2
    half = min(600, h // 2, w // 2)
    sig = noise_sigma(cv2.cvtColor(img[cy - half : cy + half, cx - half : cx + half], cv2.COLOR_BGR2GRAY))
    f = small[..., ::-1].astype(np.float32) / 255
    lin = srgb_to_lin(f)
    luma = 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]
    mid = (gray > 40) & (gray < 215)  # tonos medios: sin negros tapados ni luces quemadas
    if mid.sum() < 100:
        mid = np.ones_like(mid)
    r, g, b = (lin[..., i][mid].mean() for i in range(3))
    return {"sigma": round(sig, 2), "lumaMediana": round(float(np.median(luma)), 5), "rg": round(float(r / g), 4), "bg": round(float(b / g), 4)}


def apply(src, dst, h, ev, wb, maxw):
    img = load(src)
    H, W = img.shape[:2]
    if W > maxw:
        s = maxw / W
        img = cv2.resize(img, (maxw, round(H * s)), interpolation=cv2.INTER_AREA)
    if h > 0:
        img = cv2.fastNlMeansDenoisingColored(img, None, h, h, 5, 15)
    a = srgb_to_lin(img[..., ::-1].astype(np.float32) / 255)
    gain = (2.0**ev) * np.array(wb, dtype=np.float32)
    a = lin_to_srgb(a * gain)
    out = np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8)[..., ::-1]
    cv2.imwrite(dst, out, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    return {"h": h, "ev": ev, "wb": wb, "ancho": out.shape[1], "alto": out.shape[0], "escala": round(out.shape[1] / W, 4)}


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "analyze":
        print(json.dumps(analyze(sys.argv[2])))
    elif cmd == "apply":
        kv = dict(a.split("=", 1) for a in sys.argv[4:])
        wb = [float(x) for x in kv.get("wb", "1,1,1").split(",")]
        print(json.dumps(apply(sys.argv[2], sys.argv[3], float(kv.get("h", 0)), float(kv.get("ev", 0)), wb, int(kv.get("maxw", 2000)))))
