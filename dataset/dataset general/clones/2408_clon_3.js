(function moduleKernel(moduleDefinitions, moduleCache, entryPoints) {
  // Internal function to resolve and load a module by its identifier
  function loadModule(moduleId, isInternalCall) {
    // If the module is already in the cache, return it
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If the module definition doesn't exist, try to load it from a global require or throw an error
    if (!moduleDefinitions[moduleId]) {
      const globalLoader = typeof require === "function" && require;
      if (!isInternalCall && globalLoader) {
        return globalLoader(moduleId, true);
      }
      if (cachedLoader) {
        return cachedLoader(moduleId, true);
      }
      throw new Error(`Unable to locate module: '${moduleId}'`);
    }

    // Create a new module object and store it in the cache
    const moduleObject = moduleCache[moduleId] = {
      exports: {}
    };

    // Execute the module's definition function, providing its context
    moduleDefinitions[moduleId][0].call(
      moduleObject.exports,
      // Custom require function for this module
      function(relativeModulePath) {
        const mappedModuleId = moduleDefinitions[moduleId][1][relativeModulePath];
        // Resolve the module using its mapped ID or the original path
        return loadModule(mappedModuleId ? mappedModuleId : relativeModulePath);
      },
      moduleObject,
      moduleObject.exports,
      moduleKernel, // Pass the main module kernel
      moduleDefinitions,
      moduleCache,
      entryPoints
    );

    // Return the exports of the newly loaded module
    return moduleObject.exports;
  }

  // Attempt to get a global require function for external dependencies
  const cachedLoader = typeof require === "function" && require;

  // Load all entry point modules
  for (let entryIdx = 0; entryIdx < entryPoints.length; entryIdx++) {
    loadModule(entryPoints[entryIdx]);
  }

  // Return the main module loading function
  return loadModule;
})({
  1: [function(getModule, currentModule, moduleExports) {
    'use strict';
    // Main application bootstrap file. Initializes the simulation environment and user interface.

    let jqUtil, lodashUtils, SceneRenderer, SimEnvironment, appConfig, datUI;

    // Ensure core utility modules are loaded and available.
    getModule('./shared_utilities');

    jqUtil = getModule('jquery');
    lodashUtils = getModule('underscore'); // Using underscore as per original, but lodash is a common replacement.

    SceneRenderer = getModule('./visualizer/visualizer');
    datUI = getModule('dat-gui');
    SimEnvironment = getModule('./model/world');
    appConfig = getModule('./settings');

    /**
     * Executes once the DOM is fully loaded.
     * Sets up the canvas, initializes the simulation, and configures the debug GUI.
     */
    jqUtil(function() {
      if (!jqUtil || !lodashUtils || !SceneRenderer || !datUI || !SimEnvironment || !appConfig) {
        console.error("Critical dependencies failed to load. Aborting initialization.");
        return;
      }

      // Create the main rendering canvas element and append it to the document body.
      const displayCanvas = jqUtil('<canvas />', {
        id: 'simulation_canvas_surface',
        // Set initial canvas dimensions (can be dynamic later)
        width: window.innerWidth,
        height: window.innerHeight
      });
      jqUtil(document.body).append(displayCanvas);

      // Initialize the global simulation environment.
      // Using a global object `APP` to encapsulate global state, rather than direct `window` properties.
      window.APP = window.APP || {};
      window.APP.simulationEnv = new SimEnvironment();
      window.APP.simulationEnv.load(); // Attempt to load previous simulation state.

      // If no junctions are loaded, generate a default map for demonstration.
      const initialJunctionCount = window.APP.simulationEnv.junctions.length;
      if (initialJunctionCount === 0) {
        console.info("No existing map found; generating a default simulation environment.");
        window.APP.simulationEnv.generateMap();
        window.APP.simulationEnv.vehicleCount = 100; // Default number of vehicles.
      } else {
        console.info(`Loaded simulation environment with ${initialJunctionCount} junctions.`);
      }

      // Initialize the visual rendering component.
      window.APP.sceneViz = new SceneRenderer(window.APP.simulationEnv);
      window.APP.sceneViz.startRenderingLoop(); // Begin the animation and simulation updates.

      // --- Debug GUI Setup (dat.GUI) ---
      const debugPanel = new datUI.GUI({
        width: 350
      }); // Instantiate the GUI panel.

      // Group for simulation environment controls.
      const envControls = debugPanel.addFolder('Simulation Environment');
      envControls.open(); // Keep this folder open by default.
      envControls.add(window.APP.simulationEnv, 'save').name('Save Current State');
      envControls.add(window.APP.simulationEnv, 'load').name('Load Saved State');
      envControls.add(window.APP.simulationEnv, 'clear').name('Clear All Data');
      envControls.add(window.APP.simulationEnv, 'generateMap').name('Generate New Map');

      // Group for visualizer controls.
      const rendererControls = debugPanel.addFolder('Display Settings');
      rendererControls.open(); // Keep this folder open by default.
      rendererControls.add(window.APP.sceneViz, 'isActive').name('Running').listen();
      rendererControls.add(window.APP.sceneViz, 'showDebugInfo').name('Show Debug Overlay').listen();
      rendererControls.add(window.APP.sceneViz.viewScaler, 'zoomLevel', 0.1, 2).name('Zoom Level').listen();
      rendererControls.add(window.APP.sceneViz, 'speedMultiplier', 0.1, 10).name('Simulation Speed').listen();

      // Additional simulation parameters added to the environment controls.
      envControls.add(window.APP.simulationEnv, 'vehicleCount')
        .min(0).max(200).step(1).name('Number of Vehicles').listen();
      envControls.add(window.APP.simulationEnv, 'currentSimSpeed')
        .step(0.00001).name('Instantaneous Speed').listen();

      // Global application settings control.
      debugPanel.add(appConfig, 'trafficLightCycle', 0, 50, 0.01).name('Traffic Light Interval').listen();

      // Add a reset button for convenience
      debugPanel.add({
        resetSimulation: () => {
          window.APP.simulationEnv.clear();
          window.APP.simulationEnv.generateMap();
          window.APP.simulationEnv.vehicleCount = 100;
          window.APP.sceneViz.viewScaler.zoomLevel = 1; // Reset zoom
          window.APP.sceneViz.speedMultiplier = 1; // Reset speed
          console.log("Simulation reset to default state.");
        }
      }, 'resetSimulation').name('Reset Simulation');

      // Optional: Add a general status display
      const statusObj = {
        get statusMessage() {
          return window.APP.sceneViz.isActive ? "Running" : "Paused";
        }
      };
      debugPanel.add(statusObj, 'statusMessage').name('Simulation Status').listen();

      console.log("Application initialization complete. GUI controls are active.");
    });


  }, {
    "./helpers": 6,
    "./model/world": 15,
    "./settings": 16,
    "./visualizer/visualizer": 24,
    "dat-gui": 27,
    "jquery": 31,
    "underscore": 32
  }],
  2: [function(getModule, currentModule, moduleExports) {
    'use strict';
    // This module defines a Bezier curve path, used for smooth road segments.

    const LineSegment = getModule('./segment');
    getModule('../shared_utilities'); // Ensure helper utilities are loaded.

    /**
     * Represents a cubic Bezier curve defined by four control points.
     * P(t) = (1-t)^3 * P0 + 3 * (1-t)^2 * t * P1 + 3 * (1-t) * t^2 * P2 + t^3 * P3
     */
    class BezierPath {
      /**
       * Initializes a new BezierPath instance.
       * @param {Vector2D} startPt - The starting point (P0).
       * @param {Vector2D} endPt - The ending point (P3).
       * @param {Vector2D} controlPt1 - The first control point (P1).
       * @param {Vector2D} controlPt2 - The second control point (P2).
       */
      constructor(startPt, endPt, controlPt1, controlPt2) {
        // Validate input points.
        if (!startPt || !endPt || !controlPt1 || !controlPt2) {
          throw new Error("BezierPath requires four valid Vector2D points for initialization.");
        }

        this.startPt = startPt;
        this.endPt = endPt;
        this.controlPt1 = controlPt1;
        this.controlPt2 = controlPt2;

        // Pre-calculate segments between control points for efficiency in `getPointAt` and `getTangentDirection`.
        // These represent the intermediate segments for de Casteljau's algorithm.
        this.segA_C1 = new LineSegment(this.startPt, this.controlPt1);
        this.segC1_C2 = new LineSegment(this.controlPt1, this.controlPt2);
        this.segC2_B = new LineSegment(this.controlPt2, this.endPt);

        this._cachedLength = null; // Cache for the calculated length of the curve.
        this.lengthCalculationPoints = 10; // Number of segments to approximate length.
      }

      /**
       * Gets the approximate length of the Bezier curve.
       * Calculated by summing the lengths of small line segments along the curve.
       * @returns {number} The approximate length of the curve.
       */
      get pathLength() {
        if (this._cachedLength === null) {
          let totalLength = 0;
          let previousPt = null;
          const numSteps = this.lengthCalculationPoints;

          // Iterate along the curve using a fixed number of steps to approximate its length.
          for (let idx = 0; idx <= numSteps; idx++) {
            const currentPt = this.getPointAt(idx / numSteps);
            if (previousPt) {
              totalLength += currentPt.difference(previousPt).magnitude;
            }
            previousPt = currentPt;
          }
          this._cachedLength = totalLength;
        }
        return this._cachedLength;
      }

      /**
       * Calculates a point on the Bezier curve at a given parameter `tParam`.
       * Uses de Casteljau's algorithm.
       * @param {number} tParam - The parameter along the curve (0 to 1).
       * @returns {Vector2D} The point on the curve.
       */
      getPointAt(tParam) {
        // Ensure tParam is within valid range.
        if (tParam < 0 || tParam > 1) {
          console.warn(`tParam (${tParam}) out of expected range [0, 1]. Clamping.`);
          tParam = Math.max(0, Math.min(1, tParam));
        }

        // First level of interpolation (between control points).
        const intermediatePt1 = this.segA_C1.getPointAtParam(tParam);
        const intermediatePt2 = this.segC1_C2.getPointAtParam(tParam);
        const intermediatePt3 = this.segC2_B.getPointAtParam(tParam);

        // Second level of interpolation.
        const finalIntermediatePt1 = (new LineSegment(intermediatePt1, intermediatePt2)).getPointAtParam(tParam);
        const finalIntermediatePt2 = (new LineSegment(intermediatePt2, intermediatePt3)).getPointAtParam(tParam);

        // Final interpolation to get the point on the curve.
        return (new LineSegment(finalIntermediatePt1, finalIntermediatePt2)).getPointAtParam(tParam);
      }

      /**
       * Calculates the tangent direction (angle) of the Bezier curve at a given parameter `tParam`.
       * The direction is derived from the vector of the final intermediate segment in de Casteljau's algorithm.
       * @param {number} tParam - The parameter along the curve (0 to 1).
       * @returns {number} The direction in radians.
       */
      getTangentDirection(tParam) {
        // Ensure tParam is within valid range.
        if (tParam < 0 || tParam > 1) {
          console.warn(`tParam (${tParam}) out of expected range [0, 1]. Clamping.`);
          tParam = Math.max(0, Math.min(1, tParam));
        }

        // First level of interpolation.
        const intermediatePt1 = this.segA_C1.getPointAtParam(tParam);
        const intermediatePt2 = this.segC1_C2.getPointAtParam(tParam);
        const intermediatePt3 = this.segC2_B.getPointAtParam(tParam);

        // Second level of interpolation.
        const finalIntermediatePt1 = (new LineSegment(intermediatePt1, intermediatePt2)).getPointAtParam(tParam);
        const finalIntermediatePt2 = (new LineSegment(intermediatePt2, intermediatePt3)).getPointAtParam(tParam);

        // The direction is the direction of the final segment.
        return (new LineSegment(finalIntermediatePt1, finalIntermediatePt2)).angularDirection;
      }
    }

    moduleExports = BezierPath;


  }, {
    "../shared_utilities": 6,
    "./segment": 5
  }],
  3: [function(getModule, currentModule, moduleExports) {
    'use strict';
    // This module defines a 2D vector class for geometric operations.

    const {
      sqrt,
      atan2
    } = Math; // Destructure Math methods for brevity.

    getModule('../shared_utilities'); // Ensure helper utilities are loaded.

    /**
     * Represents a 2D vector or point with x and y coordinates.
     */
    class Vector2D {
      /**
       * Creates a new Vector2D instance.
       * @param {number} [coordX=0] - The x-coordinate.
       * @param {number} [coordY=0] - The y-coordinate.
       */
      constructor(coordX = 0, coordY = 0) {
        this.coordX = coordX;
        this.coordY = coordY;
      }

      /**
       * Static factory method to create a Vector2D from given coordinates.
       * @param {number} x - The x-coordinate.
       * @param {number} y - The y-coordinate.
       * @returns {Vector2D} A new Vector2D instance.
       */
      static fromCoordinates(x, y) {
        return new Vector2D(x, y);
      }

      /**
       * Gets the magnitude (length) of the vector.
       * @returns {number} The magnitude.
       */
      get magnitude() {
        return sqrt(this.coordX * this.coordX + this.coordY * this.coordY);
      }

      /**
       * Gets the angle (direction) of the vector in radians, relative to the positive x-axis.
       * @returns {number} The angle in radians.
       */
      get angleRadians() {
        return atan2(this.coordY, this.coordX);
      }

      /**
       * Gets a new vector that is the normalized (unit) version of this vector.
       * @returns {Vector2D} A new unit vector.
       */
      get unitVector() {
        const currentMagnitude = this.magnitude;
        // Guard against division by zero for zero vectors.
        if (currentMagnitude === 0) {
          return new Vector2D(0, 0);
        }
        return new Vector2D(this.coordX / currentMagnitude, this.coordY / currentMagnitude);
      }

      /**
       * Adds another vector to this vector, returning a new Vector2D.
       * @param {Vector2D} otherVector - The vector to add.
       * @returns {Vector2D} A new vector representing the sum.
       */
      sum(otherVector) {
        return new Vector2D(this.coordX + otherVector.coordX, this.coordY + otherVector.coordY);
      }

      /**
       * Subtracts another vector from this vector, returning a new Vector2D.
       * @param {Vector2D} otherVector - The vector to subtract.
       * @returns {Vector2D} A new vector representing the difference.
       */
      difference(otherVector) {
        return new Vector2D(this.coordX - otherVector.coordX, this.coordY - otherVector.coordY);
      }

      /**
       * Multiplies this vector by a scalar, returning a new Vector2D.
       * @param {number} scalarValue - The scalar to multiply by.
       * @returns {Vector2D} A new scaled vector.
       */
      scale(scalarValue) {
        return new Vector2D(this.coordX * scalarValue, this.coordY * scalarValue);
      }

      /**
       * Divides this vector by a scalar, returning a new Vector2D.
       * Guards against division by zero.
       * @param {number} scalarValue - The scalar to divide by.
       * @returns {Vector2D} A new divided vector.
       */
      divideByScalar(scalarValue) {
        if (scalarValue === 0) {
          console.warn("Attempted to divide a vector by zero. Returning original vector.");
          return this.clone(); // Or throw an error, depending on desired behavior.
        }
        return new Vector2D(this.coordX / scalarValue, this.coordY / scalarValue);
      }

      /**
       * Creates a new Vector2D instance with the same coordinates as this one.
       * @returns {Vector2D} A new cloned vector.
       */
      clone() {
        return new Vector2D(this.coordX, this.coordY);
      }

      /**
       * Returns a string representation of the vector.
       * @returns {string} A string like "Vector2D(x, y)".
       */
      toString() {
        return `Vector2D(${this.coordX.toFixed(2)}, ${this.coordY.toFixed(2)})`;
      }
    }

    moduleExports = Vector2D;


  }, {
    "../shared_utilities": 6
  }],
  4: [function(getModule, currentModule, moduleExports) {
    'use strict';
    // This module defines a BoundingBox class for geometric collision detection and layout.

    const {
      abs
    } = Math;
    getModule('../shared_utilities'); // Ensure helper utilities are loaded.
    const lodashUtils = getModule('underscore'); // Using underscore for `extend` in `toSerializableObject`.

    const Vector2D = getModule('./point');
    const LineSegment = getModule('./segment');

    /**
     * Represents an axis-aligned bounding box defined by an origin point (top-left) and dimensions.
     */
    class BoundingBox {
      /**
       * Initializes a new BoundingBox instance.
       * @param {number} originX - The x-coordinate of the top-left corner.
       * @param {number} originY - The y-coordinate of the top-left corner.
       * @param {number} [boxWidth=0] - The width of the box. Must be non-negative.
       * @param {number} [boxHeight=0] - The height of the box. Must be non-negative.
       */
      constructor(originX, originY, boxWidth = 0, boxHeight = 0) {
        this.originX = originX;
        this.originY = originY;
        this._boxWidth = Math.max(0, boxWidth); // Ensure non-negative width.
        this._boxHeight = Math.max(0, boxHeight); // Ensure non-negative height.
      }

      /**
       * Static factory method to create a BoundingBox from another BoundingBox instance.
       * @param {BoundingBox} sourceBox - The box to clone.
       * @returns {BoundingBox} A new BoundingBox instance.
       */
      static cloneFrom(sourceBox) {
        if (!sourceBox || !(sourceBox instanceof BoundingBox)) {
          throw new Error("Invalid sourceBox provided for cloning.");
        }
        return new BoundingBox(sourceBox.originX, sourceBox.originY, sourceBox._boxWidth, sourceBox._boxHeight);
      }

      /**
       * Static factory method to create a BoundingBox from a center point and dimensions.
       * @param {Vector2D} center - The center point of the box.
       * @param {number} width - The width of the box.
       * @param {number} height - The height of the box.
       * @returns {BoundingBox} A new BoundingBox instance.
       */
      static fromCenterAndDimensions(center, width, height) {
        const originX = center.coordX - width / 2;
        const originY = center.coordY - height / 2;
        return new BoundingBox(originX, originY, width, height);
      }

      /**
       * Returns a plain object representation of the bounding box for serialization.
       * @returns {object} A serializable object.
       */
      toSerializableObject() {
        // Explicitly pick properties to avoid issues with getters/setters during serialization.
        return {
          originX: this.originX,
          originY: this.originY,
          _boxWidth: this._boxWidth,
          _boxHeight: this._boxHeight
        };
      }

      /**
       * Calculates the area of the bounding box.
       * @returns {number} The area.
       */
      calculateArea() {
        return this._boxWidth * this._boxHeight;
      }

      // --- Getters and Setters for box properties ---
      get left() {
        return this.originX;
      }
      set left(val) {
        this.originX = val;
      }

      get right() {
        return this.originX + this._boxWidth;
      }
      set right(val) {
        this.originX = val - this._boxWidth;
      }

      get top() {
        return this.originY;
      }
      set top(val) {
        this.originY = val;
      }

      get bottom() {
        return this.originY + this._boxHeight;
      }
      set bottom(val) {
        this.originY = val - this._boxHeight;
      }

      get boxWidth() {
        return this._boxWidth;
      }
      set boxWidth(val) {
        this._boxWidth = Math.max(0, val);
      }

      get boxHeight() {
        return this._boxHeight;
      }
      set boxHeight(val) {
        this._boxHeight = Math.max(0, val);
      }

      get center() {
        return new Vector2D(this.originX + this._boxWidth / 2, this.originY + this._boxHeight / 2);
      }
      set center(newCenter) {
        if (!newCenter || !(newCenter instanceof Vector2D)) {
          console.warn("Attempted to set center with invalid Vector2D. Operation skipped.");
          return;
        }
        this.originX = newCenter.coordX - this._boxWidth / 2;
        this.originY = newCenter.coordY - this._boxHeight / 2;
      }

      /**
       * Checks if a given point is contained within this bounding box.
       * @param {Vector2D} pointToCheck - The point to check.
       * @returns {boolean} True if the point is inside or on the boundary, false otherwise.
       */
      includesPoint(pointToCheck) {
        if (!pointToCheck || !(pointToCheck instanceof Vector2D)) {
          return false;
        }
        const isWithinX = pointToCheck.coordX >= this.left && pointToCheck.coordX <= this.right;
        const isWithinY = pointToCheck.coordY >= this.top && pointToCheck.coordY <= this.bottom;
        return isWithinX && isWithinY;
      }

      /**
       * Checks if another bounding box is entirely contained within this bounding box.
       * @param {BoundingBox} otherBox - The bounding box to check.
       * @returns {boolean} True if the other box is fully contained, false otherwise.
       */
      includesBox(otherBox) {
        if (!otherBox || !(otherBox instanceof BoundingBox)) {
          return false;
        }
        const isLeftContained = this.left <= otherBox.left;
        const isRightContained = otherBox.right <= this.right;
        const isTopContained = this.top <= otherBox.top;
        const isBottomContained = otherBox.bottom <= this.bottom;
        return isLeftContained && isRightContained && isTopContained && isBottomContained;
      }

      /**
       * Retrieves the four corner points of the bounding box in a specific order (top-left, top-right, bottom-right, bottom-left).
       * @returns {Vector2D[]} An array of Vector2D objects representing the corners.
       */
      retrieveCorners() {
        return [
          new Vector2D(this.left, this.top),
          new Vector2D(this.right, this.top),
          new Vector2D(this.right, this.bottom),
          new Vector2D(this.left, this.bottom)
        ];
      }

      /**
       * Gets one of the four edge segments of the bounding box.
       * @param {number} edgeIndex - The index of the edge (0: top, 1: right, 2: bottom, 3: left).
       * @returns {LineSegment} The requested edge as a LineSegment.
       * @throws {Error} If an invalid edgeIndex is provided.
       */
      getEdgeSegment(edgeIndex) {
        if (edgeIndex < 0 || edgeIndex > 3) {
          throw new Error(`Invalid edgeIndex: ${edgeIndex}. Must be between 0 and 3.`);
        }
        const cornerPoints = this.retrieveCorners();
        return new LineSegment(cornerPoints[edgeIndex], cornerPoints[(edgeIndex + 1) % 4]);
      }

      /**
       * Determines which of the four "sectors" (quadrants relative to center and aligned with axes)
       * a given point falls into.
       * Sector 0: Top (y <= 0, |x| <= |y|)
       * Sector 1: Right (x >= 0, |x| >= |y|)
       * Sector 2: Bottom (y >= 0, |x| <= |y|)
       * Sector 3: Left (x <= 0, |x| >= |y|)
       * @param {Vector2D} pointToCheck - The point to categorize.
       * @returns {number} The index of the sector (0-3).
       * @throws {Error} If the point is exactly at the center and cannot be categorized.
       */
      determineQuadrantIndex(pointToCheck) {
        const offsetFromCenter = pointToCheck.difference(this.center);

        if (offsetFromCenter.coordY <= 0 && abs(offsetFromCenter.coordX) <= abs(offsetFromCenter.coordY)) {
          return 0; // Top quadrant
        }
        if (offsetFromCenter.coordX >= 0 && abs(offsetFromCenter.coordX) >= abs(offsetFromCenter.coordY)) {
          return 1; // Right quadrant
        }
        if (offsetFromCenter.coordY >= 0 && abs(offsetFromCenter.coordX) <= abs(offsetFromCenter.coordY)) {
          return 2; // Bottom quadrant
        }
        if (offsetFromCenter.coordX <= 0 && abs(offsetFromCenter.coordX) >= abs(offsetFromCenter.coordY)) {
          return 3; // Left quadrant
        }
        // This case should ideally not be reached if point is not exactly at center
        throw new Error('BoundingBox quadrant determination algorithm error: point is likely exactly at center.');
      }

      /**
       * Gets the LineSegment corresponding to the quadrant the point falls into.
       * @param {Vector2D} pointToCheck - The point.
       * @returns {LineSegment} The edge segment of the corresponding quadrant.
       */
      getQuadrantEdge(pointToCheck) {
        const quadrantIdx = this.determineQuadrantIndex(pointToCheck);
        return this.getEdgeSegment(quadrantIdx);
      }

      /**
       * Returns a string representation of the bounding box.
       * @returns {string} A string like "BoundingBox(x,y,w,h)".
       */
      toString() {
        return `BoundingBox(${this.originX.toFixed(2)},${this.originY.toFixed(2)},${this._boxWidth.toFixed(2)},${this._boxHeight.toFixed(2)})`;
      }
    }

    moduleExports = BoundingBox;


  }, {
    "../shared_utilities": 6,
    "./point": 3,
    "./segment": 5,
    "underscore": 32
  }],
  5: [function(getModule, currentModule, moduleExports) {
    'use strict';
    // This module defines a LineSegment class for representing straight lines between two points.

    getModule('../shared_utilities'); // Ensure helper utilities are loaded.
    const Vector2D = getModule('./point');

    /**
     * Represents a straight line segment between a start point and an end point.
     */
    class LineSegment {
      /**
       * Creates a new LineSegment instance.
       * @param {Vector2D} startPoint - The starting point of the segment.
       * @param {Vector2D} endPoint - The ending point of the segment.
       */
      constructor(startPoint, endPoint) {
        if (!(startPoint instanceof Vector2D) || !(endPoint instanceof Vector2D)) {
          throw new Error("LineSegment constructor requires two Vector2D instances.");
        }
        this.startPoint = startPoint;
        this.endPoint = endPoint;
      }

      /**
       * Gets the vector representing the direction and magnitude from startPoint to endPoint.
       * @returns {Vector2D} The direction vector.
       */
      get directionVector() {
        return this.endPoint.difference(this.startPoint);
      }

      /**
       * Gets the length of the line segment.
       * @returns {number} The segment's length.
       */
      get segmentLength() {
        return this.directionVector.magnitude;
      }

      /**
       * Gets the angular direction of the line segment in radians.
       * @returns {number} The angle in radians.
       */
      get angularDirection() {
        return this.directionVector.angleRadians;
      }

      /**
       * Gets the midpoint of the line segment.
       * @returns {Vector2D} The midpoint.
       */
      get midPoint() {
        return this.getPointAtParam(0.5);
      }

      /**
       * Divides the line segment into multiple sub-segments.
       * @param {number} numDivisions - The number of equal sub-segments to create.
       * @param {boolean} [isReversedOrder=false] - If true, segments are returned in reverse order.
       * @returns {LineSegment[]} An array of new LineSegment instances.
       */
      subdivide(numDivisions, isReversedOrder = false) {
        if (numDivisions <= 0 || !Number.isInteger(numDivisions)) {
          throw new Error("numDivisions must be a positive integer.");
        }

        const indices = Array.from({
          length: numDivisions
        }, (_, i) => i);
        if (isReversedOrder) {
          indices.reverse();
        }

        return indices.map(divisionIdx => {
          const startParam = divisionIdx / numDivisions;
          const endParam = (divisionIdx + 1) / numDivisions;
          return this.extractSubSegment(startParam, endParam);
        });
      }

      /**
       * Calculates a point along the line segment at a given parameter `paramT`.
       * `paramT` = 0 corresponds to `startPoint`, `paramT` = 1 corresponds to `endPoint`.
       * @param {number} paramT - The parameter along the segment (typically 0 to 1).
       * @returns {Vector2D} The point on the segment.
       */
      getPointAtParam(paramT) {
        if (paramT < 0 || paramT > 1) {
          console.warn(`paramT (${paramT}) out of expected range [0, 1]. Clamping.`);
          paramT = Math.max(0, Math.min(1, paramT));
        }
        return this.startPoint.sum(this.directionVector.scale(paramT));
      }

      /**
       * Extracts a sub-segment from the current line segment.
       * @param {number} startParam - The starting parameter of the sub-segment (0 to 1).
       * @param {number} endParam - The ending parameter of the sub-segment (0 to 1).
       * @returns {LineSegment} A new LineSegment representing the sub-segment.
       */
      extractSubSegment(startParam, endParam) {
        if (startParam < 0 || startParam > 1 || endParam < 0 || endParam > 1 || startParam > endParam) {
          throw new Error(`Invalid parameters for extractSubSegment: startParam=${startParam}, endParam=${endParam}.`);
        }
        const subSegmentStart = this.getPointAtParam(startParam);
        const subSegmentEnd = this.getPointAtParam(endParam);
        return new LineSegment(subSegmentStart, subSegmentEnd);
      }

      /**
       * Creates a new LineSegment instance with the same start and end points.
       * @returns {LineSegment} A new cloned line segment.
       */
      clone() {
        return new LineSegment(this.startPoint.clone(), this.endPoint.clone());
      }

      /**
       * Returns a string representation of the line segment.
       * @returns {string} A string like "LineSegment(P1(x,y) -> P2(x,y))".
       */
      toString() {
        return `LineSegment(${this.startPoint.toString()} -> ${this.endPoint.toString()})`;
      }
    }

    moduleExports = LineSegment;


  }, {
    "../shared_utilities": 6,
    "./point": 3
  }],
  6: [function(getModule, currentModule, moduleExports) {
    'use strict';
    // This module provides general utility functions.

    moduleExports = {}; // Initialize exports object.

    // The original `Function.prototype.property` helper was specific to CoffeeScript's syntax
    // and is largely unnecessary with modern ES6 class `get` and `set` keywords.
    // For Type III, we'll remove it and rely on standard JavaScript features.
    // However, if we wanted to keep a similar helper for some meta-programming,
    // it would look different. For this clone, we assume ES6 classes are used natively.

    // Example of a new, simple helper: a utility for generating random IDs.
    // This could also come from a library like `lodash`, but we can implement a basic one.
    let _nextUniqueId = 0;
    moduleExports.generateUniqueId = function(prefix = 'id_') {
      return `${prefix}${_nextUniqueId++}`;
    };

    // Another simple helper: a clamp function.
    moduleExports.clamp = function(value, minVal, maxVal) {
      return Math.max(minVal, Math.min(value, maxVal));
    };

    // Placeholder for other global helpers if needed.
    console.log("Shared utilities module loaded.");

  }, {}],
  7: [function(getModule, currentModule, moduleExports) {
    'use strict';
    // This module defines the VehicleUnit class, representing a car in the simulation.

    const lodashUtils = getModule('underscore'); // Using underscore for unique IDs and other utilities.
    const PathTracker = getModule('./trajectory');
    getModule('../shared_utilities'); // Ensure helper utilities are loaded.

    // Constants for vehicle characteristics.
    const DEFAULT_VEHICLE_WIDTH = 1.7; // meters
    const MIN_VEHICLE_LENGTH = 3.0; // meters
    const MAX_VEHICLE_LENGTH = 5.0; // meters
    const DEFAULT_MAX_SPEED = 30; // m/s (approx 108 km/h)
    const DEFAULT_MIN_GAP_DISTANCE = 2; // meters (s0 in IDM)
    const DEFAULT_DESIRED_TIME_GAP = 1.5; // seconds (T in IDM)
    const DEFAULT_MAX_ACCELERATION = 1; // m/s^2 (a in IDM)
    const DEFAULT_MAX_DECELERATION = 3; // m/s^2 (b in IDM)
    const JUNCTION_STOP_LINE_SAFETY_OFFSET = 1; // meters

    // Turn direction codes (could be an enum or constants).
    const TURN_LEFT = 0;
    const TURN_STRAIGHT = 1;
    const TURN_RIGHT = 2;

    /**
     * Represents a single vehicle in the traffic simulation.
     * Implements the Intelligent Driver Model (IDM) for acceleration.
     */
    class VehicleUnit {
      /**
       * Initializes a new VehicleUnit.
       * @param {LaneSegment} initialLane - The lane segment the vehicle starts on.
       * @param {number} startPosition - The initial position on the lane (0 to 1).
       */
      constructor(initialLane, startPosition) {
        if (!initialLane || !PathTracker || typeof startPosition !== 'number') {
          throw new Error("VehicleUnit requires a valid initialLane and startPosition.");
        }

        this.uniqueIdentifier = lodashUtils.uniqueId('vehicle_');
        // Generate a random hue for visual differentiation.
        this.hueColor = (300 + 240 * Math.random() | 0) % 360;

        this._currentVelocity = 0; // Current speed in m/s.
        this.vehicleWidth = DEFAULT_VEHICLE_WIDTH;
        this.vehicleLength = MIN_VEHICLE_LENGTH + (MAX_VEHICLE_LENGTH - MIN_VEHICLE_LENGTH) * Math.random();

        // IDM parameters.
        this.maxPermittedSpeed = DEFAULT_MAX_SPEED;
        this.minGapDistance = DEFAULT_MIN_GAP_DISTANCE; // s0
        this.desiredTimeGap = DEFAULT_DESIRED_TIME_GAP; // T
        this.maxAccelRate = DEFAULT_MAX_ACCELERATION; // a
        this.maxDecelRate = DEFAULT_MAX_DECELERATION; // b

        this.movementPath = new PathTracker(this, initialLane, startPosition);
        this.isOperating = true; // Indicates if the vehicle is active in the simulation.
        this.designatedNextLane = null; // The lane chosen for the next turn.
      }

      /**
       * Gets the current coordinates (Vector2D) of the vehicle.
       * @returns {Vector2D} The vehicle's current position.
       */
      get currentCoordinates() {
        return this.movementPath.currentCoordinates;
      }

      /**
       * Gets or sets the current velocity of the vehicle.
       * Clamps the speed to be non-negative and not exceeding maxPermittedSpeed.
       * @returns {number} The current velocity.
       */
      get currentVelocity() {
        return this._currentVelocity;
      }
      set currentVelocity(speedValue) {
        this._currentVelocity = Math.max(0, Math.min(speedValue, this.maxPermittedSpeed));
      }

      /**
       * Gets the current heading angle (direction) of the vehicle in radians.
       * @returns {number} The heading angle.
       */
      get headingAngle() {
        return this.movementPath.headingAngle;
      }

      /**
       * Releases the vehicle from its current path, potentially removing it from the simulation.
       */
      deallocate() {
        this.movementPath.releaseVehicle();
        this.isOperating = false; // Mark as no longer operating.
      }

      /**
       * Calculates the acceleration of the vehicle using the Intelligent Driver Model (IDM).
       * Factors in free road driving, following another vehicle, and approaching an intersection.
       * @returns {number} The calculated acceleration (m/s^2).
       */
      calculateDrivingAcceleration() {
        const frontObstacleInfo = this.movementPath.frontVehicleInfo;
        // Distance to the car ahead, or a large number if no car.
        const frontVehicleProximity = Math.max(frontObstacleInfo.distance, 0);

        const currentAccelRate = this.maxAccelRate;
        const currentDecelRate = this.maxDecelRate;

        // Relative speed difference with the car ahead.
        const potentialFrontVehicleSpeed = (frontObstacleInfo.vehicle ? frontObstacleInfo.vehicle.currentVelocity : 0);
        const relativeSpeedDifference = this.currentVelocity - potentialFrontVehicleSpeed;

        // Term for free road driving (vehicle tries to reach max speed).
        const freeFlowResistance = Math.pow(this.currentVelocity / this.maxPermittedSpeed, 4);

        // Calculate components for the desired minimum following distance (s* in IDM).
        const staticGapTerm = this.minGapDistance;
        const dynamicGapTerm = this.currentVelocity * this.desiredTimeGap;
        const brakingDistanceTerm = (this.currentVelocity * relativeSpeedDifference) / (2 * Math.sqrt(currentAccelRate * currentDecelRate));
        const idealFollowingDistance = staticGapTerm + dynamicGapTerm + brakingDistanceTerm;

        // Term for busy road conditions (vehicle adjusts to avoid collision).
        const densityImpactFactor = Math.pow(idealFollowingDistance / frontVehicleProximity, 2);

        // Term for approaching a stop line at an intersection.
        const distanceToJunction = this.movementPath.distanceToJunctionStop;
        let junctionApproachPenalty = 0;
        if (distanceToJunction !== Infinity) {
          const safeJunctionClearance = JUNCTION_STOP_LINE_SAFETY_OFFSET + dynamicGapTerm + Math.pow(this.currentVelocity, 2) / (2 * currentDecelRate);
          junctionApproachPenalty = Math.pow(safeJunctionClearance / distanceToJunction, 2);
        }

        // Combine all factors to get the final acceleration factor.
        const finalAccelerationFactor = 1 - freeFlowResistance - densityImpactFactor - junctionApproachPenalty;

        // Apply the maximum acceleration rate to the factor.
        return currentAccelRate * finalAccelerationFactor;
      }

      /**
       * Updates the vehicle's position and state based on a time step.
       * @param {number} timeStep - The time elapsed since the last update (in seconds).
       */
      updateVehicleState(timeStep) {
        if (timeStep <= 0) {
          console.warn("Time step must be positive for vehicle state update.");
          return;
        }

        const calculatedAcceleration = this.calculateDrivingAcceleration();
        this.currentVelocity += calculatedAcceleration * timeStep; // Update speed.

        // Calculate distance traveled in this time step.
        const distanceTraveled = this.currentVelocity * timeStep + 0.5 * calculatedAcceleration * Math.pow(timeStep, 2);

        // Log a warning if the IDM logic results in an impossible move (e.g., passing through a car).
        // This is a sanity check, ideally the IDM should prevent this.
        if (this.movementPath.frontVehicleInfo.distance < distanceTraveled) {
          // console.warn(`Vehicle ${this.uniqueIdentifier}: IDM predicted collision or overlap! Distance: ${this.movementPath.frontVehicleInfo.distance.toFixed(2)}, Step: ${distanceTraveled.toFixed(2)}`);
          // A more robust system might force emergency braking or correction here.
        }

        // Handle lane changing logic.
        if (!this.movementPath.isPerformingLaneChange && this.designatedNextLane) {
          const activeLaneSegment = this.movementPath.currentSegment.lane;
          const turnDirectionCode = activeLaneSegment.determineTurnManeuver(this.designatedNextLane);

          let chosenLaneOption;
          switch (turnDirectionCode) {
            case TURN_LEFT:
              chosenLaneOption = activeLaneSegment.leftAdjacentSegment;
              break;
            case TURN_RIGHT:
              chosenLaneOption = activeLaneSegment.rightAdjacentSegment;
              break;
            case TURN_STRAIGHT:
            default:
              chosenLaneOption = activeLaneSegment; // Stay in current lane or no adjacent lane for this turn.
              break;
          }

          if (chosenLaneOption && chosenLaneOption !== activeLaneSegment) {
            this.movementPath.initiateLaneChange(chosenLaneOption);
          }
        }

        // Check if the vehicle needs to make a turn and if it can complete it.
        if (this.movementPath.canCompleteTurnInStep(distanceTraveled)) {
          if (this.designatedNextLane === null) {
            // If next lane is null, it means the vehicle has reached its destination or an invalid path end.
            console.log(`Vehicle ${this.uniqueIdentifier} reached end of path or invalid next lane. Deallocating.`);
            return this.deallocate();
          }
          // If a next lane is designated, the trajectory handler will take care of switching.
        }

        // Move the vehicle forward along its path.
        this.movementPath.advancePosition(distanceTraveled);
      }
    }

    moduleExports = VehicleUnit;


  }, {
    "../shared_utilities": 6,
    "./trajectory": 11,
    "underscore": 32
  }]
});