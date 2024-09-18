**Tarek Multi-Demo-Portal Setup Guide**

**Overview**

This portal is designed to handle booking services for multiple verticals (e.g., Retail, Healthcare, Insurance). It integrates with Airtable and Stripe to manage products, transactions, and payments. Users can create and customize verticals to fit their demo or project needs.

**Walkthrough Videos**

To guide you through the entire process, here are 3 video tutorials:

	1. Demo : Showing the value of the portal and how it can be used.
	2. Deployment : Setting up Airtable & Stripe Integration & Deploying the Portal to Glitch
	3. Creating a New Vertical for a Custom Demo

**Features:**

	•	Customizable verticals
	•	Integration with Airtable for configuration management
	•	Integration with Stripe for payment processing
	•	Easy setup with .env variables
	•	Automated webhook handling for payment updates

**Prerequisites**

To use this portal, you’ll need:

	1.	An Airtable account with an API key
	2.	A Stripe account for payment processing
	3.	A hosting service like Glitch (syncing with GitHub is recommended)

**Instructions**

You can also review the video instuctation on Vidcast : "Deployment : Setting up Airtable & Stripe Integration & Deploying the Portal to Glitch"

**Step 1: Airtable Setup**

	1.	Importing the Airtable Base:
	•	Download and import the provided Airtable base that contains the two required tables (Current Vertical and Configuration Table).
	•	After importing, you can view and customize the verticals, product information, and other configurations for the portal.
	2.	Retrieve API Details:
	•	Go to your Airtable account settings and retrieve your AIRTABLE_API_KEY.
	•	In your imported base, copy the AIRTABLE_BASE_ID. You can find it in the Airtable URL (airtable.com/{base_id}/...).
	3.	Updating .env Variables:
	•	Create a .env file in your project and add the following variables:
 
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_VERTICAL_TABLE=Current Vertical
AIRTABLE_CONFIG_TABLE=Configuration Table

Note:	By importing the base, you will already have the two tables required (Current Vertical and Configuration Table), so no need to modify these variables further.

**Step 2: Stripe Setup**

	1.	Create a Stripe Account:
	•	Go to Stripe and create a test account.
	•	In the Stripe dashboard, go to the API keys section and copy your STRIPE_SECRET_KEY.
	2.	Setting Up Webhook Endpoint:
	•	Create a new webhook endpoint in the Stripe dashboard and set the endpoint URL to your server’s /webhook route (e.g., https://your-app.glitch.me/webhook).
	•	Select the events you want to listen for (e.g., payment_intent.succeeded).
	•	Copy your STRIPE_WEBHOOK_SECRET after setting up the endpoint.
	3.	Update the .env File:
	•	Add the following Stripe keys:

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

**Step 3: Sync with GitHub & Deploy to Glitch**

	1.	Syncing with GitHub:
	•	Fork the repository from GitHub.
	•	Go to Glitch and select “Import from GitHub” to pull the project into Glitch.
	•	Once the project is imported, go to the .env file in Glitch and paste your Airtable and Stripe credentials.
	2.	Updating Webhook URLs:
	•	In the .env file, you’ll also need to add the following webhook variables:

SEND_PAYMENT_WEBHOOK_URL=your_webhook_url_for_payment_notifications
CONFIRMATION_WEBHOOK_URL=your_confirmation_webhook_url

	•	These URLs are where payment updates and confirmations will be sent. (I'll attach examples to the Vidcast library).

**Step 4: Build Your Own Vertical** 
I am tackeling this one on a seperate Vidcast called : "Customization : Creating a New Vertical for a Custom Demo"

	1.	Customizing the Vertical:
	•	In the Airtable Configuration Table, you can create new verticals by adding new records and configuring them with appropriate action texts, product details, and transaction statuses.
	•	You can use [BridgeIT ChatGPT] for help customizing action texts or creating new demo scenarios for different customers.
	2.	Key Fields to Update:
	•	actionText: Contains the text for UI elements like headers, buttons, and confirmation messages.
	•	productVerified: Stores the products or services associated with a vertical.
	•	currentStatusElements: Manages how the current status of an order is displayed in the portal.
	•	orderPageElements

 
**FAQs**

1. How do I add a new vertical?

	•	Simply go to the Configuration Table in Airtable, add a new row, and fill in the details for the new vertical (e.g., action texts, product details).

2. How do I set up Stripe in test mode?

	•	Stripe automatically defaults to test mode if you’re using a test account. No further steps are needed, just ensure your test card is used for transactions.

3. How do I view payment confirmations?

	•	You will receive payment confirmations through the webhook, which will be displayed on the portal’s confirmation page.

4. How do I deploy changes from GitHub?

	•	Sync your Glitch project with GitHub, and updates will be automatically deployed when you push changes to the main branch.
