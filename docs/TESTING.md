# FinFlow end-to-end test checklist

## Prerequisites

1. Apply `supabase/migrations/202608290001_finflow_foundation.sql` in the Supabase SQL Editor.
2. Configure the Supabase URL and anonymous key using `.env.example`.
3. Add your local and deployed `/auth/update-password` URLs to Supabase Authentication redirect URLs.
4. Enable Google OAuth in Supabase only if you want to test Google sign-in.
5. Run `npm install`, `npm run check`, and `npm run dev`.

## Authentication

- Create an email account and confirm the verification message is accurate.
- Sign in with email/password and confirm navigation leaves `/auth`.
- Refresh the browser and confirm the session persists.
- Complete onboarding and confirm subsequent visits skip onboarding.
- Request a password reset, open the email link, set a new password, and sign in with it.
- Sign out from desktop and mobile navigation.

## Transactions and dashboard

- Create one expense and one income with different dates.
- Create an expense with tags, mood, notes, and recurrence.
- Attach an image or PDF receipt smaller than 8 MB.
- Edit both an expense and an income and refresh to verify persistence.
- Filter by type/date/text, change sorting, and test pagination after 10 records.
- Delete a test transaction and confirm it disappears after refresh.
- Verify dashboard totals, category chart, recent transactions, and monthly comparisons.
- Verify the calendar shows both positive income and negative spending on the correct dates.

## Planning and reports

- Change each category budget and refresh to confirm persistence.
- Verify budget totals use the configured pay date rather than the calendar month.
- Create a savings goal, add contributions, pause/resume it, and complete it.
- Verify analytics changes when transactions are added or edited.
- Open the previous-month report, test system sharing/copy fallback, and download the SVG.
- Export CSV and JSON from Settings and inspect the resulting files.

## Secondary features

- Create debts in both directions, record a partial payment, settle them, and delete a test debt.
- Create, edit, revalue, and delete an investment.
- Create and edit a wishlist item, then purchase it and confirm an expense is created exactly once.
- Create an overdue and a future reminder, mark one paid, reopen it, and delete it.
- Create a split with multiple participants, settle each person, verify the whole split closes, and delete it.

## UI and accessibility

- Test at 390px, 768px, 1024px, and 1440px widths.
- Confirm the mobile menu reaches every route.
- Test light, dark, AMOLED, and system themes.
- Navigate forms and dialogs using only the keyboard.
- Confirm focus indicators are visible and no page scrolls horizontally.
- Confirm the browser console contains no runtime errors.
