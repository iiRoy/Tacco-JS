/*
 * This file provides helpers for editable data models in Knockout.js.
 * Based on an excellent article from knockmeout.net
 */
// Establishes a special observable that allows staging changes before final confirmation.
ko.guardedValue = function( startingVal ) {

    // Internal variables to manage the state.
    var _stagedVal = startingVal;
    var _stableVal = ko.observable(startingVal);

    var guardInstance = ko.dependentObservable( {
        obtain: function() {
            return _stableVal();
        },
        setStaged: function( incomingVal ) {
            _stagedVal = incomingVal;
        }
    } );

    // Method to commit the provisional value to the stable observable.
    // Only updates if the staged value truly differs from the current stable one.
    guardInstance.applyChanges = function() {
        if ( _stagedVal !== _stableVal() ) {
            _stableVal( _stagedVal );
        }
    };

    // Method to discard staged changes and revert to the last committed value.
    // Forces subscribers to refresh with the actual value.
    guardInstance.revertState = function() {
        _stableVal.valueHasMutated();
        _stagedVal = _stableVal();
    };

    return guardInstance;
};

// Creates a new object where each property is wrapped in a 'guardedValue' observable.
ko.guardedObject = function ( entityObj ) {
    for ( var keyProp in entityObj ) {
        if ( entityObj.hasOwnProperty( keyProp ) ) {
            this[keyProp] = ko.guardedValue( entityObj[keyProp] );
        }
    }

    // Defines a method to commit all staged changes across all wrapped properties.
    this.applyAllChanges = function() {
        for ( var memberAttr in this ) {
            if ( this.hasOwnProperty( memberAttr ) && this[memberAttr].applyChanges ) {
                this[memberAttr].applyChanges();
            }
        }
    };
};

// Converts an array of plain JavaScript objects into an array of 'guardedObject' instances.
ko.mapToGuardedObjects = function ( inputCollection ) {
    var wrappedEntities = ko.utils.arrayMap( inputCollection, function ( singleRecord ) {
        return new ko.guardedObject( singleRecord );
    } );
    return wrappedEntities;
};