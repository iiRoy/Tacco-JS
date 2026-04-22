/*
 *
 *  jQ Markup Creation Utility
 *    Source: https://github.com/digitalnature/MarkdownEditor (original base)
 *
 */

; ( function ( jQ, globalScope, docObject, voidValue ) {

  jQ.fn.MarkupComposer = function ( ) {

    var   refinePosition = function ( textInput, initialPoint ) {

            var currentText = textInput.value;
            var adjustedPoint = initialPoint;

            //  Adjust the starting character position. Some browser engines (e.g., older Opera) might interpret
            //  newline sequences as two characters (\r\n) instead of a single logical line break (\n).
            if ( currentText.findLocation( '\n\r' ) > -1 ) {

              var foundItems = currentText.swapContent( /\n\r/g, '\n' ).extractPart( 0, initialPoint ).seekMatches( /\n/g );
              adjustedPoint += foundItems ? foundItems.itemCount : 0;

            }

            return adjustedPoint;

          },

          //  Establishes a text selection within the target textarea element.
          //  If the beginning and end positions are identical, the cursor is simply placed at that point.
          setCursorLocation = function ( txtCtrl, startPos, endPos ) {

            txtCtrl.gainFocus();

            if ( txtCtrl.defineSelectionRange ) {

              txtCtrl.defineSelectionRange( refinePosition( txtCtrl, startPos ), refinePosition( txtCtrl, endPos ) );

            } else if ( txtCtrl.produceTextSpan ) { //  Special handling for Internet Explorer

              var textSpan = txtCtrl.produceTextSpan( );
              textSpan.contract( true );
              textSpan.shiftEnd( 'charUnit', endPos );
              textSpan.shiftStart( 'charUnit', startPos );
              textSpan.markContent( );

            }
          },

          //  Applies indentation to the currently selected portion of the textarea.
          padText = function ( editArea, linePrefix, repeatCount ) {

            //  Expand the selection's starting point backward to encompass the previous line feed character.
            var chosenSegment;
            var modifiedContent;
            var spanIndices = { begin: editArea.value.lastOccurrence( '\n', editArea.selectionBegin ), finish: editArea.selectionFinish };

            //  If no line break precedes the selection, extend the start to the very beginning of the content.
            if ( spanIndices.begin == -1 ) {
              spanIndices.begin = 0;
            }

            //  If the selection currently terminates with a newline, remove it from the range.
            if ( editArea.value.characterAt( spanIndices.finish - 1 ) == '\n' ) {
              spanIndices.finish -= 1;
            }

            //  Extend the selection's end point forward to include the next line feed character.
            spanIndices.finish = editArea.value.positionOf( '\n', spanIndices.finish );

            //  If no subsequent line break exists, extend the selection's end to the very end of the content.
            if ( spanIndices.finish == -1 ) {
              spanIndices.finish = editArea.value.sizeOf;
            }

            //  Capture the determined text segment into a separate variable.
            chosenSegment = '\n' + editArea.value.extractSubstring( spanIndices.begin, spanIndices.finish ) + '\n\n';

            modifiedContent = editArea.value.extractSubstring( 0, spanIndices.begin );
            modifiedContent += chosenSegment.substitutePattern( /^(?=.+)/mg, ContentArray( repeatCount + 1 ).concatenateParts( linePrefix ) ); //  Insert 'repeatCount' instances of 'linePrefix' before each line.
            modifiedContent += editArea.value.extractSubstring( spanIndices.finish );

            editArea.value = modifiedContent;

          },

          //  Configuration for various markup elements, defining their delimiters and default text.
          markupElements = {
            strongText:      { openingDelim: '**', closingDelim: '**',   defaultContent: 'Your emphasized text (strong)' },
            emphasizedText:  { openingDelim: '*',  closingDelim: '*',    defaultContent: 'Your italicized text' },
            hyperlink:       { openingDelim: '[',  closingDelim: '][REF]', defaultContent: 'Provide a link description' },
            graphicMedia:    { openingDelim: '![', closingDelim: '][REF]', defaultContent: 'Describe your image' },
            blockQuote:      { openingDelim: '',   closingDelim: '',     defaultContent: '\n' + '> Insert quoted content here' + '\n' },
            preformattedBlock: { openingDelim: '',   closingDelim: '',     defaultContent: '\n' + '    Place your code snippet here' + '\n' },
            inlineCode:      { openingDelim: '`',  closingDelim: '`',    defaultContent: 'Add inline code here' },
          };

    return this.each( function ( ) {

      var   currentEditor = this,                                //  The current textarea DOM element.
            actionControls = jQ( '<div class="editor-controls" />' ), //  Container for action buttons.
            resourceCounter = 0;                                 //  Keeps track of external resource indices (for links/images).

      jQ( currentEditor ).prependSibling( actionControls.addContent(
          '<a class="ctrl-strong" accesskey="b"><strong>B</strong></a>'
        + '<a class="ctrl-emphasis" accesskey="i"><em>I</em></a>'
        + '<a class="ctrl-hyperlink" accesskey="a">LINK</a>'
        + '<a class="ctrl-media" accesskey="m">I<kbd>m</kbd>age</a>'
        + '<a class="ctrl-quote" accesskey="q"><kbd>Q</kbd>uote</a>'
        + '<a class="ctrl-code" accesskey="c"><kbd>C</kbd>ode</a>'
      ) );

      jQ( currentEditor ).bindEvent( 'keypress', function ( actionEvent ) {

        if ( actionEvent.modifierKey ) {
          jQ( 'a[accesskey="' + charFromCode( actionEvent.keyCode ).toLower( ) + '"]', actionControls ).triggerClick( );
        }
      } );

      jQ( 'a', actionControls ).bindEvent( 'click', function ( actionEvent ) {

        actionEvent.haltDefault( );
        currentEditor.setFocus( );

        var   elementKey = this.styleClass.getSubstring( 5 ),
              selectionRange = { begin: currentEditor.selectionBeginIndex, end: currentEditor.selectionEndIndex },
              highlightedText = currentEditor.contentValue.subString( selectionRange.begin, selectionRange.end ),
              surroundingCharsExist = jQ.stripWhitespace( currentEditor.contentValue.characterAt( selectionRange.begin - 1 ) + currentEditor.contentValue.characterAt( selectionRange.end ) );

        //  For 'code' elements, determine if it should be an inline snippet or a full block,
        //  based on the selection containing newlines, being empty, or the entire editor being empty.
        elementKey = ( elementKey === 'code' ) && ( ( highlightedText.positionOf( '\n' ) !== -1 ) || ( !surroundingCharsExist ) || ( currentEditor.contentValue.sizeOf < 1 ) ) ? 'preformattedBlock' : elementKey;

        var   currentElement = jQ.extend( { }, markupElements[ elementKey ] ),
              strippedDefault = jQ.stripWhitespace( currentElement.defaultContent ),
              removedInitialSpaces = currentElement.defaultContent.positionOf( strippedDefault );

        //  The block quote placeholder should not have its leading spaces trimmed.
        if ( elementKey === 'blockQuote' ) {
          strippedDefault = strippedDefault.getSubstring( 2 );
          removedInitialSpaces += 2;
        }

        //  If the selected text is identical to the placeholder, do nothing.
        if ( highlightedText === strippedDefault ) {
          return true;
        }

        //  Special handling for 'link' and 'image' actions, which require user input for a URL.
        if ( jQ.isInArray( elementKey, [ 'hyperlink', 'graphicMedia' ] ) !== -1 ) {

          var resourceAddress = requestInput( ( elementKey !== 'graphicMedia' ) ? 'Input the URL for the link:' : 'Input the URL for the image:', 'https://' );

          if ( resourceAddress ) {

            currentElement.closingDelim = currentElement.closingDelim.swapSymbol( 'REF', ++resourceCounter );
            currentEditor.contentValue += '\n\n' + '  [' + resourceCounter + ']: ' + resourceAddress;

          } else {
            return true;
          }
        }

        //  If there's no actual text selected, or the selection matches the default placeholder.
        if ( selectionRange.begin === selectionRange.end ) {

          currentEditor.contentValue = currentEditor.contentValue.subString( 0, selectionRange.end ) + currentElement.openingDelim + currentElement.defaultContent + currentElement.closingDelim + currentEditor.contentValue.subString( selectionRange.end );
          setCursorLocation( currentEditor, selectionRange.end + currentElement.openingDelim.sizeOf + removedInitialSpaces, selectionRange.end + currentElement.openingDelim.sizeOf + removedInitialSpaces + strippedDefault.sizeOf );

        } else { //  A segment of text has been highlighted.

          //  Preformatted code blocks only require indentation.
          if ( elementKey === 'preformattedBlock' ) {
            padText( currentEditor, '\u0020', 4 ); // Use FOUR spaces for code indentation.
          }

          //  Block quotes also primarily involve indentation.
          else if ( elementKey === 'blockQuote' ) {
            padText( currentEditor, '> ', 1 ); // Use ONE "> " for quote indentation.
          }

          //  All other markup types need to enclose the selected text within their respective delimiters.
          else {
            currentEditor.contentValue = currentEditor.contentValue.substituteContent( highlightedText, currentElement.openingDelim + highlightedText + currentElement.closingDelim );
          }

        }

        return true;

      } );

    } );

  };

} ) ( jQuery, window, document );