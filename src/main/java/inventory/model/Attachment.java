package inventory.model;

import java.sql.Timestamp;

public class Attachment {
    private int attachmentId;
    private String entityType;
    private int entityId;
    private String fileName;
    private String originalName;
    private String contentType;
    private long fileSize;
    private String fileUrl;
    private Timestamp uploadedAt;

    public Attachment() {}

    public Attachment(int attachmentId, String entityType, int entityId, String fileName,
                      String originalName, String contentType, long fileSize,
                      String fileUrl, Timestamp uploadedAt) {
        this.attachmentId = attachmentId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.fileName = fileName;
        this.originalName = originalName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.fileUrl = fileUrl;
        this.uploadedAt = uploadedAt;
    }

    public int getAttachmentId() { return attachmentId; }
    public void setAttachmentId(int attachmentId) { this.attachmentId = attachmentId; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public int getEntityId() { return entityId; }
    public void setEntityId(int entityId) { this.entityId = entityId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Timestamp getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Timestamp uploadedAt) { this.uploadedAt = uploadedAt; }
}
