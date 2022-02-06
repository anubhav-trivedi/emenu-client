// ****************************************
//  This will filter category and sub-category
//  They would appear as heading
// ****************************************

angular.module('mk.Filters')
    .filter('createHeader', function () {
        return function(header) {
            if(header != localStorage.category) {
                localStorage.category = header;
                return header;
            } else
                return null;
        }
    });
