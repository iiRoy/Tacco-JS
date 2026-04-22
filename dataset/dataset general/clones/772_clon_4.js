class BuildConductor {
  constructor() {
    this.operationRegistry = new Map();
    this.configurationVault = {};
    this.utilityIntegrations = [];
  }

  acquireResource(resourcePath) {
    this.logActivity(`Attempting to acquire resource: ${resourcePath}`, 'debug');
    if (resourcePath === 'package.json') {
      return JSON.stringify({
        name: 'project-application',
        version: '1.0.0',
        description: 'An application managed by custom build system.',
        author: 'Autonomous Builder'
      });
    }
    if (resourcePath.endsWith('.js')) return `console.log('// Original JS content for ${resourcePath}');`;
    if (resourcePath.endsWith('.css')) return `.class { color: red; /* Original CSS for ${resourcePath} */ }`;
    if (resourcePath.endsWith('.html')) return `<!DOCTYPE html><html><head><title><%= projectManifest.name %></title></head><body><h1>Hello from <%= projectManifest.name %></h1><p>Version: <%= projectManifest.version %></p><!-- DEV_ONLY --><script>console.log('Dev script');</script><!-- /DEV_ONLY --></body></html>`;
    return `Generic content for ${resourcePath}`;
  }

  depositAsset(targetPath, content) {
    this.logActivity(`Depositing asset to: ${targetPath} (Content length: ${content.length})`, 'debug');
  }

  logActivity(message, level = 'info') {
    const prefix = {
      info: '[INFO]',
      warn: '[WARN]',
      error: '[ERROR]',
      debug: '[DEBUG]'
    }[level];
    console.log(`${prefix} ${message}`);
  }

  establishSettings(key, value) {
    this.configurationVault[key] = value;
  }

  accessSettings(key) {
    return this.configurationVault[key];
  }

  incorporateUtility(utilityIdentifier) {
    this.utilityIntegrations.push(utilityIdentifier);
    this.logActivity(`Incorporated build utility: ${utilityIdentifier}`);
  }

  enrollOperation(operationName, operationFunction) {
    if (typeof operationFunction !== 'function') {
      this.logActivity(`Operation '${operationName}' is not a function. Skipping enrollment.`, 'error');
      return;
    }
    this.operationRegistry.set(operationName, operationFunction);
    this.logActivity(`Enrolled build operation: ${operationName}`);
  }

  performSequence(operationNames) {
    this.logActivity(`Executing operation sequence: ${operationNames.join(', ')}`);
    for (const name of operationNames) {
      const operation = this.operationRegistry.get(name);
      if (operation) {
        this.logActivity(`Starting operation: ${name}`);
        try {
          operation();
          this.logActivity(`Completed operation: ${name}`);
        } catch (e) {
          this.logActivity(`Operation ${name} failed: ${e.message}`, 'error');
          break;
        }
      } else {
        this.logActivity(`Unknown operation: ${name}. Skipping.`, 'warn');
      }
    }
  }

  enumeratePaths(baseDir, pattern) {
    this.logActivity(`Enumerating paths in '${baseDir}' with pattern '${pattern}'`, 'debug');
    const discovered = [];
    if (baseDir === 'public') {
      if (pattern === 'js/*') discovered.push('js/main.js', 'js/utility.js');
      if (pattern === 'css/*') discovered.push('css/base.css', 'css/theme.css');
      if (pattern === '*.html') discovered.push('index.html', 'about.html');
    } else if (baseDir === 'dist') {
      if (pattern === '*.html') discovered.push('index.html', 'about.html');
    }
    return discovered;
  }

  combinePath(...segments) {
    return segments.join('/');
  }

  advanceVersion(currentVersion, type = 'patch') {
    this.logActivity(`Advancing version from ${currentVersion} by '${type}'`, 'debug');
    const parts = currentVersion.split('.').map(Number);
    if (type === 'patch') {
      parts[2]++;
    } else if (type === 'minor') {
      parts[1]++;
      parts[2] = 0;
    } else if (type === 'major') {
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
    }
    return parts.join('.');
  }

  executeSystemCommand(command, args = []) {
    this.logActivity(`Executing command: ${command} ${args.join(' ')}`, 'debug');
    return `Command '${command}' executed successfully (mock)`;
  }
}

