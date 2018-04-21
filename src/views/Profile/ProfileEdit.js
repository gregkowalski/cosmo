import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { Segment, Input, Button, Image, Header, Grid, Message, TextArea, Dropdown } from 'semantic-ui-react'
import { Divider, Icon } from 'semantic-ui-react'
import Autocomplete from 'react-google-autocomplete';
import crypto from 'crypto'
import './ProfileEdit.css'
import Util from '../../services/Util'
import Url from '../../services/Url'
import AppHeader from '../../components/AppHeader'
import LoadingIcon from '../../components/LoadingIcon'
import CognitoUtil from '../../services/Cognito/CognitoUtil'
import StripeUtil from '../../services/Stripe/StripeUtil'
import { Actions, Selectors } from '../../store/currentUser'
import { Field, reduxForm } from 'redux-form'

const languageOptions = [
    { key: 'en-CA', value: 'en-CA', text: 'English' },
    { key: 'fr-CA', value: 'fr-CA', text: 'French' },
    { key: 'pl-PL', value: 'pl-PL', text: 'Polish' },
    { key: 'zh-CN', value: 'zh-CN', text: 'Chinese' },
    { key: 'zh-HK', value: 'zh-HK', text: 'Cantonese' },
    { key: 'tr-TR', value: 'tr-TR', text: 'Turkish' },
    { key: 'es-ES', value: 'es-ES', text: 'Spanish' },
    { key: 'sgn-US', value: 'sgn-US', text: 'Sign Language' },
    { key: 'it-IT', value: 'it-IT', text: 'Italian' },
    { key: 'pt-PT', value: 'pt-PT', text: 'Portuguese' },
    { key: 'de-CH', value: 'de-CH', text: 'German' },
    { key: 'ja-JP', value: 'ja-JP', text: 'Japanese' },
    { key: 'tl-PH', value: 'tl-PH', text: 'Tagalog' },
    { key: 'ko-KR', value: 'ko-KR', text: 'Korean' },
    { key: 'ru-RU', value: 'ru-RU', text: 'Russian' },
    { key: 'hi-IN', value: 'hi-IN', text: 'Hindi' },
    { key: 'pa-IN', value: 'pa-IN', text: 'Punjabi' },
    { key: 'el-GR', value: 'el-GR', text: 'Greek' }
]

class ProfileEdit extends React.Component {

    state = {};

