// This is a core library module.
// It provides fundamental utilities and enhancements for JavaScript objects.

( function ( ) {

    // Define the primary toolkit object in the global scope.
    this . ToolForge = {
        release : '1.3' ,
        assembly : 'a3eed692dd85050d80168ec2c708efe901bb7db3'
    } ;

    // Utility functions for checking subject categories and instances.

    var kindOf = this . kindOf = function ( subject ) {
        if ( subject == null ) {
            return 'null' ;
        }
        if ( subject . _category ) {
            return subject . _category ( ) ;
        }

        if ( subject . nodeName ) {
            if ( subject . nodeType == 1 ) {
                return 'element' ;
            }
            if ( subject . nodeType == 3 ) {
                return ( / \S / ) . test ( subject . nodeValue ) ? 'textnode' : 'whitespace' ;
            }
        } else if ( typeof subject . length == 'number' ) {
            if ( subject . callee ) {
                return 'arguments' ;
            }
            if ( 'item' in subject ) {
                return 'collection' ;
            }
        }

        return typeof subject ;
    } ;

    var isAnInstanceOf = this . isAnInstanceOf = function ( subject , targetRef ) {
        if ( subject == null ) {
            return false ;
        }
        var originator = subject . _originator || subject . constructor ;
        while ( originator ) {
            if ( originator === targetRef ) {
                return true ;
            }
            originator = originator . parent ;
        }
        return subject instanceof targetRef ;
    } ;

    // Enhancements for the native Function object.

    var Routine = this . Function ;

    var listedKeys = true ;
    for ( var loopIdx in { toString : 1 } ) {
        listedKeys = null ;
    }
    if ( listedKeys ) {
        listedKeys = [ 'hasOwnProperty' , 'valueOf' , 'isPrototypeOf' , 'propertyIsEnumerable' , 'toLocaleString' , 'toString' , 'constructor' ] ;
    }

    Routine . prototype . batchAssigner = function ( handleMultiple ) {
        var thisRef = this ;
        return function ( firstArg , secondArg ) {
            if ( firstArg == null ) {
                return this ;
            }
            if ( handleMultiple || typeof firstArg != 'string' ) {
                for ( var entryKey in firstArg ) {
                    thisRef . call ( this , entryKey , firstArg [ entryKey ] ) ;
                }
                if ( listedKeys ) {
                    for ( var loopIdx = listedKeys . length ; loopIdx -- ; ) {
                        entryKey = listedKeys [ loopIdx ] ;
                        if ( firstArg . hasOwnProperty ( entryKey ) ) {
                            thisRef . call ( this , entryKey , firstArg [ entryKey ] ) ;
                        }
                    }
                }
            } else {
                thisRef . call ( this , firstArg , secondArg ) ;
            }
            return this ;
        } ;
    } ;

    Routine . prototype . batchRetriever = function ( handleMultiple ) {
        var thisRef = this ;
        return function ( firstArg ) {
            var inputArgs , outcome ;
            if ( handleMultiple || typeof firstArg != 'string' ) {
                inputArgs = firstArg ;
            } else if ( arguments . length > 1 ) {
                inputArgs = arguments ;
            }
            if ( inputArgs ) {
                outcome = { } ;
                for ( var loopIdx = 0 ; loopIdx < inputArgs . length ; loopIdx ++ ) {
                    outcome [ inputArgs [ loopIdx ] ] = thisRef . call ( this , inputArgs [ loopIdx ] ) ;
                }
            } else {
                outcome = thisRef . call ( this , firstArg ) ;
            }
            return outcome ;
        } ;
    } ;

    Routine . prototype . augment = function ( propKey , propValue ) {
        this [ propKey ] = propValue ;
    } . batchAssigner ( ) ;

    Routine . prototype . inject = function ( propKey , propValue ) {
        this . prototype [ propKey ] = propValue ;
    } . batchAssigner ( ) ;

    // Type conversion utilities.

    var segmentFunc = Array . prototype . slice ;

    Routine . deriveFrom = function ( subject ) {
        return ( kindOf ( subject ) == 'function' ) ? subject : function ( ) {
            return subject ;
        } ;
    } ;

    List . deriveFrom = function ( subject ) {
        if ( subject == null ) {
            return [ ] ;
        }
        return ( Kind . isIterable ( subject ) && typeof subject != 'string' ) ? ( kindOf ( subject ) == 'array' ) ? subject : segmentFunc . call ( subject ) : [ subject ] ;
    } ;

    Numeric . deriveFrom = function ( subject ) {
        var numericVal = parseFloat ( subject ) ;
        return isFinite ( numericVal ) ? numericVal : null ;
    } ;

    Text . deriveFrom = function ( subject ) {
        return subject + '' ;
    } ;

    // Internal flags for methods.

    Routine . inject ( {

        conceal : function ( ) {
            this . _concealed = true ;
            return this ;
        } ,

        safeguard : function ( ) {
            this . _safeguarded = true ;
            return this ;
        }

    } ) ;

    // The core Kind (Type) system.

    var Kind = this . Kind = function ( categoryName , targetRef ) {
        if ( categoryName ) {
            var lcName = categoryName . toLowerCase ( ) ;
            var kindCheck = function ( subject ) {
                return ( kindOf ( subject ) == lcName ) ;
            } ;

            Kind [ 'is' + categoryName ] = kindCheck ;
            if ( targetRef != null ) {
                targetRef . prototype . _category = ( function ( ) {
                    return lcName ;
                } ) . conceal ( ) ;
            }
        }

        if ( targetRef == null ) {
            return null ;
        }

        targetRef . augment ( this ) ;
        targetRef . _originator = Kind ;
        targetRef . prototype . _originator = targetRef ;

        return targetRef ;
    } ;

    var objStringRep = Object . prototype . toString ;

    Kind . isIterable = function ( subject ) {
        return ( subject != null && typeof subject . length == 'number' && objStringRep . call ( subject ) != '[object Function]' ) ;
    } ;

    var interceptors = { } ;

    var getInterceptors = function ( targetRef ) {
        var category = kindOf ( targetRef . prototype ) ;
        return interceptors [ category ] || ( interceptors [ category ] = [ ] ) ;
    } ;

    var inject = function ( propKey , method ) {
        if ( method && method . _concealed ) {
            return this ;
        }

        var currentInterceptors = getInterceptors ( this ) ;

        for ( var loopIdx = 0 ; loopIdx < currentInterceptors . length ; loopIdx ++ ) {
            var interceptor = currentInterceptors [ loopIdx ] ;
            if ( kindOf ( interceptor ) == 'type' ) {
                inject . call ( interceptor , propKey , method ) ;
            } else {
                interceptor . call ( this , propKey , method ) ;
            }
        }

        var priorValue = this . prototype [ propKey ] ;
        if ( priorValue == null || ! priorValue . _safeguarded ) {
            this . prototype [ propKey ] = method ;
        }

        if ( this [ propKey ] == null && kindOf ( method ) == 'function' ) {
            augment . call ( this , propKey , function ( subject ) {
                return method . apply ( subject , segmentFunc . call ( arguments , 1 ) ) ;
            } ) ;
        }

        return this ;
    } ;

    var augment = function ( propKey , method ) {
        if ( method && method . _concealed ) {
            return this ;
        }
        var priorValue = this [ propKey ] ;
        if ( priorValue == null || ! priorValue . _safeguarded ) {
            this [ propKey ] = method ;
        }
        return this ;
    } ;

    Kind . inject ( {

        inject : inject . batchAssigner ( ) ,

        augment : augment . batchAssigner ( ) ,

        synonym : function ( categoryName , sourceProp ) {
            inject . call ( this , categoryName , this . prototype [ sourceProp ] ) ;
        } . batchAssigner ( ) ,

        reflect : function ( interceptor ) {
            getInterceptors ( this ) . push ( interceptor ) ;
            return this ;
        }

    } ) ;

    new Kind ( 'Type' , Kind ) ;

    // Enforce native types for consistency.

    var enforce = function ( categoryName , targetRef , methods ) {
        var isKind = ( targetRef != Object ) ,
            blueprint = targetRef . prototype ;

        if ( isKind ) {
            targetRef = new Kind ( categoryName , targetRef ) ;
        }

        for ( var loopIdx = 0 , len = methods . length ; loopIdx < len ; loopIdx ++ ) {
            var propKey = methods [ loopIdx ] ,
                sharedMethod = targetRef [ propKey ] ,
                blueprintMethod = blueprint [ propKey ] ;

            if ( sharedMethod ) {
                sharedMethod . safeguard ( ) ;
            }

            if ( isKind && blueprintMethod ) {
                delete blueprint [ propKey ] ;
                blueprint [ propKey ] = blueprintMethod . safeguard ( ) ;
            }
        }

        if ( isKind ) {
            targetRef . inject ( blueprint ) ;
        }

        return enforce ;
    } ;

    enforce ( 'Text' , String , [
        'charAt' , 'charCodeAt' , 'concat' , 'indexOf' , 'lastIndexOf' , 'match' , 'quote' , 'replace' , 'search' ,
        'slice' , 'split' , 'substr' , 'substring' , 'toLowerCase' , 'toUpperCase'
    ] ) ( 'List' , Array , [
        'pop' , 'push' , 'reverse' , 'shift' , 'sort' , 'splice' , 'unshift' , 'concat' , 'join' , 'slice' ,
        'indexOf' , 'lastIndexOf' , 'filter' , 'forEach' , 'every' , 'map' , 'some' , 'reduce' , 'reduceRight'
    ] ) ( 'Numeric' , Number , [
        'toExponential' , 'toFixed' , 'toLocaleString' , 'toPrecision'
    ] ) ( 'Routine' , Function , [
        'apply' , 'call' , 'bind'
    ] ) ( 'RegExp' , RegExp , [
        'exec' , 'test'
    ] ) ( 'Object' , Object , [
        'create' , 'defineProperty' , 'defineProperties' , 'keys' ,
        'getPrototypeOf' , 'getOwnPropertyDescriptor' , 'getOwnPropertyNames' ,
        'preventExtensions' , 'isExtensible' , 'seal' , 'isSealed' , 'freeze' , 'isFrozen'
    ] ) ( 'Date' , Date , [ 'now' ] ) ;

    Object . augment = augment . batchAssigner ( ) ;

    Date . augment ( 'now' , function ( ) {
        return + ( new Date ) ;
    } ) ;

    new Kind ( 'Boolean' , Boolean ) ;

    // Fixes NaN being classified as Numeric.

    Number . prototype . _category = function ( ) {
        return isFinite ( this ) ? 'number' : 'null' ;
    } . conceal ( ) ;

    // Add a random number generator to Numeric.

    Number . augment ( 'generateRandom' , function ( lowerBound , upperBound ) {
        return Math . floor ( Math . random ( ) * ( upperBound - lowerBound + 1 ) + lowerBound ) ;
    } ) ;

    // Iteration utilities.

    Object . augment ( 'iterateOver' , function ( targetRef , processor , contextArg ) {
        for ( var propKey in targetRef ) {
            if ( targetRef . hasOwnProperty ( propKey ) ) {
                processor . call ( contextArg , targetRef [ propKey ] , propKey , targetRef ) ;
            }
        }
    } ) ;

    Object . applyToEach = Object . iterateOver ;

    Array . inject ( {

        iterateOver : function ( processor , contextArg ) {
            for ( var loopIdx = 0 , len = this . length ; loopIdx < len ; loopIdx ++ ) {
                if ( loopIdx in this ) {
                    processor . call ( contextArg , this [ loopIdx ] , loopIdx , this ) ;
                }
            }
        } ,

        applyToEach : function ( processor , contextArg ) {
            Object . iterateOver ( this , processor , contextArg ) ;
            return this ;
        }

    } ) ;

    // List & Object duplication, Object combination and attachment.

    var copyOf = function ( subject ) {
        switch ( kindOf ( subject ) ) {
            case 'array' : return subject . duplicate ( ) ;
            case 'object' : return Object . duplicate ( subject ) ;
            default : return subject ;
        }
    } ;

    Array . inject ( 'duplicate' , function ( ) {
        var loopIdx = this . length , duplicate = new Array ( loopIdx ) ;
        while ( loopIdx -- ) {
            duplicate [ loopIdx ] = copyOf ( this [ loopIdx ] ) ;
        }
        return duplicate ;
    } ) ;

    var integrateItem = function ( origin , propKey , itemValue ) {
        switch ( kindOf ( itemValue ) ) {
            case 'object' :
                if ( kindOf ( origin [ propKey ] ) == 'object' ) {
                    Object . combine ( origin [ propKey ] , itemValue ) ;
                } else {
                    origin [ propKey ] = Object . duplicate ( itemValue ) ;
                }
            break ;
            case 'array' : origin [ propKey ] = itemValue . duplicate ( ) ; break ;
            default : origin [ propKey ] = itemValue ;
        }
        return origin ;
    } ;

    Object . augment ( {

        combine : function ( origin , firstArg , itemVal ) {
            if ( kindOf ( firstArg ) == 'string' ) {
                return integrateItem ( origin , firstArg , itemVal ) ;
            }
            for ( var loopIdx = 1 , len = arguments . length ; loopIdx < len ; loopIdx ++ ) {
                var targetRef = arguments [ loopIdx ] ;
                for ( var propKey in targetRef ) {
                    integrateItem ( origin , propKey , targetRef [ propKey ] ) ;
                }
            }
            return origin ;
        } ,

        duplicate : function ( targetRef ) {
            var duplicate = { } ;
            for ( var propKey in targetRef ) {
                duplicate [ propKey ] = copyOf ( targetRef [ propKey ] ) ;
            }
            return duplicate ;
        } ,

        attach : function ( initialObj ) {
            for ( var loopIdx = 1 , len = arguments . length ; loopIdx < len ; loopIdx ++ ) {
                var supplement = arguments [ loopIdx ] || { } ;
                for ( var propKey in supplement ) {
                    initialObj [ propKey ] = supplement [ propKey ] ;
                }
            }
            return initialObj ;
        }

    } ) ;

    // Define 'Kind' for object-less categories.

    [ 'Object' , 'WhiteSpace' , 'TextNode' , 'Collection' , 'Arguments' ] . applyToEach ( function ( categoryName ) {
        new Kind ( categoryName ) ;
    } ) ;

    // Global unique identifier.

    var GlobalId = Date . now ( ) ;

    Text . augment ( 'createIdentifier' , function ( ) {
        return ( GlobalId ++ ) . toString ( 36 ) ;
    } ) ;


} ) ( ) ;

