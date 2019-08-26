'use strict';

angular.module("umbraco")
    .controller("Amazilia.RootController",
        ['$scope', '$http', 'appState', '$location', 'navigationService', '$timeout', 'treeService',
            function ($scope, $http, appState, $location, navigationService, $timeout, treeService) {

                $scope.navigateUp = navigateUp;
                $scope.syncTree = syncTree;
                $scope.menu = { currentNode: null };

                function navigateUp() {
                    var activeNode = appState.getTreeState("selectedNode");
                    $location.path('/' + activeNode.routePath);
                    return false;
                }

                function syncTree(path) {
                    navigationService.syncTree({
                        tree: "Amazilia", path: path
                    }).then(function (syncArgs) {
                        $scope.menu.currentNode = syncArgs.node;
                    });

                    $timeout(function () {
                        navigationService.syncTree({
                            tree: "Amazilia", path: path
                        }).then(function (syncArgs) {
                            $scope.menu.currentNode = syncArgs.node;
                        });
                    }, 1000);
                }
            }
        ]);


angular.module("umbraco")
    .controller("Amazilia.StoreEditorController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService', '$routeParams', 'formHelper', '$timeout', 'amzstoreservice', function ($scope, $http, appState, navigationService, notificationsService, $routeParams, formHelper, $timeout, amzstoreservice) {

            //setup scope vars
            $scope.page = {};
            $scope.page.loading = false;
            $scope.page.nameLocked = false;
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;
            $scope.id = $routeParams.id;

            $scope.Tabs = [{ id: 0, label: 'General', alias: 'General' }];

            $scope.actionInProgress = false;
            $scope.bulkStatus = '';

            $scope.Data = {};
            $scope.Data.Name = '';

            $scope.buttonState = "init";

            amzstoreservice.getStoreById($scope.id).then(function (response) {

                $scope.Data = response;
                $scope.buttonState = "success";

                $http.get('backoffice/Amazilia/AmaziliaTree/GetTreeNode?id=' + $scope.id + '&application=' + $scope.page.menu.currentSection + '&subsection=store', {
                    cache: false
                }).then(function (response) {
                    $scope.page.menu.currentNode = response.data;
                }, function (error) {
                    console.log('Failed to load node for id')
                });
            }, function (error) {
                notificationsService.error("Error loading store", error);
            });


            $scope.Save = function () {
                $scope.buttonState = "busy";

                amzstoreservice.saveStore($scope.Data).then(function (res) {

                    // set success flags
                    $scope.buttonState = "success";
                    $scope.contentForm.$dirty = false;

                    // display save result message if any
                    if (res.Message) {
                        notificationsService.success(res.Message);
                    } else {
                        notificationsService.success("Save successfull");
                    }

                    // redirect if necessary
                    if (res.RedirectRouteUrl.length) {
                        $location.path(res.RedirectRouteUrl);
                    }
                }, function (err) {
                    notificationsService.error("Error saving store", err);
                    $scope.buttonState = "error";
                });
            };

            $scope.$parent.syncTree(["st_0"]);

        }]);

