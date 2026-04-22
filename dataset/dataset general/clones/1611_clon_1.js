/*
 * This file contains a collection of utility methods added to Number.prototype
 * and a basic class definition framework called EightBall.
 *
 * It demonstrates custom prototype extensions and a simple class extension pattern.
 */


// --- Number Prototype Extensions ---

// Defines a 'bm' method on Number.prototype.
// This method builds a string by concatenating numbers from 0 up to (but not including) the number itself.
Number.prototype.bm = function (f) {
    // Initialize an accumulator string.
    var acc = "";

    // Loop from 0 up to the number.
    for (var i = 0; i < this; i++) {
        // Append the current loop index to the accumulator.
        acc += i;
    }

    // Return the final accumulated string.
    return acc;
};


/*
 * Defines a 'times' method on Number.prototype.
 * This method executes a given function 'f' a number of times,
 * passing the current iteration index to 'f' on each call.
 * It then returns the original number.
 */
Number.prototype.times = function (f) {
    // Iterate 'this' number of times.
    for (
        var i = 0; // Initialize loop counter
        i < this; // Loop condition: continue while i is less than the number
        i++       // Increment counter
    ) {
        // Call the provided function 'f' with the current index 'i'.
        f(i);
    }

    // Return the number itself, allowing for method chaining.
    return this;
};


// Defines a 'primplus' method on Number.prototype.
// This method simply adds another number 'y' to the current number.
Number.prototype.primplus = function (y) {
    // Perform the addition and return the result.
    return this + y;
};


// --- External References and Inspirations ---
// The following comments are references to external articles and modules
// that might have inspired parts of this code or provide further context.

// Reference: The Command Pattern in JavaScript - Encapsulating Function Property Calls
// Source: http://peter.michaux.ca/articles/the-command-pattern-in-javascript-encapsulating-function-property-calls

// Reference: Node.js Modules Wiki
// Source: http://wiki.github.com/ry/node/modules



// --- EightBall Class Definition Framework ---

/**
 * EightBall is a base object intended for creating a simple class system.
 * It provides methods for extending objects and defining new classes.
 * @constructor
 */
var EightBall = function () {
};


// Extends an object (or class) with a given body.
// In this simplistic implementation, it just returns the current context 'this'.
EightBall.extend = function (body) {
    /*
     * A more robust implementation would merge properties from 'body' into 'this',
     * or create a new object inheriting from 'this' and then apply 'body'.
     * For Type I clone, we must keep the original logic.
     */
    return this;
};


/**
 * Defines a new class within the EightBall framework.
 *
 * @param {string} classname   The name of the new class.
 * @param {object} superclass  The superclass to extend from.
 * @param {object} body        An object containing the methods and properties for the new class.
 */
EightBall.define_class = function (classname, superclass, body) {

    // Assign the extended superclass to the new classname property of EightBall.
    // The 'extend' method here is called on the superclass.
    this[classname] = superclass.extend(body);


    // Assign the classname string to a 'name' property within the newly defined class.
    this[classname]["name"] = classname;

};