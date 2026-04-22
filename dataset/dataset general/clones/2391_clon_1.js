/* @jsx React.DOM */ // This directive is crucial for the JSX transformation process.

/*
 *  =========================
 *  React JSONTree Component Library
 *  Project URL: http://eskimospy.com/stuff/react/json/
 *  Author: David Vedder
 *  License: MIT
 *  (C) 2014 - All Rights Reserved
 *  =========================
 */

/**
 * Core function to instantiate the correct React component based on a JSON value's type.
 * This acts as a factory for node components (Object, Array, String, Number, Boolean, Null).
 *
 * @param key String The property name (key) associated with the JSON value.
 * @param value Mixed The actual data value for which a component needs to be created.
 * @return Component The React Component instance representing the given JSON node.
 */
var grabNode = function( key, value )
{
    var nodeType = objType( value ); // Determine the precise JavaScript type of the 'value'.
    var theNode;                     // This variable will hold the React component instance.
    var aKey = key + Date.now();     // Generate a unique key for React's reconciliation process.

    if ( nodeType === 'Object' )
    {
        theNode = JSONObjectNode( { data: value, keyName: key, key: aKey } ); // Create an Object node for objects.
    }
    else if ( nodeType === 'Array' )
    {
        theNode = JSONArrayNode( { data: value, keyName: key, key: aKey } );  // Create an Array node for arrays.
    }
    else if ( nodeType === 'String' )
    {
        theNode = JSONStringNode( { keyName: key, value: value, key: aKey } ); // Create a String node for strings.
    }
    else if ( nodeType === 'Number' )
    {
        theNode = JSONNumberNode( { keyName: key, value: value, key: aKey } ); // Create a Number node for numbers.
    }
    else if ( nodeType === 'Boolean' )
    {
        theNode = JSONBooleanNode( { keyName: key, value: value, key: aKey } ); // Create a Boolean node for booleans.
    }
    else if ( nodeType === 'Null' )
    {
        theNode = JSONNullNode( { keyName: key, value: value, key: aKey } );  // Create a Null node for null values.
    }
    else
    {
        // This 'else' block serves as a fallback for unhandled types or debugging.
        console.error( "Unhandled type encountered during node creation:", nodeType );
    }

    return theNode; // Return the newly constructed React component.
};

/**
 * A utility function to accurately determine the type of a JavaScript object.
 * It leverages `Object.prototype.toString` for reliable type identification,
 * especially useful for distinguishing between plain objects and arrays.
 *
 * @param obj Object The object whose type you wish to inspect.
 * @return String A string representation of the object's type (e.g., "Object", "Array", "String").
 */
var objType = function( obj ) {
  var className = Object.prototype.toString.call( obj ).slice( 8, -1 ); // Extracts the type name from "[object Type]".
  return className;                                                      // Returns the extracted type string.
};

/**
 * Mixin designed to prevent click events from propagating further up the DOM tree.
 * This is crucial for interactive components where only the clicked element
 * should react, and parent elements should ignore the click.
 */
var SquashClickEventMixin = {
  handleClick: function( e ) {
    e.stopPropagation(); // Halts the propagation of the current event.
  }
};

/**
 * Mixin providing common state management and lifecycle methods for
 * nodes that can be expanded or collapsed (e.g., JSON Objects and Arrays).
 * It manages the `expanded` state, handles click events to toggle this state,
 * and resets internal caches when component props are updated.
 */
var ExpandedStateHandlerMixin = {

  getDefaultProps: function() {
    // Defines the default properties for components using this mixin.
    return { data: [], initialExpanded: false };
  },

  getInitialState: function() {
    // Sets the initial state of the component.
    return {
      expanded: this.props.initialExpanded, // Determines if the node starts in an expanded state.
      createdChildNodes: false             // A flag (though `needsChildNodes` is also used) for child node creation.
    };
  },

  handleClick: function( e ) {
    e.stopPropagation(); // Prevents the click event from affecting parent elements.
    // Toggles the `expanded` state, triggering a re-render of the component.
    this.setState({ expanded: !this.state.expanded });
  },

  componentWillReceiveProps: function() {
    // This lifecycle method is called when the component is receiving new props.
    // It's used here to reset internal caches and flags, forcing child nodes
    // to be regenerated if the underlying data has changed.
    this.renderedChildren = [];   // Clear the cache of rendered child components.
    this.itemString = false;      // Invalidate the cached item count string.
    this.needsChildNodes = true;  // Mark that child nodes need to be re-evaluated and re-created.
  }
};


