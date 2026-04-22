// A simple HTML entity decoder for common characters used in code blocks.
function basicHtmlEntityDecoder(encodedText) {
  return encodedText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// Helper to extract HTML attributes from a tag string into an object.
function attributeExtractor(attributeString) {
  const attributeMap = {};
  const attributeRegex = /(\S+)(?:\s*=\s*(?:["']([^"']*)["']|(\S+)))?/g;
  let currentMatch;
  while ((currentMatch = attributeRegex.exec(attributeString)) !== null) {
    const key = currentMatch[1];
    const value = currentMatch[2] || currentMatch[3] || '';
    attributeMap[key.toLowerCase()] = value;
  }
  return attributeMap;
}

// Set of HTML elements that are self-closing (void elements).
const voidElements = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// Parses an HTML string into a tree-like structure of nodes.
function htmlToNodeTree(htmlSource) {
  const rootNode = { nodeType: 'documentRoot', children: [] };
  const nodeStack = [rootNode];
  
  // Regex to find HTML comments, tags (open/close/self-closing), or text segments.
  const segmentRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9]+)([^>]*)(\/?)>|([^<]+)/g;

  let currentMatch;
  while ((currentMatch = segmentRegex.exec(htmlSource)) !== null) {
    const fullSegment = currentMatch[0];
    const isComment = fullSegment.startsWith('<!--');
    const isClosingTag = !!currentMatch[1];
    const tagName = currentMatch[2] ? currentMatch[2].toLowerCase() : null;
    const attributesRaw = currentMatch[3] || '';
    const isSelfClosingTag = !!currentMatch[4];
    const textSegment = currentMatch[5];

    if (isComment) {
      // Ignore HTML comments.
      continue;
    }

    if (textSegment) {
      // Handle text nodes.
      const parent = nodeStack[nodeStack.length - 1];
      // Only add non-empty text nodes, or text within <pre> tags.
      if (textSegment.trim().length > 0 || (parent.nodeType === 'element' && parent.elementName === 'pre')) {
        parent.children.push({ nodeType: 'textNode', content: textSegment });
      }
    } else if (tagName) {
      // Handle HTML tags.
      const parent = nodeStack[nodeStack.length - 1];

      if (tagName === 'pre') {
        // Special handling for <pre>: capture all content until </pre> as a single text node.
        const preContentRegex = /<pre\b[^>]*>([\s\S]*?)<\/pre>/gi;
        preContentRegex.lastIndex = segmentRegex.lastIndex - fullSegment.length; // Adjust regex start position.
        const preMatch = preContentRegex.exec(htmlSource);
        if (preMatch) {
          const preElement = {
            nodeType: 'element',
            elementName: 'pre',
            attributes: attributeExtractor(attributesRaw),
            children: [{ nodeType: 'textNode', content: preMatch[1], isPreformatted: true }]
          };
          parent.children.push(preElement);
          segmentRegex.lastIndex = preMatch.index + preMatch[0].length; // Advance main regex past </pre>.
          continue; 
        }
      }

      if (isClosingTag) {
        // Pop nodes from stack until matching opening tag is found.
        let foundMatch = false;
        while (nodeStack.length > 1) { // Don't pop the documentRoot.
          const poppedElement = nodeStack.pop();
          if (poppedElement.elementName === tagName) {
            foundMatch = true;
            break;
          }
        }
        // If no matching opening tag, it's an unclosed tag or malformed HTML; ignore.
      } else {
        // Opening tag.
        const newElement = {
          nodeType: 'element',
          elementName: tagName,
          attributes: attributeExtractor(attributesRaw),
          children: []
        };
        parent.children.push(newElement);

        if (!voidElements.has(tagName) && !isSelfClosingTag) {
          nodeStack.push(newElement);
        }
      }
    }
  }
  return rootNode;
}

