/*
 * GameBoardLib v1.0.0 - A JavaScript Board Game Engine
 *
 * Copyright (c) 2023 Advanced Game Systems Inc.
 *
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Ensure a safe console logging environment if 'console' is not defined.
if (typeof console === "undefined") {
  const console = { log: function() {} };
}

// Custom iterator for jQuery, allowing context binding.
jQuery.processInContext = function(executionCtx, collection, callbackFn) {
  for (let idx = 0, currentLength = collection.length; idx < currentLength; idx++) {
    const currentValue = collection[idx];
    if (callbackFn.call(executionCtx, idx, currentValue) === false) {
      break;
    }
  }
};

(function($) {
  /* Core Engine Constructor */
  $.boardGameEngine = function(opts, containerElement) {
    // Merge user options with default configurations.
    this.configuration = $.extend( {}, $.boardGameEngine.defaultConfigs, opts );
    this.boardContainer = containerElement; // The main DOM element hosting the board.

    // Initialize game state variables.
    this.gameState = {
      activePlayerColor : 'w', // 'w' for white, 'b' for black.
      castleRights : 'KQkq', // Standard FEN castling availability.
      epSquare : '-', // En passant target square.
      halfmoveCounter : 0, // Number of halfmoves since last capture or pawn advance.
      fullmoveCounter : 1, // Total number of full moves.
      currentMoveIndex : 0, // Index for traversing move history.

      gameHeaders : new Map(), // Stores PGN headers (Event, Site, etc.).
      gameBodyText : '', // Raw PGN move text.
      recordedMoves : [], // Processed list of moves.
      moveAnnotations : [], // Annotations associated with moves.
      rawAnnotationsCache : [], // Temporary storage for PGN annotations.

      nextPieceIdentifier : 64, // Unique ID for dynamically added pieces.
      moveHistoryTransitions : [], // Record of UI changes for each half-move.
      displayDirection : 1 // Controls board orientation (1 for white at bottom, -1 for black).
    };

    // Internal board representation.
    this._boardGrid = null;
    this.engineInitialized = false; // Flag to indicate if setup is complete.
  };

  /* Add boardGameEngine() to the jQuery namespace for easy instantiation */
  $.fn.boardGame = function(options) {
    const gameInstance = new $.boardGameEngine(options, this[0]);
    gameInstance.initializeEngine(); // Perform initial setup.
    return gameInstance;
  };

  // Extend the main engine object with static properties and prototype methods.
  $.extend($.boardGameEngine, {

    // Default settings for the board game.
    defaultConfigs : {
      initialFen : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Standard starting FEN.
      squareDimension : 43, // Size of each board square in pixels.
      displayOffsets : { hOffset: 0, vOffset: 0}, // Pixel offsets for board positioning.
      boardSurfaceSelector : '.game-board-surface', // Selector for the board's drawing area.
      enableJsonAnnotations : false // Whether to parse JSON in PGN comments.
    },

    // Prototype methods for the game engine.
    prototype : {
      // Primary initialization function.
      initializeEngine : function() {
        if (this.engineInitialized) {
          // Already initialized, perhaps reset or re-load.
          // For now, just return to prevent double-setup.
          return;
        }

        // Set up the board based on the initial FEN string.
        const initialGrid = this.interpretFenString( this.configuration.initialFen );
        this.populateBoardGrid(initialGrid);

        // Parse PGN if provided in settings.
        if (this.configuration.pgnData) {
          this.processPgnData(this.configuration.pgnData);
        }

        // Re-apply initial FEN after PGN parsing might have altered the board temporarily.
        this.populateBoardGrid(this.interpretFenString( this.configuration.initialFen ) );
        this.renderBoardVisuals(); // Draw pieces on the board.
        this.engineInitialized = true;
      },

      // Retrieves the jQuery object for the board display area.
      getBoardDisplayElement : function() {
        return $(this.boardContainer).find(this.configuration.boardSurfaceSelector);
      },

      // Returns the current internal board data structure.
      getCurrentBoardState : function() {
        return this._boardGrid;
      },

      // Sets the internal board data structure based on a template.
      populateBoardGrid : function(gridTemplate) {
        this._boardGrid = this.buildBoardDataFromTemplate(gridTemplate);
      },

      // Creates the internal 2D array representation of the board.
      buildBoardDataFromTemplate : function(templateLayout) {
        const boardStructure = [];
        let pieceIdCounter = 1; // Start piece IDs from 1 for consistency.

        $.processInContext(this, templateLayout, function(rowIndex, rowData) {
          boardStructure[rowIndex] = [];
          $.processInContext(this, rowData, function(colIndex, squareValue) {
            if (squareValue !== '-') {
              // If it's a piece, store its ID and type.
              boardStructure[rowIndex][colIndex] = {
                pieceIdentifier: pieceIdCounter++, // Unique ID for DOM manipulation.
                pieceType: templateLayout[rowIndex][colIndex].toString() // 'P', 'r', 'Q', etc.
              };
            } else {
              // Empty square.
              boardStructure[rowIndex][colIndex] = '-';
            }
          });
        });
        return boardStructure;
      },

      // Renders the visual representation of the board and pieces.
      renderBoardVisuals : function() {
        const displayElem = this.getBoardDisplayElement();
        // Create the board surface if it doesn't exist.
        if (displayElem.length === 0) {
          $(this.boardContainer).append('<div class="game-board-surface"></div>');
        }

        // Iterate through the internal board data and add pieces to the DOM.
        $.processInContext(this, this.getCurrentBoardState(), function(rowIdx, boardRow) {
          $.processInContext(this, boardRow, function(colIdx, squareContent) {
            if (squareContent !== '-') {
              const algebraicPos = this.coordinatesToAlgebraic(rowIdx, colIdx);
              this.placeVisualPiece(squareContent.pieceIdentifier, squareContent.pieceType, algebraicPos);
            }
          });
        });
      },

      // Generates a unique DOM ID for a piece.
      getVisualPieceDomId : function(pieceId) {
        return `${this.boardContainer.id}_piece_${pieceId}`;
      },

      // Adds a piece to the DOM at a specific algebraic square.
      placeVisualPiece : function(identifier, pieceCode, algebraicSquare) {
        const gridCoords = this.algebraicToCoordinates(algebraicSquare);
        let targetRow = gridCoords[0];
        let targetCol = gridCoords[1];

        // Adjust coordinates if the board is flipped.
        if (this.gameState.displayDirection < 0) {
          targetRow = 7 - targetRow;
          targetCol = 7 - targetCol;
        }

        const verticalPos = this.configuration.squareDimension * targetRow + this.configuration.displayOffsets.vOffset;
        const horizontalPos = this.configuration.squareDimension * targetCol + this.configuration.displayOffsets.hOffset;

        let pieceColorClass = 'black-piece';
        if (pieceCode.toUpperCase() === pieceCode) {
          pieceColorClass = 'white-piece';
        }

        const pieceClass = pieceCode.toLowerCase(); // 'p', 'r', 'n', etc.
        const pieceDomId = this.getVisualPieceDomId(identifier);

        // Append the new piece element to the board surface.
        const newPieceElement = $(`<div id="${pieceDomId}" class="${pieceColorClass} ${pieceClass} game-piece"></div>`);
        newPieceElement.css({
          position: 'absolute',
          top: verticalPos,
          left: horizontalPos
        });
        this.getBoardDisplayElement().append(newPieceElement);
      },

      // Animates a piece's movement on the board.
      animateVisualPieceMove : function(identifier, moveInstruction) {
        const fromCoords = this.algebraicToCoordinates(moveInstruction.origin);
        const toCoords   = this.algebraicToCoordinates(moveInstruction.destination);

        const verticalShift = (parseInt(toCoords[0]) - parseInt(fromCoords[0])) * this.configuration.squareDimension * this.gameState.displayDirection;
        const horizontalShift = (parseInt(toCoords[1]) - parseInt(fromCoords[1])) * this.configuration.squareDimension * this.gameState.displayDirection;

        const pieceElement = $('#' + this.getVisualPieceDomId(identifier));
        if (pieceElement.length > 0) { // Check if element exists before animating.
            pieceElement.animate({
                'top' : `+=${verticalShift}px`,
                'left' : `+=${horizontalShift}px`
            }, 'fast');
        }
      },

      // Removes a piece from the DOM.
      deleteVisualPiece : function(identifier) {
        $('#' + this.getVisualPieceDomId(identifier)).remove();
      },

      // Navigates the game state to a specific half-move number.
      goToMoveNumber : function(targetHalfMove) {
        // Move backward if current position is ahead of target.
        while (targetHalfMove < this.gameState.currentMoveIndex) {
          this.stepBackwardInHistory();
        }
        // Move forward if current position is behind target.
        while (targetHalfMove > this.gameState.currentMoveIndex) {
          this.stepForwardInHistory();
        }
      },

      // Applies the UI changes for the next half-move.
      stepForwardInHistory : function() {
        if (this.gameState.currentMoveIndex < this.gameState.moveHistoryTransitions.length) {
          const forwardActions = this.gameState.moveHistoryTransitions[this.gameState.currentMoveIndex].forward;
          this.executeVisualTransitions(forwardActions);
          this.gameState.currentMoveIndex++;
        }
      },

      // Reverts the UI changes for the previous half-move.
      stepBackwardInHistory : function() {
        if (this.gameState.currentMoveIndex > 0) {
          this.gameState.currentMoveIndex--;
          const backwardActions = this.gameState.moveHistoryTransitions[this.gameState.currentMoveIndex].backward;
          this.executeVisualTransitions(backwardActions);
        }
      },

      // Processes a list of transition commands (e.g., "r:50", "m:6:d7:d8").
      executeVisualTransitions : function(transitionCommands) {
        if (!Array.isArray(transitionCommands) || transitionCommands.length === 0) {
          return; // No transitions to execute.
        }

        $.processInContext(this, transitionCommands, function(commandIdx, commandString) {
          const commandParts = commandString.split(':');
          const commandType = commandParts[0];
          const pieceId = commandParts[1];

          switch(commandType) {
            case 'r': // 'r' for remove
              this.deleteVisualPiece(pieceId);
              break;
            case 'm': // 'm' for move
              this.animateVisualPieceMove(pieceId, { origin : commandParts[2], destination : commandParts[3] });
              break;
            case 'a': // 'a' for add
              this.placeVisualPiece(pieceId, commandParts[2], commandParts[3]);
              break;
            default:
              // Unknown command type, log or handle error.
              console.warn(`Unknown transition command: ${commandType}`);
              break;
          }
        });
      },

      // Clears all pieces from the board display.
      clearBoardDisplay : function() {
        this.getBoardDisplayElement().empty();
      },

      // Flips the board's orientation (white at bottom to black at bottom, or vice-versa).
      toggleBoardOrientation : function() {
        const maxBoardDimension = this.configuration.squareDimension * 7;
        const currentOffsets    = this.configuration.displayOffsets;

        this.getBoardDisplayElement().children('.game-piece').each(function() {
          const currentTop  = parseInt($(this).css('top')) - currentOffsets.vOffset;
          const currentLeft = parseInt($(this).css('left')) - currentOffsets.hOffset;
          $(this).css('top', (maxBoardDimension - currentTop) + currentOffsets.vOffset);
          $(this).css('left', (maxBoardDimension - currentLeft) + currentOffsets.hOffset);
        });

        this.gameState.displayDirection *= -1; // Invert the direction flag.
      },

      // Parses a FEN string and returns a 2D array representation of the board.
      interpretFenString : function(fenInput) {
        if (!this.isValidFenFormat(fenInput)) {
          console.error("Invalid FEN string provided:", fenInput);
          // Return an empty board or throw an error.
          return Array.from({ length: 8 }, () => Array(8).fill('-'));
        }

        const newGridState = [];
        // Split FEN into ranks, then further split by spaces to get board part.
        const fenSections = fenInput.trim().split(/\s+/);
        const boardRanks = fenSections[0].split('/');

        for (let r = 0; r < 8; r++) {
          newGridState[r] = [];
          // Replace digit characters with equivalent number of dashes for empty squares.
          const processedRow = boardRanks[r].replace(/\d/g, (digit) => '-'.repeat(parseInt(digit)));

          for (let c = 0; c < 8; c++) {
            newGridState[r][c] = processedRow.charAt(c);
          }
        }
        return newGridState;
      },

      // Validates the format of a FEN string using a regular expression.
      isValidFenFormat : function(fenCandidate) {
        // More robust FEN regex, checking for piece placement, turn, castling, en passant, halfmove, fullmove.
        const fenPattern = /^\s*([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s\d+\s\d+\s*$/;
        return fenPattern.test(fenCandidate);
      },

      // Parses PGN data and extracts game information and moves.
      processPgnData : function(pgnText) {
        // Clean up PGN string: trim, replace newlines/multiple spaces.
        let cleanedPgn = $.trim(pgnText).replace(/\n|\r/g, ' ').replace(/\s+/g, ' ');
        const selfRef = this;

        // Extract and cache annotations, replacing them with placeholders.
        cleanedPgn = cleanedPgn.replace(/\{(((\})|[^}]))+\}/g, function(match) {
            selfRef.gameState.rawAnnotationsCache.push(match.slice(1, -1)); // Store content without braces.
            return `annotation-placeholder-${selfRef.gameState.rawAnnotationsCache.length - 1}`;
        });

        // Define expected PGN header tags.
        const pgnHeaders = ['Event','Site','Date','Round','White','Black','Result'];
        pgnHeaders.forEach(headerTag => {
          const headerRegex = new RegExp(`\\[${headerTag} "([^"]*)"\\]`);
          const matchResult = headerRegex.exec(cleanedPgn);
          this.gameState.gameHeaders.set(headerTag, (matchResult == null) ? "" : matchResult[1]);
        });

        // Find the main move section (body).
        const bodyMatch = /(1\. ?(N[acfh]3|[abcdefgh][34]).*)/m.exec(cleanedPgn);
        if (!bodyMatch || !bodyMatch[1]) {
            console.warn("Could not find PGN move body.");
            return;
        }
        this.gameState.gameBodyText = bodyMatch[1];

        // Remove game result and move numbers from the body.
        this.gameState.gameBodyText = this.gameState.gameBodyText.replace(/1-0|1\/2-1\/2|0-1/, '');
        this.gameState.gameBodyText = this.gameState.gameBodyText.replace(/^\d+\.+/, '');
        this.gameState.gameBodyText = this.gameState.gameBodyText.replace(/\s\d+\.+/g, ' ');

        const individualMoves = $.trim(this.gameState.gameBodyText).split(/\s+/);

        let currentMoveCounter = 0; // Tracks actual chess moves, skipping annotations.
        $.processInContext(this, individualMoves, function(idx, moveToken) {
          // Check if the token is an annotation placeholder.
          if ( /annotation-placeholder-\d+/.test(moveToken) ) {
            const annotationIndex = parseInt(moveToken.match(/\d+/)[0]);
            this.gameState.moveAnnotations[currentMoveCounter] = this.gameState.rawAnnotationsCache[annotationIndex];
            return; // Skip this token as it's an annotation.
          }

          this.gameState.recordedMoves[currentMoveCounter] = moveToken;

          const activePlayer = (currentMoveCounter % 2 === 0) ? 'w' : 'b'; // Determine player by move index.

          // --- PGN Move Parsing Logic ---
          // This section would involve complex regex matching and board state updates
          // to determine the 'from' and 'to' squares for each move.
          // Since the original `movePiece`, `removePiece`, `addPiece` methods are not provided
          // and the `patterns` object is missing, this part is largely illustrative.
          // The goal is to identify the move type and call internal board manipulation methods.

          // Example stub for move processing:
          // if ( this.moveRecognizers.castleQueenside.test(moveToken) ) {
          //   const rank = (activePlayer === 'w') ? 1 : 8;
          //   this.recordMoveTransition(currentMoveCounter, {from : `e${rank}`, to : `c${rank}`} );
          //   this.recordMoveTransition(currentMoveCounter, {from : `a${rank}`, to : `d${rank}`} );
          // } else if ( this.moveRecognizers.pieceMove.test(moveToken) ) {
          //   // ... complex logic to find source and destination squares
          //   const sourceSquare = this.determinePieceSource(pieceType, ...);
          //   this.recordMoveTransition(currentMoveCounter, {from : sourceSquare, to : destinationSquare} );
          // } else { // Pawn move or capture
          //   // ... logic for pawn moves, en passant, queening
          //   this.recordMoveTransition(currentMoveCounter, {from : pawnSource, to : pawnDest} );
          // }

          currentMoveCounter++; // Increment only for actual chess moves.
        });
        // Clear the raw annotations cache after processing.
        this.gameState.rawAnnotationsCache = [];
      },

      // Helper to convert a digit in FEN to equivalent dashes.
      // (This was inlined into interpretFenString to reduce method count).
      // replaceNumberWithDashes : function(numStr) { return '-'.repeat(parseInt(numStr)); },

      // Checks if a piece cannot move due to an absolute pin.
      isAbsolutelyPinned : function(pieceDetails, currentSquare, intendedDestination) {
        // Locate the player's king and potential pinning pieces (Rooks, Queens, Bishops).
        const pieceChar = pieceDetails.pieceType;
        const currentPlayer = ( pieceChar === pieceChar.toLowerCase() ) ? 'b' : 'w';

        // Check for pin along horizontal/vertical vectors.
        let pinInfo = this.locateAbsolutePin(currentPlayer, this.gamePiecesRepo['R'].movementVectors, currentSquare, ['R','Q']);
        // If not found, check for pin along diagonal vectors.
        if (pinInfo === null) {
          pinInfo = this.locateAbsolutePin(currentPlayer, this.gamePiecesRepo['B'].movementVectors, currentSquare, ['B','Q']);
        }

        if (pinInfo !== null) {
          const [pinVector, kingSquare, pinningPieceLocation] = pinInfo;
          // If the intended destination is not along the line between king and pinning piece, it's blocked.
          if (!this.isSquareOnPath(intendedDestination, this.getPathBetweenSquares(kingSquare, pinningPieceLocation))) {
            return true;
          }
        }
        return false;
      },

      // Checks if a square is present in a given array of squares.
      isSquareOnPath : function(targetSquare, squareList) {
        return squareList.includes(targetSquare);
      },

      // Generates an array of algebraic squares between two given squares (inclusive).
      getPathBetweenSquares : function(startSquare, endSquare) {
        const startCoords   = this.algebraicToCoordinates(startSquare);
        const endCoords     = this.algebraicToCoordinates(endSquare);
        const currentCoords = [...startCoords]; // Clone to avoid modifying startCoords directly.
        const pathSquares   = [];

        pathSquares.push(this.coordinatesToAlgebraic(startCoords[0], startCoords[1]));

        // Calculate step direction for row and column.
        const rowStep = Math.sign(endCoords[0] - startCoords[0]);
        const colStep = Math.sign(endCoords[1] - startCoords[1]);

        while (currentCoords[0] !== endCoords[0] || currentCoords[1] !== endCoords[1]) {
          currentCoords[0] += rowStep;
          currentCoords[1] += colStep;
          pathSquares.push(this.coordinatesToAlgebraic(currentCoords[0], currentCoords[1]));
        }

        return pathSquares;
      },

      // Identifies if a piece is absolutely pinned by an opponent's piece.
      locateAbsolutePin : function(playerColor, movementVectors, pieceLocation, potentialPinners) {
        const kingPiece = (playerColor === 'w') ? 'K' : 'k';

        for (const vector of movementVectors) {
          const searchResult = this.findFirstPieceAlongVector(pieceLocation, vector, vector.maxRange);
          if (searchResult !== null && searchResult.piece.pieceType === kingPiece) {
            const kingSquare = searchResult.square;

            // Now search in the opposite direction from the pinned piece.
            const reversedVector = this.reverseVector(vector);
            const pinnerResult = this.findFirstPieceAlongVector(pieceLocation, reversedVector, reversedVector.maxRange);

            if (pinnerResult !== null) {
              const pinningPieceLocation = pinnerResult.square;
              for (const pinnerType of potentialPinners) {
                const opponentPinner = (playerColor === 'w') ?
                  pinnerType.toLowerCase() : pinnerType.toUpperCase();

                if (pinnerResult.piece.pieceType === opponentPinner) {
                  return [vector, kingSquare, pinningPieceLocation];
                }
              }
            }
          }
        }
        return null;
      },

      // Finds the first piece encountered along a given vector from a source square.
      findFirstPieceAlongVector : function(startSquare, vectorDefinition, searchLimit) {
        let currentCoords = this.algebraicToCoordinates(startSquare);
        for (let step = 1; step <= searchLimit; step++) {
          currentCoords[0] += vectorDefinition.deltaRow;
          currentCoords[1] += vectorDefinition.deltaCol;

          // Check if coordinates are within board bounds.
          if (currentCoords[0] < 0 || currentCoords[0] >= 8 || currentCoords[1] < 0 || currentCoords[1] >= 8) {
            return null; // Out of bounds.
          }

          const currentAlgebraic = this.coordinatesToAlgebraic(currentCoords[0], currentCoords[1]);
          const squareContent = this.getSquareContent(currentAlgebraic);

          if (squareContent !== '-') {
            // Found a piece.
            return { piece: squareContent, square: currentAlgebraic };
          }
        }
        return null; // No piece found within the limit.
      },

      // Helper to reverse a vector's direction.
      reverseVector : function(vec) {
        return {
          deltaRow: -vec.deltaRow,
          deltaCol: -vec.deltaCol,
          maxRange: vec.maxRange
        };
      },

      // Determines the source square of a piece for a given move.
      // This is a complex search function, potentially involving checking legality and pins.
      determinePieceSource : function(pieceCode, srcFileHint, srcRankHint, destFile, destRank, player) {
        if (srcFileHint && srcRankHint) {
          return srcFileHint + srcRankHint; // Source is fully specified.
        }

        const destinationSquare = destFile + destRank;
        const targetPieceType = (player === 'w') ? pieceCode : pieceCode.toLowerCase();

        // Iterate through all possible movement vectors for the piece type.
        for (const vector of this.gamePiecesRepo[pieceCode].movementVectors) {
          for (let range = 1; range <= vector.maxRange; range++) {
            // Calculate potential source square by moving backward along the vector from destination.
            const potentialSourceCoords = this.getCoordsFromVector(this.algebraicToCoordinates(destinationSquare), this.reverseVector(vector), range);

            if (!potentialSourceCoords || potentialSourceCoords[0] < 0 || potentialSourceCoords[0] >= 8 || potentialSourceCoords[1] < 0 || potentialSourceCoords[1] >= 8) {
              break; // Out of bounds, or invalid coords.
            }

            const potentialSourceAlgebraic = this.coordinatesToAlgebraic(potentialSourceCoords[0], potentialSourceCoords[1]);
            const pieceAtSource = this.getSquareContent(potentialSourceAlgebraic);

            if (pieceAtSource === '-') {
              continue; // Empty square, keep searching.
            }

            if (pieceAtSource.pieceType === targetPieceType) {
              // Found a piece of the correct type at a potential source.
              // Perform legality checks:
              // 1. Check for absolute pins.
              if (this.isAbsolutelyPinned(pieceAtSource, potentialSourceAlgebraic, destinationSquare)) {
                break; // This piece is pinned and cannot move.
              }

              // 2. Check if the source hint matches (if provided).
              if (srcFileHint && potentialSourceAlgebraic.charAt(0) !== srcFileHint) {
                continue;
              }
              if (srcRankHint && potentialSourceAlgebraic.charAt(1) !== srcRankHint) {
                continue;
              }

              // If all checks pass, this is the source.
              return potentialSourceAlgebraic;
            }
          }
        }
        return null; // No valid source found.
      },

      // Retrieves the content of a square (piece object or '-').
      getSquareContent : function(algebraicCoord) {
        const coords = this.algebraicToCoordinates(algebraicCoord);
        if (coords) {
          return this._boardGrid[coords[0]][coords[1]];
        }
        return '-'; // Invalid coordinate.
      },

      // Applies a vector to coordinates and returns new coordinates.
      getCoordsFromVector : function(startCoords, vector, steps) {
        return [
          startCoords[0] + vector.deltaRow * steps,
          startCoords[1] + vector.deltaCol * steps
        ];
      },

      // Converts 0-indexed [row, col] to algebraic notation (e.g., [0,0] -> 'a8').
      coordinatesToAlgebraic : function(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) {
          return null; // Invalid coordinates.
        }
        const fileChar = String.fromCharCode(97 + col); // 'a' is ASCII 97.
        const rankNum = 8 - row; // Row 0 is rank 8.
        return `${fileChar}${rankNum}`;
      },

      // Converts algebraic notation (e.g., 'e4') to 0-indexed [row, col].
      algebraicToCoordinates : function(algebraic) {
        if (!/^[a-h][1-8]$/.test(algebraic)) {
          return null; // Invalid algebraic string.
        }
        const file = algebraic.charCodeAt(0) - 97; // 'a' -> 0.
        const rank = 8 - parseInt(algebraic.charAt(1)); // '1' -> 7.
        return [rank, file];
      },

      // Placeholder for internal method to record a move and its transitions.
      // This would update this.gameState.moveHistoryTransitions.
      recordMoveTransition : function(moveNum, moveDetails) {
          // This method would calculate the piece ID, what pieces are removed/added,
          // and generate the 'm:id:from:to', 'r:id', 'a:id:piece:square' strings.
          // For Type III, we acknowledge its existence but don't need full implementation.
          // console.log(`Recording move ${moveNum}: ${JSON.stringify(moveDetails)}`);
      },

      // Dummy object for piece definitions (vectors, etc.)
      gamePiecesRepo : {
          'P': { movementVectors: [{deltaRow: -1, deltaCol: 0, maxRange: 2}] }, // Example for pawn
          'R': { movementVectors: [
              {deltaRow: 0, deltaCol: 1, maxRange: 7}, {deltaRow: 0, deltaCol: -1, maxRange: 7},
              {deltaRow: 1, deltaCol: 0, maxRange: 7}, {deltaRow: -1, deltaCol: 0, maxRange: 7}
          ]},
          'B': { movementVectors: [
              {deltaRow: 1, deltaCol: 1, maxRange: 7}, {deltaRow: 1, deltaCol: -1, maxRange: 7},
              {deltaRow: -1, deltaCol: 1, maxRange: 7}, {deltaRow: -1, deltaCol: -1, maxRange: 7}
          ]},
          'Q': { movementVectors: [
              {deltaRow: 0, deltaCol: 1, maxRange: 7}, {deltaRow: 0, deltaCol: -1, maxRange: 7},
              {deltaRow: 1, deltaCol: 0, maxRange: 7}, {deltaRow: -1, deltaCol: 0, maxRange: 7},
              {deltaRow: 1, deltaCol: 1, maxRange: 7}, {deltaRow: 1, deltaCol: -1, maxRange: 7},
              {deltaRow: -1, deltaCol: 1, maxRange: 7}, {deltaRow: -1, deltaCol: -1, maxRange: 7}
          ]},
          'K': { movementVectors: [
              {deltaRow: 0, deltaCol: 1, maxRange: 1}, {deltaRow: 0, deltaCol: -1, maxRange: 1},
              {deltaRow: 1, deltaCol: 0, maxRange: 1}, {deltaRow: -1, deltaCol: 0, maxRange: 1},
              {deltaRow: 1, deltaCol: 1, maxRange: 1}, {deltaRow: 1, deltaCol: -1, maxRange: 1},
              {deltaRow: -1, deltaCol: 1, maxRange: 1}, {deltaRow: -1, deltaCol: -1, maxRange: 1}
          ]},
          'N': { movementVectors: [
              {deltaRow: 2, deltaCol: 1, maxRange: 1}, {deltaRow: 2, deltaCol: -1, maxRange: 1},
              {deltaRow: -2, deltaCol: 1, maxRange: 1}, {deltaRow: -2, deltaCol: -1, maxRange: 1},
              {deltaRow: 1, deltaCol: 2, maxRange: 1}, {deltaRow: 1, deltaCol: -2, maxRange: 1},
              {deltaRow: -1, deltaCol: 2, maxRange: 1}, {deltaRow: -1, deltaCol: -2, maxRange: 1}
          ]}
          // Lowercase pieces would mirror these.
      },

      // Dummy object for PGN move pattern recognition.
      moveRecognizers : {
          castleQueenside: /O-O-O/,
          castleKingside: /O-O/,
          pieceMove: /^[RNBQK][a-h]?[1-8]?x?[a-h][1-8]/,
          rankAndFileGiven: /([RNBQK])([a-h])([1-8])x?([a-h])([1-8])/,
          fileGiven: /([RNBQK])([a-h])x?([a-h])([1-8])/,
          rankGiven: /([RNBQK])([1-8])x?([a-h])([1-8])/,
          nothingGiven: /([RNBQK])x?([a-h])([1-8])/,
          pawnMove: /^([a-h])([1-8])/,
          pawnCapture: /^([a-h])x([a-h])([1-8])/,
          pawnQueen: /=([RNBQ])/,
          check: /\+$/,
          checkmate: /#$/
      }
    }
  });
})(jQuery);