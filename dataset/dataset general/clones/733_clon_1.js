/*
 * This file defines the Room object constructor and its associated methods.
 * It manages UI elements related to a "room" in an application context.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

var  Room   =    function ( elementId )
{
    // These are the public properties that will be accessible
    // from any instance of the Room object.
    this.element    =    $( "#"   +   elementId );
    this.tooltip    =    this.element.find( ".tooltip" );


    // The following method call ensures that the tooltip is
    // properly initialized right after a Room object is created.
    this.initalizeTooltip();
}    ;    // End of Room constructor definition.


// This section defines a static method for the Room class.
// It can be invoked directly on the class itself, without
// needing an instance. For example: Room.count().
Room.count    =    function ( )
{
    // This method counts the number of elements with the class 'room'.
    // It is a simple utility function that returns the total count.
    return   $( ".room" ).length ;
}    ;


/*
 * The prototype chain allows methods to be shared among all instances
 * of the Room object, saving memory and promoting code reuse.
 *
 * The 'initalizeTooltip' method is an instance method, meaning it
 * operates on a specific instance of a Room.
 * To use it, you must first create an instance of a Room:
 *
 * Example Usage:
 *     let  myRoom  =  new  Room( "some_id" );
 *     myRoom.initalizeTooltip();
 *
 */
Room.prototype.initalizeTooltip    =    function ( )
{
    // We need to capture the 'this.tooltip' context here
    // because the 'this' keyword will change its reference within the
    // anonymous callback functions of the 'hover' method.
    // Storing it in a local variable 'tooltip' preserves access to the correct object.
    var   tooltip   =   this.tooltip ;

    this.element.hover(
        function ( )   {
            // Inside this particular callback function, 'this' refers to the DOM element
            // that triggered the hover event, not the Room instance itself.
            // Hence, we must rely on the captured 'tooltip' variable to access the tooltip element.
            tooltip.show( );
        },
        function ( )   {
            // This is the mouse-out callback function.
            // It effectively hides the tooltip when the mouse cursor leaves the element.
            tooltip.hide( );
        }
    ) ;
}    ;


// Another instance method for retrieving text content from within the room's element.
Room.prototype.roomText    =    function ( )
{
    // This method locates the first paragraph element ( <p> ) within the room's
    // main element and then returns its textual content.
    return   this.element.find( "p" ).text( ) ;
}    ;


// This method provides access to the next sibling element in the DOM tree,
// relative to the room's primary element.
Room.prototype.next    =    function ( )
{
    return   this.element.next( ) ;
}    ;