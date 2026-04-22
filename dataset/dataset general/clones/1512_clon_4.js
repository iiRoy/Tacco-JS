const systemPath = require('path');
const AssetTreeProcessor = require('broccoli-funnel');

class BootstrapSassIntegration {
  static identifier() {
    return 'ember-cli-bootstrap-sassy';
  }

  constructor(applicationContext) {
    this.associatedApplication = applicationContext;
    this.integrationLog = [];
    this.configurationOptions = this.associatedApplication.options[BootstrapSassIntegration.identifier()] || { scriptInclusion: true, fontIcons: true };
    this.baseAssetRoute = 'bower_components/bootstrap-sass/assets/';
  }

  initiateProcessing() {
    const versionInfo = this.associatedApplication.project.emberCLIVersion();
    const versionComponents = versionInfo.split(',').map(part => parseInt(part, 10));

    if (versionComponents.length < 3) {
        throw new Error('Incompatible framework version format encountered.');
    }

    const minorComponent = versionComponents[1];
    const patchComponent = versionComponents[2];

    if (minorComponent === 0 || patchComponent < 8) {
        throw new Error('Minimum framework version 0.1.8 is mandatory for this component.\n');
    }

    const scriptOption = this.configurationOptions.scriptInclusion;
    const scriptBaseRoute = this.baseAssetRoute + 'javascripts/bootstrap/';

    const jsHandlingStrategy = new Map([
        ['array', (arr) => {
            for (const itemSegment of arr) {
                this.associatedApplication.import(scriptBaseRoute + itemSegment + '.js');
            }
            this.integrationLog.push(`specific scripts loaded [${arr.join(',')}]`);
        }],
        ['boolean-true', () => {
            this.associatedApplication.import(this.baseAssetRoute + 'javascripts/bootstrap.js');
            this.integrationLog.push('all scripts activated');
        }],
        ['boolean-false', () => {
            this.integrationLog.push('scripts deactivated');
        }],
        ['default', () => {
            this.associatedApplication.import(this.baseAssetRoute + 'javascripts/bootstrap.js');
            this.integrationLog.push('all scripts activated');
        }]
    ]);

    let jsType;
    if (Array.isArray(scriptOption)) {
        jsType = 'array';
    } else if (typeof scriptOption === 'boolean') {
        jsType = `boolean-${scriptOption}`;
    } else {
        jsType = 'default';
    }
    (jsHandlingStrategy.get(jsType) || jsHandlingStrategy.get('default'))(scriptOption);

    const fontIconPreference = this.configurationOptions.fontIcons;
    const iconFiles = [
        'glyphicons-halflings-regular.eot',
        'glyphicons-halflings-regular.svg',
        'glyphicons-halflings-regular.ttf',
        'glyphicons-halflings-regular.woff',
        'glyphicons-halflings-regular.woff2'
    ];
    const iconDestinationDirectory = '/fonts/bootstrap';
    const iconSourcePrefix = this.baseAssetRoute + 'fonts/bootstrap/';

    if (fontIconPreference !== false) {
        iconFiles.forEach(individualFile => {
            this.associatedApplication.import(iconSourcePrefix + individualFile, { destinationDirectory: iconDestinationDirectory });
        });
        this.integrationLog.push('font icons enabled');
    } else {
        this.integrationLog.push('font icons disabled');
    }

    const suppressOutput = this.configurationOptions.quiet === false;
    if (!suppressOutput) {
        console.info('Component setup details: ', this.integrationLog.join('; '));
    }
  }

  generateStylesheetSource() {
    const styleSourceLocation = systemPath.join(this.associatedApplication.bowerDirectory, 'bootstrap-sass', 'assets', 'stylesheets');

    const styleAssetContainer = new AssetTreeProcessor(styleSourceLocation, {
      sourceDirectory: '/',
      targetDirectory: '/app/styles'
    });
    return styleAssetContainer;
  }
}

module.exports = {
  name: BootstrapSassIntegration.identifier(),
  
  included: function(appContext) {
    this._addonProcessor = new BootstrapSassIntegration(appContext);
    this._addonProcessor.initiateProcessing();
  },
  
  treeForStyles: function() {
    return this._addonProcessor.generateStylesheetSource();
  }
};