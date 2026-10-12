function processInputData(rawData) {
    const linesArray = rawData.split("\n");
    const firstString = linesArray[0];
    const secondString = linesArray[1];

    const determinePrefixMatch = (strA, strB) => {
        const lengthOfFirstString = strA.length;
        const extractedPrefixFromSecond = strB.slice(0, lengthOfFirstString);
        return strA === extractedPrefixFromSecond;
    };

    const isMatchFound = determinePrefixMatch(firstString, secondString);

    const POSITIVE_RESPONSE = "Yes";
    const NEGATIVE_RESPONSE = "No";

    if (isMatchFound) {
        console.log(POSITIVE_RESPONSE);
    } else {
        console.log(NEGATIVE_RESPONSE);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
