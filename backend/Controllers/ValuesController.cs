using Microsoft.AspNetCore.Mvc;

namespace ChronoVault.Api.Controllers;

[ApiController]
[Route("api/values")]
public class ValuesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetValues()
    {
        return Ok(new
        {
            message = "API connection successful",
            timestamp = DateTime.UtcNow
        });
    }
}
