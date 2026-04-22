function processData(entry) {
    const obtainAllSubsequences = (sourceString) => {
        const lengthOfSource = sourceString.length;
        return Array.from({ length: lengthOfSource }).reduce((collection, _, startIndex) => {
            return collection.concat(
                Array.from({ length: lengthOfSource - startIndex }).map((__, subLengthIndex) => {
                    const currentSubLength = subLengthIndex + 1;
                    return sourceString.slice(startIndex, startIndex + currentSubLength);
                })
            );
        }, []);
    };

    const parts = entry.split(/\s+/);
    const primaryString = parts[0];
    const ordinalPosition = parseInt(parts[1], 10) - 1;

    const rawSubstrings = obtainAllSubsequences(primaryString);

    const distinctOrderedSubstrings = Array.from(new Set(rawSubstrings)).sort();

    const finalResult = distinctOrderedSubstrings[ordinalPosition];

    console.log(String(finalResult));
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));