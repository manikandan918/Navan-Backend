# Navan Contact Backend

Simple Express + Nodemailer API for the website contact form.

## Setup

1. Copy `.env.example` to `.env` and fill in your SMTP details.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Environment variables

- `EMAIL_HOST` – SMTP host (e.g. smtp.gmail.com)
- `EMAIL_PORT` – usually 587
- `EMAIL_USER` – your sending email address
- `EMAIL_PASS` – App Password (Gmail) or SMTP password
- `TO_EMAIL` – inbox that should receive enquiries
- `FRONTEND_URL` – allowed origin(s), comma-separated (e.g. https://yourdomain.com,http://localhost:3000)
- `PORT` – optional, defaults to 3001

## Gmail setup (for testing)

1. Enable 2-Step Verification on the Google account.
2. Create an App Password (Google Account → Security → App passwords).
3. Use that 16-character password as `EMAIL_PASS`.

## Deploy

Recommended platforms: Render, Railway, Fly.io, or any Node hosting.

After deployment, set the same environment variables in the platform dashboard and update the frontend `REACT_APP_API_URL`.

## Health check

GET `/health` returns `{ "status": "ok" }`.
