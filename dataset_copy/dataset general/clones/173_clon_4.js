const mapIconConfiguration = {
    displayDimension: 72,
    contentPadding: 3,
    shapePaint: "#636363",
    outlineColor: "#000000",
    outlineThickness: 1,
    svgContainerId: "vectorPreview",
    canvasContainerId: "rasterPreview",
    vectorSaveButtonId: "vectorSave",
    rasterSaveButtonId: "rasterSave",
    tooltipClass: "tooltip-element"
};

let infoBubbleElement;

const XMLNS_ATTRIBUTE_URI = "http://www.w3.org/2000/xmlns/";
const SVG_NAMESPACE_URI = "http://www.w3.org/2000/svg";
const XLINK_NAMESPACE_URI = "http://www.w3.org/1999/xlink";

function applySvgNamespaceAttributes(targetSvgElement) {
    targetSvgElement.removeAttribute("xmlns");
    targetSvgElement.removeAttribute("xlink");

    if (!targetSvgElement.hasAttributeNS(XMLNS_ATTRIBUTE_URI, "xmlns")) {
        targetSvgElement.setAttributeNS(XMLNS_ATTRIBUTE_URI, "xmlns", SVG_NAMESPACE_URI);
    }
    if (!targetSvgElement.hasAttributeNS(XMLNS_ATTRIBUTE_URI, "xmlns:xlink")) {
        targetSvgElement.setAttributeNS(XMLNS_ATTRIBUTE_URI, "xmlns:xlink", XLINK_NAMESPACE_URI);
    }
}

function downloadVectorImage(svgElementToSave) {
    applySvgNamespaceAttributes(svgElementToSave);

    const documentType = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    const xmlSerializer = new XMLSerializer();
    const svgSource = xmlSerializer.serializeToString(svgElementToSave);
    const blob = new Blob([documentType + svgSource], { type: "image/svg+xml" });
    const objectUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.classList.add("download-utility-link");
    downloadLink.download = `${svgElementToSave.id}.svg`;
    downloadLink.href = objectUrl;
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        downloadLink.remove();
    }, 100);
}

function downloadRasterImage(canvasElementToSave) {
    const downloadLink = document.createElement("a");
    downloadLink.classList.add("download-utility-link");
    downloadLink.download = canvasElementToSave.id;
    downloadLink.href = canvasElementToSave.toDataURL("image/png");
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
        downloadLink.remove();
    }, 100);
}

function showInfoBubble(messageText) {
    if (!infoBubbleElement) {
        infoBubbleElement = document.createElement("div");
        infoBubbleElement.classList.add(mapIconConfiguration.tooltipClass);
        infoBubbleElement.style.position = "absolute";
        document.body.appendChild(infoBubbleElement);
    }
    infoBubbleElement.innerHTML = '';
    const countryNameDisplay = document.createElement("span");
    countryNameDisplay.classList.add("country-label");
    countryNameDisplay.textContent = messageText;
    infoBubbleElement.appendChild(countryNameDisplay);
    infoBubbleElement.style.display = "block";
}

function hideInfoBubble() {
    if (infoBubbleElement) {
        infoBubbleElement.style.display = "none";
    }
}

function createVectorElements(geoWorldData, countryIdToNameMap) {
    const svgOutputContainer = document.getElementById(mapIconConfiguration.svgContainerId);
    if (!svgOutputContainer) { console.error("SVG output container not found."); return; }

    let featuresArray = topojson.feature(geoWorldData, geoWorldData.objects.countries).features;

    featuresArray.sort((a, b) => a.id - b.id);

    const projectionDispatch = new Map([
        [643, () => d3.geo.albers().rotate([-105, 0]).center([-10, 65]).parallels([52, 64])],
        [840, () => d3.geo.albersUsa()]
    ]);

    // Clear existing SVGs to ensure sorted re-insertion
    while (svgOutputContainer.firstChild) {
        svgOutputContainer.removeChild(svgOutputContainer.firstChild);
    }

    featuresArray.forEach(geoFeature => {
        const newSvgElement = document.createElementNS(SVG_NAMESPACE_URI, "svg");
        newSvgElement.setAttribute("width", mapIconConfiguration.displayDimension);
        newSvgElement.setAttribute("height", mapIconConfiguration.displayDimension);
        newSvgElement.setAttribute("overflow", "hidden");
        newSvgElement.id = countryIdToNameMap.get(geoFeature.id);

        let activeProjection;
        if (projectionDispatch.has(geoFeature.id)) {
            activeProjection = projectionDispatch.get(geoFeature.id)();
        } else {
            activeProjection = d3.geo.mercator();
        }
        const shapePathGenerator = d3.geo.path().projection(activeProjection);

        const bounds = shapePathGenerator.bounds(geoFeature);
        const diffX = bounds[1][0] - bounds[0][0];
        const diffY = bounds[1][1] - bounds[0][1];
        const maxDiff = Math.max(diffX, diffY);
        const currentScale = 1 / Math.max(
            diffX / (mapIconConfiguration.displayDimension - 2 * mapIconConfiguration.contentPadding),
            diffY / (mapIconConfiguration.displayDimension - 2 * mapIconConfiguration.contentPadding)
        );

        const transformationGroup = document.createElementNS(SVG_NAMESPACE_URI, "g");
        const transformX = mapIconConfiguration.contentPadding / currentScale + (maxDiff - diffX) * 0.5 - bounds[0][0];
        const transformY = mapIconConfiguration.contentPadding / currentScale + (maxDiff - diffY) * 0.5 - bounds[0][1];
        transformationGroup.setAttribute("transform", `scale(${currentScale})translate(${transformX},${transformY})`);

        const countryShape = document.createElementNS(SVG_NAMESPACE_URI, "path");
        countryShape.style.fill = mapIconConfiguration.shapePaint;
        countryShape.style.stroke = mapIconConfiguration.outlineColor;
        countryShape.style.strokeWidth = `${mapIconConfiguration.outlineThickness / currentScale}px`;
        countryShape.setAttribute("d", shapePathGenerator(geoFeature));

        transformationGroup.appendChild(countryShape);
        newSvgElement.appendChild(transformationGroup);
        svgOutputContainer.appendChild(newSvgElement);

        newSvgElement.addEventListener("click", () => downloadVectorImage(newSvgElement));
        newSvgElement.addEventListener("mouseover", () => showInfoBubble(countryIdToNameMap.get(geoFeature.id)));
        newSvgElement.addEventListener("mouseout", hideInfoBubble);
    });
}

