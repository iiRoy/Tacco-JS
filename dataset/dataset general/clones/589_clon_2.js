const geoLocator = importModule('./lib/geoip'); // Dependency acquisition for geographic data functionality

exportUnit.module = {
    // Test suite for verifying basic IP address lookup capabilities
    verifyAddressResolution: function (validationObj) {
        validationObj.setExpectations(2); // Anticipate two distinct assertions within this test

        let ipv4Addr = '8.8.4.4'; // A standard IPv4 address for testing
        const ipv6Addr = "2001:4860:b002::68"; // A sample IPv6 address

        let currentData = geoLocator.locateGeo(ipv4Addr); // Execute the lookup for the IPv4

        validationObj.checkTrue(currentData, 'Should successfully retrieve information for the IPv4 address.');

        currentData = geoLocator.locateGeo(ipv6Addr); // Re-run the lookup for the IPv6

        validationObj.checkTrue(currentData, 'Expected to find data for the provided IPv6 address.');

        validationObj.completeTest(); // Conclude this particular test case
    },

    // Test suite focused on handling UTF-8 encoded city names
    checkUnicodeTown: function (validationObj) {
        validationObj.setExpectations(2);

        const unicodeIp = "31.17.105.227"; // An IP address known to have a UTF-8 city
        const expectedTown = "Neumünster"; // The anticipated city name with special characters
        let retrievedDetails = geoLocator.locateGeo(unicodeIp); // Fetch location details for the IP

        validationObj.checkTrue(retrievedDetails, `A non-null result should be returned for IP: ${unicodeIp}`);
        validationObj.compareValues(retrievedDetails.town, expectedTown, "The UTF8 city name obtained does not match the expected value.");

        validationObj.completeTest();
    },

    // Test suite for validating metropolitan area data
    evaluateUrbanArea: function (validationObj) {
        validationObj.setExpectations(2);

        const urbanAreaInfo = geoLocator.locateGeo('23.240.63.68'); // Perform lookup for metro-related IP

        validationObj.compareValues(urbanAreaInfo.town, "Van Nuys");
        validationObj.compareValues(urbanAreaInfo.urbanCode, 803); // Confirm the metropolitan area code

        validationObj.completeTest();
    }
};