/*
 *  Kinetic Diagram Animator v1.0.1
 *
 *  Copyright (c) 2010 Dennis Hotson - Reimagined by AI Assistant
 *
 *  Authorization is hereby provided, without charge, to any individual
 *  acquiring a copy of this software and its associated documentation
 *  files (the "Software"), to engage with the Software without
 *  restriction, including, but not limited to, the entitlements to employ,
 *  reproduce, alter, disseminate, sub-license, and/or distribute
 *  copies of the Software, under the following stipulations:
 *
 *  The aforementioned copyright declaration and this authorization notice
 *  shall be incorporated in all reproductions or substantial portions of the Software.
 *
 *  THE SOFTWARE IS SUPPLIED "AS IS", WITHOUT ANY MANIFESTATION OF ASSURANCE,
 *  EXPRESS OR IMPLIED, INCLUDING, YET NOT LIMITED TO, THE GUARANTEES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR OBJECTIVE, AND NON-INFRINGEMENT.
 *  IN NO INSTANCE SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE ACCOUNTABLE
 *  FOR ANY ASSERTIONS, DAMAGES, OR OTHER LIABILITIES, WHETHER IN AN ACTION
 *  OF CONTRACT, TORT, OR OTHERWISE ARISING FROM, OUT OF OR IN CONNECTION
 *  WITH THE SOFTWARE OR THE UTILIZATION OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Network = function()
{
	this.vertexRegister = {};
	this.vertices = [ ];
	this.links = [ ];
	this.neighborMap = {};

	this.nextVertexIdentifier = 0;
	this.nextLinkIdentifier = 0;
	this.changeSubscribers = [ ];
};

var Vertex = function(uniqueId, payload)
{
	this.uniqueId = uniqueId;
	this.payload = typeof(payload) !== 'undefined' ? payload : {};
};

var Link = function(uniqueId, origin, destination, payload)
{
	this.uniqueId = uniqueId;
	this.origin = origin;
	this.destination = destination;
	this.payload = typeof(payload) !== 'undefined' ? payload : {};
};

Network.prototype.appendVertex = function(currentVertex)
{
	// If this vertex ID isn't already present in our registry, add it to the main list
	if (typeof(this.vertexRegister[currentVertex.uniqueId]) === 'undefined') {
		this.vertices.push(currentVertex);
	}

	// Always ensure the registry points to the latest vertex object
	this.vertexRegister[currentVertex.uniqueId] = currentVertex;

	this.signalChange(); // Notify listeners of the alteration
	return currentVertex;
};

Network.prototype.appendLink = function(currentLink)
{
	let alreadyPresent = false;
	// Check if this specific link already exists in the main links array
	this.links.forEach(function(existingLink) {
		if (currentLink.uniqueId === existingLink.uniqueId) { alreadyPresent = true; }
	});

	if (!alreadyPresent) {
		this.links.push(currentLink); // If not present, add it
	}

	// Initialize origin adjacency entry if it doesn't exist
	if (typeof(this.neighborMap[currentLink.origin.uniqueId]) === 'undefined') {
		this.neighborMap[currentLink.origin.uniqueId] = {};
	}
	// Initialize destination adjacency entry for the origin if it doesn't exist
	if (typeof(this.neighborMap[currentLink.origin.uniqueId][currentLink.destination.uniqueId]) === 'undefined') {
		this.neighborMap[currentLink.origin.uniqueId][currentLink.destination.uniqueId] = [];
	}

	alreadyPresent = false;
	// Check if this specific link already exists in the adjacency list
	this.neighborMap[currentLink.origin.uniqueId][currentLink.destination.uniqueId].forEach(function(existingLink) {
			if (currentLink.uniqueId === existingLink.uniqueId) { alreadyPresent = true; }
	});

	if (!alreadyPresent) {
		this.neighborMap[currentLink.origin.uniqueId][currentLink.destination.uniqueId].push(currentLink);
	}

	this.signalChange(); // Announce the network update
	return currentLink;
};

Network.prototype.createVertex = function(payload)
{
	// Generate a new vertex with a unique ID and provided data
	var freshVertex = new Vertex(this.nextVertexIdentifier++, payload);
	this.appendVertex(freshVertex); // Add it to the network
	return freshVertex;
};

Network.prototype.createLink = function(origin, destination, payload)
{
	// Generate a new link with a unique ID, source, target, and data
	var freshLink = new Link(this.nextLinkIdentifier++, origin, destination, payload);
	this.appendLink(freshLink); // Add it to the network
	return freshLink;
};

// locate all connections from a starting vertex to an ending vertex
Network.prototype.retrieveLinksBetween = function(firstVertex, secondVertex)
{
	if (typeof(this.neighborMap[firstVertex.uniqueId]) !== 'undefined'
		&& typeof(this.neighborMap[firstVertex.uniqueId][secondVertex.uniqueId]) !== 'undefined')
	{
		return this.neighborMap[firstVertex.uniqueId][secondVertex.uniqueId];
	}

	return []; // Return an empty array if no links are found
};

// eliminate a vertex and all its associated connections from the network
Network.prototype.deleteVertex = function(vertexToRemove)
{
	// Remove from the quick lookup registry
	if (typeof(this.vertexRegister[vertexToRemove.uniqueId]) !== 'undefined') {
		delete this.vertexRegister[vertexToRemove.uniqueId];
	}

	// Remove from the main vertices array by iterating backwards
	for (var idx = this.vertices.length - 1; idx >= 0; idx--) {
		if (this.vertices[idx].uniqueId === vertexToRemove.uniqueId) {
			this.vertices.splice(idx, 1);
		}
	}

	// Also remove any links connected to this vertex
	this.severVertexConnections(vertexToRemove);

};

// removes all connections associated with a given vertex
Network.prototype.severVertexConnections = function(isolatedVertex)
{
	var temporaryLinks = this.links.slice(); // Create a shallow copy to iterate safely
	temporaryLinks.forEach(function(currentLink) {
		// If the link's origin or destination matches the isolated vertex, remove it
		if (currentLink.origin.uniqueId === isolatedVertex.uniqueId || currentLink.destination.uniqueId === isolatedVertex.uniqueId) {
			this.deleteLink(currentLink);
		}
	}, this); // Ensure 'this' context is passed for 'deleteLink' call

	this.signalChange(); // Announce the network alteration
};

// eliminate a connection from the network
Network.prototype.deleteLink = function(linkToRemove)
{
	// Remove from the main links array by iterating backwards
	for (var idx = this.links.length - 1; idx >= 0; idx--) {
		if (this.links[idx].uniqueId === linkToRemove.uniqueId) {
			this.links.splice(idx, 1);
		}
	}

	// Remove from the adjacency map
	for (var originKey in this.neighborMap) {
		for (var destinationKey in this.neighborMap[originKey]) {
			var currentLinkCollection = this.neighborMap[originKey][destinationKey];

			for (var innerIdx = currentLinkCollection.length - 1; innerIdx >= 0; innerIdx--) {
				if (this.neighborMap[originKey][destinationKey][innerIdx].uniqueId === linkToRemove.uniqueId) {
					this.neighborMap[originKey][destinationKey].splice(innerIdx, 1);
				}
			}
		}
	}

	this.signalChange(); // Announce the network modification
};

/* Integrate a collection of vertices and links into the existing network. For instance:
var inputData = {
	vertices: [
		{uniqueId: 123, payload: {type: 'person', personId: 123, displayName: 'Alice'}},
		{uniqueId: 234, payload: {type: 'person', personId: 234, displayName: 'Bob'}}
	],
	links: [
		{from: 0, to: 1, type: 'knows_person', isDirected: true, payload: {weight: 1.0}}
	]
}
*/
Network.prototype.assimilate = function(inputData)
{
	var newVertices = [];
	// Add all new vertices to the network and collect references
	inputData.vertices.forEach(function(inputNode) {
		newVertices.push(this.appendVertex(new Vertex(inputNode.uniqueId, inputNode.payload)));
	}, this);

	// Add all new links to the network
	inputData.links.forEach(function(inputLink) {
		var sourceVertex = newVertices[inputLink.from];
		var targetVertex = newVertices[inputLink.to];

		// Generate a unique identifier for the link, normalizing for undirected links
		var linkIdentifier = (inputLink.isDirected)
			? (linkIdentifier = inputLink.connectionType + "-" + sourceVertex.uniqueId + "-" + targetVertex.uniqueId)
			: (sourceVertex.uniqueId < targetVertex.uniqueId) // Normalize ID for non-directed connections
				? inputLink.connectionType + "-" + sourceVertex.uniqueId + "-" + targetVertex.uniqueId
				: inputLink.connectionType + "-" + targetVertex.uniqueId + "-" + sourceVertex.uniqueId;

		var addedLink = this.appendLink(new Link(linkIdentifier, sourceVertex, targetVertex, inputLink.payload));
		addedLink.payload.connectionType = inputLink.connectionType; // Store type in payload
	}, this);
};

