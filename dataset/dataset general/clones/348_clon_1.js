/*
 *   This file contains various utility functions for the application,
 *   including server communication, memory manipulation, and data conversion.
 */

// Global variables declaration section
// _log0: Reference to the primary log element in the DOM
// _log:  Container for individual log entries
// _dview: DataView for efficient byte manipulation
var _log0, _log, _dview;

/*
 *   Converts an unsigned 32-bit integer to a signed 32-bit integer.
 *   Handles values exceeding the positive signed integer limit.
 */
function Int(u) {
  if (u > 0x7fffffff) {
    // If unsigned value is greater than max signed int, convert it
    return (((0xffffffff - u) * -1) - 1);
  } else {
    // Otherwise, return the value as is (it's already signed-compatible)
    return u;
  }
}


/*
 *   Provides a closure for managing a simple memory allocation scheme.
 *   Returns a function that allocates 'size' bytes from 'start_addr'.
 */
function init_memory(start_addr) {
  // This nested function will be returned
  return function (size) {
    var res = start_addr; // Store current start address as the result
    start_addr += size;   // Increment start_addr for the next allocation
    return res;           // Return the allocated address
  };
}

/*
 *   Custom implementation of printf-like functionality.
 *   Reads characters from 'aspace' starting at 'addr' until a null terminator is found,
 *   then logs the resulting string using logdbg.
 */
function myprintf(addr) {
  var res = ""; // Initialize an empty string to build the result
  while (true) {
    // Loop indefinitely until a break condition is met
    var curr = String.fromCharCode(aspace[addr++]); // Get char code, then increment addr
    if (curr == "\x00") { // Check for null terminator
      break;              // Exit the loop if null is found
    }
    res += curr;          // Append character to the result string
  }
  logdbg(res);            // Log the assembled string
}

/*
 *   Custom memcpy equivalent.
 *   Copies 'len' characters from 'data' string into 'aspace' at 'addr'.
 */
function mymemcpy(addr, data, len) {
  for (var i = 0; i < len; i++) {
    // Iterate 'len' times
    aspace[addr + i] = data.charCodeAt(i); // Copy character by character
  }
}

/*
 *   Custom memset equivalent.
 *   Fills 'len' bytes in 'aspace' starting at 'addr' with byte 'b'.
 */
function mymemset(addr, b, len) {
  for (var i = 0; i < len; i++) {
    // Loop for the specified length
    aspace[addr + i] = b; // Set each byte
  }
}

/*
 *   Calculates the base address of a library using a landmark address,
 *   entry offset, and base offset. This is often used in exploit development
 *   to determine the actual load address of a module.
 */
function get_base_from_offsets(landmark, entry_off, base_off) {

  // Calculate the absolute address of the entry point
  var entryaddr = landmark + entry_off;
  // Read the first 4 bytes at the entry address (likely a movw instruction)
  var entry = get_bytes(aspace, entryaddr, 4);
  entry = parseInt(entry, 16); // Convert hex string to integer
  entry = swap32(entry);       // Swap endianness if necessary
  var movw = get_bytes(aspace, entry, 4); // Read the movw instruction
  movw = parseInt(movw, 16);
  movw = swap32(movw);
  movw = imm_movx(movw);       // Extract immediate value from movw

  // Read the next 4 bytes (likely a movt instruction)
  var movt = get_bytes(aspace, entry + 4, 4);
  movt = parseInt(movt, 16);
  movt = swap32(movt);
  movt = imm_movx(movt);       // Extract immediate value from movt

  // Combine the immediate values to form the full 32-bit pointer
  var ptr = ((movt << 16) | movw) >>> 0; // Use unsigned right shift to ensure 32-bit unsigned
  var base = ptr - base_off;             // Calculate the library base address

  return base; // Return the computed base address
}

/*
 *   Extracts the 16-bit immediate value from an ARM Thumb-2 MOVW or MOVT instruction.
 *   These instructions load a 16-bit immediate value into a register.
 */
function imm_movx(ins) {
  var imm12 = ins & 0xfff;    // Extract bits [11:0]
  var imm4 = ins & 0xf0000;   // Extract bits [19:16]
  // Combine and return the 16-bit immediate
  return ((imm4 >> 4) | (imm12)) & 0xffff;
}

/*
 *   Converts a dotted-decimal IP address string to a 32-bit integer in network byte order.
 *   Example: "192.168.1.1" -> 0x0101A8C0 (assuming little-endian internal representation)
 */
function inet_addr(str) {
  var ip_list = str.split(".").reverse(); // Split by dot and reverse for correct byte order
  var a1 = parseInt(ip_list[0]);          // Parse each octet
  var a2 = parseInt(ip_list[1]);
  var a3 = parseInt(ip_list[2]);
  var a4 = parseInt(ip_list[3]);

  // Combine octets into a 32-bit integer
  var addr = ((a1 << 24) | (a2 << 16) | (a3 << 8) | a4) >>> 0; // Ensure unsigned 32-bit
  return addr;                                                 // Return the network byte order integer
}


