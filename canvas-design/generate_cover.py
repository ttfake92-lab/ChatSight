#!/usr/bin/env python3
"""
WeChat Cover Generator - Information Cascade
AI Group Chat Summary Tool Cover
"""

from PIL import Image, ImageDraw, ImageFont
import math
import random

random.seed(42)

WIDTH = 900
HEIGHT = 383

def create_wechat_cover():
    img = Image.new('RGB', (WIDTH, HEIGHT), '#0a1628')
    draw = ImageDraw.Draw(img)

    left_zone = [(x, y) for x in range(0, 450) for y in range(0, HEIGHT)]
    
    for i in range(2800):
        x = random.randint(0, WIDTH - 1)
        y = random.randint(0, HEIGHT - 1)
        length = random.randint(15, 80)
        opacity = random.randint(60, 180)
        angle = random.uniform(-0.3, 0.3)
        
        end_x = x + length * math.cos(angle)
        end_y = y + length * math.sin(angle)
        
        color_val = random.randint(80, 140)
        color = (color_val, color_val + 20, color_val + 60)
        
        draw.line([(x, y), (end_x, end_y)], fill=color, width=random.randint(1, 2))

    for _ in range(400):
        x = random.randint(50, 380)
        y = random.randint(30, HEIGHT - 30)
        radius = random.randint(2, 6)
        opacity = random.randint(100, 200)
        color = (30, 60, 90)
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)

    for i in range(15):
        y = 50 + i * 22
        x_start = random.randint(30, 60)
        x_end = random.randint(350, 420)
        alpha = 80 + i * 5
        draw.line([(x_start, y), (x_end, y)], fill=(45, 75, 115), width=3)
        draw.line([(x_start, y+3), (x_end - 40, y+3)], fill=(35, 65, 105), width=2)

    transition_x = 420
    for i in range(60):
        x = transition_x + i * 1.2
        alpha = int(40 + (i / 60) * 80)
        r = int(20 + (i / 60) * 30)
        g = int(60 + (i / 60) * 80)
        b = int(90 + (i / 60) * 50)
        draw.line([(x, 0), (x, HEIGHT)], fill=(r, g, b), width=1)

    clean_zone_start = 470
    for i in range(200):
        x = clean_zone_start + random.randint(0, 400)
        y = random.randint(0, HEIGHT - 1)
        length = random.randint(30, 100)
        angle = random.uniform(-0.1, 0.1)
        end_x = x + length * math.cos(angle)
        end_y = y + length * math.sin(angle)
        
        progress = (x - clean_zone_start) / 400
        r = int(200 + progress * 30)
        g = int(220 + progress * 25)
        b = int(240 - progress * 40)
        
        draw.line([(x, y), (end_x, end_y)], fill=(r, g, b), width=1)

    draw.rectangle([750, 80, 850, 300], fill=(15, 25, 45), outline=(200, 180, 140), width=2)

    inner_y = 120
    for i in range(8):
        bar_width = random.randint(60, 85)
        draw.rectangle([770, inner_y, 770 + bar_width, inner_y + 8], fill=(100, 130, 160))
        inner_y += 18

    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 28)
        font_medium = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 16)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 11)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()

    draw.rectangle([460, 140, 720, 200], fill=(25, 40, 65))
    draw.rectangle([462, 142, 718, 198], outline=(80, 120, 160), width=1)
    draw.text((480, 155), "AI SUMMARY", fill=(200, 180, 140), font=font_small)

    draw.text((480, 175), "群聊999+", fill=(220, 220, 240), font=font_medium)

    main_text_lines = [
        "不用再爬楼了",
        "我开源了一个", 
        "AI群聊摘要工具"
    ]
    
    try:
        font_main = ImageFont.truetype("/System/Library/Fonts/STHeiti Light.ttc", 22)
    except:
        font_main = font_medium
    
    y_pos = 220
    for line in main_text_lines:
        bbox = draw.textbbox((0, 0), line, font=font_main)
        text_width = bbox[2] - bbox[0]
        x_pos = 590 - text_width // 2
        draw.text((x_pos, y_pos), line, fill=(255, 255, 255), font=font_main)
        y_pos += 30

    for i in range(12):
        x = 40 + i * 70
        y = HEIGHT - 60
        dot_spacing = random.randint(8, 15)
        for j in range(5):
            draw.ellipse([x, y + j * dot_spacing, x + 3, y + j * dot_spacing + 3], fill=(40, 60, 90))

    for i in range(8):
        x = WIDTH - 60 + i * 8
        y = 50 + i * 35
        size = 30 - i * 2
        draw.arc([x, y, x + size, y + size], 0, 360, fill=(60, 90, 130), width=1)

    return img

if __name__ == "__main__":
    img = create_wechat_cover()
    output_path = "/Users/tangtao/Projects/ChatSight/canvas-design/wechat-cover.png"
    img.save(output_path, "PNG", quality=95)
    print(f"Cover saved to: {output_path}")
