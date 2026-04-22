// This file contains tests for the core network discovery module.
loadModule('../support');

// We'll use Chai for assertions in this test suite.
var expect = loadModule('chai').expect;

// Importing the base class for network discovery operations.
var DiscoveryCore = loadModule('../../../').Core;


// Defines a group of specifications for the DiscoveryCore class.
specGroup('Foundation module', function() {

    // A particular scenario focusing on the action extraction utility.
    scenario('extractAction utility', function() {
        // This test verifies that the utility correctly identifies the primary action.
        testCase('yields proper command', function() {
            // Instantiate the core discovery agent.
            let coreAgent = new DiscoveryCore();

            // Prepare a sample raw network packet string.
            var payloadText = [
                'CMD_ACTION /path HTTP/1.0',
                'KEY_ONE: value_alpha',
                'OTHER_FIELD: some text',
                'just a line without a colon',
                'another line'
            ].join('\r\n'); // Join array elements with carriage return and newline.

            // Invoke the internal method to get the action verb.
            const actionVerb = coreAgent._extractAction(payloadText);

            // Assert that the extracted action matches the expected value.
            expect(actionVerb).to.equal('CMD_ACTION');
        }); // End of first test case.
    }); // End of first scenario.


    // Another scenario, this time for retrieving message attributes.
    scenario('parseAttributes function', function() {
        // This test ensures that the function correctly parses header-like attributes.
        testCase('provides accurate metadata', function() {
            // Create a new instance of the discovery core.
            let coreAgent = new DiscoveryCore();

            // Define another sample raw network message.
            var payloadText = [
                'CMD_ACTION /path HTTP/1.0',
                'ATTRIBUTE_A: data_X',
                'ATTRIBUTE_B: data_Y',
                'this line should be ignored as it lacks a proper header format'
            ].join('\r\n'); // Combine lines into a single string.

            // Call the internal method to get the message attributes.
            let messageAttributes = coreAgent._parseAttributes(payloadText);

            // Verify the number of parsed attributes.
            expect(Object.keys(messageAttributes).length).to.equal(2);

            // Check the value of the first attribute.
            expect(messageAttributes.ATTRIBUTE_A).to.equal('data_X');
            // Check the value of the second attribute.
            expect(messageAttributes.ATTRIBUTE_B).to.equal('data_Y');
        }); // End of second test case.
    }); // End of second scenario.

}); // End of main spec group.