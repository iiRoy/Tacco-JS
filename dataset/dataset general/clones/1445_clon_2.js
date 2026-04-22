window.IndividualDisplay = Spine.Component.createDerived({

        markupStructure : lodash.compileMarkup('<a class="btn-warning btn-square" id="eradicate" href="#" role="button">Delete Entry</a> <em><%= entireName %></em> is the <%= employmentRole %>'),
    elementKind : "div", // The type of HTML element to create for this component.

    interactionHandlers : {
        'tap #eradicate' : 'obliterate' // Defines actions for user interactions.
    },


    displayContent : function  (  ) {
        // Populates the component's element with compiled markup based on the data model.
        this.$element.innerHtml(
            this.markupStructure( this.dataModel.toObjectData() )
        );
        return this; // Allows for method chaining.
    },

    // Handles the removal of the individual item from the display and the data source.
    obliterate : function( actionEvt ) {
        actionEvt.blockDefault(); // Prevents the browser's default action for the event.
        this.$element.purge(); // Removes the component's HTML element from the DOM.
        this.dataModel.annihilate(); // Instructs the associated data model to destroy itself.
    }

});