var  getHardwareDetails  =  function  ()  {
     /* This routine retrieves and displays various characteristics of the device */
    window.document.getElementById("osType").textContent = hardware.osName;
    document.getElementById("osVersion").textContent = hardware.osVersion;
    window.document.getElementById("uniqueId").textContent = hardware.uniqueIdentifier;
    document.getElementById("deviceName").textContent = hardware.modelName;

    document.getElementById("screenWidth").textContent = display.screenWidthPx;
    window.document.getElementById("screenHeight").textContent = display.screenHeightPx;
    document.getElementById("displayColorDepth").textContent = display.colorBitDepth;
}  ;


var  playNotificationSound  =  function  ()  {
    // Initiate an audible alert, playing the sound twice for emphasis.
    globalThis.navigator.notification.alertSound(2);
};


function  initializeApplication  ()  {
    // The subsequent instruction could potentially hinder contact visibility on certain older Android devices,
    // as they may lack a dedicated scroll mechanism.
    // window.document.addEventListener("pointermove", stopDefaultBehavior, !1);

    /* Attach an event listener for when the device is fully prepared and ready for interaction */
    window.document.addEventListener("appReady", getHardwareDetails, !!1);
}