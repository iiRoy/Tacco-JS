(function(globalScope, undefinedVal){

	const ngFramework = globalScope.angular;

	if (ngFramework !== undefinedVal) {

		// Core module for integrating Parse SDK with Angular's promise system
		const parseNgCore = ngFramework.module('parse-ng-connector', []);

		parseNgCore.run(['$q', '$window', function(promiseService, winObj){


			// Verify Parse SDK existence and readiness before proceeding
			if (winObj.Parse && typeof winObj.Parse === 'object' && !ngFramework.isUndefined(winObj.Parse.Object)) {

				// Keep a local constant reference to the Parse SDK
				const theParseSDK = winObj.Parse;

				//-------------------------------------------------------------
				// Map of Parse SDK components and their methods to be promise-wrapped
				//-------------------------------------------------------------

				const sdkMethodWrappersConfig = {
					"Object": {
						instanceMethods: ['save', 'fetch', 'destroy'],
						classMethods: ['saveAll', 'destroyAll']
					},
					"Collection": {
						instanceMethods: ['fetch'],
						classMethods: []
					},
					"Query": {
						instanceMethods: ['find', 'first', 'count', 'get'],
						classMethods: []
					},
					"Cloud": {
						instanceMethods: [],
						classMethods: ['run']
					},
					"User": {
						instanceMethods: ['signUp'],
						classMethods: ['requestPasswordReset', 'logIn']
					},
					"FacebookUtils": {
						instanceMethods: [],
						classMethods: ['logIn', 'link', 'unlink']
					},
					"Config": {
						instanceMethods: [],
						classMethods: ['get']
					}
				};

				// Iterate over each Parse SDK component specified in the configuration
				for (const componentName in sdkMethodWrappersConfig) {
					// Ensure we are processing only own properties, not inherited ones
					if (!sdkMethodWrappersConfig.hasOwnProperty(componentName)) {
						continue;
					}

					const currentParseComponent = theParseSDK[componentName];
					const componentMethodConfig = sdkMethodWrappersConfig[componentName];

					const prototypeMethodList = componentMethodConfig.instanceMethods;
					const staticMethodList = componentMethodConfig.classMethods;


					// Process and wrap instance (prototype) methods
					prototypeMethodList.forEach(function(targetMethodName){

						const originalMethodReference = currentParseComponent.prototype[targetMethodName];

						// Skip if the method doesn't exist on the prototype
						if (typeof originalMethodReference !== 'function') {
							console.warn(`Parse SDK method ${componentName}.prototype.${targetMethodName} not found or not a function. Skipping promise integration.`);
							return;
						}

						// Replace the original method with a promise-aware wrapper
						currentParseComponent.prototype[targetMethodName] = function(...invocationArgs) {

							// Call the original Parse SDK method, which returns a Parse.Promise
							return originalMethodReference.apply(this, invocationArgs)
								.then(function(resolvedValue){
									// Resolve the Angular promise with the successful result
									return promiseService.resolve(resolvedValue);
								})
								.catch(function(rejectionReason){
									// Reject the Angular promise with the error details
									return promiseService.reject(rejectionReason);
								});
						};

					});


					// Process and wrap static (class) methods
					staticMethodList.forEach(function(targetMethodName){

						const originalMethodReference = currentParseComponent[targetMethodName];

						// Skip if the method doesn't exist statically
						if (typeof originalMethodReference !== 'function') {
							console.warn(`Parse SDK method ${componentName}.${targetMethodName} not found or not a function. Skipping promise integration.`);
							return;
						}

						// Replace the original static method with a promise-aware wrapper
						currentParseComponent[targetMethodName] = function(...invocationArgs) {

							return originalMethodReference.apply(this, invocationArgs)
								.then(resolvedValue => promiseService.resolve(resolvedValue)) // Simplified using arrow functions
								.catch(rejectionReason => promiseService.reject(rejectionReason)); // Simplified using arrow functions

						};

					});
				}
			} else {
				console.info("Parse SDK not detected or not fully initialized on 'window.Parse'. Skipping Parse-Angular promise wrapping.");
			}

		}]);



		// Module for additional Parse SDK enhancements
		ngFramework.module('parse-ng-connector.extensions', ['parse-ng-connector'])
		.run(['$q', '$window', function(promiseService, winObj){


			if (winObj.Parse && typeof winObj.Parse === 'object' && !ngFramework.isUndefined(winObj.Parse.Object)) {

				const theParseSDK = winObj.Parse;

				///-------------------------------------------------------------
				/// Enhancements for Parse.Object
				///-------------------------------------------------------------

				/// Provides a way to access a registered Parse.Object subclass by its class name
				/// This is useful as Parse.Object("ClassName") creates an instance, not the class itself.
				theParseSDK.Object.retrieveClassByName = function(nameOfClass) {
					// Basic validation for the input class name
					if (!nameOfClass || typeof nameOfClass !== 'string') {
						console.error("Invalid class name provided to Parse.Object.retrieveClassByName.");
						return null;
					}
					return theParseSDK.Object._classMap[nameOfClass];
				};

				/// Utility function to convert a string to PascalCase (first letter capitalized)
				const convertToPascalCase = (inputStr) => {
					if (!inputStr || typeof inputStr !== 'string' || inputStr.length === 0) {
						return ''; // Handle empty or invalid input
					}
		        return inputStr.charAt(0).toUpperCase() + inputStr.slice(1);
		    };


				/// Intercept and enhance the original Parse.Object.extend method
				const originalObjectExtendMethod = theParseSDK.Object.extend;

				theParseSDK.Object.extend = function(classDefinitionProps) {

					const newExtendedClass = originalObjectExtendMethod.apply(this, arguments);

					// Check if 'attrs' array is present in the class definition for automatic getter/setter generation
					if (theParseSDK._.isObject(classDefinitionProps) && theParseSDK._.isArray(classDefinitionProps.attrs)) {
						const attributeNameList = classDefinitionProps.attrs;

						// Generate dynamic getters and setters for each attribute
						theParseSDK._.each(attributeNameList, function(currentAttribute){

							const pascalCaseAttr = convertToPascalCase(currentAttribute);
							const getterFunctionName = `get${pascalCaseAttr}`;
							const setterFunctionName = `set${pascalCaseAttr}`;

							// Only create a getter if one is not already explicitly defined
							if (typeof newExtendedClass.prototype[getterFunctionName] === 'undefined') {
								newExtendedClass.prototype[getterFunctionName] = function() {
									return this.get(currentAttribute);
								};
							}
							// Only create a setter if one is not already explicitly defined
							if (typeof newExtendedClass.prototype[setterFunctionName] === 'undefined') {
								newExtendedClass.prototype[setterFunctionName] = function(incomingValue) {
									this.set(currentAttribute, incomingValue);
									return this; // Enable method chaining
								};
							}

						});
					}

					return newExtendedClass;
				};


				///-------------------------------------------------------------
				/// Enhancements for Parse.Collection
				///-------------------------------------------------------------

				/// Initialize a map to store references to Parse.Collection subclasses
				theParseSDK.Collection._collectionSubclassRegistry = {};

				const originalCollectionExtendMethod = theParseSDK.Collection.extend;

				/// Intercept Parse.Collection.extend to register new collection subclasses
				theParseSDK.Collection.extend = function(extensionOptions) {

					const extendedCollectionClass = originalCollectionExtendMethod.apply(this, arguments);

					// If a className is provided, store the new class in our registry
					if (extensionOptions && extensionOptions.className) {
						theParseSDK.Collection._collectionSubclassRegistry[extensionOptions.className] = extendedCollectionClass;
					}

					return extendedCollectionClass;
				};

				/// Provides a way to access a registered Parse.Collection subclass by its class name
				theParseSDK.Collection.retrieveClassByName = function(nameOfClass) {
					return theParseSDK.Collection._collectionSubclassRegistry[nameOfClass];
				};


				/// Augment the Parse.Collection prototype with additional methods
				Object.assign(theParseSDK.Collection.prototype, {
					// Simple pagination helper to load more items into the collection
					loadAdditionalItems: function(optionsForPagination) {

						// Ensure the collection has an associated Parse.Query object
						if (this.query instanceof theParseSDK.Query) {

							// Get current query limit, defaulting to 100 if not set or -1
							const currentQueryLimit = (this.query._limit === -1 || !this.query._limit) ? 100 : this.query._limit;
							// Get current skip value, defaulting to 0
							let currentQuerySkip = this.query._skip || 0;

							// Increment skip for the next page of results
							currentQuerySkip += currentQueryLimit;
							this.query.skip(currentQuerySkip);

							const collectionInstance = this; // Capture 'this' for use in the promise chain

							// Execute the query to fetch the next set of models
							return this.query.find()
							.then(function(newlyFetchedModels){
								// Determine if new models should be added to the collection
								const shouldAddModels = !optionsForPagination || optionsForPagination.add !== false;
								if (shouldAddModels) {
									collectionInstance.add(newlyFetchedModels);
								}

								// Update a flag indicating if more items might be available
								collectionInstance.hasMoreToLoad = newlyFetchedModels.length >= currentQueryLimit;

								return newlyFetchedModels; // Return the models that were just fetched
							})
							.catch(errorResult => {
								console.error("Failed to load additional collection items:", errorResult);
								return promiseService.reject(errorResult); // Propagate the error through Angular's promise
							});

						} else {
							console.warn("Parse.Collection instance lacks a valid Parse.Query for 'loadAdditionalItems'.");
							return promiseService.resolve([]); // Resolve with an empty array if no query is present
						}

					}

				});

			} else {
				console.info("Parse SDK not detected or not fully initialized for Parse-Angular extensions. Skipping enhancements.");
			}

		}]);



	} else {
		console.warn("AngularJS framework not detected on the global scope. Parse-Angular integration will not be initialized.");
	}

})(this);