Network.prototype.pruneVertices = function(filterFunction)
{
	var temporaryVertexList = this.vertices.slice(); // Copy to allow modification during iteration
	temporaryVertexList.forEach(function(currentVertex) {
		if (!filterFunction(currentVertex)) {
			this.deleteVertex(currentVertex); // Remove vertex if filter returns false
		}
	}, this);
};

Network.prototype.pruneLinks = function(filterFunction)
{
	var temporaryLinkList = this.links.slice(); // Copy to allow modification during iteration
	temporaryLinkList.forEach(function(currentLink) {
		if (!filterFunction(currentLink)) {
			this.deleteLink(currentLink); // Remove link if filter returns false
		}
	}, this);
};


Network.prototype.registerChangeObserver = function(observerObject)
{
	this.changeSubscribers.push(observerObject); // Add an object to be notified of changes
};

Network.prototype.signalChange = function()
{
	// Inform all registered observers that the network has been updated
	this.changeSubscribers.forEach(function(observerObject){
		observerObject.networkUpdated();
	});
};

// -----------
var Arrangement = {};
Arrangement.KineticSimulation = function(targetNetwork, springConstant, repulsionConstant, velocityDamping)
{
	this.targetNetwork = targetNetwork;
	this.springConstant = springConstant; // constant for spring force calculations
	this.repulsionConstant = repulsionConstant; // constant for repulsion force calculations
	this.velocityDamping = velocityDamping; // factor for reducing velocity over time

	this.vertexPositions = {}; // stores spatial locations associated with each vertex
	this.linkSprings = {}; // stores spring units associated with each link
};

