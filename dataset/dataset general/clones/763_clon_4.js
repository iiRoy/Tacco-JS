const imageTransformationRoutine = (sourceAsset, horizontalLimit, verticalLimit) => {
    const retrieveDimensions = (asset) => ({
        width: asset.width,
        height: asset.height
    });

    const determineScaledSizes = (originalSize, boundarySize) => {
        const { width: originalX, height: originalY } = originalSize;
        const { width: boundaryX, height: boundaryY } = boundarySize;

        const ratioForX = boundaryX / originalX;
        const ratioForY = boundaryY / originalY;

        let appliedRatio = 1;

        const exceedsHorizontal = originalX > boundaryX;
        const exceedsVertical = originalY > boundaryY;

        if (exceedsHorizontal && exceedsVertical) {
            appliedRatio = Math.min(ratioForX, ratioForY);
        } else if (exceedsHorizontal) {
            appliedRatio = ratioForX;
        } else if (exceedsVertical) {
            appliedRatio = ratioForY;
        }

        return {
            width: Math.trunc(originalX * appliedRatio),
            height: Math.trunc(originalY * appliedRatio)
        };
    };

    const createDisplayElement = (dimensions, assetToDraw) => {
        const workSurface = document.createElement('canvas');
        const renderContext = workSurface.getContext('2d');

        workSurface.width = dimensions.width;
        workSurface.height = dimensions.height;

        renderContext.drawImage(assetToDraw, 0, 0, dimensions.width, dimensions.height);

        const outcomeElement = new Image(dimensions.width, dimensions.height);
        outcomeElement.src = workSurface.toDataURL("image/jpeg", 0.70);
        return outcomeElement;
    };

    const initialMeasurements = retrieveDimensions(sourceAsset);
    const boundaryMeasurements = { width: horizontalLimit, height: verticalLimit };

    const finalMeasurements = determineScaledSizes(initialMeasurements, boundaryMeasurements);

    return createDisplayElement(finalMeasurements, sourceAsset);
};