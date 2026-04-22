/*
 * Main jQuery media file for the plugin.
 *
 * This script handles the integration of the WordPress media uploader
 * for selecting images within the plugin's interface.
 *
 * @since  1.0.0
 * @package TGM New Media Plugin
 * @author   Thomas Griffin
 */
jQuery
(
document
)
.
ready
(
function
(
$
)
{

// Declare a variable to hold the custom media manager instance.
 var   tgm_media_frame
;

// Attach a click event handler to open the media uploader.
 $
(
document
.
body
)
.
on
(
'click.tgmOpenMediaManager'
,
'.tgm-open-media'
,
function
(
e
)
{
 // Prevent the default action (e.g., following a link) from occurring.
 e
.
preventDefault
(
)
;

// If the media frame has already been initialized, just open it again.
 if
(
tgm_media_frame
)
{
 tgm_media_frame
.
open
(
)
;
 return
;
 }

/*
 * The media frame does not exist yet, so we need to create it.
 *
 * This is where we define the behavior and appearance of our custom media workflow.
 * The options available are extensive; consult wp-includes/js/media-views.js
 * for a comprehensive list of configurable parameters.
 */
 tgm_media_frame
=
wp
.
media
.
frames
.
tgm_media_frame
=
wp
.
media
(
{
 /*
 * Assign a custom CSS class to the frame.
 * This allows for targeted styling without affecting other media workflows
 * in WordPress.
 */
 className
:
'media-frame tgm-media-frame'
,

/*
 * Choose the type of media workflow frame.
 * 'select' is suitable for general media selection,
 * while 'post' is designed for contexts where a post ID is relevant.
 * We are using 'select' as we only need to pick an image.
 */
 frame
:
'select'
,

/*
 * Determine if multiple files can be selected.
 * Setting this to 'false' restricts the user to selecting only one item.
 * The default is 'true'.
 */
 multiple
:
false
,

/*
 * Set the title for the media modal window.
 * 'tgm_nmp_media.title' is a localized string provided by the plugin.
 */
 title
:
tgm_nmp_media
.
title
,

/*
 * Filter the media library to display only specific types of media.
 * Here, we restrict the view to 'image' files.
 */
 library
:
{
 type
:
'image'
 }
,

/*
 * Customize the text displayed on the primary action button within the modal.
 * The default is 'Select'.
 * This also implicitly controls whether a selection is required before the button
 * becomes active (which it is by default and desired here).
 */
 button
:
{
 text
:
tgm_nmp_media
.
button
 }
 }
)
;

/*
 * ==============================================================================
 * EVENT BINDING SECTION
 *
 * This block defines the actions to be taken when specific events occur
 * within the media frame. These bindings should be established before
 * the frame is opened to ensure all behaviors are correctly initialized.
 *
 * Many more events are available; refer to wp-includes/js/media-views.js
 * for a full list of potential events to hook into.
 * ==============================================================================
 */

/*
 * Bind to the default 'select' event, which fires when the user clicks
 * the primary action button (e.g., 'Use this image').
 * We retrieve the selected attachment data and process it.
 * Since 'multiple' is false and a selection is required, we are guaranteed
 * to have a single selection here.
 */
 tgm_media_frame
.
on
(
'select'
,
function
(
)
{
 // Get the current selection from the frame's state.
 // 'first()' retrieves the single selected item.
 // 'toJSON()' converts the model into a plain JavaScript object.
 var
media_attachment
=
tgm_media_frame
.
state
(
)
.
get
(
'selection'
)
.
first
(
)
.
toJSON
(
)
;

// Update the value of our custom input field with the URL of the selected image.
 $
(
'#tgm-new-media-image'
)
.
val
(
media_attachment
.
url
)
;
 }
)
;

// Finally, open the configured media frame to the user.
 tgm_media_frame
.
open
(
)
;
 }
)
;
}
)
;