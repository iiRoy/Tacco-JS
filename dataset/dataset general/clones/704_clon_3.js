/*
 * DiagramStructure v2.0.0
 *
 * This code is provided for educational purposes, demonstrating Type III code cloning.
 * All rights reserved by the original author of the Springy library.
 *
 * Modified by AI for demonstration.
 */

var Network = function() {
    // A registry for quick element lookup by their unique identifier.
    this.elementMap = {};
    // A simple array holding all element objects.
    this.elements = [];
    // An array containing all connection objects.
    this.connections = [];
    // Stores connections between elements for efficient traversal.
    // Structure: { sourceElementId: { targetElementId: [connection1, connection2, ...] } }
    this.neighborMap = {};

    // Counter for assigning unique identifiers to new elements.
    this.nextElementIdentifier = 0;
    // Counter for assigning unique identifiers to new connections.
    this.nextConnectionIdentifier = 0;
    // A list of objects that need to be notified when the network changes.
    this.changeSubscribers = [];
};

var Element = function(uniqueId, elementData) {
    this.identifier = uniqueId;
    // Store associated metadata, defaulting to an empty object if none provided.
    this.info = elementData || {};
};

var Connection = function(uniqueId, origin, destination, connectionData) {
    this.identifier = uniqueId;
    this.origin = origin; // The starting element of the connection.
    this.destination = destination; // The ending element of the connection.
    // Store additional connection-specific data.
    this.metadata = connectionData || {};
};

Network.prototype.addElement = function(anElement) {
    // Validate input: ensure anElement is provided and has an identifier.
    if (!anElement || typeof anElement.identifier === 'undefined') {
        console.warn("Attempted to add an invalid element: missing identifier or object.");
        return null;
    }

    // Check if this element's ID is already present in the map.
    if (this.elementMap[anElement.identifier] === undefined) {
        // If it's a new element, add it to our main list.
        this.elements.push(anElement);
    }
    // Always update or set the element in the quick lookup map.
    this.elementMap[anElement.identifier] = anElement;

    // Inform subscribers about the network modification.
    this.dispatchChangeNotification();
    return anElement;
};

Network.prototype.addConnection = function(aConnection) {
    // Basic validation for the connection object.
    if (!aConnection || typeof aConnection.identifier === 'undefined' || !aConnection.origin || !aConnection.destination) {
        console.warn("Attempted to add an invalid connection: missing identifier, origin, or destination.");
        return null;
    }

    // Check if a connection with this ID already exists in the main list.
    const alreadyPresentInList = this.connections.some(existingConn => existingConn.identifier === aConnection.identifier);
    if (!alreadyPresentInList) {
        this.connections.push(aConnection);
    }

    // Ensure the adjacency structure is prepared for the source element.
    const originId = aConnection.origin.identifier;
    const destId = aConnection.destination.identifier;

    if (!this.neighborMap[originId]) {
        this.neighborMap[originId] = {};
    }
    // Ensure the adjacency structure is prepared for the target element within the source.
    if (!this.neighborMap[originId][destId]) {
        this.neighborMap[originId][destId] = [];
    }

    // Check if this specific connection (by ID) is already in the adjacency list.
    const alreadyPresentInAdjacency = this.neighborMap[originId][destId]
        .some(existingConn => existingConn.identifier === aConnection.identifier);

    if (!alreadyPresentInAdjacency) {
        this.neighborMap[originId][destId].push(aConnection);
    }

    this.dispatchChangeNotification();
    return aConnection;
};

Network.prototype.createNewElement = function(elementInfo) {
    // Creates a new element instance with a unique ID and then adds it to the network.
    const newElement = new Element(this.nextElementIdentifier++, elementInfo);
    this.addElement(newElement);
    return newElement;
};

Network.prototype.createNewConnection = function(originElement, destinationElement, connectionMetadata) {
    // Creates a new connection instance with a unique ID and then adds it to the network.
    const newConnection = new Connection(this.nextConnectionIdentifier++, originElement, destinationElement, connectionMetadata);
    this.addConnection(newConnection);
    return newConnection;
};

