// This module provides a flexible notation layer, originally conceived as "Metaframe", for enhancing wireframes, mockups, and design compositions with contextual information.
// Developed with care by the team at Elliance. Copyright 2013 Elliance, Inc. - Licensed under Creative Commons Attribution Sharealike 3.0 Unported: http://creativecommons.org/licenses/by-sa/3.0/

// Ensure jQuery is loaded before proceeding. This script relies heavily on jQuery.
if (typeof jQuery === 'undefined') {
    console.error('CRITICAL ERROR: jQuery library not found. The annotation and comment system cannot initialize.');
    // In a production environment, one might dynamically load jQuery or provide a fallback.
    // For this clone, we assume jQuery is available in the global scope.
}

// Global configuration and constants for the notation system.
const APP_SETTINGS = {
    ANIMATION_DURATION_MS: 300, // Duration for panel slide animations in milliseconds.
    DESKTOP_BREAKPOINT_PX: 700, // Screen width in pixels to switch between right/bottom panel layouts.
    PANEL_DEFAULT_DIMENSION_PX: 330, // Default width/height for the side panel.
    TOGGLE_BUTTON_INITIAL_OFFSET_PX: 10, // Initial offset of the panel toggle button from the edge.
    TOGGLE_BUTTON_OPEN_OFFSET_PX: 340, // Offset of the toggle button when the panel is open.
    NO_ANNOTATIONS_MESSAGE: 'No annotations have been added yet. This page is pristine!', // Message when no page annotations are found.
    COMMENT_REFRESH_INTERVAL_MS: 10 * 60 * 1000 // Interval for refreshing comments from the source (10 minutes).
};

