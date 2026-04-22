function calculateOptimal (rawData){

  const textRows = rawData.split('\n');

  const dimensions = textRows.shift().split(' ').map(token => parseInt(token, 10));

  const itemCount = dimensions[0];
  const maxCapacity = dimensions[1];

  const objectList = textRows.map(entryLine => entryLine.split(' ').map(numStr => parseInt(numStr, 10)));

  const initialObject = objectList.shift();
  const initialWeight = initialObject[0];
  const initialValue = initialObject[1];

  let cumulativeValue = initialValue;

  let minWeightsForValue = [];
  minWeightsForValue[0] = 0; // The weight for zero value is zero

  // Initialize the DP array with the first item's data
  for (let loopIndex = 1; loopIndex <= cumulativeValue; loopIndex++){
    minWeightsForValue[loopIndex] = initialWeight;
  }

  // Iterate through all remaining items
  for (let loopIndex = 0; loopIndex < objectList.length; loopIndex++){

    let itemWeight = objectList[loopIndex][0];
    let itemValue = objectList[loopIndex][1];

    cumulativeValue += itemValue; // Update the running total of all possible values

    // Process DP table from highest value down to avoid re-using current item
    for (let targetValue = cumulativeValue; targetValue > 0; targetValue--){

      // Check if the current item's value can contribute to the target value
      if (targetValue >= itemValue){
        let weightAtLesserVal = minWeightsForValue[targetValue - itemValue];

        // If no minimum weight is yet recorded for the current target value
        if (minWeightsForValue[targetValue] === undefined){
          if (weightAtLesserVal !== undefined) { // Ensure the previous state is valid
            minWeightsForValue[targetValue] = itemWeight + weightAtLesserVal;
          }
        } else {
          // If a minimum weight already exists, compare with taking the current item
          if (weightAtLesserVal !== undefined) {
            minWeightsForValue[targetValue] = Math.min(weightAtLesserVal + itemWeight, minWeightsForValue[targetValue]);
          }
        }
      } else {
        // If target value is less than current item's value, we cannot include it in the sum
        // This part of the logic handles cases where current item's weight is considered independently
        if (minWeightsForValue[targetValue] === undefined){
          minWeightsForValue[targetValue] = itemWeight; // This might be an edge case for values less than itemValue
        } else {
          minWeightsForValue[targetValue] = Math.min(itemWeight, minWeightsForValue[targetValue]);
        }
      }

    }
  }

  let optimalValue = 0; // Variable to store the highest achievable value

  // Traverse the DP table backwards to find the maximum value within capacity
  for (let loopIndex = cumulativeValue; loopIndex >= 0; loopIndex--){
    if (minWeightsForValue[loopIndex] !== undefined && minWeightsForValue[loopIndex] <= maxCapacity){
      optimalValue = loopIndex; // Found the highest value that fits
      break; // Exit loop after finding the first valid value
    }
  }

  // Output the final computed maximum value
  console.log(optimalValue + 0); // Adding zero ensures number type output
}

// Call the main processing function with standard input data
calculateOptimal(require('fs').readFileSync('/dev/stdin', 'utf8'));