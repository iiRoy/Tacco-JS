// --- System Capabilities and Persistent Configuration Management ---
const systemCapabilities = (() => {
    const testDrawingSurface = document.createElement('canvas');
    return {
        hasDrawingSurface: !!(testDrawingSurface.getContext && testDrawingSurface.getContext('2d')),
        hasAnchorDownloadAttribute: ('download' in document.createElement('a')),
        hasLocalStorage: (() => {
            try {
                const storageTestKey = '__storage_test__';
                window.localStorage.setItem(storageTestKey, storageTestKey);
                window.localStorage.removeItem(storageTestKey);
                return true;
            } catch (e) {
                return false;
            }
        })()
    };
})();

const textureConfigManager = (() => {
    const storageKey = 'application_configuration';
    const currentConfigVersion = '3.0a';
    let applicationConfiguration = {
        alphaValue: 0.05,
        granularity: 1,
        baseColorHex: 'f34379',
        outputWidth: 150,
        outputHeight: 150,
        isTransparent: false,
        exportFilenamePrefix: 'textured-pattern',
        forceBinaryDownload: false,
        configurationVersion: currentConfigVersion,
    };

    const retrieveSavedConfiguration = () => {
        if (!systemCapabilities.hasLocalStorage) {
            return applicationConfiguration;
        }
        const storedJson = window.localStorage.getItem(storageKey);
        if (storedJson) {
            let loadedConfig = JSON.parse(storedJson);
            // Configuration schema migration
            if (loadedConfig.configurationVersion !== currentConfigVersion) {
                for (const propName in applicationConfiguration) {
                    if (typeof loadedConfig[propName] === 'undefined') {
                        loadedConfig[propName] = applicationConfiguration[propName];
                    }
                }
                loadedConfig.configurationVersion = currentConfigVersion;
                saveConfiguration(loadedConfig);
            }
            applicationConfiguration = loadedConfig;
        } else {
            saveConfiguration(applicationConfiguration);
        }
        return applicationConfiguration;
    };

    const saveConfiguration = (configToPersist) => {
        if (systemCapabilities.hasLocalStorage) {
            window.localStorage.setItem(storageKey, JSON.stringify(configToPersist));
        }
    };

    return {
        access: (key) => {
            if (Object.keys(applicationConfiguration).length === 0) {
                retrieveSavedConfiguration();
            }
            return applicationConfiguration[key];
        },
        update: (key, value) => {
            retrieveSavedConfiguration();
            applicationConfiguration[key] = value;
            saveConfiguration(applicationConfiguration);
        },
        loadInitial: retrieveSavedConfiguration
    };
})();

// --- Drawing Surface & Rendering Context ---
let drawingSurface = null;
let renderContext = null;
let displayArea = null;

if (systemCapabilities.hasDrawingSurface) {
    drawingSurface = document.createElement('canvas');
    renderContext = drawingSurface.getContext('2d');
}

// --- DOM Interaction Helpers ---
const queryInputValue = (selector) => document.querySelector(selector)?.value;
const setInputValue = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.value = value;
};
const queryCheckedState = (selector) => document.querySelector(selector)?.checked;
const setCheckedState = (selector, checked) => {
    const el = document.querySelector(selector);
    if (el) el.checked = checked;
};

// --- Pixel Texture Generator (Type IV clone of generateNoise) ---
const createPixelatedTexture = (alphaFactor, pixelSize) => {
    if (!systemCapabilities.hasDrawingSurface) {
        return null;
    }

    const currentWidth = parseInt(queryInputValue('[data-input-id="width"]'));
    const currentHeight = parseInt(queryInputValue('[data-input-id="height"]'));

    drawingSurface.width = currentWidth;
    drawingSurface.height = currentHeight;

    const effectivePixelSize = Math.floor(pixelSize) || 1;

    const pixelCoords = [];
    for (let xPos = 0; xPos < drawingSurface.width; xPos += effectivePixelSize) {
        for (let yPos = 0; yPos < drawingSurface.height; yPos += effectivePixelSize) {
            pixelCoords.push({ x: xPos, y: yPos });
        }
    }

    renderContext.clearRect(0, 0, drawingSurface.width, drawingSurface.height);

    pixelCoords.forEach(coord => {
        const randomShade = Math.floor(Math.random() * 256);
        renderContext.fillStyle = `rgba(${randomShade},${randomShade},${randomShade},${alphaFactor})`;
        renderContext.fillRect(coord.x, coord.y, 1, 1);
    });

    const dataUri = drawingSurface.toDataURL('image/png');
    if (displayArea) {
        displayArea.style.backgroundImage = `url(${dataUri})`;
        displayArea.style.backgroundPosition = 'center center';
        displayArea.style.backgroundRepeat = 'repeat';
        displayArea.style.backgroundColor = `#${textureConfigManager.access('baseColorHex')}`;
    }

    // Immediately trigger the image export preparation after generation
    processTextureForExport();
    return dataUri;
};

