/*
 * Identity Selector Module
 * Original project: http://code.google.com/p/openid-selector/
 * This code is licensed under the New BSD License.
 *
 * This version includes structural and stylistic modifications,
 * refactoring, and enhanced robustness.
 */

let idProvidersMap; // Renamed from 'providers'
let authSelector;   // Renamed from 'openid'

(function (jq) { // Renamed $ to jq
    'use strict'; // Added strict mode

    // Helper for cookie operations, extracted for modularity and clarity
    const cookieManager = {
        /**
         * Retrieves the value of a cookie by its name.
         * @param {string} cookieName The name of the cookie to retrieve.
         * @returns {string|null} The cookie's value, or null if not found.
         */
        get: function (cookieName) {
            const namePrefix = `${cookieName}=`;
            const allCookies = document.cookie.split(';');
            for (let i = 0; i < allCookies.length; i++) {
                let currentCookie = allCookies[i].trim(); // Trim whitespace immediately
                if (currentCookie.startsWith(namePrefix)) {
                    return currentCookie.substring(namePrefix.length, currentCookie.length);
                }
            }
            return null;
        },

        /**
         * Sets a cookie with a given name, value, expiration, and path.
         * @param {string} cookieName The name of the cookie.
         * @param {string} cookieValue The value to store.
         * @param {number} expiresDays The number of days until the cookie expires.
         * @param {string} cookiePath The path for which the cookie is valid.
         */
        set: function (cookieName, cookieValue, expiresDays, cookiePath) {
            let expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (expiresDays * 24 * 60 * 60 * 1000));
            const expires = `; expires=${expirationDate.toUTCString()}`; // Use toUTCString for consistency
            document.cookie = `${cookieName}=${cookieValue}${expires}; path=${cookiePath}`; // Template literal
        }
    };

    authSelector = { // Renamed openid to authSelector
        moduleVersion: '2.0.1', // Updated version, renamed property
        isDemoModeActive: false, // Renamed property
        demoMessage: 'Currently in demonstration mode. Normally, this would submit the OpenID URL:', // Renamed property, rephrased
        cookieValidityDays: 180, // Renamed property, 6 * 30 = 180 days
        cookieKey: 'selected_id_provider', // Renamed property
        cookieStoragePath: '/', // Renamed property

        assetPath: '/assets/img/id_selector/', // Renamed property, changed path for assets
        currentLocale: null, // Renamed property
        spriteSheetName: null, // Renamed property, derived from locale later
        actionButtonText: null, // Renamed property
        renderAllSmallIcons: false, // Renamed property
        disableSpriteSheet: false, // Renamed property
        iconTooltipTemplate: 'Login via {providerName}', // Renamed property, changed placeholder

        targetInputElementName: null, // Renamed property: the ID of the hidden input field to update
        selectedProviderUrl: null, // Renamed property: the URL of the currently selected provider
        selectedProviderId: null, // Renamed property: the ID of the currently selected provider

        /**
         * Initializes the identity selector component.
         * @param {string} inputElementId The ID of the form input element to populate with the OpenID URL.
         * @returns {void}
         */
        initializeSelector: function (inputElementId) {
            if (!jq) {
                console.error("jQuery (jq) is not loaded. Identity selector cannot initialize.");
                return;
            }
            if (!inputElementId) {
                console.warn("No target input element ID provided for identity selector. Form submission might not work correctly.");
            }

            // Merge large and small providers into a single map using Object.assign
            idProvidersMap = Object.assign({}, majorIdProviders, minorIdProviders);
            
            const providerButtonContainer = jq('#identity_provider_buttons'); // Renamed ID for the container
            this.targetInputElementName = inputElementId;
            
            jq('#identity_selection_area').show(); // Renamed ID for the main choice area
            jq('#dynamic_input_section').empty(); // Renamed ID for the dynamic input area

            let boxCounter = 0; // Renamed i to boxCounter for clarity
            
            // Generate buttons for major identity providers
            for (const providerId in majorIdProviders) { // Using const, renamed id
                if (Object.prototype.hasOwnProperty.call(majorIdProviders, providerId)) {
                    const providerData = majorIdProviders[providerId];
                    const displaySize = this.renderAllSmallIcons ? 'small' : 'large';
                    const providerBoxHtml = this.generateProviderBoxMarkup(providerId, providerData, displaySize, boxCounter++);
                    providerButtonContainer.append(providerBoxHtml);
                }
            }

            // Generate buttons for minor identity providers if they exist
            if (minorIdProviders && Object.keys(minorIdProviders).length > 0) { // Added check for empty object
                providerButtonContainer.append('<div class="clear-fix"></div>'); // Added a clear-fix div for better layout control
                for (const providerId in minorIdProviders) {
                    if (Object.prototype.hasOwnProperty.call(minorIdProviders, providerId)) {
                        const providerData = minorIdProviders[providerId];
                        const providerBoxHtml = this.generateProviderBoxMarkup(providerId, providerData, 'small', boxCounter++);
                        providerButtonContainer.append(providerBoxHtml);
                    }
                }
            }
            
            // Attach form submission handler, binding 'this' context
            jq('#identity_auth_form').submit(this.handleFormSubmission.bind(this)); // Renamed ID for the form
            
            // Attempt to restore previous selection from cookie on initial load
            const previouslySelectedId = this.retrieveSelectionCookie(); // Renamed box_id
            if (previouslySelectedId) {
                this.selectProvider(previouslySelectedId, true); // Renamed signin, added isInitialLoad param
            }
        },

        /**
         * Generates the HTML markup for a single provider button.
         * @param {string} providerIdentifier The unique ID of the provider.
         * @param {object} providerDetails An object containing provider information (name, url, etc.).
         * @param {string} displaySize The desired size for the button ('small' or 'large').
         * @param {number} itemIndex The index of the item for sprite sheet positioning.
         * @returns {string} The HTML string for the provider button.
         */
        generateProviderBoxMarkup: function (providerIdentifier, providerDetails, displaySize, itemIndex) {
            const providerNameForTitle = providerDetails["name"] || providerIdentifier; // Fallback for name
            const tooltipText = this.iconTooltipTemplate.replace('{providerName}', providerNameForTitle); // Use template

            let backgroundStyle;
            if (this.disableSpriteSheet) {
                const imageExtension = (displaySize === 'small') ? '.ico.gif' : '.gif';
                backgroundStyle = `background: #FFF url(${this.assetPath}plain_icons/${providerIdentifier}${imageExtension}) no-repeat center center;`; // New path structure
            } else {
                // Determine sprite dimensions and calculate offset
                const spriteWidth = (displaySize === 'small') ? 24 : 100;
                const spriteOffsetY = (displaySize === 'small') ? -60 : 0; // Y position is fixed for small icons
                const spriteOffsetX = -itemIndex * spriteWidth; // X position based on index

                backgroundStyle = `background: #FFF url(${this.assetPath}sprites/${this.spriteSheetName}.png) no-repeat ${spriteOffsetX}px ${spriteOffsetY}px;`; // New path structure
            }

            // Using data-provider-id for identification instead of inline javascript: calls
            return `<a title="${tooltipText}" href="javascript:void(0);" data-provider-id="${providerIdentifier}" class="id_selector_btn id_selector_${displaySize}_btn" style="${backgroundStyle}"></a>`;
        },

        /**
         * Handles the selection of an identity provider.
         * @param {string} providerIdentifier The ID of the selected provider.
         * @param {boolean} [isInitialLoad=false] True if this selection occurs during page load.
         * @returns {void}
         */
        selectProvider: function (providerIdentifier, isInitialLoad = false) { // Added default value
            const providerDetails = idProvidersMap[providerIdentifier];
            if (!providerDetails) {
                console.warn(`Attempted to select unknown provider: ${providerIdentifier}.`);
                return;
            }

            this.applySelectionHighlight(providerIdentifier); // Renamed highlight
            this.storeSelectionCookie(providerIdentifier); // Renamed setCookie
            this.selectedProviderId = providerIdentifier;
            this.selectedProviderUrl = providerDetails['url'];

            // Check if user input is required for this provider
            if (providerDetails['requiresInput']) { // Renamed 'label' to 'requiresInput' for semantic clarity
                this.displayDynamicInputForm(providerDetails); // Renamed useInputBox
            } else {
                jq('#dynamic_input_section').empty(); // Clear any previous input area
                if (!isInitialLoad) { // Only submit if not an initial load (to prevent double submissions)
                    jq('#identity_auth_form').submit();
                }
            }
        },

        /**
         * Handles the form submission event.
         * @param {Event} event The DOM event object for the form submission.
         * @returns {boolean} True to allow form submission, false to prevent it.
         */
        handleFormSubmission: function (event) { // Added event parameter
            let finalRedirectUrl = this.selectedProviderUrl; // Renamed url
            
            if (finalRedirectUrl) {
                const usernameInput = jq('#provider_username_input'); // Renamed ID for the dynamic input field
                // Only replace if the input field exists and has a value
                if (usernameInput.length > 0 && usernameInput.val()) {
                    finalRedirectUrl = finalRedirectUrl.replace('{username}', usernameInput.val());
                } else if (finalRedirectUrl.includes('{username}')) {
                    // Guard clause: If URL requires username but none was provided
                    console.warn("Provider URL requires a username, but no input was found or provided. Submission aborted.");
                    event.preventDefault();
                    return false;
                }
                this.updateTargetInputValue(finalRedirectUrl); // Renamed setOpenIdUrl
            }

            // Demo mode handling
            if (this.isDemoModeActive) {
                alert(`${this.demoMessage}\n${document.getElementById(this.targetInputElementName).value}`); // Template literal
                event.preventDefault(); // Prevent actual form submission in demo mode
                return false;
            }

            // Handle JavaScript URL schemes explicitly and with caution
            if (finalRedirectUrl && finalRedirectUrl.startsWith("javascript:")) { // Safer check using startsWith
                const jsCode = finalRedirectUrl.substring("javascript:".length);
                try {
                    // WARNING: Executing arbitrary JavaScript from external configurations can be a security risk.
                    // This functionality is retained for cloning purposes but should be reviewed in production.
                    console.warn("Executing JavaScript from provider URL. Ensure this is safe and intended.");
                    eval(jsCode); 
                } catch (e) {
                    console.error("Error executing JavaScript from provider URL:", e);
                }
                event.preventDefault(); // Prevent default form submission after JS execution
                return false;
            }
            
            return true; // Allow form submission to proceed
        },

        /**
         * Updates the value of the target hidden input element in the form.
         * If the element doesn't exist, it creates one.
         * @param {string} urlValue The URL to set as the input's value.
         * @returns {void}
         */
        updateTargetInputValue: function (urlValue) { // Renamed url to urlValue
            let targetInputElement = document.getElementById(this.targetInputElementName); // Renamed hidden
            if (targetInputElement) {
                targetInputElement.value = urlValue;
            } else {
                // Create the hidden input if it doesn't exist within the form
                const hiddenInputMarkup = `<input type="hidden" id="${this.targetInputElementName}" name="${this.targetInputElementName}" value="${urlValue}"/>`;
                jq('#identity_auth_form').append(hiddenInputMarkup); // Append to the form
            }
        },

        /**
         * Applies a visual highlight to the currently selected provider button.
         * @param {string|null} providerIdentifier The ID of the provider to highlight, or null to remove existing highlight.
         * @returns {void}
         */
        applySelectionHighlight: function (providerIdentifier) {
            const highlightWrapperId = 'active_provider_highlight'; // Renamed ID
            const existingHighlightWrapper = jq(`#${highlightWrapperId}`);

            // Remove any existing highlight first
            if (existingHighlightWrapper.length) {
                const previouslyHighlightedBtn = existingHighlightWrapper.children('.id_selector_btn');
                existingHighlightWrapper.replaceWith(previouslyHighlightedBtn); // Unwrap the button
            }

            // If a providerIdentifier is provided, apply new highlight
            if (providerIdentifier) {
                const targetButton = jq(`.id_selector_btn[data-provider-id="${providerIdentifier}"]`); // Select by data attribute
                if (targetButton.length) {
                    targetButton.wrap(`<div id="${highlightWrapperId}"></div>`); // Wrap the button with a new div
                } else {
                    console.warn(`Could not find button for provider ${providerIdentifier} to highlight.`);
                }
            }
        },

        /**
         * Stores the ID of the selected provider in a cookie.
         * @param {string} valueToStore The provider ID to save.
         * @returns {void}
         */
        storeSelectionCookie: function (valueToStore) { // Renamed value
            cookieManager.set(this.cookieKey, valueToStore, this.cookieValidityDays, this.cookieStoragePath);
        },

        /**
         * Retrieves the ID of the previously selected provider from a cookie.
         * @returns {string|null} The stored provider ID, or null if not found.
         */
        retrieveSelectionCookie: function () {
            return cookieManager.get(this.cookieKey);
        },

        /**
         * Displays a dynamic input form for providers that require user input (e.g., username).
         * @param {object} providerDetails The details of the provider requiring input.
         * @returns {void}
         */
        displayDynamicInputForm: function (providerDetails) { // Renamed provider
            const dynamicInputArea = jq('#dynamic_input_section'); // Renamed input_area
            let inputFormMarkup = ''; // Renamed html
            let inputFieldId = 'provider_username_input'; // Renamed id, a generic ID for username input
            let initialInputValue = ''; // Renamed value
            const inputLabelText = providerDetails['inputLabel'] || 'Please enter your ID:'; // Renamed 'label' to 'inputLabel', added default
            let inputFieldStyle = ''; // Renamed style

            if (inputLabelText) {
                inputFormMarkup += `<p class="input-label">${inputLabelText}</p>`; // Added class for styling
            }

            // Special handling for generic OpenID (where the input is the full URL)
            if (providerDetails['name'] === 'OpenID') {
                inputFieldId = this.targetInputElementName; // The input field *is* the target hidden input
                initialInputValue = 'https://'; // Modern default to HTTPS
                inputFieldStyle = `background: #FFF url(${this.assetPath}openid-icon.gif) no-repeat scroll 0 5px; padding-left:20px;`; // Updated path and styling
            }
            
            inputFormMarkup += `<input id="${inputFieldId}" type="text" class="openid-input-field" style="${inputFieldStyle}" name="${inputFieldId}" value="${initialInputValue}" placeholder="e.g., yourname.openid.com" />` + // Added class, placeholder
                               `<button id="provider_submit_button" type="submit" class="submit-button">${this.actionButtonText}</button>`; // Changed to <button> for semantics, added class

            dynamicInputArea.empty().append(inputFormMarkup); // Clear and append
            jq(`#${inputFieldId}`).focus(); // Set focus to the new input field
        },

        /**
         * Configures the demonstration mode status of the selector.
         * @param {boolean} enableDemo If true, enables demo mode; otherwise, disables it.
         * @returns {void}
         */
        configureDemoStatus: function (enableDemo) { // Renamed demoMode
            this.isDemoModeActive = !!enableDemo; // Ensure boolean value
            if (this.isDemoModeActive) {
                console.log("Identity selector is now in DEMO mode.");
            } else {
                console.log("Identity selector is now in LIVE mode.");
            }
        },

        /**
         * Resets the current selection, clears input area, and deletes the selection cookie.
         * @returns {void}
         */
        resetSelection: function() {
            this.selectedProviderId = null;
            this.selectedProviderUrl = null;
            this.applySelectionHighlight(null); // Remove any existing highlight
            jq('#dynamic_input_section').empty(); // Clear dynamic input area
            cookieManager.set(this.cookieKey, '', -1, this.cookieStoragePath); // Delete cookie by setting expiration to past
            console.log("Identity selector selection reset.");
        },

        /**
         * Returns an object containing the current configuration and state of the selector.
         * @returns {object} Current configuration and state.
         */
        getCurrentConfig: function() {
            return {
                moduleVersion: this.moduleVersion,
                isDemoModeActive: this.isDemoModeActive,
                assetPath: this.assetPath,
                currentLocale: this.currentLocale,
                actionButtonText: this.actionButtonText,
                targetInputElementName: this.targetInputElementName,
                selectedProviderId: this.selectedProviderId
            };
        }
    };

    // Attach event listener for provider buttons using delegation
    // This improves performance and handles dynamically added buttons.
    jq(document).on('click', '.id_selector_btn', function(event) {
        event.preventDefault(); // Prevent default link behavior (e.g., navigating to javascript:void(0);)
        const providerId = jq(this).data('provider-id');
        if (providerId) {
            authSelector.selectProvider(providerId);
        } else {
            console.warn("Clicked provider button has no 'data-provider-id' attribute.");
        }
    });

})(jQuery); // Pass jQuery as 'jq' to the IIFE


