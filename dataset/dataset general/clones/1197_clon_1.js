var bind      = require ( "bind" )
  , Emitter   = require ( "emitter" )
  , d3        = require ( "d3" )
  , toFunction = require ( 'to-function' )
  , Tooltip   = require ( "./tooltip" )
; // End of module imports

/*
 * Graph configuration constants.
 * These values define various static properties
 * used throughout the graph rendering process.
 */
var UNSELECTED_COLOR           = "transparent"
;
var PATH_STROKE_WIDTH          = .3
;
var SELECTED_PATH_STROKE_WIDTH = 1.5
;
var CIRCLE_STROKE              = "#FFF";
var BASE_ELEMENT_CLASS         = "insights-graph"; // CSS class for the main SVG element
var RADIUS_RANGE               = [ 6 , 40 ];
var TITLE_RANGE                = [ 0 , 1 ];


// Define default settings for the graph.
// These can be overridden by user-provided options.
var defaults = {
    width        : 1200
  , height       : 700
  , collisionAlpha: .5 // Alpha value for collision detection, affects force layout
  , forceAlphaLimit: 0.02 // Force simulation stops when alpha drops below this
  , linkStrength : 1
  , linkDistance : 60
  , graphCharge  : -300
  , gravity      : 0.1
  , zoomScaleExtent: [ 0.3 , 2.3 ] // Min and max zoom levels
  , tooltipTemplate: "<div>text: {{text}}</div> <div>size: {{size}}</div>" // Default tooltip content
};

// List of valid attributes that can be extracted from a node object.
var VALID_ATTRS = [ 'id' , 'size' , 'cluster' , 'text' ];


/**
 * Constructs a new `Graph` instance.
 *
 * This function initializes the graph with the provided
 * DOM element, node data, link data, and configuration options.
 *
 * @constructor Graph
 * @param {HTMLElement} el      The DOM element to render the graph into.
 * @param {Array}       nodes   An array of node objects.
 * @param {Array}       links   An array of link objects (pairs of node IDs).
 * @param {Object}      options Configuration options for the graph.
 */
function Graph ( el , nodes , links , options ) {

  // Store the main DOM element where the graph will be rendered.
  this.el = el ;

  // Initialize an empty object to cache processed options.
  this.opts = { } ;

  // Ensure options is an object, even if not provided.
  options = options || { } ;

  // Apply default values for width and height if not specified in options.
  this.opts.width  = options.width  || defaults.width ;
  this.opts.height = options.height || defaults.height ;
  // Initialize D3's category20 color scale for clusters.
  this.opts.color  = d3.scale.category20 ( ) ;
  // Use custom colors if provided, otherwise an empty object.
  this.opts.colors = options.colors || { } ;
  // Collision alpha setting for the force layout.
  this.opts.collisionAlpha = options.collisionAlpha || defaults.collisionAlpha ;
  // Initial zoom scale, if specified.
  this.opts.initialScale   = options.initialScale ;
  // Zoom scale extent, prioritizing options, then defaults.
  this.opts.zoomScaleExtent = options.zoomScaleExtent || options.scaleExtent
                              || defaults.zoomScaleExtent ;

  // Store the raw node and link data.
  this.args = {
      nodes: nodes
    , links: links
  } ;

  // Set up initial state attributes for the graph.
  this.resetState ( ) ;

  // If a tooltip configuration is provided, activate it.
  options.tooltip && this.tooltip ( options.tooltip ) ;

} // End of Graph constructor

// Define the version of the Graph library.
Graph.version = "0.12" ;

