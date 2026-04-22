function computeCombinations(rawDataString)
{
    const dataLines = rawDataString . split ( "\n" ) ;

    const upperBoundary = parseInt(dataLines[0], 10);

    const factorTally = Array(101).fill(0);

    for (let currentNumber = 1; currentNumber <= upperBoundary; currentNumber++)
    {
        let temporaryNumber = currentNumber;

        for (let divisorCandidate = 2; divisorCandidate <= temporaryNumber; )
        {
            if (temporaryNumber % divisorCandidate === 0)
            {
                factorTally[divisorCandidate]++;
                temporaryNumber /= divisorCandidate;

                if (temporaryNumber === 1)
                {
                    break;
                }
            }
            else
            {
                divisorCandidate++;
            }
        }
    }

    let minimumFourCount = 0;
    let minimumTwoOrThreeCount = 0;

    for (let primeIndex = 2; primeIndex < 101; primeIndex++)
    {
        if (factorTally[primeIndex] === 2 || factorTally[primeIndex] === 3)
        {
            minimumTwoOrThreeCount++;
        }
        if (factorTally[primeIndex] >= 4)
        {
            minimumFourCount++;
        }
    }

    const finalComputedValue =
          minimumTwoOrThreeCount * minimumFourCount * (minimumFourCount - 1) / 2
        + minimumFourCount * (minimumFourCount - 1) * (minimumFourCount - 2) / 2;

    console.log(String(finalComputedValue));
}


function executeDebugTest()
{
    const testDataInput = document.getElementById("testInputBox").value;
    computeCombinations(testDataInput);
}


computeCombinations( require ( 'node:fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;