const ApplicationCore = {
    // Defines configuration parameters for the application, improving modularity.
    // This allows for easier updates and renaming of global values.
    apiEndpoints: {
        regionData: "/api/geo/regions" // Renamed URL endpoint for fetching geographical region data
    },
    cssClasses: {
        formGroupWrapper: 'form-input-group', // Renamed from 'control-group'
        validationSuccess: 'state-success', // Renamed from 'success'
        validationError: 'state-error', // Renamed from 'error'
        validationMessage: 'validation-feedback' // New class for error messages
    },
    domSelectors: {
        pageReadyElement: document, // Using native document for ready event
        billingCountrySelector: '#billing_geo_country_selector', // Renamed ID
        shippingCountrySelector: '#shipping_geo_country_selector', // Renamed ID
        billingRegionTextInput: '#billing_geo_region_text_entry', // Renamed ID
        billingRegionDropdownList: '#billing_geo_region_dropdown_list', // Renamed ID
        shippingRegionTextInput: '#shipping_geo_region_text_entry', // Renamed ID
        shippingRegionDropdownList: '#shipping_geo_region_dropdown_list', // Renamed ID
        useBillingAddressToggle: '#use_billing_for_shipping_toggle', // Renamed ID
        shippingAddressBlock: '#shipping_address_details_block', // Renamed ID
        mainOrderSubmissionForm: '#primary_order_submission_form' // Renamed ID
    }
};

