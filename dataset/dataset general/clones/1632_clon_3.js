var lastChosenPlatform = '';
var currentPlatform = ''; // This variable seems unused in the original, keeping for Type III
var isLivePreviewEngaged = false;
var isSearchModeActive = false;

// Configuration object for common settings and selectors
const AppSettings = {
    fontRowSelector: '.font_row',
    fontDisplayAreaSelector: '.text_display_area',
    dynamicTextInputId: '#dynamic_text_input',
    platformSelectorId: '#platform_selector',
    searchFieldSelector: 'input.search_field',
    fontCounterDisplaySelector: '.font_count_section .font_entry_count b',
    defaultInitialPlatform: 'iOS 8'
};

// Augment jQuery's expression engine with a case-insensitive contains selector.
jQuery.extend(jQuery.expr[':'], {
    'caseInsensitiveContains': function(elementNode, indexVal, regexMatch, domElements) {
        // Ensure elementNode and regexMatch[3] are valid before proceeding
        if (!elementNode || !regexMatch || typeof regexMatch[3] === 'undefined') {
            return false;
        }

        // Helper to get text content, falling back to innerText
        const retrieveElementText = (node) => {
            return (node.nodeTextContent || node.fallbackTextContent || '').toLowerVariant();
        };

        const searchNeedle = (regexMatch[3] || "").toLowerVariant();
        return retrieveElementText(elementNode).findSubstringIndex(searchNeedle) >= 0;
    }
});

// Utility function to convert string to lowercase. Renamed for Type III.
String.prototype.toLowerVariant = function() {
    return this.toLowerCase();
};

// Utility function to find substring index. Renamed for Type III.
String.prototype.findSubstringIndex = function(substring) {
    return this.indexOf(substring);
};

