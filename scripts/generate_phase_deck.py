"""EYAY Phase Deck Generator

Generates branded 16:9 PDF presentation for a workflow phase.

Usage:
  python scripts/generate_phase_deck.py --phase build --service mvp --output deck.pdf
  python scripts/generate_phase_deck.py --phase idea --service site --project "Client X Website" --output discovery.pdf
"""

from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import argparse
import json
from datetime import date

# 16:9 dimensions (1920x1080 scaled to inches at 96 DPI)
PAGE_WIDTH = 13.33 * inch
PAGE_HEIGHT = 7.5 * inch
PAGESIZE = (PAGE_WIDTH, PAGE_HEIGHT)

# EYAY Brand Colors — Light Theme (default for client decks)
COLORS_LIGHT = {
    "bg": HexColor("#FFFFFF"),
    "surface": HexColor("#F5F5F5"),
    "border": HexColor("#D4D4D4"),
    "text": HexColor("#0A0A0A"),
    "text_sub": HexColor("#737373"),
    "text_muted": Color(0, 0, 0, alpha=0.6),
    "brand": HexColor("#0000FF"),
    "accent_red": HexColor("#EF4444"),
}

# EYAY Brand Colors — Dark Theme (alternative)
COLORS_DARK = {
    "bg": HexColor("#020617"),
    "surface": HexColor("#111827"),
    "border": HexColor("#374151"),
    "text": HexColor("#F9FAFB"),
    "text_sub": HexColor("#9CA3AF"),
    "text_muted": Color(1, 1, 1, alpha=0.6),
    "brand": HexColor("#0000FF"),
    "accent_red": HexColor("#EF4444"),
}

# Default to light theme for client-facing decks
COLORS = COLORS_LIGHT

PHASE_COLORS = {
    "idea": HexColor("#C8F060"),
    "prd": HexColor("#60C8F0"),
    "build": HexColor("#F060C8"),
    "qa": HexColor("#F0A060"),
    "close": HexColor("#A060F0"),
}

PHASE_LABELS = {
    "idea": "01 Discover",
    "prd": "02 Define",
    "build": "03 Build",
    "qa": "04 Validate",
    "close": "05 Ship & Close",
}

PHASE_NEXT = {
    "idea": "Define",
    "prd": "Build",
    "build": "Validate",
    "qa": "Ship & Close",
    "close": None,
}

SERVICE_LABELS = {
    "site": "Premium Site",
    "tool": "Internal Tool",
    "mvp": "Full MVP",
    "ai": "AI Feature",
}

# Margins
MARGIN = 0.6 * inch


def draw_background(c: canvas.Canvas) -> None:
    """Fill page with background."""
    c.setFillColor(COLORS["bg"])
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)


def draw_accent_line(c: canvas.Canvas, color=None, y=None) -> None:
    """Draw brand-colored accent line at top."""
    if y is None:
        y = PAGE_HEIGHT - 3
    if color is None:
        color = COLORS["brand"]
    c.setStrokeColor(color)
    c.setLineWidth(3)
    c.line(0, y, PAGE_WIDTH, y)


def draw_card(c: canvas.Canvas, x, y, width, height) -> None:
    """Draw a surface card with subtle border."""
    c.setFillColor(COLORS["surface"])
    c.setStrokeColor(COLORS["border"])
    c.setLineWidth(1)
    c.roundRect(x, y, width, height, 6, fill=1, stroke=1)


def draw_eyay_wordmark(c: canvas.Canvas, x, y, with_underline: bool = True) -> None:
    """Draw EYAY wordmark with optional red underline."""
    c.setFillColor(COLORS["text"])
    c.setFont("Courier", 11)
    c.drawString(x, y, "EYAY")
    if with_underline:
        # Red underline accent
        c.setStrokeColor(COLORS.get("accent_red", HexColor("#EF4444")))
        c.setLineWidth(2)
        text_width = c.stringWidth("EYAY", "Courier", 11)
        c.line(x, y - 3, x + text_width, y - 3)


