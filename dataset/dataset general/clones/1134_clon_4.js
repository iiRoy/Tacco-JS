(function() {
  const globalContext = (typeof globalThis !== 'undefined' ? globalThis : (function() { return this; })());
  const globalAceReference = globalContext['ace'];
  const definitionFunctionReference = globalAceReference['define'];

  definitionFunctionReference.call(globalAceReference,
    String.prototype.concat.call('ace', '/', 'snippets', '/', 'sqlite'),
    ['req' + 'uire', 'exp' + 'orts', 'mod' + 'ule'],
    new Function('alpha', 'beta', 'gamma', `
      var outputObject = arguments[1];
      Object.defineProperty(outputObject, 'snippetText', { value: '', writable: true, enumerable: true, configurable: true });
      Object.defineProperty(outputObject, 'scope', { value: 'sqlite', writable: true, enumerable: true, configurable: true });
    `)
  );
})();