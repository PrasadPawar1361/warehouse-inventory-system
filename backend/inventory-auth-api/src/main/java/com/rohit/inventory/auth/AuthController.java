package com.rohit.inventory.auth;

import com.rohit.inventory.auth.dto.AuthResponse;
import com.rohit.inventory.auth.dto.LoginRequest;
import com.rohit.inventory.auth.dto.SignupRequest;
import com.rohit.inventory.auth.dto.UserResponse;
import com.rohit.inventory.user.User;
import com.rohit.inventory.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> signup(@Valid @RequestBody SignupRequest request) {
        UserResponse user = authService.signup(request);
        return Map.of("message", "Registration successful", "user", user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow();
        return UserResponse.from(user);
    }
}