// Fetches all connections between two specified elements.
Network.prototype.retrieveConnectionsBetween = function(firstElement, secondElement) {
    const originId = firstElement ? firstElement.identifier : null;
    const destId = secondElement ? secondElement.identifier : null;

    if (originId === null || destId === null || !this.neighborMap[originId] || !this.neighborMap[originId][destId]) {
        // If either element is invalid or no connections exist, return an empty array.
        return [];
    }

    return this.neighborMap[originId][destId];
};

// Removes an element and all its associated connections from the network.
Network.prototype.removeElement = function(elementToRemove) {
    if (!elementToRemove || typeof elementToRemove.identifier === 'undefined') {
        console.warn("Cannot remove an invalid element: missing identifier or object.");
        return;
    }

    const elementId = elementToRemove.identifier;

    // Remove from the quick lookup map.
    if (this.elementMap[elementId] !== undefined) {
        delete this.elementMap[elementId];
    } else {
        // If it's not in the map, it's likely not in the main list either, so nothing to do.
        return;
    }

    // Remove from the main elements array. Iterate backwards to handle splice correctly.
    for (let i = this.elements.length - 1; i >= 0; i--) {
        if (this.elements[i].identifier === elementId) {
            this.elements.splice(i, 1);
            break; // Assuming IDs are unique, we can stop after finding it.
        }
    }

    // Now, remove all connections that involve this element.
    this.disconnectElement(elementToRemove);

    this.dispatchChangeNotification();
};

// Removes connections that are attached to a specific element.
Network.prototype.disconnectElement = function(targetElement) {
    if (!targetElement || typeof targetElement.identifier === 'undefined') {
        console.warn("Cannot disconnect for an invalid target element: missing identifier or object.");
        return;
    }

    const targetId = targetElement.identifier;
    const connectionsToProcess = [...this.connections]; // Create a shallow copy to iterate over safely.

    connectionsToProcess.forEach(conn => {
        if (conn.origin.identifier === targetId || conn.destination.identifier === targetId) {
            this.removeConnection(conn);
        }
    });

    // Clean up adjacency entries where this element is the source.
    if (this.neighborMap[targetId]) {
        delete this.neighborMap[targetId];
    }
    // Iterate through other elements' adjacency lists to remove connections where targetElement is the destination.
    for (const sourceId in this.neighborMap) {
        if (Object.prototype.hasOwnProperty.call(this.neighborMap, sourceId)) {
            for (const destId in this.neighborMap[sourceId]) {
                if (Object.prototype.hasOwnProperty.call(this.neighborMap[sourceId], destId) && destId === targetId) {
                    delete this.neighborMap[sourceId][destId];
                    // If the source's entry becomes empty, clean it up too.
                    if (Object.keys(this.neighborMap[sourceId]).length === 0) {
                        delete this.neighborMap[sourceId];
                    }
                }
            }
        }
    }
    // Note: dispatchChangeNotification is typically handled by removeElement or removeConnection.
    // If this method is called directly and no connections were removed, a notification might be needed here.
};

// Removes a specific connection from the network.
Network.prototype.removeConnection = function(connToRemove) {
    if (!connToRemove || typeof connToRemove.identifier === 'undefined') {
        console.warn("Cannot remove an invalid connection: missing identifier or object.");
        return;
    }

    const connId = connToRemove.identifier;

    // Remove from the main connections array.
    let connectionRemovedFromArray = false;
    for (let i = this.connections.length - 1; i >= 0; i--) {
        if (this.connections[i].identifier === connId) {
            this.connections.splice(i, 1);
            connectionRemovedFromArray = true;
            break;
        }
    }

    // Remove from the adjacency map.
    const originId = connToRemove.origin.identifier;
    const destId = connToRemove.destination.identifier;

    if (this.neighborMap[originId] && this.neighborMap[originId][destId]) {
        const connectionsInAdjacency = this.neighborMap[originId][destId];
        for (let j = connectionsInAdjacency.length - 1; j >= 0; j--) {
            if (connectionsInAdjacency[j].identifier === connId) {
                connectionsInAdjacency.splice(j, 1);
                // If the array becomes empty, clean up the inner object.
                if (connectionsInAdjacency.length === 0) {
                    delete this.neighborMap[originId][destId];
                }
                break;
            }
        }
        // If the inner object for destId becomes empty, clean up the outer object.
        if (Object.keys(this.neighborMap[originId][destId] || {}).length === 0) {
            delete this.neighborMap[originId][destId];
            // If the origin's entry becomes empty, clean it up too.
            if (Object.keys(this.neighborMap[originId]).length === 0) {
                delete this.neighborMap[originId];
            }
        }
    }

    if (connectionRemovedFromArray) { // Only notify if something was actually removed.
        this.dispatchChangeNotification();
    }
};

