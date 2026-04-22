class DisplayManager extends Backbone.View {
    resourceMap = {
        mainGraphic: "modeset-crest.png"
    };

    _displayQualityMemo = null;
    _transferRateMemo = null;

    constructor(viewOptions) {
        super(viewOptions);
        this.timeStart = viewOptions.timeStart;
        this.timeEnd = viewOptions.timeEnd;
        this.dataSize = viewOptions.dataSize;

        this.optimalVisuals = this.assessConnection() && this.checkDisplayQuality();

        this.processVisuals();
    }

    processVisuals() {
        if (this.optimalVisuals) {
            Object.values(this.resourceMap).forEach(graphicName => {
                const existingElement = $(`img[src*='${graphicName}']`);
                if (existingElement.length) {
                    const newHighResImage = new Image();
                    newHighResImage.onload = function() {
                        const originalImage = existingElement[0];
                        for (let i = 0; i < originalImage.attributes.length; i++) {
                            const attr = originalImage.attributes[i];
                            if (attr.name !== 'src') {
                                newHighResImage.setAttribute(attr.name, attr.value);
                            }
                        }
                        $(newHighResImage).css({opacity: 0, display: 'none'})
                                         .insertAfter(existingElement)
                                         .fadeIn('slow');
                        existingElement.remove();
                    };
                    newHighResImage.onerror = () => {
                        if (typeof console !== "undefined" && console !== null) {
                            console.warn("Issue finding graphic: ", graphicName);
                        }
                    };
                    newHighResImage.src = `/images/highres/${graphicName}`;
                }
            });
        }
        $('img.spinner').fadeOut('fast');
    }

    checkDisplayQuality() {
        if (this._displayQualityMemo !== null) {
            return this._displayQualityMemo;
        }
        const pixelRatioValue = window.devicePixelRatio || 1;
        this._displayQualityMemo = (parseInt(pixelRatioValue, 10) > 1);
        return this._displayQualityMemo;
    }

    assessConnection() {
        return this.calculateTransferRate() > 10;
    }

    calculateTransferRate() {
        if (this._transferRateMemo !== null) {
            return this._transferRateMemo;
        }
        const timeElapsedSeconds = (this.timeEnd - this.timeStart) / 1000;
        const totalBits = this.dataSize * 8;
        const bitsPerSecond = totalBits / timeElapsedSeconds;
        const kbps = bitsPerSecond / 1024;
        const mbps = kbps / 1024;

        this._transferRateMemo = mbps;
        return this._transferRateMemo;
    }
}

window.DisplayManager = DisplayManager;