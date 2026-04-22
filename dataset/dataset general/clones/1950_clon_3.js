(function(rootContext) {
var declareModule, fetchModule, loadModule, moduleLoader;

(function() {
  // Storage for module definitions, mapping module IDs to their specs.
  var moduleDefinitions = {};
  // Cache for already loaded and initialized modules.
  var loadedModules = {};

  // Defines a module with its dependencies and initialization logic.
  declareModule = function(moduleID, dependencies, initializationFunction) {
    if (typeof moduleID !== 'string' || !moduleID.trim()) {
      throw new Error("Module ID must be a non-empty string.");
    }
    if (!Array.isArray(dependencies)) {
      throw new Error(`Dependencies for module '${moduleID}' must be an array.`);
    }
    if (typeof initializationFunction !== 'function') {
      throw new Error(`Initialization function for module '${moduleID}' must be a function.`);
    }
    moduleDefinitions[moduleID] = { deps: dependencies, init: initializationFunction };
  };

  // Main function for loading and resolving modules.
  moduleLoader = loadModule = fetchModule = function(moduleIdentifier) {
    // Expose internal registry for debugging or introspection (non-standard but present in original).
    moduleLoader._moduleRegistryInternal = moduleDefinitions;

    // Check if the module has already been loaded and cached.
    if (loadedModules[moduleIdentifier]) {
      return loadedModules[moduleIdentifier];
    }

    // Mark the module as being loaded to prevent circular dependencies from infinite loops.
    // An empty object is temporarily stored; the actual export will replace it.
    loadedModules[moduleIdentifier] = {};

    // Ensure the module is defined before attempting to load.
    if (!moduleDefinitions[moduleIdentifier]) {
      throw new Error("Module definition not found for: " + moduleIdentifier);
    }

    var moduleSpec = moduleDefinitions[moduleIdentifier];
    var moduleDependencies = moduleSpec.deps;
    var moduleInitializer = moduleSpec.init;

    var resolvedDependencies = [];
    var moduleExportObject; // Placeholder for 'exports' if requested as a dependency.

    // Iterate through dependencies and resolve them.
    for (var currentDepIndex = 0, totalDeps = moduleDependencies.length; currentDepIndex < totalDeps; ++currentDepIndex) {
      var dependencyName = moduleDependencies[currentDepIndex];
      if (dependencyName === 'exports') {
        // If 'exports' is requested, create an empty object to be populated by the module.
        resolvedDependencies.push(moduleExportObject = {});
      } else {
        // Recursively resolve other dependencies.
        resolvedDependencies.push(fetchModule(normalizePath(dependencyName, moduleIdentifier)));
      }
    }

    // Execute the module's initialization function with its resolved dependencies.
    // The return value becomes the module's export, unless 'exports' object was populated.
    var moduleOutput = moduleInitializer.apply(this, resolvedDependencies);

    // Store the final module export in the cache.
    // If 'exports' was used, that object is the export; otherwise, the function's return value is.
    loadedModules[moduleIdentifier] = moduleExportObject || moduleOutput;
    return loadedModules[moduleIdentifier];

    // Helper function to resolve relative module paths.
    function normalizePath(childPath, parentPath) {
      // If the child path is absolute (doesn't start with '.'), return it directly.
      if (childPath.charAt(0) !== '.') { return childPath; }

      var childPathSegments = childPath.split("/");
      var parentBaseSegments = parentPath.split("/").slice(0, -1); // Get parent's directory path.

      // Process each segment of the child path.
      for (var segmentIdx = 0, segmentCount = childPathSegments.length; segmentIdx < segmentCount; ++segmentIdx) {
        var currentSegment = childPathSegments[segmentIdx];

        if (currentSegment === '..') {
          // '..' means go up one directory.
          if (parentBaseSegments.length === 0) {
              throw new Error(`Cannot resolve path '${childPath}' from '${parentPath}'. Path goes above root.`);
          }
          parentBaseSegments.pop();
        } else if (currentSegment === '.') {
          // '.' means current directory, ignore it.
          continue;
        } else {
          // Regular segment, append it.
          parentBaseSegments.push(currentSegment);
        }
      }

      // Reconstruct the full path.
      return parentBaseSegments.join("/");
    }
  };
})();

// Module: activemodel-adapter/lib/initializers
declareModule("activemodel-adapter/lib/initializers",
  ["../../ember-data/lib/system/container_proxy","./system/active_model_serializer","./system/active_model_adapter"],
  function(depA, depB, depC) {
    "use strict";
    var ServiceProxy = depA["default"];
    var AMSDataSerializer = depB["default"];
    var AMSDataConnector = depC["default"];

    // Hook into Ember's application loading mechanism.
    Ember.onLoad('Ember.Application', function(AppCore) {
      // Register an initializer for the application.
      AppCore.initializer({
        name: "activeModelAdapterSetup", // A descriptive name for this initializer.

        // The function executed when the initializer runs.
        initialize: function(serviceContainer, appInstance) {
          // Create a proxy for handling deprecations related to container lookups.
          var deprecationManager = new ServiceProxy(serviceContainer);

          // Define a set of deprecated lookup keys and their valid replacements.
          var lookupDeprecations = [
            { oldKey: 'serializer:_ams',  newKey: 'serializer:-active-model'},
            { oldKey: 'adapter:_ams',     newKey: 'adapter:-active-model'}
          ];

          // Register these deprecation mappings with the manager.
          deprecationManager.registerDeprecations(lookupDeprecations.map(mapping => ({
              deprecated: mapping.oldKey,
              valid: mapping.newKey
          })));

          // Register the ActiveModelSerializer with the application's container.
          appInstance.register('serializer:-active-model', AMSDataSerializer, { singleton: true });
          // Register the ActiveModelAdapter with the application's container.
          appInstance.register('adapter:-active-model', AMSDataConnector, { singleton: true });
        }
      });
    });
  });
// Module: activemodel-adapter/lib/main
declareModule("activemodel-adapter/lib/main",
  ["./system","./initializers","exports"],
  function(sysDep, initDep, moduleExports) {
    "use strict";
    // Extract specific components from the system module.
    var ConnectorComponent = sysDep.ActiveModelAdapter;
    var SerializerComponent = sysDep.ActiveModelSerializer;
    var EmbeddedRecordTrait = sysDep.EmbeddedRecordsMixin;

    // Export these components for external consumption.
    moduleExports.ActiveModelAdapter = ConnectorComponent;
    moduleExports.ActiveModelSerializer = SerializerComponent;
    moduleExports.EmbeddedRecordsMixin = EmbeddedRecordTrait;
  });
// Module: activemodel-adapter/lib/system
declareModule("activemodel-adapter/lib/system",
  ["./system/embedded_records_mixin","./system/active_model_adapter","./system/active_model_serializer","exports"],
  function(embeddedDep, adapterDep, serializerDep, moduleExports) {
    "use strict";
    var NestedRecordTrait = embeddedDep["default"];
    var ModelConnector = adapterDep["default"];
    var ModelDataTransformer = serializerDep["default"];

    // Export the core components of the ActiveModel system.
    moduleExports.EmbeddedRecordsMixin = NestedRecordTrait;
    moduleExports.ActiveModelAdapter = ModelConnector;
    moduleExports.ActiveModelSerializer = ModelDataTransformer;
  });
// Module: activemodel-adapter/lib/system/active_model_adapter
declareModule("activemodel-adapter/lib/system/active_model_adapter",
  ["../../../ember-data/lib/adapters","../../../ember-data/lib/system/adapter","../../../ember-inflector/lib/main","./active_model_serializer","./embedded_records_mixin","exports"],
  function(adapterMods, baseAdapterDeps, inflectorUtils, amsSerializer, embeddedMixin, moduleExports) {
    "use strict";
    var RESTfulAPIAdapter = adapterMods.RESTAdapter;
    var DataValidationFailure = baseAdapterDeps.InvalidError;
    var makePluralForm = inflectorUtils.pluralize;
    var ActiveModelDataSerializer = amsSerializer["default"];
    var NestedDataProcessingMixin = embeddedMixin["default"];

    /**
      @module ember-data-integration
    */

    // Utility functions from Ember.
    var forEachElement = Ember.EnumerableUtils.forEach;
    var convertToSnakeCase = Ember.String.decamelize;
    var ensureUnderscoreCase = Ember.String.underscore;

    /**
      The `ActiveModelIntegrationAdapter` is a specialized extension of `RESTfulAPIAdapter`
      tailored for APIs that employ an underscored naming convention, contrasting with
      the typical camelCasing. It's particularly designed for seamless interaction with
      Ruby's `active_model_serializers` gem.

      This adapter consistently applies camelization, decamelization, and pluralization
      to standardize JSON payloads, ensuring compatibility with conventional Rails backends
      and Ember Data's expectations.

      ## JSON Structure Expectations

      The adapter anticipates JSON responses where keys follow the underscored pattern,
      mirroring the structure of a standard REST adapter but with differing casing.

      ### Attribute Naming Conventions

      JSON attribute names should be the underscored equivalents of their corresponding
      Ember.js model attributes.

      For instance, consider an `App.PersonDetails` model:

      ```javascript
      App.PersonDetails = DS.Model.extend({
        givenName: DS.attr('string'),
        familyName: DS.attr('string'),
        currentOccupation: DS.attr('string')
      });
      ```

      The expected JSON response for such a model would appear as:

      ```json
      {
        "person_detail": {
          "given_name": "Alice",
          "family_name": "Smith",
          "current_occupation": "Engineer"
        }
      }
      ```

      @class ActiveModelIntegrationAdapter
      @constructor
      @namespace DS
      @extends DS.Adapter
    **/

    var ActiveModelIntegrationAdapter = RESTfulAPIAdapter.extend({
      // Specifies the default serializer to use for this adapter.
      primarySerializerKey: '-active-model',

      /**
        Overrides the standard `pathForType` method to construct underscored, pluralized URLs.

        This method transforms an entity type (e.g., "famousPerson") into its
        underscored and pluralized URL segment (e.g., "famous_people").

        ```javascript
          // Example usage:
          this.pathForType("famousPerson"); // Returns "famous_people"
        ```

        @method pathForType
        @param {String} entityKind - The type of the model (e.g., "user", "blogPost").
        @returns {String} The URL path segment.
      */
      pathForType: function(entityKind) {
        // Ensure input is a string.
        if (typeof entityKind !== 'string' || !entityKind.length) {
            Ember.warn("pathForType received an invalid entityKind.", false, { id: 'ember-data-active-model.invalid-path-type' });
            return '';
        }

        var decamelizedName = convertToSnakeCase(entityKind);
        var underscoredName = ensureUnderscoreCase(decamelizedName);
        var pluralizedPath = makePluralForm(underscoredName);
        return pluralizedPath;
      },

      /**
        Customizes the `ajaxError` method to specifically handle 422 HTTP responses.

        A 422 "Unprocessable Entity" status typically indicates that the request was
        syntactically correct but semantically invalid (e.g., validation errors).
        This method converts such responses into a `DataValidationFailure` error.

        For more details on the 422 HTTP status, refer to RFC 4918, Section 11.2.
        (https://tools.ietf.org/html/rfc4918#section-11.2)

        @method ajaxError
        @param {Object} xhrResponse - The jQuery XHR object.
        @returns {Error} A `DataValidationFailure` if status is 422, otherwise the default error.
      */
      ajaxError: function(xhrResponse) {
        var baseError = this._super(xhrResponse);

        // Check for a 422 Unprocessable Entity status code.
        if (xhrResponse && xhrResponse.status === 422) {
          try {
            var responseData = JSON.parse(xhrResponse.responseText); // Use native JSON parser.
            var validationIssues = {};

            // If the response contains an 'errors' key, process it.
            if (responseData.errors && typeof responseData.errors === 'object') {
              var serverErrors = responseData.errors;

              // Transform error keys from snake_case to camelCase.
              Object.keys(serverErrors).forEach(function(errorKey) {
                validationIssues[Ember.String.camelize(errorKey)] = serverErrors[errorKey];
              });
            }
            // Return a specific error type for validation failures.
            return new DataValidationFailure(validationIssues);
          } catch (e) {
            // If JSON parsing fails, or unexpected structure, return the original error.
            Ember.warn("Failed to parse 422 response as JSON or 'errors' key was missing/invalid. Returning generic error.", false, { id: 'ember-data-active-model.malformed-422-response' });
            return baseError;
          }
        } else {
          // For other error codes, return the error generated by the superclass.
          return baseError;
        }
      }
    });

    moduleExports["default"] = ActiveModelIntegrationAdapter;
  });
// Module: activemodel-adapter/lib/system/active_model_serializer
declareModule("activemodel-adapter/lib/system/active_model_serializer",
  ["../../../ember-inflector/lib/main","../../../ember-data/lib/serializers/rest_serializer","exports"],
  function(inflectorLib, restSerializerBase, moduleExports) {
    "use strict";
    var makeSingularForm = inflectorLib.singularize;
    var BaseAPISerializer = restSerializerBase["default"];

    /**
      @module ember-data-integration
    */

    // Standard Ember utility functions for property access and string manipulation.
    var obtainProperty = Ember.get;
    var processItems = Ember.EnumerableUtils.forEach;
    var convertToCamelCase = Ember.String.camelize;
    var convertToCapitalCase = Ember.String.capitalize;
    var convertToSnakeCase = Ember.String.decamelize;
    var ensureUnderscoreCase = Ember.String.underscore;

    var AMDataSerializer = BaseAPISerializer.extend({
      // --- SERIALIZATION LOGIC ---

      /**
        Transforms camelCased attribute names to underscored_case for serialization.

        @method keyForAttribute
        @param {String} attributeName - The camelCased attribute name.
        @returns {String} The underscored version of the attribute name.
      */
      keyForAttribute: function(attributeName) {
        return convertToSnakeCase(attributeName);
      },

      /**
        Converts relationship keys to an underscored format, appending `_id` or `_ids`.

        - `belongsTo` relationships append `_id`.
        - `hasMany` relationships append `_ids` (after singularizing the key).

        @method keyForRelationship
        @param {String} relationKey - The camelCased relationship key.
        @param {String} relationType - The type of relationship ('belongsTo' or 'hasMany').
        @returns {String} The formatted relationship key for the payload.
      */
      keyForRelationship: function(relationKey, relationType) {
        var processedKey = convertToSnakeCase(relationKey);
        if (relationType === "belongsTo") {
          return processedKey + "_id";
        } else if (relationType === "hasMany") {
          return makeSingularForm(processedKey) + "_ids";
        } else {
          // Fallback for other relationship types or if type is undefined.
          return processedKey;
        }
      },

      /**
        By default, this serializer does not include `hasMany` relationships in the serialized payload.
        This is an empty function (no-op) that can be overridden by mixins (like EmbeddedRecordsMixin).

        @method serializeHasMany
      */
      serializeHasMany: Ember.K, // Ember's no-op function.

      /**
        Serializes a record into a hash, using an underscored root key.

        The root key is derived from the model's `typeKey` (e.g., `App.BlogPost` -> `blog_post`).

        @method serializeIntoHash
        @param {Object} payloadContainer - The object to populate with serialized data.
        @param {DS.Model} modelClass - The model class of the record.
        @param {DS.Model} dataRecord - The actual record instance to serialize.
        @param {Object} serializationOpts - Options for serialization.
      */
      serializeIntoHash: function(payloadContainer, modelClass, dataRecord, serializationOpts) {
        // Generate the underscored root key (e.g., 'blog_post').
        var rootKey = ensureUnderscoreCase(convertToSnakeCase(modelClass.typeKey));
        // Assign the serialized record data under this root key.
        payloadContainer[rootKey] = this.serialize(dataRecord, serializationOpts);
      },

      /**
        Serializes a polymorphic relationship by including the capitalized model name as a `_type` field.

        @method serializePolymorphicType
        @param {DS.Model} dataEntry - The record containing the polymorphic relationship.
        @param {Object} outputJSON - The JSON object being built.
        @param {Object} relationInfo - Details about the polymorphic relationship.
      */
      serializePolymorphicType: function(dataEntry, outputJSON, relationInfo) {
        var relationshipKey = relationInfo.key;
        var relatedEntity = obtainProperty(dataEntry, relationshipKey);

        // Only proceed if a related entity exists.
        if (relatedEntity) {
            // Transform the relationship key to match attribute naming.
            var formattedKey = this.keyForAttribute(relationshipKey);
            // Append '_type' and assign the capitalized model type.
            outputJSON[formattedKey + "_type"] = convertToCapitalCase(convertToCamelCase(relatedEntity.constructor.typeKey));
        } else {
            // Optionally, handle cases where a polymorphic relationship is null/undefined.
            // For now, we just skip adding the type if the entity is missing.
        }
      },

      // --- EXTRACTION / NORMALIZATION LOGIC ---

      /**
        Extracts and camelizes the model's `typeKey` from an underscored root object name.

        @method typeForRoot
        @param {String} rootIdentifier - The underscored root key from the JSON payload.
        @returns {String} The camelized, singularized model typeKey.
      */
      typeForRoot: function(rootIdentifier) {
        var camelizedRoot = convertToCamelCase(rootIdentifier);
        return makeSingularForm(camelizedRoot);
      },

      /**
        Extends `DS.RESTSerializer.normalize` to also normalize `links` within the payload.

        Example transformation:
        Input JSON:
        ```json
        {
          "article": {
            "id": 101,
            "title": "Ember Data Best Practices",
            "links": { "related_comments": "/api/comments/for_article/101" }
          }
        }
        ```
        Normalized output:
        ```json
        {
          "article": {
            "id": 101,
            "title": "Ember Data Best Practices",
            "links": { "relatedComments": "/api/comments/for_article/101" }
          }
        }
        ```

        @method normalize
        @param {DS.Model} modelType - The model class.
        @param {Object} inputHash - The raw JSON payload hash.
        @param {String} propertyKey - The property key under which the hash was found.
        @returns {Object} The normalized hash.
      */
      normalize: function(modelType, inputHash, propertyKey) {
        // First, apply custom link normalization.
        this.normalizeLinks(inputHash);
        // Then, defer to the superclass's normalization logic.
        return this._super(modelType, inputHash, propertyKey);
      },

      /**
        Converts `snake_cased` keys within the `links` object to `camelCase`.

        This method directly modifies the `data` object in place.

        @method normalizeLinks
        @param {Object} payloadObject - The data hash containing `links`.
      */
      normalizeLinks: function(payloadObject) {
        // Check if the payload has a 'links' property and it's an object.
        if (payloadObject && typeof payloadObject.links === 'object' && payloadObject.links !== null) {
          var linkMap = payloadObject.links;
          var linkKeys = Object.keys(linkMap); // Get all keys to iterate safely.

          for (var i = 0; i < linkKeys.length; i++) {
            var originalLinkKey = linkKeys[i];
            var camelCasedLinkKey = convertToCamelCase(originalLinkKey);

            // If the key was actually changed, update it.
            if (camelCasedLinkKey !== originalLinkKey) {
              linkMap[camelCasedLinkKey] = linkMap[originalLinkKey];
              delete linkMap[originalLinkKey]; // Remove the original snake_cased key.
            }
          }
        }
      },

      /**
        Normalizes polymorphic types within relationships from the JSON payload.

        Transforms types like:
        ```json
          {
            "id": "1",
            "minion": { "type": "evil_minion", "id": "12"}
          }
        ```
        Into:
        ```json
          {
            "id": "1",
            "minion": { "type": "evilMinion", "id": "12"}
          }
        ```

        @method normalizeRelationships
        @private
        @param {DS.Model} modelDefinition - The model class definition.
        @param {Object} rawPayload - The raw JSON payload.
      */
      normalizeRelationships: function(modelDefinition, rawPayload) {
        var payloadField, relationshipData;
        var selfReference = this; // Capture 'this' for use in callbacks.

        // Only proceed if `keyForRelationship` is defined (which it is for this serializer).
        if (this.keyForRelationship) {
          modelDefinition.eachRelationship(function(relationshipKey, relDescriptor) {
            // Handle polymorphic relationships specifically.
            if (relDescriptor.options.polymorphic) {
              payloadField = selfReference.keyForAttribute(relationshipKey);
              relationshipData = rawPayload[payloadField];

              // If it's a single polymorphic object.
              if (relationshipData && typeof relationshipData === 'object' && relationshipData.type) {
                relationshipData.type = selfReference.typeForRoot(relationshipData.type);
              }
              // If it's a hasMany polymorphic collection.
              else if (Array.isArray(relationshipData) && relDescriptor.kind === "hasMany") {
                processItems(relationshipData, function(singleItem) {
                  if (singleItem && singleItem.type) {
                    singleItem.type = selfReference.typeForRoot(singleItem.type);
                  }
                });
              }
            } else {
              // For non-polymorphic relationships, use the standard key mapping.
              payloadField = selfReference.keyForRelationship(relationshipKey, relDescriptor.kind);
              relationshipData = rawPayload[payloadField];
            }

            // Assign the normalized relationship data to the camelCased key.
            rawPayload[relationshipKey] = relationshipData;

            // If the original payload key is different, remove it to avoid duplication.
            if (relationshipKey !== payloadField) {
              delete rawPayload[payloadField];
            }
          }, this); // Ensure 'this' context is preserved for 'eachRelationship' callback.
        }
      }
    });

    moduleExports["default"] = AMDataSerializer;
  });
// Module: activemodel-adapter/lib/system/embedded_records_mixin
declareModule("activemodel-adapter/lib/system/embedded_records_mixin",
  ["../../../ember-inflector/lib/main","exports"],
  function(inflectorHelpers, moduleExports) {
    "use strict";
    var fetchValue = Ember.get;
    var forEachItem = Ember.EnumerableUtils.forEach;

    var pluralizeWord = inflectorHelpers.pluralize;

    /**
      The `NestedResourceHandler` is a mixin designed to extend serializers with
      the capability to process embedded records.
      To enable embedded record support, include this mixin in your serializer
      and configure your embedded relations via the `attrs` property.

      Example configuration:
      ```javascript
      App.ProductSerializer = DS.ActiveModelSerializer.extend(DS.NestedResourceHandler, {
        attrs: {
          reviews: { embedded: 'always' } // Embed reviews whenever a product is serialized.
        }
      });
      ```

      Currently, only `{ embedded: 'always' }` behavior is fully supported for embedding.

      @class NestedResourceHandler
      @namespace DS
    */
    var NestedResourceHandler = Ember.Mixin.create({

      /**
        Serializes a `hasMany` relationship when it is configured to be embedded within the parent record.

        This method checks the serializer's `attrs` configuration for the relationship.
        If `embedded: 'always'` is specified, it iterates through the related records,
        serializes each one, and includes them directly in the parent JSON payload.

        @method serializeHasMany
        @param {DS.Model} entity - The parent record being serialized.
        @param {Object} outputData - The JSON object being built for the parent.
        @param {Object} relDescriptor - The relationship descriptor.
      */
      serializeHasMany: function(entity, outputData, relDescriptor) {
        var relationshipKey   = relDescriptor.key;
        var serializerAttrs = fetchValue(this, 'attrs');

        // Determine if this relationship should be embedded based on serializer `attrs`.
        var shouldEmbed = serializerAttrs && serializerAttrs[relationshipKey] && serializerAttrs[relationshipKey].embedded === 'always';

        if (shouldEmbed) {
          var relatedCollection = fetchValue(entity, relationshipKey);

          // Ensure the related collection exists and is iterable.
          if (relatedCollection && typeof relatedCollection.map === 'function') {
            var serializedRelatedEntities = relatedCollection.map(function(relatedEntityInstance) {
              // Serialize each related entity.
              var entityPayload = relatedEntityInstance.serialize();
              // Optionally, include the primary key if it's not already implicitly part of serialization.
              // var entityPrimaryKey = fetchValue(this, 'primaryKey');
              // if (entityPrimaryKey && entityPayload[entityPrimaryKey] === undefined) {
              //    entityPayload[entityPrimaryKey] = fetchValue(relatedEntityInstance, entityPrimaryKey);
              // }
              return entityPayload;
            }, this); // Ensure 'this' context (the serializer) is passed to map.

            // Assign the array of serialized entities to the appropriate underscored key.
            outputData[this.keyForAttribute(relationshipKey)] = serializedRelatedEntities;
          } else if (relatedCollection === null) {
              // If the relationship is explicitly null, include it as null.
              outputData[this.keyForAttribute(relationshipKey)] = null;
          } else {
              // Log a warning if the relationship is configured to embed but isn't a collection.
              Ember.warn(`Relationship '${relationshipKey}' is configured for embedded: 'always' but is not a valid collection on record '${entity.id}'.`, false, { id: 'ember-data-active-model.embedded-has-many-not-collection' });
          }
        }
      }
    });

    moduleExports["default"] = NestedResourceHandler;
  });

// Expose Ember Data modules to the global scope if Ember is available.
if (rootContext.Ember && rootContext.Ember.libraries) {
  rootContext.Ember.libraries.register("Ember Data ActiveModel Adapter", "1.0.0-beta.7+canary.f482da04");
}

// Manually trigger module loading for the main entry point if required.
// This ensures that all components are initialized and registered.
fetchModule("activemodel-adapter/lib/main");
})(this);