const SPAN_ADJUSTMENT_PIXELS = 1;

const createVertex = (idxH, idxV, xPos, yPos, hostElement) => {
    let currentX = xPos;
    let currentY = yPos;
    const connectedQuads = [];

    const visualHandle = document.createElement('div');
    visualHandle.className = 'vertex-point';
    visualHandle.setAttribute('data-vertex-ref', 'true'); // Custom attribute for identification
    hostElement.appendChild(visualHandle);

    const updateVisuals = () => {
        visualHandle.style.transform = `translate(${Math.round(currentX)}px, ${Math.round(currentY)}px)`;
    };
    updateVisuals();

    const self = {
        get horizontalIndex() { return idxH; },
        get verticalIndex() { return idxV; },
        get xCoordinate() { return currentX; },
        get yCoordinate() { return currentY; },
        get connectedQuads() { return connectedQuads; },
        get domReference() { return visualHandle; },

        shiftPositionBy: (deltaX, deltaY) => {
            const proposedX = currentX + deltaX;
            const proposedY = currentY + deltaY;

            const wouldCauseBend = connectedQuads.some(quad => quad.checkInwardBend(proposedX, proposedY, self));

            if (wouldCauseBend) {
                return false;
            }

            currentX = proposedX;
            currentY = proposedY;
            updateVisuals();
            return true;
        }
    };
    visualHandle._vertexInstance = self; // Store reference to the object on its DOM element
    return self;
};

const createQuadElement = (vertexArray, hostElement) => {
    const initialPositions = vertexArray.map(vtx => ({ x: vtx.xCoordinate, y: vtx.yCoordinate }));
    const quadId = `${vertexArray[0].horizontalIndex}-${vertexArray[0].verticalIndex}`;

    const quadDomElement = document.createElement('div');
    quadDomElement.className = 'quad-surface';
    quadDomElement.style.left = `${initialPositions[0].x}px`;
    quadDomElement.style.top = `${initialPositions[0].y}px`;
    quadDomElement.style.width = `${initialPositions[1].x - initialPositions[0].x + SPAN_ADJUSTMENT_PIXELS}px`;
    quadDomElement.style.height = `${initialPositions[3].y - initialPositions[0].y + SPAN_ADJUSTMENT_PIXELS}px`;
    hostElement.appendChild(quadDomElement);

    const self = {
        get domReference() { return quadDomElement; },
        get identifier() { return quadId; },
        get initialX() { return initialPositions[0].x; },
        get initialY() { return initialPositions[0].y; },
        get initialWidth() { return initialPositions[1].x - initialPositions[0].x + SPAN_ADJUSTMENT_PIXELS; },
        get initialHeight() { return initialPositions[3].y - initialPositions[0].y + SPAN_ADJUSTMENT_PIXELS; },
        get primaryHorizontalIndex() { return vertexArray[0].horizontalIndex; },
        get primaryVerticalIndex() { return vertexArray[0].verticalIndex; },

        checkInwardBend: (testCoordX, testCoordY, movingVertex) => {
            const movingVtxIdx = vertexArray.indexOf(movingVertex);
            if (movingVtxIdx === -1) return false;

            const tempPoints = vertexArray.map((vtx, idx) => {
                if (idx === movingVtxIdx) {
                    return { x: testCoordX, y: testCoordY };
                }
                return { x: vtx.xCoordinate, y: vtx.yCoordinate };
            });

            for (let i = 0; i < 4; i++) {
                const p1 = tempPoints[(i - 1 + 4) % 4];
                const p2 = tempPoints[i];
                const p3 = tempPoints[(i + 1) % 4];

                if ((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x) <= 0) {
                    return true;
                }
            }
            return false;
        },

        updatePerspectiveTransformation: () => {
            const sourceCoordinates = initialPositions;
            const destinationCoordinates = vertexArray.map(vtx => ({ x: vtx.xCoordinate, y: vtx.yCoordinate }));

            const originXOffset = sourceCoordinates[0].x;
            const originYOffset = sourceCoordinates[0].y;

            const matrixA_elements = Array(8).fill(0).map(() => Array(8).fill(0));
            const vectorB_elements = Array(8).fill(0);

            for (let k = 0; k < 4; k++) {
                const srcX = sourceCoordinates[k].x - originXOffset;
                const srcY = sourceCoordinates[k].y - originYOffset;
                const destX = destinationCoordinates[k].x - originXOffset;
                const destY = destinationCoordinates[k].y - originYOffset;

                matrixA_elements[k][0] = matrixA_elements[k + 4][3] = srcX;
                matrixA_elements[k][1] = matrixA_elements[k + 4][4] = srcY;
                matrixA_elements[k][2] = matrixA_elements[k + 4][5] = 1;

                matrixA_elements[k][6] = -srcX * destX;
                matrixA_elements[k][7] = -srcY * destX;
                matrixA_elements[k + 4][6] = -srcX * destY;
                matrixA_elements[k + 4][7] = -srcY * destY;

                vectorB_elements[k] = destX;
                vectorB_elements[k + 4] = destY;
            }

            const matrixB_column = vectorB_elements.map(val => [val]);

            const sourceMatrix = Matrix.create(matrixA_elements);
            const targetVector = Matrix.create(matrixB_column);
            const solutionVector = Matrix.solve(sourceMatrix, targetVector);

            const m = solutionVector.mat;

            const transformValues = [
                m[0][0], m[1][0], 0, m[2][0], // Column 1: m11, m21, m31, m41
                m[3][0], m[4][0], 0, m[5][0], // Column 2: m12, m22, m32, m42
                0, 0, 1, 0,                   // Column 3: m13, m23, m33, m43
                m[6][0], m[7][0], 0, 1        // Column 4: m14, m24, m34, m44
            ];

            quadDomElement.style.transform = `matrix3d(${transformValues.join(',')})`;
        }
    };

    vertexArray.forEach(vtx => vtx.connectedQuads.push(self));
    return self;
};

