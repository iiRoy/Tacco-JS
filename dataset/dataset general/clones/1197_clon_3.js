var applyContext = require("bind")
  , EventNexus = require("emitter")
  , dataViz = require("d3")
  , toPredicate = require('to-function')
  , HoverPanel = require("./tooltip");

// Core Configuration Properties
var VizConfig = {
  NODE_UNSELECTED_FILL: "rgba(0,0,0,0)", // More explicit transparent
  EDGE_THICKNESS: 0.3,
  SELECTED_EDGE_THICKNESS: 1.5,
  NODE_BORDER_COLOR: "#FFFFFF",
  MAIN_CONTAINER_CLASS: "network-visualizer",
  NODE_SIZE_MAPPING: [5, 45], // Adjusted range slightly
  LABEL_VISIBILITY_RANGE: [0.01, 1.0], // Adjusted range
  INITIAL_ALPHA_DECAY: 0.45, // Collision alpha
  FORCE_ALPHA_THRESHOLD: 0.015, // Force alpha limit
  EDGE_LENGTH_DEFAULT: 65, // Link distance
  REPULSION_STRENGTH: -320, // Graph charge
  GRAVITY_FORCE: 0.12, // Gravity
  CANVAS_ZOOM_EXTENT: [0.25, 2.5], // Zoom scale extent
  HOVER_INFO_TEMPLATE: "<div>Node: {{text}}</div> <div>Size: {{size}}</div> <div>ID: {{id}}</div>", // Added ID
  DEFAULT_WIDTH: 1280, // Slightly different default
  DEFAULT_HEIGHT: 720
};

// Recognized attributes for node data
var PERMITTED_NODE_FIELDS = ['id', 'size', 'cluster', 'text', 'value']; // Added 'value'

/**
 * Constructs a new `NetworkCanvas` instance for visualizing node-link graphs.
 *
 * @constructor NetworkCanvas
 */

function NetworkCanvas(containerElement, nodeDataSet, edgeDataSet, userSettings) {

  // Main DOM element for the visualization
  this.containerElement = containerElement;

  // Merged visualization options
  this.renderingOptions = {};

  // Ensure userSettings is an object
  userSettings = userSettings || {};

  // Merge default and user-provided options
  this.renderingOptions.canvasWidth = userSettings.width || VizConfig.DEFAULT_WIDTH;
  this.renderingOptions.canvasHeight = userSettings.height || VizConfig.DEFAULT_HEIGHT;
  this.renderingOptions.clusterColorScale = dataViz.scale.category20(); // Renamed and kept d3
  this.renderingOptions.customClusterColors = userSettings.colors || {};
  this.renderingOptions.collisionAlpha = userSettings.collisionAlpha || VizConfig.INITIAL_ALPHA_DECAY;
  this.renderingOptions.initialZoomLevel = userSettings.initialScale;
  this.renderingOptions.zoomRange = userSettings.zoomScaleExtent || userSettings.scaleExtent || VizConfig.CANVAS_ZOOM_EXTENT;
  this.renderingOptions.edgeStrength = userSettings.linkStrength || 1; // Added linkStrength from defaults

  // Store raw input data
  this.sourceData = {
    nodes: nodeDataSet,
    links: edgeDataSet
  };

  // Initialize internal state variables
  this.initializeVisualState();

  // Conditionally activate the hover info panel
  if (userSettings.tooltip) {
    this.activateInfoPanel(userSettings.tooltip);
  }

  // Flag to indicate if rendering has completed
  this.isRendered = false;
}

NetworkCanvas.releaseTag = "1.0.0-beta"; // Changed version to releaseTag

