let fileSystemModule = require('fs');
let pathUtilities = require('path');
let markdownParser = require('marked');
let codeHighlighter = require('cardinal');
let objectAssigner = require('xtend'); // Keeping this one as `Object.assign` might be too simple a replacement
let styleFormatter = require('./color');

const renderDefaults = {
  collapseNewlines: true,
  interBlockSpace: '',
  horizontalRuleStart: '',
  horizontalRuleEnd: '',
  headingPrefix: '\n',
  headingSuffix: '\n\n',
  headingMarkerChar: '#',
  codeBlockStart: '\n',
  codeBlockEnd: '\n\n',
  codeBlockPadding: '    ',
  quoteBlockStart: '\n',
  quoteBlockEnd: '\n\n',
  quoteBlockColor: 'blockquote',
  quoteBlockPad: '  > ',
  quoteBlockPadColor: 'syntax',
  listContainerStart: '\n',
  listContainerEnd: '\n',
  listItemEntryStart: '',
  listItemEntryEnd: '\n',
  listItemEntryColor: 'ul',
  listItemEntryPad: '  * ',
  listItemEntryPadColor: 'syntax',
  paragraphBlockStart: '',
  paragraphBlockEnd: '\n'
};

let parsedBlocks;
let inlineProcessor;
let currentBlock;
let nestingLevel = 0;

