function controlFor ( container , name )
{

    return $( '*[name=' + name + ']' , container ) ;
}


function valueFrom ( name )
{
    return controlFor ( this , name )
        .val ( ) ;
}

/* Schema filtering logic starts here */

$ ( function ( )
{
    function toggle ( value , index , element )
    {
        var row = $( element ) ; // Get the current row element
        var toggler = row . html ( ) . indexOf ( value ) != -1
            ? 'show' // If value is found, show the row
            : 'hide' ; // Otherwise, hide it


        row [ toggler ] ( ) ; // Execute the show/hide method
    }

    function update ( )
    {
        var value = $ ( this ) . val ( ) ; // Get the current input value
        // Bind the toggle function with the current value
        var filter = _ . bind ( toggle , { } , value ) ;

        // Iterate over schema table rows and apply the filter
        $ ( '.schema-table tbody tr' )
            .each ( filter ) ;
    }

    function init ( )
    {
        // Create an input element for filtering
        var input = $ ( '<input type="text"/>' )
            .attr ( { placeholder : 'Filter schema' } )
            .appendTo ( this ) ; // Append to the current element

        input . keyup ( update ) ; // Attach update function to keyup event
    }

    $ ( '.schema-filter' )
        .each ( init ) ; // Initialize filter for each schema-filter element
} ) ;

/*
 * Schema update controls:
 * Handles dynamic generation of EDN based on form inputs.
 */

$ ( function ( )
{
    function booleanFrom ( name )
    {
        // Check if a control is checked
        return controlFor ( this , name )
            .is ( ':checked' ) ;
    }

    function uniqueVal ( value )
    {
        return value
            ? '   :db/unique :db.unique/' + value + '\n' // Format for unique attribute
            : '' ; // No unique attribute
    }

    function update ( )
    {
        var container = $ ( this ) ; // Current container element
        var valueOf = _ . bind ( valueFrom , container ) ; // Bound valueFrom
        var booleanOf = _ . bind ( booleanFrom , container ) ; // Bound booleanFrom
        var editor = $ ( 'textarea' , container ) . data ( 'editor' ) ; // CodeMirror editor instance
        var edn = '[{ :db/id #db/id[:db.part/db]\n' +
                  '   :db/ident ' + valueOf ( 'ident' ) + '\n' +
                  '   :db/valueType :db.type/' + valueOf ( 'valueType' ) + '\n' +
                  '   :db/cardinality :db.cardinality/' + valueOf ( 'cardinality' ) + '\n' +
                  '   :db/doc "' + valueOf ( 'doc' ) . replace ( '"' , '\\"' ) + '"\n' +
                  uniqueVal ( valueOf ( 'unique' ) ) +
                  '   :db/fulltext ' + booleanOf ( 'fulltext' ) + '\n' +
                  '   :db/noHistory ' + booleanOf ( 'noHistory' ) + '\n' +
                  '   :db.install/_attribute :db.part/db }]' ; // Construct EDN string

        editor . setValue ( edn ) ; // Set the EDN content in the editor
        // Mark the text as read-only
        editor . markText (
            { line : 0 , ch : 0 } ,
            { line : 100 , ch : 100 } ,
            { readOnly : true }
        ) ;
    }

    function init ( )
    {
        var container = $ ( this ) ; // Current container
        var updateEdn = _ . bind ( update , container ) ; // Bound update function
        var onChange = _ . debounce ( updateEdn , 500 ) ; // Debounced update for performance
        var selector = '.control-group input, .control-group select' ; // Selector for controls

        $ ( '.control-group select' )
            .change ( onChange ) ; // Attach change event for selects

        $ ( '.control-group input[type=text]' )
            .keyup ( onChange ) ; // Attach keyup event for text inputs

        $ ( '.control-group input[type=checkbox]' )
            .click ( onChange ) ; // Attach click event for checkboxes

        setTimeout ( onChange , 100 ) ; // Initial update after a short delay
    }

    $ ( '.schema-update' )
        .each ( init ) ; // Initialize update controls for each schema-update element
} ) ;

/*
 * Data inserting functionality:
 * Handles dynamic form fields for inserting data.
 */

