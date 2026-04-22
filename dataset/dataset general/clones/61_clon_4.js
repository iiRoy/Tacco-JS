class VisualDisplayModule {
    #containerNode;
    #displayImageNode;
    #captureControlNode;
    #currentResourceURL;

    constructor(configurationInput) {
        const defaultSettings = {
            visualHeight: 120,
            minimumHeight: 100,
            flowStyle: 'hidden',
            initialPicture: ''
        };
        this.options = { ...defaultSettings, ...configurationInput };

        this.#initializeStructure();
        this.#applyVisualSettings();
        this.#registerInteractions();

        if (this.options.initialPicture) {
            this.updateDisplayResource(this.options.initialPicture);
        }
    }

    #initializeStructure() {
        this.#containerNode = document.createElement('div');
        this.#displayImageNode = document.createElement('img');
        this.#captureControlNode = document.createElement('button');

        this.#captureControlNode.textContent = '+'; // Represents the 'add' icon

        this.#containerNode.appendChild(this.#displayImageNode);
        this.#containerNode.appendChild(this.#captureControlNode);
    }

    #applyVisualSettings() {
        // Container styling (mimicking height, minHeight, overflow, layout: vbox, align: center)
        Object.assign(this.#containerNode.style, {
            height: `${this.options.visualHeight}px`,
            minHeight: `${this.options.minimumHeight}px`,
            overflow: this.options.flowStyle,
            position: 'relative', // Enables absolute positioning for child elements
            display: 'flex',
            flexDirection: 'column', // Equivalent to vbox
            alignItems: 'center',     // Equivalent to align: center
            justifyContent: 'center', // Centers content vertically too
            width: 'auto'
        });

        // Image styling (mimicking tpl width="160")
        Object.assign(this.#displayImageNode.style, {
            width: '160px',
            height: 'auto', // Let height adjust proportionally
            objectFit: 'contain' // Ensures image fits without stretching
        });

        // Button styling (mimicking bottom: 5, right: 5)
        Object.assign(this.#captureControlNode.style, {
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            zIndex: '10' // Ensure button is visible above image
        });
    }

    #registerInteractions() {
        this.#captureControlNode.addEventListener('click', this.#initiateResourceAcquisition.bind(this));
    }

    #initiateResourceAcquisition() {
        // This section assumes a global service 'GlobalPhotoAcquisitionService'
        // exists and provides an 'acquirePhoto' method, similar to Ext.device.Camera.
        if (typeof GlobalPhotoAcquisitionService !== 'undefined' && typeof GlobalPhotoAcquisitionService.acquirePhoto === 'function') {
            GlobalPhotoAcquisitionService.acquirePhoto({
                source: 'camera',
                target: 'file',
                success: (acquiredURL) => {
                    this.updateDisplayResource(acquiredURL);
                    this.#dispatchResourceChangeEvent(acquiredURL);
                },
                failure: () => {
                    window.alert('Acquisition Problem', 'Failed to retrieve image data.'); // Equivalent to Ext.Msg.alert
                }
            });
        } else {
            console.warn('GlobalPhotoAcquisitionService not found or acquirePhoto method missing. Cannot capture image.');
            // Fallback for development/testing if service is unavailable
            const mockUrl = `https://picsum.photos/160/120?random=${Math.random()}`;
            this.updateDisplayResource(mockUrl);
            this.#dispatchResourceChangeEvent(mockUrl);
        }
    }

    #dispatchResourceChangeEvent(acquiredURL) {
        const eventData = {
            detail: {
                sourceComponent: this,
                resourcePath: acquiredURL
            },
            bubbles: true,
            composed: true
        };
        const customEvent = new CustomEvent('resourceUpdated', eventData);
        this.#containerNode.dispatchEvent(customEvent);
    }

    updateDisplayResource(path) {
        if (path) {
            this.#displayImageNode.src = path;
            this.#currentResourceURL = path;
        }
    }

    getVisualElement() {
        return this.#containerNode;
    }

    getCurrentResourceURL() {
        return this.#currentResourceURL;
    }
}