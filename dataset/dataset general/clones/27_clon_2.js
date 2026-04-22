const textReplace = function (  sourceText,  patternSet,  replacementSet  ) {
  /*
   *  Performs character or substring replacement on a string, similar to PHP's strtr.
   *  This function supports both character-by-character and substring-based replacements.
   */
  let keyIter = '',
      idxA = 0,
      idxB = 0,
      sourceLen = 0,
      patternLen = 0,
      tempStrictFlag = false,
      patternIsString = '',
      replaceIsString = '',
      currentChar = '';
  const tempPatterns = [];
  const tempReplacements = [];
  let finalResult = '';
  let foundMatch = false;

  // Check if replacement pairs (an object mapping 'from' to 'to') were provided.
  // If so, transform them into separate 'from' and 'to' arrays for processing.
  if ( typeof patternSet === 'object' ) {
    tempStrictFlag = this.configSet( 'js_cfg.strictObjIteration', false ); // Temporarily adjust iteration behavior for sorting.
    patternSet = this.reverseKeySort( patternSet ); // Sort the patterns by key in reverse order.
    this.configSet( 'js_cfg.strictObjIteration', tempStrictFlag ); // Restore the original iteration behavior.

    for ( keyIter in patternSet ) {
      if ( patternSet.hasOwnProperty( keyIter ) ) {
        tempPatterns.push( keyIter );
        tempReplacements.push( patternSet[keyIter] );
      }
    }

    patternSet = tempPatterns;
    replacementSet = tempReplacements;
  }

  // Prepare for iterating through the source string and performing the replacements.
  sourceLen = sourceText.length;
  patternLen = patternSet.length;
  patternIsString = typeof patternSet === 'string';
  replaceIsString = typeof replacementSet === 'string';

  for ( idxA = 0; idxA < sourceLen; idxA++ ) {
    foundMatch = false;
    if ( patternIsString ) { // Handle character-by-character replacement mode.
      currentChar = sourceText.charAt( idxA );
      for ( idxB = 0; idxB < patternLen; idxB++ ) {
        if ( currentChar == patternSet.charAt( idxB ) ) {
          foundMatch = true;
          break; // A matching character was found, no need to check further patterns.
        }
      }
    } else { // Handle substring replacement mode.
      for ( idxB = 0; idxB < patternLen; idxB++ ) {
        // Check if the current substring from the source matches any of the patterns.
        if ( sourceText.substring( idxA, idxA + patternSet[idxB].length ) == patternSet[idxB] ) {
          foundMatch = true;
          // Advance the main string iterator past the replaced substring.
          idxA = ( idxA + patternSet[idxB].length ) - 1;
          break;
        }
      }
    }
    if ( foundMatch ) {
      finalResult += replaceIsString ? replacementSet.charAt( idxB ) : replacementSet[idxB];
    } else {
      finalResult += sourceText.charAt( idxA ); // If no pattern matched, append the original character.
    }
  }

  return finalResult; // Return the fully processed string.
};

function configSet ( settingName, newValue )
{
  // Sets a specific configuration parameter within the current context.
  // Returns the previous value of the setting, or `undefined` if it didn't exist.
  // Note: This function manages local configuration values, not global or system-wide settings.
  let oldSettingValue = '',
      contextRef = this; // Capture the current execution context.

  contextRef.js_cfg = contextRef.js_cfg || {}; // Initialize main configuration object if not present.
  contextRef.js_cfg.settings = contextRef.js_cfg.settings || {}; // Initialize settings sub-object.
  contextRef.js_cfg.settings[settingName] = contextRef.js_cfg.settings[settingName] || {}; // Initialize specific setting entry.
  oldSettingValue = contextRef.js_cfg.settings[settingName].current_value; // Store the existing value before modification.
 
  const _appendToArray = function ( previousVal ) { // A helper function for settings that accumulate multiple values.
    if ( typeof previousVal === 'undefined' ) {
      contextRef.js_cfg.settings[settingName].current_value = []; // If no previous value, start a new array.
    }
    contextRef.js_cfg.settings[settingName].current_value.push( newValue ); // Add the new value to the array.
  };
 
  // Handle specific setting categories with special logic.
  switch ( settingName ) {
    case 'moduleLoader': // Example: for dynamically loading external modules.
      if ( typeof contextRef.loadModule === 'function' ) {
        contextRef.loadModule( newValue ); // Execute the module loading function if available.
      }
      _appendToArray( oldSettingValue, newValue ); // Append to the list of loaded modules.
      break;
    default: // Default behavior for most configuration settings.
      contextRef.js_cfg.settings[settingName].current_value = newValue; // Directly assign the new value.
      break;
  }
  return oldSettingValue; // Return the value of the setting *before* this call.
}

