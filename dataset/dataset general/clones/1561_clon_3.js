/*
 * Alternative PHP Hinting Module
 *
 * This software is provided under the MIT License.
 *
 * Copyright (c) 2014 A. MacKenzie (Original work)
 * Copyright (c) 2023 [Your Name/Company Here] (Modifications)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* global define, brackets, $ */
/* eslint-disable no-unused-vars, no-shadow, no-console */

define((require, exports, module) => {
    "use strict";

    const ModuleInitializer        = brackets.getModule("utils/AppInit"),
          HintProviderRegistry     = brackets.getModule("editor/CodeHintManager"),
          UtilityExtension         = brackets.getModule("utils/ExtensionUtils"),
          SyntaxTokenUtil          = brackets.getModule("utils/TokenUtils"),
          ConfigurationManager     = brackets.getModule("preferences/PreferencesManager"),
          extensionConfiguration   = ConfigurationManager.getExtensionPrefs("php.smart-code-suggestions");

    const LocalizationStrings      = require('strings');

    const phpCoreDefinitions       = require("phpdata/php-predefined"),
          functionCategoryJson     = require("text!phpdata/php-function-groups.json"),
          coreFunctionSet          = []; // Array to hold predefined PHP functions

    const uiToggleElement          = $('<a title="' + LocalizationStrings.EXTENSION_NAME + '" id="php-suggestion-toggle-icon"></a>'),
          functionFilterOptions    = [],
          projectSettingsInterface = require("project-ui");

    /**
     * Extracts the relevant part of a token up to the current cursor position.
     * @param {object} tokenInfo - Object containing token and cursor position.
     * @returns {string} The substring of the token from its start to the cursor.
     */
    function extractTokenFragment(tokenInfo) {
        const { token, pos } = tokenInfo;
        // Ensure valid token and position to prevent errors
        if (!token || typeof token.start !== 'number' || typeof pos.ch !== 'number') {
            return '';
        }
        const fragmentStartOffset = token.start;
        const fragmentEndOffset = pos.ch;
        // If the fragment end is before or at the start, return empty
        if (fragmentEndOffset <= fragmentStartOffset) {
            return '';
        }
        return token.string.slice(0, fragmentEndOffset - fragmentStartOffset);
    }

    /**
     * @class PhpCodeSuggestionEngine
     * @description Manages and provides code hints for PHP.
     */
    function PhpCodeSuggestionEngine() {
        this.currentEditorContext   = null;
        this.activeCursorToken      = null;
        this.previousCursorToken    = null; // Used to detect changes in token for local variable caching
        this.variableRegexPattern   = /\$[_a-zA-Z][_a-zA-Z0-9]*/g; // Regex for PHP variable names

        // Cached suggestion lists
        this.phpGlobalVariables     = [];
        this.phpGlobalConstants     = [];
        this.phpLanguageKeywords    = [];
        this.phpBuiltinFunctions    = [];
        this.localScopeVariables    = [];
    }

    /**
     * Determines if hints are available for the current cursor position.
     * @param {CodeMirror.Editor} activeEditor - The current CodeMirror editor instance.
     * @param {string|null} triggerCharacter - The character that triggered the hint, or null if implicit.
     * @returns {boolean} True if hints are available, false otherwise.
     */
    PhpCodeSuggestionEngine.prototype.checkAvailability = function (activeEditor, triggerCharacter) {
        this.currentEditorContext = activeEditor;
        const currentCursorPosition = activeEditor.getCursorPos();
        this.activeCursorToken = SyntaxTokenUtil.getInitialContext(activeEditor._codeMirror, currentCursorPosition);

        const tokenContent = this.activeCursorToken.token.string;

        // Immediate hint for '$' character or token starting with '$'
        if (triggerCharacter === "$" || tokenContent.startsWith("$")) {
            return true;
        }

        const fragmentToMatch = extractTokenFragment(this.activeCursorToken);

        // No hints if fragment is empty and no specific trigger
        if (!fragmentToMatch && triggerCharacter !== null) {
            return false;
        }

        // Only provide hints if token length is greater than 1 or an explicit request (triggerCharacter is null)
        if (tokenContent.length > 1 || triggerCharacter === null) {
            const lowerCaseFragment = fragmentToMatch.toLowerCase();

            // Prioritize keywords (small and common)
            if (this.phpLanguageKeywords.some(keyword => keyword.toLowerCase().startsWith(lowerCaseFragment))) {
                return true;
            }

            // Then constants
            if (this.phpGlobalConstants.some(constant => constant.toLowerCase().startsWith(lowerCaseFragment))) {
                return true;
            }

            // Finally, functions (largest list)
            if (this.phpBuiltinFunctions.some(func => func.toLowerCase().startsWith(lowerCaseFragment))) {
                return true;
            }
        }
        return false;
    };

    /**
     * Retrieves the list of hints based on the current context.
     * @param {string|null} triggerCharacter - The character that triggered the hint, or null if implicit.
     * @returns {object|null} An object containing the hints array and metadata, or null if no hints.
     */
    PhpCodeSuggestionEngine.prototype.retrieveSuggestions = function (triggerCharacter) {
        const currentCursorPosition = this.currentEditorContext.getCursorPos();
        this.activeCursorToken = SyntaxTokenUtil.getInitialContext(this.currentEditorContext._codeMirror, currentCursorPosition);
        const fragmentToMatch = extractTokenFragment(this.activeCursorToken);
        const lowerCaseFragment = fragmentToMatch.toLowerCase();

        const suggestionElements = [];
        const createHintSpan = (text, typeClass) => $("<span>")
            .addClass("php-smart-hint-item")
            .addClass(`php-smart-hint-${typeClass}`)
            .text(text);

        // Handle variable suggestions (local and global)
        if (triggerCharacter === "$" || this.activeCursorToken.token.string.startsWith("$")) {
            // Re-scan local variables only if the token or line has changed
            const isSameTokenPosition = this.previousCursorToken &&
                                        this.activeCursorToken.token.start === this.previousCursorToken.token.start &&
                                        this.activeCursorToken.pos.line === this.previousCursorToken.pos.line;

            if (!isSameTokenPosition) {
                this.localScopeVariables.length = 0; // Clear previous local variables
                const documentText = this.currentEditorContext.document.getText();
                const matchedVariables = documentText.match(this.variableRegexPattern);

                if (matchedVariables) {
                    // Use a Set for efficient deduplication before adding to array
                    const uniqueLocalVars = new Set(matchedVariables);
                    this.localScopeVariables = Array.from(uniqueLocalVars).sort();
                }
            }
            this.previousCursorToken = this.activeCursorToken;

            // Add matching local variables
            this.localScopeVariables.forEach(variable => {
                if (variable.toLowerCase().startsWith(lowerCaseFragment)) {
                    suggestionElements.push(createHintSpan(variable, "local-variable"));
                }
            });

            // Add matching predefined PHP variables
            this.phpGlobalVariables.forEach(variable => {
                if (variable.toLowerCase().startsWith(lowerCaseFragment)) {
                    suggestionElements.push(createHintSpan(variable, "global-variable"));
                }
            });
        } else {
            // Handle keywords, constants, and functions
            const keywordSuggestions = this.phpLanguageKeywords
                .filter(keyword => keyword.toLowerCase().startsWith(lowerCaseFragment))
                .map(keyword => createHintSpan(keyword, "keyword"));

            const constantSuggestions = this.phpGlobalConstants
                .filter(constant => constant.toLowerCase().startsWith(lowerCaseFragment))
                .map(constant => createHintSpan(constant, "constant"));

            const functionSuggestions = this.phpBuiltinFunctions
                .filter(func => func.toLowerCase().startsWith(lowerCaseFragment))
                .map(func => createHintSpan(func, "function"));

            // Concatenate and sort all non-variable suggestions
            suggestionElements.push(...keywordSuggestions, ...constantSuggestions, ...functionSuggestions);
            suggestionElements.sort((a, b) => $(a).text().localeCompare($(b).text())); // Sort jQuery elements by text content
        }

        if (suggestionElements.length === 0 && fragmentToMatch.length < 1) {
            return null; // No hints to show if no match and fragment is empty
        }

        return {
            hints: suggestionElements,
            match: false, // Indicates if the match is exact or partial
            selectInitial: true,
            handleWideResults: false
        };
    };

    /**
     * Inserts the selected hint into the editor.
     * @param {jQuery} $selectedHint - The jQuery object of the selected hint element.
     * @returns {boolean} True if hint was inserted, false otherwise.
     */
    PhpCodeSuggestionEngine.prototype.applySuggestion = function ($selectedHint) {
        const currentCursorPosition = this.currentEditorContext.getCursorPos();
        const tokenAtCursor = this.currentEditorContext._codeMirror.getTokenAt(currentCursorPosition);

        // Define the range to replace: from token start to current cursor position
        const replacementRangeStart = { line: currentCursorPosition.line, ch: tokenAtCursor.start };
        const replacementRangeEnd = { line: currentCursorPosition.line, ch: currentCursorPosition.ch };

        const hintText = $selectedHint.text();
        this.currentEditorContext.document.replaceRange(hintText, replacementRangeStart, replacementRangeEnd);

        // Return false to indicate that the hint manager should not close the hint list
        // if another hint could immediately follow (e.g., for chained calls).
        // For simplicity here, we'll just close it.
        return false;
    };

    const phpSuggestionInstance = new PhpCodeSuggestionEngine();

    /**
     * Constructs the list of PHP functions based on user preferences.
     * @param {Array<string>} userSelectedFunctionCategories - Array of category keys selected by the user.
     * @returns {Array<string>} A combined and filtered list of function names.
     */
    function assembleFunctionCatalog(userSelectedFunctionCategories) {
        let allFunctions = [];
        const parsedFunctionGroups = JSON.parse(functionCategoryJson);

        // Clear existing filter options before repopulating
        functionFilterOptions.length = 0;

        Object.keys(parsedFunctionGroups).forEach(categoryKey => {
            const categoryData = parsedFunctionGroups[categoryKey];
            const isCategorySelected = userSelectedFunctionCategories.includes(categoryKey);

            if (userSelectedFunctionCategories.length === 0 || isCategorySelected) {
                // If no categories are explicitly selected, or this category is selected, include its functions
                allFunctions.push(...categoryData.fnNames);
            }

            // Prepare filter option for UI
            functionFilterOptions.push({
                filter: categoryKey,
                filterName: categoryData.name,
                checked: isCategorySelected ? "checked" : ""
            });
        });

        // Add the core predefined functions to the list
        allFunctions.push(...coreFunctionSet);

        return allFunctions;
    }

    /**
     * Processes a raw list of strings to remove duplicates and sort them alphabetically.
     * @param {Array<string>} rawStringList - The list to process.
     * @returns {Array<string>} A sorted array with unique string elements.
     */
    function deduplicateAndSort(rawStringList) {
        if (!Array.isArray(rawStringList)) {
            console.error("Input to deduplicateAndSort must be an array.");
            return [];
        }
        // Use Set for efficient deduplication, then convert back to Array and sort
        return Array.from(new Set(rawStringList)).sort((a, b) => a.localeCompare(b));
    }

    /**
     * Updates the cached PHP function list based on current preferences.
     * @param {Array<string>} selectedFunctionCategories - Array of function category keys.
     */
    function updateFunctionPreferences(selectedFunctionCategories) {
        const compiledFunctionList = assembleFunctionCatalog(selectedFunctionCategories);
        phpSuggestionInstance.phpBuiltinFunctions = deduplicateAndSort(compiledFunctionList);
    }

    /**
     * Updates the UI indicator for PHP project status.
     * @param {boolean} isPhpProjectActive - True if the current project is recognized as PHP.
     */
    function adjustProjectStatusIndicator(isPhpProjectActive) {
        if (isPhpProjectActive) {
            uiToggleElement.addClass('active');
        } else {
            uiToggleElement.removeClass('active');
        }
    }

    /**
     * Initializes the extension when the Brackets application is ready.
     * Sets up preferences, registers the hint provider, and loads UI.
     */
    ModuleInitializer.appReady(() => {
        // Populate the core predefined functions once
        coreFunctionSet.push(...phpCoreDefinitions.predefinedFunctions);

        // Define and observe preferences
        extensionConfiguration.definePreference("filteredFunctionList", "array", [])
            .on("change", () => {
                const currentFilteredList = extensionConfiguration.get("filteredFunctionList", { location: { scope: "project" } });
                updateFunctionPreferences(currentFilteredList);
            });

        extensionConfiguration.definePreference("isPhpProject", "boolean", false)
            .on("change", () => {
                const currentProjectStatus = extensionConfiguration.get("isPhpProject", { location: { scope: "project" } });
                adjustProjectStatusIndicator(currentProjectStatus);
            });

        // Apply initial preference values
        updateFunctionPreferences(extensionConfiguration.get("filteredFunctionList", { location: { scope: "project" } }));
        adjustProjectStatusIndicator(extensionConfiguration.get("isPhpProject", { location: { scope: "project" } }));

        // Register the hint provider for PHP files. Priority 10 ensures it's preferred.
        HintProviderRegistry.registerHintProvider(phpSuggestionInstance, ["php"], 10);

        // Populate other cached hint lists
        phpSuggestionInstance.phpLanguageKeywords = deduplicateAndSort(phpCoreDefinitions.keywords);
        phpSuggestionInstance.phpGlobalConstants = deduplicateAndSort(phpCoreDefinitions.predefinedConstants);
        phpSuggestionInstance.phpGlobalVariables = deduplicateAndSort(phpCoreDefinitions.predefinedVariables);

        // Load CSS and attach UI event handler
        UtilityExtension.loadStyleSheet(module, "css/main.css");
        uiToggleElement.appendTo('#main-toolbar .buttons')
            .on("click", () => {
                // Ensure filter options are up-to-date before showing the dialog
                const currentFilteredList = extensionConfiguration.get("filteredFunctionList", { location: { scope: "project" } });
                assembleFunctionCatalog(currentFilteredList); // This call updates functionFilterOptions
                projectSettingsInterface.showProjectDialog(functionFilterOptions);
            });
    });
});