/**
 * React component for rendering a JSON Array node.
 * This component displays the array's key, its item count, and allows
 * the user to expand/collapse it to view its elements.
 */
var JSONArrayNode = React.createClass({ displayName: 'JSONArrayNode',
  mixins: [ExpandedStateHandlerMixin], // Incorporates the shared logic for expandable nodes.

  /**
   * Generates or retrieves the child nodes (elements) of the array.
   * It uses caching to avoid unnecessary re-generation of child components.
   *
   * @return Array An array of React components representing the array's elements.
   */
  getChildNodes: function() {
    var childNodes = [];
    // Only generate children if the node is expanded AND they haven't been generated yet for the current state.
    if ( this.state.expanded && this.needsChildNodes ) {
      for ( var i = 0; i < this.props.data.length; i += 1 ) {
        // Recursively call `grabNode` to create components for each array element.
        childNodes.push( grabNode( i, this.props.data[i] ) );
      }
      this.needsChildNodes = false;     // Mark that children have been generated.
      this.renderedChildren = childNodes; // Cache the generated children.
    }
    return this.renderedChildren;       // Return either the cached or newly generated children.
  },

  // A flag indicating whether the child nodes for this array need to be (re)generated.
  needsChildNodes: true,

  // A cache to store the React components of the array's children once they are generated.
  renderedChildren: [],

  // A cache for the "N Items" string that is displayed next to the array name.
  itemString: false,

  /**
   * Calculates and caches the string representation of the array's length
   * (e.g., "5 Items", "1 Item"). This avoids recalculating the string on every render.
   *
   * @return String The formatted string indicating the number of items in the array.
   */
  getItemString: function() {
    if ( !this.itemString ) { // Generate the string only if it's not already cached.
      var lenWord = ( this.props.data.length === 1 ) ? ' Item' : ' Items'; // Pluralization logic.
      this.itemString = this.props.data.length + lenWord;                // Construct the string.
    }
    return this.itemString; // Return the cached string.
  },

  render: function() {
    var childNodes = this.getChildNodes(); // Retrieve the child components for rendering.
    var childListStyle = {
      display: ( this.state.expanded ) ? 'block' : 'none' // Dynamically set display style based on expansion state.
    };
    var cls = "array parentNode";
    cls += ( this.state.expanded ) ? " expanded" : ''; // Add 'expanded' class for CSS styling if applicable.

    return (
      React.DOM.li( { className: cls, onClick: this.handleClick }, // Main list item for the array node.
        React.DOM.label( null, this.props.keyName, ":" ),          // Displays the array's key name.
        React.DOM.span( null, this.getItemString() ),              // Displays the item count string.
        React.DOM.ol( { style: childListStyle },                   // Ordered list to contain array elements.
          childNodes                                               // Render the child components here.
        )
      )
    );
  }
});

/*
 *  React component for rendering a JSON Object node.
 *  This component displays the object's key, its property count, and enables
 *  expansion/collapse to reveal its properties.
 */
