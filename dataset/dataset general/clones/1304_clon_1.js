( function ( $ ) {

    // This section contains a quick reference for QUnit testing methods.
    // For more details, consult the official QUnit API documentation:
    // http://api.qunitjs.com/

    // Core Test Methods:
    //   module( name, [configObject] )           - Defines a test module.
    //   test( name, callbackFunction )           - Defines an individual test case.
    //   expect( numberOfAssertions )             - Specifies the expected number of assertions.
    //   stop( incrementCount )                   - Pauses the test runner.
    //   start( decrementCount )                  - Resumes the test runner.

    // Assertion Methods Provided by QUnit:
    //   ok( value, [message] )                   - Asserts that a value is truthy.
    //   equal( actual, expected, [message] )     - Asserts loose equality (==).
    //   notEqual( actual, expected, [message] )  - Asserts loose inequality (!=).
    //   deepEqual( actual, expected, [message] ) - Asserts deep equality.
    //   notDeepEqual( actual, expected, [message] ) - Asserts deep inequality.
    //   strictEqual( actual, expected, [message] ) - Asserts strict equality (===).
    //   notStrictEqual( actual, expected, [message] ) - Asserts strict inequality (!==).
    //   throws( block, [expected], [message] )   - Asserts that an error is thrown.

    module ( 'core',
        {
            // The setup function executes prior to each test within this module.
            setup : function ( ) {
                this.elems = $ ( '#qunit-fixture' ) ;
                this.content_before = $ ( '#qunit-fixture' ) [ 0 ] . innerHTML ;
                this.init = this.elems . scrollNav ( ) ;
                this.instances = $ ( '.scroll-nav' ) . length ;
                this.destroy = this.elems . scrollNav ( 'destroy' ) ;
                this.destroyed = $ ( '.scroll-nav' ) . length ;
                this.content_after = $ ( '#qunit-fixture' ) [ 0 ] . innerHTML ;
            }
            , teardown : function ( ) {
                // No specific cleanup needed here, as the elements are already
                // torn down by the 'destroy' call in setup for verification.
            }
        }
    ) ;

    test ( 'is chainable', function ( ) {
        expect ( 1 ) ;
        // This is a standard test for jQuery plugin methods to ensure proper chaining.
        strictEqual ( this.init, this.elems, 'should be chainable' ) ;
    } ) ;

    test ( 'correct instances', function ( ) {
        expect ( 1 ) ;
        // Verifies that the plugin creates exactly one instance as expected.
        strictEqual ( this.instances, 1, 'should create one' ) ;
    } ) ;

    test ( 'is destroyable', function ( ) {
        expect ( 1 ) ;
        // After calling the destroy method, the scroll-nav class should not be present.
        strictEqual ( this.destroyed, 0, 'should be zero' ) ;
    } ) ;

    test ( 'removes dom changes when destroyed', function ( ) {
        expect ( 1 ) ;
        // Assert that the DOM content reverts to its original state post-destruction.
        notStrictEqual ( this.content_before, this.content_after, 'elem content should be reset to original' ) ;
    } ) ;

    module ( 'sections', {
        // This setup runs before every test in the 'sections' module.
        setup : function ( ) {
            this.elems = $ ( '#qunit-fixture' ) ;
            this.sections = this.elems . scrollNav ( ) . children ( ) ;
        } , teardown : function ( ) {
            this.elems . scrollNav ( 'destroy' ) ; // Ensure cleanup after each section test.
        }
    } ) ;

    test ( 'correct total number of sections', function ( ) {
        expect ( 3 ) ;

        strictEqual ( this.sections.length, 2, 'should be two' ) ;
        notStrictEqual ( this.sections.length, 1, 'should not be one' ) ;
        notStrictEqual ( this.sections.length, 0, 'should not be zero' ) ;
    } ) ;

    test ( 'correct number of children in first section', function ( ) {
        expect ( 3 ) ;

        strictEqual ( this.sections . eq ( 0 ) . children ( ) . length, 6, 'should be six' ) ;
        notStrictEqual ( this.sections . eq ( 0 ) . children ( ) . length, 5, 'should not be five' ) ;
        notStrictEqual ( this.sections . eq ( 0 ) . children ( ) . length, 7, 'should not be seven' ) ;
    } ) ;

    test ( 'correct number of children in second section', function ( ) {
        expect ( 3 ) ;

        strictEqual ( this.sections . eq ( 1 ) . children ( ) . length, 6, 'should be six' ) ;
        notStrictEqual ( this.sections . eq ( 1 ) . children ( ) . length, 5, 'should not be five' ) ;
        notStrictEqual ( this.sections . eq ( 1 ) . children ( ) . length, 7, 'should not be seven' ) ;
    } ) ;

    test ( 'first section is correct tag', function ( ) {
        expect ( 4 ) ;
        var sectionTag = this.sections . eq ( 0 ) . prop ( 'tagName' ) ;

        strictEqual ( sectionTag, 'SECTION', 'should be a section tag' ) ;
        notStrictEqual ( sectionTag, 'DIV', 'should not be a div tag' ) ;
        notStrictEqual ( sectionTag, 'H2', 'should not be an h2 tag' ) ;
        notStrictEqual ( sectionTag, 'P', 'should not be a p tag' ) ;
    } ) ;

    test ( 'second section is correct tag', function ( ) {
        expect ( 4 ) ;
        var sectionTag = this.sections . eq ( 1 ) . prop ( 'tagName' ) ;

        strictEqual ( sectionTag, 'SECTION', 'should be a section tag' ) ;
        notStrictEqual ( sectionTag, 'DIV', 'should not be a div tag' ) ;
        notStrictEqual ( sectionTag, 'H2', 'should not be an h2 tag' ) ;
        notStrictEqual ( sectionTag, 'P', 'should not be a p tag' ) ;
    } ) ;

    test ( 'first section has correct id', function ( ) {
        expect ( 4 ) ;
        var sectionID = this.sections . eq ( 0 ) . attr ( 'id' ) ;

        strictEqual ( sectionID, 'scrollNav-1', 'should be scrollNav-1' ) ;
        notStrictEqual ( sectionID, 'scrollNav-0', 'should not be scrollNav-0' ) ;
        notStrictEqual ( sectionID, 'scrollNav-2', 'should not be scrollNav-2' ) ;
        notStrictEqual ( sectionID, 'scrollNav-1-1', 'should not be scrollNav-1-1' ) ;
    } ) ;

    test ( 'second section has correct id', function ( ) {
        expect ( 4 ) ;
        var sectionID = this.sections . eq ( 1 ) . attr ( 'id' ) ;

        strictEqual ( sectionID, 'scrollNav-2', 'should be scrollNav-2' ) ;
        notStrictEqual ( sectionID, 'scrollNav-1', 'should not be scrollNav-1' ) ;
        notStrictEqual ( sectionID, 'scrollNav-3', 'should not be scrollNav-3' ) ;
        notStrictEqual ( sectionID, 'scrollNav-2-1', 'should not be scrollNav-2-1' ) ;
    } ) ;

    test ( 'firs section has correct class', function ( ) {
        expect ( 2 ) ;

        var sectionClass = this.sections . eq ( 0 ) . attr ( 'class' ) ;

        strictEqual ( sectionClass, 'scroll-nav__section', 'should be scroll-nav__section' ) ;
        notStrictEqual ( sectionClass, '', 'should not be empty' ) ;
    } ) ;

    module ( 'subSections', {
        // Setup for the subSections module.
        setup : function ( ) {
            this.elems = $ ( '#qunit-fixture' ) ;
            this.scrollNav = this.elems . scrollNav ( {
                sections : 'h2',
                subSections : 'h3',
                showHeadline : true
            } ) ;
            this.sections = this.scrollNav . children ( ) ;
        } , teardown : function ( ) {
            this.elems . scrollNav ( 'destroy' ) ; // Clean up after each test in this module.
        }
    } ) ;

    test ( 'correct total number of sub-sections in first section', function ( ) {
        expect ( 3 ) ;
        var $subSections = this.sections . eq ( 0 ) . find ( '.scroll-nav__sub-section' ) ;

        strictEqual ( $subSections.length, 2, 'should be two' ) ;
        notStrictEqual ( $subSections.length, 1, 'should not be one' ) ;
        notStrictEqual ( $subSections.length, 0, 'should not be zero' ) ;
    } ) ;

    module ( 'nav', {
        // Module setup for navigation-related tests.
        setup : function ( ) {
            this.elems = $ ( '#qunit-fixture' ) ;
            this.scrollNav = this.elems . scrollNav ( ) ;
            this.sections = this.scrollNav . children ( ) ;
            this.nav = this.scrollNav . siblings ( 'nav' ) ;
        } , teardown : function ( ) {
            this.elems . scrollNav ( 'destroy' ) ; // Destroy the plugin instance.
        }
    } ) ;

    test ( 'nav is inserted', function ( ) {
        expect ( 1 ) ;

        equal ( this.nav.length, true, 'nav should exist' ) ;
    } ) ;

    test ( 'nav has correct class', function ( ) {
        expect ( 2 ) ;
        var navClass = this.nav . attr ( 'class' ) ;

        strictEqual ( navClass, 'scroll-nav', 'should be scroll-nav' ) ;
        notStrictEqual ( navClass, '', 'should not be empty' ) ;
    } ) ;

    test ( 'wrapper has correct class', function ( ) {
        expect ( 2 ) ;
        var wrapperClass = this.nav . children ( 'div' ) . attr ( 'class' ) ;

        strictEqual ( wrapperClass, 'scroll-nav__wrapper', 'should be scroll-nav__wrapper' ) ;
        notStrictEqual ( wrapperClass, '', 'should not be empty' ) ;
    } ) ;

    test ( 'first nav link has correct text', function ( ) {
        expect ( 3 ) ;
        var headingText = this.sections . eq ( 0 ) . children ( ) . eq ( 0 ) . text ( ) ;
        var linkText = this.nav . find ( 'li' ) . eq ( 0 ) . text ( ) ;

        strictEqual ( linkText, headingText, 'should be Test Heading' ) ;
        notStrictEqual ( linkText, 'lame test markup', 'should not be lame test' ) ;
        notStrictEqual ( linkText, 'Another Test Heading', 'should not be Another Test Heading' ) ;
    } ) ;

    test ( 'second nav link has correct text', function ( ) {
        expect ( 3 ) ;
        var headingText = this.sections . eq ( 1 ) . children ( ) . eq ( 0 ) . text ( ) ;
        var linkText = this.nav . find ( 'li' ) . eq ( 1 ) . text ( ) ;

        strictEqual ( linkText, headingText, 'should be Another Test Heading' ) ;
        notStrictEqual ( linkText, 'lame test markup', 'should not be lame test' ) ;
        notStrictEqual ( linkText, 'Test Heading', 'should not be Test Heading' ) ;
    } ) ;

    test ( 'first nav link has correct url', function ( ) {
        expect ( 3 ) ;
        var sectionID = this.sections . eq ( 0 ) . attr ( 'id' ) ;
        var linkURL = this.nav . find ( 'li' ) . eq ( 0 ) . find ( 'a' ) . attr ( 'href' ) ;

        strictEqual ( linkURL, '#' + sectionID, 'should be #scrollNav-1' ) ;
        notStrictEqual ( linkURL, 'lame test markup', 'should not be #scrollNav-0' ) ;
        notStrictEqual ( linkURL, 'Another Test Heading', 'should not be #scrollNav-2' ) ;
    } ) ;

    test ( 'second nav link has correct url', function ( ) {
        expect ( 3 ) ;
        var sectionID = this.sections . eq ( 1 ) . attr ( 'id' ) ;
        var linkURL = this.nav . find ( 'li' ) . eq ( 1 ) . find ( 'a' ) . attr ( 'href' ) ;

        strictEqual ( linkURL, '#' + sectionID, 'should be #scrollNav-2' ) ;
        notStrictEqual ( linkURL, 'lame test markup', 'should not be #scrollNav-1' ) ;
        notStrictEqual ( linkURL, 'Another Test Heading', 'should not be #scrollNav-3' ) ;
    } ) ;

    module ( 'test-options', {
        // Setting up for testing various plugin options.
        setup : function ( ) {
            this.elems = $ ( '#qunit-fixture' ) ;
            this.scrollNav = this.elems . scrollNav ( {
                className : 'nav-test'
            } ) ;
            this.nav = this.scrollNav . siblings ( 'nav' ) ;
            this.sections = this.scrollNav . children ( ) ;
        } , teardown : function ( ) {
            this.elems . scrollNav ( 'destroy' ) ; // Clean up after option tests.
        }
    } ) ;

    test ( 'nav has correct class', function ( ) {
        expect ( 3 ) ;
        var navClass = this.nav . attr ( 'class' ) ;

        strictEqual ( navClass, 'nav-test', 'should be nav-test' ) ;
        notStrictEqual ( navClass, 'scroll-nav', 'should not be scroll-nav' ) ;
        notStrictEqual ( navClass, '', 'should not be empty' ) ;
    } ) ;

    test ( 'wrapper has correct class', function ( ) {
        expect ( 3 ) ;
        var wrapperClass = this.nav . children ( 'div' ) . attr ( 'class' ) ;

        strictEqual ( wrapperClass, 'nav-test__wrapper', 'should be nav-test__wrapper' ) ;
        notStrictEqual ( wrapperClass, 'scroll-nav__wrapper', 'schould not be scroll-nav__wrapper' ) ;
        notStrictEqual ( wrapperClass, '', 'should not be empty' ) ;
    } ) ;

    test ( 'firs section has correct class', function ( ) {
        expect ( 3 ) ;

        var sectionClass = this.sections . eq ( 0 ) . attr ( 'class' ) ;

        strictEqual ( sectionClass, 'nav-test__section', 'should be nav-test__section' ) ;
        notStrictEqual ( sectionClass, 'scroll-nav__section', 'should not be scroll-nav__section' ) ;
        notStrictEqual ( sectionClass, '', 'should not be empty' ) ;
    } ) ;

    module ( 'callbacks', {
        // This module focuses on testing the plugin's callback functions.
        setup : function ( ) {
            this.elems = $ ( '#qunit-fixture' ) ;
            this.scrollNav = this.elems . scrollNav ( {
                onInit : function ( ) {
                    $ ( 'body' ) . addClass ( 'init-callback' ) ;
                } ,
                onRender : function ( ) {
                    $ ( 'body' ) . addClass ( 'render-callback' ) ;
                } ,
                onDestroy : function ( ) {
                    $ ( 'body' ) . removeClass ( 'init-callback render-callback' ) ;
                }
            } ) ;
            this.hasInitClass = $ ( 'body' ) . hasClass ( 'init-callback' ) ;
            this.hasRenderClass = $ ( 'body' ) . hasClass ( 'render-callback' ) ;
            this.destroy = this.elems . scrollNav ( 'destroy' ) ;
            this.destroyedInitClass = $ ( 'body' ) . hasClass ( 'init-callback' ) ;
            this.destroyedRenderClass = $ ( 'body' ) . hasClass ( 'render-callback' ) ;
        } , teardown : function ( ) {
            // No teardown necessary, as the setup method already performs the destruction
            // and related class removals for verification purposes.
        }
    } ) ;

    test ( 'onInit callback', function ( ) {
        expect ( 1 ) ;

        strictEqual ( true, this.hasInitClass, 'init-callback class should exist' ) ;
    } ) ;

    test ( 'onRender callback', function ( ) {
        expect ( 1 ) ;

        strictEqual ( true, this.hasRenderClass, 'render-callback class should exist' ) ;
    } ) ;

    test ( 'onDestroy callback', function ( ) {
        expect ( 2 ) ;

        strictEqual ( false, this.destroyedInitClass, 'init-callback class should be removed' ) ;
        strictEqual ( false, this.destroyedRenderClass, 'render-callback class should be removed' ) ;
    } ) ;

} ( jQuery ) ) ;