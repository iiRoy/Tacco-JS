// *****************************************************************************
// * Copyright (c) 2005-2008 Apple Inc.  All Rights Reserved.                  *
// *                                                                           *
// * IMPORTANT: This Apple software and its associated images, located in      *
// * /System/Library/WidgetResources/AppleClasses/ (referred to as "Apple     *
// * Software"), are provided by Apple Inc. (“Apple”) to you in consideration *
// * of your agreement to the following terms. Your use, installation, or      *
// * redistribution of this Apple Software signifies your acceptance of these  *
// * terms. If you do not agree, please refrain from using, installing, or     *
// * redistributing this Apple Software.                                       *
// *                                                                           *
// * In consideration of your agreement to these terms, Apple grants you a     *
// * personal, non-exclusive license, under Apple’s copyrights in the Apple    *
// * Software, to use, reproduce, and redistribute the Apple Software, in text *
// * form (for JavaScript files) or binary form (for associated images),       *
// * exclusively for the purpose of creating Dashboard widgets for Mac OS X.   *
// *                                                                           *
// * If you redistribute this Apple Software, you must preserve this entire    *
// * notice, including the warranty disclaimers and limitation of liability    *
// * provisions (the last two paragraphs below), in all redistributions.       *
// *                                                                           *
// * You may not use Apple's name, trademarks, service marks, or logos to      *
// * endorse or promote products incorporating the Apple Software without      *
// * Apple's prior written permission. Except as explicitly stated herein, no  *
// * other rights or licenses, express or implied, are granted by Apple,       *
// * including but not limited to any patent rights that may be infringed by   *
// * your products or other works incorporating the Apple Software.            *
// *                                                                           *
// * The Apple Software is provided "AS IS" without warranty. APPLE DISCLAIMS  *
// * ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION, THE     *
// * IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY, AND FITNESS FOR  *
// * A PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND         *
// * OPERATION, ALONE OR IN COMBINATION WITH YOUR PRODUCTS.                    *
// *                                                                           *
// * IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL,  *
// * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF   *
// * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS  *
// * INTERRUPTION) ARISING FROM THE USE, REPRODUCTION, OR DISTRIBUTION OF THE  *
// * APPLE SOFTWARE, HOWEVER CAUSED AND UNDER ANY THEORY OF CONTRACT, TORT     *
// * (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, EVEN IF APPLE HAS *
// * BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.                           *
// *****************************************************************************

