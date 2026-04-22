var components = {};
var visual = {};
var calculations = {};
var dynamics = {};
var general = {};

// Helper for requestAnimationFrame
window.animationFrameRequester = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callbackFunction) {
    return window.setTimeout(callbackFunction, 1000 / 60);
  };
})();

// Helper for inheritance, replacing __extends
general.inherits = function(childClass, parentClass) {
  for (var key in parentClass) {
    if (Object.prototype.hasOwnProperty.call(parentClass, key)) childClass[key] = parentClass[key];
  }

  function TempCtor() {
    this.constructor = childClass;
  }
  TempCtor.prototype = parentClass.prototype;
  childClass.prototype = new TempCtor();
  childClass.superPrototype = parentClass.prototype;
  return childClass;
};

// Helper for object copying, replacing util.General.copyObject
general.utility = {};
general.utility.copyProperties = function(source, destination) {
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      destination[key] = source[key];
    }
  }
};

// Point type for the simulation, clone of verlet.Point
dynamics.SimPoint = (function() {
  function SimPoint(x, y) {
    this.coordX = x;
    this.coordY = y;
    this.prevX = x; // For Verlet integration
    this.prevY = y; // For Verlet integration
    this.forceVecX = 0;
    this.forceVecY = 0;
    this.isImmovable = false;
  }
  SimPoint.prototype.update = function() {
    if (this.isImmovable) return;

    var tempX = this.coordX;
    var tempY = this.coordY;

    // Verlet integration
    this.coordX += (this.coordX - this.prevX) + this.forceVecX * dynamics.SimulationArea.frameTimeStep * dynamics.SimulationArea.frameTimeStep;
    this.coordY += (this.coordY - this.prevY) + this.forceVecY * dynamics.SimulationArea.frameTimeStep * dynamics.SimulationArea.frameTimeStep;

    this.prevX = tempX;
    this.prevY = tempY;

    this.forceVecX = 0; // Reset forces
    this.forceVecY = 0;
  };
  return SimPoint;
})();

// Rubber point, clone of verlet.RubberPoint
dynamics.RubberPoint = (function(_super) {
  general.inherits(RubberPoint, _super);

  function RubberPoint(x, y) {
    _super.call(this, x, y);
  }
  return RubberPoint;
})(dynamics.SimPoint);