    componentWillMount() {
        this.props.actions.loadCurrentUser();
        this.isExternalIdp = CognitoUtil.isExternalIdp(CognitoUtil.getLoggedInUserJwt());
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isSaving && !nextProps.isSaving) {
            // We finished saving, let's set the appropriate messages
            if (nextProps.error) {
                console.log(nextProps.error);
                this.setState({ message: { show: true, content: "Oops, your profile was not saved." } });
            }
            else {
                this.setState({ message: { show: true, content: "Success! Your profile has been updated." } });
            }
        }
    }

    navigateToProfileView = () => {
        this.props.history.push(Url.profileView(this.props.user.user_id));
    }

    handleSave = (user) => {
        console.log(user);
        console.log('saving...');
        return this.props.actions.saveUser(user);
    }

    handleConnectStripeClick = (e) => {
        e.preventDefault();

        const state = crypto.randomBytes(64).toString('hex');
        let stripeConnectUrl = StripeUtil.getStripeConnectUrl(state);
        StripeUtil.setCsrfState(state);
        window.open(stripeConnectUrl, '_self');
    }

    render() {
        const { isLoading, user } = this.props;
        const { handleSubmit, pristine, submitting } = this.props;
        const { message } = this.state;

        let content;
        if (isLoading) {
            content =
                <div style={{ marginTop: '70px', width: '100%' }}>
                    <div style={{ margin: '0 auto', width: '100px' }}>
                        <LoadingIcon />
                    </div>
                </div>
        }
        else {

            let stripeComponent;
            if (user.stripe_account_id) {
                stripeComponent = (
                    <div className='profileedit-stripe-component-text'>
                        <div>Sharing your food just got a whole lot easier.</div>
                        <div className='profileedit-stripe-component-logo'>

                            <Icon color='green' size='big' name='checkmark' />
                            <Image height='45px' src='/assets/images/stripe-logo-blue.png' />
                            <div> Your Stripe account is successfully connected to Foodcraft.</div>
                        </div>
                        <Divider hidden />
                        <div> Be sure to check out the Foodcraft Help Center for more information, tips, and answers to many frequently asked questions.</div>
                        <Divider hidden />
                        <div className='profileedit-stripe-component-ready'> Ready to get started? </div>
                        <Divider hidden />
                        <a href='https://goo.gl/forms/NxxOMSNXOWESGpsW2' target='_blank' rel="noreferrer noopener" >
                            <Button basic color='purple'>Add a new food</Button>
                        </a>
                    </div>
                );
            }
            else {
                stripeComponent = (
                    <div>
                        <div className='profileedit-menu' style={{ marginBottom: '20px' }}>Interested in sharing your food and making money with Foodcraft?
                    <div style={{ marginTop: '10px' }}>Get started by creating your own Stripe account!
                        </div>
                        </div>
                        <a href='./' onClick={(e) => this.handleConnectStripeClick(e)}>
                            <Image src='/assets/images/stripe-blue-on-light.png' />
                        </a>
                    </div>
                );
            }
            content = (
                <div className='profileedit-main'>
                    <div className='profileedit-title'>
                        <div>Edit Profile</div>
                        <Button onClick={this.navigateToProfileView}>View Profile</Button>
                    </div>
                    <form>
                        <Grid>
                            <Grid.Column>
                                <Header className='profileedit-header' block attached='top'>Required</Header>
                                <Segment attached>
                                    <Grid stackable className='profileedit-grid-body' columns='equal'>
                                        <Grid.Row stretched>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>First Name</Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Field name='name' autoComplete='name' component={renderField} type='text' placeholder='Enter your name' />
                                                <div className='profileedit-input-descriptions'>
                                                    Your public profile only shows your first name. When you order food, your cook will see your first and last name.
                                                </div>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>Username</Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Field name='username' autoComplete='username' component={renderField} type='text' placeholder='Enter your username' />
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>Email <Icon className='profileedit-secured-input' name='lock' /></Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Field disabled={this.isExternalIdp} name='email' autoComplete='email' component={renderField} type='text' placeholder='Enter your email' />
                                                <div className='profileedit-input-descriptions'>
                                                    Your email is never displayed publicly. It is only shared when you have a confirmed order request with another Foodcraft user.
                                                </div>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>Neighbourhood</Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Field name='hood' autoComplete='hood' component={renderField} type='text' placeholder='Where do you live?' />
                                                <div className='profileedit-input-descriptions'>
                                                    Your neck of the woods (i.e. Kitslano, Yaletown, North Burnaby)
                                                </div>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>About:</Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Field name='info' autoComplete='info' component={renderTextArea} rows={2} type='text' placeholder='Tell everyone about yourself' />
                                                <div className='profileedit-input-descriptions'>Let other people in the Foodcraft community get to know you.
                                                    <div style={{ marginTop: '5px' }}>
                                                        What are some things you like to do? Or share the 5 foods you can't live without. Do you have a food philosophy? Share your life motto!
                                                    </div>
                                                </div>
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Segment>
                                <Header className='profileedit-header' block attached='top'>Optional</Header>
                                <Segment attached>
                                    <Grid stackable className='profileedit-grid-body'>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>Languages</Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Dropdown placeholder='Select Language' fluid multiple search selection options={languageOptions} onChange={this.handleChange} onBlur={this.handleBlur} />
                                                <div className='profileedit-input-descriptions'>Add any languages other people can use to chat with you.</div>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>Phone <Icon className='profileedit-secured-input' name='lock' /></Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Field name='phone' autoComplete='phone' component={renderField} type='tel' normalize={parsePhone} placeholder="What's your phone number?" />
                                                <div className='profileedit-input-descriptions'>We will never share your private phone number without your permission.</div>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>Address <Icon className='profileedit-secured-input' name='lock' /></Grid.Column>
                                            <Grid.Column computer={10}>
                                                <Field name='address' className='profileedit-address' autoComplete='address' component={renderAutocomplete} type='text' normalize={parseAddress} placeholder="What is your address?" />
                                                <div className='profileedit-input-descriptions'>
                                                    We take your privacy seriously. Your address is never shown publicly. We use this data to improve our geosearch and matching.
                                                </div>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column id='profileedit-grid-label' computer={3}>Certifications</Grid.Column>
                                            <Grid.Column computer={13}>
                                                <Field name='certifications' autoComplete='certifications' component={renderField} type='text' placeholder="What are your certifications?" />
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Segment>
                                <Header className='profileedit-header' block attached='top'>Stripe</Header>
                                <Segment attached >
                                    <div className='profileedit-stripe-box'>{stripeComponent}</div>
                                </Segment>
                                <div className='profileedit-save-button-container'>
                                    <div>
                                        <Button className='profileedit-save-button' type='submit'
                                            disabled={pristine} loading={submitting} onClick={handleSubmit(this.handleSave)}>Save profile</Button>
                                    </div>
                                    {message && message.show &&
                                        <div>
                                            <Message className='profileedit-save-confirm'
                                                floating size='tiny'
                                                onDismiss={() => this.setState({ message: { show: false } })}>
                                                {message.content}
                                            </Message>
                                        </div>
                                    }
                                </div>

                            </Grid.Column>
                        </Grid>
                    </form>
                    <Divider hidden />
                </div>
            );
        }

        return (
            <div>
                <AppHeader fixed />
                {content}
            </div>
        )
    }
}

