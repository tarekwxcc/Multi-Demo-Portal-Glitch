
# Tarek Multi-Demo-Portal Setup Guide

## Overview

This portal is designed to handle booking services for multiple verticals (e.g., Retail, Healthcare, Insurance). It integrates with Airtable and Stripe to manage products, transactions, and payments. Users can create and customize verticals to fit their demo or project needs.

## Walkthrough Videos

To guide you through the entire process, here are 3 Vidcast tutorials:

1. **Tarek Multi-Demo-Portal, Part 1**: Demo and value of the portal (8 min 52 sec)
2. **Tarek Multi-Demo-Portal, Part 2**: Setting up the portal (9 min 01 sec)
3. **Tarek Multi-Demo-Portal, Part 3**: Customization and Creating a New Vertical for a Custom Demo (12 min 44 sec)

**Bonus Video**:
- **Tarek Multi-Demo-Portal, Bonus**: Preparing for my upcoming insurance demo (7 min 37 sec)

## Features

- Customizable verticals
- Integration with Airtable for configuration management
- Integration with Stripe for payment processing
- Easy setup with `.env` variables
- Automated webhook handling for payment updates

## Prerequisites

To use this portal, you’ll need:

1. An Airtable account with an API key
2. A Stripe account for payment processing
3. A hosting service like Glitch (syncing with GitHub is recommended)

## Step 1: Airtable Setup

1. **Importing the Airtable Base**:
    - Use this shared Airtable base link: [Airtable Base](https://airtable.com/appiuy3ZRMNu7BQLd/shrN4PkssfLMNGi3u)
    - Log into Airtable and copy the base to your own Airtable account.
    - This base contains the two required tables (`Current Vertical` and `Configuration Table`), so no need to modify these variables further.

2. **Retrieve API Details**:
    - In Airtable, go to **Account Overview** to retrieve your **AIRTABLE_API_KEY**.
    - You can find the **AIRTABLE_BASE_ID** in the Airtable URL (e.g., `airtable.com/{base_id}/...`).

## Step 2: Stripe Setup

1. **Create a Stripe Account**:
    - Sign up for a test account at [Stripe](https://stripe.com).
    - In your dashboard, go to the **API Keys** section and copy your **STRIPE_SECRET_KEY** (e.g., `sk_test_4eC39HqLyjWDarjtT1zdp7dc`).

2. **Setting Up Webhook Endpoint**:
    - In the Stripe dashboard, create a webhook endpoint, setting the URL to your server’s `/webhook` route (e.g., `https://your-app.glitch.me/webhook`).
    - Choose the event `payment_intent.succeeded` and copy your **STRIPE_WEBHOOK_SECRET** (e.g., `whsec_xxxxxxxx`).

## Step 3: Sync with GitHub & Deploy to Glitch

1. **Pull the Project from GitHub**:
    - Project link: [Tarek Multi-Demo-Portal-Glitch](https://github.com/tarekwxcc/Multi-Demo-Portal-Glitch)
    - You can pull the project into Glitch by using the repository link: `tarekwxcc/Multi-Demo-Portal-Glitch`.

2. **Import to Glitch**:
    - Once the project is imported into Glitch, proceed to the next step to set up your environment variables.

## Step 4: Setting Up Your .env File

1. **Import the `remove.env.js` Resource**:
    - Download `remove.env.js` from the project, rename it to `.env` after removing `.js`, and place it in the root of your project.
    - The .env file will include the default vertical table configurations (`AIRTABLE_VERTICAL_TABLE` and `AIRTABLE_CONFIG_TABLE`), but the rest of the variables will be left blank for you to fill in.

2. **Update the .env with Your Details**:
    - **Airtable**: 
        ```
        AIRTABLE_API_KEY=your_airtable_api_key
        AIRTABLE_BASE_ID=your_airtable_base_id
        ```
    - **Stripe**:
        ```
        STRIPE_SECRET_KEY=your_stripe_secret_key
        STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
        ```

3. **Webhook URLs**:
    - Set your webhook endpoints for payment and confirmation notifications:
        ```
        SEND_PAYMENT_WEBHOOK_URL=your_webhook_url_for_payment_notifications
        CONFIRMATION_WEBHOOK_URL=your_confirmation_webhook_url
        ```

4. **Payload Details**:
    - **SEND_PAYMENT_WEBHOOK_URL** will receive the following payload:
        ```json
        {
            "text": "Thank you for trusting us with your order. We have generated a secure payment link for you: {{paymentLink}}"
        }
        ```
    - **CONFIRMATION_WEBHOOK_URL** will receive a payload similar to:
        ```json
        {
            "transaction": {
                "id": "pi_3PvmYK2NQwEappxd0VzojF4V",
                "amount": 3500,
                "currency": "usd",
                "status": "succeeded",
                "customer": "Anonymous Customer",
                "paymentMethod": "pm_1PvmYJ2NQwEappxdwowcWxSI",
                "paymentDate": "2024-09-05T16:45:16"
            }
        }
        ```

## Step 5: Build Your Own Vertical

This step is covered in the video **"Tarek Multi-Demo-Portal, Part 3"**.

1. **Customizing the Vertical**:
    - In the Airtable `Configuration Table`, create a new row and fill in the details for a new vertical (e.g., action texts, product details).
    - You can use **BridgeIT ChatGPT** to help customize action texts or create new demo scenarios.

2. **Key Fields**:
    - **actionText**: Text for UI elements like headers, buttons, and confirmation messages.
    - **productVerified**: Stores products or services for a vertical.
    - **currentStatusElements**: Manages how order status is displayed in the portal.
    - **orderPageElements**: Handles order form UI elements.

---

### FAQs

**How do I add a new vertical?**
- Go to the `Configuration Table` in Airtable, add a new row, and fill in the details for the new vertical (e.g., action texts, product details).

**How do I set up Stripe in test mode?**
- Stripe defaults to test mode for test accounts. Ensure you're using test cards for transactions.

**How do I view payment confirmations?**
- Payment confirmations are sent via the webhook to your specified endpoint and will be displayed on the confirmation page.

**How do I deploy changes from GitHub?**
- Sync your Glitch project with GitHub, and changes will be deployed when you push updates to the main branch.
