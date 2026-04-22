var S3 = require( '../lib/s3' ).S3; /* Importing the S3 object from its library. */

var nodeunit = require( 'caolan-nodeunit/lib/nodeunit' ); // Nodeunit testing framework import.

// These keys are placeholders and not actual AWS credentials.
// For testing purposes only.
var AWSAccessKeyId = '0PN5J17HBGZHT7JJ3X82';
var AWSSecretAccessKey = 'uV3F3YluFJax1cknvbcGwgjvx4QpvB+leU8dUj2o'; // Secret key for AWS authentication.


var testData =
[
  /* Test case 1: Basic GET request for a resource. */
  {
    resource : '/johnsmith/photos/puppy.jpg',
    method : 'GET',
    header :
    {
      'Host'         : 'johnsmith.s3.amazonaws.com',
      'Date'         : 'Tue, 27 Mar 2007 19:36:42 +0000'
    },
    expectedCanonicalHeaders : '',
    expectedStringToSign     : 'GET\n\n\nTue, 27 Mar 2007 19:36:42 +0000\n/johnsmith/photos/puppy.jpg',
    authorizationDigest      : 'AWS 0PN5J17HBGZHT7JJ3X82:xXjDGYUmKxnwqr5KXNPGldn5LbA=',
    bucket                   : 'johnsmith'
  }, /* End of test case 1. */


  /* Test case 2: PUT request with Content-Type and Content-Length. */
  {
    resource : '/johnsmith/photos/puppy.jpg',
    method   : 'PUT',
    header   :
    {
      'Content-Type'   : 'image/jpeg',
      'Content-Length' : '94328',
      'Host'           : 'johnsmith.s3.amazonaws.com',
      'Date'           : 'Tue, 27 Mar 2007 21:15:45 +0000'
    },
    expectedCanonicalHeaders : '',
    expectedStringToSign     : 'PUT\n\nimage/jpeg\nTue, 27 Mar 2007 21:15:45 +0000\n/johnsmith/photos/puppy.jpg',
    authorizationDigest      : 'AWS 0PN5J17HBGZHT7JJ3X82:hcicpDDvL9SsO6AkvxqmIWkmOuQ=',
    bucket                   : 'johnsmith'
  }, /* End of test case 2. */


  /* Test case 3: GET request for a bucket, no content type. */
  {
    resource                 : '/johnsmith/',
    method                   : 'GET',
    header                   :
    {
      'User-Agent' : 'Mozilla/5.0',
      'Host'       : 'johnsmith.s3.amazonaws.com',
      'Date'       : 'Tue, 27 Mar 2007 19:42:41 +0000'
    },
    expectedCanonicalHeaders : '',
    expectedStringToSign     : 'GET\n\n\nTue, 27 Mar 2007 19:42:41 +0000\n/johnsmith/',
    authorizationDigest      : 'AWS 0PN5J17HBGZHT7JJ3X82:jsRt/rhG+Vtp88HrYL706QhE4w4=',
    bucket                   : 'johnsmith'
  }, /* End of test case 3. */


  /* Test case 4: DELETE request with x-amz-date and path-style bucket. */
  {
    resource                 : '/johnsmith/photos/puppy.jpg',
    method                   : 'DELETE',
    header                   :
    {
      'User-Agent' : 'dotnet',
      'Host'       : 's3.amazonaws.com',
      'Date'       : 'Tue, 27 Mar 2007 21:20:27 +0000',
      'x-amz-date' : 'Tue, 27 Mar 2007 21:20:26 +0000'
    },
    expectedCanonicalHeaders : 'x-amz-date:Tue, 27 Mar 2007 21:20:26 +0000\n',
    expectedStringToSign     : 'DELETE\n\n\n\nx-amz-date:Tue, 27 Mar 2007 21:20:26 +0000\n/johnsmith/photos/puppy.jpg',
    authorizationDigest      : 'AWS 0PN5J17HBGZHT7JJ3X82:k3nL7gH3+PadhTEVn5Ip83xlYzk=',
    bucket                   : ''
  }, /* End of test case 4. */


  /* Test case 5: PUT with multiple custom headers and MD5. */
  {
    resource                 : '/static.johnsmith.net/db-backup.dat.gz',
    method                   : 'PUT',
    header                   :
    {
      'User-Agent'               : 'curl/7.15.5',
      'Host'                     : 'static.johnsmith.net:8080',
      'Date'                     : 'Tue, 27 Mar 2007 21:06:08 +0000',
      'x-amz-acl'                : 'public-read',
      'Content-Type'             : 'application/x-download',
      'Content-MD5'              : '4gJE4saaMU4BqNR0kLY+lw==',
      'X-Amz-Meta-ReviewedBy'    : ['joe@johnsmith.net','jane@johnsmith.net'],
      'X-Amz-Meta-FileChecksum'  : '0x02661779',
      'X-Amz-Meta-ChecksumAlgorithm' : 'crc32',
      'Content-Disposition'      : 'attachment; filename=database.dat',
      'Content-Encoding'         : 'gzip',
      'Content-Length'           : '5913339'
    },
    expectedCanonicalHeaders : 'x-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n',
    expectedStringToSign     : 'PUT\n4gJE4saaMU4BqNR0kLY+lw==\napplication/x-download\nTue, 27 Mar 2007 21:06:08 +0000\nx-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n/static.johnsmith.net/db-backup.dat.gz',
    authorizationDigest      : 'AWS 0PN5J17HBGZHT7JJ3X82:C0FlOtU8Ylb9KDTpZqYkZPX91iI=',
    bucket                   : 'static.johnsmith.net'
  }, /* End of test case 5. */


  /* Test case 6: Same as above but without a port number in the Host header. */
  {
    resource                 : '/static.johnsmith.net/db-backup.dat.gz',
    method                   : 'PUT',
    header                   :
    {
      'User-Agent'               : 'curl/7.15.5',
      'Host'                     : 'static.johnsmith.net',
      'Date'                     : 'Tue, 27 Mar 2007 21:06:08 +0000',
      'x-amz-acl'                : 'public-read',
      'Content-Type'             : 'application/x-download',
      'Content-MD5'              : '4gJE4saaMU4BqNR0kLY+lw==',
      'X-Amz-Meta-ReviewedBy'    : ['joe@johnsmith.net','jane@johnsmith.net'],
      'X-Amz-Meta-FileChecksum'  : '0x02661779',
      'X-Amz-Meta-ChecksumAlgorithm' : 'crc32',
      'Content-Disposition'      : 'attachment; filename=database.dat',
      'Content-Encoding'         : 'gzip',
      'Content-Length'           : '5913339'
    },
    expectedCanonicalHeaders : 'x-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n',
    expectedStringToSign     : 'PUT\n4gJE4saaMU4BqNR0kLY+lw==\napplication/x-download\nTue, 27 Mar 2007 21:06:08 +0000\nx-amz-acl:public-read\nx-amz-meta-checksumalgorithm:crc32\nx-amz-meta-filechecksum:0x02661779\nx-amz-meta-reviewedby:joe@johnsmith.net,jane@johnsmith.net\n/static.johnsmith.net/db-backup.dat.gz',
    authorizationDigest      : 'AWS 0PN5J17HBGZHT7JJ3X82:C0FlOtU8Ylb9KDTpZqYkZPX91iI=',
    bucket                   : 'static.johnsmith.net'
  }, /* End of test case 6. */


  /* Test case 7: Unicode characters in the resource path. */
  {
    resource                 : '/dictionary/fran%C3%A7ais/pr%c3%a9f%c3%a8re',
    method                   : 'GET',
    header                   :
    {
      'Host' : 's3.amazonaws.com',
      'Date' : 'Wed, 28 Mar 2007 01:49:49 +0000'
    },
    expectedCanonicalHeaders : '',
    expectedStringToSign     : 'GET\n\n\nWed, 28 Mar 2007 01:49:49 +0000\n/dictionary/fran%C3%A7ais/pr%c3%a9f%c3%a8re',
    authorizationDigest      : 'AWS 0PN5J17HBGZHT7JJ3X82:dxhSBHoI6eVSPcXJqEghlUzZMnY=',
    bucket                   : ''
  } /* End of test case 7. */
]; // This array holds all the test scenarios.


