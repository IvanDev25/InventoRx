# Use the official .NET 7.0 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the official .NET 7.0 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Api/Api.csproj", "Api/"]
RUN dotnet restore "Api/Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Api"
RUN dotnet build "Api.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Install Entity Framework tools
RUN dotnet tool install --global dotnet-ef --version 7.0.4

# Final stage/image
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Copy source code for EF migrations
COPY . /src/
WORKDIR /src/Api

# Install Entity Framework tools
RUN dotnet tool install --global dotnet-ef --version 7.0.4
ENV PATH="${PATH}:/root/.dotnet/tools"

# Set environment variables for production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

# Switch back to app directory
WORKDIR /app

# Create startup script to run migrations and start API
RUN echo '#!/bin/sh\nset -e\ncd /src/Api\necho "Running database migrations..."\ndotnet ef database update --verbose || echo "Migration failed, but continuing..."\ncd /app\necho "Starting API..."\ndotnet Api.dll' > /app/start.sh && chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]

