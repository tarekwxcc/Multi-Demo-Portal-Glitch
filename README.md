
# Tarek Multi-Demo-Portal Setup Guide

## Overview

This portal is designed to handle booking services for multiple verticals (e.g., Retail, Healthcare, Insurance). It integrates with Airtable and Stripe to manage products, transactions, and payments. Users can create and customize verticals to fit their demo or project needs.

## Walkthrough Videos

To guide you through the entire process, here are 3 video tutorials, plus a bonus video:

1. [Demo and value of the portal](https://app.vidcast.io/share/82eb400a-3959-4954-879b-60d171141b63)'(8min 52sec)
2. [Setting up the portal](https://app.vidcast.io/share/03ef95a2-8e49-4fed-b4b9-3f328ed66e73)'(9min 01sec)
3. [Customization and creating a new vertical for a custom demo](https://app.vidcast.io/share/03ef95a2-8e49-4fed-b4b9-3f328ed66e73)'(12min 44sec)
4. Bonus: [Preparing for my upcoming insurance demo](https://app.vidcast.io/share/6a7742a7-fc88-40df-98d6-4790dbfc6973)'(7min 37sec)

## Features:
- Customizable verticals
- Integration with Airtable for configuration management
- Integration with Stripe for payment processing
- Easy setup with .env variables
- Automated webhook handling for payment updates

## Prerequisites
To use this portal, you’ll need:
1. An Airtable account with an API key
2. A Stripe account for payment processing
3. A hosting service like Glitch (syncing with GitHub is recommended)

## Instructions

### Step 1: Airtable Setup

1. **Import the Airtable Base:**
   - [Click here to access and copy the Airtable base](https://airtable.com/appiuy3ZRMNu7BQLd/shrN4PkssfLMNGi3u). This base contains the two required tables: *Current Vertical* and *Configuration Table*.
   
2. **Retrieve API Details:**
   - Go to your Airtable account settings and retrieve your **AIRTABLE_API_KEY**.
   - In your imported base, copy the **AIRTABLE_BASE_ID** from the Airtable URL (e.g., airtable.com/{base_id}/...).

3. **Update the .env File:**
   - Create a `.env` file in your project. You can use the `remove.env.js` resource file (found in the repository), rename it to `.env`, and add the following variables:
     ```
     AIRTABLE_API_KEY=your_airtable_api_key
     AIRTABLE_BASE_ID=your_airtable_base_id
     AIRTABLE_VERTICAL_TABLE=Current Vertical
     AIRTABLE_CONFIG_TABLE=Configuration Table
     ```

### Step 2: Stripe Setup

1. **Create a Stripe Account:**
   - Go to [Stripe](https://stripe.com)' and create a test account.
   - In the dashboard, navigate to **API keys** and copy your **STRIPE_SECRET_KEY**.

2. **Setting Up Webhook Endpoint:**
   - In the Stripe dashboard, go to **Developers > Webhooks**, create a new webhook, and set the endpoint URL to your server’s `/webhook` route (e.g., `https://your-app.glitch.me/webhook`).
   - Select **payment_intent.succeeded** as the event to listen for and copy the **STRIPE_WEBHOOK_SECRET**.

3. **Update the .env File:**
   - Add these keys to the `.env` file:
     ```
     STRIPE_SECRET_KEY=your_stripe_secret_key
     STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
     ```

### Step 3: Sync with GitHub and Deploy to Glitch

1. **Import Project from GitHub:**
   - Fork the project from [tarekwxcc/Multi-Demo-Portal-Glitch](https://github.com/tarekwxcc/Multi-Demo-Portal-Glitch)'.
   - In Glitch, choose "Import from GitHub" and import the repository.

2. **Set Up .env:**
   - After importing, rename the `remove.env.js` file to `.env`, and fill in the details (e.g., Airtable, Stripe, webhook variables).

### Step 4: Build Your Own Vertical

1. **Customizing a Vertical:**
   - In the Airtable *Configuration Table*, add new verticals by creating new rows with appropriate action texts, product details, and statuses.

2. **Key Fields to Update:**
   - **actionText**: Text for UI elements like headers, buttons, and messages.
   - **productVerified**: Products/services associated with the vertical.
   - **currentStatusElements**: Manage the display of order status in the portal.

## Webhooks
- **SEND_PAYMENT_WEBHOOK_URL**: A payload is sent upon generating a payment link:
  ```json
  {
      "text": "Thank you for trusting us with your order. We have generated a secure payment link for you: {{paymentLink}}"
  }
  ```
- **CONFIRMATION_WEBHOOK_URL**: Receives payment confirmation data in the following format:
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

## Additional Resources
- `remove.env.js`: Use this resource to rename and set up your `.env` file.
- Webhook examples for SMS/WhatsApp (ensure correct setup with your phone number).
