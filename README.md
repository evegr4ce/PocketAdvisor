# Pocket Advisor
*What’s in your pocket*

Smart subscription tracking, affordability limits, and personalized financial guidance to help you build financial margin—especially for middle- and lower-income users.

---

## Overview

Pocket Advisor goes beyond tracking spending. It analyzes how much you actually use your subscriptions, determines what you can realistically afford, and provides actionable guidance through an integrated chatbot.

Instead of only showing transactions, Pocket Advisor answers:
- what to keep vs cancel
- what you can afford (housing, auto, vacation)
- what changes will improve your financial margin

---

## Key Features

### Financial Wellness Score
- Real-time **wellness score** based on income, essential expenses, and discretionary spending
- **Action steps** to improve financial wellness

### Subscription Usage Intelligence (Cost-per-Use)
- Detects recurring subscriptions
- Tracks **how much you used a subscription in a month**
- Calculates **cost per use**
- Gives advice:
  - **Keep** (high value)
  - **Remove** (low usage / high cost)
  - **Better alternative** (when your usage pattern fits a cheaper plan/service)

Example insight:
> “Canceling this funds 3 weeks of groceries or $500 toward emergency savings in 4 months.”

### Smart Optimize
- Identifies low-usage, high-cost subscriptions
- One-click **Optimize** suggests subscriptions to cut for maximum impact

### Affordability Engine
Safe affordability caps based on real income + required expenses:
- **Housing**
- **Auto loans**
- **Vacations**
Shows caps, headroom, and risk level.

### AI Chat Advisor
Ask questions based on your data:
- “Is my spending this month okay?”
- “Which subscriptions should I cancel?”
- “Can I afford a $400 car payment?”
Answers use your income, essentials, spending, subscriptions, and goals.

---

## Screenshots

> Put these images in the repo root (same folder as this README), or update the paths to wherever you store them.

### Notes / Planning
![Notes](./280c8c99-b017-42c0-9e48-0a2be3589708.png)

### Tech Stack / Roles
![Tech Stack](./510cc5bb-c0da-459d-a178-1f074dcf1f07.png)

### Landing
![Landing](./9fa933e6-f431-451c-a00b-de94ebc0180f.png)

### Income Setup
![Income](./fe740e46-4957-4578-8369-5d480f5828db.png)

### Essential Expenses
![Expenses](./fc2d8283-ee84-46c4-a682-0bcf089c5d36.png)

### Dashboard
![Dashboard](./176b2530-e430-42c2-a86c-21b70fac9f6c.png)

### Subscriptions + Optimize
![Subscriptions](./440ae972-e8e1-4513-8be0-5f7f9b07c4a7.png)

### Housing Affordability
![Housing](./34289f28-c721-44da-a08f-1fc9ea40c8ab.png)

---

## How It Works

1. **User inputs**
   - income + pay frequency
   - essentials (rent, utilities, groceries, insurance, minimum debt)
   - goals (optional)

2. **Analysis**
   - identifies subscriptions from recurring charges
   - calculates monthly usage + cost-per-use
   - computes safe affordability caps + risk level

3. **Outputs**
   - keep/remove/alternative subscription recommendations
   - safe-to-spend number and affordability headroom
   - chatbot answers grounded in the user’s numbers

---

## Tech Stack

- **Web app**
- **Frontend:** React
- **Backend:** Firebase
- **Data:** Seeded demo data (fake accounts for hackathon)

**Team**
- Backend: Helen, Evelyn
- Frontend: Daniel, Savya

---

## Future Enhancements

- Live bank integration (Plaid)
- Auto-downgrade / auto-pause subscription actions
- More alternative recommendations (plans, bundles)
- Expanded affordability models and coaching
