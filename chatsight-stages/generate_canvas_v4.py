#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import math

# Canvas dimensions
WIDTH = 2400
HEIGHT = 1600

# Warm paper color palette
BG_COLOR = (250, 245, 237)  # Warm cream
PAPER_COLOR = (255, 252, 245)  # Light warm paper
SHADOW_COLOR = (220, 210, 195)  # Warm shadow
DIVIDER_COLOR = (210, 200, 180)  # Warm divider

PHASE_COLORS = [
    (59, 130, 246),   # Blue
    (245, 158, 11),   # Amber  
    (16, 185, 129),   # Emerald
    (139, 92, 246),   # Violet
]
PHASE_COLORS_LIGHT = [
    (219, 234, 254),  
    (255, 243, 220),  
    (209, 250, 229),  
    (237, 233, 254),  
]
TEXT_DARK = (60, 50, 40)     # Warm dark
TEXT_LIGHT = (255, 255, 255)
TEXT_MUTED = (130, 115, 100)  # Warm muted

def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception as e:
        print(f"Warning: Could not load {path}: {e}")
        return ImageFont.load_default()

def create_warm_canvas():
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Add subtle paper texture (dots pattern)
    for i in range(0, WIDTH, 40):
        for j in range(0, HEIGHT, 40):
            if (i // 40 + j // 40) % 4 == 0:
                draw.rectangle([i, j, i + 1, j + 1], fill=(245, 240, 230))
    
    # Load fonts - use Arial Unicode for Chinese
    font_en_bold = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/BigShoulders-Bold.ttf', 96)
    font_zh_title = load_font('/System/Library/Fonts/Supplemental/Arial Unicode.ttf', 88)
    font_zh_bold = load_font('/System/Library/Fonts/Supplemental/Arial Unicode.ttf', 38)
    font_zh_regular = load_font('/System/Library/Fonts/Supplemental/Arial Unicode.ttf', 22)
    font_en_heading = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf', 34)
    font_mono = load_font('/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/JetBrainsMono-Regular.ttf', 18)
    font_label = load_font('/System/Library/Fonts/Supplemental/Arial Unicode.ttf', 15)
    font_small = load_font('/System/Library/Fonts/Supplemental/Arial Unicode.ttf', 13)
    font_accent = load_font('/System/Library/Fonts/Supplemental/Arial Unicode.ttf', 28)
    
    # Header
    draw.text((WIDTH // 2, 100), "CHATSIGHT", fill=TEXT_MUTED, font=font_mono, anchor="mm")
    
    # Main title - warm dark
    draw.text((WIDTH // 2, 200), "产品发展路线图", fill=TEXT_DARK, font=font_zh_title, anchor="mm")
    
    # Subtitle
    draw.text((WIDTH // 2, 290), "四个阶段  ·  从 MVP 到高级功能", fill=TEXT_MUTED, font=font_zh_regular, anchor="mm")
    
    # Phase data
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
    
    # Layout
    card_width = 440
    card_height = 520
    gap = 48
    total_width = card_width * 4 + gap * 3
    start_x = (WIDTH - total_width) // 2
    start_y = 380
    
    # Draw phase cards
    for i, phase in enumerate(phases):
        x = start_x + i * (card_width + gap)
        
        # Warm shadow
        shadow_x = x + 12
        shadow_y = start_y + 12
        draw.rounded_rectangle(
            [shadow_x, shadow_y, shadow_x + card_width, shadow_y + card_height],
            radius=28,
            fill=SHADOW_COLOR
        )
        
        # Main card - warm white
        draw.rounded_rectangle(
            [x, start_y, x + card_width, start_y + card_height],
            radius=28,
            fill=PAPER_COLOR
        )
        
        # Top color band
        draw.rounded_rectangle(
            [x, start_y, x + card_width, start_y + 14],
            radius=14,
            fill=phase['color']
        )
        
        # Light background section
        draw.rounded_rectangle(
            [x + 24, start_y + 75, x + card_width - 24, start_y + 175],
            radius=16,
            fill=phase['light']
        )
        
        # Large phase number
        draw.text((x + card_width - 55, start_y + 115), phase['number'], 
                  fill=phase['color'], font=font_en_heading, anchor="mm")
        
        # Phase label
        draw.text((x + 40, start_y + 85), phase['phase'], 
                  fill=phase['color'], font=font_label)
        
        # Title
        draw.text((x + 40, start_y + 125), phase['title'], 
                  fill=TEXT_DARK, font=font_zh_bold)
        
        # Subtitle
        draw.text((x + 40, start_y + 170), phase['subtitle'], 
                  fill=TEXT_MUTED, font=font_small)
        
        # Divider - warm color
        draw.line([(x + 40, start_y + 220), (x + card_width - 40, start_y + 220)],
                  fill=DIVIDER_COLOR, width=2)
        
        # Features
        feature_y = start_y + 255
        for j, feature in enumerate(phase['features']):
            bullet_x = x + 48
            bullet_y = feature_y + 10
            draw.ellipse([bullet_x - 5, bullet_y - 5, bullet_x + 5, bullet_y + 5], 
                        fill=phase['color'])
            draw.text((bullet_x + 18, feature_y), feature, fill=TEXT_DARK, font=font_zh_regular)
            feature_y += 52
        
        # Bottom accent bar
        draw.rounded_rectangle(
            [x + 40, start_y + card_height - 85, x + card_width - 40, start_y + card_height - 48],
            radius=12,
            fill=phase['light']
        )
        draw.text((x + card_width // 2, start_y + card_height - 66), 
                  phase['accent'], fill=phase['color'], font=font_accent, anchor="mm")
    
    # Timeline - warm colors
    timeline_y = start_y + card_height + 75
    
    draw.line([(start_x + 100, timeline_y), 
               (start_x + total_width - 100, timeline_y)],
              fill=DIVIDER_COLOR, width=4)
    
    # Progress line
    draw.line([(start_x + 100, timeline_y), 
               (start_x + total_width - 100, timeline_y)],
              fill=PHASE_COLORS[0], width=4)
    
    # Phase nodes
    for i, phase in enumerate(phases):
        node_x = start_x + card_width // 2 + i * (card_width + gap)
        draw.ellipse([node_x - 16, timeline_y - 16, node_x + 16, timeline_y + 16],
                     fill=phase['color'])
        draw.ellipse([node_x - 6, timeline_y - 6, node_x + 6, timeline_y + 6],
                     fill=PAPER_COLOR)
    
    # Phase labels - warm colors
    label_y = timeline_y + 48
    for i, phase in enumerate(phases):
        x = start_x + card_width // 2 + i * (card_width + gap)
        draw.text((x, label_y), phase['phase'], 
                  fill=phase['color'], font=font_label, anchor="mm")
        draw.text((x, label_y + 28), phase['title'], 
                  fill=TEXT_DARK, font=font_zh_regular, anchor="mm")
    
    # Footer - warm
    draw.text((WIDTH // 2, 1370), "从核心功能到高级定制化的完整演进路径", 
              fill=TEXT_MUTED, font=font_zh_regular, anchor="mm")
    
    # Legend - warm
    legend_y = 1435
    legend_start_x = WIDTH // 2 - 600
    spacing = 300
    
    for i, phase in enumerate(phases):
        x = legend_start_x + i * spacing
        draw.ellipse([x, legend_y, x + 14, legend_y + 14], fill=phase['color'])
        draw.text((x + 24, legend_y + 5), phase['title'], 
                  fill=TEXT_DARK, font=font_label)
    
    return img

# Generate
img = create_warm_canvas()

# Enhance sharpness
enhancer = ImageEnhance.Sharpness(img)
img = enhancer.enhance(1.05)

# Save
output_path = "/Users/tangtao/Projects/ChatSight/chatsight-stages/chatsight-stages-warm.png"
img.save(output_path, "PNG", quality=95)
print(f"Warm canvas saved to: {output_path}")
print(f"Image size: {img.size}")
