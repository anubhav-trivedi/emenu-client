// ****************************************
//  This will give spaces after an item for KOT printing
//  Space will be given based on the length of word
// ****************************************

angular.module('mk.Filters')
    .filter('spacer', function () {
        return function(text) {
            if(text.indexOf("\n") != -1) {
                var splitText = text.split("\n");
                var spaces = 45 - splitText[1].length;
                for(var i=0; i<spaces ;i++) {
                    if(i%3 == 0 && i < spaces - 1) {
                        text += ".";
                    } else {
                        text += " ";
                    }
                }
            } else {
                var spaces = 43 - text.length;
                for(var i=0; i<spaces ;i++) {
                    if(i%3 == 0 && i < spaces - 1) {
                        text += ".";
                    } else {
                        text += " ";
                    }
                }
            }
            return text;
        }
    });
