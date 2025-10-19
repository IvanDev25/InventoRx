using Api.Data;
using Api.Interface;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Linq;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Your API",
        Version = "v1"
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token.\n\nExample: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


builder.Services.AddDbContext<Context>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// be able to inject JWTService class inside our contorllers
builder.Services.AddScoped<JWTService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<ICustomPlayerServiceAsync, CustomPlayerServiceAsync>();
builder.Services.AddScoped<ICustomTeamServiceAsync, CustomTeamServiceAsync>();
builder.Services.AddScoped<ICustomManagerServiceAsync, CustomManagerServiceAsync>();
builder.Services.AddScoped<ICustomCategoryServiceAsync, CustomCategoryServiceAsync>();
builder.Services.AddScoped<ICustomAdminPermissionAsync, CustomAdminPermissionAsync>();
builder.Services.AddScoped<ICustomPatientServiceAsync, CustomPatientServiceAsync>();
builder.Services.AddScoped<ICustomMedicineSupplierServiceAsync, CustomMedicineSupplierServiceAsync>();
builder.Services.AddScoped<ICustomMedicineServiceAsync, CustomMedicineServiceAsync>();
builder.Services.AddScoped<ICustomAuditServiceAsync, CustomAuditServiceAsync>();
builder.Services.AddScoped<IDapperServiceAsync, DapperServiceAsync>();

//defining our IdentityCore Service
builder.Services.AddIdentityCore<User>(options =>
{
    //password configuration
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    // for email confimation
    options.SignIn.RequireConfirmedEmail = true;
})
    .AddRoles<IdentityRole>() //be able to add roles
    .AddRoleManager<RoleManager<IdentityRole>>()// be able to make sue of RoleManager
    .AddEntityFrameworkStores<Context>()// providing our context
    .AddSignInManager<SignInManager<User>>() // make use of Signin manager
    .AddUserManager<UserManager<User>>() //make use of UserManager to create users
    .AddDefaultTokenProviders(); // be able to create tokens for email confirmation

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        //validate te token based on the key we have provided inside appsettngs.development.json JWT:Key
        ValidateIssuerSigningKey = true,
        // the issuer signing key based on the JWTKey
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
        // the issuer which in here is the api project url we are using
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        //validate the iisuer (who ever is issuing the JWT)
        ValidateIssuer = true,
        // dont validate audience (angular side)
        ValidateAudience = false
    };
});



builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = actionContext =>
    {
        var errors = actionContext.ModelState.Where(x => x.Value.Errors.Count > 0)
        .SelectMany(x => x.Value.Errors)
        .Select(x => x.ErrorMessage).ToArray();

        var toReturn = new
        {
            Errors = errors
        };
        return new BadRequestObjectResult(toReturn);
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("https://localhost:4200", "http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowAngularApp");


if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//adding UseAuthentication into our pipeline and this should come before UseAuthorizaton
//Authetication verifies the identity of a user or service, and authorization determines their access rigt.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
