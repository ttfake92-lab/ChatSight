#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import math
import os

# Canvas dimensions
WIDTH = 2400
HEIGHT = 1600

# Color palette - refined Metabolist Evolution
BG_COLOR = (250, 250, 252)
PHASE_COLORS = [
    (59, 130, 246),   # Blue - Phase 1
    (245, 158, 11),   # Amber - Phase 2  
    (16, 185, 129),   # Emerald - Phase 3
    (139, 92, 246),   # Violet - Phase 4
]
PHASE_COLORS_LIGHT = [
    (219, 234, 254),  # Blue light
    (254, 243, 199),  # Amber light
    (209, 250, 229),  # Emerald light
    (237, 233, 254),  # Violet light
]
TEXT_DARK = (15, 23, 42)
TEXT_LIGHT = (255, 255, 255)
TEXT_MUTED = (100, 116, 139)

def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_gradient_card(draw, x, y, w, h, color, radius=24):
    """Draw a card with subtle gradient"""
    # Main card
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=(255, 255, 255))
    
    # Top color band with gradient effect
    band_height = 8
    for i in range(band_height):
        alpha = 1.0 - (i / band_height) * 0.3
        r = int(color[0] * alpha + 255 * (1 - alpha))
        g = int(color[1] * alpha + 255 * (1 - alpha))
        b = int(color[2] * alpha + 255 * (1 - alpha))
        draw.line([(x, y + i), (x + w, y + i)], fill=(r, g, b), width=1)
    
    # Side shadow
    for i in range(12):
        alpha = 0.03 - (i / 12) * 0.03
        shadow_color = (0, 0, 0)
        draw.line([(x + w + i, y + 12), (x + w + i, y + h - 12)], 
                  fill=shadow_color, width=1)
    for i in range(12):
        draw.line([(x + i, y + h + i), (x + w - 12, y + h + i)], 
                  fill=shadow_color, width=1)

