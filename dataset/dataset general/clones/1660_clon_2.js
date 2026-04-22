// When visual elements are reshaped, there are gaps between them. We make them overlap by
// this many pixels to hide those gaps.
var OVERLAP_QUANTITY = 1;

function Vertex(gridXPos, gridYPos, pixelX, pixelY, parentElement) {
  this.gridXPosition = gridXPos;
  this.gridYPosition = gridYPos;
  this.pixelXcoord = pixelX;
  this.pixelYcoord = pixelY;
  this.attachedQuads = [];

  this.domElement = document.createElement('div');
  this.domElement.className = 'point';
  this.refreshDisplay();
  this.domElement.vertexRef = this;
  parentElement.appendChild(this.domElement);
}

Vertex.prototype = {
  get gridXPosition() {
    return this.gridXPosition;
  },

  get gridYPosition() {
    return this.gridYPosition;
  },

  get pixelXcoord() {
    return this.pixelXcoord;
  },

  get pixelYcoord() {
    return this.pixelYcoord;
  },

  get attachedQuads() {
    return this.attachedQuads;
  },

  shiftBy: function(changeInX, changeInY) {
    this.pixelXcoord += changeInX;
    this.pixelYcoord += changeInY;

    var formsConcaveShape = false;
    for (var k = 0, currentQuad; currentQuad = this.attachedQuads[k]; k++) {
      if (currentQuad.isCurved) {
        formsConcaveShape = true;
        break;
      }
    }

    if (formsConcaveShape) {
      this.pixelXcoord -= changeInX;
      this.pixelYcoord -= changeInY;
      return false;
    }

    this.refreshDisplay();

    return true;
  },

  refreshDisplay: function() {
    this.domElement.style.top = Math.round(this.pixelYcoord) + 'px';
    this.domElement.style.left = Math.round(this.pixelXcoord) + 'px';
  }
};

function Quad(vertexes, parentElement) {
  vertexes.forEach(function(currentVertex) {
    currentVertex.attachedQuads.push(this);
  }, this);

  this.vertexesRef = vertexes;
  this.initialSource = [
      {x: vertexes[0].pixelXcoord, y: vertexes[0].pixelYcoord},
      {x: vertexes[1].pixelXcoord, y: vertexes[1].pixelYcoord},
      {x: vertexes[2].pixelXcoord, y: vertexes[2].pixelYcoord},
      {x: vertexes[3].pixelXcoord, y: vertexes[3].pixelYcoord}
  ];

  this.uniqueId = vertexes[0].gridXPosition + '-' + vertexes[0].gridYPosition;

  this.domElement = document.createElement('div');
  this.domElement.className = 'tile';
  this.domElement.style.left = this.xCoord + 'px';
  this.domElement.style.top = this.yCoord + 'px';
  this.domElement.style.width = this.extentWidth + 'px';
  this.domElement.style.height = this.extentHeight + 'px';
  parentElement.appendChild(this.domElement);
}

