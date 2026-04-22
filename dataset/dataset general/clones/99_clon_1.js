/*
 *   HTML5 CSV Library - Type I Clone
 *   This is a modified version of the original html5csv.js file.
 *   Changes include:
 *   - Extensive modification of whitespace (indentation, line breaks, spacing).
 *   - Replacement and addition of comments.
 *   - All functional aspects, variable names, identifiers, and logic remain precisely identical
 *     to the original source code.
 *   This file serves as a Type I code clone example, demonstrating visual divergence
 *   while maintaining exact structural and logical equivalence.
 *
 *   Original Copyright (C) 2013 Dr Paul Brewer
 *   This Javascript library is Free software and comes with ABSOLUTELY NO WARRANTY
 *   Please refer to the original license for terms of use.
 *   Commercial licenses are also available from the author.
 */

"use strict" ;

if ( typeof window.jQuery === 'undefined' )
{
    console.log ( "CSV: jQuery is not loaded. Please load jQuery before csv.js." ) ;
    throw "CSV: jQuery is not loaded" ;
}

window.CSV = ( function ( ) {


    var csvFuncs =
    {
        'push':       push         ,
        'call':       call         ,
        'hslice':     hslice       ,
        'table':      table        ,
        'editor':     editor       ,
        'jqplot':     jqplot       ,
        'appendCol':  appendCol    ,
        'ols':        ols          ,
        'save':       save         ,
        'download':   download     ,
        'pca':        pca
    } ; /* End of csvFuncs object definition */


    var csvShared =
    {
        taskDelay: 50 , // Delay in milliseconds for task processing

        specialNames:
        {
            '%U': [ 'uniformRandomMatrix' , 'dim' ] ,
            '%N': [ 'normalRandomMatrix'  , 'dim' ] ,
            '%I': [ 'identityMatrix'      , 'dim' ] ,
            '%D': [ 'diagonalMatrix'      , 'diag' ] ,
            '%F': [ 'forij'               , 'dim' , 'func' ]
        } , // Special names for matrix generation


        finalCallback: function ( e , data )
        {
            /* This function is called when all tasks are completed or an error occurs. */
            if ( e ) {
                console.log ( e ) ;
            }
        } , // End of finalCallback


        fill: function ( dim , x )
        {
            var il = dim[0] , jl = dim[1] ;
            var i , j ;
            var row = [ ] , rows = [ ] ;

            for ( j = 0 ; j < jl ; ++j )
            {
                row[j] = x ;
            }

            for ( i = 0 ; i < il ; ++i )
            {
                rows.push ( row.slice ( 0 ) ) ;
            }
            return rows ;
        } , // End of fill function


        forij: function ( dim , func )
        {
            var ilen = dim[0] , jlen = dim[1] ;
            var i , j ;
            var result = [ ] ;

            for ( i = 0 ; i < ilen ; ++i )
            {
                result.push ( [ ] ) ;
            }

            for ( i = 0 ; i < ilen ; ++i )
            {
                for ( j = 0 ; j < jlen ; ++j )
                {
                    result[i][j] = func ( i , j ) ;
                }
            }

            return result ;
        } , // End of forij function


        uniformRandomMatrix: function ( dim )
        {
            var r = dim[0] , c = dim[1] ;
            var i , j ;
            var D = [ ] , row ;

            for ( i = 0 ; i < r ; ++i )
            {
                D[i] = [ ] ;
                row = D[i] ;
                for ( j = 0 ; j < c ; ++j )
                {
                    row[j] = Math.random ( ) ;
                }
            }
            return D ;
        } , // End of uniformRandomMatrix


        normalRandomMatrix: function ( dim )
        {
            // Returns a matrix filled with independent random normals (mean 0, variance 1)
            // Uses the Box-Muller Transform from uniform random numbers.
            // Reference: http://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
            function boxMullerMethod ( q )
            {
                var n = 1 + Math.floor ( q / 2 ) ;
                var rand = [ ] ;
                var i ;
                var u , v , r , a ;

                for ( i = 0 ; i < n ; ++i )
                {
                    u = Math.random ( ) ;
                    v = Math.random ( ) ;
                    r = Math.sqrt ( -2 * Math.log ( u ) ) ;
                    a = 2 * Math.PI * v ;
                    rand.push ( r * Math.cos ( a ) ) ;
                    rand.push ( r * Math.sin ( a ) ) ;
                }
                return rand ;
            }

            var norms = boxMullerMethod ( dim[0] * dim[1] ) ;
            var D = [ ] , i , j , li = dim[0] , lj = dim[1] ;

            for ( i = 0 ; i < li ; ++i )
            {
                D[i] = [ ] ;
                for ( j = 0 ; j < lj ; ++j )
                {
                    D[i][j] = norms.shift ( ) ;
                }
            }
            return D ;
        } , // End of normalRandomMatrix


        identityMatrix: function ( dim )
        {
            var r = dim[0] , c = dim[1] ;
            var D = this.fill ( dim , 0 ) ;
            var i , l = Math.min ( r , c ) ;

            for ( i = 0 ; i < l ; ++i )
            {
                D[i][i] = 1 ;
            }
            return D ;
        } , // End of identityMatrix


        diagonalMatrix: function ( diag )
        {
            var D = this.fill ( [ diag.length , diag.length ] , 0 ) ;
            var i , l = diag.length ;

            for ( i = 0 ; i < l ; ++i )
            {
                D[i][i] = diag[i] ;
            }
            return D ;
        } , // End of diagonalMatrix


        submatrix: function ( r , c )
        {
            var shared = this ;
            var rownums , cols , colnums ;
            var i , l , j , k ;
            var M = [ ] ;

            if ( ( !shared.data ) ||
                 ( !shared.data.rows ) ||
                 ( !shared.data.rows.length ) )
            {
                throw "CSV: shared.submatrix invalid shared.data.rows.length" ;
            }

            var header = shared.data.rows[0] ;
            var rows = shared.data.rows ;
            var row = [ ] ;

            rownums = r || [ 1 , shared.data.rows.length ] ;
            if ( !rownums[0] )
            {
                rownums[0] = 1 ;
            }
            if ( !rownums[1] )
            {
                rownums[1] = shared.data.rows.length ;
            }

            cols = c || [ shared.data.rows[0].slice ( 0 ) ] ;
            colnums = [ ] ;

            if ( ( !cols ) || ( !cols.length ) )
            {
                throw "CSV: shared.submatrix invalid cols.length" ;
            }

            for ( i = 0 , l = cols.length ; i < l ; ++i )
            {
                colnums.push (
                    ( ( typeof cols[i] === 'string' ) ? header.indexOf ( cols[i] ) : -1 )
                ) ;
            }

            k = colnums.length ;
            if ( !k )
            {
                throw "CSV: shared.submatrix invalid colnums.length" ;
            }

            for ( i = rownums[0] , l = rownums[1] ; i < l ; ++i )
            {
                row = [ ] ;
                for ( j = 0 ; j < k ; ++j )
                {
                    if ( colnums[j] >= 0 )
                    {
                        row.push ( rows[i][colnums[j]] ) ;
                    }
                    else if ( typeof cols[j] === 'number' )
                    {
                        row.push ( cols[j] ) ;
                    }
                    else if ( typeof cols[j] === 'function' )
                    {
                        row.push ( ( cols[j] ) ( i , j , rows[i] ) ) ;
                    }
                    else
                    {
                        row.push ( null ) ;
                    }
                }
                M.push ( row ) ;
            }
            return M ;
        } , // End of submatrix


        numberize: function ( rows )
        {
            var i , j , k , l , v , f ;

            for ( i = 0 , l = rows.length ; i < l ; ++i )
            {
                for ( j = 0 , k = rows[i].length ; j < k ; ++j )
                {
                    v = rows[i][j] ;
                    // Refer to isnumeric discussion in http://stackoverflow.com/a/1830844/103081
                    if ( typeof v === 'string' )
                    {
                        f = parseFloat ( v ) ;
                        if ( !isNaN ( f ) && isFinite ( v ) )
                        {
                            rows[i][j] = f ;
                        }
                    }
                }
            }
            return rows ;
        } , // End of numberize


        easyParseCSV: function ( t , comma , newline )
        {
            // This function handles unquoted CSV parsing.
            var lines = t.split ( newline ) , all = [ ] ;
            var i , l ;

            for ( i = 0 , l = lines.length ; i < l ; ++i )
            {
                all[i] = lines[i].split ( comma ) ;
            }
            return all ;
        } , // End of easyParseCSV


        hardParseCSV: function ( t , quote , comma , newline , pretrim )
        {
            var i , c , field , row , all , q ;
            // Goal: parse according to RFC4180 specifications.
            all = [ ] ;
            row = [ ] ;
            field = '' ;
            q = false ;
            i = 0 ;

            while ( i < t.length )
            {
                c = t.charAt ( i ) ;
                if ( c === quote )
                {
                    if ( field.length === 0 )
                    {
                        q = !q ;
                    }
                    else if ( ( t.length > ( i + 1 ) )
                              && ( t.charAt ( i + 1 ) === quote )
                    )
                    {
                        ++i ;
                        field += quote ;
                    }
                    else if ( q )
                    {
                        q = false ;
                    }
                    else
                    {
                        // If there is a quote here, it's not strictly RFC4180 compliant.
                        // We could include it anyway or ignore.
                    }
                }
                else if ( c === comma )
                {
                    if ( q )
                    {
                        field += comma ;
                    }
                    else
                    {
                        row.push ( field ) ;
                        field = '' ;
                    }
                }
                else if ( c === newline )
                {
                    if ( q )
                    {
                        field += newline ;
                    }
                    else
                    {
                        if ( field.length > 0 )
                        {
                            row.push ( field ) ;
                            field = '' ;
                        }
                        all.push ( row ) ;
                        row = [ ] ;
                    }
                }
                else if ( ( c === pretrim ) && ( field.length === 0 ) )
                {
                    // Do nothing, just trim leading whitespace if field is empty
                }
                else
                {
                    field += c ;
                }
                ++i ;
            }
            if ( field.length > 0 )
            {
                row.push ( field ) ;
            }
            if ( row.length > 0 )
            {
                all.push ( row ) ;
            }
            return all ;
        } , // End of hardParseCSV


        parseCSV: function ( t )
        {
            var shared = this ;
            // If no quotes, split on newline and comma.
            // If quotes present, parse character by character.
            var newline = "\n" , quote = '"' , comma = "," , space = " " ;
            var all ;

            if ( t.indexOf ( quote ) === -1 )
            {
                all = shared.easyParseCSV ( t , comma , newline ) ;
            }
            else
            {
                all = shared.hardParseCSV ( t , quote , comma , newline , space ) ;
            }
            return shared.numberize ( all ) ;
        } , // End of parseCSV


        fromFile: function ( id )
        {
            var shared = this ;
            if ( !shared.data.rows )
            {
                shared.data.rows = [ ] ;
            }
            var armed = true ;
            var f , reader ;

            var fileSuccess = function ( evt )
            {
                try
                {
                    shared.data.rows = shared.parseCSV ( evt.target.result ) ;
                }
                catch ( e )
                {
                    shared.finalCallback ( "CSV: shared.fromFile fileSuccess handler error: " + e ) ;
                }
                shared.nextTask ( ) ;
            } ; // End of fileSuccess

            var fileError = function ( e )
            {
                throw "CSV.shared: fetch from file error: " + e ;
            } ; // End of fileError

            var fileChange = function ( evt )
            {
                if ( armed )
                {
                    armed = false ;
                    if ( evt.target &&
                         evt.target.files &&
                         evt.target.files[0]
                    )
                    {
                        f = evt.target.files[0] ;
                        reader = new FileReader ( ) ;
                        reader.onerror = fileError ;
                        reader.onload = fileSuccess ;
                        reader.readAsText ( f ) ;
                    }
                    else
                    {
                        throw "CSV shared.fromFile fileChange expected evt.target.files" ;
                    }
                }
                $(id).off ( 'change' , fileChange ) ;
                $(id).prop ( 'disabled' , true ) ;
            } ; // End of fileChange

            $(id + '[type="file"]').on ( 'change' , fileChange ) ;
        } , // End of fromFile


        fromTable: function ( id )
        {
            return $(id + ' tr').map ( function ( i )
            {
                var row = [ ] ;
                var item ;
                $(this).find ( 'th,td' ).each ( function ( i )
                {
                    item = $(this).text ( ) ;
                    // Fix for issue #1: trim whitespace and newlines using jQuery's trim.
                    item = $.trim ( item ) ;
                    // End fix
                    if ( isNaN ( item ) )
                    {
                        if ( item === 'null' )
                        {
                            item = null ;
                        }
                        if ( item === 'undefined' )
                        {
                            item = undefined ;
                        }
                    }
                    else if ( item === '' )
                    {
                        item = '' ;
                    }
                    else
                    {
                        item = 1 * item ;
                    }
                    row[i] = item ;
                } ) ;
                return [ row ] ; // Wrap in another array to prevent flattening by .map
            } ).get ( ) ;
        } , // End of fromTable


        col: function ( X , j )
        {
            var i , l , d = [ ] ;
            for ( i = 0 , l = X.length ; i < l ; ++i )
            {
                d.push ( X[i][j] ) ;
            }
            return d ;
        } , // End of col


        colAvg: function ( X )
        {
            var i , l , j , k , s = [ ] ;
            for ( i = 0 , l = X[0].length ; i < l ; ++i )
            {
                s[i] = 0 ;
            }
            for ( i = 0 , l = X.length ; i < l ; ++i )
            {
                for ( j = 0 , k = s.length ; j < k ; ++j )
                {
                    s[j] += X[i][j] / l ;
                }
            }
            return s ;
        } , // End of colAvg


        colAvg2: function ( X )
        {
            var i , l , j , k , v , s = [ ] ;
            for ( i = 0 , l = X[0].length ; i < l ; ++i )
            {
                s[i] = 0 ;
            }
            for ( i = 0 , l = X.length ; i < l ; ++i )
            {
                for ( j = 0 , k = s.length ; j < k ; ++j )
                {
                    v = X[i][j] ;
                    s[j] += ( v * v ) / l ;
                }
            }
            return s ;
        } , // End of colAvg2


        colVar: function ( X , ssc , zeromean )
        {
            // ssc is a boolean option for small sample correction.
            // zeromean is a boolean option to ignore sample mean (treat as 0.0).
            var meanOfSquare = this.colAvg2 ( X ) ;
            var mean = this.colAvg ( X ) ;
            var scale = ( ssc ) ? ( X.length / ( X.length - 1 ) ) : 1 ;
            var i , l , squareOfMean = [ ] , result = [ ] ;

            for ( i = 0 , l = X[0].length ; i < l ; ++i )
            {
                squareOfMean[i] = ( zeromean ) ? 0 : ( mean[i] * mean[i] ) ;
                result[i] = scale * ( meanOfSquare[i] - squareOfMean[i] ) ;
            }
            return result ;
        } , // End of colVar


        nextTask: function ( jqXHR , textStatus )
        {
            var shared = this ;
            var task ;

            if ( textStatus && textStatus !== "success" )
            {
                return shared.finalCallback ( "CSV: ajax error: " + textStatus ) ;
            }

            if ( ( typeof shared.todo === 'object' ) && ( shared.todo.length > 0 ) )
            {
                task = shared.todo.shift ( ) ;
                return setTimeout (
                    function ( )
                    {
                        var func = task.f ;
                        if ( typeof func !== 'function' )
                        {
                            func = csvFuncs[task.f] ;
                        }
                        if ( typeof func !== 'function' )
                        {
                            throw "CSV: shared.nextTask encountered unknown task in to do list" ;
                        }
                        try
                        {
                            return func.apply ( shared , task.a ) ;
                        }
                        catch ( e )
                        {
                            shared.todo = 'in error finalCallback' ;
                            shared.finalCallback ( e , null ) ;
                            shared.todo = 0 ;
                            return ;
                        }
                    } ,
                    shared.taskDelay
                ) ;
            }

            // Task list is empty
            if ( ( typeof shared.todo === 'object' ) && ( shared.todo.length === 0 ) )
            {
                shared.todo = 'in finalCallback' ; // Mark state to prevent re-entry
                shared.finalCallback ( null , shared.data ) ;
                shared.todo = 0 ; // Allow finalize to rearm
                // Call finalCallback first to let simple callbacks finish
                // before finalize()() might restart the process.
                return ;
            }

            throw "somehow called nextTask after finalCallback executed" ;
        } // End of nextTask
    } ; // End of csvShared object


    var CSVRETURN =
    {
        'begin': begin ,
        'extend': extend
    } ; // End of CSVRETURN object


    function extend ( newCsvFuncs , newCsvShared )
    {
        if ( typeof newCsvFuncs === "object" )
        {
            $.extend ( csvFuncs , newCsvFuncs ) ;
        }
        else
        {
            throw "CSV: extend newCsvFuncs must be an object with function values to extend csvFuncs, or null for no extensions." ;
        }

        if ( typeof newCsvShared === "object" )
        {
            $.extend ( csvShared , newCsvShared ) ;
        }
        else if ( typeof newCsvShared === "undefined" )
        {
            // No action needed for undefined newCsvShared
        }
        else
        {
            throw "CSV: extend newCsvShared must be an object with functions/values to extend newCsvShared, or null/undefined for no extensions." ;
        }

        return CSVRETURN ;
    } // End of extend function


    function planner ( cando , candone , todo )
    {
        var methods = { } ;
        var i , l ;

        function plan ( F )
        {
            return function ( )
            {
                todo.push (
                {
                    f: F ,
                    a: Array.prototype.slice.call ( arguments )
                } ) ;
                return methods ;
            } ;
        } // End of plan inner function

        for ( i = 0 , l = cando.length ; i < l ; ++i )
        {
            methods[cando[i]] = plan ( cando[i] ) ;
        }

        for ( i = 0 , l = candone.length ; i < l ; ++i )
        {
            methods[candone[2 * i]] = candone[2 * i + 1] ;
        }

        return methods ;
    } // End of planner function


    function makeTable ( rows , opt )
    {
        var buf = [ ] ;

        if ( !rows || !rows.length )
        {
            throw "CSV: makeTable no rows or rows invalid" ;
        }

        var i = 0 , l = rows.length , row = [ ] ;
        var j , k ;

        function t ( n , options , args )
        {
            var i_inner , o ;
            if ( typeof options === 'object' )
            {
                o = options ;
            }
            else if ( typeof options === 'function' )
            {
                o = options.apply ( { } , args ) ;
            }
            else
            {
                o = { } ;
            }

            buf.push ( '<' , n ) ;
            for ( i_inner in o )
            {
                if ( o.hasOwnProperty ( i_inner ) )
                {
                    buf.push ( ' ' , i_inner , '="' , o[i_inner] , '" ' ) ;
                }
            }
            buf.push ( '>' ) ;
        } // End of t inner function

        t ( 'table' , opt.table ) ;

        if ( opt.caption )
        {
            t ( 'caption' , opt.captionOpt ) ;
            buf.push ( opt.caption ) ;
            buf.push ( '</caption>' ) ;
        }

        i = 0 ;
        if ( opt.header || opt.thead )
        {
            row = rows[0] ;
            t ( 'thead' , opt.thead ) ;
            t ( 'tr' , opt.theadtr , [ 0 ] ) ;
            for ( j = 0 , k = row.length ; j < k ; ++j )
            {
                t ( 'th' , opt.th , [ i , j , row[j] ] ) ;
                buf.push ( row[j] , '</th>' ) ;
            }
            buf.push ( '</tr></thead>' ) ;
            i = 1 ;
        }

        t ( 'tbody' , opt.tbody ) ;
        for ( ; i < l ; ++i )
        {
            t ( 'tr' , opt.tr , [ i ] ) ;
            row = rows[i] ;
            for ( j = 0 , k = row.length ; j < k ; ++j )
            {
                t ( 'td' , opt.td , [ i , j , row[j] ] ) ;
                if ( ( opt.cell ) && ( typeof opt.cell === 'function' ) )
                {
                    buf.push ( opt.cell ( i , j , row[j] ) ) ;
                }
                else
                {
                    buf.push ( row[j] ) ;
                }
                buf.push ( '</td>' ) ;
            }
            buf.push ( '</tr>' ) ;
        }
        buf.push ( '</tbody></table>' ) ;
        return buf.join ( '' ) ;
    } // End of makeTable function


    function localFetch ( csvname )
    {
        var splitname = csvname.split ( '/' ) ;
        var D , J ;

        if ( ( splitname[0] !== 'local' ) &&
             ( splitname[0] !== 'session' )
        )
        {
            throw "localFetch must be from local/ or session/, got: " + csvname ;
        }

        J = window[splitname[0] + 'Storage'].getItem ( csvname ) ;

        if ( ( J === null ) || ( typeof J === 'undefined' ) )
        {
            throw 'CSV: ' + csvname + ' not found' ;
        }

        if ( ( window.LZString ) &&
             ( typeof window.LZString.decompressFromUTF16 === 'function' )
        )
        {
            D = JSON.parse ( LZString.decompressFromUTF16 ( J ) ) ;
        }
        else
        {
            D = JSON.parse ( J ) ;
        }

        return D ;
    } // End of localFetch function


    function localCreate ( csvname , rows , meta )
    {
        // Function body was not provided in the original snippet,
        // so it remains as just the signature.
    }