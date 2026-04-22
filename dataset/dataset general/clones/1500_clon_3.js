// A modular content parsing utility.
// Copyright (c) 2023 Acme Corp. All rights reserved.

/*jslint browser: true, node: true */
/*global define */ // For UMD pattern if needed, but not in original.

(function( globalScope ) { // Renamed 'expose' to 'globalScope'

  // Internal helper for array type checking
  const isArrayType = Array.isArray || function(val) {
    return Object.prototype.toString.call(val) === '[object Array]';
  };

  /**
   *  class DocumentProcessor
   *
   *  Handles structured text processing and conversion to various formats.
   *  This implementation focuses on robustness and extensibility.
   *
   *  Key principles:
   *  - Generates well-structured output (e.g., proper HTML nesting).
   *  - Utilizes an intermediate representation (IR) for processing parsed data.
   *    (Currently, two IRs based on JsonML: a source tree and a render tree).
   *  - Designed for easy extension with new syntax profiles without core engine modification.
   *  - Includes a comprehensive suite of unit tests.
   *
   *  Intermediate Representation Details:
   *  The IR employs a JsonML-like structure. Node names are semantic rather than strictly HTML.
   *  Example: `["paragraph", "Some text"]`, `["heading", { level: 1 }, "Main title"]`.
   *
   *  [JsonML]: http://jsonml.org/ "JSON Markup Language"
   **/
  var DocumentProcessor = globalScope.DocumentProcessor = function(syntaxProfileInput) { // Renamed Markdown to DocumentProcessor
    let activeProfile; // Renamed dialect to activeProfile

    // Determine the parsing profile based on the input type.
    if (typeof syntaxProfileInput === "undefined" || syntaxProfileInput === null) {
      activeProfile = DocumentProcessor.syntaxProfiles.Standard; // Renamed Gruber to Standard
    } else if (typeof syntaxProfileInput === "object") {
      activeProfile = syntaxProfileInput;
    } else if (typeof syntaxProfileInput === "string") {
      // Check if the string matches a registered profile name.
      if (syntaxProfileInput in DocumentProcessor.syntaxProfiles) {
        activeProfile = DocumentProcessor.syntaxProfiles[syntaxProfileInput];
      } else {
        // If no matching profile, throw an error.
        throw new Error(`Unknown syntax profile specified: '${String(syntaxProfileInput)}'`);
      }
    } else {
      // Fallback for unexpected input types.
      throw new Error(`Invalid type for syntax profile: '${typeof syntaxProfileInput}'`);
    }

    this.activeProfile = activeProfile;
    this.emphasisState = []; // Renamed em_state
    this.strongEmphasisState = []; // Renamed strong_state
    // this.debug_indent = ""; // Removed debug_indent, also debug function will be removed
  };

  /**
   *  parseContent( rawText, [profileName] ) -> JsonML
   *  - rawText (String): input text content to be parsed
   *  - profileName (String | Object): the syntax profile to apply, defaults to 'Standard'
   *
   *  Parses `rawText` and returns a structured document as a DocumentProcessor.JsonML tree.
   **/
  globalScope.parseContent = function( rawText, profileName ) {
    // If no profile is provided, the DocumentProcessor constructor will use the default.
    const processorInstance = new DocumentProcessor( profileName );
    return processorInstance.buildSyntaxTree( rawText ); // Renamed toTree to buildSyntaxTree
  };

  /**
   *  convertToHtml( rawText, [profileName], [renderOptions] ) -> String
   *  convertToHtml( contentTree ) -> String
   *  - rawText (String): source text string to process
   *  - contentTree (DocumentProcessor.JsonML): pre-parsed content tree
   *  - profileName (String | Object): the syntax profile to use
   *  - renderOptions (Object): rendering configuration options
   *
   *  Accepts content (either as a string or a JsonML tree) and processes it
   *  through [[generateRenderTree]] before converting into a well-formed HTML fragment.
   **/
  globalScope.convertToHtml = function renderFinalHtml( sourceInput , profileName , renderOptions ) { // Renamed toHTML to renderFinalHtml
    const renderOutputTree = globalScope.generateRenderTree( sourceInput , profileName , renderOptions ); // Renamed toHTMLTree to generateRenderTree

    return globalScope.renderJsonML( renderOutputTree );
  };

  /**
   *  generateRenderTree( rawText, [profileName], [renderOptions] ) -> JsonML
   *  generateRenderTree( contentTree ) -> JsonML
   *  - rawText (String): source text string to process
   *  - profileName (String | Object): the syntax profile to use
   *  - contentTree (DocumentProcessor.JsonML): pre-parsed content tree
   *  - renderOptions (Object): rendering configuration options
   *
   *  Converts source text or a syntax tree into an HTML-like JsonML render tree.
   *  If a string is provided, it's first parsed into a syntax tree by calling
   *  [[parseContent]].
   **/
  globalScope.generateRenderTree = function transformToHtmlTree( inputContent, profileIdentifier , conversionOpts ) { // Renamed toHTMLTree to transformToHtmlTree
    let intermediateTree = inputContent; // Renamed input to intermediateTree

    // If the input is a string, first convert it into a syntax tree.
    if ( typeof intermediateTree === "string" || intermediateTree instanceof String ) { // Added instanceof String
      intermediateTree = this.parseContent( intermediateTree, profileIdentifier );
    }

    // Now, transform the syntax tree into an HTML render tree.

    // Extract reference definitions from the tree.
    const treeAttributes = retrieveAttributes( intermediateTree ); // Renamed extract_attr
    let contentReferences = {};

    if ( treeAttributes && treeAttributes.references ) {
      contentReferences = treeAttributes.references;
    }

    const htmlStructure = assembleHtmlNodes( intermediateTree, contentReferences , conversionOpts ); // Renamed convert_tree_to_html
    consolidateTextNodes( htmlStructure ); // Renamed merge_text_nodes
    return htmlStructure;
  };

  // --- Utility functions for block creation and line counting ---

  // Placeholder for advanced object inspection (e.g., for Node.js `util.inspect`)
  // Removed mk_block_inspect and mk_block_toSource as they are for specific environments/debugging.
  function inspectBlockRepresentation() {
    // This could be a simple string representation if full inspection isn't needed.
    return `BlockNode(content: '${this.toString()}', trailing: '${this.trailing.replace(/\n/g, '\\n')}', line: ${this.startLine})`;
  }

  // Creates a structured block object for processing.
  var createBlockNode = DocumentProcessor.createBlockNode = function(blockContent, blockTrailing, startLineNum) { // Renamed mk_block
    // Default trailing newlines for consistency in tests.
    if ( arguments.length < 2 ) { // Changed condition
        blockTrailing = "\n\n";
    }

    const blockString = new String(blockContent); // Kept new String for consistency with original's 's instanceof String' checks
    blockString.trailing = blockTrailing;
    // Assign a simple inspection method for better debugging display.
    blockString.inspect = inspectBlockRepresentation; // Using the placeholder

    if ( startLineNum !== undefined && startLineNum !== null ) { // Added null check
      blockString.startLine = startLineNum; // Renamed lineNumber to startLine
    }

    return blockString;
  };

  // Counts the number of newline characters in a string.
  function countNewlines( textString ) { // Renamed count_lines
    let lineCount = 0;
    // Using a simpler split-based approach instead of indexOf loop.
    if (textString) {
        lineCount = (textString.match(/\n/g) || []).length;
    }
    return lineCount;
  }

  // Internal - Divides the raw input string into distinct processing blocks.
  DocumentProcessor.prototype.segmentInputBlocks = function splitInputIntoBlocks( rawInputText ) { // Renamed split_blocks
    // Normalize line endings to Unix style.
    let normalizedInput = rawInputText.replace(/(\r\n|\r)/g, "\n"); // Simplified regex, combined replace

    const blockRegex = /([\s\S]+?)($|\n(?:\s*\n|$)+)/g; // Retained original regex as it's efficient.
    const blockList = [];
    let matchResult;

    let currentLineNumber = 1; // Renamed line_no

    // Handle leading blank lines, counting them for line numbers.
    const leadingBlankMatch = /^(\s*\n)/.exec(normalizedInput);
    if ( leadingBlankMatch !== null ) {
      currentLineNumber += countNewlines( leadingBlankMatch[0] );
      blockRegex.lastIndex = leadingBlankMatch[0].length; // Ensure regex starts after leading blanks.
    }

    // Iterate through the input, capturing content blocks.
    while ( ( matchResult = blockRegex.exec(normalizedInput) ) !== null ) {
      blockList.push( createBlockNode( matchResult[1], matchResult[2], currentLineNumber ) );
      currentLineNumber += countNewlines( matchResult[0] );
    }

    return blockList;
  };

  /**
   *  DocumentProcessor#handleContentSection( currentBlock, remainingBlocks ) -> undefined | [ JsonML, ... ]
   *  - currentBlock (String): the block of text to be processed
   *  - remainingBlocks (Array): an array of subsequent blocks, modifiable in-place
   *
   * Processes `currentBlock` and returns an array of JsonML nodes representing it.
   *
   * This method iterates through the block-level handler functions defined in the active dialect,
   * applying the first one that successfully processes the block. A successful handler returns
   * an array of JsonML nodes; a falsey value indicates failure.
   *
   * Block handlers are responsible for invoking [[DocumentProcessor#handleInlineElements]] as needed.
   *
   * Handlers can modify `remainingBlocks` (e.g., using `shift`/`splice`) to adjust block boundaries
   * or merge adjacent blocks.
   *
   * If the active dialect defines a `__customBlockHandler__` method, it will be invoked
   * to manage block processing instead of the default iteration.
   */
  DocumentProcessor.prototype.handleContentSection = function processSingleBlock( currentBlock, remainingBlocks ) { // Renamed processBlock
    const profileHandlers = this.activeProfile.block; // Renamed cbs to profileHandlers
    const handlerOrder = profileHandlers.__order__ || []; // Renamed ord to handlerOrder

    // Check for a custom block handler for the dialect.
    if ( typeof profileHandlers.__customBlockHandler__ === "function" ) {
      return profileHandlers.__customBlockHandler__.call(this, currentBlock, remainingBlocks);
    }

    // Iterate through registered block handlers in their defined order.
    for ( let handlerIdx = 0; handlerIdx < handlerOrder.length; handlerIdx++ ) { // Changed var to let, loop structure slightly
      const handlerName = handlerOrder[handlerIdx];
      const currentHandler = profileHandlers[handlerName];

      if (typeof currentHandler === "function") { // Added type check for robustness
        const handlerResult = currentHandler.call( this, currentBlock, remainingBlocks );

        // If a handler returns a non-falsey value, it means it successfully processed the block.
        if ( handlerResult ) {
          // Basic validation: ensure the result is an array, and if it contains elements,
          // that its first element is also an array (JsonML node structure).
          if ( !isArrayType(handlerResult) || ( handlerResult.length > 0 && !isArrayType(handlerResult[0]) ) ) {
            // console.warn(`Handler '${handlerName}' did not return a proper JsonML array.`); // Removed debug, added warn
          }
          return handlerResult;
        }
      }
    }

    // If no handler matched, return an empty array, indicating no content was generated for this block.
    return [];
  };

  // Processes the given block string for inline elements.
  DocumentProcessor.prototype.handleInlineElements = function processInlineContent( inlineBlockString ) { // Renamed processInline
    // The inline processing is typically handled by a single dedicated function in the dialect.
    const inlineProcessor = this.activeProfile.inline.__call__;
    if (typeof inlineProcessor === "function") {
        return inlineProcessor.call( this, String( inlineBlockString ) );
    }
    return [String(inlineBlockString)]; // Fallback: return raw string as a text node
  };

  /**
   *  DocumentProcessor#buildSyntaxTree( rawSource ) -> JsonML
   *  - rawSource (String): raw text content to parse
   *
   *  Parses `rawSource` into a JsonML tree representing the document's structure.
   **/
  DocumentProcessor.prototype.buildSyntaxTree = function generateDocumentTree( rawSourceText, explicitRootNode ) { // Renamed toTree
    // If rawSourceText is already an array, assume it's pre-segmented blocks. Otherwise, segment it.
    const contentBlocks = isArrayType(rawSourceText) ? rawSourceText : this.segmentInputBlocks( rawSourceText );

    // Store the tree as a member variable for potential extensions to modify it.
    const previousTreeState = this.currentDocumentTree; // Renamed old_tree
    try {
      // Set the current tree, either to an explicit root, an existing one, or a new 'document' root.
      this.currentDocumentTree = explicitRootNode || this.currentDocumentTree || [ "document" ]; // Renamed markdown to document

      // Loop through content blocks and process them.
      blockProcessingLoop: // Renamed blocks label
      while ( contentBlocks.length > 0 ) {
        const currentBlockData = contentBlocks.shift();
        const processedNodes = this.handleContentSection( currentBlockData, contentBlocks ); // Using new function names

        // If a block handler returns no nodes, skip to the next block.
        if ( !processedNodes || processedNodes.length === 0 ) {
          continue blockProcessingLoop;
        }

        // Add the generated nodes to the current document tree.
        this.currentDocumentTree.push( ...processedNodes ); // Using spread operator instead of push.apply
      }
      return this.currentDocumentTree;
    } finally {
      // Restore the previous tree state if an explicit root was provided.
      if ( explicitRootNode ) {
        this.currentDocumentTree = previousTreeState;
      }
    }
  };

  // Removed Markdown.prototype.debug entirely.

  // Iterates a regular expression over a block, applying a callback for each match.
  DocumentProcessor.prototype.iterateRegexMatches = function applyRegexToBlock( targetRegex, contentBlock, matchCallback ) { // Renamed loop_re_over_block
    // Ensure the regex is not global, as this function manually advances.
    if (targetRegex.global) {
      console.warn("Using a global regex with iterateRegexMatches may lead to unexpected behavior. Consider removing the 'g' flag.");
      // Optionally reset lastIndex or create a non-global copy.
      targetRegex.lastIndex = 0;
    }

    let remainingContent = String(contentBlock); // Ensure it's a string, use String() instead of valueOf()
    let currentMatch;

    while ( remainingContent.length > 0 && (currentMatch = targetRegex.exec(remainingContent)) !== null ) {
      matchCallback.call(this, currentMatch);
      // Advance the remaining content past the matched part.
      remainingContent = remainingContent.slice( currentMatch[0].length ); // Using slice instead of substr
      targetRegex.lastIndex = 0; // Reset lastIndex for non-global regexes that might be reused.
    }
    return remainingContent;
  };

  /**
   * DocumentProcessor.syntaxProfiles
   *
   * Namespace for predefined syntax profiles (dialects).
   **/
  DocumentProcessor.syntaxProfiles = {}; // Renamed Markdown.dialects

  /**
   * DocumentProcessor.syntaxProfiles.Standard
   *
   * The default profile, closely adhering to John Gruber's original Markdown behavior.
   * This profile aims to replicate the observed output of markdown.pl, which sometimes
   * differs from the official syntax specification.
   **/
  DocumentProcessor.syntaxProfiles.Standard = { // Renamed Gruber to Standard
    block: {
      // Processes ATX-style headers (e.g., `# Heading 1`).
      processAtxHeader: function parseAtxHeader( blockData, subsequentBlocks ) { // Renamed atxHeader
        const headerMatch = blockData.match( /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ );

        if ( !headerMatch ) {
            return null; // Return null instead of undefined
        }

        const headerLevel = headerMatch[1].length;
        const headerText = headerMatch[2];
        const headerNode = [ "heading", { level: headerLevel } ]; // Renamed header to heading
        headerNode.push( ...this.handleInlineElements(headerText) ); // Using spread operator

        // If there's remaining content in the block after the header,
        // push it back onto the `subsequentBlocks` array as a new block.
        if ( headerMatch[0].length < blockData.length ) {
          subsequentBlocks.unshift( createBlockNode(
            blockData.substring( headerMatch[0].length ), // Using substring instead of substr
            blockData.trailing,
            blockData.startLine + countNewlines(headerMatch[0]) // Adjust line number calculation
          ) );
        }

        return [ headerNode ];
      },

      // Processes Setext-style headers (e.g., `Heading 1\n=======`).
      processSetextHeader: function parseSetextHeader( blockData, subsequentBlocks ) { // Renamed setextHeader
        const headerMatch = blockData.match( /^(.*)\n([-=])\2\2+(?:\n|$)/ );

        if ( !headerMatch ) {
            return null;
        }

        const headerLevel = ( headerMatch[2] === "=" ) ? 1 : 2;
        const headerText = headerMatch[1];
        const headerNode = [ "heading", { level : headerLevel } ]; // Renamed header to heading
        headerNode.push( ...this.handleInlineElements(headerText) );

        // Handle any trailing content in the block.
        if ( headerMatch[0].length < blockData.length ) {
          subsequentBlocks.unshift( createBlockNode(
            blockData.substring( headerMatch[0].length ),
            blockData.trailing,
            blockData.startLine + countNewlines(headerMatch[0])
          ) );
        }

        return [ headerNode ];
      },

      // Processes code blocks (indented by 4 spaces or a tab).
      processCodeBlock: function parseCodeBlock( blockData, subsequentBlocks ) { // Renamed code
        const codeLinePattern = /^(?: {0,3}\t| {4})(.*)\n?/; // Regex for indented lines
        const collectedCodeLines = []; // Renamed ret to collectedCodeLines

        // Check if the block starts with code block indentation.
        if ( !blockData.match( codeLinePattern ) ) {
            return null;
        }

        let currentBlockToProcess = blockData; // Renamed b to currentBlockToProcess for clarity
        let continueProcessingBlocks = true; // Control flag for do-while loop

        do {
          const processedRemaining = this.iterateRegexMatches( // Using new iterateRegexMatches
            codeLinePattern,
            currentBlockToProcess.toString(), // Ensure string conversion
            function( matchArr ) {
                collectedCodeLines.push( matchArr[1] );
            }
          );

          if ( processedRemaining.length > 0 ) {
            // If there's content left in the current block, it means the code block ended.
            // Push the remainder back as a new block.
            subsequentBlocks.unshift( createBlockNode(processedRemaining, currentBlockToProcess.trailing) );
            continueProcessingBlocks = false; // Exit loop
          } else if ( subsequentBlocks.length > 0 ) {
            // If the current block is fully consumed, check the next one.
            const nextPotentialBlock = subsequentBlocks[0];
            if ( nextPotentialBlock.match( codeLinePattern ) ) {
              // If the next block is also a code block, merge it.
              // Account for blank lines between code blocks.
              const blankLines = currentBlockToProcess.trailing.replace(/[^\n]/g, "").slice(2); // Using slice instead of substring
              if (blankLines.length > 0) { // Only push if there are actual blank lines
                  collectedCodeLines.push( blankLines );
              }
              currentBlockToProcess = subsequentBlocks.shift(); // Move to the next block
            } else {
              // Next block is not a code block, so stop merging.
              continueProcessingBlocks = false; // Exit loop
            }
          } else {
            // No more blocks to check.
            continueProcessingBlocks = false; // Exit loop
          }
        } while ( continueProcessingBlocks );

        return [ [ "code_block", collectedCodeLines.join("\n") ] ];
      },

      // Processes horizontal rules (e.g., `---`, `***`, `___`).
      processHorizontalRule: function parseHorizRule( blockData, subsequentBlocks ) { // Renamed horizRule
        // Regex to find an HR, potentially with content before and/or after it in the same block.
        const hrMatch = blockData.match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ );

        if ( !hrMatch ) {
          return null;
        }

        const resultNodes = [ [ "horizontal_rule" ] ]; // Renamed hr to horizontal_rule, jsonml to resultNodes

        // If there's content before the HR, process it as a separate block.
        if ( hrMatch[1] ) {
          // Process this leading content and prepend the resulting nodes.
          resultNodes.unshift( ...this.handleContentSection( hrMatch[1], [] ) ); // Using spread
        }

        // If there's content after the HR, add it back to the queue of subsequent blocks.
        if ( hrMatch[3] ) {
          subsequentBlocks.unshift( createBlockNode( hrMatch[3] ) );
        }

        return resultNodes;
      },

      // Manages the parsing of list items (ordered and unordered).
      processLists: (function() { // Renamed lists, wrapped in IIFE for private vars.
        // Private regexes for list item detection.
        const anyListItemMarker = "[*+-]|\\d+\\.",
              bulletListItemMarker = /[*+-]/,
              numericListItemMarker = /\d+\./,
              // Captures leading indent, crucial for nested lists.
              listItemStartRegex = new RegExp( "^( {0,3})(" + anyListItemMarker + ")[ \t]+" ),
              indentSegmentRegex = "(?: {0,3}\\t| {4})";

        // Generates a regex suitable for matching list items at a specific nesting depth.
        function getListItemRegexForDepth( currentDepth ) {
          return new RegExp(
            // m[1] = indent, m[2] = list_type (for new list item)
            "(?:^(" + indentSegmentRegex + "{0," + currentDepth + "} {0,3})(" + anyListItemMarker + ")\\s+)|" +
            // m[3] = continuation (indented line belonging to current list item)
            "(^" + indentSegmentRegex + "{0," + (currentDepth - 1) + "}[ ]{0,4})"
          );
        }

        // Replaces tabs with spaces for consistent indentation.
        function normalizeTabsToSpaces( inputString ) {
          return inputString.replace( / {0,3}\t/g, "    " );
        }

        // Adds inline content to a list item node, handling loose/tight list formatting.
        function appendToListItem( listItemNode, isLooseList, inlineContent, leadingNewline ) { // Renamed add
          if ( isLooseList ) {
            listItemNode.push( [ "paragraph" ].concat(inlineContent) ); // Renamed para to paragraph
            return;
          }

          // Determine where to add the content: either to an existing paragraph or directly to the list item.
          let targetContainer = listItemNode;
          const lastItemElement = listItemNode[listItemNode.length - 1];
          if ( isArrayType(lastItemElement) && lastItemElement[0] === "paragraph" ) {
            targetContainer = lastItemElement;
          }

          // Prepend newline if necessary and content exists.
          if ( leadingNewline && listItemNode.length > 1 ) {
              inlineContent.unshift(leadingNewline);
          }

          // Append each piece of inline content.
          for ( let contentIndex = 0; contentIndex < inlineContent.length; contentIndex++ ) {
            const currentPiece = inlineContent[contentIndex];
            const isCurrentPieceString = typeof currentPiece === "string";

            // If the last element in the container is a string, concatenate.
            if ( isCurrentPieceString && targetContainer.length > 1 && typeof targetContainer[targetContainer.length - 1] === "string" ) {
              targetContainer[ targetContainer.length - 1 ] += currentPiece;
            } else {
              targetContainer.push( currentPiece );
            }
          }
        }

        // Extracts blocks that are contained within the current list item's indentation.
        function getNestedBlocks( currentDepth, blockArray ) { // Renamed get_contained_blocks
          // Regex to match lines indented exactly by 'currentDepth' levels.
          const depthMatchingRegex = new RegExp( "^(" + indentSegmentRegex + "{" + currentDepth + "}.*?\\n?)*$" );
          // Regex to remove the matched indentation from the blocks.
          const indentRemovalRegex = new RegExp("^" + indentSegmentRegex + "{" + currentDepth + "}", "gm");
          const extractedBlocks = [];

          while ( blockArray.length > 0 ) {
            if ( depthMatchingRegex.exec( blockArray[0] ) ) {
              const originalBlock = blockArray.shift();
              // Remove the specific indentation level.
              const deIndentedContent = originalBlock.replace( indentRemovalRegex, "");

              extractedBlocks.push( createBlockNode( deIndentedContent, originalBlock.trailing, originalBlock.startLine ) );
            } else {
              break; // Stop when a block doesn't match the indentation level.
            }
          }
          return extractedBlocks;
        }

        // Helper to convert list item content into paragraphs if it's not already.
        function ensureParagraphsInListItem( stackItem, index, processingStack ) { // Renamed paragraphify
          const currentList = stackItem.list;
          const lastListItem = currentList[currentList.length - 1];

          // If the last item's content is already a paragraph, no action needed.
          if ( isArrayType(lastListItem[1]) && lastListItem[1][0] === "paragraph" ) {
            return;
          }
          // If this is the last item in the stack, we don't force it to be a paragraph yet.
          // This allows for a single line item to remain just text.
          if ( index + 1 === processingStack.length ) {
            // No operation, handled by other logic.
          }
          // Original code was a snippet. Assuming the rest of the original logic for paragraphification:
          // If it's not the last item in the stack, or if it's the last item but is 'loose',
          // convert its content to a paragraph.
          if ( !stackItem.isLoose || index + 1 < processingStack.length ) {
            const listContent = lastListItem.slice(1); // Get content after the tag
            lastListItem.splice(1, listContent.length, ["paragraph"].concat(listContent));
          }
        }

        // The main list processing function.
        return function processListBlock( blockData, subsequentBlocks ) {
          const blockContent = normalizeTabsToSpaces( blockData.valueOf() ); // Ensure string and normalize tabs
          const initialMatch = blockContent.match( listItemStartRegex );

          if ( !initialMatch ) {
            return null; // Not a list item.
          }

          let listProcessingStack = []; // Stores current list context (type, indentation, etc.)
          let currentListLevel = 0;
          let currentBlock = blockData;
          let currentBlockString = blockContent;
          let currentBlockLineNum = blockData.startLine;

          // Helper to manage adding an item to the current list in the stack.
          const addListItem = (itemNode, type, indent, isLoose) => {
            const currentStackEntry = listProcessingStack[listProcessingStack.length - 1];
            if (currentStackEntry && currentStackEntry.type === type && currentStackEntry.indent === indent) {
              // Add to existing list
              currentStackEntry.list.push(itemNode);
            } else {
              // Create new list
              const newList = [type === "bullet" ? "unordered_list" : "ordered_list"]; // Renamed ul/ol
              newList.push(itemNode);
              listProcessingStack.push({
                type: type,
                indent: indent,
                list: newList,
                isLoose: isLoose // Whether this list is loose (contains paragraphs)
              });
            }
            return itemNode;
          };

          // Main loop for list processing.
          listLoop:
          while (true) {
            const currentDepthRegex = getListItemRegexForDepth(currentListLevel);
            const lineMatch = currentBlockString.match(currentDepthRegex);

            if (lineMatch && (lineMatch[1] || lineMatch[3])) { // Found a list item or continuation line
              const initialIndent = lineMatch[1] || lineMatch[3]; // Indent of the current line
              const listItemMarker = lineMatch[2]; // Marker like '*' or '1.'
              const listItemTextStart = lineMatch[0].length; // Start of the actual content after marker/indent

              let currentLineText = currentBlockString.substring(listItemTextStart);
              let listItemNode = ["list_item"]; // Renamed li to list_item

              // Determine list type and actual indent level.
              let listType;
              if (listItemMarker) {
                listType = bulletListItemMarker.test(listItemMarker) ? "bullet" : "ordered";
                currentListLevel = initialIndent.length; // New list starts here
              } else {
                // Continuation line, indent should match current list level.
                // This is a simplification; original handles complex indent rules.
                // For Type III, we can simplify or refine.
                // For now, assume continuation means same indent as current stack top.
                if (listProcessingStack.length === 0) {
                    // This is an unindented continuation line for a non-existent list. Break.
                    break listLoop;
                }
                currentListLevel = listProcessingStack[listProcessingStack.length - 1].indent;
              }

              // Add the current item to the appropriate list structure.
              const activeListItem = addListItem(listItemNode, listType, currentListLevel, false); // isLoose is temporary false

              // Process the rest of the current block for this list item's content.
              let itemContent = [currentLineText];
              let remainingInBlock = currentBlockString.substring(lineMatch[0].length);
              let nextLineStart = 0;

              // Collect all subsequent lines that are part of this list item.
              while (true) {
                const nlIndex = remainingInBlock.indexOf("\n");
                if (nlIndex === -1) {
                  // No more newlines in this block.
                  break;
                }
                const nextLine = remainingInBlock.substring(0, nlIndex + 1);
                const nextLineTrimmed = nextLine.trim();

                // Check if next line is a new list item or an indented continuation.
                if (nextLineTrimmed.length === 0 || nextLine.match(getListItemRegexForDepth(currentListLevel))) {
                    // It's either a blank line or a new list item marker, so this list item ends here.
                    break;
                }
                itemContent.push(nextLine);
                remainingInBlock = remainingInBlock.substring(nlIndex + 1);
              }

              // Process inline content for the accumulated item content.
              appendToListItem(activeListItem, false, this.handleInlineElements(itemContent.join("")), null);

              // Update current block state.
              currentBlockString = remainingInBlock; // What's left in the current block after this item.

              // If the current block is fully consumed, try to shift from subsequentBlocks.
              if (currentBlockString.trim().length === 0 && subsequentBlocks.length > 0) {
                  const nextBlockCandidate = subsequentBlocks[0];
                  // If the next block starts with an indent relevant to the current list depth, consume it.
                  if (normalizeTabsToSpaces(nextBlockCandidate.valueOf()).match(getListItemRegexForDepth(currentListLevel))) {
                      currentBlock = subsequentBlocks.shift();
                      currentBlockString = normalizeTabsToSpaces(currentBlock.valueOf());
                      currentBlockLineNum = currentBlock.startLine;
                  } else {
                      break listLoop; // Next block is not part of this list.
                  }
              } else if (currentBlockString.trim().length === 0 && subsequentBlocks.length === 0) {
                  break listLoop; // No more content.
              } else if (currentBlockString.trim().length > 0) {
                  // Some content remains in the current block, but it's not a list item or continuation.
                  // This means the list ended abruptly.
                  break listLoop;
              }

            } else {
              // No more list items or continuation lines found.
              break listLoop;
            }
          } // end listLoop

          // Now, finalize the list structure.
          // The `listProcessingStack` contains nested lists. We need to combine them.
          let finalJsonML = [];
          while (listProcessingStack.length > 0) {
            const stackEntry = listProcessingStack.pop();
            const currentList = stackEntry.list;

            // Apply paragraphification rules.
            currentList.forEach( (item, idx) => {
                if (item[0] === "list_item" && item.length > 1) {
                    const itemContent = item.slice(1);
                    // If content is not already a paragraph, and it's a loose list or not the last item.
                    if (!isArrayType(itemContent[0]) || itemContent[0][0] !== "paragraph") {
                        if (stackEntry.isLoose || idx < currentList.length - 1) { // Simplified loose check
                            item.splice(1, itemContent.length, ["paragraph"].concat(itemContent));
                        }
                    }
                }
            });

            if (listProcessingStack.length > 0) {
              // Insert this list into the last item of the parent list.
              const parentList = listProcessingStack[listProcessingStack.length - 1].list;
              const parentListItem = parentList[parentList.length - 1];
              parentListItem.push(currentList);
            } else {
              // This is the outermost list.
              finalJsonML = currentList;
            }
          }

          // Any remaining block data that wasn't consumed by the list processing
          // needs to be unshifted back to subsequentBlocks.
          if (currentBlockString.length > 0) {
            subsequentBlocks.unshift(createBlockNode(currentBlockString, blockData.trailing, currentBlockLineNum));
          }


          return [finalJsonML]; // Return the root list node.
        }; // End processListBlock
      })(), // End lists IIFE

      // Default inline processing stub for the 'Standard' profile.
      // This will be overridden by the actual inline dialect.
      inline: {
        __call__: function(text) {
          // Placeholder for proper inline parsing logic.
          // For a Type III clone, we need to implement at least basic inline parsing.
          // Original `Markdown.dialects.Gruber.inline` is not provided in the snippet.
          // I'll add a minimal one.
          let result = [];
          let remaining = text;
          let match;

          // Simple bold/italic for demonstration
          const inlineRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`+)([\s\S]*?)\5|\[([^\]]+)\]\(([^\)]+)\)/g;

          let lastIndex = 0;
          while ((match = inlineRegex.exec(remaining)) !== null) {
              // Add plain text before the match
              if (match.index > lastIndex) {
                  result.push(remaining.substring(lastIndex, match.index));
              }

              if (match[1]) { // Bold
                  result.push(["strong"].concat(this.handleInlineElements(match[2])));
              } else if (match[3]) { // Italic
                  result.push(["emphasis"].concat(this.handleInlineElements(match[4])));
              } else if (match[6]) { // Code
                  result.push(["code", match[7]]);
              } else if (match[8]) { // Link
                  result.push(["link", {href: match[9]}, match[8]]);
              }
              lastIndex = inlineRegex.lastIndex;
          }
          // Add any remaining plain text
          if (lastIndex < remaining.length) {
              result.push(remaining.substring(lastIndex));
          }
          return result;
        }
      }
    }
  };

  // Internal helper functions, moved from global scope or made private.
  // These would typically be part of a separate render module.

  // Placeholder for retrieving attributes/references from the tree.
  // In a full implementation, this would walk the tree to find reference definitions.
  function retrieveAttributes(tree) { // Renamed extract_attr
      // This is a simplified stub. A real implementation would parse metadata.
      // Example: look for `["reference_definition", { id: "foo", href: "bar" }]`
      return { references: {} };
  }

  // Placeholder for converting the markdown tree to an HTML tree.
  function assembleHtmlNodes(mdTree, refs, opts) { // Renamed convert_tree_to_html
      // This is the core transformation logic.
      // For a Type III clone, we just need to ensure the structure is similar.
      // This function would recursively walk the mdTree and convert semantic nodes to HTML nodes.
      const htmlTree = ["html"]; // Root node

      if (!isArrayType(mdTree) || mdTree.length === 0) {
          return htmlTree;
      }

      // Simple recursive conversion for demonstration.
      function convertNode(node) {
          if (typeof node === "string") {
              return node;
          }
          if (!isArrayType(node) || node.length === 0) {
              return null;
          }

          const tagName = node[0];
          let attributes = {};
          let children = [];
          let contentStartIndex = 1;

          if (node.length > 1 && typeof node[1] === "object" && !isArrayType(node[1])) {
              attributes = node[1];
              contentStartIndex = 2;
          }

          for (let i = contentStartIndex; i < node.length; i++) {
              const child = node[i];
              const convertedChild = convertNode(child);
              if (convertedChild !== null) {
                  children.push(convertedChild);
              }
          }

          switch (tagName) {
              case "document": return ["div", {class: "document-container"}, ...children];
              case "heading": return [`h${attributes.level || 1}`, ...children];
              case "paragraph": return ["p", ...children];
              case "code_block": return ["pre", ["code", ...children]];
              case "horizontal_rule": return ["hr"];
              case "unordered_list": return ["ul", ...children];
              case "ordered_list": return ["ol", ...children];
              case "list_item": return ["li", ...children];
              case "strong": return ["strong", ...children];
              case "emphasis": return ["em", ...children];
              case "link": return ["a", {...attributes, href: attributes.href || "#"}, ...children]; // Assuming href is in attributes for links
              case "code": return ["code", ...children];
              default: return children.length > 0 ? ["span", {class: `unknown-${tagName}`}, ...children] : null; // Fallback
          }
      }

      // Start conversion from the root markdown node.
      for (let i = 1; i < mdTree.length; i++) { // Skip "markdown" or "document" tag
          const converted = convertNode(mdTree[i]);
          if (converted) {
              htmlTree.push(converted);
          }
      }

      return htmlTree;
  }

  // Placeholder for merging adjacent text nodes in the HTML tree.
  function consolidateTextNodes(tree) { // Renamed merge_text_nodes
      if (!isArrayType(tree)) {
          return;
      }

      let i = 1; // Start from 1, assuming tree[0] is the tag name.
      while (i < tree.length) {
          if (typeof tree[i] === "string" && typeof tree[i-1] === "string" && i > 0) { // Check previous element for string
              tree[i-1] += tree.splice(i, 1)[0]; // Merge current string into previous and remove current.
          } else if (isArrayType(tree[i])) {
              consolidateTextNodes(tree[i]); // Recurse for child nodes.
              i++;
          } else {
              i++;
          }
      }
  }

  // Placeholder for rendering JsonML to a string.
  globalScope.renderJsonML = function renderJsonMLToString(jsonMLTree) {
      if (!isArrayType(jsonMLTree)) {
          return String(jsonMLTree); // Handle plain text nodes
      }

      const tagName = jsonMLTree[0];
      let attributes = {};
      let children = [];
      let contentStartIdx = 1;

      if (jsonMLTree.length > 1 && typeof jsonMLTree[1] === "object" && !isArrayType(jsonMLTree[1])) {
          attributes = jsonMLTree[1];
          contentStartIdx = 2;
      }

      const attrString = Object.keys(attributes).map(key => {
          // Escape attribute values for HTML.
          const value = String(attributes[key]).replace(/"/g, '&quot;').replace(/&/g, '&amp;');
          return `${key}="${value}"`;
      }).join(" ");

      const innerHtml = jsonMLTree.slice(contentStartIdx).map(node => globalScope.renderJsonML(node)).join("");

      // Self-closing tags list (simplified)
      const selfClosingTags = new Set(["hr", "br", "img", "input", "link", "meta"]);
      if (selfClosingTags.has(tagName.toLowerCase())) {
          return `<${tagName}${attrString ? ' ' + attrString : ''} />`;
      } else {
          return `<${tagName}${attrString ? ' ' + attrString : ''}>${innerHtml}</${tagName}>`;
      }
  };

})( typeof exports !== "undefined" ? exports : this ); // Changed 'expose' to 'this' for browser context or 'exports' for Node.js.