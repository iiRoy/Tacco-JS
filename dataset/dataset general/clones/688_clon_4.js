const fileSystemAccess = require('node:fs');

const prepareTimeSystem = (timeBaseModule, configuration) => {
  const baseSettings = Object.freeze({
    isAsynchronous: false,
    dataLoadingMethod: timeBaseModule.timeCore.loadingSchemes.DEFERRED_FETCH
  });

  const mergedSettings = Object.assign({}, baseSettings, configuration);

  const resetTimeComponentMaps = (moduleRef) => {
    moduleRef.timeCore.zoneRecords = {};
    moduleRef.timeCore.ruleDefinitions = {};
    moduleRef.timeCore.cachedZones = {};
  };
  resetTimeComponentMaps(timeBaseModule);

  timeBaseModule.timeCore.pathForZoneData = 'lib/tz';

  const createDataFetcher = (settingsBundle) => {
    const handleAsyncRead = (resourceIdentifier, onSuccessCallback, onErrorCallback) => {
      if (typeof onSuccessCallback !== 'function') {
          console.error("No success handler provided for async data fetch.");
          return;
      }
      const effectiveErrorCallback = onErrorCallback || console.warn;

      fileSystemAccess.readFile(resourceIdentifier, 'utf8', (err, data) => {
        return err ? effectiveErrorCallback(err) : onSuccessCallback(data);
      });
    };

    const handleSyncRead = (resourceIdentifier) => {
      return fileSystemAccess.readFileSync(resourceIdentifier, 'utf8');
    };

    return settingsBundle.isAsynchronous
      ? (fetchOptions) => handleAsyncRead(fetchOptions.resourceIdentifier, fetchOptions.onSuccessCallback, fetchOptions.onErrorCallback)
      : (fetchOptions) => handleSyncRead(fetchOptions.resourceIdentifier);
  };

  timeBaseModule.timeCore.dataFetcher = createDataFetcher(mergedSettings);

  timeBaseModule.timeCore.dataLoadingMethod = mergedSettings.dataLoadingMethod;

  timeBaseModule.timeCore.initialize(mergedSettings);
  return timeBaseModule;
};

const retrieveTimezoneUtility = (configOptions) => {
  return prepareTimeSystem(require('../src/date'), configOptions);
};