// Spatial Indexer, clone of util.QuadTree
general.SpatialIndexer = (function() {
  function SpatialIndexer(boundaryRect, capacityValue) {
    this.boundary = boundaryRect;
    this.capacity = capacityValue || 4;
    this.elements = [];
    this.subdivided = false;
  }

  SpatialIndexer.prototype.subdivideRegion = function() {
    var x = this.boundary.x;
    var y = this.boundary.y;
    var w = this.boundary.width / 2;
    var h = this.boundary.height / 2;

    var ne = new SpatialIndexer.Rectangle(x + w, y, w, h);
    var nw = new SpatialIndexer.Rectangle(x, y, w, h);
    var se = new SpatialIndexer.Rectangle(x + w, y + h, w, h);
    var sw = new SpatialIndexer.Rectangle(x, y + h, w, h);

    this.northeast = new SpatialIndexer(ne, this.capacity);
    this.northwest = new SpatialIndexer(nw, this.capacity);
    this.southeast = new SpatialIndexer(se, this.capacity);
    this.southwest = new SpatialIndexer(sw, this.capacity);

    this.subdivided = true;
  };

  SpatialIndexer.prototype.insertElement = function(data) { // data format: { x: point.x, y: point.y, point: point }
    if (!this.boundary.containsPoint(data)) {
      return false;
    }

    if (this.elements.length < this.capacity) {
      this.elements.push(data);
      return true;
    }

    if (!this.subdivided) {
      this.subdivideRegion();
    }

    if (this.northeast.insertElement(data) || this.northwest.insertElement(data) || this.southeast.insertElement(data) || this.southwest.insertElement(data)) {
      return true;
    }

    return false;
  };

  SpatialIndexer.prototype.queryRange = function(queryRect, foundItems) { // queryRect format: { x, y, width, height }
    foundItems = foundItems || [];
    if (!this.boundary.intersectsRectangle(queryRect)) {
      return foundItems;
    }

    for (var i = 0; i < this.elements.length; i++) {
      if (queryRect.containsPoint(this.elements[i])) {
        foundItems.push(this.elements[i]);
      }
    }

    if (this.subdivided) {
      this.northwest.queryRange(queryRect, foundItems);
      this.northeast.queryRange(queryRect, foundItems);
      this.southwest.queryRange(queryRect, foundItems);
      this.southeast.queryRange(queryRect, foundItems);
    }
    return foundItems;
  };

  SpatialIndexer.prototype.clearAll = function() {
    this.elements = [];
    this.subdivided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  };

  // Helper class for boundary rectangles
  SpatialIndexer.Rectangle = function(xPos, yPos, rectWidth, rectHeight) {
    this.x = xPos;
    this.y = yPos;
    this.width = rectWidth;
    this.height = rectHeight;
  };
  SpatialIndexer.Rectangle.prototype.containsPoint = function(pointData) {
    return (pointData.x >= this.x &&
            pointData.x <= this.x + this.width &&
            pointData.y >= this.y &&
            pointData.y <= this.y + this.height);
  };
  SpatialIndexer.Rectangle.prototype.intersectsRectangle = function(otherRect) {
    return !(otherRect.x > this.x + this.width ||
             otherRect.x + otherRect.width < this.x ||
             otherRect.y > this.y + this.height ||
             otherRect.y + otherRect.height < this.y);
  };

  return SpatialIndexer;
})();


// Constraint (Stick), clone of verlet.Stick
dynamics.Constraint = (function() {
  function Constraint(firstPoint, secondPoint) {
    var initialDeltaX, initialDeltaY, self = this;

    this.pointA = firstPoint;
    this.pointB = secondPoint;
    this.isBroken = false;
    this.maxPermittedExtension = 9999;

    initialDeltaX = firstPoint.coordX - secondPoint.coordX;
    initialDeltaY = firstPoint.coordY - secondPoint.coordY;
    this.originalLength = Math.sqrt(initialDeltaX * initialDeltaX + initialDeltaY * initialDeltaY);

    this.applyCorrection = function() {
      if (self.pointA.isImmovable && self.pointB.isImmovable) {
        return;
      }

      var currentDeltaX, currentDeltaY, currentLength, lengthDifference, correctionX, correctionY;

      currentDeltaX = self.pointB.coordX - self.pointA.coordX;
      currentDeltaY = self.pointB.coordY - self.pointA.coordY;
      currentLength = Math.sqrt(currentDeltaX * currentDeltaX + currentDeltaY * currentDeltaY);

      if (currentLength > self.maxPermittedExtension) {
        self.isBroken = true;
        return;
      }

      lengthDifference = self.originalLength - currentLength;

      if (currentLength === 0) {
        correctionX = 0;
        correctionY = 0;
      } else {
        correctionX = (lengthDifference * currentDeltaX / currentLength);
        correctionY = (lengthDifference * currentDeltaY / currentLength);
      }

      if (self.pointA.isImmovable) {
        self.pointB.coordX += correctionX;
        self.pointB.coordY += correctionY;
      } else if (self.pointB.isImmovable) {
        self.pointA.coordX -= correctionX;
        self.pointA.coordY -= correctionY;
      } else {
        self.pointA.coordX -= correctionX * 0.5;
        self.pointA.coordY -= correctionY * 0.5;
        self.pointB.coordX += correctionX * 0.5;
        self.pointB.coordY += correctionY * 0.5;
      }
    };
  }

  return Constraint;
})();

