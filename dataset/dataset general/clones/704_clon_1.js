/*
 * Springy v1.0.1
 *
 * This JavaScript file is part of the Springy project.
 * Copyright (c) 2010 Dennis Hotson. All rights reserved.
 *
 * License information:
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Define the Graph data structure
var Graph = function() {
	this.nodeSet = {}; // Stores nodes by their unique ID
	this.nodes = [];   // An array of all nodes in the graph
	this.edges = [];   // An array of all edges in the graph

	this.adjacency = {}; // Adjacency list representation for quick lookup

	this.nextNodeId = 0; // Counter for assigning unique node IDs
	this.nextEdgeId = 0; // Counter for assigning unique edge IDs

	this.eventListeners = []; // List of objects listening for graph changes
};


// Define the Node class
var Node = function(id, data) {
	this.id = id; // Unique identifier for the node
	// Node-specific data, initialized to an empty object if not provided
	this.data = typeof(data) !== 'undefined' ? data : {};
};


// Define the Edge class
var Edge = function(id, source, target, data) {
	this.id = id; // Unique identifier for the edge
	this.source = source; // The source node of the edge
	this.target = target; // The target node of the edge
	// Edge-specific data, initialized to an empty object if not provided
	this.data = typeof(data) !== 'undefined' ? data : {};
};


// Method to add a node to the graph
Graph.prototype.addNode = function(node) {
	// Check if the node with this ID already exists in the nodeSet
	if ( typeof(this.nodeSet[node.id]) === 'undefined' ) {
		this.nodes.push(node); // Add node to the main nodes array if it's new
	}

	this.nodeSet[node.id] = node; // Store node in the nodeSet for quick access

	this.notify(); // Notify listeners about graph changes
	return node;   // Return the added node
};


// Method to add an edge to the graph
Graph.prototype.addEdge = function(edge) {
	var exists = false; // Flag to check if the edge already exists

	// Iterate through existing edges to prevent duplicates
	this.edges.forEach(function(e) {
		if ( edge.id === e.id ) {
			exists = true; // Mark as existing if ID matches
		}
	});

	// If the edge does not exist, add it to the main edges array
	if ( !exists ) {
		this.edges.push(edge);
	}

	// Ensure source node's adjacency entry exists
	if ( typeof(this.adjacency[edge.source.id]) === 'undefined' ) {
		this.adjacency[edge.source.id] = {};
	}
	// Ensure target node's adjacency entry under source node exists
	if ( typeof(this.adjacency[edge.source.id][edge.target.id]) === 'undefined' ) {
		this.adjacency[edge.source.id][edge.target.id] = [];
	}

	exists = false; // Reset existence flag for adjacency check

	// Check if this specific edge is already in the adjacency list
	this.adjacency[edge.source.id][edge.target.id].forEach(function(e) {
		if ( edge.id === e.id ) {
			exists = true; // Mark as existing if ID matches
		}
	});

	// If the edge is not in the adjacency list, add it
	if ( !exists ) {
		this.adjacency[edge.source.id][edge.target.id].push(edge);
	}

	this.notify(); // Notify listeners of the change
	return edge;   // Return the added edge
};


// Creates a new node with an auto-incremented ID and adds it to the graph
Graph.prototype.newNode = function(data) {
	var node = new Node(this.nextNodeId++, data); // Create new node instance
	this.addNode(node); // Add the new node to the graph
	return node;        // Return the newly created node
};


// Creates a new edge with an auto-incremented ID between source and target nodes
Graph.prototype.newEdge = function(source, target, data) {
	var edge = new Edge(this.nextEdgeId++, source, target, data); // Create new edge instance
	this.addEdge(edge); // Add the new edge to the graph
	return edge;        // Return the newly created edge
};


// Finds and returns all edges between two specific nodes
Graph.prototype.getEdges = function(node1, node2) {
	// Check if adjacency entries for both nodes exist
	if ( typeof(this.adjacency[node1.id]) !== 'undefined' &&
		typeof(this.adjacency[node1.id][node2.id]) !== 'undefined' ) {
		return this.adjacency[node1.id][node2.id]; // Return the list of edges
	}

	return []; // Return an empty array if no edges are found
};


// Removes a node and all its associated edges from the graph
Graph.prototype.removeNode = function(node) {
	// Remove node from nodeSet if it exists
	if ( typeof(this.nodeSet[node.id]) !== 'undefined' ) {
		delete this.nodeSet[node.id];
	}

	// Remove node from the main nodes array
	for ( var i = this.nodes.length - 1; i >= 0; i-- ) {
		if ( this.nodes[i].id === node.id ) {
			this.nodes.splice(i, 1); // Remove the node at index i
		}
	}

	this.detachNode(node); // Detach all edges connected to this node
	// The notify call is done within detachNode
};


// Removes all edges connected to a given node
Graph.prototype.detachNode = function(node) {
	// Create a shallow copy of edges to safely iterate and modify the original array
	var tmpEdges = this.edges.slice();

	tmpEdges.forEach(function(e) {
		// If the edge's source or target is the node being detached, remove it
		if ( e.source.id === node.id || e.target.id === node.id ) {
			this.removeEdge(e);
		}
	}, this); // 'this' context for the callback

	this.notify(); // Notify listeners after all relevant edges have been removed
};


// Removes a specific edge from the graph
Graph.prototype.removeEdge = function(edge) {
	// Remove the edge from the main edges array
	for ( var i = this.edges.length - 1; i >= 0; i-- ) {
		if ( this.edges[i].id === edge.id ) {
			this.edges.splice(i, 1); // Remove the edge at index i
		}
	}

	// Remove the edge from the adjacency list
	for ( var x in this.adjacency ) { // Iterate through source nodes
		for ( var y in this.adjacency[x] ) { // Iterate through target nodes for each source
			var edges = this.adjacency[x][y]; // Get array of edges between x and y

			for ( var j = edges.length - 1; j >= 0; j-- ) {
				if ( this.adjacency[x][y][j].id === edge.id ) {
					this.adjacency[x][y].splice(j, 1); // Remove the edge from the adjacency list
				}
			}
		}
	}

	this.notify(); // Notify listeners of the change
};


/*
 * Merges a list of nodes and edges from an external data object into the current graph.
 *
 * Example data structure for merging:
 * var o = {
 * 	nodes: [
 * 		{id: 123, data: {type: 'user', userid: 123, displayname: 'aaa'}},
 * 		{id: 234, data: {type: 'user', userid: 234, displayname: 'bbb'}}
 * 	],
 * 	edges: [
 * 		{from: 0, to: 1, type: 'submitted_design', directed: true, data: {weight: 1}}
 * 	]
 * }
 */
