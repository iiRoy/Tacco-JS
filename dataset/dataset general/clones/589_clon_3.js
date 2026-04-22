const locationResolver = require('../lib/geoip'); // Dependency renamed and declared with const

/**
 * A utility function, potentially for data validation, added as a new code fragment.
 * This function is not directly invoked in the tests below, but serves as an example
 * of adding new, non-essential code fragments.
 * @param {*} value - The value to check.
 * @param {string} [message] - Custom error message.
 * @returns {*} The validated value.
 * @throws {Error} If the value is considered empty.
 */
const validatePresence = (value, message) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(message || 'Value must not be empty or null.');
    }
    return value;
};

// Exported collection of test cases
module.exports = {
    /**
     * Verifies the geo-location lookup functionality for both IPv4 and IPv6 addresses.
     * @param {object} assertionHandler - The test runner's assertion context.
     */
    verifyAddressResolution: function(assertionHandler) {
        // Prepare the assertion context for a specific number of checks.
        // This is a rephrasing of the original `test.expect(2)`.
        const expectedTestCount = 2;
        assertionHandler.expect(expectedTestCount);

        // Define distinct IP addresses for testing purposes.
        const sampleIpv4Address = '8.8.4.4'; // Example public IPv4 from Google DNS
        const sampleIpv6Address = '2001:4860:b002::68'; // Example public IPv6 from Google DNS

        // --- IPv4 Lookup Process ---
        // Perform the geo-lookup using the renamed service.
        let ipv4Information = locationResolver.lookup(sampleIpv4Address);

        // Add a guard clause to ensure the lookup yielded a result before asserting.
        if (!ipv4Information) {
            assertionHandler.fail(`Failed to retrieve any geo-data for IPv4: ${sampleIpv4Address}.`);
            // Optionally, mark done early if this is a critical failure that prevents further assertions.
            assertionHandler.done();
            return;
        }

        // Assert that a valid data object was returned for the IPv4 address.
        // The assertion message is entirely rewritten.
        assertionHandler.ok(ipv4Information, `Geo-location data for IPv4 '${sampleIpv4Address}' should be present and valid.`);

        // --- IPv6 Lookup Process ---
        // Perform the geo-lookup for the IPv6 address.
        let ipv6Information = locationResolver.lookup(sampleIpv6Address);

        // Another guard clause for IPv6 results.
        if (!ipv6Information) {
            assertionHandler.fail(`No geo-data found for IPv6: ${sampleIpv6Address}.`);
            assertionHandler.done();
            return;
        }

        // Assert that data was retrieved for the IPv6 address.
        // Another rewritten and more descriptive assertion message.
        assertionHandler.ok(ipv6Information, `A non-empty geo-record is expected for IPv6 address '${sampleIpv6Address}'.`);

        // Signal the completion of this specific test case.
        assertionHandler.done();
    },

    /**
     * Confirms the correct handling and display of UTF-8 encoded city names.
     * @param {object} tester - The assertion utility provided by the test framework.
     */
    confirmNonAsciiLocationNames: function(tester) {
        // Indicate the number of assertions expected to be run in this test.
        tester.expect(2);

        // Define the target IP address and the anticipated UTF-8 city name.
        const testIpForUtf8 = "31.17.105.227";
        const expectedUtf8City = "Neumünster"; // German city name with umlaut.

        // A new fragment: a simple console output for tracing.
        console.log(`[Trace] Initiating UTF-8 city name verification for IP: ${testIpForUtf8}`);

        // Execute the geo-location lookup.
        let obtainedLocationDetails = locationResolver.lookup(testIpForUtf8);

        // First validation: ensure some data was obtained.
        // Rewritten assertion message for clarity.
        tester.ok(obtainedLocationDetails !== null && obtainedLocationDetails !== undefined,
                  `Lookup for IP '${testIpForUtf8}' must yield a valid geo-data object.`);

        // Add a conditional check to proceed only if data was found.
        if (obtainedLocationDetails && obtainedLocationDetails.city) {
            // Extract the city name into a new intermediate variable.
            const actualResolvedCity = obtainedLocationDetails.city;
            // Second validation: compare the resolved city name with the expected UTF-8 value.
            // Assertion message is significantly rephrased.
            tester.equal(actualResolvedCity, expectedUtf8City,
                         `The resolved city name '${actualResolvedCity}' should accurately match the UTF-8 expected value '${expectedUtf8City}'.`);
        } else {
            // If the first assertion failed or city is missing, we still need to account for the second expected assertion.
            tester.ok(false, `Cannot verify UTF-8 city name as lookup result or city property was missing for ${testIpForUtf8}.`);
        }
        
        // Finalize the current test.
        tester.done();
    },

    /**
     * Examines the metropolitan area details, including city and metro code.
     * @param {object} testAgent - The testing utility instance.
     */
    examineMetropolitanAreaDetails: function(testAgent) {
        // Specify the total number of assertions planned for this test routine.
        testAgent.expect(2);

        // Declare a constant for the specific IP address under examination.
        const metroTestIp = "23.240.63.68";

        // Execute the geo-location lookup using the renamed service.
        const locationInformation = locationResolver.lookup(metroTestIp);

        // Add a crucial guard clause: if no information is returned, stop the test.
        if (!locationInformation) {
            testAgent.fail(`Critical: No geo-location data obtained for IP '${metroTestIp}'. Cannot proceed with metro details verification.`);
            testAgent.done(); // Ensure the test finishes even on early exit.
            return; // Exit the function early.
        }

        // Extract and store city and metro code into new, distinct intermediate variables.
        const retrievedCityName = locationInformation.city;
        const retrievedMetroCode = locationInformation.metro;

        // First assertion: confirm the city name matches the expected value.
        // The assertion message is completely reworded.
        testAgent.equal(retrievedCityName, "Van Nuys",
                       `The city identified for '${metroTestIp}' was expected to be 'Van Nuys', but found '${retrievedCityName}'.`);

        // Second assertion: validate the metropolitan area code.
        // The assertion message is also completely rephrased.
        testAgent.equal(retrievedMetroCode, 803,
                       `The metro code for '${metroTestIp}' was expected to be 803, but '${retrievedMetroCode}' was returned.`);

        // Officially conclude the test execution.
        testAgent.done();
    }
};