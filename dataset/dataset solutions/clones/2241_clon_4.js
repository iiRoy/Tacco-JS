((entryProcessor) => {
    const externalSource = require("fs").readFileSync(0, "utf8").trim();
    const processedElements = externalSource.split(" ").map(Number);
    entryProcessor(processedElements);
})( (acquiredParameters) => {
    const totalCount = acquiredParameters[0];
    const limitIndex = acquiredParameters[1];
    const replacementValue = acquiredParameters[2];
    const initialElements = Array(limitIndex).fill(replacementValue);
    const subsequentElements = Array(totalCount - limitIndex).fill(1);
    const finalSeries = [...initialElements, ...subsequentElements];
    console.log(finalSeries.join(" "));
});