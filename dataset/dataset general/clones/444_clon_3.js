// Code completion module for structured query languages
(function() {
  "use strict";

  // Regular expression to identify a word token, including alphanumeric and dollar signs.
  const TOKEN_PATTERN = /[\w$]+/;
  // Maximum character range to scan for the current word.
  const CONTEXT_LOOKBACK_LIMIT = 600;

  // A comprehensive list of recognized terms and keywords for the query language.
  // This string is intentionally long for demonstration purposes.
  let knownQueryTokens = "query filter from size sort field fields boost _boost properties rescore true false not to \
    index not_analyzed mapping settings mappings yes no enabled \
    match term terms operator or and type boolean bool slop window_size multi_match must should boosting positive negative negative_boost common custom_filters_score score_mode custom_score params script custom_boost_factor constant_score dis_max filtered fuzzy_like_this like_text max_query_terms fuzzy_like_this_field function_score fuzzy coordinates geo_shape has_child has_parent ids indices match_all more_like_this more_like_this_field nested prefix query_string range gt lt gte lte regexp span_first span_multi span_near clauses slop in_order span_not include exclude span_or span_term top_children _scope wildcard minimum_should_match exists geo_bounding_box geo_distance distance geo_polygon points geo_shape geohash geohash_prefix geohash_precision limit missing existence numeric_range \
    facets facet_filter histogram interval date_histogram statistical terms_stats \
    query_weight rescore_query_weight \
    integer long string float double null multi_field ip index_name precision_stepinclude_in_all geo_point lat lon validate geohash geohash_precision geohash_prefix validate validate_lat validate_lon normalize normalize_lat normalize_lon attachment \
    analyzer analysis standard simple whitespace stop keyword pattern snowball custom char_filter html_strip tokenizer stopwords keyword edgeNGram min_gram max_gram token_chars path_hierarchy letter pattern_replace \
    null_value store uax_url_email max_token_length \
  number_of_shards number_of_replicas warmers source";

  // Register a helper function for the text editor's hinting mechanism.
  TextEditor.registerHelper("hint", "queryLanguage", function(editorInstance, hintOptions) {

    // Validate inputs
    if (!editorInstance || !editorInstance.getCursor || !editorInstance.getLine) {
        console.warn("Invalid editor instance provided for hinting.");
        return { list: [], from: TextEditor.Pos(0,0), to: TextEditor.Pos(0,0) };
    }

    const wordMatcher = hintOptions && hintOptions.tokenPattern || TOKEN_PATTERN;
    const searchContextRange = hintOptions && hintOptions.contextLimit || CONTEXT_LOOKBACK_LIMIT;

    const currentPosition = editorInstance.getCursor();
    const currentLineContent = editorInstance.getLine(currentPosition.line);

    let startOffset = currentPosition.ch;
    let endOffset = startOffset;

    // Expand 'endOffset' to capture the full word to the right.
    while (endOffset < currentLineContent.length && wordMatcher.test(currentLineContent.charAt(endOffset))) {
        endOffset++;
    }
    // Expand 'startOffset' to capture the full word to the left.
    while (startOffset > 0 && wordMatcher.test(currentLineContent.charAt(startOffset - 1))) {
        startOffset--;
    }

    // Extract the word currently being typed.
    const activeWord = (startOffset !== endOffset) ? currentLineContent.slice(startOffset, endOffset) : "";

    // If no active word, return no suggestions.
    if (!activeWord) {
        return { list: [], from: TextEditor.Pos(currentPosition.line, startOffset), to: TextEditor.Pos(currentPosition.line, endOffset) };
    }

    // Generate suggestions by matching known query tokens.
    // Using a case-insensitive regex for broader matching.
    const suggestionRegex = new RegExp('^' + activeWord + "[A-Za-z_]*", "i");
    const potentialSuggestions = _.uniq(knownQueryTokens.match(suggestionRegex) || []);

    return {
        list: potentialSuggestions,
        from: TextEditor.Pos(currentPosition.line, startOffset),
        to: TextEditor.Pos(currentPosition.line, endOffset)
    };
  });
})();

// Command registration for the text editor to trigger autocomplete.
TextEditor.commands.initiateCompletion = function(editorRef) {
  TextEditor.showHint(editorRef, TextEditor.hint.queryLanguage);
};

