angular.module("umbraco").controller("Amazilia.PropertyEditors.VariantOptionsController",
    function($scope) {

        //setup the default config
        var config = {
            variantoptions: [],
            multiple: false
        };

        //map the user config
        angular.extend(config, $scope.model.config);

        //map back to the model
        $scope.model.config = config;
    

        function convertObjectToDictionaryArray(model){
            //now we need to format the items in the dictionary because we always want to have an array
            var newItems = [];
            var vals = _.values($scope.model.config.variantoptions);
            var keys = _.keys($scope.model.config.variantoptions);

            for (var i = 0; i < vals.length; i++) {
                var label = vals[i].value ? vals[i].value : vals[i]; 
                newItems.push({ id: keys[i], sortOrder: vals[i].sortOrder, value: label });
            }

            return newItems;
        }
               

         if (angular.isObject($scope.model.config.variantoptions)) {
            $scope.model.config.variantoptions = convertObjectToDictionaryArray($scope.model.config.variantoptions);
        }
        else {
            throw "The items property must be either an array or a dictionary";
        }
        

        //sort the values
        $scope.model.config.variantoptions.sort(function (a, b) { return (a.sortOrder > b.sortOrder) ? 1 : ((b.sortOrder > a.sortOrder) ? -1 : 0); });

        //now we need to check if the value is null/undefined, if it is we need to set it to "" so that any value that is set
        // to "" gets selected by default
        if ($scope.model.value === null || $scope.model.value === undefined) {
           $scope.model.value = "";
        }
        

    });
