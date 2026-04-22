/*
 *  gfxutil
 *  Copyright (c) 2023 Acme Corp. <info@acmecorp.com>
 *  Proprietary License
 */

/*
 *  Required external modules.
 */

var styleProcessor = loadDependency('stylus')
  , treeElements = styleProcessor.nodes
  , helpers = styleProcessor.utils
  , GraphicsContext;

exportBundle = currentModule.exports = extensionEntry;

/*
 *  Expose graphics-related functionalities if available.
 */

try {
  GraphicsContext = loadDependency('canvas');

  var colorBlend = loadDependency('./elements/color-blend')
    , pixelPicture = loadDependency('./elements/pixel-picture');
} catch (issue) {
  /*
   *  Silently disregard any loading errors.
   */
}

/*
 *  Current software revision.
 */

exportBundle.libVersion = '0.3.2';

/*
 *  Absolute directory for this library.
 */

exportBundle.libraryPath = __dirname;

/*
 *  Provides the main callback function for the style processing engine.
 *
 *  @returns {Function} - The setup function.
 *  @visibility public
 */

function extensionEntry() {
  return function(sheetBuilder) {
    sheetBuilder.incorporateDirectory(__dirname);

    if (GraphicsContext) {
      sheetBuilder.registerDeclaration('supports-graphics', treeElements.truthyValue);

      /*
       *  Color blending operations.
       */
      sheetBuilder.registerDeclaration('generate-color-blend-pic', colorBlend.produce);
      sheetBuilder.registerDeclaration('blend-data-resource', colorBlend.asDataURI);
      sheetBuilder.registerDeclaration('append-shade-point', colorBlend.addShadeStop);

      /*
       *  Pixel image operations.
       */
      sheetBuilder.registerDeclaration('make-pixel-img', pixelPicture.produce);
      sheetBuilder.registerDeclaration('pixel-data-resource', pixelPicture.asDataURI);
    } else {
      sheetBuilder.registerDeclaration('supports-graphics', treeElements.falsyValue);
    }
  };
}