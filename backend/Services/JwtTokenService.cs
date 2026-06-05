using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChronoVault.Api.Dtos;
using Microsoft.IdentityModel.Tokens;

namespace ChronoVault.Api.Services;

public class JwtTokenService(IConfiguration config)
{
    public string CreateToken(AuthUserDto user)
    {
        var secret = config["Jwt:Secret"] ?? "chronovault_super_secret_key_123";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"] ?? "ChronoVault.Api",
            audience: config["Jwt:Audience"] ?? "ChronoVault.Frontend",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
