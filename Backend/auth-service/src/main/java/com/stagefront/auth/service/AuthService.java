package com.stagefront.auth.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriUtils;

import com.stagefront.auth.dto.ChangePasswordRequest;
import com.stagefront.auth.dto.ForgotPasswordRequest;
import com.stagefront.auth.dto.ForgotPasswordResponse;
import com.stagefront.auth.dto.LoginRequest;
import com.stagefront.auth.dto.LoginResponse;
import com.stagefront.auth.dto.ResetPasswordRequest;
import com.stagefront.auth.dto.UserAuthenticationResponse;
import com.stagefront.auth.exception.InvalidCredentialsException;

@Service
public class AuthService {

	private record ResetTokenInfo(String code, long expiresAt) {}

	private final RestClient userServiceClient;
	private final PasswordEncoder passwordEncoder;
	private final Map<String, ResetTokenInfo> resetCodeStore = new ConcurrentHashMap<>();

	public AuthService(RestClient userServiceClient, PasswordEncoder passwordEncoder) {
		this.userServiceClient = userServiceClient;
		this.passwordEncoder = passwordEncoder;
	}

	public LoginResponse login(LoginRequest request) {
		String email = request.email().trim().toLowerCase(Locale.ROOT);
		UserAuthenticationResponse user = userServiceClient.get()
				.uri(URI.create("/api/users/internal/email/"
						+ UriUtils.encodePathSegment(email, StandardCharsets.UTF_8)))
				.retrieve()
				.onStatus(status -> status.is4xxClientError(), (responseRequest, response) -> {
					throw new InvalidCredentialsException();
				})
				.body(UserAuthenticationResponse.class);

		if (user == null || user.passwordHash() == null
				|| !passwordEncoder.matches(request.password(), user.passwordHash())) {
			throw new InvalidCredentialsException();
		}

		return new LoginResponse("Login successful", user.id(), user.name(), user.email(), user.role());
	}

	public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
		String email = request.email().trim().toLowerCase(Locale.ROOT);
		UserAuthenticationResponse user = userServiceClient.get()
				.uri(URI.create("/api/users/internal/email/"
						+ UriUtils.encodePathSegment(email, StandardCharsets.UTF_8)))
				.retrieve()
				.onStatus(status -> status.is4xxClientError(), (responseRequest, response) -> {
					throw new IllegalArgumentException("No registered account found with email '" + email + "'.");
				})
				.body(UserAuthenticationResponse.class);

		if (user == null) {
			throw new IllegalArgumentException("No registered account found with email '" + email + "'.");
		}

		String code = String.format(Locale.ROOT, "%06d", new Random().nextInt(1000000));
		long expiresAt = System.currentTimeMillis() + (15 * 60 * 1000L); // 15 mins
		resetCodeStore.put(email, new ResetTokenInfo(code, expiresAt));

		return new ForgotPasswordResponse("Password reset code generated.", email, code);
	}

	public LoginResponse resetPassword(ResetPasswordRequest request) {
		String email = request.email().trim().toLowerCase(Locale.ROOT);
		if (!request.newPassword().equals(request.confirmPassword())) {
			throw new IllegalArgumentException("New password and confirmation password do not match.");
		}
		if (request.newPassword().length() < 6) {
			throw new IllegalArgumentException("Password must be at least 6 characters long.");
		}

		ResetTokenInfo tokenInfo = resetCodeStore.get(email);
		if (tokenInfo == null || System.currentTimeMillis() > tokenInfo.expiresAt()
				|| !tokenInfo.code().equals(request.resetCode().trim())) {
			throw new IllegalArgumentException("Invalid or expired password reset code.");
		}

		userServiceClient.post()
				.uri(URI.create("/api/users/internal/password-reset"))
				.body(Map.of("email", email, "newPassword", request.newPassword()))
				.retrieve()
				.toBodilessEntity();

		resetCodeStore.remove(email);

		return new LoginResponse("Password reset successfully. You can now log in with your new password.", null, null, email, null);
	}

	public LoginResponse changePassword(ChangePasswordRequest request) {
		String email = request.email().trim().toLowerCase(Locale.ROOT);
		if (!request.newPassword().equals(request.confirmPassword())) {
			throw new IllegalArgumentException("New password and confirmation password do not match.");
		}
		if (request.newPassword().length() < 6) {
			throw new IllegalArgumentException("Password must be at least 6 characters long.");
		}

		UserAuthenticationResponse user = userServiceClient.get()
				.uri(URI.create("/api/users/internal/email/"
						+ UriUtils.encodePathSegment(email, StandardCharsets.UTF_8)))
				.retrieve()
				.onStatus(status -> status.is4xxClientError(), (responseRequest, response) -> {
					throw new IllegalArgumentException("User account not found.");
				})
				.body(UserAuthenticationResponse.class);

		if (user == null || user.passwordHash() == null
				|| !passwordEncoder.matches(request.currentPassword(), user.passwordHash())) {
			throw new IllegalArgumentException("Current password is incorrect.");
		}

		userServiceClient.post()
				.uri(URI.create("/api/users/internal/password-reset"))
				.body(Map.of("email", email, "newPassword", request.newPassword()))
				.retrieve()
				.toBodilessEntity();

		return new LoginResponse("Password changed successfully.", user.id(), user.name(), user.email(), user.role());
	}
}