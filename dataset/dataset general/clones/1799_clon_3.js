const AwsS3Service = require('./lib/aws_s3_client').S3Client;
const UnitTester = require('nodeunit/lib/nodeunit');

// Credential details for testing purposes. These are not real keys.
const testCredentials = {
    accessKeyIdentifier: 'SAMPLEKEY1234567890',
    secretAccessCode: 'fakeSecretValueXYZABC1234567890+/=test'
};

// Collection of scenarios for verifying S3 signature generation components.
// Each scenario includes request details and expected outputs for validation.
const signatureValidationCases = [
    {
        // Scenario 1: Basic GET request for an object.
        description: 'Simple GET request for an object with host in header.',
        requestPath: '/user_data/photos/profile.jpg',
        httpVerb: 'GET',
        requestHeaders: {
            'Host': 'user_data.s3.amazonaws.com',
            'Date': 'Mon, 15 Jan 2007 14:30:00 +0000'
        },
        expectedCanonicalAmz: '',
        expectedAuthString: 'GET\n\n\nMon, 15 Jan 2007 14:30:00 +0000\n/user_data/photos/profile.jpg',
        precomputedSignature: 'AWS SAMPLEKEY1234567890:anExampleSignatureHere=',
        targetBucket: 'user_data'
    },
    {
        // Scenario 2: PUT request with content type and length.
        description: 'PUT request for an object with content type and length.',
        requestPath: '/user_data/photos/profile.jpg',
        httpVerb: 'PUT',
        requestHeaders: {
            'Content-Type': 'image/jpeg',
            'Content-Length': '12345',
            'Host': 'user_data.s3.amazonaws.com',
            'Date': 'Mon, 15 Jan 2007 15:45:30 +0000'
        },
        expectedCanonicalAmz: '',
        expectedAuthString: 'PUT\n\nimage/jpeg\nMon, 15 Jan 2007 15:45:30 +0000\n/user_data/photos/profile.jpg',
        precomputedSignature: 'AWS SAMPLEKEY1234567890:anotherExampleSignature=',
        targetBucket: 'user_data'
    },
    {
        description: 'GET request for a bucket, with user agent header.',
        requestPath: '/user_data/',
        httpVerb: 'GET',
        requestHeaders: {
            'User-Agent': 'CustomClient/1.0',
            'Host': 'user_data.s3.amazonaws.com',
            'Date': 'Mon, 15 Jan 2007 14:50:15 +0000'
        },
        expectedCanonicalAmz: '',
        expectedAuthString: 'GET\n\n\nMon, 15 Jan 2007 14:50:15 +0000\n/user_data/',
        precomputedSignature: 'AWS SAMPLEKEY1234567890:yetAnotherExampleSignature=',
        targetBucket: 'user_data'
    },
    {
        description: 'DELETE request with x-amz-date, overriding standard Date header.',
        requestPath: '/user_data/photos/profile.jpg',
        httpVerb: 'DELETE',
        requestHeaders: {
            'User-Agent': 'CustomApp/2.1',
            'Host': 's3.amazonaws.com',
            'Date': 'Mon, 15 Jan 2007 16:00:00 +0000',
            'x-amz-date': 'Mon, 15 Jan 2007 16:00:01 +0000'
        },
        expectedCanonicalAmz: 'x-amz-date:Mon, 15 Jan 2007 16:00:01 +0000\n',
        expectedAuthString: 'DELETE\n\n\n\nx-amz-date:Mon, 15 Jan 2007 16:00:01 +0000\n/user_data/photos/profile.jpg',
        precomputedSignature: 'AWS SAMPLEKEY1234567890:signatureForAmzDateOverride=',
        targetBucket: ''
    },
    {
        description: 'Complex PUT with custom x-amz headers, MD5, and multiple values.',
        requestPath: '/static_assets/database_backup.gz',
        httpVerb: 'PUT',
        requestHeaders: {
            'User-Agent': 'AwesomeTool/3.0',
            'Host': 'assets.example.com:8080',
            'Date': 'Mon, 15 Jan 2007 15:30:00 +0000',
            'x-amz-acl': 'public-read',
            'Content-Type': 'application/octet-stream',
            'Content-MD5': 'anMd5HashValue==',
            'X-Amz-Meta-Tags': ['backup', 'daily'],
            'X-Amz-Meta-Version': '1.2.3',
            'Content-Disposition': 'attachment; filename=backup.gz',
            'Content-Encoding': 'gzip',
            'Content-Length': '9876543'
        },
        expectedCanonicalAmz: 'x-amz-acl:public-read\nx-amz-meta-tags:backup,daily\nx-amz-meta-version:1.2.3\n',
        expectedAuthString: 'PUT\nanMd5HashValue==\napplication/octet-stream\nMon, 15 Jan 2007 15:30:00 +0000\nx-amz-acl:public-read\nx-amz-meta-tags:backup,daily\nx-amz-meta-version:1.2.3\n/static_assets/database_backup.gz',
        precomputedSignature: 'AWS SAMPLEKEY1234567890:complexSignatureExample=',
        targetBucket: 'assets.example.com'
    },
    {
        description: 'Complex PUT without port in host, testing host parsing.',
        requestPath: '/static_assets/database_backup.gz',
        httpVerb: 'PUT',
        requestHeaders: {
            'User-Agent': 'AwesomeTool/3.0',
            'Host': 'assets.example.com',
            'Date': 'Mon, 15 Jan 2007 15:30:00 +0000',
            'x-amz-acl': 'public-read',
            'Content-Type': 'application/octet-stream',
            'Content-MD5': 'anMd5HashValue==',
            'X-Amz-Meta-Tags': ['backup', 'daily'],
            'X-Amz-Meta-Version': '1.2.3',
            'Content-Disposition': 'attachment; filename=backup.gz',
            'Content-Encoding': 'gzip',
            'Content-Length': '9876543'
        },
        expectedCanonicalAmz: 'x-amz-acl:public-read\nx-amz-meta-tags:backup,daily\nx-amz-meta-version:1.2.3\n',
        expectedAuthString: 'PUT\nanMd5HashValue==\napplication/octet-stream\nMon, 15 Jan 2007 15:30:00 +0000\nx-amz-acl:public-read\nx-amz-meta-tags:backup,daily\nx-amz-meta-version:1.2.3\n/static_assets/database_backup.gz',
        precomputedSignature: 'AWS SAMPLEKEY1234567890:anotherComplexSignature=',
        targetBucket: 'assets.example.com'
    },
    {
        description: 'GET request with unicode characters in resource path.',
        requestPath: '/documents/français/préférence',
        httpVerb: 'GET',
        requestHeaders: {
            'Host': 's3.amazonaws.com',
            'Date': 'Mon, 15 Jan 2007 17:00:00 +0000'
        },
        expectedCanonicalAmz: '',
        expectedAuthString: 'GET\n\n\nMon, 15 Jan 2007 17:00:00 +0000\n/documents/français/préférence',
        precomputedSignature: 'AWS SAMPLEKEY1234567890:unicodePathSignature=',
        targetBucket: ''
    },
];

