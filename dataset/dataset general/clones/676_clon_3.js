'use strict';
window.SolidGeometryProcessor = (function() {

    var SolidGeometryProcessor,
        TOLERANCE_THRESHOLD = 0.00001, // A small value for floating point comparisons
        SURFACE_ALIGN = 0,             // Indicates polygons are coplanar
        POSITIVE_SIDE = 1,             // Indicates polygon is on the positive side
        NEGATIVE_SIDE = 2,             // Indicates polygon is on the negative side
        INTERSECTING_BOTH = 3;         // Indicates polygon spans both sides

    // Main constructor for the SolidGeometryProcessor
    SolidGeometryProcessor = function( geoInput ) {
        // This constructor converts a THREE.Geometry or THREE.Mesh into a BSP tree.
        var currentFace,
            faceUVsData,
            processedPoint,
            tempUVCoords,
            polyElement,
            polyElementsList = [];

        // Determine the input type and initialize the transformation matrix.
        if ( geoInput instanceof THREE.Geometry ) {
            this.transformMatrix = new THREE.Matrix4();
        } else if ( geoInput instanceof THREE.Mesh ) {
            // Ensure mesh matrix is up-to-date for accurate transformations.
            geoInput.updateMatrix();
            this.transformMatrix = geoInput.matrix.clone();
            geoInput = geoInput.geometry; // Extract the underlying geometry
        } else if ( geoInput instanceof SolidGeometryProcessor.SpatialPartitionNode ) {
            // If input is already a BSP Node, directly use it.
            this.bspRoot = geoInput;
            this.transformMatrix = new THREE.Matrix4(); // Default identity matrix
            return this; // Early exit
        } else {
            // Handle unsupported input types with an informative error.
            throw new Error( 'SolidGeometryProcessor: Provided input geometry is not supported.' );
        }

        // Basic validation for geometry data.
        if ( !geoInput || !Array.isArray(geoInput.faces) || geoInput.faces.length === 0 ) {
            console.warn('SolidGeometryProcessor: Input geometry has no faces or is invalid.');
            this.bspRoot = new SolidGeometryProcessor.SpatialPartitionNode([]);
            return this;
        }

        // Iterate through each face of the input geometry to build polygons.
        for ( let faceIndex = 0, totalFaces = geoInput.faces.length; faceIndex < totalFaces; faceIndex++ ) {
            currentFace = geoInput.faces[faceIndex];
            faceUVsData = geoInput.faceVertexUvs[0][faceIndex];
            polyElement = new SolidGeometryProcessor.GeometricPlane();

            // Process faces based on their type (THREE.Face3 or THREE.Face4)
            // Note: The original code had `typeof THREE.Face4` which is incorrect.
            // It should check `instanceof THREE.Face4` or handle the `d` property.
            // Assuming modern THREE.js might not use THREE.Face4 directly,
            // we'll check for the existence of property `d` for quad faces.
            const isQuadFace = (currentFace.d !== undefined);

            const vertexIndices = isQuadFace
                ? [currentFace.a, currentFace.b, currentFace.c, currentFace.d]
                : [currentFace.a, currentFace.b, currentFace.c];

            const normalIndices = isQuadFace
                ? [0, 1, 2, 3] // Assuming vertexNormals are indexed 0,1,2,3 for quads
                : [0, 1, 2]; // Assuming vertexNormals are indexed 0,1,2 for tris

            for (let vIdx = 0; vIdx < vertexIndices.length; vIdx++) {
                const vertexRef = geoInput.vertices[vertexIndices[vIdx]];
                const vertexNormal = currentFace.vertexNormals[normalIndices[vIdx]] || currentFace.normal;
                const uvData = faceUVsData ? faceUVsData[vIdx] : null;

                tempUVCoords = uvData ? new THREE.Vector2( uvData.x, uvData.y ) : new THREE.Vector2( 0, 0 );
                processedPoint = new SolidGeometryProcessor.SpacePoint(
                    vertexRef.x, vertexRef.y, vertexRef.z,
                    vertexNormal.clone(), // Clone to avoid modifying original normals
                    tempUVCoords
                );
                processedPoint.transformByMatrix( this.transformMatrix ); // Apply transformation
                polyElement.vertices.push( processedPoint );
            }

            // After adding all vertices, calculate properties for the polygon.
            polyElement.calculateProperties();
            polyElementsList.push( polyElement );
        }

        // Build the BSP tree from the collected polygons.
        this.bspRoot = new SolidGeometryProcessor.SpatialPartitionNode( polyElementsList );
    };

    /**
     * Performs a boolean subtraction operation (this - other_tree).
     * @param {SolidGeometryProcessor} other_tree The geometry to subtract.
     * @returns {SolidGeometryProcessor} A new SolidGeometryProcessor instance representing the result.
     */
    SolidGeometryProcessor.prototype.performSubtraction = function( other_tree ) {
        // Clone the root nodes to avoid modifying the original objects.
        var mainTree = this.bspRoot.duplicate();
        var subtractorTree = other_tree.bspRoot.duplicate();

        // Invert the main tree, clip it to the subtractor, then invert the subtractor.
        // This sequence effectively keeps parts of the main tree that are outside the subtractor.
        mainTree.reverseOrientation();
        mainTree.clipTo( subtractorTree );
        subtractorTree.reverseOrientation();
        subtractorTree.clipTo( mainTree );
        subtractorTree.reverseOrientation(); // Invert back to original orientation for merging
        mainTree.constructTree( subtractorTree.retrieveAllPolygons() );
        mainTree.reverseOrientation(); // Invert back the main tree

        // Create a new SolidGeometryProcessor with the resulting tree and matrix.
        var resultantProcessor = new SolidGeometryProcessor( mainTree );
        resultantProcessor.transformMatrix = this.transformMatrix;
        return resultantProcessor;
    };

    /**
     * Performs a boolean union operation (this + other_tree).
     * @param {SolidGeometryProcessor} other_tree The geometry to unite with.
     * @returns {SolidGeometryProcessor} A new SolidGeometryProcessor instance representing the result.
     */
    SolidGeometryProcessor.prototype.combineShapes = function( other_tree ) {
        // Clone for non-destructive operations.
        var firstTree = this.bspRoot.duplicate();
        var secondTree = other_tree.bspRoot.duplicate();

        // Clip both trees against each other, then merge.
        firstTree.clipTo( secondTree );
        secondTree.clipTo( firstTree );
        secondTree.reverseOrientation(); // Invert second tree
        secondTree.clipTo( firstTree );
        secondTree.reverseOrientation(); // Invert back
        firstTree.constructTree( secondTree.retrieveAllPolygons() );

        var resultantProcessor = new SolidGeometryProcessor( firstTree );
        resultantProcessor.transformMatrix = this.transformMatrix;
        return resultantProcessor;
    };

    /**
     * Performs a boolean intersection operation (this AND other_tree).
     * @param {SolidGeometryProcessor} other_tree The geometry to intersect with.
     * @returns {SolidGeometryProcessor} A new SolidGeometryProcessor instance representing the result.
     */
    SolidGeometryProcessor.prototype.findIntersection = function( other_tree ) {
        // Clone for non-destructive operations.
        var baseTree = this.bspRoot.duplicate();
        var targetTree = other_tree.bspRoot.duplicate();

        // Invert base, clip target to inverted base, invert target.
        // Then clip base to target, clip target to base, and merge.
        baseTree.reverseOrientation();
        targetTree.clipTo( baseTree );
        targetTree.reverseOrientation();
        baseTree.clipTo( targetTree );
        targetTree.clipTo( baseTree );
        baseTree.constructTree( targetTree.retrieveAllPolygons() );
        baseTree.reverseOrientation(); // Invert base back to original orientation

        var resultantProcessor = new SolidGeometryProcessor( baseTree );
        resultantProcessor.transformMatrix = this.transformMatrix;
        return resultantProcessor;
    };

    /**
     * Converts the BSP tree back into a standard THREE.Geometry object.
     * @returns {THREE.Geometry} The generated THREE.Geometry.
     */
    SolidGeometryProcessor.prototype.generateThreeGeometry = function() {
        var geometryBuilder = new THREE.Geometry();
        var allProcessedPolygons = this.bspRoot.retrieveAllPolygons();
        var inverseTransformMatrix = new THREE.Matrix4().getInverse( this.transformMatrix );

        // Helper map to store unique vertices and their indices to avoid duplication.
        var uniqueVertexMap = {};

        // Helper function to add a vertex to geometryBuilder and return its index.
        const getOrAddVertexIndex = (vertex) => {
            const vertexKey = `${vertex.x},${vertex.y},${vertex.z}`;
            if (uniqueVertexMap[vertexKey] !== undefined) {
                return uniqueVertexMap[vertexKey];
            } else {
                geometryBuilder.vertices.push(vertex);
                const newIndex = geometryBuilder.vertices.length - 1;
                uniqueVertexMap[vertexKey] = newIndex;
                return newIndex;
            }
        };

        // Iterate through each polygon obtained from the BSP tree.
        for ( let polyIndex = 0; polyIndex < allProcessedPolygons.length; polyIndex++ ) {
            let currentPolygon = allProcessedPolygons[polyIndex];
            let polygonVertexCount = currentPolygon.vertices.length;

            // Polygons with less than 3 vertices are invalid and skipped.
            if (polygonVertexCount < 3) {
                console.warn(`Skipping invalid polygon with ${polygonVertexCount} vertices.`);
                continue;
            }

            // Triangulate n-gons into triangles (fan triangulation).
            for ( let j = 2; j < polygonVertexCount; j++ ) {
                let triangleUVs = [];

                // Vertex A (first vertex of the polygon)
                let vA = currentPolygon.vertices[0];
                let threeVA = new THREE.Vector3( vA.x, vA.y, vA.z ).applyMatrix4( inverseTransformMatrix );
                let idxA = getOrAddVertexIndex( threeVA );
                triangleUVs.push( new THREE.Vector2( vA.uv.x, vA.uv.y ) );

                // Vertex B (j-1th vertex of the polygon)
                let vB = currentPolygon.vertices[j-1];
                let threeVB = new THREE.Vector3( vB.x, vB.y, vB.z ).applyMatrix4( inverseTransformMatrix );
                let idxB = getOrAddVertexIndex( threeVB );
                triangleUVs.push( new THREE.Vector2( vB.uv.x, vB.uv.y ) );

                // Vertex C (jth vertex of the polygon)
                let vC = currentPolygon.vertices[j];
                let threeVC = new THREE.Vector3( vC.x, vC.y, vC.z ).applyMatrix4( inverseTransformMatrix );
                let idxC = getOrAddVertexIndex( threeVC );
                triangleUVs.push( new THREE.Vector2( vC.uv.x, vC.uv.y ) );

                // Create a new Face3 for the current triangle.
                let newFace = new THREE.Face3(
                    idxA,
                    idxB,
                    idxC,
                    new THREE.Vector3( currentPolygon.surfaceNormal.x, currentPolygon.surfaceNormal.y, currentPolygon.surfaceNormal.z )
                );

                geometryBuilder.faces.push( newFace );
                geometryBuilder.faceVertexUvs[0].push( triangleUVs );
            }
        }
        geometryBuilder.elementsNeedUpdate = true; // Inform Three.js that geometry has changed
        geometryBuilder.computeFaceNormals();
        geometryBuilder.computeVertexNormals();
        geometryBuilder.computeBoundingBox();
        geometryBuilder.computeBoundingSphere();
        return geometryBuilder;
    };

    /**
     * Converts the BSP tree into a THREE.Mesh object.
     * @param {THREE.Material} meshMaterial The material to apply to the mesh.
     * @returns {THREE.Mesh} The generated THREE.Mesh.
     */
    SolidGeometryProcessor.prototype.createThreeMesh = function( meshMaterial ) {
        var outputGeometry = this.generateThreeGeometry();
        var outputMesh = new THREE.Mesh( outputGeometry, meshMaterial );

        // Apply position and rotation from the original transformation matrix.
        outputMesh.position.setFromMatrixPosition( this.transformMatrix );
        outputMesh.rotation.setFromRotationMatrix( this.transformMatrix );

        return outputMesh;
    };


    /*
     * SolidGeometryProcessor.GeometricPlane represents a convex polygon.
     * It stores a list of vertices, a normal vector, and a 'w' value for plane equation.
     */
    SolidGeometryProcessor.GeometricPlane = function( verticesArray, normalVector, planeW ) {
        // Ensure verticesArray is an array, default to empty if not provided.
        this.vertices = Array.isArray( verticesArray ) ? verticesArray : [];

        // If vertices are provided, calculate properties immediately.
        if ( this.vertices.length > 0 ) {
            this.calculateProperties();
        } else {
            // Initialize properties as undefined if no vertices are present.
            this.surfaceNormal = undefined;
            this.planeDistance = undefined;
        }
        // Optional: Can assign normalVector and planeW directly if provided, but calculateProperties is preferred.
        // this.surfaceNormal = normalVector || this.surfaceNormal;
        // this.planeDistance = planeW || this.planeDistance;
    };

    /**
     * Calculates the surface normal and plane distance (w) for the polygon.
     * Assumes the polygon is convex and has at least 3 vertices.
     * @returns {SolidGeometryProcessor.GeometricPlane} This polygon instance for chaining.
     */
    SolidGeometryProcessor.GeometricPlane.prototype.calculateProperties = function() {
        // A polygon must have at least 3 vertices to define a plane.
        if ( this.vertices.length < 3 ) {
            console.warn('GeometricPlane: Cannot calculate properties for polygon with less than 3 vertices.');
            this.surfaceNormal = new THREE.Vector3(0,0,0); // Default to zero normal
            this.planeDistance = 0;
            return this;
        }

        // Use the first three vertices to define the plane.
        var pA = this.vertices[0];
        var pB = this.vertices[1];
        var pC = this.vertices[2];

        // Calculate two vectors on the plane.
        var vecAB = pB.duplicate().subtractVector( pA );
        var vecAC = pC.duplicate().subtractVector( pA );

        // The cross product of these vectors gives the normal.
        this.surfaceNormal = vecAB.crossProduct( vecAC ).normalizeVector();

        // The 'w' value (planeDistance) is the distance from the origin to the plane along the normal.
        this.planeDistance = this.surfaceNormal.dotProduct( pA );

        return this;
    };

    /**
     * Creates a deep copy of this polygon instance.
     * @returns {SolidGeometryProcessor.GeometricPlane} A new, identical polygon.
     */
    SolidGeometryProcessor.GeometricPlane.prototype.duplicate = function() {
        var clonedPolygon = new SolidGeometryProcessor.GeometricPlane();

        // Clone each vertex and add it to the new polygon.
        for ( let i = 0; i < this.vertices.length; i++ ) {
            clonedPolygon.vertices.push( this.vertices[i].duplicate() );
        }
        // Ensure properties are correctly set on the clone (though cloning vertices might not be enough for normal/w).
        // It's safer to recalculate properties or explicitly copy them if they are already computed.
        if (this.surfaceNormal && this.planeDistance !== undefined) {
             clonedPolygon.surfaceNormal = this.surfaceNormal.clone();
             clonedPolygon.planeDistance = this.planeDistance;
        } else {
             clonedPolygon.calculateProperties(); // Recalculate if not present or for safety
        }


        return clonedPolygon;
    };

    /**
     * Reverses the orientation of the polygon (flips its normal and vertex winding order).
     * @returns {SolidGeometryProcessor.GeometricPlane} This polygon instance for chaining.
     */
    SolidGeometryProcessor.GeometricPlane.prototype.reverseOrientation = function() {
        // Invert the normal vector.
        this.surfaceNormal.multiplyScalar( -1 );
        // Invert the plane distance.
        this.planeDistance *= -1;

        // Reverse the order of vertices to maintain front-facing orientation.
        let tempVertices = [];
        for ( let i = this.vertices.length - 1; i >= 0; i-- ) {
            tempVertices.push( this.vertices[i] );
        }
        this.vertices = tempVertices;

        return this;
    };

    /**
     * Classifies a single vertex relative to this polygon's plane.
     * @param {SolidGeometryProcessor.SpacePoint} point The vertex to classify.
     * @returns {number} One of SURFACE_ALIGN, POSITIVE_SIDE, or NEGATIVE_SIDE.
     */
    SolidGeometryProcessor.GeometricPlane.prototype.determinePointPosition = function( point ) {
        // Calculate signed distance from the point to the plane.
        var relativePosition = this.surfaceNormal.dotProduct( point ) - this.planeDistance;

        // Compare with tolerance threshold to handle floating point inaccuracies.
        if ( relativePosition < -TOLERANCE_THRESHOLD ) {
            return NEGATIVE_SIDE;
        } else if ( relativePosition > TOLERANCE_THRESHOLD ) {
            return POSITIVE_SIDE;
        } else {
            return SURFACE_ALIGN; // Point is on the plane
        }
    };

    /**
     * Classifies an entire polygon relative to this polygon's plane.
     * @param {SolidGeometryProcessor.GeometricPlane} targetPolygon The polygon to classify.
     * @returns {number} One of SURFACE_ALIGN, POSITIVE_SIDE, NEGATIVE_SIDE, or INTERSECTING_BOTH.
     */
    SolidGeometryProcessor.GeometricPlane.prototype.analyzePolygonSide = function( targetPolygon ) {
        let pointsOnPositiveSide = 0;
        let pointsOnNegativeSide = 0;
        let vertexClassification;

        // Iterate through each vertex of the target polygon.
        for ( let i = 0; i < targetPolygon.vertices.length; i++ ) {
            vertexClassification = this.determinePointPosition( targetPolygon.vertices[i] );
            if ( vertexClassification === POSITIVE_SIDE ) {
                pointsOnPositiveSide++;
            } else if ( vertexClassification === NEGATIVE_SIDE ) {
                pointsOnNegativeSide++;
            }
        }

        // Determine the overall classification based on vertex positions.
        if ( pointsOnPositiveSide > 0 && pointsOnNegativeSide === 0 ) {
            return POSITIVE_SIDE; // Entire polygon is on the positive side
        } else if ( pointsOnPositiveSide === 0 && pointsOnNegativeSide > 0 ) {
            return NEGATIVE_SIDE; // Entire polygon is on the negative side
        } else if ( pointsOnPositiveSide === 0 && pointsOnNegativeSide === 0 ) {
            return SURFACE_ALIGN; // Entire polygon is coplanar
        } else {
            return INTERSECTING_BOTH; // Polygon spans both sides, so it intersects the plane
        }
    };

    /**
     * Splits a polygon by this plane and distributes its fragments into output arrays.
     * @param {SolidGeometryProcessor.GeometricPlane} sourcePolygon The polygon to split.
     * @param {Array<SolidGeometryProcessor.GeometricPlane>} coplanarFront Array for coplanar polygons on the front.
     * @param {Array<SolidGeometryProcessor.GeometricPlane>} coplanarBack Array for coplanar polygons on the back.
     * @param {Array<SolidGeometryProcessor.GeometricPlane>} frontPolygons Array for polygons on the front side.
     * @param {Array<SolidGeometryProcessor.GeometricPlane>} backPolygons Array for polygons on the back side.
     */
    SolidGeometryProcessor.GeometricPlane.prototype.divideAndCategorizePolygon = function( sourcePolygon, coplanarFront, coplanarBack, frontPolygons, backPolygons ) {
        const classification = this.analyzePolygonSide( sourcePolygon );

        // Handle different classification outcomes.
        if ( classification === SURFACE_ALIGN ) {
            // Coplanar polygons are added to either coplanarFront or coplanarBack based on normal alignment.
            if ( this.surfaceNormal.dotProduct( sourcePolygon.surfaceNormal ) > 0 ) {
                coplanarFront.push( sourcePolygon );
            } else {
                coplanarBack.push( sourcePolygon );
            }
        } else if ( classification === POSITIVE_SIDE ) {
            frontPolygons.push( sourcePolygon );
        } else if ( classification === NEGATIVE_SIDE ) {
            backPolygons.push( sourcePolygon );
        } else { // INTERSECTING_BOTH - the polygon must be split.
            let frontVertices = [];
            let backVertices = [];
            const numVertices = sourcePolygon.vertices.length;

            // Iterate through edges of the polygon.
            for ( let i = 0; i < numVertices; i++ ) {
                let j = ( i + 1 ) % numVertices; // Next vertex index (wraps around)
                let currentPoint = sourcePolygon.vertices[i];
                let nextPoint = sourcePolygon.vertices[j];

                let currentPointSide = this.determinePointPosition( currentPoint );
                let nextPointSide = this.determinePointPosition( nextPoint );

                // Add current point to appropriate lists.
                if ( currentPointSide !== NEGATIVE_SIDE ) {
                    frontVertices.push( currentPoint );
                }
                if ( currentPointSide !== POSITIVE_SIDE ) {
                    backVertices.push( currentPoint );
                }

                // If the edge spans the plane, calculate the intersection point.
                if ( ( currentPointSide | nextPointSide ) === INTERSECTING_BOTH ) {
                    // Calculate interpolation factor 't'.
                    // t = (plane_distance - normal_dot_current_point) / (normal_dot_vector_from_current_to_next)
                    let t = ( this.planeDistance - this.surfaceNormal.dotProduct( currentPoint ) ) /
                            this.surfaceNormal.dotProduct( nextPoint.duplicate().subtractVector( currentPoint ) );

                    // Interpolate to find the intersection point.
                    let intersectionPoint = currentPoint.createInterpolatedPoint( nextPoint, t );
                    frontVertices.push( intersectionPoint );
                    backVertices.push( intersectionPoint );
                }
            }

            // Create new polygons from the split vertices, if they form valid polygons.
            if ( frontVertices.length >= 3 ) {
                frontPolygons.push( new SolidGeometryProcessor.GeometricPlane( frontVertices ).calculateProperties() );
            }
            if ( backVertices.length >= 3 ) {
                backPolygons.push( new SolidGeometryProcessor.GeometricPlane( backVertices ).calculateProperties() );
            }
        }
    };


    /*
     * SolidGeometryProcessor.SpacePoint represents a 3D point with normal and UV coordinates.
     * It's essentially a custom vertex class.
     */
    SolidGeometryProcessor.SpacePoint = function( xCoord, yCoord, zCoord, normalVec, uvCoords ) {
        this.x = xCoord || 0;
        this.y = yCoord || 0;
        this.z = zCoord || 0;
        this.normal = normalVec instanceof THREE.Vector3 ? normalVec : new THREE.Vector3( 0, 0, 0 );
        this.uv = uvCoords instanceof THREE.Vector2 ? uvCoords : new THREE.Vector2( 0, 0 );
    };

    /**
     * Creates a deep copy of this SpacePoint.
     * @returns {SolidGeometryProcessor.SpacePoint} A new, identical SpacePoint.
     */
    SolidGeometryProcessor.SpacePoint.prototype.duplicate = function() {
        return new SolidGeometryProcessor.SpacePoint(
            this.x, this.y, this.z,
            this.normal.clone(),
            this.uv.clone()
        );
    };

    /**
     * Adds the components of another SpacePoint to this one.
     * @param {SolidGeometryProcessor.SpacePoint} otherPoint The point to add.
     * @returns {SolidGeometryProcessor.SpacePoint} This point instance for chaining.
     */
    SolidGeometryProcessor.SpacePoint.prototype.addVector = function( otherPoint ) {
        this.x += otherPoint.x;
        this.y += otherPoint.y;
        this.z += otherPoint.z;
        return this;
    };

    /**
     * Subtracts the components of another SpacePoint from this one.
     * @param {SolidGeometryProcessor.SpacePoint} otherPoint The point to subtract.
     * @returns {SolidGeometryProcessor.SpacePoint} This point instance for chaining.
     */
    SolidGeometryProcessor.SpacePoint.prototype.subtractVector = function( otherPoint ) {
        this.x -= otherPoint.x;
        this.y -= otherPoint.y;
        this.z -= otherPoint.z;
        return this;
    };

    /**
     * Multiplies the components of this SpacePoint by a scalar value.
     * @param {number} scalar The value to multiply by.
     * @returns {SolidGeometryProcessor.SpacePoint} This point instance for chaining.
     */
    SolidGeometryProcessor.SpacePoint.prototype.scaleBy = function( scalar ) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    };

    /**
     * Calculates the cross product of this SpacePoint with another.
     * Modifies this point to store the result.
     * @param {SolidGeometryProcessor.SpacePoint} otherPoint The other point for the cross product.
     * @returns {SolidGeometryProcessor.SpacePoint} This point instance for chaining.
     */
    SolidGeometryProcessor.SpacePoint.prototype.crossProduct = function( otherPoint ) {
        const currentX = this.x;
        const currentY = this.y;
        const currentZ = this.z;

        this.x = currentY * otherPoint.z - currentZ * otherPoint.y;
        this.y = currentZ * otherPoint.x - currentX * otherPoint.z;
        this.z = currentX * otherPoint.y - currentY * otherPoint.x;

        return this;
    };

    /**
     * Normalizes this SpacePoint (makes it a unit vector).
     * @returns {SolidGeometryProcessor.SpacePoint} This point instance for chaining.
     */
    SolidGeometryProcessor.SpacePoint.prototype.normalizeVector = function() {
        const length = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
        // Avoid division by zero for zero-length vectors.
        if (length > TOLERANCE_THRESHOLD) {
            this.x /= length;
            this.y /= length;
            this.z /= length;
        } else {
            this.x = this.y = this.z = 0; // Set to zero vector if length is negligible
        }
        return this;
    };

    /**
     * Calculates the dot product of this SpacePoint with another.
     * @param {SolidGeometryProcessor.SpacePoint} otherPoint The other point for the dot product.
     * @returns {number} The dot product value.
     */
    SolidGeometryProcessor.SpacePoint.prototype.dotProduct = function( otherPoint ) {
        return this.x * otherPoint.x + this.y * otherPoint.y + this.z * otherPoint.z;
    };

    /**
     * Linearly interpolates this SpacePoint towards another point.
     * Also interpolates normal and UV coordinates.
     * @param {SolidGeometryProcessor.SpacePoint} targetPoint The point to interpolate towards.
     * @param {number} factor The interpolation factor (0.0 to 1.0).
     * @returns {SolidGeometryProcessor.SpacePoint} This point instance for chaining.
     */
    SolidGeometryProcessor.SpacePoint.prototype.linearInterpolate = function( targetPoint, factor ) {
        // Interpolate position
        this.addVector(
            targetPoint.duplicate().subtractVector( this ).scaleBy( factor )
        );

        // Interpolate normal vector
        this.normal.add(
            targetPoint.normal.clone().sub( this.normal ).multiplyScalar( factor )
        );

        // Interpolate UV coordinates
        this.uv.add(
            targetPoint.uv.clone().sub( this.uv ).multiplyScalar( factor )
        );

        return this;
    };

    /**
     * Creates a new SpacePoint that is an interpolation between this point and another.
     * @param {SolidGeometryProcessor.SpacePoint} endPoint The point to interpolate towards.
     * @param {number} t The interpolation factor (0.0 to 1.0).
     * @returns {SolidGeometryProcessor.SpacePoint} A new interpolated SpacePoint.
     */
    SolidGeometryProcessor.SpacePoint.prototype.createInterpolatedPoint = function( endPoint, t ) {
        return this.duplicate().linearInterpolate( endPoint, t );
    };

    /**
     * Transforms this SpacePoint's position by a THREE.Matrix4.
     * This method directly modifies the coordinates.
     * @param {THREE.Matrix4} transformMat The transformation matrix.
     * @returns {SolidGeometryProcessor.SpacePoint} This point instance for chaining.
     */
    SolidGeometryProcessor.SpacePoint.prototype.transformByMatrix = function ( transformMat ) {
        const currentX = this.x, currentY = this.y, currentZ = this.z;
        const elements = transformMat.elements;

        this.x = elements[0] * currentX + elements[4] * currentY + elements[8]  * currentZ + elements[12];
        this.y = elements[1] * currentX + elements[5] * currentY + elements[9]  * currentZ + elements[13];
        this.z = elements[2] * currentX + elements[6] * currentY + elements[10] * currentZ + elements[14];

        // Note: Normals should typically be transformed by the inverse transpose of the matrix,
        // but for affine transformations (no non-uniform scaling), simple matrix multiplication is often used.
        // For simplicity and consistency with original, we only apply to position.
        // If normal transformation is critical, it should be added here:
        // this.normal.transformDirection(transformMat);
        return this;
    };


    /*
     * SolidGeometryProcessor.SpatialPartitionNode represents a node in a Binary Space Partitioning tree.
     * Each node contains a dividing polygon and references to front/back child nodes.
     */
    SolidGeometryProcessor.SpatialPartitionNode = function( initialPolygons ) {
        this.polygons = []; // Polygons that are coplanar with this node's divider.
        this.front = undefined; // Child node for polygons on the positive side.
        this.back = undefined;  // Child node for polygons on the negative side.
        this.divider = undefined; // The GeometricPlane that divides this node's space.

        // If an array of polygons is provided, build the node.
        if ( Array.isArray( initialPolygons ) && initialPolygons.length > 0 ) {
            this.constructTree( initialPolygons );
        }
    };

    /**
     * Checks if a set of polygons forms a convex hull.
     * (This function is not directly used in the BSP construction but is provided as a utility).
     * @param {Array<SolidGeometryProcessor.GeometricPlane>} polygonList The list of polygons to check.
     * @returns {boolean} True if the polygons form a convex hull, false otherwise.
     */
    SolidGeometryProcessor.SpatialPartitionNode.isConvex = function( polygonList ) {
        // Iterate through all pairs of polygons.
        for ( let i = 0; i < polygonList.length; i++ ) {
            for ( let j = 0; j < polygonList.length; j++ ) {
                // A set of polygons is convex if no polygon is on the back side of another.
                if ( i !== j && polygonList[i].analyzePolygonSide( polygonList[j] ) === NEGATIVE_SIDE ) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Recursively builds the BSP tree from a list of polygons.
     * @param {Array<SolidGeometryProcessor.GeometricPlane>} polygonsToProcess The list of polygons to add to the tree.
     */
    SolidGeometryProcessor.SpatialPartitionNode.prototype.constructTree = function( polygonsToProcess ) {
        // If no polygons, there's nothing to build.
        if ( !Array.isArray(polygonsToProcess) || polygonsToProcess.length === 0 ) {
            return;
        }

        // Initialize the divider if it doesn't exist. Use the first polygon as the divider.
        if ( !this.divider ) {
            this.divider = polygonsToProcess[0].duplicate();
        }

        let frontSidePolygons = [];
        let backSidePolygons = [];

        // Distribute polygons into front, back, or coplanar lists based on the divider.
        for ( let i = 0; i < polygonsToProcess.length; i++ ) {
            this.divider.divideAndCategorizePolygon(
                polygonsToProcess[i],
                this.polygons,      // Coplanar front
                this.polygons,      // Coplanar back (all coplanar go to this node's polygon list)
                frontSidePolygons,
                backSidePolygons
            );
        }

        // Recursively build the front child node.
        if ( frontSidePolygons.length > 0 ) {
            if ( !this.front ) {
                this.front = new SolidGeometryProcessor.SpatialPartitionNode();
            }
            this.front.constructTree( frontSidePolygons );
        }

        // Recursively build the back child node.
        if ( backSidePolygons.length > 0 ) {
            if ( !this.back ) {
                this.back = new SolidGeometryProcessor.SpatialPartitionNode();
            }
            this.back.constructTree( backSidePolygons );
        }
    };

    /**
     * Returns a list of all polygons contained within this node and its children.
     * @returns {Array<SolidGeometryProcessor.GeometricPlane>} An array of all polygons.
     */
    SolidGeometryProcessor.SpatialPartitionNode.prototype.retrieveAllPolygons = function() {
        // Start with polygons directly stored in this node.
        let allPolygons = this.polygons.slice();

        // Recursively collect polygons from child nodes.
        if ( this.front ) {
            allPolygons = allPolygons.concat( this.front.retrieveAllPolygons() );
        }
        if ( this.back ) {
            allPolygons = allPolygons.concat( this.back.retrieveAllPolygons() );
        }
        return allPolygons;
    };

    /**
     * Creates a deep copy of this BSP node and its entire subtree.
     * @returns {SolidGeometryProcessor.SpatialPartitionNode} A new, identical BSP node.
     */
    SolidGeometryProcessor.SpatialPartitionNode.prototype.duplicate = function() {
        var clonedNode = new SolidGeometryProcessor.SpatialPartitionNode();

        // Clone the divider polygon if it exists.
        if ( this.divider ) {
            clonedNode.divider = this.divider.duplicate();
        }

        // Clone all coplanar polygons.
        clonedNode.polygons = this.polygons.map( poly => poly.duplicate() );

        // Recursively clone child nodes.
        if ( this.front ) {
            clonedNode.front = this.front.duplicate();
        }
        if ( this.back ) {
            clonedNode.back = this.back.duplicate();
        }

        return clonedNode;
    };

    /**
     * Reverses the orientation of all polygons in this node and its children.
     * Effectively flips the entire tree.
     * @returns {SolidGeometryProcessor.SpatialPartitionNode} This node instance for chaining.
     */
    SolidGeometryProcessor.SpatialPartitionNode.prototype.reverseOrientation = function() {
        // Invert the divider's orientation.
        if ( this.divider ) {
            this.divider.reverseOrientation();
        }

        // Invert all coplanar polygons.
        for ( let i = 0; i < this.polygons.length; i++ ) {
            this.polygons[i].reverseOrientation();
        }

        // Swap front and back children and recursively reverse them.
        let tempFront = this.front;
        this.front = this.back;
        this.back = tempFront;

        if ( this.front ) {
            this.front.reverseOrientation();
        }
        if ( this.back ) {
            this.back.reverseOrientation();
        }

        return this;
    };

    /**
     * Clips the polygons in this node and its children against another BSP tree.
     * This operation removes parts of this tree that are inside the `targetTree`.
     * @param {SolidGeometryProcessor.SpatialPartitionNode} targetTree The BSP tree to clip against.
     * @returns {SolidGeometryProcessor.SpatialPartitionNode} This node instance for chaining.
     */
    SolidGeometryProcessor.SpatialPartitionNode.prototype.clipTo = function( targetTree ) {
        // If this node has no divider, there's nothing to clip.
        if ( !this.divider ) {
            return this;
        }

        let frontPolys = [];
        let backPolys = [];

        // Clip coplanar polygons against the target tree.
        // Keep only those that are outside the target tree's back side.
        for ( let i = 0; i < this.polygons.length; i++ ) {
            targetTree.divider.divideAndCategorizePolygon(
                this.polygons[i],
                frontPolys, // Polygons in front of target's divider (or coplanar front)
                backPolys,  // Polygons in back of target's divider (or coplanar back)
                frontPolys, // Non-coplanar front
                backPolys   // Non-coplanar back
            );
        }
        // The polygons that are *not* on the back side of the target tree are kept.
        // This is equivalent to `this.polygons = frontPolys;` if we consider targetTree to be solid.
        this.polygons = frontPolys;


        // Recursively clip child nodes.
        if ( this.front ) {
            this.front.clipTo( targetTree );
        }
        if ( this.back ) {
            this.back.clipTo( targetTree );
        }

        // If the target tree has a divider, we need to further clip this node's children.
        if ( targetTree.divider ) {
            let allClippedPolygons = this.retrieveAllPolygons(); // Get all polygons from current (clipped) subtree.
            this.polygons = []; // Clear current node's polygons.
            this.front = this.back = undefined; // Clear children.

            // Rebuild this node using the target tree's divider to filter polygons.
            // This ensures that any polygons that were "behind" the target tree are removed.
            this.constructTree( allClippedPolygons );
        }

        return this;
    };

    return SolidGeometryProcessor;

})();