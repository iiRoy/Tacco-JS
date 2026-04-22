const ColorUtilityKit = {};

ColorUtilityKit.ConversionModule = (() => {
  const padToTwoHexChars = (numberValue) => numberValue.toString(16).padStart(2, '0');

  const interpretHexCode = (codeString) => {
    if (codeString.length === 7) { // #RRGGBB format
      return [
        parseInt(codeString.substring(1, 3), 16) / 255,
        parseInt(codeString.substring(3, 5), 16) / 255,
        parseInt(codeString.substring(5, 7), 16) / 255
      ];
    }
    if (codeString.length === 4) { // #RGB shorthand
      return [
        parseInt(codeString.substring(1, 2), 16) / 15,
        parseInt(codeString.substring(2, 3), 16) / 15,
        parseInt(codeString.substring(3, 4), 16) / 15
      ];
    }
    return null; // Invalid format
  };

  const generateHexCode = (rgbComponents) => {
    const [redVal, greenVal, blueVal] = rgbComponents.map(c => Math.round(c * 255));
    return `#${padToTwoHexChars(redVal)}${padToTwoHexChars(greenVal)}${padToTwoHexChars(blueVal)}`;
  };

  const calculateIntermediateHue = (m1, m2, h) => {
    h = (h + 1) % 1;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    return m1;
  };

  const translateHSLtoRGB = (hslTriplet) => {
    const [hueComponent, saturationComponent, lightnessComponent] = hslTriplet;
    let tempM1, tempM2;

    tempM2 = (lightnessComponent <= 0.5) ? lightnessComponent * (saturationComponent + 1) : lightnessComponent + saturationComponent - lightnessComponent * saturationComponent;
    tempM1 = lightnessComponent * 2 - tempM2;

    return [
      calculateIntermediateHue(tempM1, tempM2, hueComponent + 1 / 3),
      calculateIntermediateHue(tempM1, tempM2, hueComponent),
      calculateIntermediateHue(tempM1, tempM2, hueComponent - 1 / 3)
    ];
  };

  const translateRGBtoHSL = (rgbTriplet) => {
    const [r, g, b] = rgbTriplet;
    const minimumValue = Math.min(r, g, b);
    const maximumValue = Math.max(r, g, b);
    const range = maximumValue - minimumValue;
    let h = 0;
    let s = 0;
    const l = (minimumValue + maximumValue) / 2;

    if (l > 0 && l < 1) {
      s = range / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    }

    if (range > 0) {
      if (maximumValue === r && maximumValue !== g) h += (g - b) / range;
      if (maximumValue === g && maximumValue !== b) h += (2 + (b - r) / range);
      if (maximumValue === b && maximumValue !== r) h += (4 + (r - g) / range);
      h /= 6;
    }
    return [h, s, l];
  };

  return {
    interpretHexCode,
    generateHexCode,
    translateHSLtoRGB,
    translateRGBtoHSL,
  };
})();

