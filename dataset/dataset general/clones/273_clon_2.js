"use strict";

/*
 * Construct spatial boundaries using provided numerical inputs
 * and store these configurations for subsequent operations.
 * All numerical inputs should be positive and logically sound.
 *
 * @param {number} extentX The overall horizontal span of the region.
 * @param {number} extentY The overall vertical span of the region.
 * @param {number} marginUp Offset from the upper boundary.
 * @param {number} marginRight Offset from the right boundary.
 * @param {number} marginBottom Offset from the lower boundary.
 * @param {number} marginLeft Offset from the left boundary.
 */
function createGeometricBounds (extentX,
                             extentY,
                             marginUp,
                             marginRight,
                             marginBottom,
                             marginLeft) {
 return  {
  extentX: extentX,
  extentY: extentY,
  innerXSpan: extentX - (marginLeft + marginRight),
  innerYSpan: extentY - (marginUp + marginBottom),
  marginUp: marginUp,
  marginRight: marginRight,
  marginBottom: marginBottom,
  marginLeft: marginLeft,
  centerX: ((extentX - (marginLeft + marginRight)) / 2) + marginLeft,
  centerY: ((extentY - (marginUp + marginBottom)) / 2) + marginUp
 };
}

// Establish spatial constraints for the graphical representations.
var mainDisplayArea = createGeometricBounds(620, 400, 30, 30, 30, 30);
var positionGraphBounds = createGeometricBounds(220, 200, 30, 30, 30, 30);
var velocityGraphBounds = positionGraphBounds;
var impactGraphBounds = positionGraphBounds;
var scatterGraphBounds = createGeometricBounds(220, 200, 30, 30, 30, 50);
var effectiveScatterBounds = createGeometricBounds(540, 300, 30, 30, 30, 50);
var effectivePositionBounds = createGeometricBounds(540, 200, 30, 30, 30, 40);
var effectiveSpeedBounds = effectivePositionBounds;
var histogramBounds = createGeometricBounds(540, 300, 30, 30, 30, 50);

var ACTIVE_DURATION = 1000;
var TIME_LIMIT = 2000;
var REFRESH_INTERVAL = TIME_LIMIT;
var VELOCITY_CAP = 6; // pixels per millisecond

function calculateImpactRadius (impactValue, targetRadius) {
 return ((impactGraphBounds.innerXSpan / 2) / targetRadius) * impactValue;
};


function determineVelocityColor (speedValue) {
 var colorString = 'rgb(' + clampInt(0, 255, (speedValue / VELOCITY_CAP) * 255) + ', 0, 0)';
 return colorString;
};

var dispersionScaleX = d3.scale.linear()
 .domain([0.5, 5.5])
 .range([0, scatterGraphBounds.innerXSpan]);

var dispersionScaleY = d3.scale.linear()
 .domain([TIME_LIMIT, 0])
 .range([0, scatterGraphBounds.innerYSpan]);

var timeScale = d3.scale.linear()
 .domain([0, 1000])
 .range([0, velocityGraphBounds.innerXSpan]);

var velocityScale = d3.scale.linear()
 .domain([0, VELOCITY_CAP])
 .range([velocityGraphBounds.innerYSpan, 0]);

var positionScaleX = d3.scale.linear()
 .domain([-20, 300])
 .range([0, positionGraphBounds.innerXSpan]);

var positionScaleY = d3.scale.linear()
 .domain([-50, 50])
 .range([positionGraphBounds.innerYSpan, 0]);

var effectiveDispersionX = d3.scale.linear()
 .domain([0.5, 6.5])
 .range([0, effectiveScatterBounds.innerXSpan]);

var effectiveDispersionY = d3.scale.linear()
 .domain([TIME_LIMIT, 0])
 .range([0, effectiveScatterBounds.innerYSpan]);

var effectivePositionX = d3.scale.linear()
 .domain([-60, 400])
 .range([0, effectivePositionBounds.innerXSpan]);

var effectivePositionY = d3.scale.linear()
 .domain([-50, 50])
 .range([effectivePositionBounds.innerYSpan, 0]);
 
var effectiveVelocityX = d3.scale.linear()
 .domain([0, TIME_LIMIT])
 .range([0, effectiveSpeedBounds.innerXSpan])

var effectiveVelocityY = d3.scale.linear()
 .domain([0, VELOCITY_CAP])
 .range([effectiveSpeedBounds.innerYSpan, 0]);


