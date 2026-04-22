/*
 * This is a Type I code clone generated from the original source.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been altered.
 */

/*
 * Inspiration for this code comes from Salvatore Sanfilippo's linenoise.
 * @see https://github.com/antirez/linenoise
 *
 * References:
 * - http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
 * - http://www.3waylabs.com/nw/WWW/products/wizcon/vt220.html
 */


var  kHistorySize  =  30 ;
var  kBufSize  =  10  *  1024 ;


var  util  =  require ( 'util' ) ;
var  inherits  =  require ( 'util' ) . inherits ;
var  EventEmitter  =  require ( 'events' ) . EventEmitter ;



exports . createInterface  =  function ( input ,  output ,  completer ,  terminal )
{

    var  rl ;

    if ( arguments . length  ===  1 )
    {
        rl  =  new  Interface ( input ) ;
    }
    else
    {
        rl  =  new  Interface ( input ,  output ,  completer ,  terminal ) ;
    }

    return  rl ;
} ;



function  Interface ( input ,  output ,  completer ,  terminal )
{
    if ( ! ( this  instanceof  Interface ) )
    {
        return  new  Interface ( input ,  output ,  completer ,  terminal ) ;
    }


    this . _sawReturn  =  false ;


    EventEmitter . call ( this ) ;


    if ( arguments . length  ===  1 )
    {
        // An options object was provided
        output  =  input . output ;
        completer  =  input . completer ;
        terminal  =  input . terminal ;
        input  =  input . input ;
    }


    completer  =  completer  ||  function ( ) {  return  [ ] ;  } ;


    if ( typeof  completer  !==  'function' )
    {
        throw  new  TypeError ( 'Argument \'completer\' must be a function' ) ;
    }


    // Backwards compatibility check for `isTTY` property
    // when `terminal` was not explicitly specified.
    if ( typeof  terminal  ==  'undefined' )
    {
        terminal  =  ! ! output . isTTY ;
    }


    var  self  =  this ;


    this . output  =  output ;
    this . input  =  input ;


    // Check arity: 2 for async, 1 for sync completer.
    this . completer  =  completer . length  ===  2  ?  completer  :  function ( v ,  callback )
    {
        callback ( null ,  completer ( v ) ) ;
    } ;


    this . setPrompt ( '> ' ) ;


    this . terminal  =  ! ! terminal ;


    function  ondata ( data )
    {
        self . _normalWrite ( data ) ;
    }


    function  onend ( )
    {
        self . close ( ) ;
    }


    function  onkeypress ( s ,  key )
    {
        self . _ttyWrite ( s ,  key ) ;
    }


    function  onresize ( )
    {
        self . _refreshLine ( ) ;
    }


    if ( ! this . terminal )
    {
        input . on ( 'data' ,  ondata ) ;
        input . on ( 'end' ,  onend ) ;

        self . once ( 'close' ,  function ( )
        {
            input . removeListener ( 'data' ,  ondata ) ;
            input . removeListener ( 'end' ,  onend ) ;
        } ) ;

        var  StringDecoder  =  require ( 'string_decoder' ) . StringDecoder ; // Lazy load
        this . _decoder  =  new  StringDecoder ( 'utf8' ) ;
    }
    else
    {
        exports . emitKeypressEvents ( input ) ;

        // Input usually refers to stdin.
        input . on ( 'keypress' ,  onkeypress ) ;

        // Current line content.
        this . line  =  '' ;

        this . _setRawMode ( true ) ;
        this . terminal  =  true ;

        // Cursor position on the current line.
        this . cursor  =  0 ;

        this . history  =  [ ] ;
        this . historyIndex  =  -1 ;

        output . on ( 'resize' ,  onresize ) ;

        self . once ( 'close' ,  function ( )
        {
            input . removeListener ( 'keypress' ,  onkeypress ) ;
            output . removeListener ( 'resize' ,  onresize ) ;
        } ) ;
    }

    input . resume ( ) ;
}


inherits ( Interface ,  EventEmitter ) ;


Interface . prototype . __defineGetter__ ( 'columns' ,  function ( )
{
    return  this . output . columns  ||  Infinity ;
} ) ;


