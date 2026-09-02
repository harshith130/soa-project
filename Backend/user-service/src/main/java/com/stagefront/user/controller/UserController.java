package com.stagefront.user.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stagefront.user.dto.UserAuthenticationResponse;
import com.stagefront.user.dto.UserRegistrationRequest;
import com.stagefront.user.dto.UserResponse;
import com.stagefront.user.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping
	public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRegistrationRequest request) {
		UserResponse response = userService.createUser(request);
		return ResponseEntity.created(URI.create("/api/users/" + response.id())).body(response);
	}

	@GetMapping("/{id}")
	public UserResponse findUserById(@PathVariable Long id) {
		return userService.findUserById(id);
	}

	@PutMapping("/{id}")
	public UserResponse updateUserProfile(@PathVariable Long id, @RequestBody Map<String, String> payload) {
		return userService.updateUserProfile(id, payload.get("name"), payload.get("phone"));
	}

	@GetMapping
	public List<UserResponse> listUsers() {
		return userService.listUsers();
	}

	@GetMapping("/email/{email}")
	public UserResponse findUserByEmail(@PathVariable String email) {
		return userService.findUserByEmail(email);
	}

	@GetMapping("/internal/email/{email}")
	public UserAuthenticationResponse findUserForAuthentication(@PathVariable String email) {
		return userService.findUserForAuthentication(email);
	}

	@PostMapping("/internal/password-reset")
	public ResponseEntity<Void> resetPasswordInternal(@RequestBody Map<String, String> payload) {
		userService.updatePassword(payload.get("email"), payload.get("newPassword"));
		return ResponseEntity.ok().build();
	}
}