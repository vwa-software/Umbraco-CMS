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
    .factory("amzpriceservice", ['$http', '$q', function ($http, $q) {

        var _data = null;

        function loadFromService(deferred, type) {

            $http.get('backoffice/Amazilia/PriceGroup/GetPriceGroups/', {
                cache: false
            }).then(function (response) {
                if (response.data.Ok) {
                    _data = {
                        "priceGroups": response.data.Data.priceGroups,
                        "taxCategories": response.data.Data.taxCategories
                    };
                    deferred.resolve(_data[type]);
                }
                else {
                    deferred.reject(response.data.Message);
                }
            }, function (error) {
                deferred.reject(error);
            });
        }

        var service = {
            /*
                Returns all the pricegroups 
            */
            getPriceGroups: function () {
                var deferred = $q.defer();

                if (_data) {
                    deferred.resolve(_data.priceGroups);
                    return deferred.promise;
                }

                loadFromService(deferred, "priceGroups");

                return deferred.promise;
            },
            /*
                 Returns all the taxcategories
            */
            getTaxCategories: function () {
                var deferred = $q.defer();

                if (_data) {
                    deferred.resolve(_data.taxCategories);
                    return deferred.promise;
                }

                loadFromService(deferred, "taxCategories");

                return deferred.promise;
                
            },

            /*
                Gets the pricegroup by id
            */
            getPriceGroupById: function (id) {

                var deferred = $q.defer();

                $http.get('backoffice/Amazilia/PriceGroup/GetPriceGroupById/' + id, {
                    cache: false
                }).then(function (response) {
                    if (response.data.Ok) {
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

            savePriceGroup: function (data) {
                var deferred = $q.defer();

                // reload next time
                this.setDirty();

                $http.post('backoffice/Amazilia/PriceGroup/SavePriceGroup/', data).then(function (res) {
                    // returns Amazilia.Backoffice.Models.JsonResultOfType<PriceGroup>
                    if (!res.data.Ok) {
                        deferred.reject(res.data.Message);
                        return;
                    }
                    deffered.resolve(res);
                },
                function (response) {
                    deferred.reject(response.data.Message);
                });

                return deferred.promise;
            },

            setDirty: function () {
                _data = null;
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



function contentResource($q, $http, umbDataFormatter, umbRequestHelper) {

    return {


        /**
          * @ngdoc method
          * @name umbraco.resources.amaziliaContentResource#getChildren
          * @methodOf umbraco.resources.amaziliaContentResource
          *
          * @description
          * Gets children with this category 
          *
          * ##usage
          * <pre>
          * contentResource.getChildren(1234, {pageSize: 10, pageNumber: 2})
          *    .then(function(contentArray) {
          *        var children = contentArray; 
          *        alert('they are here!');
          *    });
          * </pre> 
          * 
          * @param {Int} parentId id of content item to return children of
          * @param {Object} options optional options object
          * @param {Int} options.pageSize if paging data, number of nodes per page, default = 0
          * @param {Int} options.pageNumber if paging data, current page index, default = 0
          * @param {String} options.filter if provided, query will only return those with names matching the filter
          * @param {String} options.orderDirection can be `Ascending` or `Descending` - Default: `Ascending`
          * @param {String} options.orderBy property to order items by, default: `SortOrder`
          * @returns {Promise} resourcePromise object containing an array of content items.
          *
          */
        getChildren: function (parentId, options) {

            var defaults = {
                includeProperties: [],
                pageSize: 0,
                pageNumber: 0,
                filter: '',
                orderDirection: "Ascending",
                orderBy: "SortOrder",
                orderBySystemField: true
            };
            if (options === undefined) {
                options = {};
            }
            //overwrite the defaults if there are any specified
            angular.extend(defaults, options);
            //now copy back to the options we will use
            options = defaults;
            //change asc/desct
            if (options.orderDirection === "asc") {
                options.orderDirection = "Ascending";
            }
            else if (options.orderDirection === "desc") {
                options.orderDirection = "Descending";
            }

            //converts the value to a js bool
            function toBool(v) {
                if (angular.isNumber(v)) {
                    return v > 0;
                }
                if (angular.isString(v)) {
                    return v === "true";
                }
                if (typeof v === "boolean") {
                    return v;
                }
                return false;
            }



            return umbRequestHelper.resourcePromise(
                $http.post('backoffice/Amazilia/Content/GetChildren/', {
                    id: parseInt(parentId),
                    includeProperties: _.pluck(options.includeProperties, 'alias').join(","),
                    pageNumber: options.pageNumber,
                    pageSize: options.pageSize,
                    orderBy: options.orderBy,
                    orderDirection: options.orderDirection,
                    orderBySystemField: toBool(options.orderBySystemField),
                    filter: options.filter
                }),
                'Failed to retrieve children for content item ' + parentId);
        },

    /**
      * @ngdoc method
      * @name umbraco.resources.amaziliaContentResource#getFilterNodes
      * @methodOf umbraco.resources.amaziliaContentResource
      *
      * @description
      * Gets the categories of a content item with a given id
      *
      * ##usage
      * <pre>
      * contentResource.getFilterNodes(1234, 'documentTypeAlias').
      *    .then(function(contentArray) {
      *        var children = contentArray;
      *        alert('they are here!');
      *    });
      * </pre>
      *
      * @param {Int} Id id of content item to return children of
      * @param {String} contentTypeAlias the property type alias
      * @returns {Promise} resourcePromise object containing an array of content items.
      */
        getFilterNodes: function (Id, contentTypeAlias) {

            return umbRequestHelper.resourcePromise(
                $http.post('backoffice/Amazilia/Content/GetFilterNodes/', {
                    id: parseInt(Id),
                    contentTypeAlias: contentTypeAlias                    
                }),
                'Failed to retrieve filternodes for content item ' + Id);
        },

        sort: function (options) {
            
            return umbRequestHelper.resourcePromise(
                $http.post('backoffice/Amazilia/Content/Sort/', options),
                'Failed to retrieve filternodes for content item');

        }
    };
}


angular.module('umbraco.resources').factory('amaziliaContentResource', contentResource);

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
