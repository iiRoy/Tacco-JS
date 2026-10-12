function readNextCount(inputLines, cursorRef) {
    var parsedCount = parseInt(inputLines[cursorRef.value].trim());
    cursorRef.value++;
    return parsedCount;
}

function accumulateEntries(inputLines, cursorRef, entryCount) {
    var registeredNames = [];
    var accumulatedAmounts = [];

    for (var entryIndex = 0; entryIndex < entryCount; ++entryIndex) {
        var fields = inputLines[cursorRef.value].trim().split(" ");
        cursorRef.value++;

        var productValue = parseInt(fields[1]) * parseInt(fields[2]);
        var currentLength = registeredNames.length;
        var wasFound = 0;

        for (var searchIndex = 0; searchIndex < currentLength; ++searchIndex) {
            if (registeredNames[searchIndex] == fields[0]) {
                wasFound = 1;
                accumulatedAmounts[searchIndex] =
                    accumulatedAmounts[searchIndex] + productValue;
                break;
            }
        }

        if (!wasFound) {
            registeredNames.push(fields[0]);
            accumulatedAmounts.push(productValue);
        }
    }

    return {
        names: registeredNames,
        amounts: accumulatedAmounts
    };
}

function printQualifiedEntries(groupedData) {
    var printedAny = 0;
    var listLength = groupedData.names.length;

    for (var index = 0; index < listLength; ++index) {
        if (groupedData.amounts[index] >= 1000000) {
            console.log(groupedData.names[index]);
            printedAny = 1;
        }
    }

    if (!printedAny) {
        console.log("NA");
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputBuffer) {
    var inputLines = inputBuffer.trim().split("\n");
    var cursorRef = { value: 0 };

    while (cursorRef.value < inputLines.length) {
        var numberOfEntries = readNextCount(inputLines, cursorRef);

        if (numberOfEntries === 0) {
            break;
        } else {
            var groupedData = accumulateEntries(
                inputLines,
                cursorRef,
                numberOfEntries
            );

            printQualifiedEntries(groupedData);
        }
    }
});