$ ( function ( )
{
    function remove ( row )
    {
        row . remove ( ) ; // Remove the specified row element
    }

    function initRow ( )
    {
        var row = $ ( this ) ; // Current row element
        var destroy = _ . bind ( remove , { } , row ) ; // Bind remove with the row

        $ ( '<a></a>' )
            .html ( 'delete' ) // Set link text
            .addClass ( 'delete' ) // Add CSS class
            .click ( destroy ) // Attach click handler
            .appendTo ( row ) ; // Append to the row
    }

    function toNameValue ( field )
    {
        var valueOf = _ . bind ( valueFrom , field ) ; // Bound valueFrom for the field

        return { name : valueOf ( 'name' ) ,
                 value : valueOf ( 'value' ) } ; // Return object with name and value
    }

    function toEdn ( acc , e )
    {
        return acc + '\n   ' + e . name + ' ' + e . value ; // Accumulate EDN string
    }

    function update ( )
    {
        var editor = $ ( 'textarea' , this ) . data ( 'editor' ) ; // CodeMirror editor instance
        var fields = $ ( '.field' , this ) ; // All field elements
        var edn = _ . chain ( fields ) // Start Underscore chain
                   .map ( toNameValue ) // Map fields to name/value objects
                   .reduce ( toEdn , '' ) // Reduce to EDN string
                   .value ( ) ; // Get the final value

        editor . setValue ( '[{ ' + edn . substring ( 4 ) + ' }]' ) ; // Set EDN, removing leading newline/spaces
    }

    function make ( name )
    {
        var input = $ ( '<input type="text"/>' )
            .attr ( { name : name } ) ; // Create input with given name

        return $ ( '<div></div>' )
            .addClass ( name ) // Add class based on name
            .append ( input ) ; // Append input to div
    }

    function toResult ( datum )
    {
        var id = ':' + datum [ 'db/ident' ] ; // Format identifier

        return { id : id , text : id } ; // Return Select2 result format
    }

    function results ( data )
    {
        return { results : _ . map ( data , toResult ) } ; // Map data to Select2 results
    }

    function query ( term )
    {
        return { term : term } ; // Return query term for AJAX
    }

    function select2Changed ( name , onChange , evt )
    {
        controlFor ( name , 'name' )
            .val ( evt . val ) ; // Set the value of the 'name' control

        onChange ( ) ; // Trigger general update
    }

    function add ( container )
    {
        var fields = $ ( '.fields' , container ) ; // Fields container
        var updater = _ . bind ( update , container ) ; // Bound update function
        var onChange = _ . debounce ( updater , 500 ) ; // Debounced update
        var config = { placeholder : 'Select an atrribute...' ,
                       ajax : { url : '/session/schema.json' ,
                               data : query ,
                               results : results } } ; // Select2 configuration
        var name = make ( 'name' ) ; // Create 'name' field
        var value = make ( 'value' ) ; // Create 'value' field
        var row = $ ( '<div></div>' )
            .addClass ( 'field' ) // Add class 'field'
            .append ( name ) // Append name field
            .append ( value ) // Append value field
            .appendTo ( fields ) ; // Append to fields container

        name . select2 ( config ) // Initialize Select2 on the name field
            .on ( 'change' , _ . bind ( select2Changed , { } , name , onChange ) ) ; // Attach change handler
        value . keyup ( onChange ) ; // Attach keyup for value field

        initRow . apply ( row ) ; // Initialize the new row
    }

    function init ( )
    {
        var container = $ ( this ) ; // Current container
        var fields = $ ( '.fields' , container ) ; // Fields container
        var addRow = _ . bind ( add , { } , container ) ; // Bound add function

        $ ( '<a></a>' )
            .addClass ( 'add btn btn-info' ) // Add CSS classes
            .html ( 'Add Attribute' ) // Set link text
            .click ( addRow ) // Attach click handler
            .insertAfter ( fields ) ; // Insert after fields container
    }

    $ ( '.data-insert' )
        .each ( init ) ; // Initialize for each data-insert element
} ) ;

$ ( function ( )
{
    // Initialise a code element into a CodeMirror editor
    //
    function initCodeElement ( )
    {
        var config = { mode : "clojure" ,
                       lineNumbers : true ,
                       matchBrackets : true } ; // CodeMirror configuration

        $ ( this ) . data ( 'editor' , CodeMirror . fromTextArea ( this , config ) ) ; // Initialize editor and store instance
    }

    $ ( 'textarea' )
        .each ( initCodeElement ) ; // Apply to all textarea elements
} ) ;

$ ( function ( )
{
    $ ( '.disconnect' )
        .click ( function ( )
        {
            // Confirm before proceeding with disconnection
            return confirm ( 'Are you sure?' ) ;
        } ) ;
} ) ;