function getInputData(){ return require("fs").readFileSync("/dev/stdin", "utf8").trim(); }
function displayResult(res){ console.log(res); } // Output to standard console
function logError(errVal){ console.error(errVal); } // Output to error console

// This utility function handles various input parsing scenarios.
// 0: No transformation; 1: Convert to integer; 2: Split by space; 3: Split by newline;
// 4: Split by space and convert to number array; 5: Split by newline and convert to number array;
// 6: Split into individual characters; 7: Split into individual characters and convert to number array.
function transformInput(inputVal, conversionType){
  switch(conversionType){
    case 0: return inputVal;
    case 1: return parseInt(inputVal, 10);
    case 2: return inputVal.split(" ");
    case 3: return inputVal.split("\n");
    case 4: return inputVal.split(" ").map((item) => Number(item));
    case 5: return inputVal.split("\n").map((item) => Number(item));
    case 6: return inputVal.split("");
    case 7: return inputVal.split("").map((item) => Number(item));
    default: return inputVal; // Default case, though not explicitly in original
  }
}

function processData(initialInput) {
  // First, split the raw input by newlines.
  let processedLines = transformInput(initialInput, 3);

  // Get the total number of elements from the first line.
  let totalElements = transformInput(processedLines[0], 1);

  // Get the list of elements (as strings) from the second line, split by spaces.
  let elementStrings = transformInput(processedLines[1], 2);

  // Initialize objects to store frequency counts for elements at odd and even indices.
  let oddCountsMap = {};
  let evenCountsMap = {};

  // Iterate through the elements to populate the frequency maps.
  for(let idx = 0; idx < totalElements; idx++){
    // Elements at even indices (0, 2, 4...) contribute to oddCountsMap.
    if(idx % 2 === 0){
       if(oddCountsMap[elementStrings[idx]] === undefined){
     	  oddCountsMap[elementStrings[idx]] = 1;
    	} else {
    	   	oddCountsMap[elementStrings[idx]]++;
    	}
    } else { // Elements at odd indices (1, 3, 5...) contribute to evenCountsMap.
       if(evenCountsMap[elementStrings[idx]] === undefined){
     	  evenCountsMap[elementStrings[idx]] = 1;
  	  } else {
   	  	 evenCountsMap[elementStrings[idx]]++;
  	  }
    }
  }
  
  let finalCount = 0; // This will store the final calculated value.

  // Extract unique elements (keys) from the frequency maps.
  let uniqueOddElements = Array.from(Object.keys(oddCountsMap));
  let uniqueEvenElements = Array.from(Object.keys(evenCountsMap));

  // Special case: If both sets have only one unique element and they are the same.
  if(uniqueOddElements.length === 1 && uniqueEvenElements.length === 1 && uniqueEvenElements[0] === uniqueOddElements[0]){
     displayResult(totalElements / 2); // All elements must be changed except half.
     return;
  }

  let currentMaxFreq = 0; // Temporary variable to find maximum frequency.
  let mostFrequentOddElement = ""; // Stores the element with the highest frequency from odd positions.

  // Find the most frequent element in the odd-indexed positions.
  for(let idx = 0; idx < uniqueOddElements.length; idx++){
    if(currentMaxFreq < oddCountsMap[uniqueOddElements[idx]]){
    	currentMaxFreq = oddCountsMap[uniqueOddElements[idx]];
    	mostFrequentOddElement = uniqueOddElements[idx];
  	}
  }
  // Calculate changes needed for odd-indexed positions.
  finalCount += (totalElements / 2) - currentMaxFreq;

  currentMaxFreq = 0; // Reset for even-indexed positions.

  // If the most frequent odd element is also present in the even set, remove it temporarily
  // to find the *second* most frequent if the most frequent odd element is chosen.
  if(uniqueEvenElements.includes(mostFrequentOddElement)){
  	uniqueEvenElements.splice(uniqueEvenElements.indexOf(mostFrequentOddElement), 1);
	}

  // Find the most frequent element in the even-indexed positions (after potential removal).
  for(let idx = 0; idx < uniqueEvenElements.length; idx++){
    // The original code had a commented-out 'continue' here, which is redundant
    // because the element would have been spliced out if it matched 'mostFrequentOddElement'.
    // if(mostFrequentOddElement === uniqueEvenElements[idx]){
    //    //continue;
    // }
    currentMaxFreq = Math.max(currentMaxFreq, evenCountsMap[uniqueEvenElements[idx]]);
  }

  logError(uniqueOddElements); // Debugging output for odd elements.
  logError(uniqueEvenElements); // Debugging output for even elements.

  // Calculate changes needed for even-indexed positions.
  finalCount += (totalElements / 2) - currentMaxFreq;
  
  displayResult(finalCount); // Output the final calculated result.
}

// Execute the main processing function with input from stdin.
processData(getInputData());
