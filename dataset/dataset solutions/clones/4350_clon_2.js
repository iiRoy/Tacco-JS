module.exports= function (  inputModules ) {
var    moduleCache = {};
function retrieveModule( moduleId )
{

if ( moduleCache[moduleId] ) return moduleCache[moduleId].exports;

var currentModule = moduleCache[ moduleId ] = { identifier: moduleId, loadedFlag: false, exports: { } };

inputModules[moduleId].call (currentModule.exports, currentModule, currentModule.exports, retrieveModule) ;
currentModule.loadedFlag = true ;
return currentModule.exports ;
}

retrieveModule.allModules = inputModules;
retrieveModule.cacheStore = moduleCache;

retrieveModule.defineProperty = function ( targetObject , propertyName , getterFunction )
{
  retrieveModule.hasOwnProp( targetObject , propertyName ) || Object.defineProperty( targetObject , propertyName , { enumerable: true , get: getterFunction } ) ;
};

retrieveModule.registerModule = function ( targetObject )
{
  ( "undefined" !== typeof Symbol && Symbol.toStringTag ) && Object.defineProperty( targetObject , Symbol.toStringTag , { value: "Module" } ) ;
  Object.defineProperty( targetObject , "__esModule" , { value: true } ) ;
};

retrieveModule.transformModule = function ( moduleReference , transformFlags )
{
  if ( ( 1 & transformFlags ) && ( moduleReference = retrieveModule( moduleReference ) ) ) return moduleReference ;
  if ( 8 & transformFlags ) return moduleReference ;
  if ( 4 & transformFlags && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule ) return moduleReference ;

  var tempObject = Object.create( null ) ;
  if ( retrieveModule.registerModule( tempObject ) ,
       Object.defineProperty( tempObject , "default" , { enumerable: true , value: moduleReference } ) ,
       ( 2 & transformFlags ) && typeof moduleReference !== "string" )
  {
    for ( var currentProperty in moduleReference )
      retrieveModule.defineProperty( tempObject , currentProperty , function ( exportedKey ) { return moduleReference[exportedKey] ; }.bind( null , currentProperty ) ) ;
  }
  return tempObject ;
};

retrieveModule.getNamespaceObject = function ( moduleReference )
{
  var defaultExportGetter = moduleReference && moduleReference.__esModule ? function ( ) { return moduleReference.default ; } : function ( ) { return moduleReference ; } ;
  return retrieveModule.defineProperty( defaultExportGetter , "a" , defaultExportGetter ) , defaultExportGetter ;
};

retrieveModule.hasOwnProp = function ( targetObj , checkProp )
{
  return Object.prototype.hasOwnProperty.call( targetObj , checkProp ) ;
};

retrieveModule.publicPath = "" ;

retrieveModule( retrieveModule.startModule = 0 ) ;
}
( [
  function ( moduleObj , exportsObj , loadFunc )
  {
    loadFunc( 1 )( loadFunc( 2 ).readFileSync( "/dev/stdin" , "UTF-8" ) ) ;
  } ,
  function ( moduleObj , exportsObj )
  {
    function extractElements( inputArray , expectedLength )
    {
      return (function ( inputArray ) { if ( Array.isArray( inputArray ) ) return inputArray ; } ( inputArray ) ) || (function ( inputArray , expectedLength )
      {
        var tempArray = [ ] ,
            loopActive = true ,
            loopFinished = false ,
            caughtError = void 0 ;
        try
        {
          for ( var iteratorResult , arrayIterator = inputArray[Symbol.iterator]() ;
                !( loopActive = ( iteratorResult = arrayIterator.next() ).done ) &&
                ( tempArray.push( iteratorResult.value ) , !expectedLength || tempArray.length !== expectedLength ) ;
                loopActive = true ) ;
        }
        catch ( error )
        {
          loopFinished = true ;
          caughtError = error ;
        }
        finally
        {
          try
          {
            loopActive || null == arrayIterator.return || arrayIterator.return() ;
          }
          finally
          {
            if ( loopFinished ) throw caughtError ;
          }
        }
        return tempArray ;
      } ( inputArray , expectedLength ) ) || (function ( ) { throw new TypeError( "Invalid attempt to destructure non-iterable instance" ) ; } ( ) ) ;
    }
    moduleObj.exports = function ( inputString )
    {
      for (
        var parsedParams = extractElements(
          inputString.split( "\n" )[0].split( " " ).map( function ( itemValue ) { return Number( itemValue ) ; } ) ,
          6
        ) ,
        waterUnitA = parsedParams[0] ,
        waterUnitB = parsedParams[1] ,
        sugarUnitA = parsedParams[2] ,
        sugarUnitB = parsedParams[3] ,
        maxSugarConcentration = parsedParams[4] ,
        maxTotalMass = parsedParams[5] ,
        maxRatioValue = 100 * maxSugarConcentration / ( 100 + maxSugarConcentration ) ,
        visitedStates = { } ,
        bestSolution = { currentWater: 0 , currentSugar: 0 , currentRatio: 0 } ,
        processingQueue = [ { currentWater: 0 , currentSugar: 0 } ] ;

        processingQueue.length > 0 ;
      )
      {
        var currentState = processingQueue.shift() ,
            currentMass = currentState.currentWater + currentState.currentSugar ,
            stateKey = `${currentState.currentWater}-${currentState.currentSugar}` ;

        if ( ! ( currentMass > maxTotalMass || visitedStates[stateKey] === true ) )
        {
          visitedStates[stateKey] = true ;

          var currentSugarRatio = ( 100 * currentState.currentSugar ) / currentMass ;

          currentSugarRatio > bestSolution.currentRatio &&
          currentSugarRatio <= maxRatioValue &&
          (
            bestSolution.currentRatio = currentSugarRatio ,
            bestSolution.currentWater = currentState.currentWater ,
            bestSolution.currentSugar = currentState.currentSugar
          ) ;

          processingQueue.push( { currentWater: currentState.currentWater + ( 100 * waterUnitA ) , currentSugar: currentState.currentSugar } ) ;
          processingQueue.push( { currentWater: currentState.currentWater + ( 100 * waterUnitB ) , currentSugar: currentState.currentSugar } ) ;
          processingQueue.push( { currentWater: currentState.currentWater , currentSugar: currentState.currentSugar + sugarUnitA } ) ;
          processingQueue.push( { currentWater: currentState.currentWater , currentSugar: currentState.currentSugar + sugarUnitB } ) ;
        }
      }
      ( bestSolution.currentWater === 0 && bestSolution.currentSugar === 0 ) && ( bestSolution.currentWater = ( 100 * waterUnitA ) ) ;
      console.log( `${bestSolution.currentWater + bestSolution.currentSugar} ${bestSolution.currentSugar}` ) ;
    }
  } ,
  function ( moduleObj , exportsObj )
  {
    moduleObj.exports = require( "fs" ) ;
  }
] ) ;