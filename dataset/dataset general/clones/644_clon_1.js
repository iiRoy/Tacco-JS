;(function ($, window, document, undefined) {
    /*
     * This self-executing anonymous function encapsulates the Waypoints library
     * to avoid polluting the global namespace. It receives jQuery/Zepto,
     * window, and document as arguments for better minification and clarity.
     */

    // --- Configuration Constants ---

    // Key used for storing the navigation history in browser's localStorage.
    var HISTORY_KEY = 'Waypoints.history';
    // Key used for storing a temporary navigation target in localStorage.
    var TARGET_KEY = 'Waypoints.target';
    // Maximum number of entries to retain in the navigation history.
    var HISTORY_LENGTH = 5;

    /**
     * @class Waypoints
     * @constructor
     *
     * The main Waypoints constructor function.
     * Initializes the instance with default debug and ignore settings.
     */
    function Waypoints() {
        // _ignore: A CSS selector for elements that Waypoints should not intercept.
        // Initially set to undefined, meaning no elements are explicitly ignored.
        this._ignore = undefined;
        // _debug: A boolean flag to enable or disable verbose console logging.
        // Set to false by default to keep the console clean in production.
        this._debug = false;
    }

    /*
     * Define the public API methods for the Waypoints object
     * by extending its prototype.
     */
    Waypoints.prototype = {

        /**
         * Resumes the Waypoints navigation logic. This method is typically called
         * on page load to handle potential redirects, target navigations, or
         * simply to execute a callback for the current page.
         *
         * @param {Function} done - An optional callback function to be executed
         *                          if the navigation settles on the current page
         *                          without requiring a redirect.
         * @returns {Waypoints} Returns the Waypoints instance for method chaining.
         */
        resume: function (done) {
            // Retrieve current navigation state variables.
            var history = this.history(); // The stored list of visited URLs.
            var target = this.target();   // A specific URL we were trying to reach.
            var latest = this.latest();   // The most recent URL in the history.
            var route = this.route();     // The current URL in the browser's address bar.

            // Check if there was an intended target from a previous Waypoints navigation.
            if (target) {
                /*
                 * Clear the stored target immediately. This is crucial to prevent
                 * infinite loops if the target doesn't match the route, or to ensure
                 * that subsequent navigations are treated as fresh.
                 */
                this.target(undefined);

                // If the current route doesn't match the target, it means we didn't
                // land on the expected page. Redirect to the last valid history entry.
                if (target !== route) {
                    if (this._debug) {
                        console.log('Waypoints.resume(): bad link -- target (' + target + ') does not match route (' + route + '), redirecting...');
                    }
                    this.redirect(); // Perform the redirection.
                    return this;     // Exit after redirecting.
                }

                // If the route matches the target, we successfully arrived. Bookmark it.
                if (this._debug) {
                    console.log('Waypoints.resume(): good link -- arrived at target(' + target + '), bookmarking...');
                }
                this.bookmark(); // Add the current route to history.
            }
            // If no target was set, but the current route is not the latest in history,
            // it implies an unexpected navigation (e.g., manual URL change).
            else if (latest && route !== latest) {
                if (this._debug) {
                    console.log('Waypoints.resume(): bad route -- route(' + route + ') does not match latest (' + latest + '), redirecting...');
                }
                this.redirect(); // Redirect to the last known good route.
                // If the base URLs are similar and a 'done' callback exists, execute it.
                if (shareBase(latest, route) && done) {
                    done();
                }
                return this; // Exit after redirecting.
            }

            // If we reach this point, the navigation is considered "good" or settled.
            // Execute the 'done' callback if provided.
            if (this._debug) {
                console.log('Waypoints.resume(): good route -- arrived at route(' + route + '), triggering callback...');
            }
            if (done) {
                done();
            }
            return this; // Allow chaining.
        },

        // --- Methods for managing Waypoints internal state ---

        /**
         * Gets or sets the debug mode.
         * In debug mode, Waypoints outputs detailed messages to the console.
         *
         * @param {boolean} [val] - Optional. If provided, sets the debug mode.
         * @returns {boolean|Waypoints} The current debug status if no argument is given,
         *                              otherwise the Waypoints instance for chaining.
         */
        debug: function (val) {
            if (arguments.length === 0) {
                return this._debug; // Return current debug state.
            }
            this._debug = val;      // Set new debug state.
            return this;            // Allow chaining.
        },

        /**
         * Clears all Waypoints-related data (history and target) from localStorage.
         * This effectively resets the Waypoints state.
         *
         * @returns {Waypoints} The Waypoints instance for method chaining.
         */
        clear: function () {
            localStorage.removeItem(HISTORY_KEY); // Remove the history data.
            localStorage.removeItem(TARGET_KEY);  // Remove the target data.
            return this;                          // Allow chaining.
        },

        /**
         * Adds the current browser route to the navigation history.
         * This is typically called after a successful, intentional navigation.
         *
         * @returns {Waypoints} The Waypoints instance for method chaining.
         */
        bookmark: function () {
            var route = this.route(); // Get the current URL.
            if (this._debug) {
                console.log('Waypoints.bookmark(): bookmarking', route);
            }
            this.push(route); // Add it to the history stack.
            return this;      // Allow chaining.
        },

        /**
         * Pushes a specified route onto the navigation history stack.
         * It also manages the history's maximum length.
         *
         * @param {string} route - The URL string to be added to the history.
         * @returns {Waypoints} The Waypoints instance for method chaining.
         */
        push: function (route) {
            var history = this.history(); // Retrieve the current history array.
            history.push(route);          // Add the new route to the end.
            // If history exceeds the defined length, remove the oldest entry.
            if (history.length > HISTORY_LENGTH) {
                history.shift();
            }
            this.history(history); // Persist the updated history to localStorage.
            return this;           // Allow chaining.
        },

        /**
         * Gets or sets the navigation history array.
         * History is stored as a JSON string in localStorage.
         *
         * @param {Array<string>} [val] - Optional. If provided, replaces the current history.
         * @returns {Array<string>|Waypoints} The current history array if no argument is given,
         *                                      otherwise the Waypoints instance for chaining.
         */
        history: function (val) {
            // If no arguments, retrieve and parse history from localStorage.
            if (arguments.length === 0) {
                var item = localStorage.getItem(HISTORY_KEY);
                return JSON.parse(item) || []; // Return parsed array or an empty array if null/invalid.
            }
            // If a value is provided, stringify and store it.
            if (val) {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(val));
                return this;
            }
            // If val is explicitly null/undefined, remove the history.
            localStorage.removeItem(HISTORY_KEY);
            return this;
        },

        /**
         * Gets or sets the current navigation target URL.
         * The target is a temporary storage for the intended destination.
         *
         * @param {string} [val] - Optional. If provided, sets the target URL.
         * @returns {string|Waypoints} The current target URL if no argument is given,
         *                              otherwise the Waypoints instance for chaining.
         */
        target: function (val) {
            // If no arguments, retrieve and parse the target from localStorage.
            if (arguments.length === 0) {
                var item = localStorage.getItem(TARGET_KEY);
                return JSON.parse(item); // Returns the parsed string or null.
            }
            // If a value is provided, stringify and store it.
            if (val) {
                localStorage.setItem(TARGET_KEY, JSON.stringify(val));
                return this;
            }
            // If val is explicitly null/undefined, remove the target.
            localStorage.removeItem(TARGET_KEY);
            return this;
        },

        /**
         * Gets or sets the CSS selector for elements that Waypoints should ignore.
         * Clicks on elements matching this selector will not be intercepted.
         *
         * @param {string} [selector] - Optional. If provided, sets the ignore selector.
         * @returns {string|Waypoints} The current ignore selector if no argument is given,
         *                              otherwise the Waypoints instance for chaining.
         */
        ignore: function (selector) {
            if (arguments.length === 0) {
                return this._ignore; // Return the current ignore selector.
            }
            this._ignore = selector; // Set the new ignore selector.
            return this;             // Allow chaining.
        },

        // --- Methods for changing the browser's URL directly ---

        /**
         * Either gets the current browser URL or navigates the browser to a new URL.
         * This is the core navigation method. It decides whether to bookmark or
         * set a target based on the relationship between the new and current routes.
         *
         * @param {string} [route] - The URL to navigate to. If omitted, returns
         *                           the current `window.location.href`.
         * @returns {string|Waypoints} The current URL string, or the Waypoints
         *                              instance for chaining if a route was provided.
         */
        route: function (route) {
            // If no route is provided, simply return the current browser URL.
            if (arguments.length === 0) {
                return window.location.href;
            }

            // Before navigating, check if the new route is different from the latest
            // entry in our history. This helps in deciding how to record the navigation.
            if (this.latest() !== route) {
                // If the new route shares the same base path as the current route
                // (e.g., only the hash or query parameters changed), we push it
                // directly to history as a minor navigation.
                if (shareBase(route, this.route())) {
                    this.push(route);
                }
                // Otherwise, it's a significant navigation to a new base path,
                // so we set it as a target, which will be handled by `resume`.
                else {
                    this.target(route);
                }
            }
            // Perform the actual browser navigation.
            window.location = route;
            return this; // Allow chaining.
        },

        /**
         * Redirects the browser to the latest URL stored in the navigation history.
         * This is useful for "snapping back" to a known good state after an
         * unexpected or invalid navigation.
         *
         * @returns {Waypoints} The Waypoints instance for method chaining.
         */
        redirect: function () {
            var latest = this.latest(); // Get the most recent URL from history.
            if (latest) {
                this.route(latest); // Navigate to that URL if it exists.
            }
            return this;            // Allow chaining.
        },

        /**
         * Simulates a "back" action within the Waypoints' internal history.
         * It removes the latest entry from history and redirects to the new latest.
         *
         * @returns {Waypoints} The Waypoints instance for method chaining.
         */
        back: function () {
            var history = this.history(); // Retrieve the current history.
            // Only perform a back action if there's more than one item in history.
            if (history.length > 1) {
                history.pop();        // Remove the most recent entry.
                this.history(history); // Save the truncated history.
                this.redirect();       // Redirect to the new latest entry.
            }
            return this;               // Allow chaining.
        },

        /**
         * Navigates to a given URL. This method first "qualifies" the URL
         * (converts it to an absolute URL) and then uses `route()` for navigation.
         *
         * @param {string} url - The URL string to navigate to. Can be relative or absolute.
         * @returns {Waypoints} The Waypoints instance for method chaining.
         */
        navigate: function (url) {
            var route = qualifyUrl(url); // Ensure the URL is absolute.
            if (this._debug) {
                console.log('Waypoints.navigate(): navigating to', route);
            }
            this.route(route); // Perform the navigation.
            return this;       // Allow chaining.
        },

        /**
         * Opens a given URL in a new browser tab or window.
         * This is achieved by dynamically creating and clicking an anchor tag
         * with `target="_blank"`.
         *
         * @param {string} url - The URL to open in a new tab/window.
         */
        open: function (url) {
            if (this._debug) {
                console.log('Waypoints.open(): opening safari for', url);
            }
            var a = document.createElement('a'); // Create a temporary anchor element.
            a.setAttribute('href', url);         // Set the URL.
            a.setAttribute('target', '_blank');  // Configure to open in a new tab.

            // Programmatically dispatch a click event on the anchor.
            var dispatch = document.createEvent('HTMLEvents');
            dispatch.initEvent('click', true, true); // Initialize a standard click event.
            a.dispatchEvent(dispatch);               // Trigger the click.
        },

        // --- Getter Methods ---

        /**
         * Retrieves the most recent URL from the navigation history.
         *
         * @returns {string|undefined} The latest URL string, or `undefined` if
         *                              the history is empty.
         */
        latest: function () {
            var history = this.history(); // Get the current history array.
            if (history.length) {
                return history[history.length - 1]; // Return the last element.
            }
            return undefined; // No history, so no latest entry.
        },

        // --- Event Handlers and Interception Logic ---

        /**
         * Sets up an event listener to intercept click events on elements
         * matching a specified CSS selector. This allows Waypoints to take
         * control of navigation for certain links instead of the browser.
         *
         * @param {string} selector - The CSS selector for elements whose clicks
         *                            should be intercepted by Waypoints.
         * @returns {Waypoints} The Waypoints instance for method chaining.
         */
        intercept: function (selector) {
            var self = this; // Capture the 'this' context for use in the callback.
            // Use jQuery/Zepto's event delegation to listen for clicks on the document
            // and filter for elements matching the provided selector.
            $(document).on('click', selector, function (event) {
                return self._onClick(this); // Delegate to the internal click handler.
            });
            return this; // Allow chaining.
        },

        /**
         * Internal handler for intercepted click events.
         * Determines if a clicked element should be ignored or if navigation
         * should proceed via Waypoints.
         *
         * @private
         * @param {HTMLElement} target - The DOM element that was clicked.
         * @returns {boolean} `true` to allow the browser's default click behavior
         *                    (e.g., for ignored elements), `false` to prevent it
         *                    and handle navigation via Waypoints.
         */
        _onClick: function (target) {
            // If the clicked element matches the ignore selector, let the browser handle it.
            if ($(target).is(this._ignore)) {
                if (this._debug) {
                    console.log('Waypoints.intercept(): ignoring click');
                }
                return true; // Allow default action.
            }

            var href = $(target).attr('href'); // Get the 'href' attribute of the clicked link.
            if (this._debug) {
                console.log('Waypoints.intercept(): intercepting click with href:', href);
            }
            // Visual feedback: Add a spin animation to a refresh icon, assuming it exists.
            $('#swipy-refresh i').addClass('icon-spin animate-spin');

            this.navigate(href); // Use Waypoints' navigation method.

            return false; // Prevent the browser's default navigation for this link.
        }
    };

    // --- Utility Helper Functions (private to the Waypoints scope) ---

    /**
     * Converts a given URL string into a fully qualified (absolute) URL.
     * This is achieved by leveraging the browser's native URL resolution
     * capabilities using a temporary anchor element.
     *
     * @param {string} url - The URL string to qualify (can be relative or absolute).
     * @returns {string} The fully qualified, absolute URL.
     */
    function qualifyUrl(url) {
        var a = document.createElement('a'); // Create a dummy anchor element.
        a.href = url;                        // Assign the URL to its href property.
        return a.href;                       // The browser automatically resolves it to an absolute URL.
    }

    /**
     * Checks if two URLs share the same base path, ignoring any hash fragments.
     * This is useful for determining if a navigation is a "minor" change (e.g.,
     * only hash changed) or a "major" navigation to a different page.
     *
     * @param {string} a - The first URL string.
     * @param {string} b - The second URL string.
     * @returns {boolean} `true` if their base paths are identical, `false` otherwise.
     */
    function shareBase(a, b) {
        // Split each URL by the '#' character and take the first part
        // to get the base path without the hash fragment.
        var baseA = a.split('#')[0];
        var baseB = b.split('#')[0];
        return baseA === baseB; // Compare the base paths.
    }

    /*
     * Expose a new instance of Waypoints to the global window object.
     * This makes the Waypoints library accessible globally.
     */
    window.Waypoints = new Waypoints();

})(window.jQuery || window.Zepto, window, document); // Pass dependencies to the IIFE.