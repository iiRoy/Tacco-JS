var examples = {}; /* Initialize examples object */
var paperjs = {}; /* Initialize paperjs object */
var plugins = {}; /* Initialize plugins object */
var svg = {}; /* Initialize svg object */
var util = {}; /* Initialize util object */
var verlet = {}; /* Initialize verlet object */


// This section defines the VerletStick class.
// It is responsible for maintaining the distance between two points in a Verlet integration system.
//
// There are three distinct states for a stick connection:
// 1.  Free-floating: Both connected points are dynamic and respond to constraints.
// 2.  One point is locked: The free point responds to the constraint imposed by the locked point.
// 3.  Both points are locked: Neither point moves, and the stick effectively does nothing.
//
// TODO: Consider refactoring the `contract` function to avoid code duplication
//       between the 'point A locked' and 'point B locked' scenarios.

var BaseScene, RAD_2_DEG, improvedNoise, lastUpdate; // Declare core variables for the scene.

var __bind = function(fn, me) {
  return function() {
    return fn.apply(me, arguments);
  };
}; /* Helper function for binding context */

var __hasProp = {}.hasOwnProperty; /* Shortcut for hasOwnProperty check */

var __extends = function(child, parent) {
  for (var key in parent) {
    if (__hasProp.call(parent, key)) child[key] = parent[key];
  }

  function ctor() {
    this.constructor = child;
  }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  return child;
}; /* Helper function for class inheritance */


verlet.Stick = (function() {

  function Stick(a, b) {
    var dx, dy,
      _this = this; // Capture 'this' for use in nested functions.

    this.pointa = a; // Assign point 'a'
    this.pointb = b; // Assign point 'b'

    this.torn = false; // Flag indicating if the stick has torn
    this.tearResist = 9999; // Resistance threshold before tearing

    dx = a.x - b.x; // Calculate difference in X coordinates
    dy = a.y - b.y; // Calculate difference in Y coordinates

    this.hypotenuse = Math.sqrt(dx * dx + dy * dy); // Store initial length (hypotenuse)

    // Determine the contraction behavior based on locked points.
    if (this.pointa.locked && this.pointb.locked) {
      // Both points locked: no contraction needed.
      this.contract = function() {
        return null; // Do nothing.
      };
    } else if (this.pointa.locked) {
      // Point A is locked, Point B moves.
      this.contract = function() {
        var diff, h, offx, offy; // Declare local variables

        dx = _this.pointb.x - _this.pointa.x; // Recalculate dx
        dy = _this.pointb.y - _this.pointa.y; // Recalculate dy

        h = Math.sqrt(dx * dx + dy * dy); // Current distance

        if (h > _this.tearResist) {
          _this.torn = true; // Mark as torn if stretched too far
        }

        diff = _this.hypotenuse - h; // Difference from original length
        offx = diff * dx / h; // X offset to correct length
        offy = diff * dy / h; // Y offset to correct length

        _this.pointb.x += offx; // Adjust point B's X position
        _this.pointb.y += offy; // Adjust point B's Y position

        return null;
      };
    } else if (this.pointb.locked) {
      // Point B is locked, Point A moves.
      this.contract = function() {
        var diff, h, offx, offy; // Declare local variables

        dx = _this.pointb.x - _this.pointa.x; // Recalculate dx
        dy = _this.pointb.y - _this.pointa.y; // Recalculate dy

        h = Math.sqrt(dx * dx + dy * dy); // Current distance

        if (h > _this.tearResist) {
          _this.torn = true; // Mark as torn
        }

        diff = _this.hypotenuse - h; // Difference from original length
        offx = diff * dx / h; // X offset
        offy = diff * dy / h; // Y offset

        _this.pointa.x -= offx; // Adjust point A's X position (opposite direction)
        _this.pointa.y -= offy; // Adjust point A's Y position (opposite direction)

        return null;
      };
    } else {
      // Neither point is locked: both points move.
      this.contract = function() {
        var diff, h, offx, offy; // Declare local variables

        dx = _this.pointb.x - _this.pointa.x; // Recalculate dx
        dy = _this.pointb.y - _this.pointa.y; // Recalculate dy

        h = Math.sqrt(dx * dx + dy * dy); // Current distance

        if (h > _this.tearResist) {
          _this.torn = true; // Mark as torn
        }

        diff = _this.hypotenuse - h; // Difference from original length
        offx = (diff * dx / h) * .5; // Half X offset for each point
        offy = (diff * dy / h) * .5; // Half Y offset for each point

        _this.pointa.x -= offx; // Adjust point A
        _this.pointa.y -= offy;

        _this.pointb.x += offx; // Adjust point B
        _this.pointb.y += offy;

        return null;
      };
    }
  }

  return Stick; // Return the Stick constructor.

})();