Arrangement.KineticSimulation.prototype.getVertexPosition = function(targetVertex)
{
	// If a position for this vertex doesn't exist, create one
	if (typeof(this.vertexPositions[targetVertex.uniqueId]) === 'undefined') {
		var vertexMass = typeof(targetVertex.payload.vertexMass) !== 'undefined' ? targetVertex.payload.vertexMass : 1.0;
		this.vertexPositions[targetVertex.uniqueId] = new Arrangement.KineticSimulation.Location(SpatialCoord.generateRandom(), vertexMass);
	}

	return this.vertexPositions[targetVertex.uniqueId];
};

Arrangement.KineticSimulation.prototype.getLinkSpring = function(targetLink)
{
	// If a spring for this link doesn't exist, create one
	if (typeof(this.linkSprings[targetLink.uniqueId]) === 'undefined') {
		var idealLength = typeof(targetLink.payload.idealLength) !== 'undefined' ? targetLink.payload.idealLength : 1.0;

		var foundSpring = false;

		// Check for an existing spring for a link in the forward direction
		var forwardLinks = this.targetNetwork.retrieveLinksBetween(targetLink.origin, targetLink.destination);
		forwardLinks.forEach(function(currentLink) {
			if (foundSpring === false && typeof(this.linkSprings[currentLink.uniqueId]) !== 'undefined') {
				foundSpring = this.linkSprings[currentLink.uniqueId];
			}
		}, this);

		// If a spring was found, return a dummy spring that doesn't apply force
		if (foundSpring !== false) {
			return new Arrangement.KineticSimulation.SpringUnit(foundSpring.firstAnchor, foundSpring.secondAnchor, 0.0, 0.0);
		}

		// Check for an existing spring for a link in the reverse direction
		var reverseLinks = this.targetNetwork.retrieveLinksBetween(targetLink.destination, targetLink.origin);
		reverseLinks.forEach(function(currentLink){
			if (foundSpring === false && typeof(this.linkSprings[currentLink.uniqueId]) !== 'undefined') {
				foundSpring = this.linkSprings[currentLink.uniqueId];
			}
		}, this);

		// If a spring was found, return a dummy spring with reversed points
		if (foundSpring !== false) {
			return new Arrangement.KineticSimulation.SpringUnit(foundSpring.secondAnchor, foundSpring.firstAnchor, 0.0, 0.0);
		}

		// If no existing spring was found, create a new one
		this.linkSprings[targetLink.uniqueId] = new Arrangement.KineticSimulation.SpringUnit(
			this.getVertexPosition(targetLink.origin), this.getVertexPosition(targetLink.destination), idealLength, this.springConstant
		);
	}

	return this.linkSprings[targetLink.uniqueId];
};