Graph.prototype.merge = function(data) {
	var nodes = []; // Temporary array to hold newly added nodes for edge creation

	// Add all nodes from the input data
	data.nodes.forEach(function(n) {
		nodes.push(this.addNode(new Node(n.id, n.data))); // Create and add node
	}, this); // Ensure 'this' context is correct

	// Add all edges from the input data
	data.edges.forEach(function(e) {
		var from = nodes[e.from]; // Get source node from temp array
		var to = nodes[e.to];     // Get target node from temp array

		var id; // Variable to store edge ID

		// Determine edge ID based on directionality
		if ( e.directed ) {
			id = e.type + "-" + from.id + "-" + to.id; // Directed edge ID
		} else {
			// Normalize ID for non-directed edges to ensure uniqueness regardless of (from, to) order
			if ( from.id < to.id ) {
				id = e.type + "-" + from.id + "-" + to.id;
			} else {
				id = e.type + "-" + to.id + "-" + from.id;
			}
		}

		var edge = this.addEdge(new Edge(id, from, to, e.data)); // Create and add edge
		edge.data.type = e.type; // Set edge type in data
	}, this); // Ensure 'this' context is correct
};


// Filters nodes in the graph based on a provided function (fn)
Graph.prototype.filterNodes = function(fn) {
	var tmpNodes = this.nodes.slice(); // Create a shallow copy to iterate safely

	tmpNodes.forEach(function(n) {
		if ( !fn(n) ) { // If the filter function returns false, remove the node
			this.removeNode(n);
		}
	}, this); // 'this' context for the callback
};


// Filters edges in the graph based on a provided function (fn)
Graph.prototype.filterEdges = function(fn) {
	var tmpEdges = this.edges.slice(); // Create a shallow copy to iterate safely

	tmpEdges.forEach(function(e) {
		if ( !fn(e) ) { // If the filter function returns false, remove the edge
			this.removeEdge(e);
		}
	}, this); // 'this' context for the callback
};


// Adds an object as a listener for graph change events
Graph.prototype.addGraphListener = function(obj) {
	this.eventListeners.push(obj); // Add the object to the list of listeners
};


