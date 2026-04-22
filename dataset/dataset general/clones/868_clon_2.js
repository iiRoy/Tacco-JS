(function(runtimeEnv) {
  // Ensure the runtime environment is properly initialized.
  runtimeEnv = runtimeEnv || {};

  // Verify that Shadow DOM capabilities are present in the browser.
  if (!window.ShadowDOMRoot) {
    console.error('Shadow DOM functionality is a prerequisite.');
    return;
  }

  // A utility function to iterate over array-like objects.
  var iterateOver = Array.prototype.forEach.call.bind(Array.prototype.forEach);

  /**
   * Represents the core metadata for a custom HTML element.
   * @param {string} componentId - The unique name of the custom element.
   * @param {string} baseElementName - The tag name of the element it extends.
   * @param {object} associatedBlueprint - The blueprint object managing this component.
   */
  runtimeEnv.ComponentDefinition = function(componentId, baseElementName, associatedBlueprint) {
    this.componentId = componentId;
    this.baseElementName = baseElementName;
    // Bind lifecycle methods to the blueprint instance for correct context.
    this.lifeCycleHooks = this.lifeCycleHooks.bind(associatedBlueprint);
  };

  runtimeEnv.ComponentDefinition.prototype = {
    // Inherit from the standard HTMLElement prototype.
    __proto__: HTMLElement.prototype,

    /**
     * Configures the lifecycle callbacks for the component.
     * @param {object} hookMap - An object containing user-defined lifecycle methods.
     */
    lifeCycleHooks: function(hookMap) {
      this.onCreation = hookMap.created || v0id;
      this.onInsertion = hookMap.inserted || v0id;
      this.onAttributeChange = hookMap.attributeChanged || v0id;

      // Note: Future implementation might include a removal hook.
      //this.onRemoval = hookMap.removed || v0id;
    }
  };


  /**
   * Manages the registration and configuration of a custom component.
   * @param {string} identifier - The component's unique identifier.
   * @param {string} baseTag - The HTML tag this component extends.
   */
  runtimeEnv.ComponentRegistration = function(identifier, baseTag) {
    this.prototypeBase = Object.create(this.retrievePrototypeForTag(baseTag));
    this.componentInfo = new runtimeEnv.ComponentDefinition(identifier, baseTag, this);
    this.componentInfo.dynamicConstructor = this.produceConstructor();
    // Ensure the transformation method always runs with the correct 'this' context.
    this.transformElement = this.transformElement.bind(this);
  };

  runtimeEnv.ComponentRegistration.prototype = {

    /**
     * Generates a constructor function for the custom element.
     * This constructor will properly set up the prototype chain and call the created callback.
     * @returns {function} A constructor for the custom element.
     */
    produceConstructor: function() {
      var baseTagId = this.componentInfo.baseElementName;
      var creationCallback = this.onCreation; // Access the lifecycle hook.
      var derivedClass = function() {
        var newElement = document.createElement(baseTagId);
        // Establish the prototype chain correctly for custom elements.
        derivedClass.prototype.__proto__ = newElement.__proto__;
        newElement.__proto__ = derivedClass.prototype;
        // Invoke the custom element's creation lifecycle method.
        creationCallback.call(newElement);
      };
      derivedClass.prototype = this.prototypeBase;
      return derivedClass;
    },

    /**
     * Executes a script block associated with the component.
     * @param {HTMLElement} scriptNode - The script element to evaluate.
     */
    executeScriptBlock: function(scriptNode) {
      // TODO: Consider adding support for external JavaScript loading in the future.
      Function(scriptNode.textContent).call(this.componentInfo);
    },

    /**
     * Assigns a template to this component registration.
     * @param {HTMLTemplateElement} templateContent - The template element.
     */
    assignTemplate: function(templateContent) {
      this.componentTemplate = templateContent;
    },

    /**
     * Applies the custom element's behavior and template to a given DOM element.
     * @param {HTMLElement} targetElement - The DOM element to transform into a custom component.
     */
    transformElement: function(targetElement) {
      // WARNING: Modifying __proto__ directly on each morph operation might have performance implications.
      // This approach is for demonstration/polyfill purposes.
      this.componentInfo.dynamicConstructor.prototype.__proto__ = document.createElement(this.componentInfo.baseElementName);
      targetElement.__proto__ = this.componentInfo.dynamicConstructor.prototype;

      var shadowTree = this.buildShadowRoot(targetElement);

      // Trigger lifecycle events for creation and insertion.
      this.onCreation && this.onCreation.call(targetElement, shadowTree);
      this.onInsertion && this.onInsertion.call(targetElement, shadowTree);

      // Set up an observer to detect attribute changes if an attributeChanged callback is defined.
      if (this.onAttributeChange) {
        var mutationMonitor = new window.DOMChangeObserver(function(changeRecords) {
          changeRecords.forEach(function(record) {
            this.onAttributeChange(record.attributeName, record.oldValue,
              record.target.getAttribute(record.attributeName));
          }.bind(this));
        }.bind(this));

        // TOOD: The specification is not entirely clear on whether observer should track
        // only custom attributes or any attribute changes within the shadow DOM subtree.
        mutationMonitor.observe(shadowTree.host, {
          attributes: true,
          attributeOldValue: true
        });
      }
    },

    /**
     * Creates and attaches a shadow root to the host element, populating it with template content.
     * @param {HTMLElement} hostElement - The element to attach the shadow root to.
     * @returns {ShadowRoot|undefined} The created shadow root, or undefined if no template.
     */
    buildShadowRoot: function(hostElement) {
      if (!this.componentTemplate) {
        return undefined;
      }

      var newShadowRoot = new window.ShadowDOMRoot(hostElement);
      newShadowRoot.host = hostElement;
      iterateOver(this.componentTemplate.childNodes, function(childNode) {
        newShadowRoot.appendChild(childNode.cloneNode(true));
      });

      return newShadowRoot;
    },

    /**
     * Retrieves the prototype chain for a given HTML tag name.
     * @param {string} tagIdentifier - The HTML tag name (e.g., 'div', 'span').
     * @returns {object} The prototype object for the specified tag.
     */
    retrievePrototypeForTag: function(tagIdentifier) {
      return Object.getPrototypeOf(document.createElement(tagIdentifier));
    }
  };


  /**
   * Factory for creating ComponentRegistration instances based on declarative markup.
   */
  runtimeEnv.ComponentFactory = function() {
    // Ensure the creation method maintains the correct 'this' context.
    this.buildComponentRegistration = this.buildComponentRegistration.bind(this);
  };

  runtimeEnv.ComponentFactory.prototype = {
    // Callback invoked after each component registration is successfully created.
    onRegistrationComplete: null,

    /**
     * Creates a ComponentRegistration from a declarative <element> node.
     * @param {HTMLElement} configElement - The <element> DOM node containing configuration.
     */
    buildComponentRegistration: function(configElement) {
      var componentName = configElement.getAttribute('name');
      if (!componentName) {
        // IMPROVEMENT: Provide more user-friendly error messages.
        console.error('The "name" attribute is mandatory for component definitions.');
        return;
      }
      var extendsTag = configElement.getAttribute('extends');
      if (!extendsTag) {
        // IMPROVEMENT: Allow components without an explicit 'extends' attribute (e.g., custom built-ins).
        // IMPROVEMENT: Improve error clarity.
        console.error('The "extends" attribute is mandatory for component definitions.');
        return;
      }
      var ctorName = configElement.getAttribute('constructor');
      var regInstance = new runtimeEnv.ComponentRegistration(componentName, extendsTag, ctorName);
      if (ctorName) {
        window[ctorName] = regInstance.componentInfo.dynamicConstructor;
      }

      // Evaluate any embedded script blocks within the component definition.
      iterateOver(configElement.querySelectorAll('script'), regInstance.executeScriptBlock,
        regInstance);
      var templateNode = configElement.querySelector('template');
      templateNode && regInstance.assignTemplate(templateNode);
      this.onRegistrationComplete && this.onRegistrationComplete(regInstance);
    }
  };


  /**
   * Parses HTML markup to find and process custom component definitions.
   */
  runtimeEnv.DefinitionParser = function() {
    this.processMarkup = this.processMarkup.bind(this);
  };

  runtimeEnv.DefinitionParser.prototype = {
    // Callback executed for each <element> definition found during parsing.
    onElementParsed: null,

    /**
     * Parses a string of HTML markup to extract component definitions.
     * @param {string} markupString - The HTML string to parse.
     */
    processMarkup: function(markupString) {
      var tempDocument = document.implementation.createHTMLDocument('');
      tempDocument.body.innerHTML = markupString;
      iterateOver(tempDocument.querySelectorAll('element'), function(parsedElement) {
        this.onElementParsed && this.onElementParsed(parsedElement);
      }, this);
    }
  };


  /**
   * Handles loading external component resources (e.g., HTML imports).
   */
  runtimeEnv.ResourceLoader = function() {
    this.initiateLoading = this.initiateLoading.bind(this);
  };

  runtimeEnv.ResourceLoader.prototype = {
    // Callback for when a resource is successfully loaded.
    onResourceLoaded: null,
    // Callback for when a resource loading fails.
    onResourceError: null,

    /**
     * Starts the loading process by scanning the document for component links.
     */
    initiateLoading: function() {
      iterateOver(document.querySelectorAll('link[rel=components]'), function(componentLink) {
        this.fetchResource(componentLink.href);
      }, this);
    },

    /**
     * Fetches a resource from a given URL using XMLHttpRequest.
     * @param {string} resourceURL - The URL of the resource to load.
     */
    fetchResource: function(resourceURL) {
      var httpRequest = new XMLHttpRequest();
      var currentLoader = this; // Capture 'this' for the callback scope.

      httpRequest.open('GET', resourceURL);
      httpRequest.onloadend = function() {
        if (httpRequest.status >= 200 && httpRequest.status < 300 || httpRequest.status === 304) {
          currentLoader.onResourceLoaded && currentLoader.onResourceLoaded(httpRequest.response);
        } else {
          currentLoader.onResourceError && currentLoader.onResourceError(httpRequest.status, httpRequest);
        }
      };
      httpRequest.send();
    }
  };

  /**
   * Initializes the entire custom component system.
   */
  runtimeEnv.initializeSystem = function() {
    var resourceFetcher = new runtimeEnv.ResourceLoader();
    // Start loading components once the DOM is fully loaded.
    document.addEventListener('DOMContentLoaded', resourceFetcher.initiateLoading);

    var markupProcessor = new runtimeEnv.DefinitionParser();
    resourceFetcher.onResourceLoaded = markupProcessor.processMarkup;
    resourceFetcher.onResourceError = function(statusCode, responseObj) {
      console.error("Failed to retrieve component resource: HTTP Status " + statusCode + " - " +
        responseObj.statusText);
    };

    var componentBuilder = new runtimeEnv.ComponentFactory();
    markupProcessor.onElementParsed = componentBuilder.buildComponentRegistration;
    componentBuilder.onRegistrationComplete = function(registeredComponent) {
      // Find all elements in the document that match the registered component's selector
      // and apply the component's transformation logic to them.
      iterateOver(
        document.querySelectorAll(registeredComponent.componentInfo.baseElementName +
          '[is=' + registeredComponent.componentInfo.componentId + ']'),
        registeredComponent.transformElement);
    };
  };

  // Only run the system initialization if not explicitly told to run manually.
  if (!runtimeEnv.runManually) {
    runtimeEnv.initializeSystem();
  }

  // A no-operation function, used as a default for optional callbacks.
  function v0id() {}

})(window.__web_component_factory_system__);