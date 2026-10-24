#!/usr/bin/env python3
"""
Kayro AI Product Intern Assignment — PDF Submission Generator
Generates:
  1. Kayro_Part1_The_Puzzle_Solution.pdf
  2. Kayro_AI_Product_Intern_Documentation.pdf
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Palette
COLOR_FOREST = colors.HexColor("#1E3D2F")
COLOR_SAGE = colors.HexColor("#5E7E6B")
COLOR_TERRACOTTA = colors.HexColor("#C87A53")
COLOR_BG_LIGHT = colors.HexColor("#FBF9F4")
COLOR_SAGE_LIGHT = colors.HexColor("#EAF1ED")
COLOR_TEXT = colors.HexColor("#2B3A32")
COLOR_MUTED = colors.HexColor("#6B7C72")
COLOR_BORDER = colors.HexColor("#D8E0DA")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_MUTED)
        
        # Running header
        self.drawString(54, letter[1] - 36, "Kayro AI Product Intern Assignment · Shiva Kumar M")
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
        
        # Running footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_str)
        self.drawString(54, 36, "Confidential · Prepared for Kayro.io")
        self.line(54, 48, letter[0] - 54, 48)
        self.restoreState()

def build_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=COLOR_FOREST,
        spaceAfter=4,
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=COLOR_TERRACOTTA,
        spaceAfter=14,
    )
    
    h1_style = ParagraphStyle(
        "DocH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=COLOR_FOREST,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "DocH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=COLOR_SAGE,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_TEXT,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "DocBullet",
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4,
    )

    callout_style = ParagraphStyle(
        "DocCallout",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=COLOR_FOREST,
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "h1": h1_style,
        "h2": h2_style,
        "body": body_style,
        "bullet": bullet_style,
        "callout": callout_style,
    }

def create_part1_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    s = build_styles()
    story = []

    # Title Banner
    story.append(Paragraph("Part 1: The Puzzle — Solution", s["title"]))
    story.append(Paragraph("Eliminating the 25% Consultation No-Show Rate in Wellness Practices", s["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_FOREST, spaceAfter=14))

    # Section 1
    story.append(Paragraph("1. Problem Diagnosis: Why Everyday Wellness Clients Ghost", s["h1"]))
    story.append(Paragraph(
        "In a clinical nutrition practice running on WhatsApp and Excel, 1 in 4 clients (25%) fails to attend "
        "their scheduled consultation without advance notice. The practitioner only discovers the vacancy when sitting "
        "at her desk waiting. Behind this pattern are four predictable behavioral bottlenecks:",
        s["body"]
    ))
    story.append(Paragraph("• <b>Zero Skin-in-the-Game:</b> Booking via informal WhatsApp messaging incurs no psychological friction or tangible investment, making clients view the appointment as optional.", s["bullet"]))
    story.append(Paragraph("• <b>The 'Guilt Avoidance' Trap:</b> When unforeseen conflicts occur, drafting an apologetic apology text feels socially awkward. For many clients, silent absence feels emotionally easier than confronting the practitioner.", s["bullet"]))
    story.append(Paragraph("• <b>Notification Blindness:</b> As active chat threads displace booking confirmations down the WhatsApp feed, consultations without native calendar alerts are forgotten.", s["bullet"]))
    story.append(Paragraph("• <b>Information Asymmetry:</b> In an Excel spreadsheet, a future row looks identical whether the client is traveling or ready to join. The practitioner possesses zero forward visibility.", s["bullet"]))

    # Callout Box
    callout_data = [[
        Paragraph(
            "<b>The Core Insight:</b> Punitive cancellation fees damage client goodwill in holistic wellness. "
            "The winning product strategy removes the social awkwardness of rescheduling while introducing "
            "frictionless, 1-tap micro-commitments.",
            s["callout"]
        )
    ]]
    callout_table = Table(callout_data, colWidths=[letter[0] - 108])
    callout_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_SAGE_LIGHT),
        ("BOX", (0, 0), (-1, -1), 1, COLOR_SAGE),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(Spacer(1, 4))
    story.append(callout_table)
    story.append(Spacer(1, 10))

    # Section 2
    story.append(Paragraph("2. The Product Solution: 4-Pillar Behavioral Nudging Framework", s["h1"]))
    
    story.append(Paragraph("Pillar 1: Upfront Micro-Commitment (The Consistency Principle)", s["h2"]))
    story.append(Paragraph(
        "During booking, clients articulate their primary wellness focus (e.g. Gut Health & Digestion, PCOS Nutrition, "
        "Energy & Sports Performance). Rooted in behavioral economics (Cialdini's Principle of Consistency), stating a health goal "
        "creates psychological ownership, dramatically lowering drop-off compared to booking an abstract time slot.",
        s["body"]
    ))

    story.append(Paragraph("Pillar 2: 1-Tap WhatsApp 'Attendance Nudge' (T-24h and T-2h)", s["h2"]))
    story.append(Paragraph(
        "Automated WhatsApp messages are triggered 24 hours and 2 hours prior to consultation: "
        "<i>'Hi Riya! Dr. Kayro is preparing your personalized diet review for tomorrow at 10:00 AM. Please tap below to confirm attendance.'</i> "
        "With one tap on <b>[✓ Confirm Attendance]</b>, the client updates the database in real time, turning their badge green on the practitioner's desk.",
        s["body"]
    ))

    story.append(Paragraph("Pillar 3: 'No-Guilt' 2-Click Rescheduling", s["h2"]))
    story.append(Paragraph(
        "Directly within the WhatsApp reminder and client portal, a prominent <b>[Need to Reschedule?]</b> button allows "
        "clients to self-serve a new date in two clicks. Bypassing the awkwardness of drafting an apology text removes the incentive "
        "to ghost, while instantly returning the vacant slot to the available calendar for waitlisted clients.",
        s["body"]
    ))

    story.append(Paragraph("Pillar 4: Native Device Calendar Sync (.ics & Google Calendar)", s["h2"]))
    story.append(Paragraph(
        "Immediately upon booking, 1-click links push the consultation directly to Google Calendar, Apple Calendar, or Outlook "
        "with a pre-scheduled 2-hour alert, overcoming chat notification muting.",
        s["body"]
    ))

    # Section 3: Impact Table
    story.append(Paragraph("3. Projected Impact & Quantitative Targets", s["h1"]))
    metrics_data = [
        ["Metric", "WhatsApp + Excel Baseline", "With Kayro Wellness System"],
        ["No-Show Rate", "25% (1 in 4 consultations)", "Target: < 7% (over 70% reduction)"],
        ["Practitioner Warning Time", "0 minutes (sitting waiting)", "2 to 24 hours in advance"],
        ["Slot Recovery Rate", "0% (slot lost forever)", "~60% (freed slots re-booked)"],
        ["Client Experience", "Transactional & chaotic", "Empathetic, structured, premium"],
    ]
    t = Table(metrics_data, colWidths=[150, 170, 184])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_FOREST),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, COLOR_BG_LIGHT]),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Section 4: Integration in Part 2
    story.append(Paragraph("4. How this Solution was Implemented in Part 2 (The Build)", s["h1"]))
    story.append(Paragraph(
        "Every pillar was translated directly into functioning code in the Kayro application: "
        "Side A features 1-tap attendance confirmation, instant calendar exports, and seamless rescheduling modals; "
        "Side B provides practitioners with real-time confirmed/unconfirmed attendance badges, 1-click WhatsApp reminder triggers, "
        "and practice-wide no-show rate analytics.",
        s["body"]
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

def create_documentation_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    s = build_styles()
    story = []

    # Title Banner
    story.append(Paragraph("Kayro AI Product Intern Assignment — Documentation", s["title"]))
    story.append(Paragraph("Technical Architecture, Product Decisions, and Delivery Guide", s["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_FOREST, spaceAfter=14))

    # Heading 1
    story.append(Paragraph("1. What We Were Asked", s["h1"]))
    story.append(Paragraph(
        "Build a polished appointments web application for a wellness practice with two interfaces sharing the same data: "
        "<b>Side A (Client App)</b> providing a mobile-first booking experience with upcoming/past visits and rescheduling, and "
        "<b>Side B (Nutritionist Dashboard)</b> managing visits with color-coded statuses (<i>Booked, Done, No-show</i>), "
        "today's visit filtering, manual booking, and bidirectional synchronization. "
        "The project required loading 5 specific sample records, integrating at least one concrete solution to the 25% no-show problem, "
        "and enabling review without authentication.",
        s["body"]
    ))

    # Heading 2
    story.append(Paragraph("2. Your Approach", s["h1"]))
    story.append(Paragraph(
        "We treated Kayro as a calming wellness sanctuary rather than a cold administrative CRM. "
        "Technically, we implemented a <b>hybrid reactive data layer</b> (<code>appointmentService.js</code>) connecting to "
        "Supabase PostgreSQL when configured, while offering a zero-dependency, persistent local storage fallback so reviewers can "
        "immediately evaluate the build without manual setup. "
        "The design system utilizes warm cream backgrounds (<code>#FBF9F4</code>), deep forest green accents (<code>#1E3D2F</code>), "
        "and Playfair Display typography to convey elegance, warmth, and tranquility.",
        s["body"]
    ))

    # Heading 3
    story.append(Paragraph("3. Decisions and Assumptions (Including How We Handled Sample Data)", s["h1"]))
    story.append(Paragraph("• <b>Inconsistent Date Normalization:</b> Sample inputs varied across DD/MM/YYYY (<code>24/10/2026</code>), YYYY-MM-DD (<code>2026-10-24</code>), and DD-MM-YYYY (<code>25-10-2026</code>). We built an ingestion parser standardizing all entries to ISO <code>YYYY-MM-DD</code> internally for conflict checking and chronologic sorting while displaying localized dates (e.g. <i>Sat, 24 Oct 2026</i>).", s["bullet"]))
    story.append(Paragraph("• <b>Time Format Standardization:</b> Varied representations (<code>4 pm</code>, <code>11:30am</code>, <code>14:00</code>) were parsed into 24-hr <code>HH:mm</code> format internally and formatted into readable 12-hour AM/PM strings for display.", s["bullet"]))
    story.append(Paragraph("• <b>Graceful Phone Fallbacks:</b> Meera Iyer had no phone number; Riya Shah and Kabir Rao used disparate space conventions. We standardized 10-digit formats (<code>98200 11111</code>) and handled empty values gracefully with disabled WhatsApp triggers.", s["bullet"]))
    story.append(Paragraph("• <b>Practice Date Anchor:</b> Anchored the practice dashboard to <code>2026-10-24</code> matching the assignment context, enabling immediate demonstration of the 'Today Only' filter.", s["bullet"]))

    # Heading 4
    story.append(Paragraph("4. What You Added (and Why)", s["h1"]))
    story.append(Paragraph("• <b>1-Tap Attendance Confirmation:</b> Allows clients to check in with 1 tap, giving the nutritionist 24-hour advance peace of mind instead of waiting at her desk.", s["bullet"]))
    story.append(Paragraph("• <b>1-Click WhatsApp Reminder Links (<code>wa.me</code>):</b> Enables the practitioner to launch personalized, pre-written WhatsApp check-in messages with zero typing.", s["bullet"]))
    story.append(Paragraph("• <b>Instant Calendar Sync (.ics & Google Calendar):</b> Pushes consultations directly to device calendars with 2-hour notifications to eliminate forgetting.", s["bullet"]))
    story.append(Paragraph("• <b>No-Guilt 2-Click Rescheduling:</b> Removes social awkwardness and immediately returns vacant slots to the calendar.", s["bullet"]))
    story.append(Paragraph("• <b>Reviewer Client Switcher:</b> A 1-click toggle allowing assessors to inspect the experience as Riya Shah, Arjun Mehta, Meera Iyer, or Kabir Rao without login.", s["bullet"]))
    story.append(Paragraph("• <b>Practice Analytics & No-Show Rate:</b> Displays real-time clinic KPIs (Active Bookings, Confirmed Count, Historical No-Show %).", s["bullet"]))

    # Heading 5
    story.append(Paragraph("5. What the AI Got Wrong (and How You Caught and Fixed It)", s["h1"]))
    story.append(Paragraph("• <b>Default Template CSS Conflict:</b> Vite's default <code>index.css</code> injected <code>#root { text-align: center; border-inline: ... }</code>, disrupting alignments. Caught during visual inspection and replaced with a clean design token system.", s["bullet"]))
    story.append(Paragraph("• <b>Omitted Reschedule & Cancel Capabilities:</b> The starter code lacked rescheduling and cancellation logic. Built dedicated modals with conflict prevention.", s["bullet"]))
    story.append(Paragraph("• <b>Lexicographical Date Sorting Glitch:</b> Comparing mixed date strings produced incorrect chronological ordering. Standardized all comparisons to ISO <code>YYYY-MM-DD</code>.", s["bullet"]))
    story.append(Paragraph("• <b>Client Journey Data Bleed:</b> Initial filtering showed all practice appointments under the client view when no name was matched. Resolved by scoping records strictly to the active profile.", s["bullet"]))

    # Heading 6
    story.append(Paragraph("6. How to Run It", s["h1"]))
    story.append(Paragraph("<b>Local Development:</b>", s["h2"]))
    story.append(Paragraph("<code>1. cd kayro-appointments && npm install</code><br/><code>2. npm run dev</code> — Open <b>http://localhost:5173</b> in your browser. All sample records are preloaded.", s["body"]))
    story.append(Paragraph("<b>Optional Supabase PostgreSQL Connection:</b>", s["h2"]))
    story.append(Paragraph("Run <code>supabase-schema.sql</code> in the Supabase SQL editor, then populate <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>. The top indicator will display <b>Supabase Live</b>.", s["body"]))
    story.append(Paragraph("<b>Production Build & Deployment:</b>", s["h2"]))
    story.append(Paragraph("Live Production URL: <b>https://kayro-appointments.vercel.app</b><br/>GitHub: <b>https://github.com/SK-A73/Kayro-AI-Nutritionist-Booking-App</b><br/>Configured with <code>vercel.json</code> for instant zero-configuration deployment on Vercel.", s["body"]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    part1_pdf = os.path.join(base_dir, "Kayro_Part1_The_Puzzle_Solution.pdf")
    doc_pdf = os.path.join(base_dir, "Kayro_AI_Product_Intern_Documentation.pdf")
    
    create_part1_pdf(part1_pdf)
    create_documentation_pdf(doc_pdf)
