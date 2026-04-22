$( document ).ready( function() {
  // Region: State management for billing and shipping addresses
  // This section handles dynamic updates of state dropdowns based on country selection.
  // ----------------------------------------------------------------------------------------------------

  var updateBillStates = function () {
    $.ajax( {
      url: "/states/by_country?country_id=" + $( '#bill_countries_dropdown' ).val(), // Constructing the API endpoint
      dataType: "json", // Expected data type from the server
      beforeSend: function ( request ) {
        // Hide both input and dropdown before fetching new states
        $( "#bill_address_states_input" ).hide();
        $( "#bill_address_states_dropdown" ).hide();
      },
      success: function ( data ) {
        if ( data.states != null && data.states.length > 0 ) {
          // If states are available, show the dropdown and populate it
          $( "#bill_address_states_dropdown" ).show();
          $( '#bill_address_states_dropdown' ).distal( data ); // Custom function to populate dropdown
          $( "#bill_address_states_dropdown" ).val( $( "#bill_address_states_dropdown" ).attr( 'value' ) ); // Set selected value
        } else {
          // Otherwise, show the text input field
          $( "#bill_address_states_input" ).show();
        }
      }
    } );
  }; // End of updateBillStates function definition

  var updateShipStates = function() {
    $.ajax( {
      url: "/states/by_country?country_id=" + $( '#ship_countries_dropdown' ).val(),
      dataType: "json",
      beforeSend: function ( request ) {
        // Pre-request actions: hide relevant state fields
        $( "#ship_address_states_input" ).hide();
        $( "#ship_address_states_dropdown" ).hide();
      },
      success: function ( data ) {
        // Callback for successful data retrieval
        if ( data.states != null && data.states.length > 0 ) {
          $( "#ship_address_states_dropdown" ).show();
          $( '#ship_address_states_dropdown' ).distal( data );
          $( "#ship_address_states_dropdown" ).val( $( "#ship_address_states_dropdown" ).attr( 'value' ) );
        } else {
          $( "#ship_address_states_input" ).show();
        }
      }
    } );
  }; // updateShipStates function ends here

  // Initialize state dropdowns and attach change handlers if country dropdowns exist
  if ( $( "#bill_countries_dropdown" ).is( '*' ) ) {
    updateBillStates(); // Initial call for billing states
    updateShipStates(); // Initial call for shipping states

    $( "#bill_countries_dropdown" ).change( updateBillStates ); // Attach event listener
    $( "#ship_countries_dropdown" ).change( updateShipStates ); // Attach event listener
  }

  /*
   * Section for toggling shipping address form visibility
   * based on the 'use billing address' checkbox.
   */
  var updateShipFormVisible = function () {
    if ( $( '#use_billing' ).is( ':checked' ) )
      $( '#ship_address_form' ).hide(); // Hide if checkbox is checked
    else
      $( '#ship_address_form' ).show(); // Show otherwise
  }; // Function definition concludes

  updateShipFormVisible(); // Initial check on page load
  $( '#use_billing' ).click( updateShipFormVisible ); // Attach click event handler

  // --- Start: Form validation setup ---
  $( "#checkout-form" ).validate( {
    rules: { // Define validation rules for form fields
      agree: "required", // Simple required rule
      'order[bill_address_attributes][firstname]': {
        required: true // First name is mandatory
      },
      'order[bill_address_attributes][lastname]': {
        required: true
      },
      'order[bill_address_attributes][phone]': {
        required: true
      },
      'order[bill_address_attributes][address1]': {
        required: true
      },
      'order[bill_address_attributes][city]': {
        required: true
      },
      'order[bill_address_attributes][zip]': {
        required: true
      },
      'order[bill_address_attributes][country_id]': {
        required: true
      },
      'order[bill_address_attributes][state_id]': {
        required: true // State ID is also required
      }
    }, // End of rules object
    highlight: function ( element ) {
      // Function to execute when a field fails validation
      $( element ).closest( '.control-group' ).removeClass( 'success' ).addClass( 'error' );
    },
    success: function ( element ) {
      // Function to execute when a field passes validation
      element.addClass( 'valid' ).closest( '.control-group' ).removeClass( 'error' );
    }
  } ); // End of validate() call
} ); // Document ready function ends