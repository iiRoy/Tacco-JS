(function ( $ ) {

  // The main application object, 'alto', will be exposed globally.
  var alto = {};
  window.alto = alto;

  // Extend 'alto' with Backbone.Events for custom event handling.
  _.extend( alto , Backbone.Events );


  alto.initialize = function ( options ) {
    // Check if a specific mode is provided in the options.
    if ( options.mode ) {

      alto.mode = options.mode; // Use the provided mode.

    } else {

      alto.mode = 'views'; // Default to 'views' mode if none specified.

    }

    // Assign URL scheme and query from options.
    alto.url_scheme = options.url_scheme;
    alto.query       = options.query;

  }; // End of alto.initialize function.


  //
  // Router Definitions
  //
  var Workspace = Backbone.Router.extend( {
    // Define application routes and their corresponding handler methods.
    routes: {
      'views/'    : 'pattern_list',   // Route for viewing URL patterns.
      'templates/': 'template_list'   // Route for viewing templates.
    },

    // Handler for the 'pattern_list' route.
    pattern_list: function ( ) {
      // Initialize a new collection for URL patterns.
      alto.urlPatterns = new URLPatterns( [ ] );
      // Initialize the search list view, linking it to the URL patterns collection.
      alto.searchList  = new SearchList( { collection: alto.urlPatterns, el: $( '#searchlist' ) } );
      // Initialize the view panel for displaying pattern details.
      alto.viewPanel   = new ViewPanel( );

      alto.searchList.render( );     // Render the search list.
      alto.urlPatterns.fetch( );    // Fetch URL patterns from the server.
    },

    // Handler for the 'template_list' route.
    template_list: function ( pattern_id ) {
      // Initialize a new collection for template paths.
      alto.tempatePaths = new TemplatePaths( [ ] );
      // Initialize the search list view, linking it to the template paths collection.
      alto.searchList   = new SearchList( { collection: alto.tempatePaths, el: $( '#searchlist' ) } );
      // Initialize the code panel for displaying template code.
      alto.viewPanel    = new CodePanel( );

      alto.searchList.render( );      // Render the search list.
      alto.tempatePaths.fetch( );     // Fetch template paths from the server.
    }

  } ); // End of Workspace router definition.


  //
  // Models
  //

  // Model for a single URL pattern.
  var URLPattern = Backbone.Model.extend( {
    initialize: function ( ) { /* No specific initialization needed here */ },

    // Returns a string used for searching/filtering.
    getSearchString: function ( ) {
      return this.get( 'normalized_pattern' ) + ' ' + this.get( 'view_module' ) + '.' + this.get( 'view_name' );
    },

    // Returns the main title for display.
    getTitle: function ( ) {
      return this.get( 'annotated_pattern' );
    },

    // Returns secondary information for display.
    getSecondary: function ( ) {
      var modulePath = this.get( 'view_module' );
      var viewName   = this.get( 'view_name' );
      return modulePath + '.' + viewName;
    }

  } ); // End of URLPattern model.

  // Collection for URLPattern models.
  var URLPatterns = Backbone.Collection.extend( {
    model: URLPattern,
    url  : 'urlpatterns/' // API endpoint for fetching URL patterns.
  } ); // End of URLPatterns collection.


  // Model for a Django view.
  var DjangoView = Backbone.Model.extend( {
    initialize: function ( ) { /* No specific initialization needed here */ },

    // Dynamically constructs the URL root for fetching a specific view.
    urlRoot: function ( ) {
      return 'views/' + this.get( 'modulePath' ) + '/' + this.get( 'viewName' ) + '/';
    }

  } ); // End of DjangoView model.


  // Model for a single template path.
  var TemplatePath = Backbone.Model.extend( {
    initialize: function ( ) { /* No specific initialization needed here */ },

    // Returns the template name for searching.
    getSearchString: function ( ) {
      return this.get( 'name' );
    },

    // Returns the template name as title.
    getTitle: function ( ) {
      return this.get( 'name' );
    },

    // Returns an empty string as there's no secondary info for template paths.
    getSecondary: function ( ) {
      return '';
    }

  } ); // End of TemplatePath model.


  // Collection for TemplatePath models.
  var TemplatePaths = Backbone.Collection.extend( {
    model: TemplatePath,
    url  : '/_alto/template-paths/' // API endpoint for fetching template paths.
  } ); // End of TemplatePaths collection.


  // Model for a single template.
  var Template = Backbone.Model.extend( {
    initialize: function ( ) { /* No specific initialization needed here */ },

    // Dynamically constructs the URL root for fetching a specific template.
    urlRoot: function ( ) {
      return '/_alto/templates/' + this.get( 'name' ) + '/';
    }

  } ); // End of Template model.


  //
  // Views
  //

  // View for a single search result row.
  var SearchRow = Backbone.View.extend( {
    tagName: 'li', // Each row will be an `<li>` element.

    events: {
      'click': 'select' // Handle click events on the row.
    },

    initialize: function ( ) {
      // No specific initialization logic required at this point.
    },

    // Renders the search row.
    render: function ( ) {
      var ul = $( this.options.parent ); // Get the parent `<ul>` element.
      var main = this.model.getTitle( ); // Get the main display text.
      var secondary = this.model.getSecondary( ); // Get the secondary display text.

      // Set the HTML content for the row.
      $( this.el ).html( '<a href="#">' + main + '<br>' + secondary + ' </a>' );
      ul.append( this.el ); // Append the row to its parent list.

      return this; // Enable chaining.
    },

    // Event handler for selecting a row.
    select: function ( e ) {
      e.preventDefault( ); // Prevent default link behavior.
      alto.trigger( 'selectedRowChanged', this ); // Trigger a custom event.
    }

  } ); // End of SearchRow view.


  // View for the list of search results.
  var SearchList = Backbone.View.extend( {
    initialize: function ( ) {
      this.selectedRow = null;    // Tracks the currently selected row.
      this.searchRows  = [ ];     // Stores all rendered SearchRow instances.

      // Bind the render method to the view instance to ensure `this` context.
      _.bindAll( this, 'render' );
      // Re-render the list whenever the collection is reset (e.g., after fetching data).
      this.collection.bind( 'reset', this.render );

      // Bind the selectedRowChanged method to the view instance.
      _.bindAll( this, 'selectedRowChanged' );
      // Listen for 'selectedRowChanged' events triggered globally by 'alto'.
      alto.bind( 'selectedRowChanged', this.selectedRowChanged );
    },

    // Renders the entire search list.
    render: function ( ) {
      var view = this; // Cache 'this' for use in inner functions.
      var ul   = this.$el; // The root element of this view.

      this.$el.html( '' ); // Clear existing content.

      var results = this.getSearchResults( ); // Get filtered and sorted search results.
      view.searchRows = [ ]; // Reset the list of search row views.

      // Iterate through each result and create/render a SearchRow.
      _.each( results, function ( result ) {
        var model     = result[ 1 ]; // The actual model from the result tuple.
        var searchRow = new SearchRow( { parent: ul, model: model } ); // Create a new row view.
        view.searchRows.push( searchRow ); // Add to the internal list.
        searchRow.render( ); // Render the individual row.
      } );

      return this; // Enable chaining.
    },

    // Filters and scores models based on the search query.
    getSearchResults: function ( ) {
      // Use liquidmetal for fuzzy matching and scoring against the query string.
      var query = $( '#search' ).val( ); // Get the current search input value.
      var results = [ ]; // Array to store [score, model] tuples.
      var i = 1.0; // Counter for assigning negative scores when no query.

      this.collection.each( function ( model ) {
        if ( query ) {
          var candidate = model.getSearchString( ); // Get the searchable string from the model.
          var score = LiquidMetal.score( candidate, query ); // Calculate the fuzzy score.
          if ( score > 0 ) {
            results.push( [ score, model ] ); // Only include if score is positive.
          }
        } else {
          // If no query, assign a negative, descending score to maintain original order.
          results.push( [ -i, model ] );
          i = i + 1.0;
        }
      } );

      // Sort results by score in descending order.
      return results.sort( function ( a, b ) { return b[ 0 ] - a[ 0 ]; } );
    },

    // Handles changes in the selected row.
    selectedRowChanged: function ( row ) {
      if ( this.selectedRow ) {
        this.selectedRow.$el.toggleClass( 'active' ); // Deactivate previous row.
      }
      row.$el.toggleClass( 'active' ); // Activate the new row.
      this.selectedRow = row; // Update the selected row reference.
      alto.trigger( 'selectedModelChanged', row.model ); // Notify about model change.
    },

    // Selects the next row in the list.
    selectNextRow: function ( ) {
      if ( this.selectedRow ) {
        var i = this.searchRows.indexOf( this.selectedRow ); // Get current row index.
        if ( i < this.searchRows.length - 1 ) {
          alto.trigger( 'selectedRowChanged', this.searchRows[ i + 1 ] ); // Select next if available.
        }
      } else {
        // If no row is selected, select the first one.
        alto.trigger( 'selectedRowChanged', this.searchRows[ 0 ] );
      }
    },

    // Selects the previous row in the list.
    selectPreviousRow: function ( ) {
      if ( this.selectedRow ) {
        var i = this.searchRows.indexOf( this.selectedRow ); // Get current row index.
        if ( i > 0 ) {
          alto.trigger( 'selectedRowChanged', this.searchRows[ i - 1 ] ); // Select previous if available.
        }
      } else {
        // If no row is selected, select the first one.
        alto.trigger( 'selectedRowChanged', this.searchRows[ 0 ] );
      }
    }

  } ); // End of SearchList view.


  // View for displaying details of a URL pattern (Python view code).
  var ViewPanel = Backbone.View.extend( {
    el: '#panel', // The panel element in the HTML.

    initialize: function ( ) {
      this.model = null; // No model initially.
      var view   = this; // Cache 'this'.

      _.bindAll( this, 'selectedModelChanged' ); // Bind method context.
      alto.bind( 'selectedModelChanged', this.selectedModelChanged ); // Listen for model changes.

      // Initialize CodeMirror for displaying Python code.
      alto.editor = CodeMirror.fromTextArea( document.getElementById( 'viewcode' ), {
        mode       : "python",
        theme      : "elegant",
        lineWrapping: true,
        lineNumbers: true,
        firstLineNumber: view.line_number, // This might be undefined initially, set later.
        readOnly   : true
      } );
    },

    // Renders the view panel with pattern details and code.
    render: function ( ) {
      var view    = this;
      var pattern = this.model.toJSON( ); // Get model attributes as a plain object.

      this.$( '#paneldetails' ).html( '' ); // Clear previous details.
      this.$( 'h2' ).html( pattern.view_name ); // Display view name.
      this.$( '#paneldetails' ).append( '<p id="modulename">' + pattern.view_module + '</p>' ); // Display module name.
      this.$( '#paneldetails' ).append( '<code id="regex">' + pattern.raw_pattern + '</code>' ); // Display raw regex pattern.

      // Fetch detailed information about the Django view.
      var djangoView = new DjangoView( { modulePath: pattern.view_module, viewName: pattern.view_name } );
      djangoView.fetch( {
        success: function ( model, response ) {
          var attributes = model.toJSON( ); // Get fetched attributes.
          // Construct URL for opening file in editor.
          var url = alto.url_scheme + '://open?url=file://' + attributes.file + '&line=' + attributes.line_number;
          $( '#filename' ).html( '<a href="' + url + '">' + attributes.file + '</a>' ); // Display filename as a link.
          alto.editor.setValue( attributes.source ); // Set the code in CodeMirror.
          alto.editor.setOption( 'firstLineNumber', attributes.line_number ); // Set starting line number.
        }
      } );
    },

    // Handles selection of a new model.
    selectedModelChanged: function ( model ) {
      this.model = model; // Update the view's model.
      this.render( );     // Re-render the panel.
    }

  } ); // End of ViewPanel view.


  // View for displaying details of a template (HTML/template code).
  var CodePanel = Backbone.View.extend( {
    el: '#panel', // The panel element in the HTML.

    initialize: function ( ) {
      this.model = null; // No model initially.
      var view   = this; // Cache 'this'.

      _.bindAll( this, 'selectedModelChanged' ); // Bind method context.
      alto.bind( 'selectedModelChanged', this.selectedModelChanged ); // Listen for model changes.

      // Initialize CodeMirror for displaying HTML/template code.
      alto.editor = CodeMirror.fromTextArea( document.getElementById( 'viewcode' ), {
        mode       : "htmlmixed",
        theme      : "elegant",
        lineWrapping: true,
        lineNumbers: true,
        readOnly   : true
      } );
    },

    // Renders the code panel with template details and code.
    render: function ( ) {
      var view = this;

      this.$( 'h2' ).html( this.model.get( 'name' ) ); // Display template name.
      view.$( '#paneldetails' ).html( '' ); // Clear previous details.

      // Fetch the full template content.
      var template = new Template( { name: this.model.get( 'name' ) } );
      template.fetch( {
        success: function ( model, response ) {
          var attributes = model.toJSON( ); // Get fetched attributes.
          // Construct URL for opening file in editor.
          var url = alto.url_scheme + '://open?url=file://' + attributes.file;
          $( '#filename' ).html( '<a href="' + url + '">' + attributes.file + '</a>' ); // Display filename as a link.
          alto.editor.setValue( attributes.source ); // Set the code in CodeMirror.

          // Display parent templates, if any.
          _.each( attributes.parents, function ( parent ) {
            var parentUrl = alto.url_scheme + '://open?url=file://' + parent.file;
            view.$( '#paneldetails' ).append( '<li><a href="' + parentUrl + '">' + parent.name + '</a></li>' );
          } );
        }
      } );
    },

    // Handles selection of a new model.
    selectedModelChanged: function ( model ) {
      this.model = model; // Update the view's model.
      this.render( );     // Re-render the panel.
    }

  } ); // End of CodePanel view.


  //
  // Initial Application Setup
  //
  $( function ( ) { // Execute when the DOM is ready.

    var root = '/_alto/'; // Define the root URL for the application.
    var workspace = new Workspace( ); // Instantiate the main router.

    // Start Backbone history, enabling browser history management.
    Backbone.history.start( { pushState: true, root: root } );
    // Navigate to the initial route based on the 'alto.mode'.
    workspace.navigate( alto.mode + '/', { trigger: true } );

    $( '#search' ).focus( ); // Set focus on the search input field.

    // Global keyboard event handler for navigation and search.
    $( 'body' ).bind( 'keyup', function ( e ) {
      var activeElement; // Unused variable, kept for Type I clone.
      var nextElement;   // Unused variable, kept for Type I clone.

      if ( e.keyCode == 27 ) { // Esc key pressed.
        $( '#search' ).val( '' ).focus( ); // Clear search and re-focus.
        alto.searchList.render( ); // Re-render the search list.
      } else if ( e.keyCode == 38 ) { // Up arrow key pressed.
        alto.searchList.selectPreviousRow( ); // Select the previous item.
      } else if ( e.keyCode == 40 ) { // Down arrow key pressed.
        alto.searchList.selectNextRow( ); // Select the next item.
      } else {
        // For any other key press, assume it's part of search input and re-render.
        alto.searchList.render( );
      }
    } );

  } ); // End of DOM ready function.

} ) ( jQuery ); // Pass jQuery as an argument for encapsulation.