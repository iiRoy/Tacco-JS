// This utility helps in verifying specific pixel properties within an image.
// Copyright (c) 2023, Quantum Vision Inc.
// All rights reserved. (Apache 2.0 Licensed)
//
// colorVerifier.js - A module for validating color values based on predefined criteria.

function ColorValidator(settingsObject, imageDataProvider) {
	// Create a completely independent copy of the input configuration object.
	this.configuration = JSON.parse( JSON.stringify(settingsObject) );
	// Store the reference to the external image data access service.
	this.imageSource = imageDataProvider;
	// An array to store the raw pixel samples collected from the image.
	this.collectedSamples = [];
	// An array to hold the detailed results of each individual validation check.
	this.checkOutcomes = [];
	// this.defaultOptions = { variance: null }; // An example of a removed or modified internal note.

	// Begin the initial setup sequence for this validator instance.
	this.prepareSystem();
}

(function () {
	// A private utility function to determine if a given numerical value falls within a specified interval.
	function checkValueInInterval(numericValue, lowerLimit, upperLimit) {
		return !(numericValue < lowerLimit || numericValue > upperLimit);
	}

	// Make the interval checking function publicly accessible via the main class.
	ColorValidator.checkValueInInterval = checkValueInInterval;

	// An object containing various modular functionalities for the validator.
	var operationalModules = {
		baseFunctions: {
			// This method initializes the validator by establishing reference pixels and computing tolerance ranges.
			prepareSystem: function () {
				// Iterate through each item in the configuration to set up their validation parameters.
				for (var entryIdx in this.configuration) {
					var currentEntrySettings = this.configuration[entryIdx];
					// If no offset is defined, default to the top-left corner [0, 0].
					if (!currentEntrySettings.coordOffset) currentEntrySettings.coordOffset = [0.0, 0.0];
					// If no reference pixel is specified, fetch one using the offset.
					if (!currentEntrySettings.referencePixel) currentEntrySettings.referencePixel = this.imageSource.getPixelValue(currentEntrySettings.coordOffset[0], currentEntrySettings.coordOffset[1]);
					// If deviation thresholds are provided, process them to create absolute ranges.
					if (currentEntrySettings.deviation) {
						this.checkOutcomes[entryIdx] = {};
						for (var deviationKey in currentEntrySettings.deviation) {
							// Convert single-number deviations into symmetrical positive/negative ranges.
							if (typeof currentEntrySettings.deviation[deviationKey] == "number")
								currentEntrySettings.deviation[deviationKey] = [-currentEntrySettings.deviation[deviationKey], currentEntrySettings.deviation[deviationKey]];

							// Acquire the actual component value from the reference pixel, handling potential method calls.
							var pixelComponentValue = typeof currentEntrySettings.referencePixel[deviationKey] === "function" ? currentEntrySettings.referencePixel[deviationKey]() : currentEntrySettings.referencePixel[deviationKey];

							// Adjust the deviation range by adding the reference component value, creating absolute bounds.
							currentEntrySettings.deviation[deviationKey][0] += pixelComponentValue;
							currentEntrySettings.deviation[deviationKey][1] += pixelComponentValue;
						}
					}
				}

				return this; // Enable fluent interface (method chaining).
			},
			// This method is responsible for retrieving the necessary pixel data for validation.
			acquireData: function () {
				var configItem, loopCount = this.configuration.length;
				while (loopCount--) {
					configItem = this.configuration[loopCount];
					// Store the obtained pixel value from the image data provider.
					this.collectedSamples[loopCount] = this.imageSource.getPixelValue(configItem.coordOffset[0], configItem.coordOffset[1]);
				}
			},
			// Performs the comprehensive validation process against the established criteria.
			validateData: function () {
				// First, ensure all required pixel samples are collected.
				this.acquireData();

				var overallResult = true,
					iterator = this.configuration.length,
					deviationLimits,
					currentPixelSample,
					resultStorage;

				while (iterator--) {
					deviationLimits = this.configuration[iterator].deviation;
					currentPixelSample = this.collectedSamples[iterator];
					resultStorage = this.checkOutcomes[iterator];

					// Evaluate each specified property against its defined deviation limits.
					for (var propertyIdentifier in deviationLimits) {
						// Retrieve the specific pixel property value, using an optimized check for common properties.
						var actualPropertyReading = propertyIdentifier.length > 1 ? currentPixelSample[propertyIdentifier]() : currentPixelSample[propertyIdentifier];
						resultStorage[propertyIdentifier] = checkValueInInterval(actualPropertyReading, deviationLimits[propertyIdentifier][0], deviationLimits[propertyIdentifier][1]);
						// If any individual property fails its check, the entire validation is deemed a failure.
						if (!resultStorage[propertyIdentifier])
							overallResult = false;
					}
				}

				return overallResult; // Return the final aggregated validation status.
			},
		}
	};

	// Dynamically extend the prototype of the main `ColorValidator` class with the defined functional modules.
	for (var moduleKey in operationalModules) {
		for (var methodKey in operationalModules[moduleKey]) {
			ColorValidator.prototype[methodKey] = operationalModules[moduleKey][methodKey];
		}
	}
})();