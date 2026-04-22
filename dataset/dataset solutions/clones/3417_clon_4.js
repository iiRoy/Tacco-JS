function processBurgerConsumption(mealSpecifications) {
  const contentLines = mealSpecifications.split("\n");
  const numericalParameters = contentLines[0].split(" ").map(Number);
  const burgerLayerDepth = numericalParameters[0];
  const consumedSegmentLength = numericalParameters[1];

  const layerDimensionRegistry = new Map();
  const pattyComponentRegistry = new Map();

  const determineTotalLayerCount = (level) => {
    if (level === 0) return 1;
    if (layerDimensionRegistry.has(level)) return layerDimensionRegistry.get(level);

    const calculatedValue = 2 * determineTotalLayerCount(level - 1) + 3;
    layerDimensionRegistry.set(level, calculatedValue);
    return calculatedValue;
  };

  const determineTotalPattyCount = (level) => {
    if (level === 0) return 1;
    if (pattyComponentRegistry.has(level)) return pattyComponentRegistry.get(level);

    const calculatedValue = 2 * determineTotalPattyCount(level - 1) + 1;
    pattyComponentRegistry.set(level, calculatedValue);
    return calculatedValue;
  };

  const calculatePattiesInSegment = (currentLevel, remainingSegment) => {
    if (currentLevel === 0) {
      return remainingSegment >= 1 ? 1 : 0;
    }

    if (remainingSegment <= 0) {
      return 0;
    }

    const subBurgerTotalLayers = determineTotalLayerCount(currentLevel - 1);
    const subBurgerTotalPatties = determineTotalPattyCount(currentLevel - 1);

    if (remainingSegment === 1) {
      return 0;
    }

    if (remainingSegment <= 1 + subBurgerTotalLayers) {
      return calculatePattiesInSegment(currentLevel - 1, remainingSegment - 1);
    }

    if (remainingSegment === 1 + subBurgerTotalLayers + 1) {
      return subBurgerTotalPatties + 1;
    }

    const layersBeforeRightSubBurger = 1 + subBurgerTotalLayers + 1;
    return subBurgerTotalPatties + 1 + calculatePattiesInSegment(currentLevel - 1, remainingSegment - layersBeforeRightSubBurger);
  };

  const finalPattyResult = calculatePattiesInSegment(burgerLayerDepth, consumedSegmentLength);
  console.log(String(finalPattyResult));
}
  
function performTestRun(){
  var testInput = document.getElementById("input").value;
  processBurgerConsumption(testInput);
}
processBurgerConsumption(require("fs").readFileSync("/dev/stdin", "utf8"));