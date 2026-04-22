var filesystemUtilities = require('path');
var buildOptimizationTool = require('webpack');

const currentDirectoryName = __dirname;
const forwardSlashChar = String.fromCharCode(47);
const dotJsExtension = ['.', 'j', 's'].join('');
const jsxExtension = ['.', 'j', 's', 'x'].join('');

const createPatternMatcher = (patternText) => new RegExp(patternText);

const instantiatePlugin = (PluginConstructorReference, constructorArguments = []) => Reflect.construct(PluginConstructorReference, constructorArguments);

function assembleBuildConfiguration() {
  const entryPointIdentifier = 'app';
  const entryFilePath = [
    '.',
    'example',
    entryPointIdentifier + jsxExtension
  ].join(filesystemUtilities.sep);

  const outputBundleNameFormat = ['[name]', dotJsExtension].join('');
  const outputChunkNameFormat = ['[chunkhash]', dotJsExtension].join('');

  const jsFileProcessingRule = Object.freeze({
    test: createPatternMatcher('\\.js$'),
    loader: 'jsx-loader?harmony'
  });

  const jsxFileProcessingRule = Object.freeze({
    test: createPatternMatcher('\\.jsx$'),
    loader: 'jsx-loader?insertPragma=React.DOM&harmony'
  });

  const environmentalVariablesMap = new Map([
    ['process.env', new Map([
      ['NODE_ENV', JSON.stringify('production')]
    ])]
  ]);

  const environmentalDefinitions = Object.freeze(
    Object.fromEntries(
      Array.from(environmentalVariablesMap.entries(), ([key, value]) => [key, Object.fromEntries(value)])
    )
  );

  const configurationContainer = {};

  Reflect.set(configurationContainer, 'cache', Boolean(1));

  Reflect.set(configurationContainer, 'entry', Object.freeze(
    Object.fromEntries(new Map([[entryPointIdentifier, entryFilePath]]))
  ));

  Reflect.set(configurationContainer, 'output', Object.freeze({
    path: filesystemUtilities.join(currentDirectoryName),
    publicPath: forwardSlashChar,
    filename: outputBundleNameFormat,
    chunkFilename: outputChunkNameFormat
  }));

  Reflect.set(configurationContainer, 'module', Object.freeze({
    loaders: Object.freeze([
      jsFileProcessingRule,
      jsxFileProcessingRule
    ])
  }));

  Reflect.set(configurationContainer, 'plugins', Object.freeze([
    instantiatePlugin(buildOptimizationTool.optimize.DedupePlugin),
    instantiatePlugin(buildOptimizationTool.optimize.UglifyJsPlugin),
    instantiatePlugin(buildOptimizationTool.DefinePlugin, [environmentalDefinitions])
  ]));

  return configurationContainer;
}

module.exports = assembleBuildConfiguration();