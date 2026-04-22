/* Initial setup for the application */
window.onload = function()
{
  // Handler for the file input element
  var input = document.getElementById(  'file' );
  input.addEventListener( 'change' , importImage );


  // Action for the encode button
  var encodeButton = document.getElementById( 'encode' );
  encodeButton.addEventListener( 'click', encode );

  // Action for the decode button
  var decodeButton = document.getElementById('decode');
  decodeButton.addEventListener( 'click', decode );
};

/* Artificially imposed limit on the maximum message size */
var maxMessageSize = 1000;


// put image in the canvas and display it
var importImage = function(e)
{
  var reader = new FileReader();

  reader.onload = function(event)
  {
    /* Update the image preview display */
    document.getElementById( 'preview' ).style.display = 'block';
    document.getElementById( 'preview' ).src = event.target.result;

    // Clear all input fields
    document.getElementById('message').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password2').value = '';
    document.getElementById('messageDecoded').innerHTML = '';

    // Load the image onto the canvas
    var img = new Image();
    img.onload = function()
    {
      var ctx = document.getElementById('canvas').getContext('2d');
      ctx.canvas.width = img.width;
      ctx.canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      decode(); // Attempt to decode after loading
    };
    img.src = event.target.result;
  };

  reader.readAsDataURL(e.target.files[0]);
};

// encode the image and save it
var encode = function()
{
  var message = document.getElementById( 'message' ).value;
  var password = document.getElementById( 'password' ).value;
  var output = document.getElementById( 'output' );
  var canvas = document.getElementById( 'canvas' );
  var ctx = canvas.getContext( '2d' );

  /* Encrypt the message if a password is provided */
  if ( password.length > 0 )
  {
    message = sjcl.encrypt( password, message );
  }
  else
  {
    message = JSON.stringify( {'text': message} );
  }

  // Pre-check: message size vs. image capacity
  var pixelCount = ctx.canvas.width * ctx.canvas.height;
  if ( ( message.length + 1 ) * 16 > pixelCount * 4 * 0.75 )
  {
    alert( 'Message is too big for the image.' );
    return;
  }

  // Pre-check: message size vs. global limit
  if ( message.length > maxMessageSize )
  {
    alert( 'Message is too big.' );
    return;
  }

  /* Perform the actual message encoding into image data */
  var imgData = ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height );
  encodeMessage( imgData.data, sjcl.hash.sha256.hash( password ), message );
  ctx.putImageData( imgData, 0, 0 );

  // Display the result and prompt user
  alert( 'Done! When the image appears, save and share it with someone.' );

  output.src = canvas.toDataURL();

};

// decode the image and display the contents if there is anything
var decode = function()
{
  var password = document.getElementById('password2').value;
  var passwordFail = 'Password is incorrect or there is nothing here.';

  /* Attempt to decode the message from image data */
  var ctx = document.getElementById('canvas').getContext('2d');
  var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  var message = decodeMessage(imgData.data, sjcl.hash.sha256.hash(password));

  // Parse the decoded message as JSON
  var obj = null;
  try
  {
    obj = JSON.parse(message);
  }
  catch (e)
  {
    // Show the 'choose' interface if parsing fails
    document.getElementById('choose').style.display = 'block';
    document.getElementById('reveal').style.display = 'none';

    if (password.length > 0)
    {
      alert(passwordFail);
    }
  }

  // Show the 'reveal' interface if JSON is valid
  if (obj)
  {
    document.getElementById('choose').style.display = 'none';
    document.getElementById('reveal').style.display = 'block';

    /* Decrypt the message content if it was encrypted */
    if (obj.ct)
    {
      try
      {
        obj.text = sjcl.decrypt(password, message);
      }
      catch (e)
      {
        alert(passwordFail);
      }
    }

    // Helper for HTML escaping
    var escChars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#x2F;',
      '\n': '<br/>'
    };
    var escHtml = function(string)
    {
      return String(string).replace(/[&<>"'\/\n]/g, function (c)
      {
        return escChars[c];
      });
    };
    document.getElementById('messageDecoded').innerHTML = escHtml(obj.text);
  }
};

/* Extracts a specific bit from a number */
var getBit = function(number, location)
{
   return ((number >> location) & 1);
};

// Modifies a bit at a given position in a number
var setBit = function(number, location, bit)
{
   return (number & ~(1 << location)) | (bit << location);
};

/* Converts a 2-byte number into an array of bits */
var getBitsFromNumber = function(number)
{
   var bits = [];
   for (var i = 0; i < 16; i++)
   {
       bits.push(getBit(number, i));
   }
   return bits;
};

// Reconstructs a 2-byte number from bits in the image
var getNumberFromBits = function(bytes, history, hash)
{
    var number = 0, pos = 0;
    while (pos < 16)
    {
        var loc = getNextLocation(history, hash, bytes.length);
        var bit = getBit(bytes[loc], 0);
        number = setBit(number, pos, bit);
        pos++;
    }
    return number;
};

/* Converts a string message into an array of bits */
var getMessageBits = function(message)
{
    var messageBits = [];
    for (var i = 0; i < message.length; i++)
    {
        var code = message.charCodeAt(i);
        messageBits = messageBits.concat(getBitsFromNumber(code));
    }
    return messageBits;
};

// Determines the next pixel location for bit embedding
var getNextLocation = function(history, hash, total)
{
    var pos = history.length;
    var loc = Math.abs(hash[pos % hash.length] * (pos + 1)) % total;
    while (true)
    {
        if (loc >= total)
        {
            loc = 0;
        }
        else if (history.indexOf(loc) >= 0)
        {
            loc++;
        }
        else if ((loc + 1) % 4 === 0)
        {
            loc++;
        }
        else
        {
            history.push(loc);
            return loc;
        }
    }
};

/* Main function to embed the message into image pixel data */
var encodeMessage = function(colors, hash, message)
{
    // Convert message length and content into a bit stream
    var messageBits = getBitsFromNumber(message.length);
    messageBits = messageBits.concat(getMessageBits(message));

    // Keeps track of modified pixel locations to avoid re-use
    var history = [];

    // Iterate through message bits and embed them
    var pos = 0;
    while (pos < messageBits.length)
    {
        // Embed the current message bit into a pixel component
        var loc = getNextLocation(history, hash, colors.length);
        colors[loc] = setBit(colors[loc], 0, messageBits[pos]);

        // Ensure alpha channel is fully opaque for modified pixels
        // This is crucial due to how browsers handle alpha blending
        while ((loc + 1) % 4 !== 0)
        {
            loc++;
        }
        colors[loc] = 255;

        pos++;
    }
};

/* Main function to extract a message from image pixel data */
var decodeMessage = function(colors, hash)
{
    // Stores visited pixel locations during decoding
    var history = [];

    // First, determine the length of the hidden message
    var messageSize = getNumberFromBits(colors, history, hash);

    // Validate message size against image capacity
    if ((messageSize + 1) * 16 > colors.length * 0.75)
    {
        return '';
    }

    // Validate message size against the global limit
    if (messageSize === 0 || messageSize > maxMessageSize)
    {
        return '';
    }

    // Extract each character of the message
    var message = [];
    for (var i = 0; i < messageSize; i++)
    {
        var code = getNumberFromBits(colors, history, hash);
        message.push(String.fromCharCode(code));
    }

    // Reconstruct the full message string
    return message.join('');
};