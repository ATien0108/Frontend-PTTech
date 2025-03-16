import {View, Text, Button} from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = ({navigation, route}: any) => {
  const email = route.params;

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate('LoginScreen', {email: email});
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>HomeScreen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