const createSpatialManager = (hostElement, cellDimension, dataProvider) => {
    dataProvider.initiateProcess();

    hostElement.innerHTML = '';
    hostElement.style.setProperty('--grid-width', `${dataProvider.contentWidth}px`);
    hostElement.style.setProperty('--grid-height', `${dataProvider.contentHeight}px`);
    hostElement.style.width = 'var(--grid-width)';
    hostElement.style.height = 'var(--grid-height)';
    hostElement.style.marginLeft = `calc(-1 * var(--grid-width) / 2)`;
    hostElement.style.marginTop = `calc(-1 * var(--grid-height) / 2)`;

    let drawingCanvas = document.createElement('canvas');
    drawingCanvas.id = 'grid-overlay-canvas';
    drawingCanvas.width = dataProvider.contentWidth;
    drawingCanvas.height = dataProvider.contentHeight;
    hostElement.appendChild(drawingCanvas);

    const totalWidth = dataProvider.contentWidth;
    const totalHeight = dataProvider.contentHeight;

    const horizontalVertexCount = Math.floor(totalWidth / cellDimension) + 1;
    const verticalVertexCount = Math.floor(totalHeight / cellDimension) + 1;

    const allVertices2D = Array.from({ length: horizontalVertexCount }, (_, i) =>
        Array.from({ length: verticalVertexCount }, (_, j) => {
            let xPosition = i * cellDimension;
            if (xPosition > totalWidth) xPosition = totalWidth;
            let yPosition = j * cellDimension;
            if (yPosition > totalHeight) yPosition = totalHeight;
            return createVertex(i, j, xPosition, yPosition, hostElement);
        })
    );
    const allVerticesFlat = allVertices2D.flat();

    const allQuads = [];
    for (let i = 0; i < horizontalVertexCount - 1; i++) {
        for (let j = 0; j < verticalVertexCount - 1; j++) {
            const quadVertices = [
                allVertices2D[i][j],
                allVertices2D[i + 1][j],
                allVertices2D[i + 1][j + 1],
                allVertices2D[i][j + 1]
            ];
            const newQuad = createQuadElement(quadVertices, hostElement);
            dataProvider.populateQuad(newQuad);
            newQuad.updatePerspectiveTransformation();
            allQuads.push(newQuad);
        }
    }

    let activeVertex = null;
    let propagateDisplacement = false;
    let distortAllVertices = false;
    let previousInteractionLocation = null;

    const extractEventCoordinates = (evt) => {
        const touch = evt.touches && evt.touches[0];
        return { x: touch ? touch.pageX : evt.screenX, y: touch ? touch.pageY : evt.screenY };
    };

    const onInteractionStart = (evt) => {
        const targetElement = evt.target;
        if (!targetElement || !targetElement.dataset.vertexRef) return;
        
        activeVertex = targetElement._vertexInstance;
        if (!activeVertex) return;

        propagateDisplacement = evt.altKey;
        distortAllVertices = evt.shiftKey;
        previousInteractionLocation = extractEventCoordinates(evt);
    };

    const onInteractionMove = (evt) => {
        evt.preventDefault();

        if (!activeVertex) return;

        const currentInteractionLocation = extractEventCoordinates(evt);
        const deltaX = currentInteractionLocation.x - previousInteractionLocation.x;
        const deltaY = currentInteractionLocation.y - previousInteractionLocation.y;

        const impactedQuads = new Set();
        const markQuadsAsImpacted = (vtx) => vtx.connectedQuads.forEach(q => impactedQuads.add(q));

        if (!activeVertex.shiftPositionBy(deltaX, deltaY)) {
            return;
        }
        markQuadsAsImpacted(activeVertex);

        if (propagateDisplacement) {
            allVerticesFlat.forEach(vtx => {
                if (vtx === activeVertex) return;
                const distH = Math.abs(vtx.horizontalIndex - activeVertex.horizontalIndex);
                const distV = Math.abs(vtx.verticalIndex - activeVertex.verticalIndex);
                const decayFactor = (1.0 / Math.pow(1.3, distH + distV)) - 0.05;
                if (decayFactor <= 0) return;
                vtx.shiftPositionBy(deltaX * decayFactor, deltaY * decayFactor);
                markQuadsAsImpacted(vtx);
            });
        } else if (distortAllVertices) {
            const hBefore = activeVertex.horizontalIndex;
            const hAfter = horizontalVertexCount - activeVertex.horizontalIndex - 1;
            const vBefore = activeVertex.verticalIndex;
            const vAfter = verticalVertexCount - activeVertex.verticalIndex - 1;

            allVerticesFlat.forEach(vtx => {
                if (vtx === activeVertex) return;

                let hFactor;
                if (vtx.horizontalIndex === activeVertex.horizontalIndex) {
                    hFactor = 1;
                } else if (vtx.horizontalIndex === 0 || vtx.horizontalIndex === horizontalVertexCount - 1) {
                    hFactor = 0;
                } else if (vtx.horizontalIndex < activeVertex.horizontalIndex) {
                    hFactor = 1.0 - (activeVertex.horizontalIndex - vtx.horizontalIndex) / hBefore;
                } else {
                    hFactor = 1.0 - (vtx.horizontalIndex - activeVertex.horizontalIndex) / hAfter;
                }

                let vFactor;
                if (vtx.verticalIndex === activeVertex.verticalIndex) {
                    vFactor = 1;
                } else if (vtx.verticalIndex === 0 || vtx.verticalIndex === verticalVertexCount - 1) {
                    vFactor = 0;
                } else if (vtx.verticalIndex < activeVertex.verticalIndex) {
                    vFactor = 1.0 - (activeVertex.verticalIndex - vtx.verticalIndex) / vBefore;
                } else {
                    vFactor = 1.0 - (vtx.verticalIndex - activeVertex.verticalIndex) / vAfter;
                }

                if (hFactor === 0 && vFactor === 0) return;

                vtx.shiftPositionBy(deltaX * hFactor, deltaY * vFactor);
                markQuadsAsImpacted(vtx);
            });
        }
        
        refreshOverlayDrawing();
        impactedQuads.forEach(quad => quad.updatePerspectiveTransformation());

        previousInteractionLocation = currentInteractionLocation;
    };

    const onInteractionEnd = () => {
        activeVertex = null;
    };

    if ('ontouchmove' in document) {
        document.addEventListener('touchstart', onInteractionStart, { passive: false });
        document.addEventListener('touchmove', onInteractionMove, { passive: false });
        document.addEventListener('touchend', onInteractionEnd, { passive: false });
    } else {
        document.addEventListener('mousedown', onInteractionStart, false);
        document.addEventListener('mousemove', onInteractionMove, false);
        document.addEventListener('mouseup', onInteractionEnd, false);
    }

    const refreshOverlayDrawing = () => {
        const minX = Math.min(...allVerticesFlat.map(v => v.xCoordinate)) - 1;
        const maxX = Math.max(...allVerticesFlat.map(v => v.xCoordinate)) + 1;
        const minY = Math.min(...allVerticesFlat.map(v => v.yCoordinate)) - 1;
        const maxY = Math.max(...allVerticesFlat.map(v => v.yCoordinate)) + 1;

        const currentCanvasWidth = drawingCanvas.width;
        const currentCanvasHeight = drawingCanvas.height;
        const requiredCanvasWidth = Math.ceil(maxX - minX);
        const requiredCanvasHeight = Math.ceil(maxY - minY);

        if (requiredCanvasWidth > currentCanvasWidth || requiredCanvasHeight > currentCanvasHeight) {
            const newCanvas = document.createElement('canvas');
            newCanvas.id = 'grid-overlay-canvas';
            newCanvas.width = Math.round(requiredCanvasWidth * 1.25);
            newCanvas.height = Math.round(requiredCanvasHeight * 1.25);
            drawingCanvas.parentNode.replaceChild(newCanvas, drawingCanvas);
            drawingCanvas = newCanvas;
        }

        drawingCanvas.style.left = `${minX}px`;
        drawingCanvas.style.top = `${minY}px`;

        const renderContext = drawingCanvas.getContext('2d');
        renderContext.lineWidth = 2;
        renderContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        renderContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

        for (let i = 0; i < horizontalVertexCount; i++) {
            for (let j = 0; j < verticalVertexCount; j++) {
                const currentVtx = allVertices2D[i][j];
                const vtxAbove = j > 0 ? allVertices2D[i][j - 1] : currentVtx;
                const vtxLeft = i > 0 ? allVertices2D[i - 1][j] : currentVtx;

                renderContext.beginPath();
                renderContext.moveTo(vtxAbove.xCoordinate - minX, vtxAbove.yCoordinate - minY);
                renderContext.lineTo(currentVtx.xCoordinate - minX, currentVtx.yCoordinate - minY);
                renderContext.lineTo(vtxLeft.xCoordinate - minX, vtxLeft.yCoordinate - minY);
                renderContext.stroke();
            }
        }
    };

    refreshOverlayDrawing();

    return {
        releaseResources: () => {
            if ('ontouchmove' in document) {
                document.removeEventListener('touchstart', onInteractionStart, { passive: false });
                document.removeEventListener('touchmove', onInteractionMove, { passive: false });
                document.removeEventListener('touchend', onInteractionEnd, { passive: false });
            } else {
                document.removeEventListener('mousedown', onInteractionStart, false);
                document.removeEventListener('mousemove', onInteractionMove, false);
                document.removeEventListener('mouseup', onInteractionEnd, false);
            }
            dataProvider.terminateProcess();
        }
    };
};