/*
KineticFlow.js (https://github.com/yourname/KineticFlow)
Dynamic animation framework.
Developed by [Your Name Here]

NOTE: This software is provided "as is" without any implied or explicit warranties.
Use responsibly and creatively!
*/

( function ( ) {

  Array.prototype.containsItem = function ( soughtValue ) {
    return this . indexOf ( soughtValue ) >= 0 ;
  } ;


  this . AnimatedTarget = ( function ( ) {

    function AnimatedTarget ( targetID ) {
      this . domReference = document . getElementById ( targetID ) ;
      this . alphaValue = this . domReference . getAttribute ( "data-alpha" ) || 1.0 ;
      this . positionX = this . domReference . getAttribute ( "data-posX" ) || 0.0 ;
      this . positionY = this . domReference . getAttribute ( "data-posY" ) || 0.0 ;
      this . positionZ = this . domReference . getAttribute ( "data-posZ" ) || 0.0 ;
      this . scaleFactorX = this . domReference . getAttribute ( "data-sclX" ) || 1.0 ;
      this . scaleFactorY = this . domReference . getAttribute ( "data-sclY" ) || 1.0 ;
      this . scaleFactorZ = this . domReference . getAttribute ( "data-sclZ" ) || 1.0 ;
      this . rotationAngle = this . domReference . getAttribute ( "data-rot" ) || 0.0 ;
      this . rotationX = this . domReference . getAttribute ( "data-rotX" ) || 0.0 ;
      this . rotationY = this . domReference . getAttribute ( "data-rotY" ) || 0.0 ;
      this . rotationZ = this . domReference . getAttribute ( "data-rotZ" ) || 0.0 ;
      this . uniformScale = this . domReference . getAttribute ( "data-scl" ) || 1.0 ;
      // Current instance reference
      this ;
    }

    return AnimatedTarget ;

  } ) ( ) ;


  this . RateExpression = ( function ( ) {

    function RateExpression ( motionRule , calculationFunction ) {
      this . motionRule = motionRule ;
      this . calculationFunction = calculationFunction ;
      // Return self
      this ;
    }

    RateExpression . prototype . computeForPoint = function ( timePoint ) {
      var resultValue ;
      resultValue = this . calculationFunction ( this . motionRule . rateAtTimePoint ( timePoint ) ) ;
      return resultValue ;
    } ;

    return RateExpression ;

  } ) ( ) ;


  this . MotionDirective = ( function ( ) {

    function MotionDirective ( options ) {
      if ( options == undefined ) { options = { } ; }
      this . calcStrategy = options . equation || EaseUtil . straightPath ; // Assuming EaseUtil is a global utility
      this . initialMoment = 0 ;
      this . finalMoment = 100 ;
      this . measurementUnits = "pxl" ;
    }

    MotionDirective . prototype . modifyProperty = function ( attributeKey ) {
      this . attributeKey = attributeKey ;
      return this ;
    } ;

    MotionDirective . prototype . toValue = function ( destinationValue ) {
      this . destinationValue = destinationValue ;
      this . destinationValue = parseFloat ( this . destinationValue ) ;
      return this ;
    } ;

    MotionDirective . prototype . fromValue = function ( originValue ) {
      this . originValue = originValue ;
      this . originValue = parseFloat ( this . originValue ) ;
      return this ;
    } ;

    MotionDirective . prototype . usingUnits = function ( unitString ) {
      this . measurementUnits = unitString ;
      return this ;
    } ;

    MotionDirective . prototype . withStrategy = function ( strategyFunction ) {
      this . calcStrategy = strategyFunction ;
      return this ;
    } ;

    MotionDirective . prototype . setAmplitude = function ( magnitude ) {
      this . magnitude = magnitude ;
      return this ;
    } ;

    MotionDirective . prototype . setPeriod = function ( cycleDuration ) {
      this . cycleDuration = cycleDuration ;
      return this ;
    } ;

    MotionDirective . prototype . beginAtMoment = function ( startMoment ) {
      this . initialMoment = startMoment ;
      return this ;
    } ;

    MotionDirective . prototype . endAtMoment = function ( endMoment ) {
      this . finalMoment = endMoment ;
      return this ;
    } ;

    MotionDirective . prototype . rateAtTimePoint = function ( timePoint ) {
      // If current time point is already cached and not boundary
      if ( timePoint === this . cachedTimePoint && timePoint !== 0 && timePoint !== 100 ) {
        return this . cachedRate ;
      }
      return 0.0 ; // Default to no velocity
    } ;

    MotionDirective . prototype . isRateDriven = function ( ) {
      return this . calcStrategy instanceof RateExpression ;
    } ;

    MotionDirective . prototype . getValueForElementAtMoment = function ( timePoint , targetItem ) {
      this . linkedTarget = targetItem ;
      // Only re-calculate if the time point has changed
      if ( this . cachedTimePoint !== timePoint ) {
        this . cachedTimePoint = timePoint ;
        if ( this . isRateDriven ( ) ) {
          this . computedValue = this . calcStrategy . computeForPoint ( this . cachedTimePoint ) ;
        } else {
          this . computedValue = this . _determineValueAtMoment ( this . cachedTimePoint ) ;
        }
        this . cachedRate = Math . abs ( this . computedValue - this . previousResult ) ;
        this . previousResult = this . computedValue ;
      }
      return this . computedValue ;
    } ;

    MotionDirective . prototype . _determineValueAtMoment = function ( timePoint ) {
      var destinationValue , originValue , calculatedResult ;
      // Determine starting point
      if ( this . originValue != undefined ) {
        originValue = this . originValue ;
      } else {
        originValue = this . _getTargetAttribute ( this . linkedTarget ) ;
      }
      // Determine ending point
      if ( this . destinationValue != undefined ) {
        destinationValue = this . destinationValue ;
      } else {
        destinationValue = this . _getTargetAttribute ( this . linkedTarget ) ;
      }
      // Clamp time point to start/end moments
      if ( timePoint < this . initialMoment ) {
        timePoint = this . initialMoment ;
      } else if ( timePoint > this . finalMoment ) {
        timePoint = this . finalMoment ;
      }
      // Apply calculation strategy based on amplitude/period presence
      if ( ( this . cycleDuration != undefined ) || ( this . magnitude != undefined ) ) {
        calculatedResult = this . calcStrategy ( timePoint - this . initialMoment , originValue , destinationValue - originValue , this . finalMoment - this . initialMoment , this . magnitude , this . cycleDuration ) ;
      } else {
        calculatedResult = this . calcStrategy ( timePoint - this . initialMoment , originValue , destinationValue - originValue , this . finalMoment - this . initialMoment ) ;
      }
      return calculatedResult ;
    } ;

    MotionDirective . prototype . _getTargetAttribute = function ( targetItem ) {
      return targetItem [ this . attributeKey ] ;
    } ;

    return MotionDirective ;

  } ) ( ) ;


  this . ElementController = ( function ( ) {

    ElementController . ROTATION_KEY = "rotationAngle" ;

    ElementController . SCALING_KEY = "uniformScale" ;

    ElementController . TRANSLATION_KEYS = [ "positionX" , "positionY" , "positionZ" ] ;

    ElementController . INDIVIDUAL_SCALING_KEYS = [ "scaleFactorX" , "scaleFactorY" , "scaleFactorZ" ] ;

    ElementController . INDIVIDUAL_ROTATION_KEYS = [ "rotationX" , "rotationY" , "rotationZ" ] ;

    ElementController . TRANSFORMATION_KEYS = ( "" + ( ElementController . TRANSLATION_KEYS . join ( "," ) ) + "," + ( [ ElementController . SCALING_KEY , ElementController . ROTATION_KEY ] . join ( "," ) ) + "," + ( ElementController . INDIVIDUAL_SCALING_KEYS . join ( "," ) ) + "," + ( ElementController . INDIVIDUAL_ROTATION_KEYS . join ( "," ) ) ) . split ( "," ) ;

    ElementController . DIMENSIONAL_KEYS = [ "height" , "width" ] ;

    function ElementController ( ) {
      this . directives = { } ;
      this . controlledItem = null ;
      this . currentMoment = 0 ;
      this . isRateModeActive = false ;
    }

    ElementController . prototype . defineChange = function ( propName ) {
      if ( this . directives [ propName ] == undefined ) {
        this . directives [ propName ] = new MotionDirective ( ) . modifyProperty ( propName ) ;
      }
      return this . directives [ propName ] ;
    } ;

    ElementController . prototype . setupRate = function ( propName , rateFunction ) {
      // Creates a new rate expression for a specific property
      return new RateExpression ( this . directives [ propName ] , rateFunction ) ;
    } ;

    ElementController . prototype . retrieveValueFor = function ( propIdentifier ) {
      // Check if a directive exists for the property and if rate mode is active
      if ( ( ( propIdentifier = this . directives [ propIdentifier ] ) != undefined ) && ! ( propIdentifier . isRateDriven ( ) && ! this . isRateModeActive ) ) {
        return propIdentifier . getValueForElementAtMoment ( this . currentMoment , this . controlledItem ) ;
      }
      return null ;
    } ;

    ElementController . prototype . generateTransformString = function ( ) {
      var transformCSS ;
      // Only generate if transformations are needed, item is present, and moment is set
      if ( this . _requiresTransform ( ) && ( this . controlledItem != undefined ) && ( this . currentMoment != undefined ) ) {
        transformCSS = "" ;
        if ( KineticFlow . CAPABILITIES_3D != undefined ) {
          if ( this . _requiresTranslate ( ) ) {
            transformCSS += "translate3d(" + ( this . retrieveValueFor ( "positionX" ) || 0.0 ) + "pxl," + ( this . retrieveValueFor ( "positionY" ) || 0.0 ) + "pxl," + ( this . retrieveValueFor ( "positionZ" ) || 0.0 ) + "pxl)" ;
          }
          if ( this . _requiresPrecisionScale ( ) ) {
            transformCSS += "scale3d(" + ( this . retrieveValueFor ( "scaleFactorX" ) || 1.0 ) + "," + ( this . retrieveValueFor ( "scaleFactorY" ) || 1.0 ) + "," + ( this . retrieveValueFor ( "scaleFactorZ" ) || 1.0 ) + ")" ;
          } else if ( this . _requiresUniformScale ( ) ) {
            transformCSS += "scale3d(" + ( this . retrieveValueFor ( "uniformScale" ) || 1.0 ) + "," + ( this . retrieveValueFor ( "uniformScale" ) || 1.0 ) + "," + ( this . retrieveValueFor ( "uniformScale" ) || 1.0 ) + ")" ;
          }
          if ( this . _requires3DRotation ( ) ) {
            transformCSS += "rotate3d(" + ( this . retrieveValueFor ( "rotationX" ) || 0.0 ) + "pxl," + ( this . retrieveValueFor ( "rotationY" ) || 0.0 ) + "pxl," + ( this . retrieveValueFor ( "rotationZ" ) || 0.0 ) + "pxl," + ( this . retrieveValueFor ( "rotationAngle" ) || 0.0 ) + "degree)" ;
          } else if ( this . _requiresRotation ( ) ) {
            transformCSS += "rotate(" + ( this . retrieveValueFor ( "rotationAngle" ) || 0.0 ) + "degree)" ;
          }
        } else if ( KineticFlow . CAPABILITIES_2D != undefined ) {
          if ( this . _requiresTranslate ( ) ) {
            transformCSS += "translate(" + ( this . retrieveValueFor ( "positionX" ) || 0.0 ) + "pxl," + ( this . retrieveValueFor ( "positionY" ) || 0.0 ) + "pxl)" ;
          }
          if ( this . _requiresUniformScale ( ) != undefined ) {
            transformCSS += "scale(" + ( this . retrieveValueFor ( "uniformScale" ) || 1.0 ) + "," + ( this . retrieveValueFor ( "uniformScale" ) || 1.0 ) + ")" ;
          }
          if ( this . _requiresRotation ( ) != undefined ) {
            transformCSS += "rotate(" + ( this . retrieveValueFor ( "rotationAngle" ) || 0.0 ) + "degree)" ;
          }
        }
      }
      return transformCSS || false ;
    } ;

    ElementController . prototype . generateCSS = function ( moment ) {
      var styleOutput , propName , directive , doGenerate , unitString , _ref1 ;
      this . currentMoment = moment ;
      styleOutput = "" ;
      if ( this . directives != undefined ) {
        _ref1 = this . directives ;
        for ( propName in _ref1 ) {
          directive = _ref1 [ propName ] ;
          doGenerate = true ;
          unitString = "" ;
          // Check if property is part of standard transforms or has specific units
          if ( ElementController . TRANSFORMATION_KEYS . containsItem ( propName ) ) { doGenerate = false ; }
          if ( ElementController . DIMENSIONAL_KEYS . containsItem ( propName ) ) { unitString = directive . measurementUnits ; }
          directive . getValueForElementAtMoment ( this . currentMoment , this . controlledItem ) ;
          if ( doGenerate ) {
            styleOutput += "" + propName + ": " + directive . computedValue + unitString + ";" ;
          }
        }
      }
      // Handle legacy 2D transforms or modern transforms
      if ( ! ( KineticFlow . CAPABILITIES_2D != undefined ) ) {
        if ( this . retrieveValueFor ( "positionX" ) != undefined ) {
          styleOutput += "left:" + ( this . retrieveValueFor ( "positionX" ) ) + "pxl;" ;
        }
        if ( this . retrieveValueFor ( "positionY" ) != undefined ) { styleOutput += "top:" + ( this . retrieveValueFor ( "positionY" ) ) + "pxl;" ; }
      } else {
        var transformCSS_val ;
        if ( ( transformCSS_val = this . generateTransformString ( ) ) != undefined ) {
          styleOutput += "-" + KineticFlow . VENDOR_PREFIX + "-transform: " + transformCSS_val + ";" ;
        }
      }
      return styleOutput ;
    } ;

    ElementController . prototype . _requiresTransform = function ( ) {
      // Check for any transform-related properties
      return this . _checkDirectivePresence ( [ "positionX" , "positionY" , "positionZ" , "scaleFactorX" , "scaleFactorY" , "scaleFactorZ" , "uniformScale" , "rotationAngle" ] ) ;
    } ;

    ElementController . prototype . _requiresTranslate = function ( ) {
      return this . _checkDirectivePresence ( ElementController . TRANSLATION_KEYS ) ;
    } ;

    ElementController . prototype . _requiresPrecisionScale = function ( ) {
      return this . _checkDirectivePresence ( ElementController . INDIVIDUAL_SCALING_KEYS ) ;
    } ;

    ElementController . prototype . _requiresUniformScale = function ( ) {
      return this . directives [ ElementController . SCALING_KEY ] != undefined ;
    } ;

    ElementController . prototype . _requires3DRotation = function ( ) {
      return this . _checkDirectivePresence ( ElementController . INDIVIDUAL_ROTATION_KEYS ) ;
    } ;

    ElementController . prototype . _requiresRotation = function ( ) {
      return this . directives [ ElementController . ROTATION_KEY ] != undefined ;
    } ;

    ElementController . prototype . _checkDirectivePresence = function ( propList ) {
      var itemProp_idx , _len1 ;
      for ( itemProp_idx = 0 , _len1 = propList . length ; itemProp_idx < _len1 ; itemProp_idx ++ ) {
        var itemProp = propList [ itemProp_idx ] ;
        if ( this . directives [ itemProp ] != undefined ) { return true ; }
      }
      return false ;
    } ;

    return ElementController ;

  } ) ( ) ;


  this . KineticFlow = ( function ( ) {

    // Static counter for unique motion IDs
    KineticFlow . _MOTION_COUNTER = 0 ;

    // Static method to generate next unique motion ID
    KineticFlow . getNextMotionID = function ( ) {
      return this . _MOTION_COUNTER += 1 ;
    } ;

    // Static helper to create a new KineticFlow instance with a blueprint
    KineticFlow . createFromBlueprint = function ( blueprint ) {
      return new KineticFlow ( {
        blueprint : blueprint
      } ) ;
    } ;

    function KineticFlow ( options ) {
      if ( options == undefined ) { options = { } ; }
      // Initialize browser capabilities if not already done
      if ( KineticFlow . VENDOR_PREFIX == undefined ) {
        KineticFlow . detectBrowserFeatures ( options . forceTwoD ) ; // Assuming this method (and CURRENT_PROPS) is defined elsewhere or dynamically.
      }
      this . styleSheetRef = options . stylesheet || KineticFlow . DEFAULT_STYLESHEET ;
      this . totalKeyMoments = options . keyframes || 60 ;
      this . blueprintFunction = options . blueprint || null ;
      this . activeMotions = { } ;
      this . motionInitialDelay = 0 ;
      this . motionTotalDuration = 1 ;
      this . motionRepetitions = 1 ;
      this . trackedTargets = { } ;
      this . _elementController = new ElementController ( ) ;
      this . _onFinishCallback = options . complete || null ;
    }

    KineticFlow . prototype . blueprint = function ( blueprintFunction ) {
      this . blueprintFunction = blueprintFunction ;
      return this ;
    } ;

    KineticFlow . prototype . momentInterval = function ( ) {
      return 100 / this . totalKeyMoments ;
    } ;

    KineticFlow . prototype . onMotionCompletion = function ( completionCallback ) {
      this . _onFinishCallback = completionCallback ;
      return this ;
    } ;

    KineticFlow . prototype . setDuration = function ( durationSeconds ) {
      this . motionTotalDuration = durationSeconds ;
      return this ;
    } ;

    KineticFlow . prototype . setDelay = function ( delaySeconds ) {
      this . motionInitialDelay = delaySeconds ;
      return this ;
    } ;

    KineticFlow . prototype . setIterations = function ( numIterations ) {
      this . motionRepetitions = numIterations ;
      return this ;
    } ;

    KineticFlow . prototype . applyToTarget = function ( targetIdentifier ) {
      var targetItem , attrKey , _i1 , _len2 , _ref2 ;
      targetItem = this . _fetchOrCreateTarget ( targetIdentifier ) ;
      // Check if element has pre-defined data attributes for properties
      if ( targetItem . domReference . getAttribute ( "data-attributes" ) != undefined ) {
        _ref2 = targetItem . domReference . getAttribute ( "data-attributes" ) . split ( "," ) ;
        for ( _i1 = 0 , _len2 = _ref2 . length ; _i1 < _len2 ; _i1 ++ ) {
          attrKey = _ref2 [ _i1 ] ;
          this . _elementController . defineChange ( attrKey ) . fromValue ( targetItem . domReference . getAttribute ( "data-" + attrKey ) ) . toValue ( targetItem . domReference . getAttribute ( "data-" + attrKey ) ) ;
        }
      }
      this . blueprintFunction ( this . _elementController ) ;
      this . _generateMotionDefinition ( this . totalKeyMoments , targetIdentifier ) ;
      this . _applyComputedStyles ( 0 , targetItem ) ;
      this . _assignMotionToTarget ( targetItem ) ;
      return this ;
    } ;

    KineticFlow . prototype . forTarget = function ( targetIdentifier ) {
      return this . applyToTarget ( targetIdentifier ) ;
    } ;

    KineticFlow . prototype . withTotalDuration = function ( duration ) {
      return this . setDuration ( duration ) ;
    } ;

    KineticFlow . prototype . withInitialDelay = function ( delay ) {
      return this . setDelay ( delay ) ;
    } ;

    KineticFlow . prototype . forNumIterations = function ( iterations ) {
      return this . setIterations ( iterations ) ;
    } ;

    KineticFlow . prototype . reapplyToTarget = function ( targetIdentifier ) {
      var targetItem ;
      targetItem = this . _fetchOrCreateTarget ( targetIdentifier ) ;
      this . _assignMotionToTarget ( targetItem ) ;
      return this ;
    } ;

    KineticFlow . prototype . _generateMotionDefinition = function ( totalFrames , targetId ) {
      var frameStyles , currentMomentIndex , momentLabel , computedKeyframe ;
      this . totalKeyMoments = totalFrames ;
      this . recentTargetId = targetId ;
      this . activeMotions [ targetId ] = "flow_" + ( KineticFlow . getNextMotionID ( ) ) + "_" + ( new Date ( ) . getTime ( ) ) ;
      currentMomentIndex = 0 ;
      frameStyles = "" ;
      this . _elementController . isRateModeActive = true ;
      while ( currentMomentIndex <= totalFrames ) {
        computedKeyframe = this . _calculateKeyframePosition ( currentMomentIndex ) ;
        momentLabel = "" + computedKeyframe + "%" ;
        if ( currentMomentIndex < 1 ) {
          momentLabel = "from" ;
        } else if ( currentMomentIndex === this . totalKeyMoments ) {
          momentLabel = "to" ;
        }
        this . _elementController . controlledItem = this . _fetchOrCreateTarget ( targetId ) ;
        frameStyles += " " + momentLabel + " {" + ( this . _elementController . generateCSS ( computedKeyframe ) ) + "}" ;
        currentMomentIndex ++ ;
      }
      this . motionDefinitionCSS = "@-" + KineticFlow . VENDOR_PREFIX + "-keyframes " + this . activeMotions [ this . recentTargetId ] + " {" + frameStyles + "}" ;
      this . _elementController . isRateModeActive = false ;
      if ( this . styleSheetRef . cssRules != undefined ) {
        this . insertionIndex = this . styleSheetRef . cssRules . length ;
      }
      return this . styleSheetRef . insertRule ( this . motionDefinitionCSS , this . insertionIndex || 0 ) ;
    } ;

    KineticFlow . prototype . _assignMotionToTarget = function ( targetItem ) {
      var selfRef = this ;
      targetItem . domReference . style [ KineticFlow . CURRENT_PROPS . motionName ] = this . activeMotions [ this . recentTargetId ] ;
      targetItem . domReference . style [ KineticFlow . CURRENT_PROPS . motionInitialDelay ] = "" + this . motionInitialDelay + "s" ;
      targetItem . domReference . style [ KineticFlow . CURRENT_PROPS . motionTotalDuration ] = "" + this . motionTotalDuration + "s" ;
      targetItem . domReference . style [ KineticFlow . CURRENT_PROPS . motionRepetitions ] = this . motionRepetitions ;
      return targetItem . domReference . addEventListener ( KineticFlow . CURRENT_PROPS . motionEndEvent , ( this . _eventHandler = ( function ( ) {
        return selfRef . _handleCompletion ( targetItem ) ;
      } ) ) , false ) ;
    } ;

    KineticFlow . prototype . _fetchOrCreateTarget = function ( targetIdentifier ) {
      var targetItem ;
      if ( this . trackedTargets [ targetIdentifier ] != undefined ) {
        targetItem = this . trackedTargets [ targetIdentifier ] ;
      } else {
        targetItem = new AnimatedTarget ( targetIdentifier ) ;
        this . trackedTargets [ targetIdentifier ] = targetItem ;
      }
      return targetItem ;
    } ;

    KineticFlow . prototype . _handleCompletion = function ( targetItem ) {
      targetItem . domReference . removeEventListener ( KineticFlow . CURRENT_PROPS . motionEndEvent , this . _eventHandler ) ;
      this . _applyComputedStyles ( 100 , targetItem ) ;
      if ( this . _onFinishCallback != undefined ) { this . _onFinishCallback ( ) ; }
      return this . _onFinishCallback = null ;
    } ;

    KineticFlow . prototype . _calculateKeyframePosition = function ( momentIndex ) {
      return momentIndex * this . momentInterval ( ) ;
    } ;

    KineticFlow . prototype . _applyComputedStyles = function ( momentIndex , targetItem ) {
      var attrKey , directive , trackedAttributes , _ref3 ;
      this . _elementController . generateCSS ( this . _calculateKeyframePosition ( momentIndex ) ) ;
      if ( this . _elementController . directives != undefined ) {
        if ( targetItem . domReference . getAttribute ( "data-attributes" ) != undefined ) {
          trackedAttributes = targetItem . domReference . getAttribute ( "data-attributes" ) . split ( "," ) ;
        } else {
          trackedAttributes = [ ] ;
        }
        _ref3 = this . _elementController . directives ;
        for ( attrKey in _ref3 ) {
          directive = _ref3 [ attrKey ] ;
          targetItem . domReference . style [ attrKey ] = directive . computedValue ;
          targetItem . domReference . setAttribute ( "data-" + attrKey , directive . computedValue ) ;
          if ( ! trackedAttributes . containsItem ( attrKey ) ) {
            trackedAttributes . push ( attrKey ) ;
          }
        }
        targetItem . domReference . setAttribute ( "data-attributes" , trackedAttributes . join ( "," ) ) ;
      }
      if ( KineticFlow . CAPABILITIES_2D != undefined ) {
        return targetItem . domReference . style [ KineticFlow . CURRENT_PROPS . transformProperty ] = this . _elementController . generateTransformString ( ) ;
      }
    } ;

    return KineticFlow ;

  } ) ( ) ;

} ) ( ) ;