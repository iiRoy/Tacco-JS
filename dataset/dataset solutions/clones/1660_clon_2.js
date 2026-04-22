/*! path: /opt/myproject/src/solution/competition/aztec2020/solution.js */
/******/ ( function ( codeChunks ) { // moduleBundler
/******/ 	// The loaded sections cache
/******/ 	var loadedSections = {};
/******/
/******/ 	// The module resolution function
/******/ 	function __module_resolver__ ( sectionId ) {
/******/
/******/ 		// Verify if section is in cache
/******/ 		if ( loadedSections[ sectionId ] ) {
/******/ 			return loadedSections[ sectionId ].output;
/******/ 		}
/******/ 		// Construct a fresh section (and store it into the cache)
/******/ 		var codeSection = loadedSections[ sectionId ] = {
/******/ 			identifier : sectionId ,
/******/ 			loadedFlag : false ,
/******/ 			output : {}
/******/ 		};
/******/
/******/ 		// Run the section function
/******/ 		codeChunks[ sectionId ] . call ( codeSection . output , codeSection , codeSection . output , __module_resolver__ ) ;
/******/
/******/ 		// Indicate the section as loaded
/******/ 		codeSection . loadedFlag = true ;
/******/
/******/ 		// Return the output of the section
/******/ 		return codeSection . output ;
/******/ 	}
/******/
/******/
/******/ 	// expose the chunks collection (__bundle_chunks__)
/******/ 	__module_resolver__ . map = codeChunks ;
/******/
/******/ 	// expose the section cache
/******/ 	__module_resolver__ . cache = loadedSections ;
/******/
/******/ 	// define accessor function for module output
/******/ 	__module_resolver__ . defineGetter = function ( outputVal , propName , propAccessor ) {
/******/ 		if ( ! __module_resolver__ . hasProperty ( outputVal , propName ) ) {
/******/ 			Object . defineProperty ( outputVal , propName , { enumerable : true , get : propAccessor } ) ;
/******/ 		}
/******/ 	} ;
/******/
/******/ 	// define __isESModule on output
/******/ 	__module_resolver__ . registerModule = function ( outputVal ) {
/******/ 		if ( typeof Symbol !== 'undefined' && Symbol . moduleTag ) {
/******/ 			Object . defineProperty ( outputVal , Symbol . moduleTag , { content : 'Module' } ) ;
/******/ 		}
/******/ 		Object . defineProperty ( outputVal , '__isESModule' , { content : true } ) ;
/******/ 	} ;
/******/
/******/ 	// generate a proxy namespace object
/******/ 	// flags & 1: sourceVal is a section id, resolve it
/******/ 	// flags & 2: combine all properties of sourceVal into the namespace
/******/ 	// flags & 4: return sourceVal when already a namespace object
/******/ 	// flags & 8|1: behave like resolve
/******/ 	__module_resolver__ . createNamespace = function ( sourceVal , flags ) {
/******/ 		if ( flags & 1 ) sourceVal = __module_resolver__ ( sourceVal ) ;
/******/ 		if ( flags & 8 ) return sourceVal ;
/******/ 		if ( ( flags & 4 ) && typeof sourceVal === 'object' && sourceVal && sourceVal . __isESModule ) return sourceVal ;
/******/ 		var namespaceObj = Object . create ( null ) ;
/******/ 		__module_resolver__ . registerModule ( namespaceObj ) ;
/******/ 		Object . defineProperty ( namespaceObj , 'default' , { enumerable : true , content : sourceVal } ) ;
/******/ 		if ( flags & 2 && typeof sourceVal != 'string' ) for ( var propertyKey in sourceVal ) __module_resolver__ . defineGetter ( namespaceObj , propertyKey , function ( propertyKey ) { return sourceVal[ propertyKey ] ; } . bind ( null , propertyKey ) ) ;
/******/ 		return namespaceObj ;
/******/ 	} ;
/******/
/******/ 	// getDefaultExport function for compatibility with non-module modules
/******/ 	__module_resolver__ . getExportWrapper = function ( targetModule ) {
/******/ 		var accessorFunc = targetModule && targetModule . __isESModule ?
/******/ 			function getDefault () { return targetModule[ 'default' ] ; } :
/******/ 			function getModuleExports () { return targetModule ; } ;
/******/ 		__module_resolver__ . defineGetter ( accessorFunc , 'a' , accessorFunc ) ;
/******/ 		return accessorFunc ;
/******/ 	} ;
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__module_resolver__ . hasProperty = function ( targetObj , propKey ) { return Object . prototype . hasOwnProperty . call ( targetObj , propKey ) ; } ;
/******/
/******/ 	// __module_resolver_base_path__
/******/ 	__module_resolver__ . basePath = "" ;
/******/
/******/
/******/ 	// Load entry section and return output
/******/ 	return __module_resolver__ ( __module_resolver__ . entryPoint = "./src/contest/atcoder/msol2020/e.ts" ) ;
/******/ } )
/************************************************************************/
/******/ ( {

/***/ "./node_modules/webpack/buildin/module.js" :
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ ( function ( modData , output ) {

modData . output = function ( currentMod ) {
	if ( ! currentMod . isPolyfilled ) {
		currentMod . markDeprecated = function ( ) { } ;
		currentMod . sourcePaths = [ ] ;
		// currentMod.parent = void 0 by default
		if ( ! currentMod . childModules ) currentMod . childModules = [ ] ;
		Object . defineProperty ( currentMod , "isReady" , {
			enumerable : true ,
			get : function ( ) {
				return currentMod . loadedFlag ;
			}
		} ) ;
		Object . defineProperty ( currentMod , "uniqueId" , {
			enumerable : true ,
			get : function ( ) {
				return currentMod . identifier ;
			}
		} ) ;
		currentMod . isPolyfilled = 1 ;
	}
	return currentMod ;
} ;


/***/ } ) ,

/***/ "./src/contest/atcoder/msol2020/e.ts" :
/*!*******************************************!*\
  !*** ./src/contest/atcoder/msol2020/e.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ ( function ( currentMod , output , __module_resolver__ ) {

"use strict" ;
/* BUNDLE VARIABLE INJECTION */( function ( currentMod ) {
var __importResolver = ( this && this . __importResolver ) || function ( inputMod ) {
    return ( inputMod && inputMod . __isESModule ) ? inputMod : { "default" : inputMod } ;
} ;
Object . defineProperty ( output , "__isESModule" , { content : true } ) ;
output . entryPoint = void 0 ;
const fileSystemUtil = __importResolver ( __module_resolver__ ( /* webpackChunkName: "fs" */ "fs" ) ) ;
const inputOutputHelpers = __module_resolver__ ( /* webpackChunkName: "io" */ "./src/contest/common/io.ts" ) ;
var CoordinatePlane ;
( function ( CoordinatePlane ) {
    CoordinatePlane[ "Abscissa" ] = "X" ;
    CoordinatePlane[ "Ordinate" ] = "Y" ;
    CoordinatePlane[ "None" ] = "N" ;
} ) ( CoordinatePlane || ( CoordinatePlane = { } ) ) ;
function computeMinCost ( { count , points , assignments , xSortedPoints , ySortedPoints , } ) {
    const costArray = new Array ( count ) ;
    for ( let idx = 0 ; idx < count ; idx ++ ) {
        costArray[ idx ] = Math . min ( Math . abs ( points[ idx ] . x ) , Math . abs ( points[ idx ] . y ) ) * points[ idx ] . p ;
    }
    let previousIdx = null ;
    for ( let idx = 0 ; idx < count ; idx ++ ) {
        if ( assignments[ xSortedPoints[ idx ] . i ] == CoordinatePlane . Ordinate ) {
            previousIdx = idx ;
            costArray[ xSortedPoints[ idx ] . i ] = 0 ;
        }
        else if ( previousIdx !== null ) {
            costArray[ xSortedPoints[ idx ] . i ] = Math . min ( Math . abs ( xSortedPoints[ idx ] . x - xSortedPoints[ previousIdx ] . x ) * xSortedPoints[ idx ] . p , costArray[ xSortedPoints[ idx ] . i ] ) ;
        }
    }
    previousIdx = null ;
    for ( let idx = count - 1 ; idx >= 0 ; idx -- ) {
        if ( assignments[ xSortedPoints[ idx ] . i ] == CoordinatePlane . Ordinate ) {
            previousIdx = idx ;
            costArray[ xSortedPoints[ idx ] . i ] = 0 ;
        }
        else if ( previousIdx !== null ) {
            costArray[ xSortedPoints[ idx ] . i ] = Math . min ( Math . abs ( xSortedPoints[ idx ] . x - xSortedPoints[ previousIdx ] . x ) * xSortedPoints[ idx ] . p , costArray[ xSortedPoints[ idx ] . i ] ) ;
        }
    }
    previousIdx = null ;
    for ( let idx = 0 ; idx < count ; idx ++ ) {
        if ( assignments[ ySortedPoints[ idx ] . i ] == CoordinatePlane . Abscissa ) {
            previousIdx = idx ;
            costArray[ ySortedPoints[ idx ] . i ] = 0 ;
        }
        else if ( previousIdx !== null ) {
            costArray[ ySortedPoints[ idx ] . i ] = Math . min ( Math . abs ( ySortedPoints[ idx ] . y - ySortedPoints[ previousIdx ] . y ) * ySortedPoints[ idx ] . p , costArray[ ySortedPoints[ idx ] . i ] ) ;
        }
    }
    previousIdx = null ;
    for ( let idx = count - 1 ; idx >= 0 ; idx -- ) {
        if ( assignments[ ySortedPoints[ idx ] . i ] == CoordinatePlane . Abscissa ) {
            previousIdx = idx ;
            costArray[ ySortedPoints[ idx ] . i ] = 0 ;
        }
        else if ( previousIdx !== null ) {
            costArray[ ySortedPoints[ idx ] . i ] = Math . min ( Math . abs ( ySortedPoints[ idx ] . y - ySortedPoints[ previousIdx ] . y ) * ySortedPoints[ idx ] . p , costArray[ ySortedPoints[ idx ] . i ] ) ;
        }
    }
    return costArray . reduce ( ( totalSum , currentValue ) => totalSum + currentValue , 0 ) ;
}
function recursiveSolve ( currentIdx , chosenCount , systemState ) {
    const { assignments , count , points , minCosts , xSortedPoints , ySortedPoints } = systemState ;
    if ( currentIdx === count ) {
        const resultCost = computeMinCost ( { count : count , points : points , xSortedPoints : xSortedPoints , ySortedPoints : ySortedPoints , assignments : assignments } ) ;
        minCosts[ chosenCount ] = Math . min ( minCosts[ chosenCount ] , resultCost ) ;
        return ;
    }
    assignments[ currentIdx ] = CoordinatePlane . None ;
    recursiveSolve ( currentIdx + 1 , chosenCount , systemState ) ;
    assignments[ currentIdx ] = CoordinatePlane . Abscissa ;
    recursiveSolve ( currentIdx + 1 , chosenCount + 1 , systemState ) ;
    assignments[ currentIdx ] = CoordinatePlane . Ordinate ;
    recursiveSolve ( currentIdx + 1 , chosenCount + 1 , systemState ) ;
}
function findOptimalCosts ( { pointCount , pointData } ) {
    const minCosts = new Array ( pointCount + 1 ) . fill ( Infinity ) ;
    const currentAssignments = new Array ( pointCount ) ;
    const xSortedData = [ ... pointData ] ;
    xSortedData . sort ( ( a , b ) => a . x - b . x ) ;
    const ySortedData = [ ... pointData ] ;
    ySortedData . sort ( ( a , b ) => a . y - b . y ) ;
    const problemState = {
        count : pointCount , pointData : pointData , minCosts : minCosts , currentAssignments : currentAssignments , xSortedPoints : xSortedData , ySortedPoints : ySortedData ,
    } ;
    recursiveSolve ( 0 , 0 , problemState ) ;
    return minCosts ;
}
function executeProgram ( inputString ) {
    const readInteger = inputOutputHelpers . getNextInteger ( inputString ) ;
    const pointCount = readInteger ( ) ;
    const pointData = [ ] ;
    for ( let idx = 0 ; idx < pointCount ; idx ++ ) {
        const coordX = readInteger ( ) ;
        const coordY = readInteger ( ) ;
        const weight = readInteger ( ) ;
        pointData . push ( { x : coordX , y : coordY , p : weight , i : idx } ) ;
    }
    console . info ( findOptimalCosts ( { pointCount : pointCount , pointData : pointData } ) . join ( '\n' ) ) ;
}
output . entryPoint = executeProgram ;
if ( __module_resolver__ . cache[ __module_resolver__ . entryPoint ] === currentMod ) {
    const fileContent = fileSystemUtil . default . readContent ( "/dev/stdin" , "utf8" ) ;
    executeProgram ( fileContent ) ;
}

/* BUNDLE VARIABLE INJECTION */ } . call ( this , __module_resolver__ ( /* webpackChunkName: "(webpack)/buildin/module.js" */ "./node_modules/webpack/buildin/module.js" ) ( currentMod ) ) )

/***/ } ) ,

