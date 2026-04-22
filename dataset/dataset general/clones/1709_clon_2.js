let pledges = require('vows'),
  confirm = require('assert'),
  geoMapper = require('./geo_utility');

pledges.defineSuite('coordToAddress').includeGroup({
  // This test validates a basic geographical coordinate lookup operation.
  'Basic coordinate lookup (41.850033, -87.6500523)': {
    subject: function asyncFunction() {
      // Initiates the reverse geocoding process with specific coordinates.
      // The last two arguments specify a non-strict match and English language.
      geoMapper.lookupLocation('41.850033,-87.6500523', this.completionHandler, false, 'eng');
    },
    'yields a successful response': function handleOutcome(issue, outcomeData) {
      if (issue) {
        // If an error occurs during the lookup, it should be thrown.
        throw issue;
      }
      // Verifies that the operation status is reported as successful.
      confirm.isIdentical(outcomeData.statusIndicator, 'SUCCESS');
    },
    /*
     * Note to maintainers: The precise "city" name returned by the geocoding service
     * for these coordinates has shown variability over time. While "Chicago" is generally
     * expected, minor variations or more specific sub-localities might appear.
     * We aim for a close match here, but be aware of potential updates from the service provider.
     */
    'identifies correct urban area (Chicago)': function processResult(problem, finalRecord) {
      let areaDetail = finalRecord.outputRecords[0].addressParts.filter((elementItem) => {
        // Filters address components to find the primary "city" type.
        return elementItem.kindCodes.includes('city');
      })[0];
      // Asserts that the full name of the identified locality matches our expectation.
      confirm.strictEquality(areaDetail.fullName, 'ChicagoLand');
    }
  }
}).publish(module);

/*
 * This section contains sample JSON data from a reverse geocode query.
 * It's included for reference, illustrating the structure of the `outcomeData`
 * or `finalRecord` objects received by the test functions.
 *
 * The detailed structure, including multiple result entries and address components,
 * helps in understanding how to extract specific pieces of information like
 * postal codes, localities, and administrative areas.
 *
 * Example result structure:
 * {
 *    "status": "OK",
 *    "results": [
 *       {
 *          "types": ["postal_code"],
 *          "formatted_address": "Chicago, IL 60664, USA",
 *          "address_components": [
 *             {
 *                "long_name": "60664",
 *                "short_name": "60664",
 *                "types": ["postal_code"]
 *             },
 *             {
 *                "long_name": "Chicago",
 *                "short_name": "Chicago",
 *                "types": ["locality", "political"]
 *             },
 *             // ... other components
 *          ],
 *          "geometry": { /* ... location details ... *\/ }
 *       },
 *       // ... potentially more results ...
 *    ]
 * }
 */