/*global angular: true*/
'use strict';
var angular = require('angular');

function getI18NPath() {
  if (localStorage && localStorage.getItem) {
    var i18n = JSON.parse(localStorage.getItem('VOLUSION_I18N')) || {};
    i18n.region = i18n.region || 'us';
    i18n.lang = localStorage.getItem('NG_TRANSLATE_LANG_KEY') || i18n.lang || 'en';
    i18n.country = i18n.country || 'us';
    localStorage.setItem('VOLUSION_I18N', JSON.stringify(i18n));
    return i18n.region + '/' + i18n.lang + '-' + i18n.country;
  }
  return '/us/en-us';
}

angular.module('volusionApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'seo',
    'pascalprecht.translate',
    require('./services/config').name
  ])
  .provider('api', require('./services/api-provider'));

angular.module('volusionApp')
  .config(function(
    $stateProvider,
    $urlRouterProvider,
    $locationProvider,
    $translateProvider,
    $translatePartialLoaderProvider,
    apiProvider,
    config) {

    $locationProvider.html5Mode(true);
    apiProvider.setBaseRoute(config.API_URL);
    $urlRouterProvider.otherwise(getI18NPath);

    var i18NPrefix = '/:region/:language-:country';
    $stateProvider
      .state('home', {
        url: i18NPrefix,
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        resolve: {
          translations: ['requireTranslations', function(requireTranslations) {
            return requireTranslations('home');
          }]
        }
      })
      .state('style-guide', {
        url: i18NPrefix + '/style-guide',
        templateUrl: 'views/style-guide.html',
        controller: 'StyleGuideCtrl',
        resolve: {
          translations: ['requireTranslations', function(requireTranslations) {
            return requireTranslations('style-guide');
          }]
        }
      });

    // i18n
    $translatePartialLoaderProvider.addPart('index');
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '/translations/{part}/{lang}.json'
    });
    $translateProvider.useMessageFormatInterpolation();
    $translateProvider.useMissingTranslationHandlerLog();
    $translateProvider.preferredLanguage('en');
    $translateProvider.useLocalStorage();
  })
  .run(function($templateCache) {
    $templateCache.put('views/home.html', require('./views/home.html'));
    $templateCache.put('views/style-guide.html', require('./views/style-guide.html'));
  })
  .factory('storage', require('./services/storage'))
  .factory('requireTranslations', require('./services/require-translations'))
  .controller('HomeCtrl', require('./controllers/home'))
  .controller('StyleGuideCtrl', require('./controllers/style-guide'));
