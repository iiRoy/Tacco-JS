CF_Component_Registry.register( 'legacyBrowserWarning', [ 'cf_dom_utils', 'cf_user_prefs', 'legacyWarningConfig' ], function( browserDetails, userSettings, configData ) {
    // This module detects if the user's browser is outdated and displays a warning.
    // It prevents multiple displays by checking a user preference.

    // A flag to ensure the warning is injected only once per page load.
    let isWarningDisplayed = false;

    /**
     * Checks if the user has previously dismissed the outdated browser warning.
     * @returns {boolean} True if the warning has been dismissed.
     */
    const hasUserDismissedWarning = () => {
        // The original code used getCookie(name) === 1 to check, and getCookie(name, value, days) to set.
        // We'll assume userSettings.getPreference returns truthy if set.
        return userSettings.getPreference( 'cf_legacy_browser_dismissed' );
    };

    if ( hasUserDismissedWarning() ) {
        return; // Exit if the user doesn't want to see it.
    }

    /**
     * Determines if the current browser is outdated based on configured thresholds.
     * @returns {boolean} True if the browser is considered outdated.
     */
    const identifyOutdatedBrowser = () => {
        let browserIsObsolete = false;
        let iterationIndex = 0;

        // Define browser types and their minimum required versions.
        // The original used an array of arrays. We'll use an array of objects for clarity.
        const minimumBrowserVersions = [
            { agent: browserDetails.internetExplorer, threshold: parseInt( configData.ie, 10 ) || 8 },
            { agent: browserDetails.firefox         , threshold: parseFloat( configData.firefox ) || 0 },
            { agent: browserDetails.chrome          , threshold: parseFloat( configData.chrome ) || 0 },
            { agent: browserDetails.opera           , threshold: parseFloat( configData.opera ) || 0 },
            { agent: browserDetails.safari          , threshold: parseFloat( configData.safari ) || 0 }
        ];

        // Iterate through the defined thresholds.
        // Using `some` for early exit when a match is found.
        browserIsObsolete = minimumBrowserVersions.some( ( browserEntry ) => {
            // Check if the current browser agent is detected and its version is below the threshold.
            return browserEntry.agent && browserEntry.agent < browserEntry.threshold;
        });

        return browserIsObsolete;
    };

    if ( !identifyOutdatedBrowser() ) {
        return; // No outdated browser detected, so nothing to do.
    }

    // Reference to the global window and document objects for convenience.
    const globalWindow = window;
    const currentDocument = document;

    // Guard against environments where document.body or document.head might not be ready.
    if (!currentDocument.body || !currentDocument.head) {
        console.warn('DOM elements (body or head) not available for injecting legacy browser warning.');
        return;
    }

    /**
     * Obtains the user's preferred language code, falling back to English.
     * @returns {string} The two-letter or full language code in lowercase.
     */
    const getUserPreferredLanguage = () => {
        const browserNavigator = globalWindow.navigator;
        // Prioritize full language, then browser language, finally default to 'en'.
        return ( browserNavigator.language || browserNavigator.browserLanguage || 'en' ).toLowerCase();
    };

    const userLocale = getUserPreferredLanguage();

    // Construct the hyperlink markup for more information.
    // Using a template literal for string concatenation.
    const moreInfoAnchorMarkup = `<a href="http://www.whatbrowser.org/intl/${userLocale}/" target="_blank">`;

    /**
     * Collection of localized warning messages.
     * The anchor tag is opened here and closed later in the message assembly.
     */
    const warningTextCollection = {
        'en': 'You are using an outdated browser. ' + moreInfoAnchorMarkup + 'More information &#187;',
        'af': 'Jy gebruik \'n verouderde webblaaier. ' + moreInfoAnchorMarkup + 'Meer inligting &#187;',
        'ar': 'المتصفح الذي تستخدمه قديم وغير محدث. ' + moreInfoAnchorMarkup + ' المزيد من المعلومات &#187; ',
        'bn': 'আপনি একটি সেকেলে ঘরানার ব্রাউজার ব্যবহার করছেন। '  + moreInfoAnchorMarkup +  'বিস্তারিত দেখুন &#187;',
        'cs': 'Používáte zastaralý prohlížeč. ' + moreInfoAnchorMarkup + 'Více informací &#187;',
        'da': 'Du bruger en ældre browser. ' + moreInfoAnchorMarkup + 'Mere information &#187;',
        'de': 'Sie benutzen einen veralteten Browser. ' + moreInfoAnchorMarkup + 'Mehr Informationen &#187;',
        'el': 'Χρησιμοποιείτε ένα ξεπερασμένο πρόγραμμα περιήγησης. ' + moreInfoAnchorMarkup + 'Περισσότερες πληροφορίες &#187;',
        'es': 'Su navegador está obsoleto. ' + moreInfoAnchorMarkup + 'M&aacute;s informaci&oacute;n &#187;',
        'fa': 'شما از مرورگری قدیمی استفاده می کنید. ' + moreInfoAnchorMarkup + '&#187;اطلاعات بیشتر',
        'fi': 'Käytät vanhentunutta selainta. ' + moreInfoAnchorMarkup + 'Lisää tietoa &#187;',
        'fr': 'Votre navigateur n\'est pas à jour. ' + moreInfoAnchorMarkup + 'Plus d\'information &#187;',
        'ga': 'Tá tú ag baint úsáide as brabhsálaí atá as dáta. ' + moreInfoAnchorMarkup + 'Tuilleadh eolais &#187;',
        'he': 'דפדפן האינטרנט שלך אינו מעודכן. ' + moreInfoAnchorMarkup + 'למידע נוסף &#187;',
        'hu': 'A böngészője elavult. ' + moreInfoAnchorMarkup + 'További információ &#187;',
        'id': 'Anda menggunakan web browser versi lama. ' + moreInfoAnchorMarkup + 'Informasi selengkapnya &#187;',
        'is': 'Þú ert að nota úreltan vafra. ' + moreInfoAnchorMarkup + 'Nánari upplýsingar &#187;',
        'it': 'Stai usando un browser datato. ' + moreInfoAnchorMarkup + 'Ulteriori informazioni &#187;',
        'ja': '旧式のブラウザーを利用されています。' + moreInfoAnchorMarkup + '詳細情報 &#187;',
        'lt': 'Jūs naudojate pasenusią naršyklę. ' + moreInfoAnchorMarkup + 'Daugiau informacijos &#187;',
        'lv': 'Jūs izmantojat novecojušu pārlūku. ' + moreInfoAnchorMarkup + 'Uzzināt vairāk &#187;',
        'nl': 'U gebruikt op dit moment een verouderde webbrowser. ' + moreInfoAnchorMarkup + 'Meer informatie &#187;',
        'nb-NO': 'Du bruker en utdatert nettleser. ' + moreInfoAnchorMarkup + 'Mer informasjon &#187;',
        'pl': 'Używasz przestarzałej przeglądarki. ' + moreInfoAnchorMarkup + 'Więcej informacji &#187;',
        'pt': 'Você está usando um navegador desatualizado. ' + moreInfoAnchorMarkup + 'Mais informações &#187;',
        'ro': 'Browserul dumneavoastră este depăşit. ' + moreInfoAnchorMarkup + 'Mai multe informații &#187;',
        'ru': 'Вы используете устаревший браузер. ' + moreInfoAnchorMarkup + 'Подробнее &#187;',
        'sk': 'Používate zastaralý prehliadač. ' + moreInfoAnchorMarkup + 'Viac informácií &#187;',
        'sl': 'Uporabljate zastarel brskalnik. ' + moreInfoAnchorMarkup + 'Več informacij &#187;',
        'sr': 'Vi koristite zastarelu verziju browsera. ' + moreInfoAnchorMarkup + 'Vi&#353;e informacija &#187;',
        'sv': 'Du använder en gammal webbläsare. ' + moreInfoAnchorMarkup + 'Mer information &#187;',
        'tr': 'Çok eski bir tarayıcı kullanıyorsunuz. ' + moreInfoAnchorMarkup + 'Daha fazla bilgi &#187;',
        'vi': 'Trình duyệt bạn dùng đã lỗi thời rồi. ' + moreInfoAnchorMarkup + 'Thêm thông tin &#187;',
        'zh': '您的浏览器版本过旧。 ' + moreInfoAnchorMarkup + '更多信息 &#187;',
        'zh-tw': '你正在使用過時的瀏覽器。 ' + moreInfoAnchorMarkup + '更多訊息 &#187;'
    };

    /**
     * Defines the CSS rules for the warning banner and its components.
     * Grouped for easier management.
     */
    const bannerCssRules = `
        #cf-legacy-browser-alert {
            background:#45484d;
            position:absolute;
            z-index:100000;
            width:100%;
            height:26px;
            top:0;
            left:0;
            overflow:hidden;
            padding:8px 0;
            font:18px/26px Arial,sans-serif;
            text-align:center;
            color:#FFF;
            box-sizing:content-box;
            -webkit-box-sizing: content-box; /* Added vendor prefix */
            -moz-box-sizing: content-box; /* Added vendor prefix */
        }
        #cf-legacy-browser-alert a {
            text-decoration:underline;
            color:#EBEBF4;
        }
        #cf-legacy-browser-alert a:hover, #cf-legacy-browser-alert a:active {
            text-decoration:none;
            color:#DBDBEB;
        }
        #cf-legacy-browser-dismiss {
            background:#393b40;
            display:block;
            width:42px;
            height:42px;
            position:absolute;
            text-decoration:none !important;
            cursor:pointer;
            top:0;
            right:0;
            font-size:30px;
            line-height:42px;
            color: #FFF; /* Added color for close button */
        }
        #cf-legacy-browser-dismiss:hover {
            background:#E04343;
            color:#FFF;
        }
    `;

    /**
     * Injects the CSS rules into the document's head.
     */
    const injectStyles = () => {
        const styleElement = currentDocument.createElement( 'style' );
        styleElement.id = 'cf-legacy-warning-styles';
        styleElement.setAttribute( 'type', 'text/css' );

        if ( styleElement.styleSheet ) { // IE-specific way
            styleElement.styleSheet.cssText = bannerCssRules;
        } else {
            styleElement.appendChild( currentDocument.createTextNode( bannerCssRules ) );
        }
        currentDocument.head.insertBefore( styleElement, currentDocument.head.firstChild );
    };

    /**
     * Creates and returns the main warning banner element.
     * @returns {HTMLElement} The DIV element for the warning.
     */
    const createWarningBanner = () => {
        const warningDiv = currentDocument.createElement( 'div' );
        warningDiv.id = 'cf-legacy-browser-alert';

        // Retrieve the appropriate message based on user's language, or fallback.
        const finalMessage = warningTextCollection[ userLocale ]
            || warningTextCollection[ userLocale.substring( 0, 2 ) ]
            || warningTextCollection.en;

        warningDiv.innerHTML = finalMessage + '</a>'; // Close the anchor tag.
        return warningDiv;
    };

    /**
     * Creates and returns the dismiss button element.
     * @returns {HTMLElement} The A element for the dismiss button.
     */
    const createDismissButton = () => {
        const dismissAnchor = currentDocument.createElement( 'a' );
        dismissAnchor.id = 'cf-legacy-browser-dismiss';
        dismissAnchor.innerHTML = '&times;'; // HTML entity for 'x'
        return dismissAnchor;
    };

    // Execute the style injection.
    injectStyles();

    // Create the banner and dismiss button.
    const warningBanner = createWarningBanner();
    const dismissButton = createDismissButton();

    warningBanner.appendChild( dismissButton ); // Append button to the banner.

    // Add event listener for dismissing the warning.
    dismissButton.addEventListener( 'click', ( evt ) => {
        evt.preventDefault(); // Prevent default anchor behavior.

        // Remove the banner from the DOM.
        if ( currentDocument.body.contains( warningBanner ) ) {
            currentDocument.body.removeChild( warningBanner );
        }

        // Clean up the body class.
        currentDocument.body.classList.remove( 'cf-legacy-browser-body-active' );

        // Store user preference to hide the message for 7 days.
        // We'll assume userSettings.setPreference takes name, value, and an options object with expiry.
        userSettings.setPreference( 'cf_legacy_browser_dismissed', true, { expires: 7 } );

        isWarningDisplayed = false; // Reset flag (though script won't run again on this page).
    });

    // Append the warning banner to the document body.
    currentDocument.body.insertBefore( warningBanner, currentDocument.body.firstChild );

    // Add a class to the body to potentially adjust layout (e.g., push content down).
    currentDocument.body.classList.add( 'cf-legacy-browser-body-active' );

    isWarningDisplayed = true; // Mark as displayed.
});