var JSONObjectNode = React.createClass({ displayName: 'JSONObjectNode',
  mixins: [ExpandedStateHandlerMixin], // Inherits the common state and lifecycle logic for expandable nodes.

  /**
   * Generates or retrieves the child nodes (properties) of the object.
   * Utilizes caching to optimize performance by avoiding redundant component creation.
   *
   * @return Array An array of React components representing the object's properties.
   */
  getChildNodes: function() {
    if ( this.state.expanded && this.needsChildNodes ) { // Only generate if expanded and not already cached.
      var obj = this.props.data;
      var childNodes = [];
      // Iterate over the object's properties.
      for ( k in obj ) {
        // Ensure we only process own properties, not those inherited from the prototype chain.
        if ( obj.hasOwnProperty( k ) ) {
          childNodes.push( grabNode( k, obj[k] ) ); // Recursively create a node for each property.
        }
      }
      this.needsChildNodes = false;     // Mark children as generated.
      this.renderedChildren = childNodes; // Cache the newly generated children.
    }
    return this.renderedChildren;       // Return the cached or newly generated children.
  },

  /**
   * Calculates and caches the string representation of the object's property count
   * (e.g., "3 Items", "1 Item"). This method ensures the count string is computed
   * only once per state, improving rendering efficiency.
   *
   * @return String The formatted string indicating the number of properties in the object.
   */
  getItemString: function() {
    if ( !this.itemString ) { // Generate the string only if it's not already cached.
      var obj = this.props.data;
      var len = 0;
      var lenWord = ' Items';
      for ( k in obj ) {
        if ( obj.hasOwnProperty( k ) ) {
          len += 1; // Count only own properties.
        }
      }
      if ( len === 1 ) {
        lenWord = ' Item'; // Adjust pluralization for a single item.
      }
      this.itemString = len + lenWord; // Store the constructed count string.
    }
    return this.itemString;           // Return the cached string.
  },

  // Cache for the "N Items" string displayed next to the object's key.
  itemString: false,

  // A flag indicating whether the child nodes for this object need to be (re)generated.
  needsChildNodes: true,

  // A cache to store the React components of the object's children once they are generated.
  renderedChildren: [],

  render: function() {
    var childListStyle = {
      display: ( this.state.expanded ) ? 'block' : 'none' // Controls visibility of the child properties.
    };
    var cls = "object parentNode";
    cls += ( this.state.expanded ) ? " expanded" : ''; // Adds 'expanded' class for styling when the node is open.

    return (
      React.DOM.li( { className: cls, onClick: this.handleClick }, // Main list item for the object node.
        React.DOM.label( null, this.props.keyName, ":" ),          // Displays the object's key name.
        React.DOM.span( null, this.getItemString() ),              // Displays the property count string.
        React.DOM.ul( { style: childListStyle },                   // Unordered list to contain object properties.
          this.getChildNodes()                                     // Render the child components here.
        )
      )
    );
  }
});

/*
 *  React component for displaying a simple JSON String value.
 *  This component represents a leaf node in the JSON tree structure
 *  and utilizes the `SquashClickEventMixin` to prevent event propagation.
 */
var JSONStringNode = React.createClass({ displayName: 'JSONStringNode',
  mixins: [SquashClickEventMixin], // Ensures clicks on this node don't affect parent elements.

  render: function() {
    return (
      React.DOM.li( { className: "string itemNode", onClick: this.handleClick }, // List item with specific CSS class.
        React.DOM.label( null, this.props.keyName, ":" ),                     // Displays the key name of the string.
        React.DOM.span( null, this.props.value )                              // Displays the actual string value.
      )
    );
  }
});

/*
 *  React component for displaying a simple JSON Number value.
 *  Similar to `JSONStringNode`, it's a leaf node that prevents click propagation.
 */
var JSONNumberNode = React.createClass({ displayName: 'JSONNumberNode',
  mixins: [SquashClickEventMixin], // Prevents click events from bubbling up.

  render: function() {
    return (
      React.DOM.li( { className: "number itemNode", onClick: this.handleClick }, // List item with 'number' class.
        React.DOM.label( null, this.props.keyName, ":" ),                     // Displays the key name.
        React.DOM.span( null, this.props.value )                              // Displays the numeric value.
      )
    );
  }
});


/*
 *  React component for displaying a JSON Null value.
 *  This is also a leaf node and uses the `SquashClickEventMixin`.
 */
var JSONNullNode = React.createClass({ displayName: 'JSONNullNode',
  mixins: [SquashClickEventMixin], // Prevents click event propagation.

  render: function() {
    return (
      React.DOM.li( { className: "null itemNode", onClick: this.handleClick }, // List item with 'null' class.
        React.DOM.label( null, this.props.keyName, ":" ),                     // Displays the key name.
        React.DOM.span( null, "null" )                                        // Displays the literal string "null".
      )
    );
  }
});

