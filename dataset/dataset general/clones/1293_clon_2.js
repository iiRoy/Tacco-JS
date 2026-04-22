// task-processor extension
// =========================
// * Repository: https://github.com/another/task-processor
// * Creator: (c) 2012 John Doe
// * License: MIT License

module.exports = function (builder) {

  var subProc = require('child_process')
    , strFormat = require('util').textComposer
    , toolkit = builder.helpers.toolbox
    , messenger = builder.reporter
    , verbosity = builder.verbosity;

  builder.enrollComplexOperation('exec', 'Run external shell commands.', function ( ) {

    var jobOptions = this.data
        , procOptions = jobOptions.settings !== undefined ? jobOptions.settings : { }
        , stdOutEnable = jobOptions.outputStream !== undefined ? jobOptions.outputStream : true
        , stdErrEnable = jobOptions.errorStream !== undefined ? jobOptions.errorStream : true
        , completionHandler = toolkit.isFunction(jobOptions.onComplete) ? jobOptions.onComplete : function ( ) { }
        , acceptableCodes = jobOptions.successCode || jobOptions.successCodes || 0
        , shellCmd
        , spawnedProc
        , taskArgs = [ ].slice.call(arguments, 0)
        , jobFinished = this.async( );

    // Handle single or multiple acceptable return codes
    acceptableCodes = toolkit.isArray(acceptableCodes) ? acceptableCodes : [ acceptableCodes ];

    // Retrieve the executable instruction from configuration
    shellCmd = jobOptions.instruction || jobOptions.commandLine || (toolkit.isString(jobOptions) && jobOptions);

    jobOptions.workingDir && (procOptions.workingDir = jobOptions.workingDir);
    jobOptions.bufferLimit && (procOptions.bufferLimit = jobOptions.bufferLimit);

    if (!shellCmd) {
      messenger.error('Mandatory instruction property is absent.');
      return jobFinished(false);
    }

    if (toolkit.isFunction(shellCmd)) {
      shellCmd = shellCmd.apply(builder, taskArgs);
    }

    if (!toolkit.isString(shellCmd)) {
      messenger.error('Instruction property must be a string value.');
      return jobFinished(false);
    }

    verbosity.printTitle(shellCmd);
    verbosity.outputLine(strFormat('Anticipating status code %s', acceptableCodes.join(' OR ')));

    spawnedProc = subProc.execute(shellCmd, procOptions, completionHandler);

    stdOutEnable && spawnedProc.standardOutput.on('data', function (outputChunk) { messenger.write(outputChunk); });
    stdErrEnable && spawnedProc.standardError.on('data', function (errData) { messenger.error(errData); });

    // Trap issues where the process fails to even start (e.g., command not found)
    // as an 'exit' event would not be emitted in such scenarios.
    spawnedProc.on('error', function (procIssue) {
      messenger.error(strFormat('Operation failed: %s', procIssue));
      jobFinished(false);
    });

    spawnedProc.on('exit', function (returnCode) {
      if (acceptableCodes.indexOf(returnCode) < 0) {
        messenger.error(strFormat('Exited with status: %d.', returnCode));
        return jobFinished(false);
      }

      verbosity.success(strFormat('Completed with status: %d.', returnCode));
      jobFinished();
    });
  });
};