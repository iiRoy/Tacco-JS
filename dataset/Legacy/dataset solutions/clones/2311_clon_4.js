const processGame = (params) => {
  const [totalTables, posOne, posTwo] = params.map(Number);

  const rawDiff = posTwo - posOne;
  const distToStart = posOne - 1;
  const distToEnd = totalTables - posTwo;

  const createRule = (conditionFn, resultFnOrValue, subRules = null) => ({
    condition: conditionFn,
    result: typeof resultFnOrValue === 'function' ? resultFnOrValue : () => resultFnOrValue,
    subRules: subRules
  });

  const ruleset = [
    createRule(() => rawDiff === 2, 1),
    createRule(() => (rawDiff - 1) % 2 !== 0, () => Math.abs(posOne - posTwo) / 2),
    createRule(
      () => distToStart <= distToEnd,
      null,
      [
        createRule(() => rawDiff === 1, () => posTwo - 1),
        createRule(() => rawDiff === 3, () => posOne + 1),
        createRule(() => rawDiff >= 5, () => posTwo - 3),
        createRule(() => true, () => posTwo - 1)
      ]
    ),
    createRule(
      () => true,
      null,
      [
        createRule(() => rawDiff === 1, () => totalTables - posOne),
        createRule(() => rawDiff === 3, () => totalTables - posTwo + 2),
        createRule(() => rawDiff >= 5, () => totalTables - posOne - 2),
        createRule(() => true, () => totalTables - posOne)
      ]
    )
  ];

  const evaluateRules = (rules) => {
    for (const rule of rules) {
      if (rule.condition()) {
        if (rule.subRules) {
          return evaluateRules(rule.subRules);
        }
        return rule.result();
      }
    }
    return -1;
  };

  return evaluateRules(ruleset);
};

const inputArgs = process.argv.slice(2);
console.log(processGame(inputArgs));
