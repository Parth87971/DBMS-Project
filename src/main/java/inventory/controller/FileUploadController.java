package inventory.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping({"/upload", "/files/upload"})
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        if (file.isEmpty()) {
            response.put("status", "error");
            response.put("message", "File is empty. Please select a valid file to upload.");
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

            response.put("status", "success");
            response.put("message", "File uploaded successfully.");
            response.put("fileName", storedFilename);
            response.put("originalName", originalFilename);
            response.put("fileUrl", "/uploads/" + storedFilename);
            response.put("size", file.getSize());

            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            response.put("status", "error");
            response.put("message", "Failed to store file: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/files")
    public ResponseEntity<List<Map<String, Object>>> listUploadedFiles() {
        List<Map<String, Object>> filesList = new ArrayList<>();
        File folder = new File(uploadDir);
        if (folder.exists() && folder.isDirectory()) {
            File[] files = folder.listFiles();
            if (files != null) {
                for (File f : files) {
                    if (f.isFile()) {
                        Map<String, Object> info = new HashMap<>();
                        info.put("fileName", f.getName());
                        info.put("fileUrl", "/uploads/" + f.getName());
                        info.put("size", f.length());
                        info.put("lastModified", f.lastModified());
                        filesList.add(info);
                    }
                }
            }
        }
        return ResponseEntity.ok(filesList);
    }
}
