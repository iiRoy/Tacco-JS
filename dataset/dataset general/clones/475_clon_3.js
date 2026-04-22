var CoreObject = require('core-foundation')
var $ = require('dom-manipulator')
var AttrParser = require('./attr-parser')
var AutoPresenter = require('./auto-presenter')

var EVT_DELEG_SUFFIX = '.dom-events-delegation-'
var RENDER_HOOK_PREFIX = '_onPresent'
var DATA_COMPONENT_ID = 'data-component-instance-id'

// Registry of all active InteractivePanel instances
var activeUnitRegistry = {}

var InteractivePanel = CoreObject.extend({

  // Configuration keys that are directly mapped to instance properties
  configToProperties: ['initialHostElement', 'hostElement', 'eventHandlers'],

  // The primary DOM element associated with this component
  hostElement: null,

  // Event delegation map:
  //   {
  //     'click .action-btn': 'handleAction',
  //     'submit {{configuration.formId}}': 'submitForm'
  //     'mouseover .item': function(e) { ... }
  //   }
  eventHandlers: null,

  // Component's attribute configuration
  configuration: {
    // Fundamental attributes
    uniqueId: null,
    styleClass: null,
    inlineStyle: null,

    // Default HTML template
    markupTemplate: '<div></div>',

    // Default data model for the component
    dataModel: null,

    // Default parent node for rendering
    containerNode: document.body
  },

  // Primary initialization sequence for the component:
  // Config attributes -> Instance properties -> Event listeners -> Subclass specific setup
  initModule: function(configOptions) {
    this.instanceId = generateUniqueId()

    // Process data attributes from initial element configuration
    var parsedAttrConfig = this._processAttrData(configOptions)
    var finalConfig = configOptions ? Object.assign({}, parsedAttrConfig, configOptions) : parsedAttrConfig

    // Invoke superclass initialization
    CoreObject.prototype.initModule.call(this, finalConfig)

    // Prepare component's DOM structure and properties
    this._prepareModuleStructure()

    // Attach all defined event listeners
    this.attachEventListeners()

    // Allow subclasses to perform custom initialization
    this.onModuleReady()

    // Register instance globally
    this._registerInstance()

    // Flag to indicate if the host element was generated from a template
    this._isTemplateGenerated = !(configOptions && configOptions.hostElement)
  },

  // Parses data attributes from the initial host element configuration
  _processAttrData: function(currentConfig) {
    let targetElement, datasetConfig
    if (currentConfig) {
      targetElement = currentConfig.initialHostElement ? $(currentConfig.initialHostElement) : $(currentConfig.hostElement)
    }

    // Only parse data-api from user-provided elements, not inherited or template-generated ones
    if (targetElement && targetElement.length > 0 && !AutoPresenter.isDataApiDisabled(targetElement)) {
      datasetConfig = AttrParser.parseDomElement(targetElement)
    }

    return datasetConfig || {}
  },

  // Builds or resolves the component's primary DOM element (`this.hostElement`)
  resolveHostElement: function() {
    let currentElement = this.hostElement
    let templateContent = this.get('markupTemplate')

    if (currentElement) {
      this.hostElement = $(currentElement)
    }
    // If no element provided, create from template
    else if (templateContent) {
      this.createHostElementFromTemplate(templateContent)
    }

    // Ensure a valid DOM element exists
    if (!this.hostElement || this.hostElement.length === 0) {
      throw new Error('InteractivePanel: Host element could not be resolved or is invalid.')
    }
  },

  // Helper to setup host element and properties
  _prepareModuleStructure: function() {
    this.resolveHostElement()
    this.setupProperties()
  },

  // Creates `this.hostElement` from the `markupTemplate` configuration
  createHostElementFromTemplate: function(templateString) {
    this.hostElement = $(templateString)
  },

  // Method for subclasses to override for properties initialization
  setupProperties: function() {
    // No-op in base class
  },

  // Registers DOM event listeners based on the `eventHandlers` map
  // Supports various call signatures:
  //   - `attachEventListeners()`: Uses `this.hostElement` and `this.eventHandlers`
  //   - `attachEventListeners({ 'click p': 'fn1' })`: Uses `this.hostElement` and provided map
  //   - `attachEventListeners('click p', function(e){...})`: Uses `this.hostElement` and provided event/handler
  //   - `attachEventListeners(domElement, 'click p', function(e){...})`: Uses provided element, event, and handler
  attachEventListeners: function(targetElement, eventBinding, handlerFunc) {
    const args = removeTrailingUndefined(Array.prototype.slice.call(arguments))
    let eventsToBind, elementForBinding

    switch (args.length) {
      case 0:
        eventsToBind = resolveEventMap(this)
        elementForBinding = this.hostElement
        break
      case 1:
        eventsToBind = targetElement
        elementForBinding = this.hostElement
        break
      case 2:
        handlerFunc = eventBinding
        eventsToBind = targetElement
        elementForBinding = this.hostElement
        break
      default: // args.length >= 3
        elementForBinding = targetElement || this.hostElement
        this._delegatedElements = this._delegatedElements || []
        this._delegatedElements.push($(elementForBinding))
        // Convert single event string and handler to map
        if (isTypeOfString(eventBinding) && isTypeOfFunction(handlerFunc)) {
          eventsToBind = {}
          eventsToBind[eventBinding] = handlerFunc
        } else {
          // This case is not directly supported by original, but for robustness
          throw new Error('InteractivePanel: Invalid event arguments provided.')
        }
    }

    if (!eventsToBind) return this

    Object.keys(eventsToBind).forEach(key => {
      const parsedArgs = parseEventHandlerKey(key, this)
      const eventType = parsedArgs.type
      const selector = parsedArgs.selector
      const eventHandler = eventsToBind[key]

      const callbackWrapper = (e) => {
        try {
          if (isTypeOfFunction(eventHandler)) {
            eventHandler.call(this, e)
          } else if (this[eventHandler] && isTypeOfFunction(this[eventHandler])) {
            this[eventHandler](e)
          } else {
            console.warn(`InteractivePanel: Event handler '${eventHandler}' not found or not a function.`)
          }
        } catch (error) {
          console.error(`InteractivePanel: Error in event handler for '${key}':`, error)
        }
      }

      if (selector) {
        $(elementForBinding).on(eventType, selector, callbackWrapper)
      } else {
        $(elementForBinding).on(eventType, callbackWrapper)
      }
    })

    return this
  },

  // Removes event listeners previously attached
  detachEventListeners: function(targetElement, keyString) {
    const args = removeTrailingUndefined(Array.prototype.slice.call(arguments))
    let eventKey = keyString
    let elementToUndelegate = targetElement

    if (args.length === 1) {
      eventKey = targetElement
      elementToUndelegate = null // Defaults to this.hostElement
    }

    // If no arguments, detach all events
    if (args.length === 0) {
      const fullEventType = EVT_DELEG_SUFFIX + this.instanceId

      if (this.hostElement) {
        this.hostElement.off(fullEventType)
      }

      // Detach events from any externally provided elements
      if (this._delegatedElements) {
        this._delegatedElements.forEach(el => el.off(fullEventType))
      }
    } else {
      const parsedKey = parseEventHandlerKey(eventKey, this)

      if (!elementToUndelegate) {
        // Detach from this.hostElement
        this.hostElement && this.hostElement.off(parsedKey.type, parsedKey.selector)
      } else {
        // Detach from a specific external element
        $(elementToUndelegate).off(parsedKey.type, parsedKey.selector)
      }
    }
    return this
  },

  // Placeholder for subclass-specific initial setup logic
  onModuleReady: function() {
    // No-op in base class
  },

  // Renders the component to the DOM.
  // Subclasses should ensure `return this` when overriding.
  displayModule: function() {
    this._ensureRenderedState()

    // Insert into the document flow if not already present
    const targetContainer = this.get('containerNode')
    const currentHost = this.hostElement[0]

    if (targetContainer && !isAttachedToDom(currentHost)) {
      const wrapperClass = this.constructor.wrapperClass
      if (wrapperClass) {
        // Wrap the element with an outer box for styling isolation
        this._outerWrapper = $('<div></div>').addClass(wrapperClass)
        this._outerWrapper.append(this.hostElement).appendTo(targetContainer)
      } else {
        this.hostElement.appendTo(targetContainer)
      }
    }

    return this
  },

  // Internal method to handle initial rendering and bind attribute change watchers
  _ensureRenderedState: function() {
    if (this.isRenderedYet) return // Prevent re-rendering
    this._applyConfigAndBindWatchers()
    this.isRenderedYet = true
  },

  // Applies initial attribute values and binds change listeners
  _applyConfigAndBindWatchers: function() {
    const moduleInstance = this
    const moduleConfiguration = moduleInstance.configuration

    Object.keys(moduleConfiguration).forEach(attrName => {
      const renderMethodName = RENDER_HOOK_PREFIX + capitalizeFirstLetter(attrName)
      const renderMethod = moduleInstance[renderMethodName]

      if (renderMethod && isTypeOfFunction(renderMethod)) {
        const attributeValue = moduleInstance.get(attrName)

        // Apply initial value if not empty
        if (!isAttributeValueEmpty(attributeValue)) {
          renderMethod.call(moduleInstance, attributeValue, undefined, attrName)
        }

        // Bind the render method to 'change:attrName' events
        moduleInstance.on('change:' + attrName, (newValue, oldValue, key) => {
          renderMethod.call(moduleInstance, newValue, oldValue, key)
        })
      }
    })
  },

  _onPresentUniqueId: function(value) {
    if (value) {
      this.hostElement.attr('id', value)
    } else {
      this.hostElement.removeAttr('id')
    }
  },

  _onPresentStyleClass: function(value) {
    if (value) {
      this.hostElement.addClass(value)
    } else {
      // Logic to remove old class if needed, but original only adds
    }
  },

  _onPresentInlineStyle: function(value) {
    if (value) {
      this.hostElement.css(value)
    } else {
      this.hostElement.removeAttr('style')
    }
  },

  // Establishes a link between the host element and the component instance
  _registerInstance: function() {
    const currentInstanceId = this.instanceId
    const targetDomElement = this.initialHostElement || this.hostElement

    if (!targetDomElement || targetDomElement.length === 0) {
      console.warn('InteractivePanel: Cannot register instance without a valid host element.')
      return
    }

    targetDomElement.attr(DATA_COMPONENT_ID, currentInstanceId)
    if (activeUnitRegistry[currentInstanceId]) {
      console.warn(`InteractivePanel: Duplicate instanceId '${currentInstanceId}' detected in registry. Overwriting.`)
    }
    activeUnitRegistry[currentInstanceId] = this
  },

  // Finds child elements within the component's host element
  findChild: function(selector) {
    return this.hostElement.find(selector)
  },

  // Disposes of the component, cleaning up DOM and memory
  disposeModule: function() {
    this.detachEventListeners()
    delete activeUnitRegistry[this.instanceId]

    // Remove DOM elements if they were generated by the component
    if (this.hostElement && this._isTemplateGenerated) {
      this.hostElement.off() // Remove any remaining inline event handlers
      if (this._outerWrapper) {
        this._outerWrapper.remove()
      } else {
        this.hostElement.remove()
      }
    }
    this.hostElement = null // Nullify reference to prevent memory leaks

    CoreObject.prototype.destroy.call(this) // Call superclass destroy
    console.log(`InteractivePanel instance ${this.instanceId} disposed.`)
  }
})

