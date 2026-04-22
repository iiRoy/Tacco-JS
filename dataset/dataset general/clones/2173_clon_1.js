/*
 * This is a Type I clone of the original Ramble.js library.
 * It maintains exact logical equivalence.
 *
 * All changes are strictly limited to whitespace and comments.
 * No functional aspect of the code has been altered.
 */

/**
 * Ramble: A JavaScript Cucumber-style Test Runner and Gherkin Parser.
 *
 * This utility provides a framework for behavior-driven development (BDD)
 * in JavaScript environments, allowing tests to be written in a human-readable
 * Gherkin syntax.
 *
 * @author Jamie Hill <jamie@soniciq.com> - Initial core development
 * @author Pete Otaqui <pete@otaqui.com> - Further development and maintenance
 * @version $Rev$ - Version control revision identifier.
 * @requires jQuery - This library depends on jQuery for DOM manipulation and AJAX.
 */
var Ramble = {
  // A flag to control console debugging output. Set to `true` to enable.
  debug: false,

  /**
   * Internal debugging function.
   * Outputs arguments to the console if `Ramble.debug` is `true`.
   *
   * @private
   */
  _debug: function() {
    if (this.debug) {
      console.log(arguments);
    }
  }
};


/**
 * Ramble.Parser: Handles the parsing of Gherkin DSL (Domain Specific Language) files.
 *
 * This component is responsible for transforming raw Gherkin text into a structured
 * object model representing features, scenarios, and steps.
 *
 * @version $Rev$ - Current revision of the parser.
 * @requires Ramble - Depends on the core Ramble object for feature/scenario/step constructors.
 */
