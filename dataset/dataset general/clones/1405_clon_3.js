/*
	git-api-wrap.js
	Initial Creation: 2012-07-25 by k333n

	Purpose:
		- Facilitate interaction with GitHub's REST API.
		- Provide structured models for common GitHub entities (Users, Gists, Repositories, Commits).

	Licensing Information:
		- This utility is made available under the permissive MIT License.
		- Copyright 2014-2015, Philippe Charrière (original author)

	Development Log:
		- 2012.07.25: '0.0.1' - Genesis version, basic structure
		- 2012.07.26: '0.0.2' - Minor bug fixes and stability enhancements
		- 2012.07.26: '0.0.3' - Introduced pagination support for Gists
		- 2012.07.28: '0.0.4' - Significant refactoring:
			* Introduced Core.ApiRequest for standardized API calls
			* Enhanced Gist filtering capabilities
			* Added comment filtering for Gists
			* Implemented file commit filtering
			* Added commit sorting functionality
			* New entity type: Core.RepositoryCollection (with pagination)
		- 2012.07.29: '0.0.5' - Feature expansion:
			* Core.RepositoryCollection now includes search functionality
			* New entity type: Core.UserSearchManager with user search ability
		- 2012.07.29: '0.0.6' - Async.js compatibility layer integrated
		- 2012.08.02: '0.0.7' - Early preparation for Node.js environment; dependencies noted
		- 2014.04.20: '1.0.0' - Official release as a Bower package, semantic versioning adopted
		- 2014.04.20: '1.0.1' - Interim fixes applied to address immediate issues
*/

