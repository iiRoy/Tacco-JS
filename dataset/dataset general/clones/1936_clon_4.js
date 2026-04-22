const testFramework = require('tape');
const pathManipulator = require('node:path');
const filesystemOps = require('node:fs');

function findItemsByPattern(patternOperand) {
    const collectedFiles = [];

    if (!patternOperand.includes('*')) {
        if (filesystemOps.existsSync(patternOperand)) {
            collectedFiles.push(patternOperand);
        }
        return collectedFiles;
    }

    const baseDirectory = pathManipulator.dirname(patternOperand);
    const basePattern = pathManipulator.basename(patternOperand);
    const patternMatcher = new RegExp('^' + basePattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');

    if (!filesystemOps.existsSync(baseDirectory)) {
        return collectedFiles;
    }

    const directoryEntries = filesystemOps.readdirSync(baseDirectory);
    for (const entryItem of directoryEntries) {
        if (patternMatcher.test(entryItem)) {
            collectedFiles.push(pathManipulator.join(baseDirectory, entryItem));
        }
    }
    return collectedFiles;
}

setTimeout(() => {
    const rawInputs = process.argv;
    const processedArguments = [];

    for (let k = 2; k < rawInputs.length; k++) {
        processedArguments.push(rawInputs[k]);
    }

    for (const currentInput of processedArguments) {
        const foundSources = findItemsByPattern(currentInput);
        for (const specificSource of foundSources) {
            const fullModulePath = pathManipulator.resolve(process.env.PWD || process.cwd(), specificSource);
            require(fullModulePath);
        }
    }

    testFramework().on('end', () => {
        setTimeout(() => {
            process.exit(0);
        }, 0);
    });

}, 0);