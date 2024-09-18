const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const axios = require("axios");
const Airtable = require("airtable");
const app = express();

// Set up Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Middleware to handle raw body for webhooks on /webhook
app.post('/webhook', express.raw({ type: 'application/json' })); // Use express.raw for the Stripe webhook only

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

// Route: Home Page (GET)
app.get("/", async (req, res) => {
    try {
        const verticalRecords = await base(process.env.AIRTABLE_VERTICAL_TABLE).select({ maxRecords: 1 }).firstPage();

        if (verticalRecords.length === 0 || !verticalRecords[0].fields['Vertical']) {
            return res.status(404).send("No active verticals found in Airtable.");
        }

        const activeVertical = verticalRecords[0].fields['Vertical'];

        const configRecords = await base(process.env.AIRTABLE_CONFIG_TABLE).select({
            filterByFormula: `{Vertical} = '${activeVertical}'`
        }).firstPage();

        if (configRecords.length > 0) {
            const actionTextsField = configRecords[0].fields['actionText'];
            const actionTexts = actionTextsField ? JSON.parse(actionTextsField) : {};

            const headerText = actionTexts.headerText || "Default Header";
            const footerText = actionTexts.footerText || "Default Footer Text";
            const welcomeText = actionTexts.welcomeText || "Welcome";
            const instructionText = actionTexts.instructionText || "Select an option to get started:";
            const verifyText = actionTexts.verifyText || "Verify";
            const initiateOrderText = actionTexts.initiateOrderText || "Initiate Order";
            const verifyPaymentText = actionTexts.verifyPaymentText || "Verify Payment";
            const homeText = actionTexts.homeText || "Home";  // New: Dynamic Home button text

            res.render("index", {
                headerText,
                footerText,
                welcomeText,
                instructionText,
                verifyText,
                initiateOrderText,
                verifyPaymentText,
                homeText
            });
        } else {
            res.render("index", {
                headerText: "Default Header",
                footerText: "Default Footer Text",
                welcomeText: "Default Welcome Text",
                instructionText: "Default Instruction Text",
                verifyText: "Default Verify Text",
                initiateOrderText: "Default Initiate Order Text",
                verifyPaymentText: "Default Verify Payment Text",
                homeText: "Home"
            });
        }
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Route: Verify Input Page (GET)
app.get("/verify", async (req, res) => {
    try {
        // Fetch the current active vertical(s) from the "Current Vertical" table
        const verticalRecords = await base('Current Vertical').select({}).firstPage();
        const activeVertical = verticalRecords[0].fields['Vertical'];

        // Fetch the configuration for the active vertical from the "Configuration Table"
        const configRecords = await base('Configuration Table').select({
            filterByFormula: `{Vertical} = '${activeVertical}'`
        }).firstPage();

        if (configRecords.length > 0) {
            // Safely parse the JSON
            const actionTextsField = configRecords[0].fields['actionText'];
            const actionTexts = actionTextsField ? JSON.parse(actionTextsField) : {};

            // Extract dynamic texts
            const verifyText = actionTexts.verifyText || "Verify";
            const headerText = actionTexts.headerText || "Default Header";
            const footerText = actionTexts.footerText || "Default Footer Text";
            const instructionText = actionTexts.instructionText || "Enter the details below:";
            const productLabel = actionTexts.productLabel || "Product ID";
            const homeText = actionTexts.homeText || "Home"; // Dynamic Home text
            const initiateOrderText = actionTexts.initiateOrderText || "Initiate Order";
            const verifyPaymentText = actionTexts.verifyPaymentText || "Verify Payment";

            // Render the verify page with dynamic content
            res.render("verify", {
                verifyText,
                headerText,
                footerText,
                instructionText,
                productLabel,
                homeText, // Add homeText to the response
                initiateOrderText,
                verifyPaymentText
            });
        } else {
            // Render a generic error message or fallback view
            res.status(404).send("Configuration not found for the selected vertical.");
        }
    } catch (error) {
        console.error("Error fetching configuration from Airtable:", error);
        res.status(500).send('Server Error');
    }
});

// Route: Handle Verify (POST) and Render Current Status
app.post("/verify", async (req, res) => {
    const { productId, serialNumber } = req.body;

    // Fetch the current active vertical from the "Current Vertical" table
    const verticalRecords = await base('Current Vertical').select({}).firstPage();
    const activeVertical = verticalRecords[0].fields['Vertical'];

    // Fetch the configuration for the active vertical from the "Configuration Table"
    const configRecords = await base('Configuration Table').select({
        filterByFormula: `{Vertical} = '${activeVertical}'`
    }).firstPage();

    if (configRecords.length > 0) {
        // Safely parse the JSON fields
        const actionTextsField = configRecords[0].fields['actionText'];
        const actionTexts = actionTextsField ? JSON.parse(actionTextsField) : {};
        const productVerifiedField = configRecords[0].fields['productVerified'];
        const productVerified = productVerifiedField ? JSON.parse(productVerifiedField) : {};

        // Extract product information
        const productInfo = productVerified[productId] || {};

        // Check if the product exists and if the serial number matches
        if (productInfo.serialNumber === serialNumber) {
            res.render("current-status", {
                productInfo,
                headerText: actionTexts.headerText || "Current Status",
                footerText: actionTexts.footerText || "All rights reserved.",
                statusHeader: actionTexts.statusHeader || "Status Details",
                detailsTitle: actionTexts.detailsTitle || "Details",
                productLabel: actionTexts.productLabel || "Product Name",
                serialLabel: actionTexts.serialLabel || "Serial Number",
                statusLabel: actionTexts.statusLabel || "Status",
                amountLabel: actionTexts.amountLabel || "Total Amount",
                verticalName: activeVertical,
                homeText: actionTexts.homeText || "Home", // Dynamic Home text
                initiateOrderText: actionTexts.initiateOrderText || "Initiate Order", // Dynamic Initiate Order text
                verifyText: actionTexts.verifyText || "Verify", // Add verifyText to the render
                verifyPaymentText: actionTexts.verifyPaymentText || "Verify Payment" // Dynamic Verify Payment text
            });
        } else {
            // If verification fails, render an error message
            res.status(404).send("Product ID or Serial Number not found.");
        }
    } else {
        // If no configuration is found for the vertical
        res.status(404).send("Configuration not found for the selected vertical.");
    }
});

// Route: Current Status Page (GET)
app.get("/current-status", async (req, res) => {
    try {
        // Fetch the current active vertical(s) from the "Current Vertical" table
        const verticalRecords = await base('Current Vertical').select({}).firstPage();
        const activeVertical = verticalRecords[0].fields['Vertical'];

        // Fetch the configuration for the active vertical from the "Configuration Table"
        const configRecords = await base('Configuration Table').select({
            filterByFormula: `{Vertical} = '${activeVertical}'`
        }).firstPage();

        if (configRecords.length > 0) {
            // Safely parse the JSON
            const currentStatusElementsField = configRecords[0].fields['currentStatusElements'];
            const currentStatusElements = currentStatusElementsField ? JSON.parse(currentStatusElementsField) : {};

            const actionTextsField = configRecords[0].fields['actionText'];
            const actionTexts = actionTextsField ? JSON.parse(actionTextsField) : {};

            // Add the necessary dynamic texts for navigation and labels
            const homeText = actionTexts.homeText || "Home";
            const initiateOrderText = actionTexts.initiateOrderText || "Initiate Order";
            const verifyText = actionTexts.verifyText || "Verify";
            const verifyPaymentText = actionTexts.verifyPaymentText || "Verify Payment";
            
            // Render the current-status page with dynamic content
            res.render("current-status", {
                title: currentStatusElements.title || "Current Status",
                headerText: actionTexts.headerText || "Current Status", // dynamic header text
                footerText: actionTexts.footerText || "&copy; 2024 Tarek Services. All rights reserved.", // dynamic footer text,
                homeText,            // Passing dynamic home text
                initiateOrderText,   // Passing dynamic initiate order text
                verifyText,          // Passing dynamic verify text
                verifyPaymentText,   // Passing dynamic verify payment text
                productInfo: {},     // You should pass your productInfo here as appropriate
                productLabel: actionTexts.productLabel || "Product Name",
                serialLabel: actionTexts.serialLabel || "Serial Number",
                statusLabel: actionTexts.statusLabel || "Status",
                amountLabel: actionTexts.amountLabel || "Total Amount"
            });
        } else {
            // Render a generic error message or fallback view
            res.status(404).send("Configuration not found for the selected vertical.");
        }
    } catch (error) {
        console.error("Error fetching configuration from Airtable:", error);
        res.status(500).send('Server Error');
    }
});

// Route: Render the Order Page (GET)
app.get("/order", async (req, res) => {
    try {
        // Fetch the current active vertical(s) from the "Current Vertical" table
        const verticalRecords = await base('Current Vertical').select({}).firstPage();
        const activeVertical = verticalRecords[0].fields['Vertical'];

        // Fetch the configuration for the active vertical from the "Configuration Table"
        const configRecords = await base('Configuration Table').select({
            filterByFormula: `{Vertical} = '${activeVertical}'`
        }).firstPage();

        if (configRecords.length > 0) {
            // Safely parse the JSON fields for orderPageElements and actionTexts
            const orderPageElementsField = configRecords[0].fields['orderPageElements'];
            const orderPageElements = orderPageElementsField ? JSON.parse(orderPageElementsField) : {};

            const actionTextsField = configRecords[0].fields['actionText'];
            const actionTexts = actionTextsField ? JSON.parse(actionTextsField) : {};

            // Safely parse the product list
            const productsField = configRecords[0].fields['productVerified'];
            const productsData = productsField ? JSON.parse(productsField) : {};

            // Convert the productsData into a format suitable for the dropdown
            const products = Object.keys(productsData).map(productId => ({
                id: productId,
                name: productsData[productId].productName
            }));

            // Render the order page with dynamic content and the list of products
            res.render("order", {
                pageTitle: orderPageElements.pageTitle || "Order Your Product",
                headerText: orderPageElements.headerText || "Retail Services - Order Your Product",
                footerText: actionTexts.footerText || "Thank you for your order!",
                instructionText: orderPageElements.instructionText || "Please fill out the details below to initiate your order.",
                firstNameLabel: orderPageElements.firstNameLabel || "First Name",
                lastNameLabel: orderPageElements.lastNameLabel || "Last Name",
                productLabel: orderPageElements.productLabel || "Product",
                products, // Pass the products list to the view
                submitButtonText: orderPageElements.submitButtonText || "Submit Order",

                // Add dynamic navigation texts
                homeText: actionTexts.homeText || "Home",
                initiateOrderText: actionTexts.initiateOrderText || "Initiate Order",
                verifyText: actionTexts.verifyText || "Verify",
                verifyPaymentText: actionTexts.verifyPaymentText || "Verify Payment"
            });
        } else {
            res.status(404).send("Configuration not found for the selected vertical.");
        }
    } catch (error) {
        console.error("Error fetching configuration from Airtable:", error);
        res.status(500).send('Server Error');
    }
});

// Route: Handle Order Submission (POST)
app.post("/order", async (req, res) => {
    const { firstName, lastName, product } = req.body;

    try {
        const verticalRecords = await base('Current Vertical').select({}).firstPage();
        const activeVertical = verticalRecords[0].fields['Vertical'];

        const configRecords = await base('Configuration Table').select({
            filterByFormula: `{Vertical} = '${activeVertical}'`
        }).firstPage();

        if (configRecords.length > 0) {
            const productVerifiedField = configRecords[0].fields['productVerified'];
            const productVerified = productVerifiedField ? JSON.parse(productVerifiedField) : {};

            const actionTextsField = configRecords[0].fields['actionText'];
            const actionTexts = actionTextsField ? JSON.parse(actionTextsField) : {};

            const productDetails = productVerified[product];

            if (!productDetails) {
                throw new Error("Product details are missing or incomplete.");
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: productDetails.productName,
                            },
                            unit_amount: parseInt(productDetails.totalAmount.replace('$', '')) * 100, // Convert to cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${req.headers.origin}/success`,
                cancel_url: `${req.headers.origin}/cancel`,
            });

            const orderDetails = {
                productName: productDetails.productName,
                orderId: product,
                totalPrice: productDetails.totalAmount
            };

            const paymentLinkMessage = actionTexts.paymentLinkMessage || "Thank you for your order. We have generated a secure payment link for you: {{paymentLink}}";
            const webhookUrl = process.env.SEND_PAYMENT_WEBHOOK_URL;
            const message = paymentLinkMessage.replace("{{paymentLink}}", session.url);

            await axios.post(webhookUrl, { text: message });

            // Render the confirmation page with dynamic content
            res.render("confirm", {
                firstName,
                lastName,
                orderDetails,
                paymentLink: session.url,
                headerText: actionTexts.headerText || "Order Confirmation",
                footerText: actionTexts.footerText || "Thank you for your order!",
                confirmThankYouText: actionTexts.confirmThankYouText || "Thank you,",
                confirmOrderProcessedText: actionTexts.confirmOrderProcessedText || "Your order for the product has been successfully processed.",
                confirmOrderIDText: actionTexts.confirmOrderIDText || "Order ID:",
                confirmTotalPriceText: actionTexts.confirmTotalPriceText || "Total Price:",
                confirmCompletePaymentText: actionTexts.confirmCompletePaymentText || "Complete Payment",

                // Add dynamic navigation texts
                homeText: actionTexts.homeText || "Home",
                initiateOrderText: actionTexts.initiateOrderText || "Initiate Order",
                verifyText: actionTexts.verifyText || "Verify",
                verifyPaymentText: actionTexts.verifyPaymentText || "Verify Payment"
            });
        } else {
            res.status(404).send("Configuration not found for the selected vertical.");
        }
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).send(`Error processing order: ${error.message}`);
    }
});

