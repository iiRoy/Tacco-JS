function processInput(initialString) {
    function performReversal(segment) {
        if (segment.length <= 1) {
            return segment;
        }
        const finalElement = segment[segment.length - 1];
        const precedingElements = segment.substring(0, segment.length - 1);
        return finalElement + performReversal(precedingElements);
    }

    const transformedOutput = performReversal(initialString);
    console.log(transformedOutput);
}

processInput("Harry");