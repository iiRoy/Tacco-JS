// Global configuration and utility handles
const EMPTY_LINK_HREF = 'javascript:void(0);'; // Standard void link for UI elements
const g_document_handle = $(document); // jQuery wrapper for the document object
let g_base_button_element; // Reusable base button jQuery object
let g_cached_initial_popup_template; // Stores the template for new modals

// Helper function for rendering a simple loading spinner overlay.
function generateLoadingSpinnerMarkup(isVisible = true) {
    if (!isVisible) {
        return '';
    }
    // Using Bootstrap 4/5 spinner classes
    return '<div class="progress-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7); display: flex; justify-content: center; align-items: center; z-index: 1050;"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>';
}

// Helper function for removing any active loading spinners.
function obliterateLoadingSpinner() {
    $('.progress-overlay').remove();
}

// Helper function to attempt to focus the first interactive element within a given container.
function setInitialFocusOnElement(containerId) {
    const targetContainer = $('#' + containerId);
    if (!targetContainer.length) {
        console.warn(`Container with ID '${containerId}' not found for focus operation.`);
        return;
    }
    // Prioritize inputs, textareas, selects, or elements with tabindex
    const focusableElement = targetContainer.find('input:visible:enabled, textarea:visible:enabled, select:visible:enabled, [tabindex]:visible:enabled').first();
    if (focusableElement.length) {
        focusableElement.focus();
    } else {
        // Fallback: if no specific input, try to focus the modal content itself if it has a tabindex
        targetContainer.find('.modal-content').attr('tabindex', '-1').focus();
    }
}


// Event listener for modal display, ensuring focus on relevant input fields.
// This targets modals that do NOT have the 'no-auto-focus' class.
g_document_handle.on('shown.bs.modal', '.modal:not(.no-auto-focus)', function(evt) {
    // Only process if the event target is the modal itself, not a child element.
    if (evt.target === this) {
        setInitialFocusOnElement($(this).attr('id'));
    }
});

// Immediately invoked function expression to extend jQuery's functionality.
((jq) => {
    /**
     * Facilitates the creation and display of Bootstrap modals with dynamic content loading and callbacks.
     * @param {object} config - Configuration object for the modal.
     * @param {string} config.popupIdentifier - A unique ID for the modal.
     * @param {string} [config.remoteContentPath] - URL to fetch modal content remotely.
     * @param {string} [config.extraCssClass] - Additional CSS class(es) to apply to the modal dialog.
     * @param {boolean} [config.isStaticContent=false] - If true, content is provided directly, not fetched remotely.
     * @param {string} [config.staticHtmlContent] - HTML content to inject directly if `isStaticContent` is true.
     * @param {Function} [config.onShowHandler] - Callback function to execute every time the modal is shown.
     * @param {any} [config.onShowHandlerArgs] - Arguments to pass to `onShowHandler`.
     * @param {Function} [config.onFirstShowHandler] - Callback function to execute only the first time the modal is shown.
     * @param {any} [config.onFirstShowHandlerArgs] - Arguments to pass to `onFirstShowHandler`.
     */
    jq.popupController = function(config) {
        // Essential configuration validation.
        if (!config || typeof config.popupIdentifier !== 'string' || config.popupIdentifier.trim() === '') {
            console.error('Popup configuration is invalid: "popupIdentifier" is missing or malformed.');
            return;
        }

        const popupId = config.popupIdentifier;
        const targetSelector = '#' + popupId;
        const remoteSource = config.remoteContentPath;
        const customClass = config.extraCssClass || '';
        const isStaticContent = !!config.isStaticContent; // Explicitly convert to boolean.
        const initialContent = config.staticHtmlContent || '';
        const onDisplayCallback = config.onShowHandler;
        const onDisplayArgs = config.onShowHandlerArgs;
        const onFirstDisplayCallback = config.onFirstShowHandler;
        const onFirstDisplayArgs = config.onFirstShowHandlerArgs;

        let currentPopupElement = jq(targetSelector);

        // If the modal element does not exist in the DOM, create it from the template.
        if (currentPopupElement.length === 0) {
            currentPopupElement = retrieveBaseModalTemplate(); // Already returns a clone
            currentPopupElement.attr('id', popupId); // Assign the specific ID

            // Apply any custom CSS classes to the inner modal-dialog for styling.
            if (customClass) {
                currentPopupElement.find('.modal-dialog').addClass(customClass);
            }

            // Handle content injection and loading indicators.
            if (!isStaticContent) {
                // For dynamic content, add a loading spinner while content is fetched.
                currentPopupElement.append(generateLoadingSpinnerMarkup(true));
            } else {
                // For static content, inject the provided HTML directly.
                const contentTarget = currentPopupElement.find('.modal-content');
                contentTarget.html(initialContent);

                // If the static content doesn't explicitly include header/footer, remove the template placeholders.
                if (!initialContent.includes('<div class="modal-header">') && contentTarget.find('.modal-header').length > 0) {
                    contentTarget.find('.modal-header').remove();
                }
                if (!initialContent.includes('<div class="modal-footer">') && contentTarget.find('.modal-footer').length > 0) {
                    contentTarget.find('.modal-footer').remove();
                }
            }

            // Append the newly created modal to the document body.
            currentPopupElement.appendTo('body');

            // Set up event handlers for the 'shown.bs.modal' event.
            currentPopupElement.on('shown.bs.modal', function(eventDetails) {
                // Ensure the event originated from the modal itself, not a child element.
                if (eventDetails.target !== this) {
                    return;
                }

                const hasBeenInitialized = jq(this).data('is-first-shown');

                // Execute the 'onFirstShowHandler' callback only once.
                if (onFirstDisplayCallback && !hasBeenInitialized) {
                    onFirstDisplayCallback(onFirstDisplayArgs);
                    jq(this).data('is-first-shown', true); // Mark as initialized to prevent re-execution.
                }

                // Execute the regular 'onShowHandler' callback every time the modal is displayed.
                if (onDisplayCallback) {
                    onDisplayCallback(onDisplayArgs);
                }

                // If content was dynamic, remove any loading indicators after the modal is shown.
                if (!isStaticContent) {
                    obliterateLoadingSpinner();
                }
            });

            // If a remote content path is provided for dynamic content, initialize the modal with it.
            if (remoteSource && !isStaticContent) {
                currentPopupElement.modal({ remote: remoteSource, show: true }); // Bootstrap will load content and then show.
                return; // Exit, as Bootstrap handles the rest.
            }
        }
        // For existing modals or newly created static content modals, simply show them.
        currentPopupElement.modal({ show: true });
    };
})(jQuery);