// The callback function should accept two arguments: Vertex object, Location object
Arrangement.KineticSimulation.prototype.iterateVertices = function(processCallback)
{
	var selfRef = this;
	this.targetNetwork.vertices.forEach(function(currentVertex){
		processCallback.call(selfRef, currentVertex, selfRef.getVertexPosition(currentVertex));
	});
};

// The callback function should accept two arguments: Link object, SpringUnit object
Arrangement.KineticSimulation.prototype.iterateLinks = function(processCallback)
{
	var selfRef = this;
	this.targetNetwork.links.forEach(function(currentLink){
		processCallback.call(selfRef, currentLink, selfRef.getLinkSpring(currentLink));
	});
};

// The callback function should accept one argument: SpringUnit object
Arrangement.KineticSimulation.prototype.iterateSprings = function(processCallback)
{
	var selfRef = this;
	this.targetNetwork.links.forEach(function(currentLink){
		processCallback.call(selfRef, selfRef.getLinkSpring(currentLink));
	});
};


// Core physics calculations
Arrangement.KineticSimulation.prototype.enforceRepulsion = function()
{
	this.iterateVertices(function(firstVertex, firstPointObj) {
		this.iterateVertices(function(secondVertex, secondPointObj) {
			if (firstPointObj !== secondPointObj) // Ensure we're not comparing a point to itself
			{
				var differenceVector = firstPointObj.coords.difference(secondPointObj.coords);
				// Add a small epsilon to distance to prevent division by zero or massive forces
				var separationDistance = differenceVector.getMagnitude() + 0.1;
				var unitDirection = differenceVector.normalize();

				// Apply repulsive force to both points
				firstPointObj.addForceToPoint(unitDirection.scale(this.repulsionConstant).ratio(separationDistance * separationDistance * 0.5));
				secondPointObj.addForceToPoint(unitDirection.scale(this.repulsionConstant).ratio(separationDistance * separationDistance * -0.5));
			}
		});
	});
};

Arrangement.KineticSimulation.prototype.applySpringForces = function()
{
	this.iterateSprings(function(currentSpring){
		var differenceVector = currentSpring.secondAnchor.coords.difference(currentSpring.firstAnchor.coords); // Vector from anchor1 to anchor2
		var springDisplacement = currentSpring.restLength - differenceVector.getMagnitude(); // How much the spring is compressed/extended
		var unitDirection = differenceVector.normalize();

		// Apply force to each anchor point based on Hooke's Law
		currentSpring.firstAnchor.addForceToPoint(unitDirection.scale(currentSpring.springCoefficient * springDisplacement * -0.5));
		currentSpring.secondAnchor.addForceToPoint(unitDirection.scale(currentSpring.springCoefficient * springDisplacement * 0.5));
	});
};

