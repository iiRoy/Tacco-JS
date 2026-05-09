const axios = require('axios');
const { URL, URLSearchParams } = require('url');

class DataOperationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'DataOperationError';
    Object.assign(this, context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DataOperationError);
    }
  }

  static fromAxiosError(error, scope = 'network', errId = 'axios_request_failed') {
    const context = {
      scope,
      errId,
      originalError: error,
      requestDetails: error.config ? {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers,
        params: error.config.params,
        data: error.config.data
      } : undefined,
      responseDetails: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : undefined,
      message: error.message
    };

    if (error.response && error.response.data) {
      if (typeof error.response.data === 'object' && (error.response.data.reason || error.response.data.error)) {
        context.message = error.response.data.reason || error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        context.message = error.response.data;
      }
    }
    
    return new DataOperationError(context.message || error.message, context);
  }

  static create(payload, scope = 'custom', errId = 'internal_error') {
    let message = 'An unknown error occurred';
    if (payload && typeof payload === 'object') {
      if (payload.message) message = payload.message;
      else if (payload.reason) message = payload.reason;
      else if (payload.error) message = payload.error;
    } else if (typeof payload === 'string') {
      message = payload;
    }
    return new DataOperationError(message, { ...payload, scope, errId });
  }
}

const isObjectEmpty = (targetObject) => Object.keys(targetObject).length === 0;

const serializeFormData = (data) => {
  if (typeof data !== 'object' || data === null) {
    throw new DataOperationError('Form data must be an object.', { errId: 'bad_form_data' });
  }
  return Object.keys(data)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
};

class CouchStoreClient {
  #dataContainer;
  #serviceOrigin;
  #httpClient;

  constructor(configSettings) {
    let effectiveConfig = {};

    if (typeof configSettings === "string") {
      if (/^https?:/.test(configSettings)) {
        effectiveConfig = { url: configSettings };
      } else {
        throw new DataOperationError(`Invalid configuration string: "${configSettings}". Expected URL or object.`, { errId: 'config_parse_fail' });
      }
    } else if (typeof configSettings === 'object' && configSettings !== null) {
      effectiveConfig = configSettings;
    } else {
      throw new DataOperationError('Configuration must be a string (URL) or an object.', { errId: 'invalid_config_type' });
    }

    this.#dataContainer = effectiveConfig.bucket || "default";
    this.#serviceOrigin = effectiveConfig.url || "http://127.0.0.1:8092";

    this.#httpClient = axios.create({
      baseURL: this.#serviceOrigin,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
  }

  async #executeRequest(operationOptions = {}) {
    let requestPayload = operationOptions;

    if (typeof operationOptions === "function" || !operationOptions) {
      requestPayload = { path: "" };
    } else if (typeof operationOptions === 'string') {
      requestPayload = { path: operationOptions };
    }

    const {
      path: uriPath = "",
      documentIdentifier: docId,
      attachmentName: attName,
      requestMethod = "GET",
      queryParameters = {},
      additionalHeaders = {},
      requestBody,
      formData,
      encodingSpecification,
      contentTypeOverride,
    } = requestPayload;

    let effectivePath = uriPath;

    if (docId) {
      if (!/^_design/.test(docId)) {
        try {
          effectivePath = `${encodeURIComponent(docId)}`;
        } catch (error) {
          throw DataOperationError.create(error, {
            message: `Could not encode document ID: ${docId}`,
            scope: "data_access",
            errId: "encode_doc_id"
          });
        }
      } else {
        effectivePath = `${docId}`;
      }

      if (attName) {
        effectivePath += `/${attName}`;
      }
    }

