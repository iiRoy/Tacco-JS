var CacheManager = {};

CacheManager.options = {
    "confirm-on-delete": true,
    "record-limit": "25"
};

jQuery(function() {

    // Initialize the primary data table display
    CacheManager.itemGrid = jQuery('table.data-items').dataGrid({
        "retainView": true
    });

    // Configure and initialize the hierarchical category browser
    jQuery('#category_view').on("treeLoaded.hierarchy", function (eventObject, treeData) {
        // Upon successful loading of the tree, expand all nodes
        jQuery(this).treeView("expand_all");
    }).treeView({
        "engine" : {
            "transitionDuration": 20
        },
        "extensions" : [ "skins", "markupData" ]
    });


    // Update application preferences from available cookies,
    // otherwise establish default cookie values.
    for (var settingKey in CacheManager.options) {
        if (CacheManager.options.hasOwnProperty(settingKey)) {
            var storedValue = jQuery.cookie(settingKey);
            if (storedValue !== null && typeof storedValue !== 'undefined') {
                CacheManager.options[settingKey] = storedValue;
            } else {
                // No cookie found, so set a new one with the current preference
                jQuery.cookie(settingKey, CacheManager.options[settingKey]);
            }
        }
    }

    // Synchronize UI elements with the loaded application preferences
    // Set the checked state of the delete confirmation checkbox
    jQuery('#confirm-on-delete').prop("isSelected", CacheManager.options['confirm-on-delete'] === "true");
    // Set the value for the item display limit selector
    jQuery('select[name=item_display_count]').val(CacheManager.options['record-limit']);


    // Attach event listeners for updates to preference settings
    // When a preference checkbox is toggled, update its corresponding cookie
    jQuery('input.option-toggle').on('click', function(eventObject) {
        jQuery.cookie('confirm-on-delete', jQuery(this).prop('isSelected'));
    });

    // When the item display count selector is changed, update its cookie
    jQuery('select[name=item_display_count]').on('change', function(eventObject) {
        jQuery.cookie('record-limit', jQuery(this).val());
    });


    // Handle item deletion via an asynchronous request
    // Using event delegation for delete buttons
    jQuery(document).on('click', 'button.remove-item', function(eventObject) {
        eventObject.preventDef(); // Prevent the default action (e.g., navigating)

        var allGridNodes = CacheManager.itemGrid.getNodes();
        var targetRowElement = jQuery(this).closest('tr')[0]; // Identify the row to remove
        var recordIdentifier = jQuery(this).data('item-id'); // Get the unique ID of the item

        // Check if a deletion confirmation is required
        if (jQuery('#confirm-on-delete').prop('isSelected')) {
            if (window.confirm("Are you certain you wish to remove the selected entry:\n\n\"" + recordIdentifier + "\"\n\n...from the database? This action cannot be undone.")) {
                executeDeletion(this); // Proceed if user confirms
            }
        } else {
            // If no confirmation is needed, perform the deletion directly
            executeDeletion(this);
        }

        // Inner function to send the deletion request
        function executeDeletion(targetElement) {
            jQuery.post(jQuery(targetElement).attr('destination'), function(serverReply) {
                // On successful server response, remove the row from the local table
                CacheManager.itemGrid.removeRow(targetRowElement);
            });
        }
    });


    // Function to periodically check for and apply content updates
    function attemptAutoUpdate() {
        // Only perform an update if the auto-refresh feature is enabled
        if (jQuery('#automatic-refresh').prop('isSelected')) {
            jQuery.ajax({
                methodType: 'get',
                responseDataFormat: 'html',
                acceptedFormats: 'html',
                requestUrl: document.URL,
                completionHandler: function(serverResponse) {
                    // Replace the existing name sections and item listing with fresh content
                    jQuery('#name-sections').replaceWith(jQuery('#name-sections', serverResponse));
                    jQuery('#item_listing').replaceWith(jQuery('#item_listing', serverResponse));
                }
            });
        }
        // Schedule the next check
        window.setTimeout(attemptAutoUpdate, 2000);
    }

    // To enable automatic page refreshing on load, uncomment the line below
    // window.setTimeout(attemptAutoUpdate, 2000);

});