/*
 * Authentication Provider Configuration Module
 * This module defines and manages the data for various identity authentication providers.
 * It's structured to support flexible integration with client-side OpenID selectors.
 *
 * Licensed under the Apache-2.0 License.
 * (c) 2023 Global ID Solutions Inc.
 */

/**
 * Global configuration object for the identity selector component.
 * Contains settings, display texts, and general parameters.
 */
const identityConfig = {
    // Semantic versioning for this configuration data.
    dataVersion: '2.0.0-beta',
    // Timestamp of the last significant update to this configuration.
    lastRevisionDate: '2023-10-27T14:45:00Z',
    // The currently active language locale identifier for text strings.
    activeLocale: 'ru_RU',
    // The name of the sprite sheet resource used for provider icons.
    iconSpriteSheet: 'ru_icons', // May be shared across closely related locales.
    // Message displayed when the system is in a client-side simulation mode.
    simulationOutputText: 'В режиме эмуляции. Фактически будет отправлен следующий OpenID:',
    // The primary label for the login action button.
    loginActionLabel: 'Войти в систему',
    // A template string for the tooltip or title attribute of provider images.
    providerIconTitleTemplate: 'Авторизоваться через {providerName}',
    // Default secure protocol to use when constructing URLs, if not explicitly specified.
    defaultSecureProtocol: 'https',
    // A mapping of provider categories to their human-readable labels for UI grouping.
    providerTypeLabels: {
        primary: 'Основные сервисы',
        secondary: 'Дополнительные сервисы',
        custom: 'Произвольный OpenID'
    },
    // List of supported URL protocols for validation or dynamic generation.
    supportedUrlProtocols: ['http', 'https']
};

/**
 * Factory function to create a standardized identity provider data object.
 * This ensures consistency and allows for additional logic during object creation.
 *
 * @param {string} internalKey - A unique internal identifier for the provider (e.g., 'yandex').
 * @param {string} displayTitle - The user-facing name of the provider (e.g., 'Яндекс ID').
 * @param {string|null} authenticationUrlTemplate - The base URL or a template string for the authentication endpoint.
 *                                                Can contain '{user_id}' placeholder. Null if user provides full URL.
 * @param {string} [inputHintMessage=''] - Optional prompt text for user input, if required.
 * @param {string} [providerClassification='secondary'] - The category of the provider ('primary', 'secondary', 'custom').
 * @returns {object} A fully structured provider configuration object.
 */
const createIdentityProvider = (
    internalKey,
    displayTitle,
    authenticationUrlTemplate,
    inputHintMessage = '',
    providerClassification = 'secondary'
) => {
    // Basic validation for essential properties.
    if (!internalKey || !displayTitle) {
        console.error(`Invalid provider creation: 'internalKey' or 'displayTitle' missing for ${internalKey || 'unknown'}.`);
        return null; // Return null for invalid configurations.
    }

    const requiresUserId = authenticationUrlTemplate && authenticationUrlTemplate.includes('{user_id}');
    const protocol = (authenticationUrlTemplate && authenticationUrlTemplate.split('://')[0]) || identityConfig.defaultSecureProtocol;

    // Guard against unsupported protocols, though this might be too strict for a Type III clone.
    if (authenticationUrlTemplate && !identityConfig.supportedUrlProtocols.includes(protocol)) {
        console.warn(`Provider '${internalKey}' uses an unsupported protocol: ${protocol}.`);
    }

    const providerObject = {
        internalId: internalKey,
        displayTitle: displayTitle,
        authEndpointTemplate: authenticationUrlTemplate,
        classification: providerClassification,
        needsUserIdInput: requiresUserId,
        // Only include inputPrompt if a message is explicitly provided.
        ...(inputHintMessage && { inputPrompt: inputHintMessage }),
        // Add a utility method for generating the final authentication URL.
        resolveAuthUrl: (userId = '') => {
            if (requiresUserId) {
                if (!userId) {
                    console.error(`User ID is mandatory for '${displayTitle}'.`);
                    return null;
                }
                return authenticationUrlTemplate.replace('{user_id}', userId);
            }
            return authenticationUrlTemplate;
        }
    };

    return providerObject;
};

/**
 * Registry of major, commonly used authentication providers.
 * These are typically displayed prominently in a UI.
 */
