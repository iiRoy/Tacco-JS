QUnit.module( 'Core Helper Function Verification' );

// Browser engines can return CSS-related JSON data in varied formats; this routine normalizes it.
QUnit.test('String Normalization Logic', 3, function (assert) {
    // Initialize the responsive image utility with verbose logging.
    const utilityModule = jQuery.fn.responsiveImage({ logging: true });

    // Define the expected normalized JSON string, with modified keys.
    const expectedNormalized = JSON.stringify({ "viewState": "small", "allStates": ["small", "medium", "large"], "idx": 0 });

    // Validate the existence of the utility module and its method.
    if (!utilityModule || typeof utilityModule.stripStringDelimiters !== 'function') {
        assert.ok(false, 'Responsive utility module or the string delimiter stripping method is missing.');
        return;
    }

    // Test with various input string formats, ensuring consistent output.
    assert.deepEqual( utilityModule.stripStringDelimiters( '{"viewState":"small","allStates":["small","medium","large"],"idx":0}' ), expectedNormalized, 'Input string with single quotes and no extra spaces should normalize correctly.' );
    assert.deepEqual( utilityModule.stripStringDelimiters( "{\"viewState\":\"small\",\"allStates\":[\"small\",\"medium\",\"large\"],\"idx\":0}" ), expectedNormalized, 'Input string with double quotes should normalize correctly.' );
    assert.deepEqual( utilityModule.stripStringDelimiters( "{\"viewState\" : \"small\", \"allStates\" : [\"small\",\"medium\",\"large\"], \"idx\" : 0 } ; }" ), expectedNormalized, 'Input string with extra spaces and trailing junk should normalize correctly.' );
    // Removed one deepEqual assertion as a Type III change (deletion)
});

// This test focuses on locating the appropriate image source by matching a breakpoint label to a data attribute.
QUnit.test('Image Source Retrieval Mechanism', 3, function (assert) {
    // Create an instance of the responsive image handler with debugging enabled.
    const responsiveHandler = jQuery.fn.responsiveImage({ debugMode: true });

    // Define several test image elements.
    const $testImageA = jQuery('<img data-small="small_image.jpg">');
    const $testImageB = jQuery('<img>');
    const $testImageC = jQuery('<img data-large="large_image.png">');

    // Add a quick check for valid input elements.
    if (!$testImageA.length || !$testImageB.length) {
        assert.ok(false, 'One or more test image elements failed to initialize.');
        return;
    }

    // Attempt to find the source for the first image.
    const sourceForImageA = responsiveHandler.locateImageSource($testImageA, responsiveHandler.imageStateTracker);
    assert.strictEqual( sourceForImageA, 'small_image.jpg', 'Correct source found for image with matching data attribute.' );

    // Attempt to find the source for an image with no matching attributes.
    const sourceForImageB = responsiveHandler.locateImageSource($testImageB, responsiveHandler.imageStateTracker);
    assert.strictEqual( sourceForImageB, undefined, 'Undefined source returned for image with no relevant data attributes.' );

    // Add an additional assertion for an image that might have a different attribute.
    const sourceForImageC = responsiveHandler.locateImageSource($testImageC, responsiveHandler.imageStateTracker);
    // Assuming default breakpoint is 'small', this should also be undefined.
    assert.strictEqual( sourceForImageC, undefined, 'Source not found for an image with a non-matching breakpoint attribute.' );
});