// Gradient Noise Generator, clone of util.ImprovedNoise
calculations.GradientNoise = (function() {
  var smoothStep, interpolateLinear, computeGradient, permutationTable;

  function GradientNoiseGenerator() {}

  smoothStep = function(tVal) {
    return tVal * tVal * tVal * (tVal * (tVal * 6 - 15) + 10);
  };

  interpolateLinear = function(tVal, valA, valB) {
    return valA + tVal * (valB - valA);
  };

  computeGradient = function(hashVal, xCoord, yCoord, zCoord) {
    var h, uComponent, vComponent;
    h = hashVal & 15;
    uComponent = (h < 8 ? xCoord : yCoord);
    vComponent = (h < 4 ? yCoord : (h === 12 || h === 14 ? xCoord : zCoord));
    return ((h & 1) === 0 ? uComponent : -uComponent) + ((h & 2) === 0 ? vComponent : -vComponent);
  };

  permutationTable = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

  for (let idx = 0; idx < 256; idx++) {
    permutationTable[256 + idx] = permutationTable[idx];
  }

  GradientNoiseGenerator.prototype.generateNoise = function(xInput, yInput, zInput) {
    var cubeX, cubeY, cubeZ,
      permX, permY, permZ,
      relativeX, relativeY, relativeZ,
      relativeXMinusOne, relativeYMinusOne, relativeZMinusOne,
      uFactor, vFactor, wFactor,
      hashA, hashAA, hashAB, hashB, hashBA, hashBB;

    cubeX = Math.floor(xInput);
    cubeY = Math.floor(yInput);
    cubeZ = Math.floor(zInput);

    permX = cubeX & 255;
    permY = cubeY & 255;
    permZ = cubeZ & 255;

    relativeX = xInput - cubeX;
    relativeY = yInput - cubeY;
    relativeZ = zInput - cubeZ;

    relativeXMinusOne = relativeX - 1;
    relativeYMinusOne = relativeY - 1;
    relativeZMinusOne = relativeZ - 1;

    uFactor = smoothStep(relativeX);
    vFactor = smoothStep(relativeY);
    wFactor = smoothStep(relativeZ);

    hashA = permutationTable[permX] + permY;
    hashAA = permutationTable[hashA] + permZ;
    hashAB = permutationTable[hashA + 1] + permZ;
    hashB = permutationTable[permX + 1] + permY;
    hashBA = permutationTable[hashB] + permZ;
    hashBB = permutationTable[hashB + 1] + permZ;

    return interpolateLinear(wFactor,
      interpolateLinear(vFactor,
        interpolateLinear(uFactor, computeGradient(permutationTable[hashAA], relativeX, relativeY, relativeZ), computeGradient(permutationTable[hashBA], relativeXMinusOne, relativeY, relativeZ)),
        interpolateLinear(uFactor, computeGradient(permutationTable[hashAB], relativeX, relativeYMinusOne, relativeZ), computeGradient(permutationTable[hashBB], relativeXMinusOne, relativeYMinusOne, relativeZ))),
      interpolateLinear(vFactor,
        interpolateLinear(uFactor, computeGradient(permutationTable[hashAA + 1], relativeX, relativeY, relativeZMinusOne), computeGradient(permutationTable[hashBA + 1], relativeXMinusOne, relativeY, relativeZ - 1)),
        interpolateLinear(uFactor, computeGradient(permutationTable[hashAB + 1], relativeX, relativeYMinusOne, relativeZMinusOne), computeGradient(permutationTable[hashBB + 1], relativeXMinusOne, relativeYMinusOne, relativeZMinusOne))));
  };

  return GradientNoiseGenerator;
})();

var globalNoiseGenerator = new calculations.GradientNoise();

