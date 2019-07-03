'use strict';

angular.module("umbraco.directives")
    .directive("amzGridview",
        function ($http, notificationsService) {

            return {
                restrict: 'E',
                templateUrl: '/App_Plugins/Amazilia/Backoffice/Amazilia/Directives/amz-gridview.html',
                controller: amzGridViewController,
                scope: { endpointurl: '@', entityname: '@', loading: '=', actionsuffix: '@' }
            };

            function amzGridViewController($scope) {

                $scope.loading = false;
                $scope.Data = {
                    Entities: {}
                };
                $scope.Data.ShowAlias = false;

                var _actionsuffix = $scope.actionsuffix || '';

                $http.get($scope.endpointurl + "/get" + _actionsuffix, {
                    cache: false
                }).then(function (response) {
                    if (response.data.Ok) {
                        $scope.Data.Entities = response.data.Data;
                        for (let i in $scope.Data.Entities) {
                            if ($scope.Data.Entities[i].Alias) {
                                $scope.Data.ShowAlias = true;
                                break;
                            }
                        }

                        $scope.loading = false;
                    }
                    else {
                        notificationsService.error("Error loading tax category", response.data.Message);
                    }
                }, function (error) {
                    notificationsService.error("Error loading tax category", error);
                });

                $scope.Save = function (entity) {
                    $http.post($scope.endpointurl + "/save" + _actionsuffix, entity).then(function (res) {

                        if (!res.data.Ok) {
                            notificationsService.error("Error saving " + $scope.entityname, res.data.Message);
                            return;
                        }
                        // refresh
                        $scope.Data.Entities = res.data.Data;


                        // display save result message if any
                        if (res.data.Message) {
                            notificationsService.success(res.data.Message);
                        } else {
                            notificationsService.success("Save successfull");
                        }


                    }, function (err) {
                        notificationsService.error("Error saving " + $scope.entityname, err);
                    });
                };

                $scope.Delete = function (entity) {

                    $http.post($scope.endpointurl + "/delete" + _actionsuffix + "/" + entity.Id, entity.Id).then(function (res) {
                        if (!res.data.Ok) {
                            notificationsService.error("Error saving " + $scope.entityname, res.data.Message);
                            return;
                        }
                        // refresh
                        $scope.Data.Entities = res.data.Data;

                        // display save result message if any
                        if (res.data.Message) {
                            notificationsService.success(res.data.Message);
                        } else {
                            notificationsService.success("Delete successfull");
                        }

                    }, function (err) {
                        notificationsService.error("Error deleting " + $scope.entityName, err);
                    });
                };

                $scope.togglePrompt = function (entity) {
                    entity.deletePrompt = true;
                };

                $scope.hidePrompt = function (entity) {
                    entity.deletePrompt = false;
                };

                $scope.Add = function () {
                    $scope.Data.Entities.push({ Name: '', DisplayOrder: 0, Id: 0, edit: true });
                };

            }
        }
    );




angular.module("umbraco.directives")
    .directive("amzPriceeditor",
        function (amzpriceservice) {

            return {
                restrict: 'E',
                templateUrl: '/App_Plugins/Amazilia/Backoffice/Amazilia/Directives/amz-priceeditor.html',
                controller: amzPriceEditorController,
                scope: { priceInfo: '=', useTierprice: '@', loading: '=' }
            };

            function amzPriceEditorController($scope) {
                amzpriceservice.getPriceGroups().then(function (priceGroups) {

                    $scope.priceGroups = priceGroups;
                    if (!$scope.priceInfo) {
                        return;
                    }

                    $scope.priceInfo = Amazilia.extend($scope.priceInfo, { "priceGroups" : {} } );

                    $scope.priceInfo.priceGroups = $scope.priceInfo.priceGroups || {};

                    for (var i in priceGroups) {
                       let val = $scope.priceInfo.priceGroups[priceGroups[i].Id];

                        if (!val) {
                            val = { Price: 0, InclTax: false, TierPrices: [] };
                            $scope.priceInfo.priceGroups[priceGroups[i].Id] = val;
                        }
                    }

                }, function (error) {
                    throw error;
                });

                $scope.addTierPrice = function (pricegroupId) {

                    var price = $scope.priceInfo.priceGroups[pricegroupId];
                    if (!price.TierPrices) {
                        price.TierPrices = [];
                    }

                    var id = 0;
                    // new id
                    for (var a in price.TierPrices) {
                        if (price.TierPrices[a].Id > id) {
                            id = price.TierPrices[a].Id + 1;
                        }
                    }
                    price.TierPrices.push({ Price: 0, DTStart: '', DTEnd: '', Quantity: 0, Id: id, PriceGroupId: pricegroupId });

                };
                $scope.deleteTierPrice = function (pricegroupId, index) {
                    var price = $scope.priceInfo.priceGroups[pricegroupId];
                    price.TierPrices.splice(index, 1);
                };

                $scope.dateConfig = {
                    pickDate: true,
                    pickTime: true,
                    useSeconds: false,
                    format: "YYYY-MM-DD HH:mm",
                    defaultDate: '2018-04-23',
                    icons: {
                        time: "icon-time",
                        date: "icon-calendar",
                        up: "icon-chevron-up",
                        down: "icon-chevron-down"
                    }
                };

                $scope.datePickerChange = datePickerChange;
                $scope.datePickerError = datePickerError;

                var dateConfigs = [];

                $scope.getDateConfig = function (tierPrice, prop) {

                    if (!dateConfigs[tierPrice.PriceGroupId + '_' + tierPrice.Id]) {
                        dateConfigs[tierPrice.PriceGroupId + '_' + tierPrice.Id] = {
                            pickDate: true,
                            pickTime: true,
                            useSeconds: false,
                            format: "YYYY-MM-DD HH:mm",
                            defaultDate: tierPrice[prop],
                            icons: {
                                time: "icon-time",
                                date: "icon-calendar",
                                up: "icon-chevron-up",
                                down: "icon-chevron-down"
                            }
                        };
                    }

                    return dateConfigs[tierPrice.PriceGroupId + '_' + tierPrice.Id];
                };

                $scope.deleteDate = function (event, tierPrice, prop) {
                    tierPrice[prop] = null;
                    event.stopPropagation();
                    return false;
                };

                function datePickerChange(event, tierPrice, type) {
                    // handle change
                    if (event.date && event.date.isValid()) {
                        tierPrice[type] = event.date.format($scope.dateConfig.format);
                    }
                };

                function datePickerError(event, index, pricegroupId) {
                    // handle error
                };

            }

        });
