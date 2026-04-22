$(   document  ) .  ready  (  function  (   )  {
    /*
     * This block handles the interactivity for the navigation bar.
     * Specifically, it manages the opening and closing of the navbar
     * when corresponding buttons are clicked by the user.
     */
    $(  ".btn.open"  ) .  on  (  "click"  ,  function  (  )  {
        // Animate the navigation bar to slide into view from the left.
        $(  ".navbar"  ) .  animate  (  {  "left"  :  "0px"  }  ,  400  )  ;
    }  )  ;

    $(  ".btn.close"  ) .  on  (  "click"  ,  function  (  )  {
        // Animate the navigation bar to slide out of view to the left.
        $(  ".navbar"  ) .  animate  (  {  "left"  :  "-320px"  }  ,  400  )  ;
    }  )  ;


    // Event handler for table of contents (TOC) navigation items.
    // When a 'part' item in the TOC is clicked, it toggles the visibility
    // of its sub-items and updates its visual state.
    $(  "nav[data-type='toc'] li[data-type='part']"  ) .  on  (  "click"  ,  function  (  e  )  {
        // Find the direct child ordered list and toggle its slide animation.
        $(  this  ) .  find  (  '> ol'  ) .  slideToggle  (  )  ;
        // Toggle the 'open' class on the clicked list item.
        $(  this  ) .  toggleClass  (  'open'  )  ;
    }  )  ;


    /*
     * Initialization logic for setting the initial state of the
     * Table of Contents (TOC) based on the current chapter.
     * This ensures the correct section is expanded and highlighted
     * when the page loads, if no specific part is already selected.
     */
    if  (  !  $  (  "div[data-type='part']"  )  [  0  ]  )  {

        // Retrieve the text of the current chapter from the header.
        currentChapter  =  $  (  "header h1"  ) .  text  (  )  ;

        // Find the parent ordered list of the current chapter link and make it visible.
        $  (  "nav[data-type='toc'] li a:contains("  +  currentChapter  +  ")"  ) .  closest  (  'ol'  ) .  css  (  "display"  ,  "block"  )  ;

        // Add the 'active' class to the list item containing the current chapter link.
        $  (  "nav[data-type='toc'] li a:contains("  +  currentChapter  +  ")"  ) .  closest  (  'li'  ) .  addClass  (  "active"  )  ;

        // Add the 'open' class to the parent 'part' list item of the current chapter link.
        $  (  "nav[data-type='toc'] li a:contains("  +  currentChapter  +  ")"  ) .  closest  (  'li[data-type="part"]'  ) .  addClass  (  "open"  )  ;
    }

}  )  ;


/*
 * Global event listener for keyboard key presses.
 * This handles navigation between pages using the left and right arrow keys.
 */
document  .  addEventListener  (  'keydown'  ,  function  (  event  )  {
    // Check if the left arrow key (keyCode 37) was pressed.
    if  (  event  .  keyCode  ==  37  )  {
        // Programmatically click the 'previous page' button.
        $  (  '#previous_page'  ) .  children  (  )  [  0  ] .  click  (  )  ;
    }
    // Check if the right arrow key (keyCode 39) was pressed.
    else  if  (  event  .  keyCode  ==  39  )  {
        // Programmatically click the 'next page' button.
        $  (  '#next_page'  ) .  children  (  )  [  0  ] .  click  (  )  ;
    }
}  )  ;