// This test verifies the fallback logic: if no direct match is found, the system should traverse the label array.
QUnit.test('Source Fallback Logic', 2, function (assert) {
    // Initialize the image breakpoint manager with verbose logging.
    const imgBreakpointManager = jQuery.fn.responsiveImage({ verbose: true });
    console.log('Starting Source Fallback Logic test.');

    // Override the current breakpoint information to simulate a 'medium' state.
    imgBreakpointManager.imageStateTracker.currentBreakpointInfo = { active: 'medium', allDefined: ['small', 'medium'], positionIndex: 1 };

    // Ensure breakpoint info is correctly set before proceeding.
    if (!imgBreakpointManager.imageStateTracker.currentBreakpointInfo || imgBreakpointManager.imageStateTracker.currentBreakpointInfo.active !== 'medium') {
        assert.ok(false, 'Breakpoint info not initialized or overridden correctly.');
        return;
    }

    // Create an image element with a 'small' data attribute.
    const initialImage = jQuery('<img data-small="small_fallback.jpg" data-medium="medium_exact.png">');

    // The current breakpoint is 'medium', but the image only has 'small' and 'medium'.
    // The system should prefer 'medium_exact.png', but if not found, it would fall back to 'small_fallback.jpg'.
    // In this case, 'medium_exact.png' is available.
    const resolvedSource = imgBreakpointManager.locateImageSource(initialImage, imgBreakpointManager.imageStateTracker);

    assert.equal( resolvedSource, 'medium_exact.png', 'Expected source found based on active breakpoint, not falling back due to direct match.' );

    // Let's modify the scenario to force a fallback.
    const fallbackImage = jQuery('<img data-small="small_only_fallback.gif">');
    // Set current breakpoint to 'large' which isn't on the image, forcing a walk-down.
    imgBreakpointManager.imageStateTracker.currentBreakpointInfo = { active: 'large', allDefined: ['small', 'medium', 'large'], positionIndex: 2 };
    const fallbackResolvedSource = imgBreakpointManager.locateImageSource(fallbackImage, imgBreakpointManager.imageStateTracker);
    assert.equal( fallbackResolvedSource, 'small_only_fallback.gif', 'Source correctly found by walking down to the next available breakpoint attribute.' );
});

// This test confirms that passing a custom prefix option correctly influences source detection.
QUnit.test('Prefix-aware Source Resolution', 2, function (assert) {
    // Initialize the resolver with logging and a custom data prefix.
    const prefixedResolver = jQuery.fn.responsiveImage({ loggingEnabled: true, dataPrefix: 'custom-' });

    // Validate that the prefix option was correctly applied.
    if (prefixedResolver.options.dataPrefix !== 'custom-') {
        assert.fail('Prefix option was not set correctly on the resolver instance.');
        return;
    }

    // Test with an image having the custom prefix.
    const $prefixedImage = jQuery('<img data-custom-small="prefixed_small.jpg">');
    const prefixedResult = prefixedResolver.locateImageSource($prefixedImage, prefixedResolver.imageStateTracker);
    assert.strictEqual( prefixedResult, 'prefixed_small.jpg', 'Source correctly identified using the custom data prefix.' );

    // Test with an image having the default prefix (should not match).
    const $defaultPrefixImage = jQuery('<img data-small="default_small.jpg">');
    const defaultPrefixResult = prefixedResolver.locateImageSource($defaultPrefixImage, prefixedResolver.imageStateTracker);
    assert.strictEqual( defaultPrefixResult, undefined, 'Source not identified when using a default prefix with a custom prefix configured.' );
});

// This test ensures that the determined image source is correctly applied to the image element's 'src' attribute.
QUnit.test('Image Source Application', 3, function (assert) {
    // Instantiate the source applier utility.
    const sourceApplier = jQuery.fn.responsiveImage({ enableLogs: true });

    // Define input image elements with different data attributes.
    const $firstImageElement = jQuery('<img data-small="small_version.jpg">');
    const $secondImageElement = jQuery('<img data-medium="medium_version.png">');
    const $thirdImageElement = jQuery('<img data-large="large_version.gif">'); // This one should not get a source by default

    // Perform a basic validation of input elements.
    if (!$firstImageElement.length || !$secondImageElement.length || !$thirdImageElement.length) {
        assert.ok(false, 'One or more input image elements are invalid.');
        return;
    }

    // Process the first image element.
    const $processedFirstImage = sourceApplier.applyImageSource( $firstImageElement, sourceApplier.imageStateTracker );
    assert.equal( $processedFirstImage.attr('src'), 'small_version.jpg', 'The src attribute of the first image was correctly updated.' );

    // Process the second image element.
    // By default, the breakpoint is 'small', so 'data-medium' won't be matched unless overridden.
    // So, this should result in undefined.
    const $processedSecondImage = sourceApplier.applyImageSource( $secondImageElement, sourceApplier.imageStateTracker );
    assert.equal( $processedSecondImage.attr('src'), undefined, 'The src attribute of the second image should remain undefined (no match).' );

    // Add an assertion for the third image element, which also should not get a source.
    const $processedThirdImage = sourceApplier.applyImageSource( $thirdImageElement, sourceApplier.imageStateTracker );
    assert.equal( $processedThirdImage.attr('src'), undefined, 'The src attribute of the third image should also be undefined (no match).' );
});


// ==========================================================================
QUnit.module( 'API Contract Validation' );
// ==========================================================================

