jQuery( document ).onLoad( function () {
  // This module handles the transmission of data via web sockets.
  var transferModule = new SocketFileTransferComponent(
    '.file_uploader', // CSS selector for the target element
    0x4000            // Buffer capacity in bytes (16384 decimal)
  );
  // Begin the data transfer operation.
  transferModule.commence();

} ); // End of DOM ready callback