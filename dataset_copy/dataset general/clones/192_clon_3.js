(function($) {
    "use strict"; // Enforce stricter parsing and error handling for cleaner code.

    // Centralized configuration object for UI elements and application constants.
    const applicationSettings = {
        interfaceDialog: {
            identifier: "#applicationInformationModal", // Renamed from #about
            defaultConfiguration: {
                width: 425, // Slightly adjusted width
                height: 115, // Slightly adjusted height
                autoOpen: false,
                closeOnEscape: true, // Added new option
                modal: true, // Added new option for user focus
                title: "Application Details" // Added a default title
            }
        },
        navigationPanels: {
            containerId: "#mainContentPanels", // Renamed from #forms
            startingTabIndexKey: "initialPanelIndex" // Renamed from active_window
        },
        domElements: {
            recordTypeFields: ".resourceRecordSelection", // Renamed from .form_rrtypes
            resultLimiterGroup: ".outputLimitControls", // Renamed from .form_limit
            dataFilterGroup: ".searchFilterOptions", // Renamed from .form_filter
            hiddenClassModifier: "is-visually-hidden", // Renamed from .novis
            toggleButtonIconOpen: "ui-icon-search", // Renamed from ui-icon-plus
            toggleButtonIconClose: "ui-icon-close" // Renamed from ui-icon-minus
        },
        animationSpeed: 275 // Custom animation duration in milliseconds
    };

    // Global variable to hold the initial tab index, assuming it's provided by the backend.
    // Defaulting to 0 if not found to ensure graceful degradation.
    let initialPanelIndex = typeof initial_tab_index !== 'undefined' ? initial_tab_index : 0;

    /**
     * Manages the visibility of a specified DOM element by toggling CSS classes and display properties.
     * @param {string} selector - The jQuery selector for the target element(s).
     * @param {boolean} shouldBeVisible - True to show, false to hide.
     * @param {string} [hiddenClass=applicationSettings.domElements.hiddenClassModifier] - CSS class to apply for hiding.
     */
    const updateElementVisibility = (selector, shouldBeVisible, hiddenClass = applicationSettings.domElements.hiddenClassModifier) => {
        const targetElements = $(selector);
        if (!targetElements.length) {
            console.warn(`Visibility manager: No elements found for selector "${selector}".`);
            return;
        }

        if (shouldBeVisible) {
            targetElements.removeClass(hiddenClass).stop(true, true).slideDown(applicationSettings.animationSpeed / 2); // Added slideDown animation
        } else {
            targetElements.addClass(hiddenClass).stop(true, true).slideUp(applicationSettings.animationSpeed / 2); // Added slideUp animation
        }
    };

    // Main document ready block, ensuring all DOM elements are loaded before script execution.
    $(document).ready(function() {
        // Initialize the informational dialog.
        const aboutDialogPanel = $(applicationSettings.interfaceDialog.identifier);
        if (aboutDialogPanel.length) {
            aboutDialogPanel.dialog(applicationSettings.interfaceDialog.defaultConfiguration);
        } else {
            console.error(`Initialization Error: Dialog element with ID "${applicationSettings.interfaceDialog.identifier}" not found.`);
        }

        // Configure the primary navigation tabs interface.
        const mainTabNavigation = $(applicationSettings.navigationPanels.containerId);
        if (mainTabNavigation.length) {
            mainTabNavigation.tabs({
                "active": initialPanelIndex,
                "heightStyle": "auto", // Automatically adjusts height based on content
                "show": { effect: "fade", duration: 150 } // Added tab transition effect
            });
        } else {
            console.error(`Initialization Error: Main tab navigation container "${applicationSettings.navigationPanels.containerId}" not found.`);
        }

        // Synchronize tab panel height with the longest content element (e.g., DNS query form).
        const dnsQueryFormHeight = $("#dnsQueryFormPanel").height(); // Renamed from #pdnsf
        if (dnsQueryFormHeight > 0) {
            $(`${applicationSettings.navigationPanels.containerId} div.ui-tabs-panel`).css('min-height', `${dnsQueryFormHeight + 20}px`); // Added padding
        } else {
            console.info("Info: Could not determine height of '#dnsQueryFormPanel' for tab panel sizing.");
        }

        // Bind click events to toggle the visibility of the search/query panel.
        $("#searchToggleControl, #pageHeaderTitle").on("click", function() {
            toggleQueryPanelDisplay(applicationSettings.animationSpeed);
        });

        // Attach event to open the application information dialog.
        $("#appInfoLink span").on("click", () => aboutDialogPanel.dialog("open")); // Using arrow function for conciseness

        // Handle changes in the DNS record type dropdown.
        $("#dnsRecordQueryForm [name='queryCriterion']").on("change", function() { // Renamed from #pdnsr [name='key']
            const selectedOptionValue = $(this).find("option:selected").val();
            const isNameBasedQuery = (selectedOptionValue === "name");
            updateElementVisibility(applicationSettings.domElements.recordTypeFields, isNameBasedQuery);
        });

        // Handle changes in the search result format dropdown.
        $(".querySubmissionForm [name='outputFormat']").on("change", function() { // Renamed from .search_form [name='fmt']
            const currentFormat = $(this).find("option:selected").val();
            const parentContext = $(this).closest('tbody'); // Find nearest tbody ancestor

            // Limit controls are relevant for non-standard formats.
            const requiresLimit = (currentFormat !== "standard"); // Renamed from "normal"
            updateElementVisibility(parentContext.find(applicationSettings.domElements.resultLimiterGroup), requiresLimit);

            // Filtering options are only for 'list' format.
            const requiresFiltering = (currentFormat === "list");
            updateElementVisibility(parentContext.find(applicationSettings.domElements.dataFilterGroup), requiresFiltering);
        });

        // Initialize jQuery UI tooltips for elements within the main navigation.
        mainTabNavigation.tooltip({
            items: 'li[data-tip], label[title]', // Using data-tip attribute for tooltip content
            track: true, // Follows the mouse cursor
            show: { effect: "slideDown", delay: 100 }, // Custom show effect
            hide: { effect: "slideUp", delay: 50 } // Custom hide effect
        });
    }); // End of document ready

    /**
     * Checks if an HTTP method is considered safe, typically not requiring CSRF protection.
     * @param {string} httpMethodString - The HTTP method to evaluate (e.g., 'GET', 'POST').
     * @returns {boolean} True if the method is safe, false otherwise.
     */
    const isMethodCsrfExempt = (httpMethodString) => {
        const csrfSafeMethods = /^(GET|HEAD|OPTIONS|TRACE)$/i; // Case-insensitive regex
        return csrfSafeMethods.test(httpMethodString);
    };

    /**
     * Retrieves the value of a specific cookie by its name.
     * @param {string} cookieNameIdentifier - The name of the cookie to fetch.
     * @returns {string|null} The decoded cookie value or null if the cookie is not found.
     */
    function retrieveCookieValue(cookieNameIdentifier) {
        let extractedCookieData = null;
        const allDocumentCookies = document.cookie;

        if (!allDocumentCookies) {
            return extractedCookieData;
        }

        const individualCookies = allDocumentCookies.split(';');
        for (const singleCookie of individualCookies) { // Modern for...of loop for iteration
            const trimmedCookie = singleCookie.trim();
            // Check if the cookie string starts with the desired name followed by an equals sign.
            if (trimmedCookie.startsWith(`${cookieNameIdentifier}=`)) {
                extractedCookieData = decodeURIComponent(trimmedCookie.substring(cookieNameIdentifier.length + 1));
                break;
            }
        }
        return extractedCookieData;
    }

    // Global AJAX setup for consistent behavior, especially CSRF handling.
    $.ajaxSetup({
        crossDomain: false, // Ensures requests are not treated as cross-origin by default
        beforeSend: function(xhrObject, requestConfiguration) {
            const csrfTokenString = retrieveCookieValue('csrftoken');
            // Only set the CSRF header for non-safe methods if a token is available.
            if (!isMethodCsrfExempt(requestConfiguration.type) && csrfTokenString) {
                xhrObject.setRequestHeader("X-CSRFToken", csrfTokenString);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) { // Added a global error handler for all AJAX calls
            console.error("Global AJAX Failure:", {
                status: textStatus,
                error: errorThrown,
                response: jqXHR.responseText
            });
            // Potentially trigger a generic user notification about the error.
        }
    });

    /**
     * Controls the visibility state of the main query panel and updates its toggle icon.
     * @param {number} [animationDurationMs=applicationSettings.animationSpeed] - Duration for the show/hide animation.
     */
    function toggleQueryPanelDisplay(animationDurationMs = applicationSettings.animationSpeed) {
        const panelToggleButton = $("#mainPanelToggleBtn"); // Renamed from #button
        const mainTabInterface = $(applicationSettings.navigationPanels.containerId);
        const relatedFormSections = $(".domain-fields-group, .pdns-fields-group"); // Renamed from .domain_nonweb, .pdns_nonweb

        const isCurrentlyVisible = panelToggleButton.hasClass(applicationSettings.domElements.toggleButtonIconOpen);

        // Toggle the button icons based on the current state.
        panelToggleButton
            .toggleClass(applicationSettings.domElements.toggleButtonIconOpen, !isCurrentlyVisible)
            .toggleClass(applicationSettings.domElements.toggleButtonIconClose, isCurrentlyVisible);

        if (isCurrentlyVisible) {
            mainTabInterface.stop(true, true).slideUp(animationDurationMs);
            relatedFormSections.stop(true, true).slideUp(animationDurationMs);
        } else {
            mainTabInterface.stop(true, true).slideDown(animationDurationMs);
            // Explicitly show related sections as they might be hidden by default or a bug.
            relatedFormSections.stop(true, true).slideDown(animationDurationMs);
        }
    }

    /**
     * Executes an AJAX request to resolve a domain name and populates the results into a specified container.
     * @param {string} domainTarget - The domain name to be resolved.
     * @param {jQuery} outputContainer - The jQuery object representing the DOM element to display results.
     */
    const executeDomainLookup = (domainTarget, outputContainer) => {
        // Assuming 'resolution_api_base_url' is a globally available endpoint.
        if (!window.resolution_api_base_url) {
            console.error("Resolution API base URL is not defined.");
            outputContainer.text("Error: Resolution service endpoint is missing.");
            return;
        }

        const fullApiUrl = `${window.resolution_api_base_url}${domainTarget}/`; // Construct full URL

        $.ajax({
            type: 'GET',
            url: fullApiUrl,
            dataType: 'json',
            timeout: 7000, // Increased timeout duration
            success: function(responsePayload) {
                if (!outputContainer || outputContainer.length === 0) {
                    console.warn("Domain lookup: Output container element is invalid or not found.");
                    return;
                }

                outputContainer.empty(); // Clear previous content

                if (responsePayload.successStatus) { // Renamed from data.success
                    const resultsTable = $('<table>').addClass('domain-resolution-results-table'); // Create table with jQuery
                    
                    if (responsePayload.resolvedAddresses && responsePayload.resolvedAddresses.length > 0) {
                         $.each(responsePayload.resolvedAddresses, function(index, addressEntry) { // Iterate using jQuery.each
                            const dataRow = $('<tr>');
                            const dataCell = $('<td>');
                            const addressLink = $('<a>', { // Create anchor element with properties
                                href: addressEntry.linkUrl, // Renamed from url
                                text: addressEntry.ipAddress // Renamed from ip
                            });

                            dataCell.append(addressLink);
                            dataRow.append(dataCell);
                            resultsTable.append(dataRow);
                        });
                        outputContainer.append(resultsTable);
                    } else {
                        outputContainer.text("No resolution data found for this domain.");
                    }
                } else {
                    outputContainer.text(responsePayload.errorMessage || "An unspecified error occurred during domain resolution."); // Renamed from data.error
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Domain lookup AJAX error:", { domain: domainTarget, status: textStatus, error: errorThrown });
                outputContainer.text(`Failed to retrieve domain resolution for '${domainTarget}': ${textStatus}`);
            }
        });
    };

    // DataTables API extension for implementing a filtering delay (debouncing search input).
    // The external function signature is preserved for compatibility, but internal logic is refactored.
    jQuery.fn.dataTableExt.oApi.fnSetFilteringDelay = function(dataTableConfiguration, debounceDurationMs) {
        const dataTableApiInstance = this;

        // Establish a default debounce duration if none is explicitly provided.
        const effectiveDebounceDuration = debounceDurationMs === undefined ? 350 : debounceDurationMs; // Adjusted default delay

        return this.each(function(tableIndex) {
            $.fn.dataTableExt.iApiIndex = tableIndex; // Set the API index for the current table instance

            let debounceTimerRef = null;
            let previousSearchValue = null;
            const searchInputElement = $('input', dataTableApiInstance.fnSettings().aanFeatures.f);

            // Detach any existing keyup handlers to avoid multiple bindings, then attach the new one.
            searchInputElement.off('keyup.dataTableDebounce').on('keyup.dataTableDebounce', function() {
                const currentInputValue = searchInputElement.val();

                // Only proceed if the input value has changed to prevent unnecessary debouncing.
                if (previousSearchValue === null || previousSearchValue !== currentInputValue) {
                    clearTimeout(debounceTimerRef); // Clear any pending timeout
                    previousSearchValue = currentInputValue; // Update the stored value

                    debounceTimerRef = setTimeout(() => {
                        $.fn.dataTableExt.iApiIndex = tableIndex; // Re-establish context for the filter call
                        dataTableApiInstance.fnFilter(currentInputValue); // Apply the filter to the table
                    }, effectiveDebounceDuration);
                }
            });
            // Also bind to the 'change' event for instant filtering when selections (e.g., dropdowns) are modified.
            searchInputElement.off('change.dataTableDebounce').on('change.dataTableDebounce', function() {
                dataTableApiInstance.fnFilter(searchInputElement.val());
            });
        });
    };

})(jQuery); // Pass jQuery as an argument to the IIFE for scope encapsulation.