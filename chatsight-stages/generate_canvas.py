#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Canvas dimensions
WIDTH = 1920
HEIGHT = 1080

# Color palette - Metabolist Evolution
BG_COLOR = (249, 250, 251)  # Light gray background
PHASE_COLORS = [
    (59, 130, 246),   # Blue - Phase 1
    (245, 158, 11),   # Amber - Phase 2  
    (16, 185, 129),   # Emerald - Phase 3
    (139, 92, 246),   # Violet - Phase 4
]
TEXT_DARK = (31, 41, 55)      # Dark gray
TEXT_LIGHT = (255, 255, 255)  # White
TEXT_MUTED = (107, 114, 128)  # Muted gray

# Fonts (using system fonts or bundled)
FONT_PATHS = {
    'title': '/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/BigShoulders-Bold.ttf',
    'heading': '/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf',
    'body': '/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf',
    'mono': '/Users/tangtao/.trae-cn/skills/canvas-design/canvas-fonts/JetBrainsMono-Regular.ttf',
}

def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def create_canvas():
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Load fonts
    font_title = load_font(FONT_PATHS['title'], 72)
    font_heading = load_font(FONT_PATHS['heading'], 32)
    font_body = load_font(FONT_PATHS['body'], 20)
    font_mono = load_font(FONT_PATHS['mono'], 16)
    font_label = load_font(FONT_PATHS['body'], 14)
    font_small = load_font(FONT_PATHS['body'], 12)
    
    # Header section
    draw.text((960, 80), "CHATSIGHT", fill=TEXT_MUTED, font=font_mono, anchor="mm")
    draw.text((960, 160), "产品发展路线图", fill=TEXT_DARK, font=font_title, anchor="mm")
    draw.text((960, 230), "四个阶段 · 从 MVP 到高级功能", fill=TEXT_MUTED, font=font_body, anchor="mm")
    
    # Phase data
    phases = [
        {
            'phase': "第一阶段",
            'title': "核心 MVP",
            'subtitle': "快速验证产品核心价值",
            'features': ["会话列表展示", "聊天记录查看", "AI 摘要生成"],
            'icon': "01",
            'color': PHASE_COLORS[0]
        },
        {
            'phase': "第二阶段",
            'title': "监控告警",
            'subtitle': "实现实时监控能力",
            'features': ["实时消息监控", "关键词告警", "桌面原生通知"],
            'icon': "02",
            'color': PHASE_COLORS[1]
        },
        {
            'phase': "第三阶段",
            'title': "数据分析",
            'subtitle': "提供数据驱动决策支持",
            'features': ["消息统计分析", "活跃度看板", "数据可视化"],
            'icon': "03",
            'color': PHASE_COLORS[2]
        },
        {
            'phase': "第四阶段",
            'title': "高级功能",
            'subtitle': "满足高阶用户定制化需求",
            'features': ["全文搜索", "FAQ 提取", "Skill 系统"],
            'icon': "04",
            'color': PHASE_COLORS[3]
        }
    ]
    
    # Draw phases
    card_width = 380
    card_height = 420
    spacing = 40
    total_width = card_width * 4 + spacing * 3
    start_x = (WIDTH - total_width) // 2
    start_y = 320
    
    for i, phase in enumerate(phases):
        x = start_x + i * (card_width + spacing)
        
        # Draw card shadow
        shadow_offset = 8
        draw.rounded_rectangle(
            [x + shadow_offset, start_y + shadow_offset, 
             x + card_width + shadow_offset, start_y + card_height + shadow_offset],
            radius=24,
            fill=(220, 225, 230)
        )
        
        # Draw card
        draw.rounded_rectangle(
            [x, start_y, x + card_width, start_y + card_height],
            radius=24,
            fill=(255, 255, 255)
        )
        
        # Draw top accent bar
        draw.rounded_rectangle(
            [x, start_y, x + card_width, start_y + 12],
            radius=12,
            fill=phase['color']
        )
        
        # Draw phase number
        draw.text((x + 30, start_y + 50), phase['icon'], fill=phase['color'], font=font_heading)
        
        # Draw phase label
        draw.text((x + 30, start_y + 95), phase['phase'], fill=TEXT_MUTED, font=font_label)
        
        # Draw title
        draw.text((x + 30, start_y + 120), phase['title'], fill=TEXT_DARK, font=font_heading)
        
        # Draw subtitle
        draw.text((x + 30, start_y + 160), phase['subtitle'], fill=TEXT_MUTED, font=font_small)
        
        # Draw divider
        draw.line([(x + 30, start_y + 195), (x + card_width - 30, start_y + 195)], 
                  fill=(229, 231, 235), width=1)
        
        # Draw features
        feature_y = start_y + 220
        for feature in phase['features']:
            # Draw bullet
            draw.ellipse([x + 35, feature_y + 6, x + 41, feature_y + 12], fill=phase['color'])
            # Draw feature text
            draw.text((x + 52, feature_y), feature, fill=TEXT_DARK, font=font_body)
            feature_y += 45
        
        # Draw bottom accent
        draw.rounded_rectangle(
            [x + card_width - 80, start_y + card_height - 50,
             x + card_width - 30, start_y + card_height - 30],
            radius=8,
            fill=phase['color']
        )
        draw.text((x + card_width - 65, start_y + card_height - 48), 
                  f"→", fill=TEXT_LIGHT, font=font_body)
    
    # Draw connecting line between phases
    line_y = start_y + card_height + 60
    for i in range(3):
        x1 = start_x + (i + 1) * card_width + i * spacing
        x2 = x1 + spacing
        draw.line([(x1, line_y), (x2, line_y)], fill=(209, 213, 219), width=3)
    
    # Draw footer
    draw.text((960, 880), "从核心功能到高级定制化的完整演进路径", 
              fill=TEXT_MUTED, font=font_body, anchor="mm")
    
    # Draw legend
    legend_y = 950
    for i, phase in enumerate(phases):
        x = 400 + i * 280
        # Draw color dot
        draw.ellipse([x, legend_y, x + 12, legend_y + 12], fill=phase['color'])
        # Draw label
        draw.text((x + 20, legend_y + 1), phase['title'], fill=TEXT_DARK, font=font_label)
    
    return img

# Generate and save
img = create_canvas()
output_path = "/Users/tangtao/Projects/ChatSight/chatsight-stages/chatsight-stages.png"
img.save(output_path, "PNG", quality=95)
print(f"Canvas saved to: {output_path}")
print(f"Image size: {img.size}")
