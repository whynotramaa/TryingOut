Promise.all([p1, p2, p3]);

// if p1 takes 1s p2 takes 2s and o3 takes 3s, the output will be after 3s as .all waits for all promise to resolve

// GETS REJECTED CASE

// if any of promise rejects or error cames, the Promise.all will also throw same error
// immediately As soon as error happened the error will be returned, doesnt wait for all promises to resolve
// but we cant cancel promise in between in JS, so other two will execute and behave as they would normally behave but .all will reject and give error for sure.

Promise.allSettled([p1, p2, p3]);

// THIS RETURNS ONLY THE RESOLVED ONES.
// if it even gets error it waits for all promises to get settled and returns an array like
// [val1, err, val2]

Promise.race([p1, p2, p3]);

// this returns whichever nd whatever promise gets settled first, err or val doesnt matter

Promise.any([p1, p2, p3]);

// waits for first success and returns FIRST SUCCESS and if all fails, gives aggreegated array of all 3 errors
// AggregateError --> OBJECT containing Array of errors in Promise.any saying All promises were rejected




// SETTLED --> Failed or Passed that is resolve or reject
// FULLFILLED --> PASSED that is resolved
