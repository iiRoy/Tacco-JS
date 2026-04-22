function processInputData(rawData)
{
    const linesArray = rawData
        .split("\n")
    ;

    const firstLineParts = linesArray[0]
        .split(" ")
    ;
    const elementCount = parseInt(firstLineParts[0], 10)
    ;
    const iterationLimit = parseInt(firstLineParts[1], 10)
    ;

    const dataElements = linesArray[1]
        .split(" ")
    ;

    let currentStack = [];

    const stateHistory = [""];

    for (let outerLoopIndex = 0; outerLoopIndex < iterationLimit; outerLoopIndex++)
    {
        for (let innerLoopIndex = 0; innerLoopIndex < elementCount; innerLoopIndex++)
        {
            const currentDataItem = dataElements[innerLoopIndex];

            const foundPosition = currentStack.indexOf(currentDataItem);

            if (foundPosition !== -1)
            {
                currentStack = currentStack.slice(0, foundPosition);
            }
            else
            {
                currentStack.push(currentDataItem);
            }
        }

        const currentStateString = currentStack.join(" ");

        if (stateHistory.indexOf(currentStateString) === -1)
        {
            stateHistory.push(currentStateString);
        }
        else
        {
            break;
        }
    }

    const cycleStartIdx = stateHistory.indexOf(currentStack.join(" "));

    if (cycleStartIdx === iterationLimit)
    {
        console.log(stateHistory[cycleStartIdx]);
    }
    else
    {
        const cycleLength = stateHistory.length - cycleStartIdx;
        const remainingIterations = iterationLimit - cycleStartIdx;
        const cycleOffset = remainingIterations % cycleLength;

        console.log(stateHistory[cycleStartIdx + cycleOffset]);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));