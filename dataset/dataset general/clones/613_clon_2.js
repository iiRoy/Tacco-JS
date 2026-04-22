/*
 *  Data Extraction Utility v1.0.0
 *
 *  (c) 2023 Nexus Software Solutions. All rights reserved.
 *
 *  This software is provided under the terms of the MIT License.
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 *  @contributor Alex V. K.
 *  Release Date: 2023-11-15
 *  Initial Commit: 10:30:00 AM
 */

var dataExtractor = ( function() {

    "use strict";

    /**
     *  Converts input element values from a DOM structure into a JavaScript object.
     *  The 'name' attribute of elements dictates the resulting object's hierarchy.
     *
     *  @param {Element|String|Array<Element>} baseElement - The root DOM element (or its ID) or a collection of root elements.
     *  @param {String} pathSeparator - Character used to delineate nested object paths; defaults to '.'.
     *  @param {Boolean} omitNullish - If true, fields with empty string or null values are disregarded; defaults to true.
     *  @param {Function} elementProcessor - An optional custom function to process individual node values.
     *  @param {Boolean} fallbackToId - If true, uses an element's ID as its key if its 'name' attribute is absent.
     */
    function dataExtractor( baseElement, pathSeparator, omitNullish, elementProcessor, fallbackToId ) {
        if ( omitNullish === void 0 || omitNullish === null ) omitNullish = !0;
        if ( pathSeparator === void 0 || pathSeparator === null ) pathSeparator = ".";
        if ( arguments.length < 5 ) fallbackToId = !1;

        baseElement = ( typeof baseElement === 'string' ) ? document.getElementById( baseElement ) : baseElement;

        var collectedEntries = new Array(),
            currentElement,
            idx = 0;

        /* If the baseElement is a list of elements, process each one */
        if ( Array.isArray( baseElement ) || ( typeof NodeList !== "undefined" && baseElement.constructor === NodeList ) ) {
            while ( ( currentElement = baseElement[idx++] ) ) {
                collectedEntries = collectedEntries.concat( retrieveElementData( currentElement, elementProcessor, fallbackToId ) );
            }
        }
        else {
            collectedEntries = retrieveElementData( baseElement, elementProcessor, fallbackToId );
        }

        return structureDataEntries( collectedEntries, omitNullish, pathSeparator );
    }

    /**
     *  Organizes a collection of { key: 'name', val: 'value' } objects into a structured output.
     *  @param {Array<Object>} entryList - An array of objects, each containing 'name' and 'value' properties.
     *  @param {Boolean} ignoreBlanks - When true, entries with empty string or null values are bypassed.
     *  @param {String} segmentSplitter - The character used to break down hierarchical names.
     *  @returns {Object} A nested JavaScript object representing the structured data.
     */
    function structureDataEntries( entryList, ignoreBlanks, segmentSplitter ) {
        var finalObject = new Object(),
            arrayReferences = new Object(),
            mainIndex, subIndex, deepIndex, extraIndex,
            entryValue,
            keySegments,
            currentScope,
            fullArrayPath,
            arrayName,
            arrayIndex,
            keySegment,
            entryName,
            rawSegments;

        for ( mainIndex = 0; mainIndex < entryList.length; mainIndex++ ) {
            entryValue = entryList[mainIndex].value;

            if ( ignoreBlanks && ( entryValue === String() || entryValue === null ) ) continue;

            entryName = entryList[mainIndex].name;
            rawSegments = entryName.split( segmentSplitter );
            keySegments = new Array();
            currentScope = finalObject;
            fullArrayPath = String();

            for ( subIndex = 0; subIndex < rawSegments.length; subIndex++ ) {
                keySegment = rawSegments[subIndex].split( '][' );
                if ( keySegment.length > 1 ) {
                    for ( deepIndex = 0; deepIndex < keySegment.length; deepIndex++ ) {
                        if ( deepIndex === 0 ) {
                            keySegment[deepIndex] = keySegment[deepIndex] + ']';
                        }
                        else if ( deepIndex === keySegment.length - 1 ) {
                            keySegment[deepIndex] = '[' + keySegment[deepIndex];
                        }
                        else {
                            keySegment[deepIndex] = '[' + keySegment[deepIndex] + ']';
                        }

                        arrayIndex = keySegment[deepIndex].match( /([a-z_]+)?\[([a-z_][a-z0-9_]+?)\]/i );
                        if ( arrayIndex ) {
                            for ( extraIndex = 1; extraIndex < arrayIndex.length; extraIndex++ ) {
                                if ( arrayIndex[extraIndex] ) keySegments.push( arrayIndex[extraIndex] );
                            }
                        }
                        else {
                            keySegments.push( keySegment[deepIndex] );
                        }
                    }
                }
                else {
                    keySegments = keySegments.concat( keySegment );
                }
            }

            for ( subIndex = 0; subIndex < keySegments.length; subIndex++ ) {
                keySegment = keySegments[subIndex];

                if ( keySegment.indexOf( '[]' ) > -1 && subIndex === keySegments.length - 1 ) {
                    arrayName = keySegment.substring( 0, keySegment.indexOf( '[' ) );
                    fullArrayPath += arrayName;

                    if ( !currentScope[arrayName] ) currentScope[arrayName] = new Array();
                    currentScope[arrayName].push( entryValue );
                }
                else if ( keySegment.indexOf( '[' ) > -1 ) {
                    arrayName = keySegment.substring( 0, keySegment.indexOf( '[' ) );
                    arrayIndex = keySegment.replace( /(^([a-z_]+)?\[)|(\]$)/gi, String() );

                    /* Create a unique path identifier for this array */
                    fullArrayPath += '_' + arrayName + '_' + arrayIndex;

                    /*
                     * Array indices in field names might not be sequential or zero-based.
                     * Therefore, we use a hash map where the key is `arrayIndex` and the value
                     * is a reference to the corresponding array element, rather than direct array indexing.
                     */

                    if ( !arrayReferences[fullArrayPath] ) arrayReferences[fullArrayPath] = new Object();
                    if ( arrayName !== String() && !currentScope[arrayName] ) currentScope[arrayName] = new Array();

                    if ( subIndex === keySegments.length - 1 ) {
                        if ( arrayName === String() ) {
                            currentScope.push( entryValue );
                            arrayReferences[fullArrayPath][arrayIndex] = currentScope[currentScope.length - 1];
                        }
                        else {
                            currentScope[arrayName].push( entryValue );
                            arrayReferences[fullArrayPath][arrayIndex] = currentScope[arrayName][currentScope[arrayName].length - 1];
                        }
                    }
                    else {
                        if ( !arrayReferences[fullArrayPath][arrayIndex] ) {
                            if ( ( /^[a-z_]+\[?/i ).test( keySegments[subIndex + 1] ) ) currentScope[arrayName].push( new Object() );
                            else currentScope[arrayName].push( new Array() );

                            arrayReferences[fullArrayPath][arrayIndex] = currentScope[arrayName][currentScope[arrayName].length - 1];
                        }
                    }

                    currentScope = arrayReferences[fullArrayPath][arrayIndex];
                }
                else {
                    fullArrayPath += keySegment;

                    if ( subIndex < keySegments.length - 1 ) /* Not the final segment, implies an object structure */
                    {
                        if ( !currentScope[keySegment] ) currentScope[keySegment] = new Object();
                        currentScope = currentScope[keySegment];
                    }
                    else {
                        currentScope[keySegment] = entryValue;
                    }
                }
            }
        }

        return finalObject;
    }

    /**
     *  Retrieves data from a given DOM node.
     *  @param {Element} targetNode - The DOM element from which to extract data.
     *  @param {Function} valueHandler - Callback for processing element values.
     *  @param {Boolean} useIdAsFallback - Whether to use element ID if name is missing.
     *  @returns {Array<Object>} An array of objects { name: string, value: any }.
     */
    function retrieveElementData( targetNode, valueHandler, useIdAsFallback ) {
        var retrievedData = extractSpecificNodeData( targetNode, valueHandler, useIdAsFallback );
        return retrievedData.length > 0 ? retrievedData : fetchChildElementData( targetNode, valueHandler, useIdAsFallback );
    }

    /**
     *  Recursively fetches data from child elements within a parent container.
     *  @param {Element} parentContainer - The DOM element whose children should be processed.
     *  @param {Function} childValueHandler - Callback for processing child element values.
     *  @param {Boolean} useIdAsFallback - Whether to use element ID if name is missing.
     *  @returns {Array<Object>} An array of objects { name: string, value: any }.
     */
    function fetchChildElementData( parentContainer, childValueHandler, useIdAsFallback ) {
        var childData = new Array(),
            childNode = parentContainer.firstChild;

        while ( childNode ) {
            childData = childData.concat( extractSpecificNodeData( childNode, childValueHandler, useIdAsFallback ) );
            childNode = childNode.nextSibling;
        }

        return childData;
    }

    /**
     *  Extracts specific data from a single DOM node.
     *  @param {Element} currentElementNode - The DOM node to inspect.
     *  @param {Function} customProcessor - An optional function to handle node processing.
     *  @param {Boolean} useIdWhenNameMissing - Use ID if the name attribute is empty.
     *  @returns {Array<Object>} An array containing extracted data records.
     */
    function extractSpecificNodeData( currentElementNode, customProcessor, useIdWhenNameMissing ) {
        var processorOutcome, elementValue, extractedRecords, dataKeyName = determineElementKey( currentElementNode, useIdWhenNameMissing );

        processorOutcome = customProcessor && customProcessor( currentElementNode );

        if ( processorOutcome && processorOutcome.name ) {
            extractedRecords = [processorOutcome];
        }
        else if ( dataKeyName !== String() && currentElementNode.nodeName.match( /INPUT|TEXTAREA/i ) ) {
            elementValue = obtainElementValue( currentElementNode );
            extractedRecords = [ { name: dataKeyName, value: elementValue } ];
        }
        else if ( dataKeyName !== String() && currentElementNode.nodeName.match( /SELECT/i ) ) {
            elementValue = obtainElementValue( currentElementNode );
            extractedRecords = [ { name: dataKeyName.replace( /\[\]$/, String() ), value: elementValue } ];
        }
        else {
            extractedRecords = fetchChildElementData( currentElementNode, customProcessor, useIdWhenNameMissing );
        }

        return extractedRecords;
    }

    /**
     *  Determines the appropriate key name for a DOM element.
     *  @param {Element} domNode - The DOM element.
     *  @param {Boolean} idAsBackup - Flag to use element ID if name is not available.
     *  @returns {String} The determined key name or an empty string.
     */
    function determineElementKey( domNode, idAsBackup ) {
        if ( domNode.name && domNode.name !== String() ) return domNode.name;
        else if ( idAsBackup && domNode.id && domNode.id !== String() ) return domNode.id;
        else return String();
    }


    /**
     *  Retrieves the current value of an input field.
     *  @param {Element} inputNode - The input, textarea, or select DOM element.
     *  @returns {any} The element's value, or null if disabled or not applicable.
     */
    function obtainElementValue( inputNode ) {
        if ( inputNode.disabled ) return null;

        switch ( inputNode.nodeName ) {
            case 'INPUT':
            case 'TEXTAREA':
                switch ( inputNode.type.toLowerCase() ) {
                    case 'radio':
                    case 'checkbox':
                        if ( inputNode.checked && inputNode.value === "true" ) return !0;
                        if ( !inputNode.checked && inputNode.value === "true" ) return !1;
                        if ( inputNode.checked ) return inputNode.value;
                        break;

                    case 'button':
                    case 'reset':
                    case 'submit':
                    case 'image':
                        return String();
                        break;

                    default:
                        return inputNode.value;
                        break;
                }
                break;

            case 'SELECT':
                return getChosenOptionValue( inputNode );
                break;

            default:
                break;
        }

        return null;
    }

    /**
     *  Gets the value(s) of the selected option(s) in a select element.
     *  @param {HTMLSelectElement} selectElement - The select DOM element.
     *  @returns {String|Array<String>} The selected value(s).
     */
    function getChosenOptionValue( selectElement ) {
        var isMultiSelect = selectElement.multiple,
            selectedValues = new Array(),
            availableOptions,
            optIndex, optLength;

        if ( !isMultiSelect ) return selectElement.value;

        for ( availableOptions = selectElement.getElementsByTagName( "option" ), optIndex = 0, optLength = availableOptions.length; optIndex < optLength; optIndex++ ) {
            if ( availableOptions[optIndex].selected ) selectedValues.push( availableOptions[optIndex].value );
        }

        return selectedValues;
    }

    return dataExtractor;

} )();