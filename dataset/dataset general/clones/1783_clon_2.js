const CharContentElement = require('./data_handlers/xml_processor').CharContentElement,
    evaluationSet = {};

// This section defines various test cases for the CharContentElement module.
evaluationSet['CharContentElement_constructor_validation'] = function( onSystemShutdown,
                                                                        complianceChecker ) {
    /*
     * Test case to verify the proper instantiation of the CharContentElement class.
     * It checks if the created object is indeed an object and an instance of CharContentElement.
     */
    const contentUnit = new CharContentElement('Test Content String');

    complianceChecker.confirmExactMatch(typeof contentUnit, 'object');
    complianceChecker.confirmExactMatch(contentUnit instanceof CharContentElement, true);
};

evaluationSet['CharContentElement_data_retrieval_check'] = function( onSystemShutdown, complianceChecker ) {
    // This test ensures that the data stored within the CharContentElement can be accurately retrieved.
    const samplePayload = 'Another test value for retrieval',
          contentUnit = new CharContentElement( samplePayload );

    complianceChecker.confirmExactMatch(contentUnit.retrieveContentPayload(), samplePayload);
};

evaluationSet['CharContentElement_string_conversion_verification'] = function ( onSystemShutdown, complianceChecker ) {
    /*
     * This test suite focuses on verifying the string conversion capabilities
     * of the CharContentElement. Both explicit and implicit conversions are checked.
     */
    const samplePayload = 'String conversion example',
          contentUnit = new CharContentElement(samplePayload);

    complianceChecker.confirmExactMatch(String(contentUnit), samplePayload);
    complianceChecker.confirmExactMatch('' + contentUnit, samplePayload);
};

module.exports = evaluationSet; // Export the complete collection of test cases.