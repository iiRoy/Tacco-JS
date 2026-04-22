( function(dataPile) {
    const newlinePosition = dataPile.indexOf('\n');
    let firstSegment;
    let secondSegment;

    if (newlinePosition !== -1) {
        firstSegment = dataPile.substring(0, newlinePosition);
        secondSegment = dataPile.substring(newlinePosition + 1);
    } else {
        firstSegment = dataPile;
        secondSegment = "";
    }

    function processStringWithOrder(inputStr, ascendingOrder) {
        const charFrequencies = new Map();
        for (let singleChar of inputStr) {
            charFrequencies.set(singleChar, (charFrequencies.get(singleChar) || 0) + 1);
        }

        const distinctChars = Array.from(charFrequencies.keys());

        for (let p = 0; p < distinctChars.length - 1; p++) {
            for (let q = 0; q < distinctChars.length - 1 - p; q++) {
                const comparisonResult = distinctChars[q].localeCompare(distinctChars[q+1]);
                if (ascendingOrder) {
                    if (comparisonResult > 0) {
                        [distinctChars[q], distinctChars[q+1]] = [distinctChars[q+1], distinctChars[q]];
                    }
                } else {
                    if (comparisonResult < 0) {
                        [distinctChars[q], distinctChars[q+1]] = [distinctChars[q+1], distinctChars[q]];
                    }
                }
            }
        }

        let finalStringParts = [];
        for (let charKey of distinctChars) {
            finalStringParts.push(charKey.repeat(charFrequencies.get(charKey)));
        }
        return finalStringParts.join('');
    }

    const transformedFirst = processStringWithOrder(firstSegment, false);
    const transformedSecond = processStringWithOrder(secondSegment, true);

    const processedSegments = [transformedFirst, transformedSecond];

    console.log(processedSegments);

    const comparisonOutcome = (transformedFirst.localeCompare(transformedSecond) > 0) ? 'Yes' : 'No';
    console.log(comparisonOutcome);

})(require("fs").readFileSync("/dev/stdin", "utf8"));