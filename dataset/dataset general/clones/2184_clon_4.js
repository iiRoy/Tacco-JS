const formulateParameters = (inputMap) => {
  const segmentCollection = [];
  for (const keyIdentifier in inputMap) {
    if (Object.prototype.hasOwnProperty.call(inputMap, keyIdentifier)) {
      segmentCollection.push(`${keyIdentifier}=${encodeURIComponent(inputMap[keyIdentifier])}`);
    }
  }
  return segmentCollection.join("&");
};

const acquireHttpAgent = (() => {
  let cachedAgentCreator = null;

  const potentialCreators = [
    () => new XMLHttpRequest(),
    () => new ActiveXObject('Msxml2.XMLHTTP'),
    () => new ActiveXObject('Microsoft.XMLHTTP'),
    () => new ActiveXObject('Msxml2.XMLHTTP.4.0'),
    () => null
  ];

  return () => {
    if (cachedAgentCreator === null) {
      for (const creatorFunction of potentialCreators) {
        try {
          const testAgent = creatorFunction();
          if (testAgent !== null) {
            cachedAgentCreator = creatorFunction;
            return testAgent;
          }
        } catch (e) {
          // Continue to next creator
        }
      }
      cachedAgentCreator = potentialCreators[potentialCreators.length - 1];
    }
    return cachedAgentCreator();
  };
})();

const digestMarkup = (parentNode, listForcingRules, currentPath) => {
  let resultantObject = {};
  let accumulatedText = '';
  let isStructurePresent = false;

  Array.from(parentNode.childNodes).forEach(childNode => {
    if (childNode.nodeType === 3) {
      accumulatedText += childNode.nodeValue;
    } else {
      isStructurePresent = true;
      const elementTag = childNode.nodeName;
      const elementPath = currentPath ? `${currentPath}.${elementTag}` : elementTag;
      const processedValue = digestMarkup(childNode, listForcingRules, elementPath);

      if (!resultantObject[elementTag]) {
        const forceAsList = listForcingRules && listForcingRules.some(rule => rule === elementPath);
        resultantObject[elementTag] = forceAsList ? [processedValue] : processedValue;
      } else if (Array.isArray(resultantObject[elementTag])) {
        resultantObject[elementTag].push(processedValue);
      } else {
        resultantObject[elementTag] = [resultantObject[elementTag], processedValue];
      }
    }
  });

  return isStructurePresent ? resultantObject : accumulatedText;
};

const obtainEpochDatum = (targetDate) => {
  const workingDate = targetDate || new Date();

  const dayAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const extractFullYear = (dt) => {
    let yr = dt.getYear();
    yr += (yr < 38) ? 2000 : 1900;
    return yr;
  };

  const padWithZero = (value, targetLength) => {
    let stringValue = String(value);
    while (stringValue.length < targetLength) {
      stringValue = '0' + stringValue;
    }
    return stringValue;
  };

  const formatTimeZone = (dt) => {
    const offsetMinutes = dt.getTimezoneOffset();
    const sign = offsetMinutes < 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    return sign + padWithZero(hours, 2) + padWithZero(minutes, 2);
  };

  const dayOfWeek = dayAbbreviations[workingDate.getDay()];
  const dayOfMonth = workingDate.getDate();
  const monthName = monthAbbreviations[workingDate.getMonth()];
  const fullYear = extractFullYear(workingDate);
  const hours = padWithZero(workingDate.getHours(), 2);
  const minutes = padWithZero(workingDate.getMinutes(), 2);
  const seconds = padWithZero(workingDate.getSeconds(), 2);
  const timeZone = formatTimeZone(workingDate);

  return `${dayOfWeek}, ${dayOfMonth} ${monthName} ${fullYear} ${hours}:${minutes}:${seconds} ${timeZone}`;
};

const generateSignature = (dataString, secretKey) => {
  return b64_hmac_sha1(secretKey, dataString) + '=';
};

