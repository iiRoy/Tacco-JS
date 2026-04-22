"use strict";

const CoreReact = require("./React");
const AnimationContainer = require("./ReactTransitionGroup");
const AnimatedChildWrapper = require("./ReactCSSTransitionGroupChild");

class MotionComponentGroup extends CoreReact.Component {
  static attributeRules = {
    motionIdentifier: CoreReact.PropTypes.string.isRequired,
    shouldAnimateIn: CoreReact.PropTypes.bool,
    shouldAnimateOut: CoreReact.PropTypes.bool
  };

  static initialAttributeValues = {
    shouldAnimateIn: true,
    shouldAnimateOut: true
  };

  elementProducer = (incomingElement) => {
    return CoreReact.createElement(
      AnimatedChildWrapper,
      {
        keyName: this.props.motionIdentifier,
        entranceEffect: this.props.shouldAnimateIn,
        exitEffect: this.props.shouldAnimateOut
      },
      incomingElement
    );
  };

  render() {
    const {
      motionIdentifier,
      shouldAnimateIn,
      shouldAnimateOut,
      ...remainingPropsForContainer
    } = this.props;

    return CoreReact.createElement(
      AnimationContainer,
      {
        ...remainingPropsForContainer,
        elementProducer: this.elementProducer
      },
      this.props.children
    );
  }
}

module.exports = MotionComponentGroup;