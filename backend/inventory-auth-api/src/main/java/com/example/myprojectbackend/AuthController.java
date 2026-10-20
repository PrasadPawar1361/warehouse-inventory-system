
package com.example.myprojectbackend;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    public record SignupRequest(
            @NotBlank @Size(max = 50) String username,
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            User user = authService.register(
                    request.username(),
                    request.fullName(),
                    request.password()
            );

            String token = jwtService.generateToken(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Account created successfully",
                    "token", token,
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "role", user.getRole()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", ex.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = authService.authenticate(
                    request.username(),
                    request.password()
            );

            String token = jwtService.generateToken(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "role", user.getRole()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid username or password"
            ));
        }
    }
}
