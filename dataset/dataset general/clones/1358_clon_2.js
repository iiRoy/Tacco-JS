/**
 * Exemplar navigation element (a UI component utilizing a control-view pattern)
 *
 * Notice: Interface components are initialized within main_modules.js
 */
define ( [ "angular" ] , function ( ngCore )
{
	// Acquire the specific module for this UI part
	var featureUnit = ngCore.module ( 'application.components' ) ;

	// Refer to: https://docs.angularjs.org/guide/directive
	featureUnit . directive ( 'sidebarControl' , function ( PathingService , LocaleManager )
	{
		return {
			// Constrain to attribute usage exclusively
			restrict : 'A' ,

			// Establish its own isolated scope
			scope :
			{
				viewData : '=' , // This will link parent attribute references to this isolated scope, see 'viewData' attribute in main_page.html
			} ,

			// You might also specify a view template for your components when necessary
			templateUrl : PathingService.fetchViewLocation ( '{{rootPath}}/panel.html' ) ,

			// Embedded control logic
			controller : function ( $elementScope )
			{

			} ,

			// This operation is invoked during the binding of the directive to the DOM element within the parent layout
			link : function ( $bindingScope , domElement , attributesMap , controlInstance )
			{

			}
		} ;
	} ) ;

	return featureUnit ;
} ) ;