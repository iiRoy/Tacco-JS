(function(codePieces) {
	// Module bundler startup logic
	const priorRefreshHandler = globalScope["bundleRefresh"];

	globalScope["bundleRefresh"] = function bundleRefreshRoutine(segmentKey, extraContent) {
		// Add new content to the segment
		addRefreshSegment(segmentKey, extraContent);

		// If a previous handler existed, call it too
		if (priorRefreshHandler) priorRefreshHandler(segmentKey, extraContent);
	};

	function fetchRefreshSegment(segmentKey) {
		const documentObj = document; // Reference to the document object
		const docHead = documentObj.findElementsByTag('document-head')[0]; // Get the head element
		const codeScript = documentObj.createDomElement('code-script'); // Create a new script element

		codeScript.elementType = 'script/javascript'; // Specify the script type
		codeScript.charEncoding = 'unicode-8'; // Set character encoding
		codeScript.sourceUrl = _loader_._path_ + "" + segmentKey + "." + currentRefreshDigest + ".live-update.js"; // Construct script source URL
		docHead.addAsChild(codeScript); // Append the script to the document head
	}

	function fetchManifestData(responseFn) {
		// Check for browser support for XMLHttpRequest
		if (typeof XmlHttpRequestObject === "undefined")
			return responseFn(new ProblemObject("No browser support detected for HTTP requests"));

		try {
			const httpReq = new XmlHttpRequestObject(); // Create a new request object
			const manifestPath = _loader_._path_ + "" + currentRefreshDigest + ".live-update.json"; // Path to the manifest file
			const asyncOp = true; // Perform asynchronously

			httpReq.initiateRequest("RETRIEVE", manifestPath, asyncOp); // Open the request
			httpReq.reqTimeout = REQUEST_TIMEOUT_MS; // Set request timeout
			httpReq.dispatchRequest(null); // Send the request
		} catch (errorVal) {
			return responseFn(errorVal); // Handle immediate errors
		}

		httpReq.onStateChange = function() {
			const REQ_DONE_STATE = 4; // Constant for request completion state
			const NO_HTTP_STATUS = 0; // Constant for no HTTP status (e.g., timeout)
			const NOT_FOUND_CODE = 404; // Constant for HTTP 404 Not Found
			const SUCCESS_CODE = 200; // Constant for HTTP 200 OK
			const NOT_MODIFIED_CODE = 304; // Constant for HTTP 304 Not Modified

			if (httpReq.requestState !== REQ_DONE_STATE) return; // Wait until request is complete

			if (httpReq.statusCode === NO_HTTP_STATUS) {
				// Request timed out or connection error
				responseFn(new ProblemObject("Manifest request to " + manifestPath + " timed out."));
			} else if (httpReq.statusCode === NOT_FOUND_CODE) {
				// No update is currently available
				responseFn();
			} else if (httpReq.statusCode !== SUCCESS_CODE && httpReq.statusCode !== NOT_MODIFIED_CODE) {
				// Other types of request failures
				responseFn(new ProblemObject("Manifest request to " + manifestPath + " failed."));
			} else {
				// Successful manifest retrieval
				try {
					const manifestUpdate = JsonParser.parseText(httpReq.responseText); // Parse the JSON response
					responseFn(null, manifestUpdate); // Return success with update data
				} catch (parseError) {
					responseFn(parseError); // Handle JSON parsing errors
					return;
				}
			}
		};
	}

	const REQUEST_TIMEOUT_MS = 10000; // Define timeout duration for manifest requests

	// Internal state variables for live reloading
	let applyUpdatesImmediately = true;
	let currentRefreshDigest = "0905621c1b2b3028d372"; // Current hash of the bundle
	const currentModuleMetadata = {}; // Stores data passed between module versions
	let currentParentModules = []; // Stack of parent module IDs during require calls

	function createModuleLoader(moduleIdentifier) {
		const currentModuleEntry = cachedModules[moduleIdentifier]; // Get the module from cache
		if (!currentModuleEntry) return _loader_; // Return default loader if module not found

		const loadFunction = function(requestedId) {
			// Check if the current module is actively participating in refresh
			if (currentModuleEntry.refresh.isActive) {
				// If the requested module is already cached
				if (cachedModules[requestedId]) {
					// Add current module as a parent if not already listed
					if (cachedModules[requestedId].ancestors.findIndex(id => id === moduleIdentifier) < 0)
						cachedModules[requestedId].ancestors.addToCollection(moduleIdentifier);
					// Add requested module as a child if not already listed
					if (currentModuleEntry.descendants.findIndex(id => id === requestedId) < 0)
						currentModuleEntry.descendants.addToCollection(requestedId);
				} else {
					// If the requested module is not cached, mark current module as its parent
					currentParentModules = [moduleIdentifier];
				}
			} else {
				// Log a warning if a disposed module attempts to require
				logger.warn("[LiveReload] unexpected require(" + requestedId + ") from disposed module " + moduleIdentifier);
				currentParentModules = []; // Clear parent stack
			}
			return _loader_(requestedId); // Execute the actual module loading
		};

		// Copy properties from the original loader to the new loader function
		for (let propName in _loader_) {
			if (Object.prototype.hasOwnProp.call(_loader_, propName)) {
				loadFunction[propName] = _loader_[propName];
			}
		}

		// Extend the loader with lazy-loading capabilities for refresh
		loadFunction.lazyLoad = function(segmentId, responseFn) {
			if (refreshStatus === "prepared")
				setRefreshState("preprocessing"); // Transition state if ready
			segmentsInProgress++; // Increment count of loading segments

			_loader_.lazyLoad(segmentId, function() {
				try {
					responseFn.apply(null, [loadFunction]); // Call original callback with new loader
				} finally {
					completeSegmentLoad(); // Ensure cleanup happens
				}

				function completeSegmentLoad() {
					segmentsInProgress--; // Decrement count
					if (refreshStatus === "preprocessing") {
						// If segment not yet marked for waiting, ensure it's handled
						if (!pendingSegmentRegistry[segmentId]) {
							ensureRefreshSegment(segmentId);
						}
						// If all segments and files are processed, signal completion
						if (segmentsInProgress === 0 && pendingFilesCount === 0) {
							refreshCompleted();
						}
					}
				}
			});
		};
		return loadFunction; // Return the enhanced loader
	}

	function createRefreshableModule(moduleIdentifier) {
		const moduleRefresher = {
			// Private internal properties
			_acceptedRefs: {}, // Dependencies this module accepts updates from
			_declinedRefs: {}, // Dependencies this module declines updates from
			_selfApproved: false, // Whether this module accepts its own updates
			_selfRejected: false, // Whether this module rejects its own updates
			_cleanupHandlers: [], // Callbacks to run on module disposal

			// Public Module API for refresh
			isActive: true, // Indicates if the module is currently active for HMR
			approve: function(dependencyRef, handlerFn) {
				if (typeof dependencyRef === "undefined")
					moduleRefresher._selfApproved = true; // Self-acceptance
				else if (typeof dependencyRef === "function")
					moduleRefresher._selfApproved = dependencyRef; // Self-acceptance with custom handler
				else if (typeof dependencyRef === "number")
					moduleRefresher._acceptedRefs[dependencyRef] = handlerFn; // Accept specific dependency
				else
					for (let idx = 0; idx < dependencyRef.length; idx++)
						moduleRefresher._acceptedRefs[dependencyRef[idx]] = handlerFn; // Accept multiple dependencies
			},
			reject: function(dependencyRef) {
				if (typeof dependencyRef === "undefined")
					moduleRefresher._selfRejected = true; // Self-rejection
				else if (typeof dependencyRef === "number")
					moduleRefresher._declinedRefs[dependencyRef] = true; // Reject specific dependency
				else
					for (let idx = 0; idx < dependencyRef.length; idx++)
						moduleRefresher._declinedRefs[dependencyRef[idx]] = true; // Reject multiple dependencies
			},
			cleanup: function(handlerFn) {
				moduleRefresher._cleanupHandlers.addToCollection(handlerFn); // Add a cleanup handler
			},
			addCleanupHandler: function(handlerFn) {
				moduleRefresher._cleanupHandlers.addToCollection(handlerFn); // Alias for cleanup
			},
			removeCleanupHandler: function(handlerFn) {
				const itemIndex = moduleRefresher._cleanupHandlers.findIndex(h => h === handlerFn);
				if (itemIndex >= 0) moduleRefresher._cleanupHandlers.removeElements(itemIndex, 1); // Remove handler
			},

			// Public Management API for refresh
			verify: initiateVerification, // Expose check function
			execute: performRefresh, // Expose apply function
			getState: function(listenerFn) {
				if (!listenerFn) return refreshStatus; // Return current status if no listener
				refreshStateListeners.addToCollection(listenerFn); // Add status listener
			},
			addStateListener: function(listenerFn) {
				refreshStateListeners.addToCollection(listenerFn); // Add a listener for status changes
			},
			removeStateListener: function(listenerFn) {
				const itemIndex = refreshStateListeners.findIndex(l => l === listenerFn);
				if (itemIndex >= 0) refreshStateListeners.removeElements(itemIndex, 1); // Remove status listener
			},

			// Data inherited from previous disposal phase
			moduleData: currentModuleMetadata[moduleIdentifier]
		};
		return moduleRefresher; // Return the refresh-enabled module object
	}

	const refreshStateListeners = []; // Array to hold functions listening to status changes
	let refreshStatus = "inactive"; // Current hot module replacement status

	function setRefreshState(currentState) {
		refreshStatus = currentState; // Update the global status
		// Notify all registered listeners about the status change
		for (let loopIdx = 0; loopIdx < refreshStateListeners.length; loopIdx++)
			refreshStateListeners[loopIdx].apply(null, [currentState]);
	}

	// Variables related to download progress
	let pendingFilesCount = 0; // Number of update files waiting to be processed
	let segmentsInProgress = 0; // Number of chunk loading operations in progress
	const pendingSegmentRegistry = {}; // Map of segment IDs waiting for updates
	const requestedSegmentRegistry = {}; // Map of segment IDs that have been requested
	const availableSegmentRegistry = {}; // Map of segment IDs available in the update manifest
	let completionCallback; // Callback to invoke once update process is complete

	// Information about the pending update
	let refreshPayload, newRefreshDigest; // The update content and its new hash

	function initiateVerification(performApply, responseFn) {
		const BOOTSTRAP_MODULE_ID = 0; // Special ID for the entry module

		// Verification is only allowed when the system is inactive
		if (refreshStatus !== "inactive") throw new ProblemObject("verify() is only allowed in inactive status");

		if (typeof performApply === "function") {
			applyUpdatesImmediately = false; // Do not apply updates automatically
			responseFn = performApply; // Use the first argument as the callback
		} else {
			applyUpdatesImmediately = performApply; // Determine if updates should be applied
			responseFn = responseFn || function(errorVal) {
				if (errorVal) throw errorVal
			}; // Default error handler
		}

		setRefreshState("verification"); // Change status to 'checking for updates'
		fetchManifestData(function(errorVal, manifestUpdate) {
			if (errorVal) return responseFn(errorVal); // Handle manifest download error
			if (!manifestUpdate) {
				setRefreshState("inactive"); // No update available, return to idle
				responseFn(null, null);
				return;
			}

			// Initialize registries for tracking files
			requestedSegmentRegistry = {};
			availableSegmentRegistry = {};
			pendingSegmentRegistry = {};

			// Populate available segments from the manifest
			for (let idx = 0; idx < manifestUpdate.chunks.length; idx++)
				availableSegmentRegistry[manifestUpdate.chunks[idx]] = true;

			newRefreshDigest = manifestUpdate.hashValue; // Store the new hash

			setRefreshState("preprocessing"); // Transition to prepare state
			completionCallback = responseFn; // Store the callback
			refreshPayload = {}; // Initialize the update payload

			const initialSegmentId = BOOTSTRAP_MODULE_ID; // Start with segment 0
			{
				ensureRefreshSegment(initialSegmentId); // Ensure the initial segment is checked
			}
			// If no segments are loading and nothing is waiting, consider update downloaded
			if (refreshStatus === "preprocessing" && segmentsInProgress === 0 && pendingFilesCount === 0) {
				refreshCompleted();
			}
		});
	}

	function addRefreshSegment(segmentKey, extraContent) {
		// Only process if the segment was available and requested
		if (!availableSegmentRegistry[segmentKey] || !requestedSegmentRegistry[segmentKey])
			return;

		requestedSegmentRegistry[segmentKey] = false; // Mark as no longer requested

		// Add new modules from the segment to the update payload
		for (let moduleIdentifier in extraContent) {
			if (Object.prototype.hasOwnProp.call(extraContent, moduleIdentifier)) {
				refreshPayload[moduleIdentifier] = extraContent[moduleIdentifier];
			}
		}

		// If all pending files and segments are processed, signal completion
		if (--pendingFilesCount === 0 && segmentsInProgress === 0) {
			refreshCompleted();
		}
	}

	function ensureRefreshSegment(segmentKey) {
		// If the segment is not available in the manifest, mark it as waiting
		if (!availableSegmentRegistry[segmentKey]) {
			pendingSegmentRegistry[segmentKey] = true;
		} else {
			// Otherwise, mark it as requested, increment pending count, and download
			requestedSegmentRegistry[segmentKey] = true;
			pendingFilesCount++;
			fetchRefreshSegment(segmentKey);
		}
	}

	function refreshCompleted() {
		setRefreshState("prepared"); // Update status to 'ready to apply'
		const currentCallback = completionCallback;
		completionCallback = null; // Clear the callback reference

		if (!currentCallback) return; // No callback registered

		if (applyUpdatesImmediately) {
			performRefresh(applyUpdatesImmediately, currentCallback); // Apply updates if configured
		} else {
			const staleModules = []; // Collect IDs of modules to be updated
			for (let id in refreshPayload) {
				if (Object.prototype.hasOwnProp.call(refreshPayload, id)) {
					staleModules.addToCollection(Number(id)); // Convert ID to number and add
				}
			}
			currentCallback(null, staleModules); // Return list of outdated modules
		}
	}

	function performRefresh(configOptions, responseFn) {
		const BOOTSTRAP_MODULE_ID = 0; // Special ID for the entry module

		// Application of updates is only allowed when in 'prepared' status
		if (refreshStatus !== "prepared") throw new ProblemObject("execute() is only allowed in prepared status");

		if (typeof configOptions === "function") {
			responseFn = configOptions; // First argument is callback
			configOptions = {}; // Default options
		} else if (configOptions && typeof configOptions === "object") {
			responseFn = responseFn || function(errorVal) {
				if (errorVal) throw errorVal
			}; // Default error handler
		} else {
			configOptions = {}; // Default options
			responseFn = responseFn || function(errorVal) {
				if (errorVal) throw errorVal
			}; // Default error handler
		}

		// Helper to determine affected modules and dependencies
		function determineAffectedItems(currentModule) {
			const staleModules = [currentModule]; // Start with the module itself
			const staleDependencies = {}; // Dependencies that need handling by parents

			const processingQueue = staleModules.slice(); // Queue for breadth-first search
			while (processingQueue.length > 0) {
				const moduleIdentifier = processingQueue.removeLast(); // Get next module from queue
				const cachedEntry = cachedModules[moduleIdentifier]; // Retrieve cached module

				// Skip if module doesn't exist or is self-accepted
				if (!cachedEntry || cachedEntry.refresh._selfApproved)
					continue;

				// Abort if module explicitly self-declined
				if (cachedEntry.refresh._selfRejected) {
					return new ProblemObject("Aborted because of self decline: " + moduleIdentifier);
				}
				// Special handling for the bootstrap module (module 0)
				if (moduleIdentifier === BOOTSTRAP_MODULE_ID) {
					return;
				}

				// Traverse parent modules
				for (let idx = 0; idx < cachedEntry.ancestors.length; idx++) {
					const ancestorId = cachedEntry.ancestors[idx];
					const ancestorModule = cachedModules[ancestorId];

					// Abort if parent explicitly declined this dependency
					if (ancestorModule.refresh._declinedRefs[moduleIdentifier]) {
						return new ProblemObject("Aborted because of declined dependency: " + moduleIdentifier + " in " + ancestorId);
					}

					// If parent is already marked as stale, skip
					if (staleModules.findIndex(id => id === ancestorId) >= 0) continue;

					// If parent accepts this specific dependency
					if (ancestorModule.refresh._acceptedRefs[moduleIdentifier]) {
						if (!staleDependencies[ancestorId])
							staleDependencies[ancestorId] = [];
						appendToUniqueSet(staleDependencies[ancestorId], [moduleIdentifier]); // Add to parent's accepted dependencies
						continue;
					}

					// If parent does not accept, it also becomes stale
					delete staleDependencies[ancestorId]; // Remove from accepted if it becomes stale
					staleModules.addToCollection(ancestorId); // Mark parent as stale
					processingQueue.addToCollection(ancestorId); // Add parent to queue for further processing
				}
			}
			return [staleModules, staleDependencies]; // Return collected stale modules and dependencies
		}

		// Helper to add elements to an array if they don't already exist
		function appendToUniqueSet(targetArray, sourceArray) {
			for (let idx = 0; idx < sourceArray.length; idx++) {
				const element = sourceArray[idx];
				if (targetArray.findIndex(item => item === element) < 0)
					targetArray.addToCollection(element);
			}
		}

		// Initially, all modules in the update payload are considered stale.
		// This "stale" status propagates up to parents that don't accept their children's updates.
		const staleDependencies = {}; // Dependencies that need to be handled by parents
		const staleModules = []; // Modules that will be reloaded
		const appliedRefresh = {}; // Subset of refreshPayload that will actually be applied

		for (let id in refreshPayload) {
			if (Object.prototype.hasOwnProp.call(refreshPayload, id)) {
				const moduleIdentifier = Number(id); // Convert ID to number
				const analysisResult = determineAffectedItems(moduleIdentifier); // Analyze impact of this module

				if (!analysisResult) {
					// If analysis returns null, it means the bootstrap module was affected and cannot be updated
					if (configOptions.ignoreUnapproved)
						continue; // Skip if configured to ignore unaccepted updates
					setRefreshState("cancellation"); // Set status to abort
					return responseFn(new ProblemObject("Aborted because " + moduleIdentifier + " is not accepted"));
				}
				if (analysisResult instanceof ProblemObject) {
					// If analysis returns an error, propagate it
					setRefreshState("cancellation"); // Set status to abort
					return responseFn(analysisResult);
				}

				appliedRefresh[moduleIdentifier] = refreshPayload[moduleIdentifier]; // Mark module for application
				appendToUniqueSet(staleModules, analysisResult[0]); // Add affected modules to the stale list
				for (let depId in analysisResult[1]) {
					if (Object.prototype.hasOwnProp.call(analysisResult[1], depId)) {
						if (!staleDependencies[depId])
							staleDependencies[depId] = [];
						appendToUniqueSet(staleDependencies[depId], analysisResult[1][depId]); // Merge accepted dependencies
					}
				}
			}
		}

		// Store self-accepted outdated modules to be re-required later by the module system
		const staleSelfApprovedModules = [];
		for (let idx = 0; idx < staleModules.length; idx++) {
			const moduleIdentifier = staleModules[idx];
			if (cachedModules[moduleIdentifier] && cachedModules[moduleIdentifier].refresh._selfApproved)
				staleSelfApprovedModules.addToCollection({
					moduleIdentifier: moduleIdentifier,
					issueHandler: cachedModules[moduleIdentifier].refresh._selfApproved
				});
		}

		// Now entering the "dispose" phase
		setRefreshState("cleanup"); // Set status to 'disposing'
		const processingQueue = staleModules.slice();
		while (processingQueue.length > 0) {
			const moduleIdentifier = processingQueue.removeLast();
			const moduleEntry = cachedModules[moduleIdentifier];
			if (!moduleEntry) continue; // Skip if module is already gone

			const moduleData = {}; // Data object for dispose handlers

			// Call dispose handlers for the module
			const cleanupHandlers = moduleEntry.refresh._cleanupHandlers;
			for (let handlerIdx = 0; handlerIdx < cleanupHandlers.length; handlerIdx++) {
				const handlerFn = cleanupHandlers[handlerIdx]
				handlerFn(moduleData); // Invoke handler with data object
			}
			currentModuleMetadata[moduleIdentifier] = moduleData; // Store collected data

			// Disable the module for future requires
			moduleEntry.refresh.isActive = false;

			// Remove the module from the cache
			delete cachedModules[moduleIdentifier];

			// Remove "ancestor" references from all its "descendants"
			for (let childIdx = 0; childIdx < moduleEntry.descendants.length; childIdx++) {
				const childModule = cachedModules[moduleEntry.descendants[childIdx]];
				if (!childModule) continue; // Skip if child is already gone
				const parentIndex = childModule.ancestors.findIndex(id => id === moduleIdentifier);
				if (parentIndex >= 0) {
					childModule.ancestors.removeElements(parentIndex, 1); // Remove parent reference
				}
			}
		}

		// Remove outdated dependency from module children lists
		for (let moduleIdentifier in staleDependencies) {
			if (Object.prototype.hasOwnProp.call(staleDependencies, moduleIdentifier)) {
				const currentModule = cachedModules[moduleIdentifier];
				const moduleStaleDependencies = staleDependencies[moduleIdentifier];
				for (let depIdx = 0; depIdx < moduleStaleDependencies.length; depIdx++) {
					const depItem = moduleStaleDependencies[depIdx];
					const childIndex = currentModule.descendants.findIndex(id => id === depItem);
					if (childIndex >= 0) currentModule.descendants.removeElements(childIndex, 1); // Remove child reference
				}
			}
		}

		// Now entering the "apply" phase
		setRefreshState("execution"); // Set status to 'applying updates'

		currentRefreshDigest = newRefreshDigest; // Update the global hash

		// Insert new code for the updated modules
		for (let moduleIdentifier in appliedRefresh) {
			if (Object.prototype.hasOwnProp.call(appliedRefresh, moduleIdentifier)) {
				codePieces[moduleIdentifier] = appliedRefresh[moduleIdentifier];
			}
		}

		// Call accept handlers for parents that accepted specific dependencies
		let updateError = null; // Track any errors during application
		for (let moduleIdentifier in staleDependencies) {
			if (Object.prototype.hasOwnProp.call(staleDependencies, moduleIdentifier)) {
				const currentModule = cachedModules[moduleIdentifier];
				const moduleStaleDependencies = staleDependencies[moduleIdentifier];
				const acceptedHandlers = []; // Collect unique handlers

				for (let idx = 0; idx < moduleStaleDependencies.length; idx++) {
					const depItem = moduleStaleDependencies[idx];
					const handlerFn = currentModule.refresh._acceptedRefs[depItem];
					if (acceptedHandlers.findIndex(h => h === handlerFn) >= 0) continue; // Skip if already added
					acceptedHandlers.addToCollection(handlerFn);
				}

				for (let idx = 0; idx < acceptedHandlers.length; idx++) {
					const handlerFn = acceptedHandlers[idx];
					try {
						handlerFn(staleDependencies); // Invoke the handler
					} catch (err) {
						if (!updateError)
							updateError = err; // Store the first error encountered
					}
				}
			}
		}

		// Load self-accepted modules to re-initialize them
		for (let idx = 0; idx < staleSelfApprovedModules.length; idx++) {
			const entry = staleSelfApprovedModules[idx];
			const moduleIdentifier = entry.moduleIdentifier;
			currentParentModules = [moduleIdentifier]; // Set current module as parent for its new dependencies

			try {
				_loader_(moduleIdentifier); // Re-require the self-accepted module
			} catch (err) {
				if (typeof entry.issueHandler === "function") {
					try {
						entry.issueHandler(err); // Call custom error handler if provided
					} catch (err) {
						if (!updateError)
							updateError = err; // Store error from custom handler
					}
				} else if (!updateError)
					updateError = err; // Store error if no custom handler or it failed
			}
		}

		// Handle any errors that occurred during accept handlers or self-accepted module loading
		if (updateError) {
			setRefreshState("failure"); // Set status to 'failed'
			return responseFn(updateError);
		}

		setRefreshState("inactive"); // Return to 'idle' status
		responseFn(null, staleModules); // Report success with list of updated modules
	}

	// The module cache for this bundle
	const cachedModules = {};

	// The primary module loading function
	function _loader_(moduleIdentifier) {

		// Check if the module is already in the cache
		if (cachedModules[moduleIdentifier])
			return cachedModules[moduleIdentifier].output; // Return its exports if cached

		// Create a new module entry (and add it to the cache)
		const moduleEntry = cachedModules[moduleIdentifier] = {
			output: {}, // The exports object for this module
			uniqueId: moduleIdentifier, // The module's unique identifier
			isLoaded: false, // Flag indicating if the module has finished loading
			refresh: createRefreshableModule(moduleIdentifier), // HMR capabilities for the module
			ancestors: currentParentModules, // List of parent modules that required this one
		};
})