function renderRasterElements(sourceSvgElement) {
    const canvasOutputContainer = document.getElementById(mapIconConfiguration.canvasContainerId);
    if (!canvasOutputContainer) { console.error("Canvas output container not found."); return; }

    const svgIdentifier = sourceSvgElement.id;
    const elementDimension = Math.max(
        parseInt(sourceSvgElement.getAttribute("width")),
        parseInt(sourceSvgElement.getAttribute("height"))
    );

    applySvgNamespaceAttributes(sourceSvgElement);

    const xmlSerializer = new XMLSerializer();
    const svgContentString = xmlSerializer.serializeToString(sourceSvgElement);
    const objectUrl = URL.createObjectURL(new Blob([svgContentString], { type: "image/svg+xml" }));

    const newCanvasElement = document.createElement("canvas");
    newCanvasElement.setAttribute("overflow", "hidden");
    newCanvasElement.id = `${svgIdentifier}.png`;
    newCanvasElement.width = elementDimension;
    newCanvasElement.height = elementDimension;
    canvasOutputContainer.appendChild(newCanvasElement);

    const canvasDrawingContext = newCanvasElement.getContext("2d");

    newCanvasElement.addEventListener("click", () => downloadRasterImage(newCanvasElement));
    newCanvasElement.addEventListener("mouseover", () => showInfoBubble(svgIdentifier));
    newCanvasElement.addEventListener("mouseout", hideInfoBubble);

    const imgRepresentation = new Image();
    imgRepresentation.src = objectUrl;
    imgRepresentation.onload = () => {
        canvasDrawingContext.drawImage(imgRepresentation, 0, 0, elementDimension, elementDimension);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10);
    };
    imgRepresentation.onerror = () => {
        console.error("Failed to load SVG as image for rasterization:", svgIdentifier);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10);
    };
}

async function initializeMapIcons(loadError, worldJsonData, countryTsvData) {
    if (loadError) {
        console.error("Data loading failed:", loadError);
        return;
    }

    const countryRecords = countryTsvData.split('\n').map(line => {
        const parts = line.split('\t');
        return parts.length === 2 ? { id: parseInt(parts[0]), name: parts[1].trim() } : null;
    }).filter(Boolean);

    const countryIdToNameMap = new Map(countryRecords.map(record => [record.id, record.name]));

    createVectorElements(worldJsonData, countryIdToNameMap);

    const allGeneratedSvgs = Array.from(document.getElementById(mapIconConfiguration.svgContainerId).querySelectorAll("svg"));
    allGeneratedSvgs.forEach(renderRasterElements);
}

document.addEventListener("DOMContentLoaded", () => {
    infoBubbleElement = document.createElement("div");
    infoBubbleElement.classList.add(mapIconConfiguration.tooltipClass);
    infoBubbleElement.style.display = "none";
    infoBubbleElement.style.position = "absolute";
    document.body.appendChild(infoBubbleElement);

    const svgExportControl = document.getElementById(mapIconConfiguration.vectorSaveButtonId);
    const pngExportControl = document.getElementById(mapIconConfiguration.rasterSaveButtonId);

    if (svgExportControl) {
        svgExportControl.addEventListener("click", () => {
            const allSvgs = document.getElementById(mapIconConfiguration.svgContainerId).querySelectorAll("svg");
            allSvgs.forEach(downloadVectorImage);
        });
    }

    if (pngExportControl) {
        pngExportControl.addEventListener("click", () => {
            const allCanvases = document.getElementById(mapIconConfiguration.canvasContainerId).querySelectorAll("canvas");
            allCanvases.forEach(downloadRasterImage);
        });
    }

    Promise.all([
        fetch("data/world-110m.json").then(response => response.json()),
        fetch("data/world-110m-country-names.tsv").then(response => response.text())
    ])
    .then(([worldData, countryNamesData]) => {
        initializeMapIcons(null, worldData, countryNamesData);
    })
    .catch(error => {
        initializeMapIcons(error, null, null);
    });
});