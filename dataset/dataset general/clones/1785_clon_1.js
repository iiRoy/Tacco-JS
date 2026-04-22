// This is a component definition for URLInput.
Class ( Dm . UI , 'URLInput' ) . inherits ( Widget ) ( {

    // The HTML template for the component.
    HTML :
        '\
        <form></form>\
    ',

    // CSS class for the main element.
    ELEMENT_CLASS : 'url-input-component' ,

    // Prototype methods and properties for the component.
    prototype : {

        // Initialization method for the URLInput component.
        init : function init ( config ) {

            // Call the parent Widget's init method.
            Widget . prototype . init . call ( this , config ) ;


            // Append the URL input field to the component's element.
            this . appendChild (
                new Dm . UI . Input ( {
                    name : 'input' , // Identifier for the input element.
                    label : 'URL:' , // Display label for the input.
                    type : 'url' ,   // Specifies the input type as URL.
                    value : this . inputValue || '' , // Sets the initial value, or an empty string.
                    className : 'url-input' // CSS class for styling the input.
                } )
            ) . render ( this . element ) ; // Render the input into the current component's element.

            // Append the "Go" button next to the input field.
            this . appendChild (
                new Dm . UI . Button ( {
                    name : 'button' , // Identifier for the button element.
                    text : 'Go' ,     // Text displayed on the button.
                    className : 'url-button-go' // CSS class for styling the button.
                } )
            ) . render ( this . element ) ; // Render the button into the current component's element.

            // Bind all necessary event listeners for the component.
            this . _bindEvents ( ) ;

        } , // End of the init method.


        // Private method to set up all event listeners for the component.
        // It handles interactions like form submission and input field clicks.
        _bindEvents : function _bindEvents ( ) {

            // Attach a submit event listener to the main element (form).
            // It calls _submitHandler, ensuring 'this' context is correct.
            this . element . on ( 'submit' , this . _submitHandler . bind ( this ) ) ;

            // Attach a click event listener to the input field.
            // On click, it selects all text within the input.
            this . input . bind ( 'click' , function ( ) {
                this . inputElement . select ( ) ;
            } ) ;

            return this ; // Allows for method chaining.
        } , // End of _bindEvents method.


        // Private method to handle the form submission logic.
        // It dispatches a custom event with the input's current value.
        _submitHandler : function _submitHandler ( ) {

            // Dispatch a 'submit' event, providing the current value of the input.
            this . dispatch ( 'submit' , {
                inputValue : this . input . getValue ( )
            } ) ;

            // Return false to prevent the default browser form submission behavior.
            return false ;
        } // End of _submitHandler method.

    } // End of prototype object.

} ) ; // End of Class definition for Dm.UI.URLInput.