// Notifies all registered listeners that the graph has changed
Graph.prototype.notify = function() {
	this.eventListeners.forEach(function(obj) {
		obj.graphChanged(); // Call the graphChanged method on each listener object
	});
};


// ----------- Layout Subsystem -----------

var Layout = {}; // Namespace for layout algorithms

// Force-directed layout algorithm constructor
Layout.ForceDirected = function(graph, stiffness, repulsion, damping) {
	this.graph = graph;       // The graph instance to be laid out
	this.stiffness = stiffness; // Spring stiffness constant (k)
	this.repulsion = repulsion; // Repulsion constant (C)
	this.damping = damping;     // Velocity damping factor

	this.nodePoints = {}; // Stores Layout.ForceDirected.Point objects associated with each graph node
	this.edgeSprings = {}; // Stores Layout.ForceDirected.Spring objects associated with each graph edge
};


// Retrieves or creates a Layout.ForceDirected.Point for a given node
Layout.ForceDirected.prototype.point = function(node) {
	// If the point for this node hasn't been created yet
	if ( typeof(this.nodePoints[node.id]) === 'undefined' ) {
		// Determine node mass, default to 1.0 if not specified in node data
		var mass = typeof(node.data.mass) !== 'undefined' ? node.data.mass : 1.0;
		// Create a new point with random initial position and the determined mass
		this.nodePoints[node.id] = new Layout.ForceDirected.Point(Vector.random(), mass);
	}

	return this.nodePoints[node.id]; // Return the associated point object
};


// Retrieves or creates a Layout.ForceDirected.Spring for a given edge
Layout.ForceDirected.prototype.spring = function(edge) {
	// If the spring for this edge hasn't been created yet
	if ( typeof(this.edgeSprings[edge.id]) === 'undefined' ) {
		// Determine spring length, default to 1.0 if not specified in edge data
		var length = typeof(edge.data.length) !== 'undefined' ? edge.data.length : 1.0;

		var existingSpring = false; // Flag to check if an equivalent spring already exists

		// Check for existing springs for edges in the 'from -> to' direction
		var from = this.graph.getEdges(edge.source, edge.target);
		from.forEach(function(e) {
			// If no existing spring found yet and a spring exists for this edge 'e'
			if ( existingSpring === false && typeof(this.edgeSprings[e.id]) !== 'undefined' ) {
				existingSpring = this.edgeSprings[e.id]; // Use the existing spring
			}
		}, this);

		// If an existing spring was found, return a dummy spring that doesn't apply forces
		if ( existingSpring !== false ) {
			return new Layout.ForceDirected.Spring(existingSpring.point1, existingSpring.point2, 0.0, 0.0);
		}

		// Check for existing springs for edges in the 'to -> from' direction
		var to = this.graph.getEdges(edge.target, edge.source);
		to.forEach(function(e) {
			// If no existing spring found yet and a spring exists for this edge 'e'
			if ( existingSpring === false && typeof(this.edgeSprings[e.id]) !== 'undefined' ) {
				existingSpring = this.edgeSprings[e.id]; // Use the existing spring
			}
		}, this);

		// If an existing spring was found (in the reverse direction), return a dummy spring
		// Note: Points are swapped to ensure consistent force application
		if ( existingSpring !== false ) {
			return new Layout.ForceDirected.Spring(existingSpring.point2, existingSpring.point1, 0.0, 0.0);
		}

		// If no existing spring was found, create a new one
		this.edgeSprings[edge.id] = new Layout.ForceDirected.Spring(
			this.point(edge.source), // Point for the source node
			this.point(edge.target), // Point for the target node
			length,                  // Desired spring length
			this.stiffness            // Spring stiffness constant
		);
	}

	return this.edgeSprings[edge.id]; // Return the associated spring object
};


// Iterates over each node in the graph, calling a callback function
// The callback receives the graph node and its corresponding layout point
Layout.ForceDirected.prototype.eachNode = function(callback) {
	var self = this; // Store 'this' context
	this.graph.nodes.forEach(function(n) {
		callback.call(self, n, self.point(n)); // Call callback with node and its point
	});
};


// Iterates over each edge in the graph, calling a callback function
// The callback receives the graph edge and its corresponding layout spring
Layout.ForceDirected.prototype.eachEdge = function(callback) {
	var self = this; // Store 'this' context
	this.graph.edges.forEach(function(e) {
		callback.call(self, e, self.spring(e)); // Call callback with edge and its spring
	});
};


