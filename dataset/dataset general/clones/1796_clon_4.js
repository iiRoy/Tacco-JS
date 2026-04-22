/* global angular: false */
var appModule = angular.module('dataTransport', []);

appModule.provider('commService', function() {
  var rootContextAccessor;

  this.$get = function($rootCycleManager) {
    rootContextAccessor = $rootCycleManager;

    var clientInterface = {};

    var channelSubscribers = new Map();
    var sentCommunications = new Map();

    clientInterface.subscribeToChannel = function(channelId, handlerFn) {
      if (!channelSubscribers.has(channelId)) {
        channelSubscribers.set(channelId, []);
      }
      channelSubscribers.get(channelId).push(handlerFn);
    };

    clientInterface.dispatchCommunication = function(channelId) {
      var messageArguments = Array.from(arguments).slice(1);

      if (!sentCommunications.has(channelId)) {
        sentCommunications.set(channelId, []);
      }
      sentCommunications.get(channelId).push(messageArguments);
    };

    clientInterface.simulateInboundMessage = function(channelId) {
      var messageArguments = Array.from(arguments).slice(1);

      if (channelSubscribers.has(channelId)) {
        var activeHandlers = channelSubscribers.get(channelId);

        for (const currentHandler of activeHandlers) {
          rootContextAccessor.$apply(function() {
            currentHandler.apply(clientInterface, messageArguments);
          });
        }
      }
    };

    return clientInterface;
  };
});