// Main application namespace.
const Forge = {
  AppData: {}, // Storage for application-wide data.
  UtilityFunctions: {} // Collection of general utility methods.
};

// Global event dispatching and listening mechanism.
Forge.notificationCenter = {};
// Mixin Backbone's event capabilities into our notification center.
Object.assign(Forge.notificationCenter, Backbone.Events);

// Regular expression to validate common web addresses.
Forge.UtilityFunctions.webAddressValidator = /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*/;

/**
 * Dynamically adjusts the height of a textarea element based on its content.
 * Prevents the textarea from growing indefinitely by capping its height.
 * @param {HTMLTextAreaElement} targetElement The textarea element to adjust.
 */
Forge.UtilityFunctions.adjustTextareaHeight = function (targetElement) {
  if (!targetElement instanceof HTMLTextAreaElement) {
      console.error("Provided element is not a textarea.");
      return;
  }

  const initialHeightPx = parseInt(targetElement.style.height, 10) || 0;
  const contentScrollHeight = targetElement.scrollHeight;
  const maximumAllowedHeight = 500; // pixels

  // Determine the new height, capped at the maximum.
  let calculatedHeight = Math.min(contentScrollHeight, maximumAllowedHeight);
  targetElement.style.height = calculatedHeight + 'px';

  // Specific adjustment for browser rendering quirks (e.g., Chrome adding extra padding).
  const currentHeightPx = parseInt(targetElement.style.height, 10);
  if (Math.abs(currentHeightPx - initialHeightPx) < 6 && currentHeightPx < maximumAllowedHeight) {
    targetElement.style.height = initialHeightPx + 'px'; // Revert if change was minimal and not hitting max
  }
};

/**
 * Returns a symbolic string representation for common data types.
 * @param {*} value The value to check.
 * @returns {string} "[]" for arrays, "{}" for objects, or an empty string otherwise.
 */
Forge.UtilityFunctions.determineDataTypeSymbol = function (value) {
  if (_.isArray(value)) {
    return "[]";
  } else if (_.isObject(value) && !_.isFunction(value)) { // Exclude functions
    return "{}";
  }
  return "";
};

// Pre-defined jQuery HTML element templates for rendering YAML-like structures.
Forge.UtilityFunctions.renderTemplates = {
  string: $('<span class="yaml-string">'),
  boolTrue: $('<span class="yaml-boolean true">true</span>'),
  boolFalse: $('<span class="yaml-boolean false">false</span>'),
  number: $('<span class="yaml-number">'),
  null: $('<span class="yaml-null">null</span>'),
  arrayContainer: $('<ol class="yaml-array" start="0"></ol>'),
  arrayItem: $('<li class="yaml-array-elem">'),
  objectContainer: $('<ul class="yaml-map">'),
  objectEntry: $('<li class="yaml-map-elem">'),
  objectKey: $('<span class="yaml-map-key">'),
  hyperlink: $('<a>'),
  embeddedImage: $('<img>'),
};

/**
 * Recursively converts a JavaScript object into a YAML-like HTML representation.
 * Handles strings (including URLs and images), numbers, booleans, nulls, arrays, and objects.
 * @param {*} dataObject The object to render.
 * @returns {jQuery} A jQuery object representing the HTML structure.
 */
