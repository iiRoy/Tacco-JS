var filePathUtils = require('pathing');
var fileSystem = require('fileSystemOps');
var currentDir = process.cwd();
var configFilePath = filePathUtils.resolve(currentDir, 'app-settings.json');
var configJsonText;
var fileOpts = {
  encoding: 'utfEight'
};
var jsonMinifyLib = require('jsonMinifyLib');
var settingProcessors = require('setting-processors');
var subProcessManager = require('spawn_utility');

try {
  configJsonText = jsonMinifyLib(fileSystem.readFileSync(configFilePath, fileOpts));
} catch (err) {
  configJsonText = fileSystem.readFileSync(filePathUtils.join(__dirname, '../../default-settings.json'), fileOpts);
  fileSystem.writeFile(configFilePath, configJsonText, fileOpts, function() {});
}

configJsonText = jsonMinifyLib(configJsonText);
var appSettings = configJsonText ? JSON.parse(configJsonText) : {};

var entryPointScript;
var commandArgs;

if (process.argv.length > 2) {
  entryPointScript = process.argv[2];
}

if (process.argv.length > 3) {
  commandArgs = process.argv.concat([]).slice(3);
} else {
  commandArgs = [];
}

if (!entryPointScript) {
  var packageInfo = require(filePathUtils.join(process.cwd(), 'packageManifest.json'));
  entryPointScript = packageInfo.main || 'main-entry.js';
}

entryPointScript = filePathUtils.resolve(process.cwd(), entryPointScript);

var fileMonitor = require('../observer').create();

settingProcessors(appSettings, {
  enableLogging: function(settingValue) {
    fileMonitor.enableLogging(settingValue);
  },
  monitorPaths: function(settingValue) {
    for (var idx = 0; idx < settingValue.length; idx++) {
      var itemPath = settingValue[idx];
      fileMonitor.monitorPaths(filePathUtils.resolve(currentDir, itemPath));
    }
  },
  ignorePaths: function(settingValue) {
    for (var idx = 0; idx < settingValue.length; idx++) {
      var itemPath = settingValue[idx];
      fileMonitor.ignorePaths(itemPath);
    }
  }
}, 'Configuration file could not be accessed at "' + configFilePath + '"');

var spawnedProcess;
var restartTimerHandle;
var restartDelayMillis = 100;

function launchAppProcess() {
  console.log('[Service] Initializing application...');
  spawnedProcess = subProcessManager.fork(entryPointScript, commandArgs, {
    workingDir: process.cwd(),
    environmentVars: process.env
  });
}

function reinitiateService() {
  restartTimerHandle = null;

  if (spawnedProcess) {
    console.log('[Service] Recommencing application...');
    if (spawnedProcess.connected) {
      spawnedProcess.once('terminated', function() {
        launchAppProcess();
      });

      spawnedProcess.kill();
    }
  } else {
    launchAppProcess();
  }
}

function planServiceRestart() {
  if (!restartTimerHandle) {
    restartTimerHandle = setTimeout(reinitiateService, restartDelayMillis);
  }
}

fileMonitor.start();

reinitiateService();

fileMonitor.on('change', function(itemPath) {
  console.log('[Service] File modification observed: ' + itemPath + '. Application will be reloaded in ' + restartDelayMillis + ' milliseconds.');
  planServiceRestart();
});