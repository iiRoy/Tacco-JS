(function(exportsContainer) {
    // Flag for internal debugging purposes of the solid modeling library.
    var _SOLID_MODEL_DBG = false;

    /**
     * A utility function for sorting numeric values in ascending order.
     * @param {number} valA - The first numeric value.
     * @param {number} valB - The second numeric value.
     * @returns {number} The difference valA - valB.
     */
    function compareNumericValues(valA, valB) {
        return valA - valB;
    }

    /**
     * @class SolidModel
     * Represents a 3D solid object, typically defined by a collection of faces.
     * This class uses a Binary Space Partitioning (BSP) tree internally for boolean operations.
     * Solid models can be combined using methods like `combine()`, `remove()`, and `overlap()`.
     */
    var SolidModel = function() {
        this.faces = []; // Array to store the geometric faces of the model.
        this.attributes = new SolidModel.AttributeSet(); // Stores model-level properties.
        this.isNormalized = true; // Indicates if the model has undergone coordinate canonicalization.
        this.isTriangulated = true; // Indicates if coplanar faces have been re-triangulated.
    };

    // Default resolution for 2D geometry generation, e.g., for circles or arcs.
    SolidModel.stdRes2D = 32;
    // Default resolution for 3D geometry generation, e.g., for spheres or cylinders.
    SolidModel.stdRes3D = 12;

    /**
     * Factory method to create a SolidModel from an array of SolidModel.Face instances.
     * @param {Array<SolidModel.Face>} geomFaces - A collection of faces defining the solid.
     * @returns {SolidModel} A new SolidModel instance.
     */
    SolidModel.fromFaces = function(geomFaces) {
        var newSolid = new SolidModel(); // Instantiate a new model.
        newSolid.faces = geomFaces; // Assign the provided faces.
        newSolid.isNormalized = false; // Mark as not yet normalized.
        newSolid.isTriangulated = false; // Mark as not yet triangulated.
        return newSolid; // Return the constructed model.
    };

    /**
     * Constructs a SolidModel from a series of cross-sections or "slices".
     * Refer to SolidModel.Face.prototype.buildFromCrossSections for more specific information.
     * @param {object} opts - Configuration options for slice generation.
     * @returns {SolidModel} The generated solid model.
     */
    SolidModel.fromCrossSections = function(opts) {
        // Create a base face for slicing operations.
        return (new SolidModel.Face.buildFromCoordinates([
            [0, 0, 0],
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 0]
        ])).buildFromCrossSections(opts);
    };

    /**
     * Creates a SolidModel instance from a generic JavaScript object.
     * The object should have properties matching the structure of a SolidModel.
     * @param {object} sourceObj - The object containing data to construct the model.
     * @returns {SolidModel} A new, normalized SolidModel.
     */
    SolidModel.fromGenericObject = function(sourceObj) {
        // Map raw polygon data to SolidModel.Face objects.
        var modelFaces = sourceObj.faces.map(function(rawFace) {
            return SolidModel.Face.fromGenericObject(rawFace);
        });
        // Create a SolidModel from these processed faces.
        var sModel = SolidModel.fromFaces(modelFaces);
        // Ensure the model is normalized after creation.
        sModel = sModel.normalize();
        return sModel;
    };

    /**
     * Reconstructs a SolidModel from a compact binary data packet.
     * This is typically used for deserialization after `toBinaryPayload()`.
     * @param {object} dataPacket - The binary data structure.
     * @returns {SolidModel} The reconstructed solid model.
     * @throws {Error} If the data packet does not represent a SolidModel.
     */
    SolidModel.fromBinaryPayload = function(dataPacket) {
        if (dataPacket['typeId'] !== "SolidModel") {
            throw new Error("Input data does not represent a SolidModel structure.");
        }

        var surfaces = [],
            surfaceData = dataPacket.surfaceData,
            numSurfaces = surfaceData.length / 4,
            arrIdx = 0,
            cx, cy, cz, cw, normVec, currentSurface;

        // Process surface data
        for (var surfaceIdx = 0; surfaceIdx < numSurfaces; surfaceIdx++) {
            cx = surfaceData[arrIdx++];
            cy = surfaceData[arrIdx++];
            cz = surfaceData[arrIdx++];
            cw = surfaceData[arrIdx++];
            normVec = new SolidModel.Vec3(cx, cy, cz);
            currentSurface = new SolidModel.Surface(normVec, cw);
            surfaces.push(currentSurface);
        }

        var points = [],
            pointData = dataPacket.pointData,
            numPoints = pointData.length / 3,
            coordVec, currentPoint;
        arrIdx = 0;

        // Process point data
        for (var pointIdx = 0; pointIdx < numPoints; pointIdx++) {
            cx = pointData[arrIdx++];
            cy = pointData[arrIdx++];
            cz = pointData[arrIdx++];
            coordVec = new SolidModel.Vec3(cx, cy, cz);
            currentPoint = new SolidModel.Point(coordVec);
            points.push(currentPoint);
        }

        var sharedAttributes = dataPacket.sharedAttributes.map(function(sAttr) {
            return SolidModel.Face.SharedAttribute.fromGenericObject(sAttr);
        });

        var modelFaces = [],
            numModelFaces = dataPacket.numFaces,
            numPointsPerFace = dataPacket.numPointsPerFace,
            facePoints = dataPacket.facePoints,
            faceSurfaceIndexes = dataPacket.faceSurfaceIndexes,
            faceSharedIndexes = dataPacket.faceSharedIndexes,
            numCurrentFacePoints, currentFacePoints, sAttr, faceObj;

        arrIdx = 0;
        // Process face data
        for (var faceIdx = 0; faceIdx < numModelFaces; faceIdx++) {
            numCurrentFacePoints = numPointsPerFace[faceIdx];
            currentFacePoints = [];
            for (var k = 0; k < numCurrentFacePoints; k++) {
                currentFacePoints.push(points[facePoints[arrIdx++]]);
            }
            currentSurface = surfaces[faceSurfaceIndexes[faceIdx]];
            sAttr = sharedAttributes[faceSharedIndexes[faceIdx]];
            faceObj = new SolidModel.Face(currentFacePoints, sAttr, currentSurface);
            modelFaces.push(faceObj);
        }

        var sModel = SolidModel.fromFaces(modelFaces);
        sModel.isNormalized = true; // Mark as normalized.
        sModel.isTriangulated = true; // Mark as triangulated.
        return sModel;
    };

    SolidModel.prototype = {
        /**
         * Retrieves the array of faces that constitute this solid model.
         * @returns {Array<SolidModel.Face>} An array of faces.
         */
        getFaces: function() {
            return this.faces;
        },

        /**
         * Performs a boolean union operation, combining this solid model with
         * another solid model or an array of solid models.
         * The original models (`this` and `otherModel`) are not altered.
         *
         * Pictorial representation for A.combine(B):
         *
         *       +-------+            +-------+
         *       |       |            |       |
         *       |   A   |            |       |
         *       |    +--+----+   =   |       +----+
         *       +----+--+    |       +----+       |
         *            |   B   |            |       |
         *            |       |            |       |
         *            +-------+            +-------+
         *
         * @param {SolidModel|Array<SolidModel>} otherModel - The solid model(s) to combine with.
         * @returns {SolidModel} A new SolidModel representing the combined volume.
         */
        combine: function(otherModel) {
            var otherModels;
            if (otherModel instanceof Array) {
                otherModels = otherModel;
            } else {
                otherModels = [otherModel];
            }

            var outcome = this;
            for (var k = 0; k < otherModels.length; k++) {
                var isFinal = (k === (otherModels.length - 1));
                outcome = outcome.combineInternal(otherModels[k], isFinal, isFinal);
            }
            return outcome;
        },

        /**
         * Internal helper for the combine operation.
         * @param {SolidModel} otherModel - The other solid model.
         * @param {boolean} shouldTriangulate - Flag to indicate if re-triangulation should occur.
         * @param {boolean} shouldNormalize - Flag to indicate if canonicalization should occur.
         * @returns {SolidModel} The combined solid model.
         */
        combineInternal: function(otherModel, shouldTriangulate, shouldNormalize) {
            // If models are known not to intersect, use an optimized path.
            if (!this.mightIntersect(otherModel)) {
                return this.combineNonIntersecting(otherModel);
            } else {
                var treeA = new SolidModel.BinaryPartitionTree(this.faces);
                var treeB = new SolidModel.BinaryPartitionTree(otherModel.faces);

                treeA.clipTo(treeB, false); // Clip faces of A against B, keeping only parts inside B.

                // The following sequence handles faces of B.
                // It effectively inverts B, clips it against A (removing parts of B that were inside A),
                // then inverts it back, and clips again against A (to keep only parts of B that are outside A).
                treeB.clipTo(treeA);
                treeB.invert();
                treeB.clipTo(treeA);
                treeB.invert();

                // Concatenate all remaining faces from both trees.
                var combinedFaces = treeA.getFaces().concat(treeB.getFaces());
                var outcome = SolidModel.fromFaces(combinedFaces);
                // Merge properties from both original models.
                outcome.attributes = this.attributes._merge(otherModel.attributes);

                if (shouldTriangulate) outcome = outcome.triangulate();
                if (shouldNormalize) outcome = outcome.normalize();
                return outcome;
            }
        },

        /**
         * Optimized combine operation for models that are guaranteed not to intersect.
         * This method should only be used when absolutely certain there is no overlap,
         * as it bypasses the more robust BSP tree operations.
         * @param {SolidModel} otherModel - The non-intersecting solid model to combine.
         * @returns {SolidModel} A new solid model with faces from both inputs.
         */
        combineNonIntersecting: function(otherModel) {
            var combinedFaces = this.faces.concat(otherModel.faces);
            var outcome = SolidModel.fromFaces(combinedFaces);
            outcome.attributes = this.attributes._merge(otherModel.attributes);
            outcome.isNormalized = this.isNormalized && otherModel.isNormalized;
            outcome.isTriangulated = this.isTriangulated && otherModel.isTriangulated;
            return outcome;
        },

        /**
         * Performs a boolean subtraction operation, removing the volume of another
         * solid model (or models) from this solid model.
         * The original models are not modified.
         *
         * Pictorial representation for A.remove(B):
         *
         *       +-------+            +-------+
         *       |       |            |       |
         *       |   A   |            |       |
         *       |    +--+----+   =   |    +--+
         *       +----+--+    |       +----+
         *            |   B   |
         *            |       |
         *            +-------+
         *
         * @param {SolidModel|Array<SolidModel>} otherModel - The solid model(s) to subtract.
         * @returns {SolidModel} A new SolidModel representing the difference.
         */
        remove: function(otherModel) {
            var otherModels;
            if (otherModel instanceof Array) {
                otherModels = otherModel;
            } else {
                otherModels = [otherModel];
            }

            var outcome = this;
            for (var k = 0; k < otherModels.length; k++) {
                var isFinal = (k === (otherModels.length - 1));
                outcome = outcome.removeInternal(otherModels[k], isFinal, isFinal);
            }
            return outcome;
        },

        /**
         * Internal helper for the remove operation.
         * @param {SolidModel} otherModel - The other solid model.
         * @param {boolean} shouldTriangulate - Flag to indicate if re-triangulation should occur.
         * @param {boolean} shouldNormalize - Flag to indicate if canonicalization should occur.
         * @returns {SolidModel} The resulting solid model after subtraction.
         */
        removeInternal: function(otherModel, shouldTriangulate, shouldNormalize) {
            var treeA = new SolidModel.BinaryPartitionTree(this.faces);
            var treeB = new SolidModel.BinaryPartitionTree(otherModel.faces);

            treeA.invert(); // Invert A to represent the space *outside* A.
            treeA.clipTo(treeB); // Clip inverted A against B (remove parts of A that are outside B).
            treeB.clipTo(treeA, true); // Clip B against inverted A, keeping parts of B that are inside A.
            treeA.addFaces(treeB.getFaces()); // Add remaining parts of B to A.
            treeA.invert(); // Invert A back to its original orientation.

            var outcome = SolidModel.fromFaces(treeA.getFaces());
            outcome.attributes = this.attributes._merge(otherModel.attributes);

            if (shouldTriangulate) outcome = outcome.triangulate();
            if (shouldNormalize) outcome = outcome.normalize();
            return outcome;
        },

        /**
         * Performs a boolean intersection operation, retaining only the volume
         * common to both this solid model and another solid model (or models).
         * The original models are not modified.
         *
         * Pictorial representation for A.overlap(B):
         *
         *       +-------+
         *       |       |
         *       |   A   |
         *       |    +--+----+   =   +--+
         *       +----+--+    |       +--+
         *            |   B   |
         *            |       |
         *            +-------+
         *
         * @param {SolidModel|Array<SolidModel>} otherModel - The solid model(s) to intersect with.
         * @returns {SolidModel} A new SolidModel representing the intersection.
         */
        overlap: function(otherModel) {
            var otherModels;
            if (otherModel instanceof Array) {
                otherModels = otherModel;
            } else {
                otherModels = [otherModel];
            }

            var outcome = this;
            for (var k = 0; k < otherModels.length; k++) {
                var isFinal = (k === (otherModels.length - 1));
                outcome = outcome.overlapInternal(otherModels[k], isFinal, isFinal);
            }
            return outcome;
        },

        /**
         * Internal helper for the overlap operation.
         * @param {SolidModel} otherModel - The other solid model.
         * @param {boolean} shouldTriangulate - Flag to indicate if re-triangulation should occur.
         * @param {boolean} shouldNormalize - Flag to indicate if canonicalization should occur.
         * @returns {SolidModel} The resulting solid model after intersection.
         */
        overlapInternal: function(otherModel, shouldTriangulate, shouldNormalize) {
            var treeA = new SolidModel.BinaryPartitionTree(this.faces);
            var treeB = new SolidModel.BinaryPartitionTree(otherModel.faces);

            treeA.invert(); // Invert A.
            treeB.clipTo(treeA); // Clip B against inverted A (remove parts of B that are outside A).
            treeB.invert(); // Invert B.
            treeA.clipTo(treeB); // Clip inverted A against inverted B (remove parts of A that are outside B).
            treeB.clipTo(treeA); // Clip inverted B against inverted A (remove parts of B that are outside A, again).
            treeA.addFaces(treeB.getFaces()); // Add remaining parts of B to A.
            treeA.invert(); // Invert A back.

            var outcome = SolidModel.fromFaces(treeA.getFaces());
            outcome.attributes = this.attributes._merge(otherModel.attributes);

            if (shouldTriangulate) outcome = outcome.triangulate();
            if (shouldNormalize) outcome = outcome.normalize();
            return outcome;
        },

        /**
         * Creates a new SolidModel with its solid and empty spaces swapped (inverted).
         * This operation does not modify the original model.
         * @returns {SolidModel} A new SolidModel representing the inverse of the original.
         */
        flipSolid: function() {
            var invertedFaces = this.faces.map(function(face) {
                return face.inverted();
            });
            // Note: Currently, model-level properties are not inverted. This could be a future enhancement.
            return SolidModel.fromFaces(invertedFaces);
        },

        /**
         * Applies an affine transformation to the solid model, returning a new transformed model.
         * This is a simplified transformation method, primarily for polygons.
         * @param {SolidModel.Matrix4} xformMatrix - The 4x4 transformation matrix.
         * @returns {SolidModel} A new, transformed SolidModel.
         */
        applyTransformationOne: function(xformMatrix) {
            var modFaces = this.faces.map(function(poly) {
                return poly.applyTransformation(xformMatrix);
            });
            var outcome = SolidModel.fromFaces(modFaces);
            outcome.attributes = this.attributes._transform(xformMatrix);
            outcome.isTriangulated = this.isTriangulated; // Preserve triangulation status.
            return outcome;
        },

        /**
         * Applies a full affine transformation to the solid model, optimizing
         * by reusing transformed points and surfaces. Returns a new transformed model.
         * @param {SolidModel.Matrix4} xformMatrix - The 4x4 transformation matrix.
         * @returns {SolidModel} A new, transformed SolidModel.
         */
        applyTransformation: function(xformMatrix) {
            var isReflecting = xformMatrix.isReflecting();
            var xformedPoints = {}; // Cache for transformed points.
            var xformedSurfaces = {}; // Cache for transformed surfaces.

            var modFaces = this.faces.map(function(poly) {
                var newSurf;
                var surf = poly.surface;
                var surfId = surf.getIdentifier();

                // Check if surface has already been transformed.
                if (surfId in xformedSurfaces) {
                    newSurf = xformedSurfaces[surfId];
                } else {
                    newSurf = surf.applyTransformation(xformMatrix);
                    xformedSurfaces[surfId] = newSurf;
                }

                var newPoints = poly.points.map(function(pt) {
                    var newPt;
                    var pointId = pt.getIdentifier();

                    // Check if point has already been transformed.
                    if (pointId in xformedPoints) {
                        newPt = xformedPoints[pointId];
                    } else {
                        newPt = pt.applyTransformation(xformMatrix);
                        xformedPoints[pointId] = newPt;
                    }
                    return newPt;
                });

                // If the transformation includes mirroring, reverse point order to maintain face orientation.
                if (isReflecting) newPoints.reverse();
                return new SolidModel.Face(newPoints, poly.sharedAttributes, newSurf);
            });

            var outcome = SolidModel.fromFaces(modFaces);
            outcome.attributes = this.attributes._transform(xformMatrix);
            outcome.isTriangulated = this.isTriangulated; // Preserve triangulation status.
            outcome.isNormalized = this.isNormalized; // Preserve normalization status.
            return outcome;
        },

        /**
         * Generates an STL string representation of the solid model.
         * @returns {string} The STL format string.
         */
        exportToStl: function() {
            var outputString = "solid solid_model_export\n";
            this.faces.map(function(face) {
                outputString += face.exportToStl();
            });
            outputString += "endsolid solid_model_export\n";
            return outputString;
        },

        /**
         * Generates an AMF string representation of the solid model.
         * @param {object} metaInfo - Optional metadata to include in the AMF header.
         * @returns {string} The AMF format XML string.
         */
        exportToAmf: function(metaInfo) {
            var amfContent = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<amf" +
                (metaInfo && metaInfo.unit ? " unit=\"" + metaInfo.unit + "\"" : "") +
                ">\n";

            // Add metadata
            for (var metaKey in metaInfo) {
                amfContent += "<metadata type=\"" + metaKey + "\">" + metaInfo[metaKey] + "</metadata>\n";
            }

            amfContent += "<object id=\"0\">\n<mesh>\n<vertices>\n";

            // Dump all points from all faces
            this.faces.map(function(face) {
                for (var k = 0; k < face.points.length; k++) {
                    amfContent += face.points[k].exportToAmf();
                }
            });
            amfContent += "</vertices>\n";

            var pointCounter = 0;
            // Dump all faces, ensuring they are triangulated for AMF
            this.faces.map(function(face) {
                amfContent += "<volume>\n";
                if (face.points.length < 3) {
                    return; // Skip invalid faces.
                }

                var rVal = 1,
                    gVal = 0.4,
                    bVal = 1,
                    aVal = 1,
                    hasColor = false;

                // Check for shared color attributes
                if (face.sharedAttributes && face.sharedAttributes.color) {
                    rVal = face.sharedAttributes.color[0];
                    gVal = face.sharedAttributes.color[1];
                    bVal = face.sharedAttributes.color[2];
                    aVal = face.sharedAttributes.color[3];
                    hasColor = true;
                } else if (face.color) { // Check for face-specific color
                    rVal = face.color[0];
                    gVal = face.color[1];
                    bVal = face.color[2];
                    if (face.color.length > 3) aVal = face.color[3];
                    hasColor = true;
                }

                amfContent += "<color><r>" + rVal + "</r><g>" + gVal + "</g><b>" + bVal + "</b>" +
                    (aVal !== undefined ? "<a>" + aVal + "</a>" : "") + "</color>";

                // Triangulate the face if it has more than 3 points
                for (var k = 0; k < face.points.length - 2; k++) {
                    amfContent += "<triangle>";
                    amfContent += "<v1>" + (pointCounter) + "</v1>";
                    amfContent += "<v2>" + (pointCounter + k + 1) + "</v2>";
                    amfContent += "<v3>" + (pointCounter + k + 2) + "</v3>";
                    amfContent += "</triangle>\n";
                }
                pointCounter += face.points.length;
                amfContent += "</volume>\n";
            });

            amfContent += "</mesh>\n</object>\n";
            amfContent += "</amf>\n";
            return amfContent;
        },

        /**
         * Generates an X3D string representation of the solid model.
         * This method organizes faces by material color.
         * @returns {string} The X3D format XML string.
         */
        exportToX3D: function() {
            // materialFaceCollections:
            // Key: A color string (e.g., "0 1 1" for yellow).
            // Value: An array of strings, each specifying a face by its point indices
            //        (space-separated indices into the 'pointCoordinates' array).
            var materialFaceCollections = {},
                // pointCoordinates: A list of coordinate strings (e.g., "x y z").
                pointCoordinates = [],
                // pointIdToIndexMap: A mapping from a point's unique identifier to its index in 'pointCoordinates'.
                pointIdToIndexMap = {};

            this.faces.map(function(currFace) {
                var rVal = 0,
                    gVal = 0,
                    bVal = 1; // Default color is blue.

                // Determine the color of the current face.
                if (currFace.sharedAttributes && currFace.sharedAttributes.color) {
                    rVal = currFace.sharedAttributes.color[0];
                    gVal = currFace.sharedAttributes.color[1];
                    bVal = currFace.sharedAttributes.color[2];
                }

                // Prepare an array to store indices of points for this face.
                var facePointIndexes = [],
                    numPointsInFace = currFace.points.length,
                    currPoint;

                // Iterate through points of the current face.
                for (var k = 0; k < numPointsInFace; k++) {
                    currPoint = currFace.points[k];
                    // If the point has not been added to our global list yet:
                    if (!(currPoint.getIdentifier() in pointIdToIndexMap)) {
                        // Add its coordinates to the global list.
                        pointCoordinates.push(
                            currPoint.position._xCoord.toFixed(6) + " " + // Use fixed precision for output
                            currPoint.position._yCoord.toFixed(6) + " " +
                            currPoint.position._zCoord.toFixed(6)
                        );
                        // Map its identifier to its new index.
                        pointIdToIndexMap[currPoint.getIdentifier()] = pointCoordinates.length - 1;
                    }
                    // Add the global index of this point to the face's index list.
                    facePointIndexes.push(pointIdToIndexMap[currPoint.getIdentifier()]);
                }