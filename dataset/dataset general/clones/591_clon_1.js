/*
 *   jChess 0.1.0 - Chess Library Built From jQuery
 *
 *   Copyright (c) 2008 Ben Marini
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */


// If Firebug is not installed, prevent console.log() from creating error messages.
if ( typeof console == "undefined" )
{
  var console = { log: function() { } };
}


// Extend jQuery with a context-aware iteration utility.
jQuery.eachWithContext = function ( context , object , callback ) {

  for (
    var i = 0 ,
        length = object.length ,
        value = object[0] ;

    i < length && callback.call( context , i , value ) !== false ;

    value = object[++i]
  )
  {
    // Empty loop body, all logic in the condition
  }

};


( function ( $ ) {

  // Chess game constructor function.
  $.chess = function ( options , wrapper ) {

    // Merge default settings with provided options.
    this.settings = $.extend( { } , $.chess.defaults , options );
    this.wrapper  = wrapper; // The DOM element wrapping the chess board.


    // Initialize game state variables.
    this.game     = {
      active_color          : 'w' ,
      castling_availability : 'KQkq' ,
      en_passant_square     : '-' ,
      halfmove_clock        : 0 ,
      fullmove_number       : 1 ,
      halfmove_number       : 0 ,

      header        : [] ,
      body          : '' ,
      moves         : [] ,
      annotations   : [] ,
      raw_annotations : [] ,

      next_piece_id   : 64 ,
      transitions     : [] ,
      board_direction : 1 // 1 for normal, -1 for flipped.
    };

  };


  // Add chess() to the jQuery namespace, allowing $(selector).chess() calls.
  $.fn.chess = function ( options ) {
    var chess = new $.chess( options , this[0] ); // Create a new chess instance.
    chess.init(); // Initialize the board and game.
    return chess; // Return the chess instance for chaining.
  };


  // Extend $.chess with default options and prototype methods.
  $.extend( $.chess , {

    // Default configuration for the chess game.
    defaults : {
      fen                  : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" , // Initial FEN string.
      square_size          : 43 , // Size of each square in pixels.
      offsets              : { left: 0 , top: 0 } , // Offset for board positioning.
      board_element_selector : '.chess-board' , // Selector for the board element.
      json_annotations     : false // Whether annotations are JSON formatted.
    } ,

    // Prototype methods for the chess game instance.
    prototype : {

      // Initialize the chess board.
      init : function () {
        // Load the initial board position from FEN.
        this.setUpBoard( this.parseFEN( this.settings.fen ) );

        // If a PGN string is provided in settings, parse it.
        if ( this.settings.pgn ) {
          this.parsePGN( this.settings.pgn );
        }

        // Set up the board again after PGN parsing (if any) to reflect changes.
        this.setUpBoard( this.parseFEN( this.settings.fen ) );
        this.writeBoard(); // Render the board to the DOM.
      } ,

      // Returns the jQuery object for the board element.
      boardElement : function () {
        return $( this.wrapper ).find( this.settings.board_element_selector );
      } ,

      // Returns the internal board data structure.
      boardData : function () {
        return this._board;
      } ,

      // Sets up the internal board data from a template.
      setUpBoard : function ( template ) {
        this._board = this.createBoardDataFromTemplate( template );
      } ,

      // Creates the internal board data structure from a FEN-parsed template.
      createBoardDataFromTemplate : function ( template ) {
        var board = []; // Initialize an empty board array.

        // Iterate over each row in the template.
        $.each( template , function ( j , row ) {
          board[j] = []; // Initialize the current row.

          // Iterate over each square in the current row.
          $.each( row , function ( k , val ) {
            if ( val != '-' ) {
              // If it's a piece, store its ID and character.
              board[j][k] = { id: ( k + 1 ) + ( j * 8 ) , piece: template[j][k].toString() };
            } else {
              // If it's an empty square, store a dash.
              board[j][k] = '-';
            }
          } );
        } );

        return board; // Return the newly created board data.
      } ,

      // Writes (renders) the current board state to the DOM.
      writeBoard : function () {
        // If no board element exists, create one.
        if ( this.boardElement().size() == 0 ) {
          $( this.wrapper ).append( '<div class="chess-board"></div>' );
        }

        // Iterate through the board data to add pieces to the DOM.
        $.eachWithContext( this , this.boardData() , function ( j , row ) {
          $.eachWithContext( this , row , function ( k , val ) {
            var piece  = this.boardData()[j][k]; // Get piece info.
            var square = this.coord2Algebraic( j , k ); // Get algebraic notation.

            // If a piece exists at this square, add its DOM representation.
            if ( piece != '-' ) {
              this.addDomPiece( piece.id , piece.piece , square );
            }
          } );
        } );
      } ,

      // Generates a unique DOM ID for a piece.
      getDomPieceId : function ( id ) {
        return this.wrapper.id + "_piece_" + id;
      } ,

      // Adds a piece to the DOM at a specific algebraic square.
      addDomPiece : function ( id , piece , algebraic ) {
        var square = this.algebraic2Coord( algebraic ); // Convert algebraic to coordinates.

        // Adjust coordinates if the board is flipped.
        if ( this.game.board_direction < 0 ) {
          square[0] = 7 - square[0];
          square[1] = 7 - square[1];
        }

        // Calculate pixel position.
        var pos_top  = this.settings.square_size * square[0] + this.settings.offsets.top;
        var pos_left = this.settings.square_size * square[1] + this.settings.offsets.left;

        var color = 'b'; // Default to black.
        // Determine piece color based on case.
        if ( piece.toUpperCase() == piece ) {
          color = 'w';
        }

        // Append the piece div to the board element.
        this.boardElement().append( '<div id="' + this.getDomPieceId( id ) + '" class="' + color + piece + '"></div>' );
        // Set its initial position using CSS.
        $( '#' + this.getDomPieceId( id ) ).css( { position: 'absolute' , top: pos_top , left: pos_left } );
      } ,

      // Animates a DOM piece from one square to another.
      moveDomPiece : function ( id , move ) {
        var from = this.algebraic2Coord( move.from ); // Starting coordinates.
        var to   = this.algebraic2Coord( move.to ); // Ending coordinates.

        // Calculate the displacement in pixels.
        var top  = ( parseInt( to[0] ) - parseInt( from[0] ) ) * this.settings.square_size * this.game.board_direction;
        var left = ( parseInt( to[1] ) - parseInt( from[1] ) ) * this.settings.square_size * this.game.board_direction;

        // Animate the piece movement.
        $( '#' + this.getDomPieceId( id ) ).animate( {
          'top' : '+=' + top + 'px' , 'left' : '+=' + left + 'px'
        } , 'fast' );
      } ,

      // Removes a DOM piece from the board.
      removeDomPiece : function ( id ) {
        $( '#' + this.getDomPieceId( id ) ).remove();
      } ,

      // Transitions the board state to a specific halfmove number.
      transitionTo : function ( halfmove_number ) {
        // Move backward if current halfmove is beyond the target.
        while ( halfmove_number < this.game.halfmove_number ) {
          this.transitionBackward();
        }

        // Move forward if current halfmove is before the target.
        while ( halfmove_number > this.game.halfmove_number ) {
          this.transitionForward();
        }
      } ,

      // Applies the forward transitions for the current halfmove.
      transitionForward : function () {
        // Only proceed if there are more transitions available.
        if ( this.game.halfmove_number < this.game.transitions.length ) {
          this.runTransitions( this.game.transitions[this.game.halfmove_number].forward );
          this.game.halfmove_number++; // Increment the halfmove counter.
        }
      } ,

      // Applies the backward transitions for the previous halfmove.
      transitionBackward : function () {
        // Only proceed if not at the beginning of the game.
        if ( this.game.halfmove_number > 0 ) {
          this.game.halfmove_number--; // Decrement the halfmove counter.
          this.runTransitions( this.game.transitions[this.game.halfmove_number].backward );
        }
      } ,

      // Example transitions format:
      // ["m:50:e2:6,1"] - Move piece with ID 50 from e2 to (6,1)
      // ["a:50:P:e4", "m:6:4,1:c7"] - Add piece 50, then move piece 6
      // ["r:50", "m:6:d7:d8"] - Remove piece 50, then move piece 6

      // Executes a list of transitions (add, move, remove pieces).
      runTransitions : function ( transitions ) {
        // Iterate through each transition in the list.
        $.eachWithContext( this , transitions , function ( i , transition ) {
          var pieces          = transition.split( ':' ); // Split transition string by colon.
          var transition_type = pieces[0]; // First part is the type (r, m, a).
          var id              = pieces[1]; // Second part is the piece ID.

          // Perform action based on transition type.
          switch ( transition_type ) {
            case 'r': // Remove piece.
              this.removeDomPiece( id );
              break;
            case 'm': // Move piece.
              this.moveDomPiece( id , { from : pieces[2] , to : pieces[3] } );
              break;
            case 'a': // Add piece.
              this.addDomPiece( id , pieces[2] , pieces[3] );
              break;
          }

        } );
      } ,

      // Clears all pieces from the board's DOM element.
      clearBoard : function () {
        this.boardElement().empty();
      } ,

      // Flips the board orientation by animating pieces.
      flipBoard : function () {
        var board_length = this.settings.square_size * 7; // Total length of the board (7 squares for calculations).
        var offsets      = this.settings.offsets; // Board offsets.

        // Iterate over each child (piece) on the board.
        this.boardElement().children().each( function () {
          var top_val  = parseInt( $( this ).css( 'top' ) ) - offsets.top; // Current top position.
          var left_val = parseInt( $( this ).css( 'left' ) ) - offsets.left; // Current left position.

          // Calculate new positions for a flip.
          $( this ).css( 'top' , ( board_length - top_val ) + offsets.top );
          $( this ).css( 'left' , ( board_length - left_val ) + offsets.left );
        } );

        this.game.board_direction *= -1; // Toggle board direction.
      } ,

      // Parses a FEN string and returns a board template.
      parseFEN : function ( fen ) {
        // Example FEN: rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2
        var new_board = []; // Array to store the parsed board.

        // Split the FEN string into parts (ranks and game state).
        var fen_parts = fen.replace( /^\s*/ , "" ).replace( /\s*$/ , "" ).split( /\/|\s/ );

        // Process each rank (row) of the board.
        for ( var j = 0 ; j < 8 ; j++ ) {
          new_board[j] = []; // Initialize the current row.

          // Replace numbers (empty squares) with dashes.
          var row = fen_parts[j].replace( /\d/g , this.replaceNumberWithDashes );

          // Populate the row with piece characters or dashes.
          for ( var k = 0 ; k < 8 ; k++ ) {
            new_board[j][k] = row.substr( k , 1 );
          }
        }
        return new_board; // Return the constructed board template.
      } ,

      // Validates a FEN string against a regular expression pattern.
      validateFEN : function ( fen ) {
        // Regex pattern for FEN validation.
        var pattern = /\s*([rnbqkpRNBQKP12345678]+\/){7}([rnbqkpRNBQKP12345678]+)\s[bw-]\s(([kqKQ]{1,4})|(-))\s(([a-h][1-8])|(-))\s\d+\s\d+\s*/;
        return pattern.test( fen ); // Test the FEN string.
      } ,

      // Parses a PGN string to extract moves, headers, and annotations.
      parsePGN : function ( pgn ) {
        // Clean up the PGN string: trim, replace newlines, consolidate spaces.
        pgn = $.trim( pgn ).replace( /\n|\r/g , ' ' ).replace( /\s+/g , ' ' );
        var instance = this; // Store reference to 'this' for callback context.

        // Recognize escaped closing curly brackets as part of the comment.
        // This allows us to have json encoded comments.
        pgn = pgn.replace( /\{((\\})|([^}]))+}/g , function () { return instance.pluckAnnotation.apply( instance , arguments ); } );

        // Extract PGN headers.
        var headers = ['Event' , 'Site' , 'Date' , 'Round' , 'White' , 'Black' , 'Result'];
        for ( var i = 0 ; i < headers.length ; i++ ) {
          var re     = new RegExp( headers[i] + ' "([^"]*)"]' ); // Regex for each header.
          var result = re.exec( pgn ); // Execute regex.
          this.game.header[headers[i]] = ( result == null ) ? "" : result[1]; // Store header value.
        }

        // Find the main body of the PGN (moves section).
        // This regex looks for the first move number (e.g., "1.") followed by a move.
        this.game.body = /(1\. ?(N[acfh]3|[abcdefgh][34]).*)/m.exec( pgn )[1];

        // Remove game results and move numbers from the body.
        this.game.body = this.game.body.replace( new RegExp( "1-0|1/2-1/2|0-1" ) , '' );
        this.game.body = this.game.body.replace( /^\d+\.+/ , '' );
        this.game.body = this.game.body.replace( /\s\d+\.+/g , ' ' );

        var moves = $.trim( this.game.body ).split( /\s+/ ); // Split the body into individual moves.
        // console.log(moves); // Debugging line (commented out).


        // This must be a separate variable from i, since annotations don't
        // count as actual moves in the game progression.
        var move_number = 0;

        // Process each move.
        $.eachWithContext( this , moves , function ( i , move ) {
          // Handle annotations.
          if ( /annotation-\d+/.test( move ) ) {
            this.game.annotations[move_number] = this.game.raw_annotations.shift();
            return; // Skip to next iteration if it's an annotation.
          }

          this.game.moves[move_number] = move; // Store the move string.

          // console.log("Processing move: " + move_number + '.' + move); // Debugging line.
          var player = ( move_number % 2 == 0 ) ? 'w' : 'b'; // Determine current player.


          // If the move was a castling.
          if ( this.patterns.castle_queenside.test( move ) ) {
            var rank = ( player == 'w' ) ? 1 : 8; // King's rank for white/black.
            this.movePiece( move_number , { from : "e" + rank , to : "c" + rank } ); // King move.
            this.movePiece( move_number , { from : "a" + rank , to : "d" + rank } ); // Rook move.

          } else if ( this.patterns.castle_kingside.test( move ) ) {
            var rank = ( player == 'w' ) ? 1 : 8; // King's rank for white/black.
            this.movePiece( move_number , { from : "e" + rank , to : "g" + rank } ); // King move.
            this.movePiece( move_number , { from : "h" + rank , to : "f" + rank } ); // Rook move.

          // If the move was a piece (non-pawn, non-castle).
          } else if ( this.patterns.piece_move.test( move ) ) {
            var m        = this.patterns.piece_move.exec( move ); // Execute regex for piece move.
            var piece    = m[0]; // The piece character.
            var src_file = null;
            var src_rank = null;
            var dst_file = null;
            var dst_rank = null;

            // Determine source and destination based on move notation.
            if ( this.patterns.rank_and_file_given.test( move ) ) {
              var m = this.patterns.rank_and_file_given.exec( move );
              src_file = m[2];
              src_rank = m[3];
              dst_file = m[4];
              dst_rank = m[5];
            } else if ( this.patterns.file_given.test( move ) ) {
              var m = this.patterns.file_given.exec( move );
              src_file = m[2];
              dst_file = m[3];
              dst_rank = m[4];
            } else if ( this.patterns.rank_given.test( move ) ) {
              var m = this.patterns.rank_given.exec( move );
              src_rank = m[2];
              dst_file = m[3];
              dst_rank = m[4];
            } else if ( this.patterns.nothing_given.test( move ) ) {
              var m = this.patterns.nothing_given.exec( move );
              dst_file = m[2];
              dst_rank = m[3];
            }

            // Find the exact source square and record the move.
            var src = this.findMoveSource( piece , src_file , src_rank , dst_file , dst_rank , player );
            this.movePiece( move_number , { from : src , to : dst_file + dst_rank } );

            // If the move was a pawn move or capture.
          } else {
            var dst_file = null;
            var dst_rank = null;

            if ( this.patterns.pawn_move.test( move ) ) { // Regular pawn move.
              var m    = this.patterns.pawn_move.exec( move );
              dst_file = m[1];
              dst_rank = m[2];
              var src  = this.findPawnMoveSource( dst_file , dst_rank , player );
              var dst  = dst_file + dst_rank;
              this.movePiece( move_number , { from : src , to : dst } );

            } else if ( this.patterns.pawn_capture.test( move ) ) { // Pawn capture.
              var m        = this.patterns.pawn_capture.exec( move );
              dst_file     = m[2];
              dst_rank     = m[3];
              var src_file = m[1];
              var src_rank = parseInt( dst_rank ) + ( ( player == 'w' ) ? -1 : 1 ); // Calculate source rank.

              // Check for En passant: if destination square is empty, it's en passant.
              var result = this.pieceAt( dst_file + dst_rank );
              if ( result == '-' ) {
                this.removePiece( move_number , dst_file + src_rank ); // Remove captured pawn.
              }
              this.movePiece( move_number , { from : src_file + src_rank , to : dst_file + dst_rank } );
            }

            // Handle pawn queening (promotion).
            if ( this.patterns.pawn_queen.test( move ) ) {
              this.removePiece( move_number , dst_file + dst_rank ); // Remove the pawn.

              var m = this.patterns.pawn_queen.exec( move );
              var queening_piece = m[1]; // The promoted piece character.
              // Adjust case for player color.
              queening_piece = ( player == 'w' ) ? queening_piece : queening_piece.toLowerCase();
              this.addPiece( move_number , queening_piece , dst_file + dst_rank ); // Add the new piece.
            }
          }

          move_number++; // Increment move number for the next iteration.
        } );
      } ,

      // Determines if a piece cannot move due to an absolute pin.
      cantMoveFromAbsolutePin : function ( piece , src_square , dst_square ) {
        // Look for an open vector from the piece to the king.
        var piece_char = piece.piece;
        var player     = ( piece_char == piece_char.toLowerCase() ) ? 'b' : 'w'; // Determine piece color.

        // Check for pins along rook/queen vectors.
        var result = this.findAbsolutePin( player , this.pieces['R'].vectors , src_square , ['R' , 'Q'] );
        // If no rook/queen pin, check for bishop/queen vectors.
        if ( result == null ) {
          result = this.findAbsolutePin( player , this.pieces['B'].vectors , src_square , ['B' , 'Q'] );
        }

        if ( result != null ) {
          var vector                = result[0]; // The pinning vector.
          var kings_square          = result[1]; // The king's square.
          var pinning_pieces_square = result[2]; // The pinning piece's square.

          // If the destination square is not along the line between king and pinning piece, it's pinned.
          if ( !this.inSquaresArray( dst_square , this.squaresBetweenEndPoints( kings_square , pinning_pieces_square ) ) ) {
            return true;
          }
        }

        return false; // Not absolutely pinned.
      } ,

      // Checks if a given square is present in an array of squares.
      inSquaresArray : function ( square , squares ) {
        for ( var i = 0 ; i < squares.length ; i++ ) {
          if ( squares[i] == square ) {
            return true;
          }
        }

        return false; // Square not found.
      } ,

      // Returns an array of squares between two algebraic square endpoints (inclusive).
      squaresBetweenEndPoints : function ( s , e ) {
        var start   = this.algebraic2Coord( s ); // Convert start algebraic to coordinates.
        var end     = this.algebraic2Coord( e ); // Convert end algebraic to coordinates.
        var tmp     = start; // Temporary variable for iteration.
        var squares = []; // Array to store squares.

        squares.push( this.coord2Algebraic( start[0] , start[1] ) ); // Add starting square.

        // Iterate until temporary coordinates reach the end coordinates.
        while ( tmp[0] != end[0] || tmp[1] != end[1] ) {
          if ( tmp[0] < end[0] ) {
            tmp[0] += 1;
          }
          if ( tmp[0] > end[0] ) {
            tmp[0] -= 1;
          }
          if ( tmp[1] < end[1] ) {
            tmp[1] += 1;
          }
          if ( tmp[1] > end[1] ) {
            tmp[1] -= 1;
          }
          squares.push( this.coord2Algebraic( tmp[0] , tmp[1] ) ); // Add current square.
        }

        return squares; // Return the array of squares.
      } ,

      // Finds an absolute pin on the board.
      findAbsolutePin : function ( player , vectors , src_square , pieces_that_can_pin_on_this_vector ) {
        // First, check if there's a vector from src_square to the king.
        var result = this.findVectorToKing( player , vectors , src_square );
        if ( result != null ) {
          var vector       = result[0]; // The vector pointing to the king.
          var kings_square = result[1]; // The king's square.

          // Now, check in the opposite direction from src_square to find a pinning piece.
          var flipped_vector = this.flipVector( vector ); // Get the opposite vector.
          var result = this.firstPieceFromSourceAndVector( src_square , flipped_vector , flipped_vector.limit );
          if ( result != null ) {
            var pinning_pieces_square = result[1]; // Square of the potential pinning piece.

            // Check if the found piece is one that can cause a pin along this vector.
            for ( var i = 0 ; i < pieces_that_can_pin_on_this_vector.length ; i++ ) {
              var pinning_piece = ( player == 'w' ) ?
                pieces_that_can_pin_on_this_vector[i].toLowerCase() : // Black's piece.
                pieces_that_can_pin_on_this_vector[i].toUpperCase(); // White's piece.

              if ( result[0].piece == pinning_piece ) {
                return [vector , kings_square , pinning_pieces_square]; // Pin found!
              }
            }
          }
        }
        return null; // No absolute pin found.
      } ,

      // Finds a vector path from a source square to the king.
      findVectorToKing : function ( player , vectors , src_square ) {
        var king = ( player == 'w' ) ? 'K' : 'k'; // Determine king character for the player.
        for ( var i = 0 ; i < vectors.length ; i++ ) {
          var vector = vectors[i]; // Current vector to check.
          // Find the first piece along this vector.
          var result = this.firstPieceFromSourceAndVector( src_square , vector , vector.limit );
          // If a piece is found and it's the king, return the vector and king's square.
          if ( result != null && result[0].piece == king ) {
            return [vector , result[1]];
          }
        }
        return null; // No vector to the king found.
      } ,

      // Finds the source square of a piece move given destination and optional source hints.
      findMoveSource : function ( piece , src_file , src_rank , dst_file , dst_rank , player ) {
        // console.log("Looking for move source for " + piece + " from " + dst_rank + dst_file); // Debugging line (commented out).

        // If source file and rank are explicitly given, use them directly.
        if ( src_file && src_rank ) {
          return src_file + src_rank;
        }

        var dst_square   = dst_file + dst_rank; // Full destination square.
        // Determine the target piece character (case-sensitive for color).
        var target_piece = ( player == 'w' ) ? piece : piece.toLowerCase();
        target_piece     = target_piece.toString(); // Ensure it's a string.


        // Iterate through all possible vectors for this piece type.
        for ( var i = 0 ; i < this.pieces[piece].vectors.length ; i++ ) {
          var vector = this.pieces[piece].vectors[i]; // Current vector.

          // Iterate along the vector, checking each square.
          for ( var size = 1 ; size <= vector.limit ; size++ ) {
            // Get the piece (if any) at the current square along the vector.
            var result = this.pieceFromSourceAndVector( dst_square , vector , size );
            // console.log("Looking at " + result); // Debugging line (commented out).

            if ( result == null ) {
              break; // No piece found, or out of bounds.
            }
            if ( result[0] == '-' ) {
              continue; // Empty square, continue searching along vector.
            }

            // If the found piece matches the target piece.
            if ( result[0].piece == target_piece ) {
              // Check for absolute pin on the piece in question.
              if ( this.cantMoveFromAbsolutePin( result[0] , result[1] , dst_square ) ) {
                break; // This piece is pinned and cannot move, so it's not the source.
              }

              // If source file was given, check if it matches.
              if ( src_file ) {
                if ( result[1].substr( 0 , 1 ).toString() == src_file ) {
                  return result[1]; // Found the source square.
                }
              } else if ( src_rank ) { // If source rank was given, check if it matches.
                if ( result[1].substr( 1 , 1 ).toString() == src_rank ) {
                  return result[1]; // Found the source square.
                }
              } else {
                return result[1]; // No source hints, this is the first valid piece found.
              }
            }
          }
        }