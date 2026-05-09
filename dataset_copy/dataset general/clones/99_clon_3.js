/*
 * DataCrucible.js - (C) 2024 by A. N. Other Developer
 * This software is provided under a permissive open-source license.
 * You are free to use, modify, and distribute this code, provided
 * this notice remains intact.
 *
 * This module offers data processing and manipulation utilities,
 * particularly for tabular data structures, often originating from
 * CSV or HTML tables.
 *
 * For commercial licensing or specialized support, please contact
 * the author through appropriate channels.
 *
 * Key features include:
 * - CSV parsing (both simple and RFC4180 compliant)
 * - Data transformation (e.g., submatrix extraction, type conversion)
 * - Statistical functions (e.g., column means, variance)
 * - Integration with jQuery for DOM manipulation and event handling
 * - Task scheduling for asynchronous operations
 * - Local/session storage integration
 *
 * Dependencies:
 * - jQuery: Essential for DOM interaction and utility functions.
 * - LZString (optional): For compressed storage of data.
 *
 */

// Ensure jQuery is available before proceeding.
if (typeof window.jQuery === 'undefined') {
    console.error("DataCrucible: jQuery dependency not met. Please load jQuery before DataCrucible.");
    throw new Error("DataCrucible: Missing jQuery library.");
}

// Main module definition, encapsulated in an IIFE.
window.DataCrucible = (function() {

    // Core operations callable directly by the user via the API.
    var moduleMethods = {
        'insertRow': null, // Placeholder for actual function, will be 'push'
        'execute': null, // Placeholder for 'call'
        'horizontalSlice': null, // Placeholder for 'hslice'
        'renderTable': null, // Placeholder for 'table'
        'dataEditor': null, // Placeholder for 'editor'
        'chartPlot': null, // Placeholder for 'jqplot'
        'addColumn': null, // Placeholder for 'appendCol'
        'linearRegression': null, // Placeholder for 'ols'
        'persistData': null, // Placeholder for 'save'
        'exportFile': null, // Placeholder for 'download'
        'principalComponents': null // Placeholder for 'pca'
    };

    // Shared utility functions and configuration for internal use.
    var utilityBelt = {
        processingIntervalMillis: 60, // Delay between scheduled tasks
        namedMatrixGenerators: { // Special codes for matrix generation
            '_UniformRand_': ['uniformRandomMatrix', 'dimensions'],
            '_NormalRand_': ['normalRandomMatrix', 'dimensions'],
            '_IdentityMat_': ['identityMatrix', 'dimensions'],
            '_DiagonalMat_': ['diagonalMatrix', 'diagonalVector'],
            '_MatrixFunc_': ['forIndexedElements', 'dimensions', 'generatorFunction']
        },
        // Default handler for operation completion or errors.
        completionHandler: function(issue, processedData) {
            if (issue) {
                console.error("DataCrucible: Operation encountered an issue:", issue);
            }
            if (processedData) {
                console.log("DataCrucible: Operation successfully completed. Result:", processedData);
            }
            // Additional logging or UI updates could go here.
        },
        // Fills a 2D array (matrix) with a specified value.
        initializeMatrix: function(dimensions, initialValue) {
            if (!Array.isArray(dimensions) || dimensions.length !== 2) {
                throw new Error("DataCrucible: 'dimensions' must be a 2-element array [rows, cols].");
            }
            const rowCount = dimensions[0];
            const colCount = dimensions[1];
            const resultMatrix = [];
            const tempRow = Array(colCount).fill(initialValue); // Create one row
            for (let i = 0; i < rowCount; ++i) {
                resultMatrix.push([...tempRow]); // Push a copy of the row
            }
            return resultMatrix;
        },
        // Applies a function to each element (i,j) of a matrix.
        forIndexedElements: function(matrixDims, elementGenerator) {
            if (!Array.isArray(matrixDims) || matrixDims.length !== 2) {
                throw new Error("DataCrucible: 'matrixDims' must be a 2-element array [rows, cols].");
            }
            if (typeof elementGenerator !== 'function') {
                throw new Error("DataCrucible: 'elementGenerator' must be a function.");
            }
            const rowCount = matrixDims[0];
            const colCount = matrixDims[1];
            const generatedMatrix = [];
            for (let i = 0; i < rowCount; ++i) {
                const currentRow = [];
                for (let j = 0; j < colCount; ++j) {
                    currentRow.push(elementGenerator(i, j));
                }
                generatedMatrix.push(currentRow);
            }
            return generatedMatrix;
        },
        // Generates a matrix of uniformly distributed random numbers [0, 1).
        uniformRandomMatrix: function(sizeArray) {
            const rows = sizeArray[0];
            const cols = sizeArray[1];
            const outputMatrix = [];
            for (let i = 0; i < rows; ++i) {
                const currentRow = [];
                for (let j = 0; j < cols; ++j) {
                    currentRow.push(Math.random());
                }
                outputMatrix.push(currentRow);
            }
            return outputMatrix;
        },
        // Generates a matrix of independent standard normal random variables.
        normalRandomMatrix: function(matrixDimensions) {
            // Helper function for Box-Muller transform
            function gaussianPairGenerator(requiredCount) {
                const numPairs = Math.ceil(requiredCount / 2);
                const randomValues = [];
                for (let i = 0; i < numPairs; ++i) {
                    const u1 = Math.random();
                    const u2 = Math.random();
                    const radius = Math.sqrt(-2 * Math.log(u1));
                    const angle = 2 * Math.PI * u2;
                    randomValues.push(radius * Math.cos(angle));
                    randomValues.push(radius * Math.sin(angle));
                }
                return randomValues;
            }

            const totalElements = matrixDimensions[0] * matrixDimensions[1];
            const normalSamples = gaussianPairGenerator(totalElements);
            const outputMatrix = [];
            let sampleIndex = 0;

            for (let r = 0; r < matrixDimensions[0]; ++r) {
                const row = [];
                for (let c = 0; c < matrixDimensions[1]; ++c) {
                    row.push(normalSamples[sampleIndex++]);
                }
                outputMatrix.push(row);
            }
            return outputMatrix;
        },
        // Creates an identity matrix of given dimensions.
        identityMatrix: function(matrixSize) {
            const rows = matrixSize[0];
            const cols = matrixSize[1];
            const identityMat = this.initializeMatrix(matrixSize, 0); // Use renamed fill
            const limit = Math.min(rows, cols);
            for (let i = 0; i < limit; ++i) {
                identityMat[i][i] = 1;
            }
            return identityMat;
        },
        // Creates a diagonal matrix from a vector of diagonal elements.
        diagonalMatrix: function(diagonalVector) {
            const dim = diagonalVector.length;
            const diagMat = this.initializeMatrix([dim, dim], 0); // Use renamed fill
            for (let i = 0; i < dim; ++i) {
                diagMat[i][i] = diagonalVector[i];
            }
            return diagMat;
        },
        // Extracts a submatrix based on row and column specifications.
        extractSubmatrix: function(rowRange, colIdentifiers) {
            const contextObj = this; // Renamed 'shared'
            if (!contextObj.data || !contextObj.data.parsedRows || !contextObj.data.parsedRows.length) {
                throw new Error("DataCrucible: No valid data available for submatrix extraction.");
            }

            const sourceRows = contextObj.data.parsedRows;
            const columnHeaders = sourceRows[0];
            const resultMatrix = [];

            // Determine effective row range
            const startRow = (rowRange && rowRange[0] !== undefined) ? rowRange[0] : 1; // 1-indexed for header
            const endRow = (rowRange && rowRange[1] !== undefined) ? rowRange[1] : sourceRows.length;
            if (startRow < 0 || endRow > sourceRows.length || startRow > endRow) {
                throw new Error(`DataCrucible: Invalid row range [${startRow}, ${endRow}] provided.`);
            }

            // Determine effective column indices
            const effectiveColIdentifiers = colIdentifiers || columnHeaders.slice(0); // Default to all headers
            if (!Array.isArray(effectiveColIdentifiers) || effectiveColIdentifiers.length === 0) {
                throw new Error("DataCrucible: Invalid column identifiers for submatrix extraction.");
            }

            const colIndices = [];
            effectiveColIdentifiers.forEach(identifier => {
                if (typeof identifier === 'string') {
                    const idx = columnHeaders.indexOf(identifier);
                    if (idx === -1) {
                        console.warn(`DataCrucible: Column '${identifier}' not found in headers.`);
                    }
                    colIndices.push(idx);
                } else {
                    colIndices.push(identifier); // Can be a number (index), function, or literal
                }
            });

            // Helper to get cell value based on identifier type
            const getColumnValue = (rowIdx, colIdentifier, currentRow) => {
                if (typeof colIdentifier === 'number' && colIdentifier >= 0 && colIdentifier < currentRow.length) {
                    return currentRow[colIdentifier];
                } else if (typeof colIdentifier === 'function') {
                    return colIdentifier(rowIdx, colIdentifier, currentRow);
                } else if (typeof colIdentifier !== 'string') { // Literals like numbers, null, etc.
                    return colIdentifier;
                }
                return null; // Should not reach here if colIndices are properly filtered/mapped
            };

            for (let i = startRow; i < endRow; ++i) {
                const currentRow = sourceRows[i];
                const newRow = [];
                for (let j = 0; j < colIndices.length; ++j) {
                    newRow.push(getColumnValue(i, colIndices[j], currentRow));
                }
                resultMatrix.push(newRow);
            }
            return resultMatrix;
        },
        // Converts string values in a 2D array to numbers where applicable.
        coerceToNumbers: function(dataRows) {
            if (!Array.isArray(dataRows) || dataRows.length === 0) {
                // console.warn("DataCrucible: No data rows to numberize.");
                return [];
            }
            for (let i = 0; i < dataRows.length; ++i) {
                const currentRow = dataRows[i];
                if (!Array.isArray(currentRow)) continue; // Skip non-array rows
                for (let j = 0; j < currentRow.length; ++j) {
                    const cellValue = currentRow[j];
                    if (typeof cellValue === 'string') {
                        const numericValue = Number(cellValue); // Use Number() for conversion
                        // Check if it's a valid finite number
                        if (!isNaN(numericValue) && isFinite(numericValue)) {
                            currentRow[j] = numericValue;
                        }
                    }
                }
            }
            return dataRows;
        },
        // Parses simple CSV text (no quotes, no special characters).
        simpleCsvParse: function(inputText, delimiter, lineSeparator) {
            if (typeof inputText !== 'string' || inputText.trim() === '') {
                return [];
            }
            const inputLines = inputText.split(lineSeparator);
            return inputLines.map(line => line.split(delimiter));
        },
        // Parses RFC4180-compliant CSV text with quotes and escaped delimiters.
        robustCsvParse: function(rawText, quoteChar, separatorChar, lineBreakChar, leadingWhitespaceChar) {
            let charIndex = 0;
            let currentFieldBuffer = '';
            let currentRowData = [];
            const allParsedRows = [];
            let inQuote = false; // Flag to track if we are inside a quoted field

            // Add an implicit line break at the end to ensure the last row is processed
            const processedText = rawText + lineBreakChar;

            while (charIndex < processedText.length) {
                const currentChar = processedText.charAt(charIndex);

                if (currentChar === quoteChar) {
                    if (currentFieldBuffer.length === 0) { // Start/end of a quoted field
                        inQuote = !inQuote;
                    } else if ((charIndex + 1 < processedText.length) && (processedText.charAt(charIndex + 1) === quoteChar)) {
                        // Escaped quote: "" becomes "
                        currentFieldBuffer += quoteChar;
                        charIndex++; // Skip the next quote char
                    } else if (inQuote) { // End of a quoted field
                        inQuote = false;
                    } else {
                        // Quote not at start/end or escaped, treat as literal.
                        // This behavior deviates from strict RFC4180 but is common in some parsers.
                        currentFieldBuffer += quoteChar;
                    }
                } else if (currentChar === separatorChar) {
                    if (inQuote) {
                        currentFieldBuffer += separatorChar;
                    } else {
                        currentRowData.push(currentFieldBuffer);
                        currentFieldBuffer = '';
                    }
                } else if (currentChar === lineBreakChar) {
                    if (inQuote) {
                        currentFieldBuffer += lineBreakChar;
                    } else {
                        // Only push field if it's not empty or if it's the last field of a non-empty row
                        if (currentFieldBuffer.length > 0 || currentRowData.length > 0) {
                            currentRowData.push(currentFieldBuffer);
                            allParsedRows.push(currentRowData);
                        }
                        currentFieldBuffer = '';
                        currentRowData = [];
                    }
                } else if (currentChar === leadingWhitespaceChar && currentFieldBuffer.length === 0 && !inQuote) {
                    // Ignore leading whitespace only if not in a quote and field is empty
                    // Do nothing, effectively trimming it
                } else {
                    currentFieldBuffer += currentChar;
                }
                charIndex++;
            }

            // Handle any remaining field/row if the text didn't end with a newline
            if (currentFieldBuffer.length > 0 || currentRowData.length > 0) {
                currentRowData.push(currentFieldBuffer);
                allParsedRows.push(currentRowData);
            }

            return allParsedRows;
        },
        // Universal CSV parser, detects quoted fields automatically.
        parseCsvText: function(inputString) {
            const localContext = this; // Renamed 'shared'
            const lineEndIndicator = "\n";
            const quoteSymbol = '"';
            const fieldDelimiter = ",";
            const preTrimCharacter = " "; // Used to ignore leading spaces in fields

            let allRowsData;
            if (typeof inputString !== 'string' || inputString.trim() === '') {
                return []; // Return empty for empty input
            }

            // If no quotes are found, use the simpler parser.
            if (!inputString.includes(quoteSymbol)) {
                allRowsData = localContext.simpleCsvParse(inputString, fieldDelimiter, lineEndIndicator);
            } else {
                allRowsData = localContext.robustCsvParse(inputString, quoteSymbol, fieldDelimiter, lineEndIndicator, preTrimCharacter);
            }
            return localContext.coerceToNumbers(allRowsData); // Convert numeric strings to actual numbers
        },
        // Reads CSV data from a file input element.
        loadDataFromFile: function(inputElementSelector) {
            const contextRef = this; // Renamed 'shared'
            if (!contextRef.data) contextRef.data = {};
            if (!contextRef.data.parsedRows) contextRef.data.parsedRows = [];

            let fileArmed = true; // Prevents multiple triggerings

            const onFileReadComplete = function(event) {
                try {
                    contextRef.data.parsedRows = contextRef.parseCsvText(event.target.result);
                } catch (err) {
                    contextRef.completionHandler("DataCrucible: Error processing file content: " + err.message, null);
                    return; // Stop further processing if parsing fails
                }
                contextRef.executeNextTask(); // Proceed to the next scheduled task
            };

            const onFileReadError = function(errorEvent) {
                throw new Error("DataCrucible: Failed to read file: " + errorEvent.target.error.code);
            };

            const handleFileSelection = function(event) {
                if (fileArmed) {
                    fileArmed = false; // Disarm to prevent re-triggering
                    const target = event.target;
                    if (target && target.files && target.files[0]) {
                        const fileObject = target.files[0];
                        const fileReader = new FileReader();
                        fileReader.onerror = onFileReadError;
                        fileReader.onload = onFileReadComplete;
                        fileReader.readAsText(fileObject);
                    } else {
                        throw new Error("DataCrucible: File input event did not contain expected file data.");
                    }
                }
                // Detach event listener and disable input after first use
                $(inputElementSelector).off('change', handleFileSelection);
                $(inputElementSelector).prop('disabled', true);
            };

            // Attach the change listener to the file input
            $(inputElementSelector + '[type="file"]').on('change', handleFileSelection);
        },
        // Extracts tabular data from an HTML table element.
        getDataFromHtmlTable: function(tableSelector) {
            const extractedRows = [];
            $(tableSelector + ' tr').each(function() {
                const currentRow = [];
                $(this).find('th,td').each(function() {
                    let cellValue = $(this).text().trim(); // Trim whitespace and newlines

                    // Robust type conversion
                    if (cellValue === '') {
                        cellValue = null; // Treat empty strings as null for consistency
                    } else if (cellValue.toLowerCase() === 'null') {
                        cellValue = null;
                    } else if (cellValue.toLowerCase() === 'undefined') {
                        cellValue = undefined;
                    } else {
                        const numValue = Number(cellValue);
                        if (!isNaN(numValue) && isFinite(numValue)) {
                            cellValue = numValue;
                        }
                    }
                    currentRow.push(cellValue);
                });
                extractedRows.push(currentRow);
            });
            return extractedRows;
        },
        // Extracts a single column from a 2D array.
        getColumnData: function(matrixData, columnIndex) {
            const columnVector = [];
            for (let i = 0; i < matrixData.length; ++i) {
                if (matrixData[i] && matrixData[i].length > columnIndex) {
                    columnVector.push(matrixData[i][columnIndex]);
                } else {
                    columnVector.push(undefined); // Handle ragged arrays or out-of-bounds
                }
            }
            return columnVector;
        },
        // Calculates the mean of each column in a numeric matrix.
        calculateColumnMeans: function(numericMatrix) {
            if (!numericMatrix || numericMatrix.length === 0 || !numericMatrix[0] || numericMatrix[0].length === 0) {
                return []; // Return empty for invalid input
            }
            const numCols = numericMatrix[0].length;
            const numRows = numericMatrix.length;
            const columnSums = Array(numCols).fill(0);

            for (let i = 0; i < numRows; ++i) {
                for (let j = 0; j < numCols; ++j) {
                    const value = Number(numericMatrix[i][j]); // Ensure numeric
                    if (!isNaN(value)) {
                        columnSums[j] += value;
                    }
                }
            }
            return columnSums.map(sum => sum / numRows);
        },
        // Calculates the mean of squares for each column.
        calculateColumnMeanSquares: function(inputMatrix) {
            if (!inputMatrix || inputMatrix.length === 0 || !inputMatrix[0] || inputMatrix[0].length === 0) {
                return [];
            }
            const numCols = inputMatrix[0].length;
            const numRows = inputMatrix.length;
            const sumOfSquares = Array(numCols).fill(0);

            for (let i = 0; i < numRows; ++i) {
                for (let j = 0; j < numCols; ++j) {
                    const value = Number(inputMatrix[i][j]); // Ensure numeric
                    if (!isNaN(value)) {
                        sumOfSquares[j] += (value * value);
                    }
                }
            }
            return sumOfSquares.map(sqSum => sqSum / numRows);
        },
        // Calculates the variance of each column.
        calculateColumnVariances: function(inputData, applySampleCorrection, assumeZeroMean) {
            if (!inputData || inputData.length < (applySampleCorrection ? 2 : 1) || !inputData[0] || inputData[0].length === 0) {
                // If sample correction is applied, need at least 2 rows. Otherwise, 1 row is fine.
                console.warn("DataCrucible: Insufficient data for variance calculation. Returning empty array.");
                return [];
            }

            const sumOfSquaresPerCol = this.calculateColumnMeanSquares(inputData);
            const columnMeans = this.calculateColumnMeans(inputData);
            const numCols = inputData[0].length;
            const numRows = inputData.length;

            const correctionFactor = applySampleCorrection ? (numRows / (numRows - 1)) : 1;
            const variances = [];

            for (let i = 0; i < numCols; ++i) {
                const squareOfMean = assumeZeroMean ? 0 : (columnMeans[i] * columnMeans[i]);
                const variance = correctionFactor * (sumOfSquaresPerCol[i] - squareOfMean);
                variances.push(variance);
            }
            return variances;
        },
        // Executes the next task in the queue.
        executeNextTask: function(ajaxRequest, requestStatus) {
            const execContext = this; // Renamed 'shared'
            let currentOperation;

            // Handle AJAX errors if applicable
            if (requestStatus && requestStatus !== "success") {
                return execContext.completionHandler("DataCrucible: AJAX request failed with status: " + requestStatus, null);
            }

            // Check if there are tasks pending
            if (Array.isArray(execContext.pendingTasks) && execContext.pendingTasks.length > 0) {
                currentOperation = execContext.pendingTasks.shift(); // Get the first task

                // Schedule the task for execution after a delay
                return setTimeout(
                    function() {
                        let operationFunction = currentOperation.funcRef;
                        // If funcRef is a string, resolve it from moduleMethods or utilityBelt
                        if (typeof operationFunction === 'string') {
                            operationFunction = moduleMethods[operationFunction] || execContext[operationFunction];
                        }

                        if (typeof operationFunction !== 'function') {
                            execContext.completionHandler("DataCrucible: Unknown or invalid operation in task queue: " + currentOperation.funcRef, null);
                            execContext.pendingTasks = []; // Clear queue on error
                            return;
                        }

                        try {
                            // Execute the function with the stored arguments
                            operationFunction.apply(execContext, currentOperation.args);
                        } catch (err) {
                            // Catch errors during task execution
                            execContext.pendingTasks = 'error_state'; // Indicate an error state
                            execContext.completionHandler("DataCrucible: Error during task execution: " + err.message, null);
                            execContext.pendingTasks = []; // Clear queue after error handling
                            return;
                        }
                    },
                    execContext.processingIntervalMillis
                );
            }

            // If the task list is empty and not in an error state
            if (Array.isArray(execContext.pendingTasks) && execContext.pendingTasks.length === 0) {
                execContext.pendingTasks = 'finalizing'; // Prevent re-entry
                execContext.completionHandler(null, execContext.data); // Notify completion
                execContext.pendingTasks = null; // Reset to allow new chains
                return;
            }

            // This should ideally not be reached, indicates an unexpected state.
            console.warn("DataCrucible: executeNextTask called in an unexpected state. Pending tasks:", execContext.pendingTasks);
        }
    };

    // Public API for DataCrucible module.
    var apiExports = {
        'startProcessing': null, // Placeholder for 'begin'
        'augmentModule': null // Placeholder for 'extend'
    };

    /**
     * Extends DataCrucible with new functions or shared utilities.
     * @param {object} additionalOperations - Object with new functions for the public API.
     * @param {object} [additionalUtilities] - Object with new functions/values for internal utilities.
     * @returns {object} The DataCrucible public API for chaining.
     */
    function augmentModule(additionalOperations, additionalUtilities) {
        if (typeof additionalOperations === "object" && additionalOperations !== null) {
            jQuery.extend(moduleMethods, additionalOperations);
        } else {
            throw new Error("DataCrucible: 'additionalOperations' must be an object containing functions to extend the module's public methods.");
        }

        if (typeof additionalUtilities === "object" && additionalUtilities !== null) {
            jQuery.extend(utilityBelt, additionalUtilities);
        } else if (additionalUtilities !== undefined) { // Allow undefined for no utility extension
            throw new Error("DataCrucible: 'additionalUtilities' must be an object or undefined for no extensions.");
        }
        return apiExports;
    }

    /**
     * Creates a chainable object for scheduling operations.
     * @param {string[]} availableMethods - List of method names that can be chained.
     * @param {Array} predefinedActions - Array of [methodName, functionRef] for direct calls.
     * @param {Array} taskQueue - The array to store pending tasks.
     * @returns {object} A chainable object.
     */
    function createActionPlan(availableMethods, predefinedActions, taskQueue) {
        const methodChain = {};

        // Function to create a task binder for chainable methods
        function bindTask(operationName) {
            return function() {
                taskQueue.push({
                    funcRef: operationName, // Reference to the function name (string)
                    args: Array.from(arguments) // Capture arguments
                });
                return methodChain; // Enable chaining
            };
        }

        // Bind all available methods from the list
        availableMethods.forEach(methodName => {
            methodChain[methodName] = bindTask(methodName);
        });

        // Add any predefined, directly callable actions
        for (let i = 0; i < predefinedActions.length; i += 2) {
            methodChain[predefinedActions[i]] = predefinedActions[i + 1];
        }
        return methodChain;
    }

    /**
     * Generates an HTML table string from a 2D array of data.
     * @param {Array<Array>} dataRows - The data to populate the table.
     * @param {object} tableOptions - Configuration object for table, row, cell attributes.
     * @returns {string} The HTML string for the table.
     */
    function generateHtmlTable(dataRows, tableOptions) {
        let outputBuffer = [];
        if (!Array.isArray(dataRows) || dataRows.length === 0) {
            throw new Error("DataCrucible: 'dataRows' must be a non-empty array for table generation.");
        }

        // Helper to append an HTML tag with optional attributes.
        function appendHtmlTag(tagName, tagOptions, tagArgs) {
            let effectiveOptions = {};
            if (typeof tagOptions === 'object' && tagOptions !== null) {
                effectiveOptions = tagOptions;
            } else if (typeof tagOptions === 'function') {
                effectiveOptions = tagOptions.apply(null, tagArgs || []); // Apply function to get options
            }
            outputBuffer.push('<', tagName);
            for (const [key, value] of Object.entries(effectiveOptions)) {
                outputBuffer.push(' ', key, '="', value, '"');
            }
            outputBuffer.push('>');
        }

        appendHtmlTag('table', tableOptions.table);

        // Caption rendering
        if (tableOptions.caption) {
            appendHtmlTag('caption', tableOptions.captionAttributes);
            outputBuffer.push(tableOptions.caption);
            outputBuffer.push('</caption>');
        }

        let rowIndex = 0;
        // Table header rendering
        if (tableOptions.hasHeaderRow || tableOptions.theadAttributes) {
            const headerRowData = dataRows[0];
            appendHtmlTag('thead', tableOptions.theadAttributes);
            appendHtmlTag('tr', tableOptions.theadRowAttributes, [0]);
            for (let j = 0; j < headerRowData.length; ++j) {
                appendHtmlTag('th', tableOptions.thAttributes, [rowIndex, j, headerRowData[j]]);
                outputBuffer.push(headerRowData[j], '</th>');
            }
            outputBuffer.push('</tr></thead>');
            rowIndex = 1; // Start body from the second row
        }

        // Table body rendering
        appendHtmlTag('tbody', tableOptions.tbodyAttributes);
        for (; rowIndex < dataRows.length; ++rowIndex) {
            const currentRowData = dataRows[rowIndex];
            appendHtmlTag('tr', tableOptions.trAttributes, [rowIndex]);
            for (let colIndex = 0; colIndex < currentRowData.length; ++colIndex) {
                appendHtmlTag('td', tableOptions.tdAttributes, [rowIndex, colIndex, currentRowData[colIndex]]);
                if (tableOptions.cellFormatter && typeof tableOptions.cellFormatter === 'function') {
                    outputBuffer.push(tableOptions.cellFormatter(rowIndex, colIndex, currentRowData[colIndex]));
                } else {
                    outputBuffer.push(currentRowData[colIndex]);
                }
                outputBuffer.push('</td>');
            }
            outputBuffer.push('</tr>');
        }
        outputBuffer.push('</tbody></table>');
        return outputBuffer.join('');
    }

    /**
     * Retrieves data from local or session storage.
     * @param {string} storageKey - The key, e.g., "local/mydata" or "session/tempdata".
     * @returns {object} The parsed data.
     */
    function retrieveLocalData(storageKey) {
        const keySegments = storageKey.split('/');
        if (!['local', 'session'].includes(keySegments[0])) {
            throw new Error("DataCrucible: Storage key must start with 'local/' or 'session/'. Received: " + storageKey);
        }

        const storage = window[keySegments[0] + 'Storage'];
        if (!storage) {
            throw new Error(`DataCrucible: ${keySegments[0]}Storage is not available.`);
        }

        const storedJson = storage.getItem(storageKey);
        if (storedJson === null || typeof storedJson === 'undefined') {
            throw new Error(`DataCrucible: Key '${storageKey}' not found in ${keySegments[0]}Storage.`);
        }

        let decompressedData = storedJson;
        // Attempt decompression if LZString is available
        if (window.LZString && typeof window.LZString.decompressFromUTF16 === 'function') {
            decompressedData = LZString.decompressFromUTF16(storedJson);
            if (decompressedData === null) {
                console.warn(`DataCrucible: Failed to decompress data for key '${storageKey}'. Attempting to parse as uncompressed JSON.`);
                decompressedData = storedJson; // Fallback to original if decompression fails
            }
        }

        try {
            return JSON.parse(decompressedData);
        } catch (e) {
            throw new Error(`DataCrucible: Failed to parse JSON data for key '${storageKey}'. Error: ${e.message}`);
        }
    }

    /**
     * Stores data into local or session storage.
     * @param {string} keyName - The key to store data under.
     * @param {object} dataContent - The data to be stored.
     * @param {object} [metaInfo] - Optional metadata (not used in this simplified version).
     */
    function storeLocalData(keyName, dataContent, metaInfo) {
        const keySegments = keyName.split('/');
        if (!['local', 'session'].includes(keySegments[0])) {
            throw new Error("DataCrucible: Storage key must start with 'local/' or 'session/'. Received: " + keyName);
        }

        const storage = window[keySegments[0] + 'Storage'];
        if (!storage) {
            throw new Error(`DataCrucible: ${keySegments[0]}Storage is not available.`);
        }

        try {
            let jsonString = JSON.stringify(dataContent);
            // Attempt compression if LZString is available
            if (window.LZString && typeof window.LZString.compressToUTF16 === 'function') {
                jsonString = LZString.compressToUTF16(jsonString);
            }
            storage.setItem(keyName, jsonString);
            // console.log(`DataCrucible: Data stored successfully under key '${keyName}'.`);
        } catch (e) {
            throw new Error(`DataCrucible: Failed to store data for key '${keyName}'. Error: ${e.message}`);
        }
    }

    // Assign actual functions to moduleMethods (used by planner/task scheduler)
    moduleMethods.insertRow = function() { console.log("insertRow not implemented yet"); };
    moduleMethods.execute = function() { console.log("execute not implemented yet"); };
    moduleMethods.horizontalSlice = function() { console.log("horizontalSlice not implemented yet"); };
    moduleMethods.renderTable = generateHtmlTable;
    moduleMethods.dataEditor = function() { console.log("dataEditor not implemented yet"); };
    moduleMethods.chartPlot = function() { console.log("chartPlot not implemented yet"); };
    moduleMethods.addColumn = function() { console.log("addColumn not implemented yet"); };
    moduleMethods.linearRegression = function() { console.log("linearRegression not implemented yet"); };
    moduleMethods.persistData = storeLocalData;
    moduleMethods.exportFile = function() { console.log("exportFile not implemented yet"); };
    moduleMethods.principalComponents = function() { console.log("principalComponents not implemented yet"); };


    /**
     * Initializes a new chain of operations for DataCrucible.
     * @param {object} initialData - Optional initial data for the chain.
     * @param {function} [completionCallback] - Callback function for final results or errors.
     * @returns {object} A chainable object for DataCrucible operations.
     */
    function startProcessing(initialData, completionCallback) {
        const instanceContext = jQuery.extend(true, {}, utilityBelt); // Deep copy of shared utilities
        instanceContext.data = initialData || { parsedRows: [] }; // Initialize data object
        instanceContext.pendingTasks = []; // Task queue for this specific chain
        instanceContext.completionHandler = completionCallback || utilityBelt.completionHandler;

        // The list of methods available for chaining.
        const chainableMethods = Object.keys(moduleMethods);

        // Methods that are directly callable (not part of the scheduled task queue but part of the API).
        const directMethods = [
            'fromFile', instanceContext.loadDataFromFile, // Renamed 'fromFile'
            'fromTable', instanceContext.getDataFromHtmlTable, // Renamed 'fromTable'
            'submatrix', instanceContext.extractSubmatrix, // Renamed 'submatrix'
            'col', instanceContext.getColumnData, // Renamed 'col'
            'colAvg', instanceContext.calculateColumnMeans, // Renamed 'colAvg'
            'colAvg2', instanceContext.calculateColumnMeanSquares, // Renamed 'colAvg2'
            'colVar', instanceContext.calculateColumnVariances, // Renamed 'colVar'
            'parseCsv', instanceContext.parseCsvText, // Renamed 'parseCSV'
            'localFetch', retrieveLocalData, // Renamed 'localFetch'
            'localCreate', storeLocalData // Renamed 'localCreate'
        ];

        // Create the chainable API object for this instance
        const operationChain = createActionPlan(chainableMethods, directMethods, instanceContext.pendingTasks);

        // Add a 'finalize' method to trigger execution of the task queue
        operationChain.finalize = function() {
            if (instanceContext.pendingTasks === null) {
                console.warn("DataCrucible: Finalize called on an already completed or errored chain.");
                return;
            }
            if (instanceContext.pendingTasks.length === 0) {
                // If no tasks, just call the completion handler immediately
                instanceContext.completionHandler(null, instanceContext.data);
                instanceContext.pendingTasks = null;
                return;
            }
            // Start processing the task queue
            instanceContext.executeNextTask();
        };

        return operationChain;
    }

    // Populate the public API with the main entry points
    apiExports.startProcessing = startProcessing;
    apiExports.augmentModule = augmentModule;

    return apiExports; // Return the public API
})();