/**
 * Creates a debounced version of a function, delaying its execution until
 * after a certain period of inactivity. Useful for events like window resizing.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}

// Main initialization block, executed when the DOM is fully loaded using jQuery's ready function.
jQuery(function ($) { // Using $ as a local alias for jQuery to avoid conflicts.

    const $bodyElement = $('body');
    const $windowElement = $(window);

    // --- Dynamic DOM Element Creation ---

    // Create and append the button that toggles the visibility of the side panel.
    const $togglePanelButton = $('<a/>', {
        'class': 'toggle-panel-btn', // Unique class name for the toggle button.
        href: '#',
        text: 'View Notes' // User-friendly text on the button.
    }).appendTo($bodyElement);

    // Create and append the main container for annotations and comments.
    const $sidePanelContainer = $('<div/>', {
        'class': 'side-panel-container scrollable-content' // Unique classes for styling and scroll behavior.
    }).appendTo($bodyElement);

    // --- Page Information Display ---

    // Retrieve the page title for prominent display within the panel.
    const currentPageHeader = document.title || 'Untitled Document'; // Robustly get page title.
    $sidePanelContainer.html('<h2>' + currentPageHeader + '</h2>'); // Display title with appropriate heading level.

    // Append static structural elements for the annotation section.
    const staticPanelElements = [
        '<form class="marker-visibility-form"><input type="checkbox" id="showMarkersToggle" checked="checked"> <label for="showMarkersToggle">Show annotation markers</label></form>', // Checkbox for marker visibility.
        '<h3>Page Annotations</h3>' // Sub-heading for specific page annotations.
    ];
    $sidePanelContainer.append(staticPanelElements.join(''));

    // --- Dynamic Page Annotation Processing ---

    let markerCounter = 0;
    // Extract annotation content from elements marked with '.annotation-marker'.
    const annotationContentArray = $(".annotation-marker").map(function () {
        markerCounter++;
        return $(this).data("note") || $(this).attr("note"); // Prioritize data-attribute for flexibility.
    }).get(); // Convert jQuery object to a standard JavaScript array.

    // If annotations are found, generate and append their display.
    if (markerCounter > 0) {
        let allAnnotationsHtml = '';
        for (let i = 0; i < markerCounter; i++) {
            allAnnotationsHtml += '<div class="remark-entry">' +
                '<span class="remark-idx">' + (i + 1) + '</span>' + // Display sequential index.
                '<span class="remark-text">' + annotationContentArray[i] + '</span>' + // Display actual annotation text.
                '</div>';
        }
        $sidePanelContainer.append(allAnnotationsHtml);
    } else {
        // Display a message if no annotations are found on the page.
        $sidePanelContainer.append('<p class="no-annotations-info">' + APP_SETTINGS.NO_ANNOTATIONS_MESSAGE + '</p>');
    }

    // Embed visual anchor links within the main content for easy navigation to annotations.
    let anchorIndex = 0;
    $('.annotation-marker').each(function () {
        anchorIndex++;
        $(this).prepend('<span class="marker-link"><figure>' + (anchorIndex) + '</figure></span>'); // Add a numbered marker.
    });

    // Initialize the dynamic comment system, if configured via meta tags.
    initializeCommentSystem();

    // --- Responsive Panel Control Logic ---

    /**
     * Determines if the current window width corresponds to a desktop layout.
     * @returns {boolean} True if desktop layout, false otherwise.
     */
    const isDesktopLayout = () => $windowElement.width() > APP_SETTINGS.DESKTOP_BREAKPOINT_PX;

    /**
     * Manages the display and animation of the side panel based on its intended orientation.
     * @param {'right' | 'bottom'} orientation - The desired display orientation ('right' for desktop, 'bottom' for mobile).
     */
    function manageSidebarDisplay(orientation) {
        const panelProperty = orientation === 'right' ? 'right' : 'bottom';
        const panelClosedPosition = '-' + APP_SETTINGS.PANEL_DEFAULT_DIMENSION_PX + 'px';
        const panelOpenPosition = '0px';
        const buttonClosedPosition = APP_SETTINGS.TOGGLE_BUTTON_INITIAL_OFFSET_PX + 'px';
        const buttonOpenPosition = APP_SETTINGS.TOGGLE_BUTTON_OPEN_OFFSET_PX + 'px';

        // Detach previous click handlers to prevent multiple bindings on resize.
        $togglePanelButton.off('click.panelToggle');
        $('.marker-link').off('click.panelToggle');

        // Attach new click handler for both the toggle button and individual markers.
        $('.marker-link, .toggle-panel-btn').on('click.panelToggle', function (e) {
            e.preventDefault(); // Prevent default link behavior.

            if (!$togglePanelButton.hasClass('panel-is-open')) {
                // If panel is closed, animate it open.
                $sidePanelContainer.animate({ [panelProperty]: panelOpenPosition }, APP_SETTINGS.ANIMATION_DURATION_MS);
                $togglePanelButton.animate({ [panelProperty]: buttonOpenPosition }, APP_SETTINGS.ANIMATION_DURATION_MS);
                $togglePanelButton.addClass('panel-is-open');
            } else {
                // If panel is open, animate it closed.
                $sidePanelContainer.animate({ [panelProperty]: panelClosedPosition }, APP_SETTINGS.ANIMATION_DURATION_MS);
                $togglePanelButton.animate({ [panelProperty]: buttonClosedPosition }, APP_SETTINGS.ANIMATION_DURATION_MS);
                $togglePanelButton.removeClass('panel-is-open');
            }
        });
    }

    // Apply initial panel state and event handlers on page load.
    if (isDesktopLayout()) {
        $sidePanelContainer.css({ right: '-' + APP_SETTINGS.PANEL_DEFAULT_DIMENSION_PX + 'px', bottom: 'auto' }).removeClass('bottom-oriented');
        $togglePanelButton.css({ right: APP_SETTINGS.TOGGLE_BUTTON_INITIAL_OFFSET_PX + 'px', bottom: 'auto' });
        manageSidebarDisplay('right');
    } else {
        $sidePanelContainer.addClass('bottom-oriented').css({ bottom: '-' + APP_SETTINGS.PANEL_DEFAULT_DIMENSION_PX + 'px', right: 'auto' });
        $togglePanelButton.css({ bottom: APP_SETTINGS.TOGGLE_BUTTON_INITIAL_OFFSET_PX + 'px', right: 'auto' });
        manageSidebarDisplay('bottom');
    }

    // Handle window resize events, debounced for performance.
    $windowElement.on('resize', debounce(function () {
        $togglePanelButton.removeClass('panel-is-open'); // Reset panel state on resize.

        if (isDesktopLayout()) {
            $sidePanelContainer.css({ right: '-' + APP_SETTINGS.PANEL_DEFAULT_DIMENSION_PX + 'px', bottom: 'auto' }).removeClass('bottom-oriented');
            $togglePanelButton.css({ right: APP_SETTINGS.TOGGLE_BUTTON_INITIAL_OFFSET_PX + 'px', bottom: 'auto' });
            manageSidebarDisplay('right');
        } else {
            $sidePanelContainer.css({ bottom: '-' + APP_SETTINGS.PANEL_DEFAULT_DIMENSION_PX + 'px', right: 'auto' }).addClass('bottom-oriented');
            $togglePanelButton.css({ bottom: APP_SETTINGS.TOGGLE_BUTTON_INITIAL_OFFSET_PX + 'px', right: 'auto' });
            manageSidebarDisplay('bottom');
        }
    }, 250)); // Wait 250ms after resizing stops before executing.

    // --- Annotation Marker Visibility Toggle ---
    $('#showMarkersToggle').on('change', function () {
        $('.marker-link').toggle(this.checked); // Toggle visibility based on checkbox state.
    });

    // --- Custom Scrollable Content Handling ---
    // This section implements custom scroll behavior for the side panel, preventing
    // the page from scrolling when the panel's content reaches its scroll limits.
    $('.scrollable-content').on('DOMMouseScroll mousewheel', function (eventObject) {
        const $currentScrollable = $(this);
        const currentScrollPosition = this.scrollTop;
        const totalContentHeight = this.scrollHeight;
        const visibleViewportHeight = $currentScrollable.height();
        // Normalize wheelDelta for cross-browser compatibility (Firefox uses detail).
        const scrollAmount = eventObject.originalEvent.wheelDelta || -eventObject.originalEvent.detail;
        const isScrollingUp = scrollAmount > 0;

        // Helper function to prevent default scroll behavior.
        const haltEventPropagation = function () {
            eventObject.stopPropagation();
            eventObject.preventDefault();
            eventObject.returnValue = false; // For older IE versions.
            return false;
        };

        // Check if scrolling down beyond the content's bottom.
        if (!isScrollingUp && -scrollAmount > totalContentHeight - visibleViewportHeight - currentScrollPosition) {
            $currentScrollable.scrollTop(totalContentHeight);
            return haltEventPropagation();
        }
        // Check if scrolling up beyond the content's top.
        else if (isScrollingUp && scrollAmount > currentScrollPosition) {
            $currentScrollable.scrollTop(0);
            return haltEventPropagation();
        }
        // If scrolling normally within bounds, allow default behavior.
    });

}); // End of jQuery(function ($) { ... });

