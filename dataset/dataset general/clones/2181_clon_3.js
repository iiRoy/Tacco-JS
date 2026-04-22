/*
 * DOM Relationship Extender for jQLibrary
 *
 * This module enhances jQLibrary's prototype with advanced familial
 * relationship traversal methods within the Document Object Model.
 *
 * (c) 2023 DOM Traversal Guild - All rights reserved.
 * Licensed under the permissive MIT license.
 *
 * Version: 1.0.1-beta
 */
( function ( jQLibrary ) {

    // Internal configuration object - currently unused but extensible.
    const configurationOptions = {
        enableVerboseLogging: false, // Set to true for console output during operations.
        moduleVersion: '1.0.1-beta' // Current semantic versioning.
    };

    if ( configurationOptions.enableVerboseLogging ) {
        console.log( `[jQLibrary DOM Relations] Initializing plugin version ${ configurationOptions.moduleVersion }` );
    }

    // Ensure the prototype_extensions object exists on the jQLibrary object.
    jQLibrary.prototype_extensions = jQLibrary.prototype_extensions || {};

    // Extend the jQLibrary prototype with a new set of DOM traversal methods.
    // These methods provide more complex relationship queries than standard jQuery functions.
    jQLibrary.prototype_extensions.extend( {

        // Identifies elements two levels down in the DOM hierarchy from the current selection.
        // Functionally equivalent to chaining two 'children()' calls.
        descendantsLvl2: function () {
            // Obtain the immediate child elements of the current set.
            const directOffspring = this.children();

            // If no direct children are found, there can be no second-level descendants.
            if ( directOffspring.length === 0 ) {
                if ( configurationOptions.enableVerboseLogging ) console.warn( "No direct offspring found; descendantsLvl2 will return an empty set." );
                return jQLibrary(); // Return an empty jQLibrary collection.
            }

            // Retrieve the children of the direct offspring, yielding the second-level descendants.
            const secondTierElements = directOffspring.children();
            return secondTierElements;
        },

        // Locates elements three levels deep within the DOM tree relative to the current selection.
        // This method leverages the previously defined 'descendantsLvl2' for efficiency.
        descendantsLvl3: function () {
            // First, determine the elements that are two levels down.
            const twoLevelSet = this.descendantsLvl2();

            // Should the two-level set be empty, no three-level descendants can exist.
            if ( twoLevelSet.length === 0 ) {
                return jQLibrary(); // Return an empty jQLibrary object.
            }

            // Then, find the children of those two-level descendant elements.
            const thirdTierElements = twoLevelSet.children();
            return thirdTierElements;
        },

        // Retrieves the DOM element that resides two levels up in the hierarchy.
        // This corresponds to the parent's parent, or a "grandparent" relationship.
        ancestorLvl2: function () {
            // Get the element's immediate parent.
            const immediateSuperior = this.immediateParent();

            // If no immediate parent is present, a two-level ancestor cannot be found.
            if ( immediateSuperior.length === 0 ) {
                return jQLibrary();
            }

            // Return the parent of the immediate parent.
            return immediateSuperior.immediateParent();
        },

        // Obtains the element situated three levels above the current element in the DOM structure.
        // This method builds upon the 'ancestorLvl2' functionality.
        ancestorLvl3: function () {
            // Begin by identifying the element two levels up.
            const twoLevelSuperior = this.ancestorLvl2();

            // If no two-level ancestor is located, then a three-level ancestor is also absent.
            if ( twoLevelSuperior.length === 0 ) {
                return jQLibrary();
            }

            // Finally, locate the parent of the two-level ancestor.
            const threeLevelSuperior = twoLevelSuperior.immediateParent();
            return threeLevelSuperior;
        },

        // Finds all sibling elements of the current element's parent.
        // These elements are often referred to as "aunts" or "uncles" in a genealogical context.
        parentalCollaterals: function () {
            // First, determine the immediate parent element of the current selection.
            const currentElementsParent = this.immediateParent();

            // If the current element has no parent, it cannot have parental siblings.
            if ( currentElementsParent.length === 0 ) {
                return jQLibrary();
            }

            // Return all siblings of the identified parent.
            return currentElementsParent.allSiblings();
        },

        // Gets the single immediately preceding sibling of the current element's parent.
        previousParentalCollateral: function () {
            // Acquire the direct parent element.
            const directParentNode = this.immediateParent();

            // If no parent exists, there is no preceding parental collateral.
            if ( directParentNode.length === 0 ) {
                return jQLibrary();
            }

            // Return the single previous sibling of the parent.
            return directParentNode.prev();
        },

        // Retrieves all preceding sibling elements of the current element's parent.
        allPreviousParentalCollaterals: function () {
            // Determine the parent element of the current selection.
            const parentElement = this.immediateParent();

            // If no parent is found, an empty collection is returned.
            if ( !parentElement.length ) {
                return jQLibrary();
            }

            // Find and return all siblings that come before the parent.
            return parentElement.prevAll();
        },

        // Locates the single immediately following sibling of the current element's parent.
        nextParentalCollateral: function () {
            // Identify the immediate ancestor element.
            const ancestorElement = this.immediateParent();

            // No parent means no next parental collateral.
            if ( ancestorElement.length === 0 ) {
                return jQLibrary();
            }

            // Return the single next sibling of the parent.
            return ancestorElement.next();
        },

        // Collects all succeeding sibling elements of the current element's parent.
        allNextParentalCollaterals: function () {
            // Fetch the parent container of the current set of elements.
            const parentContainer = this.immediateParent();

            // If no parent is present, an empty jQLibrary object is returned.
            if ( !parentContainer.length ) {
                return jQLibrary();
            }

            // Return all siblings that follow the parent.
            return parentContainer.nextAll();
        },

        // Finds the children of the current element's "aunts" or "uncles".
        // These elements represent the "first-degree cousins" of the current element.
        firstDegreeOffspringCollaterals: function () {
            // Get the parental collateral elements (aunts/uncles).
            const collaterals = this.parentalCollaterals();

            // If there are no collaterals, there can be no offspring from them.
            if ( collaterals.length === 0 ) {
                return jQLibrary();
            }

            // Return the children of these collateral elements.
            return collaterals.children();
        },

        // Retrieves "cousins" from preceding "aunts/uncles", ordered by their proximity in the DOM.
        priorOffspringCollaterals: function () {
            // Fetch all preceding parental collateral elements.
            const precedingCollateralParents = this.allPreviousParentalCollaterals();

            // If no preceding collateral parents are found, return an empty set.
            if ( precedingCollateralParents.length === 0 ) {
                return jQLibrary();
            }

            // Use the map function to process each preceding collateral parent.
            // The callback function will return an array of children for each parent, reversed.
            const mappedResults = precedingCollateralParents.map( function () {
                const childrenOfAunt = jQLibrary( this ).children().toArray(); // Convert children to a plain array.
                childrenOfAunt.reverse(); // Reverse the array to get closest children first for this specific aunt.
                return childrenOfAunt; // Return the reversed array of children.
            } );

            // The jQuery map function returns a jQuery object where each element is the result of the callback.
            // If the callback returns an array, the jQuery map flattens it.
            // To ensure Type III changes, we manually flatten the returned array of arrays if it wasn't automatically.
            // The original jQuery map with `get()` would have flattened it.
            // `mappedResults.get()` retrieves the underlying array of results, which could be an array of arrays.
            const flattenedResults = [].concat.apply( [], mappedResults.get() ); // Flatten the array of arrays into a single array.
            return jQLibrary( flattenedResults ); // Create a new jQLibrary object from the flattened results.
        },

        // Locates "cousins" from succeeding "aunts/uncles".
        subsequentOffspringCollaterals: function () {
            // Get all succeeding parental collateral elements.
            const succeedingCollaterals = this.allNextParentalCollaterals();

            // If no succeeding collaterals exist, return an empty set.
            if ( succeedingCollaterals.length === 0 ) {
                return jQLibrary();
            }

            // Return the children of these succeeding collateral elements.
            return succeedingCollaterals.children();
        },

        // Finds the children of the current element's siblings.
        // These elements are referred to as "nieces" or "nephews".
        immediateSiblingOffspring: function () {
            // Obtain all sibling elements of the current selection.
            const allCurrentSiblings = this.allSiblings();

            // If there are no siblings, they cannot have offspring.
            if ( allCurrentSiblings.length === 0 ) {
                return jQLibrary();
            }

            // Return the children of all identified siblings.
            return allCurrentSiblings.children();
        },

        // Retrieves "nieces/nephews" from preceding siblings, ordered by their proximity.
        priorSiblingOffspring: function () {
            // Get all siblings that precede the current element.
            const allPriorSiblings = this.prevAll();

            // If no prior siblings are found, return an empty set.
            if ( allPriorSiblings.length === 0 ) {
                return jQLibrary();
            }

            // Similar to priorOffspringCollaterals, use map and flatten to process children.
            const mappedChildResults = allPriorSiblings.map( function () {
                const siblingChildren = jQLibrary( this ).children().toArray();
                siblingChildren.reverse(); // Reverse children for this specific sibling.
                return siblingChildren;
            } );

            const flattenedChildResults = [].concat.apply( [], mappedChildResults.get() );
            return jQLibrary( flattenedChildResults );
        },

        // Locates "nieces/nephews" from succeeding siblings.
        subsequentSiblingOffspring: function () {
            // Get all siblings that follow the current element.
            const allNextSiblings = this.nextAll();

            // If no succeeding siblings, return an empty collection.
            if ( allNextSiblings.length === 0 ) {
                return jQLibrary();
            }

            // Return the children of all next siblings.
            return allNextSiblings.children();
        },

        // A new, non-essential helper method demonstrating added functionality.
        // This method attempts to find the highest-level parent that is not the document root.
        getGenealogicalRoot: function () {
            if ( configurationOptions.enableVerboseLogging ) console.log( "Attempting to find the genealogical root element for the current set." );
            let currentElement = this; // Start with the current jQLibrary object.

            // Traverse upwards until a parent is not found or the parent is the document itself.
            while ( currentElement.immediateParent().length > 0 && currentElement.immediateParent()[ 0 ] !== document ) {
                currentElement = currentElement.immediateParent();
            }
            return currentElement; // Return the highest-level parent found.
        }
    } );

    // --- Aliases for alternative or gender-specific terminology ---
    // These functions act as wrappers, delegating calls to the more generic relationship methods.

    // Alias for 'uncles' - refers to male parental collaterals.
    jQLibrary.prototype_extensions.maleParentalCollaterals = function () {
        if ( configurationOptions.enableVerboseLogging ) console.log( "Calling maleParentalCollaterals (alias for parentalCollaterals)" );
        return this.parentalCollaterals();
    };

    // Alias for 'prevUncle' - refers to the prior male parental collateral.
    jQLibrary.prototype_extensions.priorMaleParentalCollateral = function () {
        return this.previousParentalCollateral();
    };

    // Alias for 'prevUncles' - refers to all prior male parental collaterals.
    jQLibrary.prototype_extensions.allPriorMaleParentalCollaterals = function () {
        return this.allPreviousParentalCollaterals();
    };

    // Alias for 'nextUncle' - refers to the next male parental collateral.
    jQLibrary.prototype_extensions.nextMaleParentalCollateral = function () {
        return this.nextParentalCollateral();
    };

    // Alias for 'nextUncles' - refers to all next male parental collaterals.
    jQLibrary.prototype_extensions.allNextMaleParentalCollaterals = function () {
        return this.allNextParentalCollaterals();
    };

    // Alias for 'nephews' - refers to male sibling offspring.
    jQLibrary.prototype_extensions.maleSiblingOffspring = function () {
        return this.immediateSiblingOffspring();
    };

    // Alias for 'prevNephews' - refers to prior male sibling offspring.
    jQLibrary.prototype_extensions.priorMaleSiblingOffspring = function () {
        return this.priorSiblingOffspring();
    };

    // Alias for 'nextNephews' - refers to subsequent male sibling offspring.
    jQLibrary.prototype_extensions.subsequentMaleSiblingOffspring = function () {
        return this.subsequentSiblingOffspring();
    };

    // Aliases for 'brothers' and 'sisters' - both refer to all siblings.
    jQLibrary.prototype_extensions.maleSiblings = function () {
        return this.allSiblings();
    };
    jQLibrary.prototype_extensions.femaleSiblings = function () {
        return this.allSiblings();
    };

    // Aliases for 'father' and 'mother' - both refer to the immediate parent.
    jQLibrary.prototype_extensions.paternalParent = function () {
        return this.immediateParent();
    };
    jQLibrary.prototype_extensions.maternalParent = function () {
        return this.immediateParent();
    };

} )( jQuery ); // The plugin expects the global 'jQuery' object to be passed in.