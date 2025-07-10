"use strict";

// this in global space
console.log(this);
// in global scope this consoles globalObject that is, window in web browser, it is different in other devices like watch, android, etc. DEPENDS ON RUNTIME but globalObject is the permanent.

// the value of this inside a function is undefined or null, but if we are using it non-strict mode
// we get somthing called as  --> this substitution.
// THIS SUBSTITUTION --> if this is undefined or null it inherits the value of globalObject in non-strict mode

function x() {
    console.log(this);
}
x();

// in strict mode we get undefined or null ehich is usual behavior.

// it also depends on exection / calling of function
// if we call x() without reference it is undefined but if we call it with reference it gives globalObject

window.x();

// function inside object is called as METHOD

const obj = {
    a: 18,
    x: function () {
        console.log(this);
        console.log(this.a); // should return 18 -----------
    },
};

obj.x(); // now the value of this --> object itself bcz for this funcn the parent is its lexical parent

// ----------- CALL APPLY BIND -------------//

const student = {
    age: 18,
    name: "Kurmi",
    printName: function () {
        console.log(this.name);
    },
};
const student2 = {
    name: "Rathi",
};

student.printName(); // here this refers to student and name in it
student.printName.call(student2); // here this is changed to student 2

// so to change value of this that is to reference other value --> we use call( <value to replace with> )

// ------------- INSIDE ARROW FUNCTION ----------------//
// arrow function doesnt have their own <this> they just inherit their lexical parent's this

const objjekt = {
    age: 18,
    x: () => {
        console.log(this); // returns globalObject here as this of objekkt is globalObject here.
        console.log(this.age); // --> undefined as the globalObject doesnt have age
    },
};

objjekt.x();

// this inside DOM --> reference to HTML element.
