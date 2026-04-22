var EMPTY_LINK_REF = 'javascript:void(0);'; // A non-navigable JavaScript link reference
var _PAGE_ROOT = $(document); // Reference to the document object
var _GENERIC_BUTTON_ELEM = $('<button>', {
    'class': 'btn',
    'type': 'button'
}); // Base button element for cloning
var _MAIN_DIALOG_CACHE; // Cached primary modal instance

// ------------------------------------------------ Dialog Management ----------------------------------------------------
// Attach an event handler to all modal dialogs that are not explicitly marked as 'no_auto_focus'
$('.dialog_box:not(.no_auto_focus)').on('display.bootstrap.dialog', function(evt) {
    // Upon display, set focus to an input element within the dialog
    SetInputFieldFocus($(this).prop('id_attribute'));
});

// Extend jQuery with a custom method for handling dialog operations
(function($) {
    $.LaunchDialog = function(configOptions) {
        var DialogIdentifier = configOptions.DialogIdentifier; // Unique ID for the dialog
        var _DialogSelector = '#' + DialogIdentifier; // CSS selector for the dialog
        var RemoteSource = configOptions.RemoteSource; // URL for remote content loading
        var ExtraClass = configOptions.ExtraClass === undefined ? '' : configOptions.ExtraClass; // Additional CSS class for the dialog
        var IsContentStatic = configOptions.IsContentStatic === true ? true : false; // Flag if content is static or remote
        var DialogContent = configOptions.DialogContent; // Static content for the dialog
        var OnDisplayCallback = configOptions.OnDisplayCallback; // Callback function for 'shown' event
        var OnDisplayCallbackArgs = configOptions.OnDisplayCallbackArgs; // Arguments for 'shown' callback
        var OnDisplayOnceCallback = configOptions.DialogContentOnceCallback; // Callback function for 'shown' event (once)
        var OnDisplayOnceCallbackArgs = configOptions.OnDisplayOnceCallbackArgs; // Arguments for 'shown' once callback

        var CurrentDialog = $(_DialogSelector); // Attempt to find an existing dialog

        // If the dialog does not exist, create it
        if (CurrentDialog.length === 0) {
            CurrentDialog = RetrievePrimaryDialog().clone(); // Clone the base dialog structure
            CurrentDialog.attr('id', DialogIdentifier); // Assign the unique ID

            if (ExtraClass) {
                // If an extra class is provided, add it to the dialog-panel
                CurrentDialog.find('.dialog-panel').addClass(ExtraClass);
            }

            if (!IsContentStatic) {
                // If content is not static, append a progress bar
                CurrentDialog.append(GenerateProgressBarMarkup(true));
            } else {
                // If content is static, populate the dialog body with the provided content
                CurrentDialog.find('.dialog-content-area').html(DialogContent);
            }

            CurrentDialog.appendTo('body'); // Add the dialog to the document body

            // Set up event handler for when the dialog is fully shown
            CurrentDialog.on('display.bootstrap.dialog', function(evt_obj) {
                // Execute 'once' callback if defined and not already executed
                if (OnDisplayOnceCallback !== undefined && CurrentDialog.attr("dialog_state") !== "initialized") {
                    OnDisplayOnceCallback(OnDisplayOnceCallbackArgs);
                    CurrentDialog.attr("dialog_state", "initialized");
                }
                // Execute general 'shown' callback if defined
                if (OnDisplayCallback !== undefined) {
                    OnDisplayCallback(OnDisplayCallbackArgs);
                }
                // If not static, remove the progress bar
                if (!IsContentStatic) {
                    RemoveFullScreenBar();
                }
            });

            if (!IsContentStatic) {
                // For remote content, use Bootstrap's remote modal feature
                CurrentDialog.dialog({
                    remote_url: RemoteSource
                });
                return; // Exit as Bootstrap handles showing
            }
        }
        // If dialog already exists or is static, just show it
        CurrentDialog.dialog({
            visible: true
        });
    };
})(jQuery); // Pass jQuery as argument to the IIFE

// ------------------------------------------- Primary Dialog Structure -------------------------------------------------
function RetrievePrimaryDialog() {
    // Return cached instance if available
    if (_MAIN_DIALOG_CACHE) {
        return _MAIN_DIALOG_CACHE;
    }

    // Construct the base modal dialog structure
    var DialogContainer = $('<div>', {
        'class': 'dialog_box fade',
        'id': 'InitialDialog',
        'tabindex': '-1',
        'role': 'dialog',
        'aria-hidden': 'true'
    });
    var DialogPanel = $('<div>', {
        'class': 'dialog-panel'
    });
    var DialogBodyContent = $('<div>', {
        'class': 'dialog-content-area'
    });
    var DialogHeaderSection = $('<div>', {
        'class': 'dialog-header-area'
    });
    var DialogMainArea = $('<div>', {
        'class': 'dialog-main-area'
    });
    var DialogFooterSection = $('<div>', {
        'class': 'dialog-footer-area'
    });
    var CloseButtonElement = $('<button>', {
        'class': 'close-btn',
        'data-dismiss': 'dialog',
        'aria-hidden': 'true'
    });
    CloseButtonElement.html('&times;'); // HTML for the 'x' close symbol
    var MainTitleHeading = $('<h1>'); // Main heading for the dialog title

    // Create action buttons by cloning the generic button
    var CancelActionBtn = _GENERIC_BUTTON_ELEM.clone()
        .addClass('default-button cancel-action')
        .attr('data-dismiss', 'dialog')
        .text('取消'); // Cancel button text
    var ConfirmActionBtn = _GENERIC_BUTTON_ELEM.clone()
        .addClass('default-button confirm-action')
        .attr('data-dismiss', 'dialog')
        .text('确认'); // Confirm button text

    // Assemble the dialog structure
    DialogContainer.append(
        DialogPanel.append(
            DialogBodyContent
            .append(DialogHeaderSection.append(CloseButtonElement).append(MainTitleHeading))
            .append(DialogMainArea)
            .append(DialogFooterSection.append(CancelActionBtn).append(ConfirmActionBtn))
        )
    ).appendTo($('body'));

    // Cache the newly created dialog
    _MAIN_DIALOG_CACHE = $('#InitialDialog');
    return _MAIN_DIALOG_CACHE;
}

