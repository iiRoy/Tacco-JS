window.imageAdjuster = {
    version: '1.0.0',
    backgroundSupport: false,
    capabilityChecked: false,
    defaultStyles: '.image-adjuster-item > img { visibility: hidden; }',
};

const elementSettingsMap = new WeakMap();

function verifyBackgroundCapability() {
    if (window.imageAdjuster.capabilityChecked) return;
    window.imageAdjuster.capabilityChecked = true;

    const temporaryDiv = document.createElement('div');
    temporaryDiv.style.cssText = 'background-size: cover; position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px;';
    document.body.appendChild(temporaryDiv);

    const computedStyle = window.getComputedStyle(temporaryDiv);
    window.imageAdjuster.backgroundSupport = (computedStyle && computedStyle.backgroundSize === 'cover');

    temporaryDiv.remove();
}

const baseOptions = {
    fillMode: true,
    verticalPlacement: 'center',
    horizontalPlacement: 'center',
    useBackgroundStyle: true,
    readDataAttributes: true,

    responsiveScaling: true,
    introDelay: 0,
    fadeDuration: 0,
    clearBoxBackground: true,
    pixelPrecision: true,
    resizeCheckInterval: 500,

    onAllBegin: null,
    onAllFinished: null,
    onScalingBegin: null,
    onScalingComplete: null,
    onScalingIssue: null
};

let currentBatchTotal = 0;
let completedBatchCount = 0;
let globalConfigForBatch = {};

function signalCompletion(itemIndex, containerElement, imageElement) {
    completedBatchCount++;
    if (completedBatchCount === currentBatchTotal) {
        globalConfigForBatch.onAllFinished?.();
    }
}

window.imageAdjuster.setup = function(targetSelector, configurationOverrides) {
    verifyBackgroundCapability();

    const elementsToAdjust = document.querySelectorAll(targetSelector);
    if (elementsToAdjust.length === 0) return;

    currentBatchTotal = elementsToAdjust.length;
    completedBatchCount = 0;
    globalConfigForBatch = Object.assign({}, baseOptions, configurationOverrides);

    globalConfigForBatch.onAllBegin?.();

    elementsToAdjust.forEach((containerElement, index) => {
        let effectiveConfig = Object.assign({}, globalConfigForBatch);

        if (effectiveConfig.readDataAttributes) {
            const dataFill = containerElement.dataset.imgadjustFill;
            if (dataFill === 'true' || dataFill === 'false') {
                effectiveConfig.fillMode = (dataFill === 'true');
            }
            const dataHAlign = containerElement.dataset.imgadjustHAlign;
            if (dataHAlign) {
                effectiveConfig.horizontalPlacement = dataHAlign;
            }
            const dataVAlign = containerElement.dataset.imgadjustVAlign;
            if (dataVAlign) {
                effectiveConfig.verticalPlacement = dataVAlign;
            }
        }

        elementSettingsMap.set(containerElement, effectiveConfig);

        const imageElement = containerElement.querySelector('img:first-child');
        if (!imageElement) {
            effectiveConfig.onScalingIssue?.(index, containerElement, null, new Error('No image found'));
            signalCompletion(index, containerElement, null);
            return;
        }

        effectiveConfig.onScalingBegin?.(index, containerElement, imageElement);

        if (window.imageAdjuster.backgroundSupport && effectiveConfig.useBackgroundStyle) {
            applyBackgroundStyle(containerElement, imageElement, effectiveConfig, index);
        } else {
            applyDirectImageStyle(containerElement, imageElement, effectiveConfig, index);
        }
    });
};

function applyBackgroundStyle(container, image, config, index) {
    const encodedSrc = encodeURI(image.src);
    container.style.backgroundImage = `url("${encodedSrc}")`;
    container.style.backgroundSize = config.fillMode ? 'cover' : 'contain';
    container.style.backgroundPosition = `${config.horizontalPlacement} ${config.verticalPlacement}`;
    container.style.backgroundRepeat = 'no-repeat';

    const firstAnchor = container.querySelector('a:first-child');
    if (firstAnchor) {
        firstAnchor.style.display = 'block';
        firstAnchor.style.width = '100%';
        firstAnchor.style.height = '100%';
    }

    image.style.display = 'none';

    config.onScalingComplete?.(index, container, image);
    container.classList.add('scaled-img-bg');
    container.classList.add('scaled-img-ready');
    signalCompletion(index, container, image);
}

