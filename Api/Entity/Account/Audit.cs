using System;

namespace Api.Entity.Account
{
    public class Audit
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedToday { get; set; }
    }
}
