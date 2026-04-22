(function(DisplayCanvas) {

    if (!DisplayCanvas.version || DisplayCanvas.version.major < 1) {
        throw new Error('CanvasRulerExtension requires OpenSeadragon version 1.0.0+');
    }

    class CoordPair {
        constructor(xCoord, yCoord) {
            this.x = xCoord;
            this.y = yCoord;
        }
    }

    class MeasurementUnitProcessor {
        static decimalLog(val) {
            return Math.log(val) / Math.log(10);
        }

        static extractCoefficient(val) {
            if (val === 0) return 0;
            let coefficient = val;
            let exponent = Math.floor(MeasurementUnitProcessor.decimalLog(Math.abs(coefficient)));
            coefficient /= Math.pow(10, exponent);
            return coefficient;
        }

        static roundToSignificantFigures(val, figures) {
            if (val === 0) return 0;
            return parseFloat(val.toPrecision(figures));
        }

        static computeOptimalPhysicalLength(scaleVal, minPxWidth) {
            const targetPhysLength = minPxWidth / scaleVal;
            const orderOfMagnitude = Math.floor(MeasurementUnitProcessor.decimalLog(targetPhysLength));
            const baseMultiplier = Math.pow(10, orderOfMagnitude);

            const potentialFactors = [1, 2, 5];
            for (const factor of potentialFactors) {
                const candidatePhysLength = factor * baseMultiplier;
                if (candidatePhysLength * scaleVal >= minPxWidth) {
                    return candidatePhysLength;
                }
            }
            // Fallback, should not be reached if potentialFactors are well-chosen
            return potentialFactors[0] * baseMultiplier * 10;
        }

        static formatQuantityWithPrefix(value, unitSuffix) {
            if (value < 0.000001) {
                return MeasurementUnitProcessor.roundToSignificantFigures(value * 1000000000, 3) + " n" + unitSuffix;
            }
            if (value < 0.001) {
                return MeasurementUnitProcessor.roundToSignificantFigures(value * 1000000, 3) + " μ" + unitSuffix;
            }
            if (value < 1) {
                return MeasurementUnitProcessor.roundToSignificantFigures(value * 1000, 3) + " m" + unitSuffix;
            }
            if (value >= 1000) {
                return MeasurementUnitProcessor.roundToSignificantFigures(value / 1000, 3) + " k" + unitSuffix;
            }
            return MeasurementUnitProcessor.roundToSignificantFigures(value, 3) + " " + unitSuffix;
        }

        static determineFormattedSegment(scaleVal, minPxWidth, unitSuffix, pluralize) {
            const desiredPhysLength = MeasurementUnitProcessor.computeOptimalPhysicalLength(scaleVal, minPxWidth);
            const actualPixelLength = desiredPhysLength * scaleVal;
            const displayedValue = MeasurementUnitProcessor.roundToSignificantFigures(desiredPhysLength, 3);
            const suffix = pluralize && displayedValue > 1 ? "s" : "";
            return {
                pixelSize: actualPixelLength,
                textContent: displayedValue + " " + unitSuffix + suffix
            };
        }

        static determineFormattedMetricSegment(scaleVal, minPxWidth, unitSuffix) {
            const desiredPhysLength = MeasurementUnitProcessor.computeOptimalPhysicalLength(scaleVal, minPxWidth);
            const actualPixelLength = desiredPhysLength * scaleVal;
            const formattedText = MeasurementUnitProcessor.formatQuantityWithPrefix(desiredPhysLength, unitSuffix);
            return {
                pixelSize: actualPixelLength,
                textContent: formattedText
            };
        }

        static metricLengthFormatter(currentPPM, minPixelWidth) {
            return MeasurementUnitProcessor.determineFormattedMetricSegment(currentPPM, minPixelWidth, "m");
        }

        static imperialLengthFormatter(currentPPM, minPixelWidth) {
            const maxPxLength = minPixelWidth * 2;
            const currentPPI = currentPPM * 0.0254; // pixels per inch
            if (maxPxLength < currentPPI * 12) { // check if less than a foot
                if (maxPxLength < currentPPI) { // check if less than an inch
                    const currentPPT = currentPPI / 1000; // pixels per thou
                    return MeasurementUnitProcessor.determineFormattedSegment(currentPPT, minPixelWidth, "thou", false);
                }
                return MeasurementUnitProcessor.determineFormattedSegment(currentPPI, minPixelWidth, "inch", true);
            }
            const currentPPF = currentPPI * 12; // pixels per foot
            if (maxPxLength < currentPPF * 2000) { // check if less than 2000 feet (approx 0.37 miles)
                return MeasurementUnitProcessor.determineFormattedSegment(currentPPF, minPixelWidth, "foot", true);
            }
            const currentPPMi = currentPPF * 5280; // pixels per mile
            return MeasurementUnitProcessor.determineFormattedSegment(currentPPMi, minPixelWidth, "mile", true);
        }

        static standardTimeFormatter(currentPPS, minPixelWidth) {
            const maxPxLength = minPixelWidth * 2;
            if (maxPxLength < currentPPS * 60) { // less than a minute
                return MeasurementUnitProcessor.determineFormattedMetricSegment(currentPPS, minPixelWidth, "s");
            }
            const currentPPMin = currentPPS * 60; // pixels per minute
            if (maxPxLength < currentPPMin * 60) { // less than an hour
                return MeasurementUnitProcessor.determineFormattedSegment(currentPPMin, minPixelWidth, "minute", true);
            }
            const currentPPH = currentPPMin * 60; // pixels per hour
            if (maxPxLength < currentPPH * 24) { // less than a day
                return MeasurementUnitProcessor.determineFormattedSegment(currentPPH, minPixelWidth, "hour", true);
            }
            const currentPPD = currentPPH * 24; // pixels per day
            if (maxPxLength < currentPPD * 365.25) { // less than a year
                return MeasurementUnitProcessor.determineFormattedSegment(currentPPD, minPixelWidth, "day", true);
            }
            const currentPPY = currentPPD * 365.25; // pixels per year
            return MeasurementUnitProcessor.determineFormattedSegment(currentPPY, minPixelWidth, "year", true);
        }

        static genericMetricFormatter(scaleVal, minPxWidth, unitSuffix) {
            return MeasurementUnitProcessor.determineFormattedMetricSegment(scaleVal, minPxWidth, unitSuffix);
        }
    }

    const MeasurementKind = {
        NO_DISPLAY: 0,
        MICROSCOPE_VIEW: 1,
        GEOGRAPHIC_VIEW: 2
    };

    const DisplayPosition = {
        NO_LOCATION: 0,
        TOP_LEFT_CORNER: 1,
        TOP_RIGHT_CORNER: 2,
        BOTTOM_RIGHT_CORNER: 3,
        BOTTOM_LEFT_CORNER: 4
    };

    function isNotNullish(val) {
        return val !== undefined && val !== null;
    }

    class RulerDisplay {
        constructor(configuration) {
            configuration = configuration || {};
            if (!configuration.canvasHost) {
                throw new Error("A CanvasView host must be provided.");
            }
            this.canvasHost = configuration.canvasHost;

            this.domElement = document.createElement("div");
            this.canvasHost.container.appendChild(this.domElement);
            this.domElement.style.position = "relative";
            this.domElement.style.margin = "0";
            this.domElement.style.pointerEvents = "none";

            this.setMinimumPixelWidth(configuration.minimumWidth || "150px");

            this.setVisualizerStrategy(configuration.kind || MeasurementKind.MICROSCOPE_VIEW);
            this.lineColor = configuration.lineColor || "black";
            this.textColor = configuration.textColor || "black";
            this.backgroundColor = configuration.backgroundColor || "none";
            this.fontSizeSetting = configuration.fontSize || "";
            this.lineThickness = configuration.lineThickness || 2;
            this.worldUnitRatio = configuration.worldUnitRatio || null;
            this.displayPosition = configuration.displayPosition || DisplayPosition.BOTTOM_LEFT_CORNER;
            this.offsetX = configuration.offsetX || 5;
            this.offsetY = configuration.offsetY || 5;
            this.constrainToImageBounds = isNotNullish(configuration.constrainToImageBounds) ?
                configuration.constrainToImageBounds : true;
            this.unitFormatter = configuration.unitFormatter ||
                MeasurementUnitProcessor.metricLengthFormatter;

            this.canvasHost.addHandler("open", () => this.refreshDisplay());
            this.canvasHost.addHandler("animation", () => this.refreshDisplay());
            this.canvasHost.addHandler("resize", () => this.refreshDisplay());
        }

        updateConfiguration(newSettings) {
            if (!newSettings) {
                return;
            }
            if (isNotNullish(newSettings.kind)) {
                this.setVisualizerStrategy(newSettings.kind);
            }
            if (isNotNullish(newSettings.minimumWidth)) {
                this.setMinimumPixelWidth(newSettings.minimumWidth);
            }
            if (isNotNullish(newSettings.lineColor)) {
                this.lineColor = newSettings.lineColor;
            }
            if (isNotNullish(newSettings.textColor)) {
                this.textColor = newSettings.textColor;
            }
            if (isNotNullish(newSettings.backgroundColor)) {
                this.backgroundColor = newSettings.backgroundColor;
            }
            if (isNotNullish(newSettings.fontSize)) {
                this.fontSizeSetting = newSettings.fontSize;
            }
            if (isNotNullish(newSettings.lineThickness)) {
                this.lineThickness = newSettings.lineThickness;
            }
            if (isNotNullish(newSettings.worldUnitRatio)) {
                this.worldUnitRatio = newSettings.worldUnitRatio;
            }
            if (isNotNullish(newSettings.displayPosition)) {
                this.displayPosition = newSettings.displayPosition;
            }
            if (isNotNullish(newSettings.offsetX)) {
                this.offsetX = newSettings.offsetX;
            }
            if (isNotNullish(newSettings.offsetY)) {
                this.offsetY = newSettings.offsetY;
            }
            if (isNotNullish(newSettings.constrainToImageBounds)) {
                this.constrainToImageBounds = newSettings.constrainToImageBounds;
            }
            if (isNotNullish(newSettings.unitFormatter)) {
                this.unitFormatter = newSettings.unitFormatter;
            }
        }

        setVisualizerStrategy(kind) {
            switch (kind) {
                case MeasurementKind.NO_DISPLAY:
                    this.renderIndicator = null;
                    break;
                case MeasurementKind.GEOGRAPHIC_VIEW:
                    this.renderIndicator = this.renderGeographicRuler;
                    break;
                case MeasurementKind.MICROSCOPE_VIEW:
                default:
                    this.renderIndicator = this.renderMicroscopicRuler;
                    break;
            }
        }

        setMinimumPixelWidth(cssWidth) {
            this.domElement.style.width = cssWidth;
            this.domElement.style.display = ""; // Ensure visible for offsetWidth calc
            this.minimumWidthInPixels = this.domElement.offsetWidth;
        }

        refreshDisplay(newSettings) {
            this.updateConfiguration(newSettings);

            if (!this.canvasHost.isOpen() ||
                !this.renderIndicator ||
                !this.worldUnitRatio ||
                !this.displayPosition) {
                this.domElement.style.display = "none";
                return;
            }
            this.domElement.style.display = "";

            const viewportState = this.canvasHost.viewport;
            const currentZoomLevel = viewportState.viewportToImageZoom(viewportState.getZoom(true));
            const currentPPM = currentZoomLevel * this.worldUnitRatio;
            const measurementProps = this.unitFormatter(currentPPM, this.minimumWidthInPixels);

            this.renderIndicator(measurementProps.pixelSize, measurementProps.textContent);
            const placement = this.calculateOverlayCoordinates();
            this.domElement.style.left = placement.x + "px";
            this.domElement.style.top = placement.y + "px";
        }

        renderMicroscopicRuler(pixelSize, textContent) {
            this.domElement.style.fontSize = this.fontSizeSetting;
            this.domElement.style.textAlign = "center";
            this.domElement.style.color = this.textColor;
            this.domElement.style.border = "none";
            this.domElement.style.borderBottom = this.lineThickness + "px solid " + this.lineColor;
            this.domElement.style.backgroundColor = this.backgroundColor;
            this.domElement.innerHTML = textContent;
            this.domElement.style.width = pixelSize + "px";
        }

        renderGeographicRuler(pixelSize, textContent) {
            this.domElement.style.fontSize = this.fontSizeSetting;
            this.domElement.style.textAlign = "center";
            this.domElement.style.color = this.textColor;
            this.domElement.style.border = this.lineThickness + "px solid " + this.lineColor;
            this.domElement.style.borderTop = "none";
            this.domElement.style.backgroundColor = this.backgroundColor;
            this.domElement.innerHTML = textContent;
            this.domElement.style.width = pixelSize + "px";
        }

        calculateOverlayCoordinates() {
            const containerElement = this.canvasHost.container;
            const overlayWidth = this.domElement.offsetWidth;
            const overlayHeight = this.domElement.offsetHeight;
            let currentX = 0;
            let currentY = 0;

            switch (this.displayPosition) {
                case DisplayPosition.TOP_LEFT_CORNER:
                    if (this.constrainToImageBounds) {
                        const imgPixel = this.canvasHost.viewport.pixelFromPoint(
                            new DisplayCanvas.Point(0, 0), true);
                        if (!this.canvasHost.wrapHorizontal) {
                            currentX = Math.max(imgPixel.x, 0);
                        }
                        if (!this.canvasHost.wrapVertical) {
                            currentY = Math.max(imgPixel.y, 0);
                        }
                    }
                    return new CoordPair(currentX + this.offsetX, currentY + this.offsetY);

                case DisplayPosition.TOP_RIGHT_CORNER:
                    currentX = containerElement.offsetWidth - overlayWidth;
                    if (this.constrainToImageBounds) {
                        const imgPixel = this.canvasHost.viewport.pixelFromPoint(
                            new DisplayCanvas.Point(1, 0), true);
                        if (!this.canvasHost.wrapHorizontal) {
                            currentX = Math.min(currentX, imgPixel.x - overlayWidth);
                        }
                        if (!this.canvasHost.wrapVertical) {
                            currentY = Math.max(currentY, imgPixel.y);
                        }
                    }
                    return new CoordPair(currentX - this.offsetX, currentY + this.offsetY);

                case DisplayPosition.BOTTOM_RIGHT_CORNER:
                    currentX = containerElement.offsetWidth - overlayWidth;
                    currentY = containerElement.offsetHeight - overlayHeight;
                    if (this.constrainToImageBounds) {
                        const imgPixel = this.canvasHost.viewport.pixelFromPoint(
                            new DisplayCanvas.Point(1, 1 / this.canvasHost.source.aspectRatio),
                            true);
                        if (!this.canvasHost.wrapHorizontal) {
                            currentX = Math.min(currentX, imgPixel.x - overlayWidth);
                        }
                        if (!this.canvasHost.wrapVertical) {
                            currentY = Math.min(currentY, imgPixel.y - overlayHeight);
                        }
                    }
                    return new CoordPair(currentX - this.offsetX, currentY - this.offsetY);

                case DisplayPosition.BOTTOM_LEFT_CORNER:
                default:
                    currentY = containerElement.offsetHeight - overlayHeight;
                    if (this.constrainToImageBounds) {
                        const imgPixel = this.canvasHost.viewport.pixelFromPoint(
                            new DisplayCanvas.Point(0, 1 / this.canvasHost.source.aspectRatio),
                            true);
                        if (!this.canvasHost.wrapHorizontal) {
                            currentX = Math.max(currentX, imgPixel.x);
                        }
                        if (!this.canvasHost.wrapVertical) {
                            currentY = Math.min(currentY, imgPixel.y - overlayHeight);
                        }
                    }
                    return new CoordPair(currentX + this.offsetX, currentY - this.offsetY);
            }
        }
    }

    DisplayCanvas.Viewer.prototype.activateMeasurementOverlay = function(options) {
        if (!this.activeMeasurementOverlay) {
            options = options || {};
            options.canvasHost = this;
            this.activeMeasurementOverlay = new RulerDisplay(options);
        } else {
            this.activeMeasurementOverlay.refreshDisplay(options);
        }
    };

    DisplayCanvas.MeasurementKind = MeasurementKind;
    DisplayCanvas.DisplayPosition = DisplayPosition;
    DisplayCanvas.MeasurementUnitProcessor = MeasurementUnitProcessor;

}(OpenSeadragon));