const GeometryTransformationModule = {
    // Internal helper to generate a unique string key for a 3D point
    _pointKey: (positionVector) => `${positionVector.x}_${positionVector.y}_${positionVector.z}`,

    // Function to convert a Three.js model (Mesh or Geometry) into a CSG object
    transformToCSG: (inputModelReference, translationShift, rotationalAngles) => {
        if (!window.CSG) {
            throw 'CSG processing library is not loaded. Please ensure CSG.js is available globally.';
        }

        let meshGeometryData;
        let effectiveTranslationVector = translationShift;
        let effectiveRotationAngles = rotationalAngles; // Can be THREE.Euler or THREE.Vector3

        // Helper to extract relevant components from the input model
        const parseInputModel = (model) => {
            if (model instanceof THREE.Mesh) {
                meshGeometryData = model.geometry;
                effectiveTranslationVector = effectiveTranslationVector || model.position;
                effectiveRotationAngles = effectiveRotationAngles || model.rotation;
            } else if (model instanceof THREE.Geometry) {
                meshGeometryData = model;
                effectiveTranslationVector = effectiveTranslationVector || new THREE.Vector3(0, 0, 0);
                effectiveRotationAngles = effectiveRotationAngles || new THREE.Vector3(0, 0, 0);
            } else {
                throw 'The provided model type is not supported for CSG conversion.';
            }
        };
        parseInputModel(inputModelReference);

        // Convert rotation to THREE.Euler if it's a THREE.Vector3
        const finalRotationEuler = (effectiveRotationAngles instanceof THREE.Vector3)
            ? new THREE.Euler(effectiveRotationAngles.x, effectiveRotationAngles.y, effectiveRotationAngles.z)
            : effectiveRotationAngles;
        
        const transformationMatrix = new THREE.Matrix4().setFromEuler(finalRotationEuler);

        // Helper to process a single Three.js face and yield CSG polygons
        const generateCSGPolygonsFromFace = (faceElement) => {
            const facePolygons = [];
            const normalVectorComponents = [faceElement.normal.x, faceElement.normal.y, faceElement.normal.z];

            // Helper to create a CSG.Vertex from a Three.js vertex index
            const constructCSGVertex = (vertexIdx) => {
                const originalVertexPosition = meshGeometryData.vertices[vertexIdx].clone();
                const shiftedVertexPosition = originalVertexPosition.add(effectiveTranslationVector); // Apply translation
                const transformedVertexPosition = shiftedVertexPosition.applyMatrix4(transformationMatrix); // Apply rotation
                return new CSG.Vertex(transformedVertexPosition, normalVectorComponents);
            };

            if (faceElement instanceof THREE.Face3) {
                const triangleVertices = [
                    constructCSGVertex(faceElement.a),
                    constructCSGVertex(faceElement.b),
                    constructCSGVertex(faceElement.c)
                ];
                facePolygons.push(new CSG.Polygon(triangleVertices));
            } else if (faceElement instanceof THREE.Face4) {
                // Decompose quad into two triangles (a,b,d) and (b,c,d)
                facePolygons.push(new CSG.Polygon([
                    constructCSGVertex(faceElement.a),
                    constructCSGVertex(faceElement.b),
                    constructCSGVertex(faceElement.d)
                ]));
                facePolygons.push(new CSG.Polygon([
                    constructCSGVertex(faceElement.b),
                    constructCSGVertex(faceElement.c),
                    constructCSGVertex(faceElement.d)
                ]));
            } else {
                throw 'The model contains an unsupported face type.';
            }
            return facePolygons;
        };

        const collectedCSGPolygons = meshGeometryData.faces.flatMap(generateCSGPolygonsFromFace);

        return CSG.fromPolygons(collectedCSGPolygons);
    },

    // Function to convert a CSG object back to a Three.js Geometry
    transformFromCSG: (csgSourceObject) => {
        if (!window.CSG) {
            throw 'CSG processing library is not loaded. Please ensure CSG.js is available globally.';
        }

        const newThreeGeometry = new THREE.Geometry();
        // Map to store unique vertex positions and their corresponding indices in newThreeGeometry.vertices
        const uniqueVertexTracker = new Map(); // Key: "x_y_z" string, Value: index

        // Helper to retrieve the index of an existing vertex or add a new one
        const getOrRegisterVertexIndex = (positioningVector) => {
            const key = GeometryTransformationModule._pointKey(positioningVector);
            if (uniqueVertexTracker.has(key)) {
                return uniqueVertexTracker.get(key);
            } else {
                newThreeGeometry.vertices.push(new THREE.Vector3(positioningVector.x, positioningVector.y, positioningVector.z));
                const currentVertexIndex = newThreeGeometry.vertices.length - 1;
                uniqueVertexTracker.set(key, currentVertexIndex);
                return currentVertexIndex;
            }
        };

        const allCSGPolygons = csgSourceObject.toPolygons();

        allCSGPolygons.forEach(polygon => {
            const polygonVertexIndices = polygon.vertices.map(v => getOrRegisterVertexIndex(v.pos));

            // Remove the last vertex if it's a duplicate of the first (closed polygon representation)
            if (polygonVertexIndices.length > 0 && polygonVertexIndices[0] === polygonVertexIndices[polygonVertexIndices.length - 1]) {
                polygonVertexIndices.pop();
            }

            // Triangulate the polygon into THREE.Face3 objects
            if (polygonVertexIndices.length >= 3) {
                const faceNormalVector = new THREE.Vector3().copy(polygon.plane.normal);
                for (let k = 2; k < polygonVertexIndices.length; k++) {
                    const createdFace = new THREE.Face3(
                        polygonVertexIndices[0],
                        polygonVertexIndices[k - 1],
                        polygonVertexIndices[k],
                        faceNormalVector
                    );
                    newThreeGeometry.faces.push(createdFace);
                    // Add a placeholder UV set as the original code did
                    newThreeGeometry.faceVertexUvs[0].push(new THREE.UV());
                }
            }
        });

        newThreeGeometry.computeBoundingBox();
        return newThreeGeometry;
    }
};

// Expose the new module under a different name within the THREE namespace
if (typeof THREE !== 'undefined') {
    THREE.ModelConverter = GeometryTransformationModule;
} else {
    // If THREE is not globally available, expose it on window for testing or standalone use
    window.ModelConverter = GeometryTransformationModule;
}