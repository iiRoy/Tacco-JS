const DataVault = (function(persisterEngine) {
    let dataDepository = persisterEngine;

    const testAccessibility = () => {
        try {
            const testKeyIdentifier = '__test_key__';
            dataDepository.setItem(testKeyIdentifier, testKeyIdentifier);
            dataDepository.removeItem(testKeyIdentifier);
            return true;
        } catch (e) {
            return false;
        }
    };

    const placeItem = (labelIdentifier, contentValue) => {
        if (testAccessibility()) {
            dataDepository.setItem(labelIdentifier, contentValue);
        }
    };

    const retrieveItem = (labelIdentifier) => {
        if (!testAccessibility()) return null;
        return dataDepository.getItem(labelIdentifier);
    };

    const itemExists = (labelIdentifier) => {
        if (!testAccessibility()) return false;
        return dataDepository.getItem(labelIdentifier) !== null;
    };

    return {
        placeItem,
        retrieveItem,
        itemExists
    };
})(window.sessionStorage);

const ContentRendererModule = (function(persistedDataHandler) {
    let currentInputContent = null;
    let currentContentTypeIdentifier = null;
    let activeDisplayConfiguration = null;
    const refreshCycleDuration = 1000;

    let processingDelayHandle = 0;

    const findElement = (selectorPath) => document.querySelector(selectorPath);
    const findAllElements = (selectorPath) => document.querySelectorAll(selectorPath);

    const recalculateLayoutDimensions = () => {
        const rightPanel = findElement("#right");
        const leftPanel = findElement("#left");
        const previewContentArea = findElement("#right .content");
        const sourceTextEditor = findElement("textarea");

        if (activeDisplayConfiguration === "exact") {
            rightPanel.style.width = "907px";
            leftPanel.style.width = (document.documentElement.clientWidth - 907 - 1) + "px";
        } else {
            findAllElements(".part").forEach(pane => pane.style.width = "49.9999%");
        }
        previewContentArea.style.height = (window.innerHeight - 95 + 1) + "px";
        sourceTextEditor.style.height = (window.innerHeight - 95 + 1) + "px";
        sourceTextEditor.style.width = (leftPanel.clientWidth - 34) + "px";
    };

    const processAndUpdateDisplay = async () => {
        clearTimeout(processingDelayHandle);

        const latestInput = findElement("textarea").value;
        const latestType = findElement("#type").value;

        if (latestInput === currentInputContent && latestType === currentContentTypeIdentifier) {
            processingDelayHandle = setTimeout(processAndUpdateDisplay, refreshCycleDuration);
            return;
        }

        currentInputContent = latestInput;
        currentContentTypeIdentifier = latestType;
        persistedDataHandler.placeItem("data", currentInputContent);
        persistedDataHandler.placeItem("type", currentContentTypeIdentifier);

        try {
            const dataPayload = new URLSearchParams({
                type: latestType,
                markup: currentInputContent
            }).toString();

            const response = await fetch("./render", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: dataPayload
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const renderedHtml = await response.text();
            findElement("#right .content").innerHTML = renderedHtml;
            recalculateLayoutDimensions();
        } catch (error) {
            console.error("Content rendering failed:", error);
            // Optionally display an error message to the user
        } finally {
            processingDelayHandle = setTimeout(processAndUpdateDisplay, refreshCycleDuration);
        }
    };

    const handleConfigurationChange = (eventObject) => {
        findAllElements("header .btn-group .btn").forEach(button => button.classList.remove("active"));
        eventObject.currentTarget.classList.add("active");
        if (eventObject.currentTarget.id === "50-50") {
            activeDisplayConfiguration = "50-50";
        } else {
            activeDisplayConfiguration = "exact";
        }
        recalculateLayoutDimensions();
        persistedDataHandler.placeItem("layout", activeDisplayConfiguration);
    };

    const initializeApplication = async () => {
        if (window.location.hash === "#wp") {
            window.example_url = 'wp-example.txt';
            window.markup_type = 'wp';
        }

        findAllElements("header .btn-group .btn").forEach(button => {
            button.addEventListener("click", handleConfigurationChange);
        });

        if (persistedDataHandler.itemExists("data")) {
            findElement("textarea").value = persistedDataHandler.retrieveItem("data");
        } else {
            try {
                const sourceAddress = window.example_url || "./example.md";
                const response = await fetch(sourceAddress);
                const fetchedContent = await response.text();
                findElement("textarea").value = fetchedContent;
                recalculateLayoutDimensions();
                processAndUpdateDisplay();
            } catch (error) {
                console.error("Failed to load initial example content:", error);
            }
        }

        if (persistedDataHandler.itemExists("type")) {
            const storedContentType = persistedDataHandler.retrieveItem("type");
            console.log(storedContentType);
            findAllElements("#type option").forEach(optionElement => {
                optionElement.selected = (optionElement.value === storedContentType);
            });
            processAndUpdateDisplay();
        } else if (window.markup_type) {
            findAllElements("#type option").forEach(optionElement => {
                optionElement.selected = (optionElement.value === window.markup_type);
            });
        }

        if (persistedDataHandler.itemExists("layout")) {
            const storedLayoutId = persistedDataHandler.retrieveItem("layout");
            const layoutButton = findElement(`#${storedLayoutId}`);
            if (layoutButton) {
                layoutButton.click();
            }
        }

        findElement("#type").addEventListener("change", processAndUpdateDisplay);
        window.addEventListener("resize", recalculateLayoutDimensions);
        recalculateLayoutDimensions();
        processAndUpdateDisplay();
    };

    return {
        startSystem: initializeApplication
    };

})(DataVault);

document.addEventListener("DOMContentLoaded", () => {
    ContentRendererModule.startSystem();
});