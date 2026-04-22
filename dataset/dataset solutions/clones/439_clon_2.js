var CookbookEntry = ( function ( ) {
  function CookbookEntry ( dishIdentifier , componentItems ) {
    this.determineTotalCost = function ( ) {
      var accumulatedAmount = 0 ;
      this.componentItems.forEach ( function ( ingredientPart ) {
        accumulatedAmount += ingredientPart.componentValue ;
      } ) ;
      return accumulatedAmount ;
    } ;
    this.entryIdentifier = dishIdentifier ;
    this.componentItems = componentItems ;
  }
  return CookbookEntry ;
} ) ( ) ;


var FoodComponent = ( function ( ) {
  function FoodComponent ( componentLabel , componentValue ) {
    this.entryIdentifier = componentLabel ;
    this.componentValue = componentValue ;
  }
  return FoodComponent ;
} ) ( ) ;


function findItemByLabel ( collectionOfItems , targetKey ) {
  var foundItemObject = null ;
  collectionOfItems.forEach ( function ( currentItem ) {
    if ( currentItem.entryIdentifier === targetKey ) {
      foundItemObject = currentItem ;
    }
  } ) ;
  return foundItemObject ;
}


( function ( rawTextContent ) {
  function computeOptimalValue ( targetKey ) {
    var rawIngredient = findItemByLabel ( basicIngredientsList , targetKey ) ,
        recipeEntry = findItemByLabel ( complexRecipeEntries , targetKey ) ,
        finalCalculatedCost ;

    if ( recipeEntry !== null ) {
      recipeEntry.componentItems.map ( function ( subComponent ) {
        subComponent.componentValue = computeOptimalValue ( subComponent.entryIdentifier ) ;
        return subComponent ;
      } ) ;
      if ( recipeEntry.determineTotalCost ( ) < rawIngredient.componentValue ) {
        finalCalculatedCost = recipeEntry.determineTotalCost ( ) ;
      } else {
        finalCalculatedCost = rawIngredient.componentValue ;
      }
    } else {
      finalCalculatedCost = rawIngredient.componentValue ;
    }
    return finalCalculatedCost ;
  }

  var inputDataLines = rawTextContent.replace ( /\r/g , '' ) . split ( "\n" ) ,
      linePointer = 0 ,
      elementCount ,
      loopCounter ,
      targetItemEntry ,
      minimumPriceRecords ,
      basicIngredientsList ,
      complexRecipeEntries ;

  while ( true ) {
    minimumPriceRecords = [ ] ;
    basicIngredientsList = [ ] ;
    complexRecipeEntries = [ ] ;

    elementCount = Number.parseInt ( inputDataLines.shift ( ) ) ;
    if ( elementCount === 0 ) {
      break ;
    }

    for ( loopCounter = 0 ; loopCounter < elementCount ; loopCounter ++ ) {
      var temporaryParts = inputDataLines.shift ( ) . split ( ' ' ) ,
          comp = new FoodComponent ( temporaryParts [ 0 ] , Number.parseInt ( temporaryParts [ 1 ] ) ) ;
      basicIngredientsList.push ( comp ) ;
    }

    elementCount = Number.parseInt ( inputDataLines.shift ( ) ) ;
    for ( loopCounter = 0 ; loopCounter < elementCount ; loopCounter ++ ) {
      var temporaryParts = inputDataLines.shift ( ) . split ( ' ' ) ,
          newRecipeInstance ,
          composedIngredients = [ ] ;
      temporaryParts.slice ( 2 ) . forEach ( function ( ingredientNameKey , currentIdx ) {
        var compItem = findItemByLabel ( basicIngredientsList , ingredientNameKey ) ;
        composedIngredients.push ( compItem ) ;
      } ) ;
      newRecipeInstance = new CookbookEntry ( temporaryParts [ 0 ] , composedIngredients ) ;
      complexRecipeEntries.push ( newRecipeInstance ) ;
    }

    basicIngredientsList.forEach ( function ( componentData ) {
      var formulaMatch = findItemByLabel ( complexRecipeEntries , componentData.entryIdentifier ) ;
      if ( formulaMatch !== null ) {
        minimumPriceRecords.push ( new FoodComponent ( componentData.entryIdentifier , computeOptimalValue ( componentData.entryIdentifier ) ) ) ;
      } else {
        minimumPriceRecords.push ( componentData ) ;
      }
    } ) ;

    targetItemEntry = findItemByLabel ( minimumPriceRecords , inputDataLines.shift ( ) ) ;
    console.log ( targetItemEntry.componentValue ) ;
  }
} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;