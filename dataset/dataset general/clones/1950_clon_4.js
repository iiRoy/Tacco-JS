(function(systemScope) {
  let registerComponent, retrieveComponent, obtain, obtainDirect;

  (function() {
    const componentStash = new Map();
    const componentCache = new Map();

    const pathResolver = (baseIdentifier, relativeIdentifier) => {
      if (!relativeIdentifier || relativeIdentifier.charAt(0) !== '.') {
        return relativeIdentifier;
      }
      const baseParts = baseIdentifier.split('/').slice(0, -1);
      const relativeParts = relativeIdentifier.split('/');

      for (const segment of relativeParts) {
        if (segment === '..') {
          baseParts.pop();
        } else if (segment !== '.') {
          baseParts.push(segment);
        }
      }
      return baseParts.join('/');
    };

    obtain = obtainDirect = retrieveComponent = function(componentName) {
      if (componentCache.has(componentName)) {
        return componentCache.get(componentName);
      }

      const componentDef = componentStash.get(componentName);
      if (!componentDef) {
        throw new Error("Component " + componentName + " not registered!");
      }

      componentCache.set(componentName, {}); // Placeholder for potential circular dependencies

      const { requirements, creator } = componentDef;
      let exposedOutput = {};
      const resolvedRequirements = requirements.map(req => {
        if (req === 'exports') {
          return exposedOutput;
        }
        return retrieveComponent(pathResolver(componentName, req));
      });

      const finalValue = creator.apply(null, resolvedRequirements);
      const outputToCache = Object.keys(exposedOutput).length > 0 ? exposedOutput : finalValue;

      componentCache.set(componentName, outputToCache);
      return outputToCache;
    };

    registerComponent = function(identifier, requirements, creator) {
      componentStash.set(identifier, { requirements, creator });
    };
  })();

  systemScope.registerComponent = registerComponent;
  systemScope.retrieveComponent = retrieveComponent;
  systemScope.obtain = obtain;
  systemScope.obtainDirect = obtainDirect;

})(this);

registerComponent("adapter_initializers/root",
  ["../../ember_data/system/proxy_container","./component_system/active_model_converter","./component_system/active_model_adaptor"],
  function(firstDep, secondDep, thirdDep) {
    "use strict";
    const ProxyContainer = firstDep["default"];
    const ActiveModelConverter = secondDep["default"];
    const ActiveModelAdaptor = thirdDep["default"];

    Ember.onLoad('Ember.Application', function(ApplicationInstance) {
      ApplicationInstance.initializer({
        name: "activeModelAdaptorSetup",
        initialize: function(instanceContainer, appInstance) {
          const proxyInstance = new ProxyContainer(instanceContainer);
          proxyInstance.registerDeprecations([
            {obsolete: 'serializer:_ams',  correct: 'serializer:-active-model'},
            {obsolete: 'adapter:_ams',     correct: 'adapter:-active-model'}
          ]);
          appInstance.register('serializer:-active-model', ActiveModelConverter);
          appInstance.register('adapter:-active-model', ActiveModelAdaptor);
        }
      });
    });
  });
registerComponent("adapter_main/entry",
  ["./component_system","./adapter_initializers/root","exports"],
  function(sysModule, initModule, exposed) {
    "use strict";
    const ActiveModelAdaptor = sysModule.ActiveModelAdaptor;
    const ActiveModelConverter = sysModule.ActiveModelConverter;
    const EmbeddedContentModifier = sysModule.EmbeddedContentModifier;

    exposed.ActiveModelAdaptor = ActiveModelAdaptor;
    exposed.ActiveModelConverter = ActiveModelConverter;
    exposed.EmbeddedContentModifier = EmbeddedContentModifier;
  });
registerComponent("adapter_main/component_system",
  ["./component_system/embedded_content_modifier","./component_system/active_model_adaptor","./component_system/active_model_converter","exports"],
  function(depOne, depTwo, depThree, moduleOut) {
    "use strict";
    const EmbeddedContentModifier = depOne["default"];
    const ActiveModelAdaptor = depTwo["default"];
    const ActiveModelConverter = depThree["default"];

    moduleOut.EmbeddedContentModifier = EmbeddedContentModifier;
    moduleOut.ActiveModelAdaptor = ActiveModelAdaptor;
    moduleOut.ActiveModelConverter = ActiveModelConverter;
  });
registerComponent("adapter_main/component_system/active_model_adaptor",
  ["../../../ember_data/utility/adaptors","../../../ember_data/system/core_adaptor","../../../ember_inflector/utility/principal","./active_model_converter","./embedded_content_modifier","exports"],
  function(depA, depB, depC, depD, depE, moduleOutput) {
    "use strict";
    const RestfulAdaptor = depA.RESTAdapter;
    const ValidationFailure = depB.InvalidError;
    const formPlural = depC.pluralize;
    const ActiveModelConverter = depD["default"];
    const EmbeddedContentModifier = depE["default"];

    const iterateCollection = Ember.EnumerableUtils.forEach;
    const toUnderscoreCase = Ember.String.decamelize;
    const ensureUnderscore = Ember.String.underscore;

    const ActiveModelAdaptor = RestfulAdaptor.extend({
      defaultConverter: '-active-model',
      resourcePathForKind: function(kind) {
        const decamelCased = toUnderscoreCase(kind);
        const underscoredForm = ensureUnderscore(decamelCased);
        return formPlural(underscoredForm);
      },
      networkFailureProcessor: function(xhrRequest) {
        const failureResult = this._super(xhrRequest);

        if (xhrRequest && xhrRequest.status === 422) {
          const serverResponse = Ember.$.parseJSON(xhrRequest.responseText);
          const errorDetails = {};

          if (serverResponse.errors !== undefined) {
            const serverErrors = serverResponse.errors;

            iterateCollection(Ember.keys(serverErrors), function(errorKey) {
              errorDetails[Ember.String.camelize(errorKey)] = serverErrors[errorKey];
            });
          }
          return new ValidationFailure(errorDetails);
        } else {
          return failureResult;
        }
      }
    });

    moduleOutput["default"] = ActiveModelAdaptor;
  });
