"use strict";


const helpersCollection = exports = {}; // Establish a container object for various utility functions.



helpersCollection.cleanPatternMetaChars = function (inputContent) { // This routine escapes special characters within a string for safe use in regular expressions.
    return inputContent.replace(
        /[-[\]{}()*+?.,\\^$|#\s]/g, // Identifies all characters that possess special meaning in regex patterns.
        "\\$&"                    // Replaces each identified character with its escaped counterpart.
    );
};


helpersCollection.mergeProperties = function (destinationObject) { // A function to deeply merge properties from multiple source objects into a primary destination object.

    const sourceItems = Array.prototype.slice.call(arguments, 1); // Gathers all provided source objects, excluding the initial destination.

    sourceItems.forEach(function (currentItem) { // Iterates through each gathered source object.

        for (const propertyName in currentItem) { // Examines every enumerable property name within the current source.

            if (Reflect.has(currentItem, propertyName)) { // Confirms that the property is directly owned by the source, not inherited.

                destinationObject[propertyName] = currentItem[propertyName]; // Assigns the property's value from the source to the destination.

            }
        }
    });

    return destinationObject; // Returns the destination object, now enriched with merged properties.
};


helpersCollection.stripScriptAnnotations = function (rawSourceText) { // This utility removes common JavaScript comment types from a given text block.
    return rawSourceText.replace(
        /\/\*.+?\*\/|\/\/\s.*(?=[\n\r]|$)/g, // Matches both multi-line (/*...*/) and single-line (//) comments, including those at EOF.
        ''                                 // Replaces the matched comments with an empty string, effectively deleting them.
    );
};


helpersCollection.filterFlaggedLines = function (contentData) { // Processes a multi-line string to exclude lines marked with a specific directive.
    return contentData
        .split('\n') // Breaks down the entire input content into an array of individual lines.
        .filter(function (currentLine) { // Filters this array, keeping only lines that meet the specified criteria.
            // Checks if the current line DOES NOT begin with the special comment directive.
            return !currentLine.startsWith('//!');
        })
        .join('\n') // Reconstructs the filtered lines back into a single string, separated by newlines.
        .trim(); // Finally, removes any leading or trailing whitespace from the resulting string.
};