var ServiceProvider = require('../lib/s3').S3;

var credentialIdentifier = '0PN5J17HBGZHT7JJ3X82';
var secretKeyMaterial = 'uV3F3YluFJax1cknvbcGwgjvx4QpvB+leU8dUj2o';

var validationCases = [
	{
		targetPath : '/johnsmith/photos/puppy.jpg',
		operationType : 'GET',
		requestHeaders : {
			'Host': 'johnsmith.s3.amazonaws.com',
			'Date': 'Tue, 27 Mar 2007 19:36:42 +0000'
		},
		anticipatedCanonicalHeaders : '',
		anticipatedSigningString: 'GET\n\n\nTue, 27 Mar 2007 19:36:42 +0000\n/johnsmith/photos/puppy.jpg',
		expectedAuthSignature: 'AWS 0PN5J17HBGZHT7JJ3X82:xXjDGYUmKxnwqr5KXNPGldn5LbA=',
		storageContainer : 'johnsmith'
	},
	{
		targetPath : '/johnsmith/photos/puppy.jpg',
		operationType : 'PUT',
		requestHeaders : {
			'Content-Type': 'image/jpeg',
			'Content-Length': '94328',
			'Host': 'johnsmith.s3.amazonaws.com',
			'Date': 'Tue, 27 Mar 2007 21:15:45 +0000'
		},
		anticipatedCanonicalHeaders : '',
		anticipatedSigningString : 'PUT\n\nimage/jpeg\nTue, 27 Mar 2007 21:15:45 +0000\n/johnsmith/photos/puppy.jpg',
		expectedAuthSignature: 'AWS 0PN5J17HBGZHT7JJ3X82:hcicpDDvL9SsO6AkvxqmIWkmOuQ=',
		storageContainer : 'johnsmith'
	},
	{
		targetPath : '/johnsmith/',
		operationType : 'GET',
		requestHeaders : {
			'User-Agent': 'Mozilla/5.0',
			'Host': 'johnsmith.s3.amazonaws.com',
			'Date': 'Tue, 27 Mar 2007 19:42:41 +0000'
		},
		anticipatedCanonicalHeaders : '',
		anticipatedSigningString : 'GET\n\n\nTue, 27 Mar 2007 19:42:41 +0000\n/johnsmith/',
		expectedAuthSignature: 'AWS 0PN5J17HBGZHT7JJ3X82:jsRt/rhG+Vtp88HrYL706QhE4w4=',
		storageContainer : 'johnsmith'
	},
	{
		targetPath : '/johnsmith/photos/puppy.jpg',
		operationType : 'DELETE',
		requestHeaders : {
			'User-Agent': 'dotnet',
			'Host': 's3.amazonaws.com',
			'Date': 'Tue, 27 Mar 2007 21:20:27 +0000',
			'x-amz-date': 'Tue, 27 Mar 2007 21:20:26 +0000'
		},
		anticipatedCanonicalHeaders : 'x-amz-date:Tue, 27 Mar 2007 21:20:26 +0000\n',
		anticipatedSigningString : 'DELETE\n\n\n\nx-amz-date:Tue, 27 Mar 2007 21:20:26 +0000\n/johnsmith/photos/puppy.jpg',
		expectedAuthSignature: 'AWS 0PN5J17HBGZHT7JJ3X82:k3nL7gH3+PadhTEVn5Ip83xlYzk=',
		storageContainer : ''
	},
	{
		targetPath : '/static.johnsmith.net/db-backup.dat.gz',
		operationType : 'PUT',
		requestHeaders : {
			'User-Agent': 'curl/7.15.5',
			'Host': 'static.johnsmith.net:8080',
			'Date': 'Tue, 27 Mar 2007 21:06:08 +0000',
			'x-amz-acl': 'public-read',
			'Content-Type': 'application/x-download',
			'Content-MD5': '4gJE4saaMU4BqNR0kLY+lw==',
			'X-Amz-Meta-ReviewedBy': ['joe@johnsmith.net','jane@johnsmith.net'],
			'X-Amz-Meta-FileChecksum': '0x02661779',
			'X-Amz-Meta-ChecksumAlgorithm': 'crc32',
			'Content-Disposition': 'attachment; filename=database.dat',
			'Content-Encoding': 'gzip',
			'Content-Length': '5913339'
		},
		anticipatedCanonicalHeaders : 'x-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n',
		anticipatedSigningString : 'PUT\n4gJE4saaMU4BqNR0kLY+lw==\napplication/x-download\nTue, 27 Mar 2007 21:06:08 +0000\nx-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n/static.johnsmith.net/db-backup.dat.gz',
		expectedAuthSignature: 'AWS 0PN5J17HBGZHT7JJ3X82:C0FlOtU8Ylb9KDTpZqYkZPX91iI=',
		storageContainer : 'static.johnsmith.net'
	},
	{
		targetPath : '/static.johnsmith.net/db-backup.dat.gz',
		operationType : 'PUT',
		requestHeaders : {
			'User-Agent': 'curl/7.15.5',
			'Host': 'static.johnsmith.net',
			'Date': 'Tue, 27 Mar 2007 21:06:08 +0000',
			'x-amz-acl': 'public-read',
			'Content-Type': 'application/x-download',
			'Content-MD5': '4gJE4saaMU4BqNR0kLY+lw==',
			'X-Amz-Meta-ReviewedBy': ['joe@johnsmith.net','jane@johnsmith.net'],
			'X-Amz-Meta-FileChecksum': '0x02661779',
			'X-Amz-Meta-ChecksumAlgorithm': 'crc32',
			'Content-Disposition': 'attachment; filename=database.dat',
			'Content-Encoding': 'gzip',
			'Content-Length': '5913339'
		},
		anticipatedCanonicalHeaders : 'x-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n',
		anticipatedSigningString : 'PUT\n4gJE4saaMU4BqNR0kLY+lw==\napplication/x-download\nTue, 27 Mar 2007 21:06:08 +0000\nx-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n/static.johnsmith.net/db-backup.dat.gz',
		expectedAuthSignature: 'AWS 0PN5J17HBGZHT7JJ3X82:C0FlOtU8Ylb9KDTpZqYkZPX91iI=',
		storageContainer : 'static.johnsmith.net'
	},
	{
		targetPath : '/dictionary/fran%C3%A7ais/pr%c3%a9f%c3%a8re',
		operationType : 'GET',
		requestHeaders : {
			'Host': 's3.amazonaws.com',
			'Date': 'Wed, 28 Mar 2007 01:49:49 +0000'
		},
		anticipatedCanonicalHeaders : '',
		anticipatedSigningString : 'GET\n\n\nWed, 28 Mar 2007 01:49:49 +0000\n/dictionary/fran%C3%A7ais/pr%c3%a9f%c3%a8re',
		expectedAuthSignature: 'AWS 0PN5J17HBGZHT7JJ3X82:dxhSBHoI6eVSPcXJqEghlUzZMnY=',
		storageContainer : ''
	},
];

