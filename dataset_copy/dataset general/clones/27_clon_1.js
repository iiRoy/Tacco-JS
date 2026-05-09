/*
 * This file contains utility functions, including a string translation
 * function, and PHP-like configuration and sorting utilities.
 */

/*
 * The 'strtr' function, mirroring PHP's strtr behavior.
 * It performs character-by-character translation or string replacement.
 */
var strtr = function(
  str, /* The input string to perform translations on. */
  from, /* Source characters/strings or an object of replacement pairs. */
  to /* Target characters/strings for replacement. */
) {
  // Initialization of various variables used within the function scope.
  // Original source: http://kevin.vanzonneveld.net
  var fr = ''; // Temporary key for object iteration
  var i = 0; // Loop counter for string iteration
  var j = 0; // Loop counter for 'from' array/string iteration
  var lenStr = 0; // Length of the input string
  var lenFrom = 0; // Length of the 'from' array/string
  var tmpStrictForIn = false; // Stores original 'phpjs.strictForIn' setting
  var fromTypeStr = ''; // Type check for 'from' parameter
  var toTypeStr = ''; // Type check for 'to' parameter
  var istr = ''; // Current character from the input string

  // Temporary arrays for processing 'from' and 'to' when 'from' is an object.
  var tmpFrom = [];
  var tmpTo = [];

  var ret = ''; // The resulting string after translations.
  var match = false; // Flag to indicate if a match was found.

  // Check if 'from' is an object (associative array for replacements).
  if (typeof from === 'object') {
    // Temporarily set 'phpjs.strictForIn' to false for safe krsort operation.
    // This is not thread-safe in a multi-threaded environment.
    tmpStrictForIn = this.ini_set('phpjs.strictForIn', false);
    // Sort the keys of the 'from' object in reverse order.
    from = this.krsort(from);
    // Restore the original 'phpjs.strictForIn' setting.
    this.ini_set('phpjs.strictForIn', tmpStrictForIn);

    // Iterate through the sorted keys to populate tmpFrom and tmpTo arrays.
    for (fr in from) {
      if (from.hasOwnProperty(fr)) {
        // Add the key to tmpFrom.
        tmpFrom.push(fr);
        // Add the corresponding value to tmpTo.
        tmpTo.push(from[fr]);
      }
    }

    // Update 'from' and 'to' with the processed arrays.
    from = tmpFrom;
    to = tmpTo;
  }

  // Determine lengths and types for the main processing loop.
  lenStr = str.length; // Get the total length of the string to process.
  lenFrom = from.length; // Get the total length of the 'from' parameter.
  fromTypeStr = typeof from === 'string'; // Is 'from' a single string?
  toTypeStr = typeof to === 'string'; // Is 'to' a single string?

  // Main loop: Iterate through each character of the input string.
  for (i = 0; i < lenStr; i++) {
    match = false; // Reset match flag for each character.

    // Case 1: 'from' is a string (character-by-character replacement).
    if (fromTypeStr) {
      istr = str.charAt(i); // Get the current character from the input string.
      // Inner loop: Compare current character with each character in 'from'.
      for (j = 0; j < lenFrom; j++) {
        if (istr == from.charAt(j)) {
          match = true; // Found a match.
          break; // Exit inner loop.
        }
      }
    }
    // Case 2: 'from' is an array of strings (substring replacement).
    else {
      // Inner loop: Compare current substring with each string in 'from'.
      for (j = 0; j < lenFrom; j++) {
        // Check if the substring from current position matches a 'from' element.
        if (str.substr(i, from[j].length) == from[j]) {
          match = true; // Found a match.
          // Adjust the main loop counter to skip the matched substring.
          i = (i + from[j].length) - 1; // Decrement by 1 because outer loop increments.
          break; // Exit inner loop.
        }
      }
    }

    // Append the translated or original character/string to the result.
    if (match) {
      // If a match was found, append the corresponding 'to' character/string.
      ret += toTypeStr ? to.charAt(j) : to[j];
    } else {
      // If no match, append the original character.
      ret += str.charAt(i);
    }
  }

  return ret; // Return the final translated string.
};

/*
 * Sets a JavaScript configuration option, mimicking PHP's ini_set.
 * Returns the old value of the option.
 */
