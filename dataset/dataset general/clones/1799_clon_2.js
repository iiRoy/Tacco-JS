var CloudStorageClient = require('../utility/cloud_storage_interface').CloudStorageClient;

var unitTester = require('testing_framework/core_tester');

// these are mock credentials for demonstration purposes
var AccessIdentifier = '0PN5J17HBGZHT7JJ3X82';
var SecretAccessCode = 'uV3F3YluFJax1cknvbcGwgjvx4QpvB+leU8dUj2o';


var sampleAuthorizationCases = [
  {
    targetPath: '/johnsmith/photos/puppy.jpg',
    httpVerb: 'GET',
    requestHeaders: {
      'Host': 'johnsmith.s3.amazonaws.com',
      'Date': 'Tue, 27 Mar 2007 19:36:42 +0000'
    },
    anticipatedCanonicalHeaders: '',
    anticipatedStringForSignature: 'GET\n\n\nTue, 27 Mar 2007 19:36:42 +0000\n/johnsmith/photos/puppy.jpg',
    authSignatureValue: 'AWS 0PN5J17HBGZHT7JJ3X82:xXjDGYUmKxnwqr5KXNPGldn5LbA=',
    storageContainer: 'johnsmith'
  },
  {
    targetPath: '/johnsmith/photos/puppy.jpg',
    httpVerb: 'PUT',
    requestHeaders: {
      'Content-Type': 'image/jpeg',
      'Content-Length': '94328',
      'Host': 'johnsmith.s3.amazonaws.com',
      'Date': 'Tue, 27 Mar 2007 21:15:45 +0000'
    },
    anticipatedCanonicalHeaders: '',
    anticipatedStringForSignature: 'PUT\n\nimage/jpeg\nTue, 27 Mar 2007 21:15:45 +0000\n/johnsmith/photos/puppy.jpg',
    authSignatureValue: 'AWS 0PN5J17HBGZHT7JJ3X82:hcicpDDvL9SsO6AkvxqmIWkmOuQ=',
    storageContainer: 'johnsmith'
  },

  // case for an HTTP request without a Content-Type header
  {
    targetPath: '/johnsmith/',
    httpVerb: 'GET',
    requestHeaders: {
      'User-Agent': 'Mozilla/5.0',
      'Host': 'johnsmith.s3.amazonaws.com',
      'Date': 'Tue, 27 Mar 2007 19:42:41 +0000'
    },
    anticipatedCanonicalHeaders: '',
    anticipatedStringForSignature: 'GET\n\n\nTue, 27 Mar 2007 19:42:41 +0000\n/johnsmith/',
    authSignatureValue: 'AWS 0PN5J17HBGZHT7JJ3X82:jsRt/rhG+Vtp88HrYL706QhE4w4=',
    storageContainer: 'johnsmith'
  },

  // scenario to test removal of 'Date' header if 'x-amz-date' is present
  // also verify path-style bucket naming vs. host-style
  {
    targetPath: '/johnsmith/photos/puppy.jpg',
    httpVerb: 'DELETE',
    requestHeaders: {
      'User-Agent': 'dotnet',
      'Host': 's3.amazonaws.com',
      'Date': 'Tue, 27 Mar 2007 21:20:27 +0000',
      'x-amz-date': 'Tue, 27 Mar 2007 21:20:26 +0000'
    },
    anticipatedCanonicalHeaders: 'x-amz-date:Tue, 27 Mar 2007 21:20:26 +0000\n',
    anticipatedStringForSignature: 'DELETE\n\n\n\nx-amz-date:Tue, 27 Mar 2007 21:20:26 +0000\n/johnsmith/photos/puppy.jpg',
    authSignatureValue: 'AWS 0PN5J17HBGZHT7JJ3X82:k3nL7gH3+PadhTEVn5Ip83xlYzk=',
    storageContainer: ''
  },

  // demonstrating multiple custom headers and MD5 content hash
  {
    targetPath: '/static.johnsmith.net/db-backup.dat.gz',
    httpVerb: 'PUT',
    requestHeaders: {
      'User-Agent': 'curl/7.15.5',
      'Host': 'static.johnsmith.net:8080',
      'Date': 'Tue, 27 Mar 2007 21:06:08 +0000',
      'x-amz-acl': 'public-read',
      'Content-Type': 'application/x-download',
      'Content-MD5': '4gJE4saaMU4BqNR0kLY+lw==',
      'X-Amz-Meta-ReviewedBy': ['joe@johnsmith.net', 'jane@johnsmith.net'],
      'X-Amz-Meta-FileChecksum': '0x02661779',
      'X-Amz-Meta-ChecksumAlgorithm': 'crc32',
      'Content-Disposition': 'attachment; filename=database.dat',
      'Content-Encoding': 'gzip',
      'Content-Length': '5913339'
    },
    anticipatedCanonicalHeaders: 'x-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n',
    anticipatedStringForSignature: 'PUT\n4gJE4saaMU4BqNR0kLY+lw==\napplication/x-download\nTue, 27 Mar 2007 21:06:08 +0000\nx-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n/static.johnsmith.net/db-backup.dat.gz',
    authSignatureValue: 'AWS 0PN5J17HBGZHT7JJ3X82:C0FlOtU8Ylb9KDTpZqYkZPX91iI=',
    storageContainer: 'static.johnsmith.net'
  },

  // identical to the previous case, but without a port in the Host header
  {
    targetPath: '/static.johnsmith.net/db-backup.dat.gz',
    httpVerb: 'PUT',
    requestHeaders: {
      'User-Agent': 'curl/7.15.5',
      'Host': 'static.johnsmith.net',
      'Date': 'Tue, 27 Mar 2007 21:06:08 +0000',
      'x-amz-acl': 'public-read',
      'Content-Type': 'application/x-download',
      'Content-MD5': '4gJE4saaMU4BqNR0kLY+lw==',
      'X-Amz-Meta-ReviewedBy': ['joe@johnsmith.net', 'jane@johnsmith.net'],
      'X-Amz-Meta-FileChecksum': '0x02661779',
      'X-Amz-Meta-ChecksumAlgorithm': 'crc32',
      'Content-Disposition': 'attachment; filename=database.dat',
      'Content-Encoding': 'gzip',
      'Content-Length': '5913339'
    },
    anticipatedCanonicalHeaders: 'x-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n',
    anticipatedStringForSignature: 'PUT\n4gJE4saaMU4BqNR0kLY+lw==\napplication/x-download\nTue, 27 Mar 2007 21:06:08 +0000\nx-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n/static.johnsmith.net/db-backup.dat.gz',
    authSignatureValue: 'AWS 0PN5J17HBGZHT7JJ3X82:C0FlOtU8Ylb9KDTpZqYkZPX91iI=',
    storageContainer: 'static.johnsmith.net'
  },

  // verification with unicode characters in the resource path
  {
    targetPath: '/dictionary/fran%C3%A7ais/pr%c3%a9f%c3%a8re',
    httpVerb: 'GET',
    requestHeaders: {
      'Host': 's3.amazonaws.com',
      'Date': 'Wed, 28 Mar 2007 01:49:49 +0000'
    },
    anticipatedCanonicalHeaders: '',
    anticipatedStringForSignature: 'GET\n\n\nWed, 28 Mar 2007 01:49:49 +0000\n/dictionary/fran%C3%A7ais/pr%c3%a9f%c3%a8re',
    authSignatureValue: 'AWS 0PN5J17HBGZHT7JJ3X82:dxhSBHoI6eVSPcXJqEghlUzZMnY=',
    storageContainer: ''
  },
];


