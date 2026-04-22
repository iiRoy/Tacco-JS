// Restore form fields from serialized data
// Edition 1.0.8
// © 2010-2012 Christopher Thielen, and contributors (refer to RevisionLog below)
// Licensed under both GPLv2 and the MIT open source licenses

// Usage example:
//        let formData = $("form").serialize(); // capture form state
//        $("form").hydrateForm(formData);  // reinstate form state

// Considerations:
//        * Traverses nested fieldsets, paragraph tags, etc.
//        * Form controls must possess a 'name' attribute.

// Alternative usage example:
//        let formData = $("form").serialize();
//        $("form").hydrateForm(formData, {
//          'valueHandler'        : function(fieldKey, valueContent, [domObject]) { $(`input[name=${fieldKey}]`).val(valueContent); },
//          'overwriteExisting' : false
//        });
//
//        valueHandler (optional):
//          This handler receives the element and its value, allowing for the creation of
//          dynamic forms. If it returns `false`, the `hydrateForm` utility will
//          attempt to locate and set the DOM element; otherwise (if `true`), it assumes
//          you've managed that attribute and proceeds to the next.
//          The handler will be passed the field key, its value, and, if located, the DOM object
//          it would use if you return `false`. If no DOM object is found, the third parameter
//          will be the empty jQuery array returned when an element is not found.
//        overwriteExisting (optional, defaults to false):
//          Determines whether controls that already contain data (e.g., an input tag with a non-empty value)
//          will be altered by the deserializer. This does not apply to radio buttons or checkboxes.
//          If you have a scenario for radio buttons or checkboxes, please submit an issue at
//          https://github.com/cthielen/unserialize-to-form/issues/ . Also note this option
//          does not affect a custom handler; a handler still has the opportunity
//          to override a value even if this option is set to `false`. It is your responsibility
//          as the handler author to enforce the desired behavior.

// Consult RevisionLog at the end of this file for historical records.

