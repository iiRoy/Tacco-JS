/*
 * Widget Framework 3.1
 * (C) 2008-2009, Acme Widgets Inc.
 * support@acmewidgets.com
 *
 * https://acmewidgets.com/terms
 */

Wgt.MarkupAssist = function () {
  var transientTblElem = null;
  var voidElements = /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i;
  var tablePattern = /^table|tbody|tr|td$/i;

  var constructMarkup = function (itemConfig) {
    if (typeof itemConfig == 'string') {
      return itemConfig;
    }
    var markupBuffer = "";
    if (!itemConfig.tag) {
      itemConfig.tag = "div";
    }
    markupBuffer += "<" + itemConfig.tag;
    for (var propKey in itemConfig) {
      // Skip internal properties or functions
      if (propKey == "tag" || propKey == "subItems" || propKey == "childNodes" || propKey == "innerContent" || typeof itemConfig[propKey] == "function") continue;
      if (propKey == "style") {
        var styleDef = itemConfig["style"];
        if (typeof styleDef == "function") {
          styleDef = styleDef.call();
        }
        if (typeof styleDef == "string") {
          markupBuffer += ' style="' + styleDef + '"';
        } else if (typeof styleDef == "object") {
          markupBuffer += ' style="';
          for (var styleKey in styleDef) {
            // Ensure style value is not a function
            if (typeof styleDef[styleKey] != "function") {
              markupBuffer += styleKey + ":" + styleDef[styleKey] + ";";
            }
          }
          markupBuffer += '"';
        }
      } else {
        if (propKey == "classAttr") {
          markupBuffer += ' class="' + itemConfig["classAttr"] + '"';
        } else if (propKey == "forAttr") {
          markupBuffer += ' for="' + itemConfig["forAttr"] + '"';
        } else {
          markupBuffer += " " + propKey + '="' + itemConfig[propKey] + '"';
        }
      }
    }
    if (voidElements.test(itemConfig.tag)) {
      markupBuffer += "/>";
    } else {
      markupBuffer += ">";
      var subItemsArray = itemConfig.subItems || itemConfig.childNodes;
      if (subItemsArray) {
        if (subItemsArray instanceof Array) {
          for (var idx = 0, count = subItemsArray.length; idx < count; idx++) {
            markupBuffer += constructMarkup(subItemsArray[idx], markupBuffer);
          }
        } else {
          markupBuffer += constructMarkup(subItemsArray, markupBuffer);
        }
      }
      if (itemConfig.innerContent) {
        markupBuffer += itemConfig.innerContent;
      }
      markupBuffer += "</" + itemConfig.tag + ">";
    }
    return markupBuffer;
  };

  var formElement = function (elementConfig, parentContainer) {
    var newElement = document.createElement(elementConfig.tag || 'div');
    var canUseSetAttr = newElement.setAttribute ? true : false;
    for (var propName in elementConfig) {
      // Skip non-attribute properties
      if (propName == "tag" || propName == "subItems" || propName == "childNodes" || propName == "innerContent" || propName == "style" || typeof elementConfig[propName] == "function") continue;
      if (propName == "classProp") {
        newElement.className = elementConfig["classProp"];
      } else {
        if (canUseSetAttr) newElement.setAttribute(propName, elementConfig[propName]);
        else newElement[propName] = elementConfig[propName];
      }
    }
    Wgt.MarkupAssist.applyVisualStyles(newElement, elementConfig.style);
    var childConfigs = elementConfig.subItems || elementConfig.childNodes;
    if (childConfigs) {
      if (childConfigs instanceof Array) {
        for (var index = 0, lengthVal = childConfigs.length; index < lengthVal; index++) {
          formElement(childConfigs[index], newElement);
        }
      } else {
        formElement(childConfigs, newElement);
      }
    }
    if (elementConfig.innerContent) {
      newElement.innerHTML = elementConfig.innerContent;
    }
    if (parentContainer) {
      parentContainer.appendChild(newElement);
    }
    return newElement;
  };

  var legacyTableBuild = function (nestingLevel, startMarkup, bodyMarkup, endMarkup) {
    transientTblElem.innerHTML = [startMarkup, bodyMarkup, endMarkup].join('');
    var counter = -1,
      currentElem = transientTblElem;
    while (++counter < nestingLevel) {
      currentElem = currentElem.firstChild;
    }
    return currentElem;
  };

  // Predefined table structure strings
  var tblStart = '<table>',
    tblEnd = '</table>',
    tblBodyStart = tblStart + '<tbody>',
    tblBodyEnd = '</tbody>' + tblEnd,
    tblRowStart = tblBodyStart + '<tr>',
    tblRowEnd = '</tr>' + tblBodyEnd;

  var placeIntoTableStructure = function (elementTag, insertionPoint, targetElement, contentHtml) {
    if (!transientTblElem) {
      transientTblElem = document.createElement('div');
    }
    var generatedNode;
    var referenceNode = null;
    if (elementTag == 'td') {
      // 'td' can only be inserted inside 'tr'
      if (insertionPoint == 'afterbegin' || insertionPoint == 'beforeend') {
        return;
      }
      if (insertionPoint == 'beforebegin') {
        referenceNode = targetElement;
        targetElement = targetElement.parentNode;
      } else {
        referenceNode = targetElement.nextSibling;
        targetElement = targetElement.parentNode;
      }
      generatedNode = legacyTableBuild(4, tblRowStart, contentHtml, tblRowEnd);
    } else if (elementTag == 'tr') {
      if (insertionPoint == 'beforebegin') {
        referenceNode = targetElement;
        targetElement = targetElement.parentNode;
        generatedNode = legacyTableBuild(3, tblBodyStart, contentHtml, tblBodyEnd);
      } else if (insertionPoint == 'afterend') {
        referenceNode = targetElement.nextSibling;
        targetElement = targetElement.parentNode;
        generatedNode = legacyTableBuild(3, tblBodyStart, contentHtml, tblBodyEnd);
      } else {
        // inside tr
        if (insertionPoint == 'afterbegin') {
          referenceNode = targetElement.firstChild;
        }
        generatedNode = legacyTableBuild(4, tblRowStart, contentHtml, tblRowEnd);
      }
    } else if (elementTag == 'tbody') {
      if (insertionPoint == 'beforebegin') {
        referenceNode = targetElement;
        targetElement = targetElement.parentNode;
        generatedNode = legacyTableBuild(2, tblStart, contentHtml, tblEnd);
      } else if (insertionPoint == 'afterend') {
        referenceNode = targetElement.nextSibling;
        targetElement = targetElement.parentNode;
        generatedNode = legacyTableBuild(2, tblStart, contentHtml, tblEnd);
      } else {
        // inside tbody
        if (insertionPoint == 'afterbegin') {
          referenceNode = targetElement.firstChild;
        }
        generatedNode = legacyTableBuild(3, tblBodyStart, contentHtml, tblBodyEnd);
      }
    } else {
      // generic table element
      if (insertionPoint == 'beforebegin' || insertionPoint == 'afterend') {
        return;
      }
      if (insertionPoint == 'afterbegin') {
        referenceNode = targetElement.firstChild;
      }
      generatedNode = legacyTableBuild(2, tblStart, contentHtml, tblEnd);
    }
    targetElement.insertBefore(generatedNode, referenceNode);
    return generatedNode;
  };

  return {

    // Flag to indicate preference for DOM operations over HTML strings
    preferDomOperations: false,

    // Generates HTML markup from an object configuration
    generateMarkup: function (itemConfig) {
      return constructMarkup(itemConfig);
    },

    // Applies CSS styles to a DOM element
    applyVisualStyles: function (targetElem, styleDefinitions) {
      if (styleDefinitions) {
        targetElem = Wgt.fly(targetElem); // Wrap element if necessary
        if (typeof styleDefinitions == "string") {
          // Parse string styles (e.g., "color: red; font-size: 12px;")
          var stylePattern = /\s?([a-z\-]*)\:\s?([^;]*);?/gi;
          var foundMatches;
          while ((foundMatches = stylePattern.exec(styleDefinitions)) != null) {
            targetElem.setStyle(foundMatches[1], foundMatches[2]);
          }
        } else if (typeof styleDefinitions == "object") {
          // Apply object styles (e.g., {color: 'red', fontSize: '12px'})
          for (var singleStyle in styleDefinitions) {
            targetElem.setStyle(singleStyle, styleDefinitions[singleStyle]);
          }
        } else if (typeof styleDefinitions == "function") {
          // Execute function to get styles
          Wgt.MarkupAssist.applyVisualStyles(targetElem, styleDefinitions.call());
        }
      }
    },

    // Inserts HTML content at a specified position relative to an element
    injectHtmlContent: function (positionRef, targetNode, htmlString) {
      positionRef = positionRef.toLowerCase();
      if (targetNode.insertAdjacentHTML) { // Use native method if available
        if (tablePattern.test(targetNode.tagName)) {
          var resultNode;
          if (resultNode = placeIntoTableStructure(targetNode.tagName.toLowerCase(), positionRef, targetNode, htmlString)) {
            return resultNode;
          }
        }
        switch (positionRef) {
          case "beforebegin":
            targetNode.insertAdjacentHTML('BeforeBegin', htmlString);
            return targetNode.previousSibling;
          case "afterbegin":
            targetNode.insertAdjacentHTML('AfterBegin', htmlString);
            return targetNode.firstChild;
          case "beforeend":
            targetNode.insertAdjacentHTML('BeforeEnd', htmlString);
            return targetNode.lastChild;
          case "afterend":
            targetNode.insertAdjacentHTML('AfterEnd', htmlString);
            return targetNode.nextSibling;
        }
        throw 'Invalid insertion point -> "' + positionRef + '"';
      }
      // Fallback for browsers without insertAdjacentHTML
      var domRange = targetNode.ownerDocument.createRange();
      var documentFragment;
      switch (positionRef) {
        case "beforebegin":
          domRange.setStartBefore(targetNode);
          documentFragment = domRange.createContextualFragment(htmlString);
          targetNode.parentNode.insertBefore(documentFragment, targetNode);
          return targetNode.previousSibling;
        case "afterbegin":
          if (targetNode.firstChild) {
            domRange.setStartBefore(targetNode.firstChild);
            documentFragment = domRange.createContextualFragment(htmlString);
            targetNode.insertBefore(documentFragment, targetNode.firstChild);
            return targetNode.firstChild;
          } else {
            targetNode.innerHTML = htmlString;
            return targetNode.firstChild;
          }
        case "beforeend":
          if (targetNode.lastChild) {
            domRange.setStartAfter(targetNode.lastChild);
            documentFragment = domRange.createContextualFragment(htmlString);
            targetNode.appendChild(documentFragment);
            return targetNode.lastChild;
          } else {
            targetNode.innerHTML = htmlString;
            return targetNode.lastChild;
          }
        case "afterend":
          domRange.setStartAfter(targetNode);
          documentFragment = domRange.createContextualFragment(htmlString);
          targetNode.parentNode.insertBefore(documentFragment, targetNode.nextSibling);
          return targetNode.nextSibling;
      }
      throw 'Invalid insertion point -> "' + positionRef + '"';
    },

    // Inserts a new element before the specified reference element
    addBefore: function (containerElement, objectConfig, returnWrapper) {
      return this.performInsertion(containerElement, objectConfig, returnWrapper, "beforeBegin");
    },

    // Inserts a new element after the specified reference element
    addAfter: function (containerElement, objectConfig, returnWrapper) {
      return this.performInsertion(containerElement, objectConfig, returnWrapper, "afterEnd", "nextSibling");
    },

    // Inserts a new element as the first child of the specified container
    addAsFirstChild: function (containerElement, objectConfig, returnWrapper) {
      return this.performInsertion(containerElement, objectConfig, returnWrapper, "afterBegin", "firstChild");
    },

    // Core logic for inserting elements based on configuration
    performInsertion: function (containerElement, objectConfig, returnWrapper, insertionPosition, siblingProperty) {
      containerElement = Wgt.getDom(containerElement);
      var createdNode;
      if (this.preferDomOperations) {
        createdNode = formElement(objectConfig, null);
        (siblingProperty === "firstChild" ? containerElement : containerElement.parentNode).insertBefore(createdNode, siblingProperty ? containerElement[siblingProperty] : containerElement);
      } else {
        var nodeHtml = constructMarkup(objectConfig);
        createdNode = this.injectHtmlContent(insertionPosition, containerElement, nodeHtml);
      }
      return returnWrapper ? Wgt.get(createdNode, true) : createdNode;
    },

    // Appends a new element as the last child of the specified container
    appendToContainer: function (containerElement, objectConfig, returnWrapper) {
      containerElement = Wgt.getDom(containerElement);
      var createdNode;
      if (this.preferDomOperations) {
        createdNode = formElement(objectConfig, null);
        containerElement.appendChild(createdNode);
      } else {
        var nodeHtml = constructMarkup(objectConfig);
        createdNode = this.injectHtmlContent("beforeEnd", containerElement, nodeHtml);
      }
      return returnWrapper ? Wgt.get(createdNode, true) : createdNode;
    },

    // Replaces all content within an element with new content
    replaceContent: function (containerElement, objectConfig, returnWrapper) {
      containerElement = Wgt.getDom(containerElement);
      containerElement.innerHTML = constructMarkup(objectConfig);
      return returnWrapper ? Wgt.get(containerElement.firstChild, true) : containerElement.firstChild;
    },

    // Creates a new Wgt.ContentFormatter instance from an object configuration
    makeTemplate: function (objectConfig) {
      var nodeHtml = constructMarkup(objectConfig);
      return new Wgt.ContentFormatter(nodeHtml);
    }
  };
}();


