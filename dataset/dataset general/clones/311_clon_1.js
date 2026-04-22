/* This script defines the core Application structure and its components. */

// Initialize the main Ember application instance.
App = Ember.Application.create();


/*
 * Define the application's routing scheme.
 * The root path '/' will be mapped to the 'people' route.
 */
App.Router.map(function ( match ) {
    match( '/' ).to( 'people' );
});


/*
 * The PeopleRoute handles the logic for the 'people' section.
 * It's responsible for fetching data and preparing the controller.
 */
App.PeopleRoute = Ember.Route.extend( {
    setupControllers: function ( controller ) {
        // Retrieve data from the 'data.json' endpoint.
        // This data will then be processed and assigned to the controller.
        $.getJSON( 'data.json', function ( data ) {
            var items = [ ]; // An array to hold processed PersonModel instances.

            /*
             * Iterate over each item received from the JSON data.
             * For every item, a new PersonModel instance is created and added to the 'items' array.
             */
            data.forEach( function ( item ) {
                items.pushObject( App.PersonModel.create( item ) );
            } );

            // Update the 'people.data' property of the controller with the newly prepared items.
            controller.set( 'people.data', items );
        } );
    }
} );


/*
 *****************************************************************************
 *                                                                           *
 *                       Defining the Core MVC Elements                      *
 *                                                                           *
 *****************************************************************************
 */


/*
 * App.PersonModel represents an individual person in the application.
 * It includes a computed property 'Location' to format city and state.
 */
App.PersonModel = Ember.Object.extend( {
    Location: function ( ) {
        return this.get( 'City' ) + ', ' + this.get( 'State' );
    }.property( 'City', 'State' )
} );


/*
 * App.PaginationView configures the pagination component.
 * It specifies that 15 pages should be displayed at a time.
 */
App.PaginationView = VG.Views.Pagination.extend( {
    numberOfPages: 15
} );


// App.TableHeaderView extends a base table header view, defining its template.
App.TableHeaderView = VG.Views.TableHeader.extend( {
    template: Ember.Handlebars.compile( '{{#if view.isCurrent}}<i {{bindAttr class="view.isAscending:icon-sort-up view.isDescending:icon-sort-down"}}></i>{{/if}}{{view.text}}' )
} );


/*
 * App.PeopleController manages the collection of people.
 * It uses Ember.ArrayController mixed with VG.Mixins.Pageable for pagination.
 * Configured to display 20 items per page.
 */
App.PeopleController = Ember.Controller.extend( {
    people: Ember.ArrayController.createWithMixins( VG.Mixins.Pageable, {
        perPage: 20
    } )
} );