(function () {

	// Establish global context for module registration
	var globalScope = this
	,	GitWrap // Main library namespace
	,	ObjectFabricator // Utility for class-like inheritance
	,	BinaryTextConverter; // For Base64 operations

	// Determine export mechanism (Node.js vs. Browser)
	if (typeof exports !== 'undefined') {
		GitWrap = exports;
	} else {
		GitWrap = globalScope.GitWrap = {};
	}

	// Current library version identifier
	GitWrap.MODULE_VERSION = '1.0.0-alpha'; // Updated versioning schema

	// --- Object Model Construction Utility ---
	// Inspired by classical inheritance patterns, akin to Backbone's extend method.
	ObjectFabricator = function(){
		// Base constructor for all extendable objects.
	};

	// Method to facilitate inheritance between JavaScript constructor functions.
	ObjectFabricator.derive = function (baseType, instanceProperties, staticProperties) {
		var derivedType
			, tempConstructor = function(){}
			, propertyCopier = function (destinationObject, sourceObject) {
				// Iterates through source object properties and copies them to the destination.
				for (var propName in sourceObject) {
					// Ensure property belongs directly to the source object, not its prototype chain.
					if (Object.prototype.hasOwnProperty.call(sourceObject, propName)) {
						destinationObject[propName] = sourceObject[propName];
					}
				}
		};

		// Determine the constructor for the derived class.
		// If a 'constructor' property is explicitly defined in instanceProperties, use it.
		if (instanceProperties && Object.prototype.hasOwnProperty.call(instanceProperties, 'constructor')) {
			derivedType = instanceProperties.constructor;
		} else {
			// Otherwise, create a default constructor that calls the baseType's constructor.
			derivedType = function(){ baseType.apply(this, arguments); };
		}

		// Copy static properties from the baseType to the derivedType.
		propertyCopier(derivedType, baseType);

		// Set up the prototype chain for inheritance.
		// Use a temporary constructor to avoid calling baseType's constructor unnecessarily.
		tempConstructor.prototype = baseType.prototype;
		derivedType.prototype = new tempConstructor();

		// Add instance-specific properties to the derivedType's prototype.
		if(instanceProperties) propertyCopier(derivedType.prototype, instanceProperties);

		// Add static properties directly to the derivedType constructor function.
		if(staticProperties) propertyCopier(derivedType, staticProperties);

		// Ensure the derivedType's prototype points back to its own constructor.
		derivedType.prototype.constructor = derivedType;

		// Provide a convenient reference to the parent's prototype.
		derivedType.__parentProto__ = baseType.prototype;

		return derivedType;
	};

	// Method to add `extend` functionality to new classes, allowing them to be further extended.
	ObjectFabricator.extend = function (instanceProps, staticProps) {
		var newChildClass = ObjectFabricator.derive(this, instanceProps, staticProps);
		newChildClass.extend = this.extend; // Maintain the extend method for further inheritance.
		return newChildClass;
	};


	// --- Base64 Encoding/Decoding Utility ---
	// Adapted from http://www.webtoolkit.info/javascript-base64.html for binary-to-text conversion.
	BinaryTextConverter = {

		// Private character set for Base64 encoding.
		_encodingAlphabet : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d", // \x3d is '='

		// Public method for decoding a Base64 string into a plain string.
		decodeString : function (encodedInput) {
			var decodedOutput = "";
			var charA, charB, charC; // Three 8-bit characters (bytes)
			var encVal1, encVal2, encVal3, encVal4; // Four 6-bit values from Base64
			var inputIndex = 0;

			// Remove any characters that are not part of the Base64 alphabet.
			encodedInput = encodedInput.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (inputIndex < encodedInput.length) {

				// Get four 6-bit values from the encoded string.
				encVal1 = this._encodingAlphabet.indexOf(encodedInput.charAt(inputIndex++));
				encVal2 = this._encodingAlphabet.indexOf(encodedInput.charAt(inputIndex++));
				encVal3 = this._encodingAlphabet.indexOf(encodedInput.charAt(inputIndex++));
				encVal4 = this._encodingAlphabet.indexOf(encodedInput.charAt(inputIndex++));

				// Reconstruct the first 8-bit character.
				charA = (encVal1 << 2) | (encVal2 >> 4);
				// Reconstruct the second 8-bit character.
				charB = ((encVal2 & 15) << 4) | (encVal3 >> 2);
				// Reconstruct the third 8-bit character.
				charC = ((encVal3 & 3) << 6) | encVal4;

				decodedOutput = decodedOutput + String.fromCharCode(charA);

				// Append charB and charC only if they were not padding characters.
				if (encVal3 !== 64) { // 64 represents '=' padding
					decodedOutput = decodedOutput + String.fromCharCode(charB);
				}
				if (encVal4 !== 64) {
					decodedOutput = decodedOutput + String.fromCharCode(charC);
				}
			}

			// Perform UTF-8 decoding on the resulting string.
			decodedOutput = BinaryTextConverter._decodeUtf8(decodedOutput);

			return decodedOutput;
		},

		// Public method for encoding a plain string into a Base64 string.
		encodeString : function (plainInput) {
			var encodedOutput = "";
			var char1, char2, char3; // Three 8-bit characters
			var val1, val2, val3, val4; // Four 6-bit values
			var iterationIndex = 0;

			// First, encode the input string into UTF-8.
			plainInput = BinaryTextConverter._encodeUtf8(plainInput);

			while (iterationIndex < plainInput.length) {

				char1 = plainInput.charCodeAt(iterationIndex++);
				char2 = plainInput.charCodeAt(iterationIndex++);
				char3 = plainInput.charCodeAt(iterationIndex++);

				val1 = char1 >> 2;
				val2 = ((char1 & 3) << 4) | (char2 >> 4);
				val3 = ((char2 & 15) << 2) | (char3 >> 6);
				val4 = char3 & 63;

				// Handle padding for strings not divisible by 3 bytes.
				if (isNaN(char2)) {
					val3 = val4 = 64; // Set padding for missing second character.
				} else if (isNaN(char3)) {
					val4 = 64; // Set padding for missing third character.
				}

				encodedOutput = encodedOutput +
				this._encodingAlphabet.charAt(val1) + this._encodingAlphabet.charAt(val2) +
				this._encodingAlphabet.charAt(val3) + this._encodingAlphabet.charAt(val4);
			}

			return encodedOutput;
		},

		// Private method for decoding UTF-8 byte sequences into a JavaScript string.
		_decodeUtf8 : function (utfByteString) {
			var resultString = "";
			var byteIndex = 0;
			var currentByte = 0, byte2 = 0, byte3 = 0; // Variables to hold byte values

			while ( byteIndex < utfByteString.length ) {

				currentByte = utfByteString.charCodeAt(byteIndex);

				// 1-byte sequence (ASCII)
				if (currentByte < 128) {
					resultString += String.fromCharCode(currentByte);
					byteIndex++;
				}
				// 2-byte sequence
				else if((currentByte > 191) && (currentByte < 224)) {
					byte2 = utfByteString.charCodeAt(byteIndex+1);
					resultString += String.fromCharCode(((currentByte & 31) << 6) | (byte2 & 63));
					byteIndex += 2;
				}
				// 3-byte sequence
				else {
					byte2 = utfByteString.charCodeAt(byteIndex+1);
					byte3 = utfByteString.charCodeAt(byteIndex+2);
					resultString += String.fromCharCode(((currentByte & 15) << 12) | ((byte2 & 63) << 6) | (byte3 & 63));
					byteIndex += 3;
				}
			}
			return resultString;
		},

		// Private method for encoding a JavaScript string into UTF-8 byte sequences.
		_encodeUtf8 : function (jsString) {
			jsString = jsString.replace(/\r\n/g,"\n"); // Normalize line endings.
			var utf8ByteArray = "";

			for (var charIndex = 0; charIndex < jsString.length; charIndex++) {

				var charCode = jsString.charCodeAt(charIndex);

				// 1-byte sequence (0xxxxxxx)
				if (charCode < 128) {
					utf8ByteArray += String.fromCharCode(charCode);
				}
				// 2-byte sequence (110xxxxx 10xxxxxx)
				else if((charCode > 127) && (charCode < 2048)) {
					utf8ByteArray += String.fromCharCode((charCode >> 6) | 192);
					utf8ByteArray += String.fromCharCode((charCode & 63) | 128);
				}
				// 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
				else {
					utf8ByteArray += String.fromCharCode((charCode >> 12) | 224);
					utf8ByteArray += String.fromCharCode(((charCode >> 6) & 63) | 128);
					utf8ByteArray += String.fromCharCode((charCode & 63) | 128);
				}
			}
			return utf8ByteArray;
		}
	};

	// Expose the Base64 utility under the main library namespace.
	GitWrap.TextEncoder = BinaryTextConverter;

	// Cross-domain request (XDR) support for older browsers (e.g., IE9).
	// This block attempts to enable CORS for browsers that require XDomainRequest.
	// It's a legacy compatibility layer; modern browsers handle CORS natively.
	if (window.XDomainRequest !== undefined && window.XDomainRequest !== null) {
		try {
			new XDomainRequest(); // Test if XDR is functional.
			$.support.cors = true; // Inform jQuery that CORS is supported via XDR.
			$.ajaxSetup({
				xhr: function() { return new XDomainRequest(); } // Override jQuery's XHR for XDR.
			});
		} catch (e) {
			// XDR might exist but fail to instantiate (e.g., security restrictions).
			console.warn("XDomainRequest detected but failed to initialize.", e);
		}
	}

	// --- API Request Handler ---
	// Manages communication with the GitHub API endpoint.
	GitWrap.ApiRequestHandler = ObjectFabricator.extend({
		// Instance properties are not defined for this static-like utility.
	},{ // Static members for API configuration and request execution.
		apiProtocol : "https", // Default protocol for GitHub API.
		apiDomain : "api.github.com", // GitHub API base domain.

		// Executes an HTTP request to the GitHub API.
		// @param {Object} requestOptions - Configuration for the API call.
		// @param {string} requestOptions.endpoint - The specific API path (e.g., "users/octocat").
		// @param {Object} [requestOptions.data] - Data payload for the request.
		// @param {Function} [requestOptions.onSuccess] - Callback for successful responses.
		// @param {Function} [requestOptions.onError] - Callback for error responses.
		triggerApiCall : function (requestOptions) {
			// Basic validation for request options.
			if (!requestOptions || !requestOptions.endpoint) {
				console.error("API call requires an 'endpoint' in request options.");
				if (requestOptions && requestOptions.onError) {
					requestOptions.onError(new Error("Missing API endpoint."), null);
				}
				return;
			}

			// Construct the full URL for the API request.
			var fullApiUrl = GitWrap.ApiRequestHandler.apiProtocol + "://" +
							 GitWrap.ApiRequestHandler.apiDomain + "/" +
							 requestOptions.endpoint;

			// Prepare jQuery AJAX settings.
			var ajaxSettings = {
				url: fullApiUrl,
				data: requestOptions.data,
				method: requestOptions.method || 'GET', // Default to GET if not specified.
				dataType: requestOptions.dataType || 'json', // Default to JSON.
				// Override success handler for consistent data structure.
				success: function(responsePayload, textStatus, jqXHR) {
					// Wrap the raw data in an object for consistency, especially with CORS.
					var processedResponse = { data: responsePayload };
					if (requestOptions.onSuccess) {
						requestOptions.onSuccess.call(this, processedResponse, textStatus, jqXHR);
					}
				},
				// Error handler.
				error: function(jqXHR, textStatus, errorThrown) {
					if (requestOptions.onError) {
						var errorMessage = (jqXHR.responseJSON && jqXHR.responseJSON.message) ?
											jqXHR.responseJSON.message :
											"An unknown API error occurred.";
						requestOptions.onError(new Error(errorMessage), jqXHR);
					}
				}
			};

			// For non-CORS environments (e.g., older IE with XDR or JSONP fallback).
			// Note: The original code used `$.support.cors` to toggle `dataType: 'jsonp'`.
			// This is a simplification, assuming jQuery handles JSONP when `dataType` is set.
			// If `$.support.cors` is false, it implies a need for JSONP or XDR.
			if (!$.support.cors && !ajaxSettings.xhr) { // Check if XDR was not set up and CORS isn't supported.
				console.log("Falling back to JSONP for API request.");
				ajaxSettings.dataType = 'jsonp';
			}

			// Execute the AJAX call.
			$.ajax(ajaxSettings);
		}
	});

	// --- User Search and Management ---
	// Manages collections of GitHub user profiles and search operations.
	GitWrap.UserCollectionManager = ObjectFabricator.extend({
		// No instance-specific properties for the collection manager itself.
	},{ // Static members for managing user data.
		currentUsers : [], // Stores the list of UserProfile objects from the last search.

		// Initiates a search for GitHub users based on a keyword.
		// @param {string} searchKeyword - The term to search for.
		// @param {Object} paginationDetails - Parameters for pagination (e.g., 'page', 'per_page').
		// @param {Function} resultCallback - Callback function (error, UserCollectionManager).
		findUsers : function (searchKeyword, paginationDetails, resultCallback) {
			// Input validation.
			if (!searchKeyword) {
				console.error("User search requires a keyword.");
				if (resultCallback) resultCallback(new Error("Search keyword cannot be empty."));
				return;
			}

			GitWrap.UserCollectionManager.currentUsers = []; // Clear previous results.

			var endpointPath = "legacy/user/search/" + encodeURIComponent(searchKeyword);

			GitWrap.ApiRequestHandler.triggerApiCall({
				endpoint : endpointPath,
				data : paginationDetails,
				onSuccess : function(response) {
					// Iterate over raw user data and create UserProfile objects.
					if (response.data && Array.isArray(response.data.users)) {
						response.data.users.forEach(function (userDataItem) {
							// Push new UserProfile instances into the collection.
							GitWrap.UserCollectionManager.currentUsers.push(
								new GitWrap.UserProfile(userDataItem.login, userDataItem)
							);
						});
					} else {
						console.warn("No 'users' array found in search response.", response);
					}

					if (resultCallback) resultCallback(null, GitWrap.UserCollectionManager);
				},
				onError : function (err, resObj) {
					console.error("Failed to search users:", err, resObj);
					if (resultCallback) resultCallback(err, resObj);
				}
			});
		},

		// Reverses the order of users in the current collection.
		reverseOrder : function () {
			GitWrap.UserCollectionManager.currentUsers.reverse();
		},

		// Sorts the users in the current collection using an optional comparison function.
		// @param {Function} [comparisonFn] - A function defining the sort order.
		applySort : function (comparisonFn) {
			if (typeof comparisonFn === 'function') {
				GitWrap.UserCollectionManager.currentUsers.sort(comparisonFn);
			} else {
				// Default sort if no custom function is provided.
				GitWrap.UserCollectionManager.currentUsers.sort();
			}
		},

		// Retrieves all UserProfile objects currently in the manager.
		retrieveAll : function() {
			return GitWrap.UserCollectionManager.currentUsers;
		},

		// Finds a user by their login name.
		// @param {string} userName - The login name of the user to find.
		// @returns {UserProfile|undefined} The found user or undefined.
		findByLogin : function (userName) {
			return GitWrap.UserCollectionManager.currentUsers.find(function (userItem) {
				return userItem.login === userName;
			});
		},

		// Iterates over each user in the collection.
		// @param {Function} iteratorFn - Callback function for each user.
		processEachUser : function (iteratorFn) {
			if (typeof iteratorFn === 'function') {
				GitWrap.UserCollectionManager.currentUsers.forEach(function (userEntry) {
					iteratorFn(userEntry);
				});
			} else {
				console.warn("Provided iterator function is not valid.");
			}
		},

		// Filters the user collection based on a predicate function.
		// @param {Function} predicateFn - A function that returns true for users to keep.
		// @returns {Array<UserProfile>} A new array containing the filtered users.
		filterUsers : function (predicateFn) {
			if (typeof predicateFn === 'function') {
				return GitWrap.UserCollectionManager.currentUsers.filter(predicateFn);
			} else {
				console.warn("Provided filter predicate is not valid.");
				return [];
			}
		}
	});

	// --- Individual User Profile Model ---
	// Represents a single GitHub user with their details.
	GitWrap.UserProfile = ObjectFabricator.extend({

		// Constructor for a UserProfile instance.
		// @param {string} userLoginId - The login name of the user (mandatory).
		// @param {Object} [initialData] - Optional initial data to populate the profile.
		constructor : function (userLoginId, initialData) {
			// Defensive check for required login ID.
			if (!userLoginId) {
				throw new Error("UserProfile requires a 'userLoginId' upon creation.");
			}
			this.login = userLoginId; // Set the primary identifier.

			// Populate instance properties from initial data.
			if (initialData) {
				Object.assign(this, initialData); // Use Object.assign for cleaner property copying.
			}
		},

		// Fetches comprehensive details for this user from the API.
		// @param {Function} completionCallback - Callback function (error, UserProfile).
		retrieveDetails : function (completionCallback) {
			var currentInstance = this; // Capture 'this' for use in callbacks.

			// Construct the API endpoint for fetching user details.
			var userDetailEndpoint = "users/" + encodeURIComponent(currentInstance.login);

			GitWrap.ApiRequestHandler.triggerApiCall({
				endpoint : userDetailEndpoint,
				onSuccess : function (response) {
					// Update the current instance with fetched data.
					Object.assign(currentInstance, response.data);
					if (completionCallback) completionCallback(null, currentInstance);
				},
				onError : function (err, resObj) {
					console.error("Failed to fetch user details for " + currentInstance.login + ":", err, resObj);
					if (completionCallback) completionCallback(err, resObj);
				}
			});
		}
	},{}); // No static members for individual user profiles.


	/* --- Gist Models --- */

	// Represents a single comment on a GitHub Gist.
	GitWrap.SnippetRemark = ObjectFabricator.extend({
		// Constructor populates properties from provided data.
		// @param {Object} commentData - Raw data for the Gist comment.
		constructor : function (commentData) {
			if (!commentData) {
				console.warn("Attempted to create SnippetRemark with no data.");
				return;
			}
			Object.assign(this, commentData);
		}
	},{});

	// Represents a single GitHub Gist (code snippet).
	GitWrap.CodeSnippet = ObjectFabricator.extend({
		// Constructor populates properties from provided data.
		// @param {Object} snippetData - Raw data for the Gist.
		constructor : function (snippetData) {
			if (!snippetData) {
				throw new Error("CodeSnippet requires initial data.");
			}
			Object.assign(this, snippetData);
			this.snippetFiles = []; // Initialize an empty array for files.
			this.snippetComments = []; // Initialize an empty array for comments.
		},

		// Fetches the detailed contents of the Gist, including file data.
		// @param {Function} completionCallback - Callback function (error, CodeSnippet).
		fetchFullContents : function (completionCallback) {
			var currentSnippet = this;

			GitWrap.ApiRequestHandler.triggerApiCall({
				endpoint : "gists/" + encodeURIComponent(currentSnippet.id),
				onSuccess : function(response) {
					var rawFiles = response.data.files;
					if (rawFiles) {
						for (var fileName in rawFiles) {
							if (Object.prototype.hasOwnProperty.call(rawFiles, fileName)) {
								currentSnippet.snippetFiles.push(rawFiles[fileName]);
							}
						}
						// The 'files' property is often embedded in the main data; remove after processing.
						delete response.data.files;
					}

					// Update the snippet instance with any other details from the response.
					Object.assign(currentSnippet, response.data);

					if (completionCallback) completionCallback(null, currentSnippet);
				},
				onError : function (err, resObj) {
					console.error("Failed to fetch gist contents for ID " + currentSnippet.id + ":", err, resObj);
					if (completionCallback) completionCallback(err, resObj);
				}
			});
		},

		// Fetches all comments associated with this Gist.
		// @param {Function} completionCallback - Callback function (error, CodeSnippet).
		fetchAssociatedComments : function (completionCallback) {
			var currentSnippet = this;
			currentSnippet.snippetComments = []; // Reset comments before fetching.

			GitWrap.ApiRequestHandler.triggerApiCall({
				endpoint : "gists/" + encodeURIComponent(currentSnippet.id) + "/comments",
				onSuccess : function(response) {
					if (Array.isArray(response.data)) {
						response.data.forEach(function (commentData) {
							currentSnippet.snippetComments.push(new GitWrap.SnippetRemark(commentData));
						});
					}
					if (completionCallback) completionCallback(null, currentSnippet);
				},
				onError : function (err, resObj) {
					console.error("Failed to fetch gist comments for ID " + currentSnippet.id + ":", err, resObj);
					if (completionCallback) completionCallback(err, resObj);
				}
			});
		},

		// Retrieves a specific file from the Gist by its filename.
		// @param {string} requestedFileName - The name of the file to find.
		// @returns {Object|undefined} The file object or undefined if not found.
		getSnippetFileByName : function (requestedFileName) {
			if (!Array.isArray(this.snippetFiles)) return undefined; // Guard against uninitialized files.
			return this.snippetFiles.find(function (fileItem) {
				return fileItem.filename === requestedFileName;
			});
		},

		// Returns all files associated with the Gist.
		// @returns {Array<Object>} An array of file objects.
		getAllSnippetFiles : function () {
			return this.snippetFiles || [];
		},

		// Iterates over each file in the Gist.
		// @param {Function} iteratorFunction - Callback for each file.
		forEachSnippetFile : function (iteratorFunction) {
			if (typeof iteratorFunction === 'function' && Array.isArray(this.snippetFiles)) {
				this.snippetFiles.forEach(function (file) {
					iteratorFunction(file);
				});
			} else {
				console.warn("Invalid iterator function or snippet files not loaded for gist ID: " + this.id);
			}
		},

		// Returns all comments associated with the Gist.
		// @returns {Array<SnippetRemark>} An array of comment objects.
		getAllSnippetComments : function () {
			return this.snippetComments || [];
		},

		// Iterates over each comment in the Gist.
		// @param {Function} commentIterator - Callback for each comment.
		forEachSnippetComment : function (commentIterator) {
			if (typeof commentIterator === 'function' && Array.isArray(this.snippetComments)) {
				this.snippetComments.forEach(function (comment) {
					commentIterator(comment);
				});
			} else {
				console.warn("Invalid comment iterator function or snippet comments not loaded for gist ID: " + this.id);
			}
		},

		// Filters the Gist's comments based on a predicate.
		// @param {Function} commentPredicate - Function returning true for comments to include.
		// @returns {Array<SnippetRemark>} A new array of filtered comments.
		filterSnippetComments : function (commentPredicate) {
			if (typeof commentPredicate === 'function' && Array.isArray(this.snippetComments)) {
				return this.snippetComments.filter(commentPredicate);
			} else {
				console.warn("Invalid comment predicate or snippet comments not loaded for gist ID: " + this.id);
				return [];
			}
		}
	},{});

	// --- Gist Collection for a User ---
	// Manages a collection of Gists belonging to a specific GitHub user.
	GitWrap.UserSnippetCollection = ObjectFabricator.extend({
		// Constructor for a UserSnippetCollection.
		// @param {UserProfile} associatedUser - The user profile whose Gists are being managed.
		constructor : function (associatedUser) {
			if (!associatedUser || !associatedUser.login) {
				throw new Error("UserSnippetCollection requires an associated UserProfile instance.");
			}
			this.ownerAccount = associatedUser;
			this.snippets = []; // Holds CodeSnippet instances.
		},

		// Fetches Gists for the associated user.
		// @param {Object} pageParameters - Pagination details.
		// @param {Object} [relationInfo] - Additional pagination relation headers (often unused directly in client-side).
		// @param {Function} completionCallback - Callback function (error, UserSnippetCollection).
		retrieveUserGists : function (pageParameters, relationInfo, completionCallback) {
			var currentCollection = this;
			currentCollection.snippets = []; // Clear existing snippets before fetching.

			var endpoint = "users/" + encodeURIComponent(currentCollection.ownerAccount.login) + "/gists";

			GitWrap.ApiRequestHandler.triggerApiCall({
				endpoint : endpoint,
				data : pageParameters,
				onSuccess : function(response) {
					if (Array.isArray(response.data)) {
						response.data.forEach(function (gistData) {
							currentCollection.snippets.push(new GitWrap.CodeSnippet(gistData));
						});
					}
					if (completionCallback) completionCallback(null, currentCollection);
				},
				onError : function (err, resObj) {
					console.error("Failed to retrieve gists for user " + currentCollection.ownerAccount.login + ":", err, resObj);
					if (completionCallback) completionCallback(err, resObj);
				}
			});
		},

		// Returns all CodeSnippet objects in the collection.
		// @returns {Array<CodeSnippet>} An array of Gist objects.
		getSnippetList : function () {
			return this.snippets || [];
		},

		// Iterates over each CodeSnippet in the collection.
		// @param {Function} snippetIterator - Callback for each snippet.
		processEachSnippet : function (snippetIterator) {
			if (typeof snippetIterator === 'function' && Array.isArray(this.snippets)) {
				this.snippets.forEach(function (snippet) {
					snippetIterator(snippet);
				});
			} else {
				console.warn("Invalid iterator function or snippets not loaded.");
			}
		},

		// Filters the CodeSnippet collection based on a predicate.
		// @param {Function} snippetPredicate - Function returning true for snippets to include.
		// @returns {Array<CodeSnippet>} A new array of filtered snippets.
		filterSnippets : function (snippetPredicate) {
			if (typeof snippetPredicate === 'function' && Array.isArray(this.snippets)) {
				return this.snippets.filter(snippetPredicate);
			} else {
				console.warn("Invalid snippet predicate or snippets not loaded.");
				return [];
			}
		}
	},{});


	/* --- Commit Models --- */

	// Represents a single comment on a GitHub Commit.
	GitWrap.VersionChangeRemark = ObjectFabricator.extend({
		// Constructor populates properties from provided data.
		// @param {Object} commentEntryData - Raw data for the Commit comment.
		constructor : function (commentEntryData) {
			if (!commentEntryData) {
				console.warn("Attempted to create VersionChangeRemark with no data.");
				return;
			}
			Object.assign(this, commentEntryData);
		}
	},{});

	// Represents a single GitHub Commit (version change).
	GitWrap.CodeChange = ObjectFabricator.extend({
		// Constructor for a CodeChange instance.
		// @param {Object} commitDetails - Raw commit information.
		// @param {UserProfile} [committerProfile] - The user profile associated with this commit.
		// @param {string} [repoName] - The name of the repository this commit belongs to.
		constructor : function (commitDetails, committerProfile, repoName) {
			if (!commitDetails || !commitDetails.commit) {
				throw new Error("CodeChange requires valid commitDetails.");
			}

			// Extract essential commit information.
			var primaryCommitInfo = commitDetails.commit;
			var commitAuthor = primaryCommitInfo.author;

			this.authorDetails = { // Structured author information.
				name: commitAuthor.name,
				email: commitAuthor.email,
				date: new Date(commitAuthor.date) // Convert date string to Date object.
			};
			this.commitMessage = primaryCommitInfo.message;
			this.shaHash = commitDetails.sha;
			this.commitApiUrl = commitDetails.url;

			// Optional associations.
			if (committerProfile) this.committer = committerProfile;
			if (repoName) this.repositoryIdentifier = repoName;

			this.changeComments = []; // Initialize an empty array for comments.
		},

		// Fetches comments associated with this specific commit.
		// @param {Function} completionCallback - Callback function (error, CodeChange).
		fetchCommitComments : function (completionCallback) {
			var currentChange = this;
			currentChange.changeComments = []; // Clear existing comments.

			// Ensure we have enough information to fetch comments.
			if (!currentChange.committer || !currentChange.committer.login || !currentChange.repositoryIdentifier || !currentChange.shaHash) {
				var errorMessage = "Missing user, repository, or SHA to fetch commit comments.";
				console.error(errorMessage, currentChange);
				if (completionCallback) completionCallback(new Error(errorMessage), null);
				return;
			}

			var commentsEndpoint = "repos/" + encodeURIComponent(currentChange.committer.login) + "/" +
								   encodeURIComponent(currentChange.repositoryIdentifier) + "/commits/" +
								   encodeURIComponent(currentChange.shaHash) + "/comments";

			GitWrap.ApiRequestHandler.triggerApiCall({
				endpoint : commentsEndpoint,
				onSuccess : function(response) {
					if (Array.isArray(response.data)) {
						response.data.forEach(function (commentData) {
							currentChange.changeComments.push(new GitWrap.VersionChangeRemark(commentData));
						});
					}
					if (completionCallback) completionCallback(null, currentChange);
				},
				onError : function (err, resObj) {
					console.error("Failed to fetch commit comments for SHA " + currentChange.shaHash + ":", err, resObj);
					if (completionCallback) completionCallback(err, resObj);
				}
			});
		}
	},{});