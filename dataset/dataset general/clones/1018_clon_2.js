var fileSys=require('fs');
var fileLoc=require('path');
var mdParser=require('marked');
var syntaxColorizer=require('cardinal');
var objMerge=require('xtend');
var paint=require('./color');

// Standard rendering configurations for various markdown components.
var stdConfig={
  condenseLineBreaks:true,
  emptySpace:'',
  horizontalRuleBegin:'',
  horizontalRuleEnd:'',
  sectionHeaderStart:'\n',
  sectionHeaderEnd:'\n\n',
  headerMarkerSymbol:'#',
  codeBlockStart:'\n',
  codeBlockEnd:'\n\n',
  codeBlockPadding:'    ',
  quoteBlockStart:'\n',
  quoteBlockEnd:'\n\n',
  quoteBlockStyle:'blockquote',
  quoteBlockPadding:'  > ',
  quotePaddingStyle:'syntax',
  unorderedListStart:'\n',
  unorderedListEnd:'\n',
  listItemPrefix:'',
  listItemSuffix:'\n',
  listItemStyle:'ul',
  listItemPadding:'  * ',
  listItemPaddingStyle:'syntax',
  paragraphBegin:'',
  paragraphEnd:'\n'
};

// Global state variables for the markdown processing pipeline.
var mdUnits; // Stores the array of parsed markdown tokens.
var inlineProcessor; // Handles the processing of inline markdown elements.
var currentUnit; // The markdown token currently being processed.
var nestLevel=0; // Tracks the current nesting depth of block elements.

/**
 * Converts inline markdown syntax within a string to styled output.
 * @param {string} sourceText The input string containing inline markdown.
 * @param {object} configSettings Rendering options.
 * @returns {string} The string with inline markdown rendered.
 */
function handleInlineElements(sourceText, configSettings) {
  var renderedOutput='';
  var matchResult;

  // Inner helper to construct a styled link.
  function renderLink(linkTitle, linkUrl) {
    renderedOutput+='['+paint(linkTitle, 'strong')+']('+paint(linkUrl, 'link')+')';
  }

  // Iterate while there is text to parse.
  while (sourceText) {
    // Escape sequences.
    if (matchResult=inlineProcessor.rules.escape.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=matchResult[1];
      continue;
    }

    // Inline code.
    if (matchResult=inlineProcessor.rules.code.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=paint(matchResult[2], 'code');
      continue;
    }

    // Auto-detected links.
    if (matchResult=inlineProcessor.rules.autolink.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=paint(matchResult[0], 'link');
      continue;
    }

    // GFM-style URLs.
    if (matchResult=inlineProcessor.rules.url.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderLink(matchResult[1], matchResult[1]);
      continue;
    }

    // HTML tags.
    if (matchResult=inlineProcessor.rules.tag.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=matchResult[0];
      continue;
    }

    // Standard markdown links.
    if (matchResult=inlineProcessor.rules.link.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderLink(matchResult[1], matchResult[2]);
      continue;
    }

    // Reference links or non-links.
    if ((matchResult=inlineProcessor.rules.reflink.exec(sourceText))
      || (matchResult=inlineProcessor.rules.nolink.exec(sourceText))) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=matchResult[0];
      continue;
    }

    // Strong emphasis.
    if (matchResult=inlineProcessor.rules.strong.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=paint(handleInlineElements(matchResult[2]||matchResult[1]), 'strong');
      continue;
    }

    // Emphasis (italics).
    if (matchResult=inlineProcessor.rules.em.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=paint(handleInlineElements(matchResult[2]||matchResult[1]), 'em');
      continue;
    }

    // Line breaks.
    if (matchResult=inlineProcessor.rules.br.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+='\n';
      continue;
    }

    // GFM-style strikethrough.
    if (matchResult=inlineProcessor.rules.del.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=paint(handleInlineElements(matchResult[1]), 'del');
      continue;
    }

    // Plain text.
    if (matchResult=inlineProcessor.rules.text.exec(sourceText)) {
      sourceText=sourceText.substring(matchResult[0].length);
      renderedOutput+=matchResult[0];
      continue;
    }

    // Error if content remains unparsed.
    if (sourceText) {
      throw new Error('Infinite loop detected on byte: ' + sourceText.charCodeAt(0));
    }
  }

  return renderedOutput;
}

/**
 * Processes a single markdown token (unit) and generates its formatted output.
 * @param {object} renderOpts The rendering configuration options.
 * @returns {string} The styled output for the current markdown unit.
 */