// --------------------------------------------------------------------------
// API / getBreakpoint() Equivalent
// --------------------------------------------------------------------------
// The responsiveImage instance should expose a 'breakpointState' object
// This 'breakpointState' object contains keys like 'activeState', 'allAvailableStates', and 'currentIndex'.
// --------------------------------------------------------------------------

QUnit.test('Instance Breakpoint Data Structure', 3, function (assert) {
    console.log('Verifying breakpoint state object on instance.');
    // Create a new responsive image instance.
    const bpInstanceRef = jQuery.fn.responsiveImage();

    // Check the properties of the exposed breakpoint state object.
    assert.strictEqual( bpInstanceRef.breakpointState.activeState, 'small', 'The current active breakpoint state should be "small".' );
    assert.deepEqual( bpInstanceRef.breakpointState.allAvailableStates, ['small'], 'All available breakpoint states should include "small".' );
    assert.strictEqual( bpInstanceRef.breakpointState.currentIndex, 0, 'The position index of the current breakpoint should be 0.' );
});

// --------------------------------------------------------------------------
// API / always deferred equivalent
// --------------------------------------------------------------------------
// The responsiveImage instance returns a deferred object that will always resolve,
// passing the 'breakpointState' information.
// The 'breakpointState' object has 'activeState', 'allAvailableStates', and 'currentIndex' keys.
// --------------------------------------------------------------------------

QUnit.asyncTest('Deferred Always Callback Behavior', 4, function (assert) {
    // Instantiate the responsive image handler.
    const deferredHandler = jQuery.fn.responsiveImage();

    // Ensure the deferred is in a resolved state immediately for a non-image scenario.
    assert.equal( deferredHandler.promise().state(), 'resolved', 'The deferred object should be resolved immediately when no images are processed.' );

    // Attach an 'always' callback to the deferred.
    deferredHandler.promise().always(function (bpData) {
        QUnit.start(); // Resume QUnit testing after the async callback.
        console.log('Always callback executed with breakpoint data:', bpData);

        // Define expected values for comparison.
        const expectedCurrent = 'small';
        const expectedAll = ['small'];

        // Validate the breakpoint data passed to the callback.
        assert.equal( bpData.activeState, expectedCurrent, 'Breakpoint data "activeState" is correct within the always callback.' );
        assert.deepEqual( bpData.allAvailableStates, expectedAll, 'Breakpoint data "allAvailableStates" array is correct.' );
        assert.equal( bpData.currentIndex, 0, 'Breakpoint data "currentIndex" is correct.' );
    });
});

// This test verifies the 'always' deferred behavior when dealing with both successful and failed image loads.
QUnit.asyncTest('Deferred Always with Mixed Image Outcomes', 2, function (assert) {
    // Create a set of images, one valid and one intentionally broken.
    const $mixedImages = jQuery('<img data-small="https://placekitten.com/200/300?random=1"><img data-small="https://invalid.url/broken.png">');
    // Initialize the responsive image loader for these elements.
    const imageLoaderPromise = $mixedImages.responsiveImage();

    // The promise should be pending initially because image loading is asynchronous.
    assert.strictEqual( imageLoaderPromise.promise().state(), 'pending', 'Deferred state should be pending at the start of image loading.' );

    // Attach an 'always' callback. This should execute regardless of success or failure.
    imageLoaderPromise.promise().always(function (resolutionInfo) {
        QUnit.start(); // Resume QUnit.
        console.log('Always callback triggered for mixed image loading scenario.');

        // Basic check to ensure resolution info is present.
        if (!resolutionInfo) {
            assert.fail('Resolution information object was missing in the always callback.');
            return;
        }
        assert.ok(true, 'Always callback executed successfully, even with mixed image loading results.');
    });
});

// --------------------------------------------------------------------------
// API / done deferred equivalent
// --------------------------------------------------------------------------
// The responsiveImage instance returns a deferred object that resolves upon success,
// passing the 'breakpointState' and an imagesLoaded instance.
// The 'breakpointState' has 'activeState', 'allAvailableStates', and 'currentIndex' keys.
// --------------------------------------------------------------------------

