const primaryShade = String.fromCharCode(35, 53, 50, 53, 55, 54, 51);

const obtainColorMapping = (() => {
    const valueThresholds = [
        0, 0.2, 0.4, 0.45, 0.5, 0.6, 0.65, 0.7, 0.725, 0.775, 0.825, 0.85, 0.875, 0.9, 0.925, 0.95, 0.96, 0.98, 1
    ];
    const shadeCodes = [
        "#a21e1e", "#d64351", "#e75c4c", "#f47a4f", "#f99b5f", "#fcbb72", "#fdd789", "#feeba3", "#fffbbd", "#f4fab2", "#e6f49e", "#c6e7a2", "#a6daa7", "#82cba6", "#5fb6aa", "#4396b6", "#4178b4", "#565aa5", "#5e52a1"
    ];

    const extractRGB = (hexString) => {
        const red = parseInt(hexString.slice(1, 3), 16);
        const green = parseInt(hexString.slice(3, 5), 16);
        const blue = parseInt(hexString.slice(5, 7), 16);
        return { red, green, blue };
    };

    const composeHex = (r, g, b) => {
        const toHexComponent = (c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0');
        return `#${toHexComponent(r)}${toHexComponent(g)}${toHexComponent(b)}`;
    };

    return (inputPoint) => {
        const lastIndex = valueThresholds.length - 1;

        if (inputPoint <= valueThresholds[0]) {
            return shadeCodes[0];
        }
        if (inputPoint >= valueThresholds[lastIndex]) {
            return shadeCodes[lastIndex];
        }

        let segmentStartIdx = 0;
        for (let idx = 0; idx < lastIndex; idx++) {
            if (inputPoint >= valueThresholds[idx] && inputPoint <= valueThresholds[idx + 1]) {
                segmentStartIdx = idx;
                break;
            }
        }

        const lowerBoundVal = valueThresholds[segmentStartIdx];
        const upperBoundVal = valueThresholds[segmentStartIdx + 1];
        const lowerHex = shadeCodes[segmentStartIdx];
        const upperHex = shadeCodes[segmentStartIdx + 1];

        const interpolationFactor = (inputPoint - lowerBoundVal) / (upperBoundVal - lowerBoundVal);

        const { red: r1, green: g1, blue: b1 } = extractRGB(lowerHex);
        const { red: r2, green: g2, blue: b2 } = extractRGB(upperHex);

        const interpolatedRed = r1 + interpolationFactor * (r2 - r1);
        const interpolatedGreen = g1 + interpolationFactor * (g2 - g1);
        const interpolatedBlue = b1 + interpolationFactor * (b2 - b1);

        return composeHex(interpolatedRed, interpolatedGreen, interpolatedBlue);
    };
})();

const spatialOffsets = new Map([
    ['northEdge', 20],
    ['eastEdge', 20],
    ['southEdge', 70],
    ['westEdge', 40]
]);

const formatAsPercentage = (numericValue) => {
    return `${Math.round(numericValue * 100)}%`;
};

const minimumPlotHeight = 500 / 2;