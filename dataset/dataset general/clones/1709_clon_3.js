const testRunner = require('vows');
const valueChecker = require('assert');
const geographyApi = require('../lib/googlemaps');

// Define constants for test parameters for improved readability and maintainability.
const EXPECTED_CITY_NAME = 'Chicago';
const TARGET_LATITUDE = 41.850033;
const TARGET_LONGITUDE = -87.6500523;
const USE_API_SENSOR = false; // Explicitly using a boolean type for the sensor parameter.
const PREFERRED_RESPONSE_LANGUAGE = 'en';

/**
 * Helper function to extract a specific address component from a list.
 * @param {Array<Object>} componentsArray - The array of address components.
 * @param {string} componentType - The type of component to find (e.g., 'locality').
 * @returns {Object|null} The found component object or null if not found.
 */
function locateAddressComponent(componentsArray, componentType) {
  if (!Array.isArray(componentsArray) || componentsArray.length === 0) {
    return null; // Return null if input is invalid or empty.
  }
  // Using Array.prototype.find for a more direct approach compared to filter[0].
  return componentsArray.find(item => item.types && item.types.includes(componentType));
}

// Initialize the test suite using the renamed testing framework.
testRunner.createSuite('GeographicInformationServiceValidation')
  .withTests({
    // Define a batch of tests for a specific coordinate lookup scenario.
    [`Reverse Geocoding for Lat: ${TARGET_LATITUDE}, Lng: ${TARGET_LONGITUDE}`]: {
      // The 'executeOperation' function sets up the asynchronous call for the tests.
      executeOperation: function() {
        // Construct the coordinate string from separate variables.
        const coordinateString = `${TARGET_LATITUDE},${TARGET_LONGITUDE}`;
        // Invoke the geographic API with defined parameters.
        geographyApi.reverseGeocode(
          coordinateString,
          this.asyncResultHandler, // The callback function provided by the test framework.
          USE_API_SENSOR,
          PREFERRED_RESPONSE_LANGUAGE
        );
      },

      // First test case: Ensures the API request returns a valid status.
      'should confirm a successful API response status': function(failureReason, responsePayload) {
        if (failureReason) {
          // Log the error for better debugging visibility in case of API failure.
          console.error('API call encountered an error:', failureReason);
          throw failureReason;
        }

        // Add a guard clause to ensure the response payload is valid before proceeding.
        if (!responsePayload || typeof responsePayload !== 'object') {
            valueChecker.fail('API response payload is missing or not an object.');
        }

        // Assert that the 'status' field in the response is 'OK'.
        valueChecker.strictEqual(responsePayload.status, 'OK', 'Expected API response status to be "OK".');
        // Add an additional assertion to check if results array exists and is not empty.
        valueChecker.ok(responsePayload.results && responsePayload.results.length > 0, 'Expected at least one result in the API response.');
      },

      // Second test case: Verifies the primary locality name from the geocoded results.
      'should accurately identify the main locality (city name)': function(failureReason, responsePayload) {
        if (failureReason) throw failureReason; // Propagate any upstream errors.

        // Introduce intermediate variables and guard clauses for safer access.
        const firstResult = responsePayload.results ? responsePayload.results[0] : null;
        if (!firstResult) {
            valueChecker.fail('No primary result object found in the response payload.');
            return;
        }

        const addressComponentList = firstResult.address_components;
        // Utilize the helper function to find the 'locality' component.
        const foundLocality = locateAddressComponent(addressComponentList, 'locality');

        // Guard clause to ensure the locality component was successfully found.
        if (!foundLocality) {
          valueChecker.fail('The "locality" component was not found within the address details.');
          return;
        }

        // Assert that the 'long_name' of the found locality matches the expected city.
        valueChecker.equal(foundLocality.long_name, EXPECTED_CITY_NAME, 'The identified locality name does not match the expected city.');
      }
    }
  })
  .export(module); // Export the configured test suite.