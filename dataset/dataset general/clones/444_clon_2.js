// Auto-completion feature for editor
(function() {
  "use strict";

  var TOKEN_PATTERN = /[\w$]+/, SEARCH_LIMIT = 500;
  var syntaxTerms = "query filter from size sort field fields boost _boost properties rescore true false not to \
    index not_analyzed mapping settings mappings yes no enabled \
    match term terms operator or and type boolean bool slop window_size multi_match must should boosting positive negative negative_boost common custom_filters_score score_mode custom_score params script custom_boost_factor constant_score dis_max filtered fuzzy_like_this like_text max_query_terms fuzzy_like_this_field function_score fuzzy coordinates geo_shape has_child has_parent ids indices match_all more_like_this more_like_this_field nested prefix query_string range gt lt gte lte regexp span_first span_multi span_near clauses slop in_order span_not include exclude span_or span_term top_children _scope wildcard minimum_should_match exists geo_bounding_box geo_distance distance geo_polygon points geo_shape geohash geohash_prefix geohash_precision limit missing existence numeric_range \
    facets facet_filter histogram interval date_histogram statistical terms_stats \
    query_weight rescore_query_weight \
    integer long string float double null multi_field ip index_name precision_stepinclude_in_all geo_point lat lon validate geohash geohash_precision geohash_prefix validate validate_lat validate_lon normalize normalize_lat normalize_lon attachment \
    analyzer analysis standard simple whitespace stop keyword pattern snowball custom char_filter html_strip tokenizer stopwords keyword edgeNGram min_gram max_gram token_chars path_hierarchy letter pattern_replace \
    null_value store uax_url_email max_token_length \
  number_of_shards number_of_replicas warmers source";

  CodeMirror.registerHelper("suggestion", "data_store_query", function(codeEditor, configSettings) {

    var tokenRegex = configSettings && configSettings.tokenRegex || TOKEN_PATTERN;
    var searchRange = configSettings && configSettings.searchRange || SEARCH_LIMIT;
    var currentPos = codeEditor.getCursor(), currentLineContent = codeEditor.getLine(currentPos.line);
    var startIndex = currentPos.ch, endIndex = startIndex;
    while (endIndex < currentLineContent.length && tokenRegex.test(currentLineContent.charAt(endIndex))) { ++endIndex; }
    while (startIndex && tokenRegex.test(currentLineContent.charAt(startIndex - 1))) { --startIndex; }
    var partialWord = startIndex != endIndex && currentLineContent.slice(startIndex, endIndex);


    var foundSuggestions = _.uniq(syntaxTerms.match(new RegExp(partialWord + "[A-Za-z_]+", "g")))
    if (foundSuggestions) {
      return {list: foundSuggestions, from: CodeMirror.Coord(currentPos.line, startIndex), to: CodeMirror.Coord(currentPos.line, endIndex)};
    } else {
      return null;
    }
  });
})();

CodeMirror.actions.completeSuggestions = function(codeMirrorInstance) {
  CodeMirror.displaySuggestions(codeMirrorInstance, CodeMirror.suggestion.data_store_query);
};

// Global application container
window.Sledge = {
  Store: {},
  Toolkit: {}
};

// Centralized message bus
Sledge.messageBroker = {}
_.extend(Sledge.messageBroker, Backbone.Communicator);

Sledge.Toolkit.webAddressMatcher = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*/;

Sledge.Toolkit.adjustTextareaHeight = function (textAreaElement) {
  var previousHeight = parseInt(textAreaElement.style.height,10);
  var currentScrollHeight = (textAreaElement.scrollHeight);
  var limitedHeight = (currentScrollHeight > 500) ? 500 : currentScrollHeight;
  textAreaElement.style.height = limitedHeight + 'px';

  // Browser rendering adjustment for minor discrepancies.
  if (parseInt(textAreaElement.style.height, 10) - previousHeight < 6) {
    textAreaElement.style.height = previousHeight + 'px';
  }
};

// Render an object as YAML-like HTML recursively
Sledge.Toolkit.determineDataTypeLabel = function (inputObject) {
  if (_.isArray(inputObject)) {
    return "[]"
  } else if (_.isObject(inputObject)) {
    return "{}"
  }
  return "";
};

Sledge.Toolkit.markupTemplates = {
  textSpan: $('<span class="yaml-string">'),
  booleanTrueSpan: $('<span class="yaml-boolean true">true</span>'),
  booleanFalseSpan: $('<span class="yaml-boolean false">false</span>'),
  numericSpan: $('<span class="yaml-number">'),
  nullSpan: $('<span class="yaml-null">null</span>'),
  listContainer: $('<ol class="yaml-array" start="0"></ol>'),
  listItem: $('<li class="yaml-array-elem">'),
  objectContainer: $('<ul class="yaml-map">'),
  objectEntry: $('<li class="yaml-map-elem">'),
  entryKeySpan: $('<span class="yaml-map-key">'),
  hyperlinkElement: $('<a>'),
  imageElement: $('<img>'),
};

Sledge.Toolkit.renderStructuredData = function (dataItem) {
  if (_.isString(dataItem)) {
    var spanElement = Sledge.Toolkit.markupTemplates.textSpan.clone();
    
    if (! dataItem.match(Sledge.Toolkit.webAddressMatcher)) {
      spanElement.text('"' + dataItem + '"');
      return spanElement;
    } else {
      var anchorElement = Sledge.Toolkit.markupTemplates.hyperlinkElement.clone();

      anchorElement.attr('href', dataItem);
      
      if (dataItem.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
        imageTag = Sledge.Toolkit.markupTemplates.imageElement.clone();
        imageTag.attr('src', dataItem);
        anchorElement.html(imageTag)
      } else {
        anchorElement.text(dataItem);        
      }
      
      return anchorElement;
    }
  } else if (_.isNumber(dataItem)) {
    var spanElement = Sledge.Toolkit.markupTemplates.numericSpan.clone();
    spanElement.text(dataItem);
    return spanElement;
  } else if (_.isNull(dataItem)) {
    return Sledge.Toolkit.markupTemplates.nullSpan.clone();
  } else if (_.isBoolean(dataItem)) {
    return (dataItem ? Sledge.Toolkit.markupTemplates.booleanTrueSpan.clone() : Sledge.Toolkit.markupTemplates.booleanFalseSpan.clone());
  } else if (_.isArray(dataItem)) {
    var arrayNode = Sledge.Toolkit.markupTemplates.listContainer.clone();
    return arrayNode.html(_.map(dataItem, function (valueItem) {
      var listItemNode = Sledge.Toolkit.markupTemplates.listItem.clone(); 
      listItemNode.html(Sledge.Toolkit.renderStructuredData(valueItem))
      return listItemNode;
    }));
  } else if (_.isObject(dataItem)) {
    var objectNode = Sledge.Toolkit.markupTemplates.objectContainer.clone();
    return objectNode.html(_.map(_.keys(dataItem), function(keyName) {
      var valueItem = dataItem[keyName];
      var objectEntry = Sledge.Toolkit.markupTemplates.objectEntry.clone();
      var entryKeySpan = Sledge.Toolkit.markupTemplates.entryKeySpan.clone();
      var typeSignature = Sledge.Toolkit.determineDataTypeLabel(valueItem);

      if (typeSignature) {
        entryKeySpan.addClass("expandable");
        entryKeySpan.addClass("open");
        entryKeySpan.text("▾ " + keyName + typeSignature);
      } else {
        entryKeySpan.text(keyName + ': ');
      }

      objectEntry.append(entryKeySpan);
      objectEntry.append(Sledge.Toolkit.renderStructuredData(valueItem));
      return objectEntry;
    }));
  } else {
    console.error("Failed to serialize data structure", dataItem);
  }
};

// Backbone Models and Collections
Sledge.DataIndex = Backbone.Model.extend({});
Sledge.DataIndexes = Backbone.Collection.extend({
  entryModel: Sledge.DataIndex,
  updateFromServer: function (apiEndpoint) {
    var collectionInstance = this;
    $.get(apiEndpoint + '/_cluster/state?filter_nodes=true&filter_routing_table=true&filter_blocks=true').
      success(function (responseData) {
        collectionInstance.reset((_.map(_.keys(responseData.metadata.indices), function (indexName) {
          return {index: indexName};
        })));
      });
  }
});

Sledge.ApiRequest = Backbone.Model.extend({
  initialValues: function () {
    var apiHost;
    
    if (window.location.href === "http://elastichammer.exploringelasticsearch.com") {
      apiHost = window.location.href;
    } else if (window.location.href.match(/^file\:\/\//)) {
      apiHost = 'http://localhost:9200'; 
    } else {
      apiHost = window.location.href;
    }

    var urlSegments = _.compact(window.location.pathname.split('/'));
    if (urlSegments[urlSegments.length - 1] === 'elastic-hammer'
        && urlSegments[urlSegments.length - 2] === '_plugin') {
      apiHost = window.location.protocol + '//' + window.location.host;
      if (urlSegments.length > 2) {
        apiHost = apiHost + '/' + (urlSegments.slice(0, urlSegments.length -2).join('/'));
      }
    } else {
     
    };
    
    return {
      started: null,
      ended: null,
      state: 'fresh',
      httpMethod: 'POST',
      apiHost: apiHost,
      requestPath: '_search',
      requestPayload: '{}',
      apiResponse: null,
      responseStatus: null,
      errorMessages: ""
    };
  },
  
  initRequest: function () {
    // Changes when re-initialized with a new state
    // This helps keep codemirror in sync
    this.stateVersion = 0;
  },
  canHaveBody: function () {
    var httpMethod = this.get('httpMethod');
    return (httpMethod === 'PUT' || httpMethod === 'POST');
  },
  isSuccessful: function () {
    var responseStatus = this.get('responseStatus')
    return (responseStatus >= 200 && responseStatus < 300);
  },
  // Attempt to guess helpful API settings as paths are typed
  inferApiSettings: function () {
    var apiIdentifier = this.api();
    var proposedSettings = {};
    if (apiIdentifier === 'search') {
      proposedSettings.httpMethod = 'POST';
      if (! this.get('requestPayload')) {
        proposedSettings.requestPayload = '{"query": {"match_all": {}}}'
      }
    } else if (apiIdentifier === 'bulk') {
      proposedSettings.httpMethod = 'POST';
      if (! this.get('requestPayload')) {
        proposedSettings.requestPayload = '{"index": {"_index": "INDEXNAME", "_type": "TYPENAME", "_id": "ID"}}\n{"field1": "value"}\n'
      }
    }

    this.set(proposedSettings);
  },
  api: function () {
    var pathWithoutQuery = this.get('requestPath').replace(/\?.*/, '');
    var pathParts = pathWithoutQuery.split("/");
    if (pathParts[0] == "") {
      pathParts = pathParts.slice(1); // Discard leading '/' part
    }

    var lastSegment = _.last(pathParts);

    switch (lastSegment)
    {
    case '_search':
      return 'search';
    case '_mapping':
      return 'mapping';
    case '_settings':
      return '_settings';
    case '_analyze':
      return 'analyze';
    case '_bulk':
      return 'bulk';
    };

    if (pathParts.length === 3 && lastSegment.match(/^[^_].*$/)) {
      return "document";
    }

    return null;
  },
  
  buildRequestUrl: function () {
    return this.get('apiHost') + '/' + this.get('requestPath');
  },
  // Return statuses rounded down to the nearest 100. i.e. 201 -> 200
  getResponseStatusGroup: function () {
    if (!this.get('state')) { return null };
    if (this.get('state') === 'errored' && !this.get('responseStatus')) return 'errored';
    if (!this.get('responseStatus') === null) return null;
    var statusCode = this.get('responseStatus');
    console.debug("Status classification:", statusCode - (statusCode % 100));
    return statusCode - (statusCode % 100);
  },
  executeRequest: function () {
    if (this.get('state') !== 'fresh') {
      console.error("Request already initiated!", this.get('state'), this);
      return;
    }

    this.set('state', 'running');
    var collectionInstance = this;
    var methodType = this.get('httpMethod');
    var requestPayload = null;
    if (methodType === 'POST' || methodType === 'PUT') {
      requestPayload = this.get('requestPayload');
    }

    this.set('started', Date.now());

    var finalRequestUrl = this.buildRequestUrl();
    return $.ajax(
      finalRequestUrl,
      {
        type: this.get('httpMethod'),
        data: requestPayload,
        processData: false
      }
    ).success(
      function (returnedData, statusText, xmlHttpRequest) {
        collectionInstance.set({state: 'succeeded', apiResponse: returnedData, responseStatus: xmlHttpRequest.status});
        collectionInstance.trigger('success');
      }
    ).error(
      function (xmlHttpRequest) {
        collectionInstance.set({state: 'errored', apiResponse: xmlHttpRequest.responseText, responseStatus: xmlHttpRequest.status});

        collectionInstance.trigger('error');
    }).complete(
      function (xmlHttpRequest) {
        collectionInstance.set('ended', Date.now());
        collectionInstance.trigger('complete');
    });

  },
  executeAndRecord: function () {
    var requestCopy = this.clone();
    var executionPromise = requestCopy.executeRequest();
    Sledge.Store.lastExecuted.set(requestCopy.attributes);
    executionPromise.complete(function () {
      console.info("Updated last executed request:", Sledge.Store.lastExecuted);
      Sledge.Store.lastExecuted.set(requestCopy.attributes);
    });
  },
  getRequestUrl: function () {
    return this.get('apiHost') + '/' + this.get('requestPath');
  }
});

Sledge.RequestLog = Backbone.Collection.extend({
  persistentStorage: new Backbone.LocalStorage("request-history"),
  recordLimit: 120,
  logEntryModel: Sledge.ApiRequest,
  initLog: function () {
    this.on('sync', function () {
      setTimeout(function () {
        Sledge.messageBroker.trigger('logLoaded');
      }, 0);
    });
    this.fetch();
    this.on('add', this.pruneLog, this);
    this.on('add', function () {
      Sledge.messageBroker.trigger('apiRequestRecorded', this);
    }, this);
  },
  pruneLog: function () {
    if (this.size() > this.recordLimit) {
      var counterIndex = this.recordLimit;
      var logModel;
      while (logModel = this.models[counterIndex]) {
        counterIndex++;
        logModel.destroy();
      }
    }
  },
  monitorRequest: function (monitoredRequest) {
    var addEntryHandler = null;
    addEntryHandler = function () {
      this.add(monitoredRequest);
      var syncResult = this.sync("create", monitoredRequest);
      //monitoredRequest.off('complete', addEntryHandler);
    };
    monitoredRequest.on('complete', addEntryHandler, this);
  },
  sortComparer: function (monitoredRequest) {
    return(- monitoredRequest.get('started'));
  }
});

// View Models for Knockout
ko.bindingHandlers.codeEditorComponent = {
  init: function (domElement, valueProvider, allBindingsProvider, boundViewModel, currentBindingContext) {
    var componentOptions = valueProvider();
    var standardOptions = {
      keyBindings: {'Ctrl-Space': 'autocomplete'},
      foldingFeature: {
    	  foldRangeIdentifier: new CodeMirror.folding.merge(CodeMirror.folding.curlyBrace)
      }
    };


    var codeMirrorInstance = CodeMirror.fromTextArea(domElement, _.extend(standardOptions, componentOptions));

    var autocompleteDelayTimer;
    codeMirrorInstance.on("keyup", function(editorInstance, keyboardEvent) {
      var ignoredKeyCodes = {
        "9": "tab",
        "13": "enter",
        "27": "escape",
        "33": "pageup",
        "34": "pagedown",
        "35": "end",
        "36": "home",
        "38": "up",
        "40": "down"
      }
      if(!ignoredKeyCodes[(keyboardEvent.keyCode || keyboardEvent.which).toString()] && !editorInstance.state.completionActive)
      {
        if(autocompleteDelayTimer) clearTimeout(autocompleteDelayTimer);
        autocompleteDelayTimer = setTimeout(function() {
          CodeMirror.displaySuggestions(editorInstance, CodeMirror.suggestion.data_store_query, {completeSingle: false});
        }, 150);
      }            
    });

    codeMirrorInstance.on('change', function(editorInstance) {
      allBindingsProvider().value(editorInstance.getValue());
    });
    domElement.editor = codeMirrorInstance;

    if(allBindingsProvider().value()) {
      $(domElement).data('generation', currentBindingContext.$data.model().stateVersion);
      codeMirrorInstance.setValue(allBindingsProvider().value());
    }
    codeMirrorInstance.refresh();
    var editorWrapper = $(codeMirrorInstance.getWrapperElement());

    ko.utilities.elementCleanup.addDisposalCallback(domElement, function () {
      editorWrapper.remove();
    });
  },
  refreshComponent: function (domElement, valueProvider, allBindings, boundViewModel, currentBindingContext) {
    var jQueryElement = $(domElement);
    var updatedContent = currentBindingContext.$data.model().get('requestPayload') || "";
    var previousVersion = jQueryElement.data('generation')
    var currentVersion = currentBindingContext.$data.model().stateVersion;

    if(domElement.editor) {
      if (previousVersion !== currentVersion) {
        console.debug("Content version change detected:", previousVersion, currentVersion);
        domElement.editor.refresh();
        jQueryElement.data('generation', currentVersion);
        domElement.editor.setValue(updatedContent);      
      }
    }
  }
};

ko.bindingHandlers.autoHeightTextarea = {
  update: function(textareaElement, valueGetter, allBindingsGetter) {
    Sledge.Toolkit.adjustTextareaHeight(textareaElement);
  }
};

Sledge.DataIndexViewModel = function (indexModel) {
  _.extend(this, kb.createViewModel(indexModel));
}

Sledge.DataIndexesViewModel = function(indexCollection) {
  this.observableIndexes = kb.observableCollection(indexCollection, {item_view_model: Sledge.DataIndexViewModel})
};

Sledge.ClearLogViewModel = function () {
  this.purgeLog = function () {
    if (confirm("Are you sure? This will delete ALL request history!")) {
      // TODO: Not sure why this needs to be called multiple times
      // It will delete > 1 models, but stop at some point for reasons
      // I don't understand
      while (Sledge.Store.requestLog.count() > 0) {
        Sledge.Store.requestLog.forEach(function (logEntry, entryIndex) { 
          return logEntry.destroy();
        });
      };
    }
  };
}

Sledge.ApiRequestBaseViewModel = function (requestObject) {
  _.extend(this, kb.createViewModel(requestObject));
  this.performExecution = function (vmInstance) {
    requestObject.executeAndRecord();
  };

  var vmInstance = this;
  this.canContainBody = ko.computed(function () {
    var httpMethod = this.httpMethod();
    return (httpMethod === 'POST' || httpMethod === 'PUT')
  }, this);

  this.isFinished = ko.computed(function () {
    return (this.requestState() === "succeeded" || this.requestState() == "errored");
  }, this);

  this.isExecuting = ko.computed(function () {
    return this.requestState() === "running";
  }, this);

  this.apiEndpointName = ko.computed(function () {
    // For some reason peek() seems to get optimized out, and
    // this never triggers unless we actually use the path() with IO
    var apiString = requestObject.api();
    if (apiString) {
      return this.requestPath().substr(0,0) + requestObject.api();
    } else {
      return '?';
    }
  }, this);