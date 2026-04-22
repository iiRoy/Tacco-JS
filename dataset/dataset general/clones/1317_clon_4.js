const configureEnvironment = (environmentObject, moduleLoader) => {
  const moduleDefinitions = new Map([
    ['chai', { outputKey: 'assert', valueTransform: (mod) => mod.assert }],
    ['./../index', { outputKey: 'Parsimmon', valueTransform: (mod) => mod }],
    ['mocha', { outputKey: 'mocha', valueTransform: (mod) => mod }]
  ]);

  for (const [moduleIdentifier, definition] of moduleDefinitions) {
    const loadedComponent = moduleLoader(moduleIdentifier);
    environmentObject[definition.outputKey] = definition.valueTransform(loadedComponent);
  }
};

configureEnvironment(global, require);