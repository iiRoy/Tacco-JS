(function() {
    "use strict";

    if (typeof window.jQuery === 'undefined') {
        console.warn("GridHandler: jQuery is not detected. This library does not require jQuery, but the original context might have expected it.");
    }

    // Collection of low-level data manipulation and generation routines
    const auxiliaryRoutines = {

        // Creates a matrix filled with a specified value
        populateGrid: function(dimensions, initialValue) {
            const rowCount = dimensions[0];
            const colCount = dimensions[1];
            const resultRows = [];
            for (let i = 0; i < rowCount; ++i) {
                const newRow = new Array(colCount).fill(initialValue);
                resultRows.push(newRow);
            }
            return resultRows;
        },

        // Applies a function to each cell of a new matrix
        applyGridFunc: function(dimensions, cellFunction) {
            const rowCount = dimensions[0];
            const colCount = dimensions[1];
            const resultGrid = [];
            for (let i = 0; i < rowCount; ++i) {
                resultGrid.push([]);
                for (let j = 0; j < colCount; ++j) {
                    resultGrid[i][j] = cellFunction(i, j);
                }
            }
            return resultGrid;
        },

        // Generates a matrix of uniform random numbers [0, 1)
        generateUniform: function(dimensions) {
            const rowTotal = dimensions[0];
            const colTotal = dimensions[1];
            const outputMatrix = [];
            for (let r = 0; r < rowTotal; ++r) {
                outputMatrix[r] = [];
                for (let c = 0; c < colTotal; ++c) {
                    outputMatrix[r][c] = Math.random();
                }
            }
            return outputMatrix;
        },

        // Generates a matrix of standard normal random numbers (mean 0, variance 1)
        generateNormal: function(dimensions) {
            function boxMullerGenerator(count) {
                const results = [];
                for (let i = 0; i < Math.ceil(count / 2); ++i) {
                    const u1 = Math.random();
                    const u2 = Math.random();
                    const r = Math.sqrt(-2 * Math.log(u1));
                    const theta = 2 * Math.PI * u2;
                    results.push(r * Math.cos(theta));
                    results.push(r * Math.sin(theta));
                }
                return results;
            }
            const totalCells = dimensions[0] * dimensions[1];
            const normalValues = boxMullerGenerator(totalCells);
            const outputMatrix = [];
            let valIndex = 0;
            for (let r = 0; r < dimensions[0]; ++r) {
                outputMatrix[r] = [];
                for (let c = 0; c < dimensions[1]; ++c) {
                    outputMatrix[r][c] = normalValues[valIndex++];
                }
            }
            return outputMatrix;
        },

        // Generates an identity matrix
        generateIdentity: function(dimensions) {
            const outputMatrix = this.populateGrid(dimensions, 0);
            const limit = Math.min(dimensions[0], dimensions[1]);
            for (let i = 0; i < limit; ++i) {
                outputMatrix[i][i] = 1;
            }
            return outputMatrix;
        },

        // Generates a diagonal matrix from a given array
        generateDiagonal: function(diagonalValues) {
            const sideLength = diagonalValues.length;
            const outputMatrix = this.populateGrid([sideLength, sideLength], 0);
            for (let i = 0; i < sideLength; ++i) {
                outputMatrix[i][i] = diagonalValues[i];
            }
            return outputMatrix;
        },

        // Parses CSV text with simple splitting (no quotes)
        simpleTextToGrid: function(textInput, delimiter, lineBreak) {
            return textInput.split(lineBreak).map(line => line.split(delimiter));
        },

        // Parses CSV text according to RFC4180 rules
        complexTextToGrid: function(inputText, quoteChar, delimiterChar, lineBreakChar, trimChar) {
            const finalDataSet = [];
            let currentRow = [];
            let currentCell = '';
            let inQuotedField = false;
            let charIndex = 0;

            while (charIndex < inputText.length) {
                const char = inputText.charAt(charIndex);

                if (char === quoteChar) {
                    if (inQuotedField) {
                        // Check for escaped quote (two quotes)
                        if (charIndex + 1 < inputText.length && inputText.charAt(charIndex + 1) === quoteChar) {
                            currentCell += quoteChar;
                            charIndex++; // Consume the second quote
                        } else {
                            // End of quoted field
                            inQuotedField = false;
                        }
                    } else {
                        // Start of quoted field
                        inQuotedField = true;
                    }
                } else if (char === delimiterChar) {
                    if (inQuotedField) {
                        currentCell += delimiterChar;
                    } else {
                        currentRow.push(currentCell);
                        currentCell = '';
                    }
                } else if (char === lineBreakChar) {
                    if (inQuotedField) {
                        currentCell += lineBreakChar;
                    } else {
                        currentRow.push(currentCell);
                        finalDataSet.push(currentRow);
                        currentRow = [];
                        currentCell = '';
                    }
                } else if (char === trimChar && currentCell.length === 0 && !inQuotedField) {
                    // Ignore leading whitespace in unquoted fields
                } else {
                    currentCell += char;
                }
                charIndex++;
            }

            // Add any remaining cell/row after loop
            if (currentCell.length > 0 || currentRow.length > 0) {
                currentRow.push(currentCell);
            }
            if (currentRow.length > 0) {
                finalDataSet.push(currentRow);
            }
            return finalDataSet;
        },

        // Converts string entries in a grid to numbers where possible
        numericGrid: function(inputGrid) {
            return inputGrid.map(rowContent =>
                rowContent.map(cellValue => {
                    if (typeof cellValue === 'string') {
                        const numericVal = Number(cellValue);
                        if (!isNaN(numericVal) && isFinite(numericVal)) {
                            return numericVal;
                        }
                    }
                    return cellValue;
                })
            );
        },

        // Main CSV parsing function, detects quoted fields
        textToGrid: function(textContent) {
            const newline = "\n",
                quote = '"',
                comma = ",",
                space = " ";
            let parsedData;
            if (textContent.indexOf(quote) === -1) {
                parsedData = this.simpleTextToGrid(textContent, comma, newline);
            } else {
                parsedData = this.complexTextToGrid(textContent, quote, comma, newline, space);
            }
            return this.numericGrid(parsedData);
        },

        // Extracts a column from a matrix
        fetchColumn: function(matrix, columnIndex) {
            return matrix.map(row => row[columnIndex]);
        },

        // Calculates the average of each column
        columnMean: function(matrix) {
            if (!matrix || matrix.length === 0 || matrix[0].length === 0) return [];
            const colCount = matrix[0].length;
            const rowCount = matrix.length;
            const sums = new Array(colCount).fill(0);
            for (let r = 0; r < rowCount; ++r) {
                for (let c = 0; c < colCount; ++c) {
                    sums[c] += matrix[r][c];
                }
            }
            return sums.map(sum => sum / rowCount);
        },

        // Calculates the average of squares for each column
        columnMeanSq: function(matrix) {
            if (!matrix || matrix.length === 0 || matrix[0].length === 0) return [];
            const colCount = matrix[0].length;
            const rowCount = matrix.length;
            const sumOfSquares = new Array(colCount).fill(0);
            for (let r = 0; r < rowCount; ++r) {
                for (let c = 0; c < colCount; ++c) {
                    const val = matrix[r][c];
                    sumOfSquares[c] += (val * val);
                }
            }
            return sumOfSquares.map(sum => sum / rowCount);
        },

        // Calculates the variance of each column
        columnVariance: function(matrix, useSampleCorrection, assumeZeroMean) {
            const avgOfSquares = this.columnMeanSq(matrix);
            const avg = this.columnMean(matrix);
            const scaleFactor = (useSampleCorrection && matrix.length > 1) ? (matrix.length / (matrix.length - 1)) : 1;
            const colCount = matrix[0].length;
            const variances = [];

            for (let i = 0; i < colCount; ++i) {
                const squareOfAvg = assumeZeroMean ? 0 : (avg[i] * avg[i]);
                variances[i] = scaleFactor * (avgOfSquares[i] - squareOfAvg);
            }
            return variances;
        },

        // Extracts a sub-grid from the current data matrix
        extractSubgrid: function(parentContext, rowRange, columnSpec) {
            const sourceMatrix = parentContext.currentMatrix;
            if (!sourceMatrix || !sourceMatrix.length) {
                throw new Error("GridHandler: No data available for subgrid extraction.");
            }

            const headerRow = sourceMatrix[0];
            const startRow = rowRange ? (rowRange[0] || 1) : 1; // Default to 1-indexed first row
            const endRow = rowRange ? (rowRange[1] || sourceMatrix.length) : sourceMatrix.length; // Default to last row

            const selectedColumnIndices = [];
            if (!columnSpec || columnSpec.length === 0) {
                throw new Error("GridHandler: Column specification is invalid or empty.");
            }

            for (let i = 0; i < columnSpec.length; ++i) {
                const colIdentifier = columnSpec[i];
                if (typeof colIdentifier === 'string') {
                    const index = headerRow.indexOf(colIdentifier);
                    selectedColumnIndices.push(index);
                } else {
                    selectedColumnIndices.push(-1); // Placeholder for non-existent or computed columns
                }
            }

            const outputSubgrid = [];
            for (let r = startRow; r < endRow; ++r) {
                const newRow = [];
                for (let c = 0; c < selectedColumnIndices.length; ++c) {
                    const colIdx = selectedColumnIndices[c];
                    if (colIdx >= 0 && r < sourceMatrix.length && colIdx < sourceMatrix[r].length) {
                        newRow.push(sourceMatrix[r][colIdx]);
                    } else if (typeof columnSpec[c] === 'number') {
                        newRow.push(columnSpec[c]); // Constant value
                    } else if (typeof columnSpec[c] === 'function') {
                        newRow.push((columnSpec[c])(r, c, sourceMatrix[r])); // Computed value
                    } else {
                        newRow.push(null);
                    }
                }
                outputSubgrid.push(newRow);
            }
            return outputSubgrid;
        },

        // Renders an HTML table from a data grid
        renderTable: function(gridData, displayOptions) {
            if (!gridData || !gridData.length) throw new Error("GridHandler: No data to render table.");

            const htmlBuffer = [];
            const tableOpts = displayOptions.table || {};

            const addTag = (tagName, options, content = '') => {
                let tagAttrs = '';
                for (const key in options) {
                    if (Object.prototype.hasOwnProperty.call(options, key)) {
                        tagAttrs += ` ${key}="${options[key]}"`;
                    }
                }
                htmlBuffer.push(`<${tagName}${tagAttrs}>${content}`);
            };
            const closeTag = (tagName) => htmlBuffer.push(`</${tagName}>`);

            addTag('table', tableOpts);

            if (displayOptions.caption) {
                addTag('caption', displayOptions.captionOpts || {}, displayOptions.caption);
                closeTag('caption');
            }

            let startRowIndex = 0;
            if (displayOptions.header || displayOptions.tableHead) {
                addTag('thead', displayOptions.tableHead || {});
                const headerRowData = gridData[0];
                addTag('tr', displayOptions.headerRowOpts || {});
                for (let j = 0; j < headerRowData.length; ++j) {
                    addTag('th', displayOptions.headerCellOpts ? displayOptions.headerCellOpts(0, j, headerRowData[j]) : {}, headerRowData[j]);
                    closeTag('th');
                }
                closeTag('tr');
                closeTag('thead');
                startRowIndex = 1;
            }

            addTag('tbody', displayOptions.tableBody || {});
            for (let i = startRowIndex; i < gridData.length; ++i) {
                const rowData = gridData[i];
                addTag('tr', displayOptions.bodyRowOpts ? displayOptions.bodyRowOpts(i) : {});
                for (let j = 0; j < rowData.length; ++j) {
                    const cellValue = rowData[j];
                    addTag('td', displayOptions.bodyCellOpts ? displayOptions.bodyCellOpts(i, j, cellValue) : {});
                    if (displayOptions.cellContentFormatter && typeof displayOptions.cellContentFormatter === 'function') {
                        htmlBuffer.push(displayOptions.cellContentFormatter(i, j, cellValue));
                    } else {
                        htmlBuffer.push(cellValue);
                    }
                    closeTag('td');
                }
                closeTag('tr');
            }
            closeTag('tbody');
            closeTag('table');

            return htmlBuffer.join('');
        },

        // Acquires data from an HTML table in the DOM
        acquireTableData: function(selector) {
            const tableRows = document.querySelectorAll(selector + ' tr');
            const extractedData = [];

            tableRows.forEach(rowElement => {
                const rowContent = [];
                rowElement.querySelectorAll('th,td').forEach(cellElement => {
                    let cellText = cellElement.textContent;
                    cellText = cellText.trim(); // Use vanilla trim

                    // Convert to number if applicable, similar to original's fromTable logic
                    if (isNaN(cellText)) {
                        if (cellText === 'null') cellText = null;
                        else if (cellText === 'undefined') cellText = undefined;
                    } else if (cellText === '') {
                        cellText = ''; // Keep empty string as is
                    } else {
                        cellText = Number(cellText);
                    }
                    rowContent.push(cellText);
                });
                extractedData.push(rowContent);
            });
            return extractedData;
        },

        // Retrieves data from local or session storage
        retrievePersistent: function(keyName) {
            const parts = keyName.split('/');
            if (parts[0] !== 'local' && parts[0] !== 'session') {
                throw new Error("GridHandler: Persistent retrieval key must start with 'local/' or 'session/'.");
            }
            const storageType = (parts[0] === 'local' ? localStorage : sessionStorage);
            const storedItem = storageType.getItem(keyName);

            if (storedItem === null || typeof storedItem === 'undefined') {
                throw new Error(`GridHandler: Key '${keyName}' not found in storage.`);
            }

            // Original used LZString, for Type IV, we skip direct dependency
            // and assume data is stored directly or use a placeholder for decompression.
            // For this clone, we'll assume uncompressed JSON.
            // If LZString functionality is critical, a Type IV would implement its own compression.
            return JSON.parse(storedItem);
        },

        // Stores data to local or session storage
        storePersistent: function(keyName, dataToStore, metaInfo) {
            const parts = keyName.split('/');
            if (parts[0] !== 'local' && parts[0] !== 'session') {
                throw new Error("GridHandler: Persistent storage key must start with 'local/' or 'session/'.");
            }
            const storageType = (parts[0] === 'local' ? localStorage : sessionStorage);
            const combinedData = { data: dataToStore, meta: metaInfo }; // Store data with optional meta
            const jsonString = JSON.stringify(combinedData);

            // Original used LZString, for Type IV, we skip direct dependency.
            // storageType.setItem(keyName, LZString.compressToUTF16(jsonString));
            storageType.setItem(keyName, jsonString);
        }
    };

    // The main data processing class, managing state and operations
    class GridHandler {
        constructor() {
            this.currentMatrix = null;
            this.operationQueue = [];
            this.completionHandler = (error, finalData) => {
                if (error) console.error("GridHandler Error:", error);
            };
            this.processingDelay = 50; // Delay between tasks in ms
            this._isProcessing = false;
            this._currentPromiseResolve = null;
            this._currentPromiseReject = null;
            this.utilityKit = auxiliaryRoutines; // Access to shared utilities
        }

        // Internal method to advance the operation queue
        _initiateProcessing() {
            if (this._isProcessing) return; // Prevent re-entry

            if (this.operationQueue.length === 0) {
                this._resolveCurrentPromise(this.currentMatrix);
                this.completionHandler(null, this.currentMatrix);
                return;
            }

            this._isProcessing = true;
            const nextJob = this.operationQueue.shift();
            const routineToExecute = this.utilityKit[nextJob.routine] || this[nextJob.routine];

            if (typeof routineToExecute !== 'function') {
                const error = new Error("GridHandler: Unknown routine in queue: " + nextJob.routine);
                this._rejectCurrentPromise(error);
                this.completionHandler(error, null);
                this._isProcessing = false;
                this.operationQueue = []; // Clear queue on error
                return;
            }

            // Callback to signal completion of a task and advance the queue
            const continuationCallback = () => {
                this._isProcessing = false;
                this._initiateProcessing(); // Schedule next task
            };

            try {
                // Execute the routine, passing the continuation callback
                // If the routine is async (e.g., file read), it will call continuationCallback itself.
                // Otherwise, we schedule it after a delay.
                routineToExecute.apply(this, nextJob.args.concat(continuationCallback));

                // For synchronous routines, ensure continuation is called after delay
                if (!nextJob.isExternalAsync) {
                     setTimeout(continuationCallback, this.processingDelay);
                }
            } catch (error) {
                this._rejectCurrentPromise(error);
                this.completionHandler(error, null);
                this._isProcessing = false;
                this.operationQueue = [];
            }
        }

        _resolveCurrentPromise(value) {
            if (this._currentPromiseResolve) {
                this._currentPromiseResolve(value);
                this._currentPromiseResolve = null;
                this._currentPromiseReject = null;
            }
        }

        _rejectCurrentPromise(error) {
            if (this._currentPromiseReject) {
                this._currentPromiseReject(error);
                this._currentPromiseResolve = null;
                this._currentPromiseReject = null;
            }
        }

        // Adds an operation to the queue and returns a promise for the chain's completion
        _addOperation(routineName, args, isExternalAsync = false) {
            this.operationQueue.push({ routine: routineName, args: args, isExternalAsync: isExternalAsync });
            if (!this._currentPromiseResolve) { // If no promise is active, create a new one
                return new Promise((resolve, reject) => {
                    this._currentPromiseResolve = resolve;
                    this._currentPromiseReject = reject;
                    this._initiateProcessing();
                });
            } else {
                return this; // For chaining, return the current instance
            }
        }

        // --- Public Chainable Methods ---

        // Configures the handler for processing completion
        onCompletion(handlerFunction) {
            this.completionHandler = handlerFunction;
            return this;
        }

        // Initiates data acquisition from a file input element
        acquireDataFromFile(inputElementSelector) {
            return this._addOperation('handleFileInput', [inputElementSelector], true); // true as file input is external async
        }

        // Handles file input change event and reads content
        handleFileInput(selector, onTaskComplete) {
            const targetElement = document.querySelector(selector);
            if (!targetElement || targetElement.type !== 'file') {
                throw new Error("GridHandler: Invalid file input selector: " + selector);
            }

            const fileReadEvent = (event) => {
                targetElement.removeEventListener('change', fileReadEvent);
                targetElement.disabled = true;

                if (event.target && event.target.files && event.target.files[0]) {
                    const fileToProcess = event.target.files[0];
                    const reader = new FileReader();
                    reader.onerror = (e) => {
                        this.completionHandler("GridHandler: File read error: " + e.target.error, null);
                        onTaskComplete();
                    };
                    reader.onload = (e) => {
                        try {
                            this.currentMatrix = this.utilityKit.textToGrid(e.target.result);
                            onTaskComplete();
                        } catch (parseError) {
                            this.completionHandler("GridHandler: File parsing error: " + parseError, null);
                            onTaskComplete();
                        }
                    };
                    reader.readAsText(fileToProcess);
                } else {
                    this.completionHandler("GridHandler: No file selected or invalid event target.", null);
                    onTaskComplete();
                }
            };
            targetElement.addEventListener('change', fileReadEvent, { once: true });
        }

        // Initiates data acquisition from an HTML table in the DOM
        acquireDataFromHtmlTable(tableSelector) {
            return this._addOperation('acquireTableData', [tableSelector]);
        }

        // Processes raw text content into the data grid
        processTextData(rawTextContent) {
            return this._addOperation('textToGrid', [rawTextContent]);
        }

        // Ensures all applicable entries in the grid are numbers
        convertEntriesToNumbers() {
            return this._addOperation('numericGrid', [this.currentMatrix]);
        }

        // Extracts a subset of data based on row and column specifications
        extractDataSubset(rowIndexRange, columnDefinitions) {
            return this._addOperation('extractSubgrid', [this, rowIndexRange, columnDefinitions]);
        }

        // Generates a matrix of uniform random values
        createUniformMatrix(dimensions) {
            return this._addOperation('generateUniform', [dimensions]);
        }

        // Generates a matrix of normal random values
        createNormalMatrix(dimensions) {
            return this._addOperation('generateNormal', [dimensions]);
        }

        // Generates an identity matrix
        createIdentityMatrix(dimensions) {
            return this._addOperation('generateIdentity', [dimensions]);
        }

        // Generates a diagonal matrix from an array
        createDiagonalMatrix(diagonalArray) {
            return this._addOperation('generateDiagonal', [diagonalArray]);
        }

        // Fills a matrix with a specific value
        fillMatrix(dimensions, value) {
            return this._addOperation('populateGrid', [dimensions, value]);
        }

        // Applies a custom function to generate matrix cells
        applyFunctionToMatrix(dimensions, cellGeneratorFunction) {
            return this._addOperation('applyGridFunc', [dimensions, cellGeneratorFunction]);
        }

        // Calculates column averages
        calculateColumnAverage() {
            return this._addOperation('columnMean', [this.currentMatrix]);
        }

        // Calculates column variances
        calculateColumnVariance(sampleCorrection = false, zeroMeanAssumption = false) {
            return this._addOperation('columnVariance', [this.currentMatrix, sampleCorrection, zeroMeanAssumption]);
        }

        // Renders the current data matrix as an HTML table
        displayAsHtmlTable(renderOptions) {
            return this._addOperation('renderTable', [this.currentMatrix, renderOptions]);
        }

        // Retrieves data from persistent storage
        retrieveFromStorage(storageKey) {
            return this._addOperation('retrievePersistent', [storageKey]);
        }

        // Stores current data to persistent storage
        storeToStorage(storageKey, metadata) {
            return this._addOperation('storePersistent', [storageKey, this.currentMatrix, metadata]);
        }

        // Finalizes the processing chain, returning a Promise
        finalizeProcessing() {
            if (this._currentPromiseResolve) {
                const finalPromise = new Promise((resolve, reject) => {
                    // Re-assign resolver/rejector to capture the final call
                    const originalResolve = this._currentPromiseResolve;
                    const originalReject = this._currentPromiseReject;
                    this._currentPromiseResolve = (val) => { originalResolve(val); resolve(val); };
                    this._currentPromiseReject = (err) => { originalReject(err); reject(err); };
                });
                // Ensure processing starts if not already
                this._initiateProcessing();
                return finalPromise;
            } else if (this.operationQueue.length > 0) {
                 // If operations were added but no promise was initiated (e.g., if begin was called with data)
                 // This should ideally not happen with current _addOperation logic.
                 return new Promise((resolve, reject) => {
                    this._currentPromiseResolve = resolve;
                    this._currentPromiseReject = reject;
                    this._initiateProcessing();
                 });
            } else {
                return Promise.resolve(this.currentMatrix); // No operations, resolve immediately
            }
        }
    }

    // Expose a factory for creating new processing pipelines
    window.GridHandlerFactory = {
        // Initializes a new processing chain, optionally with initial data
        initialize: function(initialGridData = []) {
            const newProcessor = new GridHandler();
            if (initialGridData.length > 0) {
                newProcessor.currentMatrix = initialGridData;
            }
            return newProcessor;
        },
        // Allows extending the core utility functions
        addCustomRoutines: function(newRoutinesObject) {
            Object.assign(auxiliaryRoutines, newRoutinesObject);
        }
    };

})();