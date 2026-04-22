SyntaxHighlighter.lexicons.htmlSyntax = {
	// A standard HTML/XML comment block, allowing all characters within.
	commentBlock: /&lt;!--[\w\W]*?-->/g,
	// Processing instruction, usually for XML.
	processingInstr: /&lt;\?.+?\?>/,
	// Document Type Declaration.
	docTypeDecl: /&lt;!DOCTYPE.+?>/,
	// CDATA section, useful for escaping content.
	cdataSection: /&lt;!\[CDATA\[[\w\W]*?]]>/i,
	// Main pattern for HTML/XML tags, including attributes.
	tagStructure: {
		pattern: /&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
		inside: {
			// The tag name itself (e.g., `<div>`, `<span>`).
			elementName: {
				pattern: /^&lt;\/?[\w:-]+/i,
				inside: {
					// Delimiters for the tag name.
					tagDelimiters: /^&lt;\/?/,
					// XML/HTML namespace prefix.
					nameSpacePrefix: /^[\w-]+?:/
				}
			},
			// Attribute values (e.g., `value="hello"`).
			attributeValue: {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
				inside: {
					// Punctuation within attribute values.
					valuePunctuation: /=|>|"/g
				}
			},
			// Closing tag punctuation.
			closingPunctuation: /\/?>/g,
			// Attribute names (e.g., `class`, `id`).
			attributeName: {
				pattern: /[\w:-]+/g,
				inside: {
					// Namespace for attributes.
					attrNameSpace: /^[\w-]+?:/
				}
			}
		}
	},
	// HTML entities like `&amp;` or `&#123;`.
	htmlEntity: /&amp;#?[\da-z]{1,8};/gi
};


SyntaxHighlighter.lexicons.texFormat = {
	// TeX commands (e.g., \section, \textbf).
	texCommand: /\\(?:[^a-zA-Z]|[a-zA-Z]+)/g,
	// Opening curly, square, or round brackets.
	openingDelimiter: /[[({]/g,
	// Closing curly, square, or round brackets.
	closingDelimiter: /[\])}]/g,
	// TeX comments start with '%' and extend to the end of the line.
	texComment: /%.*/g,
};


