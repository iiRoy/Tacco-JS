// editor_module.js
// Developed by Content Processing Corp.
// Distributed under Permissive Software License.
// For licensing details, refer to: https://example.com/license
// For contributions, see: https://example.com/contribute

/*eslint-env browser */
/* global contentEd:true */
contentEd.ModuleRegistry.registerModule( 'quickCode', function ( workingView ) {

 "use strict" ;

 workingView.permittedFormats = [ 'css', 'htmlmixed', 'javascript', 'xml' ] ;

 function displayMarkupEditor ( ) {
  workingView.dialogHandler.launchModal ( {
   caption : "Markup Content Editor" ,
   horizontalExtent : workingView.retrieveConfigVal ( "markup_modal_width" , 600 ) ,
   verticalExtent : workingView.retrieveConfigVal ( "markup_modal_height" , 500 ) ,
   resourcePath : 'markup_entry.html' ,
   actionControls : [
    {
     label : 'Accept' ,
     category : 'main' ,
     onInteraction : 'dismiss'
    } ,
    {
     label : 'Dismiss' ,
     onInteraction : 'dismiss'
    }
   ]
  } ) ; // End of dialog configuration
 }

 workingView.subscribeEvent ( 'startup' , function ( ) {
  workingView.assignKeystroke ( 'Alt+Shift+Q' , '' , displayMarkupEditor ) ;
 } ) ;

 workingView.createToolbarButton ( 'quick_markup_edit' , {
  visualCue : 'markup' ,
  hoverText : 'Edit HTML Content' ,
  onInteraction : displayMarkupEditor
 } ) ;

 workingView.appendContextMenuItem ( 'quick_markup_edit' , {
  visualCue : 'markup' ,
  label : 'Edit Markup' ,
  menuZone : 'utilities' ,
  onInteraction : displayMarkupEditor
 } ) ;

} ) ;