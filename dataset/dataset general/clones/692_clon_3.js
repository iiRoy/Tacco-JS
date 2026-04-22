(function(jq) {
    // This module manages dynamic viewport settings based on user preferences.
    // It allows switching between a fixed desktop layout and a flexible mobile-optimized view.

    // --- Core Configuration and Elements ---
    const displayConfig = {
        // Desired width for the fixed desktop layout, in pixels.
        fixedDesktopWidthPx: 980,

        // Key used in browser's local storage to save the user's view preference.
        activeViewPreferenceStorageKey: 'responsiveLayoutEnabled',

        // Key used in local storage to backup the original viewport meta content.
        originalViewportBackupKey: 'initialViewportConfiguration',

        // ID for the button/link that triggers the desktop view.
        desktopViewSwitchId: 'switch-to-full-site',

        // ID for the button/link that restores the mobile-optimized view.
        mobileViewRestoreId: 'revert-to-mobile',

        // Class for the container element holding the view switching controls.
        controlsContainerClass: 'layout-control-panel',

        // Text displayed on the button to restore mobile view.
        mobileRestoreButtonText: 'View Optimized for Mobile',

        // Fallback viewport content if original is not found in storage.
        defaultMobileViewportContent: 'width=device-width, initial-scale=1'
    };

    // Reference to the viewport meta tag. This is critical for functionality.
    let viewportElement = jq('meta[name="viewport"]');

    // Early exit if the viewport meta tag is not found, as the script cannot function.
    if (!viewportElement.length) {
        console.error('CRITICAL ERROR: Viewport meta tag not found. Viewport management script cannot proceed.');
        return;
    }

    // --- Local Storage Abstraction Layer ---
    // Provides a safer and more consistent way to interact with localStorage.
    const persistentStorage = {
        // Checks if localStorage is generally supported and accessible.
        checkSupport: () => {
            const testKey = '__ls_test_item__';
            try {
                localStorage.setItem(testKey, testKey);
                localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        },

        // Retrieves a value from localStorage. Returns null if not found or error.
        retrieveValue: (keyIdentifier) => {
            if (!persistentStorage.checkSupport()) {
                console.warn('LocalStorage not available; cannot retrieve value for:', keyIdentifier);
                return null;
            }
            try {
                return localStorage.getItem(keyIdentifier);
            } catch (e) {
                console.error('Error reading from localStorage for key:', keyIdentifier, e);
                return null;
            }
        },

        // Stores a value in localStorage. Returns true on success, false on failure.
        storeValue: (keyIdentifier, dataValue) => {
            if (!persistentStorage.checkSupport()) {
                console.warn('LocalStorage not available; cannot store value for:', keyIdentifier);
                return false;
            }
            try {
                localStorage.setItem(keyIdentifier, dataValue);
                return true;
            } catch (e) {
                console.error('Error writing to localStorage for key:', keyIdentifier, e);
                return false;
            }
        }
    };

    // Initialize the responsive view preference in local storage if it's not already set.
    // Default to 'true' (mobile-optimized) if no preference is found.
    if (persistentStorage.retrieveValue(displayConfig.activeViewPreferenceStorageKey) === null) {
        persistentStorage.storeValue(displayConfig.activeViewPreferenceStorageKey, 'true');
    }

    // --- Viewport Manipulation Functions ---

    /**
     * Transitions the viewport to a fixed desktop layout.
     * This involves saving the current viewport state and applying a new fixed width.
     */
    const setFixedDesktopLayout = function() {
        const currentViewportString = viewportElement.attr('content');
        persistentStorage.storeValue(displayConfig.originalViewportBackupKey, currentViewportString);

        // Construct the new viewport content using template literals for clarity.
        const newFixedContent = `width=${displayConfig.fixedDesktopWidthPx}, initial-scale=1, user-scalable=yes`;
        viewportElement.attr('content', newFixedContent);

        // Dynamically manage the 'Return to Mobile View' button within its container.
        const $controlPanel = jq(`.${displayConfig.controlsContainerClass}`);
        if ($controlPanel.length) {
            let $mobileRestoreButton = $controlPanel.find(`#${displayConfig.mobileViewRestoreId}`);
            if (!$mobileRestoreButton.length) {
                // If the button doesn't exist, create it as a <button> element and prepend it.
                const restoreButtonHtml = `<button type="button" id="${displayConfig.mobileViewRestoreId}" class="view-switcher-button">${displayConfig.mobileRestoreButtonText}</button>`;
                $controlPanel.prepend(restoreButtonHtml);
            } else {
                // If it exists, ensure its text and type are correct.
                $mobileRestoreButton.text(displayConfig.mobileRestoreButtonText);
                $mobileRestoreButton.attr('type', 'button');
            }
        }

        // Update local storage to reflect the desktop view preference.
        persistentStorage.storeValue(displayConfig.activeViewPreferenceStorageKey, 'false');
    };

    /**
     * Reverts the viewport to its original or default mobile-optimized state.
     * It attempts to use a stored backup, falling back to a standard mobile setting.
     */
    const revertToMobileOptimizedLayout = function() {
        const storedBackupViewport = persistentStorage.retrieveValue(displayConfig.originalViewportBackupKey);
        let contentToApply = displayConfig.defaultMobileViewportContent; // Default fallback

        // Apply the stored original viewport content if available.
        if (storedBackupViewport) {
            contentToApply = storedBackupViewport;
        } else {
            console.info('No original viewport configuration found in storage. Applying default mobile viewport settings.');
        }

        viewportElement.attr('content', contentToApply);

        // Update local storage to reflect the mobile-optimized view preference.
        persistentStorage.storeValue(displayConfig.activeViewPreferenceStorageKey, 'true');
    };

    // --- Initial View Setup on Page Load ---
    /**
     * Determines and applies the correct viewport layout when the page first loads,
     * based on stored preferences and local storage availability.
     */
    const initializePageLayout = function() {
        if (persistentStorage.checkSupport()) {
            const currentLayoutPreference = persistentStorage.retrieveValue(displayConfig.activeViewPreferenceStorageKey);
            // If the user previously opted for the fixed desktop layout, apply it.
            if (currentLayoutPreference === 'false') {
                setFixedDesktopLayout();
            }
        } else {
            console.warn('Local storage is not supported or accessible. View preference persistence is disabled.');
            // No action needed for Type III; default mobile view will remain.
        }
    };

    // Execute the initial layout setup immediately after script loading.
    initializePageLayout();

    // --- Event Handling for User Interaction ---
    // Attach click handlers using delegated events for robustness,
    // especially for elements that might be dynamically added or removed.

    // Event handler for the button/link that switches to the full desktop site.
    jq(document).on("click", `#${displayConfig.desktopViewSwitchId}`, function(eventObject) {
        eventObject.preventDefault(); // Prevent default link/button behavior.
        setFixedDesktopLayout();
    });

    // Event handler for the button/link that restores the mobile-optimized view.
    // This button is dynamically managed within the controls container.
    jq(document).on("click", `.${displayConfig.controlsContainerClass} #${displayConfig.mobileViewRestoreId}`, function(eventObject) {
        eventObject.preventDefault(); // Prevent default link/button behavior.
        revertToMobileOptimizedLayout();
    });

})(jQuery);