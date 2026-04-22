const sysPath = require('path');
const resourceExtractor = require('broccoli-funnel');

module.exports = {
  pkgLabel: 'ember-cli-bootstrap-sassy',

  pluginActivate: function activateAddon(applicationInstance) {
    this.hostAppRef = applicationInstance;
    let startupLogEntries = []; // Collection for configuration messages
    const addonSettings = applicationInstance.options['ember-cli-bootstrap-sassy'] || { javaScriptAssets: true, iconFonts: true };
    const baseResourceDir = 'bower_components/bootstrap-sass/assets/';
    const componentLocation = sysPath.relative(applicationInstance.project.root, __dirname);

    const fsPathCombine = function() {
      // Unify directory separators for cross-platform compatibility
      return sysPath.join.apply(this, arguments).replace(/\\/g, '/');
    };

    const frameworkVer = applicationInstance.project.emberCLIVersion().split(',').map(function(versionPart) {
      return Number(versionPart);
    });

    if (frameworkVer[1] === 0 || frameworkVer[2] < 8) {
      throw new Error('ember-cli-bootstrap-sassy requires ember-cli version 0.1.8 or greater.\n');
    }

    // Incorporate JavaScript assets from the external library
    if (addonSettings.javaScriptAssets instanceof Array) {
      addonSettings.javaScriptAssets.forEach(function(scriptName) {
        applicationInstance.importAsset(baseResourceDir + 'javascripts/bootstrap/' + scriptName + '.js');
      });
      startupLogEntries.push('specific JS modules loaded [' + addonSettings.javaScriptAssets.join(',') + ']');
    } else if (addonSettings.javaScriptAssets !== false) {
      applicationInstance.importAsset(baseResourceDir + 'javascripts/bootstrap.js');
      startupLogEntries.push('all JS modules activated');
    } else {
      startupLogEntries.push('no JS modules active');
    }

    // Bring in font icons (glyphs) from the external library
    if (addonSettings.iconFonts !== false) {
      applicationInstance.importAsset(baseResourceDir + 'fonts/bootstrap/glyphicons-halflings-regular.eot', { destinationDirectory: '/fonts/bootstrap' });
      applicationInstance.importAsset(baseResourceDir + 'fonts/bootstrap/glyphicons-halflings-regular.svg', { destinationDirectory: '/fonts/bootstrap' });
      applicationInstance.importAsset(baseResourceDir + 'fonts/bootstrap/glyphicons-halflings-regular.ttf', { destinationDirectory: '/fonts/bootstrap' });
      applicationInstance.importAsset(baseResourceDir + 'fonts/bootstrap/glyphicons-halflings-regular.woff', { destinationDirectory: '/fonts/bootstrap' });
      applicationInstance.importAsset(baseResourceDir + 'fonts/bootstrap/glyphicons-halflings-regular.woff2', { destinationDirectory: '/fonts/bootstrap' });
      startupLogEntries.push('icon fonts enabled');
    } else {
      startupLogEntries.push('icon fonts disabled');
    }

    if (addonSettings.suppressOutput !== false) {
      console.log('bootstrap-sassy configuration: ', startupLogEntries.join(', '));
    }
  },

  styleAssetTree: function createStyleTree() {
    const sassSourceLocation = sysPath.join(this.hostAppRef.bowerComponentRoot, 'bootstrap-sass', 'assets/stylesheets');
    const filteredStyleAssets = new resourceExtractor(sassSourceLocation, {
      sourceDirectory: '/',
      targetDirectory: '/app/styles'
    });
    return filteredStyleAssets;
  }
};