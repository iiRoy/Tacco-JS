let appGlobals = {};
let vectorGraphics = {};
let systemModules = {};
let shapeRender = {};
let coreUtils = {};
let physicsEngine = {};

/*
	ConstraintRod: This class is responsible for maintaining the fixed distance between two physics nodes.

	Operational Modes (formerly "states"):
	1) Fully Dynamic: Both nodes are free; the rod applies reciprocal corrections.
	2) Partially Anchored: One node is fixed (e.g., 'A' or 'B'), and the other node adjusts to maintain the rod's length.
	3) Fully Anchored: Both nodes are fixed; no movement occurs, and the rod effectively becomes immutable.

	Refinement Note: Consider consolidating the logic for partially anchored nodes to reduce code duplication.
*/

let SimulationBase, ANGLE_CONVERSION_FACTOR, noiseGeneratorInstance, lastSystemUpdate,
    _bindMethod = function(methodRef, instanceContext){ return function(){ return methodRef.apply(instanceContext, arguments); }; },
    _ownPropertyCheck = {}.hasOwnProperty,
    _extendClass = function(childClass, parentClass) {
        for (let propKey in parentClass) {
            if (_ownPropertyCheck.call(parentClass, propKey)) childClass[propKey] = parentClass[propKey];
        }
        function TempConstructor() { this.constructor = childClass; }
        TempConstructor.prototype = parentClass.prototype;
        childClass.prototype = new TempConstructor();
        childClass.__super__ = parentClass.prototype;
        return childClass;
    };

physicsEngine.ConstraintRod = (function() {

    // Internal helper for length calculation and correction
    function _calculateAndCorrect(node1, node2, targetLength, resistance, isPointAFixed, isPointBFixed) {
        let currentDistX = node2.coordX - node1.coordX;
        let currentDistY = node2.coordY - node1.coordY;
        let currentLength = Math.sqrt(Math.pow(currentDistX, 2) + Math.pow(currentDistY, 2));

        if (currentLength > resistance) {
            console.warn("ConstraintRod exceeded breaking threshold!");
            return {
                isBroken: true
            };
        }

        const lengthDifference = targetLength - currentLength;
        const correctionScale = lengthDifference / currentLength;
        const halfCorrectionFactor = 0.5;

        let correctionX = correctionScale * currentDistX;
        let correctionY = correctionScale * currentDistY;

        if (isPointAFixed && !isPointBFixed) {
            node2.coordX += correctionX;
            node2.coordY += correctionY;
        } else if (!isPointAFixed && isPointBFixed) {
            node1.coordX -= correctionX;
            node1.coordY -= correctionY;
        } else if (!isPointAFixed && !isPointBFixed) {
            node1.coordX -= correctionX * halfCorrectionFactor;
            node1.coordY -= correctionY * halfCorrectionFactor;
            node2.coordX += correctionX * halfCorrectionFactor;
            node2.coordY += correctionY * halfCorrectionFactor;
        }

        return {
            isBroken: false
        };
    }

    function ConstraintRod(nodeA, nodeB) {
        const selfReference = this;

        if (!nodeA || !nodeB) {
            console.error("ConstraintRod requires two valid physics nodes.");
            // Type III: Potentially throw an error or return a null object for validation.
            // For now, an early exit from constructor.
            return;
        }

        this.firstNode = nodeA;
        this.secondNode = nodeB;
        this.isBroken = false;
        this.breakThreshold = 9999.0;

        let deltaX = nodeA.coordX - nodeB.coordX;
        let deltaY = nodeA.coordY - nodeB.coordY;

        this.initialLength = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

        this.applyLengthConstraint = function() {
            if (selfReference.isBroken) {
                return;
            }

            const result = _calculateAndCorrect(
                selfReference.firstNode,
                selfReference.secondNode,
                selfReference.initialLength,
                selfReference.breakThreshold,
                selfReference.firstNode.isAnchored,
                selfReference.secondNode.isAnchored
            );

            selfReference.isBroken = result.isBroken;
        };

        if (this.firstNode.isAnchored && this.secondNode.isAnchored) {
            this.applyLengthConstraint = function() { /* No action needed for fully anchored rods */ };
        }
    }

    return ConstraintRod;

})();

