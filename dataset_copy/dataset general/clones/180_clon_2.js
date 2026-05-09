// This module provides functionality for managing, remembering, and automatically
// selecting navigation items within a structured panel system for a web application.
//
// NOTICE: Integrates a complete version of CookieVault by John Doe, detailed below.
//
// Creator  : Alvin Green
// Homepage : http://webdev.io/tools
// License  : Apache 2.0 License, check the LICENSE.txt file.
// Version  : 2.0
// Revised  : May 15, 2024
//
//
// Arrange event listeners for the navigation components.
jQuery(document).ready( function(){
  // Attach a click handler to all navigation item links within panel structures.
  jQuery('.section_with_nav .navigation_item a').on('click', function(evt_obj){
    evt_obj.preventDefault(); // Stop default link behavior
    process_nav_selection(jQuery(this)); // Handle the navigation item activation
  });

  // Initialize the cookie management system with a storage name and duration.
  jQuery.CookieVault.Setup("selection_record", 60 * 24 * 365);

  // Iterate through each panel structure to restore any previously stored selections.
  jQuery('.section_with_nav').each(function(){
    restore_previous_selection(jQuery(this));
  });
});

// For a given panel container element, verify if a prior active navigation
// item was saved. If a record exists, activate that specific item.
function restore_previous_selection(section_element) {
  var selection_history = fetch_selection_record(); // Retrieve the stored preferences.
  // Generate a unique key for this panel and retrieve the associated item ID.
  var item_identifier = selection_history[generate_record_key_from_section(section_element.attr('id'))];
  // If an item ID is found, activate the corresponding navigation item.
  if (item_identifier !== null) {
    activate_item_display(jQuery("#" + item_identifier));
  }
}

// Activates a clicked navigation item and persists this choice in a data store.
function process_nav_selection(trigger_element) {
  var current_nav_item = trigger_element.parents("li.navigation_item"); // Find the parent navigation item.
  activate_item_display(current_nav_item); // Update the visual state of the navigation.
  save_selection_choice(current_nav_item.attr('id')); // Store the newly chosen item's ID.
}

// Manages the visual state changes required to highlight a new navigation item.
// It activates the chosen item and its corresponding content panel,
// then deactivates all sibling items and panels.
function activate_item_display(nav_item_to_activate) {
  // Derive the associated content panel ID from the navigation item's ID.
  var content_panel_id = nav_item_to_activate.attr('id').replace(/_nav$/, "_content");
  var target_content_panel = jQuery("#" + content_panel_id); // Get the content panel element.

  // Update the classes for the selected navigation item and its siblings.
  nav_item_to_activate.removeClass('nav_inactive').addClass('nav_active');
  nav_item_to_activate.siblings().removeClass('nav_active').addClass('nav_inactive');

  // Update the classes for the selected content panel and its siblings.
  target_content_panel.removeClass('panel_hidden').addClass('panel_visible');
  target_content_panel.siblings().removeClass('panel_visible').addClass('panel_hidden');
}

// Extracts the parent panel's unique ID from a given navigation item's ID.
function get_section_identifier(item_id_string) {
  // Assumes the panel ID is at the start, followed by "_sec_".
  return item_id_string.substring(0, item_id_string.indexOf("_sec_"));
}

