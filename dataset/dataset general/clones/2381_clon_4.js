(function() {

    function combineConfigurations(defaults, overrides) {
        const result = {};
        for (const key in defaults) {
            result[key] = defaults[key];
        }
        for (const key in overrides) {
            result[key] = overrides[key];
        }
        return result;
    }

    const standardSettings = {
        filterImageSource: undefined
    };

    function establishVisualScaler(containerElement, userSettings) {
        const currentSettings = combineConfigurations(standardSettings, userSettings);

        const mainWrapper = containerElement;
        const visualContent = mainWrapper.firstElementChild;
        let effectOverlay = null;

        if (!mainWrapper || !visualContent) {
            console.error("VisualScaler: Host container or its primary child (media element) is missing.");
            return;
        }

        const contentWidthNative = parseFloat(visualContent.dataset.initialWidth);
        const contentHeightNative = parseFloat(visualContent.dataset.initialHeight);

        if (isNaN(contentWidthNative) || isNaN(contentHeightNative) || contentWidthNative <= 0 || contentHeightNative <= 0) {
            console.error("VisualScaler: Media element requires valid 'data-initial-width' and 'data-initial-height' attributes.");
            return;
        }

        function prepareElementStyles() {
            mainWrapper.style.cssText = `
                display: block;
                overflow: hidden;
                margin: 0;
                padding: 0;
                position: relative;
            `;

            visualContent.style.cssText = `
                display: block;
                margin: 0;
                padding: 0;
                position: absolute;
                z-index: -10;
            `;

            if (currentSettings.filterImageSource !== undefined) {
                createEffectOverlay();
            }
        }

        function createEffectOverlay() {
            const overlayDiv = document.createElement("div");
            overlayDiv.style.cssText = `
                display: block;
                margin: 0;
                padding: 0;
                position: absolute;
                z-index: -5;
                background: url(${currentSettings.filterImageSource}) repeat-x left bottom;
            `;
            mainWrapper.appendChild(overlayDiv);
            effectOverlay = overlayDiv;
        }

        function adjustLayoutOnViewportChange() {
            const currentViewportWidth = window.innerWidth;
            const currentViewportHeight = window.innerHeight;

            mainWrapper.style.width = `${currentViewportWidth}px`;
            mainWrapper.style.height = `${currentViewportHeight}px`;

            if (effectOverlay) {
                effectOverlay.style.width = `${currentViewportWidth}px`;
                effectOverlay.style.height = `${currentViewportHeight}px`;
            }

            const viewportRatio = currentViewportWidth / currentViewportHeight;
            const contentRatio = contentWidthNative / contentHeightNative;

            let scaledWidth, scaledHeight;
            let horizontalOffset, verticalOffset;

            if (contentRatio > viewportRatio) {
                scaledHeight = currentViewportHeight;
                scaledWidth = contentWidthNative * (currentViewportHeight / contentHeightNative);
                horizontalOffset = -((scaledWidth - currentViewportWidth) / 2);
                verticalOffset = 0;
            } else {
                scaledWidth = currentViewportWidth;
                scaledHeight = contentHeightNative * (currentViewportWidth / contentWidthNative);
                horizontalOffset = 0;
                verticalOffset = -((scaledHeight - currentViewportHeight) / 2);
            }

            visualContent.style.width = `${scaledWidth}px`;
            visualContent.style.height = `${scaledHeight}px`;
            visualContent.style.left = `${horizontalOffset}px`;
            visualContent.style.top = `${verticalOffset}px`;
        }

        prepareElementStyles();
        adjustLayoutOnViewportChange();

        window.addEventListener('resize', adjustLayoutOnViewportChange);
    }

    window.responsiveMediaPresenter = function(domElement, customOptions) {
        if (!(domElement instanceof HTMLElement)) {
            console.error("responsiveMediaPresenter: Provided argument is not a valid HTMLElement.");
            return;
        }
        establishVisualScaler(domElement, customOptions);
    };

})();