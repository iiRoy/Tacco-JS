function processString(sourceText) {
    const wordPatterns = ['dreamer', 'eraser', 'dream', 'erase'];

    function checkDecomposition(currentSegment) {
        if (currentSegment.length === 0) {
            return true;
        }

        for (let i = 0; i < wordPatterns.length; i++) {
            const currentPattern = wordPatterns[i];
            if (currentSegment.endsWith(currentPattern)) {
                const remainingSegment = currentSegment.slice(0, currentSegment.length - currentPattern.length);
                if (checkDecomposition(remainingSegment)) {
                    return true;
                }
            }
        }
        return false;
    }

    if (checkDecomposition(sourceText)) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

processString(require("fs").readFileSync("/dev/stdin", "utf8"));
