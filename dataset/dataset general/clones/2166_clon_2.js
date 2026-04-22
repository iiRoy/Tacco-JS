SyntaxHighlighter.lexicons.webSyntax = {
	// Matches HTML comments, e.g., <!-- This is a comment -->
	noteContent: /<!--[\w\W]*?-->/g,
	// Detects XML or PHP processing instructions like <?xml ... ?>
	introTag: /<\?.+?\?>/,
	// Identifies DOCTYPE declarations, e.g., <!DOCTYPE html>
	docTypeDecl: /<!DOCTYPE.+?>/,
	// Finds CDATA sections, which can contain unparsed character data
	charData: /<!\[CDATA\[[\w\W]*?]]>/i,
	htmlTag: {
		// Comprehensive regex for matching HTML opening or closing tags
		regexFormat: /<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
		internalComponents: {
			htmlTag: {
				// Captures the tag name (e.g., div, p, svg:path)
				regexFormat: /^<\/?[\w:-]+/i,
				internalComponents: {
					// The angle brackets and slash that define a tag
					symbolMarks: /^<\/?/,
					// Namespace prefix for XML or SVG tags
					scopePrefix: /^[\w-]+?:/
				}
			},
			'attributeValue': {
				// Matches the value assigned to an attribute
				regexFormat: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
				internalComponents: {
					// Punctuation like equals, quotes, or greater-than signs
					'symbolMarks': /=|>|"/g
				}
			},
			// Closing punctuation for tags like '/>' or '>'
			symbolMarks: /\/?>/g,
			'attributeName': {
				// Captures the name of an attribute (e.g., class, id, data-attr)
				regexFormat: /[\w:-]+/g,
				internalComponents: {
					// Namespace for attributes, if applicable
					scopePrefix: /^[\w-]+?:/
				}
			}

		}
	},
	// Matches HTML character entities, e.g., &amp; &nbsp; &#123;
	charEntity: /&amp;#?[\da-z]{1,8};/gi
};


SyntaxHighlighter.lexicons.mathScript = {
	// A tex command e.g. \section, \begin{document}
	reservedWord: /\\(?:[^a-zA-Z]|[a-zA-Z]+)/g,
	// Curly and square braces common in LaTeX
	leftBracket: /[[({]/g,
	rightBracket: /[\])}]/g,
	// A comment in LaTeX starts with % and extends to the end of the line
	noteContent: /%.*/g,
};