// This segment provides extensions to the Array (List) prototype.
// It includes methods for iteration, filtering, and manipulation.

Array . inject ( {

    executeOnEach : function ( actionIdentifier ) {
        // Corrected: use the global segmentFunc for slicing arguments
        var inputArgs = segmentFunc . call ( arguments , 1 ) ;
        return this . transform ( function ( subject ) {
            return subject [ actionIdentifier ] . apply ( subject , inputArgs ) ;
        } ) ;
    } ,

    allMatch : function ( processor , contextArg ) {
        for ( var loopIdx = 0 , len = this . length ; loopIdx < len ; loopIdx ++ ) {
            if ( ( loopIdx in this ) && ! processor . call ( contextArg , this [ loopIdx ] , loopIdx , this ) ) {
                return false ;
            }
        }
        return true ;
    } ,

    selectMatching : function ( processor , contextArg ) {
        var filteredItems = [ ] ;
        for ( var loopIdx = 0 , len = this . length ; loopIdx < len ; loopIdx ++ ) {
            if ( ( loopIdx in this ) && processor . call ( contextArg , this [ loopIdx ] , loopIdx , this ) ) {
                filteredItems . push ( this [ loopIdx ] ) ;
            }
        }
        return filteredItems ;
    } ,

    purify : function ( ) {
        return this . selectMatching ( function ( subject ) {
            return subject != null ;
        } ) ;
    } ,

    locateItem : function ( subject , fromIndex ) {
        var listLength = this . length ;
        for ( var loopIdx = ( fromIndex < 0 ) ? Math . max ( 0 , listLength + fromIndex ) : fromIndex || 0 ; loopIdx < listLength ; loopIdx ++ ) {
            if ( this [ loopIdx ] === subject ) {
                return loopIdx ;
            }
        }
        return -1 ;
    } ,

    transform : function ( processor , contextArg ) {
        var filteredItems = [ ] ;
        for ( var loopIdx = 0 , len = this . length ; loopIdx < len ; loopIdx ++ ) {
            if ( loopIdx in this ) {
                filteredItems [ loopIdx ] = processor . call ( contextArg , this [ loopIdx ] , loopIdx , this ) ;
            }
        }
        return filteredItems ;
    } ,

    anyMatch : function ( processor , contextArg ) {
        for ( var loopIdx = 0 , len = this . length ; loopIdx < len ; loopIdx ++ ) {
            if ( ( loopIdx in this ) && processor . call ( contextArg , this [ loopIdx ] , loopIdx , this ) ) {
                return true ;
            }
        }
        return false ;
    } ,

    pairWithKeys : function ( keysList ) {
        var resObj = { } , itemCount = Math . min ( this . length , keysList . length ) ;
        for ( var loopIdx = 0 ; loopIdx < itemCount ; loopIdx ++ ) {
            resObj [ keysList [ loopIdx ] ] = this [ loopIdx ] ;
        }
        return resObj ;
    } ,

    matchAndAssign : function ( targetObject ) {
        var outcome = { } ;
        for ( var loopIdx = 0 , len = this . length ; loopIdx < len ; loopIdx ++ ) {
            for ( var propKey in targetObject ) {
                if ( targetObject [ propKey ] ( this [ loopIdx ] ) ) {
                    outcome [ propKey ] = this [ loopIdx ] ;
                    delete targetObject [ propKey ] ;
                    break ;
                }
            }
        }
        return outcome ;
    } ,

    hasItem : function ( subject , fromIndex ) {
        return this . locateItem ( subject , fromIndex ) != -1 ;
    } ,

    attach : function ( inputList ) {
        this . push . apply ( this , inputList ) ;
    }

} ) ;