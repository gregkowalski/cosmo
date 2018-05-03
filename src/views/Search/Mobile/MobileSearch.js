import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { Actions, Selectors } from '../../../store/search'
import { Icon } from 'semantic-ui-react'
import queryString from 'query-string'
import './MobileSearch.css'
import Util from '../../../services/Util'
import MapUtil from '../../../services/MapUtil'
import Url from '../../../services/Url'
import AppHeader from '../../../components/AppHeader'
import Drawer from '../../../components/Drawer'
import LoadingIcon from '../../../components/LoadingIcon'
import RegionUtil from '../../../components/Map/RegionUtil'
import FoodCarousel from './FoodCarousel';
import MobileMap from './MobileMap'
import FoodGrid from '../FoodGrid'
import SearchFilter from './SearchFilter'
import FilterBar from './FilterBar'

class MobileSearch extends Component {

    constructor(props) {
        super(props);

        this.mapHeight = this.calcMapHeight();
        this.state = {
            mapSearch: this.isMapSearch(this.props.location),
            showFilter: false,
            hideFoodGrid: false
        };
    }

    calcMapHeight() {
        const mapHeight = MapUtil.calcMobileMapHeight();
        return `${mapHeight.toFixed(0)}px`;
    }

    isMapSearch(location) {
        const query = Util.parseQueryString(location);
        if (query.view && query.view === 'map') {
            return true;
        }
        return false;
    }

    updateMapHeightAndForceUpdate = () => {
        const prevMapHeight = this.mapHeight;
        this.mapHeight = this.calcMapHeight();
        if (prevMapHeight !== this.mapHeight) {
            setTimeout(() => {
                this.forceUpdate();
            }, 0);
        }
    }

    componentDidMount() {
        if (!this.state.selectedFoodId) {
            const { foods } = this.props;
            if (foods && foods.length > 0) {
                this.setState({ selectedFoodId: foods[0].food_id });
            }
        }

        window.addEventListener('orientationchange', this.updateMapHeightAndForceUpdate);
        window.addEventListener('resize', this.updateMapHeightAndForceUpdate);
    }

    componentWillUnmount() {
        window.removeEventListener('orientationchange', this.updateMapHeightAndForceUpdate);
        window.removeEventListener('resize', this.updateMapHeightAndForceUpdate);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.location !== nextProps.location) {
            // The resize event on the window is used as a workaround for a defect with nuka carousel
            // on the Food.js page where the images don't render.  This happens because we show/hide
            // the list view vs. map search using CSS display: none instead of rendering vs. non-rendering
            // using React.  That's done because it's faster to switch views than to re-render the DOM.
            this.setState({ mapSearch: this.isMapSearch(nextProps.location) }, () => Util.triggerEvent(window, 'resize'));
        }