// Helper to run a series of verification steps against the test cases.
const processVerificationCases = function(verificationStepFn, testFramework) {
    // Basic validation for input functions.
    if (typeof verificationStepFn !== 'function') {
        throw new TypeError('The provided verificationStepFn must be a function.');
    }
    if (!testFramework || typeof testFramework.ok !== 'function' || typeof testFramework.done !== 'function') {
        throw new TypeError('Invalid testFramework provided; missing ok or done methods.');
    }

    // Instantiate the S3 client using the test credentials.
    const s3ClientInstance = new AwsS3Service(testCredentials.secretAccessCode, testCredentials.accessKeyIdentifier);

    // Set up a general error handler for the client instance.
    s3ClientInstance.on('error', (err) => {
        testFramework.ok(false, `S3 client error encountered: ${err.message || err}`);
    });

    // Iterate through each predefined scenario and execute the verification logic.
    signatureValidationCases.forEach((currentCase, caseIndex) => {
        // Log the current test case description for better debugging.
        // console.log(`Running test case ${caseIndex + 1}: ${currentCase.description}`);
        verificationStepFn(testFramework, currentCase, caseIndex, s3ClientInstance);
    });

    // Mark the test suite as complete.
    testFramework.done();
};

// --- Test Suite Definitions ---

// Verifies the canonicalized Amazon-specific headers.
exports.verifyCanonicalAmzHeaderFormatting = function(testFramework) {
    processVerificationCases((test, currentCase, idx, client) => {
        const actualCanonicalHeaders = client._generateCanonicalAmzHeaders(currentCase.requestHeaders);
        test.strictEqual(actualCanonicalHeaders, currentCase.expectedCanonicalAmz,
            `Canonical AMZ headers mismatch for case ${idx}: ${currentCase.description}`);
    }, testFramework);
};

// Validates the string that gets signed before hashing.
exports.validateSignatureInputString = function(testFramework) {
    processVerificationCases((test, currentCase, idx, client) => {
        const generatedCanonicalAmz = client._generateCanonicalAmzHeaders(currentCase.requestHeaders);
        const actualStringToSign = client._constructSignatureInput(
            currentCase.requestHeaders,
            currentCase.httpVerb,
            generatedCanonicalAmz,
            currentCase.requestPath
        );
        test.strictEqual(actualStringToSign, currentCase.expectedAuthString,
            `String to sign mismatch for case ${idx}: ${currentCase.description}`);
    }, testFramework);
};

// Confirms the final authorization signature generation.
exports.confirmAuthorizationSignatureGeneration = function(testFramework) {
    processVerificationCases((test, currentCase, idx, client) => {
        const generatedCanonicalAmz = client._generateCanonicalAmzHeaders(currentCase.requestHeaders);
        const stringToSignForDigest = client._constructSignatureInput(
            currentCase.requestHeaders,
            currentCase.httpVerb,
            generatedCanonicalAmz,
            currentCase.requestPath
        );
        const actualDigest = client._computeAuthorizationDigest(testCredentials.secretAccessCode, stringToSignForDigest);
        const expectedAuthFull = `AWS ${testCredentials.accessKeyIdentifier}:${actualDigest}`;
        test.strictEqual(expectedAuthFull, currentCase.precomputedSignature,
            `Authorization digest mismatch for case ${idx}: ${currentCase.description}`);
    }, testFramework);
};

// Determines the bucket name from the host header.
exports.determineBucketNameFromHost = function(testFramework) {
    processVerificationCases((test, currentCase, idx, client) => {
        const hostHeader = currentCase.requestHeaders['Host'];
        if (!hostHeader) {
            test.ok(false, `Host header missing for case ${idx}: ${currentCase.description}`);
            return;
        }

        // The original used a callback, so we maintain that pattern.
        client._extractBucketNameFromHost(hostHeader, (extractedBucketName) => {
            test.strictEqual(extractedBucketName, currentCase.targetBucket,
                `Bucket name from host mismatch for case ${idx}: ${currentCase.description}`);
        });
    }, testFramework);
};