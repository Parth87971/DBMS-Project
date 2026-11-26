package inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CircuStockApplication {

    public static void main(String[] args) {
        System.out.println("Starting CircuStock Spring Boot Backend...");
        SpringApplication.run(CircuStockApplication.class, args);
    }
}
