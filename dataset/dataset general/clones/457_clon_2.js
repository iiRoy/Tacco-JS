/**
 * Triggered Actions for Data Management
 *
 */

 /**
  * @fires preElementAddition
  * Description: Broadcasts just before a new element is incorporated into the data structure. Invoking `event.preventDefault()` will prevent the element from being added.
  *
  * Parameter: {object} owner - the parent object to which the new element will be appended
  */

 /** 
  * @fires elementAdded
  * Description: Broadcasts after an element has been successfully integrated into the data structure.
  * Parameter: {object} element - the newly added element object within the data structure
  */

 /** 
  * @fires preElementRemoval
  * Description: Broadcasts just before an element is excised from the data structure. Invoking `event.preventDefault()` will prevent the element from being removed.
  *
  * Parameter: {object} element - the element object slated for removal
  */

 /** 
  * @fires elementRemoved
  * Description: Broadcasts after an element has been excised from the data structure.
  * Parameter: {number} elementIdentifier - the numerical index ID of the element that was removed
  * Parameter: {object} owner - the parent object of the element that was removed
  */

 /** 
  * @fires identifierValueModified
  * Description: Broadcasts after an element's *identifier* has been altered. *Note:* this event fires on each character input in the identifier field. It will also trigger when `setIdentifierValue()` is invoked with the `emitEvent` flag set to true.
  *
  * Parameter: {string} currentValue - the content of the identifier input box
  * Parameter: {HTMLElement} domNode - the HTML element used for user input
  * Parameter: {object} element - the element object for the `identifier : value` pairing
  */

 /** 
  * @fires attributeValueModified
  * Description: Broadcasts after an element's *attribute* has been altered. *Note:* this event fires on each character input in the attribute input element if the element is a *string category*. It will also trigger when `setAttributeValue()` is invoked with the `emitEvent` flag set to true.
  *
  * Parameter: {string} currentValue - the content of the attribute input box
  * Parameter: {HTMLElement} domNode - the HTML element used for user input
  * Parameter: {object} element - the element object for the `identifier : value` pairing
  */

 /** 
  * @fires preElementCategoryReset
  * Description: Broadcasts just before an element's *category* has been reset (e.g., the element reverts to an undefined state). Invoking `event.preventDefault()` will prevent the element category from being reset.
  * Parameter: {object} element - the element object that will lose its category
  */

 /** 
  * @fires elementCategoryReset
  * Description: Broadcasts after an element's *category* has been reset.
  * Parameter: {object} element - the element object that lost its category
  */

 /** 
  * @fires structureChanged
  * Description: Broadcasts any time the data structure has undergone modification. This enables tracking multiple element events with a single callback. The structureChanged event fires in conjunction with `elementAdded`, `elementRemoved`, `identifierValueModified`, `attributeValueModified`, and `elementCategoryReset` events. The structureChanged event details will mirror the object documented for each corresponding event (depending on the modification type), along with an additional property `modificationKind`.
  *
  * Parameter: {string} modificationKind - the type of modification that occurred, represented by the name of the corresponding event
  */

 /** 
  * @fires dataCorrupted
  * Description: Broadcasts when an issue arises within the data structure.
  * Parameter: {object} issueObject - the internal error object generated for the issue, as defined in the *error handling section*
  * Parameter: {object} element - the element object where the issue occurred
  */

 /** 
  * @fires dataValidated
  * Description: Broadcasts once the data structure is free of any issues. No relevant `event.detail` is provided for this event.
  */