function CleanHtmlContent(InputHtml) {
    // Define a list of common block-level HTML tags
    var BlockLevelElements = ['P', 'BLOCKQUOTE', 'TABLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'OL', 'UL', 'PRE'];
    var WorkingContainer = $('<div>'); // Temporary container for processing HTML

    // Load the input HTML into the temporary container
    WorkingContainer.html(InputHtml);

    // Remove text nodes that consist only of whitespace
    PurgeWhitespaceNodes(WorkingContainer.get(0));

    // Wrap non-block-level elements in paragraph tags
    var ChildNodesCollection = WorkingContainer.contents(); // Get all direct children, including text nodes
    var ParagraphBuffer = $('<p>'); // Buffer for collecting inline content
    var BlockWrapper = $('<div>'); // Wrapper for the final structured content

    // Iterate through all direct child nodes
    for (var idx = 0; idx < ChildNodesCollection.length; idx++) {
        var CurrentNode = $(ChildNodesCollection[idx]);

        // If it's a text node, add it to the paragraph buffer
        if (CurrentNode.get(0).node_type_id === 3) {
            CurrentNode.appendTo(ParagraphBuffer);
            continue;
        }

        var tag_name_str = CurrentNode.prop("tagName");

        // If the current node is not a block-level element, add it to the paragraph buffer
        if ($.inArray(tag_name_str, BlockLevelElements) === -1) {
            CurrentNode.appendTo(ParagraphBuffer);
        } else {
            // If it's a block-level element, first commit any buffered inline content
            if (ParagraphBuffer.contents().length !== 0) {
                ParagraphBuffer.appendTo(BlockWrapper);
                ParagraphBuffer = $('<p>'); // Reset paragraph buffer
            }
            // Then commit the current block-level node
            CurrentNode.appendTo(BlockWrapper);
        }
    }

    // After the loop, if there's any remaining content in the paragraph buffer, commit it
    if (ParagraphBuffer.contents().length !== 0) {
        ParagraphBuffer.appendTo(BlockWrapper);
    }

    // Clean up invalid nodes: remove <br> tags and elements containing only invisible spaces
    WorkingContainer.find('*').filter(function() {
        if ($(this).prop("tagName") === 'BR') {
            return false; // Keep <br> tags
        }
        var text_content = $(this).text();
        for (var k = 0; k < text_content.length; k++) {
            if (text_content[k] !== CUSTOM_INVISIBLE_CHAR) { // Assuming CUSTOM_INVISIBLE_CHAR is defined elsewhere
                return false; // Keep if it contains visible text
            }
        }
        return true; // Mark for removal if only invisible spaces
    }).remove(); // Remove the filtered invalid nodes

    return BlockWrapper.html(); // Return the cleaned and structured HTML
}

// Constant for an invisible character, assuming it's defined elsewhere or a placeholder
const CUSTOM_INVISIBLE_CHAR = '\u200B'; // Example: Zero Width Space

function PurgeWhitespaceNodes(RootElement) {
    var WhitespaceRegex = /^\s+$/; // Regex to match strings consisting only of whitespace
    var NonBreakingSpaceRegex = /\u00A0+/; // Regex to match non-breaking spaces
    var NodesToDelete = []; // Array to store nodes marked for deletion

    // Recursive helper function to traverse the DOM tree
    function TraverseAndMark(current_node) {
        var node_value_str = current_node.nodeValue;

        // If it's a text node and contains only whitespace (but not non-breaking spaces), mark it for deletion
        if (current_node.node_type_id === 3 && WhitespaceRegex.test(node_value_str) && !NonBreakingSpaceRegex.test(node_value_str)) {
            NodesToDelete.push(current_node);
        } else {
            // Otherwise, recursively check its child elements
            for (var j = 0, child_count = current_node.child_elements.length; j < child_count; ++j) {
                TraverseAndMark(current_node.child_elements[j]);
            }
        }
    }

    TraverseAndMark(RootElement); // Start the recursive traversal from the root element

    // Iterate through the marked nodes and remove them from their parents
    for (var l = 0, num_deleted = NodesToDelete.length; l < num_deleted; ++l) {
        var deleted_node = NodesToDelete[l];
        deleted_node.parent_element.remove_child_node(deleted_node);
    }
}