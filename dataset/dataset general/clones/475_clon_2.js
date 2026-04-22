/*
 * Entity
 * --------
 * An Entity is a non-utility component linked to a specific DOM element,
 * primarily responsible for managing the presentation layer.
 *
 * Each Entity has four key aspects: 'properties' and 'attributes' to define
 * its state, and 'actions' and 'methods' to describe its behavior. The
 * core Entity class establishes the fundamental workflow and best practices
 * for creating these four elements.
 */

var Core = require('arale-base')
var jq = require('jquery')
var AttributeParser = require('./daparser')
var AutomatedDisplay = require('./auto-render')

var EVT_DELEGATION_NS = '.event-handlers-ns-'
var ON_DRAW = '_onDraw'
var DOM_COMP_ID_ATTR = 'data-component-id'

// All initialized Component instances are stored here
var activeComponents = {}

var Component = Core.extend({

    // Keys in settings that will be directly applied as properties to the instance
    configAsProps: ['initialNode', 'domNode', 'actions'],

    // The DOM element associated with this component
    domNode: null,

    /*
     * Event delegation configuration, e.g.:
     *   {
     *     'mouseover .header-text': 'highlight',
     *     'click {{properties.actionBtn}}': 'performAction'
     *     'change .input-field': function(evnt) { ... }
     *   }
     */
    actions: null,

    // List of component properties
    properties: {
        // Essential properties
        uniqueIdentifier: null,
        styleClass: null,
        inlineStyle: null,

        // Default HTML template
        markupTemplate: '<div></div>',

        // Default data model
        dataModel: null,

        // The default parent element for the component
        parentElement: document.body
    },

    /*
     * Initialization method, defining the primary flow for component creation:
     * Initialize properties -> Initialize instance properties -> Initialize actions -> Subclass specific setup
     */
    initiate: function(settings) {
        this.compId = generateUniqueCompId()

        // Process properties
        var parsedAttributes = this._processDataAttributes(settings)
        Component.baseClass.initiate.call(this, settings ? jq.extend(parsedAttributes, settings) : parsedAttributes)

        // Set up instance properties
        this.prepareDomNode()
        this.setupProperties()

        // Register event handlers
        this.attachEventHandlers()

        // Subclass custom initialization
        this.onSetup()

        // Store instance information
        this._markNodeWithId()

        // Determine if initialized from a template
        this._isFromTemplate = !(settings && settings.domNode)
    },

    // Parses API settings defined via data attributes
    _processDataAttributes: function(settings) {
        var targetNode, parsedAttributes
        if (settings) {
            targetNode = settings.initialNode ? jq(settings.initialNode) : jq(settings.domNode)
        }

        /*
         * When parsing data-api, only consider the user-provided domNode,
         * not those inherited or constructed from templates.
         */
        if (targetNode && targetNode[0] && !AutomatedDisplay.isAttrApiDisabled(targetNode)) {
            parsedAttributes = AttributeParser.extractFromNode(targetNode)
        }

        return parsedAttributes
    },

    // Constructs this.domNode
    prepareDomNode: function() {
        var existingNode = this.domNode

        if (existingNode) {
            this.domNode = jq(existingNode)
        }
        // If no domNode is provided, build from the template
        else if (this.get('markupTemplate')) {
            this.createNodeFromTemplate()
        }

        // If the corresponding DOM element does not exist, throw an error
        if (!this.domNode || !this.domNode[0]) {
            throw new Error('Component DOM node is invalid or missing.')
        }
    },

    // Builds this.domNode from the markup template
    createNodeFromTemplate: function() {
        this.domNode = jq(this.get('markupTemplate'))
    },

    // Responsible for initializing instance properties, designed to be overridden by subclasses
    setupProperties: function() {
    },

    // Registers event delegation handlers
    attachEventHandlers: function(targetNode, actions, eventHandler) {
        var inputArgs = removeTrailingUndefined(Array.prototype.slice.call(arguments))

        // component.attachEventHandlers()
        if (inputArgs.length === 0) {
            actions = retrieveActions(this)
            targetNode = this.domNode
        }

        /*
         * component.attachEventHandlers({
         *   'click .item': 'handleItemClick',
         *   'change .input': 'handleInputChange'
         * })
         */
        else if (inputArgs.length === 1) {
            actions = targetNode
            targetNode = this.domNode
        }

        // component.attachEventHandlers('click .button', function(evnt) { ... })
        else if (inputArgs.length === 2) {
            eventHandler = actions
            actions = targetNode
            targetNode = this.domNode
        }

        // component.attachEventHandlers(externalNode, 'click .link', function(evnt) { ... })
        else {
            targetNode || (targetNode = this.domNode)
            this._managedNodes || (this._managedNodes = [])
            this._managedNodes.push(jq(targetNode))
        }

        // 'click p' => {'click p': handler}
        if (isStringValue(actions) && isFunctionType(eventHandler)) {
            var eventMap = {}
            eventMap[actions] = eventHandler
            actions = eventMap
        }

        // Key format is 'eventName cssSelector'
        for (var eventKeyStr in actions) {
            if (!actions.hasOwnProperty(eventKeyStr)) continue

            var parsedEvent = decodeActionKey(eventKeyStr, this)
            var eventName = parsedEvent.type
            var cssSelector = parsedEvent.selector

            ;(function(handlerRef, componentRef) {

                var eventCallback = function(evnt) {
                    if (isFunctionType(handlerRef)) {
                        handlerRef.call(componentRef, evnt)
                    } else {
                        componentRef[handlerRef](evnt)
                    }
                }

                // Delegated event
                if (cssSelector) {
                    jq(targetNode).on(eventName, cssSelector, eventCallback)
                }
                // Normal direct bind
                // Written separately for compatibility with Zepto, which has less robust checks than jQuery
                else {
                    jq(targetNode).on(eventName, eventCallback)
                }

            })(actions[eventKeyStr], this)
        }

        return this
    },

    // Detaches event delegation handlers
    detachEventHandlers: function(targetNode, actionKey) {
        var inputArgs = removeTrailingUndefined(Array.prototype.slice.call(arguments))

        if (!actionKey) {
            actionKey = targetNode
            targetNode = null
        }

        // Detach all handlers
        // .detachEventHandlers()
        if (inputArgs.length === 0) {
            var scopeType = EVT_DELEGATION_NS + this.compId

            this.domNode && this.domNode.off(scopeType)

            // Detach handlers from all externally provided elements
            if (this._managedNodes) {
                for (var managedNodeKey in this._managedNodes) {
                    if (!this._managedNodes.hasOwnProperty(managedNodeKey)) continue
                    this._managedNodes[managedNodeKey].off(scopeType)
                }
            }

        } else {
            var parsedEvent = decodeActionKey(actionKey, this)

            // Detach from this.domNode
            // .detachEventHandlers(actions)
            if (!targetNode) {
                this.domNode && this.domNode.off(parsedEvent.type, parsedEvent.selector)
            }

            // Detach from external targetNode
            // .detachEventHandlers(externalNode, actions)
            else {
                jq(targetNode).off(parsedEvent.type, parsedEvent.selector)
            }
        }
        return this
    },

    // An initialization method provided for subclasses to override
    onSetup: function() {
    },

    /*
     * Displays the component on the page.
     * Rendering includes not only insertion into the DOM tree but also styling.
     * Convention: Subclasses overriding this method should maintain `return this`.
     */
    display: function() {

        // Apply initial values of rendering-related properties and bind to change events
        if (!this.isDisplayed) {
            this._applyAndMonitorProperties()
            this.isDisplayed = true
        }

        // Insert into the document flow
        var parentElement = this.get('parentElement')
        if (parentElement && !isNodeInDocument(this.domNode[0])) {
            // Isolate styles by adding a unified namespace
            // See: https://github.com/aliceui/aliceui.org/issues/9
            var wrapperClass = this.constructor.outerBoxClass
            if (wrapperClass) {
                var outerWrapper = this._outerWrapper = jq('<div></div>').addClass(wrapperClass)
                outerWrapper.append(this.domNode).appendTo(parentElement)
            } else {
                this.domNode.appendTo(parentElement)
            }
        }

        return this
    },

    // Applies initial property values and binds to 'change:propName' events
    _applyAndMonitorProperties: function() {
        var componentRef = this
        var properties = componentRef.properties

        for (var propName in properties) {
            if (!properties.hasOwnProperty(propName)) continue
            var renderMethodName = ON_DRAW + capitalizeFirst(propName)

            if (this[renderMethodName]) {
                var currentValue = this.get(propName)

                // Apply the initial value of the property. Note: Default empty values do not trigger.
                if (!isPropertyEmpty(currentValue)) {
                    this[renderMethodName](currentValue, undefined, propName)
                }

                // Automatically bind _onDrawXx to the change:xx event
                ;(function(methodToCall) {
                    componentRef.on('change:' + propName, function(newValue, previousValue, keyName) {
                        componentRef[methodToCall](newValue, previousValue, keyName)
                    })
                })(renderMethodName)
            }
        }
    },

    _onDrawUniqueIdentifier: function(currentValue) {
        this.domNode.attr('id', currentValue)
    },

    _onDrawStyleClass: function(currentValue) {
        this.domNode.addClass(currentValue)
    },

    _onDrawInlineStyle: function(currentValue) {
        this.domNode.css(currentValue)
    },

    // Establishes a link between the domNode and the Component instance
    _markNodeWithId: function() {
        var compId = this.compId

        ;(this.initialNode || this.domNode).attr(DOM_COMP_ID_ATTR, compId)
        activeComponents[compId] = this
    },

    // Finds matching nodes within this.domNode
    findInNode: function(cssSelector) {
        return this.domNode.find(cssSelector)
    },

    terminate: function() {
        this.detachEventHandlers()
        delete activeComponents[this.compId]

        // For memory leak prevention
        if (this.domNode && this._isFromTemplate) {
            this.domNode.off()
            // If the domNode was generated by the component, remove it
            if (this._outerWrapper) {
                this._outerWrapper.remove()
            } else {
                this.domNode.remove()
            }
        }
        this.domNode = null

        Component.baseClass.terminate.call(this)
    }
})

