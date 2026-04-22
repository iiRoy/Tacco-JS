((root) => {
    // Unique identifier generation
    let nextUniqueEntityId = 0;
    const generateUniqueId = () => `element-${nextUniqueEntityId++}`;

    // Application Configuration and State Management
    const systemSettings = {
        workspaceWidth: 600,
        workspaceHeight: 720,
        gridCellHeight: null, // Calculated later
        gridCellWidth: null,  // Calculated later
        activeControlKey: false,
        keyCodes: {
            deletion: 46,
            control: 17,
            copy: 67,
            paste: 86
        }
    };

    // Repository for managing visual elements
    const visualElementStore = {
        registeredItems: new Map(), // Map<string, VisualItem>
        currentActiveItem: null,
        insertItem(item) {
            this.registeredItems.set(item.elementIdentifier(), item);
        },
        retrieveItem(id) {
            return this.registeredItems.get(id);
        },
        designateActive(item) {
            if (this.currentActiveItem && this.currentActiveItem.elementIdentifier() !== item.elementIdentifier()) {
                this.currentActiveItem.concealGuides();
            }
            this.currentActiveItem = item;
        },
        removeActiveItem() {
            if (this.currentActiveItem) {
                const idToRemove = this.currentActiveItem.elementIdentifier();
                this.registeredItems.delete(idToRemove);
                this.currentActiveItem = null; // Deselect after removal
            }
        },
        getAllItems() {
            return Array.from(this.registeredItems.values());
        }
    };

    // Base class for all drawable visual items
    class VisualItem {
        constructor(props) {
            this._id = props.elementIdentifier || generateUniqueId();
            this._x = props.x || 0;
            this._y = props.y || 0;
            this._width = props.width || 0;
            this._height = props.height || 0;
            this._fillColor = props.fillColor || '#ffffff';
            this._borderColor = props.borderColor || '#000000';
            this._borderWidth = props.borderWidth || 1;
            this._transparency = props.transparency || 1;
            this._textLabel = props.textLabel || '';
            this._visible = props.visible !== false;
            this._isMovable = props.isMovable !== false;
            this._isLocked = props.isLocked === true;
            this._guidesVisible = false;
        }

        elementIdentifier() { return this._id; }
        getPositionX() { return this._x; }
        getPositionY() { return this._y; }
        getDimensionWidth() { return this._width; }
        getDimensionHeight() { return this._height; }
        updatePosition(newX, newY) {
            this._x = newX;
            this._y = newY;
        }
        updateDimensions(newW, newH) {
            this._width = newW;
            this._height = newH;
        }
        setVisibility(v) { this._visible = v; }
        isVisible() { return this._visible; }
        isInteractive() { return this._isMovable && !this._isLocked; }
        containsPoint(px, py) {
            return px >= this._x && px <= (this._x + this._width) &&
                   py >= this._y && py <= (this._y + this._height);
        }

        draw(ctx) { /* Abstract method */ }
        concealGuides() { this._guidesVisible = false; }
        revealGuides() { this._guidesVisible = true; }
    }

    class CanvasGeometry extends VisualItem {
        draw(ctx) {
            if (!this._visible) return;
            ctx.save();
            ctx.globalAlpha = this._transparency;
            ctx.fillStyle = this._fillColor;
            ctx.strokeStyle = this._borderColor;
            ctx.lineWidth = this._borderWidth;

            ctx.beginPath();
            ctx.rect(this._x, this._y, this._width, this._height);
            ctx.fill();
            ctx.stroke();

            if (this._guidesVisible) {
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.strokeRect(this._x, this._y, this._width, this._height);
                ctx.setLineDash([]);
            }
            ctx.restore();
        }
    }

    class CanvasLabel extends VisualItem {
        draw(ctx) {
            if (!this._visible) return;
            ctx.save();
            ctx.globalAlpha = this._transparency;
            ctx.fillStyle = this._fillColor; // Background color for text, if any
            ctx.strokeStyle = this._borderColor;
            ctx.lineWidth = this._borderWidth;
            ctx.font = '16px Arial'; // Example font, can be parameterized
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Optional: draw a background rectangle for the text
            if (this._fillColor !== '#ffffff' && this._fillColor !== 'transparent') {
                ctx.beginPath();
                ctx.rect(this._x, this._y, this._width, this._height);
                ctx.fill();
                ctx.stroke();
            }

            ctx.fillStyle = this._borderColor; // Text color
            ctx.fillText(this._textLabel, this._x + this._width / 2, this._y + this._height / 2);

            if (this._guidesVisible) {
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.strokeRect(this._x, this._y, this._width, this._height);
                ctx.setLineDash([]);
            }
            ctx.restore();
        }
    }

    // Grid and component placement logic
    class GridPlacementSystem {
        constructor(columns) {
            this._componentCreators = {
                'LABEL': CanvasLabel,
                'RECTANGLE': CanvasGeometry
            };
            this._gridColors = {
                "1": { fillColor: "#D1E8FF", borderColor: "#73ABFF" },
                "2": { fillColor: "#FFE0D1", borderColor: "#FF9966" },
                "3": { fillColor: "#FF9595", borderColor: "#FF6A6A" },
                "4": { fillColor: "#CFFFC9", borderColor: "#78E378" },
                "5": { fillColor: "#FFFA94", borderColor: "#FF9E36" },
                "6": { fillColor: "#FFCCFF", borderColor: "#FF66FF" }
            };
            this._gridHighlight = new CanvasGeometry({
                x: 0, y: 0, width: 0, height: 0,
                fillColor: "rgba(255,0,0,0.4)", borderColor: "rgba(255,0,0,0.4)",
                borderWidth: 0.5, visible: false, isMovable: false, isLocked: true
            });
            this.initializeGrid(columns);
        }

        initializeGrid(columns) {
            systemSettings.gridCellWidth = systemSettings.workspaceWidth / columns;
            systemSettings.gridCellHeight = 40; // Hardcoded in original
            this._gridHighlight.updateDimensions(systemSettings.gridCellWidth, systemSettings.gridCellHeight);
        }

        renderGridLines(ctx) {
            ctx.save();
            ctx.strokeStyle = '#B2BBEC';
            ctx.lineWidth = 0.7;

            const numRows = Math.floor(systemSettings.workspaceHeight / systemSettings.gridCellHeight);
            for (let j = 0; j <= numRows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * systemSettings.gridCellHeight);
                ctx.lineTo(systemSettings.workspaceWidth, j * systemSettings.gridCellHeight);
                ctx.stroke();
            }

            const numCols = Math.floor(systemSettings.workspaceWidth / systemSettings.gridCellWidth);
            for (let i = 0; i <= numCols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * systemSettings.gridCellWidth, 0);
                ctx.lineTo(i * systemSettings.gridCellWidth, systemSettings.workspaceHeight);
                ctx.stroke();
            }
            ctx.restore();
        }

        renderGridHighlight(ctx) {
            this._gridHighlight.draw(ctx);
        }

        snapToGrid(rawX, rawY) {
            let colIndex = Math.floor(rawX / systemSettings.gridCellWidth);
            let rowIndex = Math.floor(rawY / systemSettings.gridCellHeight);

            // Original logic for snapping
            if ((rawX % systemSettings.gridCellWidth) <= (systemSettings.gridCellWidth / 2)) {
                colIndex--;
            }
            if ((rawY % systemSettings.gridCellHeight) <= (systemSettings.gridCellHeight / 2)) {
                rowIndex--;
            }

            // Ensure non-negative indices
            colIndex = Math.max(0, colIndex);
            rowIndex = Math.max(0, rowIndex);

            return {
                x: colIndex * systemSettings.gridCellWidth,
                y: rowIndex * systemSettings.gridCellHeight
            };
        }

        placeComponentOnGrid(typeString, initialX, initialY) {
            const parts = typeString.split("_");
            const componentType = parts[0].toUpperCase().trim();
            const columnSpan = parseInt(parts[1] || '1', 10);

            if (this._componentCreators[componentType]) {
                const snappedCoords = this.snapToGrid(initialX, initialY);
                const itemProps = {
                    x: snappedCoords.x,
                    y: snappedCoords.y,
                    width: systemSettings.gridCellWidth * columnSpan,
                    height: systemSettings.gridCellHeight, // Default height
                    transparency: 0.7,
                    fillColor: this._gridColors["1"].fillColor, // Default color for new items
                    borderColor: this._gridColors["1"].borderColor,
                    textLabel: String(visualElementStore.registeredItems.size + 1), // item count
                    elementIdentifier: generateUniqueId()
                };

                const newItem = new this._componentCreators[componentType](itemProps);
                visualElementStore.insertItem(newItem);
                visualElementStore.designateActive(newItem); // Select new item
                return newItem;
            }
            return null;
        }

        // Region checking (Header, Body, Footer)
        identifyRegion(item) {
            const itemX = item.getPositionX();
            const itemY = item.getPositionY();
            const itemW = item.getDimensionWidth();
            const itemH = item.getDimensionHeight();

            // Assuming structuralPane, primaryPane, terminalPane are globally available or passed in
            if (this._structuralPane.containsPoint(itemX + itemW / 2, itemY + itemH / 2)) return "Structural";
            if (this._terminalPane.containsPoint(itemX + itemW / 2, itemY + itemH / 2)) return "Terminal";
            return "Primary"; // Default to body
        }

        setRegions(structural, primary, terminal) {
            this._structuralPane = structural;
            this._primaryPane = primary;
            this._terminalPane = terminal;
        }
    }

    // Main application orchestrator
    class DesignWorkspaceManager {
        constructor() {
            this._canvasElement = null;
            this._canvasContext = null;
            this._placementSystem = new GridPlacementSystem(12); // Hardcoded 12 rows from original

            this._structuralPane = null;
            this._primaryPane = null;
            this._terminalPane = null;

            this._draggingPaletteComponentType = null;
            this._isDraggingCanvasItem = false;
            this._draggedCanvasItemOffset = { x: 0, y: 0 }; // Offset from item's top-left to mouse

            this._initializeWorkspace();
            this._bindEventHandlers();
            this._loadExternalIntegrations();
        }

        _initializeWorkspace() {
            this._canvasElement = document.createElement('canvas');
            this._canvasElement.id = 'visualWorkspace';
            this._canvasElement.width = systemSettings.workspaceWidth;
            this._canvasElement.height = systemSettings.workspaceHeight;
            // Prepend to body to simulate Meteor.startup/jQuery $(function()) context
            document.body.prepend(this._canvasElement); 
            this._canvasContext = this._canvasElement.getContext('2d');

            // Initialize structural panes
            this._structuralPane = new CanvasGeometry({
                x: 0, y: 0, width: 600, height: 50,
                fillColor: '#E9F1FA', borderColor: '#DBE2F0', borderWidth: 2, transparency: 1,
                isMovable: true, isLocked: true
            });
            this._primaryPane = new CanvasGeometry({
                x: 0, y: 0, width: 600, height: systemSettings.workspaceHeight, // Adjusted height for canvas
                fillColor: '#ffffff', borderColor: '#DBE2F0', borderWidth: 2, transparency: 0.5,
                isMovable: true, isLocked: true
            });
            this._terminalPane = new CanvasGeometry({
                x: 0, y: systemSettings.workspaceHeight - 40, width: 600, height: 40,
                fillColor: '#E9F1FA', borderColor: '#DBE2F0', borderWidth: 2, transparency: 1,
                isMovable: true, isLocked: true
            });
            this._placementSystem.setRegions(this._structuralPane, this._primaryPane, this._terminalPane);

            this.refreshDisplay();
        }

        _bindEventHandlers() {
            // Keyboard events
            root.addEventListener('keydown', (e) => {
                if (e.keyCode === systemSettings.keyCodes.deletion && visualElementStore.currentActiveItem) {
                    visualElementStore.removeActiveItem();
                    this.refreshDisplay();
                } else if (e.keyCode === systemSettings.keyCodes.control) {
                    systemSettings.activeControlKey = true;
                }
            });
            root.addEventListener('keyup', (e) => {
                if (e.keyCode === systemSettings.keyCodes.control) {
                    systemSettings.activeControlKey = false;
                }
            });

            // Custom drag-drop for palette components
            document.querySelectorAll('.component').forEach(paletteItem => {
                paletteItem.addEventListener('mousedown', (e) => {
                    this._draggingPaletteComponentType = paletteItem.id;
                    e.preventDefault(); // Prevent default browser drag behavior
                });
            });

            // Canvas interaction for placing/dragging items
            this._canvasElement.addEventListener('mousedown', (e) => {
                const rect = this._canvasElement.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                if (this._draggingPaletteComponentType) {
                    // This is a "drop" from palette
                    const newItem = this._placementSystem.placeComponentOnGrid(this._draggingPaletteComponentType, mouseX, mouseY);
                    if (newItem) {
                        visualElementStore.designateActive(newItem);
                        newItem.revealGuides();
                    }
                    this._draggingPaletteComponentType = null;
                    this.refreshDisplay();
                } else {
                    // Check if an existing item is clicked for dragging
                    const clickedItem = visualElementStore.getAllItems().find(item => item.isInteractive() && item.containsPoint(mouseX, mouseY));
                    if (clickedItem) {
                        visualElementStore.designateActive(clickedItem);
                        clickedItem.revealGuides();
                        this._isDraggingCanvasItem = true;
                        this._draggedCanvasItemOffset = {
                            x: mouseX - clickedItem.getPositionX(),
                            y: mouseY - clickedItem.getPositionY()
                        };
                        this.refreshDisplay();
                    } else if (visualElementStore.currentActiveItem) {
                        visualElementStore.currentActiveItem.concealGuides();
                        visualElementStore.currentActiveItem = null;
                        this.refreshDisplay();
                    }
                }
            });

            this._canvasElement.addEventListener('mousemove', (e) => {
                if (this._isDraggingCanvasItem && visualElementStore.currentActiveItem) {
                    const rect = this._canvasElement.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    const newX = mouseX - this._draggedCanvasItemOffset.x;
                    const newY = mouseY - this._draggedCanvasItemOffset.y;

                    visualElementStore.currentActiveItem.updatePosition(newX, newY);
                    this.refreshDisplay();
                } else if (this._draggingPaletteComponentType) {
                    // Show highlight for palette item placement preview
                    const rect = this._canvasElement.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    const snapped = this._placementSystem.snapToGrid(mouseX, mouseY);
                    this._placementSystem._gridHighlight.updatePosition(snapped.x, snapped.y);
                    this._placementSystem._gridHighlight.setVisibility(true);
                    this.refreshDisplay();
                }
            });

            this._canvasElement.addEventListener('mouseup', (e) => {
                if (this._isDraggingCanvasItem && visualElementStore.currentActiveItem) {
                    const rect = this._canvasElement.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    const finalX = mouseX - this._draggedCanvasItemOffset.x;
                    const finalY = mouseY - this._draggedCanvasItemOffset.y;

                    const snapped = this._placementSystem.snapToGrid(finalX, finalY);
                    visualElementStore.currentActiveItem.updatePosition(snapped.x, snapped.y);
                    this._isDraggingCanvasItem = false;
                    this.refreshDisplay();
                }
                this._placementSystem._gridHighlight.setVisibility(false); // Hide highlight on mouse up
                this.refreshDisplay();
            });

            // Download button (example, needs actual button with ID 'downloadButton')
            const downloadBtn = document.getElementById('downloadButton');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    //console.log("Download data:", this.getComponentLayouts()); // For debugging
                    //console.log("Gridster data:", this.getGridsterLayouts()); // For debugging
                });
            }

            // Tab activation - only if a tab system is present, otherwise no-op
            const tabEditorLink = document.querySelector('#griditTabs a[href="#tabEditor"]');
            if (tabEditorLink && typeof tabEditorLink.click === 'function') {
                tabEditorLink.click(); // Simulate tab show if possible
            }
        }

        _loadExternalIntegrations() {
            // Disqus loading
            const disqusScriptContainer = document.getElementById("disqusCommentBox");
            if (disqusScriptContainer) {
                const dScript = document.createElement("script");
                dScript.src = "/scripts/disqus.js"; // Original path
                dScript.type = 'text/javascript';
                disqusScriptContainer.prepend(dScript);
            }

            // Google Analytics loading
            ((i, s, o, g, r, a, m) => {
                i['AnalyticsTracker'] = r;
                i[r] = i[r] || function() { (i[r].q = i[r].q || []).push(arguments) };
                i[r].l = 1 * new Date();
                a = s.createElement(o);
                m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m);
            })(root, document, 'script', '//www.google-analytics.com/analytics.js', 'gaTracker');

            root.gaTracker('create', 'UA-50598124-1', 'meteor.com');
            root.gaTracker('send', 'pageview');

            // UserEcho loading
            root.UserFeedback = root.UserFeedback || [];
            ((_root) => {
                const ufScript = _root.document.createElement('script');
                ufScript.type = 'text/javascript';
                ufScript.async = true;
                ufScript.src = '//widget.uservoice.com/wdBzBp4jiyJe1eVSRYDSVg.js'; // Original path
                const firstScript = _root.document.getElementsByTagName('script')[0];
                firstScript.parentNode.insertBefore(ufScript, firstScript);
            })(root);

            root.UserFeedback.push(['set', {
                accent_color: '#448dd6',
                trigger_color: 'white',
                trigger_background_color: '#6aba2e'
            }]);
            root.UserFeedback.push(['addTrigger', { mode: 'contact', trigger_position: 'bottom-right' }]);
            root.UserFeedback.push(['autoprompt', {}]);
        }

        refreshDisplay() {
            this._canvasContext.clearRect(0, 0, systemSettings.workspaceWidth, systemSettings.workspaceHeight);

            // Draw base structural panes
            this._structuralPane.draw(this._canvasContext);
            this._terminalPane.draw(this._canvasContext);
            // The primary pane (body) is largely implied by the grid and items,
            // but can be drawn explicitly if its fill/stroke is needed as a background.
            // this._primaryPane.draw(this._canvasContext);

            this._placementSystem.renderGridLines(this._canvasContext);
            this._placementSystem.renderGridHighlight(this._canvasContext);

            visualElementStore.getAllItems().forEach(item => item.draw(this._canvasContext));
        }

        // Equivalent to getComponentsData
        getComponentLayouts() {
            return visualElementStore.getAllItems().map(item => ({
                xIndex: Math.floor(item.getPositionX() / systemSettings.gridCellWidth),
                yIndex: Math.floor(item.getPositionY() / systemSettings.gridCellHeight),
                width: Math.floor(item.getDimensionWidth() / systemSettings.gridCellWidth),
                height: Math.floor(item.getDimensionHeight() / systemSettings.gridCellHeight)
            }));
        }

        // Equivalent to getComponentsDataForGridsterBootstrap
        getGridsterLayouts() {
            return visualElementStore.getAllItems().map(item => ({
                col: Math.floor(item.getPositionX() / systemSettings.gridCellWidth),
                row: Math.floor(item.getPositionY() / systemSettings.gridCellHeight) + 1, // +1 as per original
                size_x: Math.floor(item.getDimensionWidth() / systemSettings.gridCellWidth),
                size_y: Math.floor(item.getDimensionHeight() / systemSettings.gridCellHeight)
            }));
        }
    }

    // Initialize the application when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Ensure there's a container for disqusCommentBox if it's not already in HTML
        if (!document.getElementById('disqusCommentBox')) {
            const disqusDiv = document.createElement('div');
            disqusDiv.id = 'disqusCommentBox';
            document.body.prepend(disqusDiv); // Prepend to body
        }

        // Make sure there's a download button for the click handler
        if (!document.getElementById('downloadButton')) {
            const downloadBtn = document.createElement('button');
            downloadBtn.id = 'downloadButton';
            downloadBtn.textContent = 'Download Layout';
            document.body.appendChild(downloadBtn);
        }

        // Assuming `.component` elements exist in the HTML for drag sources
        // e.g., <div class="component" id="LABEL_1">Label</div>
        // <div class="component" id="RECTANGLE_2">Rectangle</div>

        // Also assuming a '#griditTabs' structure exists if the tab 'show' functionality is important
        // <div id="griditTabs">... <a href="#tabEditor">Editor</a> ...</div>

        new DesignWorkspaceManager();
    });

})(window);