package com.rohit.inventory.auth.dto;

public record AuthResponse(
        String message,
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        UserResponse user
) {}