Forge.UtilityFunctions.renderObjectAsHtml = function (dataObject) {
  const templates = Forge.UtilityFunctions.renderTemplates;

  // Helper for creating and styling elements
  const createStyledElement = (template, textContent = null, additionalHtml = null) => {
      const element = template.clone();
      if (textContent !== null) {
          element.text(textContent);
      }
      if (additionalHtml !== null) {
          element.html(additionalHtml);
      }
      return element;
  };

  if (_.isString(dataObject)) {
    if (!dataObject.match(Forge.UtilityFunctions.webAddressValidator)) {
      return createStyledElement(templates.string, `"${dataObject}"`);
    } else {
      const linkElement = createStyledElement(templates.hyperlink);
      linkElement.attr('href', dataObject);

      if (dataObject.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) { // Added webp and case-insensitivity
        const imageElement = createStyledElement(templates.embeddedImage);
        imageElement.attr('src', dataObject);
        linkElement.html(imageElement);
      } else {
        linkElement.text(dataObject);
      }
      return linkElement;
    }
  } else if (_.isNumber(dataObject)) {
    return createStyledElement(templates.number, String(dataObject));
  } else if (_.isNull(dataObject)) {
    return templates.null.clone();
  } else if (_.isBoolean(dataObject)) {
    return dataObject ? templates.boolTrue.clone() : templates.boolFalse.clone();
  } else if (_.isArray(dataObject)) {
    const arrayHtml = templates.arrayContainer.clone();
    const listItems = dataObject.map(item => {
      const listItem = templates.arrayItem.clone();
      listItem.html(Forge.UtilityFunctions.renderObjectAsHtml(item));
      return listItem;
    });
    return arrayHtml.html(listItems);
  } else if (_.isObject(dataObject)) {
    const objectHtml = templates.objectContainer.clone();
    const objectEntries = _.keys(dataObject).map(keyName => {
      const entryValue = dataObject[keyName];
      const listItem = templates.objectEntry.clone();
      const keySpan = templates.objectKey.clone();
      const typeIndicator = Forge.UtilityFunctions.determineDataTypeSymbol(entryValue);

      if (typeIndicator) {
        keySpan.addClass("expandable-node"); // Renamed class
        keySpan.addClass("is-open");         // Renamed class
        keySpan.text(`▼ ${keyName}${typeIndicator}`); // Changed icon
      } else {
        keySpan.text(`${keyName}: `);
      }

      listItem.append(keySpan);
      listItem.append(Forge.UtilityFunctions.renderObjectAsHtml(entryValue));
      return listItem;
    });
    return objectHtml.html(objectEntries);
  } else {
    console.warn("Cannot render unsupported data type:", dataObject);
    return createStyledElement(templates.string, `(unsupported type: ${typeof dataObject})`);
  }
};

// Backbone Models and Collections for application data management

Forge.DataStoreItem = Backbone.Model.extend({});
Forge.DataStoreCollection = Backbone.Collection.extend({
  model: Forge.DataStoreItem,
  // Fetches and updates the collection with current index information from the server.
  reloadData: function (serverEndpoint) {
    const collectionRef = this;
    const clusterStateApiPath = '/_cluster/state?filter_nodes=true&filter_routing_table=true&filter_blocks=true&metric=_all'; // Added metric
    $.ajax({
      url: serverEndpoint + clusterStateApiPath,
      method: 'GET',
      dataType: 'json'
    }).done(function (responseData) {
        const indexNames = _.keys(responseData.metadata.indices || {});
        const processedItems = indexNames.map(idx => ({ identifier: idx })); // Renamed 'index' to 'identifier'
        collectionRef.reset(processedItems);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to refresh data store items:", textStatus, errorThrown);
        collectionRef.reset([]); // Clear on error
    });
  }
});

