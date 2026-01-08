PocketAdvisor Seed Data

This folder contains mock seed data for development and demos. All IDs are randomized and do not map to real users.

Files
- users.json: ~10 users with basic profile and income information
- accounts.json: mock bank accounts linked to users
- budgets.json: per-user monthly budgets by category
- goals.json: per-user financial goals
- subscriptions.json: detected recurring charges per user
- transactions.jsonl: JSON Lines of transactions (one JSON object per line)

Notes
- Provider is "mock"; switch to Plaid/Finicity when ready.
- Timestamps are ISO-8601 strings in UTC.
- Amounts are in USD; negative amounts are outflows, positive are inflows.
- Data is intentionally small for quick testing; extend as needed.
