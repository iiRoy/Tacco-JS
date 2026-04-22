var some_words = [ // Definition of the primary word set.
  {text: 'Zero',      weight: 0, html: {'test': 'just testing'}},
  {text: 'Minus three', weight: -3, link: '#'}, // A word with a negative weight and a link.
  {text: 'Minus zero point fiftyfive',
    weight: -0.55
  },
  { // A more complex word object definition.
    text: 'Two',
    weight: '2.0', /* Weight provided as a string, expecting conversion. */
    link: {href: '#', test: "testing"},
    handlers: {
      click: function() {
        $(this).data("testHandler", "Handler works!");
      }
    }, // End of handlers object.
    afterWordRender: function() { /* Callback after individual word rendering. */
      this.data("testCallback", "Callback works!");
    },
    html: {"class": "mycustomclass"} // Custom HTML attributes for the word span.
  }
]; // End of the 'some_words' array.

var some_other_words = [ // A secondary array of words for another cloud.
  {text: 'Abc', weight: 1},
  {text: 'Def', weight: 2, link: "myurl.com"}, // Word with an external link.
  {text: 'Ghi', weight: 3}
]; // End of 'some_other_words' array.

var some_words_with_same_weight = [ /* Words specifically for testing equal weight distribution. */
  {text: 'Abc', weight: 1},
  {text: 'Def', weight: 1},
  {text: 'Ghi', weight: 1}
] // End of 'some_words_with_same_weight' array.

$(function() { /* Shorthand for document.ready, specifically for encoding tests. */
  var encoded_words = [ // Words with characters that need encoding.
    {text: "John's Bday", weight: 1, link: "/posts?tag=John%27s+Bday"}
  ];

  $("#container5").jQCloud(encoded_words, { // Initialize jQCloud for container 5.
    encodeURI: false, // Disable URI encoding explicitly for this test.
    afterCloudRender: function() { /* Callback after cloud 5 renders. */
      test('Links render without encoding', function() {
        equal($("#container5 span a").attr('href'), '/posts?tag=John%27s+Bday', 'If encodeURI is turned off');
      }); // End of test function.
    } // End of afterCloudRender.
  }); // End of jQCloud call for container 5.

  $("#container6").jQCloud(encoded_words, { // Initialize jQCloud for container 6.
    // encodeURI is true by default, so no explicit setting here.
    afterCloudRender: function() { /* Callback after cloud 6 renders. */
      test('Links render with encoding', function() {
        equal($("#container6 span a").attr('href'), '/posts?tag=John%2527s+Bday', 'If encodeURI is turned on');
      }); // End of test function.
    } // End of afterCloudRender.
  }); // End of jQCloud call for container 6.
}); // End of document.ready shorthand.