Arrangement.KineticSimulation.prototype.pullTowardsCenter = function()
{
	this.iterateVertices(function(currentVertex, currentPoint) {
		var centerAttractionDirection = currentPoint.coords.scale(-1.0); // Vector pointing towards (0,0)
		currentPoint.addForceToPoint(centerAttractionDirection.scale(this.repulsionConstant / 50.0)); // Apply a gentle pull
	});
};


Arrangement.KineticSimulation.prototype.adjustVelocities = function(timeDelta)
{
	this.iterateVertices(function(currentVertex, currentPoint) {
		// Update velocity based on acceleration, then apply damping
		currentPoint.velocity = currentPoint.velocity.sum(currentPoint.acceleration.scale(timeDelta)).scale(this.velocityDamping);
		currentPoint.acceleration = new SpatialCoord(0,0); // Reset acceleration for the next step
	});
};

Arrangement.KineticSimulation.prototype.updateCoordinates = function(timeDelta)
{
	this.iterateVertices(function(currentVertex, currentPoint) {
		// Update position based on current velocity
		currentPoint.coords = currentPoint.coords.sum(currentPoint.velocity.scale(timeDelta));
	});
};

// Determine the total kinetic energy of the physical system
Arrangement.KineticSimulation.prototype.calculateTotalKineticEnergy = function()
{
	var kineticEnergy = 0.0;
	this.iterateVertices(function(currentVertex, currentPoint) {
		var currentSpeed = currentPoint.velocity.getMagnitude();
		kineticEnergy += 0.5 * currentPoint.massValue * currentSpeed * currentSpeed;
	});

	return kineticEnergy;
};

var _bindContext = function(targetFunction, contextObject){ return function(){ return targetFunction.apply(contextObject, arguments); }; }; // Utility for binding 'this' context

Arrangement.requestAnimationLoop = _bindContext(window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(animationCallback, targetElement) {
		window.setTimeout(animationCallback, 10); // Fallback for older browsers
	}, window);


// Initiate the simulation process
Arrangement.KineticSimulation.prototype.beginSimulation = function(updateInterval, renderCallback, completionCallback)
{
	var selfRef = this; // Capture 'this' for use in nested functions

	if (this._simulationActive) return; // Prevent starting multiple simulations concurrently
	this._simulationActive = true;

	Arrangement.requestAnimationLoop(function simulationStep() {
		selfRef.enforceRepulsion(); // Apply Coulomb's law for node repulsion
		selfRef.applySpringForces(); // Apply Hooke's law for edge springs
		selfRef.pullTowardsCenter(); // Gently pull nodes towards the origin
		selfRef.adjustVelocities(0.03); // Update node velocities
		selfRef.updateCoordinates(0.03); // Update node positions

		if (typeof(renderCallback) !== 'undefined')
			renderCallback(); // Execute rendering function if provided

		// Halt simulation if the system's kinetic energy falls below a threshold
		if (selfRef.calculateTotalKineticEnergy() < 0.01) {
			selfRef._simulationActive = false;
			if (typeof(completionCallback) !== 'undefined') { completionCallback(); } // Call completion handler
		} else {
			Arrangement.requestAnimationLoop(simulationStep); // Continue the animation loop
		}
	});
};

// Determine the vertex closest to a given spatial coordinate
Arrangement.KineticSimulation.prototype.findClosestElement = function(queryPosition)
{
	var closestMatch = {foundVertex: null, foundPosition: null, separationMagnitude: null};
	var selfRef = this;
	this.targetNetwork.vertices.forEach(function(currentVertex){
		var currentPosition = selfRef.getVertexPosition(currentVertex);
		var distanceToQuery = currentPosition.coords.difference(queryPosition).getMagnitude();

		if (closestMatch.separationMagnitude === null || distanceToQuery < closestMatch.separationMagnitude) {
			closestMatch = {foundVertex: currentVertex, foundPosition: currentPosition, separationMagnitude: distanceToQuery};
		}
	});

	return closestMatch;
};

