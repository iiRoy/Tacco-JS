console.log((function(inputDataPayload) {
  const processGraphData = (sourceMaterial) => {
    const tokens = sourceMaterial.trim().split(/\s+/).filter(Boolean);
    let tokenIndex = 0;
    const nodeExtent = Number(tokens[tokenIndex++]);
    const arcCount = Number(tokens[tokenIndex++]);
    const arcList = Array.from({ length: arcCount }, () => ({
      departure: Number(tokens[tokenIndex++]),
      arrival: Number(tokens[tokenIndex++])
    }));
    return { nodeExtent, arcCount, arcList };
  };

  const performRouteAnalysis = (graphDetails) => {
    const { arcCount, arcList } = graphDetails;

    // pathMetricsByIteration[k] stores a Map<node, max_path_length> for paths of exactly k steps
    const pathMetricsByIteration = Array.from({ length: arcCount + 1 }).reduce((accumulator, _, currentIteration) => {
      if (currentIteration === 0) {
        // Base case: iteration 0 implies paths of length 0. All nodes have an implicit path length of 0.
        // We represent this as an empty Map, as 'get' will return undefined, which evaluates to 0 with '|| 0'.
        accumulator.push(new Map());
        return accumulator;
      }

      const priorIterationMetrics = accumulator[currentIteration - 1];
      const currentIterationMetrics = new Map();

      arcList.forEach(currentArc => {
        const previousPathSpan = priorIterationMetrics.get(currentArc.departure) || 0;

        // A path of length 1 can start from any departure node (previousPathSpan is 0 from iteration 0).
        // For subsequent iterations, only extend existing paths (previousPathSpan > 0).
        if (previousPathSpan > 0 || currentIteration === 1) {
          const candidatePathSpan = previousPathSpan + 1;
          const existingPathSpan = currentIterationMetrics.get(currentArc.arrival) || 0;
          currentIterationMetrics.set(currentArc.arrival, Math.max(existingPathSpan, candidatePathSpan));
        }
      });
      accumulator.push(currentIterationMetrics);
      return accumulator;
    }, []);

    // The result is the maximum path length found in the final iteration (arcCount steps).
    const finalMetrics = pathMetricsByIteration[arcCount];
    const allFinalSpans = Array.from(finalMetrics.values());
    
    // Handle case where allFinalSpans is empty or contains only zeros
    return Math.max(0, ...allFinalSpans);
  };

  const graphData = processGraphData(inputDataPayload);
  const resultValue = performRouteAnalysis(graphData);
  return resultValue.toString();
})(require('fs').readFileSync('/dev/stdin', 'utf8')));