Wgt.ContentFormatter = function (templateString) {
  var inputArgs = arguments;
  if (templateString instanceof Array) {
    templateString = templateString.join("");
  } else if (inputArgs.length > 1) {
    var stringBuffer = [];
    for (var counter = 0, totalLength = inputArgs.length; counter < totalLength; counter++) {
      if (typeof inputArgs[counter] == 'object') {
        Wgt.apply(this, inputArgs[counter]);
      } else {
        stringBuffer[stringBuffer.length] = inputArgs[counter];
      }
    }
    templateString = stringBuffer.join('');
  }

  this.templateString = templateString;
  if (this.isPrecompiled) {
    this.precompile();
  }
};
Wgt.ContentFormatter.prototype = {

  // Applies the template to a set of data values
  renderContent: function (dataValues) {
    if (this.isPrecompiled) {
      return this.isPrecompiled(dataValues);
    }
    var enableFormatting = this.omitFormatting !== true;
    var formatManager = Wgt.util.Format,
      currentFormatter = this;
    var replaceFunction = function (match, fieldName, formatSpec, formatArgs) {
      if (formatSpec && enableFormatting) {
        if (formatSpec.substr(0, 5) == "this.") {
          return currentFormatter.invokeMethod(formatSpec.substr(5), dataValues[fieldName], dataValues);
        } else {
          if (formatArgs) {
            // Arguments are comma-separated strings, need to parse them
            var argPattern = /^\s*['"](.*)["']\s*$/;
            formatArgs = formatArgs.split(',');
            for (var argIdx = 0, len = formatArgs.length; argIdx < len; argIdx++) {
              formatArgs[argIdx] = formatArgs[argIdx].replace(argPattern, "$1");
            }
            formatArgs = [dataValues[fieldName]].concat(formatArgs);
          } else {
            formatArgs = [dataValues[fieldName]];
          }
          return formatManager[formatSpec].apply(formatManager, formatArgs);
        }
      } else {
        return dataValues[fieldName] !== undefined ? dataValues[fieldName] : "";
      }
    };
    return this.templateString.replace(this.placeholderPattern, replaceFunction);
  },


  // Sets a new HTML string for the template and optionally compiles it
  setContent: function (newHtml, shouldCompile) {
    this.templateString = newHtml;
    this.isPrecompiled = null;
    if (shouldCompile) {
      this.precompile();
    }
    return this;
  },


  // Flag to disable automatic formatting
  omitFormatting: false,


  // Regular expression to find placeholders in the template string
  placeholderPattern: /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,


  // Compiles the template into an executable function for faster rendering
  precompile: function () {
    var formatUtil = Wgt.util.Format;
    var applyFormat = this.omitFormatting !== true;
    var concatenator = Wgt.isGecko ? "+" : ",";
    var compileFunction = function (matchStr, valueName, formatName, formatArguments) {
      if (formatName && applyFormat) {
        formatArguments = formatArguments ? ',' + formatArguments : "";
        if (formatName.substr(0, 5) != "this.") {
          formatName = "formatUtil." + formatName + '(';
        } else {
          formatName = 'this.invokeMethod("' + formatName.substr(5) + '", ';
          formatArguments = ", values";
        }
      } else {
        formatArguments = '';
        formatName = "(values['" + valueName + "'] == undefined ? '' : ";
      }
      return "'" + concatenator + formatName + "values['" + valueName + "']" + formatArguments + ")" + concatenator + "'";
    };
    var functionBody;

    if (Wgt.isGecko) { // Optimize for Firefox
      functionBody = "this.isPrecompiled = function(values){ return '" +
        this.templateString.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.placeholderPattern, compileFunction) +
        "';};";
    } else { // Generic compilation for other browsers
      functionBody = ["this.isPrecompiled = function(values){ return ['"];
      functionBody.push(this.templateString.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.placeholderPattern, compileFunction));
      functionBody.push("'].join('');};");
      functionBody = functionBody.join('');
    }
    eval(functionBody); // Execute the generated function string
    return this;
  },


  // Invokes a method on the template instance during rendering
  invokeMethod: function (methodName, currentValue, fullDataSet) {
    return this[methodName](currentValue, fullDataSet);
  },


  // Inserts rendered content as the first child of an element
  prependContent: function (targetElem, dataObject, returnWrapped) {
    return this.executeInsertion('afterBegin', targetElem, dataObject, returnWrapped);
  },

  // Inserts rendered content before an element
  insertPrior: function (targetElem, dataObject, returnWrapped) {
    return this.executeInsertion('beforeBegin', targetElem, dataObject, returnWrapped);
  },

  // Inserts rendered content after an element
  insertSubsequent: function (targetElem, dataObject, returnWrapped) {
    return this.executeInsertion('afterEnd', targetElem, dataObject, returnWrapped);
  },


  // Appends rendered content as the last child of an element
  appendToElement: function (targetElem, dataObject, returnWrapped) {
    return this.executeInsertion('beforeEnd', targetElem, dataObject, returnWrapped);
  },

  // Generic method for inserting rendered template content
  executeInsertion: function (position, targetElem, dataObject, returnWrapped) {
    targetElem = Wgt.getDom(targetElem); // Get raw DOM element
    var newlyInsertedNode = Wgt.MarkupAssist.injectHtmlContent(position, targetElem, this.renderContent(dataObject));
    return returnWrapped ? Wgt.get(newlyInsertedNode, true) : newlyInsertedNode;
  },


  // Replaces the entire content of an element with rendered template output
  replaceEntireContent: function (targetElem, dataObject, returnWrapped) {
    targetElem = Wgt.getDom(targetElem);
    targetElem.innerHTML = this.renderContent(dataObject);
    return returnWrapped ? Wgt.get(targetElem.firstChild, true) : targetElem.firstChild;
  }
};

// Create an alias for renderContent method
Wgt.ContentFormatter.prototype.render = Wgt.ContentFormatter.prototype.renderContent;


// Assign the ContentFormatter as a nested property of MarkupAssist
Wgt.MarkupAssist.FormatContainer = Wgt.ContentFormatter;


// Static method to create a template from an existing DOM element
Wgt.ContentFormatter.createFromElement = function (sourceElem, templateConfig) {
  sourceElem = Wgt.getDom(sourceElem);
  // Use element's value (for input fields) or innerHTML (for containers)
  return new Wgt.ContentFormatter(sourceElem.value || sourceElem.innerHTML, templateConfig || '');
};


Wgt.ElementSelector = function () {
  // Placeholder for ElementSelector functionality
};