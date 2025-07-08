const cart = ["shoes", "bags", "kurta"];

const orderPromise = createOrder(cart);

orderPromise.then(() => {
    proceedToPayment(orderId);
});

function createOrder(cart) {
    const pr = new Promise(function (resolve, reject) {
        // create order
        // validate cart
        

    });

    return pr;
}
