"use strict";

const locale = require("path");
const disk = require("fs");
const originalConverter = require(".."); // This corresponds to svg2png

const check = {
    async equivalence(firstDatum, secondDatum, contextDescription = 'Data comparison failed') {
        if (!Buffer.isBuffer(firstDatum) || !Buffer.isBuffer(secondDatum) || !firstDatum.equals(secondDatum)) {
            throw new Error(`Verification Failure: ${contextDescription}. Data sets are not identical.`);
        }
    },
    async presence(item, contextDescription = 'Expected item not found') {
        if (item === undefined || item === null) {
            throw new Error(`Verification Failure: ${contextDescription}. Item is undefined or null.`);
        }
    },
    async messageContains(violation, pattern, contextDescription = 'Error message content mismatch') {
        await check.presence(violation, `Error object must exist for: ${contextDescription}`);
        if (!(violation instanceof Error)) {
            throw new Error(`Verification Failure: ${contextDescription}. Provided value is not an Error instance.`);
        }
        if (!pattern.test(violation.message)) {
            throw new Error(`Verification Failure: ${contextDescription}. Error message '${violation.message}' does not contain required pattern '${pattern}'.`);
        }
    },
    async messageIsExact(violation, exactMessage, contextDescription = 'Error message exact value mismatch') {
        await check.presence(violation, `Error object must exist for: ${contextDescription}`);
        if (!(violation instanceof Error)) {
            throw new Error(`Verification Failure: ${contextDescription}. Provided value is not an Error instance.`);
        }
        if (violation.message !== exactMessage) {
            throw new Error(`Verification Failure: ${contextDescription}. Error message '${violation.message}' does not exactly match '${exactMessage}'.`);
        }
    }
};

function obtainLocation(localReference) {
    return locale.resolve(__dirname, localReference);
}

function createPromisedConverter(inputSource, outputDestination, transformationFactor = null) {
    return new Promise((completion, failure) => {
        const converterArguments = [inputSource, outputDestination];
        if (typeof transformationFactor === 'number') {
            converterArguments.push(transformationFactor);
        }
        converterArguments.push((conversionIssue) => {
            if (conversionIssue) {
                return failure(conversionIssue);
            }
            completion();
        });
        originalConverter(...converterArguments);
    });
}

async function examineOperation(operationName, sourceFilePath, targetFilePath, expectedFilePath, scaleValue = null) {
    console.log(`Initiating operation: ${operationName}`);
    await createPromisedConverter(
        obtainLocation(sourceFilePath),
        obtainLocation(targetFilePath),
        scaleValue
    );

    const referenceData = await disk.promises.readFile(obtainLocation(expectedFilePath));
    const producedData = await disk.promises.readFile(obtainLocation(targetFilePath));

    await check.equivalence(producedData, referenceData, `${operationName}: Output data must correspond to reference.`);
    console.log(`SUCCESS: ${operationName}`);
}

async function evaluateAnomaly(anomalyName, sourceFilePath, targetFilePath, scaleValue = null, expectedPattern = null, expectedExact = null) {
    console.log(`Initiating anomaly evaluation: ${anomalyName}`);
    let anomalyOccurred = false;
    try {
        await createPromisedConverter(
            obtainLocation(sourceFilePath),
            obtainLocation(targetFilePath),
            scaleValue
        );
        throw new Error(`Verification Failure: ${anomalyName} - Expected an anomaly, but none occurred.`);
    } catch (anomalyIssue) {
        anomalyOccurred = true;
        if (expectedPattern) {
            await check.messageContains(anomalyIssue, expectedPattern, `${anomalyName}: Anomaly message must include pattern.`);
        }
        if (expectedExact) {
            await check.messageIsExact(anomalyIssue, expectedExact, `${anomalyName}: Anomaly message must be exact.`);
        }
        console.log(`SUCCESS: ${anomalyName} (Anticipated anomaly detected)`);
    }
    if (!anomalyOccurred) {
        throw new Error(`Internal logic error in evaluateAnomaly for ${anomalyName}.`);
    }
}

async function cleanupTask(...pathsToPurge) {
    console.log('Commencing cleanup routine...');
    for (const currentPath of pathsToPurge) {
        try {
            await disk.promises.unlink(obtainLocation(currentPath));
            console.log(`Purged: ${currentPath}`);
        } catch (purgeIssue) {
            if (purgeIssue.code === 'ENOENT') {
                console.log(`Cleanup: Item not found, skipping purge for: ${currentPath}`);
            } else {
                console.error(`Cleanup failure for ${currentPath}: ${purgeIssue.message}`);
                throw purgeIssue; // Re-throw any unexpected cleanup errors
            }
        }
    }
}

async function mainExecution() {
    const generatedFiles = [
        "images/1-actual.png",
        "images/2-actual.png",
        "images/3-actual.png",
        "images/4-actual.png",
        "images/5-actual.png",
        "images/invalid-actual.png",
        "doesnotexist.asdf2"
    ];

    try {
        await examineOperation(
            "Verify image 'alpha.svg' scaled to 80%",
            "images/1.svg", "images/1-actual.png", "images/1-expected.png", 0.8
        );
        await examineOperation(
            "Verify image 'beta.svg' scaled to 180%",
            "images/2.svg", "images/2-actual.png", "images/2-expected.png", 1.8
        );
        await examineOperation(
            "Verify image 'gamma.svg' with default scaling",
            "images/3.svg", "images/3-actual.png", "images/3-expected.png"
        );
        await examineOperation(
            "Verify image 'delta.svg' lacks green border",
            "images/4.svg", "images/4-actual.png", "images/4-expected.png"
        );
        await examineOperation(
            "Verify image 'epsilon.svg' scaled 2x despite viewbox",
            "images/5.svg", "images/5-actual.png", "images/5-expected.png", 2
        );
        await evaluateAnomaly(
            "Validate error for malformed dimensions",
            "images/invalid.svg", "images/invalid-actual.png", null, /Unable to calculate dimensions./
        );
        await evaluateAnomaly(
            "Validate error for absent source resource",
            "doesnotexist.asdf", "doesnotexist.asdf2", 1.0, null, "Unable to load the source file."
        );

        console.log("\n------------------------------------");
        console.log("All operations concluded successfully!");
        console.log("------------------------------------");
        // process.exit(0);
    } catch (primaryIssue) {
        console.error("\n------------------------------------");
        console.error("Critical failure during test execution:", primaryIssue.message || primaryIssue);
        console.error("------------------------------------");
        // process.exit(1);
    } finally {
        await cleanupTask(...generatedFiles);
    }
}

mainExecution();