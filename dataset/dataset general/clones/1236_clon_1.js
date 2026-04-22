/* packer version */

// *************************************************************
//   LiteGraph CLASS                                     *******
// *************************************************************

/**
 * The Global Scope. It contains all the registered node classes.
 * This object serves as the main entry point for managing node types
 * within the LiteGraph framework.
 *
 * @class LiteGraph
 * @constructor
 */

var LiteGraph =
{
	// Define constants for node dimensions and styling
	NODE_TITLE_HEIGHT: 16, // Height of the node's title bar
	NODE_SLOT_HEIGHT: 15,  // Height allocated for each input/output slot
	NODE_WIDTH: 140,       // Default width of a node
	NODE_MIN_WIDTH: 50,    // Minimum allowed width for a node
	NODE_COLLAPSED_RADIUS: 10, // Radius for collapsed node representation
	NODE_COLLAPSED_WIDTH: 80,  // Width for collapsed node representation
	CANVAS_GRID_SIZE: 10,      // Size of the grid cells on the canvas

	// Default colors for node elements
	NODE_TITLE_COLOR: "#222",
	NODE_DEFAULT_COLOR: "#999",
	NODE_DEFAULT_BGCOLOR: "#444",
	NODE_DEFAULT_BOXCOLOR: "#AEF",

	NODE_DEFAULT_SHAPE: "box", // Default visual shape of a node

	MAX_NUMBER_OF_NODES: 1000, // Safety limit to prevent infinite loops in graph processing

	DEFAULT_POSITION: [100, 100], // Default coordinates for newly created nodes

	node_images_path: "", // Base path for node-related images

	proxy: null, // Placeholder for a proxy object, used for redirection

	debug: false,      // Flag to enable/disable debug logging
	throw_errors: true, // If true, errors will be thrown; otherwise, they are logged

	/* Stores all registered node types, keyed by their full type string */
	registered_node_types: {},

	/**
	 * Registers a node class, making it available for creation and listing in the UI.
	 * This method associates a string 'type' with a JavaScript class.
	 *
	 * @method registerNodeType
	 * @param {String} type The full name of the node, often including its category (e.g., "math/add").
	 * @param {Class} base_class The JavaScript class definition for the node.
	 */

	registerNodeType: function( type, base_class )
	{
		// Ensure the provided base_class is indeed a class with a prototype
		if ( !base_class.prototype )
			throw ( "Cannot register a simple object, it must be a class with a prototype" );
		
		// Assign the type string directly to the class for easy access
		base_class.type = type;

		if ( LiteGraph.debug )
			console.log( "Node registered: " + type );

		// Extract category information from the type string
		var categories = type.split( "/" );

		var pos = type.lastIndexOf( "/" );
		base_class.category = type.substr( 0, pos );
		// info.name = name.substr(pos+1,name.length - pos); // Not used currently

		// Extend the class with LGraphNode prototype methods if it's a class
		if ( base_class.prototype ) // Check if it's a class
		{
			for ( var i in LGraphNode.prototype )
				if ( !base_class.prototype[i] )
					base_class.prototype[i] = LGraphNode.prototype[i];
		}
		
		// Store the class in the registry
		this.registered_node_types[ type ] = base_class;
	},

	/**
	 * Creates a new node instance of a specified type. The node is not yet
	 * added to any graph.
	 *
	 * @method createNode
	 * @param {String} type The full type name of the node class (e.g., "math/sin").
	 * @param {String} name An optional title for the new node.
	 * @param {Object} options An object containing initial properties for the node.
	 * @return {LGraphNode|null} The newly created node object, or null if type is not registered.
	 */

	createNode: function(type, title, options)
	{
		var base_class = this.registered_node_types[ type ];
		if ( !base_class )
		{
			if ( LiteGraph.debug )
				console.log( "GraphNode type \"" + type + "\" not registered." );
			return null; // Return null if the node type doesn't exist
		}

		var prototype = base_class.prototype || base_class; // Get the prototype or the class itself

		// Determine the node's title
		title = title || base_class.title || type;

		// Instantiate the node
		var node = new base_class( name );

		node.type = type; // Set the node's type
		if ( !node.title ) node.title = title; // Assign title if not already set
		if ( !node.properties ) node.properties = {}; // Initialize properties if missing
		if ( !node.flags ) node.flags = {};     // Initialize flags if missing
		if ( !node.size ) node.size = node.computeSize(); // Compute default size
		if ( !node.pos ) node.pos = LiteGraph.DEFAULT_POSITION.concat(); // Set default position

		// Apply additional options provided
		if ( options )
		{
			for ( var i in options )
				node[i] = options[i];								
		}

		return node; // Return the fully initialized node
	},

	/**
	 * Retrieves a registered node type by its full name.
	 *
	 * @method getNodeType
	 * @param {String} type The full name of the node class (e.g., "math/sin").
	 * @return {Class|undefined} The node class, or undefined if not found.
	 */

	getNodeType: function(type)
	{
		return this.registered_node_types[ type ];
	},


	/**
	 * Returns a list of node types that belong to a specific category.
	 * If `category` is an empty string, it returns nodes without a category.
	 *
	 * @method getNodeTypesInCategory
	 * @param {String} category The category name to filter by.
	 * @return {Array<Class>} An array of node classes matching the category.
	 */

	getNodeTypesInCategory: function(category)
	{
		var r = []; // Result array
		for ( var i in this.registered_node_types )
		{
			// Handle nodes explicitly without a category
			if ( category == "" )
			{
				if ( this.registered_node_types[i].category == null )
					r.push( this.registered_node_types[i] );
			}
			// Match nodes by category string
			else if ( this.registered_node_types[i].category == category )
			{
				r.push( this.registered_node_types[i] );
			}
		}

		return r;
	},

	/**
	 * Retrieves a list of all unique node type categories currently registered.
	 * Useful for building category menus or filters.
	 *
	 * @method getNodeTypesCategories
	 * @return {Array<String>} An array of category names.
	 */

	getNodeTypesCategories: function()
	{
		var categories = { "": 1 }; // Start with an empty category
		for ( var i in this.registered_node_types )
			// Add category if it exists and is not marked to be skipped from the list
			if ( this.registered_node_types[i].category && !this.registered_node_types[i].skip_list )
				categories[ this.registered_node_types[i].category ] = 1;

		var result = [];
		for ( var i in categories )
			result.push( i ); // Populate the result array

		return result;
	},

	/**
	 * Reloads JavaScript files matching a given wildcard pattern.
	 * This is primarily for debugging and development purposes to hot-reload node definitions.
	 *
	 * @method reloadNodes
	 * @param {String} folder_wildcard A wildcard string to match script URLs.
	 */
	reloadNodes: function ( folder_wildcard )
	{
		var tmp = document.getElementsByTagName( "script" );
		// The HTMLCollection is live, so we make a copy to avoid issues during modification
		var script_files = [];
		for ( var i in tmp )
			script_files.push( tmp[i] );


		var docHeadObj = document.getElementsByTagName( "head" )[0];
		folder_wildcard = document.location.href + folder_wildcard; // Resolve wildcard against current URL

		for ( var i in script_files )
		{
			var src = script_files[i].src;
			// Skip scripts that don't have a src or don't match the wildcard
			if ( !src || src.substr( 0, folder_wildcard.length ) != folder_wildcard )
				continue;

			try
			{
				if ( LiteGraph.debug )
					console.log( "Reloading: " + src );
				
				// Create a new script element and append it to the head
				var dynamicScript = document.createElement( "script" );
				dynamicScript.type = "text/javascript";
				dynamicScript.src = src;
				docHeadObj.appendChild( dynamicScript );
				
				// Remove the old script element
				docHeadObj.removeChild( script_files[i] );
			}
			catch ( err )
			{
				if ( LiteGraph.throw_errors )
					throw err; // Re-throw if error throwing is enabled
				if ( LiteGraph.debug )
					console.log( "Error while reloading " + src );
			}
		}

		if ( LiteGraph.debug )
			console.log( "Nodes reloaded" );
	},
	
	/**
	 * Creates a deep clone of an object using JSON serialization.
	 * Optionally copies the cloned properties to a target object.
	 * This method is separated to allow for future improvements or alternative cloning strategies.
	 *
	 * @method cloneObject
	 * @param {Object} obj The object to clone.
	 * @param {Object} [target] An optional target object to copy properties into.
	 * @return {Object|null} The cloned object, or null if the input was null.
	 */
	cloneObject: function(obj, target)
	{
		if ( obj == null ) return null; // Handle null input

		var r = JSON.parse( JSON.stringify( obj ) ); // Deep clone using JSON
		if ( !target ) return r; // If no target, just return the clone

		// Copy properties to the target object if provided
		for ( var i in r )
			target[i] = r[i];
		return target;
	}
};