// --- Custom Toggle Control (Type IV clone of $.fn.toCustomCheckbox) ---
const configureToggleControl = (inputElement) => {
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('custom-toggle-container');
    containerDiv.style.position = 'relative';
    containerDiv.style.overflow = 'hidden';

    inputElement.parentNode.insertBefore(containerDiv, inputElement);
    containerDiv.appendChild(inputElement);

    inputElement.style.position = 'absolute';
    inputElement.style.top = '0';
    inputElement.style.right = '0';
    inputElement.style.bottom = '0';
    inputElement.style.left = '0';
    inputElement.style.opacity = '0';
    inputElement.style.width = '100%';
    inputElement.style.height = '100%';
    inputElement.style.cursor = 'pointer';

    if (inputElement.checked) {
        containerDiv.classList.add('is-selected');
    }

    inputElement.addEventListener('change', () => {
        containerDiv.classList.toggle('is-selected', inputElement.checked);
    });
};

// --- Range Input Abstraction (Type IV clone of jQuery UI sliders) ---
class RangeControl {
    constructor(domSelector, initialVal, minVal, maxVal, stepVal, onValueUpdate) {
        this.htmlElement = document.querySelector(domSelector);
        if (!this.htmlElement) return;

        this.htmlElement.setAttribute('type', 'range');
        this.htmlElement.setAttribute('min', minVal);
        this.htmlElement.setAttribute('max', maxVal);
        this.htmlElement.setAttribute('step', stepVal);
        this.htmlElement.value = initialVal;

        this.onValueUpdateCallback = onValueUpdate;

        this.htmlElement.addEventListener('input', () => {
            this.onValueUpdateCallback(parseFloat(this.htmlElement.value));
        });
    }

    obtainValue() {
        return parseFloat(this.htmlElement.value);
    }

    assignValue(val) {
        this.htmlElement.value = val;
    }
}

let alphaLevelControl;
let pixelDensityControl;

// --- Image Export Preparation (Type IV clone of applyNoise) ---
const processTextureForExport = (activatingElement = null) => {
    if (!drawingSurface || !systemCapabilities.hasDrawingSurface) {
        return;
    }

    const compositionCanvas = document.createElement('canvas');
    const compositionContext = compositionCanvas.getContext('2d');

    compositionCanvas.width = drawingSurface.width;
    compositionCanvas.height = drawingSurface.height;

    const useTransparency = queryCheckedState('[data-input-id="transparent-toggle"]');

    if (!useTransparency) {
        compositionContext.fillStyle = `#${textureConfigManager.access('baseColorHex')}`;
        compositionContext.fillRect(0, 0, compositionCanvas.width, compositionCanvas.height);
    }
    compositionContext.drawImage(drawingSurface, 0, 0);

    const exportDataUri = compositionCanvas.toDataURL('image/png');
    const downloadActionLink = document.querySelector('[data-action="download-image"]');

    if (downloadActionLink) {
        downloadActionLink.dataset.imagePayload = exportDataUri;

        if (systemCapabilities.hasAnchorDownloadAttribute) {
            downloadActionLink.setAttribute('href', exportDataUri);
            const generatedFilename = [
                textureConfigManager.access('exportFilenamePrefix'),
                queryInputValue('[data-input-id="width"]') + 'x' + queryInputValue('[data-input-id="height"]'),
                'o' + (alphaLevelControl.obtainValue() * 100),
                'd' + (pixelDensityControl.obtainValue() * 10),
                'c-' + queryInputValue('[data-input-id="color"]'),
                't' + (useTransparency ? 1 : 0)
            ].join('-') + '.png';
            downloadActionLink.setAttribute('download', generatedFilename);
        } else if (activatingElement) {
            if (textureConfigManager.access('forceBinaryDownload')) {
                const binaryDataUri = exportDataUri.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
                window.location.href = binaryDataUri;
            } else {
                window.location.href = downloadActionLink.dataset.imagePayload;
            }
        }
    }
};

