/* Tree.js v0.6.2 https://github.com/Wizek/Tree */
// This file constitutes the core of the Tree.js library.
// It is wrapped in an Immediately Invoked Function Expression (IIFE)
// to create a private scope and prevent pollution of the global namespace.
void function () {


	// The primary factory function for creating a Tree instance.
	// This function encapsulates the entire framework.
	function _virgoTreeInstance() {

		// The central `tree` object, which doubles as the main entry point
		// and method container for the framework.
		var tree = function ( act, forgot ) {
			// Store the `act` parameter, which typically represents the current test function or context.
			tree._act = act ;

			// Provide a warning to the developer if `forgot` is a function,
			// suggesting a potential oversight regarding the `.branch()` method.
			if (typeof forgot == 'function' ) {
				console.warn("Didn't you forget about .branch() somewhere?");
			}

			// Return the `tree` object itself to enable method chaining.
			return tree;
		};

		// Assign a one-time setup function. Note: `oneTimeSetUp` is assumed to be
		// defined elsewhere in the larger application context.
		tree._virgoTreeInstance = oneTimeSetUp;



		// --- Core Framework Objects and Configuration Storage ---

		// `tree.not`: An object used for negating assertions (e.g., `tree.not.ok()`).
		tree.not = { _not:true };

		// `tree._asserts`: An empty object serving as a registry for all assertion functions.
		tree._asserts = {};

		// `tree._helpers`: An empty object designated for various utility and helper functions.
		tree._helpers = {};



		// `tree.config` (also aliased as `tree.cfg`): The central configuration management function.
		// It supports both reading and writing configuration values based on its arguments.
		tree.config = tree.cfg = function ( obj, val ) {
			// `defaults` variable: Declared but currently unused. May be for future enhancements.
			var defaults = {};

			// `heritable` flag: Indicates whether the configuration is being applied to heritable properties.
			// This is determined by the context (`this`) from which `config` was called.
			var heritable = this._heritable;

			// `spec` flag: Indicates if the configuration call is for a specific scope
			// (e.g., `tree.oneLevel.cfg` vs. a general `tree.config`).
			var spec = this._spec;

			// Normalize the input `obj` and `val` into a consistent object format.
			// This allows flexible configuration calls (e.g., `tree.config('key', 'value')` or `tree.config({key: 'value'})`).
			var obj = tree.cfg._morph(obj, val);

			// --- Conditional Logic for Configuration Operations ---

			// If `obj` is `null` or a string, it signifies a request to read configuration data.
			if (obj == null || typeof obj == 'string' ) {
				return read(obj);
			}
			// If `obj` is an object, it signifies a request to write configuration data.
			else if (typeof obj == 'object' ) {
				return write(obj);
			}


			// --- Internal Helper Function: `write` ---
			// Handles the persistence of configuration properties.
			function write ( obj ) {
				if (heritable) {
					// If in a heritable context, store properties in `tree.config.heritable`.
					for (var key in obj) { // Iterating over object properties.
						if (obj.hasOwnProperty(key)) {
							tree.config.heritable[key] = obj[key];
						}
					}
				} else {
					// Otherwise, store properties in `tree.config.oneLevel` (non-heritable).
					for (var key in obj) { // Iterating over object properties.
						if (obj.hasOwnProperty(key)) {
							tree.config.oneLevel[key] = obj[key];
						}
					}
				}
				// After writing, return the combined configuration view.
				return read();
			}


			// --- Internal Helper Function: `read` ---
			// Retrieves configuration values based on the specified context (`spec` flag).
			function read ( str ) {
				if ( !spec ) {
					// If not specific, return a mixed view of both heritable and one-level configurations.
					return getMixed(str);
				}
				else {
					// If `spec` is true, return values from the specific configuration scope.
					if (str) {
						return getProper()[str]; // Fetch a single property.
					} else {
						return getProper(); // Fetch the entire specific configuration object.
					}
				}


				// --- Nested Helper Function: `getProper` ---
				// Returns the direct configuration object (either heritable or one-level).
				function getProper () {
					if (heritable) {
						return tree.config.heritable;
					} else {
						return tree.config.oneLevel;
					}
				}


				// --- Nested Helper Function: `getMixed` ---
				// Combines heritable and one-level configurations. One-level properties override heritable ones.
				function getMixed ( str ) {
					var her = tree.config.heritable; // Reference to heritable config.
					var one = tree.config.oneLevel; // Reference to one-level config.

					if (str) { // If a specific property key is provided.
						// Check `one` first, then fallback to `her`.
						return (typeof one[str] !== 'undefined' ?
							one[str]
							: her[str]);
					}
					else { // If no specific key, return a new object with merged properties.
						var out = {}; // Initialize an empty object for the merged result.
						// Copy all properties from `heritable` first.
						for (var key in her) {
							if (her.hasOwnProperty(key)) {
								out[key] = her[key];
							}
						}
						// Overlay properties from `oneLevel`, overwriting if keys are duplicated.
						for (var key in one) {
							if (one.hasOwnProperty(key)) {
								out[key] = one[key];
							}
						}
						return out; // The fully merged configuration object.
					}
				}
			}
		}; // End of `tree.config` / `tree.cfg` function definition.


		// --- Input Morphing Helper for `tree.config` ---
		// This internal helper normalizes arguments passed to `tree.config`.
		tree.config._morph = function (obj, val) {
			// If `obj` is an object and not null, it's already in the desired format.
			if (typeof obj == 'object' && obj) {
				// In this scenario, the `val` parameter is irrelevant.
				return obj;
			}
			// If `obj` is a string, it could be either a read or a write request.
			else if (typeof obj == 'string' ) {
				// If `val` is `undefined`, it indicates a request to read a single property.
				if (typeof val == 'undefined' ) {
					return obj; // Return the key string itself for the `read` function.
				} else { // If `val` is defined, it's a request to write a single key-value pair.
					var o = {}; // Create a temporary object.
					o[obj] = val; // Assign the key-value pair.
					return o; // Return this object.
				}
			} else {
				// For any other input type, assume a general read request (return all configurations).
				return null;
			}
		};

		// Initialize the storage for non-heritable (one-level) configuration properties.
		tree.config.oneLevel = {};

		// Initialize the storage for heritable configuration properties.
		tree.config.heritable = {};


		// --- Specialized Configuration Accessors ---

		// `tree.oneLevel`: Provides a context for managing non-heritable configurations.
		tree.oneLevel = {
			_heritable: false, // Explicitly marks this context as non-heritable.
			_spec: true, // Indicates this is a specific configuration context.
			config: tree.cfg, // Alias to the main configuration function.
			cfg: tree.cfg      // Another alias for convenience.
		};

		// `tree.heritable`: Provides a context for managing heritable configurations.
		tree.heritable = {
			_heritable: true, // Explicitly marks this context as heritable.
			_spec: true, // Indicates this is a specific configuration context.
			cfg: tree.cfg, // Alias to the main configuration function.
			config: tree.cfg // Another alias for convenience.
		};


		// --- General Utility Helpers ---

		// `tree._helpers.getCallerLine`: A utility to retrieve the source code location
		// (file and line number) from which a function was called. Essential for reporting.
		tree._helpers.getCallerLine = function (l) {
			var t = new Error().stack; // Capture the current JavaScript call stack.
			return t ?
				t.split('\n')[l ? l : 4].match(/\(?(\S+\w)\)?$/)[1] // Parse the relevant stack frame.
				: '(unknown)'; // Fallback string if stack trace is unavailable (e.g., some browsers).
		};


		// `tpl` (aliased as `tree._helpers._templater`): A simple templating engine.
		// It processes strings containing placeholders and conditional blocks.
		var tpl = tree._helpers._templater = function (tplstr, vars) {
			// Ensure `vars` is an object, defaulting to an empty object if not provided.
			if (typeof vars != 'object' ) {
				var vars = {};
			}

			// Basic input validation: the template string must be a string.
			if (typeof tplstr != 'string' ) {
				throw new Error('Template string is not a string!');
			}

			// Regular expression for truthy conditional blocks: `{{#var}}...{{/var}}`.
			var RE_ifTruthy = /{{\s*#\s*(.*?)\s*}}(.*?){{\s*\/\s*\1\s*}}/g;
			// Regular expression for falsy conditional blocks: `{{^var}}...{{/var}}`.
			var RE_ifFalsy = /{{\s*\^\s*(.*?)\s*}}(.*?){{\s*\/\s*\1\s*}}/g;

			// Process and expand truthy blocks.
			while (tplstr.match(RE_ifTruthy) ) {
				tplstr = tplstr.replace(RE_ifTruthy,
					function (full, varName, content, pos, oStr) {
						if (vars[varName]) {
							return content; // If variable is truthy, include the content.
						} else {
							return ''; // Otherwise, remove the content.
						}
					});
			}

			// Process and expand falsy blocks.
			while ( tplstr.match(RE_ifFalsy) ) {
				tplstr = tplstr.replace(RE_ifFalsy,
					function (full, varName, content, pos, oStr) {
						if (vars[varName]) {
							return ''; // If variable is truthy, remove the content.
						} else {
							return content; // Otherwise (if falsy), include the content.
						}
					});
			}

			// Finally, replace all simple variable placeholders (e.g., `{{var}}`) with their values.
			return tplstr.replace(/{{\s*([^}]*?)\s*}}/g,
				function (match, group, pos, oStr) {
					if (group in vars) {
						return vars[group]; // Replace with the corresponding variable value.
					} else {
						return ''; // If variable not found, replace with an empty string.
					}
				});
		}; // End of `tpl` / `_templater` function.


		// `tree._helpers._formateer`: A robust utility for converting various JavaScript data types
		// into human-readable string representations, with options for 'long' (detailed) output.
		tree._helpers._formateer = function (input, long) {
			var output = ''; // Initialize the output string.
			var type = typeof input; // Determine the JavaScript type of the input.

			// --- Type-Specific Formatting Logic ---

			if (type == 'number') {
				output = input.toString(); // Numbers are directly converted to their string form.
			}
			else if (type == 'string') {
				// Smartly formats strings, escaping quotes to prevent issues in display.
				var single = input.match(/'/g);
				var double = input.match(/"/g);
				var sgl = "'";
				var dbl = '"';
				var esc = '\\';

				if (single && double) {
					// If both types of quotes exist, use the one that appears less frequently for wrapping.
					if (double.length < single.length) {
						output = dbl + input.replace(/"/g, esc + dbl) + dbl;
					} else {
						output = sgl + input.replace(/'/g, esc + sgl) + sgl;
					}
				} else if (single) {
					// If only single quotes are present, wrap the string in double quotes.
					output = dbl + input + dbl;
				} else {
					// If no single quotes (or only double quotes), wrap in single quotes.
					output = sgl + input + sgl;
				}
			}
			else if (type == 'function') {
				if (long) {
					output = input.toString(); // For 'long' format, return the full function source.
				} else {
					output = 'fn(){...}'; // For 'short' format, return a concise representation.
				}
			}
			else if (Array.isArray(input)) {
				if (long) {
					output = JSON.stringify(input, null, 2); // For 'long' format, pretty-print as JSON.
				} else {
					output = '[...]'; // For 'short' format, use a compact array representation.
				}
			}
			else if (type == 'object' && input && input.toString() === '[object Object]') {
				if (long) {
					output = JSON.stringify(input, null, 2); // For 'long' format, pretty-print as JSON.
				} else {
					output = '{...}'; // For 'short' format, use a compact object representation.
				}
			}
			else if (type == 'boolean') {
				output = input.toString(); // Booleans are converted directly.
			}
			else if (type == 'undefined') {
				output = 'undefined'; // Explicit string for `undefined`.
			}
			else if (input == null) {
				output = 'null'; // Explicit string for `null`.
			}
			else {
				output = '[unknown type: ' + input + ']'; // Fallback for any unhandled types.
			}
			return output; // Return the final formatted string.
		}; // End of `_formateer` function.


		// --- Announcer Module: Manages UI Updates and Test Reporting ---

		tree._announcer = {};

		// `tree._announcer.registerBranch`: Adds a new test branch entry to the visual tree display.
		tree._announcer.registerBranch = function (newBranch) {
			var $pe = $(tree._domElem); // Get the jQuery object for the parent DOM element.
			var html = tree._htmlTpl; // Reference to HTML templates for convenience.

			if (newBranch.commented) {
				// If the branch is marked as commented, extract its name from the comment string.
				var name = newBranch.name.match('(// *)(.*)')[2];
				// Append a special "commented" branch entry to the parent's unordered list.
				$pe.children('ul').append(
					tpl(html.branch, {
						comm: true, // Flag indicating this is a commented branch.
						gut:
							tpl(html.branchGut, {
								summary: htmlEncode(name + ' (' + tree._helpers.getCallerLine() + ')') // HTML-encoded summary.
							})
					})
				);
			} else {
				// If the branch is not commented, ensure the DOM is initialized if it hasn't been already.
				if (!tree._global.inited) {
					tree._initDom();
					tree._global.inited = true;
				}
				// Construct the actual DOM element for the new branch using templates.
				newBranch._domElem = $(
					tpl(html.branch, {
						gut:
							tpl(html.branchGut, {
								summary: htmlEncode(newBranch.cfg('name')) // Get and HTML-encode the branch's configured name.
							})
					})
				).get(0); // Retrieve the raw DOM element from the jQuery object.
				// Append the newly created branch element to the parent's unordered list.
				$(tree._domElem).children('ul').append(newBranch._domElem);
			}
			// Update the top-level status display to indicate that tests are still in progress.
			this.updateTreeTop(this.getStatusString('running'));

			// If the parent branch was initially marked as having no children, update its classes.
			if ($pe.hasClass('no-children')) {
				$pe.removeClass('no-children').addClass('collapsed'); // Remove 'no-children', add 'collapsed'.
			}

			// --- Nested Helper: `htmlEncode` ---
			// A utility function to escape special HTML characters, preventing Cross-Site Scripting (XSS).
			function htmlEncode (value) {
				return String(value)
					.replace(/&/g, '&amp;') // Replace ampersands first.
					.replace(/"/g, '&quot;') // Replace double quotes.
					.replace(/'/g, '&#39;') // Replace single quotes.
					.replace(/</g, '&lt;') // Replace less-than signs.
					.replace(/>/g, '&gt;'); // Replace greater-than signs.
			}
		}; // End of `registerBranch` function.


		// `tree._announcer.branchDone`: Callback executed when a test branch successfully completes.
		tree._announcer.branchDone = function (obj) {
			var $el = $(tree._domElem); // Current branch's jQuery DOM element.

			// Check if all child assertions and sub-branches have either passed or are commented out.
			if ($el.has('ul li:not(.passed):not(.commented)').length == 0 ) {
				$el.removeClass('await').addClass('passed'); // Mark the current branch as 'passed'.
				// If this branch has a parent, notify the parent about its completion.
				if (tree._parent) {
					tree._parent._announcer.branchDone();
				}
			}
		}; // End of `branchDone` function.


		// `tree._announcer.branchFail`: Callback executed when any part of a test branch (assertion or sub-branch) fails.
		tree._announcer.branchFail = function () {
			var $el = $(tree._domElem); // Current branch's jQuery DOM element.
			$el
				.removeClass('await') // Remove the 'await' status.
				//.removeClass('no-children') // This line was commented out in the original source code.
				.removeClass('collapsed') // Ensure the branch is expanded to reveal the failure.
				.removeClass('passed') // Remove 'passed' class in case it was set incorrectly or prematurely.
				.addClass('failed') // Mark the branch as 'failed'.
				.addClass('expanded'); // Ensure the branch is visibly expanded.

			// Propagate the failure notification up to the parent branch.
			if (tree._parent) {
				tree._parent._announcer.branchFail();
			}
		}; // End of `branchFail` function.


		// `tree._announcer.updateTreeTop`: Updates the main summary text displayed at the very top of the test tree.
		tree._announcer.updateTreeTop = function (txt) {
			$(tree._global.$treeTop).children('.summary').html(txt); // Set the HTML content of the top summary element.
		};


		// `tree._announcer.registerAssert`: Adds an individual assertion result to the visual test tree display.
		tree._announcer.registerAssert = function (obj) {
			// Initialize the DOM if it hasn't been done yet (e.g., for the very first assertion).
			if (!tree._global.inited) {
				tree._initDom();
				tree._global.inited = true;
			}
			// Update the top-level status to reflect that tests are currently running.
			this.updateTreeTop(this.getStatusString('running'));

			var $el = $(tree._domElem); // Current branch's jQuery DOM element.
			// If the branch was marked as having no children, update its classes accordingly.
			if ($el.hasClass('no-children')) {
				$el.removeClass('no-children').addClass('collapsed');
			}

			// If the assertion failed, trigger the `branchFail` logic, which propagates the failure upwards.
			if (!obj.pass) {
				tree._announcer.branchFail();
			}

			// Set the `path` property for the assertion, defaulting to the caller's line if not explicitly provided.
			obj.path = obj.path || tree._helpers.getCallerLine();

			// Determine and store the JavaScript types of the 'actual' (`act`) and 'expected' (`exp`) values for display.
			if (obj.act) {
				obj.actType = typeof obj.act;
			}
			if (obj.exp) {
				obj.expType = typeof obj.exp;
			}

			// Render the assertion's HTML using its template and append it to the current branch's unordered list.
			$el.children('ul').append(
				$(tpl(tree._htmlTpl.assert, obj))
			);
		}; // End of `registerAssert` function.


		// `tree._initDom`: Initializes the entire DOM structure required for the test results display.
		// This includes injecting necessary CSS and setting up interactive event handlers.
		tree._initDom = function ($elem) {
			// Critical dependency check: Tree.js requires jQuery to function.
			if (typeof jQuery === 'undefined' || !jQuery) {
				throw new Error('jQuery dependency not found');
			}

			// Prevent the DOM from being initialized multiple times.
			if (tree._global.inited) {
				return 'inited already';
			} else {
				tree._global.inited = true;
			}

			// Determine the base path for external CSS files, if a `baseUrl` is configured.
			var bp = tree._global.baseUrl ? tree._global.baseUrl : '';
			var cssFilePath = bp + 'tree.css'; // Construct the full path to the external CSS file.
			var html = tree._htmlTpl; // Reference to HTML templates.
			var tpl = tree._helpers._templater; // Reference to the templating engine.

			var $head; // Variable to hold the jQuery object for the `<head>` element.

			// Logic to determine where to append the test tree in the DOM.
			if (isDomElem($elem)) {
				var $elem = $($elem); // Convert the provided element to a jQuery object.
				$head = $elem.parents('html').children('head'); // Find the `<head>` element relative to the provided element.
			} else {
				// If `$elem` is a string, treat it as an ID for the target element.
				if (typeof $elem == 'string') {
					var id = $elem;
				}
				$elem = $('body'); // Default to appending to the `<body>` if no specific element is given.
				$head = $('head'); // Default to finding the `head` element.
			}

			// The comprehensive inline CSS stylesheet for styling the Tree.js display.
			var cssAsString = 'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio,canvas,video{display:inline-block;*display:inline;*zoom:1}audio:not([controls]){display:none}[hidden]{display:none}html{font-size:100%;overflow-y:scroll;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}body{margin:0}body,button,input,select,textarea{font-family:sans-serif}a:focus{outline:thin dotted}a:hover,a:active{outline:0}h1{font-size:2em}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}blockquote{margin:1em 40px}dfn{font-style:italic}mark{background:#ff0;color:#000}pre,code,kbd,samp{font-family:monospace,serif;_font-family:\'courier new\',monospace;font-size:1em}pre{white-space:pre;white-space:pre-wrap;word-wrap:break-word}q{quotes:none}q:before,q:after{content:\'\';content:none}small{font-size:75%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}ul,ol{margin-left:0;padding:0 0 0 40px}dd{margin:0 0 0 40px}nav ul,nav ol{list-style:none;list-style-image:none}img{border:0;-ms-interpolation-mode:bicubic}svg:not(:root){overflow:hidden}figure{margin:0}form{margin:0}fieldset{border:1px solid #c0c0c0;margin:0 2px;padding:.35em .625em .75em}legend{border:0;*margin-left:-7px}button,input,select,textarea{font-size:100%;margin:0;vertical-align:baseline;*vertical-align:middle}button,input{line-height:normal}button,input[type="button"],input[type="reset"],input[type="submit"]{cursor:pointer;-webkit-appearance:button;*overflow:visible}input[type="checkbox"],input[type="radio"]{box-sizing:border-box;padding:0}input[type="search"]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}input[type="search"]::-webkit-search-decoration{-webkit-appearance:none}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}textarea{overflow:auto;vertical-align:top}table{border-collapse:collapse;border-spacing:0}div.tree-top{background:#eee;color:#201f1d;font:12pt \'Consolas\';padding:10px 10px 0;box-shadow:0 2px 10px 0 rgba(0,0,0,.50);padding-left:85px}div.tree-top>li>.summary em{font-style:normal;font-weight:700}div.tree-top .stamp{border:3px solid #008000;border-radius:5px;padding:0 2px}div.tree-top .stamp.await{border-color:#afdbf0;color:#9dde8a;color:#0d3446}div.tree-top .stamp.failed{border-color:#ff483c;color:#3f0400}div.tree-top .stamp.passed{border-color:#9dde8a;color:#193810}div.tree-top .stamp.comment{border-color:#ddd}div.tree-top ul{margin-top:0}div.tree-top li{list-style-type:none;margin-top:8px}div.tree-top li:not(.no-children)>span{cursor:pointer}div.tree-top li.branch.commented{color:#808080}div.tree-top li.branch.commented>.stamp{border-color:#ddd}div.tree-top li.assert .stamp.failed{background:#ff483c}div.tree-top li.assert .stamp.passed{background:#9dde8a}div.tree-top li.assert.failed table{border-left:4px #ff483c solid}div.tree-top li.assert.passed table{border-left:4px #9dde8a solid}div.tree-top li.assert table{font-size:80%;margin:6px 0 12px 40px;border-collapse:separate;border-spacing:5px}div.tree-top li.assert table th{border-right:2px rgba(0,0,0,.12) solid;vertical-align:top;font-weight:400;text-align:right;padding-right:5px}div.tree-top li.assert table td li{white-space:pre}div.tree-top .type.number,div.tree-top .type.string{color:#667bef}div.tree-top .collapsed>ul,div.tree-top .collapsed>table,div.tree-top .collapsed>.handle:not(.plus),div.tree-top .expanded>.handle:not(.minus),div.tree-top .no-children>.handle:not(.dot),div.tree-top .await>.stamp:not(.await),div.tree-top .failed>.stamp:not(.failed),div.tree-top .passed>.stamp:not(.passed),div.tree-top .commented>.stamp:not(.comment){display:none}div.tree-top .handle{color:#808080;font:bold 120% \'Lucidia Console\',monospace}div.tree-top *{-webkit-user-select:none;-khtml-user-select:none;-o-user-select:none;user-select:none}div.tree-top .summary,div.tree-top table,div.tree-top .summary *,div.tree-top table *{-webkit-user-select:initial;-khtml-user-select:initial;-o-user-select:initial;user-select:initial}div.tree-top div.logo,div.tree-top div.logo img{height:52.5px;width:60px;*zoom:1}div.tree-top div.logo img{opacity:.4;position:absolute;right:10px}div.tree-top li{text-indent:-75px}div.tree-top table{text-indent:0;margin-left:-35px!important}';
			var cssWrapperA = '<style id="tree">'; // Opening tag for inline style.
			var cssWrapperB = '</style>'; // Closing tag for inline style.

			// Check if the Tree.js stylesheet (inline or external) is already present in the document's head.
			if ($head.find('link#tree, style#tree').length == 0 ) {
				// If not present, inject either the inline CSS or a link to an external CSS file.
				(cssAsString ?
					$(cssWrapperA + cssAsString + cssWrapperB) // Inject inline CSS if `cssAsString` has content.
					: $('<link id="tree" rel="stylesheet" type="text/css" href="'
						+ cssFilePath + '"></link>') // Otherwise, create an external CSS link.
				).appendTo($head); // Append the style element or link to the `<head>`.

				// Attach live click handlers for expanding/collapsing branch elements.
				// `.live()` is used here for dynamically added elements (note: in modern jQuery, `.on()` is preferred).
				$('.tree-top').find('.collapsed>span, .expanded>span')
					.live('click', function () {
						$(this).siblings('ul, table').toggle().parent('li')
							.toggleClass('collapsed expanded'); // Toggle visibility of children and update classes.
					});
			}

			var summary = 'Empty'; // Initial summary text for the top-level tree.
			// Construct the initial HTML structure for the tree, including a default root branch.
			var $init =
				$(tpl(html.init, {
					id: id, // Optional ID for the top-level container div.
					path: html.logo, // Path (or data URI) for the logo image.
					gut:
						tpl(html.branch, {
							gut:
								tpl(html.branchGut, {
									summary: summary // Summary text for the initial branch.
								})
						})
				}));

			// Set global references to the top-level tree elements for easy access.
			var $treeTop = $init.children('li.branch').get(0); // The raw DOM element of the root branch.
			tree._global.$treeTop = $treeTop;
			tree._domElem = $treeTop; // The current active DOM element for the tree.
			$elem.append($init); // Append the entire initialized tree structure to the target element.

			// --- Nested Helper: `isDomElem` ---
			// A cross-browser compatible function to determine if an object is a DOM element.
			function isDomElem (o) {
				return (
					typeof HTMLElement === "object" ? o instanceof HTMLElement : // Modern browser check.
					typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string" // Older browser / general object check.
				);
			}
		}; // End of `_initDom` function.


		// `tree._announcer.EFD` (End of First Day): Marks the overall completion of the test run.
		tree._announcer.EFD = function () {
			tree._announcer.updateTreeTop(this.getStatusString('done')); // Update the top status display to 'done'.
		};


		// `tree._announcer.getStatusString`: Generates a formatted status message (e.g., "Running...", "Done...").
		tree._announcer.getStatusString = function (type) {
			var g = tree._global; // Reference to the global state object.
			g.time = Date.now() - g.tree_start; // Calculate the total elapsed time for the test run.
			var tpl = tree._helpers._templater; // Reference to the templating engine.
			// Render the status message using the appropriate template (`status_running` or `status_done`).
			return tpl(tree._htmlTpl['status_' + type], g);
		};


		// The following `tree.note` function is commented out in the original source.
		// It suggests a potential feature for adding notes to test results,
		// which might be deprecated, a work-in-progress, or reserved for future use.
		// tree.note = function(str) {
		//   this._note = str
		// }


		// --- HTML Template Definitions ---
		// These objects hold the HTML string templates used by `_templater` to render the UI.

		tree._htmlTpl = {
			init: '' + // Template for the initial wrapper `div.tree-top`.
				'\n<div {{#id}}id="{{ id }}"{{/id}} class="tree-top">' +
				'\n  {{ gut }}' +
				'\n  <div class="logo">' +
				'\n    <a class="inner" href="https://github.com/Wizek/Tree"' +
				'\n      title="Homepage of Tree.js">' +
				'\n      <img src="{{path}}" alt="Tree.js">' +
				'\n    </a>' +
				'\n  </div>' +
				'\n</div>',

			branch: '' + // Template for a single test branch (`<li>` element).
				'\n<li class="branch ' +
				'{{#comm}}commented{{/comm}}' + // Dynamically add 'commented' class if `comm` is truthy.
				'{{^comm}}await{{/comm}}' + // Dynamically add 'await' class if `comm` is falsy.
				' no-children">' + // Default class indicating no children initially.
				'\n  {{ gut }}' + // Placeholder for the branch's inner content (summary, handles, etc.).
				'\n</li>',

			branchGut: '' + // Template for the inner content of a test branch (`<span>` elements, `<ul>`).
				'\n<span class="handle plus">+</span>' + // Plus icon for expanding the branch.
				'\n<span class="handle minus">-</span>' + // Minus icon for collapsing the branch.
				'\n<span class="handle dot">&nbsp;</span>' + // Dot icon for branches that have no children.
				// '\n<span class="handle dot">&middot;</span>' // An alternative dot character, commented out in original.
				'\n' + // Blank line for visual separation.
				'\n<span class="stamp await">....</span>' + // Status stamp for 'awaiting' state.
				'\n<span class="stamp failed">fail</span>' + // Status stamp for 'failed' state.
				'\n<span class="stamp passed">pass</span>' + // Status stamp for 'passed' state.
				'\n<span class="stamp comment">&nbsp;//&nbsp;</span>' + // Status stamp for 'commented' state.
				'\n' + // Another blank line.
				'\n<span class="summary">{{summary}}' + // The main summary text for the branch.
				'{{^summary}}<i title="No name specified">Anonymuos</i>{{/summary}}' + // Default summary if none provided.
				'</span>' +
				'\n<ul>' + // Unordered list to contain child assertions or sub-branches.
				'\n</ul>',

			assert: '' + // Template for a single assertion result (`<li>` element).
				'\n<li class="assert ' +
				'{{#pass}}passed collapsed{{/pass}}' + // If assertion passed, apply 'passed' and 'collapsed' classes.
				'{{^pass}}failed expanded{{/pass}}' + // If assertion failed, apply 'failed' and 'expanded' classes.
				'">' +
				'\n  <span class="handle plus">+</span>' + // Plus handle.
				'\n  <span class="handle minus">-</span>' + // Minus handle.
				'\n  <span class="stamp failed">fail</span>' + // Failed status stamp.
				'\n  <span class="stamp passed">pass</span>' + // Passed status stamp.
				'\n  ' + // Blank space.
				'\n  <span class="summary">{{msg}}' + // The primary assertion message.
				//+ '{{^pass}}({{path}}){{/pass}}' // Original commented-out line for path on failure.
				'</span>' +
				'\n  <span class="note"></span>' + // Placeholder for additional notes.
				'\n  <table class="content">' + // Table to display detailed actual/expected values.
				//+ '\n    <tr> <th>Note</th> <td>This assert passes</td> </tr>' // Original commented-out example note.
				'\n    {{#actS}}<tr> <th>Result</th>' + // Row for the actual result.
				'<td class="type {{actType}}">{{actS}}</td> </tr>{{/actS}}' +
				'\n    {{#expS}}<tr> <th>Expected</th>' + // Row for the expected result.
				'<td class="type {{expType}}">{{expS}}</td> </tr>{{/expS}}' +
				'\n    {{#path}}<tr> <th>Path</th> <td>{{path}}</td> </tr>{{/path}}' + // Row for the assertion's source path.
				'\n  </table>' +
				'\n</li>',

			status_running: '' + // Template for the "running" status message displayed at the top.
				'<em>Running</em>,' +
				' took <em>{{time}}ms</em> to run' +
				' <em>{{passedAssertCount}}</em>/<em>{{assertCount}}</em> asserts' +
				' across <em>{{branchCount}}</em> branches' +
				'{{#commented}} (+<em>{{commented}}</em> commented out){{/commented}}' + // Optionally show count of commented items.
				' registered so far...',

			status_done: '' + // Template for the "done" status message.
				'<em>Done</em>,' +
				' took <em>{{time}}ms</em> to run' +
				' <em>{{passedAssertCount}}</em>/<em>{{assertCount}}</em> asserts' +
				' across <em>{{branchCount}}</em> branches.' +
				' {{#commented}}(+<em>{{commented}}</em> commented out){{/commented}}',

			logo: '\
        data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmc\
        vMjAwMC9zdmciIGhlaWdodD0iNzAiIHdpZHRoPSI4MCI+PGcgdHJhbnNmb3JtPSJ0\
        cmFuc2xhdGUoMCwtOTgyKSI+PHJlY3Qgcnk9IjEwIiBoZWlnaHQ9IjM1IiB3aWR0a\
        D0iNzAiIHN0cm9rZT0iIzAwMCIgeT0iOTkwIiB4PSI1Ii8+PHRleHQgeT0iMTAyMC\
        IgeD0iOCIgZm9udC1mYW1pbHk9IlRyZWJ1Y2hldCBNUyIgZmlsbD0iI2ZmZiI+PHR\
        zcGFuIGZvbnQtc2l6ZT0iMjhweCI+dHJlZTwvdHNwYW4+PHRzcGFuIGZvbnQtc2l6\
        ZT0iMTRweCI+anM8L3RzcGFuPjwvdGV4dD4KPHBhdGggZD0ibTQ1LjksMTA1MS45c\
        y0xLjItMi4zLTAuMS04LjRjNS4zLTIuMiwxNC40LTcuOSwxNC45LTE1LjVoLTQuMW\
        MwLjQsMC45LTAuOSwzLjgtMy40LDUuOS0wLjItMS43LTAuNy00LjQtMC44LTUuOWg\
        tMy4yYzAuMywyLjUsMC43LDUuMiwxLjYsOC4wLTEuNCwxLjQtNS44LDMuNS02Ljcs\
        My4yLTAuNS0yLjAtMC42LTYuNC0wLjUtMTEuM2gtNC4xYzAuMCwyLjksMC4wLDUuO\
        C0wLjMsNy44LTQuMi0xLjctNy40LTMuMi0xMC4xLTcuOGgtNy4xYzQuMCwzLjQsMy\
        41LDQuNSwxNS4yLDEyLjAsMC40LDQuMi0wLjUsOC4zLTEuNCwxMi4xeiIgc3Ryb2t\
        lPSIjMDAwIi8+PC9nPjwvc3ZnPg==' // Base64 encoded SVG image data for the Tree.js logo.
		}; // End of `tree._htmlTpl` object.


		// --- Assertion Template Definitions ---
		// These objects define the default message structures for various assertion types.

		tree._assertTpl = {
			_general: '{{actS}} {{#not}}not {{/not}}{{key}} {{expS}}', // General template for assertions.
			ok: '{{actS}} {{#not}}not {{/not}}ok', // Template for the 'ok' assertion message.
			pass: 'pass', // Simple message for the 'pass' assertion.
			fail: 'fail', // Simple message for the 'fail' assertion.
			truthy: '{{actS}} {{#not}}not {{/not}}truthy', // Template for the 'truthy' assertion message.
			falsy: '{{actS}} {{#not}}not {{/not}}falsy', // Template for the 'falsy' assertion message.
			throws: '{{actS}} {{#not}}not {{/not}}throws' // Template for the 'throws' assertion message.
		}; // End of `tree._assertTpl` object.


		// --- Assertion Function Implementations ---
		// These functions contain the actual logic for evaluating different assertion types.

		// `tree._asserts.ok`: Checks if the `act` (actual) value is truthy.
		tree._asserts.ok = function (obj) {
			obj.pass = !!obj.act; // Coerce `obj.act` to a boolean to determine pass/fail.
			return obj; // Return the updated assertion object.
		};


		// `tree._asserts.pass`: An assertion that always passes, useful for marking successful steps.
		tree._asserts.pass = function (obj) {
			obj.pass = true; // Explicitly set `pass` to true.
			return obj; // Return the updated assertion object.
		};


		// `tree._asserts.throws`: Verifies that a given function (`obj.act`) throws an error when executed.
		tree._asserts.throws = function (obj) {
			obj.pass = null; // Initialize `pass` to null before the try-catch block.
			try {
				obj.act(); // Attempt to execute the function.
			} catch (e) {
				obj.pass = true; // If an error is caught, the assertion passes.
			}
			obj.pass = obj.pass ? obj.pass : false; // Ensure `pass` is a boolean (true if caught, false if not).
			return obj; // Return the updated assertion object.
		};


		// `tree._asserts.fail`: An assertion that always fails, useful for explicitly marking test failures.
		tree._asserts.fail = function (obj) {
			obj.pass = false; // Explicitly set `pass` to false.
			return obj; // Return the updated assertion object.
		};


		// `tree._asserts.type`: Checks the data type of `obj.act` against the expected type `obj.exp`.
		tree._asserts.type = function (obj) {
			// Convert the expected type string to lowercase for case-insensitive matching.
			switch (obj.exp.toLowerCase()) {
				case 'array':
					obj.pass = Array.isArray(obj.act); // Use `Array.isArray` for robust array checking.
					break;
				case 'nan':
					obj.pass = !(obj.act === obj.act); // NaN is the only value not strictly equal to itself.
					break;
				default:
					obj.pass = typeof obj.act === obj.exp; // Use the standard `typeof` operator for other types.
					break;
			}
			return obj; // Return the updated assertion object.
		};
	} // End of `_virgoTreeInstance` function.


}(); // End of the IIFE.