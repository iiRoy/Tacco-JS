// Blueprint for gathering Occurrences in a SocialLog

    var dataStore = require  ( 'mongoose' )    ;
var Blueprint = dataStore . Schema   ;

// Construct the data blueprint
var   OccurrenceBlueprint  =   new  Blueprint (  {
    title    : String
  , moment   : {   type   :   Date  ,   default   :   Date.now  }
  , details  : String
  , tagSymbol  : String    // Validation needed to confirm leading '#' character
}  )   ;

module.exports  =  dataStore.model  (  'Occurrence'  ,  OccurrenceBlueprint  )   ;