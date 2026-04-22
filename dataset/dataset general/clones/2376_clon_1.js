/*
 * This file is part of the angular-raven project.
 *
 * Original Author: Umur Kontacı
 * Project URL: https://github.com/fastreload/angular-raven
 *
 * All rights reserved as per the original license.
 *
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This is a Type I clone, preserving all code elements exactly as they are,
 * only altering whitespace and comments for visual distinction.
 */

// Define an Immediately Invoked Function Expression (IIFE) to encapsulate the module.
(function () {

    // Enforce strict parsing and error handling in the script.
    "use strict";

    // Initialize the Angular module named "angular-raven".
    // It depends on no other Angular modules.
    var ngRaven = angular.module("angular-raven", []);

    // Configure the ngRaven module.
    ngRaven.config(["$provide", function ($provide) {

        // Decorate the built-in $exceptionHandler service.
        $provide.decorator("$exceptionHandler", ["RavenConfig", "$delegate", function (cfg, del) {

            // Check if Raven configuration is provided.
            // If not, throw an error as it's a mandatory dependency.
            if (!cfg) {
                throw new Error("Raven config must be set before using this");
            }

            // Ensure options object exists, initialize if undefined.
            cfg.options = cfg.options || {};

            // Configure Raven client with the provided URL and options, then install it.
            Raven.config(cfg.ravenUrl, cfg.options).install();

            // Return a custom exception handler function.
            return function (ex, cause) {

                // Call the original $exceptionHandler first.
                del(ex, cause);

                // Capture the exception with Raven, including the cause.
                Raven.captureException(ex, cause);
            };
        }]);
    }]);

    // Register the global Raven object as an Angular value service.
    // This makes the Sentry Raven client available throughout the Angular app.
    ngRaven.value("Raven", Raven);

})(); // End of the IIFE.