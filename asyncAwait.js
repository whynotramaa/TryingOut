// // always returns a promise.
// async function getData() {
//     return "Hello Async World"; //if we return a value like this, it wraps everything inside a promise and then returns the promise.
// }

// const dataPromise = getData();
// console.log(dataPromise);

// dataPromise.then((res) => console.log(res)); // this returns the value, as we used to do with the promise.

// const p = new Promise((resolve, reject) => {
//     resolve("Promise returned from here");
// });

// async function returningPromise() {
//     return p;
// }

// const returnPromise = returningPromise();
// console.log(returnPromise); //returns promise

// returnPromise.then((res) => console.log(res));

// // --------------------------------------------------------------------------------------------------------------------

// // AWAIT with ASYNC
// // this does same thing as going through .then and all shitttsss
// async function handlePromise() {
//     const val = await p;
//     console.log(val);
// }

// handlePromise();

// // BUT WHAT IS THE DIFFERENCE IN BOTH METHODS ????????????

const pr = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("THERE WAS 10 SECONDS WAIT HERE ...");
    }, 10000);
});

// async function promiseWithOldMethod() {
//     // JS ENGINE WILL NOT WAIT FOR PROMISE TO BE RESOLVED.
//     pr.then((res) => console.log(res));
//     console.log("Here we go, NO WAIT.");
// }

// promiseWithOldMethod();

async function promiseWithAwait() {
    // HERE JS ENGINE WAITS FOR PROMISE TO GET RESOLVED, HOWEVER LONG IT TAKES, IT DOES WAIT. THEN MOVES FORWARD.
    console.log("THIS SHOULDN'T WAIT FOR 10 SECONDS");
    const val = await pr;
    console.log("FIRST CALL ------- THIS SHOULD WAIT FOR 10 SECONDS");
    console.log(val);
    console.log("BOTH PROMISE SHOULD RESOLVE AT ONCE.");
    const val2 = await pr;
    console.log("SECOND CALL -------- THIS SHOULD WAIT FOR 10 SECONDS");
    console.log(val2);
}

// ====== IF THERE ARE TWO DIFFERENT PROMISES ======
//

promiseWithAwait();

const API_URL = "https://api.github.com/users/whynotramaa";

async function getGithubDara() {
    const data = await fetch(API_URL);
    const jsonValue = await data.json();
    console.log(jsonValue);
}

getGithubDara();