/*
 * Integrates an external data structure containing elements and connections
 * into the current network.
 * Example structure:
 * var externalData = {
 *   elements: [
 *     {id: 101, data: {category: 'user', name: 'Alice'}},
 *     {id: 102, data: {category: 'user', name: 'Bob'}}
 *   ],
 *   connections: [
 *     {from: 0, to: 1, type: 'friendship', directed: true, data: {strength: 0.8}}
 *   ]
 * }
 */
Network.prototype.incorporateData = function(incomingData) {
    if (!incomingData || typeof incomingData !== 'object') {
        console.warn("Invalid data provided for incorporation. Expected an object.");
        return;
    }

    const addedElements = [];
    // Process and add elements first.
    if (Array.isArray(incomingData.elements)) {
        incomingData.elements.forEach(elData => {
            if (elData && typeof elData.id !== 'undefined') {
                addedElements.push(this.addElement(new Element(elData.id, elData.data)));
            } else {
                console.warn("Skipping invalid element data during incorporation:", elData);
            }
        }, this);
    }

    // Then process and add connections.
    if (Array.isArray(incomingData.connections)) {
        incomingData.connections.forEach(connData => {
            if (!connData || typeof connData.from === 'undefined' || typeof connData.to === 'undefined' || !connData.type) {
                console.warn("Skipping invalid connection data during incorporation:", connData);
                return;
            }

            const sourceEl = addedElements[connData.from];
            const destEl = addedElements[connData.to];

            if (!sourceEl || !destEl) {
                console.warn("Could not find source or destination element for connection:", connData);
                return;
            }

            // Generate a unique identifier for the connection.
            let connectionKey;
            if (connData.directed) {
                connectionKey = `${connData.type}-${sourceEl.identifier}-${destEl.identifier}`;
            } else {
                // Normalize ID for undirected connections to ensure consistency regardless of from/to order.
                const firstId = Math.min(sourceEl.identifier, destEl.identifier);
                const secondId = Math.max(sourceEl.identifier, destEl.identifier);
                connectionKey = `${connData.type}-${firstId}-${secondId}`;
            }

            const newConnection = this.addConnection(new Connection(connectionKey, sourceEl, destEl, connData.data));
            if (newConnection) {
                // Add the type to the connection's metadata for easy access.
                newConnection.metadata.type = connData.type;
            }
        }, this);
    }
};

Network.prototype.pruneElements = function(evaluationFunction) {
    if (typeof evaluationFunction !== 'function') {
        console.warn("Evaluation function for element pruning must be a function.");
        return;
    }
    // Create a copy to iterate over while modifying the original collection.
    const currentElements = [...this.elements];
    currentElements.forEach(el => {
        // If the evaluation function returns false, remove the element.
        if (el && !evaluationFunction(el)) {
            this.removeElement(el);
        }
    }, this);
};

Network.prototype.pruneConnections = function(evaluationFunction) {
    if (typeof evaluationFunction !== 'function') {
        console.warn("Evaluation function for connection pruning must be a function.");
        return;
    }
    // Create a copy to iterate over while modifying the original collection.
    const currentConnections = [...this.connections];
    currentConnections.forEach(conn => {
        // If the evaluation function returns false, remove the connection.
        if (conn && !evaluationFunction(conn)) {
            this.removeConnection(conn);
        }
    }, this);
};

