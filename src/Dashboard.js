import React from 'react';
import AWS from 'aws-sdk';
import Amplify, {Auth} from 'aws-amplify';
import {AUTH_USER_TOKEN_KEY} from './App';
import awsmobile from './aws-exports';
Amplify.configure(awsmobile);
const awsConfig = {
  region: process.env.REACT_APP_AWS_REGION,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
};
AWS.config.update({
  ...awsConfig,
  region: awsmobile.aws_cognito_region,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsmobile.aws_user_pools_id
  })
});
const Dashboard = (props) => {
  const defaultValue = 'tmcbrearty@giftogram.com';
  const linkableEmailRef = React.useRef(null);
  const [user, setUser] = React.useState(null);
  const [aws, setAws] = React.useState(null);
  const [initialized, setInitialized] = React.useState(false);

  const init = () => {
    setInitialized(true);
    Auth.currentUserPoolUser().then(user => setUser(user));
    Auth.currentCredentials().then((creds) => {
      const accessToken = localStorage.getItem(AUTH_USER_TOKEN_KEY);
      const aws = new AWS.CognitoIdentityServiceProvider(awsConfig);

      try {
        aws.adminGetUser({
          UserPoolId: awsmobile.aws_user_pools_id,
          Username: 'OneLogin_tmcbrearty@giftogram.com',
        }, res => console.log('good', res));
        setAws(aws);
      } catch(e) {
        console.log(e);
      }
    });
  };

  const checkForLinkableAccounts = () => {
    const {value} = linkableEmailRef.current;

    if (value === '') return alert('Enter an email address');

    const adminGetUserParams = {
      UserPoolId: process.env.REACT_APP_COGNITO_POOL_ID /* required */,
      DestinationUser: {
        ProviderName: 'Cognito',
        ProviderAttributeValue: value
      },
      SourceUser: {
        ProviderName: 'OneLogin',
        ProviderAttributeValue: `OneLogin_${value}`
      }
    };
    aws.adminLinkProviderForUser(adminGetUserParams, res => {
      console.log(res);
    });
  };

  React.useEffect(() => {
    if (!initialized) init();
  }, [initialized]);


  if (!user) return <div>loading</div>;

  return (
    <div className="w-3/5">
      <div className="flex justify-end">
        <button onClick={e => {
          e.preventDefault();
          props.onLogout();
        }} className="px-4 py-2  rounded bg-indigo-900 text-white"
        >Logout
        </button>
      </div>
      <h2>Dashboard</h2>

      <div className="rounded p-2 mt-1 border-1 border-indigo-900 bg-gray-200">
        <input type="text"
               defaultValue={defaultValue}
               className="rounded border border-2 border-r-4 mb-1 px-1 py-2 text-2xl w-3/4"
               ref={linkableEmailRef}
        />

        <button onClick={e => {
          e.preventDefault();
          checkForLinkableAccounts();
        }} className="px-4 py-2 rounded bg-indigo-900 text-white"
        >Link
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