Quad.prototype = {
  updateTransformMatrix: function() {
    // Calculates the perspective transformation, based on a JavaScript adaptation of OpenCV's
    // cvGetPerspectiveTransform, originally implemented by
    // http://www.is-real.net/experiments/css3/wonder-webkit/
    var originalCoords = this.initialSource;
    var destinationCoords = this.vertexesRef;
    var originX = originalCoords[0].x;
    var originY = originalCoords[0].y;
    var matrixA = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var vectorB = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var l = 0; l < 4; l++) {
      matrixA[l] = [];
      matrixA[l][0] = matrixA[l+4][3] = originalCoords[l].x - originX;
      matrixA[l][1] = matrixA[l+4][4] = originalCoords[l].y - originY;
      matrixA[l][2] = matrixA[l+4][5] = 1;
      matrixA[l][3] = matrixA[l][4] = matrixA[l][5] =
      matrixA[l+4][0] = matrixA[l+4][1] = matrixA[l+4][2] = 0;
      matrixA[l][6] = -(originalCoords[l].x - originX) * (destinationCoords[l].pixelXcoord - originX);
      matrixA[l][7] = -(originalCoords[l].y - originY) * (destinationCoords[l].pixelXcoord - originX);
      matrixA[l + 4][6] = -(originalCoords[l].x - originX) * (destinationCoords[l].pixelYcoord - originY);
      matrixA[l + 4][7] = -(originalCoords[l].y - originY) * (destinationCoords[l].pixelYcoord - originY);

      vectorB[l] = destinationCoords[l].pixelXcoord - originX;
      vectorB[l + 4] = destinationCoords[l].pixelYcoord - originY;
    }

    var matrixB_col = [];
    for(var m = 0; m < vectorB.length; m++) {
      matrixB_col[m] = [vectorB[m]];
    }

    var Matrix_A_obj = Matrix.create(matrixA);
    var Matrix_B_obj = Matrix.create(matrixB_col);
    var Matrix_X_obj = Matrix.solve(Matrix_A_obj, Matrix_B_obj);

    var currentCSSMatrix = new WebKitCSSMatrix();
    currentCSSMatrix.m11 = Matrix_X_obj.mat[0][0];
    currentCSSMatrix.m12 = Matrix_X_obj.mat[3][0];
    currentCSSMatrix.m13 = 0;
    currentCSSMatrix.m14 = Matrix_X_obj.mat[6][0];

    currentCSSMatrix.m21 = Matrix_X_obj.mat[1][0];
    currentCSSMatrix.m22 = Matrix_X_obj.mat[4][0];
    currentCSSMatrix.m23 = 0;
    currentCSSMatrix.m24 = Matrix_X_obj.mat[7][0];

    currentCSSMatrix.m31 = 0;
    currentCSSMatrix.m32 = 0;
    currentCSSMatrix.m33 = 1;
    currentCSSMatrix.m34 = 0;

    currentCSSMatrix.m41 = Matrix_X_obj.mat[2][0];
    currentCSSMatrix.m42 = Matrix_X_obj.mat[5][0];
    currentCSSMatrix.m43 = 0;
    currentCSSMatrix.m44 = 1;

    this.domElement.style.webkitTransform = currentCSSMatrix;
  },

  get isCurved() {
    // Based on the "right turn" check as described in
    // http://en.wikipedia.org/wiki/Graham_scan
    for (var n = 0; n < 4; n++) {
      var v1 = this.vertexesRef[(n - 1 + 4) % 4];
      var v2 = this.vertexesRef[n];
      var v3 = this.vertexesRef[(n + 1) % 4];

      if ((v2.pixelXcoord - v1.pixelXcoord) * (v3.pixelYcoord - v1.pixelYcoord) - (v2.pixelYcoord - v1.pixelYcoord) * (v3.pixelXcoord - v1.pixelXcoord) <= 0) {
        return true;
      }
    }

    return false;
  },

  get domElement() {
    return this.domElement;
  },

  get xCoord() {
    return this.initialSource[0].x;
  },

  get yCoord() {
    return this.initialSource[0].y;
  },

  get extentWidth() {
    return this.initialSource[1].x - this.initialSource[0].x + OVERLAP_QUANTITY;
  },

  get extentHeight() {
    return this.initialSource[3].y - this.initialSource[0].y + OVERLAP_QUANTITY;
  },

  get gridXPosition() {
    return this.vertexesRef[0].gridXPosition;
  },

  get gridYPosition() {
    return this.vertexesRef[0].gridYPosition;
  }
};

function Mesh(parentElement, cellDim, contentSource) {
  contentSource.begin();
  this.contentSourceRef = contentSource;

  parentElement.innerHTML = '';
  parentElement.style.width = contentSource.width + 'px';
  parentElement.style.height = contentSource.height + 'px';
  parentElement.style.marginLeft = -contentSource.width/2 + 'px';
  parentElement.style.marginTop = -contentSource.height/2 + 'px';
  this.visualCanvas = document.createElement('canvas');
  this.visualCanvas.id = 'grid-canvas';
  this.visualCanvas.width = contentSource.width;
  this.visualCanvas.height = contentSource.height;
  parentElement.appendChild(this.visualCanvas);

  this.totalWidth = contentSource.width;
  this.totalHeight = contentSource.height;

  this.xVertexCount = this.totalWidth/cellDim + 1;
  this.yVertexCount = this.totalHeight/cellDim + 1;
  this.vertexCollection = [];
  for (var p = 0; p < this.xVertexCount; p++) {
    this.vertexCollection.push([]);
    for (var q = 0; q < this.yVertexCount; q++) {
      var currentX = p * cellDim;
      if (currentX > this.totalWidth) currentX = this.totalWidth;
      var currentY = q * cellDim;
      if (currentY > this.totalHeight) currentY = this.totalHeight;
      this.vertexCollection[p][q] = new Vertex(p, q, currentX, currentY, parentElement);
    }
  }
  for (var r = 0; r < this.xVertexCount - 1; r++) {
    for (var s = 0; s < this.yVertexCount - 1; s++) {
      var currentQuad = new Quad([
            this.vertexCollection[r][s],
            this.vertexCollection[r + 1][s],
            this.vertexCollection[r + 1][s + 1],
            this.vertexCollection[r][s + 1]
          ],
          parentElement);
      contentSource.populateQuad(currentQuad);
      currentQuad.updateTransformMatrix();
    }
  }

  this.boundMousePressHandler = this.handleMousePress.bind(this);
  this.boundMouseMoveHandler = this.handleMouseMove.bind(this);
  this.boundMouseReleaseHandler = this.handleMouseRelease.bind(this);

  if ('ontouchmove' in document) {
    document.addEventListener('touchstart', this.boundMousePressHandler, false);
    document.addEventListener('touchmove', this.boundMouseMoveHandler, false);
    document.addEventListener('touchend', this.boundMouseReleaseHandler, false);
  } else {
    document.addEventListener('mousedown', this.boundMousePressHandler, false);
    document.addEventListener('mousemove', this.boundMouseMoveHandler, false);
    document.addEventListener('mouseup', this.boundMouseReleaseHandler, false);
  }

  this.drawVisualization();
}

