import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { Actions, Selectors } from '../../store/search'
import { withRouter, Link } from 'react-router-dom'
import { Image, Grid, Card } from 'semantic-ui-react'
import queryString from 'query-string'
import './index.css'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import Url from '../../services/Url'
import Util from '../../services/Util'
import foodImg1 from './home-food1.jpg'
import foodImg2 from './home-food2.jpg'
import foodImg3 from './home-food3.jpg'
import cookImg1 from './home-cook1.jpg'
import cookImg2 from './home-cook2.jpg'
import cookImg3 from './home-cook3.jpg'
import westendImg from './home-westend.jpg'
import yaletownImg from './home-yaletown.jpg'
import AddressFoodSearchBox from './AddressFoodSearchBox'
import RegionUtil from '../../components/Map/RegionUtil'
import withGoogle from '../../hoc/WithGoogleHoc'

class Home extends React.Component {

    componentWillMount() {
        this.homefood = Util.getRandomItem([foodImg1, foodImg2, foodImg3]);
        this.homecook = Util.getRandomItem([cookImg1, cookImg2, cookImg3]);
    }

    searchByLocation = (value) => {
        const { actions, google } = this.props;

        const address = value.place
            ? Util.toAddress(google, value.place)
            : undefined;
        actions.addressChanged(address);

        const pos = Util.toLocation(google, value.location);
        const region = RegionUtil.getRegionByPosition(google, pos);
        actions.selectPickup();
        actions.mapCenterChanged(pos);
        actions.regionChanged(region);

        this.navigateToSearch();
    }

    navigateToAllFoodSearch = () => {
        const { actions } = this.props;
        actions.selectPickup();
        actions.mapCenterChanged(undefined);
        actions.regionChanged(undefined);
        actions.addressChanged(undefined);

        this.navigateToSearch({ z: 11 });
    }

    navigateToRegion = (regionId) => {
        const { actions, google } = this.props;
        const region = RegionUtil.RegionMap(google)[regionId];
        actions.selectDelivery();
        actions.mapCenterChanged(Util.toLocation(google, region.center));
        actions.regionChanged(region);
        actions.addressChanged(undefined);

        this.navigateToSearch();
    }

    navigateToSearch = (queryParams) => {
        const qs = queryString.parse(this.props.location.search);
        const query = Object.assign({}, qs, queryParams);
        this.props.history.push(Url.search(query));
    }

    deliveryWestEnd = () => {
        this.navigateToRegion(RegionUtil.RegionIds().VancouverWestEnd);
    }

    deliveryYaletown = () => {
        this.navigateToRegion(RegionUtil.RegionIds().VancouverYaletown);
    }

    render() {
        const { address, google } = this.props;

        return (
            <div>
                <AppHeader home />
                <div className='home'>
                    <div className='home-top'>
                        <div className='home-top-content'>
                            <div className='home-howto'>
                                <Link to={Url.howto()}>How It Works</Link>
                                <div className='home-link-separator'>|</div>
                                <Link to={Url.whycook()}>Become A Cook</Link>
                            </div>
                            <div className='home-tagline'>Handcrafted to taste like home</div>

                            <div className='home-search-question'>Looking for something to eat?</div>
                            {google &&
                                <AddressFoodSearchBox google={google} onSearchByLocation={this.searchByLocation} address={address} />
                            }
                        </div>
                    </div>

                    <div className='home-explore'>
                        <div>Explore the marketplace</div>
                        <Grid stackable>
                            <Grid.Column width={5}>
                                <div className='home-explore-item' onClick={this.navigateToAllFoodSearch}>
                                    <Image src={this.homefood} />
                                    <div>See all food</div>
                                </div>
                            </Grid.Column>
                            <Grid.Column width={5}>
                                <Link to={Url.cooks()}>
                                    <div className='home-explore-item'>
                                        <Image src={this.homecook} />
                                        <div>Discover local cooks</div>
                                    </div>
                                </Link>
                            </Grid.Column>
                        </Grid>
                    </div>

                    <div className='home-hoods'>
                        <div>Get food delivered to your neighbourhood</div>
                        <Grid stackable>
                            <Grid.Column width={8}>
                                <Card fluid onClick={this.deliveryWestEnd}>
                                    <Image src={westendImg} />
                                    <div>West End</div>
                                </Card>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Card fluid onClick={this.deliveryYaletown}>
                                    <Image src={yaletownImg} />
                                    <div>Yaletown</div>
                                </Card>
                            </Grid.Column>
                        </Grid>
                    </div>
                </div>
                <AppFooter />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        address: Selectors.address(state)
    };
};

const mapDispatchToProps = (dispatch) => {
    return { actions: bindActionCreators(Actions, dispatch) };
};

Home.propTypes = {
    address: PropTypes.object,

    actions: PropTypes.shape({
        selectPickup: PropTypes.func.isRequired,
        selectDelivery: PropTypes.func.isRequired,
        mapCenterChanged: PropTypes.func.isRequired,
        addressChanged: PropTypes.func.isRequired,
        regionChanged: PropTypes.func.isRequired,
    }).isRequired
}

export default withRouter(withGoogle(connect(mapStateToProps, mapDispatchToProps)(Home)));