$(document).ready(function() { /* Main document ready block for most plugin tests. */

  $("#container").jQCloud(some_words, {afterCloudRender: function() { /* Initialize jQCloud for the first container. */

    test('Basic plugin functionality', function() { // Test suite for core features.
      var text = $("#container").text(); // Get all visible text within the container.
      ok(text.search(/Zero/) >= 0, "'Zero' is in the cloud");
      ok(text.search(/Minus three/) >= 0, "'Minus three' is in the cloud");
      ok(text.search(/Minus zero point fiftyfive/) >= 0, "'Minus zero point five' is in the cloud");
      ok(text.search(/Two/) >= 0, "'Two' is in the cloud, even if the weight was a string"); // Verifies string weight handling.

      var biggest = $("#container_word_0"); // The word with the highest weight.
      equal(some_words[0].text, "Two", "'Two', having the biggest weight, becomes the first element in the array"); // Check internal array order.
      equal(biggest.text(), "Two", "'Two', having the biggest weight, gets wrapped in an element of id container_word_0"); // Check rendered text and ID.
      ok(biggest.hasClass("w10"), "the element with the biggest weight gets wrapped in an element of class w10"); // Check class for max weight.

      var smallest = $("#container_word_" + (some_words.length - 1)); // The word with the lowest weight.
      equal(some_words[(some_words.length - 1)].text, "Minus three", "'Minus three', having the smallest weight, becomes the last element in the array"); // Check internal array order.
      equal(smallest.text(), "Minus three", "'Minus three', having the smallest weight, gets wrapped in an element of id container_word_"+(some_words.length - 1)); // Check rendered text and ID.
      ok(smallest.hasClass("w1"), "the element with the smallest weight gets wrapped in an element of class w1"); // Check class for min weight.

      var middle = $("#container_word_2"); // A word with a mid-range weight.
      equal(middle.text(), "Minus zero point fiftyfive", "'Minus zero point fiftyfive' should get wrapped in an element of id container_word_2"); // Check rendered text and ID.
      ok(middle.hasClass("w5") && middle.text() == "Minus zero point fiftyfive", "'Minus zero point fiftyfive', having a weight in the middle of the range, should get wrapped in an element of class w5"); // Check class for mid weight.

    }); // End of 'Basic plugin functionality' test.

    test('links into word cloud', function() { // Test suite for link rendering.
      ok($("#container span:contains('Minus three') a[href=#]").length == 1, "If 'link' option is specified and is a string, an html anchor pointing to that URL is created.");
      ok($("#container span:contains('Two') a[href=#]").length == 1, "If 'link' option is specified and is an object, an html anchor pointing to link.href is created.");
      equal($("#container span:contains('Two') a").attr("test"), "testing", "If 'link' option is specified and is an object, custom attributes should be set.");
    }); // End of 'links into word cloud' test.

    test('Event handlers for words', function() { // Test suite for custom event handlers.
      $("#container span:contains('Two')").trigger("click"); // Simulate a user click.
      equal($("#container span:contains('Two')").data("testHandler"), "Handler works!", "Event handlers should be triggered.");
    }); // End of 'Event handlers for words' test.

    test('afterWordRender callback', function() { // Test suite for the afterWordRender callback.
      equal($("#container span:contains('Two')").data("testCallback"), "Callback works!", "afterWordRender callback should be called, and 'this' should be the word element.");
    }); // End of 'afterWordRender callback' test.

    test('Custom classes', function() { // Test suite for custom CSS classes.
      ok($("#container span:contains('Two')").hasClass("mycustomclass"), "Custom classes should be set via html.class attribute");
    }); // End of 'Custom classes' test.

    test('Custom attributes', function() { // Test suite for custom HTML attributes.
      equal($("#container span:contains('Zero')").attr("test"), "just testing", "Custom attributes should be set via the html option");
    }); // End of 'Custom attributes' test.

  }}); // End of jQCloud initialization for #container.

  $("#container2").jQCloud(some_other_words, {width: 400, height: 200, delayed_mode: true, afterCloudRender: function() { /* Initialize second cloud. */

    test('Multiple word clouds rendering, also with delayed_mode: true', function() { // Test suite for multiple clouds and delayed mode.
      var text = $("#container2").text();
      ok(text.search(/Abc/) >= 0, "'Abc' is in the second cloud");
      ok(text.search(/Def/) >= 0, "'Def' is in the second cloud");
      ok(text.search(/Ghi/) >= 0, "'Ghi' is in the second cloud");
      ok(text.search(/Zero/) < 0, "'Zero' is not in the second cloud"); // Ensure words from other clouds are not present.
    }); // End of 'Multiple word clouds rendering' test.

  }}); // End of jQCloud initialization for #container2.

  $(".container3").jQCloud(some_words_with_same_weight, {afterCloudRender: function() { /* Initialize cloud for equal weights. */

    test('Words with equal weight', function() { // Test suite for words with identical weights.
      ok($(".container3 span.w5").length == 3, "There should be three words with equal weight."); // All should fall into the same class.
    }); // End of 'Words with equal weight' test.

  }}); // End of jQCloud initialization for .container3.

  $(".container4").jQCloud(some_words, { // Initialize cloud for delayed rendering visibility test.
    delayedMode: true, // Enable delayed rendering.
    afterCloudRender: function() { /* Callback after cloud 4 renders. */
      test('Words render when delayedMode true and container is visible', function() {
        ok($(".container4").is(':visible'), "Container is visible"); // Confirm visibility.
        ok($(".container4 span").size(), "Words render"); // Confirm words are rendered.
      }); // End of test.
    } // End of afterCloudRender.
  }); // End of jQCloud initialization for .container4.

  setTimeout(function() { // Use a timeout to simulate a delay for visibility changes.
    test('Words do not render when delayedMode true and container is not visible', function() {
      ok(!$(".container4").is(':visible'), "Container is not visible"); // Verify container is initially hidden.
      ok($(".container4 span").size() === 0, "There should be no spans in the container"); // Verify no words rendered yet.
      // Now set container4 to visible so that the corresponding visibility test executes
      $(".container4").show(); // Make the container visible to trigger rendering.
    }); // End of test.
  }, 20); // Short delay for this test.
}); // End of main document ready function.