/**
 * Constructs and returns a base modal structure (template).
 * Caches the first generated template for efficient cloning.
 * @returns {jQuery} A cloned jQuery object representing the base modal structure.
 */
function retrieveBaseModalTemplate() {
    // If a template is already cached, return a clone to avoid re-creating DOM elements.
    if (g_cached_initial_popup_template) {
        return g_cached_initial_popup_template.clone(true, true); // Deep clone with event handlers
    }

    // Initialize the global base button element if not already done.
    if (!g_base_button_element) {
        g_base_button_element = $('<button/>', { 'class': 'btn', 'type': 'button' });
    }

    // Build the fundamental modal elements using a more explicit and chained approach.
    const modalFrame = $('<div/>', {
        'class': 'modal fade',
        'id': 'BaseModalTemplate', // A generic ID for the template, will be overwritten for instances.
        'tabindex': '-1',
        'role': 'dialog',
        'aria-labelledby': 'modalTitleLabel', // Add for accessibility
        'aria-hidden': 'true'
    });

    const dialogWrapper = $('<div/>', { 'class': 'modal-dialog' });
    const contentArea = $('<div/>', { 'class': 'modal-content' });
    const headerSection = $('<div/>', { 'class': 'modal-header' });
    const bodySection = $('<div/>', { 'class': 'modal-body' });
    const footerSection = $('<div/>', { 'class': 'modal-footer' });

    // Create a generic close button for the header.
    const dismissButton = $('<button/>', {
        'type': 'button', // Explicit type
        'class': 'close',
        'data-dismiss': 'modal',
        'aria-label': 'Close' // Accessibility label
    }).html('<span aria-hidden="true">&times;</span>'); // Visually "x" within a span.

    // Placeholder for the modal title.
    const modalTitle = $('<h5/>', { 'class': 'modal-title', 'id': 'modalTitleLabel' }); // Changed to h5, added ID for aria-labelledby.

    // Create standard action buttons from the base element.
    const cancelButton = g_base_button_element.clone().addClass('btn-secondary dismiss-btn').attr('data-dismiss', 'modal').text('Cancel');
    // Removed data-dismiss from confirm button to allow custom actions before dismissal.
    const confirmButton = g_base_button_element.clone().addClass('btn-primary action-btn').text('Confirm');

    // Assemble the modal structure in a logical order.
    headerSection.append(modalTitle, dismissButton); // Title typically comes before the close button.
    footerSection.append(cancelButton, confirmButton);

    contentArea.append(headerSection, bodySection, footerSection);
    dialogWrapper.append(contentArea);
    modalFrame.append(dialogWrapper);

    // Cache the fully constructed modal as a template.
    // We append to body and then detach to ensure jQuery fully renders/interprets the structure
    // before it's stored, which can sometimes be relevant for certain CSS properties or default behaviors.
    g_cached_initial_popup_template = modalFrame.appendTo('body').detach();

    return g_cached_initial_popup_template.clone(true, true); // Return a fresh clone.
}


/**
 * Processes a raw HTML string to normalize its structure, particularly by
 * wrapping orphaned inline content and text nodes into paragraph elements.
 * It also prunes empty text nodes and effectively empty HTML elements.
 * @param {string} rawHtmlString - The HTML string to be processed.
 * @returns {string} The normalized HTML string.
 */