Forge.ApiOperation = Backbone.Model.extend({
  // Defines the initial attributes for a new API operation.
  initialValues: function () {
    let apiServerUrl;

    // Logic to determine the default server URL based on the current environment.
    const currentWindowLocation = window.location.href;
    const pathSegments = _.compact(window.location.pathname.split('/'));

    const determineServer = () => {
      if (currentWindowLocation === "http://elastichammer.exploringelasticsearch.com") {
        return currentWindowLocation;
      } else if (currentWindowLocation.startsWith("file://")) {
        return 'http://localhost:9200'; // Default for local file access
      } else {
        return window.location.protocol + '//' + window.location.host;
      }
    };
    apiServerUrl = determineServer();

    // Adjust server URL if running as a plugin.
    const isPluginPath = pathSegments[pathSegments.length - 1] === 'elastic-hammer' &&
                         pathSegments[pathSegments.length - 2] === '_plugin';
    if (isPluginPath) {
      apiServerUrl = window.location.protocol + '//' + window.location.host;
      if (pathSegments.length > 2) {
        apiServerUrl += '/' + (pathSegments.slice(0, pathSegments.length - 2).join('/'));
      }
    }

    return {
      startTime: null,
      completionTime: null,
      operationStatus: 'idle', // Renamed from 'state'
      httpMethod: 'POST',      // Renamed from 'method'
      serverEndpoint: apiServerUrl, // Renamed from 'server'
      requestPath: '_search',  // Renamed from 'path'
      requestPayload: '{}',    // Renamed from 'body'
      apiResponse: null,       // Renamed from 'response'
      httpStatusCode: null,    // Renamed from 'status'
      errorMessages: ""
    };
  },

  // Custom initialization logic for the model.
  initialize: function () {
    // A generation counter to help front-end components (like CodeMirror)
    // detect when the model's state has changed significantly.
    this.stateGeneration = 0;
    this.on('change', () => this.stateGeneration++); // Increment on any change
  },

  // Checks if the current HTTP method allows a request payload (body).
  acceptsPayload: function () {
    const currentMethod = this.get('httpMethod');
    return (currentMethod === 'PUT' || currentMethod === 'POST' || currentMethod === 'PATCH'); // Added PATCH
  },

  // Determines if the operation was successful based on HTTP status code.
  isSuccessful: function () {
    const statusCode = this.get('httpStatusCode');
    return (statusCode >= 200 && statusCode < 300);
  },

  // Attempts to guess and set helpful API parameters based on the request path.
  inferOperationParameters: function () {
    const currentApiType = this.detectOperationType();
    const suggestedValues = {};

    switch (currentApiType) {
      case 'search':
        suggestedValues.httpMethod = 'POST';
        if (!this.get('requestPayload') || this.get('requestPayload') === '{}') {
          suggestedValues.requestPayload = '{"query": {"match_all": {}}}';
        }
        break;
      case 'bulk':
        suggestedValues.httpMethod = 'POST';
        if (!this.get('requestPayload') || this.get('requestPayload').trim() === '') {
          suggestedValues.requestPayload = '{"index": {"_index": "my_index", "_type": "my_type", "_id": "1"}}\n{"field_a": "value_a", "field_b": 123}\n';
        }
        break;
      case 'get_doc': // New case for getting a specific document
        suggestedValues.httpMethod = 'GET';
        suggestedValues.requestPayload = ''; // GET requests typically don't have bodies
        break;
      case 'create_doc': // New case for creating a document (PUT with ID)
        suggestedValues.httpMethod = 'PUT';
        if (!this.get('requestPayload') || this.get('requestPayload') === '{}') {
          suggestedValues.requestPayload = '{"new_field": "new_value"}';
        }
        break;
      default:
        // No specific guesses, retain current values or provide general defaults.
        if (!this.get('requestPayload') || this.get('requestPayload') === '{}') {
            suggestedValues.requestPayload = '{}';
        }
        break;
    }
    this.set(suggestedValues);
  },

  // Analyzes the request path to determine the type of API operation.
  detectOperationType: function () {
    const pathWithoutQuery = this.get('requestPath').replace(/\?.*/, '');
    const pathSegments = _.compact(pathWithoutQuery.split("/"));

    const lastSegment = _.last(pathSegments);
    const penultimateSegment = pathSegments[pathSegments.length - 2]; // Added for context

    // Using an object map for clearer switch-like behavior.
    const apiTypeMap = {
      '_search': 'search',
      '_mapping': 'mapping',
      '_settings': 'settings',
      '_analyze': 'analyze',
      '_bulk': 'bulk',
      '_cat': 'catalogue', // Example of adding a new type
      '_snapshot': 'snapshot_mgmt' // Another example
    };

    if (apiTypeMap[lastSegment]) {
      return apiTypeMap[lastSegment];
    }

    // Heuristics for document operations
    if (pathSegments.length === 3 && !lastSegment.startsWith('_')) {
        return "get_doc"; // e.g., /index/type/id
    }
    if (pathSegments.length === 2 && !lastSegment.startsWith('_') && this.get('httpMethod') === 'PUT') {
        return "create_doc"; // e.g., /index/type (auto-id)
    }

    return 'unknown_operation'; // Default for unrecognized paths.
  },

  // Constructs the full URL for the API request.
  getRequestEndpoint: function () {
    return this.get('serverEndpoint') + '/' + this.get('requestPath');
  },

  // Groups HTTP status codes (e.g., 201 -> 200, 404 -> 400).
  categorizeStatusCode: function () {
    const currentStatus = this.get('httpStatusCode');
    if (!currentStatus || typeof currentStatus !== 'number') {
        if (this.get('operationStatus') === 'errored') return 'errored';
        return null; // No valid status to categorize
    }
    return Math.floor(currentStatus / 100) * 100;
  },

  // Executes the API operation.
  executeOperation: function () {
    if (this.get('operationStatus') !== 'idle') {
      console.warn("Operation already running or completed:", this.get('operationStatus'), this);
      return Promise.reject(new Error("Operation not in 'idle' state.")); // Return a rejected promise
    }

    this.set('operationStatus', 'running');
    const scopeRef = this;
    const method = this.get('httpMethod');
    let payload = null;

    if (this.acceptsPayload()) {
      payload = this.get('requestPayload');
    }

    this.set('startTime', Date.now());

    const fullRequestUrl = this.getRequestEndpoint();

    const ajaxOptions = {
        type: method,
        url: fullRequestUrl,
        processData: false, // Don't let jQuery process the data
        contentType: 'application/json; charset=UTF-8', // Explicitly set content type
        data: payload || null // Ensure data is null for GET/HEAD
    };

    // Add a timeout for requests that hang
    if (typeof $.ajaxSettings.timeout === 'undefined') {
        ajaxOptions.timeout = 30000; // 30 seconds default timeout
    }

    return $.ajax(ajaxOptions)
      .done(function (responsePayload, textStatus, xhrObject) {
        scopeRef.set({
          operationStatus: 'succeeded',
          apiResponse: responsePayload,
          httpStatusCode: xhrObject.status
        });
        scopeRef.trigger('success');
      })
      .fail(function (xhrObject, textStatus, errorThrown) {
        // Attempt to parse responseText as JSON if possible
        let errorResponse = xhrObject.responseText;
        try {
            errorResponse = JSON.parse(xhrObject.responseText);
        } catch (e) { /* not JSON */ }

        scopeRef.set({
          operationStatus: 'errored',
          apiResponse: errorResponse,
          httpStatusCode: xhrObject.status,
          errorMessages: errorThrown || textStatus || 'Unknown Error'
        });
        scopeRef.trigger('error');
      })
      .always(function (xhrObjectOrData, textStatus, xhrObjectOrError) {
        scopeRef.set('completionTime', Date.now());
        scopeRef.trigger('complete');
      });
  },

  // Executes the operation and records its state in global history.
  executeAndStore: function () {
    const clonedOperation = this.clone();
    const executionPromise = clonedOperation.executeOperation();

    // Update the 'last' request model immediately with the cloned attributes.
    Forge.AppData.lastRequestModel.set(clonedOperation.attributes);

    executionPromise.finally(() => { // Using finally for consistent update
      // After completion, update the 'last' request model with final state.
      Forge.AppData.lastRequestModel.set(clonedOperation.attributes);
      // Add the completed operation to the history.
      Forge.AppData.operationLog.add(clonedOperation);
      Forge.AppData.operationLog.sync("create", clonedOperation); // Persist to local storage
    });
  },

  // Provides the full URL for the request (identical to getRequestEndpoint for now).
  getAbsoluteUrl: function () {
    return this.get('serverEndpoint') + '/' + this.get('requestPath');
  }
});

