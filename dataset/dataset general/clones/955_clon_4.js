!function(factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        var targetScope;
        if (typeof window !== "undefined") {
            targetScope = window;
        } else if (typeof global !== "undefined") {
            targetScope = global;
        } else if (typeof self !== "undefined") {
            targetScope = self;
        }
        targetScope.AdvancedMapping = factory();
    }
}(function() {
    class EventHub {
        constructor() {
            this.listeners = {};
        }

        on(eventName, callback) {
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }
            this.listeners[eventName].push(callback);
            return this;
        }

        emit(eventName, ...args) {
            if (this.listeners[eventName]) {
                this.listeners[eventName].forEach(callback => callback(...args));
            }
            return this;
        }
    }

    class VisualLayer {
        constructor(config = {}) {
            this.visualIdentifier = `visual-${Math.random().toString(36).substr(2, 9)}`;
            this.visualPath = config.path || "";
            this.visualType = config.type || "";
            this.visualVisibility = config.visibility !== undefined ? config.visibility : true;
            this.visualActive = config.active !== undefined ? config.active : true;
            this.visualRenderMode = config.renderMode || "canvas";
            this.visualClass = config.cssClass || "default";
            this.visualLabel = config.label || "unlabeled";
            this.visualXAccessor = config.x || (d => d["x"]);
            this.visualYAccessor = config.y || (d => d["y"]);
            this.visualGroupElement = null;
            this.visualDataObject = config.dataObject || null;
            this.visualFeatures = config.features || null;
            this.visualTileScheme = config.tileType || "mapbox";
            this.visualSpecificSelection = config.specificFeature || "all";
            this.visualMarkerSizing = config.markerSize || (() => 5);
            this.visualMarkerColoring = config.markerColor || null;
            this.visualStrokeColoring = config.strokeColor || null;
            this.visualStrokeWidth = config.strokeWidth || null;
            this.visualClustering = config.cluster || false;
            this.visualClickable = config.clickableFeatures || false;
            this.visualModalContent = config.modal || null;
            this.visualDataSource = config.dataset || null;

            this.visualEvents = new EventHub();

            // Normalize accessors
            if (typeof this.visualXAccessor === "string") {
                const key = this.visualXAccessor;
                this.visualXAccessor = d => d[key];
            } else if (typeof this.visualXAccessor === "number") {
                const val = this.visualXAccessor;
                this.visualXAccessor = () => val;
            }

            if (typeof this.visualYAccessor === "string") {
                const key = this.visualYAccessor;
                this.visualYAccessor = d => d[key];
            } else if (typeof this.visualYAccessor === "number") {
                const val = this.visualYAccessor;
                this.visualYAccessor = () => val;
            }

            if (typeof this.visualMarkerSizing === "string") {
                const key = this.visualMarkerSizing;
                this.visualMarkerSizing = d => d[key];
            } else if (typeof this.visualMarkerSizing === "number") {
                const val = this.visualMarkerSizing;
                this.visualMarkerSizing = () => val;
            }
            
            if (typeof this.visualMarkerColoring === "string") {
                const val = this.visualMarkerColoring;
                this.visualMarkerColoring = () => val;
            }

            if (typeof this.visualStrokeColoring === "string") {
                const val = this.visualStrokeColoring;
                this.visualStrokeColoring = () => val;
            }

            if (typeof this.visualStrokeWidth === "number") {
                const val = this.visualStrokeWidth;
                this.visualStrokeWidth = () => val;
            }

            this.on = this.visualEvents.on.bind(this.visualEvents);
        }

        getIdentifier() { return this.visualIdentifier; }
        getPath(p) { return p === undefined ? this.visualPath : (this.visualPath = p, this); }
        getType(t) { return t === undefined ? this.visualType : (this.visualType = t, this); }
        isVisible(v) { return v === undefined ? this.visualVisibility : (this.visualVisibility = v, this); }
        getRenderMode(m) { return m === undefined ? this.visualRenderMode : (this.visualRenderMode = m, this); }
        isClickable(s) { return s === undefined ? this.visualClickable : (this.visualClickable = s, this); }
        getModal(m) {
            if (m === undefined) return this.visualModalContent;
            this.visualModalContent = m;
            this.visualEvents.emit('newmodal');
            return this;
        }
        getXAccessor(x) {
            if (x === undefined) return this.visualXAccessor;
            if (typeof x === "function") this.visualXAccessor = x;
            else if (typeof x === "number") this.visualXAccessor = () => x;
            else this.visualXAccessor = d => d[x];
            return this;
        }
        getYAccessor(y) {
            if (y === undefined) return this.visualYAccessor;
            if (typeof y === "function") this.visualYAccessor = y;
            else if (typeof y === "number") this.visualYAccessor = () => y;
            else this.visualYAccessor = d => d[y];
            return this;
        }
        getMarkerSize(s) {
            if (s === undefined) return this.visualMarkerSizing;
            if (typeof s === "function") this.visualMarkerSizing = s;
            else if (typeof s === "number") this.visualMarkerSizing = () => s;
            else this.visualMarkerSizing = d => d[s];
            return this;
        }
        getMarkerColor(c) {
            if (c === undefined) return this.visualMarkerColoring;
            if (typeof c === "function") this.visualMarkerColoring = c;
            else this.visualMarkerColoring = () => c;
            return this;
        }
        getStrokeColor(c) {
            if (c === undefined) return this.visualStrokeColoring;
            if (typeof c === "function") this.visualStrokeColoring = c;
            else this.visualStrokeColoring = () => c;
            return this;
        }
        getStrokeWidth(w) {
            if (w === undefined) return this.visualStrokeWidth;
            if (typeof w === "function") this.visualStrokeWidth = w;
            else this.visualStrokeWidth = () => w;
            return this;
        }
        getCssClass(c) { return c === undefined ? this.visualClass : (this.visualClass = c, this); }
        getGroupElement(g) { return g === undefined ? this.visualGroupElement : (this.visualGroupElement = g, this); }
        getDataObject(o) {
            if (o === undefined) return this.visualDataObject;
            this.visualDataObject = o;
            this.visualEvents.emit('load');
            return this;
        }
        getFeatures(f) { return f === undefined ? this.visualFeatures : (this.visualFeatures = f, this); }
        getTileScheme(t) { return t === undefined ? this.visualTileScheme : (this.visualTileScheme = t, this); }
        getLabel(l) { return l === undefined ? this.visualLabel : (this.visualLabel = l, this); }
        getSpecificSelection(s) { return s === undefined ? this.visualSpecificSelection : (this.visualSpecificSelection = s, this); }
        getDataSource(d) { return d === undefined ? this.visualDataSource : (this.visualDataSource = d, this); }
        isClustered(c) { return c === undefined ? this.visualClustering : (this.visualClustering = c, this); }
        triggerRecluster() { this.visualEvents.emit('recluster'); }
        getClusterLayer() {
            return this.visualDataObject ? this.visualDataObject.qtreeLayer : null;
        }

        render(context, transform) {
            if (!this.visualVisibility) return;

            context.save();
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);

            if (this.visualType === "tile") {
                context.fillStyle = "#eee";
                context.fillRect(0, 0, context.canvas.width / transform.k, context.canvas.height / transform.k);
                context.font = "16px Arial";
                context.fillStyle = "black";
                context.fillText(`Mock Tile Layer: ${this.visualLabel}`, 20, 30);
            } else if (["points", "csv", "xyarray"].includes(this.visualType)) {
                const fillColor = this.visualMarkerColoring ? this.visualMarkerColoring({}) : "red";
                const strokeColor = this.visualStrokeColoring ? this.visualStrokeColoring({}) : "black";
                const lineWidth = this.visualStrokeWidth ? this.visualStrokeWidth({}) : 1;
                
                context.fillStyle = fillColor;
                context.strokeStyle = strokeColor;
                context.lineWidth = lineWidth;
                for (let i = 0; i < 5; i++) {
                    const x = 50 + i * 20;
                    const y = 50 + i * 20;
                    const size = this.visualMarkerSizing({});
                    context.beginPath();
                    context.arc(x, y, size, 0, 2 * Math.PI);
                    context.fill();
                    context.stroke();
                }
                context.fillText(`Mock Point Layer: ${this.visualLabel}`, 20, 60);
            } else if (["geojson", "topojson", "featurearray"].includes(this.visualType)) {
                const strokeColor = this.visualStrokeColoring ? this.visualStrokeColoring({}) : "blue";
                const lineWidth = this.visualStrokeWidth ? this.visualStrokeWidth({}) : 2;
                const fillColor = this.visualMarkerColoring ? this.visualMarkerColoring({}) : "lightblue";

                context.strokeStyle = strokeColor;
                context.lineWidth = lineWidth;
                context.fillStyle = fillColor;
                context.beginPath();
                context.rect(100, 100, 50, 50);
                context.fill();
                context.stroke();
                context.fillText(`Mock Feature Layer: ${this.visualLabel}`, 20, 90);
            }
            context.restore();
        }

        static createTopojson() { return new VisualLayer({ type: "topojson" }); }
        static createGeojson() { return new VisualLayer({ type: "geojson" }); }
        static createCsv() { return new VisualLayer({ type: "csv" }); }
        static createXyArray() { return new VisualLayer({ type: "xyarray" }); }
        static createFeatureArray() { return new VisualLayer({ type: "featurearray" }); }
        static createTile() { return new VisualLayer({ type: "tile" }); }
    }

    class MappingEngine {
        constructor() {
            this.engineContainer = null;
            this.reprojectionContainer = null;
            this.backgroundRenderer = null;
            this.overlayRenderer = null;
            this.mainInteractionLayer = null;
            this.controlHost = null;

            this.activeProjection = null;
            this.interactionHandler = { x: 0, y: 0, k: 1 };
            this.currentViewCenter = [12, 42];
            this.displayHeight = 10;
            this.displayWidth = 10;
            this.rasterReprojectionActive = false;
            this.workingDistance = 100;
            this.lastInteractionPos = { x: 0, y: 0 };
            this.rotateOrigin = null;
            this.touchInitialSeparation = 0;
            this.touchInitialRotation = 0;
            this.touchInitialScale = 1;

            this.quadTreeScaleFactor = 0.1;
            this.newPointsLayer = null;
            this.newFeaturesLayer = null;

            this.onScaleStart = () => { /* console.log("Scale start"); */ };
            this.onScaleUpdate = () => { /* console.log("Scale update"); */ this.renderAllLayers(); };
            this.onScaleEnd = () => { /* console.log("Scale end"); */ };

            this.renderCanvasContext = null;
            this.tileRenderContext = null;

            this.interactionMode = "transform";

            this.registeredVisuals = [];

            this.providerConfigurations = {
                stamen: { path: "tile.stamen.com", type: "jpg" },
                mapbox: { path: "tiles.mapbox.com/v3", type: "png" },
                cartodb: { path: "basemaps.cartocdn.com", type: "png" }
            };

            this.currentProjection = null;
            this.geoPathGenerator = null;

            this.linkedEngines = [];
        }

        initialize(containerElement) {
            this.engineContainer = containerElement;
            this.engineContainer.style.position = "relative";
            this.engineContainer.style.overflow = "hidden";

            this._createBaseElements();
            this._createControlPanels();
            this._setupInteractionListeners();

            this.setInteractionMode("transform");
            this.rebuildVisualControls();
            this.resize();
            this.centerOn(this.currentViewCenter, "latlong", 0);

            const originalOnResize = window.onresize;
            window.onresize = (event) => {
                this.resize();
                if (typeof originalOnResize === 'function') {
                    originalOnResize(event);
                }
            };

            return this;
        }

        _createBaseElements() {
            this.reprojectionContainer = document.createElement("div");
            this.reprojectionContainer.id = "reprojectionContainer";
            Object.assign(this.reprojectionContainer.style, {
                overflow: "hidden", height: "100%", width: "100%", position: "absolute"
            });
            this.engineContainer.appendChild(this.reprojectionContainer);

            this.backgroundRenderer = document.createElement("canvas");
            this.backgroundRenderer.id = "backgroundRenderer";
            Object.assign(this.backgroundRenderer.style, {
                height: "100%", width: "100%", position: "absolute", zIndex: "-1", transformOrigin: "0 0"
            });
            this.engineContainer.appendChild(this.backgroundRenderer);
            this.tileRenderContext = this.backgroundRenderer.getContext('2d');

            this.overlayRenderer = document.createElement("canvas");
            this.overlayRenderer.id = "overlayRenderer";
            Object.assign(this.overlayRenderer.style, {
                height: "100%", width: "100%", pointerEvents: "none", position: "absolute", zIndex: "0", transformOrigin: "0 0"
            });
            this.engineContainer.appendChild(this.overlayRenderer);
            this.renderCanvasContext = this.overlayRenderer.getContext('2d');

            this.mainInteractionLayer = document.createElement("div");
            this.mainInteractionLayer.id = "mainInteractionLayer";
            Object.assign(this.mainInteractionLayer.style, {
                height: "100%", width: "100%", position: "absolute", zIndex: "1", cursor: "grab"
            });
            this.engineContainer.appendChild(this.mainInteractionLayer);
        }

        _createControlPanels() {
            this.visualControlPanel = document.createElement("div");
            this.visualControlPanel.id = "visualControlPanel";
            Object.assign(this.visualControlPanel.style, {
                 position: "absolute", top: "10px", left: "10px", zIndex: "2",
                 background: "rgba(255,255,255,0.8)", padding: "5px", borderRadius: "5px",
                 fontFamily: "sans-serif", fontSize: "12px"
            });
            this.engineContainer.insertBefore(this.visualControlPanel, this.mainInteractionLayer);
            const contentBox = document.createElement("div");
            contentBox.id = "controlContentBox";
            this.visualControlPanel.appendChild(contentBox);

            this.scaleControlPanel = document.createElement("div");
            this.scaleControlPanel.id = "scaleControlPanel";
            this.scaleControlPanel.className = "engineControlsBox";
            Object.assign(this.scaleControlPanel.style, {
                 position: "absolute", bottom: "10px", right: "10px", zIndex: "2",
                 background: "rgba(255,255,255,0.8)", padding: "5px", borderRadius: "5px",
                 display: "flex", flexDirection: "column", gap: "5px"
            });
            this.engineContainer.insertBefore(this.scaleControlPanel, this.mainInteractionLayer);

            this.navigationControlPanel = document.createElement("div");
            this.navigationControlPanel.id = "navigationControlPanel";
            this.navigationControlPanel.className = "engineControlsBox";
             Object.assign(this.navigationControlPanel.style, {
                 position: "absolute", bottom: "10px", left: "10px", zIndex: "2",
                 background: "rgba(255,255,255,0.8)", padding: "5px", borderRadius: "5px",
                 display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", width: "70px"
            });
            this.engineContainer.insertBefore(this.navigationControlPanel, this.mainInteractionLayer);

            ["in", "out"].forEach(dir => {
                const button = document.createElement("button");
                button.className = "scaleControl";
                button.id = `scale-${dir}`;
                button.textContent = dir === "in" ? "+" : "-";
                Object.assign(button.style, {
                    width: "30px", height: "30px", fontSize: "16px", cursor: "pointer"
                });
                button.addEventListener("click", () => this._processScaleChange(dir));
                this.scaleControlPanel.appendChild(button);
            });

            const panSymbols = { "up": "\u2191", "down": "\u2193", "left": "\u2190", "right": "\u2192" };
            const panOrder = ["", "up", "", "left", "", "right", "", "down", ""];
            panOrder.forEach(dir => {
                const button = document.createElement("button");
                if (dir) {
                    button.className = "navigationControl";
                    button.id = `nav-${dir}`;
                    button.innerHTML = panSymbols[dir];
                     Object.assign(button.style, {
                        width: "22px", height: "22px", fontSize: "14px", cursor: "pointer", gridColumn: dir === "up" || dir === "down" ? "2" : "auto"
                    });
                    button.addEventListener("click", () => this._processNavigationChange(dir, 0.5));
                    this.navigationControlPanel.appendChild(button);
                } else {
                    const emptyDiv = document.createElement("div");
                    Object.assign(emptyDiv.style, { width: "22px", height: "22px" });
                    this.navigationControlPanel.appendChild(emptyDiv);
                }
            });
        }

        _setupInteractionListeners() {
            this.mainInteractionLayer.addEventListener("wheel", (e) => this._handleWheel(e), { passive: false });
            this.mainInteractionLayer.addEventListener("mousedown", (e) => this._handleMouseDown(e));
            this.mainInteractionLayer.addEventListener("touchstart", (e) => this._handleTouchStart(e), { passive: false });
            document.addEventListener("mousemove", (e) => this._handleMouseMove(e));
            document.addEventListener("mouseup", (e) => this._handleMouseUp(e));
            this.mainInteractionLayer.addEventListener("touchmove", (e) => this._handleTouchMove(e), { passive: false });
            this.mainInteractionLayer.addEventListener("touchend", (e) => this._handleTouchEnd(e));
        }

        _handleWheel(event) {
            event.preventDefault();
            const scaleFactor = 1.2;
            const mapRect = this.engineContainer.getBoundingClientRect();
            const mouseX = event.clientX - mapRect.left;
            const mouseY = event.clientY - mapRect.top;

            const oldScale = this.interactionHandler.k;
            let newScale = event.deltaY < 0 ? oldScale * scaleFactor : oldScale / scaleFactor;
            newScale = Math.max(0.1, Math.min(newScale, 100));

            this.interactionHandler.x = mouseX - ((mouseX - this.interactionHandler.x) / oldScale) * newScale;
            this.interactionHandler.y = mouseY - ((mouseY - this.interactionHandler.y) / oldScale) * newScale;
            this.interactionHandler.k = newScale;

            this._applyTransform();
            this.onScaleUpdate();
        }

        _handleMouseDown(event) {
            if (this.interactionMode !== "transform") return;
            this.lastInteractionPos = { x: event.clientX, y: event.clientY };
            this.mainInteractionLayer.style.cursor = "grabbing";
            this.mainInteractionLayer.dataset.dragging = "true";
        }

        _handleMouseMove(event) {
            if (this.mainInteractionLayer.dataset.dragging !== "true") return;
            event.preventDefault();

            const dx = event.clientX - this.lastInteractionPos.x;
            const dy = event.clientY - this.lastInteractionPos.y;

            this.interactionHandler.x += dx;
            this.interactionHandler.y += dy;
            this.lastInteractionPos = { x: event.clientX, y: event.clientY };

            this._applyTransform();
            this.onScaleUpdate();
        }

        _handleMouseUp(event) {
            this.mainInteractionLayer.dataset.dragging = "false";
            this.mainInteractionLayer.style.cursor = "grab";
        }

        _handleTouchStart(event) {
            if (this.interactionMode !== "transform") return;
            event.preventDefault();

            if (event.touches.length === 1) {
                this.lastInteractionPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
                this.mainInteractionLayer.dataset.dragging = "true";
            } else if (event.touches.length === 2) {
                this.mainInteractionLayer.dataset.dragging = "false";
                const t1 = event.touches[0];
                const t2 = event.touches[1];
                this.touchInitialSeparation = Math.sqrt(
                    Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2)
                );
                this.touchInitialScale = this.interactionHandler.k;
            }
        }

        _handleTouchMove(event) {
            if (this.interactionMode !== "transform") return;
            event.preventDefault();

            if (event.touches.length === 1 && this.mainInteractionLayer.dataset.dragging === "true") {
                const dx = event.touches[0].clientX - this.lastInteractionPos.x;
                const dy = event.touches[0].clientY - this.lastInteractionPos.y;

                this.interactionHandler.x += dx;
                this.interactionHandler.y += dy;
                this.lastInteractionPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };

                this._applyTransform();
                this.onScaleUpdate();
            } else if (event.touches.length === 2) {
                const t1 = event.touches[0];
                const t2 = event.touches[1];
                const currentSeparation = Math.sqrt(
                    Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2)
                );
                const scale = (currentSeparation / this.touchInitialSeparation) * this.touchInitialScale;
                const oldScale = this.interactionHandler.k;
                let newScale = Math.max(0.1, Math.min(scale, 100));

                const mapRect = this.engineContainer.getBoundingClientRect();
                const midX = (t1.clientX + t2.clientX) / 2 - mapRect.left;
                const midY = (t1.clientY + t2.clientY) / 2 - mapRect.top;

                this.interactionHandler.x = midX - ((midX - this.interactionHandler.x) / oldScale) * newScale;
                this.interactionHandler.y = midY - ((midY - this.interactionHandler.y) / oldScale) * newScale;
                this.interactionHandler.k = newScale;

                this._applyTransform();
                this.onScaleUpdate();
            }
        }

        _handleTouchEnd(event) {
            this.mainInteractionLayer.dataset.dragging = "false";
            this.touchInitialSeparation = 0;
            this.touchInitialScale = 1;
        }

        _applyTransform() {
            const transformStyle = `translate(${this.interactionHandler.x}px, ${this.interactionHandler.y}px) scale(${this.interactionHandler.k})`;
            this.backgroundRenderer.style.transform = transformStyle;
            this.overlayRenderer.style.transform = transformStyle;
        }

        _processScaleChange(direction) {
            const scaleFactor = 1.5;
            const currentScale = this.interactionHandler.k;
            let newScale;

            const mapCenterX = this.displayWidth / 2;
            const mapCenterY = this.displayHeight / 2;

            if (direction === "in") {
                newScale = currentScale * scaleFactor;
            } else {
                newScale = currentScale / scaleFactor;
            }
            newScale = Math.max(0.1, Math.min(newScale, 100));

            this.interactionHandler.x = mapCenterX - ((mapCenterX - this.interactionHandler.x) / currentScale) * newScale;
            this.interactionHandler.y = mapCenterY - ((mapCenterY - this.interactionHandler.y) / currentScale) * newScale;
            this.interactionHandler.k = newScale;

            this._applyTransform();
            this.onScaleUpdate();
        }

        _processNavigationChange(direction, amount) {
            const panAmount = 100 * amount;
            switch (direction) {
                case "up": this.interactionHandler.y -= panAmount; break;
                case "down": this.interactionHandler.y += panAmount; break;
                case "left": this.interactionHandler.x -= panAmount; break;
                case "right": this.interactionHandler.x += panAmount; break;
            }
            this._applyTransform();
            this.onScaleUpdate();
        }

        setInteractionMode(newMode) {
            this.interactionMode = newMode;
            this.mainInteractionLayer.style.cursor = newMode === "transform" ? "grab" : "default";
            return this;
        }

        resize() {
            const rect = this.engineContainer.getBoundingClientRect();
            this.displayWidth = rect.width;
            this.displayHeight = rect.height;

            this.backgroundRenderer.width = this.displayWidth;
            this.backgroundRenderer.height = this.displayHeight;
            this.overlayRenderer.width = this.displayWidth;
            this.overlayRenderer.height = this.displayHeight;

            this._applyTransform();
            this.renderAllLayers();
            return this;
        }

        centerOn(coords, type, duration) {
            this.interactionHandler = { x: 0, y: 0, k: 1 };
            this._applyTransform();
            this.onScaleUpdate();
            return this;
        }

        addVisual(visualInstance) {
            if (!(visualInstance instanceof VisualLayer)) {
                console.error("Provided object is not a VisualLayer instance.");
                return this;
            }
            this.registeredVisuals.push(visualInstance);
            this.rebuildVisualControls();
            this.renderAllLayers();
            return this;
        }

        rebuildVisualControls() {
            const contentBox = this.visualControlPanel.querySelector("#controlContentBox");
            if (!contentBox) return;

            contentBox.innerHTML = "";
            const visualList = document.createElement("ul");
            Object.assign(visualList.style, { listStyle: "none", padding: "0", margin: "0" });


            this.registeredVisuals.forEach(visual => {
                if (visual.isClustered()) return;

                const listItem = document.createElement("li");
                listItem.id = `visual-control-${visual.getIdentifier()}`;
                Object.assign(listItem.style, { marginBottom: "5px" });
                listItem.addEventListener("click", (e) => {
                    if (e.target.tagName !== "INPUT") {
                        const checkbox = listItem.querySelector("input[type='checkbox']");
                        checkbox.checked = !checkbox.checked;
                        this._handleVisualToggle(visual);
                    }
                });

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = visual.isVisible();
                checkbox.addEventListener("change", () => this._handleVisualToggle(visual));
                Object.assign(checkbox.style, { marginRight: "5px" });


                const labelSpan = document.createElement("span");
                labelSpan.textContent = visual.getLabel();

                listItem.appendChild(checkbox);
                listItem.appendChild(labelSpan);
                visualList.appendChild(listItem);
            });
            contentBox.appendChild(visualList);
        }

        _handleVisualToggle(visual) {
            visual.isVisible(!visual.isVisible());
            if (visual.visualDataObject && visual.visualDataObject.mixed) {
                this.registeredVisuals.forEach(v => {
                    if (v.visualDataObject && v.visualDataObject.id === visual.visualDataObject.mixedupDup) {
                        v.isVisible(visual.isVisible());
                    }
                });
            }
            this.renderAllLayers();
        }

        renderAllLayers() {
            this.tileRenderContext.clearRect(0, 0, this.backgroundRenderer.width, this.backgroundRenderer.height);
            this.renderCanvasContext.clearRect(0, 0, this.overlayRenderer.width, this.overlayRenderer.height);

            this.registeredVisuals.filter(v => v.getType() === "tile" && v.isVisible())
                .forEach(v => v.render(this.tileRenderContext, this.interactionHandler));

            this.registeredVisuals.filter(v => v.getType() !== "tile" && v.isVisible())
                .forEach(v => v.render(this.renderCanvasContext, this.interactionHandler));
        }

        refresh() {
            this.resize();
            this.centerOn(this.currentViewCenter, "latlong", 0);
            this.renderAllLayers();
            return this;
        }

        getCanvasAsImageURL() {
            return this.overlayRenderer.toDataURL("image/png");
        }
    }

    const AdvancedMappingModule = {
        MappingEngine: MappingEngine,
        VisualLayer: VisualLayer,
        createTopojsonVisual: () => VisualLayer.createTopojson(),
        createGeojsonVisual: () => VisualLayer.createGeojson(),
        createCsvVisual: () => VisualLayer.createCsv(),
        createXyArrayVisual: () => VisualLayer.createXyArray(),
        createFeatureArrayVisual: () => VisualLayer.createFeatureArray(),
        createTileVisual: () => VisualLayer.createTile(),
        version: "1.0.0"
    };

    return AdvancedMappingModule;
});