/*
	PerlinGenerator: A fast, gradient-based noise algorithm implementation.

	Adapted from: http://mrl.nyu.edu/~perlin/noise/
	Enhancements: Renamed variables for improved readability and added comments.
*/

coreUtils.PerlinGenerator = (function() {
    let smoothStepFunction, linearInterpolation, gradientDotProduct, permutationTable;

    function PerlinGenerator() {
        console.log("PerlinGenerator instance created.");
    }

    // Smooth step function (6t^5 - 15t^4 + 10t^3)
    smoothStepFunction = function(t_val) {
        return t_val * t_val * t_val * (t_val * (t_val * 6.0 - 15.0) + 10.0);
    };

    // Linear interpolation function
    linearInterpolation = function(t_factor, val_a, val_b) {
        return val_a + t_factor * (val_b - val_a);
    };

    // Computes the dot product of a gradient vector and a distance vector
    gradientDotProduct = function(hash_val, x_dist, y_dist, z_dist) {
        let h_idx = hash_val & 0xF;
        let u_val = (h_idx < 8 ? x_dist : y_dist);
        let v_val = (h_idx < 4 ? y_dist : (h_idx === 12 || h_idx === 14 ? x_dist : z_dist));
        return ((h_idx & 1) === 0 ? u_val : -u_val) + ((h_idx & 2) === 0 ? v_val : -v_val);
    };

    permutationTable = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

    for (let currentIdx = 0; currentIdx < 256; currentIdx++) {
        permutationTable[256 + currentIdx] = permutationTable[currentIdx];
    }

    PerlinGenerator.prototype.generateNoise3D = function(inputX, inputY, inputZ) {
        const floorCoordX = Math.floor(inputX);
        const floorCoordY = Math.floor(inputY);
        const floorCoordZ = Math.floor(inputZ);

        const cellX = floorCoordX & 255;
        const cellY = floorCoordY & 255;
        const cellZ = floorCoordZ & 255;

        const relativeX = inputX - floorCoordX;
        const relativeY = inputY - floorCoordY;
        const relativeZ = inputZ - floorCoordZ;

        const relativeXminus1 = relativeX - 1.0;
        const relativeYminus1 = relativeY - 1.0;
        const relativeZminus1 = relativeZ - 1.0;

        const u_smooth = smoothStepFunction(relativeX);
        const v_smooth = smoothStepFunction(relativeY);
        const w_smooth = smoothStepFunction(relativeZ);

        const hashA = permutationTable[cellX] + cellY;
        const hashAA = permutationTable[hashA] + cellZ;
        const hashAB = permutationTable[hashA + 1] + cellZ;
        const hashB = permutationTable[cellX + 1] + cellY;
        const hashBA = permutationTable[hashB] + cellZ;
        const hashBB = permutationTable[hashB + 1] + cellZ;

        const g000 = gradientDotProduct(permutationTable[hashAA], relativeX, relativeY, relativeZ);
        const g100 = gradientDotProduct(permutationTable[hashBA], relativeXminus1, relativeY, relativeZ);
        const g010 = gradientDotProduct(permutationTable[hashAB], relativeX, relativeYminus1, relativeZ);
        const g110 = gradientDotProduct(permutationTable[hashBB], relativeXminus1, relativeYminus1, relativeZ);
        const g001 = gradientDotProduct(permutationTable[hashAA + 1], relativeX, relativeY, relativeZminus1);
        const g101 = gradientDotProduct(permutationTable[hashBA + 1], relativeXminus1, relativeY, relativeZminus1);
        const g011 = gradientDotProduct(permutationTable[hashAB + 1], relativeX, relativeYminus1, relativeZminus1);
        const g111 = gradientDotProduct(permutationTable[hashBB + 1], relativeXminus1, relativeYminus1, relativeZminus1);

        const x00 = linearInterpolation(u_smooth, g000, g100);
        const x10 = linearInterpolation(u_smooth, g010, g110);
        const x01 = linearInterpolation(u_smooth, g001, g101);
        const x11 = linearInterpolation(u_smooth, g011, g111);

        const y0 = linearInterpolation(v_smooth, x00, x10);
        const y1 = linearInterpolation(v_smooth, x01, x11);

        return linearInterpolation(w_smooth, y0, y1);
    };

    return PerlinGenerator;

})();

