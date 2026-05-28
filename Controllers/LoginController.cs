using Microsoft.AspNetCore.Mvc;

namespace CanchaGO.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
