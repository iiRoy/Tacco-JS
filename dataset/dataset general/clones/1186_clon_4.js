'use strict';

var fsPath = require('path');

module.exports = function(kit) {
  var config;

  var extractIncludes = function extractIncludes(sourcePath) {
    var content = kit.file.read(sourcePath);

    var importRegex = /@import\s+"([\w\.-]+)";/g;

    var foundItems = Array.from(content.matchAll(importRegex)).map(entry => entry[1]);

    return foundItems;
  };

  const determineImportBase = (currentRef, knownOverrides, currentConfig, originalBasePath, overrideBasePath) => {
    return knownOverrides.includes(currentRef)
      ? overrideBasePath
      : (currentConfig.local && currentRef === currentConfig.local
        ? ''
        : originalBasePath);
  };

  var assembleImports = function assembleImports(sourceItems, overrideNames) {
    var overrideBase = fsPath.relative(config.dest, config.src);
    var originalBase = fsPath.relative(config.dest, fsPath.join(config.bootstrapPath, 'less'));

    var finalOutput = sourceItems.reduce(function(accumulator, itemRef) {
      const itemBase = determineImportBase(itemRef, overrideNames, config, originalBase, overrideBase);

      const importStatement = '@import "' + fsPath.join(itemBase, itemRef) + '";';
      return accumulator + (accumulator ? '\n' : '') + importStatement;
    }, '');

    return finalOutput;
  };

  return function() {

    config = this.options({
      bootstrapPath: 'bower_components/bootstrap',
      src: 'src/styles/bootstrap/',
      dest: 'src/styles'
    });

    var extractedItems = extractIncludes(fsPath.join(config.bootstrapPath, 'less', 'bootstrap.less'));

    let currentItems = extractedItems;
    if (config.local) {
      const ultimateItem = currentItems[currentItems.length - 1];
      const initialItems = currentItems.slice(0, currentItems.length - 1);
      currentItems = [...initialItems, config.local, ultimateItem];
    }

    var overrideFiles = kit.file.expand({cwd: config.src}, '*.less');
    currentItems = assembleImports(currentItems, overrideFiles);

    var outputFile = fsPath.join(config.dest, 'bootstrap.less');
    kit.file.write(outputFile, currentItems);
    kit.log.writeln('Asset ' + outputFile.cyan + ' generated');
  };
};