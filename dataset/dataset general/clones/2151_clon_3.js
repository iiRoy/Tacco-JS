var ContentEditor = function( editorInstanceId, givenWidth, givenHeight, toolsetVariant, initialContent ) {
    // A sophisticated WYSIWYG editor for web content creation.
    // Core properties for this editor instance.
    this.editorInstanceId	= editorInstanceId;
    this.displayWidth		= givenWidth    || '100%';
    this.displayHeight		= givenHeight   || '200px'; // Changed default to include 'px' for consistency
    this.toolsetVariant		= toolsetVariant|| 'Standard'; // Renamed 'Default' to 'Standard'
    this.initialContent		= initialContent|| '';
    this.baseAssetPath		= ContentEditor.baseAssetPath;
    this.performBrowserCheck= true;
    this.showDebugMessages	= true;

    // Configuration storage for this editor.
    this.configurationSettings = {}; // Use object literal instead of new Object()

    // Event handler for runtime issues.
    this.errorHandlerCallback = null; // function( sourceEditor, errorCode, errorDetails )

    // Internal flag to track initialization status
    this._isInitialized = false;

    // Validate essential parameters early
    if (!this.editorInstanceId || typeof this.editorInstanceId !== 'string' || this.editorInstanceId.trim().length === 0) {
        this.signalRuntimeError(1001, 'An editor instance must have a non-empty string ID.');
        // Prevent further initialization if critical ID is missing
        this._isInitialized = false;
        return;
    }
};

// --- Static Properties ---

/**
 * The default base URL for editor assets, used by all instances.
 * This should point to the directory containing 'editor/'.
 */
ContentEditor.baseAssetPath = '/contenteditor/';

/**
 * The minimum acceptable height for an editor instance, in pixels,
 * when automatically replacing textareas.
 */
ContentEditor.minimumHeight = 200;

/**
 * The minimum acceptable width for an editor instance, in pixels,
 * when automatically replacing textareas.
 */
ContentEditor.minimumWidth = 750;

// --- Prototype Properties ---

ContentEditor.prototype.softwareVersion  = '3.0.0'; // Updated version number
ContentEditor.prototype.buildIdentifier = '31415'; // New build number

// --- Prototype Methods ---

/**
 * Renders the editor directly into the document stream.
 * Should only be called during page load.
 */
ContentEditor.prototype.renderEditor = function() {
    if (this._isInitialized) {
        console.warn('ContentEditor: Attempted to render an already initialized editor instance.');
        return;
    }
    const editorHtml = this.generateEditorMarkup();
    if (editorHtml) {
        document.write(editorHtml);
        this._isInitialized = true;
    } else {
        console.error('ContentEditor: Failed to generate markup for editor instance "' + this.editorInstanceId + '".');
    }
};

/**
 * Generates the full HTML string for the editor or a fallback textarea.
 * @returns {string} The HTML string.
 */
ContentEditor.prototype.generateEditorMarkup = function() {
    // Basic validation for the instance identifier.
    if ( !this.editorInstanceId || this.editorInstanceId.length === 0 ) {
        this.signalRuntimeError( 1002, 'Instance identifier is missing. Cannot generate HTML.' );
        return '';
    }

    let generatedMarkup = '';
    const isBrowserSupported = this.isCurrentBrowserCompatible();

    if ( !this.performBrowserCheck || isBrowserSupported ) {
        // If the browser is compatible or check is disabled, render the full editor.
        const encodedContent = this.escapeHtmlEntities( this.initialContent );
        generatedMarkup += `<input type="hidden" id="${this.editorInstanceId}" name="${this.editorInstanceId}" value="${encodedContent}" style="display:none;" />`;
        generatedMarkup += this.retrieveConfigHiddenInput();
        generatedMarkup += this.composeIframeMarkup();
    } else {
        // Fallback to a plain textarea for incompatible browsers.
        console.warn(`ContentEditor: Browser not compatible for instance "${this.editorInstanceId}". Falling back to textarea.`);
        const effectiveWidth  = (this.displayWidth.toString().indexOf('%')  > 0 || this.displayWidth.toString().endsWith('px')) ? this.displayWidth  : this.displayWidth  + 'px';
        const effectiveHeight = (this.displayHeight.toString().indexOf('%') > 0 || this.displayHeight.toString().endsWith('px')) ? this.displayHeight : this.displayHeight + 'px';

        generatedMarkup += `<textarea name="${this.editorInstanceId}" rows="4" cols="40" style="width:${effectiveWidth};height:${effectiveHeight};">`;

        if ( this.tabIndexValue ) {
            generatedMarkup += `" tabindex="${this.tabIndexValue}`;
        }

        generatedMarkup += `>${this.escapeHtmlEntities( this.initialContent )}</textarea>`;
    }

    return generatedMarkup;
};

