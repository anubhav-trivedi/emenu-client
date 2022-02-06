describe('mk.Filters', function() {

    describe('mk.Group', function() {

        beforeEach(module('mk.Filters'));

        it('splits an array up into groups', inject(['mk.GroupFilter', function(group) {
            expect(group([1, 2, 3, 4, 5], 1)).toEqual([[1],[2], [3], [4], [5]]);
            expect(group([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
            expect(group([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
        }]));

    })
});