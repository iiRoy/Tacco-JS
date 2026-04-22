const chaosCoefficients = Object.freeze({
    firstXFactor: -1.111,
    ySquaredFactor: -1,
    zSquaredFactor: -1,
    constantXOffset: 1.111 * 4.494,
    firstYFactor: -1,
    xyProductFactor: 1,
    xzProductFactorY: -1.479,
    constantYOffset: 0.44,
    firstZFactor: -1,
    xyProductFactorZ: 1.479,
    xzProductFactorZ: 1,
    overallScale: 0.136
});

function createDynamicSystem(initialX, initialY, initialZ) {
    let currentX = initialX;
    let currentY = initialY;
    let currentZ = initialZ;

    return {
        queryPosition: () => ({ xValue: currentX, yValue: currentY, zValue: currentZ }),
        advancePosition: () => {
            const deltaX = (chaosCoefficients.firstXFactor * currentX +
                            chaosCoefficients.ySquaredFactor * currentY * currentY +
                            chaosCoefficients.zSquaredFactor * currentZ * currentZ +
                            chaosCoefficients.constantXOffset) * chaosCoefficients.overallScale;

            const deltaY = (chaosCoefficients.firstYFactor * currentY +
                            chaosCoefficients.xyProductFactor * currentX * currentY +
                            chaosCoefficients.xzProductFactorY * currentX * currentZ +
                            chaosCoefficients.constantYOffset) * chaosCoefficients.overallScale;

            const deltaZ = (chaosCoefficients.firstZFactor * currentZ +
                            chaosCoefficients.xyProductFactorZ * currentX * currentY +
                            chaosCoefficients.xzProductFactorZ * currentX * currentZ) * chaosCoefficients.overallScale;

            currentX += deltaX;
            currentY += deltaY;
            currentZ += deltaZ;

            return { xValue: currentX, yValue: currentY, zValue: currentZ };
        }
    };
}

function generateVisualTrace(systemProcessor, segmentQuantity) {
    const collectedPoints = new Array(segmentQuantity * 2 + 1);
    const collectedCurves = new Array(segmentQuantity);

    // Perform stabilization iterations
    Array.from({ length: 10 }).forEach(() => systemProcessor.advancePosition());

    let segmentPreviousPoint = systemProcessor.advancePosition(); // Corresponds to original 'p0'

    // Store this initial point at the last index, as per original logic
    collectedPoints[segmentQuantity * 2] = segmentPreviousPoint;
    const initialPointIndex = segmentQuantity * 2;

    Array.from({ length: segmentQuantity }).forEach((_, index) => {
        const segmentMidPoint = systemProcessor.advancePosition(); // Corresponds to original 'p1'
        const segmentEndPoint = systemProcessor.advancePosition(); // Corresponds to original 'p2'

        const calculatedControlPoint = Pre3d.PathUtils.fitQuadraticToPoints(segmentPreviousPoint, segmentMidPoint, segmentEndPoint);

        collectedPoints[index * 2] = segmentEndPoint;
        collectedPoints[index * 2 + 1] = calculatedControlPoint;
        collectedCurves[index] = new Pre3d.Curve(index * 2, index * 2 + 1, null);

        segmentPreviousPoint = segmentEndPoint; // Update for the next segment's start
    });

    const generatedPathObject = new Pre3d.Path();
    generatedPathObject.points = collectedPoints;
    generatedPathObject.curves = collectedCurves;
    generatedPathObject.starting_point = initialPointIndex; // Reproduce original behavior

    return generatedPathObject;
}

function constructColorSelector(paletteMap, colorUpdateHandler, sceneRefreshHandler) {
    const selectorContainer = document.createElement('div');
    selectorContainer.appendChild(document.createTextNode('color \u2192 '));

    Object.entries(paletteMap).forEach(([colorName, colorValue]) => {
        const colorOptionLink = document.createElement('a');
        colorOptionLink.href = '#';
        colorOptionLink.textContent = colorName;
        colorOptionLink.addEventListener('click', (event) => {
            event.preventDefault();
            colorUpdateHandler(colorValue);
            sceneRefreshHandler();
        });
        selectorContainer.appendChild(colorOptionLink);
    });
    return selectorContainer;
}

function initializeVisualization() {
    const renderSurface = document.getElementById('canvas');
    const graphicsEngine = new Pre3d.Renderer(renderSurface);

    graphicsEngine.ctx.lineWidth = 0.2;

    const attractorSystem = createDynamicSystem(1, 1, 1);

    const totalSegments = 7000;
    const visualPath = generateVisualTrace(attractorSystem, totalSegments);

    const availableColors = {
        'r': new Pre3d.RGBA(1, 0, 0, 1),
        'g': new Pre3d.RGBA(0, 1, 0, 1),
        'b': new Pre3d.RGBA(0, 0, 1, 1),
        'a': new Pre3d.RGBA(0, 1, 1, 1),
        'y': new Pre3d.RGBA(1, 1, 0, 1),
        'w': new Pre3d.RGBA(1, 1, 1, 1)
    };
    let activeStrokeColor = availableColors['r'];

    const redrawCanvas = () => {
        graphicsEngine.ctx.setFillColor(0, 0, 0, 1);
        graphicsEngine.drawBackground();

        graphicsEngine.ctx.setStrokeColor(activeStrokeColor.r, activeStrokeColor.g, activeStrokeColor.b, activeStrokeColor.a);
        graphicsEngine.drawPath(visualPath);
    };

    const colorControlUI = constructColorSelector(
        availableColors,
        (newColor) => { activeStrokeColor = newColor; },
        redrawCanvas
    );
    document.body.insertBefore(colorControlUI, document.body.firstChild);

    graphicsEngine.camera.focal_length = 2.5;
    DemoUtils.autoCamera(graphicsEngine, 0, 0, -15, 0, -1.7, 0, redrawCanvas);

    redrawCanvas();
}

window.addEventListener('load', initializeVisualization, false);