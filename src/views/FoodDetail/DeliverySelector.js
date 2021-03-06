import React from 'react'
import { Constants, Colors } from '../../Constants'
import './DeliverySelector.css'
import Dom from '../../Dom'

const DeliverySelector = ({ pickup, onChange }) => {

    const deliveryProps = (active) => {
        const props = {};
        if (active) {
            props.backgroundColor = Colors.purple;
            props.color = 'white';
            props.borderColor = Colors.purple;
        }
        return props;
    }

    const selectPickup = () => onChange(true);
    const selectDelivery = () => onChange(false);

    return (
        <div className='deliveryselector'>
            <button style={deliveryProps(pickup)} onClick={selectPickup}>
                Pickup
            </button>
            <button data-qa={Dom.FoodDetail.deliveryButton} style={deliveryProps(!pickup)} onClick={selectDelivery}>
                Delivery +${Constants.DeliveryFee}
            </button>
        </div>
    );
}

export default DeliverySelector;
