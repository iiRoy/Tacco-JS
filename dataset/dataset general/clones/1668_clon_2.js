var samples = {};
var canvasLib = {};
var extensions = {};
var graphic = {};
var helpers = {};
var physics = {};

/*
	PhysicsRod: Manages the fixed distance between two particles.

	Possible conditions for a rod:
	1) Unrestricted movement: Both particles adjust to maintain length.
	2) One end fixed: The free particle adjusts based on the fixed end.
	3) Both ends fixed: No adjustment occurs.

	NOTE: Consider refactoring the similar logic for single-locked particles.
*/

var CoreStage, RADIANS_TO_DEGREES_FACTOR, perlinNoiseGenerator, previousFrameTime,
  _closureBinder = function(func, ctx){ return function(){ return func.apply(ctx, arguments); }; },
  _propertyChecker = {}.hasOwnProperty,
  _prototypeExtender = function(childClass, parentClass) { for (var propKey in parentClass) { if (_propertyChecker.call(parentClass, propKey)) childClass[propKey] = parentClass[propKey]; } function tempCtor() { this.constructor = childClass; } tempCtor.prototype = parentClass.prototype; childClass.prototype = new tempCtor(); childClass.__super__ = parentClass.prototype; return childClass; };

physics.Rod = (function() {

  function Rod(nodeA, nodeB) {
    var diffX, diffY,
      selfRef = this;
    this.particleA = nodeA;
    this.particleB = nodeB;
    this.broken = false;
    this.breakThreshold = 8888;
    diffX = nodeA.x - nodeB.x;
    diffY = nodeA.y - nodeB.y;
    this.initialLength = Math.sqrt(diffX * diffX + diffY * diffY);
    if (this.particleA.fixed && this.particleB.fixed) {
      this.applyCorrection = function() {
        return null;
      };
    } else if (this.particleA.fixed) {
      this.applyCorrection = function() {
        var delta, currentDist, offsetVecX, offsetVecY;
        diffX = selfRef.particleB.x - selfRef.particleA.x;
        diffY = selfRef.particleB.y - selfRef.particleA.y;
        currentDist = Math.sqrt(diffX * diffX + diffY * diffY);
        if (currentDist > selfRef.breakThreshold) {
          selfRef.broken = true;
        }
        delta = selfRef.initialLength - currentDist;
        offsetVecX = delta * diffX / currentDist;
        offsetVecY = delta * diffY / currentDist;
        selfRef.particleB.x += offsetVecX;
        selfRef.particleB.y += offsetVecY;
        return null;
      };
    } else if (this.particleB.fixed) {
      this.applyCorrection = function() {
        var delta, currentDist, offsetVecX, offsetVecY;
        diffX = selfRef.particleB.x - selfRef.particleA.x;
        diffY = selfRef.particleB.y - selfRef.particleA.y;
        currentDist = Math.sqrt(diffX * diffX + diffY * diffY);
        if (currentDist > selfRef.breakThreshold) {
          selfRef.broken = true;
        }
        delta = selfRef.initialLength - currentDist;
        offsetVecX = delta * diffX / currentDist;
        offsetVecY = delta * diffY / currentDist;
        selfRef.particleA.x -= offsetVecX;
        selfRef.particleA.y -= offsetVecY;
        return null;
      };
    } else {
      this.applyCorrection = function() {
        var delta, currentDist, offsetVecX, offsetVecY;
        diffX = selfRef.particleB.x - selfRef.particleA.x;
        diffY = selfRef.particleB.y - selfRef.particleA.y;
        currentDist = Math.sqrt(diffX * diffX + diffY * diffY);
        if (currentDist > selfRef.breakThreshold) {
          selfRef.broken = true;
        }
        delta = selfRef.initialLength - currentDist;
        offsetVecX = (delta * diffX / currentDist) * 0.5;
        offsetVecY = (delta * diffY / currentDist) * 0.5;
        selfRef.particleA.x -= offsetVecX;
        selfRef.particleA.y -= offsetVecY;
        selfRef.particleB.x += offsetVecX;
        selfRef.particleB.y += offsetVecY;
        return null;
      };
    }
  }

  return Rod;

})();

/*
	Perlin Noise: A quick procedural noise algorithm.

	Origin: Based on Ken Perlin's noise function.
*/


