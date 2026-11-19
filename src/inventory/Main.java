package inventory;

import inventory.api.RestServer;

public class Main {

    public static void main(String[] args) {
        System.out.println("Electronics Inventory System Backend is starting...");
        try {
            RestServer server = new RestServer();
            server.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

