function formatAsHeadline(inputString) {
    return String(inputString).replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function retrieveWebResource(webAddress) {
    const resourceLocator = NSURL.URLWithString(webAddress);
    const resourceRequest = NSMutableURLRequest.requestWithURL_cachePolicy_timeoutInterval(resourceLocator, NSURLRequestReloadIgnoringLocalCacheData, 60);
    resourceRequest.setHTTPMethod_("GET");
    let responseReference = null;
    let receivedBytes = NSURLConnection.sendSynchronousRequest_returningResponse_error(resourceRequest, responseReference, null);
    return receivedBytes;
}

function decodeBinaryToString(binaryData) {
    if (binaryData === null) return null;
    return NSString.alloc().initWithData_encoding(binaryData, NSUTF8StringEncoding);
}

function interpretJsonContent(jsonString) {
    if (jsonString === null) return null;
    try {
        return JSON.parse(String(jsonString));
    } catch (e) {
        return null;
    }
}

function acquireUserData() {
    const endpoint = "http://api.randomuser.me/?sketch=true";
    const rawData = retrieveWebResource(endpoint);
    const textData = decodeBinaryToString(rawData);
    const parsedData = interpretJsonContent(textData);

    if (parsedData && parsedData.results && parsedData.results.length > 0) {
        return parsedData.results[0].user;
    }
    return null;
}

function obtainImageFromWeb(webAddress) {
    const resourceLocator = NSURL.URLWithString(webAddress);
    return NSImage.alloc().initWithContentsOfURL(resourceLocator);
}

function updateProfileVisual(visualContainer, personDetails) {
    const imageSourceUrl = personDetails.picture;
    const fetchedImageObject = obtainImageFromWeb(imageSourceUrl);

    if (!fetchedImageObject) {
        return;
    }

    const isExistingBitmap = String(visualContainer.class().name()) === "MSBitmapLayer";

    if (isExistingBitmap) {
        visualContainer.setIsVisible(false);
        const assetCatalog = visualContainer.documentData().images();
        const updatedImage = assetCatalog.addImage_name_convertColourspace(fetchedImageObject, "profilePicture", false);
        visualContainer.setPrimitiveImage(updatedImage);
        visualContainer.setIsVisible(true);
    } else {
        const assetCatalog = MSImageCollection.alloc().init();
        const newImageData = assetCatalog.addImage_name_convertColourspace(fetchedImageObject, "profilePicture", false);

        const newVisualLayer = MSBitmapLayer.alloc().initWithImage_parentFrame_name(
            newImageData,
            visualContainer.frame(),
            "profile:picture"
        );

        if (newVisualLayer) {
            visualContainer.addLayer(newVisualLayer);

            const layerBoundary = newVisualLayer.frame();
            Object.assign(layerBoundary, {
                x: 0,
                y: 0,
                constrainProportions: false,
                height: 200,
                width: 200
            });
            layerBoundary.setConstrainProportions(true);
        }
    }
}

const componentProcessors = {
    "MSTextLayer": function(component, profile) {
        let initialContent = String(component.name());
        initialContent = initialContent.replace("profile:", "");

        const replacementMap = {
            "firstname": () => formatAsHeadline(profile.name.first),
            "lastname": () => formatAsHeadline(profile.name.last),
            "street": () => formatAsHeadline(profile.location.street),
            "city": () => formatAsHeadline(profile.location.city),
            "state": () => formatAsHeadline(profile.location.state),
            "zip": () => profile.location.zip,
            "email": () => profile.email,
            "phone": () => profile.phone,
            "cell": () => profile.cell,
            "username": () => profile.username
        };

        const finalContent = initialContent.replace(/(firstname|lastname|street|city|state|zip|email|phone|cell|username)/g, (match) => {
            const replacer = replacementMap[match];
            return replacer ? replacer() : match;
        });

        component.setStringValue(finalContent);
    },
    "MSBitmapLayer": function(component, profile) {
        updateProfileVisual(component, profile);
    }
};

function populateProfileElement(targetComponent, individualProfile) {
    const componentClass = targetComponent.class();
    const className = String(componentClass.name());

    const processor = componentProcessors[className];
    if (processor) {
        processor(targetComponent, individualProfile);
    }
}