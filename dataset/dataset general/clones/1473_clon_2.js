var TemplateEngine = function() {
  const patternStore = {};
  var ContentProcessor = function() {};

  ContentProcessor.prototype = {
    openDelimiter: "{{",
    closeDelimiter: "}}",
    directives: {},
    outputCollection: [],
    supportedDirectives: {
      "IMPLICIT-ITERATOR": true
    },
    dataContext: {},

    processTemplate: function(inputContent, currentData, fragmentLibrary, recursiveCall) {
      if (!recursiveCall) {
        this.dataContext = currentData;
        this.outputCollection = [];
      }

      if (!this.containsMarker("", inputContent)) {
        if (recursiveCall) {
          return inputContent;
        } else {
          this.emitLine(inputContent);
          return;
        }
      }

      inputContent = this.handleDirectives(inputContent);

      var processedHtml = this.processSection(inputContent, currentData, fragmentLibrary);

      if (processedHtml === false) {
        processedHtml = this.processTags(inputContent, currentData, fragmentLibrary, recursiveCall);
      }

      if (recursiveCall) {
        return processedHtml;
      } else {
        this.emitChunks(processedHtml);
      }
    },

    emitLine: function(lineSegment) {
      if (lineSegment !== "") {
        this.outputCollection.push(lineSegment);
      }
    },

    emitChunks: function(fullText) {
      if (fullText) {
        const lineArray = fullText.split("\n");
        for (let idx = 0; idx < lineArray.length; idx++) {
          this.emitLine(lineArray[idx]);
        }
      }
    },

    handleDirectives: function(inputContent) {
      if (!this.containsMarker("%", inputContent)) {
        return inputContent;
      }

      const selfRef = this;
      const pattern = this.retrieveCachedPattern("handleDirectives", function(openDelim, closeDelim) {
        return new RegExp(openDelim + "%([\\w-]+) ?([\\w]+=[\\w]+)?" + closeDelim, "g");
      });

      return inputContent.replace(pattern, function(fullMatch, directiveName, directiveOptions) {
        if (!selfRef.supportedDirectives[directiveName]) {
          throw ({
            message:
              "This template processor does not recognize the '" +
              directiveName + "' directive."
          });
        }
        selfRef.directives[directiveName] = {};
        if (directiveOptions) {
          const optionParts = directiveOptions.split("=");
          selfRef.directives[directiveName][optionParts[0]] = optionParts[1];
        }
        return "";
      });
    },

    processFragment: function(itemName, currentData, fragmentLibrary) {
      itemName = this.stripWhitespace(itemName);
      if (!fragmentLibrary || fragmentLibrary[itemName] === undefined) {
        throw ({
          message: "missingFragment '" + itemName + "'"
        });
      }
      if (typeof (currentData[itemName]) != "object") {
        return this.processTemplate(fragmentLibrary[itemName], currentData, fragmentLibrary, true);
      }
      return this.processTemplate(fragmentLibrary[itemName], currentData[itemName], fragmentLibrary, true);
    },

    processSection: function(inputContent, currentData, fragmentLibrary) {
      if (!this.containsMarker("#", inputContent) && !this.containsMarker("^", inputContent)) {
        return false;
      }

      const selfRef = this;

      const pattern = this.retrieveCachedPattern("processSection", function(openDelim, closeDelim) {
        return new RegExp(
          "^([\\s\\S]*?)" +
          openDelim +
          "(\\^|\\#)\\s*(.+)\\s*" +
          closeDelim +
          "\n*([\\s\\S]*?)" +
          openDelim +
          "\\/\\s*\\3\\s*" +
          closeDelim +
          "\\s*([\\s\\S]*)$",
          "g"
        );
      });

      return inputContent.replace(pattern, function(fullMatch, prefixContent, sectionType, itemName, innerContent, suffixContent) {
        const processedPrefix = prefixContent ? selfRef.processTags(prefixContent, currentData, fragmentLibrary, true) : "";

        const processedSuffix = suffixContent ? selfRef.processTemplate(suffixContent, currentData, fragmentLibrary, true) : "";

        let processedInner;

        const dataValue = selfRef.locateValue(itemName, currentData);

        if (sectionType === "^") {
          if (!dataValue || (selfRef.isArrayLike(dataValue) && dataValue.length === 0)) {
            processedInner = selfRef.processTemplate(innerContent, currentData, fragmentLibrary, true);
          } else {
            processedInner = "";
          }
        } else if (sectionType === "#") {
          if (selfRef.isArrayLike(dataValue)) {
            processedInner = selfRef.iterateAndTransform(dataValue, function(dataItem) {
              return selfRef.processTemplate(innerContent, selfRef.establishContext(dataItem), fragmentLibrary, true);
            }).join("");
          } else if (selfRef.isObjectLike(dataValue)) {
            processedInner = selfRef.processTemplate(innerContent, selfRef.establishContext(dataValue),
              fragmentLibrary, true);
          } else if (typeof dataValue === "function") {
            processedInner = dataValue.call(currentData, innerContent, function(textToProcess) {
              return selfRef.processTemplate(textToProcess, currentData, fragmentLibrary, true);
            });
          } else if (dataValue) {
            processedInner = selfRef.processTemplate(innerContent, currentData, fragmentLibrary, true);
          } else {
            processedInner = "";
          }
        }

        return processedPrefix + processedInner + processedSuffix;
      });
    },

    processTags: function(inputContent, currentData, fragmentLibrary, recursiveCall) {
      const selfRef = this;

      let createTagPattern = function() {
        return selfRef.retrieveCachedPattern("processTags", function(openDelim, closeDelim) {
          return new RegExp(openDelim + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" + closeDelim + "+", "g");
        });
      };

      let tagPattern = createTagPattern();
      const tagReplacer = function(fullMatch, tagOperator, itemName) {
        switch (tagOperator) {
          case "!":
            return "";
          case "=":
            selfRef.setBoundaries(itemName);
            tagPattern = createTagPattern();
            return "";
          case ">":
            return selfRef.processFragment(itemName, currentData, fragmentLibrary);
          case "{":
            return selfRef.locateValue(itemName, currentData);
          default:
            return selfRef.sanitizeString(selfRef.locateValue(itemName, currentData));
        }
      };
      const contentLines = inputContent.split("\n");
      for (let idx = 0; idx < contentLines.length; idx++) {
        contentLines[idx] = contentLines[idx].replace(tagPattern, tagReplacer, this);
        if (!recursiveCall) {
          this.emitLine(contentLines[idx]);
        }
      }

      if (recursiveCall) {
        return contentLines.join("\n");
      }
    },

    setBoundaries: function(delimiterString) {
      const boundaryParts = delimiterString.split(" ");
      this.openDelimiter = this.escapePatternChars(boundaryParts[0]);
      this.closeDelimiter = this.escapePatternChars(boundaryParts[1]);
    },

    escapePatternChars: function(rawText) {
      if (!arguments.callee.specialCharPattern) {
        const specialCharacters = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.specialCharPattern = new RegExp(
          '(\\' + specialCharacters.join('|\\') + ')', 'g'
        );
      }
      return rawText.replace(arguments.callee.specialCharPattern, '\\$1');
    },

    locateValue: function(itemName, currentData) {
      itemName = this.stripWhitespace(itemName);

      function isValuePresent(val) {
        return val === false || val === 0 || val;
      }

      let retrievedValue;

      if (itemName.match(/([a-z_]+)\./ig)) {
        let nestedValue = this.traverseContext(itemName, currentData);
        if (isValuePresent(nestedValue)) {
          retrievedValue = nestedValue;
        }
      } else {
        if (isValuePresent(currentData[itemName])) {
          retrievedValue = currentData[itemName];
        } else if (isValuePresent(this.dataContext[itemName])) {
          retrievedValue = this.dataContext[itemName];
        }
      }

      if (typeof retrievedValue === "function") {
        return retrievedValue.apply(currentData);
      }
      if (retrievedValue !== undefined) {
        return retrievedValue;
      }
      return "";
    },

    traverseContext: function(itemName, currentData) {
      const propertyPath = itemName.split('.');
      let currentValueContext = (currentData[propertyPath[0]] != undefined) ? currentData : this.dataContext;
      let dataValue = currentValueContext[propertyPath.shift()];
      while (dataValue != undefined && propertyPath.length > 0) {
        currentValueContext = dataValue;
        dataValue = dataValue[propertyPath.shift()];
      }
      if (typeof dataValue === "function") {
        return dataValue.apply(currentValueContext);
      }
      return dataValue;
    },

    containsMarker: function(markerChar, sourceString) {
      return sourceString.indexOf(this.openDelimiter + markerChar) != -1;
    },

    sanitizeString: function(inputStr) {
      inputStr = String(inputStr === null ? "" : inputStr);
      return inputStr.replace(/&(?!\w+;)|["'<>\\]/g, function(charMatch) {
        switch (charMatch) {
          case "&":
            return "&amp;";
          case '"':
            return '&quot;';
          case "'":
            return '&#39;';
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          default:
            return charMatch;
        }
      });
    },

    establishContext: function(itemContext) {
      if (this.isObjectLike(itemContext)) {
        return itemContext;
      } else {
        let loopVar = ".";
        if (this.directives["IMPLICIT-ITERATOR"]) {
          loopVar = this.directives["IMPLICIT-ITERATOR"].iterator;
        }
        const newContext = {};
        newContext[loopVar] = itemContext;
        return newContext;
      }
    },

    isObjectLike: function(inputArg) {
      return inputArg && typeof inputArg == "object";
    },

    isArrayLike: function(inputArg) {
      return Object.prototype.toString.call(inputArg) === '[object Array]';
    },

    stripWhitespace: function(inputStr) {
      return inputStr.replace(/^\s*|\s*$/g, "");
    },

    iterateAndTransform: function(targetArray, callbackFn) {
      if (typeof targetArray.map == "function") {
        return targetArray.map(callbackFn);
      } else {
        const resultList = [];
        const listLength = targetArray.length;
        for (let idx = 0; idx < listLength; idx++) {
          resultList.push(callbackFn(targetArray[idx]));
        }
        return resultList;
      }
    },

    retrieveCachedPattern: function(patternKey, patternGenerator) {
      let byOpenDelim = patternStore[this.openDelimiter];
      if (!byOpenDelim) {
        byOpenDelim = patternStore[this.openDelimiter] = {};
      }

      let byCloseDelim = byOpenDelim[this.closeDelimiter];
      if (!byCloseDelim) {
        byCloseDelim = byOpenDelim[this.closeDelimiter] = {};
      }

      let compiledPattern = byCloseDelim[patternKey];
      if (!compiledPattern) {
        compiledPattern = byCloseDelim[patternKey] = patternGenerator(this.openDelimiter, this.closeDelimiter);
      }

      return compiledPattern;
    }
  };

  return ({
    libraryName: "text-templater.js",
    version: "0.4.0-release",

    produceHtml: function(inputContent, inputView, fragmentLibrary, outputHandler) {
      const processorInstance = new ContentProcessor();
      if (outputHandler) {
        processorInstance.emitLine = outputHandler;
      }
      processorInstance.processTemplate(inputContent, inputView || {}, fragmentLibrary);
      if (!outputHandler) {
        return processorInstance.outputCollection.join("\n");
      }
    }
  });
}();