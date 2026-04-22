// This module defines a SpatialBox class, representing an Axis-Aligned Bounding Box (AABB)
// It provides various methods for construction, querying properties, and intersection testing
// against other geometric primitives like rays, line segments, spheres, and other bounding volumes.
var SpatialBox = (function() {
  // A dedicated object for caching temporary vector and matrix allocations.
  // This helps to reduce garbage collection overhead in frequently called methods,
  // especially during intersection tests that involve many intermediate calculations.
  var tempAllocations = {};

  // Define a small epsilon value to handle floating-point precision issues,
  // particularly useful in intersection tests involving near-parallel axes.
  const GEOMETRY_EPSILON = 1e-6;

  return Jax.Class.create({
    /**
     * Constructs a new SpatialBox instance.
     * This constructor is overloaded and supports several initialization patterns:
     *
     * 1. `new SpatialBox()`: Creates an empty box at the origin with zero dimensions.
     * 2. `new SpatialBox(x, y, z, halfWidth, halfHeight, halfDepth)`: Defines the box
     *    by its central point (x, y, z) and its half-dimensions along each axis.
     * 3. `new SpatialBox(positionVector, sizeVector)`: Defines the box using
     *    two `vector3` objects for its centroid and half-dimensions.
     * 4. `new SpatialBox(otherBox)`: Clones the properties of an existing SpatialBox instance.
     *
     * @param {number|vector3|SpatialBox} [arg1] - X coordinate, position vector, or another SpatialBox.
     * @param {number|vector3} [arg2] - Y coordinate or size vector.
     * @param {number} [arg3] - Z coordinate.
     * @param {number} [arg4] - Half-width (X extent).
     * @param {number} [arg5] - Half-height (Y extent).
     * @param {number} [arg6] - Half-depth (Z extent).
     * @throws {Error} If invalid arguments are provided.
     */
    init: function() {
      // The central point of the bounding box in 3D space.
      this.centroid = vector3.create();
      // The half-dimensions (extents) of the box along the X, Y, and Z axes.
      this.extents = vector3.create();

      const numArgs = arguments.length;

      if (numArgs === 0) {
        // Case 1: No arguments - Initialize with default zero values.
        vector3.set(0, 0, 0, this.centroid);
        vector3.set(0, 0, 0, this.extents);
      } else if (numArgs === 6) {
        // Case 2: (x, y, z, halfWidth, halfHeight, halfDepth)
        if (![...arguments].every(val => typeof val === 'number')) {
          throw new Error("SpatialBox: All six arguments must be numbers for direct coordinate initialization.");
        }
        this.centroid[0] = arguments[0];
        this.centroid[1] = arguments[1];
        this.centroid[2] = arguments[2];
        this.extents[0] = arguments[3];
        this.extents[1] = arguments[4];
        this.extents[2] = arguments[5];
      } else if (numArgs === 2) {
        // Case 3: (positionVector, sizeVector)
        const posVec = arguments[0];
        const sizeVec = arguments[1];
        if (!vector3.isValid(posVec) || !vector3.isValid(sizeVec)) {
          throw new Error("SpatialBox: Two arguments must be valid vector3 objects.");
        }
        vector3.copy(posVec, this.centroid);
        vector3.copy(sizeVec, this.extents);
      } else if (numArgs === 1) {
        // Case 4: (otherBox)
        const sourceBox = arguments[0];
        // Basic check for SpatialBox-like interface
        if (!sourceBox || typeof sourceBox.getCentroid !== 'function' || typeof sourceBox.getExtents !== 'function') {
          throw new Error("SpatialBox: Single argument must be a valid SpatialBox instance to clone.");
        }
        vector3.copy(sourceBox.getCentroid(), this.centroid);
        vector3.copy(sourceBox.getExtents(), this.extents);
      } else {
        // Fallback for unsupported argument counts.
        throw new Error(`SpatialBox: Constructor called with an unsupported number of arguments (${numArgs}).`);
      }
    },

    /**
     * Provides a human-readable string representation of this bounding box for debugging.
     * @returns {string} A string describing the box's centroid and extents.
     */
    toDebugString: function() {
      // Formats the centroid and extents vectors for output.
      const formattedCentroid = this.centroid.map(c => c.toFixed(2)).join(', ');
      const formattedExtents = this.extents.map(e => e.toFixed(2)).join(', ');
      return `[SpatialBox | Centroid: (${formattedCentroid}) | Extents: (${formattedExtents})]`;
    },

    /**
     * Retrieves the half-dimensions (extents) vector of the bounding box.
     * @returns {vector3} A reference to the internal extents vector.
     */
    getExtents: function() {
      return this.extents;
    },

    /**
     * Retrieves the central point (centroid) vector of the bounding box.
     * @returns {vector3} A reference to the internal centroid vector.
     */
    getCentroid: function() {
      return this.centroid;
    },

    /**
     * Calculates the total volume enclosed by the bounding box.
     * The volume is (2 * halfWidth) * (2 * halfHeight) * (2 * halfDepth).
     * @returns {number} The scalar volume of the box.
     */
    calculateVolume: function() {
      // The full dimensions are twice the half-dimensions.
      const fullWidth = this.extents[0] * 2.0;
      const fullHeight = this.extents[1] * 2.0;
      const fullDepth = this.extents[2] * 2.0;
      return fullWidth * fullHeight * fullDepth;
    },

    /**
     * Determines if this AABB is intersected by a given ray.
     * This method implements a robust AABB-Ray intersection test using the slab method
     * and separating axis theorem checks for edge cases.
     *
     * @param {vector3} rayOrigin - The starting point of the ray.
     * @param {vector3} rayDirection - The direction vector of the ray.
     * @param {number} [maxRayDistance] - An optional maximum distance, effectively turning the ray into a line segment.
     * @returns {boolean} True if the ray (or segment) intersects the box, false otherwise.
     */
    testRayIntersection: function(rayOrigin, rayDirection, maxRayDistance) {
      // If a finite max distance is provided, delegate to line segment intersection.
      if (typeof maxRayDistance === 'number' && isFinite(maxRayDistance)) {
        return this.testLineSegmentIntersection(rayOrigin, rayDirection, maxRayDistance);
      }

      // Prepare temporary vectors from cache to avoid new allocations.
      const absRayDirection = tempAllocations.absRayDir = tempAllocations.absRayDir || vector3.create();
      const centroidToRayOrigin = tempAllocations.cToRO = tempAllocations.cToRO || vector3.create();
      const crossProductVector = tempAllocations.crossP = tempAllocations.crossP || vector3.create();
      const absCrossProduct = tempAllocations.absCrossP = tempAllocations.absCrossP || vector3.create();

      // Compute vector from box centroid to ray origin: O - C
      vector3.subtract(rayOrigin, this.centroid, centroidToRayOrigin);

      // Pre-calculate absolute values of ray direction components for efficiency.
      absRayDirection[0] = Math.abs(rayDirection[0]);
      absRayDirection[1] = Math.abs(rayDirection[1]);
      absRayDirection[2] = Math.abs(rayDirection[2]);

      // Check for separation along the AABB's primary axes (slab test).
      // If the ray starts outside an AABB slab and is moving away from it, no intersection.
      for (let i = 0; i < 3; ++i) {
        if (Math.abs(centroidToRayOrigin[i]) > this.extents[i] && (centroidToRayOrigin[i] * rayDirection[i]) >= 0) {
          return false;
        }
      }

      // Check for separation along axes formed by cross products of ray direction and AABB axes.
      // These cover cases where the ray might pass between corners or edges without hitting a face.
      vector3.cross(rayDirection, centroidToRayOrigin, crossProductVector);

      // Axis 1: Cross product of Ray.direction and AABB.Y_axis (effectively (D.z * (O.x-C.x)) - (D.x * (O.z-C.z)))
      absCrossProduct[0] = Math.abs(crossProductVector[0]);
      let separationThreshold = this.extents[1] * absRayDirection[2] + this.extents[2] * absRayDirection[1];
      if (absCrossProduct[0] > separationThreshold + GEOMETRY_EPSILON) { // Add epsilon for robustness
        return false;
      }

      // Axis 2: Cross product of Ray.direction and AABB.X_axis
      absCrossProduct[1] = Math.abs(crossProductVector[1]);
      separationThreshold = this.extents[0] * absRayDirection[2] + this.extents[2] * absRayDirection[0];
      if (absCrossProduct[1] > separationThreshold + GEOMETRY_EPSILON) {
        return false;
      }

      // Axis 3: Cross product of Ray.direction and AABB.Z_axis
      absCrossProduct[2] = Math.abs(crossProductVector[2]);
      separationThreshold = this.extents[0] * absRayDirection[1] + this.extents[1] * absRayDirection[0];
      if (absCrossProduct[2] > separationThreshold + GEOMETRY_EPSILON) {
        return false;
      }

      // If no separating axis is found, an intersection exists.
      return true;
    },

    /**
     * Determines if this AABB is intersected by a given line segment.
     * This method uses the generalized slab intersection test.
     *
     * @param {vector3} segmentStartPoint - The starting point of the line segment.
     * @param {vector3} segmentEndPointOrDirection - The end point of the segment OR its direction vector.
     * @param {number} [segmentLength] - If `segmentEndPointOrDirection` is a direction, this is its scalar length.
     * @returns {boolean} True if the segment intersects the box, false otherwise.
     */
    testLineSegmentIntersection: function(segmentStartPoint, segmentEndPointOrDirection, segmentLength) {
      const segmentDisplacement = tempAllocations.segDisp = tempAllocations.segDisp || vector3.create();
      const actualSegmentEnd = tempAllocations.actualSegEnd = tempAllocations.actualSegEnd || vector3.create();

      // Determine the segment's displacement vector and its true end point.
      if (typeof segmentLength === 'number' && isFinite(segmentLength)) {
        // `segmentEndPointOrDirection` is a direction vector, `segmentLength` is the scalar length.
        vector3.scale(segmentEndPointOrDirection, segmentLength, segmentDisplacement);
        vector3.add(segmentStartPoint, segmentDisplacement, actualSegmentEnd);
      } else {
        // `segmentEndPointOrDirection` is the end point.
        vector3.copy(segmentEndPointOrDirection, actualSegmentEnd);
        vector3.subtract(actualSegmentEnd, segmentStartPoint, segmentDisplacement);
      }

      // Calculate the minimum and maximum corner points of the AABB.
      const boxMinCorner = tempAllocations.boxMinC = tempAllocations.boxMinC || vector3.create();
      const boxMaxCorner = tempAllocations.boxMaxC = tempAllocations.boxMaxC || vector3.create();
      vector3.subtract(this.centroid, this.extents, boxMinCorner);
      vector3.add(this.centroid, this.extents, boxMaxCorner);

      let minParam = 0.0; // Minimum parameter value along the segment [0, 1]
      let maxParam = 1.0; // Maximum parameter value along the segment [0, 1]

      for (let i = 0; i < 3; ++i) {
        const segOriginComponent = segmentStartPoint[i];
        const segDirectionComponent = segmentDisplacement[i];

        if (Math.abs(segDirectionComponent) < GEOMETRY_EPSILON) {
          // Segment is parallel to this axis's slabs.
          if (segOriginComponent < boxMinCorner[i] || segOriginComponent > boxMaxCorner[i]) {
            return false; // Segment is outside this slab, no intersection.
          }
        } else {
          // Calculate intersection parameters with the near and far planes of this slab.
          const inverseDirection = 1.0 / segDirectionComponent;
          let tNear = (boxMinCorner[i] - segOriginComponent) * inverseDirection;
          let tFar = (boxMaxCorner[i] - segOriginComponent) * inverseDirection;

          // Ensure tNear is always the smaller parameter.
          if (tNear > tFar) {
            [tNear, tFar] = [tFar, tNear]; // Swap values using array destructuring.
          }

          minParam = Math.max(minParam, tNear);
          maxParam = Math.min(maxParam, tFar);

          // If the intersection interval collapses or becomes invalid, no intersection.
          if (minParam > maxParam + GEOMETRY_EPSILON) { // Add epsilon for robustness
            return false;
          }
        }
      }

      // If all axis tests pass, the segment intersects the box within its [0,1] range.
      return true;
    },

    /**
     * Checks for intersection between this AABB and a given sphere.
     * This uses the algorithm that finds the closest point on the AABB to the sphere's center.
     *
     * @param {vector3} sphereCenterPoint - The center coordinates of the sphere.
     * @param {number} sphereRadiusValue - The radius of the sphere.
     * @returns {boolean} True if the sphere intersects or touches the box, false otherwise.
     */
    testSphereIntersection: function(sphereCenterPoint, sphereRadiusValue) {
      const closestPointOnBox = tempAllocations.closestP = tempAllocations.closestP || vector3.create();
      const boxMinimums = tempAllocations.boxMin = tempAllocations.boxMin || vector3.create();
      const boxMaximums = tempAllocations.boxMax = tempAllocations.boxMax || vector3.create();

      // Determine the AABB's min and max corners.
      vector3.subtract(this.centroid, this.extents, boxMinimums);
      vector3.add(this.centroid, this.extents, boxMaximums);

      // Find the point on the AABB that is closest to the sphere's center.
      // This is done by clamping the sphere's center coordinates to the AABB's bounds.
      closestPointOnBox[0] = Math.max(boxMinimums[0], Math.min(sphereCenterPoint[0], boxMaximums[0]));
      closestPointOnBox[1] = Math.max(boxMinimums[1], Math.min(sphereCenterPoint[1], boxMaximums[1]));
      closestPointOnBox[2] = Math.max(boxMinimums[2], Math.min(sphereCenterPoint[2], boxMaximums[2]));

      // Calculate the squared distance between the sphere's center and this closest point.
      const deltaX = sphereCenterPoint[0] - closestPointOnBox[0];
      const deltaY = sphereCenterPoint[1] - closestPointOnBox[1];
      const deltaZ = sphereCenterPoint[2] - closestPointOnBox[2];
      const squaredDistance = (deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ);

      // Compare the squared distance to the squared radius.
      // If distance <= radius, they intersect.
      const squaredRadius = sphereRadiusValue * sphereRadiusValue;
      return squaredDistance <= squaredRadius;
    },

    /**
     * Determines if a specific 3D point is located inside or on the boundary of this AABB.
     *
     * @param {vector3} queryPoint - The point (as a vector3) to check for containment.
     * @returns {boolean} True if the point is within the box, false otherwise.
     */
    containsPoint: function(queryPoint) {
      // Calculate the minimum and maximum bounds for each axis.
      const minXBound = this.centroid[0] - this.extents[0];
      const maxXBound = this.centroid[0] + this.extents[0];
      const minYBound = this.centroid[1] - this.extents[1];
      const maxYBound = this.centroid[1] + this.extents[1];
      const minZBound = this.centroid[2] - this.extents[2];
      const maxZBound = this.centroid[2] + this.extents[2];

      // Check if the query point's coordinates are within these bounds for all three axes.
      const isWithinX = (queryPoint[0] >= minXBound && queryPoint[0] <= maxXBound);
      const isWithinY = (queryPoint[1] >= minYBound && queryPoint[1] <= maxYBound);
      const isWithinZ = (queryPoint[2] >= minZBound && queryPoint[2] <= maxZBound);

      // The point is contained only if it's within bounds on all axes.
      return isWithinX && isWithinY && isWithinZ;
    },

    /**
     * Checks for intersection between this AABB and another Axis-Aligned Bounding Box (AABB).
     * Two AABBs intersect if and only if they overlap on all three coordinate axes.
     *
     * @param {SpatialBox} anotherAABB - The other AABB instance to check against.
     * @returns {boolean} True if the two boxes overlap, false otherwise.
     */
    testAABBIntersection: function(anotherAABB) {
      // Input validation: Ensure the other object is a valid SpatialBox or similar.
      if (!anotherAABB || typeof anotherAABB.getCentroid !== 'function' || typeof anotherAABB.getExtents !== 'function') {
        // For robustness, treat invalid input as no intersection.
        return false;
      }

      const ourCentroid = this.centroid;
      const ourExtents = this.extents;

      const theirCentroid = anotherAABB.getCentroid();
      const theirExtents = anotherAABB.getExtents();

      // Calculate the absolute difference between centroids along each axis.
      const deltaX = Math.abs(ourCentroid[0] - theirCentroid[0]);
      const deltaY = Math.abs(ourCentroid[1] - theirCentroid[1]);
      const deltaZ = Math.abs(ourCentroid[2] - theirCentroid[2]);

      // Sum of half-extents for each axis.
      const sumExtentsX = ourExtents[0] + theirExtents[0];
      const sumExtentsY = ourExtents[1] + theirExtents[1];
      const sumExtentsZ = ourExtents[2] + theirExtents[2];

      // Check for overlap on each axis.
      // If the distance between centers is greater than the sum of half-extents, there's a gap.
      const overlapsOnX = deltaX <= sumExtentsX;
      const overlapsOnY = deltaY <= sumExtentsY;
      const overlapsOnZ = deltaZ <= sumExtentsZ;

      // Intersection occurs only if there is overlap on all three axes.
      return overlapsOnX && overlapsOnY && overlapsOnZ;
    },

    /**
     * Tests for intersection between this AABB and an Oriented Bounding Box (OBB).
     * This sophisticated method employs the Separating Axis Theorem (SAT)
     * by checking for overlap along 15 potential separating axes.
     *
     * @param {SpatialBox} otherOBB - The OBB instance (represented as a SpatialBox with a transform).
     * @param {matrix4} obbWorldTransform - The 4x4 transformation matrix that places the OBB in world space.
     * @returns {boolean} True if an intersection occurs, false otherwise.
     */
    testOBBIntersection: function(otherOBB, obbWorldTransform) {
      // Guard clauses for invalid inputs.
      if (!otherOBB || !obbWorldTransform || typeof otherOBB.getCentroid !== 'function' || typeof otherOBB.getExtents !== 'function') {
        return false;
      }

      // Retrieve or create temporary vectors and matrices for calculations.
      const centroidA = tempAllocations.c_A = tempAllocations.c_A || vector3.create(); // This AABB's centroid
      const centroidB = tempAllocations.c_B = tempAllocations.c_B || vector3.create(); // Other OBB's centroid

      // AABB's axes are fixed (world X, Y, Z).
      const axisA_X = vector3.UNIT_X;
      const axisA_Y = vector3.UNIT_Y;
      const axisA_Z = vector3.UNIT_Z;

      // OBB's axes (in world space).
      const axisB_X = tempAllocations.ax_BX = tempAllocations.ax_BX || vector3.create();
      const axisB_Y = tempAllocations.ax_BY = tempAllocations.ax_BY || vector3.create();
      const axisB_Z = tempAllocations.ax_BZ = tempAllocations.ax_BZ || vector3.create();

      const differenceVector = tempAllocations.diffV = tempAllocations.diffV || vector3.create(); // Vector from A's centroid to B's centroid

      // Get extents (half-dimensions) for both boxes.
      const extA_X = this.extents[0];
      const extA_Y = this.extents[1];
      const extA_Z = this.extents[2];

      const extB_X = otherOBB.extents[0];
      const extB_Y = otherOBB.extents[1];
      const extB_Z = otherOBB.extents[2];

      // 1. Set AABB's centroid in world space.
      vector3.copy(this.centroid, centroidA);

      // 2. Transform OBB's local centroid to world space.
      vector3.copy(otherOBB.centroid, centroidB);
      matrix4.multiplyVector3(obbWorldTransform, centroidB, centroidB);

      // 3. Extract OBB's world-space orientation axes from its transformation matrix.
      // These are the first three column vectors (rotation part) of the matrix.
      axisB_X[0] = obbWorldTransform[0]; axisB_X[1] = obbWorldTransform[1]; axisB_X[2] = obbWorldTransform[2];
      axisB_Y[0] = obbWorldTransform[4]; axisB_Y[1] = obbWorldTransform[5]; axisB_Y[2] = obbWorldTransform[6];
      axisB_Z[0] = obbWorldTransform[8]; axisB_Z[1] = obbWorldTransform[9]; axisB_Z[2] = obbWorldTransform[10];

      // 4. Calculate the vector connecting the two centroids: T = B.centroid - A.centroid
      vector3.subtract(centroidB, centroidA, differenceVector);

      // 5. Calculate the rotation matrix R_AB (dot products of A's axes with B's axes).
      // R_AB[i][j] = dot(AxisA_i, AxisB_j)
      const R_AB_matrix = [
        vector3.dot(axisA_X, axisB_X), vector3.dot(axisA_X, axisB_Y), vector3.dot(axisA_X, axisB_Z),
        vector3.dot(axisA_Y, axisB_X), vector3.dot(axisA_Y, axisB_Y), vector3.dot(axisA_Y, axisB_Z),
        vector3.dot(axisA_Z, axisB_X), vector3.dot(axisA_Z, axisB_Y), vector3.dot(axisA_Z, axisB_Z)
      ];

      // Also compute absolute values of R_AB components, adding epsilon for robustness against floating point errors.
      const abs_R_AB_matrix = R_AB_matrix.map(val => Math.abs(val) + GEOMETRY_EPSILON);

      // ====================================================================
      // Test 1: Separating axes are the three local axes of Box A (AABB).
      // L = A.x, A.y, A.z
      // ====================================================================

      // Axis L = A.x (world X axis)
      // Projection of difference vector on A.x: T.A_x = T[0]
      // Projection of A's extents on A.x: extA_X
      // Projection of B's extents on A.x: extB_X * |R_AB[0]| + extB_Y * |R_AB[1]| + extB_Z * |R_AB[2]|
      if (Math.abs(differenceVector[0]) > extA_X + (extB_X * abs_R_AB_matrix[0] + extB_Y * abs_R_AB_matrix[1] + extB_Z * abs_R_AB_matrix[2])) {
        return false;
      }

      // Axis L = A.y (world Y axis)
      // Projection of difference vector on A.y: T.A_y = T[1]
      // Projection of A's extents on A.y: extA_Y
      // Projection of B's extents on A.y: extB_X * |R_AB[3]| + extB_Y * |R_AB[4]| + extB_Z * |R_AB[5]|
      if (Math.abs(differenceVector[1]) > extA_Y + (extB_X * abs_R_AB_matrix[3] + extB_Y * abs_R_AB_matrix[4] + extB_Z * abs_R_AB_matrix[5])) {
        return false;
      }

      // Axis L = A.z (world Z axis)
      // Projection of difference vector on A.z: T.A_z = T[2]
      // Projection of A's extents on A.z: extA_Z
      // Projection of B's extents on A.z: extB_X * |R_AB[6]| + extB_Y * |R_AB[7]| + extB_Z * |R_AB[8]|
      if (Math.abs(differenceVector[2]) > extA_Z + (extB_X * abs_R_AB_matrix[6] + extB_Y * abs_R_AB_matrix[7] + extB_Z * abs_R_AB_matrix[8])) {
        return false;
      }

      // ====================================================================
      // Test 2: Separating axes are the three local axes of Box B (OBB).
      // L = B.x, B.y, B.z
      // ====================================================================

      // Axis L = B.x (OBB's local X axis in world space)
      // Projection of difference vector on B.x: T.B_x
      // Projection of A's extents on B.x: extA_X * |R_AB[0]| + extA_Y * |R_AB[3]| + extA_Z * |R_AB[6]|
      if (Math.abs(vector3.dot(differenceVector, axisB_X)) > extB_X + (extA_X * abs_R_AB_matrix[0] + extA_Y * abs_R_AB_matrix[3] + extA_Z * abs_R_AB_matrix[6])) {
        return false;
      }

      // Axis L = B.y (OBB's local Y axis in world space)
      // Projection of difference vector on B.y: T.B_y
      // Projection of A's extents on B.y: extA_X * |R_AB[1]| + extA_Y * |R_AB[4]| + extA_Z * |R_AB[7]|
      if (Math.abs(vector3.dot(differenceVector, axisB_Y)) > extB_Y + (extA_X * abs_R_AB_matrix[1] + extA_Y * abs_R_AB_matrix[4] + extA_Z * abs_R_AB_matrix[7])) {
        return false;
      }

      // Axis L = B.z (OBB's local Z axis in world space)
      // Projection of difference vector on B.z: T.B_z
      // Projection of A's extents on B.z: extA_X * |R_AB[2]| + extA_Y * |R_AB[5]| + extA_Z * |R_AB[8]|
      if (Math.abs(vector3.dot(differenceVector, axisB_Z)) > extB_Z + (extA_X * abs_R_AB_matrix[2] + extA_Y * abs_R_AB_matrix[5] + extA_Z * abs_R_AB_matrix[8])) {
        return false;
      }

      // ====================================================================
      // Test 3: Separating axes are the nine cross products of axes from Box A and Box B.
      // L = A.x x B.x, A.x x B.y, A.x x B.z, etc.
      // This uses the scalar triple product identity: dot(T, A x B) = dot(T x A, B) = dot(A, B x T)
      // The original code's terms are equivalent to the standard SAT formulation.
      // ====================================================================

      // L = A.x x B.x
      if (Math.abs(differenceVector[2] * R_AB_matrix[3] - differenceVector[1] * R_AB_matrix[6]) > // |dot(T, A.x x B.x)|
          extA_Y * abs_R_AB_matrix[6] + extA_Z * abs_R_AB_matrix[3] + // Proj A on L
          extB_Y * abs_R_AB_matrix[2] + extB_Z * abs_R_AB_matrix[1]) { // Proj B on L
        return false;
      }

      // L = A.x x B.y
      if (Math.abs(differenceVector[2] * R_AB_matrix[4] - differenceVector[1] * R_AB_matrix[7]) >
          extA_Y * abs_R_AB_matrix[7] + extA_Z * abs_R_AB_matrix[4] +
          extB_X * abs_R_AB_matrix[2] + extB_Z * abs_R_AB_matrix[0]) {
        return false;
      }

      // L = A.x x B.z
      if (Math.abs(differenceVector[2] * R_AB_matrix[5] - differenceVector[1] * R_AB_matrix[8]) >
          extA_Y * abs_R_AB_matrix[8] + extA_Z * abs_R_AB_matrix[5] +
          extB_X * abs_R_AB_matrix[1] + extB_Y * abs_R_AB_matrix[0]) {
        return false;
      }

      // L = A.y x B.x
      if (Math.abs(differenceVector[0] * R_AB_matrix[6] - differenceVector[2] * R_AB_matrix[0]) >
          extA_X * abs_R_AB_matrix[6] + extA_Z * abs_R_AB_matrix[0] +
          extB_Y * abs_R_AB_matrix[5] + extB_Z * abs_R_AB_matrix[4]) {
        return false;
      }

      // L = A.y x B.y
      if (Math.abs(differenceVector[0] * R_AB_matrix[7] - differenceVector[2] * R_AB_matrix[1]) >
          extA_X * abs_R_AB_matrix[7] + extA_Z * abs_R_AB_matrix[1] +
          extB_X * abs_R_AB_matrix[5] + extB_Z * abs_R_AB_matrix[3]) {
        return false;
      }

      // L = A.y x B.z
      if (Math.abs(differenceVector[0] * R_AB_matrix[8] - differenceVector[2] * R_AB_matrix[2]) >
          extA_X * abs_R_AB_matrix[8] + extA_Z * abs_R_AB_matrix[2] +
          extB_X * abs_R_AB_matrix[4] + extB_Y * abs_R_AB_matrix[3]) {
        return false;
      }

      // L = A.z x B.x
      if (Math.abs(differenceVector[1] * R_AB_matrix[0] - differenceVector[0] * R_AB_matrix[3]) >
          extA_X * abs_R_AB_matrix[3] + extA_Y * abs_R_AB_matrix[0] +
          extB_Y * abs_R_AB_matrix[8] + extB_Z * abs_R_AB_matrix[7]) {
        return false;
      }

      // L = A.z x B.y
      if (Math.abs(differenceVector[1] * R_AB_matrix[1] - differenceVector[0] * R_AB_matrix[4]) >
          extA_X * abs_R_AB_matrix[4] + extA_Y * abs_R_AB_matrix[1] +
          extB_X * abs_R_AB_matrix[8] + extB_Z * abs_R_AB_matrix[6]) {
        return false;
      }

      // L = A.z x B.z
      if (Math.abs(differenceVector[1] * R_AB_matrix[2] - differenceVector[0] * R_AB_matrix[5]) >
          extA_X * abs_R_AB_matrix[5] + extA_Y * abs_R_AB_matrix[2] +
          extB_X * abs_R_AB_matrix[7] + extB_Y * abs_R_AB_matrix[6]) {
        return false;
      }

      // If no separating axis was found after all 15 tests, the boxes must be intersecting.
      return true;
    }
  });
})();