// Registers an object to receive notifications when the network structure changes.
Network.prototype.subscribeToChanges = function(subscriberObject) {
    if (subscriberObject && typeof subscriberObject.graphChanged === 'function') {
        this.changeSubscribers.push(subscriberObject);
    } else {
        console.warn("Invalid subscriber object. Must be an object with a 'graphChanged' method.");
    }
};

// Notifies all registered subscribers that the network has been modified.
Network.prototype.dispatchChangeNotification = function() {
    this.changeSubscribers.forEach(subscriber => {
        // Ensure the subscriber still has the expected method before calling.
        if (typeof subscriber.graphChanged === 'function') {
            subscriber.graphChanged();
        }
    });
};

// -----------
var Arrangement = {}; // Namespace for layout related functionalities.

Arrangement.DynamicField = function(targetNetwork, springConstant, repulsionForce, dampingFactor) {
    // Validate inputs.
    if (!targetNetwork) {
        throw new Error("DynamicField requires a target network.");
    }
    this.targetNetwork = targetNetwork;
    this.springConstant = springConstant; // Coefficient for spring forces.
    this.repulsionForce = repulsionForce; // Magnitude of repulsive forces between elements.
    this.dampingFactor = dampingFactor; // Factor to reduce velocity over time.

    // Map element IDs to their corresponding physics particles (position, velocity, etc.).
    this.particlePositions = {};
    // Map connection IDs to their corresponding spring objects.
    this.connectionSprings = {};

    this._simulationActive = false; // Internal flag to manage simulation state.
};

Arrangement.DynamicField.prototype.getParticle = function(anElement) {
    if (!anElement || typeof anElement.identifier === 'undefined') {
        console.warn("Attempted to get particle for an invalid element: missing identifier or object.");
        return null;
    }

    const elementId = anElement.identifier;
    if (this.particlePositions[elementId] === undefined) {
        // Initialize a new particle if it doesn't exist.
        // Assign a random starting position and a mass (default to 1.0 if not specified in element info).
        const particleMass = anElement.info.mass !== undefined ? anElement.info.mass : 1.0;
        this.particlePositions[elementId] = new Arrangement.DynamicField.Particle(Coord.random(), particleMass);
    }
    return this.particlePositions[elementId];
};

Arrangement.DynamicField.prototype.getConnectionSpring = function(aConnection) {
    if (!aConnection || typeof aConnection.identifier === 'undefined' || !aConnection.origin || !aConnection.destination) {
        console.warn("Attempted to get spring for an invalid connection: missing identifier, origin, or destination.");
        return null;
    }

    const connectionId = aConnection.identifier;
    if (this.connectionSprings[connectionId] === undefined) {
        // Determine the desired length of the spring, default to 1.0.
        const idealLength = aConnection.metadata.length !== undefined ? aConnection.metadata.length : 1.0;

        let existingSpringReference = null;

        // Check for existing springs between the same elements (potentially different connection ID).
        // This is to ensure that if multiple connections exist between two nodes,
        // they share the same physical spring if they represent the same physical link.
        const forwardConnections = this.targetNetwork.retrieveConnectionsBetween(aConnection.origin, aConnection.destination);
        for (const existingConn of forwardConnections) {
            if (this.connectionSprings[existingConn.identifier]) {
                existingSpringReference = this.connectionSprings[existingConn.identifier];
                break;
            }
        }

        if (existingSpringReference) {
            // If a spring already exists for this pair, return a 'dummy' spring that doesn't apply forces.
            // This prevents duplicate force application for multi-edges between the same two nodes.
            return new Arrangement.DynamicField.Spring(existingSpringReference.particle1, existingSpringReference.particle2, 0.0, 0.0);
        }

        // Also check for reverse connections if it's an undirected graph or to handle bidirectionality.
        const reverseConnections = this.targetNetwork.retrieveConnectionsBetween(aConnection.destination, aConnection.origin);
        for (const existingConn of reverseConnections) {
            if (this.connectionSprings[existingConn.identifier]) {
                existingSpringReference = this.connectionSprings[existingConn.identifier];
                break;
            }
        }

        if (existingSpringReference) {
            // If a reverse spring exists, link to it but reverse particle order for correct force application.
            return new Arrangement.DynamicField.Spring(existingSpringReference.particle2, existingSpringReference.particle1, 0.0, 0.0);
        }

        // If no existing spring found, create a new one.
        this.connectionSprings[connectionId] = new Arrangement.DynamicField.Spring(
            this.getParticle(aConnection.origin),
            this.getParticle(aConnection.destination),
            idealLength,
            this.springConstant
        );
    }

    return this.connectionSprings[connectionId];
};