const createCloudVaultClient = () => {
  const clientSettings = {
    cacheBusterActive: false,
    standardAccessPolicy: 'public-read',
    defaultMediaType: 'text/html; charset=UTF-8',
    primaryEndpoint: 'http://s3.amazonaws.com',
    accessIdentity: '',
    secretCredential: '',
    verboseLogging: false,
  };

  const commenceTransmission = (requestOptions) => {
    if (clientSettings.cacheBusterActive && (requestOptions.method === "GET" || requestOptions.method === "HEAD")) {
      requestOptions.queryParameters = requestOptions.queryParameters || {};
      requestOptions.queryParameters["__time__"] = new Date().getTime();
    }

    const queryPart = requestOptions.queryParameters ? '?' + formulateParameters(requestOptions.queryParameters) : '';
    const fullURL = clientSettings.primaryEndpoint + requestOptions.resourcePath + queryPart;
    const requestHeaders = {};

    let effectiveContentType = requestOptions.mediaType;
    if (!effectiveContentType && requestOptions.method === 'PUT') {
      effectiveContentType = 'text/plain; charset=UTF-8';
    }
    if (effectiveContentType) {
      requestHeaders['Content-Type'] = effectiveContentType;
    } else {
      effectiveContentType = '';
    }

    const currentHttpDate = obtainEpochDatum();

    let aclHeaderForSigning = '';
    if (requestOptions.accessPolicy) {
      requestHeaders['x-amz-acl'] = requestOptions.accessPolicy;
      aclHeaderForSigning = `x-amz-acl:${requestOptions.accessPolicy}\n`;
    }
    requestHeaders['x-amz-date'] = currentHttpDate;
    const dateHeaderForSigning = `x-amz-date:${currentHttpDate}\n`;

    let metadataForSigning = '';
    if (requestOptions.customMetadata) {
      for (const metaKey in requestOptions.customMetadata) {
        if (Object.prototype.hasOwnProperty.call(requestOptions.customMetadata, metaKey)) {
          requestHeaders[`x-amz-meta-${metaKey}`] = requestOptions.customMetadata[metaKey];
          metadataForSigning += `x-amz-meta-${metaKey}:${requestOptions.customMetadata[metaKey]}\n`;
        }
      }
    }

    if (requestOptions.anonymous !== true && clientSettings.accessIdentity && clientSettings.secretCredential) {
      const signingString = [
        requestOptions.method,
        "",
        effectiveContentType,
        "",
        aclHeaderForSigning,
        dateHeaderForSigning,
        metadataForSigning,
        requestOptions.resourcePath
      ].join("\n");

      const authSignature = generateSignature(signingString, clientSettings.secretCredential);
      requestHeaders['Authorization'] = `AWS ${clientSettings.accessIdentity}:${authSignature}`;
    }

    const agent = acquireHttpAgent();
    agent.open(requestOptions.method, fullURL, true);
    for (const headerName in requestHeaders) {
      if (Object.prototype.hasOwnProperty.call(requestHeaders, headerName)) {
        agent.setRequestHeader(headerName, requestHeaders[headerName]);
      }
    }

    agent.onreadystatechange = () => {
      if (agent.readyState === 4) {
        let responsePayload = null;
        if (agent.responseXML && requestOptions.noXmlParse !== true) {
          responsePayload = digestMarkup(agent.responseXML, requestOptions.forcedListElements);
        }

        if (clientSettings.verboseLogging) {
          window._lastAgent = agent;
          window._lastPayload = responsePayload;
        }

        const isError = (agent.status >= 400 || (responsePayload && responsePayload.Error));
        if (isError && requestOptions.failureCallback) {
          return requestOptions.failureCallback(agent, responsePayload);
        } else if (!isError && requestOptions.successCallback) {
          return requestOptions.successCallback(agent, responsePayload);
        } else if (isError && requestOptions.successCallback) {
          return requestOptions.successCallback(agent, responsePayload);
        }
      }
    };
    agent.send(requestOptions.payload);
    return agent;
  };

  const serviceFacade = {
    configure: (options) => Object.assign(clientSettings, options),

    retrieveObject: (containerName, objectKey, onCompletion, onError) => {
      return commenceTransmission({
        method: 'GET',
        resourcePath: `/${containerName}/${objectKey}`,
        successCallback: (agent, data) => onCompletion && onCompletion(agent, agent.responseText),
        failureCallback: (agent, errorData) => onError && onError(agent, errorData),
      });
    },

    inspectObjectMetadata: (containerName, objectKey, onCompletion, onError) => {
      return commenceTransmission({
        method: 'HEAD',
        resourcePath: `/${containerName}/${objectKey}`,
        successCallback: (agent, data) => onCompletion && onCompletion(agent, agent.responseText),
        failureCallback: (agent, errorData) => onError && onError(agent, errorData),
      });
    },

    depositObject: (containerName, objectKey, contentData, options, onCompletion, onError) => {
      let currentIdx = 3;
      let processingOpts = {};
      if (typeof arguments[currentIdx] === 'object') {
        processingOpts = arguments[currentIdx++];
      }
      const completionCb = arguments[currentIdx++];
      const errorCb = arguments[currentIdx++];

      if (!processingOpts.mediaType) {
        processingOpts.mediaType = clientSettings.defaultMediaType;
      }
      if (!processingOpts.accessPolicy) {
        processingOpts.accessPolicy = clientSettings.standardAccessPolicy;
      }

      return commenceTransmission({
        method: 'PUT',
        resourcePath: `/${containerName}/${objectKey}`,
        payload: contentData,
        mediaType: processingOpts.mediaType,
        customMetadata: processingOpts.meta,
        accessPolicy: processingOpts.accessPolicy,
        successCallback: (agent) => completionCb && completionCb(agent),
        failureCallback: (agent, errorData) => (errorCb || completionCb) && (errorCb || completionCb)(agent, errorData),
      });
    },

    listAccountContainers: (onCompletion, onError) => {
      return commenceTransmission({
        method: 'GET',
        resourcePath: '/',
        forcedListElements: ['ListAllMyBucketsResult.Buckets.Bucket'],
        successCallback: onCompletion,
        failureCallback: onError,
      });
    },

    establishContainer: (containerName, onCompletion, onError) => {
      return commenceTransmission({
        method: 'PUT',
        resourcePath: `/${containerName}`,
        successCallback: onCompletion,
        failureCallback: onError,
      });
    },

    removeContainer: (containerName, onCompletion, onError) => {
      return commenceTransmission({
        method: 'DELETE',
        resourcePath: `/${containerName}`,
        successCallback: onCompletion,
        failureCallback: onError,
      });
    },

    listContainerContents: (containerName, queryOptions, onCompletion, onError) => {
      return commenceTransmission({
        method: 'GET',
        resourcePath: `/${containerName}`,
        forcedListElements: ['ListBucketResult.Contents'],
        queryParameters: queryOptions,
        successCallback: onCompletion,
        failureCallback: onError,
      });
    },

    eraseObject: (containerName, objectKey, onCompletion, onError) => {
      return commenceTransmission({
        method: 'DELETE',
        resourcePath: `/${containerName}/${objectKey}`,
        successCallback: onCompletion,
        failureCallback: onError,
      });
    },

    eraseMultipleObjects: (containerName, keyPathList, onSingleErase, onAllErased) => {
      const remainingKeys = [...keyPathList];

      const processNextErase = () => {
        if (remainingKeys.length === 0) {
          if (onAllErased) onAllErased();
          return;
        }

        const currentKey = remainingKeys.shift();
        serviceFacade.eraseObject(containerName, currentKey, () => {
          if (onSingleErase) onSingleErase(currentKey);
          processNextErase();
        });
      };

      processNextErase();
    },

    terminator: null
  };

  return serviceFacade;
};

