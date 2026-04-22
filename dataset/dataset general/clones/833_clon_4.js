(function(globalScope, undefinedSymbol) {
    class VisualComposerInternals {
        #elementRegistry = new Map();
        #sceneRecords = new Map();
        #activeInstructionBuffer = [];
        #defaultColorPalette = ['#AC4A08', '#6C88A1', '#D9DCC6', '#EB9E1A', '#FBCC37'];
        #loadedImages = new Map();
        #randomizer = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        constructor() {
            if (typeof document !== 'undefined' && !document.createElement('canvas').getContext) {
                console.warn("Canvas 2D context not supported. VisualComposerInternals functionality will be limited.");
            }
        }

        #resolveDimension(value, maxDimension) {
            if (typeof value === 'string') {
                if (value.endsWith('%')) {
                    return (parseFloat(value) / 100) * maxDimension;
                }
                if (value === 'random') {
                    return this.#randomizer(0, maxDimension);
                }
                return parseFloat(value);
            }
            return value;
        }

        #processColorInput(colorInput) {
            if (colorInput === 'random') {
                return this.#defaultColorPalette[this.#randomizer(0, this.#defaultColorPalette.length - 1)];
            }
            if (Array.isArray(colorInput)) {
                return colorInput[this.#randomizer(0, colorInput.length - 1)];
            }
            return colorInput || '';
        }

        #getOpacityValue(opacityInput) {
            if (opacityInput === 'random') {
                return this.#randomizer(0, 100) / 100;
            }
            const parsed = parseFloat(opacityInput);
            if (isNaN(parsed) || parsed < 0 || parsed > 1) {
                return 1;
            }
            return parsed;
        }

        #parseIntValue(value, defaultValue = 0) {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? defaultValue : parsed;
        }

        configurePalette(newColors) {
            if (Array.isArray(newColors) && newColors.every(c => typeof c === 'string')) {
                this.#defaultColorPalette = newColors;
            } else {
                console.warn("Invalid palette provided. Must be an array of strings.");
            }
        }

        registerSurface(surfaceIdentifier) {
            if (this.#elementRegistry.has(surfaceIdentifier)) {
                return;
            }
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceIdentifier) : null;
            if (!targetElement || !(targetElement instanceof HTMLCanvasElement)) {
                console.error(`Element with ID '${surfaceIdentifier}' not found or is not a canvas.`);
                return;
            }
            const surfaceContext = targetElement.getContext('2d');
            if (surfaceContext) {
                this.#elementRegistry.set(surfaceIdentifier, surfaceContext);
                if (!this.#sceneRecords.has(surfaceIdentifier)) {
                    this.#sceneRecords.set(surfaceIdentifier, { collections: [ [ [[]] ] ] });
                }
            } else {
                console.error(`Could not get 2D context for canvas '${surfaceIdentifier}'.`);
            }
        }

        createSceneCollection(surfaceIdentifier) {
            this.registerSurface(surfaceIdentifier);
            const surfaceData = this.#sceneRecords.get(surfaceIdentifier);
            if (!surfaceData) return -1;

            const newCollection = [ [[]] ];
            surfaceData.collections.push(newCollection);
            return surfaceData.collections.length - 1;
        }

        createSceneLayer(surfaceIdentifier, collectionIndex) {
            this.registerSurface(surfaceIdentifier);
            const surfaceData = this.#sceneRecords.get(surfaceIdentifier);
            if (!surfaceData || !surfaceData.collections[collectionIndex]) {
                console.warn(`Invalid collection index ${collectionIndex} for surface ${surfaceIdentifier}`);
                return -1;
            }
            const newLayer = [[]];
            surfaceData.collections[collectionIndex].push(newLayer);
            return surfaceData.collections[collectionIndex].length - 1;
        }

        createSceneSnapshot(surfaceIdentifier, collectionIndex, layerIndex) {
            this.registerSurface(surfaceIdentifier);
            const surfaceData = this.#sceneRecords.get(surfaceIdentifier);
            if (!surfaceData || !surfaceData.collections[collectionIndex] || !surfaceData.collections[collectionIndex][layerIndex]) {
                console.warn(`Invalid collection or layer index for surface ${surfaceIdentifier}`);
                return -1;
            }
            const newSnapshot = [];
            surfaceData.collections[collectionIndex][layerIndex].push(newSnapshot);
            return surfaceData.collections[collectionIndex][layerIndex].length - 1;
        }

        eraseSceneLayerContent(surfaceIdentifier, collectionIndex, layerIndex) {
            const surfaceData = this.#sceneRecords.get(surfaceIdentifier);
            if (!surfaceData || !surfaceData.collections[collectionIndex] || !surfaceData.collections[collectionIndex][layerIndex]) {
                console.warn(`Invalid collection or layer index for surface ${surfaceIdentifier}`);
                return;
            }
            surfaceData.collections[collectionIndex][layerIndex].forEach((snapshot, index) => {
                surfaceData.collections[collectionIndex][layerIndex][index] = [];
            });
        }

        retrieveActiveInstructions() {
            return [...this.#activeInstructionBuffer];
        }

        exportSurfaceAsPNG(surfaceIdentifier) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceIdentifier) : null;
            if (targetElement instanceof HTMLCanvasElement) {
                return targetElement.toDataURL('image/png');
            }
            console.warn(`Element with ID '${surfaceIdentifier}' is not a canvas.`);
            return '';
        }

        addInstructionToSnapshot(surfaceIdentifier, collectionIndex, layerIndex, snapshotIndex, commandType, commandData) {
            this.registerSurface(surfaceIdentifier);
            const surfaceData = this.#sceneRecords.get(surfaceIdentifier);
            if (!surfaceData || !surfaceData.collections[collectionIndex] ||
                !surfaceData.collections[collectionIndex][layerIndex] ||
                !surfaceData.collections[collectionIndex][layerIndex][snapshotIndex]) {
                console.warn(`Invalid indices for adding instruction to snapshot for surface ${surfaceIdentifier}`);
                return;
            }
            surfaceData.collections[collectionIndex][layerIndex][snapshotIndex].push({
                instruction: commandType,
                parameters: commandData
            });
        }

        extractSurfaceType(elementIdentifier) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(elementIdentifier) : null;
            return targetElement ? targetElement.tagName : '';
        }

        obtainRenderingContext(elementIdentifier) {
            if (this.#elementRegistry.has(elementIdentifier)) {
                return this.#elementRegistry.get(elementIdentifier);
            }
            this.registerSurface(elementIdentifier);
            return this.#elementRegistry.get(elementIdentifier);
        }

        #applyContextSettings(ctx, config) {
            ctx.save();
            ctx.lineWidth = this.#resolveDimension(config.edgeWidth, ctx.canvas.width) || 0;
            ctx.globalAlpha = this.#getOpacityValue(config.transparency);
            ctx.fillStyle = this.#processColorInput(config.fillColor) || 'transparent';
            ctx.strokeStyle = this.#processColorInput(config.edgeColor) || 'transparent';

            if (config.shadowBlur) {
                ctx.shadowOffsetX = this.#parseIntValue(config.shadowOffsetX);
                ctx.shadowOffsetY = this.#parseIntValue(config.shadowOffsetY);
                ctx.shadowBlur = this.#parseIntValue(config.shadowBlur);
                ctx.shadowColor = this.#processColorInput(config.shadowColor) || 'rgba(0,0,0,0)';
            } else {
                ctx.shadowBlur = 0;
            }
        }

        #executeDrawing(surfaceIdentifier, commandType, commandData, drawCall) {
            const surfaceContext = this.obtainRenderingContext(surfaceIdentifier);
            if (!surfaceContext) {
                console.error(`No rendering context found for '${surfaceIdentifier}'.`);
                return;
            }
            this.#activeInstructionBuffer.push({ instruction: commandType, parameters: commandData });
            drawCall(surfaceContext);
        }

        renderDisc(surfaceId, centerX, centerY, radiusSize, fillShade, borderWidth, borderShade, transparency, blurAmount, blurShade, blurOffsetX, blurOffsetY) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceId) : null;
            if (!targetElement) return;
            const targetWidth = targetElement.width;
            const targetHeight = targetElement.height;

            const processed = {
                x: this.#resolveDimension(centerX, targetWidth),
                y: this.#resolveDimension(centerY, targetHeight),
                r: this.#resolveDimension(radiusSize, targetWidth),
                fillColor: fillShade,
                edgeWidth: borderWidth,
                edgeColor: borderShade,
                transparency: transparency,
                shadowBlur: blurAmount === 'random' ? this.#randomizer(0, 30) : this.#parseIntValue(blurAmount),
                shadowColor: blurShade,
                shadowOffsetX: this.#parseIntValue(blurOffsetX),
                shadowOffsetY: this.#parseIntValue(blurOffsetY)
            };

            this.#executeDrawing(surfaceId, 'disc', processed, (ctx) => {
                this.#applyContextSettings(ctx, processed);
                ctx.beginPath();
                ctx.arc(processed.x, processed.y, processed.r, 0, Math.PI * 2, true);
                ctx.closePath();
                if (processed.fillColor) {
                    ctx.fill();
                }
                if (processed.edgeWidth > 0 && processed.edgeColor) {
                    ctx.stroke();
                }
                ctx.restore();
            });
        }

        renderBox(surfaceId, startX, startY, rectWidth, rectHeight, fillShade, borderWidth, borderShade, transparency, blurAmount, blurShade, blurOffsetX, blurOffsetY) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceId) : null;
            if (!targetElement) return;
            const targetWidth = targetElement.width;
            const targetHeight = targetElement.height;

            const processed = {
                x: this.#resolveDimension(startX, targetWidth),
                y: this.#resolveDimension(startY, targetHeight),
                width: this.#resolveDimension(rectWidth, targetWidth),
                height: this.#resolveDimension(rectHeight, targetHeight),
                fillColor: fillShade,
                edgeWidth: borderWidth,
                edgeColor: borderShade,
                transparency: transparency,
                shadowBlur: blurAmount === 'random' ? this.#randomizer(0, 30) : this.#parseIntValue(blurAmount),
                shadowColor: blurShade === 'random' ? this.#defaultColorPalette[this.#randomizer(0, this.#defaultColorPalette.length - 1)] : (Array.isArray(blurShade) ? blurShade[this.#randomizer(0, blurShade.length - 1)] : blurShade),
                shadowOffsetX: this.#parseIntValue(blurOffsetX),
                shadowOffsetY: this.#parseIntValue(blurOffsetY)
            };

            this.#executeDrawing(surfaceId, 'box', processed, (ctx) => {
                this.#applyContextSettings(ctx, processed);
                if (processed.fillColor) {
                    ctx.fillRect(processed.x, processed.y, processed.width, processed.height);
                }
                if (processed.edgeWidth > 0 && processed.edgeColor) {
                    ctx.strokeRect(processed.x, processed.y, processed.width, processed.height);
                }
                ctx.restore();
            });
        }

        renderPicture(surfaceId, sourceURL, posX, posY, imgWidth, imgHeight, transparency, fillShade, borderWidth, borderShade, blurAmount, blurShade, blurOffsetX, blurOffsetY) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceId) : null;
            if (!targetElement || !sourceURL) return;
            const targetWidth = targetElement.width;
            const targetHeight = targetElement.height;

            const processed = {
                src: sourceURL,
                x: this.#resolveDimension(posX, targetWidth),
                y: this.#resolveDimension(posY, targetHeight),
                width: this.#resolveDimension(imgWidth, targetWidth),
                height: this.#resolveDimension(imgHeight, targetHeight),
                transparency: transparency,
                fillColor: fillShade,
                edgeWidth: borderWidth,
                edgeColor: borderShade,
                shadowBlur: blurAmount === 'random' ? this.#randomizer(0, 30) : this.#parseIntValue(blurAmount),
                shadowColor: blurShade === 'random' ? this.#defaultColorPalette[this.#randomizer(0, this.#defaultColorPalette.length - 1)] : (Array.isArray(blurShade) ? blurShade[this.#randomizer(0, blurShade.length - 1)] : blurShade),
                shadowOffsetX: this.#parseIntValue(blurOffsetX),
                shadowOffsetY: this.#parseIntValue(blurOffsetY)
            };

            this.#executeDrawing(surfaceId, 'picture', processed, (ctx) => {
                let img = this.#loadedImages.get(sourceURL);
                if (!img) {
                    img = new Image();
                    img.src = sourceURL;
                    this.#loadedImages.set(sourceURL, img);
                    img.onload = () => {
                        this.#applyContextSettings(ctx, processed);
                        ctx.drawImage(img, processed.x, processed.y, processed.width, processed.height);
                        ctx.restore();
                    };
                    img.onerror = () => {
                        console.error(`Failed to load image: ${sourceURL}`);
                    };
                } else {
                    this.#applyContextSettings(ctx, processed);
                    ctx.drawImage(img, processed.x, processed.y, processed.width, processed.height);
                    ctx.restore();
                }
            });
        }

        renderPath(surfaceId, pathPoints, pathWidth, pathColor, pathFillColor, pathTransparency) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceId) : null;
            if (!targetElement) return;
            const targetWidth = targetElement.width;
            const targetHeight = targetElement.height;

            const processedPath = (pathPoints || [[0, 0]]).map(point => {
                const resolvedX = this.#resolveDimension(point[0], targetWidth);
                const resolvedY = this.#resolveDimension(point[1], targetHeight);
                const type = point[2];
                let cp1x, cp1y, cp2x, cp2y;

                if (type === 'bezier') {
                    cp1x = this.#resolveDimension(point[3], targetWidth);
                    cp1y = this.#resolveDimension(point[4], targetHeight);
                    cp2x = this.#resolveDimension(point[5], targetWidth);
                    cp2y = this.#resolveDimension(point[6], targetHeight);
                }
                return { x: resolvedX, y: resolvedY, type, cp1x, cp1y, cp2x, cp2y };
            });

            const processed = {
                path: processedPath,
                edgeWidth: pathWidth,
                edgeColor: pathColor,
                fillColor: pathFillColor,
                transparency: pathTransparency
            };

            this.#executeDrawing(surfaceId, 'path', processed, (ctx) => {
                this.#applyContextSettings(ctx, processed);
                ctx.beginPath();
                let currentX = processedPath[0].x;
                let currentY = processedPath[0].y;
                ctx.moveTo(currentX, currentY);

                for (let i = 1; i < processedPath.length; i++) {
                    const point = processedPath[i];
                    if (!point.type) {
                        ctx.lineTo(point.x, point.y);
                    } else if (point.type === 'bezier') {
                        ctx.bezierCurveTo(point.cp1x, point.cp1y, point.cp2x, point.cp2y, point.x, point.y);
                    } else if (point.type === 'quadratic') {
                        const q_cp1x = currentX + (2 / 3) * (point.cp1x - currentX);
                        const q_cp1y = currentY + (2 / 3) * (point.cp1y - currentY);
                        const q_cp2x = q_cp1x + (point.x - currentX) / 3;
                        const q_cp2y = q_cp1y + (point.y - currentY) / 3;
                        ctx.bezierCurveTo(q_cp1x, q_cp1y, q_cp2x, q_cp2y, point.x, point.y);
                    }
                    currentX = point.x;
                    currentY = point.y;
                }

                if (this.#resolveDimension(processed.edgeWidth, targetWidth) > 0 && processed.edgeColor) {
                    ctx.stroke();
                }
                if (processed.fillColor) {
                    ctx.fill();
                }
                ctx.closePath();
                ctx.restore();
            });
        }

        renderLine(surfaceId, startX, startY, endX, endY, lineWidthVal, lineColorVal, lineKind, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceId) : null;
            if (!targetElement) return;
            const targetWidth = targetElement.width;
            const targetHeight = targetElement.height;

            const processed = {
                startX: this.#resolveDimension(startX, targetWidth),
                startY: this.#resolveDimension(startY, targetHeight),
                endX: this.#resolveDimension(endX, targetWidth),
                endY: this.#resolveDimension(endY, targetHeight),
                edgeWidth: lineWidthVal,
                edgeColor: lineColorVal,
                lineType: lineKind,
                cp1x: this.#resolveDimension(ctrl1X, targetWidth),
                cp1y: this.#resolveDimension(ctrl1Y, targetHeight),
                cp2x: this.#resolveDimension(ctrl2X, targetWidth),
                cp2y: this.#resolveDimension(ctrl2Y, targetHeight)
            };

            this.#executeDrawing(surfaceId, 'line', processed, (ctx) => {
                this.#applyContextSettings(ctx, processed);
                ctx.beginPath();
                ctx.moveTo(processed.startX, processed.startY);

                if (!processed.lineType) {
                    ctx.lineTo(processed.endX, processed.endY);
                } else if (processed.lineType === 'bezier') {
                    ctx.bezierCurveTo(processed.cp1x, processed.cp1y, processed.cp2x, processed.cp2y, processed.endX, processed.endY);
                } else if (processed.lineType === 'quadratic') {
                    const q_cp1x = processed.startX + (2 / 3) * (processed.cp1x - processed.startX);
                    const q_cp1y = processed.startY + (2 / 3) * (processed.cp1y - processed.startY);
                    const q_cp2x = q_cp1x + (processed.endX - processed.startX) / 3;
                    const q_cp2y = q_cp1y + (processed.endY - processed.startY) / 3;
                    ctx.bezierCurveTo(q_cp1x, q_cp1y, q_cp2x, q_cp2y, processed.endX, processed.endY);
                }

                if (this.#resolveDimension(processed.edgeWidth, targetWidth) > 0 && processed.edgeColor) {
                    ctx.stroke();
                }
                ctx.restore();
            });
        }

        terminatePath(surfaceIdentifier) {
            const surfaceContext = this.obtainRenderingContext(surfaceIdentifier);
            if (surfaceContext) {
                surfaceContext.closePath();
            }
        }

        renderText(surfaceId, textX, textY, contentText, contentShade, fontStrength, fontSize, fontFamily, textAlignment, transparency, borderThickness, borderShade, textBaselineMode) {
            const targetElement = typeof document !== 'undefined' ? document.getElementById(surfaceId) : null;
            if (!targetElement) return;
            const targetWidth = targetElement.width;
            const targetHeight = targetElement.height;

            const resolvedFontSize = fontSize === 'random' ? this.#randomizer(0, 190) + 'px' : (fontSize ? this.#resolveDimension(fontSize, targetWidth) + 'px' : '15px');

            const processed = {
                x: this.#resolveDimension(textX, targetWidth),
                y: this.#resolveDimension(textY, targetHeight),
                text: contentText || '',
                fillColor: contentShade,
                font: `${fontStrength || ''} ${resolvedFontSize} ${fontFamily || 'sans-serif'}`,
                align: textAlignment || 'left',
                baseline: textBaselineMode || 'top',
                transparency: transparency,
                edgeWidth: borderThickness,
                edgeColor: borderShade
            };

            this.#executeDrawing(surfaceId, 'text', processed, (ctx) => {
                this.#applyContextSettings(ctx, processed);
                ctx.textAlign = processed.align;
                ctx.textBaseline = processed.baseline;
                ctx.font = processed.font;
                ctx.fillStyle = this.#processColorInput(processed.fillColor);
                ctx.fillText(processed.text, processed.x, processed.y);
                if (this.#resolveDimension(processed.edgeWidth, targetWidth) > 0 && processed.edgeColor) {
                    ctx.strokeStyle = this.#processColorInput(processed.edgeColor);
                    ctx.strokeText(processed.text, processed.x, processed.y);
                }
                ctx.restore();
            });
        }

        composeScene(surfaceIdentifier, collectionRef, snapshotRef) {
            const surfaceData = this.#sceneRecords.get(surfaceIdentifier);
            if (!surfaceData) {
                console.warn(`No scene records for surface ${surfaceIdentifier}`);
                return;
            }

            const actualCollectionRef = (collectionRef === 'latest') ? surfaceData.collections.length - 1 : (typeof collectionRef === 'number' && !isNaN(collectionRef) ? collectionRef : 0);

            if (actualCollectionRef < 0 || actualCollectionRef >= surfaceData.collections.length) {
                console.warn(`Invalid collection reference: ${collectionRef}`);
                return;
            }

            const targetCollection = surfaceData.collections[actualCollectionRef];
            if (!targetCollection) return;

            for (let l = 0; l < targetCollection.length; l++) {
                this.composePortion(surfaceIdentifier, actualCollectionRef, l, snapshotRef);
            }
        }

        composePortion(surfaceIdentifier, collectionRef, layerRef, snapshotRef) {
            const surfaceData = this.#sceneRecords.get(surfaceIdentifier);
            if (!surfaceData) return;

            const actualCollectionRef = (typeof collectionRef === 'number' && !isNaN(collectionRef)) ? collectionRef : 0;

            const targetCollection = surfaceData.collections[actualCollectionRef];
            if (!targetCollection) return;

            const actualLayerRef = (layerRef === 'latest') ? targetCollection.length - 1 : (typeof layerRef === 'number' && !isNaN(layerRef) ? layerRef : 0);

            if (actualLayerRef < 0 || actualLayerRef >= targetCollection.length) {
                console.warn(`Invalid layer reference: ${layerRef}`);
                return;
            }

            const targetLayer = targetCollection[actualLayerRef];
            if (!targetLayer) return;

            const actualSnapshotRef =
                (snapshotRef === 'previous') ? targetLayer.length - 2 :
                (snapshotRef === 'latest' || (typeof snapshotRef !== 'number' && isNaN(snapshotRef))) ? targetLayer.length - 1 :
                (typeof snapshotRef === 'number' && !isNaN(snapshotRef)) ? snapshotRef : 0;

            if (actualSnapshotRef < 0 || actualSnapshotRef >= targetLayer.length) {
                console.warn(`Invalid snapshot reference: ${snapshotRef}`);
                return;
            }

            const targetSnapshot = targetLayer[actualSnapshotRef];
            if (!targetSnapshot) return;

            const surfaceContext = this.obtainRenderingContext(surfaceIdentifier);
            if (!surfaceContext) return;

            const originalBuffer = this.#activeInstructionBuffer;
            this.#activeInstructionBuffer = [];

            try {
                targetSnapshot.forEach(command => {
                    const { instruction, parameters } = command;
                    switch (instruction) {
                        case 'disc':
                            this.renderDisc(surfaceIdentifier, parameters.x, parameters.y, parameters.r, parameters.fillColor, parameters.edgeWidth, parameters.edgeColor, parameters.transparency, parameters.shadowBlur, parameters.shadowColor, parameters.shadowOffsetX, parameters.shadowOffsetY);
                            break;
                        case 'box':
                            this.renderBox(surfaceIdentifier, parameters.x, parameters.y, parameters.width, parameters.height, parameters.fillColor, parameters.edgeWidth, parameters.edgeColor, parameters.transparency, parameters.shadowBlur, parameters.shadowColor, parameters.shadowOffsetX, parameters.shadowOffsetY);
                            break;
                        case 'picture':
                            this.renderPicture(surfaceIdentifier, parameters.src, parameters.x, parameters.y, parameters.width, parameters.height, parameters.transparency, parameters.fillColor, parameters.edgeWidth, parameters.edgeColor, parameters.shadowBlur, parameters.shadowColor, parameters.shadowOffsetX, parameters.shadowOffsetY);
                            break;
                        case 'path':
                            const pathPointsReconstructed = parameters.path.map(p => {
                                const arr = [p.x, p.y];
                                if (p.type === 'bezier') {
                                    arr.push(p.type, p.cp1x, p.cp1y, p.cp2x, p.cp2y);
                                } else if (p.type === 'quadratic') {
                                    arr.push(p.type, p.cp1x, p.cp1y);
                                }
                                return arr;
                            });
                            this.renderPath(surfaceIdentifier, pathPointsReconstructed, parameters.edgeWidth, parameters.edgeColor, parameters.fillColor, parameters.transparency);
                            break;
                        case 'line':
                            this.renderLine(surfaceIdentifier, parameters.startX, parameters.startY, parameters.endX, parameters.endY, parameters.edgeWidth, parameters.edgeColor, parameters.lineType, parameters.cp1x, parameters.cp1y, parameters.cp2x, parameters.cp2y);
                            break;
                        case 'text':
                            const fontParts = parameters.font.split(' ');
                            const fontStrength = fontParts[0];
                            const fontSize = fontParts[1].replace('px', '');
                            const fontFamily = fontParts.slice(2).join(' ');
                            this.renderText(surfaceIdentifier, parameters.x, parameters.y, parameters.text, parameters.fillColor, fontStrength, fontSize, fontFamily, parameters.align, parameters.transparency, parameters.edgeWidth, parameters.edgeColor, parameters.baseline);
                            break;
                        default:
                            console.warn(`Unknown instruction type during replay: ${instruction}`);
                    }
                });
            } finally {
                this.#activeInstructionBuffer = originalBuffer;
            }
        }
    }

    const visualInterface = new VisualComposerInternals();

    globalScope.drawingMachine = {
        configure: {
            drawingSurface: function() { /* Empty, mirrors original define.canvas */ },
            sceneGroup: function() { /* Empty, mirrors original define.stack */ },
            colorPalette: (new_colors) => visualInterface.configurePalette(new_colors)
        },
        prepareSurface: (target_id) => visualInterface.registerSurface(target_id),
        fabricate: {
            drawingSurface: function(parent_node, dim_width, dim_height) { /* Empty, mirrors original create.canvas */ },
            sceneGroup: (surface_id) => visualInterface.createSceneCollection(surface_id),
            sceneLayer: (surface_id, group_idx) => visualInterface.createSceneLayer(surface_id, group_idx),
            layerSnapshot: (surface_id, group_idx, layer_idx) => visualInterface.createSceneSnapshot(surface_id, group_idx, layer_idx)
        },
        wipe: {
            sceneLayer: (surface_id, group_idx, layer_idx) => visualInterface.eraseSceneLayerContent(surface_id, group_idx, layer_idx)
        },
        gather: {
            currentInstructions: () => visualInterface.retrieveActiveInstructions()
        },
        exportAs: {
            rasterImage: (surface_id) => visualInterface.exportSurfaceAsPNG(surface_id)
        },
        appendInstruction: (surface_id, group_idx, layer_idx, snapshot_idx, instruction_type, instruction_info) =>
            visualInterface.addInstructionToSnapshot(surface_id, group_idx, layer_idx, snapshot_idx, instruction_type, instruction_info),
        identifyElementKind: (element_id) => visualInterface.extractSurfaceType(element_id),
        locateRenderingContext: (element_id) => visualInterface.obtainRenderingContext(element_id),
        drawShape: {
            circle: (target, placex, placey, radius, fill_color, line_width, stroke_color, alpha, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y) =>
                visualInterface.renderDisc(target, placex, placey, radius, fill_color, line_width, stroke_color, alpha, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y),
            rectangle: (target, start_x, start_y, width, height, fill_color, line_width, stroke_color, alpha, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y) =>
                visualInterface.renderBox(target, start_x, start_y, width, height, fill_color, line_width, stroke_color, alpha, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y),
            image: (target, src, placex, placey, width, height, alpha, fill_color, line_width, stroke_color, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y) =>
                visualInterface.renderPicture(target, src, placex, placey, width, height, alpha, fill_color, line_width, stroke_color, shadow_blur, shadow_color, shadow_offset_x, shadow_offset_y),
            arbitraryPath: (target, path, line_width, line_color, fill_color, alpha) =>
                visualInterface.renderPath(target, path, line_width, line_color, fill_color, alpha),
            straightLine: (target, start_x, start_y, end_x, end_y, line_width, line_color, type, cp1_x, cp1_y, cp2_x, cp2_y) =>
                visualInterface.renderLine(target, start_x, start_y, end_x, end_y, line_width, line_color, type, cp1_x, cp1_y, cp2_x, cp2_y),
            text: (target, place_x, place_y, text, text_color, weight, size, font, align, alpha, line_width, line_color, baseline) =>
                visualInterface.renderText(target, place_x, place_y, text, text_color, weight, size, font, align, alpha, line_width, line_color, baseline)
        },
        closeActivePath: (target_id) => visualInterface.terminatePath(target_id),
        projectScene: (target_id, group_ref, snapshot_ref) => visualInterface.composeScene(target_id, group_ref, snapshot_ref),
        projectPortion: (target_id, group_ref, layer_ref, snapshot_ref) => visualInterface.composePortion(target_id, group_ref, layer_ref, snapshot_ref)
    };
})(typeof window !== 'undefined' ? window : globalThis);