package com.stagefront.user.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.stagefront.user.entity.User;
import com.stagefront.user.repository.UserRepository;

@Component
public class LegacyPasswordMigration implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String legacyPassword;

    public LegacyPasswordMigration(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${user-service.migration.email:}") String email,
            @Value("${user-service.migration.password:}") String legacyPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.legacyPassword = legacyPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (email.isBlank() || legacyPassword.isBlank()) {
            return;
        }

        userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .ifPresent(this::migrateIfLegacyPasswordMatches);
    }

    private void migrateIfLegacyPasswordMatches(User user) {
        String storedPassword = user.getPassword();
        if (storedPassword == null || isBcryptHash(storedPassword)) {
            return;
        }

        if (!MessageDigest.isEqual(
                storedPassword.getBytes(StandardCharsets.UTF_8),
                legacyPassword.getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalStateException("Configured legacy password does not match the stored value");
        }

        user.setPassword(passwordEncoder.encode(legacyPassword));
        userRepository.save(user);
    }

    private boolean isBcryptHash(String value) {
        return value.matches("^\\$2[aby]\\$[0-9]{2}\\$[./A-Za-z0-9]{53}$");
    }
}
