const assetInfo = (() => {
  const currentDisplayPage = [doc currentPage];
  const currentDisplayCanvas = [[doc currentPage] currentArtboard];
  const activeCanvas = currentDisplayCanvas || currentDisplayPage;
  return { activeCanvas, currentDisplayPage, currentDisplayCanvas };
})();

const primaryIconName = "icon_256x256.png";

function displayModalAlert(contentMessage, confirmationCallback) {
  const alertPane = [COSAlertWindow new];
  [alertPane setMessageText: kPluginName];
  [alertPane setInformativeText: contentMessage];
  const currentScriptPath = sketch.scriptPath;
  const parentDirectory = [currentScriptPath stringByDeletingLastPathComponent];
  const fullIconPath = parentDirectory + "/library/" + primaryIconName;
  const visualAsset = [[NSImage alloc] initByReferencingFile:fullIconPath];
  [alertPane setIcon:visualAsset];
  const userResponse = [alertPane runModal];
  (userResponse === 0 && confirmationCallback) && confirmationCallback();
}

const isSelectionAbsent = () => ([selection count] === 0);

const retrieveTemporaryStoragePath = (itemIdentifier = null) => {
  const fileSysManager = [NSFileManager defaultManager];
  const cacheURLs = [[fileSysManager URLsForDirectory:NSCachesDirectory inDomains:NSUserDomainMask] lastObject];
  const domainPath = [[cacheURLs URLByAppendingPathComponent:kPluginDomain] path];
  return itemIdentifier ? `${domainPath}/${itemIdentifier}` : `${domainPath}/${[[NSDate date] timeIntervalSince1970]}`;
};

const ensureDirectoryExists = (directoryPath) => {
  const fManager = [NSFileManager defaultManager];
  return [fManager fileExistsAtPath:directoryPath] || [fManager createDirectoryAtPath:directoryPath withIntermediateDirectories:true attributes:null error:null];
};

const persistContentToFile = (contentData, targetPath) => {
  const stringToSave = [NSString stringWithFormat:@"%@", contentData];
  const pathForFile = [NSString stringWithFormat:@"%@", targetPath];
  return [stringToSave writeToFile:pathForFile atomically:true encoding:NSUTF8StringEncoding error:null];
};

const obtainLayerBounds = (targetLayer) => {
  const layerRectangle = [targetLayer absoluteRect];
  return {
    x: ~~(layerRectangle.x()),
    y: ~~(layerRectangle.y()),
    width: ~~(layerRectangle.width()),
    height: ~~(layerRectangle.height())
  };
};

const detachLayer = (element) => {
  const container = [element parentGroup];
  container && [container removeLayer: element];
};

const adjustDimensions = (itemLayer, newWidth, newHeight, useAbsolute) => {
  const dimensionAccessor = useAbsolute ? [itemLayer absoluteRect] : [itemLayer frame];
  [dimensionAccessor setWidth: newWidth];
  [dimensionAccessor setHeight: newHeight];
  return itemLayer;
};

const relocateItem = (itemLayer, newX, newY, useAbsolute) => {
  const positionAccessor = useAbsolute ? [itemLayer absoluteRect] : [itemLayer frame];
  [positionAccessor setX: newX];
  [positionAccessor setY: newY];
  return itemLayer;
};

const insertImageLayer = (sourcePath, containerElement = assetInfo.activeCanvas, visualName = "Bitmap") => {
  if (![containerElement documentData]) {
    displayModalAlert("Before adding a Bitmap, add its parent to the document.");
    return;
  }
  const graphicLayer = [MSBitmapLayer new];
  [graphicLayer setName:visualName];
  [containerElement addLayers:[graphicLayer]];
  const graphicAsset = [[NSImage alloc] initWithContentsOfFile:sourcePath];
  if (graphicAsset) {
    const originalSize = [graphicAsset size];
    const layerFills = [[graphicLayer style] fills];
    [graphicLayer setConstrainProportions:false];
    [layerFills addNewStylePart];
    [[layerFills firstObject] setIsEnabled:false];
    [graphicLayer setRawImage:graphicAsset convertColourspace:false collection:[[doc documentData] images]];
    [[graphicLayer frame] setWidth:originalSize.width];
    [[graphicLayer frame] setHeight:originalSize.height];
    [graphicLayer setConstrainProportions:true];
  } else {
    displayModalAlert("Image file could not be found!");
  }
  return graphicLayer;
};

const applyBitmapTexture = (targetVisual, texturePath) => {
  const textureImage = [[NSImage alloc] initWithContentsOfFile:texturePath];
  if (textureImage && [targetVisual class] === MSShapeGroup) {
    const visualFills = [[targetVisual style] fills];
    const currentFillsIterator = [[visualFills array] objectEnumerator];
    let currentFill;
    while (currentFill = [currentFillsIterator nextObject]) {
      [currentFill setIsEnabled:false];
    }
    [visualFills addNewStylePart];
    const newTextureFill = [visualFills lastObject];
    const textureCollection = [[newTextureFill documentData] images];
    [newTextureFill setFillType:4];
    [newTextureFill setPatternImage:textureImage collection:textureCollection];
    [newTextureFill setPatternFillType:1];
  }
};

const fetchRemoteJSON = (endpointURL) => {
  const networkRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:endpointURL]];
  const networkResponse = [NSURLConnection sendSynchronousRequest:networkRequest returningResponse:null error:null];
  return [NSJSONSerialization JSONObjectWithData:networkResponse options:null error:null];
};