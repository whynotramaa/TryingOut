const cart = ["shoes", "bags", "watches"];

// const orderPromise = createOrder(cart);

// internal working --> When you call createOrder(cart), it returns a pending promise. Internally, that promise represents a future value (here, orderId).
// Once the async task (like an API call or DB op) completes, the promise is resolved with orderId, and the .then() callback runs with that data.

// this gurantees us that we are calling the function as soon as we are getting orderId.

// orderPromise.then((orderid) => {
//     proceedToPayment(orderid);
// });

const GITHUB_API = "https://api.github.com/users/whynotramaa/repos";

const user = fetch(GITHUB_API);

user.then((res) => res.json())
    .then((data) => {
        data.forEach((repo) => {
            console.log(repo.name, repo.size);
        });
    })
    .catch((err) => console.error("Error fetching repos", err));