/**
 * Initializes the metaframe-like comments functionality on the page.
 * It reads configuration from <meta> tags to determine if a comment form
 * and/or display area should be rendered.
 *
 * Configuration Meta Tags:
 * - <meta name="metaframe-csv" content="path/to/comments.csv">: Specifies the CSV file containing existing comments.
 * - <meta name="metaframe-form" content="path/to/submit.php">: Specifies the backend endpoint for submitting new comments.
 */
function initializeCommentSystem() {
    const commentDataSource = jQuery('meta[name="metaframe-csv"]').attr('content');
    const submissionEndpoint = jQuery('meta[name="metaframe-form"]').attr('content');
    const initialRemarksCollection = []; // An initially empty collection for comments.

    // Guard clause: If no comment source or submission endpoint is defined, exit early.
    if (!submissionEndpoint && !commentDataSource) {
        return;
    }

    // If a form is present but no CSV source, default to a standard CSV filename.
    let effectiveCommentDataSource = commentDataSource;
    if (!effectiveCommentDataSource && submissionEndpoint) {
        effectiveCommentDataSource = 'comments.csv';
    }

    const $sidePanelContainer = jQuery('.side-panel-container');
    // Guard clause: Ensure the target container for comments exists.
    if ($sidePanelContainer.length === 0) {
        console.warn('Comment system cannot initialize: Target container (.side-panel-container) not found in DOM.');
        return;
    }

    // Append the HTML structure for the comments section to the panel.
    $sidePanelContainer.append(buildCommentPanelMarkup(submissionEndpoint));

    // Initialize the comment manager, which handles loading, adding, and displaying comments.
    const commentManager = createCommentManager({
        csv_filename: effectiveCommentDataSource,
        form_action: submissionEndpoint,
        external_comments: initialRemarksCollection // Pass the initial empty collection.
    });

    // Setup event handler for comment form submission.
    jQuery('.feedback-form').on('submit', handleCommentSubmission({
        commentManager: commentManager,
        csv_filename: effectiveCommentDataSource,
        form_action: submissionEndpoint
    }));

    // Enable Shift + Enter as a shortcut for submitting comments in the textarea.
    jQuery('.feedback-form').on('keypress', function (eventObject) {
        if (eventObject.keyCode === 13 && eventObject.shiftKey) {
            jQuery(this).trigger('submit');
        }
    });

    // Load initial comments and set up periodic refresh if a data source is defined.
    commentManager.load();
    if (effectiveCommentDataSource) {
        setInterval(commentManager.load, APP_SETTINGS.COMMENT_REFRESH_INTERVAL_MS);
    }

    // If the URL hash indicates a request to download comments, trigger the export.
    if (window.location.hash === '#downloadcomments') {
        exportRemarksAsCsv(commentManager);
    }
}

