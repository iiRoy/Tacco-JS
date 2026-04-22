/*
 * This is a Type I clone of the original JavaScript code.
 *
 * The following license applies to the original work, and thus to this derived work:
 *
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This version features extensive modifications to whitespace and comments
 * while preserving the exact logical and structural identity of the code.
 * No identifiers, operators, or expressions have been altered.
 */

( function ( ) {
'use strict' ;


var ASSERT_ENABLED = false ; // Flag to control assertion behavior
var SVG_NS = 'http://www.w3.org/2000/svg' ; // Namespace for SVG elements


function assert( check , message )
{
  // Only call console.assert if assertions are enabled.
  console . assert ( ASSERT_ENABLED ,
      'assert should not be called when ASSERT_ENABLED is false' ) ;
  console . assert ( check , message ) ;
  // Some console.assert implementations might not throw errors,
  // so we add an explicit throw for consistency.
  if ( ! check )
  {
    throw message ;
  }
}


function detectFeatures ( )
{
  var el = createDummyElement ( ) ; // Create a temporary element for feature detection
  el . style . cssText = 'width: calc(0px);' +
                     'width: -webkit-calc(0px);' ;
  var calcFunction = el . style . width . split ( '(' ) [ 0 ] ; // Extract the calc function prefix

  function detectProperty( candidateProperties )
  {
    return [ ] . filter . call ( candidateProperties , function( property ) {
      return property in el . style ;
    } ) [ 0 ] ; // Return the first supported property
  }

  var transformProperty = detectProperty ( [
    'transform' ,
    'webkitTransform' ,
    'msTransform' ] ) ; // Detect CSS transform property

  var perspectiveProperty = detectProperty ( [
    'perspective' ,
    'webkitPerspective' ,
    'msPerspective' ] ) ; // Detect CSS perspective property

  // Return an object containing detected feature names
  return {
    calcFunction : calcFunction ,
    transformProperty : transformProperty ,
    transformOriginProperty : transformProperty + 'Origin' ,
    perspectiveProperty : perspectiveProperty ,
    perspectiveOriginProperty : perspectiveProperty + 'Origin'
  } ;
}

var features = detectFeatures ( ) ; // Store the detected features globally


function prefixProperty ( property )
{
  // Add vendor prefixes for specific CSS properties if needed
  switch ( property )
  {
    case 'transform' :
      return features . transformProperty ;
    case 'transformOrigin' :
      return features . transformOriginProperty ;
    case 'perspective' :
      return features . perspectiveProperty ;
    case 'perspectiveOrigin' :
      return features . perspectiveOriginProperty ;
    default :
      return property ;
  }
}


function createDummyElement ( )
{
  // Create a dummy element, either SVG or HTML div, depending on namespace
  return document . documentElement . namespaceURI == SVG_NS ?
         document . createElementNS ( SVG_NS , 'g' ) :
         document . createElement ( 'div' ) ;
}


var constructorToken = { } ; // A unique token to prevent direct instantiation of certain classes
var deprecationsSilenced = { } ; // Keeps track of silenced deprecation warnings


var createObject = function ( proto , obj )
{
  var newObject = Object . create ( proto ) ; // Create a new object with the specified prototype
  Object . getOwnPropertyNames ( obj ) . forEach ( function ( name )
  {
    // Copy all own property descriptors from obj to newObject
    Object . defineProperty (
        newObject , name , Object . getOwnPropertyDescriptor ( obj , name ) ) ;
  } ) ;
  return newObject ;
} ;


var abstractMethod = function ( )
{
  throw 'Abstract method not implemented.' ; // Placeholder for methods that must be overridden
} ;


var deprecated = function ( name , deprecationDate , advice , plural )
{
  // Handle deprecation warnings and errors based on date
  if ( deprecationsSilenced [ name ] )
  {
    return ;
  }
  var auxVerb = plural ? 'are' : 'is' ;
  var today = new Date ( ) ;
  var cutoffDate = new Date ( deprecationDate ) ;
  cutoffDate . setMonth ( cutoffDate . getMonth ( ) + 3 ) ; // Add a 3-month grace period

  if ( today < cutoffDate )
  {
    console . warn ( 'Web Animations: ' + name +
        ' ' + auxVerb + ' deprecated and will stop working on ' +
        cutoffDate . toDateString ( ) + '. ' + advice ) ;
    deprecationsSilenced [ name ] = true ; // Silence future warnings for this item
  }
  else
  {
    throw new Error ( name + ' ' + auxVerb + ' no longer supported. ' + advice ) ;
  }
} ;


var defineDeprecatedProperty = function ( object , property , getFunc , setFunc )
{
  var descriptor = {
    get : getFunc ,
    configurable : true
  } ;
  if ( setFunc )
  {
    descriptor . set = setFunc ;
  }
  Object . defineProperty ( object , property , descriptor ) ;
} ;


var IndexSizeError = function ( message )
{
  Error . call ( this ) ;
  this . name = 'IndexSizeError' ;
  this . message = message ;
} ;

IndexSizeError . prototype = Object . create ( Error . prototype ) ; // Inherit from Error.prototype


/**
 * @constructor
 * Represents a dictionary of timing properties.
 */
var TimingDict = function ( timingInput )
{
  // Initialize TimingDict from an object or a number (duration)
  if ( typeof timingInput === 'object' )
  {
    for ( var k in timingInput )
    {
      if ( k in TimingDict . prototype )
      {
        this [ k ] = timingInput [ k ] ;
      }
    }
  }
  else if ( isDefinedAndNotNull ( timingInput ) )
  {
    this . duration = Number ( timingInput ) ;
  }
} ;

TimingDict . prototype = {
  delay : 0 ,
  endDelay : 0 ,
  fill : 'auto' ,
  iterationStart : 0 ,
  iterations : 1 ,
  duration : 'auto' ,
  playbackRate : 1 ,
  direction : 'normal' ,
  easing : 'linear'
} ;


/**
 * @constructor
 * Represents the timing properties of an animation.
 */
var Timing = function ( token , timingInput , changeHandler )
{
  if ( token !== constructorToken )
  {
    throw new TypeError ( 'Illegal constructor' ) ;
  }
  this . _dict = new TimingDict ( timingInput ) ; // Internal dictionary for timing values
  this . _changeHandler = changeHandler ; // Callback for when timing properties change
} ;

Timing . prototype = {
  _timingFunction : function ( timedItem )
  {
    var timingFunction = TimingFunction . createFromString (
        this . easing , timedItem ) ;
    this . _timingFunction = function ( )
    {
      return timingFunction ;
    } ;
    return timingFunction ;
  } ,
  _invalidateTimingFunction : function ( )
  {
    delete this . _timingFunction ; // Clear cached timing function
  } ,
  _iterations : function ( )
  {
    var value = this . _dict . iterations ;
    return value < 0 ? 1 : value ; // Ensure iterations is non-negative
  } ,
  _duration : function ( )
  {
    var value = this . _dict . duration ;
    return typeof value === 'number' ? value : 'auto' ; // Return duration or 'auto'
  } ,
  _clone : function ( )
  {
    // Create a clone of the Timing object
    return new Timing (
        constructorToken , this . _dict , this . _updateInternalState . bind ( this ) ) ;
  }
} ;

// Configures an accessor descriptor for use with Object.defineProperty() to
// allow the property to be changed and enumerated, to match __defineGetter__()
// and __defineSetter__().
var configureDescriptor = function ( descriptor )
{
  descriptor . configurable = true ;
  descriptor . enumerable = true ;
  return descriptor ;
} ;

Timing . _defineProperty = function ( prop )
{
  Object . defineProperty ( Timing . prototype , prop , configureDescriptor ( {
    get : function ( )
    {
      return this . _dict [ prop ] ;
    } ,
    set : function ( value )
    {
      if ( isDefinedAndNotNull ( value ) )
      {
        if ( prop == 'duration' && value == 'auto' )
        {
          // duration is not always a number, 'auto' is a valid value
        }
        else if ( [ 'delay' , 'endDelay' , 'iterationStart' , 'iterations' ,
                    'duration' , 'playbackRate' ] . indexOf ( prop ) >= 0 )
        {
          value = Number ( value ) ; // Coerce to number for numeric properties
        }
        this . _dict [ prop ] = value ;
      }
      else
      {
        delete this . _dict [ prop ] ; // Remove property if value is null/undefined
      }
      // FIXME: probably need to implement specialized handling parsing
      // for each property
      if ( prop === 'easing' )
      {
        // Cached timing function may be invalid now and needs to be recomputed.
        this . _invalidateTimingFunction ( ) ;
      }
      this . _changeHandler ( ) ; // Notify change handler
    }
  } ) ) ;
} ;

// Define accessors for all properties in TimingDict.prototype on Timing.prototype
for ( var prop in TimingDict . prototype )
{
  Timing . _defineProperty ( prop ) ;
}


var isDefined = function ( val )
{
  return typeof val !== 'undefined' ;
} ;

var isDefinedAndNotNull = function ( val )
{
  return isDefined ( val ) && ( val !== null ) ;
} ;


/**
 * @constructor
 * Represents an animation timeline.
 */
var AnimationTimeline = function ( token )
{
  if ( token !== constructorToken )
  {
    throw new TypeError ( 'Illegal constructor' ) ;
  }
  // TODO: This will probably need to change.
  this . _startTime = documentTimeZeroAsClockTime ; // The timeline's start time
} ;

AnimationTimeline . prototype = {
  get currentTime ( )
  {
    if ( this . _startTime === undefined )
    {
      this . _startTime = documentTimeZeroAsClockTime ;
      if ( this . _startTime === undefined )
      {
        return null ;
      }
    }
    return relativeTime ( cachedClockTime ( ) , this . _startTime ) ;
  } ,
  get effectiveCurrentTime ( )
  {
    return this . currentTime || 0 ; // Return current time or 0 if null
  } ,
  play : function ( source )
  {
    return new AnimationPlayer ( constructorToken , source , this ) ; // Create and return a new AnimationPlayer
  } ,
  getCurrentPlayers : function ( )
  {
    return PLAYERS . filter ( function ( player )
    {
      return ! player . _isPastEndOfActiveInterval ( ) ; // Filter out finished players
    } ) ;
  } ,
  toTimelineTime : function ( otherTime , other )
  {
    if ( ( this . currentTime === null ) || ( other . currentTime === null ) )
    {
      return null ;
    }
    else
    {
      return otherTime + other . _startTime - this . _startTime ; // Convert time between timelines
    }
  } ,
  _pauseAnimationsForTesting : function ( pauseAt )
  {
    PLAYERS . forEach ( function ( player )
    {
      player . pause ( ) ;
      player . currentTime = pauseAt ;
    } ) ;
  }
} ;

// TODO: Remove dead players from here?
var PLAYERS = [ ] ; // Global list of all active animation players
var playersAreSorted = false ;
var playerSequenceNumber = 0 ; // Used to assign unique sequence numbers to players


// Methods for event target objects.
var initializeEventTarget = function ( eventTarget )
{
  eventTarget . _handlers = { } ; // Store general event handlers
  eventTarget . _onHandlers = { } ; // Store 'on'-style event handlers (e.g., onclick)
} ;
var setOnEventHandler = function ( eventTarget , type , handler )
{
  if ( typeof handler === 'function' )
  {
    eventTarget . _onHandlers [ type ] = {
      callback : handler ,
      index : ( eventTarget . _handlers [ type ] || [ ] ) . length
    } ;
  }
  else
  {
    eventTarget . _onHandlers [ type ] = null ; // Clear handler if not a function
  }
} ;
var getOnEventHandler = function ( eventTarget , type )
{
  if ( isDefinedAndNotNull ( eventTarget . _onHandlers [ type ] ) )
  {
    return eventTarget . _onHandlers [ type ] . callback ;
  }
  return null ;
} ;
var addEventHandler = function ( eventTarget , type , handler )
{
  if ( typeof handler !== 'function' )
  {
    return ;
  }
  if ( ! isDefinedAndNotNull ( eventTarget . _handlers [ type ] ) )
  {
    eventTarget . _handlers [ type ] = [ ] ;
  }
  else if ( eventTarget . _handlers [ type ] . indexOf ( handler ) !== -1 )
  {
    return ; // Avoid adding duplicate handlers
  }
  eventTarget . _handlers [ type ] . push ( handler ) ;
} ;
var removeEventHandler = function ( eventTarget , type , handler )
{
  if ( ! eventTarget . _handlers [ type ] )
  {
    return ;
  }
  var index = eventTarget . _handlers [ type ] . indexOf ( handler ) ;
  if ( index === -1 )
  {
    return ; // Handler not found
  }
  eventTarget . _handlers [ type ] . splice ( index , 1 ) ; // Remove handler
  if ( isDefinedAndNotNull ( eventTarget . _onHandlers [ type ] ) &&
      ( index < eventTarget . _onHandlers [ type ] . index ) )
  {
    eventTarget . _onHandlers [ type ] . index -= 1 ; // Adjust index if an 'on' handler was affected
  }
} ;
var hasEventHandlersForEvent = function ( eventTarget , type )
{
  return ( isDefinedAndNotNull ( eventTarget . _handlers [ type ] ) &&
      eventTarget . _handlers [ type ] . length > 0 ) ||
      isDefinedAndNotNull ( eventTarget . _onHandlers [ type ] ) ;
} ;
var callEventHandlers = function ( eventTarget , type , event )
{
  var callbackList ;
  if ( isDefinedAndNotNull ( eventTarget . _handlers [ type ] ) )
  {
    callbackList = eventTarget . _handlers [ type ] . slice ( ) ; // Copy to avoid issues if handlers modify the list
  }
  else
  {
    callbackList = [ ] ;
  }
  if ( isDefinedAndNotNull ( eventTarget . _onHandlers [ type ] ) )
  {
    callbackList . splice ( eventTarget . _onHandlers [ type ] . index , 0 ,
        eventTarget . _onHandlers [ type ] . callback ) ; // Insert 'on' handler at its original position
  }
  setTimeout ( function ( )
  {
    for ( var i = 0 ; i < callbackList . length ; i ++ )
    {
      callbackList [ i ] . call ( eventTarget , event ) ; // Call each handler
    }
  } , 0 ) ;
} ;
var createEventPrototype = function ( )
{
  var prototype = Object . create ( window . Event . prototype , {
    type : { get : function ( ) { return this . _type ; } } ,
    target : { get : function ( ) { return this . _target ; } } ,
    currentTarget : { get : function ( ) { return this . _target ; } } ,
    eventPhase : { get : function ( ) { return this . _eventPhase ; } } ,
    bubbles : { get : function ( ) { return false ; } } ,
    cancelable : { get : function ( ) { return false ; } } ,
    timeStamp : { get : function ( ) { return this . _timeStamp ; } } ,
    defaultPrevented : { get : function ( ) { return false ; } }
  } ) ;
  prototype . _type = '' ;
  prototype . _target = null ;
  prototype . _eventPhase = Event . NONE ;
  prototype . _timeStamp = 0 ;
  prototype . _initialize = function ( target )
  {
    this . _target = target ;
    this . _eventPhase = Event . AT_TARGET ;
    this . _timeStamp = cachedClockTime ( ) ;
  } ;
  return prototype ;
} ;


/**
 * @constructor
 * Represents an animation player that controls the playback of an animation source.
 */
var AnimationPlayer = function ( token , source , timeline )
{
  if ( token !== constructorToken )
  {
    throw new TypeError ( 'Illegal constructor' ) ;
  }
  enterModifyCurrentAnimationState ( ) ;
  try
  {
    this . _registeredOnTimeline = false ;
    this . _sequenceNumber = playerSequenceNumber ++ ;
    this . _timeline = timeline ;
    this . _startTime =
        this . timeline . currentTime === null ? 0 : this . timeline . currentTime ;
    this . _storedTimeLag = 0.0 ;
    this . _pausedState = false ;
    this . _holdTime = null ;
    this . _previousCurrentTime = null ;
    this . _playbackRate = 1.0 ;
    this . _hasTicked = false ;

    this . source = source ; // Set the animation source
    this . _checkForLegacyHandlers ( ) ;
    this . _lastCurrentTime = undefined ;
    this . _finishedFlag = false ;
    initializeEventTarget ( this ) ; // Initialize event handling for the player

    playersAreSorted = false ;
    maybeRestartAnimation ( ) ; // Potentially restart animation processing
  }
  finally
  {
    exitModifyCurrentAnimationState ( ensureRetickBeforeGetComputedStyle ) ;
  }
} ;

AnimationPlayer . prototype = {
  set source ( source )
  {
    enterModifyCurrentAnimationState ( ) ;
    try
    {
      if ( isDefinedAndNotNull ( this . source ) )
      {
        // To prevent infinite recursion when detaching.
        var oldTimedItem = this . source ;
        this . _source = null ;
        oldTimedItem . _attach ( null ) ; // Detach old source
      }
      this . _source = source ;
      if ( isDefinedAndNotNull ( this . source ) )
      {
        this . source . _attach ( this ) ; // Attach new source
        this . _update ( ) ;
        maybeRestartAnimation ( ) ;
      }
      this . _checkForLegacyHandlers ( ) ;
    }
    finally
    {
      exitModifyCurrentAnimationState ( repeatLastTick ) ;
    }
  } ,
  get source ( )
  {
    return this . _source ;
  } ,
  // This is the effective current time.
  set currentTime ( currentTime )
  {
    enterModifyCurrentAnimationState ( ) ;
    try
    {
      this . _currentTime = currentTime ;
    }
    finally
    {
      exitModifyCurrentAnimationState ( repeatLastTick ) ;
    }
  } ,
  get currentTime ( )
  {
    return this . _currentTime ;
  } ,
  set _currentTime ( seekTime )
  {
    // If we are paused or seeking to a time where limiting applies (i.e. beyond
    // the end in the current direction), update the hold time.
    var sourceContentEnd = this . source ? this . source . endTime : 0 ;
    if ( this . paused ||
        ( this . playbackRate > 0 && seekTime >= sourceContentEnd ) ||
        ( this . playbackRate < 0 && seekTime <= 0 ) )
    {
      this . _holdTime = seekTime ;
    // Otherwise, clear the hold time (it may been set by previously seeking to
    // a limited time) and update the time lag.
    }
    else
    {
      this . _holdTime = null ;
      this . _storedTimeLag = ( this . timeline . effectiveCurrentTime -
          this . startTime ) * this . playbackRate - seekTime ;
    }
    this . _update ( ) ;
    maybeRestartAnimation ( ) ;
  } ,
  get _currentTime ( )
  {
    this . _previousCurrentTime = ( this . timeline . effectiveCurrentTime -
        this . startTime ) * this . playbackRate - this . timeLag ;
    return this . _previousCurrentTime ;
  } ,
  get _unlimitedCurrentTime ( )
  {
    return ( this . timeline . effectiveCurrentTime - this . startTime ) *
        this . playbackRate - this . _storedTimeLag ;
  } ,
  get timeLag ( )
  {
    if ( this . paused )
    {
      return this . _pauseTimeLag ;
    }

    // Apply limiting at start of interval when playing in reverse
    if ( this . playbackRate < 0 && this . _unlimitedCurrentTime <= 0 )
    {
      if ( this . _holdTime === null )
      {
        this . _holdTime = Math . min ( this . _previousCurrentTime , 0 ) ;
      }
      return this . _pauseTimeLag ;
    }

    // Apply limiting at end of interval when playing forwards