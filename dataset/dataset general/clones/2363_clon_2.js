var spark = {};

function fetchUniverseObject() {
  // Retrieve the global 'spark' object, ensuring 'this' refers to the global scope.
  return (function() {
    return this.spark;
  }).call(null);
}

(function(spark) {

  // A simple object to store compiled templates.
  spark.templateStore = {};

  // Method to register a template by its name.
  spark.registerTemplate = function(templateName, compiledTemplate) {
    if (!templateName) return; // Do nothing if no name is provided.
    spark.templateStore[templateName] = compiledTemplate;
  };

  // Renders a template and delivers the output via a callback.
  spark.composeContent = function(templateName, dataContext, outputCallback) {
    // Create a new placeholder with the output callback.
    var outputSegment = new ContentPlaceholder(outputCallback).currentOutputChunk;
    // Load the template, process it, and signal completion.
    spark.loadTemplate(templateName, outputSegment, ExecutionScope.wrapData(dataContext)).finishProcessing();
  };

  // Streams the output of a template.
  spark.streamContent = function(templateName, dataContext) {
    var contentStream = new OutputDataStream();
    // Schedule the template loading to happen in the next event loop tick.
    spark.deferExecution(function() {
      spark.loadTemplate(templateName, contentStream.currentOutputChunk, ExecutionScope.wrapData(dataContext)).finishProcessing();
    });
    return contentStream;
  };

  // Compiles and renders a template from its source string.
  spark.composeFromSource = function(sourceString, dataContext, outputCallback) {
    return spark.createRenderFunction(sourceString)(dataContext, outputCallback);
  };

  // Generates a render function from a template source.
  spark.createRenderFunction = function(sourceString, templateName) {
    // Load the compiled template into the system.
    var templateExecutor = spark.loadCompiledSource(spark.compileTemplate(sourceString, templateName));
    return function(dataContext, outputCallback) {
      // Determine if rendering to a placeholder (for callback) or a stream.
      var primaryOutput = outputCallback ? new ContentPlaceholder(outputCallback) : new OutputDataStream();
      // Defer the actual template execution.
      spark.deferExecution(function() {
        templateExecutor(primaryOutput.currentOutputChunk, ExecutionScope.wrapData(dataContext)).finishProcessing();
      });
      return primaryOutput;
    }
  };

  // Loads a template by name, either from cache or by fetching it.
  spark.loadTemplate = function(templateName, currentChunk, dataContext) {
    var cachedTemplate = spark.templateStore[templateName];
    if (cachedTemplate) {
      return cachedTemplate(currentChunk, dataContext);
    } else {
      // If an 'onLoad' handler is available, use it to fetch the template.
      if (spark.onTemplateLoad) {
        return currentChunk.transformChunk(function(mappedChunk) {
          spark.onTemplateLoad(templateName, function(retrievalError, templateSource) {
            if (retrievalError) return mappedChunk.indicateError(retrievalError);
            // If not cached after load, compile and store it.
            if (!spark.templateStore[templateName]) spark.loadCompiledSource(spark.compileTemplate(templateSource, templateName));
            spark.templateStore[templateName](mappedChunk, dataContext).finishProcessing();
          });
        });
      }
      // If no template found and no loader, report an error.
      return currentChunk.indicateError(new Error("Template Not Found: " + templateName));
    }
  };

  // Evaluates and loads a compiled template source.
  spark.loadCompiledSource = function(compiledSource, sourcePath) {
    return eval(compiledSource);
  };

  // Provides a utility to check if a variable is an array.
  if (Array.isArray) {
    spark.isCollection = Array.isArray;
  } else {
    spark.isCollection = function(testCollection) {
      return Object.prototype.toString.call(testCollection) == "[object Array]";
    };
  }

  // Determines the most efficient way to defer execution.
  spark.deferExecution = (function() {
    if (typeof process !== "undefined" && process.nextTick) { // Check for Node.js environment
      return process.nextTick;
    } else {
      return function(deferredFunction) {
        setTimeout(deferredFunction, 0); // Fallback to setTimeout for browsers
      }
    }
  })();

  // Checks if a value is considered "empty" in this context.
  spark.isVacant = function(testValue) {
    if (spark.isCollection(testValue) && !testValue.length) return true; // Empty array is vacant.
    if (testValue === 0) return false; // Zero is explicitly not vacant.
    return (!testValue); // Generic check for falsy values.
  };

  // Applies a series of filters to a string.
  spark.applyStringProcessors = function(inputString, autoProcessor, processorList) {
    if (processorList) {
      for (var pIdx = 0, pLen = processorList.length; pIdx < pLen; pIdx++) {
        var processorIdentifier = processorList[pIdx];
        if (processorIdentifier === "strip") { // 's' in original code, implies no auto-escaping
          autoProcessor = null;
        } else {
          inputString = spark.stringProcessors[processorIdentifier](inputString);
        }
      }
    }
    if (autoProcessor) {
      inputString = spark.stringProcessors[autoProcessor](inputString);
    }
    return inputString;
  };

  // Collection of built-in string processing functions.
  spark.stringProcessors = {
    html: function(val) { return spark.escapeHtmlEntities(val); }, // HTML escaping
    js: function(val) { return spark.escapeJavascript(val); },     // JavaScript escaping
    uri: encodeURI,                                             // URI encoding
    uriComp: encodeURIComponent,                                // URI component encoding
    jsonStr: function(val) { if (!JSON) { return val; } return JSON.stringify(val); }, // JSON stringify
    jsonParse: function(val) { if (!JSON) { return val; } return JSON.parse(val); }   // JSON parse
  };

  // Represents the data context for template rendering.
  function ExecutionScope(contextStack, globalData, blockRegions) {
    this.contextStack = contextStack;
    this.globalData = globalData;
    this.blockRegions = blockRegions;
  }

  // Creates the initial, base execution scope.
  spark.createBaseScope = function(globalData) {
    return new ExecutionScope(new ContextStack(), globalData);
  };

  // Ensures a given context is an ExecutionScope instance.
  ExecutionScope.wrapData = function(incomingContext) {
    if (incomingContext instanceof ExecutionScope) {
      return incomingContext;
    }
    return new ExecutionScope(new ContextStack(incomingContext));
  };

  // Retrieves a value from the current scope chain.
  ExecutionScope.prototype.retrieveValue = function(keyName) {
    var currentStack = this.contextStack,
      foundValue;

    while (currentStack) {
      if (currentStack.isObjectContainer) {
        foundValue = currentStack.currentHead[keyName];
        if (!(foundValue === undefined)) { // Check for explicit undefined
          return foundValue;
        }
      }
      currentStack = currentStack.previousStack;
    }
    // Fallback to global data if not found in stack.
    return this.globalData ? this.globalData[keyName] : undefined;
  };

  // Traverses a path within the current context.
  ExecutionScope.prototype.navigatePath = function(currentElement, pathSegments) {
    var currentStack = this.contextStack,
      segmentCount = pathSegments.length;

    if (currentElement && segmentCount === 0) return currentStack.currentHead;
    if (!currentStack.isObjectContainer) return undefined;
    currentStack = currentStack.currentHead;
    var segIdx = 0;
    while (currentStack && segIdx < segmentCount) {
      currentStack = currentStack[pathSegments[segIdx]];
      segIdx++;
    }
    return currentStack;
  };

  // Pushes a new data object onto the context stack.
  ExecutionScope.prototype.pushData = function(newHead, itemIndex, totalItems) {
    if (newHead) {
      // Add loop metadata for block sections
      newHead['$index'] = itemIndex;
      // Add loop size for block sections
      newHead['$total'] = totalItems;
    }
    return new ExecutionScope(new ContextStack(newHead, this.contextStack, itemIndex, totalItems), this.globalData, this.blockRegions);
  };

  // Re-establishes the base of the context stack.
  ExecutionScope.prototype.rebaseContext = function(newHead) {
    return new ExecutionScope(new ContextStack(newHead), this.globalData, this.blockRegions);
  };

  // Returns the current data object at the top of the stack.
  ExecutionScope.prototype.getActiveData = function() {
    return this.contextStack.currentHead;
  };

  // Retrieves a block (partial template) from the current scope.
  ExecutionScope.prototype.getRegionBlock = function(blockKey) {
    var regionsArray = this.blockRegions;

    if (!regionsArray) return;
    var regionLength = regionsArray.length,
      blockFunction;
    while (regionLength--) {
      blockFunction = regionsArray[regionLength][blockKey];
      if (blockFunction) return blockFunction;
    }
  };

  // Modifies the block regions array for a new scope.
  ExecutionScope.prototype.alterRegions = function(localBlocks) {
    var regionsArray = this.blockRegions;

    if (localBlocks) {
      if (!regionsArray) {
        var updatedRegions = [localBlocks];
      } else {
        var updatedRegions = regionsArray.concat([localBlocks]);
      }
      return new ExecutionScope(this.contextStack, this.globalData, updatedRegions);
    }
    return this;
  };

  // Represents a segment in the context stack.
  function ContextStack(currentHead, previousStack, itemIndex, totalItems) {
    this.previousStack = previousStack;
    this.isObjectContainer = !spark.isCollection(currentHead) && currentHead && typeof currentHead === "object";
    this.currentHead = currentHead;
    this.itemIndex = itemIndex;
    this.totalItems = totalItems;
  }

  // A temporary buffer for capturing output, used with callbacks.
  function ContentPlaceholder(outputCallback) {
    this.currentOutputChunk = new OutputChunk(this);
    this.outputCallback = outputCallback;
    this.bufferedOutput = '';
  }

  // Drains the buffered output when ready.
  ContentPlaceholder.prototype.drainOutput = function() {
    var chunkPointer = this.currentOutputChunk;

    while (chunkPointer) {
      if (chunkPointer.isReadyToFlush) {
        this.bufferedOutput += chunkPointer.chunkContent;
      } else if (chunkPointer.processingError) {
        this.outputCallback(chunkPointer.processingError);
        this.drainOutput = function() {}; // Prevent further operations on error
        return;
      } else {
        return; // Not all chunks are ready yet.
      }
      chunkPointer = chunkPointer.nextOutputChunk;
      this.currentOutputChunk = chunkPointer;
    }
    this.outputCallback(null, this.bufferedOutput); // Final callback with accumulated output.
  };

  // A stream-like object for continuous output.
  function OutputDataStream() {
    this.currentOutputChunk = new OutputChunk(this);
  }

  // Drains the output stream, emitting events.
  OutputDataStream.prototype.drainOutput = function() {
    var chunkPointer = this.currentOutputChunk;

    while (chunkPointer) {
      if (chunkPointer.isReadyToFlush) {
        this.emitEvent('data', chunkPointer.chunkContent);
      } else if (chunkPointer.processingError) {
        this.emitEvent('error', chunkPointer.processingError);
        this.drainOutput = function() {}; // Prevent further operations on error
        return;
      } else {
        return; // Wait for the next chunk to be ready.
      }
      chunkPointer = chunkPointer.nextOutputChunk;
      this.currentOutputChunk = chunkPointer;
    }
    this.emitEvent('end'); // Signal end of stream.
  };

  // Dispatches an event with associated data.
  OutputDataStream.prototype.emitEvent = function(eventType, eventPayload) {
    var registeredHandlers = this.eventHandlers;

    if (registeredHandlers && registeredHandlers[eventType]) {
      registeredHandlers[eventType](eventPayload);
    }
  };

  // Subscribes a handler to an event type.
  OutputDataStream.prototype.onEvent = function(eventType, handlerFunction) {
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    this.eventHandlers[eventType] = handlerFunction;
    return this;
  };

  // Represents a segment of output data.
  function OutputChunk(rootStream, nextChunk, contentModifiers) {
    this.rootStream = rootStream;
    this.nextChunk = nextChunk;
    this.chunkContent = '';
    this.isReadyToFlush = false;
    this.contentModifiers = contentModifiers;
  }

  // Appends data to the current chunk, applying modifiers.
  OutputChunk.prototype.appendData = function(newData) {
    var modifiers = this.contentModifiers;

    if (modifiers) {
      newData = modifiers.applyModifiers(newData);
    }
    this.chunkContent += newData;
    return this;
  };

  // Marks the chunk as finished and triggers flushing.
  OutputChunk.prototype.finishProcessing = function(finalData) {
    if (finalData) {
      this.appendData(finalData);
    }
    this.isReadyToFlush = true;
    this.rootStream.drainOutput(); // Notify the root to try draining.
    return this;
  };

  // Creates a new chunk for asynchronous operations.
  OutputChunk.prototype.transformChunk = function(processingCallback) {
    var currentPtr = new OutputChunk(this.rootStream, this.nextChunk, this.contentModifiers),
      newBranch = new OutputChunk(this.rootStream, currentPtr, this.contentModifiers);

    this.nextChunk = newBranch;
    this.isReadyToFlush = true;
    processingCallback(newBranch);
    return currentPtr;
  };

  // Adds a content modifier to the chunk's stack.
  OutputChunk.prototype.addModifier = function(newModifier) {
    var modifiers = this.contentModifiers;

    if (modifiers) {
      this.contentModifiers = modifiers.pushModifier(newModifier);
    } else {
      this.contentModifiers = new ContentModifierStack(newModifier);
    }
    return this;
  };

  // Removes the top content modifier from the chunk's stack.
  OutputChunk.prototype.removeModifier = function() {
    this.contentModifiers = this.contentModifiers.previousModifier;
    return this;
  };

  // Renders a body function with the current chunk and context.
  OutputChunk.prototype.processBody = function(bodyFunction, dataContext) {
    return bodyFunction(this, dataContext);
  };

  // Resolves and outputs a reference (variable, function, etc.).
  OutputChunk.prototype.resolveAndOutput = function(referencedElement, dataContext, autoEscape, filterList) {
    if (typeof referencedElement === "function") {
      // If it's a function, execute it to get the actual value or chunk.
      referencedElement = referencedElement(this, dataContext, null, { auto: autoEscape, filters: filterList });
      if (referencedElement instanceof OutputChunk) {
        return referencedElement; // If it returns a chunk, pass it along.
      }
    }
    if (!spark.isVacant(referencedElement)) {
      // If the element is not empty, process and append its string representation.
      return this.appendData(spark.applyStringProcessors(referencedElement, autoEscape, filterList));
    } else {
      return this; // Otherwise, return the current chunk unchanged.
    }
  };

  // Renders a section, handling arrays, booleans, and objects.
  OutputChunk.prototype.renderSectionBlock = function(sectionElement, dataContext, blockBodies, sectionParameters) {
    if (typeof sectionElement === "function") {
      sectionElement = sectionElement(this, dataContext, blockBodies, sectionParameters);
      if (sectionElement instanceof OutputChunk) {
        return sectionElement;
      }
    }

    var mainBodyBlock = blockBodies.mainBody,
      elseBodyBlock = blockBodies['else'];

    if (sectionParameters) {
      dataContext = dataContext.pushData(sectionParameters);
    }

    if (spark.isCollection(sectionElement)) {
      if (mainBodyBlock) {
        var collectionLength = sectionElement.length,
          currentOutput = this;
        for (var itemIdx = 0; itemIdx < collectionLength; itemIdx++) {
          currentOutput = mainBodyBlock(currentOutput, dataContext.pushData(sectionElement[itemIdx], itemIdx, collectionLength));
        }
        return currentOutput;
      }
    } else if (sectionElement === true) {
      if (mainBodyBlock) return mainBodyBlock(this, dataContext);
    } else if (sectionElement || sectionElement === 0) { // Handles truthy values and the number 0
      if (mainBodyBlock) return mainBodyBlock(this, dataContext.pushData(sectionElement));
    } else if (elseBodyBlock) {
      return elseBodyBlock(this, dataContext);
    }
    return this;
  };

  // Renders a block if the element is present (not vacant).
  OutputChunk.prototype.renderIfElementExists = function(elementToTest, dataContext, blockBodies) {
    var mainBodyBlock = blockBodies.mainBody,
      elseBodyBlock = blockBodies['else'];

    if (!spark.isVacant(elementToTest)) {
      if (mainBodyBlock) return mainBodyBlock(this, dataContext);
    } else if (elseBodyBlock) {
      return elseBodyBlock(this, dataContext);
    }
    return this;
  };

  // Renders a block if the element is absent (vacant).
  OutputChunk.prototype.renderIfElementAbsent = function(elementToTest, dataContext, blockBodies) {
    var mainBodyBlock = blockBodies.mainBody,
      elseBodyBlock = blockBodies['else'];

    if (spark.isVacant(elementToTest)) {
      if (mainBodyBlock) return mainBodyBlock(this, dataContext);
    } else if (elseBodyBlock) {
      return elseBodyBlock(this, dataContext);
    }
    return this;
  };

  // Renders a generic block, potentially overriding its content.
  OutputChunk.prototype.renderNamedBlock = function(blockOverride, dataContext, blockBodies) {
    var mainBodyBlock = blockBodies.mainBody;

    if (blockOverride) {
      mainBodyBlock = blockOverride; // Use the override if provided.
    }

    if (mainBodyBlock) {
      return mainBodyBlock(this, dataContext);
    }
    return this;
  };

  // Renders a partial template.
  OutputChunk.prototype.renderPartialTemplate = function(partialRef, dataContext, partialParameters) {
    var currentScopeStack = dataContext.contextStack,
      tempCurrentHead = currentScopeStack.currentHead;

    if (partialParameters) {
      // Parameters context is pushed second, mirroring section behavior.
      // Remove the current head temporarily.
      dataContext = dataContext.rebaseContext(currentScopeStack.previousStack);
      // Push the new parameters.
      dataContext = dataContext.pushData(partialParameters);
      // Reattach the original head.
      dataContext = dataContext.pushData(tempCurrentHead);
    }
    if (typeof partialRef === "function") {
      // If the reference is a function, capture its output.
      return this.captureOutput(partialRef, dataContext, function(loadedName, capturedChunk) {
        spark.loadTemplate(loadedName, capturedChunk, dataContext).finishProcessing();
      });
    }
    // Otherwise, load the template directly.
    return spark.loadTemplate(partialRef, this, dataContext);
  };

  // Executes a registered helper function.
  OutputChunk.prototype.executeHelperFunction = function(helperName, dataContext, blockBodies, helperParameters) {
    return spark.templateHelpers[helperName](this, dataContext, blockBodies, helperParameters);
  };

  // Captures the output of a body function into a temporary buffer.
  OutputChunk.prototype.captureOutput = function(bodyFunction, dataContext, captureCallback) {
    return this.transformChunk(function(capturedChunk) {
      var outputCapture = new ContentPlaceholder(function(errorMsg, capturedOutput) {
        if (errorMsg) {
          capturedChunk.indicateError(errorMsg);
        } else {
          captureCallback(capturedOutput, capturedChunk);
        }
      });
      bodyFunction(outputCapture.currentOutputChunk, dataContext).finishProcessing();
    });
  };

  // Sets an error on the chunk and triggers a flush.
  OutputChunk.prototype.indicateError = function(errorObject) {
    this.processingError = errorObject;
    this.rootStream.drainOutput(); // Immediately try to flush the error.
    return this;
  };

  // Represents a stack of content modifiers.
  function ContentModifierStack(headModifier, previousModifier) {
    this.headModifier = headModifier;
    this.previousModifier = previousModifier;
  }

  // Pushes a new modifier onto the stack.
  ContentModifierStack.prototype.pushModifier = function(newModifier) {
    return new ContentModifierStack(newModifier, this);
  };

  // Applies all modifiers in the stack to a value.
  ContentModifierStack.prototype.applyModifiers = function(inputValue) {
    var modifierInstance = this;

    while (modifierInstance) {
      inputValue = modifierInstance.headModifier(inputValue);
      modifierInstance = modifierInstance.previousModifier;
    }
    return inputValue;
  };

  // Regular expressions for HTML escaping.
  var HTML_CHARS_TO_ESCAPE_REGEX = new RegExp(/[&<>\"\']/),
    AMPERSAND_REPL = /&/g,
    LESS_THAN_REPL = /</g,
    GREATER_THAN_REPL = />/g,
    DOUBLE_QUOTE_REPL = /\"/g,
    SINGLE_QUOTE_REPL = /\'/g;

  // Escapes HTML special characters in a string.
  spark.escapeHtmlEntities = function(inputString) {
    if (typeof inputString === "string") {
      if (!HTML_CHARS_TO_ESCAPE_REGEX.test(inputString)) {
        return inputString; // No special characters, return as is.
      }
      return inputString.replace(AMPERSAND_REPL, '&amp;').replace(LESS_THAN_REPL, '&lt;').replace(GREATER_THAN_REPL, '&gt;').replace(DOUBLE_QUOTE_REPL, '&quot;').replace(SINGLE_QUOTE_REPL, '&#39;');
    }
    return inputString; // Return non-strings unchanged.
  };

  // Escapes JavaScript special characters in a string.
  spark.escapeJavascript = function(inputString) {
    if (typeof inputString === "string") {
      if (!HTML_CHARS_TO_ESCAPE_REGEX.test(inputString)) { // Re-using for common chars.
        return inputString;
      }
      return inputString.replace(DOUBLE_QUOTE_REPL, '\\\"').replace(SINGLE_QUOTE_REPL, '\\\'');
    }
    return inputString; // Return non-strings unchanged.
  };

  // Placeholder for custom helper functions.
  spark.templateHelpers = {};

  // Export 'spark' object for Node.js or attach to global scope.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = spark;
  } else {
    this.spark = spark; // In browser, 'this' refers to 'window'.
  }

})(spark);