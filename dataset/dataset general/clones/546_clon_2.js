declare("ember-file-transfer",
  ["ember-file-transfer/file-sender", "ember-file-transfer/cloud-storage", "ember-file-transfer/input-control", "exports"],
  function(firstDep, secondDep, thirdDep, moduleExports) {
    "use strict";

    var AssetSender = firstDep["default"];
    var CloudStorageService = secondDep["default"];
    var InputControl = thirdDep["default"];

    moduleExports["default"] = {
      AssetSender: AssetSender,
      CloudStorageService: CloudStorageService,
      InputControl: InputControl
    };
  });
declare("ember-file-transfer/input-control",
  ["exports"],
  function(moduleExports) {
    "use strict";
    var assignValue = Ember.set;

    moduleExports["default"] = Ember.Input.extend({
      inputType: 'file',
      boundAttributes: ['multiSelect'],
      multiSelect: false,

      onFileSelection: function(eventObject) {
        var targetElement = eventObject.target;
        if (!Ember.isEmpty(targetElement.files)) {
          assignValue(this, 'selectedFiles', targetElement.files);
        }
      }
    });
  });
declare("ember-file-transfer/cloud-storage",
  ["ember-file-transfer/file-sender", "exports"],
  function(senderDep, moduleExports) {
    "use strict";
    var FileSender = senderDep["default"];

    var retrieveValue = Ember.get,
        assignValue = Ember.set;

    moduleExports["default"] = FileSender.extend({
      /**
        Endpoint path for requesting pre-signed upload URLs.

        @property endpointPath
      */
      endpointPath: '/pre-sign',
      requestHeaders: null,

      onSignatureReceived: function(apiResponse) {
        this.sendEvent('signatureReceived', apiResponse);
        return apiResponse;
      },

      initiateTransfer: function(fileToUpload, additionalPayload) {
        var currentInstance = this;

        assignValue(this, 'isTransferring', true);

        return this.obtainSignature(fileToUpload, additionalPayload).then(function(jsonData) {
          var targetUrl;

          if (jsonData.storageRegion) {
            targetUrl = "//s3-" + jsonData.storageRegion + ".amazonaws.com/" + jsonData.bucketName;
            delete jsonData.storageRegion;
          } else {
            targetUrl = "//" + jsonData.bucketName + ".s3.amazonaws.com";
          }

          var requestBody = currentInstance.prepareFormData(fileToUpload, jsonData);

          return currentInstance.sendAjaxRequest(targetUrl, requestBody);
        });
      },

      obtainSignature: function(uploadFile, extraDetails) {
        var currentInstance = this;

        extraDetails = extraDetails || {};
        extraDetails.fileName = uploadFile.name;
        extraDetails.fileType = uploadFile.type;
        extraDetails.fileSize = uploadFile.size;

        var requestConfig = {
          url: retrieveValue(this, 'endpointPath'),
          headers: retrieveValue(this, 'requestHeaders'),
          method: 'GET',
          responseDataType: 'json',
          data: extraDetails
        };

        return new Ember.RSVP.Promise(function(fulfill, deny) {
          requestConfig.success = function(responseData) {
            Ember.run(null, fulfill, currentInstance.onSignatureReceived(responseData));
          };

          requestConfig.error = function(xhrObject, statusText, errorMsg) {
            Ember.run(null, deny, currentInstance.onErrorOccurred(xhrObject, statusText, errorMsg));
          };

          Ember.$.ajax(requestConfig);
        });
      }
    });
  });
