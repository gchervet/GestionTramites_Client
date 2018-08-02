angular.module('app')
    .controller('messageController', function ($scope, $uibModalInstance, items) {
    $scope.Message = items;

    var messageController = this;

    messageController.init = function () {
        $scope.Message.MessageType = $scope.Message.MessageType.toLowerCase();
        if (!$scope.Message.MessageTitle || $scope.Message.MessageTitle.trim().length == 0) {
            $scope.Message.MessageTitle = 'Mensaje de ' + $scope.Message.MessageType;
        }
        if (!$scope.Message.MessageYes || $scope.Message.MessageYes.trim().length == 0) {
            $scope.Message.MessageYes = 'Si';
        }
        if (!$scope.Message.MessageNo || $scope.Message.MessageNo.trim().length == 0) {
            $scope.Message.MessageNo = 'No';
        }
    };

    $scope.ok = function () {
        $uibModalInstance.dismiss('ok');
        return true;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        return false;
    };

    $(document).keyup(function (e) {
        if (e.keyCode == 13) {
            $uibModalInstance.dismiss('ok');
            return true;
        }
    });
    
});