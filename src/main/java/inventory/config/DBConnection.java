package inventory.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static String getEnv(String key, String def) {
        String val = System.getenv(key);
        if (val != null && !val.trim().isEmpty()) {
            return val;
        }
        val = System.getProperty(key);
        return (val != null && !val.trim().isEmpty()) ? val : def;
    }

    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/electronics_inventory?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String URL  = getEnv("SPRING_DATASOURCE_URL", getEnv("DB_URL", DEFAULT_URL));
    private static final String USER = getEnv("SPRING_DATASOURCE_USERNAME", getEnv("DB_USER", "root"));
    private static final String PASS = getEnv("SPRING_DATASOURCE_PASSWORD", getEnv("DB_PASSWORD", "Parth@01234"));

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found.", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}


