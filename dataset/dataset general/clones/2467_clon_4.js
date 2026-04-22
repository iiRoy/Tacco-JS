((toolset, dataStore, configuration) => {
    if (dataStore.fetchValue('app_warning_dismissed') === '1') {
        return;
    }

    const browserValidityChecks = [
        { key: 'internetExplorer', getter: toolset.internetExplorer, threshold: configuration.ie, parser: parseInt, radix: 10 },
        { key: 'firefox', getter: toolset.firefox, threshold: configuration.firefox, parser: parseFloat },
        { key: 'chrome', getter: toolset.chrome, threshold: configuration.chrome, parser: parseFloat },
        { key: 'opera', getter: toolset.opera, threshold: configuration.opera, parser: parseFloat },
        { key: 'safari', getter: toolset.safari, threshold: configuration.safari, parser: parseFloat }
    ];

    const hasOutmodedSoftware = browserValidityChecks.some(item => {
        const detectedVersion = item.getter;
        const requiredMinimum = (item.parser || parseFloat)(item.threshold || '0', item.radix || 10) || 0;
        return detectedVersion !== undefined && detectedVersion !== null && requiredMinimum >= detectedVersion;
    });

    if (!hasOutmodedSoftware) {
        return;
    }

    const currentDocument = document;
    const navAgent = window.navigator;

    const userLanguage = (navAgent.languages && navAgent.languages[0] || navAgent.language || 'en').substring(0, 2).toLowerCase();

    const infoLinkMarkup = `<a href="https://www.whatbrowser.org/intl/${userLanguage}/" target="_blank">`;

    const localizedPrompts = new Map([
        ['en', 'You are using an outdated browser. ' + infoLinkMarkup + 'More information &#187;'],
        ['af', 'Jy gebruik \'n verouderde webblaaier. ' + infoLinkMarkup + 'Meer inligting &#187;'],
        ['ar', 'المتصفح الذي تستخدمه قديم وغير محدث. ' + infoLinkMarkup + ' المزيد من المعلومات &#187; '],
        ['bn', 'আপনি একটি সেকেলে ঘরানার ব্রাউজার ব্যবহার করছেন। '  + infoLinkMarkup +  'বিস্তারিত দেখুন &#187;'],
        ['cs', 'Používáte zastaralý prohlížeč. ' + infoLinkMarkup + 'Více informací &#187;'],
        ['da', 'Du bruger en ældre browser. ' + infoLinkMarkup + 'Mere information &#187;'],
        ['de', 'Sie benutzen einen veralteten Browser. ' + infoLinkMarkup + 'Mehr Informationen &#187;'],
        ['el', 'Χρησιμοποιείτε ένα ξεπερασμένο πρόγραμμα περιήγησης. ' + infoLinkMarkup + 'Περισσότερες πληροφορίες &#187;'],
        ['es', 'Su navegador está obsoleto. ' + infoLinkMarkup + 'M&aacute;s informaci&oacute;n &#187;'],
        ['fa', 'شما از مرورگری قدیمی استفاده می کنید. ' + infoLinkMarkup + '&#187;اطلاعات بیشتر'],
        ['fi', 'Käytät vanhentunutta selainta. ' + infoLinkMarkup + 'Lisää tietoa &#187;'],
        ['fr', 'Votre navigateur n\'est pas à jour. ' + infoLinkMarkup + 'Plus d\'information &#187;'],
        ['ga', 'Tá tú ag baint úsáide as brabhsálaí atá as dáta. ' + infoLinkMarkup + 'Tuilleadh eolais &#187;'],
        ['he', 'דפדפן האינטernet שלך אינו מעודכן. ' + infoLinkMarkup + 'למידע נוסף &#187;'],
        ['hu', 'A böngészője elavult. ' + infoLinkMarkup + 'További információ &#187;'],
        ['id', 'Anda menggunakan web browser versi lama. ' + infoLinkMarkup + 'Informasi selengkapnya &#187;'],
        ['is', 'Þú ert að nota úreltan vafra. ' + infoLinkMarkup + 'Nánari upplýsingar &#187;'],
        ['it', 'Stai usando un browser datato. ' + infoLinkMarkup + 'Ulteriori informazioni &#187;'],
        ['ja', '旧式のブラウザーを利用されています。' + infoLinkMarkup + '詳細情報 &#187;'],
        ['lt', 'Jūs naudojate pasenusią naršyklę. ' + infoLinkMarkup + 'Daugiau informacijos &#187;'],
        ['lv', 'Jūs izmantojat novecojušu pārlūku. ' + infoLinkMarkup + 'Uzzināt vairāk &#187;'],
        ['nl', 'U gebruikt op dit moment een verouderde webbrowser. ' + infoLinkMarkup + 'Meer informatie &#187;'],
        ['nb-NO', 'Du bruker en utdatert nettleser. ' + infoLinkMarkup + 'Mer informasjon &#187;'],
        ['pl', 'Używasz przestarzałej przeglądarki. ' + infoLinkMarkup + 'Więcej informacji &#187;'],
        ['pt', 'Você está usando um navegador desatualizado. ' + infoLinkMarkup + 'Mais informações &#187;'],
        ['ro', 'Browserul dumneavoastră este depăşit. ' + infoLinkMarkup + 'Mai multe informații &#187;'],
        ['ru', 'Вы используете устаревший браузер. ' + infoLinkMarkup + 'Подробнее &#187;'],
        ['sk', 'Používate zastaralý prehliadač. ' + infoLinkMarkup + 'Viac informácií &#187;'],
        ['sl', 'Uporabljate zastarel brskalnik. ' + infoLinkMarkup + 'Več informacij &#187;'],
        ['sr', 'Vi koristite zastarelu verziju browsera. ' + infoLinkMarkup + 'Vi&#353;e informacija &#187;'],
        ['sv', 'Du använder en gammal webbläsare. ' + infoLinkMarkup + 'Mer information &#187;'],
        ['tr', 'Çok eski bir tarayıcı kullanıyorsunuz. ' + infoLinkMarkup + 'Daha fazla bilgi &#187;'],
        ['vi', 'Trình duyệt bạn dùng đã lỗi thời rồi. ' + infoLinkMarkup + 'Thêm thông tin &#187;'],
        ['zh', '您的浏览器版本过旧。 ' + infoLinkMarkup + '更多信息 &#187;'],
        ['zh-tw', '你正在使用過時的瀏覽器。 ' + infoLinkMarkup + '更多訊息 &#187;']
    ]);

    const bannerStyles = `
        #warning-banner {
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
            box-sizing:content-box
        }
        #warning-banner a {
            text-decoration:underline;
            color:#EBEBF4
        }
        #warning-banner a:hover, #warning-banner a:active {
            text-decoration:none;
            color:#DBDBEB
        }
        #warning-banner-closer {
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
            line-height:42px
        }
        #warning-banner-closer:hover {
            background:#E04343;
            color:#FFF
        }
    `;

    const pageBody = currentDocument.body;
    const pageHead = currentDocument.head || currentDocument.getElementsByTagName('head')[0];

    const styleBlock = currentDocument.createElement('style');
    styleBlock.id = 'browser-warning-styles';
    styleBlock.setAttribute('type', 'text/css');

    if (styleBlock.styleSheet) {
        styleBlock.styleSheet.cssText = bannerStyles;
    } else {
        styleBlock.appendChild(currentDocument.createTextNode(bannerStyles));
    }
    pageHead.insertBefore(styleBlock, pageHead.firstChild);

    const mainWarningPanel = currentDocument.createElement('div');
    mainWarningPanel.id = 'warning-banner';
    mainWarningPanel.innerHTML = (localizedPrompts.get(userLanguage) || localizedPrompts.get(userLanguage.substring(0,2)) || localizedPrompts.get('en')) + '</a>';

    const closeNotificationButton = currentDocument.createElement('a');
    closeNotificationButton.id = 'warning-banner-closer';
    closeNotificationButton.innerHTML = '&times;';

    mainWarningPanel.appendChild(closeNotificationButton);

    closeNotificationButton.addEventListener('click', (eventSignal) => {
        pageBody.removeChild(mainWarningPanel);
        pageBody.classList.remove('warning-banner-active');

        dataStore.saveValue('app_warning_dismissed', '1', 7);
        
        eventSignal.preventDefault();
    });

    pageBody.appendChild(mainWarningPanel);
    pageBody.classList.add('warning-banner-active');

})(
    {
        internetExplorer: (function() {
            const ua = window.navigator.userAgent;
            const msie = ua.indexOf('MSIE ');
            if (msie > -1) {
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }
            const trident = ua.indexOf('Trident/');
            if (trident > -1) {
                const rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }
            return undefined;
        })(),
        firefox: (function() {
            const ua = window.navigator.userAgent;
            const firefox = ua.indexOf('Firefox/');
            if (firefox > -1) {
                return parseFloat(ua.substring(firefox + 8));
            }
            return undefined;
        })(),
        chrome: (function() {
            const ua = window.navigator.userAgent;
            const chrome = ua.indexOf('Chrome/');
            if (chrome > -1) {
                return parseFloat(ua.substring(chrome + 7, ua.indexOf(' ', chrome)));
            }
            return undefined;
        })(),
        opera: (function() {
            const ua = window.navigator.userAgent;
            const opera = ua.indexOf('Opera/') > -1 || ua.indexOf('OPR/') > -1;
            if (opera) {
                const opr = ua.indexOf('OPR/');
                if (opr > -1) {
                    return parseFloat(ua.substring(opr + 4));
                }
                const version = ua.match(/Version\/([0-9.]+)/);
                if (version) return parseFloat(version[1]);
                return parseFloat(ua.substring(ua.indexOf('Opera/') + 6));
            }
            return undefined;
        })(),
        safari: (function() {
            const ua = window.navigator.userAgent;
            const safari = ua.indexOf('Safari/') > -1;
            const chrome = ua.indexOf('Chrome/') > -1;
            if (safari && !chrome) {
                const version = ua.match(/Version\/([0-9.]+)/);
                if (version) return parseFloat(version[1]);
            }
            return undefined;
        })()
    },
    {
        fetchValue: function(keyId) {
            const cookieName = keyId + '=';
            const allCookies = decodeURIComponent(document.cookie).split(';');
            for (let idx = 0; idx < allCookies.length; idx++) {
                let currentCookie = allCookies[idx];
                while (currentCookie.charAt(0) === ' ') {
                    currentCookie = currentCookie.substring(1);
                }
                if (currentCookie.indexOf(cookieName) === 0) {
                    return currentCookie.substring(cookieName.length, currentCookie.length);
                }
            }
            return null;
        },
        saveValue: function(keyId, content, durationDays) {
            let expiration = '';
            if (durationDays) {
                const dateMark = new Date();
                dateMark.setTime(dateMark.getTime() + (durationDays * 24 * 60 * 60 * 1000));
                expiration = '; expires=' + dateMark.toUTCString();
            }
            document.cookie = keyId + '=' + content + expiration + '; path=/';
        }
    },
    {
        ie: '8',
        firefox: '0.0',
        chrome: '0.0',
        opera: '0.0',
        safari: '0.0'
    }
);