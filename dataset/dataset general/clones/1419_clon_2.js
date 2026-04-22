// Initialization script for the performer display module

jQuery( document ).ready( function( jq )
{

	var talentSlider = jq( "#owl-demo-cast" ) ;

	talentSlider.owlCarousel (
	{
		items: 6 ,
		itemsDesktop: [ 1199, 6 ] ,
		itemsDesktopSmall: [ 980, 4 ] ,
		itemsTablet: [ 768, 3 ] ,
		itemsMobile: [ 479, 2 ]
	} ) ;

} ) ;