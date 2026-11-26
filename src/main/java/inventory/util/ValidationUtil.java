package inventory.util;

public class ValidationUtil {

    public static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    public static boolean isValidEmail(String email) {
        if (isBlank(email)) return true;
        return email.matches("^[\\w.%-]+@[\\w.-]+\\.[a-zA-Z]{2,6}$");
    }

    public static boolean isValidPhone(String phone) {
        if (isBlank(phone)) return true;
        return phone.matches("^[0-9+\\-() ]{7,20}$");
    }

    public static boolean isPositiveInt(String s) {
        try {
            return Integer.parseInt(s.trim()) > 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public static boolean isNonNegativeDouble(String s) {
        try {
            return Double.parseDouble(s.trim()) >= 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public static boolean isValidDate(String s) {
        if (isBlank(s)) return false;
        try {
            java.sql.Date.valueOf(s.trim());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}

