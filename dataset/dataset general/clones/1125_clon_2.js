function Point2D(horiz, vert) {
  this.horiz = horiz;
  this.vert = vert;
}

Point2D.prototype = {
  spin: function (angleRad) {
    var currentX = this.horiz;
    var currentY = this.vert;
    this.horiz = Math.cos(angleRad) * currentX - Math.sin(angleRad) * currentY;
    this.vert = Math.sin(angleRad) * currentX + Math.cos(angleRad) * currentY;
    return this;
  },

  scale: function (factor) {
    this.horiz *= factor;
    this.vert *= factor;
    return this;
  },

  duplicate: function () {
    return new Point2D(this.horiz, this.vert);
  },

  magnitude: function () {
    return Math.sqrt(this.horiz * this.horiz + this.vert * this.vert);
  },

  deduct: function (otherPt) {
    this.horiz -= otherPt.horiz;
    this.vert -= otherPt.vert;
    return this;
  },

  assignCoords: function (newHoriz, newVert) {
    this.horiz = newHoriz;
    this.vert = newVert;
    return this;
  }
};

function Segment(elongationOne, elongationTwo, initialAngle, sweepAngle, expansionRate, parentFlower) {
  this.elongationOne = elongationOne;
  this.elongationTwo = elongationTwo;
  this.initialAngle = initialAngle;
  this.sweepAngle = sweepAngle;
  this.parentFlower = parentFlower;
  this.expansionRate = expansionRate;
  this.currentRadius = 1;
  this.isComplete = false;
}

Segment.prototype = {
  renderShape: function () {
    var graphicsCtx = this.parentFlower.cultivationArea.drawingContext;
    var point1, point2, point3, point4;

    point1 = new Point2D(0, this.currentRadius).spin(Horticulture.degreesToRadians(this.initialAngle));
    point2 = point1.duplicate().spin(Horticulture.degreesToRadians(this.sweepAngle));
    point3 = point1.duplicate().scale(this.elongationOne);
    point4 = point2.duplicate().scale(this.elongationTwo);

    graphicsCtx.strokeStyle = this.parentFlower.colorValue;
    graphicsCtx.beginPath();
    graphicsCtx.moveTo(point1.horiz, point1.vert);
    graphicsCtx.bezierCurveTo(point3.horiz, point3.vert, point4.horiz, point4.vert, point2.horiz, point2.vert);
    graphicsCtx.stroke();
  },

  advanceGrowth: function () {
    if (this.currentRadius <= this.parentFlower.maxRadius) {
      this.currentRadius += this.expansionRate;
      this.renderShape();
    } else {
      this.isComplete = true;
    }
  }
};

function Flower(centerPoint, maxRadius, colorValue, segmentQuantity, cultivationArea) {
  this.centerPoint = centerPoint;
  this.maxRadius = maxRadius;
  this.colorValue = colorValue;
  this.segmentQuantity = segmentQuantity;
  this.segments = [];
  this.cultivationArea = cultivationArea;
  this.initialize();
  this.cultivationArea.addFlower(this);
}

Flower.prototype = {
  display: function () {
    var currentSegment, allSegmentsComplete = true;
    this.cultivationArea.drawingContext.save();
    this.cultivationArea.drawingContext.translate(this.centerPoint.horiz, this.centerPoint.vert);

    for (var idx = 0; idx < this.segments.length; idx++) {
      currentSegment = this.segments[idx];
      currentSegment.advanceGrowth();
      allSegmentsComplete = allSegmentsComplete && currentSegment.isComplete;
    }

    this.cultivationArea.drawingContext.restore();

    if (allSegmentsComplete === true) {
      this.cultivationArea.removeFlower(this);
    }
  },

  initialize: function () {
    var segmentSpan = 360 / this.segmentQuantity;
    var initialRotation = Horticulture.getInteger(0, 90);

    for (var sIdx = 0; sIdx < this.segmentQuantity; sIdx++) {
      this.segments.push(new Segment(
        Horticulture.getFloat(Horticulture.settings.segmentElongation.min, Horticulture.settings.segmentElongation.max),
        Horticulture.getFloat(Horticulture.settings.segmentElongation.min, Horticulture.settings.segmentElongation.max),
        initialRotation + sIdx * segmentSpan,
        segmentSpan,
        Horticulture.getFloat(Horticulture.settings.expansionRate.min, Horticulture.settings.expansionRate.max),
        this
      ));
    }
  }
};

