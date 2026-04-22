(function(window, undef){


  var angular = window.angular; // Reference to the global Angular object.


  if (angular !== undef) { // Check if Angular is defined in the window scope.


    var module = angular.module('parse-angular', []); // Initialize the main module for Parse integration.


    module.run(['$q', '$window', function($q, $window){ // Run block to apply the core Parse enhancements.


      // This section ensures Parse is available before proceeding.
      if (!angular.isUndefined($window.Parse) && angular.isObject($window.Parse)) {


        var Parse = $window.Parse; // Create a local reference for easier access to the Parse SDK.


        //----------------------------------------------------------------------------------------------------------------------------------------------------------------
        // This object defines which Parse classes and their methods need to be wrapped with Angular's $q service for promise-based operations.
        // It categorizes methods into 'prototype' (instance methods) and 'static' (class methods).
        //----------------------------------------------------------------------------------------------------------------------------------------------------------------

        var methodsToUpdate = {
          "Object": { // Parse.Object class methods.
            prototype: ['save', 'fetch', 'destroy'], // Methods on instances of Parse.Object.
            static: ['saveAll', 'destroyAll'] // Static methods on the Parse.Object class itself.
          },
          "Collection": { // Parse.Collection class methods.
            prototype: ['fetch'], // Methods on instances of Parse.Collection.
            static: [] // No static methods to update for Collection.
          },
          "Query": { // Parse.Query class methods.
            prototype: ['find', 'first', 'count', 'get'], // Methods on instances of Parse.Query.
            static: [] // No static methods to update for Query.
          },
          "Cloud": { // Parse.Cloud class methods.
            prototype: [], // No prototype methods for Cloud.
            static: ['run'] // Static method for Cloud functions.
          },
          "User": { // Parse.User class methods.
            prototype: ['signUp'], // Method for new user sign-up.
            static: ['requestPasswordReset', 'logIn'] // Static methods for user management.
          },
          "FacebookUtils": { // Parse.FacebookUtils class methods.
            prototype: [], // No prototype methods for FacebookUtils.
            static: ['logIn', 'link', 'unlink'] // Static methods for Facebook integration.
          },
          "Config": { // Parse.Config class methods.
            prototype: [], // No prototype methods for Config.
            static: ['get'] // Static method to retrieve configuration.
          }
        };


        // Iterate over each Parse class defined in 'methodsToUpdate'.
        for (var k in methodsToUpdate) {


          var currentClass = k; // Store the current class name (e.g., "Object", "Collection").
          var currentObject = methodsToUpdate[k]; // Get the configuration object for the current class.

          var currentProtoMethods = currentObject.prototype; // Array of prototype methods to be wrapped.
          var currentStaticMethods = currentObject.static; // Array of static methods to be wrapped.


          /// --- Applying $q wrapper to prototype methods ---
          // This loop processes instance-level methods for each Parse class.
          currentProtoMethods.forEach(function(method){


            var origMethod = Parse[currentClass].prototype[method]; // Keep a reference to the original method.


            // Overwrite the original method with a new function that returns a $q promise.
            Parse[currentClass].prototype[method] = function() {


              // Call the original Parse method, applying the current 'this' context and arguments.
              return origMethod.apply(this, arguments)
                .then(function(data){ // Handle successful resolution of the Parse promise.
                  var defer = $q.defer(); // Create a new deferred object.
                  defer.resolve(data); // Resolve the deferred object with the data received from Parse.
                  return defer.promise; // Return the promise from the deferred object.
                }, function(err){ // Handle rejection (error) of the Parse promise.
                  var defer = $q.defer(); // Create a new deferred object for error handling.
                  defer.reject(err); // Reject the deferred object with the error.
                  return defer.promise; // Return the promise.
                });


            }; // End of new method definition.


          }); // End of forEach for prototype methods.


          /// --- Applying $q wrapper to static methods ---
          // This loop processes class-level (static) methods for each Parse class.
          currentStaticMethods.forEach(function(method){


            var origMethod = Parse[currentClass][method]; // Keep a reference to the original static method.


            // Overwrite the original static method with a $q-wrapped version.
            Parse[currentClass][method] = function() {


              // Call the original static Parse method.
              return origMethod.apply(this, arguments)
                .then(function(data){ // Success callback.
                  var defer = $q.defer();
                  defer.resolve(data);
                  return defer.promise;
                }, function(err){ // Error callback.
                  var defer = $q.defer();
                  defer.reject(err);
                  return defer.promise;
                });


            }; // End of new static method definition.


          }); // End of forEach for static methods.


        } // End of for...in loop over methodsToUpdate.
      } // End of Parse existence check.


    }]); // End of the first module.run block.



    // --- Second module for enhanced Parse functionality ---
    angular.module('parse-angular.enhance', ['parse-angular']) // Define a new module that depends on the core Parse-Angular module.
    .run(['$q', '$window', function($q, $window){ // Run block for additional enhancements.


      // Ensure Parse is available before applying enhancements.
      if (!angular.isUndefined($window.Parse) && angular.isObject($window.Parse)) {


        var Parse = $window.Parse; // Local reference to Parse.


        /// --- Helper method to access Parse Object classes ---
        // Parse.Object("xxxx") creates an instance, not the class constructor.
        // This method allows direct access to the registered class constructor.
        Parse.Object.getClass = function(className) {
          return Parse.Object._classMap[className]; // Access the internal class map.
        };


        ///// --- Utility function for capitalizing the first letter of a string ---
        function capitaliseFirstLetter(string) {
          return string.charAt(0).toUpperCase() + string.slice(1); // Capitalize and concatenate.
        }


        ///// --- Override Parse.Object.extend to generate getters/setters ---
        // This enhancement automatically creates `getFieldName` and `setFieldName` methods
        // on Parse.Object subclasses if an `attrs` array is provided in protoProps.
        var origObjectExtend = Parse.Object.extend; // Store the original Parse.Object.extend method.


        Parse.Object.extend = function(protoProps) { // Override the extend method.

          var newClass = origObjectExtend.apply(this, arguments); // Call the original extend method to get the new Parse class.


          // Check if protoProps contains an 'attrs' array.
          if (Parse._.isObject(protoProps) && Parse._.isArray(protoProps.attrs)) {
            var attrs = protoProps.attrs; // Get the array of attribute names.

            /// Generate setters & getters for each attribute.
            Parse._.each(attrs, function(currentAttr){ // Iterate over each attribute.


              var field = capitaliseFirstLetter(currentAttr); // Capitalize the attribute name for method names.


              // Don't override if a custom getter already exists.
              if(!newClass.prototype['get' + field]) {
                newClass.prototype['get' + field] = function() {
                  return this.get(currentAttr); // Return the value using Parse's `get` method.
                };
              }
              // Don't override if a custom setter already exists.
              if(!newClass.prototype['set' + field]) {
                newClass.prototype['set' + field] = function(data) {
                  this.set(currentAttr, data); // Set the value using Parse's `set` method.
                  return this; // Allow chaining.
                }
              }

            }); // End of each attribute iteration.
          }


          return newClass; // Return the newly created (and potentially enhanced) Parse class.
        } // End of Parse.Object.extend override.



        /// --- Enhance Parse.Collection functionality ---
        // Initialize a map to store Parse.Collection subclasses by their className.
        Parse.Collection._classMap = {};


        var origExtend = Parse.Collection.extend; // Store the original Parse.Collection.extend.


        /// Enhance Collection 'extend' to store their subclass in a map.
        // This makes it easier to retrieve a Collection class by its className later.
        Parse.Collection.extend = function(opts) {


          var extended = origExtend.apply(this, arguments); // Call the original extend method.


          if (opts && opts.className) { // If options include a className, store the extended class.
            Parse.Collection._classMap[opts.className] = extended;
          }


          return extended; // Return the extended Parse.Collection class.

        }; // End of Parse.Collection.extend override.


        // --- Add a static method to Parse.Collection to retrieve classes from the map ---
        Parse.Collection.getClass = function(className) {
          return Parse.Collection._classMap[className]; // Retrieve the class constructor.
        }


        /// --- Enhance Parse.Collection prototype with additional methods ---
        Parse.Collection.prototype = angular.extend(Parse.Collection.prototype, {
          // --- Simple Paginator method ---
          // Fetches more items for the collection based on current query limits and skips.
          loadMore: function(opts) {


            if (!angular.isUndefined(this.query)) { // Ensure a query is associated with the collection.


              // Determine the current limit (default to 100 if not explicitly set or -1).
              var currentLimit = this.query._limit == -1 ? 100 : this.query._limit;
              var currentSkip = this.query._skip; // Get the current skip value.


              currentSkip += currentLimit; // Increment skip for the next batch.


              this.query.skip(currentSkip); // Apply the new skip to the query.


              var _this = this; // Cache 'this' for use in the promise callback.


              return this.query.find() // Execute the find query.
                .then(function(newModels){ // On successful fetch of new models.
                  if (!opts || opts.add !== false) _this.add(newModels) // Add new models to the collection unless 'add: false' is specified.
                  if (newModels.length < currentLimit) _this.hasMoreToLoad = false; // Indicate no more data if fewer models than limit were returned.
                  return newModels; // Return the newly fetched models.
                });


            } // End of query existence check.


          } // End of loadMore method.


        }); // End of Parse.Collection.prototype enhancements.


      } // End of Parse existence check.


    }]); // End of the second module.run block.


  } // End of Angular existence check.


})(this); // IIFE closure, passing 'this' (window in a browser environment) and 'undefined'.