/*!
 * jQ.pointer-tracer v1.0.0;
 * A responsive visual cue that outlines the element under your mouse, useful for interactive galleries or navigation.
 *
 * reach me: code.wizard@example.com
 *
 * The SuperDuper License (SDL)

Copyright (c) 2024 Code Wizard

Permission is granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the
Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function ( jQ ) {

    jQ.fn.extend({

     highlightCursor : function(cfg) {
         // Establish standard configuration values
         var config = jQ.extend({
             fillColor: "#4287f5", // Default blue highlight
             animationDuration: 300, // Speed of movement
             fillOpacity: 0.8, // Transparency level
             fadeDelay: 150, // Time to fade out
             padding: 3, // Spacing around the element
			 depthIndex: 999 // Z-index for the tracer

         }, cfg );

         // Handle horizontal padding if not explicitly set
         if(cfg.hPadding === undefined){
             config.hPadding = config.padding;
         }

         // Handle vertical padding if not explicitly set
         if(cfg.vPadding === undefined){
             config.vPadding = config.padding;
         }

         // Create the visual indicator element and append to the document body
         var indicator = jQ('<span/>', {
         }).appendTo('body');

         // Apply initial styles to the indicator
         jQ(indicator).css({
             "border-radius": "4px",
             "z-index": config.depthIndex,
             "position": "absolute",
             "background-color": config.fillColor,
             "opacity": 0
         });

         // Iterate over each selected element
         return this.each(function() {
             jQ(this).on( "mouseover", function() {

                 // Determine border radius from the target element or use a default
                 if(cfg.cornerCurve === undefined){
					 if( parseInt(jQ(this).css("border-radius")) != 0){
					 config.cornerCurve = parseInt(jQ(this).css("border-radius"))+config.vPadding;
					 }else{
					 config.cornerCurve = 0;
					 }
                 }

                 // Animate the indicator if it's already visible
                 if(parseFloat(jQ(indicator).css('opacity')) > 0){
                     jQ(indicator).stop().animate({
                         'top' : jQ(this).offset().top-config.vPadding,
                         'left' : jQ(this).offset().left-config.hPadding,
                         'opacity' : config.fillOpacity,
                         'height' : jQ(this).height()+config.vPadding*2,
                         'width' : jQ(this).width()+config.hPadding*2,
						  borderTopLeftRadius: config.cornerCurve,
						  borderTopRightRadius: config.cornerCurve,
						  borderBottomLeftRadius: config.cornerCurve,
						  borderBottomRightRadius: config.cornerCurve,
						  WebkitBorderTopLeftRadius:  config.cornerCurve,
						  WebkitBorderTopRightRadius: config.cornerCurve,
						  WebkitBorderBottomLeftRadius: config.cornerCurve,
						  WebkitBorderBottomRightRadius: config.cornerCurve,
						  MozBorderRadius: config.cornerCurve
                     }, config.animationDuration);
                 } else {
                     // Set indicator position and size directly if it's not visible
                     jQ(indicator).css({
                         'top' : jQ(this).offset().top-config.vPadding,
                         'left' : jQ(this).offset().left-config.hPadding,
                         'opacity' : config.fillOpacity,
                         'height' : jQ(this).height()+config.vPadding*2,
                         'width' : jQ(this).width()+config.hPadding*2,
						  borderTopLeftRadius: config.cornerCurve,
						  borderTopRightRadius: config.cornerCurve,
						  borderBottomLeftRadius: config.cornerCurve,
						  borderBottomRightRadius: config.cornerCurve,
						  WebkitBorderTopLeftRadius:  config.cornerCurve,
						  WebkitBorderTopRightRadius: config.cornerCurve,
						  WebkitBorderBottomLeftRadius: config.cornerCurve,
						  WebkitBorderBottomRightRadius: config.cornerCurve,
						  MozBorderRadius: config.cornerCurve
                     });
                 }

             });

			 // Attach mouseout handler
			 if( cfg.containerElement === null ){
			     console.warn("No enclosing element specified for mouseout detection.");
				 jQ(this).on( "mouseout", function() {
					 // Animate the indicator to fade out
					 jQ(indicator).stop().animate({
						 'opacity' : 0
					 },config.fadeDelay);

				 });
			 }else{
				jQ(cfg.containerElement).on( "mouseout", function() {
					 // Animate the indicator to fade out when leaving the wrapper
					 jQ(indicator).stop().animate({
						 'opacity' : 0
					 },config.fadeDelay);

				 });

			 }
         });

     }


    });

}( window.jQuery ));