import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {enableScreens} from 'react-native-screens';
import MainNavigatior from './src/navigation/MainNavigatior';
import AuthNavigator from './src/navigation/AuthNavigator';

enableScreens();

const App = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const {getItem, setItem} = useAsyncStorage('accessToken');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsShowSplash(false);
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await getItem();
    console.log(token);
    token && setAccessToken(token);
  };

  return (
    <>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor={'transparent'}
      />
      : (
      <NavigationContainer>
        {accessToken ? <MainNavigatior /> : <AuthNavigator />}
      </NavigationContainer>
      )
    </>
  );
};
export default App;
