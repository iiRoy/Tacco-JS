"use strict";

const   ProcessInput   =    (  sourceData )  =>
{
    // The raw input string is parsed into lines for further processing.
    const   dataRows  =  sourceData.trim().split( '\n' );

    // Extract the total number of elements from the first line.
    const   totalElements  =  Number(  dataRows[0].split( ' ' )[0]  );

    // Determine how many top elements to select, also from the first line.
    const   targetCount   =  Number(  dataRows[0].split( ' ' )[1]  );

    // Initialize an array to hold the numeric values from the second line.
    let   collectedNumbers  =  [];

    // Populate the array with individual numbers from the second line of input.
    for  (  let  itemIndex = 0;  itemIndex < totalElements;  itemIndex++  )
    {
        collectedNumbers.push(  dataRows[1].split( ' ' )[itemIndex]  );
    }

    // Define a comparison function for sorting in descending order.
    const   valueOrderer  =  (  secondVal,  firstVal  )  =>
    {
        // This expression results in a descending sort (largest to smallest).
        return   firstVal  -  secondVal;
    };

    // Sort the array of collected numbers using the custom comparison logic.
    collectedNumbers.sort(  valueOrderer  );

    // Initialize a variable to accumulate the sum of selected numbers.
    let   runningTotal   =  0;

    // Iterate through the sorted numbers, summing up the top K elements.
    for  (  let  countIdx = 0;  countIdx < targetCount;  countIdx++  )
    {
        runningTotal  +=  Number(  collectedNumbers[countIdx]  );
    }

    // Output the final computed sum to the console.
    console.log(  runningTotal  );
};

// Execute the main processing function with data read from standard input.
ProcessInput(  require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' )  );