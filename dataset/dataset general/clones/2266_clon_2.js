/* visual asset content unit */
  ContentBlocks.Assets.VisualAsset = ( function ( ) {
    var markupStructure = _util.template ( [
	  '<div  class="asset-details-wrapper">',
      '<input maxlength="140" name="visualWidth" placeholder="Pixel width"',
      ' class="st-entry-string js-width-entry" type="text" />',
	  '<input maxlength="140" name="visualHeight" placeholder="Pixel height"',
      ' class="st-entry-string js-height-entry" type="text" />',
	  '<select name="placement" class="js-placement-selector">',
	  '<option value="">Alignment</option>',
	  '<option value="start">Left</option>',
	  '<option value="middle">Center</option>',
	  '<option value="end">Right</option>',
	  '</select>',
      '</div>',
	  '<div class="asset-display-area">',
	  '<img class="display-asset">',
	  '</div>'
    ].join ( "\n" ) );
  
    
	return ContentBlocks.Assets.BaseAsset.derive ( {
  
    type: "visualAsset",
    renderEditorContent: function ( ) {
        return markupStructure ( this );
      },
    populateDisplay: function ( assetInfo ) {
      
	  this.$('.display-asset').attr('source', assetInfo.sourceFile.location).attr('display-width', assetInfo.visualWidth).attr('display-height', assetInfo.visualHeight);
	  this.$('.js-width-entry').val(assetInfo.visualWidth);
	  this.$('.js-height-entry').val(assetInfo.visualHeight);
	  this.$('.js-placement-selector').val(assetInfo.placement);
	  this.$('.asset-display-area').css('text-align', assetInfo.placement);
	  
    },
	  
    afterContentReady: function ( ) {
	  	var currentInstance =  this;
        var blockData = currentInstance.retrieveData ( );
       this.inputElements.find ( 'button' ).prev ( ).remove ( );
       this.inputElements.find ( 'button' ).on ( 'click', function ( clickEvent ) { 
	     clickEvent.preventDefault ( );
		      		 
		 var resourceLink = assetPicker.launch ( function ( assetUrl ) {
			if ( assetUrl ) {
		      var formSet = new FormDataSet ( );
			var assetObject = {
					  sourceFile: {
						location: assetUrl,
					}
              } 
             currentInstance.updateAndRender ( assetObject );
             currentInstance.markAsReady ( );
			  
			 // Placeholder for additional setup or display logic
			  
			  
        
			}
		}, 'visual' );
		 
	  } );
         this.inputElements.find ( 'input' ).on ( 'input', _util.bound ( function ( changeEvent ) {
        this.handleInputUpdate ( changeEvent.targetElement );
      }, this ) );
    },
     
  } );
 } ) ( );