angular.module("umbraco")
    .controller("Amazilia.PriceGroupEditorController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService',
            '$routeParams', 'formHelper', '$timeout', '$location', 'amzpriceservice', function ($scope, $http, appState, navigationService, notificationsService, $routeParams, formHelper, $timeout, $location, amzpriceservice) {

                //setup scope vars
                $scope.page = {};
                $scope.page.loading = false;
                $scope.page.nameLocked = false;
                $scope.page.menu = {};
                $scope.page.menu.currentSection = appState.getSectionState("currentSection");
                $scope.page.menu.currentNode = null;
                $scope.id = $routeParams.id;

                $scope.Tabs = [{ id: 0, label: 'General', alias: 'General' }];

                $scope.actionInProgress = false;

                $scope.Data = {
                    PriceGroup: {}, Stores: [], MemberGroups: [], Countries: [], TaxCategories: []
                };
                $scope.Data.PriceGroup.Name = '';
                $scope.buttonState = "init";

                amzpriceservice.getPriceGroupById($scope.id).then(
                    function (data) {
                        $scope.Data = data;
                        $scope.buttonState = "success";

                        // get an (virtual) treenode for the menu actions
                        $http.get('backoffice/Amazilia/AmaziliaTree/GetTreeNode?id=' + $scope.id + '&application=' + $scope.page.menu.currentSection + '&subsection=pricegroup', {
                            cache: false
                        }).then(function (response) {
                            $scope.page.menu.currentNode = response.data;
                        }, function (error) {
                            console.log('Failed to load node for id');
                        });
                    },
                    function (error) { notificationsService.error("Error loading store", error); }
                );

                $scope.Save = function () {
                    $scope.buttonState = "busy";

                    amzpriceservice.savePriceGroup($scope.Data).then(function (res) {
                        // set success flags
                        $scope.buttonState = "success";
                        $scope.contentForm.$dirty = false;

                        // display save result message if any
                        if (res.data.Message) {
                            notificationsService.success(res.data.Message);
                        } else {
                            notificationsService.success("Save successfull");
                        }

                        // redirect if necessary
                        if (res.data.RedirectRouteUrl.length) {
                            $location.path(res.data.RedirectRouteUrl);
                        }

                    }, function (err) {
                        notificationsService.error("Error saving pricegroup", err);
                        $scope.buttonState = "error";

                    });



                };

                $scope.$parent.syncTree(["pr_0"]);
            }]);


angular.module("umbraco")
    .controller("Amazilia.EntityEditorController",
        ['$scope', 'appState', function ($scope, appState) {
            //setup scope vars
            $scope.page = {};
            $scope.page.loading = false;
            $scope.page.nameLocked = false;
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;

            $scope.init = function (path) {
                $scope.$parent.syncTree(path);
            };

        }]);


angular.module("umbraco")
    .controller("Amazilia.CountryEditorController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService', 'treeService', '$routeParams', 'formHelper', '$timeout', '$location', function ($scope, $http, appState, navigationService, notificationsService, treeService, $routeParams, formHelper, $timeout, $location) {

            //setup scope vars
            $scope.page = {};
            $scope.page.loading = false;
            $scope.page.nameLocked = false;
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;
            $scope.id = $routeParams.id;
            $scope.Tabs = [{ id: 0, label: 'General', alias: 'General' }, { id: 1, label: 'States', alias: 'States' }];

            $scope.actionInProgress = false;

            $scope.Data = {
                Country: {}
            };

            $scope.Data.Country.Name = '';
            $scope.buttonState = "init";

            var activeNode = appState.getTreeState("selectedNode");

            $http.get('backoffice/Amazilia/Countries/GetCountryById/' + $scope.id, {
                cache: false
            }).then(function (response) {
                if (response.data.Ok) {
                    $scope.Data.Country = response.data.Data;
                    $scope.page.loading = false;
                    $scope.buttonState = "success";

                    $http.get('backoffice/Amazilia/AmaziliaTree/GetTreeNode?id=' + $scope.id + '&application=' + $scope.page.menu.currentSection + '&subsection=country', {
                        cache: false
                    }).then(function (response) {
                        $scope.page.menu.currentNode = response.data;
                    }, function (error) {
                        console.log('Failed to load node for id');
                    });

                }
                else {
                    notificationsService.error("Error loading countries", response.data.Message);
                }
            }, function (error) {
                notificationsService.error("Error loading countries", error);
            });

            $scope.togglePrompt = function (entity) {
                entity.deletePrompt = true;
            };
            $scope.hidePrompt = function (entity) {
                entity.deletePrompt = false;
            };

            $scope.deleteState = function (state) {
                for (var i = 0; i < $scope.Data.Country.CountryStates.length; i++) {
                    var obj = $scope.Data.Country.CountryStates[i];
                    if (obj.Id == state.Id) {
                        $scope.Data.Country.CountryStates.splice(i, 1);
                        break;
                    }
                }
            };

            $scope.AddcountryState = function () {
                $scope.Data.Country.CountryStates.push({ Name: '', Abbreviation: '', DisplayOrder: 0, Published: true })
            };

            $scope.Save = function (country) {
                $scope.buttonState = "busy";

                $http.post('backoffice/Amazilia/Countries/SaveCountry/', $scope.Data.Country).then(function (res) {

                    if (!res.data.Ok) {
                        notificationsService.error("Error saving country", res.data.Message);
                        $scope.buttonState = "error";
                        return;
                    }
                    // refresh
                    $scope.Data.Countries = res.data.Data;

                    // set success flags
                    $scope.buttonState = "success";
                    $scope.contentForm.$dirty = false;

                    // display save result message if any
                    if (res.data.Message) {
                        notificationsService.success(res.data.Message);
                    } else {
                        notificationsService.success("Save successfull");
                    }

                    // redirect if necessary
                    if (res.data.RedirectRouteUrl.length) {
                        $location.path(res.data.RedirectRouteUrl);
                    }
                }, function (err) {
                    notificationsService.error("Error saving country", err);
                    $scope.buttonState = "error";
                });
            };

            $scope.toggle = function (prop) {
                $scope.Data.Country[prop] = !$scope.Data.Country[prop];
            };

            $scope.$parent.syncTree(["tc_0", "tc_2"]);


        }]);



