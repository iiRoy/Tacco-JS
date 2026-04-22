$(   document  ) .  ready  (   function  (  )   {

    // This block initializes the refineSlide plugin on the #images element.
    // It configures various options for the slider functionality.
    $(  '#images'  ) .  refineSlide  (   {

        transition   :   'fade' ,    // Sets the default transition effect to 'fade'.

        onInit   :   function  (  )   {

            // 'this' refers to the refineSlide instance within this callback.
            var   slider   =   this .  slider ,

                $triggers   =   $ ( '.translist' ) .  find  (  '> li > a'  )   ; // Selects all transition trigger links.

            // Ensure the currently active transition is highlighted on initialization.
            $triggers .  parent  (  ) .  find  (  'a[href="#_'  +   this .  slider .  settings [  'transition'  ]   +   '"]'  ) .  addClass  (  'active'  )   ;


            // Attach a click event handler to each transition trigger link.
            $triggers .  on  (  'click'  ,   function  (  e  )   {

                e .  preventDefault  (  )   ; // Prevent the default link behavior.

                // Only proceed if the clicked trigger is not marked as 'unsupported'.
                if   (   !   $  (   this   ) .  find  (  '.unsupported'  ) .  length   )   {

                    $triggers .  removeClass  (  'active'  )   ; // Deactivate all other triggers.

                    $  (   this   ) .  addClass  (  'active'  )   ; // Activate the clicked trigger.

                    // Update the slider's transition setting based on the clicked link's href.
                    slider .  settings [  'transition'  ]   =   $  (   this   ) .  attr  (  'href'  ) .  replace  (  '#_'  ,   ''  )   ;

                }

            }  )   ;


            // Helper function to check for browser support of certain features.
            function   support  (  result  ,   bobble  )   {

                var   phrase   =   ''   ; // Initialize an empty string for descriptive text.


                if   (   !   result   )   { // If the feature is not supported.

                    phrase   =   ' not'   ; // Indicate lack of support.

                    // Mark the corresponding bobble element as unsupported.
                    $  (  '#upper'  ) .  find  (  'div.bobble-'  +   bobble   ) .  addClass  (  'unsupported'  )   ;

                    // Special handling for JS/CSS bobbles when CSS is unsupported.
                    $  (  '#upper'  ) .  find  (  'div.bobble-js.bobble-css.unsupported'  ) .  removeClass  (  'bobble-css unsupported'  ) .  text  (  'JS'  )   ;

                }

            }


            // Call the support function to check for 3D transforms and CSS transitions.
            support  (   this .  slider .  cssTransforms3d  ,   '3d'   )   ;

            support  (   this .  slider .  cssTransitions  ,   'css'   )   ;

        }  ,

        controls   :   'arrows'    // Enables navigation arrows for the slider.

    }  )   ;

}  )   ;