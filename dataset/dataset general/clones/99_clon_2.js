/*
 *  data_grid.js (C) Copyright 2023 Acme Corp.
 *  This Javascript module is provided as Free Software and includes NO WARRANTY whatsoever.
 *
 *  The licensor grants permission to utilize this free software under the conditions
 *  of the MIT License, which can be reviewed at https://opensource.org/licenses/MIT
 *
 *  Certain entities may prefer alternative licensing arrangements.
 *
 *  Commercial licenses are obtainable from the author and may permit uses not covered
 *  by the MIT License. The author's contact information is available on GitHub
 *  via https://github.com/yourusername
 *
 *  Uses necessitating a commercial license encompass, but are not limited to,
 *  distributing or serving an obfuscated or compiled version of this software
 *  without providing the complete, human-readable source code; integrating this
 *  software within the same JavaScript file as other proprietary software not
 *  licensed under similar free terms; embedding the software into hardware
 *  such that end-user viewing or modification is prevented; or altering or
 *  removing these notices or copyright information in ways inconsistent with
 *  the free license. This list is not exhaustive.
 */
"use strict";

if (typeof window.jQuery === 'undefined') {
  console.log("DataGrid: jQuery is not loaded. Please load jQuery before data_grid.js");
  throw "DataGrid: jQuery is not loaded";
}

