package com.stagefront.user.service;

import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stagefront.user.dto.UserAuthenticationResponse;
import com.stagefront.user.dto.UserRegistrationRequest;
import com.stagefront.user.dto.UserResponse;
import com.stagefront.user.entity.User;
import com.stagefront.user.exception.DuplicateEmailException;
import com.stagefront.user.exception.UserNotFoundException;
import com.stagefront.user.repository.UserRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(UserRegistrationRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateEmailException("A user with this email already exists");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email().toLowerCase(Locale.ROOT));

        // Store encrypted password instead of plain text
        user.setPassword(passwordEncoder.encode(request.password()));

        user.setPhone(request.phone());
        user.setRole("USER");

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse findUserById(Long id) {
        return userRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public UserResponse findUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .map(this::toResponse)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public UserAuthenticationResponse findUserForAuthentication(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                    .map(user -> new UserAuthenticationResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getPassword()))
                    .orElseThrow(() ->
                        new UserNotFoundException("User not found with email: " + email));
    }

    public void updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse updateUserProfile(Long id, String name, String phone) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        if (phone != null) {
            user.setPhone(phone.trim());
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}