const assessEquivalence = (actualOutcome, expectedOutcome, assessmentDescription) => {
    if (actualOutcome === expectedOutcome) {
        console.log(`[PASS] ${assessmentDescription}`);
        return true;
    } else {
        console.error(`[FAIL] ${assessmentDescription}`);
        console.error(`       Anticipated: '${expectedOutcome}'`);
        console.error(`       Observed:    '${actualOutcome}'`);
        return false;
    }
};

const assessEquivalenceAsync = (actualOutcome, expectedOutcome, assessmentDescription, completionCallback) => {
    if (actualOutcome === expectedOutcome) {
        console.log(`[PASS] ${assessmentDescription}`);
        completionCallback(true);
    } else {
        console.error(`[FAIL] ${assessmentDescription}`);
        console.error(`       Anticipated: '${expectedOutcome}'`);
        console.error(`       Observed:    '${actualOutcome}'`);
        completionCallback(false);
    }
};

const runValidationSuite = (dataCollection, accessId, secretKey) => {
    const cloudService = new ServiceProvider(secretKey, accessId);
    let totalAssessments = 0;
    let successfulAssessments = 0;
    let pendingAsyncAssessments = 0;

    cloudService.on('error', (err) => {
        console.error(`[CRITICAL] Cloud service component encountered an error: ${err}`);
    });

    const finalizeSuite = () => {
        if (pendingAsyncAssessments === 0) {
            console.log(`\n=== Validation Suite Summary ===`);
            console.log(`Total assertions: ${totalAssessments}`);
            console.log(`Successful assertions: ${successfulAssessments}`);
            console.log(`Failed assertions: ${totalAssessments - successfulAssessments}`);
            if (totalAssessments === successfulAssessments) {
                console.log(`All validation checks completed successfully!`);
            } else {
                console.error(`Some validation checks did not pass.`);
            }
        }
    };

    dataCollection.forEach((currentScenario, scenarioIndex) => {
        console.log(`\n--- Evaluating Scenario ${scenarioIndex + 1} ---`);

        // Canonical Headers validation
        const obtainedCanonicalHeaders = cloudService._getCanonicalizedAmzHeaders(currentScenario.requestHeaders);
        if (assessEquivalence(obtainedCanonicalHeaders, currentScenario.anticipatedCanonicalHeaders, `Scenario ${scenarioIndex + 1} - Canonical Headers Generation`)) {
            successfulAssessments++;
        }
        totalAssessments++;

        // String to Sign validation
        const obtainedSigningString = cloudService._getStringToSign(
            currentScenario.requestHeaders,
            currentScenario.operationType,
            currentScenario.anticipatedCanonicalHeaders,
            currentScenario.targetPath
        );
        if (assessEquivalence(obtainedSigningString, currentScenario.anticipatedSigningString, `Scenario ${scenarioIndex + 1} - String to Sign Construction`)) {
            successfulAssessments++;
        }
        totalAssessments++;

        // Authorization Signature validation
        const obtainedDigest = cloudService._getSignature(secretKey, currentScenario.anticipatedSigningString);
        const derivedAuthHeader = `AWS ${accessId}:${obtainedDigest}`;
        if (assessEquivalence(derivedAuthHeader, currentScenario.expectedAuthSignature, `Scenario ${scenarioIndex + 1} - Authorization Signature Derivation`)) {
            successfulAssessments++;
        }
        totalAssessments++;

        // Container Name Extraction (Asynchronous)
        pendingAsyncAssessments++;
        cloudService._getBucketName(currentScenario.requestHeaders['Host'], (extractedContainer) => {
            assessEquivalenceAsync(extractedContainer, currentScenario.storageContainer, `Scenario ${scenarioIndex + 1} - Container Name Extraction`, (passed) => {
                if (passed) {
                    successfulAssessments++;
                }
                totalAssessments++;
                pendingAsyncAssessments--;
                finalizeSuite();
            });
        });
    });

    if (pendingAsyncAssessments === 0) {
        finalizeSuite();
    }
};

runValidationSuite(validationCases, credentialIdentifier, secretKeyMaterial);