/*
 * This section defines the exportable test functions for Nodeunit.
 * Each function tests a specific part of the S3 signature generation process.
 */

// Test for canonicalized AMZ headers.
exports.testGetCanonicalizedAmzHeaders = function( test )
{
  executeTestInLoop( function( test, i )
  {
    var result = s3._getCanonicalizedAmzHeaders( testData[ i ].header ); // Get canonical headers.
    test.same( result, testData[ i ].expectedCanonicalHeaders );        // Compare with expected.
  }, test );
};

// Test for the string that is to be signed.
exports.testGetStringToSign = function( test )
{
  executeTestInLoop( function( test, i )
  {
    var stringToSign = s3._getStringToSign(
      testData[ i ].header,
      testData[ i ].method,
      testData[ i ].expectedCanonicalHeaders,
      testData[ i ].resource
    ); // Generate the string to sign.
    test.same( stringToSign, testData[ i ].expectedStringToSign ); // Assert it matches the expectation.
  }, test );
};

// Test for the final signature generation.
exports.testGetSignature = function( test )
{
  executeTestInLoop( function( test, i )
  {
    var digest = s3._getSignature( AWSSecretAccessKey, testData[ i ].expectedStringToSign ); // Generate signature digest.
    test.same( 'AWS ' + AWSAccessKeyId + ":" + digest, testData[ i ].authorizationDigest );  // Verify authorization string.
  }, test );
};

// Test for extracting the bucket name from the host header.
exports.testGetBucketFromHost = function( test )
{
  executeTestInLoop( function( test, i )
  {
    // Asynchronous call to get bucket name.
    this.s3._getBucketName( testData[ i ].header[ 'Host' ], function( bucket )
    {
      test.same( bucket, testData[ i ].bucket ); // Compare extracted bucket with expected.
    } );
  }, test );
};

/**
 * Helper function to iterate through testData and run a given test function for each entry.
 * @param {Function} testToRun The individual test function to execute for each data entry.
 * @param {Object}   test      The nodeunit test object.
 */
var executeTestInLoop = function( testToRun, test )
{
  this.s3 = new S3( AWSSecretAccessKey, AWSAccessKeyId ); // Initialize S3 instance for tests.

  // Set up error handling for the S3 instance.
  this.s3.on( 'error', function( err )
  {
    test.ok( false, err ); // Fail the test if an S3 error occurs.
  } );

  // Loop through all test data entries.
  for ( var i = 0; i < testData.length; i++ )
  {
    testToRun( test, i ); // Execute the provided test function with current data index.
  }
  test.done(); // Signal that all tests in this group are complete.
};