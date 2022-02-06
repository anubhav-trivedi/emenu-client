angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Order');
    })
    .factory('Order', function(Model) {
        return Model(
        {
            init: function() {
                this.initialize('Order');
            }
        },
        {
            getTotalWithOutTax: function() {
                return this.getTotal({tax: false, discount: false, minimum: false});
            },

            getMinimum: function() {
                return this.BillAmount; // specific to Evorich
            },

            getTotal: function(options) {
                options = _.defaults(options || {}, {tax: true, discount: true, minimum: true});
                var minOrderAmount = this.getMinimum() || null,
                    tax = +this.Tax || 0,
                    orderTotal = 0;

                for (var i = 0; i < this.OrderItems.length; i++) {
                    var orderItem = this.OrderItems[i],
                        price = orderItem.TotalPrice != null ?
                            +orderItem.TotalPrice :
                            (orderItem.Item.Price * orderItem.Quantity);

                    orderTotal += price;
                }

                if (options.discount && this.Discount) orderTotal -= this.Discount;
                if (options.minimum && minOrderAmount) orderTotal = Math.max(orderTotal, minOrderAmount);
                if (options.tax && tax) orderTotal *= (1 + tax);

                return orderTotal;
            },

            getTax: function() {
                var tax = +this.Tax || 0;
                return this.getTotal({tax: false}) * tax;
            },

            getBalance: function() {
                return this.getTotal() - (this.AmountPaid || 0);
            },

            getOrderItemForItem: function(item) {
                return _.find(this.OrderItems, function(orderItem) {
                    return orderItem.ItemId == item.id;
                }) || null;
            },

            save: function() {
                var deletions = deletedOrderItems(this);
                // to fix a bug on the server that wasn't saving order items with count 0
                _.forEach(deletions, function(deleted) {
                    deleted.entityAspect.rejectChanges();
                    deleted.entityAspect.setDeleted();
                });
                var deliveryAddress = this.deliveryAddress ? [this.deliveryAddress] : [],
                    toSave = _.union([this], this.OrderItems, deletions, deliveryAddress);
                return this.constructor.mkData.saveChanges(toSave);
            },

            isDirty: function() {
                return Model.prototype.isDirty.call(this) ||
                    !!_.find(this.orderItems, function(oi) { return oi.isDirty() }) ||
                    deletedOrderItems(this).length > 0;
            },

            getSaveDescription: function() {
                //todo i18ns
                return "Saving order for {{customer.name}}";
            }
        });

        function deletedOrderItems(self) {
            var deleted = self.constructor.mkData.manager.getEntities('OrderItem', breeze.EntityState.Deleted);
            return _.filter(deleted, function() {
                return deleted.orderId = self.id;
            })
        }
    });