// Iterates over each element in the network, providing the element and its associated particle.
Arrangement.DynamicField.prototype.forEveryElement = function(processorCallback) {
    const instance = this;
    this.targetNetwork.elements.forEach(el => {
        const particle = instance.getParticle(el);
        if (particle) {
            processorCallback.call(instance, el, particle);
        }
    });
};

// Iterates over each connection in the network, providing the connection and its associated spring.
Arrangement.DynamicField.prototype.forEveryConnection = function(processorCallback) {
    const instance = this;
    this.targetNetwork.connections.forEach(conn => {
        const spring = instance.getConnectionSpring(conn);
        if (spring) {
            processorCallback.call(instance, conn, spring);
        }
    });
};

// Iterates over each active spring in the layout.
Arrangement.DynamicField.prototype.forEverySpring = function(processorCallback) {
    const instance = this;
    // Iterate through the connections, as each connection maps to a spring.
    this.targetNetwork.connections.forEach(conn => {
        const spring = instance.getConnectionSpring(conn);
        // Only process if the spring is valid and has a non-zero strength (not a dummy spring).
        if (spring && spring.strength > 0) {
            processorCallback.call(instance, spring);
        }
    });
};


// Physics calculations and integration steps.

Arrangement.DynamicField.prototype.applyRepulsiveForces = function() {
    this.forEveryElement(function(el1, particle1) {
        this.forEveryElement(function(el2, particle2) {
            // No repulsion between an element and itself.
            if (particle1 === particle2) {
                return;
            }

            const displacementVector = particle1.position.subtract(particle2.position);
            // Add a small constant to distance to prevent division by zero and extremely large forces at very close proximity.
            const currentDistance = Math.max(displacementVector.magnitude(), 1e-6); // Minimum distance to avoid huge forces
            const normalizedDirection = displacementVector.normalize();

            // Calculate repulsive force using an inverse square law (Coulomb's Law approximation).
            const forceMagnitude = this.repulsionForce / (currentDistance * currentDistance * 0.5);

            // Apply forces to both particles in opposite directions.
            particle1.applyForce(normalizedDirection.multiply(forceMagnitude));
            particle2.applyForce(normalizedDirection.multiply(-forceMagnitude));
        });
    });
};

Arrangement.DynamicField.prototype.applySpringForces = function() {
    this.forEverySpring(function(aSpring) {
        const displacementVector = aSpring.particle2.position.subtract(aSpring.particle1.position);
        const currentDistance = displacementVector.magnitude();
        const normalizedDirection = displacementVector.normalize();

        // Hooke's Law: F = -k * x (where x is displacement from rest length).
        // Here, displacement is (currentDistance - idealLength).
        const displacementFromRest = currentDistance - aSpring.idealLength;

        // Calculate force magnitude.
        const forceMagnitude = aSpring.strength * displacementFromRest;

        // Apply forces to connected particles.
        // Forces are split between the two particles.
        aSpring.particle1.applyForce(normalizedDirection.multiply(forceMagnitude * 0.5));
        aSpring.particle2.applyForce(normalizedDirection.multiply(-forceMagnitude * 0.5));
    });
};

Arrangement.DynamicField.prototype.pullTowardsCenter = function() {
    this.forEveryElement(function(el, particle) {
        // Calculate a vector pointing from the particle's position towards the origin (0,0).
        const vectorToCenter = particle.position.multiply(-1.0);
        // Apply a small attractive force towards the center of the layout.
        // The magnitude is scaled by repulsionForce to make it configurable.
        particle.applyForce(vectorToCenter.multiply(this.repulsionForce / 100.0));
    });
};


