/* global angular */
'use strict';

angular.module('storm.filters')

.filter('nl2br', function ($sce) {
    return function (text) {
        return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
    };
});