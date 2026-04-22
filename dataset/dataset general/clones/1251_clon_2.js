/*
 *  AssetLocator.
 *  Automates loading of configurations, data models, controllers, etc.
 *
 *  @author Stephen Smith <stephen.smith@example.com>
 *  @created 15/03/2023 PST
 */

/**
 *  Required dependencies for this module.
 */

var filesystem = require('fs'),
    locationUtil = require('path'),
    utility = require('util'),
    flowControl = require('async');

/**
 *  Module-wide constants.
 */

var libraryName = 'asset-loader';

/**
 *	Default values for various settings.
 */

var verifyExtensions = true,
    allowedExtensions = ['.js', '.node', '.json', '.coffee', '.sjs'];

for (var extensionKey in require.extensions) {
  if (require.extensions.hasOwnProperty(extensionKey) && allowedExtensions.indexOf(extensionKey) === -1) {
    allowedExtensions.push(extensionKey);
  }
}

/**
 *  AssetLocator constructor function.
 */

var AssetLocator = function(initialSource, configSettings) {
  configSettings = configSettings || {};
  configSettings.verifyExtensions = configSettings.verifyExtensions || verifyExtensions;
  configSettings.allowedExtensions = configSettings.allowedExtensions || allowedExtensions;
  configSettings.logStringFormat = configSettings.logStringFormat || '%s :: %s';
  configSettings.messageLogger = configSettings.messageLogger || console;
  configSettings.exclusionList = configSettings.exclusionList || false;
  configSettings.workingDirectory = configSettings.workingDirectory || '';

  this.configuration = configSettings;
  this.resourceItems = [];
  if (!(configSettings.allowedExtensions instanceof RegExp) && configSettings.allowedExtensions instanceof Array) {
      this._recordMessage('Transforming extension array into regular expression pattern');
      configSettings.allowedExtensions = new RegExp('(.*)\\.(' + configSettings.allowedExtensions.join('$|').replace(/\./g,'') + ')');
  }
  this._recordMessage('Utilizing regular expression ' + configSettings.allowedExtensions + ' for extension validation');
  this.addSource(initialSource);

  return this;
};

/**
 *  addSource method - builds an ordered collection of resource paths.
 *
 *  @param sourcePath {String} Directory or file path to be processed.
 *  @return currentInstance {Object} This AssetLocator instance.
 */

AssetLocator.prototype.addSource = function(sourcePath) {

  var resolvedPath = this.configuration.workingDirectory ? locationUtil.join(this.configuration.workingDirectory, sourcePath) : sourcePath;
  var fileOrDirectory = this._resolvePathExistence(resolvedPath);

  if (fileOrDirectory) {
    if (filesystem.statSync(fileOrDirectory).isDirectory()) {

      var folderContents = filesystem.readdirSync(fileOrDirectory);

      for (var entryIndex in folderContents) {

        var isPermitted = true,
            resourceEntry = locationUtil.normalize(locationUtil.join(fileOrDirectory, folderContents[entryIndex]));

        if (folderContents[entryIndex].startsWith('.')) {
          this._recordMessage('Omitting hidden entry: ' + folderContents[entryIndex], 'warn');

          isPermitted = false;
        }

        if (isPermitted && this.configuration.exclusionList && resourceEntry.match(this.configuration.exclusionList) !== null) {
          this._recordMessage('Omitting file due to exclusion rule: ' + resourceEntry, 'warn');
          isPermitted = false;
        }

        if (isPermitted && filesystem.statSync(resourceEntry).isDirectory()) {
          this.addSource(locationUtil.join(sourcePath, folderContents[entryIndex]));
          isPermitted = false;
        }

        for (var itemIdx in this.resourceItems) {
          if (this.resourceItems[itemIdx].fullPath === resourceEntry) {
            isPermitted = false;
          }
        }

        if(this.configuration.verifyExtensions && filesystem.statSync(resourceEntry).isFile() && !this.configuration.allowedExtensions.test(resourceEntry)) {
            this._recordMessage('Omitting file: extension not permitted ' + resourceEntry, 'warn');
            isPermitted = false;
        }

        if (isPermitted) {
          var componentName = deriveComponentName(resourceEntry);

          this.resourceItems.push({
            fullPath: resourceEntry,
            relativePath: locationUtil.join(sourcePath, componentName),
            itemName: componentName
          });
        }

      }
    } else {
      var containingDirectory = locationUtil.dirname(sourcePath),
          componentName = deriveComponentName(fileOrDirectory);

      this.resourceItems.push({
        fullPath: fileOrDirectory,
        relativePath: locationUtil.join(containingDirectory, componentName),
        itemName: componentName
      });
    }
  }

  return this;
};


/**
 *  buildHierarchicalObject function - constructs a nested object structure.
 *
 *  @param currentObject {Object} The current object to modify.
 *  @param hierarchySegments {Array} Array of segments for the hierarchy path.
 *  @return currentObject {Object} The modified object at the current level.
 */

