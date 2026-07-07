# IMPLEMENTATION_PLAN.md

# Smart PNR Status Tracker

## Project Goal

Build a production-ready railway PNR tracking platform inspired by Ixigo using modern web technologies and cloud-native architecture.

**Tech Stack**

* Next.js 15 (App Router)
* React 19
* TypeScript
* Auth.js v5
* Prisma ORM
* PostgreSQL
* TanStack Query
* Tailwind CSS
* shadcn/ui
* Docker
* GitHub Actions
* Google Cloud Run
* Google Cloud Storage

---

# Development Principles

* Build feature-by-feature.
* Every feature must be production-ready before moving on.
* Every Pull Request should be independently deployable.
* Maintain strict TypeScript typing.
* Prefer Server Components unless client-side interactivity is required.
* Keep business logic separate from UI.
* Follow feature-based architecture.
* Every API should include validation, authentication, and error handling.
* Every completed feature must include tests.

---

# Milestone 1 — Project Setup

## Objectives

Initialize the project and establish the development environment.

### Tasks

* Create Next.js project with App Router
* Configure TypeScript
* Configure ESLint
* Configure Prettier
* Configure Husky
* Configure lint-staged
* Configure Tailwind CSS
* Install shadcn/ui
* Install Lucide Icons
* Configure absolute imports
* Create `.env.example`
* Configure environment validation with Zod
* Create feature-based folder structure

### Deliverables

* Project runs locally
* Lint passes
* TypeScript passes
* Base layout renders successfully

---

# Milestone 2 — Database Setup

## Objectives

Create the database architecture.

### Tasks

* Configure PostgreSQL
* Configure Prisma
* Create Prisma schema
* Generate Prisma client
* Create migrations
* Create seed script

### Models

* User
* Account
* Session
* VerificationToken
* FavoritePNR
* SearchHistory
* Booking
* Notification
* AuditLog

### Deliverables

* Database migrated
* Seed data available
* Prisma Studio working

---

# Milestone 3 — Authentication

## Objectives

Implement secure authentication.

### Features

* Register
* Login
* Logout
* Google OAuth
* Credentials Login
* Protected Routes
* Middleware
* Session Handling

### Pages

* Login
* Register
* Forgot Password
* Reset Password

### Deliverables

* Users can authenticate securely
* Protected routes work correctly

---

# Milestone 4 — Application Layout

## Objectives

Build reusable layouts.

### Components

* Navbar
* Sidebar
* Footer
* User Menu
* Theme Toggle
* Command Palette
* Breadcrumbs
* Mobile Navigation

### Deliverables

* Responsive layout
* Dark mode
* Navigation complete

---

# Milestone 5 — Dashboard

## Objectives

Create the dashboard.

### Widgets

* Welcome Card
* Statistics Cards
* Recent Searches
* Favourite PNRs
* Quick Actions
* Latest Updates

### Deliverables

* Dashboard fully responsive
* Widgets populated from database

---

# Milestone 6 — Live PNR Search

## Objectives

Implement the core feature.

### Features

* Search input
* Validation
* Loading state
* Error handling
* Skeleton loader
* Live polling (30 seconds)
* Copy PNR
* Share
* Save Favourite

### API

GET /api/pnr/[pnr]

### Deliverables

* Live updates without page reload
* No browser caching
* Reliable polling

---

# Milestone 7 — Favourite PNRs

## Objectives

Implement favourites.

### Features

* Add Favourite
* Remove Favourite
* Rename Favourite
* Pin Favourite
* Search
* Sort

### Deliverables

* CRUD complete
* Optimistic UI updates

---

# Milestone 8 — Search History

## Objectives

Track searches.

### Features

* Auto-save searches
* Pagination
* Filters
* Search
* Delete history

### Deliverables

* Server-side pagination
* Indexed queries

---

# Milestone 9 — Booking History

## Objectives

Manage booking history.

### Features

* Paginated table
* Search
* Filter
* Sort
* Export CSV
* Export PDF

