import React from 'react'
import jwtDecode from 'jwt-decode'
import { CognitoAuth } from 'amazon-cognito-auth-js/dist/amazon-cognito-auth';
import { withRouter } from 'react-router-dom'
import { Image, Icon } from 'semantic-ui-react'
import './OrderHeader.css'
import { Constants, TagLines } from '../Constants'
import CognitoUtil from '../services/Cognito/CognitoUtil'
import Url from '../services/Url'
import Util from '../services/Util'

class OrderHeader extends React.Component {

    state = {};
    tagline;

    handleSignIn(e) {
        e.preventDefault();
        CognitoUtil.redirectToLoginIfNoSession();
    }

    handleSignUp(e) {
        e.preventDefault();
        CognitoUtil.redirectToSignupIfNoSession();
    }

    handleSignOut(e) {
        e.preventDefault();

        let auth = new CognitoAuth(CognitoUtil.getCognitoAuthData());
        let session = auth.getCachedSession();
        if (session && session.isValid()) {
            auth.signOut();
        }

        this.setState({ username: null });
    }

    componentWillMount() {
        //console.log(`location=${window.location}, location.pathname=${window.location.pathname}`);
        CognitoUtil.setLastPath(window.location.pathname);

        let auth = new CognitoAuth(CognitoUtil.getCognitoAuthData());
        let session = auth.getCachedSession();
        if (session && session.isValid()) {
            const jwt = jwtDecode(session.getIdToken().getJwtToken());
            this.setState({ username: jwt.preferred_username });
        }

        this.tagline = this.getRandomTagline();
    }

    handleLogOut(event, data) {
        let auth = new CognitoAuth(CognitoUtil.getCognitoAuthData());
        let session = auth.getCachedSession();
        if (session && session.isValid()) {
            auth.signOut();
        }

        this.setState({ username: null });
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomTagline() {
        let index = Util.getRandomInt(0, TagLines.length - 1);
        return TagLines[index];
    }

    render() {
        let pos = 'relative';
        if (this.props.fixed) {
            pos = 'fixed';
        }

        return (
            <div className='orderhead' style={{ position: pos }}>
                <div className='orderhead-content'>
                    <div className='orderhead-logo'>
                        <a href={Url.home()}>
                            <Image height='38px' src={Constants.AppLogo} />
                        </a>
                        <a href={Url.home()} className='orderhead-link'>
                            <div>{Constants.AppName}</div>
                        </a>
                        <div className="order-tagline-desktop">
                            {this.tagline}
                        </div>
                    </div>
                    <div className='orderhead-right'>
                        <div style={{ display: 'inline-flex' }}>
                            <div className="order-content-desktop">
                                <div className='orderhead-contact-support'>
                                    <a href={Util.contactSupportUrl()} className='orderhead-contact-support-link'><Icon name='conversation' size='large' />
                                        Support
                                    </a>
                                </div>
                                <span style={{ color: '#898989', fontSize: '2.1em', fontWeight: '10', marginTop: '6px', marginRight: '10px' }}>|</span>
                            </div>
                            <div style={{ marginRight: '6px', marginTop: '5px' }}><Image height='25px' src='/assets/images/ssl-certificate-green-lock.png' /></div>
                            <div className='orderhead-ssl-text' >
                                <strong>SSL SECURED </strong>
                                <div style={{ color: '#7f7f7f' }}>CHECKOUT</div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(OrderHeader);