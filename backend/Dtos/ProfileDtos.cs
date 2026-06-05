namespace ChronoVault.Api.Dtos;

public record ProfileDto(int Id, string Name, string Email, string? PhoneNumber, string? Address, string Role);

public record UpdateProfileRequest(string Name, string? PhoneNumber, string? Address);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
