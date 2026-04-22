AppClient = Ember.Application.create( );

AppClient.Router.map(function() {
    this.entity('entities', { route: "/" } );
});

AppClient.Entity = Ember.Object.extend( {} );

AppClient.Entity.reopenClass(
    {
        fetchMany: function(sourceAddress) {
            return $.getJSON(sourceAddress)
                .then(
                    function(dataPacket) {
                        return AppClient.Entity.create(dataPacket);
                    }
                );
        }
    }
);


AppClient.EntitiesRoute = Ember.Route.extend({

    dataModel: function() {
        AppClient.Entity.fetchMany('destination link here')
            .then(function (itemPayload) {
                console.log(itemPayload);
            });
    }

});