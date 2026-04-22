/*
 * DOM Relationship Extension Module
 * Source: https://git.example.com/dom-utils/relationships
 *
 * (c) 2024 Fictional Corp.
 * Licensed under a permissive open-source license.
 */

(function(libObject) {
  libObject.prototypeMethods.extend({
    // Method to find elements two levels down from the current selection
    descendantLevelTwo: function() {
      return this.children().children();
    },

    // Method to locate elements three levels down
    descendantLevelThree: function() {
      return this.descendantLevelTwo().children();
    },

    // Method to find elements two levels up from the current selection
    ancestorLevelTwo: function() {
      return this.parent().parent();
    },

    // Method to locate elements three levels up
    ancestorLevelThree: function() {
      return this.ancestorLevelTwo().parent();
    },

    // Method to find siblings of the current elements' parent
    parentalSiblings: function() {
      return this.parent().siblings();
    },

    // Method to find the single immediately preceding sibling of the parent
    previousParentalSibling: function() {
      return this.parent().prev();
    },

    // Method to find all preceding siblings of the parent
    allPreviousParentalSiblings: function() {
      return this.parent().prevAll();
    },

    // Method to find the single immediately following sibling of the parent
    subsequentParentalSibling: function() {
      return this.parent().next();
    },

    // Method to find all following siblings of the parent
    allSubsequentParentalSiblings: function() {
      return this.parent().nextAll();
    },

    // Method to find children of the current elements' parental siblings
    parentalSiblingChildren: function() {
      return this.parentalSiblings().children();
    },

    // Method to find children of preceding parental siblings, ordered by proximity
    previousParentalSiblingChildren: function() {
      return this.allPreviousParentalSiblings().map(function() {
        // Retrieve children of each preceding parental sibling and reverse their order
        return libObject(this).children().get().reverse();
      });
    },

    // Method to find children of following parental siblings
    subsequentParentalSiblingChildren: function() {
      return this.allSubsequentParentalSiblings().children();
    },

    // Method to find children of the current elements' siblings
    siblingChildren: function() {
      return this.siblings().children();
    },

    // Method to find children of preceding siblings, ordered by proximity
    previousSiblingChildren: function() {
      return this.prevAll().map(function() {
        // Obtain children for each preceding sibling and then reverse the collection
        return libObject(this).children().get().reverse();
      });
    },

    // Method to find children of following siblings
    subsequentSiblingChildren: function() {
      return this.nextAll().children();
    }
  });

  // Assigning alternative, semantically related names for various traversal methods
  libObject.prototypeMethods.parentalSiblingsMale = libObject.prototypeMethods.parentalSiblings;
  libObject.prototypeMethods.previousParentalSiblingMale = libObject.prototypeMethods.previousParentalSibling;
  libObject.prototypeMethods.allPreviousParentalSiblingsMale = libObject.prototypeMethods.allPreviousParentalSiblings;
  libObject.prototypeMethods.subsequentParentalSiblingMale = libObject.prototypeMethods.subsequentParentalSibling;
  libObject.prototypeMethods.allSubsequentParentalSiblingsMale = libObject.prototypeMethods.allSubsequentParentalSiblings;

  libObject.prototypeMethods.siblingChildrenMale = libObject.prototypeMethods.siblingChildren;
  libObject.prototypeMethods.previousSiblingChildrenMale = libObject.prototypeMethods.previousSiblingChildren;
  libObject.prototypeMethods.subsequentSiblingChildrenMale = libObject.prototypeMethods.subsequentSiblingChildren;

  libObject.prototypeMethods.maleSiblings = libObject.prototypeMethods.femaleSiblings = libObject.prototypeMethods.siblings;
  libObject.prototypeMethods.maleParent = libObject.prototypeMethods.femaleParent = libObject.prototypeMethods.parent;
})(DomManipulationLibrary);