// --- Application Setup ---
const initializeApplicationInterface = () => {
    textureConfigManager.loadInitial();

    displayArea = document.querySelector('[data-output-target="texture-display"]');

    // Populate UI from stored configuration
    setInputValue('[data-input-id="color"]', textureConfigManager.access('baseColorHex'));
    setInputValue('[data-input-id="width"]', textureConfigManager.access('outputWidth'));
    setInputValue('[data-input-id="height"]', textureConfigManager.access('outputHeight'));
    setCheckedState('[data-input-id="transparent-toggle"]', textureConfigManager.access('isTransparent'));

    // Initialize alpha control
    alphaLevelControl = new RangeControl(
        '[data-range-id="alpha"]',
        textureConfigManager.access('alphaValue'),
        0, 1, 0.01,
        (newValue) => {
            createPixelatedTexture(newValue, pixelDensityControl.obtainValue());
            textureConfigManager.update('alphaValue', newValue);
        }
    );

    // Initialize density control
    pixelDensityControl = new RangeControl(
        '[data-range-id="density"]',
        textureConfigManager.access('granularity'),
        1, 10, 0.1,
        (newValue) => {
            createPixelatedTexture(alphaLevelControl.obtainValue(), newValue);
            textureConfigManager.update('granularity', newValue);
        }
    );

    // Color input event handling
    const colorInput = document.querySelector('[data-input-id="color"]');
    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            const hexValue = e.target.value.replace(/^#/, '');
            createPixelatedTexture(alphaLevelControl.obtainValue(), pixelDensityControl.obtainValue());
            textureConfigManager.update('baseColorHex', hexValue);
        });
        colorInput.addEventListener('change', (e) => {
            const hexValue = e.target.value.replace(/^#/, '');
            textureConfigManager.update('baseColorHex', hexValue);
        });
    }

    // Canvas size input validation and update
    const widthInput = document.querySelector('[data-input-id="width"]');
    const heightInput = document.querySelector('[data-input-id="height"]');

    const validateAndSetSize = (inputElement, configKey) => {
        let numericValue = parseInt(inputElement.value);
        if (isNaN(numericValue) || numericValue < 0) numericValue = 30;
        if (numericValue > 300) numericValue = 300;
        inputElement.value = numericValue;
        textureConfigManager.update(configKey, numericValue);
        createPixelatedTexture(alphaLevelControl.obtainValue(), pixelDensityControl.obtainValue());
    };

    if (widthInput) {
        widthInput.addEventListener('input', (e) => validateAndSetSize(e.target, 'outputWidth'));
        widthInput.addEventListener('change', (e) => validateAndSetSize(e.target, 'outputWidth'));
    }
    if (heightInput) {
        heightInput.addEventListener('input', (e) => validateAndSetSize(e.target, 'outputHeight'));
        heightInput.addEventListener('change', (e) => validateAndSetSize(e.target, 'outputHeight'));
    }

    // Apply custom styling to checkboxes
    document.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
        configureToggleControl(checkbox);
    });

    const transparentToggle = document.querySelector('[data-input-id="transparent-toggle"]');
    if (transparentToggle) {
        transparentToggle.addEventListener('change', (e) => {
            textureConfigManager.update('isTransparent', e.target.checked);
            processTextureForExport();
        });
    }

    // Initial texture generation on load
    createPixelatedTexture(alphaLevelControl.obtainValue(), pixelDensityControl.obtainValue());

    // Download button behavior
    const downloadButton = document.querySelector('[data-action="download-image"]');
    if (downloadButton && !systemCapabilities.hasAnchorDownloadAttribute) {
        downloadButton.addEventListener('click', (e) => {
            processTextureForExport(e.currentTarget);
            e.preventDefault();
        });
    }

    // Initial image export preparation
    processTextureForExport();
};

// --- Start the application when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', initializeApplicationInterface);