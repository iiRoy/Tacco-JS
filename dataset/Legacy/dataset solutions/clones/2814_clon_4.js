'use strict';

function processGraphRequest(inputLines) {
  const [vertexCount, nonAdjacentPairs] = inputLines[0].split(' ').map(Number);

  let segmentPoint = -1;
  let foundSolution = false;

  // The original code searches for an integer 'M' (renamed to segmentPoint)
  // that satisfies the equation:
  // (N - M + 1) * (N - M) / 2 + M - 2 === K
  // Let X = N - M. Substituting this into the equation:
  // (X + 1) * X / 2 + (N - X) - 2 === K
  // Multiply by 2:
  // X^2 + X + 2 * (N - X) - 4 === 2K
  // X^2 + X + 2N - 2X - 4 === 2K
  // X^2 - X + (2N - 4 - 2K) === 0
  // This is a quadratic equation of the form aX^2 + bX + c = 0,
  // where a=1, b=-1, c=(2N - 4 - 2K).
  // The discriminant (delta) is b^2 - 4ac.
  // delta = (-1)^2 - 4 * 1 * (2N - 4 - 2K)
  // delta = 1 - 8N + 16 + 8K
  // delta = 8K - 8N + 17

  const discriminantValue = 8 * nonAdjacentPairs - 8 * vertexCount + 17;

  if (discriminantValue >= 0) {
    const sqrtDiscriminant = Math.sqrt(discriminantValue);

    // For X to be an integer, sqrtDiscriminant must be an integer.
    // Also, (1 +/- sqrtDiscriminant) must be even, which means sqrtDiscriminant must be odd.
    if (sqrtDiscriminant % 1 === 0 && sqrtDiscriminant % 2 !== 0) {
      // There are two potential solutions for X:
      // X1 = (1 - sqrtDiscriminant) / 2
      // X2 = (1 + sqrtDiscriminant) / 2
      // Since M = N - X, a smaller X results in a larger M.
      // The original loop iterates M downwards from N, so it finds the largest valid M first.
      // Thus, we prioritize the X that yields the largest M (i.e., the smallest X).

      const xCandidateSmall = (1 - sqrtDiscriminant) / 2;
      const mCandidateLarge = vertexCount - xCandidateSmall;

      // Check if this M is valid (integer and within [0, N])
      if (mCandidateLarge % 1 === 0 && mCandidateLarge >= 0 && mCandidateLarge <= vertexCount) {
        segmentPoint = mCandidateLarge;
        foundSolution = true;
      } else {
        // If the largest M candidate is not valid, try the other X (which yields a smaller M).
        const xCandidateLarge = (1 + sqrtDiscriminant) / 2;
        const mCandidateSmall = vertexCount - xCandidateLarge;

        if (mCandidateSmall % 1 === 0 && mCandidateSmall >= 0 && mCandidateSmall <= vertexCount) {
          segmentPoint = mCandidateSmall;
          foundSolution = true;
        }
      }
    }
  }

  if (!foundSolution) {
    console.log(-1);
    return;
  }

  console.log(vertexCount - 1);

  // Generate edges for the path segment (1 to segmentPoint)
  const pathEdges = Array.from({ length: segmentPoint - 1 }, (_, index) => {
    const currentVertex = index + 1;
    const nextVertex = index + 2;
    return `${currentVertex} ${nextVertex}`;
  });

  // Generate edges for the star segment (vertex 1 connected to segmentPoint+1 to N)
  const starEdges = Array.from({ length: vertexCount - segmentPoint }, (_, index) => {
    const connectedVertex = segmentPoint + 1 + index;
    return `${1} ${connectedVertex}`;
  });

  // Combine and print all generated edges
  const allGraphEdges = [...pathEdges, ...starEdges];
  allGraphEdges.forEach(edgePair => console.log(edgePair));
}

function initiateInputProcessing() {
  let inputBuffer = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    inputBuffer += chunk;
  });
  process.stdin.on("end", () => {
    processGraphRequest(inputBuffer.split("\n"));
  });
}

initiateInputProcessing();
