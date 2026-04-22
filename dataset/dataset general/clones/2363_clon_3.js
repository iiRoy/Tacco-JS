var renderForge = {};

(function() {
  // A small utility to safely retrieve the global object.
  // This helps in environments where 'this' might be undefined in strict mode,
  // or differs between browser (window) and Node.js (global).
  const retrieveGlobalObject = () => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return (function() {
      return this;
    })();
  };

  // Expose the global object for potential external access, though not strictly used internally here.
  renderForge.globalContext = retrieveGlobalObject();
})();


(function(forgeInstance) {
  // A centralized repository for pre-compiled templates, identified by a unique key.
  // Using a Map for better performance and explicit key-value handling.
  forgeInstance.templateStore = new Map();

  /**
   * Stores a compiled template function for later use.
   * @param {string} templateKey - The unique identifier for the template.
   * @param {function} templateFunction - The compiled template function.
   */
  forgeInstance.storeTemplate = function(templateKey, templateFunction) {
    if (typeof templateKey !== 'string' || templateKey.trim() === '') {
      console.warn("Attempted to register a template with an invalid key:", templateKey);
      return;
    }
    if (typeof templateFunction !== 'function') {
      console.warn(`Template '${templateKey}' registered with a non-function value.`);
      return;
    }
    forgeInstance.templateStore.set(templateKey, templateFunction);
  };

  /**
   * Initiates the rendering process for a template, producing a final string via a callback.
   * @param {string} templateIdentifier - The key of the template to render.
   * @param {object} dataContext - The data object to be used for rendering.
   * @param {function} completionHandler - A callback function (err, outputString) invoked upon completion.
   */
  forgeInstance.processTemplate = function(templateIdentifier, dataContext, completionHandler) {
    // A ResultBuffer collects output and calls the completion handler when done.
    const outputBuffer = new ResultBuffer(completionHandler);
    forgeInstance.fetchAndExecute(templateIdentifier, outputBuffer.initialSegment, RenderingContext.adapt(dataContext)).finalizeAndFlush();
  };

  /**
   * Renders a template and returns an OutputFlow object for streaming results.
   * @param {string} templateIdentifier - The key of the template to render.
   * @param {object} dataContext - The data object to be used for rendering.
   * @returns {OutputFlow} An object that emits 'data', 'error', and 'end' events.
   */
  forgeInstance.flowOutput = function(templateIdentifier, dataContext) {
    const outputStream = new OutputFlow();
    forgeInstance.deferExecution(() => {
      forgeInstance.fetchAndExecute(templateIdentifier, outputStream.initialSegment, RenderingContext.adapt(dataContext)).finalizeAndFlush();
    });
    return outputStream;
  };

  /**
   * Compiles and renders a template from a source string, directly returning the result.
   * @param {string} sourceCode - The raw template source code.
   * @param {object} inputData - The data object for rendering.
   * @param {function} doneCallback - A callback function (err, outputString).
   * @returns {*} The result of the compiled function.
   */
  forgeInstance.processSourceString = function(sourceCode, inputData, doneCallback) {
    const templateFunction = forgeInstance.prepareFunction(sourceCode);
    return templateFunction(inputData, doneCallback);
  };

  /**
   * Compiles a template source string into a render function.
   * @param {string} templateSource - The raw template source code.
   * @param {string} [templateNameHint] - An optional name hint for debugging or caching.
   * @returns {function(object, function): (ResultBuffer|OutputFlow)} A function that, when called with context and callback, renders the template.
   */
  forgeInstance.prepareFunction = function(templateSource, templateNameHint) {
    const compiledJs = forgeInstance.compileTemplate(templateSource, templateNameHint);
    const parsedTemplateFunc = forgeInstance.executeCompiledSource(compiledJs);

    return function(renderContextData, completionOrStreamCallback) {
      // Determine if a buffered callback or an event stream is needed.
      const primaryOutputHandler = (typeof completionOrStreamCallback === 'function') ?
        new ResultBuffer(completionOrStreamCallback) :
        new OutputFlow();

      forgeInstance.deferExecution(() => {
        parsedTemplateFunc(primaryOutputHandler.initialSegment, RenderingContext.adapt(renderContextData)).finalizeAndFlush();
      });
      return primaryOutputHandler;
    };
  };

  /**
   * Loads a template by name, either from cache or via an asynchronous handler, then executes it.
   * @param {string} templateName - The name of the template to load.
   * @param {OutputSegment} currentSegment - The current output segment.
   * @param {RenderingContext} renderContext - The rendering context.
   * @returns {OutputSegment} The updated output segment.
   */
  forgeInstance.fetchAndExecute = function(templateName, currentSegment, renderContext) {
    const cachedTemplateFunc = forgeInstance.templateStore.get(templateName);

    if (cachedTemplateFunc) {
      return cachedTemplateFunc(currentSegment, renderContext);
    } else {
      if (typeof forgeInstance.onDemandLoadHandler === 'function') {
        // Asynchronously load the template if not found in cache.
        return currentSegment.createBranch(branchSegment => {
          forgeInstance.onDemandLoadHandler(templateName, (loadError, sourceText) => {
            if (loadError) {
              return branchSegment.notifyError(loadError);
            }
            if (!forgeInstance.templateStore.has(templateName)) {
              // Compile and store the fetched source if it wasn't added by another async load.
              const compiledSource = forgeInstance.compileTemplate(sourceText, templateName);
              forgeInstance.executeCompiledSource(compiledSource); // This call also stores it via register
            }
            // Execute the newly loaded/cached template.
            forgeInstance.templateStore.get(templateName)(branchSegment, renderContext).finalizeAndFlush();
          });
        });
      }
      // If no on-demand loader is configured, immediately report an error.
      console.error(`Template "${templateName}" not found in cache and no 'onDemandLoadHandler' is set.`);
      return currentSegment.notifyError(new Error(`Template Not Found: ${templateName}`));
    }
  };

  /**
   * Executes a JavaScript string, typically containing a compiled template function.
   * @param {string} compiledJsString - The JavaScript code string to execute.
   * @param {string} [sourcePathHint] - An optional path hint for debugging.
   * @returns {function} The result of the eval operation (expected to be a template function).
   */
  forgeInstance.executeCompiledSource = function(compiledJsString, sourcePathHint) {
    try {
      // Direct eval in this context is specific to the original dustjs design for template loading.
      return eval(compiledJsString);
    } catch (e) {
      console.error(`Error executing compiled source for ${sourcePathHint || 'unknown source'}:`, e);
      throw e;
    }
  };

  /**
   * Determines if a given value is an array.
   * This is a polyfill for older environments.
   * @param {*} potentialArray - The value to check.
   * @returns {boolean} True if the value is an array, false otherwise.
   */
  forgeInstance.isAnArray = Array.isArray || function(potentialArray) {
    return Object.prototype.toString.call(potentialArray) === "[object Array]";
  };

  /**
   * Provides a way to defer a function call to the next available event loop tick.
   * Prioritizes `process.nextTick` for Node.js, falls back to `setTimeout(..., 0)` for browsers.
   */
  forgeInstance.deferExecution = (function() {
    if (typeof process !== "undefined" && process.nextTick) {
      return process.nextTick;
    } else {
      return function(taskFunction) {
        setTimeout(taskFunction, 0);
      };
    }
  })();

  /**
   * Checks if a value should be considered "empty" in the context of template logic (e.g., for `if` statements).
   * @param {*} checkValue - The value to evaluate.
   * @returns {boolean} True if the value is empty, false otherwise.
   */
  forgeInstance.checkIfValueEmpty = function(checkValue) {
    if (checkValue === null || typeof checkValue === 'undefined') {
      return true;
    }
    if (forgeInstance.isAnArray(checkValue) && checkValue.length === 0) {
      return true;
    }
    // `0` is explicitly not considered empty, unlike typical JavaScript falsy evaluation.
    if (checkValue === 0) {
      return false;
    }
    // Any other falsy value (false, '', NaN) is considered empty.
    return !checkValue;
  };

  /**
   * Applies a series of filters to an input value.
   * @param {*} inputValue - The value to filter.
   * @param {string|null} autoFilter - The name of an automatic filter to apply (e.g., 'h' for HTML).
   * @param {string[]} [filterList] - An array of additional filter names to apply.
   * @returns {*} The filtered value.
   */
  forgeInstance.applyFilters = function(inputValue, autoFilter, filterList) {
    let processedValue = inputValue;

    if (filterList && forgeInstance.isAnArray(filterList)) {
      for (const filterName of filterList) {
        if (filterName === "s") { // 's' filter means "no auto-escaping"
          autoFilter = null;
        } else if (forgeInstance.standardFilters.hasOwnProperty(filterName)) {
          processedValue = forgeInstance.standardFilters[filterName](processedValue);
        } else {
          console.warn(`Unknown filter "${filterName}" applied.`);
        }
      }
    }

    // Apply auto-filter if still active
    if (autoFilter && forgeInstance.standardFilters.hasOwnProperty(autoFilter)) {
      processedValue = forgeInstance.standardFilters[autoFilter](processedValue);
    }
    return processedValue;
  };

  // Standard utility functions for common filtering and escaping needs.
  forgeInstance.standardFilters = {
    htmlSafe: function(val) {
      return forgeInstance.escapeHtmlString(val);
    },
    jsSafe: function(val) {
      return forgeInstance.escapeJsString(val);
    },
    uriEncode: encodeURI,
    uriComponentEncode: encodeURIComponent,
    jsonStringify: function(val) {
      if (typeof JSON !== 'undefined' && JSON.stringify) {
        return JSON.stringify(val);
      }
      console.warn("JSON.stringify is not available. Returning original value.");
      return val;
    },
    jsonParse: function(val) {
      if (typeof JSON !== 'undefined' && JSON.parse) {
        return JSON.parse(val);
      }
      console.warn("JSON.parse is not available. Returning original value.");
      return val;
    }
  };

  /**
   * Represents the dynamic data context during template rendering.
   * It's a stack-like structure allowing data to be pushed and popped.
   */
  function RenderingContext(dataStack, globalData = {}, blockDefinitions = []) {
    this.dataStack = dataStack;
    this.globalData = globalData;
    this.blockDefinitions = blockDefinitions;
  }

  /**
   * Creates a base rendering context with an empty stack and provided global data.
   * @param {object} globalData - Global data accessible from any context.
   * @returns {RenderingContext} A new base rendering context.
   */
  forgeInstance.createBaseContext = function(globalData) {
    return new RenderingContext(new ContextStack(), globalData);
  };

  /**
   * Adapts an input (either raw data or an existing RenderingContext) into a RenderingContext instance.
   * @param {object|RenderingContext} inputContext - The context data or an existing context.
   * @returns {RenderingContext} A RenderingContext instance.
   */
  RenderingContext.adapt = function(inputContext) {
    if (inputContext instanceof RenderingContext) {
      return inputContext;
    }
    return new RenderingContext(new ContextStack(inputContext));
  };

  /**
   * Retrieves a value from the current data stack or global data using a given key.
   * @param {string} propertyKey - The key of the property to retrieve.
   * @returns {*} The value associated with the key, or undefined if not found.
   */
  RenderingContext.prototype.retrieveValue = function(propertyKey) {
    let currentStackNode = this.dataStack;
    let resolvedValue;

    // Traverse the stack from current to base.
    while (currentStackNode) {
      if (currentStackNode.isPlainObject) {
        resolvedValue = currentStackNode.currentData[propertyKey];
        // Check for strict undefined to allow null or false values.
        if (typeof resolvedValue !== 'undefined') {
          return resolvedValue;
        }
      }
      currentStackNode = currentStackNode.previousNode;
    }
    // If not found in stack, check global data.
    return this.globalData ? this.globalData[propertyKey] : undefined;
  };

  /**
   * Resolves a value by traversing a path of segments from the current context head.
   * @param {*} baseObject - The starting object for path traversal.
   * @param {string[]} pathSegments - An array of property names representing the path.
   * @returns {*} The value at the specified path, or undefined.
   */
  RenderingContext.prototype.resolvePath = function(baseObject, pathSegments) {
    const segmentCount = pathSegments.length;

    // If no path segments, return the base object itself.
    if (segmentCount === 0) {
      return this.dataStack.currentData;
    }

    // If the current head isn't an object, path traversal isn't possible.
    if (!this.dataStack.isPlainObject) {
      return undefined;
    }

    let currentObject = this.dataStack.currentData;
    let i = 0;
    while (currentObject && i < segmentCount) {
      currentObject = currentObject[pathSegments[i]];
      i++;
    }
    return currentObject;
  };

  /**
   * Creates a new RenderingContext by pushing new data onto the stack.
   * Also includes loop-related metadata if provided.
   * @param {*} newHeadData - The data to push onto the stack.
   * @param {number} [currentIndex] - The current index in a loop.
   * @param {number} [totalLength] - The total length of a loopable collection.
   * @returns {RenderingContext} A new RenderingContext instance with the extended stack.
   */
  RenderingContext.prototype.extendWith = function(newHeadData, currentIndex, totalLength) {
    if (newHeadData) {
      // Inject loop metadata into the new head data for template access.
      // Make sure to not overwrite existing properties if `newHeadData` is an object.
      // This is a common pattern in Dust, so we try to preserve it.
      if (typeof newHeadData === 'object' && newHeadData !== null) {
        if (typeof currentIndex !== 'undefined') newHeadData['$idx'] = currentIndex;
        if (typeof totalLength !== 'undefined') newHeadData['$len'] = totalLength;
      }
    }
    return new RenderingContext(
      new ContextStack(newHeadData, this.dataStack, currentIndex, totalLength),
      this.globalData,
      this.blockDefinitions
    );
  };

  /**
   * Creates a new RenderingContext with a completely new base for the stack.
   * @param {*} newRootData - The data to become the new base of the stack.
   * @returns {RenderingContext} A new RenderingContext instance with the rebased stack.
   */
  RenderingContext.prototype.rebaseStack = function(newRootData) {
    return new RenderingContext(new ContextStack(newRootData), this.globalData, this.blockDefinitions);
  };

  /**
   * Returns the data at the top of the current stack.
   * @returns {*} The current data object.
   */
  RenderingContext.prototype.peekCurrent = function() {
    return this.dataStack.currentData;
  };

  /**
   * Searches for a block definition by name within the current context's block definitions.
   * @param {string} blockName - The name of the block to find.
   * @returns {function|undefined} The block function if found, otherwise undefined.
   */
  RenderingContext.prototype.findBlockDefinition = function(blockName) {
    if (!this.blockDefinitions || this.blockDefinitions.length === 0) {
      return undefined;
    }

    // Iterate in reverse order to find the most recently defined block.
    for (let i = this.blockDefinitions.length - 1; i >= 0; i--) {
      const blockMap = this.blockDefinitions[i];
      if (blockMap && blockMap[blockName]) {
        return blockMap[blockName];
      }
    }
    return undefined;
  };

  /**
   * Creates a new RenderingContext with additional local block definitions.
   * @param {object} localBlockMap - A map of new block definitions to add.
   * @returns {RenderingContext} A new RenderingContext with updated block definitions.
   */
  RenderingContext.prototype.addLocalBlocks = function(localBlockMap) {
    if (!localBlockMap) {
      return this; // No new blocks to add.
    }

    const currentBlocks = this.blockDefinitions || [];
    const combinedBlocks = [...currentBlocks, localBlockMap]; // Use spread for immutability.

    return new RenderingContext(this.dataStack, this.globalData, combinedBlocks);
  };

  /**
   * Represents a node in the data context stack.
   * Each node holds a piece of data and a reference to the previous node.
   */
  function ContextStack(currentData, previousNode, segmentIndex, segmentCount) {
    this.previousNode = previousNode;
    this.currentData = currentData;
    this.index = segmentIndex; // Loop index
    this.of = segmentCount; // Loop total length
  }

  // Use a getter for `isPlainObject` as it's a derived property.
  Object.defineProperty(ContextStack.prototype, 'isPlainObject', {
    get: function() {
      // Check if currentData is a non-array object and not null.
      return !forgeInstance.isAnArray(this.currentData) &&
        this.currentData !== null &&
        typeof this.currentData === "object";
    },
    enumerable: true,
    configurable: true
  });


  /**
   * Buffers output segments and calls a single completion callback when all segments are ready.
   * Used for `renderForge.processTemplate`.
   */
  function ResultBuffer(onCompletion) {
    this.initialSegment = new OutputSegment(this);
    this.onCompletion = onCompletion;
    this.bufferedOutput = '';
    // Flag to track if the completion handler has already been invoked.
    this.callbackInvoked = false;
  }

  /**
   * Processes all ready output segments, appending their data to the buffer
   * or propagating an error, then invoking the completion callback.
   */
  ResultBuffer.prototype.processSegments = function() {
    let currentSegment = this.initialSegment;

    while (currentSegment) {
      if (currentSegment.isReadyToFlush) {
        this.bufferedOutput += currentSegment.contentBuffer;
      } else if (currentSegment.error) {
        // If an error occurs, prevent further processing and call the callback with the error.
        if (!this.callbackInvoked && typeof this.onCompletion === 'function') {
          this.onCompletion(currentSegment.error);
          this.callbackInvoked = true;
          // Nullify the callback and current segment to prevent re-entry/memory leaks.
          this.onCompletion = null;
        }
        return; // Stop processing further segments.
      } else {
        return; // Segment not ready, stop.
      }
      currentSegment = currentSegment.nextSegment;
      this.initialSegment = currentSegment; // Advance the head.
    }

    // If all segments processed without error and callback not yet invoked, call it with the result.
    if (!this.callbackInvoked && typeof this.onCompletion === 'function') {
      this.onCompletion(null, this.bufferedOutput);
      this.callbackInvoked = true;
      this.onCompletion = null; // Clean up.
    }
  };

  /**
   * Manages a stream of output segments, emitting events as data becomes available.
   * Used for `renderForge.flowOutput`.
   */
  function OutputFlow() {
    this.initialSegment = new OutputSegment(this);
    this.eventHandlers = {}; // Stores 'data', 'error', 'end' handlers.
    this.isStreamEnded = false;
  }

  /**
   * Dispatches ready output segments by emitting 'data' events.
   * Handles errors by emitting an 'error' event and stopping.
   * Emits 'end' when all segments are processed.
   */
  OutputFlow.prototype.dispatchOutput = function() {
    let currentSegment = this.initialSegment;

    while (currentSegment) {
      if (currentSegment.isReadyToFlush) {
        this.triggerEvent('data', currentSegment.contentBuffer);
      } else if (currentSegment.error) {
        if (!this.isStreamEnded) {
          this.triggerEvent('error', currentSegment.error);
          this.isStreamEnded = true; // Prevent further events.
          this.initialSegment = null; // Clear stream to prevent further processing.
        }
        return; // Stop processing.
      } else {
        return; // Segment not ready, stop.
      }
      currentSegment = currentSegment.nextSegment;
      this.initialSegment = currentSegment; // Advance the head.
    }

    // All segments processed, emit 'end' if not already ended.
    if (!this.isStreamEnded) {
      this.triggerEvent('end');
      this.isStreamEnded = true;
    }
  };

  /**
   * Triggers an event on the stream, invoking the registered handler for that event type.
   * @param {string} eventType - The type of event ('data', 'error', 'end').
   * @param {*} [eventData] - Data associated with the event.
   */
  OutputFlow.prototype.triggerEvent = function(eventType, eventData) {
    if (this.eventHandlers && typeof this.eventHandlers[eventType] === 'function') {
      this.eventHandlers[eventType](eventData);
    }
  };

  /**
   * Registers a handler function for a specific event type.
   * @param {string} eventType - The type of event to listen for.
   * @param {function} handlerFunction - The function to call when the event occurs.
   * @returns {OutputFlow} The current OutputFlow instance for chaining.
   */
  OutputFlow.prototype.registerHandler = function(eventType, handlerFunction) {
    if (typeof handlerFunction === 'function') {
      this.eventHandlers[eventType] = handlerFunction;
    } else {
      console.warn(`Attempted to register a non-function handler for event '${eventType}'.`);
    }
    return this;
  };

  /**
   * Represents a segment of output, potentially with chained transformers.
   * It's part of a linked list that eventually forms the full output.
   */
  function OutputSegment(flowRoot, nextSegment = null, dataTransformers = null) {
    this.flowRoot = flowRoot; // The root ResultBuffer or OutputFlow this segment belongs to.
    this.nextSegment = nextSegment;
    this.contentBuffer = '';
    this.isReadyToFlush = false;
    this.dataTransformers = dataTransformers;
    this.error = null;
  }

  /**
   * Appends content to this segment's buffer, applying any active transformers.
   * @param {*} inputContent - The content to append.
   * @returns {OutputSegment} The current segment for chaining.
   */
  OutputSegment.prototype.appendContent = function(inputContent) {
    if (inputContent === null || typeof inputContent === 'undefined') {
      return this; // Don't append null/undefined.
    }

    let processedContent = String(inputContent); // Ensure string type.

    if (this.dataTransformers) {
      processedContent = this.dataTransformers.processValue(processedContent);
    }
    this.contentBuffer += processedContent;
    return this;
  };

  /**
   * Marks this segment as complete and triggers the root flow to process segments.
   * @param {*} [finalContent] - Optional final content to append before finalizing.
   * @returns {OutputSegment} The current segment for chaining.
   */
  OutputSegment.prototype.finalizeAndFlush = function(finalContent) {
    if (finalContent) {
      this.appendContent(finalContent);
    }
    this.isReadyToFlush = true;
    this.flowRoot.processSegments(); // For ResultBuffer
    this.flowRoot.dispatchOutput(); // For OutputFlow (one of these will be a no-op)
    return this;
  };

  /**
   * Creates a new branch in the output stream, allowing for asynchronous operations.
   * The new branch will be inserted after the current segment.
   * @param {function(OutputSegment): void} branchCallback - A function that receives the new branch segment.
   * @returns {OutputSegment} The segment that follows the new branch (the old `nextSegment`).
   */
  OutputSegment.prototype.createBranch = function(branchCallback) {
    // A cursor segment that will follow the new branch.
    const followingSegment = new OutputSegment(this.flowRoot, this.nextSegment, this.dataTransformers);
    // The new branch segment, inserted between current and following.
    const newBranchSegment = new OutputSegment(this.flowRoot, followingSegment, this.dataTransformers);

    this.nextSegment = newBranchSegment;
    this.isReadyToFlush = true; // Mark current segment ready.
    if (typeof branchCallback === 'function') {
      branchCallback(newBranchSegment);
    } else {
      console.warn("createBranch called without a valid branchCallback.");
      newBranchSegment.finalizeAndFlush(); // Ensure the branch is finalized even if callback is missing.
    }
    return followingSegment;
  };

  /**
   * Adds a new data transformation function to the head of the transformer chain.
   * @param {function(*): *} newTransformer - The function to add.
   * @returns {OutputSegment} The current segment for chaining.
   */
  OutputSegment.prototype.addTransformer = function(newTransformer) {
    this.dataTransformers = this.dataTransformers ?
      this.dataTransformers.addLink(newTransformer) :
      new TransformerChain(newTransformer);
    return this;
  };

  /**
   * Removes the last added data transformation function from the chain.
   * @returns {OutputSegment} The current segment for chaining.
   */
  OutputSegment.prototype.removeLastTransformer = function() {
    if (this.dataTransformers) {
      this.dataTransformers = this.dataTransformers.previousTransformer;
    }
    return this;
  };

  /**
   * Executes a template body function with the current segment and context.
   * @param {function(OutputSegment, RenderingContext): OutputSegment} templateBodyFn - The function representing a template body.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.invokeBody = function(templateBodyFn, renderContext) {
    if (typeof templateBodyFn === 'function') {
      return templateBodyFn(this, renderContext);
    }
    console.warn("Attempted to invoke a non-function template body.");
    return this;
  };

  /**
   * Inserts a reference (variable or function result) into the output.
   * Handles function execution, auto-escaping, and custom filters.
   * @param {*} refValue - The value to reference.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {string|null} autoEscapeType - Automatic escaping type ('h' for HTML).
   * @param {string[]} [customFilters] - Additional filters to apply.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.insertReference = function(refValue, renderContext, autoEscapeType, customFilters) {
    let effectiveValue = refValue;

    // If the reference is a function, execute it.
    if (typeof effectiveValue === "function") {
      effectiveValue = effectiveValue(this, renderContext, null, {
        auto: autoEscapeType,
        filters: customFilters
      });
      // If the function returns a chunk, it means it's handling the output itself.
      if (effectiveValue instanceof OutputSegment) {
        return effectiveValue;
      }
    }

    // Only write if the value is not considered empty.
    if (!forgeInstance.checkIfValueEmpty(effectiveValue)) {
      return this.appendContent(forgeInstance.applyFilters(effectiveValue, autoEscapeType, customFilters));
    } else {
      return this; // If empty, write nothing.
    }
  };

  /**
   * Processes a section (e.g., `#` or `{#...}` in Dust).
   * Handles arrays (iterating), booleans, and objects.
   * @param {*} sectionData - The data for the section.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {object} templateBodies - An object containing `block` (main body) and `else` body functions.
   * @param {object} [sectionParameters] - Additional parameters for the section.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.processSection = function(sectionData, renderContext, templateBodies, sectionParameters) {
    const mainBody = templateBodies.block;
    const elseBody = templateBodies['else'];
    let currentSegment = this;

    // Extend context with section parameters if provided.
    let updatedContext = renderContext;
    if (sectionParameters) {
      updatedContext = renderContext.extendWith(sectionParameters);
    }

    if (forgeInstance.isAnArray(sectionData)) {
      if (mainBody) {
        const dataLength = sectionData.length;
        if (dataLength > 0) {
          for (let i = 0; i < dataLength; i++) {
            currentSegment = mainBody(currentSegment, updatedContext.extendWith(sectionData[i], i, dataLength));
          }
        } else if (elseBody) {
          currentSegment = elseBody(currentSegment, updatedContext);
        }
      }
    } else if (sectionData === true) {
      if (mainBody) currentSegment = mainBody(currentSegment, updatedContext);
    } else if (sectionData || sectionData === 0) { // Non-falsy value (including 0)
      if (mainBody) currentSegment = mainBody(currentSegment, updatedContext.extendWith(sectionData));
    } else if (elseBody) { // Falsy value (excluding 0)
      currentSegment = elseBody(currentSegment, updatedContext);
    }
    return currentSegment;
  };

  /**
   * Evaluates if a value exists (is not empty) and renders the corresponding body.
   * @param {*} checkValue - The value to check for existence.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {object} templateBodies - An object containing `block` (main body) and `else` body functions.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.evaluateExists = function(checkValue, renderContext, templateBodies) {
    const mainBody = templateBodies.block;
    const elseBody = templateBodies['else'];

    if (!forgeInstance.checkIfValueEmpty(checkValue)) {
      if (mainBody) return mainBody(this, renderContext);
    } else if (elseBody) {
      return elseBody(this, renderContext);
    }
    return this;
  };

  /**
   * Evaluates if a value does NOT exist (is empty) and renders the corresponding body.
   * @param {*} checkValue - The value to check for non-existence.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {object} templateBodies - An object containing `block` (main body) and `else` body functions.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.evaluateNotExists = function(checkValue, renderContext, templateBodies) {
    const mainBody = templateBodies.block;
    const elseBody = templateBodies['else'];

    if (forgeInstance.checkIfValueEmpty(checkValue)) {
      if (mainBody) return mainBody(this, renderContext);
    } else if (elseBody) {
      return elseBody(this, renderContext);
    }
    return this;
  };

  /**
   * Renders a block, potentially using an override.
   * @param {function} [blockOverride] - An optional function to use instead of the default block.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {object} templateBodies - An object containing `block` (main body) function.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.renderBlock = function(blockOverride, renderContext, templateBodies) {
    const effectiveBody = blockOverride || templateBodies.block;

    if (typeof effectiveBody === 'function') {
      return effectiveBody(this, renderContext);
    }
    return this;
  };

  /**
   * Includes a partial template. Handles dynamic partial names and parameter passing.
   * @param {string|function} partialNameOrFn - The name of the partial or a function resolving to its name.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {object} [partialParameters] - Parameters to push onto the context for the partial.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.includePartial = function(partialNameOrFn, renderContext, partialParameters) {
    let currentRenderContext = renderContext;
    const currentStack = currentRenderContext.dataStack;
    const originalHead = currentStack.currentData;

    // If parameters are provided, modify the context stack for the partial.
    if (partialParameters) {
      // Remove the current head from the context for a clean parameter application,
      // then add parameters, then re-add the original head.
      currentRenderContext = currentRenderContext.rebaseStack(currentStack.previousNode ? currentStack.previousNode.currentData : undefined);
      currentRenderContext = currentRenderContext.extendWith(partialParameters);
      currentRenderContext = currentRenderContext.extendWith(originalHead);
    }

    if (typeof partialNameOrFn === "function") {
      // If partial name is dynamic (a function), capture its output to get the name.
      return this.captureOutput(partialNameOrFn, currentRenderContext, (resolvedName, captureSegment) => {
        forgeInstance.fetchAndExecute(resolvedName, captureSegment, currentRenderContext).finalizeAndFlush();
      });
    }
    // Otherwise, directly load and execute the partial.
    return forgeInstance.fetchAndExecute(partialNameOrFn, this, currentRenderContext);
  };

  /**
   * Invokes a helper function.
   * @param {string} helperName - The name of the helper to invoke.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {object} templateBodies - An object containing body functions (e.g., `block`, `else`).
   * @param {object} helperParameters - Parameters passed to the helper.
   * @returns {OutputSegment} The updated output segment.
   */
  OutputSegment.prototype.invokeHelper = function(helperName, renderContext, templateBodies, helperParameters) {
    if (forgeInstance.utilityHelpers && typeof forgeInstance.utilityHelpers[helperName] === 'function') {
      return forgeInstance.utilityHelpers[helperName](this, renderContext, templateBodies, helperParameters);
    }
    console.warn(`Helper "${helperName}" not found or is not a function.`);
    return this;
  };

  /**
   * Captures the output of a body function into a buffer, then passes it to a callback.
   * @param {function(OutputSegment, RenderingContext): OutputSegment} captureBody - The function whose output is to be captured.
   * @param {RenderingContext} renderContext - The current rendering context.
   * @param {function(string, OutputSegment): void} captureCallback - Callback to receive the captured output and a new segment.
   * @returns {OutputSegment} The segment that follows the captured output.
   */
  OutputSegment.prototype.captureOutput = function(captureBody, renderContext, captureCallback) {
    if (typeof captureCallback !== 'function') {
      console.error("captureOutput requires a valid captureCallback function.");
      return this;
    }
    return this.createBranch(branchSegment => {
      const captureBuffer = new ResultBuffer((err, capturedContent) => {
        if (err) {
          branchSegment.notifyError(err);
        } else {
          captureCallback(capturedContent, branchSegment);
        }
      });
      captureBody(captureBuffer.initialSegment, renderContext).finalizeAndFlush();
    });
  };

  /**
   * Sets an error on this segment and triggers the root flow to handle it.
   * @param {Error} errorObject - The error to set.
   * @returns {OutputSegment} The current segment for chaining.
   */
  OutputSegment.prototype.notifyError = function(errorObject) {
    this.error = errorObject;
    this.flowRoot.processSegments(); // For ResultBuffer
    this.flowRoot.dispatchOutput(); // For OutputFlow
    return this;
  };

  /**
   * Represents a chain of data transformation functions.
   * Each link in the chain holds a transformer function and a reference to the previous link.
   */
  function TransformerChain(currentTransformer, previousTransformer = null) {
    this.currentTransformer = currentTransformer;
    this.previousTransformer = previousTransformer;
  }

  /**
   * Adds a new transformation function to the end of the chain (conceptually, it becomes the new head).
   * @param {function(*): *} newLink - The new transformation function.
   * @returns {TransformerChain} A new TransformerChain with the added link.
   */
  TransformerChain.prototype.addLink = function(newLink) {
    return new TransformerChain(newLink, this);
  };

  /**
   * Processes an input value through all transformers in the chain, from oldest to newest.
   * @param {*} inputData - The value to transform.
   * @returns {*} The transformed value.
   */
  TransformerChain.prototype.processValue = function(inputData) {
    let currentLink = this;
    let processedValue = inputData;
    const transformers = [];

    // Collect all transformers in order (from oldest to newest).
    while (currentLink) {
      transformers.unshift(currentLink.currentTransformer);
      currentLink = currentLink.previousTransformer;
    }

    // Apply collected transformers.
    for (const transformer of transformers) {
      if (typeof transformer === 'function') {
        processedValue = transformer(processedValue);
      } else {
        console.warn("Non-function found in transformer chain.");
      }
    }
    return processedValue;
  };

  // Regular expressions for HTML escaping.
  const HTML_SPECIAL_CHARS_REGEX = /[&<>"'`]/;
  const AMPERSAND_REGEX = /&/g;
  const LESS_THAN_REGEX = /</g;
  const GREATER_THAN_REGEX = />/g;
  const DOUBLE_QUOTE_REGEX = /"/g;
  const SINGLE_QUOTE_REGEX = /'/g;
  const BACKTICK_REGEX = /`/g; // Added backtick for completeness in HTML contexts

  /**
   * Escapes HTML special characters in a string.
   * @param {*} inputString - The string to escape.
   * @returns {string} The HTML-escaped string.
   */
  forgeInstance.escapeHtmlString = function(inputString) {
    if (typeof inputString === "string") {
      if (!HTML_SPECIAL_CHARS_REGEX.test(inputString)) {
        return inputString; // No special characters, return as is.
      }
      return inputString.replace(AMPERSAND_REGEX, '&amp;')
        .replace(LESS_THAN_REGEX, '&lt;')
        .replace(GREATER_THAN_REGEX, '&gt;')
        .replace(DOUBLE_QUOTE_REGEX, '&quot;')
        .replace(SINGLE_QUOTE_REGEX, '&#39;') // Use numeric entity for single quote
        .replace(BACKTICK_REGEX, '&#96;'); // Use numeric entity for backtick
    }
    return String(inputString); // Ensure it's a string, even if not escaped.
  };

  // Regular expressions for JavaScript escaping.
  const JS_SPECIAL_CHARS_REGEX = /["'\\\n\r\u2028\u2029]/g;

  /**
   * Escapes JavaScript special characters in a string to make it safe for embedding in JS code.
   * @param {*} inputString - The string to escape.
   * @returns {string} The JS-escaped string.
   */
  forgeInstance.escapeJsString = function(inputString) {
    if (typeof inputString === "string") {
      return inputString.replace(JS_SPECIAL_CHARS_REGEX, function(character) {
        switch (character) {
          case '"':
          case "'":
          case '\\':
            return '\\' + character;
          case '\n':
            return '\\n';
          case '\r':
            return '\\r';
          case '\u2028':
            return '\\u2028';
          case '\u2029':
            return '\\u2029';
          default: // Should not happen with current regex
            return character;
        }
      });
    }
    return String(inputString);
  };

  // Placeholder for the compiler function, expected to be injected externally.
  forgeInstance.compileTemplate = function(templateSource, nameHint) {
    console.error("renderForge.compileTemplate not implemented. Please provide a compiler.");
    return `forgeInstance.storeTemplate('${nameHint || 'anon_template'}', function(c,d){return c.write("Compiler not found for template: ${nameHint || 'anonymous'}");});`;
  };

  // Placeholder for helper functions, can be extended dynamically.
  forgeInstance.utilityHelpers = {};

  // For compatibility with the original Dust.js structure, if needed in some contexts.
  // This ensures that the global object (window or global) gets a reference to 'renderForge'.
  // The original code used a more complex global getter, but for a clone, direct assignment is often sufficient.
  if (typeof forgeInstance.globalContext !== 'undefined') {
    forgeInstance.globalContext.renderForge = forgeInstance;
  }

})(renderForge);