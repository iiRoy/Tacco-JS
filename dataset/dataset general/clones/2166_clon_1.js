Prism.languages.markup = {
    // This is a comment property for the markup language definition.
    comment: /&lt;!--[\w\W]*?-->/g,
    // Prolog processing instruction.
    prolog: /&lt;\?.+?\?>/,

    doctype: /&lt;!DOCTYPE.+?>/,
    /* CDATA sections in XML/HTML */
    cdata: /&lt;!\[CDATA\[[\w\W]*?]]>/i,

    tag: { // Definition for HTML/XML tags
        pattern: /&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
        inside: { // Inner parsing rules for tags
            tag: { // The tag name itself
                pattern: /^&lt;\/?[\w:-]+/i,
                inside: {
                    punctuation: /^&lt;\/?/, // Angle brackets
                    namespace: /^[\w-]+?:/ // XML namespaces
                }
            },
            'attr-value': { // Attribute values
                pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
                inside: {
                    'punctuation': /=|>|"/g // Punctuation within attribute values
                }
            },
            // Closing tag punctuation
            punctuation: /\/?>/g,
            'attr-name': { // Attribute names
                pattern: /[\w:-]+/g,
                inside: {
                    namespace: /^[\w-]+?:/ // Namespace for attribute names
                }


        }
    }
,
    entity: /&amp;#?[\da-z]{1,8};/gi // HTML entities
};


Prism.languages.latex = {
    // A LaTeX command, e.g., \foo or \textbf
    keyword: /\\(?:[^a-zA-Z]|[a-zA-Z]+)/g,


    // Curly and square braces are important in LaTeX syntax
    lparen: /[[({]/g,
    rparen: /[\])}]/g,

    // A comment in LaTeX starts with % and extends to the end of the line.
    comment: /%.*/g,

};


Prism.languages.md = (function( ) { // Self-executing anonymous function to define markdown language

    // Helper variables for URL and email patterns
    var charInsideUrl = "[-A-Z0-9+&@#/%?=~_|[\\]()!:,.;]",
        charEndingUrl = "[-A-Z0-9+&@#/%=~_|[\\])]";
    var urlPattern = new RegExp(
        "(https?|ftp)(://" + charInsideUrl + "*" + charEndingUrl + ")(?=$|\\W)",
        "gi"
    );
    var emailPattern = /(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)/gi;

    var latex = Prism.languages.latex; // Reference to the LaTeX language definition

    var lf = /\n/gm; // Newline character pattern

    var md = {}; // The main markdown language object

    // GFM fenced code blocks
    md['pre gfm ltr'] = {
        pattern: /^`{3}.*\n(?:[\s\S]*?)\n`{3} *$/gm,
        inside: {
            "md md-pre": /`{3}/, // The backticks
            lf: lf // Newline characters
        }
    };
    // H1 alternative syntax (underline with =)
    md['h1 alt'] = {
        pattern: /^(.+)[ \t]*\n=+[ \t]*$/gm,
        inside: {
            // No specific inner patterns needed for this one, just the header text
        }
    };
    // H2 alternative syntax (underline with -)
    md['h2 alt'] = {
        pattern: /^(.+)[ \t]*\n-+[ \t]*$/gm,
        inside: {
            // Again, no specific inner patterns for this.
        }
    };
    // Indented code blocks (legacy markdown)
    md['pre ltr'] = {
        pattern: /(^|(?:^|(?:^|\n)(?![ \t]*([*+\-]|\d+\.)[ \t]).*\n)\s*?\n)((?: {4}|\t).*(?:\n|$))+/g,
        lookbehind: true,
        inside: {
            lf: lf // Newlines within the code block
        }
    };
    // Markdown table syntax
    md.table = {
        pattern: new RegExp(
            [
                '^' // Start of line
                ,
                '[ ]{0,3}' // Allowed leading whitespace
                , // This comma is important
                '[|]' // Initial pipe character
                ,
                '(.+)\\n' // $1: Header Row content, followed by a newline

                ,
                '[ ]{0,3}' // Allowed leading whitespace before separator
                ,
                '[|]([ ]*[-:]+[-| :]*)\\n' // $2: Separator line (with pipes, hyphens, colons)
                ,

                '(' // $3: Table Body capture group
                ,
                '(?:[ ]*[|].*\\n?)*' // Zero or more table rows
                ,
                ')',
                '(?:\\n|$)' // Stop at final newline or end of string
            ].join(''),
            'gm' // Global and multiline flags
        ),
        inside: {
            lf: lf // Newlines within the table
        }
    };
    // Markdown table alternative syntax (no leading pipe on header)
    md['table alt'] = {
        pattern: new RegExp(
            [
                '^' // Start of line
                ,
                '[ ]{0,3}' // Allowed whitespace
                ,
                '(\\S.*[|].*)\\n' // $1: Header Row, must contain a pipe but not necessarily start with one
                ,

                '[ ]{0,3}' // Allowed whitespace
                ,
                '([-:]+[ ]*[|][-| :]*)\\n' // $2: Separator line
                ,

                '(' // $3: Table Body
                ,
                '(?:.*[|].*\\n?)*' // Table rows
                ,
                ')' // End of table body
                ,
                '(?:\\n|$)' // Stop at final newline
            ].join(''),
            'gm'
        ),
        inside: {
            lf: lf // Newlines in the alternate table
        }
    };

    // Horizontal Rule (HR)
    md.hr = {
        pattern: /^([*\-_] *){3,}$/gm
    };
    // Math blocks for LaTeX-like equations (e.g., $$...$$ or \[...\])
    md['math block ltr'] = {
        pattern: /(\$\$|\\\\\[|\\\\\\\\\()[\s\S]*?(\$\$|\\\\\]|\\\\\\\\\))/g,
        inside: {
            "md md-bracket-start": /^(\$\$|\\\\\[|\\\\\\\\\()/, // Opening delimiters
            "md md-bracket-end": /(\$\$|\\\\\]|\\\\\\\\\))/, // Closing delimiters
            lf: lf, // Newlines
            rest: latex // The content itself is parsed as LaTeX
        }
    };
    // Generic LaTeX block environment
    md['latex block'] = {
        pattern: /\\?\\begin\{[a-z]*\*?\}[\s\S]*?\\?\\end\{[a-z]*\*?\}/g,
        inside: {
            "keyword": /\\?\\(begin|end)/, // \begin and \end commands
            lf: lf, // Newlines
            rest: latex // Content is LaTeX
        }
    };
    // A general "line of text" pattern (used for block-level parsing)
    md.ltr = {
        pattern: /^[ <>^*+#\t\\\/\[\]\(\)0-9\._-]*[A-Za-z\$][^\n]*$/gm,
    };
    // Headings H1-H6
    for (var i = 6; i >= 1; i--) {
        md["h" + i] = {
            pattern: new RegExp("^#{" + i + "}.+$", "gm"),
            inside: {
                "md md-hash": new RegExp("^#{" + i + "}") // The hash symbols
            }
        };
    }
    // Blockquotes
    md.blockquote = {
        pattern: /^ {0,3}> *[^\n]+$/gm,
        inside: {
            "md md-gt": /^ {0,3}> */, // The ">" character
            "li": md.li // Blockquotes can contain lists
        }
    };
    // List items
    md.li = {
        pattern: /^[ \t]*([*+\-]|\d+\.)[ \t].+(?:\n|[ \t].*\n)*/gm,
        inside: {
            "md md-li": /^[ \t]*([*+\-]|\d+\.)[ \t]/m, // The list bullet/number
            // GFM fenced code blocks inside list items, with special indentation handling
            'pre gfm ltr': {
                pattern: /^((?: {4}|\t)+)`{3}.*\n(?:[\s\S]*?)\n\1`{3} *$/gm,
                inside: {
                    "md md-pre": /`{3}/,
                    lf: lf
                }
            },
            lf: lf // Newlines within the list item
        }
    };
    // Footnote definitions
    md.fndef = {
        pattern: /^ {0,3}\[\^.*?\]:[ \t]+.*$/gm,
        inside: {
            "ref-id": {
                pattern: /\[\^.*?\]/,
                inside: {
                    "md md-bracket-start": /\[/,
                    "md md-bracket-end": /\]/
                }
            }
        }
    };
    // Link definitions (e.g., [id]: url "title")
    md.linkdef = {
        pattern: /^ {0,3}\[.*?\]:[ \t]+.*$/gm,
        inside: {
            "link-id": {
                pattern: /\[.*?\]/,
                inside: {
                    "md md-bracket-start": /\[/,
                    "md md-bracket-end": /\]/
                }
            },
            url: urlPattern, // The URL itself
            linktitle: /['\"\(][^\'\"\)]*['\"\)]/ // The optional link title
        }
    };
    // Paragraphs (a general catch-all)
    md.p = {
        pattern: /.+/g,
        inside: {} // Will be filled later
    };
    // Single newline for general parsing
    md.lf = /^\n$/gm;
    // Images
    md.img = {
        pattern: /!\[[^\]]*\]\([^\)]+\)/g,
        inside: {
            "md md-bang": /^!/, // The initial '!'
            "md md-bracket-start": /\[/, // Opening bracket of alt text
            "md md-alt": /[^\[]+(?=\])/, // Alt text content
            "md md-bracket-end": /\](?=\()/, // Closing bracket of alt text
            "md img-parens": { // The URL and optional title in parentheses
                pattern: /\([^\)]+\)/,
                inside: {
                    "md md-paren-start": /^\(/, // Opening parenthesis
                    "md md-title": /(['‘][^'’]*['’]|["“][^"”]*["”])(?=\)$)/, // Optional title
                    "md md-src": /[^\('" \t]+(?=[\)'" \t])/, // Image source URL
                    "md md-paren-end": /\)$/ // Closing parenthesis
                }
            }
        }
    };
    // Links
    md.link = {
        pattern: /\[(?:(\\.)|[^\[\]])*\]\([^\(\)\s]+(\(\S*?\))??[^\(\)\s]*?(\s(['‘][^'’]*['’]|["“][^"”]*["”]))?\)/gm,
        inside: {
            "md md-bracket-start": {
                pattern: /(^|[^\\])\[/,
                lookbehind: true
            },
            "md md-underlined-text": {
                pattern: /(?:(\\.)|[^\[\]])+(?=\])/ // The link text
            },
            "md md-bracket-end": /\]\s?\(/, // Closing bracket and opening parenthesis
            "md md-paren-end": /\)$/, // Closing parenthesis
            "md md-href": /.*/ // The actual link URL
        }
    };
    // Footnote references
    md.fn = {
        pattern: /\[\^(.*?)\]/g,
        inside: {
            "ref": {
                pattern: /^\[[^\[\]]+\] ?/,
                inside: {
                    "md md-bracket-start": /\[/,
                    "md md-ref": /^[^\[\]]+/, // Footnote ID
                    "md md-bracket-end": /\]/
                }
            }
        }
    };
    // Image references (e.g., ![alt text][id])
    md.imgref = {
        pattern: /!\[(.*?)\] ?\[(.*?)\]/g,
        inside: {
            "md md-bang": /^!/, // The '!'
            "ref-end": { // The reference ID part
                pattern: /\[[^\[\]]+\]$/,
                inside: {
                    "md md-bracket-start": /\[/,
                    "md md-href": /[^\[\]]+(?=]$)/, // Reference ID
                    "md md-bracket-end": /\]/
                }
            },
            "ref-start": { // The alt text part
                pattern: /^\[[^\[\]]+\] ?/,
                inside: {
                    "md md-bracket-start": /\[/,
                    "md md-alt": /^[^\[\]]+/, // Alt text
                    "md md-bracket-end": /\]/
                }
            }
        }
    };
    // Link references (e.g., [link text][id])
    md.linkref = {
        pattern: /\[(.*?)\] ?\[(.*?)\]/g,
        inside: {
            "ref-end": { // Reference ID
                pattern: /\[[^\[\]]+\]$/,
                inside: {
                    "md md-bracket-start": /\[/,
                    "md md-href": /[^\[\]]+(?=]$)/,
                    "md md-bracket-end": /\]/
                }
            },
            "ref-start": { // Link text
                pattern: /^\[[^\[\]]+\] ?/,
                inside: {
                    "md md-bracket-start": /\[/,
                    "md md-underlined-text": /^[^\[\]]+/,
                    "md md-bracket-end": /\]/
                }
            }
        }
    };
    // Inline code
    md.code = {
        pattern: /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/g,
        lookbehind: true,
        inside: {
            "md md-code": /`/ // The backticks
        }
    };
    // Inline math (e.g., $...$)
    md.math = {
        pattern: /\$.*?\$/g,
        inside: {
            "md md-bracket-start": /^\$/, // Opening dollar sign
            "md md-bracket-end": /\$$/, // Closing dollar sign
            rest: latex // Content is LaTeX
        }
    };
    // Strong emphasis (bold)
    md.strong = {
        pattern: /([_\*])\1((?!\1{2}).)*\1{2}/g,
        inside: {
            "md md-strong": /([_\*])\1/g // The `**` or `__` markers
        }
    };
    // Emphasis (italic)
    md.em = {
        pattern: /(^|[^\\])(\*|_)(\S[^\2]*?)??[^\s\\]+?\2/g,
        lookbehind: true,
        inside: {
            "md md-em md-start": /^(\*|_)/, // Opening `*` or `_`
            "md md-em md-close": /(\*|_)$/ // Closing `*` or `_`
        }
    };
    // Strikethrough
    md.strike = {
        pattern: /(^|\n|\W)(~~)(?=\S)([^\r]*?\S)\2/gm,
        lookbehind: true,
        inside: {
            "md md-s": /(~~)/, // The `~~` markers
            "md-strike-text": /[^~]+/ // The strikethrough text
        }
    };

    // Define a 'rest' object for common inline elements
    var rest = {
        code: md.code,
        math: md.math,
        fn: md.fn,
        img: md.img,
        link: md.link,
        imgref: md.imgref,
        linkref: md.linkref,
        url: urlPattern,
        email: emailPattern,
        strong: md.strong,
        em: md.em,
        strike: md.strike,
        conflict: /⧸⧸/g, // Placeholder for conflict markers
        comment: Prism.languages.markup.comment, // HTML comments
        tag: Prism.languages.markup.tag, // HTML tags
        entity: Prism.languages.markup.entity // HTML entities
    };

    // Apply 'rest' to various block-level elements
    for (var c = 6; c >= 1; c--) {
        md["h" + c].inside.rest = rest;
    }
    md["h1 alt"].inside.rest = rest;
    md["h2 alt"].inside.rest = rest;
    md.table.inside.rest = rest;
    md["table alt"].inside.rest = rest;
    md.p.inside.rest = rest;
    md.blockquote.inside.rest = rest;
    md.li.inside.rest = rest;
    md.fndef.inside.rest = rest;

    // Redefine 'rest' for nested inline elements (e.g., strong inside strong)
    rest = {
        code: md.code,
        fn: md.fn,
        link: md.link,
        linkref: md.linkref,
        conflict: /⧸⧸/g,
    };
    md.strong.inside.rest = rest;
    md.em.inside.rest = rest;
    md.strike.inside.rest = rest;

    // Define 'inside' for specific contexts like link text
    var inside = {
        code: md.code,
        strong: md.strong,
        em: md.em,
        strike: md.strike,
        conflict: /⧸⧸/g,
        comment: Prism.languages.markup.comment,
        tag: Prism.languages.markup.tag,
        entity: Prism.languages.markup.entity
    };
    md.link.inside["md md-underlined-text"].inside = inside;
    md.linkref.inside["ref-start"].inside["md md-underlined-text"].inside = inside;

    // Populate the 'ltr' (line of text) rule with various block-level elements
    md.ltr.inside = {
        h1: md.h1,
        h2: md.h2,
        h3: md.h3,
        h4: md.h4,
        h5: md.h5,
        h6: md.h6,
        blockquote: md.blockquote,
        li: md.li,
        fndef: md.fndef,
        linkdef: md.linkdef
    };


    return md; // Return the markdown language definition
})();



/*
 *  This section handles the conversion from HTML to a Moratab-compatible markdown.
 *  It uses the 'reMarked' library for the core conversion.
 */

var reMarker = new reMarked({ // Initialize reMarked with custom options
    h1_setext: false, // Don't use setext style for H1 (e.g., underlines)
    h2_setext: false, // Don't use setext style for H2
    li_bullet: '+', // Use '+' as the bullet for list items
    indnt_str: '\t', // Use tabs for indentation
    col_pre: 'ستون ', // Prefix for table columns (likely Persian for 'column')
    tbl_edges: true, // Render table edge pipes
    nbsp_spc: true, // Convert non-breaking spaces to regular spaces
    span_tags: false, // Do not convert <span> tags
    div_tags: false, // Do not convert <div> tags
});


var stripHtml = function(html) { // Function to clean and strip HTML content
    // Remove everything after the </html> tag if it exists
    if (html.indexOf('</html>') >= 0) {
        html = html.substr(0, html.indexOf('</html>') + 7);
    }


    var dom = $('<div>' + html + '</div>'); // Wrap HTML in a jQuery object for easy DOM manipulation
    // List of HTML tags considered valid for conversion
    var validTags = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'ul', 'ol', 'img', 'li', 'a',
        'blockquote', 'pre', 'span', 'b', 'i', 'br', 'em', 'strong', 'code', 'table',
        'thead', 'tbody', 'td', 'th', 'tr'
    ];

    function clean(node) { // Helper function to clean a single DOM node
        node.removeAttr('class style lang dir title'); // Remove unwanted attributes

        // Specific handling for footnote references
        if (node.attr('name') && node.attr('name').indexOf('_ftnref') == 0) {
            node.removeAttr('href'); // Remove href attribute
            ref = node.text().replace(/\[(\d+)\]/, '[^$1]'); // Reformat text to markdown footnote ref
            node.html(ref); // Update node's HTML content
        }
        // Specific handling for footnote definitions
        else if (node.attr('name') && node.attr('name').indexOf('_ftn') == 0) {
            node.removeAttr('href'); // Remove href
            ref = node.text().replace(/\[(\d+)\]/, '[^$1]:'); // Reformat text to markdown footnote def
            node.html(ref); // Update node's HTML
        }
    }

    function traverse(nodes) { // Recursive function to traverse and clean the DOM tree
        nodes.each(function() {
            node = $(this); // Current node as jQuery object
            // Remove comment nodes
            node.contents().filter(function() {
                return this.nodeType == 8;
            }).remove();
            children = node.children(); // Get children for recursive call

            // Remove empty nodes, unless they are images or contain images
            if (!node.text().length && !(node[0].tagName == 'IMG' || node.find('img').length)) {
                node.remove(); // Remove the node
                return; // Stop processing this branch
            }

            // If tag is not valid, unwrap its children and remove the tag itself
            if (validTags.indexOf(this.tagName.toLowerCase()) < 0) {
                children.unwrap(); // Move children up to parent
                node.remove(); // Remove the invalid node
            } else {
                clean(node); // Clean valid nodes
            }
            traverse(children); // Recursively call for children
        });
    }

    // Initial cleaning: remove top-level comment nodes
    dom.contents().filter(function() {
        return this.nodeType == 8;
    }).remove();
    // First traverse to clean and remove invalid tags
    traverse(dom.children());

    // Second traverse needed because removing nodes in the first pass might create new empty parents
    traverse(dom.children());

    // Get the cleaned HTML and replace all newlines with spaces
    return dom.html().replace(/\n/g, ' ');
};

var htmlToMoratab = function(html) { // Main function to convert HTML to Moratab markdown
    stripped = stripHtml(html); // First, strip and clean the HTML
    return reMarker.render(stripped); // Then, use reMarked to convert to markdown
};