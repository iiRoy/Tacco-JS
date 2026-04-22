$(document).ready(
    function() {

        // Initialize the 'about' dialog box with specific dimensions and behavior.
        // It will not open automatically on page load.
        $("#about").dialog(
            {
                "width":    400,
                "height":   100,
                "autoOpen": false
            }
        );


        // Initialize the 'forms' tab interface, setting the active tab
        // based on the 'active_window' variable.
        $('#forms').tabs(
            {
                "active" : active_window
            }
        );

        // Adjust the height of all tab panels within the 'forms' container
        // to match the height of the 'pdnsf' element. This ensures consistent
        // sizing, especially for the longest tab content.
        $("#forms div.ui-tabs-panel").css(
            'height',
            $("#pdnsf").height()
        );


        // Attach click event handlers to the search icon and title elements.
        // Both elements will trigger the 'search_toggle' function when clicked.
        $("#searchIcon").on("click", function() { search_toggle(); });
        $("#title").on("click", function() { search_toggle(); });


        // Bind a click event to the 'aboutlink span' element.
        // When clicked, it will open the previously initialized 'about' dialog.
        $("#aboutlink span").on("click", function() {
            $("#about").dialog("open");
        });


        // Handle the 'change' event for the 'key' dropdown within the 'pdnsr' form.
        $("#pdnsr [name='key']").change(
            function() {
                // Check if the currently selected option's value is "name".
                if ( $(this).find("option:selected").val() == "name" ) {
                    // If "name" is selected, remove the 'novis' class and show the 'form_rrtypes' elements.
                    $(".form_rrtypes").removeClass("novis").show();
                }
                else {
                    // Otherwise, add the 'novis' class to hide the 'form_rrtypes' elements.
                    $(".form_rrtypes").addClass("novis");
                }
            }
        );


        // Handle the 'change' event for the 'fmt' dropdown within search forms.
        $(".search_form [name='fmt']").change(
            function() {
                // The 'limit' field is only relevant for "Domain JSON" and "LIST" formats.
                // Check if the selected format is NOT "normal".
                if ( $(this).find("option:selected").val() != "normal" ) {
                    // If not "normal", ensure the 'form_limit' section is visible.
                    $(".form_limit").removeClass("novis").show();
                }
                else {
                    // If "normal", hide the 'form_limit' section.
                    $(".form_limit").removeClass("novis").addClass("novis");
                }

                // Filtering options are only applicable when the format is "list".
                // Check if the selected format is "list".
                if ( $(this).find("option:selected").val() == "list" ) {
                    // If "list", find the parent 'tbody' and show its 'form_filter' elements.
                    $(this).parents('tbody').find('.form_filter').removeClass("novis").show();
                }
                else {
                    // If not "list", hide the 'form_filter' elements.
                    $(this).parents('tbody').find('.form_filter').addClass("novis");
                }
            }
        );

        // Initialize tooltips for list items and labels within the 'forms' container
        // that have a 'title' attribute.
        $('#forms').tooltip(
            {
                items: 'li[title],label[title]'
            }
        );

    }
);


/**
 * Determines if an HTTP method is considered "safe" and does not require CSRF protection.
 * Safe methods typically do not alter server state.
 * @param {string} method The HTTP method (e.g., "GET", "POST").
 * @returns {boolean} True if the method is safe, false otherwise.
 */
function csrfSafeMethod( method ) {
    // These HTTP methods are generally considered idempotent and do not require CSRF protection.
    return ( /^(GET|HEAD|OPTIONS|TRACE)$/.test( method ) );
}


/**
 * Retrieves the value of a specific cookie by its name.
 * @param {string} name The name of the cookie to retrieve.
 * @returns {string|null} The decoded cookie value, or null if the cookie is not found.
 */
function getCookie( name ) {
    var cookieValue = null; // Initialize cookie value as null.

    // Check if the document has cookies and if the cookie string is not empty.
    if ( document.cookie && document.cookie != '' ) {
        // Split the document's cookie string into individual cookies.
        var cookies = document.cookie.split( ';' );

        // Iterate over each cookie.
        for ( var i = 0; i < cookies.length; i++ ) {
            // Trim whitespace from the current cookie string.
            var cookie = jQuery.trim( cookies[i] );

            // Check if this cookie string begins with the name we are looking for.
            if ( cookie.substring( 0, name.length + 1 ) == ( name + '=' ) ) {
                // If found, decode the component and store its value.
                cookieValue = decodeURIComponent( cookie.substring( name.length + 1 ) );
                break; // Exit the loop once the cookie is found.
            }
        }
    }
    return cookieValue; // Return the retrieved cookie value.
}


// Configure global AJAX settings for all subsequent jQuery AJAX requests.
$.ajaxSetup(
    {
        crossDomain: false, // Prevents the need for an explicit sameOrigin test.

        // This function runs before each AJAX request is sent.
        beforeSend: function( xhr, settings ) {
            // Retrieve the CSRF token from cookies.
            var csrftoken = getCookie( 'csrftoken' );

            // If the request method is not "safe" (e.g., POST, PUT, DELETE),
            // add the CSRF token to the request headers.
            if ( !csrfSafeMethod( settings.type ) ) {
                xhr.setRequestHeader( "X-CSRFToken", csrftoken );
            }
        }
    }
);


