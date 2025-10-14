using System.ComponentModel.DataAnnotations;

namespace Api.Entity.Account
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Username is Required")]
        public string UserName { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