Arrangement.DynamicField.prototype.integrateVelocities = function(timeStep) {
    this.forEveryElement(function(el, particle) {
        // Update velocity based on acceleration.
        // v_new = (v_old + a * dt) * damping
        particle.velocity = particle.velocity
            .add(particle.acceleration.multiply(timeStep))
            .multiply(this.dampingFactor);

        // Reset acceleration for the next iteration.
        particle.acceleration = new Coord(0, 0);
    });
};

Arrangement.DynamicField.prototype.updateParticlePositions = function(timeStep) {
    this.forEveryElement(function(el, particle) {
        // Update position based on velocity.
        // p_new = p_old + v * dt
        particle.position = particle.position.add(particle.velocity.multiply(timeStep));
    });
};

// Computes the total kinetic energy of all particles in the system.
Arrangement.DynamicField.prototype.calculateTotalKineticEnergy = function() {
    let totalEnergy = 0.0;
    this.forEveryElement(function(el, particle) {
        const speedSquared = particle.velocity.magnitudeSquared(); // Using magnitudeSquared for performance.
        totalEnergy += 0.5 * particle.mass * speedSquared;
    });
    return totalEnergy;
};

// Utility function to bind a function's context.
// Borrowed inspiration from popular libraries.
var bindFunctionContext = function(func, context) {
    if (typeof func !== 'function') {
        throw new TypeError("Function to bind must be a function.");
    }
    return function() {
        return func.apply(context, arguments);
    };
};

// Polyfill for requestAnimationFrame for smoother animations.
Arrangement.requestAnimationUtility = bindFunctionContext(window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60); // Fallback to 60fps timer.
    }, window);


// Initiates the force-directed simulation.
Arrangement.DynamicField.prototype.beginSimulation = function(simulationTimeStep = 0.02, renderingCallback, completionCallback) {
    const instance = this;

    // Prevent starting the simulation multiple times concurrently.
    if (this._simulationActive) {
        return;
    }
    this._simulationActive = true;

    const energyThreshold = 0.01; // Threshold to consider the system "stable".

    // Define the core simulation step function.
    const executeSimulationStep = function() {
        // Allow external stopping of the simulation.
        if (!instance._simulationActive) {
            if (typeof completionCallback === 'function') {
                completionCallback();
            }
            return;
        }

        instance.applyRepulsiveForces();
        instance.applySpringForces();
        instance.pullTowardsCenter();
        instance.integrateVelocities(simulationTimeStep);
        instance.updateParticlePositions(simulationTimeStep);

        // If a rendering function is provided, execute it to update the visual display.
        if (typeof renderingCallback === 'function') {
            renderingCallback();
        }

        // Check if the system has reached a stable state (low kinetic energy).
        if (instance.calculateTotalKineticEnergy() < energyThreshold) {
            instance._simulationActive = false; // Stop the simulation.
            if (typeof completionCallback === 'function') {
                completionCallback();
            }
        } else {
            // Continue the simulation in the next animation frame.
            Arrangement.requestAnimationUtility(executeSimulationStep);
        }
    };

    // Start the first step of the simulation.
    Arrangement.requestAnimationUtility(executeSimulationStep);
};

// Stops the ongoing simulation.
Arrangement.DynamicField.prototype.stopSimulation = function() {
    this._simulationActive = false;
};

// Finds the element particle closest to a given coordinate.
Arrangement.DynamicField.prototype.findNearestElement = function(targetCoordinate) {
    if (!targetCoordinate || typeof targetCoordinate.x === 'undefined' || typeof targetCoordinate.y === 'undefined') {
        console.warn("Invalid target coordinate provided for nearest element search.");
        return { element: null, particle: null, distance: Infinity };
    }

    let closestMatch = {
        element: null,
        particle: null,
        distance: Infinity // Initialize with a very large distance.
    };
    const instance = this;

    this.targetNetwork.elements.forEach(el => {
        const currentParticle = instance.getParticle(el);
        if (currentParticle) {
            const currentDistance = currentParticle.position.subtract(targetCoordinate).magnitude();

            if (currentDistance < closestMatch.distance) {
                closestMatch = {
                    element: el,
                    particle: currentParticle,
                    distance: currentDistance
                };
            }
        }
    });

    // If no elements exist or no valid particles, closestMatch.element will be null.
    return closestMatch;
};

