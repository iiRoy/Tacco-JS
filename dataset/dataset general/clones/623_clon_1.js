/* This is a demonstration of JavaScript's prototype chain behavior.
   The following code creates objects and links them using __proto__. */


// --- Object Definition Section ---

// Define the base 'animal' object with some properties.
var        animal        =        { "length": 13,        "width": 7 };


/*
 * The 'dog' object is created here.
 * It prototypes from 'animal', inheriting its properties.
 * It also has its own property 'barks'.
 */
var dog =        { "__proto__": animal,
                   "barks": true
                 };


// --- Property Access and Printing Section ---

// Accessing properties through the prototype chain for 'dog'.
print(dog["length"]); // Should access 'length' from 'animal'
print(dog["width"]);  // Should access 'width' from 'animal'


// Define the 'lab' object, prototyping from 'dog'.
// 'lab' also defines its own 'length' property, shadowing 'animal's.
var         lab         =         { "__proto__": dog, "length": 2 };


// Accessing properties for 'lab'.
print(lab["length"]); // This will access 'lab's own 'length' (2)
print(lab["width"]);  // This will access 'width' from 'animal' via 'dog'
print(lab["barks"]);  // This will access 'barks' from 'dog'


/*
 * --- Property Modification Section ---
 *
 * Here, we modify a property on the 'dog' object.
 * This change will affect 'dog' and objects prototyping from it,
 * but not the 'animal' object itself for this specific property.
 */
dog["width"] = 19; // Modify 'width' directly on 'dog'

// Print 'dog's new width.
print(dog["width"]);

// Print 'animal's width - should remain unchanged.
print(animal["width"]);


// Print 'lab's width - should reflect 'dog's modified width.
print(lab["width"]);

/* End of script.
   Observe the output to understand prototypal inheritance and shadowing. */