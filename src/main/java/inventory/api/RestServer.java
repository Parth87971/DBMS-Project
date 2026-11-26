package inventory.api;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.FieldNamingPolicy;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import inventory.dao.*;
import inventory.model.*;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RestServer {
    private HttpServer server;
    private Gson gson = new GsonBuilder()
        .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
        .setDateFormat("yyyy-MM-dd")
        .create();

    private BrandDAO brandDAO = new BrandDAO();
    private CustomerDAO customerDAO = new CustomerDAO();
    private ProductDAO productDAO = new ProductDAO();
    private PurchaseDAO purchaseDAO = new PurchaseDAO();
    private SaleDAO saleDAO = new SaleDAO();
    private StockDAO stockDAO = new StockDAO();
    private SupplierDAO supplierDAO = new SupplierDAO();
    private WarrantyDAO warrantyDAO = new WarrantyDAO();

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(8081), 0);
        
        server.createContext("/api/data", new DataHandler());
        server.createContext("/api/brands", new EntityHandler<>(brandDAO, Brand.class));
        server.createContext("/api/customers", new EntityHandler<>(customerDAO, Customer.class));
        server.createContext("/api/products", new EntityHandler<>(productDAO, Product.class));
        server.createContext("/api/purchases", new EntityHandler<>(purchaseDAO, Purchase.class));
        server.createContext("/api/suppliers", new EntityHandler<>(supplierDAO, Supplier.class));
        
        // Sales have special business logic (SaleService)
        server.createContext("/api/sales", new SaleHandler());
        
        server.setExecutor(null);
        server.start();
        System.out.println("REST API server started on port 8081");
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().add("Content-Type", "application/json");

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        byte[] bytes = response.getBytes("UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    class DataHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                sendResponse(exchange, 204, "");
                return;
            }
            try {
                Map<String, Object> data = new HashMap<>();
                data.put("brands", brandDAO.getAll());
                data.put("customers", customerDAO.getAll());
                data.put("products", productDAO.getAll());
                data.put("purchases", purchaseDAO.getAll());
                data.put("sales", saleDAO.getAll());
                data.put("stock", stockDAO.getAll());
                data.put("suppliers", supplierDAO.getAll());
                data.put("warranties", warrantyDAO.getAll());

                sendResponse(exchange, 200, gson.toJson(data));
            } catch (SQLException e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\": \"Database error\"}");
            }
        }
    }

    class EntityHandler<T> implements HttpHandler {
        private Object dao;
        private Class<T> clazz;

        public EntityHandler(Object dao, Class<T> clazz) {
            this.dao = dao;
            this.clazz = clazz;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                sendResponse(exchange, 204, "");
                return;
            }
            try {
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    InputStreamReader reader = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    T obj = gson.fromJson(reader, clazz);
                    
                    // Call insert method
                    java.lang.reflect.Method insertMethod = dao.getClass().getMethod("insert", clazz);
                    insertMethod.invoke(dao, obj);
                    
                    sendResponse(exchange, 200, "{\"status\": \"success\"}");
                } else if (exchange.getRequestMethod().equalsIgnoreCase("PUT")) {
                    InputStreamReader reader = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    T obj = gson.fromJson(reader, clazz);
                    
                    java.lang.reflect.Method updateMethod = dao.getClass().getMethod("update", clazz);
                    updateMethod.invoke(dao, obj);
                    
                    sendResponse(exchange, 200, "{\"status\": \"success\"}");
                } else if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
                    // Expect query param ?id=123
                    String query = exchange.getRequestURI().getQuery();
                    if (query != null && query.startsWith("id=")) {
                        int id = Integer.parseInt(query.split("=")[1]);
                        java.lang.reflect.Method deleteMethod = dao.getClass().getMethod("delete", int.class);
                        deleteMethod.invoke(dao, id);
                        sendResponse(exchange, 200, "{\"status\": \"success\"}");
                    } else {
                        sendResponse(exchange, 400, "{\"error\": \"Missing id\"}");
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\": \"" + e.getMessage() + "\"}");
            }
        }
    }

    class SaleHandler implements HttpHandler {
        private inventory.service.SaleService saleService = new inventory.service.SaleService();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                sendResponse(exchange, 204, "");
                return;
            }
            try {
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    InputStreamReader reader = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    Map<String, Object> map = gson.fromJson(reader, Map.class);
                    Sale sale = new Sale(
                        0,
                        java.sql.Date.valueOf((String) map.get("sale_date")),
                        ((Double) map.get("quantity")).intValue(),
                        (Double) map.get("selling_price"),
                        ((Double) map.get("product_id")).intValue(),
                        ((Double) map.get("customer_id")).intValue()
                    );
                    boolean addWarranty = map.containsKey("add_warranty") && (Boolean) map.get("add_warranty");
                    
                    saleService.addSale(sale, addWarranty, 12);
                    sendResponse(exchange, 200, "{\"status\": \"success\"}");
                } else if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
                    String query = exchange.getRequestURI().getQuery();
                    if (query != null && query.startsWith("id=")) {
                        int id = Integer.parseInt(query.split("=")[1]);
                        saleService.deleteSale(id);
                        sendResponse(exchange, 200, "{\"status\": \"success\"}");
                    } else {
                        sendResponse(exchange, 400, "{\"error\": \"Missing id\"}");
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\": \"" + e.getMessage() + "\"}");
            }
        }
    }

    class PurchaseHandler implements HttpHandler {
        private inventory.service.PurchaseService purchaseService = new inventory.service.PurchaseService();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                sendResponse(exchange, 204, "");
                return;
            }
            try {
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    InputStreamReader reader = new InputStreamReader(exchange.getRequestBody(), "UTF-8");
                    Map<String, Object> map = gson.fromJson(reader, Map.class);
                    Purchase purchase = new Purchase(
                        0,
                        java.sql.Date.valueOf((String) map.get("purchase_date")),
                        ((Double) map.get("quantity")).intValue(),
                        (Double) map.get("cost_price"),
                        ((Double) map.get("product_id")).intValue(),
                        ((Double) map.get("supplier_id")).intValue()
                    );
                    
                    purchaseService.addPurchase(purchase);
                    sendResponse(exchange, 200, "{\"status\": \"success\"}");
                } else if (exchange.getRequestMethod().equalsIgnoreCase("DELETE")) {
                    String query = exchange.getRequestURI().getQuery();
                    if (query != null && query.startsWith("id=")) {
                        int id = Integer.parseInt(query.split("=")[1]);
                        purchaseService.deletePurchase(id);
                        sendResponse(exchange, 200, "{\"status\": \"success\"}");
                    } else {
                        sendResponse(exchange, 400, "{\"error\": \"Missing id\"}");
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\": \"" + e.getMessage() + "\"}");
            }
        }
    }
}