QUnit.asyncTest('Deferred Done Callback for Success', 5, function (assert) {
    // Create a single image element with a valid source.
    const $singleSuccessfulImage = jQuery('<img data-small="https://picsum.photos/200/300?random=2">');
    // Initialize the handler for this image.
    const successHandler = $singleSuccessfulImage.responsiveImage();

    // The promise should be pending as the image loads asynchronously.
    assert.strictEqual( successHandler.promise().state(), 'pending', 'Promise should be pending before the image finishes loading.' );

    // Attach a 'done' callback, which should execute upon successful image load.
    successHandler.promise().done(function (bpDetails, loadedImagesInstance) {
        QUnit.start(); // Resume QUnit.
        console.log('Done callback executed for successful image load.');

        // Verify the state of the promise after resolution.
        assert.strictEqual( successHandler.promise().state(), 'resolved', 'Promise state should be "resolved" inside the done callback.' );

        // Validate the breakpoint details.
        assert.strictEqual( bpDetails.activeState, 'small', 'Breakpoint details "activeState" is correct.' );
        assert.deepEqual( bpDetails.allAvailableStates, ['small'], 'Breakpoint details "allAvailableStates" array is correct.' );

        // Validate the imagesLoaded instance.
        const firstImage = loadedImagesInstance.images[0];
        if (!firstImage) {
            assert.fail('No image found in the imagesLoaded instance.');
            return;
        }
        assert.equal( firstImage.img, $singleSuccessfulImage[0], 'The correct image element is referenced in the imagesLoaded instance.' );
    });
});

// --------------------------------------------------------------------------
// API / fail deferred equivalent
// --------------------------------------------------------------------------
// The responsiveImage instance returns a deferred object that rejects upon failure,
// passing the 'breakpointState' and an imagesLoaded instance.
// The 'breakpointState' has 'activeState', 'allAvailableStates', and 'currentIndex' keys.
// --------------------------------------------------------------------------

QUnit.asyncTest('Deferred Fail Callback for Errors', 5, function (assert) {
    // Create an image element with an intentionally broken URL to simulate a load failure.
    const $singleFailedImage = jQuery('<img data-small="https://nonexistent.domain/broken.jpg">');
    // Initialize the failure handler for this image.
    const failureHandler = $singleFailedImage.responsiveImage();

    // The promise should be pending initially.
    assert.strictEqual( failureHandler.promise().state(), 'pending', 'Promise should be pending before an image load failure.' );

    // Attach a 'fail' callback, which should execute when an image fails to load.
    failureHandler.promise().fail(function (bpDetails, loadedImagesInstance) {
        QUnit.start(); // Resume QUnit.
        console.warn('Fail callback executed for image load error as expected.');

        // Verify the state of the promise after rejection.
        assert.strictEqual( failureHandler.promise().state(), 'rejected', 'Promise state should be "rejected" inside the fail callback.' );

        // Validate the breakpoint details.
        assert.strictEqual( bpDetails.activeState, 'small', 'Breakpoint details "activeState" is correct in fail callback.' );
        assert.deepEqual( bpDetails.allAvailableStates, ['small'], 'Breakpoint details "allAvailableStates" array is correct in fail callback.' );

        // Validate the imagesLoaded instance indicates failure.
        const firstImageInfo = loadedImagesInstance.images[0];
        if (!firstImageInfo) {
            assert.fail('No image information found in the loadedImagesInstance during failure.');
            return;
        }
        assert.strictEqual( firstImageInfo.isLoaded, false, 'The image in the instance should be marked as not loaded.' );
    });
});

// --------------------------------------------------------------------------
// API / progress equivalent
// --------------------------------------------------------------------------
// The responsiveImage instance runs a callback for each image's progress,
// passing the 'breakpointState', the imagesLoaded instance, and the individual image info.
// --------------------------------------------------------------------------

