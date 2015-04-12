var news = angular.module('news', ['components','ngResource','ngRoute','ngSanitize','firebase','ui.bootstrap'])
    
.config(function($sceProvider) {
    // Completely disable SCE.  For demonstration purposes only!
    // Do not use in new projects.
    $sceProvider.enabled(false);
});