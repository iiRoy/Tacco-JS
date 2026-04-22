/*
 * This script initializes various shadow effects for different box elements
 * using a custom jQuery plugin.
 *
 * Each box class corresponds to a specific shadow style.
 */

$(  document  )  .  ready  (  function  (  )  {
    //  Standard  shadow  application  for  the  '.box.standard'  element.
    $(  '.box.standard'  )  .  shadow  (  )  ;

    //  Apply  a  'lifted'  shadow  style.
    $(  '.box.lifted'  )  .  shadow  (  'lifted'  )  ;

    //  Apply  a  'perspective'  shadow  style.
    $(  '.box.perspective'  )  .  shadow  (  'perspective'  )  ;

    //  Apply  a  'raised'  shadow  style.
    $(  '.box.raised'  )  .  shadow  (  'raised'  )  ;

    //  Configure  a  'sides'  type  shadow  with  'vt-1'  orientation.
    $(  '.box.sides-vt-1'  )  .  shadow  (  {
        type  :  'sides'  ,
        sides  :  'vt-1'
    }  )  ;

    //  Configure  a  'sides'  type  shadow  with  'vt-2'  orientation.
    $(  '.box.sides-vt-2'  )  .  shadow  (  {
        type  :  'sides'  ,
        sides  :  'vt-2'
    }  )  ;

    //  Configure  a  'sides'  type  shadow  with  'hz-1'  orientation.
    $(  '.box.sides-hz-1'  )  .  shadow  (  {
        type  :  'sides'  ,
        sides  :  'hz-1'
    }  )  ;

    //  Configure  a  'sides'  type  shadow  with  'hz-2'  orientation.
    $(  '.box.sides-hz-2'  )  .  shadow  (  {
        type  :  'sides'  ,
        sides  :  'hz-2'
    }  )  ;

    //  Apply  a  'rotated'  shadow  effect  with  a  -5  degree  rotation.
    $(  '.box.rotated'  )  .  shadow  (  {
        type  :  'rotated'  ,
        rotate  :  '-5deg'
    }  )  ;

}  )  ;  /*  End  of  document  ready  function  */