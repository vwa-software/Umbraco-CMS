/*
 * Amazilia.PriceEditorController, used in the PriceEditor property editor 
 */
angular.module("umbraco")
    .controller("Amazilia.PriceEditorController",
    ['$scope', '$http',
        function ($scope, $http) {
            $scope.model.isLoading = true;
            $scope.model.priceGroups = [];

            $http.get('backoffice/Amazilia/PriceGroup/GetPriceGroups/' + $scope.id, {
                cache: false
            }).then(function (response) {
                var val;
                $scope.model.isLoading = false;
                if (response.data.Ok) {

                    if ($scope.model.value === undefined || $scope.model.value === null) {
                        $scope.model.value = {
                            taxCategoryId: 0, priceGroups: {}
                        };
                    }

                    if (typeof($scope.model.value) === 'string') {                 
                        try {
                            $scope.model.value = angular.fromJson($scope.model.value);
                        } catch (e) {
                            $scope.model.value = {
                                taxCategoryId: 0, priceGroups: {}
                            };
                        }                        
                    }
                    $scope.model.value.priceGroups = $scope.model.value.priceGroups || {};

                    $scope.model.priceGroups = response.data.Data.priceGroups;
                    $scope.model.taxCategories = response.data.Data.taxCategories;

                    for (var i in $scope.model.priceGroups) {
                        val = $scope.model.value.priceGroups[$scope.model.priceGroups[i].Id];

                        if (val == null) {
                            val = { Price: 0, InclTax: false, TierPrices: [] };
                            $scope.model.value.priceGroups[$scope.model.priceGroups[i].Id] = val;
                        }
                    }
                }
                else {
                    notificationsService.error("Error loading store", response.data.Message);
                }
            }, function (error) {
                notificationsService.error("Error loading store", error);
            });

            $scope.addTierPrice = function (pricegroupId) {

                var price = $scope.model.value.priceGroups[pricegroupId];
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
                var price = $scope.model.value.priceGroups[pricegroupId];
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

            $scope.validateMandatory = function (el, a) {

                //set isValid too true so that if this property isnt marked as mandatory on the document type the property is allways valid
                var isValid = true;


                return {
                    isValid: isValid,
                    errorMsg: "Value cannot be empty",
                    errorKey: "amz_mandatory"
                };


            }

            $scope.$on("formSubmitting", function (ev, args) {
                // todo validation?
                console.log($scope.model.value);
            });
        }
    ]);


/*
* Amazilia.ProductInfoEditorController, used in the PriceEditor property editor 
*/
angular.module("umbraco")
    .controller("Amazilia.ProductInfoEditorController",
    ['$scope',
        function ($scope) {
            $scope.model.isLoading = true;

            if ($scope.model.value == undefined || $scope.model.value == null) {
                $scope.model.value = {
                    isShipEnabled: true,
                    productTypeId: 5
                };
            }

            if (typeof ($scope.model.value) == 'string') {
                try {
                    $scope.model.value = angular.fromJson($scope.model.value);
                } catch (e) {
                    $scope.model.value = {
                        isShipEnabled: true,
                        productTypeId: 5
                    };
                }
            }
            $scope.model.isLoading = false;

            $scope.toggle = function (property) {
                $scope.model.value[property] = !$scope.model.value[property];
            };

            $scope.validateMandatory = function (el, a) {
                //set isValid too true so that if this property isnt marked as mandatory on the document type the property is allways valid
                var isValid = true;

                return {
                    isValid: isValid,
                    errorMsg: "Value cannot be empty",
                    errorKey: "amz_mandatory"
                };
            }

            $scope.$on("formSubmitting", function (ev, args) {
                // todo validation?
                console.log($scope.model.value);
            });
        }
        ]);


/*
* Amazilia.ProductInfoEditorController, used in the PriceEditor property editor
*/
angular.module("umbraco")
    .controller("Amazilia.ProductInventoryEditorController",
        ['$scope', '$http', 
            function ($scope, $http) {

                $scope.model.isLoading = true;
                $scope.model.warehouses = [];

                $http.get('backoffice/Amazilia/ShippingMethod/GetWarehouse/', {
                    cache: false
                }).then(function (response) {
                   
                    $scope.model.isLoading = false;
                    if (response.data.Ok) {

                        $scope.model.warehouses = response.data.Data;

                        //setup the default value
                        var defaultValue = { manageInventory: false, stockQuantity: {}, minStockQuantity : 0 };
                        for (let i in $scope.model.warehouses) {
                            defaultValue.stockQuantity[$scope.model.warehouses[i].Id] = { reserved: 0, quantity: 0, planned: 0 };
                        }

                        //map the default value
                        $scope.model.value = Amazilia.extend($scope.model.value, defaultValue);

                        
                        for (let i in $scope.model.warehouses) {

                            let val = $scope.model.value.stockQuantity[$scope.model.warehouses[i].Id];

                            if (val === null || val === undefined || typeof val === "number") {                                
                                $scope.model.value.stockQuantity[$scope.model.warehouses[i].Id] = { reserved: 0, quantity: 0, planned:0 };
                            }
                        }
                    }
                    else {
                        notificationsService.error("Error loading warehouses", response.data.Message);
                    }
                }, function (error) {
                    notificationsService.error("Error loading warehouses", error);
                    });

                $scope.toggle = function ( property) {
                    $scope.model.value[property] = !$scope.model.value[property];
                };

            }
        ]);

angular.module("umbraco").controller("Amazilia.CheckoutStepEditor",
    function ($scope, $http) {

        $scope.model.isLoading = true;
        $scope.model.items = [];

        $http.get('backoffice/Amazilia/PropertyEditor/GetCheckoutSteps', {
            cache: true
        }).then(function (response) {
                $scope.model.isLoading = false;


            if (response.data.Ok) {
                $scope.model.items = response.data.Data;
            }
        });
   });
