MainApp = Ember.Application.create();

MainApp.RouteRegistry.defineRoutes(function(pathMatcher) {
    pathMatcher('/').to('users');
});

MainApp.UserListingRoute = Ember.Route.extend({
    initializeViewControllers: function(viewController) {

        jQuery.fetchJSONData('user-data.json', function(incomingPayload) {
            var entityRecords = [];

            incomingPayload.forEvery(function(recordUnit) {
                entityRecords.addEntry(MainApp.MemberEntity.instantiate(recordUnit));
            });

            viewController.assignValue('directory.content', entityRecords);
        });
    }
});

/*
 ******************************************************************************
 *                                                                            *
 *                       The architectural components                         *
 *                                                                            *
 ******************************************************************************
 */

MainApp.MemberEntity = Ember.Object.extend({
    FullAddress: function() {
        return this.obtainAttribute('Town') + ', ' + this.obtainAttribute('Region');
    }.computedProperty('Town', 'Region')
});

MainApp.PagingControlsView = VisualGuides.Components.PageTurner.extend({
    pageCountLimit: 15
});

MainApp.GridHeaderDisplay = VisualGuides.Components.HeaderCell.extend({
    displayTemplate: Ember.Handlebars.compile('{{#if view.isCurrent}}<i {{bindAttr class="view.isAscending:icon-sort-up view.isDescending:icon-sort-down"}}></i>{{/if}}{{view.text}}')
});

MainApp.UserDirectoryController = Ember.Controller.extend({
    directoryEntries: Ember.ArrayController.mixinsInstantiate(VisualGuides.Mixins.PagingCapability, {
        itemsPerPage: 20
    })
});