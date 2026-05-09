jQuery( function ( ) {

    // This object holds configuration details for various image display sizes.
    var mediaSpecs = {
        'tiny': {
            'uri': 'http://placehold.it/320x240',
            'minimumWidth': null,
            'maximumWidth': 319
        },
        'mid': {
            'uri': 'http://placehold.it/640x460',
            'minimumWidth': 320,
            'maximumWidth': 639
        },
        'maxi': {
            'uri': 'http://placehold.it/800x600',
            'minimumWidth': 640,
            'maximumWidth': null
        }
    };

    /**
     * Creates a string representation of media specifications for the 'whalewatch' plugin.
     * @returns {string} A combined string of all media definitions.
     */
    function buildDefinitionString ( ) {

        var specificationsList = [ ] ;
        jQuery . each ( mediaSpecs , function ( entryLabel , mediaConfig ) {
            specificationsList . push (
                '[' + mediaConfig . uri + ', (' +
                    ( mediaConfig . minimumWidth !== null ? 'min-width: ' + mediaConfig . minimumWidth : '' ) +
                    ( mediaConfig . minimumWidth !== null && mediaConfig . maximumWidth !== null ? ', ' : '' ) +
                    ( mediaConfig . maximumWidth !== null ? 'max-width: ' + mediaConfig . maximumWidth : '' ) +
                ')]'
            ) ;
        } ) ;
        return specificationsList . join ( ', ' ) ;

    } // Termination of buildDefinitionString

    // QUnit test harness setup section
    var issueList = [ ] ;
    var activeTestLabel ; // This variable is declared but remains unused, mirroring original structure

    QUnit . done ( function ( finalResults ) {
        var reportEntries = [ ] ;
        for ( var idx = 0 , totalCount = issueList . length ; idx < totalCount ; idx ++ ) {
            var assertionInfo = issueList [ idx ] ;
            reportEntries . push ( {
                testTitle: assertionInfo . testTitle ,
                successStatus: assertionInfo . successStatus ,
                anticipatedValue: assertionInfo . anticipatedValue ,
                observedValue: assertionInfo . observedValue ,
                errorLocation: assertionInfo . errorLocation
            } ) ;
        }
        finalResults . tests = reportEntries ;

        window . overall_suite_results = finalResults ;
    } ) ;

    QUnit . testStart ( function ( runDetails ) {
        QUnit . log ( function ( assertionInfo ) {
            if ( ! assertionInfo . successStatus ) {
                assertionInfo . testTitle = runDetails . name ;
                issueList . push ( assertionInfo ) ;
            }
        } ) ;
    } ) ;

    // Test case for a statically defined image at full width
    QUnit . test ( 'static-image-full-width' , function ( verificationTool ) {

        var testWrapper = jQuery ( '#test-static-full' ) ;
        var imageElement = testWrapper . find ( 'img' ) ;
        var completionCallback = verificationTool . async ( ) ;

        testWrapper . whalewatch ( {
            'onContentUpdated': function ( actionEvent ) {
                verificationTool . equal ( mediaSpecs . maxi . uri , actionEvent . affectedElement . attr ( 'uri' ) , 'Static image should be utilizing the largest URI source' ) ;
                completionCallback ( ) ;
            }
        } ) ;

    } ) ;

    // Test case for a statically defined image at half width
    QUnit . test ( 'static-image-half-width' , function ( verificationTool ) {

        var testWrapper = jQuery ( '#test-static-half' ) ;
        var imageElement = testWrapper . find ( 'img' ) ;
        var completionCallback = verificationTool . async ( ) ;

        testWrapper . whalewatch ( {
            'onContentUpdated': function ( actionEvent ) {
                verificationTool . equal ( mediaSpecs . mid . uri , actionEvent . affectedElement . attr ( 'uri' ) , 'Static image should be utilizing the mid-range URI source' ) ;
                completionCallback ( ) ;
            }
        } ) ;

    } ) ;

    // Test case for an asynchronously added image at full width
    QUnit . test ( 'dynamic-image-full-width' , function ( verificationTool ) {

        var testWrapper = jQuery ( '#test-async-full' ) ;
        var imageElement = jQuery ( '<img>' , { 'data-whalewatch': buildDefinitionString ( ) } ) . appendTo ( testWrapper ) ;
        var completionCallback = verificationTool . async ( ) ;

        testWrapper . whalewatch ( {
            'onContentUpdated': function ( actionEvent ) {
                verificationTool . equal ( mediaSpecs . maxi . uri , actionEvent . affectedElement . attr ( 'uri' ) , 'Dynamically added image should be utilizing the largest URI source' ) ;
                completionCallback ( ) ;
            }
        } ) ;

    } ) ;

    // Test case for an asynchronously added image at half width
    QUnit . test ( 'dynamic-image-half-width' , function ( verificationTool ) {

        var testWrapper = jQuery ( '#test-async-half' ) ;
        var imageElement = jQuery ( '<img>' , { 'data-whalewatch': buildDefinitionString ( ) } ) . appendTo ( testWrapper ) ;
        var completionCallback = verificationTool . async ( ) ;

        testWrapper . whalewatch ( {
            'onContentUpdated': function ( actionEvent ) {
                verificationTool . equal ( mediaSpecs . mid . uri , actionEvent . affectedElement . attr ( 'uri' ) , 'Dynamically added image should be utilizing the mid-range URI source' ) ;
                completionCallback ( ) ;
            }
        } ) ;

    } ) ;

    // Test case for resizing a static image container
    QUnit . test ( 'static-image-resize-behavior' , function ( verificationTool ) {

        var testWrapper = jQuery ( '#test-static-resize' ) ;
        var imageElement = testWrapper . find ( 'img' ) ;

        var finishLarge = verificationTool . async ( ) ;
        var finishMedium = verificationTool . async ( ) ;
        var finishTiny = verificationTool . async ( ) ;

        testWrapper . width ( 200 ) ;

        testWrapper . whalewatch ( {
            'onContentUpdated': function ( actionEvent ) {

                var elementWidth = testWrapper . width ( ) ;

                if ( elementWidth == 200 ) {
                    verificationTool . equal ( mediaSpecs . tiny . uri , actionEvent . affectedElement . attr ( 'uri' ) , 'Tiny URI source should be active when container is 200 pixels wide' ) ;
                    finishTiny ( ) ;
                    testWrapper . width ( 500 ) ;
                    jQuery . whalewatch . reflow ( ) ;
                }
                else if ( elementWidth === 500 ) {
                    verificationTool . equal ( mediaSpecs . mid . uri , actionEvent . affectedElement . attr ( 'uri' ) , 'Mid-range URI source should be active when container is 500 pixels wide' ) ;
                    finishMedium ( ) ;
                    testWrapper . width ( 700 ) ;
                    jQuery . whalewatch . reflow ( ) ;
                }
                else if ( elementWidth === 700 ) {
                    verificationTool . equal ( mediaSpecs . maxi . uri , actionEvent . affectedElement . attr ( 'uri' ) , 'Largest URI source should be active when container is 700 pixels wide' ) ;
                    finishLarge ( ) ;
                }

            }
        } ) ;

    } ) ;

    // Test case for preventing the default image change behavior
    QUnit . test ( 'prevent-default-image-change' , function ( verificationTool ) {

        var testWrapper = jQuery ( '#test-prevent-default' ) ;
        var imageElement = testWrapper . find ( 'img' ) ;

        var completionCallback = verificationTool . async ( ) ;

        testWrapper . whalewatch ( {
            'preChange': function ( actionEvent ) {
                actionEvent . preventDefault ( ) ;
            } ,
            'onContentUpdated': function ( actionEvent ) {
                verificationTool . equal ( 'http://placehold.it/50x50' , actionEvent . affectedElement . attr ( 'uri' ) ) ;
                completionCallback ( ) ;
            }
        } ) ;

    } ) ;

    // Start execution of the QUnit test suite
    QUnit . start ( ) ;

} ) ;