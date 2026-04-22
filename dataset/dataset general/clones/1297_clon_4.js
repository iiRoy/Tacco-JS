const systemUtilities = require('util');
const pathing = require('path');
const fileSystem = require('fs');

const identityManifestPath = pathing.join(pathing.dirname(module.filename), 'package.json');
const identityManifestContent = fileSystem.readFileSync(identityManifestPath, 'utf8');
const identityData = JSON.parse(identityManifestContent);
exports.assemblyIdentifier = identityData.version;

function establishConduit(configuration) {
    let internalMatchCounter = 0;
    const processingContext = configuration.persistentContext || {};

    const dispatchSegment = (segmentKey) => {
        const segmentValue = configuration[segmentKey];
        if (segmentValue) {
            if (typeof segmentValue === 'string') {
                configuration.destination.write(segmentValue);
            } else if (typeof segmentValue === 'function') {
                configuration.destination.write(segmentValue());
            } else {
                throw new Error("Unknown insertion: " + segmentKey);
            }
        }
    };

    const processSingleContentLine = async (contentLine) => {
        let contentObject = null;
        try {
            contentObject = JSON.parse(contentLine);
        } catch (e) {
            return;
        }

        let evaluationOutcome = false;
        try {
            evaluationOutcome = configuration.criteria.apply(contentObject, [contentObject, processingContext]);
        } catch (e) {
            return;
        }

        if (!!(evaluationOutcome)) {
            if (internalMatchCounter === 0) {
                dispatchSegment('startSegment');
            }
            internalMatchCounter += 1;

            try {
                const transformedOutput = configuration.render.apply(contentObject, [contentObject, evaluationOutcome, processingContext]);
                if (transformedOutput) {
                    dispatchSegment('prefixSegment');
                    configuration.destination.write(transformedOutput);
                    dispatchSegment('suffixSegment');
                    configuration.destination.write("\n");
                }
            } catch (e) {
                if (configuration.suppressErrors) {
                    return;
                }
                throw e;
            }
        }
    };

    const initiateFlow = async () => {
        let partialLine = "";

        if (configuration.initialLine) {
            await processSingleContentLine(configuration.initialLine);
        }

        configuration.source.setEncoding('utf8');

        const lineGenerator = (async function* () {
            for await (const chunk of configuration.source) {
                const parts = chunk.split(/\r?\n/);
                for (let i = 0; i < parts.length; i++) {
                    let currentPart = parts[i];
                    if (i === 0) {
                        currentPart = partialLine + currentPart;
                        partialLine = "";
                    }

                    if (i === parts.length - 1) {
                        partialLine = currentPart;
                    } else {
                        yield currentPart.replace(/,$/, "");
                    }
                }
            }
            if (partialLine) {
                yield partialLine.replace(/,$/, "");
            }
        })();

        try {
            for await (const currentLine of lineGenerator) {
                await processSingleContentLine(currentLine);
            }
        } catch (error) {
            console.log("!!!!!!!!!!!!!!" + error);
        } finally {
            configuration.destination.write(configuration.endSegment || '');
        }
    };

    return {
        initiateFlow: initiateFlow
    };
}

exports.DataConduit = establishConduit;