/**
 * Generates the HTML markup for the comments section within the side panel.
 * Includes a submission form if a backend endpoint is provided.
 * @param {string | undefined} submissionEndpoint - The URL for submitting comments, or undefined if no form.
 * @returns {string} The complete HTML string for the comments interface.
 */
function buildCommentPanelMarkup(submissionEndpoint) {
    let htmlMarkup = '<h4 class="feedback-section-title">User Feedback</h4>'; // Section title for comments.
    if (submissionEndpoint) {
        htmlMarkup +=
            '<form method="post" id="feedback-submission-form" class="feedback-form">' +
            '<div id="form-error-message" class="form-feedback-message error-message"></div>' + // Area for error messages.
            '<input id="user-identifier" type="text" placeholder="Your Name" required />' + // User name input.
            '<textarea id="user-feedback-input" placeholder="Enter your comment here..." required></textarea>' + // Comment text area.
            '<button type="submit" class="submit-comment-button">Post Comment</button>' + // Submit button.
            '<span class="shift-enter-hint">Press Shift + Enter to submit</span>' + // Submission hint.
            '</form>';
    }
    htmlMarkup += '<div class="feedback-display-area"></div>'; // Container for displaying comments.
    return htmlMarkup;
}

/**
 * Initiates the download of all comments managed by the system as a CSV file.
 * This function uses a data URI, which has limitations on file size and browser compatibility.
 * @param {object} manager - The comment manager instance, providing access to comments.
 */
