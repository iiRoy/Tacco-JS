// This file contains core functionalities for the Gh3 JavaScript library.
// It was initially created by k33g on 2012.07.25.

/*
    Gh3.js - A GitHub API v3 client library for JavaScript.

    Current TODOs:
    - Implement fetching repositories for an organization.
    - Integrate with the GitHub Search API (http://developer.github.com/v3/search/).
    - Expand capabilities further.

    License Information:
    Gh3 is distributed under the terms of the [MIT License](http://en.wikipedia.org/wiki/MIT_License#License_terms).
    Copyright 2014-2015, Philippe Charrière.

    Version History:
    - 2012.07.25: '0.0.1' - Initial release.
    - 2012.07.26: '0.0.2' - Minor bug fixes.
    - 2012.07.26: '0.0.3' - Added pagination support for gists.
    - 2012.07.28: '0.0.4' - Major refactoring:
        * Introduced Gh3.Helper for API calls.
        * Added filtering capabilities for gists.
        * Implemented filtering for gist comments.
        * Enabled filtering for file commits.
        * Added sorting functionality for commits.
        * Introduced a new type: Gh3.Repositories (with pagination).
    - 2012.07.29: '0.0.5' - Enhancements:
        * Gh3.Repositories: Added search functionality.
        * Added Gh3.Users: Implemented user search ability.
    - 2012.07.29: '0.0.6' - Made compatible with async.js.
    - 2012.08.02: '0.0.7' - Prepared for Node.js compatibility (future-proofing, dependency awareness).
    - 2014.04.20: '1.0.0' - Released as a bower package, adopted semantic versioning.
    - 2014.04.20: '1.0.1' - Applied temporary fixes.
*/


