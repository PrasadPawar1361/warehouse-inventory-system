package com.rohit.inventory.auth;

import com.rohit.inventory.auth.dto.AuthResponse;
import com.rohit.inventory.auth.dto.LoginRequest;
import com.rohit.inventory.auth.dto.SignupRequest;
import com.rohit.inventory.auth.dto.UserResponse;
import com.rohit.inventory.security.JwtService;
import com.rohit.inventory.user.User;
import com.rohit.inventory.user.UserRepository;
import com.rohit.inventory.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        // Never accept a role from public signup requests.
        user.setRole(UserRole.STAFF);

        try {
            return UserResponse.from(userRepository.saveAndFlush(user));
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            // Also handles two simultaneous signup requests for the same email.
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists");
        }
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String token = jwtService.generateToken(userDetails);
        return new AuthResponse(
                "Login successful", token, "Bearer",
                jwtService.getExpirationSeconds(), UserResponse.from(user));
    }
}
