( function ($) {
  // Main application context for global state and event management
  var   appContext = {};
  window.appContext = appContext;
  _. extend( appContext, Backbone.Events );

  // Application initialization routine
  appContext.initializeApp = function ( initOptions ) {
    if ( initOptions.displayMode ) {
      appContext.displayMode = initOptions.displayMode;
    }
    else {
      appContext.displayMode = 'display';
    }
    appContext.protocolPreference = initOptions.protocol_pref;
    appContext.searchQuery = initOptions.queryTerm;
  };


  /*  Application Navigation Handler */

  var MainNavigator = Backbone.Router.extend({
    // Define URL routes and corresponding actions
    routes: {
      'views/': 'showPatternList',
      'templates/': 'displayTemplateList'
    },

    // Action for showing URL patterns
    showPatternList: function () {
      appContext.routeEntries = new RouteEntryCollection( [] );
      appContext.resultViewer = new ResultListDisplay({
        collection: appContext.routeEntries,
        el: $( '#searchlist' )
      });
      appContext.contentPanel = new PatternDetailPanel();

      appContext.resultViewer.render();
      appContext.routeEntries.fetch();
    },

    // Action for showing template paths
    displayTemplateList: function ( templateIdentifier ) {
      appContext.templateFilePaths = new FilePathCollection( [] );
      appContext.resultViewer = new ResultListDisplay({
        collection: appContext.templateFilePaths,
        el: $( '#searchlist' )
      });
      appContext.contentPanel = new TemplateCodePanel();

      appContext.resultViewer.render();
      appContext.templateFilePaths.fetch();
    }
  });


  /*  Data Models */

  var RouteEntry = Backbone.Model.extend({
    // Model for a single URL routing entry
    initialize: function () {
    },

    // Generates a string for search operations
    obtainSearchableText: function () {
      return this.get( 'normalized_pattern' ) + ' ' + this.get( 'view_module' ) + '.' + this.get( 'view_name' );
    },

    // Provides the primary title for display
    getPrimaryTitle: function () {
      return this.get( 'annotated_pattern' );
    },

    // Provides secondary descriptive information
    getDescriptiveInfo: function () {
      var modPath = this.get( 'view_module' );
      var vName = this.get( 'view_name' );
      return modPath + '.' + vName;
    }
  });

  var RouteEntryCollection = Backbone.Collection.extend({
    // Collection of URL routing entries
    model: RouteEntry,
    url: 'urlpatterns/'
  });

  var BackendViewInfo = Backbone.Model.extend({
    // Model for detailed information about a backend view
    initialize: function () {
    },

    // Dynamically constructs the URL root for fetching view details
    urlRoot: function () {
      return 'views/' + this.get( 'modulePath' ) + '/' + this.get( 'viewName' ) + '/';
    }
  });

  var FilePathEntry = Backbone.Model.extend({
    // Model for a single template file path
    initialize: function () {
    },

    // String used for searching template paths
    obtainSearchableText: function () {
      return this.get( 'name' );
    },

    // Primary display title for a template path
    getPrimaryTitle: function () {
      return this.get( 'name' );
    },

    // Secondary display info (empty for template paths)
    getDescriptiveInfo: function () {
      return '';
    }
  });

  var FilePathCollection = Backbone.Collection.extend({
    // Collection of template file paths
    model: FilePathEntry,
    url: '/_alto/template-paths/'
  });

  var RenderedTemplate = Backbone.Model.extend({
    // Model for a template's content
    initialize: function () {
    },

    // Dynamically constructs the URL root for fetching template content
    urlRoot: function () {
      return '/_alto/templates/' + this.get( 'name' ) + '/';
    }
  });


  /*  User Interface Views */

  var ResultItemDisplay = Backbone.View.extend({
    // Represents a single item in the search results list
    tagName: 'li',
    events: {
      'click': 'activateEntry'
    },

    initialize: function () {
    },

    // Renders the individual result item
    render: function () {
      var listContainer = $( this.options.parent );
      var primaryText = this.model.getPrimaryTitle();
      var secondaryText = this.model.getDescriptiveInfo();

      $( this.el ).html( '<a href="#">' + primaryText + '<br>' + secondaryText + ' </a>' );
      listContainer.append( this.el );
      return this;
    },

    // Handles the click event for selecting an entry
    activateEntry: function ( eventObj ) {
      eventObj.preventDefault();
      appContext.trigger( 'itemSelected', this );
    }
  });

  var ResultListDisplay = Backbone.View.extend({
    // Manages the display of search results
    initialize: function () {
      this.activeEntry = null;
      this.displayedRows = [];
      // Ensure 'this' context for render method
      _. bindAll( this, 'render' );
      this.collection.bind( 'reset', this.render );

      // Bind to custom selection change events
      _. bindAll( this, 'onSelectedEntryChange' );
      appContext.bind( 'itemSelected', this.onSelectedEntryChange );
    },

    // Renders the entire list of search results
    render: function () {
      var currentViewInstance = this;
      var domListElement = this.$el;
      this.$el.html( '' ); // Clear previous results

      var foundEntries = this.fetchQueryResults();
      currentViewInstance.displayedRows = [];

      _. each( foundEntries, function ( entry ) {
        var entryModel = entry[1];
        var itemViewInstance = new ResultItemDisplay({ parent: domListElement, model: entryModel });
        currentViewInstance.displayedRows.push( itemViewInstance );
        itemViewInstance.render();
      });
      return this;
    },

    // Retrieves and scores search results based on a query
    fetchQueryResults: function () {
      // Uses LiquidMetal for fuzzy matching and scoring
      var currentQuery = $( '#search' ).val();
      var searchOutcome = [];
      var indexCounter = 1.0;

      this.collection.each( function ( itemModel ) {
        if ( currentQuery ) {
          var searchCandidateString = itemModel.obtainSearchableText();
          var matchScoreValue = LiquidMetal.score( searchCandidateString, currentQuery );
          if ( matchScoreValue > 0 ) {
            searchOutcome.push( [ matchScoreValue, itemModel ] );
          }
        }
        else {
          searchOutcome.push( [ -indexCounter, itemModel ] );
          indexCounter = indexCounter + 1.0;
        }
      });
      // Sorts results by score in descending order
      return searchOutcome.sort( function ( a, b ) {
        return b[0] - a[0];
      });
    },

    // Handler for when a search result item is selected
    onSelectedEntryChange: function ( selectedDisplayRow ) {
      if ( this.activeEntry ) {
        this.activeEntry.$el.toggleClass( 'active' );
      }
      selectedDisplayRow.$el.toggleClass( 'active' );
      this.activeEntry = selectedDisplayRow;
      appContext.trigger( 'modelChosen', selectedDisplayRow.model );
    },

    // Moves the selection to the next item in the list
    advanceToNextEntry: function () {
      if ( this.activeEntry ) {
        var currentIndex = this.displayedRows.indexOf( this.activeEntry );
        if ( currentIndex < this.displayedRows.length - 1 ) {
          appContext.trigger( 'itemSelected', this.displayedRows[currentIndex + 1] );
        }
      }
      else {
        appContext.trigger( 'itemSelected', this.displayedRows[0] );
      }
    },

    // Moves the selection to the previous item in the list
    retreatToPreviousEntry: function () {
      if ( this.activeEntry ) {
        var currentIndex = this.displayedRows.indexOf( this.activeEntry );
        if ( currentIndex > 0 ) {
          appContext.trigger( 'itemSelected', this.displayedRows[currentIndex - 1] );
        }
      }
      else {
        appContext.trigger( 'itemSelected', this.displayedRows[0] );
      }
    }
  });

  var PatternDetailPanel = Backbone.View.extend({
    // Displays details for a selected URL pattern
    el: '#panel',
    initialize: function () {
      this.model = null;
      var detailViewInstance = this;
      _. bindAll( this, 'onModelSelectionChanged' );
      appContext.bind( 'modelChosen', this.onModelSelectionChanged );

      // Initialize CodeMirror editor for code display
      appContext.codeMirrorInstance = CodeMirror.fromTextArea( document.getElementById( 'viewcode' ), {
        mode: "python",
        theme: "elegant",
        lineWrapping: true,
        lineNumbers: true,
        firstLineNumber: detailViewInstance.startingLineNumber,
        readOnly: true
      });
    },

    // Renders the pattern details and associated code
    render: function () {
      var currentPanel = this;
      var patternDetails = this.model.toJSON();

      this.$( '#paneldetails' ).html( '' );
      this.$( 'h2' ).html( patternDetails.view_name );
      this.$( '#paneldetails' ).append( '<p id="modulename">' + patternDetails.view_module + '</p>' );
      this.$( '#paneldetails' ).append( '<code id="regex">' + patternDetails.raw_pattern + '</code>' );

      var backendViewEntry = new BackendViewInfo({ modulePath: patternDetails.view_module, viewName: patternDetails.view_name });
      backendViewEntry.fetch({
        success: function ( model, response ) {
          var dataAttributes = model.toJSON();
          var filePathUrl = appContext.protocolPreference + '://open?url=file://' + dataAttributes.file + '&line=' + dataAttributes.line_number;
          $( '#filename' ).html( '<a href="' + filePathUrl + '">' + dataAttributes.file + '</a>' );
          appContext.codeMirrorInstance.setValue( dataAttributes.source );
          appContext.codeMirrorInstance.setOption( 'firstLineNumber', dataAttributes.line_number );
        }
      });
    },

    // Handles changes in the selected model
    onModelSelectionChanged: function ( model ) {
      this.model = model;
      this.render();
    }
  });


  var TemplateCodePanel = Backbone.View.extend({
    // Displays code for a selected template file
    el: '#panel',
    initialize: function () {
      this.model = null;
      var currentPanel = this;
      _. bindAll( this, 'onModelSelectionChanged' );
      appContext.bind( 'modelChosen', this.onModelSelectionChanged );

      // Initialize CodeMirror for HTML template display
      appContext.codeMirrorInstance = CodeMirror.fromTextArea( document.getElementById( 'viewcode' ), {
        mode: "htmlmixed",
        theme: "elegant",
        lineWrapping: true,
        lineNumbers: true,
        readOnly: true
      });
    },

    // Renders the template details and its source code
    render: function () {
      var currentPanel = this;
      this.$( 'h2' ).html( this.model.get( 'name' ) );
      currentPanel.$( '#paneldetails' ).html( '' );

      var templateDataObject = new RenderedTemplate({ name: this.model.get( 'name' ) });
      templateDataObject.fetch({
        success: function ( model, response ) {
          var dataAttributes = model.toJSON();
          var fileLink = appContext.protocolPreference + '://open?url=file://' + dataAttributes.file;
          $( '#filename' ).html( '<a href="' + fileLink + '">' + dataAttributes.file + '</a>' );
          appContext.codeMirrorInstance.setValue( dataAttributes.source );

          // Display parent templates, if any
          _. each( dataAttributes.parents, function ( parentEntry ) {
            var parentLink = appContext.protocolPreference + '://open?url=file://' + parentEntry.file;
            currentPanel.$( '#paneldetails' ).append( '<li><a href="' + parentLink + '">' + parentEntry.name + '</a></li>' );
          });
        }
      });
    },

    // Updates the panel when a new template model is selected
    onModelSelectionChanged: function ( model ) {
      this.model = model;
      this.render();
    }
  });


  /*  Initial Application Setup */

  $( function () {
    var basePath = '/_alto/';
    var appNavigator = new MainNavigator();
    Backbone.history.start({ pushState: true, root: basePath });

    // Navigate to the initial mode
    appNavigator.navigate( appContext.displayMode + '/', { trigger: true });

    // Set focus to the search input
    $( '#search' ).focus();

    // Global keyboard event handler
    $( 'body' ).bind( 'keyup', function ( eventObject ) {
      var currentActiveElement;
      var nextActiveElement; // These variables are not used, but kept for structural similarity
      if ( eventObject.keyCode == 27 ) {
        // Escape key: clear search and re-render
        $( '#search' ).val( '' ).focus();
        appContext.resultViewer.render();
      }
      else if ( eventObject.keyCode == 38 ) {
        // Up arrow: navigate to previous search result
        appContext.resultViewer.retreatToPreviousEntry();
      }
      else if ( eventObject.keyCode == 40 ) {
        // Down arrow: navigate to next search result
        appContext.resultViewer.advanceToNextEntry();
      }
      else {
        // Any other key: trigger a search result re-render
        appContext.resultViewer.render();
      }
    });
  });

})( jQuery );