// Calculates the bounding box that encompasses all element particles.
// Returns an object with 'bottomLeft' and 'topRight' Coord objects.
Arrangement.DynamicField.prototype.computeBoundingBox = function() {
    // Initialize with extreme values to ensure first particle updates bounds correctly.
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    let hasElements = false;

    this.forEveryElement(function(el, particle) {
        hasElements = true;
        minX = Math.min(minX, particle.position.x);
        minY = Math.min(minY, particle.position.y);
        maxX = Math.max(maxX, particle.position.x);
        maxY = Math.max(maxY, particle.position.y);
    });

    // If no elements, return a default small box around origin.
    if (!hasElements) {
        return { bottomLeft: new Coord(-1, -1), topRight: new Coord(1, 1) };
    }

    const bottomLeft = new Coord(minX, minY);
    const topRight = new Coord(maxX, maxY);

    // Add a small padding around the bounding box.
    const dimensions = topRight.subtract(bottomLeft);
    const padding = dimensions.multiply(0.06); // Approximately 6% padding.

    return {
        bottomLeft: bottomLeft.subtract(padding),
        topRight: topRight.add(padding)
    };
};


// Coord (Coordinate) class for 2D vector operations.
var Coord = function(xValue, yValue) {
    this.x = xValue;
    this.y = yValue;
};

// Generates a random coordinate within a certain range.
Coord.random = function() {
    // Generates values between -5.0 and 5.0.
    return new Coord(10.0 * (Math.random() - 0.5), 10.0 * (Math.random() - 0.5));
};

// Adds another coordinate vector to this one.
Coord.prototype.add = function(otherCoord) {
    return new Coord(this.x + otherCoord.x, this.y + otherCoord.y);
};

// Subtracts another coordinate vector from this one.
Coord.prototype.subtract = function(otherCoord) {
    return new Coord(this.x - otherCoord.x, this.y - otherCoord.y);
};

// Multiplies this coordinate vector by a scalar value.
Coord.prototype.multiply = function(scalar) {
    return new Coord(this.x * scalar, this.y * scalar);
};

// Divides this coordinate vector by a scalar value. Handles division by zero gracefully.
Coord.prototype.divide = function(scalar) {
    if (scalar === 0) {
        // Return a zero vector to avoid infinite values.
        return new Coord(0, 0);
    }
    return new Coord(this.x / scalar, this.y / scalar);
};

// Calculates the magnitude (length) of the vector.
Coord.prototype.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

// Calculates the squared magnitude (length) of the vector. More performant than magnitude if only comparing lengths.
Coord.prototype.magnitudeSquared = function() {
    return this.x * this.x + this.y * this.y;
};

// Returns a new vector that is perpendicular to this one.
Coord.prototype.perpendicular = function() {
    return new Coord(-this.y, this.x);
};

// Returns a normalized (unit) vector in the same direction as this one.
Coord.prototype.normalize = function() {
    const mag = this.magnitude();
    if (mag > 0) {
        return this.divide(mag);
    }
    // If magnitude is zero, return a zero vector.
    return new Coord(0, 0);
};

// Particle class, representing a physical point in the simulation.
Arrangement.DynamicField.Particle = function(initialPosition, particleMass) {
    this.position = initialPosition; // Current position (Coord).
    this.mass = particleMass; // Mass of the particle.
    this.velocity = new Coord(0, 0); // Current velocity (Coord).
    this.acceleration = new Coord(0, 0); // Current acceleration (Coord).
};

// Applies a force to the particle, updating its acceleration.
Arrangement.DynamicField.Particle.prototype.applyForce = function(forceVector) {
    // F = ma => a = F/m
    this.acceleration = this.acceleration.add(forceVector.divide(this.mass));
};

// Spring class, representing a connection that exerts force.
Arrangement.DynamicField.Spring = function(p1, p2, length, strength) {
    this.particle1 = p1; // First particle connected by the spring.
    this.particle2 = p2; // Second particle connected by the spring.
    this.idealLength = length; // The resting length of the spring.
    this.strength = strength; // Spring constant (k in Hooke's Law).
};