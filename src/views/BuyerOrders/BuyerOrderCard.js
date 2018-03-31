import React from 'react'
import moment from 'moment'
import { withRouter } from 'react-router-dom'
import { Segment, Divider, Image, Icon, Accordion } from 'semantic-ui-react'
import './BuyerOrderCard.css'
import Constants from '../../Constants'
import OrderStatus from '../../data/OrderStatus'
import Colors from '../../data/Colors'
import PriceCalc from '../../services/PriceCalc'
import Url from '../../services/Url'

class BuyerOrderCard extends React.Component {

    state = { showDetails: false }

    navigateToFoodDetail = () => {
        this.props.history.push(Url.foodDetail(this.props.order.food_id));
    }

    statusStyle(status) {
        let color = Colors.purple;
        if (status === OrderStatus.Accepted)
            color = Colors.purple;
        else if (status === OrderStatus.Declined)
            color = Colors.red;
        else if (status === OrderStatus.Cancelled)
            color = Colors.grey;
        
        return {
            backgroundColor: color,
            // color: 'white'
        }
    }

    render() {
        const { order } = this.props;
        const { food, cook } = order;
        const date = moment(order.date);

        const { showDetails } = this.state;

        return (
            <Segment raised>
                <div id='buyerordercard-status' className='ui segment' style={this.statusStyle(order.status)}>{order.status}</div>
                <Image id='buyerordercard-header-cook' src={cook.image} circular size='tiny' />
                <div className='buyerordercard'>
                    {/* <Label className='label-dropshadow' size='large' attached='top' color={statusColor}>{order.status}</Label> */}
                    <div className='buyerordercard-header'>
                        <Image className='top-spacing' src={food.imageUrls[0]} onClick={this.navigateToFoodDetail} />
                        <div>
                            <div className='large-font top-spacing mobile-spacing'>{food.title}</div>
                            <div className='buyerordercard-section'>
                                <div>{date.format('dddd, MMMM D')}</div>
                                <div className='bottom-spacing'>{order.time}</div>
                                <div className='top-spacing'>Your cook, {cook.name}</div>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className='top-spacing normal-font'>{order.pickup ? 'Pickup' : 'Delivery'} address</div>
                    <div className='buyerordercard-section buyerordercard-main large-font'>
                        <div>{order.address}</div>
                    </div>
                    <Divider />
                    <div className='buyerordercard-section'>
                        <Accordion>
                            <Accordion.Title active={showDetails} onClick={() => this.setState({ showDetails: !showDetails })}>
                                Additional details
                            <Icon name='dropdown' />
                            </Accordion.Title>
                            <Accordion.Content active={showDetails}>
                                <div>Reservation code: {order.order_id}</div>
                                <div>Quantity: {order.quantity}</div>
                                <div>Total: ${PriceCalc.getTotalPrice(food, order.quantity, order.pickup)} {Constants.Currency}</div>
                            </Accordion.Content>
                        </Accordion>
                    </div>
                    <Divider />
                    <div className='buyerordercard-contact normal-font'>
                        <div className='buyerordercard-cook'>
                            <div><Icon name='mail outline' size='large' />
                                <a className='buyerordercard-link' href={Url.mailTo(cook.email, food.title)}>Message {cook.name}</a>
                            </div>
                        </div>
                        <div>
                            <Icon name='calendar' size='large' /><a className='buyerordercard-link' href='./'>Cancel order</a>
                        </div>
                    </div>
                </div>

            </Segment>
        )
    }
}

export default withRouter(BuyerOrderCard);