console.log("Callback and its problems");

setTimeout(() => {
    console.log(
        "This is a callback function and it calls itself after 5 seconds"
    );
}, 5000);

const cart = ["shoes", "pant", "caps"];

// first here we need to set context
// we need the flow like this --> create order -> proceed to pay -> show order summary -> update the wallet
api.createOrder(cart, function () {
    api.proceedToPayment(() => {
        api.showOrderSummary(() => {
            api.updateWallet();
        });
    });
});

// THIS IS CALLBACK HELL -- Unreadable and unmaintainable due to too many callbacks, one inside another.
// In callback hell, we're handing over our logic to external functions. This leads to inversion of control, where we lose the ability to determine when, how, or even if our callback will be executed correctly. We trust the external API to handle the flow, which introduces risk and makes debugging harder.
