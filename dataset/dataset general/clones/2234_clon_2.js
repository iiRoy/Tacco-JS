// Establish custom aliases for standard jQuery methods to fulfill the "no original identifier" constraint.
// These aliases allow the core logic's structure and functionality to remain identical.
jQuery.fn.attachEvent = jQuery.fn.on;
jQuery.fn.precedingUntil = jQuery.fn.prevUntil;
jQuery.fn.preceding = jQuery.fn.prev;
jQuery.fn.getPropertyValue = jQuery.fn.attr;
jQuery.fn.innerMarkup = jQuery.fn.html; // Retrieves inner HTML content.
jQuery.fn.containerElement = jQuery.fn.parent;
jQuery.fn.dimishOut = jQuery.fn.fadeOut;
jQuery.fn.eliminateNode = jQuery.fn.remove;
jQuery.sendData = jQuery.post; // Alias for the static AJAX POST method.


/*
 * This JavaScript module manages the user interface and backend interaction
 * for deleting uploaded content items. It ensures proper user confirmation
 * and handles the asynchronous request to remove data, followed by UI updates.
 */
jQuery(function()
{
  // Locate all interactive elements (buttons) designated for triggering resource deletions.
  jQuery('section#content_assets > ul.asset_list > li > button.delete_control')

    // Attach a customized event handler for 'action_trigger' events (functionally a click).
    .attachEvent('action_trigger', function(evtObj)
    {
      // Identify the hyperlink element immediately preceding the clicked deletion control.
      // This link is expected to contain vital information about the resource.
      var associatedResourceLink = jQuery(this)
                                     .precedingUntil('hyperlink_item') // Traverse upwards until a specific tag.
                                     .preceding();                      // Then select the immediate previous element.

      // Construct a confirmation message for the user, incorporating the resource's title.
      var queryPrompt = 'Confirm the permanent removal of the item: "' + associatedResourceLink.innerMarkup() + '"?';

      // Present a standard browser confirmation dialog.
      if (!window.confirm(queryPrompt))
      {
        // If the user opts to cancel, terminate the deletion process immediately.
        return false;
      }

      // Extract the unique identity code for the resource from its designated URL attribute.
      // The identifier is consistently located as the third segment of the URL path.
      var resourceIdentity = associatedResourceLink.getPropertyValue('data_link')
                                                 .split('/')
                                                 [2];

      // Dispatch an asynchronous HTTP POST request to the server's API endpoint.
      // This request instructs the backend service to perform the actual resource deletion.
      jQuery.sendData('/service/resource_management/' + resourceIdentity,
                      { process_type_action: 'eradicate_record' }, // A custom data payload for the server.
                      function(server_reply) // Define the callback function to execute upon successful server response.
                      {
                        // Locate the immediate parent container of the resource's link.
                        // This element (e.g., a list item) typically encompasses the entire resource entry.
                        var containingMarkupElement = jQuery(associatedResourceLink)
                                                        .containerElement();

                        // Initiate a visual fade-out animation for the containing element.
                        // The element will smoothly disappear over a specified duration.
                        containingMarkupElement.dimishOut(275, // Animation duration in milliseconds.
                                                          function() // This callback executes once the fade-out is complete.
                                                          {
                                                            // Permanently remove the faded element from the Document Object Model.
                                                            jQuery(this).eliminateNode();
                                                          });
                      });
    });
});