helpers.PerlinGenerator = (function() {
  var smoothStep, gradientVector, counter, linearInterpolation, permutationTable;

  function PerlinGenerator() {}

  smoothStep = function(tval) {
    return tval * tval * tval * (tval * (tval * 6 - 15) + 10);
  };

  linearInterpolation = function(tval, valA, valB) {
    return valA + tval * (valB - valA);
  };

  gradientVector = function(hashVal, xval, yval, zval) {
    var hval, uval, vval;
    hval = hashVal & 15;
    uval = (hval < 8 ? xval : yval);
    vval = (hval < 4 ? yval : (hval === 12 || hval === 14 ? xval : zval));
    return ((hval & 1) === 0 ? uval : -uval) + ((hval & 2) === 0 ? vval : -vval);
  };

  permutationTable = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

  counter = 0;

  while (counter < 256) {
    permutationTable[256 + counter] = permutationTable[counter];
    counter++;
  }

  PerlinGenerator.prototype.generateNoise = function(fracX, fracY, fracZ) {
    var idxA, idxAA, idxAB, idxB, idxBA, idxBB, coordX, coordY, coordZ, intX, intY, intZ, u_fade, v_fade, w_fade, fracX_minus1, fracY_minus1, fracZ_minus1;
    intX = ~~fracX;
    intY = ~~fracY;
    intZ = ~~fracZ;
    coordX = intX & 255;
    coordY = intY & 255;
    coordZ = intZ & 255;
    fracX -= intX;
    fracY -= intY;
    fracZ -= intZ;
    fracX_minus1 = fracX - 1;
    fracY_minus1 = fracY - 1;
    fracZ_minus1 = fracZ - 1;
    u_fade = smoothStep(fracX);
    v_fade = smoothStep(fracY);
    w_fade = smoothStep(fracZ);
    idxA = permutationTable[coordX] + coordY;
    idxAA = permutationTable[idxA] + coordZ;
    idxAB = permutationTable[idxA + 1] + coordZ;
    idxB = permutationTable[coordX + 1] + coordY;
    idxBA = permutationTable[idxB] + coordZ;
    idxBB = permutationTable[idxB + 1] + coordZ;
    return linearInterpolation(w_fade, linearInterpolation(v_fade, linearInterpolation(u_fade, gradientVector(permutationTable[idxAA], fracX, fracY, fracZ), gradientVector(permutationTable[idxBA], fracX_minus1, fracY, fracZ)), linearInterpolation(u_fade, gradientVector(permutationTable[idxAB], fracX, fracY_minus1, fracZ), gradientVector(permutationTable[idxBB], fracX_minus1, fracY_minus1, fracZ))), linearInterpolation(v_fade, linearInterpolation(u_fade, gradientVector(permutationTable[idxAA + 1], fracX, fracY, fracZ_minus1), gradientVector(permutationTable[idxBA + 1], fracX_minus1, fracY, fracZ - 1)), linearInterpolation(u_fade, gradientVector(permutationTable[idxAB + 1], fracX, fracY_minus1, fracZ_minus1), gradientVector(permutationTable[idxBB + 1], fracX_minus1, fracY_minus1, fracZ_minus1))));
  };

  return PerlinGenerator;

})();

perlinNoiseGenerator = new helpers.PerlinGenerator();

/*
	CoreStage: Abstract class for scene management, extended by GraphicScene and CanvasScene.
*/


