(function() {

// This module handles robust file transfer capabilities within an AngularJS application.
// It provides services for HTTP uploads and directives for file selection and drag-and-drop.
var appFileTransferModule = angular.module('appFileTransfer', []);

appFileTransferModule.service('FileTransferService', ['$http', '$q', '$timeout', function($httpSvc, $qSvc, $timeoutSvc) {

	/**
	 * Executes a generic HTTP request, enhancing it with progress tracking and abort capabilities.
	 * @param {object} requestConfig - The configuration object for the HTTP request.
	 * @returns {Promise} A promise that resolves with the HTTP response, rejects with an error, and notifies with progress updates.
	 */
	function performHttpRequest(requestConfig) {
		// Ensure request configuration is valid
		if (!requestConfig || typeof requestConfig !== 'object') {
			return $qSvc.reject(new Error('Invalid request configuration provided.'));
		}

		// Set default HTTP method to POST if not specified
		requestConfig.method = requestConfig.method || 'POST';
		// Initialize headers if not present
		requestConfig.headers = requestConfig.headers || {};

		// Custom request transformation logic for ArrayBuffer data
		// This preserves raw ArrayBuffer data for direct transmission
		requestConfig.transformRequest = requestConfig.transformRequest || function(payloadData, headerAccessFn) {
			if (window.ArrayBuffer && payloadData instanceof window.ArrayBuffer) {
				return payloadData;
			}
			// Fallback to Angular's default transformer for other data types
			return $httpSvc.defaults.transformRequest[0](payloadData, headerAccessFn);
		};

		// Create a deferred object for managing promise states (resolve, reject, notify)
		var asyncOperation = $qSvc.defer();

		// Check if the XMLHttpRequest object is a shim (e.g., for older browsers or specific polyfills)
		// If it's a shim, we need to inject our XHR progress handler.
		if (window.XMLHttpRequest && window.XMLHttpRequest.__isShim) {
			// Attach a callback to intercept the underlying XHR object
			requestConfig.headers['__setXHR_'] = function() {
				return function(underlyingXHR) {
					if (!underlyingXHR) {
						// Log a warning or handle cases where XHR is unavailable
						console.warn('XHR instance not available for progress tracking.');
						return;
					}
					// Store the XHR object for potential abort operations later
					requestConfig.__XHR_INSTANCE = underlyingXHR;
					// Call any external XHR function provided in the config
					requestConfig.onXHRReady && requestConfig.onXHRReady(underlyingXHR);

					// Attach event listener for upload progress notifications
					underlyingXHR.upload.addEventListener('progress', function(progressEvent) {
						asyncOperation.notify(progressEvent);
					}, false);

					// Attach event listener for upload completion (for Firefox/IE compatibility)
					// This ensures a final progress notification even if 'progress' event stops prematurely.
					underlyingXHR.upload.addEventListener('load', function(loadEvent) {
						if (loadEvent.lengthComputable) {
							asyncOperation.notify(loadEvent);
						}
					}, false);
				};
			};
		}

		// Execute the HTTP request using Angular's $http service
		$httpSvc(requestConfig)
			.then(
				function(successResponse) { asyncOperation.resolve(successResponse); },
				function(errorResponse) { asyncOperation.reject(errorResponse); },
				function(notification) { asyncOperation.notify(notification); }
			);
		
		var requestPromise = asyncOperation.promise;

		// Attach convenience methods to the promise for easier handling
		requestPromise.thenSuccess = function(successCallback) {
			requestPromise.then(function(responseObj) {
				successCallback(responseObj.data, responseObj.status, responseObj.headers, requestConfig);
			});
			return requestPromise;
		};

		requestPromise.thenError = function(errorCallback) {
			requestPromise.then(null, function(responseObj) {
				errorCallback(responseObj.data, responseObj.status, responseObj.headers, requestConfig);
			});
			return requestPromise;
		};

		requestPromise.onProgress = function(progressCallback) {
			requestPromise.then(null, null, function(updateEvent) {
				progressCallback(updateEvent);
			});
			return requestPromise;
		};

		requestPromise.terminate = function() {
			if (requestConfig.__XHR_INSTANCE) {
				// Abort the XHR operation within a timeout to ensure proper Angular digest cycle
				$timeoutSvc(function() {
					requestConfig.__XHR_INSTANCE.abort();
				});
			} else {
				console.warn('Cannot abort: XHR instance not available or request already completed.');
			}
			return requestPromise;
		};

		requestPromise.setXhrCallback = function(callbackFn) {
			// Chain multiple XHR callbacks if necessary
			requestConfig.onXHRReady = (function(originalXhrCallback) {
				return function() {
					originalXhrCallback && originalXhrCallback.apply(requestPromise, arguments);
					callbackFn.apply(requestPromise, arguments);
				};
			})(requestConfig.onXHRReady);
			return requestPromise;
		};
		
		return requestPromise;
	}

	/**
	 * Initiates a file upload process using FormData.
	 * This method automatically configures headers and transforms the data into FormData.
	 * @param {object} uploadConfiguration - Configuration for the upload, including files and additional data.
	 * @returns {Promise} A promise for the upload operation.
	 */
	this.initiateFileUpload = function(uploadConfiguration) {
		// Ensure headers are defined and set Content-Type to undefined for FormData
		// This allows the browser to automatically set the correct 'multipart/form-data' boundary.
		uploadConfiguration.headers = uploadConfiguration.headers || {};
		uploadConfiguration.headers['Content-Type'] = undefined;
		
		// Use Angular's default transformRequest if none is specified
		uploadConfiguration.transformRequest = uploadConfiguration.transformRequest || $httpSvc.defaults.transformRequest;
		
		// Create a new FormData object to build the upload payload
		var uploadPayload = new FormData();
		var initialTransformFunction = uploadConfiguration.transformRequest;
		var originalPayloadContent = uploadConfiguration.data;

		// Override the transformRequest to build the FormData object
		uploadConfiguration.transformRequest = function(currentFormData, headerAccessor) {
			// Process any non-file data provided in the original configuration
			if (originalPayloadContent) {
				if (uploadConfiguration.customFormDataAppender) {
					// Use a custom appender function if provided
					for (var keyName in originalPayloadContent) {
						var valueToAppend = originalPayloadContent[keyName];
						uploadConfiguration.customFormDataAppender(currentFormData, keyName, valueToAppend);
					}
				} else {
					// Default logic to append data properties
					for (var dataKey in originalPayloadContent) {
						var dataValue = originalPayloadContent[dataKey];
						
						// Apply original transformRequest functions to non-file data
						if (typeof initialTransformFunction === 'function') {
							dataValue = initialTransformFunction(dataValue, headerAccessor);
						} else if (Array.isArray(initialTransformFunction)) {
							for (var i = 0; i < initialTransformFunction.length; i++) {
								var transformStep = initialTransformFunction[i];
								if (typeof transformStep === 'function') {
									dataValue = transformStep(dataValue, headerAccessor);
								}
							}
						}
						currentFormData.append(dataKey, dataValue);
					}
				}
			}

			// Process file(s) if provided in the configuration
			if (uploadConfiguration.fileToUpload != null) {
				var formFieldName = uploadConfiguration.fileFieldName || 'file'; // Default field name
				
				// Handle multiple files (an array of File objects)
				if (Object.prototype.toString.call(uploadConfiguration.fileToUpload) === '[object Array]') {
					var isSingleFieldName = Object.prototype.toString.call(formFieldName) === '[object String]';
					for (var fileIndex = 0; fileIndex < uploadConfiguration.fileToUpload.length; fileIndex++) {
						var currentFile = uploadConfiguration.fileToUpload[fileIndex];
						var currentFileName = (uploadConfiguration.fileNames && uploadConfiguration.fileNames[fileIndex]) || currentFile.name;
						currentFormData.append(isSingleFieldName ? formFieldName : formFieldName[fileIndex], currentFile, currentFileName);
					}
				} else {
					// Handle a single file
					var singleFileName = uploadConfiguration.fileName || uploadConfiguration.fileToUpload.name;
					currentFormData.append(formFieldName, uploadConfiguration.fileToUpload, singleFileName);
				}
			}
			return currentFormData; // Return the fully constructed FormData object
		};

		// Assign the constructed FormData object as the request data
		uploadConfiguration.data = uploadPayload;

		// Execute the HTTP request with the prepared configuration
		return performHttpRequest(uploadConfiguration);
	};

	/**
	 * Provides a direct way to make an HTTP request using the enhanced `performHttpRequest` function.
	 * @param {object} httpRequestConfig - Standard Angular $http configuration object.
	 * @returns {Promise} A promise for the HTTP operation.
	 */
	this.makeHttpRequest = function(httpRequestConfig) {
		return performHttpRequest(httpRequestConfig);
	};
}]);

// Directive for selecting files via a hidden input element.
appFileTransferModule.directive('fileInputSelect', [ '$parse', '$timeout', function(expressionParser, timerService) {
	return function(currentScope, hostElement, attributeSet) {
		var changeExpression = expressionParser(attributeSet['fileInputSelect']);

		// If the host element is not an <input type="file">, create a hidden one and append it.
		if (hostElement[0].tagName.toLowerCase() !== 'input' || (hostElement.attr('type') && hostElement.attr('type').toLowerCase()) !== 'file') {
			var hiddenFileInput = angular.element('<input type="file">');
			
			// Copy all attributes from the host element to the hidden input
			for (var i = 0; i < hostElement[0].attributes.length; i++) {
				var currentAttribute = hostElement[0].attributes[i];
				hiddenFileInput.attr(currentAttribute.name, currentAttribute.value);
			}
			
			// Handle 'multiple' attribute for multi-file selection
			if (hostElement.attr("allow-multiple")) {
				hiddenFileInput.attr("multiple", "true");
			}

			// Apply styling to make the input transparent and cover the host element
			hiddenFileInput
				.css("top", 0).css("bottom", 0).css("left", 0).css("right", 0)
				.css("width", "100%").css("height", "100%") // Ensure it covers the full area
				.css("opacity", 0).css("position", "absolute")
				.css('filter', 'alpha(opacity=0)'); // IE opacity filter

			// Append the hidden input to the host element
			hostElement.append(hiddenFileInput);

			// Ensure the host element has a relative position for the absolute input to work correctly
			if (hostElement.css("position") === '' || hostElement.css("position") === 'static') {
				hostElement.css("position", "relative");
			}
			hostElement = hiddenFileInput; // Now, all further operations refer to the hidden input
		}

		// Bind the change event to the actual file input element
		hostElement.bind('change', function(domEvent) {
			var capturedFiles = [];
			var fileCollection = domEvent.__files_ || domEvent.target.files;

			if (fileCollection && fileCollection.length > 0) {
				// Convert FileList to a standard Array
				for (var idx = 0; idx < fileCollection.length; idx++) {
					capturedFiles.push(fileCollection.item(idx));
				}
			}

			// Execute the bound expression within an Angular digest cycle
			timerService(function() {
				changeExpression(currentScope, {
					$selectedFiles : capturedFiles,
					$eventObject : domEvent
				});
			});
		});
	};
}]);

// Directive to check and notify if drag-and-drop file functionality is available.
appFileTransferModule.directive('fileDropSupportCheck', [ '$parse', '$timeout', function(expressionParser, timerService) {
	return function(currentScope, elementNode, attributeSet) {
		// Feature detection for HTML5 draggable attribute
		if ('draggable' in document.createElement('span')) {
			var availabilityNotifier = expressionParser(attributeSet['fileDropSupportCheck']);
			timerService(function() {
				availabilityNotifier(currentScope); // Notify the scope that drop is supported
			});
		}
	};
}]);

// Directive for handling file drops onto an element.
appFileTransferModule.directive('fileDropZone', [ '$parse', '$timeout', '$location', function(expressionParser, timerService, locationService) {
	return function(currentScope, dropElement, attributeSet) {
		// Verify drag-and-drop capability in the browser
		if (!('draggable' in document.createElement('span'))) {
			// If not supported, do nothing
			return;
		}

		var dragLeaveDelayTimer = null;
		var activeDragClass = null; // Stores the class to apply when dragging over

		// Event listener for when an item is dragged over the element
		dropElement[0].addEventListener("dragover", function(dragEvent) {
			dragEvent.stopPropagation();
			dragEvent.preventDefault(); // Prevent default browser behavior (e.g., opening file)
			timerService.cancel(dragLeaveDelayTimer); // Cancel any pending dragleave timeout

			if (!activeDragClass) {
				// Determine the drag-over class, allowing for dynamic evaluation
				var classAttributeValue = attributeSet['dragOverClass'];
				if (classAttributeValue && classAttributeValue.endsWith(')')) { // Check for expression
					var classResolverFn = expressionParser(classAttributeValue);
					activeDragClass = classResolverFn(currentScope, {
						$eventObject : dragEvent
					});
				} else {
					activeDragClass = classAttributeValue || "drag-active"; // Default class
				}
			}
			dropElement.addClass(activeDragClass);
		}, false);

		// Event listener for when an item enters the element's bounds
		dropElement[0].addEventListener("dragenter", function(dragEvent) {
			dragEvent.stopPropagation();
			dragEvent.preventDefault();
		}, false);

		// Event listener for when an item leaves the element's bounds
		dropElement[0].addEventListener("dragleave", function(dragEvent) {
			// Apply a small delay before removing the class, to prevent flickering
			var delayAmount = parseInt(attributeSet['dragLeaveDelay'], 10) || 1;
			dragLeaveDelayTimer = timerService(function() {
				dropElement.removeClass(activeDragClass);
				activeDragClass = null;
			}, delayAmount);
		}, false);

		var dropCallback = expressionParser(attributeSet['fileDropZone']);

		// Event listener for when an item is dropped onto the element
		dropElement[0].addEventListener("drop", function(dropEvent) {
			dropEvent.stopPropagation();
			dropEvent.preventDefault(); // Prevent default browser behavior (e.g., opening file)

			dropElement.removeClass(activeDragClass); // Remove drag-over class immediately
			activeDragClass = null;

			// Extract files from the drop event, including directory structures
			processDroppedItems(dropEvent, function(extractedFiles) {
				dropCallback(currentScope, {
					$droppedFiles : extractedFiles,
					$eventObject : dropEvent
				});
			});
		}, false);
		
		/**
		 * Checks if a string contains only ASCII characters.
		 * @param {string} inputString - The string to check.
		 * @returns {boolean} True if the string is ASCII, false otherwise.
		 */
		function isPureAsciiString(inputString) {
			// Regex to check for characters outside the ASCII range (0-127)
			return /^[\x00-\x7F]*$/.test(inputString);
		}

		var processingFileTree = 0; // Counter for asynchronous file system operations

		/**
		 * Recursively traverses a file system entry (file or directory).
		 * @param {Array<File>} collectedFiles - Array to accumulate File objects.
		 * @param {FileSystemEntry} currentEntry - The current file system entry.
		 * @param {string} [currentPath=''] - The relative path from the drop zone root.
		 */
		function walkFileSystemTree(collectedFiles, currentEntry, currentPath) {
			currentPath = currentPath || ''; // Initialize path if not provided

			if (!currentEntry) {
				console.warn('Skipping null or undefined file system entry.');
				return;
			}

			if (currentEntry.isDirectory) {
				var directoryReader = currentEntry.createReader();
				processingFileTree++; // Increment counter for directory read operation
				directoryReader.readEntries(function(entries) {
					entries.forEach(function(subEntry) {
						walkFileSystemTree(collectedFiles, subEntry, currentPath + currentEntry.name + "/");
					});
					processingFileTree--; // Decrement counter when directory read is complete
				});
			} else { // It's a file entry
				processingFileTree++; // Increment counter for file retrieval operation
				currentEntry.file(function(fileObject) {
					processingFileTree--; // Decrement counter when file is retrieved
					if (fileObject) {
						fileObject._relativePath = currentPath + fileObject.name; // Attach relative path
						collectedFiles.push(fileObject);
					} else {
						console.warn('Failed to retrieve file object for entry:', currentEntry.name);
					}
				});
			}
		}

		/**
		 * Extracts files from a DataTransfer object, handling both simple files and complex directory structures.
		 * @param {Event} dropEvt - The drop event object.
		 * @param {Function} completionCallback - Callback function to execute with the extracted files.
		 */
		function processDroppedItems(dropEvt, completionCallback) {
			var extractedFiles = [];
			var transferItems = dropEvt.dataTransfer.items;

			// Check for DataTransfer items and webkitGetAsEntry support (for directory drops)
			// Also ensure it's not a local file:// protocol, as webkitGetAsEntry might not work
			if (transferItems && transferItems.length > 0 && transferItems[0].webkitGetAsEntry && locationService.protocol() !== 'file') {
				for (var i = 0; i < transferItems.length; i++) {
					var fileSystemEntry = transferItems[i].webkitGetAsEntry();
					if (fileSystemEntry != null) {
						// Workaround for Chromium bug with non-ASCII filenames in webkitGetAsEntry
						// If a filename is non-ASCII, fall back to getAsFile directly for that item.
						if (isPureAsciiString(fileSystemEntry.name)) {
							walkFileSystemTree(extractedFiles, fileSystemEntry);
						} else if (!fileSystemEntry.isDirectory) {
							var directFile = transferItems[i].getAsFile();
							if (directFile) {
								extractedFiles.push(directFile);
							}
						}
					}
				}
			} else {
				// Fallback for browsers without webkitGetAsEntry or for simple file drops
				var fileList = dropEvt.dataTransfer.files;
				if (fileList != null) {
					for (var fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
						extractedFiles.push(fileList.item(fileIdx));
					}
				}
			}

			// Wait for all asynchronous file system processing to complete
			(function deferUntilCompletion(retryDelay) {
				timerService(function() {
					if (processingFileTree === 0) {
						completionCallback(extractedFiles);
					} else {
						deferUntilCompletion(10); // Continue waiting with a small delay
					}
				}, retryDelay || 0);
			})();
		}
	};
}]);

})();