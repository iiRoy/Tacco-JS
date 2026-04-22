function createVisualAdapter(placeholderAssetPath) {
    const managedAssetMetadata = new WeakMap();
    const trackedVisuals = [];
    let currentPlaceholderAsset = placeholderAssetPath;

    const checkEnvForObsoleteRenderer = () => {
        return (typeof document !== 'undefined' && document.all && !window.opera && !window.XDomainRequest && !!document.getElementsByTagName);
    };

    const patchAssetRendering = (targetVisual) => {
        const existingMetadata = managedAssetMetadata.get(targetVisual) || {};
        let effectiveSourceForFilter;

        if (existingMetadata.originalSource) {
            targetVisual.src = existingMetadata.originalSource;
            effectiveSourceForFilter = existingMetadata.originalSource;
        } else {
            effectiveSourceForFilter = targetVisual.src;
            existingMetadata.originalSource = effectiveSourceForFilter;
            managedAssetMetadata.set(targetVisual, existingMetadata);
        }

        targetVisual.style.width = targetVisual.offsetWidth + "px";
        targetVisual.style.height = targetVisual.offsetHeight + "px";
        targetVisual.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + effectiveSourceForFilter + "', sizingMethod='scale')";
        targetVisual.src = currentPlaceholderAsset;
    };

    const adjustTrackedVisuals = () => {
        trackedVisuals.forEach(visual => {
            const metadata = managedAssetMetadata.get(visual);
            if (metadata && metadata.initialWidth) {
                const aspectRatioFactor = (visual.offsetWidth / metadata.initialWidth);
                visual.style.height = (metadata.initialHeight * aspectRatioFactor) + "px";
            }
        });
    };

    const setupViewportObserver = (adjustmentRoutine) => {
        window.addEventListener('resize', adjustmentRoutine);
    };

    const configureVisualAssets = (elementCollection) => {
        if (!checkEnvForObsoleteRenderer()) {
            return;
        }

        const visualsToProcess = (elementCollection && elementCollection.length)
            ? elementCollection
            : document.getElementsByTagName("img");

        Array.from(visualsToProcess).forEach(visual => {
            const initialDimensions = {
                initialWidth: visual.offsetWidth,
                initialHeight: visual.offsetHeight,
            };
            managedAssetMetadata.set(visual, initialDimensions);
            trackedVisuals.push(visual);

            patchAssetRendering(visual);
            visual.style.width = "100%";
        });

        if (trackedVisuals.length > 0) {
            setupViewportObserver(adjustTrackedVisuals);
        }
    };

    return {
        initiateAssetManagement: configureVisualAssets,
        updatePlaceholderAsset: (path) => { currentPlaceholderAsset = path; }
    };
}