// Set up a high-resolution timer function based on browser support
if ( typeof( performance ) != "undefined" )
  LiteGraph.getTime = function getTime() { return performance.now(); } // Use performance.now for better precision
else
  LiteGraph.getTime = function getTime() { return Date.now(); } // Fallback to Date.now for older environments




/*
 *********************************************************************************
 * LGraph CLASS                                  
 *********************************************************************************
 */

/**
 * LGraph is the core class that encapsulates an entire graph structure.
 * It manages nodes, links, execution flow, and timing.
 *
 * @class LGraph
 * @constructor
 */

function LGraph()
{
	if ( LiteGraph.debug )
		console.log( "Graph created" );
	
	this.list_of_graphcanvas = null; // List of LGraphCanvas instances attached to this graph
	this.clear(); // Initialize the graph to a clean state
}

// Define default supported types for connections
LGraph.supported_types = ["number", "string", "boolean"];

/**
 * Returns the types of connections supported by this specific graph instance.
 *
 * @method getSupportedTypes
 * @return {Array<String>} An array of supported type strings.
 */
LGraph.prototype.getSupportedTypes = function() {
	return this.supported_types || LGraph.supported_types; // Use instance-specific types or global defaults
}

// Define graph status constants
LGraph.STATUS_STOPPED = 1; // Graph is not running
LGraph.STATUS_RUNNING = 2; // Graph is actively running

