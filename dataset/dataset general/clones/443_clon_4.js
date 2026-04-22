var SurfaceManagement = (function(SurfaceManagement) {

    const validateImageSource = (candidateGraphic) => {
        if (!(candidateGraphic instanceof HTMLImageElement)) {
            throw new Error('Provided graphic: Not an instance of HTMLImageElement.');
        }
    };

    const validateCanvasSurface = (candidateSurface) => {
        if (!(candidateSurface instanceof HTMLCanvasElement)) {
            throw new Error('Provided surface: Not an instance of HTMLCanvasElement.');
        }
    };

    const verifyDimensions = (graphic, requiredWidth, requiredHeight) => {
        if (graphic.width !== requiredWidth || graphic.height !== requiredHeight) {
            throw new Error(`Graphic dimensions: Must be ${requiredWidth}x${requiredHeight}.`);
        }
    };

    const acquirePixelBuffer = (graphicElement) => {
        const temporaryCanvas = document.createElement('canvas');
        temporaryCanvas.width = graphicElement.width;
        temporaryCanvas.height = graphicElement.height;
        const temporaryContext = temporaryCanvas.getContext('2d');
        temporaryContext.drawImage(graphicElement, 0, 0);
        return temporaryContext.getImageData(0, 0, temporaryCanvas.width, temporaryCanvas.height);
    };

    SurfaceManagement.TerrainAssembler = class {
        #terrainElevations;
        #boundaryElevations;
        #patternRepository;

        constructor() {
            const totalMapCells = 1024 * 1024;
            this.#terrainElevations = new Uint8Array(totalMapCells);
            this.#boundaryElevations = new Uint8Array(totalMapCells);
            this.#patternRepository = new Map();
        }

        registerSurfacePattern(elevationRank, graphicSource) {
            validateImageSource(graphicSource);

            if (elevationRank < 0 || elevationRank > 255) {
                throw new Error('Elevation rank: Must be within 0..255.');
            }

            verifyDimensions(graphicSource, 256, 256);

            const { data: pixelData, width: dataWidth, height: dataHeight } = acquirePixelBuffer(graphicSource);

            this.#patternRepository.set(elevationRank, {
                pixels: pixelData,
                dimension: dataWidth
            });

            return this;
        }

        renderCombinedView(outputSurface) {
            validateCanvasSurface(outputSurface);

            const outputContext = outputSurface.getContext('2d');
            const compositeImageData = outputContext.createImageData(1024, 1024);
            const compositePixelData = compositeImageData.data;

            const finalPatternTable = new Array(256);

            const propagateMissingPatterns = (currentLevel) => {
                if (currentLevel < 0) {
                    return;
                }
                if (this.#patternRepository.has(currentLevel)) {
                    finalPatternTable[currentLevel] = this.#patternRepository.get(currentLevel);
                } else if (currentLevel < 255) {
                    finalPatternTable[currentLevel] = finalPatternTable[currentLevel + 1];
                }
                propagateMissingPatterns(currentLevel - 1);
            };

            propagateMissingPatterns(255);

            if (!finalPatternTable[255]) {
                throw new Error('No surface pattern registered for rank 255; unable to compose.');
            }

            const processOutputCell = (globalCellIndex) => {
                if (globalCellIndex >= 1024 * 1024) {
                    return;
                }

                const yCoordinate = Math.floor(globalCellIndex / 1024);
                const xCoordinate = globalCellIndex % 1024;

                const currentElevation = this.#terrainElevations[globalCellIndex];
                const chosenPattern = finalPatternTable[currentElevation];

                const textureY = yCoordinate % 256;
                const textureX = xCoordinate % 256;

                const patternDataOffset = (textureY * chosenPattern.dimension * 4) + (textureX * 4);

                const outputDataOffset = globalCellIndex * 4;
                compositePixelData[outputDataOffset] = chosenPattern.pixels[patternDataOffset];
                compositePixelData[outputDataOffset + 1] = chosenPattern.pixels[patternDataOffset + 1];
                compositePixelData[outputDataOffset + 2] = chosenPattern.pixels[patternDataOffset + 2];
                compositePixelData[outputDataOffset + 3] = 255;

                processOutputCell(globalCellIndex + 1);
            };

            processOutputCell(0);

            outputContext.putImageData(compositeImageData, 0, 0);

            return this;
        }

        retrieveElevationData() {
            return this.#terrainElevations;
        }

        retrieveBoundaryElevationData() {
            return this.#boundaryElevations;
        }

        applyOverlayMask(maskGraphic, xPosition, yPosition, intensityMultiplier) {
            validateImageSource(maskGraphic);

            const { data: maskPixelData, width: maskWidth, height: maskHeight } = acquirePixelBuffer(maskGraphic);

            const iterateMaskPixels = (currentMaskIndex) => {
                if (currentMaskIndex >= maskWidth * maskHeight) {
                    return;
                }

                const maskY = Math.floor(currentMaskIndex / maskWidth);
                const maskX = currentMaskIndex % maskWidth;

                const maskAlphaValue = maskPixelData[currentMaskIndex * 4 + 3];

                if (maskAlphaValue) {
                    const targetGlobalY = maskY + yPosition;
                    const targetGlobalX = maskX + xPosition;

                    if (targetGlobalX >= 0 && targetGlobalX < 1024 &&
                        targetGlobalY >= 0 && targetGlobalY < 1024) {

                        const targetGlobalIndex = (targetGlobalY * 1024) + targetGlobalX;
                        const maskRedValue = maskPixelData[currentMaskIndex * 4];

                        this.#terrainElevations[targetGlobalIndex] = 192 + maskRedValue * intensityMultiplier;
                    }
                }
                iterateMaskPixels(currentMaskIndex + 1);
            };

            iterateMaskPixels(0);

            return this;
        }

        establishElevationBase(sourceSurface) {
            validateCanvasSurface(sourceSurface);
            verifyDimensions(sourceSurface, 1024, 1024);

            const sourceContext = sourceSurface.getContext('2d');
            const { data: sourcePixelData } = sourceContext.getImageData(0, 0, 1024, 1024);

            const populateElevationArrays = (currentGlobalIndex) => {
                if (currentGlobalIndex >= 1024 * 1024) {
                    return;
                }

                this.#terrainElevations[currentGlobalIndex] = sourcePixelData[currentGlobalIndex * 4];
                this.#boundaryElevations[currentGlobalIndex] = sourcePixelData[currentGlobalIndex * 4];

                populateElevationArrays(currentGlobalIndex + 1);
            };

            populateElevationArrays(0);

            return this;
        }
    };

    return SurfaceManagement;
}(SurfaceManagement || {}));