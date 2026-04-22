function getRandomUser()
{
    /*
     * This function is responsible for fetching random user data
     * from an external API.
     * It uses synchronous network requests.
     */

    var theUrl = [NSURL URLWithString: "http://api.randomuser.me/?sketch=true"];

    // Define the request parameters and URL.
    var theRequest = NSMutableURLRequest.requestWithURL_cachePolicy_timeoutInterval(theUrl, NSURLRequestReloadIgnoringLocalCacheData, 60);

    theRequest.setHTTPMethod_("GET"); // Set the HTTP method to GET.


    // Get the response data from the API.
    var theResponse = null,
        theResponseData = [NSURLConnection sendSynchronousRequest: theRequest
                                                returningResponse: nil
                                                            error: nil];

    if (theResponseData != nil) {
        // Data was received successfully.
        // Convert the raw data to a human-readable text string using UTF8 encoding.
        theText = [[NSString alloc] initWithData: theResponseData
                                        encoding: NSUTF8StringEncoding];


        var parsed = JSON.parse(theText); // Parse the JSON string into a JavaScript object.

        user = parsed.results[0].user; // Extract the user object from the parsed data.
    }

    // Return the user object. If no data was fetched, 'user' might be undefined or null.
    return user;
}


function insertRandomUser(profileLayer, user)
{
  // This function populates a given profile layer with user data.
  // It handles both text layers and bitmap layers.

  if (profileLayer.class() === MSTextLayer)
  {
    // If the layer is a text layer, we need to replace placeholder text.

    text = [profileLayer name]; // Get the name of the text layer, which contains placeholders.

    /* Strip any "profile:" prefix from the layer name to get the actual field. */
    text = text.replace("profile:", "");

    // Replace various name fields with the user's data, converting to title case.
    text = text.replace("firstname", toTitleCase(user.name.first));
    text = text.replace("lastname", toTitleCase(user.name.last));


    // Replace location-related fields.
    text = text.replace("street", toTitleCase(user.location.street));
    text = text.replace("city", toTitleCase(user.location.city));
    text = text.replace("state", toTitleCase(user.location.state));
    text = text.replace("zip", toTitleCase(user.location.zip));


    // Replace contact and username fields.
    text = text.replace("email", user.email);
    text = text.replace("phone", user.phone);
    text = text.replace("cell", user.cell);
    text = text.replace("username", user.username);


    [profileLayer setStringValue: text]; // Update the text layer's content.
  }
  else if (profileLayer.class() === MSBitmapLayer)
  {
    // If it's a bitmap layer, insert the user's profile picture.
    insertProfilePicture(profileLayer, user);
  }
}

function insertProfilePicture(profileLayer, user)
{
  /*
   * Manages the insertion or update of a user's profile picture.
   * It takes a layer (which could be a placeholder or an existing bitmap)
   * and the user object.
   */

  var urlString = user.picture; // Get the URL for the user's profile picture.
  var imageURL = [NSURL URLWithString: urlString]; // Convert the string URL to an NSURL object.

  var imageFromURL = [[NSImage alloc] initWithContentsOfURL: imageURL]; // Load the image data from the URL.

  var imageLayer; // This will hold the new image layer if one is created.
  var imageCollection; // Reference to the document's image collection.


  if (profileLayer.class() === MSBitmapLayer)
  {
    // Case 1: Updating an existing bitmap layer with a new image.

    [profileLayer setIsVisible: false]; // Temporarily hide the layer during update.

    imageCollection = [[profileLayer documentData] images]; // Get the image collection from the document.

    // Add the new image to the collection.
    var image = [imageCollection addImage: imageFromURL
                                     name: "profilePicture"
                             convertColourspace: false];

    [profileLayer setPrimitiveImage: image]; // Set the new image on the existing layer.
    [profileLayer setIsVisible: true]; // Make the layer visible again.
  }
  else
  {
    // Case 2: Creating a new profile picture layer.
    // This typically happens if 'profileLayer' is a container or group.

    imageCollection = [[MSImageCollection alloc] init]; // Initialize a new image collection.

    var image = [imageCollection addImage: imageFromURL
                                     name: "profilePicture"
                             convertColourspace: false];

    // Create a new bitmap layer with the image.
    imageLayer = [[MSBitmapLayer alloc] initWithImage: image
                                          parentFrame: [profileLayer frame]
                                                 name: "profile:picture"];

    if (imageLayer)
    {
      // If the image layer was successfully created.
      // log ("Got Image Data"); // Debugging line, commented out.

      [profileLayer addLayer: imageLayer]; // Add the new image layer to the parent layer.

      var layerFrame = [imageLayer frame]; // Get the frame of the newly added image layer.

      // Position the image at the top-left corner within its parent.
      [layerFrame setX: 0];
      [layerFrame setY: 0];

      // Adjust the size of the image layer.
      [layerFrame setConstrainProportions: false]; // Allow non-proportional scaling temporarily.
      [layerFrame setHeight: 200]; // Set a fixed height.
      [layerFrame setWidth: 200]; // Set a fixed width.
      [layerFrame setConstrainProportions: true]; // Re-enable proportional scaling.
    }
  }
}


function toTitleCase(str)
{
    // This helper function converts a string to Title Case.
    // It capitalizes the first letter of each word and makes the rest lowercase.

    return str.replace(/\w\S*/g, function(txt)
    {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}