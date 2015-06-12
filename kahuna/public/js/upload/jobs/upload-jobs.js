import angular from 'angular';
import template from './upload-jobs.html!text';
import '../../preview/image';
import '../../analytics/track';

export var jobs = angular.module('kahuna.upload.jobs', ['kahuna.preview.image']);


jobs.controller('UploadJobsCtrl',
                ['$scope', 'poll', 'track', function($scope, poll, track) {

    var ctrl = this;

    // State machine-esque async transitions
    var pollFrequency = 500; // ms
    var pollTimeout   = 20 * 1000; // ms
    var eventName = 'Image upload';

    ctrl.jobs.forEach(jobItem => {
        jobItem.status = 'uploading';

        track.startTimerFor(eventName);

        jobItem.resourcePromise.then(resource => {
            jobItem.status = 'indexing';
            jobItem.resource = resource;

            // TODO: grouped polling for all resources we're interested in?
            var findImage = () => resource.get();
            var imageResource = poll(findImage, pollFrequency, pollTimeout);

            imageResource.then(image => {
                jobItem.status = 'uploaded';
                jobItem.image = image;
                jobItem.thumbnail = image.data.thumbnail;

                track.success(eventName, config = { timed: true });
            }, error => {
                jobItem.status = 'upload error';
                jobItem.error = error.message;

                track.failure(eventName, { failedOn: 'index' }, { timed: true });
            });
        }, error => {
            var message = error.body && error.body.errorMessage || 'unknown';
            jobItem.status = 'upload error';
            jobItem.error = message;

            track.failure(eventName, { failedOn: 'upload' }, { timed: true });
        });
    });

    // this needs to be a function due to the stateful `jobItem`
    ctrl.jobImages = () => ctrl.jobs.map(jobItem => jobItem.image);

    $scope.$on('$destroy', () => track.endTimerFor(eventName));

}]);


jobs.directive('uiUploadJobs', [function() {
    return {
        restrict: 'E',
        scope: {
            // Annoying that we can't make a uni-directional binding
            // as we don't really want to modify the original
            jobs: '='
        },
        controller: 'UploadJobsCtrl',
        controllerAs: 'ctrl',
        bindToController: true,
        template: template
    };
}]);
