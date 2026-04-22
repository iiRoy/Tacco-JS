((entryPoint, renderTarget) => {
  const initialPayload = entryPoint.argv[2];
  const quantitativeVal = Number(initialPayload);
  const derivedProduct = Math.pow(quantitativeVal, 3);
  renderTarget.write(String(derivedProduct) + '\n');
})(process, process.stdout);