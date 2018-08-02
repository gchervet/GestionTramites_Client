angular.module('app')
.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {
    
    $scope.selectedTramite = data;    
    $scope.ok = function() {        
        //modalFactory.open('lg', 'result.html', {searchTerm: $scope.searchTerm});
        $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

});