function parseInlineContent(sourceText) {
  let outputBuffer = '';
  let capture;

  const appendStyledLink = (title, url) => {
    outputBuffer += '[' + styleFormatter(title, 'strong') + '](' + styleFormatter(url, 'link') + ')';
  };

  const advanceSource = (length) => {
    sourceText = sourceText.substring(length);
  };

  while (sourceText) {
    // Check for various inline elements
    if ((capture = inlineProcessor.rules.escape.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += capture[1];
    } else if ((capture = inlineProcessor.rules.code.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += styleFormatter(capture[2], 'code');
    } else if ((capture = inlineProcessor.rules.autolink.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += styleFormatter(capture[0], 'link');
    } else if ((capture = inlineProcessor.rules.url.exec(sourceText))) { // URL (GFM)
      advanceSource(capture[0].length);
      appendStyledLink(capture[1], capture[1]);
    } else if ((capture = inlineProcessor.rules.tag.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += capture[0];
    } else if ((capture = inlineProcessor.rules.link.exec(sourceText))) {
      advanceSource(capture[0].length);
      appendStyledLink(capture[1], capture[2]);
    } else if ((capture = inlineProcessor.rules.reflink.exec(sourceText)) || (capture = inlineProcessor.rules.nolink.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += capture[0];
    } else if ((capture = inlineProcessor.rules.strong.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += styleFormatter(parseInlineContent(capture[2] || capture[1]), 'strong');
    } else if ((capture = inlineProcessor.rules.em.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += styleFormatter(parseInlineContent(capture[2] || capture[1]), 'em');
    } else if ((capture = inlineProcessor.rules.br.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += '\n';
    } else if ((capture = inlineProcessor.rules.del.exec(sourceText))) { // Delete (GFM)
      advanceSource(capture[0].length);
      outputBuffer += styleFormatter(parseInlineContent(capture[1]), 'del');
    } else if ((capture = inlineProcessor.rules.text.exec(sourceText))) {
      advanceSource(capture[0].length);
      outputBuffer += capture[0];
    } else {
      // Fallback for unhandled content, if any remaining.
      // Original had an error throw, we'll just append and break for resilience.
      if (sourceText.length > 0) {
        outputBuffer += sourceText;
      }
      break;
    }
  }

  return outputBuffer;
}

function handleContentBlock(renderSettings) {
  const blockType = currentBlock.type;
  let blockText = currentBlock.text;
  let blockContent;

  switch (blockType) {
    case 'space':
      return renderSettings.interBlockSpace;

    case 'hr':
      const hrLine = '-'.repeat(80) + '\n';
      return renderSettings.horizontalRuleStart + styleFormatter(hrLine, blockType) + renderSettings.horizontalRuleEnd;

    case 'heading':
      const headingMarker = styleFormatter(
        renderSettings.headingMarkerChar.repeat(currentBlock.depth),
        'syntax'
      );
      blockText = parseInlineContent(blockText);
      blockContent = styleFormatter(blockText, blockType);

      return renderSettings.headingPrefix + headingMarker + ' ' + blockContent + renderSettings.headingSuffix;

    case 'code':
      blockContent = '';
      try {
        blockContent = codeHighlighter.highlight(blockText);
      } catch (e) {
        // Fallback to plain color if highlighting fails
        blockContent = styleFormatter(blockText, blockType);
      }

      blockContent = applyBlockStyling(blockContent, {
        paddingString: renderSettings.codeBlockPadding
      });

      return renderSettings.codeBlockStart + blockContent + renderSettings.codeBlockEnd;

    case 'table':
      // Table rendering is complex and not fully implemented in original, returning empty.
      return '';

    case 'blockquote_start':
      blockContent = '';
      nestingLevel++;

      while (advanceBlock().type !== 'blockquote_end') {
        blockContent += handleContentBlock(renderSettings);
      }
      blockContent = applyBlockStyling(blockContent, {
        blockColor: renderSettings.quoteBlockColor,
        paddingString: renderSettings.quoteBlockPad,
        paddingColor: renderSettings.quoteBlockPadColor
      });

      nestingLevel--;
      return renderSettings.quoteBlockStart + blockContent + renderSettings.quoteBlockEnd;

    case 'list_start':
      blockContent = '';

      while (advanceBlock().type !== 'list_end') {
        blockContent += handleContentBlock(renderSettings);
      }

      return renderSettings.listContainerStart + blockContent + renderSettings.listContainerEnd;

    case 'list_item_start':
      blockContent = '';

      while (advanceBlock().type !== 'list_item_end') {
        if (currentBlock.type === 'text') {
          blockContent += currentBlock.text;
        } else {
          blockContent += handleContentBlock(renderSettings);
        }
      }
      blockContent = applyBlockStyling(blockContent, {
        blockColor: renderSettings.listItemEntryColor,
        paddingString: renderSettings.listItemEntryPad,
        paddingColor: renderSettings.listItemEntryPadColor
      });
      return renderSettings.listItemEntryStart + blockContent + renderSettings.listItemEntryEnd;

    case 'paragraph':
      // Paragraphs within other blocks are treated differently
      if (nestingLevel > 0) {
        return blockText;
      }
      blockText = parseInlineContent(blockText);
      return renderSettings.paragraphBlockStart + styleFormatter(blockText, blockType) + renderSettings.paragraphBlockEnd;

    default:
      // If no specific handling, return the raw text if available
      return blockText || '';
  }
}

function advanceBlock() {
  return currentBlock = parsedBlocks.shift();
}

function applyBlockStyling(sourceContent, options = {}) {
  if (!sourceContent) {
    return '';
  }

  const lines = sourceContent.split('\n');
  let paddingString = options.paddingString || '';
  const paddingColor = options.paddingColor || options.blockColor;

  if (paddingColor) {
    paddingString = styleFormatter(paddingString, paddingColor);
  }

  const styledLines = lines.map(line => {
    let processedLine = line;
    if (options.blockColor) {
      processedLine = styleFormatter(processedLine, options.blockColor);
    }
    return paddingString + processedLine;
  });

  return styledLines.join('\n');
}

exports.renderMarkdownContent = function(inputMarkdown, customOptions) {
  if (!inputMarkdown || typeof inputMarkdown !== 'string') {
    return ''; // Handle empty or invalid input gracefully
  }

  parsedBlocks = markdownParser.lexer(inputMarkdown);
  inlineProcessor = new markdownParser.InlineLexer(parsedBlocks.links);
  const effectiveOptions = objectAssigner(renderDefaults, customOptions);

  const outputFragments = [];
  let finalOutput = '';

  while (advanceBlock()) {
    outputFragments.push(handleContentBlock(effectiveOptions));
  }

  // Combine all fragments
  finalOutput = outputFragments.join('');

  // Apply newline collapse if enabled
  if (effectiveOptions.collapseNewlines) {
    finalOutput = finalOutput.replace(/\n\n\n/g, '\n\n');
  }

  // Clear global state after processing
  parsedBlocks = null;
  currentBlock = null;
  inlineProcessor = null; // Also clear the inline lexer

  return finalOutput;
};

exports.renderMarkdownFile = function(filePath, customOptions) {
  let resolvedPath;
  try {
    // Ensure the path is absolute and canonical
    resolvedPath = pathUtilities.resolve(process.cwd(), filePath);
  } catch (pathError) {
    // Log and rethrow for path resolution issues
    console.error(`Error resolving file path: ${filePath}`, pathError.message);
    throw pathError;
  }

  let fileContent = '';
  try {
    fileContent = fileSystemModule.readFileSync(resolvedPath, {
      encoding: 'utf8'
    });
  } catch (readError) {
    // Provide a more descriptive error for file reading failures
    console.error(`Failed to read file at ${resolvedPath}: ${readError.message}`);
    throw new Error(`File access error: ${readError.message}`);
  }

  return exports.renderMarkdownContent(fileContent, customOptions);
};