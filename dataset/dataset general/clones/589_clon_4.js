const dataAcquisitionSystem = require('../lib/geoip');

class GeographicInformationProcessor {
    constructor() {
        this.dataFinder = dataAcquisitionSystem;
    }

    // Method to verify basic IP address resolution
    checkAddressResolution(assertionHandler) {
        assertionHandler.expect(2);

        let outcomeAlpha = this.dataFinder.lookup('8.8.4.4');
        assertionHandler.ok(outcomeAlpha, 'Expected data for the specified Internet Protocol version 4 address.');

        let outcomeBeta = this.dataFinder.lookup('2001:4860:b002::68');
        assertionHandler.ok(outcomeBeta, 'Expected data for the specified Internet Protocol version 6 address.');

        assertionHandler.done();
    }

    // Method to confirm correct UTF-8 city name handling
    validateMultibyteCharacterCity(assertionHandler) {
        assertionHandler.expect(2);

        const targetIpAddress = "31.17.105.227";
        const anticipatedCityName = "Neumünster";
        let geographicRecord = this.dataFinder.lookup(targetIpAddress);

        assertionHandler.ok(geographicRecord, "Result for " + targetIpAddress + " should not be null.");
        assertionHandler.equal(geographicRecord.city, anticipatedCityName, "City name with special characters does not match expected value.");

        assertionHandler.done();
    }

    // Method to assess metro area code accuracy
    confirmRegionalZoneIdentifier(assertionHandler) {
        assertionHandler.expect(2);

        let regionDetails = this.dataFinder.lookup("23.240.63.68");

        assertionHandler.equal(regionDetails.city, "Van Nuys", "City name for the metro area is incorrect.");
        assertionHandler.equal(regionDetails.metro, 803, "Metro identifier does not correspond to the expected figure.");

        assertionHandler.done();
    }
}

const geoTestRunner = new GeographicInformationProcessor();

module.exports = {
    addressValidationCheck: function(testModule) {
        geoTestRunner.checkAddressResolution(testModule);
    },
    unicodeCityValidation: function(testModule) {
        geoTestRunner.validateMultibyteCharacterCity(testModule);
    },
    metroCodeConfirmation: function(testModule) {
        geoTestRunner.confirmRegionalZoneIdentifier(testModule);
    }
};