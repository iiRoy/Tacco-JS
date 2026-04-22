;(function(){
//
// This is a custom module loader function.
// It retrieves and executes requested program units.
//
// @param {String} ident The unique identifier for the unit.
// @param {Object} ancestry The parent unit's identifier.
// @param {String} originalIdent The initial identifier requested.
// @return {Object} The exposed items from the loaded unit.
// @access public
//
function obtain(ident, ancestry, originalIdent) {
    var foundIdent = obtain.locate(ident);
    // If the identifier couldn't be found, an error is generated.
    if (null == foundIdent) {
        originalIdent = originalIdent || ident;
        ancestry = ancestry || 'root';
        var issue = new Error('Failed to obtain "' + originalIdent + '" from "' + ancestry + '"');
        issue.path = originalIdent;
        issue.parent = ancestry;
        issue.obtain = true;
        throw issue;
    }
    var packageUnit = obtain.units[foundIdent];
    //
    // Execute the package unit's registered function.
    // This happens only once, when the unit is first accessed.
    //
    if (!packageUnit._processing && !packageUnit.exposedItems) {
        var unit = {};
        unit.exposedItems = {};
        unit.consumer = unit.element = true;
        packageUnit._processing = true;
        packageUnit.call(this, unit.exposedItems, obtain.related(foundIdent), unit);
        delete packageUnit._processing;
        packageUnit.exposedItems = unit.exposedItems;
    }
    return packageUnit.exposedItems;
}
//
// Collection of all registered program units.
//
obtain.units = {};
//
// Collection of all registered alias mappings.
//
obtain.shortcuts = {};
//
// Determines the full, canonical path for a given identifier.
//
// Search order:
//   - IDENT/main.js
//   - IDENT.js
//   - IDENT.json
//   - IDENT
//
// @param {String} itemIdent The identifier to resolve.
// @return {String} The resolved path or null if not found.
// @access private
//
obtain.locate = function(itemIdent) {
    if (itemIdent.charAt(0) === '/') itemIdent = itemIdent.slice(1);
    var itemPossibilities = [
        itemIdent,
        itemIdent + '.js',
        itemIdent + '.json',
        itemIdent + '/main.js',
        itemIdent + '/main.json'
    ];
    for (var idx = 0; idx < itemPossibilities.length; idx++) {
        var currentPossibility = itemPossibilities[idx];
        if (obtain.units.hasOwnProperty(currentPossibility)) return currentPossibility;
        if (obtain.shortcuts.hasOwnProperty(currentPossibility)) return obtain.shortcuts[currentPossibility];
    }
};
//
// Standardizes a route relative to another route.
//
// @param {String} currentRoute The base route.
// @param {String} targetRoute The route to normalize.
// @return {String} The adjusted route string.
// @access private
//
obtain.adjustRoute = function(currentRoute, targetRoute) {
    var segments = [];
    if ('.' != targetRoute.charAt(0)) return targetRoute;
    currentRoute = currentRoute.split('/');
    targetRoute = targetRoute.split('/');
    for (var segmentIndex = 0; segmentIndex < targetRoute.length; ++segmentIndex) {
        if ('..' == targetRoute[segmentIndex]) {
            currentRoute.pop();
        } else if ('.' != targetRoute[segmentIndex] && '' != targetRoute[segmentIndex]) {
            segments.push(targetRoute[segmentIndex]);
        }
    }
    return currentRoute.concat(segments).join('/');
};
//
// Registers a new program unit with its definition.
//
// @param {String} moduleKey The unique key for the module.
// @param {Function} moduleDefinition The function defining the module's content.
// @access private
//
obtain.enroll = function(moduleKey, moduleDefinition) {
    obtain.units[moduleKey] = moduleDefinition;
};
//
// Establishes an alternative name for an existing unit.
//
// @param {String} originalKey The identifier of the existing unit.
// @param {String} aliasKey The new alias for the unit.
// @access private
//
obtain.createShortcut = function(originalKey, aliasKey) {
    if (!obtain.units.hasOwnProperty(originalKey)) {
        throw new Problem('Failed to create shortcut for "' + originalKey + '", it does not exist');
    }
    obtain.shortcuts[aliasKey] = originalKey;
};
//
// Provides a specialized loader function scoped to a specific parent route.
//
// @param {String} parentRoute The base route for relative lookups.
// @return {Function} A localized loader function.
// @access private
//
obtain.related = function(parentRoute) {
    var normalizedParent = obtain.adjustRoute(parentRoute, '..');
    //
    // Utility to find the last occurrence of an item in an array.
    //
    function findLastIndex(arrayData, targetValue) {
        var currentIdx = arrayData.length;
        while (currentIdx--) {
            if (arrayData[currentIdx] === targetValue) return currentIdx;
        }
        return -1;
    }
    //
    // The localized loading function itself.
    //
    function localizedObtain(targetIdent) {
        var foundItem = localizedObtain.locate(targetIdent);
        return obtain(foundItem, parentRoute, targetIdent);
    }
    //
    // Resolves an identifier relative to the parent route.
    //
    localizedObtain.locate = function(targetIdent) {
        var firstChar = targetIdent.charAt(0);
        if ('/' == firstChar) return targetIdent.slice(1);
        if ('.' == firstChar) return obtain.adjustRoute(normalizedParent, targetIdent);
        //
        // Resolve dependencies by locating
        // the dependency within the nearest "dependencies"
        // directory in the path.
        //
        var routeParts = parentRoute.split('/');
        var depsIndex = findLastIndex(routeParts, 'dependencies') + 1;
        if (!depsIndex) depsIndex = 0;
        targetIdent = routeParts.slice(0, depsIndex + 1).join('/') + '/dependencies/' + targetIdent;
        return targetIdent;
    };
    //
    // Checks if a program unit is available at the specified identifier.
    //
    localizedObtain.present = function(targetIdent) {
        return obtain.units.hasOwnProperty(localizedObtain.locate(targetIdent));
    };
    return localizedObtain;
};
obtain.enroll("component-action/main.js", function(exposed, get, modUnit){
//
// Attaches an event handler `handlerFunc` to `elementItem` for `eventType`.
//
// @param {Element} elementItem The DOM element.
// @param {String} eventType The type of event (e.g., 'click').
// @param {Function} handlerFunc The callback function.
// @param {Boolean} useCapture Whether to use capture phase.
// @return {Function} The handler function.
// @access public
//
exposed.connect = function(elementItem, eventType, handlerFunc, useCapture){
  if (elementItem.addEventListener) {
    elementItem.addEventListener(eventType, handlerFunc, useCapture);
  } else {
    elementItem.attachEvent('on' + eventType, handlerFunc);
  }
  return handlerFunc;
};
//
// Detaches an event handler `handlerFunc` from `elementItem` for `eventType`.
//
// @param {Element} elementItem The DOM element.
// @param {String} eventType The type of event.
// @param {Function} handlerFunc The callback function to remove.
// @param {Boolean} useCapture Whether capture phase was used.
// @return {Function} The handler function.
// @access public
//
exposed.disconnect = function(elementItem, eventType, handlerFunc, useCapture){
  if (elementItem.removeEventListener) {
    elementItem.removeEventListener(eventType, handlerFunc, useCapture);
  } else {
    elementItem.detachEvent('on' + eventType, handlerFunc);
  }
  return handlerFunc;
};
});
obtain.enroll("component-action-controller/main.js", function(exposed, get, modUnit){
//
// Expose the `ActionController` class.
//
modUnit.exposedItems = ActionController;
//
// Initializes an `ActionController` instance.
// Binds events on `targetObject` and directs callbacks to `callbackReceiver`.
//
// @param {Object} targetObject The object emitting events.
// @param {Object} callbackReceiver The object containing event handler methods.
// @access public
//
function ActionController(targetObject, callbackReceiver) {
  this.target = targetObject;
  this.obj = callbackReceiver;
  this._eventLinks = {};
}
//
// Registers a custom function for attaching events.
//
// @param {Function} fn The function to use for event attachment.
// @return {ActionController} The current instance.
// @access public
//
ActionController.prototype.onAttach = function(fn){
  this._attach = fn;
  return this;
};
//
// Registers a custom function for detaching events.
//
// @param {Function} fn The function to use for event detachment.
// @return {ActionController} The current instance.
// @access public
//
ActionController.prototype.onDetach = function(fn){
  this._detach = fn;
  return this;
};
//
// Attaches an event `eventName` with an optional `methodName`.
// If `methodName` is not provided, it defaults to "on" + `eventName`.
//
//    controller.connect('login') // implies "onlogin"
//    controller.connect('login', 'onLoginAttempt')
//
// @param {String} eventName The name of the event.
// @param {String} [methodName] The name of the method on the receiver object.
// @return {Function} The generated callback function.
// @access public
//
ActionController.prototype.connect = function(eventName, methodName){
  var handlerFunc = this.createLink.apply(this, arguments);
  if (this._onAttach) this._onAttach(eventName, methodName, handlerFunc);
  this._attach(eventName, handlerFunc);
  return handlerFunc;
};
//
// Creates and stores an event binding callback.
//
// @param {String} eventName The name of the event.
// @param {String} methodName The name of the method on the receiver object.
// @return {Function} The generated callback function.
// @access private
//
ActionController.prototype.createLink = function(eventName, methodName){
  var callbackReceiver = this.obj;
  var actualMethodName = methodName || 'on' + eventName;
  var additionalArgs = [].slice.call(arguments, 2);
  //
  // This is the actual event callback that will be invoked.
  //
  function eventCallback() {
    var argsArray = [].slice.call(arguments).concat(additionalArgs);
    callbackReceiver[actualMethodName].apply(callbackReceiver, argsArray);
  }
  //
  // Store the subscription for future detachment.
  //
  this._eventLinks[eventName] = this._eventLinks[eventName] || {};
  this._eventLinks[eventName][actualMethodName] = eventCallback;
  return eventCallback;
};
//
// Detaches a specific binding, all bindings for a given `eventName`,
// or all bindings managed by this controller.
//
//     controller.disconnect('login', 'onLoginAttempt')
//     controller.disconnect('login')
//     controller.disconnect()
//
// @param {String} [eventName] The name of the event.
// @param {String} [methodName] The name of the method on the receiver object.
// @return {Function} The detached callback function.
// @access public
//
ActionController.prototype.disconnect = function(eventName, methodName){
  if (0 == arguments.length) return this.detachAll();
  if (1 == arguments.length) return this.detachAllFor(eventName);
  var handlerFunc = this._eventLinks[eventName][methodName];
  if (this._onDetach) this._onDetach(eventName, methodName, handlerFunc);
  this._detach(eventName, handlerFunc);
  return handlerFunc;
};
//
// Detaches all events managed by this controller.
//
// @access private
//
ActionController.prototype.detachAll = function(){
  for (var eventName in this._eventLinks) {
    this.detachAllFor(eventName);
  }
};
//
// Detaches all events for a specific `eventName`.
//
// @param {String} eventName The name of the event.
// @access private
//
ActionController.prototype.detachAllFor = function(eventName){
  var links = this._eventLinks[eventName];
  if (!links) return;
  for (var methodName in links) {
    this.disconnect(eventName, methodName);
  }
};
});
obtain.enroll("component-actions/main.js", function(exposed, get, modUnit){
//
// Dependent modules.
//
var Controller = get('action-controller')
  , action = get('component-action');
//
// Provides a new action controller instance.
//
modUnit.exposedItems = function(targetElement, receiverObject){
  var controllerInstance = new Controller(targetElement, receiverObject);
  controllerInstance.onAttach(function(actionName, handler){
    action.connect(targetElement, actionName, handler);
  });
  controllerInstance.onDetach(function(actionName, handler){
    action.disconnect(targetElement, actionName, handler);
  });
  return controllerInstance;
};
});
obtain.enroll("component-supports-3d-transform/main.js", function(exposed, get, modUnit){
var cssProperty = get('style-transform-property');
if (!cssProperty) return modUnit.exposedItems = false;
var vendorPrefixMap = {
  webkitTransform: '-webkit-transform',
  OTransform: '-o-transform',
  msTransform: '-ms-transform',
  MozTransform: '-moz-transform',
  transform: 'transform'
};
//
// Source: https://gist.github.com/lorenzopolidori/3794226
// Create a temporary element to test for 3D transform support.
//
var testElement = document.createElement('div');
testElement.style[cssProperty] = 'translate3d(1px,1px,1px)';
document.body.insertBefore(testElement, null);
var computedValue = window.getComputedStyle(testElement).getPropertyValue(vendorPrefixMap[cssProperty]);
document.body.removeChild(testElement);
modUnit.exposedItems = null != computedValue && computedValue.length && 'none' != computedValue;
});
obtain.enroll("component-style-transform-property/main.js", function(exposed, get, modUnit){
var styleProperties = [
  'webkitTransform',
  'MozTransform',
  'msTransform',
  'OTransform',
  'transform'
];
var testElement = document.createElement('p');
var foundStyle;
for (var propIndex = 0; propIndex < styleProperties.length; propIndex++) {
  foundStyle = styleProperties[propIndex];
  if (null != testElement.style[foundStyle]) {
    modUnit.exposedItems = foundStyle;
    break;
  }
}
});
obtain.enroll("jonykrause-move-element/main.js", function(exposed, get, modUnit){
//
// Dependent modules.
//
var transformProperty = get('style-transform-property');
var supports3d = get('supports-3d-transform');
//
// Expose the `shiftElement` function.
//
modUnit.exposedItems = shiftElement;
//
// Shifts an HTML `targetElement` by `(xCoord, yCoord)` using specified `measureUnit`.
//
// @param {Element} targetElement The DOM element to move.
// @param {Number} xCoord The horizontal displacement.
// @param {Number} yCoord The vertical displacement.
// @param {String} measureUnit The unit of measurement (e.g., 'px', '%').
// @access public
//
function shiftElement(targetElement, xCoord, yCoord, measureUnit) {
  measureUnit || (measureUnit = 'px');
  if (typeof transformProperty === 'string') {
    if (supports3d) {
      targetElement.style[transformProperty] = 'translate3d(' + xCoord + measureUnit + ',' + yCoord + measureUnit + ', 0)';
    } else {
      targetElement.style[transformProperty] = 'translate(' + xCoord + measureUnit + ',' + yCoord + measureUnit + ')';
    }
}});