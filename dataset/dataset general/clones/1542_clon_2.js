/*
 *  Defining a collection of initial concepts for the tag sphere display.
 *  These concepts include various labels, magnitudes, and display options.
 */
var initialConcepts = [
    {
        label: 'Zero point zero',            // Text label for the concept
        magnitude: 0.0,                      // Numerical magnitude (weight)
        markupOptions: {
            probe: 'just for probing'        // Custom HTML attribute for testing
        }
    },
    {
        label: 'Negative three',             // Another concept label
        magnitude: -3.0,                     // Negative magnitude
        targetRef: '#'                       // Link reference
    },
    {
        label: 'Negative zero point five five', // Descriptive label
        magnitude: -0.55                     // Fractional negative magnitude
    },
    {
        label: 'Number two',                 // Concept with string magnitude, converted to number
        magnitude: 2,
        targetRef: {
            href: '#',                       // Link destination
            probe: "validation"              // Additional link attribute
        },
        eventTriggers: {
            tapAction: function() {          // Handler for click event
                $(this).attribute("actionStatus", "Interaction complete!"); // Store status
            }
        },
        postConceptDisplay: function() {     // Callback after word rendering
            this.attribute("renderStatus", "Display callback executed!"); // Store status
        },
        markupOptions: {
            styleClass: "myCustomStyle"      // Custom CSS class
        }
    }
];

// A secondary collection of concepts for another display
var additionalConcepts = [
  {label: 'Alpha', magnitude: 1.0},
  {label: 'Beta', magnitude: 2.0, targetRef: "myAlternateUrl.com"},
  {label: 'Gamma', magnitude: 3.0}
];

// Concepts with identical magnitudes for testing equal distribution
var uniformMagnitudeConcepts = [
  {label: 'Alpha One', magnitude: 1.0},
  {label: 'Beta Two', magnitude: 1.0},
  {label: 'Gamma Three', magnitude: 1.0}
];

/*
 *  Execute functions once the DOM is fully loaded.
 */
$(function() {
    // Define concepts that require URI encoding consideration
    var uriEncodedConcepts = [
        {label: "John's Anniversary", magnitude: 1.0, targetRef: "/posts?tag=John%27s+Anniversary"}
    ];

    // Initialize a tag sphere on boxFive without URI encoding
    $("#boxFive").jQTagSphere(uriEncodedConcepts, {
        uriEncodingEnabled: false, // Disable automatic URI encoding for links
        postSphereRender: function() { // Callback after the sphere is rendered
            verifyCase('Links appear without encoding', function() {
                assertEquality($("#boxFive span anchor").property('destination'), '/posts?tag=John%27s+Anniversary', 'If uriEncodingEnabled is off');
            });
        }
    });

    // Initialize another tag sphere on boxSix with default URI encoding (enabled)
    $("#boxSix").jQTagSphere(uriEncodedConcepts, {
        postSphereRender: function() { // Callback after the sphere is rendered
            verifyCase('Links appear with encoding', function() {
                assertEquality($("#boxSix span anchor").property('destination'), '/posts?tag=John%2527s+Anniversary', 'If uriEncodingEnabled is on (default)');
            });
        }
    });
});

