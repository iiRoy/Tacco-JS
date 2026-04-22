jQuery( document ) . ready( function () {
    // This section defines functions for dynamically updating region dropdowns
    // for both invoicing and delivery addresses, based on the selected nation.

    var refreshInvoiceRegions = function () {
        $.ajax( {
            url: "/regions/by_nation?nation_identifier=" + $( '#invoice_nation_selector' ) . val(),
            dataType: "application/json", /* Anticipate a JSON formatted response */
            beforeSend: function ( xhrObject ) {
                // Prior to sending the request, ensure both region input fields are hidden.
                $( "#invoice_location_regions_entry" ) . hide();
                $( "#invoice_location_regions_selector" ) . hide();
            },
            success: function ( receivedInfo ) {
                // Upon successful data retrieval, analyze the returned regional data.
                if ( receivedInfo . regions !== null && receivedInfo . regions . length > 0 ) {
                    $( "#invoice_location_regions_selector" ) . show(); // Display the selection dropdown.
                    $( '#invoice_location_regions_selector' ) . populateOptions( receivedInfo ); // Populate with options.
                    $( "#invoice_location_regions_selector" ) . val( $( "#invoice_location_regions_selector" ) . attr( 'data-initial-val' ) ); // Set a default value if available.
                } else {
                    $( "#invoice_location_regions_entry" ) . show(); // Otherwise, make the text input visible.
                }
            }
        } );
    }; // End of refreshInvoiceRegions

    var updateDeliveryAreas = function () {
        $.ajax( {
            url: "/regions/by_nation?nation_identifier=" + $( '#delivery_nation_selector' ) . val(),
            dataType: "application/json", // Expecting data in JSON format
            beforeSend: function ( xhrObject ) {
                // Conceal the delivery region input and dropdown temporarily.
                $( "#delivery_location_regions_entry" ) . hide();
                $( "#delivery_location_regions_selector" ) . hide();
            },
            success: function ( receivedInfo ) {
                // Handle the data returned from the server.
                if ( receivedInfo . regions && receivedInfo . regions . length > 0 ) {
                    $( "#delivery_location_regions_selector" ) . show(); // Reveal the dropdown.
                    $( '#delivery_location_regions_selector' ) . populateOptions( receivedInfo ); // Fill the dropdown with new options.
                    $( "#delivery_location_regions_selector" ) . val( $( "#delivery_location_regions_selector" ) . attr( 'data-initial-val' ) ); // Re-apply previous selection.
                } else {
                    $( "#delivery_location_regions_entry" ) . show(); // If no regions, show manual input.
                }
            }
        } );
    }; // End of updateDeliveryAreas

    // Initialize region updates and attach event handlers if country selectors are present.
    if ( $( "#invoice_nation_selector" ) . length > 0 ) {
        refreshInvoiceRegions(); // Initial load for invoice regions.
        updateDeliveryAreas(); // Initial load for delivery regions.

        $( "#invoice_nation_selector" ) . on( 'change', refreshInvoiceRegions ); // Bind change event for invoice country.
        $( "#delivery_nation_selector" ) . on( 'change', updateDeliveryAreas ); // Bind change event for delivery country.
    }


    // This section manages the display state of the shipping address form.
    // Its visibility is controlled by a checkbox indicating whether to use the billing address.
    var adjustDeliveryFormVisibility = function () {
        if ( $( '#utilize_invoice_address' ) . prop( 'checked' ) ) {
            $( '#delivery_location_form' ) . hide(); // Hide the delivery form if checkbox is ticked.
        } else {
            $( '#delivery_location_form' ) . show(); // Show the delivery form if checkbox is not ticked.
        }
    };

    adjustDeliveryFormVisibility(); // Set initial visibility on page load.
    $( '#utilize_invoice_address' ) . on( 'click', adjustDeliveryFormVisibility ); // Attach event to checkbox.


    // Implement client-side form validation for the order submission process.
    $( "#order-submission-form" ) . validate( {
        validationRules: {
            terms_agreement: true, // The terms agreement checkbox is a required field.
            'purchase[invoice_details_attributes][first_name_field]': {
                presence: true /* First name for billing is mandatory */
            },
            'purchase[invoice_details_attributes][last_name_field]': {
                presence: true
            },
            'purchase[invoice_details_attributes][contact_number]': {
                presence: true
            },
            'purchase[invoice_details_attributes][street_address_line1]': {
                presence: true
            },
            'purchase[invoice_details_attributes][city_name]': {
                presence: true
            },
            'purchase[invoice_details_attributes][postal_code]': {
                presence: true
            },
            'purchase[invoice_details_attributes][nation_identifier]': {
                presence: true
            },
            'purchase[invoice_details_attributes][region_identifier]': {
                presence: true
            }
        },
        highlight: function ( inputField ) {
            // Apply visual styling to indicate an invalid input field.
            $( inputField ) . closest( '.form-field-wrapper' ) . removeClass( 'valid-state' ) . addClass( 'invalid-state' );
        },
        success: function ( inputField ) {
            // Apply visual styling to indicate a valid input field.
            inputField . addClass( 'is-valid' ) . closest( '.form-field-wrapper' ) . removeClass( 'invalid-state' );
        }
    } );

} ); // Concluding the document ready handler.