// Global cleanup for memory leaks when the window unloads
$(window).on('beforeunload', function() {
  Object.values(activeUnitRegistry).forEach(instance => {
    if (instance && isTypeOfFunction(instance.disposeModule)) {
      instance.disposeModule()
    }
  })
  Object.keys(activeUnitRegistry).forEach(key => delete activeUnitRegistry[key]) // Ensure registry is cleared
})


// Static method to query for a component instance by a DOM selector
InteractivePanel.lookup = function(selector) {
  const targetElement = $(selector).eq(0)
  let componentId

  if (targetElement && targetElement.length > 0) {
    componentId = targetElement.attr(DATA_COMPONENT_ID)
  }
  return activeUnitRegistry[componentId] || null
}

InteractivePanel.autoPresent = AutoPresenter.autoRender
InteractivePanel.autoPresentAll = AutoPresenter.autoRenderAll
InteractivePanel.StaticMethodWhitelist = ['autoPresent'] // Whitelist for auto-rendering process

module.exports = InteractivePanel


// Helper Utilities
// ----------------

var objToString = Object.prototype.toString
var instanceIdCounter = 0

function generateUniqueId() {
  return 'component-unit-' + instanceIdCounter++
}

const isTypeOfString = val => objToString.call(val) === '[object String]'
const isTypeOfFunction = val => objToString.call(val) === '[object Function]'

