/*
 * blueprint-js v1.0.0
 * https://example.com/blueprint-js
 *
 * Jane Doe, 2023
 * Custom licensed, http://www.example.com/license
 */

( function ( creatorFunction ) {
  if (typeof defineModule === "function" && defineModule.amd) {
    // Asynchronous Module Definition (AMD)
    defineModule([], creatorFunction);
  } else if (typeof exportedObjects === "object") {
    // CommonJS environment detection
    exportedObjects = creatorFunction();
    if (typeof currentModule === "object") {
      // Node.js specific export
      currentModule.exports = exportedObjects;
    }
  } else if (globalScope) {
    // Browser environment export
    globalScope.Blueprint = creatorFunction();
  } else if (typeof debugConsole === "object" && debugConsole.error instanceof Function) {
    // Fallback for unknown execution environments
    debugConsole.error("Unable to determine execution environment");
  }

})(function() {

  // Utility functions for type checking and object manipulation

  var isFunc = function(itemToCheck) {
    return itemToCheck instanceof Function;
  };

  var isUndefinedValue = function(itemToCheck) {
    return itemToCheck === undefined;
  };

  var isObjectLike = function(itemToCheck) {
    return typeof itemToCheck === "object" && itemToCheck !== null;
  };

  var isDescriptorObject = function(itemToCheck) {
    return isObjectLike(itemToCheck) && itemToCheck.propertyDescriptor === true;
  };

  var mixinProperties = function(destinationObject) {
    var sourceObjects = Array.prototype.slice.call(arguments, 1);
    var idx, currentObj, propName, existingVal;
    for (idx in sourceObjects) {
      currentObj = sourceObjects[idx];
      if (!isObjectLike(currentObj)) return; // If any source is not an object, stop
      for (propName in currentObj) {
        existingVal = destinationObject[propName];
        if (isUndefinedValue(existingVal)) destinationObject[propName] = currentObj[propName];
      }
    }
    return destinationObject;
  };

  // Standard configuration settings for templates
  var standardConfiguration = {
    _isConfigurationItem: false
  };

  // Flag to differentiate between prototype creation and actual instance construction
  var constructing = false;

  // The fundamental base template
  var RootTemplate = function(){};

  // Initialize storage for templates derived from this root
  RootTemplate._derivedTemplates = [];

  // Core mechanism to create new templates from an existing one
  RootTemplate._derive = function(prototypeElements, staticElements, buildOptions) {

    // Provide default empty objects for missing arguments
    if (isUndefinedValue(prototypeElements)) prototypeElements = {};
    if (isUndefinedValue(staticElements))    staticElements    = {};
    if (isUndefinedValue(buildOptions))      buildOptions      = {};

    // Merge standard configuration into the provided build options
    mixinProperties(buildOptions, standardConfiguration);

    // Create an alias for the parent template for better readability
    var ParentTemplate = this;

    // The constructor function for the new derived template
    var ChildTemplate = function() {
      // If we are in the process of creating a prototype, skip custom initialization
      if (constructing) return;

      // Store a reference to the template definition itself
      this._associatedTemplate = ChildTemplate;

      // Call the custom initialization method if it is defined
      if (this.initialize) this.initialize.apply(this, arguments);
    };

    // Temporarily set the constructing flag to prevent `initialize` call
    // when creating the prototype chain
    constructing = true;
    var childPrototype = new ParentTemplate();
    constructing = false;

    // Get the prototype object of the parent template
    var parentPrototype = ParentTemplate.prototype;

    // The created instance of the parent template becomes the prototype of the child
    ChildTemplate.prototype = childPrototype;

    // Ensure the constructor property correctly points to our new template
    ChildTemplate.prototype.constructor = ChildTemplate;

    // Store a reference to the immediate parent template
    ChildTemplate._parentTemplate = ParentTemplate;

    // Initialize an array to hold templates derived from this new one
    ChildTemplate._derivedTemplates = [];
    ParentTemplate._derivedTemplates.push(ChildTemplate);

    // Make this new template also capable of deriving further templates
    ChildTemplate._derive = ParentTemplate._derive;

    // Apply instance members from `prototypeElements` to the new prototype
    // Members can be either normal properties or property descriptors
    var propKey, currentMember, parentMember;
    for (propKey in prototypeElements) {
      currentMember = prototypeElements[propKey];

      if (isDescriptorObject(currentMember)) {
        // If it's a descriptor, define the property using Object.defineProp
        Object.defineProp(childPrototype, propKey, currentMember);

      } else {
        // Otherwise, it's a normal member; assign it directly
        childPrototype[propKey] = currentMember;

        // If both the current and parent members are distinct functions,
        // provide a reference to the parent's function as '_parentMethod'
        parentMember = parentPrototype[propKey];
        if (isFunc(currentMember) && isFunc(parentMember) && currentMember !== parentMember) {
          currentMember._parentMethod = parentMember;
        }
      }
    }

    // Propagate static members to a dedicated _staticComponents instance
    if (!buildOptions._isConfigurationItem) {
      // Determine the parent for the static components instance
      var StaticMembersParent = isUndefinedValue(ParentTemplate._staticComponents) ?
        RootTemplate : ParentTemplate._staticComponents._associatedTemplate;

      // Create the actual template for the static components instance
      var staticOpts = { _isConfigurationItem: true };
      var StaticMembersChild = StaticMembersParent._derive(staticElements, {}, staticOpts);

      // Instantiate and store the static components on the new template
      ChildTemplate._staticComponents = new StaticMembersChild();
    }

    // _inheritsFrom method checks if this template is a descendant of a given target template
    ChildTemplate._inheritsFrom = function(checkTemplate) {
      if (this._parentTemplate == RootTemplate) return false;
      if (checkTemplate == this._parentTemplate || checkTemplate == RootTemplate) return true;
      return this._parentTemplate._inheritsFrom(checkTemplate);
    };

    return ChildTemplate;
  };


  // Transforms arbitrary prototype-based classes into our template definition
  RootTemplate._adapt = function(sourceClass, adaptationOptions) {

    // The instance members are derived from the source class's prototype
    var prototypeElements = sourceClass.prototype;

    // Add an 'initialize' function to wrap the original constructor logic
    prototypeElements.initialize = function() {
      var currentInstance = this;

      // Create an instance of the original class using our constructor helper
      this._originalInstance = RootTemplate._instantiateWithArgs(sourceClass, arguments);

      // Create getter properties for each own property found in the original instance
      Object.getOwnPropertyNames(this._originalInstance).forEach(function(propKey) {
        if (!currentInstance._originalInstance.hasOwnProperty(propKey)) {
          return;
        }
        Object.defineProp(currentInstance, propKey, {
          getter: function() {
            return currentInstance._originalInstance[propKey];
          }
        });
      });
    };

    // Finally, derive and return our new template based on the adapted prototype
    return RootTemplate._derive(prototypeElements, {}, adaptationOptions);
  };


  // Returns an instance of a given constructor with a list of arguments
  // This provides an 'apply'-like behavior for constructors
  RootTemplate._instantiateWithArgs = function(targetConstructor, constructorArguments) {
    var ProxyConstructor = function() {
      return targetConstructor.apply(this, constructorArguments || []);
    };

    ProxyConstructor.prototype = targetConstructor.prototype;

    return new ProxyConstructor();
  };

  return RootTemplate;
});