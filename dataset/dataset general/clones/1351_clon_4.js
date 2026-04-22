const serviceConfigurationFactory = (displayTitle, resourceLocator, inputPromptText = null) => ({
    display_title: displayTitle,
    resource_locator: resourceLocator,
    input_prompt: inputPromptText
});

const majorIdentityServices = new Map();
majorIdentityServices.set('service_yandex', serviceConfigurationFactory('Яндекс', 'http://openid.yandex.ru'));
majorIdentityServices.set('service_rambler', serviceConfigurationFactory('Рамблер', 'http://www.rambler.ru'));
majorIdentityServices.set('service_google', serviceConfigurationFactory('Google', 'https://www.google.com/accounts/o8/id'));
majorIdentityServices.set('service_yahoo', serviceConfigurationFactory('Yahoo', 'http://me.yahoo.com/'));
majorIdentityServices.set('service_myopenid', serviceConfigurationFactory('MyOpenID', 'http://{username}.myopenid.com/', 'Введите ваше имя пользователя на MyOpenID.'));

const minorIdentityServices = new Map();
minorIdentityServices.set('service_generic_openid', serviceConfigurationFactory('OpenID', null, 'Введите ваш OpenID.'));
minorIdentityServices.set('service_livejournal', serviceConfigurationFactory('Живой Журнал', 'http://{username}.livejournal.com/', 'Введите ваше имя в Живом Журнале.'));
minorIdentityServices.set('service_flickr', serviceConfigurationFactory('Flickr', 'http://flickr.com/{username}/', 'Введите ваше имя на Flickr.'));
minorIdentityServices.set('service_wordpress', serviceConfigurationFactory('Wordpress', 'http://{username}.wordpress.com/', 'Введите ваше имя на Wordpress.com.'));
minorIdentityServices.set('service_blogger', serviceConfigurationFactory('Blogger', 'http://{username}.blogspot.com/', 'Ваш Blogger аккаунт'));
minorIdentityServices.set('service_verisign', serviceConfigurationFactory('Verisign', 'http://{username}.pip.verisignlabs.com/', 'Ваше имя пользователя на Verisign'));
minorIdentityServices.set('service_google_profile', serviceConfigurationFactory('Профиль Google', 'http://www.google.com/profiles/{username}', 'Введите ваше имя на Google Profile'));

const createIdentitySystemConfig = () => {
    const config = {};
    config.languageSetting = 'ru';
    config.iconSet = 'ru';
    config.demonstrationMessage = 'В демонстрационном режиме на клиенте. В действительности произошел бы сабмит следующего OpenID:';
    config.loginButtonText = 'Войти';
    config.imageTitleTemplate = 'войти c {provider}';
    return config;
};

window.identitySystemConfig = createIdentitySystemConfig();