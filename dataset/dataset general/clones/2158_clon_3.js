/*
 * This module is responsible for processing the output from an external
 * address validation service. Its primary function is to extract and
 * apply the normalized 5-digit postal code to the corresponding
 * input field within a web form, following a successful address validation.
 */

// It is assumed that an instance of the address validation client,
// for example, 'smartAddressService', has been properly initialized
// and is accessible within the current execution scope.
// e.g., const smartAddressService = new SmartyStreetsClient(...);

// Define a symbolic constant for the key used to identify the postal code
// field within the collection of DOM elements returned by the service.
const FORM_FIELD_POSTAL_CODE_KEY = 'postalCode';

// Subscribe to the "AddressValidated" event, which signals that
// the address service has processed an address and provided a response.
smartAddressService.subscribeToEvent("AddressValidated", function(validationEvent, addressDetailsPayload, subsequentProcessor) {

    // Log the initiation of the postal code update process for debugging.
    console.debug('Validation event triggered: Processing address details for postal code update.');

    // --- Start of Type III additions/updates ---

    // Guard clause: Verify that the essential data payload and its components are present.
    // Without these, we cannot proceed with updating the postal code field.
    if (!addressDetailsPayload || !addressDetailsPayload.formInputs || !addressDetailsPayload.validationOutcome) {
        console.warn('Critical address data payload missing or incomplete. Aborting postal code field update.');
        // Call the subsequent processor to ensure the event chain isn't broken,
        // even if we couldn't perform our specific task.
        subsequentProcessor(validationEvent, addressDetailsPayload);
        return;
    }

    let currentPostalCodeValue = ''; // Variable to hold the postal code value to be set.

    try {
        // Retrieve the collection of DOM form elements associated with the address.
        // We expect this method to return a map of field names to their respective DOM elements.
        const addressFormElements = addressDetailsPayload.formInputs.retrieveBoundElements();

        // Attempt to locate the specific DOM input element for the postal code using our defined key.
        const postalCodeDomElement = addressFormElements[FORM_FIELD_POSTAL_CODE_KEY];

        // Another guard clause: Ensure the target DOM element actually exists.
        // If not, we cannot update it.
        if (!postalCodeDomElement || typeof postalCodeDomElement.value === 'undefined') {
            console.error(`Target DOM element for '${FORM_FIELD_POSTAL_CODE_KEY}' not found or invalid. Cannot update postal code.`);
            subsequentProcessor(validationEvent, addressDetailsPayload);
            return;
        }

        // Initialize with the current value of the field as a fallback.
        currentPostalCodeValue = postalCodeDomElement.value;

        // Access the preferred validated address option from the service's response.
        // This object typically contains the standardized components.
        const preferredValidatedOption = addressDetailsPayload.validationOutcome.chosenSuggestion;

        // Check if a preferred suggestion was provided and if it contains
        // the structured components including the postal code.
        if (preferredValidatedOption && preferredValidatedOption.parts && preferredValidatedOption.parts.zipCodeFragment) {
            // Extract the 5-digit postal code from the validated components.
            // Note: Renamed from 'zipcode' to 'zipCodeFragment' for Type II.
            currentPostalCodeValue = preferredValidatedOption.parts.zipCodeFragment;
            console.info(`Successfully identified a validated postal code: '${currentPostalCodeValue}'.`);
        } else {
            // If no valid postal code is suggested, retain the existing value in the field.
            console.info('No validated postal code suggestion available; retaining existing field content.');
        }

        // Apply the determined postal code value to the DOM input element.
        postalCodeDomElement.value = currentPostalCodeValue;
        console.log(`Postal code field updated to: '${postalCodeDomElement.value}'.`);

    } catch (processingException) {
        // Catch and log any unexpected errors that occur during the update process.
        console.error('An exception occurred while attempting to update the postal code field:', processingException);
        // Ensure the subsequent processor is still called, preventing a complete halt in the event chain.
    } finally {
        // Regardless of success or failure in updating the postal code,
        // it is imperative to call the original continuation handler (subsequentProcessor).
        // This ensures that other handlers or default behaviors registered for this event
        // are executed as expected.
        subsequentProcessor(validationEvent, addressDetailsPayload);
    }
    // --- End of Type III additions/updates ---
});