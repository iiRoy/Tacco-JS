function resolveBasePair(inputBase) {
  const complementMap = new Map([
    ['A', 'T'],
    ['T', 'A'],
    ['C', 'G']
  ]);

  const outputBase = complementMap.get(inputBase);
  console.log(outputBase !== undefined ? outputBase : 'C');
}

resolveBasePair(require('fs').readFileSync('/dev/stdin', 'utf8'));