/**
 * Replaces an existing <textarea> element with a ContentEditor instance.
 * The textarea's ID or name must match the editor's instance ID.
 */
ContentEditor.prototype.swapWithTextarea = function() {
    // Check if the editor iframe is already present to prevent double initialization.
    if ( document.getElementById( this.editorInstanceId + '___Frame' ) ) {
        console.warn(`ContentEditor: Editor iframe for "${this.editorInstanceId}" already exists. Skipping replacement.`);
        return;
    }

    // Only proceed if browser check is disabled or browser is compatible.
    if ( !this.performBrowserCheck || this.isCurrentBrowserCompatible() ) {
        let targetTextarea = null;

        // Try to find the textarea by ID first.
        targetTextarea = document.getElementById( this.editorInstanceId );

        // If not found by ID, search by name.
        if ( !targetTextarea ) {
            const namedElements = document.getElementsByName( this.editorInstanceId );
            for (let i = 0; i < namedElements.length; i++) {
                if (namedElements[i].tagName && namedElements[i].tagName.toLowerCase() === 'textarea') {
                    targetTextarea = namedElements[i];
                    break;
                }
            }
        }

        if ( !targetTextarea || targetTextarea.tagName.toLowerCase() !== 'textarea' ) {
            this.signalRuntimeError( 1003, `TEXTAREA with ID or name "${this.editorInstanceId}" not found for replacement.` );
            return;
        }

        // Store existing tab index if available.
        if ( targetTextarea.tabIndex ) {
            this.tabIndexValue = targetTextarea.tabIndex;
        }

        // Hide the original textarea.
        targetTextarea.style.display = 'none';
        targetTextarea.setAttribute('data-contenteditor-replaced', 'true'); // Add a custom attribute

        // Insert the configuration and iframe markup before the hidden textarea.
        this.insertAdjacentMarkupBefore( this.retrieveConfigHiddenInput(), targetTextarea );
        this.insertAdjacentMarkupBefore( this.composeIframeMarkup(), targetTextarea );

        this._isInitialized = true;
    } else {
        // If browser is not compatible, log a warning but do nothing else.
        console.warn(`ContentEditor: Browser not compatible for instance "${this.editorInstanceId}". Textarea replacement skipped.`);
    }
};

/**
 * Inserts HTML markup immediately before a specified DOM element.
 * Handles different browser implementations (IE vs. standard).
 * @param {string} markupHtml - The HTML string to insert.
 * @param {HTMLElement} targetElement - The element before which to insert the HTML.
 */
ContentEditor.prototype.insertAdjacentMarkupBefore = function( markupHtml, targetElement ) {
    if (!targetElement || typeof markupHtml !== 'string') {
        console.error('ContentEditor: Invalid arguments for insertAdjacentMarkupBefore.');
        return;
    }

    try {
        if ( targetElement.insertAdjacentHTML ) { // IE method
            targetElement.insertAdjacentHTML( 'beforeBegin', markupHtml );
        } else { // W3C standard (Gecko, WebKit, etc.)
            const range = document.createRange();
            range.setStartBefore( targetElement );
            const fragment = range.createContextualFragment( markupHtml );
            targetElement.parentNode.insertBefore( fragment, targetElement );
        }
    } catch (e) {
        this.signalRuntimeError(1004, `Failed to insert HTML before element. Error: ${e.message}`);
    }
};

