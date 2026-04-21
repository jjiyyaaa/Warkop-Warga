# ☕ Warkop Warga - Smart QR Ordering System 

Warkop Warga is a responsive, local-storage-based Point of Sale (POS) and self-service ordering system built purely with Vanilla HTML, CSS, and JS. This application adopts a QR-code-based Self-Service ordering flow right from the customer's table, wrapped in a modern, aesthetic pastel design (Sage Green).

## ✨ Key Features

### 📱 1. PWA-like Customer Interface (`index.html`)
- **Slide-out Cart Drawer:** Allows customers to view their order summary seamlessly with an iOS-style sliding animation.
- **Automatic Table Detection via QR:** All orders and checkouts automatically track the customer's table identity via URL parameters (`?table=`).
- **Seamless Checkout:** Total price confirmation and payment method selection (QRIS or Cash/Tunai) instantly lock the order in a "Waiting Confirmation" state.

### 🖥️ 2. Admin & Cashier Dashboard (`admin.html`)
- **Real-time Order Monitoring:** The Admin screen refreshes automatically every 3 seconds to fetch incoming orders. The Admin can click the **"Terima Pembayaran"** (Accept Payment) button, which instantly triggers a success state on the customer's screen.
- **Cashier Bookkeeping Log:** Displays today's revenue and a transaction history log (reverse-chronological).
- **Dynamic QR Code Generator:** 
  - Instantly generates Takeaway QR labels and predefined Table 1-10 QR codes using the `QRious` library.
  - **Manual Table Addition:** The Admin can manually type any custom table name (e.g., "VIP Glass", "Outdoor 2") and instantly generate its physical QR code for downloading and printing.

## 🛠️ Tech Stack

- **Structure & Logic:** Pure `HTML 5`, `JavaScript`, and native `DOM Manipulation` without any extra build/deploy tools (No Node.js or React.js required).
- **UI Design:** `Tailwind CSS` (via CDN) tailored with a custom *Sage Green* color scheme (`#7A9678`).
- **Icons:** `Lucide Icons` (via CDN).
- **QR Code Renderer:** `QRious` (via CDN Canvas Rendering).
- **Database / Storage:** `Browser LocalStorage` (Synchronized JSON data locally).

## 🚀 Installation & How To Use

1. **Download the Project:** Simply `Clone` or `Download ZIP` this repository to your local machine.
2. **Zero Installation Needed:** Because it is built entirely using Vanilla web technologies, you do NOT need to run `npm install` or any build scripts.
3. **Double Click / Open in Browser:**
   - Open `index.html` → Customer Main Menu (add parameter `?table=xxx` in the address bar or use the Admin Tab to simulate an order realistically).
   - Open `admin.html` → Open this in an adjacent browser tab. Notice how the dashboard reacts when an order is placed in the customer tab.
4. **Deploy to Public (Vercel/Github Pages):** *Deploy* all these files. Once the site is accessed online rather than via the offline local protocol (`file://`), the `QRious` system will automatically generate QR codes pointing correctly to your live public website URL.

## 📝 Developer Notes
*This application currently runs on an offline LocalStorage setup for presentation and lightweight prototyping purposes. For real-world implementation across multiple distinct customer devices, you must integrate the `localStorage` functions located inside the JavaScript files (`app.js` & `admin.js`) into a real cloud Backend/Database (such as Firebase, Supabase, or a custom REST API).*