/***/ "./src/contest/common/io.ts" :
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ ( function ( currentMod , output , __module_resolver__ ) {

"use strict" ;

Object . defineProperty ( output , "__isESModule" , { content : true } ) ;
output . getNextBigInteger = output . getNextInteger = output . getNextToken = output . createParsedIterator = output . createTokenIterator = void 0 ;
function* createTokenIterator ( inputLine ) {
    const lineTokens = inputLine . split ( /\s+/ ) ;
    for ( const singleToken of lineTokens ) {
        yield singleToken ;
    }
}
output . createTokenIterator = createTokenIterator ;
function* createParsedIterator ( inputLine , parsingFunction ) {
    const lineTokens = inputLine . split ( /\s+/ ) ;
    for ( const singleToken of lineTokens ) {
        yield parsingFunction ( singleToken ) ;
    }
}
output . createParsedIterator = createParsedIterator ;
function getNextToken ( inputLine ) {
    const iteratorInstance = createTokenIterator ( inputLine ) ;
    return ( ) => iteratorInstance . next ( ) . content ;
}
output . getNextToken = getNextToken ;
function getNextInteger ( inputLine ) {
    const iteratorInstance = createTokenIterator ( inputLine ) ;
    return ( ) => parseInt ( iteratorInstance . next ( ) . content ) ;
}
output . getNextInteger = getNextInteger ;
function getNextBigInteger ( inputLine ) {
    const iteratorInstance = createTokenIterator ( inputLine ) ;
    return ( ) => BigInt ( iteratorInstance . next ( ) . content ) ;
}
output . getNextBigInteger = getNextBigInteger ;


/***/ } ) ,

/***/ "fs" :
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ ( function ( currentMod , output ) {

output . exports = require ( "fs" ) ;

/***/ } )

/******/ } ) ;
// # sourceMappingURL=solution_bundle.js.map