// Main simulation engine, clone of BaseScene
dynamics.SimulationArea = (function() {
  function SimulationArea(config) {
    var self = this;

    this.addImmutableElement = function(item) { return self._addImmutableElement(item); };
    this.addGraphicPoint = function(svgPt, abVal, xCoord, yCoord) { return self._addGraphicPoint(svgPt, abVal, xCoord, yCoord); };
    this.addFixedPoint = function(xCoord, yCoord) { return self._addFixedPoint(xCoord, yCoord); };
    this.cycleUpdate = function() { return self._cycleUpdate(); };
    this.startSimulation = function() { return self._startSimulation(); };
    this.releaseResources = function() { return self._releaseResources(); };
    this.pauseSimulation = function() { return self._pauseSimulation(); };

    dynamics.SimulationArea.frameTimeStep = 0.0;

    this.configSettings = {
      containerSelector: "#simulationContainer",
      verticalAlignment: "center",
      horizontalAlignment: "center",
      completionCallback: null,
      dataFile: null,
      colorParsing: {
        fixed: "#FF0000",
        connection: "#FF0000"
      }
    };

    general.utility.copyProperties(config, this.configSettings);

    this.offsetYCoord = 0;
    this.offsetXCoord = 0;
    this.currentSimulationTime = 0;

    this.vertexElements = [];
    this.constraintLines = [];
    this.visualConnections = [];
    this.graphicPoints = [];
    this.immobileEntities = [];
    this.scheduledTasks = [];
    this.extensionModules = [];

    var defaultBoundary = new general.SpatialIndexer.Rectangle(0, 0, 10000, 10000);
    this.spatialIndex = new general.SpatialIndexer(defaultBoundary);

    this.simulationActive = true;
    this.contentReady = false;
    this.proximityThreshold = 1.0;
    this.previousFrameTimestamp = 0.0;

    return this;
  }

  SimulationArea.prototype.pauseSimulation = function() {
    this.simulationActive = false;
  };

  SimulationArea.prototype.releaseResources = function() {
    this.simulationActive = false;
    for (var i = 0; i < this.extensionModules.length; i++) {
      this.extensionModules[i].deactivate();
    }
    this.vertexElements = [];
    this.constraintLines = [];
    this.visualConnections = [];
    this.graphicPoints = [];
    this.immobileEntities = [];
    this.scheduledTasks = [];
    this.extensionModules = [];
  };

  SimulationArea.prototype.startSimulation = function() {
    if (this.simulationActive) {
      return;
    }
    this.simulationActive = true;
    this.previousFrameTimestamp = new Date().getTime();
    for (var i = 0; i < this.vertexElements.length; i++) {
      var p = this.vertexElements[i];
      p.forceVecX = 0;
      p.forceVecY = 0;
    }
    if (this.contentReady) {
      return this.cycleUpdate();
    }
  };

  SimulationArea.prototype.onContentReady = function() {
    this.contentReady = true;
  };

  SimulationArea.prototype.initializeEngine = function() {
    this.previousFrameTimestamp = new Date().getTime();
    for (var i = 0; i < this.extensionModules.length; i++) {
      var mod = this.extensionModules[i];
      mod.setup(this);
    }
    this.spatialIndex.clearAll();
    this.cycleUpdate();
  };

  SimulationArea.prototype._cycleUpdate = function() {
    var currentTimestamp, module, vertex, constraint, graphicVertex, visualConnection;

    currentTimestamp = new Date().getTime();
    dynamics.SimulationArea.frameTimeStep = Math.min(currentTimestamp - this.previousFrameTimestamp, 20);
    this.previousFrameTimestamp = currentTimestamp;

    for (var i = 0; i < this.extensionModules.length; i++) {
      module = this.extensionModules[i];
      module.process();
    }
    for (var j = 0; j < this.vertexElements.length; j++) {
      vertex = this.vertexElements[j];
      vertex.update();
    }
    for (var k = 0; k < this.constraintLines.length; k++) {
      constraint = this.constraintLines[k];
      constraint.applyCorrection();
    }
    for (var l = 0; l < this.graphicPoints.length; l++) {
      graphicVertex = this.graphicPoints[l];
      graphicVertex.update();
    }
    for (var m = 0; m < this.visualConnections.length; m++) {
      visualConnection = this.visualConnections[m];
      visualConnection.process();
    }

    if (this.simulationActive) {
      window.animationFrameRequester(this.cycleUpdate, null);
    }
  };

  SimulationArea.tickCount = 0;

  SimulationArea.prototype.registerVertex = function(xInput, yInput, typeOfVertex) {
    if (typeOfVertex == null) {
      typeOfVertex = null;
    }
    xInput = parseFloat(xInput);
    yInput = parseFloat(yInput);

    var searchArea = new general.SpatialIndexer.Rectangle(
      xInput - this.proximityThreshold / 2,
      yInput - this.proximityThreshold / 2,
      this.proximityThreshold,
      this.proximityThreshold
    );

    var foundVertices = this.spatialIndex.queryRange(searchArea);
    var newVertex;

    if (foundVertices.length > 0) {
      newVertex = foundVertices[0].point;
    } else {
      newVertex = this.instantiateVertex(xInput, yInput, typeOfVertex);
      this.spatialIndex.insertElement({
        x: xInput,
        y: yInput,
        point: newVertex
      });
      this.vertexElements.push(newVertex);
    }
    return newVertex;
  };

  SimulationArea.prototype.instantiateVertex = function(xInput, yInput, typeOfVertex) {
    var createdPoint;
    switch (typeOfVertex) {
      case "rubber":
        createdPoint = new dynamics.RubberPoint(xInput, yInput);
        break;
      default:
        createdPoint = new dynamics.SimPoint(xInput, yInput);
    }
    return createdPoint;
  };

  SimulationArea.prototype._addFixedPoint = function(xCoord, yCoord) {
    var vertexToFix = this.registerVertex(xCoord, yCoord);
    vertexToFix.isImmovable = true;
    return vertexToFix;
  };

  SimulationArea.prototype._addGraphicPoint = function(svgGraphicPoint, abParam, xCoord, yCoord) {};

  SimulationArea.prototype._addImmutableElement = function(element) {
    return this.immobileEntities.push(element);
  };

  SimulationArea.prototype.attachModule = function(moduleInstance) {
    return this.extensionModules.push(moduleInstance);
  };

  SimulationArea.prototype.isMobileDevice = function() {
    return navigator.userAgent.match(/Android/) || navigator.userAgent.match(/iPhone/) || navigator.userAgent.match(/iPod/) || navigator.userAgent.match(/iPad/);
  };

  return SimulationArea;
})();

