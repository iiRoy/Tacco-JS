// A comprehensive utility for converting between Three.js geometries and CSG.js objects.
// This module facilitates Boolean operations (e.g., union, subtraction, intersection)
// on 3D models within a Three.js environment by leveraging the CSG.js library.
//
// Original concept and initial implementation by Chandler Prall <chandler.prall@gmail.com>
// This version incorporates extensive modifications for Type III code cloning,
// including identifier renaming, structural refactoring, and additional functionalities.
// License: MIT

// Essential runtime checks to ensure core libraries are available.
// In a modern module system (e.g., ES Modules), these would typically be handled via imports.
if (typeof THREE === 'undefined') {
    throw new Error('ThreeJS_Core library is not detected. Please ensure THREE.js is loaded before this utility.');
}
if (typeof CSG === 'undefined') {
    throw new Error('CSGLibrary is not detected. Please acquire and load CSG.js from https://github.com/evanw/csg.js.');
}

// Global object renamed and restructured for Type II and Type III cloning.
const ThreeCSGAdapter = {

    /**
     * Transforms a Three.js Mesh or Geometry object into a CSG.js object.
     * This conversion is a prerequisite for performing constructive solid geometry operations.
     *
     * @param {THREE.Mesh|THREE.Geometry} inputSource - The Three.js object (mesh or raw geometry) to be converted.
     * @param {THREE.Vector3} [translationVector] - An optional vector to offset the object's position.
     *                                              If omitted, the object's current position is used.
     * @param {THREE.Euler|THREE.Vector3} [orientationEuler] - An optional Euler rotation or Vector3 (interpreted as Euler)
     *                                                           to apply to the object. If omitted, the object's current
     *                                                           rotation is used.
     * @returns {CSG} A new CSG.js object representing the transformed input geometry.
     * @throws {Error} If the input object type is not supported (e.g., not a Mesh or Geometry).
     */
    convertThreeGeometryToCSG: function(inputSource, translationVector, orientationEuler) {
        let sourceMeshGeometry;
        const currentPosition = new THREE.Vector3(); // Default to (0,0,0)
        const currentRotation = new THREE.Euler();   // Default to (0,0,0) Euler

        // Robust input validation and initialization of transformation parameters.
        if (inputSource instanceof THREE.Mesh) {
            sourceMeshGeometry = inputSource.geometry;
            currentPosition.copy(translationVector || inputSource.position);
            currentRotation.copy(orientationEuler || inputSource.rotation);
        } else if (inputSource instanceof THREE.Geometry) {
            sourceMeshGeometry = inputSource;
            currentPosition.copy(translationVector || new THREE.Vector3(0, 0, 0));
            currentRotation.copy(orientationEuler || new THREE.Euler(0, 0, 0));
        } else {
            console.error("Invalid input object provided:", inputSource);
            throw new Error('Unsupported input type. Expected an instance of THREE.Mesh or THREE.Geometry.');
        }

        // Generate a single transformation matrix to apply to all vertices for efficiency.
        const transformationMatrix = new THREE.Matrix4().setRotationFromEuler(currentRotation);

        // Internal helper function to create a CSG.Vertex from a Three.js vertex,
        // applying the necessary position and rotation transformations.
        const constructTransformedCSGVertex = (vertexVector, normalVector) => {
            // Clone the original vertex to avoid modifying the source geometry.
            const transformedVertex = vertexVector.clone();
            // Apply translation first.
            transformedVertex.add(currentPosition);
            // Then apply rotation using the precomputed matrix.
            transformedVertex.applyMatrix4(transformationMatrix);

            // CSG.Vertex expects the normal components as an array.
            const normalComponents = [normalVector.x, normalVector.y, normalVector.z];
            return new CSG.Vertex(transformedVertex, normalComponents);
        };

        const resultantCSGPolygons = [];
        const totalFaces = sourceMeshGeometry.faces.length;

        // Iterate through each face in the Three.js geometry.
        for (let faceIndex = 0; faceIndex < totalFaces; ++faceIndex) {
            const currentFace = sourceMeshGeometry.faces[faceIndex];
            const faceNormal = currentFace.normal;

            // Optional: Add a warning for faces with uncomputed or zero normals.
            if (!faceNormal || (faceNormal.x === 0 && faceNormal.y === 0 && faceNormal.z === 0)) {
                console.warn(`Encountered a face (index ${faceIndex}) with a zero or undefined normal vector. This may affect CSG operation accuracy.`);
            }

            let csgFaceVertices = [];

            // Distinguish between triangle (Face3) and quad (Face4) faces.
            if (currentFace instanceof THREE.Face3) {
                // For a 3-vertex face, create a single CSG polygon.
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.a], faceNormal));
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.b], faceNormal));
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.c], faceNormal));
                resultantCSGPolygons.push(new CSG.Polygon(csgFaceVertices));
            } else if (currentFace instanceof THREE.Face4) {
                // For a 4-vertex face (quad), triangulate it into two separate CSG polygons.
                // First triangle: (a, b, d)
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.a], faceNormal));
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.b], faceNormal));
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.d], faceNormal));
                resultantCSGPolygons.push(new CSG.Polygon(csgFaceVertices));

                // Second triangle: (b, c, d)
                // Reset the vertex array for the next polygon.
                csgFaceVertices = [];
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.b], faceNormal));
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.c], faceNormal));
                csgFaceVertices.push(constructTransformedCSGVertex(sourceMeshGeometry.vertices[currentFace.d], faceNormal));
                resultantCSGPolygons.push(new CSG.Polygon(csgFaceVertices));
            } else {
                // Handle any other unexpected face types gracefully with a warning.
                console.warn(`Detected an unsupported face type at index ${faceIndex}. This face will be skipped.`);
            }
        }

        // Return the final CSG object constructed from the processed polygons.
        return CSG.fromPolygons(resultantCSGPolygons);
    },

    /**
     * Converts a CSG.js object back into a Three.js Geometry object.
     * This is typically used to visualize the outcome of CSG operations within Three.js.
     *
     * @param {CSG} sourceCSGObject - The CSG.js object to be converted into Three.js geometry.
     * @returns {THREE.Geometry} A newly created Three.js Geometry object.
     * @throws {Error} If the provided CSG object is invalid or malformed.
     */
    convertCSGToThreeGeometry: function(sourceCSGObject) {
        // Validate the input CSG object to ensure it has the expected structure.
        if (!sourceCSGObject || typeof sourceCSGObject.toPolygons !== 'function') {
            throw new Error('Invalid CSG object provided. Expected an object with a "toPolygons" method.');
        }

        const outputThreeGeometry = new THREE.Geometry();
        const sourceCSGPolygons = sourceCSGObject.toPolygons();

        // A cache to store and retrieve indices of already added vertices, preventing duplicates.
        // Keys are stringified coordinates (e.g., "x,y,z"), values are indices in `outputThreeGeometry.vertices`.
        const vertexIndexCache = new Map();

        // Internal helper to find an existing vertex by its position or add it if new.
        // Returns the index of the vertex in `outputThreeGeometry.vertices`.
        const obtainGeometryVertexIndex = (positionVector) => {
            const coordinateKey = `${positionVector.x},${positionVector.y},${positionVector.z}`;
            if (vertexIndexCache.has(coordinateKey)) {
                return vertexIndexCache.get(coordinateKey);
            }

            const newThreeVertex = new THREE.Vector3(positionVector.x, positionVector.y, positionVector.z);
            outputThreeGeometry.vertices.push(newThreeVertex);
            const newIndex = outputThreeGeometry.vertices.length - 1;
            vertexIndexCache.set(coordinateKey, newIndex);
            return newIndex;
        };

        // Process each polygon generated by the CSG library.
        for (let polyIdx = 0; polyIdx < sourceCSGPolygons.length; ++polyIdx) {
            const currentCSGPolygon = sourceCSGPolygons[polyIdx];
            const currentPolyVertexIndices = [];

            // Guard against degenerate polygons (e.g., lines or points, not valid faces).
            if (currentCSGPolygon.vertices.length < 3) {
                console.warn(`Skipping degenerate CSG polygon at index ${polyIdx}. It has fewer than 3 vertices.`);
                continue;
            }

            // Convert CSG vertices to Three.js vertex indices.
            for (let vertexIdx = 0; vertexIdx < currentCSGPolygon.vertices.length; ++vertexIdx) {
                currentPolyVertexIndices.push(obtainGeometryVertexIndex(currentCSGPolygon.vertices[vertexIdx].pos));
            }

            // CSG.js might produce polygons where the first and last vertex are identical.
            // This check removes such redundancy to prevent creating invalid Three.js faces.
            if (currentPolyVertexIndices.length > 1 && currentPolyVertexIndices[0] === currentPolyVertexIndices[currentPolyVertexIndices.length - 1]) {
                currentPolyVertexIndices.pop();
            }

            // Triangulate the CSG polygon (which should be convex) into Three.js Face3 objects.
            // A simple fan triangulation method is applied.
            for (let triIdx = 2; triIdx < currentPolyVertexIndices.length; ++triIdx) {
                const vertexA = currentPolyVertexIndices[0];
                const vertexB = currentPolyVertexIndices[triIdx - 1];
                const vertexC = currentPolyVertexIndices[triIdx];

                // Create a new Three.js Face3, copying the normal from the CSG polygon's plane.
                const faceNormal = new THREE.Vector3().copy(currentCSGPolygon.plane.normal);
                const newThreeFace = new THREE.Face3(vertexA, vertexB, vertexC, faceNormal);
                outputThreeGeometry.faces.push(newThreeFace);

                // Type III Change: Removed the original `three_geometry.faceVertexUvs[0].push(new THREE.UV());`
                // This line added empty UVs, which are often not functionally useful without
                // actual UV coordinate generation. For basic geometry conversion, UVs are
                // considered non-essential and can be generated via other methods if required.
            }
        }

        // Post-processing steps for the newly created Three.js geometry.
        // These ensure the geometry has correct bounding information and computed normals,
        // which are crucial for rendering and further operations.
        outputThreeGeometry.computeBoundingBox();
        outputThreeGeometry.computeFaceNormals();   // Recalculate face normals if they were modified or missing.
        outputThreeGeometry.computeVertexNormals(); // Compute smooth vertex normals based on face normals.

        return outputThreeGeometry;
    }

    // Type III Change: The original `getGeometryVertice` method has been removed as a standalone public function.
    // Its core logic (vertex deduplication and retrieval/addition) has been refactored and integrated
    // directly into `convertCSGToThreeGeometry` via the `obtainGeometryVertexIndex` helper function,
    // which also incorporates a more efficient Map-based caching mechanism.
};