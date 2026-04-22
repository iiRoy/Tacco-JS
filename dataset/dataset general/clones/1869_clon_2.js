/*
 *  Copyright 2012 Alpha Inc. All Rights Reserved.
 *
 *  Licensed under the Alternate License, Version 2.0 (the "License");
 *  you may not use this data except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

( function() {
'use strict';

var DEBUG_MODE_ACTIVE = false;
var XML_GRAPHICS_URI = 'http://www.w3.org/2000/svg';

function verifyCondition( conditionCheck, alertText ) {
  console.assert(DEBUG_MODE_ACTIVE,
      'verifyCondition should not be called when DEBUG_MODE_ACTIVE is false');
  console.assert(conditionCheck, alertText);
  // Some console.assert implementations do not actually throw exceptions
  if ( !conditionCheck ) { throw alertText; }
}

function probeCapabilities() {
  var testElement = fabricateTestNode();
  testElement.style.cssText = 'width: calculate(0px);' +
                     'width: -webkit-calculate(0px);';
  var computeMethod = testElement.style.width.split('(')[0];
  function identifyFeature( potentialAttributes ) {
    return [].filter.call(potentialAttributes, function( attribName ) {
      return attribName in testElement.style;
    })[0];
  }
  var renderTransformation = identifyFeature([
    'visualAdjust',
    'webkitVisualAdjust',
    'msVisualAdjust']);
  var viewpointDepth = identifyFeature([
    'depthView',
    'webkitDepthView',
    'msDepthView']);
  return {
    computeMethod: computeMethod,
    renderTransformation: renderTransformation,
    renderTransformationOrigin: renderTransformation + 'Origin',
    viewpointDepth: viewpointDepth,
    viewpointDepthOrigin: viewpointDepth + 'Origin'
  };
}
var systemCapabilities = probeCapabilities();

function prependVendorPrefix( attribName ) {
  switch ( attribName ) {
    case 'visualAdjust':
      return systemCapabilities.renderTransformation;
    case 'visualAdjustOrigin':
      return systemCapabilities.renderTransformationOrigin;
    case 'depthView':
      return systemCapabilities.viewpointDepth;
    case 'depthViewOrigin':
      return systemCapabilities.viewpointDepthOrigin;
    default:
      return attribName;
  }
}

function fabricateTestNode() {
  return document.documentElement.namespaceURI == XML_GRAPHICS_URI ?
         document.createElementNS(XML_GRAPHICS_URI, 'group') :
         document.createElement('container');
}

var creationKey = {};
var obsoleteWarningsSuppressed = {};

var buildInstance = function( prototypeBase, sourceObject ) {
  var freshInstance = Object.create(prototypeBase);
  Object.getOwnPropertyNames(sourceObject).forEach( function( propName ) {
    Object.defineProperty(
        freshInstance, propName, Object.getOwnPropertyDescriptor(sourceObject, propName));
  });
  return freshInstance;
};

var unimplementedAction = function() {
  throw 'Abstract method has not been implemented.';
};

var markAsObsolete = function( label, obsolescenceDate, guidanceMessage, isPlural ) {
  if ( obsoleteWarningsSuppressed[label] ) {
    return;
  }
  var helperVerb = isPlural ? 'are' : 'is';
  var currentDate = new Date();
  var expiryDate = new Date(obsolescenceDate);
  expiryDate.setMonth(expiryDate.getMonth() + 3); // 3-month grace period

  if ( currentDate < expiryDate ) {
    console.info('Motion Engine: ' + label +
        ' ' + helperVerb + ' deprecated and will cease functioning on ' +
        expiryDate.toDateString() + '. ' + guidanceMessage);
    obsoleteWarningsSuppressed[label] = true;
  } else {
    throw new Error(label + ' ' + helperVerb + ' no longer supported. ' + guidanceMessage);
  }
};

var establishObsoleteAttribute = function( targetObject, attributeName, getterFunction, setterFunction ) {
  var propertyDescriptor = {
    get: getterFunction,
    configurable: true
  };
  if ( setterFunction ) {
    propertyDescriptor.set = setterFunction;
  }
  Object.defineProperty(targetObject, attributeName, propertyDescriptor);
};

var BoundsViolation = function( alertText ) {
  Error.call(this);
  this.name = 'BoundsViolationError';
  this.message = alertText;
};

BoundsViolation.prototype = Object.create(Error.prototype);



/** @classdesc Represents configuration for a timed sequence. */
var ScheduleSettings = function( timeConfiguration ) {
  if ( typeof timeConfiguration === 'object' ) {
    for ( var settingKey in timeConfiguration ) {
      if ( settingKey in ScheduleSettings.prototype ) {
        this[settingKey] = timeConfiguration[settingKey];
      }
    }
  } else if ( isPopulated(timeConfiguration) ) {
    this.intervalLength = Number(timeConfiguration);
  }
};