angular.module("umbraco")
    .controller("Amazilia.ListEditorController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService', '$routeParams', 'formHelper', '$timeout', '$location', function ($scope, $http, appState, navigationService, notificationsService, $routeParams, formHelper, $timeout, $location) {

            //setup scope vars
            $scope.page = {};
            $scope.page.loading = false;
            $scope.page.nameLocked = false;
            $scope.page.name = 'Amazilia';
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;
            $scope.id = $routeParams.id;
            $scope.actionInProgress = false;
            $scope.buttonState = "init";
            $scope.Data = {};
            $scope.Data.Items = {};

            $scope.options = {};

            $scope.options.includeProperties = {};


            $http.get('backoffice/Amazilia/ListEdit/GetListOf/' + $scope.id, {
                cache: false
            }).then(function (response) {
                if (response.data.Ok) {
                    $scope.Data.Items = response.data.Data.items;
                    $scope.options.includeProperties = response.data.Data.properties;

                    _.each($scope.options.includeProperties, function (e, i) {
                        _.each($scope.Data.Items, function (item, index) {
                            item[e.alias] = item.properties[e.alias];
                        });
                    });

                    $scope.$parent.syncTree(response.data.Data.path);
                    $scope.page.loading = false;
                    $scope.page.name = response.data.Data.name;
                    $scope.buttonState = "success";
                }
                else {
                    notificationsService.error("Error loading list", response.data.Message);
                }
            }, function (error) {
                notificationsService.error("Error loading list", error);
            });

            $scope.item_click = function (item) {
                $location.path(item.routeurl);
            };
        }]);


angular.module("umbraco")
    .controller("Amazilia.OrdersController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService', '$routeParams', 'formHelper', '$timeout', '$location', 'amzlocalizationservice', function ($scope, $http, appState, navigationService, notificationsService, $routeParams, formHelper, $timeout, $location, amzlocalizationservice) {

            //setup scope vars
            $scope.page = {};
            $scope.page.name = 'Orders';
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;
            $scope.Data = {};
            $scope.Data.Items = {};

            $scope.page.loading = true;

            $scope.options = {};

            $scope.options.includeProperties = {};
            $scope.options.pager = { totalPages: 0, pageNumber: 0 };

            $scope.filterOptions = { "pageNumber": "1", "pageSize": "25" };


            var getOrders = function () {
                $scope.page.loading = true;
                $http.post('backoffice/Amazilia/Order/Orders', $scope.filterOptions).then(function (response) {
                    $scope.page.loading = false;
                    if (response.data.Ok) {
                        $scope.Data.Items = response.data.Data.items;
                        $scope.options.includeProperties = response.data.Data.properties;

                        $scope.options.pager = response.data.Data.pager;

                        _.each($scope.options.includeProperties, function (e, i) {
                            _.each($scope.Data.Items, function (item, index) {
                                item[e.alias] = item.properties[e.alias];
                            });
                        });

                        $scope.$parent.syncTree(response.data.Data.path);
                        $scope.page.loading = false;
                        $scope.page.name = response.data.Data.name;
                        $scope.buttonState = "success";
                    }
                    else {
                        $scope.page.loading = false;
                        notificationsService.error("Error loading list", response.data.Message);
                    }
                }, function (error) {
                    $scope.page.loading = false;
                    notificationsService.error("Error loading list", error);
                });
            };


            $scope.item_click = function (item) {
                $location.path(item.routeurl);
            };

            $scope.changePageNumber = function (pageNumber) {
                $scope.filterOptions.pageNumber = pageNumber;
                getOrders();
            };

            // user config, todo  : custom formatstring
            $scope.dateConfig = {
                pickDate: true,
                pickTime: false,
                useSeconds: false,
                format: "YYYY-MM-DD",
                icons: {
                    time: "icon-time",
                    date: "icon-calendar",
                    up: "icon-chevron-up",
                    down: "icon-chevron-down"
                }
            };

            amzlocalizationservice.getDateFormatString().then(function (a) { $scope.dateConfig.format = a; });

            $scope.datePickerChange = function (event, prop) {
                // handle change
                if (event.date && event.date.isValid()) {

                    // users config datestring
                    $scope.filterOptions[prop] = event.date.format($scope.dateConfig.format);

                    // system date configstring
                    $scope.filterOptions[prop + 'system'] = event.date.format("YYYY-MM-DD");
                }
            };

            $scope.deleteDate = function (event, prop) {
                $scope.filterOptions[prop] = null;
                event.stopPropagation();
                return false;
            };

            $scope.doSearch = function () {
                getOrders();
            };

            getOrders();
        }]);


