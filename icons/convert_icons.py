#!/usr/bin/env python3
"""将 SVG 图标转换为 PNG 格式"""

import svglib.svg
from reportlab.graphics import renderPM
import sys

svg_file = sys.argv[1] if len(sys.argv) > 1 else "icon.svg"
sizes = [16, 48, 128]

print(f"转换 {svg_file} 为 PNG 格式...")

for size in sizes:
    output_file = f"icon{size}.png"
    try:
        # 使用 svglib 加载 SVG
        drawing = svglib.svg.svg2rlg(svg_file)
        
        # 调整大小
        drawing.width = size
        drawing.height = size
        
        # 渲染为 PNG
        renderPM.drawToFile(drawing, output_file, fmt="PNG")
        print(f"✅ 生成 {output_file}")
    except Exception as e:
        print(f"❌ 转换失败：{e}")
        print("尝试使用备用方案...")
        
        # 备用方案：创建简单的 PNG
        from PIL import Image, ImageDraw
        
        img = Image.new('RGB', (size, size), color=(0, 120, 212))
        draw = ImageDraw.Draw(img)
        
        # 绘制简单的箭头图标
        center = size // 2
        arrow_top = int(size * 0.19)
        arrow_bottom = int(size * 0.69)
        arrow_width = int(size * 0.19)
        
        # 竖线
        draw.line([(center, arrow_top), (center, arrow_bottom)], fill='white', width=max(2, size//16))
        # 左斜线
        draw.line([(center, arrow_bottom), (center - arrow_width, int(size * 0.54))], fill='white', width=max(2, size//16))
        # 右斜线
        draw.line([(center, arrow_bottom), (center + arrow_width, int(size * 0.54))], fill='white', width=max(2, size//16))
        # 顶部圆点
        dot_radius = max(2, size//16)
        draw.ellipse([center - dot_radius, int(size * 0.25) - dot_radius, 
                      center + dot_radius, int(size * 0.25) + dot_radius], fill='white')
        
        img.save(output_file)
        print(f"✅ 生成 {output_file} (备用方案)")

print("\n完成！")
