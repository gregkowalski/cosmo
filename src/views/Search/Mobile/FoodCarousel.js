import React, { Component } from 'react'
import ReactGA from 'react-ga'
import Carousel from 'nuka-carousel'
import { Item, Image, Rating, Icon } from 'semantic-ui-react'
import './FoodCarousel.css'
import Util from '../../../services/Util'
import Url from '../../../services/Url'
import PriceCalc from '../../../services/PriceCalc'
import { Colors } from '../../../Constants'

export default class FoodCarousel extends Component {

    state = { selectedSlideIndex: 0 };

    componentWillReceiveProps(nextProps) {
        let foods, selectedFoodId;

        if (this.props.foods !== nextProps.foods) {
            foods = nextProps.foods;
            selectedFoodId = nextProps.selectedFoodId;
        }

        if (this.props.mapSelectedFoodId !== nextProps.mapSelectedFoodId) {
            foods = this.props.foods;
            selectedFoodId = nextProps.mapSelectedFoodId;
        }

        if (this.props.pickup !== nextProps.pickup) {
            foods = this.props.foods;
            selectedFoodId = this.props.selectedFoodId;
        }

        if (foods && foods.length > 0) {
            let selectedSlideIndex = foods.findIndex(food => food.food_id === selectedFoodId);
            if (selectedSlideIndex < 0) {
                selectedSlideIndex = 0;
            }
            this.setState({ selectedSlideIndex });
        }
    }

    forceUpdateAfterTimeout = () => {
        setTimeout(() => {
            this.forceUpdate();
        }, 100);
    }

    componentDidMount() {
        window.addEventListener('orientationchange', this.forceUpdateAfterTimeout);
        window.addEventListener('resize', this.forceUpdateAfterTimeout);
    }

    componentWillUnmount() {
        window.removeEventListener('orientationchange', this.forceUpdateAfterTimeout);
        window.removeEventListener('resize', this.forceUpdateAfterTimeout);
    }

    handleAfterFoodSlide = (index) => {
        const { onSelected, foods } = this.props;
        if (onSelected) {
            // nuka-carousel can return a decimal in some cases (perhaps this is a bug) so let's round it
            index = Math.min(Math.round(index), foods.length - 1);
            const selectedFood = foods[index];
            if (!selectedFood) {
                throw new Error(`selectedFood at index=${index} is null in foods.length=${foods.length}`);
            }
            onSelected(selectedFood);
            ReactGA.event({
                category: 'food-carousel',
                action: `swipe to ${selectedFood.food_id}`
            })
        }
    }

    render() {
        const { foods, selectedFoodId } = this.props;
        if (!foods) {
            return null;
        }

        if (foods.length <= 0) {
            return (
                <div className='foodcarousel-no-results'>
                    <div className='foodcarousel-no-results-header'>
                        <Icon color='purple' name='map signs' />
                        Try adjusting your search. Here's what you can do:
                    </div>
                    <ul>
                        <li>Change your filters or dates</li>
                        <li>Zoom out on the map</li>
                        <li>Search a specific neighbourhood or address</li>
                    </ul>
                </div>
            );
        }

        const { selectedSlideIndex } = this.state;
        let slidesToShow = 2.4;
        let dummySlidesToAdd = 1;
        if (window.innerWidth >= window.innerHeight) {
            slidesToShow = 3.8;
            dummySlidesToAdd = 2;
        }

        const carouselFoods = foods.slice(0);
        // this is for a defect in nuka-carousel where if there's only one item
        // it doesn't generate a list element with a margin-left of 7.5px
        let foodCardStyle = {};
        if (carouselFoods.length === 1) {
            foodCardStyle.marginLeft = '7.5px';
        }
        else {
            // adding an empty element to get around nuka carousel not being good at
            // scrolling to the last item in the list otherwise
            for (let i = 0; i < dummySlidesToAdd; i++) {
                carouselFoods.push(null);
            }
        }

        const slides = carouselFoods.map((food, index) => {

            if (!food) {
                return <div key={index}></div>;
            }

            let borderColor = 'transparent';
            if (food.food_id === selectedFoodId) {
                borderColor = Colors.purple;
            }

            const imageStyle = {
                borderTop: `5px solid ${borderColor}`,
                height: (window.innerHeight * 0.19).toFixed(0) + 'px',
                width: (window.innerWidth * 0.40).toFixed(0) + 'px',
            };

            return (
                <div key={food.food_id} style={foodCardStyle}>
                    <a style={{ color: 'inherit' }}
                        target='_blank'
                        rel='noopener noreferrer'
                        href={Url.foodDetail(food.food_id)}>

                        <Item>
                            <Item.Content>
                                <Image className='foodcarousel-card-image' style={imageStyle} src={food.imageUrls[0]}
                                    onLoad={() => Util.triggerEvent(window, 'resize')} />

                                <Item.Header>
                                    <div className='foodcarousel-card-header'>
                                        ${PriceCalc.getPrice(food.price)} · {food.title}
                                    </div>
                                </Item.Header>

                                <Item.Meta>
                                    <div className='foodcarousel-card-info'>
                                        <Icon className='foodcarousel-card-foodprep' name={Util.getFoodPrepTypeIcon(food)} />
                                        <span>{food.states}</span>
                                        <Rating size='mini' disabled={true} maxRating={5} rating={food.rating} />
                                        <span>{food.ratingCount}</span>
                                    </div>
                                </Item.Meta>

                            </Item.Content>
                        </Item>
                    </a>
                </div>
            );
        });

        const none = () => { };

        return (
            <Carousel
                dragging={true}
                cellSpacing={15}
                // edgeEasing='easeInOutQuint'
                // wrapAround={true}
                slidesToShow={slidesToShow}
                swiping={true}
                afterSlide={this.handleAfterFoodSlide}
                slideIndex={selectedSlideIndex}
                speed={200}
                renderBottomCenterControls={none}
                renderCenterLeftControls={none}
                renderCenterRightControls={none}
            >
                {slides}
            </Carousel>
        )
    }
}