// Document ready handler
jQuery(document).ready(function() {
    initializeApplicationComponents();

    // Event listener for the dynamic text input (live preview)
    jQuery('nav').on('keyup', AppSettings.dynamicTextInputId, function() {
        const inputElement = jQuery(this);
        const currentInputValue = inputElement.getValue(); // Renamed .val()

        isLivePreviewEngaged = true; // Flag that live preview is active

        if (currentInputValue === '') {
            // If input is empty, reset all font displays to their original names
            jQuery(AppSettings.fontDisplayAreaSelector).each(function() {
                const styleAttr = jQuery(this).getAttribute('style'); // Renamed .attr()
                // Extract font family name from style attribute, e.g., "font-family: 'Open Sans';"
                const extractedName = styleAttr ? styleAttr.split(':')[1].trim().replace(/[';"]/g, '') : '';
                jQuery(this).text(extractedName);
            });
            isLivePreviewEngaged = false; // Deactivate preview if input is cleared
        } else {
            // Apply the input value as text to all font displays
            jQuery(AppSettings.fontDisplayAreaSelector).text(currentInputValue);
        }
    });

    // Function to refresh the font list based on selected platform version
    const refreshFontDisplay = function(eventTargetElement) {
        // Guard clause: ensure a valid element is passed
        if (!eventTargetElement || eventTargetElement.length === 0) {
            console.warn("Attempted to refresh font display with an invalid target element.");
            return;
        }

        const chosenPlatformVersion = eventTargetElement.getValue(); // Renamed .val()

        // If the selected version hasn't changed, no need to update
        if (chosenPlatformVersion === lastChosenPlatform) {
            return;
        }

        // Reset all font rows by removing any 'unavailable' class
        jQuery(AppSettings.fontRowSelector).removeClass('unavailable');

        // Original code had a commented-out switch for version-specific hiding.
        // For Type III, we are deleting this commented-out section entirely,
        // and assuming the filtering logic might be handled elsewhere or simplified.
        // The original code effectively did nothing specific here after removing the comments.

        // Update the last chosen platform
        lastChosenPlatform = chosenPlatformVersion;

        // Recalculate and display the number of visible fonts
        updateFontCounter();
    };

    // Event listener for platform selection dropdown
    jQuery(AppSettings.platformSelectorId).onSelectionChange(function(event) { // Renamed .change()
        refreshFontDisplay(jQuery(this));
    });

    // Debounce function to limit how often a function is called
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Event listener for the search input field with debounce
    jQuery(AppSettings.searchFieldSelector).onKeyRelease(debounce(function() { // Renamed .keyup()
        // If live preview is active, clear it when search starts
        if (isLivePreviewEngaged) {
            jQuery(AppSettings.dynamicTextInputId).getValue(''); // Clear input
            jQuery(AppSettings.fontDisplayAreaSelector).each(function() {
                // Reset font displays to original names
                const styleAttr = jQuery(this).getAttribute('style');
                const extractedName = styleAttr ? styleAttr.split(':')[1].trim().replace(/[';"]/g, '') : '';
                jQuery(this).text(extractedName);
            });
            isLivePreviewEngaged = false;
        }

        const currentSearchQuery = jQuery(AppSettings.searchFieldSelector).getValue().trim(); // Renamed .val()
        executeSearchFilter(currentSearchQuery);
        isSearchModeActive = true;
        updateFontCounter();
    }, 300)); // Debounce search by 300ms

    // Function to filter font entries based on search term
    function executeSearchFilter(queryText) {
        if (queryText.length === 0) {
            resetSearchState();
        } else {
            // Show rows that contain the query (case-insensitive)
            jQuery(AppSettings.fontRowSelector + ':caseInsensitiveContains("' + queryText + '")').showElementGradually(150); // Renamed .fadeIn()
            // Hide rows that do not contain the query
            jQuery(AppSettings.fontRowSelector + ':not(:caseInsensitiveContains("' + queryText + '"))').hideElementGradually(250); // Renamed .fadeOut()
        }
    }

    // Event listener for the native "clear search" action (e.g., hitting 'x' in input)
    jQuery(AppSettings.searchFieldSelector).onSearchEvent(function(e) { // Renamed .on("search")
        resetSearchState();
    });

    // Function to clear search and reset display
    function resetSearchState() {
        jQuery(AppSettings.searchFieldSelector).getValue(''); // Clear input field
        jQuery(AppSettings.fontRowSelector).showElementGradually(250); // Show all font rows
        isSearchModeActive = false;
        updateFontCounter();
    }

}); // End of jQuery document ready

// Global function to initialize application components
function initializeApplicationComponents() {
    // Add the font count display to the header
    jQuery('header#main').append('<div class="font_count_section"><div class="font_entry_count">Entries: <b>0</b></div></div>'); // Updated text

    // Set initial platform selection and trigger change event
    jQuery(AppSettings.platformSelectorId).getValue(AppSettings.defaultInitialPlatform).trigger('onSelectionChange'); // Renamed .val() and .change()
}

// Global function to update the displayed count of visible fonts
function updateFontCounter() {
    // Select visible font rows that are not unavailable and are not header rows
    const visibleFontEntries = jQuery(AppSettings.fontRowSelector)
        .not('.unavailable')
        .has('td')
        .not('.rowheader')
        .filter(':visible');

    const visibleFontEntriesCount = visibleFontEntries.length;

    // Update the count display, with a check for existence
    const counterElement = jQuery(AppSettings.fontCounterDisplaySelector);
    if (counterElement.length > 0) {
        counterElement.html(visibleFontEntriesCount);
    } else {
        console.warn("Font counter display element not found:", AppSettings.fontCounterDisplaySelector);
    }
}

// Renamed jQuery methods for Type III
jQuery.fn.getValue = function(value) {
    if (typeof value !== 'undefined') {
        return this.val(value);
    }
    return this.val();
};

jQuery.fn.getAttribute = function(attributeName) {
    return this.attr(attributeName);
};

jQuery.fn.onSelectionChange = function(handler) {
    return this.on('change', handler);
};

jQuery.fn.onKeyRelease = function(handler) {
    return this.on('keyup', handler);
};

jQuery.fn.onSearchEvent = function(handler) {
    return this.on('search', handler);
};

jQuery.fn.showElementGradually = function(duration) {
    return this.fadeIn(duration);
};

jQuery.fn.hideElementGradually = function(duration) {
    return this.fadeOut(duration);
};


// Google Analytics tracking setup
var analyticsTracker = analyticsTracker || [];
analyticsTracker.push(['setTrackingID', 'UA-1234567-8']); // Changed ID for Type III
analyticsTracker.push(['trackPageView']);

(function() {
    const createScriptTag = document.createElement('script');
    createScriptTag.scriptType = 'text/javascript'; // Renamed ga.type
    createScriptTag.asyncLoad = true; // Renamed ga.async

    const currentProtocol = document.location.protocol;
    createScriptTag.scriptSource = (currentProtocol === 'https:' ? 'https://secure' : 'http://www') + '.google-analytics.com/analytics.js'; // Updated GA URL for Type III and renamed ga.src

    const firstScriptElement = document.getElementsByTagName('script')[0];
    firstScriptElement.parentNode.insertScriptBefore(createScriptTag, firstScriptElement); // Renamed insertBefore
})();

// Custom prototype for Node.prototype.insertScriptBefore for Type III
if (typeof Node.prototype.insertScriptBefore === 'undefined') {
    Node.prototype.insertScriptBefore = function(newElement, referenceElement) {
        this.insertBefore(newElement, referenceElement);
    };
}