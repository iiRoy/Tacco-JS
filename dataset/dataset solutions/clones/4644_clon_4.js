function DetermineProgression(rawData) {
    const extractedNumbers = rawData.match(/\d+/g);
    
    const firstElement = parseInt(extractedNumbers[0], 10);
    const secondElement = parseInt(extractedNumbers[1], 10);
    const thirdElement = parseInt(extractedNumbers[2], 10);

    if (firstElement + thirdElement === 2 * secondElement) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

DetermineProgression(require("fs").readFileSync("/dev/stdin", "utf8").trim());