(function(jQ) {
  let helperRoutines = {
    // Sets the value for a specific DOM element, handling various input types.
    _assignElementValue : function( targetField, assignedValue, forceUpdate ) {

       if(jQ(targetField).length > 1) {
     		// Multiple elements with the same name are likely radio buttons or checkboxes in a group
     		jQ.each(targetField, function(idx) {

				let isMatch = (jQ.isArray(assignedValue)
							 ? (jQ.inArray(this.value, assignedValue) !== -1)
							 : (this.value === assignedValue)
							);

				this.checked = isMatch; // Set checked state for radio/checkbox
     		});
     	} else {
     		// A single element suggests it's not a radio button group
     		if(jQ(targetField).attr("type") === "checkbox") {
     			jQ(targetField).prop("checked", true); // Check the checkbox
     		} else {
     		  if(forceUpdate) {
     		    jQ(targetField).val(assignedValue); // Directly set the value
     		  } else {
     		    if (!jQ(targetField).val()) { // Only set if current value is empty
              jQ(targetField).val(assignedValue);
            }
     		  }
     		}
     	}
    },

    // Adds a value to an object's property, handling conversion to array if needed.
    _insertItem : function( collection, propName, inputVal ) {
      if (collection[propName] === null)
        collection[propName] = inputVal;
      else if (collection[propName].push)
        collection[propName].push(inputVal);
      else
        collection[propName] = [collection[propName], inputVal]; // Convert to array and add new value
    }
  };

	// Takes a URL-encoded string (e.g., `item1=valueA&item2=valueB`) and populates form controls
	// (e.g., `input name="item1"`) with their corresponding values (e.g., `valueA`).
	jQ.fn.hydrateForm = function( serializedPayload, userSettings ) {

	  // Establish default configuration
    let currentConfig = jQ.extend( {
      'valueHandler'         : undefined,
      'overwriteExisting'  : false
    }, userSettings);

	  return this.each(function() {
  		// This segment for deserialization is adapted from James Campbell's "JQuery Unserialize v1.0"
  		serializedPayload = serializedPayload.split("&");
  		let handlerFunction = currentConfig["valueHandler"];
  		let overwriteFlag = currentConfig["overwriteExisting"];

  		if(handlerFunction && typeof(handlerFunction) !== "function") {
  			handlerFunction = undefined; // If not a valid function, treat as if no handler was provided
  		}

  		let parsedDataMap = []; // Initialize an empty array for parsed key-value pairs
  		jQ.each(serializedPayload, function() {
  			let kvPair = this.split("=");

  			if((typeof kvPair[0] !== 'undefined') && (typeof kvPair[1] !== 'undefined')) {
          helperRoutines._insertItem(parsedDataMap, kvPair[0].replace(/\+/g, " "), decodeURI(kvPair[1].replace(/\+/g, " ")));
  			}
  		});

  		// `serializedPayload` is now a structured array with `parsedDataMap[dataIdentifier] = associatedValue`
  		serializedPayload = parsedDataMap;

  		// Initially uncheck all checkboxes and radios, as unchecked ones are not included in serialized data
  		jQ(this).find(":checked").attr("checked", false);

  		// Iterate through each stored data entry and set the corresponding form control
  		for(let entryKey in serializedPayload) {
  			let targetControl = jQ(this).add("input,select,textarea").find(`[name="${unescape(entryKey)}"]`);

        if(typeof(serializedPayload[entryKey]) !== "string") {
          // Select elements with 'multiple' attribute will produce arrays here (type "object")
          // Simple unescape() won't work as it flattens arrays.
          // Instead, unescape each item individually.
          let parsedValue = [];
          jQ.each(serializedPayload[entryKey], function(idx, valItem) {
            parsedValue.push(unescape(valItem));
          })
        } else {
  			  let parsedValue = unescape(serializedPayload[entryKey]);
        }

  			if(handlerFunction === undefined) {
  				// No custom handler provided - assume DOM elements are present
  				helperRoutines._assignElementValue(targetControl, parsedValue, overwriteFlag);
  			} else {
  				// Custom handler specified - do not assume DOM elements exist yet
  				let handlerOutcome = handlerFunction.call(this, unescape(entryKey), parsedValue, targetControl);

  				// If the handler returns `true`, it means it took care of setting the value. If not, we will.
  				// Returning `false` allows for DOM construction without immediate value assignment.
  				if(handlerOutcome === false) {
            let reFoundElement = jQ(this).add("input,select,textarea").find(`[name="${unescape(entryKey)}"]`);
  					// Attempt to locate the element again, as it might have been created by the custom handler
  					helperRoutines._assignElementValue(reFoundElement, parsedValue, overwriteFlag);
  				}
        }
  		}
		})
	}
})(jQuery);

// RevisionLog
// 2010-11-19: Edition 1.0 released. Supports text, checkbox, and select inputs.
// 2011-01-26: Edition 1.0.1 released. Corrected regular expression search, thanks to Anton.
// 2011-02-02: Edition 1.0.2 released. Added support for textareas & checks for undefined values, thanks to Brandon.
// 2011-10-19: Edition 1.0.3 released:
//                                    * Fixed unescaping problem for specific encoded characters (@)
//                                    * Iterates through stored elements instead of the form during deserialization
//                                    * Provides an optional callback for constructing dynamic forms
//                                    * Resolved issue with setting radio buttons
// 2011-11-11: Edition 1.0.4 released:
//                                    * Utilizes .attr() instead of .prop() for jQuery 1.6 compatibility (Edward Anderson)
//                                    * Resets unchecked checkboxes and radios (Edward Anderson)
// 2011-12-06: Edition 1.0.5 released:
//                                    * Fixed a problem with certain UTF characters (e.g., Chinese characters, thanks hoka!)
//                                    * Implemented the 'return this' chaining method as advised in jQuery documentation
//                                    * Encapsulated internal methods to maintain clean namespaces
//                                    * Changed the second parameter to an options object to accommodate a new setting
//                                    * Added a new option 'overwriteExisting', defaulting to false, to control whether fields
//                                      with existing content should be affected by the deserializer
// 2012-02-08: Edition 1.0.6 released:
//                                    * Corrected a documentation error. Thanks, Scott Kirkland.
//                                    * Added the queried element (if found) as an optional third argument for callbacks.
// 2012-02-29: Edition 1.0.7 released:
//                                    * Added support for <select multiple> elements. Thanks, Joshua Weinstein.
// 2012-09-11: Edition 1.0.8 released:
//                                    * Added support for input element arrays. Thanks, Gary Green.
//                                      Note: Input element arrays should first be cleared.