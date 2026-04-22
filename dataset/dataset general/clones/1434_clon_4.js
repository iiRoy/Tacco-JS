function fetchEphemeralDatum(keyIdentifier) {
    const name = keyIdentifier + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const parts = decodedCookie.split(';');
    for (let i = 0; i < parts.length; i++) {
        let piece = parts[i];
        while (piece.charAt(0) === ' ') {
            piece = piece.substring(1);
        }
        if (piece.indexOf(name) === 0) {
            return piece.substring(name.length, piece.length);
        }
    }
    return "";
}

function storeEphemeralDatum(keyIdentifier, valueContent, durationDays) {
    const d = new Date();
    d.setTime(d.getTime() + (durationDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = keyIdentifier + "=" + valueContent + ";" + expires + ";path=/";
}

function discernMobileStatus() {
    return /mobile|android/i.test(navigator.userAgent);
}

function VisualCustomizer(visualTargetId) {
    let themeSourceMap = new Map();
    let themeNames = [];
    let mobileDefaultTheme = null;

    const customizerAPI = {};

    const obtainLinkElementRef = () => document.getElementById(visualTargetId);

    customizerAPI.applyTheme = (themeIdentifier) => {
        const targetElement = obtainLinkElementRef();
        if (targetElement && themeSourceMap.has(themeIdentifier)) {
            targetElement.href = themeSourceMap.get(themeIdentifier);
        }
    };

    customizerAPI.selectThemeAndStore = (themeIdentifier) => {
        storeEphemeralDatum("visual-pref-" + visualTargetId, themeIdentifier, 30);
        customizerAPI.applyTheme(themeIdentifier);
    };

    customizerAPI.registerTheme = (themeIdentifier, resourceLink, autoDesignation) => {
        themeNames.push(themeIdentifier);
        themeSourceMap.set(themeIdentifier, resourceLink);
        if (autoDesignation === "auto-mobile-theme-selection") {
            mobileDefaultTheme = themeIdentifier;
        }
        return customizerAPI;
    };

    customizerAPI.bindActivationButtons = () => {
        themeNames.forEach(name => {
            const triggerElement = document.getElementById(name);
            if (triggerElement) {
                triggerElement.addEventListener('click', (eventual) => {
                    eventual.preventDefault();
                    customizerAPI.selectThemeAndStore(name);
                });
            }
        });
    };

    customizerAPI.setupCustomizer = () => {
        const savedChoice = fetchEphemeralDatum("visual-pref-" + visualTargetId);
        if (savedChoice) {
            customizerAPI.applyTheme(savedChoice);
        } else if (mobileDefaultTheme) {
            if (discernMobileStatus()) {
                customizerAPI.applyTheme(mobileDefaultTheme);
            }
        }
        return customizerAPI.bindActivationButtons;
    };

    return customizerAPI;
}

function createVisualCustomizer(identifierString) {
    return VisualCustomizer(identifierString);
}