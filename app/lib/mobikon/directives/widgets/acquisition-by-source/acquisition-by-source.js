mk.widget('acquisitionBySource', function() {

    var colors = [
        '#79d789', // feedback
        '#ff7964', // concierge
        '#a3e8ff', // email
        '#303030', // sms
        '#f6bd0b', // web
        '#ab3862' // manual
    ];

    return {
        controller: function($scope, $element, data) {
            var sources = [],
                i = 0;
            _.each(data, function(count, source) {
                if (source.split(' ').length == 1) {
                    sources.push({source: source.toLowerCase(), count: count, color: colors[i % colors.length]});
                    ++i;
                }
            });
            $scope.data = {sourceGroups: group(sources, 3) };

            var chart = new AmCharts.AmPieChart();
            _.extend(chart, {
                dataProvider: sources,
                titleField: 'source',
                valueField: 'count',
                colorField: 'color',
                labelsEnabled: false
            });
            chart.write($element.find('chart')[0]);
        }
    };

    function group(array, groupSize) {
        return _.groupBy(array, function(val, index) {
            return Math.floor(index / groupSize);
        });
    }

});