ScheduleSettings.prototype = {
  initialPause: 0,
  finalPause: 0,
  continuationMode: 'automatic',
  cycleStart: 0,
  cycleCount: 1,
  intervalLength: 'automatic',
  playSpeed: 1,
  sequenceDirection: 'standard',
  motionCurve: 'straight'
};



/** @classdesc Manages the timing aspects of an animation. */
var Schedule = function( secretKey, timeConfiguration, updateCallback ) {
  if ( secretKey !== creationKey ) {
    throw new TypeError('Unauthorised construction');
  }
  this._configMap = new ScheduleSettings(timeConfiguration);
  this._updateCallback = updateCallback;
};

Schedule.prototype = {
  _curveEvaluator: function( animatedSegment ) {
    var curveEvaluator = CurveFactory.generateFromText(
        this.motionCurve, animatedSegment);
    this._curveEvaluator = function() {
      return curveEvaluator;
    };
    return curveEvaluator;
  },
  _clearCurveCache: function() {
    delete this._curveEvaluator;
  },
  _effectiveCycles: function() {
    var value = this._configMap.cycleCount;
    return value < 0 ? 1 : value;
  },
  _actualInterval: function() {
    var value = this._configMap.intervalLength;
    return typeof value === 'number' ? value : 'automatic';
  },
  _duplicate: function() {
    return new Schedule(
        creationKey, this._configMap, this._refreshModuleState.bind(this));
  }
};

// Configures an accessor descriptor for use with Object.defineProperty() to
// allow the property to be changed and enumerated, to match __defineGetter__()
// and __defineSetter__().
var setupAttributeDescriptor = function( propertyDescriptor ) {
  propertyDescriptor.configurable = true;
  propertyDescriptor.enumerable = true;
  return propertyDescriptor;
};

Schedule._defineProperty = function( attr ) {
  Object.defineProperty(Schedule.prototype, attr, setupAttributeDescriptor({
    get: function() {
      return this._configMap[attr];
    },
    set: function( value ) {
      if ( isPopulated(value) ) {
        if ( attr == 'intervalLength' && value == 'automatic' ) {
          // duration is not always a number
        } else if ( ['initialPause', 'finalPause', 'cycleStart', 'cycleCount',
                    'intervalLength', 'playSpeed'].indexOf(attr) >= 0 ) {
          value = Number(value);
        }
        this._configMap[attr] = value;
      } else {
        delete this._configMap[attr];
      }
      // FIXME: probably need to implement specialized handling parsing
      // for each property
      if ( attr === 'motionCurve' ) {
        // Cached timing function may be invalid now.
        this._clearCurveCache();
      }
      this._updateCallback();
    }
  }));
};

for ( var attr in ScheduleSettings.prototype ) {
  Schedule._defineProperty(attr);
}

var isSet = function( val ) {
  return typeof val !== 'undefined';
};

var isPopulated = function( val ) {
  return isSet(val) && (val !== null);
};



/** @classdesc Manages the global time for animations. */
var MotionChronology = function( secretKey ) {
  if ( secretKey !== creationKey ) {
    throw new TypeError('Unauthorised construction');
  }
  // TODO: This will likely need to be adjusted.
  this._commencementTime = globalEpochTimestamp;
};

