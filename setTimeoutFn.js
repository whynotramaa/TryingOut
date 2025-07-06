console.log("Starting out here");

setTimeout(function cb() {
    setTimeout(() => {
        console.log("Runs after 10 seconds -- INNER LOOP");
    }, 10000);
    console.log("should run after 5 seconds -- OUTER LOOP");
}, 1000);

console.log("Ends here");

let startDate = new Date().getTime();
let endDate = new Date().getTime();

while (endDate < startDate + 10000) {
    endDate = new Date().getTime();
}

console.log("While Expires.");