function AppleInfoButton ( flipper , front , foregroundStyle , backgroundStyle , onclick ) {
  // This constructor initializes an AppleInfoButton object.
  // It takes several parameters to configure the button's appearance and behavior.

  /* Read-write properties for external access */
  this.onclick = onclick ; // Assign the provided click handler to the object.

  // --- Internal properties and setup ---
  this._front = front ; // Reference to the 'front' DOM element.
  this._flipper = flipper ; // Reference to the 'flipper' DOM element.

  // Create the image element for the flip label (the 'i' icon).
  this._flipLabel = document.createElement ( "img" ) ;
  this._flipLabel.width = 13 ; // Set the width of the info icon.
  this._flipLabel.height = 13 ; // Set the height of the info icon.
  this._flipLabel.setAttribute ( "alt" , "Info" ) ; // Provide an alt text for accessibility.

  // Create the div element for the circular background effect.
  this._flipCircle = document.createElement ( "div" ) ;

  // Append the newly created elements to the flipper.
  flipper.appendChild ( this._flipCircle ) ;
  flipper.appendChild ( this._flipLabel ) ;

  // Flag to track if the label is currently visible.
  this._labelshown = false ;


  // Store a reference to 'this' for use within nested function scopes.
  var _self = this ;

  /**
   * Updates the opacity of the flip label during an animation.
   * @param {object} animation - The animation object.
   * @param {number} now - The current value of the animation (opacity).
   * @param {number} first - The starting value of the animation.
   * @param {boolean} done - True if the animation is complete.
   */
  this._updateOpacity = function ( animation , now , first , done )
  {
    _self._flipLabel.style.opacity = now ; // Apply the current opacity value.
  } ; // End of _updateOpacity function definition.


  // Callback function executed when an animation completes.
  this._animationComplete = function ( )
  {
    // Clean up animation-related properties.
    delete _self._animation ;
    delete _self._animator ;
  } ;


  // Event handler for mouse movement over the front element.
  this._frontMove = function ( event )
  {
    // If there's an active 'mouseout' delay, clear it.
    if ( _self._outdelay !== undefined )
    {
      clearTimeout ( _self._outdelay ) ;
      delete _self._outdelay ; // Remove the delay reference.
    }

    // If the label is already shown, no action is needed.
    if ( _self._labelshown )
    {
      return ;
    }

    var from = 0.0 ; // Starting opacity for the animation.
    var duration = 500 ; // Default animation duration in milliseconds.

    // If an animation is already in progress, adjust 'from' and 'duration'.
    if ( _self._animation !== undefined )
    {
      from = _self._animation.now ; // Start from the current animation value.
      duration = ( new Date ) . getTime ( ) - _self._animator.startTime ; // Calculate remaining duration.
      _self._animator.stop ( ) ; // Stop the current animator.
    }

    _self._labelshown = true ; // Mark the label as shown.

    // Create a new animator instance.
    var animator = new AppleAnimator ( duration , 13 ) ;
    animator.oncomplete = _self._animationComplete ; // Set the completion callback.
    _self._animator = animator ; // Store reference to the animator.

    // Create an animation for opacity change.
    _self._animation = new AppleAnimation ( from , 1.0 , _self._updateOpacity ) ;
    animator.addAnimation ( _self._animation ) ; // Add the animation to the animator.
    animator.start ( ) ; // Start the animation sequence.
  } ; // End of _frontMove function.


  // Event handler for mouse leaving the front element, with a delay.
  this._frontOutDelay = function ( event )
  {
    // If no 'mouseout' delay is currently active, set one.
    if ( _self._outdelay === undefined )
    {
      _self._outdelay = setTimeout ( _self._frontOut , 0 , _self ) ; // Schedule _frontOut call.
    }
  } ; // End of _frontOutDelay.


  // Event handler for mouse leaving the front element (actual logic).
  this._frontOut = function ( _self )
  {
    // Clear any existing 'mouseout' delay.
    if ( _self._outdelay !== undefined )
    {
      clearTimeout ( _self._outdelay ) ;
      delete _self._outdelay ;
    }

    // If the label is not currently shown, no action is needed.
    if ( ! _self._labelshown )
    {
      return ;
    }

    var from = 1.0 ; // Starting opacity for the fade-out animation.
    var duration = 500 ; // Default duration.

    // Adjust 'from' and 'duration' if an animation is ongoing.
    if ( _self._animation !== undefined )
    {
      from = _self._animation.now ;
      duration = ( new Date ) . getTime ( ) - _self._animator.startTime ;
      _self._animator.stop ( ) ;
    }

    // Setup a new animator for fading out.
    var animator = new AppleAnimator ( duration , 13 ) ;
    animator.oncomplete = _self._animationComplete ;
    _self._animator = animator ;

    // Create an animation to fade opacity to 0.0.
    _self._animation = new AppleAnimation ( from , 0.0 , _self._updateOpacity ) ;
    animator.addAnimation ( _self._animation ) ;
    animator.start ( ) ;

    _self._labelshown = false ; // Mark the label as hidden.
  } ; // End of _frontOut function definition.


  // Event handler for mouse entering the label/flipper area.
  this._labelOver = function ( event )
  {
    _self._tempMouseOver = true ; // Temporary flag for mouseover state.
    _self._flipCircle.style.visibility = "visible" ; // Make the background circle visible.
  } ;


  // Event handler for mouse leaving the label/flipper area.
  this._labelOut = function ( event )
  {
    delete _self._tempMouseOver ; // Clear the temporary mouseover flag.
    _self._flipCircle.style.visibility = "hidden" ; // Hide the background circle.
  } ;


  // Event handler for when the label is clicked.
  this._labelClicked = function ( event )
  {
    _self._flipCircle.style.visibility = "hidden" ; // Ensure circle is hidden on click.

    try {
      // Execute the custom onclick handler if it exists.
      if ( _self.onclick != null ) {
        _self.onclick ( event ) ;
      }
    } catch ( ex ) {
      // Re-throw any exceptions from the onclick handler.
      throw ex ;
    } finally {
      // Prevent default action and stop event propagation.
      event.stopPropagation ( ) ;
      event.preventDefault ( ) ;
    }
  } ;


  // Temporary event handler for mouse down on the label.
  this._tempLabelDown = function ( event )
  {
    // Attach a global mouseup listener to track release.
    document.addEventListener ( "mouseup" , _self._tempDocUp , true ) ;
    event.stopPropagation ( ) ; // Stop event bubbling.
    event.preventDefault ( ) ; // Prevent default browser action.
  } ;


  // Temporary event handler for mouse up on the document.
  this._tempDocUp = function ( event )
  {
    // Remove the temporary mouseup listener.
    document.removeEventListener ( "mouseup" , _self._tempDocUp , true ) ;

    // If the mouse was over the label when released, trigger click.
    if ( _self._tempMouseOver !== undefined )
    {
      delete _self._tempMouseOver ; // Clear the flag.
      _self._labelClicked ( event ) ; // Call the click handler.
    }
  } ; // End of _tempDocUp.


  // --- Style Initialization ---
  // Apply initial styles to the flip label.
  var style = this._flipLabel.style ;
  style.position = "absolute" ; // Position absolutely within its parent.
  style.top = 0 ; // Align to the top.
  style.left = 0 ; // Align to the left.
  style.opacity = 0 ; // Initially hidden (transparent).

  // Apply initial styles to the flip circle.
  style = this._flipCircle.style ; // Reuse the style variable.
  style.position = "absolute" ;
  style.top = 0 ;
  style.left = 0 ;
  style.width = "13px" ;
  style.height = "13px" ;
  this.setCircleOpacity ( 0.25 ) ; // Set initial opacity for the circle.
  style.visibility = "hidden" ; // Initially hide the circle.

  // Set the visual style using the provided foreground and background.
  this.setStyle ( foregroundStyle , backgroundStyle ) ;

  // --- Event Listeners Setup ---
  // Listen for mouse events on the front element to show/hide the info button.
  this._front.addEventListener ( "mousemove" , this._frontMove , true ) ;
  this._front.addEventListener ( "mouseout" , this._frontOutDelay , true ) ;

  // Temporary event listeners for the flipper element.
  this._flipper.addEventListener ( "mousedown" , this._tempLabelDown , true ) ;
  // Prevent default click behavior on the flipper itself.
  this._flipper.setAttribute ( "onclick" , "event.stopPropagation(); event.preventDefault();" ) ;
  // The line below is commented out in the original and should remain so.
  // this._flipper.addEventListener("click", this._labelClicked, true);
  this._flipper.addEventListener ( "mouseover" , this._labelOver , true ) ;
  this._flipper.addEventListener ( "mouseout" , this._labelOut , true ) ;

} // End of AppleInfoButton constructor function.