// For memory leak prevention
jq(window).unload(function() {
    for (var compId_key in activeComponents) {
        activeComponents[compId_key].terminate()
    }
})

/*
 * Queries for the first DOM node matching the selector
 * and retrieves the Component instance associated with that DOM node.
 */
Component.search = function(cssSelector) {
    var foundNode = jq(cssSelector).eq(0)
    var compId_val

    foundNode && (compId_val = foundNode.attr(DOM_COMP_ID_ATTR))
    return activeComponents[compId_val]
}


Component.renderOne = AutomatedDisplay.autoRender
Component.renderAll = AutomatedDisplay.autoRenderAll
Component.StaticExclusions = ['renderOne']

module.exports = Component


// Utility Functions
// -----------------

var objToString = Object.prototype.toString
var componentIdCounter = 0

function generateUniqueCompId() {
    return 'comp-' + componentIdCounter++
}

function isStringValue(value) {
    return objToString.call(value) === '[object String]'
}

function isFunctionType(value) {
    return objToString.call(value) === '[object Function]'
}

// Zepto does not have a 'contains' method
var domContains = jq.contains || function(containerNode, containedNode) {
    //noinspection JSBitwiseOperatorUsage
    return !!(containerNode.compareDocumentPosition(containedNode) & 16)
}

