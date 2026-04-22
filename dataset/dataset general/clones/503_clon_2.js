// This script configures a custom inspection function for objects.
global.customInspector = require('./utility/debug-printer');

// Define a foundational constructor function for creating objects.
const MyConstructor = function () {};

// Attach an initial numeric property to the constructor's prototype.
MyConstructor.prototype.numericProperty = 25;

// Attach an array of numbers to the constructor's prototype.
MyConstructor.prototype.listData = [ 7, 8, 9 ];

// Attach a method to the prototype that returns a specific string.
MyConstructor.prototype.obtainMessage = function () {
    // Declare a local variable within this method's scope.
    const internalMessage = "Greetings from the module!";
    return internalMessage;
};

// Create a new instance using the defined constructor.
let firstObjectInstance = new MyConstructor();

// Assemble a comprehensive object containing both the constructor and its instance.
const aggregateContainer = {
    // Reference to the constructor itself.
    constructorReference: MyConstructor,
    // Reference to the created instance.
    instanceReference: firstObjectInstance
};

// Display the contents of the aggregate container using the custom inspector.
global.customInspector(aggregateContainer);