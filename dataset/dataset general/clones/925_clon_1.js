/*
 * @license angular.tree v0.3
 * (c) 2012 Cory Thomas http://github.com/dump247/angular.tree
 * License: MIT
 *
 * This file contains the core logic for the angular-tree directive.
 */

// Self-executing anonymous function to encapsulate the module.
(  function  (  angular,  navigator  )  {
  'use strict'; // Enforce strict mode for cleaner code.

  // Determine the appropriate key for multi-selection based on the operating system.
  var multiSelectKey = 'ctrlKey';

  if (  navigator.appVersion.indexOf( "Mac" )  >=  0  )  {
    multiSelectKey  =  'metaKey'; // Mac uses the Command key (metaKey) for multi-selection.
  }

  /*
   * Extracts the item template from the tree element.
   * If no explicit template is provided, a default one is used.
   * @param {Document} document - The DOM document object.
   * @param {HTMLElement} treeElem - The root tree element.
   * @returns {angular.element} The compiled item template.
   */
  function  getItemTemplate  (  document,  treeElem  )  {
    var itemTemplate; // Variable to hold the extracted template.

    // Process all child nodes of the tree element.
    while  (  treeElem.childNodes.length  >  0  )  {
      var childNode  =  treeElem.childNodes[0]; // Get the first child node.

      treeElem.removeChild(  childNode  ); // Remove the child node from the tree element.

      // Check if the child node is an LI element, which indicates a template.
      if  (  childNode.nodeName  ===  'LI'  )  {
        // Ensure only one LI template is defined within the UL.
        if  (  itemTemplate  )  {
          throw  new  Error(  'Tree ul must contain only a single li template.'  );
        }

        /*
         * Determine if a wrapper DIV is needed for the item's content.
         * A wrapper is needed if the LI is empty or contains mixed content (text and elements).
         */
        var createWrapper  =  childNode.childNodes.length  ===  0;
        var innerNodes  =  0; // Counter for non-text child nodes.

        // Iterate through the child nodes of the potential template LI.
        for  (  var i  =  0;  i  <  childNode.childNodes.length;  i  +=  1  )  {
          var innerNode  =  childNode.childNodes[i];

          // If it's a text node, check if it's non-empty whitespace.
          if  (  innerNode.nodeName  ===  '#text'  )  {
            if  (  !  /^\s*$/.test(  innerNode.nodeValue  )  )  {
              createWrapper  =  true; // Non-whitespace text requires a wrapper.
              break;
            }
          }  else  if  (  innerNodes  >  0  )  {
            // Multiple element nodes also require a wrapper.
            createWrapper  =  true;
            break;
          }  else  {
            innerNodes  +=  1; // Increment count for element nodes.
          }
        }

        // If a wrapper is deemed necessary, create and populate it.
        if  (  createWrapper  )  {
          var wrapperEl  =  document.createElement(  'DIV'  );

          // Move all existing children of the LI into the new wrapper.
          while  (  childNode.childNodes.length  >  0  )  {
            wrapperEl.appendChild(  childNode.childNodes[0]  );
          }

          childNode.appendChild(  wrapperEl  ); // Add the wrapper to the LI.
        }
        
        // Append a new UL element for nested children.
        var ulEl  =  document.createElement(  'UL'  );
        ulEl.className  =  treeElem.className; // Inherit class from parent UL.
        childNode.appendChild(  ulEl  );

        itemTemplate  =  angular.element(  childNode  ); // Convert the LI to an Angular element.
        itemTemplate.addClass(  'ng-tree-node'  ); // Add a specific class for tree nodes.
      }
    }

    // Return the extracted template or a default one if none was found.
    return  itemTemplate  ||  angular.element(  '<li class="ng-tree-node"><div>{{item}}</div><ul></ul></li>'  );
  }

  /**
   * Recursively finds the closest parent LI element with the 'ng-tree-node' class.
   * @param {HTMLElement} target - The starting DOM element.
   * @returns {angular.element|null} The parent LI element wrapped in angular.element, or null if not found.
   */
  function  findParentListItem  (  target  )  {
    var parentListItem  =  target; // Start with the target element.

    // Continue searching upwards if target is not an LI or doesn't have the tree node class.
    if  (  target  &&  (  target.nodeName  !==  'LI'  ||  !  target.className.match(  /\bng-tree-node\b/  )  )  )  {
      parentListItem  =  findParentListItem(  target.parentNode  );
    }

    // Return the found LI as an Angular element, or null.
    return  parentListItem  ?  angular.element(  parentListItem  )  :  null;
  }

  /*
   * Recursively traverses down the tree structure, applying a callback to each item.
   * @param {angular.element} listElem - The current UL element.
   * @param {Function} callback - The function to call for each item (listElem, itemElem).
   */
  function  descendNodes  (  listElem,  callback  )  {
    // Iterate over each direct LI child of the current UL.
    angular.forEach(  listElem.children(  'li'  ),  function  (  itemElem  )  {
      var $itemElem  =  angular.element(  itemElem  ); // Wrap the item element in Angular.

      // If the callback does not explicitly return false, continue descending.
      if  (  callback(  listElem,  $itemElem  )  !==  false  )  {
        // Descend into the second child of the item (which should be the nested UL).
        descendNodes(  $itemElem.children().eq(  1  ),  callback  );
      }
    }  );
  }

  /**
   * Initializes the tree directive, setting up its configuration and behavior.
   * @param {angular.element} treeElem - The root element of the tree.
   * @param {Object} attributes - The attributes of the tree element.
   * @param {Function} $compile - Angular's $compile service.
   * @param {angular.element} $document - Angular's $document service.
   * @returns {Object} The tree configuration object.
   */
  function  initTree  (  treeElem,  attributes,  $compile,  $document  )  {
    // Get the item template, either from content or default.
    var itemTemplate  =  getItemTemplate(  $document[0],  treeElem[0]  );
    // Determine the expression for the tree model (ngTree or src attribute).
    var treeModelExpr  =  attributes.src  ||  attributes.ngTree;
    // Get the 'each' attribute for iteration customization.
    var eachIter  =  itemTemplate[0].getAttribute(  'each'  );
    var contextName  =  'item'; // Default context name for items.
    var collectionExpr  =  'item.children'; // Default expression for child collections.
    var selectExpr  =  itemTemplate.attr(  'select'  ); // Expression for custom selection behavior.
    var selectedName  =  itemTemplate.attr(  'selected'  ); // Not used in this snippet, but kept for consistency.

    // Parse the 'each' iteration expression if present.
    if  (  eachIter  )  {
      var match  =  /^\s*(\w+)\s+in\s+(.*?)\s*$/.exec(  eachIter  );

      if  (  !  match  )  {
        throw  new  Error(  'Invalid item iteration expression: "'  +  eachIter  +  '". The expression must follow the pattern "name in collection".'  );
      }

      contextName  =  match[1]; // Extract the custom item name.
      collectionExpr  =  contextName  +  '.'  +  match[2]; // Construct the new collection expression.
    }

    treeElem.addClass(  'ng-tree'  ); // Add a base class to the tree element.

    // Define the tree configuration object.
    var tree  =  {
      multiple:  'multiple'  in  attributes, // Check for 'multiple' attribute for multi-selection.
      rootElem:  treeElem, // Reference to the root tree element.
      treeModelExpr:  treeModelExpr, // Expression for the overall tree model.
      itemTemplate:  $compile(  itemTemplate  ), // Compiled item template.
      contextName:  contextName, // Name of the item in the scope.
      collectionExpr:  collectionExpr, // Expression for item children.

      // Watch function for item collections.
      collectionWatch:  function  (  scope  )  {  return  scope.$eval(  collectionExpr  );  },
      // Watch function for the main tree model.
      treeModelWatch:  function  (  scope  )  {  return  scope.$eval(  treeModelExpr  );  },

      // Retrieves the item object from a given scope.
      getItem:  function  (  scope  )  {
        return  scope.$eval(  this.contextName  );
      },

      // Sets the item object on a given scope.
      setItem:  function  (  scope,  value  )  {
        scope[this.contextName]  =  value;
      },

      trackSelection:  !!selectExpr, // Whether selection tracking is enabled.

      // Handles item selection logic.
      selected:  function  (  scope,  value  )  {
        if  (  this.trackSelection  )  {
          scope.$selected  =  value; // Update the $selected property on the scope.

          if  (  selectExpr  )  {
            scope.$eval(  selectExpr  ); // Execute custom selection expression if provided.
          }
        }
      }
    };

    // Set up click handling for selection if tracking is enabled.
    if  (  tree.trackSelection  )  {
      treeElem.bind(  'click',  function  (  evt  )  {
        var selectedItemElem  =  findParentListItem(  evt.target  ); // Find the clicked tree item.
        var selectedItemScope  =  selectedItemElem  ?  selectedItemElem.scope()  :  null; // Get its scope.

        // Handle multi-selection (Ctrl/Cmd + click).
        if  (  evt[multiSelectKey]  &&  tree.multiple  )  {
          if  (  selectedItemScope  )  {
            selectedItemScope.$apply(  function  ()  {
              // Toggle selection state.
              tree.selected(  selectedItemScope,  !  selectedItemScope.$selected  );
            }  );
          }
        }  else  {
          // Handle single selection: deselect all other items.
          descendNodes(  treeElem,  function  (  listElem,  itemElem  )  {
            // If the current item is not the one just clicked.
            if  (  !  selectedItemElem  ||  itemElem[0]  !==  selectedItemElem[0]  )  {
              var itemScope  =  itemElem.scope();

              // If it was selected, deselect it.
              if  (  itemScope.$selected  )  {
                itemScope.$apply(  function  ()  {
                  tree.selected(  itemScope,  false  );
                }  );
              }
            }
          }  );

          // Select the clicked item if it wasn't already selected.
          if  (  selectedItemScope  &&  !  selectedItemScope.$selected  )  {
            selectedItemScope.$apply(  function  ()  {
              tree.selected(  selectedItemScope,  true  );
            }  );
          }
        }
      }  );
    }

    return  tree; // Return the initialized tree configuration.
  }

  /**
   * Adds a new list item to the tree.
   * @param {angular.Scope} scope - The parent scope.
   * @param {Object} tree - The tree configuration object.
   * @param {angular.element} listElem - The UL element to add the item to.
   * @param {Object} item - The data item for the new list item.
   * @param {number} index - The desired index for the new item (-1 for append).
   */
  function  addListItem  (  scope,  tree,  listElem,  item,  index  )  {
    var itemScope  =  scope.$new(); // Create a new child scope for the item.
    tree.setItem(  itemScope,  item  ); // Set the item data on the new scope.

    // Compile the item template with the new scope.
    var itemElem  =  tree.itemTemplate(  itemScope,  angular.noop  );

    // Initialize selection state if tracking.
    if  (  tree.trackSelection  )  {
      itemScope.$selected  =  false;
    }

    insertListItem(  listElem,  itemElem,  index  ); // Insert the item into the DOM.

    // Get the UL element where children of this item will be placed.
    var childrenListElem  =  itemElem.children().eq(  1  );

    // Recursively load children for the newly added item.
    loadTree(  itemScope,  tree,  childrenListElem,  tree.collectionWatch  );
  }

  /**
   * Inserts a list item element into a UL element at a specific index.
   * @param {angular.element} listElem - The parent UL element.
   * @param {angular.element} itemElem - The LI element to insert.
   * @param {number} index - The zero-based index for insertion. Use -1 to append.
   */
  function  insertListItem  (  listElem,  itemElem,  index  )  {
    if  (  index  <  0  )  {
      listElem.append(  itemElem  ); // Append to the end.
    }  else  if  (  index  ===  0  )  {
      listElem.prepend(  itemElem  ); // Prepend to the beginning.
    }  else  {
      // Insert after the item at (index - 1).
      listElem.children().eq(  index  -  1  ).after(  itemElem  );
    }
  }

  /**
   * Loads and synchronizes the tree structure based on a data collection.
   * Watches the collection for changes and updates the DOM accordingly.
   * @param {angular.Scope} scope - The scope containing the collection.
   * @param {Object} tree - The tree configuration object.
   * @param {angular.element} listElem - The UL element representing the current level of the tree.
   * @param {Function} listWatch - The function to watch for changes in the collection.
   */
  function  loadTree  (  scope,  tree,  listElem,  listWatch  )  {
    // Set up a deep watch on the collection.
    scope.$watch(  listWatch,  function  (  newList,  oldList  )  {
      // If the new list is empty or undefined, remove all children.
      if  (  typeof  newList  ===  'undefined'  ||  newList  ===  null  ||  newList.length  ===  0  )  {
        listElem.children().remove();
        return;
      }

      // Iterate through the new list to add or reorder items.
      angular.forEach(  newList,  function  (  item,  itemIndex  )  {
        var listChildElems  =  listElem.children(); // Current DOM children.

        // If itemIndex is beyond current children count, append it.
        if  (  itemIndex  >=  listChildElems.length  )  {
          addListItem(  scope,  tree,  listElem,  item,  -1  );
          return;
        }

        // Find if the item already exists in the DOM at or after itemIndex.
        for  (  var childElemIndex  =  itemIndex;  childElemIndex  <  listChildElems.length;  childElemIndex  +=  1  )  {
          var childElem  =  angular.element(  listChildElems[childElemIndex]  );
          var childItem  =  tree.getItem(  childElem.scope()  );

          if  (  childItem  ===  item  )  {
            break; // Found the item.
          }
        }

        // If item not found in existing DOM, add it at the correct index.
        if  (  childElemIndex  >=  listChildElems.length  )  {
          addListItem(  scope,  tree,  listElem,  item,  itemIndex  );
        }  else  if  (  childElemIndex  !==  itemIndex  )  {
          // If item found but at a different position, reorder it.
          insertListItem(  listElem,  listChildElems[childElemIndex],  itemIndex  );
        }
      }  );

      // Remove any excess items from the DOM that are no longer in the new list.
      while  (  listElem.children().length  >  newList.length  )  {
        var removeElem  =  listElem.children().eq(  newList.length  ); // Get the first excess element.

        // If the element to be removed was selected, deselect it.
        if  (  removeElem.scope().$selected  )  {
          tree.selected(  removeElem.scope(),  false  );
        }
        
        removeElem.remove(); // Remove the element from the DOM.
      }
    },  true  ); // 'true' for deep watching of the collection.
  }

  // Define the 'angularTree' module and the 'ngTree' directive.
  angular.module(  'angularTree',  []  )
    .directive(  'ngTree',  [  '$compile',  '$document',  function  (  $compile,  $document  )  {
      return  {
        // The compile function is run once per directive type.
        compile:  function  (  elem,  attrs  )  {
          var tree  =  initTree(  elem,  attrs,  $compile,  $document  ); // Initialize tree configuration.

          // The link function is run once per instance of the directive.
          return  function  (  scope,  elem,  attrs  )  {
            // Load the tree structure based on the main tree model.
            loadTree(  scope,  tree,  elem,  tree.treeModelWatch  );
          };
        }
      };
    }  ]  );
}  )  (  angular,  navigator  ); // Pass angular and navigator objects to the IIFE.