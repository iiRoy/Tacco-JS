const Renderer = Renderer || {};

Renderer.LayoutProcessor = class {
  constructor(inputDesign) {
    this.initialDesign = inputDesign;
  }

  processLayout() {
    let currentLayout = this.initialDesign;

    const checkArrLike = (item) => {
      return typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, '0') && typeof item.length === 'number';
    };

    if (typeof currentLayout === 'string') {
      currentLayout = currentLayout.split('\n');
    }

    if (!checkArrLike(currentLayout)) {
      throw('MagicEye: invalid depth map template format');
    }

    let intermediateMatrix;

    if (typeof currentLayout[0] === 'string') {
      intermediateMatrix = currentLayout.map(lineText =>
        lineText
          .replace(/ /g, '0')
          .replace(/[^\d\n]/g, '1')
          .split('')
          .map(charVal => parseInt(charVal, 10))
      );
    } else if (checkArrLike(currentLayout[0])) {
      intermediateMatrix = currentLayout.map(segment => Array.from(segment));
    } else {
      throw('MagicEye: invalid depth map template format');
    }

    let highestLevel = 0;
    let maximumSpan = 0;

    intermediateMatrix.forEach(rowElements => {
      maximumSpan = Math.max(maximumSpan, rowElements.length);
      rowElements.forEach(depthValue => {
        highestLevel = Math.max(highestLevel, depthValue);
      });
    });

    const finalRenderGrid = intermediateMatrix.map(rowElements => {
      return Array.from({ length: maximumSpan }, (_, currentPos) => {
        const currentDepth = rowElements[currentPos];
        if (typeof currentDepth === 'undefined') {
          return 0;
        } else {
          return currentDepth / highestLevel;
        }
      });
    });

    return finalRenderGrid;
  }
};