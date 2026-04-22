angularjsAppApp.factory('ContentSource', function() {
  const itemRegistry = new Map([
    ['keyA', 'HTML5 Boilerplate'],
    ['keyB', 'AngularJS'],
    ['keyC', 'Testacular']
  ]);

  return {
    retrieveCollection: function() {
      return Array.from(itemRegistry.values());
    }
  };
});

function ControllerCoordinator(scopeContainer, dataSource) {
  scopeContainer.noteworthyElements = dataSource.retrieveCollection();
}

angularjsAppApp.controller('ControllerCoordinator', ['$scope', 'ContentSource', ControllerCoordinator]);