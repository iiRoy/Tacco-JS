// This is a test file for the ClipPath module.
// It uses Mocha-like syntax for describing tests.

   var ClipPath = require("../js/clip-path-polygon.js") ;
   var sinon = require('sinon') ; // Import the sinon library for test spies.

var expect = require('expect.js'); // The expectation library.


describe('ClipPath', function() { /* Main test suite for ClipPath functionality */

  var cut = null; // System Under Test (SUT)
  var jQueryMock = null; // Mock jQuery object
  var $el = null; // Mock DOM element

  beforeEach(function() { // Setup before each test case
    // Initialize a mock jQuery object for testing purposes.
    jQueryMock = {
      find: function(selector) {
        this.selector = this.selector + " " + selector; // Simulate chaining
        return jQueryMock; // Allow method chaining
      },
      attr: function() { // Mock 'attr' method
        return jQueryMock; // Allow method chaining
      }
    };
    // Define a local jQuery function that returns our mock.
    var jQuery = function(selector) {
      jQueryMock.selector = selector; // Store the initial selector
      return jQueryMock;
    };
    // Mock an element with a spyable 'css' method.
    $el = {
      css: sinon.spy() /* Spy on the css method */
    };

    // Instantiate ClipPath with mocks and sample data.
    cut = new ClipPath(jQuery, $el, [
      [3, 2], // Sample point 1
      [6, 7]  // Sample point 2
    ]);
  });


  describe('_handlePxs', function() { /* Test suite for the _handlePxs internal method */

    it('should return number when withUnit is false', function() {
      // given: Define the expected value.
      var expected = 20;

      // when: Call the method under test.
      var result = cut._handlePxs(20, false, false);

      // then: Assert that the result matches the expectation.
      expect(expected) .to .be .equal(result);
    });

    it('should return number when 0 and withUnit = true', function() {
      // given
      var expected = 0;

      // when
      var result = cut._handlePxs(0, true, false);

      // then
      expect(expected) .to .be .equal(result);
    });

    it('should return number when 0 and withUnit = false', function() {
      // given
      var expected = 0;

      // when
      var result = cut._handlePxs(0, false, false);

      // then
      expect(expected) .to .be .equal(result);
    });


    it('should return number with pxs when number is > 0 and withUnit = true', function() {
      // given
      var expected = "20px";

      // when
      var result = cut._handlePxs(20, true, false);

      // then
      expect(expected) .to .be .equal(result);
    });

    it('should return a number/100 when no unit and percentage', function() {
      // given
      var expected = 0.2;

      // when
      var result = cut._handlePxs(20, false, true);

      // then
      expect(expected) .to .be .equal(result);
    });

    it('should return a number with percent sign when  withUnit and percentage', function() {
      // given
      var expected = '20%';

      // when
      var result = cut._handlePxs(20, true, true);

      // then
      expect(expected) .to .be .equal(result);
    });

  }); /* End of _handlePxs tests */


  describe('_translatePoints', function() { // Test suite for _translatePoints method

    it('should translate points with pxs', function() {
      // given some points
      var points = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      var expected = "0 20px, 9px 2px, 4px 4px, 2px 0, 0 0";

      // when translating points
      var result = cut._translatePoints(points, true, false);

      // then check the output
      expect(expected) .to .be .equal(result);
    });

    it('should translate points with no pxs', function() {
      // given
      var points = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      var expected = "0 20, 9 2, 4 4, 2 0, 0 0";

      // when
      var result = cut._translatePoints(points, false, false);

      // then
      expect(expected) .to .be .equal(result);
    });

    it('should translate points with percents', function() {
      // given
      var points = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      var expected = "0 20%, 9% 2%, 4% 4%, 2% 0, 0 0";

      // when
      var result = cut._translatePoints(points, true, true);

      // then
      expect(expected) .to .be .equal(result);
    });

    it('should translate points with no percents and divided by 100', function() {
      // given
      var points = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      var expected = "0 0.2, 0.09 0.02, 0.04 0.04, 0.02 0, 0 0";

      // when
      var result = cut._translatePoints(points, false, true);

      // then
      expect(expected) .to .be .equal(result);
    });

  }); /* End of _translatePoints tests */


  describe('create clip path definition', function() { // Test suite for clip path creation methods
    it('should create clipPath using _createSvgBasedClipPath', function() {
      // given: Set up test variables and spies.
      var id = cut.svgDefId; // Get the ID from the SUT.
      var attrSpy = sinon.spy(jQueryMock, "attr"); // Spy on the attr method of jQueryMock.
      var selector = "#" + id + " " + 'polygon'; // Expected selector for the polygon.
      var attrArg1 = 'points'; // First argument for attr method.
      var attrArg2 = '2 1, 5 7, 8 8'; // Second argument for attr method (points string).

      // when: Call the method to create the SVG-based clip path.
      cut._createSvgBasedClipPath([
        [2, 1],
        [5, 7],
        [8, 8]
      ]);

      // then: Assertions to verify correct behavior.
      expect(jQueryMock.selector) .to .be .equal(selector);
      expect(attrSpy.withArgs(attrArg1, attrArg2).calledOnce) .to .be .equal(true);
      expect($el.css.withArgs('clip-path', 'url(#' + id + ')').calledOnce) .to .be .equal(true);
    });

    it('should create clipPath using _createSvgBasedClipPath with percentage', function() {
      // given: Setup for percentage based clip path.
      cut.isPercentage = true; // Enable percentage mode.
      var id = cut.svgDefId;
      var attrSpy = sinon.spy(jQueryMock, "attr");
      var selector = "#" + id + " " + 'polygon';
      var attrArg1 = 'points';
      var attrArg2 = '0.02 0.01, 0.05 0.07, 0.08 0.08'; // Expected percentage points.

      // when: Create the clip path.
      cut._createSvgBasedClipPath([
        [2, 1],
        [5, 7],
        [8, 8]
      ]);

      // then: Verify the results.
      expect(jQueryMock.selector) .to .be .equal(selector);
      expect(attrSpy.withArgs(attrArg1, attrArg2).calledOnce) .to .be .equal(true);
      expect($el.css.withArgs('clip-path', 'url(#' + id + ')').calledOnce) .to .be .equal(true);
    });

    it('should create clipPath using _createWebkitClipPath', function() {
      // given: Setup for Webkit clip path.
      var clipPathText = 'polygon(2px 1px, 0 7px, 8px 8px)'; // Expected CSS value.
      var attrSpy = sinon.spy(jQueryMock, "attr"); // Spy on attr to ensure it's not called.

      // when: Create the Webkit clip path.
      cut._createWebkitClipPath([
        [2, 1],
        [0, 7],
        [8, 8]
      ]);

      // then: Verify attr was not called and css was called correctly.
      expect(attrSpy.calledOnce) .to .be .equal(false);
      expect($el.css.withArgs('-webkit-clip-path', clipPathText).calledOnce) .to .be .equal(true);
    });

    it('should create clipPath using _createWebkitClipPath with percentage', function() {
      // given: Setup for Webkit clip path with percentages.
      cut.isPercentage = true;
      var clipPathText = 'polygon(2% 1%, 0 7%, 8% 8%)'; // Expected CSS value.
      var attrSpy = sinon.spy(jQueryMock, "attr");

      // when: Create the Webkit clip path.
      cut._createWebkitClipPath([
        [2, 1],
        [0, 7],
        [8, 8]
      ]);

      // then: Verify.
      expect(attrSpy.calledOnce) .to .be .equal(false);
      expect($el.css.withArgs('-webkit-clip-path', clipPathText).calledOnce) .to .be .equal(true);
    });

  }); /* End of clip path definition tests */

}); /* End of ClipPath test suite */