// Custom module for utility operations
const utilityBelt = {
  // Replacement for 'bind'
  associate: (context, method) => function(...args) { return method.apply(context, args); },

  // Replacement for 'to-function'
  resolveAccessor: (dataObject, keyOrFunction) => {
    if (typeof keyOrFunction === 'function') {
      return keyOrFunction(dataObject);
    }
    return dataObject[keyOrFunction];
  },

  // Basic event dispatcher (replacement for 'emitter')
  createMessenger: () => {
    const registry = new Map();
    return {
      signOn: (topic, handler) => {
        if (!registry.has(topic)) registry.set(topic, new Set());
        registry.get(topic).add(handler);
      },
      signOff: (topic, handler) => {
        if (registry.has(topic)) registry.get(topic).delete(handler);
      },
      broadcast: (topic, ...payload) => {
        if (registry.has(topic)) {
          registry.get(topic).forEach(h => h(...payload));
        }
      }
    };
  }
};

// Configuration parameters (replacement for constants and defaults)
const VisualConfig = {
  NODE_SIZE_LIMITS: [6, 40],
  LABEL_DISPLAY_THRESHOLDS: [0, 1],
  EDGE_THICKNESS: 0.3,
  HIGHLIGHT_EDGE_THICKNESS: 1.5,
  NODE_BORDER_COLOR: '#FFF',
  CANVAS_IDENTIFIER: 'visualizer-canvas',
  PRIMARY_WIDTH: 1200,
  PRIMARY_HEIGHT: 700,
  SIM_FRICTION_FACTOR: 0.5, // collisionAlpha
  SIM_ALPHA_THRESHOLD: 0.02, // forceAlphaLimit
  EDGE_PULL_FACTOR: 1, // linkStrength
  EDGE_LENGTH_PREFERENCE: 60, // linkDistance
  NODE_REPULSION_FORCE: -300, // graphCharge
  GLOBAL_PULL_FACTOR: 0.1, // gravity
  VIEW_SCALE_LIMITS: [0.3, 2.3], // zoomScaleExtent
  DEFAULT_NODE_LABEL_FORMAT: "<div>label: {{label}}</div> <div>magnitude: {{magnitude}}</div>", // tooltipTemplate
  NODE_ATTRIBUTES_ALLOWED: ['identity', 'magnitude', 'group', 'label'], // VALID_ATTRS
  UNHIGHLIGHTED_COLOR: "transparent"
};

// Color generation (replacement for d3.scale.category20)
const distinctColorPalette = (function() {
  const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]; // 12 hues
  const saturations = [70, 90];
  const lightness = [50, 65];
  let currentHueIndex = 0;
  let currentSaturationIndex = 0;
  let currentLightnessIndex = 0;
  const generatedColors = new Map();

  return {
    getColorForGroup: (groupId) => {
      if (!generatedColors.has(groupId)) {
        const h = hues[currentHueIndex];
        const s = saturations[currentSaturationIndex];
        const l = lightness[currentLightnessIndex];
        const color = `hsl(${h}, ${s}%, ${l}%)`;
        generatedColors.set(groupId, color);

        currentLightnessIndex = (currentLightnessIndex + 1) % lightness.length;
        if (currentLightnessIndex === 0) {
          currentSaturationIndex = (currentSaturationIndex + 1) % saturations.length;
          if (currentSaturationIndex === 0) {
            currentHueIndex = (currentHueIndex + 1) % hues.length;
          }
        }
      }
      return generatedColors.get(groupId);
    }
  };
})();

// Scaling functions (replacement for d3.scale.sqrt and d3.scale.log)
const ScaleService = {
  createProportionalScale: (inputDomain, outputRange) => {
    const inputMin = inputDomain[0], inputMax = inputDomain[1];
    const outputMin = outputRange[0], outputMax = outputRange[1];
    return (value) => {
      if (value <= inputMin) return outputMin;
      if (value >= inputMax) return outputMax;
      const normalized = (value - inputMin) / (inputMax - inputMin);
      return outputMin + normalized * (outputMax - outputMin);
    };
  },
  createLogarithmicScale: (inputDomain, outputRange) => {
    const inputMin = Math.log(inputDomain[0]), inputMax = Math.log(inputDomain[1]);
    const outputMin = outputRange[0], outputMax = outputRange[1];
    return (value) => {
      if (value <= inputDomain[0]) return outputMin;
      if (value >= inputDomain[1]) return outputMax;
      const normalized = (Math.log(value) - inputMin) / (inputMax - inputMin);
      return outputMin + normalized * (outputMax - outputMin);
    };
  }
};

