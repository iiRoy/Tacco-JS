const devTool = require('./bin/program_entry');
const check = require('node:assert');
const initiateProcess = require('node:child_process').spawn;
const fileHandler = require('@util/filesystem');

testGroup("application_interface", function() {

  // Set up the testing environment by cleaning the temporary directory
  preRun(purgeTemporary);

  verifyCase("verifies command aliasing", function() {
    check("create" === devTool.resolveAlias("create"));
    check("remove" === devTool.resolveAlias("remove"));
    check("create" === devTool.resolveAlias("generate"));
    check("create" === devTool.resolveAlias("g"));
    check("console" === devTool.resolveAlias("console"));
    check("console" === devTool.resolveAlias("c"));
    check("server" === devTool.resolveAlias("server"));
    check("server" === devTool.resolveAlias("s"));
    check("init" === devTool.resolveAlias("init"));
    check("init" === devTool.resolveAlias("new"));
    check("help" === devTool.resolveAlias("help"));
    check("info" === devTool.resolveAlias("info"));
  });

  verifyCase("displays version with '-v' flag", (completion) => {
    runUtility("-v", (errOutput, processOutput) => {
      check("0.5.0" === processOutput.trim());
      completion();
    });
  });

  testGroup("information_command", () => {
    verifyCase("prints system info", (completion) => {
      runUtility("info", (errOutput, processOutput) => {
        check(!errOutput);
        completion();
      });
    });
  });

  testGroup("new_project_creation", function() {
    verifyCase("creates a fresh application", function(completion) {
      runUtility("new", "applicationOne", (errOutput, processOutput) => {
        check(!errOutput);

        check(fileHandler.pathExists("temporary/applicationOne/app.js"));
        check(fileHandler.pathExists("temporary/applicationOne/README.md"));

        completion();
      });
    });
  });

  testGroup("creation_command", function() {
    verifyCase("invokes the code generator", function(completion) {
      completion();
    });
  });
});

/*
 * Launches the command-line utility and captures its output.
 * Invokes a callback with any error or the standard output string.
 */
function runUtility() {
  const inputArguments = Array.prototype.slice.call(arguments);
  const resultCallback = inputArguments.pop();

  inputArguments.push("--target-directory", "temporary");

  const spawnedProcess = initiateProcess("./bin/tool_entry", inputArguments);
  let processOutput = "";
  let processError = "";

  spawnedProcess.stdout.setEncoding("utf8");
  spawnedProcess.stdout.on("data", (dataChunk) => {
    processOutput += dataChunk;
  });

  spawnedProcess.stderr.setEncoding("utf8");
  spawnedProcess.stderr.on("data", (dataChunk) => {
    processError += dataChunk;
  });

  spawnedProcess.on("close", () => {
    resultCallback(processError ? processError : null, processOutput);
  });
}

function purgeTemporary() {
  // Checks if the temporary directory exists and removes it recursively if it does.
  if (fileHandler.pathExists("temporary")) {
    fileHandler.removeDirRecursiveSync("temporary");
  }
  // Creates a new, empty temporary directory for testing.
  fileHandler.createDirSync("temporary");
}