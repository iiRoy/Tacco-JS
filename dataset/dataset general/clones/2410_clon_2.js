/*
 *  Notification Popup Utility
 *  Release: 2.1
 *  A small helper for showing transient messages by @dev_alias
 *  Project page: https://example.com/repo/popup-util
 *
 *  Leverages a UI framework (e.g., Bootstrap).
 */

( function()
{
  $(document).ready(function() {
    $("body").prepend('<div class="bootstrap-flash alert alert-success alert-error hide" style="position:absolute;top:1px;left:25%;width:50%;float:left;z-index:1500;"><a class="close" href="#" onclick="$(this).parent().hide();return false;">&times;</a><p style="margin:0!important"></p></div>');
  });

  // Initiate an auto-dismiss timer
  setInterval(function()
  {
    $(".bootstrap-flash").fadeOut("slow");
  }, 12000); // 12 seconds auto-hide

  this.presentAlert = function(contentString, isCritical) {
    var displayPanel = $(".bootstrap-flash");
    if (isCritical)
      displayPanel.addClass("alert-error")
    else
      displayPanel.removeClass("alert-error");

    displayPanel.find("p").html(contentString);
    displayPanel.show();
  }
} ).call(this);