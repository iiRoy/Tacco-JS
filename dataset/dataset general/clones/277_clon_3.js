(function(geomModule) {

var _DEBUG_GEOM_OPS = false; // Flag for enabling internal debugging logs

/**
 * Compares two numbers for sorting in ascending order.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} A negative value if valA < valB, zero if valA == valB, a positive value if valA > valB.
 */
function compareNumericValues(valA, valB) {
	return valA - valB;
}

// # class SolidGeometry
// Represents a 3D solid using a binary space partition (BSP) tree.
// Operations like `combine()`, `remove()`, and `overlap()` can be performed between solids.
var SolidGeometry = function() {
	/** @type {Array<SolidGeometry.Face>} */
	this.faces = [];
	/** @type {SolidGeometry.Metadata} */
	this.metadata = new SolidGeometry.Metadata();
	/** @type {boolean} */
	this.normalizedState = true; // Indicates if vertices and planes are canonicalized
	/** @type {boolean} */
	this.meshOptimized = true;   // Indicates if coplanar faces have been retesselated
};

/**
 * Default resolution for 2D geometry generation.
 * @type {number}
 */
SolidGeometry.DEFAULT_2D_RES = 32;

/**
 * Default resolution for 3D geometry generation.
 * @type {number}
 */
SolidGeometry.DEFAULT_3D_RES = 12;

/**
 * Creates a SolidGeometry instance from a list of faces.
 * @param {Array<SolidGeometry.Face>} faceList - An array of `SolidGeometry.Face` instances.
 * @returns {SolidGeometry} A new SolidGeometry object.
 */
SolidGeometry.createFromFaces = function(faceList) {
	const newSolid = new SolidGeometry();
	newSolid.faces = faceList;
	newSolid.normalizedState = false;
	newSolid.meshOptimized = false;
	return newSolid;
};

/**
 * Constructs a SolidGeometry object from generated slices.
 * Refer to SolidGeometry.Face.prototype.buildFromSlices for detailed options.
 * @param {object} options - Configuration options for slice generation.
 * @returns {SolidGeometry} A new SolidGeometry object.
 */
SolidGeometry.buildFromSlices = function(options) {
	// Create a base face (e.g., a square) to start the slicing operation.
	const baseFace = SolidGeometry.Face.createFromPoints([
		[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]
	]);
	return baseFace.buildFromSlices(options);
};

/**
 * Deserializes a SolidGeometry object from a plain JavaScript object structure.
 * The input object must have properties matching the SolidGeometry structure.
 * @param {object} rawObject - The object to deserialize.
 * @returns {SolidGeometry} A new SolidGeometry object.
 */
SolidGeometry.loadFromObject = function(rawObject) {
	if (!rawObject || !Array.isArray(rawObject.faces)) {
		console.error("Invalid object structure for SolidGeometry deserialization.");
		return new SolidGeometry(); // Return empty solid or throw error
	}
	const deserializedFaces = rawObject.faces.map(function(f) {
		return SolidGeometry.Face.fromObject(f);
	});
	let loadedSolid = SolidGeometry.createFromFaces(deserializedFaces);
	loadedSolid = loadedSolid.canonicalized(); // Apply normalization after loading
	return loadedSolid;
};

/**
 * Reconstructs a SolidGeometry from a compact binary representation.
 * @param {object} binData - The compact binary data object.
 * @returns {SolidGeometry} A new SolidGeometry object.
 * @throws {Error} If the binary data is not a valid SolidGeometry representation.
 */
SolidGeometry.loadFromBinary = function(binData) {
	if (binData['typeIdentifier'] !== "SolidGeometry") {
		throw new Error("Input data is not a SolidGeometry binary format.");
	}

	const surfacePlanes = [];
	const planeArray = binData.planeData;
	const planeCount = planeArray.length / 4;
	let currentPlaneIndex = 0;
	for (let i = 0; i < planeCount; i++) {
		const nx = planeArray[currentPlaneIndex++];
		const ny = planeArray[currentPlaneIndex++];
		const nz = planeArray[currentPlaneIndex++];
		const dist = planeArray[currentPlaneIndex++];
		const normalVec = new SolidGeometry.Vec3(nx, ny, nz);
		const plane = new SolidGeometry.SurfacePlane(normalVec, dist);
		surfacePlanes.push(plane);
	}

	const geometryPoints = [];
	const pointArray = binData.pointData;
	const pointCount = pointArray.length / 3;
	let currentPointIndex = 0;
	for (let i = 0; i < pointCount; i++) {
		const px = pointArray[currentPointIndex++];
		const py = pointArray[currentPointIndex++];
		const pz = pointArray[currentPointIndex++];
		const position = new SolidGeometry.Vec3(px, py, pz);
		const point = new SolidGeometry.Point(position);
		geometryPoints.push(point);
	}

	const sharedAttributes = binData.sharedAttributes.map(function(attr) {
		return SolidGeometry.Face.SharedAttribute.fromObject(attr);
	});

	const solidFaces = [];
	const totalFaces = binData.numFaces;
	const faceVertexCounts = binData.faceVertexCounts;
	const facePointIndices = binData.facePointIndices;
	const facePlaneIndices = binData.facePlaneIndices;
	const faceSharedIndices = binData.faceSharedIndices;

	let currentFacePointIdx = 0;
	for (let i = 0; i < totalFaces; i++) {
		const numFaceVertices = faceVertexCounts[i];
		const faceVertices = [];
		for (let j = 0; j < numFaceVertices; j++) {
			faceVertices.push(geometryPoints[facePointIndices[currentFacePointIdx++]]);
		}
		const facePlane = surfacePlanes[facePlaneIndices[i]];
		const faceShared = sharedAttributes[faceSharedIndices[i]];
		const newFace = new SolidGeometry.Face(faceVertices, faceShared, facePlane);
		solidFaces.push(newFace);
	}

	const reconstructedSolid = SolidGeometry.createFromFaces(solidFaces);
	reconstructedSolid.normalizedState = true; // Binary format implies canonicalization
	reconstructedSolid.meshOptimized = true;   // Binary format implies retesselation
	return reconstructedSolid;
};

SolidGeometry.prototype = {
	/**
	 * Retrieves the list of faces that compose this solid.
	 * @returns {Array<SolidGeometry.Face>} The array of faces.
	 */
	getFacesList: function() {
		return this.faces;
	},

	/**
	 * Performs a boolean union operation with one or more other solids.
	 * The result is a new solid representing the combined space of all inputs.
	 * Neither this solid nor the input solids are modified.
	 * @param {SolidGeometry|Array<SolidGeometry>} otherSolids - The solid(s) to combine with.
	 * @returns {SolidGeometry} A new SolidGeometry representing the union.
	 */
	combine: function(otherSolids) {
		const solidsToProcess = Array.isArray(otherSolids) ? otherSolids : [otherSolids];
		let currentResult = this;

		for (let i = 0; i < solidsToProcess.length; i++) {
			const targetSolid = solidsToProcess[i];
			if (!(targetSolid instanceof SolidGeometry)) {
				console.warn("Skipping invalid object in combine operation:", targetSolid);
				continue;
			}
			const isFinalStep = (i === (solidsToProcess.length - 1));
			currentResult = currentResult.executeCombination(targetSolid, isFinalStep, isFinalStep);
		}
		return currentResult;
	},

	/**
	 * Internal method for executing a single union operation step.
	 * @param {SolidGeometry} otherSolid - The solid to combine with.
	 * @param {boolean} shouldRetesselate - Flag to indicate if retesselation should occur.
	 * @param {boolean} shouldCanonicalize - Flag to indicate if canonicalization should occur.
	 * @returns {SolidGeometry} The result of the union.
	 */
	executeCombination: function(otherSolid, shouldRetesselate, shouldCanonicalize) {
		// Optimization: if bounding boxes don't overlap, simply concatenate faces
		if (!this.checkOverlap(otherSolid)) {
			return this.combineNonIntersecting(otherSolid);
		}

		const primaryPartition = new SolidGeometry.SpatialPartition(this.faces);
		const secondaryPartition = new SolidGeometry.SpatialPartition(otherSolid.faces);

		// Clip primary solid to secondary solid (keep parts of primary inside secondary)
		primaryPartition.clipTo(secondaryPartition, false);

		// Clip secondary solid to primary solid (keep parts of secondary outside primary)
		// This specific sequence effectively removes interior faces for union
		secondaryPartition.clipTo(primaryPartition);
		secondaryPartition.invert(); // Invert secondary to get its 'inside'
		secondaryPartition.clipTo(primaryPartition); // Clip inverted secondary by primary
		secondaryPartition.invert(); // Re-invert to get the final 'outside' part of secondary

		const combinedFaces = primaryPartition.getAllFaces().concat(secondaryPartition.getAllFaces());
		let finalSolid = SolidGeometry.createFromFaces(combinedFaces);
		finalSolid.metadata = this.metadata._merge(otherSolid.metadata);

		if (shouldRetesselate) finalSolid = finalSolid.reTesselated();
		if (shouldCanonicalize) finalSolid = finalSolid.canonicalized();
		return finalSolid;
	},

	/**
	 * Performs a union operation assuming the two solids do not intersect.
	 * Use with caution: if solids *do* intersect, the result will be incorrect.
	 * @param {SolidGeometry} otherSolid - The solid to combine with.
	 * @returns {SolidGeometry} A new SolidGeometry with concatenated faces.
	 */
	combineNonIntersecting: function(otherSolid) {
		if (_DEBUG_GEOM_OPS) {
			console.log("Combining non-intersecting solids - skipping full BSP union.");
		}
		const newFaces = this.faces.concat(otherSolid.faces);
		const resultSolid = SolidGeometry.createFromFaces(newFaces);
		resultSolid.metadata = this.metadata._merge(otherSolid.metadata);
		// If both inputs were already normalized/retesselated, the output is too.
		resultSolid.normalizedState = this.normalizedState && otherSolid.normalizedState;
		resultSolid.meshOptimized = this.meshOptimized && otherSolid.meshOptimized;
		return resultSolid;
	},

	/**
	 * Performs a boolean subtraction operation (this solid minus other solid(s)).
	 * The result is a new solid representing the space in this solid but not in the others.
	 * Neither this solid nor the input solids are modified.
	 * @param {SolidGeometry|Array<SolidGeometry>} otherSolids - The solid(s) to subtract.
	 * @returns {SolidGeometry} A new SolidGeometry representing the difference.
	 */
	remove: function(otherSolids) {
		const solidsToProcess = Array.isArray(otherSolids) ? otherSolids : [otherSolids];
		let currentResult = this;

		for (let i = 0; i < solidsToProcess.length; i++) {
			const targetSolid = solidsToProcess[i];
			if (!(targetSolid instanceof SolidGeometry)) {
				console.warn("Skipping invalid object in remove operation:", targetSolid);
				continue;
			}
			const isFinalStep = (i === (solidsToProcess.length - 1));
			currentResult = currentResult.executeRemoval(targetSolid, isFinalStep, isFinalStep);
		}
		return currentResult;
	},

	/**
	 * Internal method for executing a single subtraction operation step.
	 * @param {SolidGeometry} otherSolid - The solid to subtract.
	 * @param {boolean} shouldRetesselate - Flag to indicate if retesselation should occur.
	 * @param {boolean} shouldCanonicalize - Flag to indicate if canonicalization should occur.
	 * @returns {SolidGeometry} The result of the subtraction.
	 */
	executeRemoval: function(otherSolid, shouldRetesselate, shouldCanonicalize) {
		const primaryPartition = new SolidGeometry.SpatialPartition(this.faces);
		const secondaryPartition = new SolidGeometry.SpatialPartition(otherSolid.faces);

		primaryPartition.invert(); // Invert primary solid to clip what's *inside* it
		primaryPartition.clipTo(secondaryPartition); // Clip primary by secondary (remove parts of primary that overlap secondary)
		secondaryPartition.clipTo(primaryPartition, true); // Clip secondary by primary (keep parts of secondary that are *inside* primary)
		primaryPartition.addFaces(secondaryPartition.getAllFaces()); // Add relevant parts of secondary to primary
		primaryPartition.invert(); // Invert back to get the final shape

		let finalSolid = SolidGeometry.createFromFaces(primaryPartition.getAllFaces());
		finalSolid.metadata = this.metadata._merge(otherSolid.metadata);

		if (shouldRetesselate) finalSolid = finalSolid.reTesselated();
		if (shouldCanonicalize) finalSolid = finalSolid.canonicalized();
		return finalSolid;
	},

	/**
	 * Performs a boolean intersection operation with one or more other solids.
	 * The result is a new solid representing the shared space of all inputs.
	 * Neither this solid nor the input solids are modified.
	 * @param {SolidGeometry|Array<SolidGeometry>} otherSolids - The solid(s) to intersect with.
	 * @returns {SolidGeometry} A new SolidGeometry representing the intersection.
	 */
	overlap: function(otherSolids) {
		const solidsToProcess = Array.isArray(otherSolids) ? otherSolids : [otherSolids];
		let currentResult = this;

		for (let i = 0; i < solidsToProcess.length; i++) {
			const targetSolid = solidsToProcess[i];
			if (!(targetSolid instanceof SolidGeometry)) {
				console.warn("Skipping invalid object in overlap operation:", targetSolid);
				continue;
			}
			const isFinalStep = (i === (solidsToProcess.length - 1));
			currentResult = currentResult.executeOverlap(targetSolid, isFinalStep, isFinalStep);
		}
		return currentResult;
	},

	/**
	 * Internal method for executing a single intersection operation step.
	 * @param {SolidGeometry} otherSolid - The solid to intersect with.
	 * @param {boolean} shouldRetesselate - Flag to indicate if retesselation should occur.
	 * @param {boolean} shouldCanonicalize - Flag to indicate if canonicalization should occur.
	 * @returns {SolidGeometry} The result of the intersection.
	 */
	executeOverlap: function(otherSolid, shouldRetesselate, shouldCanonicalize) {
		const primaryPartition = new SolidGeometry.SpatialPartition(this.faces);
		const secondaryPartition = new SolidGeometry.SpatialPartition(otherSolid.faces);

		primaryPartition.invert(); // Invert primary
		secondaryPartition.clipTo(primaryPartition); // Clip secondary by inverted primary (keep parts of secondary outside primary)
		secondaryPartition.invert(); // Invert secondary back
		primaryPartition.clipTo(secondaryPartition); // Clip primary by secondary (keep parts of primary inside secondary)
		secondaryPartition.clipTo(primaryPartition); // Clip secondary again by primary (keep parts of secondary inside primary)
		primaryPartition.addFaces(secondaryPartition.getAllFaces()); // Add relevant parts of secondary to primary
		primaryPartition.invert(); // Invert primary back to get the final intersection

		let finalSolid = SolidGeometry.createFromFaces(primaryPartition.getAllFaces());
		finalSolid.metadata = this.metadata._merge(otherSolid.metadata);

		if (shouldRetesselate) finalSolid = finalSolid.reTesselated();
		if (shouldCanonicalize) finalSolid = finalSolid.canonicalized();
		return finalSolid;
	},

	/**
	 * Creates a new SolidGeometry with its solid and empty spaces swapped.
	 * This solid instance remains unchanged.
	 * @returns {SolidGeometry} A new SolidGeometry representing the inverse.
	 */
	flipSolid: function() {
		const invertedFaces = this.faces.map(function(face) {
			return face.getFlipped(); // Assuming 'getFlipped' returns a new flipped face
		});
		return SolidGeometry.createFromFaces(invertedFaces);
		// Note: Metadata inversion might be more complex depending on its structure.
		// For now, it's not explicitly handled here.
	},

	/**
	 * Applies an affine transformation matrix to the solid.
	 * Returns a new SolidGeometry object; the original is not modified.
	 * This method optimizes transformations by caching transformed points and planes.
	 * @param {SolidGeometry.Matrix4} transformMatrix - The 4x4 transformation matrix.
	 * @returns {SolidGeometry} A new SolidGeometry object after transformation.
	 */
	applyTransformation: function(transformMatrix) {
		if (!transformMatrix || typeof transformMatrix.isMirroring !== 'function') {
			console.error("Invalid transformation matrix provided.");
			return this; // Return original solid if matrix is invalid
		}

		const isMirrorTransformation = transformMatrix.isMirroring();
		const cachedTransformedPoints = {}; // Stores transformed Point objects by their original tag
		const cachedTransformedPlanes = {}; // Stores transformed SurfacePlane objects by their original tag

		const transformedFaces = this.faces.map(function(originalFace) {
			let newPlane;
			const originalPlane = originalFace.surfacePlane;
			const planeIdentifier = originalPlane.getIdentifier(); // Assuming a method to get unique tag
			if (planeIdentifier in cachedTransformedPlanes) {
				newPlane = cachedTransformedPlanes[planeIdentifier];
			} else {
				newPlane = originalPlane.transform(transformMatrix); // Assuming SurfacePlane has a transform method
				cachedTransformedPlanes[planeIdentifier] = newPlane;
			}

			const newVertices = originalFace.vertices.map(function(originalVertex) {
				let newVertex;
				const vertexIdentifier = originalVertex.getIdentifier(); // Assuming a method to get unique tag
				if (vertexIdentifier in cachedTransformedPoints) {
					newVertex = cachedTransformedPoints[vertexIdentifier];
				} else {
					newVertex = originalVertex.transform(transformMatrix); // Assuming Point has a transform method
					cachedTransformedPoints[vertexIdentifier] = newVertex;
				}
				return newVertex;
			});

			// If the transformation includes mirroring, the winding order of vertices must be reversed.
			if (isMirrorTransformation) {
				newVertices.reverse();
			}
			return new SolidGeometry.Face(newVertices, originalFace.sharedAttributes, newPlane);
		});

		const resultSolid = SolidGeometry.createFromFaces(transformedFaces);
		resultSolid.metadata = this.metadata._transform(transformMatrix); // Assuming metadata also has a transform method
		resultSolid.meshOptimized = this.meshOptimized;
		resultSolid.normalizedState = this.normalizedState; // Transformation doesn't change normalization status directly
		return resultSolid;
	},

	/**
	 * Exports the solid geometry to an STL (Stereolithography) string format.
	 * @returns {string} The STL string representation of the solid.
	 */
	exportToStl: function() {
		if (this.faces.length === 0) return "solid csg.js\nendsolid csg.js\n";

		let stlContent = "solid csg.js\n";
		this.faces.forEach(function(face) {
			stlContent += face.toStlFormat(); // Assuming Face has a toStlFormat method
		});
		stlContent += "endsolid csg.js\n";
		return stlContent;
	},

	/**
	 * Exports the solid geometry to an AMF (Additive Manufacturing File) string format.
	 * @param {object} [metaInfo] - Optional metadata (e.g., unit) to include in the AMF header.
	 * @returns {string} The AMF string representation of the solid.
	 */
	exportToAmf: function(metaInfo) {
		let amfContent = `<?xml version="1.0" encoding="UTF-8"?>\n<amf${metaInfo && metaInfo.unit ? ` unit="${metaInfo.unit}"` : ""}>\n`;

		// Add custom metadata
		for (const key in metaInfo) {
			if (key !== "unit") { // 'unit' is handled in the root tag
				amfContent += `<metadata type="${key}">${metaInfo[key]}</metadata>\n`;
			}
		}

		amfContent += "<object id=\"0\">\n<mesh>\n<vertices>\n";

		// Collect all unique vertices and map them to indices for AMF vertex list
		const uniqueVertices = [];
		const vertexToAmfIndex = new Map();
		let vertexCounter = 0;

		this.faces.forEach(face => {
			face.vertices.forEach(vertex => {
				const vertexId = vertex.getIdentifier(); // Unique identifier for the vertex
				if (!vertexToAmfIndex.has(vertexId)) {
					vertexToAmfIndex.set(vertexId, vertexCounter);
					uniqueVertices.push(vertex);
					vertexCounter++;
				}
			});
		});

		uniqueVertices.forEach(vertex => {
			amfContent += vertex.toAmfFormat(); // Assuming Point has a toAmfFormat method
		});
		amfContent += "</vertices>\n";

		// Add volumes (polygons)
		amfContent += "<volume>\n";
		// Default color for faces without specific attributes
		const defaultColor = { r: 1, g: 0.4, b: 1, a: 1 }; // Magenta

		this.faces.forEach(face => {
			let faceColor = defaultColor;
			if (face.sharedAttributes && face.sharedAttributes.color) {
				const c = face.sharedAttributes.color;
				faceColor = { r: c[0], g: c[1], b: c[2], a: c.length > 3 ? c[3] : 1 };
			} else if (face.color) { // Fallback if color is directly on face (less common)
				const c = face.color;
				faceColor = { r: c[0], g: c[1], b: c[2], a: c.length > 3 ? c[3] : 1 };
			}
			amfContent += `<color><r>${faceColor.r}</r><g>${faceColor.g}</g><b>${faceColor.b}</b>${faceColor.a !== undefined ? `<a>${faceColor.a}</a>` : ""}</color>\n`;

			// AMF requires triangles. If a face has more than 3 vertices, triangulate it.
			// This simple triangulation assumes convex polygons.
			if (face.vertices.length < 3) {
				if (_DEBUG_GEOM_OPS) console.warn("Skipping face with less than 3 vertices in AMF export.");
				return;
			}

			const firstVertexAmfIndex = vertexToAmfIndex.get(face.vertices[0].getIdentifier());
			for (let i = 1; i < face.vertices.length - 1; i++) {
				const secondVertexAmfIndex = vertexToAmfIndex.get(face.vertices[i].getIdentifier());
				const thirdVertexAmfIndex = vertexToAmfIndex.get(face.vertices[i + 1].getIdentifier());
				amfContent += `<triangle><v1>${firstVertexAmfIndex}</v1><v2>${secondVertexAmfIndex}</v2><v3>${thirdVertexAmfIndex}</v3></triangle>\n`;
			}
		});
		amfContent += "</volume>\n";
		amfContent += "</mesh>\n</object>\n";
		amfContent += "</amf>\n";
		return amfContent;
	},

	/**
	 * Exports the solid geometry to an X3D string format.
	 * This method generates a basic X3D IndexedFaceSet.
	 * @returns {string} The X3D string representation of the solid.
	 */
	exportToX3d: function() {
		// x3dMaterialGroups:
		// key: a color string (e.g., "0 1 1" for yellow)
		// value: an array of strings specifying faces of this color,
		//        represented as space-separated indices into vertexCoordinates array.
		const x3dMaterialGroups = {};
		const vertexCoordinates = []; // List of coordinates as "x y z" strings
		const pointIdToCoordIndex = new Map(); // Maps unique point identifiers to their index in vertexCoordinates

		let coordIndexCounter = 0;

		this.faces.forEach(face => {
			// Determine face color
			let red = 0.0, green = 0.0, blue = 1.0; // Default color is blue
			if (face.sharedAttributes && face.sharedAttributes.color) {
				red = face.sharedAttributes.color[0];
				green = face.sharedAttributes.color[1];
				blue = face.sharedAttributes.color[2];
			}
			const colorKey = `${red.toFixed(4)} ${green.toFixed(4)} ${blue.toFixed(4)}`;

			if (!x3dMaterialGroups[colorKey]) {
				x3dMaterialGroups[colorKey] = [];
			}

			const faceVertexIndices = [];
			face.vertices.forEach(vertex => {
				const vertexId = vertex.getIdentifier();
				if (!pointIdToCoordIndex.has(vertexId)) {
					vertexCoordinates.push(`${vertex.position._x.toFixed(6)} ${vertex.position._y.toFixed(6)} ${vertex.position._z.toFixed(6)}`);
					pointIdToCoordIndex.set(vertexId, coordIndexCounter++);
				}
				faceVertexIndices.push(pointIdToCoordIndex.get(vertexId));
			});
			x3dMaterialGroups[colorKey].push(faceVertexIndices.join(" "));
		});

		// Build the X3D scene string
		let x3dContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		x3dContent += `<X3D profile='Interchange' version='3.3' \n`;
		x3dContent += `     xmlns:xsd='http://www.w3.org/2001/XMLSchema-instance' \n`;
		x3dContent += `     xsd:noNamespaceSchemaLocation='http://www.web3d.org/specifications/x3d-3.3.xsd'>\n`;
		x3dContent += `<Scene>\n`;

		for (const colorKey in x3dMaterialGroups) {
			const [r, g, b] = colorKey.split(' ').map(Number);
			x3dContent += `<Shape>\n`;
			x3dContent += `<Appearance>\n`;
			x3dContent += `<Material diffuseColor='${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)}'/>\n`;
			x3dContent += `</Appearance>\n`;
			x3dContent += `<IndexedFaceSet coordIndex='${x3dMaterialGroups[colorKey].join(" -1 ")} -1'>\n`;
			x3dContent += `<Coordinate point='${vertexCoordinates.join(" ")}'/>\n`;
			x3dContent += `</IndexedFaceSet>\n`;
			x3dContent += `</Shape>\n`;
		}

		x3dContent += `</Scene>\n`;
		x3dContent += `</X3D>\n`;
		return x3dContent;
	},

	/**
	 * Determines if this solid's bounding box overlaps with another solid's bounding box.
	 * This is a quick preliminary check to optimize boolean operations.
	 * @param {SolidGeometry} otherSolid - The other solid to check for overlap.
	 * @returns {boolean} True if bounding boxes overlap, false otherwise.
	 */
	checkOverlap: function(otherSolid) {
		// Implement bounding box calculation and overlap check here.
		// For now, a simplified placeholder: always assume overlap for safety.
		// In a real implementation, this would involve calculating min/max coordinates.
		if (_DEBUG_GEOM_OPS) {
			console.log("Bounding box overlap check placeholder: always returning true.");
		}
		return true;
	}
	// Many other methods like canonicalized(), reTesselated(), expand(), contract() etc.
	// would follow here, maintaining the same cloning principles.
};

// Expose SolidGeometry to the module or global scope
geomModule.SolidGeometry = SolidGeometry;

})(this); // Assuming 'this' refers to the global object or a module export object.