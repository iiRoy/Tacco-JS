function Main(inputContent) {
    const lines = inputContent.split("\n");
    const elementCount = parseInt(lines[0]);
    const numericValues = lines.slice(1).map(val => parseInt(val));

    const subsequenceEnds = [];

    for (const currentElement of numericValues) {
        let searchLow = 0;
        let searchHigh = subsequenceEnds.length - 1;
        let targetIndex = subsequenceEnds.length;

        while (searchLow <= searchHigh) {
            const midPoint = Math.floor((searchLow + searchHigh) / 2);
            if (subsequenceEnds[midPoint] <= currentElement) {
                targetIndex = midPoint;
                searchHigh = midPoint - 1;
            } else {
                searchLow = midPoint + 1;
            }
        }

        if (targetIndex === subsequenceEnds.length) {
            subsequenceEnds.push(currentElement);
        } else {
            subsequenceEnds[targetIndex] = currentElement;
        }
    }

    console.log(subsequenceEnds.length);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
