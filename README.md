# The Red Löffel (Le Bistro) - Artisanal Cloud Kitchen

A luxury, responsive frontend web application built for an artisanal cloud kitchen adhering strictly to the **"Le Bistro"** culinary design aesthetic:
- **Warm Cream Canvas:** `#FAF8F5`
- **Deep Espresso / Charcoal Typography:** `#1C1917`
- **Terracotta & Amber Accents:** `#C2410C` & `#D97706`
- **Typography:** Serif headings in `Playfair Display`, clean geometric body in `Inter`
- **Aesthetic Elements:** Smooth pill badges, soft border cards, micro-interactions

---

## 🛠 Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Design Philosophy:** Mobile-first, ultra-responsive, accessible contrast

---

## 🚀 Key Views & Features

### 1. View 1: Customer Storefront & Portal (`/`)
- **Header & Top Bar:**
  - Brand identity ("The Red Löffel" & subtitle "Artisanal Cloud Kitchen").
  - Live kitchen status: *"Kitchen Open • 30-45 mins delivery"* with pulsing indicator.
  - Quick action buttons for **Order History**, **Login / Account**, and sticky **Cart** badge.
- **Authentication (Phone OTP Modal):**
  - Indian Mobile Number format (`+91`) input with validation.
  - Transition to 6-digit OTP verification screen with countdown timer and one-click demo code (`123456`) auto-fill.
  - Persistent login profile state stored in context.
- **Category Carousel ("WHAT'S ON YOUR MIND?_"):**
  - Placed directly below the navigation bar (Swiggy / Zomato style).
  - High-res dish imagery for all categories: *Burgers*, *Parathas*, *Chinese*, *Fried Rice*, *Pasta*, *Maggi*, *Fries*, *Bowls*, and *Under ₹99*.
  - Smooth horizontal swipe for mobile and scroll buttons for desktop.
  - Clicking any category immediately filters the menu below and scrolls smoothly.
- **The Red Löffel Official Menu Integration:**
  - Real dishes & pricing from the café & kitchen poster:
    - **Burgers:** Aloo Tikki (₹50), Aloo Tikki Cheese (₹70), Paneer Tikki (₹80), Paneer Tikki Cheese (₹100).
    - **Parathas:** Aloo (₹40), Aloo Pyaz (₹50), Mix (₹60), Paneer (₹70), Paneer Pyaz (₹80).
    - **Chinese:** Chilli Potato (₹70), Honey Chilli (₹80), Chilli Paneer (₹90), Hakka Noodles (₹70), Paneer Noodles (₹80), Chilli Garlic Noodles (₹70), Kathi Rolls (₹50/₹70).
    - **Fried Rice:** Veg (₹90), Chilli Garlic (₹100), Paneer (₹110), Schezwan (₹100).
    - **Pasta:** White Sauce (₹120), Red Sauce (₹120), Mix Sauce (₹130), Cheese Sauce (₹140).
    - **Maggi:** Plain (₹50), Veg (₹60), Cheese (₹80), Paneer (₹80), Paneer Cheese (₹100).
    - **Fries:** Salted (₹70), Peri Peri (₹90), Cheese (₹110), Cheese Loaded (₹130).
    - **Bowls:** Kadhi Chawal (₹100), Rajma Chawal (₹100), Chole Chawal (₹100).
    - **Hotline & Brand:** +91 95400 60366 • "Good Food. Great Mood."
- **Menu & Categories:**
  - Sticky horizontal category pill bar (*All*, *Bistro Starters*, *Wood-fired Mains*, *Artisan Pasta*, *Beverages & Desserts*).
  - Veg / Non-Veg filter toggle with authentic Indian dietary markers (green dot vs red triangle).
  - Search filtering by dish title, ingredients, or description.
  - Interactive item cards with high-res food photography, tags (*Chef's Signature*, *Bestseller*), out-of-stock overlay, and smooth `[-] Qty [+]` counters.
- **Cart & Billing Drawer:**
  - Slide-over drawer with item quantity modifiers.
  - **Delivery vs. Pickup Switch:** Toggle removes delivery fee and reveals kitchen pickup address or applies flat ₹40 delivery fee.
  - Cooking notes textarea (e.g. *"Less spicy, extra napkins"*).
  - Clear item subtotal, 5% GST taxes, delivery fee, and grand total.
- **Checkout & Address + Map Pin:**
  - Customer contact details & WhatsApp number.
  - Address fields (House/Flat, Street, Landmark).
  - **"Detect / Pin Location on Map":** Simulates HTML5 GPS coordinates (`28.4744° N, 77.5040° E`) with ~10m precision verification card.
  - WhatsApp delivery update consent opt-in.
  - Payment method selector: *Cash on Delivery (COD)* vs. *Online UPI / Cards*.
- **Order History & Live Status View:**
  - Modal with active and past orders.
  - **5-Step Live Progress Timeline:** `[Pending] -> [Preparing] -> [Ready] -> [Out for Delivery] -> [Delivered]`.
  - Demo progression button (*"Advance Step"*) to test live step transitions.
  - Rider contact and direct Google Maps navigation link.

---

### 2. View 2: Admin Operations Dashboard (`/admin`)
- **Daily Sales & Stats Header:**
  - KPI cards: *Today's Orders*, *Total Revenue (₹)*, *Pending Deliveries*, and *Active Riders (3)*.
- **Live Orders Management Board:**
  - Kanban column view & status filter tabs (*Pending*, *Preparing*, *Ready*, *Out for Delivery*, *Delivered*).
  - Direct **"Open in Google Maps"** navigation button (`https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`).
  - Status advancement dropdown.
  - Delivery rider assignment selector (*Rajesh*, *Vikram*, *Amit*).
  - **"Share Task to Rider via WhatsApp"** with message preview and delivery status log (*Sent*, *Delivered*, *Read*, *Failed* with retry).
- **Menu & Pricing Manager:**
  - Complete menu inventory table.
  - Inline **"In Stock / Out of Stock"** toggle that immediately syncs with the customer storefront.
  - Quick inline price editing & full dish details modal.

---

## 🏃‍♂️ Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the Customer Storefront or [http://localhost:3000/admin](http://localhost:3000/admin) for the Kitchen Operations Dashboard.
