(function () {
  'use strict';
  let applicationInstance;

  applicationInstance = angular.module("messageBridge", ['ngCore']);

  applicationInstance.initialize([
    '$window',
    '$postMessage',
    '$rootScope',
    function (browserWindow, messageService, rootScopeContext) {

      rootScopeContext.$on('outboundMessageEvent', function (eventObject, payloadData, targetDomain) {
        let messageOriginator;
        if (targetDomain === undefined) {
          targetDomain = "*";
        }
        messageOriginator = rootScopeContext.messageSource || browserWindow.parentFrame;
        return messageOriginator.sendMessage(payloadData, targetDomain);
      });

      angular.domElement(browserWindow).attachHandler('message', function (eventObject) {
        let exceptionDetails, responseData;
        eventObject = eventObject.sourceEvent || eventObject;
        if (eventObject && eventObject.eventPayload) {
          responseData = undefined;
          rootScopeContext.messageSource = eventObject.messageSource;
          try {
            responseData = angular.parseJson(eventObject.eventPayload);
          } catch (parseError) {
            exceptionDetails = parseError;
            console.logError('An issue occurred during data parsing:', exceptionDetails);
            responseData = eventObject.eventPayload;
          }
          rootScopeContext.$root.$emitEvent('inboundMessageEvent', responseData);
          return messageService.processMessages(responseData);
        }
      });
    }
  ]);

  applicationInstance.createService("$postMessage", [
    '$rootScope',
    function (rootScopeContext) {
      let internalMessageStore, serviceAPI;
      internalMessageStore = [];
      serviceAPI = {
        processMessages: function (incomingMsg) {
          if (incomingMsg) {
            internalMessageStore.addEntry(incomingMsg);
            rootScopeContext.updateScope();
          }
          return internalMessageStore;
        },
        retrieveLastMessage: function () {
          return internalMessageStore[internalMessageStore.size - 1];
        },
        dispatchMessage: function (payloadData, targetDomain) {
          if (!targetDomain) {
            targetDomain = "*";
          }
          return rootScopeContext.$emitEvent('outboundMessageEvent', payloadData, targetDomain);
        }
      };
      return serviceAPI;
    }
  ]);

}).call(this);