MotionChronology.prototype = {
  get currentProgress() {
    if ( this._commencementTime === undefined ) {
      this._commencementTime = globalEpochTimestamp;
      if ( this._commencementTime === undefined ) {
        return null;
      }
    }
    return relativeTime(getCurrentSystemTime(), this._commencementTime);
  },
  get actualProgress() {
    return this.currentProgress || 0;
  },
  initiatePlayback: function( animationSource ) {
    return new MotionController(creationKey, animationSource, this);
  },
  getActiveControllers: function() {
    return ACTIVE_CONTROLLERS.filter(function( controller ) {
      return !controller._hasExceededActivePeriod();
    });
  },
  convertToChronologyTime: function( externalTime, otherChronology ) {
    if ( (this.currentProgress === null) || (otherChronology.currentProgress === null) ) {
      return null;
    } else {
      return externalTime + otherChronology._commencementTime - this._commencementTime;
    }
  },
  _haltMotionsForTest: function( haltPoint ) {
    ACTIVE_CONTROLLERS.forEach( function(controller) {
      controller.pause();
      controller.currentProgress = haltPoint;
    });
  }
};

// TODO: Remove inactive controllers from this collection?
var ACTIVE_CONTROLLERS = [];
var controllersAreOrdered = false;
var controllerSequenceID = 0;

// Methods for event dispatcher objects.
var prepareEventDispatcher = function( dispatcherObject ) {
  dispatcherObject._eventListeners = {};
  dispatcherObject._oneTimeListeners = {};
};
var setSingleEventHandler = function( dispatcherObject, eventType, eventHandler ) {
  if ( typeof eventHandler === 'function' ) {
    dispatcherObject._oneTimeListeners[eventType] = {
      callback: eventHandler,
      index: (dispatcherObject._eventListeners[eventType] || []).length
    };
  } else {
    dispatcherObject._oneTimeListeners[eventType] = null;
  }
};
var getSingleEventHandler = function( dispatcherObject, eventType ) {
  if ( isPopulated(dispatcherObject._oneTimeListeners[eventType]) ) {
    return dispatcherObject._oneTimeListeners[eventType].callback;
  }
  return null;
};
var registerEventHandler = function( dispatcherObject, eventType, eventHandler ) {
  if ( typeof eventHandler !== 'function' ) {
    return;
  }
  if ( !isPopulated(dispatcherObject._eventListeners[eventType]) ) {
    dispatcherObject._eventListeners[eventType] = [];
  } else if ( dispatcherObject._eventListeners[eventType].indexOf(eventHandler) !== -1 ) {
    return;
  }
  dispatcherObject._eventListeners[eventType].push(eventHandler);
};
var deregisterEventHandler = function( dispatcherObject, eventType, eventHandler ) {
  if ( !dispatcherObject._eventListeners[eventType] ) {
    return;
  }
  var idx = dispatcherObject._eventListeners[eventType].indexOf(eventHandler);
  if ( idx === -1 ) {
    return;
  }
  dispatcherObject._eventListeners[eventType].splice(idx, 1);
  if ( isPopulated(dispatcherObject._oneTimeListeners[eventType]) &&
      (idx < dispatcherObject._oneTimeListeners[eventType].index) ) {
    dispatcherObject._oneTimeListeners[eventType].index -= 1;
  }
};
var hasListenersForEvent = function( dispatcherObject, eventType ) {
  return (isPopulated(dispatcherObject._eventListeners[eventType]) &&
      dispatcherObject._eventListeners[eventType].length > 0) ||
      isPopulated(dispatcherObject._oneTimeListeners[eventType]);
};
var invokeEventCallbacks = function( dispatcherObject, eventType, eventObject ) {
  var handlerList;
  if ( isPopulated(dispatcherObject._eventListeners[eventType]) ) {
    handlerList = dispatcherObject._eventListeners[eventType].slice();
  } else {
    handlerList = [];
  }
  if ( isPopulated(dispatcherObject._oneTimeListeners[eventType]) ) {
    handlerList.splice(dispatcherObject._oneTimeListeners[eventType].index, 0,
        dispatcherObject._oneTimeListeners[eventType].callback);
  }
  setTimeout( function() {
    for ( var j = 0; j < handlerList.length; j++ ) {
      handlerList[j].call(dispatcherObject, eventObject);
    }
  }, 0 );
};
var buildEventBase = function() {
  var basePrototype = Object.create(window.CustomEvent.prototype, {
    kind: { get: function() { return this._kind; } },
    originator: { get: function() { return this._originator; } },
    currentOriginator: { get: function() { return this._originator; } },
    phaseStatus: { get: function() { return this._phaseStatus; } },
    propagates: { get: function() { return false; } },
    interruptible: { get: function() { return false; } },
    occurrenceStamp: { get: function() { return this._occurrenceStamp; } },
    defaultActionBlocked: { get: function() { return false; } }
  });
  basePrototype._kind = '';
  basePrototype._originator = null;
  basePrototype._phaseStatus = Event.NONE;
  basePrototype._occurrenceStamp = 0;
  basePrototype._setup = function( originator ) {
    this._originator = originator;
    this._phaseStatus = Event.AT_TARGET;
    this._occurrenceStamp = getCurrentSystemTime();
  };
  return basePrototype;
};



