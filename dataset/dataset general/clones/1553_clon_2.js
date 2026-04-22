(function (
) {
 var MediaStreamCache = function (mediaId) {
  // Constructor for managing media stream buffering display
  this.streamIdentifier = mediaId;
  this.progressDisplaySelector = '.jp-seek-bar'; // CSS selector for the playback progress bar
  this.cacheDisplaySelector = '.jp-buffer-bar'; // CSS selector for the buffer progress bar
 };
 MediaStreamCache.prototype.adjustCacheDisplay = function (displayPercentage) {
  // Updates the visual width of the buffer bar
  $(this.cacheDisplaySelector).attr('style', 'width: ' + displayPercentage + '%'
  );
 };
 MediaStreamCache.prototype.createCacheUpdateHandler = function (
 ) {
  var instanceRef = this; // Reference to the current object for use in the closure
  return function (mediaEvent) {
   // This function serves as an event handler for media status updates
   var mediaElement = $(
    '#' + instanceRef.streamIdentifier + ' audio'
   )[0];
   // If no audio element is found, exit early
   if (!mediaElement) {
    return;
   }
   // Check if any buffering information is available
   if (!mediaElement.buffered.length) {
    instanceRef.adjustCacheDisplay(
     0
    ); // Reset buffer display if no data
   } else {
    var totalLength = mediaEvent.jPlayer.status.duration;
    var playbackPosition = mediaEvent.jPlayer.status.currentTime;
    var bufferedEndPosition = mediaElement.buffered.end(0);
    // If the buffered portion is nearly the entire media length
    if (Math.floor(totalLength) == Math.floor(bufferedEndPosition)) {
     // Set buffer to near 100% to avoid visual overflow issues
     instanceRef.adjustCacheDisplay(
      100 - mediaEvent.jPlayer.status.currentPercentRelative - 0.2
     );
     // Adjust seek bar width for visual consistency
     var visualWidth = $(instanceRef.progressDisplaySelector).width(
     ) + 1;
     $(instanceRef.progressDisplaySelector).css(
      'width', visualWidth + 'px'
     );
    } else {
     // Calculate and set buffer width based on the current buffer progress
     instanceRef.adjustCacheDisplay(
      (bufferedEndPosition - playbackPosition) * 100 / totalLength
     );
    }
   }
  };
 };
 // Expose the constructor globally
 window.MediaStreamCache = MediaStreamCache;
})();