/**
 * Removes all nodes and links from this graph, resetting it to an empty state.
 *
 * @method clear
 */

LGraph.prototype.clear = function()
{
	this.stop(); // Ensure the graph is stopped before clearing
	this.status = LGraph.STATUS_STOPPED; // Set status to stopped
	this.last_node_id = 0; // Reset node ID counter

	// Reset node storage
	this._nodes = [];         // Array of nodes
	this._nodes_by_id = {};   // Map of nodes by ID

	// Reset link storage
	this.last_link_id = 0; // Reset link ID counter
	this.links = {};       // Container for all links, keyed by ID

	// Reset iteration counter
	this.iteration = 0;

	// Graph configuration object
	this.config = {};

	// Timing variables
	this.globaltime = 0;          // Total time elapsed since graph start
	this.runningtime = 0;         // Time spent in active execution
	this.fixedtime =  0;          // Fixed time counter for fixed timestep updates
	this.fixedtime_lapse = 0.01;  // Interval for fixed time steps (in seconds)
	this.elapsed_time = 0.01;     // Time elapsed in the last execution step
	this.starttime = 0;           // Timestamp when the graph started

	// Global inputs/outputs (for graph-level interaction)
	this.global_inputs = {};
	this.global_outputs = {};

	// this.graph = {}; // Unused property?

	this.debug = true; // Enable debug mode for this graph instance

	this.change(); // Notify listeners that the graph has changed

	this.sendActionToCanvas( "clear" ); // Inform attached canvases to clear their view
}

