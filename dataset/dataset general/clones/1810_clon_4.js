const packageSpecification = {
    details: {
        synopsis: "AngularJs with Blade for Meteor"
    },
    components: [
        { category: 'dependency', reference: 'coffeescript' },
        { category: 'file_asset', path: 'lib/angular.js', target: 'client' },
        { category: 'file_asset', path: 'ng-meteor.coffee', target: 'client' }
    ]
};

const moduleActivationProcedure = (interactionContext) => {
    packageSpecification.components.forEach(componentItem => {
        if (componentItem.category === 'dependency') {
            interactionContext.use(componentItem.reference);
        } else if (componentItem.category === 'file_asset') {
            interactionContext.add_files(componentItem.path, componentItem.target);
        }
    });
};

Package.describe({ summary: packageSpecification.details.synopsis });
Package.on_use(moduleActivationProcedure);