angular.module("umbraco")
    .controller("Amazilia.OrderController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService', '$routeParams', 'formHelper', '$timeout', '$location', 'amzlocalizationservice', function ($scope, $http, appState, navigationService, notificationsService, $routeParams, formHelper, $timeout, $location, amzlocalizationservice) {

            $scope.page = {};
            $scope.page.name = 'Order';
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;
            $scope.data = {};

            $scope.id = $routeParams.id;
            $scope.tabs = [{ id: 0, label: 'General', alias: 'General' },
            { id: 1, label: 'Billing', alias: 'Billing info' },
            { id: 2, label: 'Products', alias: 'Products' },
            { id: 3, label: 'Notes', alias: 'Notes' }];


            var getOrder = function () {
                $scope.loading = true;
                $http.get('backoffice/Amazilia/Order/GetOrderById/' + $scope.id).then(function (response) {
                    $scope.loading = false;
                    if (response.data.Ok) {
                        $scope.data.order = response.data.Data;
                        $scope.$parent.syncTree(response.data.Data.path);
                        $scope.page.loading = false;
                        $scope.page.name = response.data.Data.name;
                        $scope.buttonState = "success";
                    }
                    else {
                        $scope.loading = false;
                        notificationsService.error("Error loading order", response.data.Message);
                    }
                }, function (error) {
                    $scope.loading = false;
                    notificationsService.error("Error loading order", error);
                });
            };

            getOrder();

            // Orderitems properteis
            $scope.data.includeProperties = [
                { alias: "name", header: "Name" },
                { alias: "quantity", header: "Quantity" },
                { alias: "priceInclTax", header: "PriceInclTax" },
                { alias: "priceExclTax", header: "PriceExclTax" }
            ];

        }]);

angular.module("umbraco")
    .controller("Amazilia.DeleteController",
        ['$scope', '$http', 'navigationService', '$location', 'treeService', 'notificationsService', function ($scope, $http, navigationService, $location, treeService, notificationsService) {

            $scope.performDelete = function () {

                //mark it for deletion (used in the UI)
                $scope.currentNode.loading = true;

                $http.get('backoffice/Amazilia/ListEdit/PerformDeleteByKey/' + $scope.currentNode.id + '?subSection=' + $scope.currentNode.metaData['subSection'], {
                    cache: false
                }).then(function (response) {
                    $scope.currentNode.loading = false;

                    treeService.removeNode($scope.currentNode);

                    if (response.data.Ok) {
                        $location.path(response.data.Data.listUrl);
                    } else {
                        notificationsService.error(response.data.Message);
                    }

                    navigationService.hideMenu();
                }, function (error) { });


            };

            $scope.cancel = function () {
                navigationService.hideDialog();
            };

        }]);


