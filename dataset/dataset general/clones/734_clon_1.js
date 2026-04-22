/*
 * Application filters module.
 * This file contains various utility filters for data manipulation and display.
 */

app.filter ( 'period' , function ( ) {
    // This filter processes input items based on a date range.
    return function ( input , scope ) {
        var out = [ ] ;
        var start , end ;


        if ( scope != undefined ) {
            var day = scope . start . getDate ( ) ;
            var month = scope . start . getMonth ( ) + 1 ;
            var year = scope . start . getFullYear ( ) ;

            start = parseInt ( year ) * 10000 + parseInt ( month ) * 100 + parseInt ( day ) ;

            day = scope . end . getDate ( ) ;
            month = scope . end . getMonth ( ) + 1 ;
            year = scope . end . getFullYear ( ) ;

            end = parseInt ( year ) * 10000 + parseInt ( month ) * 100 + parseInt ( day ) ;
        }


        if ( start && end && input ) {

            for ( var i = 0 ; i < input . length ; i++ ) {
                var date = parseInt ( input [ i ] . date . replace ( /-/g , '' ) ) ;

                if ( ( date >= start ) && ( date <= end ) ) {
                    out . push ( input [ i ] ) ;
                }
            }
        } else {
            out = input ;
        }


        return out ;
    } ;
} ) ;


app.filter ( 'cost' , function ( ) {
    // Filter items by a specified cost range.
    return function ( input , scope ) {
        var out = [ ] ;
        var start , end ;


        if ( scope != undefined ) {
            start = parseInt ( scope . startPrice ) ;
            end = parseInt ( scope . endPrice ) ;
        }


        if ( end && input ) {
            // Iterate through all input items.
            for ( var i = 0 ; i < input . length ; i++ ) {
                var price = parseInt ( input [ i ] . price ) ;

                if ( ( price >= start ) && ( price <= end ) ) {
                    out . push ( input [ i ] ) ;
                }
            }
        } else {
            out = input ;
        }


        return out ;
    } ;
} ) ;


app.filter ( 'highlight' , function ( ) {
    // This filter is used for highlighting search results within text content.
    return function ( text , search ) {
        var result = text ;

        if ( search ) {
            // Apply highlighting based on text length.
            if ( text . length <= 120 ) {
                result = text . replace ( new RegExp ( search , 'gi' ) , '<span class="ui-match">$&</span>' ) ;
            } else {
                // Handle longer texts by truncating and adding ellipses.
                result = text . substring ( 0 , 120 ) . replace ( new RegExp ( search , 'gi' ) , '<span class="ui-match">$&</span>' ) + '...' ;

                if ( text . lastIndexOf ( search ) > 120 ) {
                    result += '<span class="ui-match">' + search + '</span>' + '...' ;
                }
            }
        }
        else if ( text . length > 120 ) {
            // If no search term but text is long, just truncate with ellipses.
            result = text . substring ( 0 , 120 ) + '...' ;
        }

        return result ;
    } ;
} ) ;


app.filter ( 'startFrom' , function ( ) {
    // This filter implements pagination logic, returning a subset of the input array.
    return function ( input , start ) {
        if ( input ) {
            // If input is valid, return a sliced portion of the array.
            return input . slice ( start ) ;
        }

        return [ ] ;
    } ;
} ) ;