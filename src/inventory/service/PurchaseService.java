package inventory.service;

import inventory.config.DBConnection;
import inventory.model.Purchase;

import java.sql.*;

public class PurchaseService {

    public void addPurchase(Purchase purchase) throws SQLException {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            String insertSql = "INSERT INTO purchase (purchase_date, quantity, cost_price, product_id, supplier_id) "
                             + "VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                ps.setDate(1, purchase.getPurchaseDate());
                ps.setInt(2, purchase.getQuantity());
                ps.setDouble(3, purchase.getCostPrice());
                ps.setInt(4, purchase.getProductId());
                ps.setInt(5, purchase.getSupplierId());
                ps.executeUpdate();
            }

            String checkSql = "SELECT stock_id FROM stock WHERE product_id=?";
            boolean stockExists;
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setInt(1, purchase.getProductId());
                ResultSet rs = ps.executeQuery();
                stockExists = rs.next();
            }

            if (stockExists) {
                String updateSql = "UPDATE stock SET available_quantity = available_quantity + ? WHERE product_id=?";
                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setInt(1, purchase.getQuantity());
                    ps.setInt(2, purchase.getProductId());
                    ps.executeUpdate();
                }
            } else {
                String newStockSql = "INSERT INTO stock (product_id, available_quantity, reorder_level) VALUES (?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(newStockSql)) {
                    ps.setInt(1, purchase.getProductId());
                    ps.setInt(2, purchase.getQuantity());
                    ps.setInt(3, 10);
                    ps.executeUpdate();
                }
            }

            conn.commit();
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }

    public void deletePurchase(int purchaseId) throws SQLException {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            int productId;
            int quantity;
            String fetchSql = "SELECT product_id, quantity FROM purchase WHERE purchase_id=?";
            try (PreparedStatement ps = conn.prepareStatement(fetchSql)) {
                ps.setInt(1, purchaseId);
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) {
                    throw new SQLException("Purchase not found with ID: " + purchaseId);
                }
                productId = rs.getInt("product_id");
                quantity  = rs.getInt("quantity");
            }

            String delSql = "DELETE FROM purchase WHERE purchase_id=?";
            try (PreparedStatement ps = conn.prepareStatement(delSql)) {
                ps.setInt(1, purchaseId);
                ps.executeUpdate();
            }

            String updateSql = "UPDATE stock SET available_quantity = available_quantity - ? WHERE product_id=?";
            try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                ps.setInt(1, quantity);
                ps.setInt(2, productId);
                ps.executeUpdate();
            }

            conn.commit();
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }
}

