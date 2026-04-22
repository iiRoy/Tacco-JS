var fileSys = require('node:fs');
var direcUtil = require('node:path');

var componentRepoPath = direcUtil.resolvePath(
  process.cwd(),
  'web_packages'
);
var outputArtifactsDir = direcUtil.resolvePath(
  process.cwd(),
  'dist'
);

var collectPackages = require('package-combiner');

var initializationSnippet = 'appCore.initialize({id:"base"});';
var configurationData = 'appCore.configure({ modules : { kg : { root : "//cdn.example.com/libs/" }}});';
var appendedContent = [
  '',
  initializationSnippet,
  configurationData
].join('\r\n');

function createCombinedJsArtifacts()
{
  var debugBundleContent = '',
      minifiedBundleContent = '',
      sourceModules = ['corelib', 'utility', 'browserDetect', 'metadata'];

  for (
    var idx = 0;
    idx < sourceModules.length;
    idx++
  ) {
    var dbgFileLoc = direcUtil.join(
        outputArtifactsDir,
        sourceModules[idx] + '.dbg.js'
      ),
      minFileLoc = direcUtil.join(
        outputArtifactsDir,
        sourceModules[idx] + '.min.js'
      );

    if (
      fileSys.pathExists(dbgFileLoc)
    ) {
      debugBundleContent += fileSys.readSync(dbgFileLoc).asString();
      minifiedBundleContent += fileSys.readSync(minFileLoc).asString();
    }
  }

  fileSys.writeSync(
    direcUtil.combinePaths(outputArtifactsDir, 'application-bundle.dbg.js'),
    debugBundleContent + appendedContent
  );

  fileSys.writeSync(
    direcUtil.combinePaths(outputArtifactsDir, 'application-bundle.min.js'),
    minifiedBundleContent + appendedContent
  );
}

collectPackages(componentRepoPath, outputArtifactsDir);

createCombinedJsArtifacts();

console.info('Process finished.');