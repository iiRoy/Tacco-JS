function Main() {
  const inputValues = nextIntArray();
  const vertexTotal = inputValues[0];
  const colorSupply = inputValues[1];
  const primeModulus = 1000000007;

  const vertexRegistry = new Map();
  for (let h = 0; h < vertexTotal; h++) {
    vertexRegistry.set(h, { connections: new Set(), finalSelection: 0 });
  }

  for (let h = 0; h < vertexTotal - 1; h++) {
    const connectionPair = nextIntArray();
    const v1 = connectionPair[0] - 1;
    const v2 = connectionPair[1] - 1;
    vertexRegistry.get(v1).connections.add(v2);
    vertexRegistry.get(v2).connections.add(v1);
  }

  const exploredNodes = new Set();

  const traverseAndColor = (vtx, ancConstraint, currentAvailableColorOptions) => {
    exploredNodes.add(vtx);
    vertexRegistry.get(vtx).finalSelection = currentAvailableColorOptions;

    const nextAncConstraint = (ancConstraint < 2) ? ancConstraint + 1 : ancConstraint;
    let childCounter = 0;

    for (const neighbor of vertexRegistry.get(vtx).connections) {
      if (!exploredNodes.has(neighbor)) {
        const neighborColorOptions = colorSupply - childCounter - nextAncConstraint;
        traverseAndColor(neighbor, nextAncConstraint, neighborColorOptions);
        childCounter++;
      }
    }
  };

  traverseAndColor(0, 0, colorSupply);

  let totalProduct = 1;
  for (let h = 0; h < vertexTotal; h++) {
    totalProduct = (totalProduct * vertexRegistry.get(h).finalSelection) % primeModulus;
    if (totalProduct === 0) {
      break;
    }
  }

  myout(totalProduct);
}