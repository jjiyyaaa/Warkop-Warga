const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  PageBreak, Table, TableRow, TableCell, WidthType,
  ShadingType
} = require('docx');
const fs = require('fs');

const FONT = 'Times New Roman';
const SZ = 22;      // 11pt (half-points)
const SZ_SM = 20;   // 10pt
const HEADING_COLOR = '1F3864';
const LINE = 276;   // ~1.15 spacing (tight but readable)
const AFTER = 80;
const AFTER_PARA = 120;

function p(text, { bold = false, size = SZ, align = AlignmentType.JUSTIFIED, italic = false, color = '000000', after = AFTER_PARA, before = 0 } = {}) {
  return new Paragraph({
    alignment: align,
    spacing: { line: LINE, after, before },
    children: [new TextRun({ text, bold, size, font: FONT, italics: italic, color })],
  });
}

function h(text, level = 1) {
  const sz = level === 1 ? 26 : 23;
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: LINE, before: level === 1 ? 200 : 140, after: 80 },
    children: [new TextRun({ text: level === 1 ? text.toUpperCase() : text, bold: true, size: sz, font: FONT, color: HEADING_COLOR })],
  });
}

function b(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { line: LINE, after: 60 },
    children: [new TextRun({ text, size: SZ_SM, font: FONT })],
  });
}

function blank(after = 80) {
  return new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after } });
}

function tCell(text, { bold = false, fill = 'FFFFFF' } = {}) {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({ spacing: { line: LINE, after: 0 }, children: [new TextRun({ text, bold, size: SZ_SM, font: FONT })] })],
  });
}

function tRow(a, b_text, fillA = 'E8F0E9', fillB = 'FFFFFF') {
  return new TableRow({ children: [tCell(a, { bold: true, fill: fillA }), tCell(b_text, { fill: fillB })] });
}