Interface . prototype . setPrompt  =  function ( prompt ,  length )
{
    this . _prompt  =  prompt ;

    if ( length )
    {
        this . _promptLength  =  length ;
    }
    else
    {
        var  lines  =  prompt . split ( /[\r\n]/ ) ;
        var  lastLine  =  lines [ lines . length  -  1 ] ;
        this . _promptLength  =  lastLine . length ;
    }
} ;


Interface . prototype . _setRawMode  =  function ( mode )
{
    if ( typeof  this . input . setRawMode  ===  'function' )
    {
        return  this . input . setRawMode ( mode ) ;
    }
} ;


Interface . prototype . prompt  =  function ( preserveCursor )
{
    if ( this . paused )  this . resume ( ) ;

    if ( this . terminal )
    {
        if ( ! preserveCursor )  this . cursor  =  0 ;
        this . _refreshLine ( ) ;
    }
    else
    {
        this . output . write ( this . _prompt ) ;
    }
} ;


Interface . prototype . question  =  function ( query ,  cb )
{
    if ( typeof  cb  ===  'function' )
    {
        if ( this . _questionCallback )
        {
            this . prompt ( ) ;
        }
        else
        {
            this . _oldPrompt  =  this . _prompt ;
            this . setPrompt ( query ) ;
            this . _questionCallback  =  cb ;
            this . prompt ( ) ;
        }
    }
} ;


Interface . prototype . _onLine  =  function ( line )
{
    if ( this . _questionCallback )
    {
        var  cb  =  this . _questionCallback ;
        this . _questionCallback  =  null ;
        this . setPrompt ( this . _oldPrompt ) ;
        cb ( line ) ;
    }
    else
    {
        this . emit ( 'line' ,  line ) ;
    }
} ;


Interface . prototype . _addHistory  =  function ( )
{
    if ( this . line . length  ===  0 )  return  '' ;

    if ( this . history . length  ===  0  ||  this . history [ 0 ]  !==  this . line )
    {
        this . history . unshift ( this . line ) ;

        // Only store a limited number of history items.
        if ( this . history . length  >  kHistorySize )  this . history . pop ( ) ;
    }

    this . historyIndex  =  -1 ;
    return  this . history [ 0 ] ;
} ;


Interface . prototype . _refreshLine  =  function ( )
{
    var  columns  =  this . columns ;

    // Calculate line length.
    var  line  =  this . _prompt  +  this . line ;
    var  lineLength  =  line . length ;
    var  lineCols  =  lineLength  %  columns ;
    var  lineRows  =  ( lineLength  -  lineCols )  /  columns ;

    // Calculate cursor position.
    var  cursorPos  =  this . _getCursorPos ( ) ;

    // First, move to the bottom of the current line based on cursor position.
    var  prevRows  =  this . prevRows  ||  0 ;
    if ( prevRows  >  0 )
    {
        exports . moveCursor ( this . output ,  0 ,  -prevRows ) ;
    }

    // Move cursor to the left edge.
    exports . cursorTo ( this . output ,  0 ) ;

    // Erase existing data.
    exports . clearScreenDown ( this . output ) ;

    // Write the prompt and the current buffer content.
    this . output . write ( line ) ;

    // Force terminal to allocate a new line if needed.
    if ( lineCols  ===  0 )
    {
        this . output . write ( ' ' ) ;
    }

    // Move cursor to the original position.
    exports . cursorTo ( this . output ,  cursorPos . cols ) ;

    var  diff  =  lineRows  -  cursorPos . rows ;
    if ( diff  >  0 )
    {
        exports . moveCursor ( this . output ,  0 ,  -diff ) ;
    }

    this . prevRows  =  cursorPos . rows ;
} ;


Interface . prototype . close  =  function ( )
{
    if ( this . closed )  return ;

    if ( this . terminal )
    {
        this . _setRawMode ( false ) ;
    }

    this . pause ( ) ;
    this . closed  =  true ;
    this . emit ( 'close' ) ;
} ;


Interface . prototype . pause  =  function ( )
{
    if ( this . paused )  return ;

    this . input . pause ( ) ;
    this . paused  =  true ;
    this . emit ( 'pause' ) ;
} ;


Interface . prototype . resume  =  function ( )
{
    if ( ! this . paused )  return ;

    this . input . resume ( ) ;
    this . paused  =  false ;
    this . emit ( 'resume' ) ;
} ;