Forge.OperationLog = Backbone.Collection.extend({
  localStorage: new Backbone.LocalStorage("forge-request-history"), // Changed storage key
  historyCapacity: 150, // Increased max records
  model: Forge.ApiOperation,

  initialize: function () {
    const _this = this;
    this.on('sync', function () {
      // Defer triggering the event to ensure all initial processing is done.
      setTimeout(() => {
        Forge.notificationCenter.trigger('historyDataLoaded'); // Renamed event
      }, 50); // Small delay
    });
    this.fetch(); // Load existing history on initialization.
    this.on('add', this.pruneExcessEntries, this);
    this.on('add', function (newEntry) {
      Forge.notificationCenter.trigger('newRequestAdded', newEntry); // Renamed event
    }, this);
  },

  // Removes older entries if the collection exceeds its maximum capacity.
  pruneExcessEntries: function () {
    if (this.size() > this.historyCapacity) {
      // Sort by completion time to ensure oldest are removed.
      const sortedModels = this.sortBy(model => model.get('completionTime') || 0);
      const modelsToRemove = sortedModels.slice(0, this.size() - this.historyCapacity);

      modelsToRemove.forEach(model => {
        model.destroy(); // Remove from collection and localStorage
      });
    }
  },

  // Sets up a listener to automatically add a completed operation to the history.
  monitorOperation: function (operationInstance) {
    // Ensure the operationInstance is a valid model.
    if (!(operationInstance instanceof Forge.ApiOperation)) {
        console.error("Attempted to monitor a non-ApiOperation object.");
        return;
    }
    const addOnComplete = () => {
      this.add(operationInstance.clone()); // Add a clone to history
      operationInstance.off('complete', addOnComplete); // Remove listener after first completion
    };
    operationInstance.once('complete', addOnComplete, this); // Use .once for single trigger
  },

  // Comparator function to sort requests by their start time in descending order.
  sortOrder: function (requestModel) {
    return (- (requestModel.get('startTime') || 0)); // Ensure it's a number
  }
});