/**
 * Toggles the visibility of search forms and associated elements.
 * Changes an icon based on the current state.
 * @param {number} [duration=200] The duration of the show/hide animation in milliseconds.
 */
function search_toggle( duration ) {
    // Set a default duration if one is not provided.
    duration = typeof duration !== 'undefined' ? duration : 200;

    // Check if the button currently has the 'ui-icon-plus' class (indicating collapsed state).
    if ( $( "#button" ).hasClass( 'ui-icon-plus' ) ) {
        // If collapsed, change icon to 'minus' and show the forms.
        $( "#button" ).removeClass( 'ui-icon-plus' ).addClass( 'ui-icon-minus' );
        $( "#forms" ).show( duration );
        // Also show specific elements that might be hidden by other means.
        $( ".domain_nonweb" ).show();
        $( ".pdns_nonweb" ).show();
    }
    else {
        // If expanded, change icon to 'plus' and hide the forms.
        $( "#button" ).removeClass( 'ui-icon-minus' ).addClass( 'ui-icon-plus' );
        $( "#forms" ).hide( duration );
    }
}


/**
 * Resolves a given domain and displays the results in a target HTML element.
 * Makes an AJAX call to a predefined resolution URL.
 * @param {string} domain The domain name to resolve.
 * @param {jQuery} target The jQuery object representing the HTML element where results will be displayed.
 */
function resolve( domain, target ) {
  // Construct the endpoint URL for the resolution service.
  var ep_url = resolve_url + domain + "/";

  // Perform an AJAX GET request to the resolution endpoint.
  $.ajax(
    {
        type:     'GET',
        url:      ep_url,
        datatype: 'json', // Expecting a JSON response.
        success:  function( data ) {
            var mspan = $( target ); // Reference to the target display element.

            // Check if the resolution was successful according to the API response.
            if ( data.success ) {
                mspan.empty(); // Clear any previous content in the target element.

                // Create a new table element to hold the resolution results.
                var arTable = document.createElement( 'table' );
                $( arTable ).addClass( 'resolutionTable' ); // Add a class for styling.

                // Loop through the array of IP addresses received in the data.
                for ( i = 0; i < data.ips.length ; i++ ) {
                    var arRow  = document.createElement( 'tr' );   // Create a new table row.
                    var arCell = document.createElement( 'td' );   // Create a new table cell.
                    var anch   = document.createElement( 'a' );    // Create an anchor element for the link.

                    // Set the href attribute of the anchor to the URL provided for the IP.
                    $( anch ).attr( "href", data.ips[i].url );
                    // Set the text content of the anchor to the IP address.
                    $( anch ).html( data.ips[i].ip );

                    $( arCell ).append( anch );      // Append the anchor to the table cell.
                    $( arRow ).append( arCell );     // Append the cell to the table row.
                    $( arTable ).append( arRow );    // Append the row to the table.
                }
                mspan.append( arTable ); // Append the completed table to the target span.
            }
            else {
                // If resolution was not successful, display the error message.
                mspan.text( data.error );
            }
        }
    }
  );
}


// The following code provides a DataTable API extension for setting a filtering delay.
// This allows for a pause after a user types in a search box before the filter is applied,
// improving performance and user experience.
// Authors: Zygimantas Berziunas, Allan Jardine and vex.
jQuery.fn.dataTableExt.oApi.fnSetFilteringDelay = function ( oSettings, iDelay ) {

    var _that = this; // Store a reference to the DataTable instance.

    // If no delay is specified, default to 250 milliseconds.
    if ( iDelay === undefined ) {
        iDelay = 250;
    }

    // Iterate over each DataTable instance.
    this.each(
        function ( i ) {
            $.fn.dataTableExt.iApiIndex = i; // Set the current API index.

            var
                $this           = this,
                oTimerId        = null,        // Timer ID for debouncing.
                sPreviousSearch = null,        // Stores the previous search term.
                // Get the input element used for filtering.
                anControl       = $( 'input', _that.fnSettings().aanFeatures.f );

            // Unbind any existing 'keyup' handlers and bind a new one.
            anControl.unbind( 'keyup' ).bind(
                'keyup',
                function() {
                    var $$this = $this; // Local reference to the DataTable element.

                    // Check if the search term has changed or if it's the first search.
                    if ( sPreviousSearch === null || sPreviousSearch != anControl.val() ) {
                        window.clearTimeout( oTimerId ); // Clear any pending timer.
                        sPreviousSearch = anControl.val(); // Update the previous search term.

                        // Set a new timer to execute the filter after the delay.
                        oTimerId = window.setTimeout(
                            function() {
                                $.fn.dataTableExt.iApiIndex = i; // Ensure correct API index.
                                _that.fnFilter( anControl.val() ); // Apply the filter.
                            },
                            iDelay
                        );
                    }
                }
            );

            return this; // Allow chaining.
        }
    );

    return this; // Allow chaining for the overall plugin.
};