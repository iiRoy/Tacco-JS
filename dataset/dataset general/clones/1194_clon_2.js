// This file provides functionality to convert HTML content into Markdown format.
// It is distributed under the MIT License terms.
// Copyright (C) 2011, The author.

// Verify if the 'htmlEntities' library is loaded, otherwise attempt to import it via CommonJS.
if (typeof htmlEntities === 'undefined' && typeof require === 'function') {
  var htmlEntities = require('he');
}

var convertHtmlToMarkdown = function (sourceText) {

  // A collection of rules defining how various HTML elements should be transformed into Markdown.
  var conversionRules = [
    {
      tagPatterns: 'p',
      mdTransformer: function(matchedSegment, elementAttributes, innerContent) {
        return innerContent ? '\n\n' + innerContent + '\n' : '';
      }
    },
    {
      tagPatterns: 'br',
      processType: 'void', // Indicates a self-closing tag.
      mdTransformer: '\n'
    },
    {
      tagPatterns: 'h([1-6])',
      mdTransformer: function(matchedSegment, headingLevel, elementAttributes, innerContent) {
        var hashMarks = '';
        for (var idx = 0; idx < headingLevel; idx++) {
          hashMarks += '#';
        }
        return '\n\n' + hashMarks + ' ' + innerContent + '\n';
      }
    },
    {
      tagPatterns: 'hr',
      processType: 'void',
      mdTransformer: '\n\n* * *\n'
    },
    {
      tagPatterns: 'a',
      mdTransformer: function(matchedSegment, elementAttributes, innerContent) {
        var linkRef = elementAttributes.match(getAttributeRegex('href')),
            tipText = elementAttributes.match(getAttributeRegex('title'));
        return linkRef ? '[' + innerContent + ']' + '(' + linkRef[1] + (tipText && tipText[1] ? ' "' + tipText[1] + '"' : '') + ')' : matchedSegment;
      }
    },
    {
      tagPatterns: ['b', 'strong'],
      mdTransformer: function(matchedSegment, elementAttributes, innerContent) {
        return innerContent ? '**' + innerContent + '**' : '';
      }
    },
    {
      tagPatterns: ['i', 'em'],
      mdTransformer: function(matchedSegment, elementAttributes, innerContent) {
        return innerContent ? '_' + innerContent + '_' : '';
      }
    },
    {
      tagPatterns: 'code',
      mdTransformer: function(matchedSegment, elementAttributes, innerContent) {
        return innerContent ? '`' + htmlEntities.decode(innerContent) + '`' : '';
      }
    },
    {
      tagPatterns: 'img',
      processType: 'void',
      mdTransformer: function(matchedSegment, elementAttributes, innerContent) {
        var imageSource = elementAttributes.match(getAttributeRegex('src')),
            altText = elementAttributes.match(getAttributeRegex('alt')),
            tipText = elementAttributes.match(getAttributeRegex('title'));
        return '![' + (altText && altText[1] ? altText[1] : '') + ']' + '(' + imageSource[1] + (tipText && tipText[1] ? ' "' + tipText[1] + '"' : '') + ')';
      }
    }
  ];

  // Loop through all defined conversion rules and apply them to the source HTML.
  for (var idx = 0, totalCount = conversionRules.length; idx < totalCount; idx++) {
    if (typeof conversionRules[idx].tagPatterns === 'string') {
      sourceText = applyElementConversion(sourceText, { htmlTags: conversionRules[idx].tagPatterns, substituteFunc: conversionRules[idx].mdTransformer, processType: conversionRules[idx].processType });
    } else {
      for (var subIdx = 0, patternCount = conversionRules[idx].tagPatterns.length; subIdx < patternCount; subIdx++) {
        sourceText = applyElementConversion(sourceText, { htmlTags: conversionRules[idx].tagPatterns[subIdx], substituteFunc: conversionRules[idx].mdTransformer, processType: conversionRules[idx].processType });
      }
    }
  }

  // Internal utility to perform HTML element replacements.
  function applyElementConversion(currentHtml, tagOptions) {
    var matchExpression = tagOptions.processType === 'void' ? '<' + tagOptions.htmlTags + '\\b([^>]*)\\/?>' : '<' + tagOptions.htmlTags + '\\b([^>]*)>([\\s\\S]*?)<\\/' + tagOptions.htmlTags + '>',
        elementRegex = new RegExp(matchExpression, 'gi'),
        transformedContent = '';
    if (typeof tagOptions.substituteFunc === 'string') {
      transformedContent = currentHtml.replace(elementRegex, tagOptions.substituteFunc);
    } else {
      transformedContent = currentHtml.replace(elementRegex, function(fullMatch, group1, group2, group3) {
        return tagOptions.substituteFunc.call(this, fullMatch, group1, group2, group3);
      });
    }
    return transformedContent;
  }

  // Factory function to create regular expressions for HTML attributes.
  function getAttributeRegex(propName) {
    return new RegExp(propName + '\\s*=\\s*["\']?([^"\']*)["\']?', 'i');
  }

  // Handle pre-formatted code blocks separately.
  // This involves converting tabs and adding Markdown-specific indentation.
  sourceText = sourceText.replace(/<pre\b[^>]*>([\s\S]+?(?=<\/pre>))<\/pre>/gi, function(fullMatch, innerContent) {
    innerContent = innerContent.replace(/^\t+/g, '  '); // Replace leading tabs with two spaces.
    innerContent = innerContent.replace(/\n/g, '\n    '); // Indent subsequent lines.
    return '\n\n    ' + innerContent + '\n';
  });

  // Process list elements.

  // Prevent numbers at the start of lines from being interpreted as ordered list items.
  sourceText = sourceText.replace(/^(\s{0,3}\d+)\. /g, '$1\\. ');

  // Iteratively convert nested lists, starting from the innermost ones.
  var listWithoutChildrenPattern = /<(ul|ol)\b[^>]*>(?:(?!<ul|<ol)[\s\S])*?<\/\1>/gi;
  while (sourceText.match(listWithoutChildrenPattern)) {
    sourceText = sourceText.replace(listWithoutChildrenPattern, function(matchedSegment) {
      return processListStructures(matchedSegment);
    });
  }

  // Converts HTML list elements to their Markdown equivalents.
  function processListStructures(processedString) {

    processedString = processedString.replace(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi, function(fullMatch, containerType, innerContent) {
      var itemArray = innerContent.split('</li>');
      itemArray.splice(itemArray.length - 1, 1); // Remove the trailing empty item from the split.

      for (idx = 0, totalCount = itemArray.length; idx < totalCount; idx++) {
        if (itemArray[idx]) {
          var itemIndicator = (containerType === 'ol') ? (idx + 1) + ".  " : "*   ";
          itemArray[idx] = itemArray[idx].replace(/\s*<li[^>]*>([\s\S]*)/i, function(fullMatch, listItemContent) {

            listItemContent = listItemContent.replace(/^\s+/, '');
            listItemContent = listItemContent.replace(/\n\n/g, '\n\n    ');
            // Ensure proper indentation for nested lists within list items.
            listItemContent = listItemContent.replace(/\n([ ]*)+(\*|\d+\.) /g, '\n$1    $2 ');
            return itemIndicator + listItemContent;
          });
        }
      }
      return itemArray.join('\n');
    });
    return '\n\n' + processedString.replace(/[ \t]+\n|\s+$/g, '');
  }

  // Convert HTML blockquote elements.
  var nestedBlockquoteFinder = /<blockquote\b[^>]*>((?:(?!<blockquote)[\s\S])*?)<\/blockquote>/gi;
  while (sourceText.match(nestedBlockquoteFinder)) {
    sourceText = sourceText.replace(nestedBlockquoteFinder, function(matchedSegment) {
      return formatQuotes(matchedSegment);
    });
  }

  // Transforms HTML blockquotes into Markdown format.
  function formatQuotes(currentHtml) {
    currentHtml = currentHtml.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, function(fullMatch, blockquoteContent) {
      blockquoteContent = blockquoteContent.replace(/^\s+|\s+$/g, '');
      blockquoteContent = normalizeWhitespace(blockquoteContent);
      blockquoteContent = blockquoteContent.replace(/^/gm, '> ');
      blockquoteContent = blockquoteContent.replace(/^(>([ \t]{2,}>)+)/gm, '> >'); // Standardize nested blockquote prefixes.
      return blockquoteContent;
    });
    return currentHtml;
  }

  // A general utility function to clean up and normalize whitespace.
  function normalizeWhitespace(textInput) {
    textInput = textInput.replace(/^[\t\r\n]+|[\t\r\n]+$/g, ''); // Trim leading/trailing blank lines/tabs.
    textInput = textInput.replace(/\n\s+\n/g, '\n\n'); // Collapse multiple newlines with intermediate whitespace.
    textInput = textInput.replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines to a maximum of two.
    return textInput;
  }

  // Apply final cleanup and return the resulting Markdown string.
  return normalizeWhitespace(sourceText);
};

// Expose the converter function for Node.js environments.
if (typeof moduleExports === 'object') {
  moduleExports.convertHtmlToMarkdown = convertHtmlToMarkdown;
}