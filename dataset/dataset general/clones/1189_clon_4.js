(function(widthDimension, heightDimension, lowerBounds, upperRanges) {
    const ensureFourComponents = (inputVal) => {
        const initial = Array.isArray(inputVal) ? inputVal : [inputVal];
        const padded = Array.from({ length: 4 }, (_, index) => {
            if (index < initial.length) {
                return initial[index];
            }
            if (index === 3) {
                return 255;
            }
            return initial[initial.length - 1] || 0;
        });
        return padded;
    };

    const constructPixelArray = (totalCount, lowVals, highRanges) => {
        const allChannels = Array.from({ length: totalCount }, () => {
            return Array.from({ length: 4 }, (_, chIndex) => {
                const range = highRanges[chIndex];
                const base = lowVals[chIndex];
                return range === 0
                    ? base
                    : Math.floor((Math.floor(Math.random() * 256) / 255) * range) + base;
            });
        }).flat();
        return new Uint8ClampedArray(allChannels);
    };

    const normalizedMin = ensureFourComponents(lowerBounds);
    const normalizedSpan = ensureFourComponents(upperRanges);

    const totalPixels = widthDimension * heightDimension;
    const rawPixelData = constructPixelArray(totalPixels, normalizedMin, normalizedSpan);

    const hostDocument = typeof window !== 'undefined' ? window.document : null;

    if (!hostDocument) {
        throw new Error("HTML document context required for image generation.");
    }

    const graphicSurface = hostDocument.createElement('canvas');
    graphicSurface.width = widthDimension;
    graphicSurface.height = heightDimension;

    const graphicContext = graphicSurface.getContext('2d');
    
    const finalImageContainer = new ImageData(rawPixelData, widthDimension, heightDimension);

    graphicContext.putImageData(finalImageContainer, 0, 0);

    return graphicSurface.toDataURL();
})