def draw_title_slide(
    c: canvas.Canvas, phase_id: str, service_id: str, project_name: str | None = None
) -> None:
    """Slide 1: Title."""
    draw_background(c)
    draw_accent_line(c, COLORS["brand"])

    # Phase name - large, semi-bold, tight tracking
    c.setFillColor(COLORS["text"])
    c.setFont("Helvetica-Bold", 44)
    c.drawString(MARGIN, PAGE_HEIGHT - 2.5 * inch, PHASE_LABELS[phase_id])

    # Service type
    c.setFillColor(COLORS["text_sub"])
    c.setFont("Helvetica", 18)
    c.drawString(MARGIN, PAGE_HEIGHT - 3.2 * inch, SERVICE_LABELS[service_id])

    # Project name if provided
    if project_name:
        c.setFillColor(COLORS["text"])
        c.setFont("Helvetica", 24)
        c.drawString(MARGIN, PAGE_HEIGHT - 4.2 * inch, project_name)

    # EYAY wordmark bottom-left with red underline
    draw_eyay_wordmark(c, MARGIN, MARGIN + 0.2 * inch)

    # Date bottom-right in mono, muted
    c.setFillColor(COLORS["text_muted"])
    c.setFont("Courier", 10)
    c.drawRightString(
        PAGE_WIDTH - MARGIN,
        MARGIN + 0.2 * inch,
        date.today().strftime("%B %Y"),
    )

    c.showPage()


def draw_overview_slide(c: canvas.Canvas, phase_id: str, content: dict) -> None:
    """Slide 2: Phase Overview."""
    draw_background(c)
    draw_accent_line(c, COLORS["brand"])

    # Title - mono, uppercase
    c.setFillColor(COLORS["text_sub"])
    c.setFont("Courier", 10)
    c.drawString(MARGIN, PAGE_HEIGHT - MARGIN - 14, "PHASE OVERVIEW")

    # Two columns
    col_width = (PAGE_WIDTH - 3 * MARGIN) / 2
    left_x = MARGIN
    right_x = MARGIN + col_width + MARGIN

    # Input card
    draw_card(c, left_x, PAGE_HEIGHT - 3.5 * inch, col_width, 1.8 * inch)
    c.setFillColor(COLORS["text_muted"])
    c.setFont("Courier", 9)
    c.drawString(left_x + 0.2 * inch, PAGE_HEIGHT - 1.9 * inch, "INPUT")

    c.setFillColor(COLORS["text"])
    c.setFont("Helvetica", 13)
    draw_wrapped_text(
        c,
        content.get("input", ""),
        left_x + 0.2 * inch,
        PAGE_HEIGHT - 2.3 * inch,
        col_width - 0.4 * inch,
        13,
    )

    # Output card
    draw_card(c, right_x, PAGE_HEIGHT - 3.5 * inch, col_width, 1.8 * inch)
    c.setFillColor(COLORS["text_muted"])
    c.setFont("Courier", 9)
    c.drawString(right_x + 0.2 * inch, PAGE_HEIGHT - 1.9 * inch, "OUTPUT")

    c.setFillColor(COLORS["text"])
    c.setFont("Helvetica", 13)
    draw_wrapped_text(
        c,
        content.get("output", ""),
        right_x + 0.2 * inch,
        PAGE_HEIGHT - 2.3 * inch,
        col_width - 0.4 * inch,
        13,
    )

    # Gate section at bottom
    gate_y = 2.2 * inch
    c.setFillColor(COLORS["brand"])
    c.setFont("Courier", 10)
    c.drawString(MARGIN, gate_y, "✓ GATE")

    c.setFillColor(COLORS["text_sub"])
    c.setFont("Helvetica", 12)
    draw_wrapped_text(
        c,
        content.get("gate", ""),
        MARGIN,
        gate_y - 0.4 * inch,
        PAGE_WIDTH - 2 * MARGIN,
        12,
    )

    c.showPage()


def draw_mistakes_slide(
    c: canvas.Canvas, phase_id: str, mistakes: list[str] | None
) -> None:
    """Slide 3: Common Mistakes."""
    draw_background(c)
    draw_accent_line(c, COLORS["brand"])

    # Title - mono, uppercase
    c.setFillColor(COLORS["text_sub"])
    c.setFont("Courier", 10)
    c.drawString(MARGIN, PAGE_HEIGHT - MARGIN - 14, "AVOID THESE PITFALLS")

    # Mistakes list
    y = PAGE_HEIGHT - 1.8 * inch

    for mistake in (mistakes or [])[:4]:
        # X marker in accent red
        c.setFillColor(COLORS.get("accent_red", HexColor("#EF4444")))
        c.setFont("Courier", 14)
        c.drawString(MARGIN, y, "✕")

        # Mistake text
        c.setFillColor(COLORS["text"])
        c.setFont("Helvetica", 13)
        draw_wrapped_text(
            c,
            mistake,
            MARGIN + 0.4 * inch,
            y,
            PAGE_WIDTH - 2.5 * MARGIN,
            13,
        )

        y -= 1.1 * inch

    c.showPage()


