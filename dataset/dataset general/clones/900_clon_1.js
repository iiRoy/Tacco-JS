/*
 * This file is part of a custom JSON stringifier utility.
 * It handles specific data types like Mongoose ObjectIds and Dates,
 * and provides options for pretty-printing.
 */

// Import the Mongoose library; required for custom type handling.
var mongoose = require('mongoose')
;


// Helper function: Pads a single digit number with a leading zero.
function f(n)
{
   return n < 10 ? '0' + n : n; // Ternary operator for padding.
}


// Regular expression to identify unescaped control characters, BOM, and other problematic Unicode characters.
var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// Another regex for characters that need to be escaped within JSON strings.
var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;


// Global variables for managing indentation and replacement behavior.
var gap;    // Stores the current indentation string for pretty-printing.
var indent; // Stores the base indentation string (e.g., '  ' or '\t').


// Lookup table for common character substitutions in JSON strings.
var meta = {
   // Table of character substitutions for escaping.
   '\b' : '\\b', // Backspace
   '\t' : '\\t', // Tab
   '\n' : '\\n', // Newline
   '\f' : '\\f', // Form feed
   '\r' : '\\r', // Carriage return
   '"'  : '\\"', // Double quote
   '\\' : '\\\\'  // Backslash
};

var rep; // Replacer function or array, passed to stringify.


// Encloses a string in double quotes and escapes necessary characters.
function quote(string)
{
   // Reset the lastIndex of the escapable regex before each use.
   escapable.lastIndex = 0;

   // Check if the string contains any characters that need escaping.
   return escapable.test(string)
      ? '"' + string.replace(escapable, function (a) {
         // This anonymous function performs the actual character replacement.
         var c = meta[a]; // Look up the character in the meta table.

         // If a direct substitution exists, use it. Otherwise, convert to Unicode escape sequence.
         return typeof c === 'string'
            ? c
            : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"'
      : '"' + string + '"'; // If no escaping is needed, just wrap in quotes.
}


// Recursive function to stringify a value.
function str(key, holder)
{
   var i,        // Loop counter.
       k,        // Key for object properties.
       v,        // Value of a property or element.
       length,   // Length of array or replacer array.
       mind = gap, // Store the current gap for restoring after recursion.
       partial,  // Array to hold stringified parts (for objects/arrays).
       value = holder[key]; // The actual value to be stringified.

   // Custom handling for Mongoose ObjectId instances.
   if (value instanceof mongoose.Types.ObjectId)
   {
      return 'ObjectId("' + value + '")';
   }
   // Custom handling for Date instances.
   else if (value instanceof Date)
   {
      return 'ISODate("' + value.toJSON() + '")';
   }

   // If the value has a toJSON method, call it to transform the value.
   if (value && typeof value === 'object' &&
           typeof value.toJSON === 'function')
   {
      value = value.toJSON(key); // Transform value using its custom toJSON method.
   }


   // If a replacer function is provided, call it to transform the value.
   if (typeof rep === 'function')
   {
      value = rep.call(holder, key, value); // Apply replacer function.
   }


   // Determine how to stringify based on the value's type.
   switch (typeof value)
   {
      case 'string':
         // String values are quoted and escaped.
         return quote(value);

      case 'number':
         // Number values are converted to string, or 'null' if not finite.
         return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':
         // Boolean and null values are simply converted to their string representation.
         return String(value);

      case 'object':
         // Handle null first, as typeof null is 'object'.
         if (!value)
         {
            return 'null';
         }

         // Increase indentation level for pretty-printing nested structures.
         gap += indent;

         // Initialize array to hold stringified properties/elements.
         partial = [];

         // Handle arrays.
         if (Object.prototype.toString.apply(value) === '[object Array]')
         {
            length = value.length; // Get array length.

            // Iterate through array elements.
            for (i = 0; i < length; i += 1)
            {
               // Recursively stringify each element. Use 'null' if stringification fails.
               partial[i] = str(i, value) || 'null';
            }

            // Format the array output.
            v = partial.length === 0
               ? '[]' // Empty array.
               : gap  // If indentation is active (pretty-printing).
                  ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' // Pretty-printed array.
                  : '[' + partial.join(',') + ']'; // Compact array.

            gap = mind; // Restore previous indentation level.
            return v;    // Return the stringified array.
         }

         // Handle objects with a replacer array.
         if (rep && typeof rep === 'object')
         {
            length = rep.length; // Get length of replacer array.

            for (i = 0; i < length; i += 1)
            {
               // Only process string keys from the replacer array.
               if (typeof rep[i] === 'string')
               {
                  k = rep[i]; // Current key from replacer.
                  v = str(k, value); // Recursively stringify the property value.

                  if (v)
                  {
                     // Add the key-value pair to partial array.
                     partial.push(quote(k) + (gap ? ': ' : ':') + v);
                  }
               }
            }
         }
         // Handle general objects (no replacer array or replacer function already handled).
         else
         {
            // Iterate over all enumerable properties of the object.
            for (k in value)
            {
               // Ensure the property belongs to the object itself, not its prototype chain.
               if (Object.prototype.hasOwnProperty.call(value, k))
               {
                  v = str(k, value); // Recursively stringify the property value.

                  if (v)
                  {
                     // Add the key-value pair to partial array.
                     partial.push(quote(k) + (gap ? ': ' : ':') + v);
                  }
               }
            }
         }

         // Format the object output.
         v = partial.length === 0
            ? '{}' // Empty object.
            : gap  // If indentation is active (pretty-printing).
               ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' // Pretty-printed object.
               : '{' + partial.join(',') + '}'; // Compact object.

         gap = mind; // Restore previous indentation level.
         return v;    // Return the stringified object.
   }
}


// Export the stringify function.
// This function mimics JSON.stringify but with custom type handling.
exports.stringify = function (value, replacer, space)
{
   var i; // Loop counter for space generation.

   // Initialize global indentation variables.
   gap = '';
   indent = '';

   // Determine indentation string based on 'space' parameter.
   if (typeof space === 'number')
   {
      // If space is a number, create a string of that many spaces.
      for (i = 0; i < space; i += 1)
      {
         indent += ' ';
      }
   }
   else if (typeof space === 'string')
   {
      // If space is a string, use it directly as the indent.
      indent = space;
   }

   // Set the replacer function or array.
   rep = replacer;

   // Validate the replacer argument.
   if (replacer && typeof replacer !== 'function' &&
           (typeof replacer !== 'object' ||
           typeof replacer.length !== 'number'))
   {
      // Throw an error if replacer is invalid.
      throw new Error('JSON.stringify');
   }

   // Begin the stringification process with an empty key and a dummy holder object.
   // The actual value is accessed via holder[''].
   return str('', {'': value});
};