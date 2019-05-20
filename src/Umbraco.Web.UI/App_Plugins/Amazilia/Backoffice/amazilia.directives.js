'use strict';


angular.module("umbraco.directives")
    .directive("amzGridview",
    function ($http, notificationsService) {

            return {     
                restrict: 'E',
                templateUrl: '/App_Plugins/Amazilia/Backoffice/Amazilia/Directives/amz-gridview.html',
                controller: amzGridViewController,
                scope: { endpointurl: '@', entityname: '@', loading : '=', actionsuffix : '@'} 
            };

            function amzGridViewController($scope) {
                
                $scope.loading = false;       
                $scope.Data = {
                    Entities: {}
                };
                $scope.Data.ShowAlias = false;

                var _actionsuffix =  $scope.actionsuffix || '';

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


