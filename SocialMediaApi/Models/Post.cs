using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMediaApi.Models
{
    public class Post
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Content { get; set; }
        public string MediaUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }

        // Navigation Properties
        public User User { get; set; }
        public ICollection<Comment> Comments { get; set; }
    }
}