/**
 * Generates a hidden input field containing URL-encoded editor configuration settings.
 * @returns {string} The HTML string for the hidden input.
 */
ContentEditor.prototype.retrieveConfigHiddenInput = function() {
    let configQueryString = '';
    let firstParam = true;

    for ( const settingKey in this.configurationSettings ) {
        if ( Object.prototype.hasOwnProperty.call(this.configurationSettings, settingKey) ) {
            if ( !firstParam ) {
                configQueryString += '&'; // Use bare '&' as browsers will encode it when setting src
            } else {
                firstParam = false;
            }
            configQueryString += encodeURIComponent( settingKey ) + '=' + encodeURIComponent( this.configurationSettings[settingKey] );
        }
    }

    return `<input type="hidden" id="${this.editorInstanceId}___Config" value="${configQueryString}" style="display:none;" />`;
};

/**
 * Composes the HTML markup for the editor's iframe.
 * @returns {string} The HTML string for the iframe.
 */
ContentEditor.prototype.composeIframeMarkup = function() {
    let editorFile = 'editor_main.html'; // Renamed fckeditor.html

    try {
        // Check if a debug/source version is requested in the top window's URL.
        // This is useful for development purposes.
        if ( window.top && window.top.location && (/editorsrc=true/i).test( window.top.location.search ) ) {
            editorFile = 'editor_debug.html'; // Renamed fckeditor.original.html
        }
    } catch (e) {
        // This catch handles security errors if the editor is in a frame
        // and window.top is in a different domain. It's safe to ignore.
        console.info('ContentEditor: Could not access window.top.location due to cross-origin restrictions.');
    }

    let iframeSourceUrl = this.baseAssetPath + 'editor/' + editorFile + '?instanceId=' + encodeURIComponent( this.editorInstanceId );

    // Append toolbar variant if specified.
    if ( this.toolsetVariant ) {
        iframeSourceUrl += '&toolset=' + encodeURIComponent( this.toolsetVariant );
    }

    // Construct the iframe HTML.
    let iframeHtml = `<iframe id="${this.editorInstanceId}___Frame" src="${iframeSourceUrl}" width="${this.displayWidth}" height="${this.displayHeight}"`;

    if ( this.tabIndexValue ) {
        iframeHtml += ` tabindex="${this.tabIndexValue}"`;
    }

    // Added sandbox attribute for enhanced security, if browser supports it.
    iframeHtml += ` frameborder="0" scrolling="no" allowfullscreen="true" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>`;

    return iframeHtml;
};

/**
 * Checks if the current browser is compatible with the ContentEditor.
 * Delegates to a global utility function.
 * @returns {boolean} True if compatible, false otherwise.
 */
ContentEditor.prototype.isCurrentBrowserCompatible = function() {
    // A separate global function handles browser detection logic.
    return checkBrowserCompatibility();
};

/**
 * Handles runtime errors by logging and optionally invoking a callback.
 * @param {number} errorCode - A numeric identifier for the error.
 * @param {string} errorDetails - A descriptive message about the error.
 */
ContentEditor.prototype.signalRuntimeError = function( errorCode, errorDetails ) {
    this.errorCode		= errorCode;
    this.errorDetails	= errorDetails || 'An unspecified error occurred.';

    if ( this.showDebugMessages ) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = '#cc0000';
        errorDiv.style.border = '1px solid #cc0000';
        errorDiv.style.padding = '5px';
        errorDiv.style.margin = '5px';
        errorDiv.textContent = `[ ContentEditor Error ${this.errorCode}: ${this.errorDetails} ]`;
        // Append to body or a more specific error container if available
        document.body ? document.body.appendChild(errorDiv) : document.write(errorDiv.outerHTML);
        console.error(`ContentEditor Error ${this.errorCode}: ${this.errorDetails}`, this);
    }

    // Invoke the custom error handler if one is provided.
    if ( typeof( this.errorHandlerCallback ) === 'function' ) {
        this.errorHandlerCallback( this, errorCode, errorDetails );
    }
};