const doc = new Document({
  sections: [{
    properties: {
      page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } },
    },
    children: [

      // ── COVER PAGE ────────────────────────────────────────────────
      blank(200), blank(200), blank(200),
      p('PROJECT REPORT', { bold: true, size: 36, align: AlignmentType.CENTER, color: HEADING_COLOR }),
      p('ECONOMIC SURVIVAL 2026', { bold: true, size: 28, align: AlignmentType.CENTER, color: HEADING_COLOR }),
      blank(160),
      p('☕ Warkop Warga', { bold: true, size: 44, align: AlignmentType.CENTER, color: '2E7D32' }),
      p('Smart QR-Based Ordering & Point of Sale System', { italic: true, size: 24, align: AlignmentType.CENTER }),
      blank(200), blank(200),
      p('Group Name:', { bold: true, align: AlignmentType.CENTER }),
      p('Warkop Warga Team', { bold: true, size: 24, align: AlignmentType.CENTER, color: '2E7D32' }),
      blank(120),
      p('Members:', { bold: true, align: AlignmentType.CENTER }),
      p('1. [Member Name 1]', { align: AlignmentType.CENTER }),
      p('2. [Member Name 2]', { align: AlignmentType.CENTER }),
      p('3. [Member Name 3]', { align: AlignmentType.CENTER }),
      blank(120),
      p('[Class] / [Lecturer Name]', { align: AlignmentType.CENTER }),
      p('2026', { bold: true, align: AlignmentType.CENTER }),

      new Paragraph({ children: [new PageBreak()] }),

      // ── PAGE 2 ────────────────────────────────────────────────────
      h('1. Background / Idea Background'),
      p('Most small local coffee shops (warkop) in Indonesia still operate with fully manual processes—verbal orders, handwritten notes, and cash-only transactions—leading to frequent miscommunication, order inaccuracies, and zero financial traceability. Warkop Warga was developed to address this three-way operational bottleneck by bringing a QR-code-based digital ordering system that is accessible on any smartphone without requiring app installation, and affordable enough for micro-scale businesses.'),

      h('2. Product Summary'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tRow('Product Name', 'Warkop Warga – Smart QR Ordering & POS System'),
          tRow('Problems Solved', 'Manual ordering errors, slow service, and lack of financial records in small coffee shops.'),
          tRow('Brief Description', 'A full-stack web app: customers scan a QR code at their table, browse the menu, add custom item notes, and checkout digitally. Admins manage orders and daily revenue via a live dashboard.'),
          tRow('Main Innovation', 'Normalized MySQL database + real-time cashier dashboard with audio alerts + automated date-grouped bookkeeping—packaged into a zero-install, mobile-first web interface.'),
        ],
      }),

      h('3. Product / Service Description'),
      h('3.1 Operational Mechanism', 2),
      p('Warkop Warga runs on two synchronized interfaces. The Customer Interface (index.html) activates when a customer scans the table QR code; the URL parameter (?table=xxx) auto-identifies the table. Customers browse categorized menu items, add items to a slide-out cart with per-item custom notes, select QRIS or Cash payment, and receive a digital receipt. The Admin Dashboard (admin.html) polls the backend every 3 seconds; new unpaid orders trigger a pulsing visual card and audio beep. The cashier confirms payments and views date-separated bookkeeping with automated daily revenue totals.'),

      h('3.2 Main Components', 2),
      b('Frontend: HTML5, Vanilla JavaScript, Tailwind CSS (CDN), Lucide Icons, QRious library.'),
      b('Backend: Node.js + Express.js REST API, mysql2 database driver, CORS middleware.'),
      b('Database: MySQL (phpMyAdmin/XAMPP)—two relational tables: orders (transaction header) and order_items (per-item detail), linked by Foreign Key.'),

      h('3.3 Product Documentation', 2),
      p('[Insert product screenshots here with labels: (1) Customer Menu, (2) Cart with Notes, (3) Admin Dashboard, (4) Bookkeeping View]', { italic: true, color: '1565C0' }),

      // ── PAGE 3 ────────────────────────────────────────────────────
      h('4. Innovation / Novelty'),
      h('4.1 Distinction from Similar Products', 2),
      b('Zero App Installation: Fully browser-based—no download, no account required for customers.'),
      b('Offline-Capable on LAN: Runs entirely on a local hotspot network; no internet subscription required during operation.'),
      b('Per-Item Custom Notes: Allows item-level customization (e.g., "no sugar", "extra spicy") not available in most small-business POS tools.'),
      b('Normalized Relational Database: Two linked MySQL tables provide structured, non-redundant data—superior to spreadsheet or localStorage alternatives.'),

      h('4.2 Primary Added Value', 2),
      b('Operational Efficiency: Orders appear on the admin dashboard within 3 seconds of submission, eliminating verbal relay.'),
      b('Financial Transparency: Automatic date-grouped bookkeeping with daily revenue totals replaces error-prone manual tallying.'),
      b('Physical Receipt Alert: If a customer requests a physical receipt, the order card re-appears in the Active tab with a pulsing notification.'),

      h('4.3 Market Potential & Competitiveness', 2),
      p('Target market: Small-to-medium local warkops and casual eateries in Indonesia. Key competitors (Moka POS, Gobiz, GrabMerchant) require monthly subscriptions (Rp 200,000–500,000/month), proprietary hardware, or stable internet. Warkop Warga is entirely free to operate post-setup—only a laptop and a free XAMPP installation are required.'),

      h('5. Functionality & Testing'),
      h('5.1 Core Functions', 2),
      b('QR Code Table Detection: Each table QR links to ?table=X, binding all orders to the correct table automatically.'),
      b('Real-Time Order Sync: Active orders appear on admin dashboard within 3 seconds via polling.'),
      b('Dual Payment Support: QRIS and Cash, with appropriate UI cues for each payment type.'),
      b('Order Status Lifecycle: Unpaid → Paid → Completed, managed by admin action buttons.'),
      b('Auto Database Seeding: On first launch with an empty database, the server injects multi-day sample data for instant demonstration.'),

      // ── PAGE 4 ────────────────────────────────────────────────────
      h('5.2 Basic Testing Results', 2),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tCell('Test Case', { bold: true, fill: '1F3864' }), tCell('Result', { bold: true, fill: '1F3864' })] }),
          tRow('Submit order via customer interface', '✓ Appears on admin within 3 seconds'),
          tRow('Add item note ("es dipisah")', '✓ Note shown on admin card & digital receipt'),
          tRow('Request physical receipt', '✓ Order re-appears with pulsing alert in Active tab'),
          tRow('Click "Aktifkan Suara" button', '✓ Audio beep plays on all subsequent orders'),
          tRow('View Bookkeeping tab', '✓ Orders grouped by date with daily revenue totals'),
          tRow('Server restart with empty database', '✓ Tables auto-created and sample data seeded'),
        ],
      }),
      blank(100),

      h('5.3 Strengths & Limitations', 2),
      b('Strengths: Zero-cost operation; works offline on LAN; normalized database for data integrity; mobile-first responsive design; real-time dual-screen sync.'),
      b('Limitations: Requires manual XAMPP + Node.js setup (not yet a one-click installer); polling-based sync (not true WebSocket real-time); QRIS payment currently simulated (no live merchant account).'),

      h('5.4 Simulation', 2),
      p('Simulation video: [Insert video link]', { italic: true, color: '1565C0' }),
      p('Source code (GitHub): [Insert GitHub repository link]', { italic: true, color: '1565C0' }),

      h('6. Closing'),
      h('6.1 Conclusion', 2),
      p('Warkop Warga successfully demonstrates that micro-scale food and beverage businesses can be meaningfully modernized through accessible, zero-cost web technology. All core features—QR ordering, custom item notes, dual payment support, real-time admin sync, physical receipt alerts with audio, and date-grouped bookkeeping—have been implemented and verified. The system is fully operational and ready for live exhibition.'),

      h('6.2 Development Potential', 2),
      b('Cloud Deployment: Migrate database to a cloud provider (Railway/Supabase) for internet-accessible, multi-device operation.'),
      b('Live Payment Gateway: Activate the existing /api/webhook/payment endpoint with a licensed Indonesian gateway (Midtrans/Xendit).'),
      b('WebSocket Upgrade: Replace polling with Socket.IO for push-based, zero-latency order notifications.'),
      b('Kitchen Display & Analytics: Add a kitchen-facing interface and sales analytics dashboard to increase long-term business value.'),
      blank(80),
      p('With these enhancements, Warkop Warga has strong potential to evolve from an exhibition prototype into a commercially viable, cloud-hosted SaaS product targeting Indonesia\'s rapidly growing micro-enterprise F&B sector.', { italic: true }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('Laporan Warkop Warga v2.docx', buffer);
  console.log('SUCCESS: Compact 5-page report generated -> Laporan Project Warkop Warga.docx');
}).catch(err => console.error('Error:', err));
