'use strict';
angular.module("umbraco")
    .factory("amzstoreservice", ['$http', '$q', function ($http, $q) {

        var _stores = {};
        var _allStoresLoaded = false;

        var service = {
            getStoreById: function (id) {
                var deferred = $q.defer();

                var store = _stores[id];

                if (store) {
                    deferred.resolve(store);
                    return deferred.promise;
                }

                $http.get('backoffice/Amazilia/Store/GetStoreById/' + id, {
                    cache: false
                }).then(function (response) {
                    if (response.data.Ok) {
                        _stores[response.data.Data.Id] = response.data.Data;
                        deferred.resolve(response.data.Data);
                    }
                    else {
                        deferred.reject(response.data.Message);
                    }
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            },

            saveStore: function (store) {

                var deferred = $q.defer();

                _stores[store.Id] = store;

                $http.post('backoffice/Amazilia/Store/SaveStore/', store).then(function (res) {
                    if (!res.data.Ok) {
                        deferred.reject(res.data.Message);
                        return;
                    }
                    deferred.resolve(res.data);

                }, function (err) {
                    deferred.reject(err);
                });

                return deferred.promise;
            },

            getAllStores: function () {
                var deferred = $q.defer();

                if (_allStoresLoaded) {
                    deferred.resolve(_stores);
                }

                $http.get('backoffice/Amazilia/Store/GetAllStores', {
                    cache: false
                }).then(function (response) {
                    if (response.data.Ok) {
                        _stores = response.data.Data;
                        _allStoresLoaded = true;
                        deferred.resolve(response.data.Data);
                    }
                    else {
                        deferred.reject(response.data.Message);
                    }
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };

        return service;

    }]);



angular.module("umbraco")
    .factory("amzlocalizationservice", ['$http', '$q', function ($http, $q) {
        var service = {

            getDateFormatString: function () {
                var deferred = $q.defer();
                deferred.resolve('YYYY-MM-DD');
                return deferred.promise;
            },

            getDateTimeFormatString: function () {

                var deferred = $q.defer();
                deferred.resolve('YYYY-MM-DD hh-dd');
                return deferred.promise;
            }

        };

        return service;
    }]);


var Amazilia = function () {

    return {
        /*
         * Method extens the object to the destination
         * Missing properties, and properties with diferent types are copied
         * Equal properties are ignored
         **/
        extend: function (dst, obj) {

            if (!angular.isObject(obj) && !angular.isFunction(obj)) {
                dst = obj;
                return dst;
            }

            var keys = Object.keys(obj);

            for (var j = 0, jj = keys.length; j < jj; j++) {

                var key = keys[j];
                var src = obj[key];

                var doCopy = false;

                if (typeof dst[key] === "undefined") {
                    doCopy = true;
                }

                if (!doCopy) {
                    if (typeof dst[key] !== typeof src) {
                        doCopy = true;
                    } else if (angular.isObject(src)) {
                        this.extend(dst[key], src);
                    }                    
                }

                if (doCopy) {
                    if (angular.isObject(src)) {
                        if (angular.isDate(src)) {
                            dst[key] = new Date(src.valueOf());
                        } else if (src.nodeName) {
                            dst[key] = src.cloneNode(true);
                        } else if (angular.isElement(src)) {
                            dst[key] = src.clone();
                        } else {
                            if (!angular.isObject(dst[key])) dst[key] = angular.isArray(src) ? [] : {};
                            this.extend(dst[key], src);
                        }
                    } else {
                        dst[key] = src;
                    }
                }               
            }

            return dst;
        }
    };

}();