CoreStage = (function() {

  CoreStage.prototype.contentReady = false;

  CoreStage.prototype.animationActive = false;

  CoreStage.prototype.rootElement = null;

  CoreStage.prototype.configuration = {
    viewportSelector: "#mainViewport",
    alignY: "middle",
    alignX: "middle",
    completionHandler: null,
    sourcePath: null,
    styleMap: {
      fixed: "#E00000",
      joint: "#E00000"
    }
  };

  CoreStage.prototype.snapTolerance = 0.9;

  CoreStage.prototype.lastRenderTime = 0.0;

  CoreStage.currentDeltaTime = 0.0;

  function CoreStage(settings) {
    this.registerFixedObject = _closureBinder(this.registerFixedObject, this);

    this.addGraphicParticle = _closureBinder(this.addGraphicParticle, this);

    this.addFixedPoint = _closureBinder(this.addFixedPoint, this);

    this.advanceFrame = _closureBinder(this.advanceFrame, this);

    this.startAnimation = _closureBinder(this.startAnimation, this);

    this.resetStage = _closureBinder(this.resetStage, this);

    this.pauseAnimation = _closureBinder(this.pauseAnimation, this);
    CoreStage.currentDeltaTime = 0.0;
    this.configuration.viewportSelector = "#mainViewport";
    this.configuration.alignY = "middle";
    this.configuration.alignX = "middle";
    this.verticalOffset = 0;
    this.horizontalOffset = 0;
    this.currentDeltaTime = 0;
    this.particles = [];
    this.constraints = [];
    this.connectionLines = [];
    this.graphicParticles = [];
    this.fixedObjects = [];
    this.updateQueue = [];
    this.extensions = [];
    this.spatialPartition = new helpers.QuadTree();
    this.animationActive = true;
    return this;
  }

  CoreStage.prototype.pauseAnimation = function() {
    return this.animationActive = false;
  };

  CoreStage.prototype.resetStage = function() {
    var extensionItem, _i, _len, _ref;
    this.animationActive = false;
    _ref = this.extensions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      extensionItem = _ref[_i];
      extensionItem.unload();
    }
    this.particles = [];
    this.constraints = [];
    this.connectionLines = [];
    this.graphicParticles = [];
    this.fixedObjects = [];
    this.updateQueue = [];
    this.extensions = [];
  };

  CoreStage.prototype.startAnimation = function() {
    var particleItem, _i, _len, _ref;
    if (this.animationActive) {
      return;
    }
    this.animationActive = true;
    this.lastRenderTime = new Date().getTime();
    _ref = this.particles;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particleItem = _ref[_i];
      particleItem.forceX = 0;
      particleItem.forceY = 0;
    }
    if (this.contentReady) {
      return this.advanceFrame();
    }
  };

  CoreStage.prototype.onContentReady = function() {
    return this.contentReady = true;
  };

  CoreStage.prototype.initializeStage = function() {
    var extensionItem, _i, _len, _ref;
    this.lastRenderTime = new Date().getTime();
    _ref = this.extensions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      extensionItem = _ref[_i];
      extensionItem.init(this);
    }
    this.spatialPartition.clear();
    this.advanceFrame();
  };

  CoreStage.prototype.advanceFrame = function() {
    var currentSystemTime, extensionItem, particleItem, constraintItem, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    currentSystemTime = new Date().getTime();
    CoreStage.currentDeltaTime = Math.min(currentSystemTime - this.lastRenderTime, 20);
    this.lastRenderTime = currentSystemTime;
    _ref = this.extensions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      extensionItem = _ref[_i];
      extensionItem.update();
    }
    _ref1 = this.particles;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      particleItem = _ref1[_j];
      particleItem.update();
    }
    _ref2 = this.constraints;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      constraintItem = _ref2[_k];
      constraintItem.applyCorrection();
    }
    _ref3 = this.graphicParticles;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      particleItem = _ref3[_l];
      particleItem.update();
    }
    _ref4 = this.connectionLines;
    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
      constraintItem = _ref4[_m];
      constraintItem.update();
    }
    if (this.animationActive) {
      window.requestNextFrame(this.advanceFrame, null);
    }
  };

  CoreStage.tick = 0;

  CoreStage.prototype.addParticle = function(coordX, coordY, particleType) {
    var nearbyParticles, particleItem, searchArea;
    if (particleType == null) {
      particleType = null;
    }
    coordX = parseFloat(coordX);
    coordY = parseFloat(coordY);
    searchArea = {
      x: coordX - this.snapTolerance / 2,
      y: coordY - this.snapTolerance / 2,
      width: this.snapTolerance,
      height: this.snapTolerance
    };
    nearbyParticles = this.spatialPartition.find(searchArea);
    if (nearbyParticles.length > 0) {
      particleItem = nearbyParticles[0].point;
    } else {
      particleItem = this.createParticle(coordX, coordY, particleType);
      this.spatialPartition.insert({
        x: coordX,
        y: coordY,
        point: particleItem
      });
      this.particles.push(particleItem);
    }
    return particleItem;
  };

  CoreStage.prototype.createParticle = function(coordX, coordY, particleType) {
    var particleItem;
    switch (particleType) {
      case "elastic":
        particleItem = new physics.ElasticPoint(coordX, coordY);
        break;
      default:
        particleItem = new physics.Particle(coordX, coordY);
    }
    return particleItem;
  };

  CoreStage.prototype.addFixedPoint = function(element, coordX, coordY) {
    var particleItem;
    particleItem = this.addParticle(coordX, coordY);
    return particleItem.fixed = true;
  };

  CoreStage.prototype.addGraphicParticle = function(svgGraphicPoint, attributeA, coordX, coordY) {};

  CoreStage.prototype.registerFixedObject = function(element) {
    return this.fixedObjects.push(element);
  };

  CoreStage.prototype.addExtension = function(extensionItem) {
    return this.extensions.push(extensionItem);
  };

  CoreStage.prototype.isDeviceMobile = function() {
    return navigator.userAgent.match(/Android/) || navigator.userAgent.match(/iPhone/) || navigator.userAgent.match(/iPod/) || navigator.userAgent.match(/iPad/);
  };

  return CoreStage;

})();