/**
 * Attaches a LGraphCanvas instance to this graph, allowing it to visualize and interact.
 *
 * @method attachCanvas
 * @param {LGraphCanvas} graphcanvas The LGraphCanvas instance to attach.
 * @throws {Error} If the provided argument is not an LGraphCanvas instance.
 */

LGraph.prototype.attachCanvas = function( graphcanvas )
{
	if ( graphcanvas.constructor != LGraphCanvas )
		throw ( "attachCanvas expects a LGraphCanvas instance" );
	
	// If the canvas is already attached to another graph, detach it first
	if ( graphcanvas.graph && graphcanvas.graph != this )
		graphcanvas.graph.detachCanvas( graphcanvas );

	graphcanvas.graph = this; // Assign this graph to the canvas
	
	// Initialize list if it doesn't exist
	if ( !this.list_of_graphcanvas )
		this.list_of_graphcanvas = [];
	
	this.list_of_graphcanvas.push( graphcanvas ); // Add canvas to the list
}

/**
 * Detaches a LGraphCanvas instance from this graph.
 *
 * @method detachCanvas
 * @param {LGraphCanvas} graphcanvas The LGraphCanvas instance to detach.
 */

LGraph.prototype.detachCanvas = function( graphcanvas )
{
	var pos = this.list_of_graphcanvas.indexOf( graphcanvas );
	if ( pos == -1 ) return; // If not found, do nothing
	
	graphcanvas.graph = null; // Clear the graph reference from the canvas
	this.list_of_graphcanvas.splice( pos, 1 ); // Remove canvas from the list
}

/**
 * Starts the continuous execution loop of this graph.
 * The graph will run `runStep` at the specified interval.
 *
 * @method start
 * @param {number} [interval=1] The time in milliseconds between each execution step.
 */

LGraph.prototype.start = function( interval )
{
	if ( this.status == LGraph.STATUS_RUNNING ) return; // Already running
	
	this.status = LGraph.STATUS_RUNNING; // Set status to running

	if ( this.onPlayEvent )
		this.onPlayEvent(); // Trigger play event if handler exists

	this.sendEventToAllNodes( "onStart" ); // Notify all nodes of graph start

	this.starttime = LiteGraph.getTime(); // Record start time
	interval = interval || 1;             // Default interval is 1ms
	
	var that = this;	

	// Set up the execution timer
	this.execution_timer_id = setInterval( function() { 
		that.runStep( 1 ); // Execute one step
	}, interval );
}

/**
 * Stops the execution loop of the graph.
 *
 * @method stop
 */

LGraph.prototype.stop = function()
{
	if ( this.status == LGraph.STATUS_STOPPED )
		return; // Already stopped

	this.status = LGraph.STATUS_STOPPED; // Set status to stopped

	if ( this.onStopEvent )
		this.onStopEvent(); // Trigger stop event if handler exists

	if ( this.execution_timer_id != null )
		clearInterval( this.execution_timer_id ); // Clear the interval timer
	this.execution_timer_id = null;

	this.sendEventToAllNodes( "onStop" ); // Notify all nodes of graph stop
}

/**
 * Executes a specified number of steps (cycles) of the graph.
 * This method advances the graph's internal state and executes node logic.
 *
 * @method runStep
 * @param {number} [num=1] The number of steps to run.
 */

