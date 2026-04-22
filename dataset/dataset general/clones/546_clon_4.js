const UploadServiceHub = {};

class EventEmitterBase {
  constructor() {
    this._eventListeners = {};
  }

  addSubscription(eventName, handlerFunction) {
    if (!this._eventListeners[eventName]) {
      this._eventListeners[eventName] = [];
    }
    this._eventListeners[eventName].push(handlerFunction);
    return () => this.removeSubscription(eventName, handlerFunction);
  }

  removeSubscription(eventName, handlerFunction) {
    if (this._eventListeners[eventName]) {
      this._eventListeners[eventName] = this._eventListeners[eventName].filter(
        (listener) => listener !== handlerFunction
      );
    }
  }

  broadcastEvent(eventName, ...payload) {
    if (this._eventListeners[eventName]) {
      this._eventListeners[eventName].forEach((listener) => {
        listener.apply(this, payload);
      });
    }
  }

  addOneTimeSubscription(eventName, handlerFunction) {
    const wrapperFunction = (...payload) => {
      this.removeSubscription(eventName, wrapperFunction);
      handlerFunction.apply(this, payload);
    };
    this.addSubscription(eventName, wrapperFunction);
  }
}

class CloudTransmitterComponent extends EventEmitterBase {
  constructor(configuration = {}) {
    super();
    this.targetEndpoint = configuration.targetEndpoint || null;
    this.parameterNamespace = configuration.parameterNamespace || null;
    this.fileKeyName = configuration.fileKeyName || 'datafile';
    this.transmissionActive = false;
    this.httpMethod = configuration.httpMethod || 'POST';
    this._currentActiveRequest = null;
  }

  generateNamespacedKey(originalKey) {
    if (this.parameterNamespace) {
      return `${this.parameterNamespace}[${originalKey}]`;
    }
    return originalKey;
  }

  assemblePayload(itemsToTransmit, supplementaryInformation) {
    supplementaryInformation = supplementaryInformation || {};
    const transmissionForm = new FormData();

    for (const infoProp in supplementaryInformation) {
      if (Object.prototype.hasOwnProperty.call(supplementaryInformation, infoProp)) {
        transmissionForm.append(this.generateNamespacedKey(infoProp), supplementaryInformation[infoProp]);
      }
    }

    if (Array.isArray(itemsToTransmit)) {
      for (let i = itemsToTransmit.length - 1; i >= 0; i--) {
        const currentItemKey = this.generateNamespacedKey(this.fileKeyName) + '[' + i + ']';
        transmissionForm.append(currentItemKey, itemsToTransmit[i]);
      }
    } else {
      transmissionForm.append(this.generateNamespacedKey(this.fileKeyName), itemsToTransmit);
    }
    return transmissionForm;
  }

  transmissionProgress(eventObject) {
    eventObject.completionPercentage = (eventObject.loaded / eventObject.total) * 100;
    this.broadcastEvent('progressUpdate', eventObject);
  }

  transmissionSuccess(receivedData) {
    this.transmissionActive = false;
    this.broadcastEvent('transmissionCompleted', receivedData);
    return receivedData;
  }

  transmissionFailure(requestObject, statusMessage, detailedError) {
    this.transmissionActive = false;

    const errorContext = requestObject;
    if (errorContext && typeof errorContext === 'object') {
      delete errorContext.then;
      if (!errorContext.errorOrigin) {
        errorContext.errorOrigin = detailedError instanceof Error ? detailedError : new Error(detailedError);
      }
    }

    this.broadcastEvent('transmissionFailed', errorContext, statusMessage, detailedError);
    return errorContext;
  }

  initiateCancellation() {
    this.transmissionActive = false;
    if (this._currentActiveRequest) {
      this._currentActiveRequest.abort();
      this.broadcastEvent('transmissionCanceled');
    }
  }

  async performHttpRequest(requestSettings) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      this._currentActiveRequest = xhr;

      xhr.open(requestSettings.method || 'POST', requestSettings.url);

      if (requestSettings.requestHeaders) {
        for (const headerName in requestSettings.requestHeaders) {
          if (Object.prototype.hasOwnProperty.call(requestSettings.requestHeaders, headerName)) {
            xhr.setRequestHeader(headerName, requestSettings.requestHeaders[headerName]);
          }
        }
      }

      xhr.upload.onprogress = (event) => this.transmissionProgress(event);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responsePayload = xhr.responseText ? JSON.parse(xhr.responseText) : xhr.responseText;
            resolve(this.transmissionSuccess(responsePayload));
          } catch (e) {
            resolve(this.transmissionSuccess(xhr.responseText));
          }
        } else {
          reject(this.transmissionFailure(xhr, xhr.statusText, new Error(xhr.responseText || 'HTTP request failed')));
        }
      };

      xhr.onerror = () => {
        reject(this.transmissionFailure(xhr, xhr.statusText, new Error('Network error or request could not be completed')));
      };

      xhr.onabort = () => {
        this.transmissionActive = false;
        this.broadcastEvent('transmissionCanceled');
        reject(this.transmissionFailure(xhr, 'aborted', new Error('HTTP request intentionally aborted')));
      };

      xhr.send(requestSettings.body);
    }).finally(() => {
      this._currentActiveRequest = null;
    });
  }

  async beginTransmission(transmissionItems, additionalData) {
    additionalData = additionalData || {};
    const preparedPayload = this.assemblePayload(transmissionItems, additionalData);
    const destinationUrl = this.targetEndpoint;
    const currentMethod = this.httpMethod;

    this.transmissionActive = true;

    return this.performHttpRequest({
      url: destinationUrl,
      method: currentMethod,
      body: preparedPayload
    });
  }
}