SyntaxHighlighter.lexicons.markdown = (function() {
	// Helper regex components for URL patterns
	var uriInnerChars = "[-A-Z0-9+&@#/%?=~_|[\\]()!:,.;]";
	var uriEndingChars = "[-A-Z0-9+&@#/%=~_|[\\])]";
	
	// Regular expression for detecting various URL schemes (http, https, ftp)
	var httpFtpUriRegex = new RegExp("(https?|ftp)(://" + uriInnerChars + "*" + uriEndingChars + ")(?=$|\\W)", "gi");
	// Regular expression for detecting email addresses
	var emailAddressRegex = /(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)/gi;

	// Reference to the LaTeX lexicon for embedding.
	var texLangRef = SyntaxHighlighter.lexicons.texFormat;
	
	// Newline character regex.
	var newlineCharacter = /\n/gm;

	// Main object to hold Markdown definitions.
	var markdownDefinitionSet = {};

	// Guard: Ensure texLangRef is available
	if (!texLangRef) {
		console.warn("Markdown lexicon requires LaTeX lexicon to be defined.");
		return markdownDefinitionSet; // Return empty set if dependency missing
	}

	// GitHub Flavored Markdown (GFM) fenced code blocks.
	markdownDefinitionSet.gfmFencedCode = {
		pattern: /^`{3}.*\n(?:[\s\S]*?)\n`{3} *$/gm,
		inside: {
			"mkdnCodeFence": /`{3}/,
			"lineBreak": newlineCharacter
		}
	};
	// Alternative H1 syntax (underline with equals signs).
	markdownDefinitionSet.altHeadingLevel1 = {
		pattern: /^(.+)[ \t]*\n=+[ \t]*$/gm,
		inside: {} // Content will be tokenized later
	};
	// Alternative H2 syntax (underline with hyphens).
	markdownDefinitionSet.altHeadingLevel2 = {
		pattern: /^(.+)[ \t]*\n-+[ \t]*$/gm,
		inside: {} // Content will be tokenized later
	};
	// Indented code blocks (4 spaces or a tab).
	markdownDefinitionSet.indentedCode = {
		pattern: /(^|(?:^|(?:^|\n)(?![ \t]*([*+\-]|\d+\.)[ \t]).*\n)\s*?\n)((?: {4}|\t).*(?:\n|$))+/g,
		lookbehind: true,
		inside: {
			"lineBreak": newlineCharacter
		}
	};

	// Helper for table regex components
	const tblStart = '[ ]{0,3}[|]';
	const tblHeader = '(.+)\\n';
	const tblSeparator = '[ ]{0,3}[|]([ ]*[-:]+[-| :]*)\\n';
	const tblBody = '(' + '(?:[ ]*[|].*\\n?)*' + ')';
	const tblEnd = '(?:\\n|$)';

	// Standard Markdown table with leading/trailing pipes.
	markdownDefinitionSet.standardTable = {
		pattern: new RegExp(
			[
				'^'                         ,
				tblStart                    ,
				tblHeader                   ,
				tblSeparator                ,
				tblBody                     ,
				tblEnd
			].join(''),
			'gm'
		),
		inside: {
			"lineBreak": newlineCharacter
		}
	};
	
	// Alternative table syntax (no leading pipe on header, but pipes in body).
	const altTblHeader = '(\\S.*[|].*)\\n';
	const altTblSeparator = '([-:]+[ ]*[|][-| :]*)\\n';
	const altTblBody = '(' + '(?:.*[|].*\\n?)*' + ')';

	markdownDefinitionSet.alternativeTable = {
		pattern: new RegExp(
			[
				'^'                         ,
				'[ ]{0,3}'                  ,
				altTblHeader                ,
				'[ ]{0,3}'                  ,
				altTblSeparator             ,
				altTblBody                  ,
				tblEnd
			].join(''),
			'gm'
		),
		inside: {
			"lineBreak": newlineCharacter
		}
	};

	// Horizontal rule (three or more asterisks, hyphens, or underscores).
	markdownDefinitionSet.horizontalRule = {
		pattern: /^([*\-_] *){3,}$/gm
	};
	// Block-level math (e.g., `$$...$$` or `\[...\]`).
	markdownDefinitionSet.mathBlock = {
		pattern: /(\$\$|\\\\\[|\\\\\\\\\()[\s\S]*?(\$\$|\\\\\]|\\\\\\\\\))/g,
		inside: {
			"mkdnMathBlockStart": /^(\$\$|\\\\\[|\\\\\\\\\()/,
			"mkdnMathBlockEnd": /(\$\$|\\\\\]|\\\\\\\\\))/,
			"lineBreak": newlineCharacter,
			"rest": texLangRef // Embed LaTeX highlighting
		}
	};
	// LaTeX `\begin{...}\end{...}` blocks.
	markdownDefinitionSet.latexBlock = {
		pattern: /\\?\\begin\{[a-z]*\*?\}[\s\S]*?\\?\\end\{[a-z]*\*?\}/g,
		inside: {
			"keyword": /\\?\\(begin|end)/,
			"lineBreak": newlineCharacter,
			"rest": texLangRef // Embed LaTeX highlighting
		}
	};
	// Generic line of text (could be part of a paragraph or other block).
	markdownDefinitionSet.plainLineText = {
		pattern: /^[ <>^*+#\t\\\/\[\]\(\)0-9\._-]*[A-Za-z\$][^\n]*$/gm,
	};
	
	// Loop for different heading levels (H1 to H6).
	for(var headerIdx = 6; headerIdx >= 1; headerIdx--) {
		markdownDefinitionSet["headingLevel" + headerIdx] = {
			pattern: new RegExp("^#{" + headerIdx + "}.+$", "gm"),
			inside: {
				"mkdnHashPrefix": new RegExp("^#{" + headerIdx + "}")
			}
		};
	}
	// Blockquote.
	markdownDefinitionSet.blockquote = {
		pattern: /^ {0,3}> *[^\n]+$/gm,
		inside: {
			"mkdnBlockQuoteMarker": /^ {0,3}> */,
			"listItem": markdownDefinitionSet.listItem // Blockquotes can contain list items.
		}
	};
	// List item.
	markdownDefinitionSet.listItem = {
		pattern: /^[ \t]*([*+\-]|\d+\.)[ \t].+(?:\n|[ \t].*\n)*/gm,
		inside: {
			"mkdnListItemMarker": /^[ \t]*([*+\-]|\d+\.)[ \t]/m,
			// Nested GFM fenced code blocks within list items.
			"gfmFencedCode": {
				pattern: /^((?: {4}|\t)+)`{3}.*\n(?:[\s\S]*?)\n\1`{3} *$/gm,
				inside: {
					"mkdnCodeFence": /`{3}/,
					"lineBreak": newlineCharacter
				}
			},
			"lineBreak": newlineCharacter
		}
	};
	// Footnote definition.
	markdownDefinitionSet.footnoteDefinition = {
		pattern: /^ {0,3}\[\^.*?\]:[ \t]+.*$/gm,
		inside: {
			"refIdentifier": {
				pattern: /\[\^.*?\]/,
				inside: {
					"mkdnBracketStart": /\[/,
					"mkdnBracketEnd": /\]/
				}
			}
		}
	};
	// Link definition.
	markdownDefinitionSet.linkDefinition = {
		pattern: /^ {0,3}\[.*?\]:[ \t]+.*$/gm,
		inside: {
			"linkIdentifier": {
				pattern: /\[.*?\]/,
				inside: {
					"mkdnBracketStart": /\[/,
					"mkdnBracketEnd": /\]/
				}
			},
			"url": httpFtpUriRegex,
			"linkTitle": /['\"\(][^\'\"\)]*['\"\)]/ // Optional link title in quotes/parens
		}
	};
	// Paragraph.
	markdownDefinitionSet.paragraph = {
		pattern: /.+/g,
		inside: {} // Content will be tokenized later
	};
	// Standalone line break (empty line).
	markdownDefinitionSet.lineBreak = /^\n$/gm;
	// Image embedding.
	markdownDefinitionSet.imageEmbed = {
		pattern: /!\[[^\]]*\]\([^\)]+\)/g,
		inside: {
			"mkdnExclamation": /^!/,
			"mkdnBracketStart": /\[/,
			"mkdnAltText": /[^\[]+(?=\])/,
			"mkdnBracketEnd": /\](?=\()/,
			"mkdnImageParentheses": {
				pattern: /\([^\)]+\)/,
				inside: {
					"mkdnParenStart": /^\(/,
					"mkdnTitle": /(['‘][^'’]*['’]|["“][^"”]*["”])(?=\)$)/,
					"mkdnSource": /[^\('" \t]+(?=[\)'" \t])/,
					"mkdnParenEnd": /\)$/
				}
			}
		}
	};
	// Hyperlink.
	markdownDefinitionSet.hyperlink = {
		pattern: /\[(?:(\\.)|[^\[\]])*\]\([^\(\)\s]+(\(\S*?\))??[^\(\)\s]*?(\s(['‘][^'’]*['’]|["“][^"”]*["”]))?\)/gm,
		inside: {
			"mkdnBracketStart": {
				pattern: /(^|[^\\])\[/,
				lookbehind: true
			},
			"mkdnUnderlinedText": {
				pattern: /(?:(\\.)|[^\[\]])+(?=\])/
			},
			"mkdnBracketEnd": /\]\s?\(/,
			"mkdnParenEnd": /\)$/,
			"mkdnHref": /.*/
		}
	};
	// Footnote reference.
	markdownDefinitionSet.footnoteReference = {
		pattern: /\[\^(.*?)\]/g,
		inside: {
			"refContainer": {
				pattern: /^\[[^\[\]]+\] ?/,
				inside: {
					"mkdnBracketStart": /\[/,
					"mkdnRefId": /^[^\[\]]+/,
					"mkdnBracketEnd": /\]/
				}
			}
		}
	};
	// Image reference.
	markdownDefinitionSet.imageReference = {
		pattern: /!\[(.*?)\] ?\[(.*?)\]/g,
		inside: {
			"mkdnExclamation": /^!/,
			"refEndMarker": {
				pattern: /\[[^\[\]]+\]$/,
				inside: {
					"mkdnBracketStart": /\[/,
					"mkdnHref": /[^\[\]]+(?=]$)/,
					"mkdnBracketEnd": /\]/
				}
			},
			"refStartMarker": {
				pattern: /^\[[^\[\]]+\] ?/,
				inside: {
					"mkdnBracketStart": /\[/,
					"mkdnAltText": /^[^\[\]]+/,
					"mkdnBracketEnd": /\]/
				}
			}
		}
	};
	// Link reference.
	markdownDefinitionSet.linkReference = {
		pattern: /\[(.*?)\] ?\[(.*?)\]/g,
		inside: {
			"refEndMarker": {
				pattern: /\[[^\[\]]+\]$/,
				inside: {
					"mkdnBracketStart": /\[/,
					"mkdnHref": /[^\[\]]+(?=]$)/,
					"mkdnBracketEnd": /\]/
				}
			},
			"refStartMarker": {
				pattern: /^\[[^\[\]]+\] ?/,
				inside: {
					"mkdnBracketStart": /\[/,
					"mkdnUnderlinedText": /^[^\[\]]+/,
					"mkdnBracketEnd": /\]/
				}
			}
		}
	};
	// Inline code (backticks).
	markdownDefinitionSet.inlineCode = {
		pattern: /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/g,
		lookbehind: true,
		inside: {
			"mkdnCodeBacktick": /`/
		}
	};
	// Inline math (single dollar signs).
	markdownDefinitionSet.inlineMath = {
		pattern: /\$.*?\$/g,
		inside: {
			"mkdnMathDelimiterStart": /^\$/,
			"mkdnMathDelimiterEnd": /\$$/,
			"rest": texLangRef // Embed LaTeX highlighting
		}
	};
	// Strong emphasis (bold).
	markdownDefinitionSet.boldText = {
		pattern: /([_\*])\1((?!\1{2}).)*\1{2}/g,
		inside: {
			"mkdnStrongDelimiter": /([_\*])\1/g
		}
	};
	// Emphasis (italic).
	markdownDefinitionSet.italicText = {
		pattern: /(^|[^\\])(\*|_)(\S[^\2]*?)??[^\s\\]+?\2/g,
		lookbehind: true,
		inside: {
			"mkdnEmphasisStart": /^(\*|_)/,
			"mkdnEmphasisEnd": /(\*|_)$/
		}
	};
	// Strikethrough.
	markdownDefinitionSet.strikeThrough = {
		pattern: /(^|\n|\W)(~~)(?=\S)([^\r]*?\S)\2/gm,
		lookbehind: true,
		inside: {
			"mkdnStrikeDelimiter": /(~~)/,
			"mkdnStrikeContent": /[^~]+/
		}
	};
	
	// Define a common set of inline tokens to be embedded in block-level elements.
	var commonInlineTokens = {
		"inlineCode": markdownDefinitionSet.inlineCode,
		"inlineMath": markdownDefinitionSet.inlineMath,
		"footnoteReference": markdownDefinitionSet.footnoteReference,
		"imageEmbed": markdownDefinitionSet.imageEmbed,
		"hyperlink": markdownDefinitionSet.hyperlink,
		"imageReference": markdownDefinitionSet.imageReference,
		"linkReference": markdownDefinitionSet.linkReference,
		"url": httpFtpUriRegex,
		"email": emailAddressRegex,
		"boldText": markdownDefinitionSet.boldText,
		"italicText": markdownDefinitionSet.italicText,
		"strikeThrough": markdownDefinitionSet.strikeThrough,
		"conflictMarker": /⧸⧸/g, // A rare conflict marker
		"htmlComment": SyntaxHighlighter.lexicons.htmlSyntax.commentBlock,
		"htmlTag": SyntaxHighlighter.lexicons.htmlSyntax.tagStructure,
		"htmlEntity": SyntaxHighlighter.lexicons.htmlSyntax.htmlEntity
	};

	// Recursively apply common inline tokens to block elements.
	for(var level = 6; level >= 1; level--) {
		markdownDefinitionSet["headingLevel" + level].inside.rest = commonInlineTokens;
	}
	markdownDefinitionSet.altHeadingLevel1.inside.rest = commonInlineTokens;
	markdownDefinitionSet.altHeadingLevel2.inside.rest = commonInlineTokens;
	markdownDefinitionSet.standardTable.inside.rest = commonInlineTokens;
	markdownDefinitionSet.alternativeTable.inside.rest = commonInlineTokens;
	markdownDefinitionSet.paragraph.inside.rest = commonInlineTokens;
	markdownDefinitionSet.blockquote.inside.rest = commonInlineTokens;
	markdownDefinitionSet.listItem.inside.rest = commonInlineTokens;
	markdownDefinitionSet.footnoteDefinition.inside.rest = commonInlineTokens;

	// Define a subset of inline tokens for nested emphasis/strong elements.
	var nestedInlineTokens = {
		"inlineCode": markdownDefinitionSet.inlineCode,
		"footnoteReference": markdownDefinitionSet.footnoteReference,
		"hyperlink": markdownDefinitionSet.hyperlink,
		"linkReference": markdownDefinitionSet.linkReference,
		"conflictMarker": /⧸⧸/g,
	};
	markdownDefinitionSet.boldText.inside.rest = nestedInlineTokens;
	markdownDefinitionSet.italicText.inside.rest = nestedInlineTokens;
	markdownDefinitionSet.strikeThrough.inside.rest = nestedInlineTokens;

	// Define tokens that can appear inside link text.
	var linkTextInnerContent = {
		"inlineCode": markdownDefinitionSet.inlineCode,
		"boldText": markdownDefinitionSet.boldText,
		"italicText": markdownDefinitionSet.italicText,
		"strikeThrough": markdownDefinitionSet.strikeThrough,
		"conflictMarker": /⧸⧸/g,
		"htmlComment": SyntaxHighlighter.lexicons.htmlSyntax.commentBlock,
		"htmlTag": SyntaxHighlighter.lexicons.htmlSyntax.tagStructure,
		"htmlEntity": SyntaxHighlighter.lexicons.htmlSyntax.htmlEntity
	};
	markdownDefinitionSet.hyperlink.inside["mkdnUnderlinedText"].inside = linkTextInnerContent;
	markdownDefinitionSet.linkReference.inside["refStartMarker"].inside["mkdnUnderlinedText"].inside = linkTextInnerContent;

	// Define content for the generic plain line text.
	markdownDefinitionSet.plainLineText.inside = {
		"headingLevel1": markdownDefinitionSet.headingLevel1,
		"headingLevel2": markdownDefinitionSet.headingLevel2,
		"headingLevel3": markdownDefinitionSet.headingLevel3,
		"headingLevel4": markdownDefinitionSet.headingLevel4,
		"headingLevel5": markdownDefinitionSet.headingLevel5,
		"headingLevel6": markdownDefinitionSet.headingLevel6,
		"blockquote": markdownDefinitionSet.blockquote,
		"listItem": markdownDefinitionSet.listItem,
		"footnoteDefinition": markdownDefinitionSet.footnoteDefinition,
		"linkDefinition": markdownDefinitionSet.linkDefinition
	};
	
	// Add a small debug log for demonstration of Type III changes
	// console.log("Markdown lexicon initialized with " + Object.keys(markdownDefinitionSet).length + " rules.");

	return markdownDefinitionSet;
})();


/* HTML to Markdown Conversion Utility */

// Configuration for the markdown processor.
const markdownProcessorConfig = {
	setextHeading1Disabled: false, // Disable H1 setext style (underline with '=')
	setextHeading2Disabled: false, // Disable H2 setext style (underline with '-')
	listItemBulletChar: '+',       // Use '+' for unordered list items
	indentString: '\t',            // Use tabs for indentation
	columnPrefixText: 'Column ',   // Prefix for table column headers (if generated)
	tableBordersEnabled: true,     // Render table borders
	nbspAsSpace: true,             // Convert &nbsp; to regular spaces
	spanTagsProcessed: false,      // Do not process <span> tags
	divTagsProcessed: false,       // Do not process <div> tags
};

// Initialize the markdown conversion engine.
const markdownConverterInst = new MarkdownProcessor(markdownProcessorConfig);

/**
 * Cleans the input HTML by removing unwanted tags, attributes, and empty nodes.
 * @param {string} inputHtmlContent The raw HTML string to clean.
 * @returns {string} The cleaned HTML string, ready for markdown conversion.
 */
const cleanHtmlForConversion = function(inputHtmlContent) {
	// Guard clause: If input is not a string or empty, return empty string.
	if (typeof inputHtmlContent !== 'string' || inputHtmlContent.trim() === '') {
		return '';
	}

	// Truncate content after the closing </html> tag if it exists.
	const htmlEndIndex = inputHtmlContent.indexOf('</html>');
	let processedHtml = (htmlEndIndex >= 0)
		? inputHtmlContent.substring(0, htmlEndIndex + '</html>'.length)
		: inputHtmlContent;

	// Use a dummy jQuery-like wrapper for DOM manipulation.
	// (Assuming jQuery is available in the environment, or a compatible library like Zepto.js)
	const domRootElement = $('<div>' + processedHtml + '</div>');

	// Define a whitelist of HTML tags that are allowed to remain.
	const allowedHtmlTags = [
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'ul', 'ol', 'img', 'li', 'a',
		'blockquote', 'pre', 'span', 'b', 'i', 'br', 'em', 'strong', 'code', 'table',
		'thead', 'tbody', 'td', 'th', 'tr'
	];

	/**
	 * Processes a single DOM node by removing specific attributes and reformatting footnote references.
	 * @param {jQuery} currentNodeEl The jQuery-wrapped DOM node to clean.
	 */
	function processNodeAttributes(currentNodeEl) {
		// Remove common unwanted attributes.
		currentNodeEl.removeAttr('class style lang dir title');

		const nodeNameAttr = currentNodeEl.attr('name');
		// Handle footnote references (e.g., `_ftnref1` -> `[^1]`).
		if (nodeNameAttr && nodeNameAttr.startsWith('_ftnref')) {
			currentNodeEl.removeAttr('href'); // Remove href from footnote references
			const footnoteReferenceText = currentNodeEl.text().replace(/\[(\d+)\]/, '[^$1]');
			currentNodeEl.html(footnoteReferenceText);
		}
		// Handle footnote definitions (e.g., `_ftn1` -> `[^1]:`).
		else if (nodeNameAttr && nodeNameAttr.startsWith('_ftn')) {
			currentNodeEl.removeAttr('href'); // Remove href from footnote definitions
			const footnoteReferenceText = currentNodeEl.text().replace(/\[(\d+)\]/, '[^$1]:');
			currentNodeEl.html(footnoteReferenceText);
		}
	}

	/**
	 * Recursively traverses and cleans the DOM tree.
	 * @param {jQuery} nodeCollection A jQuery collection of nodes to process.
	 */
	function recursivelyCleanDom(nodeCollection) {
		nodeCollection.each(function() {
			const currentNodeEl = $(this);
			
			// Remove comment nodes.
			currentNodeEl.contents().filter(function() { return this.nodeType === Node.COMMENT_NODE; }).remove();
			
			const childElements = currentNodeEl.children();

			// Remove empty nodes, unless they are images or contain images.
			const hasTextContent = currentNodeEl.text().trim().length > 0;
			const isImageNode = currentNodeEl[0].tagName === 'IMG';
			const containsImage = currentNodeEl.find('img').length > 0;

			if (!hasTextContent && !isImageNode && !containsImage) {
				currentNodeEl.remove();
				return; // Skip further processing for removed node.
			}

			// If the tag is not allowed, unwrap its children and remove the tag itself.
			if (allowedHtmlTags.indexOf(this.tagName.toLowerCase()) < 0) {
				childElements.unwrap();
				currentNodeEl.remove();
			} else {
				// Clean attributes for allowed tags.
				processNodeAttributes(currentNodeEl);
			}
			
			// Recursively process children.
			recursivelyCleanDom(childElements);
		});
	}
	
	// Initial cleaning pass: remove root-level comments and traverse children.
	domRootElement.contents().filter(function() { return this.nodeType === Node.COMMENT_NODE; }).remove();
	recursivelyCleanDom(domRootElement.children());

	// Second pass: After removing some nodes, others might have become empty.
	// This pass ensures all empty nodes are removed.
	recursivelyCleanDom(domRootElement.children());
	
	// Return the inner HTML, replacing newlines with spaces for consistency (Type III change).
	const finalHtmlOutput = domRootElement.html();
	return finalHtmlOutput ? finalHtmlOutput.replace(/\n/g, ' ') : '';
};

/**
 * Converts cleaned HTML content into Markdown format.
 * @param {string} inputHtml The HTML content to convert.
 * @returns {string} The resulting Markdown string.
 */
const convertHtmlToMarkdown = function(inputHtml) {
	// Step 1: Clean and strip unnecessary elements from the HTML.
	const cleanedHtmlFragment = cleanHtmlForConversion(inputHtml);
	// Step 2: Render the cleaned HTML to Markdown using the configured processor.
	const markdownResult = markdownConverterInst.render(cleanedHtmlFragment);
	
	// Add a small intermediate step/log for Type III.
	// if (markdownResult.length > 0) {
	// 	console.log("Successfully converted HTML to Markdown.");
	// } else {
	// 	console.warn("HTML to Markdown conversion resulted in empty output.");
	// }

	return markdownResult;
};