QUnit.test('Progress Callback Execution', 10, function(assert) {
    // Create multiple image elements with valid sources for progress tracking.
    const $multipleImagesForProgress = jQuery(
        '<img data-small="https://picsum.photos/200/300?random=3">' +
        '<img data-small="https://picsum.photos/200/300?random=4">' +
        '<img data-small="https://picsum.photos/200/300?random=5">' +
        '<img data-small="https://picsum.photos/200/300?random=6">'
    );
    // Initialize the responsive image system for these images.
    const progressPromise = $multipleImagesForProgress.responsiveImage();
    let completionCounter = 0; // Tracks how many images have progressed.

    QUnit.stop(); // Pause QUnit until all progress events are handled.

    // Attach a 'progress' callback to the promise.
    progressPromise.promise().progress(function ( bpStatus, imgLoaderInstance, currentImage ) {
        QUnit.start(); // Resume QUnit temporarily for assertions.

        console.log(`Progress event for image ${completionCounter + 1}.`);

        // Validate individual image status and reference.
        assert.ok( currentImage.isLoaded, `Image ${completionCounter + 1} should be marked as loaded during progress.` );
        assert.equal( imgLoaderInstance.images[completionCounter].img, $multipleImagesForProgress[completionCounter], `Correct image element processed at step ${completionCounter}.` );

        // Ensure image source is present.
        if (!currentImage.img.src) {
            assert.fail(`Image source missing for image at index ${completionCounter} in progress callback.`);
        }

        completionCounter += 1; // Increment the counter for each progress event.

        // After all images have progressed, perform final assertions.
        if ( completionCounter === $multipleImagesForProgress.length ) {
            assert.equal( completionCounter, $multipleImagesForProgress.length, 'Progress callback executed for the correct number of images.' );
            assert.strictEqual( bpStatus.activeState, 'small', 'Final breakpoint status "activeState" is correct in progress callback.' );
        }

        QUnit.stop(); // Pause QUnit again, waiting for the next progress event or the 'always' callback.
    });

    // Attach an 'always' callback to ensure the test finishes correctly.
    progressPromise.promise().always(function () {
        QUnit.start(); // Final QUnit resume.
        console.log('All image loading processes completed (always callback).');
    });
});


// --------------------------------------------------------------------------
// API / general callback equivalent
// --------------------------------------------------------------------------
// The responsiveImage function can take a general callback that receives
// the 'breakpointState' information.
// --------------------------------------------------------------------------

QUnit.asyncTest('Global Callback for Breakpoint State Only', 3, function (assert) {
    // Call the responsiveImage plugin directly with a callback (no specific images).
    jQuery.fn.responsiveImage(function (stateDetails) {
        QUnit.start(); // Resume QUnit.
        console.log('Global callback triggered with state details:', stateDetails);

        // Add a guard for incomplete details.
        if (!stateDetails || !stateDetails.activeState) {
            assert.fail('State details object or activeState property is missing in the global callback.');
            return;
        }

        // Validate the breakpoint details passed to the callback.
        assert.deepEqual( stateDetails.activeState, 'small', 'Breakpoint "activeState" is correct in the global callback.' );
        assert.deepEqual( stateDetails.allAvailableStates, ['small'], 'Breakpoint "allAvailableStates" array is correct.' );
        assert.deepEqual( stateDetails.currentIndex, 0, 'Breakpoint "currentIndex" is correct.' );
    });
});

// --------------------------------------------------------------------------
// API / image callback equivalent
// --------------------------------------------------------------------------
// When called on specific image(s), the callback receives the 'breakpointState'
// and the imagesLoaded instance.
// --------------------------------------------------------------------------

QUnit.asyncTest('Image-specific Callback with Full Details', 4, function (assert) {
    // Create a single image for this specific callback test.
    const $singleImageForCallback = jQuery('<img data-small="https://picsum.photos/200/300?random=7">');

    // Call the responsiveImage plugin on the image element with a callback.
    $singleImageForCallback.responsiveImage(function (stateDetails, loadedImagesInfo) {
        QUnit.start(); // Resume QUnit.
        console.log('Image-specific callback triggered with state and image info.');

        // Add a validation for the state details.
        if (!stateDetails.allAvailableStates || stateDetails.allAvailableStates.length === 0) {
            assert.fail('No breakpoint states found in the image-specific callback.');
        }

        // Validate the breakpoint details.
        assert.deepEqual( stateDetails.activeState, 'small', 'Breakpoint "activeState" is correct in the image callback.' );
        assert.deepEqual( stateDetails.allAvailableStates, ['small'], 'Breakpoint "allAvailableStates" array is correct in the image callback.' );
        assert.deepEqual( stateDetails.currentIndex, 0, 'Breakpoint "currentIndex" is correct in the image callback.' );

        // Validate the imagesLoaded instance.
        const firstLoadedImage = loadedImagesInfo.images[0];
        if (!firstLoadedImage) {
            assert.fail('No image found in the loadedImagesInfo instance for the callback.');
            return;
        }
        assert.equal( firstLoadedImage.img, $singleImageForCallback[0], 'The correct image element is referenced in the imagesLoaded instance for the callback.' );
    });
});