UploadServiceHub.CloudTransmitterComponent = CloudTransmitterComponent;

class S3CloudTransmitterComponent extends CloudTransmitterComponent {
  constructor(configuration = {}) {
    super(configuration);
    this.signingEndpoint = configuration.signingEndpoint || '/request-signature';
    this.httpHeaders = configuration.httpHeaders || null;
  }

  signatureAcquired(signatureResponse) {
    this.broadcastEvent('signatureReceived', signatureResponse);
    return signatureResponse;
  }

  async requestSignature(itemToUpload, supplementaryDetails) {
    supplementaryDetails = supplementaryDetails || {};
    supplementaryDetails.fileName = itemToUpload.name;
    supplementaryDetails.fileType = itemToUpload.type;
    supplementaryDetails.fileSize = itemToUpload.size;

    const signatureRequestOptions = {
      url: this.signingEndpoint,
      requestHeaders: this.httpHeaders,
      method: 'GET',
      urlParameters: new URLSearchParams(supplementaryDetails).toString()
    };

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(signatureRequestOptions.method, `${signatureRequestOptions.url}?${signatureRequestOptions.urlParameters}`);

      if (signatureRequestOptions.requestHeaders) {
        for (const headerName in signatureRequestOptions.requestHeaders) {
          if (Object.prototype.hasOwnProperty.call(signatureRequestOptions.requestHeaders, headerName)) {
            xhr.setRequestHeader(headerName, signatureRequestOptions.requestHeaders[headerName]);
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseContent = xhr.responseText ? JSON.parse(xhr.responseText) : xhr.responseText;
            resolve(this.signatureAcquired(responseContent));
          } catch (e) {
            reject(this.transmissionFailure(xhr, xhr.statusText, new Error('Invalid JSON response from signature service')));
          }
        } else {
          reject(this.transmissionFailure(xhr, xhr.statusText, new Error(xhr.responseText || 'Signature request failed')));
        }
      };

      xhr.onerror = () => {
        reject(this.transmissionFailure(xhr, xhr.statusText, new Error('Network error during signature request')));
      };

      xhr.send();
    });
  }

  async beginTransmission(itemToUpload, supplementaryDetails) {
    const currentTransmitter = this;

    currentTransmitter.transmissionActive = true;

    return this.requestSignature(itemToUpload, supplementaryDetails).then(function(s3SignatureData) {
      let finalS3UploadUrl;

      if (s3SignatureData.locationRegion) {
        finalS3UploadUrl = `//s3-${s3SignatureData.locationRegion}.amazonaws.com/${s3SignatureData.bucketName}`;
        delete s3SignatureData.locationRegion;
      } else {
        finalS3UploadUrl = `//${s3SignatureData.bucketName}.s3.amazonaws.com`;
      }

      const s3UploadPayload = currentTransmitter.assemblePayload(itemToUpload, s3SignatureData);

      return currentTransmitter.performHttpRequest({
        url: finalS3UploadUrl,
        method: 'POST',
        body: s3UploadPayload
      });
    });
  }
}

UploadServiceHub.S3CloudTransmitterComponent = S3CloudTransmitterComponent;

class InputFileElementGenerator {
  constructor(elementConfiguration = {}) {
    this._htmlElement = document.createElement('input');
    this._htmlElement.type = elementConfiguration.inputType || 'file';
    this._htmlElement.multiple = elementConfiguration.allowMultiple || false;
    this._htmlElement.className = elementConfiguration.cssClass || '';
    this.currentSelectedFiles = null;

    this._htmlElement.addEventListener('change', this.handleInputChange.bind(this));
    this._fileChangeCallbacks = [];
  }

  handleInputChange(eventDetails) {
    const triggeringElement = eventDetails.target;
    if (triggeringElement.files && triggeringElement.files.length > 0) {
      this.currentSelectedFiles = triggeringElement.files;
    } else {
      this.currentSelectedFiles = null;
    }
    this._notifyFileChange(this.currentSelectedFiles);
  }

  _notifyFileChange(newFilesList) {
    this._fileChangeCallbacks.forEach(callback => callback(newFilesList));
    this._htmlElement.dispatchEvent(new CustomEvent('fileSelectionChanged', { detail: newFilesList }));
  }

  onFileSelectionChanged(callbackFunction) {
    if (typeof callbackFunction === 'function') {
      this._fileChangeCallbacks.push(callbackFunction);
      return () => {
        this._fileChangeCallbacks = this._fileChangeCallbacks.filter(cb => cb !== callbackFunction);
      };
    }
    return () => {};
  }

  getDomReference() {
    return this._htmlElement;
  }
}

UploadServiceHub.InputFileElementGenerator = InputFileElementGenerator;

UploadServiceHub.PrimaryExport = {
  TransmissionCore: UploadServiceHub.CloudTransmitterComponent,
  S3Transmission: UploadServiceHub.S3CloudTransmitterComponent,
  FileInputControl: UploadServiceHub.InputFileElementGenerator
};