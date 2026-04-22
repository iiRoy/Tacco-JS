'use strict';

// This immediately invoked function expression (IIFE) serves to encapsulate our code,
// preventing global scope pollution by keeping variables and functions private to this block.
(function (ngRuntime, domGlobal) {

    // A constant to hold the unique identifier for our core Angular module.
    // Using a constant makes the module name easily configurable and reduces magic strings.
    const PRIMARY_MODULE_NAME = 'documentHeadUtilities';

    // Initialize the main Angular module. This module will house all our directives
    // related to managing content within the HTML <head> section.
    let activeModuleReference = ngRuntime.module(PRIMARY_MODULE_NAME, []);

    /**
     * @directive pageTitleReflector
     * @description
     * This directive is engineered to dynamically update a property on the global Angular
     * root scope with the text content of the element it's bound to. This root scope
     * property can then be used by other parts of the application (e.g., a `<title>` tag
     * in the main HTML file) to reflect the current page's title.
     *
     * Key Features:
     * - If applied as an element (e.g., `<page-title-reflector>`), it intelligently
     *   removes itself from the visual DOM, as its purpose is purely functional and
     *   not to display content directly.
     * - Continuously monitors its own inner text for changes and propagates these
     *   updates to a designated root scope property.
     * - Ensures proper cleanup by removing the root scope property when its associated
     *   scope is destroyed, preventing stale data.
     */
    activeModuleReference.directive(
        'pageTitleReflector',
        [
            '$rootScope', // Injecting the root scope service for global state management.
            function ($rootScopeService) {
                // A constant defining the key under which the page title will be stored on the root scope.
                const ROOT_SCOPE_TITLE_KEY = 'globalPageDisplayTitle';

                return {
                    restrict: 'EA', // Allows usage as an Element ('E') or an Attribute ('A').
                    link: function (localScope, boundElementRef, attributeSet) {
                        // Determine the tag name of the element this directive is attached to.
                        // We check both kebab-case and camelCase forms for flexibility.
                        let currentElementTagName = boundElementRef[0].tagName.toLowerCase();
                        const isSelfAsElement = (currentElementTagName === 'page-title-reflector' || currentElementTagName === 'pagetitlereflector');

                        // If this directive is used as a standalone element, it should be
                        // removed from the visible document flow. Its presence is purely for
                        // its functional side-effects, not for rendering.
                        if (isSelfAsElement) {
                            boundElementRef.remove();
                            // console.info(`[${PRIMARY_MODULE_NAME}] Detached functional element: ${currentElementTagName}`);
                        }

                        // An internal utility function to safely update the root scope's title property.
                        // It includes validation to ensure only non-empty strings are set.
                        const applyRootTitleUpdate = (potentialTitleContent) => {
                            if (typeof potentialTitleContent === 'string' && potentialTitleContent.trim().length > 0) {
                                $rootScopeService[ROOT_SCOPE_TITLE_KEY] = potentialTitleContent.trim();
                                // console.debug(`[${PRIMARY_MODULE_NAME}] Root scope title set: "${potentialTitleContent.trim()}"`);
                            } else {
                                // If the title content is empty or invalid, ensure the root scope property is cleared.
                                if ($rootScopeService[ROOT_SCOPE_TITLE_KEY]) {
                                    delete $rootScopeService[ROOT_SCOPE_TITLE_KEY];
                                    // console.warn(`[${PRIMARY_MODULE_NAME}] Attempted to set an invalid title. Cleared root scope title.`);
                                }
                            }
                        };

                        // Establish a watch on the text content of the bound element.
                        // Any changes detected will trigger an update to the root scope title.
                        localScope.$watch(
                            function retrieveBoundElementText() {
                                // Defensive check for the element's existence and text method.
                                return boundElementRef && boundElementRef.text ? boundElementRef.text() : '';
                            },
                            function onTextContentChange(newTextValue) {
                                applyRootTitleUpdate(newTextValue);
                            }
                        );

                        // Register a listener for the '$destroy' event on the current scope.
                        // This ensures that when the scope is no longer active, the root scope
                        // title property is cleaned up to prevent stale data or unexpected behavior.
                        localScope.$on(
                            '$destroy',
                            function performResourceCleanup() {
                                if ($rootScopeService[ROOT_SCOPE_TITLE_KEY]) {
                                    delete $rootScopeService[ROOT_SCOPE_TITLE_KEY];
                                    // console.log(`[${PRIMARY_MODULE_NAME}] Root scope title property cleared on scope destruction.`);
                                }
                            }
                        );
                    }
                };
            }
        ]
    );

    /**
     * @directive headElementRelocator
     * @description
     * This directive provides a mechanism to move any HTML element from its original
     * position in the DOM to within the document's `<head>` section. This is particularly
     * useful for dynamically adding meta tags, link tags for stylesheets, or script tags
     * that are best placed in the head.
     *
     * Key Features:
     * - Relocates the target element to the `<head>` of the document upon directive linking.
     * - The relocated element maintains its binding to its original Angular scope,
     *   allowing it to interact with scope variables and expressions even after moving.
     * - Automatically removes the element from the `<head>` when its associated scope
     *   is destroyed, ensuring a clean DOM state in single-page applications.
     */
    activeModuleReference.directive(
        'headElementRelocator',
        function () {
            // Obtain and cache a reference to the document's <head> element.
            // This lookup is performed once for efficiency.
            const documentHeadNode = ngRuntime.element(domGlobal.head);

            // Critical validation: Ensure the <head> element actually exists in the DOM.
            // If not, log an error and return an empty directive definition to prevent runtime failures.
            if (!documentHeadNode || documentHeadNode.length === 0) {
                console.error(`[${PRIMARY_MODULE_NAME}] The document's <head> element could not be found. The 'headElementRelocator' directive cannot operate.`);
                return {}; // Return an empty object to define no directive.
            }

            return {
                restrict: 'A', // This directive is exclusively used as an Attribute ('A').
                link: function (localScope, elementToRelocate, elementAttributes) {
                    // Pre-flight check: Verify that the element designated for relocation is valid.
                    if (!elementToRelocate || elementToRelocate.length === 0) {
                        console.warn(`[${PRIMARY_MODULE_NAME}] 'headElementRelocator' was applied to an undefined or empty element. Skipping relocation.`);
                        return;
                    }

                    // Attempt to append the element to the document's head.
                    // This action physically moves the element within the Document Object Model.
                    try {
                        documentHeadNode.append(elementToRelocate);
                        // console.log(`[${PRIMARY_MODULE_NAME}] Element successfully moved to the document's <head>.`);
                    } catch (relocationError) {
                        console.error(`[${PRIMARY_MODULE_NAME}] An error occurred while attempting to move element to <head>:`, relocationError);
                        // If relocation fails, we stop further processing for this element.
                        return;
                    }

                    // Attach a cleanup handler to the scope's '$destroy' event.
                    // This ensures that the relocated element is removed from the <head>
                    // when its originating scope is no longer active, crucial for SPAs.
                    localScope.$on(
                        '$destroy',
                        function removeRelocatedItem() {
                            if (elementToRelocate && elementToRelocate.remove) {
                                elementToRelocate.remove();
                                // console.log(`[${PRIMARY_MODULE_NAME}] Relocated element removed from <head> upon scope destruction.`);
                            }
                        }
                    );
                }
            };
        }
    );

// Pass the global `angular` and `document` objects into our IIFE for safe access.
})(angular, document);