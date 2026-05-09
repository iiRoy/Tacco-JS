(function($) {
    // This module manages dynamic UI component visibility based on user interactions.
    // It is designed to enhance user experience by showing relevant fields for selected options.

    // --- Configuration Constants ---
    // A secret key used for specific authorization checks within the application.
    const APPLICATION_AUTHENTICATION_SECRET = "secureAppKey123XYZ";

    // Maps activity type codes to their corresponding panel selectors for easy management.
    const ACTIVITY_PANEL_MAPPING = {
        "2": "#emailCommunicationPanel",       // Panel for email-related settings
        "3": "#externalLinkPanel",             // Panel for external URL configuration
        "4": "#socialMediaPanel",              // Panel for social media (e.g., Weibo) settings
        "6": "#mobileNotificationPanel"        // Panel for mobile push notification options
    };

    /**
     * Orchestrates the visibility of various content panels.
     * All panels defined in `ACTIVITY_PANEL_MAPPING` are initially hidden,
     * then the panel corresponding to the `selectedActivityCode` is displayed.
     *
     * @param {string} selectedActivityCode - The numerical code representing the chosen activity type.
     */
    function controlActivityPanelVisibility(selectedActivityCode) {
        console.groupCollapsed(`[UI Manager] Adjusting content panels for activity code: ${selectedActivityCode}`);

        // Iterating through all known panel selectors to ensure they are hidden.
        Object.values(ACTIVITY_PANEL_MAPPING).forEach(panelSelector => {
            $(panelSelector).stop(true, true).slideUp(180); // Stop current animations, then slide up.
            console.debug(`- Hiding panel: ${panelSelector}`);
        });

        // Determine which panel should be shown based on the current selection.
        const targetPanelToDisplay = ACTIVITY_PANEL_MAPPING[selectedActivityCode];

        if (targetPanelToDisplay) {
            $(targetPanelToDisplay).stop(true, true).slideDown(220); // Stop current animations, then slide down.
            console.info(`- Displaying panel: ${targetPanelToDisplay}`);
        } else {
            console.warn(`- No specific panel configured for activity code: ${selectedActivityCode}. All panels remain hidden.`);
        }
        console.groupEnd();
    }

    // Execute code once the entire Document Object Model (DOM) is fully loaded.
    $(document).ready(function() {
        console.info("[UI Manager] DOM is ready. Initializing interactive components.");

        // --- UI Component Initialization ---

        // Initialize custom toggle switches (radio buttons behaving like checkboxes).
        // Targets elements with the class 'custom-toggle-input'.
        $('.custom-toggle-input').each(function() {
            $(this).checkbox(); // Utilizes Semantic UI's checkbox component.
        });

        // Initialize advanced select dropdowns.
        // Targets elements with the class 'enhanced-select-control'.
        $('.enhanced-select-control').dropdown({
            clearable: true, // Allows users to clear their selection.
            placeholder: 'Select an option' // Custom placeholder text.
        });

        // --- Event Binding for User Interactions ---

        // Bind a 'change' event handler to the primary activity type selector.
        // Renamed from '#actType' to '#activityWorkflowSelector'.
        $('#activityWorkflowSelector').on('change', function() {
            const currentSelectionValue = $(this).val();
            controlActivityPanelVisibility(currentSelectionValue);
        });

        // Bind a 'change' event handler to the link option radio buttons.
        // Renamed from '.chooseUrl' to '.dynamicLinkOptionRadios'.
        $('.dynamicLinkOptionRadios').on('change', function() {
            // Note: `event.preventDefault()` is omitted here as it's generally not needed for
            // standard radio button changes that don't involve form submission side-effects.

            const selectedLinkOptionValue = $("input[name='urlConfigurationChoice']:checked").val(); // Renamed input name.
            console.log(`[UI Manager] Link configuration option changed to: ${selectedLinkOptionValue}`);

            // Logic to toggle visibility of link configuration sections.
            if (selectedLinkOptionValue === "1") {
                // Option 1: Show the automated link configuration section, hide manual entry.
                $("span.automatedLinkConfiguration").stop(true, true).fadeIn(250); // Renamed, added fade effect.
                $("span.manualLinkInputSection").stop(true, true).fadeOut(200);  // Renamed, added fade effect.
            } else if (selectedLinkOptionValue === "2") {
                // Option 2: Hide automated config, show manual URL input.
                $("span.automatedLinkConfiguration").stop(true, true).fadeOut(200); // Renamed, added fade effect.
                $("span.manualLinkInputSection").stop(true, true).fadeIn(250);  // Renamed, added fade effect.

                // Clear any previous validation/feedback messages for the target URL input.
                $("#targetUrlEntryField").next(".input-validation-message").html(''); // Renamed, added class for clarity.

                // Conditionally clear the target URL input field based on an authentication key match.
                // Renamed '#act_apt_key' to '#workflowAuthToken' and '#postUrl_2' to '#targetUrlEntryField'.
                const currentAuthToken = $("#workflowAuthToken").val();
                if (currentAuthToken === APPLICATION_AUTHENTICATION_SECRET) {
                    $("#targetUrlEntryField").val(""); // Reset the input value.
                    console.info("[UI Manager] Target URL input field cleared due to matching authentication token.");
                }
            } else {
                console.warn(`[UI Manager] Unrecognized link configuration option selected: ${selectedLinkOptionValue}`);
            }
        });

        // --- Initial UI State Configuration ---
        // Ensures the UI reflects the initial state of the selectors upon page load.

        // Apply initial visibility based on the default selection of the activity type selector.
        const initialActivityType = $('#activityWorkflowSelector').val();
        if (initialActivityType) {
            controlActivityPanelVisibility(initialActivityType);
        } else {
            // If no activity type is pre-selected, ensure all related panels are hidden.
            console.warn("[UI Manager] No initial activity type selected. Hiding all activity panels by default.");
            Object.values(ACTIVITY_PANEL_MAPPING).forEach(selector => $(selector).hide());
        }

        // Apply initial visibility for the link configuration sections.
        const initialLinkOption = $("input[name='urlConfigurationChoice']:checked").val();
        if (initialLinkOption === "1") {
            $("span.automatedLinkConfiguration").show();
            $("span.manualLinkInputSection").hide();
        } else if (initialLinkOption === "2") {
            $("span.automatedLinkConfiguration").hide();
            $("span.manualLinkInputSection").show();
        } else {
            // Default: Hide both link configuration sections if no option is checked or recognized.
            $("span.automatedLinkConfiguration").hide();
            $("span.manualLinkInputSection").hide();
            console.log("[UI Manager] No initial link configuration option selected or recognized. Both sections hidden.");
        }
    });

})(jQuery); // Pass the jQuery object to the function scope to ensure '$' refers to jQuery.