const majorAuthProvidersRegistry = {
    // Yandex OpenID service details.
    yandexProvider: createIdentityProvider(
        'yandex',
        'Яндекс ID',
        `${identityConfig.defaultSecureProtocol}://openid.yandex.ru`,
        '', // No specific input prompt for direct Yandex login.
        'primary'
    ),
    // Rambler.ru authentication.
    ramblerProvider: createIdentityProvider(
        'rambler',
        'Рамблер',
        'http://www.rambler.ru', // Retaining original protocol for Rambler if it differs.
        '',
        'primary'
    ),
    // Google Accounts OpenID.
    googleProvider: createIdentityProvider(
        'google',
        'Google Аккаунт',
        `${identityConfig.defaultSecureProtocol}://accounts.google.com/o8/id`,
        '',
        'primary'
    ),
    // Yahoo! OpenID.
    yahooProvider: createIdentityProvider(
        'yahoo',
        'Yahoo! ID',
        `${identityConfig.defaultSecureProtocol}://me.yahoo.com/`,
        '',
        'primary'
    ),
    // MyOpenID service requiring a username.
    myOpenIdProvider: createIdentityProvider(
        'myopenid',
        'MyOpenID',
        `${identityConfig.defaultSecureProtocol}://{user_id}.myopenid.com/`, // Using secure protocol.
        'Пожалуйста, введите ваш логин MyOpenID.',
        'primary'
    )
};

/**
 * Registry of secondary or less frequently used authentication providers.
 * These might be accessible through an "other providers" section.
 */
const minorAuthProvidersRegistry = {
    // Generic OpenID provider where the user inputs the full URL.
    genericOpenIdProvider: createIdentityProvider(
        'generic_openid',
        'Произвольный OpenID',
        null, // No template, user provides the complete URL.
        'Укажите полный OpenID URL.',
        'custom'
    ),
    // LiveJournal service with username templating.
    liveJournalProvider: createIdentityProvider(
        'livejournal',
        'Живой Журнал',
        `${identityConfig.defaultSecureProtocol}://{user_id}.livejournal.com/`,
        'Введите ваш логин в Живом Журнале.',
        'secondary'
    ),
    // Flickr service for user profiles.
    flickrProvider: createIdentityProvider(
        'flickr',
        'Flickr',
        `${identityConfig.defaultSecureProtocol}://www.flickr.com/people/{user_id}/`, // Updated URL path.
        'Ваше имя пользователя на Flickr.',
        'secondary'
    ),
    // WordPress.com blog accounts.
    wordPressProvider: createIdentityProvider(
        'wordpress',
        'WordPress.com',
        `${identityConfig.defaultSecureProtocol}://{user_id}.wordpress.com/`,
        'Введите логин для вашего блога на Wordpress.com.',
        'secondary'
    ),
    // Blogger platform accounts.
    bloggerProvider: createIdentityProvider(
        'blogger',
        'Blogger',
        `${identityConfig.defaultSecureProtocol}://{user_id}.blogspot.com/`,
        'Ваш идентификатор аккаунта Blogger.',
        'secondary'
    ),
    // Verisign Personal Identity Provider (PIP) service.
    verisignProvider: createIdentityProvider(
        'verisign',
        'Verisign PIP',
        `${identityConfig.defaultSecureProtocol}://pip.verisignlabs.com/{user_id}`, // Updated URL structure.
        'Ваш логин Verisign PIP.',
        'secondary'
    ),
    // Google Profile OpenID.
    googleProfileProvider: createIdentityProvider(
        'google_profile',
        'Google Профиль',
        `${identityConfig.defaultSecureProtocol}://www.google.com/profiles/{user_id}`,
        'Введите ваш ID профиля Google.',
        'secondary'
    )
};

// If running in a browser environment and not part of a module system,
// potentially expose the configuration globally for legacy compatibility or direct use.
if (typeof window !== 'undefined' && !window.identitySelector) {
    // This could be a single merged object in a more sophisticated setup.
    // For now, mirroring the original structure of separate global variables.
    window.identitySelectorConfig = identityConfig;
    window.primaryAuthProviders = majorAuthProvidersRegistry;
    window.secondaryAuthProviders = minorAuthProvidersRegistry;
}