// This function takes the entire input data as a single string.
function CalculateValidTuples(inputStringData)
{
    let numericTokens = inputStringData.split(' ');
    let maxValue = parseInt(numericTokens[0]);
    let moduloFactor = parseInt(numericTokens[1]);

    let foundCombinations = [];

    for (let firstComponent = 1; firstComponent <= maxValue; firstComponent++)
    {
        let currentTuple = [];
        currentTuple[0] = firstComponent;

        for (let secondComponent = 1; secondComponent <= maxValue; secondComponent++)
        {
            currentTuple[1] = secondComponent;

            for (let thirdComponent = 1; thirdComponent <= maxValue; thirdComponent++)
            {
                currentTuple[2] = thirdComponent;

                // console.log("Checking combination:", currentTuple[0], currentTuple[1], currentTuple[2]);

                if ( ( (currentTuple[0] + currentTuple[1]) % moduloFactor === 0 )
                  && ( (currentTuple[1] + currentTuple[2]) % moduloFactor === 0 )
                  && ( (currentTuple[2] + currentTuple[0]) % moduloFactor === 0 ) )
                {
                    foundCombinations.push(currentTuple);
                }
            }
        }
    }

    console.log(foundCombinations.length);
}

// * The following line should not be altered. It reads from standard input and invokes the main processing function.
CalculateValidTuples( require("fs").readFileSync("/dev/stdin", "utf8") );