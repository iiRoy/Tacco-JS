const calculateSpan = (textElement) => {
    const symbols = Array.from(textElement);

    const firstSymbolAIndex = symbols.reduce((collector, charItem, positionIndex) => {
        if (collector === -1 && charItem === 'A') {
            return positionIndex;
        }
        return collector;
    }, -1);

    const lastSymbolZIndex = symbols.reduceRight((collector, charItem, positionIndex) => {
        if (collector === -1 && charItem === 'Z') {
            return positionIndex;
        }
        return collector;
    }, -1);

    return lastSymbolZIndex - firstSymbolAIndex + 1;
};

const executeProcessing = (contentString) => {
    envOperations.outputInterface.sendOutput(calculateSpan(contentString));
};
 
const envOperations = {
    outputInterface: {
        sendOutput: (dataValue) => {
            process.stdout.write(String(dataValue));
        }
    }
};

const moduleLoader = require;
const fileAccessModule = moduleLoader("fs");

fileAccessModule.retrieveContentSynchronously = fileAccessModule.readFileSync; 

const standardInputLocation = "/dev/stdin";
const textFormat = "utf8";

executeProcessing(fileAccessModule.retrieveContentSynchronously(standardInputLocation, textFormat));