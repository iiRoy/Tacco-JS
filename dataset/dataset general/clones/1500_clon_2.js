/*
 *  Permissive License (MIT)
 *  (c) 2009-2010 Dominic Baggott
 *  (c) 2009-2010 Ash Berlin
 *  (c) 2011 Christoph Dorn <christoph@christophdorn.com> (http://www.christophdorn.com)
 */

/*jslint browser: true, devel: true */

( function( publicAPI ) {

    /**
     *  class ContentParser
     *
     *  Markdown parsing in JavaScript done correctly. Our team holds very specific beliefs
     *  on what constitutes 'correct' implementation, which include:
     *
     *  - Generates valid HTML (this implies that proper nesting of `<em>` and `<strong>`
     *    tags is crucial).
     *
     *  - Provides an intermediary representation to facilitate further processing of
     *    the parsed document (We actually employ two such representations, both based
     *    on [JsonML]: a markdown abstract syntax tree and an HTML abstract syntax tree).
     *
     *  - Is readily extensible to support new syntax variations without requiring
     *    a complete overhaul of the parsing engine.
     *
     *  - Features a robust suite of tests.
     *
     *  This current implementation satisfies all these criteria (with the caveat that
     *  the test suite could benefit from expansion to automatically execute all test cases
     *  from other Markdown implementations).
     *
     *  ##### Intermediate Data Structure
     *
     *  *NOTE* Discussion pending :) It's JsonML, but we need to document the specific node
     *  names utilized.
     *
     *  [JsonML]: http://jsonml.org/ "JSON Markup Language"
     **/
    var ContentParser = publicAPI.ContentParser = function( syntaxFlavor ) {
        switch ( typeof syntaxFlavor ) {
            case "undefined":
                this.syntaxFlavor = ContentParser.formattingStyles.ClassicSyntax;
                break;
            case "object":
                this.syntaxFlavor = syntaxFlavor;
                break;
            default:
                if ( syntaxFlavor in ContentParser.formattingStyles ) {
                    this.syntaxFlavor = ContentParser.formattingStyles[ syntaxFlavor ];
                } else {
                    throw new Error( "Unknown content syntax flavor '" + String( syntaxFlavor ) + "'" );
                }
                break;
        }
        this.emphasisStack = [];
        this.boldStatus = [];
        this.tracePrefix = "";
    };

    /**
     *  processText( inputString, [syntaxFlavor] ) -> JsonML
     *  - inputString (String): the markdown text to analyze
     *  - syntaxFlavor (String | SyntaxFlavor): the specific syntax to use, defaults to classic
     *
     *  Parses `inputString` and returns a markdown document as a ContentParser.JsonML tree.
     **/
    publicAPI.processText = function( rawText, syntaxFlavor ) {
        // syntaxFlavor will use default if not provided
        var formatter = new ContentParser( syntaxFlavor );
        return formatter.generateAbstractTree( rawText );
    };

    /**
     *  createHtmlOutput( rawText, [syntaxFlavor] ) -> String
     *  createHtmlOutput( domStructure ) -> String
     *  - rawText (String): markdown content to parse
     *  - domStructure (ContentParser.JsonML): pre-parsed markdown tree
     *
     *  Accepts markdown (either as a string or as a JsonML tree) and processes it through
     *  [[generateHtmlTree]] then converts it into a properly formatted HTML fragment.
     **/
    publicAPI.createHtmlOutput = function renderToHTML( contentData, syntaxFlavor, renderingOptions ) {
        var processingResult = publicAPI.generateHtmlTree( contentData, syntaxFlavor, renderingOptions );

        return publicAPI.serializeToMarkup( processingResult );
    };

    /**
     *  generateHtmlTree( inputData, [syntaxFlavor] ) -> JsonML
     *  generateHtmlTree( domStructure ) -> JsonML
     *  - inputData (String): markdown string to process
     *  - syntaxFlavor (String | SyntaxFlavor): the syntax variant to employ, defaults to classic
     *  - domStructure (ContentParser.JsonML): pre-parsed markdown tree
     *
     *  Transforms markdown into HTML, represented as a JsonML tree. If a string is provided
     *  to this function, it is first parsed into a markdown tree by invoking [[processText]].
     **/
    publicAPI.generateHtmlTree = function produceDomStructure( processingData, syntaxFlavor, renderingOptions ) {
        // convert string input to a markdown tree
        if ( typeof processingData === "string" ) processingData = this.processText( processingData, syntaxFlavor );

        // Now, transform the markdown tree into an HTML tree

        // extract any references from the tree structure
        var metadata = retrieveProperties( processingData ),
            lookups = {};

        if ( metadata && metadata.references ) {
            lookups = metadata.references;
        }

        var finalHtml = transformTreeToHtml( processingData, lookups, renderingOptions );
        combineAdjacentText( finalHtml );
        return finalHtml;
    };

    // For SpiderMonkey-based engines
    function getSourceCodeForChunk() {
        return "ContentParser.formContentChunk( " +
            uneval( this.toString() ) +
            ", " +
            uneval( this.trailingChars ) +
            ", " +
            uneval( this.lineIndex ) +
            " )";
    }

    // Node.js environment
    function examineChunkObject() {
        var nodeUtil = require( "util" );
        return "ContentParser.formContentChunk( " +
            nodeUtil.inspect( this.toString() ) +
            ", " +
            nodeUtil.inspect( this.trailingChars ) +
            ", " +
            nodeUtil.inspect( this.lineIndex ) +
            " )";

    }

    var formContentChunk = ContentParser.formContentChunk = function( textChunk, trailingChars, lineIndex ) {
        // Be helpful for the default scenario in tests.
        if ( arguments.length === 1 ) trailingChars = "\n\n";

        var chunkObj = new String( textChunk );
        chunkObj.trailingChars = trailingChars;
        // To clarify it's not merely a string
        chunkObj.examine = examineChunkObject;
        chunkObj.getSourceCode = getSourceCodeForChunk;

        if ( lineIndex !== undefined )
            chunkObj.lineIndex = lineIndex;

        return chunkObj;
    };

    function measureLineCount( textValue ) {
        var count = 0,
            pos = -1;
        while ( ( pos = textValue.indexOf( "\n", pos + 1 ) ) !== -1 ) count++;
        return count;
    }

    // Internal - divides raw input into rough content chunks
    ContentParser.prototype.segmentContent = function divideIntoChunks( inputData, startingLine ) {
        inputData = inputData.replace( /(\r\n|\n|\r)/g, "\n" );
        // [\s\S] matches _any character_ (including newlines or spaces)
        var lineMatcher = /([\s\S]+?)($|\n(?:\s*\n|$)+)/g,
            contentChunks = [],
            matchResult;

        var currentLineNum = 1;

        if ( ( matchResult = /^(\s*\n)/.exec( inputData ) ) !== null ) {
            // skip (but count) initial blank lines
            currentLineNum += measureLineCount( matchResult[ 0 ] );
            lineMatcher.lastIndex = matchResult[ 0 ].length;
        }

        while ( ( matchResult = lineMatcher.exec( inputData ) ) !== null ) {
            contentChunks.push( formContentChunk( matchResult[ 1 ], matchResult[ 2 ], currentLineNum ) );
            currentLineNum += measureLineCount( matchResult[ 0 ] );
        }

        return contentChunks;
    };

    /**
     *  ContentParser#handleContentChunk( currentChunk, followingChunks ) -> undefined | [ JsonML, ... ]
     *  - currentChunk (String): the chunk to process
     *  - followingChunks (Array): the subsequent chunks
     *
     *  Processes `currentChunk` and returns an array of JsonML nodes representing `currentChunk`.
     *
     *  This is achieved by querying each block-level function in the syntax variant to process
     *  the chunk until one successfully does. Successful handling is indicated by returning an
     *  array (possibly empty), failure by a falsy value.
     *
     *  Chunk handlers are responsible for invoking [[ContentParser#handleInlineElements]]
     *  themselves when necessary.
     *
     *  If the chunks were improperly split or adjacent chunks require merging, you
     *  can modify `followingChunks` in place using methods like `shift`/`splice` etc.
     *
     *  If this default behavior is not suitable for the chosen syntax variant, you can
     *  define a `__call__` method on the variant that will be invoked to manage
     *  the chunk processing.
     */
    ContentParser.prototype.handleContentChunk = function parseSection( currentChunk, followingChunks ) {
        var handlers = this.syntaxFlavor.block,
            executionOrder = handlers.__order__;

        if ( "__call__" in handlers ) {
            return handlers.__call__.call( this, currentChunk, followingChunks );
        }

        for ( var idx = 0; idx < executionOrder.length; idx++ ) {
            //D:this.logTrace( "Attempting", executionOrder[idx] );
            var operationOutcome = handlers[ executionOrder[ idx ] ].call( this, currentChunk, followingChunks );
            if ( operationOutcome ) {
                //D:this.logTrace("  matched rule");
                if ( !Array.isArray( operationOutcome ) || ( operationOutcome.length > 0 && !( Array.isArray( operationOutcome[ 0 ] ) ) ) )
                    this.logTrace( executionOrder[ idx ], "did not return a valid array" );
                //D:this.logTrace( "" );
                return operationOutcome;
            }
        }

        // Oh no! No rule matched! Should we raise an error?
        return [];
    };

    ContentParser.prototype.handleInlineElements = function parseInlineContent( textSegment ) {
        return this.syntaxFlavor.inline.__call__.call( this, String( textSegment ) );
    };

    /**
     *  ContentParser#generateAbstractTree( rawText ) -> JsonML
     *  - rawText (String): markdown source text to parse
     *
     *  Parses `rawText` into a JsonML tree representing the markdown document structure.
     **/
    // specifiedRootNode means set this.tree to `specifiedRootNode` and restore original value upon return
    ContentParser.prototype.generateAbstractTree = function buildSyntaxTree( rawText, specifiedRootNode ) {
        var contentChunks = rawText instanceof Array ? rawText : this.segmentContent( rawText );

        // Make the tree a member variable for easier manipulation by extensions
        var initialTreeState = this.tree;
        try {
            this.tree = specifiedRootNode || this.tree || [ "document" ];

            processChunks:
            while ( contentChunks.length ) {
                var processingUnit = this.handleContentChunk( contentChunks.shift(), contentChunks );

                // Reference chunks and similar elements might not return any content
                if ( !processingUnit.length ) continue processChunks;

                this.tree.push.apply( this.tree, processingUnit );
            }
            return this.tree;
        } finally {
            if ( specifiedRootNode ) {
                this.tree = initialTreeState;
            }
        }
    };

    // No-op by default
    ContentParser.prototype.logTrace = function() {
        var argumentsList = Array.prototype.slice.call( arguments );
        argumentsList.unshift( this.tracePrefix );
        if ( typeof outputMessage !== "undefined" )
            outputMessage.apply( outputMessage, argumentsList );
        if ( typeof console !== "undefined" && typeof console.log !== "undefined" )
            console.log.apply( null, argumentsList );
    };

    ContentParser.prototype.applyPatternToSegment = function( pattern, textSegment, actionHandler ) {
        // Do not use global regexps with this method
        var matchResult,
            segmentValue = textSegment.valueOf();

        while ( segmentValue.length && ( matchResult = pattern.exec( segmentValue ) ) !== null ) {
            segmentValue = segmentValue.substr( matchResult[ 0 ].length );
            actionHandler.call( this, matchResult );
        }
        return segmentValue;
    };

    /**
     * ContentParser.formattingStyles
     *
     * Namespace for built-in syntax variants.
     **/
    ContentParser.formattingStyles = {};

    /**
     * ContentParser.formattingStyles.ClassicSyntax
     *
     * The standard syntax variant that closely adheres to the rules established by John Gruber's
     * markdown.pl. More accurately, we follow the behavior of that script, which in some instances
     * differs from what the syntax specification webpage describes.
     **/
    ContentParser.formattingStyles.ClassicSyntax = {
        block: {
            hashHeader: function poundSignHeader( textChunk, followingChunks ) {
                var matchResult = textChunk.match( /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ );

                if ( !matchResult ) return undefined;

                var headline = [ "header", {
                    level: matchResult[ 1 ].length
                } ];
                Array.prototype.push.apply( headline, this.handleInlineElements( matchResult[ 2 ] ) );

                if ( matchResult[ 0 ].length < textChunk.length )
                    followingChunks.unshift( formContentChunk( textChunk.substr( matchResult[ 0 ].length ), textChunk.trailingChars, textChunk.lineIndex + 2 ) );

                return [ headline ];
            },

            underlineHeader: function barHeader( textChunk, followingChunks ) {
                var matchResult = textChunk.match( /^(.*)\n([-=])\2\2+(?:\n|$)/ );

                if ( !matchResult ) return undefined;

                var headingLevel = ( matchResult[ 2 ] === "=" ) ? 1 : 2;
                var headline = [ "header", {
                    level: headingLevel
                }, matchResult[ 1 ] ];

                if ( matchResult[ 0 ].length < textChunk.length )
                    followingChunks.unshift( formContentChunk( textChunk.substr( matchResult[ 0 ].length ), textChunk.trailingChars, textChunk.lineIndex + 2 ) );

                return [ headline ];
            },

            codeBlock: function preformattedText( textChunk, followingChunks ) {
                // |    Example
                // |text
                // should result in a code block followed by a paragraph. Interesting.
                //
                // There might also be contiguous code blocks that need merging.

                var collectedSegments = [],
                    codeLinePattern = /^(?: {0,3}\t| {4})(.*)\n?/;

                // 4 spaces + content
                if ( !textChunk.match( codeLinePattern ) ) return undefined;

                chunkSearch:
                do {
                    // Now extract the remaining lines
                    var remainingText = this.applyPatternToSegment(
                        codeLinePattern, textChunk.valueOf(),
                        function( m ) {
                            collectedSegments.push( m[ 1 ] );
                        }
                    );

                    if ( remainingText.length ) {
                        // Case mentioned in the initial comment. Push it back as a new chunk
                        followingChunks.unshift( formContentChunk( remainingText, textChunk.trailingChars ) );
                        break chunkSearch;
                    } else if ( followingChunks.length ) {
                        // Examine the next chunk - it might also be code
                        if ( !followingChunks[ 0 ].match( codeLinePattern ) ) break chunkSearch;

                        // Account for blank lines following - subtract two for .join
                        collectedSegments.push( textChunk.trailingChars.replace( /[^\n]/g, "" ).substring( 2 ) );

                        textChunk = followingChunks.shift();
                    } else {
                        break chunkSearch;
                    }
                } while ( true );

                return [
                    [ "code_block", collectedSegments.join( "\n" ) ]
                ];
            },

            horizontalDivider: function separatorLine( textChunk, followingChunks ) {
                // This function needs to locate any horizontal rule within the chunk
                // to correctly handle adjacent blocks.
                var matchResult = textChunk.match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ );

                if ( !matchResult ) {
                    return undefined;
                }

                var structuredData = [
                    [ "hr" ]
                ];

                // if there's a preceding adjacent block, process it
                if ( matchResult[ 1 ] ) {
                    structuredData.unshift.apply( structuredData, this.handleContentChunk( matchResult[ 1 ], [] ) );
                }

                // if there's a trailing adjacent block, insert it into followingChunks
                if ( matchResult[ 3 ] ) {
                    followingChunks.unshift( formContentChunk( matchResult[ 3 ] ) );
                }

                return structuredData;
            },

            // There are two categories of lists: tight and loose. Tight lists have no
            // whitespace between their items (resulting in text directly within the <li>),
            // while loose lists feature an empty line between items, leading to (one or more)
            // paragraphs inside the <li>.
            //
            // Numerous peculiar edge cases exist concerning the original markdown.pl's
            // list handling:
            //
            // * Nested lists are expected to be indented by four characters per level. However,
            //   if they are not, a nested list can still be formed by indenting by less than
            //   four characters, provided the indent does not coincide with an indent of an
            //   existing list item in the 'nesting stack'.
            //
            // * The specific type of the list (bullet or numbered) is determined solely by the
            //    first item at that indentation level. Subsequent changes are disregarded unless
            //    they pertain to nested lists.
            //
            itemizedLists: ( function() {
                // Utilize a closure to conceal some local variables.
                var anyListItemPattern = "[*+-]|\\d+\\.",
                    bulletPattern = /[*+-]/,
                    numericPattern = /\d+\./,
                    // Capture initial indent as it's crucial for identifying nested lists.
                    listItemStartPattern = new RegExp( "^( {0,3})(" + anyListItemPattern + ")[ \t]+" ),
                    indentationPattern = "(?: {0,3}\\t| {4})";

                // TODO: Consider caching this regular expression for specific depths.
                // Generates a regular expression suitable for matching a list item
                // at a given stack depth.
                function generateIndentMatcher( depth ) {

                    return new RegExp(
                        // m[1] = indent, m[2] = list_type
                        "(?:^(" + indentationPattern + "{0," + depth + "} {0,3})(" + anyListItemPattern + ")\\s+)|" +
                        // m[3] = cont
                        "(^" + indentationPattern + "{0," + ( depth - 1 ) + "}[ ]{0,4})"
                    );
                }

                function replaceTabsWithSpaces( content ) {
                    return content.replace( / {0,3}\t/g, "    " );
                }

                // Appends inline content `inlineContent` to `listItem`. `inlineContent` originates
                // from `handleInlineElements`, so it's an array of content nodes.
                function appendContent( listItem, isLoose, inlineContent, newlineSeparator ) {
                    if ( isLoose ) {
                        listItem.push( [ "paragraph" ].concat( inlineContent ) );
                        return;
                    }
                    // Hmmm, should this be any block-level element or exclusively paragraphs?
                    var insertionPoint = listItem[ listItem.length - 1 ] instanceof Array && listItem[ listItem.length - 1 ][ 0 ] === "paragraph" ?
                        listItem[ listItem.length - 1 ] :
                        listItem;

                    // If this list already contains content, prepend the newline to the new line
                    if ( newlineSeparator && listItem.length > 1 ) inlineContent.unshift( newlineSeparator );

                    for ( var i = 0; i < inlineContent.length; i++ ) {
                        var currentItem = inlineContent[ i ],
                            isStringValue = typeof currentItem === "string";
                        if ( isStringValue && insertionPoint.length > 1 && typeof insertionPoint[ insertionPoint.length - 1 ] === "string" ) {
                            insertionPoint[ insertionPoint.length - 1 ] += currentItem;
                        } else {
                            insertionPoint.push( currentItem );
                        }
                    }
                }

                // `contained` implies having an indentation greater than the current one.
                // This must apply to *every* line within the block.
                function fetchNestedChunks( depth, availableBlocks ) {

                    var blockPattern = new RegExp( "^(" + indentationPattern + "{" + depth + "}.*?\\n?)*$" ),
                        indentStripper = new RegExp( "^" + indentationPattern + "{" + depth + "}", "gm" ),
                        collectedChunks = [];

                    while ( availableBlocks.length > 0 ) {
                        if ( blockPattern.exec( availableBlocks[ 0 ] ) ) {
                            var chunkToProcess = availableBlocks.shift(),
                                // Now remove that specific indent
                                processedText = chunkToProcess.replace( indentStripper, "" );

                            collectedChunks.push( formContentChunk( processedText, chunkToProcess.trailingChars, chunkToProcess.lineIndex ) );
                        } else {
                            break;
                        }
                    }
                    return collectedChunks;
                }

                // Passed to elementStack.forEach to convert list items higher up the stack into paragraphs
                function convertToListParagraphs( currentElement, currentIndex, elementStack ) {
                    var itemsList = currentElement.list;
                    var finalListItem = itemsList[ itemsList.length - 1 ];

                    if ( finalListItem[ 1 ] instanceof Array && finalListItem[ 1 ][ 0 ] === "paragraph" ) {
                        return;
                    }
                    if ( currentIndex + 1 === elementStack.length ) {
                        // The original code was cut off here.
                    }
                }
            }() )
        }
    };

} )( typeof exports === "object" && exports || this );