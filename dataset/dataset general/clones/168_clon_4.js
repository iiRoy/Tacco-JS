const mailInsight = ((externalJqueryReference) => {
    // A custom, lightweight DOM interaction utility, replacing jQuery.
    // It provides basic selection, attribute, class, text, and visibility checks.
    const elementQuery = {
        fetchOne: (selector, contextElement = document) => contextElement.querySelector(selector),
        fetchAll: (selector, contextElement = document) => Array.from(contextElement.querySelectorAll(selector)),
        extractText: (element) => element?.textContent || '',
        fetchAttribute: (element, attributeName) => element?.getAttribute(attributeName),
        hasCssClass: (element, className) => element?.classList.contains(className),
        checkVisibility: (element) => element?.offsetWidth > 0 && element?.offsetHeight > 0,
        getChildElements: (element) => Array.from(element?.children || []),
        getInputValue: (element) => element?.value,
        isElement: (element) => element instanceof Element || element instanceof HTMLDocument, // Basic check for DOM element
    };

    // Attempt to use a provided jQuery-like object or global jQuery.
    // If not available, some functionalities that heavily rely on advanced jQuery features
    // (like complex selectors or event handling) might be limited or require native DOM fallback.
    let domProcessor = null;
    if (typeof externalJqueryReference !== "undefined") {
        domProcessor = externalJqueryReference;
    } else if (typeof jQuery !== "undefined") {
        domProcessor = jQuery;
    }

    // Fallback to custom elementQuery for basic operations if no jQuery is found.
    // This makes the elementQuery the default for internal operations.
    const useDomProcessor = (processorFn, nativeFallbackFn, ...args) => {
        if (domProcessor) {
            return processorFn(domProcessor, ...args);
        } else {
            return nativeFallbackFn(...args);
        }
    };

    const queryOne = (selector, context = document) => useDomProcessor(
        (dp, sel, ctx) => dp(sel, ctx)[0] || null,
        (sel, ctx) => elementQuery.fetchOne(sel, ctx),
        selector, context
    );

    const queryAll = (selector, context = document) => useDomProcessor(
        (dp, sel, ctx) => Array.from(dp(sel, ctx)),
        (sel, ctx) => elementQuery.fetchAll(sel, ctx),
        selector, context
    );

    const getTextContent = (element) => useDomProcessor(
        (dp, el) => dp(el).text(),
        (el) => elementQuery.extractText(el),
        element
    );

    const getElementAttribute = (element, attr) => useDomProcessor(
        (dp, el, at) => dp(el).attr(at),
        (el, at) => elementQuery.fetchAttribute(el, at),
        element, attr
    );

    const checkElementClass = (element, className) => useDomProcessor(
        (dp, el, cn) => dp(el).hasClass(cn),
        (el, cn) => elementQuery.hasCssClass(el, cn),
        element, className
    );

    const isElementVisible = (element) => useDomProcessor(
        (dp, el) => dp(el).is(':visible'),
        (el) => elementQuery.checkVisibility(el),
        element
    );

    const getElementChildren = (element) => useDomProcessor(
        (dp, el) => Array.from(dp(el).children()),
        (el) => elementQuery.getChildElements(el),
        element
    );

    const getElementValue = (element) => useDomProcessor(
        (dp, el) => dp(el).val(),
        (el) => elementQuery.getInputValue(el),
        element
    );

    // Internal constants for global data indices, making the code more readable.
    const DataIndices = {
        GLOBAL_ACTIVITY_INFO: 17,
        GLOBAL_EMAIL_ADDRESS: 10,
        GLOBAL_VIEW_DATA: 0, // Assuming VIEW_DATA is usually at index 0 or similar
        ACTIVITY_LAST_ACTIVE_DETAILS: 15,
        ACTIVITY_LOGGED_IN_USERS: 23,
        ACTIVITY_LOCALE_CANDIDATE_1_PATH: [8, 8],
        ACTIVITY_LOCALE_CANDIDATE_2_PATH: [9, 8],
        ACTIVITY_SHORTCUTS_FLAG_PATH: [5, 1],
    };

    // Internal representation of global data and settings.
    const systemCore = {
        clientVersion: "0.4",
        persistentData: typeof GLOBALS !== 'undefined' ? GLOBALS : [],
        displayData: typeof VIEW_DATA !== 'undefined' ? VIEW_DATA : [],
        identityKey: null,
        hangoutStatus: undefined,
    };

    // Initialize systemCore properties that depend on persistentData.
    systemCore.identityKey = systemCore.persistentData[DataIndices.GLOBAL_EMAIL_ADDRESS] || null;

    // Utility functions (renamed and refactored)
    const utilityFunctions = {
        // Renamed from api.tools.error
        logIssue: (message) => {
            if (typeof console !== 'undefined' && console.error) {
                console.error(message);
            } else {
                throw new Error(message);
            }
        },

        // Renamed from api.tools.parse_url
        decomposeUrl: (urlValue) => {
            const parameterRegex = /[?&]([^=#]+)=([^&#]*)/g;
            const collectedParameters = {};
            let matchResult;

            while ((matchResult = parameterRegex.exec(urlValue)) !== null) {
                collectedParameters[matchResult[1]] = matchResult[2];
            }
            return collectedParameters;
        },

        // Placeholder for internationalization (i18n)
        translate: (key) => {
            // In a real application, this would fetch localized strings.
            // For now, it just returns a mock value or the key itself.
            const translations = {
                'inbox': 'Inbox',
                'drafts': 'Drafts',
                'spam': 'Spam',
                'forums': 'Forums',
                'updates': 'Updates',
                'promotions': 'Promotions',
                'social_updates': 'Social',
            };
            return translations[key] || key;
        },

        // Helper to extract numeric count from a string like "Inbox (12)"
        extractNumericCount: (text) => {
            if (text.includes('(')) {
                const numericString = text.replace(/\D/g, '');
                return parseInt(numericString, 10);
            }
            return 0;
        },
    };

    // DOM Locators (renamed from api.dom.*)
    const uiLocators = {
        // Renamed from api.dom.inbox_content
        fetchPrimaryContentArea: () => queryOne('div[role="main"]'),

        // Renamed from api.dom.inboxes
        fetchMessageContainerElements: () => {
            const mainContent = uiLocators.fetchPrimaryContentArea();
            return mainContent ? queryAll('[data-gh="tl"]', mainContent) : [];
        },

        // Renamed from api.dom.email_subject
        fetchVisibleSubjectElement: () => {
            const subjectCandidates = queryAll('.hP');
            return subjectCandidates.find(isElementVisible) || null;
        },

        // Renamed from api.dom.email_body
        fetchMessageBodyElements: () => queryAll('.nH.hx'),

        // Renamed from api.dom.toolbar
        fetchMainActionToolbar: () => {
            let toolbarElement = queryOne('[data-gh="mtb"]');
            if (!toolbarElement) return null;

            while (getElementChildren(toolbarElement).length === 1) {
                toolbarElement = getElementChildren(toolbarElement)[0];
            }
            return toolbarElement;
        },

        // Renamed from api.dom.email_contents
        fetchActiveEmailContentBlocks: () => {
            const contentBlocks = queryAll('.ii.gt');
            return contentBlocks.filter(block => {
                const mailIdentifier = getElementAttribute(block, 'class')?.split(' ')[2];
                const isEditable = getElementAttribute(block, 'contenteditable');
                return mailIdentifier && mailIdentifier !== 'undefined' && isEditable !== 'true';
            });
        },

        // Renamed from api.dom.get_left_sidebar_links
        fetchNavigationPanelLinks: () => queryAll('div[role="navigation"] [title]'),

        // Renamed from api.dom.search_bar
        fetchSearchInputContainer: () => queryOne('[data-gh="sb"]'),
    };

    // Data Retrieval functions (renamed from api.get.*)
    const dataRetrievers = {
        // Renamed from api.get.last_active
        obtainRecentActivityInfo: () => {
            const activityData = systemCore.persistentData[DataIndices.GLOBAL_ACTIVITY_INFO]?.[DataIndices.ACTIVITY_LAST_ACTIVE_DETAILS];
            if (!activityData) return null;
            return {
                timestamp: activityData[1],
                ipAddress: activityData[3],
                macAddress: activityData[9],
                relativeTime: activityData[10],
            };
        },

        // Renamed from api.get.loggedin_accounts
        obtainAuthorizedUserCredentials: () => {
            const userList = systemCore.persistentData[DataIndices.GLOBAL_ACTIVITY_INFO]?.[DataIndices.ACTIVITY_LOGGED_IN_USERS]?.[1];
            if (!userList) return [];
            return userList.map(userData => ({
                displayName: userData[4],
                emailAddress: userData[0],
            }));
        },

        // Renamed from api.get.user_email
        obtainUserCredential: () => systemCore.persistentData[DataIndices.GLOBAL_EMAIL_ADDRESS],

        // Renamed from api.get.localization
        determineInterfaceLanguage: () => {
            const checkLanguageFormat = (localeString) => {
                if (!localeString || typeof localeString !== 'string' || localeString.length < 2) {
                    return false;
                }
                const prefix = localeString.slice(0, 2);
                return prefix.toLowerCase() === prefix;
            };

            const globalData = systemCore.persistentData;
            const localePaths = [
                globalData[DataIndices.GLOBAL_ACTIVITY_INFO]?.[DataIndices.ACTIVITY_LOCALE_CANDIDATE_1_PATH[0]]?.[DataIndices.ACTIVITY_LOCALE_CANDIDATE_1_PATH[1]],
                globalData[DataIndices.GLOBAL_ACTIVITY_INFO]?.[DataIndices.ACTIVITY_LOCALE_CANDIDATE_2_PATH[0]]?.[DataIndices.ACTIVITY_LOCALE_CANDIDATE_2_PATH[1]],
            ];

            for (const localeCandidate of localePaths) {
                if (checkLanguageFormat(localeCandidate)) {
                    return localeCandidate;
                }
            }
            return null;
        },

        // Renamed from api.get.storage_info
        retrieveAccountStorageDetails: () => {
            const storageDiv = queryOne('.md.mj > div');
            if (!storageDiv) return null;

            const usageSpan = queryOne('span:nth-child(1)', storageDiv);
            const totalSpan = queryOne('span:nth-child(2)', storageDiv);

            const usedText = getTextContent(usageSpan);
            const totalText = getTextContent(totalSpan);

            const usedValue = parseFloat(usedText.replace(/[^0-9.]/g, ''));
            const totalValue = parseFloat(totalText.replace(/[^0-9.]/g, ''));

            const percentageUsed = (usedValue / totalValue) * 100;

            return {
                spaceUsed: usedText,
                totalSpace: totalText,
                percentage: Math.floor(percentageUsed),
            };
        },

        // Renamed from api.get.email_subject
        retrieveMessageSubject: () => {
            const subjectElement = uiLocators.fetchVisibleSubjectElement();
            return getTextContent(subjectElement);
        },

        // Renamed from api.get.email_ids
        retrieveMessageIdentifiers: () => {
            if (stateVerifiers.verifyCurrentViewIsMessage()) {
                // This original function relied on an undefined api.get.email_data().
                // Assuming `systemCore.displayData` or a similar global variable holds this.
                // For a Type IV clone, we need to replicate the *functionality*.
                // If `email_data` is truly unavailable, this will return an empty array.
                // As per the original, it returns `Object.keys(data.threads)`.
                // Let's assume `systemCore.displayData.threads` is the equivalent.
                const messageData = systemCore.displayData; // Or some other source if known
                if (messageData && messageData.threads && typeof messageData.threads === 'object') {
                    return Object.keys(messageData.threads);
                }
            }
            return [];
        },

        // Renamed from api.get.compose_ids
        retrieveDraftIdentifiers: () => {
            const draftElements = queryAll('.AD [name="draft"]');
            return draftElements
                .filter(el => getElementValue(el) !== "undefined")
                .map(el => getElementValue(el));
        },

        // Renamed from api.get.email_id
        retrieveCurrentMessageIdentifier: () => {
            let messageHash = null;

            if (stateVerifiers.verifyCurrentViewIsMessage()) {
                if (stateVerifiers.verifyPreviewModeActive()) {
                    const contentBlocks = uiLocators.fetchActiveEmailContentBlocks();
                    const visibleMailIds = contentBlocks
                        .filter(block => isElementVisible(block))
                        .map(block => getElementAttribute(block, 'class')?.split(' ')[2])
                        .filter(id => id && id !== 'undefined');

                    if (visibleMailIds.length > 0) {
                        messageHash = visibleMailIds[0].substring(1); // Remove leading 'c' or similar
                    }
                } else {
                    const urlFragment = window.location.hash.split('/').pop();
                    if (urlFragment) {
                        messageHash = urlFragment.split('?')[0].replace(/#/, '');
                    }
                }
            }
            return messageHash;
        },

        // Renamed from api.get.search_query
        retrieveCurrentSearchTerm: () => {
            const searchBar = uiLocators.fetchSearchInputContainer();
            const inputElement = searchBar ? queryOne('input', searchBar) : null;
            return getElementValue(inputElement) || '';
        },

        // Generic function for unread counts
        _getUnreadCountForLabel: (labelKey) => {
            const navLinks = uiLocators.fetchNavigationPanelLinks();
            const targetTitle = utilityFunctions.translate(labelKey);
            const linkElement = navLinks.find(link => getElementAttribute(link, 'title')?.includes(targetTitle));

            if (linkElement) {
                return utilityFunctions.extractNumericCount(getTextContent(linkElement));
            }
            return 0;
        },

        // Renamed from api.get.unread_inbox_emails
        obtainUnreadInboxCount: () => dataRetrievers._getUnreadCountForLabel('inbox'),
        // Renamed from api.get.unread_draft_emails
        obtainUnreadDraftCount: () => dataRetrievers._getUnreadCountForLabel('drafts'),
        // Renamed from api.get.unread_spam_emails
        obtainUnreadSpamCount: () => dataRetrievers._getUnreadCountForLabel('spam'),
        // Renamed from api.get.unread_forum_emails
        obtainUnreadForumCount: () => dataRetrievers._getUnreadCountForLabel('forums'),
        // Renamed from api.get.unread_update_emails
        obtainUnreadUpdateCount: () => dataRetrievers._getUnreadCountForLabel('updates'),
        // Renamed from api.get.unread_promotion_emails
        obtainUnreadPromotionCount: () => dataRetrievers._getUnreadCountForLabel('promotions'),
        // Renamed from api.get.unread_social_emails
        obtainUnreadSocialCount: () => dataRetrievers._getUnreadCountForLabel('social_updates'),

        // Renamed from api.get.beta
        fetchBetaFeaturesStatus: () => ({
            newNavigationBar: queryOne('#gbz') === null,
        }),

        // Renamed from api.get.unread_emails
        obtainAllUnreadCounts: () => ({
            inbox: dataRetrievers.obtainUnreadInboxCount(),
            drafts: dataRetrievers.obtainUnreadDraftCount(),
            spam: dataRetrievers.obtainUnreadSpamCount(),
            forum: dataRetrievers.obtainUnreadForumCount(),
            update: dataRetrievers.obtainUnreadUpdateCount(),
            promotions: dataRetrievers.obtainUnreadPromotionCount(),
            social: dataRetrievers.obtainUnreadSocialCount(),
        }),
    };

    // State Verification functions (renamed from api.check.*)
    const stateVerifiers = {
        // Renamed from api.check.is_thread
        verifyMessageThreadView: () => {
            const firstCheck = getElementChildren(getElementChildren(getElementChildren(queryOne('.nH .if'))?.[1])?.[1]);
            const secondCheck = dataRetrievers.retrieveMessageIdentifiers();

            return firstCheck.length > 1 || secondCheck.length > 1;
        },

        // Renamed from api.check.is_preview_pane
        verifyPreviewModeActive: () => {
            const mainContent = uiLocators.fetchPrimaryContentArea();
            if (!mainContent) return false;
            const messageBoxes = queryAll('[data-gh="tl"]', mainContent);
            return messageBoxes.some(box => checkElementClass(box, 'aia'));
        },

        // Renamed from api.check.is_multiple_inbox
        verifyMultipleInboxLayout: () => {
            const inboxes = uiLocators.fetchMessageContainerElements();
            return inboxes.length > 1;
        },

        // Renamed from api.check.is_horizontal_split
        verifyHorizontalSplitView: () => {
            const mainContent = uiLocators.fetchPrimaryContentArea();
            if (!mainContent) return false;
            const boxElement = queryAll('[data-gh="tl"] .nn', mainContent);
            return boxElement.length === 0;
        },

        // Renamed from api.check.is_vertical_split
        verifyVerticalSplitView: () => !stateVerifiers.verifyHorizontalSplitView(),

        // Renamed from api.check.is_tabbed_inbox
        verifyTabbedInboxEnabled: () => queryAll('.aKh').length === 1,

        // Renamed from api.check.is_right_side_chat
        verifyRightSidebarChat: () => getElementAttribute(queryOne('.ApVoH'), 'aria-labelledby') === ':wf',

        // Renamed from api.check.is_google_apps_user
        verifyIsGoogleAppsUser: () => {
            const userEmail = dataRetrievers.obtainUserCredential();
            return userEmail && !userEmail.endsWith('@gmail.com');
        },

        // Renamed from api.check.is_inside_email
        verifyCurrentViewIsMessage: () => {
            // The original `api.get.current_page()` was not defined.
            // Assuming current_page implies a URL check or similar.
            // For now, if preview pane is active, it means we are inside a message.
            // Or if URL hash indicates a message.
            const isPreview = stateVerifiers.verifyPreviewModeActive();
            // A simple check for URL hash indicating a message, e.g., #inbox/123
            const isDirectMessageUrl = window.location.hash.startsWith('#inbox/') || window.location.hash.startsWith('#sent/');

            if (!isDirectMessageUrl && !isPreview) {
                return false;
            }

            const messageItems = queryAll('.ii.gt');
            const visibleMessageItems = messageItems.filter(isElementVisible);

            return visibleMessageItems.length > 0;
        },

        // Renamed from api.check.is_priority_inbox
        verifyPriorityInboxLayout: () => queryAll('.qh').length > 0,

        // Generic function for extension checks
        _checkExtensionPresence: (selector) => queryAll(selector).length > 0,

        // Renamed from api.check.is_rapportive_installed
        verifyRapportiveExtension: () => stateVerifiers._checkExtensionPresence('#rapportive-sidebar'),

        // Renamed from api.check.is_streak_installed
        verifyStreakExtension: () => stateVerifiers._checkExtensionPresence("[id^='bentoBox'],[id*=' bentoBox'],[class*=' bentoBox'],[class*='bentoBox']"),

        // Renamed from api.check.is_anydo_installed
        verifyAnyDoExtension: () => stateVerifiers._checkExtensionPresence("[id^='anydo'],[id*=' anydo'],[class*=' anydo'],[class*='anydo']"),

        // Renamed from api.check.is_boomerang_installed
        verifyBoomerangExtension: () => stateVerifiers._checkExtensionPresence("[id^='b4g_'],[id*=' b4g_'],[class*=' b4g_'],[class*='b4g_']"),

        // Renamed from api.check.is_xobni_installed
        verifyXobniExtension: () => stateVerifiers._checkExtensionPresence('#xobni_frame'),

        // Renamed from api.check.is_signal_installed
        verifySignalExtension: () => stateVerifiers._checkExtensionPresence("[id^='Signal'],[id*=' Signal'],[class*=' signal'],[class*='signal']"),

        // Renamed from api.check.are_shortcuts_enabled
        verifyKeyboardShortcutsEnabled: () => {
            const flagName = 'bx_hs';
            let flagValue = undefined;

            const shortcutsData = systemCore.persistentData[DataIndices.GLOBAL_ACTIVITY_INFO]?.[DataIndices.ACTIVITY_SHORTCUTS_FLAG_PATH[0]]?.[DataIndices.ACTIVITY_SHORTCUTS_FLAG_PATH[1]];
            if (shortcutsData) {
                const shortcutSetting = shortcutsData.find(item => item[0] === flagName);
                if (shortcutSetting) {
                    flagValue = shortcutSetting[1];
                }
            }

            const valueMap = {
                '0': true,
                '1': false,
            };

            // Default to true if flag value is not found, similar to original logic.
            return (flagValue !== undefined) ? valueMap[flagValue] : true;
        },
    };


    // The public interface object (renamed from 'api')
    const mailClientInterface = {
        meta: {
            currentVersion: systemCore.clientVersion,
        },
        data: {
            getRecentActivity: dataRetrievers.obtainRecentActivityInfo,
            getLoggedInUsers: dataRetrievers.obtainAuthorizedUserCredentials,
            getUserEmailAddress: dataRetrievers.obtainUserCredential,
            getInterfaceLanguage: dataRetrievers.determineInterfaceLanguage,
            getStorageUtilization: dataRetrievers.retrieveAccountStorageDetails,
            getMessageSubjectText: dataRetrievers.retrieveMessageSubject,
            getMessageThreadIdentifiers: dataRetrievers.retrieveMessageIdentifiers,
            getDraftMessageIdentifiers: dataRetrievers.retrieveDraftIdentifiers,
            getCurrentMessageIdentifier: dataRetrievers.retrieveCurrentMessageIdentifier,
            getCurrentSearchQuery: dataRetrievers.retrieveCurrentSearchTerm,
            getUnreadInboxMailCount: dataRetrievers.obtainUnreadInboxCount,
            getUnreadDraftMailCount: dataRetrievers.obtainUnreadDraftCount,
            getUnreadSpamMailCount: dataRetrievers.obtainUnreadSpamCount,
            getUnreadForumMailCount: dataRetrievers.obtainUnreadForumCount,
            getUnreadUpdateMailCount: dataRetrievers.obtainUnreadUpdateCount,
            getUnreadPromotionMailCount: dataRetrievers.obtainUnreadPromotionCount,
            getUnreadSocialMailCount: dataRetrievers.obtainUnreadSocialCount,
            getAllUnreadMailCounts: dataRetrievers.obtainAllUnreadCounts,
            getBetaFeatureStatus: dataRetrievers.fetchBetaFeaturesStatus,
        },
        state: {
            isMessageThreadActive: stateVerifiers.verifyMessageThreadView,
            isPreviewPaneVisible: stateVerifiers.verifyPreviewModeActive,
            isMultiInboxLayout: stateVerifiers.verifyMultipleInboxLayout,
            isHorizontalSplitLayout: stateVerifiers.verifyHorizontalSplitView,
            isVerticalSplitLayout: stateVerifiers.verifyVerticalSplitView,
            isTabbedInboxLayout: stateVerifiers.verifyTabbedInboxEnabled,
            isChatSidebarRight: stateVerifiers.verifyRightSidebarChat,
            isGoogleWorkspaceUser: stateVerifiers.verifyIsGoogleAppsUser,
            isCurrentlyViewingMessage: stateVerifiers.verifyCurrentViewIsMessage,
            isPriorityInboxLayout: stateVerifiers.verifyPriorityInboxLayout,
            isRapportiveInstalled: stateVerifiers.verifyRapportiveExtension,
            isStreakInstalled: stateVerifiers.verifyStreakExtension,
            isAnyDoInstalled: stateVerifiers.verifyAnyDoExtension,
            isBoomerangInstalled: stateVerifiers.verifyBoomerangExtension,
            isXobniInstalled: stateVerifiers.verifyXobniExtension,
            isSignalInstalled: stateVerifiers.verifySignalExtension,
            areShortcutsActive: stateVerifiers.verifyKeyboardShortcutsEnabled,
        },
        ui: {
            getInboxContentContainer: uiLocators.fetchPrimaryContentArea,
            getMessageListContainers: uiLocators.fetchMessageContainerElements,
            getSubjectElement: uiLocators.fetchVisibleSubjectElement,
            getMessageBodyElements: uiLocators.fetchMessageBodyElements,
            getMainToolbarElement: uiLocators.fetchMainActionToolbar,
            getEmailContentBlocks: uiLocators.fetchActiveEmailContentBlocks,
            getLeftSidebarNavigationLinks: uiLocators.fetchNavigationPanelLinks,
            getSearchBarElement: uiLocators.fetchSearchInputContainer,
        },
        utilities: {
            logError: utilityFunctions.logIssue,
            parseUrlParameters: utilityFunctions.decomposeUrl,
        },
        internalGlobals: systemCore, // Exposing for debugging/testing, similar to original `api.tracker.globals`
    };

    return mailClientInterface;
})(window.jQuery); // Pass global jQuery if it exists, or whatever is provided.