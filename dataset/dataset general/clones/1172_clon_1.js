/*
 * This is a Type I clone generated to demonstrate whitespace
 * and comment variations while preserving exact code structure.
 * No logical changes have been made to the original script.
 */
( function ( ) {
  "use strict" ;

  // Regular expression to identify headline elements (e.g., H1, H2)
  var headlineExp = /^H(\d)$/ ;
  /*
   * Regular expression for detecting todo items within text content.
   * Captures the content before '.todo'.
   */
  var todoExp = /^(.+)\.todo$/ ;
  // Regular expression to find tags starting with '@'
  var tagExp = /@([\w]+)/ ;


  /**
   * Initializes folding functionality for a collection of elements.
   * If no elements are provided, it defaults to elements with class 'folding'.
   *
   * @param {HTMLElement|NodeListOf<HTMLElement>} elements - The element(s) to apply folding to.
   */
  function foldIt ( elements ) {
    // If elements are not provided, get all elements with the 'folding' class.
    elements = elements || document.getElementsByClassName ( 'folding' ) ;

    if ( elements.length ) {
      // Iterate over a NodeList or HTMLCollection
      for ( var i = 0 ; i < elements.length ; i ++ ) {
        foldingIt ( elements.item ( i ) ) ; // Apply folding to each item
      } // End of for loop
    }
    // If a single HTMLElement is passed directly
    else if ( elements.tagName ) {
      foldingIt ( elements ) ; // Apply folding to the single element
    }
  }
  // Expose the foldIt function globally for external use.
  window.foldIt = foldIt ;

  /*
   * Core function to apply folding behavior to a single element.
   * This includes setting up event listeners and initial processing.
   *
   * @param {HTMLElement} element - The DOM element to make foldable.
   */
  function foldingIt ( element ) {
    element.classList.add ( 'folding' ) ; // Mark the element as foldable
    element.addEventListener ( 'click' , function detectInteractiveElements ( e ) {
      var match ; // Variable to store regex matches

      var topElement = e.target ;
      // Traverse up the DOM tree until the 'folding' parent is found.
      while ( ! topElement.parentElement.classList.contains ( 'folding' ) ) {
        topElement = topElement.parentElement ;
      }

      // Handle clicks on tags within the foldable element
      if ( e.target.classList.contains ( 'folding-tag' ) ) {
        var tag = e.target.getAttribute ( 'data-tag' ) ;
        // Check if this tag filter is already active for the element
        if ( ! element.classList.contains ( 'tag-filter-' + tag ) ) {
          var tagClass = 'folding-tagged-' + tag ;
          // Get all tagged elements within the current folding element
          var tagged = element.getElementsByClassName ( 'folding-tagged' ) , candidate ;
          // Loop through all tagged candidates
          for ( var i = 0 ; i < tagged.length ; i ++ ) {
            candidate = tagged.item ( i ) ;
            // If candidate has the specific tag class, activate it
            if ( candidate.classList.contains ( tagClass ) ) {
              candidate.classList.add ( 'active-tag' ) ;
            }
            // Otherwise, deactivate it
            else {
              candidate.classList.remove ( 'active-tag' ) ;
            }
          }
          // Apply general tag filter class and specific tag filter class
          element.classList.add ( 'tag-filter' ) ;
          element.classList.add ( 'tag-filter-' + tag ) ;
        }
        // If the tag filter is already active, deactivate it
        else {
          element.classList.remove ( 'tag-filter' ) ;
          element.classList.remove ( 'tag-filter-' + tag ) ;
        }
      }
      // Handle clicks on headline elements for folding/unfolding
      else if ( match = headlineExp.exec ( topElement.nodeName ) ) {
        e.preventDefault ( ) ; // Prevent default link/button behavior
        toggleHeadlineFolding ( topElement ) ; // Toggle folding for the headline
      }
    } ) ; // End of click event listener

    var current = element.firstElementChild ; // Start with the first child of the foldable element
    var match = null ; // Reset match variable
    var tagList = null ; // Initialize tag list
    // Iterate through all siblings of the first child
    while ( current ) {
      // Check for headlines that are also todo items
      if ( headlineExp.exec ( current.nodeName ) && ( match = todoExp.exec ( current.textContent ) ) ) {
        handleTodo ( current , match [ 1 ] ) ; // Process the todo item
      }

      tagList = [ ] ; // Initialize an empty list for tags
      detectTags ( current , tagList ) ; // Detect tags within the current element
      if ( tagList.length ) {
        // Move up the hierarchy to tag parent headlines
        moveUpHeadlines ( current , function tagParentHeadlines ( h ) {
          tagList.forEach ( tagElement.bind ( h ) ) ; // Bind tags to parent headlines
        } ) ;
      }

      current = current.nextElementSibling ; // Move to the next sibling element
    }

    /*
     * Find and collapse elements that are marked to be collapsed by default.
     * This is typically done on page load.
     */
    var collapse = element.getElementsByClassName ( 'folding-collapsed' ) ;
    for ( var i = 0 ; i < collapse.length ; i ++ ) {
      if ( headlineExp.exec ( collapse.item ( i ).nodeName ) ) {
        toggleHeadlineFolding ( collapse.item ( i ) ) ; // Collapse the headline
      }
    }
  }


  /**
   * Recursively detects tags within an element's text content and child nodes.
   *
   * @param {Node} element - The current DOM node to search for tags.
   * @param {string[]} tagList - An array to accumulate detected tags.
   */
  function detectTags ( element , tagList ) {
    tagList = tagList || [ ] ; // Ensure tagList is an array, default to empty
    var appendTags = [ ] ; // Tags found in children that need to be appended

    var node = element.firstChild , next ;
    while ( node ) {
      next = node.nextSibling ; // Store next sibling before potential node replacement
      if ( node.nodeName == '#text' ) {
        tagChopper ( node , tagList ) ; // Process text nodes for tags
      }
      else {
        var childTags = tagList.slice ( ) ; // Clone the tag list for child recursion
        detectTags ( node , childTags ) ; // Recurse into child nodes
        // If children added new tags, append them
        if ( childTags.length > tagList.length ) {
          appendTags = appendTags.concat ( childTags.slice ( tagList.length ) ) ;
        }
      }
      node = next ; // Move to the next sibling
    }

    // Append newly found tags from children to the main tagList
    appendTags.forEach ( function appendTag ( tag ) {
      tagList.push ( tag ) ;
    } ) ;

    // If tags were found, apply them to the current element
    if ( tagList.length ) {
      tagList.forEach ( tagElement.bind ( element ) ) ;
    }
    // If no tags were found, mark the element as 'no-tag'
    else {
      element.classList.add ( 'no-tag' ) ;
    }
  }


  /*
   * Processes a text node, extracting tags and replacing them with interactive spans.
   *
   * @param {Text} node - The text node to process.
   * @param {string[]} tagList - The list of tags to update.
   */
  function tagChopper ( node , tagList ) {
    var match , tag ; // Variables for regex match and created tag element
    var text = node.textContent ; // Get the full text content of the node
    // Loop while tags are found in the text
    while ( match = tagExp.exec ( text ) ) {
      var tagName = match [ 1 ].toLowerCase ( ) ; // Extract tag name and convert to lowercase
      // Update the text content of the original node, removing the matched tag part
      node.textContent = match.index ? text.substr ( 0 , match.index ) : '' ;

      tagList.push ( tagName ) ; // Add the found tag to the list
      tag = document.createElement ( 'span' ) ; // Create a new span element for the tag
      tag.textContent = match [ 0 ] ; // Set its text content to the full matched tag (e.g., "@mytag")
      tag.classList.add ( 'folding-tag' ) ; // Add a class for styling and event detection
      tag.setAttribute ( 'data-tag' , tagName ) ; // Store the tag name as a data attribute

      // Insert the new tag span right after the original text node
      node.parentElement.insertBefore ( tag , node.nextSibling ) ;
      // Update the remaining text to search after the current tag
      text = text.substr ( match.index + match [ 0 ].length ) ;

      // If there's still text left after the tag, insert it as a new text node
      if ( text.length ) {
        tag.insertAdjacentText ( 'afterend' , text ) ;
        node = tag.nextSibling ; // Move the 'node' pointer to the new text node
      }
      // If no text remains, set node to null to exit the loop
      else {
        node = null ;
      }
    }
  }


  /*
   * Adds specific CSS classes to an element based on a given tag.
   * 'this' context should be the element to be tagged.
   *
   * @param {string} tag - The tag name to apply.
   */
  function tagElement ( tag ) {
    this.classList.add ( 'folding-tagged' ) ; // Mark as generally tagged
    this.classList.add ( 'folding-tagged-' + tag ) ; // Add tag-specific class
  }


  /**
   * Traverses up the DOM tree from a given element, applying a callback
   * to parent headline elements of a higher or equal level.
   *
   * @param {HTMLElement} element - The starting element.
   * @param {function(HTMLElement): void} each - Callback function for each found headline.
   */
  function moveUpHeadlines ( element , each ) {
    var match = headlineExp.exec ( element.nodeName ) ; // Match the starting element's headline level
    var candidateMatch ; // Match for potential parent headlines
    // Loop upwards through previous siblings
    while ( element && ( element = element.previousElementSibling ) ) {
      // Check if the current element is a headline
      if ( candidateMatch = headlineExp.exec ( element.nodeName ) ) {
        // If no initial match or candidate is a higher-level headline
        if ( ! match || candidateMatch [ 1 ] < match [ 1 ] ) {
          each ( element ) ; // Execute callback on the headline
          match = candidateMatch ; // Update the highest level found so far
        }
      }
    }
  }


  /*
   * Iterates through siblings following an element, up to the next headline
   * of the same or higher level. Applies a callback to each element.
   *
   * @param {HTMLElement} element - The starting headline element.
   * @param {function(HTMLElement): HTMLElement} [each] - Optional callback to process each sibling.
   * @returns {HTMLElement|null} The next headline element of equal or higher level, or null if none found.
   */
  function moveAcrossGap ( element , each ) {
    var match = headlineExp.exec ( element.nodeName ) ; // Get the level of the starting headline
    var current = element.nextElementSibling ; // Start with the immediate next sibling
    // Loop through subsequent siblings
    while ( current ) {
      var siblingMatch = headlineExp.exec ( current.nodeName ) ;
      // If we encounter a headline element at the same or a higher level, stop.
      if ( siblingMatch && siblingMatch [ 1 ] <= match [ 1 ] ) {
        return current ; // Return this headline element
      }
      // If a callback is provided, execute it
      if ( each ) current = each ( current ) ;
      current = current.nextElementSibling ; // Move to the next sibling
    }
    return null; // No higher or same level headline found
  }


  /**
   * Toggles the folded state of a headline element and its subsequent content.
   *
   * @param {HTMLElement} element - The headline element to toggle.
   */
  function toggleHeadlineFolding ( element ) {
    element.classList.toggle ( 'folded' ) ; // Toggle the 'folded' class
    var fold = element.classList.contains ( 'folded' ) ; // Check the new folded state
    var siblingMatch ; // This variable isn't used, could be removed but Type I means no logical changes.

    // If unfolding, remove the ellipsis element if it exists
    if ( ! fold ) {
      element.removeChild ( element.lastElementChild ) ;
    }

    // Traverse elements following the headline, hiding or showing them
    moveAcrossGap ( element , function toggleFolding ( current ) {
      if ( fold ) {
        current.classList.add ( 'hidden-by-fold' ) ; // Hide the element
      }
      else {
        current.classList.remove ( 'hidden-by-fold' ) ; // Show the element
        // If the current element itself is folded, skip its children
        if ( current.classList.contains ( 'folded' ) ) {
          current = moveAcrossGap ( current ) ; // Find the next headline after this folded section
          // If a next headline is found, move back one to ensure correct iteration
          current = current ? current.previousElementSibling : null ;
        }
      }
      return current ; // Return the (potentially updated) current element for iteration
    } ) ;

    // If folding, add an ellipsis to indicate collapsed content
    if ( fold ) {
      var ellipsis = document.createElement ( 'div' ) ;
      ellipsis.textContent = '…' ; // Ellipsis character
      ellipsis.classList.add ( 'folding-ellipsis' ) ; // Add class for styling
      element.appendChild ( ellipsis ) ; // Append the ellipsis to the headline
    }
  }


  /*
   * Processes a headline element identified as a '.todo' item.
   * Clears its content and adds a styled '.todo' decorator.
   *
   * @param {HTMLElement} header - The headline element.
   * @param {string} title - The title text extracted from the todo.
   */
  function handleTodo ( header , title ) {
    // Remove all existing child nodes from the header
    while ( header.childNodes.length ) {
      header.removeChild ( header.childNodes.item ( 0 ) ) ;
    }
    header.appendChild ( document.createTextNode ( title ) ) ; // Add the cleaned title text
    var decorator = document.createElement ( 'span' ) ; // Create a span for the decorator
    decorator.classList.add ( 'decorator' ) ; // Add a class for styling
    decorator.appendChild ( document.createTextNode ( '.todo' ) ) ; // Add '.todo' text
    header.appendChild ( decorator ) ; // Append decorator to header

    var list = header.nextElementSibling ; // Get the element immediately following the header
    // If the next element is an unordered list, handle it as a todo list
    if ( list.nodeName == 'UL' ) {
      handleTodoList ( list ) ;
    }
  }


  /**
   * Processes an unordered list (UL) element as a todo list,
   * marking 'done' items.
   *
   * @param {HTMLUListElement} list - The UL element to process.
   */
  function handleTodoList ( list ) {
    list.classList.add ( 'todo' ) ; // Mark the list as a todo list
    var exp = /@done$/m ; // Regex to find '@done' at the end of a line
    var items = list.getElementsByTagName ( 'li' ) ; // Get all list items within the UL
    var i , item ; // Loop variables
    for ( i = 0 ; i < items.length ; i ++ ) {
      item = items.item ( i ) ; // Get the current list item
      // Check if the first child's text content ends with '@done'
      if ( exp.exec ( item.childNodes.item ( 0 ).textContent ) ) {
        item.classList.add ( 'done' ) ; // Mark the item as 'done'
      }
    }
  }
} ) ( ) ;