import { Constants } from '../Constants'

class PriceCalc {

    getTotal(unitPrice, quantity) {
        let total = quantity * unitPrice;
        return parseFloat(total.toFixed(1), 10);
    }

    getPrice(unitPrice, quantity) {
        if (!quantity) {
            quantity = 1;
        }

        return this.getTotal(unitPrice, quantity);
    }

    getPaymentAmount(food, quantity, pickup) {
        const price = this.getTotalPrice(food, quantity, pickup);
        return price * 100;
    }

    getTotalOrderPrice(order) {
        return this.getTotalPrice(order.food, order.quantity, order.pickup);
    }

    getTotalPrice(food, quantity, pickup) {
        let total = this.getTotal(food.price, quantity);
        if (!pickup) {
            total += Constants.DeliveryFee;
        }
        return total;
    }
}

export default new PriceCalc();