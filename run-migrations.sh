#!/bin/bash
# Script to manually run database migrations on Render
# You can run this via Render's Shell or as part of the build process

set -e

echo "========================================="
echo "Running Database Migrations"
echo "========================================="

cd Api

echo "Checking EF tools installation..."
dotnet tool list -g | grep dotnet-ef || dotnet tool install --global dotnet-ef --version 7.0.4

echo "Adding dotnet tools to PATH..."
export PATH="$PATH:/root/.dotnet/tools"

echo "Running migrations..."
dotnet ef database update --verbose

echo "========================================="
echo "Migrations completed successfully!"
echo "========================================="

