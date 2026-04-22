'use strict';

const applicationUnderTest = require('../index');
const serverInitializer = require('kraken-js');
const httpAgent = require('node:http');

let activeWebServer = null;
let totalEvaluationCount = 0;
let failedEvaluationCount = 0;

function verifyCondition(assertionOutcome, failureMessage) {
    if (!assertionOutcome) {
        throw new Error(`Verification Failed: ${failureMessage}`);
    }
}

async function commenceApplicationInstance() {
    return new Promise((completionSignal, rejectionSignal) => {
        serverInitializer.create(applicationUnderTest).listen((errorDuringStart, runningServer) => {
            if (errorDuringStart) {
                return rejectionSignal(errorDuringStart);
            }
            activeWebServer = runningServer;
            completionSignal();
        });
    });
}

async function terminateApplicationInstance() {
    return new Promise((completionSignal, rejectionSignal) => {
        if (activeWebServer) {
            activeWebServer.close((errorDuringClose) => {
                if (errorDuringClose) {
                    return rejectionSignal(errorDuringClose);
                }
                activeWebServer = null;
                completionSignal();
            });
        } else {
            completionSignal();
        }
    });
}

async function executeHelloWorldCheck() {
    totalEvaluationCount++;
    try {
        await commenceApplicationInstance();

        const serverPort = activeWebServer.address().port;
        const endpointURL = `http://127.0.0.1:${serverPort}/`;

        await new Promise((requestCompletion, requestFailure) => {
            httpAgent.get(endpointURL, (responsePayload) => {
                let receivedData = '';
                responsePayload.on('data', (chunkPiece) => {
                    receivedData += chunkPiece;
                });
                responsePayload.on('end', () => {
                    try {
                        verifyCondition(responsePayload.statusCode === 200, `Expected HTTP status 200, received ${responsePayload.statusCode}`);

                        const contentTypeHeader = responsePayload.headers['content-type'];
                        verifyCondition(contentTypeHeader && contentTypeHeader.includes('html'), `Expected Content-Type to contain 'html', received '${contentTypeHeader}'`);

                        verifyCondition(receivedData.includes('Hello, '), `Expected response body to contain 'Hello, ', received '${receivedData.substring(0, 50)}...'`);

                        requestCompletion();
                    } catch (verificationError) {
                        requestFailure(verificationError);
                    }
                });
            }).on('error', (networkError) => {
                requestFailure(networkError);
            });
        });
        console.log('✓ Evaluation: Hello World endpoint responded correctly.');
    } catch (failureReason) {
        failedEvaluationCount++;
        console.error(`✗ Evaluation Failed: ${failureReason.message}`);
    } finally {
        await terminateApplicationInstance();
    }
}

async function initiateVerificationProcess() {
    console.log('Commencing application verification suite...');
    await executeHelloWorldCheck();
    console.log(`\nVerification Summary: ${totalEvaluationCount - failedEvaluationCount} successful, ${failedEvaluationCount} failed out of ${totalEvaluationCount} evaluations.`);

    if (failedEvaluationCount > 0) {
        process.exit(1);
    }
}

initiateVerificationProcess();