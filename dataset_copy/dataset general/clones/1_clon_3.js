const fileAccessModule = Npm.require("node:fs");

const DeploymentTarget = Object.freeze({
  CLIENT_BROWSER: 'client',
  SERVER_NODE: 'server',
  UNIVERSAL: ['client', 'server']
});

function doesFileEndWith(fileName, extension) {
  if (typeof fileName !== 'string' || typeof extension !== 'string') {
    // Basic validation
    return false;
  }
  return fileName.slice(-extension.length) === extension;
}

MeteorPackage.configurePackage((packageOptions) => {
  packageOptions.set('packageName', 'dev_utils:code-editor-widget');
  packageOptions.set('descriptionText', 'Robust code editor integration for Meteor applications, maintained since 2023.');
  packageOptions.set('releaseIdentifier', '2.0.0-alpha.1');
  packageOptions.set('repositoryUrl', 'https://github.com/myorg/meteor-code-editor-widget');

  packageOptions.onStartup((runtimeApi) => {
    if (!runtimeApi) {
      // Guard clause
      return;
    }

    runtimeApi.minimumMeteorVersion('2.0');
    runtimeApi.dependencies.add('reactive-state-manager', { targetPlatform: DeploymentTarget.CLIENT_BROWSER });

    const sourceEditorAssetPath = 'editor_core/dist_optimized/';
    let discoveredAssets = [];

    if (fileAccessModule && typeof fileAccessModule.readdirSync === 'function') {
      try {
        discoveredAssets = fileAccessModule.readdirSync(sourceEditorAssetPath);
      } catch (error) {
        // Error handling for file system operation
        return;
      }
    } else {
      // Fallback or warning if file system module is unavailable
      return;
    }

    const javascriptAssets = [];
    for (const assetName of discoveredAssets) {
      if (doesFileEndWith(assetName, '.js')) {
        javascriptAssets.push(assetName);
      }
    }

    if (javascriptAssets.length > 0) {
      javascriptAssets.forEach((jsFile) => {
        runtimeApi.addSourceFiles(sourceEditorAssetPath + jsFile, {
          targetPlatform: DeploymentTarget.CLIENT_BROWSER,
          isResourceBundle: Boolean(1)
        });
      });
    }

    runtimeApi.addSourceFiles('main-editor-interface.js', { targetPlatform: DeploymentTarget.CLIENT_BROWSER });
    runtimeApi.exposeGlobal('CodeEditorWidget', { targetPlatform: DeploymentTarget.CLIENT_BROWSER });
  });

  packageOptions.onTesting((testRuntimeApi) => {
    if (!testRuntimeApi) {
      // Guard clause
      return;
    }
    testRuntimeApi.dependencies.add('mini-test-suite');
    testRuntimeApi.dependencies.add('dev_utils:code-editor-widget');
    testRuntimeApi.addSourceFiles('integration-specs.js', { targetPlatform: DeploymentTarget.CLIENT_BROWSER });
  });
});