// Improved Noise: A fast pseudo-random noise generator.
// This implementation is based on the famous Perlin noise algorithm.
// Source: http://mrl.nyu.edu/~perlin/noise/
// Provides smooth, natural-looking random values.


util.ImprovedNoise = (function() {
  var fade, grad, i, lerp, p; // Declare internal variables.

  function ImprovedNoise() {} // Constructor for ImprovedNoise, currently empty.

  fade = function(t) {
    // Smoothing curve for interpolation.
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  lerp = function(t, a, b) {
    // Linear interpolation function.
    return a + t * (b - a);
  };

  grad = function(hash, x, y, z) {
    // Calculates gradient vector dot product.
    var h, u, v;

    h = hash & 15; // Get the last 4 bits of the hash.
    u = (h < 8 ? x : y); // Determine 'u' component.
    v = (h < 4 ? y : (h === 12 || h === 14 ? x : z)); // Determine 'v' component.

    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v); // Return dot product.
  };

  // Permutation array 'p' for noise generation.
  // This array is 256 elements long and essentially maps input coordinates to a random gradient.
  p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

  i = 0; // Initialize loop counter.

  while (i < 256) {
    p[256 + i] = p[i]; // Duplicate the permutation array for wrapping.
    i++; // Increment counter.
  }

  ImprovedNoise.prototype.noise = function(x, y, z) {
    var A, AA, AB, B, BA, BB, X, Y, Z, floorX, floorY, floorZ, u, v, w, xMinus1, yMinus1, zMinus1; // Declare all local variables.

    floorX = ~~x; // Floor x to integer.
    floorY = ~~y; // Floor y to integer.
    floorZ = ~~z; // Floor z to integer.

    X = floorX & 255; // Get lowest 8 bits for array indexing.
    Y = floorY & 255;
    Z = floorZ & 255;

    x -= floorX; // Get fractional part of x.
    y -= floorY; // Get fractional part of y.
    z -= floorZ; // Get fractional part of z.

    xMinus1 = x - 1; // Pre-calculate x-1.
    yMinus1 = y - 1; // Pre-calculate y-1.
    zMinus1 = z - 1; // Pre-calculate z-1.

    u = fade(x); // Apply fade function to fractional parts.
    v = fade(y);
    w = fade(z);

    A = p[X] + Y; // Compute indices into permutation table.
    AA = p[A] + Z;
    AB = p[A + 1] + Z;

    B = p[X + 1] + Y;
    BA = p[B] + Z;
    BB = p[B + 1] + Z;

    // Perform trilinear interpolation of gradients.
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], xMinus1, y, z)), lerp(u, grad(p[AB], x, yMinus1, z), grad(p[BB], xMinus1, yMinus1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, zMinus1), grad(p[BA + 1], xMinus1, y, z - 1)), lerp(u, grad(p[AB + 1], x, yMinus1, zMinus1), grad(p[BB + 1], xMinus1, yMinus1, zMinus1))));
  };

  return ImprovedNoise; // Return the ImprovedNoise constructor.

})();

improvedNoise = new util.ImprovedNoise(); // Create a global instance of ImprovedNoise.


// BaseScene: This is the foundational class that other scene types (like SvgScene and PaperScene)
// will extend. It provides common functionality for managing physics simulations,
// including points, sticks, and plugins.

