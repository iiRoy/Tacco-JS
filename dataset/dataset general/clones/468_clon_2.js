( function  ( ngApp ,  domRoot )   {

 var  moduleRef  =  ngApp . module ( 'headManager' ,  [ ] ) ;

 moduleRef . directive (
  'pageCaption',
  [ 'appGlobalScope', function ( appGlobalScope ) {
   return {
    accessMode: 'EA',
    bindElements: function ( currentScope ,  inputElement ,  inputAttributes ,  ctrlInstance ,  transcludeFunction ) {
     // If this element was inserted as a standalone tag, we detach it from the DOM.
     // This ensures it has no visual impact on the page's rendering.
     // Otherwise, if it's piggybacking on an existing element, it's left undisturbed.
     var  nodeLabel  =  inputElement [ 0 ] . tagName . toLowerCase ( ) ;
     if ( nodeLabel  ===  'page-caption'  ||  nodeLabel  ===  'pagecaption' ) {
      inputElement . remove ( ) ;
     }

     currentScope . $watch (
      function ( ) {
       return  inputElement . content ( ) ;
      } ,
      function ( freshCaption ) {
       appGlobalScope . pageCaption  =  freshCaption ;
      }
     ) ;
     currentScope . $on (
      'onDestroy' ,
      function ( ) {
       delete  appGlobalScope . pageCaption ;
      }
     ) ;
    }
   } ;
  } ]
 ) ;

 moduleRef . directive (
  'domHead' ,
  function ( ) {
   var  docHead  =  ngApp . node ( domRoot . head ) ;
   return {
    accessMode: 'A' ,
    bindElements: function ( currentScope ,  inputElement ,  inputAttributes ,  ctrlInstance ,  transcludeFunction ) {
     // Relocate the provided element into the document's <head> section.
     // Despite its new physical location, the element retains its original scope binding,
     // allowing access to relevant scope variables from its declaration context.
     docHead . append ( inputElement ) ;

     // Upon scope termination, the element is removed from the DOM.
     // This behavior assumes usage within a view-specific scope, as its utility outside
     // such contexts (e.g., within ng-repeat) would be limited and nonsensical.
     currentScope . $on (
      'onDestroy' ,
      function ( ) {
       inputElement . remove ( ) ;
      }
     ) ;
    }
   } ;
  }
 ) ;

} ) ( ngApp ,  domRoot ) ;