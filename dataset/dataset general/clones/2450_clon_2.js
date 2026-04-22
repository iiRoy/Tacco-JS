// This module provides a basic templating system, influenced by JsTemplates,
// specifically tailored for internationalization (i18n).
//
// It offers support for three primary directives:
//
//   * translate-text: Populates the text content of an HTML element.
//
//     Example: <p translate-text="welcomeMessage"></p>
//
//   * generate-choices: Creates <option> elements within a <select> dropdown.
//
//     Example: <select generate-choices="countryList"></select>
//
//   * assign-properties: Sets HTML attributes or DOM properties.
//     DOM properties are indicated by a leading '.' and can be deeply nested.
//
//     Example: <div assign-properties="id:uniqueId;.style.color:textColor"></div>
//
// This source is an adaptation of an existing i18n script, modified to
// integrate with a dynamic data loading mechanism.

var localizationEngine = ( function() {

  /**
   *  Holds the various functions that process specific directives.
   *  The string key identifies the directive (attribute name)
   *  and its value is the function executed for matching elements.
   *  @type {Object}
   */
  var actionMap = {
    /**
     *  This function assigns textual content to the target element.
     *  @param {HTMLElement} targetElem The DOM element to update.
     *  @param {string} valueId The identifier for the string in the data source.
     *  @param {LoadTimeData} valueSource The source object containing internationalized values.
     */
    'translate-text': function(targetElem, valueId, valueSource) {
      targetElem.textContent = valueSource.getString( valueId );
    },

    /**
     *  This routine populates a <select> element with <option> tags.
     *  @param {HTMLElement} dropdown The <select> element to populate.
     *  @param {string} dataKey The key for the array of options within the data source.
     *      Each entry in the array can be a single string (for content only)
     *      or an array [value, content] for content and an explicit value.
     *  @param {LoadTimeData} dataStore The object holding the dynamic data.
     */
    'generate-choices': function(dropdown, dataKey, dataStore) {
      var choiceList = dataStore.getValue(dataKey);
      choiceList.forEach(function(choiceDatum) {
        var choiceItem = (typeof choiceDatum === 'string')
            ? new Option(choiceDatum)
            : new Option(choiceDatum[1], choiceDatum[0]);
        dropdown.appendChild(choiceItem);
      });
    },

    /**
     *  This function handles setting various HTML attributes or DOM object properties.
     *  Syntax: `attrName:dataId; .domProp:dataId; .nested.prop:dataId`
     *  @param {HTMLElement} itemNode The HTML element to modify.
     *  @param {string} propAndPaths A semicolon-separated list of property/key pairs.
     *      Each pair consists of a property name (or path) followed by a colon,
     *      and then the key to retrieve the value from the data source.
     *  @param {LoadTimeData} stringVault The data repository for values.
     */
    'assign-properties': function(itemNode, propAndPaths, stringVault) {
      var segmentList = propAndPaths.replace(/\s/g, '').split(/;/);
      segmentList.forEach(function(segment) {
        if (!segment) {
          return;
        }

        var propValPair = segment.match(/^([^:]+):(.+)$/);
        if (!propValPair) {
          throw new Error('Improperly formatted assign-properties string: ' + propAndPaths);
        }

        var propertyIdentifier = propValPair[1];
        var propertyExpression = propValPair[2];

        var retrievedValue = stringVault.getValue(propertyExpression);

        // Properties starting with a '.' denote direct DOM property access,
        // e.g., '.style.fontSize' maps to `element.style.fontSize`.
        if (propertyIdentifier.startsWith('.')) {
          var accessPath = propertyIdentifier.slice(1).split('.');
          var currentObject = itemNode;
          while (currentObject && accessPath.length > 1) {
            currentObject = currentObject[accessPath.shift()];
          }
          if (currentObject) {
            currentObject[accessPath] = retrievedValue;
            // If innerHTML was modified, re-process its new content for directives.
            if (accessPath[0] === 'innerHTML') {
              renderTree(itemNode, stringVault);
            }
          }
        } else {
          itemNode.setAttribute(propertyIdentifier, retrievedValue);
        }
      });
    }
  }; // End of actionMap object.


  var actionKeys = Object.keys(actionMap);
  var queryFilter = '[' + actionKeys.join('],[') + ']';

  /**
   *  Traverses and processes a given DOM subtree using the provided data source.
   *  @param {HTMLElement} currentRoot The starting point of the DOM subtree.
   *  @param {LoadTimeData} stringVault The data object containing all necessary values.
   */
  function renderTree(currentRoot, stringVault) {
    var foundElements = currentRoot.querySelectorAll(queryFilter);
    for (var elemItem, counter1 = 0; elemItem = foundElements[counter1]; counter1++) {
      for (var counter2 = 0; counter2 < actionKeys.length; counter2++) {
        var actionName = actionKeys[counter2];
        var nodeAttribute = elemItem.getAttribute(actionName);
        if (nodeAttribute !== null) { // Check if attribute exists.
          actionMap[actionName](elemItem, nodeAttribute, stringVault);
        }
      }
    }
  }

  return {
    render: renderTree
  };
}() );