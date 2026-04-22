class AppearanceController {
    #hostBridgeConnection;
    #dynamicStyleElementIdentifier = "visualSchemaPatcher";

    constructor() {
        // Controller initialization logic can go here if needed,
        // but the main setup happens in initializeDisplay.
    }

    // Private helper to process a single color component (R, G, or B)
    static #adjustAndFormatColorComponent(rawComponentValue, valueModifier = 0) {
        const adjustedComponent = Math.floor(Math.max(0, Math.min(255, rawComponentValue + valueModifier)));
        return adjustedComponent.toString(16).padStart(2, '0');
    }

    // Private helper to convert a color object to a full hexadecimal string
    static #convertColorObjectToHexadecimal(componentData, valueModifier = 0) {
        if (!componentData) {
            return "";
        }
        return AppearanceController.#adjustAndFormatColorComponent(componentData.red, valueModifier) +
               AppearanceController.#adjustAndFormatColorComponent(componentData.green, valueModifier) +
               AppearanceController.#adjustAndFormatColorComponent(componentData.blue, valueModifier);
    }

    // Private helper to inject a complete CSS string into a managed style element
    static #injectStyleDefinition(identifier, cssPayload) {
        let styleContainer = document.getElementById(identifier);
        if (!styleContainer) {
            styleContainer = document.createElement("style");
            styleContainer.id = identifier;
            document.head.appendChild(styleContainer);
        }
        // Replace all existing rules with the new set
        styleContainer.textContent = cssPayload;
    }

    // Main routine to update the visual appearance based on application settings
    refreshVisualSchema(applicationLookAndFeel) {
        const {
            panelBackgroundColor: { color: primaryPalette },
            baseFontSize: primaryTextSize,
            baseFontFamily: primaryFontFamily
        } = applicationLookAndFeel;

        const baseShadeHex = AppearanceController.#convertColorObjectToHexadecimal(primaryPalette);
        const deeperShadeHex = AppearanceController.#convertColorObjectToHexadecimal(primaryPalette, 20);
        const lighterShadeHex = AppearanceController.#convertColorObjectToHexadecimal(primaryPalette, -100);

        const textContrastHex = (primaryPalette.red > 122) ? "000000" : "F0F0F0";

        // Construct an array of individual CSS rule strings
        const cssDefinitions = [
            `.displayElement { background-color: #${baseShadeHex}; font-size: ${primaryTextSize}px; font-family: ${primaryFontFamily}; color: #${textContrastHex}; }`,
            `.displayBackground { background-color: #${baseShadeHex}; }`,
            `.displayBackgroundDark { background-color: #${deeperShadeHex}; }`,
            `.displayBackgroundLight { background-color: #${lighterShadeHex}; }`,
            `.displayTextSize { font-size: ${primaryTextSize}px; }`,
            `.displayFontFamily { font-family: ${primaryFontFamily}; }`,
            `.displayTextColor { color: #${textContrastHex}; }`,
            `.displayGenericText { font-size: ${primaryTextSize}px; font-family: ${primaryFontFamily}; color: #${textContrastHex}; }`,
            `.interactiveButton { background-color: #${deeperShadeHex}; border-color: #${lighterShadeHex}; }`,
            `.interactiveButton:hover { background-color: #${baseShadeHex}; }`,
            `.interactiveButton:active { background-color: #${deeperShadeHex}; }`
        ];

        // Join the rules and apply them to the style element
        AppearanceController.#injectStyleDefinition(this.#dynamicStyleElementIdentifier, cssDefinitions.join('\n'));
    }

    // Event handler for theme modifications from the host application
    handleApplicationThemeUpdate(eventSignal) {
        try {
            const hostEnvironmentData = JSON.parse(eventSignal.data);
            this.refreshVisualSchema(hostEnvironmentData.appSkinInfo);
        } catch (error) {
            // In a production scenario, robust error handling or logging would be here.
            // console.error("Error processing host theme update:", error);
        }
    }

    // Entry point to set up the appearance controller
    initializeDisplay() {
        this.#hostBridgeConnection = new window.CSInterface(); // Establish connection to the host application

        // Apply the initial visual settings
        this.refreshVisualSchema(this.#hostBridgeConnection.hostEnvironment.appSkinInfo);

        // Register to listen for theme changes from the host
        this.#hostBridgeConnection.addEventListener("com.adobe.csxs.events.ThemeColorChanged", this.handleApplicationThemeUpdate.bind(this));
    }
}

// Create an instance of the controller and immediately initialize its display management
const globalAppearanceManager = new AppearanceController();
globalAppearanceManager.initializeDisplay();