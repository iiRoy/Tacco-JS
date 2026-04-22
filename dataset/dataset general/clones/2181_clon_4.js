(function(jq) {
    // Internal helper functions to mimic basic jQuery traversals using native DOM APIs.
    // These functions ensure unique elements are returned and wrapped in a jQuery object.

    function retrieveParents(nodes) {
        let uniqueNodes = new Set();
        nodes.each(function() {
            if (this.parentNode && this.parentNode.nodeType === 1) { // Ensure it's an element node
                uniqueNodes.add(this.parentNode);
            }
        });
        return jq(Array.from(uniqueNodes));
    }

    function retrieveChildren(nodes) {
        let uniqueNodes = new Set();
        nodes.each(function() {
            Array.from(this.children).forEach(child => uniqueNodes.add(child));
        });
        return jq(Array.from(uniqueNodes));
    }

    function retrieveSiblings(nodes) {
        let uniqueNodes = new Set();
        nodes.each(function() {
            const currentElement = this;
            if (this.parentNode) {
                Array.from(this.parentNode.children)
                    .filter(child => child !== currentElement)
                    .forEach(sibling => uniqueNodes.add(sibling));
            }
        });
        return jq(Array.from(uniqueNodes));
    }

    function retrievePrevious(nodes) {
        let uniqueNodes = new Set();
        nodes.each(function() {
            if (this.previousElementSibling) {
                uniqueNodes.add(this.previousElementSibling);
            }
        });
        return jq(Array.from(uniqueNodes));
    }

    function retrieveNext(nodes) {
        let uniqueNodes = new Set();
        nodes.each(function() {
            if (this.nextElementSibling) {
                uniqueNodes.add(this.nextElementSibling);
            }
        });
        return jq(Array.from(uniqueNodes));
    }

    function retrieveAllPrevious(nodes) {
        let uniqueNodes = new Set();
        nodes.each(function() {
            let current = this.previousElementSibling;
            while(current) {
                uniqueNodes.add(current);
                current = current.previousElementSibling;
            }
        });
        return jq(Array.from(uniqueNodes));
    }

    function retrieveAllNext(nodes) {
        let uniqueNodes = new Set();
        nodes.each(function() {
            let current = this.nextElementSibling;
            while(current) {
                uniqueNodes.add(current);
                current = current.nextElementSibling;
            }
        });
        return jq(Array.from(uniqueNodes));
    }

    // Object to hold the new method implementations, avoiding direct jQuery chaining
    let customGenealogyTraversals = {
        // Original: grandchildren()
        descendantNodesOfSecondDegree: function() {
            return retrieveChildren(retrieveChildren(this));
        },

        // Original: greatGrandchildren()
        descendantNodesOfThirdDegree: function() {
            return retrieveChildren(this.descendantNodesOfSecondDegree());
        },

        // Original: grandparent()
        ancestorNodeOfSecondDegree: function() {
            return retrieveParents(retrieveParents(this));
        },

        // Original: greatGrandparent()
        ancestorNodeOfThirdDegree: function() {
            return retrieveParents(this.ancestorNodeOfSecondDegree());
        },

        // Original: aunts()
        transversalParentSiblings: function() {
            return retrieveSiblings(retrieveParents(this));
        },

        // Original: prevAunt()
        previousTransversalParentSibling: function() {
            return retrievePrevious(retrieveParents(this));
        },

        // Original: prevAunts()
        allPreviousTransversalParentSiblings: function() {
            return retrieveAllPrevious(retrieveParents(this));
        },

        // Original: nextAunt()
        nextTransversalParentSibling: function() {
            return retrieveNext(retrieveParents(this));
        },

        // Original: nextAunts()
        allNextTransversalParentSiblings: function() {
            return retrieveAllNext(retrieveParents(this));
        },

        // Original: cousins()
        transversalParentSiblingChildren: function() {
            return retrieveChildren(this.transversalParentSiblings());
        },

        // Original: prevCousins()
        previousTransversalParentSiblingChildren: function() {
            let collectedDescendants = jq();
            this.allPreviousTransversalParentSiblings().each(function() {
                collectedDescendants = collectedDescendants.add(Array.from(this.children).reverse());
            });
            return collectedDescendants;
        },

        // Original: nextCousins()
        nextTransversalParentSiblingChildren: function() {
            return retrieveChildren(this.allNextTransversalParentSiblings());
        },

        // Original: nieces()
        directSiblingChildren: function() {
            return retrieveChildren(retrieveSiblings(this));
        },

        // Original: prevNieces()
        previousDirectSiblingChildren: function() {
            let collectedDescendants = jq();
            retrieveAllPrevious(this).each(function() {
                collectedDescendants = collectedDescendants.add(Array.from(this.children).reverse());
            });
            return collectedDescendants;
        },

        // Original: nextNieces()
        nextDirectSiblingChildren: function() {
            return retrieveChildren(retrieveAllNext(this));
        }
    };

    // Extend jQuery's prototype with the new methods
    jq.fn.extend(customGenealogyTraversals);

    // Alias definitions using the new method names
    jq.fn.maternalOrPaternalRelatives = jq.fn.transversalParentSiblings;
    jq.fn.precedingMaternalOrPaternalRelative = jq.fn.previousTransversalParentSibling;
    jq.fn.allPrecedingMaternalOrPaternalRelatives = jq.fn.allPreviousTransversalParentSiblings;
    jq.fn.succeedingMaternalOrPaternalRelative = jq.fn.nextTransversalParentSibling;
    jq.fn.allSucceedingMaternalOrPaternalRelatives = jq.fn.allNextTransversalParentSiblings;

    jq.fn.siblingDescendants = jq.fn.directSiblingChildren;
    jq.fn.precedingSiblingDescendants = jq.fn.previousDirectSiblingChildren;
    jq.fn.succeedingSiblingDescendants = jq.fn.nextDirectSiblingChildren;

    // Custom re-implementations for the last set of aliases to maintain distinctness
    jq.fn.maleSiblings = jq.fn.femaleSiblings = function() {
        return retrieveSiblings(this);
    };
    jq.fn.maleParent = jq.fn.femaleParent = function() {
        return retrieveParents(this);
    };

})(jQuery);