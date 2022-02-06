angular.module('mk.Directives')
    .directive('mkSwipe', function(){
        return {
            restrict:'AE',
            link: function(scope, element){
                var swipe = new Swipe(element.children()[0], {
                    startSlide: 0,
                    speed: 400,
                    auto: false,
                    continuous: true,
                    disableScroll: false,
                    stopPropagation: false
                });

                scope.$on('$destroy', function() {
                    swipe.kill();
                })
            },
            template: "<div class='swipe'> " +
                    "<div class='swipe-wrap' ng-transclude></div>" +
                "</div>",
            transclude:true,
            scope:{
                callback: '&',
                next:'=',
                prev:'='
            }
    }
});