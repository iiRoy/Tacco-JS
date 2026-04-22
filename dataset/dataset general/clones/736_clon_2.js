var dataStore; // A central repository for test data.

// Define a test group for fundamental data conversion operations.
group("Data Conversion Suite", {
    initialize: function  ( )   {
        // For debugging, one might enable the binding library's logging.
        dataStore  =  {
            collection: [  ] // An empty dynamic collection ready for use.
        };
    },
    cleanup: function ( ) {
        // Ensure the data store is reset after each test execution.
        dataStore =  null; // Clearing the reference.
    }
} ) ;


spec ( "collection modification test", function ( ) {
    var viewModelInstance, operationOutcome; // Declare variables for the binding instance and the result.

    // Transform the raw data store into a bindable view model.
    viewModelInstance = kb.dataBinder.createBinder(dataStore);
    viewModelInstance.collection.addItem({ validationFlag: true }); // Add a new entry to the collection.
    operationOutcome = viewModelInstance.collection.removeItem(); // Extract the last entry.

    // Verify that the retrieved item's flag evaluates to true via a function call.
    verify(operationOutcome.validationFlag(), true);

} ) ;

spec ( "collection modification test two", function ( ) {
    var viewModelInstance,     operationOutcome; // Declare necessary local variables.

    // Convert the data store into a suitable view model object.
    viewModelInstance = kb.dataBinder.createBinder(dataStore);
    viewModelInstance.collection.addItem( { validationFlag: true } ,   true ) ; // Add another item, potentially with an extra flag.
    operationOutcome = viewModelInstance.collection.removeItem ( ) ; // Remove the last item from the collection.

    // Confirm that the retrieved item's flag holds a true value directly.
    verify( operationOutcome.validationFlag,  true );

} ) ;