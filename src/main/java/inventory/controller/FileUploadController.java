package inventory.controller;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import inventory.dao.AttachmentDAO;
import inventory.model.Attachment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.SQLException;
import java.util.*;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private final AttachmentDAO attachmentDAO = new AttachmentDAO();
    private final Gson gson = new GsonBuilder()
            .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
            .setDateFormat("yyyy-MM-dd HH:mm:ss")
            .create();

    @PostMapping({"/upload", "/files/upload"})
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "entityType", defaultValue = "GENERAL") String entityType,
            @RequestParam(value = "entityId", defaultValue = "0") int entityId) {

        Map<String, Object> response = new HashMap<>();

        if (file.isEmpty()) {
            response.put("status", "error");
            response.put("message", "File is empty. Please select a valid file.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            Path targetDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(targetDirectory)) {
                Files.createDirectories(targetDirectory);
            }

            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            String storedFilename = System.currentTimeMillis() + "_" + sanitizedFilename;

            Path targetPath = targetDirectory.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + storedFilename;
            String normalizedType = entityType != null ? entityType.trim().toUpperCase() : "GENERAL";

            Attachment attachment = new Attachment(
                    0,
                    normalizedType,
                    entityId,
                    storedFilename,
                    originalFilename,
                    file.getContentType(),
                    file.getSize(),
                    fileUrl,
                    null
            );

            int attachmentId = attachmentDAO.insert(attachment);

            response.put("status", "success");
            response.put("message", "File uploaded successfully.");
            response.put("attachment_id", attachmentId);
            response.put("entity_type", normalizedType);
            response.put("entity_id", entityId);
            response.put("fileName", storedFilename);
            response.put("originalName", originalFilename);
            response.put("contentType", file.getContentType());
            response.put("fileUrl", fileUrl);
            response.put("size", file.getSize());

            return ResponseEntity.ok(response);
        } catch (IOException | SQLException ex) {
            response.put("status", "error");
            response.put("message", "Failed to store file: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping(value = "/files", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> listUploadedFiles() {
        try {
            List<Attachment> attachments = attachmentDAO.getAll();
            return ResponseEntity.ok(gson.toJson(attachments));
        } catch (SQLException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + ex.getMessage() + "\"}");
        }
    }

    @DeleteMapping(value = "/files/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteFile(@PathVariable("id") int id) {
        try {
            Attachment attachment = attachmentDAO.getById(id);
            if (attachment != null) {
                Path targetPath = Paths.get(uploadDir).toAbsolutePath().normalize()
                        .resolve(attachment.getFileName());
                Files.deleteIfExists(targetPath);
                attachmentDAO.delete(id);
            }
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (IOException | SQLException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + ex.getMessage() + "\"}");
        }
    }
}
