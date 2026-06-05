using BCrypt.Net;
using ChronoVault.Api.Data;
using ChronoVault.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController(ChronoVaultDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(new ProfileDto(user.UserId, user.FullName, user.Email, user.PhoneNumber, user.Address, user.Role));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Name is required" });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.FullName = request.Name.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        user.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();
        await dbContext.SaveChangesAsync();

        return Ok(new ProfileDto(user.UserId, user.FullName, user.Email, user.PhoneNumber, user.Address, user.Role));
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters" });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
        {
            return BadRequest(new { message = "Current password is incorrect" });
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
    }
}
