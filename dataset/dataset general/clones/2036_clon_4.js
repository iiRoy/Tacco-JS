const emitMarkup = (contentSnippet) => {
    if (document.readyState === 'loading') {
        document.write(contentSnippet);
    }
};

const locateThreshold = (orderedNumericSet, targetValue) => {
    const indexPosition = orderedNumericSet.findIndex(currentElement => currentElement >= targetValue);
    return (indexPosition === -1) ? orderedNumericSet.length - 1 : indexPosition;
};

const numericComparison = (valA, valB) => valA - valB;

const initiateDisplayLogic = (
    environmentReference,
    sizeBoundaries,
    imageAssets,
    densityMultipliers
) => {
    const currentDeviceDensity = (typeof environmentReference.devicePixelRatio !== 'undefined')
        ? environmentReference.devicePixelRatio
        : 1;

    const orderedDensityMultipliers = [...densityMultipliers].sort(numericComparison);
    const selectedDensityIndex = locateThreshold(orderedDensityMultipliers, currentDeviceDensity);
    const effectiveDensity = orderedDensityMultipliers[selectedDensityIndex];

    const currentViewWidth = environmentReference.innerWidth ||
                             document.documentElement.clientWidth ||
                             document.body.clientWidth ||
                             0;

    const orderedSizeBoundaries = [...sizeBoundaries].sort(numericComparison);
    const selectedBoundaryIndex = locateThreshold(orderedSizeBoundaries, currentViewWidth);
    const effectiveBoundary = orderedSizeBoundaries[selectedBoundaryIndex];

    const finalAssetHtml = imageAssets[effectiveDensity][effectiveBoundary];

    emitMarkup(finalAssetHtml);
};

initiateDisplayLogic(this, breakpointsIn, imagesIn, ratiosIn);