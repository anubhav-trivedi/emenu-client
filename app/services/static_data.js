'use strict';

angular.module('yoMenu.Services')
    .factory('staticData', function() {
        return {items:[
            createItem('1','Red Lamp', 20.5, 'Lighting', 'Downlights'),
            createItem('2','Night Lamp', 20.5, 'Lighting', 'Hanging Lights'),
            createItem('3','Sofa set', 20.5, 'Furniture', 'Living Room')
        ]};


        function createItem(id,name, price, category, subCategory) {
            return {id: id, name: name, price: price, category: category, subCategory: subCategory};
        }

    });
