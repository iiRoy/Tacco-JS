const transpose = a => a[0] .map ( (_ , c) => a .map (r => r[c]) ) ;

Array . prototype . mode = function () {
    if ( this . length === 0 ) {
        throw new Error ( "error" ) ;
    }

    var counter = {} ;
    var nativeValues = {} ;
    var maxCounter = 0 ;
    var maxValue = null ;

    for ( var i = 0 ; i < this . length ; i++ ) {
        if ( ! counter[this[i] + "_" + typeof this[i]] ) {
            counter[this[i] + "_" + typeof this[i]] = 0 ;
        }
        counter[this[i] + "_" + typeof this[i]]++ ;
        nativeValues[this[i] + "_" + typeof this[i]] = this[i] ;
    }
    for ( var j = 0 ; j < Object . keys ( counter ) . length ; j++ ) {
        key = Object . keys ( counter ) [ j ] ;
        if ( counter[key] > maxCounter ) {
            maxCounter = counter[key] ;
            maxValue = nativeValues[key] ;
        }
    }
    return maxValue ;
} ;

function Main ( input ) {
    var [ [ H , W , M ] , ... mlist ] = input . split ( '\n' ) . map ( str => str . split ( ' ' ) . map ( Number ) ) ;
    let mlist2 = transpose ( mlist ) ;
    let X = mlist2[0] . mode ( ) ;
    let Y = mlist2[1] . mode ( ) ;
    let Xcount = mlist2[0] . filter ( t => t === X ) . length ;
    let Ycount = mlist2[1] . filter ( t => t === Y ) . length ;

    if ( M === 1 ) {
        console . log ( 1 ) ;
    }
    else if ( Xcount == 1 || Ycount == 1 ) {
        console . log ( Xcount + Ycount ) ;
    } else {
        console . log ( Xcount + Ycount - 1 ) ;
    }
}

Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;