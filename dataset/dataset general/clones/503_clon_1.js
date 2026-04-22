// This line is for requiring a custom console.dir utility.
// It overrides the default console.dir behavior for better object inspection.
console.dir = require('../cdir');


// Define a constructor function 'x'.
// This function doesn't perform any specific initialization itself.
var x = function () {
    // An empty constructor body.
};

// Add a property 'foo' to the prototype of 'x'.
// This property holds a numeric value.
x.prototype.foo = 10;

// Another property 'bar', an array of numbers, also on the prototype.
x.prototype.bar = [ 1, 2, 3 ];

// Define a method 'bazz' on the prototype of 'x'.
x.prototype.bazz = function () {
    // Declare a local variable 'x' within this function's scope.
    // Note: This 'x' is different from the global 'x' constructor.
    var x = "hello, world";
    // Return the value of the local 'x'.
    return x;
};


// Create a new instance of the 'x' constructor.
// This object 'y' will inherit properties from x.prototype.
var y = new x();


// Define a plain JavaScript object named 'foobar'.
var foobar = {
    // The 'foodbla' property references the constructor function 'x' itself.
    foodbla: x,
    // The 'foosball' property references the instance 'y'.
    foosball: y
};


// Finally, use the custom console.dir to inspect the 'foobar' object.
// This will display its structure and properties, including nested objects and functions.
console.dir(foobar);