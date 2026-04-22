function loadScriptAsset(path, callback) {
    let scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.async = true;
    scriptElement.src = path;
    scriptElement.onload = callback;
    let firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(scriptElement, firstScript);
}

function loadStyleAsset(path) {
    let styleLink = document.createElement('link');
    styleLink.rel = "stylesheet";
    styleLink.href = path;
    let firstLink = document.getElementsByTagName('link')[0];
    if (firstLink) {
        firstLink.parentNode.insertBefore(styleLink, firstLink);
    } else {
        document.head.appendChild(styleLink);
    }
}

class ImageRegionEditor {
    static CSS_MAIN_WRAPPER_CLASS = 'region-editor-main';
    static CSS_IMAGE_CANVAS_CLASS = 'region-editor-canvas';
    static CSS_IMAGE_DISPLAY_CLASS = 'region-editor-image';
    static CSS_REGION_ELEMENT_CLASS = 'region-editor-item';

    constructor(
        hostElement,
        initialImageURL,
        regionDataCollection,
        editorSettings
    ) {
        if (!hostElement || !(hostElement instanceof HTMLElement)) {
            throw new Error('Provided host element is not a valid DOM element.');
        }

        this.hostElement = hostElement;
        this.sourceImageURL = initialImageURL;
        this.regionDataCollection = regionDataCollection;
        this.editorSettings = editorSettings || {};

        this.imageCanvas = null;
        this.imageDisplay = null;
        this.regionElementMap = new Map();

        this._jqueryUiReady = false;

        this._buildComponentStructure();
        this._fetchExternalLibraries();
    }

    _buildComponentStructure() {
        this.mainContainer = document.createElement('div');
        this.mainContainer.className = ImageRegionEditor.CSS_MAIN_WRAPPER_CLASS;
        this.hostElement.appendChild(this.mainContainer);

        this.imageCanvas = document.createElement('div');
        this.imageCanvas.className = ImageRegionEditor.CSS_IMAGE_CANVAS_CLASS;
        this.mainContainer.appendChild(this.imageCanvas);

        this.imageDisplay = document.createElement('img');
        this.imageDisplay.className = ImageRegionEditor.CSS_IMAGE_DISPLAY_CLASS;
        this.imageDisplay.src = this.sourceImageURL;
        this.imageCanvas.appendChild(this.imageDisplay);

        this.imageDisplay.addEventListener('load', this._onImageLoaded.bind(this));
        if (this.imageDisplay.complete) {
            this._onImageLoaded();
        }
    }

    _fetchExternalLibraries() {
        loadStyleAsset("http://code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css");

        loadScriptAsset('https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js', () => {
            this._jqueryUiReady = true;
            this._registerCanvasInteractions();
            this._refreshRegionElements();
        });
    }

    _onImageLoaded() {
        this.imageCanvas.style.height = this.imageDisplay.offsetHeight + 'px';
        this.imageCanvas.style.width = this.imageDisplay.offsetWidth + 'px';
        this._normalizeRegionDimensions();
    }

    _registerCanvasInteractions() {
        if (!this._jqueryUiReady) {
            return;
        }

        this.imageCanvas.addEventListener('mousedown', (eventObject) => {
            let canvasOffset = jQuery(this.imageCanvas).offset();
            let clickX = eventObject.pageX - canvasOffset.left;
            let clickY = eventObject.pageY - canvasOffset.top;

            let initialX = clickX - 10;
            let initialY = clickY - 10;

            this._insertNewRegion({ x: initialX, y: initialY });
            eventObject.stopPropagation();
        });

        this._refreshRegionElements();
    }

    _insertNewRegion(coordinates) {
        const newRegionEntry = {
            designation: `region ${this.regionDataCollection.length + 1}`,
            location: {
                top: coordinates.y,
                left: coordinates.x
            }
        };
        this.regionDataCollection.push(newRegionEntry);
        this._refreshRegionElements();
        this._normalizeRegionDimensions();
    }

    _refreshRegionElements() {
        if (!this._jqueryUiReady) {
            return;
        }

        for (const [regionObject, regionElement] of this.regionElementMap.entries()) {
            if (!this.regionDataCollection.includes(regionObject)) {
                regionElement.remove();
                this.regionElementMap.delete(regionObject);
            }
        }

        this.regionDataCollection.forEach((regionObject, index) => {
            let regionElement = this.regionElementMap.get(regionObject);

            if (!regionElement) {
                regionElement = document.createElement('div');
                regionElement.className = ImageRegionEditor.CSS_REGION_ELEMENT_CLASS;
                this.imageCanvas.appendChild(regionElement);
                this.regionElementMap.set(regionObject, regionElement);

                if (!regionObject.location) {
                    regionObject.location = this._calculateRandomPosition();
                }

                jQuery(regionElement).resizable({
                    containment: "parent",
                    stop: () => this._normalizeRegionDimensions()
                });

                jQuery(regionElement).on('mousedown', (e) => e.stopPropagation());
            }

            this._applyRegionInteractionState(regionElement);
            this._updateRegionStyles(regionElement, regionObject, index);
        });
    }

