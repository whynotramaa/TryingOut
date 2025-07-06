const arr = [5, 10, 15, 20, 30];

// ------------ MAP ------------//
//transformation function it issssss
function double(x) {
    return x * 2;
}
const output = arr.map(double);
const outputBinary = arr.map(function ToBinary(x) {
    return x.toString(2);
});

const outputHexa = arr.map((x) => x.toString(16));

console.log(output);
console.log(outputBinary);
console.log(outputHexa);

// JS HAS WAY MORE OPTION TO DO JUST ONE THING

// ------------ FILTER ------------//

function isOdd(x) {
    return x % 2;
}

const outputOdd = arr.filter(isOdd);
const outputGreaterThanFourteen = arr.filter((x) => x > 14);

console.log(outputOdd);
console.log(outputGreaterThanFourteen);

const users = [
    { firstName: "Baracck", lastName: "Obamaa", age: 65 },
    { firstName: "Doland", lastName: "Trump", age: 96 },
    { firstName: "Sachin", lastName: "Tendullkar", age: 73 },
    { firstName: "Jeff", lastName: "Bejozzz", age: 103 },
    { firstName: "yes", lastName: "Bejo" },
];

// FULL NAMES
const fullNameOutput = users.map((x) => x.firstName + " " + x.lastName);

// RETURN ALL USER FIRST NAME WITH AGE < 90
const ageNameOutput = users.filter((x) => x.age < 90).map((n) => n.firstName);

// const ageOutput = users.map((x) => x.age > 92); --- WONT WORK AS IT WOULD RETURN TRUE AND FALSE FOR EACH x
// LEARN REDUCE
const ageOutput = users.reduce(function (acc, curr) {
    if (acc[curr.age]) {
        acc[curr.age] = ++acc[curr.age];
    } else {
        acc[curr.age] = 1;
    }
    return acc;
}, {});
console.log(fullNameOutput);
console.log(ageOutput);
console.log(ageNameOutput);