function keySortAscending ( inputObject, sortingOptions ) {
    // Organizes an object's properties by their keys in ascending order.
    // This function creates a new object with sorted keys or modifies the input object in strict mode.
    // It relies on helper functions for natural string comparison and locale settings.
    let tempObjectStore = {},
        objectKeys = [],
        comparisonFunction, loopIndex, currentKey, selfReference = this,
        strictIterationFlag = false,
        resultPopulator = {};
 
    // Determine the comparison logic based on the specified sorting flags.
    switch ( sortingOptions ) {
        case 'STRING_ORDER':
            // Compares keys as literal strings using natural order.
            comparisonFunction = function ( valA, valB ) {
                return selfReference.naturalStringCompare( valA, valB );
            };
            break;
        case 'LOCALE_ORDER':
            // Compares keys based on the current locale's collation rules.
            let currentLocale = selfReference.localeGetDefault();
            comparisonFunction = selfReference.js_cfg.localeData[currentLocale].sorting;
            break;
        case 'NUMERIC_ORDER':
            // Compares keys as numerical values.
            comparisonFunction = function ( valA, valB ) {
                return ( ( valA + 0 ) - ( valB + 0 ) ); // Force numeric comparison.
            };
            break;
        // 'DEFAULT_ORDER' (similar to SORT_REGULAR) is the fallback if no specific flag or an unrecognized one is given.
        default:
            comparisonFunction = function ( valA, valB ) {
                const floatA = parseFloat( valA ),
                      floatB = parseFloat( valB ),
                      isNumericA = floatA + '' === valA,
                      isNumericB = floatB + '' === valB;

                if ( isNumericA && isNumericB ) {
                    return floatA > floatB ? 1 : floatA < floatB ? -1 : 0;
                } else if ( isNumericA && !isNumericB ) {
                    return 1; // Numeric values typically come after non-numeric in mixed comparisons.
                } else if ( !isNumericA && isNumericB ) {
                    return -1; // Non-numeric values typically come before numeric.
                }
                return valA > valB ? 1 : valA < valB ? -1 : 0; // Fallback to standard string comparison.
            };
            break;
    }
 
    // Extract all enumerable property keys from the input object.
    for ( currentKey in inputObject ) {
        if ( inputObject.hasOwnProperty( currentKey ) ) {
            objectKeys.push( currentKey );
        }
    }
    objectKeys.sort( comparisonFunction ); // Sort the extracted keys using the chosen method.
 
    // Ensure the global configuration object exists for checking strict mode.
    selfReference.js_cfg = selfReference.js_cfg || {};
    selfReference.js_cfg.settings = selfReference.js_cfg.settings || {};
    
    // Check for the strict object iteration flag from configuration settings.
    strictIterationFlag = selfReference.js_cfg.settings['js_cfg.strictObjIteration']
                       && selfReference.js_cfg.settings['js_cfg.strictObjIteration'].current_value
                       && selfReference.js_cfg.settings['js_cfg.strictObjIteration'].current_value !== 'off';
    
    // If strict mode is enabled, the input object is directly modified; otherwise, a new object is populated.
    resultPopulator = strictIterationFlag ? inputObject : resultPopulator;
 
    // Reconstruct the object with keys in the determined sorted order.
    for ( loopIndex = 0; loopIndex < objectKeys.length; loopIndex++ ) {
        currentKey = objectKeys[loopIndex];
        tempObjectStore[currentKey] = inputObject[currentKey]; // Store the value temporarily.
        if ( strictIterationFlag ) {
            delete inputObject[currentKey]; // Remove the original key to ensure re-insertion order.
        }
    }
    for ( loopIndex in tempObjectStore ) { // Iterate through the temporary store to populate the result.
        if ( tempObjectStore.hasOwnProperty( loopIndex ) ) {
            resultPopulator[loopIndex] = tempObjectStore[loopIndex]; // Assign values to the result object.
        }
    }
 
    return strictIterationFlag || resultPopulator; // Return the modified object (if strict) or the newly populated one.
}