    const currentHeaders = { ...this.#httpClient.defaults.headers.common, ...additionalHeaders };

    if (encodingSpecification !== undefined) {
      delete currentHeaders["Content-Type"];
      delete currentHeaders["Accept"];
    }

    if (contentTypeOverride) {
      currentHeaders["Content-Type"] = contentTypeOverride;
      delete currentHeaders["Accept"];
    }

    const processedQueryParams = new URLSearchParams();
    if (!isObjectEmpty(queryParameters)) {
      try {
        const paramKeysToSerialize = ['startkey', 'endkey', 'key', 'keys'];
        for (const key in queryParameters) {
          let value = queryParameters[key];
          if (paramKeysToSerialize.includes(key)) {
            try {
              value = JSON.stringify(value);
            } catch (err) {
              throw DataOperationError.create(err, {
                message: `Failed to serialize query parameter "${key}"`,
                scope: "data_access",
                errId: "serialize_query_param"
              });
            }
          }
          processedQueryParams.append(key, value);
        }
      } catch (err) {
        throw DataOperationError.create(err, {
          message: "Query parameters processing failed.",
          scope: "data_access",
          errId: "bad_query_params"
        });
      }
    }

    let requestData = null;
    if (requestBody) {
      if (Buffer.isBuffer(requestBody)) {
        requestData = requestBody;
      } else {
        try {
          requestData = JSON.stringify(requestBody, (key, val) => {
            if (typeof val === 'function') {
              return val.toString();
            }
            return val;
          });
        } catch (err) {
          throw DataOperationError.create(err, {
            message: "Request body serialization failed.",
            scope: "data_access",
            errId: "serialize_request_body"
          });
        }
      }
    } else if (formData) {
      currentHeaders["Content-Type"] = 'application/x-www-form-urlencoded; charset=utf-8';
      requestData = serializeFormData(formData);
    }

    const axiosRequestConfig = {
      method: requestMethod,
      url: effectivePath.startsWith('/') ? effectivePath : `/${effectivePath}`,
      headers: currentHeaders,
      params: processedQueryParams,
      data: requestData,
      responseType: encodingSpecification === null ? 'arraybuffer' : undefined
    };

    try {
      const response = await this.#httpClient.request(axiosRequestConfig);
      
      const responseMetadata = {
        'status-code': response.status,
        uri: new URL(response.config.url, this.#serviceOrigin).toString(),
        ...response.headers
      };
      
      delete responseMetadata.server;
      delete responseMetadata['content-length'];

      return { payload: response.data, metadata: responseMetadata };

    } catch (error) {
      if (error.response) {
        throw DataOperationError.fromAxiosError(error, 'couch_service', 'non_2xx_response');
      } else if (error.request) {
        throw DataOperationError.fromAxiosError(error, 'network_connection', 'no_response');
      } else {
        throw DataOperationError.fromAxiosError(error, 'client_setup', 'request_config_error');
      }
    }
  }

  async retrieveDocumentView(designationName, viewName, specificParameters = {}) {
    let actualParameters = specificParameters;
    if (typeof specificParameters === "function") {
      actualParameters = {};
    }

    const viewPath = `${this.#dataContainer}/_design/${designationName}/_view/${viewName}`;
    
    if (actualParameters.keys) {
      const requestBodyKeys = { keys: actualParameters.keys };
      const newQueryParameters = { ...actualParameters };
      delete newQueryParameters.keys;
      return this.#executeRequest({
        path: viewPath,
        requestMethod: "POST",
        queryParameters: newQueryParameters,
        requestBody: requestBodyKeys
      });
    } else {
      return this.#executeRequest({
        path: viewPath,
        requestMethod: "GET",
        queryParameters: actualParameters
      });
    }
  }

  async retrieveSpatialView(designationName, viewName, specificParameters = {}) {
    let actualParameters = specificParameters;
    if (typeof specificParameters === "function") {
      actualParameters = {};
    }

    const spatialPath = `${this.#dataContainer}/_design/${designationName}/_spatial/${viewName}`;
    
    if (actualParameters.keys) {
      const requestBodyKeys = { keys: actualParameters.keys };
      const newQueryParameters = { ...actualParameters };
      delete newQueryParameters.keys;
      return this.#executeRequest({
        path: spatialPath,
        requestMethod: "POST",
        queryParameters: newQueryParameters,
        requestBody: requestBodyKeys
      });
    } else {
      return this.#executeRequest({
        path: spatialPath,
        requestMethod: "GET",
        queryParameters: actualParameters
      });
    }
  }

  async establishDesignDocument(designationName, viewDefinitions) {
    const designPath = `${this.#dataContainer}/_design/${designationName}`;
    return this.#executeRequest({
      path: designPath,
      requestMethod: "PUT",
      requestBody: { views: viewDefinitions }
    });
  }

  async establishSpatialDesign(designationName, geoViewDefinitions) {
    const designPath = `${this.#dataContainer}/_design/${designationName}`;
    return this.#executeRequest({
      path: designPath,
      requestMethod: "PUT",
      requestBody: { views: {}, spatial: geoViewDefinitions }
    });
  }

  async fetchDesignDocument(designationName) {
    const designPath = `${this.#dataContainer}/_design/${designationName}`;
    return this.#executeRequest({
      path: designPath,
      requestMethod: "GET"
    });
  }

  async removeDesignDocument(designationName) {
    const designPath = `${this.#dataContainer}/_design/${designationName}`;
    return this.#executeRequest({
      path: designPath,
      requestMethod: "DELETE"
    });
  }
}

module.exports = (settings) => new CouchStoreClient(settings);