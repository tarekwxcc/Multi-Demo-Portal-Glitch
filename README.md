
# Tarek Multi-Demo-Portal Setup Guide

## Overview

This portal is designed to handle booking services for multiple verticals (e.g., Retail, Healthcare, Insurance). It integrates with Airtable and Stripe to manage products, transactions, and payments. Users can create and customize verticals to fit their demo or project needs.

## Walkthrough Videos

To guide you through the entire process, here are 3 video tutorials, plus a bonus video:

1. [Demo and value of the portal](https://app.vidcast.io/share/82eb400a-3959-4954-879b-60d171141b63)'(8min 52sec)
2. [Setting up the portal](https://app.vidcast.io/share/03ef95a2-8e49-4fed-b4b9-3f328ed66e73)'(9min 01sec)
3. [Customization and creating a new vertical for a custom demo](https://app.vidcast.io/share/62c3d3a2-2904-4429-bd6f-7daa14649293)'(12min 44sec)
4. Bonus: [Preparing for my upcoming insurance demo](https://app.vidcast.io/share/6a7742a7-fc88-40df-98d6-4790dbfc6973)'(7min 37sec)

## Features:
- Customizable verticals
- Integration with Airtable for configuration management
- Integration with Stripe for payment processing
- Easy setup with .env variables
- Webex Connect webhook handling payment updates 
- Webex Connect webhook handling confirmations

## Prerequisites
To use this portal, you’ll need:
1.	An Airtable account with a Personal Access Token (due to the deprecation of API keys)
2. A Stripe account for payment processing
3. A hosting service like Glitch (syncing with GitHub is recommended)

## Instructions

### Step 1: Airtable Setup

1. **Import the Airtable Base:**
   - [Click here to access and copy the Airtable base](https://airtable.com/appiuy3ZRMNu7BQLd/shrN4PkssfLMNGi3u). This base contains the two required tables: *Current Vertical* and *Configuration Table*.
   
2.	**Retrieve Personal Access Token and API Details:**
	•	Go to your Airtable account settings and create a Personal Access Token (since API keys are deprecated).
	•	In your imported base, copy the AIRTABLE_BASE_ID from the Airtable URL (e.g., airtable.com/{base_id}/…).

3. **Take note of the .env File:**
   - On step 6, we will update a `.env` file in a glitch project. On the step we need to take note of the following variables:
     ```
     AIRTABLE_API_KEY=your_personal_access_token
     AIRTABLE_BASE_ID=your_airtable_base_id
     AIRTABLE_VERTICAL_TABLE=Current Vertical (unchanged)
     AIRTABLE_CONFIG_TABLE=Configuration Table (unchanged)
     ```

### Step 2: Import from GitHub and Deploy to Glitch

1. **Import Project from GitHub:**
   - Fork the project from [tarekwxcc/Multi-Demo-Portal-Glitch](https://github.com/tarekwxcc/Multi-Demo-Portal-Glitch)'.
   - In Glitch, choose "Import from GitHub" and import the repository.
   - Take note of the github URL (optional : you can update the URL to a significant name on Settings/Edit project details)

### Step 3: Stripe Setup

**High-level instructions** (if the high-level instructions aren't clear enough, detailed instructions of Step 3 are next)

1. **Create a Stripe Account:**
   - Go to [Stripe](https://stripe.com)' and create a test account.
   - In the dashboard, navigate to **API keys** and copy your **STRIPE_SECRET_KEY**.

2. **Setting Up Webhook Endpoint:**
   - In the Stripe dashboard, go to **Developers > Webhooks**, create a new webhook, and set the endpoint URL to your glitch link adding `/webhook` at the end (e.g., `https://your-app.glitch.me/webhook`).
   - Select **payment_intent.succeeded** as the event to listen for and copy the **STRIPE_WEBHOOK_SECRET**.

3. **Take note of the .env values:**
   - You'll add these keys to the `.env` file in step 6, you can take note of them for now : 
     ```
     STRIPE_SECRET_KEY=your_stripe_secret_key
     STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
     ```

**Detailed Stripe Instructions:**

1. Setting up the Stripe Secret Key:

In order to connect Stripe with your portal for payment processing, follow these steps:

	•	Go to Stripe’s website and log in or create an account.
	•	Once logged in, in home view, navigate to developers. On the right-hand upper corner.
	•	Under the Developers section, find and click on API Keys, the second tab.
	•	Here, you will see your Publishable Key and Secret Key. You need the Secret Key. Click on Reveal Test Key since you are in test mode, and copy the Secret Key.
	•	You'll paste this into your .env file under the variable STRIPE_SECRET_KEY, you can take note of it for now.

Example:

STRIPE_SECRET_KEY=your_stripe_secret_key

2. Setting up the Stripe Webhook Endpoint:

Before setting up your Glitch URL, you need to first set up Stripe with a placeholder URL for the webhook. You will update this once your Glitch project is deployed:

	•	In the Stripe dashboard, click on Developers from the left-hand menu, and then go to Webhooks.
	•	Click on Add endpoint to create a new webhook. In the field Endpoint URL, add your `https://your-app.glitch.me/webhook` URL (you can set a placeholder URL for now but please remember to update it with the glitch link).
   •	Under Events to send, select payment_intent.succeeded (this event is triggered when a payment is successfully made).
	•	Click Add endpoint to complete the setup.
	•	Copy the Webhook Signing Secret that appears in the dashboard after creating the webhook, under signing secret you need to click on Reveal. This will be used as the STRIPE_WEBHOOK_SECRET in your .env file. You can note it for now.

### Step 5: Create Webex Connect Webhooks

## Webhooks usage
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

## Webhooks creation
Webhook examples that I use are provided on the [OneDrive link](https://cisco-my.sharepoint.com/my?id=%2Fpersonal%2Ftayadi%5Fcisco%5Fcom%2FDocuments%2FTarek%20Mult%2DDemo%2DPortal%20resources). You can import to get started
- MultiDemoPortal Send Payment Link.worflow. This is an example of the **SEND_PAYMENT_WEBHOOK_URL** that will receive the paiment link for SMS/WhatsApp (ensure correct setup with your phone number). 
- MultiDemoPortal Send Payment Confirmation.workflow. This is an example for **CONFIRMATION_WEBHOOK_URL** that will receive the payment confirmation data, be sure to update the email address that will receive the information, or you can come up with how you want to transfer the information to your "customer" and how to format the payload received.


### Step 6: Update .env variables from previously created elements 

1. **Set Up .env:**
   - You can import into glitch provided file named `remove.env.js` to avoid having to create all variables. 
   - Rename the `remove.env.js` file to `.env`, and fill in the previously noted details (e.g., Airtable, Stripe, webhook variables). Here is the complete list : 

AIRTABLE_API_KEY=your_airtable_api_key_or_personal_access_token
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_VERTICAL_TABLE=Current Vertical (unchanged)
AIRTABLE_CONFIG_TABLE=Configuration Table (unchanged)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SEND_PAYMENT_WEBHOOK_URL=your_webhook_url_for_payment_notifications
CONFIRMATION_WEBHOOK_URL=your_confirmation_webhook_url

### Step 7: Build Your Own Vertical

1. **Customizing a Vertical:**
   - In the Airtable *Configuration Table*, add new verticals by creating new rows with appropriate action texts, product details, and statuses.

2. **Key Fields to Update:**
   - **actionText**: Text for UI elements like headers, buttons, and messages.
   - **productVerified**: Products/services associated with the vertical.
   - **currentStatusElements**: Manage the display of order status in the portal.

You can view Vidcasts 3. [Customization and creating a new vertical for a custom demo](https://app.vidcast.io/share/62c3d3a2-2904-4429-bd6f-7daa14649293)'(12min 44sec) & 4. Bonus: [Preparing for my upcoming insurance demo](https://app.vidcast.io/share/6a7742a7-fc88-40df-98d6-4790dbfc6973)'(7min 37sec) for more details.