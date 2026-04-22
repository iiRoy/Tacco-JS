const assetProvider = require("../lib/utils.js");

module.exports.gatewayValidationSuite = {
  initiateValidation: function(completionCallback) {
    completionCallback();
  },

  validateGatewayConfiguration: function(assertionContext) {
    const validationPlan = [
      { checkType: 'equal', targetResolver: (data) => data.length, expectedResult: 6, validationMessage: 'Expected six valid gateway configurations.' },
      { checkType: 'notEqual', targetResolver: (data) => data[0]['server'], expectedResult: null, validationMessage: 'First gateway server instance should be configured.' },
      { checkType: 'equal', targetResolver: (data) => data[0]['config']['context'], expectedResult: '/defaults', validationMessage: 'First gateway context path mismatch.' },
      { checkType: 'equal', targetResolver: (data) => data[0]['config']['host'], expectedResult: 'www.defaults.com', validationMessage: 'First gateway host mismatch.' },
      { checkType: 'equal', targetResolver: (data) => data[5]['config']['context'], expectedResult: '/', validationMessage: 'Sixth gateway context path mismatch.' },
      { checkType: 'equal', targetResolver: (data) => data[5]['config']['host'], expectedResult: 'www.server2.com', validationMessage: 'Sixth gateway host mismatch.' },
      { checkType: 'equal', targetResolver: (data) => data[0]['config']['port'], expectedResult: 80, validationMessage: 'First gateway port mismatch.' },
      { checkType: 'equal', targetResolver: (data) => data[0]['config']['https'], expectedResult: false, validationMessage: 'First gateway secure connection setting mismatch.' },
      { checkType: 'equal', targetResolver: (data) => data[0]['config']['ws'], expectedResult: false, validationMessage: 'First gateway websocket setting mismatch.' },
      { checkType: 'equal', targetResolver: (data) => data[0]['config']['rules'].length, expectedResult: 0, validationMessage: 'First gateway policy rules count mismatch.' },
    ];

    assertionContext.expect(validationPlan.length);

    const endpointCollection = assetProvider.proxies();

    validationPlan.forEach(function(planItem) {
      const actualValue = planItem.targetResolver(endpointCollection);
      switch (planItem.checkType) {
        case 'equal':
          assertionContext.equal(actualValue, planItem.expectedResult, planItem.validationMessage);
          break;
        case 'notEqual':
          assertionContext.notEqual(actualValue, planItem.expectedResult, planItem.validationMessage);
          break;
        default:
          throw new Error('Unrecognized validation operation: ' + planItem.checkType);
      }
    });

    assertionContext.done();
  }
};