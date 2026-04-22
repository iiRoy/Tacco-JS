function processInput (rawInput)
{
  const processedLines = rawInput .split ('\n') .filter (lineContent => lineContent.length);

  const [itemCount, capacityLimit] = processedLines .shift () .split (' ') .map (Number);

  const merchandise = processedLines .map (lineContent => {
    return lineContent .split (' ') .map (Number);
  });

  const optimalResult = calculateOptimalValue (merchandise, capacityLimit);
  console.log (optimalResult[0]);
}


function calculateOptimalValue (merchandise, capacityLimit)
{
    const valueMatrix = new Array (capacityLimit + 1) .fill ([0, 0]);
    let previousMatrix = [];

    for (let itemIndex = 0, totalItems = merchandise.length; itemIndex < totalItems; ++itemIndex) {
        previousMatrix = valueMatrix .slice ();
        for (let currentCapacity = 0; currentCapacity <= capacityLimit; currentCapacity++) {
            if (currentCapacity === 0) {
                valueMatrix[currentCapacity] = [0, 0];
            } else {

                // The index 'currentCapacity' of the 'valueMatrix' signifies a hypothetical maximum weight.
                // 'valueMatrix[currentCapacity]' stores the item (or combination) that yields the greatest value
                // when the knapsack capacity is 'currentCapacity'.
                // The selection for 'valueMatrix[currentCapacity]' is determined by the following decision logic:
                //      1 . If the current item's weight exceeds 'currentCapacity', the value for 'valueMatrix[currentCapacity]'
                //          remains what it was before considering this item (i.e., from 'previousMatrix').
                //      2 . If the current item's weight does not exceed 'currentCapacity', we compare the existing
                //          value at 'valueMatrix[currentCapacity]' with the value of taking just the current item.
                //          The higher-value option is chosen.
                //      3 . We also consider combining the current item with a previously optimal selection from
                //          'previousMatrix' that fits the remaining capacity ('currentCapacity' minus the current item's weight).
                //          This combined value is then compared against the best option determined in step 2.
                // After iterating through all capacities for the current item, the 'valueMatrix' is updated.
                const referencedEntry = previousMatrix[currentCapacity - merchandise[itemIndex][1]];
                valueMatrix[currentCapacity] = currentCapacity >= merchandise[itemIndex][1] && valueMatrix[currentCapacity][0] < merchandise[itemIndex][0]
                                                  ? merchandise[itemIndex].slice()
                                                  : valueMatrix[currentCapacity];
                if (referencedEntry !== undefined && currentCapacity >= referencedEntry[1] + merchandise[itemIndex][1]) {
                    const potentialValue = [referencedEntry[0] + merchandise[itemIndex][0], referencedEntry[1] + merchandise[itemIndex][1]];
                    valueMatrix[currentCapacity] = valueMatrix[currentCapacity][0] < potentialValue[0]
                                                      ? potentialValue.slice()
                                                      : valueMatrix[currentCapacity];
                }
            }
        }
    }
    return valueMatrix[capacityLimit];
}

processInput (require('fs') .readFileSync ('/dev/stdin', 'utf8'));