// Encapsulate main application logic within a jQuery document ready block.
jQuery(ApplicationCore.domSelectors.pageReadyElement).ready(function() {

    // --- Dynamic Region/State Management ---
    // This segment handles fetching and updating region dropdowns based on country selection.
    // It's generalized to reduce code duplication for billing and shipping addresses.

    /**
     * Executes an AJAX call to retrieve regions for a selected country and updates the UI.
     * It intelligently switches between a text input and a dropdown list for regions.
     * @param {string} countrySelectId - jQuery selector for the country dropdown.
     * @param {string} regionInputId - jQuery selector for the free-text region input.
     * @param {string} regionDropdownId - jQuery selector for the region dropdown list.
     * @param {string} [initialSelectedRegionVal=''] - The value of the region to be pre-selected after load.
     */
    const retrieveAndRenderRegions = function(countrySelectId, regionInputId, regionDropdownId, initialSelectedRegionVal = '') {
        const $countryElement = jQuery(countrySelectId);
        const $regionInputElement = jQuery(regionInputId);
        const $regionDropdownElement = jQuery(regionDropdownId);

        // Guard clause: Ensure the country selector exists and has a value chosen.
        if ($countryElement.length === 0 || !$countryElement.val()) {
            console.warn(`No country element or value found for ${countrySelectId}. Defaulting to text input.`);
            $regionInputElement.show();
            $regionDropdownElement.hide();
            return;
        }

        const currentCountryIdentifier = $countryElement.val();
        const ajaxRequestURL = `${ApplicationCore.apiEndpoints.regionData}?country_id=${currentCountryIdentifier}`;

        jQuery.ajax({
            url: ajaxRequestURL,
            method: 'GET', // Explicitly define HTTP method
            dataType: 'json',
            beforeSend: function(xhrObject) { // Renamed 'request' to 'xhrObject'
                // Temporarily conceal both region input elements while fetching data.
                $regionInputElement.hide();
                $regionDropdownElement.hide();
                // Add a standard header for AJAX requests.
                xhrObject.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            },
            success: function(responsePayload) { // Renamed 'data' to 'responsePayload'
                const regionsCollection = responsePayload.states; // Renamed 'states' to 'regionsCollection'
                if (regionsCollection && regionsCollection.length > 0) {
                    $regionDropdownElement.empty(); // Clear existing options.

                    // Add a default, unselectable placeholder option at the top.
                    $regionDropdownElement.append(
                        jQuery('<option>', { value: '', text: '-- Choose a Region --', disabled: true, selected: true })
                    );

                    // Populate the dropdown with fetched regions.
                    regionsCollection.forEach(function(geoRegion) { // Using forEach for iteration
                        $regionDropdownElement.append(
                            jQuery('<option>', { value: geoRegion.id, text: geoRegion.name })
                        );
                    });

                    $regionDropdownElement.show(); // Display the dropdown.
                    // Attempt to re-select the previously chosen region or set a default.
                    if (initialSelectedRegionVal) {
                        $regionDropdownElement.val(initialSelectedRegionVal);
                    } else {
                        // If no specific value, select the first actual region (skipping placeholder)
                        const firstUsableOption = $regionDropdownElement.find('option:eq(1)').val();
                        if (firstUsableOption) {
                            $regionDropdownElement.val(firstUsableOption);
                        }
                    }
                    console.log(`Regions for country ${currentCountryIdentifier} successfully loaded.`);
                } else {
                    // If no regions are available, revert to showing the free-text input field.
                    $regionInputElement.show();
                    console.log(`No specific regions found for ${currentCountryIdentifier}. Using text input.`);
                }
            },
            error: function(xhr, statusText, errorMsg) { // Added error handling
                console.error(`Failed to fetch regions for country ${currentCountryIdentifier}: ${statusText} - ${errorMsg}`);
                $regionInputElement.show(); // Show text input as a fallback on error.
                $regionDropdownElement.hide();
            },
            complete: function() {
                // This callback fires regardless of success or error, useful for cleanup.
                console.debug(`Region data request for ${countrySelectId} completed.`);
            }
        });
    };

    // Cache initial region values before AJAX updates to re-select them.
    const cachedBillingRegionValue = jQuery(ApplicationCore.domSelectors.billingRegionDropdownList).val();
    const cachedShippingRegionValue = jQuery(ApplicationCore.domSelectors.shippingRegionDropdownList).val();

    // Initial population of region fields on page load.
    // Only proceed if the country selector element actually exists in the DOM.
    if (jQuery(ApplicationCore.domSelectors.billingCountrySelector).length > 0) {
        retrieveAndRenderRegions(
            ApplicationCore.domSelectors.billingCountrySelector,
            ApplicationCore.domSelectors.billingRegionTextInput,
            ApplicationCore.domSelectors.billingRegionDropdownList,
            cachedBillingRegionValue
        );
    }
    if (jQuery(ApplicationCore.domSelectors.shippingCountrySelector).length > 0) {
        retrieveAndRenderRegions(
            ApplicationCore.domSelectors.shippingCountrySelector,
            ApplicationCore.domSelectors.shippingRegionTextInput,
            ApplicationCore.domSelectors.shippingRegionDropdownList,
            cachedShippingRegionValue
        );
    }

    // Attach event listeners for country dropdown changes.
    // Using `.on()` for event delegation benefits.
    jQuery(ApplicationCore.domSelectors.billingCountrySelector).on('change', function() {
        retrieveAndRenderRegions(
            ApplicationCore.domSelectors.billingCountrySelector,
            ApplicationCore.domSelectors.billingRegionTextInput,
            ApplicationCore.domSelectors.billingRegionDropdownList
            // No initial value passed on change, as the user is actively changing it.
        );
    });
    jQuery(ApplicationCore.domSelectors.shippingCountrySelector).on('change', function() {
        retrieveAndRenderRegions(
            ApplicationCore.domSelectors.shippingCountrySelector,
            ApplicationCore.domSelectors.shippingRegionTextInput,
            ApplicationCore.domSelectors.shippingRegionDropdownList
        );
    });


    // --- Shipping Address Visibility Toggle ---
    // Manages the display of the shipping address form based on a checkbox state.

    /**
     * Adjusts the visibility of the shipping address details block.
     * If the "use billing address" checkbox is checked, the shipping form is hidden.
     */
    const adjustShippingAddressVisibility = function() { // Renamed function
        const $useBillingCheckbox = jQuery(ApplicationCore.domSelectors.useBillingAddressToggle);
        const $shippingFormBlock = jQuery(ApplicationCore.domSelectors.shippingAddressBlock);

        // Guard clause: Exit if required elements are not present.
        if ($useBillingCheckbox.length === 0 || $shippingFormBlock.length === 0) {
            console.warn('Shipping address toggle or block not found in DOM. Skipping visibility adjustment.');
            return;
        }

        const shouldHideBlock = $useBillingCheckbox.is(':checked');

        // Use a fade animation for a smoother user experience.
        shouldHideBlock ? $shippingFormBlock.fadeOut(300) : $shippingFormBlock.fadeIn(300); // Changed animation duration

        console.debug(`Shipping address block visibility set to hidden: ${shouldHideBlock}`);
    };

    // Call the function once on page load to set the initial state.
    adjustShippingAddressVisibility();

    // Bind the click event to the "use billing address" checkbox.
    jQuery(ApplicationCore.domSelectors.useBillingAddressToggle).on('click', adjustShippingAddressVisibility);


    // --- Form Validation Setup ---
    // Configures client-side validation using the jQuery Validation plugin.

    const $mainOrderForm = jQuery(ApplicationCore.domSelectors.mainOrderSubmissionForm);

    // Guard clause: Initialize validation only if the form element is present.
    if ($mainOrderForm.length === 0) {
        console.warn('Order submission form not found. Validation setup skipped.');
        return;
    }

    // Define validation rules in a separate constant for better readability and maintenance.
    const formValidationScheme = { // Renamed 'rules' to 'formValidationScheme'
        agreementCheck: { // Renamed 'agree' to 'agreementCheck'
            required: true
        },
        'order_details[billing_contact][first_name]': { // Renamed field name 'order[bill_address_attributes][firstname]'
            required: true,
            minlength: 2, // Added new rule: minimum length
            maxlength: 50 // Added new rule: maximum length
        },
        'order_details[billing_contact][last_name]': {
            required: true,
            minlength: 2,
            maxlength: 50
        },
        'order_details[billing_contact][phone_number]': { // Renamed 'phone' to 'phone_number'
            required: true,
            phoneValidation: true // Using a custom validation method (Type III addition)
        },
        'order_details[billing_address][line_one]': { // Renamed 'address1' to 'line_one'
            required: true
        },
        'order_details[billing_address][city_name]': { // Renamed 'city' to 'city_name'
            required: true
        },
        'order_details[billing_address][postal_code]': { // Renamed 'zip' to 'postal_code'
            required: true,
            digits: true, // Added new rule: must be digits
            minlength: 5, // Added new rule: minimum length for postal code
            maxlength: 10 // Added new rule: maximum length for postal code
        },
        'order_details[billing_address][country_id_selection]': { // Renamed 'country_id'
            required: true
        },
        'order_details[billing_address][state_region_identifier]': { // Renamed 'state_id'
            required: true
        }
    };

    // Define custom validation messages for improved user feedback. (Type III addition)
    const customValidationMessages = {
        agreementCheck: "You must accept the terms and conditions to proceed.",
        'order_details[billing_contact][first_name]': {
            required: "First name is absolutely required.",
            minlength: "First name must be at least 2 characters long.",
            maxlength: "First name cannot exceed 50 characters."
        },
        'order_details[billing_contact][last_name]': {
            required: "Last name is absolutely required.",
            minlength: "Last name must be at least 2 characters long.",
            maxlength: "Last name cannot exceed 50 characters."
        },
        'order_details[billing_contact][phone_number]': {
            required: "A contact phone number is required.",
            phoneValidation: "Please enter a valid phone number format (e.g., xxx-xxx-xxxx)."
        },
        'order_details[billing_address][line_one]': "Billing street address line 1 is essential.",
        'order_details[billing_address][city_name]': "Billing city name is required.",
        'order_details[billing_address][postal_code]': {
            required: "Billing postal code is required.",
            digits: "Postal code must only contain numbers.",
            minlength: "Postal code must be at least 5 digits.",
            maxlength: "Postal code cannot exceed 10 digits."
        },
        'order_details[billing_address][country_id_selection]': "Please select your billing country.",
        'order_details[billing_address][state_region_identifier]': "Please select your billing state or region."
    };

    // Initialize the jQuery Validate plugin with extensive customization.
    $mainOrderForm.validate({
        rules: formValidationScheme, // Using the renamed rules object
        messages: customValidationMessages, // Integrating custom messages
        errorElement: 'div', // Changed error element from span to div for better styling (Type III addition)
        errorClass: ApplicationCore.cssClasses.validationMessage, // Custom error message class
        validClass: 'is-valid-field', // Custom class for valid fields (Type III addition)
        highlight: function(elementWithError) { // Renamed 'element' to 'elementWithError'
            jQuery(elementWithError).closest(`.${ApplicationCore.cssClasses.formGroupWrapper}`)
                .removeClass(ApplicationCore.cssClasses.validationSuccess)
                .addClass(ApplicationCore.cssClasses.validationError);
            jQuery(elementWithError).attr('aria-invalid', 'true'); // Accessibility addition (Type III)
            console.log(`Validation: Field '${elementWithError.name}' has errors.`);
        },
        unhighlight: function(validElement) { // Renamed 'success' to 'unhighlight' and 'element' to 'validElement'
            jQuery(validElement).closest(`.${ApplicationCore.cssClasses.formGroupWrapper}`)
                .removeClass(ApplicationCore.cssClasses.validationError)
                .addClass(ApplicationCore.cssClasses.validationSuccess);
            jQuery(validElement).removeAttr('aria-invalid'); // Remove accessibility attribute (Type III)
            console.log(`Validation: Field '${validElement.name}' is now valid.`);
        },
        errorPlacement: function(errorLabel, inputElement) { // Custom error placement (Type III addition)
            // Place error message specifically after the input or its container for better UI control.
            if (inputElement.hasClass('select2-hidden-accessible')) {
                errorLabel.insertAfter(inputElement.next('span.select2-container'));
            } else {
                errorLabel.insertAfter(inputElement);
            }
        },
        submitHandler: function(validatedForm) { // Custom submit handler (Type III addition)
            console.info("Form is valid! Proceeding with submission.");
            // Example: Could perform an AJAX submission here instead of default form submit.
            validatedForm.submit(); // Submit the form normally.
        },
        invalidHandler: function(event, validator) { // Custom handler for invalid form submission (Type III addition)
            const errors = validator.numberOfInvalids();
            if (errors) {
                const message = errors === 1
                    ? 'You missed 1 field. It has been highlighted.'
                    : `You missed ${errors} fields. They have been highlighted.`;
                jQuery(`#${ApplicationCore.domSelectors.mainOrderSubmissionForm} .validation-summary`).html(message);
                jQuery(`#${ApplicationCore.domSelectors.mainOrderSubmissionForm} .validation-summary`).show();
            } else {
                jQuery(`#${ApplicationCore.domSelectors.mainOrderSubmissionForm} .validation-summary`).hide();
            }
        }
    });

    // Add a custom validation method for phone numbers (Type III addition)
    if (jQuery.validator && !jQuery.validator.methods.phoneValidation) {
        jQuery.validator.addMethod("phoneValidation", function(phoneNumber, element) {
            // Basic regex for common phone number formats (US/Canada-centric example)
            phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, ""); // Clean up common formatting
            return this.optional(element) || phoneNumber.length > 9 &&
                   phoneNumber.match(/^(\+?1)?(\d{10})$/); // Matches 10 digits, optional +1
        }, "Please enter a valid phone number (e.g., 555-123-4567).");
    }

}); // End of document ready