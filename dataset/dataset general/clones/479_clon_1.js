"use strict";

/*
 * This is a Type I clone of the original JavaScript file.
 * All functional code remains identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet logically equivalent, version.
 */

// Function to perform form validation checks
function formCheck ( form )
{
    // Retrieve form elements using their names
    var wifi_ssid       = form["wifi.ssid"];
    var wifi_encryption = form["wifi.encryption"];
    var wifi_password   = form["wifi.password"];
    var hostname        = form["hostname"];
    var password        = form["password"];

    var errors; // Flag to track if any errors occurred

    // Get the error message container element
    var errContainer = document.getElementById( "error_response" );

    // Clear previous error messages and reset error flag
    errContainer.innerHTML = "";
    errors                 = false;

    // Reset CSS classes for form elements to their normal state
    wifi_password.className = "normal";
    wifi_ssid.className     = "normal";
    hostname.className      = "normal";
    password.className      = "normal";
    errContainer.className  = "hidden"; // Hide the error container initially


    // Helper function to check if a value is null or empty string
    function nullOrEmpty ( val )
    {
        return val == null || val === "";
    }


    // Validate WiFi SSID if not disabled
    if ( !wifi_ssid.disabled && nullOrEmpty( wifi_ssid.value ) )
    {
        errorHandler( wifi_ssid, errContainer, "Please choose a WiFi network name" );
        errors = true;
    }

    // Validate WiFi password based on encryption type
    if ( !wifi_password.disabled && wifi_encryption.value != "none" )
    {
        if ( nullOrEmpty( wifi_password.value ) )
        {
            errorHandler( wifi_password, errContainer, "Please choose a WiFi password" );
            errors = true;
        }
        else if ( wifi_encryption.value != "wep" && wifi_password.value.length < 8 )
        {
            errorHandler( wifi_password, errContainer, "WiFi password should be 8 char at least" );
            errors = true;
        }
    }

    // Validate hostname
    if ( nullOrEmpty( hostname.value ) )
    {
        errorHandler( hostname, errContainer, "Please choose a name for your Y&uacute;n" );
        errors = true;
    }
    // Check for invalid characters in hostname
    else if ( hostname.value.match( /[^a-zA-Z0-9]/ ) )
    {
        errorHandler( hostname, errContainer, "You can only use alphabetical characters for the hostname (A-Z or a-z)" );
        errors = true;
    }

    // Validate main password length and match
    if ( password.value != null && password.value != "" && password.value.length < 8 )
    {
        errorHandler( password, errContainer, "Password should be 8 char at least" );
        errors = true;
    }
    // Check if passwords match using a dedicated function
    else if ( !passwords_match() )
    {
        errorHandler( password, errContainer, "Passwords do not match" );
        errors = true;
    }

    // Return true if no errors, false otherwise
    return !errors;
}


// Function to reset form elements, particularly WiFi configuration
function formReset ()
{
    // Use setTimeout to ensure DOM is ready or to defer execution
    setTimeout( function()
    {
        grey_out_wifi_conf( !document.getElementById( "wificheck" ).checked );
        onchange_security( document.getElementById( "wifi_encryption" ) );
    }, 100 );
}


// Generic error handler function
function errorHandler ( el, er, msg )
{
    el.className   = "error";      // Apply error class to the input element
    er.className   = "visible";    // Make the error container visible
    er.innerHTML   = "<p>" + er.innerHTML + msg + "<br /></p>"; // Append error message
}


// Function for navigation
function goto ( href )
{
    document.location = href; // Redirect to the specified URL
    return false;             // Prevent default link behavior
}


// Handles changes in the WiFi security selection
function onchange_security ( select )
{
    var wifi_pass_container = document.getElementById( "wifi_password_container" );
    var wifi_pass           = document.getElementById( "wifi_password" );

    if ( select.value == "none" )
    {
        wifi_pass_container.setAttribute( "class", "hidden" ); // Hide password field for 'none' security
    }
    else
    {
        wifi_pass_container.removeAttribute( "class" ); // Show password field
        wifi_pass.value = "";                           // Clear password field
        wifi_pass.focus();                              // Set focus to password field
    }
}


// Global variables for public key infrastructure
var pu, key_id, public_key;

// Initialize public key if getPublicKey function is available
if ( typeof( getPublicKey ) === "function" )
{
    pu         = new getPublicKey( pub_key );
    key_id     = pu.keyid;
    public_key = pu.pkey.replace( /\n/g, "" ); // Remove newlines from public key
}


// Function to send POST requests with encrypted data
function send_post ( url, form, real_form_id )
{
    var json = {}; // Object to hold form data

    // Iterate through arguments to collect form data, starting from the 4th argument
    for ( var i = 3; i < arguments.length; i++ )
    {
        if ( !form[arguments[i]].disabled )
        {
            json[arguments[i]] = form[arguments[i]].value;
        }
    }

    // Encrypt the JSON data using PGP
    var pgp_message = doEncrypt( key_id, 0, public_key, JSON.stringify( json ) );

    // Get the actual form to be submitted
    var real_form = document.getElementById( real_form_id );

    real_form.pgp_message.value = pgp_message; // Set the encrypted message value
    real_form.submit();                         // Submit the form

    return false; // Prevent default form submission
}


