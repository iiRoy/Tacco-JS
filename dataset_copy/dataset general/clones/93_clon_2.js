(function (globalCtx, jqInstance, undefinedValue) {
"use strict";

jqInstance('#drawing-surface-mount')
  .paintPalette({
    canvasBg: './assets/graphics/detailed_bird_drawing_by_community_artists.png',
    startPrompt: 'Engage with this element to launch the creative studio',
    promptStyle: {
      txtColor: '#229'
    },
    autoLoad: false
  })
  .one('click', function () {
    jqInstance(this).paintPalette().startEditor();
  })
  .paintPalette()
  .completeTask(function (outcome) {
    if (outcome.mediaLink && !/\'/.test(outcome.mediaLink)) {
      jqInstance('body').css('background-image', "url('" + outcome.mediaLink + "')");
    }
    jqInstance(this).hide().paintPalette().remove();
  })
  .failTask(function (outcome) {
    jqInstance(this).hide().paintPalette().remove();
    if (outcome.errMsg) {
      jqInstance('body').append('<p>Error encountered during operation: ' + outcome.errMsg + '.</p>');
    } else {
      jqInstance('body').append("<p>No modifications were applied; operation aborted.</p>");
    }
  });

})(globalCtx, jQuery);