import React, {useRef} from 'react';
import './App.css';

import Amplify, {Auth} from 'aws-amplify';
import awsconfig from './aws-exports';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

Amplify.configure(awsconfig);

const AUTH_USER_TOKEN_KEY = 'autk';

const App = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [errorText, setErrorText] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  // we can use this for 'remember me'
  // const [token] = React.useState(localStorage.getItem(AUTH_USER_TOKEN_KEY));

  const handleFederatedLogin = (e, customProvider) => {
    e.preventDefault();
    Auth.federatedSignIn({customProvider})
      .then(creds => console.log(creds))
      .catch(err => console.log(err));
  };
  const handleLogin = () => {
    setErrorText(null);
    const email = emailRef.current.value || 'tmcbrearty@giftogram.com';
    const password = passwordRef.current.value || '!AAaa11BBbb';

    Auth.signIn(email, password)
      .then(user => {
        localStorage.setItem(AUTH_USER_TOKEN_KEY, user.signInUserSession.accessToken.jwtToken);

        Auth.currentUserInfo().then(user => setUser(user));
      })
      .catch(err => setErrorText(err.message));
  };
  const handleLogout = () => {
    Auth.signOut().then(() => setUser(null));
  };
  const handleKeyPress = (e) => (e.key === 'Enter') && handleLogin();

  const FederatedLogins = () => {
    return (
      <div className="flex justify-end flex-ga p-4">
        <button onClick={(e) => handleFederatedLogin(e, 'OneLogin')}
                className="bg-black text-gray-200 py-2 px-1">One Login
        </button>
        <button onClick={(e) => handleFederatedLogin(e, 'Google')}
                className="ml-2 bg-orange-600 text-gray-300 py-2 px-1">Google
        </button>
      </div>
    );
  };
  const renderLogin = () => {
    return (
      <div className="w-1/2 border border-1 border-indigo-900">
        <h2 className="bg-indigo-900 text-center text-white font-bold py-4 px-4">
          Cognito Login
        </h2>
        {errorText !== null &&
        <div key="error321651"
             className="border border-1 border-red-600 text-red-800 text-center p-2 w-full bg-gray-100">
          {errorText}
        </div>}

        <div className="p-4 border-b mb-3">

          <input key="235435431345"
                 onKeyPress={handleKeyPress}
                 className="border border-2 border-r-4 mb-1 px-1 py-2 w-full"
                 ref={emailRef}
                 type="email"
                 name="email"
                 placeholder="email" /><br />
          <input key="2354354"
                 onKeyPress={handleKeyPress}
                 className="border border-2 border-r-4 mb-1 px-1 py-2 w-full"
                 ref={passwordRef}
                 type="password"
                 name="password"
                 placeholder="password" /><br />
          <div className="flex justify-end">
            <div className="w-1/3">
              <button key="2354354asdf234asdf"
                      className="bg-indigo-900 text-white text-center w-full py-2 px-1"
                      type="button"
                      onClick={handleLogin}>login
              </button>
            </div>
          </div>
        </div>

        <FederatedLogins />
      </div>
    );
  };
  const renderLoggedIn = () => {
    return (
      <div className="p-10 w-3/5">
        <button onClick={handleLogout}
                className="border-1 border-orange-800 mb-1 py-1 px-2 bg-blue-400">Log Out
        </button>
        <pre key="successor3516810" className="border-2 mb-1 border-green-600 text-black p-2 w-full bg-gray-100">
            {JSON.stringify(user, null, 2)}
          </pre>
      </div>
    );
  };

  React.useEffect(() => {
    Auth.currentUserInfo().then(user => {
      setUser(user);
      setLoading(false);
    });
  }, [setUser]);

  return (
    <Router>
      <div className="flex justify-center align-middle mt-10">
        <Switch>
          <Route path="/" exact>
            {loading && <div className="font-bold">loading user ...</div>}
            {!loading && user && errorText === null && renderLoggedIn()}
            {!loading && !user && renderLogin()}
          </Route>
          <Route path="/dashboard" exact>
            dashboard
          </Route>
          <Route path="/auth/callback" exact>
            callback
            <div>
              <button
                className="border-r-4 py-2 px-1 bg-indigo-900 text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