/**
 * Escapes HTML entities in a given string to prevent XSS.
 * @param {string} rawText - The raw text to encode.
 * @returns {string} The HTML-encoded string.
 */
ContentEditor.prototype.escapeHtmlEntities = function( rawText ) {
    if ( typeof rawText !== 'string' ) {
        if (rawText === null || rawText === undefined) return ''; // Handle null/undefined
        rawText = String(rawText); // Convert other types to string
    }

    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;', // Apostrophe
        '/': '&#x2F;'  // Slash
    };

    // Use a single replace with a callback for efficiency.
    return rawText.replace(/[&<>"'/]/g, function (s) {
        return entityMap[s];
    });
};

// --- Static Utility for Textarea Replacement ---
(function() {
    /**
     * Helper function to create an editor instance from a textarea.
     * @param {HTMLTextAreaElement} sourceTextarea - The textarea element.
     * @returns {ContentEditor} A new ContentEditor instance.
     */
    const createEditorFromTextarea = function( sourceTextarea ) {
        // Ensure textarea has a name for the editor instance ID.
        if (!sourceTextarea.name) {
            console.warn('ContentEditor: Textarea has no name attribute. Cannot create editor instance.');
            return null;
        }

        const newEditor = new ContentEditor( sourceTextarea.name );

        // Adjust editor dimensions based on textarea's current size,
        // respecting minimums.
        newEditor.displayWidth  = Math.max( sourceTextarea.offsetWidth, ContentEditor.minimumWidth ) + 'px';
        newEditor.displayHeight = Math.max( sourceTextarea.offsetHeight, ContentEditor.minimumHeight ) + 'px';
        newEditor.initialContent = sourceTextarea.value; // Pre-fill with textarea content

        return newEditor;
    };

    /**
     * Replaces all <textarea> elements in the document with ContentEditor instances.
     * This method can accept a class name string or a custom assertion function.
     *
     * @param {string|function} [filterCriteria] - Optional. A class name string to filter textareas,
     *                                             or a function (textarea, editor) => boolean for custom logic.
     *
     * Example Usage:
     * // Replace all textareas on the page.
     * ContentEditor.convertAllTextareas();
     *
     * // Replace textareas with a specific class, e.g., 'rich-editor'.
     * ContentEditor.convertAllTextareas( 'rich-editor' );
     *
     * // Use a custom function to decide which textareas to convert.
     * ContentEditor.convertAllTextareas( function( currentTextarea, editorInstance ) {
     *     if ( currentTextarea.id === 'mySpecialEditor' ) {
     *         editorInstance.toolsetVariant = 'Advanced'; // Customize the editor instance
     *         return true; // Convert this textarea
     *     }
     *     return false; // Skip others
     * } );
     */
    ContentEditor.convertAllTextareas = function( filterCriteria ) {
        const allTextareas = document.getElementsByTagName( 'textarea' );
        if (allTextareas.length === 0) {
            console.info('ContentEditor: No textareas found to convert.');
            return;
        }

        let convertedCount = 0;

        for ( let k = 0 ; k < allTextareas.length ; k++ ) {
            const currentTextarea = allTextareas[k];
            const textareaName = currentTextarea.name;

            // Textareas without a name attribute cannot be converted.
            if ( !textareaName || textareaName.trim().length === 0 ) {
                console.warn('ContentEditor: Skipping textarea without a "name" attribute.', currentTextarea);
                continue;
            }

            let shouldConvert = true;
            let editorInstance = null; // Declare here so it's accessible after conditional logic

            if ( typeof filterCriteria === 'string' ) {
                // If a string is provided, check for a matching class name.
                const classPattern = new RegExp( `(?:^|\\s)${filterCriteria}(?:\\s|$)` );
                if ( !classPattern.test( currentTextarea.className ) ) {
                    shouldConvert = false;
                }
            } else if ( typeof filterCriteria === 'function' ) {
                // If a function is provided, execute it to determine conversion and allow customization.
                editorInstance = createEditorFromTextarea( currentTextarea );
                if (!editorInstance) { // If editor creation failed (e.g., no name)
                    shouldConvert = false;
                } else {
                    // Custom function must explicitly return false to prevent conversion.
                    if ( filterCriteria( currentTextarea, editorInstance ) === false ) {
                        shouldConvert = false;
                    }
                }
            }

            if ( shouldConvert ) {
                // If editorInstance was not created by the custom function, create it now.
                if ( !editorInstance ) {
                    editorInstance = createEditorFromTextarea( currentTextarea );
                }
                // Only proceed if an editor instance was successfully created.
                if ( editorInstance ) {
                    editorInstance.swapWithTextarea();
                    convertedCount++;
                }
            }
        }
        console.info(`ContentEditor: Successfully converted ${convertedCount} textareas.`);
    };
})(); // End of IIFE

