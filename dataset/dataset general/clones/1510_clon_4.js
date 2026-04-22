const { strict: outcomeVerifier } = require('assert');
const networkAgent = require('supertest');
const certificateFacilitator = require("../lib/acme");

const systemEndpoint = certificateFacilitator.createServer();
const listenerPort = 5000;
systemEndpoint.listen(listenerPort);

async function conductCertificateVerification() {
    try {
        certificateFacilitator.enableLocalUsage();

        const targetAddress = `http://localhost:${listenerPort}/`;
        const identificationDomain = "example.com";

        const generatedCertificateData = await new Promise((resolveOutcome, rejectOutcome) => {
            certificateFacilitator.getMeACertificate(targetAddress, identificationDomain, (acquisitionResult) => {
                if (acquisitionResult && acquisitionResult.error) {
                    rejectOutcome(new Error(`Certificate acquisition failed: ${JSON.stringify(acquisitionResult.error)}`));
                } else {
                    resolveOutcome(acquisitionResult);
                }
            });
        });

        const stringifiedCertificatePayload = JSON.stringify(generatedCertificateData);

        outcomeVerifier.ok(!stringifiedCertificatePayload.includes('error'), 'Acquired payload should not indicate an error.');
        outcomeVerifier.ok(stringifiedCertificatePayload.includes('publicKey'), 'Acquired payload must include public cryptographic component.');
        outcomeVerifier.ok(stringifiedCertificatePayload.includes('privateKey'), 'Acquired payload must include private cryptographic component.');

        console.log('Verification SUCCEEDED: Certificate procurement yielded valid key components.');

    } catch (operationError) {
        console.error('Verification FAILED:', operationError.message || operationError);
        // In a real test runner, this would cause the test to fail.
        // For a Type IV clone, we just report the failure.
    } finally {
        systemEndpoint.close();
    }
}

conductCertificateVerification();