SyntaxHighlighter.lexicons.markDoc = (function() {

	// Characters allowed within a URL string
	var urlCharInner = "[-A-Z0-9+&@#/%?=~_|[\\]()!:,.;]",
	    urlCharEnd = "[-A-Z0-9+&@#/%=~_|[\\])]";

	// Regex for detecting full URLs
	var linkMatch = new RegExp("(https?|ftp)(://" + urlCharInner + "*" + urlCharEnd + ")(?=$|\\W)", "gi");
	// Regex for detecting email addresses
	var mailMatch = /(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)/gi;

	// Reference to the LaTeX language definitions
	var mathScriptRef = SyntaxHighlighter.lexicons.mathScript;

	// Regex for a newline character
	var lineBreak = /\n/gm;

	// Object to store all markdown parsing rules
	var markDocRules = {};

	// GitHub Flavored Markdown (GFM) fenced code blocks
	markDocRules['codeBlockGfm'] = {
		regexFormat: /^`{3}.*\n(?:[\s\S]*?)\n`{3} *$/gm,
		internalComponents: {
			"markDocCode": /`{3}/, // The backticks themselves
			lineBreak: lineBreak   // Newline character for line-by-line processing
		}
	};

	// Alternate H1 syntax (text followed by '===')
	markDocRules['headingOneAlt'] = {
		regexFormat: /^(.+)[ \t]*\n=+[ \t]*$/gm,
		internalComponents: {
		}
	};

	// Alternate H2 syntax (text followed by '---')
	markDocRules['headingTwoAlt'] = {
		regexFormat: /^(.+)[ \t]*\n-+[ \t]*$/gm,
		internalComponents: {
		}
	};

	// Generic indented code blocks
	markDocRules['codeBlockGeneric'] = {
		regexFormat: /(^|(?:^|(?:^|\n)(?![ \t]*([*+\-]|\d+\.)[ \t]).*\n)\s*?\n)((?: {4}|\t).*(?:\n|$))+/g,
		prevContext: true, // Requires a lookbehind context
		internalComponents: {
			lineBreak: lineBreak // Newline character
		}
	};

	// Standard Markdown table syntax
	markDocRules.dataGrid = {
		regexFormat: new RegExp(
			[
				'^'                         ,
				'[ ]{0,3}'                  , // Optional leading spaces
				'[|]'                       , // Initial pipe delimiter
				'(.+)\\n'                   , // $1: Header row content
				'[ ]{0,3}'                  , // Whitespace before separator line
				'[|]([ ]*[-:]+[-| :]*)\\n'  , // $2: Separator line (with pipes and colons)
				'('                         , // $3: Table body group
				'(?:[ ]*[|].*\\n?)*'      , // Multiple table rows
				')',
				'(?:\\n|$)'                   // End with newline or end of input
			].join(''),
			'gm'
		),
		internalComponents: {
			lineBreak: lineBreak // Newline character
		}
	};

	// Alternative Markdown table syntax (no leading pipe on header)
	markDocRules['dataGridAlt'] = {
		regexFormat: new RegExp(
			[
				'^'                         ,
				'[ ]{0,3}'                  , // Optional leading spaces
				'(\\S.*[|].*)\\n'           , // $1: Header row (starts with non-space char)
				'[ ]{0,3}'                  , // Whitespace before separator line
				'([-:]+[ ]*[|][-| :]*)\\n'  , // $2: Separator line
				'('                         , // $3: Table body group
				'(?:.*[|].*\\n?)*'        , // Multiple table rows
				')'                         ,
				'(?:\\n|$)'                   // End with newline or end of input
			].join(''),
			'gm'
		),
		internalComponents: {
			lineBreak: lineBreak // Newline character
		}
	};

	// Horizontal rule (three or more asterisks, hyphens, or underscores)
	markDocRules.horizontalRule = {
		regexFormat: /^([*\-_] *){3,}$/gm
	};

	// LaTeX math blocks (display mode, e.g., $$...$$, \[...\])
	markDocRules['mathBlock'] = {
		regexFormat: /(\$\$|\\\\\[|\\\\\\\\\()[\s\S]*?(\$\$|\\\\\]|\\\\\\\\\))/g,
		internalComponents: {
			"markDocBracketOpen": /^(\$\$|\\\\\[|\\\\\\\\\()/, // Opening delimiters
			"markDocBracketClose": /(\$\$|\\\\\]|\\\\\\\\\))/, // Closing delimiters
			lineBreak: lineBreak, // Newline character
			remainingTokens: mathScriptRef // Embed LaTeX rules within the block
		}
	};

	// LaTeX environment blocks (e.g., \begin{equation}...\end{equation})
	markDocRules['mathBlockEnv'] = {
		regexFormat: /\\?\\begin\{[a-z]*\*?\}[\s\S]*?\\?\\end\{[a-z]*\*?\}/g,
		internalComponents: {
			"reservedWord": /\\?\\(begin|end)/, // \begin and \end keywords
			lineBreak: lineBreak, // Newline character
			remainingTokens: mathScriptRef // Embed LaTeX rules
		}
	};

	// General left-to-right text lines (not starting with specific markdown structures)
	markDocRules.leftToRight = {
		regexFormat: /^[ <>^*+#\t\\\/\[\]\(\)0-9\._-]*[A-Za-z\$][^\n]*$/gm,
	};

	// Loop to define rules for H1 through H6 headings
	for(var counter = 6; counter >= 1; counter--) {
		markDocRules["h" + counter] = {
			regexFormat: new RegExp("^#{" + counter + "}.+$", "gm"),
			internalComponents: {
				"markDocHash": new RegExp("^#{" + counter + "}") // The hash symbols themselves
			}
		};
	}

	// Blockquotes (lines starting with '>')
	markDocRules.quoteBlock = {
		regexFormat: /^ {0,3}> *[^\n]+$/gm,
		internalComponents: {
			"markDocGt": /^ {0,3}> */, // The '>' character
			"listItem": markDocRules.listItem // Nested list items within blockquotes
		}
	};

	// List items (ordered and unordered)
	markDocRules.listItem = {
		regexFormat: /^[ \t]*([*+\-]|\d+\.)[ \t].+(?:\n|[ \t].*\n)*/gm,
		internalComponents: {
			"markDocLi": /^[ \t]*([*+\-]|\d+\.)[ \t]/m, // The bullet or number
			'codeBlockGfm': {
				regexFormat: /^((?: {4}|\t)+)`{3}.*\n(?:[\s\S]*?)\n\1`{3} *$/gm, // Nested GFM code blocks
				internalComponents: {
					"markDocCode": /`{3}/, // Backticks
					lineBreak: lineBreak // Newline
				}
			},
			lineBreak: lineBreak // Newline
		}
	};

	// Footnote definitions (e.g., [^1]: This is a footnote.)
	markDocRules.footnoteDef = {
		regexFormat: /^ {0,3}\[\^.*?\]:[ \t]+.*$/gm,
		internalComponents: {
			"referenceId": {
				regexFormat: /\[\^.*?\]/, // The footnote ID part, e.g., [^1]
				internalComponents: {
					"markDocBracketOpen": /\[/, // Opening bracket
					"markDocBracketClose": /\]/ // Closing bracket
				}
			}
		}
	};

	// Link definitions (e.g., [my-link]: https://example.com "Title")
	markDocRules.linkDef = {
		regexFormat: /^ {0,3}\[.*?\]:[ \t]+.*$/gm,
		internalComponents: {
			"linkIdentifier": {
				regexFormat: /\[.*?\]/, // The link ID part, e.g., [my-link]
				internalComponents: {
					"markDocBracketOpen": /\[/, // Opening bracket
					"markDocBracketClose": /\]/ // Closing bracket
				}
			},
			webAddress: linkMatch, // The URL
			linkText: /['\"\(][^\'\"\)]*['\"\)]/ // The optional link title
		}
	};

	// Paragraph elements
	markDocRules.paragraphElement = {
		regexFormat: /.+/g,
		internalComponents: {}
	};

	// Standalone newline character
	markDocRules.lineBreak = /^\n$/gm;

	// Image embeds (e.g., ![alt text](url "title"))
	markDocRules.imageEmbed = {
		regexFormat: /!\[[^\]]*\]\([^\)]+\)/g,
		internalComponents: {
			"markDocBang": /^!/, // The exclamation mark
			"markDocBracketOpen": /\[/, // Opening bracket for alt text
			"markDocAltText": /[^\[]+(?=\])/, // The alt text content
			"markDocBracketClose": /\](?=\()/, // Closing bracket for alt text
			"markDocImageParens": {
				regexFormat: /\([^\)]+\)/, // Parentheses containing URL and title
				internalComponents: {
					"markDocParenOpen": /^\(/, // Opening parenthesis
					"markDocImageTitle": /(['‘][^'’]*['’]|["“][^"”]*["”])(?=\)$)/, // Optional title
					"markDocImageSource": /[^\('" \t]+(?=[\)'" \t])/, // The image source URL
					"markDocParenClose": /\)$/ // Closing parenthesis
				}
			}
		}
	};

	// Hyperlinks (e.g., [link text](url "title"))
	markDocRules.hyperlink = {
		regexFormat: /\[(?:(\\.)|[^\[\]])*\]\([^\(\)\s]+(\(\S*?\))??[^\(\)\s]*?(\s(['‘][^'’]*['’]|["“][^"”]*["”]))?\)/gm,
		internalComponents: {
			"markDocBracketOpen": {
				regexFormat: /(^|[^\\])\[/, // Opening bracket (not escaped)
				prevContext: true
			},
			"markDocUnderlined": {
				regexFormat: /(?:(\\.)|[^\[\]])+(?=\])/ // The link text
			},
			"markDocBracketClose": /\]\s?\(/, // Closing bracket followed by a space and opening parenthesis
			"markDocParenClose": /\)$/, // Closing parenthesis
			"markDocHyperref": /.*/ // The actual URL
		}
	};

	// Footnote references (e.g., [^1])
	markDocRules.footnoteRef = {
		regexFormat: /\[\^(.*?)\]/g,
		internalComponents: {
			"referenceEntry": {
				regexFormat: /^\[[^\[\]]+\] ?/, // The full reference string
				internalComponents: {
					"markDocBracketOpen": /\[/, // Opening bracket
					"markDocRef": /^[^\[\]]+/, // The footnote identifier
					"markDocBracketClose": /\]/ // Closing bracket
				}
			}
		}
	};

	// Image references (e.g., ![alt text][ref-id])
	markDocRules.imageRef = {
		regexFormat: /!\[(.*?)\] ?\[(.*?)\]/g,
		internalComponents: {
			"markDocBang": /^!/, // Exclamation mark
			"referenceEnd": {
				regexFormat: /\[[^\[\]]+\]$/, // The second bracketed part (reference ID)
				internalComponents: {
					"markDocBracketOpen": /\[/, // Opening bracket
					"markDocHyperref": /[^\[\]]+(?=]$)/, // The reference ID
					"markDocBracketClose": /\]/ // Closing bracket
				}
			},
			"referenceStart": {
				regexFormat: /^\[[^\[\]]+\] ?/, // The first bracketed part (alt text)
				internalComponents: {
					"markDocBracketOpen": /\[/, // Opening bracket
					"markDocAltText": /^[^\[\]]+/, // The alt text
					"markDocBracketClose": /\]/ // Closing bracket
				}
			}
		}
	};

	// Link references (e.g., [link text][ref-id])
	markDocRules.linkReference = {
		regexFormat: /\[(.*?)\] ?\[(.*?)\]/g,
		internalComponents: {
			"referenceEnd": {
				regexFormat: /\[[^\[\]]+\]$/, // The second bracketed part (reference ID)
				internalComponents: {
					"markDocBracketOpen": /\[/, // Opening bracket
					"markDocHyperref": /[^\[\]]+(?=]$)/, // The reference ID
					"markDocBracketClose": /\]/ // Closing bracket
				}
			},
			"referenceStart": {
				regexFormat: /^\[[^\[\]]+\] ?/, // The first bracketed part (link text)
				internalComponents: {
					"markDocBracketOpen": /\[/, // Opening bracket
					"markDocUnderlined": /^[^\[\]]+/, // The link text
					"markDocBracketClose": /\]/ // Closing bracket
				}
			}
		}
	};

	// Inline code snippets (e.g., `console.log('hello')`)
	markDocRules.inlineCode = {
		regexFormat: /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/g,
		prevContext: true,
		internalComponents: {
			"markDocInlineCode": /`/ // The backticks
		}
	};

	// Inline math (e.g., $E=mc^2$)
	markDocRules.inlineMath = {
		regexFormat: /\$.*?\$/g,
		internalComponents: {
			"markDocBracketOpen": /^\$/, // Opening dollar sign
			"markDocBracketClose": /\$$/, // Closing dollar sign
			remainingTokens: mathScriptRef // Embed LaTeX rules
		}
	};

	// Strong emphasis (bold text, e.g., **bold**, __bold__)
	markDocRules.boldText = {
		regexFormat: /([_\*])\1((?!\1{2}).)*\1{2}/g,
		internalComponents: {
			"markDocBold": /([_\*])\1/g // The asterisks or underscores
		}
	};

	// Emphasis (italic text, e.g., *italic*, _italic_)
	markDocRules.italicText = {
		regexFormat: /(^|[^\\])(\*|_)(\S[^\2]*?)??[^\s\\]+?\2/g,
		prevContext: true,
		internalComponents: {
			"markDocItalicStart": /^(\*|_)/, // Starting delimiter
			"markDocItalicEnd": /(\*|_)$/ // Ending delimiter
		}
	};

	// Strikethrough text (e.g., ~~strikethrough~~)
	markDocRules.strikeThrough = {
		regexFormat: /(^|\n|\W)(~~)(?=\S)([^\r]*?\S)\2/gm,
		prevContext: true,
		internalComponents: {
			"markDocStrike": /(~~)/, // The tilde characters
			"markDocStrikeContent": /[^~]+/ // The content inside strikethrough
		}
	};

	// A collection of common tokens to be embedded in various markdown rules
	var commonTokens = {
		inlineCode: markDocRules.inlineCode,
		inlineMath: markDocRules.inlineMath,
		footnoteRef: markDocRules.footnoteRef,
		imageEmbed: markDocRules.imageEmbed,
		hyperlink: markDocRules.hyperlink,
		imageRef: markDocRules.imageRef,
		linkReference: markDocRules.linkReference,
		webAddress: linkMatch,
		mailMatch: mailMatch,
		boldText: markDocRules.boldText,
		italicText: markDocRules.italicText,
		strikeThrough: markDocRules.strikeThrough,
		conflict: /⧸⧸/g, // A special conflict marker
		noteContent: SyntaxHighlighter.lexicons.webSyntax.noteContent, // HTML comment
		htmlTag: SyntaxHighlighter.lexicons.webSyntax.htmlTag,     // HTML tag
		charEntity: SyntaxHighlighter.lexicons.webSyntax.charEntity // HTML entity
	};

	// Embed common tokens into heading rules (H1-H6)
	for(var loopCount = 6; loopCount >= 1; loopCount--) {
		markDocRules["h" + loopCount].internalComponents.remainingTokens = commonTokens;
	}

	// Embed common tokens into other top-level block rules
	markDocRules['headingOneAlt'].internalComponents.remainingTokens = commonTokens;
	markDocRules['headingTwoAlt'].internalComponents.remainingTokens = commonTokens;
	markDocRules.dataGrid.internalComponents.remainingTokens = commonTokens;
	markDocRules['dataGridAlt'].internalComponents.remainingTokens = commonTokens;
	markDocRules.paragraphElement.internalComponents.remainingTokens = commonTokens;
	markDocRules.quoteBlock.internalComponents.remainingTokens = commonTokens;
	markDocRules.listItem.internalComponents.remainingTokens = commonTokens;
	markDocRules.footnoteDef.internalComponents.remainingTokens = commonTokens;

	// A more restricted set of tokens for nested emphasis (to prevent infinite recursion)
	commonTokens = {
		inlineCode: markDocRules.inlineCode,
		footnoteRef: markDocRules.footnoteRef,
		hyperlink: markDocRules.hyperlink,
		linkReference: markDocRules.linkReference,
		conflict: /⧸⧸/g,
	};
	markDocRules.boldText.internalComponents.remainingTokens = commonTokens;
	markDocRules.italicText.internalComponents.remainingTokens = commonTokens;
	markDocRules.strikeThrough.internalComponents.remainingTokens = commonTokens;

	// Tokens allowed specifically inside link/underlined text
	var nestedTextTokens = {
		inlineCode: markDocRules.inlineCode,
		boldText: markDocRules.boldText,
		italicText: markDocRules.italicText,
		strikeThrough: markDocRules.strikeThrough,
		conflict: /⧸⧸/g,
		noteContent: SyntaxHighlighter.lexicons.webSyntax.noteContent,
		htmlTag: SyntaxHighlighter.lexicons.webSyntax.htmlTag,
		charEntity: SyntaxHighlighter.lexicons.webSyntax.charEntity
	};
	markDocRules.hyperlink.internalComponents["markDocUnderlined"].internalComponents = nestedTextTokens;
	markDocRules.linkReference.internalComponents["referenceStart"].internalComponents["markDocUnderlined"].internalComponents = nestedTextTokens;

	// Define which block-level structures can appear within general left-to-right flow
	markDocRules.leftToRight.internalComponents = {
		h1: markDocRules.h1,
		h2: markDocRules.h2,
		h3: markDocRules.h3,
		h4: markDocRules.h4,
		h5: markDocRules.h5,
		h6: markDocRules.h6,
		quoteBlock: markDocRules.quoteBlock,
		listItem: markDocRules.listItem,
		footnoteDef: markDocRules.footnoteDef,
		linkDef: markDocRules.linkDef
	};

	return markDocRules; // Return the fully constructed markdown syntax rules
})();


/* This section handles conversion of HTML content into Moratab markdown format. */

// Initialize the markdown conversion engine with specific options.
var convEngine = new reMarked({
	h1StyleAlt: false,   // Disable alternative H1 syntax (e.g., ===)
	h2StyleAlt: false,   // Disable alternative H2 syntax (e.g., ---)
	listItemBullet: '+', // Use '+' for unordered list bullets
	indentString: '\t',  // Use tab characters for indentation
	columnPrefix: 'ستون ', // Prefix for table columns (specific to a language/locale)
	tableBorders: true,  // Render full table borders in markdown
	nonBreakSpace: true, // Convert non-breaking spaces to regular spaces or entities
	allowSpan: false,    // Do not convert <span> tags into markdown
	allowDiv: false,     // Do not convert <div> tags into markdown
});


// Function to clean and strip unwanted HTML elements and attributes from input markup.
var cleanHtmlString = function(inputMarkup) {
	// Trim content after the closing </html> tag if it exists, to ensure valid HTML parsing.
	if (inputMarkup.indexOf('</html>') >= 0) {
		inputMarkup = inputMarkup.substr(0, inputMarkup.indexOf('</html>') + 7);
	}

	// Create a temporary jQuery DOM object to parse and manipulate the HTML string.
	var docObject = $('<div>' + inputMarkup + '</div>');

	// Define a whitelist of permitted HTML tags that should be retained.
	var permittedElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'ul', 'ol', 'img', 'li', 'a', 'blockquote', 'pre', 'span', 'b', 'i', 'br', 'em', 'strong', 'code', 'table', 'thead', 'tbody', 'td', 'th', 'tr'];

	/**
	 * Cleans a single DOM node by removing specific attributes and transforming footnote elements.
	 * @param {jQuery} currentElement The jQuery object representing the node to be cleaned.
	 */
	function purifyNode(currentElement) {
		// Remove common unwanted attributes to keep the output clean.
		currentElement.removeAttr('class style lang dir title');

		// Handle footnote reference links (e.g., <a name="_ftnref1">[1]</a>)
		if (currentElement.attr('name') && currentElement.attr('name').indexOf('_ftnref') === 0) {
			currentElement.removeAttr('href'); // Remove the href attribute.
			// Convert [1] to markdown footnote reference [^1].
			var refString = currentElement.text().replace(/\[(\d+)\]/, '[^$1]');
			currentElement.html(refString); // Update the node's inner HTML.
		}
		// Handle footnote definition links (e.g., <a name="_ftn1">[1]</a>)
		else if (currentElement.attr('name') && currentElement.attr('name').indexOf('_ftn') === 0) {
			currentElement.removeAttr('href'); // Remove the href attribute.
			// Convert [1] to markdown footnote definition [^1]:.
			var refString = currentElement.text().replace(/\[(\d+)\]/, '[^$1]:');
			currentElement.html(refString); // Update the node's inner HTML.
		}
	}

	/**
	 * Recursively traverses a collection of DOM nodes, cleaning and filtering them.
	 * @param {jQuery} elementCollection A jQuery object containing the nodes to traverse.
	 */
	function walkDom(elementCollection) {
		elementCollection.each(function() {
			var currentElement = $(this);
			// Remove HTML comments within the current element's contents.
			currentElement.contents().filter(function() { return this.nodeType === 8; }).remove();
			var childElements = currentElement.children(); // Get direct child elements.

			// Remove empty nodes, unless they are images or contain images (which can be empty text-wise).
			if (!currentElement.text().length && !(currentElement[0].tagName === 'IMG' || currentElement.find('img').length)) {
				currentElement.remove(); // Remove the node entirely.
				return; // Skip further processing for this removed node.
			}

			// If the current element's tag is not in the permitted list:
			if (permittedElements.indexOf(this.tagName.toLowerCase()) < 0) {
				childElements.unwrap(); // Move its children up to its parent.
				currentElement.remove(); // Remove the current element itself.
			}
			// If the tag is permitted:
			else {
				purifyNode(currentElement); // Apply cleaning rules to the node.
			}
			walkDom(childElements); // Recursively call walkDom for the child elements.
		});
	}

	// First, remove any root-level HTML comments.
	docObject.contents().filter(function() { return this.nodeType === 8; }).remove();
	// Perform the initial traversal and cleaning of the DOM children.
	walkDom(docObject.children());

	// A second pass is needed to clean up any tags that might have become empty after the first pass
	// (e.g., a <div> that only contained invalid tags that were removed).
	walkDom(docObject.children());

	// Return the final cleaned HTML string, replacing all newline characters with spaces for a single-line output.
	return docObject.html().replace(/\n/g, ' ');
};

// Main function to convert cleaned HTML to Moratab markdown format.
var markupToMoratab = function(inputMarkup) {
	var cleanedMarkup = cleanHtmlString(inputMarkup); // First, clean the input HTML.
	return convEngine.render(cleanedMarkup);           // Then, use the conversion engine to render to markdown.
};