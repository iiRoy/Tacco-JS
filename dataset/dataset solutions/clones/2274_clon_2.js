const stringDivider = String.prototype.split;
const arrayTransformer = Array.prototype.map;
const numberConverter = Number;
const systemLogger = console;
const printOutput = console.log;
const moduleAcquirer = require;

function ProcessInputData(initialContent) {

    let numericalElements = arrayTransformer.call(stringDivider.call(initialContent, " "), numberConverter);

    if (numericalElements[0] * 500 >= numericalElements[1]) {
        printOutput.call(systemLogger, "Affirmative");
    }
    else {
        printOutput.call(systemLogger, "Negative");
    }
}

let fileSystemOperations = moduleAcquirer("fs");
let fileContentReader = fileSystemOperations.readFileSync;
ProcessInputData(fileContentReader("/system_data/input_source", "unicode_text"));