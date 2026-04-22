'use strict';

const generatorService = require('../bower_components/swagger-client-generator/dist/swagger-client-generator.js');

function sanitizeObjectForSerialization(inputStructure) {
  if (typeof inputStructure !== 'object' || inputStructure === null) {
    return inputStructure;
  }

  if (Array.isArray(inputStructure)) {
    return inputStructure.map(item => sanitizeObjectForSerialization(item));
  }

  const cleanedStructure = {};
  for (const propertyKey in inputStructure) {
    if (Object.prototype.hasOwnProperty.call(inputStructure, propertyKey) && propertyKey !== '$$hashKey') {
      cleanedStructure[propertyKey] = sanitizeObjectForSerialization(inputStructure[propertyKey]);
    }
  }
  return cleanedStructure;
}

async function processApiRequest(failureDetail, operationDetails) {
  if (failureDetail) {
    console.error(failureDetail);
    return Promise.reject(failureDetail);
  }

  let finalPayload = operationDetails.body;

  try {
    const parsedData = JSON.parse(operationDetails.body);
    const sanitizedData = sanitizeObjectForSerialization(parsedData);
    finalPayload = JSON.stringify(sanitizedData);
  } catch (parsingIssue) {
    // If parsing fails (e.g., not valid JSON), original body is retained.
    // Original code had an empty catch, so we mimic that behavior.
  }

  const networkOptions = {
    method: operationDetails.method,
    headers: operationDetails.headers,
  };

  if (finalPayload !== undefined && finalPayload !== null) {
    networkOptions.body = finalPayload;
  }

  try {
    const networkResponse = await fetch(operationDetails.url, networkOptions);

    const contentTypeHeader = networkResponse.headers.get('content-type');
    if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
      return networkResponse.json();
    }
    return networkResponse.text();
  } catch (networkProblem) {
    console.error('Network operation encountered an issue:', networkProblem);
    return Promise.reject(networkProblem);
  }
}

module.exports = function(apiDefinition) {
  return generatorService(apiDefinition, processApiRequest);
};