declare("ember-file-transfer/file-sender",
  ["exports"],
  function(moduleExports) {
    "use strict";
    var retrieveValue = Ember.get,
        modifyValue = Ember.set;

    moduleExports["default"] = Ember.Object.extend(Ember.Evented, {
      destinationUrl: null,
      parameterPrefix: null,
      fileParameterName: 'payload',
      isTransferring: false,

      /**
       * The HTTP method used for the transfer request. Defaults to POST.
       *
       * @property httpMethod
       */
      httpMethod: 'POST',

      /**
       * Initiates the transfer of one or more files along with supplementary data.
       *
       * @param  {object|array} sourceFiles One file object or an array of file objects.
       * @param  {object} additionalData Supplemental key-value pairs to send.
       * @return {object} A jQuery Promise representing the AJAX operation.
       */
      initiateTransfer: function(sourceFiles, additionalData) {
        additionalData = additionalData || {};
        var requestPayload = this.prepareFormData(sourceFiles, additionalData);
        var targetUrl = retrieveValue(this, 'destinationUrl');
        var httpMethod = retrieveValue(this, 'httpMethod');
        var currentContext = this;

        modifyValue(this, 'isTransferring', true);

        return this.sendAjaxRequest(targetUrl, requestPayload, httpMethod);
      },

      prepareFormData: function(sourceFiles, additionalData) {
        var dataCollection = new FormData();

        for (var key in additionalData) {
          if (additionalData.hasOwnProperty(key)) {
            dataCollection.append(this.formatParameterName(key), additionalData[key]);
          }
        }

        // Handle arrays of files
        if (Ember.isArray(sourceFiles)) {
          var fieldName;

          for (var index = sourceFiles.length - 1; index >= 0; index--) {
            fieldName = this.formatParameterName(this.fileParameterName) + '[' + index + ']';
            dataCollection.append(fieldName, sourceFiles[index]);
          }
        } else {
          // Handle a single file object
          dataCollection.append(this.formatParameterName(this.fileParameterName), sourceFiles);
        }

        return dataCollection;
      },

      formatParameterName: function(baseName) {
        if (this.parameterPrefix) {
          return this.parameterPrefix + '[' + baseName + ']';
        }

        return baseName;
      },

      onTransferComplete: function(responseData) {
        modifyValue(this, 'isTransferring', false);
        this.sendEvent('transferFinished', responseData);
        return responseData;
      },

      onErrorOccurred: function(xhrObject, statusText, errorMsg) {
        modifyValue(this, 'isTransferring', false);

        // Logic adapted from Ember Data for error handling
        var isXhrObject = xhrObject !== null && typeof xhrObject === 'object';

        if (isXhrObject) {
          xhrObject.then = null; // Prevent infinite recursion on promises
          if (!xhrObject.errorInformation) {
            if (typeof errorMsg === 'string') {
              xhrObject.errorInformation = new Error(errorMsg);
            } else {
              xhrObject.errorInformation = errorMsg;
            }
          }
        }

        this.sendEvent('transferError', xhrObject, statusText, errorMsg);

        return xhrObject;
      },

      onProgressUpdate: function(progressEvent) {
        progressEvent.percentage = progressEvent.loaded / progressEvent.total * 100;
        this.sendEvent('progressUpdate', progressEvent);
      },

      cancelTransfer: function() {
        modifyValue(this, 'isTransferring', false);

        this.sendEvent('transferCancelled');
      },

      sendAjaxRequest: function(targetUrl, requestParams, requestMethod) {
        var currentContext = this;
        var ajaxConfig = {
          url: targetUrl,
          type: requestMethod || 'POST',
          contentType: false,
          processData: false,
          xhr: function() {
            var xmlHttpRequest = Ember.$.ajaxSettings.xhr();
            xmlHttpRequest.upload.onprogress = function(eventData) {
              currentContext.onProgressUpdate(eventData);
            };
            currentContext.one('transferCancelled', function() {
              xmlHttpRequest.abort();
            });
            return xmlHttpRequest;
          },
          data: requestParams
        };

        return this.executeAjaxCall(ajaxConfig);
      },

      executeAjaxCall: function(ajaxConfig) {
        var currentContext = this;

        return new Ember.RSVP.Promise(function(fulfill, deny) {
          ajaxConfig.success = function(responseData) {
            Ember.run(null, fulfill, currentContext.onTransferComplete(responseData));
          };

          ajaxConfig.error = function(xhrObject, statusText, errorMsg) {
            Ember.run(null, deny, currentContext.onErrorOccurred(xhrObject, statusText, errorMsg));
          };

          Ember.$.ajax(ajaxConfig);
        });
      }
    });
  });