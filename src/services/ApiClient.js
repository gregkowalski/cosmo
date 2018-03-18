import apigClientFactory from 'aws-api-gateway-client'
import moment from 'moment'
import CognitoUtil from './Cognito/CognitoUtil'
import Config from '../Config'

class ApiClient {

    apiGatewayClient;

    constructor() {
        var config = {
            region: Config.Api.Region,
            invokeUrl: Config.Api.BaseUrl,
        };
        this.apiGatewayClient = apigClientFactory.newClient(config);
    }

    jsonHttpHeader(jwt) {
        if (!jwt) {
            jwt = CognitoUtil.getLoggedInUserJwtToken();
        }
        let headers = {
            'Content-Type': 'application/json'
        };
        if (jwt) {
            headers.Authorization = jwt;
        }
        return headers;
    }

    createFoodOrder(jwt, order) {
        return this.apiGatewayClient.invokeApi(null, '/orders', 'POST',
            { headers: this.jsonHttpHeader(jwt) }, order);
    }

    confirmFoodOrder(jwt, order_id) {
        return this.apiGatewayClient.invokeApi(null, `/orders/${order_id}/confirm`, 'POST',
            { headers: this.jsonHttpHeader(jwt) });
    }

    updateUser(jwt, user) {
        return this.apiGatewayClient.invokeApi(null, '/users', 'PUT',
            { headers: this.jsonHttpHeader(jwt) }, user);
    }

    linkUser(jwt, user) {
        return this.apiGatewayClient.invokeApi(null, '/users', 'PATCH',
            { headers: this.jsonHttpHeader(jwt) }, user);
    }

    getUserByJsUserId(jsUserId) {
        return this.apiGatewayClient.invokeApi(null, `/users?js_user_id=${jsUserId}`, 'GET',
            { headers: this.jsonHttpHeader() });
    }

    getCurrentUser() {
        const userId = CognitoUtil.getLoggedInUserId();
        if (!userId) {
            throw new Error('No user is currently logged in');
        }
        return this.apiGatewayClient.invokeApi(null, `/users/${userId}`, 'GET',
            { headers: this.jsonHttpHeader() });
    }

    getUser(userId) {
        return this.apiGatewayClient.invokeApi(null, `/users/${userId}`, 'GET',
            { headers: this.jsonHttpHeader() });
    }

    getPublicUser(userId) {
        return this.apiGatewayClient.invokeApi(null, `/users/${userId}/public`, 'GET');
    }

    getFoods() {
        return this.apiGatewayClient.invokeApi(null, `/foods`, 'GET');
    }

    getFood(foodId) {
        return this.apiGatewayClient.invokeApi(null, `/foods/${foodId}`, 'GET');
    }

    getReviews() {
        return this.apiGatewayClient.invokeApi(null, `/reviews`, 'GET');
    }

    getReview(reviewId) {
        return this.apiGatewayClient.invokeApi(null, `/foods/${reviewId}`, 'GET');
    }

    loadUserProfile(userId) {
        return this.apiGatewayClient.invokeApi(null, `/users/${userId}/private`, 'GET', { headers: this.jsonHttpHeader() });
    }

    saveUserProfile(user) {
        return this.apiGatewayClient.invokeApi(null, `/users/${user.user_id}/private`, 'PATCH', { headers: this.jsonHttpHeader() }, user);
    }

    connectStripeAccount(code) {
        const userId = CognitoUtil.getLoggedInUserId();
        if (!userId) {
            throw new Error('No user is currently logged in');
        }
        return this.apiGatewayClient.invokeApi(null, `/users/${userId}/connectstripe`, 'POST',
            { headers: this.jsonHttpHeader() }, { code });
    }

    geoSearchFoods(geo) {
        return this.apiGatewayClient.invokeApi(null, `/foods/geo?ne_lat=${geo.ne_lat}&ne_lng=${geo.ne_lng}&sw_lat=${geo.sw_lat}&sw_lng=${geo.sw_lng}`,
            'GET', { headers: this.jsonHttpHeader() });
    }

    getOrdersByBuyerId(buyer_user_id) {
        // return this.apiGatewayClient.invokeApi(null, `/buyers/${buyer_user_id}/orders`,
        //     'GET', { headers: this.jsonHttpHeader() });

        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve({ data: buyerOrders });
            }, 1000);
        })
    }

    getOrdersByCookId(cook_user_id) {
        // return this.apiGatewayClient.invokeApi(null, `/cooks/${cook_user_id}/orders`,
        //     'GET', { headers: this.jsonHttpHeader() });

        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve({ data: buyerOrders });
            }, 1000);
        })
    }
}

const buyerOrders = [{
    order_id: 'XSJFSQOEO',
    food_id: '80257a30-07cd-11e8-93ae-7d25d44321f0',
    pickup: true,
    date: moment('2018-03-20'),
    time: '3 - 5 PM',
    quantity: 3,
    status: 'Pending',
    address: '1265 Burnaby Street, Vancouver, BC',
    food: {
        title: 'Pork + Chive Dumplings',
        imageUrls: ['/assets/images/Johanndumplings.jpg'],
        price: 8,
    },
    cook: {
        name: 'Johann',
        image: '/assets/images/users/johannk.jpg',
        email: 'johann@kao.com'
    }
},
{
    order_id: 'AABXOSKSJK2',
    food_id: '802b1f80-07cd-11e8-8562-b5cca42ec0d7',
    pickup: true,
    date: moment('2018-03-15'),
    time: '6 - 8 PM',
    quantity: 1,
    status: 'Accepted',
    address: '459 Ailsa Avenue, Port Moody, BC',
    food: {
        title: 'Casserole',
        imageUrls: ['/assets/images/HollyC_baconcasserole.jpg'],
        price: 15,
    },
    cook: {
        name: 'Molly',
        image: '/assets/images/users/molly.png',
        email: 'molly@work.com'
    }
},
{
    order_id: 'LKJWEN4KLOJ',
    food_id: '80283950-07cd-11e8-a3a6-cd45bd5ea586',
    pickup: false,
    date: moment('2018-04-20'),
    time: '6 - 8 PM',
    quantity: 5,
    status: 'Rejected',
    address: '123 Davie St., Vancouver, BC',
    food: {
        title: 'Smoked Beer Can Chicken',
        imageUrls: ['/assets/images/GabeC_SmokedChicken_BeerCan_600x410.jpg'],
        price: 25,
    },
    cook: {
        name: 'Steve',
        image: '/assets/images/users/steve.jpg',
        email: 'steve@work.com'
    }
}
]

export default new ApiClient();