/*
 *  React component for displaying a JSON Boolean value.
 *  As a leaf node, it also utilizes the `SquashClickEventMixin`.
 *  Additionally, it adds a specific class ('true' or 'false') based on its value for styling.
 */
var JSONBooleanNode = React.createClass({ displayName: 'JSONBooleanNode',
  mixins: [SquashClickEventMixin], // Prevents click event propagation.

  render: function() {
    var truthString = ( this.props.value ) ? 'true' : 'false'; // Converts the boolean value to its string representation.
    return (
      React.DOM.li( { className: "boolean itemNode " + truthString, onClick: this.handleClick }, // List item with dynamic class.
        React.DOM.label( null, this.props.keyName, ":" ),                                      // Displays the key name.
        React.DOM.span( null, truthString )                                                    // Displays "true" or "false".
      )
    );
  }
});

/**
 * The main JSONTree component. This serves as the primary entry point for the JSON viewer.
 * It can be initialized with JSON data directly via the `data` prop or configured
 * to fetch data from a URL using the `source` prop.
 *
 * The root node of the displayed JSON structure is expanded by default for immediate viewing.
 */
var JSONTree = React.createClass({ displayName: 'JSONTree',

  getDefaultProps: function() {
    return { source: false }; // Default prop: no URL source provided initially.
  },

  /**
   * Initiates an asynchronous XMLHttpRequest to fetch JSON data from the specified URL.
   * Upon successful data retrieval and parsing, it updates the component's `data` prop,
   * which triggers a re-render of the JSON tree. It also includes basic error handling
   * for network issues or bad HTTP responses.
   *
   * @param url String The URL from which to fetch the JSON data.
   */
  loadDataFromURL: function( url ) {
    var self = this;
    var request = new XMLHttpRequest(); // Create a new XMLHttpRequest object.
    request.open( 'GET', url, true );   // Configure the request: GET method, target URL, asynchronous.

    request.onload = function() {
      // Check if the HTTP status code indicates a successful response.
      if ( request.status >= 200 && request.status < 400 ) {
        var jsonData = JSON.parse( request.responseText ); // Parse the JSON string received from the server.
        self.setProps({
          data: jsonData // Update the component's data prop with the fetched JSON.
        });
      } else {
        // Log an error if the server responded with an unsuccessful status code.
        console.error( "OH NO! Your request was bad. HTTP Status:", request.status );
      }
    };

    request.onerror = function() {
      // Log an error if a network-level issue occurred during the request.
      console.error( "Connection error occurred during data fetch." );
    };

    request.send(); // Send the XMLHttpRequest.
  },

  // Lifecycle method: Called immediately after the component is mounted (inserted into the DOM).
  componentDidMount: function() {
    // If a `source` URL prop is provided, attempt to load data from that URL.
    if ( this.props.source ) {
      this.loadDataFromURL( this.props.source );
    }
  },

  render: function() {
    var nodeType = objType( this.props.data ); // Determine the type of the root data provided to the component.
    var rootNode;                             // This variable will hold the React component for the root of the tree.

    if ( nodeType === 'Object' ) {
      // If the root data is an object, create a JSONObjectNode, setting it to be initially expanded.
      rootNode = JSONObjectNode( { data: this.props.data, keyName: "(root)", initialExpanded: true } );
    }
    else if ( nodeType === 'Array' ) {
      // If the root data is an array, create a JSONArrayNode, also initially expanded.
      rootNode = JSONArrayNode( { data: this.props.data, initialExpanded: true, keyName: "(root)" } );
    }
    else {
      // Log an error if the root data is neither an object nor an array, as these are the expected types.
      console.error( "JSONTree expects root data to be an Object or Array. Received type:", nodeType );
    }

    return (
      React.DOM.ul( { className: "json_tree" }, // The outermost unordered list that acts as the container for the JSON tree.
        rootNode                                // Render the determined root node component here.
      )
    );
  }
});