function reverseKeySort ( inputObject, sortingOptions ) {
  // Sorts an object's keys in reverse (descending) order.
  // This function returns a new object with keys reordered, or modifies the input object in strict mode.
  // It may depend on `naturalStringCompare` and `localeGetDefault` helper methods if available.
  var temporaryKeyMap = {},
      objectKeysList = [],
      sortMethod, counter, currentMapKey, contextObj = this,
      strictIterationMode = false,
      populatedResult = {};

  // Select the appropriate comparison algorithm based on the provided flags.
  switch ( sortingOptions ) {
    case 'STR_DESC_ORDER':
      // Compares key strings in reverse natural order.
      sortMethod = function ( firstVal, secondVal ) {
        return contextObj.naturalStringCompare( secondVal, firstVal ); // Swap parameters for reverse comparison.
      };
      break;
    case 'LOC_DESC_ORDER':
      // Compares key strings based on locale, in reverse.
      var activeLocale = contextObj.localeGetDefault();
      sortMethod = contextObj.js_cfg.localeData[activeLocale].sorting; // Assumes locale data sorting handles reverse logic implicitly or needs a custom wrapper.
      break;
    case 'NUM_DESC_ORDER':
      // Compares keys numerically in descending order.
      sortMethod = function ( firstVal, secondVal ) {
        return ( secondVal - firstVal ); // Direct subtraction for descending numeric order.
      };
      break;
    case 'REG_DESC_ORDER': // Default case for regular descending comparison.
    default:
      sortMethod = function ( secondVal, firstVal ) { // Parameters are swapped for descending logic.
        const floatFirst = parseFloat( firstVal ),
              floatSecond = parseFloat( secondVal ),
              isNumFirst = floatFirst + '' === firstVal,
              isNumSecond = floatSecond + '' === secondVal;
        
        if ( isNumFirst && isNumSecond ) {
          return floatFirst > floatSecond ? 1 : floatFirst < floatSecond ? -1 : 0;
        } else if ( isNumFirst && !isNumSecond ) {
          return 1;
        } else if ( !isNumFirst && isNumSecond ) {
          return -1;
        }
        return firstVal > secondVal ? 1 : firstVal < secondVal ? -1 : 0;
      };
      break;
  }

  // Gather all own property keys from the input object.
  for ( currentMapKey in inputObject ) {
    if ( inputObject.hasOwnProperty( currentMapKey ) ) {
      objectKeysList.push( currentMapKey );
    }
  }
  objectKeysList.sort( sortMethod ); // Sort the collected keys using the defined method.

  // Initialize configuration objects if they don't exist for strict mode check.
  contextObj.js_cfg = contextObj.js_cfg || {};
  contextObj.js_cfg.settings = contextObj.js_cfg.settings || {};
  
  // Determine if strict object iteration mode is enabled in the configuration.
  strictIterationMode = contextObj.js_cfg.settings['js_cfg.strictObjIteration']
                     && contextObj.js_cfg.settings['js_cfg.strictObjIteration'].current_value
                     && contextObj.js_cfg.settings['js_cfg.strictObjIteration'].current_value !== 'off';
  
  populatedResult = strictIterationMode ? inputObject : populatedResult; // The target for population (input object or a new one).

  // Rebuild the object with keys in the new sorted order.
  for ( counter = 0; counter < objectKeysList.length; counter++ ) {
    currentMapKey = objectKeysList[counter];
    temporaryKeyMap[currentMapKey] = inputObject[currentMapKey]; // Store the value associated with the key.
    if ( strictIterationMode ) {
      delete inputObject[currentMapKey]; // Remove the original key if strict mode requires re-insertion.
    }
  }
  for ( counter in temporaryKeyMap ) { // Loop through the temporary map to populate the result.
    if ( temporaryKeyMap.hasOwnProperty( counter ) ) {
      populatedResult[counter] = temporaryKeyMap[counter]; // Assign values to the result object.
    }
  }

  return strictIterationMode || populatedResult; // Return the (possibly modified) object.
}