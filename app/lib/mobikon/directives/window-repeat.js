angular.module('mk.Directives').directive("mkWindowRepeat", function($rootScope) {
    return {
        transclude: 'element',
        priority: 1000,
        terminal: true,
        compile: function(element, attr, linker) {
            return function($scope, $element, $attr){
                var container = getContainer($element),
                    options = $scope.$eval(container.attr("mk-fast-repeat-container")),
                    rowHeight = options.rowHeight,
                    containerHeight,
                    expression = $attr.mkFastRepeat,
                    lastCollection,
                    match = expression.match(/^\s*(.+)\s+in\s+(.*?)$/),
                    blockArray = [],
                    topSpacer = angular.element("<div>"),
                    bottomSpacer = angular.element("<div>"),
                    lhs, rhs, valueIdentifier, scroller, scrollTop = 0;

                if (!match) {
                    throw Error("Expected mkFastRepeat in form of '_item_ in _collection_' but got '" +
                        expression + "'.");
                }

                lhs = match[1];
                rhs = match[2];

                match = lhs.match(/^([\$\w]+)$/);
                if (!match) {
                    throw Error("'item' in 'item in collection' should be identifier but got '" +
                        lhs + "'.");
                }
                valueIdentifier = match[3] || match[1];

                $element.after(topSpacer);
                $element.parent().append(bottomSpacer);

                $scope.$watchCollection(rhs, function mkFastRepeatAction(collection) {
                    lastCollection = collection; // memory leak?
                    for (var i = 0; i < blockArray.length; ++i) {
                        removeBlock(blockArray[i]);
                    }
                    blockArray = [];
                    if (scroller) scroller.refresh();
                    createViewport();
                });

                if (IScroll) {
                    scroller = new IScroll(container[0], { probeType: 3, mouseWheel: true });
                    scroller.on('scroll', updatePosition);
                    scroller.on('scrollEnd', updatePosition);

                    function updatePosition() {
                        scrollTop = -this.y;
                        createViewport();
                        $rootScope.$apply();
                    }

                } else {
                    container.bind('scroll', function() {
                        scrollTop = container[0].scrollTop;
                        createViewport();
                        $rootScope.$apply();
                    });
                }


                function createViewport() {
                    if (!containerHeight) {
                        containerHeight = container[0].clientHeight;
                    }

                    if (!containerHeight || !lastCollection) return;

                    var length = lastCollection.length,
                        visibleRows = Math.ceil(containerHeight / rowHeight),
                        startIndex = Math.min(Math.floor(scrollTop / rowHeight), length - 1),
                        bottomIndex = Math.min(startIndex + visibleRows, length - 1),
                        paddingTop = startIndex * rowHeight,
                        paddingBottom = (lastCollection.length - bottomIndex) * rowHeight,
                        block, diff;

                    while (blockArray.length && (block = blockArray[0], diff = block.index - startIndex)) {
                        if (diff < 0) { // block.index < startIndex
                            removeBlock(block);
                            blockArray.shift();
                        } else { // block.index > startIndex
                            blockArray.unshift(createBlock(topSpacer, block.index - 1))
                        }
                    }

                    if (!blockArray.length) {
                        blockArray.unshift(createBlock(topSpacer, startIndex));
                    }

                    var last = blockArray.length - 1;

                    while ((block = blockArray[last], diff = block.index - bottomIndex)) {
                        if (diff < 0) {
                            blockArray.push(createBlock(block.element, block.index + 1));
                            last++;
                        } else {
                            removeBlock(block);
                            blockArray.pop();
                            last--;
                        }
                    }

                    topSpacer[0].style.height = paddingTop + "px";
                    bottomSpacer[0].style.height = paddingBottom + "px";
                }

                function createBlock(cursor, index) {
                    var value = lastCollection[index],
                        length = lastCollection.length,
                        childScope = $scope.$new(),
                        block = {};

                    childScope[valueIdentifier] = value;
                    childScope.$index = index;
                    childScope.$first = (index === 0);
                    childScope.$last = (index === (length - 1));
                    childScope.$middle = !(childScope.$first || childScope.$last);


                    linker(childScope, function(clone) {
                        cursor.after(clone);
                        block.scope = childScope;
                        block.element = clone;
                        block.index = index;
                    });

                    return block;
                }

                function removeBlock(block) {
                    block.element.remove();
                    block.scope.$destroy();
                }
            };
        }
    };

    function getContainer(element) {
        while (element.length && element.attr("mk-fast-repeat-container") == null) {
            element = element.parent();
        }
        return element;
    }
});