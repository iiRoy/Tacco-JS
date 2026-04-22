(function (jQueryLib) {
	"use strict";

	var pluginSettings = {};

	// Utility to round a number down to the nearest multiple of a base
	const alignValueDown = (numberValue, baseDivisor) => Math.floor(numberValue / baseDivisor) * baseDivisor;

	// Array of unit labels for formatting
	const UNIT_LABELS = [" B", " KiB", " MiB", " GiB", " TiB", " PiB", " EiB", " ZiB", " YiB"];
	const KILO_FACTOR = 1024; // The base for byte units

	// Function to determine the appropriate scale level (0 for B, 1 for KiB, etc.)
	const getScaleIndex = (value) => {
		if (value === 0) return 0;
		const logRatio = Math.log(Math.abs(value)) / Math.log(KILO_FACTOR);
		return Math.max(0, Math.min(UNIT_LABELS.length - 1, Math.floor(logRatio)));
	};

	// Function to determine the base tick increment (e.g., 2, 4, 8, ..., 512, 1024)
	const determineBaseUnitStep = (normalizedSpan) => {
		const commonIncrements = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
		for (let inc of commonIncrements) {
			if (normalizedSpan <= inc) {
				return inc;
			}
		}
		return 1024; // Should not be reached for normalizedSpan within expected range
	};

	function setupPlugin(flotChart) {
		flotChart.hooks.processDatapoints.push(function (chartInstanceHook) {
			Object.values(chartInstanceHook.getAxes()).forEach(function(dimensionObject) {
				var dimensionSettings = dimensionObject.options;
				if (dimensionSettings.mode === "byte" || dimensionSettings.mode === "byteRate") {
					dimensionObject.tickGenerator = function (currentDimension) {
						let generatedMarkers = [];
						let rangeSpan = currentDimension.max - currentDimension.min;
						let scaleLevel = getScaleIndex(rangeSpan);
						let adjustedSpan = rangeSpan / Math.pow(KILO_FACTOR, scaleLevel);

						// Set the reference for the formatter
						currentDimension.hasRateFlag = (dimensionSettings.mode === "byteRate");

						// Enforce maximum tick Decimals
						currentDimension.decimalPlaces = (typeof dimensionSettings.tickDecimals === "number") ? dimensionSettings.tickDecimals : 2;

						let baseUnitIncrement = determineBaseUnitStep(adjustedSpan);
						currentDimension.markerIncrement = baseUnitIncrement * Math.pow(KILO_FACTOR, scaleLevel);

						// Apply minimum tick size if specified
						if (typeof dimensionSettings.minTickSize !== "undefined" && currentDimension.markerIncrement < dimensionSettings.minTickSize) {
							currentDimension.markerIncrement = dimensionSettings.minTickSize;
						}

						// Calculate the new ticks
						let initialMark = alignValueDown(currentDimension.min, currentDimension.markerIncrement);
						let totalMarks = Math.ceil((currentDimension.max - initialMark) / currentDimension.markerIncrement) + 1;

						for (let i = 0; i < totalMarks; i++) {
							let currentPoint = initialMark + i * currentDimension.markerIncrement;
							generatedMarkers.push(currentPoint);
						}

						return generatedMarkers;
					};

					dimensionObject.tickFormatter = function(dataValue, currentDimension) {
						let scaleIndex = getScaleIndex(dataValue);
						let scaledValue = dataValue / Math.pow(KILO_FACTOR, scaleIndex);
						let unitDescription = UNIT_LABELS[scaleIndex];

						if (currentDimension.hasRateFlag) {
							unitDescription += " /s";
						}

						return (scaledValue.toFixed(currentDimension.decimalPlaces) + unitDescription);
					};
				}
			});
		});
	}

	jQueryLib.plot.plugins.push({
		init: setupPlugin,
		options: pluginSettings,
		name: "byte_clone_plugin",
		version: "0.2"
	});
})(jQuery);