import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class ShowCustomerTable {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/electronics_inventory?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String pass = "Parth@01234";

        System.out.println("=========================================================================================");
        System.out.println("                         CONNECTING TO DATABASE (JDBC)                                   ");
        System.out.println("=========================================================================================");
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            System.out.println("[SUCCESS] Connected to MySQL Database (electronics_inventory)!\n");
            
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM customer")) {
                 
                System.out.println("CUSTOMER TABLE DATA:");
                System.out.println("-----------------------------------------------------------------------------------------");
                System.out.printf("%-15s | %-25s | %-15s | %-30s%n", "CUSTOMER_ID", "CUSTOMER_NAME", "PHONE", "EMAIL");
                System.out.println("-----------------------------------------------------------------------------------------");
                
                while (rs.next()) {
                    int id = rs.getInt("customer_id");
                    String name = rs.getString("customer_name");
                    String phone = rs.getString("phone");
                    String email = rs.getString("email");
                    
                    System.out.printf("%-15d | %-25s | %-15s | %-30s%n", id, name, phone, email);
                }
                System.out.println("-----------------------------------------------------------------------------------------");
                System.out.println("[INFO] Data retrieval successful.");
                
            }
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to connect or retrieve data: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
