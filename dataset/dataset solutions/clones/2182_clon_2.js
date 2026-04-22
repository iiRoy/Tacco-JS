"use strict";

function processInput(inputData)
{
    // Extract numerical values from the provided input string
    const limitVal = Number(inputData.trim().split("\n")[0]);
    const requiredOneBits = Number(inputData.trim().split("\n")[1]);

    // Compute the final result using the core logic function
    let finalResult = calculateCombinations(limitVal, requiredOneBits);

    // Display the computed result
    console.log(finalResult);
}

// Invoke the main processing function with data from standard input
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));


function calculateCombinations(upperBound, desiredSetBits)
{
    // Determine the number of digits in the upper bound
    const numDigits = String(upperBound).length;
    let totalCount = 0;

    // Iterate through potential mask values up to a certain limit (e.g., 100 for this problem's context)
    for (let currentNumber = 0; currentNumber < 100; currentNumber++)
    {
        const binaryPattern = currentNumber.toString(2);

        // If the binary pattern exceeds the digit length of the upper bound, stop
        if (binaryPattern.length > numDigits)
        {
            break;
        }

        // Check if the number of '1's in the binary pattern matches the desired count
        const actualOneBits = binaryPattern.split('1').length - 1;
        if (actualOneBits !== desiredSetBits)
        {
            continue; // Skip if the '1's count doesn't match
        }

        // Handle cases based on the length of the binary pattern relative to the upper bound
        if (binaryPattern.length < numDigits)
        {
            // Case where the pattern length is less than the maximum digit count
            // Add combinations based on powers of 9 for remaining positions
            totalCount += Math.pow(9, actualOneBits);
        }
        else
        {
            // Case where the pattern length is equal to the maximum digit count
            // Iterate through possible three-digit replacement numbers
            for (let substituteNum = 111; substituteNum <= 999; substituteNum++)
            {
                // Skip numbers containing '0'
                if (!(String(substituteNum).split("0").length === 1))
                {
                    continue;
                }

                // Apply the binary pattern to the replacement number
                const transformedValue = applyPatternToNumber(binaryPattern, substituteNum);

                // If the transformed value exceeds the upper bound, stop for this pattern
                if (transformedValue > upperBound)
                {
                    break;
                }
                // Increment the total count for a valid combination
                totalCount++;
            }
        }

    }
    return totalCount;
}

function applyPatternToNumber(bitPattern, replacementDigits)
{
    // Reverse the bit pattern and replacement digits for easier processing
    const reversedPatternBits = String(bitPattern).split("").reverse();
    const reversedReplacementDigits = String(replacementDigits).split("").reverse();
    let constructedValueParts = [];
    let digitPointer = 0;

    // Iterate through the reversed bit pattern
    for (let patternIndex = 0; patternIndex < reversedPatternBits.length; patternIndex++)
    {
        // If the current bit is '1', use a digit from the replacement number
        if (reversedPatternBits[patternIndex] === '1')
        {
            constructedValueParts.push(reversedReplacementDigits[digitPointer]);
            digitPointer++;
        }
        else
        {
            // Otherwise, use the bit itself (which would be '0')
            constructedValueParts.push(reversedPatternBits[patternIndex]);
        }
    }
    // Reconstruct the number by reversing and joining the parts
    return Number(constructedValueParts.reverse().join(""));
}