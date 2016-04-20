import angular from 'angular';
import template from './leases.html!text';
import '../util/rx';

import '../services/api/leases';
import './leases.css!';
import '../components/gr-confirm-delete/gr-confirm-delete.js';


export var leases = angular.module('kahuna.edits.leases', [
    'kahuna.services.lease',
    'kahuna.forms.datalist',
    'gr.confirmDelete',
    'util.rx'
]);


leases.controller(
    'LeasesCtrl',
    ['$window', '$q', '$scope', 'inject$', 'leaseService',
    function($window, $q, $scope, inject$, leaseService) {
        let ctrl = this;
        ctrl.grSmall = true;
        ctrl.editing = false;
        ctrl.adding = false;

        ctrl.cancel = () => ctrl.editing = false;

        ctrl.save = () => {
            ctrl.adding = true;
            ctrl.newLease.mediaId = ctrl.image.data.id;
            ctrl.newLease.createdAt = new Date();
            leaseService.add(ctrl.image, ctrl.newLease)
                .then((lease) => {
                    ctrl.getLeases();
                    ctrl.adding = false;
                    ctrl.editing = false;
                    ctrl.resetLeaseForm();
                })
                .catch(() =>
                    alertFailed('Something went wrong when saving, please try again!')
                );
        }


        ctrl.getLeases = () => {
            const leases$ = leaseService.get(ctrl.image)
                .map((leasesResponse) => leasesResponse.data)
                .map((leasesWrapper) => leasesWrapper.leases);

            inject$($scope, leases$, ctrl, 'leases');
        }

        ctrl.deleteAll = () => {
            leaseService.deleteAll(ctrl.image)
                .then(ctrl.getLeases())
                .catch(
                    () => alertFailed('Something when wrong when deleting, please try again!')
                )

        }


        ctrl.updatePermissions = () => {
            leaseService.canUserEdit(ctrl.image).then(editable => {
                ctrl.userCanEdit = editable;
            });
        }

        ctrl.displayLease = (lease) => {
            if (lease) {
                const access = !!lease.access.match(/deny/i) ? "Denied" : "Allowed";
                let displayString = `${access}`

                if(lease.startDate){
                    displayString += ` after ${lease.startDate.split(":")[0]}`
                }

                if(lease.startDate && lease.endDate){
                    displayString += ` and`
                }

                if(lease.endDate){
                    displayString += ` before ${lease.endDate.split(":")[0]}`
                }

                return displayString
            }
        }

        ctrl.resetLeaseForm = () =>
            ctrl.newLease = {
                mediaId: null,
                createdAt: null,
                startDate: new Date(),
                endDate: new Date(),
                access: null
        }

        ctrl.leaseStatus = (lease) => {
            const active = lease.active ? "active " : " "
            if (lease.access.match(/allow/i)) return active + "allowed";
            if (lease.access.match(/deny/i)) return active + "denied";
        }

        function alertFailed(message) {
            $window.alert(message);
            ctrl.adding = false;
        }

        ctrl.resetLeaseForm();
        ctrl.updatePermissions();
        ctrl.getLeases();
}]);



leases.directive('grLeases', [function() {
    return {
        restrict: 'E',
        controller: 'LeasesCtrl',
        controllerAs: 'ctrl',
        bindToController: true,
        template: template,
        scope: {
            image: '=grImage',
            grSmall: '=?',
            onCancel: '&?grOnCancel',
            onSave: '&?grOnSave'
        }
    };
}]);