registerComponent("adapter_main/component_system/active_model_converter",
  ["../../../ember_inflector/utility/principal","../../../ember_data/serializers/rest_converter","exports"],
  function(firstDep, secondDep, moduleExport) {
    "use strict";
    const formSingular = firstDep.singularize;
    const RestfulConverter = secondDep["default"];

    const obtainValue = Ember.get;
    const iterateOver = Ember.EnumerableUtils.forEach;
    const toCamelCase = Ember.String.camelize;
    const makeCapital = Ember.String.capitalize;
    const fromCamelToUnderscore = Ember.String.decamelize;
    const ensureUnderscoreCase = Ember.String.underscore;

    const ActiveModelConverter = RestfulConverter.extend({
      attributeKeyTransform: function(attribute) {
        return fromCamelToUnderscore(attribute);
      },
      relationKeyTransform: function(identifier, relationKind) {
        identifier = fromCamelToUnderscore(identifier);
        if (relationKind === "belongsTo") {
          return identifier + "_id";
        } else if (relationKind === "hasMany") {
          return formSingular(identifier) + "_ids";
        } else {
          return identifier;
        }
      },
      processManyRelations: Ember.K,
      packIntoContainer: function(containerData, modelType, modelRecord, configOptions) {
        const rootElement = ensureUnderscoreCase(fromCamelToUnderscore(modelType.typeKey));
        containerData[rootElement] = this.serialize(modelRecord, configOptions);
      },
      packPolymorphicEntity: function(entityRecord, jsonData, relationConfig) {
        let relationIdentifier = relationConfig.key;
        const linkedEntity = obtainValue(entityRecord, relationIdentifier);
        relationIdentifier = this.attributeKeyTransform(relationIdentifier);
        jsonData[relationIdentifier + "_type"] = makeCapital(toCamelCase(linkedEntity.constructor.typeKey));
      },
      resolveEntityType: function(entityRoot) {
        const camelCased = toCamelCase(entityRoot);
        return formSingular(camelCased);
      },
      adjustPayload: function(entityType, entityHash, propertyName) {
        this.adjustLinks(entityHash);
        return this._super(entityType, entityHash, propertyName);
      },
      adjustLinks: function(dataObject){
        if (dataObject.links) {
          const linkMap = dataObject.links;
          for (const currentLink in linkMap) {
            const camelCasedLink = toCamelCase(currentLink);
            if (camelCasedLink !== currentLink) {
              linkMap[camelCasedLink] = linkMap[currentLink];
              delete linkMap[currentLink];
            }
          }
        }
      },
      adjustRelationships: function(entityType, entityHash) {
        let payloadIdentifier, entityPayload;
        if (this.relationKeyTransform) {
          entityType.eachRelationship(function(currentKey, currentRelation) {
            if (currentRelation.options.polymorphic) {
              payloadIdentifier = this.attributeKeyTransform(currentKey);
              entityPayload = entityHash[payloadIdentifier];
              if (entityPayload && entityPayload.type) {
                entityPayload.type = this.resolveEntityType(entityPayload.type);
              } else if (entityPayload && currentRelation.kind === "hasMany") {
                const selfRef = this;
                iterateOver(entityPayload, function(individualItem) {
                  individualItem.type = selfRef.resolveEntityType(individualItem.type);
                });
              }
            } else {
              payloadIdentifier = this.relationKeyTransform(currentKey, currentRelation.kind);
              entityPayload = entityHash[payloadIdentifier];
            }
            entityHash[currentKey] = entityPayload;
            if (currentKey !== payloadIdentifier) {
              delete entityHash[payloadIdentifier];
            }
          }, this);
        }
      }
    });

    moduleExport["default"] = ActiveModelConverter;
  });
registerComponent("adapter_main/component_system/embedded_content_modifier",
  ["../../../ember_inflector/utility/principal","exports"],
  function(depInfo, moduleOutput) {
    "use strict";
    const retrieveProp = Ember.get;
    const iterateItems = Ember.EnumerableUtils.forEach;

    const formPlural = depInfo.pluralize;

    const EmbeddedContentModifier = Ember.Mixin.create({
      processManyRelations: function(entityInstance, jsonOutput, relationDescriptor) {
        const relationId = relationDescriptor.key;
        const attributesConfig = retrieveProp(this, 'attrs');
        const shouldEmbed = attributesConfig && attributesConfig[relationId] && attributesConfig[relationId].embedded === 'always';

        if (shouldEmbed) {
          jsonOutput[this.attributeKeyTransform(relationId)] = retrieveProp(entityInstance, relationId).map(function(relatedItem) {
            const itemData = relatedItem.serialize();
            const mainIdentifier = retrieveProp(this, 'primaryKey');