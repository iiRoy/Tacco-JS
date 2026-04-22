/*
 *  This is a generated Type I clone.
 *  The original license and copyright information are preserved below.
 */

/*
The MIT License (MIT)

Copyright (c) 2014 Andrew MacKenzie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// JSLint directives from original code:
/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/* global define, brackets, $ */


define(
    function (
        require,
        exports,
        module
    ) {
        "use strict";

        // Declare core Brackets modules used
        var AppInit = brackets.getModule("utils/AppInit")
            , CodeHintManager = brackets.getModule("editor/CodeHintManager")
            , ExtensionUtils = brackets.getModule("utils/ExtensionUtils")
            , TokenUtils = brackets.getModule("utils/TokenUtils")
            , PreferencesManager = brackets.getModule("preferences/PreferencesManager")
            ;
        // Get extension preferences
        var prefs = PreferencesManager.getExtensionPrefs("php-sig.php-smarthints");

        // Load strings for localization
        var Strings = require('strings');

        // PHP data modules
        var phpBuiltins = require("phpdata/php-predefined")
            , functionGroups = require("text!phpdata/php-function-groups.json")
            , predefinedFunctions = []
            ;

        // UI elements and project-related utilities
        var toolbarIcon = $('<a title="' + Strings.EXTENSION_NAME + '" id="PHPSmartHints-icon"></a>')
            , filters = []
            , projectUI = require("project-ui")
            ;

        /**
         * Extracts the token string up to the cursor position.
         * @param {Object} token - The token object from TokenUtils.
         * @returns {string} The substring of the token leading up to the cursor.
         */
        function getTokenToCursor(
            token
        ) {
            var tokenStart = token.token.start;
            var tokenCursor = token.pos.ch;
            var tokenString = token.token.string;
            return tokenString.substr(0, (tokenCursor - tokenStart));
        }

        /**
         * @constructor
         * Provides PHP code hints.
         */
        function PHPHints(
        ) {
            this.activeToken = "";
            this.lastToken = "";
            this.cachedPhpVariables = [];
            this.cachedPhpConstants = [];
            this.cachedPhpKeywords = [];
            this.cachedPhpFunctions = [];
            this.cachedLocalVariables = [];
            // Regex for PHP variables starting with '$'
            this.tokenVariable = /[$][\a-zA-Z_][a-zA-Z0-9_]*/g;
        }

        /**
         * Determines if hints are available for the current context.
         * @param {Editor} editor - The current editor instance.
         * @param {string} implicitChar - The character that triggered the hint request, or null.
         * @returns {boolean} True if hints are available, false otherwise.
         */
        PHPHints.prototype.hasHints = function (
            editor,
            implicitChar
        ) {
            this.editor = editor;
            var i = 0;
            var cursor = editor.getCursorPos();
            var tokenToCursor = "";

            this.activeToken = TokenUtils.getInitialContext(this.editor._codeMirror, cursor);

            // If the implicit character is '$' or the token starts with '$',
            // we always provide hints for variables.
            if (implicitChar === "$" || this.activeToken.token.string.charAt(0) === "$") {
                return true;
            }

            tokenToCursor = getTokenToCursor(this.activeToken);

            // Check for hints if the token has more than one character or if it's an explicit request (implicitChar is null).
            if (this.activeToken.token.string.length > 1 || implicitChar === null) {

                // Prioritize keywords as they are a smaller, common set.
                for (i = 0; i < this.cachedPhpKeywords.length; i++) {
                    if (this.cachedPhpKeywords[i].toLowerCase().indexOf(tokenToCursor.toLowerCase()) === 0) {
                        return true;
                    }
                }

                // Next, check constants.
                for (i = 0; i < this.cachedPhpConstants.length; i++) {
                    if (this.cachedPhpConstants[i].toLowerCase().indexOf(tokenToCursor.toLowerCase()) === 0) {
                        return true;
                    }
                }

                // Finally, check functions, which is the largest list.
                for (i = 0; i < this.cachedPhpFunctions.length; i++) {
                    if (this.cachedPhpFunctions[i].toLowerCase().indexOf(tokenToCursor.toLowerCase()) === 0) {
                        return true;
                    }
                }
            }
            // No hints found for the current context.
            return false;
        };

        /**
         * Retrieves the list of hints for the current context.
         * @param {string} implicitChar - The character that triggered the hint request, or null.
         * @returns {Object} An object containing the hints list, match status, and selection preferences.
         */
        PHPHints.prototype.getHints = function (
            implicitChar
        ) {
            var i = 0;
            var hintList = [];
            var localVarList = [];
            var phpVarList = [];
            var phpFuncList = [];
            var phpConstList = [];
            var phpKeywordList = [];
            var $fHint;
            var cursor = this.editor.getCursorPos();
            var tokenToCursor = "";

            this.activeToken = TokenUtils.getInitialContext(this.editor._codeMirror, cursor);
            tokenToCursor = getTokenToCursor(this.activeToken);

            // If it's a $variable context, build the local variable list first.
            if (implicitChar === "$" || this.activeToken.token.string.charAt(0) === "$") {
                // Re-cache local variables only if the token has changed or moved to a new line.
                if ((this.lastToken === "") || (this.activeToken.token.start !== this.lastToken.token.start) || (this.activeToken.pos.line !== this.lastToken.pos.line)) {
                    this.cachedLocalVariables.length = 0; // Clear existing cache
                    var varList = this.editor.document.getText().match(this.tokenVariable);
                    if (varList) {
                        for (i = 0; i < varList.length; i++) {
                            var word = varList[i];
                            if (this.cachedLocalVariables.indexOf(word) === -1) {
                                this.cachedLocalVariables.push(word);
                            }
                        }
                    }
                }
                this.lastToken = this.activeToken;

                if (this.cachedLocalVariables === null) {
                    return null;
                }
                this.cachedLocalVariables.sort();

                // Add unique local $variables matching the token.
                for (i = 0; i < this.cachedLocalVariables.length; i++) {
                    if (this.cachedLocalVariables[i].indexOf(tokenToCursor.toLowerCase()) === 0) {
                        $fHint = $("<span>")
                            .addClass("PHPSmartHints-completion")
                            .addClass("PHPSmartHints-completion-localvar")
                            .text(this.cachedLocalVariables[i]);
                        localVarList.push($fHint);
                    }
                }

                // Load predefined $variables.
                for (i = 0; i < this.cachedPhpVariables.length; i++) {
                    if (this.cachedPhpVariables[i].toLowerCase().indexOf(tokenToCursor.toLowerCase()) === 0) {
                        $fHint = $("<span>")
                            .addClass("PHPSmartHints-completion")
                            .addClass("PHPSmartHints-completion-phpvar")
                            .text(this.cachedPhpVariables[i]);
                        phpVarList.push($fHint);
                    }
                }
                // Concatenate local and predefined variables.
                hintList = localVarList.concat(phpVarList);
            } else {
                // Not a $variable, so check for keywords, constants, and functions.

                // Load keywords that match.
                for (i = 0; i < this.cachedPhpKeywords.length; i++) {
                    if (this.cachedPhpKeywords[i].toLowerCase().indexOf(tokenToCursor.toLowerCase()) === 0) {
                        $fHint = $("<span>")
                            .addClass("PHPSmartHints-completion")
                            .addClass("PHPSmartHints-completion-phpkeyword")
                            .text(this.cachedPhpKeywords[i]);
                        phpKeywordList.push($fHint);
                    }
                }

                // Load constants that match.
                for (i = 0; i < this.cachedPhpConstants.length; i++) {
                    if (this.cachedPhpConstants[i].toLowerCase().indexOf(tokenToCursor.toLowerCase()) === 0) {
                        $fHint = $("<span>")
                            .addClass("PHPSmartHints-completion")
                            .addClass("PHPSmartHints-completion-phpconstant")
                            .text(this.cachedPhpConstants[i]);
                        phpConstList.push($fHint);
                    }
                }

                // Load functions that match.
                for (i = 0; i < this.cachedPhpFunctions.length; i++) {
                    if (this.cachedPhpFunctions[i].toLowerCase().indexOf(tokenToCursor.toLowerCase()) === 0) {
                        $fHint = $("<span>")
                            .addClass("PHPSmartHints-completion")
                            .addClass("PHPSmartHints-completion-phpfunction")
                            .text(this.cachedPhpFunctions[i]);
                        phpFuncList.push($fHint);
                    }
                }
                // Combine and sort all hint lists (keywords, constants, functions).
                hintList = phpKeywordList.concat(phpConstList, phpFuncList).sort();
            }

            return {
                hints: hintList,
                match: false,
                selectInitial: true,
                handleWideResults: false
            };
        };

        /**
         * Inserts the selected hint into the editor.
         * @param {jQueryObject} $hint - The jQuery object representing the selected hint.
         * @returns {boolean} False to indicate that the hint manager should not handle further actions.
         */
        PHPHints.prototype.insertHint = function (
            $hint
        ) {
            var cursor = this.editor.getCursorPos();
            var currentToken = this.editor._codeMirror.getTokenAt(cursor);
            var replaceStart = {
                line: cursor.line,
                ch: currentToken.start
            };
            var replaceEnd = {
                line: cursor.line,
                ch: cursor.ch
            };

            this.editor.document.replaceRange($hint.text(), replaceStart, replaceEnd);
            return false;
        };

        // Instantiate the PHPHints provider
        var phpHints = new PHPHints();

        /**
         * Builds the list of PHP functions based on selected groups.
         * @param {Array<string>} selectedFunctions - Array of keys for selected function groups.
         * @returns {Array<string>} A combined list of function names.
         */
        function buildFunctionsList(
            selectedFunctions
        ) {
            var i = 0;
            var filter;
            var fnArray = [];
            var fg = JSON.parse(functionGroups);
            var fgKey;
            var theFunctionList = [];

            // Reset filters array
            filters.length = 0;

            Object.keys(fg).forEach(function (
                key
            ) {
                fgKey = fg[key];

                if (selectedFunctions.length > 0) {
                    if (selectedFunctions.indexOf(key) > -1) {
                        fnArray = fgKey.fnNames;
                        for (i = 0; i < fnArray.length; i++) {
                            theFunctionList.push(fnArray[i]);
                        }
                        filter = {
                            "filter": key,
                            "filterName": fgKey.name,
                            "checked": "checked"
                        };
                    } else {
                        filter = {
                            "filter": key,
                            "filterName": fgKey.name,
                            "checked": ""
                        };
                    }
                } else {
                    // If no specific functions are selected, include all.
                    fnArray = fgKey.fnNames;
                    for (i = 0; i < fnArray.length; i++) {
                        theFunctionList.push(fnArray[i]);
                    }
                    filter = {
                        "filter": key,
                        "filterName": fgKey.name,
                        "checked": "checked"
                    };
                }
                filters.push(filter);
            });
            // Combine with globally predefined functions.
            return theFunctionList.concat(predefinedFunctions);
        }

        /**
         * Creates a unique, sorted array from a raw list of strings.
         * @param {Array<string>} rawList - The initial list of strings.
         * @returns {Array<string>} A sorted array with unique strings.
         */
        function createHintArray(
            rawList
        ) {
            var sortedRawList = rawList.sort();
            var i = 0;
            var currentWord = "";
            var finalList = [];

            for (i = 0; i < sortedRawList.length; i++) {
                currentWord = sortedRawList[i];
                if (finalList.indexOf(currentWord) === -1) {
                    finalList.push(currentWord);
                }
            }
            return finalList;
        }

        /**
         * Handles changes to the filtered function list preference.
         * Updates the cached PHP functions in the hint provider.
         * @param {Array<string>} selectedFunctions - The currently selected function groups.
         */
        function handleFunctionPrefs(
            selectedFunctions
        ) {
            var fnList = [];
            fnList = buildFunctionsList(selectedFunctions);
            phpHints.cachedPhpFunctions.length = 0; // Clear previous cache
            phpHints.cachedPhpFunctions = createHintArray(fnList);
        }

        /**
         * Handles changes to the isPhpProject preference.
         * Updates the toolbar icon's active state.
         * @param {boolean} isPhpProject - True if the current project is a PHP project, false otherwise.
         */
        function handlePhpProjectPrefs(
            isPhpProject
        ) {
            if (isPhpProject) {
                toolbarIcon.addClass('active');
            } else {
                toolbarIcon.removeClass('active');
            }
        }

        // Initialize extension when Brackets is ready
        AppInit.appReady(function (
        ) {
            // Set predefined functions from builtins
            predefinedFunctions = phpBuiltins.predefinedFunctions;

            // Define and watch preferences for PHP SmartHints
            prefs.definePreference("filteredFunctionList", "array", [])
                .on("change", function () {
                    handleFunctionPrefs(prefs.get("filteredFunctionList", {
                        location: {
                            scope: "project"
                        }
                    }));
                });

            prefs.definePreference("isPhpProject", "boolean", false)
                .on("change", function () {
                    handlePhpProjectPrefs(prefs.get("isPhpProject", {
                        location: {
                            scope: "project"
                        }
                    }));
                });

            // Apply initial preference values
            handleFunctionPrefs(prefs.get("filteredFunctionList", {
                location: {
                    scope: "project"
                }
            }));
            handlePhpProjectPrefs(prefs.get("isPhpProject", {
                location: {
                    scope: "project"
                }
            }));

            // Register the PHP hint provider with a high priority for PHP files
            CodeHintManager.registerHintProvider(phpHints, ["php"], 10);

            // Cache other PHP hint types
            phpHints.cachedPhpKeywords = createHintArray(phpBuiltins.keywords);
            phpHints.cachedPhpConstants = createHintArray(phpBuiltins.predefinedConstants);
            phpHints.cachedPhpVariables = createHintArray(phpBuiltins.predefinedVariables);

            // Load CSS for the extension
            ExtensionUtils.loadStyleSheet(module, "css/main.css");

            // Append toolbar icon and set up click handler
            toolbarIcon.appendTo('#main-toolbar .buttons')
                .on("click", function (
                ) {
                    projectUI.showProjectDialog(filters);
                });
        });
    }
);