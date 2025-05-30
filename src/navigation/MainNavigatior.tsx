import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import TabNavigator from './TabNavigator';
import {ProductDetailScreen, ProfileScreen, HomeScreen} from '../screens';
import CategoryScreen from '../screens/components/CategoryScreen';
import BrandScreen from '../screens/components/BrandScreen';
import SearchScreen from '../screens/components/SearchScreen';
import {LoginScreen} from '../screens';
import OrderScreen from '../screens/components/OrderScreen';
import CartScreen from '../screens/components/CartScreen';
import FavoriteScreen from '../screens/components/FavoriteScreen';
import AllProductScreen from '../screens/components/AllProductScreen';
import {
  RegisterScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from '../screens';

const MainNavigatior = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />

      <Stack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
      />
      <Stack.Screen name="BrandScreen" component={BrandScreen} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="OrderScreen" component={OrderScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
      <Stack.Screen name="AllProductScreen" component={AllProductScreen} />

      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatior;
