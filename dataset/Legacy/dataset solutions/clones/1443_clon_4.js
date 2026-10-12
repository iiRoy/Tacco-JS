const processTriangleData = (inputLines) => {
  const [valA, valB, valDeg] = inputLines[0].split(/\s+/).map(Number);

  const calculateGeometricProperties = (initialSideA, initialSideB, initialAngleDegrees) => {
    const initialParameters = {
      primarySide: initialSideA,
      secondarySide: initialSideB,
      angleInDegrees: initialAngleDegrees
    };

    const transformToRadians = (currentParams) => ({
      ...currentParams,
      angleInRadians: currentParams.angleInDegrees * Math.PI / 180
    });

    const deriveThirdSideSquared = (currentParams) => ({
      ...currentParams,
      thirdSideSquared: (currentParams.primarySide * currentParams.primarySide) +
                        (currentParams.secondarySide * currentParams.secondarySide) -
                        (2 * currentParams.primarySide * currentParams.secondarySide * Math.cos(currentParams.angleInRadians))
    });

    const deriveThirdSide = (currentParams) => ({
      ...currentParams,
      thirdSide: Math.sqrt(currentParams.thirdSideSquared)
    });

    const deriveSurfaceArea = (currentParams) => ({
      ...currentParams,
      computedArea: (currentParams.primarySide * currentParams.secondarySide * Math.sin(currentParams.angleInRadians)) / 2
    });

    const deriveTotalPerimeter = (currentParams) => ({
      ...currentParams,
      totalPerimeter: currentParams.primarySide + currentParams.secondarySide + currentParams.thirdSide
    });

    const deriveAltitude = (currentParams) => ({
      ...currentParams,
      heightToPrimarySide: (2 * currentParams.computedArea) / currentParams.primarySide
    });

    const finalProperties = [
      transformToRadians,
      deriveThirdSideSquared,
      deriveThirdSide,
      deriveSurfaceArea,
      deriveTotalPerimeter,
      deriveAltitude
    ].reduce((accumulator, transformationFn) => transformationFn(accumulator), initialParameters);

    return {
      finalArea: finalProperties.computedArea,
      finalPerimeter: finalProperties.totalPerimeter,
      finalHeight: finalProperties.heightToPrimarySide
    };
  };

  const computedResults = calculateGeometricProperties(valA, valB, valDeg);

  console.log([
    computedResults.finalArea.toFixed(6),
    computedResults.finalPerimeter.toFixed(6),
    computedResults.finalHeight.toFixed(6),
  ].join(' '));
};

const inputAccumulator = [];
process.stdin.on('data', (dataSegment) => {
  inputAccumulator.push(dataSegment);
});

process.stdin.on('end', () => {
  const fullInputString = inputAccumulator.join('');
  const parsedInputLines = fullInputString.split('\n');
  processTriangleData(parsedInputLines);
});