// Function to enable/disable WiFi configuration fields
function grey_out_wifi_conf ( disabled )
{
    // Set class for the WiFi container based on disabled status
    if ( disabled )
    {
        document.getElementById( "wifi_container" ).setAttribute( "class", "disabled" );
    }
    else
    {
        document.getElementById( "wifi_container" ).setAttribute( "class", "" );
    }

    // Disable/enable individual WiFi input fields
    document.getElementById( "wifi_password" ).disabled  = disabled;
    document.getElementById( "wifi_ssid" ).disabled      = disabled;
    document.getElementById( "wifi_encryption" ).disabled = disabled;
    document.getElementById( "detected_wifis" ).disabled  = disabled;
}


// Checks if the two password fields have matching values
function passwords_match ()
{
    var confpassword = document.getElementById( "confpassword" );
    var password     = document.getElementById( "password" );

    return confpassword.value == password.value;
}


// Displays or hides a message indicating if passwords match
function show_message_is_passwords_dont_match ()
{
    if ( passwords_match() )
    {
        document.getElementById( "pass_mismatch" ).setAttribute( "class", "hidden error_container input_message" );
    }
    else
    {
        document.getElementById( "pass_mismatch" ).setAttribute( "class", "error_container input_message" );
    }
}


// Handler for the upload button click event
function onclick_upload ()
{
    $( "#progress_bar_upload" ).attr( "style", "" ); // Show progress bar
    $( "#upload_button" ).addClass( "btn" ).attr( "disabled", "true" ); // Disable button and add class
}


// Code to execute once the DOM is fully loaded
document.body.onload = function ()
{
    // Check for upload button and attach click handler
    if ( $( "#progress_bar_upload" ).length > 0 )
    {
        $( "#upload_button" ).click( onclick_upload );
    }

    // If username field exists, focus on the password field
    if ( document.getElementById( "username" ) )
    {
        document.getElementById( "password" ).focus();
    }

    // Setup event listener for WiFi enable/disable checkbox
    var wificheck = document.getElementById( "wificheck" );
    if ( wificheck )
    {
        wificheck.onclick = function ( event )
        {
            grey_out_wifi_conf( !event.target.checked );
        }
    }

    // Setup event listener for WiFi encryption dropdown
    var wifi_encryption = document.getElementById( "wifi_encryption" );
    if ( wifi_encryption )
    {
        wifi_encryption.onchange = function ( event )
        {
            onchange_security( event.target );
        }
    }

    // Setup event listeners for password fields to check for matches
    var confpassword = document.getElementById( "confpassword" );
    if ( confpassword )
    {
        confpassword.onkeyup = show_message_is_passwords_dont_match;
        document.getElementById( "password" ).onkeyup = show_message_is_passwords_dont_match;
    }

    // Toggle dmesg visibility
    var dmesg = document.getElementById( "dmesg" );
    if ( dmesg )
    {
        $( "#dmesg" ).hide(); // Hide dmesg by default
        $( "#dmesg_toogle" ).on( "click", function ()
        {
            if ( $( this ).text() == "Show" )
            {
                $( "#dmesg" ).show();
                $( this ).text( "Hide" );
            }
            else
            {
                $( "#dmesg" ).hide();
                $( this ).text( "Show" );
            }
            return false; // Prevent default link behavior
        } );
    }

    // WiFi detection and selection logic
    var detected_wifis = document.getElementById( "detected_wifis" );
    if ( detected_wifis )
    {
        // Function to detect available WiFi networks
        var detect_wifi_networks = function ()
        {
            var detected_wifis = $( "#detected_wifis" );
            if ( detected_wifis[0].disabled )
            {
                return false;
            }

            detected_wifis.empty();
            detected_wifis.append( "<option>Detecting ...</option>" );

            // AJAX call to get WiFi networks
            $.get( refresh_wifi_url, function ( wifis )
            {
                detected_wifis.empty();
                detected_wifis.append( "<option>Select a wifi network...</option>" );

                // Populate dropdown with detected networks
                for ( var idx = 0; idx < wifis.length; idx++ )
                {
                    var html = "<option value=\"" + wifis[idx].name + "|||" + wifis[idx].encryption + "\">" + wifis[idx].name + " (";
                    if ( wifis[idx].encryption !== "none" )
                    {
                        html = html + wifis[idx].pretty_encryption + ", ";
                    }
                    html = html + "quality " + wifis[idx].signal_strength + "%";
                    html = html + ")</option>";
                    detected_wifis.append( html );
                }
            } );
            return false;
        };

        // Attach click handler to refresh button
        document.getElementById( "refresh_detected_wifis" ).onclick = detect_wifi_networks;

        // Handle selection of a detected WiFi network
        detected_wifis.onchange = function ()
        {
            var parts = $( "#detected_wifis" ).val().split( "|||" );
            if ( parts.length !== 2 )
            {
                return;
            }

            $( "#wifi_ssid" ).val( parts[0] );
            var $wifi_encryption = $( "#wifi_encryption" );
            $wifi_encryption.val( parts[1] );
            $wifi_encryption.change(); // Trigger change event for encryption
        };

        detect_wifi_networks(); // Initial call to detect networks
    }

    // REST API toggle functionality
    var restopen = document.getElementById( "restopen" );
    if ( restopen )
    {
        var toogle_rest_api = function ()
        {
            var data = {};
            data[this.name] = $( this ).val();
            $.post( this.form.action, data ); // Send POST request to update setting
        };

        restopen.onclick = toogle_rest_api;
        document.getElementById( "restpass" ).onclick = toogle_rest_api;
    }
};