angular.module("umbraco")
    .controller("Amazilia.PluginController",
        ['$scope', '$http', 'navigationService', '$routeParams', '$location', 'treeService', 'notificationsService', 'amzstoreservice', '$timeout', function ($scope, $http, navigationService, $routeParams, $location, treeService, notificationsService, amzstoreservice, $timeout) {

            $scope.pluginUrl = '';
            $scope.page = {};
            $scope.page.loading = true;
            $scope.page.selectedStoreId = 0;
            $scope.configApiEndpoint = $routeParams.id;


            $scope.tabs = [{ id: 0, label: 'General', alias: 'General', active: true }, { id: 1, label: 'Plugin', alias: 'Plugin' }];

            $timeout(function () {

                $('.pluginContainer a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                    var alias = $(e.target).parent().data('element');
                    $scope.$apply(function () {
                        for (var tab in $scope.tabs) {
                            $scope.tabs[tab].active = 'tab-' + $scope.tabs[tab].alias === alias;
                        }
                    });
                });

            }, 500);


            var loadConfig = function () {
                $scope.page.loading = true;
                // load configuration from controller
                $http.get($scope.configApiEndpoint + '/config/' + $scope.page.selectedStoreId, {
                    cache: false
                }).then(function (response) {
                    if (response.data.Ok) {
                        $scope.page.loading = false;
                        $scope.page.name = response.data.Data.pluginName;
                        $scope.viewPath = '/App_Plugins/Amazilia/Plugins/' + response.data.Data.viewPath;
                        $scope.Data = response.data.Data;
                    }
                    else {
                        $scope.page.loading = false;
                        notificationsService.error("Error loading plugin config", response.data.Message);
                    }
                }, function (error) {
                    $scope.page.loading = false;
                    notificationsService.error("Error loading plugin config", error);
                });
            };

            loadConfig();

            $scope.Save = function (country) {
                $scope.buttonState = "busy";
                $scope.Data.saveToStoreId = $scope.page.selectedStoreId;
                $http.post($scope.configApiEndpoint + '/config/', $scope.Data).then(function (res) {

                    if (!res.data.Ok) {
                        notificationsService.error("Error saving country", res.data.Message);
                        $scope.buttonState = "error";
                        return;
                    }
                    // refresh
                    $scope.Data = res.data.Data;

                    // set success flags
                    $scope.buttonState = "success";
                    $scope.contentForm.$dirty = false;

                    // display save result message if any
                    if (res.data.Message) {
                        notificationsService.success(res.data.Message);
                    } else {
                        notificationsService.success("Save successfull");
                    }

                    // redirect if necessary
                    if (res.data.RedirectRouteUrl && res.data.RedirectRouteUrl.length) {
                        $location.path(res.data.RedirectRouteUrl);
                    }
                }, function (err) {
                    notificationsService.error("Error saving config", err);
                    $scope.buttonState = "error";
                });
            };

            $scope.install = function () {
                $http.get($scope.configApiEndpoint + '/install/', {
                    cache: false
                }).then(function (response) {
                    if (response.data.Ok) {
                        $scope.Data.installed = true;
                        if (response.data.Message) {
                            notificationsService.success(response.data.Message);
                        }
                    }
                    else {
                        notificationsService.error("Error installing plugin", response.data.Message);
                    }
                }, function (error) {

                    notificationsService.error("Error installing plugin", error);
                });
            };

            $scope.uninstall = function () {
                $http.get($scope.configApiEndpoint + '/uninstall/', {
                    cache: false
                }).then(function (response) {
                    if (response.data.Ok) {
                        $scope.Data.installed = false;
                        if (response.data.Message) {
                            notificationsService.success(response.data.Message);
                        }
                    }
                    else {
                        notificationsService.error("Error deinstalling plugin", response.data.Message);
                    }
                }, function (error) {
                    notificationsService.error("Error deinstalling plugin", error);
                });
            };

            $scope.changeStore = function () {
                loadConfig();
                return true;
            };

            $scope.$on("$destroy", function () {
                $('.pluginContainer a[data-toggle="tab"]').off();
            });
        }]);




