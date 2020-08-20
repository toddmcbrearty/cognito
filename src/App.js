import React, {useRef} from 'react';
import './App.css';

import Amplify, {Auth} from 'aws-amplify';
import awsconfig from './aws-exports';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import Dashboard from './Dashboard';

Amplify.configure(awsconfig);

export const AUTH_USER_TOKEN_KEY = 'autk';

const App = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [errorText, setErrorText] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [token] = React.useState(localStorage.getItem(AUTH_USER_TOKEN_KEY));

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
        localStorage.setItem(AUTH_USER_TOKEN_KEY, user.signInUserSession.accessToken);

        Auth.currentUserInfo().then(user => setUser(user));
      })
      .catch(err => setErrorText(err.message));
  };
  const handleLogout = () => Auth.signOut().then(() => setUser(null));
  const handleKeyPress = (e) => (e.key === 'Enter') && handleLogin();

  const FederatedLogins = () => {
    return (
      <div className="flex justify-end p-4">
        <button onClick={(e) => handleFederatedLogin(e, 'OneLogin')}
                className="rounded bg-black text-gray-200 p-2"
        >One Login</button>

        <button onClick={(e) => handleFederatedLogin(e, 'Google')}
                className="rounded ml-2 bg-orange-600 text-gray-300 p-2"
        >Google</button>
      </div>
    );
  };
  const renderLogin = () => {
    return (
      <div className="rounded w-1/2 border border-1 border-indigo-900">
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
                 className="rounded border border-2 border-r-4 mb-1 px-1 py-2 w-full"
                 ref={emailRef}
                 type="email"
                 name="email"
                 placeholder="email" /><br />
          <input key="2354354"
                 onKeyPress={handleKeyPress}
                 className="rounded border border-2 border-r-4 mb-1 p-2 w-full"
                 ref={passwordRef}
                 type="password"
                 name="password"
                 placeholder="password" /><br />
          <div className="flex justify-end">
            <div className="w-1/3">
              <button key="2354354asdf234asdf"
                      className="rounded bg-indigo-900 text-white text-center w-full p-2"
                      type="button"
                      onClick={handleLogin}
              >Login</button>
            </div>
          </div>
        </div>

        <FederatedLogins />
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
            {!loading && user && errorText === null && <Redirect to="/dashboard" />}
            {!loading && !user && renderLogin()}
          </Route>
          <Route path="/dashboard" exact>
            {user ? <Dashboard token={token} user={user} onLogout={handleLogout} /> : <Redirect to="/" />}
          </Route>
          <Route path="/auth/callback" exact>
            {user !== null &&
              <Redirect to="/dashboard" />
            }
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