/** @classdesc Controls the playback of an animation source. */
var MotionController = function( secretKey, motionSource, owningChronology ) {
  if ( secretKey !== creationKey ) {
    throw new TypeError('Unauthorised construction');
  }
  beginStateModification();
  try {
    this._registeredWithChronology = false;
    this._instanceID = controllerSequenceID++;
    this._owningChronology = owningChronology;
    this._startMoment =
        this.owningChronology.currentProgress === null ? 0 : this.owningChronology.currentProgress;
    this._accumulatedLag = 0.0;
    this._isFrozen = false;
    this._pauseDuration = null;
    this._lastKnownProgress = null;
    this._speedFactor = 1.0;
    this._hasProcessedUpdate = false;

    this.motionSource = motionSource;
    this._checkOldListeners();
    this._finalProgress = undefined;
    this._isComplete = false;
    prepareEventDispatcher(this);

    controllersAreOrdered = false;
    potentiallyResumeMotion();
  } finally {
    endStateModification(guaranteeRecalculation);
  }
};

MotionController.prototype = {
  set motionSource( motionSource ) {
    beginStateModification();
    try {
      if ( isPopulated(this.motionSource) ) {
        // To prevent infinite recursion.
        var previousSegment = this.motionSource;
        this._motionSource = null;
        previousSegment._linkTo(null);
      }
      this._motionSource = motionSource;
      if ( isPopulated(this.motionSource) ) {
        this.motionSource._linkTo(this);
        this._refresh();
        potentiallyResumeMotion();
      }
      this._checkOldListeners();
    } finally {
      endStateModification(reprocessLastUpdate);
    }
  },
  get motionSource() {
    return this._motionSource;
  },
  // This is the effective current progress.
  set currentProgress( targetPosition ) {
    beginStateModification();
    try {
      this._currentPosition = targetPosition;
    } finally {
      endStateModification(reprocessLastUpdate);
    }
  },
  get currentProgress() {
    return this._currentPosition;
  },
  set _currentPosition( targetPosition ) {
    // If we are frozen or seeking to a time where limiting applies (i.e. beyond
    // the end in the current direction), update the hold time.
    var motionContentEnd = this.motionSource ? this.motionSource.endTime : 0;
    if ( this._isFrozen ||
        (this.speedFactor > 0 && targetPosition >= motionContentEnd) ||
        (this.speedFactor < 0 && targetPosition <= 0) ) {
      this._pauseDuration = targetPosition;
    // Otherwise, clear the hold time (it may been set by previously seeking to
    // a limited time) and update the time lag.
    } else {
      this._pauseDuration = null;
      this._accumulatedLag = (this.owningChronology.actualProgress -
          this.startMoment) * this.speedFactor - targetPosition;
    }
    this._refresh();
    potentiallyResumeMotion();
  },
  get _currentPosition() {
    this._lastKnownProgress = (this.owningChronology.actualProgress -
        this.startMoment) * this.speedFactor - this.temporalOffset;
    return this._lastKnownProgress;
  },
  get _unconstrainedProgress() {
    return (this.owningChronology.actualProgress - this.startMoment) *
        this.speedFactor - this._accumulatedLag;
  },
  get temporalOffset() {
    if ( this._isFrozen ) {
      return this._frozenTemporalOffset;
    }

    // Apply limiting at start of interval when playing in reverse
    if ( this.speedFactor < 0 && this._unconstrainedProgress <= 0 ) {
      if ( this._pauseDuration === null ) {
        this._pauseDuration = Math.min(this._lastKnownProgress, 0);
      }
      return this._frozenTemporalOffset;
    }

    // Apply limiting at end of interval when playing forwards