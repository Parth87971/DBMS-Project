package inventory.controller;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import inventory.dao.*;
import inventory.model.*;
import inventory.service.PurchaseService;
import inventory.service.SaleService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InventoryApiController {

    private final Gson gson = new GsonBuilder()
            .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
            .setDateFormat("yyyy-MM-dd")
            .create();

    private final BrandDAO brandDAO = new BrandDAO();
    private final CustomerDAO customerDAO = new CustomerDAO();
    private final ProductDAO productDAO = new ProductDAO();
    private final PurchaseDAO purchaseDAO = new PurchaseDAO();
    private final SaleDAO saleDAO = new SaleDAO();
    private final StockDAO stockDAO = new StockDAO();
    private final SupplierDAO supplierDAO = new SupplierDAO();
    private final WarrantyDAO warrantyDAO = new WarrantyDAO();
    private final AttachmentDAO attachmentDAO = new AttachmentDAO();

    private final PurchaseService purchaseService = new PurchaseService();
    private final SaleService saleService = new SaleService();

    @GetMapping(value = "/data", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAllData() {
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
            data.put("attachments", attachmentDAO.getAll());
            return ResponseEntity.ok(gson.toJson(data));
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Database error: " + e.getMessage() + "\"}");
        }
    }

    // --- BRANDS ---
    @PostMapping(value = "/brands", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createBrand(@RequestBody String body) {
        try {
            Brand brand = gson.fromJson(body, Brand.class);
            brandDAO.insert(brand);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping(value = "/brands", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateBrand(@RequestBody String body) {
        try {
            Brand brand = gson.fromJson(body, Brand.class);
            brandDAO.update(brand);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping(value = "/brands", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteBrand(@RequestParam("id") int id) {
        try {
            brandDAO.delete(id);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // --- PRODUCTS ---
    @PostMapping(value = "/products", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createProduct(@RequestBody String body) {
        try {
            Product product = gson.fromJson(body, Product.class);
            productDAO.insert(product);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping(value = "/products", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateProduct(@RequestBody String body) {
        try {
            Product product = gson.fromJson(body, Product.class);
            productDAO.update(product);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping(value = "/products", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteProduct(@RequestParam("id") int id) {
        try {
            productDAO.delete(id);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // --- STOCK ---
    @PutMapping(value = "/stock", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateStockReorderLevel(@RequestBody String body) {
        try {
            Map<?, ?> map = gson.fromJson(body, Map.class);
            int stockId = ((Double) map.get("stock_id")).intValue();
            int reorderLevel = ((Double) map.get("reorder_level")).intValue();
            stockDAO.updateReorderLevel(stockId, reorderLevel);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // --- CUSTOMERS ---
    @PostMapping(value = "/customers", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createCustomer(@RequestBody String body) {
        try {
            Customer customer = gson.fromJson(body, Customer.class);
            customerDAO.insert(customer);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping(value = "/customers", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateCustomer(@RequestBody String body) {
        try {
            Customer customer = gson.fromJson(body, Customer.class);
            customerDAO.update(customer);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping(value = "/customers", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteCustomer(@RequestParam("id") int id) {
        try {
            customerDAO.delete(id);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // --- SUPPLIERS ---
    @PostMapping(value = "/suppliers", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createSupplier(@RequestBody String body) {
        try {
            Supplier supplier = gson.fromJson(body, Supplier.class);
            supplierDAO.insert(supplier);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping(value = "/suppliers", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateSupplier(@RequestBody String body) {
        try {
            Supplier supplier = gson.fromJson(body, Supplier.class);
            supplierDAO.update(supplier);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping(value = "/suppliers", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteSupplier(@RequestParam("id") int id) {
        try {
            supplierDAO.delete(id);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // --- PURCHASES ---
    @PostMapping(value = "/purchases", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createPurchase(@RequestBody String body) {
        try {
            Map<?, ?> map = gson.fromJson(body, Map.class);
            Purchase purchase = new Purchase(
                    0,
                    java.sql.Date.valueOf((String) map.get("purchase_date")),
                    ((Double) map.get("quantity")).intValue(),
                    (Double) map.get("cost_price"),
                    ((Double) map.get("product_id")).intValue(),
                    ((Double) map.get("supplier_id")).intValue()
            );
            purchaseService.addPurchase(purchase);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping(value = "/purchases", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deletePurchase(@RequestParam("id") int id) {
        try {
            purchaseService.deletePurchase(id);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // --- SALES ---
    @PostMapping(value = "/sales", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createSale(@RequestBody String body) {
        try {
            Map<?, ?> map = gson.fromJson(body, Map.class);
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
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping(value = "/sales", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteSale(@RequestParam("id") int id) {
        try {
            saleService.deleteSale(id);
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
