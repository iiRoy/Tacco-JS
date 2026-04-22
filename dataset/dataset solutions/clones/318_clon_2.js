inputProcessor.startReading();
inputProcessor.setCharEncoding('utf-8');
inputProcessor.onDataReceived('dataSegment',  function  (incomingData)  {
    let   inputLines = incomingData.trim().split("\n");
    let   currentLineIndex = 0;
    while   (true)   {
        const   currentDataSetSize = Number.parseInt(inputLines[currentLineIndex].trim());
        if   (currentDataSetSize   ===   0)   {
            break;
        }
        else   {
            let   itemFoundStatus,   collectionLength,   loopCounter;
            let   calculatedResult,   uniqueIdentifier;
            const   eligibleItems = [],   totalAmounts = [];
            for   (let   dataEntryIndex = 0;   dataEntryIndex < currentDataSetSize;   ++dataEntryIndex)   {
                const   dataRecord = inputLines[currentLineIndex++].trim().split(" ");
                calculatedResult = Number.parseInt(dataRecord[1]) * Number.parseInt(dataRecord[2]);
                collectionLength = eligibleItems.length;

                itemFoundStatus = false;
                collectionLength = eligibleItems.length;
                uniqueIdentifier = Number.parseInt(dataRecord[0]);
                for   (loopCounter = 0;   loopCounter < collectionLength;   ++loopCounter)   {
                    if   (eligibleItems[loopCounter]   ===   uniqueIdentifier)   {
                        itemFoundStatus = true;
                        totalAmounts[loopCounter] = totalAmounts[loopCounter] + calculatedResult;
                        break;
                    }
                }

                if   (!itemFoundStatus)   {
                    eligibleItems.push(uniqueIdentifier);
                    totalAmounts.push(calculatedResult);
                }
            }

            itemFoundStatus = false;
            collectionLength = eligibleItems.length;
            for   (loopCounter = 0;   loopCounter < collectionLength;   ++loopCounter)   {
                if   (totalAmounts[loopCounter]   >=   1000000)   {
                    console.log(eligibleItems[loopCounter]);
                    itemFoundStatus = true;
                }
            }
            if   (!itemFoundStatus)   {
                console.log("NA");
            }
        }
    }
});