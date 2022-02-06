mk.widget('netPromoterScore', function() {
    return {
        title: 'Net Promoter Score',
        process: function(data) {
            return {
                score: Math.round(data.score),
                detractors: Math.round(data.detractors / data.total * 100),
                passives: Math.round(data.passives / data.total * 100),
                promoters: Math.round(data.promoters / data.total * 100)
            };
        }
    }
});