package com.stagefront.user.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.stagefront.user.dto.UserRegistrationRequest;
import com.stagefront.user.dto.UserAuthenticationResponse;
import com.stagefront.user.dto.UserResponse;
import com.stagefront.user.entity.User;
import com.stagefront.user.exception.DuplicateEmailException;
import com.stagefront.user.exception.UserNotFoundException;
import com.stagefront.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void createUserReturnsResponseWithoutPassword() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "Ada Lovelace", "Ada@Example.com", "password123", "555-0100");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.password())).thenReturn("encrypted-password");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(1L);
            return savedUser;
        });

        UserResponse response = userService.createUser(request);

        assertEquals(1L, response.id());
        assertEquals("ada@example.com", response.email());
        assertEquals("USER", response.role());
    }

    @Test
    void findUserByIdReturnsUser() {
        User user = user("user@example.com");
        user.setId(2L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        assertEquals(2L, userService.findUserById(2L).id());
    }

    @Test
    void findUserByEmailReturnsUser() {
        User user = user("user@example.com");

        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));

        assertEquals(
                "user@example.com",
                userService.findUserByEmail("user@example.com").email());
    }

    @Test
    void findUserForAuthenticationReturnsPasswordHash() {
        User user = user("user@example.com");
        user.setId(3L);
        user.setRole("USER");

        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));

        UserAuthenticationResponse response = userService.findUserForAuthentication("user@example.com");

        assertEquals(3L, response.id());
        assertEquals("encrypted-password", response.passwordHash());
    }

    @Test
    void createUserRejectsDuplicateEmail() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "Existing User", "user@example.com", "password123", null);

        when(userRepository.findByEmail(request.email()))
                .thenReturn(Optional.of(user(request.email())));

        assertThrows(
                DuplicateEmailException.class,
                () -> userService.createUser(request));
    }

    @Test
    void findUserByIdRejectsUnknownUser() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> userService.findUserById(99L));
    }

    private User user(String email) {
        User user = new User();
        user.setName("Test User");
        user.setEmail(email);
        user.setPassword("encrypted-password");
        return user;
    }
}