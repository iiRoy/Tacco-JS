// Function responsible for generating a comprehensive map of valid digit patterns.
function PatternGenerator() {
   // A dictionary to store unique, sorted digit sequences.
   let patternMap = {};
   // First collection of three-digit string groups.
   const digitGroupA = "012,123,234,345,456,567,678".split(",");
   // Second collection of three-digit string groups.
   const digitGroupB = "000,111,222,333,444,555,666,777,888".split(",");
   // Combined array of all three-digit groups.
   const allDigitGroups = digitGroupA.concat(digitGroupB);
   // Array of two-digit string suffixes.
   const suffixGroups = "00,11,22,33,44,55,66,77,88".split(",");

   // Nested loops to iterate through all possible combinations of digit groups and suffixes.
   for (let iter1 = 0; iter1 < 16; iter1++) {
      for (let iter2 = 0; iter2 < 16; iter2++) {
         for (let iter3 = 0; iter3 < 16; iter3++) {
            for (let iter4 = 0; iter4 < 16; iter4++) {
               for (let iter5 = 0; iter5 < 9; iter5++) {
                  // Construct a raw string by concatenating selected digit groups and a suffix.
                  let currentSequence = allDigitGroups[iter1] + allDigitGroups[iter2] + allDigitGroups[iter3] + allDigitGroups[iter4] + suffixGroups[iter5];
                  // Convert the sequence string into an array of numbers, sort them, and then join back into a string.
                  currentSequence = currentSequence.split("").map(Number).sort(function(numA, numB) {
                     return numA - numB;
                  }).join("");
                  // Mark this sorted sequence as valid in our pattern map.
                  patternMap[currentSequence] = true;
               }
            }
         }
      }
   }
   // Return the generated map of valid patterns.
   return patternMap;
}

// Pre-compute the set of all valid number patterns.
const validPatterns = PatternGenerator();

// Load the Node.js file system module and read the input from stdin.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the input: remove leading/trailing whitespace and split into lines.
let inputLines = (fileContent.trim()).split("\n");

// Main processing loop for each line of input.
while (true) {
   // Exit condition: if no more lines to process.
   if (inputLines.length === 0) break;

   // Get the next line from the input and remove it from the array.
   let currentInputString = inputLines.shift();
   // Initialize an array to store the identified valid suffix digits.
   let resultDigits = [];

   // Iterate through possible suffix values (0 to 8).
   for (let suffixCandidate = 0; suffixCandidate < 9; suffixCandidate++) {
      // Convert the input string characters to an array of numbers.
      let numericArray = currentInputString.split("").map(Number);
      // Decrement each number in the array by one.
      numericArray = numericArray.map(function(val) {
         return val - 1;
      });
      // Append the current suffix candidate to the numeric array.
      numericArray.push(suffixCandidate);
      // Sort the combined array of numbers in ascending order.
      numericArray.sort(function(valA, valB) {
         return valA - valB;
      });

      // Create an array to count the occurrences of each digit (0-8).
      let counts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      // Populate the digit frequency counts.
      numericArray.forEach(function(digitVal) {
         counts[digitVal]++;
      });

      // Find the maximum frequency of any single digit.
      const highestFrequency = Math.max.apply(null, counts);

      // If any digit appears 5 or more times, this combination is invalid.
      if (highestFrequency >= 5) continue;

      // Check if the sorted numeric sequence exists in our pre-generated patterns.
      if (validPatterns.hasOwnProperty(numericArray.join(""))) {
         // If it's a valid pattern, add the original (incremented) suffix candidate to the results.
         resultDigits.push(suffixCandidate + 1);
      }
   }
   // Output the results: "0" if no valid digits, otherwise space-separated valid digits.
   console.log((resultDigits.length === 0) ? "0" : resultDigits.join(" "));
}