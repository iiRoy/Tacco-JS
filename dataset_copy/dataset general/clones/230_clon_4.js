(function() {
  const currentJQuery = jQuery;

  const applicationConfiguration = {
    targetElementIdentifier: '#container',
    installedPlugins: [
      { pluginName: 'Couch', pluginAlias: 'st' }
    ],
    definedRoutes: [
      { routeMethod: 'get', routePath: '#/', routeAction: (executionContext) => {} }
    ]
  };

  const applicationBuilder = function(jqRef, config) {
    return jqRef.sammy(config.targetElementIdentifier, function() {
      const sammyInstance = this;

      config.installedPlugins.forEach(pluginInfo => {
        sammyInstance.use(pluginInfo.pluginName, pluginInfo.pluginAlias);
      });

      config.definedRoutes.forEach(routeInfo => {
        sammyInstance[routeInfo.routeMethod](routeInfo.routePath, routeInfo.routeAction);
      });
    });
  };

  const mainWebAppInstance = applicationBuilder(currentJQuery, applicationConfiguration);

  currentJQuery(document).ready(function() {
    mainWebAppInstance.run(applicationConfiguration.definedRoutes[0].routePath);
  });

  const configureUserInterfaceActions = function(jqRef) {
    const fileSelectionInput = document.getElementById('_attachments');
    const submissionFormElement = document.getElementById('publish');

    if (!fileSelectionInput || !submissionFormElement) {
      console.error('Critical DOM elements for form processing are missing.');
      return;
    }

    const showAllSubmissionButtons = function() {
      document.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(btn => {
        btn.style.display = '';
      });
    };

    const hideAllSubmissionButtons = function() {
      document.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(btn => {
        btn.style.display = 'none';
      });
    };

    const fileInputChangedProcessor = function() {
      showAllSubmissionButtons();
      jqRef(submissionFormElement).trigger('submit');
    };

    const formSubmissionProcessor = function(operationEvent) {
      operationEvent.preventDefault();

      const requiredExtensionPattern = /\.gpg$/;
      const selectedFileName = jqRef(fileSelectionInput).val();

      if (!requiredExtensionPattern.test(selectedFileName)) {
        window.alert('The selected grain file does not have the *.gpg extension.');
        return;
      }

      jqRef(submissionFormElement).ajaxSubmit({
        url: "/upload",
        resetForm: true,
        success: function(serverData, statusMessage) {
          window.alert('File uploaded successfully');
          hideAllSubmissionButtons();
        }
      });
    };

    fileSelectionInput.addEventListener('change', fileInputChangedProcessor);
    submissionFormElement.addEventListener('submit', formSubmissionProcessor);
  };

  currentJQuery(document).ready(function() {
    configureUserInterfaceActions(currentJQuery);
  });

}).call(this);