/* This module handles the placement of various markers on a sequence of positions. */

// Function to place a single character marker in the first available empty slot.
function placeSingleItem(itemString) {
   for (var currentPos = 1; currentPos < positionTracker.length - 1; currentPos++) {
      if (positionTracker[currentPos] === 0) {
         positionTracker[currentPos] = itemString;
         return;
      }
   }
}

// Function to insert a specific marker 'B' based on neighboring conditions.
function insertAdjacentItem() {
   for (var currentPos = positionTracker.length - 2; currentPos >= 1; currentPos--) {
      // Check if the current slot is empty and its neighbors are not 'A'.
      if (positionTracker[currentPos - 1] !== "A" && positionTracker[currentPos] === 0 && positionTracker[currentPos + 1] !== "A") {
         positionTracker[currentPos] = "B";
         return;
      }
   }
   // If no such spot is found, place 'B' using the single item placement logic.
   placeSingleItem("B");
}

// Function to fill empty slots adjacent to existing markers or in a central position.
function fillEdgeGaps() {
   for (var currentPos = 1; currentPos < positionTracker.length - 1; currentPos++) {
      // If a slot is occupied and the next one is empty, fill the next one.
      if (positionTracker[currentPos] !== 0 && positionTracker[currentPos + 1] === 0) {
         positionTracker[currentPos + 1] = "C";
         return;
      }
      // If a slot is occupied and the previous one is empty, fill the previous one.
      if (positionTracker[currentPos] !== 0 && positionTracker[currentPos - 1] === 0) {
         positionTracker[currentPos - 1] = "C";
         return;
      }
   }
   // If no adjacent gaps are found, place 'C' in a specific central location.
   if (totalSpots % 2 === 1) {
      positionTracker[(totalSpots - 1) / 2 + 1] = "C";
   } else {
      positionTracker[totalSpots / 2 + 1] = "C";
   }
}

// Function to identify and mark the largest contiguous empty segment.
function findLargestEmptySegment() {
   var longestSegmentInfo = [0, 0]; // [index_of_start_of_segment, length_of_segment]
   for (var currentPos = 1; currentPos < positionTracker.length - 1; currentPos++) {
      // Skip occupied positions.
      if (positionTracker[currentPos] !== 0) {
         continue;
      }

      var leftSeeker = currentPos;
      var rightSeeker = currentPos;
      var segmentLength = 0; // Current segment length from this 'currentPos' outward

      // Expand outwards from currentPos to find segment boundaries.
      while (true) {
         // Move seekers until 'X' or other markers are found.
         if (positionTracker[leftSeeker] !== "X") {
             leftSeeker--;
         }
         if (positionTracker[rightSeeker] !== "X") {
             rightSeeker++;
         }

         // If both seekers hit boundary 'X', break.
         if (positionTracker[leftSeeker] === "X" && positionTracker[rightSeeker] === "X") {
             break;
         }

         // If any seeker hits a specific marker, break.
         if (/[ABCD]/.test(positionTracker[leftSeeker]) || /[ABCD]/.test(positionTracker[rightSeeker])) {
             break;
         }

         segmentLength++; // Increment segment length as we expand.
         // Update longest segment if current one is longer.
         if (longestSegmentInfo[1] < segmentLength) {
             longestSegmentInfo = [currentPos, segmentLength];
         }
      }
   }

   // If a longest segment was found, mark its center.
   if (longestSegmentInfo[1] !== 0) {
      positionTracker[longestSegmentInfo[0]] = "D";
      return;
   }
   // Otherwise, use the general placement function.
   placeSingleItem("D");
}


// --- Main Program Execution ---

// Read input data from standard input.
var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input into an array of lines.
var inputLineBuffer = rawInputData.trim().split("\n");

// Loop indefinitely until a termination condition is met.
while (true) {
   // Extract problem dimensions (totalSpots, operationCount) from the first line.
   var dimensions = inputLineBuffer.shift().split(" ").map(Number);
   var totalSpots = dimensions[0];
   var operationCount = dimensions[1];

   // Check for termination condition (0 0).
   if (totalSpots === 0 && operationCount === 0) {
      break;
   }

   // Initialize the sequence array with 'totalSpots' empty slots (0).
   var positionTracker = [];
   for (var currentPos = 0; currentPos < totalSpots; currentPos++) {
      positionTracker.push(0);
   }

   // Add boundary markers 'X' to the start and end of the array.
   positionTracker.unshift("X");
   positionTracker.push("X");

   // Process each operation command.
   for (var currentPos = 0; currentPos < operationCount; currentPos++) {
      var currentCommand = inputLineBuffer.shift();
      // Execute the corresponding function based on the command.
      if (currentCommand === "A") {
          placeSingleItem("A");
      }
      if (currentCommand === "B") {
          insertAdjacentItem();
      }
      if (currentCommand === "C") {
          fillEdgeGaps();
      }
      if (currentCommand === "D") {
          findLargestEmptySegment();
      }
   }

   // Remove boundary markers before printing.
   positionTracker.shift();
   positionTracker.pop();

   // Print the final state of the sequence, replacing 0s with '#'.
   console.log(positionTracker.join("").replace(/0/g, "#"));
}