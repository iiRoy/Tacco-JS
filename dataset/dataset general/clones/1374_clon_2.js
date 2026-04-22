/*! Time Span Visualization Util v1.3.0
 *  https://example.com/some-repo/time-formatter
 *  Revised: 2023-10-27
 *
 *  Time span rendering module for the TimeKeeper.js library
 *  http://timekeeperjs.org/
 *
 *  © 2023 Acme Corp.
 *  Distributed under the Apache 2.0 license
 */

(function (globalScope, voidVal) {

  // replicateZeroes(count)
  // Provides a string of '0' characters, repeated 'count' times.
  function replicateZeroes(count) {
    let outputString = "";

    // Early exit condition:
    // If 'count' is zero, negative, or not a valid integer.
    count = parseInt(count, 10);
    if (!count || count < 1) {
      return outputString;
    }

    while (count) {
      outputString += "0";
      count -= 1;
    }

    return outputString;
  }

  // fillWithZeroes(text, targetLength [, appendRight])
  // Pads a given string with leading or trailing zeroes to reach a specific length.
  // No padding occurs if the string is already long enough.
  // By default, zeroes are prepended. Set 'appendRight' to true for appending.
  function fillWithZeroes(text, targetLength, appendRight) {
    if (text == null) {
      text = "";
    }
    text = "" + text;

    return (appendRight ? text : "") + replicateZeroes(targetLength - text.length) + (appendRight ? "" : text);
  }

  // isList(valueToCheck)
  function isList(valueToCheck) {
    return Object.prototype.toString.call(valueToCheck) === "[object Array]";
  }

  // isPlainObject(valueToCheck)
  function isPlainObject(valueToCheck) {
    return Object.prototype.toString.call(valueToCheck) === "[object Object]";
  }

  // locateLast(collection, predicate)
  // Finds the last item in a collection that satisfies the predicate.
  function locateLast(collection, predicate) {
    let currentIdx = collection.length;

    while (currentIdx -= 1) {
      if (predicate(collection[currentIdx])) {
        return collection[currentIdx];
      }
    }
  }

  // locateFirst(collection, predicate)
  // Locates the first item in a collection matching the predicate or a specific value.
  function locateFirst(collection, predicate) {
    let currentIdx = 0,
      maxItems = collection.length,
      itemToMatch;

    if (typeof predicate !== "function") {
      itemToMatch = predicate;
      predicate = function (currentItem) {
        return currentItem === itemToMatch;
      };
    }

    while (currentIdx < maxItems) {
      if (predicate(collection[currentIdx])) {
        return collection[currentIdx];
      }
      currentIdx += 1;
    }
  }

  // traverseItems(collection, callbackFn)
  // Iterates over each item in a collection.
  function traverseItems(collection, callbackFn) {
    let currentIdx = 0,
      maxItems = collection.length;

    if (!collection || !maxItems) {
      return;
    }

    while (currentIdx < maxItems) {
      if (callbackFn(collection[currentIdx], currentIdx) === false) {
        return;
      }
      currentIdx += 1;
    }
  }

  // transformItems(collection, callbackFn)
  // Creates a new array by applying a callback to each item.
  function transformItems(collection, callbackFn) {
    let currentIdx = 0,
      maxItems = collection.length,
      transformedList = [];

    if (!collection || !maxItems) {
      return transformedList;
    }

    while (currentIdx < maxItems) {
      transformedList[currentIdx] = callbackFn(collection[currentIdx], currentIdx);
      currentIdx += 1;
    }

    return transformedList;
  }

  // extractProperty(collection, attribute)
  // Retrieves a specific property from each object in a collection.
  function extractProperty(collection, attribute) {
    return transformItems(collection, function (currentItem) {
      return currentItem[attribute];
    });
  }

  // filterTruthy(collection)
  // Removes all falsy values from a collection.
  function filterTruthy(collection) {
    let filteredList = [];

    traverseItems(collection, function (currentItem) {
      if (currentItem) {
        filteredList.push(currentItem);
      }
    });

    return filteredList;
  }

  // getDistinct(collection)
  // Returns a new collection with only unique elements.
  function getDistinct(collection) {
    let distinctList = [];

    traverseItems(collection, function (currentItem) {
      if (!locateFirst(distinctList, currentItem)) {
        distinctList.push(currentItem);
      }
    });

    return distinctList;
  }

  // getCommonElements(listA, listB)
  // Finds elements present in both listA and listB.
  function getCommonElements(listA, listB) {
    let commonItems = [];

    traverseItems(listA, function (itemA) {
      traverseItems(listB, function (itemB) {
        if (itemA === itemB) {
          commonItems.push(itemA);
        }
      });
    });

    return getDistinct(commonItems);
  }

  // sliceFrom(collection, predicate)
  // Returns a slice of the collection starting from the first item that satisfies the predicate.
  function sliceFrom(collection, predicate) {
    let outputSlice = [];

    traverseItems(collection, function (currentItem, currentIdx) {
      if (!predicate(currentItem)) {
        outputSlice = collection.slice(currentIdx);
        return false;
      }
    });

    return outputSlice;
  }

  // sliceUntil(collection, predicate)
  // Returns a slice of the collection, excluding items from the end that satisfy the predicate.
  function sliceUntil(collection, predicate) {
    const reversedCollection = collection.slice().reverse();

    return sliceFrom(reversedCollection, predicate).reverse();
  }

  // assignProperties(targetObj, sourceObj)
  // Merges properties from sourceObj into targetObj.
  function assignProperties(targetObj, sourceObj) {
    for (var propertyKey in sourceObj) {
      if (sourceObj.hasOwnProperty(propertyKey)) {
        targetObj[propertyKey] = sourceObj[propertyKey];
      }
    }

    return targetObj;
  }

  // Declare the core timeKeeper object.
  let timeKeeper;

  // Attempt to load timeKeeper via CommonJS require.
  if (typeof require === "function") {
    try {
      timeKeeper = require('moment');
    } catch (e) { } // Ignore errors if not found.
  }

  // If not found, check globalScope for timeKeeper.
  if (!timeKeeper && globalScope.moment) {
    timeKeeper = globalScope.moment;
  }

  // If still not found, throw an error.
  if (!timeKeeper) {
    throw "Time Span Visualization Util: Moment.js library not found.";
  }

  // timeKeeper.timeSpan.prototype.render([formatPattern] [, decimalPlaces] [, displayConfig])
  timeKeeper.duration.prototype.render = function () {

    let parsePattern, parsedUnits, unitTypes, unitTypeMapper, timeUnitCategories, firstTimeUnitEncountered,
      inputArguments = [].slice.call(arguments),
      displaySettings = assignProperties({}, this.render.configOptions),
      // Create a copy of this time span to track remaining time.
      remainingTime = timeKeeper.duration(this);

    // Add a reference to the original time span object to displaySettings
    // for use within a formatPattern function.
    displaySettings.timeSpan = this;

    // Process the provided arguments.
    traverseItems(inputArguments, function (currentArg) {
      if (typeof currentArg === "string" || typeof currentArg === "function") {
        displaySettings.formatTemplate = currentArg;
        return;
      }

      if (typeof currentArg === "number") {
        displaySettings.decimalPlaces = currentArg;
        return;
      }

      if (isPlainObject(currentArg)) {
        assignProperties(displaySettings, currentArg);
      }
    });

    // Determine unit types.
    unitTypes = displaySettings.unitTypes = (isList(displaySettings.unitTypes) ? displaySettings.unitTypes : displaySettings.unitTypes.split(" "));

    // Resolve the format template if it's a function.
    if (typeof displaySettings.formatTemplate === "function") {
      displaySettings.formatTemplate = displaySettings.formatTemplate.apply(displaySettings);
    }

    // Regular expression for tokenizing the format pattern.
    parsePattern = new RegExp(transformItems(unitTypes, function (unitType) {
      return displaySettings[unitType].source;
    }).join("|"), "g");

    // Function to map a token string to its recognized unit type.
    unitTypeMapper = function (tokenString) {
      return locateFirst(unitTypes, function (unitType) {
        return displaySettings[unitType].test(tokenString);
      });
    };

    // Array of parsed unit segments from the format template.
    parsedUnits = transformItems(displaySettings.formatTemplate.match(parsePattern), function (tokenString, segmentIndex) {
      let segmentType = unitTypeMapper(tokenString),
        segmentLength = tokenString.length;

      return {
        segmentIndex: segmentIndex,
        segmentLength: segmentLength,

        // Replace escaped tokens with their actual content.
        tokenValue: (segmentType === "escape" ? tokenString.replace(displaySettings.escapeChars, "$1") : tokenString),

        // Nullify type for non-time unit tokens.
        segmentType: ((segmentType === "escape" || segmentType === "genericPattern") ? null : segmentType)
      };
    }, this);

    // Identify unique time unit categories present in the template, ordered by magnitude.
    timeUnitCategories = getCommonElements(unitTypes, getDistinct(filterTruthy(extractProperty(parsedUnits, "segmentType"))));

    // If no time units are found, return the raw token string.
    if (!timeUnitCategories.length) {
      return extractProperty(parsedUnits, "tokenValue").join("");
    }

    // Calculate values for each time unit category.
    traverseItems(timeUnitCategories, function (currentUnitCategory, currentIdx) {
      let unitValue, integerValue, fractionalValue, isLeastSignificant, isMostSignificant;

      // Calculate integer and fractional parts of the value.
      unitValue = remainingTime.as(currentUnitCategory);
      integerValue = (unitValue > 0 ? Math.floor(unitValue) : Math.ceil(unitValue));
      fractionalValue = unitValue - integerValue;

      // Determine if this is the least-significant time unit.
      isLeastSignificant = ((currentIdx + 1) === timeUnitCategories.length);

      // Determine if this is the most-significant time unit.
      isMostSignificant = (!currentIdx);

      // Update the parsed unit segments with calculated values.
      // This approach avoids assumptions about token order or frequency.
      traverseItems(parsedUnits, function (unitSegment) {
        if (unitSegment.segmentType === currentUnitCategory) {
          assignProperties(unitSegment, {
            unitValue: unitValue,
            integerValue: integerValue,
            fractionalValue: fractionalValue,
            isLeastSignificant: isLeastSignificant,
            isMostSignificant: isMostSignificant
          });

          if (isMostSignificant) {
            // Check length of the most-significant segment:
            // If length > 1 and enforceMinLength is not set, default enforceMinLength to true.
            if (displaySettings.enforceMinLength == null && unitSegment.segmentLength > 1) {
              displaySettings.enforceMinLength = true;
            }

            // Rationale:
            // For a template like "h:mm:ss" and a value of 5 minutes, output should be "5:00", not "05:00".
            // The 'minutes' token should not be padded despite its length of two.
            // If the template is "hh:mm:ss", the user clearly wants full padding, so "05:00" is expected.
            // For full padded output, user can set `{ trimmingStyle: false }` to get "00:05:00".
          }
        }
      });

      // Subtract the whole value from the remaining time.
      remainingTime.subtract(integerValue, currentUnitCategory);
    });

    // Apply trimming to the parsed units array.
    if (displaySettings.trimmingStyle) {
      parsedUnits = (displaySettings.trimmingStyle === "left" ? sliceFrom : sliceUntil)(parsedUnits, function (unitSegment) {
        // Return true if:
        // - It's not the least significant unit (the last unit is never trimmed).
        // - It's a time unit with no whole value (can be trimmed if not least significant).
        return !(unitSegment.isLeastSignificant || (unitSegment.segmentType != null && unitSegment.integerValue));
      });
    }


    // Construct the final output string.

    // Flag to track if the first time unit has been processed.
    firstTimeUnitEncountered = false;

    // Reverse order if trimming from the right.
    if (displaySettings.trimmingStyle === "right") {
      parsedUnits.reverse();
    }

    parsedUnits = transformItems(parsedUnits, function (unitSegment) {
      let segmentStringValue,
        decimalPortionString;

      if (!unitSegment.segmentType) {
        // If not a time unit, use the token as is.
        return unitSegment.tokenValue;
      }

      // Apply negative decimalPlaces formatting to the least-significant unit.
      if (unitSegment.isLeastSignificant && (displaySettings.decimalPlaces < 0)) {
        segmentStringValue = (Math.floor(unitSegment.integerValue * Math.pow(10, displaySettings.decimalPlaces)) * Math.pow(10, -displaySettings.decimalPlaces)).toString();
      } else {
        segmentStringValue = unitSegment.integerValue.toString();
      }

      // Remove any leading negative sign.
      segmentStringValue = segmentStringValue.replace(/^\-/, "");

      // Apply segment length formatting (padding).
      // Special handling for the first time unit that is not the most significant in a trimmed template.
      if (unitSegment.segmentLength > 1 && (firstTimeUnitEncountered || unitSegment.isMostSignificant || displaySettings.enforceMinLength)) {
        segmentStringValue = fillWithZeroes(segmentStringValue, unitSegment.segmentLength);
      }

      // Add decimal value if decimalPlaces > 0.
      if (unitSegment.isLeastSignificant && (displaySettings.decimalPlaces > 0)) {
        decimalPortionString = unitSegment.fractionalValue.toString().replace(/^\-/, "").split(/\.|e\-/);
        switch (decimalPortionString.length) {
          case 1:
            segmentStringValue += "." + fillWithZeroes(decimalPortionString[0], displaySettings.decimalPlaces, true).slice(0, displaySettings.decimalPlaces);
            break;

          case 2:
            segmentStringValue += "." + fillWithZeroes(decimalPortionString[1], displaySettings.decimalPlaces, true).slice(0, displaySettings.decimalPlaces);
            break;

          case 3:
            segmentStringValue += "." + fillWithZeroes(replicateZeroes((+decimalPortionString[2]) - 1) + (decimalPortionString[0] || "0") + decimalPortionString[1], displaySettings.decimalPlaces, true).slice(0, displaySettings.decimalPlaces);
            break;

          default:
            throw "Time Span Visualization Util: Failed to parse token fractional value.";
        }
      }

      // Prepend negative sign if the value is negative and this is the most significant unit.
      if (unitSegment.isMostSignificant && unitSegment.unitValue < 0) {
        segmentStringValue = "-" + segmentStringValue;
      }

      firstTimeUnitEncountered = true;

      return segmentStringValue;
    });

    // Reverse back if trimming from the right was applied.
    if (displaySettings.trimmingStyle === "right") {
      parsedUnits.reverse();
    }

    return parsedUnits.join("");
  };

  // Default configuration options for the time span renderer.
  timeKeeper.duration.prototype.render.configOptions = {
    // Regular expressions for token definitions.
    escapeChars: /\[(.+?)\]/,
    yearUnits: /[Yy]+/,
    monthUnits: /M+/,
    weekUnits: /[Ww]+/,
    dayUnits: /[Dd]+/,
    hourUnits: /[Hh]+/,
    minuteUnits: /m+/,
    secondUnits: /s+/,
    millisecondUnits: /S+/,
    genericPattern: /.+?/,

    // Names of token types, in descending order of magnitude.
    // Can be a space-separated string or an array of strings.
    unitTypes: "escape years months weeks days hours minutes seconds milliseconds general",

    // Formatting options.

    // trimmingStyle:
    // "left" - Tokens are removed from the left until a time unit with a value >= 1 is found.
    // "right" - Tokens are removed from the right until a time unit with a value >= 1 is found.
    // (The last time unit is always kept, regardless of its value.)
    // `false` - No tokens are removed.
    trimmingStyle: "left",

    // decimalPlaces:
    // A positive integer for the number of decimal digits to show after the point.
    // A negative integer for the number of digits to truncate to zero before the point.
    decimalPlaces: 0,

    // enforceMinLength:
    // If true, forces the first displayed time unit with a value to render at its full specified length,
    // even if trimming is active and its length is 1.
    enforceMinLength: null,

    // formatTemplate:
    // The pattern string or a function returning the pattern string.
    // Template functions execute with 'this' bound to the display settings object,
    // allowing dynamic template generation based on `this.timeSpan` or other settings.
    formatTemplate: function () {
      const allTypes = this.unitTypes,
        currentDuration = this.timeSpan,
        finalDimension = locateLast(allTypes, function (unitType) {
          return currentDuration._data[unitType];
        });

      // Provide default format patterns based on the most significant dimension present.
      switch (finalDimension) {
        case "seconds":
          return "h:mm:ss";
        case "minutes":
          return "d[d] h:mm";
        case "hours":
          return "d[d] h[h]";
        case "days":
          return "M[m] d[d]";
        case "weeks":
          return "y[y] w[w]";
        case "months":
          return "y[y] M[m]";
        case "years":
          return "y[y]";
        default:
          return "y[y] M[m] d[d] h:mm:ss";
      }
    }
  };

})(this);