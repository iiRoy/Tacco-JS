/*******************************************************************************************************************************
 *
 * This is a Type I clone of the QUnit v1.7.0pre framework.
 *
 * Original source: http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2012 John Resig, Jörn Zaefferer
 * Licensed under either the MIT (MIT-LICENSE.txt) or GPL (GPL-LICENSE.txt) licenses.
 *
 * Extensive modifications to whitespace and comments have been applied to create this clone.
 * All functional code, identifiers, and expressions remain precisely as in the original.
 *
 *******************************************************************************************************************************/

( function( window ) {

/* Declare core QUnit objects and configuration variables */
var QUnit,
	config,
	testId = 0, /* Counter for unique test IDs */

	// Determine the file name from the stacktrace, removing path and line numbers.
	fileName = ( sourceFromStacktrace( 0 ) || "" ).replace( /(:\d+)+\)?/, "" ).replace( /.+\//, "" ),

	// Cache Object.prototype.toString for type checking.
	toString = Object.prototype.toString,

	// Cache Object.prototype.hasOwnProperty for property checking.
	hasOwn = Object.prototype.hasOwnProperty,

	/* Define feature detection flags */
	defined = {
		// Check if setTimeout is available in the current environment.
		setTimeout: typeof window.setTimeout !== "undefined",

		// Check for sessionStorage support.
		sessionStorage: ( function() {
			var x = "qunit-test-string"; // A temporary string for testing sessionStorage.
			try {
				sessionStorage.setItem( x, x );      // Attempt to set an item.
				sessionStorage.removeItem( x );   // Attempt to remove the item.
				return true;                             // If both succeed, sessionStorage is supported.
			} catch( e ) {
				return false;                           // If any error occurs, it's not supported or accessible.
			}
		}() )
	};

/*
 * Test constructor function.
 * Initializes a new Test object with given settings.
 * @param {Object} settings - Configuration for the test.
 */
function Test( settings ) {
	extend( this, settings );             // Copy properties from settings to this instance.
	this.assertions = [];                   // Initialize an empty array to store assertion results.
	this.testNumber = ++Test.count;   // Assign a unique test number and increment the static counter.
}


Test.count = 0; // Initialize a static counter for all Test instances.


Test.prototype = {
	/**
	 * Initializes the DOM elements for displaying the test.
	 */
	init: function() {
		var a,
			b,
			li,
			tests = id( "qunit-tests" ); // Get the container for test results.

		if ( tests ) { /* Only proceed if the test container exists */
			b = document.createElement( "strong" ); // Create a strong tag for the test name.
			b.innerHTML = this.name; // Set the inner HTML to the test's name.

			// 'a' is initialized at the top of this scope.
			a = document.createElement( "a" ); // Create an anchor tag for rerun functionality.
			a.innerHTML = "Rerun"; // Label the link "Rerun".
			a.href = QUnit.url( { testNumber: this.testNumber } ); // Construct the URL to rerun this specific test.

			li = document.createElement( "li" ); // Create a list item for the test result.
			li.appendChild( b ); // Add the test name to the list item.
			li.appendChild( a ); // Add the rerun link to the list item.
			li.className = "running"; // Set the class to "running" to indicate active status.
			li.id = this.id = "qunit-test-output" + testId++; // Assign a unique ID to the list item.

			tests.appendChild( li ); // Append the list item to the main test container.
		}
	},

	/**
	 * Sets up the test environment before a test runs.
	 * Handles module transitions and calls the user-defined setup function.
	 */
	setup: function() {
		/* Check if the current module is different from the previous one */
		if ( this.module !== config.previousModule ) {
			if ( config.previousModule ) {
				// If there was a previous module, log its completion.
				runLoggingCallbacks( "moduleDone", QUnit, {
					name: config.previousModule,
					failed: config.moduleStats.bad,
					passed: config.moduleStats.all - config.moduleStats.bad,
					total: config.moduleStats.all
				} );
			}
			config.previousModule = this.module; // Update the previous module.
			config.moduleStats = { all: 0, bad: 0 }; // Reset module statistics.
			// Log the start of the new module.
			runLoggingCallbacks( "moduleStart", QUnit, {
				name: this.module
			} );
		} else if ( config.autorun ) {
			// If autorun is enabled and it's the same module, still log moduleStart if not already done.
			runLoggingCallbacks( "moduleStart", QUnit, {
				name: this.module
			} );
		}

		config.current = this; // Set the current test in the global config.

		/* Extend the default test environment with module-specific settings */
		this.testEnvironment = extend( {
			setup: function() {},      // Default empty setup function.
			teardown: function() {} // Default empty teardown function.
		}, this.moduleTestEnvironment );

		// Log the start of the current test.
		runLoggingCallbacks( "testStart", QUnit, {
			name: this.testName,
			module: this.module
		} );

		// Allow utility functions to access the current test environment.
		// TODO: Re-evaluate if this global assignment is truly necessary or if there's a better pattern.
		QUnit.current_testEnvironment = this.testEnvironment;

		if ( !config.pollution ) {
			// Save global variables to detect accidental global pollution.
			saveGlobal();
		}

		/* Execute the setup function, with or without try-catch based on configuration */
		if ( config.notrycatch ) {
			this.testEnvironment.setup.call( this.testEnvironment ); // Call setup directly.
			return; // Exit early.
		}
		try {
			this.testEnvironment.setup.call( this.testEnvironment ); // Call setup within a try-catch block.
		} catch( e ) {
			// If setup fails, record a failure.
			QUnit.pushFailure( "Setup failed on " + this.testName + ": " + e.message, extractStacktrace( e, 1 ) );
		}
	},

	/**
	 * Executes the test callback function.
	 */
	run: function() {
		config.current = this; // Set the current test instance.

		var running = id( "qunit-testresult" ); // Get the element displaying the "Running" status.

		if ( running ) {
			running.innerHTML = "Running: <br/>" + this.name; // Update the running status message.
		}

		if ( this.async ) {
			QUnit.stop(); // If the test is asynchronous, stop QUnit's auto-advancement.
		}

		/* Call the actual test function (callback) */
		if ( config.notrycatch ) {
			this.callback.call( this.testEnvironment, QUnit.assert ); // Call callback directly.
			return; // Exit.
		}

		try {
			this.callback.call( this.testEnvironment, QUnit.assert ); // Call callback within a try-catch.
		} catch( e ) {
			// If the test throws an unhandled exception, record it as a failure.
			QUnit.pushFailure( "Died on test #" + ( this.assertions.length + 1 ) + " " + this.stack + ": " + e.message, extractStacktrace( e, 0 ) );
			// Else, the next test will carry the responsibility.
			saveGlobal(); // Save global state again after an unexpected error.

			// Restart the tests if they're blocking.
			if ( config.blocking ) {
				QUnit.start();
			}
		}
	},

	/**
	 * Tears down the test environment after a test has run.
	 * Calls the user-defined teardown function and checks for global pollution.
	 */
	teardown: function() {
		config.current = this; // Ensure current test is set.

		/* Execute the teardown function, with or without try-catch */
		if ( config.notrycatch ) {
			this.testEnvironment.teardown.call( this.testEnvironment ); // Call teardown directly.
			return;
		} else {
			try {
				this.testEnvironment.teardown.call( this.testEnvironment ); // Call teardown within a try-catch.
			} catch( e ) {
				// Record failure if teardown throws an error.
				QUnit.pushFailure( "Teardown failed on " + this.testName + ": " + e.message, extractStacktrace( e, 1 ) );
			}
		}
		checkPollution(); // Check for global variable pollution.
	},

	/**
	 * Finalizes the test, reports results, and updates the UI.
	 */
	finish: function() {
		config.current = this; // Set current test.

		/* Check for expected assertion count */
		if ( this.expected != null && this.expected != this.assertions.length ) {
			QUnit.pushFailure( "Expected " + this.expected + " assertions, but " + this.assertions.length + " were run", this.stack );
		} else if ( this.expected == null && !this.assertions.length ) {
			// If no assertions were run and no explicit expect(0) was called.
			QUnit.pushFailure( "Expected at least one assertion, but none were run - call expect(0) to accept zero assertions.", this.stack );
		}

		var assertion, // Loop variable for individual assertions.
			a,         // Anchor element.
			b,         // Strong element for test name.
			i,         // Loop counter.
			li,        // List item element.
			ol,        // Ordered list element.
			test = this, // Reference to the current test instance.
			good = 0,    // Counter for passed assertions.
			bad = 0,     // Counter for failed assertions.
			tests = id( "qunit-tests" ); // The main test results container.

		config.stats.all += this.assertions.length;       // Accumulate total assertions for overall stats.
		config.moduleStats.all += this.assertions.length; // Accumulate total assertions for module stats.

		if ( tests ) { // If the DOM element exists to display results.
			ol = document.createElement( "ol" ); // Create an ordered list for assertion details.

			/* Iterate through all assertions for this test */
			for ( i = 0; i < this.assertions.length; i++ ) {
				assertion = this.assertions[ i ]; // Get the current assertion.

				li = document.createElement( "li" ); // Create a list item for the assertion.
				li.className = assertion.result ? "pass" : "fail"; // Set class based on success/failure.
				li.innerHTML = assertion.message || ( assertion.result ? "okay" : "failed" ); // Display message.
				ol.appendChild( li ); // Add assertion to the ordered list.

				if ( assertion.result ) {
					good++; // Increment pass count.
				} else {
					bad++; // Increment fail count.
					config.stats.bad++;         // Increment overall bad count.
					config.moduleStats.bad++; // Increment module bad count.
				}
			}

			// Store result when possible, for reordering tests.
			if ( QUnit.config.reorder && defined.sessionStorage ) {
				if ( bad ) {
					sessionStorage.setItem( "qunit-test-" + this.module + "-" + this.testName, bad ); // Store failure count.
				} else {
					sessionStorage.removeItem( "qunit-test-" + this.module + "-" + this.testName ); // Remove if passed.
				}
			}

			if ( bad === 0 ) {
				ol.style.display = "none"; // Hide assertion details if all passed.
			}

			// 'b' is initialized at the top of scope.
			b = document.createElement( "strong" ); // Create strong tag for test summary.
			b.innerHTML = this.name + " <b class='counts'>(<b class='failed'>" + bad + "</b>, <b class='passed'>" + good + "</b>, " + this.assertions.length + ")</b>";

			/* Add event listener for toggling assertion details */
			addEvent( b, "click", function() {
				var next = b.nextSibling.nextSibling, // The ol element is the second next sibling.
					display = next.style.display;
				next.style.display = display === "none" ? "block" : "none"; // Toggle display.
			} );

			/* Add event listener for double-click to rerun single test */
			addEvent( b, "dblclick", function( e ) {
				var target = e && e.target ? e.target : window.event.srcElement; // Get the event target.
				if ( target.nodeName.toLowerCase() == "span" || target.nodeName.toLowerCase() == "b" ) {
					target = target.parentNode; // Adjust target if a child element was clicked.
				}
				if ( window.location && target.nodeName.toLowerCase() === "strong" ) {
					window.location = QUnit.url( { testNumber: test.testNumber } ); // Navigate to rerun URL.
				}
			} );

			// 'li' is initialized at the top of scope, referencing the test's list item.
			li = id( this.id ); // Get the specific list item for this test.
			li.className = bad ? "fail" : "pass"; // Set final class (fail/pass).
			li.removeChild( li.firstChild ); // Remove the original 'strong' (test name).
			a = li.firstChild; // The rerun link is now the first child.
			li.appendChild( b ); // Append the new summary strong tag.
			li.appendChild( a ); // Re-append the rerun link.
			li.appendChild( ol ); // Append the ordered list of assertions.

		} else {
			/* If no DOM container, just update counts internally */
			for ( i = 0; i < this.assertions.length; i++ ) {
				if ( !this.assertions[ i ].result ) {
					bad++;                      // Increment bad count.
					config.stats.bad++;         // Increment overall bad count.
					config.moduleStats.bad++; // Increment module bad count.
				}
			}
		}

		/* Trigger the 'testDone' logging callback */
		runLoggingCallbacks( "testDone", QUnit, {
			name: this.testName,
			module: this.module,
			failed: bad,
			passed: this.assertions.length - bad,
			total: this.assertions.length
		} );

		QUnit.reset(); // Reset QUnit state for the next test.
	},


	/**
	 * Queues the execution of the test's lifecycle methods (init, setup, run, teardown, finish).
	 */
	queue: function() {
		var bad,      // Variable to hold reorder status.
			test = this; // Reference to the current test instance.

		// Synchronize the initialization step.
		synchronize( function() {
			test.init();
		} );

		/**
		 * Helper function to run the core test lifecycle.
		 * Each step is wrapped in `synchronize` to handle async operations.
		 */
		function run() {
			// Each of these steps can be asynchronous.
			synchronize( function() {
				test.setup();
			} );
			synchronize( function() {
				test.run();
			} );
			synchronize( function() {
				test.teardown();
			} );
			synchronize( function() {
				test.finish();
			} );
		}

		// 'bad' is initialized at the top of scope.
		// Defer when a previous test run passed, if session storage is available and reordering is enabled.
		bad = QUnit.config.reorder && defined.sessionStorage &&
			+sessionStorage.getItem( "qunit-test-" + this.module + "-" + this.testName );

		if ( bad ) {
			run(); // If test previously failed, run it immediately (not deferred).
		} else {
			synchronize( run, true ); // Otherwise, defer the execution of the test.
		}
	}
};


// Root QUnit object.
// 'QUnit' is initialized at the top of scope.
QUnit = {

	// Call on start of module test to prepend name to all tests.
	module: function( name, testEnvironment ) {
		config.currentModule = name;                         // Set the current module name.
		config.currentModuleTestEnviroment = testEnvironment; // Set the current module's test environment.
	},

	// Defines an asynchronous test.
	asyncTest: function( testName, expected, callback ) {
		if ( arguments.length === 2 ) {
			callback = expected; // If 'expected' is omitted, it's actually the callback.
			expected = null;       // Set expected to null.
		}

		QUnit.test( testName, expected, callback, true ); // Call the main test function with async flag.
	},

	// Defines a synchronous or asynchronous test.
	test: function( testName, expected, callback, async ) {
		var test, // Variable to hold the new Test instance.
			name = "<span class='test-name'>" + escapeInnerText( testName ) + "</span>"; // HTML-escaped test name.

		if ( arguments.length === 2 ) {
			callback = expected; // Handle optional 'expected' argument.
			expected = null;
		}

		if ( config.currentModule ) {
			name = "<span class='module-name'>" + config.currentModule + "</span>: " + name; // Prepend module name if present.
		}

		// Create a new Test instance.
		test = new Test( {
			name: name,                                   // Display name (includes module if applicable).
			testName: testName,                           // Original test name.
			expected: expected,                           // Number of expected assertions.
			async: async,                                 // Is this an asynchronous test?
			callback: callback,                           // The test function to execute.
			module: config.currentModule,                 // The module this test belongs to.
			moduleTestEnvironment: config.currentModuleTestEnviroment, // Module-specific setup/teardown.
			stack: sourceFromStacktrace( 2 )              // Stack trace for test definition location.
		} );

		if ( !validTest( test ) ) {
			return; // If the test is not valid (e.g., filtered out), do not queue it.
		}

		test.queue(); // Add the test to the execution queue.
	},

	// Specify the number of expected assertions to guarantee that failed tests (no assertions are run at all) don't slip through.
	expect: function( asserts ) {
		config.current.expected = asserts; // Set the expected assertion count for the current test.
	},

	// Allows tests to explicitly control QUnit's execution flow.
	start: function( count ) {
		config.semaphore -= count || 1; // Decrease the semaphore count (default to 1).
		// Don't start until an equal number of stop-calls have been made.
		if ( config.semaphore > 0 ) {
			return; // If semaphore is still positive, wait.
		}
		// Ignore if start is called more often than stop.
		if ( config.semaphore < 0 ) {
			config.semaphore = 0; // Reset semaphore if it goes negative.
		}
		// A slight delay is introduced to avoid any current callbacks from interfering.
		if ( defined.setTimeout ) {
			window.setTimeout( function() {
				if ( config.semaphore > 0 ) {
					return; // Check semaphore again after delay.
				}
				if ( config.timeout ) {
					clearTimeout( config.timeout ); // Clear any pending test timeout.
				}

				config.blocking = false; // Release the blocking state.
				process( true );          // Continue processing the test queue.
			}, 13 ); // Small delay.
		} else {
			config.blocking = false; // Non-blocking if setTimeout is not available.
			process( true );          // Process immediately.
		}
	},

	// Pauses QUnit's execution, typically used in async tests.
	stop: function( count ) {
		config.semaphore += count || 1; // Increase the semaphore count (default to 1).
		config.blocking = true;         // Set QUnit to a blocking state.

		if ( config.testTimeout && defined.setTimeout ) {
			clearTimeout( config.timeout ); // Clear any previous timeout.
			config.timeout = window.setTimeout( function() {
				QUnit.ok( false, "Test timed out" ); // Record a failure if the test times out.
				config.semaphore = 1;                 // Force semaphore to 1 to allow start() to proceed.
				QUnit.start();                        // Manually call start to unblock.
			}, config.testTimeout ); // Set a new timeout.
		}
	}
};


// Assertion helpers.
// All of these must call either QUnit.push() or manually do:
// - runLoggingCallbacks( "log", .. );
// - config.current.assertions.push({ .. });
QUnit.assert = {
	/**
	 * Asserts a rough true-ish result.
	 * This is the most basic assertion, checking for truthiness.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 * @param {*} result - The value to assert as truthy.
	 * @param {string} msg - The message to display for this assertion.
	 */
	ok: function( result, msg ) {
		if ( !config.current ) {
			// Throw an error if ok() is called outside of a test context.
			throw new Error( "ok() assertion outside test context, was " + sourceFromStacktrace( 2 ) );
		}
		result = !!result; // Coerce result to a boolean.

		var source, // Variable to store the source code location.
			details = {
				result: result, // The boolean result of the assertion.
				message: msg    // The message provided for the assertion.
			};

		msg = escapeInnerText( msg || ( result ? "okay" : "failed" ) ); // HTML-escape the message.
		msg = "<span class='test-message'>" + msg + "</span>";          // Wrap message in a span for styling.

		if ( !result ) {
			source = sourceFromStacktrace( 2 ); // Get stack trace if assertion failed.
			if ( source ) {
				details.source = source; // Add source to details.
				// Add a table row with source code for failed assertions.
				msg += "<table><tr class='test-source'><th>Source: </th><td><pre>" + escapeInnerText( source ) + "</pre></td></tr></table>";
			}
		}
		runLoggingCallbacks( "log", QUnit, details ); // Log the assertion details.
		config.current.assertions.push( {
			result: result, // Store the boolean result.
			message: msg    // Store the formatted message.
		} );
	},

	/**
	 * Assert that the first two arguments are equal, with an optional message.
	 * Performs a loose equality check (==).
	 * @example equal( format( "Received {0} bytes.", 2), "Received 2 bytes.", "format() replaces {0} with next argument" );
	 * @param {*} actual - The actual value.
	 * @param {*} expected - The expected value.
	 * @param {string} message - The message to display.
	 */
	equal: function( actual, expected, message ) {
		QUnit.push( expected == actual, actual, expected, message ); // Use QUnit.push for reporting.
	},

	/**
	 * Assert that the first two arguments are not equal, with an optional message.
	 * Performs a loose inequality check (!=).
	 * @param {*} actual - The actual value.
	 * @param {*} expected - The expected value.
	 * @param {string} message - The message to display.
	 */
	notEqual: function( actual, expected, message ) {
		QUnit.push( expected != actual, actual, expected, message ); // Use QUnit.push for reporting.
	},

	/**
	 * Assert that the first two arguments are deeply equal, with an optional message.
	 * Uses QUnit.equiv for recursive comparison.
	 * @param {*} actual - The actual value.
	 * @param {*} expected - The expected value.
	 * @param {string} message - The message to display.
	 */
	deepEqual: function( actual, expected, message ) {
		QUnit.push( QUnit.equiv( actual, expected ), actual, expected, message ); // Use QUnit.push for reporting.
	},

	/**
	 * Assert that the first two arguments are not deeply equal, with an optional message.
	 * Uses QUnit.equiv for recursive comparison and negates the result.
	 * @param {*} actual - The actual value.
	 * @param {*} expected - The expected value.
	 * @param {string} message - The message to display.
	 */
	notDeepEqual: function( actual, expected, message ) {
		QUnit.push( !QUnit.equiv( actual, expected ), actual, expected, message ); // Use QUnit.push for reporting.
	},

	/**
	 * Assert that the first two arguments are strictly equal, with an optional message.
	 * Performs a strict equality check (===).
	 * @param {*} actual - The actual value.
	 * @param {*} expected - The expected value.
	 * @param {string} message - The message to display.
	 */
	strictEqual: function( actual, expected, message ) {
		QUnit.push( expected === actual, actual, expected, message ); // Use QUnit.push for reporting.
	},

	/**
	 * Assert that the first two arguments are not strictly equal, with an optional message.
	 * Performs a strict inequality check (!==).
	 * @param {*} actual - The actual value.
	 * @param {*} expected - The expected value.
	 * @param {string} message - The message to display.
	 */
	notStrictEqual: function( actual, expected, message ) {
		QUnit.push( expected !== actual, actual, expected, message ); // Use QUnit.push for reporting.
	},

	/**
	 * Assert that an error is thrown by the provided block of code.
	 * Can optionally check the type of error or its message using a RegExp.
	 * @param {Function} block - The function block expected to throw an error.
	 * @param {Function|RegExp|string} [expected] - Optional: Constructor, RegExp, or message to validate the error.
	 * @param {string} [message] - The message to display for this assertion.
	 */
	raises: function( block, expected, message ) {
		var actual, // Variable to hold the actual error thrown.
			ok = false; // Flag to indicate if the assertion passed.

		// Adjust arguments if 'expected' is a string (meaning it's actually the message).
		if ( typeof expected === "string" ) {
			message = expected; // Assign expected to message.
			expected = null;    // Clear expected.
		}

		try {
			block.call( config.current.testEnvironment ); // Execute the block within the test environment.
		} catch ( e ) {
			actual = e; // Catch the thrown error.
		}

		if ( actual ) {
			// If an error was actually thrown:
			// If no specific error expectation, then any error thrown passes.
			if ( !expected ) {
				ok = true;
				// If 'expected' is a regular expression, test the error against it.
			} else if ( QUnit.objectType( expected ) === "regexp" ) {
				ok = expected.test( actual );
				// If 'expected' is a constructor, check if the error is an instance of it.
			} else if ( actual instanceof expected ) {
				ok = true;
				// If 'expected' is a validation function, call it with the error.
			} else if ( expected.call( {}, actual ) === true ) {
				ok = true;
			}
		}

		QUnit.push( ok, actual, null, message ); // Report the assertion result.
	}
};

// @deprecated: Kept assertion helpers in root for backwards compatibility.
extend( QUnit, QUnit.assert );

/**
 * @deprecated: This comment is retained for backwards compatibility with previous QUnit versions.
 */