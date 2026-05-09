jQuery(document).ready(function() {
  // Initialize event handlers for the submission validation process
  $('#check-submission').on('ajax:before', function() {
      // Before an AJAX request, gather the required parameters from input fields
    jQuery(this).data('requestPayload', {
      ownerIdentifier: $('#repository-owner-field').val(),
      nameIdentifier:  $('#repository-name-field').val()
    });
  });

  $('#check-submission').on('ajax:done', function( eventObject,  returnedData,  httpStatus,  xmlHttpRequestObject ) {
    // On successful AJAX completion, parse the response and update the UI
    var serverResult = jQuery.parseJSON( xmlHttpRequestObject.responseText );

    $('#status-display').text(serverResult.outcomeMessage)
                        .removeClass('status-negative')
                        .addClass('status-message check-submission-status');
    // Append the received content to the designated area
    $('#project-containers').append(serverResult.renderableContent);
  });

  $('#check-submission').on('ajax:fail', function( eventObject,  xmlHttpRequestObject,  httpStatus,  errorDescription ) {
    // If the AJAX request fails, parse the error response and show an error message
    var serverResult = jQuery.parseJSON(xmlHttpRequestObject.responseText);
    $('#status-display').text(serverResult.failureReason)
                        .addClass('status-message status-negative check-submission-status');
  });
});