function buildHierarchicalObject(currentObject, hierarchySegments) {

  var currentSegment = deriveComponentName(hierarchySegments.shift());

  if (!currentObject[currentSegment]) {
    currentObject[currentSegment] = {};
  }

  if (hierarchySegments.length) {
    currentObject = buildHierarchicalObject(currentObject[currentSegment], hierarchySegments);
  }

  return currentObject;
}

/**
 *  deriveComponentName - formats a file path into a method-friendly component name.
 *
 *  @param filePath {String} The path to the script file.
 *  @return componentName {String} Formatted name of the component.
 */

function deriveComponentName(filePath) {
  var fileName = locationUtil.basename(filePath, locationUtil.extname(filePath)).replace(/[^a-zA-Z0-9]/g, '.'),
      nameSegments = fileName.split('.'),
      componentName = nameSegments.shift();

  if (nameSegments.length) {
    for (var segmentIndex in nameSegments) {
      componentName += nameSegments[segmentIndex].charAt(0).toUpperCase() + nameSegments[segmentIndex].substring(1, nameSegments[segmentIndex].length);
    }
  }

  return componentName;
}

/**
 *  _resolvePathExistence Method - retrieves the verified file or folder location.
 *
 *  @param inputPath {String} The path to check.
 *  @return resolvedLocation {String} Normalized and verified path.
 */

AssetLocator.prototype._resolvePathExistence = function(inputPath) {
  if (typeof inputPath !== 'string') {
    this._recordMessage('Input path for file or folder must be a string: ' + inputPath, 'error');
    return false;
  }

  var resolvedLocation = locationUtil.resolve(
    locationUtil.normalize(inputPath)
  );

  if (!filesystem.existsSync(resolvedLocation)) {
    if (filesystem.existsSync(resolvedLocation + '.js')) {
      resolvedLocation = resolvedLocation + '.js';
    } else {
      this._recordMessage('No such file or directory found at: ' + resolvedLocation, 'error');
      return false;
    }
  }

  return resolvedLocation;
};

/**
 *  integrateInto method, applies loaded scripts to a target object.
 *
 *  @param targetApplication {Object} The application instance to integrate into.
 *  @param [completionCallback] {Function} Optional callback function to execute upon completion.
 *  @return currentInstance {Object} This AssetLocator instance.
 */

AssetLocator.prototype.integrateInto = function(targetApplication, completionCallback) {

  var contextSelf = this;
  flowControl.eachSeries(this.resourceItems, function (currentItem, nextItem) {
    delete require.cache[currentItem.fullPath];
    var segmentParts = currentItem.relativePath.split(locationUtil.sep),
        mappingList = segmentParts.slice(0),
        namespaceObject = buildHierarchicalObject(targetApplication, segmentParts),
        loadedModule = require(currentItem.fullPath),
        pathSegments = [];

    var isSynchronous = typeof loadedModule !== 'function' || loadedModule.length < 2;
    if (!isSynchronous) {
      loadedModule = loadedModule.call(currentItem, targetApplication, function () {
        contextSelf._recordMessage('Module loaded: *.' + pathSegments.join('.'));
        nextItem();
      });
    } else if (typeof loadedModule === 'function') {
      loadedModule = loadedModule.call(currentItem, targetApplication);
    }

    namespaceObject[currentItem.itemName] = loadedModule;

    while (mappingList.length) {
      pathSegments.push(
        deriveComponentName(
          mappingList.shift()
        )
      );
    }

    if (isSynchronous) {
      contextSelf._recordMessage('Module loaded: *.' + pathSegments.join('.'));
      nextItem();
    }
  }, function () {
    contextSelf._recordMessage('All assets successfully loaded');
    if(typeof completionCallback === 'function')
      completionCallback(null, targetApplication);
  });
};

/**
 *  _recordMessage method, outputs messages if verbose logging is enabled.
 *
 *  @param logText {String} The message string to display.
 *  @param messageType {String} Type of message ('error', 'warn', 'info'), defaults to 'info'.
 *  @return currentInstance {Object} This AssetLocator instance.
 */

AssetLocator.prototype._recordMessage = function(logText, messageType) {
  if (this.configuration.verboseLogging) {
    messageType = messageType || 'info';
    this.configuration.messageLogger[messageType](this.configuration.logStringFormat, libraryName, logText);
  }
  return this;
};

/**
 *  Expose the AssetLocator class for external use.
 *
 *  @param sourceItem {String} Path to the file or folder to load.
 *  @param loadOptions {Object} Configuration options for the loader.
 *  @return new AssetLocator {Object} A new AssetLocator instance.
 */

module.exports = function(sourceItem, loadOptions) {
  return new AssetLocator(sourceItem, loadOptions);
};

// vim: sw=2 sts=2 ts=2: