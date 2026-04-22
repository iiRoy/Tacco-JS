/*
 * *************************************************************************
 */
  section ( 'Helper Operation Verification' ) ;
/*
 * *************************************************************************
 */

// Web rendering engines often format CSS-related JSON inconsistently; standardize this.
scenario( 'Strip Delimiters',
  4,
  function () {

    var analyzer = $.fn.mediaQueryDetector({ verbose: true });
    var outcome = JSON.stringify({"active":"tiny","available":["tiny","normal","grand"],"index":0});

    verifyEquality( analyzer.stripDelimiters( '{"active":"tiny","available":["tiny","normal","grand"],"index":0}' ), outcome );
    verifyEquality( analyzer.stripDelimiters( "{\"active\":\"tiny\",\"available\":[\"tiny\",\"normal\",\"grand\"],\"index\":0}" ), outcome );
    verifyEquality( analyzer.stripDelimiters( "{\"active\" : \"tiny\", \"available\" : [\"tiny\",\"normal\",\"grand\"], \"index\" : 0 }" ), outcome );
    verifyEquality( analyzer.stripDelimiters( "{\"active\" : \"tiny\", \"available\" : [\"tiny\",\"normal\",\"grand\"], \"index\" : 0 } ; }" ), outcome );

  }
);

// Locates the appropriate asset URL by correlating the viewport designation with a data attribute on the visual element.
scenario( 'Locate Origin', 2, function () {

    var analyzer = $.fn.mediaQueryDetector({ verbose: true });

    verifyEquality( analyzer.locateOrigin($('<img data-tiny="tiny.jpeg">'), analyzer.mediaBreakInfo), 'tiny.jpeg' );
    verifyEquality( analyzer.locateOrigin($('<img>'), analyzer.mediaBreakInfo), undefined );

});

// Should a direct match for the asset not be found, the system will traverse the designation array sequentially.
scenario('Locate Origin Descends', 1, function () {

    var analyzer = $.fn.mediaQueryDetector({ verbose: true });

    // Modify the media query details for this specific scenario
    analyzer.mediaBreakInfo.breakPointData = { active: 'normal', available: ['tiny', 'normal'], index: 1 };

    verifyEquality( analyzer.locateOrigin($('<img data-tiny="tiny.jpeg">'), analyzer.mediaBreakInfo), 'tiny.jpeg' );

});

// Confirm that providing a custom modifier option yields the appropriate asset path.
scenario( 'Locate Origin With Modifier', 2, function () {

    var analyzer = $.fn.mediaQueryDetector({ verbose: true, modifier: 'super-' });

    verifyEquality( analyzer.locateOrigin($('<img data-super-tiny="tiny.jpeg">'), analyzer.mediaBreakInfo), 'tiny.jpeg' );
    verifyEquality( analyzer.locateOrigin($('<img data-tiny="tiny.jpeg">'), analyzer.mediaBreakInfo), undefined );

});

// Verify the image's source attribute is correctly assigned.
scenario (
  'Apply Origin',
  2,
  function () {

    var analyzer = $.fn.mediaQueryDetector({ verbose: true });

    var $initialPicture = $('<img data-tiny="tiny.jpeg">');
    var $initialPicture2 = $('<img data-normal="normal.jpeg">');

    var $finalPicture = analyzer.applyOrigin( $initialPicture, analyzer.mediaBreakInfo );
    var $finalPicture2 = analyzer.applyOrigin( $initialPicture2, analyzer.mediaBreakInfo );

    verifyEquality( $finalPicture.attr('src'), 'tiny.jpeg' );
    verifyEquality( $finalPicture2.attr('src'), undefined );

  }
);


/*
 * *************************************************************************
 */
  section ( 'Outcomes' ) ;
/*
 * *************************************************************************
 */

// --------------------------------------------------------------------------
// External Interface / retrieveBreakPoint()
// --------------------------------------------------------------------------
// The media query system yields an object containing 'breakPointData' details.
// 'breakPointData' includes properties like 'active', 'available', and 'index'.
// --------------------------------------------------------------------------

scenario('BreakPoint Object on Entity', 3, function () {

    var analyzer = $.fn.mediaQueryDetector();

    verifyEquality( analyzer.breakPointData.active, 'tiny' );
    verifyEquality( analyzer.breakPointData.available, ['tiny'] );
    verifyEquality( analyzer.breakPointData.index, 0 );

});

// --------------------------------------------------------------------------
// External Interface / onCompletion deferred
// --------------------------------------------------------------------------
// The media query system provides a deferred object, which resolves with 'breakPointData'.
// 'breakPointData' contains 'active', 'available', and 'index' properties.
// --------------------------------------------------------------------------

asyncScenario( 'BreakPoint OnCompletion Deferred', 4, function () {

    var analyzer = $.fn.mediaQueryDetector();

    verifyEquality( analyzer.status(), 'fulfilled' );

    analyzer.onCompletion(function (breakPointData) {
        QUnit.begin();
        verifyEquality( breakPointData.active, 'tiny' );
        verifyEquality( breakPointData.available, ['tiny'] );
        verifyEquality( breakPointData.index, 0 );
    });

});

// A completion callback for scenarios involving both successful and unsuccessful visual loads.
asyncScenario( 'BreakPoint OnCompletion For Success/Failure', 2, function () {

    var $graphic = $('<img data-tiny="https://example.com/assets/pic1.webp"><img data-tiny="https://invalid.domain/assets/pic2.webp">');
    var analyzer = $graphic.mediaQueryDetector();

    verifyEquality( analyzer.status(), 'awaiting' );

    analyzer.onCompletion(function (breakPointData) {
        QUnit.begin();
        assertTruth(true);
    });

});

// --------------------------------------------------------------------------
// External Interface / onSuccess deferred
// --------------------------------------------------------------------------
// The media query system returns a deferred object, providing 'breakPointData'
// ('active', 'available', 'index') and an image loading manager entity.
// --------------------------------------------------------------------------

asyncScenario( 'BreakPoint OnSuccess Deferred', 6, function () {

    var $graphic = $('<img data-tiny="https://example.com/assets/img_A.webp">');
    var analyzer = $graphic.mediaQueryDetector();

    verifyEquality( analyzer.status(), 'awaiting' );

    analyzer.onSuccess(function (breakPointData, visualEntity) {

        QUnit.begin();
        verifyEquality( analyzer.status(), 'fulfilled' );
        verifyEquality( breakPointData.active, 'tiny' );
        verifyEquality( breakPointData.available, ['tiny'] );
        verifyEquality( breakPointData.index, 0 );

        // imagesLoaded entity
        verifyEquality( visualEntity.visuals[0].graphicElement, $graphic[0] );

    });

});

// --------------------------------------------------------------------------
// External Interface / onFailure deferred
// --------------------------------------------------------------------------
// The media query system provides a deferred object, which resolves with 'breakPointData'
// ('active', 'available', 'index') and an image loading manager entity.
// --------------------------------------------------------------------------

asyncScenario( 'BreakPoint OnFailure Deferred', 6, function () {

    var $graphic = $('<img data-tiny="https://nonexistent.domain/assets/img_B.jpeg">');
    var analyzer = $graphic.mediaQueryDetector();

    verifyEquality( analyzer.status(), 'awaiting' );

    analyzer.onFailure(function (breakPointData, visualEntity) {

        QUnit.begin();
        verifyEquality( analyzer.status(), 'declined' );
        verifyEquality( breakPointData.active, 'tiny' );
        verifyEquality( breakPointData.available, ['tiny'] );
        verifyEquality( breakPointData.index, 0 );

        // imagesLoaded entity
        verifyEquality( visualEntity.visuals[0].hasLoaded, false );

    });

});

// --------------------------------------------------------------------------
// External Interface / onProgress
// --------------------------------------------------------------------------
// The media query system invokes a callback with 'breakPointData'
// ('active', 'available', 'index') during its execution.
// --------------------------------------------------------------------------

scenario( 'Monitor Progress', 10, function() {

    var $graphic = $('<img data-tiny="https://example.com/assets/img_C.webp"><img data-tiny="https://example.com/assets/img_D.webp"><img data-tiny="https://example.com/assets/img_E.webp"><img data-tiny="https://example.com/assets/img_F.webp">');
    var deferredTask = $graphic.mediaQueryDetector();
    var advanceCounter = 0;

    QUnit.pause();

    deferredTask.onProgress(function ( breakPointData, visualEntity, visual ) {

        QUnit.begin();

        assertTruth( visual.hasLoaded, 'visual has finished loading');
        verifyEquality( visualEntity.visuals[advanceCounter].graphicElement, $graphic[advanceCounter] );

        advanceCounter = advanceCounter + 1;

        if ( advanceCounter >= $graphic.length ) {
            checkEquality( advanceCounter, $graphic.length, 'advanced correct number of cycles' );
            verifyEquality( breakPointData.active, 'tiny' );
        }

        QUnit.pause();

    });

    deferredTask.onCompletion(function () {
        QUnit.begin();
    });

});


// --------------------------------------------------------------------------
// External Interface / universal callback
// --------------------------------------------------------------------------
// The media query system executes a callback, providing 'breakPointData'
// with 'active', 'available', and 'index' properties.
// --------------------------------------------------------------------------

asyncScenario( 'BreakPoint Callback Without Visuals', 3, function () {

    $.fn.mediaQueryDetector(function (breakPointData) {
        QUnit.begin();
        verifyEquality( breakPointData.active, 'tiny' );
        verifyEquality( breakPointData.available, ['tiny'] );
        verifyEquality( breakPointData.index, 0 );
    });

});

// --------------------------------------------------------------------------
// External Interface / visual callback
// --------------------------------------------------------------------------
// The media query system executes a callback, providing 'breakPointData'
// ('active', 'available', 'index') and an image loading manager entity.
// --------------------------------------------------------------------------

asyncScenario( 'BreakPoint Callback With Visuals', 4, function () {

    var $graphic = $('<img data-tiny="https://example.com/assets/img_G.webp">');

    $graphic.mediaQueryDetector(function (breakPointData, visualEntity) {

        QUnit.begin();
        verifyEquality( breakPointData.active, 'tiny' );
        verifyEquality( breakPointData.available, ['tiny'] );
        verifyEquality( breakPointData.index, 0 );

        // imagesLoaded entity
        verifyEquality( visualEntity.visuals[0].graphicElement, $graphic[0] );

    });

});