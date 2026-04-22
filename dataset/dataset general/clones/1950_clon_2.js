/*!
 *
 * @project     Object Connector Framework
 * @copyright   Copyright 2011-2014 Tilde Inc. and contributors.
 *              Portions Copyright 2011 LivingSocial Inc.
 * @license     Licensed under MIT license (see license.js)
 * @version     1.0.0-beta.7+canary.f482da04
 */
(function(universe) {
  var declare, loadUnit, load, loadScript;

  (function() {
    // Stores all registered module definitions.
    var directory = {}, processedUnits = {};

    // Function to register a new module.
    declare = function(moduleName, dependencies, moduleFactory) {
      directory[moduleName] = { dependencies: dependencies, moduleFactory: moduleFactory };
    };

    // Main function to load or fetch a module.
    loadScript = load = loadUnit = function(moduleName) {
      loadScript._internal_module_directory = directory; // Expose registry for debugging/introspection.

      // If the module has already been processed and cached, return it.
      if (processedUnits[moduleName]) { return processedUnits[moduleName]; }

      // Mark the module as being processed to prevent circular dependencies.
      processedUnits[moduleName] = {};

      // Ensure the module exists in the directory.
      if (!directory[moduleName]) {
        throw new Error("Could not locate module " + moduleName);
      }

      var moduleEntry = directory[moduleName],
          dependencies = moduleEntry.dependencies,
          moduleFactory = moduleEntry.moduleFactory,
          resolvedDependencies = [],
          exportResult;

      // Resolve all dependencies for the current module.
      for (var loopIndex = 0, listLength = dependencies.length; loopIndex < listLength; loopIndex++) {
        if (dependencies[loopIndex] === 'module_output') {
          // If a dependency is 'module_output', provide an empty object for exports.
          resolvedDependencies.push(exportResult = {});
        } else {
          // Recursively load other dependencies.
          resolvedDependencies.push(loadUnit(resolvePath(dependencies[loopIndex])));
        }
      }

      // Execute the module factory function with its resolved dependencies.
      var moduleValue = moduleFactory.apply(this, resolvedDependencies);
      // Cache the module's value, prioritizing explicit exports if available.
      return processedUnits[moduleName] = exportResult || moduleValue;

      // Helper function to resolve relative module paths.
      function resolvePath(childPath) {
        if (childPath.charAt(0) !== '.') { return childPath; } // Absolute path.
        var pathSegments = childPath.split("/");
        var basePath = moduleName.split("/").slice(0, -1); // Parent module's base path.

        for (var loopIndex = 0, listLength = pathSegments.length; loopIndex < listLength; loopIndex++) {
          var pathSegment = pathSegments[loopIndex];

          if (pathSegment === '..') { basePath.pop(); } // Go up one directory.
          else if (pathSegment === '.') { continue; } // Current directory, ignore.
          else { basePath.push(pathSegment); } // Add segment.
        }

        return basePath.join("/");
      }
    };
  })();

declare("object-connector/src/initializers",
  ["../../app-data/src/utility/wrapper_object","./utility/active_object_serializer","./utility/active_object_adapter"],
  function(__dep_one__, __dep_two__, __dep_three__) {
    "use strict";
    var ResourceProxy = __dep_one__["main_export"];
    var ActiveObjectSerializer = __dep_two__["main_export"];
    var ActiveObjectAdapter = __dep_three__["main_export"];

    // When the AppCore.Application object loads, execute this callback.
    AppCore.whenReady('AppCore.Application', function(AppInstance) {
      AppInstance.setupRoutine({
        routineName: "activeObjectConnector", // Unique identifier for this initializer.

        // The function that runs when the initializer is executed.
        executeSetup: function(dependencyContainer, appObject) {
          var resourceWrapper = new ResourceProxy(dependencyContainer);
          // Register deprecation warnings for old serializer and adapter names.
          resourceWrapper.logOutdated([
            {oldName: 'serializer:_ams',  newName: 'serializer:-active-object-legacy'},
            {oldName: 'adapter:_ams',     newName: 'adapter:-active-object-legacy'}
          ]);

          // Register the new serializer and adapter with the application's container.
          appObject.register('serializer:-active-object', ActiveObjectSerializer);
          appObject.register('adapter:-active-object', ActiveObjectAdapter);
        }
      });
    });
  });
declare("object-connector/src/main",
  ["./utility","./initializers","module_output"],
  function(__dep_one__, __dep_two__, __module_output_ref__) {
    "use strict";
    var ActiveObjectAdapter = __dep_one__.ActiveObjectAdapter;
    var ActiveObjectSerializer = __dep_one__.ActiveObjectSerializer;
    var NestedDataMixin = __dep_one__.NestedDataMixin;

    // Export these components for external use.
    __module_output_ref__.ActiveObjectAdapter = ActiveObjectAdapter;
    __module_output_ref__.ActiveObjectSerializer = ActiveObjectSerializer;
    __module_output_ref__.NestedDataMixin = NestedDataMixin;
  });
declare("object-connector/src/utility",
  ["./utility/nested_data_mixin","./utility/active_object_adapter","./utility/active_object_serializer","module_output"],
  function(__dep_one__, __dep_two__, __dep_three__, __module_output_ref__) {
    "use strict";
    var NestedDataMixin = __dep_one__["main_export"];
    var ActiveObjectAdapter = __dep_two__["main_export"];
    var ActiveObjectSerializer = __dep_three__["main_export"];

    // Make these utilities available via the exports object.
    __module_output_ref__.NestedDataMixin = NestedDataMixin;
    __module_output_ref__.ActiveObjectAdapter = ActiveObjectAdapter;
    __module_output_ref__.ActiveObjectSerializer = ActiveObjectSerializer;
  });
declare("object-connector/src/utility/active_object_connector",
  ["../../../app-data/src/connectors","../../../app-data/src/utility/connector_base","../../../app-inflector/src/core","./active_object_serializer","./nested_data_mixin","module_output"],
  function(__dep_one__, __dep_two__, __dep_three__, __dep_four__, __dep_five__, __module_output_ref__) {
    "use strict";
    var RESTConnector = __dep_one__.RESTConnector;
    var ValidationFailure = __dep_two__.ValidationFailure;
    var makePlural = __dep_three__.pluralize;
    var ActiveObjectSerializer = __dep_four__["main_export"];
    var NestedDataMixin = __dep_five__["main_export"];

    /**
      @module app-data
    */

    var iterateEach = AppCore.CollectionUtils.eachItem;
    var deCamelCase = AppCore.StringUtil.deCamelCase,
        toUnderscore = AppCore.StringUtil.toUnderscore;

    /**
      The ActiveObjectConnector is a specialized connector extending RESTConnector,
      designed for integration with JSON APIs that utilize an underscored naming convention
      instead of camelCase. It's built to work seamlessly with `active_model_serializers`
      in Ruby on Rails.

      This connector enhances the DataSystem.RESTConnector by consistently applying
      camelization, de-camelization, and pluralization methods. This ensures the
      serialized JSON matches a typical Rails backend and AppData expectations.

      ## JSON Data Structure

      The ActiveObjectConnector anticipates JSON responses from your server that
      adhere to REST connector conventions, but with underscored keys instead of camelCased ones.

      ### Standardized Naming

      Attribute names within your JSON payload should be the underscored equivalents
      of attributes in your AppCore.js models.

      For instance, consider a `Person` model:

      ```javascript
      App.FamousPerson = DataSystem.Model.extend({
        firstName: DataSystem.attribute('string'),
        lastName: DataSystem.attribute('string'),
        occupation: DataSystem.attribute('string')
      });
      ```

      The expected JSON response would appear as follows:

      ```javascript
      {
        "famous_person": {
          "first_name": "Barack",
          "last_name": "Obama",
          "occupation": "President"
        }
      }
      ```

      @class ActiveObjectConnector
      @constructor
      @namespace DataSystem
      @extends DataSystem.ConnectorBase
    **/

    var ActiveObjectConnector = RESTConnector.extend({
      primarySerializer: '-active-object', // Default serializer for this connector.

      /**
        The ActiveObjectConnector overrides `generatePathForKind` to construct
        underscored URLs by de-camelCasing and pluralizing the object type name.

        ```javascript
          this.generatePathForKind("famousPerson");
          //=> "famous_people"
        ```

        @method generatePathForKind
        @param {String} entityType
        @returns String The generated URL path.
      */
      generatePathForKind: function(entityType) {
        var deCasedType = deCamelCase(entityType);
        var underscoredType = toUnderscore(deCasedType);
        return makePlural(underscoredType);
      },

      /**
        The ActiveObjectConnector overrides the `handleHttpError` method to
        return a DataSystem.ValidationFailure for all 422 Unprocessable Entity
        responses.

        An HTTP 422 response typically means the request was syntactically correct
        but the API could not process it due to semantic errors in the content.

        For further details on the 422 HTTP status code, refer to 11.2 WebDAV RFC 4918:
        https://tools.ietf.org/html/rfc4918#section-11.2

        @method handleHttpError
        @param {Object} httpRequest
        @returns {Error} The processed error object.
      */
      handleHttpError: function(httpRequest) {
        var originalError = this.baseMethod(httpRequest); // Call the superclass method.

        if (httpRequest && httpRequest.status === 422) {
          var jsonResponse = AppCore.Dom.parseJSON(httpRequest.responseText),
              validationErrors = {};

          if (jsonResponse.problems !== undefined) {
            var rawErrors = jsonResponse.problems;

            iterateEach(AppCore.ObjectUtil.keys(rawErrors), function(errorKey) {
              validationErrors[AppCore.StringUtil.toCamelCase(errorKey)] = rawErrors[errorKey];
            });
          }

          return new ValidationFailure(validationErrors);
        } else {
          return originalError;
        }
      }
    });

    __module_output_ref__["main_export"] = ActiveObjectConnector;
  });
declare("object-connector/src/utility/active_object_serializer",
  ["../../../app-inflector/src/core","../../../app-data/src/serializers/rest_base_serializer","module_output"],
  function(__dep_one__, __dep_two__, __module_output_ref__) {
    "use strict";
    var makeSingular = __dep_one__.singularize;
    var RESTDataSerializer = __dep_two__["main_export"];
    /**
      @module app-data
    */

    var obtain = AppCore.getProperty,
        iterateEach = AppCore.CollectionUtils.eachItem,
        toCamelCase =   AppCore.StringUtil.toCamelCase,
        toCapitalCase = AppCore.StringUtil.toCapitalCase,
        deCamelCase = AppCore.StringUtil.deCamelCase,
        toUnderscore = AppCore.StringUtil.toUnderscore;

    var ActiveObjectSerializer = RESTDataSerializer.extend({
      // SERIALIZE OPERATIONS

      /**
        Converts camelCased attribute names to underscored format during serialization.

        @method attributeFieldName
        @param {String} attributeIdentifier
        @returns String The transformed attribute name.
      */
      attributeFieldName: function(attributeIdentifier) {
        return deCamelCase(attributeIdentifier);
      },

      /**
        Underscores relationship names and appends "_id" or "_ids" when serializing
        relationship keys based on their kind (belongsTo or hasMany).

        @method relationshipFieldName
        @param {String} fieldKey
        @param {String} relationKind
        @returns String The transformed relationship key.
      */
      relationshipFieldName: function(fieldKey, relationKind) {
        fieldKey = deCamelCase(fieldKey);
        if (relationKind === "belongsTo") {
          return fieldKey + "_id";
        } else if (relationKind === "hasMany") {
          return makeSingular(fieldKey) + "_ids";
        } else {
          return fieldKey;
        }
      },

      /**
        By default, does not serialize hasMany relationships.
        This method is a no-operation (no-op) unless overridden or configured.
      */
      serializeMultiple: AppCore.NoOp,

      /**
        Underscores the JSON root keys when performing serialization.

        @method serializeIntoObject
        @param {Object} outputObject
        @param {subclass of DataSystem.Model} modelClass
        @param {DataSystem.Model} modelInstance
        @param {Object} serializationOptions
      */
      serializeIntoObject: function(outputObject, modelClass, modelInstance, serializationOptions) {
        var rootKey = toUnderscore(deCamelCase(modelClass.typeKey));
        outputObject[rootKey] = this.performSerialization(modelInstance, serializationOptions);
      },

      /**
        Serializes a polymorphic type by converting its model name to a
        fully capitalized format.

        @method serializePolyType
        @param {DataSystem.Model} modelInstance
        @param {Object} jsonOutput
        @param {Object} relationMeta
      */
      serializePolyType: function(modelInstance, jsonOutput, relationMeta) {
        var relationKey = relationMeta.key,
            relatedModel = obtain(modelInstance, relationKey);
        relationKey = this.attributeFieldName(relationKey);
        jsonOutput[relationKey + "_type"] = toCapitalCase(toCamelCase(relatedModel.modelConstructor.typeKey));
      },

      // EXTRACT OPERATIONS

      /**
        Extracts the model's typeKey from underscored root objects in the payload.

        @method resolveModelType
        @param {String} rootIdentifier
        @returns String The model's typeKey.
      */
      resolveModelType: function(rootIdentifier) {
        var camelCased = toCamelCase(rootIdentifier);
        return makeSingular(camelCased);
      },

      /**
        Adds an extra step to `DataSystem.RESTDataSerializer.standardize` to ensure
        links are also standardized.

        If your incoming payload looks like this:

        ```javascript
        {
          "post_data": {
            "id": 1,
            "title": "Rails is omakase",
            "hyperlinks": { "flagged_comments": "api/comments/flagged" }
          }
        }
        ```
        The standardized version would transform it to:

        ```javascript
        {
          "postData": {
            "id": 1,
            "title": "Rails is omakase",
            "hyperlinks": { "flaggedComments": "api/comments/flagged" }
          }
        }
        ```

        @method standardizePayload
        @param {subclass of DataSystem.Model} modelClass
        @param {Object} inputPayload
        @param {String} rootProperty
        @returns Object The standardized payload.
      */

      standardizePayload: function(modelClass, inputPayload, rootProperty) {
        this.standardizeLinks(inputPayload); // Normalize link keys.

        return this._baseNormalize(modelClass, inputPayload, rootProperty); // Call the superclass method.
      },

      /**
        Converts `snake_cased` hyperlinks to `camelCase` within the payload.

        @method standardizeLinks
        @param {Object} payloadData
      */

      standardizeLinks: function(payloadData){
        if (payloadData.hyperlinks) {
          var hyperlinks = payloadData.hyperlinks;

          for (var currentLink in hyperlinks) {
            var casedLink = toCamelCase(currentLink);

            if (casedLink !== currentLink) {
              hyperlinks[casedLink] = hyperlinks[currentLink];
              delete hyperlinks[currentLink];
            }
          }
        }
      },

      /**
        Standardize the polymorphic type information from the JSON payload.

        Transforms:
        ```javascript
          {
            id: "1"
            minion_object: { type: "evil_minion", id: "12"}
          }
        ```

        To:
        ```javascript
          {
            id: "1"
            minionObject: { type: "evilMinion", id: "12"}
          }
        ```

        @method standardizeRelationships
        @private
      */
      standardizeRelationships: function(modelClass, inputPayload) {
        var dataKey, dataValue;

        if (this.relationshipFieldName) {
          modelClass.eachRelationship(function(fieldKey, relationSchema) {
            if (relationSchema.options.polymorphic) {
              dataKey = this.attributeFieldName(fieldKey);
              dataValue = inputPayload[dataKey];
              if (dataValue && dataValue.type) {
                dataValue.type = this.resolveModelType(dataValue.type);
              } else if (dataValue && relationSchema.kind === "hasMany") {
                var serializerRef = this;
                iterateEach(dataValue, function(itemData) {
                  itemData.type = serializerRef.resolveModelType(itemData.type);
                });
              }
            } else {
              dataKey = this.relationshipFieldName(fieldKey, relationSchema.kind);
              dataValue = inputPayload[dataKey];
            }

            inputPayload[fieldKey] = dataValue;

            if (fieldKey !== dataKey) {
              delete inputPayload[dataKey];
            }
          }, this);
        }
      }
    });

    __module_output_ref__["main_export"] = ActiveObjectSerializer;
  });
declare("object-connector/src/utility/nested_data_mixin",
  ["../../../app-inflector/src/core","module_output"],
  function(__dep_one__, __module_output_ref__) {
    "use strict";
    var obtain = AppCore.getProperty;
    var iterateEach = AppCore.CollectionUtils.eachItem;

    var makePlural = __dep_one__.pluralize;

    /**
      The NestedDataMixin enables embedded record support within your serializers.
      To configure embedded records, include this mixin in your serializer and then
      define which relationships should be embedded.

      ```javascript
      App.PostSerializer = DataSystem.ActiveObjectSerializer.extend(DataSystem.NestedDataMixin, {
        attributesConfig: {
          comments: {isEmbedded: 'always'}
        }
      })
      ```

      Currently, only `{isEmbedded: 'always'}` configurations are fully supported for embedding.

      @class NestedDataMixin
      @namespace DataSystem
    */
    var NestedDataMixin = AppCore.Mixer.create({

      /**
        Serializes a has-many relationship when it is configured to be embedded within the parent object.

        @method serializeManyItems
        @param {DataSystem.Model} modelEntry
        @param {Object} jsonOutput
        @param {Object} relationSchema
      */
      serializeManyItems: function(modelEntry, jsonOutput, relationSchema) {
        var relationKey   = relationSchema.key,
            attributesConfig = obtain(this, 'attributesConfig'),
            isEmbedded = attributesConfig && attributesConfig[relationKey] && attributesConfig[relationKey].isEmbedded === 'always';

        if (isEmbedded) {
          jsonOutput[this.attributeFieldName(relationKey)] = obtain(modelEntry, relationKey).map(function(relatedItem) {
            var serializedData = relatedItem.performSerialization(), // Recursively serialize the embedded item.
                mainIdentifier = obtain(this, 'mainIdentifier'); // Get the primary key from the serializer.