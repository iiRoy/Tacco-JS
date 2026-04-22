'use strict';

const shellUtil = require('shelljs'),
      systemConsole = require('sys'),
      FilePath = require('path'),
      childExec = require('child_process').exec,
      webClient = require('http'),
      fileSystem = require('fs');

const SERVICE_API_URL = 'http://inch-ci.org/api/v1/cli';

function initiateProcess(toolParams, sourceFile, completionHandler)
{
    toolParams = toolParams || [];

    if ( isToolLocallyInstalled() )
    {
        const standardParams = ["--language=javascript", "--read-from-dump=" + sourceFile];
        executeLocalTool(toolParams.concat(standardParams), completionHandler);
    }
    else
    {
        invokeRemoteService(toolParams, sourceFile);
    }
}

function invokeRemoteService(toolParams, sourceFile)
{
    toolParams = toolParams || [];

    const parsedData = JSON.parse( fileSystem.readFileSync(sourceFile) );
    parsedData['args'] = toolParams;

    const serializedPayload = JSON.stringify(parsedData);

    const endpointAddress = require('url').parse(obtainServiceEndpoint());

    const httpConfiguration = {
        host: endpointAddress.hostname,
        port: endpointAddress.port,
        path: endpointAddress.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(serializedPayload, 'utf8')
        }
    };

    const outgoingCall = webClient.request(httpConfiguration, function(serverResponse) {
        serverResponse.setEncoding('utf8');
        serverResponse.on('data', function (receivedBlock) {
            systemConsole.print(receivedBlock);
        });
    });

    outgoingCall.on('error', function(err) {
        console.log('Error during remote call: ' + err.message);
    });

    outgoingCall.write(serializedPayload);
    outgoingCall.end();
}

function executeLocalTool(inputArguments, resultCallback)
{
    const executionCommand = retrieveToolCommand() + ' ' + inputArguments.join(' ');
    resultCallback( shellUtil.exec(executionCommand).output );
}

function retrieveToolCommand()
{
    if ( process.env.INCH_PATH )
    {
        return FilePath.join(process.env.INCH_PATH, "bin", "inch");
    }
    else
    {
        return shellUtil.which('inch');
    }
}

function obtainServiceEndpoint()
{
    if ( process.env.INCH_CLI_API )
    {
        return process.env.INCH_CLI_API;
    }
    else
    {
        return SERVICE_API_URL;
    }
}

function isToolLocallyInstalled()
{
    return !!retrieveToolCommand();
}

const publicApi = {
    initiateProcess: initiateProcess
};

module.exports = publicApi;