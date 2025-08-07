# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the public API documentation repository for Microfeed - a headless CMS system that allows programmatic creation, updating, and deletion of items, plus channel metadata management. The project supports both public Feed API endpoints (no authentication required) and authenticated Admin API endpoints.

## Architecture

- **Single Documentation Repository**: Contains only OpenAPI specification files
- **API-First Design**: The OpenAPI spec defines the complete REST API surface
- **Two API Categories**:
  - **Feed API**: Public read-only endpoints for JSON feed and individual items
  - **Admin API**: Authenticated CRUD operations requiring API key

## Key Components

### API Specification
- Location: `api-docs/openapi.yaml`
- Format: OpenAPI 3.1.0
- Server: https://titi.li (production)
- Version: 0.1.5

### Core Entities
- **Feed/Channel**: Contains metadata, subscription methods, and categories (podcast support)
- **Items**: Individual content pieces with attachments (audio, video, images, documents, external URLs)
- **Media Files**: Handled via R2 presigned URLs for upload

### Key Features
- JSON Feed format compliance (jsonfeed.org/version/1.1/)
- Apple Podcasts integration with iTunes-specific metadata
- Pagination support with cursor-based navigation
- Multiple content types (audio, video, image, document, external URL)
- Media file upload via R2 presigned URLs

## API Authentication
- Admin API requires `X-MicrofeedAPI-Key` header
- Feed API endpoints are publicly accessible
- API keys obtained from https://titi.li/admin/settings/

## Development Notes
- No build system or source code in this repository
- Changes should be made directly to the OpenAPI specification
- API follows REST conventions with appropriate HTTP methods
- All timestamps use RFC 3339 format
- Supports both episodic and serial podcast types