function processMdUnit(renderOpts) {
  var unitType=currentUnit.type;
  var unitContent=currentUnit.text;
  var elementContent;

  switch (unitType) {
    case 'space': {
      return renderOpts.emptySpace;
    }
    case 'hr': {
      var dividerString=new Array(80).join('-')+'\n';
      return renderOpts.horizontalRuleBegin+paint(dividerString, unitType)+renderOpts.horizontalRuleEnd;
    }
    case 'heading': {
      var styleIndicator=paint(
        Array(currentUnit.depth+1).join(renderOpts.headerMarkerSymbol),
        'syntax'
      );
      unitContent=handleInlineElements(unitContent);
      elementContent=paint(unitContent, unitType);

      return renderOpts.sectionHeaderStart+styleIndicator+' '+elementContent+renderOpts.sectionHeaderEnd;
    }
    case 'code': {
      elementContent='';

      try {
        elementContent=syntaxColorizer.highlight(unitContent);
      } catch (errorObj) {
        elementContent=paint(unitContent, unitType);
      }

      elementContent=formatBlockContent(elementContent, {
        pad_str:renderOpts.codeBlockPadding
      });

      return renderOpts.codeBlockStart+elementContent+renderOpts.codeBlockEnd;
    }
    case 'table': {
      // TODO: Implement table rendering logic.
    }
    case 'blockquote_start': {
      elementContent='';
      nestLevel++;

      while (fetchNextUnit().type!=='blockquote_end') {
        elementContent+=processMdUnit(renderOpts);
      }
      elementContent=formatBlockContent(elementContent, {
        block_color:renderOpts.quoteBlockStyle,
        pad_str:renderOpts.quoteBlockPadding,
        pad_color:renderOpts.quotePaddingStyle
      });

      nestLevel--;
      return renderOpts.quoteBlockStart+elementContent+renderOpts.quoteBlockEnd;
    }
    case 'list_start': {
      elementContent='';

      while (fetchNextUnit().type!=='list_end') {
        elementContent+=processMdUnit(renderOpts);
      }

      return renderOpts.unorderedListStart+elementContent+renderOpts.unorderedListEnd;
    }
    case 'list_item_start': {
      elementContent='';

      // The original code had a potential issue here: `if (type === 'text')` would refer to
      // the `unitType` of the `list_item_start` token, not the nested tokens.
      // To maintain exact structural fidelity, this behavior is preserved.
      while (fetchNextUnit().type!=='list_item_end') {
        if (unitType==='text') {
          elementContent+=unitContent;
        } else {
          elementContent+=processMdUnit(renderOpts);
        }
      }
      elementContent=formatBlockContent(elementContent, {
        block_color:renderOpts.listItemStyle,
        pad_str:renderOpts.listItemPadding,
        pad_color:renderOpts.listItemPaddingStyle
      });
      return renderOpts.listItemPrefix+elementContent+renderOpts.listItemSuffix;
    }
    case 'paragraph': {
      if (nestLevel>0) {
        return unitContent;
      }
      unitContent=handleInlineElements(unitContent);
      return renderOpts.paragraphBegin+paint(unitContent, unitType)+renderOpts.paragraphEnd;
    }
    default: {
      if (unitContent) {
        return unitContent;
      }
    }
  }
}

/**
 * Advances to the next markdown token in the global array.
 * @returns {object} The next markdown token.
 */
function fetchNextUnit() {
  return currentUnit=mdUnits.shift();
}

/**
 * Applies padding and optional color styling to a block of text.
 * @param {string} contentChunk The text content to format.
 * @param {object} formatOpts Formatting options including padding string and colors.
 * @returns {string} The formatted text block.
 */
function formatBlockContent(contentChunk, formatOpts) {
  formatOpts=formatOpts||{};

  var textLines=contentChunk.split('\n');
  var paddingString=formatOpts.pad_str||'';
  var paddingColor=formatOpts.pad_color||formatOpts.block_color;
  var formattedLines=[];

  if (paddingColor) {
    paddingString=paint(paddingString, paddingColor);
  }

  textLines.forEach(function(singleLine) {
    if (formatOpts.block_color) {
      singleLine=paint(singleLine, formatOpts.block_color);
    }
    formattedLines.push(paddingString+singleLine);
  });

  return formattedLines.join('\n');
}

/**
 * The primary function to parse markdown text and render it to console-friendly output.
 * @param {string} rawText The raw markdown string.
 * @param {object} userOptions Custom options to override default rendering settings.
 * @returns {string} The final rendered output.
 */
exports.renderText=function(rawText, userOptions) {
  mdUnits=mdParser.lexer(rawText);
  inlineProcessor=new mdParser.InlineLexer(mdUnits.links);
  userOptions=objMerge(stdConfig, userOptions);

  var renderedParts=[];
  var finalOutput;

  while (fetchNextUnit()) {
    renderedParts.push(processMdUnit(userOptions));
  }

  if (userOptions.condenseLineBreaks) {
    finalOutput=renderedParts.join('').replace(/\n\n\n/g, '\n\n');
  } else {
    finalOutput=renderedParts.join('');
  }

  mdUnits=null;
  currentUnit=null;

  return finalOutput;
}

/**
 * Reads a markdown file, parses its content, and renders it to console output.
 * @param {string} inputFilePath The path to the markdown file.
 * @param {object} userOptions Custom options for rendering.
 * @returns {string} The rendered content of the file.
 */
exports.renderFile=function(inputFilePath, userOptions) {
  var absPath=fileLoc.resolve(__dirname, inputFilePath);
  var finalResult='';

  try {
    var fileContent=fileSys.readFileSync(absPath).toString();
    finalResult=exports.renderText(fileContent, userOptions);
  } catch (errorObj) {
    throw errorObj;
  }

  return finalResult;
}