function normalizeMarkupStructure(rawHtmlString) {
    // Expanded list of common block-level HTML elements.
    const structuralBlockElements = ['P', 'BLOCKQUOTE', 'TABLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'OL', 'UL', 'PRE', 'DIV', 'FORM', 'ADDRESS', 'ARTICLE', 'ASIDE', 'DETAILS', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'HEADER', 'MAIN', 'NAV', 'SECTION', 'SUMMARY', 'LI', 'DD', 'DT'];
    const temporaryHtmlContainer = $('<div/>'); // A temporary container to parse the input HTML.

    // Populate the temporary container with the provided HTML.
    temporaryHtmlContainer.html(rawHtmlString);

    // First pass: remove any superfluous empty text nodes (e.g., whitespace between tags).
    pruneWhitespaceNodes(temporaryHtmlContainer.get(0));

    const processedOutputWrapper = $('<div/>'); // This will hold the structured output.
    let currentParagraphBuffer = $('<p/>'); // Buffer for collecting inline content and text nodes.

    // Iterate over all direct children (including text nodes) of the temporary container.
    // `contents().each()` is used to ensure text nodes are also processed.
    temporaryHtmlContainer.contents().each(function() {
        const currentNode = $(this);
        const domNode = this; // Get the raw DOM node for nodeType and tagName checks.

        // Handle raw text nodes (nodeType 3)
        if (domNode.nodeType === Node.TEXT_NODE) {
            // Only append non-empty, non-whitespace text to the paragraph buffer.
            if (domNode.nodeValue.trim().length > 0) {
                currentNode.appendTo(currentParagraphBuffer);
            }
            return; // Move to the next node.
        }

        // Handle element nodes (nodeType 1)
        const tagName = domNode.tagName;

        if (structuralBlockElements.includes(tagName)) {
            // If a block-level element is encountered, first flush any buffered inline content.
            if (currentParagraphBuffer.contents().length > 0) {
                currentParagraphBuffer.appendTo(processedOutputWrapper);
                currentParagraphBuffer = $('<p/>'); // Reset the buffer for subsequent inline content.
            }
            // Then append the block element itself directly to the output wrapper.
            currentNode.appendTo(processedOutputWrapper);
        } else {
            // If it's an inline element, add it to the current paragraph buffer.
            currentNode.appendTo(currentParagraphBuffer);
        }
    });

    // After the loop, if there's any remaining content in the paragraph buffer, flush it.
    if (currentParagraphBuffer.contents().length > 0) {
        currentParagraphBuffer.appendTo(processedOutputWrapper);
    }

    // Second pass: clean up any elements that are effectively empty.
    // This includes elements that contain only whitespace or specific invisible characters.
    const INVISIBLE_UNICODE_SPACE = '\u200B'; // Zero-width space, often used in rich text editors.

    processedOutputWrapper.find('*').filter(function() {
        const element = $(this);
        // Exclude <br> tags from removal, as they are meaningful even if empty.
        if (element.is('br')) {
            return false;
        }

        const elementText = element.text();
        // Check if the element's text content is empty or contains only invisible characters/whitespace.
        if (elementText.trim().length === 0) {
            // If it has no children and no meaningful text, it's empty.
            if (element.children().length === 0) {
                return true;
            }
            // Further check: if it contains only invisible spaces or other whitespace, consider it empty.
            return elementText.split('').every(char => char === INVISIBLE_UNICODE_SPACE || /\s/.test(char));
        }
        return false;
    }).remove(); // Remove all identified empty elements.

    // Return the cleaned and normalized HTML string.
    return processedOutputWrapper.html();
}

/**
 * Recursively traverses a DOM element and removes text nodes that consist
 * solely of whitespace characters, excluding non-breaking spaces.
 * @param {HTMLElement} parentElement - The root element from which to start cleaning.
 */
function pruneWhitespaceNodes(parentElement) {
    const whitespaceOnlyRegex = /^\s+$/; // Matches strings consisting entirely of whitespace.
    const containsNonWhitespaceRegex = /\S/; // Matches if any non-whitespace character exists.

    const nodesToBeDeleted = []; // Array to collect nodes for deletion.

    // Inner recursive function to traverse the DOM tree and identify nodes for removal.
    function traverseAndIdentify(node) {
        // Only process text nodes (nodeType 3).
        if (node.nodeType === Node.TEXT_NODE) {
            const nodeValue = node.nodeValue;
            // A node is considered for deletion if it's purely whitespace AND
            // does NOT contain any non-whitespace characters (like actual text or non-breaking spaces).
            if (whitespaceOnlyRegex.test(nodeValue) && !containsNonWhitespaceRegex.test(nodeValue)) {
                nodesToBeDeleted.push(node);
            }
        } else {
            // For element nodes, iterate through their children.
            // Convert NodeList to an Array to safely iterate while potentially modifying children.
            Array.from(node.childNodes).forEach(child => {
                traverseAndIdentify(child);
            });
        }
    }

    // Start the recursive traversal from the provided parent element.
    if (parentElement) {
        traverseAndIdentify(parentElement);
    }

    // After identifying all nodes, iterate through the collected list and remove them from the DOM.
    nodesToBeDeleted.forEach(node => {
        // Ensure the node still has a parent before attempting removal.
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });
}