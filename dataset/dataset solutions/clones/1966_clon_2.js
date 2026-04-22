'use strict'; // Enforce strict parsing and error handling for the script

const displayResult = ( textData ) => console.log(textData);

// This function processes the entire incoming data block
function ExecuteTask ( rawData )
{
  // First, split the raw input string into individual lines
  // Each line will be an element in the resulting array.
  let lineArray = rawData.split("\n");

  // Retrieve the total number of elements from the first line.
  // We take the first part if the line contains spaces.
  let  itemCount  =  lineArray[0].split(" ")[0];

  // Extract the list of values from the second line.
  // These are space-separated values.
  let valueList = lineArray[1].split(" ");

  // Prepare an object to store the frequency of each item.
  // Using a plain object for key-value pairs as in the original logic.
  let occurrenceCounts = {};

  // Initialize all possible item counts to zero.
  // Items are numbered from 1 up to 'itemCount'.
  for ( let  idx = 0;  idx < itemCount;  idx++ )
  {
    occurrenceCounts[idx + 1] = 0;
  }

  // Iterate through the collected values and tally their occurrences.
  for ( let  idx = 0;  idx < valueList.length;  idx++ )
  {
    occurrenceCounts[valueList[idx]]++;
  }

  // Finally, output the tallied counts for each item from 1 to 'itemCount'.
  for ( let  idx = 0;  idx < itemCount;  idx++ )
  {
    displayResult(occurrenceCounts[idx + 1]);
  }
}

// Do not modify the following section. It handles standard input/output.
ExecuteTask(require("fs").readFileSync("/dev/stdin", "utf8"));