(function () {

	// Establish the global context for the library.
	var mainContext = this,
		GitUtil,
		PrototypeManager,
		BinConverter;

	// Check for CommonJS environment (Node.js) to export the module.
	if (typeof exports !== 'undefined') {
		GitUtil = exports;
	}
	// Otherwise, attach it to the global scope (browser).
	else {
		GitUtil = mainContext.GitUtil = {};
	}

	// Library versioning.
	GitUtil.CURRENT_VERSION = '1.0.0'; // Updated 2014-04-20

	// Object Model Utilities (similar to Backbone's extend mechanism)
	PrototypeManager = function(){};

	// Implements inheritance pattern.
	PrototypeManager.inherits = function (baseClass, instanceProperties, staticProperties) {
		var derivedClass,
			tempConstructor = function(){},
			objectMerge = function (targetObj, sourceObj) {
				for (var propertyKey in sourceObj) {
					targetObj[propertyKey] = sourceObj[propertyKey];
				}
			};
		// Define the constructor for the derived class.
		if (instanceProperties && instanceProperties.hasOwnProperty('constructor')) {
			derivedClass = instanceProperties.constructor;
		} else {
			derivedClass = function(){ baseClass.apply(this, arguments); };
		}

		// Copy static properties from the base class.
		objectMerge(derivedClass, baseClass);

		// Set up the prototype chain.
		tempConstructor.prototype = baseClass.prototype;
		derivedClass.prototype = new tempConstructor();

		// Add instance-specific properties.
		if(instanceProperties) objectMerge(derivedClass.prototype, instanceProperties);

		// Add static properties to the derived class itself.
		if(staticProperties) objectMerge(derivedClass, staticProperties);

		// Ensure the constructor property points correctly.
		derivedClass.prototype.constructor = derivedClass;

		// Provide a reference to the parent's prototype.
		derivedClass.__super__ = baseClass.prototype;

		return derivedClass;
	};
	// Extends a class with new instance and static properties.
	PrototypeManager.extend = function (instanceProperties, staticProperties) {
		var newChild = PrototypeManager.inherits(this, instanceProperties, staticProperties);
		newChild.extend = this.extend;
		return newChild;
	};


	// Base64 encoding/decoding utility. Source: http://www.webtoolkit.info/javascript-base64.html
	BinConverter = {

		// Private character set for Base64 operations.
		_encodingChars : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// Public method to convert Base64 to plain text.
		transformToText : function (inputString) {
			var decodedOutput = "";
			var charOne, charTwo, charThree;
			var encodedOne, encodedTwo, encodedThree, encodedFour;
			var currentIdx = 0;

			// Clean the input string by removing invalid Base64 characters.
			inputString = inputString.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (currentIdx < inputString.length) {

				encodedOne = this._encodingChars.indexOf(inputString.charAt(currentIdx++));
				encodedTwo = this._encodingChars.indexOf(inputString.charAt(currentIdx++));
				encodedThree = this._encodingChars.indexOf(inputString.charAt(currentIdx++));
				encodedFour = this._encodingChars.indexOf(inputString.charAt(currentIdx++));

				charOne = (encodedOne << 2) | (encodedTwo >> 4);
				charTwo = ((encodedTwo & 15) << 4) | (encodedThree >> 2);
				charThree = ((encodedThree & 3) << 6) | encodedFour;

				decodedOutput = decodedOutput + String.fromCharCode(charOne);

				if (encodedThree != 64) {
					decodedOutput = decodedOutput + String.fromCharCode(charTwo);
				}
				if (encodedFour != 64) {
					decodedOutput = decodedOutput + String.fromCharCode(charThree);
				}

			}

			// Perform UTF-8 decoding on the result.
			decodedOutput = BinConverter._decodeUTF8(decodedOutput);

			return decodedOutput;

		},

		// Public method to convert plain text to Base64.
		transformFromText : function (plainString) {
				var encodedOutput = "";
				var charOne, charTwo, charThree, encodedOne, encodedTwo, encodedThree, encodedFour;
				var currentIdx = 0;

				// Encode the input string to UTF-8 first.
				plainString = BinConverter._encodeUTF8(plainString);

				while (currentIdx < plainString.length) {

						charOne = plainString.charCodeAt(currentIdx++);
						charTwo = plainString.charCodeAt(currentIdx++);
						charThree = plainString.charCodeAt(currentIdx++);

						encodedOne = charOne >> 2;
						encodedTwo = ((charOne & 3) << 4) | (charTwo >> 4);
						encodedThree = ((charTwo & 15) << 2) | (charThree >> 6);
						encodedFour = charThree & 63;

						if (isNaN(charTwo)) {
								encodedThree = encodedFour = 64;
						} else if (isNaN(charThree)) {
								encodedFour = 64;
						}

						encodedOutput = encodedOutput +
						this._encodingChars.charAt(encodedOne) + this._encodingChars.charAt(encodedTwo) +
						this._encodingChars.charAt(encodedThree) + this._encodingChars.charAt(encodedFour);

				}

				return encodedOutput;
		},

		// Private method for decoding UTF-8.
		_decodeUTF8 : function (utfEncodedText) {
			var resultString = "";
			var currentIdx = 0;
			var charVal = charVal1 = charVal2 = 0;

			while ( currentIdx < utfEncodedText.length ) {

				charVal = utfEncodedText.charCodeAt(currentIdx);

				if (charVal < 128) {
					resultString += String.fromCharCode(charVal);
					currentIdx++;
				}
				else if((charVal > 191) && (charVal < 224)) {
					charVal1 = utfEncodedText.charCodeAt(currentIdx+1);
					resultString += String.fromCharCode(((charVal & 31) << 6) | (charVal1 & 63));
					currentIdx += 2;
				}
				else {
					charVal1 = utfEncodedText.charCodeAt(currentIdx+1);
					charVal2 = utfEncodedText.charCodeAt(currentIdx+2);
					resultString += String.fromCharCode(((charVal & 15) << 12) | ((charVal1 & 63) << 6) | (charVal2 & 63));
					currentIdx += 3;
				}

			}

			return resultString;
		},

		// Private method for encoding to UTF-8.
		_encodeUTF8 : function (inputString) {
				inputString = inputString.replace(/\r\n/g,"\n");
				var utfOutput = "";

				for (var charIndex = 0; charIndex < inputString.length; charIndex++) {

						var charCode = inputString.charCodeAt(charIndex);

						if (charCode < 128) {
								utfOutput += String.fromCharCode(charCode);
						}
						else if((charCode > 127) && (charCode < 2048)) {
								utfOutput += String.fromCharCode((charCode >> 6) | 192);
								utfOutput += String.fromCharCode((charCode & 63) | 128);
						}
						else {
								utfOutput += String.fromCharCode((charCode >> 12) | 224);
								utfOutput += String.fromCharCode(((charCode >> 6) & 63) | 128);
								utfOutput += String.fromCharCode((charCode & 63) | 128);
						}

				}

				return utfOutput;
		}

	};


	GitUtil.BinConverter = BinConverter;

	// Handle cross-domain requests for older IE browsers.
	if (window.XDomainRequest != null) {
		try {
			new XDomainRequest();
			$.support.cors = true;
			$.ajaxSetup.xhr = function() { return new XDomainRequest(); };
		} catch (e) {}
	}

	// Utility for making API requests.
	GitUtil.ServiceConnector = PrototypeManager.extend({

	},{
		commProtocol : "https",
		apiHost : "api.github.com",
		// Function to initiate an HTTP API call.
		invokeWebService : function (requestConfig) {
			requestConfig.url = GitUtil.ServiceConnector.commProtocol + "://" + GitUtil.ServiceConnector.apiHost + "/" + requestConfig.endpointPath;
			// Adapt for CORS-enabled browsers.
			if ($.support.cors) {
				var onSuccess = requestConfig.onSuccess;
				if ($.isFunction(onSuccess)) {
					requestConfig.onSuccess = function (receivedData, textStatus, jqXHR) {
						onSuccess.call(this, {payload: receivedData}, textStatus, jqXHR);
					};
				}
			} else {
				// For non-CORS, use JSONP.
				requestConfig.dataType = 'jsonp';
			}

			$.ajax(requestConfig);
		}
	});

	// Manages collections of user accounts.
	GitUtil.ProfileRegistry = PrototypeManager.extend({

	},{// Static members for user management.
		profileCollection : [],
		// Searches for user accounts based on a query.
		findAccounts : function (searchQuery, pagingDetails, completionHandler) {
			GitUtil.ProfileRegistry.profileCollection = [];
			GitUtil.ServiceConnector.invokeWebService({
				endpointPath : "legacy/user/search/"+searchQuery,
				data : pagingDetails,
				onSuccess : function(responseObj) {
					// Add each found user to the collection.
					_.each(responseObj.payload.users, function (singleProfile) {
						GitUtil.ProfileRegistry.profileCollection.push(new GitUtil.AccountProfile(singleProfile.login, singleProfile));
					});

					if (completionHandler) completionHandler(null, GitUtil.ProfileRegistry);
				},
				onError : function (responseObj) {
					if (completionHandler) completionHandler(new Error(responseObj.responseJSON.message),responseObj);
				}
			});

		},
		// Reverses the order of accounts in the collection.
		flipOrder : function () {
			GitUtil.ProfileRegistry.profileCollection.reverse();
		},
		// Sorts the accounts using an optional comparison function.
		arrangeAccounts : function (sortFunction) {
			if (sortFunction) {
				GitUtil.ProfileRegistry.profileCollection.sort(sortFunction);
			} else {
				GitUtil.ProfileRegistry.profileCollection.sort();
			}
		},
		// Retrieves all managed user accounts.
		retrieveAll : function() { return GitUtil.ProfileRegistry.profileCollection; },
		// Finds a user account by its name.
		findByName : function (accountName) {
			return _.find(GitUtil.ProfileRegistry.profileCollection, function (currentAccount) {
				return currentAccount.name == accountName;
			});
		},
		// Iterates over each user account.
		iterateOver : function (processFunction) {
			_.each(GitUtil.ProfileRegistry.profileCollection, function (accountData) {
				processFunction(accountData);
			});
		},
		// Filters user accounts based on a condition.
		selectMatching : function (filterCondition) {
			return _.filter(GitUtil.ProfileRegistry.profileCollection, filterCondition);
		}

	});

	// Represents an individual user account profile.
	GitUtil.AccountProfile = PrototypeManager.extend({

		initializeProfile : function (username, profileData) {

			if (profileData) {
				for(var propertyKey in profileData) {
					this[propertyKey] = profileData[propertyKey];
				}
			}

			if (username) {
				this.username = username;
			} else {
				throw "Username is required!";
			}
		},
		// Fetches detailed information for the user profile.
		retrieveDetails : function (completionHandler) {
			var selfRef = this;

			GitUtil.ServiceConnector.invokeWebService({
				endpointPath : "users/"+selfRef.username,
				onSuccess : function (responseObj) {
					for(var propertyKey in responseObj.payload) {
						selfRef[propertyKey] = responseObj.payload[propertyKey];
					}
					if (completionHandler) completionHandler(null, selfRef);
				},
				onError : function (responseObj) {
					if (completionHandler) completionHandler(new Error(responseObj.responseJSON.message),responseObj);
				}
			});

		}

	},{});


	/* Code Snippet Management */

	// Represents a comment on a code snippet.
	GitUtil.SnippetComment = PrototypeManager.extend({
		initializeProfile : function (commentEntry) {
			for(var propertyKey in commentEntry) {
				this[propertyKey] = commentEntry[propertyKey];
			}
		}
	},{});

	// Represents a single code snippet (Gist).
	GitUtil.CodeSnippet = PrototypeManager.extend({
		initializeProfile : function (snippetDetails) {
			for(var propertyKey in snippetDetails) {
				this[propertyKey] = snippetDetails[propertyKey];
			}
		},
		// Loads the content and files of the snippet.
		loadContent : function (completionHandler) {
			var selfRef = this;
			selfRef.snippetFiles = [];

			GitUtil.ServiceConnector.invokeWebService({
				endpointPath : "gists/"+selfRef.id,
				onSuccess : function(responseObj) {

					for(var fileKey in responseObj.payload.files) {
						selfRef.snippetFiles.push(responseObj.payload.files[fileKey]);
					}

					// Remove the files property from the raw data to avoid duplication.
					delete responseObj.payload.files;

					for(var propertyKey in responseObj.payload) {
						selfRef[propertyKey] = responseObj.payload[propertyKey];
					}
					if (completionHandler) completionHandler(null, selfRef);
				},
				onError : function (responseObj) {
					if (completionHandler) completionHandler(new Error(responseObj.responseJSON.message),responseObj);
				}
			});


		},
		// Loads comments associated with the snippet.
		loadComments : function (completionHandler) {
			var selfRef = this;
			selfRef.snippetComments = [];


			GitUtil.ServiceConnector.invokeWebService({
				endpointPath : "gists/"+selfRef.id+"/comments",
				onSuccess : function(responseObj) {
					_.each(responseObj.payload, function (singleComment) {
						selfRef.snippetComments.push(new GitUtil.SnippetComment(singleComment));
					});
					if (completionHandler) completionHandler(null, selfRef);
				},
				onError : function (responseObj) {
					if (completionHandler) completionHandler(new Error(responseObj.responseJSON.message),responseObj);
				}
			});

		},
		// Retrieves a specific file by its name.
		getFileByTitle : function (fileName) {
			return _.find(this.snippetFiles, function (fileObj) {
				return fileObj.filename == fileName;
			});
		},
		// Returns all files belonging to the snippet.
		getAssociatedFiles : function () {
			return this.snippetFiles;
		},
		// Executes a function for each file in the snippet.
		processEachFile : function (processFunction) {
			_.each(this.snippetFiles, function (fileObj) {
				processFunction(fileObj);

			});
		},
		// Returns all comments on the snippet.
		getAssociatedComments : function () { return this.snippetComments; },
		// Executes a function for each comment.
		processEachComment : function (processFunction) {
			_.each(this.snippetComments, function (commentObj) {
				processFunction(commentObj);
			});
		},
		// Filters comments based on a provided condition.
		filterAssociatedComments : function (filterCondition) {
			return _.filter(this.snippetComments, filterCondition);
		}

	},{});

	// Manages a collection of code snippets for a user.
	GitUtil.SnippetCollection = PrototypeManager.extend({
		initializeProfile : function (userProfile) {
			if (userProfile) this.user = userProfile;
			this.codeSnippets = [];
		},
		// Fetches code snippets for the associated user.
		fetch : function (pagingDetails, pagingContext, completionHandler) {
			var selfRef = this;

			GitUtil.ServiceConnector.invokeWebService({
				endpointPath : "users/"+selfRef.user.username+"/gists",
				data : pagingDetails,
				onSuccess : function(responseObj) {
					_.each(responseObj.payload, function (currentSnippet) {
						selfRef.codeSnippets.push(new GitUtil.CodeSnippet(currentSnippet));
					});
					if (completionHandler) completionHandler(null, selfRef);
				},
				onError : function (responseObj) {
					if (completionHandler) completionHandler(new Error(responseObj.responseJSON.message),responseObj);
				}
			});

		},

		// Retrieves the list of code snippets.
		getSnippetList : function () { return this.codeSnippets; },
		// Executes a function for each code snippet.
		forEachSnippet : function (processFunction) {
			_.each(this.codeSnippets, function (currentSnippet) {
				processFunction(currentSnippet);
			});
		},
		// Filters code snippets based on a condition.
		filter : function (filterCondition) {
			return _.filter(this.codeSnippets, filterCondition);
		}

	},{});


	// Represents a comment on a commit.
	GitUtil.ChangeComment = PrototypeManager.extend({
		initializeProfile : function (changeCommentInfo) {
			for(var propertyKey in changeCommentInfo) {
				this[propertyKey] = changeCommentInfo[propertyKey];
			}
		}
	},{});
	// Represents a version control commit.
	GitUtil.VersionChange = PrototypeManager.extend({
		initializeProfile : function (changeDetails, userProfile, repoIdentifier) {
			this.modifier = changeDetails.commit.author;
			this.modificationDate =	changeDetails.commit.author.date;
			this.changeMessage = changeDetails.commit.message;
			this.revisionHash = changeDetails.sha;
			this.resourceLink = changeDetails.url;

			if (userProfile) this.user = userProfile;
			if (repoIdentifier) this.repoIdentifier = repoIdentifier;
		},
		// Fetches comments related to this commit.
		fetchComments : function (completionHandler) {
			var selfRef = this;
			selfRef.comments = [];