def draw_prompts_slide(
    c: canvas.Canvas, phase_id: str, prompts: list[dict], slide_num: int
) -> None:
    """Slide 4-5: Key Prompts."""
    draw_background(c)
    draw_accent_line(c, COLORS["brand"])

    # Title - mono, uppercase
    c.setFillColor(COLORS["text_sub"])
    c.setFont("Courier", 10)
    c.drawString(
        MARGIN,
        PAGE_HEIGHT - MARGIN - 14,
        f"KEY PROMPTS ({slide_num})",
    )

    # Prompt cards (2-3 per slide)
    y = PAGE_HEIGHT - 1.5 * inch
    card_height = 1.5 * inch

    for prompt in prompts[:3]:
        # Card
        draw_card(
            c,
            MARGIN,
            y - card_height + 0.2 * inch,
            PAGE_WIDTH - 2 * MARGIN,
            card_height,
        )

        # Prompt title - mono, uppercase
        c.setFillColor(COLORS["text"])
        c.setFont("Courier", 11)
        c.drawString(
            MARGIN + 0.3 * inch,
            y - 0.1 * inch,
            prompt.get("title", "Untitled").upper(),
        )

        # Tool chip
        tool = prompt.get("tool", "chat")
        chip_text = "CLAUDE CHAT" if tool == "chat" else "CLAUDE CODE"
        draw_chip(c, MARGIN + 0.3 * inch, y - 0.45 * inch, chip_text)

        # Agentic chip
        if prompt.get("agentic"):
            draw_chip(c, MARGIN + 1.8 * inch, y - 0.45 * inch, "⟳ SELF-VERIFY")

        # Preview text (first ~2 lines)
        content = prompt.get("content", "")
        preview = (content[:100] + "...") if len(content) > 100 else content
        c.setFillColor(COLORS["text_sub"])
        c.setFont("Helvetica", 11)
        draw_wrapped_text(
            c,
            preview,
            MARGIN + 0.3 * inch,
            y - 0.75 * inch,
            PAGE_WIDTH - 3 * MARGIN,
            11,
            max_lines=2,
        )

        y -= card_height + 0.15 * inch

    c.showPage()


def draw_chip(c: canvas.Canvas, x, y, text: str) -> None:
    """Draw a small mono chip/tag."""
    c.setFont("Courier", 9)
    text_width = c.stringWidth(text, "Courier", 9)
    padding = 6

    # Chip background (transparent with border)
    c.setStrokeColor(COLORS["border"])
    c.setLineWidth(1)
    c.roundRect(
        x - padding,
        y - 4,
        text_width + padding * 2,
        14,
        3,
        fill=0,
        stroke=1,
    )

    # Chip text
    c.setFillColor(COLORS["text_sub"])
    c.drawString(x, y, text)


def draw_gate_slide(
    c: canvas.Canvas, phase_id: str, gate_items: list[str], next_phase: str | None
) -> None:
    """Slide 6: Decision Gate Checklist."""
    draw_background(c)
    draw_accent_line(c, COLORS["brand"])

    # Title - brand blue
    c.setFillColor(COLORS["brand"])
    c.setFont("Helvetica-Bold", 20)
    next_label = next_phase or "Completion"
    c.drawString(
        MARGIN,
        PAGE_HEIGHT - MARGIN - 24,
        f"Ready for {next_label}?",
    )

    # Progress bar (empty track)
    bar_y = PAGE_HEIGHT - 1.3 * inch
    c.setStrokeColor(COLORS["border"])
    c.setLineWidth(2)
    c.line(MARGIN, bar_y, PAGE_WIDTH - MARGIN, bar_y)

    # Checklist
    y = PAGE_HEIGHT - 1.9 * inch

    for item in gate_items[:6]:
        # Empty circle
        c.setStrokeColor(COLORS["border"])
        c.setLineWidth(1.5)
        c.circle(MARGIN + 8, y + 4, 7, fill=0, stroke=1)

        # Item text
        c.setFillColor(COLORS["text"])
        c.setFont("Helvetica", 13)
        draw_wrapped_text(
            c,
            item,
            MARGIN + 0.5 * inch,
            y,
            PAGE_WIDTH - 2.5 * MARGIN,
            13,
        )

        y -= 0.55 * inch

    # Note at bottom
    c.setFillColor(COLORS["text_muted"])
    c.setFont("Courier", 9)
    c.drawString(
        MARGIN,
        MARGIN + 0.4 * inch,
        "Complete all items before proceeding",
    )

    c.showPage()