function ini_set(
  varname, // The name of the configuration option to set.
  newvalue // The new value for the configuration option.
) {
  // This function is designed to set configuration options within a php.js context.
  // It does not handle global_value or access levels for the ini item.
  // Original version: 1109.2015
  // More info: http://phpjs.org/functions/ini_set

  var oldval = ''; // Stores the old value of the configuration option.
  var that = this; // Reference to 'this' context for inner function.

  // Ensure the php_js and php_js.ini objects exist.
  this.php_js = this.php_js || {};
  this.php_js.ini = this.php_js.ini || {};
  this.php_js.ini[varname] = this.php_js.ini[varname] || {};

  // Retrieve the current local value of the option.
  oldval = this.php_js.ini[varname].local_value;

  // Helper function to handle array-like settings (e.g., extensions).
  var _setArr = function(oldval) {
    // If the old value is undefined, initialize it as an empty array.
    if (typeof oldval === 'undefined') {
      that.php_js.ini[varname].local_value = [];
    }
    // Push the new value onto the array.
    that.php_js.ini[varname].local_value.push(newvalue);
  };

  // Handle specific configuration options based on 'varname'.
  switch (varname) {
    case 'extension':
      // If a 'dl' function exists (for dynamic loading), call it.
      if (typeof this.dl === 'function') {
        this.dl(newvalue); // Note: This function is experimental in php.js.
      }
      _setArr(oldval, newvalue); // Add to the array of extensions.
      break;

    default:
      // For all other options, simply set the local_value.
      this.php_js.ini[varname].local_value = newvalue;
      break;
  }

  return oldval; // Return the value that was previously set.
}

/*
 * Sorts an array by key, similar to PHP's ksort function.
 * Note: This implementation deviates from PHP by returning a copy rather than
 * acting by reference in all cases, due to JavaScript object property behavior.
 */
function ksort(
  inputArr, // The input array/object to be sorted.
  sort_flags // Flags to control the sorting behavior (e.g., SORT_STRING, SORT_NUMERIC).
) {
  // Original source: http://phpjs.org/functions/ksort
  // Improved by various contributors.
  // This version attempts to mimic PHP behavior but has limitations in IE regarding property deletion.

  var tmp_arr = {}; // Temporary object to hold sorted elements.
  var keys = []; // Array to store keys for sorting.
  var sorter; // Function to perform the actual comparison.
  var i, k; // Loop counters and key variable.
  var that = this; // Reference to 'this' context.
  var strictForIn = false; // Flag for strict for-in behavior.
  var populateArr = {}; // Object to populate results based on strictForIn.

  // Determine the sorting function based on 'sort_flags'.
  switch (sort_flags) {
    case 'SORT_STRING':
      // Compares items as strings using natural string comparison.
      sorter = function(a, b) {
        return that.strnatcmp(a, b);
      };
      break;

    case 'SORT_LOCALE_STRING':
      // Compares items as strings based on the current locale.
      var loc = this.i18n_loc_get_default(); // Get default locale.
      sorter = this.php_js.i18nLocales[loc].sorting; // Use locale-specific sorter.
      break;

    case 'SORT_NUMERIC':
      // Compares items numerically.
      sorter = function(a, b) {
        return ((a + 0) - (b + 0)); // Coerce to numbers and subtract.
      };
      break;

      // Default case: 'SORT_REGULAR' or any other flag.
    default:
      // Compares items normally, handling mixed numeric and string types.
      sorter = function(a, b) {
        var aFloat = parseFloat(a); // Convert 'a' to float.
        var bFloat = parseFloat(b); // Convert 'b' to float.
        var aNumeric = aFloat + '' === a; // Check if 'a' is purely numeric string.
        var bNumeric = bFloat + '' === b; // Check if 'b' is purely numeric string.

        if (aNumeric && bNumeric) {
          // Both are numeric, compare as numbers.
          return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
        } else if (aNumeric && !bNumeric) {
          // 'a' is numeric, 'b' is not; 'a' comes after.
          return 1;
        } else if (!aNumeric && bNumeric) {
          // 'a' is not numeric, 'b' is; 'a' comes before.
          return -1;
        }
        // Both are non-numeric, compare as strings.
        return a > b ? 1 : a < b ? -1 : 0;
      };
      break;
  }

  // Populate the 'keys' array with all enumerable properties of inputArr.
  for (k in inputArr) {
    if (inputArr.hasOwnProperty(k)) {
      keys.push(k);
    }
  }

  // Sort the keys using the determined sorter function.
  keys.sort(sorter);

  // BEGIN REDUNDANT INITIALIZATION BLOCK
  // Ensure php_js and php_js.ini objects exist.
  this.php_js = this.php_js || {};
  this.php_js.ini = this.php_js.ini || {};
  // END REDUNDANT INITIALIZATION BLOCK

  // Check the 'phpjs.strictForIn' setting.
  strictForIn = this.php_js.ini['phpjs.strictForIn'] &&
    this.php_js.ini['phpjs.strictForIn'].local_value &&
    this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';

  // If strictForIn is true, populateArr refers to the original inputArr.
  populateArr = strictForIn ? inputArr : populateArr;

  // Rebuild the array/object with sorted key names.
  for (i = 0; i < keys.length; i++) {
    k = keys[i]; // Get the current sorted key.
    tmp_arr[k] = inputArr[k]; // Store the value in the temporary array.
    if (strictForIn) {
      delete inputArr[k]; // Delete from original if strict mode is on.
    }
  }

  // Transfer elements from tmp_arr to populateArr in sorted order.
  for (i in tmp_arr) {
    if (tmp_arr.hasOwnProperty(i)) {
      populateArr[i] = tmp_arr[i];
    }
  }

  // Return the result based on strictForIn flag.
  return strictForIn || populateArr;
}