// Extend NetworkCanvas prototype with core functionalities
NetworkCanvas.prototype = {
  constructor: NetworkCanvas, // Explicitly set constructor

  /**
   * Sets up the visualization environment.
   *
   * @api public
   */
  setupVisualization: function() {
    var instanceRef = this;
    var displayContainer = this.getElement();

    // Process raw data into D3-compatible formats
    this.processInputData(this.sourceData.nodes, this.sourceData.links);
    // Create D3 scales for visual properties
    this.deriveVisualScales();
    // Configure D3 zoom behavior
    this.configureInteractionZoom();

    // Clear existing content within the container
    displayContainer.innerHTML = "";

    // Append main SVG canvas and configure it
    var svgCanvas = displayContainer.attr("class", VizConfig.MAIN_CONTAINER_CLASS)
      .append("svg")
      .attr("width", this.renderingOptions.canvasWidth)
      .attr("height", this.renderingOptions.canvasHeight)
      .attr("pointer-events", "all") // Enable all pointer events for interaction
      .call(this.zoomHandler.on("zoom", applyContext(this, this.handleZoomInteraction))
        .scaleExtent(this.renderingOptions.zoomRange));

    // Create a group element for drawing graph elements, initially hidden
    this.drawingLayer = svgCanvas.append('svg:g').style('display', 'none');

    // Store initial click coordinates to differentiate clicks from drags
    var lastClickCoords = {
      x: 0,
      y: 0
    };

    displayContainer.on("mousedown", function() {
      lastClickCoords.x = dataViz.event.x;
      lastClickCoords.y = dataViz.event.y;
    });

    displayContainer.on("click", function() {
      // Only trigger reset if it's a pure click (not a drag)
      if (dataViz.event.x === lastClickCoords.x && dataViz.event.y === lastClickCoords.y) {
        instanceRef.resetVisualizationState();
      }
    });

    this.isRendered = true; // Mark as rendered after initial setup
  },

  /**
   * Initializes or updates the D3 zoom behavior.
   *
   * @api private
   */
  configureInteractionZoom: function() {
    // Instantiate D3 zoom behavior
    this.zoomHandler = dataViz.behavior.zoom();

    // Apply initial zoom level if specified in options
    if (this.renderingOptions.initialZoomLevel != null) {
      this.zoomHandler.scale(this.renderingOptions.initialZoomLevel);
    }
  },

  /**
   * Processes raw node and link data into structured formats for D3.
   *
   * @param {Array} rawNodes - The array of raw node objects.
   * @param {Array} rawLinks - The array of raw link objects (e.g., [sourceId, targetId]).
   * @api private
   */
  processInputData: function(rawNodes, rawLinks) {
    var instanceContext = this;
    var nodeRegistry = new Map(); // Using Map for node lookup for Type III
    var clusterMetadata = new Map(); // Using Map for cluster metadata
    var largestNodeMetric = 0;
    var inboundConnections = new Map();
    var outboundConnections = new Map();
    var processedEdges = [];

    // Helper functions for attribute extraction
    var retrieveNodeCluster = applyContext(this, this.getClusterIdentifier);
    var getNodeDimension = applyContext(this, this.getNodeSize);

    // First pass: Process nodes and build registry
    rawNodes.forEach(function(nodeItem) {
      var clusterId = retrieveNodeCluster(nodeItem);

      largestNodeMetric = Math.max(largestNodeMetric, getNodeDimension(nodeItem));
      nodeRegistry.set(nodeItem.id, nodeItem); // Store node by ID

      // Initialize cluster metadata if not already present
      if (clusterId != null && !clusterMetadata.has(clusterId)) {
        var assignedColor = instanceContext.renderingOptions.customClusterColors[clusterId] || instanceContext.renderingOptions.clusterColorScale(clusterId);
        clusterMetadata.set(clusterId, {
          color: assignedColor
        });
      }
    });

    // Second pass: Process links and build connection maps
    rawLinks.forEach(function(linkItem) {
      var sourceId = linkItem[0];
      var targetId = linkItem[1];

      var sourceNode = nodeRegistry.get(sourceId);
      var targetNode = nodeRegistry.get(targetId);

      // Skip invalid links (where source or target node is missing)
      if (!sourceNode || !targetNode) {
        console.warn("Skipping invalid link due to missing node:", linkItem);
        return;
      }

      // Record outbound connection
      if (!outboundConnections.has(sourceId)) {
        outboundConnections.set(sourceId, new Set());
      }
      outboundConnections.get(sourceId).add(targetId);

      // Record inbound connection
      if (!inboundConnections.has(targetId)) {
        inboundConnections.set(targetId, new Set());
      }
      inboundConnections.get(targetId).add(sourceId);

      // Add to the list of processed links for D3 force layout
      processedEdges.push({
        source: sourceNode,
        target: targetNode
      });
    });

    // Update instance properties
    this.activeNodes = rawNodes; // Keep a reference to the active nodes
    this.processedEdges = processedEdges;
    this.largestNodeMetric = largestNodeMetric;
    this.inboundConnections = inboundConnections;
    this.outboundConnections = outboundConnections;
    this.nodeRegistry = nodeRegistry;
    this.clusterMetadata = clusterMetadata;
  },

  /**
   * Establishes D3 scales for visual mapping of data properties.
   *
   * @api private
   */
  deriveVisualScales: function() {
    this.nodeSizeMapper = dataViz.scale.sqrt().domain([1, this.largestNodeMetric]).range(VizConfig.NODE_SIZE_MAPPING);
    this.labelVisibilityThreshold = dataViz.scale.log().domain([1, this.largestNodeMetric]).range(VizConfig.LABEL_VISIBILITY_RANGE);
  },

  /**
   * Computes the center of mass coordinates for the currently displayed nodes.
   *
   * @api private
   */
  calculateMassCentroid: function() {
    var instanceRef = this;
    var cumulativeX = 0,
      cumulativeY = 0,
      totalMetricSum = 0;

    // Iterate over rendered nodes to sum weighted positions
    this.renderedNodeElements.each(function(nodeData) {
      var nodeSize = instanceRef.getNodeSize(nodeData);
      cumulativeX += nodeData.x * nodeSize;
      cumulativeY += nodeData.y * nodeSize;
      totalMetricSum += nodeSize;
    });

    // Calculate average position
    this.centroidX = cumulativeX / totalMetricSum;
    this.centroidY = cumulativeY / totalMetricSum;
    this.massCentroidCoords = [this.centroidX, this.centroidY];
  },


  /**
   * Defines a custom accessor function for a node attribute.
   * Allows standardized attributes to be derived from node data.
   *
   * @param {string} attributeName - The name of the attribute (e.g., 'size', 'cluster').
   * @param {Function} accessorFunction - A function that takes a node object and returns the attribute's value.
   * @api private
   */
  defineNodeAccessor: function(attributeName, accessorFunction) {
    if (PERMITTED_NODE_FIELDS.includes(attributeName)) {
      this.customAccessors[attributeName] = accessorFunction;
    } else {
      console.warn("Attempted to define accessor for non-permitted field:", attributeName);
    }
    return this;
  },

  /**
   * Retrieves the value of a standardized node attribute, using custom accessors if defined.
   *
   * @param {string} propertyName - The name of the attribute (e.g., 'id', 'size').
   * @param {object} targetNode - The node object.
   * @returns {*} The value of the attribute.
   * @api private
   */
  retrieveNodeValue: function(propertyName, targetNode) {
    var customAccessor = this.customAccessors[propertyName];

    if (typeof customAccessor === "function") {
      return customAccessor(targetNode);
    } else if (targetNode.hasOwnProperty(propertyName)) {
      return targetNode[propertyName];
    }
    return undefined; // Explicitly return undefined if not found
  },

  /**
   * Event handler for D3 zoom events.
   *
   * @api private
   */
  handleZoomInteraction: function() {
    this.updateDisplayTransform();
  },

  /**
   * Updates the visual transform (translate and scale) of the graph drawing layer.
   *
   * @param {boolean} [shouldAnimate=false] - Whether the transformation should be animated.
   * @api private
   */
  updateDisplayTransform: function(shouldAnimate = false) {
    var currentTranslation = this.zoomHandler.translate();
    var currentScaleFactor = this.zoomHandler.scale();

    var transformString = "translate(" + currentTranslation + ") scale(" + currentScaleFactor + ")";

    if (shouldAnimate) {
      this.drawingLayer.transition().duration(500).attr('transform', transformString);
    } else {
      this.drawingLayer.attr("transform", transformString);
    }

    this.adjustLabelVisibility(); // Update label visibility based on new scale
  },

  /**
   * Sets the overall zoom level of the visualization.
   *
   * @param {number} targetScaleFactor - The desired zoom scale (e.g., 0.5 for 50%, 2 for 200%).
   * @api public
   */
  setZoomLevel: function(targetScaleFactor) {
    if (!this.isRendered) {
      // If not yet rendered, store the scale for when rendering occurs
      this.renderingOptions.initialZoomLevel = targetScaleFactor;
      return this;
    }

    var zoomHandler = this.zoomHandler;
    var centerPointCoords = [this.renderingOptions.canvasWidth / 2, this.renderingOptions.canvasHeight / 2];
    var worldCoordsAtCenter = this.mapScreenToWorldCoords(centerPointCoords);

    // Apply the new scale to the zoom handler
    zoomHandler.scale(targetScaleFactor);

    // Adjust translation to keep the center point fixed
    this.repositionViewTo(centerPointCoords, worldCoordsAtCenter);

    // Apply the zoom to the view with animation
    this.updateDisplayTransform(true);

    return this;
  },

  /**
   * Increases the zoom level (zooms in).
   *
   * @api public
   */
  magnifyView: function() {
    var currentZoomFactor = this.getZoomFactor();
    // Calculate next zoom step, typically doubling or similar factor
    var nextZoomFactor = Math.pow(2, Math.floor(Math.log2(currentZoomFactor)) + 1);

    // Clamp to maximum allowed zoom
    nextZoomFactor = Math.min(nextZoomFactor, this.renderingOptions.zoomRange[1]);

    return this.setZoomLevel(nextZoomFactor);
  },

  /**
   * Decreases the zoom level (zooms out).
   *
   * @api public
   */
  minifyView: function() {
    var currentZoomFactor = this.getZoomFactor();
    // Calculate next zoom step, typically halving or similar factor
    var nextZoomFactor = Math.pow(2, Math.ceil(Math.log2(currentZoomFactor)) - 1);

    // Clamp to minimum allowed zoom
    nextZoomFactor = Math.max(nextZoomFactor, this.renderingOptions.zoomRange[0]);

    return this.setZoomLevel(nextZoomFactor);
  },

  /**
   * Determines if a node's text label should be displayed based on zoom and node size.
   *
   * @param {object} nodeData - The data object for the node.
   * @returns {boolean} True if the label should be displayed, false otherwise.
   * @api private
   */
  canDisplayNodeLabel: function(nodeData) {
    var currentZoomFactor = this.getZoomFactor();
    var visibilityMetric = this.labelVisibilityThreshold(this.getNodeSize(nodeData) || 1);

    // Labels are shown if the scaled metric is above a threshold or if zoom is very high
    return (currentZoomFactor * visibilityMetric > 0.75 || currentZoomFactor > 2.0); // Slightly adjusted thresholds
  },

  /**
   * Returns the CSS display property value for a node's label.
   *
   * @param {object} nodeData - The data object for the node.
   * @returns {string} "block" or "none".
   * @api private
   */
  getNodeLabelDisplayMode: function(nodeData) {
    if (this.canDisplayNodeLabel(nodeData) && this.isElementCurrentlyVisible(nodeData)) {
      return "block";
    }
    return "none";
  },

  /**
   * Determines the stroke color for an edge based on the cluster colors of its connected nodes.
   * Prioritizes the larger node's cluster color.
   *
   * @param {object} edgeData - The data object for the edge (link).
   * @returns {string} The CSS color string.
   * @api private
   */
  getEdgeStrokeColor: function(edgeData) {
    const originNode = edgeData.source;
    const destinationNode = edgeData.target;

    return (this.getNodeSize(destinationNode) > this.getNodeSize(originNode)) ?
      this.retrieveClusterHue(destinationNode) :
      this.retrieveClusterHue(originNode);
  },

  /**
   * Initiates the rendering process for the graph visualization.
   *
   * @api public
   */
  commenceVisualization: function() {
    var instanceContext = this;

    // Ensure initial setup is complete
    this.setupVisualization();

    // Helper function for node radius calculation
    function computeNodeRadius(nodeData) {
      return instanceContext.nodeSizeMapper(instanceContext.getNodeSize(nodeData) || 1);
    }

    // Initialize D3 force layout simulation
    var physicsEngine = this.physicsEngine = dataViz.layout.force()
      .nodes(this.activeNodes)
      .links(this.processedEdges)
      .size([this.renderingOptions.canvasWidth, this.renderingOptions.canvasHeight])
      .linkDistance(VizConfig.EDGE_LENGTH_DEFAULT)
      .charge(VizConfig.REPULSION_STRENGTH)
      .gravity(VizConfig.GRAVITY_FORCE)
      .on("tick", simulationStep) // Attach tick handler
      .start();

    // Render edges (paths)
    this.edgePathElements = this.drawingLayer.append("svg:g").selectAll("path")
      .data(physicsEngine.links())
      .enter().append("svg:path")
      .attr("stroke", applyContext(this, this.getEdgeStrokeColor))
      .attr("stroke-width", VizConfig.EDGE_THICKNESS)
      .attr("fill", "none");

    // Render node groups (circles + text)
    this.nodeGroupElements = this.drawingLayer.selectAll(".node-group")
      .data(physicsEngine.nodes())
      .enter().append("g")
      .attr("class", "node-group")
      .on("mouseover", applyContext(this, this.handleNodeHoverStart))
      .on("mouseout", applyContext(this, this.handleNodeHoverEnd))
      .on("click", applyContext(this, this.handleNodeSelection));

    // Append circles to node groups
    this.nodeCircleShapes = this.nodeGroupElements.append("circle")
      .style("fill", applyContext(this, this.retrieveClusterHue))
      .attr("r", computeNodeRadius);

    // Append text labels to node groups
    this.nodeLabelTexts = this.nodeGroupElements.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("display", "none") // Labels initially hidden
      .text(function(nodeData) {
        return instanceContext.getNodeText(nodeData);
      });

    /**
     * Callback function for each tick of the D3 force simulation.
     *
     * @param {object} event - The D3 event object for the tick.
     */
    function simulationStep(event) {
      // Stop condition for the force layout
      if (physicsEngine.alpha() < VizConfig.FORCE_ALPHA_THRESHOLD) {
        instanceContext.resolveNodeOverlaps(); // Apply collision detection
        physicsEngine.stop(); // Stop the simulation once stable

        // Update positions of visual elements
        instanceContext.repositionVisualNodes();
        instanceContext.realignVisualEdges();

        // Center the entire graph view
        instanceContext.centerViewOnMass();

        // Make the canvas visible and refresh zoom state
        instanceContext.revealCanvasElements();
        instanceContext.updateDisplayTransform();
        instanceContext.emit("vizReady"); // Emit a custom event when rendering is complete
        instanceContext._isRenderingInProgress = false;
      }
    }

    // Apply any initial filters or focus states if present
    if (this.isFilteringActive() || this.isFocusingActive()) {
      this.refreshVisualization();
    }

    this._isRenderingInProgress = true;
    return this;
  },

  /**
   * Makes the main drawing layer visible.
   *
   * @api private
   */
  revealCanvasElements: function() {
    this.drawingLayer.style('display', 'block');
  },

  // --- Start of new/modified helper methods and properties for Type III cloning ---

  /**
   * Initializes internal state variables for the graph.
   * Renamed from resetState.
   * @api private
   */
  initializeVisualState: function() {
    this.customAccessors = {}; // Stores custom attribute accessors
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.currentFilters = [];
    this.currentFocus = null;
    this.broadcaster = new EventNexus(); // Using new EventNexus
  },

  /**
   * Activates the hover info panel with a given template or default.
   * Renamed from tooltip.
   * @param {string|object} panelConfig - Template string or configuration object for the panel.
   * @api private
   */
  activateInfoPanel: function(panelConfig) {
    var template = (typeof panelConfig === 'string') ? panelConfig : (panelConfig && panelConfig.template) || VizConfig.HOVER_INFO_TEMPLATE;
    this.hoverPanel = new HoverPanel(template);
    // Bind tooltip to body or a specific element
    this.hoverPanel.bindTo(this.containerElement.node());
  },

  /**
   * Returns the D3 selection for the main container element.
   * Renamed from getElement.
   * @returns {dataViz.selection}
   * @api private
   */
  getElement: function() {
    return dataViz.select(this.containerElement);
  },

  /**
   * Returns the current zoom factor.
   * @returns {number}
   * @api private
   */
  getZoomFactor: function() {
    return this.zoomHandler ? this.zoomHandler.scale() : (this.renderingOptions.initialZoomLevel || 1);
  },

  /**
   * Returns the current translation array.
   * @returns {Array<number>}
   * @api private
   */
  getTranslation: function() {
    return this.zoomHandler ? this.zoomHandler.translate() : [0, 0];
  },

  /**
   * Maps screen coordinates to world coordinates based on current zoom/pan.
   * Renamed from location.
   * @param {Array<number>} screenCoords - [x, y] screen coordinates.
   * @returns {Array<number>} - [x, y] world coordinates.
   * @api private
   */
  mapScreenToWorldCoords: function(screenCoords) {
    var currentTranslation = this.getTranslation();
    var currentScaleFactor = this.getZoomFactor();
    return [
      (screenCoords[0] - currentTranslation[0]) / currentScaleFactor,
      (screenCoords[1] - currentTranslation[1]) / currentScaleFactor
    ];
  },

  /**
   * Repositions the view so that a world coordinate is at a specific screen coordinate.
   * Renamed from translateTo.
   * @param {Array<number>} screenPoint - The [x, y] screen coordinates to move to.
   * @param {Array<number>} worldPoint - The [x, y] world coordinates to align.
   * @api private
   */
  repositionViewTo: function(screenPoint, worldPoint) {
    var currentScaleFactor = this.getZoomFactor();
    var newTranslation = [
      screenPoint[0] - worldPoint[0] * currentScaleFactor,
      screenPoint[1] - worldPoint[1] * currentScaleFactor
    ];
    this.zoomHandler.translate(newTranslation);
  },

  /**
   * Resets the visualization to its initial state, clearing selections and filters.
   * Renamed from reset.
   * @api public
   */
  resetVisualizationState: function() {
    this.selectedNodeId = null;
    this.currentFilters = [];
    this.currentFocus = null;
    this.refreshVisualization(); // Re-render with cleared state
    this.broadcaster.emit("reset");
  },

  /**
   * Updates the positions of node elements based on force simulation results.
   * Renamed from updateNodesPosition.
   * @api private
   */
  repositionVisualNodes: function() {
    this.nodeGroupElements.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  },

  /**
   * Updates the positions of edge path elements.
   * Renamed from updateLinksPosition.
   * @api private
   */
  realignVisualEdges: function() {
    this.edgePathElements.attr("d", function(d) {
      return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
    });
  },

  /**
   * Centers the entire view on the calculated mass centroid of the graph.
   * Renamed from _center.
   * @api private
   */
  centerViewOnMass: function() {
    this.calculateMassCentroid(); // Ensure centroid is up-to-date
    var centerPointCoords = [this.renderingOptions.canvasWidth / 2, this.renderingOptions.canvasHeight / 2];
    this.repositionViewTo(centerPointCoords, this.massCentroidCoords);
    this.updateDisplayTransform(true); // Animate centering
  },

  /**
   * Applies collision detection and resolution to nodes.
   * Renamed from handleCollisions.
   * @api private
   */
  resolveNodeOverlaps: function() {
    var instanceRef = this;
    var quadtree = dataViz.geom.quadtree(this.activeNodes);
    this.activeNodes.forEach(function(node) {
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        var r = instanceRef.nodeSizeMapper(instanceRef.getNodeSize(node) || 1) + 5; // Add padding
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r2 = r + instanceRef.nodeSizeMapper(instanceRef.getNodeSize(quad.point) || 1);
          if (l < r2) {
            l = (l - r2) / l * instanceRef.renderingOptions.collisionAlpha;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > node.x + r || x2 < node.x - r || y1 > node.y + r || y2 < node.y - r;
      });
    });
  },

  /**
   * Updates the display property of node text labels based on current zoom.
   * Renamed from updateTitles.
   * @api private
   */
  adjustLabelVisibility: function() {
    var instanceRef = this;
    this.nodeLabelTexts.style("display", function(d) {
      return instanceRef.getNodeLabelDisplayMode(d);
    });
  },

  /**
   * Gets the cluster identifier for a given node.
   * Renamed from getCluster.
   * @param {object} nodeData - The node object.
   * @returns {*} The cluster ID.
   * @api private
   */
  getClusterIdentifier: function(nodeData) {
    return this.retrieveNodeValue('cluster', nodeData);
  },

  /**
   * Gets the size metric for a given node.
   * Renamed from getSize.
   * @param {object} nodeData - The node object.
   * @returns {number} The node size.
   * @api private
   */
  getNodeSize: function(nodeData) {
    return this.retrieveNodeValue('size', nodeData) || 1; // Default to 1 if size is missing
  },

  /**
   * Gets the text label for a given node.
   * Renamed from getText.
   * @param {object} nodeData - The node object.
   * @returns {string} The node text.
   * @api private
   */
  getNodeText: function(nodeData) {
    return this.retrieveNodeValue('text', nodeData) || String(this.retrieveNodeValue('id', nodeData)); // Fallback to ID
  },

  /**
   * Retrieves the color associated with a node's cluster.
   * Renamed from getClusterColor.
   * @param {object} nodeData - The node object.
   * @returns {string} The cluster color.
   * @api private
   */
  retrieveClusterHue: function(nodeData) {
    var clusterId = this.getClusterIdentifier(nodeData);
    var clusterInfo = this.clusterMetadata.get(clusterId);
    return clusterInfo ? clusterInfo.color : VizConfig.NODE_UNSELECTED_FILL; // Default to transparent if no cluster
  },

  /**
   * Placeholder for checking if a node is currently visible (e.g., not filtered out).
   * Renamed from isNodeVisible.
   * @param {object} nodeData - The node object.
   * @returns {boolean} True if visible, false otherwise.
   * @api private
   */
  isElementCurrentlyVisible: function(nodeData) {
    // This is a placeholder; actual implementation would check against filters/focus
    return true;
  },

  /**
   * Checks if any filters are currently active.
   * Renamed from hasUnappliedFilters.
   * @returns {boolean}
   * @api private
   */
  isFilteringActive: function() {
    return this.currentFilters && this.currentFilters.length > 0;
  },

  /**
   * Checks if any focus is currently active.
   * Renamed from hasUnappliedFocus.
   * @returns {boolean}
   * @api private
   */
  isFocusingActive: function() {
    return this.currentFocus != null;
  },

  /**
   * Refreshes the entire visualization, applying filters, focus, etc.
   * Renamed from update.
   * @api public
   */
  refreshVisualization: function() {
    // This method would contain logic to re-evaluate node/link visibility
    // based on `this.currentFilters` and `this.currentFocus`,
    // then update D3 selections. For Type III, we just need the call site.
    console.log("Refreshing visualization (filters/focus not implemented in this clone).");
  },

  /**
   * Handler for node mouseover event.
   * Renamed from onMouseOver.
   * @param {object} nodeData - The data of the hovered node.
   * @api private
   */
  handleNodeHoverStart: function(nodeData) {
    this.hoveredNodeId = nodeData.id;
    // Highlight the node
    dataViz.select(dataViz.event.currentTarget).select("circle")
      .attr("stroke", VizConfig.NODE_BORDER_COLOR)
      .attr("stroke-width", VizConfig.SELECTED_EDGE_THICKNESS); // Use selected width for border

    // Show tooltip
    if (this.hoverPanel) {
      this.hoverPanel.show(nodeData, dataViz.event);
    }
  },

  /**
   * Handler for node mouseout event.
   * Renamed from onMouseOut.
   * @param {object} nodeData - The data of the previously hovered node.
   * @api private
   */
  handleNodeHoverEnd: function(nodeData) {
    this.hoveredNodeId = null;
    // Remove highlight
    dataViz.select(dataViz.event.currentTarget).select("circle")
      .attr("stroke", VizConfig.NODE_BORDER_COLOR)
      .attr("stroke-width", 1); // Reset to default border width

    // Hide tooltip
    if (this.hoverPanel) {
      this.hoverPanel.hide();
    }
  },

  /**
   * Handler for node click event.
   * Renamed from onCircleClick.
   * @param {object} nodeData - The data of the clicked node.
   * @api private
   */
  handleNodeSelection: function(nodeData) {
    this.selectedNodeId = nodeData.id;
    this.broadcaster.emit("nodeSelected", nodeData);
    // Add visual feedback for selection if desired
  },

  /**
   * Emits a custom event through the internal event broadcaster.
   * Renamed from emit.
   * @param {string} eventName - The name of the event.
   * @param {*} [data] - Optional data to pass with the event.
   * @api public
   */
  emit: function(eventName, data) {
    this.broadcaster.emit(eventName, data);
  },

  /**
   * Registers an event listener for a custom event.
   * Renamed from on.
   * @param {string} eventName - The name of the event.
   * @param {Function} listener - The callback function.
   * @api public
   */
  on: function(eventName, listener) {
    this.broadcaster.on(eventName, listener);
  },

  /**
   * Removes an event listener.
   * Renamed from off.
   * @param {string} eventName - The name of the event.
   * @param {Function} listener - The callback function to remove.
   * @api public
   */
  off: function(eventName, listener) {
    this.broadcaster.off(eventName, listener);
  }

  // --- End of new/modified helper methods and properties ---
};