const parseAddress = (value) => {
    return value.formatted_address;
}

const parsePhone = (value) => {
    return Util.getAsYouTypePhone(value);
}

const validate = (values) => {
    const errors = {}
    if (!values.name) {
        errors.name = { header: 'Name is required', message: 'Please enter your name' };
    }

    if (!values.username) {
        errors.username = { header: 'Username is required', message: 'Please enter your username' };
    }

    if (!values.hood) {
        errors.hood = { header: 'Neighbourhood is required', message: 'Please enter your neighbourhood' };
    }

    if (!values.info) {
        errors.info = { header: 'Your bio is required', message: 'Please tell us about yourself' };
    }

    if (!values.email) {
        errors.email = { header: 'Email is required', message: 'Please enter your email address' };
    }
    else if (!validateEmail(values.email)) {
        errors.email = { header: 'Invalid email address', message: 'Please enter your email address' };
    }

    if (!values.phone) {
        errors.phone = { header: 'Phone is required', message: 'Please enter your phone number' };
    }
    else if (!Util.validatePhoneNumber(values.phone)) {
        errors.phone = { header: 'Invalid phone number', message: 'Please enter your phone number' };
    }

    return errors;
}

const validateEmail = (email) => {
    var pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email);
}

const renderAutocomplete = ({ input, meta, placeholder, autoComplete, className }) => {
    const { touched, error } = meta;
    return (
        <div>
            <Autocomplete className={className}
                {...input}
                autoComplete={autoComplete}
                onPlaceSelected={input.onChange}
                types={['address']}
                placeholder={placeholder}
                componentRestrictions={{ country: 'ca' }}
            />
            {touched && error &&
                <Message error header={error.header} content={error.message} icon='exclamation circle' />
            }
        </div>
    );
}
const renderField = ({ input, type, meta, placeholder, autoComplete }) => {
    const { touched, error } = meta;
    const hasError = !(!error); // turn it into a boolean
    return (
        <div>
            <Input {...input} type={type} placeholder={placeholder} error={hasError} autoComplete={autoComplete} />
            {touched && error &&
                <Message error header={error.header} content={error.message} icon='exclamation circle' />
            }
        </div>
    );
}

const renderTextArea = ({ input, type, meta, placeholder, autoComplete, rows }) => {
    const { touched, error } = meta;
    return (
        <div>
            <TextArea {...input} placeholder={placeholder} autoComplete={autoComplete} autoHeight rows={rows} />
            {touched && error &&
                <Message error header={error.header} content={error.message} icon='exclamation circle' />
            }
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        user: Selectors.currentUser(state),
        isLoading: Selectors.isLoading(state),
        isSaving: Selectors.isSaving(state),
        error: Selectors.error(state),
        initialValues: Selectors.currentUser(state)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(Actions, dispatch),
    };
};

ProfileEdit.propTypes = {
    user: PropTypes.shape({
        user_id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
    }),
    isLoading: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    error: PropTypes.any,
    actions: PropTypes.shape({
        loadCurrentUser: PropTypes.func.isRequired,
        saveUser: PropTypes.func.isRequired
    })
}

const form = reduxForm({ form: 'profileEdit', validate, enableReinitialize: true })(ProfileEdit);
const connectedForm = connect(mapStateToProps, mapDispatchToProps)(form);
export default withRouter(connectedForm);
