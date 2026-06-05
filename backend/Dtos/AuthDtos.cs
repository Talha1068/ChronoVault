namespace ChronoVault.Api.Dtos;

public record SignupRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthUserDto(int Id, string Name, string Email, string Role);
public record AuthResponse(AuthUserDto User, string Token);
