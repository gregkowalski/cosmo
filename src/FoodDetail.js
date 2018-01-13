import React, { Component } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import './FoodDetail.css'
import { Button, Image, Icon, Rating, Segment, Popup } from 'semantic-ui-react'
import { Grid, Header, Divider, Feed, Form, Input, Modal } from 'semantic-ui-react'
import FoodItems from './data/FoodItems'
import Users from './data/Users'
import Reviews from './data/Reviews'
import Scroll from 'react-scroll'; // Imports all Mixins
import AppHeader from './components/AppHeader'
import FoodLightbox from './components/FoodLightbox'
import Util from './Util'
import ShowMore from 'react-show-more'
import { Constants } from './Constants'
import FlagListing from './components/FlagListing'
import FlagListingMobile from './components/FlagListingMobile'
import CognitoUtil from './Cognito/CognitoUtil'
import { FeatureToggles } from './FeatureToggles';
import ApiClient from './Api/ApiClient'
import PriceCalc from './PriceCalc'

var ScrollLink = Scroll.Link;
var ScrollElement = Scroll.Element;

export default class FoodDetail extends Component {
    state = {
        quantity: 1,
        hasErrors: {},
        openConfirmUserDesktop: false,
        openConfirmUserMobile: false,
    };
    isLoggedIn;
    cook;
    food;

    handleChange = (e, { value }) => this.setState({ value })

    getFoodItemId() {
        return parseInt(this.props.match.params.id, 10);
    }

    getFoodItem() {
        let foodItemId = this.getFoodItemId();
        return FoodItems.find(x => x.id === foodItemId);
    }

    componentWillMount() {
        this.food = this.getFoodItem();
        document.title = this.food.header;

        let quantity = window.sessionStorage.getItem('quantity');
        if (quantity) {
            this.setState({ quantity: quantity });
        }

        this.isLoggedIn = CognitoUtil.isLoggedIn();

        if (!FeatureToggles.DynamoUsers) {
            this.cook = Users.find(x => x.id === this.food.userId);
        }
        else {
            let apiClient = new ApiClient();
            apiClient.getUserByJsUserId(this.food.userId)
                .then(response => {
                    this.cook = response.data;
                    this.setState(this.state);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }

    quantityChanged(newQuantity) {
        let foodItemId = this.getFoodItemId();
        let key = 'foodItemQuantity-' + foodItemId;

        window.sessionStorage.setItem(key, newQuantity);
    }

    handleQuantityChange(min, max, newValue) {
        if (newValue.length === 0) {
            this.setState({ quantity: newValue }, () => this.validateField('quantity', newValue));
            return;
        }
        let newQuantity = parseInt(newValue, 10);
        if (!newQuantity || isNaN(newQuantity) || newQuantity < min || newQuantity > max)
            return;

        this.setState({ quantity: newQuantity }, () => this.validateField('quantity', newQuantity));

        this.quantityChanged(newQuantity);
    };

    handleClickQuantityChange(min, max, delta) {
        var quantity = this.state.quantity;
        if (quantity.length === 0) {
            quantity = 0;
        }
        let change = (delta > 0) ? 1 : -1;
        let newQuantity = quantity + change;
        if (newQuantity < min || newQuantity > max)
            return;

        let newState = { quantity: newQuantity };
        this.setState(newState, () => this.validateField('quantity', newQuantity));

        this.quantityChanged(newQuantity);
    }

    handleQuantityInputBlur(e) {
        console.log('blurQuantity');
        if (e.target.value === "") {
            this.setState({ quantity: 1 });
        }
    }

    validateField(fieldName, fieldValue) {
        if (!fieldValue) {
            fieldValue = this.state[fieldName];
        }

        // let hasBlurred = this.state.hasBlurred;
        let state = this.state;

        let hasErrors = {};

        switch (fieldName) {
            case 'quantity':
                hasErrors.quantity = false;
                if (!state.quantity || state.quantity < 1 || state.quantity > Constants.MaxFoodQuantity) {
                    hasErrors.quantity = true;
                }
                break;

            default:
                break;
        }

        hasErrors = Object.assign(this.state.hasErrors, hasErrors);
        this.setState({ hasErrors });
    }

    getFoodPrepSafetyMessage(food) {
        let prep;
        if (food.prep === 'frozen') {
            prep = (<span><Icon color='teal' name='angle double right' />
                Frozen products must be fully cooked for food safety and quality.</span>)
        }
        else if (food.prep === 'cooked') {
            prep = (<span><Icon color='teal' name='angle double right' />
                Store your food properly: keep cold food cold and hot food hot!</span>)
        }
        return prep;
    }

    handleOrderConfirmUserLogin(food) {
        this.setState({ open: false });
        CognitoUtil.setLastPathname(this.getOrderPageUrl(food));
        CognitoUtil.redirectToLogin();
    }

    handleOrderConfirmUserSignup(food) {
        this.setState({ open: false });
        CognitoUtil.setLastPathname(this.getOrderPageUrl(food));
        CognitoUtil.redirectToSignup();
    }

    getOrderPageUrl(food) {
        //return '/foods/' + food.id + '/order';
        return `/foods/${food.id}/order`;
    }

    getRequestOrderButtonDesktop(food) {
        let orderButton;
        if (this.isLoggedIn) {
            orderButton = (
                <RouterLink to={this.getOrderPageUrl(food)}>
                    <Button animated='fade' fluid className='detail-desktop-button'>
                        <Button.Content visible>
                            Request an Order
                        </Button.Content>
                        <Button.Content hidden>
                            ${PriceCalc.getTotal(food.price, this.state.quantity)} CAD
                        </Button.Content>
                    </Button>
                </RouterLink>
            );
        }
        else {
            orderButton = (
                <div>
                    <Button animated='fade' fluid className='detail-desktop-button'
                        onClick={() => this.setState({ openConfirmUserDesktop: true })}>
                        <Button.Content visible>
                            Request an Order
                        </Button.Content>
                        <Button.Content hidden>
                            ${PriceCalc.getTotal(food.price, this.state.quantity)} CAD
                        </Button.Content>
                    </Button>
                    <Modal style={{ textAlign: 'center' }} dimmer='inverted' size='tiny' open={this.state.openConfirmUserDesktop} onClose={() => this.setState({ openConfirmUserDesktop: false })}>
                        <Modal.Header className='order-confirm-user-header-desktop'>
                            <Image style={{ display: 'inline', marginLeft: '4%' }} height='32px' src={Constants.AppLogo} />
                            <span style={{ marginLeft: '15px' }}>Please log in or sign up to check out</span>
                        </Modal.Header>
                        <Modal.Content className='order-confirm-user-msg'>
                            We need a valid email to complete your food order.
                        </Modal.Content>
                        <Modal.Actions className='order-confirm-button-spacing'>
                            <Button
                                className='order-confirm-user-cancel-button'
                                floated='left'
                                content="Go Back"
                                onClick={() => this.setState({ openConfirmUserDesktop: false })} />
                            <Button
                                className='order-confirm-user-signup-button'
                                content="Sign Up"

                                onClick={() => this.handleOrderConfirmUserSignup(food)} />
                            <Button
                                className='order-confirm-user-login-button'
                                content="Log In"
                                onClick={() => this.handleOrderConfirmUserLogin(food)} />
                        </Modal.Actions>
                    </Modal>
                </div>
            );
        }
        return orderButton;
    }

    getRequestOrderButtonMobile(food) {
        let orderButton;
        if (this.isLoggedIn) {
            orderButton = (
                <RouterLink to={'/foods/' + this.getFoodItemId() + '/order'}>
                    <Button className='detail-footer-button'>Request an Order</Button>
                </RouterLink>
            );
        }
        else {
            orderButton = (
                <div>
                    <Button
                        className='detail-footer-button'
                        onClick={() => this.setState({ openConfirmUserMobile: true })}>
                        Request an Order
                    </Button>
                    <Modal
                        dimmer='inverted'
                        size='tiny'
                        open={this.state.openConfirmUserMobile}
                        onClose={() => this.setState({ openConfirmUserMobile: false })}>
                        <Modal.Header className='order-confirm-user-header-mobile' >
                            <Image style={{ float: 'left', marginTop: '12px' }} height='32px' src={Constants.AppLogo} />
                            <div style={{ float: 'right', marginLeft: '10px' }}>Please log in or sign up to check out</div>
                            <div style={{ clear: 'both' }} />
                        </Modal.Header>
                        <Modal.Content className='order-confirm-user-msg'>
                            We need a valid email to complete your food order.
                        </Modal.Content>
                        <Modal.Actions className='order-confirm-button-spacing'>
                            <Button
                                className='order-confirm-user-signup-button'
                                content="Sign Up"

                                onClick={() => this.handleOrderConfirmUserSignup(food)} />
                            <Button
                                className='order-confirm-user-login-button'
                                content="Log In"
                                onClick={() => this.handleOrderConfirmUserLogin(food)} />
                        </Modal.Actions>
                    </Modal>
                </div>
            );
        }
        return orderButton;
    }

    render() {

        let food = this.food;
        let reviews = Reviews
            .filter(x => x.foodItemId === food.id);

        reviews = reviews
            .map(x => (
                <div key={x.id}>
                    <Feed>
                        <Feed.Event>
                            <Feed.Content>
                                <Image src={x.image} size='mini' floated='left' shape='circular' />
                                <div style={{ float: 'right', color: '#5e5d5d' }}>
                                    <a href="url" style={{ color: '#5e5d5d' }}> <Icon name='flag outline' /></a></div>
                                <Feed.Summary className='detail-body-text'>{x.summary} </Feed.Summary>
                                <Feed.Date content={x.date} style={{ fontFamily: 'Athiti', fontSize: '1.1em', fontWeight: '600', marginTop: '-1px' }} />
                                <Feed.Extra style={{ marginTop: '0.8em', maxWidth: '100%' }} >
                                    <div className='detail-body-text'>
                                        <ShowMore
                                            lines={4}
                                            more={<div style={{ color: '#189da7' }}>Read more</div>}
                                            less=''>
                                            {x.extraText}
                                        </ShowMore>
                                    </div>
                                </Feed.Extra>
                            </Feed.Content>
                        </Feed.Event>
                    </Feed>
                    <Divider section />
                </div>
            ));

        let prep = this.getFoodPrepSafetyMessage(food);
        let foodPrepIcon = Util.getFoodPrepTypeIcon(food);

        let deliveryElement;
        if (food.delivery) {
            deliveryElement =
                <span><Icon name='shipping' /> delivery</span>
        }

        let pickupElement;
        if (food.pickup) {
            pickupElement =
                <span><Icon name='hand rock' />pick-up</span>
        }

        const content = (
            <div className='detail-content'>

                <ScrollElement name="overview">

                    <Header className='detail-main-header' as='h2'>
                        ${PriceCalc.getTotal(food.price, this.state.quantity)} · {food.header}</Header>
                    <div style={{ display: 'inline-block', verticalAlign: 'middle', color: '#4e4e4e', marginTop: '10px', fontSize: '1.1em' }}>
                        locally handcrafted by
                        <ScrollLink className="author-link" to="cook"
                            spy={true} smooth={true} container={document}
                            offset={-85} duration={500}>
                            {this.cook ? this.cook.name : '...'}
                        </ScrollLink>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                    <div style={{ color: '#5e5d5d', marginTop: '20px' }}>
                        <Grid doubling columns={5}  >
                            <Grid.Row>
                                <Grid.Column>
                                    <Icon name={foodPrepIcon} /> {food.prep}
                                </Grid.Column>
                                <Grid.Column>
                                    {deliveryElement}
                                </Grid.Column>
                                <Grid.Column>
                                    {pickupElement}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>

                    <Header as='h3' className='food-detail-header'>The Food</Header>
                    <div className='detail-body-text'>
                        <ShowMore
                            lines={3}
                            more={<div style={{ color: '#189da7' }}>Read more about this food <Icon name='angle down' /></div>}
                            less={<div style={{ color: '#189da7' }}>Hide <Icon name='angle up' /></div>}
                            anchorClass='showmore-text'>

                            <div className='user-text'>{food.description} </div>
                            <div>{food.moreDescription}</div>
                        </ShowMore>  </div>
                    <Divider section />

                    <Header as='h3' className='food-detail-header'>Ingredients</Header>
                    <div className='detail-body-text'>{food.meta}.</div>

                    <Divider section />

                    <Header as='h3' className='food-detail-header'>Allergy Information</Header>
                    <div className='detail-body-text'>
                        <div className='user-text'>
                            <div style={{ fontWeight: '600' }} >
                                May contain one or more of the following allergens: </div>
                        </div>
                        <div style={{ marginLeft: '15px', marginTop: '15px' }}>{food.allergy}.</div>
                        <div style={{ marginTop: '15px' }}>
                            <Icon color='teal' name='angle double right' />For any questions regarding allergens or other specific contents, please contact your neighbourhood cook directly.
                            </div>
                    </div>
                    <Divider section />

                    <Header as='h3' className='food-detail-header'>Prep + Storage</Header>
                    <div className='detail-body-text'>
                        <ShowMore
                            more={<div style={{ color: '#189da7' }}>Get more details <Icon name='angle down' /></div>}
                            less={<div style={{ color: '#189da7' }}>Hide <Icon name='angle up' /></div>}
                            anchorClass='showmore-text'>
                            <div className='user-text'>
                                {food.instruction}
                            </div>
                        </ShowMore>
                        <div style={{ marginTop: '15px' }}>{prep}</div>
                    </div>
                    <Divider section />

                    <Header as='h3' className='food-detail-header'>Bite Sizes</Header>
                    <div className='detail-body-text'><span style={{ fontWeight: '600' }}>{food.unit} </span> per order.  Feeds approximately {food.feed} people. </div>
                    <Divider section />

                    <Header as='h3' className='food-detail-header'>Special Features</Header>
                    <div className='detail-body-text'>{food.feat}</div>
                    <Divider section />
                </ScrollElement>
                <FlagListingMobile />

                <ScrollElement name="reviews">
                    <Header className='detail-sub-header' as='h2'>
                        <div style={{ display: 'flex', marginTop: '2px', marginBottom: '10px' }}>
                            {food.ratingCount} Reviews
                                    <Rating disabled={true} maxRating={5} rating={food.rating} size='huge'
                                style={{ marginTop: '10px', marginLeft: '14px' }} />
                        </div>
                    </Header>
                    <Divider section />

                    <Grid stackable columns={2}>
                        <Grid.Row>
                            <Grid.Column className='detail-rating'>
                                <span className='detail-rating-label'>Accuracy</span>
                                <Rating className='detail-rating-stars' disabled={true} maxRating={5} rating={food.rating} />
                            </Grid.Column>
                            <Grid.Column className='detail-rating'>
                                <span className='detail-rating-label'>Quality</span>
                                <Rating className='detail-rating-stars' disabled={true} maxRating={5} rating={food.rating} />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column className='detail-rating'>
                                <span className='detail-rating-label'>Communication</span>
                                <Rating className='detail-rating-stars' disabled={true} maxRating={5} rating={food.rating} />
                            </Grid.Column>
                            <Grid.Column className='detail-rating'>
                                <span className='detail-rating-label'>Taste</span>
                                <Rating className='detail-rating-stars' disabled={true} maxRating={5} rating={food.rating} />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column className='detail-rating'>
                                <span className='detail-rating-label'>Freshness</span>
                                <Rating className='detail-rating-stars' disabled={true} maxRating={5} rating={food.rating} />
                            </Grid.Column>
                            <Grid.Column className='detail-rating'>
                                <span className='detail-rating-label'>Value</span>
                                <Rating className='detail-rating-stars' disabled={true} maxRating={5} rating={food.rating} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    <Divider section />
                    {reviews}


                </ScrollElement>
                {this.cook &&
                    <ScrollElement name="cook">
                        <Header className='detail-sub-header' as='h2'>Meet {this.cook.name}</Header>
                        <div className='detail-cook-sub-header'>
                            {this.cook.city}  ·<span style={{ color: '#0fb5c3' }}> Joined in {this.cook.join_date}</span>
                        </div>
                        <div style={{ clear: 'both' }}></div>
                        <div className='detail-cook-text'>{this.cook.info}
                            <div style={{ marginTop: '15px' }}>Languages: <span style={{ fontWeight: '600' }}> {this.cook.lang}</span></div>
                        </div>
                        <div style={{ marginTop: '25px' }}><Image size='small' shape='circular' src={this.cook.image} /></div>
                    </ScrollElement>
                }
                <Divider section />
            </div>
        );

        return (
            <div>
                <AppHeader />
                <div>
                    <FoodLightbox foodItemId={food.id} />
                    <div className='detail-head-main'>
                        <div className="flex-container">
                            <div className="flex-item-main">
                                <ScrollLink activeClass="content-link-active" className='content-link' to="overview"
                                    spy={true} smooth={true} container={document}
                                    offset={-85} duration={500}>
                                    Overview
                                </ScrollLink>

                                <ScrollLink activeClass="content-link-active" className='content-link' to="reviews"
                                    spy={true} smooth={true} container={document}
                                    offset={-85} duration={500}>
                                    Reviews
                                </ScrollLink>

                                <ScrollLink activeClass="content-link-active" className='content-link' to="cook"
                                    spy={true} smooth={true} container={document}
                                    offset={-85} duration={500}>
                                    The Cook
                                </ScrollLink>
                            </div>
                        </div>
                    </div>
                    <div className="flex-container">
                        <div className="flex-item-main">
                            {content}
                        </div>
                        <div className="flex-item-right">
                            <div className='detail-head-right'>
                                <Segment>
                                    <div className='detail-card-header'>
                                        <Image floated='right' marginTop='5px, 0px, 0px, 15px' src={food.image} height='auto' width='26%' />
                                        <div className='detail-card-header-overflow'>{food.header} </div>
                                        <div style={{ display: 'inline-flex' }}>
                                            <Rating disabled={true} maxRating={5} rating={food.rating} size='mini'
                                                style={{ marginTop: '4px' }} />
                                            <div style={{ marginTop: '0px', fontSize: 'small', color: '#494949' }}>{food.ratingCount}</div>
                                        </div>
                                        <div style={{ clear: 'both' }}></div>
                                    </div>
                                    <Divider style={{marginTop: '0px'}} />
                                    <Form.Group inline style={{ padding: '0px 10px 10px 10px' }}>
                                        <Form.Field>
                                            <div style={{ textAlign: 'left', marginBottom: '8px', fontFamily: 'Athiti', fontSize: '1.05em' }}>
                                                Quantity ({food.unit} per order)</div>
                                            <div>
                                                <Button className='detail-quantity-button' icon='minus' size='large' onClick={() => this.handleClickQuantityChange(1, Constants.MaxFoodQuantity, -1)} />
                                                <Input
                                                    type='number'
                                                    onChange={(e, { value }) => this.handleQuantityChange(1, Constants.MaxFoodQuantity, value)}
                                                    onBlur={(e) => this.handleQuantityInputBlur(e)}
                                                    value={this.state.quantity} min={1} max={99}
                                                    style={{ fontSize: '1.1em', width: '3.5em', marginLeft: '0.3em', marginRight: '0.5em' }} />
                                                <Button className='detail-quantity-button' icon='plus' size='large' onClick={() => this.handleClickQuantityChange(1, Constants.MaxFoodQuantity, 1)} />
                                            </div>

                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group inline style={{ padding: '0px 10px 10px 10px' }}>
                                        <div className='detail-card-summary-row' style={{ marginTop: '12px' }} >
                                            <div className='align-left'>
                                                ${PriceCalc.getBaseTotal(food.price, this.state.quantity)} x {this.state.quantity} order size
                                        </div>
                                            <div className='align-right'>
                                                ${PriceCalc.getBaseTotal(food.price, this.state.quantity)}
                                            </div>
                                        </div>
                                        <Divider />

                                        <div className='detail-card-summary-row'>
                                            <div className='align-left'>
                                                Service fee <Popup
                                                    trigger={<Icon size='small' name='question circle outline' />}
                                                    content='This helps run our platform and keep the lights on.'
                                                    on={['click']}
                                                    hideOnScroll />
                                            </div>
                                            <div className='align-right'>
                                                ${PriceCalc.getServiceFee(food.price, this.state.quantity)}
                                            </div>
                                        </div>

                                        <Divider />

                                        <div className='detail-card-summary-row'>
                                            <div className='align-left'>
                                                <strong>Total </strong>
                                            </div>
                                            <div className='align-right'>
                                                <span style={{ fontWeight: '500' }}> ${PriceCalc.getTotal(food.price, this.state.quantity)}</span>
                                            </div>
                                        </div>
                                    </Form.Group>

                                    {this.getRequestOrderButtonDesktop(food)}

                                    <div className='detail-card-charged-footnote'>
                                        You won't be charged yet</div>

                                    <FlagListing />
                                </Segment>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='detail-footer'>
                    <div className='detail-footer-header' style={{ float: 'left' }}> ${PriceCalc.getTotal(food.price, this.state.quantity)} CAD
                    <div style={{ display: 'flex' }}>
                            <Rating disabled={true} maxRating={5} rating={food.rating} size='mini'
                                style={{ marginTop: '10px' }} />
                            <div style={{ marginTop: '6px', fontSize: 'small', color: '#494949' }}>{food.ratingCount}</div>
                        </div>
                    </div>
                    <div style={{ float: 'right', marginRight: '12px' }}>
                        {this.getRequestOrderButtonMobile(food)}
                        <div className='detail-footer-text'>You won't be charged yet</div>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                </div>
            </div>
        )
    }
}