        if (this.props.foods !== nextProps.foods) {
            const { foods } = nextProps;
            const { selectedFoodId } = this.state;
            if (foods && foods.length > 0) {
                if (!foods.some(food => food.food_id === selectedFoodId)) {
                    this.setState({ selectedFoodId: foods[0].food_id });
                }
            }
        }
    }

    showFilter = () => {
        this.setState({ showFilter: true });
    }

    hideFilter = () => {
        this.setState({ showFilter: false, hideFoodGrid: false },
            // Hack to ensure that food grid images re-render properly
            () => Util.triggerEvent(window, 'resize'));
    }

    applyFilter = (filter) => {
        const { pickup, date, address } = filter;
        const { actions } = this.props;

        actions.dateChanged(date);
        if (pickup) {
            actions.selectPickup();
        }
        else {
            actions.selectDelivery();

            const selectedLocation = Util.toLocation(address.geometry.location);
            const region = RegionUtil.getRegionByPosition(selectedLocation);
            actions.mapCenterChanged(selectedLocation);
            actions.regionChanged(region);
            actions.addressChanged(Util.toAddress(address));
        }
        this.hideFilter();
    }

    handleDrawerTransitionEnd = () => {
        if (this.state.showFilter) {
            this.setState({ hideFoodGrid: true });
        }
    }

    pushViewToHistory(view) {
        const qs = queryString.parse(this.props.location.search);
        const query = Object.assign({}, qs, { m: 1, view });
        this.props.history.push(Url.search(query));
    }

    showMapSearch = () => {
        this.pushViewToHistory('map');
    }

    showListView = () => {
        this.pushViewToHistory('list');
    }

    handleMarkerClick = (selectedFoodId) => {
        this.setState({ mapSelectedFoodId: selectedFoodId });
    }

    handleSelectedFood = (selectedFood) => {
        setTimeout(() => {
            this.setState({
                mapLocation: selectedFood.position,
                selectedFoodId: selectedFood.food_id
            });
        }, 200);
    }

    getFilterStyle(showFilter) {
        if (showFilter) {
            return {
                height: '100%',
                top: 0
            };
        }
        return {
            height: 0,
            top: '100%'
        };
    }

    mapStyle() {
        const mapStyle = {
            height: this.mapHeight,
            top: 0
        };
        return mapStyle;
    }

    foodCarouselStyle() {
        const style = {
            top: `calc(${this.mapHeight} + 5px)`,
            marginLeft: '10px'
        };
        return style;
    }

    visible(isVisible) {
        if (!isVisible) {
            return { display: 'none' };
        }
        return {};
    }

    render() {
        const { mapSearch, showFilter, hideFoodGrid, selectedFoodId, mapSelectedFoodId, mapLocation } = this.state;
        const { pickup, foods, date, address, initialMapCenter, mapCenter, isLoading } = this.props;
        this.mapHeight = this.calcMapHeight();

        return (
            <div className='mobilesearch'>

                {isLoading &&
                    <div className='mobilesearch-loading-icon'>
                        <LoadingIcon size='big' />
                    </div>
                }

                <div style={this.visible(!mapSearch)}>

                    <AppHeader fixed noshadow />

                    <div className='mobilesearch-filterbar'>
                        <FilterBar pickup={pickup} date={date} address={address} onFilterClick={this.showFilter} />
                    </div>

                    {!isLoading &&
                        <div className='mobilesearch-foodgrid' style={this.visible(!hideFoodGrid)}>
                            <FoodGrid foods={foods} />
                            <Icon name='marker' color='purple' onClick={this.showMapSearch} />
                        </div>
                    }

                </div>

                <div style={this.visible(mapSearch)}>

                    <div className='mobilesearch-map' style={this.mapStyle()}>
                        <MobileMap foods={foods} pickup={pickup}
                            center={mapLocation}
                            initialCenter={initialMapCenter}
                            selectedLocation={mapCenter}
                            selectedFoodId={selectedFoodId}
                            gestureHandling='greedy'
                            visible={mapSearch}
                            onGeoLocationChanged={this.props.onGeoLocationChanged}
                            onListViewClick={this.showListView}
                            onFilterClick={this.showFilter}
                            onMarkerClick={this.handleMarkerClick}
                        />
                    </div>

                    <div className='mobilesearch-foodcarousel' style={this.foodCarouselStyle()}>
                        <FoodCarousel
                            foods={foods}
                            pickup={pickup}
                            date={date}
                            selectedFoodId={selectedFoodId}
                            mapSelectedFoodId={mapSelectedFoodId}
                            onSelected={this.handleSelectedFood}
                        />
                    </div>

                </div>

                <Drawer visible={showFilter} onTransitionEnd={this.handleDrawerTransitionEnd}>
                    {/*
                        Drawer gets rendered outside of the react root and thus
                        it doesn't inherit the redux store.  We need to inject it
                        into the SearchFilter manually
                    */}
                    <SearchFilter visible={showFilter}
                        pickup={pickup}
                        date={date}
                        address={address}
                        onFilterHide={this.hideFilter}
                        onFilterApply={this.applyFilter} />
                </Drawer>

            </div >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        pickup: Selectors.pickup(state),
        isLoading: Selectors.isLoading(state),
        foods: Selectors.foods(state),
        geo: Selectors.geoLocation(state),
        region: Selectors.region(state),
        date: Selectors.date(state),
        address: Selectors.address(state),
        mapCenter: Selectors.mapCenter(state)
    };
};

const mapDispatchToProps = (dispatch) => {
    return { actions: bindActionCreators(Actions, dispatch) };
};

MobileSearch.propTypes = {
    foods: PropTypes.arrayOf(PropTypes.shape({
        food_id: PropTypes.string.isRequired,
    })),
    region: PropTypes.object,
    date: PropTypes.object,
    address: PropTypes.object,
    pickup: PropTypes.bool.isRequired,

    actions: PropTypes.shape({
        selectPickup: PropTypes.func.isRequired,
        selectDelivery: PropTypes.func.isRequired,
        geoLocationChanged: PropTypes.func.isRequired,
        regionChanged: PropTypes.func.isRequired,
        dateChanged: PropTypes.func.isRequired,
        addressChanged: PropTypes.func.isRequired,
    }).isRequired
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MobileSearch));