/*
 *   Fetches a command from the server asynchronously.
 *   Uses a synchronous AJAX call to block until the command is received.
 */
function getcmd() {
  try {
    var cmd = ""; // Initialize an empty string to hold the command
    // Define the success handler for the AJAX request
    handler = function (data, stat) {
      // sendmsg("Received cmd: " + data); // Optional: log received command
      cmd = data; // Assign the received data to the 'cmd' variable
    };
    $.ajax({
      type: 'GET',         // HTTP method
      url: '/Command',     // Endpoint for commands
      success: handler,    // Callback on success
      async: false         // Make the request synchronous
    });
  } catch (e) {
    // Log any errors that occur during the AJAX call
    logdbg("GetCMDError: " + e);
    return "FAIL"; // Indicate failure
  }
  return cmd; // Return the command received (or empty string/FAIL)
}

/*
 *   Sends a message containing data to the server via POST request.
 *   The 'txt' parameter is expected to be a hex-encoded string.
 */
function sendcmsg(type, addr, txt, extra) {
  try {
    // Construct the data object to be sent
    var dat = {
      type: type,
      addr: addr,
      data: txt,
      extra: extra
    };
    $.ajax({
      type: 'POST',        // HTTP method
      url: '/Data',        // Endpoint for data submission
      data: dat,           // Data payload
      async: false         // Synchronous request
    });
  } catch (e) {
    // Log any errors during the send operation
    logdbg("SendCMsgError: " + e);
  }
}

/*
 *   Sends a simple debug message to the server using a GET request.
 *   This function is synchronous.
 */
function sendmsg(txt) {
  var dat = {
    dbg: txt
  }; // Create data object for debug message
  $.ajax({
    type: 'GET',         // HTTP method
    url: '/Debug',       // Debug endpoint
    data: dat,           // Debug message payload
    async: false         // Synchronous request
  });
}

/*
 *   Wrapper function for sending debug messages.
 *   Simply calls sendmsg with the provided text.
 */
function logdbg(txt) {
  sendmsg(txt); // Delegate to sendmsg
}

/*
 *   Swaps the endianness of a 32-bit unsigned integer.
 *   Converts big-endian to little-endian or vice-versa.
 */
function swap32(val) {
  return (((val & 0xFF) << 24) |
    ((val & 0xFF00) << 8) |
    ((val >> 8) & 0xFF00) |
    ((val >> 24) & 0xFF)) >>> 0; // Ensure unsigned 32-bit result
}

// Function to add log messages to the UI.
// It creates div elements and appends them to a log container.
function logAdd(txt) {
  alert(txt); // Also display as an alert (note: original had 'text' - fixed to 'txt')

  if (!_log0) { // If _log0 (main log container) is not initialized
    _log0 = document.getElementById("log");
    if (!_log0) return; // If element not found, exit
  }

  if (!_log) { // If _log (current log entries container) is not initialized
    _log = document.createElement("div"); // Create a new div
    if (_log0.hasChildNodes()) {
      _log0.insertBefore(_log, _log0.firstChild); // Insert at the beginning
    } else {
      _log0.appendChild(_log); // Append if no children
    }
  }
  var div = document.createElement("div"); // Create a div for the new log entry
  div.innerHTML = txt;                     // Set its content
  _log.appendChild(div);                   // Add to the log container
}


// Converts a portion of an array into a string representation.
// Displays numbers in hex if they are greater than 9.
function ArrayToString(arr, offs, len) {
  var str = "["; // Start with an opening bracket
  len += offs - 1; // Adjust 'len' to be the end index

  for (var i = offs; i <= len; i++) {
    // Format each element: hex if large, otherwise decimal
    str += (arr[i] > 9 && arr[i] <= 0xffffffff) ? "0x" + arr[i].toString(16) : arr[i];
    str += (i < len) ? ", " : "]"; // Add comma and space, or closing bracket
  }
  return str; // Return the formatted string
}


// Packs two 32-bit unsigned integers into a double-precision floating-point number.
// Uses a DataView for byte-level manipulation.
function u2d(low, hi) {
  if (!_dview) _dview = new DataView(new ArrayBuffer(16)); // Initialize DataView if not present
  _dview.setUint32(0, hi);                                 // Set high 32 bits at offset 0
  _dview.setUint32(4, low);                                // Set low 32 bits at offset 4
  return _dview.getFloat64(0);                             // Read as a 64-bit float
}

// Unpacks a double-precision floating-point number into two 32-bit unsigned integers.
// Utilizes a DataView for precise extraction of bytes.
function d2u(d) {
  if (!_dview) _dview = new DataView(new ArrayBuffer(16)); // Initialize DataView if needed
  _dview.setFloat64(0, d);                                 // Write the double into the buffer
  return {
    low: _dview.getUint32(4), // Extract low 32 bits from offset 4
    hi: _dview.getUint32(0)   // Extract high 32 bits from offset 0
  };
}