/*
 * Configuration for major (large icon) identity providers.
 * Renamed from 'providers_large'.
 */
const majorIdProviders = { 
    google: {
        name: 'Google',
        url: 'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=YOUR_CLIENT_ID&scope=openid%20email&redirect_uri=YOUR_REDIRECT_URI', // Updated URL to modern OAuth flow example
        requiresInput: false // Explicitly state no user input needed
    },
    yahoo: {
        name: 'Yahoo',
        url: 'https://me.yahoo.com/',
        requiresInput: false
    },
    aol: {
        name: 'AOL',
        inputLabel: 'Enter your AOL screenname:', // Renamed 'label' to 'inputLabel'
        url: 'http://openid.aol.com/{username}',
        requiresInput: true
    },
    myopenid: {
        name: 'MyOpenID',
        inputLabel: 'Enter your MyOpenID username:',
        url: 'http://{username}.myopenid.com/',
        requiresInput: true
    },
    generic_openid: { // Renamed 'openid' to 'generic_openid' for clarity
        name: 'OpenID',
        inputLabel: 'Enter your OpenID URL:',
        url: null, // URL will be entirely provided by the user input
        requiresInput: true
    }
};

/*
 * Configuration for minor (small icon) identity providers.
 * Renamed from 'providers_small'.
 */
