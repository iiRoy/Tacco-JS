function processInputData(rawDataSet)
{

    const targetNumericValue = Number(rawDataSet);

    let resultsCollection = [];

    for
    (
        let loopCounter = 1;
        loopCounter * loopCounter <= targetNumericValue;
        loopCounter++
    )
    {
        let firstDivisorResult = targetNumericValue / loopCounter;

        let secondDivisorResult = targetNumericValue / firstDivisorResult;

        resultsCollection.push(
            Math.max(
                firstDivisorResult.toString().length,
                secondDivisorResult.toString().length
            )
        );
    }

    console.log(
        resultsCollection.sort(
            function (valueOne, valueTwo)
            {
                return valueOne - valueTwo;
            }
        )[0]
    );
}

processInputData(
    require('fs')
        .readFileSync('/dev/stdinput', 'utfEightEncoding')
);