Interface . prototype . write  =  function ( d ,  key )
{
    if ( this . paused )  this . resume ( ) ;

    this . terminal  ?  this . _ttyWrite ( d ,  key )  :  this . _normalWrite ( d ) ;
} ;


var  lineEnding  =  /\r?\n|\r(?!\n)/ ;


Interface . prototype . _normalWrite  =  function ( b )
{
    if ( b  ===  undefined )
    {
        return ;
    }

    var  string  =  this . _decoder . write ( b ) ;

    if ( this . _sawReturn )
    {
        string  =  string . replace ( /^\n/ ,  '' ) ;
        this . _sawReturn  =  false ;
    }


    if ( this . _line_buffer )
    {
        string  =  this . _line_buffer  +  string ;
        this . _line_buffer  =  null ;
    }

    if ( lineEnding . test ( string ) )
    {
        this . _sawReturn  =  /\r$/ . test ( string ) ;

        // Got one or more newlines; process into "line" events.
        var  lines  =  string . split ( lineEnding ) ;

        // Either '' or (conceivably) the unfinished portion of the next line.
        string  =  lines . pop ( ) ;
        this . _line_buffer  =  string ;

        lines . forEach ( function ( line )
        {
            this . _onLine ( line ) ;
        } ,  this ) ;
    }
    else  if ( string )
    {
        // No newlines this time, save what we have for next time.
        this . _line_buffer  =  string ;
    }
} ;


Interface . prototype . _insertString  =  function ( c )
{
    // Possible bug when adding tabs with following content.
    // The issue might be in _refreshLine().
    // A workaround could be inserting spaces instead of literal '\t'.
    if ( this . cursor  <  this . line . length )
    {
        var  beg  =  this . line . slice ( 0 ,  this . cursor ) ;
        var  end  =  this . line . slice ( this . cursor ,  this . line . length ) ;

        this . line  =  beg  +  c  +  end ;
        this . cursor  +=  c . length ;
        this . _refreshLine ( ) ;
    }
    else
    {
        this . line  +=  c ;
        this . cursor  +=  c . length ;

        if ( this . _getCursorPos ( ) . cols  ===  0 )
        {
            this . _refreshLine ( ) ;
        }
        else
        {
            this . output . write ( c ) ;
        }

        // Hack to ensure line is refreshed if needed.
        this . _moveCursor ( 0 ) ;
    }
} ;


Interface . prototype . _tabComplete  =  function ( )
{
    var  self  =  this ;

    self . pause ( ) ;

    self . completer ( self . line . slice ( 0 ,  self . cursor ) ,  function ( err ,  rv )
    {
        self . resume ( ) ;

        if ( err )
        {
            // Error handling, maybe log it somewhere.
            return ;
        }

        var  completions  =  rv [ 0 ] ,
             completeOn   =  rv [ 1 ] ;  // The text that was completed.

        if ( completions  &&  completions . length )
        {
            // Apply or show completions.
            if ( completions . length  ===  1 )
            {
                self . _insertString ( completions [ 0 ] . slice ( completeOn . length ) ) ;
            }
            else
            {
                self . output . write ( '\r\n' ) ;

                var  width  =  completions . reduce ( function ( a ,  b )
                {
                    return  a . length  >  b . length  ?  a  :  b ;
                } ) . length  +  2 ;  // 2 space padding.

                var  maxColumns  =  Math . floor ( self . columns  /  width )  ||  1 ;
                var  group  =  [ ] ,  c ;

                for ( var  i  =  0 ,  compLen  =  completions . length ;  i  <  compLen ;  i ++ )
                {
                    c  =  completions [ i ] ;

                    if ( c  ===  '' )
                    {
                        handleGroup ( self ,  group ,  width ,  maxColumns ) ;
                        group  =  [ ] ;
                    }
                    else
                    {
                        group . push ( c ) ;
                    }
                }

                handleGroup ( self ,  group ,  width ,  maxColumns ) ;

                // If there's a common prefix, apply that portion.
                var  f  =  completions . filter ( function ( e ) {  if ( e )  return  e ;  } ) ;
                var  prefix  =  commonPrefix ( f ) ;

                if ( prefix . length  >  completeOn . length )
                {
                    self . _insertString ( prefix . slice ( completeOn . length ) ) ;
                }
            }

            self . _refreshLine ( ) ;
        }
    } ) ;
} ;


