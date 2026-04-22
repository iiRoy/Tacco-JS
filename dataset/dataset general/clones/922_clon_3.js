function AudioEmbedder(initialConfiguration) {
    // Default settings for the audio player embedding process.
    const defaultSettings = {
        swfAssetPath: '1bit.swf',         // Path to the Flash SWF player file.
        customForeColor: null,            // Hex color for the player's foreground elements (e.g., #FF0000). If null, attempts to derive from link.
        playerBgColor: '#FFFFFF',         // Background color of the Flash player.
        fixedPlayerDimension: null,       // Fixed width/height for the player. If null, calculates automatically.
        embedPosition: 'after',           // Where to insert the player relative to the link ('before' or 'after').
        enableAnalytics: false,           // Flag to enable/disable analytics tracking in the player.
        containerClassName: 'audio_player_wrapper', // CSS class for the player's parent container.
        minFlashVersion: 9,               // Minimum Flash Player version required.
        autoProcessSelector: null         // If provided, automatically processes links matching this selector on DOM load.
    };

    // Merge provided initial configuration with defaults.
    this.configuration = { ...defaultSettings, ...initialConfiguration };

    // Internal state variables for tracking player instances and auto-calculated values.
    this.instanceCounter = 1;
    this._derivedPlayerSize = null;
    this._derivedPlayerColor = null;

    // --- Private Helper Utilities ---

    /**
     * Retrieves the computed style value for a given CSS property of an element.
     * @param {HTMLElement} element - The DOM element.
     * @param {string} propertyName - The CSS property name (e.g., 'color', 'font-size').
     * @returns {string} The computed style value.
     */
    this._getComputedStyleValue = function(element, propertyName) {
        if (!element || !propertyName) return '';
        if (window.getComputedStyle) {
            return window.getComputedStyle(element, null).getPropertyValue(propertyName);
        } else if (element.currentStyle) {
            return element.currentStyle[propertyName]; // For older IE versions
        }
        return '';
    };

    /**
     * Converts an RGB color string (e.g., "rgb(255, 0, 0)") to a hexadecimal string (e.g., "#FF0000").
     * @param {string} rgbString - The RGB color string.
     * @returns {string} The hexadecimal color string, or an empty string if conversion fails.
     */
    this._rgbToHex = function(rgbString) {
        if (!rgbString || typeof rgbString !== 'string' || !rgbString.startsWith('rgb(')) return '';
        const match = rgbString.match(/\d+/g);
        if (!match || match.length !== 3) return '';
        const [r, g, b] = match.map(Number);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    };

    /**
     * Checks if a given DOM element has a specific CSS class.
     * @param {HTMLElement} element - The DOM element to check.
     * @param {string} className - The CSS class name to look for.
     * @returns {boolean} True if the element has the class, false otherwise.
     */
    this._hasCssClass = function(element, className) {
        if (!element || !element.className) return false;
        // Use classList for modern browsers, fallback to regex for older ones.
        if (element.classList) {
            return element.classList.contains(className);
        }
        return new RegExp(`(^|\\s)${className}(\\s|$)`).test(element.className);
    };

    /**
     * Adds a CSS class to a given DOM element if it doesn't already have it.
     * @param {HTMLElement} element - The DOM element to modify.
     * @param {string} className - The CSS class name to add.
     */
    this._addCssClass = function(element, className) {
        if (!element || !className) return;
        if (!this._hasCssClass(element, className)) {
            // Use classList for modern browsers, fallback to direct string manipulation.
            if (element.classList) {
                element.classList.add(className);
            } else {
                element.className += (element.className ? ' ' : '') + className;
            }
        }
    };

    /**
     * Queries the DOM for elements matching a CSS selector.
     * Prioritizes `document.querySelectorAll` but includes a basic fallback.
     * The original code had a complex custom selector engine; this is a significant
     * simplification/modernization for Type III.
     * @param {string} selectorExpression - The CSS selector string.
     * @returns {HTMLElement[]} An array of matching DOM elements.
     */
    this._queryElements = function(selectorExpression) {
        if (document.querySelectorAll) {
            return Array.from(document.querySelectorAll(selectorExpression));
        }
        // Basic fallback for very old browsers (only handles tag or tag.class)
        console.warn('AudioEmbedder: Using basic selector fallback, consider updating browser for full support.');
        const foundElements = [];
        const selectorParts = selectorExpression.split('.');
        const tagName = selectorParts[0] || '*';
        const className = selectorParts[1];

        const elements = document.getElementsByTagName(tagName);
        for (let i = 0; i < elements.length; i++) {
            if (!className || this._hasCssClass(elements[i], className)) {
                foundElements.push(elements[i]);
            }
        }
        return foundElements;
    };

    // --- Public Configuration Methods ---

    /**
     * Updates a specific configuration setting for the embedder.
     * Only allows changes to a predefined set of modifiable options.
     * @param {string} settingKey - The key of the setting to update.
     * @param {*} settingValue - The new value for the setting.
     */
    this.configureOption = function(settingKey, settingValue) {
        const allowedConfigKeys = ['customForeColor', 'playerBgColor', 'fixedPlayerDimension', 'embedPosition', 'enableAnalytics', 'swfAssetPath'];
        if (allowedConfigKeys.includes(settingKey)) {
            this.configuration[settingKey] = settingValue;
            console.info(`AudioEmbedder: Configuration updated: ${settingKey} set to ${settingValue}`);
        } else {
            console.warn(`AudioEmbedder: Attempted to set an unauthorized or invalid configuration key: ${settingKey}. No change applied.`);
        }
    };

    // --- Core Embedding Functionality ---

    /**
     * Scans the DOM for links matching a selector and embeds an audio player next to each valid link.
     * @param {string} selectorExpression - A CSS selector to identify the target links (e.g., 'a.mp3-link').
     */
    this.processLinks = function(selectorExpression) {
        const targetLinks = this._queryElements(selectorExpression);

        if (targetLinks.length === 0) {
            console.log(`AudioEmbedder: No target links found for selector: "${selectorExpression}". Skipping embedding process.`);
            return; // Exit early if no links are found.
        }

        targetLinks.forEach(linkElement => {
            // Validate link: must not already have a player and must point to an MP3.
            if (this._hasCssClass(linkElement.parentNode, this.configuration.containerClassName)) {
                console.log(`AudioEmbedder: Skipping link "${linkElement.href}" as it already has an embedded player.`);
                return;
            }
            if (!linkElement.href || !linkElement.href.toLowerCase().endsWith('.mp3')) {
                console.warn(`AudioEmbedder: Skipping link "${linkElement.href}" as it does not appear to be an MP3 file.`);
                return;
            }

            this.embedAudioPlayer(linkElement);
        });
    };

    /**
     * Embeds the Flash audio player adjacent to a specific anchor (link) element.
     * @param {HTMLElement} anchorElement - The <a> element whose href points to the MP3.
     */
    this.embedAudioPlayer = function(anchorElement) {
        // Determine player size: use fixed size from config or calculate dynamically.
        let effectivePlayerSize = this.configuration.fixedPlayerDimension;
        if (effectivePlayerSize === null) {
            // Calculate size based on link's height, with a minimum value for usability.
            this._derivedPlayerSize = Math.max(30, Math.floor(anchorElement.offsetHeight * 0.7));
            effectivePlayerSize = this._derivedPlayerSize;
        }

        // Determine foreground color: use custom color from config or derive from link's style.
        let effectiveForeColor = this.configuration.customForeColor;
        if (effectiveForeColor === null) {
            let elementComputedColor = this._getComputedStyleValue(anchorElement, 'color');
            if (elementComputedColor.startsWith('rgb')) {
                this._derivedPlayerColor = this._rgbToHex(elementComputedColor);
            } else if (elementComputedColor.startsWith('#') && elementComputedColor.length === 4) {
                // Expand 3-digit hex (e.g., #F00) to 6-digit (e.g., #FF0000) for Flash compatibility.
                this._derivedPlayerColor = `#${elementComputedColor[1]}${elementComputedColor[1]}${elementComputedColor[2]}${elementComputedColor[2]}${elementComputedColor[3]}${elementComputedColor[3]}`;
            } else {
                this._derivedPlayerColor = elementComputedColor; // Assume it's a valid 6-digit hex or named color.
            }
            effectiveForeColor = this._derivedPlayerColor;
        }

        // Create the wrapper element for the player and link.
        const playerContainer = document.createElement('span');
        this._addCssClass(playerContainer, this.configuration.containerClassName);
        this._addCssClass(playerContainer, 'audio-embed-active'); // Add an additional class for styling hooks.

        // Prepare the placeholder for the SWF object.
        const embedTargetId = `audioPlayerInstance_${this.instanceCounter}`;
        const swfPlaceholder = document.createElement('span');
        swfPlaceholder.setAttribute('id', embedTargetId);
        this._addCssClass(swfPlaceholder, 'swf-embed-target'); // Add class to placeholder.

        // Insert elements into the DOM relative to the anchor.
        const parentNode = anchorElement.parentNode;
        if (!parentNode) {
            console.error("AudioEmbedder: Cannot embed player; parent node not found for anchor element:", anchorElement);
            return; // Prevent errors if parent is missing.
        }
        parentNode.insertBefore(playerContainer, anchorElement);

        const nonBreakingSpace = document.createTextNode('\u00A0'); // Unicode non-breaking space.

        if (this.configuration.embedPosition === 'before') {
            playerContainer.appendChild(swfPlaceholder);
            playerContainer.appendChild(nonBreakingSpace);
            playerContainer.appendChild(anchorElement);
        } else { // Default to 'after'
            playerContainer.appendChild(anchorElement);
            playerContainer.appendChild(nonBreakingSpace);
            playerContainer.appendChild(swfPlaceholder);
        }

        // Initialize and write the SWFObject.
        // This assumes the SWFObject.js library is loaded globally.
        if (typeof SWFObject === 'undefined') {
            console.error('AudioEmbedder: SWFObject library not found. Cannot embed Flash player. Please ensure SWFObject.js is loaded.');
            return;
        }

        const swfEmbedder = new SWFObject(
            this.configuration.swfAssetPath,
            embedTargetId,
            effectivePlayerSize,
            effectivePlayerSize,
            this.configuration.minFlashVersion,
            this.configuration.playerBgColor
        );

        if (this.configuration.playerBgColor === 'transparent') {
            swfEmbedder.addParam('wmode', 'transparent');
        }

        // Flash often expects hex colors with '0x' prefix.
        swfEmbedder.addVariable('foreColor', effectiveForeColor.replace('#', '0x'));
        // Ensure analytics variable is a string 'true' or 'false'.
        swfEmbedder.addVariable('analytics', this.configuration.enableAnalytics ? 'true' : 'false');
        // URL encode the filename to handle special characters.
        swfEmbedder.addVariable('filename', encodeURIComponent(anchorElement.href));

        swfEmbedder.write(embedTargetId);
        this.instanceCounter++; // Increment player count for unique IDs.
    };

    // --- Initialization Logic ---

    // If 'autoProcessSelector' is provided in the initial configuration,
    // automatically process links once the DOM is ready.
    if (this.configuration.autoProcessSelector) {
        const selectorToProcess = this.configuration.autoProcessSelector;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.processLinks(selectorToProcess));
        } else {
            // If DOM is already loaded, execute immediately.
            this.processLinks(selectorToProcess);
        }
    }
}