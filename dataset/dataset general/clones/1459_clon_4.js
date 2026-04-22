define(function (require, exports, module) {
    "use strict";

    const ApplicationBootstrapper = brackets.getModule("utils/AppInit");
    const CodeCompletionOverseer = brackets.getModule("editor/CodeHintManager");
    const DocumentContentAdministrator = brackets.getModule("document/DocumentManager");
    const StyleSheetAnalysisEngine = brackets.getModule("language/CSSUtils");
    const LanguageDefinitionHandler = brackets.getModule("language/LanguageManager"); // Retained for completeness, though not directly used in the color logic itself.

    /**
     * Encapsulates color transformation and comparison logic.
     */
    class ColorUtilities {
        /**
         * Converts a 3-digit hex color to its 6-digit equivalent, or returns the 6-digit as-is.
         * @param {string} shortOrFullHex - The 3 or 6 digit hex string (e.g., "abc", "aabbcc").
         * @returns {string} The 6-digit hex string.
         */
        static _expandToSixDigits(shortOrFullHex) {
            if (shortOrFullHex.length === 6) {
                return shortOrFullHex;
            }
            return shortOrFullHex.split('').map(c => c + c).join('');
        }

        /**
         * Attempts to shorten a 6-digit hex color to 3 digits if possible.
         * @param {string} fullHex - The 6-digit hex string.
         * @returns {string} The 3-digit hex string if possible, otherwise the original 6-digit string.
         */
        static _condenseToThreeDigits(fullHex) {
            if (fullHex.length === 3) {
                return fullHex;
            }
            if (fullHex[0] === fullHex[1] && fullHex[2] === fullHex[3] && fullHex[4] === fullHex[5]) {
                return fullHex[0] + fullHex[2] + fullHex[4];
            }
            return fullHex;
        }

        /**
         * Calculates the perceived luminance (brightness) of a 6-digit hex color.
         * @param {string} fullHex - The 6-digit hex string.
         * @returns {number} A numerical value representing brightness.
         */
        static _computeLuminance(fullHex) {
            const red = parseInt(fullHex.substring(0, 2), 16);
            const green = parseInt(fullHex.substring(2, 4), 16);
            const blue = parseInt(fullHex.substring(4, 6), 16);
            return ((red * 299) + (green * 587) + (blue * 114)) / 1000;
        }

        /**
         * Parses a raw hex code into a comprehensive color data object.
         * @param {string} rawHex - The 3 or 6 digit hex string (without '#').
         * @returns {object} An object containing various color representations and luminance.
         */
        static _processHexCode(rawHex) {
            const canonicalSix = ColorUtilities._expandToSixDigits(rawHex);
            const canonicalThree = ColorUtilities._condenseToThreeDigits(rawHex);
            const luminance = ColorUtilities._computeLuminance(canonicalSix);

            return {
                originalValue: rawHex,
                completeForm: canonicalSix,
                conciseForm: canonicalThree,
                luminanceValue: luminance
            };
        }

        /**
         * Compares two color data objects based on their luminance.
         * @param {object} colorA - First color data object.
         * @param {object} colorB - Second color data object.
         * @returns {number} -1 if A is brighter, 1 if B is brighter, 0 if equal.
         */
        static _compareLuminance(colorA, colorB) {
            if (colorA.luminanceValue < colorB.luminanceValue) {
                return -1;
            }
            if (colorA.luminanceValue > colorB.luminanceValue) {
                return 1;
            }
            return 0;
        }

        /**
         * Extracts the raw hex code from a formatted hint display string.
         * @param {string} displayString - The HTML string representing the hint.
         * @returns {string} The raw hex code.
         */
        static _extractCodeFromDisplay(displayString) {
            const lastChevronPosition = displayString.lastIndexOf(">");
            return displayString.slice(lastChevronPosition + 1);
        }
    }

    /**
     * Manages and provides color suggestions for CSS files.
     */
    class PaletteGuide {
        constructor() {
            this._currentTextSource = null;
            this._analysisReport = null;
        }

        /**
         * Determines if color suggestions are applicable at the current cursor position.
         * @param {object} activeEditor - The current editor instance.
         * @param {string} triggeringChar - The character that triggered the suggestion.
         * @returns {boolean} True if suggestions can be provided, false otherwise.
         */
        querySuggestions(activeEditor, triggeringChar) {
            this._currentTextSource = activeEditor;
            return triggeringChar === "#";
        }

        /**
         * Gathers and filters a list of hex color suggestions from the document.
         * @param {string} triggeringChar - The character that triggered the suggestion.
         * @returns {object|null} An object containing hints and metadata, or null if no hints are needed.
         */
        retrieveSuggestions(triggeringChar) {
            const currentPosition = this._currentTextSource.getCursorPos();
            this._analysisReport = StyleSheetAnalysisEngine.getInfoAtPos(this._currentTextSource, currentPosition);

            const userEntry = this._analysisReport.values[0];

            // Regex to validate if the typed input is a potential hex color.
            const hexInputPattern = /^#[a-f0-9]*$/i;
            const isValidHexPrefix = hexInputPattern.test(userEntry) && (userEntry.length < 7);

            if (!isValidHexPrefix) {
                return null;
            }

            const documentContent = this._currentTextSource.document.getText();
            const typedFilter = userEntry.slice(1).toLowerCase(); // Hex without '#'

            const processedColorCollection = new Map(); // Use a Map to ensure uniqueness by canonical 6-digit form.

            // Regex to find hex colors in the document, matching the original's extraction pattern.
            // This pattern specifically looks for hex codes preceded by a space or colon, and followed by non-word char or semicolon.
            const documentHexPattern = /[ :]#([0-9a-f]{3}|[0-9a-f]{6})[\W;]/ig;

            for (const match of documentContent.matchAll(documentHexPattern)) {
                const hexCodeFound = match[1].toLowerCase();
                const colorData = ColorUtilities._processHexCode(hexCodeFound);

                // Filter based on the typed input, checking both 3-digit and 6-digit forms.
                if (colorData && (colorData.conciseForm.startsWith(typedFilter) || colorData.completeForm.startsWith(typedFilter))) {
                    processedColorCollection.set(colorData.completeForm, colorData);
                }
            }

            const sortedHints = Array.from(processedColorCollection.values())
                .sort(ColorUtilities._compareLuminance)
                .map(colorData => {
                    // Generate the HTML display string for each hint.
                    return `<div style='display: inline-block; margin-right: 5px; height: 10px; width: 10px; background: #${colorData.conciseForm};'></div>${colorData.conciseForm}`;
                });

            return {
                hints: sortedHints,
                match: null, // No specific match needed for replacement range as we handle it in applySuggestion.
                selectInitial: true,
                handleWideResults: false
            };
        }

        /**
         * Inserts the selected color suggestion into the editor.
         * @param {string} selectedHintString - The HTML string of the selected hint.
         */
        applySuggestion(selectedHintString) {
            const insertionOffset = this._analysisReport.offset - 1; // Offset from start of typed token to the '#' character.
            const rawColorCode = ColorUtilities._extractCodeFromDisplay(selectedHintString);

            const activeDocument = DocumentContentAdministrator.getCurrentDocument();
            const currentCursorPosition = this._currentTextSource.getCursorPos();

            const replacementStart = {
                line: currentCursorPosition.line,
                ch: currentCursorPosition.ch - insertionOffset
            };

            // Directly interact with CodeMirror's replaceRange for insertion.
            this._currentTextSource._codeMirror.replaceRange(rawColorCode, replacementStart, currentCursorPosition);
        }
    }

    // Register the suggestion provider when the application is ready.
    ApplicationBootstrapper.appReady(function () {
        const colorSuggestionProvider = new PaletteGuide();
        CodeCompletionOverseer.registerHintProvider(colorSuggestionProvider, ["css", "scss", "less"], 0);
    });
});