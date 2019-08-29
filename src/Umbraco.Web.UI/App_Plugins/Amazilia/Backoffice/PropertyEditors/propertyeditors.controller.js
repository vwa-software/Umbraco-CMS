﻿/*
 * Amazilia.PriceEditorController, used in the PriceEditor property editor 
 */
angular.module("umbraco")
    .controller("Amazilia.PriceEditorController",
        ['$scope', 'amzpriceservice', 'notificationsService',
            function ($scope, amzpriceservice, notificationsService) {
                $scope.model.isLoading = true;
                $scope.model.priceGroups = [];

                // load the pricegroups and taxcategories

                amzpriceservice.getTaxCategories().then(
                    function (taxCategories) {
                        var val;
                        $scope.model.isLoading = false;

                        if ($scope.model.value === undefined || $scope.model.value === null) {
                            $scope.model.value = {
                                taxCategoryId: 0, priceGroups: {}
                            };
                        }

                        if (typeof ($scope.model.value) === 'string') {
                            try {
                                $scope.model.value = angular.fromJson($scope.model.value);
                            } catch (e) {
                                $scope.model.value = {
                                    taxCategoryId: 0, priceGroups: {}
                                };
                            }
                        }

                        $scope.model.taxCategories = taxCategories;                       
                    },
                    function (error) {
                        notificationsService.error("Error loading pricegroups", error);
                    }
                );

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

                if ($scope.model.value === undefined || $scope.model.value === null) {
                    $scope.model.value = {
                        isShipEnabled: true,
                        productTypeId: 5
                    };
                }

                if (typeof ($scope.model.value) === 'string') {
                    try {
                        $scope.model.value = angular.fromJson($scope.model.value);
                    } catch (e) {
                        $scope.model.value = {
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
    .controller("Amazilia.ShippingInfoEditorController",
        ['$scope',
            function ($scope) {
                $scope.model.isLoading = true;

                if ($scope.model.value === undefined || $scope.model.value === null) {
                    $scope.model.value = {};
                }

                if (typeof ($scope.model.value) === 'string') {
                    try {
                        $scope.model.value = angular.fromJson($scope.model.value);
                    } catch (e) {
                        $scope.model.value = {};
                    }
                }
                $scope.model.isLoading = false;

                $scope.model.value = Amazilia.extend($scope.model.value, {
                    "isShipEnabled": true, "additionalShippingCharge": {}
                });
                                

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
                };

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
                        var defaultValue = { manageInventory: false, stockQuantity: {}, minStockQuantity: 0 };
                        for (let i in $scope.model.warehouses) {
                            defaultValue.stockQuantity[$scope.model.warehouses[i].Id] = { reserved: 0, quantity: 0, planned: 0 };
                        }

                        if (typeof $scope.model.value === "string") {
                            $scope.model.value = defaultValue;
                        } else {
                            //map the default value
                            $scope.model.value = Amazilia.extend($scope.model.value, defaultValue);
                        }


                        for (let i in $scope.model.warehouses) {

                            let val = $scope.model.value.stockQuantity[$scope.model.warehouses[i].Id];

                            if (val === null || val === undefined || typeof val === "number") {
                                $scope.model.value.stockQuantity[$scope.model.warehouses[i].Id] = { reserved: 0, quantity: 0, planned: 0 };
                            }
                        }
                    }
                    else {
                        notificationsService.error("Error loading warehouses", response.data.Message);
                    }
                }, function (error) {
                    notificationsService.error("Error loading warehouses", error);
                });

                $scope.toggle = function (property) {
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



angular.module("umbraco").controller("Amazilia.PropertyEditors.CategoryController",
    function ($scope, $routeParams, $injector, 
        notificationsService, iconHelper, editorState, localizationService,
        appState, $timeout,  listViewHelper,  navigationService,   amaziliaContentResource) {

        // Custom implementation of the Umbraco ListViewController.
        // "Umbraco.PropertyEditors.ListViewController"

        //this is a quick check to see if we're in create mode, if so just exit - we cannot show children for content
        // that isn't created yet, if we continue this will use the parent id in the route params which isn't what
        // we want. NOTE: This is just a safety check since when we scaffold an empty model on the server we remove
        // the list view tab entirely when it's new.
        if ($routeParams.create) {
            $scope.isNew = true;
            return;
        }

        //Now we need to check if this is for media, members or content because that will depend on the resources we use
        var contentResource,  deleteItemCallback, getIdCallback, createEditUrlCallback;

        $scope.entityType = "content";
        contentResource = $injector.get('contentResource');   
     
        deleteItemCallback = contentResource.deleteById;

        getIdCallback = function (selected) {
            return selected.id;
        };
        createEditUrlCallback = function (item) {
            return "/" + $scope.entityType + "/" + $scope.entityType + "/edit/" + item.id + "?page=" + $scope.options.pageNumber;
        };


        $scope.pagination = [];
        $scope.isNew = false;
        $scope.actionInProgress = false;
        $scope.selection = [];
        $scope.folders = [];
        $scope.listViewResultSet = {
            totalPages: 0,
            items: []
        };
        

        //when this is null, we don't check permissions
        $scope.currentNodePermissions = null;

        if ($scope.entityType === "content") {
            //Just ensure we do have an editorState
            if (editorState.current) {
                //Fetch current node allowed actions for the current user
                //This is the current node & not each individual child node in the list
                var currentUserPermissions = editorState.current.allowedActions;

                //Create a nicer model rather than the funky & hard to remember permissions strings
                $scope.currentNodePermissions = {
                    "canCopy": _.contains(currentUserPermissions, 'O'), //Magic Char = O
                    "canCreate": _.contains(currentUserPermissions, 'C'), //Magic Char = C
                    "canDelete": _.contains(currentUserPermissions, 'D'), //Magic Char = D
                    "canPublish": _.contains(currentUserPermissions, 'U'), //Magic Char = U
                    "canUnpublish": _.contains(currentUserPermissions, 'U') //Magic Char = Z (however UI says it can't be set, so if we can publish 'U' we can unpublish)
                };
            }
        }

        //when this is null, we don't check permissions
        $scope.buttonPermissions = null;

        //When we are dealing with 'content', we need to deal with permissions on child nodes.
        // Currently there is no real good way to 
        if ($scope.entityType === "content") {

            var idsWithPermissions = null;

            $scope.buttonPermissions = {
                canCopy: true,
                canCreate: true,
                canDelete: true,
                canMove: true,
                canPublish: true,
                canUnpublish: true
            };

            $scope.$watch(function () {
                return $scope.selection.length;
            }, function (newVal, oldVal) {

                if ((idsWithPermissions == null && newVal > 0) || (idsWithPermissions != null)) {

                    //get all of the selected ids
                    var ids = _.map($scope.selection, function (i) {
                        return i.id.toString();
                    });

                    //remove the dictionary items that don't have matching ids
                    var filtered = {};
                    _.each(idsWithPermissions, function (value, key, list) {
                        if (_.contains(ids, key)) {
                            filtered[key] = value;
                        }
                    });
                    idsWithPermissions = filtered;

                    //find all ids that we haven't looked up permissions for
                    var existingIds = _.keys(idsWithPermissions);
                    var missingLookup = _.map(_.difference(ids, existingIds), function (i) {
                        return Number(i);
                    });

                    if (missingLookup.length > 0) {
                        contentResource.getPermissions(missingLookup).then(function (p) {
                            $scope.buttonPermissions = listViewHelper.getButtonPermissions(p, idsWithPermissions);
                        });
                    }
                    else {
                        $scope.buttonPermissions = listViewHelper.getButtonPermissions({}, idsWithPermissions);
                    }
                }
            });

        }

        $scope.options = {
            displayAtTabNumber: $scope.model.config.displayAtTabNumber ? $scope.model.config.displayAtTabNumber : 1,
            pageSize: $scope.model.config.pageSize ? $scope.model.config.pageSize : 10,
            pageNumber: ($routeParams.page && Number($routeParams.page) != NaN && Number($routeParams.page) > 0) ? $routeParams.page : 1,
            filter: '',
            orderBy: "sortOrder",
            orderDirection: $scope.model.config.orderDirection ? $scope.model.config.orderDirection.trim() : "desc",
            orderBySystemField: true,
            includeProperties: $scope.model.config.includeProperties ? $scope.model.config.includeProperties : [
                { alias: 'updateDate', header: 'Last edited', isSystem: 1 },
                { alias: 'updater', header: 'Last edited by', isSystem: 1 }
            ],
            layout: {
                layouts: $scope.model.config.layouts,
                activeLayout: listViewHelper.getLayout($routeParams.id, $scope.model.config.layouts)
            },
            allowBulkPublish: $scope.entityType === 'content' && $scope.model.config.bulkActionPermissions.allowBulkPublish,
            allowBulkUnpublish: $scope.entityType === 'content' && $scope.model.config.bulkActionPermissions.allowBulkUnpublish,
            allowBulkCopy: $scope.entityType === 'content' && $scope.model.config.bulkActionPermissions.allowBulkCopy,
            allowBulkMove: $scope.model.config.bulkActionPermissions.allowBulkMove,
            allowBulkDelete: $scope.model.config.bulkActionPermissions.allowBulkDelete
        };

        // Check if selected order by field is actually custom field
        for (var j = 0; j < $scope.options.includeProperties.length; j++) {
            var includedProperty = $scope.options.includeProperties[j];
            if (includedProperty.alias.toLowerCase() === $scope.options.orderBy.toLowerCase()) {
                $scope.options.orderBySystemField = includedProperty.isSystem === 1;
                break;
            }
        }

        //update all of the system includeProperties to enable sorting
        _.each($scope.options.includeProperties, function (e, i) {

            //NOTE: special case for contentTypeAlias, it's a system property that cannot be sorted
            // to do that, we'd need to update the base query for content to include the content type alias column
            // which requires another join and would be slower. BUT We are doing this for members so not sure it makes a diff?
            if (e.alias != "contentTypeAlias") {
                e.allowSorting = true;
            }
            
            if (e.isSystem) {
                //localize the header
                var key = getLocalizedKey(e.alias);
                localizationService.localize(key).then(function (v) {
                    e.header = v;
                });
            }
        });

        $scope.selectLayout = function (selectedLayout) {
            $scope.options.layout.activeLayout = listViewHelper.setLayout($routeParams.id, selectedLayout, $scope.model.config.layouts);
        };

        function showNotificationsAndReset(err, reload, successMsg) {

            //check if response is ysod
            if (err.status && err.status >= 500) {

                // Open ysod overlay
                $scope.ysodOverlay = {
                    view: "ysod",
                    error: err,
                    show: true
                };
            }

            $timeout(function () {
                $scope.bulkStatus = "";
                $scope.actionInProgress = false;
            },
                500);

            if (err.data && angular.isArray(err.data.notifications)) {
                for (var i = 0; i < err.data.notifications.length; i++) {
                    notificationsService.showNotification(err.data.notifications[i]);
                }
            } else if (successMsg) {
                localizationService.localize("bulk_done")
                    .then(function (v) {
                        notificationsService.success(v, successMsg);
                    });
            }
        }

        $scope.next = function (pageNumber) {
            $scope.options.pageNumber = pageNumber;
            $scope.reloadView($scope.contentId);
        };

        $scope.goToPage = function (pageNumber) {
            $scope.options.pageNumber = pageNumber;
            $scope.reloadView($scope.contentId);
        };

        $scope.prev = function (pageNumber) {
            $scope.options.pageNumber = pageNumber;
            $scope.reloadView($scope.contentId);
        };


        /*Loads the search results, based on parameters set in prev,next,sort and so on*/
        /*Pagination is done by an array of objects, due angularJS's funky way of monitoring state
        with simple values */

        $scope.getContent = function () {
            $scope.reloadView($scope.contentId);
        }

        $scope.reloadView = function (id) {
            $scope.viewLoaded = false;
            $scope.folders = [];

            listViewHelper.clearSelection($scope.listViewResultSet.items, $scope.folders, $scope.selection);

            amaziliaContentResource.getChildren(id, $scope.options).then(function (data) {

                $scope.actionInProgress = false;
                $scope.listViewResultSet = data;

                //update all values for display
                var section = appState.getSectionState("currentSection");
                if ($scope.listViewResultSet.items) {
                    _.each($scope.listViewResultSet.items, function (e, index) {
                        setPropertyValues(e);
                    });
                }

                $scope.viewLoaded = true;

                //NOTE: This might occur if we are requesting a higher page number than what is actually available, for example
                // if you have more than one page and you delete all items on the last page. In this case, we need to reset to the last
                // available page and then re-load again
                if ($scope.options.pageNumber > $scope.listViewResultSet.totalPages) {
                    $scope.options.pageNumber = $scope.listViewResultSet.totalPages;

                    //reload!
                    $scope.reloadView(id);
                }

            });
        };

        var searchListView = _.debounce(function () {
            $scope.$apply(function () {
                makeSearch();
            });
        }, 500);

        $scope.forceSearch = function (ev) {
            //13: enter
            switch (ev.keyCode) {
                case 13:
                    makeSearch();
                    break;
            }
        };

        $scope.enterSearch = function () {
            $scope.viewLoaded = false;
            searchListView();
        };

        function makeSearch() {
            if ($scope.options.filter !== null && $scope.options.filter !== undefined) {
                $scope.options.pageNumber = 1;
                $scope.reloadView($scope.contentId);
            }
        }

        $scope.isAnythingSelected = function () {
            if ($scope.selection.length === 0) {
                return false;
            } else {
                return true;
            }
        };

        $scope.selectedItemsCount = function () {
            return $scope.selection.length;
        };

        $scope.clearSelection = function () {
            listViewHelper.clearSelection($scope.listViewResultSet.items, $scope.folders, $scope.selection);
        };

        $scope.getIcon = function (entry) {
            return iconHelper.convertFromLegacyIcon(entry.icon);
        };

        function serial(selected, fn, getStatusMsg, index) {
            return fn(selected, index).then(function (content) {
                index++;
                $scope.bulkStatus = getStatusMsg(index, selected.length);
                return index < selected.length ? serial(selected, fn, getStatusMsg, index) : content;
            }, function (err) {
                var reload = index > 0;
                showNotificationsAndReset(err, reload);
                return err;
            });
        }

        function applySelected(fn, getStatusMsg, getSuccessMsg, confirmMsg) {
            var selected = $scope.selection;
            if (selected.length === 0)
                return;
            if (confirmMsg && !confirm(confirmMsg))
                return;

            $scope.actionInProgress = true;
            $scope.bulkStatus = getStatusMsg(0, selected.length);

            return serial(selected, fn, getStatusMsg, 0).then(function (result) {
                // executes once the whole selection has been processed
                // in case of an error (caught by serial), result will be the error
                if (!(result.data && angular.isArray(result.data.notifications)))
                    showNotificationsAndReset(result, true, getSuccessMsg(selected.length));
            });
        }

        $scope.delete = function () {
            var confirmDeleteText = "";

            localizationService.localize("defaultdialogs_confirmdelete")
                .then(function (value) {
                    confirmDeleteText = value;

                    var attempt =
                        applySelected(
                            function (selected, index) { return deleteItemCallback(getIdCallback(selected[index])); },
                            function (count, total) {
                                var key = (total === 1 ? "bulk_deletedItemOfItem" : "bulk_deletedItemOfItems");
                                return localizationService.localize(key, [count, total]);
                            },
                            function (total) {
                                var key = (total === 1 ? "bulk_deletedItem" : "bulk_deletedItems");
                                return localizationService.localize(key, [total]);
                            },
                            confirmDeleteText + "?");
                    if (attempt) {
                        attempt.then(function () {
                            //executes if all is successful, let's sync the tree
                            var activeNode = appState.getTreeState("selectedNode");
                            if (activeNode) {
                                navigationService.reloadNode(activeNode);
                            }
                            $scope.getContent();
                        });
                    }
                });
        };

        $scope.publish = function () {
            applySelected(
                function (selected, index) { return contentResource.publishById(getIdCallback(selected[index])); },
                function (count, total) {
                    var key = (total === 1 ? "bulk_publishedItemOfItem" : "bulk_publishedItemOfItems");
                    return localizationService.localize(key, [count, total]);
                },
                function (total) {
                    var key = (total === 1 ? "bulk_publishedItem" : "bulk_publishedItems");
                    return localizationService.localize(key, [total]);
                });
        };

        $scope.unpublish = function () {
            applySelected(
                function (selected, index) { return contentResource.unPublish(getIdCallback(selected[index])); },
                function (count, total) {
                    var key = (total === 1 ? "bulk_unpublishedItemOfItem" : "bulk_unpublishedItemOfItems");
                    return localizationService.localize(key, [count, total]);
                },
                function (total) {
                    var key = (total === 1 ? "bulk_unpublishedItem" : "bulk_unpublishedItems");
                    return localizationService.localize(key, [total]);
                });
        };
             
        function getCustomPropertyValue(alias, properties) {
            var value = '';
            var index = 0;
            var foundAlias = false;
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].alias == alias) {
                    foundAlias = true;
                    break;
                }
                index++;
            }

            if (foundAlias) {
                value = properties[index].value;
            }

            return value;
        }

        /** This ensures that the correct value is set for each item in a row, we don't want to call a function during interpolation or ng-bind as performance is really bad that way */
        function setPropertyValues(result) {

            //set the edit url
            result.editPath = createEditUrlCallback(result);

            _.each($scope.options.includeProperties, function (e, i) {

                var alias = e.alias;

                // First try to pull the value directly from the alias (e.g. updatedBy)
                var value = result[alias];

                // If this returns an object, look for the name property of that (e.g. owner.name)
                if (value === Object(value)) {
                    value = value['name'];
                }

                // If we've got nothing yet, look at a user defined property
                if (typeof value === 'undefined') {
                    value = getCustomPropertyValue(alias, result.properties);
                }

                // If we have a date, format it
                if (isDate(value)) {
                    value = value.substring(0, value.length - 3);
                }

                // set what we've got on the result
                result[alias] = value;
            });


        }

        function isDate(val) {
            if (angular.isString(val)) {
                return val.match(/^(\d{4})\-(\d{2})\-(\d{2})\ (\d{2})\:(\d{2})\:(\d{2})$/);
            }
            return false;
        }

        function initView() {
            //default to root id if the id is undefined
            var id = $routeParams.id;
            if (id === undefined) {
                id = -1;
            }


            $scope.contentId = id;
            $scope.isTrashed = id === "-20" || id === "-21";

            $scope.options.allowBulkPublish = $scope.options.allowBulkPublish && !$scope.isTrashed;
            $scope.options.allowBulkUnpublish = $scope.options.allowBulkUnpublish && !$scope.isTrashed;

            $scope.options.bulkActionsAllowed = $scope.options.allowBulkPublish ||
                $scope.options.allowBulkUnpublish ||
                $scope.options.allowBulkCopy ||
                $scope.options.allowBulkMove ||
                $scope.options.allowBulkDelete;

            $scope.reloadView($scope.contentId);
        }

        function getLocalizedKey(alias) {

            switch (alias) {
                case "sortOrder":
                    return "general_sort";
                case "updateDate":
                    return "content_updateDate";
                case "updater":
                    return "content_updatedBy";
                case "createDate":
                    return "content_createDate";
                case "owner":
                    return "content_createBy";
                case "published":
                    return "content_isPublished";
                case "contentTypeAlias":
                    //TODO: Check for members
                    return $scope.entityType === "content" ? "content_documentType" : "content_mediatype";
                case "email":
                    return "general_email";
                case "username":
                    return "general_username";
            }
            return alias;
        }
        
        //GO!
        initView();
    });
