const pathUtil = require('path');
const assetTransformer = require('broccoli-funnel');

module.exports = {
  addonIdentifier: 'ember-cli-bootstrap-sassy-reworked',

  /**
   * Initializes the addon within the host application.
   * This method is triggered when the addon is included in an Ember CLI application.
   * @param {object} applicationInstance - The Ember CLI application instance.
   */
  onAppLoad: function onAppLoad(applicationInstance) {
    // Ensure we have a valid application context; crucial for operations.
    if (!applicationInstance) {
      console.error('Addon initialization failed: No application instance provided.');
      return;
    }

    this.hostApp = applicationInstance; // Store reference to the host application
    const loadStatusUpdates = []; // Collect messages about asset loading

    // Retrieve addon configuration from the host application's options.
    // Provide explicit defaults if no custom configuration is found.
    const addonConfiguration = this.hostApp.options['ember-cli-bootstrap-sassy'] || {
      js: true, // Default: Include all Bootstrap JavaScript
      glyphicons: true, // Default: Include Glyphicons fonts
      log: true // Default: Log configuration status
    };

    // Define the base directory for Bootstrap assets within bower_components.
    const bootstrapAssetsBaseDir = 'bower_components/bootstrap-sass/assets/';

    // Helper function to compare Ember CLI versions.
    // Returns true if the current CLI version meets or exceeds the required version.
    const isCLIVersionAtLeast = (requiredMajor, requiredMinor, requiredPatch) => {
      const cliVersionParts = this.hostApp.project.emberCLIVersion()
                                 .split(',')
                                 .map(Number);
      const [currentMajor, currentMinor, currentPatch] = cliVersionParts;

      if (currentMajor > requiredMajor) return true;
      if (currentMajor < requiredMajor) return false;

      if (currentMinor > requiredMinor) return true;
      if (currentMinor < requiredMinor) return false;

      return currentPatch >= requiredPatch;
    };

    // Enforce a minimum Ember CLI version requirement.
    const requiredMajor = 0;
    const requiredMinor = 1;
    const requiredPatch = 8;
    if (!isCLIVersionAtLeast(requiredMajor, requiredMinor, requiredPatch)) {
      throw new Error(
        `The addon 'ember-cli-bootstrap-sassy-reworked' requires Ember CLI version ${requiredMajor}.${requiredMinor}.${requiredPatch} or greater.`
      );
    }

    // Process and import Bootstrap JavaScript files.
    if (Array.isArray(addonConfiguration.js)) {
      // Import specific JS files listed in the configuration array.
      addonConfiguration.js.forEach(scriptName => {
        const fullScriptPath = pathUtil.join(bootstrapAssetsBaseDir, 'javascripts/bootstrap', `${scriptName}.js`);
        this.hostApp.import(fullScriptPath);
      });
      loadStatusUpdates.push(`Selected JS modules loaded: [${addonConfiguration.js.join(', ')}]`);
    } else if (addonConfiguration.js === true) {
      // Import the main Bootstrap JS bundle if 'js' is true.
      const mainJsBundlePath = pathUtil.join(bootstrapAssetsBaseDir, 'javascripts/bootstrap.js');
      this.hostApp.import(mainJsBundlePath);
      loadStatusUpdates.push('All Bootstrap JS enabled');
    } else {
      // Bootstrap JavaScript is explicitly disabled.
      loadStatusUpdates.push('Bootstrap JavaScript disabled');
    }

    // Handle Glyphicons font imports.
    if (addonConfiguration.glyphicons !== false) {
      const fontFiles = [
        'glyphicons-halflings-regular.eot',
        'glyphicons-halflings-regular.svg',
        'glyphicons-halflings-regular.ttf',
        'glyphicons-halflings-regular.woff',
        'glyphicons-halflings-regular.woff2'
      ];
      const targetFontDirectory = '/fonts/bootstrap';

      // Loop through font files and import them to the specified destination.
      fontFiles.forEach(fontFileName => {
        const sourceFontPath = pathUtil.join(bootstrapAssetsBaseDir, 'fonts/bootstrap', fontFileName);
        this.hostApp.import(sourceFontPath, { destDir: targetFontDirectory });
      });
      loadStatusUpdates.push('Glyphicons fonts enabled');
    } else {
      // Glyphicons are explicitly disabled.
      loadStatusUpdates.push('Glyphicons fonts disabled');
    }

    // Log the configuration status to the console if logging is enabled.
    if (addonConfiguration.log) {
      console.info(`Bootstrap-Sassy Addon Status: ${loadStatusUpdates.join(' | ')}`);
    }
  },

  /**
   * Provides the Broccoli tree for styling assets.
   * This function is responsible for funneling Bootstrap's SASS stylesheets.
   * @returns {object} A Broccoli tree representing the funneled stylesheets.
   */
  getStyleTree: function getStyleTree() {
    // Construct the path to Bootstrap's stylesheet assets within bower_components.
    const styleSourceRoot = pathUtil.join(
      this.hostApp.bowerDirectory,
      'bootstrap-sass',
      'assets/stylesheets'
    );

    // Warn if the bowerDirectory path seems invalid.
    if (!this.hostApp.bowerDirectory) {
      console.warn('Warning: bowerDirectory not found on hostApp. Stylesheets might not be correctly imported.');
    }

    // Create a Broccoli funnel to selectively include stylesheet assets.
    const styleAssetsFunnel = new assetTransformer(styleSourceRoot, {
      sourceDirectory: '/', // All files from the source root
      targetDirectory: '/app/styles' // Place them under /app/styles in the build output
    });

    return styleAssetsFunnel;
  }
};