// Placeholder for external tooltip utility
class InteractionHint {
  constructor(containerElement, contentTemplate) {
    this.container = containerElement;
    this.template = contentTemplate;
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: absolute; background: rgba(0,0,0,0.8); color: white; padding: 5px 10px;
      border-radius: 3px; pointer-events: none; opacity: 0; transition: opacity 0.2s;
      z-index: 1000; font-family: sans-serif; font-size: 12px;
    `;
    this.container.appendChild(this.element);
  }

  display(x, y, data) {
    let content = this.template;
    for (const key in data) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    }
    this.element.innerHTML = content;
    this.element.style.left = `${x + 10}px`;
    this.element.style.top = `${y + 10}px`;
    this.element.style.opacity = '1';
  }

  hide() {
    this.element.style.opacity = '0';
  }
}

// Main visualization class (replacement for Graph)
class NetworkVisualizer {
  constructor(canvasContainer, dataNodes, dataLinks, customOptions) {
    this.containerSpace = canvasContainer;
    this.preferences = {};
    this.messenger = utilityBelt.createMessenger();

    const mergedOptions = { ...VisualConfig, ...customOptions };
    this.preferences.canvasWidth = mergedOptions.width || VisualConfig.PRIMARY_WIDTH;
    this.preferences.canvasHeight = mergedOptions.height || VisualConfig.PRIMARY_HEIGHT;
    this.preferences.groupColorMap = mergedOptions.colors || {};
    this.preferences.frictionCoefficient = mergedOptions.collisionAlpha || VisualConfig.SIM_FRICTION_FACTOR;
    this.preferences.initialViewScale = mergedOptions.initialScale;
    this.preferences.viewScaleLimits = mergedOptions.zoomScaleExtent || mergedOptions.scaleExtent || VisualConfig.VIEW_SCALE_LIMITS;
    this.preferences.edgePull = mergedOptions.linkStrength || VisualConfig.EDGE_PULL_FACTOR;
    this.preferences.edgeLength = mergedOptions.linkDistance || VisualConfig.EDGE_LENGTH_PREFERENCE;
    this.preferences.nodeRepulsion = mergedOptions.graphCharge || VisualConfig.NODE_REPULSION_FORCE;
    this.preferences.globalPull = mergedOptions.gravity || VisualConfig.GLOBAL_PULL_FACTOR;
    this.preferences.simulationAlphaLimit = mergedOptions.forceAlphaLimit || VisualConfig.SIM_ALPHA_THRESHOLD;
    this.preferences.tooltipContent = mergedOptions.tooltipTemplate || VisualConfig.DEFAULT_NODE_LABEL_FORMAT;

    this.canvasElement = document.createElement('canvas');
    this.canvasElement.id = VisualConfig.CANVAS_IDENTIFIER;
    this.canvasElement.width = this.preferences.canvasWidth;
    this.canvasElement.height = this.preferences.canvasHeight;
    this.canvasElement.style.display = 'none'; // Initially hidden
    this.containerSpace.innerHTML = ''; // Clear original content
    this.containerSpace.appendChild(this.canvasElement);
    this.drawingContext = this.canvasElement.getContext('2d');

    this.managedAttributes = {}; // Replacement for this.attrs
    VisualConfig.NODE_ATTRIBUTES_ALLOWED.forEach(attr => {
      this.managedAttributes[attr] = node => node[attr]; // Default accessors
    });

    this.processedData = this.preprocessGraphData(dataNodes, dataLinks);
    this.setupScales();
    this.initializeViewTransform();

    this.simulationActive = false;
    this.currentAlpha = 1; // Simulation alpha
    this.simulationIterationCount = 0;
    this.lastClickPosition = { x: 0, y: 0 };
    this.isDraggingCanvas = false;
    this.dragStartPoint = { x: 0, y: 0 };
    this.draggedNode = null;

    if (mergedOptions.tooltip) {
      this.hintDisplay = new InteractionHint(this.containerSpace, this.preferences.tooltipContent);
    }
  }

  // Version property (replacement for Graph.version)
  static systemVersion = "0.1";

  // Public API to set attribute accessor (replacement for attr)
  defineAttributeAccessor(keyName, accessorFunction) {
    if (VisualConfig.NODE_ATTRIBUTES_ALLOWED.includes(keyName)) {
      this.managedAttributes[keyName] = accessorFunction;
    }
    return this;
  }

  // Internal helper to get node attribute value (replacement for nodeVal)
  retrieveNodeAttribute(keyName, nodeObject) {
    const accessor = this.managedAttributes[keyName];
    return utilityBelt.resolveAccessor(nodeObject, accessor);
  }

  // Pre-processing of nodes and links (replacement for compute)
  preprocessGraphData(rawNodes, rawLinks) {
    const internalNodes = new Map(); // Using Map for nodes
    let maxMagnitude = 0;
    const groupColorAssignments = { ...this.preferences.groupColorMap };
    const incomingConnections = new Map();
    const outgoingConnections = new Map();
    const internalLinks = [];

    rawNodes.forEach(node => {
      const nodeId = this.retrieveNodeAttribute('identity', node);
      if (!nodeId) return; // Node must have an ID
      node.x = Math.random() * this.preferences.canvasWidth;
      node.y = Math.random() * this.preferences.canvasHeight;
      node.vx = 0;
      node.vy = 0;
      node.fx = null; // Fixed X position
      node.fy = null; // Fixed Y position
      internalNodes.set(nodeId, node);
      maxMagnitude = Math.max(maxMagnitude, this.retrieveNodeAttribute('magnitude', node) || 0);

      const group = this.retrieveNodeAttribute('group', node);
      if (group != null && groupColorAssignments[group] == null) {
        groupColorAssignments[group] = distinctColorPalette.getColorForGroup(group);
      }
    });
    this.preferences.groupColorMap = groupColorAssignments; // Update with generated colors

    rawLinks.forEach(linkPair => {
      const sourceId = linkPair[0];
      const targetId = linkPair[1];
      const sourceNode = internalNodes.get(sourceId);
      const targetNode = internalNodes.get(targetId);

      if (!sourceNode || !targetNode) return;

      internalLinks.push({ source: sourceNode, target: targetNode });

      if (!outgoingConnections.has(sourceId)) outgoingConnections.set(sourceId, new Set());
      outgoingConnections.get(sourceId).add(targetId);

      if (!incomingConnections.has(targetId)) incomingConnections.set(targetId, new Set());
      incomingConnections.get(targetId).add(sourceId);
    });

    return {
      nodes: Array.from(internalNodes.values()), // Convert Map values to array
      links: internalLinks,
      maxNodeMagnitude: maxMagnitude,
      incomingEdges: incomingConnections,
      outgoingEdges: outgoingConnections,
      nodeDictionary: internalNodes
    };
  }

  // Creates necessary scales (replacement for computeScales)
  setupScales() {
    this.magnitudeToRadius = ScaleService.createProportionalScale(
      [1, this.processedData.maxNodeMagnitude || 1], VisualConfig.NODE_SIZE_LIMITS
    );
    this.magnitudeToLabelVisibility = ScaleService.createLogarithmicScale(
      [1, this.processedData.maxNodeMagnitude || 1], VisualConfig.LABEL_DISPLAY_THRESHOLDS
    );
  }

  // Initializes view transform for zoom/pan (replacement for initZoom)
  initializeViewTransform() {
    this.viewTransform = {
      x: 0,
      y: 0,
      scale: this.preferences.initialViewScale || 1
    };

    this.canvasElement.addEventListener('wheel', utilityBelt.associate(this, this.handleWheelScroll));
    this.canvasElement.addEventListener('mousedown', utilityBelt.associate(this, this.handleMouseDown));
    this.canvasElement.addEventListener('mousemove', utilityBelt.associate(this, this.handleMouseMove));
    this.canvasElement.addEventListener('mouseup', utilityBelt.associate(this, this.handleMouseUp));
    this.canvasElement.addEventListener('mouseout', utilityBelt.associate(this, this.handleMouseUp)); // Release drag on mouse out
  }

  // Core initialization and rendering start (replacement for init and render)
  beginVisualisation() {
    this.messenger.broadcast("visualisation:start");
    this.startSimulation();
    this.drawFrame(); // Initial draw
  }

  // Starts the force simulation (part of render)
  startSimulation() {
    this.simulationActive = true;
    this.currentAlpha = 1; // Reset alpha
    this.simulationIterationCount = 0;
    this.simulationLoop();
  }

  // Main simulation loop (replacement for d3.layout.force().on("tick", tick))
  simulationLoop() {
    if (!this.simulationActive) return;

    this.currentAlpha *= (1 - this.preferences.frictionCoefficient);
    this.simulationIterationCount++;

    if (this.currentAlpha < this.preferences.simulationAlphaLimit) {
      this.simulationActive = false;
      this.centerView(); // Replacement for _center()
      this.drawFrame();
      this.messenger.broadcast("visualisation:complete");
      this.showCanvas(); // Replacement for show()
      return;
    }

    this.applyForces();
    this.updateNodePositions();
    this.drawFrame(); // Redraw on each tick

    requestAnimationFrame(utilityBelt.associate(this, this.simulationLoop));
  }

  applyForces() {
    const nodes = this.processedData.nodes;
    const links = this.processedData.links;
    const center = { x: this.preferences.canvasWidth / 2, y: this.preferences.canvasHeight / 2 };

    // Reset forces
    nodes.forEach(node => {
      node.vx *= 0.6; // Apply some damping before new forces
      node.vy *= 0.6;
    });

    // Node repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        let dx = nodeB.x - nodeA.x;
        let dy = nodeB.y - nodeA.y;
        let distance = Math.sqrt(dx * dx + dy * dy) + 1; // Add 1 to prevent division by zero
        const force = this.preferences.nodeRepulsion / distance; // Negative for repulsion
        nodeA.vx -= dx * force;
        nodeA.vy -= dy * force;
        nodeB.vx += dx * force;
        nodeB.vy += dy * force;
      }
    }

    // Link attraction
    links.forEach(link => {
      const source = link.source;
      const target = link.target;
      let dx = target.x - source.x;
      let dy = target.y - source.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      const idealDistance = this.preferences.edgeLength;
      const force = this.preferences.edgePull * (distance - idealDistance) / distance;
      source.vx += dx * force;
      source.vy += dy * force;
      target.vx -= dx * force;
      target.vy -= dy * force;
    });

    // Gravity towards center
    nodes.forEach(node => {
      node.vx += (center.x - node.x) * this.preferences.globalPull;
      node.vy += (center.y - node.y) * this.preferences.globalPull;
    });
  }

  // Updates node positions based on velocities (part of tick)
  updateNodePositions() {
    this.processedData.nodes.forEach(node => {
      if (node.fx != null) node.x = node.fx;
      else node.x += node.vx * this.currentAlpha;

      if (node.fy != null) node.y = node.fy;
      else node.y += node.vy * this.currentAlpha;

      // Keep nodes within bounds (simple approach)
      node.x = Math.max(0, Math.min(this.preferences.canvasWidth, node.x));
      node.y = Math.max(0, Math.min(this.preferences.canvasHeight, node.y));
    });
  }

  // Calculates the mass center of the graph (replacement for computeCenterCoords and used in _center)
  calculateMassCenter() {
    let xAccum = 0, yAccum = 0, totalMagnitude = 0;
    this.processedData.nodes.forEach(node => {
      const magnitude = this.retrieveNodeAttribute('magnitude', node) || 1;
      xAccum += node.x * magnitude;
      yAccum += node.y * magnitude;
      totalMagnitude += magnitude;
    });
    return { x: xAccum / totalMagnitude, y: yAccum / totalMagnitude };
  }

  // Centers the graph view (replacement for _center)
  centerView() {
    const { x: graphCenterX, y: graphCenterY } = this.calculateMassCenter();
    const canvasCenterX = this.preferences.canvasWidth / 2;
    const canvasCenterY = this.preferences.canvasHeight / 2;

    // Adjust transform to center the graph
    this.viewTransform.x = canvasCenterX - graphCenterX * this.viewTransform.scale;
    this.viewTransform.y = canvasCenterY - graphCenterY * this.viewTransform.scale;
    this.applyViewTransform(); // Update canvas transform
  }

  // Shows the canvas element (replacement for show)
  showCanvas() {
    this.canvasElement.style.display = 'block';
    this.messenger.broadcast("visualisation:visible");
  }

  // Main drawing function (replacement for rendering parts of render and tick)
  drawFrame() {
    const ctx = this.drawingContext;
    ctx.clearRect(0, 0, this.preferences.canvasWidth, this.preferences.canvasHeight);

    ctx.save();
    this.applyViewTransform();

    // Draw links
    this.processedData.links.forEach(link => this.drawConnection(ctx, link));

    // Draw nodes
    this.processedData.nodes.forEach(node => this.drawElement(ctx, node));

    // Draw labels (after nodes for layering)
    this.processedData.nodes.forEach(node => this.drawElementLabel(ctx, node));

    ctx.restore();
  }

  // Applies current view transform to context
  applyViewTransform() {
    const ctx = this.drawingContext;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity
    ctx.translate(this.viewTransform.x, this.viewTransform.y);
    ctx.scale(this.viewTransform.scale, this.viewTransform.scale);
  }

  // Draw a single connection (replacement for d3Path rendering)
  drawConnection(ctx, connectionObject) {
    const sourceNode = connectionObject.source;
    const targetNode = connectionObject.target;

    // If filtering were implemented, this would check visibility
    // if (!this.isElementVisible(sourceNode) || !this.isElementVisible(targetNode)) return;

    ctx.beginPath();
    ctx.moveTo(sourceNode.x, sourceNode.y);
    ctx.lineTo(targetNode.x, targetNode.y);
    ctx.strokeStyle = this.retrieveConnectionColor(connectionObject); // replacement for pathStroke
    ctx.lineWidth = VisualConfig.EDGE_THICKNESS;
    ctx.stroke();
  }

  // Determines connection color (replacement for pathStroke)
  retrieveConnectionColor(connectionObject) {
    const sourceNode = connectionObject.source;
    const targetNode = connectionObject.target;
    const sourceMagnitude = this.retrieveNodeAttribute('magnitude', sourceNode) || 0;
    const targetMagnitude = this.retrieveNodeAttribute('magnitude', targetNode) || 0;

    const colorNode = (targetMagnitude > sourceMagnitude) ? targetNode : sourceNode;
    return this.retrieveGroupColor(colorNode);
  }

  // Draw a single node (replacement for d3Circles rendering)
  drawElement(ctx, nodeObject) {
    // If filtering were implemented, this would check visibility
    // if (!this.isElementVisible(nodeObject)) return;

    const radius = this.magnitudeToRadius(this.retrieveNodeAttribute('magnitude', nodeObject) || 1);
    ctx.beginPath();
    ctx.arc(nodeObject.x, nodeObject.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.retrieveGroupColor(nodeObject);
    ctx.fill();
    ctx.strokeStyle = VisualConfig.NODE_BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw a node label (replacement for d3TitleNodes rendering)
  drawElementLabel(ctx, nodeObject) {
    // If filtering were implemented, this would check visibility
    if (!this.shouldDisplayLabel(nodeObject) /* || !this.isElementVisible(nodeObject) */) return;

    const radius = this.magnitudeToRadius(this.retrieveNodeAttribute('magnitude', nodeObject) || 1);
    const labelText = this.retrieveNodeAttribute('label', nodeObject);
    if (!labelText) return;

    ctx.fillStyle = 'black';
    ctx.font = `${Math.max(8, radius / 2)}px sans-serif`; // Dynamic font size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, nodeObject.x, nodeObject.y + radius + 10); // Position below node
  }

  // Determines if a node is conceptually visible (replacement for isNodeVisible)
  // Currently, all nodes are considered visible as filtering logic is not implemented
  isElementVisible(nodeObject) {
    return true;
  }

  // Determines if a label should be displayed (replacement for isTitleDisplayable)
  shouldDisplayLabel(nodeObject) {
    const currentScale = this.viewTransform.scale;
    const magnitudeVal = this.retrieveNodeAttribute('magnitude', nodeObject) || 1;
    const scaledThreshold = this.magnitudeToLabelVisibility(magnitudeVal);

    return (currentScale * scaledThreshold > 0.8 || currentScale > 2.2);
  }

  // Retrieves node group color (replacement for getClusterColor)
  retrieveGroupColor(nodeObject) {
    const group = this.retrieveNodeAttribute('group', nodeObject);
    return this.preferences.groupColorMap[group] || '#ccc'; // Default grey
  }

  // --- Interaction Handlers (replacement for various event handlers) ---

  handleWheelScroll(event) {
    event.preventDefault(); // Prevent page scrolling
    const scaleFactor = 1.1;
    const mouseX = event.clientX - this.canvasElement.getBoundingClientRect().left;
    const mouseY = event.clientY - this.canvasElement.getBoundingClientRect().top;

    const worldPoint = this.screenToWorld(mouseX, mouseY);

    let newScale = this.viewTransform.scale;
    if (event.deltaY < 0) {
      newScale *= scaleFactor; // Zoom in
    } else {
      newScale /= scaleFactor; // Zoom out
    }
    newScale = Math.max(this.preferences.viewScaleLimits[0], Math.min(this.preferences.viewScaleLimits[1], newScale));

    this.setViewScale(newScale, worldPoint.x, worldPoint.y);
    this.drawFrame();
  }

  handleMouseDown(event) {
    this.lastClickPosition = { x: event.clientX, y: event.clientY };
    const mouseX = event.clientX - this.canvasElement.getBoundingClientRect().left;
    const mouseY = event.clientY - this.canvasElement.getBoundingClientRect().top;
    const worldPoint = this.screenToWorld(mouseX, mouseY);

    const hitNode = this.findNodeAtPoint(worldPoint.x, worldPoint.y);
    if (hitNode) {
      this.draggedNode = hitNode;
      this.draggedNode.fx = hitNode.x; // Fix node position for dragging
      this.draggedNode.fy = hitNode.y;
      this.simulationActive = true; // Restart simulation to react to fixed node
      this.messenger.broadcast("node:select", hitNode);
    } else {
      this.isDraggingCanvas = true;
      this.dragStartPoint = { x: mouseX, y: mouseY };
    }
  }

  handleMouseMove(event) {
    const mouseX = event.clientX - this.canvasElement.getBoundingClientRect().left;
    const mouseY = event.clientY - this.canvasElement.getBoundingClientRect().top;
    const worldPoint = this.screenToWorld(mouseX, mouseY);

    if (this.draggedNode) {
      this.draggedNode.fx = worldPoint.x;
      this.draggedNode.fy = worldPoint.y;
      this.drawFrame(); // Update position immediately
    } else if (this.isDraggingCanvas) {
      const deltaX = mouseX - this.dragStartPoint.x;
      const deltaY = mouseY - this.dragStartPoint.y;
      this.viewTransform.x += deltaX;
      this.viewTransform.y += deltaY;
      this.dragStartPoint = { x: mouseX, y: mouseY }; // Update drag start point
      this.drawFrame();
    } else {
      // Hover detection for tooltip
      const hoveredNode = this.findNodeAtPoint(worldPoint.x, worldPoint.y);
      if (hoveredNode && this.hintDisplay) {
        this.hintDisplay.display(mouseX, mouseY, {
          text: this.retrieveNodeAttribute('label', hoveredNode),
          size: this.retrieveNodeAttribute('magnitude', hoveredNode)
        });
      } else if (this.hintDisplay) {
        this.hintDisplay.hide();
      }
    }
  }

  handleMouseUp(event) {
    if (this.draggedNode) {
      this.draggedNode.fx = null; // Release fixed position
      this.draggedNode.fy = null;
      this.draggedNode = null;
      this.startSimulation(); // Restart simulation if it stopped
    }
    this.isDraggingCanvas = false;

    const currentClickPosition = { x: event.clientX, y: event.clientY };
    if (currentClickPosition.x === this.lastClickPosition.x &&
        currentClickPosition.y === this.lastClickPosition.y) {
      // This was a click, not a drag
      const mouseX = event.clientX - this.canvasElement.getBoundingClientRect().left;
      const mouseY = event.clientY - this.canvasElement.getBoundingClientRect().top;
      const worldPoint = this.screenToWorld(mouseX, mouseY);
      const clickedNode = this.findNodeAtPoint(worldPoint.x, worldPoint.y);
      if (clickedNode) {
        this.messenger.broadcast("node:click", clickedNode);
      } else {
        this.messenger.broadcast("canvas:click");
        this.resetView(); // Replacement for reset()
      }
    }
  }

  // Finds a node at given world coordinates for interaction (replacement for hit testing)
  findNodeAtPoint(worldX, worldY) {
    for (let i = this.processedData.nodes.length - 1; i >= 0; i--) { // Iterate backwards for z-index effect
      const node = this.processedData.nodes[i];
      const radius = this.magnitudeToRadius(this.retrieveNodeAttribute('magnitude', node) || 1);
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      if (dx * dx + dy * dy < radius * radius) {
        return node;
      }
    }
    return null;
  }

  // Resets the view to initial state (replacement for reset)
  resetView() {
    this.viewTransform.x = 0;
    this.viewTransform.y = 0;
    this.viewTransform.scale = 1;
    this.centerView();
    this.drawFrame();
    this.messenger.broadcast("view:reset");
  }

  // --- View Manipulation Methods (replacement for zoom, zoomIn, zoomOut) ---

  // Sets the view scale, optionally centering around a world point
  setViewScale(newScale, worldAnchorX, worldAnchorY) {
    const oldScale = this.viewTransform.scale;
    this.viewTransform.scale = newScale;

    if (worldAnchorX !== undefined && worldAnchorY !== undefined) {
      // Adjust translation to keep the worldAnchorPoint fixed relative to the screen
      this.viewTransform.x = worldAnchorX - (worldAnchorX - this.viewTransform.x) * (newScale / oldScale);
      this.viewTransform.y = worldAnchorY - (worldAnchorY - this.viewTransform.y) * (newScale / oldScale);
    }
  }

  // Zoom to a specific scale (replacement for zoom)
  setZoomLevel(scaleValue) {
    if (!this.canvasElement) {
      this.preferences.initialViewScale = scaleValue; // Store for later if not rendered
      return this;
    }
    const centerX = this.preferences.canvasWidth / 2;
    const centerY = this.preferences.canvasHeight / 2;
    const worldPoint = this.screenToWorld(centerX, centerY);
    this.setViewScale(scaleValue, worldPoint.x, worldPoint.y);
    this.drawFrame();
    return this;
  }

  // Zoom in (replacement for zoomIn)
  increaseZoom() {
    const currentScale = this.viewTransform.scale;
    const nextScale = Math.min(this.preferences.viewScaleLimits[1], currentScale * 1.5); // Arbitrary step
    return this.setZoomLevel(nextScale);
  }

  // Zoom out (replacement for zoomOut)
  decreaseZoom() {
    const currentScale = this.viewTransform.scale;
    const nextScale = Math.max(this.preferences.viewScaleLimits[0], currentScale / 1.5); // Arbitrary step
    return this.setZoomLevel(nextScale);
  }

  // Converts screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    const worldX = (screenX - this.viewTransform.x) / this.viewTransform.scale;
    const worldY = (screenY - this.viewTransform.y) / this.viewTransform.scale;
    return { x: worldX, y: worldY };
  }

  // Placeholder for filter/focus methods (replacement for hasUnappliedFilters, hasUnappliedFocus, update)
  isFiltered() { return false; }
  isFocused() { return false; }
  refreshDisplay() {
    // Re-run simulation or just redraw
    this.startSimulation();
  }
}