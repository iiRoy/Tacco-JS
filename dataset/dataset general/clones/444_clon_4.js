(function() {
  "use strict";

  // New global container for visualization tools
  const DataVisualizer = {};
  window.DataVisualizer = DataVisualizer;

  // New URI pattern (replaces Hammer.Util.urlPattern)
  const uriIdentifierPattern = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*/;

  // New type description function (replaces Hammer.Util.typeString)
  function describeStructuralType(valueElement) {
    if (Array.isArray(valueElement)) {
      return "[]";
    } else if (typeof valueElement === 'object' && valueElement !== null) {
      return "{}";
    }
    return "";
  }

  // Element creation helpers (replaces Hammer.Util.yamlRoots and .clone() calls)
  function createVisualSpan(classNameForElement, contentForElement) {
    const visualElement = document.createElement('span');
    visualElement.className = classNameForElement;
    if (contentForElement !== undefined) {
      visualElement.textContent = contentForElement;
    }
    return visualElement;
  }

  function createVisualList(listTagName, classNameForList, listStartingValue) {
    const listElement = document.createElement(listTagName);
    listElement.className = classNameForList;
    if (listStartingValue !== undefined) {
      listElement.setAttribute('start', String(listStartingValue));
    }
    return listElement;
  }

  function createLinkElement(targetHyperlink, displayContent, embeddedPicture) {
    const link = document.createElement('a');
    link.setAttribute('href', targetHyperlink);
    if (embeddedPicture) {
      link.appendChild(embeddedPicture);
    } else if (displayContent !== undefined) {
      link.textContent = displayContent;
    }
    return link;
  }

  function createPictureElement(sourceOfPicture) {
    const pic = document.createElement('img');
    pic.setAttribute('src', sourceOfPicture);
    return pic;
  }

  // The core rendering logic (replaces Hammer.Util.printYaml)
  DataVisualizer.displayStructuredData = function(sourceEntity) {

    const typeHandlers = {
      "string": (currentValue) => {
        if (uriIdentifierPattern.test(currentValue)) {
          if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(currentValue)) {
            return createLinkElement(currentValue, null, createPictureElement(currentValue));
          } else {
            return createLinkElement(currentValue, currentValue);
          }
        } else {
          return createVisualSpan('str-repr', `"${currentValue}"`);
        }
      },
      "number": (currentValue) => {
        return createVisualSpan('num-val', String(currentValue));
      },
      "boolean": (currentValue) => {
        return createVisualSpan(`bool-flag-${currentValue ? 'true' : 'false'}`, String(currentValue));
      },
      "object": (currentValue) => {
        if (currentValue === null) {
          return createVisualSpan('null-lit', 'null');
        } else if (Array.isArray(currentValue)) {
          const orderedListContainer = createVisualList('ol', 'list-cont', 0);
          currentValue.forEach(entry => {
            const listItemContainer = createVisualList('li', 'list-item');
            listItemContainer.appendChild(DataVisualizer.displayStructuredData(entry));
            orderedListContainer.appendChild(listItemContainer);
          });
          return orderedListContainer;
        } else { // Plain object
          const unorderedListContainer = createVisualList('ul', 'dict-struct');
          Object.entries(currentValue).forEach(([entryKey, entryValue]) => {
            const listItemContainer = createVisualList('li', 'dict-entry');
            const keyDisplay = createVisualSpan('dict-key');
            const valueStructuralDescription = describeStructuralType(entryValue);

            if (valueStructuralDescription) {
              keyDisplay.classList.add("collapsible");
              keyDisplay.classList.add("opened");
              keyDisplay.textContent = `▼ ${entryKey}${valueStructuralDescription}`;
            } else {
              keyDisplay.textContent = `${entryKey}: `;
            }

            listItemContainer.appendChild(keyDisplay);
            listItemContainer.appendChild(DataVisualizer.displayStructuredData(entryValue));
            unorderedListContainer.appendChild(listItemContainer);
          });
          return unorderedListContainer;
        }
      }
    };

    const entityType = typeof sourceEntity;
    const handler = typeHandlers[entityType];

    if (handler) {
      return handler(sourceEntity);
    } else {
      console.error("Unable to represent entity", sourceEntity);
      return document.createTextNode(`[${entityType}]`);
    }
  };
})();

// The following parts are intentionally omitted as they constitute separate, distinct functionalities
// not directly related to the 'printYaml' module, and cloning them would require a full application rewrite
// that goes beyond demonstrating a Type IV clone for a specific, complex utility.
//
// CodeMirror.registerHelper("hint", "elasticsearch", ...);
// CodeMirror.commands.autocomplete = function(cm) { ... };
// Hammer.eventBus = {}; _.extend(Hammer.eventBus, Backbone.Events);
// Hammer.Util.autoTextArea = function (ta) { ... };
// Hammer.Index = Backbone.Model.extend({});
// Hammer.Indexes = Backbone.Collection.extend({ ... });
// Hammer.Request = Backbone.Model.extend({ ... });
// Hammer.RequestHistory = Backbone.Collection.extend({ ... });
// ko.bindingHandlers.codemirror = { ... };
// ko.bindingHandlers.autoTextArea = { ... };
// Hammer.IndexVM = function (index) { ... };
// Hammer.IndexesVM = function(indexes) { ... };
// Hammer.ClearHistoryVM = function () { ... };
// Hammer.RequestBaseVM = function (request) { ... };