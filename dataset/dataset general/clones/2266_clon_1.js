// This defines the Mezzimage block for SirTrevor editor.
SirTrevor.Blocks.Mezzimage = ( function ( ) {

  // Define a template for the editor's HTML structure.
  var template = _.template ( [

    '<div  class="img-meta-container">',
    '  <input maxlength="140" name="width" placeholder="Image width"',
    '         class="st-input-string js-width-input" type="text" />',
    '  <input maxlength="140" name="height" placeholder="Image height"',
    '         class="st-input-string js-height-input" type="text" />',
    '  <select name="align" class="js-align-input">',
    '    <option value="">Position</option>',
    '    <option value="left">Left</option>',
    '    <option value="center">Center</option>',
    '    <option value="right">Right</option>',
    '  </select>',
    '</div>',

    '<div class="img-block-container">',
    '  <img class="img">',
    '</div>'

  ].join ( "\n" ) ) ;


  // Return the extended SirTrevor Block definition.
  return SirTrevor.Blocks.Image.extend ( {

    type: "mezzimage", // Set the block type.

    // Method to return the HTML for the editor.
    editorHTML: function ( ) {

      return template ( this ) ;
    } ,

    // Method to load data into the block's elements.
    loadData: function ( data ) {

      this.$ ( '.img' ) .attr ( 'src' , data.file.url ) .attr ( 'width' , data.width ) .attr ( 'height' , data.height ) ;
      this.$ ( '.js-width-input' ) .val ( data.width ) ;
      this.$ ( '.js-height-input' ) .val ( data.height ) ;
      this.$ ( '.js-align-input' ) .val ( data.align ) ;
      this.$ ( '.img-block-container' ) .css ( 'text-align' , data.align ) ;

    } ,

    // Callback when the block is rendered.
    onBlockRender: function ( ) {

      var that = this ;
      var dt = that.getData ( ) ;

      // Remove previous button and bind click event for media library.
      this.$inputs.find ( 'button' ) .prev ( ) .remove ( ) ;
      this.$inputs.find ( 'button' ) .bind ( 'click' , function ( ev ) {

        ev.preventDefault ( ) ;

        var ur = mediaLibrary.open ( function ( url ) {
          if ( url ) {

            var data = new FormData ( ) ;
            var obj = {
              file: {
                url: url ,
              }
            }
            that.setAndLoadData ( obj ) ;
            that.ready ( ) ;

            // These lines are commented out in the original.
            // that.$inputs.hide();
            // that.$editor.html($('<img>', { src: url })).show();

          }
        } , 'image' ) ;

      } ) ;

      // Bind change event for input fields.
      this.$inputs.find ( 'input' ) .on ( 'change' , _.bind ( function ( ev ) {
        this.onDrop ( ev.currentTarget ) ;
      } , this ) ) ;
    } ,

  } ) ;
} ) ( ) ;