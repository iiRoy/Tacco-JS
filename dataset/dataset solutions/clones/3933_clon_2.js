// This JavaScript module defines a primary routine for processing input data.
function ProcessInput(inputString) {
  // First, we convert the provided input string into an integer.
  // This integer typically dictates the scale or bounds of subsequent operations.
  const limitValue = parseInt(inputString);


  // Initialize a dynamic array (or collection) with a couple of predefined starting numeric values.
  // These initial values serve as base elements for the collection's growth.
  var dataCollection = [3, 5];


  // A variable to accumulate a sum of certain computed elements.
  // It starts at zero, ready to collect values.
  var runningTotal = 0;

  // We then enter a loop to populate the array and update our running total.
  // The loop iterates from an initial index (2) up to, but not including,
  // an index derived from the 'limitValue'.
  for(var loopCounter = 2; loopCounter < limitValue - 1; loopCounter++) {
    // At each step, a new value is computed and assigned to the current position
    // in the 'dataCollection'. This value is twice the current loop index.
    dataCollection[loopCounter] = loopCounter * 2;

    // The newly calculated array element is then added to our 'runningTotal'.
    runningTotal += dataCollection[loopCounter];
  }

  // After the loop, the final element of the 'dataCollection' is determined
  // by a more complex arithmetic expression involving the 'runningTotal'.
  // This calculation incorporates ceiling division, modulo, and a fixed offset.
  dataCollection[limitValue - 1] = Math.ceil(runningTotal / 30) * 30 - runningTotal % 30 + 22;

  // Finally, the entire 'dataCollection' is converted into a single string
  // with elements separated by spaces, and this string is printed to the console.
  console.log(dataCollection.join(" "));
}

// The main execution point of the script:
// It reads the entire content of standard input as a UTF-8 string,
// and then passes this string to our 'ProcessInput' function for handling.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));