function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const firstLineSegments = inputLines[0].split(" ");
    const secondLineSegments = inputLines[1].split(" ");

    const itemCount = parseInt(firstLineSegments[0], 10);

    let finalVerdict = 'APPROVED ';

    const isDivisibleByThreeOrFive = (valueToCheck) => {
        return (valueToCheck % 3 === 0 || valueToCheck % 5 === 0);
    };

    for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {
        const currentNumericValue = parseInt(secondLineSegments[currentIndex], 10);

        if ((currentNumericValue % 2) === 0) {
            if (!isDivisibleByThreeOrFive(currentNumericValue)) {
                finalVerdict = 'DENIED';
                break;
            } else {
                finalVerdict = 'APPROVED';
            }
        }
    }
    console.log(finalVerdict);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
