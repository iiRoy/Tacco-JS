/*
Flavor.js (https://github.com/your-repo/Flavor)
Project reimagined by Your Name

NOTE: This software is provided "as is" without warranty.
Use responsibly and creatively.
*/

(function() {
  "use strict"; // Enforce strict mode

  // Augments Array prototype to check for item existence.
  // This helps in quickly determining if an array contains a specific value.
  if (!Array.prototype.containsItem) {
    Array.prototype.containsItem = function(searchElement) {
      // Using a simple loop for compatibility and clarity,
      // though indexOf is often optimized.
      for (let k = 0; k < this.length; k++) {
        if (this[k] === searchElement) {
          return true;
        }
      }
      return false;
    };
  }

  // Represents a DOM element managed by the animation system.
  // It caches initial properties from data attributes.
  this.DOMNodeHandler = (function() {

    /**
     * Initializes a new DOMNodeHandler instance.
     * @param {string} nodeIdentifier - The ID of the DOM element to manage.
     */
    function DOMNodeHandler(nodeIdentifier) {
      if (!nodeIdentifier || typeof nodeIdentifier !== 'string') {
        console.warn("DOMNodeHandler: Invalid or missing node identifier provided.");
        throw new Error("A valid DOM element ID is required.");
      }

      this.targetNode = document.getElementById(nodeIdentifier);

      if (!this.targetNode) {
        console.error(`DOMNodeHandler: Element with ID '${nodeIdentifier}' not found.`);
        throw new Error(`Element with ID '${nodeIdentifier}' not found.`);
      }

      // Helper to safely get a data attribute or a default value
      const getNumericDataAttr = (attrName, defaultValue) => {
        const value = this.targetNode.getAttribute(`data-${attrName}`);
        return value !== null && !isNaN(parseFloat(value)) ? parseFloat(value) : defaultValue;
      };

      // Initializing various transform and style properties from data attributes
      this.alpha = getNumericDataAttr("opacity", 1.0);
      this.positionX = getNumericDataAttr("x", 0);
      this.positionY = getNumericDataAttr("y", 0);
      this.positionZ = getNumericDataAttr("z", 0);
      this.scaleHorizontal = getNumericDataAttr("scaleX", 1.0);
      this.scaleVertical = getNumericDataAttr("scaleY", 1.0);
      this.scaleDepth = getNumericDataAttr("scaleZ", 1.0);
      this.rotation = getNumericDataAttr("rotate", 0);
      this.rotationX = getNumericDataAttr("rotateX", 0);
      this.rotationY = getNumericDataAttr("rotateY", 0);
      this.rotationZ = getNumericDataAttr("rotateZ", 0);
      this.uniformScale = getNumericDataAttr("scale", 1.0);
    }

    return DOMNodeHandler;

  })();

  // Defines a motion curve for animations, typically used for velocity-based effects.
  this.MotionCurve = (function() {

    /**
     * Creates a new MotionCurve instance.
     * @param {AnimationSpec} animationRule - The animation specification this curve applies to.
     * @param {Function} curveFunction - The easing function to use for calculation.
     */
    function MotionCurve(animationRule, curveFunction) {
      if (!animationRule || !curveFunction || typeof curveFunction !== 'function') {
        console.warn("MotionCurve: Invalid animation rule or curve function provided.");
      }
      this.animationRule = animationRule;
      this.curveFunction = curveFunction;
    }

    /**
     * Computes the value for a given keyframe using the defined curve function.
     * @param {number} currentFrameIndex - The current frame index.
     * @returns {number} The calculated value.
     */
    MotionCurve.prototype.computeValueForFrame = function(currentFrameIndex) {
      // Delegates the actual velocity calculation to the associated animation rule,
      // then applies the curve function.
      const resultantValue = this.curveFunction(this.animationRule.getVelocityAtFrame(currentFrameIndex));
      return resultantValue;
    };

    return MotionCurve;

  })();

  // Represents a single animation rule for a specific CSS property.
  this.AnimationSpec = (function() {

    /**
     * Initializes a new AnimationSpec.
     * @param {object} [options={}] - Configuration options for the animation rule.
     * @param {Function} [options.easingFunction=Easie.linearNone] - The easing function to use.
     */
    function AnimationSpec(options = {}) {
      this.easingFunction = options.easingFunction || (Easie && Easie.linearNone ? Easie.linearNone : (t, b, c, d) => b + c * (t / d)); // Fallback easing
      this.initialFrame = 0;
      this.finalFrame = 100;
      this.measurementUnit = "px"; // Default unit for most properties
      this.cachedFrame = null;
      this.cachedValue = null;
      this.lastComputedResult = 0;
      this.currentVelocity = 0;
    }

    /**
     * Sets the CSS property this rule applies to.
     * @param {string} propKey - The CSS property name.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.forProperty = function(propKey) {
      this.targetProperty = propKey;
      return this;
    };

    /**
     * Sets the ending value for the animation.
     * @param {number|string} endPoint - The end value.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.toValue = function(endPoint) {
      this.endPointValue = parseFloat(endPoint);
      return this;
    };

    /**
     * Sets the starting value for the animation.
     * @param {number|string} startPoint - The start value.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.fromValue = function(startPoint) {
      this.startPointValue = parseFloat(startPoint);
      return this;
    };

    /**
     * Specifies the units for the property.
     * @param {string} units - The unit string (e.g., "px", "deg", "%").
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.usingUnits = function(units) {
      this.measurementUnit = units;
      return this;
    };

    /**
     * Sets the easing function for this rule.
     * @param {Function} easingFunc - The easing function.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.withEasing = function(easingFunc) {
      this.easingFunction = easingFunc;
      return this;
    };

    /**
     * Sets the amplitude for certain easing functions.
     * @param {number} amp - The amplitude value.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.setAmplitude = function(amp) {
      this.amplitudeValue = amp;
      return this;
    };

    /**
     * Sets the period for certain easing functions.
     * @param {number} per - The period value.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.setPeriod = function(per) {
      this.periodValue = per;
      return this;
    };

    /**
     * Sets the frame at which the animation begins.
     * @param {number} startFrm - The starting frame index.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.startAtFrame = function(startFrm) {
      this.initialFrame = startFrm;
      return this;
    };

    /**
     * Sets the frame at which the animation ends.
     * @param {number} endFrm - The ending frame index.
     * @returns {AnimationSpec} This instance for chaining.
     */
    AnimationSpec.prototype.endAtFrame = function(endFrm) {
      this.finalFrame = endFrm;
      return this;
    };

    /**
     * Retrieves the velocity at a specific keyframe.
     * Caches the result to avoid re-computation if the frame is the same.
     * @param {number} currentFrameIndex - The frame index.
     * @returns {number} The velocity at that frame.
     */
    AnimationSpec.prototype.getVelocityAtFrame = function(currentFrameIndex) {
      // Velocity is only meaningful if it's not the start or end, and if the frame hasn't changed.
      // Otherwise, return 0 or the current velocity.
      if (currentFrameIndex === this.cachedFrame && currentFrameIndex !== 0 && currentFrameIndex !== 100) {
        return this.currentVelocity;
      }
      return 0; // Default velocity is zero if not actively tracking or at an edge.
    };

    /**
     * Checks if the current rule uses a MotionCurve for its equation.
     * @returns {boolean} True if it's a MotionCurve, false otherwise.
     */
    AnimationSpec.prototype.isMotionCurveBased = function() {
      return this.easingFunction instanceof MotionCurve;
    };

    /**
     * Determines the animated value for a given frame and element.
     * Caches the value for performance.
     * @param {number} currentFrameIndex - The current frame index.
     * @param {DOMNodeHandler} targetElementHandler - The handler for the target DOM element.
     * @returns {number} The calculated animated value.
     */
    AnimationSpec.prototype.determineValueForFrame = function(currentFrameIndex, targetElementHandler) {
      this.associatedElement = targetElementHandler;

      // Only re-calculate if the frame has changed
      if (this.cachedFrame !== currentFrameIndex) {
        this.cachedFrame = currentFrameIndex;

        let calculatedValue;
        if (this.isMotionCurveBased()) {
          calculatedValue = this.easingFunction.computeValueForFrame(this.cachedFrame);
        } else {
          calculatedValue = this._performFrameCalculation(this.cachedFrame);
        }

        this.currentVelocity = Math.abs(calculatedValue - this.lastComputedResult);
        this.lastComputedResult = calculatedValue;
        this.cachedValue = calculatedValue;
      }
      return this.cachedValue;
    };

    /**
     * Internal method to perform the actual calculation of the value at a specific frame.
     * @param {number} frameNumber - The current frame number.
     * @returns {number} The calculated value.
     * @private
     */
    AnimationSpec.prototype._performFrameCalculation = function(frameNumber) {
      let currentStartPoint = this.startPointValue ?? this._fetchElementProperty(this.associatedElement);
      let currentEndPoint = this.endPointValue ?? this._fetchElementProperty(this.associatedElement);

      // Clamp the frame number within the animation's start and end frames
      let clampedFrame = Math.max(this.initialFrame, Math.min(frameNumber, this.finalFrame));

      let calculatedOutput;
      const totalDuration = this.finalFrame - this.initialFrame;
      const timeElapsed = clampedFrame - this.initialFrame;
      const changeInValue = currentEndPoint - currentStartPoint;

      if (this.periodValue != null || this.amplitudeValue != null) {
        // Easing function with amplitude and period parameters
        calculatedOutput = this.easingFunction(
          timeElapsed,
          currentStartPoint,
          changeInValue,
          totalDuration,
          this.amplitudeValue,
          this.periodValue
        );
      } else {
        // Standard easing function
        calculatedOutput = this.easingFunction(
          timeElapsed,
          currentStartPoint,
          changeInValue,
          totalDuration
        );
      }
      return calculatedOutput;
    };

    /**
     * Retrieves the current value of the animated property from the associated DOM element.
     * @param {DOMNodeHandler} elementHandler - The handler for the target DOM element.
     * @returns {number} The property value.
     * @private
     */
    AnimationSpec.prototype._fetchElementProperty = function(elementHandler) {
      // Maps generic property names to element handler's specific properties
      switch (this.targetProperty) {
        case "x": return elementHandler.positionX;
        case "y": return elementHandler.positionY;
        case "z": return elementHandler.positionZ;
        case "opacity": return elementHandler.alpha;
        case "scale": return elementHandler.uniformScale;
        case "scaleX": return elementHandler.scaleHorizontal;
        case "scaleY": return elementHandler.scaleVertical;
        case "scaleZ": return elementHandler.scaleDepth;
        case "rotate": return elementHandler.rotation;
        case "rotateX": return elementHandler.rotationX;
        case "rotateY": return elementHandler.rotationY;
        case "rotateZ": return elementHandler.rotationZ;
        // Add more property mappings as needed
        default:
          // Fallback to direct access if no specific mapping, assuming it's a direct CSS property.
          // Note: This might not work for properties that aren't directly represented as numbers in the handler.
          return parseFloat(elementHandler.targetNode.style[this.targetProperty] || 0);
      }
    };

    return AnimationSpec;

  })();

  // Manages a collection of AnimationSpecs for a single DOM element.
  this.ElementRecipe = (function() {

    // Constants for various CSS property categories.
    const ROTATION_KEY = "rotate";
    const SCALING_KEY = "scale";
    const TRANSLATION_KEYS = ["x", "y", "z"];
    const INDIVIDUAL_SCALE_KEYS = ["scaleX", "scaleY", "scaleZ"];
    const INDIVIDUAL_ROTATION_KEYS = ["rotateX", "rotateY", "rotateZ"];
    const DIMENSION_KEYS = ["height", "width"];

    // Dynamically build a comprehensive list of all transform-related properties.
    const ALL_TRANSFORM_KEYS = [
      ...TRANSLATION_KEYS,
      SCALING_KEY,
      ROTATION_KEY,
      ...INDIVIDUAL_SCALE_KEYS,
      ...INDIVIDUAL_ROTATION_KEYS
    ];

    // Expose constants publicly if needed, or keep them internal.
    // For Type III, we'll expose them with new names.
    ElementRecipe.STATIC_ROTATION_IDENTIFIER = ROTATION_KEY;
    ElementRecipe.STATIC_SCALE_IDENTIFIER = SCALING_KEY;
    ElementRecipe.STATIC_TRANSLATION_IDENTIFIERS = TRANSLATION_KEYS;
    ElementRecipe.STATIC_PRECISE_SCALE_IDENTIFIERS = INDIVIDUAL_SCALE_KEYS;
    ElementRecipe.STATIC_PRECISE_ROTATION_IDENTIFIERS = INDIVIDUAL_ROTATION_KEYS;
    ElementRecipe.STATIC_ALL_TRANSFORM_IDENTIFIERS = ALL_TRANSFORM_KEYS;
    ElementRecipe.STATIC_UNIT_APPLYING_IDENTIFIERS = DIMENSION_KEYS;


    /**
     * Initializes a new ElementRecipe.
     */
    function ElementRecipe() {
      this.animationSpecs = {}; // Stores AnimationSpec instances keyed by property name.
      this.managedNode = null; // The DOMNodeHandler for the element this recipe applies to.
      this.currentFramePosition = 0; // The frame currently being processed.
      this.isVelocityModeActive = false; // Flag to indicate if velocity rules should be processed.
    }

    /**
     * Initiates the definition of an animation rule for a given property.
     * Creates a new AnimationSpec if one doesn't exist for the property.
     * @param {string} propName - The CSS property name.
     * @returns {AnimationSpec} The AnimationSpec instance for the property.
     */
    ElementRecipe.prototype.defineChangeFor = function(propName) {
      if (!this.animationSpecs[propName]) {
        this.animationSpecs[propName] = new AnimationSpec().forProperty(propName);
      }
      return this.animationSpecs[propName];
    };

    /**
     * Creates a MotionCurve for a specific property, allowing velocity-based animations.
     * @param {string} propName - The CSS property name.
     * @param {Function} easingFunc - The easing function for the velocity.
     * @returns {MotionCurve} The newly created MotionCurve instance.
     */
    ElementRecipe.prototype.createVelocityEquation = function(propName, easingFunc) {
      // Ensure there's an AnimationSpec for this property first
      if (!this.animationSpecs[propName]) {
        this.defineChangeFor(propName);
      }
      // Replace the standard easing function with a MotionCurve instance
      this.animationSpecs[propName].withEasing(new MotionCurve(this.animationSpecs[propName], easingFunc));
      return this.animationSpecs[propName].easingFunction; // Return the MotionCurve instance
    };

    /**
     * Retrieves the computed value for a specific property at the current frame.
     * @param {string} propKey - The CSS property name.
     * @returns {number|null} The computed value or null if no rule exists or velocity mode is off.
     */
    ElementRecipe.prototype.getPropertyValue = function(propKey) {
      const spec = this.animationSpecs[propKey];
      if (spec && !(spec.isMotionCurveBased() && !this.isVelocityModeActive)) {
        return spec.determineValueForFrame(this.currentFramePosition, this.managedNode);
      }
      return null;
    };

    /**
     * Generates the CSS transform string based on active animation rules.
     * @returns {string|boolean} The transform string or false if no transforms are needed.
     */
    ElementRecipe.prototype.generateTransformStyle = function() {
      let transformParts = [];

      // Check if any transform properties are actively being animated
      if (!this._requiresTransformDeclaration() || !this.managedNode || this.currentFramePosition === null) {
        return false;
      }

      // Check browser capabilities through the main Flavor object
      if (Flavor.SUPPORTS_3D_TRANSFORMS) {
        if (this._involvesTranslation()) {
          const x = this.getPropertyValue("x") ?? 0;
          const y = this.getPropertyValue("y") ?? 0;
          const z = this.getPropertyValue("z") ?? 0;
          transformParts.push(`translate3d(${x}px, ${y}px, ${z}px)`);
        }
        if (this._involvesPreciseScaling()) {
          const sx = this.getPropertyValue("scaleX") ?? 1;
          const sy = this.getPropertyValue("scaleY") ?? 1;
          const sz = this.getPropertyValue("scaleZ") ?? 1;
          transformParts.push(`scale3d(${sx}, ${sy}, ${sz})`);
        } else if (this._involvesUniformScaling()) {
          const s = this.getPropertyValue("scale") ?? 1;
          transformParts.push(`scale3d(${s}, ${s}, ${s})`);
        }
        if (this._involves3DRotation()) {
          const rx = this.getPropertyValue("rotateX") ?? 0;
          const ry = this.getPropertyValue("rotateY") ?? 0;
          const rz = this.getPropertyValue("rotateZ") ?? 0;
          const r = this.getPropertyValue("rotate") ?? 0;
          transformParts.push(`rotate3d(${rx}, ${ry}, ${rz}, ${r}deg)`); // Note: rotate3d takes 4 values (x,y,z,angle)
        } else if (this._involvesRotation()) {
          const r = this.getPropertyValue("rotate") ?? 0;
          transformParts.push(`rotate(${r}deg)`);
        }
      } else if (Flavor.SUPPORTS_2D_TRANSFORMS) {
        if (this._involvesTranslation()) {
          const x = this.getPropertyValue("x") ?? 0;
          const y = this.getPropertyValue("y") ?? 0;
          transformParts.push(`translate(${x}px, ${y}px)`);
        }
        if (this._involvesUniformScaling()) {
          const s = this.getPropertyValue("scale") ?? 1;
          transformParts.push(`scale(${s}, ${s})`);
        }
        if (this._involvesRotation()) {
          const r = this.getPropertyValue("rotate") ?? 0;
          transformParts.push(`rotate(${r}deg)`);
        }
      }

      return transformParts.length > 0 ? transformParts.join(" ") : false;
    };

    /**
     * Generates a CSS style string for the current frame.
     * @param {number} frameIndex - The current frame index.
     * @returns {string} A CSS style declaration string.
     */
    ElementRecipe.prototype.generateCSSString = function(frameIndex) {
      this.currentFramePosition = frameIndex;
      let styleDeclarations = [];

      if (this.animationSpecs) {
        for (const propName in this.animationSpecs) {
          const spec = this.animationSpecs[propName];
          let isTransformProperty = ElementRecipe.STATIC_ALL_TRANSFORM_IDENTIFIERS.containsItem(propName);
          let propUnits = ElementRecipe.STATIC_UNIT_APPLYING_IDENTIFIERS.containsItem(propName) ? spec.measurementUnit : "";

          // Ensure value is calculated even if not directly generating CSS for it (e.g., transform props)
          const propValue = spec.determineValueForFrame(this.currentFramePosition, this.managedNode);

          if (!isTransformProperty) {
            styleDeclarations.push(`${propName}: ${propValue}${propUnits};`);
          }
        }
      }

      // Handle non-transform fallbacks for x/y if transforms are not supported
      if (!Flavor.SUPPORTS_2D_TRANSFORMS) {
        const xVal = this.getPropertyValue("x");
        if (xVal !== null) styleDeclarations.push(`left: ${xVal}px;`);
        const yVal = this.getPropertyValue("y");
        if (yVal !== null) styleDeclarations.push(`top: ${yVal}px;`);
      } else {
        // Apply transform styles if supported and generated
        const transformOutput = this.generateTransformStyle();
        if (transformOutput) {
          styleDeclarations.push(`-${Flavor.BROWSER_PREFIX}-transform: ${transformOutput};`);
          styleDeclarations.push(`transform: ${transformOutput};`); // Standard property for modern browsers
        }
      }
      return styleDeclarations.join(" ");
    };

    /**
     * Checks if any transform-related properties have active rules.
     * @returns {boolean} True if transforms are needed.
     * @private
     */
    ElementRecipe.prototype._requiresTransformDeclaration = function() {
      return this._hasAnyRuleForProperties(ElementRecipe.STATIC_ALL_TRANSFORM_IDENTIFIERS);
    };

    /**
     * Checks if translation properties have active rules.
     * @returns {boolean} True if translation is involved.
     * @private
     */
    ElementRecipe.prototype._involvesTranslation = function() {
      return this._hasAnyRuleForProperties(ElementRecipe.STATIC_TRANSLATION_IDENTIFIERS);
    };

    /**
     * Checks if precise scaling (scaleX, scaleY, scaleZ) properties have active rules.
     * @returns {boolean} True if precise scaling is involved.
     * @private
     */
    ElementRecipe.prototype._involvesPreciseScaling = function() {
      return this._hasAnyRuleForProperties(ElementRecipe.STATIC_PRECISE_SCALE_IDENTIFIERS);
    };

    /**
     * Checks if uniform scaling (scale) property has an active rule.
     * @returns {boolean} True if uniform scaling is involved.
     * @private
     */
    ElementRecipe.prototype._involvesUniformScaling = function() {
      return !!this.animationSpecs[ElementRecipe.STATIC_SCALE_IDENTIFIER];
    };

    /**
     * Checks if 3D rotation (rotateX, rotateY, rotateZ) properties have active rules.
     * @returns {boolean} True if 3D rotation is involved.
     * @private
     */
    ElementRecipe.prototype._involves3DRotation = function() {
      return this._hasAnyRuleForProperties(ElementRecipe.STATIC_PRECISE_ROTATION_IDENTIFIERS);
    };

    /**
     * Checks if 2D rotation (rotate) property has an active rule.
     * @returns {boolean} True if 2D rotation is involved.
     * @private
     */
    ElementRecipe.prototype._involvesRotation = function() {
      return !!this.animationSpecs[ElementRecipe.STATIC_ROTATION_IDENTIFIER];
    };

    /**
     * Helper to check if any of the given properties have an active animation rule.
     * @param {string[]} propertyKeys - An array of property names to check.
     * @returns {boolean} True if at least one property has a rule.
     * @private
     */
    ElementRecipe.prototype._hasAnyRuleForProperties = function(propertyKeys) {
      return propertyKeys.some(key => !!this.animationSpecs[key]);
    };

    return ElementRecipe;

  })();

  // The main animation orchestration class.
  this.Flavor = (function() {

    // Static counter for unique animation IDs.
    let _GLOBAL_ANIM_COUNTER = 0;

    /**
     * Generates a unique animation ID.
     * @returns {number} A new unique animation ID.
     */
    Flavor.getNextAnimationID = function() {
      return ++_GLOBAL_ANIM_COUNTER;
    };

    /**
     * Static method to create and apply an animator instance with a recipe.
     * @param {Function} recipeCallback - The function defining animation rules.
     * @returns {Flavor} A new Flavor instance.
     */
    Flavor.createAnimator = function(recipeCallback) {
      return new Flavor({
        animationRecipe: recipeCallback
      });
    };

    // Browser capabilities and prefixes (initialized once)
    Flavor.BROWSER_PREFIX = null;
    Flavor.SUPPORTS_2D_TRANSFORMS = false;
    Flavor.SUPPORTS_3D_TRANSFORMS = false;
    Flavor.BROWSER_ANIM_PROPS = {};
    Flavor.DEFAULT_STYLESHEET = null;

    /**
     * Detects browser capabilities for CSS transforms and animations.
     * @param {boolean} [force2d=false] - If true, forces 2D transforms even if 3D is supported.
     * @private
     */
    Flavor.getBrowserCapabilities = function(force2d = false) {
      const style = document.createElement('div').style;
      const prefixes = ['webkit', 'moz', 'ms', 'o', ''];
      const transformProps = ['transform', 'WebkitTransform', 'MozTransform', 'msTransform', 'OTransform'];
      const animationProps = ['animation', 'WebkitAnimation', 'MozAnimation', 'msAnimation', 'OAnimation'];

      for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];
        const testTransform = `${prefix}Transform`;
        const testAnimation = `${prefix}Animation`;

        if (style[testTransform] !== undefined) {
          Flavor.BROWSER_PREFIX = prefix;
          Flavor.BROWSER_ANIM_PROPS.animationName = `${prefix}AnimationName`;
          Flavor.BROWSER_ANIM_PROPS.animationDelay = `${prefix}AnimationDelay`;
          Flavor.BROWSER_ANIM_PROPS.animationDuration = `${prefix}AnimationDuration`;
          Flavor.BROWSER_ANIM_PROPS.animationIteration = `${prefix}AnimationIterationCount`;
          Flavor.BROWSER_ANIM_PROPS.animationEnd = `${prefix}AnimationEnd`;
          Flavor.BROWSER_ANIM_PROPS.transform = testTransform;

          // Check 3D support
          style[testTransform] = 'translate3d(1px,1px,1px)';
          const has3d = style[testTransform].indexOf('translate3d') > -1;
          Flavor.SUPPORTS_3D_TRANSFORMS = has3d && !force2d;
          Flavor.SUPPORTS_2D_TRANSFORMS = true; // If 3D, then 2D is also supported.
          break;
        }
      }

      // If no prefix found, assume standard properties (modern browsers)
      if (!Flavor.BROWSER_PREFIX) {
        Flavor.BROWSER_PREFIX = ''; // No prefix
        Flavor.BROWSER_ANIM_PROPS = {
          animationName: 'animationName',
          animationDelay: 'animationDelay',
          animationDuration: 'animationDuration',
          animationIteration: 'animationIterationCount',
          animationEnd: 'animationend',
          transform: 'transform'
        };
        // Test for standard transform support
        style.transform = 'translate(1px,1px)';
        Flavor.SUPPORTS_2D_TRANSFORMS = style.transform.indexOf('translate') > -1;
        style.transform = 'translate3d(1px,1px,1px)';
        Flavor.SUPPORTS_3D_TRANSFORMS = style.transform.indexOf('translate3d') > -1 && !force2d;
      }

      // Create a default stylesheet if one doesn't exist
      if (!Flavor.DEFAULT_STYLESHEET) {
        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.id = 'flavor-dynamic-styles';
        document.head.appendChild(styleTag);
        Flavor.DEFAULT_STYLESHEET = styleTag.sheet;
      }
    };


    /**
     * Constructor for the Flavor animation system.
     * @param {object} [config={}] - Configuration options.
     * @param {CSSStyleSheet} [config.stylesheet=Flavor.DEFAULT_STYLESHEET] - The stylesheet to insert rules into.
     * @param {number} [config.totalKeyframes=60] - The total number of keyframes for the animation.
     * @param {Function} [config.animationRecipe] - Callback function to define animation rules.
     * @param {Function} [config.onCompletion] - Callback function when animation finishes.
     * @param {boolean} [config.force2d=false] - Forces 2D transforms.
     */
    function Flavor(config = {}) {
      // Initialize browser capabilities if not already done
      if (!Flavor.BROWSER_PREFIX) {
        Flavor.getBrowserCapabilities(config.force2d);
      }

      this.styleSheetRef = config.stylesheet || Flavor.DEFAULT_STYLESHEET;
      this.totalKeyframes = config.totalKeyframes || 60;
      this.animationRecipeCallback = config.animationRecipe || null;
      this.activeAnimations = {}; // Stores generated animation names
      this.delayDuration = 0; // in seconds
      this.playbackDuration = 1; // in seconds
      this.iterationCount = 1; // Number of times animation repeats
      this.managedNodesCache = {}; // Cache for DOMNodeHandler instances
      this._recipeProcessor = new ElementRecipe(); // The recipe processor for the current animation
      this._onCompletionCallback = config.onCompletion || null;
      this._lastUsedElementId = null; // Track the last element ID for chaining
      this._animationCompletionHandler = null; // Stores the bound event listener
    }

    /**
     * Sets the animation recipe callback.
     * @param {Function} recipeFunc - The function defining animation rules.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.withRecipe = function(recipeFunc) {
      this.animationRecipeCallback = recipeFunc;
      return this;
    };

    /**
     * Calculates the percentage interval between keyframes.
     * @returns {number} The percentage step per keyframe.
     */
    Flavor.prototype.getKeyframeInterval = function() {
      return 100 / this.totalKeyframes;
    };

    /**
     * Sets the callback function for when the animation completes.
     * @param {Function} completeCallback - The function to call on completion.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.onAnimationComplete = function(completeCallback) {
      this._onCompletionCallback = completeCallback;
      return this;
    };

    /**
     * Sets the total playback duration of the animation.
     * @param {number} durationInSeconds - The duration in seconds.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.setDuration = function(durationInSeconds) {
      this.playbackDuration = durationInSeconds;
      return this;
    };

    /**
     * Sets the delay before the animation starts.
     * @param {number} delayInSeconds - The delay in seconds.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.setDelay = function(delayInSeconds) {
      this.delayDuration = delayInSeconds;
      return this;
    };

    /**
     * Sets the number of times the animation should repeat.
     * @param {number} repeatCount - The iteration count (e.g., 1, 2, 'infinite').
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.setIterations = function(repeatCount) {
      this.iterationCount = repeatCount;
      return this;
    };

    /**
     * Applies the defined animation recipe to a specific DOM element.
     * @param {string} elementIdentifier - The ID of the DOM element.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.applyToElement = function(elementIdentifier) {
      const targetNodeHandler = this._retrieveOrCreateNodeHandler(elementIdentifier);
      this._lastUsedElementId = elementIdentifier; // Store for chaining

      // If element has initial data-properties, extract them
      const dataPropertiesAttr = targetNodeHandler.targetNode.getAttribute("data-properties");
      if (dataPropertiesAttr) {
        const initialProperties = dataPropertiesAttr.split(",");
        initialProperties.forEach(propKey => {
          const initialValue = targetNodeHandler.targetNode.getAttribute(`data-${propKey}`);
          if (initialValue !== null) {
            this._recipeProcessor.defineChangeFor(propKey)
              .fromValue(initialValue)
              .toValue(initialValue); // Set start and end to current value
          }
        });
      }

      // Execute the user-defined recipe to populate animation rules
      if (typeof this.animationRecipeCallback === 'function') {
        this.animationRecipeCallback(this._recipeProcessor);
      } else {
        console.warn("Flavor: No animation recipe callback defined. Animation may not have any rules.");
      }

      this._generateAnimationStyles(elementIdentifier);
      this._applyInitialCSS(0, targetNodeHandler); // Apply initial frame styles
      this._assignAnimationToNode(targetNodeHandler); // Assign the generated animation

      return this;
    };

    /**
     * Alias for `applyToElement`.
     * @param {string} elementIdentifier - The ID of the DOM element.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.toElement = function(elementIdentifier) {
      return this.applyToElement(elementIdentifier);
    };

    /**
     * Alias for `setDuration`.
     * @param {number} duration - The duration in seconds.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.andDuration = function(duration) {
      return this.setDuration(duration);
    };

    /**
     * Alias for `setDelay`.
     * @param {number} delay - The delay in seconds.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.plusDelay = function(delay) {
      return this.setDelay(delay);
    };

    /**
     * Alias for `setIterations`.
     * @param {number} iterations - The iteration count.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.repeatTimes = function(iterations) {
      return this.setIterations(iterations);
    };

    /**
     * Reapplies the last defined animation to another element or the same element.
     * Useful for applying the same animation configuration to multiple elements.
     * @param {string} elementIdentifier - The ID of the DOM element.
     * @returns {Flavor} This instance for chaining.
     */
    Flavor.prototype.reapplyToElement = function(elementIdentifier) {
      const targetNodeHandler = this._retrieveOrCreateNodeHandler(elementIdentifier);
      this._lastUsedElementId = elementIdentifier;
      this._assignAnimationToNode(targetNodeHandler);
      return this;
    };

    /**
     * Generates the CSS @keyframes rule for the animation.
     * @param {string} elementIdentifier - The ID of the element the animation is for.
     * @private
     */
    Flavor.prototype._generateAnimationStyles = function(elementIdentifier) {
      const animationId = Flavor.getNextAnimationID();
      const timestamp = new Date().getTime();
      const uniqueAnimationName = `flavor_anim_${animationId}_${timestamp}`;
      this.activeAnimations[elementIdentifier] = uniqueAnimationName;

      let keyframeStyleBlocks = [];
      this._recipeProcessor.isVelocityModeActive = true; // Enable velocity calculation during keyframe generation

      for (let currentFrameIndex = 0; currentFrameIndex <= this.totalKeyframes; currentFrameIndex++) {
        const keyframePercentage = this._calculateKeyframePercentage(currentFrameIndex);
        let frameDescriptor = `${keyframePercentage}%`;

        // Special handling for 'from' and 'to' keywords
        if (currentFrameIndex === 0) {
          frameDescriptor = "from";
        } else if (currentFrameIndex === this.totalKeyframes) {
          frameDescriptor = "to";
        }

        this._recipeProcessor.managedNode = this._retrieveOrCreateNodeHandler(elementIdentifier);
        const frameCSS = this._recipeProcessor.generateCSSString(keyframePercentage);
        keyframeStyleBlocks.push(` ${frameDescriptor} { ${frameCSS} }`);
      }

      const fullKeyframeRule = `@-${Flavor.BROWSER_PREFIX}-keyframes ${uniqueAnimationName} {${keyframeStyleBlocks.join("")}}`;
      const standardKeyframeRule = `@keyframes ${uniqueAnimationName} {${keyframeStyleBlocks.join("")}}`;

      this._recipeProcessor.isVelocityModeActive = false; // Disable velocity mode after generation

      // Insert the rules into the stylesheet
      try {
        const currentRuleCount = this.styleSheetRef.cssRules ? this.styleSheetRef.cssRules.length : 0;
        this.styleSheetRef.insertRule(fullKeyframeRule, currentRuleCount);
        if (Flavor.BROWSER_PREFIX !== '') { // Also insert standard rule if a prefix was used
           this.styleSheetRef.insertRule(standardKeyframeRule, currentRuleCount + 1);
        }
      } catch (e) {
        console.error("Flavor: Could not insert keyframe rule.", e);
        console.log("Attempted CSS rule:", fullKeyframeRule);
      }
    };

    /**
     * Assigns the generated animation to the target DOM element.
     * @param {DOMNodeHandler} targetNodeHandler - The handler for the target DOM element.
     * @private
     */
    Flavor.prototype._assignAnimationToNode = function(targetNodeHandler) {
      const style = targetNodeHandler.targetNode.style;
      const animName = this.activeAnimations[this._lastUsedElementId];

      style[Flavor.BROWSER_ANIM_PROPS.animationName] = animName;
      style[Flavor.BROWSER_ANIM_PROPS.animationDelay] = `${this.delayDuration}s`;
      style[Flavor.BROWSER_ANIM_PROPS.animationDuration] = `${this.playbackDuration}s`;
      style[Flavor.BROWSER_ANIM_PROPS.animationIteration] = this.iterationCount;

      // Ensure previous listener is removed to prevent multiple calls
      if (this._animationCompletionHandler) {
        targetNodeHandler.targetNode.removeEventListener(Flavor.BROWSER_ANIM_PROPS.animationEnd, this._animationCompletionHandler);
      }

      // Bind and store the new event listener
      this._animationCompletionHandler = this._handleAnimationCompletion.bind(this, targetNodeHandler);
      targetNodeHandler.targetNode.addEventListener(Flavor.BROWSER_ANIM_PROPS.animationEnd, this._animationCompletionHandler, false);
    };

    /**
     * Retrieves an existing DOMNodeHandler from cache or creates a new one.
     * @param {string} elementIdentifier - The ID of the DOM element.
     * @returns {DOMNodeHandler} The handler for the specified element.
     * @private
     */
    Flavor.prototype._retrieveOrCreateNodeHandler = function(elementIdentifier) {
      let nodeHandler = this.managedNodesCache[elementIdentifier];
      if (!nodeHandler) {
        nodeHandler = new DOMNodeHandler(elementIdentifier);
        this.managedNodesCache[elementIdentifier] = nodeHandler;
      }
      return nodeHandler;
    };

    /**
     * Handles the animation completion event.
     * @param {DOMNodeHandler} targetNodeHandler - The handler for the completed element.
     * @private
     */
    Flavor.prototype._handleAnimationCompletion = function(targetNodeHandler) {
      // Clean up event listener
      targetNodeHandler.targetNode.removeEventListener(Flavor.BROWSER_ANIM_PROPS.animationEnd, this._animationCompletionHandler);
      this._animationCompletionHandler = null; // Clear reference

      // Apply the final state (100% keyframe) to ensure element stays in place
      this._applyInitialCSS(100, targetNodeHandler);

      // Execute the user-defined completion callback if provided
      if (typeof this._onCompletionCallback === 'function') {
        this._onCompletionCallback(targetNodeHandler.targetNode); // Pass the raw DOM element
      }
      // Clear the callback reference to prevent accidental re-execution if the object is reused.
      this._onCompletionCallback = null;
    };

    /**
     * Computes the percentage for a given frame index.
     * @param {number} frameIndex - The current frame index (0 to totalKeyframes).
     * @returns {number} The percentage (0-100).
     * @private
     */
    Flavor.prototype._calculateKeyframePercentage = function(frameIndex) {
      return (frameIndex / this.totalKeyframes) * 100;
    };

    /**
     * Applies CSS styles for a specific frame directly to an element's style attribute.
     * Useful for setting initial/final states or for browsers without @keyframes support.
     * @param {number} frameNumber - The frame index (0 to totalKeyframes).
     * @param {DOMNodeHandler} targetNodeHandler - The handler for the target DOM element.
     * @private
     */
    Flavor.prototype._applyInitialCSS = function(frameNumber, targetNodeHandler) {
      const keyframePercentage = this._calculateKeyframePercentage(frameNumber);
      this._recipeProcessor.managedNode = targetNodeHandler; // Set the current element in the recipe processor
      const generatedCSS = this._recipeProcessor.generateCSSString(keyframePercentage);

      // Apply individual styles for non-transform properties
      if (this._recipeProcessor.animationSpecs) {
        let currentTrackedProperties = new Set();
        const existingDataProps = targetNodeHandler.targetNode.getAttribute("data-properties");
        if (existingDataProps) {
          existingDataProps.split(",").forEach(p => currentTrackedProperties.add(p));
        }

        for (const propName in this._recipeProcessor.animationSpecs) {
          const spec = this._recipeProcessor.animationSpecs[propName];
          if (!ElementRecipe.STATIC_ALL_TRANSFORM_IDENTIFIERS.containsItem(propName)) {
            targetNodeHandler.targetNode.style[propName] = `${spec.cachedValue}${spec.measurementUnit}`;
            targetNodeHandler.targetNode.setAttribute(`data-${propName}`, spec.cachedValue);
            currentTrackedProperties.add(propName);
          }
        }
        targetNodeHandler.targetNode.setAttribute("data-properties", Array.from(currentTrackedProperties).join(","));
      }

      // Apply transform styles if supported
      if (Flavor.SUPPORTS_2D_TRANSFORMS) {
        const transformString = this._recipeProcessor.generateTransformStyle();
        if (transformString) {
          targetNodeHandler.targetNode.style[Flavor.BROWSER_ANIM_PROPS.transform] = transformString;
          targetNodeHandler.targetNode.style.transform = transformString; // Standard property
        } else {
          // If no transforms needed, explicitly clear the transform property
          targetNodeHandler.targetNode.style[Flavor.BROWSER_ANIM_PROPS.transform] = '';
          targetNodeHandler.targetNode.style.transform = '';
        }
      }
    };

    return Flavor;

  })();

})();