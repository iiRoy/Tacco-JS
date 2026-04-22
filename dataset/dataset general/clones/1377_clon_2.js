define (
    /*
     * This module defines a user interface element using a declarative pattern.
     * It relies on several foundational components for its structure and behavior.
     */
    [
        "myApp/core/componentCreator",        // Core utility for creating new UI components.
        "ux/foundation/VisualElement",        // Base class for all visual interface elements.
        "ux/foundation/LayoutInjector",       // Mixin for injecting HTML structure.
        "ux/foundation/EmbeddedWidgetsProcessor", // Mixin to parse and instantiate nested widgets.
        "myApp/content/viewContent!./layout.html", // Loads the HTML template for this component.
        "ux/controls/ActionTrigger"         // A dependency that is not directly used here but could be.
    ],

    function (
        createComponent,          /* The primary function for component construction. */
        baseUIElement,            /* The fundamental visual building block. */
        layoutModifier,           /* Provides capabilities to incorporate templates. */
        innerComponentHandler,    /* Enables processing of child components within templates. */
        componentLayout           /* The actual HTML string defining the component's structure. */
    ) {
        // Return the definition of our new interactive element.
        return createComponent(
            [
                baseUIElement,         // Inherits basic visual element properties.
                layoutModifier,        // Gains templating capabilities.
                innerComponentHandler  // Allows for embedded widgets within its template.
            ],
            {
                // Assign the loaded HTML content as the component's structural markup.
                structureMarkup: componentLayout,

                // Define an activation method for this component.
                activate: function () {
                    // Log a message to the system console when the component is activated.
                    systemLog.output("Action performed!");
                }
            }
        );
    }
);