/**
 * UI Component for managing CSS-driven transitions for child elements.
 * This component acts as a wrapper, orchestrating entry and exit animations for its content.
 * It ensures that children are properly prepared for their animated lifecycle.
 *
 * @module CSSAnimatedGroup
 * @flow
 */

"use strict";

var CoreUI = require("./CoreUIFramework");

var AnimationContainer = require("./AnimationContainer");
var AnimatedElement = require("./AnimatedElement");

// Define a set of default animation preferences for consistency.
const DEFAULT_ANIMATION_SETTINGS = {
  animateIn: true,
  animateOut: true
};

/**
 * The primary component responsible for managing a group of CSS animations.
 * It intercepts children and wraps them in an `AnimatedElement` for transition control.
 */
var CSSAnimatedGroup = CoreUI.defineComponent({
  // Specifies the expected properties and their types for this component.
  propertyValidation: {
    animationSet: CoreUI.PropertyChecks.string.required, // A mandatory string identifying the CSS animation class.
    animateIn: CoreUI.PropertyChecks.bool,               // Optional: Controls if elements should animate on entry.
    animateOut: CoreUI.PropertyChecks.bool               // Optional: Controls if elements should animate on exit.
  },

  // Provides default values for optional properties if they are not explicitly set.
  getInitialProperties: function() {
    // Return a shallow copy of default settings to prevent unintended mutations.
    const initialProps = { ...DEFAULT_ANIMATION_SETTINGS };
    // console.debug("CSSAnimatedGroup: Component initializing with default animation preferences."); // Debugging aid
    return initialProps;
  },

  /**
   * This function serves as a factory for creating wrapped animated children.
   * It's critical for allowing the animation container to manage children's
   * state throughout their transition phases (e.g., entering, leaving).
   * @param {CoreUI.Element} elementToAnimate - The child element to be wrapped.
   * @returns {CoreUI.Element|null} The wrapped AnimatedElement, or null if the input is invalid.
   */
  createAnimatedChild: function(elementToAnimate) {
    // Basic validation: ensure we're not trying to animate nothing.
    if (!elementToAnimate) {
      console.warn("CSSAnimatedGroup: Attempted to animate a null or undefined child element. It will be skipped.");
      return null;
    }

    // Collect the animation-related properties for the child element.
    const animationProps = {
      name: this.props.animationSet,
      enter: this.props.animateIn,
      leave: this.props.animateOut
    };

    // Robustness check: Although `animationSet` is required by `propertyValidation`,
    // a runtime check adds an extra layer of safety and explicit error messaging.
    if (!animationProps.name || typeof animationProps.name !== 'string') {
      console.error("CSSAnimatedGroup: The 'animationSet' property is missing or invalid. Animations may not function correctly.");
      // Fallback: provide a default empty name to prevent crashes, but warn.
      animationProps.name = '';
    }

    // Construct and return the AnimatedElement, passing the original child as its content.
    return (
      CoreUI.createElement(
        AnimatedElement,
        animationProps,
        elementToAnimate
      )
    );
  },

  /**
   * Renders the underlying animation container component.
   * This container then uses `createAnimatedChild` to process its children.
   * @returns {CoreUI.Element} The rendered AnimationContainer.
   */
  displayComponent: function() {
    // Extract `content` (formerly `children`) and animation-specific props.
    // All other props (`otherContainerProps`) are forwarded to the `AnimationContainer`.
    const { content, animationSet, animateIn, animateOut, ...otherContainerProps } = this.props;

    const containerChildren = content; // Renaming for enhanced clarity.

    // Create the animation wrapper, passing all relevant properties and the child factory.
    const animationWrapper = CoreUI.createElement(
      AnimationContainer,
      {
        ...otherContainerProps, // Spread any additional props directly to the AnimationContainer.
        childFactory: this.createAnimatedChild // Crucial link for child processing.
      },
      containerChildren // The actual content to be animated.
    );

    // Return the configured animation wrapper element.
    return animationWrapper;
  }
});

module.exports = CSSAnimatedGroup;