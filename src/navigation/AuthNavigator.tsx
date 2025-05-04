import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {
  HomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  ProductDetailScreen,
  ProfileScreen,
} from '../screens';
import BrandScreen from '../screens/components/BrandScreen';
import CategoryScreen from '../screens/components/CategoryScreen';
import SearchScreen from '../screens/components/SearchScreen';
import OrderScreen from '../screens/components/OrderScreen';
import CartScreen from '../screens/components/CartScreen';
import FavoriteScreen from '../screens/components/FavoriteScreen';
import AllProductScreen from '../screens/components/AllProductScreen';

const AuthNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
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
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="BrandScreen" component={BrandScreen} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="OrderScreen" component={OrderScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
      <Stack.Screen name="AllProductScreen" component={AllProductScreen} />

      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
};
export default AuthNavigator;
