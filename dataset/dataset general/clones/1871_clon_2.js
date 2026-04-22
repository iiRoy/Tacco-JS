(  function () {

  var   dataTools = {

    integrateData: function( targetObj , srcObj ) {
      if ( targetObj && srcObj ) {
        var   propName;
        for ( propName in srcObj ) {
          if ( srcObj.hasOwnProperty( propName ) ) {
            targetObj[ propName ] = srcObj[ propName ];
          }
        }
      }
      return targetObj;
    }
  ,
    cloneData: function ( originalItem ) {
      var   clonedItem = {};
      if ( originalItem ) {
        dataTools.integrateData( clonedItem , originalItem );
      }
      return clonedItem;
    }
  ,
    extractKeys: function ( subjectObj ) {
      var   propNames = [],
            currentKey;
      for ( currentKey in subjectObj ) {
        if ( subjectObj.hasOwnProperty( currentKey ) ) {
         propNames.push( currentKey );
        }
      }
      return propNames;
    }
  };

  var   iterateAsync = function (  elements , itemProcessor , completionCallback ) {
    var   totalItems = elements.length ,
          iterIndex = -1;

    var advanceIteration = function () {
      iterIndex ++;
      if ( iterIndex < totalItems ) {
        var   elementValue = elements[ iterIndex ];
        itemProcessor( elementValue , advanceIteration );
      } else {
        completionCallback();
      }
    };

    advanceIteration();
  };

  var   creationDefinitions = {};

  var   declareModel = function ( modelIdentifier , schemaObject , baseProperties ) {
    creationDefinitions[ modelIdentifier ] = {
      schemaObject: schemaObject
    , baseProperties: baseProperties
    };
  };

  var   constructInstance = function ( entityName , customProperties , completionHandler ) {
    if ( typeof customProperties === 'function' ) {
      completionHandler = customProperties;
      customProperties = {};
    }

    var   targetModel = creationDefinitions[ entityName ].schemaObject;
    var   instanceAttrs = dataTools.cloneData( creationDefinitions[ entityName ].baseProperties );
    dataTools.integrateData( instanceAttrs , customProperties );

    iterateAsync( dataTools.extractKeys( instanceAttrs ) , function ( attributeKey , continueProcessing ) {
      var   valueGenerator = instanceAttrs[ attributeKey ];
      if ( typeof valueGenerator === 'function' ) {
        valueGenerator( function ( generatedValue ) {
          instanceAttrs[ attributeKey ] = generatedValue;
          continueProcessing();
        });
      } else {
        continueProcessing();
      }
    } , function () {
      var   newEntity = new targetModel();
      var   propKey;
      for ( propKey in instanceAttrs ) {
        if ( instanceAttrs.hasOwnProperty( propKey ) ) {
          newEntity[ propKey ] = instanceAttrs[ propKey ];
        }
      }
      completionHandler( newEntity );
    });
  };

  var   materializeObject = function ( entityIdentifier , specificAttrs , onSaved ) {
    if ( typeof specificAttrs === 'function' ) {
      onSaved = specificAttrs;
      specificAttrs = {};
    }

    constructInstance( entityIdentifier , specificAttrs , function ( savedDocument ) {
      savedDocument.save( function ( operationError ) {
        if ( operationError ) {
          throw operationError;
        }
        onSaved( savedDocument );
      });
    });
  };

  var   establishAssociation = function ( relatedEntityName , targetAttribute ) {
    return function ( associationCallback ) {
      materializeObject( relatedEntityName , function ( linkedDocument ) {
        if ( targetAttribute ) {
          associationCallback( linkedDocument[ targetAttribute ] );
        } else {
          associationCallback( linkedDocument );
        }
      });
    };
  };

  var   ItemFactory    = materializeObject;
  ItemFactory.register = declareModel;
  ItemFactory.make     = constructInstance;
  ItemFactory.construct = materializeObject;
  ItemFactory.associate = establishAssociation;

  if ( typeof module !== 'undefined' && module.exports ) {
    module.exports = ItemFactory;
  } else {
    this.ItemFactory = ItemFactory;
  }
}() );