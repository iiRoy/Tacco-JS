(() => {
    const acquireStream = function* () {
        const rawData = require("node:fs").readFileSync(0, "utf8").trim();
        const lines = rawData.split("\n");
        for (const dataUnit of lines) {
            yield dataUnit;
        }
    };

    const streamSource = acquireStream();
    const fetchSegment = () => {
        const result = streamSource.next();
        if (result.done) {
            throw new Error("No more data available.");
        }
        return result.value;
    };

    const initialLine = fetchSegment();
    const separatorIndex = initialLine.indexOf(' ');
    const firstValue = Number(initialLine.substring(0, separatorIndex));
    const secondValue = Number(initialLine.substring(separatorIndex + 1));

    const resultant = (1900 * secondValue) + (100 * (firstValue - secondValue) * (2 ** secondValue));

    console.log(resultant);
})();