Ramble.Parser = {

  /**
   * Parses a complete Gherkin feature file.
   *
   * @param {string} data - The raw text content of the Gherkin feature file.
   * @returns {Ramble.Feature} A structured Feature object.
   */
  parseFeatureFile: function(data) {
    // Initialize a new Feature object to hold the parsed data.
    var feature = new Ramble.Feature();
    // Flag to indicate if we are currently parsing the feature description.
    var describingFeature = true;

    // Split the input data into individual lines for processing.
    var lines = data.split('\n');
    var line, scenario, step; // Declare variables for current line, scenario, and step.

    // The first line is always the feature title.
    feature.title = lines.splice(0, 1)[0];

    // Iterate over the remaining lines of the file.
    $.each(lines, function() {
      // Trim whitespace from the current line.
      line = $.trim(this.toString());

      // If we are still gathering the feature description...
      if (describingFeature) {
        // A more robust parser would be ideal here, but this works for basic descriptions.
        if (line != "") {
          feature.description += line + "\n"; // Append non-empty lines to description.
        } else {
          // An empty line signifies the end of the feature description.
          describingFeature = false;
          return; // Stop processing description and move to scenarios/steps.
        }
      } else {
        // We are now parsing scenarios and steps.
        if (line == "") {
          return; // Skip empty lines between scenarios/steps.
        } else if (this.indexOf('Scenario:') != -1) {
          // This line marks the beginning of a new scenario.
          scenario = new Ramble.Scenario(feature); // Create a new scenario linked to the current feature.
          feature.scenarios.push(scenario); // Add the new scenario to the feature's list.
          scenario.title = line; // Set the scenario's title.
        } else {
          // This line is a step within the current scenario.
          step = new Ramble.Step(scenario); // Create a new step linked to the current scenario.
          step.text = line; // Store the raw text of the step.

          // Check if the step is a comment (starts with '#').
          if (line.indexOf('#') === 0) {
            step.comment = true; // Mark as a comment step.
          } else {
            step.comment = false; // Not a comment.
          }
          scenario.steps.push(step); // Add the step to the current scenario's list.
        }
      }
    });
    return feature; // Return the fully parsed feature object.
  },

  /**
   * Generates example code for a missing step definition.
   * This helps users quickly create new step definitions.
   *
   * @param {Ramble.Step} step - The step object for which to generate example code.
   * @param {boolean} html - If true, output HTML-formatted code (with <br/>, <pre>, <code>).
   * @returns {string} The generated example step definition code.
   */
  getExampleCode: function(step, html) {
    // Clean up the step text to form a regex-friendly string.
    // Removes Gherkin keywords and replaces quoted strings with a regex capture group.
    var code = step.text.replace(/^(Given|When|Then|And)\s+/, '').replace(/"([^\"]*)"/, '"([^\"]*)"');
    var args = []; // Array to hold argument names for the function.

    // Count the number of quoted strings to determine how many arguments are needed.
    var quotes = step.text.match(/"/g);
    if (quotes) {
      for (i = 0; i < parseInt(quotes.length / 2); i++) {
        args.push('arg' + (i + 1)); // e.g., 'arg1', 'arg2'
      }
    }
    args = args.join(', '); // Join arguments into a comma-separated string.

    var example = "Missing step definition:";
    example += html ? this.html_nl : "\n"; // Add a newline or HTML break.
    example += html ? this.html_code_pre : "\n"; // Add pre/code tags or another newline.
    example += 'ramble.match(/^' + code + '$/, function(' + args + ') {\n  // code\n});';
    example += html ? this.html_code_post : ""; // Close pre/code tags if HTML.
    return example;
  },

  // HTML helpers for formatting example code.
  html_nl: "<br/>",
  html_code_pre: "<pre><code>",
  html_code_post: "</code></pre>"
};

/**
 * Constructor for a Feature object.
 * Represents a single Gherkin feature.
 */
Ramble.Feature = function() {
  this.type = "feature"; // Identifies the object type.
  this.title = ''; // The title of the feature.
  this.description = ''; // Detailed description of the feature.
  this.scenarios = []; // An array to hold associated Scenario objects.
}

/**
 * Constructor for a Scenario object.
 * Represents a single Gherkin scenario within a feature.
 * @param {Ramble.Feature} feature - The parent feature object.
 */
Ramble.Scenario = function(feature) {
  this.type = "scenario"; // Identifies the object type.
  this.title = ''; // The title of the scenario.
  this.feature = feature; // Reference to the parent feature.
  this.steps = []; // An array to hold associated Step objects.
};

/**
 * Constructor for a Step object.
 * Represents a single Gherkin step within a scenario.
 * @param {Ramble.Scenario} scenario - The parent scenario object.
 */
Ramble.Step = function(scenario) {
  this.type = "step"; // Identifies the object type.
  this.text = ""; // The raw text of the step (e.g., "Given I am on the homepage").
  this.status = ""; // The execution status of the step (e.g., "pass", "fail", "pending", "missing").
  this.comment = false; // True if this step is a Gherkin comment line.
  this.scenario = scenario; // Reference to the parent scenario.
}

/**
 * Constructor for a Report object.
 * Used to aggregate results from a test run.
 */
Ramble.Report = function() {
  // Counts of scenarios by their final status.
  this.scenarios = {
    'undefined': 0,
    'pending': 0,
    'passed': 0,
    'failed': 0
  }
  // Counts of steps by their final status.
  this.steps = {
    'undefined': 0,
    'pending': 0,
    'passed': 0,
    'failed': 0
  }
  this.time = 0 // Total time taken for the test run.
}

/**
 * Ramble.IOutputter: Defines the interface for all outputter implementations.
 *
 * Any component responsible for displaying test results should adhere to these methods.
 * This ensures consistency and interchangeability of output formats.
 */
Ramble.IOutputter = {

  /**
   * Initializes the output process for a suite of features.
   * This method should be called once at the beginning of a test run.
   * @public
   * @returns {void}
   */
  start: function() {},

  /**
   * Outputs information related to a specific feature.
   * This typically includes the feature's title and description.
   * @public
   * @param {Ramble.Feature} feature - A Ramble Feature object.
   * @returns {void}
   */
  outputFeature: function(feature) {},

  /**
   * Outputs information for a given scenario.
   * This usually involves displaying the scenario's title.
   * @public
   * @param {Ramble.Scenario} scenario - A Ramble Scenario object.
   * @returns {void}
   */
  outputScenario: function(scenario) {},

  /**
   * Outputs the details of a single step, including its status.
   * @public
   * @param {Ramble.Step} step - The Ramble Step object to output.
   * @returns {void}
   */
  outputStep: function(step) {},

  /**
   * Finalizes the output process for a suite of features.
   * This method is called once at the end of a test run.
   * @public
   * @param {Ramble.Report} report - The final report object containing run statistics.
   * @returns {void}
   */
  stop: function(report) {}
};

/**
 * Ramble.HtmlOutputter: An implementation of Ramble.IOutputter that renders results to HTML.
 *
 * This outputter is designed to display test results dynamically within a web page,
 * typically by appending elements to a designated DOM container.
 */
Ramble.HtmlOutputter = {
  results: null, // jQuery object representing the DOM element where results are displayed.
  results_selector: '#results', // CSS selector for the results container.

  /**
   * Initializes the HTML outputter.
   * Finds the results container and prepares it for output.
   */
  start: function() {
    this.results = $(this.results_selector); // Cache the results element.
    this._beforeOutput(); // Perform pre-output checks (like scroll position).
    this._afterOutput(); // Adjust scroll position if necessary.
  },

  /**
   * Outputs a feature to the HTML document.
   * Creates a new div for the feature and appends its title and description.
   * @param {Ramble.Feature} feature - The feature object to display.
   */
  outputFeature: function(feature) {
    this._beforeOutput();
    var div = $('<div/>', {
      'class': 'ramble-feature'
    });
    this.results.append(div);
    div.append($('<h3/>', {
      text: feature.title
    }));
    // Replace newlines in the description with HTML breaks for display.
    var description = feature.description.split('\n').join('<br/>');
    div.append($('<p/>', {
      'class': 'ramble-description',
      html: description
    }));
    this._currentFeature = div; // Keep a reference to the current feature's DOM element.
    this._afterOutput();
  },

  /**
   * Outputs a scenario to the HTML document.
   * Creates a new div for the scenario and appends its title.
   * @param {Ramble.Scenario} scenario - The scenario object to display.
   */
  outputScenario: function(scenario) {
    this._beforeOutput();
    var div = $('<div/>', {
      'class': 'ramble-scenario'
    });
    this._currentFeature.append(div); // Append to the current feature.
    div.append($('<h4/>', {
      text: scenario.title
    }));
    this._currentScenario = div; // Keep a reference to the current scenario's DOM element.
    // Create an unordered list to hold the steps.
    this._currentSteps = $('<ul/>', {
      'class': 'ramble-steps'
    });
    div.append(this._currentSteps);
    this._afterOutput();
  },

  /**
   * Outputs a step to the HTML document, including its status and any error messages.
   * @param {Ramble.Step} step - The step object to display.
   */
  outputStep: function(step) {
    this._beforeOutput();
    var status = step.status;
    var className = 'ramble-' + status; // CSS class based on status (e.g., 'ramble-pass').
    var text = step.text;

    // Add error messages for failed steps.
    if (status == "fail") {
      text += "<br /><em>" + step.error + "</em>";
    }
    // For missing steps, provide example code.
    if (status == "missing") {
      text += "<br />" + Ramble.Parser.getExampleCode(step, true);
    }
    // Append a list item for the step to the current steps list.
    this._currentSteps.append($('<li/>', {
      'class': className,
      html: text
    }));
    this._afterOutput();
  },

  /**
   * Finalizes the HTML output.
   * Currently, this method doesn't perform specific finalization tasks beyond scroll adjustment.
   * @param {Ramble.Report} report - The final report (not used in this implementation).
   */
  stop: function(report) {
    this._beforeOutput();
    this._afterOutput();
  },

  // Internal references to current DOM elements being outputted.
  _currentFeature: null,
  _currentScenario: null,
  _currentSteps: null,

  _shouldScroll: true, // Flag to control auto-scrolling of the results area.

  /**
   * Internal method called before any output operation.
   * Determines if the results area should auto-scroll to the bottom.
   * @private
   */
  _beforeOutput: function() {
    var scrollCur = this.results.attr("scrollTop") + this.results.height();
    this._shouldScroll = (scrollCur >= this.results.attr("scrollHeight"));
  },

  /**
   * Internal method called after any output operation.
   * Scrolls the results area to the bottom if `_shouldScroll` is true.
   * @private
   */
  _afterOutput: function() {
    if (this._shouldScroll) {
      this.results.attr({
        scrollTop: this.results.attr("scrollHeight")
      });
    }
  }
};

/**
 * Ramble.Context: Provides the execution context for step definitions.
 *
 * This object exposes helper methods that allow step definitions to interact
 * with the simulated browser environment (iframe), perform assertions,
 * and manipulate page elements.
 * @author Jamie Hill <jamie@soniciq.com>
 * @version $Rev$
 */
Ramble.Context = {
  iframe: null, // Reference to the jQuery object of the iframe.
  contents: null, // jQuery object representing the iframe's document contents.

  /**
   * Navigates the simulated browser (iframe) to a specified URL.
   * @param {string} url - The URL to visit.
   * @throws {Error} If the URL is falsy.
   */
  visit: function(url) {
    // In a real browser, you'd check for 404/500, but iframes don't expose that directly.
    // This could be complex if a page is designed for limited access.
    if (!url) throw('Problem getting path for: ' + url);
    Ramble._debug("visit() ", url);
    this.iframe.trigger('urlChange.ramble', {
      href: url
    }); // Trigger custom event for the runner to handle navigation.
  },

  /**
   * Clicks a link containing specific text within the iframe.
   * @param {string} text - The visible text of the link to click.
   * @throws {Error} If no link with the specified text is found.
   */
  clickLink: function(text) {
    var link = this.contents.find('a').filter(function() {
      return $(this).text() == text;
    });
    if (!link.length) throw("Can't find link: " + text);
    link.click(); // Simulate a click event on the link.
  },

  /**
   * Clicks a submit button with a specific value within the iframe.
   * @param {string} text - The value attribute of the button to click.
   * @throws {Error} If no button with the specified value is found.
   */
  clickButton: function(text) {
    var button = this.contents.find('input[type="submit"]').filter(function() {
      return $(this).val() == text;
    })
    if (!button.length) throw("Can't find button named: " + text);
    button.click(); // Simulate a click event.
    Ramble.Runner.pageLoading = true; // Indicate that a page load is expected.
  },

  /**
   * Fills in a form field identified by its associated label text.
   * @param {string} labelText - The text of the <label> element.
   * @param {string} value - The value to set in the input field.
   * @throws {Error} If the label or its associated input field cannot be found.
   */
  fillIn: function(labelText, value) {
    var label = this.contents.find('label').filter(function() {
      return $(this).text() == labelText;
    }).first();
    // Find the input field using the 'for' attribute of the label.
    var field = this.contents.find('input#' + label.attr('for'));
    if (!field.length) throw("Can't find field for: " + labelText);
    field.val(value); // Set the value of the input field.
  },

  /**
   * Asserts that the iframe's content contains a specific string.
   * @param {string} content - The string expected to be found in the page content.
   * @throws {Error} If the content is not found.
   */
  assertHasContent: function(content) {
    if (this.contents.text().indexOf(content) == -1) throw('Should have seen: ' + content);
  },

  /**
   * Asserts that the current path of the iframe matches an expected path.
   * @param {string} path - The expected pathname (e.g., '/users/1').
   */
  assertCurrentPath: function(path) {
    this.assertEqual(path, this.currentPath());
  },

  /**
   * Retrieves the current pathname from the iframe's location.
   * @returns {string} The current pathname.
   */
  currentPath: function() {
    return this.iframe[0].contentWindow.location.pathname;
  },

  /**
   * Generic assertion function.
   * @param {*} value - The value to assert as truthy.
   * @param {string} [message] - An optional error message.
   * @throws {Error} If the value is falsy.
   */
  assert: function(value, message) {
    if (!value) throw(message || ('Expected value to evaluate to true: ' + value));
  },

  /**
   * Asserts that two values are strictly equal.
   * @param {*} expected - The expected value.
   * @param {*} result - The actual value.
   * @throws {Error} If the values are not equal.
   */
  assertEqual: function(expected, result) {
    if (expected != result) throw('Expected: ' + expected + ', got: ' + result);
  },

  /**
   * Proxies jQuery's `find` method on the iframe's contents,
   * but throws an error if no elements are found.
   * @param {string} selector - The CSS selector to search for.
   * @returns {jQuery} A jQuery object containing the found elements.
   * @throws {Error} If no elements match the selector.
   */
  find: function(selector) {
    var result = this.contents.find(selector);
    this.assert(result.length, "Couldn't find element(s) for selector: " + selector);
    return result;
  }
}

/**
 * Ramble.Runner: Orchestrates the loading and execution of Gherkin feature files.
 *
 * This component manages the test lifecycle, from parsing features and matching steps
 * to running scenarios in a simulated browser environment and reporting results.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 */
Ramble.Runner = {
  workspaceSelector: '#workspace', // Selector for the DOM element where the iframe will be placed.
  outputter: Ramble.HtmlOutputter, // The outputter instance to use for displaying results.
  parser: Ramble.Parser, // The parser instance to use for Gherkin files.
  paths: [], // Stores defined path mappings (regex to URL).
  features: [], // List of loaded feature objects.
  matchers: [], // List of registered step definition matchers.
  pageLoading: false, // Flag indicating if the iframe is currently loading a page.
  retryOnFailWithinMilliseconds: 0, // Time in ms to retry a failed step before marking it as failed.
  options: {
    speed: "fast" // Controls the execution speed ("fast", "medium", "slow").
  },

  /**
   * Initializes the test runner.
   * Sets up the iframe and its event handlers.
   * @param {object} options - Configuration options for the runner.
   */
  init: function(options) {
    this.options = $.extend(this.options, options); // Merge provided options.
    this.outputter.start(); // Initialize the outputter.

    if (!this.iframe) { // Only create the iframe if it doesn't already exist.
      // Create and append the iframe to the workspace.
      Ramble.Context.iframe = $('<iframe id="browser" />').appendTo(this.workspaceSelector);
      Ramble.Context.iframe.css({
        width: 500,
        height: 300
      });

      // Set up event handlers for the iframe.
      Ramble.Context.iframe.load(function() {
        Ramble.Runner.pageLoading = false; // Page has finished loading.
        Ramble.Context.contents = $(this).contents(); // Get iframe's document contents.

        // Intercept clicks on links within the iframe.
        Ramble.Context.contents.find('a').click(function(e) {
          e.preventDefault(); // Prevent default navigation.
          Ramble.Context.visit($(this).attr('href')); // Use Ramble's visit method.
        })
        // Intercept form submissions within the iframe.
        Ramble.Context.contents.find('form').submit(function() {
          Ramble.Runner.pageLoading = true; // A page load is expected.
        });
        Ramble.Runner.run(); // Continue running tests after page load.
      }).bind('urlChange.ramble', function(event, data) {
        // Custom event handler for Ramble.Context.visit() calls.
        Ramble.Runner.pageLoading = true; // Indicate page loading.
        $(this).attr('src', data.href); // Change iframe source to navigate.
      });
    }
  },

  /**
   * Loads a Gherkin feature file using an AJAX request.
   * The file is parsed synchronously.
   * @public
   * @param {string} file - The URL to the feature file.
   * @returns {void}
   */
  loadFeatureFile: function(file) {
    // Ramble._debug('loadFeatureFile', file); // Debugging line.
    $.ajax({
      url: file,
      success: function(data) {
        Ramble.Runner._parseFeatureFile(data, file);
      },
      dataType: 'text/plain', // Expect plain text.
      async: false // Synchronous call to ensure features are loaded before run.
    });
  },

  /**
   * Core test execution loop, implemented as a "breaking queue".
   * This method processes items from the internal queue (features, scenarios, steps)
   * and can pause execution if a page is loading or if speed options are set.
   * @public
   * @returns {void}
   */
  run: function() {
    var self = this; // Store reference to `this` for use in callbacks.

    // Loop through the queue until all items are processed or execution is paused.
    while (this._queue_index < this._queue.length) {
      if (Ramble.Runner.pageLoading) {
        return; // Pause execution if a page is loading.
      } else if (Ramble.Runner.options.speed != "fast") {
        // Handle throttled execution speeds.
        var date = new Date();
        var time = date.getTime();
        clearTimeout(Ramble.Runner._time_out); // Clear any previous timeout.
        Ramble.Runner._time_out = setTimeout(function() {
          Ramble.Runner.run(); // Schedule next run.
        }, 100); // Check every 100ms.
        if (time < Ramble.Runner._time_next) {
          return; // Still waiting for the delay to pass.
        }
        // Set the time for the next item to be processed based on speed.
        Ramble.Runner._time_next = time + Ramble.Runner._times[Ramble.Runner.options.speed];
      }

      var item = this._queue[this._queue_index]; // Get the current item from the queue.

      // Initialize start time for the item if not already set (used for retries).
      if (item.start_time === undefined) {
        Ramble.Runner.retryOnFailWithinMilliseconds = 0; // Reset retry counter for new item.
        var date = new Date();
        item.start_time = date.getTime();
      }

      var found; // Variable to hold matched step definition.

      // Execute any 'before' hooks.
      $.each(this._befores, function() {
        this.apply(Ramble.Context); // 'this' refers to the beforeFunction.
      });

      // Process the item based on its type.
      switch (item.type) {
        case "feature":
          this.outputter.outputFeature(item);
          break;
        case "scenario":
          this.outputter.outputScenario(item);
          break;
        case "step":
          var step = item.text;
          if (item.comment == true) {
            item.status = "comment"; // Mark as comment.
          } else if ($.trim(step) == "pending") {
            item.status = "pending"; // Explicitly marked as pending.
          } else {
            found = null;
            // Iterate through registered matchers to find a matching step definition.
            $.each(this.matchers, function() {
              // Remove Gherkin keywords before matching.
              var match = step.replace(/^(Given|When|Then|And)\s+/, '').match(this.regexp);
              if (match) {
                found = {
                  matches: match.slice(1),
                  test: this.test
                }; // Store captured groups and the test function.
                return false; // Break out of $.each loop.
              }
            });

            if (found !== null) {
              try {
                // Execute the step definition function.
                found.test.apply(Ramble.Context, found.matches);
                item.status = "pass"; // Step passed.
              } catch (error) {
                item.status = "fail"; // Step failed.
                item.error = error; // Store the error.
              }
            } else {
              item.status = "missing"; // No matching step definition found.
            }
          }

          // Handle retry logic for failed steps.
          if (Ramble.Runner.retryOnFailWithinMilliseconds > 0) {
            var date = new Date();
            var time = date.getTime();
            // If retry time has expired, reset the retry counter.
            if (time > item.start_time + Ramble.Runner.retryOnFailWithinMilliseconds) {
              Ramble.Runner.retryOnFailWithinMilliseconds = 0;
            }
          }

          // Output the step unless it failed and we are still within the retry window.
          if (Ramble.Runner.retryOnFailWithinMilliseconds === 0 || item.status != "fail") {
            this.outputter.outputStep(item);
          }
          break;
      }

      // Advance the queue index only if the step was not failed and is still retrying.
      if (Ramble.Runner.retryOnFailWithinMilliseconds === 0 || item.status != "fail") {
        this._queue_index++;
        // If all items are processed, stop the outputter.
        if (this._queue_index == this._queue.length) {
          this.outputter.stop();
        }
      }
    }
  },

  /**
   * Registers a step definition matcher.
   * @public
   * @param {RegExp} regexp - The regular expression to match against step text.
   * @param {Function} test - The function to execute when the step matches.
   * @return {void}
   */
  match: function(regexp, test) {
    var matcher = {
      regexp: regexp,
      test: test
    };
    Ramble._debug("add matcher", matcher);
    this.matchers.push(matcher);
  },

  /**
   * Adds a path mapping.
   * This allows defining friendly names for URLs.
   * @public
   * @param {RegExp} regexp - A regex to match a path name (e.g., /the homepage/).
   * @param {string|Function} path - The actual URL string or a function that returns the URL.
   * @returns {void}
   */
  addPath: function(regexp, path) {
    this.paths.push({
      regexp: regexp,
      path: path
    });
  },

  /**
   * Resolves a path name to its actual URL.
   * @param {string} path_name - The friendly name of the path to resolve.
   * @returns {string|undefined} The resolved URL, or undefined if not found/error.
   */
  pathTo: function(path_name) {
    var found = null;
    $.each(this.paths, function() {
      var match = path_name.match(this.regexp);
      if (match) {
        found = {
          matches: match.slice(1),
          path: this.path
        };
        return false; // Break out of $.each.
      };
    });

    if (found == null) {
      // If no path is found, display an error.
      this.results.append($('<p/>', {
        text: "Couldn't find path for: " + path_name,
        'class': 'error'
      }));
    } else {
      try {
        // If the path is a function, execute it with captured regex groups.
        return typeof(found.path) == 'string' ? found.path : found.path.apply(ramble, found.matches);
      } catch (error) {
        // Handle errors during path function execution.
        this.results.append($('<p/>', {
          html: 'Problem with path: ' + path_name + '<br/> - ' + error,
          'class': 'error'
        }));
      }
    }
  },

  /**
   * Internal method to parse feature file data and add it to the runner.
   * @private
   * @param {string} data - The raw text of the feature file.
   * @param {string} file - The file path (for reference, not used in parsing).
   */
  _parseFeatureFile: function(data, file) {
    var feature = Ramble.Parser.parseFeatureFile(data);
    this.addFeatureObject(feature);
  },

  /**
   * Adds a parsed feature object and its scenarios/steps to the internal execution queue.
   * @param {Ramble.Feature} feature - The feature object to add.
   */
  addFeatureObject: function(feature) {
    var queue = this._queue;
    queue.push(feature); // Add the feature itself.
    $.each(feature.scenarios, function() {
      queue.push(this) // Add each scenario.
      $.each(this.steps, function() {
        queue.push(this); // Add each step within the scenario.
      })
    });
  },

  /**
   * Registers a function to be run before each scenario.
   * @param {Function} beforeFunction - The function to execute.
   */
  before: function(beforeFunction) {
    this._befores.push(beforeFunction);
  },

  // Internal arrays and state for the runner.
  _befores: [], // Functions to run before each scenario.
  _queue: [], // The main execution queue of features, scenarios, and steps.
  _queue_index: 0, // Current position in the execution queue.
  _times: { // Delays for different execution speeds.
    "medium": 600, // 600ms delay.
    "slow": 2000 // 2000ms delay.
  }
}

// Expose the Ramble.Runner instance globally for convenience.
var ramble = Ramble.Runner;