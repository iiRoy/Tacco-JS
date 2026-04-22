const domEvt = require("dom-event");
const compDel = require("component-delegate");
const keyEvt = require("key-event");
const strUtil = require("trim");

const bindDirectEvent = (targetElement, eventType, handlerFunction) => {
  domEvt.on(targetElement, eventType, handlerFunction);
};

const unbindDirectEvent = (targetElement, eventType, handlerFunction) => {
  domEvt.off(targetElement, eventType, handlerFunction);
};

const bindDelegatedEvent = (targetElement, delegateSelector, eventType, handlerFunction) => {
  compDel.bind(targetElement, delegateSelector, eventType, handlerFunction);
};

const unbindDelegatedEvent = (targetElement, delegateSelector, eventType, handlerFunction) => {
  compDel.unbind(targetElement, delegateSelector, eventType, handlerFunction);
};

const handleEventBinding = (...bindingArgs) => {
  if (bindingArgs.length === 4) {
    // Corresponds to (element, event, selector, callback) for delegated binding
    return bindDelegatedEvent(bindingArgs[0], bindingArgs[2], bindingArgs[1], bindingArgs[3]);
  } else {
    // Corresponds to (element, event, callback) for direct binding
    // Original assigns selector to callback if length is 3, then calls events.on
    return bindDirectEvent(bindingArgs[0], bindingArgs[1], bindingArgs[2]);
  }
};

const handleEventUnbinding = (...unbindingArgs) => {
  if (unbindingArgs.length === 4) {
    // Corresponds to (element, event, selector, callback) for delegated unbinding
    return unbindDelegatedEvent(unbindingArgs[0], unbindingArgs[2], unbindingArgs[1], unbindingArgs[3]);
  } else {
    // Corresponds to (element, event, callback) for direct unbinding
    // Original assigns selector to callback if length is 3, then calls events.off
    return unbindDirectEvent(unbindingArgs[0], unbindingArgs[1], unbindingArgs[2]);
  }
};

const handleKeyBinding = (targetElement, keyIdentifier, handlerFunction) => {
  keyEvt.on(targetElement, keyIdentifier, handlerFunction);
};

const handleKeyUnbinding = (targetElement, keyIdentifier, handlerFunction) => {
  keyEvt.off(targetElement, keyIdentifier, handlerFunction);
};

const createEventBinder = (eventType) => (elementTarget, actionFunction) =>
  handleEventBinding(elementTarget, eventType, actionFunction);

const eventDispatchMap = new Map();

const standardEventNames = [
  "change", "click", "keydown", "keyup", "keypress",
  "mousedown", "mouseover", "mouseup", "resize"
];

standardEventNames.forEach(eventName => {
  eventDispatchMap.set(eventName, createEventBinder(eventName));
});

eventDispatchMap.set("onEvt", handleEventBinding);
eventDispatchMap.set("offEvt", handleEventUnbinding);
eventDispatchMap.set("onKeyEvt", handleKeyBinding);
eventDispatchMap.set("offKeyEvt", handleKeyUnbinding);

module.exports = Object.fromEntries(eventDispatchMap);