// Generates a persistent key for this page's location and specific panel,
// starting from an individual navigation item's ID.
function generate_record_key_from_item(item_id_string) {
  // Combines the current path with the panel ID, removing leading slash if present.
  return (window.location.pathname + "--" + get_section_identifier(item_id_string)).replace(/^\//, '');
}

// Generates a persistent key for this page's location and specific panel,
// starting from the panel's own ID.
function generate_record_key_from_section(panel_id_string) {
  // Combines the current path with the panel ID, removing leading slash if present.
  return (window.location.pathname + "--" + panel_id_string).replace(/^\//, '');
}

// Stores the currently selected navigation item for the current URL and panel combination.
function save_selection_choice(item_id_string) {
  var selection_history = fetch_selection_record(); // Get existing history.
  if (selection_history === null || typeof selection_history === 'undefined') {
    selection_history = {}; // Initialize if no history exists.
  }
  // Store the item ID against a unique key.
  selection_history[generate_record_key_from_item(item_id_string)] = item_id_string;
  // Persist the updated history using the cookie vault.
  jQuery.CookieVault.StoreValue('selection_record', 'selection_history', selection_history);
}

// Retrieves the stored navigation item selection history.
function fetch_selection_record() {
  var selection_history = jQuery.CookieVault.RetrieveValue('selection_record', 'selection_history');
  // Ensure the returned value is an object, initializing if undefined or null.
  if (selection_history === undefined || selection_history === null) {
    selection_history = {};
  }
  return selection_history;
}

/*
  License:
  CookieVault 1.0 jQuery Plugin

  Copyright (c) 2024 John Doe (http://johndoe.dev)

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/

(function(jq_alias) { // Renamed $ to jq_alias

  jq_alias.CookieVault = {
    StoreData: {},
    DisplayInfo: function(cookieName) {
      DisplayInfo(cookieName);
    },
    RemoveCookie: function(cookieName) {
      RemoveCookie(cookieName);
    }, // delete cookie
    RetrieveValue: function(cookieName, variableName) {
      return RetrieveValue(cookieName, variableName);
    }, // get a single value from a cookie
    Setup: function(cookieName, lifespanMinutes) {
      Setup(cookieName, lifespanMinutes);
    },
    StoreValue: function(cookieName, variableName, itemValue) {
      StoreValue(cookieName, variableName, itemValue);
    }, // set a single value to a cookie
    ClearValue: function(cookieName, variableName) {
      ClearValue(cookieName, variableName);
    } // remove a single value from a cookie
  };

  // INTERNAL: show debugging information for a cookie
  function DisplayInfo(cookieName) {
    var plusRegex = /\+/g;
    var jsonString = decodeURIComponent(String(ExtractData(cookieName)).replace(plusRegex, " "));
    alert("Name: " + cookieName +
      "\nDuration: " + jq_alias.CookieVault.StoreData[cookieName].durationMinutes +
      " minutes\nCookie Existed Prior to Setup: " + jq_alias.CookieVault.StoreData[cookieName].existedBeforeInit + "\n\n" +
      jsonString);
  }

  // INTERNAL: completely delete a cookie
  function RemoveCookie(cookieName) {
    delete jq_alias.CookieVault.StoreData[cookieName];
    document.cookie = (cookieName + "=; expires=" + (new Date(1990, 6, 3)).toGMTString() + "; path=/");
  }

  // PRIVATE: extract the raw contents of a cookie string
  function ExtractData(cookieName) {
    var retrievedValue = null;
    var cookieParts = document.cookie.split(';');
    cookieName += "=";

    // Iterate through each part of the cookie string
    for (var partIndex in cookieParts) {
      var partString = cookieParts[partIndex];
      // Trim leading whitespace
      while (partString.charAt(0) === " ") {
        partString = partString.substring(1, partString.length);
      }
      // Check if this part is our target cookie
      if (partString.indexOf(cookieName) === 0) {
        retrievedValue = partString.substring(cookieName.length, partString.length);
        break;
      }
    }
    // Return the extracted cookie value
    return retrievedValue;
  }

  // PUBLIC: retrieve a specific value from a cookie
  function RetrieveValue(cookieName, variableName) {
    return jq_alias.CookieVault.StoreData[cookieName].storedValues[variableName];
  }

  // PUBLIC: Initialize the cookie management system for a specific cookie
  function Setup(cookieName, totalMinutes) {
    if (typeof jq_alias.CookieVault.StoreData[cookieName] === "undefined") {
      var parsedValues = {};
      var cookieFound = false;

      // Extract raw cookie data
      var rawCookieData = ExtractData(cookieName);
      if (rawCookieData !== null) {
        parsedValues = JsonUtility.parse(decodeURIComponent(String(rawCookieData).replace(/\+/g, " ")));
        cookieFound = true;
      }

      // Add cookie details to the internal data structure
      jq_alias.CookieVault.StoreData[cookieName] = {
        durationMinutes: totalMinutes,
        existedBeforeInit: cookieFound,
        storedValues: parsedValues
      };
      PersistCookie(cookieName); // Save the cookie state
    }
  }

  // PRIVATE: write the cookie data to the user's browser
  function PersistCookie(cookieName) {
    var expirationString = "";
    if (jq_alias.CookieVault.StoreData[cookieName].durationMinutes > 0) {
      var expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + jq_alias.CookieVault.StoreData[cookieName].durationMinutes);
      expirationString = ("; expires=" + expiryDate.toGMTString());
    }
    document.cookie = (cookieName + "=" +
      encodeURIComponent(JsonUtility.stringify(jq_alias.CookieVault.StoreData[cookieName].storedValues)) +
      expirationString + "; path=/");
  }

  // PUBLIC: set and save a specific value within a cookie
  function StoreValue(cookieName, variableName, itemValue) {
    jq_alias.CookieVault.StoreData[cookieName].storedValues[variableName] = itemValue;
    PersistCookie(cookieName); // Save changes to the cookie
  }

  // PUBLIC: remove a single variable from a cookie and save changes
  function ClearValue(cookieName, variableName) {
    delete jq_alias.CookieVault.StoreData[cookieName].storedValues[variableName];
    PersistCookie(cookieName); // Save changes to the cookie
  }

})(jQuery); // Renamed $ to jQuery in the IIFE call

/*
    http://www.JSON.org/json2.js
    2008-05-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JsonUtility object containing two methods: stringify
    and parse.

        JsonUtility.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects without a toIsoString
                        method. It can be a function or an array.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toIsoString
            method, its toIsoString method will be called and the result will be
            stringified. A toIsoString method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toIsoString method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toIsoString = function (propertyKey) {
                    function formatDigit(num) {
                        // Format integers to have at least two digits.
                        return num < 10 ? '0' + num : num;
                    }

                    return this.getUTCFullYear()   + '-' +
                         formatDigit(this.getUTCMonth() + 1) + '-' +
                         formatDigit(this.getUTCDate())      + 'T' +
                         formatDigit(this.getUTCHours())     + ':' +
                         formatDigit(this.getUTCMinutes())   + ':' +
                         formatDigit(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array, then it will be used to
            select the members to be serialized. It filters the results such
            that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JsonUtility values.
            JsonUtility.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JsonUtility.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JsonUtility.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JsonUtility.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JsonUtility.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JsonUtility.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JsonUtility.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*global JsonUtility */ // Updated JSLint directive

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JsonUtility, "\\", call,
    charCodeAt, getUTCDate, getUTCFullYear, getUTCHours, getUTCMinutes,
    getUTCMonth, getUTCSeconds, hasOwnProperty, join, lastIndex, itemCount,
    parse, propertyIsEnumerable, prototype, push, replace, slice, stringify,
    test, toIsoString, toString
*/

if (!this.JsonUtility) { // Check for JsonUtility instead of JSON

  // Create a JSON utility object only if one does not already exist. The object
  // is created within a closure to prevent global variable pollution.

  JsonUtility = function() { // Assign to JsonUtility

    function formatDigit(num) {
      // Ensures integers are formatted with at least two digits.
      return num < 10 ? '0' + num : num;
    }

    Date.prototype.toIsoString = function(propertyKey) { // Renamed toJSON to toIsoString, key to propertyKey

      return this.getUTCFullYear() + '-' +
        formatDigit(this.getUTCMonth() + 1) + '-' +
        formatDigit(this.getUTCDate()) + 'T' +
        formatDigit(this.getUTCHours()) + ':' +
        formatDigit(this.getUTCMinutes()) + ':' +
        formatDigit(this.getUTCSeconds()) + 'Z';
    };

    var controlCharRegex = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var specialCharRegex = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var indentationGap;
    var indentationString;
    var charSubstitutions = { // Table for character replacements
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    };
    var replacerFunction;


    function wrapInQuotes(text) { // Renamed quote to wrapInQuotes, string to text

      // If the string does not contain control characters, quotes, or backslashes,
      // it can be safely enclosed in quotes. Otherwise, offending characters
      // must be replaced with escape sequences.
      specialCharRegex.lastIndex = 0;
      return specialCharRegex.test(text) ?
        '"' + text.replace(specialCharRegex, function(matchedChar) { // Renamed a to matchedChar
          var replacement = charSubstitutions[matchedChar];
          if (typeof replacement === 'string') {
            return replacement;
          }
          return '\\u' + ('0000' +
            (+(matchedChar.charCodeAt(0))).toString(16)).slice(-4);
        }) + '"' :
        '"' + text + '"';
    }


    function convertToString(propertyKey, parentObject) { // Renamed str to convertToString, key to propertyKey, holder to parentObject

      // Generates a string representation from parentObject[propertyKey].

      var loopCounter; // The loop iteration variable. (Renamed i to loopCounter)
      var memberKey; // The member's key. (Renamed k to memberKey)
      var memberValue; // The member's value. (Renamed v to memberValue)
      var itemCount; // The number of items in an array/object. (Renamed length to itemCount)
      var currentIndent = indentationGap; // The current indentation level. (Renamed mind to currentIndent)
      var resultFragments; // Array to hold the stringified parts. (Renamed partial to resultFragments)
      var currentValue = parentObject[propertyKey]; // The value currently being processed. (Renamed value to currentValue)

      // If the value has a custom toIsoString method, call it for a replacement.
      if (currentValue && typeof currentValue === 'object' &&
        typeof currentValue.toIsoString === 'function') { // Check for toIsoString
        currentValue = currentValue.toIsoString(propertyKey);
      }

      // If a replacer function was provided, call it to get a replacement value.
      if (typeof replacerFunction === 'function') { // Check for replacerFunction
        currentValue = replacerFunction.call(parentObject, propertyKey, currentValue);
      }

      // The next steps depend on the type of the value.
      switch (typeof currentValue) {
        case 'string':
          return wrapInQuotes(currentValue);

        case 'number':
          // JSON numbers must be finite. Non-finite numbers are encoded as null.
          return isFinite(currentValue) ? String(currentValue) : 'null';

        case 'boolean':
        case 'null':
          // If the value is a boolean or null, convert it to a string.
          return String(currentValue);

          // If the type is 'object', it could be an object, an array, or null.
        case 'object':
          // Due to an ECMAScript specification quirk, typeof null is 'object'.
          if (!currentValue) {
            return 'null';
          }

          // Create an array to accumulate the stringified parts of this object/array.
          indentationGap += indentationString;
          resultFragments = [];

          // If the object has a 'dontEnum' length property, treat it as an array.
          // The original code is truncated here.
      }
    }
  };
}