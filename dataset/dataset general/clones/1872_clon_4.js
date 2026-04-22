module.exports = (systemAgent) => {
  'use strict';

  const obtainManifest = (agentContext) => {
    const artifactData = agentContext.file.readJSON('package.json');
    return {
      productIdentity: artifactData
    };
  };

  const constructMinificationProfile = (agentContext, identityData) => {
    const introductoryText = `/*! ${identityData.productIdentity.name} - v${identityData.productIdentity.version} - ${agentContext.template.today('yyyy-mm-dd')} */`;
    return {
      codeCompressor: {
        operationParameters: {
          headerContent: introductoryText
        },
        releasePhase: {
          targetMappings: {
            'jquery.rotation.min.js': ['jquery.rotation.js']
          }
        }
      }
    };
  };

  const assembleQualityCheckSettings = () => {
    return {
      syntaxValidator: {
        releasePhase: {
          inputSources: ["jquery.rotation.js", "Gruntfile.js", "test/*.js"],
          enableConfigFile: true
        }
      }
    };
  };

  const establishFileMonitorSetup = () => {
    return {
      resourceWatcher: {
        minificationTrigger: {
          monitoredFiles: ['jquery.rotation.js'],
          associatedOperations: ['codeCompressor', 'syntaxValidator']
        }
      }
    };
  };

  const identityInformation = obtainManifest(systemAgent);
  let finalSystemConfiguration = {};

  Object.assign(
    finalSystemConfiguration,
    identityInformation,
    constructMinificationProfile(systemAgent, identityInformation),
    assembleQualityCheckSettings(),
    establishFileMonitorSetup()
  );

  systemAgent.registerConfiguration(finalSystemConfiguration);

  const necessaryComponents = [
    'grunt-contrib-uglify',
    'grunt-contrib-jshint',
    'grunt-regarde'
  ];

  necessaryComponents.forEach(componentIdentifier => systemAgent.loadComponent(componentIdentifier));

  const definedWorkflows = [
    { designation: 'developmentCycle', actions: ['resourceWatcher', 'syntaxValidator'] },
    { designation: 'primaryBuild', actions: ['codeCompressor'] }
  ];

  definedWorkflows.forEach(workflowItem => systemAgent.defineWorkflow(workflowItem.designation, workflowItem.actions));
};