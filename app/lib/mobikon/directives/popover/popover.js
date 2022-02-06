'use strict';

/**
 * Creates a popover.
 * Usage example:
 *  <mk-popover open="isOpen">
 *      <ul>
 *          <li><a href="">Item1</a></li>
 *          <li><a href="">Item2</a></li>
 *      </ul>
 *  </mk-popover>
 */
angular.module('mk.Directives')
    .directive('mkPopover', function() {

        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'lib/mobikon/directives/popover/popover.html',
            scope: {
                open: '='
            }
        }
    });
