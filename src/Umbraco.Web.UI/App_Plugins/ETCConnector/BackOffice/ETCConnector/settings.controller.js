angular.module("umbraco").controller("ETC.Connector.SettingsController", ['$scope', '$http', 'notificationsService', function ($scope, $http, notificationsService) {


	$scope.Data = {};
	$scope.contentForm.$dirty = false;

	$http.get('backoffice/ETCConnector/Spider/GetGlobalSettings/',
		{
			cache: false
		}).then(function (response) {
			$scope.Data = response.data;
		}, function (err) {
			notificationsService.error("oops :" + err.data.ExceptionMessage, err.ExceptionMessage);
		});

	$scope.Commit = function () {
		$http.post('backoffice/ETCConnector/Spider/SaveGlobalSettings/', $scope.Data).then(function (res) {
			
			$scope.Data = res.data;
			$scope.contentForm.$dirty = false;
			notificationsService.success("Document Published", "Gelukt, de wijzigingen zijn succesvol opgelagen");

		}, function (err) {
			notificationsService.error("Niet opgeslagen", err);
		});
		return false;

	};
	
}]);