/**
 *
 *  Edmunds JavaScript Loader Script
 *
 *  Copyright © 2009-2011 Edmunds.com, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and limitations
 *  under the License.
 *
 */

( function() {

    try {

        // Define the current version of the loader
        var VERSION = '2.1.3';

        // Get a reference to the document's head element
        var head = document.getElementsByTagName('head')[0];


        // Perform essential integrity checks on the PAGESETUP global object
        if ( ! window.PAGESETUP ) {

            throw 'Edmunds UI Loader: PAGESETUP global variable is not defined';
        }

        if ( typeof window.PAGESETUP != 'object' ) {

            throw 'Edmunds UI Loader: PAGESETUP global variable is not an object';
        }

        // Initialize PAGESETUP properties if they are not already set
        if ( ! PAGESETUP.files ) { PAGESETUP.files = []; }

        if ( ! PAGESETUP.loaded ) { PAGESETUP.loaded = false; }

        if ( ! PAGESETUP.query_vars ) { PAGESETUP.query_vars = {}; }

		    if ( ! PAGESETUP.default_libs ) { PAGESETUP.default_libs = []; }

        if ( ! PAGESETUP.jsdownloaded ) { PAGESETUP.jsdownloaded = 0; }

        // Ensure CDN URLs are defined for YUI and EDMUI
        if ( ! PAGESETUP.urlstub1 ) {

            throw 'Edmunds UI Loader: PAGESETUP requires a YUI CDN to be defined in PAGESETUP.urlstub1';
        }

        if ( ! PAGESETUP.urlstub2 ) {

            throw 'Edmunds UI Loader: PAGESETUP requires a EDMUI CDN to be defined in PAGESETUP.urlstub2';
        }


		    // Browser detection for specific loading behaviors
		    var isIE = ( navigator.userAgent.toLowerCase().indexOf('msie') !== -1 );
		    var isFF3 = ( navigator.userAgent.match(/firefox\/3\./i) != null );
        var isBB = ( navigator.userAgent.toLowerCase().indexOf('blackberry') !== -1 );


        // If the loader has already executed, prevent re-execution
        if ( PAGESETUP.loaded ) {

            return;
        }

        // Initialize an object to track loaded files
        PAGESETUP.loadedfiles = {};


        /**
         *    Recursively loads JavaScript files from a queue.
         *
         *    This function processes the `unique_files` array one by one,
         *    appending script tags to the document head or body.
         *
         *    @param    void
         *    @return   void
         */
        function load() {

            // Keep a reference to this function for recursive calls
            var parent = arguments.callee;

            // Check if there are still files remaining to be loaded
            if ( unique_files.length ) {

                // Retrieve the next file from the beginning of the array
                var file = unique_files.shift();

				        // Apply necessary updates for un-obfuscating URLs
				        // Replaces '|' with '/' and ';' with '.'
				        file = file.replace(/\|/g, '/').replace(/\;/g, '.');

				        // Mark the file as processed to prevent duplicate loading
                PAGESETUP.loadedfiles[file] = 'loaded';


				        // Process non-absolute file paths (those not starting with 'http')
 				        if ( file.indexOf('http') !== 0 ) {

                 	    // Get the JavaScript flag from the query string
	                    var flag = flag || getQS('jsflag');

	                    // Replace 'stub2' with the EDMUI CDN URL
	                    if ( file.indexOf('stub2') !== -1 ) {

	                        file = file.replace(/stub2/, PAGESETUP.urlstub2);

	                    } else if ( file.indexOf('stub1') !== -1 ) { // Replace 'stub1' with the YUI CDN URL

	                        file = file.replace(/stub1/, PAGESETUP.urlstub1);
	                    }

	                    // Append '-min.js' for production unless a flag is set or it's a utility file
	                    if ( ! flag && file.indexOf('utilities') === -1 ) {

	                        file = file.replace(/\.js/, '-min.js');

	                    } else if ( flag == 'debug' && file.indexOf('utilities') === -1 ) { // Append '-debug.js' if debug flag is set

	                        file = file.replace(/\.js/, '-debug.js');
	                    }
				        }

                 // Create a new script element for the file
                 var js = document.createElement('script');
                 js.type = 'text/javascript';


             	   // Handle Internet Explorer's sequential loading
           		   if ( isIE ) {

           		       js.src = file;

                	   // Use onreadystatechange for IE's script loading events
                	   js.onreadystatechange = function() {

                    	   if ( this.readyState == 'complete' || this.readyState == 'loaded' || this.status == 304 || this.status == 404 ) {

                        	   parent(); // Call the next file in sequence
                       	   }
                  	   };

             		     head.appendChild(js);

                } else if ( js.async ) { // Handle browsers that support async script loading

                    js.async = false; // Ensure scripts are loaded in order
                    js.src = file;

                    // If this is the last file, trigger parent() on load
                    if ( unique_files.length < 1 ) {

                        js.onload = function() { parent(); };
                    }

                    head.appendChild(js);

                    // If there are more files, immediately call parent() for parallel loading
                    if ( unique_files.length ) {

                        parent();
                    }

                } else {
                // For other browsers, load scripts in parallel or manage onload events

                    js.src = file;
                    document.body.appendChild(js);

                    // For Firefox 3 and Blackberry, immediately call parent() for next script
                    if ( ( isFF3 && unique_files.length ) || ( isBB ) ) {

                    	  parent();

                  	} else { // For other browsers, wait for the script to load before calling parent()

                    	  js.onload = function() {

                            parent();
                      	};

                        js.onerror = function() { // Also handle errors during script loading

                        	parent();
                     	};
                 	}
            	}

            } else {
            // If no files are left to load, mark loader as complete and execute controls

				        PAGESETUP.loaded = true;

                if ( PAGESETUP.execControls ) {

                    PAGESETUP.execControls();
                }
            }
        }


        /**
         *    Retrieves the value of a specified query string variable.
         *
         *    Parses the URL's query string and caches the key-value pairs
         *    in PAGESETUP.query_vars for efficient subsequent access.
         *
         *    @param    string    elem    The name of the query string variable to retrieve.
         *    @return   string            The value of the query string variable, or an empty string if not found.
         */
        function getQS( elem ) {

            // Only parse the query string once
            if ( ! PAGESETUP.query_vars.length ) {

                var aArgsTemp, aTemp, sQuery;

                // Get the query string part of the URL, excluding the '?'
                sQuery = window.location.search.substr(1, window.location.search.length);

                // If the query string is empty, return early
                if ( sQuery.length < 1 ) {

                    return '';
                }

                // Split the query string into individual arguments
                aArgsTemp = sQuery.split("&");

                // Iterate through arguments and populate PAGESETUP.query_vars
                for ( var i = 0 ; i < aArgsTemp.length ; i++ ) {

                    aTemp = aArgsTemp[i].split("=");
                    PAGESETUP.query_vars[aTemp[0]] = aTemp[1];
                }
            }

            // Return the requested query string variable's value
            return PAGESETUP.query_vars[elem];
        }


        /**
		     *	Filters an array to remove duplicate values.
		     *
		     *	Uses a temporary cache object for efficient duplicate checking.
		     *
		     *	@param	array	arr		The original array to filter.
	       *	@return	array			A new array containing only unique values.
	       */
	      function unique( arr ) {

			      var tmp_cache = {};
			      var new_arr = [];
			      var len = arr.length;

			      for ( var i = 0 ; i < len ; i++ ) {

				      // Check if the item or its combined library equivalent is already in cache
				      if ( ! tmp_cache[arr[i]] && ! tmp_cache[combined_libs[arr[i]]] ) {

					        new_arr.push(arr[i]);
					        tmp_cache[arr[i]] = 1;
				      }
			      }

			      tmp_cache = null; // Clean up the temporary cache for garbage collection
			      return new_arr;
		    }

		    // Retrieve combined libraries mapping from PAGESETUP, or initialize empty object
		    var combined_libs = PAGESETUP.combined_libs || {};


		    // Get the full breakdown list of EDMUI utilities for debug mode
        var edmui_util_breakdown_full = PAGESETUP.breakdown_libs || [];

        // Fetch the 'jsflag' query string parameter
        var flag = getQS('jsflag');

        var load_files;

        // Determine which set of files to load based on the 'jsflag'
        if ( flag == 'full' || flag == 'debug' ) {

            // If flag is 'full' or 'debug', load individual breakdown files followed by PAGESETUP.files
            load_files = edmui_util_breakdown_full.concat(PAGESETUP.files);

        } else {
            // Otherwise, load default libraries first, then PAGESETUP.files
            load_files = PAGESETUP.default_libs.concat(PAGESETUP.files);
        }

		    // Filter the consolidated file list to ensure only unique files are loaded
		    var unique_files = unique(load_files);

		    // Initiate the loading process!
		    load();

    }
    // Catch any errors that occur during the loader's execution
    catch ( e ) {

		    // Re-throw the error as an EDMUI Loader Error
		    throw new Error("EDMUI Loader Error: " + e);
    }

})();