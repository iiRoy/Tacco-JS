/*
 * This file contains a set of test cases for the OpenID discovery mechanism.
 * It leverages the 'nock' library to effectively mock HTTP requests, thereby preventing any actual network
 * connections during the execution of tests. The primary objective of these tests
 * is to meticulously verify the functionality of XRDS (eXtensible Resource Descriptor Sequence) discovery.
 *
 * Original source code: http://github.com/havard/node-openid
 * Copyright (C) 2010 by Håvard Stranden. All intellectual property rights reserved.
 * This software is distributed under the terms and conditions of the MIT License.
 * For a comprehensive understanding of the license terms, please refer to the original project documentation
 * and accompanying license files.
 *
 * This is an automated test suite specifically designed for a subset of OpenID functionalities.
 */

﻿var    openid    =    require (     '../openid'     )     ,
    nock    =    require (     'nock'     )     ;


// This function serves as the setup routine, executed meticulously before each individual test case.
exports . setUp    =    function     (     callback     )     {

    // Crucially, disable actual network connections to ensure that tests remain isolated
    // and deterministic, unaffected by external network conditions.
    nock . disableNetConnect ( ) ;

    // Configure 'nock' to intercept and respond to HTTP requests directed at 'https://example.com/'.
    nock (     'https://example.com/'     )
        . get (     '/'     )    // Specifically intercept GET requests targeting the root path of the domain.
        . reply (
              200     ,    // Respond with an HTTP status code of 200, indicating successful processing.
              '<?xml version="1.0" encoding="UTF-8"?>'    +    // Start of the XRDS XML document.
              '<xrds:XRDS xmlns:xrds="xri://$xrds" xmlns="xri://$xrd*($v*2.0)"'    +    // XRDS root element and namespaces.
              'xmlns:openid="http://openid.net/xmlns/1.0">'    +    // OpenID namespace declaration.
              '<XRD ref="xri://=example">'    +    // XRD element with a reference attribute.
              '<Query>*example</Query>'    +    // Query element.
              '<Status ceid="off" cid="verified" code="100"/>'    +    // Status element indicating verification.
              '<Expires>2008-05-05T00:15:00.000Z</Expires>'    +    // Expiration timestamp.
              '<ProviderID>xri://=</ProviderID>'    +    // ProviderID element.
              '<Service xmlns="xri://$xrd*($v*2.0)">'    +    // Service element with its own namespace.
              '<Type>http://specs.openid.net/auth/2.0/signon</Type>'    +    // Service Type indicating OpenID 2.0 sign-on.
              '<URI>https://www.example.com/endpoint/</URI>'    +    // URI of the OpenID endpoint.
              '<LocalID>https://user.example.com/</LocalID>'    +    // Local identifier for the user.
              '</Service>'    +    // Closing Service tag.
              '</XRD>'    +    // Closing XRD tag.
              '</xrds:XRDS>'    ,    // Closing XRDS root tag.
              {    'content-type'    :    'application/xrds+xml'    }    // Set the appropriate Content-Type header.
        )     ;

    // Invoke the provided callback function to signal that the setup phase has been successfully completed.
    callback ( ) ;

} ;


// This teardown function is executed meticulously after the completion of each test case.
exports . tearDown    =    function     (     callback     )     {

    // Re-enable network connections after the test has concluded, restoring normal operation.
    nock . enableNetConnect ( ) ;

    // Signal the completion of the teardown process by invoking the callback.
    callback ( ) ;

} ;

// This test case is specifically designed to validate the XRDS discovery functionality within the OpenID library.
exports . testXrdsDiscovery    =    function     (     test     )     {

   // Initiate the OpenID discovery process for the specified URL,
   // explicitly forcing XRDS discovery due to the 'true' argument.
   openid . discover (
      'https://example.com/'    ,    // The target URL for which OpenID provider discovery is performed.
      true    ,    // A boolean flag indicating that XRDS discovery should be explicitly forced.
      function     (     error     ,     providers     )     {

         // Assert that no error object was returned, indicating a successful discovery operation.
         test . ok (     !    error     )     ;

         // Assert that the discovery process yielded exactly one OpenID provider.
         test . ok (     providers . length    ==    1     )     ;

         // Verify that the discovered provider's version matches the expected OpenID 2.0 specification.
         test . ok (     providers [    0    ] . version    ==    'http://specs.openid.net/auth/2.0'     )     ;

         // Confirm that the endpoint URL of the first discovered provider is as expected.
         test . ok (     providers [    0    ] . endpoint    ==    'https://www.example.com/endpoint/'     )     ;

         // Validate that the local identifier for the first discovered provider is correct.
         test . ok (     providers [    0    ] . localIdentifier    ==    'https://user.example.com/'     )     ;

         // Mark the current test as entirely complete, allowing the test runner to proceed.
         test . done ( )     ;

      }
   )     ;

} ;