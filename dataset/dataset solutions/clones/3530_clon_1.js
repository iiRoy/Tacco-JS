// This section initializes the input/output mechanism. You can safely ignore its implementation details.
// ↓ START OF UTILITY CODE. This part handles input reading and basic conversions.
var read = require('readline').createInterface(
  {
    input  : process.stdin,
    output : process.stdout
  }
);
// Global object to store parsed input and track its state.
var obj;
// Array to temporarily hold all lines read from stdin.
var inLine = [];

// Event listener for each line of input received.
read.on('line', function(input){
  // Add the received line to our temporary storage.
  inLine.push(input);
});

// Event listener for when the input stream closes.
read.on('close', function(){
  // Initialize the global 'obj' with the collected input lines.
  obj = init(inLine);
  // Log a start message to stderr for debugging.
  myerr("-----start-----");
  // Record the starting time for performance measurement.
  var start = new Date();
  // Execute the main logic of the program.
  Main();
  // Calculate the elapsed time.
  var end = new Date() - start;
  // Log an end message.
  myerr("----- end -----");
  // Display the execution time.
  myerr("time : " + (end) + "ms");
  // Display current memory usage.
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Helper function to get the next integer from input.
function nextInt() {
  return myconv(next(), 1);
}

// Helper function to get the next string array from input (space-separated).
function nextStrArray() {
  return myconv(next(), 2);
}

// Helper function to get the next integer array from input (space-separated).
function nextIntArray() {
  return myconv(next(), 4);
}

// Helper function to get the next character array from input.
function nextCharArray() {
  return myconv(next(), 6);
}

// Retrieves the next item from the initialized input object.
function next() {
  return obj.next();
}

// Checks if there are more items to read from input.
function hasNext() {
  return obj.hasNext();
}

// Initializes the input parsing object.
function init(input) {
  var returnObj = {
    list : input, // The array of input lines.
    index : 0, // Current position in the input array.
    max : input.length, // Total number of input lines.

    // Method to check if there are more lines to read.
    hasNext : function(){
      return (this.index < this.max);
    },

    // Method to retrieve the next line of input.
    next : function(){
      if(!this.hasNext()) {
        // Throw an error if no more input is available.
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        // Get the current line, then advance the index.
        var returnInput = this.list[this.index];
        this.index++;
        return returnInput;
      }
    }
  };
  return returnObj;
}

// Outputs a string to standard console.
function myout(s) {
  console.log(s);
}

// Outputs a debug message to standard error console.
function myerr(s) {
  console.error("debug:" + require("util").inspect(s,false,null));
}

// This function performs various type conversions based on the 'no' parameter.
// [no] parameter explanation:
//  - Default/Unknown: Returns the input 'i' as is.
//  - 1: Converts 'i' to an integer.
//  - 2: Splits 'i' by space into a string array.
//  - 4: Splits 'i' by space and converts elements to a number array.
//  - 6: Splits 'i' into a character array.
//  - 7: Splits 'i' into a character array and converts elements to a number array.
//  - 8: Joins array 'i' with spaces.
//  - 9: Joins array 'i' with newlines.
//  - 0: Joins array 'i' without any separator.
function myconv(i, no) {
  try {
    switch(no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map(Number);
      case 6:
        return i.split("");
      case 7:
        return i.split("").map(Number);
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  }
  catch(e) {
    // In case of any conversion error, return the original input.
    return i;
  }
}

// ↑ END OF UTILITY CODE. You can focus on the Main function below.

// Main program logic starts here.
function Main() {
  // Read the first input string 's'.
  var s = next();
  // Read the second input string 't'.
  var t = next();

  // Initialize a map to store character positions.
  var map = {};
  // Define the alphabet for iteration.
  var list = "abcdefghijklmnopqrstuvwxyz";

  // Initialize each character in the map with an empty Set.
  // The Set will store indices where the character appears.
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = new Set();
  }

  // Populate the map with indices from string 's'.
  // For each character in 's', add its index to the corresponding Set in the map.
  for (var i = 0; i < s.length; i++) {
    map[s[i]].add(i);
  }

  // Perform character swaps based on string 't'.
  // This nested loop iterates through each position in 's' and each character in the alphabet.
  for (var i = 0; i < s.length; i++) {
    for (var j = 0; j < list.length; j++) {
      // Check if the current character (list[j]) exists at index 'i' in the 's' string's original mapping
      // AND if this character is NOT the target character (t[i]) at the current index.
      if (map[list[j]].has(i) && list[j] != t[i]) {
        // If conditions met, perform a swap of the Sets associated with list[j] and t[i].
        // This effectively means that all occurrences of list[j] are now considered t[i]
        // and all occurrences of t[i] are now considered list[j].
        var tmp = map[list[j]];
        map[list[j]] = map[t[i]];
        map[t[i]] = tmp;
      }
    }
  }

  // Initialize an output array to reconstruct the string.
  var output = new Array(s.length);
  // Get all character keys from the modified map.
  var keys = Object.keys(map);

  // Populate the output array based on the final character mappings.
  // Iterate through each character (key) in the map.
  for (var i = 0; i < keys.length; i++) {
    // Convert the Set of indices for the current character into an array.
    var indexes = Array.from(map[keys[i]]);
    // For each index associated with this character, place the character in the output array.
    for (var j = 0; j < indexes.length; j++) {
      output[indexes[j]] = keys[i];
    }
  }

  // Join the characters in the output array to form a single string.
  output = myconv(output, 0);

  // Output the target string 't' and the generated output string to stderr for debugging.
  myerr(t);
  myerr(output);

  // Compare the reconstructed string with the target string 't'.
  if (output == t) {
    // If they match, print "Yes".
    myout("Yes");
  } else {
    // Otherwise, print "No".
    myout("No");
  }
}