function Horticulture(drawingContext, canvasElement) {
  this.flowers = [];
  this.canvasElement = canvasElement;
  this.drawingContext = drawingContext;
}

Horticulture.prototype = {
  drawAllFlowers: function () {
    for (var fIdx = 0; fIdx < this.flowers.length; fIdx++) {
      this.flowers[fIdx].display();
    }
  },

  addFlower: function (newFlower) {
    this.flowers.push(newFlower);
  },

  removeFlower: function (targetFlower) {
    var currentFlower;
    for (var fIdx = 0; fIdx < this.flowers.length; fIdx++) {
      currentFlower = this.flowers[fIdx];
      if (currentFlower === targetFlower) {
        this.flowers.splice(fIdx, 1);
        return this;
      }
    }
  },

  generateRandomFlower: function (posHoriz, posVert) {
    this.generateFlower(
      posHoriz,
      posVert,
      Horticulture.getInteger(Horticulture.settings.flowerRadius.min, Horticulture.settings.flowerRadius.max),
      Horticulture.getRandomRGBA(
        Horticulture.settings.hue.redMin, Horticulture.settings.hue.redMax,
        Horticulture.settings.hue.greenMin, Horticulture.settings.hue.greenMax,
        Horticulture.settings.hue.blueMin, Horticulture.settings.hue.blueMax,
        Horticulture.settings.hue.alphaValue
      ),
      Horticulture.getInteger(Horticulture.settings.segmentQuantity.min, Horticulture.settings.segmentQuantity.max)
    );
  },

  generateFlower: function (posHoriz, posVert, radiusSize, displayColor, segmentCount) {
    new Flower(new Point2D(posHoriz, posVert), radiusSize, displayColor, segmentCount, this);
  },

  clearAllFlowers: function () {
    this.flowers = [];
    this.drawingContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }
};

Horticulture.settings = {
  segmentQuantity: {
    min: 8,
    max: 15
  },
  segmentElongation: {
    min: 0.1,
    max: 3
  },
  expansionRate: {
    min: 0.1,
    max: 1
  },
  flowerRadius: {
    min: 8,
    max: 10
  },
  populationDensity: 10,
  growthVelocity: 1000 / 60,
  hue: {
    redMin: 128,
    redMax: 255,
    greenMin: 0,
    greenMax: 128,
    blueMin: 0,
    blueMax: 128,
    alphaValue: 0.1
  },
  tangentRotation: 60
};

Horticulture.getFloat = function (minVal, maxVal) {
  return Math.random() * (maxVal - minVal) + minVal;
};

Horticulture.getInteger = function (minVal, maxVal) {
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
};

Horticulture.fullCircleRadians = 2 * Math.PI;

Horticulture.degreesToRadians = function (angleDeg) {
  return Horticulture.fullCircleRadians / 360 * angleDeg;
};

Horticulture.radiansToDegrees = function (angleRad) {
  return angleRad / Horticulture.fullCircleRadians * 360;
};

Horticulture.formatRGBA = function (r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};

Horticulture.getRandomRGBA = function (rMin, rMax, gMin, gMax, bMin, bMax, alpha) {
  var redVal = Math.round(Horticulture.getFloat(rMin, rMax));
  var greenVal = Math.round(Horticulture.getFloat(gMin, gMax));
  var blueVal = Math.round(Horticulture.getFloat(bMin, bMax));
  var colorTolerance = 5;

  if (Math.abs(redVal - greenVal) <= colorTolerance && Math.abs(greenVal - blueVal) <= colorTolerance && Math.abs(blueVal - redVal) <= colorTolerance) {
    return Horticulture.formatRGBA(rMin, gMin, bMin, alpha);
  } else {
    return Horticulture.formatRGBA(redVal, greenVal, blueVal, alpha);
  }
};