function exportRemarksAsCsv(manager) {
    // Delay execution slightly to ensure comments are fully loaded, if necessary.
    setTimeout(function () {
        const allRemarks = manager.get(); // Retrieve all comments from the manager.
        if (allRemarks.length === 0) {
            alert('There are no comments available to export.'); // Inform user if no data.
            return;
        }

        const csvContentLines = allRemarks.map(remarkEntry => {
            // Process each field within a remark: escape double quotes, convert HTML breaks to newlines, and enclose in quotes.
            const processedFields = remarkEntry.map(field => {
                let cleanedField = String(field).replace(/"/g, '""'); // Escape existing double quotes.
                cleanedField = cleanedField.replace(/<br\/>/g, '\n'); // Convert HTML line breaks to CSV newlines.
                return `"${cleanedField}"`; // Enclose each field in double quotes for CSV format.
            });
            return processedFields.join(','); // Join fields with a comma.
        });

        const fullCsvContent = csvContentLines.join('\n'); // Join all lines with a newline.

        // Trigger download using a data URI.
        window.location.href = "data:text/csv;charset=utf-8," + encodeURIComponent(fullCsvContent);
    }, 1000); // 1-second delay.
}

/**
 * Returns an event handler function for the comment submission form.
 * This function captures form data, performs client-side validation,
 * updates the comment manager, and sends the data to a backend endpoint.
 * @param {object} properties - Configuration properties including `commentManager`, `csv_filename`, `form_action`.
 * @returns {function(Event): void} An event handler for form submission.
 */
function handleCommentSubmission(properties) {
    const config = properties;
    return function (eventObject) {
        eventObject.preventDefault(); // Prevent default form submission.

        const $commentForm = jQuery('#feedback-submission-form');
        const $userNameInput = jQuery('#user-identifier');
        const $commentTextInput = jQuery('#user-feedback-input');
        const $formErrorMessage = jQuery('#form-error-message');

        let submissionData = {};
        let validationError = false;

        // Sanitize and encode user inputs.
        submissionData.user = encodeURIComponent($userNameInput.val().trim());
        submissionData.comment = encodeURIComponent($commentTextInput.val().trim());

        // Client-side validation: check if fields are empty.
        if (!submissionData.user || !submissionData.comment) {
            validationError = "Please make sure both your name and comment fields are filled out.";
            $commentForm.addClass('error');
        } else {
            $commentForm.removeClass('error');
        }

        // Display validation error and stop processing if an error exists.
        if (validationError) {
            $formErrorMessage.html(validationError).fadeIn(APP_SETTINGS.ANIMATION_DURATION_MS);
            return;
        } else {
            $formErrorMessage.html("").hide(); // Clear and hide any previous error messages.
        }

        // Clear input fields after successful validation.
        $userNameInput.val('');
        $commentTextInput.val('');
        $userNameInput.focus(); // Return focus to the user name field for convenience.

        // Generate current timestamp for the comment.
        const now = new Date();
        const currentMinutesPadded = String(now.getMinutes()).padStart(2, '0'); // Ensures two digits for minutes.
        submissionData.timestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${currentMinutesPadded} GMT${now.getTimezoneOffset() / 60 * -1}`;
        submissionData.page = window.location.pathname; // Record the page where the comment was submitted.
        submissionData.csv_filename = config.csv_filename; // Include the target CSV filename.

        // Add the new comment to the local manager, which also triggers its display.
        config.commentManager.add(submissionData);

        // Send the comment data to the backend asynchronously.
        jQuery.ajax({
            url: config.form_action,
            type: 'POST',
            data: submissionData
        })
            .done(function () {
                // On successful server submission, store the user's name in session storage.
                sessionStorage.setItem("user_last_comment_name", decodeURIComponent(submissionData.user));
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                // Display error message if server submission fails.
                $formErrorMessage.html(`Submission failed: ${textStatus} - ${errorThrown}`).fadeIn(APP_SETTINGS.ANIMATION_DURATION_MS);
                console.error('Comment submission failed:', textStatus, errorThrown, jqXHR);
                // Note: The comment is already displayed client-side. A robust system might
                // remove it or mark it as "pending" if server submission is critical.
            });
    };
}

/**
 * Creates and returns a comprehensive comment management object.
 * This object encapsulates the logic for loading, parsing, adding, and displaying comments,
 * maintaining an internal collection of comments within its closure.
 * @param {object} properties - Configuration properties including `csv_filename`, `form_action`, `external_comments`.
 * @returns {object} An object with methods: `load()`, `get()`, `add()`.
 */
function createCommentManager(properties) {
    let remarkCollection = []; // Private array to store all loaded and added comments.
    const config = properties;

    // Defines the mapping of comment field names to their expected column index in the CSV.
    const fieldMap = { 'comment': 0, 'user': 1, 'timestamp': 2, 'page': 3, 'spacer': 4 };

    /**
     * Processes a single column value from a CSV row, performing necessary cleaning and formatting.
     * @param {string} rawSegment - The raw string segment from the CSV.
     * @param {number} columnIndex - The index of the column.
     * @returns {string} The cleaned and formatted string.
     */
    function processColumnValue(rawSegment, columnIndex) {
        const quoteStrippingRegex = /^"|"$/g; // Regex to remove leading/trailing double quotes.
        const newlineConversionRegex = /\n/g; // Regex to find newline characters.

        let processedSegment = rawSegment.replace(quoteStrippingRegex, '');
        processedSegment = decodeURIComponent(processedSegment); // Decode URL-encoded characters.

        // If it's the comment body, convert newline characters to HTML break tags.
        if (columnIndex === fieldMap['comment']) {
            processedSegment = processedSegment.replace(newlineConversionRegex, '<br/>');
        }
        return processedSegment;
    }

    /**
     * Formats an entire row of raw CSV data by processing each column iteratively.
     * @param {Array<string>} rawRowData - An array of raw string segments representing a CSV row.
     * @returns {Array<string>} A new array containing the formatted column values.
     */
    function formatRowData(rawRowData) {
        const formattedRow = [];
        for (let i = 0; i < rawRowData.length; i++) {
            formattedRow.push(processColumnValue(rawRowData[i], i));
        }
        return formattedRow;
    }

    /**
     * Checks if a given comment row (identified by its joined string representation)
     * already exists within the `remarkCollection`.
     * @param {Array<string>} targetRow - The formatted comment row to check.
     * @returns {boolean} True if the row is found, false otherwise.
     */
    function isRemarkPresent(targetRow) {
        const targetRowString = targetRow.join(',');
        for (let i = 0; i < remarkCollection.length; i++) {
            if (remarkCollection[i].join(',') === targetRowString) {
                return true;
            }
        }
        return false;
    }

    /**
     * Parses an array of raw CSV lines, filters them by the current page,
     * and formats them into structured comment data. This is an iterative process.
     * @param {Array<string>} rawCsvLines - An array of raw string lines from a CSV file.
     * @returns {Array<Array<string>>} An array of arrays, where each inner array is a formatted comment.
     */
    function parseRawCsvData(rawCsvLines) {
        const newlyParsedComments = [];
        for (let i = 0; i < rawCsvLines.length; i++) {
            let currentLine = rawCsvLines[i];
            if (!currentLine.trim()) continue; // Skip empty or whitespace-only lines.

            // Simple CSV parsing: split by '","'. This assumes a specific CSV structure;
            // a more robust parser would be needed for complex CSVs with escaped delimiters.
            const currentRowSegments = currentLine.split('","');

            // Validate if the row has a sufficient number of columns.
            if (currentRowSegments.length <= 1) {
                continue;
            }

            const formattedRemark = formatRowData(currentRowSegments);

            // Add the comment if it's new and pertains to the current page.
            if (!isRemarkPresent(formattedRemark) && formattedRemark[fieldMap['page']] === window.location.pathname) {
                newlyParsedComments.push(formattedRemark);
            }
        }
        return newlyParsedComments;
    }

    /**
     * Constructs jQuery DOM elements for a given list of formatted comments.
     * @param {Array<Array<string>>} commentsToBuild - An array of formatted comment arrays.
     * @returns {Array<jQuery>} An array of jQuery-wrapped `div` elements, ready for display.
     */
    function constructCommentDisplayElements(commentsToBuild) {
        const generatedElements = [];
        for (let i = 0; i < commentsToBuild.length; i++) {
            const currentRemark = commentsToBuild[i];
            const $commentElement = jQuery('<div></div>');
            $commentElement.addClass('new-feedback-item'); // Class for styling new comments.
            $commentElement.html(
                '<span class="feedback-content">' + currentRemark[fieldMap['comment']] + '</span>' +
                '<span class="feedback-author">' + currentRemark[fieldMap['user']] + '</span>' +
                '<span class="feedback-time">' + currentRemark[fieldMap['timestamp']] + '</span>'
            );
            generatedElements.push($commentElement);
        }
        return generatedElements;
    }

    /**
     * Reveals the constructed comment elements in the DOM sequentially with a fade-in animation.
     * Newest comments are prepended to appear at the top.
     * @param {Array<jQuery>} elementsToDisplay - An array of jQuery-wrapped comment elements.
     */
    function revealCommentElementsSequentially(elementsToDisplay) {
        const $feedbackDisplayArea = jQuery('.feedback-display-area');
        // Iterate in reverse to prepend elements, ensuring newest comments are at the top.
        for (let i = elementsToDisplay.length - 1; i >= 0; i--) {
            elementsToDisplay[i].hide().prependTo($feedbackDisplayArea).fadeIn(APP_SETTINGS.ANIMATION_DURATION_MS);
        }
    }

    /**
     * Orchestrates the process of rendering new comments to the DOM.
     * @param {Array<Array<string>>} commentsForRendering - Formatted comment rows ready for display.
     */
    function renderNewRemarks(commentsForRendering) {
        if (commentsForRendering.length === 0) return; // Guard clause for no comments.

        const displayElements = constructCommentDisplayElements(commentsForRendering);
        revealCommentElementsSequentially(displayElements);
    }

    /**
     * The primary function to process raw CSV content, extract new comments,
     * and trigger their display on the page.
     * @param {string} rawCsvText - The raw string content of the CSV file.
     */
    function displayCommentsFromCsv(rawCsvText) {
        // Split CSV by lines and filter out any empty lines.
        const lines = rawCsvText.split("\n").filter(line => line.trim() !== '');

        const remarksToDisplay = parseRawCsvData(lines);
        renderNewRemarks(remarksToDisplay);

        // Add the newly displayed comments to the internal collection.
        remarkCollection = remarkCollection.concat(remarksToDisplay);
    }

    // Public API for the comment manager.
    return {
        /**
         * Loads comments from the configured CSV file via an AJAX request.
         * On success, it processes and displays any new comments.
         */
        load: function updateCommentFeed() {
            if (!config.csv_filename) {
                // If no CSV filename is provided, loading from file is not possible.
                return;
            }
            jQuery.ajax({
                'url': config.csv_filename,
                'contentType': 'text/csv',
                'cache': false // Disable caching to always get the latest comments.
            })
                .done(displayCommentsFromCsv)
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.warn(`Failed to retrieve comments from ${config.csv_filename}: ${textStatus} - ${errorThrown}`);
                    // Optionally, provide user feedback in the UI here.
                });
        },

        /**
         * Retrieves the complete collection of comments currently managed.
         * @returns {Array<Array<string>>} An array of formatted comment arrays.
         */
        get: function retrieveAllComments() {
            return remarkCollection;
        },

        /**
         * Adds a new comment to the internal collection and immediately displays it on the page.
         * @param {object} commentData - An object containing `user`, `comment`, `timestamp`, and `page` properties.
         */
        add: function addNewComment(commentData) {
            const newCommentFormatted = [
                commentData.comment,
                commentData.user,
                commentData.timestamp,
                commentData.page
            ];
            // Add to the internal collection first.
            remarkCollection.push(newCommentFormatted);
            // Format and render the single new comment.
            renderNewRemarks([formatRowData(newCommentFormatted)]);
        }
    };
}