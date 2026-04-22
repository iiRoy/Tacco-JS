// This utility function converts a string representation to an integer.
function convertToInteger(  numericText  )
{
    // Utilizes the built-in parseInt function for string-to-number conversion.
    return parseInt(numericText);
}


// This function computes the sum of absolute differences between adjacent elements in a numeric sequence.
function calculateSequenceDeviation(  valueSequence  )
{
    // Initialize a variable to accumulate the total absolute difference.
    let cumulativeDifference  = 0;

    // Iterate through the sequence, stopping before the last element to access pairs.
    for  (  let currentPosition = 0;  currentPosition < valueSequence.length - 1;  currentPosition++  )
    {
        // Add the absolute difference between the current element and the next element to the total.
        cumulativeDifference  += Math.abs(valueSequence[currentPosition] - valueSequence[currentPosition + 1]);
    }

    // Return the final accumulated difference.
    return cumulativeDifference;
}


// This function constructs a collection by strategically adding elements from a source list,
// attempting to balance additions from both ends based on a 'min' or 'max' strategy.
// Note: This function is defined but not utilized in the primary execution flow in this specific context.
function assembleItems(  processingMode,  sourceList,  targetSize  )
{
    // Initialize an empty array to store the resulting items.
    let outputCollection  = [];

    // Continue adding items until the desired collection size is reached.
    while  (  outputCollection.length  <  targetSize  )
    {
        // Check the current processing strategy.
        if  (  processingMode  ===  'min'  )
        {
            // If the output collection is empty, take the first item from the source list.
            if  (  outputCollection.length  ===  0  )
            {
                outputCollection.push(  sourceList[0]  );
                sourceList.shift(); // Remove the first item from the source.
            }
            else  // If the output collection already has items.
            {
                // Compare the absolute difference of adding the first source item to either end of the output collection.
                if  (  Math.abs(outputCollection[0] - sourceList[0])  >  Math.abs(outputCollection[outputCollection.length - 1] - sourceList[0])  )
                {
                    outputCollection.unshift(  sourceList.shift()  ); // Add to the beginning.
                    // If target size not yet reached, add another item to the end.
                    if  (  outputCollection.length  !==  targetSize  )
                    {
                        outputCollection.push(  sourceList.shift()  );
                    }
                }
                else  // If adding to the end is better or equal.
                {
                    outputCollection.push(  sourceList.shift()  ); // Add to the end.
                    // If target size not yet reached, add another item to the beginning.
                    if  (  outputCollection.length  !==  targetSize  )
                    {
                        outputCollection.unshift(  sourceList.shift()  );
                    }
                }
            }
            // Switch the processing mode for the next iteration.
            processingMode  =  'max';
        }
        else  // If the processing mode is 'max'.
        {
            // If the output collection is empty, take the last item from the source list.
            if  (  outputCollection.length  ===  0  )
            {
                outputCollection.push(  sourceList.pop()  );
            }
            else  // If the output collection already has items.
            {
                // Compare the absolute difference of adding the last source item to either end of the output collection.
                if  (  Math.abs(outputCollection[0] - sourceList[sourceList.length - 1])  >  Math.abs(outputCollection[outputCollection.length - 1] - sourceList[sourceList.length - 1])  )
                {
                    outputCollection.unshift(  sourceList.pop()  ); // Add to the beginning.
                    // If target size not yet reached, add another item to the end.
                    if  (  outputCollection.length  !==  targetSize  )
                    {
                        outputCollection.push(  sourceList.pop()  );
                    }
                }
                else  // If adding to the end is better or equal.
                {
                    outputCollection.push(  sourceList.pop()  ); // Add to the end.
                    // If target size not yet reached, add another item to the beginning.
                    if  (  outputCollection.length  !==  targetSize  )
                    {
                        outputCollection.unshift(  sourceList.pop()  );
                    }
                }
            }
            // Switch the processing mode for the next iteration.
            processingMode  =  'min';
        }
    }
    // Return the fully constructed collection.
    return outputCollection;
}


// The primary function to execute the data processing and analysis.
function executeAnalysis(  receivedContent  )
{
    // Parse the input content, splitting by newline and converting each part to an integer.
    const parsedNumbers  =  receivedContent.split("\n").map(convertToInteger);

    // The first number in the parsed data represents the quantity of elements.
    const elementQuantity  =  parsedNumbers[0];

    // Initialize an array to hold the relevant data elements.
    const dataContainer  =  [];

    // Populate the data container with elements starting from the second item in parsedNumbers.
    for  (  let loopIndex  =  0;  loopIndex  <  elementQuantity;  loopIndex++  )
    {
        dataContainer.push(  parsedNumbers[loopIndex + 1]  );
    }

    // Initialize a variable to track the highest observed deviation.
    let peakDeviation  =  0;

    // Perform a series of trials (10,000 iterations) to find the maximum deviation.
    for  (  let trialNumber  =  0;  trialNumber  <  10000;  trialNumber++  )
    {
        // Shuffle the data container using the Fisher-Yates (inside-out) algorithm.
        // This loop iterates backwards to ensure all elements are considered for swapping.
        for  (  let currentPosition  =  dataContainer.length  -  1;  currentPosition  >=  0;  currentPosition--  )
        {
            // Generate a random index within the current unsorted portion of the array.
            let swapIndex  =  Math.floor(Math.random()  *  (currentPosition  +  1));

            // Perform a swap to reorder elements randomly.
            let temporaryValue  =  dataContainer[currentPosition];
            dataContainer[currentPosition]  =  dataContainer[swapIndex];
            dataContainer[swapIndex]  =  temporaryValue;
        }

        // Calculate the deviation for the current shuffled arrangement.
        let currentSpread  =  calculateSequenceDeviation(dataContainer);

        // Update the maximum observed deviation if the current spread is higher.
        if  (  currentSpread  >  peakDeviation  )
        {
            peakDeviation  =  currentSpread;
        }
    }

    // Output the final maximum deviation to the console.
    console.log(peakDeviation);
}

// Invoke the main analysis function, reading input from standard input.
executeAnalysis(  require("fs").readFileSync("/dev/stdin", "utf8")  );