def create_enhanced_canvas():
    # Create base image
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Add subtle grid pattern
    for i in range(0, WIDTH, 60):
        for j in range(0, HEIGHT, 60):
            if (i // 60 + j // 60) % 3 == 0:
                draw.rectangle([i, j, i + 2, j + 2], fill=(255, 255, 255))
    
    # Load fonts
    font_title = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/BigShoulders-Bold.ttf', 96)
    font_heading = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf', 36)
    font_body = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf', 22)
    font_mono = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/JetBrainsMono-Regular.ttf', 18)
    font_label = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf', 16)
    font_small = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf', 14)
    font_large = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/BricolageGrotesque-Bold.ttf', 120)
    
    # Header with architectural precision
    draw.text((WIDTH // 2, 100), "CHATSIGHT", fill=TEXT_MUTED, font=font_mono, anchor="mm")
    
    # Main title - architectural scale
    draw.text((WIDTH // 2, 200), "产品发展路线图", fill=TEXT_DARK, font=font_large, anchor="mm")
    
    # Subtitle
    draw.text((WIDTH // 2, 300), "四个阶段 · 从 MVP 到高级功能", fill=TEXT_MUTED, font=font_body, anchor="mm")
    
    # Phase data with refined details
    phases = [
        {
            'phase': "第一阶段",
            'title': "核心 MVP",
            'subtitle': "快速验证产品核心价值",
            'features': ["会话列表展示", "聊天记录查看", "AI 摘要生成"],
            'number': "01",
            'color': PHASE_COLORS[0],
            'light': PHASE_COLORS_LIGHT[0],
            'accent': "验证"
        },
        {
            'phase': "第二阶段",
            'title': "监控告警",
            'subtitle': "实现实时监控能力",
            'features': ["实时消息监控", "关键词告警", "桌面原生通知"],
            'number': "02",
            'color': PHASE_COLORS[1],
            'light': PHASE_COLORS_LIGHT[1],
            'accent': "响应"
        },
        {
            'phase': "第三阶段",
            'title': "数据分析",
            'subtitle': "提供数据驱动决策支持",
            'features': ["消息统计分析", "活跃度看板", "数据可视化"],
            'number': "03",
            'color': PHASE_COLORS[2],
            'light': PHASE_COLORS_LIGHT[2],
            'accent': "洞察"
        },
        {
            'phase': "第四阶段",
            'title': "高级功能",
            'subtitle': "满足高阶用户定制化需求",
            'features': ["全文搜索", "FAQ 提取", "Skill 系统"],
            'number': "04",
            'color': PHASE_COLORS[3],
            'light': PHASE_COLORS_LIGHT[3],
            'accent': "扩展"
        }
    ]
    
    # Layout calculations
    card_width = 440
    card_height = 520
    gap = 48
    total_width = card_width * 4 + gap * 3
    start_x = (WIDTH - total_width) // 2
    start_y = 400
    
    # Draw phase cards
    for i, phase in enumerate(phases):
        x = start_x + i * (card_width + gap)
        
        # Draw card background with shadow
        shadow_x = x + 16
        shadow_y = start_y + 16
        draw.rounded_rectangle(
            [shadow_x, shadow_y, shadow_x + card_width, shadow_y + card_height],
            radius=28,
            fill=(230, 232, 240)
        )
        
        # Main card
        draw_gradient_card(draw, x, start_y, card_width, card_height, phase['color'], 28)
        
        # Color accent band at top
        draw.rounded_rectangle(
            [x, start_y, x + card_width, start_y + 16],
            radius=16,
            fill=phase['color']
        )
        
        # Light background section
        draw.rounded_rectangle(
            [x + 24, start_y + 80, x + card_width - 24, start_y + 180],
            radius=16,
            fill=phase['light']
        )
        
        # Large phase number - architectural notation
        draw.text((x + card_width - 60, start_y + 120), phase['number'], 
                  fill=phase['color'], font=font_heading, anchor="mm")
        
        # Phase label
        draw.text((x + 40, start_y + 90), phase['phase'], 
                  fill=phase['color'], font=font_label)
        
        # Title - bold architectural
        draw.text((x + 40, start_y + 130), phase['title'], 
                  fill=TEXT_DARK, font=font_heading)
        
        # Subtitle
        draw.text((x + 40, start_y + 175), phase['subtitle'], 
                  fill=TEXT_MUTED, font=font_small)
        
        # Divider line
        draw.line([(x + 40, start_y + 230), (x + card_width - 40, start_y + 230)],
                  fill=(238, 242, 245), width=2)
        
        # Features with refined bullets
        feature_y = start_y + 265
        for j, feature in enumerate(phase['features']):
            # Circular bullet
            bullet_x = x + 48
            bullet_y = feature_y + 12
            draw.ellipse([bullet_x - 5, bullet_y - 5, bullet_x + 5, bullet_y + 5], 
                        fill=phase['color'])
            
            # Feature text
            draw.text((bullet_x + 20, feature_y), feature, fill=TEXT_DARK, font=font_body)
            feature_y += 55
        
        # Bottom accent bar with icon
        draw.rounded_rectangle(
            [x + 40, start_y + card_height - 90, x + card_width - 40, start_y + card_height - 50],
            radius=12,
            fill=phase['light']
        )
        
        # Accent text (Chinese character)
        draw.text((x + card_width // 2, start_y + card_height - 70), 
                  phase['accent'], fill=phase['color'], font=font_label, anchor="mm")
    
    # Draw connecting timeline
    timeline_y = start_y + card_height + 80
    
    # Timeline base line
    draw.line([(start_x + 100, timeline_y), 
               (start_x + total_width - 100, timeline_y)],
              fill=(200, 205, 215), width=4)
    
    # Timeline progress (complete)
    draw.line([(start_x + 100, timeline_y), 
               (start_x + total_width - 100, timeline_y)],
              fill=(59, 130, 246), width=4)
    
    # Phase nodes on timeline
    for i, phase in enumerate(phases):
        node_x = start_x + card_width // 2 + i * (card_width + gap)
        
        # Outer ring
        draw.ellipse([node_x - 16, timeline_y - 16, node_x + 16, timeline_y + 16],
                     fill=phase['color'])
        
        # Inner dot
        draw.ellipse([node_x - 6, timeline_y - 6, node_x + 6, timeline_y + 6],
                     fill=(255, 255, 255))
    
    # Phase labels below timeline
    label_y = timeline_y + 50
    for i, phase in enumerate(phases):
        x = start_x + card_width // 2 + i * (card_width + gap)
        draw.text((x, label_y), phase['phase'], 
                  fill=phase['color'], font=font_label, anchor="mm")
        draw.text((x, label_y + 30), phase['title'], 
                  fill=TEXT_DARK, font=font_body, anchor="mm")
    
    # Footer summary
    draw.text((WIDTH // 2, 1380), "从核心功能到高级定制化的完整演进路径", 
              fill=TEXT_MUTED, font=font_body, anchor="mm")
    
    # Legend with refined design
    legend_y = 1440
    legend_start_x = WIDTH // 2 - 600
    spacing = 300
    
    for i, phase in enumerate(phases):
        x = legend_start_x + i * spacing
        
        # Color indicator
        draw.ellipse([x, legend_y, x + 16, legend_y + 16], fill=phase['color'])
        
        # Label
        draw.text((x + 28, legend_y + 6), phase['title'], 
                  fill=TEXT_DARK, font=font_label)
    
    return img

# Generate enhanced canvas
img = create_enhanced_canvas()

# Apply subtle enhancements
enhancer = ImageEnhance.Sharpness(img)
img = enhancer.enhance(1.1)

# Save
output_path = "/Users/tangtao/Projects/ChatSight/chatsight-stages/chatsight-stages-v2.png"
img.save(output_path, "PNG", quality=95)
print(f"Enhanced canvas saved to: {output_path}")
print(f"Image size: {img.size}")
