import React from 'react'
import PropTypes from 'prop-types'
import { Image, Dropdown, Icon } from 'semantic-ui-react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import './AppHeader.css'
import { Constants, TagLines } from '../Constants'
import Util from '../services/Util'
import Url from '../services/Url'
import CognitoUtil from '../services/Cognito/CognitoUtil'
import LoadingIcon from './LoadingIcon'

import { Actions, Selectors } from '../store/currentUser'

export class AppHeader extends React.Component {

    tagline;

    componentWillMount() {
        CognitoUtil.setLastPath(window.location.pathname);
        this.props.loadCurrentUser();
        this.tagline = this.getRandomTagline();
    }

    componentDidMount() {
        window.addEventListener('orientationchange', this.forceUpdateAfterTimeout);
        window.addEventListener('resize', this.forceUpdateAfterTimeout);
    }

    componentWillUnmount() {
        window.removeEventListener('orientationchange', this.forceUpdateAfterTimeout);
        window.removeEventListener('resize', this.forceUpdateAfterTimeout);
    }

    forceUpdateAfterTimeout = () => {
        setTimeout(() => {
            this.forceUpdate();
        }, 100);
    }

    handleSignIn = (e) => {
        e.preventDefault();
        CognitoUtil.redirectToLoginIfNoSession();
    }

    handleSignUp = (e) => {
        e.preventDefault();
        CognitoUtil.redirectToSignupIfNoSession();
    }

    handleLogOut = (event, data) => {
        CognitoUtil.logOut();
        this.props.logOut();
    }

    handleContactSupport = () => {
        Util.contactSupport();
    }

    navigateToInviteUser = () => {
        this.props.history.push(Url.admin.inviteUser());
    }

    navigateToManageFoods = () => {
        this.props.history.push(Url.admin.manageFoods());
    }

    navigateToEditProfile = () => {
        this.props.history.push(Url.profileEdit());
    }

    navigateToMyOrders = () => {
        this.props.history.push(Url.buyerOrders());
    }

    navigateToMyCookingRequests = () => {
        this.props.history.push(Url.cookOrders());
    }

    navigateToHome = () => {
        this.props.history.push(Url.home());
    }

    getRandomTagline() {
        let index = Util.getRandomInt(0, TagLines.length - 1);
        return TagLines[index];
    }

    getHeaderStyle() {

        const { fixed, noshadow, home } = this.props;

        const headerStyle = {};

        headerStyle.position = 'relative';
        if (fixed) {
            headerStyle.position = 'fixed';
        }

        if (home) {
            headerStyle.borderBottom = '0px solid rgb(201, 199, 199)';
            if (!noshadow) {
                headerStyle.boxShadow = '0px 0px 0px rgba(85, 85, 85, 0.603)';
            }
        }
        else {
            headerStyle.borderBottom = '1px solid rgb(225, 225, 225)';
            if (!noshadow) {
                headerStyle.boxShadow = '0px 0px 8px rgba(88, 88, 88, 0.603)';
            }
        }

        return headerStyle;
    }

    getHeaderContent() {
        const { home } = this.props;
        if (!home) {
            return (
                <div className="apphead-tagline">
                    {this.tagline}
                </div>
            );
        }
        else {
            return (
                <div className="apphead-home">
                    <Link to={Url.howto()}>How It Works</Link>
                    <div>·</div>
                    <Link to={Url.whycook()}>Become A Cook</Link>
                </div>
            );
        }
    }

    getGreeting(username) {
        let greeting;
        if (username) {
            let maxGreetingLength = {
                short: 30,
                long: 35
            };
            if (window.innerWidth <= 665) {
                maxGreetingLength = {
                    short: 13,
                    long: 15
                }
            }
            else if (window.innerWidth <= 767) {
                maxGreetingLength = {
                    short: 17,
                    long: 19
                }
            }

            if (username.length > maxGreetingLength.short) {
                const ellipsis = "\u2026";
                greeting = username.substr(0, maxGreetingLength.short) + ellipsis;
            }
            else if (username.length > maxGreetingLength.long) {
                greeting = username;
            }
            else {
                greeting = 'Hi, ' + username;
            }
            return greeting;
        }
    }

