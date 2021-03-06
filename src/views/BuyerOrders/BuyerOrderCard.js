import React from 'react'
import { withRouter } from 'react-router-dom'
import { Segment, Divider, Image, Icon, Accordion } from 'semantic-ui-react'
import './BuyerOrderCard.css'
import { Constants, Colors } from '../../Constants'
import { OrderStatus, OrderStatusLabels, DeliveryOptions } from '../../Enums'
import PriceCalc from '../../services/PriceCalc'
import Url from '../../services/Url'
import Util from '../../services/Util'
import ConfirmModal from '../../components/ConfirmModal'

class BuyerOrderCard extends React.Component {

    state = { showDetails: false }

    navigateToFoodDetail = () => {
        this.props.history.push(Url.foodDetail(this.props.order.food_id));
    }

    cancelOrder = (reason) => {
        if (!this.props.order.isCancelling && this.props.onCancel) {
            this.props.onCancel(this.props.order, reason);
        }
    }
    
    closeCancelConfirmation = () => {
        this.setState({ showConfirmCancel: false });
    }

    showCancelConfirmation = (e) => {
        e.preventDefault();
        this.setState({ showConfirmCancel: true });
    }

    statusStyle(status) {
        let backgroundColor = Colors.lightgrey;
        let color = Colors.purple;
        if (status === OrderStatus.Accepted) {
            backgroundColor = Colors.green;
            color = Colors.grey;
        }

        else if (status === OrderStatus.Declined) {
            backgroundColor = Colors.red;
            color = Colors.grey;
        }

        else if (status === OrderStatus.Cancelled) {
            backgroundColor = Colors.red;
            color = Colors.grey;
        }

        return {
            backgroundColor: backgroundColor,
            color: color,
        }
    }

    render() {
        const { showDetails, showConfirmCancel } = this.state;

        const { order } = this.props;
        const { food, cook, isCancelling, handoff_start_date, handoff_end_date } = order;

        const startDate = Util.toCurrentTimezoneMoment(handoff_start_date);
        const endDate = Util.toCurrentTimezoneMoment(handoff_end_date);

        const handoffAddress = order.delivery_option === DeliveryOptions.pickup ? order.cook.address : order.buyer_address;

        return (
            <Segment raised>
                <div id='buyerordercard-status' className='ui segment' style={this.statusStyle(order.status)}>{OrderStatusLabels[order.status]}</div>
                {cook.image &&
                    <Image id='buyerordercard-header-cook' src={cook.image} circular />
                }
                <div className='buyerordercard'>
                    <div className='buyerordercard-header'>
                        <Image className='top-spacing' src={food.imageUrls[0]} onClick={this.navigateToFoodDetail} />
                        <div>
                            <div className='larger-font top-spacing mobile-spacing'>{food.title}</div>
                            <div className='buyerordercard-section'>
                                <div>{startDate.format('dddd, MMMM D')}</div>
                                <div>{startDate.format('h A')} to {endDate.format('h A')}</div>
                                <div className='bottom-spacing top-spacing'>
                                </div>
                                <div className='top-spacing'>Your cook, {Util.firstNonEmptyValue(cook.username, cook.name)}</div>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className='top-spacing pickup-font'>{order.pickup ? "You will pick up this order at" : 'Order will be delivered to'}</div>
                    <div className='buyerordercard-address buyerordercard-main large-font'>
                        <div>{handoffAddress}</div>
                    </div>
                    <Divider />
                    <div className='buyerordercard-additional'>
                        <Accordion>
                            <Accordion.Title active={showDetails} onClick={() => this.setState({ showDetails: !showDetails })}>
                                <div className='buyerordercard-additional-details'>
                                    Additional details
                                    <Icon name='angle down' />
                                </div>
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
                        <div className='buyerordercard-footer'>
                            <Icon name='envelope outline' size='large' />
                            <a href={Url.mailTo(cook.email, food.title)}>Message {cook.username}</a>
                        </div>
                        {(order.status === OrderStatus.Accepted || order.status === OrderStatus.Pending) && this.props.onCancel &&
                            <div className='buyerordercard-footer'>
                                <Icon name={isCancelling ? 'circle notched' : 'calendar alternate outline'} loading={isCancelling} size='large' />
                                <a href='./' onClick={this.showCancelConfirmation}>Cancel order</a>
                            </div>
                        }
                    </div>

                    <ConfirmModal
                        header='Cancel this order'
                        message="Got it. Let your cook know why you're cancelling."
                        open={showConfirmCancel}
                        isProcessing={isCancelling}
                        onConfirm={this.cancelOrder}
                        onClose={this.closeCancelConfirmation}
                        confirmButtonLabel='Cancel order'
                    />

                </div>

            </Segment>
        )
    }
}

export default withRouter(BuyerOrderCard);