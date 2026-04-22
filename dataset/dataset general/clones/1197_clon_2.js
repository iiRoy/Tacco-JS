var associate = require("linkup")
  , EventStream = require("signal")
  , dataVizLib = require("data-vis")
  , toCallable = require('to-func')
  , HoverHint = require("./infobox");

// View configuration constants
const TRANSPARENT_FILL = "transparent";
const LINE_THICKNESS = 0.3;
const HIGHLIGHTED_LINE_THICKNESS = 1.5;
const CIRCLE_OUTLINE = "#FFF";
const MAIN_VIEW_CLASS = "analytic-chart";
const RADIUS_METRIC_RANGE = [6, 40];
const LABEL_VISIBILITY_THRESHOLDS = [0, 1];

// Standard configuration values
const standardConfigs = {
  canvasWidth: 1200,
  canvasHeight: 700,
  collisionAdjustmentFactor: 0.5,
  forceStabilityThreshold: 0.02,
  connectionStrength: 1,
  connectionDistance: 60,
  chartRepulsion: -300,
  gravitationalPull: 0.1,
  zoomLevelLimits: [0.3, 2.3],
  infoBoxTemplate: "<div>label: {{text}}</div> <div>size: {{size}}</div>"
};

// Recognized properties for visual elements
const ALLOWED_ELEMENT_PROPS = ['id', 'size', 'cluster', 'text'];

/**
 * Creates a new `VisualPlotter` instance.
 *
 * @constructor VisualPlotter
 */

function VisualPlotter(viewportElem, elementUnits, connectionLines, viewSettings) {

  // main display area reference
  this.displayArea = viewportElem;

  // option cache for view settings
  this.viewSettings = {};

  viewSettings = viewSettings || {};

  this.viewSettings.canvasWidth = viewSettings.canvasWidth || standardConfigs.canvasWidth;
  this.viewSettings.canvasHeight = viewSettings.canvasHeight || standardConfigs.canvasHeight;
  this.viewSettings.elementColor = dataVizLib.scale.category20();
  this.viewSettings.elementColors = viewSettings.elementColors || {};
  this.viewSettings.collisionAdjustmentFactor = viewSettings.collisionAdjustmentFactor || standardConfigs.collisionAdjustmentFactor;
  this.viewSettings.initialZoomLevel = viewSettings.initialZoomLevel;
  this.viewSettings.zoomLevelLimits = viewSettings.zoomLevelLimits || viewSettings.scaleRange
                                  || standardConfigs.zoomLevelLimits;

  this.inputData = {
    elementUnits: elementUnits,
    connectionLines: connectionLines
  };

  // set initial component state
  this.resetComponentState();

  // activate pop-up information if requested
  viewSettings.infoBox && this.displayInfoBox(viewSettings.infoBox);
}

VisualPlotter.currentVersion = "0.12";

