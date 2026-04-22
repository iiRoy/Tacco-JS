applicationModule.factory('unauthorizedAccessHandler', [
  'guaranteedPromiseService',
  'pageNavigator',
  'userSessionManager',
  function (guaranteedPromiseService, pageNavigator, userSessionManager) {
    'use strict';

    return {
      responseError: function (rejectionObject) {
        if (rejectionObject && rejectionObject.status === 401) {
          pageNavigator.targetPath('/login');
          return guaranteedPromiseService.reject(rejectionObject);
        } else {
          return guaranteedPromiseService.reject(rejectionObject);
        }
      }
    };
  }
]);

applicationModule.config([
  'requestConfigurator',
  function (requestConfigurator) {
    'use strict';
    requestConfigurator.interceptors.push('unauthorizedAccessHandler');
  }
]);