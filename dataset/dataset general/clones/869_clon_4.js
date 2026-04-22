(function() {

    // --- Utility: 2D Vector Operations ---
    class Vec2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        add(other) { return new Vec2(this.x + other.x, this.y + other.y); }
        subtract(other) { return new Vec2(this.x - other.x, this.y - other.y); }
        multiply(scalar) { return new Vec2(this.x * scalar, this.y * scalar); }
        divide(scalar) { return new Vec2(this.x / scalar, this.y / scalar); }
        magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        normalise() {
            const mag = this.magnitude();
            return mag > 0 ? this.divide(mag) : new Vec2(0, 0);
        }
        distance(other) { return this.subtract(other).magnitude(); }
        dot(other) { return this.x * other.x + this.y * other.y; }
        perpendicular() { return new Vec2(-this.y, this.x); } // Rotates vector 90 degrees counter-clockwise
        copy() { return new Vec2(this.x, this.y); }
    }

    // --- Graph Element Structures ---
    class SpatialNode {
        constructor(identifier, metadata = {}) {
            this.identifier = identifier;
            this.metadata = metadata;
            this.position = new Vec2(Math.random() * 100 - 50, Math.random() * 100 - 50);
            this.velocity = new Vec2();
            this.mass = 1.0;
            this.fixed = false; // If true, physics engine will not move this node
            this.widthCache = {}; // Cache for text width measurements
        }

        getHeight(renderContext, defaultStyle) {
            if (this.metadata.image && this.metadata.image.src) {
                const imgAsset = ResourceLoader.getAsset(this.metadata.image.src);
                if (imgAsset && imgAsset.loaded) {
                    return this.metadata.image.height !== undefined ? this.metadata.image.height : imgAsset.object.naturalHeight;
                }
                return 10; // Placeholder until image loads
            }
            return 16; // Consistent with original's hardcoded text height
        }

        getWidth(renderContext, defaultStyle) {
            if (this.metadata.image && this.metadata.image.src) {
                const imgAsset = ResourceLoader.getAsset(this.metadata.image.src);
                if (imgAsset && imgAsset.loaded) {
                    return this.metadata.image.width !== undefined ? this.metadata.image.width : imgAsset.object.naturalWidth;
                }
                return 10; // Placeholder until image loads
            }
            const contentText = this.metadata.label !== undefined ? this.metadata.label : this.identifier;
            if (this.widthCache[contentText]) {
                return this.widthCache[contentText];
            }

            renderContext.save();
            renderContext.font = this.metadata.font !== undefined ? this.metadata.font : defaultStyle;
            const textWidth = renderContext.measureText(contentText).width;
            renderContext.restore();
            this.widthCache[contentText] = textWidth;
            return textWidth;
        }
    }

    class SpatialLink {
        constructor(identifier, sourceNodeId, targetNodeId, metadata = {}) {
            this.identifier = identifier;
            this.sourceNodeId = sourceNodeId;
            this.targetNodeId = targetNodeId;
            this.metadata = metadata;
            this.length = metadata.length !== undefined ? metadata.length : 1.0;
        }
    }

    // --- Graph Data Store ---
    class NetworkStore {
        constructor() {
            this.nodes = new Map();
            this.links = new Map();
            this.nodeToLinkMap = new Map(); // nodeId -> Set<linkId>
        }

        addNode(node) {
            this.nodes.set(node.identifier, node);
            this.nodeToLinkMap.set(node.identifier, new Set());
            return node;
        }

        addLink(link) {
            if (!this.nodes.has(link.sourceNodeId) || !this.nodes.has(link.targetNodeId)) {
                console.warn(`Attempted to add link with non-existent nodes: ${link.sourceNodeId} or ${link.targetNodeId}`);
                return null;
            }
            this.links.set(link.identifier, link);
            this.nodeToLinkMap.get(link.sourceNodeId).add(link.identifier);
            this.nodeToLinkMap.get(link.targetNodeId).add(link.identifier);
            return link;
        }

        getNode(id) { return this.nodes.get(id); }
        getLink(id) { return this.links.get(id); }
        getAllNodes() { return Array.from(this.nodes.values()); }
        getAllLinks() { return Array.from(this.links.values()); }

        // Finds all links between a specific source and target node (in that direction)
        getDirectedLinksBetween(sourceId, targetId) {
            const result = [];
            for (const linkId of (this.nodeToLinkMap.get(sourceId) || [])) {
                const link = this.links.get(linkId);
                if (link && link.targetNodeId === targetId && link.sourceNodeId === sourceId) {
                    result.push(link);
                }
            }
            return result;
        }
    }

    // --- Physics Engine (Layout) ---
    class DynamicPlacementEngine {
        constructor(graphStore, linkStrength, nodeRepulsion, motionDamping, stabilityThreshold) {
            this.graph = graphStore;
            this.linkStrength = linkStrength;
            this.nodeRepulsion = nodeRepulsion;
            this.motionDamping = motionDamping;
            this.stabilityThreshold = stabilityThreshold;
            this.currentEnergy = 0;
        }

        advanceFrame() {
            let totalMovement = 0;

            // Apply repulsion forces between all node pairs
            this.graph.getAllNodes().forEach(nodeA => {
                if (nodeA.fixed) return;
                let cumulativeRepulsion = new Vec2();
                this.graph.getAllNodes().forEach(nodeB => {
                    if (nodeA.identifier === nodeB.identifier) return;

                    const displacement = nodeA.position.subtract(nodeB.position);
                    const distance = Math.max(displacement.magnitude(), 0.1);
                    const forceMagnitude = this.nodeRepulsion / (distance * distance);
                    cumulativeRepulsion = cumulativeRepulsion.add(displacement.normalise().multiply(forceMagnitude));
                });
                nodeA.velocity = nodeA.velocity.add(cumulativeRepulsion.divide(nodeA.mass));
            });

            // Apply attraction forces along links
            this.graph.getAllLinks().forEach(link => {
                const source = this.graph.getNode(link.sourceNodeId);
                const target = this.graph.getNode(link.targetNodeId);

                if (!source || !target) return;

                const displacement = source.position.subtract(target.position);
                const distance = displacement.magnitude();
                const difference = link.length - distance;
                const forceMagnitude = this.linkStrength * difference;
                const attractionForce = displacement.normalise().multiply(forceMagnitude);

                if (!source.fixed) {
                    source.velocity = source.velocity.add(attractionForce.divide(source.mass));
                }
                if (!target.fixed) {
                    target.velocity = target.velocity.subtract(attractionForce.divide(target.mass));
                }
            });

            // Update node positions and apply damping
            this.graph.getAllNodes().forEach(node => {
                if (node.fixed) {
                    node.velocity = new Vec2();
                    return;
                }
                node.velocity = node.velocity.multiply(this.motionDamping);
                node.position = node.position.add(node.velocity);
                totalMovement += node.velocity.magnitude();
            });

            this.currentEnergy = totalMovement;
            // The original keeps running even if energy is below threshold, so we do too.
        }

        findNearestElement(worldPoint, searchRadius = Infinity) {
            let closestNode = null;
            let minDistance = searchRadius;
            this.graph.getAllNodes().forEach(node => {
                const dist = node.position.distance(worldPoint);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestNode = node;
                }
            });
            // Mimic Springy's nearest return structure (node, and point.p/point.m for dragged node)
            return { node: closestNode, point: closestNode ? { p: closestNode.position, m: closestNode.mass } : null };
        }
    }

    // --- Bounding Box Management ---
    class ViewportManager {
        constructor() {
            this.currentBox = { min: new Vec2(-2, -2), max: new Vec2(2, 2) };
            this.targetBox = { min: new Vec2(-2, -2), max: new Vec2(2, 2) };
            this.isAdjusting = false;
            this.animationRequestId = null;
        }

        updateTarget(graphNodes) {
            if (graphNodes.length === 0) {
                this.targetBox = { min: new Vec2(-2, -2), max: new Vec2(2, 2) };
                return;
            }

            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;

            graphNodes.forEach(node => {
                minX = Math.min(minX, node.position.x);
                minY = Math.min(minY, node.position.y);
                maxX = Math.max(maxX, node.position.x);
                maxY = Math.max(maxY, node.position.y);
            });

            // Add some padding
            this.targetBox = { min: new Vec2(minX - 0.5, minY - 0.5), max: new Vec2(maxX + 0.5, maxY + 0.5) };
        }

        smoothAdjustLoop() {
            if (!this.isAdjusting) return;

            const adjustmentFactor = 0.1;
            this.currentBox.min = this.currentBox.min.add(this.targetBox.min.subtract(this.currentBox.min).multiply(adjustmentFactor));
            this.currentBox.max = this.currentBox.max.add(this.targetBox.max.subtract(this.currentBox.max).multiply(adjustmentFactor));

            this.animationRequestId = requestAnimationFrame(() => this.smoothAdjustLoop());
        }

        startAdjustment() {
            if (!this.isAdjusting) {
                this.isAdjusting = true;
                this.smoothAdjustLoop();
            }
        }

        stopAdjustment() {
            this.isAdjusting = false;
            if (this.animationRequestId) {
                cancelAnimationFrame(this.animationRequestId);
                this.animationRequestId = null;
            }
        }
    }

    // --- Asset Management (Images) ---
    const ResourceLoader = {
        imageAssets: {},

        getAsset: function(src) {
            if (!this.imageAssets[src]) {
                this.imageAssets[src] = { loaded: false, object: new Image() };
                const img = this.imageAssets[src].object;
                img.addEventListener("load", () => {
                    this.imageAssets[src].loaded = true;
                    // No explicit redraw trigger needed here; main loop will pick up loaded images.
                });
                img.src = src;
            }
            return this.imageAssets[src];
        }
    };

    // --- Canvas Drawing Logic Helpers ---
    function getLineSegmentIntersection(segment1P1, segment1P2, segment2P1, segment2P2) {
        const denom = ((segment2P2.y - segment2P1.y) * (segment1P2.x - segment1P1.x) -
                       (segment2P2.x - segment2P1.x) * (segment1P2.y - segment1P1.y));

        if (denom === 0) { return null; } // Parallel lines

        const ua = ((segment2P2.x - segment2P1.x) * (segment1P1.y - segment2P1.y) -
                    (segment2P2.y - segment2P1.y) * (segment1P1.x - segment2P1.x)) / denom;
        const ub = ((segment1P2.x - segment1P1.x) * (segment1P1.y - segment2P1.y) -
                    (segment1P2.y - segment1P1.y) * (segment1P1.x - segment2P1.x)) / denom;

        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) { return null; } // Intersection outside segments

        return new Vec2(segment1P1.x + ua * (segment1P2.x - segment1P1.x),
                        segment1P1.y + ua * (segment1P2.y - segment1P1.y));
    }

    function getLineRectangleIntersection(lineP1, lineP2, rectTopLeft, rectWidth, rectHeight) {
        const rectTR = new Vec2(rectTopLeft.x + rectWidth, rectTopLeft.y);
        const rectBL = new Vec2(rectTopLeft.x, rectTopLeft.y + rectHeight);
        const rectBR = new Vec2(rectTopLeft.x + rectWidth, rectTopLeft.y + rectHeight);

        let intersection;
        if (intersection = getLineSegmentIntersection(lineP1, lineP2, rectTopLeft, rectTR)) { return intersection; }
        if (intersection = getLineSegmentIntersection(lineP1, lineP2, rectTR, rectBR)) { return intersection; }
        if (intersection = getLineSegmentIntersection(lineP1, lineP2, rectBR, rectBL)) { return intersection; }
        if (intersection = getLineSegmentIntersection(lineP1, lineP2, rectBL, rectTopLeft)) { return intersection; }

        return null;
    }

    // --- Main Visualizer/Renderer ---
    class CanvasRenderer {
        constructor(canvasElement, graphStore, placementEngine, viewportManager, config) {
            this.canvas = canvasElement;
            this.ctx = canvasElement.getContext("2d");
            this.graph = graphStore;
            this.engine = placementEngine;
            this.viewport = viewportManager;
            this.config = config;

            this.currentlySelectedNodeId = null;
            this.currentlyHoveredNodeId = null;
            this.animationActive = false;
            this.animationFrameId = null;
        }

        worldToCanvas(worldPoint) {
            const viewSize = this.viewport.currentBox.max.subtract(this.viewport.currentBox.min);
            const canvasX = (worldPoint.subtract(this.viewport.currentBox.min).x / viewSize.x) * this.canvas.width;
            const canvasY = (worldPoint.subtract(this.viewport.currentBox.min).y / viewSize.y) * this.canvas.height;
            return new Vec2(canvasX, canvasY);
        }

        canvasToWorld(canvasPoint) {
            const viewSize = this.viewport.currentBox.max.subtract(this.viewport.currentBox.min);
            const worldX = (canvasPoint.x / this.canvas.width) * viewSize.x + this.viewport.currentBox.min.x;
            const worldY = (canvasPoint.y / this.canvas.height) * viewSize.y + this.viewport.currentBox.min.y;
            return new Vec2(worldX, worldY);
        }

        clearDrawingSurface() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        drawConnection(link) {
            const sourceNode = this.graph.getNode(link.sourceNodeId);
            const targetNode = this.graph.getNode(link.targetNodeId);

            if (!sourceNode || !targetNode) return;

            const screenP1 = this.worldToCanvas(sourceNode.position);
            const screenP2 = this.worldToCanvas(targetNode.position);

            const connectionLine = screenP2.subtract(screenP1);
            const normalToConnection = connectionLine.perpendicular().normalise();

            const forwardLinks = this.graph.getDirectedLinksBetween(link.sourceNodeId, link.targetNodeId);
            const backwardLinks = this.graph.getDirectedLinksBetween(link.targetNodeId, link.sourceNodeId);
            const totalParallelLinks = forwardLinks.length + backwardLinks.length;
            let currentLinkIndex = 0;
            for (let i = 0; i < forwardLinks.length; i++) {
                if (forwardLinks[i].identifier === link.identifier) {
                    currentLinkIndex = i;
                    break;
                }
            }

            const parallelLinkSpacing = 12.0;
            const offsetVector = normalToConnection.multiply(-((totalParallelLinks - 1) * parallelLinkSpacing) / 2.0 + (currentLinkIndex * parallelLinkSpacing));

            const shiftedP1 = screenP1.add(offsetVector);
            const shiftedP2 = screenP2.add(offsetVector);

            const nodePaddingX = 6;
            const nodePaddingY = 6;
            const targetNodeVisualWidth = targetNode.getWidth(this.ctx, this.config.nodeTextStyle) + nodePaddingX;
            const targetNodeVisualHeight = targetNode.getHeight(this.ctx, this.config.nodeTextStyle) + nodePaddingY;

            const targetNodeBoxOrigin = new Vec2(screenP2.x - targetNodeVisualWidth / 2.0, screenP2.y - targetNodeVisualHeight / 2.0);
            let arrowTipIntersection = getLineRectangleIntersection(shiftedP1, shiftedP2, targetNodeBoxOrigin, targetNodeVisualWidth, targetNodeVisualHeight);

            if (!arrowTipIntersection) {
                arrowTipIntersection = shiftedP2;
            }

            this.ctx.strokeStyle = link.metadata.color !== undefined ? link.metadata.color : '#000000';
            this.ctx.lineWidth = Math.max((link.metadata.weight !== undefined ? link.metadata.weight : 1.0) * 2, 0.1);

            const arrowHeadSize = 8;
            const arrowHeadWidth = 1 + this.ctx.lineWidth;
            const isDirected = link.metadata.directional !== undefined ? link.metadata.directional : true;

            let lineEndPosition = shiftedP2;
            if (isDirected) {
                lineEndPosition = arrowTipIntersection.subtract(connectionLine.normalise().multiply(arrowHeadSize * 0.5));
            }

            this.ctx.beginPath();
            this.ctx.moveTo(shiftedP1.x, shiftedP1.y);
            this.ctx.lineTo(lineEndPosition.x, lineEndPosition.y);
            this.ctx.stroke();

            // Draw arrow head
            if (isDirected) {
                this.ctx.save();
                this.ctx.fillStyle = this.ctx.strokeStyle;
                this.ctx.translate(arrowTipIntersection.x, arrowTipIntersection.y);
                this.ctx.rotate(Math.atan2(screenP2.y - screenP1.y, screenP2.x - screenP1.x));
                this.ctx.beginPath();
                this.ctx.moveTo(-arrowHeadSize, arrowHeadWidth);
                this.ctx.lineTo(0, 0);
                this.ctx.lineTo(-arrowHeadSize, -arrowHeadWidth);
                this.ctx.lineTo(-arrowHeadSize * 0.8, 0);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();
            }

            // Draw link label
            if (link.metadata.label !== undefined) {
                this.ctx.save();
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "top";
                this.ctx.font = link.metadata.font !== undefined ? link.metadata.font : this.config.edgeTextStyle;
                this.ctx.fillStyle = this.ctx.strokeStyle;

                let labelRotation = Math.atan2(shiftedP2.y - shiftedP1.y, shiftedP2.x - shiftedP1.x);
                let labelOffsetDistance = -8;
                if (this.config.edgeLabelsUpright && (labelRotation > Math.PI / 2 || labelRotation < -Math.PI / 2)) {
                    labelOffsetDistance = 8;
                    labelRotation += Math.PI;
                }
                const labelScreenPosition = shiftedP1.add(shiftedP2).divide(2).add(normalToConnection.multiply(labelOffsetDistance));
                this.ctx.translate(labelScreenPosition.x, labelScreenPosition.y);
                this.ctx.rotate(labelRotation);
                this.ctx.fillText(link.metadata.label, 0, -2);
                this.ctx.restore();
            }
        }

        drawElement(node) {
            const screenPosition = this.worldToCanvas(node.position);

            this.ctx.save();

            const paddingX = 6;
            const paddingY = 6;
            const contentWidth = node.getWidth(this.ctx, this.config.nodeTextStyle);
            const contentHeight = node.getHeight(this.ctx, this.config.nodeTextStyle);
            const boxWidth = contentWidth + paddingX;
            const boxHeight = contentHeight + paddingY;

            const boxTopLeftX = screenPosition.x - boxWidth / 2;
            const boxTopLeftY = screenPosition.y - boxHeight / 2;

            this.ctx.clearRect(boxTopLeftX, boxTopLeftY, boxWidth, boxHeight);

            if (this.currentlySelectedNodeId === node.identifier) {
                this.ctx.fillStyle = "#FFFFE0";
            } else if (this.currentlyHoveredNodeId === node.identifier) {
                this.ctx.fillStyle = "#EEEEEE";
            } else {
                this.ctx.fillStyle = "#FFFFFF";
            }
            this.ctx.fillRect(boxTopLeftX, boxTopLeftY, boxWidth, boxHeight);

            if (node.metadata.image && node.metadata.image.src) {
                const imgAsset = ResourceLoader.getAsset(node.metadata.image.src);
                if (imgAsset.loaded) {
                    this.ctx.drawImage(imgAsset.object, screenPosition.x - contentWidth / 2, screenPosition.y - contentHeight / 2, contentWidth, contentHeight);
                }
            } else {
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = "top";
                this.ctx.font = node.metadata.font !== undefined ? node.metadata.font : this.config.nodeTextStyle;
                this.ctx.fillStyle = node.metadata.color !== undefined ? node.metadata.color : "#000000";
                const text = node.metadata.label !== undefined ? node.metadata.label : node.identifier;
                this.ctx.fillText(text, screenPosition.x - contentWidth / 2, screenPosition.y - contentHeight / 2);
            }
            this.ctx.restore();
        }

        beginCycle() {
            if (this.animationActive) return;
            this.animationActive = true;
            const frameUpdate = () => {
                if (!this.animationActive) return;

                this.engine.advanceFrame();
                this.viewport.updateTarget(this.graph.getAllNodes());

                this.clearDrawingSurface();

                this.graph.getAllLinks().forEach(link => this.drawConnection(link));
                this.graph.getAllNodes().forEach(node => this.drawElement(node));

                this.animationFrameId = requestAnimationFrame(frameUpdate);
            };
            this.viewport.startAdjustment();
            this.animationFrameId = requestAnimationFrame(frameUpdate);
        }

        endCycle() {
            this.animationActive = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            this.viewport.stopAdjustment();
        }
    }

    // --- Interaction Handling ---
    class PointerInteractionHandler {
        constructor(canvasElement, renderer, graphStore, placementEngine, onNodeActivatedCallback) {
            this.canvas = canvasElement;
            this.renderer = renderer;
            this.graph = graphStore;
            this.engine = placementEngine;
            this.onNodeActivated = onNodeActivatedCallback;

            this.activeDragNode = null;
            this.isDragging = false;

            this.canvas.addEventListener('mousedown', this.handlePointerDown.bind(this));
            this.canvas.addEventListener('mousemove', this.handlePointerMove.bind(this));
            this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
            window.addEventListener('mouseup', this.handlePointerUp.bind(this));
        }

        getCanvasPosition(event) {
            const rect = this.canvas.getBoundingClientRect();
            return new Vec2(event.clientX - rect.left, event.clientY - rect.top);
        }

        handlePointerDown(e) {
            const canvasCoords = this.getCanvasPosition(e);
            const worldCoords = this.renderer.canvasToWorld(canvasCoords);
            const nearestFound = this.engine.findNearestElement(worldCoords, 0.5); // Search within 0.5 world units

            if (nearestFound.node) {
                this.activeDragNode = nearestFound.node;
                this.activeDragNode.fixed = true;
                this.isDragging = true;
                this.renderer.currentlySelectedNodeId = this.activeDragNode.identifier;
                if (this.onNodeActivated) {
                    this.onNodeActivated(this.activeDragNode);
                }
                this.renderer.beginCycle();
            }
        }

        handlePointerMove(e) {
            const canvasCoords = this.getCanvasPosition(e);
            const worldCoords = this.renderer.canvasToWorld(canvasCoords);
            const nearestFound = this.engine.findNearestElement(worldCoords, 0.5);

            if (nearestFound.node) {
                this.renderer.currentlyHoveredNodeId = nearestFound.node.identifier;
            } else {
                this.renderer.currentlyHoveredNodeId = null;
            }

            if (this.isDragging && this.activeDragNode) {
                this.activeDragNode.position = worldCoords;
                this.activeDragNode.velocity = new Vec2();
                this.renderer.beginCycle();
            }
        }

        handlePointerUp(e) {
            if (this.activeDragNode) {
                this.activeDragNode.fixed = false;
                this.activeDragNode = null;
            }
            this.isDragging = false;
            this.renderer.currentlySelectedNodeId = null;
        }

        handleDoubleClick(e) {
            const canvasCoords = this.getCanvasPosition(e);
            const worldCoords = this.renderer.canvasToWorld(canvasCoords);
            const nearestFound = this.engine.findNearestElement(worldCoords, 0.5);

            if (nearestFound.node && nearestFound.node.metadata && nearestFound.node.metadata.ondoubleclick) {
                nearestFound.node.metadata.ondoubleclick();
            }
        }
    }

    // --- Main Entry Point ---
    window.createVisualGraph = function(targetCanvasElement, displayOptions = {}) {
        if (!(targetCanvasElement instanceof HTMLCanvasElement)) {
            console.error("The first argument must be an HTMLCanvasElement.");
            return;
        }

        const configuration = {
            graphData: displayOptions.graph || new NetworkStore(),
            nodeTextStyle: displayOptions.nodeFont || "16px Verdana, sans-serif",
            edgeTextStyle: displayOptions.edgeFont || "8px Verdana, sans-serif",
            linkStrength: displayOptions.stiffness || 400.0,
            nodeRepulsion: displayOptions.repulsion || 400.0,
            motionDamping: displayOptions.damping || 0.5,
            stabilityThreshold: displayOptions.minEnergyThreshold || 0.00001,
            onNodeActivated: displayOptions.nodeSelected || null,
            edgeLabelsUpright: displayOptions.edgeLabelsUpright !== undefined ? displayOptions.edgeLabelsUpright : true
        };

        const graphStorage = configuration.graphData instanceof NetworkStore ? configuration.graphData : new NetworkStore();
        if (displayOptions.graph && !(displayOptions.graph instanceof NetworkStore)) {
             if (displayOptions.graph.nodes) {
                 displayOptions.graph.nodes.forEach(n => graphStorage.addNode(new SpatialNode(n.id, n.data)));
             }
             if (displayOptions.graph.edges) {
                 displayOptions.graph.edges.forEach(e => graphStorage.addLink(new SpatialLink(e.id, e.source, e.target, e.data)));
             }
        }

        const placementProcessor = new DynamicPlacementEngine(
            graphStorage,
            configuration.linkStrength,
            configuration.nodeRepulsion,
            configuration.motionDamping,
            configuration.stabilityThreshold
        );

        const viewportHandler = new ViewportManager();
        const canvasVisualizer = new CanvasRenderer(
            targetCanvasElement,
            graphStorage,
            placementProcessor,
            viewportHandler,
            configuration
        );

        new PointerInteractionHandler(
            targetCanvasElement,
            canvasVisualizer,
            graphStorage,
            placementProcessor,
            configuration.onNodeActivated
        );

        canvasVisualizer.beginCycle();

        targetCanvasElement.graphModel = graphStorage;
        targetCanvasElement.layoutEngine = placementProcessor;
        targetCanvasElement.visualizer = canvasVisualizer;

        return {
            getGraphModel: () => graphStorage,
            getLayoutEngine: () => placementProcessor,
            getRenderer: () => canvasVisualizer,
            startDrawing: () => canvasVisualizer.beginCycle(),
            stopDrawing: () => canvasVisualizer.endCycle()
        };
    };

})();