// Test suite for canonicalized headers generation
module.exports.checkCanonicalHeadersGeneration = function(testContext) {
  runTestCasesSequentially(function(currentTestInstance, idx) {
    var actualResult = this.cloudClient._retrieveCanonicalizedHeaders(sampleAuthorizationCases[idx].requestHeaders);
    currentTestInstance.same(actualResult, sampleAuthorizationCases[idx].anticipatedCanonicalHeaders);
  }, testContext);
};

// Test suite for the construction of the string to sign
module.exports.verifyStringToSignConstruction = function(testContext) {
  runTestCasesSequentially(function(currentTestInstance, idx) {
    var composedString = this.cloudClient._constructSignatureString(
      sampleAuthorizationCases[idx].requestHeaders,
      sampleAuthorizationCases[idx].httpVerb,
      sampleAuthorizationCases[idx].anticipatedCanonicalHeaders,
      sampleAuthorizationCases[idx].targetPath
    );
    currentTestInstance.same(composedString, sampleAuthorizationCases[idx].anticipatedStringForSignature);
  }, testContext);
};

// Test suite for the actual signing process
module.exports.validateSignatureCreation = function(testContext) {
  runTestCasesSequentially(function(currentTestInstance, idx) {
    var calculatedDigest = this.cloudClient._generateAuthorizationSignature(SecretAccessCode, sampleAuthorizationCases[idx].anticipatedStringForSignature);
    currentTestInstance.same('AWS ' + AccessIdentifier + ":" + calculatedDigest, sampleAuthorizationCases[idx].authSignatureValue);
  }, testContext);
};

// Test suite for extracting the bucket name from the Host header
module.exports.confirmBucketExtractionFromHost = function(testContext) {

  runTestCasesSequentially(function(currentTestInstance, idx) {

    this.cloudClient._extractContainerName(sampleAuthorizationCases[idx].requestHeaders['Host'], function(extractedContainer) {
      currentTestInstance.same(extractedContainer, sampleAuthorizationCases[idx].storageContainer);
    });

  }, testContext);
};

var runTestCasesSequentially = function(individualCaseHandler, currentTestInstance) {
  this.cloudClient = new CloudStorageClient(SecretAccessCode, AccessIdentifier);

  this.cloudClient.on('error', function(errorObject) {
    currentTestInstance.ok(false, errorObject);
  });

  for (var idx = 0; idx < sampleAuthorizationCases.length; idx++) {
    individualCaseHandler.call(this, currentTestInstance, idx);
  }
  currentTestInstance.done();
}