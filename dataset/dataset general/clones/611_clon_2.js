(function (globalScope, notDefinedValue) {

	// Retrieve the Angular framework instance from the global object.
	var ngFramework = globalScope.angular;

	// Proceed only if Angular is available.
	if (ngFramework !== notDefinedValue) {

		// Initialize the primary Angular module for Cloud API integration.
		var mainAppModule = ngFramework.module('cloud-ng-integration', []);

		// Configure the main module's run block for initial setup.
		mainAppModule.run(['deferredSvc', 'hostEnv', function (deferredSvc, hostEnv) {

			// Verify that the Cloud SDK (Parse) is present and an object on the host environment.
			if (!ngFramework.isUndefined(hostEnv.Parse) && ngFramework.isObject(hostEnv.Parse)) {

				// Create a concise local reference to the Cloud SDK.
				var CloudSDK = hostEnv.Parse;

				/*
				 *  Definition of SDK components and their methods that require Promises.
				 *  This structured map indicates which prototype and static methods
				 *  of Cloud SDK classes should be wrapped with AngularJS's $q service.
				 */
				var apiPatchList = {
					"Object": {
						memberFunctions: ['save', 'fetch', 'destroy'],
						classMethods: ['saveAll', 'destroyAll']
					},
					"Collection": {
						memberFunctions: ['fetch'],
						classMethods: []
					},
					"Query": {
						memberFunctions: ['find', 'first', 'count', 'get'],
						classMethods: []
					},
					"Cloud": {
						memberFunctions: [],
						classMethods: ['run']
					},
					"User": {
						memberFunctions: ['signUp'],
						classMethods: ['requestPasswordReset', 'logIn']
					},
					"FacebookUtils": {
						memberFunctions: [],
						classMethods: ['logIn', 'link', 'unlink']
					},
					"Config": {
						memberFunctions: [],
						classMethods: ['get']
					}
				};

				// Iterate over each defined Cloud SDK entity to apply the patching.
				for (var entityName in apiPatchList) {

					var activeEntity = entityName;
					var entityConfiguration = apiPatchList[entityName];

					var instanceMethods = entityConfiguration.memberFunctions;
					var staticFunctions = entityConfiguration.classMethods;


					// Process and wrap prototype methods for the current entity.
					instanceMethods.forEach(function (operationName) {

						var originalOperation = CloudSDK[activeEntity].prototype[operationName];

						// Replace the original method with a $q-wrapped version.
						CloudSDK[activeEntity].prototype[operationName] = function () {

							return originalOperation.apply(this, arguments)
								.then(function (operationResult) {
									var promiseHandle = deferredSvc.defer();
									promiseHandle.resolve(operationResult);
									return promiseHandle.promise;
								}, function (failureReason) {
									var promiseHandle = deferredSvc.defer();
									promiseHandle.reject(failureReason);
									return promiseHandle.promise;
								});
						};
					});


					// Process and wrap static methods for the current entity.
					staticFunctions.forEach(function (operationName) {

						var originalOperation = CloudSDK[activeEntity][operationName];

						// Replace the original static function with a $q-wrapped version.
						CloudSDK[activeEntity][operationName] = function () {

							return originalOperation.apply(this, arguments)
								.then(function (operationResult) {
									var promiseHandle = deferredSvc.defer();
									promiseHandle.resolve(operationResult);
									return promiseHandle.promise;
								}, function (failureReason) {
									var promiseHandle = deferredSvc.defer();
									promiseHandle.reject(failureReason);
									return promiseHandle.promise;
								});
						};
					});
				}
			}
		}]);


		// Define a secondary module for advanced Cloud SDK enhancements, dependent on the core integration.
		ngFramework.module('cloud-ng-enhancements', ['cloud-ng-integration'])
			.run(['deferredSvc', 'hostEnv', function (deferredSvc, hostEnv) {


				// Re-verify Cloud SDK presence in the global scope.
				if (!ngFramework.isUndefined(hostEnv.Parse) && ngFramework.isObject(hostEnv.Parse)) {

					var CloudSDK = hostEnv.Parse;

					/*
					 *  Introduce a utility method to easily retrieve a class definition.
					 *  This is necessary because `CloudSDK.Object("className")` creates
					 *  an instance, not providing access to static class methods.
					 */
					CloudSDK.Object.retrieveType = function (classIdentifier) {
						return CloudSDK.Object._typeRegistry[classIdentifier];
					};

					// Helper function to convert the first character of a string to uppercase.
					function capitalizeInitial(inputString) {
						return inputString.charAt(0).toUpperCase() + inputString.slice(1);
					}


					// Preserve the original `extend` method of `CloudSDK.Object`.
					var originalTypeExtension = CloudSDK.Object.extend;

					// Override `CloudSDK.Object.extend` to automatically generate
					// Angular-friendly getters and setters for defined attributes.
					CloudSDK.Object.extend = function (instanceSettings) {

						var derivedClass = originalTypeExtension.apply(this, arguments);

						// If prototype properties include an 'attrs' array, generate accessors.
						if (CloudSDK._.isObject(instanceSettings) && CloudSDK._.isArray(instanceSettings.attrs)) {
							var propertyNames = instanceSettings.attrs;
							// Iterate through each attribute to create its getter and setter.
							CloudSDK._.each(propertyNames, function (fieldKey) {

								var attributeName = capitalizeInitial(fieldKey);

								// Only create a getter if one doesn't already exist.
								if (!derivedClass.prototype['get' + attributeName]) {
									derivedClass.prototype['get' + attributeName] = function () {
										return this.get(fieldKey);
									};
								}
								// Only create a setter if one doesn't already exist.
								if (!derivedClass.prototype['set' + attributeName]) {
									derivedClass.prototype['set' + attributeName] = function (assignedData) {
										this.set(fieldKey, assignedData);
										return this; // Allow method chaining.
									};
								}
							});
						}
						return derivedClass;
					};


					// Initialize a registry for CloudSDK Collection subclasses.
					CloudSDK.Collection._typeRegistry = {};

					// Store the base Collection `extend` method.
					var baseCollectionExtend = CloudSDK.Collection.extend;

					// Augment `CloudSDK.Collection.extend` to automatically register
					// new collection subclasses in the `_typeRegistry`.
					CloudSDK.Collection.extend = function (configOptions) {

						var generatedClass = baseCollectionExtend.apply(this, arguments);

						// If `className` is provided in options, register the new class.
						if (configOptions && configOptions.className) {
							CloudSDK.Collection._typeRegistry[configOptions.className] = generatedClass;
						}

						return generatedClass;
					};


					// Add a static method to `CloudSDK.Collection` to retrieve a registered collection class.
					CloudSDK.Collection.retrieveType = function (collectionIdentifier) {
						return CloudSDK.Collection._typeRegistry[collectionIdentifier];
					};


					// Extend the `CloudSDK.Collection` prototype with additional utility methods.
					CloudSDK.Collection.prototype = ngFramework.extend(CloudSDK.Collection.prototype, {
						/*
						 *  Method to load additional items for pagination.
						 *  This fetches the next page of results and appends them to the collection.
						 */
						fetchAdditional: function (settings) {

							// Ensure a query is defined for the collection.
							if (!ngFramework.isUndefined(this.query)) {

								// Determine the current query limit, defaulting to 100 if unspecified.
								var itemsPerPage = this.query._limit === -1 ? 100 : this.query._limit;
								var currentOffset = this.query._skip;

								// Increment the offset to fetch the next set of items.
								currentOffset += itemsPerPage;

								this.query.skip(currentOffset);

								var contextRef = this;

								// Execute the query and process the results.
								return this.query.find()
									.then(function (moreRecords) {
										// Add fetched items to the collection unless specified not to.
										if (!settings || settings.add !== false) contextRef.add(moreRecords);
										// Update the flag if no more items are expected.
										if (moreRecords.length < itemsPerPage) contextRef.furtherDataAvailable = false;
										return moreRecords;
									});
							}
						}
					});
				}
			}]);
	}
})(this, undefined);