const programDetailsObject = {
    releaseTagValue: "0.1.11",
    purposeDescription: "instant-fileserver (ifs)"
};

const configurationOptions = [
    {
        shortId: '-d',
        longId: '--dir',
        resultKey: 'directoryPath',
        displayHelp: 'the root directory for the server to service its requests',
        expectsNextValue: true,
        fallbackValue: process.cwd(),
        valueTransformer: String
    },
    {
        shortId: '-r',
        longId: '--readonly',
        resultKey: 'readOnlyModeEnabled',
        displayHelp: 'run the server in read-only mode',
        expectsNextValue: false,
        fallbackValue: false,
        valueTransformer: Boolean
    },
    {
        shortId: '-p',
        longId: '--port',
        resultKey: 'connectionPortNumber',
        displayHelp: 'specify which port to use for handling incoming requests',
        expectsNextValue: true,
        fallbackValue: 1337,
        valueTransformer: Number
    },
    {
        shortId: '-H',
        longId: '--hostname',
        resultKey: 'serverHostName',
        displayHelp: 'specify a hostname for inbound requests',
        expectsNextValue: true,
        fallbackValue: undefined,
        valueTransformer: String
    }
];

function buildDisplayAssistance(definitionsList, detailsObj) {
    let assistanceOutput = `${detailsObj.purposeDescription}\n\n`;
    assistanceOutput += `Version: ${detailsObj.releaseTagValue}\n\n`;
    assistanceOutput += `Usage: node script.js [options]\n\n`;
    assistanceOutput += `Options:\n`;

    const standardAssistance = [
        { shortId: '-h', longId: '--help', displayHelp: 'show this help message and exit' },
        { shortId: null, longId: '--version', displayHelp: 'show program\'s version number and exit' }
    ];

    const allDisplayOptions = definitionsList.concat(standardAssistance);

    const longestFlagText = allDisplayOptions.reduce((currentMax, optEntry) => {
        let currentLength = 0;
        if (optEntry.shortId) currentLength += optEntry.shortId.length;
        if (optEntry.longId) {
            if (optEntry.shortId) currentLength += 2;
            currentLength += optEntry.longId.length;
        }
        return Math.max(currentMax, currentLength);
    }, 0);

    for (const optEntry of allDisplayOptions) {
        let flagRepresentation = '';
        if (optEntry.shortId) flagRepresentation += optEntry.shortId;
        if (optEntry.longId) {
            if (optEntry.shortId) flagRepresentation += ', ';
            flagRepresentation += optEntry.longId;
        }
        assistanceOutput += `  ${flagRepresentation.padEnd(longestFlagText)}  ${optEntry.displayHelp}\n`;
    }
    return assistanceOutput;
}

var acquireConfiguration = module.exports = function processInputStrings(inputSourceArray) {
    const finalConfigurationObject = {};

    for (const definitionEntry of configurationOptions) {
        finalConfigurationObject[definitionEntry.resultKey] = definitionEntry.fallbackValue;
    }

    let currentIndex = 0;
    while (currentIndex < inputSourceArray.length) {
        const currentInputItem = inputSourceArray[currentIndex];

        if (currentInputItem === '-h' || currentInputItem === '--help') {
            process.stdout.write(buildDisplayAssistance(configurationOptions, programDetailsObject));
            process.exit(0);
        }

        if (currentInputItem === '--version') {
            process.stdout.write(`${programDetailsObject.releaseTagValue}\n`);
            process.exit(0);
        }

        let itemProcessed = false;
        for (const definitionEntry of configurationOptions) {
            if (currentInputItem === definitionEntry.shortId || currentInputItem === definitionEntry.longId) {
                if (definitionEntry.expectsNextValue) {
                    if (currentIndex + 1 < inputSourceArray.length) {
                        const rawIncomingValue = inputSourceArray[currentIndex + 1];
                        if (definitionEntry.valueTransformer === Number) {
                            const parsedNumericalValue = parseInt(rawIncomingValue, 10);
                            if (isNaN(parsedNumericalValue)) {
                                process.stderr.write(`Error: Option ${currentInputItem} requires a number, but received "${rawIncomingValue}".\n`);
                                process.exit(1);
                            }
                            finalConfigurationObject[definitionEntry.resultKey] = parsedNumericalValue;
                        } else if (definitionEntry.valueTransformer === Boolean) {
                             finalConfigurationObject[definitionEntry.resultKey] = Boolean(rawIncomingValue);
                        } else {
                            finalConfigurationObject[definitionEntry.resultKey] = rawIncomingValue;
                        }
                        currentIndex++;
                    } else {
                        process.stderr.write(`Error: Option ${currentInputItem} requires an argument.\n`);
                        process.exit(1);
                    }
                } else {
                    finalConfigurationObject[definitionEntry.resultKey] = true;
                }
                itemProcessed = true;
                break;
            }
        }

        if (!itemProcessed) {
            process.stderr.write(`Error: Unrecognized argument: ${currentInputItem}\n`);
            process.exit(1);
        }

        currentIndex++;
    }

    return finalConfigurationObject;
};