const minorIdProviders = { 
    livejournal: {
        name: 'LiveJournal',
        inputLabel: 'Enter your LiveJournal username:',
        url: 'http://{username}.livejournal.com/',
        requiresInput: true
    },
    wordpress_com: { // Renamed 'wordpress' to 'wordpress_com'
        name: 'Wordpress.com',
        inputLabel: 'Enter your Wordpress.com username:',
        url: 'http://{username}.wordpress.com/',
        requiresInput: true
    },
    blogger: {
        name: 'Blogger',
        inputLabel: 'Your Blogger account username (e.g., yourname.blogspot.com):', // Rephrased label
        url: 'http://{username}.blogspot.com/',
        requiresInput: true
    },
    verisign: {
        name: 'Verisign',
        inputLabel: 'Your Verisign username:',
        url: 'http://{username}.pip.verisignlabs.com/',
        requiresInput: true
    },
    claimid: {
        name: 'ClaimID',
        inputLabel: 'Your ClaimID username:',
        url: 'http://claimid.com/{username}',
        requiresInput: true
    },
    clickpass: {
        name: 'ClickPass',
        inputLabel: 'Enter your ClickPass username:',
        url: 'http://clickpass.com/public/{username}',
        requiresInput: true
    },
    google_profile: {
        name: 'Google Profile',
        inputLabel: 'Enter your Google Profile username:',
        url: 'http://www.google.com/profiles/{username}',
        requiresInput: true
    }
};

// Initial configuration assignments for the authSelector object
authSelector.currentLocale = 'en-US'; // Changed locale value for more specificity
authSelector.spriteSheetName = authSelector.currentLocale.split('-')[0]; // Derive sprite name from locale (e.g., 'en')
authSelector.demoMessage = 'In client demonstration mode. The following OpenID URL would have been submitted:'; // Rephrased message
authSelector.actionButtonText = 'Proceed to Sign-In'; // Rephrased button text
authSelector.iconTooltipTemplate = 'Authenticate with {providerName}'; // Rephrased tooltip, using new placeholder