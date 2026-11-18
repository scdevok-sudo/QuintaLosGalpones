"""HEIC a PNG sin perdida, con la rotacion aplicada y el perfil de color incrustado (sharp lo pasa a sRGB).
Uso: python -I scripts/heic-to-png.py entrada.heic salida.png   (requiere pillow-heif)"""
import sys
from PIL import Image, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()
im = Image.open(sys.argv[1])
icc = im.info.get("icc_profile")
im = ImageOps.exif_transpose(im).convert("RGB")
im.save(sys.argv[2], "PNG", icc_profile=icc, compress_level=1)