/**
 * Global function to determine browser compatibility for the ContentEditor.
 * @returns {boolean} True if the browser is supported, false otherwise.
 */
function checkBrowserCompatibility() {
    const userAgent = navigator.userAgent.toLowerCase();
    let isCompatible = false;
    let browserInfo = 'Unknown';

    // Helper to extract version from agent string
    const getVersion = (regex) => {
        const match = userAgent.match(regex);
        return match && match[1] ? parseFloat(match[1]) : 0;
    };

    // --- Modern Browser Checks (prioritize WebKit/Gecko/Opera for better detection) ---

    // WebKit-based browsers (Safari, Chrome, Edge Chromium, etc.)
    if ( userAgent.indexOf( 'applewebkit/' ) !== -1 ) {
        const webkitVersion = getVersion( / applewebkit\/(\d+)/ );
        if ( webkitVersion >= 522 ) { // WebKit build 522 corresponds to Safari 3+
            isCompatible = true;
            browserInfo = `WebKit (build ${webkitVersion})`;
        }
    }

    // Gecko-based browsers (Firefox)
    if ( !isCompatible && navigator.product === 'Gecko' && navigator.productSub >= 20030210 ) {
        // Exclude Opera trying to behave like Gecko if it's not a real Gecko browser
        if ( !( typeof(window.opera) === 'object' && window.opera.postError ) ) {
            isCompatible = true;
            browserInfo = `Gecko (build ${navigator.productSub})`;
        }
    }

    // Opera (Presto engine, version 9.50+)
    if ( !isCompatible && window.opera && window.opera.version ) {
        const operaVersion = parseFloat( window.opera.version() );
        if ( operaVersion >= 9.5 ) {
            isCompatible = true;
            browserInfo = `Opera (v${operaVersion})`;
        }
    }

    // Adobe AIR (uses WebKit, but reported differently)
    if ( !isCompatible && userAgent.indexOf( ' adobeair/' ) !== -1 ) {
        const airVersion = getVersion( / adobeair\/(\d+)/ );
        if ( airVersion >= 1 ) { // Minimum AIR v1
            isCompatible = true;
            browserInfo = `Adobe AIR (v${airVersion})`;
        }
    }

    // --- Legacy IE Check (always last due to conditional compilation) ---
    // Internet Explorer 5.5+ (non-Mac)
    if ( !isCompatible && /*@cc_on!@*/false && userAgent.indexOf("mac") === -1 ) {
        const ieVersion = getVersion( /msie (.\..)/ );
        if ( ieVersion >= 5.5 ) {
            isCompatible = true;
            browserInfo = `Internet Explorer (v${ieVersion})`;
        }
    }

    if (!isCompatible) {
        console.warn(`ContentEditor: Current browser "${navigator.appName}" (UA: ${userAgent}) is not officially supported. Functionality may be limited or broken.`);
    } else {
        console.info(`ContentEditor: Browser detected as compatible: ${browserInfo}`);
    }

    return isCompatible;
}