noiseGeneratorInstance = new coreUtils.PerlinGenerator();

/*
	SimulationCore: The foundational class for managing physics simulations and rendering scenes.
	It provides common functionalities extended by specialized scene types like SvgDisplayManager.
*/

SimulationBase = (function() {

    SimulationBase.prototype.assetLoaded = false;
    SimulationBase.prototype.simulationActive = false;
    SimulationBase.prototype.rootElement = null;
    SimulationBase.prototype.configuration = {
        containerSelector: "#simulationCanvas",
        verticalAlignment: "mid",
        horizontalAlignment: "center",
        completionCallback: null,
        dataSourceFile: null,
        parsedColors: {
            fixedNodeColor: "#FF0000",
            connectionColor: "#FF0000"
        }
    };

    SimulationBase.prototype.proximityTolerance = 1.0;
    SimulationBase.prototype.previousFrameTimestamp = 0.0;
    SimulationBase.currentDeltaTime = 0.0;

    function SimulationBase(setupOptions) {
        this.addFixedEntity = _bindMethod(this.addFixedEntity, this);
        this.registerGraphicNode = _bindMethod(this.registerGraphicNode, this);
        this.setFixedNode = _bindMethod(this.setFixedNode, this);
        this.performSimulationUpdate = _bindMethod(this.performSimulationUpdate, this);
        this.startSimulation = _bindMethod(this.startSimulation, this);
        this.resetSimulation = _bindMethod(this.resetSimulation, this);
        this.pauseSimulation = _bindMethod(this.pauseSimulation, this);

        SimulationBase.currentDeltaTime = 0.0;
        this.configuration = { ...this.configuration, ...setupOptions };
        this.yOffset = 0;
        this.xOffset = 0;
        this.currentSimulationTime = 0;

        this.simulationNodes = [];
        this.structuralLinks = [];
        this.visualConnectors = [];
        this.graphicElements = [];
        this.fixedObjects = [];
        this.extensionModules = [];
        this.spatialIndex = new coreUtils.QuadTree();

        this.simulationActive = true;

        console.info("SimulationCore initialized with options:", this.configuration);

        return this;
    }

    SimulationBase.prototype.pauseSimulation = function() {
        console.log("Simulation paused.");
        this.simulationActive = false;
    };

    SimulationBase.prototype.resetSimulation = function() {
        console.log("Simulation reset and unloaded.");
        this.simulationActive = false;
        for (const module of this.extensionModules) {
            module.unload();
        }
        this.simulationNodes.length = 0;
        this.structuralLinks.length = 0;
        this.visualConnectors.length = 0;
        this.graphicElements.length = 0;
        this.fixedObjects.length = 0;
        this.extensionModules.length = 0;
        this.spatialIndex.clear();
    };

    SimulationBase.prototype.startSimulation = function() {
        if (this.simulationActive) {
            console.warn("Attempted to start an already active simulation.");
            return;
        }
        console.log("Simulation started.");
        this.simulationActive = true;
        this.previousFrameTimestamp = performance.now();

        for (const node of this.simulationNodes) {
            node.forceX = 0;
            node.forceY = 0;
        }

        if (this.assetLoaded) {
            this.performSimulationUpdate();
        } else {
            console.info("Simulation started, but assets not yet loaded. Waiting for onAssetsReady.");
        }
    };

    SimulationBase.prototype.onAssetsReady = function() {
        this.assetLoaded = true;
        console.log("Assets loaded successfully.");
        if (typeof this.configuration.completionCallback === "function") {
             this.configuration.completionCallback();
        }
    };

    SimulationBase.prototype.onInitializationComplete = function() {
        console.log("Simulation initialization sequence complete.");
        this.previousFrameTimestamp = performance.now();
        for (const moduleInstance of this.extensionModules) {
            moduleInstance.init(this);
        }
        this.spatialIndex.clear();
        this.performSimulationUpdate();
    };

    SimulationBase.prototype.performSimulationUpdate = function() {
        const currentTimestamp = performance.now();
        const maxDeltaStep = 20;
        SimulationBase.currentDeltaTime = Math.min(currentTimestamp - this.previousFrameTimestamp, maxDeltaStep);
        this.previousFrameTimestamp = currentTimestamp;

        for (const extModule of this.extensionModules) {
            extModule.update();
        }
        for (const simNode of this.simulationNodes) {
            simNode.updatePosition();
        }
        for (const structuralRod of this.structuralLinks) {
            if (!structuralRod.isBroken) {
                structuralRod.applyLengthConstraint();
            }
        }
        for (const graphicNode of this.graphicElements) {
            graphicNode.refreshVisuals();
        }
        for (const visualLink of this.visualConnectors) {
            visualLink.updateDisplay();
        }

        if (this.simulationActive) {
            window.requestAnimationFrame(this.performSimulationUpdate);
        } else {
            console.log("Animation frame request stopped as simulation is inactive.");
        }
    };

    SimulationBase.frameCounter = 0;

    SimulationBase.prototype.registerNode = function(xCoord, yCoord, nodeType = null) {
        const parsedX = parseFloat(xCoord);
        const parsedY = parseFloat(yCoord);

        const searchAreaSize = this.proximityTolerance;
        const searchRegion = {
            x: parsedX - searchAreaSize / 2,
            y: parsedY - searchAreaSize / 2,
            width: searchAreaSize,
            height: searchAreaSize
        };
        const nearbyNodes = this.spatialIndex.find(searchRegion);

        let targetNode;
        if (nearbyNodes.length > 0) {
            targetNode = nearbyNodes[0].dataPoint;
            console.debug(`Found existing node at (${parsedX}, ${parsedY}). Reusing.`);
        } else {
            targetNode = this.instantiateNode(parsedX, parsedY, nodeType);
            this.spatialIndex.insert({
                x: parsedX,
                y: parsedY,
                dataPoint: targetNode
            });
            this.simulationNodes.push(targetNode);
            console.debug(`Created new node at (${parsedX}, ${parsedY}).`);
        }
        return targetNode;
    };

    SimulationBase.prototype.instantiateNode = function(xCoord, yCoord, typeOfNode) {
        let newNode;
        switch (typeOfNode) {
            case "elastic":
                newNode = new physicsEngine.ElasticNode(xCoord, yCoord);
                break;
            case "static":
                newNode = new physicsEngine.StaticNode(xCoord, yCoord);
                break;
            default:
                newNode = new physicsEngine.PhysicsNode(xCoord, yCoord);
                console.info(`Instantiated default PhysicsNode at (${xCoord}, ${yCoord}).`);
        }
        return newNode;
    };

    SimulationBase.prototype.setFixedNode = function(context, xCoord, yCoord) {
        const nodeToLock = this.registerNode(xCoord, yCoord);
        nodeToLock.isAnchored = true;
        console.log(`Node at (${xCoord}, ${yCoord}) marked as fixed.`);
        return nodeToLock;
    };

    SimulationBase.prototype.registerGraphicNode = function(svgGraphicElement, attributeA, xCoord, yCoord) {
        console.warn("registerGraphicNode is a placeholder and needs implementation specific to graphic types.");
        const physicsNode = this.registerNode(xCoord, yCoord);
        this.graphicElements.push({
            visual: svgGraphicElement,
            physics: physicsNode,
            attrib: attributeA
        });
        return physicsNode;
    };

    SimulationBase.prototype.addFixedEntity = function(component) {
        if (component) {
            this.fixedObjects.push(component);
            console.debug("Added a fixed entity to the simulation.");
        } else {
            console.warn("Attempted to add a null or undefined fixed entity.");
        }
        return this.fixedObjects.length;
    };

    SimulationBase.prototype.attachExtension = function(extension) {
        if (extension && typeof extension.init === 'function' && typeof extension.update === 'function') {
            this.extensionModules.push(extension);
            console.info("Attached new extension module:", extension.constructor.name);
        } else {
            console.error("Invalid extension module provided. Must have 'init' and 'update' methods.");
        }
        return this.extensionModules.length;
    };

    SimulationBase.prototype.checkMobileDevice = function() {
        const userAgentString = navigator.userAgent;
        return userAgentString.match(/Android|iPhone|iPod|iPad|Windows Phone|BlackBerry/i);
    };

    return SimulationBase;

})();

const globalRequestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };

window.requestAnimationFrame = globalRequestAnimationFrame;


/*
	SvgDisplayManager: Core class for parsing SVG content and integrating it into the physics simulation.

	Development Notes:
	1) Refactor Data Parsing: Improve the current SVG parsing mechanism for better modularity and extensibility.
	   The current group-based processing is cumbersome and lacks flexibility.
	2) Decouple from jQuery: The existing implementation heavily relies on jQuery.
	   Consider migrating to native DOM manipulation for reduced dependency and potentially better performance.
*/


shapeRender.SvgDisplayManager = (function(_super) {

    _extendClass(SvgDisplayManager, _super);

    SvgDisplayManager.prototype.assetLoaded = false;
    SvgDisplayManager.prototype.xRenderOffset = 0;
    SvgDisplayManager.prototype.yRenderOffset = 0;
    SvgDisplayManager.prototype.postLoadAction = null;

    function SvgDisplayManager(optionsConfig) {
        this.addSvgConnection = this.addSvgConnection.bind(this);
        this.addPolygonConstraint = this.addPolygonConstraint.bind(this);
        this.addPathConstraint = this.addPathConstraint.bind(this);
        this.addInvisibleConstraint = this.addInvisibleConstraint.bind(this);
        this.registerGraphicNode = this.registerGraphicNode.bind(this);
        this.addStructuralLink = this.addStructuralLink.bind(this);
        this.processSvgGroup = this.processSvgGroup.bind(this);
        this.processByColorAttributes = this.processByColorAttributes.bind(this);
        this.processByGroupElements = this.processByGroupElements.bind(this);
        this.onAssetsReady = this.onAssetsReady.bind(this);

        SvgDisplayManager.__super__.constructor.call(this, optionsConfig);

        Object.assign(this.configuration, optionsConfig);

        if (this.configuration.completionCallback != null) {
            this.postLoadAction = this.configuration.completionCallback;
        }

        this.displayContainer = $(this.configuration.containerSelector);

        if (!this.displayContainer.length) {
            console.error("SVG container not found:", this.configuration.containerSelector);
            return;
        }

        if (this.configuration.dataSourceFile) {
            console.log("Loading SVG file:", this.configuration.dataSourceFile);
            this.displayContainer.load(this.configuration.dataSourceFile, () => {
                console.log("SVG file loaded, initiating onAssetsReady.");
                this.onAssetsReady();
            });
        } else {
            console.warn("No SVG data source file specified. Proceeding with empty scene.");
            setTimeout(() => {
                console.log("No file specified, calling onAssetsReady immediately.");
                this.onAssetsReady();
            }, 10);
        }

        setTimeout(() => {
            window.scrollTo(0, 1);
            console.debug("Scroll adjustment applied.");
        }, 50);
    }

    SvgDisplayManager.prototype.onAssetsReady = function() {
        SvgDisplayManager.__super__.onAssetsReady.call(this);
        console.info("SvgDisplayManager: Assets are ready.");

        this.svgRootElement = this.displayContainer.find("svg")[0];
        if (!this.svgRootElement) {
            console.error("No SVG element found within the container!");
            return;
        }

        const fileLoadedEvent = new CustomEvent("SvgFileLoaded", {
            bubbles: true,
            cancelable: true,
            detail: {
                filename: this.configuration.dataSourceFile
            }
        });
        this.svgRootElement.dispatchEvent(fileLoadedEvent);

        $(this.svgRootElement).hide().fadeIn(500);

        this.processByGroupElements();
        this.adjustVerticalPosition(this.configuration.verticalAlignment);
        this.adjustHorizontalPosition(this.configuration.horizontalAlignment);

        const sceneReadyEvent = new CustomEvent("SvgSceneReady", {
            bubbles: true,
            cancelable: true,
            detail: {
                sceneId: "mainSvgScene"
            }
        });
        this.svgRootElement.dispatchEvent(sceneReadyEvent);

        if (typeof this.postLoadAction === "function") {
            console.log("Executing post-load action callback.");
            this.postLoadAction();
        } else {
            console.log("No post-load action callback defined.");
        }

        return this.onInitializationComplete();
    };

    SvgDisplayManager.prototype.adjustVerticalPosition = function(alignmentOption) {
        let svgHeight = $(this.svgRootElement).height();
        if (svgHeight === 0) {
            console.warn("SVG element height is zero, cannot align vertically.");
            return;
        }

        switch (alignmentOption) {
            case "mid":
                this.yRenderOffset += svgHeight * -0.5;
                console.debug("Vertical alignment set to middle.");
                break;
            case "top":
                this.yRenderOffset = 0;
                console.debug("Vertical alignment set to top.");
                break;
            case "bottom":
                this.yRenderOffset += svgHeight * -1.0;
                console.debug("Vertical alignment set to bottom.");
                break;
            default:
                console.warn(`Unknown vertical alignment option: ${alignmentOption}`);
        }
        return this.updateFrameOffsets();
    };

    SvgDisplayManager.prototype.adjustHorizontalPosition = function(alignmentOption) {
        let svgWidth = $(this.svgRootElement).width();
        if (svgWidth === 0) {
            console.warn("SVG element width is zero, cannot align horizontally.");
            return;
        }

        switch (alignmentOption) {
            case "center":
                this.xRenderOffset += svgWidth * -0.5;
                console.debug("Horizontal alignment set to center.");
                break;
            case "left":
                this.xRenderOffset = 0;
                console.debug("Horizontal alignment set to left.");
                break;
            case "right":
                this.xRenderOffset += svgWidth * -1.0;
                console.debug("Horizontal alignment set to right.");
                break;
            default:
                console.warn(`Unknown horizontal alignment option: ${alignmentOption}`);
        }
        return this.updateFrameOffsets();
    };

    SvgDisplayManager.prototype.updateFrameOffsets = function() {
        if (this.svgRootElement) {
            const mainGroup = $(this.svgRootElement).find('> g[id="main"]');
            if (mainGroup.length) {
                mainGroup.attr('transform', `translate(${this.xRenderOffset}, ${this.yRenderOffset})`);
            } else {
                $(this.svgRootElement).attr('transform', `translate(${this.xRenderOffset}, ${this.yRenderOffset})`);
            }
            console.debug(`Frame offsets updated to X: ${this.xRenderOffset}, Y: ${this.yRenderOffset}`);
        } else {
            console.warn("Cannot update frame offsets: SVG root element is not defined.");
        }
    };

    SvgDisplayManager.prototype.processByGroupElements = function() {
        console.log("Processing SVG elements by groups...");
        $(this.svgRootElement).find('g').each((idx, groupElement) => {
            const groupName = $(groupElement).attr('id') || `group-${idx}`;
            console.debug(`Found SVG group: ${groupName}`);
            this.processSvgGroup(groupElement);
        });
    };

    SvgDisplayManager.prototype.processSvgGroup = function(groupDomElement) {
        console.log(`Analyzing elements within group: ${$(groupDomElement).attr('id') || 'unnamed group'}`);

        $(groupDomElement).find('[physics-static]').each((idx, element) => {
            console.log("Found physics-static element:", element.tagName);
            this.addFixedEntity(element);
        });

        $(groupDomElement).find('path').each((idx, pathElement) => {
            console.debug(`Detected path element in group: ${pathElement.id || `path-${idx}`}`);
            this.addPathConstraint(pathElement);
        });
    };

    SvgDisplayManager.prototype.addPathConstraint = function(pathElement) {
        console.warn(`addPathConstraint for element ${pathElement.id || 'unnamed path'} is not fully implemented.`);
        const startX = parseFloat(pathElement.getAttribute('data-start-x') || 0);
        const startY = parseFloat(pathElement.getAttribute('data-start-y') || 0);
        const endX = parseFloat(pathElement.getAttribute('data-end-x') || 10);
        const endY = parseFloat(pathElement.getAttribute('data-end-y') || 10);

        const node1 = this.registerNode(startX, startY, 'default');
        const node2 = this.registerNode(endX, endY, 'default');
        const rod = new physicsEngine.ConstraintRod(node1, node2);
        this.structuralLinks.push(rod);
        console.info(`Dummy constraint rod added for path element: ${pathElement.id || 'N/A'}.`);
    };

    SvgDisplayManager.prototype.addSvgConnection = function(nodeA, nodeB, isVisible = true) {
        console.log("Adding SVG connection between nodes.");
        const newRod = new physicsEngine.ConstraintRod(nodeA, nodeB);
        this.structuralLinks.push(newRod);
        if (isVisible) {
            const visualLink = {
                type: 'line',
                nodeA: nodeA,
                nodeB: nodeB,
                updateDisplay: function() {
                    // This method would update an actual SVG line element's coordinates
                }
            };
            this.visualConnectors.push(visualLink);
        }
        return newRod;
    };

    SvgDisplayManager.prototype.addPolygonConstraint = function(polygonElement) {
        console.warn(`addPolygonConstraint for element ${polygonElement.id || 'unnamed polygon'} is not fully implemented.`);
        const pointsAttr = polygonElement.getAttribute('points');
        if (!pointsAttr) return;

        const coords = pointsAttr.split(' ').map(s => s.trim().split(',').map(Number)).filter(c => c.length === 2);
        if (coords.length < 3) {
            console.warn("Polygon needs at least 3 points to form constraints.");
            return;
        }

        const polygonNodes = coords.map(c => this.registerNode(c[0], c[1]));
        for (let i = 0; i < polygonNodes.length; i++) {
            const node1 = polygonNodes[i];
            const node2 = polygonNodes[(i + 1) % polygonNodes.length];
            this.addSvgConnection(node1, node2, true);
        }
    };

    SvgDisplayManager.prototype.addInvisibleConstraint = function(nodeA, nodeB) {
        console.log("Adding an invisible constraint between two nodes.");
        return this.addSvgConnection(nodeA, nodeB, false);
    };

    SvgDisplayManager.prototype.addStructuralLink = function(nodeA, nodeB, linkType = 'default') {
        console.log(`Adding a structural link of type '${linkType}' between two nodes.`);
        const newLink = new physicsEngine.ConstraintRod(nodeA, nodeB);
        this.structuralLinks.push(newLink);
        return newLink;
    };


    return SvgDisplayManager;

})();