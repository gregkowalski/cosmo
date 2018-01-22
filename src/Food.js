import React, { Component } from 'react'
import Carousel from 'nuka-carousel'
import { Grid, Item, Image, Rating, Label, Icon } from 'semantic-ui-react'
import './Food.css'
import FoodItems from './data/FoodItems'
import Util from './Util'
import CarouselDecorators from './components/ImageDecorator'
import PriceCalc from './PriceCalc'

class Food extends Component {

    state = {
        quantity: 1
    };

    isDebug = false;

    handleMouseLeave(a, b, id) {
        if (this.isDebug) {
            console.log(`Mouse left item id=${id}`);
        }
        if (this.props.onFoodItemLeave) {
            this.props.onFoodItemLeave(id);
        }
    }

    handleMouseEnter(a, b, id) {
        if (this.isDebug) {
            console.log(`Mouse entered item id=${id}`);
        }
        if (this.props.onFoodItemEnter) {
            this.props.onFoodItemEnter(id);
        }
    }

    handleClick(a, b, id) {
        if (this.isDebug) {
            console.log(`Clicked item id=${id}`);
        }
    }

    getFoodImageComponent(food) {
        let imageElement;
        if (food.images && food.images.length > 1) {
            const images = food.images.map((current, index) =>
                <Image
                    key={index} className='FoodImage' src={current} onLoad={() => Util.triggerEvent(window, 'resize')} />
            );
            imageElement =
                <Carousel dragging={true} cellSpacing={15} edgeEasing="linear" wrapAround={true}
                    decorators={CarouselDecorators}>
                    {images}
                </Carousel>
        }
        else {
            imageElement = <Image
                className='FoodImage' src={food.image} />
        }
        return imageElement;
    }

    getFoodPrepLabelComponent(food) {
        let foodPrepClassName = 'LabelPrep-' + food.prep;
        let foodPrepIcon = Util.getFoodPrepTypeIcon(food);

        let labelElement =
            // <Label content={food.prep} icon={foodPrepIcon} className={foodPrepClassName} size='small' />
            <Icon circular name={foodPrepIcon} className={foodPrepClassName} size='small' />
        return labelElement;
    }


    render() {
        const cards = FoodItems.map((food) => {
            let foodImageComponent = this.getFoodImageComponent(food);
            let foodPrepLabelComponent = this.getFoodPrepLabelComponent(food);

            return (
                <Grid.Column style={{ padding: '0px' }} mobile={16} tablet={16} computer={8} key={food.id}>
                    <div className='FoodCard'>
                        <a
                            target='_blank'
                            href={'/foods/' + food.id}
                            onMouseEnter={(a, b) => this.handleMouseEnter(a, b, food.id)}
                            onMouseLeave={(a, b) => this.handleMouseLeave(a, b, food.id)}>
                            <Item style={{ marginBottom: '1px' }}>
                                <Item.Content>
                                    <div className='FoodImageBox'>
                                        {foodImageComponent}
                                    </div>

                                    <Item.Header>
                                        <div className='FoodCardHeader'>
                                        ${PriceCalc.getPrice(food.price)} · {food.header}</div>
                                        <div style={{ clear: 'both' }}></div>
                                    </Item.Header>

                                    <Item.Meta>
                                        <div style={{ display: 'flex' }}>
                                        {foodPrepLabelComponent} 
                                        <span className='food-label'> {food.prep} <span style={{ fontWeight: '900'}}>·</span> 
                                            <Rating disabled={true} maxRating={5} rating={food.rating} size='mini'
                                                style={{ marginTop: '5px', marginLeft: '2px' }} />
                                            {food.ratingCount} 
                                            </span>
                                        </div>
                                    </Item.Meta>

                                </Item.Content>
                            </Item>
                        </a>
                    </div>
                </Grid.Column>
            )
        });
        return (
            <Grid stackable className='FoodCardGroup'>
                {cards}
            </Grid>
        );

    }
}

export default Food;


