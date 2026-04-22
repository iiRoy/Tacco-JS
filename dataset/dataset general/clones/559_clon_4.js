const fileSystemAccess = require('fs').promises;
const cryptographicUtilities = require('crypto');
const pathUtilities = require('path');

const configurationPath = pathUtilities.join(__dirname, 'checksums.json');

function generateHexDigest(sourceContent) {
    const contentBuffer = Buffer.isBuffer(sourceContent) ? sourceContent : Buffer.from(sourceContent);
    return cryptographicUtilities.createHash('md5').update(contentBuffer).digest('hex');
}

async function validateEncodings(examiner) {
    let mappingData;
    try {
        const rawConfiguration = await fileSystemAccess.readFile(configurationPath);
        mappingData = JSON.parse(rawConfiguration.toString('utf8'));
    } catch (issue) {
        throw new Error(`Failed to load or parse configuration: ${issue.message}`);
    }

    const pathsToProcess = Object.keys(mappingData);
    for (const resourcePath of pathsToProcess) {
        const expectedDigest = mappingData[resourcePath];
        let fileContents;
        try {
            fileContents = await fileSystemAccess.readFile(pathUtilities.join(__dirname, resourcePath));
        } catch (issue) {
            throw new Error(`Failed to read resource file '${resourcePath}': ${issue.message}`);
        }

        const encodedForm = fileContents.toString('base64');
        const computedDigest = generateHexDigest(encodedForm);

        examiner.strictEqual(expectedDigest, computedDigest);
    }
}

function verifyRoundtrip(examiner) {
    const originalPayload = Buffer.from('zeta alpha bravo');
    
    const base64Representation = originalPayload.toString('base64');
    
    const recoveredPayload = Buffer.from(base64Representation, 'base64');

    examiner.strictEqual(originalPayload, recoveredPayload);
}

module.exports = {
    validateEncodings: validateEncodings,
    verifyRoundtrip: verifyRoundtrip
};