// returns [lowerLeftCorner, upperRightCorner]
Arrangement.KineticSimulation.prototype.determineSpatialBounds = function()
{
	var lowerLeftCorner = new SpatialCoord(-2,-2);
	var upperRightCorner = new SpatialCoord(2,2);

	this.iterateVertices(function(currentVertex, currentPosition) {
		if (currentPosition.coords.xCoord < lowerLeftCorner.xCoord) {
			lowerLeftCorner.xCoord = currentPosition.coords.xCoord;
		}
		if (currentPosition.coords.yCoord < lowerLeftCorner.yCoord) {
			lowerLeftCorner.yCoord = currentPosition.coords.yCoord;
		}
		if (currentPosition.coords.xCoord > upperRightCorner.xCoord) {
			upperRightCorner.xCoord = currentPosition.coords.xCoord;
		}
		if (currentPosition.coords.yCoord > upperRightCorner.yCoord) {
			upperRightCorner.yCoord = currentPosition.coords.yCoord;
		}
	});

	// Add a small padding to the bounding box
	var boundaryPadding = upperRightCorner.difference(lowerLeftCorner).scale(0.07);

	return {lowerLeftCorner: lowerLeftCorner.difference(boundaryPadding), upperRightCorner: upperRightCorner.sum(boundaryPadding)};
};


// SpatialCoord (2D Vector)
SpatialCoord = function(xCoord, yCoord)
{
	this.xCoord = xCoord;
	this.yCoord = yCoord;
};

SpatialCoord.generateRandom = function()
{
	// Creates a random vector within a 10x10 square centered at the origin
	return new SpatialCoord(10.0 * (Math.random() - 0.5), 10.0 * (Math.random() - 0.5));
};

SpatialCoord.prototype.sum = function(otherVector)
{
	return new SpatialCoord(this.xCoord + otherVector.xCoord, this.yCoord + otherVector.yCoord);
};

SpatialCoord.prototype.difference = function(otherVector)
{
	return new SpatialCoord(this.xCoord - otherVector.xCoord, this.yCoord - otherVector.yCoord);
};

SpatialCoord.prototype.scale = function(scalarValue)
{
	return new SpatialCoord(this.xCoord * scalarValue, this.yCoord * scalarValue);
};

SpatialCoord.prototype.ratio = function(scalarValue)
{
	// Prevent division by zero errors by returning zero for components
	return new SpatialCoord((this.xCoord / scalarValue) || 0, (this.yCoord / scalarValue) || 0);
};

SpatialCoord.prototype.getMagnitude = function()
{
	return Math.sqrt(this.xCoord*this.xCoord + this.yCoord*this.yCoord);
};

SpatialCoord.prototype.getNormal = function()
{
	return new SpatialCoord(-this.yCoord, this.xCoord);
};

SpatialCoord.prototype.normalize = function()
{
	return this.ratio(this.getMagnitude());
};

// Location (Physical Point in Simulation)
Arrangement.KineticSimulation.Location = function(initialCoords, elementMass)
{
	this.coords = initialCoords; // current position
	this.massValue = elementMass; // mass of the element
	this.velocity = new SpatialCoord(0, 0); // current velocity
	this.acceleration = new SpatialCoord(0, 0); // current acceleration
};

// Method to apply a force to this location, updating its acceleration
Arrangement.KineticSimulation.Location.prototype.addForceToPoint = function(forceVector) {
    this.acceleration = this.acceleration.sum(forceVector.ratio(this.massValue));
};

// SpringUnit (Represents a spring between two points)
Arrangement.KineticSimulation.SpringUnit = function(firstAnchor, secondAnchor, restLength, springCoefficient) {
    this.firstAnchor = firstAnchor;
    this.secondAnchor = secondAnchor;
    this.restLength = restLength; // Ideal length of the spring
    this.springCoefficient = springCoefficient; // Stiffness constant (k)
};