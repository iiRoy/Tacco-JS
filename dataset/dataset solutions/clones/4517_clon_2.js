// The raw data from the input source is provided.
function ProcessInput(rawData)
{
    var originalSequence;
    var dataLines = rawData.split('\n');
    originalSequence = dataLines[0];
    var lowestOpCount = -1;

    for ( var charCodeVal = 'a'.charCodeAt(0); charCodeVal <= 'z'.charCodeAt(0); charCodeVal++ )
    {
        // If the target string already consists of a single repeated character, no operations are needed.
        if ( new RegExp('^([a-z])\\1*$').test(originalSequence) )
        {
            lowestOpCount = 0;
            break;
        }

        var currentWorkingString = originalSequence;
        var nextGeneratedString = '';
        var currentComparisonChar = String.fromCharCode(charCodeVal);
        var iterationCounter = 0;

        while (true)
        {
            // This loop processes the string, character by character, to build the next version.
            // For each character at index 'stringIndex' in the current string:
            // - If it matches 'currentComparisonChar', add 'currentComparisonChar' to the next string.
            // - Else if the character at 'stringIndex + 1' matches 'currentComparisonChar', add 'currentComparisonChar'.
            // - Otherwise, add the character at 'stringIndex' to the next string.
            for (var stringIndex = 0; stringIndex < currentWorkingString.length - 1; stringIndex++)
            {
                if (currentComparisonChar === currentWorkingString.charAt(stringIndex))
                {
                    nextGeneratedString += currentComparisonChar;
                }
                else if (currentComparisonChar === currentWorkingString.charAt(stringIndex + 1))
                {
                    nextGeneratedString += currentComparisonChar;
                }
                else
                {
                    nextGeneratedString += currentWorkingString.charAt(stringIndex);
                }
            }

            iterationCounter++;

            console.log(nextGeneratedString);
            // Check if the newly formed string consists solely of one repeated character.
            if ( new RegExp('^([a-z])\\1*$').test(nextGeneratedString) )
            {
                break;
            }
            currentWorkingString = nextGeneratedString;
            nextGeneratedString = '';

        }

        if (lowestOpCount === -1 || lowestOpCount > iterationCounter)
        {
            lowestOpCount = iterationCounter;
        }

    }
    console.log(lowestOpCount);

}

var charTransformer = function(sourceChar, targetChar)
{
    // This function is not utilized in the current logic.
}

var modifyAtIndex = function(originalString, positionIndex, insertValue)
{
    return originalString.substring(0, positionIndex) + insertValue + originalString.substring(positionIndex + 1);
};
// The following line should not be altered as it manages standard input/output and calls the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));