namespace ChronoVault.Api.Dtos;

public record ForgotPasswordRequest(string Email);
public record ForgotPasswordResponse(string Message, string ResetToken);
public record ResetPasswordRequest(string Token, string NewPassword);
