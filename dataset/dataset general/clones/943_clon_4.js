(function() {

"use strict";

const LINE_THICKNESS_DEFAULT = 2;
const LINE_COLOR_DEFAULT = "rgba(0, 0, 0, 0.8)";
const AREA_COLOR_PRIMARY = "rgba(192, 192, 192, 0.8)";
const AREA_COLOR_SECONDARY = "rgba(255, 255, 255, 0.8)";
const TEXT_STYLE_PRIMARY = "12px sans-serif";
const TEXT_COLOR_PRIMARY = "rgba(0, 0, 0, 0.8)";

function obtainPivot(elementData) {
    return elementData.pivotPoint;
}

const geometryRenderers = {
    'rect-room': function(graphicsContext, elementData) {
        const hExtent = elementData.dimensions.horizontalExtent;
        const vExtent = elementData.dimensions.verticalExtent;
        graphicsContext.fillStyle = AREA_COLOR_PRIMARY;
        graphicsContext.fillRect(-hExtent / 2, -vExtent / 2, hExtent, vExtent);
        graphicsContext.strokeRect(-hExtent / 2, -vExtent / 2, hExtent, vExtent);
    },

    'vaulted-room': function(graphicsContext, elementData) {
        const hExtent = elementData.dimensions.horizontalExtent;
        const vExtent = elementData.dimensions.verticalExtent;
        const shading = graphicsContext.createLinearGradient(0, -vExtent / 2, 0, vExtent / 2);
        shading.addColorStop(0, AREA_COLOR_PRIMARY);
        shading.addColorStop(1, AREA_COLOR_SECONDARY);
        graphicsContext.fillStyle = shading;
        graphicsContext.fillRect(-hExtent / 2, -vExtent / 2, hExtent, vExtent);
        graphicsContext.strokeRect(-hExtent / 2, -vExtent / 2, hExtent, vExtent);
    },

    'cathedral-room': function(graphicsContext, elementData) {
        const hExtent = elementData.dimensions.horizontalExtent;
        const vExtent = elementData.dimensions.verticalExtent;
        const shading = graphicsContext.createLinearGradient(0, -vExtent / 2, 0, vExtent / 2);
        shading.addColorStop(0, AREA_COLOR_PRIMARY);
        shading.addColorStop(0.5, AREA_COLOR_SECONDARY);
        shading.addColorStop(1, AREA_COLOR_PRIMARY);
        graphicsContext.fillStyle = shading;
        graphicsContext.fillRect(-hExtent / 2, -vExtent / 2, hExtent, vExtent);
        graphicsContext.strokeRect(-hExtent / 2, -vExtent / 2, hExtent, vExtent);
    },

    'l-shaped-room': function(graphicsContext, elementData) {
        const hExtent = elementData.dimensions.horizontalExtent;
        const vExtent = elementData.dimensions.verticalExtent;
        const cutoutH = elementData.cutoutDimensions.horizontalExtent;
        const cutoutV = elementData.cutoutDimensions.verticalExtent;

        graphicsContext.fillStyle = AREA_COLOR_PRIMARY;
        graphicsContext.beginPath();
        graphicsContext.moveTo(-hExtent / 2, -vExtent / 2);
        graphicsContext.lineTo(hExtent / 2 - cutoutH, -vExtent / 2);
        graphicsContext.lineTo(hExtent / 2 - cutoutH, -vExtent / 2 + cutoutV);
        graphicsContext.lineTo(hExtent / 2, -vExtent / 2 + cutoutV);
        graphicsContext.lineTo(hExtent / 2, vExtent / 2);
        graphicsContext.lineTo(-hExtent / 2, vExtent / 2);
        graphicsContext.lineTo(-hExtent / 2, -vExtent / 2);
        graphicsContext.fill();
        graphicsContext.stroke();
    }
};

function renderArchitecturalElement(graphicsContext, elementData, drawingSurface) {
    graphicsContext.lineWidth = LINE_THICKNESS_DEFAULT;
    graphicsContext.strokeStyle = LINE_COLOR_DEFAULT;

    const currentPivot = obtainPivot(elementData);
    graphicsContext.translate(currentPivot.x, currentPivot.y);
    graphicsContext.save();

    if (elementData.orientationDegrees) {
        graphicsContext.rotate(elementData.orientationDegrees * Math.PI / 180.0);
    }

    const specificRenderer = geometryRenderers[elementData.kind];
    if (specificRenderer) {
        specificRenderer(graphicsContext, elementData);
    }

    graphicsContext.restore();

    graphicsContext.font = TEXT_STYLE_PRIMARY;
    graphicsContext.textAlign = "center";
    graphicsContext.textBaseline = "middle";
    graphicsContext.fillStyle = TEXT_COLOR_PRIMARY;
    graphicsContext.fillText(elementData.inscription, 0, 0);
}

window.FloorplanRenderEngine = {
    paintObject: renderArchitecturalElement,
    locateCenter: obtainPivot
};

})();