// Map of HTML tag names to their Markdown conversion functions.
const conversionDirectiveSet = {
  'p': (node, innerMarkdown) => innerMarkdown ? `\n\n${innerMarkdown}\n` : '',
  'br': (node, innerMarkdown) => '\n',
  'h1': (node, innerMarkdown) => `\n\n# ${innerMarkdown}\n`,
  'h2': (node, innerMarkdown) => `\n\n## ${innerMarkdown}\n`,
  'h3': (node, innerMarkdown) => `\n\n### ${innerMarkdown}\n`,
  'h4': (node, innerMarkdown) => `\n\n#### ${innerMarkdown}\n`,
  'h5': (node, innerMarkdown) => `\n\n##### ${innerMarkdown}\n`,
  'h6': (node, innerMarkdown) => `\n\n###### ${innerMarkdown}\n`,
  'hr': (node, innerMarkdown) => '\n\n* * *\n',
  'a': (node, innerMarkdown) => {
    const linkHref = node.attributes.href;
    const linkTitle = node.attributes.title;
    return linkHref ? `[${innerMarkdown}](${linkHref}${linkTitle ? ` "${linkTitle}"` : ''})` : innerMarkdown;
  },
  'b': (node, innerMarkdown) => innerMarkdown ? `**${innerMarkdown}**` : '',
  'strong': (node, innerMarkdown) => innerMarkdown ? `**${innerMarkdown}**` : '',
  'i': (node, innerMarkdown) => innerMarkdown ? `_${innerMarkdown}_` : '',
  'em': (node, innerMarkdown) => innerMarkdown ? `_${innerMarkdown}_` : '',
  'code': (node, innerMarkdown) => innerMarkdown ? `\`${basicHtmlEntityDecoder(innerMarkdown)}\`` : '',
  'img': (node, innerMarkdown) => {
    const imageSrc = node.attributes.src;
    const imageAlt = node.attributes.alt || '';
    const imageTitle = node.attributes.title;
    return `![${imageAlt}](${imageSrc}${imageTitle ? ` "${imageTitle}"` : ''})`;
  },
  'pre': (node, innerMarkdown) => {
    // The innerMarkdown for pre is the raw content from the parser.
    let content = node.children[0] ? node.children[0].content : '';
    content = content.replace(/\t/g, '  '); // Convert tabs to spaces.
    content = content.replace(/\n/g, '\n    '); // Indent each line.
    return `\n\n    ${content}\n`;
  },
  'ul': (node, innerMarkdown, currentIndent = '') => {
    const listItems = node.children.filter(c => c.elementName === 'li');
    let markdownListContent = '';
    listItems.forEach((liNode) => {
      // Pass increased indent to the list item's children for proper nesting.
      const liInnerMd = convertNodeToMarkdown(liNode, currentIndent + '    '); 
      const itemPrefix = `${currentIndent}*   `;
      // Indent all newlines within the list item's content, but not the very last one.
      markdownListContent += itemPrefix + liInnerMd.replace(/\n(?!$)/g, `\n${currentIndent}    `) + '\n';
    });
    // Trim any trailing whitespace/newlines from the entire list block.
    return `\n\n${markdownListContent.replace(/\s+$/g, '')}`;
  },
  'ol': (node, innerMarkdown, currentIndent = '') => {
    const listItems = node.children.filter(c => c.elementName === 'li');
    let markdownListContent = '';
    listItems.forEach((liNode, index) => {
      const liInnerMd = convertNodeToMarkdown(liNode, currentIndent + '    ');
      const itemPrefix = `${currentIndent}${index + 1}.  `;
      markdownListContent += itemPrefix + liInnerMd.replace(/\n(?!$)/g, `\n${currentIndent}    `) + '\n';
    });
    return `\n\n${markdownListContent.replace(/\s+$/g, '')}`;
  },
  'li': (node, innerMarkdown, currentIndent = '') => {
    let processedLiContent = innerMarkdown.replace(/^\s+/, ''); // Trim leading whitespace.
    // Indent block-level newlines within the list item (e.g., for paragraphs inside an li).
    processedLiContent = processedLiContent.replace(/\n\n/g, `\n\n${currentIndent}`);
    return processedLiContent;
  },
  'blockquote': (node, innerMarkdown) => {
    let processedQuote = innerMarkdown.replace(/^\s+|\s+$/g, ''); // Trim leading/trailing whitespace.
    // Apply cleanUp-like logic specifically for blockquote content to normalize newlines.
    processedQuote = processedQuote.replace(/\n\s+\n/g, '\n\n'); // Reduce lines with only whitespace.
    processedQuote = processedQuote.replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines.
    processedQuote = processedQuote.replace(/^/gm, '> '); // Add blockquote prefix to each line.
    // Normalize nested blockquote prefixes (e.g., `> > >` becomes `> >`).
    processedQuote = processedQuote.replace(/^(>([ \t]{2,}>)+)/gm, '> >');
    return `\n\n${processedQuote}\n`;
  }
};

// Recursively converts a node and its children into Markdown.
function convertNodeToMarkdown(node, currentIndent = '') {
  if (node.nodeType === 'textNode') {
    return node.content;
  }

  if (node.nodeType === 'documentRoot') {
    return node.children.map(child => convertNodeToMarkdown(child)).join('');
  }

  // If no specific handler for the element, just process its children.
  if (!conversionDirectiveSet[node.elementName]) {
    return node.children.map(child => convertNodeToMarkdown(child, currentIndent)).join('');
  }

  // Get the Markdown for the children.
  const innerMarkdownContent = node.children
    .map(child => convertNodeToMarkdown(child, currentIndent))
    .join('');

  // Call the specific handler for the element.
  return conversionDirectiveSet[node.elementName](node, innerMarkdownContent, currentIndent);
}

// Performs final cleanup and normalization on the generated Markdown.
function finalizeOutput(markdownText) {
  let finalResult = markdownText;

  // Trim leading/trailing whitespace from the entire output.
  finalResult = finalResult.replace(/^[\t\r\n]+|[\t\r\n]+$/g, '');

  // Reduce multiple newlines to at most two.
  finalResult = finalResult.replace(/\n\s*\n/g, '\n\n');
  finalResult = finalResult.replace(/\n{3,}/g, '\n\n');

  // Escape numbers that might be interpreted as ordered list items.
  finalResult = finalResult.replace(/^(\s{0,3}\d+)\. /gm, '$1\\. ');

  return finalResult;
}

// Main function to transform HTML to Markdown.
const convertHtmlToMark = function(htmlSource) {
  const parsedTree = htmlToNodeTree(htmlSource);
  let resultantMarkdown = convertNodeToMarkdown(parsedTree);
  return finalizeOutput(resultantMarkdown);
};

// Export for Node.js environments.
if (typeof exports === 'object') {
  exports.convertHtmlToMark = convertHtmlToMark;
}