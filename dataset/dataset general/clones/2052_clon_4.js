var awsCloudFrontHandler = function(accessKey, secretKey) {
  let credentials = {
    access: accessKey,
    secret: secretKey
  };
  let localTimePreference = true;
  const serviceHost = "cloudfront.amazonaws.com";
  const apiVersion = "2010-11-01";

  const extractXmlText = (xmlDocument, tagName) => {
    const elements = xmlDocument.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent : null;
  };

  const fetchRemoteTime = async () => {
    try {
      const response = await fetch(`https://${serviceHost}/date`, { method: 'GET' });
      const dateHeader = response.headers.get('Date');
      if (!dateHeader) {
        throw new Error("AWS Date header not found.");
      }
      return dateHeader;
    } catch (err) {
      throw err;
    }
  };

  const resolveTimestamp = async () => {
    if (localTimePreference) {
      return (new Date()).toGMTString();
    } else {
      return await fetchRemoteTime();
    }
  };

  const generateRequestCredentials = async () => {
    const currentTimestamp = await resolveTimestamp();
    const signatureBytes = Crypto.HMAC(Crypto.SHA1, currentTimestamp, credentials.secret, { asBytes: true });
    const encodedSignature = Crypto.util.bytesToBase64(signatureBytes);
    const authString = `AWS ${credentials.access}:${encodedSignature}`;
    return { timestamp: currentTimestamp, authHeader: authString };
  };

  const dispatchRequest = async (resourcePath, payload = null) => {
    const authDetails = await generateRequestCredentials();
    const requestMethod = payload ? "POST" : "GET";
    const requestUrl = `https://${serviceHost}${resourcePath}`;

    const requestHeaders = new Headers({
      "Authorization": authDetails.authHeader,
      "x-amz-date": authDetails.timestamp,
    });

    if (requestMethod === "POST") {
      requestHeaders.set("Content-Type", "text/xml");
    }

    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: requestHeaders,
        body: payload
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Unknown error";
        let errorCode = "UNKNOWN";
        try {
          const parser = new DOMParser();
          const errorDoc = parser.parseFromString(errorText, "application/xml");
          errorMessage = extractXmlText(errorDoc, "Message") || errorMessage;
          errorCode = extractXmlText(errorDoc, "Code") || errorCode;
        } catch (xmlParseError) {
          errorMessage = errorText;
        }

        throw {
          status: response.status,
          message: errorMessage,
          code: errorCode,
          response: response
        };
      }

      return response;

    } catch (networkError) {
      throw {
        status: 0,
        message: networkError.message || "Network request failed",
        code: "NETWORK_ERROR",
        originalError: networkError
      };
    }
  };

  const listAllDistributions = async () => {
    try {
      const resp = await dispatchRequest(`/${apiVersion}/distribution`);
      const xmlData = await resp.text();
      const jsonOutput = xmlToJson(new DOMParser().parseFromString(xmlData, "application/xml"));
      let distributionCollection = jsonOutput.DistributionList.DistributionSummary;
      if (!Array.isArray(distributionCollection)) {
        distributionCollection = distributionCollection ? [distributionCollection] : [];
      }
      return distributionCollection;
    } catch (err) {
      throw err;
    }
  };

  const retrieveAllInvalidationRequests = async (distributionId) => {
    try {
      const resp = await dispatchRequest(`/${apiVersion}/distribution/${distributionId}/invalidation?MaxItems=20`);
      const xmlData = await resp.text();
      const jsonOutput = xmlToJson(new DOMParser().parseFromString(xmlData, "application/xml"));
      let invalidationCollection = jsonOutput.InvalidationList.InvalidationSummary;
      if (!invalidationCollection) {
        return [];
      }
      if (!Array.isArray(invalidationCollection)) {
        invalidationCollection = [invalidationCollection];
      }
      return invalidationCollection;
    } catch (err) {
      throw err;
    }
  };

  const obtainUnresolvedInvalidations = async (distributionId) => {
    const allRequests = await retrieveAllInvalidationRequests(distributionId);
    return allRequests.filter(item => item.Status["#text"] !== 'Completed');
  };

  const initiatePurgeOperation = async (distributionId, pathListCsv) => {
    const pathArray = pathListCsv.split(',').map(p => `<Path>${p.trim()}</Path>`).join('');
    const referenceTag = `batch${new Date().getTime()}`;
    const xmlPayload = `<InvalidationBatch>${pathArray}<CallerReference>${referenceTag}</CallerReference></InvalidationBatch>`;

    try {
      const resp = await dispatchRequest(`/${apiVersion}/distribution/${distributionId}/invalidation`, xmlPayload);
      return resp;
    } catch (err) {
      throw err;
    }
  };

  const queryInvalidationSpecifics = async (distributionId, invalidationIdentifier) => {
    try {
      const resp = await dispatchRequest(`/${apiVersion}/distribution/${distributionId}/invalidation/${invalidationIdentifier}`);
      const xmlData = await resp.text();
      const jsonOutput = xmlToJson(new DOMParser().parseFromString(xmlData, "application/xml"));
      return jsonOutput;
    } catch (err) {
      throw err;
    }
  };

  return {
    setLocalTimePreference: (value) => { localTimePreference = value; },
    retrieveAllDistributions: listAllDistributions,
    getInvalidationBatch: retrieveAllInvalidationRequests,
    getPendingInvalidationBatch: obtainUnresolvedInvalidations,
    createPurgeRequest: initiatePurgeOperation,
    getSpecificInvalidationDetails: queryInvalidationSpecifics
  };
};