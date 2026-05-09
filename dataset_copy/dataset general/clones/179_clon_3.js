$(function() {

    // Global configuration object for various image resolution tiers.
    // Each entry defines a specific image source and its corresponding media query boundaries.
    var assetBreakpoints = {
        'tiny': {
            'url': 'http://placehold.it/320x240', // The URL for the image asset at this resolution.
            'minWidthPx': null,                  // Minimum viewport width (in pixels) for this asset. Null if no lower bound.
            'maxWidthPx': 319                    // Maximum viewport width (in pixels) for this asset. Null if no upper bound.
        },
        'standard': {
            'url': 'http://placehold.it/640x460',
            'minWidthPx': 320,
            'maxWidthPx': 639
        },
        'expansive': {
            'url': 'http://placehold.it/800x600',
            'minWidthPx': 640,
            'maxWidthPx': null
        }
    };

    /**
     * Constructs a formatted string suitable for the responsive asset management plugin's data attribute.
     * This string encodes image sources and their associated media queries.
     * @returns {string} A comma-separated string of responsive image definitions.
     */
    function prepareResponsiveSourceString() {
        var responsiveImageDescriptors = []; // Accumulator for each image descriptor string.

        // Iterate through each resolution tier defined in assetBreakpoints.
        Object.keys(assetBreakpoints).forEach(function(sizeIdentifier) {
            var resolutionDetails = assetBreakpoints[sizeIdentifier]; // Get details for the current size.
            var mediaQueryConditions = []; // Array to build individual media query parts.

            // Append min-width condition if specified.
            if (resolutionDetails.minWidthPx !== null) {
                mediaQueryConditions.push(`min-width: ${resolutionDetails.minWidthPx}px`);
            }
            // Append max-width condition if specified.
            if (resolutionDetails.maxWidthPx !== null) {
                mediaQueryConditions.push(`max-width: ${resolutionDetails.maxWidthPx}px`);
            }

            var combinedQuery = mediaQueryConditions.join(' and '); // Join conditions with 'and'.
            // Construct the full descriptor string: [image_url, (media_query)].
            var formattedDescriptor = `[${resolutionDetails.url}, (${combinedQuery})]`;

            // Only add the descriptor if a valid URL and query were formed.
            if (resolutionDetails.url && combinedQuery) {
                responsiveImageDescriptors.push(formattedDescriptor);
            }
        });
        // Return the complete string, joining all descriptors with a comma.
        return responsiveImageDescriptors.join(', ');
    }

    // --- QUnit Test Framework Integration ---

    // An array to store custom-formatted records of failed assertions.
    var failedAssertionRecords = [];

    // Register a callback to execute after all QUnit tests have finished.
    QUnit.done(function(overallTestSummary) {
        var collectedFailureReports = [];

        // Only process if there are actual failures to report.
        if (failedAssertionRecords.length > 0) {
            // Iterate over the raw failure records and transform them.
            for (var currentIdx = 0; currentIdx < failedAssertionRecords.length; currentIdx++) {
                var failureDetail = failedAssertionRecords[currentIdx];
                collectedFailureReports.push({
                    testCaseName: failureDetail.testCaseName,       // Name of the test that failed.
                    assertionResult: failureDetail.assertionResult, // Should be false.
                    expectedValue: failureDetail.expectedValue,     // The value expected by the assertion.
                    actualValue: failureDetail.actualValue,         // The value received.
                    errorSourceFile: failureDetail.errorSourceFile  // Source file/line of the failed assertion.
                });
            }
        }
        // Attach the refined failure reports to the global test summary object.
        overallTestSummary.detailedFailures = collectedFailureReports;

        // Expose the comprehensive test summary to the global window object.
        window.applicationTestResultsSummary = overallTestSummary;
    });

    // Register a callback to execute at the beginning of each QUnit test.
    QUnit.testStart(function(testContext) {
        // Within each test, set up a listener for individual assertion logs.
        QUnit.log(function(assertionLogEntry) {
            // If an assertion has failed, record its details.
            if (!assertionLogEntry.result) {
                // Augment the log entry with the current test's name.
                assertionLogEntry.testCaseName = testContext.name;
                // Create a new object with renamed properties for clarity and consistency.
                var structuredFailureEntry = {
                    testCaseName: assertionLogEntry.testCaseName,
                    assertionResult: assertionLogEntry.result,
                    expectedValue: assertionLogEntry.expected,
                    actualValue: assertionLogEntry.actual,
                    errorSourceFile: assertionLogEntry.source
                };
                failedAssertionRecords.push(structuredFailureEntry); // Store the structured failure.
            }
        });
    });

    // --- QUnit Test Definitions for Responsive Image Plugin ---

    // Test 1: Verify static image loading for content at full viewport width.
    QUnit.test('static-image-full-viewport', function(assertionApi) {
        var targetElement = $('#test-static-full'); // Reference to the HTML container.
        var asyncCompletion = assertionApi.async(); // Handle for asynchronous test completion.

        targetElement.responsiveAssetManager({
            'onImageUpdated': function(updateEvent) {
                assertionApi.equal(
                    assetBreakpoints.expansive.url,
                    updateEvent.element.attr('src'),
                    'Static container at full width should load the expansive image source.'
                );
                asyncCompletion(); // Mark the asynchronous test as complete.
            }
        });
    });

    // Test 2: Verify static image loading for content at half viewport width.
    QUnit.test('static-image-half-viewport', function(assertionApi) {
        var targetElement = $('#test-static-half');
        var asyncCompletion = assertionApi.async();

        targetElement.responsiveAssetManager({
            'onImageUpdated': function(updateEvent) {
                assertionApi.equal(
                    assetBreakpoints.standard.url,
                    updateEvent.element.attr('src'),
                    'Static container at half width should load the standard image source.'
                );
                asyncCompletion();
            }
        });
    });

    // Test 3: Verify dynamic image loading for content at full viewport width.
    QUnit.test('dynamic-image-full-viewport', function(assertionApi) {
        var targetElement = $('#test-async-full');
        // Dynamically create an image element and append it, using the generated responsive data attribute.
        var newImageEl = $('<img>', {
            'data-responsive-assets': prepareResponsiveSourceString(),
            'alt': 'Full-width dynamic image' // Added alt attribute for accessibility and as a Type III change.
        }).appendTo(targetElement);
        var asyncCompletion = assertionApi.async();

        targetElement.responsiveAssetManager({
            'onImageUpdated': function(updateEvent) {
                assertionApi.equal(
                    assetBreakpoints.expansive.url,
                    updateEvent.element.attr('src'),
                    'Dynamically inserted image in full container should use expansive source.'
                );
                asyncCompletion();
            }
        });
    });

    // Test 4: Verify dynamic image loading for content at half viewport width.
    QUnit.test('dynamic-image-half-viewport', function(assertionApi) {
        var targetElement = $('#test-async-half');
        var newImageEl = $('<img>', {
            'data-responsive-assets': prepareResponsiveSourceString(),
            'alt': 'Half-width dynamic image' // Added alt attribute.
        }).appendTo(targetElement);
        var asyncCompletion = assertionApi.async();

        targetElement.responsiveAssetManager({
            'onImageUpdated': function(updateEvent) {
                assertionApi.equal(
                    assetBreakpoints.standard.url,
                    updateEvent.element.attr('src'),
                    'Dynamically inserted image in half container should use standard source.'
                );
                asyncCompletion();
            }
        });
    });

    // Test 5: Verify image source changes correctly when the container is resized.
    QUnit.test('responsive-resize-behavior', function(assertionApi) {
        var targetElement = $('#test-static-resize');

        // Three asynchronous completion handles for the three resize steps.
        var largeSizeCheckDone = assertionApi.async();
        var mediumSizeCheckDone = assertionApi.async();
        var smallSizeCheckDone = assertionApi.async();

        // Initial state: Set container to a width that should trigger the smallest image.
        targetElement.width(200);

        targetElement.responsiveAssetManager({
            'onImageUpdated': function(updateEvent) {
                var currentContainerDimension = targetElement.width();
                var currentImageSourceUrl = updateEvent.element.attr('src');

                // Log current state for debugging purposes.
                console.info(`Responsive test: Container width: ${currentContainerDimension}px, Image URL: ${currentImageSourceUrl}`);

                // Conditional logic to assert and trigger the next resize step.
                if (currentContainerDimension === 200) {
                    assertionApi.equal(assetBreakpoints.tiny.url, currentImageSourceUrl, 'Smallest image expected when container is 200px wide.');
                    smallSizeCheckDone();
                    // Transition to the next size: medium.
                    targetElement.width(500);
                    // Explicitly trigger the plugin's reflow mechanism after manual resize.
                    $.responsiveAssetManager.reflow();
                } else if (currentContainerDimension === 500) {
                    assertionApi.equal(assetBreakpoints.standard.url, currentImageSourceUrl, 'Standard image expected when container is 500px wide.');
                    mediumSizeCheckDone();
                    // Transition to the final size: large.
                    targetElement.width(700);
                    $.responsiveAssetManager.reflow();
                } else if (currentContainerDimension === 700) {
                    assertionApi.equal(assetBreakpoints.expansive.url, currentImageSourceUrl, 'Expansive image expected when container is 700px wide.');
                    largeSizeCheckDone();
                } else {
                    // Guard clause for unexpected container dimensions.
                    assertionApi.ok(false, `Unexpected container dimension encountered during resize test: ${currentContainerDimension}px.`);
                    // Ensure all async handles are called even if an unexpected state occurs.
                    smallSizeCheckDone();
                    mediumSizeCheckDone();
                    largeSizeCheckDone();
                }
            }
        });
    });

    // Test 6: Verify the ability to prevent the default image source change.
    QUnit.test('prevent-default-image-update-action', function(assertionApi) {
        var targetElement = $('#test-prevent-default');
        var asyncCompletion = assertionApi.async();

        targetElement.responsiveAssetManager({
            // The 'onImageChangeAttempt' callback is invoked before the image source is modified.
            'onImageChangeAttempt': function(changeAttemptEvent) {
                // Calling preventDefault() here should stop the plugin from updating the image.
                changeAttemptEvent.preventDefault();
            },
            // The 'onImageUpdated' callback is invoked after the plugin's update cycle completes (or is prevented).
            'onImageUpdated': function(updateEvent) {
                // Assert that the image source remains its original value due to preventDefault.
                assertionApi.equal(
                    'http://placehold.it/50x50',
                    updateEvent.element.attr('src'),
                    'Image source should not change because preventDefault was called.'
                );
                asyncCompletion();
            }
        });
    });

    // Initiate the execution of all defined QUnit tests.
    QUnit.start();

});