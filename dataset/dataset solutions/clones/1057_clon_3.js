class Coordinate {
  constructor(abscissaValue, ordinateValue) {
    this.abscissa = abscissaValue;
    this.ordinate = ordinateValue;
  }

  outputPosition() {
    console.log(this.abscissa.toFixed(7) + ' ' + this.ordinate.toFixed(7));
  }

  static createScaled(origin, deltaX, deltaY, scaleFactor) {
    return new Coordinate(
      origin.abscissa + deltaX * scaleFactor,
      origin.ordinate + deltaY * scaleFactor
    );
  }
}

const ANGLE_RADIANS = 60 * Math.PI / 180;
const SINE_VAL = Math.sin(ANGLE_RADIANS);
const COSINE_VAL = Math.cos(ANGLE_RADIANS);
const FRACTION_ONE_THIRD = 1.0 / 3.0;

function obtainRecursionDepth() {
  try {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
    const parsedDepth = Number(rawInput);
    if (isNaN(parsedDepth) || parsedDepth < 0) {
      console.error("Warning: Invalid recursion depth detected. Using default of 0.");
      return 0;
    }
    return parsedDepth;
  } catch (error) {
    console.error("Error reading input, defaulting recursion depth to 0:", error.message);
    return 0;
  }
}

function initializeFractalProcess() {
  const recursionLevel = obtainRecursionDepth();

  let startPoint = new Coordinate(0, 0);
  let endPoint = new Coordinate(100, 0);

  startPoint.outputPosition();

  generateKochSegment(recursionLevel, startPoint, endPoint);

  endPoint.outputPosition();
}

function generateKochSegment(currentLevel, startVertex, endVertex) {
  function subdivideAndRotate(level, pA, pB) {
    if (level <= 0) {
      return;
    }

    const deltaX = pB.abscissa - pA.abscissa;
    const deltaY = pB.ordinate - pA.ordinate;

    let intermediateA = Coordinate.createScaled(pA, deltaX, deltaY, FRACTION_ONE_THIRD);
    let intermediateB = Coordinate.createScaled(pA, deltaX, deltaY, 2 * FRACTION_ONE_THIRD);

    const vec_st_x = intermediateB.abscissa - intermediateA.abscissa;
    const vec_st_y = intermediateB.ordinate - intermediateA.ordinate;

    const rotated_vec_x = vec_st_x * COSINE_VAL - vec_st_y * SINE_VAL;
    const rotated_vec_y = vec_st_x * SINE_VAL + vec_st_y * COSINE_VAL;

    let rotatedVertex = new Coordinate(
      intermediateA.abscissa + rotated_vec_x,
      intermediateA.ordinate + rotated_vec_y
    );
    
    subdivideAndRotate(level - 1, pA, intermediateA);
    intermediateA.outputPosition();
    subdivideAndRotate(level - 1, intermediateA, rotatedVertex);
    rotatedVertex.outputPosition();
    subdivideAndRotate(level - 1, rotatedVertex, intermediateB);
    intermediateB.outputPosition();
    subdivideAndRotate(level - 1, intermediateB, pB);
  }

  subdivideAndRotate(currentLevel, startVertex, endVertex);
}

initializeFractalProcess();