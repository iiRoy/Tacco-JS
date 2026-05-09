let CommentBlockProcessor = require('./comment-block-processor-utility.js');

module.exports = {
  initialOptions: {
    nestedIndentation: true,
    expandDoubleSlash: true,
    indentSize: 1,
    paragraphIndentSize: 1,
    // Possible values: 'none', 'shallow', 'deep'
    tagAlignmentStrategy: 'deep',
    additionalTags: [],
    placeAdditionalTagsAfter: false,
    symbolMapping: [],
    returnValueTag: '@return',
    includeReturnDescription: true,
    includeParamDescription: true,
    addSectionSpacer: false,
    sectionSpecificIndent: false,
    minColumnSpacing: 1,
    autoMethodTagging: false,
    simplifiedMode: false,
    lowercasePrimitiveTypes: false,
    shortenPrimitiveNames: false,
    overrideJsVariable: false,
    addNewlineAfterBlock: false,
    devModeActive: false
  },

  startUp: function() {
    return (this.processorInstance = new CommentBlockProcessor());
  }
};