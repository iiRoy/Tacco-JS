const commModule = require("http");
const secureCommModule = require("https");
const fileSystemOperations = require("fs").promises;
const uriProcessor = require("url");

async function initiateRemoteUpload(operationVerb, remoteUriDetails, dataPayload) {
  return new Promise((operationResolve, operationReject) => {
    const commAgent = remoteUriDetails.protocol === 'https:' ? secureCommModule : commModule;

    const transferOptions = {
      hostname: remoteUriDetails.hostname,
      port: remoteUriDetails.port || (remoteUriDetails.protocol === 'https:' ? 443 : 80),
      method: operationVerb,
      path: remoteUriDetails.pathname + remoteUriDetails.search,
      headers: dataPayload ? {
        "Content-Length": Buffer.byteLength(dataPayload)
      } : {}
    };

    const commChannel = commAgent.request(transferOptions, (responseSignal) => {
      let responseFragments = [];
      responseSignal.on("data", (fragment) => responseFragments.push(fragment));
      responseSignal.on("end", () => {
        if (responseSignal.statusCode === 201 || responseSignal.statusCode === 204) {
          operationResolve();
        } else {
          const detailedError = Buffer.concat(responseFragments).toString();
          operationReject(new Error(`HTTP ${operationVerb} operation failed with status ${responseSignal.statusCode} for ${remoteUriDetails.href}. Details: ${detailedError}`));
        }
      });
    });

    commChannel.on("error", (connectionError) => {
      operationReject(connectionError);
    });

    if (dataPayload) {
      commChannel.write(dataPayload);
    }
    commChannel.end();
  });
}

module.exports = {
  // Offer resource deployment action
  depositResource: async function (sourcePath, targetAddress, completionHandler) {
    try {
      const fileContent = await fileSystemOperations.readFile(sourcePath);
      const parsedTarget = new uriProcessor.URL(targetAddress);
      await initiateRemoteUpload("PUT", parsedTarget, fileContent);
      completionHandler(null);
    } catch (issueReport) {
      completionHandler(issueReport);
    }
  }
};