function applyDirectImageStyle(container, image, config, index) {
    const currentSrc = image.src;
    const previousSrc = image.dataset.imgadjustSrcCached;
    if (previousSrc && previousSrc !== currentSrc) {
        const freshImage = image.cloneNode(true);
        freshImage.style.cssText = '';
        freshImage.dataset.imgadjustSrcCached = currentSrc;
        image.replaceWith(freshImage);
        image = freshImage;
        setTimeout(() => applyDirectImageStyle(container, image, config, index), 10);
        return;
    }
    image.dataset.imgadjustSrcCached = currentSrc;

    container.style.overflow = 'hidden';
    image.style.visibility = 'visible';
    image.style.maxWidth = 'none';
    image.style.maxHeight = 'none';
    image.style.width = 'auto';
    image.style.height = 'auto';
    image.style.display = 'block';
    image.style.opacity = '0';

    Array.from(container.querySelectorAll('img:not(:first-child)')).forEach(otherImage => {
        otherImage.style.display = 'none';
    });

    image.onerror = () => {
        image.dataset.imgadjustError = 'true';
        container.classList.add('scaled-img-error');
        config.onScalingIssue?.(index, container, image, new Error('Image load failed'));
        signalCompletion(index, container, image);
    };

    let visibilityCheckHandle;
    const checkLoadAndVisibility = () => {
        if (image.dataset.imgadjustError === 'true' || image.dataset.imgadjustProcessed === 'true') {
            return;
        }

        const bounds = container.getBoundingClientRect();
        const isVisible = (bounds.top < window.innerHeight && bounds.bottom > 0 && bounds.left < window.innerWidth && bounds.right > 0);

        if (isVisible && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
            image.dataset.imgadjustProcessed = 'true';
            image.dataset.originalWidth = image.naturalWidth;
            image.dataset.originalHeight = image.naturalHeight;
            setTimeout(() => calculateAndApplyDirectStyles(container, image, config, index), index * config.introDelay);
            cancelAnimationFrame(visibilityCheckHandle);
        } else {
            visibilityCheckHandle = requestAnimationFrame(checkLoadAndVisibility);
        }
    };
    checkLoadAndVisibility();

    if (config.responsiveScaling) {
        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target === container && image.dataset.imgadjustProcessed === 'true') {
                        calculateAndApplyDirectStyles(container, image, config, index);
                    }
                }
            });
            observer.observe(container);
        } else {
            let lastKnownSize = container.offsetWidth + (container.offsetHeight / 10000);
            setInterval(() => {
                const currentSize = container.offsetWidth + (container.offsetHeight / 10000);
                if (currentSize !== lastKnownSize && image.dataset.imgadjustProcessed === 'true') {
                    calculateAndApplyDirectStyles(container, image, config, index);
                }
                lastKnownSize = currentSize;
            }, config.resizeCheckInterval);
        }
    }
}

function calculateAndApplyDirectStyles(container, image, config, index) {
    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;

    const imgOriginalW = parseFloat(image.dataset.originalWidth);
    const imgOriginalH = parseFloat(image.dataset.originalHeight);

    let targetW, targetH;
    let offsetX = 0;
    let offsetY = 0;

    const containerAspect = containerW / containerH;
    const imageAspect = imgOriginalW / imgOriginalH;

    if (config.fillMode === (containerAspect >= imageAspect)) {
        targetW = containerW;
        targetH = containerW / imageAspect;
    } else {
        targetH = containerH;
        targetW = containerH * imageAspect;
    }

    const horizontalDiff = containerW - targetW;
    const hAlign = config.horizontalPlacement.toLowerCase();
    if (hAlign === 'left') offsetX = 0;
    else if (hAlign === 'center') offsetX = horizontalDiff * 0.5;
    else if (hAlign === 'right') offsetX = horizontalDiff;
    else if (hAlign.includes('%')) {
        const percentage = parseFloat(hAlign) / 100;
        offsetX = horizontalDiff * percentage;
    }

    const verticalDiff = containerH - targetH;
    const vAlign = config.verticalPlacement.toLowerCase();
    if (vAlign === 'top') offsetY = 0;
    else if (vAlign === 'center') offsetY = verticalDiff * 0.5;
    else if (vAlign === 'bottom') offsetY = verticalDiff;
    else if (vAlign.includes('%')) {
        const percentage = parseFloat(vAlign) / 100;
        offsetY = verticalDiff * percentage;
    }

    image.style.width = config.pixelPrecision ? `${Math.floor(targetW)}px` : 'auto';
    image.style.height = config.pixelPrecision ? `${Math.floor(targetH)}px` : 'auto';
    image.style.marginLeft = `${Math.floor(offsetX)}px`;
    image.style.marginTop = `${Math.floor(offsetY)}px`;

    if (image.dataset.firstApplied !== 'true') {
        image.style.transition = `opacity ${config.fadeDuration}ms ease-in`;
        image.style.opacity = '1';
        image.dataset.firstApplied = 'true';
        if (config.clearBoxBackground) {
            container.style.backgroundImage = 'none';
        }
        container.classList.add('scaled-img-nobg');
        container.classList.add('scaled-img-ready');
    }

    config.onScalingComplete?.(index, container, image);
    signalCompletion(index, container, image);
}

(function() {
    const sheet = document.createElement('style');
    sheet.type = 'text/css';
    sheet.textContent = window.imageAdjuster.defaultStyles;
    document.head.appendChild(sheet);
})();