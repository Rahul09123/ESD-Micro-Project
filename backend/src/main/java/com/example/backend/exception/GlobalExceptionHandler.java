package com.example.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Treat common client-side parsing/validation errors as 422 (avoid 400)
    @ExceptionHandler({ MethodArgumentNotValidException.class,
            HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            ConstraintViolationException.class })
    public ResponseEntity<?> handleValidationExceptions(Exception ex) {
        log.warn("Validation/Parsing error: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Invalid request");
        body.put("message", ex.getMessage());
        body.put("status", 422);
        return ResponseEntity.unprocessableEntity().body(body);
    }

    // Map IllegalArgumentException to 422 as well (avoid 400 responses)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArg(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Bad input");
        body.put("message", ex.getMessage());
        body.put("status", 422);
        return ResponseEntity.unprocessableEntity().body(body);
    }

    // Fallback for any other exceptions -> 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        log.error("Unhandled exception", ex);
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Internal Server Error");
        body.put("message", "An unexpected error occurred");
        body.put("status", 500);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