### Deliverables

* Efficient pagination
* Export functionality

---

# Milestone 10 — Profile

## Objectives

Implement user profile management.

### Features

* Edit profile
* Upload avatar
* Change password
* Delete account

### Storage

Google Cloud Storage

### Deliverables

* Secure profile management
* Avatar uploads working

---

# Milestone 11 — Notifications

## Objectives

Create notification system.

### Features

* Toast notifications
* Notification center
* Mark as read
* Delete notifications

### Deliverables

* Real-time user feedback

---

# Milestone 12 — Settings

## Features

* Theme
* Language
* Notification Preferences
* Auto Refresh Interval

### Deliverables

* Persistent user preferences

---

# Milestone 13 — Admin Module (Optional)

### Features

* Dashboard
* User Management
* Analytics
* API Usage
* Audit Logs

### Deliverables

* Role-based admin access

---

# Milestone 14 — Security

## Tasks

* Rate limiting
* Input sanitization
* Zod validation
* Secure cookies
* CSP headers
* CSRF protection
* Audit logging

### Deliverables

* Security review completed

---

# Milestone 15 — Testing

## Unit Tests

* Components
* Utilities
* Hooks

## Integration Tests

* APIs
* Database

## E2E Tests

* Authentication
* PNR Search
* Favourites
* Booking History

### Tools

* Vitest
* React Testing Library
* Playwright

---

# Milestone 16 — Docker

## Tasks

* Multi-stage Dockerfile
* docker-compose.yml
* PostgreSQL container
* Health checks

### Deliverables

* Local development with Docker
* Production-ready image

---

# Milestone 17 — CI/CD

## GitHub Actions Pipeline

### On Pull Request

* Install dependencies
* Lint
* Type check
* Unit tests
* Build

### On Merge to main

* Build Docker image
* Push to Artifact Registry
* Run Prisma migrations
* Deploy to Cloud Run
* Verify health endpoint

### Deliverables

* Fully automated deployment

---

# Milestone 18 — Google Cloud

## Services

* Cloud Run
* Cloud Storage
* Artifact Registry
* Secret Manager
* Cloud Logging
* Cloud Monitoring

### Deliverables

* Production deployment completed

---

# Milestone 19 — Documentation

## Create

* README.md
* API Documentation
* Architecture Diagram
* ER Diagram
* Deployment Guide
* Docker Guide
* Contributing Guide
* Environment Setup Guide

---

# Final Acceptance Criteria

The project is considered complete when:

* All authentication flows work.
* Live PNR updates refresh without reloading.
* Booking history supports pagination, filtering, and export.
* Favourite PNR management is fully functional.
* Profile images upload to Google Cloud Storage.
* Responsive UI works on mobile, tablet, and desktop.
* Dark mode is supported.
* Test suite passes.
* Docker build succeeds.
* CI/CD deploys automatically to Google Cloud Run.
* Health and readiness endpoints return successful responses.
* Documentation is complete.

---

# Suggested Sprint Plan

| Sprint    | Focus                                      |
| --------- | ------------------------------------------ |
| Sprint 1  | Project setup, tooling, Docker             |
| Sprint 2  | Prisma schema and PostgreSQL               |
| Sprint 3  | Authentication                             |
| Sprint 4  | Shared layouts and UI components           |
| Sprint 5  | Dashboard                                  |
| Sprint 6  | Live PNR search                            |
| Sprint 7  | Favourite PNRs                             |
| Sprint 8  | Search and booking history                 |
| Sprint 9  | Profile and Google Cloud Storage           |
| Sprint 10 | Notifications and settings                 |
| Sprint 11 | Testing and performance                    |
| Sprint 12 | CI/CD, Cloud Run deployment, documentation |

---

# Definition of Done

A task is complete only if:

* Functionality is implemented.
* UI is responsive.
* TypeScript has no errors.
* ESLint passes.
* Tests pass.
* Documentation is updated.
* Code follows project architecture.
* Feature is deployable without breaking existing functionality.
