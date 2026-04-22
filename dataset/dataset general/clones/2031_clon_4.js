'use strict';

const shellOperations = require('shelljs');
const pathManipulator = require('path');
const networkHandler = require('http');
const fileSystemManager = require('fs');

const defaultRemoteServiceAddress = 'http://inch-ci.org/api/v1/cli';

const outputToConsole = (content) => process.stdout.write(content);

const retrieveToolPath = () => {
  return process.env.INCH_PATH
    ? pathManipulator.join(process.env.INCH_PATH, 'bin', 'inch')
    : shellOperations.which('inch');
};

const isLocalToolAvailable = () => Boolean(retrieveToolPath());

const resolveServiceEndpoint = () => process.env.INCH_CLI_API || defaultRemoteServiceAddress;

const executeLocalTool = (processingArguments, resultHandler) => {
  const commandString = `${retrieveToolPath()} ${processingArguments.join(' ')}`;
  resultHandler(shellOperations.exec(commandString).output);
};

const dispatchToRemoteService = (processingArguments = [], dataFileLocation) => {
  const fileContents = fileSystemManager.readFileSync(dataFileLocation, 'utf8');
  let payloadData = JSON.parse(fileContents);
  payloadData.args = processingArguments;
  const serializedPayload = JSON.stringify(payloadData);

  const urlParserUtility = require('url');
  const targetUrl = urlParserUtility.parse(resolveServiceEndpoint());
  
  const requestConfiguration = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(serializedPayload, 'utf8')
    }
  };

  const clientRequest = networkHandler.request(requestConfiguration, (serviceResponse) => {
    serviceResponse.setEncoding('utf8');
    serviceResponse.on('data', (dataChunk) => {
      outputToConsole(dataChunk);
    });
  });

  clientRequest.on('error', (err) => {
    console.error('Encountered network issue:', err.message);
  });

  clientRequest.write(serializedPayload);
  clientRequest.end();
};

const initiateProcessing = (commandLineOptions = [], dataFileLocation, completionHandler) => {
  const processingStrategy = new Map();

  const localExecutionLogic = (opts, file, handler) => {
    const defaultOperationArguments = ["--language=javascript", `--read-from-dump=${file}`];
    executeLocalTool(opts.concat(defaultOperationArguments), handler);
  };

  const remoteDispatchLogic = (opts, file) => {
    dispatchToRemoteService(opts, file);
  };

  processingStrategy.set(true, localExecutionLogic);
  processingStrategy.set(false, remoteDispatchLogic);

  const currentStrategy = processingStrategy.get(isLocalToolAvailable());
  currentStrategy(commandLineOptions, dataFileLocation, completionHandler);
};

module.exports = {
  executeOperation: initiateProcessing
};