// Iterates over each spring in the layout, calling a callback function
// The callback receives the layout spring
Layout.ForceDirected.prototype.eachSpring = function(callback) {
	var self = this; // Store 'this' context
	this.graph.edges.forEach(function(e) {
		callback.call(self, self.spring(e)); // Call callback with the spring
	});
};


// Physics calculations: Apply Coulomb's Law (repulsion between all nodes)
Layout.ForceDirected.prototype.applyCoulombsLaw = function() {
	this.eachNode(function(n1, point1) { // For each node n1 and its point1
		this.eachNode(function(n2, point2) { // For each other node n2 and its point2
			if ( point1 !== point2 ) { // Don't apply repulsion to a node itself
				var d = point1.p.subtract(point2.p); // Vector from point2 to point1
				// Calculate distance, add a small value to avoid division by zero
				var distance = d.magnitude() + 0.1;
				var direction = d.normalise(); // Normalize to get unit vector

				// Apply force to each end point based on repulsion constant and distance squared
				// Force on point1 is away from point2
				point1.applyForce(direction.multiply(this.repulsion).divide(distance * distance * 0.5));
				// Force on point2 is away from point1 (opposite direction)
				point2.applyForce(direction.multiply(this.repulsion).divide(distance * distance * -0.5));
			}
		});
	});
};


// Physics calculations: Apply Hooke's Law (spring forces along edges)
Layout.ForceDirected.prototype.applyHookesLaw = function() {
	this.eachSpring(function(spring) {
		var d = spring.point2.p.subtract(spring.point1.p); // Vector from point1 to point2
		var displacement = spring.length - d.magnitude(); // Difference from ideal length
		var direction = d.normalise(); // Unit vector in the direction of the spring

		// Apply force to each end point
		// Force on point1 is towards point2 if stretched, away if compressed
		spring.point1.applyForce(direction.multiply(spring.k * displacement * -0.5));
		// Force on point2 is towards point1 if stretched, away if compressed
		spring.point2.applyForce(direction.multiply(spring.k * displacement * 0.5));
	});
};


// Physics calculations: Attract all nodes towards the center of the layout
Layout.ForceDirected.prototype.attractToCentre = function() {
	this.eachNode(function(node, point) {
		var direction = point.p.multiply(-1.0); // Vector pointing towards (0,0)
		point.applyForce(direction.multiply(this.repulsion / 50.0)); // Apply a gentle attraction force
	});
};


// Update velocities of all nodes based on applied forces and damping
Layout.ForceDirected.prototype.updateVelocity = function(timestep) {
	this.eachNode(function(node, point) {
		// Update velocity: v = v + a * dt, then apply damping
		point.v = point.v.add(point.a.multiply(timestep)).multiply(this.damping);
		point.a = new Vector(0,0); // Reset acceleration for the next timestep
	});
};


// Update positions of all nodes based on their velocities
Layout.ForceDirected.prototype.updatePosition = function(timestep) {
	this.eachNode(function(node, point) {
		// Update position: p = p + v * dt
		point.p = point.p.add(point.v.multiply(timestep));
	});
};


// Calculate the total kinetic energy of the system
Layout.ForceDirected.prototype.totalEnergy = function() {
	var energy = 0.0; // Initialize total energy

	this.eachNode(function(node, point) {
		var speed = point.v.magnitude(); // Magnitude of velocity (speed)
		energy += 0.5 * point.m * speed * speed; // Kinetic energy formula (1/2 * m * v^2)
	});

	return energy; // Return the accumulated energy
};


// Helper function to bind a function to a specific context (stolen from coffeescript, thanks jashkenas!)
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };


// Polyfill for requestAnimationFrame, or fallback to setTimeout
Layout.requestAnimationFrame = __bind(window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback, element) {
		window.setTimeout(callback, 10); // Fallback to 10ms timeout
	}, window);


// Starts the force-directed simulation
Layout.ForceDirected.prototype.start = function(interval, render, done) {
	var self = this; // Store 'this' context

	if ( this._started ) {
		return; // Prevent starting multiple simulations
	}
	this._started = true; // Mark simulation as started

	// Define the main animation step function
	Layout.requestAnimationFrame(function step() {
		// Apply all forces
		self.applyCoulombsLaw();
		self.applyHookesLaw();
		self.attractToCentre();

		// Update velocities and positions
		self.updateVelocity(0.03); // Use a fixed timestep
		self.updatePosition(0.03); // Use a fixed timestep

		// Call the optional render callback if provided
		if ( typeof(render) !== 'undefined' ) {
			render();
		}

		// Check energy to decide whether to stop or continue simulation
		if ( self.totalEnergy() < 0.01 ) { // If total energy is below a threshold
			self._started = false; // Mark simulation as stopped
			if ( typeof(done) !== 'undefined' ) {
				done(); // Call the optional 'done' callback
			}
		} else {
			Layout.requestAnimationFrame(step); // Continue to the next step
		}
	});
};