    getSessionElement() {
        const { user, isLoading } = this.props;

        let sessionElement;
        if (user) {
            const isAdmin = CognitoUtil.isAdmin();
            const greeting = this.getGreeting(user.username);
            sessionElement = (
                <div className='apphead-sign-in'>
                    <Dropdown icon='angle down' text={greeting}>
                        <Dropdown.Menu className='left'>
                            {isAdmin &&
                                <Dropdown.Item className='apphead-dropdown-link'>
                                    <Dropdown className='apphead-dropdown-admin' icon='' trigger={<span>Admin <Icon name='angle right' /></span>}>
                                        <Dropdown.Menu id='apphead-downdown-admin-menu'>
                                             <Dropdown.Item className='apphead-dropdown-link' text='Invite User' onClick={this.navigateToInviteUser} />
                                             <Dropdown.Divider />
                                             <Dropdown.Item className='apphead-dropdown-link' text='Manage Foods' onClick={this.navigateToManageFoods} />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Dropdown.Item>
                            }
                            {isAdmin &&
                                <Dropdown.Divider />
                            }
                            <Dropdown.Item className='apphead-dropdown-link' text='Home' onClick={this.navigateToHome} />
                            <Dropdown.Divider />
                            {user.has_stripe_account &&
                                <Dropdown.Item className='apphead-dropdown-link' text='My Cooking Requests' onClick={this.navigateToMyCookingRequests} />
                            }
                            {user.has_stripe_account &&
                                <Dropdown.Divider />
                            }
                            <Dropdown.Item className='apphead-dropdown-link' text='My Orders' onClick={this.navigateToMyOrders} />
                            <Dropdown.Divider />
                            <Dropdown.Item className='apphead-dropdown-link' text='Edit Profile' onClick={this.navigateToEditProfile} />
                            <Dropdown.Divider />
                            <Dropdown.Item className='apphead-dropdown-item' text='Contact Support' onClick={this.handleContactSupport} />
                            <Dropdown.Divider />
                            <Dropdown.Item className='apphead-dropdown-item' text='Log Out' onClick={this.handleLogOut} />
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            );
        }
        else {
            if (isLoading) {
                sessionElement = (
                    <div className='apphead-sign-in'>
                        <LoadingIcon />
                    </div>
                );
            }
            else {
                sessionElement = (
                    <div>
                        <a href={Url.signup()} onClick={this.handleSignUp} className='apphead-sign-in'> Sign Up </a>
                        <span style={{ color: '#2da388', fontSize: '1.5em', marginTop: '2px' }}>|</span>
                        <a href={Url.login()} onClick={this.handleSignIn} className='apphead-sign-in'> Log In</a>
                    </div>
                );
            }
        }
        return sessionElement;
    }

    getLogo() {
        return (
            <div className='apphead-logo' onClick={this.navigateToHome}>
                <Image height='38px' src={Constants.AppLogo} />
                <div className='apphead-link'>{Constants.AppName}</div>
            </div>);
    }

    render() {
        const { simple } = this.props;

        const sessionElement = !simple ? this.getSessionElement() : undefined;
        const headerStyle = this.getHeaderStyle();
        const headerContent = this.getHeaderContent();
        const logo = this.getLogo();

        return (
            <div className='apphead' style={headerStyle}>
                <div className='apphead-content'>
                    <div className='apphead-left'>
                        {logo}
                        {headerContent}
                    </div>
                    <div className='apphead-right'>
                        {sessionElement}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: Selectors.currentUser(state),
        isLoading: Selectors.isLoading(state)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadCurrentUser: () => dispatch(Actions.loadCurrentUser()),
        logOut: () => dispatch(Actions.logOut()),
    };
};

AppHeader.propTypes = {
    user: PropTypes.shape({
        user_id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
    }),
    isLoading: PropTypes.bool.isRequired,
    loadCurrentUser: PropTypes.func.isRequired,
    logOut: PropTypes.func.isRequired,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppHeader));