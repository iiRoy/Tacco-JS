/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variables, functions, and expressions are identical.
 * Only whitespace and comments have been altered to create a visually distinct version.
 */

// Autocomplete functionality for ElasticSearch queries
( function () {
  "use strict"
  ;

  // Define regular expression for words and a range constant
  var WORD = /[\w$]+/,
      RANGE = 500;

  // Extensive list of keywords relevant to Elasticsearch DSL
  var keywords = "query filter from size sort field fields boost _boost properties rescore true false not to " +
    "index not_analyzed mapping settings mappings yes no enabled " +
    "match term terms operator or and type boolean bool slop window_size multi_match must should boosting positive negative negative_boost common custom_filters_score score_mode custom_score params script custom_boost_factor constant_score dis_max filtered fuzzy_like_this like_text max_query_terms fuzzy_like_this_field function_score fuzzy coordinates geo_shape has_child has_parent ids indices match_all more_like_this more_like_this_field nested prefix query_string range gt lt gte lte regexp span_first span_multi span_near clauses slop in_order span_not include exclude span_or span_term top_children _scope wildcard minimum_should_match exists geo_bounding_box geo_distance distance geo_polygon points geo_shape geohash geohash_prefix geohash_precision limit missing existence numeric_range " +
    "facets facet_filter histogram interval date_histogram statistical terms_stats " +
    "query_weight rescore_query_weight " +
    "integer long string float double null multi_field ip index_name precision_stepinclude_in_all geo_point lat lon validate geohash geohash_precision geohash_prefix validate validate_lat validate_lon normalize normalize_lat normalize_lon attachment " +
    "analyzer analysis standard simple whitespace stop keyword pattern snowball custom char_filter html_strip tokenizer stopwords keyword edgeNGram min_gram max_gram token_chars path_hierarchy letter pattern_replace " +
    "null_value store uax_url_email max_token_length " +
    "number_of_shards number_of_replicas warmers source";

  // Register a CodeMirror helper for Elasticsearch hinting
  CodeMirror.registerHelper( "hint", "elasticsearch", function ( editor, options ) {

    // Retrieve word and range from options, or use defaults
    var word = options && options.word || WORD;
    var range = options && options.range || RANGE;

    // Get current cursor position and line content
    var cur = editor.getCursor(),
        curLine = editor.getLine( cur.line );

    // Determine the start and end of the current word
    var start = cur.ch,
        end = start;
    while ( end < curLine.length && word.test( curLine.charAt( end ) ) )
      ++end;
    while ( start && word.test( curLine.charAt( start - 1 ) ) )
      --start;

    // Extract the current word being typed
    var curWord = start != end && curLine.slice( start, end );

    // Find matching keywords from the predefined list
    var matches = _.uniq( keywords.match( new RegExp( curWord + "[A-Za-z_]+", "g" ) ) );

    // Return the list of matches and their positions, or null if no matches
    if ( matches ) {
      return {
        list: matches,
        from: CodeMirror.Pos( cur.line, start ),
        to: CodeMirror.Pos( cur.line, end )
      };
    } else {
      return null;
    }
  } );
} )(); // Immediately invoked function expression ends here

// Define a CodeMirror command for autocomplete
CodeMirror.commands.autocomplete = function ( cm ) {
  CodeMirror.showHint( cm, CodeMirror.hint.elasticsearch );
};

// Global Hammer object for application data and utilities
window.Hammer = {
  Data: {}, // Holds application data like history
  Util: {}  // Utility functions
};

// Global event bus using Backbone.Events
Hammer.eventBus = {};
_.extend( Hammer.eventBus, Backbone.Events );

// Regular expression for URL validation
Hammer.Util.urlPattern = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*/;

// Utility function to automatically resize a textarea based on its content
Hammer.Util.autoTextArea = function ( ta ) {
  var oldh = parseInt( ta.style.height, 10 ); // Get old height
  var height = ( ta.scrollHeight );          // Get scroll height
  var capped = ( height > 500 ) ? 500 : height; // Cap height at 500px
  ta.style.height = capped + 'px';              // Apply new height

  // Chrome specific fix for extra padding
  if ( parseInt( ta.style.height, 10 ) - oldh < 6 ) {
    ta.style.height = oldh + 'px';
  }
};

// Returns a string representation of an object's type for YAML-like display
Hammer.Util.typeString = function ( o ) {
  if ( _.isArray( o ) ) {
    return "[]"; // Array type
  } else if ( _.isObject( o ) ) {
    return "{}"; // Object type
  }
  return ""; // Other types return empty string
};

// Pre-defined jQuery root elements for YAML-like HTML rendering
Hammer.Util.yamlRoots = {
  string: $( '<span class="yaml-string">' ),
  boolTrue: $( '<span class="yaml-boolean true">true</span>' ),
  boolFalse: $( '<span class="yaml-boolean false">false</span>' ),
  number: $( '<span class="yaml-number">' ),
  null: $( '<span class="yaml-null">null</span>' ),
  arrRoot: $( '<ol class="yaml-array" start="0"></ol>' ),
  arrElem: $( '<li class="yaml-array-elem">' ),
  mapRoot: $( '<ul class="yaml-map">' ),
  mapElem: $( '<li class="yaml-map-elem">' ),
  mapKey: $( '<span class="yaml-map-key">' ),
  anchor: $( '<a>' ),
  img: $( '<img>' )
};

// Recursively prints an object as YAML-ish HTML
Hammer.Util.printYaml = function ( obj ) {
  // Handle string types
  if ( _.isString( obj ) ) {
    var s = Hammer.Util.yamlRoots.string.clone();

    // Check if the string is a URL
    if ( !obj.match( Hammer.Util.urlPattern ) ) {
      s.text( '"' + obj + '"' ); // Enclose in quotes
      return s;
    } else {
      var a = Hammer.Util.yamlRoots.anchor.clone(); // Create an anchor element

      a.attr( 'href', obj ); // Set href attribute

      // If it's an image URL, display it as an image
      if ( obj.match( /\.(jpg|jpeg|png|gif|bmp)$/ ) ) {
        img = Hammer.Util.yamlRoots.img.clone();
        img.attr( 'src', obj );
        a.html( img ); // Embed image in anchor
      } else {
        a.text( obj ); // Just display the URL text
      }

      return a;
    }
  }
  // Handle number types
  else if ( _.isNumber( obj ) ) {
    var s = Hammer.Util.yamlRoots.number.clone();
    s.text( obj );
    return s;
  }
  // Handle null type
  else if ( _.isNull( obj ) ) {
    return Hammer.Util.yamlRoots.null.clone();
  }
  // Handle boolean types
  else if ( _.isBoolean( obj ) ) {
    return ( obj ? Hammer.Util.yamlRoots.boolTrue.clone() : Hammer.Util.yamlRoots.boolFalse.clone() );
  }
  // Handle array types
  else if ( _.isArray( obj ) ) {
    var arr = Hammer.Util.yamlRoots.arrRoot.clone();
    return arr.html( _.map( obj, function ( v ) {
      var li = Hammer.Util.yamlRoots.arrElem.clone();
      li.html( Hammer.Util.printYaml( v ) ); // Recursively print array elements
      return li;
    } ) );
  }
  // Handle object types (maps)
  else if ( _.isObject( obj ) ) {
    var map = Hammer.Util.yamlRoots.mapRoot.clone();
    return map.html( _.map( _.keys( obj ), function ( k ) {
      var v = obj[ k ];
      var li = Hammer.Util.yamlRoots.mapElem.clone();
      var key = Hammer.Util.yamlRoots.mapKey.clone();
      var ts = Hammer.Util.typeString( v ); // Get type string for display

      if ( ts ) {
        key.addClass( "expandable" );
        key.addClass( "open" );
        key.text( "▾ " + k + ts ); // Add expand/collapse indicator
      } else {
        key.text( k + ': ' ); // Regular key display
      }

      li.append( key );
      li.append( Hammer.Util.printYaml( v ) ); // Recursively print value
      return li;
    } ) );
  }
  // Fallback for unhandled types
  else {
    console.error( "Can't YAMLize obj", obj );
  }
};

// Backbone Models and Collections for application data management

// Hammer.Index Model
Hammer.Index = Backbone.Model.extend( {} );

// Hammer.Indexes Collection
Hammer.Indexes = Backbone.Collection.extend( {
  model: Hammer.Index, // Model type for collection elements

  // Refreshes the list of indexes from an Elasticsearch server
  refresh: function ( server ) {
    var self = this; // Preserve context
    $.get( server + '/_cluster/state?filter_nodes=true&filter_routing_table=true&filter_blocks=true' )
      .success( function ( body ) {
        self.reset( ( _.map( _.keys( body.metadata.indices ), function ( idx ) {
          return {
            index: idx
          };
        } ) ) );
      } );
  }
} );

// Hammer.Request Model: Represents an Elasticsearch request
Hammer.Request = Backbone.Model.extend( {
  // Default attributes for a new request
  defaults: function () {
    var server; // Variable to hold the determined server URL

    // Logic to determine the Elasticsearch server URL based on the current window location
    if ( window.location.href === "http://elastichammer.exploringelasticsearch.com" ) {
      server = window.location.href;
    } else if ( window.location.href.match( /^file\:\/\// ) ) {
      server = 'http://localhost:9200';
    } else {
      server = window.location.href;
    }

    var pathComponents = _.compact( window.location.pathname.split( '/' ) );
    if ( pathComponents[ pathComponents.length - 1 ] === 'elastic-hammer' &&
      pathComponents[ pathComponents.length - 2 ] === '_plugin' ) {
      server = window.location.protocol + '//' + window.location.host;
      if ( pathComponents.length > 2 ) {
        server = server + '/' + ( pathComponents.slice( 0, pathComponents.length - 2 ).join( '/' ) );
      }
    } else {
      // No specific action needed here, server already determined
    };

    return {
      started: null, // Timestamp when request started
      ended: null,   // Timestamp when request ended
      state: 'fresh', // Current state of the request (fresh, running, succeeded, errored)
      method: 'POST', // HTTP method
      server: server, // Elasticsearch server URL
      path: '_search', // Request path
      body: '{}',      // Request body
      response: null,  // Response body
      status: null,    // HTTP status code
      errors: ""       // Any errors encountered
    };
  },

  // Initialize method for the model
  initialize: function () {
    // generation counter helps keep CodeMirror in sync with model changes
    this.generation = 0;
  },

  // Checks if the current HTTP method allows a request body
  bodyCapable: function () {
    var method = this.get( 'method' );
    return ( method === 'PUT' || method === 'POST' );
  },

  // Checks if the request was successful (HTTP status 2xx)
  ok: function () {
    var status = this.get( 'status' );
    return ( status >= 200 && status < 300 );
  },

  // Attempts to guess helpful API settings based on the request path
  apiGuessSettings: function () {
    var a = this.api(); // Get the API type
    var newVals = {};    // Object to hold new attribute values

    if ( a === 'search' ) {
      newVals.method = 'POST';
      if ( !this.get( 'body' ) ) {
        newVals.body = '{"query": {"match_all": {}}}';
      }
    } else if ( a === 'bulk' ) {
      newVals.method = 'POST';
      if ( !this.get( 'body' ) ) {
        newVals.body = '{"index": {"_index": "INDEXNAME", "_type": "TYPENAME", "_id": "ID"}}\n{"field1": "value"}\n';
      }
    }

    this.set( newVals ); // Apply the guessed settings
  },

  // Determines the Elasticsearch API type from the request path
  api: function () {
    var noquery = this.get( 'path' ).replace( /\?.*/, '' ); // Remove query string
    var parts = noquery.split( "/" ); // Split path into components
    if ( parts[ 0 ] == "" ) {
      parts = parts.slice( 1 ); // Discard leading '/' part if present
    }

    var last = _.last( parts ); // Get the last path component

    switch ( last ) {
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

    // Special case for document API (e.g., /index/type/id)
    if ( parts.length === 3 && last.match( /^[^_].*$/ ) ) {
      return "document";
    }

    return null; // Unknown API
  },

  // Constructs the full request URL
  reqUrl: function () {
    return this.get( 'server' ) + '/' + this.get( 'path' );
  },

  // Returns the HTTP status code rounded down to the nearest 100
  statusGroup: function () {
    if ( !this.get( 'state' ) ) {
      return null;
    }
    if ( this.get( 'state' ) === 'errored' && !this.get( 'status' ) )
      return 'errored';
    if ( !this.get( 'status' ) === null )
      return null;
    var s = this.get( 'status' );
    console.log( "SG", s - ( s % 100 ) );
    return s - ( s % 100 );
  },

  // Executes the Elasticsearch request
  exec: function () {
    if ( this.get( 'state' ) !== 'fresh' ) {
      console.error( "Already ran!", this.get( 'state' ), this );
      return;
    }

    this.set( 'state', 'running' ); // Set state to running
    var self = this;
    var m = this.get( 'method' );
    var body = null;
    if ( m === 'POST' || m === 'PUT' ) {
      body = this.get( 'body' ); // Get request body for POST/PUT
    }

    this.set( 'started', Date.now() ); // Record start time

    var reqUrl = this.reqUrl(); // Get the full request URL
    return $.ajax(
      reqUrl, {
        type: this.get( 'method' ),
        data: body,
        processData: false
      }
    ).success(
      function ( d, ts, xhr ) {
        self.set( {
          state: 'succeeded',
          response: d,
          status: xhr.status
        } );
        self.trigger( 'success' );
      }
    ).error(
      function ( xhr ) {
        self.set( {
          state: 'errored',
          response: xhr.responseText,
          status: xhr.status
        } );

        self.trigger( 'error' );
      }
    ).complete(
      function ( xhr ) {
        self.set( 'ended', Date.now() ); // Record end time
        self.trigger( 'complete' );
      }
    );
  },

  // Executes the request and records it in history
  execRecord: function () {
    var eClone = this.clone(); // Clone the request model
    var eFuture = eClone.exec(); // Execute the cloned request
    Hammer.Data.last.set( eClone.attributes ); // Update 'last' request data
    eFuture.complete( function () {
      console.log( "UPD", Hammer.Data.last );
      Hammer.Data.last.set( eClone.attributes ); // Final update after completion
    } );
  },

  // Returns the full URL of the request
  url: function () {
    return this.get( 'server' ) + '/' + this.get( 'path' );
  }
} );

// Hammer.RequestHistory Collection: Manages a collection of past requests
Hammer.RequestHistory = Backbone.Collection.extend( {
  localStorage: new Backbone.LocalStorage( "request-history" ), // Use localStorage for persistence
  maxRecords: 120, // Maximum number of records to keep
  model: Hammer.Request, // Model type for collection elements

  // Initialize method
  initialize: function () {
    this.on( 'sync', function () {
      setTimeout( function () {
        Hammer.eventBus.trigger( 'historyLoaded' ); // Trigger event after history is loaded
      }, 0 );
    } );
    this.fetch(); // Load existing history from localStorage
    this.on( 'add', this.trim, this ); // Trim history when new records are added
    this.on( 'add', function () {
      Hammer.eventBus.trigger( 'requestAdded', this ); // Trigger event when a request is added
    }, this );
  },

  // Trims the history to enforce maxRecords limit
  trim: function () {
    if ( this.size() > this.maxRecords ) {
      var i = this.maxRecords;
      var m;
      while ( m = this.models[ i ] ) {
        i++;
        m.destroy(); // Remove excess models
      }
    }
  },

  // Watches a request and adds it to history upon completion
  watch: function ( request ) {
    var adder = null;
    adder = function () {
      this.add( request ); // Add the completed request
      var res = this.sync( "create", request ); // Persist to localStorage
      //request.off('complete', adder); // This line is commented out in original
    };
    request.on( 'complete', adder, this );
  },

  // Comparator for sorting requests (most recent first)
  comparator: function ( request ) {
    return ( -request.get( 'started' ) );
  }
} );

// Knockout.js Binding Handlers and ViewModels

// Custom Knockout binding handler for CodeMirror editor integration
ko.bindingHandlers.codemirror = {
  init: function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {
    var options = valueAccessor();
    var defaultOptions = {
      extraKeys: {
        'Ctrl-Space': 'autocomplete'
      }, // Enable autocomplete with Ctrl-Space
      foldGutter: {
        rangeFinder: new CodeMirror.fold.combine( CodeMirror.fold.brace ) // Code folding
      }
    };

    // Initialize CodeMirror on the textarea element
    var editor = CodeMirror.fromTextArea( element, _.extend( defaultOptions, options ) );

    var timeout;
    // Event listener for keyup to trigger autocomplete
    editor.on( "keyup", function ( cm, event ) {
      var popupKeyCodes = { // Key codes that should not trigger autocomplete popup
        "9": "tab",
        "13": "enter",
        "27": "escape",
        "33": "pageup",
        "34": "pagedown",
        "35": "end",
        "36": "home",
        "38": "up",
        "40": "down"
      };
      if ( !popupKeyCodes[ ( event.keyCode || event.which ).toString() ] && !editor.state.completionActive ) {
        if ( timeout )
          clearTimeout( timeout );
        timeout = setTimeout( function () {
          CodeMirror.showHint( cm, CodeMirror.hint.elasticsearch, {
            completeSingle: false
          } ); // Show hints after a delay
        }, 150 );
      }
    } );

    // Update the observable value when CodeMirror content changes
    editor.on( 'change', function ( cm ) {
      allBindingsAccessor().value( cm.getValue() );
    } );
    element.editor = editor; // Store editor instance on the element

    // Set initial value and refresh if provided
    if ( allBindingsAccessor().value() ) {
      $( element ).data( 'generation', bindingContext.$data.model().generation );
      editor.setValue( allBindingsAccessor().value() );
    }
    editor.refresh(); // Refresh editor layout
    var wrapperElement = $( editor.getWrapperElement() ); // Get the CodeMirror wrapper element

    // Dispose callback to clean up CodeMirror instance when element is removed
    ko.utils.domNodeDisposal.addDisposeCallback( element, function () {
      wrapperElement.remove();
    } );
  },

  // Update callback for CodeMirror binding
  update: function ( element, valueAccessor, allBindings, viewModel, bindingContext ) {
    var $e = $( element );
    var newBody = bindingContext.$data.model().get( 'body' ) || ""; // Get new body content
    var oldGeneration = $e.data( 'generation' ); // Get old generation number
    var newGeneration = bindingContext.$data.model().generation; // Get new generation number

    if ( element.editor ) {
      // If generation has changed, refresh editor and set new value
      if ( oldGeneration !== newGeneration ) {
        console.log( "CHANGE", oldGeneration, newGeneration );
        element.editor.refresh();
        $e.data( 'generation', newGeneration );
        element.editor.setValue( newBody );
      }
    }
  }
};

// Custom Knockout binding handler for auto-resizing textareas
ko.bindingHandlers.autoTextArea = {
  update: function ( ta, valueAccessor, allBindingsAccessor ) {
    Hammer.Util.autoTextArea( ta ); // Call the utility function
  }
};

// Hammer.IndexVM: ViewModel for an individual Elasticsearch index
Hammer.IndexVM = function ( index ) {
  _.extend( this, kb.viewModel( index ) ); // Extend with Knockback ViewModel
};

// Hammer.IndexesVM: ViewModel for a collection of Elasticsearch indexes
Hammer.IndexesVM = function ( indexes ) {
  this.indexes = kb.collectionObservable( indexes, {
    view_model: Hammer.IndexVM
  } ); // Create a Knockback collection observable
};

// Hammer.ClearHistoryVM: ViewModel for clearing request history
Hammer.ClearHistoryVM = function () {
  this.clear = function () {
    if ( confirm( "Are you sure? This will delete ALL request history!" ) ) {
      // Loop to destroy all models in the history collection
      // (Note: Original comment suggests potential issues with deleting all at once)
      while ( Hammer.Data.history.size() > 0 ) {
        Hammer.Data.history.map( function ( m, i ) {
          return m.destroy();
        } );
      };
    }
  };
};

// Hammer.RequestBaseVM: Base ViewModel for an Elasticsearch request
Hammer.RequestBaseVM = function ( request ) {
  _.extend( this, kb.viewModel( request ) ); // Extend with Knockback ViewModel
  this.exec = function ( self ) {
    request.execRecord(); // Execute and record the request
  };

  var self = this;
  // Computed observable to check if the request method supports a body
  this.bodyCapable = ko.computed( function () {
    var m = this.method();
    return ( m === 'POST' || m === 'PUT' );
  }, this );

  // Computed observable to check if the request has completed (succeeded or errored)
  this.completed = ko.computed( function () {
    return ( this.state() === "succeeded" || this.state() == "errored" );
  }, this );

  // Computed observable to check if the request is currently running
  this.running = ko.computed( function () {
    return this.state() === "running";
  }, this );

  // Computed observable to display the API name
  this.api = ko.computed( function () {
    // peek() might be optimized out, so using path() with IO to ensure reactivity
    var apiStr = request.api();
    if ( apiStr ) {
      return this.path().substr( 0, 0 ) + request.api(); // Prepend empty string for reactivity
    } else {
      return '?'; // Unknown API
    }
  }, this );
};