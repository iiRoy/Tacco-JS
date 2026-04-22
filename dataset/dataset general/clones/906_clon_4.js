const FULL_CIRCLE_RADIANS = 2 * Math.PI;

class ChimericalAura {
    constructor(hostingElementNode, effectOptions) {
        this.hostingElementRef = hostingElementNode;
        this.animationFrameHandle = null;
        this.currentConfigurations = {};
        this.auraEntities = [];
        this.frameProgressionCounter = 0;

        const standardConfigurations = {
            startTint: '#000000',
            endTint: '#222222',
            vaporTransparency: 0.1,
            entityCount: 1,
            maxEntityRadiusLimit: 'auto',
            minEntityRadiusLimit: 'auto',
            minRadiusRatioFactor: 0,
            subdivisionIterations: 8,
            updatesPerFrame: 10,
            outlineThickness: 2,
            animationPace: 1,
            innerGroundColor: "#ffffff",
            outerGroundColor: "#666666",
        };

        this.initialConfigurations = standardConfigurations;
        Object.assign(this.currentConfigurations, standardConfigurations, effectOptions);

        this.initializeEffect();
    }

    initializeEffect() {
        this.configureVisuals();
        this.prepareCanvasArea();
        this.beginAnimation();
    }

    configureVisuals() {
        const potentialRadius = this.hostingElementRef.clientHeight * 0.8 / 2;
        if (this.currentConfigurations.maxEntityRadiusLimit === 'auto') {
            this.currentConfigurations.maxEntityRadiusLimit = potentialRadius;
        }
        if (this.currentConfigurations.minEntityRadiusLimit === 'auto') {
            this.currentConfigurations.minEntityRadiusLimit = potentialRadius;
        }
    }

    prepareCanvasArea() {
        let existingCanvas = this.hostingElementRef.querySelector('canvas');
        if (!existingCanvas) {
            existingCanvas = document.createElement('canvas');
            this.hostingElementRef.appendChild(existingCanvas);
        }
        this.visualCanvas = existingCanvas;
        this.visualWidth = this.hostingElementRef.clientWidth;
        this.visualHeight = this.hostingElementRef.clientHeight;
        this.visualCanvas.width = this.visualWidth;
        this.visualCanvas.height = this.visualHeight;
        this.renderContext = this.visualCanvas.getContext("2d");

        this.exportCanvasElement = document.createElement('canvas');
        this.exportCanvasElement.width = this.visualWidth;
        this.exportCanvasElement.height = this.visualHeight;
        this.exportContext = this.exportCanvasElement.getContext("2d");
    }

    beginAnimation() {
        this.frameProgressionCounter = 0;
        this.renderContext.setTransform(1, 0, 0, 1, 0, 0);
        this.renderContext.clearRect(0, 0, this.visualWidth, this.visualHeight);
        this.paintBackgroundLayer();
        this.establishEntities();

        if (this.animationFrameHandle) {
            cancelAnimationFrame(this.animationFrameHandle);
        }
        const animate = () => {
            this.updateAndRenderFrame();
            if (this.animationFrameHandle !== null) { // Only request if not stopped
                this.animationFrameHandle = requestAnimationFrame(animate);
            }
        };
        this.animationFrameHandle = requestAnimationFrame(animate);
    }

