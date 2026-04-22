module.exports = function() {
  var screenLayoutTool = require('blessed');

  const sizingAndPositioning = {
    width: '30%',
    height: '10%',
    left: '30%',
    top: '0%'
  };

  const coreAttributes = {
    label: "{center}columns{/center}",
    tags: true,
    scrollable: true,
    keys: true
  };

  const borderDefinition = {
    type: 'line'
  };

  const internalSpacing = {
    left: 1,
    bottom: 2
  };

  const baseVisuals = {
    bg: 'black',
    fg: '#cccccc'
  };

  const borderVisuals = {
    fg: '#ffffff'
  };

  const hoverVisuals = {
    bg: 'green'
  };

  const selectionVisuals = {
    fg: "gray",
    bg: "black",
    inverse: true
  };

  const fullVisuals = Object.assign(
    {},
    baseVisuals, {
      border: borderVisuals,
      hover: hoverVisuals,
      selected: selectionVisuals
    }
  );

  const componentConfiguration = Object.assign(
    {},
    sizingAndPositioning,
    coreAttributes, {
      border: borderDefinition,
      padding: internalSpacing,
      style: fullVisuals
    }
  );

  var displayElement = screenLayoutTool.list(componentConfiguration);

  return displayElement;
}