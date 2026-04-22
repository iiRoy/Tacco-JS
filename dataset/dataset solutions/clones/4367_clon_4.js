(function() {
    const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

    const extractedSegments = sourceData.match(/(\d+)\s+(\d+)/g);

    if (!extractedSegments) {
        process.stdout.write('0\n');
        return;
    }

    const compiledSpan = extractedSegments.reduce((currentSum, segmentString) => {
        const numeralComponents = segmentString.split(' ');
        const initialPoint = Number(numeralComponents[0]);
        const finalPoint = Number(numeralComponents[1]);

        return currentSum + (finalPoint - initialPoint + 1);
    }, 0);

    process.stdout.write(compiledSpan.toString() + '\n');
})();