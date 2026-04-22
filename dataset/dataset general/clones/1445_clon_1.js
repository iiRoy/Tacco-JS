// This file defines the PersonView, a Backbone.js view for displaying a single person.
// It manages the rendering of person data and handles user interactions like deletion.

window.PersonView = Backbone.View.extend(
    {

        // The Underscore.js template function used to render the person's details.
        // It displays a delete button, the full name, and the job title.
        template : _.template( '<a class="btn-mini btn-danger" id="del" href="" name="#">delete</a> <b><%= fullName %></b> the <%= jobTitle %>' ) ,


        // The HTML tag name for the view's root element.
        // Each PersonView instance will be rendered as an `<li>` element.
        tagName : "li" ,


        // Events hash: Maps DOM events to view methods.
        // This specific event listens for a click on the element with id 'del'
        // within the view's scope and calls the 'remove' method.
        events : {
            'click #del' : 'remove'
        } ,


        // The render method is responsible for populating the view's element
        // with the template output and returning the view itself for chaining.
        render : function ( ) {

            // Convert the model to a plain JavaScript object and pass it to the template.
            // Then, set the HTML content of the view's root element ($el).
            this.$el.html( this.template( this.model.toJSON( ) ) ) ;

            // Return the view instance for method chaining.
            return this ;

        } ,


        // The remove method handles the deletion of a person from the view and the model.
        // It prevents the default action of the event and removes both the view's element
        // from the DOM and the associated model from its collection/storage.
        remove : function ( event ) {

            // Prevent the default browser action (e.g., navigating away if it's a link).
            event.preventDefault( ) ;

            // Remove the view's root element from the DOM.
            this.$el.remove( ) ;

            // Destroy the associated Backbone model. This will trigger a 'destroy' event
            // on the model and typically remove it from its collection and sync with the server.
            this.model.destroy( ) ;

        }

    }
) ;