// Finds the nearest node to a given position (pos)
Layout.ForceDirected.prototype.nearest = function(pos) {
	var min = {node: null, point: null, distance: null}; // Object to store the nearest result
	var self = this; // Store 'this' context

	this.graph.nodes.forEach(function(n) {
		var point = self.point(n); // Get the layout point for the node
		var distance = point.p.subtract(pos).magnitude(); // Calculate distance from pos

		// If this node is closer than the current minimum, update minimum
		if ( min.distance === null || distance < min.distance ) {
			min = {node: n, point: point, distance: distance};
		}
	});

	return min; // Return the nearest node, its point, and distance
};


// Returns the bounding box of all nodes in the layout
// The bounding box is represented by two vectors: [bottomleft, topright]
Layout.ForceDirected.prototype.getBoundingBox = function() {
	// Initialize bounding box with arbitrary large/small values
	var bottomleft = new Vector(-2,-2);
	var topright = new Vector(2,2);

	this.eachNode(function(n, point) {
		// Update bottomleft coordinates
		if ( point.p.x < bottomleft.x ) {
			bottomleft.x = point.p.x;
		}
		if ( point.p.y < bottomleft.y ) {
			bottomleft.y = point.p.y;
		}
		// Update topright coordinates
		if ( point.p.x > topright.x ) {
			topright.x = point.p.x;
		}
		if ( point.p.y > topright.y ) {
			topright.y = point.p.y;
		}
	});

	// Add a small padding to the bounding box
	var padding = topright.subtract(bottomleft).multiply(0.07); // ~5% padding

	return {
		bottomleft: bottomleft.subtract(padding),
		topright: topright.add(padding)
	};
};


// Vector class definition
Vector = function(x, y) {
	this.x = x; // X component
	this.y = y; // Y component
};


// Static method to create a random vector
Vector.random = function() {
	// Returns a vector with components between -5.0 and 5.0
	return new Vector(10.0 * (Math.random() - 0.5), 10.0 * (Math.random() - 0.5));
};


// Adds another vector to this vector
Vector.prototype.add = function(v2) {
	return new Vector(this.x + v2.x, this.y + v2.y);
};


// Subtracts another vector from this vector
Vector.prototype.subtract = function(v2) {
	return new Vector(this.x - v2.x, this.y - v2.y);
};


// Multiplies this vector by a scalar
Vector.prototype.multiply = function(n) {
	return new Vector(this.x * n, this.y * n);
};


// Divides this vector by a scalar
Vector.prototype.divide = function(n) {
	// Avoid division by zero, return (0,0) if n is 0
	return new Vector((this.x / n) || 0, (this.y / n) || 0);
};


// Calculates the magnitude (length) of this vector
Vector.prototype.magnitude = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};


// Returns a new vector that is normal (perpendicular) to this vector
Vector.prototype.normal = function() {
	return new Vector(-this.y, this.x);
};


// Returns a new vector that is the normalized (unit) version of this vector
Vector.prototype.normalise = function() {
	return this.divide(this.magnitude()); // Divide by magnitude to get unit vector
};


// Point class for ForceDirected layout
Layout.ForceDirected.Point = function(position, mass) {
	this.p = position;       // Current position (Vector)
	this.m = mass;           // Mass of the point (scalar)
	this.v = new Vector(0, 0); // Velocity (Vector), initialized to zero
	this.a = new Vector(0, 0); // Acceleration (Vector), initialized to zero
};

// Applies a force vector to this point, updating its acceleration
Layout.ForceDirected.Point.prototype.applyForce = function(force) {
    this.a = this.a.add(force.divide(this.m)); // a = F/m
};


// Spring class for ForceDirected layout
Layout.ForceDirected.Spring = function(point1, point2, length, k) {
	this.point1 = point1; // First point connected by the spring
	this.point2 = point2; // Second point connected by the spring
	this.length = length; // Desired rest length of the spring
	this.k = k;           // Spring constant (stiffness)
};