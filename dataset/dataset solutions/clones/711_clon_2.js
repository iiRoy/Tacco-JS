// This script processes input data from standard input to perform a specific calculation.
// It simulates a process of allocating resources or managing states across a set of slots.

// Alias for the file system module, a core Node.js utility.
const fileSystemUtility = require('fs');

// Alias for the readFileSync method from the file system module.
const obtainFileContents = fileSystemUtility.readFileSync;

// Alias for the String.prototype.trim method, used to remove leading/trailing whitespace.
const removeOuterWhitespace = String.prototype.trim;

// Alias for the String.prototype.split method, used to divide strings into arrays.
const segmentIntoParts = String.prototype.split;

// Alias for the Array.prototype.map method, used to transform array elements.
const transformArrayElements = Array.prototype.map;

// Alias for the Array.prototype.shift method, used to remove and return the first element of an array.
const extractFirstElement = Array.prototype.shift;

// Alias for console.log for custom output, ensuring no direct use of 'console' or 'log'.
const systemOutput = {

    displayLine: function(messageContent) {
        console.log(messageContent); /* The underlying console.log is a global,
                                        not a user-defined identifier to be changed. */
    }

};

// Function to convert a value to a number, aliasing the global Number constructor.
const convertToNumeric = Number; // Global constructor, not a user-defined identifier.


// Read raw content from standard input, decode as UTF-8, and then strip leading/trailing whitespace.
const rawSourceData = removeOuterWhitespace.call(
    obtainFileContents('/dev/stdin', 'utf8')
);


// Split the raw data into individual records (lines) based on newline characters.
// The resulting 'inputRecords' will be an array of strings.
const inputRecords = segmentIntoParts.call(rawSourceData, "\n");


// The primary processing loop continues as long as there are at least two records available for processing.
while (inputRecords.length > 1) {

    // Extract the first record from the array,
    // then clean it by stripping whitespace,
    // and finally split it by spaces to get individual string components.
    const currentEntryParts = removeOuterWhitespace.call(
        extractFirstElement.call(inputRecords)
    );

    // Convert the string components into numeric values using the 'transformArrayElements' alias.
    const [slotCapacity, targetCountGoal] = transformArrayElements.call(
        segmentIntoParts.call(currentEntryParts, " "),
        convertToNumeric
    );


    // Initialize state variables for the current iteration of the algorithm.
    let activeSlotIndex = 0; // This variable points to the currently active slot (0-indexed).
    let decrementalCounter = targetCountGoal; // A counter that will decrease towards zero.
    let slotStatusRegister = []; // An array used to store the status or count for each slot.


    // The inner loop continues until the status of the 'activeSlotIndex' in 'slotStatusRegister'
    // matches the 'targetCountGoal'.
    while (slotStatusRegister[activeSlotIndex] !== targetCountGoal) {

        // Check if the 'decrementalCounter' still has a positive value.
        if (decrementalCounter > 0) {
            // If positive, increment the count for the 'activeSlotIndex'.
            // If the slot's count is undefined, it defaults to 0 before incrementing.
            slotStatusRegister[activeSlotIndex] = (slotStatusRegister[activeSlotIndex] || 0) + 1;
            decrementalCounter--; // Decrease the counter by one.
        }
        else {
            // If 'decrementalCounter' is zero or less, reset it.
            // The counter is reset to the current value of the 'activeSlotIndex' in 'slotStatusRegister'.
            decrementalCounter = slotStatusRegister[activeSlotIndex];
            slotStatusRegister[activeSlotIndex] = 0; // Reset the active slot's count to zero.
        }

        // Move to the next slot in a circular manner.
        // The modulo operator ensures the index wraps around within the 'slotCapacity'.
        activeSlotIndex = (activeSlotIndex + 1) % slotCapacity;

    }

    // Output the final 'activeSlotIndex' once the condition for the inner loop is met.
    systemOutput.displayLine(activeSlotIndex);

}