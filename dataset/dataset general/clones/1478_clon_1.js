// This file, SelectHelper.js, provides helpful utilities.
// Initial creation by Colin Kuebler in the year 2012.
// It is a component of the LDT project.
// This code is distributed under a dual license: GPLv3 and MIT.

// The primary purpose is to offer convenient, cross-browser
// methods for manipulating text selection within textarea elements.


 var SelectHelper =

 {
    // The 'add' method extends a given DOM element with selection manipulation capabilities.
  add:

  function

  (
   element // The DOM element (e.g., a textarea) to enhance.
  )

  {
    // Assign a new function, 'insertAtCursor', to the provided element.
    // This assignment is conditional, based on browser capabilities.
    element.insertAtCursor


    =

    element.createTextRange // Check if the element supports IE's TextRange API.
    ?
    // --- IE-specific implementation for text insertion ---
    function

    (
     x // The string to insert at the current cursor position.
    )

    {
     // For Internet Explorer, use the document's selection range.
     document.selection.createRange().text


     =

     x; // Set the selected text to the input string.
    }

    :
    // --- Standard-compliant (non-IE) implementation ---
    function

    (
     x // The string to insert at the current cursor position.
    )

    {
     // Get the current selection start and end points.
     var s = element.selectionStart,
         e = element.selectionEnd,
         v = element.value; // Get the current value of the element.


     // Construct the new value by inserting 'x' at the cursor.
     element.value


     =

     v.substring(0, s) // Part before selection.
     +
     x // The new text to insert.
     +
     v.substring(e); // Part after selection.


     // Update the selection start position.
     s

     +=

     x.length; // Move the cursor past the inserted text.


     // Set the new selection range to place the cursor after the inserted text.
     element.setSelectionRange(s, s);
    }
    ; // End of element.insertAtCursor assignment.
  }
 }; // End of SelectHelper object definition.


// Additional blank lines for visual separation.


// End of SelectHelper.js