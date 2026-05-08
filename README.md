# ☕ Warkop Warga - Smart QR Ordering System (Full-Stack)

Warkop Warga is a modern, responsive Point of Sale (POS) and self-service ordering system. Built with a sleek pastel aesthetic (Sage Green), it empowers customers to order directly from their tables via QR codes, while providing admins with a robust, real-time dashboard for managing orders and daily revenue.

This project has evolved into a **Full-Stack Application**, utilizing Node.js for backend operations and a normalized MySQL database for secure, industrial-grade data storage.

## ✨ Key Features

### 📱 1. Interactive Customer Interface
- **Table-Specific Ordering:** Automatically binds orders to specific tables through QR code URL parameters (`?table=xxx`).
- **Dynamic Cart Drawer:** Customers can seamlessly view and edit their orders, complete with a custom "Notes" section (e.g., "Es dipisah").
- **Real-Time Order Tracking:** The system continuously polls the backend to detect status updates automatically without requiring a manual page refresh.
- **Digital Receipt Rendering:** Features a visually appealing digital thermal receipt generated upon successful payment.

### 🖥️ 2. Comprehensive Admin Dashboard
- **Real-Time Synchronization:** Active orders immediately flash on the dashboard, complete with pulsing audio (`Beep`) and visual alerts for unpaid orders and physical receipt requests.
- **Advanced Bookkeeping:** Transaction histories are cleanly separated by date, complete with automated daily revenue calculations.
- **Dynamic QR Code Generator:** Instantly generates and downloads printable QR labels for takeaway or specific custom tables using the `QRious` canvas renderer.

### 🗄️ 3. Robust Backend Architecture
- **Normalized Relational Database:** Utilizes `MySQL` with two interconnected tables (`orders` and `order_items`) ensuring scalable and structured data retention.
- **Automated Database Seeding:** Smart initialization that auto-creates tables and injects diverse dummy data if the database is completely empty (perfect for instant presentations).
- **Payment Webhook Ready:** Includes a dedicated `/api/webhook/payment` route to receive payment confirmation signals from external Payment Gateways.

## 🛠️ Tech Stack

- **Frontend:** Pure HTML5, CSS, and Vanilla JavaScript.
- **UI Design:** `Tailwind CSS` (CDN) featuring a custom Sage Green (`#7A9678`) color scheme, paired with `Lucide Icons`.
- **Backend Server:** `Node.js` with `Express.js` and `CORS`.
- **Database:** `MySQL` (managed via `phpMyAdmin` / XAMPP) interacting through the `mysql2` driver pool.

## 🚀 Installation & How To Run

### Prerequisites
1. **Node.js** installed on your machine.
2. **XAMPP** (or any MySQL environment) installed and running.

### Setup Steps
1. **Clone the Repository:** Download this project to your local machine.
2. **Install Dependencies:** Open your terminal in the project directory and run:
   ```bash
   npm install
   ```
3. **Database Preparation:** 
   - Open XAMPP and Start both **Apache** and **MySQL**.
   - Navigate to `http://localhost/phpmyadmin` in your browser.
   - Create a completely empty database named exactly: **`warkop_warga`**.
   *(No need to create tables manually; the backend will build and seed them for you!)*
4. **Start the Backend Server:**
   ```bash
   node server.js
   ```
   *You should see a success message indicating the Database is connected and the tables are ready.*
5. **Open the Application:**
   - **Customer View:** Open your browser and go to `http://localhost:3000/?table=1`
   - **Admin View:** Open a new tab and go to `http://localhost:3000/admin.html`

## 📝 Developer Notes
*This application currently runs on an offline LocalStorage setup for presentation and lightweight prototyping purposes. For real-world implementation across multiple distinct customer devices, you must integrate the `localStorage` functions located inside the JavaScript files (`app.js` & `admin.js`) into a real cloud Backend/Database (such as Firebase, Supabase, or a custom REST API).*