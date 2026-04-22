var Cuboid = (function() {
  // A collection of temporary vector and matrix buffers used for calculations to avoid frequent memory allocations.
  var tempBuffers = {};
  
  return Utility.ShapeFactory.make({ 
    /*
     * Constructor function for creating new Cuboid instances.
     * Supports various initialization patterns:
     *
     * - new Cuboid(): Initializes an empty cuboid with default zero dimensions.
     * - new Cuboid(coordX, coordY, coordZ, widthVal, heightVal, depthVal):
     *   Defines the cuboid using its center coordinates and full dimensions.
     * - new Cuboid(positionVec, dimensionVec):
     *   Uses two 3D vectors; one for the center point and another for the half-dimensions.
     * - new Cuboid(sourceCuboid):
     *   Creates a new cuboid by cloning the properties of an existing cuboid object.
     *
     * @param {number} [coordX] - The X-coordinate for the cuboid's central point.
     * @param {number} [coordY] - The Y-coordinate for the cuboid's central point.
     * @param {number} [coordZ] - The Z-coordinate for the cuboid's central point.
     * @param {number} [widthVal] - The total width of the cuboid along the X-axis.
     * @param {number} [heightVal] - The total height of the cuboid along the Y-axis.
     * @param {number} [depthVal] - The total depth of the cuboid along the Z-axis.
     * @param {vec3} [positionVec] - A 3D vector specifying the cuboid's midpoint.
     * @param {vec3} [dimensionVec] - A 3D vector specifying the cuboid's half-extents.
     * @param {Cuboid} [sourceCuboid] - An existing Cuboid object to be copied.
     */
    initShape: function() {
      // Internal storage for the cuboid's geometric properties.
      this.extents = vec3.create();  // Stores the half-width, half-height, half-depth.
      this.midpoint = vec3.create(); // Stores the X, Y, Z coordinates of the cuboid's center.
    
      switch(arguments.length) {
        case 0:
          // Default constructor: creates a cuboid at (0,0,0) with zero dimensions.
          break;
        case 6: // Parameters: x, y, z, width, height, depth
          this.midpoint[0] = arguments[0];
          this.midpoint[1] = arguments[1];
          this.midpoint[2] = arguments[2];
          this.extents[0] = arguments[3];
          this.extents[1] = arguments[4];
          this.extents[2] = arguments[5];
          break;
        case 2: // Parameters: position vector, half-size vector
          vec3.set(arguments[0], this.midpoint); // Set midpoint from first argument
          vec3.set(arguments[1], this.extents);  // Set extents from second argument
          break;
        case 1: // Parameter: another Cuboid object to clone
          vec3.set(arguments[0].getMidpoint(), this.midpoint); // Copy center from source cuboid
          vec3.set(arguments[0].getExtents(), this.extents);   // Copy half-size from source cuboid
          break;
        default:
          // Throws an error for unsupported constructor argument counts.
          throw new Error("Invalid number of input arguments for Cuboid initialization.");
      }
    },
    
    // Returns a descriptive string representation of the cuboid's state.
    toDescriptionString: function() {
      return "[Cuboid midpoint:" + this.midpoint + "; extents:" + this.extents + "]";
    },
  
    // Retrieves the 3D vector representing the cuboid's half-dimensions.
    getExtents: function() { 
      return this.extents; 
    },
    // Retrieves the 3D vector representing the cuboid's center point.
    getMidpoint: function() { 
      return this.midpoint; 
    },
    // Calculates and returns the total volume occupied by the cuboid.
    calculateSpaceOccupied: function() { 
      return this.extents[0] * this.extents[1] * this.extents[2] * 8; 
    },
  
    // Determines if a ray intersects with this cuboid.
    // If 'maxDistance' is provided, it tests against a line segment (finite ray).
    checkRayCollision: function(rayOrigin, rayDirection, maxDistance) {
      if (maxDistance !== undefined) { 
        return this.checkSegmentCollision(rayOrigin, rayDirection, maxDistance); 
      }

      var absDirectionVec = vec3.create();  // Absolute values of ray direction components
      var absCrossProduct = vec3.create();  // Absolute values of cross product results
      var tempScalar;                       // Temporary scalar for calculations
      var offsetVector = vec3.create();     // Vector from cuboid's center to ray's origin
      var totalDimensions = vec3.scale(this.extents, 2, vec3.create()); // Full dimensions (width, height, depth)
      var crossResult = vec3.create();      // Resultant vector of cross product

      // Calculate the vector from the cuboid's midpoint to the ray's origin.
      vec3.subtract(rayOrigin, this.midpoint, offsetVector);

      for(let idx = 0; idx < 3; idx++) // Iterate over X, Y, Z axes
      {
        absDirectionVec[idx] = Math.abs(rayDirection[idx]);
        // Early exit: if the ray origin is outside the cuboid along an axis,
        // and the ray is moving away from the cuboid along that axis.
        if (Math.abs(offsetVector[idx]) > totalDimensions[idx] && offsetVector[idx] * rayDirection[idx] >= 0) {
          return false;
        }
      }

      // Compute cross product of ray direction and offset vector.
      vec3.cross(rayDirection, offsetVector, crossResult);

      // Separating Axis Theorem (SAT) checks for intersections.
      // Check along axes derived from ray direction and cuboid's primary axes.
      
      // Check for separation along the X-axis related to the cross product.
      absCrossProduct[0] = Math.abs(crossResult[0]);
      tempScalar = totalDimensions[1] * absDirectionVec[2] + totalDimensions[2] * absDirectionVec[1];
      if (absCrossProduct[0] > tempScalar) {
          return false;
      }

      // Check for separation along the Y-axis related to the cross product.
      absCrossProduct[1] = Math.abs(crossResult[1]);
      tempScalar = totalDimensions[0] * absDirectionVec[2] + totalDimensions[2] * absDirectionVec[0];
      if (absCrossProduct[1] > tempScalar) {
          return false;
      }

      // Check for separation along the Z-axis related to the cross product.
      absCrossProduct[2] = Math.abs(crossResult[2]);
      tempScalar = totalDimensions[0] * absDirectionVec[1] + totalDimensions[1] * absDirectionVec[0];
      if (absCrossProduct[2] > tempScalar) {
          return false;
      }

      return true; // No separating axis found, indicating an intersection.
    },
  
    /*
     * Cuboid#checkSegmentCollision(startPoint, endPointOrDirection, segmentLength) -> Boolean
     * Cuboid#checkSegmentCollision(startPoint, endPoint) -> Boolean
     *
     * Checks if a finite line segment intersects with this cuboid.
     * The segment can be defined by a start point, a direction, and a length,
     * or by a start point and an end point.
     */
    checkSegmentCollision: function(startPoint, endPointOrDirection, segmentLength) {
      var segmentVector = vec3.create(); // Stores the vector representing the line segment.
      
      if (segmentLength !== undefined) {
        if (!isFinite(segmentLength)) { 
          return this.checkRayCollision(startPoint, endPointOrDirection, undefined); 
        } // If length is infinite, treat as an infinite ray.
        vec3.scale(endPointOrDirection, segmentLength, segmentVector); // Scale direction by length to get segment vector.
      } else {
        vec3.subtract(endPointOrDirection, startPoint, segmentVector); // Calculate vector from start to end point.
        vec3.create(); // Redundant vec3.create() call, kept for structural fidelity.
        endPointOrDirection = vec3.normalize(endPointOrDirection, vec3.create()); // Original line, might be incorrect logic if D was an endpoint.
      }
      
      var cuboidMin, cuboidMax, segmentStart, segmentEnd; // Variables for axis-aligned min/max bounds.
      for (var componentIndex = 0; componentIndex < 3; componentIndex++) { // Iterate through X, Y, Z components.
        cuboidMin = this.midpoint[componentIndex] - this.extents[componentIndex]; // Cuboid's min bound on current axis.
        cuboidMax = this.midpoint[componentIndex] + this.extents[componentIndex]; // Cuboid's max bound on current axis.
        segmentStart = startPoint[componentIndex]; // Segment's start point on current axis.
        segmentEnd = startPoint[componentIndex] + segmentVector[componentIndex]; // Segment's end point on current axis.
        var tempVar; // Unused variable, kept for structural consistency.
        
        // Simple 1D overlap test: if the segment's interval does not overlap the cuboid's interval, no intersection.
        if (segmentStart < cuboidMin) { 
          if (cuboidMin >= segmentEnd) { 
            return false; 
          } 
        }
        else if (segmentStart >= cuboidMax) { 
          return false; 
        }
      }
      return true; // If no separation found on any axis, an intersection exists.
    },
  
    // Checks if this cuboid overlaps with a given sphere.
    overlapsSphere: function(sphereCenter, sphereRadius) {
      var cuboidMaxBounds = vec3.create(); // Temporary vector to store the cuboid's max corner.
      vec3.add(this.midpoint, this.extents, cuboidMaxBounds); // Calculate the maximum corner of the cuboid.

      var squaredDistance = 0, componentDifference, cuboidMinComponent; // Initialize squared distance and temporary variables.
      for(var axisIdx = 0; axisIdx < 3; axisIdx++) // Iterate over X, Y, Z axes.
      {
        cuboidMinComponent = this.midpoint[axisIdx] - this.extents[axisIdx]; // Calculate the minimum corner component.
        if (sphereCenter[axisIdx] < cuboidMinComponent) // If sphere center is below the cuboid's min bound on this axis.
        {
          componentDifference = sphereCenter[axisIdx] - cuboidMinComponent;
          squaredDistance += componentDifference * componentDifference; // Add squared difference to total.
        }
        else if (sphereCenter[axisIdx] > cuboidMaxBounds[axisIdx]) // If sphere center is above the cuboid's max bound on this axis.
        {
          componentDifference = sphereCenter[axisIdx] - cuboidMaxBounds[axisIdx];
          squaredDistance += componentDifference * componentDifference; // Add squared difference to total.
        }
      }
      return (squaredDistance <= (sphereRadius * sphereRadius)); // Check if the closest point on the cuboid is within the sphere's radius.
    },
  
    // Determines if a specified 3D point lies within the boundaries of this cuboid.
    containsPoint: function(testPoint) {
      var currentMidpoint = this.midpoint; // Reference to the cuboid's center.
      var currentExtents = this.extents;   // Reference to the cuboid's half-dimensions.
      
      // Check if the point's X-coordinate is within the cuboid's X-bounds.
      if (testPoint[0] < currentMidpoint[0] - currentExtents[0] || testPoint[0] > currentMidpoint[0] + currentExtents[0]) { 
        return false; 
      }
      // Check if the point's Y-coordinate is within the cuboid's Y-bounds.
      if (testPoint[1] < currentMidpoint[1] - currentExtents[1] || testPoint[1] > currentMidpoint[1] + currentExtents[1]) { 
        return false; 
      }
      // Check if the point's Z-coordinate is within the cuboid's Z-bounds.
      if (testPoint[2] < currentMidpoint[2] - currentExtents[2] || testPoint[2] > currentMidpoint[2] + currentExtents[2]) { 
        return false; 
      }
      return true; // The point is within all three axis bounds, therefore it is inside the cuboid.
    },
  
    // Checks for intersection between this Axis-Aligned Bounding Box (AABB) and another AABB.
    collidesWithAABB: function(otherCuboid) {
      var thisMidpoint = this.midpoint;     // Center point of the current cuboid.
      var thisMaxPoint = vec3.create();     // Calculated maximum corner of the current cuboid.
      var otherMidpoint = otherCuboid.getMidpoint(); // Center point of the other cuboid.
      var otherMaxPoint = vec3.create();     // Calculated maximum corner of the other cuboid.
      var otherExtents = otherCuboid.getExtents();   // Half-dimensions of the other cuboid.
      
      vec3.add(thisMidpoint, this.extents, thisMaxPoint);       // Determine current cuboid's max corner.
      vec3.add(otherMidpoint, otherExtents, otherMaxPoint);     // Determine other cuboid's max corner.
    
      // Perform 1D overlap tests for each axis (X, Y, Z).
      // If there's no overlap on any single axis, the cuboids do not intersect.
      return (Math.max(otherMidpoint[0] - otherExtents[0], thisMidpoint[0] - this.extents[0]) <= Math.min(otherMaxPoint[0], thisMaxPoint[0]) && 
              Math.max(otherMidpoint[1] - otherExtents[1], thisMidpoint[1] - this.extents[1]) <= Math.min(otherMaxPoint[1], thisMaxPoint[1]) && 
              Math.max(otherMidpoint[2] - otherExtents[2], thisMidpoint[2] - this.extents[2]) <= Math.min(otherMaxPoint[2], thisMaxPoint[2]));
    },
    
    // Checks for intersection between this Axis-Aligned Bounding Box (AABB) and an Oriented Bounding Box (OBB).
    // The OBB is defined by 'targetShape' and its 'transformMatrix'.
    checkOrientedCollision: function(targetShape, transformMatrix) {
      
      var centerA = tempBuffers.centerA = tempBuffers.centerA || vec3.create(); // Center of cuboid A (this AABB)
      var axisX_A = vec3.UNIT_X; // Local X-axis for cuboid A (aligned with world X)
      var axisY_A = vec3.UNIT_Y; // Local Y-axis for cuboid A (aligned with world Y)
      var axisZ_A = vec3.UNIT_Z; // Local Z-axis for cuboid A (aligned with world Z)
      var extentX_A = this.extents[0]; // Half-width of cuboid A
      var extentY_A = this.extents[1]; // Half-height of cuboid A
      var extentZ_A = this.extents[2]; // Half-depth of cuboid A
      
      var centerB_transformed = tempBuffers.centerB_transformed = tempBuffers.centerB_transformed || vec3.create(); // Transformed center of cuboid B (the OBB)
      var axisX_B = tempBuffers.axisX_B = tempBuffers.axisX_B || vec3.create(); // Local X-axis for cuboid B (transformed)
      var axisY_B = tempBuffers.axisY_B = tempBuffers.axisY_B || vec3.create(); // Local Y-axis for cuboid B (transformed)
      var axisZ_B = tempBuffers.axisZ_B = tempBuffers.axisZ_B || vec3.create(); // Local Z-axis for cuboid B (transformed)
      var extentX_B = targetShape.extents[0]; // Half-width of cuboid B
      var extentY_B = targetShape.extents[1]; // Half-height of cuboid B
      var extentZ_B = targetShape.extents[2]; // Half-depth of cuboid B
          
      vec3.set(this.midpoint, centerA); // Store A's center.
      vec3.set(targetShape.midpoint, centerB_transformed); // Store B's center (before transformation).
      vec3.set(vec3.UNIT_X, axisX_B); // Initialize B's axes to identity.
      vec3.set(vec3.UNIT_Y, axisY_B);
      vec3.set(vec3.UNIT_Z, axisZ_B);
      
      mat4.multiplyVec3(transformMatrix, centerB_transformed, centerB_transformed); // Apply transformation to B's center.
      
      var inverseTransposeMatrix = tempBuffers.inverseTransposeMatrix = tempBuffers.inverseTransposeMatrix || mat3.create();
      mat4.toInverseMat3(transformMatrix, inverseTransposeMatrix); // Compute the inverse transpose of the transformation matrix.
      mat3.transpose(inverseTransposeMatrix); // Transpose the matrix.
      mat3.multiplyVec3(inverseTransposeMatrix, axisX_B, axisX_B); // Transform B's local axes into A's coordinate system.
      mat3.multiplyVec3(inverseTransposeMatrix, axisY_B, axisY_B);
      mat3.multiplyVec3(inverseTransposeMatrix, axisZ_B, axisZ_B);
      
      var translationVector = tempBuffers.translationVector = tempBuffers.translationVector || vec3.create();
      vec3.subtract(centerB_transformed, centerA, translationVector); // Calculate vector from A's center to B's center.
      
      // Implement the Separating Axis Theorem (SAT) with 15 potential separating axes.
      // If a separating axis is found, the cuboids do not intersect.
      
      // Case 1: Separating axis is A's X-axis.
      var rotX_X = vec3.dot(axisX_A, axisX_B); // Dot product of A's X and B's X
      var rotX_Y = vec3.dot(axisX_A, axisY_B); // Dot product of A's X and B's Y
      var rotX_Z = vec3.dot(axisX_A, axisZ_B); // Dot product of A's X and B's Z
      if (Math.abs(vec3.dot(translationVector, axisX_A)) > extentX_A + Math.abs(extentX_B * rotX_X) + Math.abs(extentY_B * rotX_Y) + Math.abs(extentZ_B * rotX_Z)) {
        return false;
      }
        
      // Case 2: Separating axis is A's Y-axis.
      var rotY_X = vec3.dot(axisY_A, axisX_B); // Dot product of A's Y and B's X
      var rotY_Y = vec3.dot(axisY_A, axisY_B); // Dot product of A's Y and B's Y
      var rotY_Z = vec3.dot(axisY_A, axisZ_B); // Dot product of A's Y and B's Z
      if (Math.abs(vec3.dot(translationVector, axisY_A)) > extentY_A + Math.abs(extentX_B * rotY_X) + Math.abs(extentY_B * rotY_Y) + Math.abs(extentZ_B * rotY_Z)) {
        return false;
      }
      
      // Case 3: Separating axis is A's Z-axis.
      var rotZ_X = vec3.dot(axisZ_A, axisX_B); // Dot product of A's Z and B's X
      var rotZ_Y = vec3.dot(axisZ_A, axisY_B); // Dot product of A's Z and B's Y
      var rotZ_Z = vec3.dot(axisZ_A, axisZ_B); // Dot product of A's Z and B's Z
      if (Math.abs(vec3.dot(translationVector, axisZ_A)) > extentZ_A + Math.abs(extentX_B * rotZ_X) + Math.abs(extentY_B * rotZ_Y) + Math.abs(extentZ_B * rotZ_Z)) {
        return false;
      }

      // Case 4: Separating axis is B's X-axis.
      if (Math.abs(vec3.dot(translationVector, axisX_B)) > extentX_B + Math.abs(extentX_A * rotX_X) + Math.abs(extentY_A * rotY_X) + Math.abs(extentZ_A * rotZ_X)) {
        return false;
      }

      // Case 5: Separating axis is B's Y-axis.
      if (Math.abs(vec3.dot(translationVector, axisY_B)) > extentY_B + Math.abs(extentX_A * rotX_Y) + Math.abs(extentY_A * rotY_Y) + Math.abs(extentZ_A * rotZ_Y)) {
        return false;
      }
      
      // Case 6: Separating axis is B's Z-axis.
      if (Math.abs(vec3.dot(translationVector, axisZ_B)) > extentZ_B + Math.abs(extentX_A * rotX_Z) + Math.abs(extentY_A * rotY_Z) + Math.abs(extentZ_A * rotZ_Z)) {
        return false;
      }

      // Cases 7-15: Separating axes are cross products of A's axes and B's axes.
      // L = Ax x Bx
      if (Math.abs(vec3.dot(translationVector, axisZ_A) * rotY_X - vec3.dot(translationVector, axisY_A) * rotZ_X) > Math.abs(extentY_A * rotZ_X) + Math.abs(extentZ_A * rotY_X) + Math.abs(extentY_B * rotX_Z) + Math.abs(extentZ_B * rotX_Y)) {
        return false;
      }

      // L = Ax x By
      if (Math.abs(vec3.dot(translationVector, axisZ_A) * rotY_Y - vec3.dot(translationVector, axisY_A) * rotZ_Y) > Math.abs(extentY_A * rotZ_Y) + Math.abs(extentZ_A * rotY_Y) + Math.abs(extentX_B * rotX_Z) + Math.abs(extentZ_B * rotX_X)) {
        return false;
      }
      
      // L = Ax x Bz
      if (Math.abs(vec3.dot(translationVector, axisZ_A) * rotY_Z - vec3.dot(translationVector, axisY_A) * rotZ_Z) > Math.abs(extentY_A * rotZ_Z) + Math.abs(extentZ_A * rotY_Z) + Math.abs(extentX_B * rotX_Y) + Math.abs(extentY_B * rotX_X)) {
        return false;
      }

      // L = Ay x Bx
      if (Math.abs(vec3.dot(translationVector, axisX_A) * rotZ_X - vec3.dot(translationVector, axisZ_A) * rotX_X) > Math.abs(extentX_A * rotZ_X) + Math.abs(extentZ_A * rotX_X) + Math.abs(extentY_B * rotY_Z) + Math.abs(extentZ_B * rotY_Y)) {
        return false;
      }

      // L = Ay x By
      if (Math.abs(vec3.dot(translationVector, axisX_A) * rotZ_Y - vec3.dot(translationVector, axisZ_A) * rotX_Y) > Math.abs(extentX_A * rotZ_Y) + Math.abs(extentZ_A * rotX_Y) + Math.abs(extentX_B * rotY_Z) + Math.abs(extentZ_B * rotY_X)) {
        return false;
      }

      // L = Ay x Bz
      if (Math.abs(vec3.dot(translationVector, axisX_A) * rotZ_Z - vec3.dot(translationVector, axisZ_A) * rotX_Z) > Math.abs(extentX_A * rotZ_Z) + Math.abs(extentZ_A * rotX_Z) + Math.abs(extentX_B * rotY_Y) + Math.abs(extentY_B * rotY_X)) {
        return false;
      }

      // L = Az x Bx
      if (Math.abs(vec3.dot(translationVector, axisY_A) * rotX_X - vec3.dot(translationVector, axisX_A) * rotY_X) > Math.abs(extentX_A * rotY_X) + Math.abs(extentY_A * rotX_X) + Math.abs(extentY_B * rotZ_Z) + Math.abs(extentZ_B * rotZ_Y)) {
        return false;
      }

      // L = Az x By
      if (Math.abs(vec3.dot(translationVector, axisY_A) * rotX_Y - vec3.dot(translationVector, axisX_A) * rotY_Y) > Math.abs(extentX_A * rotY_Y) + Math.abs(extentY_A * rotX_Y) + Math.abs(extentX_B * rotZ_Z) + Math.abs(extentZ_B * rotZ_X)) {
        return false;
      }

      // L = Az x Bz
      if (Math.abs(vec3.dot(translationVector, axisY_A) * rotX_Z - vec3.dot(translationVector, axisX_A) * rotY_Z) > Math.abs(extentX_A * rotY_Z) + Math.abs(extentY_A * rotX_Z) + Math.abs(extentX_B * rotZ_Y) + Math.abs(extentY_B * rotZ_X)) {
        return false;
      }

      return true; // All separation axes checked; no separation found, thus collision occurs.
    }
  });
})();