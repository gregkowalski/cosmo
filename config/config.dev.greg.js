const Config = {
    Api: {
        Region: 'us-west-2',
        BaseUrl: 'https://api-dev.cosmo-test.com/v1',
    },
    Cognito: {
        AppWebDomain: 'login-dev.cosmo-test.com',
        ClientAppId: '6p23mo25qul21p2r26504sjckl',
        UserPoolId: 'us-west-2_1w2KdAhAq',
        RedirectUriSignIn: 'https://ui-dev-greg.cosmo-test.com:3000/cognitoCallback',
        RedirectUriSignOut: 'https://ui-dev-greg.cosmo-test.com:3000/cognitoSignout',
        TokenScopesArray: ['openid', 'aws.cognito.signin.user.admin', 'email'],
    },
    Stripe: {
        ClientId: 'ca_DUbAhQcRoGzFdSDBdoPN604uSmOC2bkg',
        PublicApiKey: 'pk_test_LaUn1QZEtks832mqWqyFHX7a',
        ConnectOAuthRedirectUri: 'https://ui-dev-greg.cosmo-test.com:3000/stripeCallback',
    },
    Foodcraft: {
        SupportEmail: 'greg+dev@foodcraft.ca'
    },
    Google: {
        ApiKey: 'AIzaSyD4rYJFeUOqrjOSiFme77L0RL-79zsqKvw'
    },
    GoogleAnalytics: {
        TrackingId: 'UA-123045559-1'
    }
}

export default Config;