LGraph.prototype.runStep = function(num)
{
	num = num || 1; // Default to 1 step

	var start = LiteGraph.getTime(); // Record start time for this step
	this.globaltime = 0.001 * ( start - this.starttime ); // Update global time

	try
	{
		for ( var i = 0; i < num; i++ )
		{
			this.sendEventToAllNodes( "onExecute" ); // Trigger onExecute for all nodes
			this.fixedtime += this.fixedtime_lapse; // Advance fixed time
			if ( this.onExecuteStep )
				this.onExecuteStep(); // Custom handler for each step
		}

		if ( this.onAfterExecute )
			this.onAfterExecute(); // Custom handler after all steps
		
		this.errors_in_execution = false; // Clear error flag
	}
	catch ( err )
	{
		this.errors_in_execution = true; // Set error flag
		if ( LiteGraph.throw_errors )
			throw err; // Re-throw if enabled
		if ( LiteGraph.debug )
			console.log( "Error during execution: " + err );
		this.stop(); // Stop the graph on error
	}

	var elapsed = LiteGraph.getTime() - start; // Time taken for this step
	if ( elapsed == 0 ) elapsed = 1; // Avoid division by zero
	
	this.elapsed_time = 0.001 * elapsed; // Convert to seconds
	this.globaltime += 0.001 * elapsed;  // Add elapsed time to global time
	this.iteration += 1;                 // Increment iteration count
}

/**
 * Updates the internal execution order of nodes in the graph.
 * This recomputes the topological sort, which is crucial for correct data flow.
 *
 * @method updateExecutionOrder
 */
	
LGraph.prototype.updateExecutionOrder = function()
{
	this._nodes_in_order = this.computeExecutionOrder(); // Store the computed order
}

/**
 * Computes the execution order of nodes using a topological sort algorithm.
 * Nodes with no inputs are processed first, then nodes whose inputs are satisfied.
 *
 * @method computeExecutionOrder
 * @private
 * @return {Array<LGraphNode>} An array of nodes in their computed execution order.
 */
LGraph.prototype.computeExecutionOrder = function()
{
	var L = []; // List of nodes in sorted order
	var S = []; // Set of nodes with no incoming edges (starting nodes)
	var M = {}; // Map of all nodes by ID, used to track pending nodes

	var visited_links = {};    // To avoid processing the same link multiple times
	var remaining_links = {};  // Counts remaining input links for each node
	
	// First pass: Identify starting nodes (no inputs) and count input links for others
	for ( var i in this._nodes )
	{
		var n = this._nodes[i];
		M[n.id] = n; // Add node to the map of pending nodes

		var num = 0; // Counter for input connections
		if ( n.inputs )
			for ( var j = 0, l = n.inputs.length; j < l; j++ )
				if ( n.inputs[j] && n.inputs[j].link != null )
					num += 1;

		if ( num == 0 ) // If no input connections, it's a starting node
			S.push( n );
		else // Otherwise, store the count of its input links
			remaining_links[n.id] = num;
	}

	// Main loop for topological sort
	while ( true )
	{
		if ( S.length == 0 )
			break; // No more starting nodes, sorting complete

		var n = S.shift(); // Get a node from the starting set
		L.push( n );       // Add it to the ordered list
		delete M[n.id];    // Remove from pending nodes map
		
		// For every output of the current node 'n'
		if ( n.outputs )
			for ( var i = 0; i < n.outputs.length; i++ )
			{
				var output = n.outputs[i];
				// Skip if output is not connected
				if ( output == null || output.links == null || output.links.length == 0 )
					continue;

				// For every link connected to this output
				for ( var j = 0; j < output.links.length; j++ )
				{
					var link_id = output.links[j];
					var link = this.links[link_id];
					if ( !link ) continue; // Skip if link doesn't exist

					// If this link has already been visited, skip it
					if ( visited_links[ link.id ] )
						continue;

					var target_node = this.getNodeById( link.target_id );
					if ( target_node == null )
					{
						visited_links[ link.id ] = true; // Mark as visited even if target is missing
						continue;
					}
					
					// Decrement the count of remaining input links for the target node
					remaining_links[ target_node.id ]--;

					// If the target node now has no remaining input links, add it to the starting set
					if ( remaining_links[ target_node.id ] == 0 )
						S.push( target_node );
					
					// Mark the link as visited
					visited_links[ link.id ] = true;
				}
			}
	}

	return L; // Return the topologically sorted list of nodes
}