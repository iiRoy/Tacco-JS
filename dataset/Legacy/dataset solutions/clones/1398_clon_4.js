const processInputContent = (sourceText) => {
    const contentLines = sourceText.split('\n');

    const hasSentinel = contentLines.some(lineItem => lineItem === '?');

    if (hasSentinel) {
        function* lineSupplier(linesArray) {
            let currentPointer = 0;
            for (;;) {
                yield linesArray[currentPointer];
                currentPointer++;
            }
        }

        const lineStream = lineSupplier(contentLines);

        for (;;) {
            const currentExpression = lineStream.next().value;
            console.log(eval(currentExpression));
        }
    }
};

processInputContent(require("fs").readFileSync("/dev/stdin", "utf8"));
