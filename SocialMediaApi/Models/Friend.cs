using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMediaApi.Models
{
    public class Friend
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid FriendId { get; set; }
        public string Status { get; set; } = "pending"; // pending, accepted, rejected
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User User { get; set; }
        public User FriendUser { get; set; }
    }
}
