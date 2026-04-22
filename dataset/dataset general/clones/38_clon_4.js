const assetPath = "assets/image-asset-{resolution}.jpeg";
const layoutElementsSelector = ".section .content-block";
const targetImagesSelector = "img.feature-image";

const imageUpdaters = new Map();

function obtainViewResolution() {
    let currentDimension = 320;
    const devicePixelMultiplier = window.devicePixelRatio > 1.5;

    if (window.innerWidth >= 640) {
        currentDimension = 640;
    } else if (window.innerWidth >= 480) {
        currentDimension = 480;
    } else {
        currentDimension = 320;
    }

    return {
        dimension: currentDimension,
        isRetina: devicePixelMultiplier,
        identifier: `res-${currentDimension}`
    };
}

function balanceContentBlocks() {
    const blocks = document.querySelectorAll(layoutElementsSelector);
    if (blocks.length === 0) return;

    blocks.forEach(block => {
        block.style.height = "auto";
    });

    requestAnimationFrame(() => {
        let maximumHeight = 0;
        blocks.forEach(block => {
            maximumHeight = Math.max(maximumHeight, block.offsetHeight);
        });

        blocks.forEach(block => {
            block.style.height = `${maximumHeight}px`;
        });
    });
}

function presentComponentDetails(detailPayload, containerElement) {
    if (!containerElement) return;

    const inputDisplay = containerElement.querySelector(".display-input");
    const sourceDisplay = containerElement.querySelector(".display-source");
    const timestampDisplay = containerElement.querySelector(".display-timestamp");

    if (inputDisplay) {
        inputDisplay.textContent = `${detailPayload.dimension}, ${detailPayload.identifier}, high resolution: ${detailPayload.isRetina}`;
    }
    if (sourceDisplay) {
        sourceDisplay.textContent = detailPayload.finalUrl;
    }
    if (timestampDisplay) {
        timestampDisplay.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    }

    balanceContentBlocks();
}

function constructImageUrl(resolutionData, hostingElement) {
    const resolutionSuffix = resolutionData.isRetina ? `${resolutionData.dimension}@2x` : resolutionData.dimension.toString();
    const constructedUrl = assetPath.replace("{resolution}", resolutionSuffix);

    const payload = {
        dimension: resolutionData.dimension,
        identifier: resolutionData.identifier,
        isRetina: resolutionData.isRetina,
        finalUrl: constructedUrl
    };

    presentComponentDetails(payload, hostingElement.closest(".section"));
    return constructedUrl;
}

function applyVisualAdaptation(imageElement) {
    const currentResolution = obtainViewResolution();
    const newImageUrl = constructImageUrl(currentResolution, imageElement);
    if (imageElement.src !== newImageUrl) {
        imageElement.src = newImageUrl;
    }
}

function refreshAllVisuals() {
    imageUpdaters.forEach(updater => updater());
    balanceContentBlocks();
}

document.addEventListener('DOMContentLoaded', () => {
    const imagesToAdapt = document.querySelectorAll(targetImagesSelector);
    imagesToAdapt.forEach(imgEl => {
        const updater = () => applyVisualAdaptation(imgEl);
        imageUpdaters.set(imgEl, updater);
        updater();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refreshAllVisuals, 150);
    });

    refreshAllVisuals();
});