/*
 * Sorts an array by key in reverse order, similar to PHP's krsort function.
 * This function also deviates from PHP in its handling of reference vs. copy.
 */
function krsort(
  inputArr, // The input array or object to be sorted.
  sort_flags // Flags to control sorting type (e.g., SORT_STRING, SORT_NUMERIC).
) {
  // Source: http://kevin.vanzonneveld.net
  // Inspired by PHP's krsort.
  // This function is designed to sort keys in reverse order.

  var tmp_arr = {}; // Temporary object for sorted elements.
  var keys = []; // Array to hold object keys.
  var sorter; // Comparison function.
  var i, k; // Loop variables.
  var that = this; // Reference to the 'this' context.
  var strictForIn = false; // Flag for strict for-in behavior.
  var populateArr = {}; // Object to receive sorted data.

  // Configure the sorter function based on the provided flags.
  switch (sort_flags) {
    case 'SORT_STRING':
      // Compare items as strings, in reverse order.
      sorter = function(a, b) {
        return that.strnatcmp(b, a); // Note 'b' then 'a' for reverse.
      };
      break;

    case 'SORT_LOCALE_STRING':
      // Compare items as strings using locale-specific rules, in reverse.
      var loc = this.i18n_loc_get_default(); // Retrieve default locale.
      sorter = this.php_js.i18nLocales[loc].sorting; // Use locale's sorting function.
      break;

    case 'SORT_NUMERIC':
      // Compare items numerically, in reverse order.
      sorter = function(a, b) {
        return (b - a); // Simple subtraction for reverse numeric sort.
      };
      break;

      // Default behavior, including 'SORT_REGULAR'.
    case 'SORT_REGULAR':
    default:
      // Compare items normally, handling mixed types, in reverse order.
      sorter = function(b, a) {
        var aFloat = parseFloat(a); // Numeric conversion for 'a'.
        var bFloat = parseFloat(b); // Numeric conversion for 'b'.
        var aNumeric = aFloat + '' === a; // Is 'a' a numeric string?
        var bNumeric = bFloat + '' === b; // Is 'b' a numeric string?

        if (aNumeric && bNumeric) {
          // If both are numeric, compare as numbers.
          return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
        } else if (aNumeric && !bNumeric) {
          // 'a' is numeric, 'b' is not; 'a' comes after.
          return 1;
        } else if (!aNumeric && bNumeric) {
          // 'a' is not numeric, 'b' is; 'a' comes before.
          return -1;
        }
        // If both are non-numeric, compare as strings.
        return a > b ? 1 : a < b ? -1 : 0;
      };
      break;
  }

  // Extract all keys from the input array/object.
  for (k in inputArr) {
    if (inputArr.hasOwnProperty(k)) {
      keys.push(k);
    }
  }

  // Sort the collected keys using the defined sorter.
  keys.sort(sorter);

  // BEGIN REDUNDANT CODE BLOCK - Ensuring base objects exist
  this.php_js = this.php_js || {};
  this.php_js.ini = this.php_js.ini || {};
  // END REDUNDANT CODE BLOCK

  // Check the 'phpjs.strictForIn' setting from ini_set.
  strictForIn = this.php_js.ini['phpjs.strictForIn'] &&
    this.php_js.ini['phpjs.strictForIn'].local_value &&
    this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';

  // If strict mode is enabled, populateArr directly references inputArr.
  populateArr = strictForIn ? inputArr : populateArr;

  // Rebuild the array/object by adding keys in their sorted order.
  for (i = 0; i < keys.length; i++) {
    k = keys[i]; // Current key from the sorted list.
    tmp_arr[k] = inputArr[k]; // Store the value in a temporary holder.
    if (strictForIn) {
      delete inputArr[k]; // Remove from original object if strict.
    }
  }

  // Transfer the sorted elements back to the target object.
  for (i in tmp_arr) {
    if (tmp_arr.hasOwnProperty(i)) {
      populateArr[i] = tmp_arr[i];
    }
  }

  // Return the result, which is either the original inputArr (if strictForIn)
  // or the new populateArr object.
  return strictForIn || populateArr;
}