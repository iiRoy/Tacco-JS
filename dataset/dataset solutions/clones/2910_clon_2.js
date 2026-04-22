"use strict";

// Helper function to convert an iterable to an array, handling various cases.
function _convertToArray(inputCollection) {
    return _grabArrayItems(inputCollection) || _iterateToArray(inputCollection) || _handleNonIterable();
}

// Helper function to iterate through an object or arguments and return an array.
function _iterateToArray(dataIterable) {
    // Check if the object is iterable or an arguments object.
    if (Symbol.iterator in Object(dataIterable) || Object.prototype.toString.call(dataIterable) === "[object Arguments]") {
        return Array.from(dataIterable);
    }
}

// Helper function for destructuring assignment, returning a slice of an array.
function _extractArraySegment(sourceArray, itemLimit) {
    return _grabArrayItems(sourceArray) || _iterateToArrayWithLimit(sourceArray, itemLimit) || _handleNonIterable();
}

// Helper function to throw an error if an attempt to destructure a non-iterable is made.
function _handleNonIterable() {
    throw new TypeError("Cannot destructure non-iterable instance. Invalid attempt.");
}

// Helper function to iterate through an array up to a certain limit.
function _iterateToArrayWithLimit(sourceArray, itemLimit) {
    var _tempArray = [];
    var _normalOperation = true;
    var _hadError = false;
    var _errorDetails = undefined;
    try {
        // Get iterator and loop through elements.
        for (var _sourceIterator = sourceArray[Symbol.iterator](), _currentEntry; !(_normalOperation = (_currentEntry = _sourceIterator.next()).done); _normalOperation = true) {
            _tempArray.push(_currentEntry.value);
            // Break if the limit is reached and it's defined.
            if (itemLimit && _tempArray.length === itemLimit) break;
        }
    } catch (processingIssue) {
        _hadError = true;
        _errorDetails = processingIssue;
    } finally {
        try {
            // Ensure iterator is closed if it wasn't a normal completion.
            if (!_normalOperation && _sourceIterator["return"] != null) {
                _sourceIterator["return"]();
            }
        } finally {
            // Re-throw error if one occurred.
            if (_hadError) throw _errorDetails;
        }
    }
    return _tempArray;
}

// Helper function to check if an input is an array.
function _grabArrayItems(potentialArray) {
    if (Array.isArray(potentialArray)) return potentialArray;
}

// Main application scope.
!function () {

    // Function to parse a string line into an array of integers.
    // Accepts either an array of strings or a single string.
    function parseNumbers(textSegment) {
        return (Array.isArray(textSegment) ? textSegment : textSegment.split(/\s+/)).map(function (numericString) {
            return parseInt(numericString, 10); // Explicitly use base 10 for parsing.
        });
    }

    // Immediately invoked function expression for core logic.
    !function (sourceText) {
        // Split the entire input into individual lines.
        var dataRows = sourceText.split("\n");

        // Parse the first line to get the number of switches (S) and lamps (L).
        var _parsedHeader = parseNumbers(dataRows[0]),
            _extractedHeader = _extractArraySegment(_parsedHeader, 2),
            totalSwitches = _extractedHeader[0], // Total number of available switches.
            totalLamps = _extractedHeader[1];   // Total number of lamps to control.

        // Process subsequent lines to define each lamp's properties.
        var lampObjects = dataRows.slice(1, totalLamps + 1).map(function (lampDescription, lampPosition) {
            // Parse the current lamp's description line.
            var _lampDataElements = parseNumbers(lampDescription),
                _switchConnectionInfo = _convertToArray(_lampDataElements),
                connectedSwitchesCount = _switchConnectionInfo[0],      // How many switches affect this lamp.
                associatedSwitchIndices = _switchConnectionInfo.slice(1); // The indices of those switches.

            // Return an object representing the lamp.
            return {
                connectedSwitchesCount: connectedSwitchesCount,
                associatedSwitchIndices: associatedSwitchIndices,
                lampPosition: lampPosition
            };
        });

        // Parse the line containing the required parity for each lamp.
        var expectedParities = parseNumbers(dataRows[totalLamps + 1]);
        // Initialize a counter for valid switch configurations.
        var validConfigurations = 0;

        // Outer loop: Iterate through all possible switch configurations.
        // There are 2^totalSwitches possible states.
        configLoop: for (var configIndex = 0; configIndex < Math.pow(2, totalSwitches); configIndex++) {
            var _loopRunningNormally = true;
            var _errorOccurred = false;
            var _errorObject = undefined;

            try {
                // Inner loop: Check each lamp against the current switch configuration.
                for (var _lampIterator = lampObjects[Symbol.iterator](), _currentLampEntry; !(_loopRunningNormally = (_currentLampEntry = _lampIterator.next()).done); _loopRunningNormally = true) {
                    var _lampDetails = _currentLampEntry.value,
                        currentLampSwitches = _lampDetails.associatedSwitchIndices, // Switches connected to this lamp.
                        currentLampPosition = _lampDetails.lampPosition;          // Original index of this lamp.

                    // Counter for switches that are 'on' for the current lamp.
                    var turnedOnSwitches = 0;

                    var _nestedLoopRunning = true;
                    var _nestedErrorOccurred = false;
                    var _nestedErrorObject = undefined;

                    try {
                        // Innermost loop: Iterate through switches connected to the current lamp.
                        for (var _switchIterator = currentLampSwitches[Symbol.iterator](), _currentSwitchEntry; !(_nestedLoopRunning = (_currentSwitchEntry = _switchIterator.next()).done); _nestedLoopRunning = true) {
                            var switchIdentifier = _currentSwitchEntry.value; // The index of a connected switch.
                            // Check if this specific switch is 'on' in the current configuration.
                            // (configIndex & 1 << (switchIdentifier - 1)) uses bitwise AND to check the (switchIdentifier-1)-th bit.
                            if (configIndex & 1 << switchIdentifier - 1) turnedOnSwitches++;
                        }
                    } catch (innerProcessingIssue) {
                        _nestedErrorOccurred = true;
                        _nestedErrorObject = innerProcessingIssue;
                    } finally {
                        try {
                            // Clean up the nested iterator if it didn't complete normally.
                            if (!_nestedLoopRunning && _switchIterator.return != null) {
                                _switchIterator.return();
                            }
                        } finally {
                            // Re-throw if a nested error occurred.
                            if (_nestedErrorOccurred) {
                                throw _nestedErrorObject;
                            }
                        }
                    }

                    // Check if the parity of 'on' switches matches the expected parity for this lamp.
                    // If not, this configuration is invalid; move to the next config.
                    if (turnedOnSwitches % 2 !== expectedParities[currentLampPosition]) {
                        continue configLoop; // Jump to the next iteration of the outer loop.
                    }
                }
            } catch (outerProcessingIssue) {
                _errorOccurred = true;
                _errorObject = outerProcessingIssue;
            } finally {
                try {
                    // Clean up the outer iterator if it didn't complete normally.
                    if (!_loopRunningNormally && _lampIterator.return != null) {
                        _lampIterator.return();
                    }
                } finally {
                    // Re-throw if an outer error occurred.
                    if (_errorOccurred) {
                        throw _errorObject;
                    }
                }
            }

            // If all lamps passed the parity check for this configuration, increment the valid count.
            validConfigurations++;
        }

        // Output the final count of valid configurations.
        console.log(validConfigurations);
    }(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input.
}();