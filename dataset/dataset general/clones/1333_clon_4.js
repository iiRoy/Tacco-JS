function validateNumberRange(value, minimum, maximum, message) {
  if (value < minimum || value > maximum) {
    throw new Error(message);
  }
  return value;
}

const layoutSegmentMappings = Array.from({ length: 12 }, (_, index) => {
  const currentSegment = index + 1;
  return currentSegment === 12 ? '12' : `${currentSegment}-12`;
});

function produceResponsiveConfiguration(parameters = {}) {
  let segmentCount = parameters.segmentCount || 12;
  let displayMode = parameters.displayMode || '';
  const baseStylingClasses = parameters.baseStylingClasses || ['grid-item'];
  const computedStylingReferences = parameters.computedStylingReferences || ['visualLayoutId'];

  return {
    getSegmentCount: () => segmentCount,
    setSegmentCount: (newCount) => {
      segmentCount = validateNumberRange(newCount, 1, 12, 'Segment count must be within 1 and 12.');
    },

    getDisplayMode: () => displayMode,
    setDisplayMode: (newMode) => {
      displayMode = newMode;
    },

    getStaticStyleList: () => [...baseStylingClasses],
    getDynamicStyleDependencies: () => [...computedStylingReferences],

    get modeSuffix() {
      return displayMode ? `--${displayMode}` : '';
    },

    get visualLayoutId() {
      const effectiveSegmentCount = validateNumberRange(segmentCount, 1, 12, 'Segment count must be within 1 and 12.');
      const mainIdentifier = `g-r-c-${layoutSegmentMappings[effectiveSegmentCount - 1]}`;
      return `${mainIdentifier}${this.modeSuffix}`;
    }
  };
}