var fittsExperiment = {
 focusPoint: {x: 0, y: 0, r: 10},
 initialPoint: {x: 0, y: 0, t: 0},
 previousPoint: {},

 isometricCoordinates: [],
 currentCoordIndex: 0,
 currentIterationCount: 0,
 failureCount: 0,
 isometricConstraints: {minDistance: 120, maxDistance: 300, minWidth:10 , maxWidth: 100},
 isometricParameters: {quantity: 9, spacing: 200, size: 50, makeRandom: true},
 
 currentTrajectory: [],
 isActive: false,
 
 measurementRecords: [],
 activeMeasurementSetIndex: 0,
 recordCount: 0,
 
 colorPalette: d3.scale.category10(),
 
 totalID: 0,
 totalTime: 0,
 
 refreshTimerHandle: undefined,
 
 produceFocusPoint: function() {
  this.focusPoint = this.isometricCoordinates[this.currentCoordIndex];
  this.focusPoint.spacing = this.isometricParameters.spacing;
  this.currentCoordIndex = (this.currentCoordIndex + Math.ceil(this.isometricCoordinates.length/2)) % this.isometricCoordinates.length;
  
  var targetShape = testAreaSVG.selectAll('#focusCircle').data([this.focusPoint]);
  
  var applyAttributes = function(element) {
   element.attr('cx', function(d) { return d.x; })
   .attr('cy', function(d) { return d.y; })
   .attr('r', function(d) { return d.w / 2; });
  }

  targetShape.enter()
   .append('circle')
    .attr('id', 'focusCircle')
    .style('fill', 'red')
    .call(applyAttributes);
           
  targetShape.transition()
   .call(applyAttributes);

  
  this.isActive = true;
 },
 
 updateIsometricShapes: function() {
  this.currentIterationCount = 0;
  
  this.formIsometricCoordinates(this.isometricParameters.quantity,
   this.isometricParameters.spacing,
   this.isometricParameters.size);

  var shapeElements = testAreaSVG.selectAll('circle').data(this.isometricCoordinates);
  
  var applyAttributes = function(element) {
   element.attr('cx', function(d) { return d.x; })
   .attr('cy', function(d) { return d.y; })
   .attr('r', function(d) { return d.w / 2; });
  }

  shapeElements.enter()
   .append('circle')
    .attr('class', 'isometricShape')
    .call(applyAttributes);
           
  shapeElements.transition()
   .call(applyAttributes);
  
  shapeElements.exit()
   .transition()
    .attr('r', 0)
    .remove();
    
  this.currentCoordIndex = 0;
  this.produceFocusPoint();
  this.isActive = false;
},
 
 formIsometricCoordinates: function(count, distanceVal, widthVal) {
  
  // Remove all past data from the live visualization
  plotHitsGroup.selectAll('circle.impactMark')
   .transition()
    .duration(ACTIVE_DURATION)
     .ease('linear')
     .attr('r', 2)
     .style('opacity', 0)
     .remove();
  
  plotPositionGroup.selectAll('line.dynamicTrace')
   .transition()
    .duration(ACTIVE_DURATION)
    .style('stroke-opacity', 0)
    .remove();

  plotVelocitiesGroup.selectAll('line.dynamicTrace')
   .transition()
    .duration(ACTIVE_DURATION)
    .style('stroke-opacity', 0)
    .remove();
  
  
  this.isometricCoordinates = [];
  
  for (var i = 0; i < count; i++) {
   this.isometricCoordinates[i] = {x: mainDisplayArea.centerX + ((distanceVal/2) * Math.cos((2 * Math.PI * i) / count)),
    y: mainDisplayArea.centerY + ((distanceVal/2) * Math.sin((2 * Math.PI * i) / count)),
    w: widthVal};
  }
 },
 
 clearFocusPoint: function() {
  testAreaSVG.selectAll('#focusCircle').data([])
   .exit()
    .remove();
    
  this.isActive = false;
  this.currentTrajectory = [];
 },
 
 pointerActivated: function(coordX, coordY) {
  
  if (distance({x: coordX, y: coordY}, this.focusPoint) < (this.focusPoint.w / 2)) {
   this.incorporateMeasurement({initialPoint: this.initialPoint,
            focusPoint: this.focusPoint,
            trajectory: this.currentTrajectory,
            impact: {x: coordX, y: coordY, t: (new Date).getTime()}});
   this.clearFocusPoint();

   if (this.isometricParameters.makeRandom && this.currentIterationCount >= this.isometricCoordinates.length) {
    this.varyParameters();
    this.currentIterationCount = 0;
    this.currentCoordIndex = 0;
    this.failureCount = 0;
    this.updateIsometricShapes;
    this.produceFocusPoint();
    this.isActive = false;
   }
   else {
    this.currentIterationCount++;
    this.produceFocusPoint();   
   }

   
   this.previousPoint = {x: coordX, y: coordY, t: (new Date).getTime()};
   this.initialPoint = this.previousPoint;
   this.currentTrajectory.push(this.previousPoint);
  }
  else {
   this.failureCount++;
  }
 },
 
 pointerDisplaced: function(coordX, coordY) {
  if (this.isActive) {
   // Skip if the pointer genuinely did not move;
   // this scenario should be rare in practice.
   if (coordX == this.previousPoint.x && coordY == this.previousPoint.y) {
    return;
   }
   
   // Configure a timeout for updating the graphical plots.
   if (this.refreshTimerHandle) {
    window.clearTimeout(this.refreshTimerHandle);
   }
   this.refreshTimerHandle = window.setTimeout(this.updatePlots, REFRESH_INTERVAL, this);
   
   
   var latestPoint = {x: coordX, y: coordY, t: (new Date).getTime()}
   this.currentTrajectory.push(latestPoint)
   
   var timeDiff = latestPoint.t - this.previousPoint.t;
   var distanceTraveled = distance(this.previousPoint, {x: coordX, y: coordY})
   if (timeDiff > 0)
    var travelSpeed = distanceTraveled / timeDiff;
   else
    var travelSpeed = 0;
   
   testAreaSVG.append('line')
    // .attr('class', '') // Intentionally commented out class for possible future use
    .attr('x1', this.previousPoint.x)
    .attr('x2', latestPoint.x)
    .attr('y1', this.previousPoint.y)
    .attr('y2', latestPoint.y)
    .style('stroke', determineVelocityColor(travelSpeed))
    .transition()
     .duration(5000)
     .style('stroke-opacity', 0)
     .remove();
    
   this.previousPoint = latestPoint;
  }
 },
 
 incorporateMeasurement: function(inputData) {
  // Add the recorded point to the measurement array for plotting
  // into the ID/time scatter diagram.
  if (this.isActive == false)
   return;

  var timeDiff = inputData.impact.t - inputData.initialPoint.t;
 
  if (timeDiff < TIME_LIMIT)  // Discard if it's an obvious outlier.
  {
   var distanceTraveled = distance(inputData.focusPoint, inputData.initialPoint);
   var informationDensity = shannon(distanceTraveled, inputData.focusPoint.w);

   this.measurementRecords[this.activeMeasurementSetIndex].data.push({time: timeDiff, distance: inputData.focusPoint.spacing, width: inputData.focusPoint.w, hit: inputData.impact,
    start: inputData.initialPoint, target: inputData.focusPoint, path: inputData.trajectory});

   scatterGroup.append('circle')
    .attr('class', 'category' + this.activeMeasurementSetIndex)
    .style('fill', this.measurementRecords[this.activeMeasurementSetIndex].color)
    .attr('cx', dispersionScaleX(informationDensity))
    .attr('cy', dispersionScaleY(timeDiff))
    .attr('r', 0)
     .transition()
      .duration(200)
      .ease('bounce')
      .attr('r', 3);  
  
   var pointAlpha = inputData.initialPoint;
   var pointBeta = inputData.focusPoint;
   var trajectoryData = inputData.trajectory;
  
   var impactDetails = {}
   var projectionResult = project(pointAlpha, pointBeta, inputData.impact);
   impactDetails.x = distance(projectionResult, pointBeta) * sign(projectionResult.t - 1);
   impactDetails.y = distance(projectionResult, inputData.impact) * isLeft(pointAlpha, pointBeta, inputData.impact);
  
  
   plotHitsGroup.append('circle')
    .attr('class', 'impactMark')
    .attr('cx', calculateImpactRadius(impactDetails.x, inputData.focusPoint.w / 2))
    .attr('cy', calculateImpactRadius(impactDetails.y, inputData.focusPoint.w / 2))
    .attr('r', 6)
    .style('fill', 'red')
    .style('opacity', 1)
    .transition()
     .duration(500)
      .ease('linear')
      .attr('r', 3);
  
   var lastPointInPath = { x: 0, y: 0, t: inputData.initialPoint.t, v: 0};
   for (var i = 0; i < trajectoryData.length; i++) {
    var currentPathPoint = trajectoryData[i];
   
    var projectionResult = project(pointAlpha, pointBeta, currentPathPoint);
    var coordX = distance(projectionResult, pointAlpha) * sign(projectionResult.t);
    var coordY = distance(projectionResult, currentPathPoint) * isLeft(pointAlpha, pointBeta, currentPathPoint);

    var timeDiff = currentPathPoint.t - lastPointInPath.t;
    var distanceTraveled = distance(lastPointInPath, {x: coordX, y: coordY});
    if (timeDiff > 0)
     var travelSpeed = distanceTraveled / timeDiff;
    else
     var travelSpeed = 0;
  
    plotPositionGroup.append('svg:line')
     .attr('class', 'dynamicTrace')
     .attr('x1', positionScaleX(lastPointInPath.x))
     .attr('x2', positionScaleX(coordX))
     .attr('y1', positionScaleY(lastPointInPath.y))
     .attr('y2', positionScaleY(coordY))
     .style('stroke', determineVelocityColor(travelSpeed))
     .transition()
      .duration(ACTIVE_DURATION)
      .style('stroke-opacity', 0.5);
   
    plotVelocitiesGroup.append('svg:line')
     .attr('class', 'dynamicTrace')
     .attr('x1', timeScale(lastPointInPath.t - inputData.initialPoint.t))
     .attr('x2', timeScale(currentPathPoint.t - inputData.initialPoint.t))
     .attr('y1', velocityScale(lastPointInPath.v))
     .attr('y2', velocityScale(travelSpeed))

     .style('stroke', determineVelocityColor(travelSpeed))
     .transition()
      .duration(ACTIVE_DURATION)
      .style('stroke-opacity', 0.5);
     
    var currentPointState = {}
    currentPointState.x = coordX;
    currentPointState.y = coordY;
    currentPointState.t = currentPathPoint.t;
    currentPointState.v = travelSpeed;
    lastPointInPath = currentPointState;
   }
  }
 },
 
 varyParameters: function() {
  this.isometricParameters.spacing = Math.floor(randomAB(this.isometricConstraints.minDistance, this.isometricConstraints.maxDistance));
  this.isometricParameters.size = Math.floor(randomAB(this.isometricConstraints.minWidth, this.isometricConstraints.maxWidth));

  $('#paramSliderDistance').slider('value', this.isometricParameters.spacing);
  $('#paramSliderWidth').slider('value', this.isometricParameters.size);

  this.updateIsometricShapes();
  d3.select('#paramDistanceDisplay').text(this.isometricParameters.spacing);
  d3.select('#paramWidthDisplay').text(this.isometricParameters.size);
 },
 
 appendMeasurementSet: function() {
  
  // First, ensure all plots are up-to-date.
  this.updatePlots(this);
  
  this.recordCount++;
  var newSetIdentifier = this.recordCount;
  var chosenColor = this.colorPalette(randomAB(0, 10));
  
  this.measurementRecords[newSetIdentifier] = {data: [], color: chosenColor};
  
  this.activeMeasurementSetIndex = newSetIdentifier
  var containerElement = d3.select('#dataContainers').append('div')
   .attr('id', 'dataRecord' + newSetIdentifier)
   .text('Data Set ' + newSetIdentifier + ' ')
   .style('background-color', chosenColor);
  
  var deleteButtonId ='removeRecordButton' + newSetIdentifier;
  containerElement.append('button')
   .attr('id', deleteButtonId)
   .attr('type', 'button')
   .text('remove!');
   
  var selfReference = this;
  
  $('#' + deleteButtonId).click(function() {
   selfReference.eraseMeasurementSet(newSetIdentifier);
   fittsExperiment.isActive = false;
  });
  
  $('#dataRecord' + newSetIdentifier).click(function() {
   if (assIsKey(newSetIdentifier, selfReference.measurementRecords)) {
    selfReference.activeMeasurementSetIndex = newSetIdentifier;
    selfReference.highlightMeasurementSet(newSetIdentifier);    
   }
   fittsExperiment.isActive = false;

  })
   
  this.highlightMeasurementSet(newSetIdentifier);
  // The color is already applied.
  
 },
 
 eraseMeasurementSet: function(setIndex) {
  if (assSize(this.measurementRecords) == 1)
  {
   alert('Cannot remove the last data set! Please create another data set first.');
  } else
  { 
   d3.select('#dataRecord' + setIndex).remove();
   delete this.measurementRecords[setIndex];
   
   scatterGroup.selectAll('.category' + setIndex)
    .transition()
     .duration(500)
      .attr('r', 0)
      .remove();
   
   effectiveScatterBounds.selectAll('.category' + setIndex)
    .transition()
     .duration(500)
      .style('opacity', 0)
      .remove();
   
   throughputGroup.selectAll('rect.category' + setIndex)
    .transition()
     .duration(500)
      .attr('width', 0)
      .remove();
      
   effectivePositionBounds.selectAll('line.category' + setIndex)
    .transition()
     .duration(500)
      .style('opacity', 0)
      .remove()
   
   effectiveSpeedBounds.selectAll('line.category' + setIndex)
    .transition()
     .duration(500)
      .style('opacity', 0)
      .remove()
   
   if (setIndex == this.activeMeasurementSetIndex) {
    var firstKey = parseInt(assFirstKey(this.measurementRecords));
    this.activeMeasurementSetIndex = firstKey;
    this.highlightMeasurementSet(firstKey);
   }
   
   this.updatePlots(this);
  }
};