const processInputAndCompute = (inputData) => {
  const [widthDimension, heightDimension, coordX, coordY] = inputData.split(" ").map(Number);

  const totalSurfaceArea = widthDimension * heightDimension;
  const halfSurfaceArea = totalSurfaceArea / 2;

  // Predicate functions to identify specific geometric conditions
  const isAtCenter = (px, py, w, h) => px === w / 2 && py === h / 2;
  const isOnMidlineOrEdge = (px, py, w, h) => px === w || py === h || px === w / 2 || py === h / 2;
  const isDiagonalLike = (px, py, w, h) => (px / py === w / h) || (px * px / py + py === h);

  // Function to handle the general case calculation
  const computeGeneralCase = (px, py, w, h, totalS) => {
    let adjustmentValue = 0;
    const intersectionX_at_H = (py / px) * h;
    const intersectionY_at_W = (px / py) * w;

    if (intersectionX_at_H < w) {
      adjustmentValue = (px - intersectionX_at_H) * (h - py);
    } else if (intersectionY_at_W < h) {
      adjustmentValue = (w - px) * (py - intersectionY_at_W);
    }

    const segmentAreaA = (w - px) * (h - py) / 2 + (px * py) + adjustmentValue;
    const segmentAreaB = totalS - segmentAreaA;
    
    return { primaryArea: Math.max(segmentAreaA, segmentAreaB), splitCount: 0 };
  };

  // Dispatch table for different conditions, ordered by precedence
  const conditionHandlers = [
    {
      check: (px, py, w, h) => isAtCenter(px, py, w, h),
      execute: (w, h, totalS, halfS) => ({ primaryArea: halfS, splitCount: 1 })
    },
    {
      check: (px, py, w, h) => isOnMidlineOrEdge(px, py, w, h),
      execute: (w, h, totalS, halfS) => ({ primaryArea: halfS, splitCount: 0 })
    },
    {
      check: (px, py, w, h) => isDiagonalLike(px, py, w, h),
      execute: (w, h, totalS, halfS) => ({ primaryArea: halfS, splitCount: 1 })
    },
    {
      check: () => true, // Default case
      execute: (w, h, totalS, halfS, px, py) => computeGeneralCase(px, py, w, h, totalS)
    }
  ];

  let computedResult = { primaryArea: 0, splitCount: 0 };

  for (const handler of conditionHandlers) {
    if (handler.check(coordX, coordY, widthDimension, heightDimension)) {
      computedResult = handler.execute(widthDimension, heightDimension, totalSurfaceArea, halfSurfaceArea, coordX, coordY);
      break;
    }
  }

  const secondaryArea = totalSurfaceArea - computedResult.primaryArea;
  console.log(`${secondaryArea} ${computedResult.splitCount}`);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