// Define methods on the AppleInfoButton prototype.
AppleInfoButton.prototype.remove = function ( )
{
  // Remove all previously attached event listeners to prevent memory leaks.

  // Remove listeners from the front element.
  this._front.removeEventListener ( "mousemove" , this._frontMove , true ) ;
  this._front.removeEventListener ( "mouseout" , this._frontOutDelay , true ) ;

  // Remove listeners from the flipper element.
  this._flipper.removeEventListener ( "mousedown" , this._tempLabelDown , true ) ;
  // Original comment: // this._flipper.removeEventListener("click", this._labelClicked, true);
  this._flipper.removeEventListener ( "mouseover" , this._labelOver , true ) ;
  this._flipper.removeEventListener ( "mouseout" , this._labelOut , true ) ;

  // Remove the info button's DOM elements from their parent.
  var parent = this._flipLabel.parentNode ;
  parent.removeChild ( this._flipCircle ) ; // Remove the circle div.
  parent.removeChild ( this._flipLabel ) ; // Remove the image label.
} ; // End of remove method.


// Sets the visual style (foreground and background images) of the info button.
// @param {string} foregroundStyle - Base name for the foreground image.
// @param {string} backgroundStyle - Base name for the background image.
AppleInfoButton.prototype.setStyle = function ( foregroundStyle , backgroundStyle )
{
  // Construct the source path for the 'i' icon.
  this._flipLabel.src = "file:///System/Library/WidgetResources/ibutton/" + foregroundStyle + "_i.png" ;
  // Construct the background style for the rollie circle.
  this._flipCircle.style.background = "url(file:///System/Library/WidgetResources/ibutton/" + backgroundStyle + "_rollie.png) no-repeat top left" ;
} ; // End of setStyle method.


// Sets the opacity of the circular background element.
// @param {number} opacity - The desired opacity value (0.0 to 1.0).
AppleInfoButton.prototype.setCircleOpacity = function ( opacity )
{
  this._flipCircle.style.opacity = opacity ; // Apply the given opacity.
} ; // End of setCircleOpacity method.