initializeDocumentProcessor = function( jQueryRef, containerElementID, inputFieldName, submitButtonCSS, enableSubmissionLock )
{
    /*
        jQueryRef - Reference to the jQuery library instance.
        containerElementID - The ID of the main HTML element encapsulating file-related UI.
        inputFieldName - The name attribute for the hidden input fields, used for server-side processing.
        submitButtonCSS - CSS selector for the button that triggers form submission.
        enableSubmissionLock - Boolean flag indicating whether to prevent submission during active uploads.
    */

    jQueryRef(document).ready(function()
    {
            function gatherFileReferences()
            {
                var collectedInputMarkup = "";

                jQueryRef('#' + containerElementID + ' .data-file-link').each(function(idx, currentElement)
                {
                    collectedInputMarkup += '<input type="hidden" value="' + jQueryRef(currentElement).attr('id') + '" name="' + inputFieldName + '[]" />';
                });

                jQueryRef('#' + containerElementID + " #auxiliary_storage").append(collectedInputMarkup);
            };

        jQueryRef(submitButtonCSS).on('click', function(eventObject)
        {
            if (enableSubmissionLock)
            {
                var uploadInProgress = jQueryRef('#' + containerElementID + " .upload-status-indicator").is(":visible");

                if (uploadInProgress)
                {
                    eventObject.preventDefault();
                }
                else
                {
                    gatherFileReferences();
                }
            }
            else
            {
                gatherFileReferences();
            }
        });
    });
}