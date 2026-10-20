
package com.example.myprojectbackend;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String username, String fullName, String password) {
        String normalizedUsername = username.trim();

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setFullName(fullName.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("REQUESTER");
        user.setActive(true);

        return userRepository.save(user);
    }

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid username or password"));

        if (!user.isActive()
                || !passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        return user;
    }
}
