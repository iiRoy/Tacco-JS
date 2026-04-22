(function(moduleContext) {

  // Ensure the module context object exists; otherwise, initialize it.
  moduleContext = moduleContext || {};

  // Verify the presence of native Shadow DOM support for element isolation.
  // In a Type III clone, we might provide a fallback or simply issue a warning.
  // The original checked for WebKitShadowRoot; we'll update to standard ShadowRoot.
  if (!window.ShadowRoot) {
    console.warn('Native Shadow DOM support is highly recommended for optimal operation. Functionality may be limited or require polyfills.');
    // For a Type III clone, we allow continuation but acknowledge potential issues.
  }

  // A no-operation function to use as a default callback, replacing 'nil'.
  const noopFunction = () => {};

  // Custom utility to iterate over array-like objects.
  // This replaces the original Array.prototype.forEach.call.bind(Array.prototype.forEach)
  // with a more explicit and modern approach using Array.from and forEach.
  const iterateElements = (collection, callback, context = null) => {
    if (!collection) {
      // Guard clause: do nothing if the collection is null or undefined.
      console.debug('Attempted to iterate over a null/undefined collection.');
      return;
    }
    Array.from(collection).forEach(callback, context);
  };

  // Defines the metadata and internal properties for a custom element.
  // Renamed from HTMLElementElement.
  moduleContext.CustomElementDescriptor = function(componentIdentifier, baseTag, configObject) {
    this.componentIdentifier = componentIdentifier;
    this.baseTag = baseTag;
    // Bind the lifecycle callback assignment method to the configuration object's context.
    this.attachLifecycleHandlers = this.attachLifecycleHandlers.bind(configObject);
    // New fragment: Add a property for internal state management.
    this._descriptorInitialized = false;
  };

  // Prototype methods for CustomElementDescriptor.
  moduleContext.CustomElementDescriptor.prototype = (() => {
    const proto = Object.create(HTMLElement.prototype); // Inherit from HTMLElement.

    // Renamed from 'lifecycle' to 'attachLifecycleHandlers'.
    // Assigns user-defined lifecycle callbacks to the descriptor.
    proto.attachLifecycleHandlers = function(callbackSet) {
      // Use logical OR with a no-operation function for default values.
      this.onCreated = callbackSet.created || noopFunction;
      this.onAttached = callbackSet.inserted || noopFunction;
      this.onAttributeModified = callbackSet.attributeChanged || noopFunction;
      // New fragment: Optionally support a detached callback.
      this.onDetached = callbackSet.removed || noopFunction;
      this._descriptorInitialized = true;
    };

    return proto;
  })();

  // Manages the complete configuration and behavior for a custom component,
  // including its constructor, template, and lifecycle.
  // Renamed from Declaration.
  moduleContext.ComponentConfiguration = function(moniker, ancestorTag) {
    // Generate the prototype chain for the custom element.
    this.derivedPrototype = Object.create(this.retrieveBasePrototype(ancestorTag));
    // Create an instance of the descriptor for this component.
    this.descriptorInstance = new moduleContext.CustomElementDescriptor(moniker, ancestorTag, this);
    // Generate the actual constructor function for the custom element.
    this.elementConstructorFactory = this.createConstructorFunction();

    // Hard-bind the element application method to this configuration instance.
    this.applyConfigurationToElement = this.applyConfigurationToElement.bind(this);

    // New fragment: Add an internal tracking property.
    this._isReadyForElementIntegration = false;
  };

  // Prototype methods for ComponentConfiguration.
  moduleContext.ComponentConfiguration.prototype = {

    // Creates the constructor function that will instantiate custom elements.
    // Renamed from generateConstructor.
    createConstructorFunction: function() {
      const baseElementTag = this.descriptorInstance.baseTag;
      const creationHandler = this.descriptorInstance.onCreated; // Renamed from 'created'.

      // The actual constructor for the custom element.
      // This constructor ensures the correct prototype chain is established.
      const componentConstructor = function() {
        // Create a base element to derive the prototype from.
        const baseElement = document.createElement(baseElementTag);
        // Modern way to set prototype, replacing direct __proto__ assignment.
        // Ensure the custom element instance inherits from the base element's prototype.
        Object.setPrototypeOf(this, componentConstructor.prototype);

        // Call the user-defined created callback, if available.
        creationHandler.call(this);

        // New fragment: Add a debug log for constructor invocation.
        // console.debug(`Custom element <${baseElementTag} is="${this.componentIdentifier}"> instance created.`);
      };
      // Assign the derived prototype (which includes custom methods) to the constructor's prototype.
      Object.setPrototypeOf(componentConstructor.prototype, this.derivedPrototype);
      return componentConstructor;
    },

    // Processes script content associated with the component, executing it.
    // Renamed from evalScript.
    processScriptContent: function(scriptNode) {
      // Added a try-catch block for robustness (Type III addition).
      try {
        // Execute the script in the context of the descriptor instance.
        // This allows component-specific logic to be defined.
        (new Function(scriptNode.textContent)).call(this.descriptorInstance);
      } catch (scriptExecutionError) {
        console.error(`Error executing script for component '${this.descriptorInstance.componentIdentifier}':`, scriptExecutionError);
      }
    },

    // Stores the template for the component's shadow DOM structure.
    // Renamed from addTemplate.
    setComponentTemplate: function(templateElement) {
      this.componentTemplate = templateElement;
      // New fragment: Update internal state to indicate template presence.
      this._hasTemplateContent = true;
      console.debug(`Template set for component '${this.descriptorInstance.componentIdentifier}'.`);
    },

    // Applies the configuration to an actual DOM element, setting up shadow DOM and observers.
    // Renamed from morph.
    applyConfigurationToElement: function(targetElement) {
      // The original code mutated __proto__ directly. We'll use Object.setPrototypeOf
      // to achieve the same functional outcome in a more robust way.
      // Ensure the target element's prototype chain includes the custom constructor's prototype.
      Object.setPrototypeOf(targetElement, this.elementConstructorFactory.prototype);

      const elementShadowRoot = this.establishShadowRoot(targetElement);

      // Trigger lifecycle events defined by the component.
      this.descriptorInstance.onCreated.call(targetElement, elementShadowRoot);
      this.descriptorInstance.onAttached.call(targetElement, elementShadowRoot); // Renamed from inserted.

      // Setup mutation observer for attribute changes if a callback is defined.
      if (this.descriptorInstance.onAttributeModified !== noopFunction) {
        const attributeMonitor = new MutationObserver(changeRecords => {
          // Iterate over all attribute change records.
          iterateElements(changeRecords, record => {
            if (record.type === 'attributes') {
              // New intermediate variable for clarity.
              const currentAttributeValue = record.target.getAttribute(record.attributeName);
              this.descriptorInstance.onAttributeModified.call(record.target, record.attributeName, record.oldValue, currentAttributeValue);
              // New fragment: Debug log for attribute changes.
              // console.debug(`Attribute '${record.attributeName}' changed on element:`, record.target);
            }
          });
        });

        // The spec isn't entirely clear on observer scope, but observing the host's attributes
        // is the most common and logical interpretation for custom elements.
        attributeMonitor.observe(elementShadowRoot.host, {
          attributes: true,
          attributeOldValue: true
        });
      }
      // New fragment: Mark the element as having its configuration applied.
      this._isReadyForElementIntegration = true;
      console.debug(`Configuration applied to element for '${this.descriptorInstance.componentIdentifier}'.`);
    },

    // Creates and attaches a shadow root to the host element, populating it with template content.
    // Renamed from createShadowRoot.
    establishShadowRoot: function(hostElement) {
      // Using standard attachShadow for modern browsers, replacing WebKitShadowRoot.
      // Always attach an open shadow root; it will be empty if no template.
      const elementShadowRoot = hostElement.attachShadow({ mode: 'open' });
      // The host property is automatically set, but explicitly setting it reinforces understanding.
      elementShadowRoot.host = hostElement;

      if (!this.componentTemplate) {
        console.warn(`No template found for component '${this.descriptorInstance.componentIdentifier}'. Shadow DOM will be empty.`);
        return elementShadowRoot;
      }

      // Clone template content into the shadow root.
      // Using the new `iterateElements` helper.
      iterateElements(this.componentTemplate.content.childNodes, childNode => {
        elementShadowRoot.appendChild(childNode.cloneNode(true));
      });

      return elementShadowRoot;
    },

    // Retrieves the prototype object for a given standard HTML tag name.
    // Renamed from prototypeFromTagName.
    retrieveBasePrototype: function(tag) {
      // Using Object.getPrototypeOf directly on the constructor for robustness.
      // This ensures correct inheritance from native HTML elements.
      return Object.getPrototypeOf(document.createElement(tag));
    }
  };

  // Factory responsible for creating ComponentConfiguration instances from HTML element definitions.
  // Renamed from DeclarationFactory.
  moduleContext.ComponentBlueprintBuilder = function() {
    // Ensure the blueprint creation method is bound to this instance.
    this.buildComponentBlueprint = this.buildComponentBlueprint.bind(this);
    // New fragment: Add a counter for created blueprints.
    this._totalBlueprintsCreated = 0;
  };

  moduleContext.ComponentBlueprintBuilder.prototype = {
    // Callback invoked after each component blueprint is successfully created.
    onBlueprintCreation: null,

    // Creates a new ComponentConfiguration from a source <element> tag found in HTML markup.
    // Renamed from createDeclaration.
    buildComponentBlueprint: function(sourceElement) {
      // Helper for getting attributes, returning null if not found.
      const getAttributeOrDefault = (el, attrName) => el.getAttribute(attrName);

      const elementName = getAttributeOrDefault(sourceElement, 'name');
      if (!elementName) {
        console.error('Component <element> tag is missing the "name" attribute. This is required. Skipping blueprint creation.', sourceElement);
        return;
      }
      const extendedTag = getAttributeOrDefault(sourceElement, 'extends');
      if (!extendedTag) {
        // For a Type III clone, we maintain the requirement but clarify the error.
        console.error(`Component '${elementName}' requires an "extends" attribute to define its base HTML tag. Skipping blueprint creation.`, sourceElement);
        return;
      }

      const ctorName = getAttributeOrDefault(sourceElement, 'constructor');
      const blueprint = new moduleContext.ComponentConfiguration(elementName, extendedTag);

      if (ctorName) {
        window[ctorName] = blueprint.elementConstructorFactory;
        // New fragment: Log the globally exposed constructor.
        console.info(`Global constructor '${ctorName}' registered for component '${elementName}'.`);
      }

      // Process all script tags found within the component definition element.
      iterateElements(sourceElement.querySelectorAll('script'), scriptNode => {
        blueprint.processScriptContent(scriptNode);
      }, blueprint);

      const componentTemplateNode = sourceElement.querySelector('template');
      if (componentTemplateNode) { // Guard clause for template existence.
        blueprint.setComponentTemplate(componentTemplateNode);
      } else {
        console.warn(`No <template> found for component '${elementName}'. It will have an empty Shadow DOM.`);
      }

      // Invoke the callback if defined, passing the newly created blueprint.
      this.onBlueprintCreation && this.onBlueprintCreation(blueprint);

      // Increment counter for Type III addition.
      this._totalBlueprintsCreated++;
      console.log(`Blueprint for component '${elementName}' created. Total: ${this._totalBlueprintsCreated}`);
    }
  };

  // Parses HTML markup to discover and process component definitions.
  // Renamed from Parser.
  moduleContext.MarkupProcessor = function() {
    this.processMarkup = this.processMarkup.bind(this);
    // New fragment: Add a counter for processed documents.
    this._documentsProcessed = 0;
  };

  moduleContext.MarkupProcessor.prototype = {
    // Callback invoked for each element definition found in the parsed markup.
    onElementProcessed: null,

    // Parses an HTML string and extracts component definitions (<element> tags).
    // Renamed from parse.
    processMarkup: function(htmlString) {
      if (!htmlString || typeof htmlString !== 'string') {
        console.error('Attempted to process invalid or empty HTML string.');
        return;
      }

      const tempDocument = document.implementation.createHTMLDocument('');
      tempDocument.body.innerHTML = htmlString;
      // Iterate over all <element> tags found in the temporary document.
      iterateElements(tempDocument.querySelectorAll('element'), parsedElement => {
        this.onElementProcessed && this.onElementProcessed(parsedElement);
      }, this);
      // New fragment: Log completion.
      this._documentsProcessed++;
      console.log(`Markup processing completed for a document. Total documents processed: ${this._documentsProcessed}`);
    }
  };

  // Fetches external resources (e.g., component definition files) using XHR.
  // Renamed from Loader.
  moduleContext.ResourceFetcher = function() {
    this.initiateLoading = this.initiateLoading.bind(this);
    // New fragment: Track pending requests.
    this._pendingXhrRequests = 0;
  };

  moduleContext.ResourceFetcher.prototype = {
    // Callback for successful resource fetch.
    onFetchSuccess: null,
    // Callback for failed resource fetch.
    onFetchFailure: null,

    // Initiates the loading process by scanning the document for component link tags.
    // Renamed from start.
    initiateLoading: function() {
      const componentLinks = document.querySelectorAll('link[rel="components"]');
      if (componentLinks.length === 0) {
        console.info('No <link rel="components"> tags found. No external components to load.');
        return;
      }

      iterateElements(componentLinks, componentLink => {
        if (componentLink.href) { // Ensure href attribute exists before fetching.
          this.fetchResource(componentLink.href);
        } else {
          console.warn('Found a <link rel="components"> tag without an "href" attribute:', componentLink);
        }
      }, this);
    },

    // Fetches a resource from the given URL using XMLHttpRequest.
    // Renamed from load.
    fetchResource: function(resourceURL) {
      this._pendingXhrRequests++; // Increment pending requests.

      const xhrRequest = new XMLHttpRequest();
      const currentFetcher = this; // Capture 'this' for event listeners.

      xhrRequest.open('GET', resourceURL, true); // Explicitly async.
      xhrRequest.responseType = 'text'; // Ensure response is treated as text.

      // Using addEventListener for 'loadend', a Type III change.
      xhrRequest.addEventListener('loadend', function() {
        currentFetcher._pendingXhrRequests--; // Decrement pending requests.

        // Check for successful HTTP status codes (2xx or 304 Not Modified).
        if ((xhrRequest.status >= 200 && xhrRequest.status < 300) || xhrRequest.status === 304) {
          currentFetcher.onFetchSuccess && currentFetcher.onFetchSuccess(xhrRequest.responseText, resourceURL); // Pass responseText and URL.
        } else {
          currentFetcher.onFetchFailure && currentFetcher.onFetchFailure(xhrRequest.status, xhrRequest.statusText, resourceURL); // Pass status, text, and URL.
        }
        // New fragment: Debug log for request completion.
        console.debug(`Resource fetch for '${resourceURL}' completed with status: ${xhrRequest.status}. Pending requests: ${currentFetcher._pendingXhrRequests}`);
      });

      // New fragment: Explicit error handling for network issues.
      xhrRequest.addEventListener('error', function() {
        console.error(`Network error occurred while fetching '${resourceURL}'.`);
        currentFetcher.onFetchFailure && currentFetcher.onFetchFailure(0, 'Network Error', resourceURL); // Status 0 for network errors.
      });

      xhrRequest.send();
    }
  };

  // Orchestrates the component loading, parsing, and application process.
  // Renamed from run.
  moduleContext.initializeComponentSystem = function() {
    const resourceLoader = new moduleContext.ResourceFetcher();
    // Attach the loader's start method to the DOMContentLoaded event.
    // Using an anonymous arrow function for concise binding.
    document.addEventListener('DOMContentLoaded', () => resourceLoader.initiateLoading());

    const markupProcessor = new moduleContext.MarkupProcessor();
    // When a resource is successfully loaded, parse its content as HTML.
    resourceLoader.onFetchSuccess = (responseContent, loadedURL) => {
      console.log(`Successfully loaded component resource from: ${loadedURL}`);
      markupProcessor.processMarkup(responseContent);
    };
    resourceLoader.onFetchFailure = (statusCode, statusMessage, failedURL) => {
      console.error(`Failed to load component resource: '${failedURL}'. Status: ${statusCode} - ${statusMessage}`);
      // New fragment: Optionally implement retry logic or display a user-facing error.
      // E.g., if (statusCode === 404) { alert('Component definition not found!'); }
    };

    const blueprintBuilder = new moduleContext.ComponentBlueprintBuilder();
    // When an element definition is parsed from markup, create a component blueprint.
    markupProcessor.onElementProcessed = blueprintBuilder.buildComponentBlueprint;
    blueprintBuilder.onBlueprintCreation = componentDefinition => {
      // Find all elements in the document that match this component's definition
      // and apply the configuration (shadow DOM, lifecycle, observers) to them.
      const selector = `${componentDefinition.descriptorInstance.baseTag}[is="${componentDefinition.descriptorInstance.componentIdentifier}"]`;
      // New fragment: Add a debug log for component application.
      console.debug(`Attempting to apply configuration for component '${componentDefinition.descriptorInstance.componentIdentifier}' to elements matching: '${selector}'`);

      const matchingElements = document.querySelectorAll(selector);
      if (matchingElements.length === 0) {
        console.warn(`No existing elements found in the document to apply component '${componentDefinition.descriptorInstance.componentIdentifier}' to.`);
      } else {
        iterateElements(matchingElements, targetElement => {
          componentDefinition.applyConfigurationToElement(targetElement);
        });
      }
    };

    // New fragment: Add a global flag to indicate system initialization status.
    moduleContext._systemInitialized = true;
    console.info('Custom component system initialized.');
  };

  // Check if auto-initialization should be prevented by a global flag.
  // Renamed from runManually.
  if (moduleContext.preventAutoInitialization !== true) {
    moduleContext.initializeComponentSystem();
  }

})(window.__exported_components_polyfill_scope__);