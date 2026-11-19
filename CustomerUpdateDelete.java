import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CustomerUpdateDelete {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/electronics_inventory?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String pass = "Parth@01234";

        System.out.println("=========================================================================================");
        System.out.println("                 JDBC CONNECTIVITY: UPDATE AND DELETE OPERATIONS                         ");
        System.out.println("=========================================================================================");
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            System.out.println("[SUCCESS] Connected to MySQL Database (electronics_inventory)!\n");
            
            try (Statement stmt = conn.createStatement()) {
                
                // --- 1. INSERT A TEST CUSTOMER FIRST ---
                System.out.println("-> Inserting a test customer 'John Doe'...");
                stmt.executeUpdate("INSERT INTO customer (customer_name, phone, email) VALUES ('John Doe', '1234567890', 'john@test.com')");
                
                // Show table after insert
                printCustomerTable(stmt, "TABLE AFTER INSERT");
                
                // --- 2. UPDATE OPERATION ---
                System.out.println("\n-> PERFORMING UPDATE: Changing phone number for 'John Doe'...");
                int rowsUpdated = stmt.executeUpdate("UPDATE customer SET phone = '9999999999' WHERE customer_name = 'John Doe'");
                System.out.println("[INFO] Rows updated: " + rowsUpdated);
                
                // Show table after update
                printCustomerTable(stmt, "TABLE AFTER UPDATE");
                
                // --- 3. DELETE OPERATION ---
                System.out.println("\n-> PERFORMING DELETE: Removing customer 'John Doe'...");
                int rowsDeleted = stmt.executeUpdate("DELETE FROM customer WHERE customer_name = 'John Doe'");
                System.out.println("[INFO] Rows deleted: " + rowsDeleted);
                
                // Show table after delete
                printCustomerTable(stmt, "TABLE AFTER DELETE");
                
            }
        } catch (Exception e) {
            System.err.println("[ERROR] Database operation failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void printCustomerTable(Statement stmt, String title) throws Exception {
        System.out.println("\n" + title + ":");
        System.out.println("-----------------------------------------------------------------------------------------");
        System.out.printf("%-15s | %-25s | %-15s | %-30s%n", "CUSTOMER_ID", "CUSTOMER_NAME", "PHONE", "EMAIL");
        System.out.println("-----------------------------------------------------------------------------------------");
        
        try (ResultSet rs = stmt.executeQuery("SELECT * FROM customer WHERE customer_name = 'John Doe'")) {
            boolean hasData = false;
            while (rs.next()) {
                hasData = true;
                int id = rs.getInt("customer_id");
                String name = rs.getString("customer_name");
                String phone = rs.getString("phone");
                String email = rs.getString("email");
                
                System.out.printf("%-15d | %-25s | %-15s | %-30s%n", id, name, phone, email);
            }
            if (!hasData) {
                System.out.println("                         (No records found for 'John Doe')                               ");
            }
        }
        System.out.println("-----------------------------------------------------------------------------------------");
    }
}
