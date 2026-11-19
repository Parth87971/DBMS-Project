import time
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

def add_heading(doc, text, level):
    heading = doc.add_heading(text, level=level)
    return heading

def create_full_report():
    print("Generating rubric-aligned comprehensive report...")
    doc = Document()
    
    # --- Title Page ---
    title = doc.add_heading('DBMS Project Report\nElectronics Inventory Management System', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph()
    p_dev = doc.add_paragraph()
    p_dev.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dev.add_run('Submitted By:\n').bold = True
    p_dev.add_run('Name: Parth Deshmukh\n')
    p_dev.add_run('Roll No: 48\n')
    p_dev.add_run('PRN: 202401080071\n')
    
    doc.add_page_break()
    
    # --- Presentation & Demo Links ---
    add_heading(doc, 'Project Presentation & Demo', 1)
    p_links = doc.add_paragraph()
    p_links.add_run('Video Demo: ').bold = True
    p_links.add_run('https://drive.google.com/file/d/10JzeBaRARcg0OWVWHTLAvuNm77eyx6OF/view?usp=drive_link\n')
    p_links.add_run('GitHub Repository: ').bold = True
    p_links.add_run('https://github.com/Parth87971/DBMS-Project.git\n')
    
    # --- Problem Analysis & Design ---
    add_heading(doc, '1. Problem Analysis & Design', 1)
    
    add_heading(doc, '1.1 Problem Statement', 2)
    doc.add_paragraph(
        "Modern electronics and mobile stores struggle with manual tracking of inventory, resulting in data inconsistency, "
        "orphan records, and stock discrepancies. The objective of this project is to build a robust, centralized Electronics "
        "Inventory Management System that automatically tracks products, suppliers, customers, and intricate business flows "
        "like purchase restocking and sales-driven stock reduction."
    )
    
    add_heading(doc, '1.2 Well-Defined Requirements', 2)
    reqs = [
        ("Inventory Tracking", "Automatic increment on purchase, automatic decrement on sale."),
        ("Validation & Prevention", "Block sales when requested quantity exceeds available stock."),
        ("Warranty Management", "Automatically generate warranty records securely tied to successful sales."),
        ("Relational Integrity", "Prevent deletion of brands or products if they are actively linked to current inventory.")
    ]
    for feat, detail in reqs:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(feat + ": ").bold = True
        p.add_run(detail)
        
    add_heading(doc, '1.3 Database Design (ER Schema & Model)', 2)
    doc.add_paragraph(
        "The relational model is designed adhering to Third Normal Form (3NF) to eliminate data redundancy, "
        "transitive dependencies, and partial key dependencies."
    )
    
    rels = [
        ("Brand → Product (1:M)", "Each brand produces multiple products. FK in Product is brand_id."),
        ("Product → Purchase (1:M)", "Each product can be purchased multiple times. FK in Purchase is product_id."),
        ("Supplier → Purchase (1:M)", "Each supplier can provide multiple purchases. FK in Purchase is supplier_id."),
        ("Product → Sale (1:M)", "Each product can be sold multiple times. FK in Sale is product_id."),
        ("Customer → Sale (1:M)", "Each customer can initiate multiple sales. FK in Sale is customer_id."),
        ("Product ↔ Stock (1:1)", "Strict 1:1 mapping through a UNIQUE constraint on product_id in Stock."),
        ("Sale ↔ Warranty (1:1)", "Each transaction maps to exactly one warranty record by a UNIQUE constraint.")
    ]
    for title, desc in rels:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(title + " — ").bold = True
        p.add_run(desc)

    doc.add_page_break()

    # --- Use of Database Concepts ---
    add_heading(doc, '2. Effective Use of Database Concepts', 1)
    doc.add_paragraph(
        "The project heavily relies on core DBMS principles to guarantee data consistency and optimize performance."
    )
    
    concepts = [
        ("Constraints (CHECK & UNIQUE)", "Used check constraints to enforce positive quantities (>0) and non-negative pricing (>=0) directly at the database level. UNIQUE constraints enforce strict 1:1 relationships, such as guaranteeing a product doesn't have duplicate stock rows."),
        ("Referential Integrity (Foreign Keys)", "Implemented ON DELETE RESTRICT on core entities (like Brands/Categories) to prevent orphan records, and ON DELETE CASCADE on derivative entities (deleting a sale auto-deletes the associated warranty)."),
        ("Complex Queries & Optimization", "Used PreparedStatement logic to optimize query execution plans, prevent SQL injection, and map ResultSet objects directly to Java application state. JOIN operations dynamically fetch brand names for products to minimize redundant schema fetching."),
        ("Database Transactions (ACID)", "All purchase and sale operations execute inside a defined transaction context. If updating the Stock table fails after inserting into the Sale table, a rollback is executed to preserve Atomicity.")
    ]
    for title, desc in concepts:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(title + ": ").bold = True
        p.add_run(desc)

    # --- Implementation & Functionality ---
    add_heading(doc, '3. Implementation & Functionality', 1)
    doc.add_paragraph(
        "The web application correctly implements all database features and operations into a fully functional system."
    )
    techs = [
        ("Frontend", "React framework serving a fully responsive and dynamic interface."),
        ("Backend", "Java-based REST-like structure executing JDBC logic."),
        ("Database", "MySQL 8.0 server acting as the persistence layer.")
    ]
    for role, tool in techs:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(role + ": ").bold = True
        p.add_run(tool)

    add_heading(doc, '3.1 Application Interfaces (Screenshots)', 2)
    doc.add_paragraph("The visual interfaces demonstrating the functional database queries and features:")
    
    screenshots = [
        ("System Dashboard Interface (Data Visualization)", "Dashboard_Screenshot.png"),
        ("Products Management Screen (CRUD Operations)", "Products_Screenshot.png"),
        ("Sales Transactions Panel (Complex Joins & Triggers)", "Sales_Screenshot.png"),
        ("Purchases Management Interface (Restocking Flow)", "Purchases_Screenshot.png")
    ]
    
    for title, filepath in screenshots:
        add_heading(doc, title, 3)
        try:
            doc.add_picture(filepath, width=Inches(6.0))
            doc.add_paragraph() # spacing
        except Exception as e:
            doc.add_paragraph(f"[Image {filepath} could not be loaded]")
            
    doc.save('DBMS_Project_Report_Final.docx')
    print("Report saved successfully!")

if __name__ == "__main__":
    create_full_report()