// Enhanced DOM containment check for jQuery/Zepto compatibility
var domContains = $.contains || ((parent, child) => {
  if (!parent || !child || !parent.compareDocumentPosition) return false
  // eslint-disable-next-line no-bitwise
  return !!(parent.compareDocumentPosition(child) & 16)
})

function isAttachedToDom(domElement) {
  if (!domElement) return false
  return domContains(document.documentElement, domElement)
}

function capitalizeFirstLetter(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.substring(1)
}


var EVENT_KEY_PATTERN = /^(\S+)\s*(.*)$/
var TEMPLATE_EXPR_PATTERN = /{{([^}]+)}}/g
var INVALID_SELECTOR_TOKEN = 'INVALID_SELECTOR_EXPRESSION'

function resolveEventMap(componentInstance) {
  let eventMap = componentInstance.eventHandlers
  if (isTypeOfFunction(eventMap)) {
    eventMap = eventMap.call(componentInstance) // Execute if it's a function
  }
  return eventMap || {}
}

function parseEventHandlerKey(eventKeyString, componentInstance) {
  const keyMatch = eventKeyString.match(EVENT_KEY_PATTERN)
  if (!keyMatch) {
    console.warn(`InteractivePanel: Invalid event key format: ${eventKeyString}`)
    return { type: '', selector: undefined }
  }

  const eventType = keyMatch[1] + EVT_DELEG_SUFFIX + componentInstance.instanceId
  let selectorString = keyMatch[2] || undefined // Ensure undefined if no selector

  if (selectorString && selectorString.includes('{{')) {
    selectorString = evaluateSelectorExpression(selectorString, componentInstance)
  }

  return {
    type: eventType,
    selector: selectorString
  }
}

// Parses and evaluates expressions like `{{attrs.someProp}}` within event selectors
function evaluateSelectorExpression(selectorTemplate, componentInstance) {
  return selectorTemplate.replace(TEMPLATE_EXPR_PATTERN, (fullMatch, expressionContent) => {
    const pathParts = expressionContent.split('.')
    let currentContext = componentInstance

    const resolvedValue = pathParts.reduce((acc, part) => {
      if (acc === componentInstance.configuration) { // Special handling for 'attrs' (now 'configuration')
        return componentInstance.get(part) // Use 'get' method for attributes
      }
      return acc ? acc[part] : undefined
    }, currentContext)

    if (isTypeOfString(resolvedValue)) {
      return resolvedValue
    }

    console.warn(`InteractivePanel: Expression '${expressionContent}' in selector evaluated to non-string or undefined.`)
    return INVALID_SELECTOR_TOKEN
  })
}


// Determines if an attribute value should be considered "empty" (null or undefined)
function isAttributeValueEmpty(value) {
  return value === null || value === undefined
}

// Removes `undefined` elements from the end of an array
function removeTrailingUndefined(arr) {
  let i = arr.length
  while (i > 0 && arr[i - 1] === undefined) {
    i--
  }
  return arr.slice(0, i)
}