BaseScene = (function() {

  BaseScene.prototype.isLoaded = false; // Flag to check if the scene data is loaded.

  BaseScene.prototype.isPlaying = false; // Flag to control the simulation loop.

  BaseScene.prototype.dom = null; // Reference to the main DOM element.

  BaseScene.prototype.options = { // Default configuration options for the scene.
    container: "#container", // Selector for the container element.
    verticalAlign: "center", // Vertical alignment of the scene content.
    horizontalAlign: "center", // Horizontal alignment of the scene content.
    callback: null, // Callback function to execute after loading.
    file: null, // Path to the scene file (e.g., SVG).
    parseColors: { // Specific colors used for parsing elements.
      lock: "#FF0000", // Color indicating a locked point.
      link: "#FF0000" // Color indicating a link/stick.
    }
  };

  BaseScene.prototype.snapDist = 1.0; // Distance threshold for snapping points together.

  BaseScene.prototype.lastFrameTime = 0.0; // Timestamp of the last animation frame.

  BaseScene.currentTimeStep = 0.0; // Time elapsed since the last update.

  function BaseScene(options) {
    // Bind all necessary methods to the instance context.
    this.addStatic = __bind(this.addStatic, this);
    this.addElementPoint = __bind(this.addElementPoint, this);
    this.addLock = __bind(this.addLock, this);
    this.update = __bind(this.update, this);
    this.play = __bind(this.play, this);
    this.unload = __bind(this.unload, this);
    this.pause = __bind(this.pause, this);

    BaseScene.currentTimeStep = 0.0; // Reset static time step.

    // Apply default options or override with provided options.
    this.options.container = "#container";
    this.options.verticalAlign = "center";
    this.options.horizontalAlign = "center";

    this.offsetY = 0; // Vertical offset for scene positioning.
    this.offsetX = 0; // Horizontal offset for scene positioning.

    this.currentTimeStep = 0; // Instance-specific time step (redundant with static?).

    // Initialize arrays to hold simulation elements.
    this.points = []; // All individual points in the simulation.
    this.sticks = []; // All sticks (constraints) between points.
    this.stickLinks = []; // Additional links related to sticks.
    this.elementPoints = []; // Points associated with specific SVG elements.
    this.statics = []; // Static elements that don't move.
    this.updates = []; // Elements that need custom update logic.
    this.plugins = []; // Registered plugins for extended functionality.

    this.quadTree = new util.QuadTree(); // Spatial partitioning for efficient point lookup.

    this.isPlaying = true; // Start simulation in playing state.

    return this; // Return the instance.
  }

  BaseScene.prototype.pause = function() {
    return this.isPlaying = false; // Stop the simulation loop.
  };

  BaseScene.prototype.unload = function() {
    var p, _i, _len, _ref; // Declare local variables.

    this.isPlaying = false; // Ensure simulation is stopped.

    _ref = this.plugins; // Get all active plugins.
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      p.unload(); // Call unload method on each plugin.
    }

    // Clear all simulation element arrays.
    this.points = [];
    this.sticks = [];
    this.stickLinks = [];
    this.elementPoints = [];
    this.statics = [];
    this.updates = [];
    this.plugins = [];
  };

  BaseScene.prototype.play = function() {
    var p, _i, _len, _ref; // Declare local variables.

    if (this.isPlaying) {
      return; // If already playing, do nothing.
    }

    this.isPlaying = true; // Set playing flag to true.
    this.lastFrameTime = new Date().getTime(); // Record current time for frame calculation.

    _ref = this.points; // Iterate over all points.
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      p.forceX = 0; // Reset forces on all points.
      p.forceY = 0;
    }

    if (this.isLoaded) {
      return this.update(); // If loaded, start the update loop immediately.
    }
  };

  BaseScene.prototype.onLoaded = function() {
    return this.isLoaded = true; // Set loaded flag to true.
  };

  BaseScene.prototype.onInit = function() {
    var e, _i, _len, _ref; // Declare local variables.

    this.lastFrameTime = new Date().getTime(); // Record initial time.

    _ref = this.plugins; // Iterate over all plugins.
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      e.init(this); // Initialize each plugin with a reference to this scene.
    }

    this.quadTree.clear(); // Clear any existing quadtree data.
    this.update(); // Start the main update loop.
  };

  BaseScene.prototype.update = function() {
    var currentTime, e, p, s, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4; // Declare many local variables.

    currentTime = new Date().getTime(); // Get current timestamp.
    // Calculate time step, cap it to prevent large jumps after lag.
    BaseScene.currentTimeStep = Math.min(currentTime - this.lastFrameTime, 20);
    this.lastFrameTime = currentTime; // Update last frame time.

    _ref = this.plugins; // Update plugins.
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      e.update();
    }

    _ref1 = this.points; // Update all points.
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      p = _ref1[_j];
      p.update();
    }

    _ref2 = this.sticks; // Contract all sticks (apply constraints).
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      s = _ref2[_k];
      s.contract();
    }

    _ref3 = this.elementPoints; // Update element points.
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      p = _ref3[_l];
      p.update();
    }

    _ref4 = this.stickLinks; // Update stick links.
    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
      s = _ref4[_m];
      s.update();
    }

    if (this.isPlaying) {
      // Request next animation frame if simulation is active.
      window.requestAnimFrame(this.update, null);
    }
  };

  BaseScene.tick = 0; // A static counter for ticks (unused in this snippet).

  BaseScene.prototype.addPoint = function(x, y, kind) {
    var foundPoints, p, search; // Declare local variables.

    if (kind == null) {
      kind = null; // Default kind to null if not provided.
    }

    x = parseFloat(x); // Ensure x is a float.
    y = parseFloat(y); // Ensure y is a float.

    search = { // Define a search rectangle for the quadtree.
      x: x - this.snapDist / 2,
      y: y - this.snapDist / 2,
      width: this.snapDist,
      height: this.snapDist
    };

    foundPoints = this.quadTree.find(search); // Search for existing points nearby.

    if (foundPoints.length > 0) {
      p = foundPoints[0].point; // If found, use the existing point.
    } else {
      p = this.createPoint(x, y, kind); // Otherwise, create a new point.
      this.quadTree.insert({ // Insert the new point into the quadtree.
        x: x,
        y: y,
        point: p
      });
      this.points.push(p); // Add the new point to the scene's points array.
    }

    return p; // Return the point.
  };

  BaseScene.prototype.createPoint = function(x, y, kind) {
    var p; // Declare point variable.

    switch (kind) { // Create different point types based on 'kind'.
      case "rubber":
        p = new verlet.RubberPoint(x, y); // Create a RubberPoint.
        break;
      default:
        p = new verlet.Point(x, y); // Create a generic Point.
    }
    return p; // Return the newly created point.
  };

  BaseScene.prototype.addLock = function(c, x, y) {
    var p; // Declare point variable.

    p = this.addPoint(x, y); // Add a point at the specified coordinates.
    return p.locked = true; // Lock the point and return the locked status.
  };

  BaseScene.prototype.addElementPoint = function(svgPoint, ab, x, y) {
    // This method is likely intended to be implemented by derived classes.
    // Currently, it does nothing in the base class.
  };

  BaseScene.prototype.addStatic = function(c) {
    return this.statics.push(c); // Add a static element to the statics array.
  };

  BaseScene.prototype.addPlugin = function(e) {
    return this.plugins.push(e); // Add a plugin to the plugins array.
  };

  BaseScene.prototype.isMobile = function() {
    // Check if the user agent string matches common mobile device patterns.
    return navigator.userAgent.match(/Android/) || navigator.userAgent.match(/iPhone/) || navigator.userAgent.match(/iPod/) || navigator.userAgent.match(/iPad/);
  };

  return BaseScene; // Return the BaseScene constructor.

})();

