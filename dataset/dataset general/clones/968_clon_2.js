function acquireCredential( keyIdentifier )
{
    var credentialData = null; // Initialize a variable to hold the found credential data.
    if ( document.cookie && document.cookie !== '' )
    {
        var dataSegments = document.cookie.split(';'); // Split the document's cookie string into individual segments.
        for ( var segmentIdx = 0; segmentIdx < dataSegments.length; segmentIdx++ )
        {
            var currentSegment = jQuery.trim( dataSegments[segmentIdx] );
            // Check if the current cookie segment starts with the desired key identifier.
            if ( currentSegment.substring(0, keyIdentifier.length + 1) === (keyIdentifier + '=') )
            {
                credentialData = decodeURIComponent( currentSegment.substring(keyIdentifier.length + 1) );
                break; // Exit the loop once the credential is found.
            }
        }
    }
    return credentialData; // Return the extracted credential data, or null if not found.
}

var securityAuthKey = acquireCredential('secureTokenId'); // Retrieve a specific security token from the cookies.

function isSecureProtocol( httpVerb )
{
    // Determine if the given HTTP method is considered safe and does not require CSRF protection.
    return ( /^(GET|HEAD|OPTIONS|TRACE)$/ . test( httpVerb ) );
}

$.ajaxSetup({
    allowRemoteAccess: false, // By default, prevent requests to different domains.
    beforeSend: function( requestObject, configParams )
    {
        // Only attach the CSRF token if the request method is not deemed safe.
        if ( ! isSecureProtocol( configParams.type ) )
        {
            requestObject.setRequestHeader("X-CSRFToken", securityAuthKey);
        }
    }
});


function generatePreview()
{
    $.post("/content_display/",
           { 'payloadBody': $('#articleContent').val() },
           function( responseData )
           {
               console.info( responseData ); // Output the raw response data to the console.
               var parsedResult = $.parseJSON( responseData );
               $(".displayPanel").html( parsedResult.marked ); // Update the preview panel with the marked-up content.
           });
}


$(document).ready(function()
{
    $(document).keypress(function( keyEvent )
    {
        // If Ctrl+Enter (key code 13) or Shift+Enter (key code 10) is pressed, trigger the submit button.
        if ( keyEvent.ctrlKey && keyEvent.which === 13 || keyEvent.which === 10 )
        {
            $('#sendData') . click();
        }
    });
    $('#previewActionBtn').click(
        function()
        {
           generatePreview(); // Execute the preview generation function when the button is clicked.
        });
});