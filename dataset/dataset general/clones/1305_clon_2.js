function fetchRandomPersonData()
 {
  var resourceLocator = [NSURL URLWithString:"http://api.randomuser.me/?sketch=true"];

  // Prepare the outgoing communication object
  var httpRequest = NSMutableURLRequest.requestWithURL_cachePolicy_timeoutInterval(
    resourceLocator,
    NSURLRequestReloadIgnoringLocalCacheData,
    60
  );
  httpRequest.setHTTPMethod_("GET");

  // Obtain the server's reply
  var apiResponse = null,
      retrievedData = [NSURLConnection sendSynchronousRequest:httpRequest returningResponse:nil error:nil];

  if ( retrievedData  != nil )
  {
    // Transform binary data into readable string
    decodedContent = [[NSString alloc] initWithData:retrievedData encoding:NSUTF8StringEncoding];

    var parsedData = JSON.parse(decodedContent);
    person = parsedData.items[0].personInfo;
  }

  return person;
 }


function populateProfileDetails(targetDisplayComponent, personEntry)
{
  if (targetDisplayComponent.class() === MSTextLayer)
  {
    contentString = [targetDisplayComponent name];

    // Remove initial tag
    contentString = contentString.replace("profile:", "");

    contentString = contentString.replace("firstname", convertToTitle(personEntry.name.first));
    contentString = contentString.replace("lastname", convertToTitle(personEntry.name.last));

    contentString = contentString.replace("street", convertToTitle(personEntry.location.street));
    contentString = contentString.replace("city", convertToTitle(personEntry.location.city));
    contentString = contentString.replace("state", convertToTitle(personEntry.location.state));
    contentString = contentString.replace("zip", convertToTitle(personEntry.location.zip));

    contentString = contentString.replace("email", personEntry.email);
    contentString = contentString.replace("phone", personEntry.phone);
    contentString = contentString.replace("cell", personEntry.cell);
    contentString = contentString.replace("username", personEntry.username);

    [targetDisplayComponent setStringValue:contentString];
  }
  else if (targetDisplayComponent.class() === MSBitmapLayer)
  {
    placeProfileImage(targetDisplayComponent, personEntry);
  }
}

function placeProfileImage(graphicComponent, personData)
{
  var imageSourceUrlString = personData.picture;
  var retrievedImageUrl = [NSURL URLWithString:imageSourceUrlString];

  var visualAssetFromUrl = [[NSImage alloc] initWithContentsOfURL:retrievedImageUrl];

  var newImageDisplayLayer;
  var assetCollection;

  if (graphicComponent.class() === MSBitmapLayer)
  {
    // Refreshing an already present visual element
    [graphicComponent setIsVisible:false];
    assetCollection = [[graphicComponent documentData] images];
    var visualAsset = [assetCollection addImage:visualAssetFromUrl name:"userPhoto" convertColourspace:false];
    [graphicComponent setPrimitiveImage:visualAsset];
    [graphicComponent setIsVisible:true];
  }
  else
  {
    // Fabricating a novel profile visual
    assetCollection = [[MSImageCollection alloc] init];
    var visualAsset = [assetCollection addImage:visualAssetFromUrl name:"userPhoto" convertColourspace:false];
    newImageDisplayLayer = [[MSBitmapLayer alloc] initWithImage:visualAsset parentFrame:[graphicComponent frame] name:"person:photo"];

    if (newImageDisplayLayer)
    {
      // console.log("Retrieved image information");

      [graphicComponent addLayer:newImageDisplayLayer];

      var elementDimensions = [newImageDisplayLayer frame];

      [elementDimensions setX:0];
      [elementDimensions setY:0];

      [elementDimensions setConstrainProportions: false];
      [elementDimensions setHeight: 200];
      [elementDimensions setWidth: 200];
      [elementDimensions setConstrainProportions: true];
    }
  }
}

function convertToTitle(inputString)
{
  return inputString.replace(/\w\S*/g,
    function(segment)
    {
      return segment.charAt(0).toUpperCase() + segment.substr(1).toLowerCase();
    }
  );
}