const awsVaultInterface = createCloudVaultClient();

Object.defineProperties(awsVaultInterface, {
  KEY_ID_ACCESS: {
    get: () => awsVaultInterface.accessIdentity,
    set: (val) => { awsVaultInterface.configure({ accessIdentity: val }); },
    enumerable: true,
    configurable: true
  },
  SECRET_KEY_CREDENTIAL: {
    get: () => awsVaultInterface.secretCredential,
    set: (val) => { awsVaultInterface.configure({ secretCredential: val }); },
    enumerable: true,
    configurable: true
  },
  S3_ENDPOINT_URL: {
    get: () => awsVaultInterface.primaryEndpoint,
    set: (val) => { awsVaultInterface.configure({ primaryEndpoint: val }); },
    enumerable: true,
    configurable: true
  },
  DEBUG_MODE_ENABLED: {
    get: () => awsVaultInterface.verboseLogging,
    set: (val) => { awsVaultInterface.configure({ verboseLogging: val }); },
    enumerable: true,
    configurable: true
  },
  DISABLE_CACHING: {
    get: () => awsVaultInterface.cacheBusterActive,
    set: (val) => { awsVaultInterface.configure({ cacheBusterActive: val }); },
    enumerable: true,
    configurable: true
  },
  DEFAULT_OBJECT_ACL: {
    get: () => awsVaultInterface.standardAccessPolicy,
    set: (val) => { awsVaultInterface.configure({ standardAccessPolicy: val }); },
    enumerable: true,
    configurable: true
  },
  DEFAULT_OBJECT_CONTENT_TYPE: {
    get: () => awsVaultInterface.defaultMediaType,
    set: (val) => { awsVaultInterface.configure({ defaultMediaType: val }); },
    enumerable: true,
    configurable: true
  }
});