function x() {
    console.log("first function");
}

function y(x) {
    x();
}

console.log(
    "here x is a callback fucntion whereas y is a Higher Order Function"
);

// MAP is also a HoF

const radius = [3, 4, 7, 6, 2];

const calcArea = function (radius) {
    const output = [];
    for (let i = 0; i < radius.length; i++) {
        output.push(Math.ceil(Math.PI * radius[i] * radius[i]));
    }
    // return Math.ceil(output); ------ OUTPUTS NaN as it is an array and not number
    return output;
};

console.log(calcArea(radius));

// NOW if we have to get all area, diameter, circumference we have to repeat everything and it would make our code redundant.

// BETTER APPROACH 👇🏻

const areaa = function (r) {
    return Math.ceil(Math.PI * r * r);
};

const diameter = function (r) {
    return 2 * r;
};

const calcWithLogic = function (radius, logic) {
    const output = [];
    for (let i = 0; i < radius.length; i++) {
        output.push(logic(radius[i]));
    }
    return output;
};

console.log(calcWithLogic(radius, areaa));
console.log(calcWithLogic(radius, diameter));

console.log(radius.map(areaa)); // we could have done it directly using Map -- WE MADE OUR OWN MAP Funcn.

// NOW CODE IS MODULAR AND EASY TO REPRODUCE.
