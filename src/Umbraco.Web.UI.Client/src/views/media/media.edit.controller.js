/**
 * @ngdoc controller
 * @name Umbraco.Editors.Media.EditController
 * @function
 * 
 * @description
 * The controller for the media editor
 */
function mediaEditController($scope, $routeParams, appState, mediaResource, entityResource, navigationService, notificationsService, angularHelper, serverValidationManager, contentEditingHelper, fileManager, treeService, formHelper, umbModelMapper, editorState, umbRequestHelper, $http) {
    
    var nodeId = null;
    var create = false;

    // when opening the editor through infinite editing get the 
    // node id from the model instead of the route param
    if($scope.model && $scope.model.node && $scope.model.node.id) {
        nodeId = $scope.model.node.id;
    } else {
        nodeId = $routeParams.id;
    }
    
    // when opening the editor through infinite editing get the 
    // create option from the model instead of the route param
    if($scope.model && $scope.model.infiniteMode) {
        create = $scope.model.create;
    } else {
        create = $routeParams.create;
    }

    //setup scope vars
    $scope.currentSection = appState.getSectionState("currentSection");
    $scope.currentNode = null; //the editors affiliated node

    $scope.page = {};
    $scope.page.loading = false;
    $scope.page.menu = {};
    $scope.page.menu.currentSection = appState.getSectionState("currentSection");
    $scope.page.menu.currentNode = null; //the editors affiliated node
    $scope.page.listViewPath = null;
    $scope.page.saveButtonState = "init";
    $scope.page.submitButtonLabel = "Save";

    /** Syncs the content item to it's tree node - this occurs on first load and after saving */
    function syncTreeNode(content, path, initialLoad) {

        if (!$scope.content.isChildOfListView) {
            navigationService.syncTree({ tree: "media", path: path.split(","), forceReload: initialLoad !== true }).then(function (syncArgs) {
                $scope.page.menu.currentNode = syncArgs.node;
            });
        }
        else if (initialLoad === true) {

            //it's a child item, just sync the ui node to the parent
            navigationService.syncTree({ tree: "media", path: path.substring(0, path.lastIndexOf(",")).split(","), forceReload: initialLoad !== true });

            //if this is a child of a list view and it's the initial load of the editor, we need to get the tree node 
            // from the server so that we can load in the actions menu.
            umbRequestHelper.resourcePromise(
                $http.get(content.treeNodeUrl),
                'Failed to retrieve data for child node ' + content.id).then(function (node) {
                    $scope.page.menu.currentNode = node;
                });
        }
    }

    if (create) {

        $scope.page.loading = true;

        mediaResource.getScaffold(nodeId, $routeParams.doctype)
            .then(function (data) {
                $scope.content = data;

                editorState.set($scope.content);

                // We don't get the info tab from the server from version 7.8 so we need to manually add it
                //contentEditingHelper.addInfoTab($scope.content.tabs);

                init($scope.content);

                $scope.page.loading = false;

            });
    }
    else {

        $scope.page.loading = true;

        mediaResource.getById(nodeId)
            .then(function (data) {

                $scope.content = data;
                
                if (data.isChildOfListView && data.trashed === false) {
                    $scope.page.listViewPath = ($routeParams.page)
                        ? "/media/media/edit/" + data.parentId + "?page=" + $routeParams.page
                        : "/media/media/edit/" + data.parentId;
                }

                editorState.set($scope.content);

                //in one particular special case, after we've created a new item we redirect back to the edit
                // route but there might be server validation errors in the collection which we need to display
                // after the redirect, so we will bind all subscriptions which will show the server validation errors
                // if there are any and then clear them so the collection no longer persists them.
                serverValidationManager.executeAndClearAllSubscriptions();

                if($scope.model && !$scope.model.infiniteMode) {
                    syncTreeNode($scope.content, data.path, true); 
                }
               
                if ($scope.content.parentId && $scope.content.parentId != -1) {
                    //We fetch all ancestors of the node to generate the footer breadcrump navigation
                    entityResource.getAncestors(nodeId, "media")
                        .then(function (anc) {
                            $scope.ancestors = anc;
                        });
                }

                // We don't get the info tab from the server from version 7.8 so we need to manually add it
                //contentEditingHelper.addInfoTab($scope.content.tabs);

                init($scope.content);

                $scope.page.loading = false;

            });
    }

    function init(content) {

        // prototype content and info apps
        var contentApp = {
            "name": "Content",
            "alias": "content",
            "icon": "icon-document",
            "view": "views/media/apps/content/content.html"
        };

        var infoApp = {
            "name": "Info",
            "alias": "info",
            "icon": "icon-info",
            "view": "views/media/apps/info/info.html"
        };

        var listview = {
            "name": "Child items",
            "alias": "childItems",
            "icon": "icon-list",
            "view": "views/media/apps/listview/listview.html"
        };

        $scope.content.apps = [];

        if($scope.content.contentTypeAlias === "Folder") {
          // add list view app
          $scope.content.apps.push(listview);
            
          // remove the list view tab
          angular.forEach($scope.content.tabs, function(tab, index){
            if(tab.alias === "Contents") {
              tab.hide = true;
            }
          });

        } else {
            $scope.content.apps.push(contentApp);
        }
        
        $scope.content.apps.push(infoApp);
        
        // set first app to active
        $scope.content.apps[0].active = true;

        // setup infinite mode
        if($scope.model && $scope.model.infiniteMode === true) {
            $scope.page.submitButtonLabel = "Save and Close";
        }

    }
    
    $scope.save = function () {

        if (!$scope.busy && formHelper.submitForm({ scope: $scope })) {

            $scope.busy = true;
            $scope.page.saveButtonState = "busy";

            mediaResource.save($scope.content, create, fileManager.getFiles())
                .then(function(data) {

                    formHelper.resetForm({ scope: $scope, notifications: data.notifications });

                    contentEditingHelper.handleSuccessfulSave({
                        scope: $scope,
                        savedContent: data,
                        rebindCallback: contentEditingHelper.reBindChangedProperties($scope.content, data)
                    });

                    editorState.set($scope.content);
                    $scope.busy = false;

                    if($scope.model && !$scope.model.infiniteMode) {
                        syncTreeNode($scope.content, data.path);
                    }

                    init($scope.content);

                    $scope.page.saveButtonState = "success";

                    // close the editor if it's infinite mode
                    if($scope.model && $scope.model.infiniteMode && $scope.model.submit) {
                        $scope.model.submit($scope.model);
                    }

                }, function(err) {

                    contentEditingHelper.handleSaveError({
                        err: err,
                        redirectOnFailure: true,
                        rebindCallback: contentEditingHelper.reBindChangedProperties($scope.content, err.data)
                    });
                    
                    //show any notifications
                    if (angular.isArray(err.data.notifications)) {
                        for (var i = 0; i < err.data.notifications.length; i++) {
                            notificationsService.showNotification(err.data.notifications[i]);
                        }
                    }

                    editorState.set($scope.content);
                    $scope.busy = false;
                    $scope.page.saveButtonState = "error";

                });
        }else{
            $scope.busy = false;
        }
        
    };

    $scope.backToListView = function() {
        $location.path($scope.page.listViewPath);
    };

    $scope.close = function() {
        if($scope.model.close) {
            $scope.model.close($scope.model);
        }
    };

}

angular.module("umbraco")
    .controller("Umbraco.Editors.Media.EditController", mediaEditController);
