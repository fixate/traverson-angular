/* global angular */

(function() {
  'use strict';

  var app =
    angular.module('traverson-angular-example',
    ['traverson', 'ngSanitize']);

  var rootUri = '/';

  app.controller('generalSetup', function($scope) {
    $scope.code =
      'var rootUri = \'' + rootUri + '\';<br>' +
      'var jsonApi = traverson.<i>json</i>.from(rootUri);<br>' +
      'var jsonHalApi = traverson.<i>jsonHal</i>.from(rootUri);<br>';
  });

  app.service('apiService', function(traverson) {

    var jsonApi = traverson.json.from(rootUri);
    var jsonHalApi = traverson.jsonHal.from(rootUri);

    this.plainVanilla = function() {
      return jsonApi.newRequest()
      .withRequestOptions({ headers: { 'accept': 'application/json' } })
      .follow('second', 'doc')
      .getResource();
    };

    this.jsonPath = function() {
      return jsonApi
      .newRequest()
      .withRequestOptions({ headers: { 'accept': 'application/json' } })
      .follow('$.jsonpath.nested.key')
      .getResource();
    };

    this.uriTemplate = function() {
      return jsonApi
      .newRequest()
      .withRequestOptions({ headers: { 'accept': 'application/json' } })
      .follow('uri_template')
      .withTemplateParameters({ param: 'foobar', id: 13 })
      .getResource();
    };

    this.jsonHal = function() {
      return jsonHalApi
      .newRequest()
      .withRequestOptions({ headers: { 'accept': 'application/hal+json' } })
      .follow('first', 'second', 'inside_second')
      .getResource();
    };
  });

  app.controller('plainVanillaController', function($scope, apiService) {

    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.plainVanilla().then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'jsonApi.newRequest()<br>' +
      '.withRequestOptions({<br>' +
      '  headers: { \'accept\': \'application/json\' }<br>' +
      '})<br>' +
      '.follow(\'second\', \'doc\')<br>' +
      '.getResource()<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('jsonPathController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.jsonPath().then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'jsonApi.newRequest()<br>' +
      '.withRequestOptions({<br>' +
      '  headers: { \'accept\': \'application/json\' }<br>' +
      '})<br>' +
      '.follow(\'$.jsonpath.nested.key\')<br>' +
      '.getResource()<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('uriTemplateController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.uriTemplate().then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'jsonApi.newRequest()<br>' +
      '.withRequestOptions({<br>' +
      '  headers: { \'accept\': \'application/json\' }<br>' +
      '})<br>' +
      '.follow(\'uri_template\')<br>' +
      '.withTemplateParameters({param: \'foobar\', id: 13})<br>' +
      '.getResource()<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});';
  });

  app.controller('jsonHalController', function($scope, apiService) {
    $scope.start = function() {
      $scope.response = '... talking to server, please stand by ...';
      apiService.jsonHal().then(function(resource) {
         $scope.response = JSON.stringify(resource, null, 2);
      }, function(err) {
         $scope.response = err.message || JSON.stringify(err);
      });
    };

    $scope.code =
      'jsonHalApi.newRequest()<br>' +
      '.withRequestOptions({<br>' +
      '  headers: { \'accept\': \'application/hal+json\' }<br>' +
      '})<br>' +
      '.follow(\'first\', \'second\', \'inside_second\')<br>' +
      '.getResource()<br>' +
      '.then(function(resource) {<br>' +
      '  // do something with the resource...<br>' +
      '});<br>';
  });
})();
