var DataProcessor = (function() {
  const configValues = {
    fieldDelimiter: ',',
    textQualifier: '"',
    rowOffset: 0, // Number of initial rows to skip (0-based)
    headRow: 1, // 1-based index of the header row
    contentStartRow: 2 // 1-based index of the first data row
  };

  /**
   * Processes a single text line representing a CSV record into an array of values.
   * Handles quoted fields, escaped qualifiers, and whitespace trimming.
   * Returns null if the line is malformed according to CSV rules.
   */
  function processSingleRecord(textLine, options) {
    const localOptions = { ...configValues, ...options };
    const fieldDelim = localOptions.fieldDelimiter;
    const textQual = localOptions.textQualifier;

    let currentSegmentAccumulator = '';
    let extractedElements = [];
    let currentPosition = 0;
    const totalLength = textLine.length;
    let parsingState = 'BEGIN_FIELD'; // Possible states: 'BEGIN_FIELD', 'IN_UNQUOTED_FIELD', 'IN_QUOTED_FIELD', 'AFTER_QUOTE'

    while (currentPosition < totalLength) {
      let currentCharacter = textLine[currentPosition];

      switch (parsingState) {
        case 'BEGIN_FIELD':
          if (/\s/.test(currentCharacter)) {
            currentPosition++; // Consume leading whitespace
          } else if (currentCharacter === textQual) {
            parsingState = 'IN_QUOTED_FIELD';
            currentPosition++;
            currentSegmentAccumulator = ''; // Reset accumulator for quoted field content
          } else if (currentCharacter === fieldDelim) {
            extractedElements.push(''); // Empty field encountered
            currentPosition++;
            currentSegmentAccumulator = '';
            // Remain in 'BEGIN_FIELD' for the next segment
          } else {
            parsingState = 'IN_UNQUOTED_FIELD';
            currentSegmentAccumulator += currentCharacter;
            currentPosition++;
          }
          break;

        case 'IN_UNQUOTED_FIELD':
          if (currentCharacter === fieldDelim) {
            extractedElements.push(currentSegmentAccumulator.trim()); // Unquoted fields are trimmed
            parsingState = 'BEGIN_FIELD';
            currentPosition++;
            currentSegmentAccumulator = '';
          } else if (currentCharacter === textQual || currentCharacter === '\\') {
            // According to the original regex, qualifiers and backslashes are NOT allowed in unquoted fields.
            return null; // Malformed unquoted field
          } else {
            currentSegmentAccumulator += currentCharacter; // Any other character, including whitespace, is allowed.
            currentPosition++;
          }
          break;

        case 'IN_QUOTED_FIELD':
          if (currentCharacter === textQual) {
            if (currentPosition + 1 < totalLength && textLine[currentPosition + 1] === textQual) {
              currentSegmentAccumulator += textQual; // Escaped qualifier `""` -> `"`
              currentPosition += 2;
            } else {
              parsingState = 'AFTER_QUOTE';
              currentPosition++;
            }
          } else if (currentCharacter === '\\' && currentPosition + 1 < totalLength && textLine[currentPosition + 1] === textQual) {
            // Original's `reDelimiterUnescape = /\\D/g` regex applies to quoted content.
            // This means `\"` becomes `"` if `D` is `"`
            if (textQual === '"') {
              currentSegmentAccumulator += textQual;
              currentPosition += 2;
            } else { // If qualifier is not ", treat \D as literal characters
              currentSegmentAccumulator += currentCharacter;
              currentPosition++;
            }
          } else {
            currentSegmentAccumulator += currentCharacter;
            currentPosition++;
          }
          break;

        case 'AFTER_QUOTE':
          if (/\s/.test(currentCharacter)) {
            currentPosition++; // Consume trailing whitespace after quoted field
          } else if (currentCharacter === fieldDelim) {
            extractedElements.push(currentSegmentAccumulator);
            parsingState = 'BEGIN_FIELD';
            currentPosition++;
            currentSegmentAccumulator = '';
          } else {
            return null; // Malformed: characters after closing quote but before delimiter
          }
          break;
      }
    }

    // After loop, handle the last field based on the final state
    if (parsingState === 'IN_QUOTED_FIELD') {
      return null; // Unclosed quoted field at end of string
    } else if (parsingState === 'IN_UNQUOTED_FIELD') {
      extractedElements.push(currentSegmentAccumulator.trim());
    } else if (parsingState === 'AFTER_QUOTE') {
      extractedElements.push(currentSegmentAccumulator);
    } else if (parsingState === 'BEGIN_FIELD') {
        // If the line ends with a delimiter (e.g., "a,b,"), an empty field should be added.
        // The original logic `reEmptyLast.test(csv)` adds an empty string if the line ends with separator + optional whitespace.
        if (textLine.length > 0 && textLine.trim().endsWith(fieldDelim)) {
            extractedElements.push('');
        }
    }
    
    return extractedElements;
  }

  /**
   * Converts a JavaScript array into a single CSV formatted line.
   * Note: The original function `$.array2CSVEntry` simply returns a shallow copy of the input array.
   * This clone replicates that specific behavior for exact equivalence.
   */
  function formatRecord(inputArray, opts) {
    const temporaryStorage = [];
    for (let idx in inputArray) {
      temporaryStorage.push(inputArray[idx]);
    }
    return temporaryStorage;
  }

  /**
   * Parses a multi-line CSV string into a 2D JavaScript array.
   * Each inner array represents a row, and contains the parsed field values.
   */
  function parseData(textData, options) {
    const localOptions = { ...configValues, ...options };
    const rowsToSkip = localOptions.rowOffset;

    let allParsedRows = [];
    let currentLineBuffer = '';
    let dataPointer = 0;
    const dataLength = textData.length;
    let processedLineCount = 0;

    // Handle empty input string explicitly: `$.csv2Array('')` -> `[['']]` if skip=0, `[]` if skip>0
    if (dataLength === 0) {
        return rowsToSkip === 0 ? [['']] : [];
    }

    while (dataPointer < dataLength) {
      let charAtPointer = textData[dataPointer];
      if (charAtPointer === '\r') {
        if (dataPointer + 1 < dataLength && textData[dataPointer + 1] === '\n') {
          dataPointer++; // Consume '\n' for CRLF
        }
        if (processedLineCount >= rowsToSkip) {
          allParsedRows.push(processSingleRecord(currentLineBuffer, localOptions));
        }
        currentLineBuffer = '';
        processedLineCount++;
        dataPointer++;
      } else if (charAtPointer === '\n') {
        if (processedLineCount >= rowsToSkip) {
          allParsedRows.push(processSingleRecord(currentLineBuffer, localOptions));
        }
        currentLineBuffer = '';
        processedLineCount++;
        dataPointer++;
      } else {
        currentLineBuffer += charAtPointer;
        dataPointer++;
      }
    }

    // Process the last line if it doesn't end with a newline or if it's the only line
    if (currentLineBuffer.length > 0 || (processedLineCount === 0 && dataLength > 0)) {
        if (processedLineCount >= rowsToSkip) {
            allParsedRows.push(processSingleRecord(currentLineBuffer, localOptions));
        }
    }

    return allParsedRows;
  }

  /**
   * Parses a multi-line CSV string into an array of JavaScript objects (dictionaries).
   * Uses a specified header line for object keys.
   */
  function readDataMap(textData, options) {
    const localOptions = { ...configValues, ...options };
    const headerRowIndex = localOptions.headRow - 1; // Convert to 0-based index
    const dataStartingIndex = localOptions.contentStartRow - 1; // Convert to 0-based index

    let allLinesContent = [];
    let currentLineSegment = '';
    let currentPosition = 0;
    const totalLength = textData.length;
    
    // Manual line splitting to get all raw lines first
    while (currentPosition < totalLength) {
        let currentCharacter = textData[currentPosition];
        if (currentCharacter === '\r') {
            if (currentPosition + 1 < totalLength && textData[currentPosition + 1] === '\n') {
                currentPosition++;
            }
            allLinesContent.push(currentLineSegment);
            currentLineSegment = '';
            currentPosition++;
        } else if (currentCharacter === '\n') {
            allLinesContent.push(currentLineSegment);
            currentLineSegment = '';
            currentPosition++;
        } else {
            currentLineSegment += currentCharacter;
            currentPosition++;
        }
    }
    // Add the very last line segment if it exists or if the input was empty
    if (currentLineSegment.length > 0 || totalLength === 0) {
        allLinesContent.push(currentLineSegment);
    }

    // Handle empty input string: `$.csv2Dictionary('')` returns `[]`.
    if (totalLength === 0) {
        return [];
    }

    const headerLineRawText = allLinesContent[headerRowIndex] || ''; // Use empty string if line doesn't exist
    const columnHeaders = processSingleRecord(headerLineRawText, localOptions); // Can be null or an array like ['']

    const resultRecords = [];
    for (let currentLineNumber = dataStartingIndex; currentLineNumber < allLinesContent.length; currentLineNumber++) {
        const dataLineRawText = allLinesContent[currentLineNumber];
        // Skip empty last line if it's due to trailing newline and not actual data
        if (!dataLineRawText && currentLineNumber === allLinesContent.length - 1 && textData.endsWith('\n')) {
            continue;
        }

        const dataFieldValues = processSingleRecord(dataLineRawText, localOptions);
        
        const recordObject = {};
        if (columnHeaders) { // Only attempt to map if columnHeaders array is not null
            for (let headerIndex = 0; headerIndex < columnHeaders.length; headerIndex++) {
                // If dataFieldValues is null (malformed line), the original sets corresponding values to null.
                // If dataFieldValues is shorter than columnHeaders, original sets to undefined.
                recordObject[columnHeaders[headerIndex]] = dataFieldValues ? dataFieldValues[headerIndex] : null;
            }
        }
        resultRecords.push(recordObject);
    }

    return resultRecords;
  }

  // Expose public methods and default settings
  return {
    settings: configValues,
    processEntry: processSingleRecord,
    formatEntry: formatRecord,
    parseData: parseData,
    readDataMap: readDataMap
  };
})();