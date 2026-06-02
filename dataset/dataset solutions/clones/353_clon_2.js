let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input stream

let lineBuffer = rawData.trim().split("\n"); // Process raw input: remove leading/trailing whitespace and split into an array of lines

while (true) { // Loop indefinitely to handle multiple test cases
   let dims = lineBuffer.shift().split(" ").map(Number); // Extract dimensions (height and width) for the current grid

   if (dims[0] === 0 && dims[1] === 0) { // Check for the termination condition (0 0)
      break; // Exit the loop if both dimensions are zero
   }

   let heightVal = dims[0]; // Store the extracted height value
   let widthVal = dims[1]; // Store the extracted width value

   let gridData = []; // Initialize a 2D array to store processed height data for each cell

   for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) { // Iterate through each row of the input grid
      let rowChars = lineBuffer.shift().split(""); // Get the current row as an array of characters
      gridData[rowIdx] = []; // Initialize the current row in the processed grid data

      rowChars.forEach(function (charVal, colIdx) { // Iterate through each character (cell) in the current row
         if (rowIdx === 0 && charVal === ".") { // If it's the first row and the cell contains a '.'
            gridData[rowIdx][colIdx] = 1; // Set its height to 1
         } else if (rowIdx === 0 && charVal !== ".") { // If it's the first row and the cell does not contain a '.'
            gridData[rowIdx][colIdx] = 0; // Set its height to 0
         } else if (rowIdx !== 0 && charVal === ".") { // If it's not the first row and the cell contains a '.'
            gridData[rowIdx][colIdx] = gridData[rowIdx - 1][colIdx] + 1; // Add 1 to the height of the cell directly above it
         } else if (rowIdx !== 0 && charVal !== ".") { // If it's not the first row and the cell does not contain a '.'
            gridData[rowIdx][colIdx] = 0; // Set its height to 0
         }
      });
   }

   let maximumArea = 0; // Initialize a variable to keep track of the largest rectangle area found

   for (let currentRow = 0; currentRow < heightVal; currentRow++) { // Iterate through each row to find the maximum rectangle area
      let stackOfHeights = []; // Use a monotonic stack to find the largest rectangle in the histogram represented by the current row
      gridData[currentRow][widthVal] = 0; // Append a sentinel value (0) to the end of the current row's data to ensure all elements in the stack are processed

      for (let currentCol = 0; currentCol <= widthVal; currentCol++) { // Iterate through each column, including the sentinel
         let currentHeight = gridData[currentRow][currentCol]; // Get the height value for the current cell

         if (stackOfHeights.length === 0) { // If the stack is empty
            stackOfHeights.push([currentHeight, currentCol + 1]); // Push the current height and its effective starting index (currentCol + 1)
            continue; // Move to the next column
         }

         if (stackOfHeights[stackOfHeights.length - 1][0] < currentHeight) { // If the current height is greater than the height at the top of the stack
            stackOfHeights.push([currentHeight, currentCol]); // Push the current height and its column index
         } else if (stackOfHeights[stackOfHeights.length - 1][0] === currentHeight) { // If the current height is equal to the height at the top of the stack
            continue; // No action needed, move to the next column
         } else if (stackOfHeights[stackOfHeights.length - 1][0] > currentHeight) { // If the current height is less than the height at the top of the stack
            while (stackOfHeights.length !== 0) { // Pop elements from the stack until the condition is met
               let poppedItem = stackOfHeights.pop(); // Pop an item (height and its start index) from the stack

               if (currentHeight > poppedItem[0]) { // If the current height is greater than the popped height
                  stackOfHeights.push(poppedItem); // Push the popped item back onto the stack
                  break; // Exit the inner while loop
               } else if (currentHeight === poppedItem[0]) { // If the current height is equal to the popped height
                  break; // Exit the inner while loop
               } else if (currentHeight <= poppedItem[0]) { // If the current height is less than or equal to the popped height
                  // Calculate the area of the rectangle formed by the popped height
                  // Width is (currentCol + 1) - poppedItem[1]
                  maximumArea = Math.max(maximumArea, poppedItem[0] * ((currentCol + 1) - poppedItem[1]));
               }
            }
         }
      }
   }
   console.log(maximumArea); // Output the maximum area found for the current test case
}
