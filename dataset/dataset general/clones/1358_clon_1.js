// This file defines an Angular.js widget, specifically a menu component.
// It uses the RequireJS 'define' function to encapsulate the module.

define(
    [ "angular" ], // Dependencies required by this module.
    function ( angular )
    {

        // Obtain a reference to the 'app.widgets' module, where this widget will reside.
        var module = angular.module( 'app.widgets' );

        // Register a new directive named 'menuWidget'.
        // Directives are markers on a DOM element that tell Angular to attach a specified behavior to that DOM element.
        // For more details, refer to the Angular.js directive guide.
        module.directive(
            'menuWidget', // The name of the directive, used as an attribute in HTML.
            function ( Routing, Localization )
            {
                // The directive definition object (DDO).
                return {
                    // 'restrict: A' means this directive can only be used as an HTML attribute.
                    restrict:       'A',

                    // 'scope' creates an isolated scope for the directive.
                    // This prevents the directive from polluting the parent scope and vice-versa.
                    scope:          {
                        // 'model: =' establishes a two-way data binding between the directive's scope
                        // and an attribute on the directive's element in the parent scope.
                        model:      '='
                    },
                    
                    // 'templateUrl' specifies the path to the HTML template for this directive.
                    // The 'Routing' service is used to dynamically generate the template URL.
                    templateUrl:    Routing.getTemplateUrl( '{{baseUrl}}/menu.html' ),

                    // The 'controller' function for the directive.
                    // This is where the business logic for the directive typically resides.
                    controller:     function ( $scope )
                    {
                        // No specific controller logic implemented here yet.
                        // This section can be extended as needed for the menu's functionality.
                    },

                    // The 'link' function is responsible for manipulating the DOM and registering event listeners.
                    // It is executed after the template has been compiled and linked to the scope.
                    link:           function ( $scope, element, attrs, controller )
                    {
                        // This function is currently empty.
                        // It can be used for direct DOM manipulation, adding event handlers,
                        // or other low-level interactions with the directive's element.
                    }
                };
            }
        );

        // Return the module object, making it available to other RequireJS modules.
        return module;

    }
);