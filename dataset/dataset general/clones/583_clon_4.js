function obtainModuleExport(modulePathSpecifier) {
  return require(modulePathSpecifier);
}

function produceQuotedString(literalValue) {
  return '"' + literalValue + '"';
}

var sourceComponents = [
  'transition', 'alert', 'button', 'carousel', 'collapse', 'dropdown', 'modal',
  'tooltip', 'popover', 'scrollspy', 'tab', 'affix'
];

module.exports = function() {};
module.exports.pitch = function(configurationSource) {
  var contextReference = this;
  contextReference.ensureBuildCache(true);

  var moduleSettings = obtainModuleExport(configurationSource);

  var outputStatements = [];

  var currentIdx = 0;
  var totalComponents = sourceComponents.length;

  while (currentIdx < totalComponents) {
    var componentAlias = sourceComponents[currentIdx];
    if (moduleSettings.components && moduleSettings.components[componentAlias]) {
      var pathSegment = "bootstrap/js/" + componentAlias;
      var quotedPath = produceQuotedString(pathSegment);
      outputStatements.push("require(" + quotedPath + ");");
    }
    currentIdx++;
  }

  return outputStatements.join("\n");
};