angular.module('mk.Directives')
    .directive('mkStars', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var expression = attrs['mkStars'],
                    $stars = element.children().children();

                scope.$watch(expression, function(rating) {
                    $stars.removeClass('full half empty');
                    for (var i = 0; i < $stars.length; ++i) {
                        var $star = angular.element($stars[i]),
                            starRating = i + 1;

                        if (starRating <= rating) {
                            $star.addClass('full');
                        } else if (starRating - 1 < rating) {
                            $star.addClass('half');
                        } else {
                            $star.addClass('empty');
                        }
                    }
                });

                if (!attrs.readonly) {
                    $stars.bind('click', function(event) {
                        var rating = $(this).attr('rating');
                        scope.$apply(expression + " = " + rating);
                    });

                }
            },
            template: "<div class='mk-stars'>" +
                "<div class='star' rating='1'></div>" +
                "<div class='star' rating='2'></div>" +
                "<div class='star' rating='3'></div>" +
                "<div class='star' rating='4'></div>" +
                "<div class='star' rating='5'></div>" +
                "</div>"
        }
    });