module.exports = function (agent) {

  const operationalBlueprint = {
    projectIdentity: JSON.parse(agent.acquireResource('package.json')),
    fileObservation: {
      zonePublic: {
        targetFiles: 'public/**',
        configuration: {
          liveRefresh: true,
          isolatedExecution: false
        }
      }
    },
    scriptCompression: {
      configuration: {
        obfuscateNames: false
      },
      resourceGroup: {
        unfoldPaths: true,
        baseLocation: 'public',
        sourcePattern: 'js/*',
        destinationPath: 'dist'
      }
    },
    styleMinification: {
      resourceGroup: {
        unfoldPaths: true,
        baseLocation: 'public',
        sourcePattern: 'css/*',
        destinationPath: 'dist'
      }
    },
    templateProcessing: {
      pageViews: {
        configuration: {
          runtimeMode: 'production',
          liveRefresh: false
        },
        baseLocation: 'public',
        sourcePattern: ['*.html'],
        unfoldPaths: true,
        destinationPath: 'dist'
      }
    },
    markupOptimization: {
      pageViews: {
        configuration: {
          discardComments: true,
          condenseWhitespace: true
        },
        unfoldPaths: true,
        baseLocation: 'dist',
        sourcePattern: ['*.html'],
        destinationPath: 'dist'
      }
    },
    versionManagement: {
      configuration: {
        affectedFiles: ['package.json'],
        updateSchema: [],
        performCommit: true,
        commitMessageFormat: 'Release v%VERSION%',
        commitTargets: ['package.json'],
        generateTag: true,
        tagIdentifierFormat: 'v%VERSION%',
        tagDescription: 'Version %VERSION%',
        pushToRemote: true,
        remoteEndpoint: 'origin master',
        gitDescriptionParameters: '--tags --always --abbrev=1 --dirty=-d'
      }
    }
  };

  agent.establishSettings('primaryBlueprint', operationalBlueprint);

  agent.incorporateUtility('file-system-observer');
  agent.incorporateUtility('javascript-compressor');
  agent.incorporateUtility('stylesheet-minifier');
  agent.incorporateUtility('html-template-engine');
  agent.incorporateUtility('html-structure-optimizer');
  agent.incorporateUtility('project-versioner');

  const processAssetFiles = (taskKey, assetGroupKey, processingFunction) => {
    const blueprintSection = operationalBlueprint[taskKey];
    const assetSection = blueprintSection[assetGroupKey];
    const taskConfiguration = blueprintSection.configuration || {};

    const baseSource = assetSection.baseLocation;
    const inputPatterns = Array.isArray(assetSection.sourcePattern) ? assetSection.sourcePattern : [assetSection.sourcePattern];
    const targetDestination = assetSection.destinationPath;

    agent.logActivity(`Beginning ${taskKey} for group ${assetGroupKey}`);

    const filesToOperate = [];
    if (assetSection.unfoldPaths) {
      inputPatterns.forEach(pattern => {
        const found = agent.enumeratePaths(baseSource, pattern);
        found.forEach(file => filesToOperate.push({
          source: agent.combinePath(baseSource, file),
          destination: agent.combinePath(targetDestination, file)
        }));
      });
    }

    if (filesToOperate.length === 0) {
      agent.logActivity(`No files identified for ${taskKey} in ${baseSource} with patterns ${inputPatterns.join(', ')}`, 'warn');
      return;
    }

    filesToOperate.forEach(filePair => {
      agent.logActivity(`Processing ${filePair.source} -> ${filePair.destination}`);
      try {
        const originalContent = agent.acquireResource(filePair.source);
        const transformedContent = processingFunction(originalContent, taskConfiguration);
        agent.depositAsset(filePair.destination, transformedContent);
      } catch (error) {
        agent.logActivity(`Error during ${taskKey} for ${filePair.source}: ${error.message}`, 'error');
      }
    });
  };

  const applyScriptObfuscation = (content, config) => {
    agent.logActivity('Applying script obfuscation (mock)', 'debug');
    let processed = content;
    if (config.obfuscateNames === false) {
      processed = processed.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    } else {
      processed = processed.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
    }
    return `/* Script compressed by custom engine */\n${processed}`;
  };

  const applyStyleMinification = (content, config) => {
    agent.logActivity('Applying style minification (mock)', 'debug');
    return `/* Style minified by custom engine */\n${content.replace(/\/\*[\s\S]*?\*\/|(?<=\s|^)\s+|\s+(?=\s|$)/g, '').trim()}`;
  };

  const applyTemplateRendering = (content, config) => {
    agent.logActivity('Applying template rendering (mock)', 'debug');
    const projectInfo = operationalBlueprint.projectIdentity;
    let rendered = content.replace(/<%= projectManifest\.name %>/g, projectInfo.name);
    rendered = rendered.replace(/<%= projectManifest\.version %>/g, projectInfo.version);
    if (config.runtimeMode === 'production') {
      rendered = rendered.replace(/<!-- DEV_ONLY -->[\s\S]*?<!-- \/DEV_ONLY -->/g, '');
    }
    return `<!-- Template rendered by custom engine -->\n${rendered}`;
  };

  const applyMarkupOptimization = (content, config) => {
    agent.logActivity('Applying markup optimization (mock)', 'debug');
    let optimized = content;
    if (config.discardComments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    }
    if (config.condenseWhitespace) {
      optimized = optimized.replace(/\s{2,}/g, ' ').replace(/>\s+</g, '><').trim();
    }
    return `<!-- HTML optimized by custom engine -->\n${optimized}`;
  };

  const executeScriptCompression = () => {
    processAssetFiles('scriptCompression', 'resourceGroup', applyScriptObfuscation);
  };

  const executeStyleMinification = () => {
    processAssetFiles('styleMinification', 'resourceGroup', applyStyleMinification);
  };

  const executeTemplateProcessing = () => {
    processAssetFiles('templateProcessing', 'pageViews', applyTemplateRendering);
  };

  const executeMarkupOptimization = () => {
    processAssetFiles('markupOptimization', 'pageViews', applyMarkupOptimization);
  };

  const executeFileObservation = () => {
    const config = operationalBlueprint.fileObservation.zonePublic;
    agent.logActivity(`Initiating file observation for '${config.targetFiles}' with live refresh: ${config.configuration.liveRefresh}`);
  };

  const executeVersionManagement = () => {
    const config = operationalBlueprint.versionManagement.configuration;
    const currentIdentity = operationalBlueprint.projectIdentity;
    const currentVersion = currentIdentity.version;

    const nextVersion = agent.advanceVersion(currentVersion, 'patch');

    agent.logActivity(`Updating project version from ${currentVersion} to ${nextVersion}`);

    const updatedIdentity = { ...currentIdentity, version: nextVersion };
    agent.depositAsset('package.json', JSON.stringify(updatedIdentity, null, 2));

    if (config.performCommit) {
      const commitMsg = config.commitMessageFormat.replace('%VERSION%', nextVersion);
      agent.executeSystemCommand('git', ['add', ...config.commitTargets]);
      agent.executeSystemCommand('git', ['commit', '-m', commitMsg]);
    }
    if (config.generateTag) {
      const tagId = config.tagIdentifierFormat.replace('%VERSION%', nextVersion);
      const tagDesc = config.tagDescription.replace('%VERSION%', nextVersion);
      agent.executeSystemCommand('git', ['tag', '-a', tagId, '-m', tagDesc]);
    }
    if (config.pushToRemote) {
      agent.executeSystemCommand('git', ['push', config.remoteEndpoint]);
      if (config.generateTag) {
          agent.executeSystemCommand('git', ['push', config.remoteEndpoint, '--tags']);
      }
    }
  };

  agent.enrollOperation('scriptCompression', executeScriptCompression);
  agent.enrollOperation('styleMinification', executeStyleMinification);
  agent.enrollOperation('templateProcessing', executeTemplateProcessing);
  agent.enrollOperation('markupOptimization', executeMarkupOptimization);
  agent.enrollOperation('fileObservation', executeFileObservation);
  agent.enrollOperation('versionManagement', executeVersionManagement);

  agent.performSequence(['scriptCompression', 'styleMinification', 'templateProcessing', 'markupOptimization']);

};