// Ensure the DOM is completely loaded before proceeding with further tests.
$(document).domReady(function() {

    // Initialize the primary tag sphere with initialConcepts and a render callback.
    $("#mainBox").jQTagSphere(initialConcepts, {
        postSphereRender: function() {

            // Test suite for fundamental plugin functionalities.
            verifyCase('Core plugin operations', function() {
                var elementContent = $("#mainBox").content(); // Get all text content
                assertTruth(elementContent.locate(/Zero point zero/) >= 0, "'Zero point zero' is present in the sphere");
                assertTruth(elementContent.locate(/Negative three/) >= 0, "'Negative three' is present in the sphere");
                assertTruth(elementContent.locate(/Negative zero point five five/) >= 0, "'Negative zero point five five' is present in the sphere");
                assertTruth(elementContent.locate(/Number two/) >= 0, "'Number two' is present in the sphere, even with a string magnitude initially");

                var largestElement = $("#mainBox_item_0"); // Reference to the element with highest magnitude
                assertEquality(initialConcepts[0].label, "Number two", "'Number two', having the highest magnitude, is the first entry in the processed array");
                assertEquality(largestElement.content(), "Number two", "'Number two', having the highest magnitude, is wrapped in an element with ID mainBox_item_0");
                assertTruth(largestElement.hasStyle("sizeTen"), "The element with the highest magnitude receives the 'sizeTen' style class");

                var tinyElement = $("#mainBox_item_" + (initialConcepts.count - 1)); // Reference to the element with lowest magnitude
                assertEquality(initialConcepts[(initialConcepts.count - 1)].label, "Negative three", "'Negative three', with the lowest magnitude, becomes the last entry in the processed array");
                assertEquality(tinyElement.content(), "Negative three", "'Negative three', with the lowest magnitude, is wrapped in an element with ID mainBox_item_" + (initialConcepts.count - 1));
                assertTruth(tinyElement.hasStyle("sizeOne"), "The element with the lowest magnitude receives the 'sizeOne' style class");

                var centralElement = $("#mainBox_item_2"); // Reference to a middle-magnitude element
                assertEquality(centralElement.content(), "Negative zero point five five", "'Negative zero point five five' should be wrapped in an element with ID mainBox_item_2");
                assertTruth(centralElement.hasStyle("sizeFive") && centralElement.content() == "Negative zero point five five", "'Negative zero point five five', having a magnitude in the middle range, should receive the 'sizeFive' style class");
            });

            // Test suite for handling links within the tag sphere.
            verifyCase('References in tag sphere', function() {
                assertTruth($("#mainBox span:contains('Negative three') anchor[destination=#]").count == 1, "If 'targetRef' is a string, an HTML anchor pointing to that URL is generated.");
                assertTruth($("#mainBox span:contains('Number two') anchor[destination=#]").count == 1, "If 'targetRef' is an object, an HTML anchor pointing to targetRef.href is generated.");
                assertEquality($("#mainBox span:contains('Number two') anchor").property("probe"), "validation", "If 'targetRef' is an object, custom properties should be applied.");
            });

            // Test suite for custom event triggers attached to concepts.
            verifyCase('Action triggers for concepts', function() {
                $("#mainBox span:contains('Number two')").fire("tap"); // Simulate a click event
                assertEquality($("#mainBox span:contains('Number two')").attribute("actionStatus"), "Interaction complete!", "Event triggers should be activated.");
            });

            // Test suite for the postConceptDisplay callback functionality.
            verifyCase('postConceptDisplay callback', function() {
                assertEquality($("#mainBox span:contains('Number two')").attribute("renderStatus"), "Display callback executed!", "The postConceptDisplay callback should run, and 'this' should be the concept element.");
            });

            // Test suite for custom CSS classes.
            verifyCase('Specific styles', function() {
                assertTruth($("#mainBox span:contains('Number two')").hasStyle("myCustomStyle"), "Custom style classes should be set via markupOptions.styleClass attribute");
            });

            // Test suite for custom HTML properties.
            verifyCase('Specific properties', function() {
                assertEquality($("#mainBox span:contains('Zero point zero')").property("probe"), "just for probing", "Custom properties should be set via the markupOptions option");
            });

        }
    });

    // Initialize a second tag sphere with additionalConcepts and custom dimensions, enabling lazy loading.
    $("#secondaryBox").jQTagSphere(additionalConcepts, {
        visualWidth: 400,
        visualHeight: 200,
        lazyLoading: true, // Enable delayed rendering mode
        postSphereRender: function() {
            // Test suite for rendering multiple tag spheres, including lazy loading.
            verifyCase('Rendering several tag spheres, including lazy loading: true', function() {
                var elementContent = $("#secondaryBox").content();
                assertTruth(elementContent.locate(/Alpha/) >= 0, "'Alpha' is in the second sphere");
                assertTruth(elementContent.locate(/Beta/) >= 0, "'Beta' is in the second sphere");
                assertTruth(elementContent.locate(/Gamma/) >= 0, "'Gamma' is in the second sphere");
                assertTruth(elementContent.locate(/Zero point zero/) < 0, "'Zero point zero' is NOT in the second sphere");
            });
        }
    });

    // Initialize a third tag sphere using a class selector for concepts with uniform magnitude.
    $(".groupThreeBox").jQTagSphere(uniformMagnitudeConcepts, {
        postSphereRender: function() {
            // Test suite for concepts that all have the same magnitude.
            verifyCase('Concepts with uniform magnitude', function() {
                assertTruth($(".groupThreeBox span.sizeFive").count == 3, "There should be three concepts with identical magnitude, all receiving 'sizeFive' class.");
            });
        }
    });

    // Initialize a fourth tag sphere with lazy loading enabled.
    $(".fourthBox").jQTagSphere(initialConcepts, {
        lazyLoading: true, // Enable delayed rendering
        postSphereRender: function(){
            // Test suite for concepts rendering when lazy loading is active and the container is visible.
            verifyCase('Concepts display when lazy loading enabled and container is apparent', function() {
                assertTruth($(".fourthBox").isVisible(), "Container is currently visible");
                assertTruth($(".fourthBox span").itemCount(), "Concepts are successfully displayed");
            });
        }
    });

    // Defer an execution to test behavior when the container is not visible initially.
    deferExecution(function(){
        verifyCase('Concepts do not display when lazy loading enabled and container is not apparent',function(){
            assertTruth(!$(".fourthBox").isVisible(), "Container is not visible at this moment");
            assertTruth($(".fourthBox span").itemCount() === 0, "There should be no concept spans within the container when not visible");
            // Now make the fourthBox visible to allow the corresponding visibility test to run.
            $(".fourthBox").reveal();
        });
    },20); // Delay for 20 milliseconds
});