ColorUtilityKit.PaletteGenerator = class {
  constructor(targetHostElement, configuration = {}) {
    this.hostNode = targetHostElement;
    this.hexDisplayValue = null;
    this.rgbComponents = null;
    this.hslComponents = [0, 0, 0]; // Default to black
    this.linkedOutput = null; // Can be a function or an HTMLInputElement

    this.isActivelyDragging = false;
    this.activeDragArea = null; // 'hue-ring' or 'saturation-lightness-square'
    this.hostOffset = { x: 0, y: 0 }; // Position of the host element on the page

    this.settings = {
      dimension: 300, // Overall width/height
      ringThickness: configuration.dimension ? configuration.dimension / 10 : 30,
      ...configuration
    };

    this.ringOuterBoundary = (this.settings.dimension - this.settings.ringThickness) / 2 - 1;
    this.squarePanelSize = Math.floor((this.ringOuterBoundary - this.settings.ringThickness / 2) * 0.7) - 1;
    this.midpointCoordinate = Math.floor(this.settings.dimension / 2);
    this.indicatorDotSize = this.settings.ringThickness * 0.3;

    this.isDarkContent = false; // Determines text/indicator color contrast

    this.buildUserInterface();
    this.attachInteractionListeners();

    // Set initial color based on configuration or default
    if (this.settings.initialColor) {
      this.setHexColor(this.settings.initialColor);
    } else {
      this.setHSLColor([0, 1, 0.5]); // Default to red
    }
    this.refreshDisplay(); // Initial drawing
  }

  // Public API methods
  connectOutputElement(target) {
    if (this.linkedOutput instanceof HTMLInputElement) {
      this.linkedOutput.removeEventListener('keyup', this.handleInputKeyup);
    }

    this.hexDisplayValue = null; // Reset current color state

    if (typeof target === 'function') {
      this.linkedOutput = target;
    } else if (typeof target === 'object' || typeof target === 'string') {
      this.linkedOutput = typeof target === 'string' ? document.querySelector(target) : target;
      if (this.linkedOutput instanceof HTMLInputElement) {
        this.linkedOutput.addEventListener('keyup', this.handleInputKeyup);
        if (this.linkedOutput.value) {
          this.setHexColor(this.linkedOutput.value);
        }
      }
    }
    return this;
  }

  setHexColor(newHex) {
    const rgb = ColorUtilityKit.ConversionModule.interpretHexCode(newHex);
    if (rgb && this.hexDisplayValue !== newHex) {
      this.hexDisplayValue = newHex;
      this.rgbComponents = rgb;
      this.hslComponents = ColorUtilityKit.ConversionModule.translateRGBtoHSL(this.rgbComponents);
      this.refreshDisplay();
    }
    return this;
  }

  setHSLColor(newHSL) {
    this.hslComponents = newHSL;
    this.rgbComponents = ColorUtilityKit.ConversionModule.translateHSLtoRGB(this.hslComponents);
    this.hexDisplayValue = ColorUtilityKit.ConversionModule.generateHexCode(this.rgbComponents);
    this.refreshDisplay();
    return this;
  }

  // Internal component methods
  buildUserInterface() {
    this.hostNode.innerHTML = `
      <div class="color-palette-container" style="position: relative;">
        <div class="color-palette-solid-background"></div>
        <canvas class="color-palette-hue-mask"></canvas>
        <canvas class="color-palette-selection-overlay"></canvas>
      </div>
    `;

    const container = this.hostNode.querySelector('.color-palette-container');
    const childElements = Array.from(container.children);

    // Set dimensions and absolute positioning for all children
    container.style.width = container.style.height = `${this.settings.dimension}px`;
    childElements.forEach(el => {
      el.width = el.height = this.settings.dimension;
      el.style.width = el.style.height = `${this.settings.dimension}px`;
      el.style.position = 'absolute';
    });

    this.solidPanel = this.hostNode.querySelector('.color-palette-solid-background');
    Object.assign(this.solidPanel.style, {
      width: `${this.squarePanelSize * 2 - 1}px`,
      height: `${this.squarePanelSize * 2 - 1}px`,
      left: `${this.midpointCoordinate - this.squarePanelSize}px`,
      top: `${this.midpointCoordinate - this.squarePanelSize}px`
    });

    this.hueMaskCanvas = this.hostNode.querySelector('.color-palette-hue-mask');
    this.hueMaskContext = this.hueMaskCanvas.getContext('2d');
    this.selectionOverlayCanvas = this.hostNode.querySelector('.color-palette-selection-overlay');
    this.selectionOverlayContext = this.selectionOverlayCanvas.getContext('2d');

    this.hueMaskContext.translate(this.midpointCoordinate, this.midpointCoordinate);
    this.selectionOverlayContext.translate(this.midpointCoordinate, this.midpointCoordinate);

    this.drawColorRing();
    this.drawSaturationLightnessPanel();
  }

  attachInteractionListeners() {
    this.hostNode.addEventListener('mousedown', this.handleMouseDownEvent);
  }

  handleMouseDownEvent = (event) => { // Using arrow function to preserve 'this' context
    if (!this.isActivelyDragging) {
      document.addEventListener('mousemove', this.handleMouseMoveEvent);
      document.addEventListener('mouseup', this.handleMouseUpEvent);
      this.isActivelyDragging = true;
    }

    const hostBoundingRect = this.hostNode.getBoundingClientRect();
    this.hostOffset = {
      x: hostBoundingRect.left + window.scrollX,
      y: hostBoundingRect.top + window.scrollY
    };

    const mouseCoordinates = this.getRelativeMouseCoordinates(event);
    this.activeDragArea = (Math.max(Math.abs(mouseCoordinates.x), Math.abs(mouseCoordinates.y)) > (this.squarePanelSize + 2)) ? 'hue-ring' : 'saturation-lightness-square';

    this.handleMouseMoveEvent(event); // Process the initial click
    event.preventDefault(); // Prevent default browser behavior like text selection
  }

  handleMouseMoveEvent = (event) => {
    const mouseCoordinates = this.getRelativeMouseCoordinates(event);
    let [currentHue, currentSaturation, currentLightness] = this.hslComponents;

    if (this.activeDragArea === 'hue-ring') {
      const calculatedHue = Math.atan2(mouseCoordinates.x, -mouseCoordinates.y) / (Math.PI * 2);
      currentHue = (calculatedHue + 1) % 1;
    } else { // 'saturation-lightness-square'
      currentSaturation = Math.max(0, Math.min(1, -(mouseCoordinates.x / this.squarePanelSize / 2) + 0.5));
      currentLightness = Math.max(0, Math.min(1, -(mouseCoordinates.y / this.squarePanelSize / 2) + 0.5));
    }
    this.setHSLColor([currentHue, currentSaturation, currentLightness]);
    event.preventDefault();
  }

  handleMouseUpEvent = () => {
    document.removeEventListener('mousemove', this.handleMouseMoveEvent);
    document.removeEventListener('mouseup', this.handleMouseUpEvent);
    this.isActivelyDragging = false;
  }

  handleInputKeyup = (event) => {
    if (event.target.value && event.target.value !== this.hexDisplayValue) {
      this.setHexColor(event.target.value);
    }
  }

  getRelativeMouseCoordinates(event) {
    return {
      x: event.pageX - this.hostOffset.x - this.midpointCoordinate,
      y: event.pageY - this.hostOffset.y - this.midpointCoordinate
    };
  }

  drawColorRing() {
    const totalSegments = 48; // More segments than original for smoother wheel
    const outerR = this.ringOuterBoundary;
    const thickness = this.settings.ringThickness;
    const context = this.hueMaskContext;

    context.save();
    context.lineWidth = thickness / outerR;
    context.scale(outerR, outerR);

    for (let i = 0; i < totalSegments; ++i) {
      const startFraction = i / totalSegments;
      const endFraction = (i + 1) / totalSegments;
      const startAngle = startFraction * Math.PI * 2;
      const endAngle = endFraction * Math.PI * 2;

      const xStart = Math.sin(startAngle);
      const yStart = -Math.cos(startAngle);
      const xEnd = Math.sin(endAngle);
      const yEnd = -Math.cos(endAngle);

      const midAngle = (startAngle + endAngle) / 2;
      const tangentScaling = 1 / Math.cos((endAngle - startAngle) / 2);
      const xMid = Math.sin(midAngle) * tangentScaling;
      const yMid = -Math.cos(midAngle) * tangentScaling;

      const colorStart = ColorUtilityKit.ConversionModule.generateHexCode(ColorUtilityKit.ConversionModule.translateHSLtoRGB([startFraction, 1, 0.5]));
      const colorEnd = ColorUtilityKit.ConversionModule.generateHexCode(ColorUtilityKit.ConversionModule.translateHSLtoRGB([endFraction, 1, 0.5]));

      const linearGradient = context.createLinearGradient(xStart, yStart, xEnd, yEnd);
      linearGradient.addColorStop(0, colorStart);
      linearGradient.addColorStop(1, colorEnd);
      context.strokeStyle = linearGradient;

      context.beginPath();
      context.moveTo(xStart, yStart);
      context.quadraticCurveTo(xMid, yMid, xEnd, yEnd);
      context.stroke();
    }
    context.restore();
  }

  drawSaturationLightnessPanel() {
    const context = this.hueMaskContext;
    const panelDimension = this.squarePanelSize * 2;
    const halfPanel = this.squarePanelSize;

    // Utilize an offscreen canvas for pixel manipulation
    const offscreenCanvas = document.createElement('canvas');
    const bufferSize = Math.floor(panelDimension / 2); // Half resolution for speed
    offscreenCanvas.width = offscreenCanvas.height = bufferSize + 1;
    const offscreenContext = offscreenCanvas.getContext('2d');
    const imageDataBuffer = offscreenContext.createImageData(bufferSize + 1, bufferSize + 1);
    const pixelDataArray = imageDataBuffer.data;

    let currentPixelIdx = 0;
    const xStep = 1 / bufferSize;
    const yStep = 1 / bufferSize;

    for (let yCoord = 0; yCoord <= bufferSize; ++yCoord) {
      const currentLightnessRatio = 1 - yCoord * yStep;
      for (let xCoord = 0; xCoord <= bufferSize; ++xCoord) {
        const currentSaturationRatio = 1 - xCoord * xStep;
        
        // Calculate alpha and grayscale color based on S/L
        const opacityValue = 1 - 2 * Math.min(currentLightnessRatio * currentSaturationRatio, (1 - currentLightnessRatio) * currentSaturationRatio);
        const grayScaleValue = (opacityValue > 0) ? ((2 * currentLightnessRatio - 1 + opacityValue) * 0.5 / opacityValue) : 0;

        pixelDataArray[currentPixelIdx++] = Math.round(grayScaleValue * 255); // Red
        pixelDataArray[currentPixelIdx++] = Math.round(grayScaleValue * 255); // Green
        pixelDataArray[currentPixelIdx++] = Math.round(grayScaleValue * 255); // Blue
        pixelDataArray[currentPixelIdx++] = Math.round(opacityValue * 255); // Alpha
      }
    }

    offscreenContext.putImageData(imageDataBuffer, 0, 0);
    context.drawImage(offscreenCanvas, 0, 0, bufferSize + 1, bufferSize + 1, -halfPanel, -halfPanel, panelDimension, panelDimension);
  }

  drawSelectionIndicators() {
    const context = this.selectionOverlayContext;
    const entireDimension = this.settings.dimension;
    const indicatorOutlineWidth = Math.ceil(this.indicatorDotSize / 4);
    const indicatorCoreRadius = this.indicatorDotSize - indicatorOutlineWidth + 1;

    const [hue, saturation, lightness] = this.hslComponents;
    const hueAngleInRadians = hue * Math.PI * 2;
    const hueIndicatorPositionX = Math.sin(hueAngleInRadians) * this.ringOuterBoundary;
    const hueIndicatorPositionY = -Math.cos(hueAngleInRadians) * this.ringOuterBoundary;

    const squareIndicatorPositionX = (0.5 - saturation) * this.squarePanelSize * 2;
    const squareIndicatorPositionY = (0.5 - lightness) * this.squarePanelSize * 2;

    const darkStroke = '#000';
    const lightStroke = '#fff';
    const mainStrokeColor = this.isDarkContent ? lightStroke : darkStroke;
    const secondaryStrokeColor = this.isDarkContent ? darkStroke : lightStroke;

    const markerDefinitions = [
      { x: hueIndicatorPositionX, y: hueIndicatorPositionY, r: indicatorCoreRadius, color: darkStroke, stroke: indicatorOutlineWidth + 1 },
      { x: hueIndicatorPositionX, y: hueIndicatorPositionY, r: this.indicatorDotSize, color: lightStroke, stroke: indicatorOutlineWidth },
      { x: squareIndicatorPositionX, y: squareIndicatorPositionY, r: indicatorCoreRadius, color: secondaryStrokeColor, stroke: indicatorOutlineWidth + 1 },
      { x: squareIndicatorPositionX, y: squareIndicatorPositionY, r: this.indicatorDotSize, color: mainStrokeColor, stroke: indicatorOutlineWidth },
    ];

    context.clearRect(-this.midpointCoordinate, -this.midpointCoordinate, entireDimension, entireDimension); // Clear overlay
    markerDefinitions.forEach(def => {
      context.lineWidth = def.stroke;
      context.strokeStyle = def.color;
      context.beginPath();
      context.arc(def.x, def.y, def.r, 0, Math.PI * 2, true);
      context.stroke();
    });
  }

  refreshDisplay() {
    // Determine if content (text) should be light or dark for contrast
    const [r, g, b] = this.rgbComponents;
    this.isDarkContent = (r * 0.3 + g * 0.59 + b * 0.11) <= 0.6;

    // Update the background color of the saturation/lightness panel
    this.solidPanel.style.backgroundColor = ColorUtilityKit.ConversionModule.generateHexCode(ColorUtilityKit.ConversionModule.translateHSLtoRGB([this.hslComponents[0], 1, 0.5]));

    this.drawSelectionIndicators();

    // Notify linked elements or callback function
    if (this.linkedOutput instanceof HTMLInputElement) {
      // Apply background/foreground color to the input element
      this.linkedOutput.style.backgroundColor = this.hexDisplayValue;
      this.linkedOutput.style.color = this.isDarkContent ? '#fff' : '#000';

      // Update the input's value and trigger a 'change' event
      if (this.linkedOutput.value !== this.hexDisplayValue) {
        this.linkedOutput.value = this.hexDisplayValue;
        this.linkedOutput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (typeof this.linkedOutput === 'function') {
      this.linkedOutput.call(this, this.hexDisplayValue);
    }
  }
};

// Global entry point function (factory pattern)
function instantiateColorWidget(domTarget, widgetOptions) {
  const containerNode = typeof domTarget === 'string' ? document.querySelector(domTarget) : domTarget;
  if (!containerNode) {
    console.error("Target element for color widget not found.");
    return null;
  }

  // Prevent multiple instances on the same element
  if (containerNode.activeColorWidget) {
    return containerNode.activeColorWidget;
  }

  const newWidgetInstance = new ColorUtilityKit.PaletteGenerator(containerNode, widgetOptions);
  containerNode.activeColorWidget = newWidgetInstance;
  return newWidgetInstance;
}

// Attach to global scope for non-module usage
window.instantiateColorWidget = instantiateColorWidget;