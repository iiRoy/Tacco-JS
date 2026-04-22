(function () {
  "use strict";

  /**
   * Dispatches a custom event on a specified DOM element.
   * This function provides cross-browser compatibility for event creation and dispatch.
   *
   * @param {HTMLElement} targetElement - The DOM element to dispatch the event on.
   * @param {string} eventIdentifier - The name of the custom event to be triggered.
   * @param {object} [eventPayload={}] - Optional data object to attach to the event details.
   * @private
   */
  function _dispatchCustomEvent(targetElement, eventIdentifier, eventPayload) {
    let eventObject;
    const detailData = eventPayload || {}; // Ensure payload is always an object

    // Modern browsers use Event constructor or CustomEvent
    if (typeof window.CustomEvent === "function") {
      eventObject = new CustomEvent(eventIdentifier, {
        bubbles: true, // Event bubbles up through the DOM
        cancelable: true, // Event can be cancelled
        detail: detailData, // Custom data payload
      });
    } else if (document.createEvent) {
      // Older DOM Level 2 Event Model (e.g., some Firefox versions)
      eventObject = document.createEvent("HTMLEvents");
      eventObject.initEvent(eventIdentifier, true, true);
      // Manually attach detail data for older browsers
      eventObject.detail = detailData;
    } else {
      // Very old IE (IE < 9)
      eventObject = document.createEventObject();
      eventObject.eventType = eventIdentifier;
      eventObject.detail = detailData; // Attach custom data
    }

    // Assign event name directly for consistency, though 'type' is standard
    eventObject.eventName = eventIdentifier;

    // Dispatch the event
    if (targetElement && targetElement.dispatchEvent) {
      targetElement.dispatchEvent(eventObject);
    } else if (targetElement && targetElement.fireEvent && eventObject.eventType) {
      // IE-specific event dispatch
      targetElement.fireEvent("on" + eventObject.eventType, eventObject);
    }
  }

  /**
   * RevisionFlow - Manages and renders a visual representation of a version control history.
   *
   * @constructor
   *
   * @param {Object} configOpts - Configuration options for the RevisionFlow instance.
   * @param {string} [configOpts.canvasId = "revisionCanvas"] - ID of the HTML canvas element.
   * @param {FlowTemplate|string|Object} [configOpts.displayTemplate] - Visual template for the flow.
   * @param {string} [configOpts.defaultAuthor = "Jane Doe <jane.doe@example.com>"] - Default author for new revisions.
   * @param {string} [configOpts.displayMode = (null|"condensed")] - Rendering mode (e.g., "condensed" for less detail).
   * @param {HTMLElement} [configOpts.domCanvas] - Direct reference to the HTML canvas element.
   * @param {string} [configOpts.layoutDirection = ("vertical-inverted"|"horizontal"|"horizontal-inverted")] - Orientation of the flow display.
   *
   * @this RevisionFlow
   */
  function RevisionFlow(configOpts) {
    // Initialize configuration
    const settings = typeof configOpts === "object" && configOpts !== null ? configOpts : {};

    this.canvasElementId = settings.canvasId || "revisionCanvas";
    this.defaultRevisionAuthor = settings.defaultAuthor || "Jane Doe <jane.doe@example.com>";

    // Template handling
    let chosenTemplate;
    if (typeof settings.displayTemplate === "string" || typeof settings.displayTemplate === "object") {
      chosenTemplate = new FlowTemplate().getTemplate(settings.displayTemplate);
    } else if (settings.displayTemplate instanceof FlowTemplate) {
      chosenTemplate = settings.displayTemplate;
    } else {
      chosenTemplate = new FlowTemplate().getTemplate("metro"); // Fallback to a default template
    }
    this.visualTemplate = chosenTemplate;

    // Display mode adjustments
    this.renderMode = settings.displayMode || null;
    if (this.renderMode === "condensed") {
      this.visualTemplate.revision.message.isVisible = false;
    }

    // Layout dimensions based on template
    this.paddingX = this.visualTemplate.revision.node.size * 2;
    this.paddingY = this.visualTemplate.revision.node.size * 2;
    this.translationX = 0;
    this.translationY = 0;

    // Orientation setup
    const initialOrientation = settings.layoutDirection;
    switch (initialOrientation) {
      case "vertical-inverted":
        this.visualTemplate.revision.spacingY *= -1;
        this.currentOrientation = "vertical-inverted";
        break;
      case "horizontal":
        this.visualTemplate.revision.message.isVisible = false;
        this.visualTemplate.revision.spacingX = this.visualTemplate.revision.spacingY;
        this.visualTemplate.path.spacingY = this.visualTemplate.path.spacingX;
        this.visualTemplate.revision.spacingY = 0;
        this.visualTemplate.path.spacingX = 0;
        this.currentOrientation = "horizontal";
        break;
      case "horizontal-inverted":
        this.visualTemplate.revision.message.isVisible = false;
        this.visualTemplate.revision.spacingX = -this.visualTemplate.revision.spacingY;
        this.visualTemplate.path.spacingY = this.visualTemplate.path.spacingX;
        this.visualTemplate.revision.spacingY = 0;
        this.visualTemplate.path.spacingX = 0;
        this.currentOrientation = "horizontal-inverted";
        break;
      default:
        this.currentOrientation = "vertical";
        break;
    }

    // Canvas context acquisition
    this.drawingCanvas = settings.domCanvas || document.getElementById(this.canvasElementId);
    if (!this.drawingCanvas || !(this.drawingCanvas instanceof HTMLCanvasElement)) {
      console.error(`RevisionFlow: Canvas element with ID "${this.canvasElementId}" not found or invalid.`);
      // Create a default canvas if not found and elementId is given
      if (document && document.body && this.canvasElementId) {
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCanvas.id = this.canvasElementId;
        document.body.appendChild(this.drawingCanvas);
        console.warn(`RevisionFlow: Created a new canvas element with ID "${this.canvasElementId}" as it was not found.`);
      } else {
        throw new Error("RevisionFlow: No valid canvas element provided or found.");
      }
    }
    this.canvasContext = this.drawingCanvas.getContext("2d");

    // Setup interactive tooltip
    this.infoTooltip = document.createElement("div");
    this.infoTooltip.classList.add("revision-flow-tooltip"); // Use classList for modern approach
    Object.assign(this.infoTooltip.style, {
      position: "fixed",
      display: "none",
      zIndex: "1000", // Ensure tooltip is on top
      backgroundColor: "rgba(0,0,0,0.8)",
      color: "white",
      padding: "5px 10px",
      borderRadius: "3px",
      pointerEvents: "none" // Prevent tooltip from blocking mouse events
    });
    document.body.appendChild(this.infoTooltip);

    // Internal state for graph navigation
    this.currentHead = null; // Points to the latest revision
    this.flowPaths = []; // Array of Path objects
    this.allRevisions = []; // Array of Revision objects

    // Utility properties for layout
    this.maxColumnIndex = 0; // Tracks the widest point for layout
    this.revisionOffsetX = 0;
    this.revisionOffsetY = 0;

    // Event binding for interactivity
    const mouseMovementHandler = {
      handleEvent: this.handleCanvasHover,
      flowInstance: this, // Pass the instance context
    };
    this.drawingCanvas.addEventListener("mousemove", mouseMovementHandler, false);

    // Responsive rendering
    window.addEventListener("resize", this.redrawGraph.bind(this));
  }

  /**
   * Creates a new path (branch) in the revision flow.
   *
   * @param {(string | Object)} pathOptions - Path name or configuration object for the new path.
   *
   * @see Path
   * @this RevisionFlow
   *
   * @returns {Path} The newly created Path instance.
   */
  RevisionFlow.prototype.createPath = function (pathOptions) {
    let pathConfig = {};
    if (typeof pathOptions === "string") {
      pathConfig.name = pathOptions;
    } else if (typeof pathOptions === "object" && pathOptions !== null) {
      pathConfig = { ...pathOptions }; // Clone to avoid modifying original object
    }

    pathConfig.parentFlow = this;
    pathConfig.originPath = pathConfig.originPath || this.currentHead;

    const newPath = new Path(pathConfig);
    this.flowPaths.push(newPath);

    return newPath;
  };

  /**
   * Creates an independent path that doesn't originate from the current HEAD.
   *
   * @param {(string | Object)} pathOptions - Path name or configuration object for the new orphan path.
   *
   * @see Path
   * @this RevisionFlow
   *
   * @returns {Path} The newly created orphan Path instance.
   */
  RevisionFlow.prototype.createOrphanPath = function (pathOptions) {
    let pathConfig = {};
    if (typeof pathOptions === "string") {
      pathConfig.name = pathOptions;
    } else if (typeof pathOptions === "object" && pathOptions !== null) {
      pathConfig = { ...pathOptions };
    }

    pathConfig.parentFlow = this;
    // No parent path specified, it's an orphan

    const newPath = new Path(pathConfig);
    this.flowPaths.push(newPath);

    return newPath;
  };

  /**
   * Adds a new revision (commit) to the current HEAD path.
   *
   * @param {Object} revisionDetails - Details for the new revision.
   *
   * @see Revision
   * @this RevisionFlow
   *
   * @returns {RevisionFlow} Returns the RevisionFlow instance for method chaining.
   */
  RevisionFlow.prototype.addRevision = function (revisionDetails) {
    if (this.currentHead) {
      this.currentHead.addRevision(revisionDetails);
    } else {
      console.warn("RevisionFlow: Cannot add revision, no current HEAD path selected.");
      // Potentially create a default main path if no HEAD exists
      if (this.flowPaths.length === 0) {
        const mainPath = this.createPath("main");
        mainPath.addRevision(revisionDetails);
      }
    }
    return this;
  };

  /**
   * Generates a new template instance based on provided options or a predefined name.
   *
   * @param {(string|Object)} templateSettings - The name of a predefined template or a custom template configuration object.
   *
   * @returns {FlowTemplate} A new FlowTemplate instance.
   */
  RevisionFlow.prototype.getNewTemplate = function (templateSettings) {
    if (typeof templateSettings === "string") {
      return new FlowTemplate().getTemplate(templateSettings);
    }
    return new FlowTemplate(templateSettings);
  };

  /**
   * Renders or re-renders the entire revision flow on the canvas.
   * This includes adjusting for high-resolution displays and drawing all paths and revisions.
   *
   * @this RevisionFlow
   */
  RevisionFlow.prototype.redrawGraph = function () {
    let backingRatio = 1;
    let scalingFactor = 1;

    // Adjust for high DPI screens to ensure crisp rendering
    if (window.devicePixelRatio) {
      backingRatio = this.canvasContext.webkitBackingStorePixelRatio ||
                     this.canvasContext.mozBackingStorePixelRatio ||
                     this.canvasContext.msBackingStorePixelRatio ||
                     this.canvasContext.oBackingStorePixelRatio ||
                     this.canvasContext.backingStorePixelRatio || 1;
      scalingFactor = window.devicePixelRatio / backingRatio;
    }

    // Calculate required canvas dimensions based on content
    const calculatedResolution = {
      width: Math.abs(this.maxColumnIndex * this.visualTemplate.path.spacingX) + Math.abs(this.revisionOffsetX) + this.paddingX * 2,
      height: Math.abs(this.maxColumnIndex * this.visualTemplate.path.spacingY) + Math.abs(this.revisionOffsetY) + this.paddingY * 2,
    };

    // If revision messages are displayed, allocate extra horizontal space
    if (this.visualTemplate.revision.message.isVisible) {
      calculatedResolution.width += 800; // Arbitrary extra space for messages
    }

    // Apply calculated dimensions to canvas style and actual drawing buffer
    this.drawingCanvas.style.width = calculatedResolution.width + "px";
    this.drawingCanvas.style.height = calculatedResolution.height + "px";
    this.drawingCanvas.width = calculatedResolution.width * scalingFactor;
    this.drawingCanvas.height = calculatedResolution.height * scalingFactor;

    // Apply scaling to the drawing context
    this.canvasContext.setTransform(1, 0, 0, 1, 0, 0); // Reset transform first
    this.canvasContext.scale(scalingFactor, scalingFactor);

    // Clear the entire canvas before redrawing
    this.canvasContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

    // Apply initial translation for padding
    this.canvasContext.translate(this.paddingX, this.paddingY);
    this.translationX = this.paddingX;
    this.translationY = this.paddingY;

    // Adjust translation for inverted orientations
    if (this.visualTemplate.revision.spacingY > 0) {
      this.canvasContext.translate(0, this.drawingCanvas.height / scalingFactor - this.paddingY * 2);
      this.translationY = this.drawingCanvas.height / scalingFactor - this.paddingY * 2;
    }
    if (this.visualTemplate.revision.spacingX > 0) {
      this.canvasContext.translate(this.drawingCanvas.width / scalingFactor - this.paddingX * 2, 0);
      this.translationX = this.drawingCanvas.width / scalingFactor - this.paddingX * 2;
    }

    // Render paths (branches) first, from oldest to newest or specific order
    // Using a simple reverse loop might be faster than Array.prototype.forEach for some engines
    for (let i = this.flowPaths.length - 1; i >= 0; i--) {
      this.flowPaths[i].draw();
    }

    // Render revisions (commits) on top, ensuring they are foreground elements
    for (let j = 0; j < this.allRevisions.length; j++) {
      this.allRevisions[j].draw();
    }
  };

  /**
   * Handles mouse movement events on the canvas to detect hovering over revision nodes.
   * Displays a tooltip and dispatches custom events when a revision node is hovered.
   *
   * @param {MouseEvent} mouseEvent - The mouse event object.
   *
   * @self RevisionFlow
   */
  RevisionFlow.prototype.handleCanvasHover = function (mouseEvent) {
    const flowContext = this.flowInstance; // Reference to the RevisionFlow instance
    let mouseIsOutsideAnyRevision = true;

    // Normalize event coordinates for cross-browser compatibility
    const clientX = mouseEvent.clientX || mouseEvent.x;
    const clientY = mouseEvent.clientY || mouseEvent.y;
    const offsetX = mouseEvent.offsetX !== undefined ? mouseEvent.offsetX : mouseEvent.layerX;
    const offsetY = mouseEvent.offsetY !== undefined ? mouseEvent.offsetY : mouseEvent.layerY;

    /**
     * Shows the revision tooltip at the mouse cursor's position.
     * @param {Revision} hoveredRevision - The revision object currently hovered.
     */
    const displayRevisionTooltip = (hoveredRevision) => {
      // Adjust tooltip position to avoid scroll issues, potentially slightly offset from cursor
      flowContext.infoTooltip.style.left = `${clientX + 10}px`;
      flowContext.infoTooltip.style.top = `${clientY + 10}px`;
      flowContext.infoTooltip.textContent = `${hoveredRevision.hashId.substring(0, 7)} - ${hoveredRevision.messageText}`;
      flowContext.infoTooltip.style.display = "block";
    };

    /**
     * Dispatches a custom 'revision:hover' event.
     * @param {Revision} hoveredRevision - The revision object being hovered.
     */
    const triggerHoverEvent = (hoveredRevision) => {
      const eventDetails = {
        author: hoveredRevision.authorName,
        message: hoveredRevision.messageText,
        timestamp: hoveredRevision.revisionDate,
        hash: hoveredRevision.hashId,
      };
      _dispatchCustomEvent(flowContext.drawingCanvas, "revision:hover", eventDetails);
    };

    // Iterate through all revisions to check for hover state
    for (let i = 0; i < flowContext.allRevisions.length; i++) {
      const currentRevision = flowContext.allRevisions[i];
      const nodeSize = flowContext.visualTemplate.revision.node.size;

      // Calculate distance from mouse to the center of the revision node
      const deltaX = (currentRevision.drawX + flowContext.translationX + flowContext.paddingX - offsetX);
      const deltaY = (currentRevision.drawY + flowContext.translationY + flowContext.paddingY - offsetY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const isMouseOverNode = distance < nodeSize;

      if (isMouseOverNode) {
        mouseIsOutsideAnyRevision = false;
        // Only show tooltip if messages are not already displayed
        if (!flowContext.visualTemplate.revision.message.isVisible) {
          displayRevisionTooltip(currentRevision);
        }

        // Trigger event only once when mouse enters the node
        if (!currentRevision.isHovered) {
          triggerHoverEvent(currentRevision);
        }
        currentRevision.isHovered = true;
      } else {
        currentRevision.isHovered = false;
      }
    }

    // Hide tooltip if mouse is not over any revision node
    if (mouseIsOutsideAnyRevision) {
      flowContext.infoTooltip.style.display = "none";
    }
  };

  // --------------------------------------------------------------------
  // -----------------------      Path (Branch)    ------------------------
  // --------------------------------------------------------------------

  /**
   * Path - Represents a sequence of revisions (a branch) in the flow.
   *
   * @constructor
   *
   * @param {Object} pathConfig - Configuration options for the path.
   * @param {RevisionFlow} pathConfig.parentFlow - The main RevisionFlow instance this path belongs to.
   * @param {Path} [pathConfig.originPath] - The parent path from which this path was created.
   * @param {string} [pathConfig.name = "unnamed-path"] - The identifier name of the path.
   *
   * @this Path
   */
  function Path(pathConfig) {
    // Validate parentFlow instance
    if (!(pathConfig && pathConfig.parentFlow instanceof RevisionFlow)) {
      console.error("Path: Invalid or missing parent RevisionFlow instance.");
      return; // Abort construction if parentFlow is invalid
    }

    const currentConfig = typeof pathConfig === "object" && pathConfig !== null ? pathConfig : {};

    this.parentFlow = currentConfig.parentFlow;
    this.originPath = currentConfig.originPath || null; // The path it branched from
    this.pathName = currentConfig.name || "unnamed-path";
    this.drawingContext = this.parentFlow.canvasContext;
    this.flowTemplate = this.parentFlow.visualTemplate;

    this.pathWidth = currentConfig.lineWidth || this.flowTemplate.path.lineWidth;
    this.pathDashPattern = currentConfig.lineDash || this.flowTemplate.path.lineDash; // e.g., [5, 3] for dashed line
    this.spacingX = this.flowTemplate.path.spacingX;
    this.spacingY = this.flowTemplate.path.spacingY;

    this.totalSize = 0; // Cumulative size, might be used for layout calculations
    this.totalHeight = 0;
    this.totalWidth = 0;
    this.pathRevisions = []; // Revisions belonging to this path
    this.drawingPoints = []; // Array of {x, y, type("start"|"join"|"end")} for path drawing

    // Determine column index for auto-positioning and coloring
    this.columnIndex = this.calculateColumnIndex();

    // Calculate initial offset based on column index
    this.offsetX = this.columnIndex * this.spacingX;
    this.offsetY = this.columnIndex * this.spacingY;

    // Assign color, prioritizing specific config, then template, then auto-assigned based on column
    this.pathColor = currentConfig.color || this.flowTemplate.path.color || this.flowTemplate.palette[this.columnIndex % this.flowTemplate.palette.length];

    // Automatically check out this new path
    this.checkoutPath();
  }

  /**
   * Creates a new sub-path originating from this path.
   *
   * @param {(string | Object)} subPathOptions - Name or configuration for the new sub-path.
   *
   * @see Path
   * @this Path
   *
   * @returns {Path} The newly created sub-Path instance.
   */
  Path.prototype.createSubPath = function (subPathOptions) {
    let subPathConfig = {};
    if (typeof subPathOptions === "string") {
      subPathConfig.name = subPathOptions;
    } else if (typeof subPathOptions === "object" && subPathOptions !== null) {
      subPathConfig = { ...subPathOptions };
    }

    subPathConfig.parentFlow = this.parentFlow;
    subPathConfig.originPath = subPathConfig.originPath || this; // Default to this path as parent

    const newSubPath = new Path(subPathConfig);
    this.parentFlow.flowPaths.push(newSubPath);

    return newSubPath;
  };

  /**
   * Renders (draws) the path line on the canvas.
   *
   * @this Path
   */
  Path.prototype.draw = function () {
    this.drawingContext.beginPath();

    for (let i = 0; i < this.drawingPoints.length; i++) {
      const currentPoint = this.drawingPoints[i];
      if (currentPoint.type === "start") {
        this.drawingContext.moveTo(currentPoint.x, currentPoint.y);
      } else {
        // Apply bezier curve for smoother merges if configured
        if (this.flowTemplate.path.mergeStyle === "bezier" && i > 0) {
          const previousPoint = this.drawingPoints[i - 1];
          this.drawingContext.bezierCurveTo(
            previousPoint.x - this.flowTemplate.revision.spacingX / 2, previousPoint.y - this.flowTemplate.revision.spacingY / 2,
            currentPoint.x + this.flowTemplate.revision.spacingX / 2, currentPoint.y + this.flowTemplate.revision.spacingY / 2,
            currentPoint.x, currentPoint.y
          );
        } else {
          this.drawingContext.lineTo(currentPoint.x, currentPoint.y);
        }
      }
    }

    this.drawingContext.lineWidth = this.pathWidth;
    this.drawingContext.strokeStyle = this.pathColor;
    if (this.drawingContext.setLineDash !== undefined) {
      this.drawingContext.setLineDash(this.pathDashPattern);
    }
    this.drawingContext.stroke();
    this.drawingContext.closePath();
  };

  /**
   * Adds a new revision (commit) to this path.
   *
   * @param {(string | Object)} [revisionOptions] - Message string or options object for the revision.
   * @param {string} [revisionOptions.infoElementId] - ID of a DOM element for additional revision details.
   *
   * @see Revision
   *
   * @this Path
   */
  Path.prototype.addRevision = function (revisionOptions) {
    let revisionConfig = {};
    if (typeof revisionOptions === "string") {
      revisionConfig.message = revisionOptions;
    } else if (typeof revisionOptions === "object" && revisionOptions !== null) {
      revisionConfig = { ...revisionOptions };
    }

    // Assign default properties from parent flow and template
    revisionConfig.showArrow = this.flowTemplate.arrow.isActive;
    revisionConfig.parentPath = this;
    revisionConfig.color = revisionConfig.color || this.flowTemplate.revision.color || this.flowTemplate.palette[this.columnIndex % this.flowTemplate.palette.length];
    revisionConfig.parentFlow = this.parentFlow;
    revisionConfig.previousRevision = revisionConfig.previousRevision || this.pathRevisions[this.pathRevisions.length - 1]; // Last revision on this path

    // If in condensed mode, hide messages unless explicitly overridden
    if (this.parentFlow.renderMode === "condensed" && revisionConfig.message === undefined) {
      this.flowTemplate.revision.message.isVisible = false;
    }

    // Create and store the new revision
    const newRevision = new Revision(revisionConfig);
    this.pathRevisions.push(newRevision);
    this.parentFlow.allRevisions.push(newRevision);

    // Update HEAD to this new revision
    this.parentFlow.currentHead = this;

    // Update path drawing points
    const revisionX = newRevision.drawX;
    const revisionY = newRevision.drawY;
    const pointType = this.pathRevisions.length === 1 ? "start" : "join";
    this.drawingPoints.push({ x: revisionX, y: revisionY, type: pointType });

    // Update max column index for overall graph layout
    if (this.columnIndex > this.parentFlow.maxColumnIndex) {
      this.parentFlow.maxColumnIndex = this.columnIndex;
    }

    // Re-render the graph to show the new revision
    this.parentFlow.redrawGraph();

    // Dispatch a custom event after adding a revision
    _dispatchCustomEvent(this.parentFlow.drawingCanvas, "revision:added", {
      pathName: this.pathName,
      revisionHash: newRevision.hashId,
      message: newRevision.messageText
    });

    return this; // Allow chaining
  };

  /**
   * Merges this path into another target path.
   *
   * @param {Path} targetPath - The path to merge into.
   * @param {(string | Object)} [mergeOptions] - Optional message or options for the merge revision.
   *
   * @see Revision
   *
   * @this Path
   */
  Path.prototype.mergeInto = function (targetPath, mergeOptions) {
    if (!(targetPath instanceof Path)) {
      console.error("Path: Invalid target path for merge operation.");
      return this;
    }

    let mergeConfig = {};
    if (typeof mergeOptions === "string") {
      mergeConfig.message = mergeOptions;
    } else if (typeof mergeOptions === "object" && mergeOptions !== null) {
      mergeConfig = { ...mergeOptions };
    }

    const lastRevisionOnCurrentPath = this.pathRevisions[this.pathRevisions.length - 1];
    const lastRevisionOnTargetPath = targetPath.pathRevisions[targetPath.pathRevisions.length - 1];

    if (!lastRevisionOnCurrentPath || !lastRevisionOnTargetPath) {
      console.warn("Path: Cannot merge, one of the paths has no revisions.");
      return this;
    }

    // Create a merge revision (commit)
    const mergeRevisionConfig = {
      ...mergeConfig,
      parentPath: targetPath, // The merge revision belongs to the target path
      parentFlow: this.parentFlow,
      previousRevision: lastRevisionOnTargetPath,
      mergeParents: [lastRevisionOnCurrentPath, lastRevisionOnTargetPath], // Track both parents
      color: mergeConfig.color || targetPath.pathColor,
      message: mergeConfig.message || `Merge path '${this.pathName}' into '${targetPath.pathName}'`,
    };

    const mergeRevision = new Revision(mergeRevisionConfig);
    targetPath.pathRevisions.push(mergeRevision);
    this.parentFlow.allRevisions.push(mergeRevision);

    // Update drawing points for both paths to show the merge
    // Current path's last point connects to merge revision
    this.drawingPoints.push({
      x: mergeRevision.drawX,
      y: mergeRevision.drawY,
      type: "end", // Mark as an end point for this path
    });

    // Target path adds the merge revision as a new point
    targetPath.drawingPoints.push({
      x: mergeRevision.drawX,
      y: mergeRevision.drawY,
      type: "join",
    });

    // Set HEAD to the target path after merge
    this.parentFlow.currentHead = targetPath;

    // Re-render the graph
    this.parentFlow.redrawGraph();

    _dispatchCustomEvent(this.parentFlow.drawingCanvas, "path:merged", {
      sourcePath: this.pathName,
      targetPath: targetPath.pathName,
      mergeRevisionHash: mergeRevision.hashId
    });

    return this; // Allow chaining
  };

  /**
   * Sets this path as the current HEAD of the RevisionFlow.
   *
   * @this Path
   */
  Path.prototype.checkoutPath = function () {
    this.parentFlow.currentHead = this;
    _dispatchCustomEvent(this.parentFlow.drawingCanvas, "path:checkout", { pathName: this.pathName });
  };

  /**
   * Calculates the column index for this path for layout purposes.
   * This is used to determine its horizontal/vertical offset and potentially its color.
   *
   * @returns {number} The calculated column index.
   * @private
   * @this Path
   */
  Path.prototype.calculateColumnIndex = function () {
    let columnIndex = 0;
    // Check if another path already exists with this name, if so, increment column
    const existingPathNames = new Set(this.parentFlow.flowPaths.map(p => p.pathName));
    if (existingPathNames.has(this.pathName)) {
      // Find an available column, simple approach: find first empty slot
      const occupiedColumns = new Set(this.parentFlow.flowPaths.map(p => p.columnIndex));
      while (occupiedColumns.has(columnIndex)) {
        columnIndex++;
      }
    } else {
      columnIndex = this.parentFlow.flowPaths.length; // Assign next available index
    }

    // Ensure columnIndex is within reasonable bounds or resets if many paths are deleted
    if (columnIndex > 100) { // Arbitrary limit, could be dynamic
        columnIndex = this.parentFlow.flowPaths.filter(p => p.pathName !== this.pathName).length;
    }

    return columnIndex;
  };

  // --------------------------------------------------------------------
  // -----------------------      Revision (Commit)      ------------------------
  // --------------------------------------------------------------------

  /**
   * Revision - Represents a single commit or change in the revision history.
   *
   * @constructor
   *
   * @param {Object} revConfig - Configuration options for the revision.
   * @param {Path} revConfig.parentPath - The path this revision belongs to.
   * @param {RevisionFlow} revConfig.parentFlow - The main RevisionFlow instance.
   * @param {Revision} [revConfig.previousRevision] - The preceding revision in the history.
   * @param {string} [revConfig.message = "No message"] - The revision message.
   * @param {string} [revConfig.author = "Default Author"] - The author of the revision.
   * @param {string} [revConfig.color] - Custom color for this revision's node.
   * @param {Date} [revConfig.timestamp] - The date and time of the revision.
   * @param {Array<Revision>} [revConfig.mergeParents] - Array of parent revisions if this is a merge revision.
   *
   * @this Revision
   */
  function Revision(revConfig) {
    if (!revConfig || !(revConfig.parentPath instanceof Path) || !(revConfig.parentFlow instanceof RevisionFlow)) {
      console.error("Revision: Missing or invalid parentPath or parentFlow in configuration.");
      return;
    }

    const currentConfig = { ...revConfig }; // Shallow copy config

    this.parentPath = currentConfig.parentPath;
    this.parentFlow = currentConfig.parentFlow;
    this.drawingContext = this.parentFlow.canvasContext;
    this.flowTemplate = this.parentFlow.visualTemplate;

    this.previousRevision = currentConfig.previousRevision || null;
    this.mergeParents = currentConfig.mergeParents || [];

    // Revision details
    this.messageText = currentConfig.message || "No message";
    this.authorName = currentConfig.author || this.parentFlow.defaultRevisionAuthor;
    this.revisionDate = currentConfig.timestamp || new Date();
    this.hashId = this.generateHash(); // Unique identifier for the revision

    // Visual properties
    this.revisionColor = currentConfig.color || this.flowTemplate.revision.color;
    this.nodeSize = this.flowTemplate.revision.node.size;
    this.showArrow = currentConfig.showArrow || false; // Whether to draw an arrow from this revision

    // Position calculation
    this.xOffset = this.parentPath.offsetX;
    this.yOffset = this.parentPath.offsetY;

    // Calculate drawing coordinates based on previous revision or path start
    if (this.previousRevision) {
      this.drawX = this.previousRevision.drawX + this.flowTemplate.revision.spacingX;
      this.drawY = this.previousRevision.drawY + this.flowTemplate.revision.spacingY;
    } else {
      // First revision on a path
      this.drawX = this.xOffset;
      this.drawY = this.yOffset;
    }

    // Keep track of hover state for interactivity
    this.isHovered = false;
  }

  /**
   * Draws the revision node, message, and connecting line on the canvas.
   *
   * @this Revision
   */
  Revision.prototype.draw = function () {
    const ctx = this.drawingContext;
    const template = this.flowTemplate;

    // Draw connecting line to previous revision
    if (this.previousRevision && this.mergeParents.length === 0) {
      ctx.beginPath();
      ctx.moveTo(this.previousRevision.drawX, this.previousRevision.drawY);
      ctx.lineTo(this.drawX, this.drawY);
      ctx.lineWidth = template.revision.line.width;
      ctx.strokeStyle = template.revision.line.color;
      ctx.stroke();
      ctx.closePath();
    } else if (this.mergeParents.length > 0) {
      // Draw lines from all merge parents to this revision
      this.mergeParents.forEach(parentRev => {
        ctx.beginPath();
        ctx.moveTo(parentRev.drawX, parentRev.drawY);
        ctx.lineTo(this.drawX, this.drawY);
        ctx.lineWidth = template.revision.line.width;
        ctx.strokeStyle = template.revision.line.color;
        ctx.stroke();
        ctx.closePath();
      });
    }

    // Draw the revision node (dot)
    ctx.beginPath();
    ctx.arc(this.drawX, this.drawY, this.nodeSize, 0, Math.PI * 2, true);
    ctx.fillStyle = this.revisionColor;
    ctx.strokeStyle = template.revision.node.strokeColor;
    ctx.lineWidth = template.revision.node.strokeWidth;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // Draw revision message
    if (template.revision.message.isVisible) {
      ctx.font = template.revision.message.font;
      ctx.fillStyle = template.revision.message.color;
      const messageX = this.drawX + template.revision.message.offsetX;
      const messageY = this.drawY + template.revision.message.offsetY;
      ctx.fillText(this.messageText, messageX, messageY);

      // Optionally draw author/date
      if (template.revision.message.showAuthor) {
        ctx.font = template.revision.message.authorFont;
        ctx.fillStyle = template.revision.message.authorColor;
        ctx.fillText(this.authorName, messageX, messageY + template.revision.message.lineHeight);
      }
    }

    // Draw arrow if enabled (e.g., for HEAD or specific revisions)
    if (this.showArrow) {
      // Arrow drawing logic can be complex, simplified for brevity.
      // This would typically involve drawing a small triangle or custom shape.
      // For a basic representation:
      ctx.beginPath();
      ctx.moveTo(this.drawX, this.drawY - this.nodeSize - 5);
      ctx.lineTo(this.drawX - 5, this.drawY - this.nodeSize - 15);
      ctx.lineTo(this.drawX + 5, this.drawY - this.nodeSize - 15);
      ctx.closePath();
      ctx.fillStyle = this.revisionColor;
      ctx.fill();
    }
  };

  /**
   * Generates a simple pseudo-random hash for the revision.
   * This is a placeholder and not cryptographically secure.
   *
   * @returns {string} A short, unique-ish hash string.
   * @private
   * @this Revision
   */
  Revision.prototype.generateHash = function () {
    const timestampPart = this.revisionDate.getTime().toString(16);
    const randomPart = Math.random().toString(16).substring(2, 8);
    return (timestampPart + randomPart).substring(0, 10);
  };

  // --------------------------------------------------------------------
  // -----------------------      FlowTemplate      ------------------------
  // --------------------------------------------------------------------

  /**
   * FlowTemplate - Defines the visual styles and layout parameters for the RevisionFlow.
   *
   * @constructor
   *
   * @param {Object} [templateConfig] - Custom template configuration options.
   *
   * @this FlowTemplate
   */
  function FlowTemplate(templateConfig) {
    this.config = templateConfig || {};
    this.currentTemplateName = "default"; // To track which template is active

    // Default template settings
    this.revision = {
      spacingX: 0,
      spacingY: 60,
      color: "#000000",
      node: {
        size: 5,
        strokeWidth: 2,
        strokeColor: "#000000",
        fillColor: "#000000",
      },
      line: {
        width: 2,
        color: "#CCCCCC",
      },
      message: {
        isVisible: true,
        font: "normal 12pt Arial",
        color: "#000",
        offsetX: 15,
        offsetY: 3,
        showAuthor: true,
        authorFont: "normal 10pt Arial",
        authorColor: "#666",
        lineHeight: 18,
      },
    };

    this.path = {
      spacingX: 40,
      spacingY: 0,
      lineWidth: 10,
      color: "#666",
      lineDash: [], // Solid line by default
      mergeStyle: "straight", // "straight" or "bezier"
    };

    this.arrow = {
      isActive: false, // Whether to draw arrows on revisions
      size: 8,
      color: "#000",
    };

    this.palette = ["#696969", "#545454", "#303030", "#424242", "#707070", "#8d8d8d", "#a8a8a8", "#c4c4c4", "#e0e0e0", "#fcfcfc"];

    // Apply custom configuration if provided
    this.applyConfig(this.config);
  }

  /**
   * Applies custom configuration settings to the template.
   *
   * @param {Object} customConfig - The configuration object to apply.
   * @this FlowTemplate
   */
  FlowTemplate.prototype.applyConfig = function (customConfig) {
    // Deep merge for template properties
    const mergeDeep = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    };
    mergeDeep(this, customConfig);
  };

  /**
   * Retrieves a predefined template or applies custom settings.
   *
   * @param {(string|Object)} templateIdentifier - The name of a predefined template ("metro", "blackarrow") or a custom config object.
   * @returns {FlowTemplate} The configured FlowTemplate instance.
   * @this FlowTemplate
   */
  FlowTemplate.prototype.getTemplate = function (templateIdentifier) {
    const predefinedTemplates = {
      "metro": {
        revision: {
          spacingX: 0,
          spacingY: 90,
          node: { size: 7, strokeWidth: 0, fillColor: "#303030" },
          line: { width: 9, color: "#303030" },
          message: { font: "normal 14pt Arial", color: "#333", offsetX: 20, offsetY: 5, showAuthor: true },
        },
        path: {
          spacingX: 50,
          spacingY: 0,
          lineWidth: 9,
          mergeStyle: "bezier",
        },
        arrow: { isActive: true },
        palette: ["#696969", "#545454", "#303030", "#424242", "#707070", "#8d8d8d", "#a8a8a8", "#c4c4c4", "#e0e0e0", "#fcfcfc"],
      },
      "blackarrow": {
        revision: {
          spacingX: 0,
          spacingY: 50,
          node: { size: 3, strokeWidth: 0, fillColor: "#000000" },
          line: { width: 1, color: "#CCCCCC" },
          message: { font: "normal 10pt Arial", color: "#000", offsetX: 10, offsetY: 2, showAuthor: false },
        },
        path: {
          spacingX: 20,
          spacingY: 0,
          lineWidth: 1,
          lineDash: [2, 2],
          mergeStyle: "straight",
        },
        arrow: { isActive: true, size: 5, color: "#000" },
        palette: ["#000000", "#444444", "#888888", "#BBBBBB"],
      },
    };

    if (typeof templateIdentifier === "string" && predefinedTemplates[templateIdentifier]) {
      this.currentTemplateName = templateIdentifier;
      this.applyConfig(predefinedTemplates[templateIdentifier]);
    } else if (typeof templateIdentifier === "object" && templateIdentifier !== null) {
      this.currentTemplateName = "custom";
      this.applyConfig(templateIdentifier); // Apply custom object directly
    }
    // If identifier is not found or invalid, it will retain the default settings

    return this;
  };

  // Expose RevisionFlow globally
  window.RevisionFlow = RevisionFlow;
})();