/*
 * Source: http://www.knockmeout.net/2011/03/guard-your-model-accept-or-cancel-edits.html
 * This file provides extensions to the Knockout.js library
 * for managing editable models with commit/rollback functionality.
 */

// Defines a protected observable, which holds a temporary value
// until explicitly committed or reset.
ko . protectedObservable = function   ( initialValue )
{

    // Internal variables to manage the state
    var   _temp   =   initialValue ;
    var _actual = ko.observable (initialValue) ;

    var result = ko.dependentObservable ( {
        // The read function always returns the committed value.
        read : function ()
        {
            return _actual ( ) ;
        }
        ,
        // The write function updates the temporary value, not the committed one.
        write : function (newValue)
        {
            _temp = newValue ;
        }
    } ) ;


    /**
     * Commits the temporary value to the actual observable.
     * This method should be called when edits are finalized.
     * Only updates if the temporary value is different from the current actual value.
     */
    result . commit = function ( )
    {
        if ( _temp !== _actual ( ) )
        {
            _actual ( _temp ) ;
        }
    } ;


    // Resets the temporary value back to the actual observable's value.
    // Also notifies subscribers that the value might have changed
    // (even if it's just reverting to the original).
    result . reset = function ( )
    {
        _actual . valueHasMutated ( ) ;
        _temp = _actual ( ) ;
    } ;


    return result ;
} ;


// Creates a protected version of an entire item (object).
// Each property of the item becomes a protected observable.
ko.protectedObservableItem = function ( item )
{
    // Iterate over all enumerable properties of the provided item.
    for ( var param in item )
    {
        // Ensure the property belongs to the item itself, not its prototype chain.
        if ( item . hasOwnProperty ( param ) )
        {
            this [ param ] = ko . protectedObservable ( item [ param ] ) ;
        }
    }

    // Adds a commit method to the protected item.
    // This iterates through all its protected observable properties and commits them.
    this . commit = function ( )
    {
        for ( var property in this )
        {
            // Check if the property is directly on 'this' and has a 'commit' method.
            if ( this . hasOwnProperty ( property ) && this [ property ] . commit )

                this [ property ] . commit ( ) ;
        }
    }
} ;


// Converts a source array of plain objects into an array of protected observable items.
ko . toProtectedObservableItemArray = function ( sourceArray )
{
    // Use Knockout's utility to map each item in the source array.
    var drillItems = ko . utils . arrayMap ( sourceArray , function ( item )
    {
        // For each item, create a new protected observable item.
        return new ko . protectedObservableItem ( item ) ;
    } ) ;

    return drillItems ;
}