// Knockout.js ViewModel Bindings

ko.bindingHandlers.textEditorIntegration = {
  init: function (elementNode, valueAccessor, allBindingsAccessor, viewModelContext, bindingContext) {
    const bindingOptions = valueAccessor();
    const allBindings = allBindingsAccessor();

    const editorDefaultSettings = {
      extraKeys: {'Ctrl-Space': 'initiateCompletion', 'Cmd-Space': 'initiateCompletion'}, // Added Cmd-Space for Mac
      foldGutter: true,
      gutters: ["TextEditor-linenumbers", "TextEditor-foldgutter"], // Renamed gutters
      mode: bindingOptions.mode || 'application/json', // Allow specifying mode, default to JSON
      lineNumbers: true, // Always show line numbers
      highlightActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      theme: 'dracula' // Example of changing theme
    };

    const editorInstance = TextEditor.fromTextArea(elementNode, _.extend(editorDefaultSettings, bindingOptions));

    let completionTimer;
    editorInstance.on("keyup", function(cmEditor, keyboardEvent) {
      const completionTriggerKeys = {
        "9": "tab", "13": "enter", "27": "escape", "33": "pageup", "34": "pagedown",
        "35": "end", "36": "home", "38": "up", "40": "down", "16": "shift", "17": "ctrl", "18": "alt"
      };
      const keyCode = keyboardEvent.keyCode || keyboardEvent.which;

      // Only trigger autocomplete if it's not an active completion session and not a navigation/modifier key.
      if (!completionTriggerKeys[keyCode.toString()] && !cmEditor.state.completionActive) {
        if (completionTimer) clearTimeout(completionTimer);
        completionTimer = setTimeout(() => {
          TextEditor.showHint(cmEditor, TextEditor.hint.queryLanguage, { completeSingle: false, closeOnUnfocus: true });
        }, 200); // Slightly increased debounce time
      }
    });

    editorInstance.on('change', function(cmEditor) {
      // Update the observable value when editor content changes.
      allBindings.value(cmEditor.getValue());
    });
    elementNode.editorInstance = editorInstance; // Store editor on the DOM element for update binding.

    // Set initial value from observable if present.
    if (allBindings.value && allBindings.value()) {
      // Store the model's 'stateGeneration' on the element to detect external changes.
      const currentGeneration = bindingContext.$data.model() ? bindingContext.$data.model().stateGeneration : 0;
      $(elementNode).data('model-generation', currentGeneration);
      editorInstance.setValue(allBindings.value());
    }

    // Ensure the editor renders correctly, especially if it's in a hidden container.
    editorInstance.refresh();
    const editorWrapper = $(editorInstance.getWrapperElement());

    // Dispose of the editor instance when the element is removed from DOM.
    ko.utils.domNodeDisposal.addDisposeCallback(elementNode, function () {
      editorWrapper.remove();
      // editorInstance.toTextArea(); // Clean up CodeMirror instance from textarea
    });
  },

  update: function (elementNode, valueAccessor, allBindings, viewModelContext, bindingContext) {
    const $element = $(elementNode);
    const model = bindingContext.$data.model();

    // Check if the editor instance exists and the model is available.
    if (!elementNode.editorInstance || !model) {
        return;
    }

    const currentPayload = model.get('requestPayload') || ""; // Renamed from 'body'
    const oldModelGeneration = $element.data('model-generation');
    const newModelGeneration = model.stateGeneration;

    // Only update the editor if the model's state generation has changed externally.
    if (oldModelGeneration !== newModelGeneration) {
      console.log(`Editor update: Old generation ${oldModelGeneration}, New generation ${newModelGeneration}`);
      elementNode.editorInstance.setValue(currentPayload);
      elementNode.editorInstance.refresh(); // Important for correct rendering after value change
      $element.data('model-generation', newModelGeneration);
    }
  }
};