// Route: Payment Success
app.get("/success", (req, res) => {
    res.send("Payment successful!");
});

// Route: Payment Cancel
app.get("/cancel", (req, res) => {
    res.send("Payment canceled.");
});

// Route: Verify Payment (GET)
app.get("/verify-payment", async (req, res) => {
    try {
        // Fetch the current active vertical
        const verticalRecords = await base('Current Vertical').select({}).firstPage();
        const activeVertical = verticalRecords[0].fields['Vertical'];

        // Fetch the configuration for the active vertical from the "Configuration Table"
        const configRecords = await base('Configuration Table').select({
            filterByFormula: `{Vertical} = '${activeVertical}'`
        }).firstPage();

        if (configRecords.length > 0) {
            const actionTextsField = configRecords[0].fields['actionText'];
            const actionTexts = actionTextsField ? JSON.parse(actionTextsField) : {};

            const headerText = actionTexts.headerText || "Verify Payment";
            const footerText = actionTexts.footerText || "&copy; 2024 Tarek Services. All rights reserved.";
            
            // Add the necessary dynamic texts
            const homeText = actionTexts.homeText || "Home";
            const initiateOrderText = actionTexts.initiateOrderText || "Initiate Order";
            const verifyText = actionTexts.verifyText || "Verify";
            const verifyPaymentText = actionTexts.verifyPaymentText || "Verify Payment";

            // Fetch transaction details (this part remains unchanged)
            const paymentIntents = await stripe.paymentIntents.list({ limit: 1 });

            if (paymentIntents.data.length === 0) {
                return res.status(404).send("No transactions found.");
            }

            const latestPayment = paymentIntents.data[0];
            const charges = await stripe.charges.list({ payment_intent: latestPayment.id, limit: 1 });

            if (charges.data.length === 0) {
                return res.status(404).send("No charges found for the latest transaction.");
            }

            const latestCharge = charges.data[0];

            const transaction = {
                id: latestPayment.id,
                customer: latestCharge.billing_details.name || 'Anonymous Customer',
                status: latestPayment.status,
                amount: (latestPayment.amount_received / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                paidDate: new Date(latestPayment.created * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' }),
            };

            // Render the verify-payment view with dynamic content
            res.render("verify-payment", {
                headerText,
                footerText,
                transactions: [transaction],

                // Include the dynamic navigation texts
                homeText,
                initiateOrderText,
                verifyText,
                verifyPaymentText
            });
        } else {
            res.status(404).send("Configuration not found for the selected vertical.");
        }
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).send(`Error fetching transactions: ${error.message}`);
    }
});

// Webhook route to handle Stripe events
app.post("/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify the event using the raw body and Stripe webhook secret
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("Stripe event:", event);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            // Prepare the transaction data to send to the second webhook
            const transaction = {
                id: paymentIntent.id,
                amount: paymentIntent.amount_received / 100, // Convert amount to dollars
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                customer: paymentIntent.customer || "Anonymous Customer",
                paymentMethod: paymentIntent.payment_method,
                paymentDate: new Date(paymentIntent.created * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' }),
            };

            console.log("Transaction data to send:", transaction);

            // Send the payment info to the external webhook
            try {
                const response = await axios.post(process.env.CONFIRMATION_WEBHOOK_URL, { transaction });
                console.log("Response from second webhook:", response.data);
                console.log("Payment information sent successfully to the webhook.");
            } catch (error) {
                console.error("Error sending payment info to second webhook:", error);
            }

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});