angular.module("umbraco")
    .controller("Amazilia.EmailTemplateController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService', '$routeParams', 'formHelper', '$timeout', '$location', function ($scope, $http, appState, navigationService, notificationsService, $routeParams, formHelper, $timeout, $location) {

            //setup scope vars
            $scope.page = {};
            $scope.page.loading = false;
            $scope.page.nameLocked = true;
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;
            $scope.id = $routeParams.id;

            $scope.Tabs = [{ id: 0, label: 'General', alias: 'General' }];

            $scope.actionInProgress = false;

            $scope.Data = {
                template: {}, stores: [], memberGroups: []
            };

            $scope.Data.template.Name = '';
            $scope.buttonState = "init";


            $http.get('backoffice/Amazilia/EmailTemplate/GetTemplateById/' + $scope.id, {
                cache: false
            }).then(function (response) {
                if (response.data.Ok) {
                    $scope.Data = response.data.Data;
                    $scope.buttonState = "success";

                    // get an (virtual) treenode for the menu actions
                    $http.get('backoffice/Amazilia/AmaziliaTree/GetTreeNode?id=' + $scope.id + '&application=' + $scope.page.menu.currentSection + '&subsection=emailtemplate', {
                        cache: false
                    }).then(function (response) {
                        $scope.page.menu.currentNode = response.data;
                    }, function (error) {
                        console.log('Failed to load node for id');
                    });
                }
                else {
                    notificationsService.error("Error loading store", response.data.Message);
                }
            }, function (error) {
                notificationsService.error("Error loading store", error);
            });

            $scope.Save = function () {
                $scope.buttonState = "busy";

                $http.post('backoffice/Amazilia/EmailTemplate/SaveTemplate/', $scope.Data).then(function (res) {
                    // returns Amazilia.Backoffice.Models.JsonResultOfType<PriceGroup>

                    if (!res.data.Ok) {
                        notificationsService.error("Error saving template", res.data.Message);
                        $scope.buttonState = "error";
                        return;
                    }

                    // set success flags
                    $scope.buttonState = "success";
                    $scope.contentForm.$dirty = false;

                    // display save result message if any
                    if (res.data.Message) {
                        notificationsService.success(res.data.Message);
                    } else {
                        notificationsService.success("Save successfull");
                    }

                    // redirect if necessary
                    if (res.data.RedirectRouteUrl.length) {
                        $location.path(res.data.RedirectRouteUrl);
                    }

                }, function (err) {
                    notificationsService.error("Error saving store", err);
                    $scope.buttonState = "error";

                });
            };

            $scope.$parent.syncTree(["tc_0", "tc_7"]);
        }]);




angular.module("umbraco")
    .controller("Amazilia.SettingsController",
        ['$scope', '$http', 'appState', 'navigationService', 'notificationsService', '$routeParams', 'formHelper', '$timeout', '$location', function ($scope, $http, appState, navigationService, notificationsService, $routeParams, formHelper, $timeout, $location) {

            //setup scope vars
            $scope.page = {};
            $scope.page.loading = false;
            $scope.page.nameLocked = true;
            $scope.page.menu = {};
            $scope.page.menu.currentSection = appState.getSectionState("currentSection");
            $scope.page.menu.currentNode = null;
            $scope.id = $routeParams.id;
            $scope.page.loading = true;
            $scope.Tabs = [{ id: 0, label: 'General', alias: 'General' }];

            $scope.Data = {
            };

            $scope.buttonState = "init";


            $http.get('backoffice/Amazilia/Settings/GetSettings/', {
                cache: false
            }).then(function (response) {
                if (response.data.Ok) {
                    $scope.Data = response.data.Data;
                    $scope.buttonState = "success";
                    $scope.page.loading = false;

                }
                else {
                    notificationsService.error("Error loading store", response.data.Message);
                }
            }, function (error) {
                notificationsService.error("Error loading store", error);
            });

            $scope.Save = function () {
                $scope.buttonState = "busy";
                //  $scope.page.loading = true;

                $http.post('backoffice/Amazilia/Settings/SaveSettings/', $scope.Data).then(function (res) {

                    // set success flags
                    $scope.buttonState = "success";
                    $scope.contentForm.$dirty = false;
                    $scope.page.loading = false;

                    // display save result message if any
                    if (res.data.Message) {
                        notificationsService.success(res.data.Message);
                    } else {
                        notificationsService.success("Save successfull");
                    }

                    // redirect if necessary
                    if (res.data.RedirectRouteUrl.length) {
                        $location.path(res.data.RedirectRouteUrl);
                    }

                }, function (err) {
                    notificationsService.error("Error saving store", err);
                    $scope.buttonState = "error";

                });
            };

            $scope.$parent.syncTree(["tc_0", "tc_8"]);
        }]);





