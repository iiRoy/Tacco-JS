function GeographicVisualizer(renderTarget, configOverrides) {
  // Utility for merging configurations (Type IV: avoid jQuery.extend)
  function mergeConfigurations(base, overrides) {
    const merged = {};
    for (let key in base) {
      if (Object.prototype.hasOwnProperty.call(base, key)) {
        merged[key] = base[key];
      }
    }
    for (let key in overrides) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        // Simple merge: deeper objects are replaced, not deeply merged
        // This mirrors jQuery.extend's default behavior for non-deep copies
        merged[key] = overrides[key];
      }
    }
    return merged;
  }

  this.renderTargetElement = renderTarget;
  this.displayOptions = mergeConfigurations(defaultVisualConfiguration, configOverrides);

  this.displayAreaWidth = this.renderTargetElement.offsetWidth;
  this.displayAreaHeight = this.renderTargetElement.offsetHeight;

  this.scalingFactor = Math.min(this.displayAreaWidth / geographicUnitBaseWidth, this.displayAreaHeight / geographicUnitBaseHeight);
  this.computedLabelZoneWidth = Math.ceil(geographicUnitLabelSideWidth / this.scalingFactor);

  const totalCanvasWidth = geographicUnitBaseWidth + Math.max(0, this.computedLabelZoneWidth - geographicUnitLabelSideWidth);
  this.drawingCanvas = Raphael(this.renderTargetElement, totalCanvasWidth, geographicUnitBaseHeight);
  this.drawingCanvas.setSize(this.displayAreaWidth, this.displayAreaHeight);
  this.drawingCanvas.setViewBox(0, 0, totalCanvasWidth, geographicUnitBaseHeight, false);

  this.areaInteractionLayers = {};
  this.areaRenderLayers = {};
  this.areaBoundingData = {};
  this.lastRenderedShape = null;

  this.labelBackgrounds = {};
  this.labelTextElements = {};
  this.labelInteractionLayers = {};

  this.boundInteractionHandler = this.onVisualInteraction.bind(this);
  this.boundHoverInHandler = this.onVisualHoverIn.bind(this);
  this.boundHoverOutHandler = this.onVisualHoverOut.bind(this);

  this.constructGeographicAreas();
  if (this.displayOptions.displayLabels) {
    this.constructRegionLabels();
  }
}

