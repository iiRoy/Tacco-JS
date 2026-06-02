function processInput(sourceText) {
    const findSegments = (text) => {
        const separatorIndex = text.indexOf(' ');
        if (separatorIndex === -1) {
            return [text, undefined];
        }
        const firstSegment = text.substring(0, separatorIndex);
        const secondSegment = text.substring(separatorIndex + 1);
        return [firstSegment, secondSegment];
    };

    const segments = findSegments(sourceText);
    const initialSegment = segments[0];
    const terminalSegment = segments[1];

    console.log(`${terminalSegment}${initialSegment}`);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
