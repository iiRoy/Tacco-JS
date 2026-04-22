/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates QUnit tests for a circle progress library,
 * specifically focusing on canvas rendering and animation.
 */
( function()
{
  // Check if the browser supports HTML5 Canvas element
  if (Modernizr.canvas) {

    // Define a QUnit test module for layout tests without animation.
    QUnit.module( "Layout tests, no animation" );

    QUnit.test
    (
      "Test circle with value = 0 (without any options)",
      function(assert)
      {
        // Initialize a circle with a value of 0.
        var canvas = createCircle({ value: 0 }),
            $canvas = $(canvas),
            defaultSize = 100, // The default size for the circle.
            defaultThickness = parseInt(defaultSize / 14); // Calculates default thickness (100 / 14 = 7.14 -> 7)

        // Assertions for default properties and initial state of a 0-value circle.
        assert.equal( $.circleProgress.defaults.size, defaultSize, "Default circle size: 100 pixels" );
        assert.equal( $.circleProgress.defaults.thickness, 'auto', "Default circle thickness: 'auto' (i.e. 1/14 of size)" );
        assert.equal( canvas.tagName.toLowerCase(), 'canvas', "Method .circleProgress('widget') returns HTMLCanvasElement" );

        assert.equal( $canvas.width(), defaultSize, "Default width: 100 pixels" );
        assert.equal( $canvas.height(), defaultSize, "Default height: 100 pixels" );

        // Pixel-level assertions to check rendering.
        assert.pixelCloseRGBA( canvas, 0, defaultSize / 2, 'rgba(0, 0, 0, 0.1)', 0.01 );
        assert.pixelCloseRGBA( canvas, defaultThickness - 1, defaultSize / 2, 'rgba(0, 0, 0, 0.1)', 0.01 );
        assert.pixelRGBA( canvas, defaultThickness + 1, defaultSize / 2, 'rgba(0, 0, 0, 0)' );
      }
    );

    QUnit.test
    (
      "Test circle with value = 0.5 and default fill", function(assert)
      {
        // Create a circle with 0.5 value and animation disabled for static testing.
        var canvas = createCircle
        (
          {
            value: 0.5,
            animation: false
          }
        ),
        size = $.circleProgress.defaults.size; // Get the default size.

        // Verify colors at specific points on the canvas.
        assert.pixelCloseHex( canvas, 1, size / 2 - 1, '#3aeabb', 0.015 );
        assert.pixelCloseRGBA( canvas, 1, size / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01 );

        assert.pixelCloseHex( canvas, size - 1, size / 2 - 1, '#fdd250', 0.015 );
        assert.pixelCloseRGBA( canvas, size - 1, size / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01 );

        assert.pixelCloseHex( canvas, size / 2, 1, '#9ade85', 0.015 );
        assert.pixelRGBA( canvas, size / 2, 8, 'rgba(0, 0, 0, 0)' ); // Transparent area.

        assert.pixelCloseRGBA( canvas, size / 2, size - 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        assert.pixelRGBA( canvas, size / 2, size - 9, 'rgba(0, 0, 0, 0)' ); // Another transparent area.
      }
    );


    QUnit.test
    (
      "Test circle with value = 0.5 and solid fill",
      function(assert)
      {
        var color = '#ff0000', // Red color for the fill.
            canvas = createCircle
            (
              {
                value: 0.5,
                fill: { color: color },
                animation: false
              }
            ),
            defaultSize = $.circleProgress.defaults.size;

        // Check pixels for the solid red fill.
        assert.pixelHex( canvas, 1, defaultSize / 2 - 1, color );
        assert.pixelHex( canvas, defaultSize - 1, defaultSize / 2 - 1, color );
      }
    );

    // New module for tests involving animation.
    QUnit.module( "Layout tests with animation" );

    QUnit.test
    (
      "Test circle with value = 0.5 and solid fill",
      function(assert)
      {
        var color = '#00aa55', // Greenish color.
            canvas = createCircle
            (
              {
                value: 0.5,
                fill: { color: color }
              }
            ),
            size = $.circleProgress.defaults.size;

        assert.expect(8); // Expecting 8 assertions in this test.
        QUnit.stop(); // Stop QUnit to allow async operations.

        // Initial state: transparent/background color.
        assert.pixelCloseRGBA( canvas, 1, size / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelHex( canvas, 1, size / 2 - 1, color ); // After 200ms, should be filled.
          },
          200
        );

        assert.pixelCloseRGBA( canvas, size / 2 + 1, 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelHex( canvas, size / 2 + 1, 1, color ); // After 700ms, another part should be filled.
          },
          700
        );

        assert.pixelCloseRGBA( canvas, size - 2, size / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelHex( canvas, size - 2, size / 2 - 1, color ); // After 1300ms, final part filled.
            QUnit.start(); // Resume QUnit testing.
          },
          1300
        );

        // More initial state checks.
        assert.pixelCloseRGBA( canvas, 1, size / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        assert.pixelCloseRGBA( canvas, size - 2, size / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
      }
    );

    QUnit.test
    (
      "Test circle with value = 0.5, size = 80 and custom gradient",
      function(assert)
      {
        var canvas = createCircle
        (
          {
            value: 0.5,
            size: 80, // Custom size.
            fill:
            {
              gradient: ['#ff327a', '#fff430', '#ff8989'] // Custom gradient colors.
            }
          }
        ),
        size = 80; // Local size variable.

        assert.expect(8);
        QUnit.stop();

        // Initial pixel state checks.
        assert.pixelCloseRGBA( canvas, 1, size / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelCloseHex( canvas, 1, size / 2 - 1, '#ff3777', 0.01 ); // Gradient color check.
          },
          200
        );

        assert.pixelCloseRGBA( canvas, size / 2, 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelCloseHex( canvas, size / 2, 1, '#fff330', 0.01 ); // Another gradient color check.
          },
          700
        );

        assert.pixelCloseRGBA( canvas, size - 2, size / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelCloseHex( canvas, size - 2, size / 2 - 1, '#ff8c86', 0.01 ); // Final gradient color check.
            QUnit.start();
          },
          1300
        );

        // More initial state checks.
        assert.pixelCloseRGBA( canvas, 1, size / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
        assert.pixelCloseRGBA( canvas, size - 2, size / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01 );
      }
    );

    QUnit.test
    (
      "Test circle with value = 0.75, custom start angle and custom animation start value",
      function(assert)
      {
        var canvas = createCircle
        (
          {
            value: 0.75,
            startAngle: -Math.PI / 4, // Custom start angle.
            animationStartValue: 0.25 // Custom animation start point.
          }
        );

        assert.expect(8);
        QUnit.stop();

        // Initial pixel state checks for custom start angle/animation.
        assert.pixelCloseRGBA( canvas, 80, 15, 'rgba(0, 0, 0, 0.1)', 0.01 );
        assert.pixelCloseHex( canvas, 85, 20, '#e0d55f', 0.01 );
        assert.pixelCloseHex( canvas, 85, 80, '#e0d55f', 0.01 );
        assert.pixelCloseRGBA( canvas, 80, 85, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelCloseHex( canvas, 80, 85, '#d6d664', 0.01 ); // Animation progress check.
          },
          400
        );

        assert.pixelCloseRGBA( canvas, 15, 20, 'rgba(0, 0, 0, 0.1)', 0.01 );
        setTimeout
        (
          function()
          {
            assert.pixelCloseHex( canvas, 15, 20, '#57e6aa', 0.01 ); // Final animation progress check.
            assert.pixelCloseRGBA( canvas, 20, 15, 'rgba(0, 0, 0, 0.1)', 0.01 );
            QUnit.start();
          },
          1300
        );
      }
    );

    // Asynchronous test for image background.
    QUnit.asyncTest
    (
      "Test circle with value = 0.5, image background and reverse",
      function(assert)
      {
        // Construct image URL based on script location.
        var urlPrefix = $('script[src*="tests.js"]').attr('src').replace(/tests\.js.*$/, ''),
            imageUrl = urlPrefix + 'images/circle.png',
            image = new Image(); // Create a new Image object.

        assert.expect(9); // Expect 9 assertions.
        image.src = imageUrl; // Set image source.

        $(image).load
        (
          function()
          {
            // Once image is loaded, create the circle.
            var canvas = createCircle
            (
              {
                value: 0.5,
                thickness: 20,
                fill: {image: image}, // Fill with the loaded image.
                reverse: true // Reverse animation.
              }
            );

            // Initial pixel checks for transparent areas.
            assert.pixelRGBA( canvas, 21, 49, 'rgba(0, 0, 0, 0)' );
            assert.pixelRGBA( canvas, 78, 49, 'rgba(0, 0, 0, 0)' );
            assert.pixelRGBA( canvas, 49, 77, 'rgba(0, 0, 0, 0)' );

            // Animation checks with image fill.
            assert.pixelCloseRGBA( canvas, 17, 51, 'rgba(0, 0, 0, 0.1)', 0.01 );
            setTimeout
            (
              function()
              {
                assert.pixelCloseHex( canvas, 17, 51, '#00f7ff', 0.01 ); // Check color after animation.
              },
              400
            );

            assert.pixelCloseRGBA( canvas, 49, 81, 'rgba(0, 0, 0, 0.1)', 0.01 );
            setTimeout
            (
              function()
              {
                assert.pixelCloseHex( canvas, 49, 81, '#7700ff', 0.01 ); // Another color check.
              },
              700
            );

            assert.pixelCloseRGBA( canvas, 81, 51, 'rgba(0, 0, 0, 0.1)', 0.01 );
            setTimeout
            (
              function()
              {
                assert.pixelCloseHex( canvas, 81, 51, '#ff0008', 0.01 ); // Final color check.
                QUnit.start(); // End async test.
              },
              1400
            );
          }
        );
      }
    );
  }
  else
  {
    // Fallback if Canvas is not supported.
    QUnit.test
    (
      "Your browser doesn't support Canvas",
      function(assert)
      {
        assert.ok(true, "That's fine"); // Simply pass the test.
      }
    );
  }

  // --- Utility Functions ---
  /**
   * Helper function to create a circle progress widget.
   * @param {Object} cfg - Configuration object for circleProgress.
   * @returns {HTMLCanvasElement} The created canvas element.
   */
  function createCircle(cfg)
  {
    var output = $('#qunit-fixture'); // Get the QUnit fixture element.
    if (!output[0]) {
      output = $('body'); // Fallback to body if fixture not found.
    }
    var el = $('<span>').appendTo(output).circleProgress(cfg); // Create span, append, and initialize.
    return el.circleProgress('widget'); // Return the actual canvas widget.
  }
} )(); // Immediately invoked function expression ends.