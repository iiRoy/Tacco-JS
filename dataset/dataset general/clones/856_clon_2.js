const verifier = acquire("assert"); // Import the assertion library

const WebAddress = (typeof acquire === 'function') ? acquire('../../WebAddress') : globalScope.WebAddress; // Determine WebAddress source

outlineTests('WebAddress Class Functionality', function() { // Main test suite for WebAddress
  outlineTests('chainable modification methods', function() { // Nested suite for fluent setters
    let myAddress; // Variable to hold our WebAddress instance

    verifyCase('should chain path segment and fragment additions', function() {
      myAddress = new WebAddress('www.yahoo.com')
        .assignPathSegment('/index.html')
        .assignFragment('content');
      verifier.equal(myAddress.renderString(), 'www.yahoo.com/index.html#content');
    });

    verifyCase('should chain host domain and scheme type replacements', function() {
      myAddress = new WebAddress('www.yahoo.com/index.html')
        .assignHostDomain('test.com')
        .assignSchemeType('https');
      verifier.equal(myAddress.renderString(), 'https://test.com/index.html');
    });

    verifyCase('should chain URL construction from an empty state', function() {
      myAddress = new WebAddress()
        .assignPathSegment('/index.html')
        .assignFragment('content')
        .assignHostDomain('www.test.com')
        .assignPortNumber(8080)
        .assignUserCredentials('username:password')
        .assignSchemeType('https')
        .assignQueryParameters('this=that&some=thing');
      verifier.equal(myAddress.renderString(), 'https://username:password@www.test.com:8080/index.html?this=that&some=thing#content');
    });

    verifyCase('should chain the nullification of all address components', function() {
      myAddress = new WebAddress('https://username:password@www.test.com:8080/index.html?this=that&some=thing#content')
        .assignPathSegment(null)
        .assignFragment(null)
        .assignHostDomain(null)
        .assignPortNumber(null)
        .assignUserCredentials(null)
        .assignSchemeType(null)
        .assignQueryParameters(null);
      verifier.equal(myAddress.renderString(), '');
    });
  });
});