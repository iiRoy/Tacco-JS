(function () {
    "use strict";

    // --- Core Utility: Interaction Broadcaster (replaces _emitEvent) ---
    class InteractionBroadcaster {
        constructor() {
            this.internalListeners = new Map();
        }

        // Publishes an event to a DOM element and internal subscribers
        signal(channelName, eventPayload, targetDomElement) {
            if (targetDomElement) {
                let customNotice;
                try {
                    customNotice = new CustomEvent(channelName, { detail: eventPayload, bubbles: true, cancelable: true });
                } catch (e) {
                    // Fallback for older browsers (e.g., IE)
                    customNotice = document.createEvent("Event");
                    customNotice.initEvent(channelName, true, true);
                    customNotice.detail = eventPayload;
                }
                targetDomElement.dispatchEvent(customNotice);
            }

            if (this.internalListeners.has(channelName)) {
                this.internalListeners.get(channelName).forEach(callback => callback(eventPayload));
            }
        }

        // Subscribes an internal callback to a channel
        register(channelName, callback) {
            if (!this.internalListeners.has(channelName)) {
                this.internalListeners.set(channelName, []);
            }
            this.internalListeners.get(channelName).push(callback);
        }

        // Unsubscribes an internal callback from a channel
        deregister(channelName, callback) {
            if (this.internalListeners.has(channelName)) {
                const callbacks = this.internalListeners.get(channelName);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        }
    }
    const globalInteractionHub = new InteractionBroadcaster();

    // --- Configuration: Visual Scheme (replaces Template) ---
    class VisualScheme {
        constructor(schemeSettings = {}) {
            this.pointStyle = {
                radius: 6,
                fillColor: "#696969",
                edgeColor: "#696969",
                edgeThickness: 2,
                labelFont: "normal 12pt Arial",
                labelVisibility: true
            };
            this.branchPathStyle = {
                thickness: 2,
                dashPattern: [],
                lineColor: "#696969",
                mergeMethod: "straight" // "bezier" or "straight"
            };
            this.lineLayout = {
                horizontalStride: 40,
                verticalStride: 40,
                pathThickness: 2,
                pathDashPattern: [],
                pathColor: "#696969"
            };
            this.arrowSymbol = {
                enabled: true,
                size: 8,
                color: "#696969"
            };
            this.huePalette = ["#696969", "#A83C8C", "#4F76C4", "#2E9952", "#D28F3F", "#CD5C5C", "#BA55D3", "#87CEEB", "#FFD700", "#FF6347"];

            // Merge with provided settings
            Object.assign(this.pointStyle, schemeSettings.commit ? schemeSettings.commit.dot : {});
            Object.assign(this.pointStyle, schemeSettings.commit ? schemeSettings.commit.message : {});
            Object.assign(this.branchPathStyle, schemeSettings.commit ? schemeSettings.commit.line : {}); // Commit line style
            Object.assign(this.lineLayout, schemeSettings.branch || {}); // Branch layout
            Object.assign(this.arrowSymbol, schemeSettings.arrow || {});
            this.huePalette = schemeSettings.colors || this.huePalette;

            // Apply specific named scheme adjustments
            if (schemeSettings.name === "metro") {
                this.pointStyle.radius = 5;
                this.pointStyle.edgeThickness = 0;
                this.branchPathStyle.thickness = 1;
                this.lineLayout.pathThickness = 1;
                this.lineLayout.horizontalStride = 20;
                this.lineLayout.verticalStride = 20;
            }
        }

        static retrieveScheme(moniker) {
            const predefinedSchemes = {
                "metro": new VisualScheme({
                    name: "metro",
                    commit: {
                        dot: { radius: 5, strokeWidth: 0 },
                        line: { width: 1 }
                    },
                    branch: {
                        pathThickness: 1,
                        horizontalStride: 20,
                        verticalStride: 20
                    }
                }),
                "default": new VisualScheme()
            };
            return predefinedSchemes[moniker] || new VisualScheme();
        }
    }

    // --- Configuration: Visual Direction (replaces orientation switch logic) ---
    const VisualDirection = {
        configure(plotterRef, directionKey) {
            let configMap = {};
            switch (directionKey) {
                case "vertical-reverse":
                    configMap.effectiveVerticalStride = -plotterRef.styleScheme.lineLayout.verticalStride;
                    plotterRef.visualOrientation = "vertical-reverse";
                    break;
                case "horizontal":
                    configMap.labelVisibility = false;
                    configMap.effectiveHorizontalStride = plotterRef.styleScheme.lineLayout.verticalStride; // Swap
                    configMap.verticalLineSpacing = plotterRef.styleScheme.lineLayout.horizontalStride; // Swap
                    configMap.effectiveVerticalStride = 0;
                    configMap.horizontalLineSpacing = 0;
                    plotterRef.visualOrientation = "horizontal";
                    break;
                case "horizontal-reverse":
                    configMap.labelVisibility = false;
                    configMap.effectiveHorizontalStride = -plotterRef.styleScheme.lineLayout.verticalStride; // Swap & reverse
                    configMap.verticalLineSpacing = plotterRef.styleScheme.lineLayout.horizontalStride; // Swap
                    configMap.effectiveVerticalStride = 0;
                    configMap.horizontalLineSpacing = 0;
                    plotterRef.visualOrientation = "horizontal-reverse";
                    break;
                default:
                    plotterRef.visualOrientation = "vertical";
                    break;
            }
            // Apply these changes to the plotter's styleScheme or internal values
            if (configMap.effectiveVerticalStride !== undefined) plotterRef.styleScheme.lineLayout.verticalStride = configMap.effectiveVerticalStride;
            if (configMap.labelVisibility !== undefined) plotterRef.styleScheme.pointStyle.labelVisibility = configMap.labelVisibility;
            if (configMap.effectiveHorizontalStride !== undefined) plotterRef.styleScheme.lineLayout.horizontalStride = configMap.effectiveHorizontalStride;
            if (configMap.verticalLineSpacing !== undefined) plotterRef.styleScheme.lineLayout.verticalStride = configMap.verticalLineSpacing; // This is branch spacing, not commit spacing
            if (configMap.horizontalLineSpacing !== undefined) plotterRef.styleScheme.lineLayout.horizontalStride = configMap.horizontalLineSpacing; // This is branch spacing
        }
    };

    // --- Element: Change Point (replaces implicit Commit object) ---
    class ChangePoint {
        constructor({
            originator,
            developmentLine,
            summary = "No message",
            signature = originator.creatorSignature,
            timestamp = new Date(),
            parentChangeRef,
            detailElementId,
            pointVisualHue,
            arrowEnabled
        }) {
            this.originator = originator; // Reference to the main plotter
            this.developmentLine = developmentLine; // Reference to the branch
            this.summary = summary;
            this.signature = signature;
            this.timestamp = timestamp;
            this.uniqueId = this.generateHash(); // Simplified SHA1
            this.parentChangeRef = parentChangeRef;
            this.detailElementId = detailElementId;
            this.pointVisualHue = pointVisualHue;
            this.arrowEnabled = arrowEnabled;

            this.positionX = 0; // Calculated during layout
            this.positionY = 0; // Calculated during layout
            this.isCurrentlyInteracting = false; // For hover state

            this.originator.allChangePoints.set(this.uniqueId, this);
            this.developmentLine.lineChanges.push(this); // Add to branch's ordered list

            this.calculatePosition();
        }

        generateHash() {
            return Math.random().toString(16).substr(2, 7); // Not a real SHA, for unique ID
        }

        calculatePosition() {
            const scheme = this.originator.styleScheme;
            const line = this.developmentLine;
            const plotter = this.originator;

            let currentX = line.horizontalOffset;
            let currentY = line.verticalOffset;

            // If there's a parent change, position relative to it
            if (this.parentChangeRef) {
                currentX = this.parentChangeRef.positionX + scheme.lineLayout.horizontalStride;
                currentY = this.parentChangeRef.positionY + scheme.lineLayout.verticalStride;
            }

            this.positionX = currentX;
            this.positionY = currentY;

            // Update max graph extents for canvas sizing
            const effectiveX = this.positionX + plotter.leftPadding + plotter.orientationShiftX;
            const effectiveY = this.positionY + plotter.topPadding + plotter.orientationShiftY;

            plotter.maxGraphExtentX = Math.max(plotter.maxGraphExtentX, effectiveX);
            plotter.maxGraphExtentY = Math.max(plotter.maxGraphExtentY, effectiveY);
        }

        drawSelf(painter) {
            const scheme = this.originator.styleScheme;
            painter.beginPath();
            painter.arc(this.positionX, this.positionY, scheme.pointStyle.radius, 0, Math.PI * 2, true);
            painter.fillStyle = this.pointVisualHue;
            painter.fill();
            if (scheme.pointStyle.edgeThickness > 0) {
                painter.lineWidth = scheme.pointStyle.edgeThickness;
                painter.strokeStyle = scheme.pointStyle.edgeColor;
                painter.stroke();
            }
            painter.closePath();

            if (scheme.pointStyle.labelVisibility) {
                painter.font = scheme.pointStyle.labelFont;
                painter.fillStyle = scheme.pointStyle.fillColor;
                painter.fillText(this.summary, this.positionX + scheme.pointStyle.radius + 5, this.positionY + 3);
            }
        }
    }

    // --- Element: Development Line (replaces Branch) ---
    class DevelopmentLine {
        constructor({
            originator,
            upstreamLine,
            designation = "unnamed-line",
            pathThickness,
            pathDashPattern,
            visualHue
        }) {
            if (!(originator instanceof VersionPlotter)) {
                console.error("DevelopmentLine requires a VersionPlotter instance as its originator.");
                return;
            }

            this.originator = originator;
            this.upstreamLine = upstreamLine;
            this.designation = designation;
            this.renderContext = originator.renderContext;
            this.styleScheme = originator.styleScheme;

            this.pathThickness = pathThickness || this.styleScheme.lineLayout.pathThickness;
            this.pathDashPattern = pathDashPattern || this.styleScheme.lineLayout.pathDashPattern;
            this.horizontalStride = this.styleScheme.lineLayout.horizontalStride;
            this.verticalStride = this.styleScheme.lineLayout.verticalStride;

            this.totalChanges = 0; // Number of commits on this line
            this.lineChanges = []; // Ordered list of ChangePoint objects
            this.pathSegments = []; // Data points for drawing the branch path

            this.lineIndex = this.determineLineIndex(); // Column calculation for layout
            this.horizontalOffset = this.lineIndex * this.horizontalStride;
            this.verticalOffset = this.lineIndex * this.verticalStride;

            this.visualHue = visualHue || this.styleScheme.lineLayout.pathColor || this.styleScheme.huePalette[this.lineIndex % this.styleScheme.huePalette.length];

            this.activateSelf(); // Equivalent to checkout
        }

        determineLineIndex() {
            let assignedIndex = 0;
            const existingIndices = new Set(Array.from(this.originator.allDevelopmentLines.values()).map(line => line.lineIndex));
            while (existingIndices.has(assignedIndex)) {
                assignedIndex++;
            }
            return assignedIndex;
        }

        establishNestedLine(config) {
            if (typeof config === "string") {
                config = { designation: config };
            }
            config = { ...config, originator: this.originator, upstreamLine: config.upstreamLine || this };
            const newLine = new DevelopmentLine(config);
            this.originator.allDevelopmentLines.set(newLine.designation, newLine);
            return newLine;
        }

        addChange(details = {}) {
            if (typeof details === "string") {
                details = { summary: details };
            }

            const lastChangeOnThisLine = this.lineChanges.slice(-1)[0];
            const determinedParentRef = details.parentChangeRef || lastChangeOnThisLine;

            const newChange = new ChangePoint({
                originator: this.originator,
                developmentLine: this,
                summary: details.summary,
                signature: details.signature || this.originator.creatorSignature,
                timestamp: details.timestamp,
                parentChangeRef: determinedParentRef,
                detailElementId: details.detailElementId,
                pointVisualHue: details.pointVisualHue || this.visualHue,
                arrowEnabled: this.styleScheme.arrowSymbol.enabled
            });

            this.totalChanges++;

            // --- Path building logic ---
            if (!determinedParentRef && this.lineChanges.length === 1) { // First commit on an orphan/main line
                this.pathSegments.push({
                    positionX: newChange.positionX,
                    positionY: newChange.positionY,
                    segmentKind: "start"
                });
            } else if (determinedParentRef && determinedParentRef.developmentLine !== this) { // Merge/branch from another line
                this.pathSegments.push({
                    positionX: determinedParentRef.positionX,
                    positionY: determinedParentRef.positionY,
                    segmentKind: "start"
                });
                this.pathSegments.push({
                    positionX: newChange.positionX,
                    positionY: newChange.positionY,
                    segmentKind: "join",
                    fromPoint: determinedParentRef,
                    toPoint: newChange
                });
            } else { // Regular commit on this line or first commit on a branched line
                if (this.lineChanges.length === 1) { // First commit on a branched line (e.g. branch from main)
                    this.pathSegments.push({
                        positionX: newChange.positionX,
                        positionY: newChange.positionY,
                        segmentKind: "start"
                    });
                } else { // Subsequent commits on the same line
                    this.pathSegments.push({
                        positionX: newChange.positionX,
                        positionY: newChange.positionY,
                        segmentKind: "segment",
                        toPoint: newChange
                    });
                }
            }
            // --- End Path building logic ---

            this.originator.refreshVisuals();
        }

        activateSelf() {
            this.originator.currentActiveLine = this;
        }

        plotPath(painter) {
            painter.beginPath();
            painter.lineWidth = this.pathThickness;
            painter.strokeStyle = this.visualHue;
            if (painter.setLineDash) {
                painter.setLineDash(this.pathDashPattern);
            }

            for (let i = 0; i < this.pathSegments.length; i++) {
                const currentSegmentPoint = this.pathSegments[i];
                const previousSegmentPoint = this.pathSegments[i - 1];

                if (currentSegmentPoint.segmentKind === "start") {
                    painter.moveTo(currentSegmentPoint.positionX, currentSegmentPoint.positionY);
                } else if (currentSegmentPoint.segmentKind === "join" && this.styleScheme.branchPathStyle.mergeMethod === "bezier" && previousSegmentPoint) {
                    painter.bezierCurveTo(
                        previousSegmentPoint.positionX - this.styleScheme.lineLayout.horizontalStride / 2, previousSegmentPoint.positionY - this.styleScheme.lineLayout.verticalStride / 2,
                        currentSegmentPoint.positionX + this.styleScheme.lineLayout.horizontalStride / 2, currentSegmentPoint.positionY + this.styleScheme.lineLayout.verticalStride / 2,
                        currentSegmentPoint.positionX, currentSegmentPoint.positionY
                    );
                } else {
                    painter.lineTo(currentSegmentPoint.positionX, currentSegmentPoint.positionY);
                }
            }
            painter.stroke();
            painter.closePath();
        }
    }

    // --- Main Component: Version Plotter (replaces GitGraph) ---
    class VersionPlotter {
        constructor(preferences = {}) {
            const {
                canvasElementId = "versionPlotterCanvas",
                creatorSignature = "Default Author <default@example.com>",
                visualScheme,
                compactDisplayMode,
                canvasDomElement,
                orientationType
            } = preferences;

            this.canvasElementId = canvasElementId;
            this.creatorSignature = creatorSignature;

            // Visual Scheme (Template) management
            if (typeof visualScheme === "string") {
                this.styleScheme = VisualScheme.retrieveScheme(visualScheme);
            } else if (visualScheme instanceof VisualScheme) {
                this.styleScheme = visualScheme;
            } else if (typeof visualScheme === "object") {
                this.styleScheme = new VisualScheme(visualScheme);
            } else {
                this.styleScheme = VisualScheme.retrieveScheme("default");
            }

            this.compactDisplayMode = compactDisplayMode || null;
            if (this.compactDisplayMode === "compact") {
                this.styleScheme.pointStyle.labelVisibility = false;
            }

            this.leftPadding = this.styleScheme.pointStyle.radius * 2;
            this.topPadding = this.styleScheme.pointStyle.radius * 2;
            this.orientationShiftX = 0; // Additional shift due to orientation
            this.orientationShiftY = 0;

            // Orientation setup
            VisualDirection.configure(this, orientationType);

            // Canvas initialization
            this.drawingSurface = canvasDomElement || document.getElementById(this.canvasElementId);
            if (!this.drawingSurface || !(this.drawingSurface instanceof HTMLCanvasElement)) {
                console.error("VersionPlotter: Drawing surface element not found or is not a canvas. ID:", this.canvasElementId, "Element:", canvasDomElement);
                return;
            }
            this.renderContext = this.drawingSurface.getContext("2d");

            // Info Overlay (Tooltip)
            this.infoOverlay = document.createElement("div");
            this.infoOverlay.className = "version-plotter-info-overlay";
            this.infoOverlay.style.position = "fixed";
            this.infoOverlay.style.display = "none";
            document.body.appendChild(this.infoOverlay);

            // Graph state management
            this.currentActiveLine = null; // Equivalent to HEAD
            this.allDevelopmentLines = new Map(); // Stores DevelopmentLine objects by designation
            this.allChangePoints = new Map(); // Stores all ChangePoint objects by unique ID

            // Layout metrics
            this.maxGraphExtentX = 0; // Max X coordinate for canvas sizing
            this.maxGraphExtentY = 0; // Max Y coordinate for canvas sizing
            this.currentTotalTranslateX = 0; // Tracks total X translation applied to context
            this.currentTotalTranslateY = 0; // Tracks total Y translation applied to context

            // Event bindings
            const interactionHandler = {
                handleEvent: this.processInteraction,
                plotterReference: this
            };
            this.drawingSurface.addEventListener("mousemove", interactionHandler, false);
            window.addEventListener("resize", this.refreshVisuals.bind(this));
        }

        establishLine(config) {
            if (typeof config === "string") {
                config = { designation: config };
            }
            config = { ...config, originator: this, upstreamLine: config.upstreamLine || this.currentActiveLine };
            const newLine = new DevelopmentLine(config);
            this.allDevelopmentLines.set(newLine.designation, newLine);
            return newLine;
        }

        establishOrphanLine(config) {
            if (typeof config === "string") {
                config = { designation: config };
            }
            config = { ...config, originator: this, upstreamLine: null }; // No parent line
            const newLine = new DevelopmentLine(config);
            this.allDevelopmentLines.set(newLine.designation, newLine);
            return newLine;
        }

        addChange(details) {
            if (!this.currentActiveLine) {
                console.warn("No active line established to add a change to. Create a line first.");
                return this;
            }
            this.currentActiveLine.addChange(details);
            return this;
        }

        createVisualScheme(moniker) {
            if (typeof moniker === "string") {
                return VisualScheme.retrieveScheme(moniker);
            }
            return new VisualScheme(moniker);
        }

        refreshVisuals() {
            let pixelRatioMultiplier = 1;
            if (window.devicePixelRatio) {
                const backingStoreRatio = this.renderContext.webkitBackingStorePixelRatio ||
                                          this.renderContext.mozBackingStorePixelRatio ||
                                          this.renderContext.msBackingStorePixelRatio ||
                                          this.renderContext.oBackingStorePixelRatio ||
                                          this.renderContext.backingStorePixelRatio || 1;
                pixelRatioMultiplier *= window.devicePixelRatio / backingStoreRatio;
            }

            // Calculate unscaled resolution based on content extent
            let desiredWidth = this.maxGraphExtentX + this.styleScheme.pointStyle.radius * 2;
            let desiredHeight = this.maxGraphExtentY + this.styleScheme.pointStyle.radius * 2;

            if (this.styleScheme.pointStyle.labelVisibility) {
                desiredWidth += 800; // Arbitrary extra space for labels
            }

            this.drawingSurface.style.width = desiredWidth + "px";
            this.drawingSurface.style.height = desiredHeight + "px";

            this.drawingSurface.width = desiredWidth * pixelRatioMultiplier;
            this.drawingSurface.height = desiredHeight * pixelRatioMultiplier;

            this.renderContext.scale(pixelRatioMultiplier, pixelRatioMultiplier);

            this.renderContext.clearRect(0, 0, this.drawingSurface.width, this.drawingSurface.height);
            this.renderContext.save(); // Save initial context state

            // Apply initial padding translation
            this.currentTotalTranslateX = this.leftPadding;
            this.currentTotalTranslateY = this.topPadding;
            this.renderContext.translate(this.currentTotalTranslateX, this.currentTotalTranslateY);

            // Apply orientation-specific translations
            if (this.styleScheme.lineLayout.verticalStride > 0) { // e.g., "vertical-reverse"
                const verticalShift = this.drawingSurface.height / pixelRatioMultiplier - this.topPadding * 2;
                this.renderContext.translate(0, verticalShift);
                this.currentTotalTranslateY += verticalShift;
            }
            if (this.styleScheme.lineLayout.horizontalStride > 0) { // e.g., "horizontal-reverse"
                const horizontalShift = this.drawingSurface.width / pixelRatioMultiplier - this.leftPadding * 2;
                this.renderContext.translate(horizontalShift, 0);
                this.currentTotalTranslateX += horizontalShift;
            }

            // Render lines (branches) - in reverse order to draw main branches behind
            for (const line of Array.from(this.allDevelopmentLines.values()).reverse()) {
                line.plotPath(this.renderContext);
            }

            // Render change points (commits) - on top
            for (const point of this.allChangePoints.values()) {
                point.drawSelf(this.renderContext);
            }

            this.renderContext.restore(); // Restore to initial context state
        }

        processInteraction(interactionEvent) {
            const self = this.plotterReference;
            let interactionDetected = false;

            const canvasRect = self.drawingSurface.getBoundingClientRect();
            const mouseX = interactionEvent.clientX - canvasRect.left;
            const mouseY = interactionEvent.clientY - canvasRect.top;

            // Adjust mouse coordinates to match the canvas's current translated origin
            const adjustedMouseX = mouseX - self.currentTotalTranslateX;
            const adjustedMouseY = mouseY - self.currentTotalTranslateY;

            for (const point of self.allChangePoints.values()) {
                const distanceX = (point.positionX - adjustedMouseX);
                const distanceY = (point.positionY - adjustedMouseY);
                const distanceToPoint = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                const isOverPoint = distanceToPoint < self.styleScheme.pointStyle.radius;

                if (isOverPoint) {
                    if (!self.styleScheme.pointStyle.labelVisibility) {
                        self.infoOverlay.style.left = interactionEvent.clientX + "px";
                        self.infoOverlay.style.top = interactionEvent.clientY + "px";
                        self.infoOverlay.textContent = `${point.uniqueId} - ${point.summary}`;
                        self.infoOverlay.style.display = "block";
                    }

                    if (!point.isCurrentlyInteracting) {
                        globalInteractionHub.signal("versionPlotter:pointHovered", {
                            authorIdentity: point.signature,
                            summaryContent: point.summary,
                            eventTime: point.timestamp,
                            shaHash: point.uniqueId
                        }, self.drawingSurface);
                    }

                    interactionDetected = true;
                    point.isCurrentlyInteracting = true;
                } else {
                    point.isCurrentlyInteracting = false;
                }
            }

            if (!interactionDetected) {
                self.infoOverlay.style.display = "none";
            }
        }
    }

    // Expose the main class to the global scope
    window.VersionPlotter = VersionPlotter;

})();