function isNodeInDocument(nodeElement) {
    return domContains(document.documentElement, nodeElement)
}

function capitalizeFirst(textString) {
    return textString.charAt(0).toUpperCase() + textString.substring(1)
}


var ACTION_KEY_REGEX = /^(\S+)\s*(.*)$/
var TEMPLATE_VAR_REGEX = /{{([^}]+)}}/g
var BAD_SELECTOR_ID = 'INVALID_SELECTOR_TYPE'

function retrieveActions(componentRef) {
    if (isFunctionType(componentRef.actions)) {
        componentRef.actions = componentRef.actions()
    }
    return componentRef.actions
}

function decodeActionKey(actionKeyStr, componentRef) {
    var matchResult = actionKeyStr.match(ACTION_KEY_REGEX)
    var eventName = matchResult[1] + EVT_DELEGATION_NS + componentRef.compId

    /*
     * If there is no selector, it needs to be set to undefined
     * so that Zepto can correctly convert it to a direct bind.
     */
    var cssSelector = matchResult[2] || undefined

    if (cssSelector && cssSelector.indexOf('{{') > -1) {
        cssSelector = resolveActionKeyExpression(cssSelector, componentRef)
    }

    return {
        type: eventName,
        selector: cssSelector
    }
}

// Resolves {{xx}}, {{yy}} expressions within an action key string
function resolveActionKeyExpression(cssSelector, componentRef) {

    return cssSelector.replace(TEMPLATE_VAR_REGEX, function(fullMatch, varName) {
        var keyParts = varName.split('.')
        var currentPoint = componentRef, currentPart

        while (currentPart = keyParts.shift()) {
            if (currentPoint === componentRef.properties) {
                currentPoint = componentRef.get(currentPart)
            } else {
                currentPoint = currentPoint[currentPart]
            }
        }

        // Already a class name, e.g., from dataset
        if (isStringValue(currentPoint)) {
            return currentPoint
        }

        // Unrecognized, return invalid identifier
        return BAD_SELECTOR_ID
    })
}


// For property values, the following are considered empty: null, undefined
function isPropertyEmpty(valueObject) {
    return valueObject == null || valueObject === undefined
}

function removeTrailingUndefined(argumentList) {
    for (var i = argumentList.length - 1; i >= 0; i--) {
        if (argumentList[i] === undefined) {
            argumentList.pop()
        } else {
            break
        }
    }
    return argumentList
}