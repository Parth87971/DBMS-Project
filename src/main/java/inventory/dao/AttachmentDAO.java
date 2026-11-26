package inventory.dao;

import inventory.config.DBConnection;
import inventory.model.Attachment;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AttachmentDAO {

    public void ensureTableExists() throws SQLException {
        String sql = "CREATE TABLE IF NOT EXISTS attachment ("
                + "attachment_id INT PRIMARY KEY AUTO_INCREMENT, "
                + "entity_type VARCHAR(30) NOT NULL DEFAULT 'GENERAL', "
                + "entity_id INT NOT NULL DEFAULT 0, "
                + "file_name VARCHAR(255) NOT NULL, "
                + "original_name VARCHAR(255) NOT NULL, "
                + "content_type VARCHAR(120), "
                + "file_size BIGINT NOT NULL DEFAULT 0, "
                + "file_url VARCHAR(500) NOT NULL, "
                + "uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                + ") ENGINE=InnoDB";
        try (Connection conn = DBConnection.getConnection();
             Statement st = conn.createStatement()) {
            st.executeUpdate(sql);
        }
    }

    public int insert(Attachment a) throws SQLException {
        ensureTableExists();
        String sql = "INSERT INTO attachment (entity_type, entity_id, file_name, original_name, content_type, file_size, file_url) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, a.getEntityType() != null ? a.getEntityType() : "GENERAL");
            ps.setInt(2, a.getEntityId());
            ps.setString(3, a.getFileName());
            ps.setString(4, a.getOriginalName());
            ps.setString(5, a.getContentType());
            ps.setLong(6, a.getFileSize());
            ps.setString(7, a.getFileUrl());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
        }
        return 0;
    }

    public List<Attachment> getAll() throws SQLException {
        ensureTableExists();
        List<Attachment> list = new ArrayList<>();
        String sql = "SELECT * FROM attachment ORDER BY attachment_id DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(extract(rs));
            }
        }
        return list;
    }

    public Attachment getById(int attachmentId) throws SQLException {
        ensureTableExists();
        String sql = "SELECT * FROM attachment WHERE attachment_id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, attachmentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extract(rs);
                }
            }
        }
        return null;
    }

    public void delete(int attachmentId) throws SQLException {
        ensureTableExists();
        String sql = "DELETE FROM attachment WHERE attachment_id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, attachmentId);
            ps.executeUpdate();
        }
    }

    private Attachment extract(ResultSet rs) throws SQLException {
        return new Attachment(
                rs.getInt("attachment_id"),
                rs.getString("entity_type"),
                rs.getInt("entity_id"),
                rs.getString("file_name"),
                rs.getString("original_name"),
                rs.getString("content_type"),
                rs.getLong("file_size"),
                rs.getString("file_url"),
                rs.getTimestamp("uploaded_at")
        );
    }
}
