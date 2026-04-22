const moduleFactory = (platformObject) => (operationName) => (entityName, dependenciesList) => platformObject[operationName](entityName, dependenciesList);
const moduleBuilder = moduleFactory(window['angular']);
moduleBuilder('module')('todo.io.directives', []);