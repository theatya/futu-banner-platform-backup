import json
import os

from fontTools.ttLib import TTFont


ROOTS = [
    "D:\\\u5b57\u4f53\u5305\\\u82f1\u6587\u5b57\u4f53BR",
    "D:\\\u5b57\u4f53\u5305\\MiSans\\otf",
    "D:\\\u5b57\u4f53\u5305\\\u65b9\u6b63\u5170\u4ead-\u54c1\u724c\u8d44\u6e90\\\u65b9\u6b63\u5170\u4ead",
    "D:\\\u5b57\u4f53\u5305\\M_PLUS_1p",
    "D:\\\u5b57\u4f53\u5305\\Source Han Serif (2)\\Source Han Serif",
    "D:\\\u5b57\u4f53\u5305\\\u6c49\u4eea\u96c5\u9177\u9ed1",
]


def font_name(font: TTFont, name_ids: list[int]) -> str | None:
    for name_id in name_ids:
        for record in font["name"].names:
            if record.nameID == name_id:
                try:
                    return record.toUnicode()
                except Exception:
                    continue
    return None


rows = []
for root in ROOTS:
    for directory, _, files in os.walk(root):
        for filename in files:
            if not filename.lower().endswith((".otf", ".ttf")):
                continue
            path = os.path.join(directory, filename)
            try:
                font = TTFont(path, lazy=True)
                weight = getattr(font["OS/2"], "usWeightClass", None) if "OS/2" in font else None
                rows.append(
                    {
                        "path": path,
                        "file": filename,
                        "family": font_name(font, [16, 1]),
                        "style": font_name(font, [17, 2]),
                        "postscript": font_name(font, [6]),
                        "weight": weight,
                        "mb": round(os.path.getsize(path) / 1048576, 2),
                    }
                )
                font.close()
            except Exception as error:
                rows.append({"path": path, "file": filename, "error": str(error)})

print(json.dumps(rows, ensure_ascii=True, indent=2))
