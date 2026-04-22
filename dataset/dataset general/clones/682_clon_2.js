angular  .  module  (  'sampleApp'  ,  [  'ngWidget'  ]  )  ;

/*
 *  This function acts as the central manager for the application's
 *  primary display component. It prepares the necessary data structures.
 */
function   PrimaryControl   (   $viewModel   )   {
    //  Initialize an empty collection to hold various user entities
    $viewModel  .  accountHolders   =   [  ]  ;
}