// requestAnimFrame: Cross-browser compatible way to request animation frames.
// This utility function ensures smooth animations by synchronizing with the browser's refresh rate.
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      return window.setTimeout(callback, 1000 / 60); // Fallback to setTimeout for 60 FPS.
    };
})();


// SvgScene: This class extends BaseScene and is specifically designed for parsing
// and setting up Verlet physics simulations from SVG files.
//
// TODO:
// 1. Refactor the file parsing mechanism for better organization and efficiency.
//    Current grouping and object handling can be cumbersome.
// 2. Eliminate jQuery dependency: The core logic doesn't strictly require jQuery;
//    it was initially used for convenience.

svg.Scene = (function(_super) {

  __extends(Scene, _super); // Inherit from BaseScene.

  Scene.prototype.isLoaded = false; // Override/re-declare isLoaded flag.

  Scene.prototype.offsetX = 0; // Override/re-declare horizontal offset.

  Scene.prototype.offsetY = 0; // Override/re-declare vertical offset.

  Scene.prototype.onLoadCallback = null; // Callback specific to SVG scene loading.

  function Scene(options) {
    // Bind all necessary methods to the instance context.
    this.addSvgStick = __bind(this.addSvgStick, this);
    this.addPolyStick = __bind(this.addPolyStick, this);
    this.addPathStick = __bind(this.addPathStick, this);
    this.addHiddenStick = __bind(this.addHiddenStick, this);
    this.addElementPoint = __bind(this.addElementPoint, this);
    this.addLink = __bind(this.addLink, this);
    this.parseGroup = __bind(this.parseGroup, this);
    this.parseByColors = __bind(this.parseByColors, this);
    this.parseByGroups = __bind(this.parseByGroups, this);
    this.onLoaded = __bind(this.onLoaded, this);

    Scene.__super__.constructor.call(this, options); // Call the parent constructor.

    util.General.copyObject(options, this.options); // Merge provided options with defaults.

    if (this.options.callback != null) {
      this.onLoadCallback = options.callback; // Assign custom callback if present.
    }

    this.container = $(this.options.container); // Get the container element using jQuery.

    if (this.options.file) {
      // Load SVG file if specified.
      this.container.load(this.options.file, this.onLoaded);
    } else {
      // If no file, trigger onLoaded asynchronously.
      setTimeout(this.onLoaded, 1);
    }

    // Small timeout to scroll page to top (common mobile browser behavior).
    setTimeout(function() {
      return window.scrollTo(0, 1);
    }, 0);
  }

  Scene.prototype.onLoaded = function() {
    Scene.__super__.onLoaded.call(this); // Call parent's onLoaded method.

    this.dom = this.svg = this.container.find("svg")[0]; // Find the SVG element within the container.

    // Dispatch custom events for file loading status.
    this.dom.dispatchEvent(new Event("OnSceneFileLoaded", {
      bubbles: true,
      cancelable: true
    }));

    $(this.dom).hide(); // Hide SVG initially.
    $(this.dom).fadeIn(); // Fade in SVG for a smooth appearance.

    this.parseByGroups(); // Begin parsing SVG elements by groups.

    // Align the scene content based on options.
    this.verticalAlign(this.options.verticalAlign);
    this.horizontalAlign(this.options.horizontalAlign);

    // Dispatch another event indicating scene is fully loaded.
    this.dom.dispatchEvent(new Event("onSceneLoaded", {
      bubbles: true,
      cancelable: true
    }));

    if (typeof this.onLoadCallback === "function") {
      this.onLoadCallback(); // Execute custom callback if it's a function.
    }

    return this.onInit(); // Initialize the scene.
  };

  Scene.prototype.verticalAlign = function(place) {
    switch (place) {
      case "center":
        this.offsetY += $(this.svg).height() * -0.5; // Center vertically.
        break;
      case "top":
        this.offsetY = 0; // Align to top.
    }
    return this.updateFrameOffset(); // Update the visual offset.
  };

  Scene.prototype.horizontalAlign = function(place) {
    switch (place) {
      case "center":
        this.offsetX += $(this.svg).width() * -0.5; // Center horizontally.
        break;
      case "left":
        this.offsetX = 0; // Align to left.
    }
    return this.updateFrameOffset(); // Update the visual offset.
  };

  Scene.prototype.updateFrameOffset = function() {
    // This method is likely intended to contain logic for applying offsetX/offsetY
    // to the visual representation of the scene, but the body is not provided.
    // It would typically involve transforming the SVG element itself.
  };