Mesh.prototype = {
  cleanup: function() {
    if ('ontouchmove' in document) {
      document.removeEventListener('touchstart', this.boundMousePressHandler, false);
      document.removeEventListener('touchmove', this.boundMouseMoveHandler, false);
      document.removeEventListener('touchend', this.boundMouseReleaseHandler, false);
    } else {
      document.removeEventListener('mousedown', this.boundMousePressHandler, false);
      document.removeEventListener('mousemove', this.boundMouseMoveHandler, false);
      document.removeEventListener('mouseup', this.boundMouseReleaseHandler, false);
    }

    this.contentSourceRef.end();
  },

  fetchEventCoords: function(inputEvent) {
    if (inputEvent.touches) {
      return {x: inputEvent.touches[0].pageX, y: inputEvent.touches[0].pageY};
    } else {
      return {x: inputEvent.screenX, y: inputEvent.screenY};
    }
  },

  handleMousePress: function(inputEvent) {
    var clickedVertex = inputEvent.target.vertexRef;
    if (!clickedVertex) return;

    this.activeVertex = clickedVertex;
    this.moveNeighborsWithDecay = inputEvent.altKey;
    this.moveAllVerticesWithScale = inputEvent.shiftKey;
    this.previousEventCoords = this.fetchEventCoords(inputEvent);
  },

  handleMouseMove: function(inputEvent) {
    // This action is primarily needed to prevent page scrolling when touch events are active.
    inputEvent.preventDefault();

    var updatedQuadsById = {};
    function markVertexQuadsForUpdate(vertexToMark) {
      vertexToMark.attachedQuads.forEach(function(quadToUpdate) {
        updatedQuadsById[quadToUpdate.uniqueId] = quadToUpdate;
      });
    }

    if (!this.activeVertex) return;

    var currentEventPosition = this.fetchEventCoords(inputEvent);
    var changeInX = currentEventPosition.x - this.previousEventCoords.x;
    var changeInY = currentEventPosition.y - this.previousEventCoords.y;

    if (!this.activeVertex.shiftBy(changeInX, changeInY)) {
      return;
    }
    markVertexQuadsForUpdate(this.activeVertex);

    if (this.moveNeighborsWithDecay) {
      for (var t = 0; t < this.xVertexCount; t++) {
        for (var u = 0; u < this.yVertexCount; u++) {
          var neighboringVertex = this.vertexCollection[t][u];
          if (neighboringVertex == this.activeVertex) continue;
          var vertexDistX = Math.abs(neighboringVertex.gridXPosition - this.activeVertex.gridXPosition);
          var vertexDistY = Math.abs(neighboringVertex.gridYPosition - this.activeVertex.gridYPosition);
          var attenuation = 1.0/Math.pow(1.3, vertexDistX + vertexDistY) - 0.05;
          if (attenuation <= 0) continue;
          neighboringVertex.shiftBy(changeInX * attenuation, changeInY * attenuation);
          markVertexQuadsForUpdate(neighboringVertex);
        }
      }
    } else if (this.moveAllVerticesWithScale) {
      // The following constraints are applied:
      // - The active vertex always shifts by the specified amount.
      // - Vertices located on the outer boundaries do not move (unless they are in the same row/column
      //   as the active vertex).
      // - Vertices "after" (below/to the right) and "before" the active vertex
      //   (above/to the left) move proportionally to maintain their relative spacing.
      var xVerticesBefore = this.activeVertex.gridXPosition;
      var xVerticesAfter = this.xVertexCount - this.activeVertex.gridXPosition - 1;
      var yVerticesBefore = this.activeVertex.gridYPosition;
      var yVerticesAfter = this.yVertexCount - this.activeVertex.gridYPosition - 1;

      for (var v = 0; v < this.xVertexCount; v++) {
        var xInfluence;
        if (v == this.activeVertex.gridXPosition) {
          xInfluence = 1;
        } else if (v == 0 || v == this.xVertexCount - 1) {
          xInfluence = 0;
        } else if (v < this.activeVertex.gridXPosition) {
          xInfluence = 1.0 - (this.activeVertex.gridXPosition - v)/xVerticesBefore;
        } else {
          xInfluence = 1.0 - (v - this.activeVertex.gridXPosition)/xVerticesAfter;
        }

        for (var w = 0; w < this.yVertexCount; w++) {
          var iteratedVertex = this.vertexCollection[v][w];
          if (iteratedVertex == this.activeVertex) continue;
          var yInfluence;
          if (w == this.activeVertex.gridYPosition) {
            yInfluence = 1;
          } else if (w == 0 || w == this.yVertexCount - 1) {
            yInfluence = 0;
          } else if (w < this.activeVertex.gridYPosition) {
            yInfluence = 1.0 - (this.activeVertex.gridYPosition - w)/yVerticesBefore;
          } else {
            yInfluence = 1.0 - (w - this.activeVertex.gridYPosition)/yVerticesAfter;
          }

          if (xInfluence == 0 && yInfluence == 0) continue;

          iteratedVertex.shiftBy(changeInX * xInfluence, changeInY * yInfluence);
          markVertexQuadsForUpdate(iteratedVertex);
        }
      }
    }

    this.drawVisualization();
    for (var quadId in updatedQuadsById) {
      updatedQuadsById[quadId].updateTransformMatrix();
    }

    this.previousEventCoords = currentEventPosition;
  },

  handleMouseRelease: function(inputEvent) {
    this.activeVertex = null;
  },

  drawVisualization: function() {
    var minPixelX = Number.MAX_VALUE;
    var maxPixelX = -Number.MAX_VALUE;
    var minPixelY = Number.MAX_VALUE;
    var maxPixelY = -Number.MAX_VALUE;

    for (var xIdx = 0; xIdx < this.xVertexCount; xIdx++) {
      for (var yIdx = 0; yIdx < this.yVertexCount; yIdx++) {
        var currentVertex = this.vertexCollection[xIdx][yIdx];
        if (currentVertex.pixelXcoord < minPixelX) minPixelX = currentVertex.pixelXcoord;
        if (currentVertex.pixelXcoord > maxPixelX) maxPixelX = currentVertex.pixelXcoord;
        if (currentVertex.pixelYcoord < minPixelY) minPixelY = currentVertex.pixelYcoord;
        if (currentVertex.pixelYcoord > maxPixelY) maxPixelY = currentVertex.pixelYcoord;
      }
    }

    // Allocate an additional pixel of space on all boundaries so that the 2-pixel wide stroke
    // does not get clipped if it is at the very edge.
    minPixelX = Math.floor(minPixelX - 1);
    maxPixelX = Math.ceil(maxPixelX + 1);
    minPixelY = Math.floor(minPixelY - 1);
    maxPixelY = Math.ceil(maxPixelY + 1);

    var renderWidth = maxPixelX - minPixelX;
    var renderHeight = maxPixelY - minPixelY;

    if (renderWidth > this.visualCanvas.width ||
        renderHeight > this.visualCanvas.height) {
      var newCanvas = document.createElement('canvas');
      newCanvas.id = 'grid-canvas';
      newCanvas.width = Math.round(renderWidth * 1.25);
      newCanvas.height = Math.round(renderHeight * 1.25);
      this.visualCanvas.parentNode.replaceChild(
          newCanvas, this.visualCanvas);
      this.visualCanvas = newCanvas;
    }

    this.visualCanvas.style.left = minPixelX + 'px';
    this.visualCanvas.style.top = minPixelY + 'px';

    var drawingContext = this.visualCanvas.getContext('2d');
    drawingContext.lineWidth = 2;
    drawingContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    drawingContext.clearRect(0, 0, this.visualCanvas.width, this.visualCanvas.height);

    for (var xCoordIdx = 0; xCoordIdx < this.xVertexCount; xCoordIdx++) {
      for (var yCoordIdx = 0; yCoordIdx < this.yVertexCount; yCoordIdx++) {
        var currentVertex = this.vertexCollection[xCoordIdx][yCoordIdx];
        var vertexAbove = yCoordIdx > 0 ? this.vertexCollection[xCoordIdx][yCoordIdx - 1] : currentVertex;
        var vertexLeft = xCoordIdx >  0 ? this.vertexCollection[xCoordIdx - 1][yCoordIdx] : currentVertex;

        drawingContext.beginPath();
        drawingContext.moveTo(vertexAbove.pixelXcoord - minPixelX, vertexAbove.pixelYcoord - minPixelY);
        drawingContext.lineTo(currentVertex.pixelXcoord - minPixelX, currentVertex.pixelYcoord - minPixelY);
        drawingContext.lineTo(vertexLeft.pixelXcoord - minPixelX, vertexLeft.pixelYcoord - minPixelY);
        drawingContext.stroke();
      }
    }
  }
};