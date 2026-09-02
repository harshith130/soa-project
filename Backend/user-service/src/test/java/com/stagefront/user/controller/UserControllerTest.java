package com.stagefront.user.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.stagefront.user.dto.UserResponse;
import com.stagefront.user.exception.GlobalExceptionHandler;
import com.stagefront.user.service.UserService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import com.stagefront.user.dto.UserAuthenticationResponse;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

	@Mock
	private UserService userService;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		UserController controller = new UserController(userService);
		mockMvc = MockMvcBuilders.standaloneSetup(controller)
				.setControllerAdvice(new GlobalExceptionHandler())
				.build();
	}

	@Test
	void createUserReturnsCreatedUserWithoutPassword() throws Exception {
		when(userService.createUser(any())).thenReturn(
				new UserResponse(1L, "Test User", "user@example.com", null, "USER", LocalDateTime.now()));

		mockMvc.perform(post("/api/users")
					.contentType("application/json")
					.content("{\"name\":\"Test User\",\"email\":\"user@example.com\",\"password\":\"password123\"}"))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", "/api/users/1"))
				.andExpect(jsonPath("$.email").value("user@example.com"))
				.andExpect(jsonPath("$.password").doesNotExist());
	}

	@Test
	void authenticationEndpointReturnsHashOnlyOnInternalRoute() throws Exception {
		when(userService.findUserForAuthentication("user@example.com")).thenReturn(
				new UserAuthenticationResponse(1L, "Test User", "user@example.com", "USER", "bcrypt-hash"));

		mockMvc.perform(get("/api/users/internal/email/user@example.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.passwordHash").value("bcrypt-hash"))
				.andExpect(jsonPath("$.phone").doesNotExist())
				.andExpect(jsonPath("$.createdAt").doesNotExist());
	}
}