// Extend the Graph prototype with methods.
Graph.prototype = {

  // Ensure the constructor property points back to Graph.
  constructor: Graph,

  /**
   * Initializes the graph's rendering components and event listeners.
   *
   * This method sets up the D3 force layout, SVG elements,
   * and interaction handlers like zooming and clicking.
   *
   * @api public
   */
  init: function ( ) {
    var self = this ; // Cache 'this' for use in nested functions.
    var el   = this.getElement ( ) ; // Get the main DOM element.

    // Pre-process node and link data for rendering.
    this.compute ( this.args.nodes , this.args.links ) ;
    // Create D3 scales for node radius and title visibility.
    this.computeScales ( ) ;
    // Initialize D3's zoom behavior.
    this.initZoom ( ) ;

    // Clear any existing content within the main element.
    el.html ( "" ) ;

    // Append the main SVG element and configure it.
    var svg = el
      .attr ( "class" , BASE_ELEMENT_CLASS ) // Assign the base CSS class.
      .append ( "svg" ) // Add an SVG container.
        .attr ( "width" , this.opts.width ) // Set SVG width.
        .attr ( "height" , this.opts.height ) // Set SVG height.
        .attr ( "pointer-events" , "all" ) // Capture all pointer events.
        .call ( this._zoom
          .on ( "zoom" , bind ( this , this.onZoom ) ) // Attach zoom event handler.
          .scaleExtent ( this.opts.zoomScaleExtent ) ) ; // Set zoom limits.

    // Append a group element to hold all graph content, initially hidden.
    this.parent = svg.append ( 'svg:g' ) .style ( 'display' , 'none' ) ;

    // Variables to track mouse coordinates for click vs. drag detection.
    var clickedX , clickedY ;

    // Attach mousedown event listener to record initial click position.
    el.on ( "mousedown" , function ( ) {
      clickedX = d3.event.x ;
      clickedY = d3.event.y ;
    } ) ;

    // Attach click event listener to reset the graph view.
    el.on ( "click" , function ( ) {

        // If the mouse moved between mousedown and mouseup, it was a drag,
        // so we avoid resetting the view.
        if ( d3.event.x != clickedX || d3.event.y != clickedY ) {
          return ; // Do nothing if it was a drag.
        }

        self.reset ( ) ; // Reset the graph to its initial state.
      } ) ;

  } , // End of init method


  /**
   * Initializes the D3 zoom behavior for the graph.
   *
   * This method sets up the `d3.behavior.zoom` object
   * and applies an initial scale if specified in options.
   *
   * @api private
   */
  initZoom: function ( ) {
    this._zoom = d3.behavior.zoom ( ) ; // Create a new zoom behavior.

    if ( this.opts.initialScale ) {
      // If an initial scale is provided, apply it to the zoom behavior.
      this._zoom = this._zoom.scale ( this.opts.initialScale ) ;
    }
  } , // End of initZoom method

  /**
   * Processes raw node and link data to build structures
   * necessary for rendering and force simulation.
   *
   * This includes computing max node size, organizing nodes by ID,
   * identifying clusters, and building incoming/outgoing link maps.
   *
   * @api private
   * @param {Array} nodes Raw array of node data.
   * @param {Array} links Raw array of link data (source ID, target ID).
   */
  compute: function ( nodes , links ) {
    var self       = this
      , nodesObj   = { } // Maps node IDs to node objects.
      , clustersObj = { } // Stores cluster information (e.g., colors).
      , maxSize    = 0 // Tracks the maximum 'size' attribute among nodes.
      , maxWeight  = 0 // (Currently unused, but kept from original)
      , incoming   = { } // Stores incoming links for each node.
      , outgoing   = { } // Stores outgoing links for each node.
      , linksList  = [ ] // Processed links for D3 force layout.
      , getCluster = bind ( this , this.getCluster ) // Bound helper to get node cluster.
      , getSize    = bind ( this , this.getSize ) // Bound helper to get node size.
    ;

    // Iterate through all nodes to populate `nodesObj`, `clustersObj`, and `maxSize`.
    nodes.forEach ( function ( n ) {
      var cluster = getCluster ( n ) ; // Get the cluster ID for the current node.

      maxSize = Math.max ( maxSize , getSize ( n ) ) ; // Update max node size.
      nodesObj[ n.id ] = nodesObj[ n.id ] || n ; // Store node by ID if not already present.

      // If the node has a cluster and it's not yet initialized in `clustersObj`.
      if ( cluster != null && clustersObj[ cluster ] == null ) {

        // Attempt to get a custom color for this cluster from options.
        var color = self.opts.colors[ cluster ] ;

        // Initialize the cluster entry.
        clustersObj[ cluster ] = { } ;

        // Assign the obtained color (custom or D3 default).
        clustersObj[ cluster ] .color = color || self.opts.color ( cluster ) ;
      }
    } ) ;

    // Process all links to build `linksList`, `incoming`, and `outgoing` maps.
    links.forEach ( function ( link ) {

      // Extract source and target node IDs from the link array.
      var id0    = link[ 0 ]
        , id1    = link[ 1 ]
        , source = nodesObj[ id0 ] // Get source node object.
        , target = nodesObj[ id1 ] // Get target node object.
      ;

      // If either source or target node is not found, skip this link.
      if ( ! source || ! target ) {
        return ;
      }

      // Record outgoing link for the source node.
      if ( ! ( id0 in outgoing ) ) {
        outgoing[ id0 ] = { } ;
      }

      // Record incoming link for the target node.
      if ( ! ( id1 in incoming ) ) {
        incoming[ id1 ] = { } ;
      }

      outgoing[ id0 ][ id1 ] = true ; // Mark connection.
      incoming[ id1 ][ id0 ] = true ; // Mark connection.

      // Add the processed link object to `linksList`.
      linksList.push ( {
          source: source
        , target: target
      } ) ;
    } ) ;

    // Store the computed data on the instance.
    this.nodes       = nodes ;
    this.links       = linksList ;
    this.maxSize     = maxSize ;
    this.incoming    = incoming ;
    this.outgoing    = outgoing ;
    this.nodesObj    = nodesObj ;
    this.clustersObj = clustersObj ;
  } , // End of compute method

  /**
   * Creates D3 scales based on the computed `maxSize`.
   *
   * This method initializes `radiusScale` for node sizes
   * and `titleScale` for determining title visibility.
   *
   * @api private
   */
  computeScales: function ( ) {
    // Square root scale for node radius, mapping from 1 to maxSize to RADIUS_RANGE.
    this.radiusScale = d3.scale.sqrt ( ) .domain ( [ 1 , this.maxSize ] ) .range ( RADIUS_RANGE ) ;
    // Logarithmic scale for title visibility, mapping from 1 to maxSize to TITLE_RANGE.
    this.titleScale  = d3.scale.log ( ) .domain ( [ 1 , this.maxSize ] ) .range ( TITLE_RANGE ) ;
  } , // End of computeScales method

  /**
   * Calculates the mass center coordinates of the graph based on node positions and sizes.
   *
   * This method iterates over all D3-managed nodes (`d3Nodes`)
   * to compute a weighted average of their x and y coordinates.
   *
   * @api private
   */
  computeCenterCoords: function ( ) {
    var self      = this ;
    var xMass     = 0
      , yMass     = 0
      , totalSize = 0
    ;

    // Iterate over each node managed by D3's force layout.
    this.d3Nodes.each ( function ( d ) {
      var size = self.getSize ( d ) ; // Get the size of the current node.
      xMass     += d.x * size ; // Accumulate weighted x-coordinate.
      yMass     += d.y * size ; // Accumulate weighted y-coordinate.
      totalSize += size ; // Accumulate total size.
    } ) ;

    // Calculate the center of mass.
    this.xCenter    = xMass / totalSize ;
    this.yCenter    = yMass / totalSize ;
    this.massCenter = [ this.xCenter , this.yCenter ] ; // Store as an array.
  } , // End of computeCenterCoords method


  /**
   * Configures how a specific attribute key's value should be extracted from a node.
   *
   * This method allows defining custom functions for `VALID_ATTRS` keys,
   * which will be used by `nodeVal` to retrieve node properties.
   *
   * @api private
   * @param {string}   key The attribute key (e.g., 'size', 'text').
   * @param {Function} fn  A function that takes a node object and returns the attribute's value.
   * @returns {Graph} The current Graph instance for chaining.
   */
  attr: function ( key , fn ) {

    // Only allow setting custom functions for predefined valid attributes.
    if ( ~ VALID_ATTRS.indexOf ( key ) ) {
      this.attrs[ key ] = fn ;
    }

    return this ; // Enable method chaining.
  } , // End of attr method

  /**
   * Retrieves the value of a specific attribute for a given node.
   *
   * This method uses either a custom function defined via `attr()`
   * or directly accesses the node's property if no custom function exists.
   *
   * @api private
   * @param {string} key  The attribute key to retrieve.
   * @param {Object} node The node object.
   * @returns {*} The value of the specified attribute for the node, or undefined.
   */
  nodeVal: function ( key , node ) {
    var val = this.attrs[ key ] ; // Check for a custom attribute function.

    if ( val == null ) {
      return node[ key ] ; // If no custom function, return node's direct property.
    } else if ( typeof val === "function" ) {
      return val ( node ) ; // If it's a function, call it with the node.
    }

    return ; // Return undefined if attribute is not found or invalid.
  } , // End of nodeVal method

  /**
   * Event handler for D3 zoom events.
   *
   * When a zoom event occurs, this method triggers a refresh
   * of the graph's visual state to reflect the new zoom level.
   *
   * @api private
   */
  onZoom: function ( ) {
    this.refreshZoom ( ) ; // Update the view based on the current zoom state.
  } , // End of onZoom method

  /**
   * Refreshes the visual transformation (translate and scale) of the graph.
   *
   * This method applies the current zoom and pan state to the main
   * graph group element, optionally with an animation.
   *
   * @api private
   * @param {boolean} animate If true, the transformation will be animated.
   */
  refreshZoom: function ( animate ) {
    var zoom  = this._zoom
      , trans = this.getTranslation ( ) // Get current translation from zoom behavior.
      , scale = this.getScale ( ) // Get current scale from zoom behavior.
    ;

    if ( animate ) {
      // Animate the transformation over 500ms.
      this.parent.transition ( ) .duration ( 500 ) .attr ( 'transform' ,
        'translate(' + zoom.translate ( ) + ') scale(' + zoom.scale ( ) + ')' ) ;
    } else {
      // Apply transformation immediately without animation.
      this.parent.attr ( "transform" , "translate(" + trans + ")" + " scale(" + scale + ")" ) ;
    }

    this.updateTitles ( ) ; // Update the visibility of node titles based on new scale.
  } , // End of refreshZoom method

  /**
   * Applies a specific zoom scale to the graph.
   *
   * If the graph is not yet rendered, the scale is stored
   * to be applied during the `render()` process.
   *
   * @api public
   * @param {number} scale The desired zoom scale (e.g., 0.5, 1.0, 2.0).
   * @returns {Graph} The current Graph instance for chaining.
   */
  zoom: function ( scale ) {
    var zoom , point , loc ;

    if ( ! this.isRendered ( ) ) {
      // If graph isn't rendered yet, store the scale for later and exit.
      this.opts.initialScale = scale ;
      return this ;
    }

    zoom  = this._zoom ;
    point = [ this.opts.width / 2 , this.opts.height / 2 ] ; // Center of the view.
    loc   = this.location ( point ) ; // Graph coordinates at the center of the view.

    // Apply the new scale to the D3 zoom behavior.
    zoom.scale ( scale ) ;

    // Adjust translation to keep the graph centered after scaling.
    this.translateTo ( point , loc ) ;

    // Apply the new zoom and translation to the view with animation.
    this.refreshZoom ( true ) ;

    return this ; // Enable method chaining.
  } , // End of zoom method

  /**
   * Increases the zoom level of the graph.
   *
   * This method calculates the next higher power-of-2 scale
   * within the defined `zoomScaleExtent` and applies it.
   *
   * @api public
   * @returns {Graph} The current Graph instance for chaining.
   */
  zoomIn: function ( ) {
    var scale = this.getScale ( ) ; // Get the current scale.
    // Calculate the next higher power of 2 for zooming in.
    var k     = Math.pow ( 2 , Math.floor ( Math.log ( scale ) / Math.LN2 ) + 1 ) ;

    // Ensure the new scale does not exceed the maximum allowed zoom.
    k = Math.min ( k , this.opts.zoomScaleExtent[ 1 ] ) ;

    return this.zoom ( k ) ; // Apply the calculated zoom.
  } , // End of zoomIn method

  /**
   * Decreases the zoom level of the graph.
   *
   * This method calculates the next lower power-of-2 scale
   * within the defined `zoomScaleExtent` and applies it.
   *
   * @api public
   * @returns {Graph} The current Graph instance for chaining.
   */
  zoomOut: function ( ) {
    var scale = this.getScale ( ) ; // Get the current scale.
    // Calculate the next lower power of 2 for zooming out.
    var k     = Math.pow ( 2 , Math.ceil ( Math.log ( scale ) / Math.LN2 ) - 1 ) ;

    // Ensure the new scale does not go below the minimum allowed zoom.
    k = Math.max ( k , this.opts.zoomScaleExtent[ 0 ] ) ;

    return this.zoom ( k ) ; // Apply the calculated zoom.
  } , // End of zoomOut method

  /**
   * Determines if a node's title should be displayed based on
   * the current zoom level and the node's size.
   *
   * Larger nodes and higher zoom levels make titles displayable.
   *
   * @api private
   * @param {Object} d The node data object.
   * @returns {boolean} True if the title should be displayed, false otherwise.
   */
  isTitleDisplayable: function ( d ) {
    var scale = this.getScale ( ) ; // Current zoom scale.
    var res   = this.titleScale ( this.getSize ( d ) || 1 ) ; // Scaled title visibility threshold.

    // Title is displayable if scaled result is above 0.8 or zoom is high enough.
    return ( scale * res > .8 || scale > 2.2 ) ;
  } , // End of isTitleDisplayable method

  /**
   * Returns the CSS `display` attribute value for a node's title.
   *
   * It returns an empty string (meaning 'display') if the title
   * is displayable and the node is visible, otherwise 'none'.
   *
   * @api private
   * @param {Object} d The node data object.
   * @returns {string} CSS display value ('', 'none').
   */
  titleDisplay: function ( d ) {
    if ( this.isTitleDisplayable ( d ) && this.isNodeVisible ( d ) ) {
      return "" ; // Show title.
    }

    return "none" ; // Hide title.
  } , // End of titleDisplay method

  /**
   * Determines the stroke color for a link (path) based on its connected nodes.
   *
   * The link's color is derived from the cluster color of the larger node
   * (or target if sizes are equal).
   *
   * @api private
   * @param {Object} d The link data object (containing source and target nodes).
   * @returns {string} The CSS color string for the path's stroke.
   */
  pathStroke: function ( d ) {
    var source = d.source
      , target = d.target
    ;

    // If target node is larger than source, use target's cluster color.
    if ( this.getSize ( target ) > this.getSize ( source ) ) {
      return this.getClusterColor ( target ) ;
    } else {
      // Otherwise, use source's cluster color.
      return this.getClusterColor ( source ) ;
    }
  } , // End of pathStroke method

  /**
   * Renders the graph elements (nodes, links, titles) onto the SVG canvas.
   *
   * This method orchestrates the D3 force layout, appends SVG elements,
   * attaches event listeners, and initiates the simulation.
   *
   * @api public
   * @returns {Graph} The current Graph instance for chaining.
   */
  render: function ( ) {
    var self = this ; // Cache 'this' for use in nested functions.

    this.init ( ) ; // Perform initial setup tasks.

    // Helper function to determine circle radius based on node size.
    function circleRadius ( d ) {
      return self.radiusScale ( self.getSize ( d ) || 1 ) ;
    }

    // Initialize D3 force layout.
    var force = this.force = d3.layout.force ( )
      .nodes ( this.nodes ) // Bind node data.
      .links ( this.links ) // Bind link data.
      .size ( [ this.opts.width , this.opts.height ] ) // Set simulation area size.
      .linkDistance ( defaults.linkDistance ) // Set default link distance.
      .charge ( defaults.graphCharge ) // Set default charge strength.
      .gravity ( defaults.gravity ) // Set default gravity strength.
      .on ( "tick" , tick ) // Attach tick event handler.
      .start ( ) ; // Start the force simulation.

    // Create graph paths (links).
    this.d3Path = this.parent.append ( "svg:g" ) .selectAll ( "path" )
      .data ( force.links ( ) ) // Bind link data.
      .enter ( ) .append ( "svg:path" ) // Append a path for each link.
      .attr ( "stroke" , bind ( this , this.pathStroke ) ) // Set stroke color.
      .attr ( "stroke-width" , PATH_STROKE_WIDTH ) // Set stroke width.
      .attr ( "fill" , "none" ) ; // No fill for paths.

    // Create graph nodes (circles and text).
    var node = this.d3Nodes = this.parent.selectAll ( ".node" )
      .data ( force.nodes ( ) ) // Bind node data.
      .enter ( ) .append ( "g" ) // Append a group for each node.
      .attr ( "class" , "node" ) // Assign CSS class.
      .on ( "mouseover" , bind ( this , this.onMouseOver ) ) // Mouseover event.
      .on ( "mouseout" , bind ( this , this.onMouseOut ) ) // Mouseout event.
      .on ( "click" , bind ( this , this.onCircleClick ) ) ; // Click event.

    // Append circles to each node group.
    this.d3Circles = node.append ( "circle" )
      .style ( "fill" , bind ( this , this.getClusterColor ) ) // Set fill color based on cluster.
      .attr ( "r" , circleRadius ) ; // Set radius based on node size.

    // Append text labels (titles) to each node group.
    this.d3TitleNodes = node.append ( "text" )
      .attr ( "text-anchor" , "middle" ) // Center text horizontally.
      .attr ( "dy" , ".35em" ) // Vertically align text.
      .style ( "display" , "none" ) // Initially hide titles.
      .text ( function ( d ) { return self.getText ( d ) ; } ) ; // Set text content.

    // Tick function for the force simulation.
    function tick ( e ) {
      // var progress = Math.round((1 - (e.alpha * 10 - 0.1)) * 100); // Debugging progress.

      // Stop simulation once alpha drops below a threshold.
      if ( force.alpha ( ) < defaults.forceAlphaLimit ) {
        self.handleCollisions ( ) ; // Resolve node collisions.

        // Stop the force layout to prevent further movement.
        force.stop ( ) ;

        self.updateNodesPosition ( ) ; // Update node positions on SVG.
        self.updateLinksPosition ( ) ; // Update link positions on SVG.

        // Center the entire graph view.
        self._center ( ) ;

        // Make the graph visible after rendering is complete.
        self.show ( ) ;

        self.refreshZoom ( ) ; // Apply final zoom state.
        self.emit ( "rendered" ) ; // Emit a 'rendered' event.
      }
    }

    // If there are unapplied filters or focus states, update the graph.
    if ( this.hasUnappliedFilters ( ) || this.hasUnappliedFocus ( ) ) {
      this.update ( ) ;
    }

    return this ; // Enable method chaining.
  } , // End of render method

  /**
   * Makes the graph visible by changing the display style of its parent group.
   *
   * @api private
   */
  show: function ( ) {
    // ... (rest of the show method content)
  }
};