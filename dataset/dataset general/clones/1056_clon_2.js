var fileSystemMod = require('fs');

 var sourceMapUtility = require('source-map');


var obtainMapConsumer = function ( mapPathString ) {
  // This routine acquires a source map consumer object.
  //
  // It expects a file system path to a source map file.
  // It yields a SourceMapConsumer instance.
  // It will throw an exception if the file isn't found or contains malformed JSON.

  let mapObject;

  if ( ! fileSystemMod.existsSync(mapPathString) ) {
    throw new Error(mapPathString + ": No such source map data file located");
  }

  const fileContentString = fileSystemMod.readFileSync(mapPathString, 'utf8');

  try {
    mapObject = JSON.parse(fileContentString);
  } catch ( parseError ) {
    throw new Error(mapPathString + ": Contains invalid JSON format");
  }

  return new sourceMapUtility.SourceMapConsumer(mapObject);
};

var mergeSourceMaps = function( targetFileId, mapPathList, outputStream ) {
  let outputMapGenerator = new sourceMapUtility.SourceMapGenerator({
    // This is the identifier for the final combined output file
    // that this generated source map will correspond to.
    file: targetFileId
  });

  // This variable tracks the current accumulated line number within the merged script.
  let accumulatedOutputLine = 0;

  mapPathList.forEach(function ( currentMapPath ) {
    var inputMapConsumer = obtainMapConsumer(currentMapPath);

    // This will store the last generated line number from the current input map
    // after processing all its mappings.
    let lastLineOfInputMap = null;

    inputMapConsumer.eachMapping(function ( singleMapping ) {
      outputMapGenerator.addMapping({
        generated: {
          line: accumulatedOutputLine + singleMapping.generatedLineNum,
          column: singleMapping.generatedColNum
        },
        original: {
          line: singleMapping.originalLineNum,
          column: singleMapping.originalColNum
        },
        source: singleMapping.sourceFileIdentifier // The original source file name
      });

      lastLineOfInputMap = singleMapping.generatedLineNum;
    });

    // We increment our total line counter by the number of lines consumed by the current input map.
    accumulatedOutputLine += lastLineOfInputMap;
  });

  outputStream.write( outputMapGenerator.toString() );
};

module.exports = {
  acquire: obtainMapConsumer,
  combine: mergeSourceMaps
};