// This function operates on an Interface instance.
function  handleGroup ( self ,  group ,  width ,  maxColumns )
{
    if ( group . length  ==  0 )
    {
        return ;
    }

    var  minRows  =  Math . ceil ( group . length  /  maxColumns ) ;

    for ( var  row  =  0 ;  row  <  minRows ;  row ++ )
    {
        for ( var  col  =  0 ;  col  <  maxColumns ;  col ++ )
        {
            var  idx  =  row  *  maxColumns  +  col ;

            if ( idx  >=  group . length )
            {
                break ;
            }

            var  item  =  group [ idx ] ;
            self . output . write ( item ) ;

            if ( col  <  maxColumns  -  1 )
            {
                for ( var  s  =  0 ,  itemLen  =  item . length ;
                      s  <  width  -  itemLen ;
                      s ++ )
                {
                    self . output . write ( ' ' ) ;
                }
            }
        }
        self . output . write ( '\r\n' ) ;
    }

    self . output . write ( '\r\n' ) ;
}


function  commonPrefix ( strings )
{
    if ( ! strings  ||  strings . length  ==  0 )
    {
        return  '' ;
    }

    var  sorted  =  strings . slice ( ) . sort ( ) ;
    var  min  =  sorted [ 0 ] ;
    var  max  =  sorted [ sorted . length  -  1 ] ;

    for ( var  i  =  0 ,  len  =  min . length ;  i  <  len ;  i ++ )
    {
        if ( min [ i ]  !=  max [ i ] )
        {
            return  min . slice ( 0 ,  i ) ;
        }
    }

    return  min ;
}


Interface . prototype . _wordLeft  =  function ( )
{
    if ( this . cursor  >  0 )
    {
        var  leading  =  this . line . slice ( 0 ,  this . cursor ) ;
        var  match  =  leading . match ( /([^\w\s]+|\w+|)\s*$/ ) ;
        this . _moveCursor ( -match [ 0 ] . length ) ;
    }
} ;


Interface . prototype . _wordRight  =  function ( )
{
    if ( this . cursor  <  this . line . length )
    {
        var  trailing  =  this . line . slice ( this . cursor ) ;
        var  match  =  trailing . match ( /^(\s+|\W+|\w+)\s*/ ) ;
        this . _moveCursor ( match [ 0 ] . length ) ;
    }
} ;


Interface . prototype . _deleteLeft  =  function ( )
{
    if ( this . cursor  >  0  &&  this . line . length  >  0 )
    {
        this . line  =  this . line . slice ( 0 ,  this . cursor  -  1 )  +
                       this . line . slice ( this . cursor ,  this . line . length ) ;

        this . cursor -- ;
        this . _refreshLine ( ) ;
    }
} ;


Interface . prototype . _deleteRight  =  function ( )
{
    this . line  =  this . line . slice ( 0 ,  this . cursor )  +
                   this . line . slice ( this . cursor  +  1 ,  this . line . length ) ;
    this . _refreshLine ( ) ;
} ;


Interface . prototype . _deleteWordLeft  =  function ( )
{
    if ( this . cursor  >  0 )
    {
        var  leading  =  this . line . slice ( 0 ,  this . cursor ) ;
        var  match  =  leading . match ( /([^\w\s]+|\w+|)\s*$/ ) ;

        leading  =  leading . slice ( 0 ,  leading . length  -  match [ 0 ] . length ) ;

        this . line  =  leading  +  this . line . slice ( this . cursor ,  this . line . length ) ;
        this . cursor  =  leading . length ;
        this . _refreshLine ( ) ;
    }
} ;


Interface . prototype . _deleteWordRight  =  function ( )
{
    if ( this . cursor  <  this . line . length )
    {
        var  trailing  =  this . line . slice ( this . cursor ) ;
        var  match  =  trailing . match ( /^(\s+|\W+|\w+)\s*/ ) ;

        this . line  =  this . line . slice ( 0 ,  this . cursor )  +
                       trailing . slice ( match [ 0 ] . length ) ;
    }
} ;