VisualPlotter.prototype = {
  constructor: VisualPlotter,

  /**
   * Prepares the chart for display
   *
   * @access public
   */

  initializeView: function() {
    let currentScope = this;
    let displayContainer = this.getDisplayContainer();

    this.processData(this.inputData.elementUnits, this.inputData.connectionLines);
    this.calculateVisualScales();
    this.setupZoomBehavior();

    displayContainer.html("");

    let graphicsArea = displayContainer.attr("class", MAIN_VIEW_CLASS)
      .append("svg")
        .attr("width", this.viewSettings.canvasWidth)
        .attr("height", this.viewSettings.canvasHeight)
        .attr("pointer-events", "all")
        .call(this._zoomControl.on("zoom", associate(this, this.handleZoomEvent))
                               .scaleExtent(this.viewSettings.zoomLevelLimits));

    this.mainGroup = graphicsArea.append('svg:g').style('display','none');

    let pressX, pressY;

    displayContainer.on("mousedown", function() {
      pressX = dataVizLib.event.x;
      pressY = dataVizLib.event.y;
    });

    displayContainer.on("click", function() {

        // prevent state reset if user was dragging
        if (dataVizLib.event.x != pressX || dataVizLib.event.y != pressY) {
          return;
        }

        currentScope.clearSelection();
      });

  },

  /**
   * Sets up interactive zoom functionality
   *
   * @access private
   */

  setupZoomBehavior: function() {
    this._zoomControl = dataVizLib.behavior.zoom();

    if (this.viewSettings.initialZoomLevel) {
      this._zoomControl = this._zoomControl.scale(this.viewSettings.initialZoomLevel);
    }
  },

  /**
   * Gathers and structures necessary data for rendering
   *
   * @access private
   */

  processData: function(elementUnits, connectionLines) {
    let currentContext = this
      , elementMap = {}
      , groupMap = {}
      , largestSize = 0
      , greatestWeight = 0 // This variable is declared but not used, matching original
      , inboundConnections = {}
      , outboundConnections = {}
      , connectionList = []
      , getGroupIdentifier = associate(this, this.getGroupIdentifier)
      , getElementSize = associate(this, this.getElementSize);

    elementUnits.forEach(function(unit) {
      let unitGroup = getGroupIdentifier(unit);

      largestSize = Math.max(largestSize, getElementSize(unit));
      elementMap[unit.id] = elementMap[unit.id] || unit;

      if (unitGroup != null && groupMap[unitGroup] == null) {

        // get color from configuration
        let groupColor = currentContext.viewSettings.elementColors[unitGroup];

        // initialize group record
        groupMap[unitGroup] = {};

        // store color for this group
        groupMap[unitGroup].colorValue = groupColor || currentContext.viewSettings.elementColor(unitGroup);
      }
    });

    // Determine distinct elements from the connections.
    connectionLines.forEach(function(linkItem) {

      // attempt to locate the elements involved in the relationship.
      let firstId = linkItem[0]
        , secondId = linkItem[1]
        , sourceElement = elementMap[firstId]
        , targetElement = elementMap[secondId];

      // if either element is missing, discard this connection.
      if (!sourceElement || !targetElement) return;

      // Add this connection to outgoing records
      if (!(firstId in outboundConnections)) {
        outboundConnections[firstId] = {};
      }

      // Add this connection to incoming records
      if (!(secondId in inboundConnections)) {
        inboundConnections[secondId] = {};
      }

      outboundConnections[firstId][secondId] = true;
      inboundConnections[secondId][firstId] = true;

      // construct the list of connections
      connectionList.push({
        source: sourceElement,
        target: targetElement
      });
    });

    this.elements = elementUnits;
    this.connections = connectionList;
    this.maximumElementSize = largestSize;
    this.inbound = inboundConnections;
    this.outbound = outboundConnections;
    this.elementLookup = elementMap;
    this.groupLookup = groupMap;
  },

  /**
   * Generates necessary scaling functions
   *
   * @access private
   */

  calculateVisualScales: function() {
    this.sizeToRadiusScale = dataVizLib.scale.sqrt().domain([1, this.maximumElementSize]).range(RADIUS_METRIC_RANGE);
    this.sizeToLabelScale = dataVizLib.scale.log().domain([1, this.maximumElementSize]).range(LABEL_VISIBILITY_THRESHOLDS);
  },

  /**
   * Determines the central point of mass for the visual elements
   *
   * @access private
   */

  calculateMassCentroid: function() {
    let currentViz = this;
    let totalX = 0, totalY = 0, sumOfSizes = 0;

    this.dataVizElements.each(function(dataPoint) {
      let pointSize = currentViz.getElementSize(dataPoint);
      totalX += dataPoint.x * pointSize;
      totalY += dataPoint.y * pointSize;
      sumOfSizes += pointSize;
    });

    this.centerXcoord = totalX / sumOfSizes;
    this.centerYcoord = totalY / sumOfSizes;
    this.centroidPosition = [this.centerXcoord, this.centerYcoord];
  },


  /**
   * Specifies which function to use for extracting a standardized property value.
   *
   * @access private
   */

  configurePropertyAccessor: function(propertyKey, accessorFunction) {

    if (~ALLOWED_ELEMENT_PROPS.indexOf(propertyKey)) {
      this.propertyAccessors[propertyKey] = accessorFunction;
    }

    return this;
  },

  /**
   * Retrieves an element's value for a standardized property name
   *
   * @access private
   */

  getElementPropertyValue: function(propertyKey, elementData) {
    let retrievedValue = this.propertyAccessors[propertyKey];

    if (retrievedValue == null) {
      return elementData[propertyKey];
    } else if (typeof retrievedValue === "function") {
      return retrievedValue(elementData);
    }

    return;
  },

  /**
   * Callback for zoom activity
   *
   * @access private
   */

  handleZoomEvent: function() {
    this.updateZoomDisplay();
  },

  /**
   * Applies the current zoom state to the visual display
   *
   * @access private
   */

  updateZoomDisplay: function(animatedTransition) {
    let currentZoomState = this._zoomControl
      , currentTranslation = this.getCurrentTranslation()
      , currentScale = this.getCurrentScale();

    if (animatedTransition) {
      this.mainGroup.transition().duration(500).attr('transform',
        'translate(' + currentZoomState.translate() + ') scale(' + currentZoomState.scale() + ')');
    } else {
      this.mainGroup.attr("transform", "translate(" + currentTranslation + ")" + " scale(" + currentScale + ")");
    }

    this.adjustLabels();
  },

  /**
   * Sets the zoom level to a specific scale factor (0 to 1).
   *
   * @access public
   */

  setZoomLevel: function(scaleFactor) {
    let zoomController, referencePoint, currentPosition;

    if (!this.isDisplayReady()) {
      // store the scale for when render() is invoked and then exit
      this.viewSettings.initialZoomLevel = scaleFactor;
      return this;
    }

    zoomController = this._zoomControl;
    referencePoint = [this.viewSettings.canvasWidth / 2, this.viewSettings.canvasHeight / 2];
    currentPosition = this.getCanvasCoordinates(referencePoint);

    // adjust zoom controller's scale
    zoomController.scale(scaleFactor);

    // maintain the graph's relative position
    this.moveToCoordinates(referencePoint, currentPosition);

    // apply the new zoom with an animation
    this.updateZoomDisplay(true);

    return this;
  },

  /**
   * Magnifies the view
   *
   * @access public
   */

  increaseZoom: function() {
    let currentScale = this.getCurrentScale()
      , nextScaleFactor = Math.pow(2, Math.floor(Math.log(currentScale) / Math.LN2) + 1);

    nextScaleFactor = Math.min(nextScaleFactor, this.viewSettings.zoomLevelLimits[1]);

    return this.setZoomLevel(nextScaleFactor);
  },

  /**
   * Shrinks the view
   *
   * @access public
   */

  decreaseZoom: function() {
    let currentScale = this.getCurrentScale();
    let nextScaleFactor = Math.pow(2, Math.ceil(Math.log(currentScale) / Math.LN2) - 1);

    nextScaleFactor = Math.max(nextScaleFactor, this.viewSettings.zoomLevelLimits[0]);

    return this.setZoomLevel(nextScaleFactor);
  },

  /**
   * Based on current zoom and element size, determines if its label should be shown
   *
   * @access private
   */

  isLabelVisible: function(dataItem) {
    let currentScale = this.getCurrentScale();
    let visibilityResult = this.sizeToLabelScale(this.getElementSize(dataItem) || 1);

    return (currentScale * visibilityResult > 0.8 || currentScale > 2.2);
  },

  /**
   * Utility to determine the CSS display attribute for an element's label.
   *
   * @access private
   */

  getLabelDisplayStatus: function(dataItem) {
    if (this.isLabelVisible(dataItem) && this.isElementUnitVisible(dataItem)) {
      return "";
    }

    return "none";
  },

  /**
   * Utility to determine the stroke color for a connection path.
   *
   * @access private
   */

  getConnectionLineColor: function(connectionData) {
    let startElement = connectionData.source,
      endElement = connectionData.target;

    if (this.getElementSize(endElement) > this.getElementSize(startElement)) {
      return this.getGroupColor(endElement);
    } else {
      return this.getGroupColor(startElement);
    }
  },

  /**
   * Draws the entire chart.
   *
   * @access public
   */

  drawElements: function() {
    let currentScope = this;

    this.initializeView();

    function calculateCircleRadius(dataPoint) { return currentScope.sizeToRadiusScale(currentScope.getElementSize(dataPoint) || 1); }

    let physicsSimulation = this.physicsSimulation = dataVizLib.layout.force()
      .nodes(this.elements)
      .links(this.connections)
      .size([this.viewSettings.canvasWidth, this.viewSettings.canvasHeight])
      .linkDistance(standardConfigs.connectionDistance)
      .charge(standardConfigs.chartRepulsion)
      .gravity(standardConfigs.gravitationalPull)
      .on("tick", simulationTick)
      .start();

    this.dataVizPaths = this.mainGroup.append("svg:g").selectAll("path")
      .data(physicsSimulation.links())
      .enter().append("svg:path")
      .attr("stroke", associate(this, this.getConnectionLineColor))
      .attr("stroke-width", LINE_THICKNESS)
      .attr("fill", "none");

    let chartNode = this.dataVizElements = this.mainGroup.selectAll(".node")
      .data(physicsSimulation.nodes())
      .enter().append("g")
      .attr("class", "node")
      .on("mouseover", associate(this, this.onElementHover))
      .on("mouseout", associate(this, this.onElementUnhover))
      .on("click", associate(this, this.onElementClick));

    this.dataVizCircles = chartNode.append("circle")
      .style("fill", associate(this, this.getGroupColor))
      .attr("r", calculateCircleRadius);

    this.dataVizLabels = chartNode.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("display", "none")
      .text(function(dataPoint) { return currentScope.getElementText(dataPoint); });

    function simulationTick(eventData) {
      // let completionPercentage = Math.round((1 - (eventData.alpha * 10 - 0.1)) * 100);

      if (physicsSimulation.alpha() < standardConfigs.forceStabilityThreshold) {
        currentScope.manageCollisions();

        // halt the simulation once stable
        physicsSimulation.stop();

        currentScope.refreshElementPositions();
        currentScope.refreshConnectionPositions();

        // center the entire diagram
        currentScope._alignCenter();

        // display the canvas after rendering is complete
        currentScope.revealCanvas();

        currentScope.updateZoomDisplay();
        currentScope.signal("ready");
      }
    }

    if (this.hasPendingFilters() || this.hasPendingFocus()) {
      this.refreshDisplay();
    }

    return this;
  },

  /**
   * Makes the chart visible
   *
   * @access private
   */

  revealCanvas: function() {