(function () {

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Declare Gh3, Kind, and Base64 variables.
    var Gh3, Kind, Base64;


    // Check if we're in a Node.js-like environment or a browser.
    if (typeof exports !== 'undefined') {
        // If in Node.js, export Gh3.
        Gh3 = exports;
    }
    else {
        // Otherwise, attach Gh3 to the global `root` object (window).
        Gh3 = root.Gh3 = {};
    }

    // Set the current version of the Gh3 library.
    Gh3.VERSION = '1.0.0'; // Updated on 2014.04.20


    // Object Model Tools (helpers) inspired by Backbone.js inheritance patterns.
    // This `Kind` object provides a simple inheritance mechanism.
    Kind = function(){
        // The base constructor for all "Kind" objects.
        // It's intentionally empty as specific constructors will be defined in `extend`.
    };


    // `inherits` allows a child constructor to inherit prototype properties from a parent.
    Kind.inherits = function (parent, protoProps, staticProps) {
        var child;
        var ctor = function(){}; // A temporary constructor used for prototype chain.

        // Helper function to merge properties from source to destination.
        var merge = function (destination, source) {
            for (var prop in source) {
                // Ensure the property is directly on the source object, not its prototype chain.
                if (source.hasOwnProperty(prop)) {
                    destination[prop] = source[prop];
                }
            }
        };

        // Determine the child constructor.
        // If `protoProps` defines a `constructor`, use that.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        }
        else {
            // Otherwise, create a default constructor that calls the parent's constructor.
            child = function(){
                parent.apply(this, arguments);
            };
        }

        // Inherit static properties from the parent to the child constructor itself.
        merge(child, parent);

        // Set up the prototype chain without calling the parent's constructor.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add instance properties to the child's prototype if provided.
        if(protoProps) {
            merge(child.prototype, protoProps);
        }

        // Add static properties directly to the child constructor if provided.
        if(staticProps) {
            merge(child, staticProps);
        }

        // Correctly set the child's `prototype.constructor` back to the child constructor.
        child.prototype.constructor = child;

        // Set a convenience property `__super__` to access the parent's prototype later.
        child.__super__ = parent.prototype;

        return child; // Return the newly created child constructor.
    };


    // `extend` is a class method that creates a new class that inherits from the current class.
    Kind.extend = function (protoProps, staticProps) {
        // Create a new child class using the `inherits` utility.
        var child = Kind.inherits(this, protoProps, staticProps);
        // Add the `extend` method to the new child class, allowing for further inheritance.
        child.extend = this.extend;
        return child; // Return the new extended class.
    };


    // Base64 utility object, adapted from http://www.webtoolkit.info/javascript-base64.html
    Base64 = {

        // Private property: The key string used for Base64 encoding/decoding.
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


        // Public method for decoding a Base64 string.
        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            // Remove all characters that are not A-Z, a-z, 0-9, +, /, or =.
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            // Process the input string in chunks of 4 Base64 characters.
            while (i < input.length) {

                // Get the index of each character in the key string.
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                // Reconstruct the original 3 bytes from the 4 Base64 characters.
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                // Append the first character to the output.
                output = output + String.fromCharCode(chr1);

                // If enc3 is not 64 (padding), append the second character.
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                // If enc4 is not 64 (padding), append the third character.
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }

            // Decode the output from UTF-8 to a standard JavaScript string.
            output = Base64._utf8_decode(output);

            return output; // Return the decoded string.
        },


        // Public method for encoding a string to Base64.
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            // Encode the input string to UTF-8 first.
            input = Base64._utf8_encode(input);

            // Process the input string in chunks of 3 characters (bytes).
            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                // Convert the 3 bytes into 4 Base64 character indices.
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                // Handle padding for strings that are not a multiple of 3 bytes.
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64; // Two padding characters.
                } else if (isNaN(chr3)) {
                    enc4 = 64; // One padding character.
                }

                // Append the Base64 characters to the output string.
                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }

            return output; // Return the Base64 encoded string.
        },


        // Private method for UTF-8 decoding.
        _utf8_decode : function (utftext) {
            var string = "";
            var i = 0;
            var c = 0, c1 = 0, c2 = 0; // c, c1, c2 are used for character codes.

            // Iterate through the UTF-8 encoded text.
            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                // Handle 1-byte characters (ASCII).
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                // Handle 2-byte characters.
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                // Handle 3-byte characters.
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }

            return string; // Return the decoded string.
        },


        // Private method for UTF-8 encoding.
        _utf8_encode : function (string) {
            // Normalize line endings to LF.
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            // Iterate through each character of the input string.
            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                // Handle 1-byte characters (ASCII).
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                // Handle 2-byte characters.
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                // Handle 3-byte characters.
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }

            return utftext; // Return the UTF-8 encoded string.
        }
    };


    // Expose the Base64 utility through the Gh3 namespace.
    Gh3.Base64 = Base64;


    // Check for XDomainRequest support (for IE < 10) to enable cross-origin AJAX.
    if (window.XDomainRequest != null) {
        try {
            new XDomainRequest(); // Attempt to create an XDomainRequest object.
            $.support.cors = true; // Set jQuery's CORS support flag to true.
            // Override jQuery's xhr function to use XDomainRequest for CORS.
            $.ajaxSetup.xhr = function() {
                return new XDomainRequest();
            };
        }
        catch (e) {
            // Catch any errors during XDomainRequest setup, e.g., if it's not truly available.
            // No action needed, as $.support.cors will remain false.
        }
    }


    // Gh3.Helper provides utility methods for making API calls to GitHub.
    Gh3.Helper = Kind.extend({

    }, { // Static members for Gh3.Helper

        // Default protocol for API calls.
        protocol : "https",
        // Default domain for the GitHub API.
        domain : "api.github.com",

        // `callHttpApi` is a generic method for making AJAX requests to the GitHub API.
        callHttpApi : function (apiParams) {
            // Construct the full URL for the API endpoint.
            apiParams.url = Gh3.Helper.protocol + "://" + Gh3.Helper.domain + "/" + apiParams.service;

            // If CORS is supported (modern browsers or XDomainRequest setup above).
            if ($.support.cors) {
                var success = apiParams.success; // Store the original success callback.
                if ($.isFunction(success)) {
                    // Wrap the success callback to normalize the response data structure.
                    apiParams.success = function (data, textStatus, jqXHR) {
                        success.call(this, {data: data}, textStatus, jqXHR);
                    };
                }
            }
            else {
                // For older browsers without CORS, use JSONP.
                // The `service` parameter is not needed for JSONP as it's part of the URL.
                // delete apiParams.service; // This line was commented out in original, keeping it that way.
                apiParams.dataType = 'jsonp'; // Set data type to JSONP.
            }

            // Make the AJAX call using jQuery.
            $.ajax(apiParams);
        }
    });


    // Gh3.Users manages user-related operations, such as searching for users.
    Gh3.Users = Kind.extend({

    }, { // Static members for Gh3.Users

        users : [], // Array to store Gh3.User instances.

        // `search` method to find users by a keyword.
        search : function (keyword, pagesInfo, callback) {
            Gh3.Users.users = []; // Clear previous search results.

            Gh3.Helper.callHttpApi({
                service : "legacy/user/search/"+keyword, // Use the legacy search API.
                data : pagesInfo, // Pagination information (e.g., page, per_page).
                // beforeSend: function (xhr) { xhr.setRequestHeader ("rel", paginationInfo); }, // Original comment, keeping.
                success : function(res) {
                    // Iterate through the results and create Gh3.User objects.
                    _.each(res.data.users, function (user) {
                        Gh3.Users.users.push(new Gh3.User(user.login, user));
                    });

                    // Invoke the callback if provided.
                    if (callback) {
                        callback(null, Gh3.Users);
                    }
                },
                error : function (res) {
                    // Handle API errors.
                    if (callback) {
                        callback(new Error(res.responseJSON.message), res);
                    }
                }
            });
        },

        // Reverses the order of users in the `users` array.
        reverse : function () {
            Gh3.Users.users.reverse();
        },

        // Sorts the users array, optionally using a custom comparison function.
        sort : function (comparison_func) {
            if (comparison_func) {
                Gh3.Users.users.sort(comparison_func);
            }
            else {
                Gh3.Users.users.sort(); // Default sort if no function is provided.
            }
        },

        // Returns all currently loaded Gh3.User objects.
        getAll : function() {
            return Gh3.Users.users;
        },

        // Retrieves a Gh3.User object by its name (login).
        getByName : function (name) {
            return _.find(Gh3.Users.users, function (item) {
                return item.name == name;
            });
        },

        // Iterates over each user in the collection, applying a callback function.
        each : function (callback) {
            _.each(Gh3.Users.users, function (user) {
                callback(user);
            });
        },

        // Filters the users collection based on a comparator function.
        filter : function (comparator) {
            return _.filter(Gh3.Users.users, comparator);
        }
    });


    // Gh3.User represents a single GitHub user.
    Gh3.User = Kind.extend({

        // Constructor for a Gh3.User object.
        constructor : function (login, user_infos) {

            // If user_infos are provided, copy them to the instance.
            if (user_infos) {
                for(var prop in user_infos) {
                    if (user_infos.hasOwnProperty(prop)) {
                        this[prop] = user_infos[prop];
                    }
                }
            }

            // A login is mandatory for a user object.
            if (login) {
                this.login = login;
            }
            else {
                throw "login !"; // Error if login is missing.
            }
        },

        // Fetches detailed information for the user from the GitHub API.
        fetch : function (callback) {
            var that = this; // Maintain context for callbacks.

            Gh3.Helper.callHttpApi({
                service : "users/"+that.login, // API endpoint for user details.
                success : function (res) {
                    // Update the user object with the fetched data.
                    for(var prop in res.data) {
                        if (res.data.hasOwnProperty(prop)) {
                            that[prop] = res.data[prop];
                        }
                    }
                    // Invoke the callback with null error and the updated user object.
                    if (callback) {
                        callback(null, that);
                    }
                },
                error : function (res) {
                    // Handle API errors during fetch.
                    if (callback) {
                        callback(new Error(res.responseJSON.message), res);
                    }
                }
            });
        }

    }, {}); // No static members for Gh3.User currently.


    /* Gists Module */

    // Gh3.GistComment represents a comment on a GitHub Gist.
    Gh3.GistComment = Kind.extend({
        // Constructor to initialize a GistComment with provided data.
        constructor : function (gistCommentData) {
            for(var prop in gistCommentData) {
                if (gistCommentData.hasOwnProperty(prop)) {
                    this[prop] = gistCommentData[prop];
                }
            }
        }
    }, {}); // No static members for Gh3.GistComment.


    // Gh3.Gist represents a single GitHub Gist.
    Gh3.Gist = Kind.extend({
        // Constructor to initialize a Gist with provided data.
        constructor : function (gistData) {
            for(var prop in gistData) {
                if (gistData.hasOwnProperty(prop)) {
                    this[prop] = gistData[prop];
                }
            }
        },

        // Fetches the detailed contents (files) of the Gist.
        fetchContents : function (callback) {
            var that = this;
            that.files = []; // Initialize files array.

            Gh3.Helper.callHttpApi({
                service : "gists/"+that.id, // API endpoint for gist details.
                success : function(res) {
                    // Populate the `files` array from the response.
                    for(var file in res.data.files) {
                        if (res.data.files.hasOwnProperty(file)) {
                            that.files.push(res.data.files[file]);
                        }
                    }

                    // Remove the 'files' property from the main data before merging,
                    // as it's now handled separately in `that.files`.
                    delete res.data.files;

                    // Update the gist object with other fetched properties.
                    for(var prop in res.data) {
                        if (res.data.hasOwnProperty(prop)) {
                            that[prop] = res.data[prop];
                        }
                    }
                    if (callback) {
                        callback(null, that);
                    }
                },
                error : function (res) {
                    if (callback) {
                        callback(new Error(res.responseJSON.message), res);
                    }
                }
            });
        },

        // Fetches comments for the Gist.
        fetchComments : function (callback) {
            var that = this;
            that.comments = []; // Initialize comments array.

            Gh3.Helper.callHttpApi({
                service : "gists/"+that.id+"/comments", // API endpoint for gist comments.
                success : function(res) {
                    // Create Gh3.GistComment objects for each comment.
                    _.each(res.data, function (comment) {
                        that.comments.push(new Gh3.GistComment(comment));
                    });
                    if (callback) {
                        callback(null, that);
                    }
                },
                error : function (res) {
                    if (callback) {
                        callback(new Error(res.responseJSON.message), res);
                    }
                }
            });
        },

        // Retrieves a specific file from the gist by its name.
        getFileByName : function (name) {
            return _.find(this.files, function (file) {
                return file.filename == name;
            });
        },

        // Returns all files associated with the gist.
        getFiles : function () {
            return this.files;
        },

        // Iterates over each file in the gist, applying a callback.
        eachFile : function (callback) {
            _.each(this.files, function (file) {
                callback(file);
            });
        },

        // Returns all comments associated with the gist.
        getComments : function () {
            return this.comments;
        },

        // Iterates over each comment, applying a callback.
        eachComment : function (callback) {
            _.each(this.comments, function (comment) {
                callback(comment);
            });
        },

        // Filters the comments collection based on a comparator function.
        filterComments : function (comparator) {
            return _.filter(this.comments, comparator);
        }

    }, {}); // No static members for Gh3.Gist.


    // Gh3.Gists manages a collection of Gists for a specific user.
    // (See http://developer.github.com/v3/gists/ for API details).
    Gh3.Gists = Kind.extend({
        // Constructor for Gh3.Gists.
        constructor : function (ghUser) {
            if (ghUser) {
                this.user = ghUser; // Associate with a Gh3.User object.
            }
            this.gists = []; // Initialize the array to hold Gh3.Gist instances.
        },

        // Fetches gists for the associated user.
        // `pagesInfo` for pagination parameters, `paginationInfo` (commented out in original).
        fetch : function (pagesInfo, paginationInfo, callback) {
            var that = this;

            Gh3.Helper.callHttpApi({
                service : "users/"+that.user.login+"/gists", // API endpoint for user's gists.
                data : pagesInfo, // Pagination parameters.
                // beforeSend: function (xhr) { xhr.setRequestHeader ("rel", paginationInfo); }, // Original comment, why (pagination)?
                success : function(res) {
                    // Create Gh3.Gist objects for each fetched gist.
                    _.each(res.data, function (gist) {
                        that.gists.push(new Gh3.Gist(gist));
                    });
                    if (callback) {
                        callback(null, that);
                    }
                },
                error : function (res) {
                    if (callback) {
                        callback(new Error(res.responseJSON.message), res);
                    }
                }
            });
        },

        // Returns the array of Gh3.Gist objects.
        getGists : function () {
            return this.gists;
        },

        // Iterates over each gist in the collection, applying a callback.
        eachGist : function (callback) {
            _.each(this.gists, function (gist) {
                callback(gist);
            });
        },

        // Filters the gists collection based on a comparator function.
        filter : function (comparator) {
            return _.filter(this.gists, comparator);
        }

    }, {}); // No static members for Gh3.Gists.


    // Gh3.CommitComment represents a comment on a specific commit.
    Gh3.CommitComment = Kind.extend({
        // Constructor to initialize a CommitComment object.
        constructor : function (commitCommentData) {
            for(var prop in commitCommentData) {
                if (commitCommentData.hasOwnProperty(prop)) {
                    this[prop] = commitCommentData[prop];
                }
            }
        }
    }, {}); // No static members for Gh3.CommitComment.


    // Gh3.Commit represents a single commit in a repository.
    Gh3.Commit = Kind.extend({
        // Constructor to initialize a Commit object.
        constructor : function (commitInfos, ghUser, repositoryName) {
            // Extract relevant commit information.
            this.author = commitInfos.commit.author;
            this.date = commitInfos.commit.author.date;
            this.message = commitInfos.commit.message;
            this.sha = commitInfos.sha;
            this.url = commitInfos.url;

            // Associate with a user and repository name if provided.
            if (ghUser) {
                this.user = ghUser;
            }
            if (repositoryName) {
                this.repositoryName = repositoryName;
            }
        },

        // Fetches comments for this specific commit.
        fetchComments : function (callback) {
            var that = this;
            that.comments = []; // Initialize comments array.