window.DataGrid = (function() {

  var gridOperations = {
    'addEntry': addEntry,
    'invokeAction': invokeAction,
    'horizontalSlice': horizontalSlice,
    'renderTable': renderTable,
    'dataEditor': dataEditor,
    'plotData': plotData,
    'addColumn': addColumn,
    'linearRegression': linearRegression,
    'storeData': storeData,
    'retrieveFile': retrieveFile,
    'principalComponentAnalysis': principalComponentAnalysis
  };

  var gridUtilities = {
    operationDelay: 75, // Time between async operations
    specialMatrixCreators: { // Definitions for special matrix generation
      '%R': ['randomUniformMatrix', 'dimensions'],
      '%G': ['gaussianRandomMatrix', 'dimensions'],
      '%U': ['unitMatrix', 'dimensions'],
      '%E': ['elementMatrix', 'elements'],
      '%C': ['computedMatrix', 'dimensions', 'computationFunction']
    },
    completionHandler: function(errVal, resultData) { // Callback on task completion or error
      if (errVal) {
        console.error("DataGrid Error:", errVal);
      }
    },
    populateMatrix: function(matrixDims, fillValue) { // Fills a matrix with a given value
      var rowCount = matrixDims[0];
      var colCount = matrixDims[1];
      var rowIndex, colIndex;
      var tempRow = [];
      var allRows = [];
      for (colIndex = 0; colIndex < colCount; ++colIndex) {
        tempRow[colIndex] = fillValue;
      }
      for (rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
        allRows.push(tempRow.slice(0));
      }
      return allRows;
    },
    computedMatrix: function(dimensions, computationFunction) { // Creates a matrix by applying a function to (i,j)
      var rowLen = dimensions[0];
      var colLen = dimensions[1];
      var rowIndex, colIndex;
      var computedResult = [];
      for (rowIndex = 0; rowIndex < rowLen; ++rowIndex) {
        computedResult.push([]);
      }
      for (rowIndex = 0; rowIndex < rowLen; ++rowIndex) {
        for (colIndex = 0; colIndex < colLen; ++colIndex) {
          computedResult[rowIndex][colIndex] = computationFunction(rowIndex, colIndex);
        }
      }
      return computedResult;
    },
    randomUniformMatrix: function(dimensions) { // Generates a matrix with uniform random numbers
      var numRows = dimensions[0];
      var numCols = dimensions[1];
      var rowIndex, colIndex;
      var outputMatrix = [];
      var outputRow;
      for (rowIndex = 0; rowIndex < numRows; ++rowIndex) {
        outputMatrix[rowIndex] = [];
        outputRow = outputMatrix[rowIndex];
        for (colIndex = 0; colIndex < numCols; ++colIndex) {
          outputRow[colIndex] = Math.random();
        }
      }
      return outputMatrix;
    },
    gaussianRandomMatrix: function(dimensions) { // Generates a matrix with normal random numbers (Box-Muller)
      /*
       *  Returns a matrix populated with independent random normals, mean 0, variance 1.
       *  Utilizes the Box-Muller Transform from uniform distributions.
       *  See: http://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
       */
      function gaussianPairGenerator(quantity) {
        var numPairs = 1 + Math.floor(quantity / 2);
        var randomSamples = [];
        var sampleIndex;
        var uniform1, uniform2, radius, angle;
        for (sampleIndex = 0; sampleIndex < numPairs; ++sampleIndex) {
          uniform1 = Math.random();
          uniform2 = Math.random();
          radius = Math.sqrt(-2 * Math.log(uniform1));
          angle = 2 * Math.PI * uniform2;
          randomSamples.push(radius * Math.cos(angle));
          randomSamples.push(radius * Math.sin(angle));
        }
        return randomSamples;
      }
      var normalSamples = gaussianPairGenerator(dimensions[0] * dimensions[1]);
      var outputMatrix = [];
      var currRow, currCol, maxRows = dimensions[0],
        maxCols = dimensions[1];
      for (currRow = 0; currRow < maxRows; ++currRow) {
        outputMatrix[currRow] = [];
        for (currCol = 0; currCol < maxCols; ++currCol) {
          outputMatrix[currRow][currCol] = normalSamples.shift();
        }
      }
      return outputMatrix;
    },
    unitMatrix: function(dimensions) { // Creates an identity matrix
      var numR = dimensions[0];
      var numC = dimensions[1];
      var unitOutput = this.populateMatrix(dimensions, 0);
      var rowIndex, minDim = Math.min(numR, numC);
      for (rowIndex = 0; rowIndex < minDim; ++rowIndex) {
        unitOutput[rowIndex][rowIndex] = 1;
      }
      return unitOutput;
    },
    elementMatrix: function(elements) { // Creates a diagonal matrix from an array
      var elementOutput = this.populateMatrix([elements.length, elements.length], 0);
      var rowIndex, diagLength = elements.length;
      for (rowIndex = 0; rowIndex < diagLength; ++rowIndex) {
        elementOutput[rowIndex][rowIndex] = elements[rowIndex];
      }
      return elementOutput;
    },
    extractSubgrid: function(rowIndices, columnIdentifiers) { // Extracts a submatrix from the main data
      var utilityRef = this;
      var columnList, columnIndexList;
      var currR, maxR, currC, maxC;
      var extractedMatrix = [];
      if ((!utilityRef.gridData) ||
        (!utilityRef.gridData.rows) ||
        (!utilityRef.gridData.rows.length)) {
        throw "DataGrid: utilityRef.extractSubgrid invalid utilityRef.gridData.rows.length";
      }
      var firstRow = utilityRef.gridData.rows[0];
      var allGridRows = utilityRef.gridData.rows;
      var currentRow = [];
      rowIndices = rowIndices || [1, utilityRef.gridData.rows.length];
      if (!rowIndices[0]) rowIndices[0] = 1;
      if (!rowIndices[1]) rowIndices[1] = utilityRef.gridData.rows.length;
      columnList = columnIdentifiers || [utilityRef.gridData.rows[0].slice(0)];
      columnIndexList = [];
      if ((!columnList) || (!columnList.length)) {
        throw "DataGrid: utilityRef.extractSubgrid invalid columnList.length";
      }
      for (currR = 0, maxR = columnList.length; currR < maxR; ++currR) {
        columnIndexList.push(
          ((typeof columnList[currR] === 'string') ? firstRow.indexOf(columnList[currR]) : -1)
        );
      }
      maxC = columnIndexList.length;
      if (!maxC) {
        throw "DataGrid: utilityRef.extractSubgrid invalid columnIndexList.length";
      }
      for (currR = rowIndices[0], maxR = rowIndices[1]; currR < maxR; ++currR) {
        currentRow = [];
        for (currC = 0; currC < maxC; ++currC) {
          if (columnIndexList[currC] >= 0) {
            currentRow.push(allGridRows[currR][columnIndexList[currC]]);
          } else if (typeof columnList[currC] === 'number') {
            currentRow.push(columnList[currC]);
          } else if (typeof columnList[currC] === 'function') {
            currentRow.push((columnList[currC])(currR, currC, allGridRows[currR]));
          } else {
            currentRow.push(null);
          }
        }
        extractedMatrix.push(currentRow);
      }
      return extractedMatrix;
    },
    convertNumerics: function(inputRows) { // Converts string numbers in a matrix to actual numbers
      var rIdx, cIdx, colCount, rowCount, cellValue, parsedFloat;
      for (rIdx = 0, rowCount = inputRows.length; rIdx < rowCount; ++rIdx) {
        for (cIdx = 0, colCount = inputRows[rIdx].length; cIdx < colCount; ++cIdx) {
          cellValue = inputRows[rIdx][cIdx];
          // Refer to isnumeric discussions at http://stackoverflow.com/a/1830844/103081
          if (typeof cellValue === 'string') {
            parsedFloat = parseFloat(cellValue);
            if (!isNaN(parsedFloat) && isFinite(cellValue)) {
              inputRows[rIdx][cIdx] = parsedFloat;
            }
          }
        }
      }
      return inputRows;
    },
    simpleParseTabular: function(inputText, delimiterChar, lineSeparator) { // Basic CSV parser (no quotes)
      var textLines = inputText.split(lineSeparator);
      var parsedMatrix = [];
      var idx, len;
      for (idx = 0, len = textLines.length; idx < len; ++idx) {
        parsedMatrix[idx] = textLines[idx].split(delimiterChar);
      }
      return parsedMatrix;
    },
    robustParseTabular: function(inputContent, quoteChar, delimChar, lineBreak, trimChar) { // Advanced CSV parser (handles quotes)
      var charIndex, currentChar, currentField, currentRowData, fullMatrix, inQuote;
      // Objective: Parse according to RFC4180
      fullMatrix = [];
      currentRowData = [];
      currentField = '';
      inQuote = false;
      charIndex = 0;
      while (charIndex < inputContent.length) {
        currentChar = inputContent.charAt(charIndex);
        if (currentChar === quoteChar) {
          if (currentField.length === 0) {
            inQuote = !inQuote;
          } else if ((inputContent.length > (charIndex + 1)) &&
            (inputContent.charAt(charIndex + 1) === quoteChar)
          ) {
            ++charIndex;
            currentField += quoteChar;
          } else if (inQuote) {
            inQuote = false;
          } else {
            // If a quote appears here, it does not conform to RFC4180.
            // currentField += quoteChar; // We could optionally include it.
          }
        } else if (currentChar === delimChar) {
          if (inQuote) {
            currentField += delimChar;
          } else {
            currentRowData.push(currentField);
            currentField = '';
          }
        } else if (currentChar === lineBreak) {
          if (inQuote) {
            currentField += lineBreak;
          } else {
            if (currentField.length > 0) {
              currentRowData.push(currentField);
              currentField = '';
            }
            fullMatrix.push(currentRowData);
            currentRowData = [];
          }
        } else if ((currentChar === trimChar) && (currentField.length === 0)) {
          // Skip leading whitespace if field is empty
        } else {
          currentField += currentChar;
        }
        ++charIndex;
      }
      if (currentField.length > 0) currentRowData.push(currentField);
      if (currentRowData.length > 0) fullMatrix.push(currentRowData);
      return fullMatrix;
    },
    processTabularData: function(rawData) { // Orchestrates CSV parsing based on content
      var utilContext = this;
      // If no quotes are present, a simple split on newline and comma suffices.
      // With quotes, character-by-character parsing is required.
      var lineBreakStr = "\n",
        quoteCharStr = '"',
        delimCharStr = ",",
        spaceCharStr = " ";
      var parsedContent;
      if (rawData.indexOf(quoteCharStr) === -1) {
        parsedContent = utilContext.simpleParseTabular(rawData, delimCharStr, lineBreakStr);
      } else {
        parsedContent = utilContext.robustParseTabular(rawData, quoteCharStr, delimCharStr, lineBreakStr, spaceCharStr);
      }
      return utilContext.convertNumerics(parsedContent);
    },
    loadFromFile: function(selectorId) { // Handles loading data from a user-selected file
      var utilContext = this;
      if (!utilContext.gridData.rows) utilContext.gridData.rows = [];
      var eventActive = true;
      var selectedFile, fileReader;
      var fileLoadSuccess = function(eventObj) {
        try {
          utilContext.gridData.rows = utilContext.processTabularData(eventObj.target.result);
        } catch (e) {
          utilContext.completionHandler("DataGrid: utilContext.loadFromFile fileLoadSuccess handler error: " + e);
        }
        utilContext.processNextOperation();
      };
      var fileLoadError = function(e) {
        throw "DataGrid.utilContext: file fetch error: " + e;
      };
      var fileInputChange = function(changeEvent) {
        if (eventActive) {
          eventActive = false;
          if (changeEvent.target &&
            changeEvent.target.files &&
            changeEvent.target.files[0]
          ) {
            selectedFile = changeEvent.target.files[0];
            fileReader = new FileReader();
            fileReader.onerror = fileLoadError;
            fileReader.onload = fileLoadSuccess;
            fileReader.readAsText(selectedFile);
          } else {
            throw "DataGrid utilContext.loadFromFile fileInputChange expected changeEvent.target.files";
          }
        }
        $(selectorId).off('change', fileInputChange);
        $(selectorId).prop('disabled', true);
      };
      $(selectorId + '[type="file"]').on('change', fileInputChange);
    },
    extractFromHtmlTable: function(tableSelector) { // Extracts data from an HTML table
      return $(tableSelector + ' tr').map(function(idx) {
        var tableRowData = [];
        var cellContent;
        $(this).find('th,td').each(function(cellIdx) {
          cellContent = $(this).text();
          // Correcting for issue #1: trim whitespace and newlines
          cellContent = $.trim(cellContent);
          // End correction
          if (isNaN(cellContent)) {
            if (cellContent === 'null') cellContent = null;
            if (cellContent === 'undefined') cellContent = undefined;
          } else if (cellContent === '') {
            cellContent = '';
          } else cellContent = 1 * cellContent; // Convert to number
          tableRowData[cellIdx] = cellContent;
        });
        return [tableRowData]; // Wrap in an array to prevent flattening by .map
      }).get();
    },
    getColumn: function(inputMatrix, columnIndex) { // Retrieves a specific column as an array
      var rowIndex, numRows, columnVector = [];
      for (rowIndex = 0, numRows = inputMatrix.length; rowIndex < numRows; ++rowIndex) {
        columnVector.push(inputMatrix[rowIndex][columnIndex]);
      }
      return columnVector;
    },
    columnAverage: function(inputArray) { // Calculates the average of each column
      var rIdx, rLen, cIdx, cLen, sumVector = [];
      for (rIdx = 0, rLen = inputArray[0].length; rIdx < rLen; ++rIdx) sumVector[rIdx] = 0;
      for (rIdx = 0, rLen = inputArray.length; rIdx < rLen; ++rIdx)
        for (cIdx = 0, cLen = sumVector.length; cIdx < cLen; ++cIdx)
          sumVector[cIdx] += inputArray[rIdx][cIdx] / rLen;
      return sumVector;
    },
    columnAverageSquare: function(inputMatrix) { // Calculates the average of squares for each column
      var rIdx, rLen, cIdx, cLen, val, sumSqVector = [];
      for (rIdx = 0, rLen = inputMatrix[0].length; rIdx < rLen; ++rIdx) sumSqVector[rIdx] = 0;
      for (rIdx = 0, rLen = inputMatrix.length; rIdx < rLen; ++rIdx)
        for (cIdx = 0, cLen = sumSqVector.length; cIdx < cLen; ++cIdx) {
          val = inputMatrix[rIdx][cIdx];
          sumSqVector[cIdx] += (val * val) / rLen;
        }
      return sumSqVector;
    },
    columnVariance: function(inputData, smallSampleCorrection, assumeZeroMean) { // Computes variance for each column
      // smallSampleCorrection: boolean option for Bessel's correction (n-1 denominator)
      // assumeZeroMean: boolean option to treat sample mean as 0.0
      var avgOfSquares = this.columnAverageSquare(inputData);
      var dataMean = this.columnAverage(inputData);
      var correctionFactor = (smallSampleCorrection) ? (inputData.length / (inputData.length - 1)) : 1;
      var idx, len, meanSquared = [],
        varianceResult = [];
      for (idx = 0, len = inputData[0].length; idx < len; ++idx) {
        meanSquared[idx] = (assumeZeroMean) ? 0 : (dataMean[idx] * dataMean[idx]);
        varianceResult[idx] = correctionFactor * (avgOfSquares[idx] - meanSquared[idx]);
      }
      return varianceResult;
    },
    processNextOperation: function(xhrObject, statusMessage) { // Advances the task queue
      var utilContext = this;
      var currentOperation;
      if (statusMessage && statusMessage !== "success") {
        return utilContext.completionHandler("DataGrid: AJAX error: " + statusMessage);
      }
      if ((typeof utilContext.pendingOperations === 'object') && (utilContext.pendingOperations.length > 0)) {
        currentOperation = utilContext.pendingOperations.shift();
        return setTimeout(
          function() {
            var operationFunction = currentOperation.f;
            if (typeof operationFunction !== 'function') {
              operationFunction = gridOperations[currentOperation.f];
            }
            if (typeof operationFunction !== 'function') {
              throw "DataGrid: utilContext.processNextOperation encountered unknown task in queue";
            }
            try {
              return operationFunction.apply(utilContext, currentOperation.a);
            } catch (e) {
              utilContext.pendingOperations = 'in error completionHandler'; // Mark queue state
              utilContext.completionHandler(e, null);
              utilContext.pendingOperations = 0; // Reset queue for re-arming
              return;
            }
          },
          utilContext.operationDelay
        );
      }
      // If task list is empty
      if ((typeof utilContext.pendingOperations === 'object') && (utilContext.pendingOperations.length === 0)) {
        utilContext.pendingOperations = 'in completionHandler'; // Mark queue state
        utilContext.completionHandler(null, utilContext.gridData);
        utilContext.pendingOperations = 0; // Reset queue to allow re-arming
        // Call completionHandler first to allow simple callbacks to finish
        // before any `finalize()` could restart the process.
        return;
      }
      throw "Error: processNextOperation called after completionHandler execution";
    }
  };

  var GRID_API_EXPORT = {
    'startProcessing': startProcessing,
    'addExtensions': addExtensions,
  };

  function addExtensions(newGridOperations, newGridUtilities) { // Extends the API with new functions or utilities
    if (typeof newGridOperations === "object") {
      $.extend(gridOperations, newGridOperations);
    } else {
      throw "DataGrid: addExtensions newGridOperations must be an object with function values or null.";
    }
    if (typeof newGridUtilities === "object") {
      $.extend(gridUtilities, newGridUtilities);
    } else if (typeof newGridUtilities === "undefined") {
      // No action needed for undefined utilities
    } else {
      throw "DataGrid: addExtensions newGridUtilities must be an object or null/undefined.";
    }
    return GRID_API_EXPORT;
  }

  function actionSequencer(availableActions, predefinedActions, actionQueue) { // Creates a chainable API for operations
    var sequenceMethods = {};
    var idx, len;

    function createActionBinder(funcRef) {
      return function() {
        actionQueue.push({
          f: funcRef,
          a: Array.prototype.slice.call(arguments)
        });
        return sequenceMethods;
      };
    }
    for (idx = 0, len = availableActions.length; idx < len; ++idx) {
      sequenceMethods[availableActions[idx]] = createActionBinder(availableActions[idx]);
    }
    for (idx = 0, len = predefinedActions.length; idx < len; ++idx) {
      sequenceMethods[predefinedActions[2 * idx]] = predefinedActions[2 * idx + 1];
    }
    return sequenceMethods;
  }

  function generateHtmlTable(dataRows, renderOptions) { // Renders data into an HTML table string
    var htmlBuffer = [];
    if (!dataRows || !dataRows.length) {
      throw "DataGrid: generateHtmlTable received no rows or invalid rows data.";
    }
    var rowIndex = 0,
      rowCount = dataRows.length,
      currentRowData = [];
    var colIndex, colCount;

    function appendHtmlTag(tagName, tagOptions, optionArgs) {
      var idx, resolvedOptions;
      if (typeof tagOptions === 'object') {
        resolvedOptions = tagOptions;
      } else if (typeof tagOptions === 'function') {
        resolvedOptions = tagOptions.apply({}, optionArgs);
      } else {
        resolvedOptions = {};
      }
      htmlBuffer.push('<', tagName);
      for (idx in resolvedOptions) {
        if (resolvedOptions.hasOwnProperty(idx)) {
          htmlBuffer.push(' ', idx, '="', resolvedOptions[idx], '" ');
        }
      }
      htmlBuffer.push('>');
    }
    appendHtmlTag('table', renderOptions.table);
    if (renderOptions.caption) {
      appendHtmlTag('caption', renderOptions.captionOpt);
      htmlBuffer.push(renderOptions.caption);
      htmlBuffer.push('</caption>');
    }
    rowIndex = 0;
    if (renderOptions.hasHeader || renderOptions.useThead) {
      currentRowData = dataRows[0];
      appendHtmlTag('thead', renderOptions.thead);
      appendHtmlTag('tr', renderOptions.theadRowOptions, [0]);
      for (colIndex = 0, colCount = currentRowData.length; colIndex < colCount; ++colIndex) {
        appendHtmlTag('th', renderOptions.headerCellOptions, [rowIndex, colIndex, currentRowData[colIndex]]);
        htmlBuffer.push(currentRowData[colIndex], '</th>');
      }
      htmlBuffer.push('</tr></thead>');
      rowIndex = 1;
    }
    appendHtmlTag('tbody', renderOptions.bodyOptions);
    for (; rowIndex < rowCount; ++rowIndex) {
      appendHtmlTag('tr', renderOptions.rowOptions, [rowIndex]);
      currentRowData = dataRows[rowIndex];
      for (colIndex = 0, colCount = currentRowData.length; colIndex < colCount; ++colIndex) {
        appendHtmlTag('td', renderOptions.dataCellOptions, [rowIndex, colIndex, currentRowData[colIndex]]);
        if ((renderOptions.cellContentGenerator) && (typeof renderOptions.cellContentGenerator === 'function')) {
          htmlBuffer.push(renderOptions.cellContentGenerator(rowIndex, colIndex, currentRowData[colIndex]));
        } else {
          htmlBuffer.push(currentRowData[colIndex]);
        }
        htmlBuffer.push('</td>');
      }
      htmlBuffer.push('</tr>');
    }
    htmlBuffer.push('</tbody></table>');
    return htmlBuffer.join('');
  }

  function retrieveLocalData(dataKeyName) { // Fetches data from localStorage or sessionStorage
    var keyParts = dataKeyName.split('/');
    var parsedData, jsonData;
    if ((keyParts[0] !== 'local') &&
      (keyParts[0] !== 'session')
    ) {
      throw "DataGrid: retrieveLocalData must be from local/ or session/, received: " + dataKeyName;
    }
    jsonData = window[keyParts[0] + 'Storage'].getItem(dataKeyName);
    if ((jsonData === null) || (typeof jsonData === 'undefined')) {
      throw 'DataGrid: ' + dataKeyName + ' not found in local storage';
    }
    if ((window.LZString) &&
      (typeof window.LZString.decompressFromUTF16 === 'function')
    ) {
      parsedData = JSON.parse(LZString.decompressFromUTF16(jsonData));
    } else {
      parsedData = JSON.parse(jsonData);
    }
    return parsedData;
  }

  function storeLocalData(dataIdentifier, gridContent, metadataObject) { // Stores data into localStorage or sessionStorage
    var utilContext = this;
    var keyParts = dataIdentifier.split('/');
    var jsonString;
    if ((keyParts[0] !== 'local') &&
      (keyParts[0] !== 'session')
    ) {
      throw "DataGrid: storeLocalData must be to local/ or session/, received: " + dataIdentifier;
    }
    if (gridContent) {
      if (!utilContext.gridData) utilContext.gridData = {};
      if (metadataObject) {
        utilContext.gridData.meta = metadataObject;
      }
      utilContext.gridData.rows = gridContent;
    }
    if ((window.LZString) &&
      (typeof window.LZString.compressToUTF16 === 'function')
    ) {
      jsonString = LZString.compressToUTF16(JSON.stringify(utilContext.gridData));
    } else {
      jsonString = JSON.stringify(utilContext.gridData);
    }
    window[keyParts[0] + 'Storage'].setItem(dataIdentifier, jsonString);
    utilContext.processNextOperation();
  }

  function deleteLocalData(dataIdentifier) { // Removes data from local/session storage
    var keyParts = dataIdentifier.split('/');
    if ((keyParts[0] !== 'local') &&
      (keyParts[0] !== 'session')
    ) {
      throw "DataGrid: deleteLocalData must be from local/ or session/, received: " + dataIdentifier;
    }
    window[keyParts[0] + 'Storage'].removeItem(dataIdentifier);
    this.processNextOperation();
  }

  function startProcessing(initialData, initialMeta) { // Initializes the data grid process
    var todoList = [];
    var initialContext = {
      gridData: {
        rows: initialData || [],
        meta: initialMeta || {}
      },
      pendingOperations: todoList,
      completionHandler: gridUtilities.completionHandler,
      operationDelay: gridUtilities.operationDelay
    };
    $.extend(initialContext, gridUtilities); // Inherit all utility functions

    // Add immediate tasks if data is supplied
    if (initialData && typeof initialData === 'string') {
      if (initialData.indexOf('/') >= 0) { // Check for path-like string (e.g., local/data)
        todoList.push({
          f: retrieveLocalData,
          a: [initialData]
        });
      } else { // Assume it's raw CSV text
        initialContext.gridData.rows = initialContext.processTabularData(initialData);
      }
    }

    // This creates the chainable interface
    return actionSequencer(
      Object.keys(gridOperations), [
        'data',
        function(d, m) {
          if (d) initialContext.gridData.rows = d;
          if (m) initialContext.gridData.meta = m;
          return this;
        },
        'finalize',
        function(cb) {
          initialContext.completionHandler = cb || gridUtilities.completionHandler;
          initialContext.processNextOperation();
        }
      ],
      todoList
    );
  }

  return GRID_API_EXPORT; // Export the public API
})();