// Vector Graphics Canvas, clone of svg.Scene
visual.VectorGraphicsCanvas = (function(_super) {
  general.inherits(VectorGraphicsCanvas, _super);

  function VectorGraphicsCanvas(config) {
    var self = this;

    this.handleSvgLinkageAdd = function(svgElement, point1, point2) { return self._handleSvgLinkageAdd(svgElement, point1, point2); };
    this.handlePolyLinkageAdd = function(polyElement, pointList) { return self._handlePolyLinkageAdd(polyElement, pointList); };
    this.handlePathLinkageAdd = function(pathElement, pathPoints) { return self._handlePathLinkageAdd(pathElement, pathPoints); };
    this.handleHiddenLinkageAdd = function(hiddenElement, startPoint, endPoint) { return self._handleHiddenLinkageAdd(hiddenElement, startPoint, endPoint); };
    this.addGraphicPoint = function(svgPt, abVal, xCoord, yCoord) { return self._addGraphicPoint(svgPt, abVal, xCoord, yCoord); };
    this.establishConnection = function(point1, point2) { return self._establishConnection(point1, point2); };
    this.processElementGroup = function(groupElement) { return self._processElementGroup(groupElement); };
    this.categorizeByColor = function() { return self._categorizeByColor(); };
    this.categorizeByGroup = function() { return self._categorizeByGroup(); };
    this.onContentReady = function() { return self._onContentReady(); };

    _super.call(this, config);

    this.contentReady = false;
    this.offsetXCoord = 0;
    this.offsetYCoord = 0;
    this.completionHandler = null;

    general.utility.copyProperties(config, this.configSettings);

    if (this.configSettings.completionCallback != null) {
      this.completionHandler = config.completionCallback;
    }

    this.displayContainer = document.querySelector(this.configSettings.containerSelector);

    if (this.configSettings.dataFile) {
      fetch(this.configSettings.dataFile)
        .then(response => response.text())
        .then(svgText => {
          this.displayContainer.innerHTML = svgText;
          this.onContentReady();
        })
        .catch(error => console.error('Error loading SVG file:', error));
    } else {
      setTimeout(this.onContentReady, 1);
    }
    setTimeout(function() {
      return window.scrollTo(0, 1);
    }, 0);
  }

  VectorGraphicsCanvas.prototype._onContentReady = function() {
    visual.VectorGraphicsCanvas.superPrototype.onContentReady.call(this);

    this.rootElement = this.vectorGraphic = this.displayContainer.querySelector("svg");

    this.rootElement.dispatchEvent(new CustomEvent("OnVectorGraphicFileLoaded", {
      bubbles: true,
      cancelable: true
    }));

    this.rootElement.style.display = 'none';
    setTimeout(() => {
      this.rootElement.style.display = '';
      this.rootElement.style.opacity = '0';
      let opacity = 0;
      const fadeInInterval = setInterval(() => {
        if (opacity < 1) {
          opacity += 0.05;
          this.rootElement.style.opacity = opacity;
        } else {
          clearInterval(fadeInInterval);
          this.rootElement.style.opacity = '';
        }
      }, 50);
    }, 10);

    this.categorizeByGroup();
    this.adjustVerticalPlacement(this.configSettings.verticalAlignment);
    this.adjustHorizontalPlacement(this.configSettings.horizontalAlignment);

    this.rootElement.dispatchEvent(new CustomEvent("onVectorGraphicLoaded", {
      bubbles: true,
      cancelable: true
    }));

    if (typeof this.completionHandler === "function") {
      this.completionHandler();
    }
    return this.initializeEngine();
  };

  VectorGraphicsCanvas.prototype.adjustVerticalPlacement = function(position) {
    switch (position) {
      case "center":
        this.offsetYCoord += this.vectorGraphic.offsetHeight * -0.5;
        break;
      case "top":
        this.offsetYCoord = 0;
    }
    return this.refreshDisplayOffset();
  };

  VectorGraphicsCanvas.prototype.adjustHorizontalPlacement = function(position) {
    switch (position) {
      case "center":
        this.offsetXCoord += this.vectorGraphic.offsetWidth * -0.5;
        break;
      case "left":
        this.offsetXCoord = 0;
    }
    return this.refreshDisplayOffset();
  };

  VectorGraphicsCanvas.prototype.refreshDisplayOffset = function() {
    // Original method was incomplete, cloning as is.
  };

  VectorGraphicsCanvas.prototype._handleSvgLinkageAdd = function(svgElement, point1, point2) {};
  VectorGraphicsCanvas.prototype._handlePolyLinkageAdd = function(polyElement, pointList) {};
  VectorGraphicsCanvas.prototype._handlePathLinkageAdd = function(pathElement, pathPoints) {};
  VectorGraphicsCanvas.prototype._handleHiddenLinkageAdd = function(hiddenElement, startPoint, endPoint) {};
  VectorGraphicsCanvas.prototype._addGraphicPoint = function(svgPoint, ab, x, y) {};
  VectorGraphicsCanvas.prototype._establishConnection = function(point1, point2) {};
  VectorGraphicsCanvas.prototype._processElementGroup = function(group) {};
  VectorGraphicsCanvas.prototype._categorizeByColor = function() {};
  VectorGraphicsCanvas.prototype._categorizeByGroup = function() {};

  return VectorGraphicsCanvas;
})(dynamics.SimulationArea);