( function ( ) {

  // Global ID counter for elements
  var globalCounter = 0;

  ElementHost( 'data-structure-manager', {


    // The original data object provided, in its initial form
    sourceData: false,

    // The specially processed object...
    // This is the initial object, but transformed into a specific
    // format to manage alterations and metadata...
    processedData: false,

    // A mapping array to link deep nested elements to their unique IDs...
    // This also helps in direct access to a specific deep object
    // for modification, avoiding complex traversal through arbitrary
    // deep object paths (since it's in memory and fundamentally the same object)
    elementMap: false,

    // A textual message for the user/developer indicating an issue with the data
    dataIssue: "Problem",

    // A reference to the internal data object of the currently
    // active element in editing mode, if any
    activeEditElement: null,

    // A reference to the HTML element that is currently focused in the DOM
    currentFocusElement: null,

    // A collection of existing validation problems within the JSON document
    validationProblems: { },

    // A flag indicating whether validation features should execute,
    // set to false if visual error feedback is not desired
    // (the only automatic internal validation is for duplicate identifiers)
    validationEnabled: true,


    /*
    *
    * ELEMENT HOST CORE FUNCTIONS
    *
    */
    initialized: function ( ) {
      this.sourceData = { };
      this.initializeState( );
    },

    contentReady: function ( ) {
      this.emit( "contentReady" );
    },

    /* END ELEMENT HOST CORE FUNCTIONS */


    initializeState: function ( ) {
      this.processedData = {
        "id": -1,
        "contents": [ ],
        "owner": false,
        "childIdentifierIndex": 0,
        "category": "object"
      };
      this.elementMap = { };
      this.validationProblems = { };
      this.elementMap[ this.processedData.id ] = this.processedData;
    },

    valueToText: function ( inputString ) {

      var dataType = typeof inputString;

      if ( dataType === "string" || dataType === "boolean" || dataType === "number" ) {
        return ( inputString ).toString( );
      }

      if ( inputString === null ) {
        return "null";
      }

      if ( inputString === undefined ) {
        return "undefined";
      }

      return inputString;

    },

    transformType: function ( inputString ) {

      if ( inputString === 'null' || inputString === null ) {
        return null;
      }

      if ( inputString === 'undefined' || inputString === undefined ) {
        return undefined;
      }

      if ( inputString === 'false' || inputString === false ) {
        return false;
      }

      if ( inputString === 'true' || inputString === true ) {
        return true;
      }

      var trimmedInput = ( inputString.trim && inputString.trim( ) ) || inputString;
      if ( trimmedInput.length === 0 || isNaN( trimmedInput ) ) {
        return inputString;
      }

      if ( !isNaN( inputString ) ) {
        return parseFloat( inputString );
      }

      return inputString;

    },

    isDomEvent: function ( potentialEvent ) {
      return potentialEvent instanceof Event;
    },

    invokedByDom: function ( invocationArguments ) {
      return this.isDomEvent( invocationArguments[ 0 ] );
    },

    iterateChildren: function ( elementCollection, callbackFunction ) {
      if ( elementCollection instanceof Array ) {
        for ( var i = 0; i < elementCollection.length; i++ ) {
          callbackFunction( elementCollection[ i ], i );
        }
      }
      else if ( typeof elementCollection === "object" ) {
        for ( var i in elementCollection ) {
          callbackFunction( elementCollection[ i ], i );
        }
      }
    },

    retrieveElement: function ( elementIdentifier ) {
      return this.elementMap[ elementIdentifier ];
    },

    getPeerElements: function ( elementIdentifier ) {
      var currentElement = this.retrieveElement( elementIdentifier );
      return currentElement.owner && currentElement.owner.contents;
    },

    isValueTerminal: function ( currentVal ) {
      if ( !currentVal || typeof currentVal !== "object" ) {
        return true;
      }
      return false;
    },
    determineValueType: function ( currentVal ) {
      if ( currentVal === undefined ) {
        return undefined;
      }
      if ( this.isValueTerminal( currentVal ) ) {
        return "string";
      }
      else if ( currentVal instanceof Array ) {
        return "array";
      }
      return "object";
    },

    isElementRoot: function ( currentElement ) {
      return currentElement.id === -1;
    },

    elementCanContainChildren: function ( elementIdentifier ) {
      var currentElement = this.retrieveElement( elementIdentifier );
      if ( currentElement ) {
        return currentElement.category === "array" || currentElement.category === "object";
      }
      return false;
    },

    

    /*
    *
    * ELEMENT HOST TEMPLATE UTILITY FUNCTIONS
    *
    * The following functions are employed within the template HTML
    * to facilitate iteration over objects, as element host templates
    * do not yet provide native object iteration support
    *
    */
    isCollection: function ( inputVal ) {
      return inputVal instanceof Array;
    },

    isNotCollection: function ( inputVal ) {
      return !( inputVal instanceof Array );
    },
    /* END ELEMENT HOST TEMPLATE UTILITY FUNCTIONS */








    
    /* ELEMENT HOST PROPERTY CHANGE LISTENERS */

    // Each time the sourceData property changes, we must
    // re-process the new object into our specialized format and reset
    // relevant internal variables
    sourceDataUpdated: function ( ) {
      if ( typeof this.sourceData === "object" ) {
        return this.processInputData( );
      }
    },
    /* END ELEMENT HOST PROPERTY CHANGE LISTENERS */


    







    /*
    *
    * ELEMENT HOST TEMPLATE INTERACTION HANDLERS
    *
    */

    emitModificationEvent: function ( eventInfo, eventName, isAsynchronous ) {

      var callMethod = isAsynchronous ? "emitAsync" : "emit";

      this[ callMethod ]( eventName, eventInfo );

      eventInfo.modificationKind = eventName;
      this[ callMethod ]( 'structureChanged', eventInfo );

    },


    /**
     * @method addElement
     *
     * Description: Incorporates a new element into the specified `containerId` element. To add the element to the top level, pass `-1` for the containerId. This method is also utilized by the editor template, so any events related to element additions will trigger `preElementAddition`, `elementAdded`, and `structureChanged`. To bypass this behavior, use `generateNewElement()` instead.
     *
     * Parameter: {number} containerId - The ID of the container element to which the new element will be added.
     *
     * Parameter: {string} [providedKey] - The identifier for the new element. Providing any falsy value (except `0`) will result in an auto-generated identifier. If an identifier is provided that already exists among siblings, duplicate identifier problems will be flagged.
     *
     * Parameter: {*} [providedValue] - The value for the new element. If a string or falsy value is passed, it will be converted to a string representation. If an object or array is passed, those items will be automatically generated as children within the editor. If `undefined` is passed, the new element will have an undetermined category.
     *
     * Parameter: {boolean} [activateEditMode] - Set to true to place the new element's identifier into editing mode (focus).
     *
     * @returns {object|boolean} The new element object that was added to the editor, or `false` if an issue occurred.
     *
     */
    addElement: function ( containerId, providedKey, providedValue, activateEditMode ) {
      

      if ( this.invokedByDom( arguments ) ) {
        var triggeredElement = arguments[ 2 ];
        var currentContainerId = triggeredElement.getAttribute( 'data-id' );
        return this.addElement( currentContainerId, undefined, undefined, true );
      }


      var selfRef = this;

      // Obtain the target container object
      var targetContainer = this.elementMap[ containerId ] || this.processedData;

      var triggerEvent = this.emit( 'preElementAddition', {
        "owner": targetContainer,
        "key": providedKey,
        "value": providedValue
      } );

      // If the user called preventDefault in their callback for
      // "preElementAddition", we will not proceed with adding the element!
      if ( triggerEvent.propagationStopped ) {
        return null;
      }

      var addedElement = this.generateNewElement( containerId, providedKey, providedValue );

      // Automatically engage edit mode for the new element's "key" input field
      if ( activateEditMode && targetContainer.category !== "array" ) {
        this.beginEditingAsync( addedElement.id );
      }


      var eventDetails = {
        "element": addedElement
      };

      this.emitModificationEvent( eventDetails, 'elementAdded', true );

      return addedElement;
      
    },



    /**
     * @method removeElement
     *
     * Description: Excises an element from the editor. This action will also eliminate any descendant elements it might possess, clear any associated validation problems, and resolve any duplicate identifier issues related to the element itself. The `preElementRemoval` and `elementRemoved` events will both be triggered when this method is invoked.
     *
     * Parameter: {number} elementId - The ID of the element to be removed.
     *
     * @returns {boolean} Returns `true` if the element was successfully removed, `false` if an issue occurred.
     *
     */
    removeElement: function ( elementId ) {

      if ( this.invokedByDom( arguments ) ) {
        var triggeredElement = arguments[ 2 ];
        var elementIdentifier = triggeredElement.getAttribute( 'data-id' );
        return this.removeElement( elementIdentifier );
      }


      var removedObject = this.retrieveElement( elementId );
      
      if ( removedObject && !this.isElementRoot( removedObject ) ) {

        var containingCollection = ( removedObject.owner && removedObject.owner.contents ) || this.processedData.contents;
        var elementIsChildOfArray = this.isElementPartOfCollection( elementId );

        if ( containingCollection ) {

          for ( var i = 0; i < containingCollection.length; i++ ) {
            
            var currentChild = containingCollection[ i ];

            if ( currentChild.id === removedObject.id ) {

              var preRemovalEvent = this.emit( 'preElementRemoval', {
                "element": removedObject,
              } );

              // If the user called preventDefault in their callback for
              // "preElementRemoval", we will not proceed with removing the element!
              if ( preRemovalEvent.propagationStopped ) {
                return null;
              }

              // Erase all validation problems from this element and its descendants
              this.resolveProblem( elementId );
              this.resolveChildProblems( elementId );

              // Remove element from its container and the element map
              containingCollection.splice( i, 1 );
              this.removeElementFromMap( elementId );


              // If the element was part of an array, re-index its siblings'
              // IDs to maintain proper sequential order
              if ( elementIsChildOfArray ) {
                this.reindexChildren( containingCollection );
              }
              // If the element is not part of an array, ensure
              // any duplicate identifier problems are resolved
              else {
                this.resolveDuplicateIdentifiers( containingCollection, removedObject.key );
              }

              var removalDetails = {
                "id": elementId,
                "owner": removedObject.owner
              };
              this.emitModificationEvent( removalDetails, 'elementRemoved', true );


              return true;

            }
          }
        }
      }
      return false;
    },



    // Upon focusing on an element's identifier OR value, initiate edit mode for that field
    handleFocus: function ( eventData, eventPayload, domNode ) {

      if ( !this.invokedByDom( arguments ) ) {
        var targetElementId = arguments[ 0 ] || null;
        var fieldToFocus = arguments[ 1 ] || null;
        if ( fieldToFocus !== 'key' && fieldToFocus !== 'value' ) {
          fieldToFocus = 'key';
        }
        var focusedDomElement = this.getDomElement( targetElementId, fieldToFocus );
        return focusedDomElement.setFocus( );
      }

      var elementIdToFocus = domNode.getAttribute( 'data-id' );

      var focusedObject = this.elementMap[ elementIdToFocus ];

      // If attempting to focus on an identifier, and the element is a direct child of
      // an array category, abort, because array identifiers should not be editable
      if ( domNode.cssClasses.contains( 'identifier-field' ) && this.isElementPartOfCollection( elementIdToFocus ) ) {