    _updateRegionStyles(regionElement, regionObject, index) {
        const location = regionObject.location;
        if (location) {
            regionElement.style.left = typeof location.left === 'number' ? location.left + 'px' : location.left;
            regionElement.style.top = typeof location.top === 'number' ? location.top + 'px' : location.top;
            if (location.width) {
                regionElement.style.width = typeof location.width === 'number' ? location.width + 'px' : location.width;
            }
            if (location.height) {
                regionElement.style.height = typeof location.height === 'number' ? location.height + 'px' : location.height;
            }
        }
        regionObject.designation = `region ${index}`;
    }

    _normalizeRegionDimensions() {
        if (!this._jqueryUiReady || !this.imageCanvas) return;

        const canvasHeight = this.imageCanvas.offsetHeight;
        const canvasWidth = this.imageCanvas.offsetWidth;

        this.regionDataCollection.forEach((regionObject) => {
            const currentRegionElement = this.regionElementMap.get(regionObject);
            if (!currentRegionElement) return;

            const elementX = parseFloat(jQuery(currentRegionElement).css('left'));
            const elementY = parseFloat(jQuery(currentRegionElement).css('top'));
            const elementWidth = parseFloat(jQuery(currentRegionElement).css('width'));
            const elementHeight = parseFloat(jQuery(currentRegionElement).css('height'));

            const xPercentage = (elementX * 100) / canvasWidth;
            const yPercentage = (elementY * 100) / canvasHeight;
            const widthPercentage = (elementWidth * 100) / canvasWidth;
            const heightPercentage = (elementHeight * 100) / canvasHeight;

            regionObject.location = {
                left: xPercentage + '%',
                top: yPercentage + '%',
                width: widthPercentage + '%',
                height: heightPercentage + '%'
            };

            currentRegionElement.style.left = xPercentage + '%';
            currentRegionElement.style.top = yPercentage + '%';
            currentRegionElement.style.width = widthPercentage + '%';
            currentRegionElement.style.height = heightPercentage + '%';
        });
    }

    _calculateRandomPosition() {
        if (!this.imageCanvas) {
            return { top: '0%', left: '0%' };
        }
        const canvasHeight = this.imageCanvas.offsetHeight;
        const canvasWidth = this.imageCanvas.offsetWidth;

        const randomX = Math.floor(Math.random() * canvasWidth);
        const randomY = Math.floor(Math.random() * canvasHeight);

        const xPercentage = (randomX * 100) / canvasWidth;
        const yPercentage = (randomY * 100) / canvasHeight;

        return {
            top: yPercentage + '%',
            left: xPercentage + '%'
        };
    }

    _applyRegionInteractionState(regionElement) {
        if (!this._jqueryUiReady) return;

        const isMovable = this.editorSettings.regionMovable;
        const $regionElement = jQuery(regionElement);

        if (isMovable) {
            if (typeof $regionElement.data('ui-draggable') === 'undefined') {
                $regionElement.draggable({
                    containment: "parent",
                    scroll: false,
                    stop: () => this._normalizeRegionDimensions()
                });
            }
            $regionElement.draggable('enable');
            regionElement.style.cursor = 'move';
        } else {
            if (typeof $regionElement.data('ui-draggable') !== 'undefined') {
                $regionElement.draggable('disable');
            }
            regionElement.style.cursor = 'default';
        }
    }

    updateImageSource(newURL) {
        if (this.sourceImageURL === newURL) return;
        this.sourceImageURL = newURL;
        this.imageDisplay.src = newURL;
    }

    updateEditorSettings(newSettings) {
        Object.assign(this.editorSettings, newSettings);
        this.regionDataCollection.forEach(regionObject => {
            const regionElement = this.regionElementMap.get(regionObject);
            if (regionElement) {
                this._applyRegionInteractionState(regionElement);
            }
        });
    }

    randomizeRegionPositions() {
        this.regionDataCollection.forEach(regionObject => {
            if (regionObject.location) {
                regionObject.location = this._calculateRandomPosition();
            }
        });
        this._refreshRegionElements();
        this._normalizeRegionDimensions();
    }

    dispose() {
        if (this.imageCanvas) {
            this.imageCanvas.removeEventListener('mousedown', this._registerCanvasInteractions);
        }
        this.imageDisplay.removeEventListener('load', this._onImageLoaded);

        this.regionElementMap.forEach((regionElement) => {
            const $regionElement = jQuery(regionElement);
            if ($regionElement.data('ui-draggable')) {
                $regionElement.draggable('destroy');
            }
            if ($regionElement.data('ui-resizable')) {
                $regionElement.resizable('destroy');
            }
            $regionElement.off('mousedown');
        });

        this.hostElement.removeChild(this.mainContainer);
        this.regionElementMap.clear();
    }
}