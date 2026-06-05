using BCrypt.Net;
using ChronoVault.Api.Data;
using ChronoVault.Api.Dtos;
using ChronoVault.Api.Models;
using ChronoVault.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(ChronoVaultDbContext dbContext, JwtTokenService tokenService) : ControllerBase
{
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Name, email and password are required" });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existing = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (existing is not null)
        {
            return Conflict(new { message = "Email already registered" });
        }

        var user = new User
        {
            FullName = request.Name.Trim(),
            Email = normalizedEmail,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "customer"
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var userDto = new AuthUserDto(user.UserId, user.FullName, user.Email, user.Role);
        return Created(string.Empty, new AuthResponse(userDto, tokenService.CreateToken(userDto)));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var userDto = new AuthUserDto(user.UserId, user.FullName, user.Email, user.Role);
        return Ok(new AuthResponse(userDto, tokenService.CreateToken(userDto)));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        // Avoid account enumeration: return generic success even if user is missing.
        if (user is null)
        {
            return Ok(new ForgotPasswordResponse("If the account exists, a reset token has been generated.", string.Empty));
        }

        var token = Guid.NewGuid().ToString("N");
        dbContext.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.UserId,
            Token = token,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(30)
        });
        await dbContext.SaveChangesAsync();

        return Ok(new ForgotPasswordResponse("If the account exists, a reset token has been generated.", token));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Token and new password are required" });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long" });
        }

        var resetRecord = await dbContext.PasswordResetTokens
            .OrderByDescending(t => t.PasswordResetTokenId)
            .FirstOrDefaultAsync(t => t.Token == request.Token);

        if (resetRecord is null || resetRecord.UsedAtUtc is not null || resetRecord.ExpiresAtUtc < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Reset token is invalid or expired" });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.UserId == resetRecord.UserId);
        if (user is null)
        {
            return NotFound(new { message = "User not found for this token" });
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        resetRecord.UsedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully" });
    }
}
