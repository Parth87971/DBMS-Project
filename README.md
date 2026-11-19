# Electronics Inventory Management System

A full-stack inventory management application built with a **React + Vite** frontend, a **Java HTTP REST API** backend, **JDBC**, and **MySQL** for an electronics and mobile shop.

---

## Features

| Module            | Capabilities                                                      |
|-------------------|-------------------------------------------------------------------|
| **Dashboard**     | Quick stats — total products, stock, sales, low-stock count       |
| **Brand**         | Add, Update, Delete, Search, View All                             |
| **Product**       | CRUD with brand dropdown, price validation                        |
| **Supplier**      | CRUD with phone/email validation                                  |
| **Customer**      | CRUD with phone/email validation                                  |
| **Purchase**      | Record purchase → auto-creates/updates stock (transactional)      |
| **Sale**          | Record sale → validates stock → auto-decrements → warranty option |
| **Stock**         | View all, search, low-stock filter, update reorder level          |
| **Warranty**      | Auto-created on sale, view/search by product or customer          |

### Business Logic Highlights

- **Stock auto-update**: Purchases increase stock; Sales decrease stock. If no stock row exists, it's created automatically.
- **Stock validation**: Sales are blocked if requested quantity exceeds available stock.
- **Low-stock alerts**: After a sale, a warning is displayed if stock drops to or below the reorder level.
- **Warranty generation**: When a sale is recorded with "Include Warranty" checked, a warranty row is automatically created with `warranty_end = sale_date + N months`.
- **Transaction safety**: Purchase and Sale operations use database transactions with commit/rollback.
- **Input validation**: Required fields, positive quantities, non-negative prices, email/phone format checks.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Language    | Java 8+ (Backend)                   |
| Frontend    | React 19 + Vite + Lucide Icons      |
| Backend API | Java HTTP REST Server (Gson)        |
| Database    | MySQL 8.0+                          |
| Connectivity| JDBC with `PreparedStatement` only  |
| Driver      | MySQL Connector/J 8.x               |

---

## Project Structure

```
ElectronicsInventorySystem/
├── database.sql                  # Database creation + seed data
├── lib/
│   ├── gson-2.10.1.jar           # JSON serialization
│   └── mysql-connector-j-8.3.0.jar
├── src/
│   └── inventory/
│       ├── Main.java             # Backend entry point (starts REST server)
│       ├── api/
│       │   └── RestServer.java   # HTTP REST endpoints on port 8081
│       ├── config/
│       │   └── DBConnection.java # JDBC connection utility
│       ├── model/                # POJO classes
│       ├── dao/                  # Data Access Objects
│       ├── service/              # Transaction/business logic
│       └── util/                 # Utilities
├── frontend/                     # React + Vite application (port 5173)
├── build_and_run.bat             # Backend build & run script
└── README.md
```

---

## Setup Instructions

### Prerequisites

1. **JDK 8** or later installed and `javac`/`java` in PATH.
2. **Node.js** (v18+) and npm.
3. **MySQL 8.0+** installed and running.

### Step 1: Create the Database

```bash
mysql -u root -p < database.sql
```

### Step 2: Start the Java Backend

```bash
# Build and run the backend REST API
build_and_run.bat
```
The REST API server will run on `http://localhost:8081`.

### Step 3: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Database Schema (ER Summary)

```
BRAND (1) ──── (M) PRODUCT (1) ──── (1) STOCK
                       │
              ┌────────┴────────┐
              │                 │
         PURCHASE (M)      SALE (M) ──── (1) WARRANTY
              │                 │
         SUPPLIER (1)      CUSTOMER (1)
```

### Key Relationships

| Relationship          | Type     | FK Location         |
|-----------------------|----------|---------------------|
| Brand → Product       | 1:M      | product.brand_id    |
| Product → Purchase    | 1:M      | purchase.product_id |
| Supplier → Purchase   | 1:M      | purchase.supplier_id|
| Product → Sale        | 1:M      | sale.product_id     |
| Customer → Sale       | 1:M      | sale.customer_id    |
| Product → Stock       | 1:1      | stock.product_id (UNIQUE) |
| Sale → Warranty       | 1:1      | warranty.sale_id (UNIQUE) |

### Normalization

- All tables are in **3NF** (Third Normal Form).
- No transitive dependencies.
- No partial key dependencies.
- Referential integrity maintained via foreign keys.

---

## Design Decisions

1. **No product_supplier junction table** — supplier relationship is captured through `PURCHASE` (which supplier supplied which product, when).
2. **ON DELETE RESTRICT** on most FKs — prevents orphan records (cannot delete a brand if products exist).
3. **ON DELETE CASCADE** on warranty FK — deleting a sale automatically removes its warranty.
4. **CHECK constraints** — enforce positive quantities and non-negative prices at the database level.
5. **Service layer for transactions** — `PurchaseService` and `SaleService` handle multi-table operations within transactions.

---

## License

This project is open-source and free to use.
