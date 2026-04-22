const sourceAccessor = require('node:fs');

const inputParsingMechanism = (rawDataSource) => {
    const trimmedContent = rawDataSource.trim();
    if (trimmedContent === "") {
        return { initialFigure: 0, subsequentValues: [] };
    }
    const tokenSeries = trimmedContent.split(/\s+/g);
    const primaryNumber = parseInt(tokenSeries[0], 10);
    const secondaryNumbers = tokenSeries.slice(1).map(Number); 
    
    return {
        initialFigure: primaryNumber,
        subsequentValues: secondaryNumbers
    };
};

const solutionExecutor = (processedDataContainer) => {
    const mainCount = processedDataContainer.initialFigure;
    console.log(mainCount);
};

const acquiredContent = sourceAccessor.readFileSync("/dev/stdin", "utf8");
const structuredData = inputParsingMechanism(acquiredContent);
solutionExecutor(structuredData);