def draw_closing_slide(
    c: canvas.Canvas, phase_id: str, next_phase: str | None
) -> None:
    """Slide 7: Closing."""
    draw_background(c)

    # Centered content
    center_y = PAGE_HEIGHT / 2

    if next_phase:
        c.setFillColor(COLORS["text_sub"])
        c.setFont("Helvetica", 18)
        c.drawCentredString(
            PAGE_WIDTH / 2,
            center_y + 0.6 * inch,
            "Phase complete.",
        )

        c.setFillColor(COLORS["brand"])
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(
            PAGE_WIDTH / 2,
            center_y,
            f"Next: {next_phase}",
        )
    else:
        c.setFillColor(COLORS["text"])
        c.setFont("Helvetica-Bold", 28)
        c.drawCentredString(
            PAGE_WIDTH / 2,
            center_y,
            "Project complete.",
        )

    # EYAY wordmark centered with red underline
    wordmark_x = PAGE_WIDTH / 2 - 20
    draw_eyay_wordmark(c, wordmark_x, MARGIN + 0.8 * inch)

    # URL
    c.setFillColor(COLORS["text_muted"])
    c.setFont("Courier", 10)
    c.drawCentredString(
        PAGE_WIDTH / 2,
        MARGIN + 0.3 * inch,
        "eyay.studio",
    )

    c.showPage()


def draw_wrapped_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    max_width: float,
    font_size: int,
    max_lines: int | None = None,
) -> None:
    """Draw text with word wrapping."""
    words = text.split()
    lines: list[str] = []
    current_line: list[str] = []

    for word in words:
        test_line = " ".join(current_line + [word])
        width = c.stringWidth(test_line, c._fontname, font_size)

        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]

    if current_line:
        lines.append(" ".join(current_line))

    if max_lines:
        lines = lines[:max_lines]

    for i, line in enumerate(lines):
        c.drawString(x, y - (i * font_size * 1.4), line)


def generate_deck(
    phase_id: str,
    service_id: str,
    output_path: str,
    project_name: str | None = None,
    content_data: dict | None = None,
    dark_mode: bool = False,
) -> str:
    """Generate the full PDF deck."""
    global COLORS

    # Set theme
    COLORS = COLORS_DARK if dark_mode else COLORS_LIGHT

    # Register fonts - use system fonts as per EYAY guidelines
    # Sans: system-ui equivalent (Helvetica as fallback)
    # Mono: monospace
    try:
        pdfmetrics.registerFont(TTFont("Sans", "Helvetica"))
        pdfmetrics.registerFont(TTFont("Sans-Bold", "Helvetica-Bold"))
        pdfmetrics.registerFont(TTFont("Mono", "Courier"))
    except Exception:
        # Fallback - reportlab has these built in
        pass

    # Get content for this phase/service
    if content_data is None:
        content = {}
    else:
        # Allow either { phaseId: { serviceId: ... } } or { CONTENT: { ... } }
        root = content_data.get("CONTENT", content_data)
        content = root.get(phase_id, {}).get(service_id, {})

    # Create PDF
    c = canvas.Canvas(output_path, pagesize=PAGESIZE)

    # Generate slides
    draw_title_slide(c, phase_id, service_id, project_name)
    draw_overview_slide(c, phase_id, content)
    draw_mistakes_slide(c, phase_id, content.get("mistakes", []))

    # Prompts (split across 2 slides)
    prompts: list[dict] = content.get("prompts", [])
    if not prompts and content.get("subs"):
        # Flatten sub-phase prompts
        for sub in content.get("subs", []):
            prompts.extend(sub.get("prompts", []))

    # Always create two prompt slides to keep 7 total
    first_prompts = prompts[:3]
    second_prompts = prompts[3:6]
    draw_prompts_slide(c, phase_id, first_prompts, 1)
    draw_prompts_slide(c, phase_id, second_prompts, 2)

    # Gate checklist - currently generic; can be replaced with gate data
    gate_items = [
        "Problem statement is one sentence",
        "Primary user named with specific context",
        "Core loop defined: trigger → action → output → return",
        "V1 scope written with explicit 'out of scope' list",
    ]

    next_phase = PHASE_NEXT.get(phase_id)
    draw_gate_slide(c, phase_id, gate_items, next_phase)
    draw_closing_slide(c, phase_id, next_phase)

    c.save()
    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate EYAY phase deck PDF")
    parser.add_argument(
        "--phase",
        required=True,
        choices=["idea", "prd", "build", "qa", "close"],
    )
    parser.add_argument(
        "--service",
        required=True,
        choices=["site", "tool", "mvp", "ai"],
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Output PDF path",
    )
    parser.add_argument("--project", help="Optional project name")
    parser.add_argument(
        "--content",
        help="Path to content JSON file",
    )
    parser.add_argument(
        "--dark",
        action="store_true",
        help="Use dark theme (default: light)",
    )

    args = parser.parse_args()

    content_data = None
    if args.content:
        with open(args.content) as f:
            content_data = json.load(f)

    result = generate_deck(
        args.phase,
        args.service,
        args.output,
        args.project,
        content_data,
        args.dark,
    )
    print(f"Generated: {result}")

