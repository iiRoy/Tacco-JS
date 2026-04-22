/*
 * This file contains the core logic for the Sauce.js animation library.
 * It provides utilities for managing DOM elements, defining animation rules,
 * and orchestrating CSS keyframe animations.
 *
 * Original project source: https://github.com/jimjeffers/Sauce
 * Author: J. Jeffers
 *
 * Disclaimer: This software is provided "as is", without warranty of any kind,
 * express or implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other liability,
 * whether in an action of contract, tort or otherwise, arising from,
 * out of or in connection with the software or the use or other dealings in the software.
 */


( function ( ) {


  // Extend the Array prototype with a custom 'include' method.
  // This method checks if an array contains a specific item.
  Array.prototype.include = function ( matchedItem )
  {
    return this.indexOf ( matchedItem ) >= 0 ;
  } ; // End of Array.prototype.include definition.


  // Define the ManagedElement class within the global scope (this).
  // This class wraps a DOM element and manages its initial properties.
  this.ManagedElement = ( function ( )
  {

    // Constructor function for ManagedElement objects.
    function ManagedElement ( elementID )
    {
      // Retrieve the DOM element by its ID.
      this.source = document.getElementById ( elementID ) ;

      // Initialize properties from data attributes or default values.
      this.opacity = this.source.getAttribute ( "data-opacity" ) || 1 ;
      this.x = this.source.getAttribute ( "data-x" ) || 0 ;
      this.y = this.source.getAttribute ( "data-y" ) || 0 ;
      this.z = this.source.getAttribute ( "data-z" ) || 0 ;
      this.scaleX = this.source.getAttribute ( "data-scaleX" ) || 1 ;
      this.scaleY = this.source.getAttribute ( "data-scaleY" ) || 1 ;
      this.scaleZ = this.source.getAttribute ( "data-scaleZ" ) || 1 ;
      this.rotate = this.source.getAttribute ( "data-rotate" ) || 0 ;
      this.rotateX = this.source.getAttribute ( "data-rotateX" ) || 0 ;
      this.rotateY = this.source.getAttribute ( "data-rotateY" ) || 0 ;
      this.rotateZ = this.source.getAttribute ( "data-rotateZ" ) || 0 ;
      this.scale = this.source.getAttribute ( "data-scale" ) || 1 ;

      this ; // A common CoffeeScript remnant, implicitly returning 'this'.
    }


    return ManagedElement ; // Return the constructor function.

  } ) ( ) ; // End of ManagedElement IIFE.


  // Define the VelocityEquation class.
  // This class represents an equation specifically for calculating velocity.
  this.VelocityEquation = ( function ( )
  {

    // Constructor for VelocityEquation.
    function VelocityEquation ( rule , equation )
    {
      this.rule = rule ; // The animation rule associated with this velocity equation.
      this.equation = equation ; // The actual mathematical function for velocity calculation.
      this ;
    }


    // Prototype method to calculate the velocity for a given keyframe.
    VelocityEquation.prototype.calculateForFrame = function ( keyframe )
    {
      var x ;
      // Apply the equation to the velocity obtained from the rule at the keyframe.
      x = this.equation ( this.rule.velocityAtKeyFrame ( keyframe ) ) ;
      return x ;
    } ;


    return VelocityEquation ; // Export the VelocityEquation constructor.

  } ) ( ) ; // End of VelocityEquation IIFE.


  // Define the Rule class.
  // This class defines a single animation rule for a specific property.
  this.Rule = ( function ( )
  {

    // Constructor for the Rule class.
    function Rule ( params )
    {
      if ( params == null )
      {
        params = { } ; // Ensure params is an object, even if null/undefined.
      }

      this.equation = params.equation || Easie.linearNone ; // Default easing equation.
      this.startFrame = 0 ; // Default start frame.
      this.endFrame = 100 ; // Default end frame.
      this.units = "px" ; // Default units for the property.
    }


    // Chaining method: sets the property this rule applies to.
    Rule.prototype.change = function ( property )
    {
      this.property = property ;
      return this ;
    } ;


    // Chaining method: sets the end point (target value) of the animation.
    Rule.prototype.to = function ( endPoint )
    {
      this.endPoint = endPoint ;
      this.endPoint = parseFloat ( this.endPoint ) ; // Ensure it's a float.
      return this ;
    } ;


    // Chaining method: sets the start point (initial value) of the animation.
    Rule.prototype.from = function ( startPoint )
    {
      this.startPoint = startPoint ;
      this.startPoint = parseFloat ( this.startPoint ) ; // Ensure it's a float.
      return this ;
    } ;


    // Chaining method: sets the units for the animated property.
    Rule.prototype.withUnits = function ( units )
    {
      this.units = units ;
      return this ;
    } ;


    // Chaining method: sets the easing equation for the animation.
    Rule.prototype.using = function ( equation )
    {
      this.equation = equation ;
      return this ;
    } ;


    // Chaining method: sets the amplitude for certain easing equations.
    Rule.prototype.withAmplitudeOf = function ( amplitude )
    {
      this.amplitude = amplitude ;
      return this ;
    } ;


    // Chaining method: sets the period for certain easing equations.
    Rule.prototype.withPeriodOf = function ( period )
    {
      this.period = period ;
      return this ;
    } ;


    // Chaining method: sets the starting keyframe for this rule.
    Rule.prototype.startingOnFrame = function ( startFrame )
    {
      this.startFrame = startFrame ;
      return this ;
    } ;


    // Chaining method: sets the ending keyframe for this rule.
    Rule.prototype.endingOnFrame = function ( endFrame )
    {
      this.endFrame = endFrame ;
      return this ;
    } ;


    // Calculates and returns the velocity at a given keyframe.
    // Caches the velocity if the keyframe hasn't changed.
    Rule.prototype.velocityAtKeyFrame = function ( keyframe )
    {
      if ( keyframe === this.keyframe && keyframe !== 0 && keyframe !== 100 )
      {
        return this.velocity ;
      }
      return 0 ; // Default velocity is zero.
    } ;


    // Checks if this rule uses a VelocityEquation.
    Rule.prototype.isVelocityRule = function ( )
    {
      return this.equation instanceof VelocityEquation ;
    } ;


    // Calculates the property's value at a specific keyframe for a given element.
    Rule.prototype.valueAtFrameForElement = function ( keyframe , element )
    {
      this.element = element ; // Store the element for property retrieval.

      // Only recalculate if the keyframe has changed.
      if ( this.keyframe !== keyframe )
      {
        this.keyframe = keyframe ; // Update the current keyframe.

        if ( this.isVelocityRule ( ) )
        {
          this.value = this.equation.calculateForFrame ( this.keyframe ) ;
        }
        else
        {
          this.value = this._calculateForFrame ( this.keyframe ) ;
        }

        // Calculate velocity based on the change from the last result.
        this.velocity = Math.abs ( this.value - this.lastResult ) ;
        this.lastResult = this.value ; // Store the current value as last result for next calculation.
      }

      return this.value ; // Return the calculated value.
    } ;


    // Internal method to calculate the frame value based on the easing equation.
    Rule.prototype._calculateForFrame = function ( keyframe )
    {
      var endPoint , startPoint , value ;

      // Determine the starting point.
      if ( this.startPoint != null )
      {
        startPoint = this.startPoint ;
      }
      else
      {
        startPoint = this._getElementProp ( this.element ) ;
      }

      // Determine the ending point.
      if ( this.endPoint != null )
      {
        endPoint = this.endPoint ;
      }
      else
      {
        endPoint = this._getElementProp ( this.element ) ;
      }

      // Clamp the keyframe to the rule's start and end frames.
      if ( keyframe < this.startFrame )
      {
        keyframe = this.startFrame ;
      }
      else if ( keyframe > this.endFrame )
      {
        keyframe = this.endFrame ;
      }

      // Apply the easing equation based on whether amplitude/period are defined.
      if ( ( this.period != null ) || ( this.amplitude != null ) )
      {
        value = this.equation ( keyframe - this.startFrame , startPoint , endPoint - startPoint , this.endFrame - this.startFrame , this.amplitude , this.period ) ;
      }
      else
      {
        value = this.equation ( keyframe - this.startFrame , startPoint , endPoint - startPoint , this.endFrame - this.startFrame ) ;
      }

      return value ;
    } ;


    // Internal method to get a property's value directly from the element.
    Rule.prototype._getElementProp = function ( element )
    {
      return element [ this.property ] ;
    } ;


    return Rule ; // Return the Rule constructor.

  } ) ( ) ; // End of Rule IIFE.


  // The Ingredient class.
  // Represents a collection of animation rules applied to a single element.
  this.Ingredient = ( function ( )
  {

    // Static constant: Property name for rotation.
    Ingredient.ROTATE_PROP = "rotate" ;

    // Static constant: Property name for uniform scaling.
    Ingredient.SCALE_PROP = "scale" ;

    // Static constant: Array of properties for translation (x, y, z).
    Ingredient.TRANSLATE_PROPS = [ "x" , "y" , "z" ] ;

    // Static constant: Array of properties for precise scaling (scaleX, scaleY, scaleZ).
    Ingredient.PRECISE_SCALE_PROPS = [ "scaleX" , "scaleY" , "scaleZ" ] ;

    // Static constant: Array of properties for precise rotation (rotateX, rotateY, rotateZ).
    Ingredient.PRECISE_ROTATE_PROPS = [ "rotateX" , "rotateY" , "rotateZ" ] ;

    // Static constant: Combined list of all transform-related properties.
    Ingredient.TRANSFORM_PROPS = ( "" + ( Ingredient.TRANSLATE_PROPS.join ( "," ) ) + "," + ( [ Ingredient.SCALE_PROP , Ingredient.ROTATE_PROP ].join ( "," ) ) + "," + ( Ingredient.PRECISE_SCALE_PROPS.join ( "," ) ) + "," + ( Ingredient.PRECISE_ROTATE_PROPS.join ( "," ) ) ).split ( "," ) ;

    // Static constant: Array of properties that typically require units (e.g., height, width).
    Ingredient.UNIT_PROPS = [ "height" , "width" ] ;


    // Constructor for Ingredient.
    function Ingredient ( )
    {
      this.rules = { } ; // Stores animation rules, keyed by property name.
      this.element = null ; // The element this ingredient is applied to.
      this.keyframe = 0 ; // The current keyframe for calculations.
      this.utilizingVelocity = false ; // Flag to indicate if velocity rules should be active.
    }


    // Returns a Rule object for a given property, creating it if it doesn't exist.
    Ingredient.prototype.change = function ( property )
    {
      if ( this.rules [ property ] == null )
      {
        this.rules [ property ] = new Rule ( ) . change ( property ) ;
      }
      return this.rules [ property ] ;
    } ;


    // Creates and returns a new VelocityEquation for a given property and equation function.
    Ingredient.prototype.velocity = function ( property , equationFunction )
    {
      return new VelocityEquation ( this.rules [ property ] , equationFunction ) ;
    } ;


    // Gets the calculated value of a property at the current keyframe.
    Ingredient.prototype.valueOf = function ( property )
    {
      // Check if the property rule exists and if velocity rules are allowed (or not a velocity rule).
      if ( ( ( property = this.rules [ property ] ) != null ) && ! ( property.isVelocityRule ( ) && ! this.utilizingVelocity ) )
      {
        return property.valueAtFrameForElement ( this.keyframe , this.element ) ;
      }
      return null ; // Return null if the rule doesn't exist or isn't currently active.
    } ;


    // Generates the CSS transform string based on the current rules and keyframe.
    Ingredient.prototype.transformRule = function ( )
    {
      var transform ;

      // Only generate transform if needed and element/keyframe are set.
      if ( this._needsTransform ( ) && ( this.element != null ) && ( this.keyframe != null ) )
      {
        transform = "" ; // Initialize transform string.

        // Check for 3D transform support.
        if ( Sauce.TRANSFORMS3D != null )
        {
          if ( this._needsTranslate ( ) )
          {
            transform += "translate3d(" + ( this.valueOf ( "x" ) || 0 ) + "px," + ( this.valueOf ( "y" ) || 0 ) + "px," + ( this.valueOf ( "z" ) || 0 ) + "px)" ;
          }
          if ( this._needsPrecisionScale ( ) )
          {
            transform += "scale3d(" + ( this.valueOf ( "scaleX" ) || 1 ) + "," + ( this.valueOf ( "scaleY" ) || 1 ) + "," + ( this.valueOf ( "scaleZ" ) || 0 ) + ")" ;
          }
          else if ( this._needsUniformScale ( ) )
          {
            transform += "scale3d(" + ( this.valueOf ( "scale" ) || 1 ) + "," + ( this.valueOf ( "scale" ) || 1 ) + "," + ( this.valueOf ( "scale" ) || 0 ) + ")" ;
          }
          if ( this._needsRotateIn3D ( ) )
          {
            transform += "rotate3d(" + ( this.valueOf ( "rotateX" ) || 0 ) + "px," + ( this.valueOf ( "rotateY" ) || 0 ) + "px," + ( this.valueOf ( "rotateZ" ) || 0 ) + "px," + ( this.valueOf ( "rotate" ) || 0 ) + "deg)" ;
          }
          else if ( this._needsRotate ( ) )
          {
            transform += "rotate(" + ( this.valueOf ( "rotate" ) || 0 ) + "deg)" ;
          }
        }
        // Check for 2D transform support.
        else if ( Sauce.TRANSFORMS != null )
        {
          if ( this._needsTranslate ( ) )
          {
            transform += "translate(" + ( this.valueOf ( "x" ) || 0 ) + "px," + ( this.valueOf ( "y" ) || 0 ) + "px)" ;
          }
          if ( this._needsUniformScale ( ) != null )
          {
            transform += "scale(" + ( this.valueOf ( "scale" ) || 1 ) + "," + ( this.valueOf ( "scale" ) || 1 ) + ")" ;
          }
          if ( this._needsRotate ( ) != null )
          {
            transform += "rotate(" + ( this.valueOf ( "rotate" ) || 0 ) + "deg)" ;
          }
        }
      }
      return transform || false ; // Return the transform string or false if no transform.
    } ;


    // Generates the CSS string for all animated properties at a given keyframe.
    Ingredient.prototype.css = function ( keyframe )
    {
      var css , property , rule , shouldGenerate , transform , units , _ref ;

      this.keyframe = keyframe ; // Set the current keyframe.
      css = "" ; // Initialize CSS string.

      if ( this.rules != null )
      {
        _ref = this.rules ; // Reference to all rules.

        // Iterate over each rule to generate its CSS.
        for ( property in _ref )
        {
          rule = _ref [ property ] ;
          shouldGenerate = true ; // Flag to determine if CSS should be generated for this property.
          units = "" ; // Initialize units.

          // If it's a transform property, it will be handled separately.
          if ( Ingredient.TRANSFORM_PROPS.include ( property ) )
          {
            shouldGenerate = false ;
          }
          // If it's a unit-based property, append its units.
          if ( Ingredient.UNIT_PROPS.include ( property ) )
          {
            units = rule.units ;
          }

          rule.valueAtFrameForElement ( this.keyframe , this.element ) ; // Calculate the value.

          if ( shouldGenerate )
          {
            css += "" + property + ": " + rule.value + units + ";" ;
          }
        }
      }

      // Handle non-transform properties (left/top) if transforms are not supported.
      if ( ! ( Sauce.TRANSFORMS != null ) )
      {
        if ( this.valueOf ( "x" ) != null )
        {
          css += "left:" + ( this.valueOf ( "x" ) ) + "px;" ;
        }
        if ( this.valueOf ( "y" ) != null )
        {
          css += "top:" + ( this.valueOf ( "y" ) ) + "px;" ;
        }
      }
      else // If transforms are supported, apply the generated transform string.
      {
        if ( ( transform = this.transformRule ( ) ) != null )
        {
          css += "-" + Sauce.BROWSER_PREFIX + "-transform: " + transform + ";" ;
        }
      }

      return css ; // Return the complete CSS string for the keyframe.
    } ;


    // Checks if any transform properties are defined for this ingredient.
    Ingredient.prototype._needsTransform = function ( )
    {
      return this._checkProps ( [ "x" , "y" , "z" , "scaleX" , "scaleY" , "scaleZ" , "scale" , "rotate" ] ) ;
    } ;


    // Checks if any translation properties (x, y, z) are defined.
    Ingredient.prototype._needsTranslate = function ( )
    {
      return this._checkProps ( Ingredient.TRANSLATE_PROPS ) ;
    } ;


    // Checks if any precise scale properties (scaleX, scaleY, scaleZ) are defined.
    Ingredient.prototype._needsPrecisionScale = function ( )
    {
      return this._checkProps ( Ingredient.PRECISE_SCALE_PROPS ) ;
    } ;


    // Checks if uniform scale property is defined.
    Ingredient.prototype._needsUniformScale = function ( )
    {
      return this.rules [ Ingredient.SCALE_PROP ] != null ;
    } ;


    // Checks if any 3D rotation properties (rotateX, rotateY, rotateZ) are defined.
    Ingredient.prototype._needsRotateIn3D = function ( )
    {
      return this._checkProps ( Ingredient.PRECISE_ROTATE_PROPS ) ;
    } ;


    // Checks if the general rotation property is defined.
    Ingredient.prototype._needsRotate = function ( )
    {
      return this.rules [ Ingredient.ROTATE_PROP ] != null ;
    } ;


    // Helper method to check if any of the given properties have rules defined.
    Ingredient.prototype._checkProps = function ( properties )
    {
      var property , _i , _len ;

      for ( _i = 0 , _len = properties.length ; _i < _len ; _i ++ )
      {
        property = properties [ _i ] ;
        if ( this.rules [ property ] != null )
        {
          return true ; // Found a rule for one of the properties.
        }
      }
      return false ; // No rules found for any of the properties.
    } ;


    return Ingredient ; // Return the Ingredient constructor.

  } ) ( ) ; // End of Ingredient IIFE.


  // The main Sauce class. Orchestrates animations.
  this.Sauce = ( function ( )
  {

    // Static counter for animation IDs.
    Sauce._ANIMATION_ID = 0 ;

    // Static method to generate a unique animation ID.
    Sauce.animationID = function ( )
    {
      return this._ANIMATION_ID += 1 ;
    } ;


    // Static factory method to apply a recipe.
    Sauce.applyRecipe = function ( recipe )
    {
      return new Sauce ( {
        recipe : recipe
      } ) ;
    } ;


    // Constructor for the Sauce animation engine.
    function Sauce ( params )
    {
      if ( params == null )
      {
        params = { } ; // Default empty parameters object.
      }

      // Initialize browser capabilities if not already done.
      if ( Sauce.BROWSER_PREFIX == null )
      {
        Sauce.getBrowserCapabilities ( params.force2d ) ;
      }

      this.stylesheet = params.stylesheet || Sauce.STYLESHEET ; // CSS stylesheet to inject keyframes.
      this.keyframes = params.keyframes || 60 ; // Number of keyframes for the animation.
      this.recipeFunction = params.recipe || null ; // The function defining animation rules.
      this.animations = { } ; // Stores generated animation names.
      this.animationDelay = 0 ; // Default animation delay in seconds.
      this.animationDuration = 1 ; // Default animation duration in seconds.
      this.animaionIteration = 1 ; // Default animation iteration count.
      this.elements = { } ; // Cache for ManagedElement instances.
      this._ingredient = new Ingredient ( ) ; // The core ingredient for rules.
      this._complete = params.complete || null ; // Callback function for animation completion.
    }


    // Chaining method: Sets the animation recipe function.
    Sauce.prototype.recipe = function ( recipeFunction )
    {
      this.recipeFunction = recipeFunction ;
      return this ;
    } ;


    // Calculates the interval between keyframes (as a percentage).
    Sauce.prototype.interval = function ( )
    {
      return 100 / this.keyframes ;
    } ;


    // Chaining method: Sets the completion callback.
    Sauce.prototype.onComplete = function ( complete )
    {
      this._complete = complete ;
      return this ;
    } ;


    // Chaining method: Sets the animation duration.
    Sauce.prototype.duration = function ( animationDuration )
    {
      this.animationDuration = animationDuration ;
      return this ;
    } ;


    // Chaining method: Sets the animation delay.
    Sauce.prototype.delay = function ( animationDelay )
    {
      this.animationDelay = animationDelay ;
      return this ;
    } ;


    // Chaining method: Sets the animation iteration count.
    Sauce.prototype.iterations = function ( animationIteration )
    {
      this.animationIteration = animationIteration ;
      return this ;
    } ;


    // Applies the animation recipe to a specified element.
    Sauce.prototype.putOn = function ( id )
    {
      var element , property , _i , _len , _ref ;

      element = this._getOrCreateElementFromID ( id ) ; // Get or create ManagedElement.

      // Load initial properties from data attributes if available.
      if ( element.source.getAttribute ( "data-properties" ) != null )
      {
        _ref = element.source.getAttribute ( "data-properties" ) . split ( "," ) ;
        for ( _i = 0 , _len = _ref.length ; _i < _len ; _i ++ )
        {
          property = _ref [ _i ] ;
          this._ingredient.change ( property ) . from ( element.source.getAttribute ( "data-" + property ) ) . to ( element.source.getAttribute ( "data-" + property ) ) ;
        }
      }

      this.recipeFunction ( this._ingredient ) ; // Execute the user-defined recipe.
      this._createAnimation ( this.keyframes , id ) ; // Generate CSS keyframes.
      this._applyCSS ( 0 , element ) ; // Apply initial CSS state.
      this._setAnimationOnElement ( element ) ; // Attach animation to element.

      return this ; // Allow chaining.
    } ;


    // Alias for putOn.
    Sauce.prototype.on = function ( id )
    {
      return this.putOn ( id ) ;
    } ;


    // Alias for duration.
    Sauce.prototype.withDuration = function ( duration )
    {
      return this.duration ( duration ) ;
    } ;


    // Alias for delay.
    Sauce.prototype.andDelay = function ( delay )
    {
      return this.delay ( delay ) ;
    } ;


    // Alias for iterations.
    Sauce.prototype.times = function ( iterations )
    {
      return this.iterations ( iterations ) ;
    } ;


    // Re-applies an existing animation to another element.
    Sauce.prototype.useAgainOn = function ( id )
    {
      var element ;
      element = this._getOrCreateElementFromID ( id ) ;
      this._setAnimationOnElement ( element ) ;
      return this ;
    } ;


    // Internal method to create and inject CSS keyframe animation rules.
    Sauce.prototype._createAnimation = function ( keyframes , id )
    {
      var cssFrames , currentFrame , frameLabel , keyframe ;

      this.keyframes = keyframes ; // Store the total number of keyframes.
      this.lastUsedID = id ; // Remember the last element ID.
      // Generate a unique animation name.
      this.animations [ id ] = "ease_" + ( Sauce.animationID ( ) ) + "_" + ( new Date ( ) . getTime ( ) ) ;

      currentFrame = 0 ; // Initialize frame counter.
      cssFrames = "" ; // Initialize CSS keyframes string.
      this._ingredient.utilizingVelocity = true ; // Enable velocity rule calculations.

      // Loop through all keyframes to generate CSS.
      while ( currentFrame <= keyframes )
      {
        keyframe = this._computeKeyframe ( currentFrame ) ; // Calculate keyframe percentage.
        frameLabel = "" + keyframe + "%" ;

        // Special labels for 'from' and 'to' keyframes.
        if ( currentFrame < 1 )
        {
          frameLabel = "from" ;
        }
        else if ( currentFrame === this.keyframes )
        {
          frameLabel = "to" ;
        }

        this._ingredient.element = this._getOrCreateElementFromID ( id ) ; // Set current element for ingredient.
        cssFrames += " " + frameLabel + " {" + ( this._ingredient.css ( keyframe ) ) + "}" ; // Append keyframe CSS.
        currentFrame ++ ;
      }

      // Construct the full @keyframes rule.
      this.animationCSS = "@-" + Sauce.BROWSER_PREFIX + "-keyframes " + this.animations [ this.lastUsedID ] + " {" + cssFrames + "}" ;
      this._ingredient.utilizingVelocity = false ; // Disable velocity rule calculations.

      // Determine the insertion index for the new CSS rule.
      if ( this.stylesheet.cssRules != null )
      {
        this.index = this.stylesheet.cssRules.length ;
      }

      // Insert the generated keyframe rule into the stylesheet.
      return this.stylesheet.insertRule ( this.animationCSS , this.index || 0 ) ;
    } ;


    // Internal method to apply the generated animation to a DOM element.
    Sauce.prototype._setAnimationOnElement = function ( element )
    {
      var _this = this ; // Capture 'this' for event listener scope.

      // Apply animation properties to the element's style.
      element.source.style [ Sauce.CURRENT_PROPS.animationName ] = this.animations [ this.lastUsedID ] ;
      element.source.style [ Sauce.CURRENT_PROPS.animationDelay ] = "" + this.animationDelay + "s" ;
      element.source.style [ Sauce.CURRENT_PROPS.animationDuration ] = "" + this.animationDuration + "s" ;
      element.source.style [ Sauce.CURRENT_PROPS.animationIteration ] = this.animaionIteration ;

      // Add an event listener for animation end to trigger the completion callback.
      return element.source.addEventListener ( Sauce.CURRENT_PROPS.animationEnd , ( this._handler = ( function ( )
      {
        return _this._completeHandler ( element ) ;
      } ) ) , false ) ;
    } ;


    // Internal method to retrieve or create a ManagedElement instance.
    Sauce.prototype._getOrCreateElementFromID = function ( id )
    {
      var element ;

      // Check if the element is already cached.
      if ( this.elements [ id ] != null )
      {
        element = this.elements [ id ] ;
      }
      else
      {
        element = new ManagedElement ( id ) ; // Create a new ManagedElement.
        this.elements [ id ] = element ; // Cache it.
      }

      return element ; // Return the ManagedElement.
    } ;


    // Internal method: Handles the animation completion event.
    Sauce.prototype._completeHandler = function ( element )
    {
      // Remove the event listener to prevent memory leaks or multiple calls.
      element.source.removeEventListener ( Sauce.CURRENT_PROPS.animationEnd , this._handler ) ;

      // Apply the final CSS state (at 100% keyframe).
      this._applyCSS ( 100 , element ) ;

      // Execute the user-defined completion callback if it exists.
      if ( this._complete != null )
      {
        this._complete ( ) ;
      }

      this._complete = null ; // Clear the callback reference.
      return ;
    } ;


    // Internal method to convert a frame number to a percentage keyframe.
    Sauce.prototype._computeKeyframe = function ( frame )
    {
      return frame * this.interval ( ) ;
    } ;


    // Internal method to apply CSS properties directly to an element's style.
    Sauce.prototype._applyCSS = function ( frame , element )
    {
      var property , rule , trackedProperties , _ref ;

      this._ingredient.css ( this._computeKeyframe ( frame ) ) ; // Calculate CSS for the given frame.

      if ( this._ingredient.rules != null )
      {
        // Get existing tracked properties from data attribute.
        if ( element.source.getAttribute ( "data-properties" ) != null )
        {
          trackedProperties = element.source.getAttribute ( "data-properties" ) . split ( "," ) ;
        }
        else
        {
          trackedProperties = [ ] ;
        }

        _ref = this._ingredient.rules ;
        // Apply each rule's value directly to the element's style.
        for ( property in _ref )
        {
          rule = _ref [ property ] ;
          element.source.style [ property ] = rule.value ; // Set inline style.
          element.source.setAttribute ( "data-" + property , rule.value ) ; // Update data attribute.

          // Add property to tracked list if not already present.
          if ( ! trackedProperties.include ( property ) )
          {
            trackedProperties.push ( property ) ;
          }
        }
        // Update the data-properties attribute.
        element.source.setAttribute ( "data-properties" , trackedProperties.join ( "," ) ) ;
      }

      // Apply transform CSS if transforms are supported.
      if ( Sauce.TRANSFORMS != null )
      {
        return element.source.style [ Sauce.CURRENT_PROPS.transform ] = this._ingredient.transformRule ( ) ;
      }
    } ;


    return Sauce ; // Return the Sauce constructor.

  } ) ( ) ; // End of Sauce IIFE.


} ) ( ) ; // End of the main self-executing function.