ko.bindingHandlers.dynamicTextareaSizing = {
  update: function(targetElement, valueAccessor, allBindingsAccessor) {
    // Trigger the auto-sizing utility whenever the observable linked to the textarea changes.
    // This ensures that the textarea adjusts when its content is programmatically updated.
    if (valueAccessor()) { // Only execute if the observable has a truthy value (i.e., content exists)
        Forge.UtilityFunctions.adjustTextareaHeight(targetElement);
    }
  }
};

// ViewModel for a single data store item.
Forge.DataItemViewModel = function (dataItemModel) {
  _.extend(this, kb.viewModel(dataItemModel));

  // Example: Add a computed observable for display name or status.
  this.displayIdentifier = ko.computed(function() {
      return this.identifier().toUpperCase();
  }, this);
};

// ViewModel for a collection of data store items.
Forge.DataCollectionViewModel = function(dataItemsCollection) {
  this.allDataItems = kb.collectionObservable(dataItemsCollection, {view_model: Forge.DataItemViewModel});

  // Example: Add a filter mechanism.
  this.filterTerm = ko.observable('');
  this.filteredDataItems = ko.computed(function() {
    const term = this.filterTerm().toLowerCase();
    if (!term) {
      return this.allDataItems();
    }
    return ko.utils.arrayFilter(this.allDataItems(), itemVm => {
      return itemVm.identifier().toLowerCase().includes(term);
    });
  }, this);
};

// ViewModel for clearing the history log.
Forge.HistoryCleanupViewModel = function () {
  this.initiateCleanup = function () { // Renamed method
    const confirmationMessage = "Are you absolutely sure you want to delete ALL recorded API operations? This action cannot be undone!";
    if (confirm(confirmationMessage)) {
      const historyCollection = Forge.AppData.operationLog;
      // Iterate and destroy models more robustly.
      while (historyCollection.length > 0) {
        // Remove models from the end to avoid shifting issues during iteration.
        historyCollection.at(historyCollection.length - 1).destroy();
      }
      console.info("API operation history has been cleared.");
    }
  };
}

// Base ViewModel for API operations, providing common computed properties and actions.
Forge.OperationBaseViewModel = function (operationModel) {
  const scopeRef = this; // Renamed self to scopeRef for clarity and to avoid conflicts.
  _.extend(scopeRef, kb.viewModel(operationModel));

  // Action to execute the API operation and record it.
  scopeRef.triggerExecution = function () { // Renamed exec
    operationModel.executeAndStore();
  };

  // Computed observable: checks if the current HTTP method supports a payload.
  scopeRef.canSendPayload = ko.computed(function () {
    const currentMethod = scopeRef.httpMethod();
    return (currentMethod === 'POST' || currentMethod === 'PUT' || currentMethod === 'PATCH');
  }, scopeRef);

  // Computed observable: indicates if the operation has finished (succeeded or errored).
  scopeRef.isOperationCompleted = ko.computed(function () {
    const status = scopeRef.operationStatus();
    return (status === "succeeded" || status === "errored");
  }, scopeRef);

  // Computed observable: indicates if the operation is currently running.
  scopeRef.isOperationRunning = ko.computed(function () {
    return scopeRef.operationStatus() === "running";
  }, scopeRef);

  // Computed observable: provides a user-friendly name for the API type.
  scopeRef.operationCategory = ko.computed(function () {
    const detectedApi = operationModel.detectOperationType();
    return detectedApi ? detectedApi.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'; // Format for display.
  }, scopeRef);

  // Computed observable: calculates the duration of the operation in milliseconds.
  scopeRef.operationDurationMs = ko.computed(function () {
      const start = scopeRef.startTime();
      const end = scopeRef.completionTime();
      if (start && end) {
          return end - start;
      }
      return 0;
  }, scopeRef);
};