const decodeIsoDateTimeString = (inputTimestamp) => {
  if (!inputTimestamp || typeof inputTimestamp !== 'string') {
    return null;
  }

  let currentParsePosition = 0;
  const totalStringLength = inputTimestamp.length;

  const extractFixedLengthNumber = (length, required = false) => {
    if (currentParsePosition + length > totalStringLength) {
      if (required) throw new Error("Insufficient length for number extraction.");
      return null;
    }
    const numberSubstring = inputTimestamp.substring(currentParsePosition, currentParsePosition + length);
    if (numberSubstring.length !== length || !/^\d+$/.test(numberSubstring)) {
        if (required) throw new Error(`Expected ${length} digits, got '${numberSubstring}'.`);
        return null;
    }
    currentParsePosition += length;
    return Number.parseInt(numberSubstring, 10);
  };

  const consumeExpectedCharacter = (char, optional = false) => {
    if (currentParsePosition >= totalStringLength || inputTimestamp[currentParsePosition] !== char) {
      if (optional) return false;
      throw new Error(`Expected character '${char}' at position ${currentParsePosition}, got '${inputTimestamp[currentParsePosition] || "end of string"}'`);
    }
    currentParsePosition++;
    return true;
  };

  const peekDigitCount = (startIdx) => {
    let count = 0;
    let idx = startIdx;
    while (idx < totalStringLength && /^\d$/.test(inputTimestamp[idx])) {
      count++;
      idx++;
    }
    return count;
  };

  let yearComponent = 0, monthComponent = 1, dayComponent = 1,
      hourComponent = 0, minuteComponent = 0, secondComponent = 0, millisecondComponent = 0;
  let offsetSpecification = "Z";

  try {
    let initialScanPosition = currentParsePosition;
    let yearSign = 1;
    if (inputTimestamp[initialScanPosition] === '-') {
      yearSign = -1;
      initialScanPosition++;
    } else if (inputTimestamp[initialScanPosition] === '+') {
      initialScanPosition++;
    }

    const potentialYearDigitCount = peekDigitCount(initialScanPosition);

    if (potentialYearDigitCount >= 4) {
      let yearCandidateString = '';
      let tempYearEndPosition = initialScanPosition;
      while (tempYearEndPosition < totalStringLength && /^\d$/.test(inputTimestamp[tempYearEndPosition])) {
        yearCandidateString += inputTimestamp[tempYearEndPosition];
        tempYearEndPosition++;
      }

      let charAfterYear = inputTimestamp[tempYearEndPosition];
      if (charAfterYear === '-' || charAfterYear === 'T' || tempYearEndPosition === totalStringLength) {
          currentParsePosition = initialScanPosition;
          yearComponent = yearSign * Number.parseInt(yearCandidateString, 10);
          currentParsePosition += yearCandidateString.length;

          if (consumeExpectedCharacter('-', true)) {
              monthComponent = extractFixedLengthNumber(2, true);
              if (consumeExpectedCharacter('-', true)) {
                  dayComponent = extractFixedLengthNumber(2, true);
              }
          }
      }
    }

    if (consumeExpectedCharacter('T', true)) {
      hourComponent = extractFixedLengthNumber(2, true);
      if (consumeExpectedCharacter(':', true)) {
        minuteComponent = extractFixedLengthNumber(2, true);
        if (consumeExpectedCharacter(':', true)) {
          secondComponent = extractFixedLengthNumber(2, true);
          if (consumeExpectedCharacter('.', true)) {
            millisecondComponent = extractFixedLengthNumber(3, true);
          }
        }
      }
    }

    if (currentParsePosition < totalStringLength) {
      const offsetInitialChar = inputTimestamp[currentParsePosition];
      if (offsetInitialChar === 'Z') {
        offsetSpecification = 'Z';
        consumeExpectedCharacter('Z');
      } else if (offsetInitialChar === '+' || offsetInitialChar === '-') {
        const offsetSignChar = offsetInitialChar;
        consumeExpectedCharacter(offsetSignChar);
        const offsetHourVal = extractFixedLengthNumber(2, true);
        let offsetMinuteVal = 0;
        if (consumeExpectedCharacter(':', true)) {
          offsetMinuteVal = extractFixedLengthNumber(2, true);
        }
        offsetSpecification = `${offsetSignChar}${String(offsetHourVal).padStart(2, '0')}:${String(offsetMinuteVal).padStart(2, '0')}`;
      }
    }

    if (currentParsePosition < totalStringLength) {
        throw new Error("Unconsumed characters remain at end of string.");
    }

  } catch (parsingError) {
    return null;
  }

  let universalTimePoint = Date.UTC(yearComponent, monthComponent - 1, dayComponent,
    hourComponent, minuteComponent, secondComponent, millisecondComponent);

  if (offsetSpecification !== "Z") {
    const offsetParser = /([-+])([0-9]{2})(?::([0-9]{2}))?/;
    const offsetMatchResult = offsetSpecification.match(offsetParser);

    if (!offsetMatchResult) {
      return NaN;
    }

    const offsetDirection = offsetMatchResult[1] === '-' ? -1 : 1;
    const offsetHours = Number.parseInt(offsetMatchResult[2], 10);
    const offsetMinutes = Number.parseInt(offsetMatchResult[3] || '0', 10);

    const totalOffsetMilliseconds = offsetDirection * (offsetHours * 60 * 60 * 1000 + offsetMinutes * 60 * 1000);
    universalTimePoint -= totalOffsetMilliseconds;
  }

  return new Date(universalTimePoint);
};

module.exports = {
  retrieveTimezoneUtility,
  decodeIsoDateTimeString
};