// Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
// For licensing information, please refer to LICENSE.html or visit http://ckeditor.com/license

( function ()
{
  var imageDialog = function (  editor ,  dialogType  )
  {
    // Define constants for various states within the dialog's commit process.
    var IMAGE   =  1  ,  // Represents operations related to the image itself.
      LINK    =  2  ,  // Represents operations related to the image's parent link.
      PREVIEW   =  4  ,  // Represents operations for updating the image preview.
      CLEANUP   =  8  ,  // Represents cleanup operations when the dialog closes.

      // Regular expression to parse size values, allowing for 'px' or '%' units.
      regexGetSize  =  /^\s*(\d+)((px)|\%)?\s*$/i  ,

      // Regular expression for size values, also allowing an empty string.
      regexGetSizeOrEmpty =  /(^\s*(\d+)((px)|\%)?\s*$)|^$/i ,

      // Regular expression to specifically check for pixel lengths.
      pxLengthRegex =  /^\d+px$/ ;


    /**
     * Handles changes in image dimension fields (width or height).
     * It updates the corresponding dimension to maintain aspect ratio if locked.
     */
    var onSizeChange = function ()
    {
      var value = this . getValue ()  ,  // Get the current value from the input field.
        dialog = this . getDialog ()  ,  // Get a reference to the parent dialog.
        aMatch = value . match (  regexGetSize  ) ; // Attempt to parse the value.

      if  (  aMatch  )
      {
        if  (  aMatch[ 2 ]  ==  '%'  ) // If the unit is a percentage.
          switchLockRatio (  dialog  ,  false  ) ; // Unlock the ratio as percentages are flexible.

        value = aMatch[ 1 ] ; // Extract the numeric part of the value.
      }

      // Proceed with ratio adjustment only if the aspect ratio is currently locked.
      if  (  dialog . lockRatio  )
      {
        var oImageOriginal = dialog . originalElement ; // Get the original image element dimensions.

        if  (  oImageOriginal . getCustomData (  'isReady'  )  ==  'true'  ) // Ensure original dimensions are available.
        {
          if  (  this . id  ==  'txtHeight'  ) // If the height field was modified.
          {
            if  (  value  &&  value  !=  '0'  )
              value = Math . round (  oImageOriginal . $ . width  *  (  value  /  oImageOriginal . $ . height  )  ) ;

            if  (  !isNaN (  value  )  )
              dialog . setValueOf (  'info'  ,  'txtWidth'  ,  value  ) ; // Update the width field.
          }
          else /* If the width field was modified (this.id === 'txtWidth'). */
          {
            if  (  value  &&  value  !=  '0'  )
              value = Math . round (  oImageOriginal . $ . height  *  (  value  /  oImageOriginal . $ . width  )  ) ;

            if  (  !isNaN (  value  )  )
              dialog . setValueOf (  'info'  ,  'txtHeight'  'value'  ) ; // Update the height field.
          }
        }
      }

      updatePreview (  dialog  ) ; // Always refresh the preview after size changes.
    } ;


    /**
     * Updates the image preview displayed within the dialog.
     * @param {CKEDITOR.dialog} dialog The dialog instance.
     * @returns {number} 0 for success, 1 for failure.
     */
    var updatePreview = function (  dialog  )
    {
      // Do not attempt to load the preview before the dialog's onShow event.
      if  (  !dialog . originalElement  ||  !dialog . preview  )
      {
        return  1 ; // Indicate that the preview could not be updated.
      }

      // Read current attributes from dialog fields and apply them to the image preview.
      dialog . commitContent (  PREVIEW  ,  dialog . preview  ) ;

      return  0 ; // Indicate successful preview update.
    } ;


    /*
     * Custom commit logic for the image dialog.
     * This function prioritizes the 'txtdlgGenStyle' field to ensure
     * inline styles set there are not inadvertently overwritten by other fields.
     */
    function commitContent (  )
    {
      var args = arguments ; // Capture arguments to pass to widget.commit.

      // Get the inline style field from the 'advanced' tab.
      var inlineStyleField = this . getContentElement (  'advanced'  ,  'txtdlgGenStyle'  ) ;

      // If the inline style field exists, commit its changes first.
      inlineStyleField  &&  inlineStyleField . commit . apply (  inlineStyleField  ,  args  ) ;

      // Iterate through all other widgets in the dialog.
      this . foreach (  function (  widget  )
      {
        // If a widget has a commit method and is not the inline style field, commit its changes.
        if  (  widget . commit  &&   widget . id  !=  'txtdlgGenStyle'  )
        {
          widget . commit . apply (  widget  ,  args  ) ;
        }
      } ) ;
    }


    // A flag to prevent recursive calls during internal field synchronization.
    var incommit ;

    /*
     * Synchronizes values between dialog fields, for instance,
     * a change in border size might need to update the inline style text field.
     * This helps maintain consistency across related inputs.
     */
    function commitInternally (  targetFields  )
    {
      if  (  incommit  ) // If an internal commit is already active, prevent recursion.
      {
        return ;
      }

      incommit  =  1 ; // Set the flag to indicate an internal commit is in progress.

      var dialog  =  this . getDialog (  )  ,  // Get the current dialog instance.
        element  =  dialog . imageElement ; // Get the image element being manipulated.

      if  (  element  )
      {
        // Commit the changes from the current field to the image element.
        this . commit (  IMAGE  ,  element  ) ;

        // Ensure targetFields is an array to allow concatenation.
        targetFields = [  ] . concat (  targetFields  ) ;

        var length  =  targetFields . length  ,  // Number of fields to update.
          field ; // Variable to hold each target field.

        for  (  var i  =  0  ;  i  <  length  ;  i++  )
        {
          // Retrieve the target content element.
          field = dialog . getContentElement . apply (  dialog  ,  targetFields[ i ] . split (  ':'  )  ) ;

          // If the field exists, call its setup method. This might trigger further commits.
          field  &&  field . setup (  IMAGE  ,  element  ) ;
        }
      }

      incommit  =  0 ; // Reset the flag, internal commit is complete.
    }


    /**
     * Toggles or sets the state of the aspect ratio lock.
     * @param {CKEDITOR.dialog} dialog The dialog instance.
     * @param {boolean|string} value If 'check', determines lock based on current dimensions.
     *                                 If boolean, sets the lock state directly.
     */
    var switchLockRatio = function (  dialog  ,  value  )
    {
      var oImageOriginal = dialog . originalElement ; // Get the original image data.

      // If the original element is not available (e.g., dialog closed), exit. (#5505)
      if  (  !oImageOriginal  )
      {
        return  null ;
      }

      var ratioButton = CKEDITOR . document . getById (  btnLockSizesId  ) ; // Get the lock ratio button.

      if  (  oImageOriginal . getCustomData (  'isReady'  )  ==  'true'  ) // Check if original image dimensions are loaded.
      {
        if  (  value  ==  'check'  ) /* Determine if ratio should be locked based on current and original dimensions. */
        {
          var width  =  dialog . getValueOf (  'info'  ,  'txtWidth'  )  ,
            height  =  dialog . getValueOf (  'info'  ,  'txtHeight'  )  ,
            originalRatio  =  oImageOriginal . $ . width  *  1000  /  oImageOriginal . $ . height  ,
            thisRatio  =  width  *  1000  /  height ;

          dialog . lockRatio  =  false ; // Default to unlocked.

          if  (  !width  &&  !height  ) // If both fields are empty, assume ratio is locked.
            dialog . lockRatio  =  true ;
          else if  (  !isNaN (  originalRatio  )  &&  !isNaN (  thisRatio  )  )
          {
            if  (  Math . round (  originalRatio  )  ==  Math . round (  thisRatio  )  )
              dialog . lockRatio  =  true ; // Lock if ratios are approximately equal.
          }
        }
        else if  (  value  !=  undefined  ) // If a boolean value is provided, set the lock state directly.
        {
          dialog . lockRatio  =  value ;
        }
        else // Otherwise, toggle the current lock ratio state.
        {
          dialog . lockRatio  =  !dialog . lockRatio ;
        }
      }
      else if  (  value  !=  'check'  ) /* If image is not ready, we cannot lock ratio unless explicitly set. */
      {
        dialog . lockRatio  =  false ; // Force unlock if ratio is unknown.
      }

      // Update the visual appearance of the lock ratio button.
      if  (  dialog . lockRatio  )
        ratioButton . removeClass (  'cke_btn_unlocked'  ) ;
      else
        ratioButton . addClass (  'cke_btn_unlocked'  ) ;

      var lang  =  dialog . _ . editor . lang . image  ,
        label  =  lang[  dialog . lockRatio  ?  'unlockRatio'  :  'lockRatio'  ] ; // Get the appropriate label.

      ratioButton . setAttribute (  'title'  ,  label  ) ; // Update the button's title.
      ratioButton . getFirst (  ) . setText (  label  ) ; // Update the button's text.

      return  dialog . lockRatio ; // Return the current lock ratio state.
    } ;


    /**
     * Resets the width and height input fields to the original dimensions of the image.
     * @param {CKEDITOR.dialog} dialog The dialog instance.
     */
    var resetSize = function (  dialog  )
    {
      var oImageOriginal = dialog . originalElement ; // Retrieve the original image element.

      if  (  oImageOriginal . getCustomData (  'isReady'  )  ==  'true'  ) // Only reset if original dimensions are loaded.
      {
        dialog . setValueOf (  'info'  ,  'txtWidth'  ,  oImageOriginal . $ . width  ) ;
        dialog . setValueOf (  'info'  'txtHeight'  ,  oImageOriginal . $ . height  ) ;
      }

      updatePreview (  dialog  ) ; // Update the preview with the reset sizes.
    } ;


    /**
     * Sets up a dimension field (width or height) in the dialog based on the element's attributes or styles.
     * @param {number} type The commit type (e.g., IMAGE).
     * @param {CKEDITOR.dom.element} element The image element.
     */
    var setupDimension = function (  type  ,  element  )
    {
      if  (  type  !=  IMAGE  ) // This function is only relevant for image-related operations.
      {
        return ;
      }

      /**
       * Helper function to parse a dimension string and return its value.
       * Also handles unlocking ratio if a percentage unit is found.
       * @param {string} size The dimension string (e.g., "100px", "50%").
       * @param {string} defaultValue The value to return if parsing fails.
       * @returns {string} The parsed dimension or the default value.
       */
      function checkDimension (  size  ,  defaultValue  )
      {
        var aMatch  =  size . match (  regexGetSize  ) ; // Attempt to match the size string.

        if  (  aMatch  )
        {
          if  (  aMatch[ 2 ]  ==  '%'  ) /* If a percentage unit is detected. */
          {
            aMatch[ 1 ]  +=  '%' ; // Re-append the percentage sign.
            switchLockRatio (  dialog  ,  false  ) ; // Unlock the ratio.
          }
          return  aMatch[ 1 ] ; // Return the numeric part.
        }
        return  defaultValue ; // Return default if no match.
      }

      var dialog  =  this . getDialog (  )  , // Get the dialog instance.
        value  =  ''  , // Initialize the value.
        dimension  =  (  (  this . id  ==  'txtWidth'  )  ?  'width'  :  'height'  )  , // Determine the dimension property.
        size  =  element . getAttribute (  dimension  ) ; // Get the dimension from the element's attribute.

      // First, try to get the dimension from the element's attribute.
      if  (  size  )
        value = checkDimension (  size  ,  value  ) ;

      // Then, try to get it from the element's inline style, which takes precedence.
      value = checkDimension (  element . getStyle (  dimension  )  ,  value  ) ;

      this . setValue (  value  ) ; // Set the field's value in the dialog.
    } ;


    var previewPreloader ; // Variable to hold the preloader image element.


    /**
     * Event handler for when the image preview successfully loads.
     * It marks the image as ready, removes listeners, and updates dialog state.
     */
    var onImgLoadEvent = function (  )
    {
      // The image has successfully loaded.
      var original = this . originalElement ;

      original . setCustomData (  'isReady'  ,  'true'  ) ; // Mark the original element as ready.

      // Remove all event listeners to prevent memory leaks and redundant calls.
      original . removeListener (  'load'  ,  onImgLoadEvent  ) ;
      original . removeListener (  'error'  ,  onImgLoadErrorEvent  ) ;
      original . removeListener (  'abort'  ,  onImgLoadErrorEvent  ) ;

      // Hide the loading spinner for the image preview.
      CKEDITOR . document . getById (  imagePreviewLoaderId  ) . setStyle (  'display'  ,  'none'  ) ;

      // If not specifically told to avoid resetting, update the size fields.
      if  (  !this . dontResetSize  )
      {
        resetSize (  this  ) ;
      }

      // On the first load, check the aspect ratio to determine if it should be locked.
      if  (  this . firstLoad  )
        CKEDITOR . tools . setTimeout (  function (  ) {  switchLockRatio (  this  ,  'check'  ) ;  }  ,  0  ,  this  ) ;

      this . firstLoad  =  false ; // Reset first load flag.
      this . dontResetSize  =  false ; // Reset don't reset size flag.
    } ;


    /**
     * Event handler for when the image preview fails to load (error or abort).
     * It sets a "no image" placeholder and unlocks the ratio.
     */
    var onImgLoadErrorEvent = function (  )
    {
      // An error occurred or the image loading was aborted.
      var original = this . originalElement ;

      // Remove all event listeners from the original image.
      original . removeListener (  'load'  ,  onImgLoadEvent  ) ;
      original . removeListener (  'error'  ,  onImgLoadErrorEvent  ) ;
      original . removeListener (  'abort'  ,  onImgLoadErrorEvent  ) ;

      // Set a placeholder image to indicate that the image could not be loaded.
      var noimage = CKEDITOR . getUrl (  editor . skinPath  +  'images/noimage.png'  ) ;

      if  (  this . preview  )
        this . preview . setAttribute (  'src'  ,  noimage  ) ;

      // Hide the image loading indicator.
      CKEDITOR . document . getById (  imagePreviewLoaderId  ) . setStyle (  'display'  ,  'none'  ) ;

      switchLockRatio (  this  ,  false  ) ; // Unlock the ratio, as dimensions are now unknown.
    } ;


    /**
     * Generates a unique ID for a dialog element by appending a suffix to a base ID.
     * @param {string} id The base ID.
     * @returns {string} The unique ID.
     */
    var numbering = function (  id  )
    {
      return  CKEDITOR . tools . getNextId (  )  +  '_'  +  id ;
    } ;

    // Unique IDs for various interactive elements within the dialog.
    var btnLockSizesId      =  numbering (  'btnLockSizes'  ) ;
    var btnResetSizeId      =  numbering (  'btnResetSize'  ) ;
    var imagePreviewLoaderId  =  numbering (  'ImagePreviewLoader'  ) ;
    var imagePreviewBoxId   =  numbering (  'ImagePreviewBox'  ) ;
    var previewLinkId     =  numbering (  'previewLink'  ) ;
    var previewImageId      =  numbering (  'previewImage'  ) ;


    // The main dialog definition object.
    return  {
      // Set the dialog title based on whether it's an 'image' or 'image button' dialog.
      title : (  dialogType  ==  'image'  )  ?  editor . lang . image . title  :  editor . lang . image . titleButton  ,
      minWidth : 420  , // Minimum width of the dialog.
      minHeight : 310  , // Minimum height of the dialog.

      /**
       * Called when the dialog is shown. Initializes various dialog properties and elements.
       */
      onShow : function (  )
      {
        this . imageElement  =  false ;
        this . linkElement  =  false ;

        // Initialize flags for editing mode (false means creating new).
        this . imageEditMode  =  false ;
        this . linkEditMode  =  false ;

        this . lockRatio  =  true ; // Ratio is locked by default.
        this . dontResetSize  =  false ; // Flag to control size reset on image load.
        this . firstLoad  =  true ; // Flag for the first image load event.
        this . addLink  =  false ; // Flag to indicate if a new link should be added.

        var editor  =  this . getParentEditor (  )  ,
          sel   =  this . getParentEditor (  ) . getSelection (  )  ,
          element   =  sel . getSelectedElement (  )  ,
          link    =  element  &&  element . getAscendant (  'a'  ) ; // Check if selected element is inside a link.

        // Hide the image loading indicator upon dialog display.
        CKEDITOR . document . getById (  imagePreviewLoaderId  ) . setStyle (  'display'  ,  'none'  ) ;

        // Create a preloader element and get a reference to the preview image.
        previewPreloader = new  CKEDITOR . dom . element (  'img'  ,  editor . document  ) ;
        this . preview  =  CKEDITOR . document . getById (  previewImageId  ) ;

        // Create a temporary original image element to buffer changes.
        this . originalElement  =  editor . document . createElement (  'img'  ) ;
        this . originalElement . setAttribute (  'alt'  ,  ''  ) ;
        this . originalElement . setCustomData (  'isReady'  ,  'false'  ) ;

        if  (  link  ) // If a link element is selected or an ascendant.
        {
          this . linkElement  =  link ;
          this . linkEditMode  =  true ;

          var linkChildren = link . getChildren (  ) ;
          if  (  linkChildren . count (  )  ==  1  ) /* If the link has exactly one child. */
          {
            var childTagName = linkChildren . getItem (  0  ) . getName (  ) ;
            if  (  childTagName  ==  'img'  ||  childTagName  ==  'input'  )
            {
              this . imageElement  =  linkChildren . getItem (  0  ) ;
              if  (  this . imageElement . getName (  )  ==  'img'  )
                this . imageEditMode  =  'img' ;
              else if  (  this . imageElement . getName (  )  ==  'input'  )
                this . imageEditMode  =  'input' ;
            }
          }
          // If in image dialog mode, populate fields from the existing link.
          if  (  dialogType  ==  'image'  )
            this . setupContent (  LINK  ,  link  ) ;
        }

        // Check if the selected element is an image or an image input button.
        if  (  element  &&  element . getName (  )  ==  'img'  &&  !element . getAttribute (  '_cke_realelement'  )
          ||  element  &&  element . getName (  )  ==  'input'  &&  element . getAttribute (  'type'  )  ==  'image'  )
        {
          this . imageEditMode  =  element . getName (  ) ;
          this . imageElement  =  element ;
        }

        if  (  this . imageEditMode  ) // If an image element is being edited.
        {
          // Clone the existing image element to work on a temporary copy.
          this . cleanImageElement  =  this . imageElement ;
          this . imageElement  =  this . cleanImageElement . clone (  true  ,  true  ) ;

          // Populate the dialog fields with the existing image's data.
          this . setupContent (  IMAGE  ,  this . imageElement  ) ;

          // Refresh the state of the Lock Ratio button.
          switchLockRatio (  this  ,  true  ) ;
        }
        else // If a new image is being created.
        {
          this . imageElement  =  editor . document . createElement (  'img'  ) ;
        }

        // If the URL field is empty, hide the preview image.
        if  (  !CKEDITOR . tools . trim (  this . getValueOf (  'info'  ,  'txtUrl'  )  )  )
        {
          this . preview . removeAttribute (  'src'  ) ;
          this . preview . setStyle (  'display'  ,  'none'  ) ;
        }
      }  ,

      /**
       * Called when the user clicks the "OK" button. Handles creating or updating the image/link.
       */
      onOk : function (  )
      {
        // Logic for editing an existing image element.
        if  (  this . imageEditMode  )
        {
          var imgTagName = this . imageEditMode ;

          // Scenario: In image dialog, converting an INPUT (button) to an IMG.
          if  (  dialogType  ==  'image'  &&  imgTagName  ==  'input'  &&  confirm (  editor . lang . image . button2Img  )  )
          {
            imgTagName  =  'img' ; // Change the tag name for the new element.
            this . imageElement  =  editor . document . createElement (  'img'  ) ;
            this . imageElement . setAttribute (  'alt'  ,  ''  ) ;
            editor . insertElement (  this . imageElement  ) ; // Replace the existing input with new img.
          }
          // Scenario: In image button dialog, converting an IMG to an INPUT (button).
          else if  (  dialogType  !=  'image'  &&  imgTagName  ==  'img'  &&  confirm (  editor . lang . image . img2Button  )  )
          {
            imgTagName  =  'input' ; // Change the tag name for the new element.
            this . imageElement  =  editor . document . createElement (  'input'  ) ;
            this . imageElement . setAttributes (
              {
                type  :  'image'  ,
                alt   :  ''
              }
            ) ;
            editor . insertElement (  this . imageElement  ) ; // Replace the existing img with new input.
          }
          else
          {
            // If no conversion, restore the original element to commit changes to it.
            this . imageElement  =  this . cleanImageElement ;
            delete  this . cleanImageElement ; // Clean up the temporary clone.
          }
        }
        else // Logic for creating a brand new image or image button.
        {
          if  (  dialogType  ==  'image'  ) // If it's an image dialog, create an IMG element.
            this . imageElement  =  editor . document . createElement (  'img'  ) ;
          else // Otherwise, it's an image button dialog, create an INPUT type="image".
          {
            this . imageElement  =  editor . document . createElement (  'input'  ) ;
            this . imageElement . setAttribute (  'type'  ,  'image'  ) ;
          }
          this . imageElement . setAttribute (  'alt'  ,  ''  ) ; // Ensure alt attribute is set for accessibility.
        }

        // If not in link editing mode, create a new anchor element.
        if  (  !this . linkEditMode  )
          this . linkElement  =  editor . document . createElement (  'a'  ) ;

        // Commit all dialog field values to the image and link elements.
        this . commitContent (  IMAGE  ,  this . imageElement  ) ;
        this . commitContent (  LINK  ,  this . linkElement  ) ;

        // Remove the style attribute if it results in an empty string.
        if  (  !this . imageElement . getAttribute (  'style'  )  )
          this . imageElement . removeAttribute (  'style'  ) ;

        // Handle insertion of new elements or modification of existing ones.
        if  (  !this . imageEditMode  ) // If a new image is being inserted.
        {
          if  (  this . addLink  )
          {
            if  (  !this . linkEditMode  ) // If also creating a new link.
            {
              editor . insertElement (this.linkElement) ;
              this . linkElement . append (this.imageElement, false) ; // Append image to the new link.
            }
            else /* Link already exists, but the image is new. */
              editor . insertElement (this.imageElement ) ;
          }
          else // No link, just insert the image.
            editor . insertElement (  this . imageElement  ) ;
        }
        else /* Image already existed and was being edited. */
        {
          // Add a new link if one wasn't there but is now desired.
          if  (  !this . linkEditMode  &&  this . addLink  )
          {
            editor . insertElement (  this . linkElement  ) ;
            this . imageElement . appendTo (  this . linkElement  ) ; // Move existing image into the new link.
          }
          // Remove the link if it existed but is no longer desired.
          else if  (  this . linkEditMode  &&  !this . addLink  )
          {
            editor . getSelection (  ) . selectElement (  this . linkElement  ) ;
            editor . insertElement (  this . imageElement  ) ; // Replace the link with just the image.
          }
        }
      }  ,

      /**
       * Called when the dialog is loaded. Performs initial setup, like hiding tabs.
       */
      onLoad : function (  )
      {
        if  (  dialogType  !=  'image'  ) // If it's an image button dialog, hide the 'Link' tab.
          this . hidePage (  'Link'  ) ;

        var doc = this . _ . element . getDocument (  ) ;

        // Add the reset and lock ratio buttons to the tab order.
        this . addFocusable (  doc . getById (  btnResetSizeId  )  ,  5  ) ;
        this . addFocusable (  doc . getById (  btnLockSizesId  )  ,  5  ) ;

        // Assign the custom commitContent function to the dialog.
        this . commitContent  =  commitContent ;
      }  ,

      /**
       * Called when the dialog is hidden or closed. Performs cleanup tasks.
       */
      onHide : function (  )
      {
        if  (  this . preview  )
          this . commitContent (  CLEANUP  ,  this . preview  ) ; // Perform cleanup on the preview element.

        // Remove event listeners and the temporary original element to prevent memory leaks.
        if  (  this . originalElement  )
        {
          this . originalElement . removeListener (  'load'  ,  onImgLoadEvent  ) ;
          this . originalElement . removeListener (  'error'  ,  onImgLoadErrorEvent  ) ;
          this . originalElement . removeListener (  'abort'  ,  onImgLoadErrorEvent  ) ;
          this . originalElement . remove (  ) ; // Remove the temporary element from the DOM.
          this . originalElement  =  false ; // Clear the reference, indicating the dialog is no longer active.
        }

        delete  this . imageElement ; // Remove reference to the image element.
      }  ,

      // Defines the structure and content of the dialog tabs.
      contents : [
        {
          id    :  'info'  , // ID for the 'Info' tab.
          label   :  editor . lang . image . infoTab  , // Label for the tab.
          accessKey :  'I'  , // Access key for quick navigation to this tab.
          elements  :
          [
            {
              type    :  'vbox'  , // Vertical box layout.
              padding   :  0  ,
              children  :
              [
                {
                  type    :  'hbox'  , // Horizontal box layout for URL and dimensions.
                  widths    :  [  '280px'  ,  '110px'  ]  ,
                  align   :  'right'  ,
                  children  :
                  [
                    {
                      id      :  'txtUrl'  , // ID for the URL input field.
                      type    :  'text'  ,
                      label   :  editor . lang . common . url  , // Label for the URL field.
                      required  :  true  , // This field is mandatory.
                      onChange  : function (  )
                      {
                        var dialog  =  this . getDialog (  )  ,
                          newUrl  =  this . getValue (  ) ;