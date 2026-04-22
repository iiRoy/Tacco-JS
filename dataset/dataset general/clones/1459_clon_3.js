/*
 * Module for providing enhanced hexadecimal color code suggestions within CSS-like files.
 * This component aims to assist developers by offering relevant color completions
 * based on existing color definitions in the current document.
 *
 * This software is provided under a permissive open-source license.
 * For full details, please refer to the accompanying license file.
 */

/* global define, brackets */

define(function (acquireModule, provideExports, currentModule) {
    "use strict";

    // Obtain necessary utility modules from the host environment
    const ApplicationInitializer      = brackets.getModule("utils/AppInit");
    const CompletionManager           = brackets.getModule("editor/CodeHintManager");
    const ActiveDocumentService       = brackets.getModule("document/DocumentManager");
    const StyleLanguageUtilities      = brackets.getModule("language/CSSUtils");
    const SyntaxHandler               = brackets.getModule("language/LanguageManager"); // Unused, but kept for structural similarity

    // Define constants for color processing
    const HASH_SYMBOL = "#";
    const COLOR_BRIGHTNESS_WEIGHTS = { R: 299, G: 587, B: 114 };
    const BRIGHTNESS_DIVISOR = 1000;

    /**
     * @class HexCodeSuggester
     * @description Provides intelligent hex color code completion.
     * @constructor
     */
    function HexCodeSuggester() {
        /**
         * The editor instance currently being observed for completions.
         * @type {CodeMirror.Editor}
         * @private
         */
        this.currentEditor = null;

        /**
         * Contextual information about the current cursor position,
         * typically obtained from language-specific utilities.
         * @type {object}
         * @private
         */
        this.syntaxContext = null;
    }

    /**
     * Retrieves the entire textual content of the active editor's document.
     * @returns {string} The full text of the document, or an empty string if not available.
     */
    HexCodeSuggester.prototype.retrieveDocumentContent = function () {
        // Ensure an editor instance is available before attempting to access its document.
        if (!this.currentEditor || !this.currentEditor.document) {
            console.warn("No active editor or document found to retrieve content.");
            return "";
        }
        return this.currentEditor.document.getText();
    };

    /**
     * Extracts the pure hexadecimal color value from a formatted hint string.
     * @param {string} hintRepresentation - The string representing the hint, e.g., "<div>...</div>#FF00AA".
     * @returns {string} The hexadecimal color code without the leading hash.
     */
    HexCodeSuggester.prototype.extractHexValue = function (hintRepresentation) {
        if (typeof hintRepresentation !== "string" || hintRepresentation.length === 0) {
            return ""; // Return empty for invalid input
        }
        const lastChevronPos = hintRepresentation.lastIndexOf(">");
        if (lastChevronPos === -1) {
            // If no HTML tag is present, assume the entire string is the hex value.
            return hintRepresentation.startsWith(HASH_SYMBOL) ? hintRepresentation.substring(1) : hintRepresentation;
        }
        // Extract the part after the last closing chevron, which should be the hex code.
        let rawHex = hintRepresentation.substring(lastChevronPos + 1);
        return rawHex.startsWith(HASH_SYMBOL) ? rawHex.substring(1) : rawHex;
    };

    /**
     * Compares two color hint strings based on the brightness of their contained hex values.
     * This method is designed for use with array sorting functions.
     * @param {string} hintStrA - The first color hint string.
     * @param {string} hintStrB - The second color hint string.
     * @returns {number} -1 if hintStrA is brighter, 1 if hintStrB is brighter, 0 if equal.
     */
    HexCodeSuggester.prototype.sortColorsByLuminosity = function (hintStrA, hintStrB) {
        const hexValA = this.extractHexValue(hintStrA);
        const hexValB = this.extractHexValue(hintStrB);

        // Ensure hex values are in 6-character format for consistent brightness calculation.
        const fullHexA = this.expandToFullHex(hexValA);
        const fullHexB = this.expandToFullHex(hexValB);

        const luminosityA = this.computeLuminosityMetric(fullHexA);
        const luminosityB = this.computeLuminosityMetric(fullHexB);

        // Standard comparison logic for sorting.
        if (luminosityA < luminosityB) {
            return -1;
        } else if (luminosityA > luminosityB) {
            return 1;
        }
        return 0;
    };

    /**
     * Generates a list of unique hexadecimal color codes found within the current document,
     * filtered by user input and sorted by luminosity.
     * @returns {Array<string>} An array of HTML-formatted strings, each representing a color hint.
     */
    HexCodeSuggester.prototype.discoverAllHexCodes = function () {
        // Retrieve the entire document content.
        const contentBuffer = this.retrieveDocumentContent();
        if (!contentBuffer) {
            return [];
        }

        // Regex to find hex color values: ` #` or `:` followed by # and 3 or 6 hex digits,
        // then followed by a non-word character or semicolon.
        // This is a slightly modified version of the original regex for variety.
        const colorSearchPattern = /(?:[\s:]|^)#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?=[^\w;]|$)/g;

        // Extract the user's typed prefix for filtering.
        // Ensure this.syntaxContext and its properties are valid.
        const currentInput = (this.syntaxContext && this.syntaxContext.values && this.syntaxContext.values[0]) || "";
        const prefixFilter = currentInput.startsWith(HASH_SYMBOL) ?
                             currentInput.substring(1).toLowerCase() :
                             currentInput.toLowerCase();

        const uniqueFoundHexes = new Set(); // Use a Set to guarantee uniqueness efficiently.
        const suggestionList = [];

        let hexMatch;
        while ((hexMatch = colorSearchPattern.exec(contentBuffer)) !== null) {
            const capturedHex = hexMatch[1].toLowerCase();

            // Expand to 6 characters for consistent checking and processing.
            const fullLengthHex = this.expandToFullHex(capturedHex);

            // Attempt to condense to 3 characters if possible for display.
            const displayHex = this.condenseToShortHex(capturedHex);

            // Filter based on the user's input prefix.
            // A color is included if its 3-char or 6-char representation starts with the filter.
            const matchesFilter = (displayHex.startsWith(prefixFilter) || fullLengthHex.startsWith(prefixFilter));

            if (matchesFilter) {
                // Generate the HTML representation for the hint.
                const displayMarkup = `<span style="display: inline-block; margin-right: 5px; height: 10px; width: 10px; background: #${displayHex}; border: 1px solid #ccc; vertical-align: middle;"></span>${HASH_SYMBOL}${displayHex}`;

                // Add to the list only if it's genuinely unique (Set handles this).
                if (!uniqueFoundHexes.has(displayMarkup)) {
                    uniqueFoundHexes.add(displayMarkup);
                    suggestionList.push(displayMarkup);
                }
            }
        }

        // Sort the collected suggestions by their calculated luminosity.
        suggestionList.sort(this.sortColorsByLuminosity.bind(this));

        return suggestionList;
    };

    /**
     * Calculates a luminosity metric for a given hexadecimal color code.
     * The higher the returned value, the brighter the color.
     * The input hex code must be exactly six characters long.
     * @param {string} targetHex - The 6-character hexadecimal color code (e.g., "FF00AA").
     * @returns {number} The calculated brightness value. Returns -1 for invalid input.
     */
    HexCodeSuggester.prototype.computeLuminosityMetric = function (targetHex) {
        if (typeof targetHex !== "string" || targetHex.length !== 6) {
            console.warn("Invalid hex code for brightness calculation:", targetHex);
            return -1; // Indicate an error or invalid input.
        }

        const redVal   = parseInt(targetHex.substring(0, 2), 16);
        const greenVal = parseInt(targetHex.substring(2, 4), 16);
        const blueVal  = parseInt(targetHex.substring(4, 6), 16);

        // Apply the standard luminosity formula.
        const totalWeightedSum = (redVal * COLOR_BRIGHTNESS_WEIGHTS.R) +
                                 (greenVal * COLOR_BRIGHTNESS_WEIGHTS.G) +
                                 (blueVal * COLOR_BRIGHTNESS_WEIGHTS.B);

        return totalWeightedSum / BRIGHTNESS_DIVISOR;
    };

    /**
     * Converts a 3-character hex code to its 6-character equivalent, or returns the original
     * if it's already 6 characters or cannot be expanded.
     * @param {string} hexSegment - The 3- or 6-character hex code.
     * @returns {string} The 6-character hex code.
     */
    HexCodeSuggester.prototype.expandToFullHex = function (hexSegment) {
        if (typeof hexSegment !== "string") {
            return "";
        }
        if (hexSegment.length === 6) {
            return hexSegment;
        }
        if (hexSegment.length === 3) {
            // Expand each character by repeating it.
            return hexSegment.charAt(0).repeat(2) +
                   hexSegment.charAt(1).repeat(2) +
                   hexSegment.charAt(2).repeat(2);
        }
        // For any other length, return as-is or an empty string as a fallback.
        return hexSegment;
    };

    /**
     * Attempts to condense a 6-character hex code to a 3-character form if possible.
     * Returns the original 6-character code if it cannot be condensed.
     * @param {string} hexSegment - The 3- or 6-character hex code.
     * @returns {string} The 3-character hex code if condesable, otherwise the original.
     */
    HexCodeSuggester.prototype.condenseToShortHex = function (hexSegment) {
        if (typeof hexSegment !== "string" || hexSegment.length !== 6) {
            return hexSegment; // Only 6-char codes can be condensed.
        }

        // Check if each pair of characters is identical.
        const isRedCondensable   = hexSegment.charAt(0) === hexSegment.charAt(1);
        const isGreenCondensable = hexSegment.charAt(2) === hexSegment.charAt(3);
        const isBlueCondensable  = hexSegment.charAt(4) === hexSegment.charAt(5);

        if (isRedCondensable && isGreenCondensable && isBlueCondensable) {
            return hexSegment.charAt(0) + hexSegment.charAt(2) + hexSegment.charAt(4);
        } else {
            return hexSegment; // Cannot be condensed, return original.
        }
    };

    /**
     * Determines if the current editor context allows for hex color code suggestions.
     * Suggestions are offered when the user types a '#' character.
     * @param {CodeMirror.Editor} editorInstance - The current CodeMirror editor.
     * @param {string} triggeringChar - The character that triggered the hint request.
     * @returns {boolean} True if hints can be provided, false otherwise.
     */
    HexCodeSuggester.prototype.canOfferSuggestions = function (editorInstance, triggeringChar) {
        // Store the editor instance for later use in other methods.
        this.currentEditor = editorInstance;

        // Hints are primarily triggered by the '#' symbol.
        // A direct check for the triggering character is sufficient.
        const isHashTrigger = (triggeringChar === HASH_SYMBOL);

        // Optionally, add more complex logic here if needed, e.g., check document type.
        // For now, only the implicit character matters.
        return isHashTrigger;
    };

    /**
     * Generates and returns a list of hex color suggestions based on the current input.
     * @param {string} triggeringChar - The character that triggered the hint request.
     * @returns {object|null} An object containing the hints and metadata, or null if no hints.
     */
    HexCodeSuggester.prototype.generateSuggestions = function (triggeringChar) {
        // Ensure an editor is active.
        if (!this.currentEditor) {
            return null;
        }

        // Get the current cursor position to query context.
        const currentCursorPosition = this.currentEditor.getCursorPos();

        // Retrieve contextual information from the CSS language utilities.
        this.syntaxContext = StyleLanguageUtilities.getInfoAtPos(this.currentEditor, currentCursorPosition);

        // Get the current text fragment typed by the user.
        const inputFragment = (this.syntaxContext && this.syntaxContext.values && this.syntaxContext.values[0]) || "";

        // Regular expression to validate if the typed fragment is a potential hex color.
        // It must start with '#' and contain only hex characters.
        const hexInputPattern = new RegExp(`^${HASH_SYMBOL}[0-9a-fA-F]*$`);

        // Check if the input is a valid hex candidate and if it's not yet complete (max 6 chars after #).
        const isValidHexCandidate = hexInputPattern.test(inputFragment);
        const isInputIncomplete = (inputFragment.length <= 7); // # + 6 chars max

        // If it's not a hex candidate or it's already a complete 6-char hex (e.g., #FF00FF),
        // then no further hints are needed.
        if (!isValidHexCandidate || !isInputIncomplete) {
            return null;
        }

        // Retrieve the list of all unique, filtered, and sorted hex colors.
        const availableColors = this.discoverAllHexCodes();

        // If no colors are found, return null to indicate no suggestions.
        if (availableColors.length === 0) {
            return null;
        }

        // Return the structured hint object as expected by the CompletionManager.
        return {
            hints: availableColors,
            match: null, // Let the manager handle matching based on the filter.
            selectInitial: true, // Automatically select the first hint.
            handleWideResults: false // Do not stretch hint list for wide results.
        };
    };

    /**
     * Inserts the selected hint into the editor at the correct position.
     * @param {string} selectedHint - The HTML-formatted string of the selected hint.
     * @returns {boolean} True if the hint was inserted, false otherwise.
     */
    HexCodeSuggester.prototype.applySuggestion = function (selectedHint) {
        if (!this.currentEditor || !this.syntaxContext) {
            return false;
        }

        // Extract the raw hex code from the hint string.
        const colorToInsert = this.extractHexValue(selectedHint);
        if (!colorToInsert) {
            return false;
        }

        // Calculate the starting position for replacement.
        // The offset indicates how many characters before the cursor the current
        // value (e.g., "#abc") starts. We want to replace from the hash symbol.
        const prefixLength = this.syntaxContext.offset - 1; // Subtract 1 for the hash symbol itself.

        // Get the current cursor position.
        const insertionPoint = this.currentEditor.getCursorPos();

        // Determine the start of the replacement range.
        const replacementStartPos = {
            line: insertionPoint.line,
            ch: insertionPoint.ch - prefixLength
        };

        // Brackets often uses CodeMirror directly for advanced operations.
        // This direct access is a common pattern in Brackets extensions.
        try {
            this.currentEditor._codeMirror.replaceRange(HASH_SYMBOL + colorToInsert, replacementStartPos, insertionPoint);
            return true;
        } catch (error) {
            console.error("Error applying color suggestion:", error);
            return false;
        }
    };

    // Register the color hint provider when the application is ready.
    ApplicationInitializer.appReady(function () {
        const hexSuggesterInstance = new HexCodeSuggester();
        // Register for CSS, SCSS, and LESS files with a medium priority (0).
        CompletionManager.registerHintProvider(hexSuggesterInstance, ["css", "less", "scss"], 0);
    });
});