GeographicVisualizer.prototype = {
  constructGeographicAreas: function() {
    for (const areaCode in geographicPathData) {
      if (Object.prototype.hasOwnProperty.call(geographicPathData, areaCode)) {
        let currentAreaStyles = this.displayOptions.areaRenderStyles;
        if (this.displayOptions.areaSpecificRenderStyles[areaCode]) {
          currentAreaStyles = mergeConfigurations(currentAreaStyles, this.displayOptions.areaSpecificRenderStyles[areaCode]);
        }
        this.areaRenderLayers[areaCode] = this.drawingCanvas.path(geographicPathData[areaCode]).attr(currentAreaStyles);
        this.lastRenderedShape = this.areaRenderLayers[areaCode];

        const interactionLayer = this.drawingCanvas.path(geographicPathData[areaCode]).attr({
          fill: "#000",
          "stroke-width": 0,
          "opacity": 0.0,
          'cursor': 'pointer'
        });
        interactionLayer.node.geographicIdentifier = areaCode;
        this.areaInteractionLayers[areaCode] = interactionLayer;
      }
    }

    for (const areaCode in this.areaInteractionLayers) {
      if (Object.prototype.hasOwnProperty.call(this.areaInteractionLayers, areaCode)) {
        this.areaInteractionLayers[areaCode].toFront();
        this.areaInteractionLayers[areaCode].node.addEventListener('mouseout', this.boundHoverOutHandler);
        this.areaInteractionLayers[areaCode].node.addEventListener('click', this.boundInteractionHandler);
        this.areaInteractionLayers[areaCode].node.addEventListener('mouseover', this.boundHoverInHandler);
      }
    }

    for (const areaCode in this.areaRenderLayers) {
      if (Object.prototype.hasOwnProperty.call(this.areaRenderLayers, areaCode)) {
        const boundingBox = this.areaRenderLayers[areaCode].getBBox();
        const scaledBoundingBox = {};
        for (const prop in boundingBox) {
          if (Object.prototype.hasOwnProperty.call(boundingBox, prop) && typeof boundingBox[prop] === 'number') {
            scaledBoundingBox[prop] = boundingBox[prop] * this.scalingFactor;
          } else {
            scaledBoundingBox[prop] = boundingBox[prop];
          }
        }
        this.areaBoundingData[areaCode] = scaledBoundingBox;
      }
    }
  },

  constructRegionLabels: function() {
    const northeastAreas = ['VT', 'NH', 'MA', 'RI', 'CT', 'NJ', 'DE', 'MD', 'DC'];

    const northeastBoxX = 860;
    const northeastBoxY = 220;
    const labelWidth = this.displayOptions.labelWidthUnit;
    const labelHeight = this.displayOptions.labelHeightUnit;
    const labelGap = this.displayOptions.labelSpacingUnit;
    const labelRadius = this.displayOptions.labelCornerRadius;

    const scaledShapeWidth = labelWidth / this.scalingFactor;
    const scaledShapeHeight = labelHeight / this.scalingFactor;
    const scaledColumnWidth = (labelWidth + labelGap) / this.scalingFactor;
    const scaledRowOffset = (labelHeight + labelGap) / this.scalingFactor * 0.5;
    const scaledShapeRadius = labelRadius / this.scalingFactor;

    for (let i = 0; i < northeastAreas.length; ++i) {
      const areaCode = northeastAreas[i];
      const xPos = ((i + 1) % 2) * scaledColumnWidth + northeastBoxX;
      const yPos = i * scaledRowOffset + northeastBoxY;

      let labelBackingStyles = this.displayOptions.labelBackgroundStyles;
      if (this.displayOptions.areaSpecificLabelBackgroundStyles[areaCode]) {
        labelBackingStyles = mergeConfigurations(labelBackingStyles, this.displayOptions.areaSpecificLabelBackgroundStyles[areaCode]);
      }
      this.labelBackgrounds[areaCode] = this.drawingCanvas.rect(xPos, yPos, scaledShapeWidth, scaledShapeHeight, scaledShapeRadius).attr(labelBackingStyles);

      let labelTextStyles = this.displayOptions.labelTextStyle;
      if (this.displayOptions.areaSpecificLabelTextStyle[areaCode]) {
        labelTextStyles = mergeConfigurations(labelTextStyles, this.displayOptions.areaSpecificLabelTextStyle[areaCode]);
      }

      if (labelTextStyles['font-size']) {
        labelTextStyles['font-size'] = (parseInt(labelTextStyles['font-size']) / this.scalingFactor) + 'px';
      }
      this.labelTextElements[areaCode] = this.drawingCanvas.text(xPos + (scaledShapeWidth / 2), yPos + (scaledShapeHeight / 2), areaCode).attr(labelTextStyles);

      const labelInteractionLayer = this.drawingCanvas.rect(xPos, yPos, scaledShapeWidth, scaledShapeHeight, scaledShapeRadius).attr({
        fill: "#000",
        "stroke-width": 0,
        "opacity": 0.0,
        'cursor': 'pointer'
      });
      labelInteractionLayer.node.geographicIdentifier = areaCode;
      this.labelInteractionLayers[areaCode] = labelInteractionLayer;
    }

    for (const areaCode in this.labelInteractionLayers) {
      if (Object.prototype.hasOwnProperty.call(this.labelInteractionLayers, areaCode)) {
        this.labelInteractionLayers[areaCode].toFront();
        this.labelInteractionLayers[areaCode].node.addEventListener('mouseout', this.boundHoverOutHandler);
        this.labelInteractionLayers[areaCode].node.addEventListener('click', this.boundInteractionHandler);
        this.labelInteractionLayers[areaCode].node.addEventListener('mouseover', this.boundHoverInHandler);
      }
    }
  },

  retrieveAreaContext: function(areaCode) {
    const areaShape = this.areaRenderLayers[areaCode];
    const areaHitArea = this.areaInteractionLayers[areaCode];
    const labelBackground = this.labelBackgrounds[areaCode] || null;
    const labelText = this.labelTextElements[areaCode] || null;
    const labelHitArea = this.labelInteractionLayers[areaCode] || null;
    const boundingBox = this.areaBoundingData[areaCode];

    return {
      visualElement: areaShape,
      interactionElement: areaHitArea,
      identifier: areaCode,
      labelBg: labelBackground,
      labelTxt: labelText,
      labelInteract: labelHitArea,
      bounds: boundingBox
    };
  },

  // Event dispatching helper
  dispatchVisualEvent: function(eventName, domEvent, areaInfo) {
    let preventDefault = false;

    // Global event handler
    const globalHandler = this.displayOptions[`onArea${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`];
    if (typeof globalHandler === 'function') {
      if (globalHandler.call(this.renderTargetElement, domEvent, areaInfo) === false) {
        preventDefault = true;
      }
    }

    // State-specific event handler
    const specificCallbacks = this.displayOptions[`area${eventName.charAt(0).toUpperCase() + eventName.slice(1)}Callbacks`];
    if (specificCallbacks && typeof specificCallbacks[areaInfo.identifier] === 'function') {
      if (specificCallbacks[areaInfo.identifier].call(this.renderTargetElement, domEvent, areaInfo) === false) {
        preventDefault = true;
      }
    }

    return !preventDefault;
  },

  onVisualHoverOut: function(domEvent) {
    const areaCode = domEvent.target.geographicIdentifier;
    if (!areaCode) return;
    const areaDetails = this.retrieveAreaContext(areaCode);
    if (!areaDetails.interactionElement) return;

    if (this.dispatchVisualEvent('mouseOut', domEvent, areaDetails)) {
      this.revertAreaVisuals(areaDetails);
    }
  },

  revertAreaVisuals: function(areaDetails) {
    let defaultStyles = this.displayOptions.areaRenderStyles;
    if (this.displayOptions.areaSpecificRenderStyles[areaDetails.identifier]) {
      defaultStyles = mergeConfigurations(defaultStyles, this.displayOptions.areaSpecificRenderStyles[areaDetails.identifier]);
    }
    areaDetails.visualElement.animate(defaultStyles, this.displayOptions.areaHoverTransitionDuration);

    if (areaDetails.labelBg) {
      let labelBgStyles = this.displayOptions.labelBackgroundStyles;
      if (this.displayOptions.areaSpecificLabelBackgroundStyles[areaDetails.identifier]) {
        labelBgStyles = mergeConfigurations(labelBgStyles, this.displayOptions.areaSpecificLabelBackgroundStyles[areaDetails.identifier]);
      }
      areaDetails.labelBg.animate(labelBgStyles, this.displayOptions.areaHoverTransitionDuration);