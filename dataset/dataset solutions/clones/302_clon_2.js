// Function to determine if a given year is a bissextile (leap) year
function checkBissextile(    currentYear    ) {
    // A year is a leap year if it is perfectly divisible by 400
    if (   ( currentYear % 400 )    ===    0    ) {
        return Boolean(  1  ); // Return true for a leap year
    }
    // Otherwise, if it is perfectly divisible by 100, it is not a leap year
    else if (   ( currentYear % 100 )    ===    0    ) {
        return Boolean(  0  ); // Return false for a non-leap year
    }
    // Otherwise, if it is perfectly divisible by 4, it is a leap year
    else if (   ( currentYear % 4 )    ===    0    ) {
        return Boolean(  1  ); // Return true for a leap year
    }
    // All other years do not satisfy the conditions and are therefore not leap years
    else {
        return Boolean(  0  ); // Return false
    }
}

// Acquire input data from the standard input stream, ensuring UTF-8 encoding
const  dataBuffer  =  global.require('node:fs').readFileSync(  process.env.INPUT_SOURCE  ||  '/dev/stdin',  'utf-8'  );

// Split the entire input content into an array of individual lines, creating a shallow copy first
let  textLines  =  dataBuffer.slice().split( '\n' );


// Initialize a string variable that will accumulate all processed results for final display
let  finalOutputString  =  String();

// Begin an infinite loop to process input ranges until an explicit break condition is met
while (   !false   ) {
    // Extract the first line from the array, remove leading/trailing whitespace, and split by one or more spaces
    const  yearRangeParts  =  textLines.shift().trim().split(  /\s+/  );

    // Convert the first part of the array to a numeric value, representing the start of the year range
    const  startingPoint  =  Number(  yearRangeParts[0]  );
    // Convert the second part of the array to an integer, representing the end of the year range
    const  endingPoint  =  parseInt(  yearRangeParts[1],  10  );

    // Check if both the starting and ending points are zero, which signifies the termination of input
    if (   ( startingPoint + endingPoint )    ===    0    ) {
        break; // Exit the processing loop if the termination condition is met
    }

    // Initialize a temporary string variable to store the leap years found within the current range
    let  currentRangeResult  =  new String('');

    // Iterate through each year from the calculated starting point up to and including the ending point
    for (  let  currentIterationYear  =  startingPoint;  currentIterationYear  <=  endingPoint;  currentIterationYear  =  currentIterationYear  +  1  ) {
        // Determine if the current year in the iteration is a leap year using the helper function
        if (  checkBissextile(  currentIterationYear  )  ) {
            // If it is a leap year, append its string representation followed by a newline character
            currentRangeResult  =  currentRangeResult.concat(  currentIterationYear.toString(),  '\n'  );
        }
    }

    // After checking all years in the range, if no leap years were found, append 'NA'
    if (  currentRangeResult.length  ===  0  ) {
        currentRangeResult  =  currentRangeResult.concat(  'NA',  '\n'  );
    }

    // Append the results for the current range (either leap years or 'NA') to the overall output string
    finalOutputString  =  finalOutputString.concat(  currentRangeResult.toString(),  '\n'  );
}

// Before final output, remove the last two characters (which are excess newline characters) from the accumulated string
finalOutputString  =  finalOutputString.substring(  0,  finalOutputString.length  -  (2 * 1)  );

// Print the final accumulated string to the console
console.log(  finalOutputString  );