window.requestNextFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(animationCallback) {
    return window.setTimeout(animationCallback, 1000 / 55);
  };
})();

/*

	GraphicScene: Primary class for interpreting SVG data and configuring the physics simulation.

	IMPROVEMENT: Re-evaluate parsing mechanism. Group-based object management is inefficient.

	REFACTOR: Eliminate jQuery dependency. It's currently used out of convenience.
*/


graphic.DisplayScene = (function(parentClass) {

  _prototypeExtender(DisplayScene, parentClass);

  DisplayScene.prototype.assetLoaded = false;

  DisplayScene.prototype.xOffset = 0;

  DisplayScene.prototype.yOffset = 0;

  DisplayScene.prototype.loadCompleteCallback = null;

  function DisplayScene(config) {
    this.addGraphicConstraint = _closureBinder(this.addGraphicConstraint, this);

    this.addPolygonConstraint = _closureBinder(this.addPolygonConstraint, this);

    this.addPathConstraint = _closureBinder(this.addPathConstraint, this);

    this.addInvisibleConstraint = _closureBinder(this.addInvisibleConstraint, this);

    this.addVisualParticle = _closureBinder(this.addVisualParticle, this);

    this.addConnection = _closureBinder(this.addConnection, this);

    this.processGroupElements = _closureBinder(this.processGroupElements, this);

    this.processByColorAttributes = _closureBinder(this.processByColorAttributes, this);

    this.processByGroupTags = _closureBinder(this.processByGroupTags, this);

    this.onAssetsLoaded = _closureBinder(this.onAssetsLoaded, this);
    DisplayScene.__super__.constructor.call(this, config);
    helpers.General.copyObject(config, this.configuration);
    if (this.configuration.completionHandler != null) {
      this.loadCompleteCallback = config.completionHandler;
    }
    this.targetContainer = $(this.configuration.viewportSelector);
    if (this.configuration.sourcePath) {
      this.targetContainer.load(this.configuration.sourcePath, this.onAssetsLoaded);
    } else {
      setTimeout(this.onAssetsLoaded, 1);
    }
    setTimeout(function() {
      return window.scrollTo(0, 1);
    }, 0);
  }

  DisplayScene.prototype.onAssetsLoaded = function() {
    DisplayScene.__super__.onContentReady.call(this);
    this.rootNode = this.svgRoot = this.targetContainer.find("svg")[0];
    this.rootNode.dispatchEvent(new Event("OnSceneFileLoaded", {
      bubbles: true,
      cancelable: true
    }));
    $(this.rootNode).hide();
    $(this.rootNode).fadeIn();
    this.processByGroupTags();
    this.alignVertically(this.configuration.alignY);
    this.alignHorizontally(this.configuration.alignX);
    this.rootNode.dispatchEvent(new Event("onSceneLoaded", {
      bubbles: true,
      cancelable: true
    }));
    if (typeof this.loadCompleteCallback === "function") {
      this.loadCompleteCallback();
    }
    return this.initializeStage();
  };

  DisplayScene.prototype.alignVertically = function(placement) {
    switch (placement) {
      case "middle":
        this.yOffset += $(this.svgRoot).height() * -0.5;
        break;
      case "upper":
        this.yOffset = 0;
    }
    return this.adjustFramePosition();
  };

  DisplayScene.prototype.alignHorizontally = function(placement) {
    switch (placement) {
      case "middle":
        this.xOffset += $(this.svgRoot).width() * -0.5;
        break;
      case "start":
        this.xOffset = 0;
    }
    return this.adjustFramePosition();
  };

  DisplayScene.prototype.adjustFramePosition = function() {