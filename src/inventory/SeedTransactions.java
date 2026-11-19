package inventory;

import inventory.config.DBConnection;
import inventory.model.Purchase;
import inventory.model.Sale;
import inventory.service.PurchaseService;
import inventory.service.SaleService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.Date;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.Random;

public class SeedTransactions {
    public static void main(String[] args) {
        System.out.println("Initializing realistic database...");
        try {
            // 1. Run database.sql to reset schema
            executeSqlFile("database.sql");
            System.out.println("Database schema reset successfully.");

            PurchaseService purchaseService = new PurchaseService();
            SaleService saleService = new SaleService();
            Random rand = new Random(42); // fixed seed for reproducibility

            // We have 16 products in database.sql
            // product_ids: 1 to 16
            // supplier_ids: 1 to 5
            // customer_ids: 1 to 8

            // 2. Initial Huge Purchases 1 year ago for all products
            LocalDate startYear = LocalDate.now().minusDays(365);
            System.out.println("Seeding initial stock purchases...");
            for (int prodId = 1; prodId <= 16; prodId++) {
                Purchase p = new Purchase();
                p.setPurchaseDate(Date.valueOf(startYear.plusDays(rand.nextInt(10))));
                p.setProductId(prodId);
                p.setSupplierId(rand.nextInt(5) + 1);
                p.setQuantity(rand.nextInt(50) + 50); // 50 to 100
                // Generate a realistic cost price based on product ID (just an estimate)
                double estimatedCost = getEstimatedCost(prodId);
                p.setCostPrice(estimatedCost);
                purchaseService.addPurchase(p);
            }

            // 3. Seed periodic purchases throughout the year
            for (int i = 0; i < 40; i++) {
                Purchase p = new Purchase();
                LocalDate pDate = startYear.plusDays(rand.nextInt(350) + 15);
                p.setPurchaseDate(Date.valueOf(pDate));
                int prodId = rand.nextInt(16) + 1;
                p.setProductId(prodId);
                p.setSupplierId(rand.nextInt(5) + 1);
                p.setQuantity(rand.nextInt(30) + 10);
                p.setCostPrice(getEstimatedCost(prodId) * (0.95 + (rand.nextDouble() * 0.1))); // slightly fluctuating cost
                purchaseService.addPurchase(p);
            }
            
            System.out.println("Purchases seeded.");

            // 4. Seed hundreds of sales
            System.out.println("Seeding sales...");
            for (int i = 0; i < 200; i++) {
                Sale s = new Sale();
                LocalDate sDate = startYear.plusDays(rand.nextInt(365));
                s.setSaleDate(Date.valueOf(sDate));
                int prodId = rand.nextInt(16) + 1;
                s.setProductId(prodId);
                s.setCustomerId(rand.nextInt(8) + 1);
                
                // Small quantities (1 to 3)
                int qty = rand.nextInt(3) + 1;
                s.setQuantity(qty);
                
                double sellingPrice = getEstimatedPrice(prodId);
                s.setSellingPrice(sellingPrice);
                
                boolean addWarranty = rand.nextBoolean();
                int warrantyMonths = addWarranty ? 12 : 0;
                
                try {
                    saleService.addSale(s, addWarranty, warrantyMonths);
                } catch (Exception e) {
                    // Might run out of stock occasionally, just skip
                }
            }

            System.out.println("Sales and warranties seeded!");
            System.out.println("Data seeding complete. Realistic inventory generated.");

        } catch (Exception e) {
            System.err.println("Error seeding data: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static double getEstimatedCost(int prodId) {
        return getEstimatedPrice(prodId) * 0.75;
    }

    private static double getEstimatedPrice(int prodId) {
        double[] prices = {
            129999.00, 134900.00, 64999.00, 29990.00, 22999.00,
            6999.00, 44999.00, 32990.00, 74900.00, 99990.00,
            185000.00, 199900.00, 159999.00, 145000.00, 215000.00, 49990.00
        };
        if (prodId >= 1 && prodId <= prices.length) {
            return prices[prodId - 1];
        }
        return 10000.00;
    }

    private static void executeSqlFile(String filePath) throws Exception {
        String content = new String(Files.readAllBytes(Paths.get(filePath)));
        String[] statements = content.split(";");

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            // Drop tables if they exist to start fresh
            stmt.execute("SET FOREIGN_KEY_CHECKS = 0");
            stmt.execute("DROP TABLE IF EXISTS warranty, stock, sale, purchase, customer, supplier, product, brand");
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1");

            for (String sql : statements) {
                if (sql.trim().length() > 0 && !sql.trim().toUpperCase().startsWith("CREATE DATABASE") && !sql.trim().toUpperCase().startsWith("USE ")) {
                    stmt.execute(sql.trim());
                }
            }
        }
    }
}
