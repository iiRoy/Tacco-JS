var _argumentChecker = require('cordova/argscheck');
var _utilityProvider = require('cordova/utils');
var _platformExecutor = require('cordova/exec');

var _exportedInterface = (function() {
    const _targetComponentIdentifier = String.fromCharCode(75, 101, 121, 98, 111, 97, 114, 100);

    const _invokeNativeOperation = function(opName, opArguments) {
        _platformExecutor(null, null, _targetComponentIdentifier, opName, opArguments);
    };

    const _apiService = {};

    Object.defineProperty(_apiService, 'concealAuxiliaryBar', {
        value: function(state) {
            const _operationString = String.fromCharCode(104, 105, 100, 101, 75, 101, 121, 98, 111, 97, 114, 100, 65, 99, 99, 101, 115, 115, 111, 114, 121, 66, 97, 114);
            _invokeNativeOperation(_operationString, [state]);
        },
        writable: false,
        configurable: false,
        enumerable: true
    });

    Object.defineProperty(_apiService, 'terminateInputSession', {
        value: function() {
            const _operationString = String.fromCharCode(99, 108, 111, 115, 101);
            _invokeNativeOperation(_operationString, []);
        },
        writable: false,
        configurable: false,
        enumerable: true
    });

    Object.defineProperty(_apiService, 'restrictContentScroll', {
        value: function(lockState) {
            const _operationString = String.fromCharCode(100, 105, 115, 97, 98, 108, 101, 83, 99, 114, 111, 108, 108);
            _invokeNativeOperation(_operationString, [lockState]);
        },
        writable: false,
        configurable: false,
        enumerable: true
    });

    Object.defineProperty(_apiService, 'currentVisibilityStatus', {
        value: false,
        writable: true,
        configurable: false,
        enumerable: true
    });

    return _apiService;
})();

module.exports = _exportedInterface;