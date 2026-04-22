class ColorSwatchApplication {
    constructor() {
        this.globalWindowAccessor = window;
        this.domDocumentAccessor = document;
        this.imageElementHolder = new Image();
        this.mainContainerElement = null;
        this.drawingSurfaceElement = null;
        this.surface2dContext = null;
        this.colorInformationPanel = null;
        this.panelToggleButton = null;
        this.hexadecimalOutputArea = null;
        this.rgbOutputArea = null;
        this.hslOutputArea = null;
        this.invertedOutputArea = null;
        this.initialGuidanceMessage = null;
        this.applicationIdentifierLogo = null;
        this.magnifyingLensOverlay = this.domDocumentAccessor.createElement('div');
        this.isDeveloperModeActive = false; // debug mode true|false

        this.configureInitialDomReferences();
        this.setupGlobalEventDispatchers();
    }

    configureInitialDomReferences() {
        this.mainContainerElement = this.domDocumentAccessor.querySelector('.elementsHolder');
        this.drawingSurfaceElement = this.domDocumentAccessor.querySelector('.theCanvas');
        this.surface2dContext = this.drawingSurfaceElement.getContext('2d');
        this.colorInformationPanel = this.domDocumentAccessor.querySelector('.info');
        this.panelToggleButton = this.domDocumentAccessor.querySelector('.move');
        this.hexadecimalOutputArea = this.domDocumentAccessor.querySelector('.hex');
        this.rgbOutputArea = this.domDocumentAccessor.querySelector('.rgb');
        this.hslOutputArea = this.domDocumentAccessor.querySelector('.hsl');
        this.invertedOutputArea = this.domDocumentAccessor.querySelector('.inv');
        this.initialGuidanceMessage = this.domDocumentAccessor.querySelector('div.drop');
        this.applicationIdentifierLogo = this.domDocumentAccessor.querySelector('.logo');

        this.magnifyingLensOverlay.className = 'mGlass';
        //this.mainContainerElement.appendChild(this.magnifyingLensOverlay); // Kept commented, as in original
    }

    setupGlobalEventDispatchers() {
        this.globalWindowAccessor.onload = () => this.commenceApplicationStartup();
    }

    commenceApplicationStartup() {
        this.domDocumentAccessor.ondragenter = (inputEvent) => this.processDragEntry(inputEvent);
        this.domDocumentAccessor.ondragover = (inputEvent) => this.processDragOver(inputEvent);
        this.domDocumentAccessor.ondrop = (inputEvent) => this.processFileDropEvent(inputEvent);
        this.mainContainerElement.onclick = (inputEvent) => this.processContainerClick(inputEvent);
        this.panelToggleButton.onclick = (inputEvent) => this.toggleInformationPanelPosition(inputEvent);

        this.imageElementHolder.onload = () => this.handleImageResourceLoad();

        if (this.isDeveloperModeActive) console.log('Application services initialized.');
    }

    handleImageResourceLoad() {
        this.drawingSurfaceElement.width = this.imageElementHolder.width;
        this.drawingSurfaceElement.height = this.imageElementHolder.height;
        this.mainContainerElement.style.cssText = `
            width: ${this.imageElementHolder.width}px;
            height: ${this.imageElementHolder.height}px;
            opacity: 1;
        `;

        const isWithinWindowBounds = this.imageElementHolder.width <= this.globalWindowAccessor.innerWidth;
        const topPosition = isWithinWindowBounds ? '50%' : '0';
        const leftPosition = isWithinWindowBounds ? '50%' : '0';
        const marginTopValue = isWithinWindowBounds ? `-${this.imageElementHolder.height / 2}px` : '0';
        const marginLeftValue = isWithinWindowBounds ? `-${this.imageElementHolder.width / 2}px` : '0';
        const shadowStyle = isWithinWindowBounds ? '0 0 20px 10px #666' : 'none';

        Object.assign(this.mainContainerElement.style, {
            top: topPosition,
            left: leftPosition,
            marginTop: marginTopValue,
            marginLeft: marginLeftValue,
            boxShadow: shadowStyle
        });

        this.surface2dContext.drawImage(this.imageElementHolder, 0, 0);
        this.globalWindowAccessor.scrollTo(0, 0);

        if (this.isDeveloperModeActive) console.log('Visual asset fully loaded.');
        if (this.isDeveloperModeActive) console.log(`Asset dimensions: ${this.imageElementHolder.width} x ${this.imageElementHolder.height}`);
    }

    processDragEntry(domEvent) {
        domEvent.stopPropagation();
        domEvent.preventDefault();
        if (this.isDeveloperModeActive) console.log('Drag operation initiated.');
    }

    processDragOver(domEvent) {
        this.mainContainerElement.style.opacity = 0.3;
        domEvent.stopPropagation();
        domEvent.preventDefault();
        if (this.isDeveloperModeActive) console.log('Object being dragged over target.');
    }

    processFileDropEvent(domEvent) {
        const transferredFiles = domEvent.dataTransfer.files;
        if (transferredFiles.length > 0) {
            const primaryFile = transferredFiles[0];
            if (typeof FileReader !== 'undefined') {
                const fileReaderInstance = new FileReader();
                fileReaderInstance.onload = (readerEvent) => {
                    this.imageElementHolder.src = readerEvent.target.result;
                };
                fileReaderInstance.readAsDataURL(primaryFile);
            } else {
                if (this.isDeveloperModeActive) console.warn('FileReader API not available.');
            }
        }

        Object.assign(this.mainContainerElement.style, {
            border: '1px solid #333',
            borderRadius: '0',
            boxShadow: 'none'
        });
        this.initialGuidanceMessage.style.display = 'none';

        domEvent.stopPropagation();
        domEvent.preventDefault();
        if (this.isDeveloperModeActive) console.log('Content successfully dropped.');
    }

    processContainerClick(mouseEvent) {
        const containerRect = this.mainContainerElement.getBoundingClientRect();
        const clickCoordinateX = mouseEvent.clientX - containerRect.left;
        const clickCoordinateY = mouseEvent.clientY - containerRect.top;

        const pixelDataArray = this.surface2dContext.getImageData(clickCoordinateX, clickCoordinateY, 1, 1).data;
        const [redComponent, greenComponent, blueComponent] = pixelDataArray;

        const currentHexValue = `#${this.convertRgbToHex(redComponent, greenComponent, blueComponent)}`;
        const { h, s, l } = this.convertRgbToHsl(redComponent, greenComponent, blueComponent);
        const currentHslString = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
        const invertedRgbComponents = this.getInvertedRgb(redComponent, greenComponent, blueComponent);
        const invertedHexValue = `#${this.convertRgbToHex(invertedRgbComponents.r, invertedRgbComponents.g, invertedRgbComponents.b)}`;

        const generateInputHtml = (idSuffix, labelText, valueContent, textColor) =>
            `${labelText}: <input type="text" id="${idSuffix}" class="${idSuffix}" style="color:${textColor};" onclick="this.select();" value="${valueContent}">`;

        [this.rgbOutputArea, this.hexadecimalOutputArea, this.hslOutputArea, this.invertedOutputArea].forEach(element => {
            element.style.color = invertedHexValue;
        });

        this.rgbOutputArea.innerHTML = generateInputHtml('rgbDisplay', 'rgb', `${redComponent},${greenComponent},${blueComponent}`, invertedHexValue);
        this.hexadecimalOutputArea.innerHTML = generateInputHtml('hexDisplay', 'hex', currentHexValue, invertedHexValue);
        this.hslOutputArea.innerHTML = generateInputHtml('hslDisplay', 'hsl', currentHslString, invertedHexValue);
        this.invertedOutputArea.innerHTML = generateInputHtml('invDisplay', 'inv', invertedHexValue, invertedHexValue);

        this.applicationIdentifierLogo.style.backgroundColor = currentHexValue;
        this.colorInformationPanel.style.backgroundColor = currentHexValue;
        this.colorInformationPanel.style.boxShadow = `inset 0 0 0 1px ${invertedHexValue}`;

        if (this.colorInformationPanel.style.top !== '-12px') {
            this.colorInformationPanel.style.top = '-12px';
        }

        if (this.isDeveloperModeActive) console.log('Canvas region interaction detected!');
    }

    // --- Auxiliary Color Transformation Functions ---
    convertRgbToHex(rVal, gVal, bVal) {
        if (rVal < 0 || rVal > 255 || gVal < 0 || gVal > 255 || bVal < 0 || bVal > 255) {
            throw new Error('Invalid color component specified.');
        }
        return ((1 << 24) + (rVal << 16) + (gVal << 8) + bVal).toString(16).slice(1).toUpperCase().padStart(6, '0');
    }

    convertRgbToHsl(rVal, gVal, bVal) {
        rVal /= 255;
        gVal /= 255;
        bVal /= 255;

        const maximum = Math.max(rVal, gVal, bVal);
        const minimum = Math.min(rVal, gVal, bVal);
        let hue, saturation, lightness = (maximum + minimum) / 2;

        if (maximum === minimum) {
            hue = saturation = 0; // Grayscale
        } else {
            const delta = maximum - minimum;
            saturation = lightness > 0.5 ? delta / (2 - maximum - minimum) : delta / (maximum + minimum);
            switch (maximum) {
                case rVal: hue = (gVal - bVal) / delta + (gVal < bVal ? 6 : 0); break;
                case gVal: hue = (bVal - rVal) / delta + 2; break;
                case bVal: hue = (rVal - gVal) / delta + 4; break;
            }
            hue /= 6;
        }

        return { h: hue * 360, s: saturation * 100, l: lightness * 100 };
    }

    getInvertedRgb(rVal, gVal, bVal) {
        return { r: 255 - rVal, g: 255 - gVal, b: 255 - bVal };
    }

    // --- Panel Behavior Function ---
    toggleInformationPanelPosition(actionEvent) {
        actionEvent.preventDefault();
        const currentPanelLeft = this.colorInformationPanel.offsetLeft;
        const panelDisplayWidth = this.colorInformationPanel.offsetWidth;
        const viewportWidth = this.globalWindowAccessor.innerWidth;

        const desiredLeftPosition = currentPanelLeft > 20
            ? 20
            : (viewportWidth - (panelDisplayWidth + 20));

        this.colorInformationPanel.style.left = `${desiredLeftPosition}px`;

        if (this.isDeveloperModeActive) console.log(`Info panel x-coord: ${this.colorInformationPanel.offsetLeft}`);
    }
}

// Immediately invoked function expression to create an instance of the application
(() => {
    new ColorSwatchApplication();
})();