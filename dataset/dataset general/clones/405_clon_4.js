class CommandLineProcessingIssue extends Error {
    constructor(messageContent, isAssistanceRequested = false) {
        super(messageContent);
        this.name = "CommandLineProcessingIssue";
        this.isAssistanceRequested = isAssistanceRequested;
    }
}

function deliverOutput(messageContent) {
    console.error(messageContent);
}

function displayUsageInstructions(specificationList, problemDetails = null) {
    if (problemDetails && !problemDetails.isAssistanceRequested) {
        deliverOutput(`Issue: ${problemDetails.message}\n`);
    }
    deliverOutput("Utilization: utility [parameters] path/to/data.file");
    deliverOutput("\nAvailable Parameters:");

    const formattedUsageLines = specificationList.map(entry => {
        const [shortIndicator, longIndicator, propertyFlags, descriptionText, actionRoutine] = entry;
        
        const indicatorNames = [];
        if (shortIndicator) indicatorNames.push(`-${shortIndicator}`);
        if (longIndicator) indicatorNames.push(`--${longIndicator}`);
        
        let syntaxDescription = indicatorNames.join(', ');
        
        if (propertyFlags.includes(':')) {
            syntaxDescription += ` <value>`;
        }

        const paddingAmount = 25 - syntaxDescription.length;
        if (paddingAmount > 0) {
            syntaxDescription += ' '.repeat(paddingAmount);
        } else {
            syntaxDescription += ' ';
        }

        const requiredMark = propertyFlags.includes('!') ? '*' : ' ';
        const multipleAllowedMark = propertyFlags.includes('+') ? '+' : ' ';

        return `  ${requiredMark}${multipleAllowedMark} ${syntaxDescription}\t${descriptionText}`;
    });

    formattedUsageLines.forEach(line => deliverOutput(line));
}

function processInputParameters(specificationList, rawInputElements) {
    const configuredSettings = {};
    const unflaggedElements = [];
    const activatedMandatoryOptions = new Set();

    const specificationMap = new Map();
    const mandatoryOptionEntries = [];

    specificationList.forEach(entry => {
        const [shortIndicator, longIndicator, propertyFlags, descriptionText, actionRoutine] = entry;
        if (shortIndicator) specificationMap.set(`-${shortIndicator}`, entry);
        if (longIndicator) specificationMap.set(`--${longIndicator}`, entry);
        if (propertyFlags.includes('!')) {
            mandatoryOptionEntries.push(entry);
        }
    });

    try {
        if (!rawInputElements.length) {
            throw new CommandLineProcessingIssue("No input provided.", true);
        }

        const inputTokenStream = [];
        for (const currentElement of rawInputElements) {
            if (currentElement.startsWith('-')) {
                if (currentElement.startsWith('--')) {
                    inputTokenStream.push('--', currentElement.substring(2));
                } else {
                    const transformedShortTokens = currentElement.split('').join('-').split('').slice(1);
                    inputTokenStream.push(...transformedShortTokens);
                }
            } else {
                inputTokenStream.push(currentElement);
            }
        }

        let currentTokenType;
        while ((currentTokenType = inputTokenStream.shift()) !== undefined) {
            if (currentTokenType === '-' || currentTokenType === '--') {
                const optionName = inputTokenStream.shift();
                if (optionName === undefined) {
                    throw new CommandLineProcessingIssue(`Missing option name after '${currentTokenType}'.`);
                }

                if (optionName === 'help' || optionName === 'h') {
                    throw new CommandLineProcessingIssue("Assistance requested.", true);
                }

                const matchedDefinition = specificationMap.get(currentTokenType + optionName);
                
                if (!matchedDefinition) {
                    throw new CommandLineProcessingIssue(`Unknown parameter ${currentTokenType}${optionName} encountered.`);
                }

                const [defShort, defLong, defFlags, defBrief, defAction] = matchedDefinition;
                const targetKey = defLong || defShort;
                let parameterValue = true;

                if (defFlags.includes(':')) {
                    parameterValue = inputTokenStream.shift();
                    if (parameterValue === undefined) {
                        throw new CommandLineProcessingIssue(`Parameter ${currentTokenType}${optionName} expects a value.`);
                    }
                }

                if (defFlags.includes('+')) {
                    if (!configuredSettings[targetKey] || !Array.isArray(configuredSettings[targetKey])) {
                        configuredSettings[targetKey] = [];
                    }
                    configuredSettings[targetKey].push(parameterValue);
                } else {
                    configuredSettings[targetKey] = parameterValue;
                }

                if (defFlags.includes('!')) {
                    activatedMandatoryOptions.add(targetKey);
                }
                
                if (typeof defAction === 'function') {
                    defAction(parameterValue);
                }
            } else {
                unflaggedElements.push(currentTokenType);
            }
        }

        for (const mandatoryEntry of mandatoryOptionEntries) {
            const [defShort, defLong, defFlags, defBrief, defAction] = mandatoryEntry;
            const targetKey = defLong || defShort;
            if (!activatedMandatoryOptions.has(targetKey)) {
                const displayRepresentation = defLong ? `--${defLong}` : `-${defShort}`;
                throw new CommandLineProcessingIssue(`Required parameter ${displayRepresentation} was not given.`);
            }
        }

    } catch (e) {
        if (e instanceof CommandLineProcessingIssue) {
            displayUsageInstructions(specificationList, e);
        } else {
            deliverOutput(`An unexpected internal issue occurred: ${e.message}\n`);
            displayUsageInstructions(specificationList, new CommandLineProcessingIssue("Internal error, please check input."));
        }
        return false;
    }
    
    return {
        configuredSettings: configuredSettings,
        unflaggedElements: unflaggedElements
    };
}