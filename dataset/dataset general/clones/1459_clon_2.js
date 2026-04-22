/*
 * License for this utility:
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and its associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint   vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global    define, brackets, $, window */

define(function (requestModule, exposedAPI, currentModule) {
    "use strict";

    var ApplicationInitializer = brackets.getModule("utils/AppInit"),
        SuggestionProvider     = brackets.getModule("editor/CodeHintManager"),
        FileContentHandler     = brackets.getModule("document/DocumentManager"),
        StyleSheetUtilities    = brackets.getModule("language/CSSUtils"),
        SyntaxRegistry         = brackets.getModule("language/LanguageManager");
    
    /**
     * @constructor
     * This class offers color code suggestions within style sheets.
     */
    function HexColorSuggester() {
        
    }

    
    /**
     * Fetches the entire text content from the current CSS file.
     * @returns {string} The full text of the stylesheet.
     */
    HexColorSuggester.prototype.obtainStylesheetContent = function () {
        
        var documentText = this.textEditor.document.getText();
        
        return documentText;
        
    };
    
    /**
     * Extracts the pure hexadecimal color value from a hint string.
     * @param {string} inputString The string containing the hint and color.
     * @returns {string} The hexadecimal color code.
     */
    HexColorSuggester.prototype.extractColorValue = function(inputString){
        
        var lastArrowIndex = inputString.lastIndexOf(">");
        return inputString.substring(lastArrowIndex + 1);
        
    }
    
    /**
     * Compares the perceived brightness of two given color strings for sorting.
     * @param {string} itemA The first color hint string.
     * @param {string} itemB The second color hint string.
     * @returns {number} -1 if itemA is brighter, 1 if itemB is brighter, 0 if equal.
     */
    HexColorSuggester.prototype.evaluateLuminosity = function(itemA, itemB){
        
        var tempSuggester = new HexColorSuggester();
        
        // Retrieve the raw color codes
        var colorOne = tempSuggester.extractColorValue(itemA);
        var colorTwo = tempSuggester.extractColorValue(itemB);
        
        // Ensure both colors are in their six-character format
        var colorOneSix = tempSuggester.convertToFullHex(colorOne);
        var colorTwoSix = tempSuggester.convertToFullHex(colorTwo);
        
        // Compute the brightness for each color
        var lumOne = tempSuggester.computeLuminosity(colorOneSix);
        var lumTwo = tempSuggester.computeLuminosity(colorTwoSix);
        
        // Perform the comparison of brightness levels
        if(lumOne < lumTwo) { return -1; }
        if(lumOne > lumTwo) { return 1;  }
        return 0;
        
    }
    
    /**
     * Gathers all unique hexadecimal color codes found within the active document.
     * @returns {Array.<string>} An array of HTML strings representing color hints.
     */
    HexColorSuggester.prototype.retrieveAllColorCodes = function(){
        // Acquire the entire stylesheet content
        var fileContent = this.obtainStylesheetContent();
        
        // Regular expression to locate HEX color values (3 or 6 digits)
        var hexColorPattern = /[ :]#([0-9a-f]{3}|[0-9a-f]{6})[\W;]/ig;
        
        // The text typed by the user, used for filtering results
        var typedPrefix = this.inputData.values[0].substr(1).toLowerCase();
        
        var foundCodes = [];
        // Iterate through all matches in the content
        var currentMatch = null;
        while ((currentMatch = hexColorPattern.exec(fileContent)) !== null) {
            
            // Extract the hex code itself, without the '#'
            var hexCodePart = currentMatch[1].toLowerCase();
            
            // Convert to the full 6-character format for robust checking
            var longCheck = this.convertToFullHex(hexCodePart);
            
            // Attempt to shorten the code if possible for display
            hexCodePart = this.convertToShortHex(hexCodePart);
            
            // Skip this color if it doesn't match the user's typed input
            if(hexCodePart.indexOf(typedPrefix) !== 0 && longCheck.indexOf(typedPrefix) !== 0){
                continue;
            }
            
            var displayMarkup = "<div style='display: inline-block; margin-right: 5px; height: 10px; width: 10px; background: #" + hexCodePart + ";'></div>" + hexCodePart;
            
            // Only add the color to the list if it's not already present
            if(foundCodes.indexOf(displayMarkup) === -1){
                foundCodes.push(displayMarkup);
            }
            
        }
        
        // Sort the collection of colors by their brightness
        foundCodes = foundCodes.sort(this.evaluateLuminosity);
        
        return foundCodes;
    }
    
    /**
     * Computes the relative brightness of a given hexadecimal color string.
     * Expects a six-character hex code. Higher values indicate brighter colors.
     * 
     * @param {string} hexString The 6-character hexadecimal color code.
     * @returns {number} The calculated brightness value.
     */
    HexColorSuggester.prototype.computeLuminosity = function(hexString){
        var redVal   = parseInt(hexString.substr(0, 2), 16);
        var greenVal = parseInt(hexString.substr(2, 2), 16);
        var blueVal  = parseInt(hexString.substr(4, 2), 16);

        return ((redVal * 299) + (greenVal * 587) + (blueVal * 114)) / 1000;
    }
    
    
    /**
     * Converts a 3-character hex color to its 6-character equivalent.
     * If already 6 characters, it returns the original string.
     * @param {string} shortColor The color string to convert.
     * @returns {string} The 6-character hex color string.
     */
    HexColorSuggester.prototype.convertToFullHex = function(shortColor){
        if(shortColor.length === 6){
            return shortColor;
        }
        else{
            return shortColor.charAt(0) + shortColor.charAt(0) + shortColor.charAt(1) + shortColor.charAt(1) + shortColor.charAt(2) + shortColor.charAt(2);
        }
    }
    
    /**
     * Converts a 6-character hex color to its 3-character equivalent if possible.
     * If not convertible, or already 3 characters, returns the original.
     * @param {string} longColor The color string to convert.
     * @returns {string} The 3-character (or original) hex color string.
     */
    HexColorSuggester.prototype.convertToShortHex = function(longColor){
        if(longColor.length === 3){
            return longColor;
        }
        else if(longColor.charAt(0) === longColor.charAt(1) && longColor.charAt(2) === longColor.charAt(3) && longColor.charAt(4) === longColor.charAt(5)){
            return longColor.charAt(0) + longColor.charAt(2) + longColor.charAt(4);
        }
        else{
            return longColor;
        }
    }
    
    /**
     * Determines if color code suggestions can be offered at the current cursor position.
     * @param {Object} editorInstance The current code editor instance.
     * @param {string} triggerChar The character that initiated the hint request.
     * @returns {boolean} True if hints can be provided, false otherwise.
     */
    HexColorSuggester.prototype.canProvideSuggestions = function (editorInstance, triggerChar) {
        
        this.textEditor = editorInstance;
        
        return triggerChar ? triggerChar === "#" : false;
        
    };

    /**
     * Generates a list of potential color hints based on the current input context.
     * @param {string} triggerSymbol The character that triggered the hint request.
     * @returns {Object|null} An object containing hints and related metadata, or null if no hints.
     */
    HexColorSuggester.prototype.generateSuggestions = function (triggerSymbol) {
        
        // Obtain the present cursor location
        var currentPosition = this.textEditor.getCursorPos();
        
        // Gather contextual information about the currently typed value
        this.inputData = StyleSheetUtilities.getInfoAtPos(this.textEditor, currentPosition);
        
        // The actual value entered by the user
        var userTypedInput = this.inputData.values[0];
        
        // Regular expression to validate a hexadecimal color string
        var hexValidationPattern = /^#[a-f0-9]*$/i;
        
        // Check if the input is a valid hex color format and if more input is expected
        var isHexCandidate = hexValidationPattern.test(userTypedInput) && (userTypedInput.length < 7);

        // If the input is not a hex color or is already complete, do not offer hints
        if(!isHexCandidate){
            return null;
        }
        
        var suggestedColors = this.retrieveAllColorCodes();
        
        return {
            hints: suggestedColors,
            match: null,
            selectInitial: true,
            handleWideResults: false
        };

    };
    
    /**
     * Inserts the selected color hint into the editor at the appropriate position.
     * @param {string} chosenHint The selected hint string to insert.
     */
    HexColorSuggester.prototype.applySuggestion = function (chosenHint) {
        
        // Calculate the character offset from the start of the hex code (after '#')
        var hashOffset = this.inputData.offset - 1;
        
        // Extract the raw color code from the hint string
        var colorCodeToInsert = this.extractColorValue(chosenHint);
        
        // Access the currently active document
        var activeDocument = FileContentHandler.getCurrentDocument();
        
        // Get the current insertion point within the document
        var insertionPoint = this.textEditor.getCursorPos();
        
        // Determine the starting range for replacement
        var startRange = {line: insertionPoint.line , ch: insertionPoint.ch - hashOffset};
        
        // Replace the existing partial color code with the full selected color
        // Using internal CodeMirror instance for direct manipulation
        this.textEditor._codeMirror.replaceRange(colorCodeToInsert, startRange, insertionPoint);
        
    };
    
    ApplicationInitializer.appReady(function () {
        var localColorSuggester = new HexColorSuggester();
        SuggestionProvider.registerHintProvider(localColorSuggester, ["css", "scss", "less"], 0);
    });
});