    paintBackgroundLayer() {
        const bgWidth = this.visualWidth;
        const bgHeight = this.visualHeight;

        const innerColorHex = this.currentConfigurations.innerGroundColor;
        const outerColorHex = this.currentConfigurations.outerGroundColor;

        const parsedInner = this.parseHexColor(innerColorHex);
        const parsedOuter = this.parseHexColor(outerColorHex);

        const gradientGeometry = {
            x0: bgWidth * 0.75,
            y0: bgHeight / 2 * 0.75,
            r0: 0,
            x1: bgWidth / 2,
            y1: bgHeight / 4,
            r1: Math.sqrt(bgWidth * bgWidth + bgHeight * bgHeight) / 2
        };

        const colorStopsArray = [];
        colorStopsArray.push({ ratio: 0, r: parsedInner.r, g: parsedInner.g, b: parsedInner.b });
        colorStopsArray.push({ ratio: 1, r: parsedOuter.r, g: parsedOuter.g, b: parsedOuter.b });

        if (colorStopsArray[0].ratio !== 0) {
            colorStopsArray.unshift({ ratio: 0, r: colorStopsArray[0].r, g: colorStopsArray[0].g, b: colorStopsArray[0].b });
        }
        if (colorStopsArray[colorStopsArray.length - 1].ratio !== 1) {
            colorStopsArray.push({ ratio: 1, r: colorStopsArray[colorStopsArray.length - 1].r, g: colorStopsArray[colorStopsArray.length - 1].g, b: colorStopsArray[colorStopsArray.length - 1].b });
        }

        const imageData = this.renderContext.createImageData(bgWidth, bgHeight);
        const pixelData = imageData.data;
        const totalPixels = bgWidth * bgHeight;

        const xDifference = gradientGeometry.x1 - gradientGeometry.x0;
        const yDifference = gradientGeometry.y1 - gradientGeometry.y0;
        const rDifference = gradientGeometry.r1 - gradientGeometry.r0;

        const A_term = rDifference * rDifference - xDifference * xDifference - yDifference * yDifference;
        const R0_squared = gradientGeometry.r0 * gradientGeometry.r0;
        const R_constant1 = 2 * gradientGeometry.r0 * rDifference;

        const rFloatBuffer = new Float32Array(totalPixels);
        const gFloatBuffer = new Float32Array(totalPixels);
        const bFloatBuffer = new Float32Array(totalPixels);

        for (let i = 0; i < totalPixels; i++) {
            const currentX = i % bgWidth;
            const currentY = Math.floor(i / bgWidth);

            const dx = currentX - gradientGeometry.x0;
            const dy = currentY - gradientGeometry.y0;

            const B_term = R_constant1 + 2 * (dx * xDifference + dy * yDifference);
            const C_term = R0_squared - dx * dx - dy * dy;
            const discriminant = B_term * B_term - 4 * A_term * C_term;

            let interpolatedRatio;
            if (discriminant >= 0) {
                interpolatedRatio = (-B_term + Math.sqrt(discriminant)) / (2 * A_term);
                interpolatedRatio = Math.max(0, Math.min(1, interpolatedRatio));
            } else {
                interpolatedRatio = 0;
            }

            let stopIdx = 0;
            if (interpolatedRatio === 1) {
                stopIdx = colorStopsArray.length - 1;
            } else {
                while (interpolatedRatio >= colorStopsArray[stopIdx].ratio && stopIdx < colorStopsArray.length - 1) {
                    stopIdx++;
                }
            }

            const previousStop = colorStopsArray[stopIdx - 1];
            const nextStop = colorStopsArray[stopIdx];

            const interpolationFactor = (interpolatedRatio - previousStop.ratio) / (nextStop.ratio - previousStop.ratio);

            rFloatBuffer[i] = previousStop.r + (nextStop.r - previousStop.r) * interpolationFactor;
            gFloatBuffer[i] = previousStop.g + (nextStop.g - previousStop.g) * interpolationFactor;
            bFloatBuffer[i] = previousStop.b + (nextStop.b - previousStop.b) * interpolationFactor;
        }

        for (let i = 0; i < totalPixels; i++) {
            const currentX = i % bgWidth;
            const currentY = Math.floor(i / bgWidth);

            let rVal = rFloatBuffer[i];
            let gVal = gFloatBuffer[i];
            let bVal = bFloatBuffer[i];

            let roundedR = Math.round(rVal);
            let errorR = rVal - roundedR;
            if (currentX + 1 < bgWidth) rFloatBuffer[i + 1] += errorR * 7 / 16;
            if (currentY + 1 < bgHeight) {
                if (currentX > 0) rFloatBuffer[i - 1 + bgWidth] += errorR * 3 / 16;
                rFloatBuffer[i + bgWidth] += errorR * 5 / 16;
                if (currentX + 1 < bgWidth) rFloatBuffer[i + 1 + bgWidth] += errorR * 1 / 16;
            }

            let roundedG = Math.round(gVal);
            let errorG = gVal - roundedG;
            if (currentX + 1 < bgWidth) gFloatBuffer[i + 1] += errorG * 7 / 16;
            if (currentY + 1 < bgHeight) {
                if (currentX > 0) gFloatBuffer[i - 1 + bgWidth] += errorG * 3 / 16;
                gFloatBuffer[i + bgWidth] += errorG * 5 / 16;
                if (currentX + 1 < bgWidth) gFloatBuffer[i + 1 + bgWidth] += errorG * 1 / 16;
            }

            let roundedB = Math.round(bVal);
            let errorB = bVal - roundedB;
            if (currentX + 1 < bgWidth) bFloatBuffer[i + 1] += errorB * 7 / 16;
            if (currentY + 1 < bgHeight) {
                if (currentX > 0) bFloatBuffer[i - 1 + bgWidth] += errorB * 3 / 16;
                bFloatBuffer[i + bgWidth] += errorB * 5 / 16;
                if (currentX + 1 < bgWidth) bFloatBuffer[i + 1 + bgWidth] += errorB * 1 / 16;
            }

            pixelData[i * 4 + 0] = Math.max(0, Math.min(255, Math.round(rFloatBuffer[i])));
            pixelData[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(gFloatBuffer[i])));
            pixelData[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(bFloatBuffer[i])));
            pixelData[i * 4 + 3] = 255;
        }

        this.renderContext.putImageData(imageData, 0, 0);
    }

    establishEntities() {
        this.auraEntities = [];
        const config = this.currentConfigurations;

        for (let i = 0; i < config.entityCount; i++) {
            const currentMajorRadius = config.minEntityRadiusLimit + Math.random() * (config.maxEntityRadiusLimit - config.minEntityRadiusLimit);
            const currentMinorRadius = config.minRadiusRatioFactor * currentMajorRadius;

            const entityRadialGradient = this.renderContext.createRadialGradient(0, 0, currentMinorRadius, 0, 0, currentMajorRadius);
            const gradientStartColor = this.convertHexToRgbaString(config.startTint, config.vaporTransparency);
            const gradientEndColor = this.convertHexToRgbaString(config.endTint, config.vaporTransparency);

            entityRadialGradient.addColorStop(1, gradientStartColor);
            entityRadialGradient.addColorStop(0, gradientEndColor);

            const newEntity = {
                coreX: -currentMajorRadius,
                coreY: this.visualHeight / 2 - 50,
                majorRadius: currentMajorRadius,
                minorRadius: currentMinorRadius,
                contourColor: entityRadialGradient,
                evolutionParameter: 0,
                evolutionRate: 1 / 250,
                oscillationPhase: Math.random() * FULL_CIRCLE_RADIANS,
                globalOscillationPhase: Math.random() * FULL_CIRCLE_RADIANS,
                pathPointsA: this.generateFractalPathPoints(config.subdivisionIterations),
                pathPointsB: this.generateFractalPathPoints(config.subdivisionIterations)
            };
            this.auraEntities.push(newEntity);
        }
    }

    updateAndRenderFrame() {
        const xCompressionFactor = 0.75;

        for (let k = 0; k < this.currentConfigurations.updatesPerFrame; k++) {
            this.frameProgressionCounter++;

            for (let i = 0; i < this.currentConfigurations.entityCount; i++) {
                const entity = this.auraEntities[i];
                entity.evolutionParameter += entity.evolutionRate;
                if (entity.evolutionParameter >= 1) {
                    entity.evolutionParameter = 0;
                    entity.pathPointsA = entity.pathPointsB;
                    entity.pathPointsB = this.generateFractalPathPoints(this.currentConfigurations.subdivisionIterations);
                }
                const cosEvolution = 0.5 - 0.5 * Math.cos(Math.PI * entity.evolutionParameter);

                this.renderContext.strokeStyle = entity.contourColor;
                this.renderContext.lineWidth = this.currentConfigurations.outlineThickness;
                this.renderContext.beginPath();

                let currentPointA = entity.pathPointsA[0];
                let currentPointB = entity.pathPointsB[0];

                entity.oscillationPhase += 0.0002;

                let currentTheta = entity.oscillationPhase;
                let currentRadius = entity.minorRadius + (currentPointA.y + cosEvolution * (currentPointB.y - currentPointA.y)) * (entity.majorRadius - entity.minorRadius);

                entity.coreX += 0.5;
                entity.coreY += 0.04;
                let yOffset = 40 * Math.sin(entity.globalOscillationPhase + this.frameProgressionCounter / 1000 * FULL_CIRCLE_RADIANS);

                if (entity.coreX > this.visualWidth + entity.majorRadius && this.animationFrameHandle) {
                    cancelAnimationFrame(this.animationFrameHandle);
                    this.animationFrameHandle = null;
                    return;
                }

                this.renderContext.setTransform(xCompressionFactor, 0, 0, 1, entity.coreX, entity.coreY + yOffset);

                let firstX = xCompressionFactor * currentRadius * Math.cos(currentTheta);
                let firstY = currentRadius * Math.sin(currentTheta);
                this.renderContext.moveTo(firstX, firstY);

                for (let j = 1; j < entity.pathPointsA.length; j++) {
                    currentPointA = entity.pathPointsA[j];
                    currentPointB = entity.pathPointsB[j];
                    currentTheta = FULL_CIRCLE_RADIANS * (currentPointA.x + cosEvolution * (currentPointB.x - currentPointA.x)) + entity.oscillationPhase;
                    currentRadius = entity.minorRadius + (currentPointA.y + cosEvolution * (currentPointB.y - currentPointA.y)) * (entity.majorRadius - entity.minorRadius);
                    const nextX = xCompressionFactor * currentRadius * Math.cos(currentTheta);
                    const nextY = currentRadius * Math.sin(currentTheta);
                    this.renderContext.lineTo(nextX, nextY);
                }
                this.renderContext.closePath();
                this.renderContext.stroke();
            }
        }
    }

    generateFractalPathPoints(subdivisionCount) {
        let pathSegmentPoints = [{ x: 0, y: 1 }];
        pathSegmentPoints.push({ x: 1, y: 1 });

        let minYValue = 1;
        let maxYValue = 1;

        for (let i = 0; i < subdivisionCount; i++) {
            const refinedPoints = [];
            for (let j = 0; j < pathSegmentPoints.length - 1; j++) {
                const pointOne = pathSegmentPoints[j];
                const pointTwo = pathSegmentPoints[j + 1];

                refinedPoints.push(pointOne);

                const deltaX = pointTwo.x - pointOne.x;
                const newXPosition = 0.5 * (pointOne.x + pointTwo.x);
                let newYPosition = 0.5 * (pointOne.y + pointTwo.y);
                newYPosition += deltaX * (Math.random() * 2 - 1);

                refinedPoints.push({ x: newXPosition, y: newYPosition });

                minYValue = Math.min(minYValue, newYPosition);
                maxYValue = Math.max(maxYValue, newYPosition);
            }
            refinedPoints.push(pathSegmentPoints[pathSegmentPoints.length - 1]);
            pathSegmentPoints = refinedPoints;
        }

        if (maxYValue !== minYValue) {
            const normalizationFactor = 1 / (maxYValue - minYValue);
            for (const pt of pathSegmentPoints) {
                pt.y = normalizationFactor * (pt.y - minYValue);
            }
        } else {
            for (const pt of pathSegmentPoints) {
                pt.y = 1;
            }
        }

        return pathSegmentPoints;
    }

    adjustSetting(configurationKey, configurationValue) {
        this.currentConfigurations[configurationKey] = configurationValue;
    }

    parseHexColor(hexCode) {
        const cleanedHex = hexCode.replace('#', '');
        return {
            r: parseInt(cleanedHex.substring(0, 2), 16),
            g: parseInt(cleanedHex.substring(2, 4), 16),
            b: parseInt(cleanedHex.substring(4, 6), 16)
        };
    }

    convertHexToRgbaString(hexCode, transparency) {
        const { r, g, b } = this.parseHexColor(hexCode);
        return `rgba(${r},${g},${b},${transparency})`;
    }

    captureSnapshot(outputWidth, outputHeight) {
        this.exportContext.drawImage(this.visualCanvas, 0, 0, outputWidth, outputHeight, 0, 0, outputWidth, outputHeight);
        const imageDataURL = this.exportCanvasElement.toDataURL("image/png");

        const imageDisplayWindow = window.open("", "generatedImage", `left=0,top=0,width=${outputWidth},height=${outputHeight},toolbar=0,resizable=0`);
        imageDisplayWindow.document.write("<title>Exported Visual</title>");
        imageDisplayWindow.document.write(`<img id='exportedVisualImage' alt='' height='${outputHeight}' width='${outputWidth}' style='position:absolute;left:0;top:0'/>`);
        imageDisplayWindow.document.close();
        const exportedImg = imageDisplayWindow.document.getElementById("exportedVisualImage");
        exportedImg.src = imageDataURL;
    }

    stopAnimation() {
        if (this.animationFrameHandle) {
            cancelAnimationFrame(this.animationFrameHandle);
            this.animationFrameHandle = null;
        }
    }
}