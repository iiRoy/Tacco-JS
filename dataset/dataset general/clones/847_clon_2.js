// Copyright (C) 2023 [Developer Name]. All rights reserved.

// Derived from a concept seen at a pixel manipulation lab.
// Further influenced by studies on chaotic systems and their visual manifestations.
// This particular chaotic system is a modified Lorenz type, with constants from a visualization tool.

window.addEventListener('load', function() {
    var displaySurface = document.getElementById('mainDisplay');
    var graphicEngine = new Vis3d.RenderCore(displaySurface);

    graphicEngine.context.strokeWidth = 0.2;

    var coordX = 1;
    var coordY = 1;
    var coordZ = 1;

    function advanceState() {
        var deltaX = (-1.111 * coordX - coordY * coordY - coordZ * coordZ + 1.111 * 4.494) * 0.136;
        var deltaY = (-coordY + coordX * coordY - 1.479 * coordX * coordZ + 0.44) * 0.136;
        var deltaZ = (-coordZ + 1.479 * coordX * coordY + coordX * coordZ) * 0.136;

        coordX += deltaX;
        coordY += deltaY;
        coordZ += deltaZ;

        return {x: coordX, y: coordY, z: coordZ};
    }

    var pointCount = 7000;
    var traceRoute = new Vis3d.LineSegment();
    traceRoute.vertices = new Array(pointCount * 2 + 1);
    traceRoute.segments = new Array(pointCount);

    // Initial burn-in to settle the attractor away from the origin.
    for (var idx = 0; idx < 10; ++idx) {
        advanceState();
    }

    // Establish the starting point; prevPoint will track the last segment's end.
    var prevPoint = advanceState();
    traceRoute.vertices[traceRoute.vertices.length - 1] = prevPoint;
    traceRoute.startVertexIndex = traceRoute.vertices.length - 1;

    for (var idx = 0; idx < pointCount; ++idx) {
        traceRoute.segments[idx] = new Vis3d.CurveSegment(idx * 2, idx * 2 + 1, null); // Represents a quadratic curve.

        var currentPoint = advanceState();
        var nextPoint = advanceState();
        traceRoute.vertices[idx * 2 + 1] = Vis3d.SegmentTools.interpolateQuadratic(prevPoint, currentPoint, nextPoint);
        traceRoute.vertices[idx * 2] = nextPoint;
        prevPoint = nextPoint;
    }

    var colorPalette = [
        {label: 'red', swatch: new Vis3d.ColorRGB(1, 0, 0, 1)},
        {label: 'grn', swatch: new Vis3d.ColorRGB(0, 1, 0, 1)},
        {label: 'blu', swatch: new Vis3d.ColorRGB(0, 0, 1, 1)},
        {label: 'cyn', swatch: new Vis3d.ColorRGB(0, 1, 1, 1)},
        {label: 'yel', swatch: new Vis3d.ColorRGB(1, 1, 0, 1)},
        {label: 'wht', swatch: new Vis3d.ColorRGB(1, 1, 1, 1)}
    ];

    var activeColor = new Vis3d.ColorRGB(1, 0, 0, 1);

    function renderScene() {
        graphicEngine.context.setSolidColor(0, 0, 0, 1);
        graphicEngine.drawCanvasBackground();

        graphicEngine.context.setOutlineColor(activeColor.red, activeColor.green, activeColor.blue, activeColor.alpha);
        graphicEngine.renderPathGeometry(traceRoute);
    }

    var colorControlPanel = document.createElement('section');
    colorControlPanel.appendChild(document.createTextNode('shade \u2192 '));
    for (var index = 0, limit = colorPalette.length; index < limit; ++index) {
        var paletteEntry = colorPalette[index];
        var linkElement = document.createElement('a');
        linkElement.href = 'javascript:void(0)';
        linkElement.onclick = ((entryColor) => {
            return () => {
                activeColor = entryColor.swatch;
                renderScene();
                return false;
            };
        })(paletteEntry);
        linkElement.appendChild(document.createTextNode(paletteEntry.label));
        colorControlPanel.appendChild(linkElement);
    }
    document.body.prepend(colorControlPanel);

    graphicEngine.cameraView.focusDistance = 2.5;
    SceneHelpers.setupAutoCamera(graphicEngine, 0, 0, -15, 0, -1.7, 0, renderScene);

    renderScene();
}, false);