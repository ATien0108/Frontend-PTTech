import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MenuComponentProps {
  navigation: any;
}

const MenuComponent: React.FC<MenuComponentProps> = ({navigation}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (userId && accessToken) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleProfilePress = async () => {
    const userId = await AsyncStorage.getItem('userId');
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (userId && accessToken) {
      navigation.navigate('ProfileScreen', {
        userId: userId,
        accessToken: accessToken,
      });
    } else {
      Alert.alert(
        'Thông báo',
        'Bạn cần đăng nhập để truy cập thông tin cá nhân.',
      );
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng xuất.');
    }
  };

  const handleLoginPress = () => {
    if (!isLoggedIn) {
      navigation.navigate('LoginScreen');
    }
  };

  const handleSearchPress = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchScreen', {query: searchQuery});
    }
  };

  return (
    <View style={styles.menuContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}>
          <Icon name="magnify" size={18} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.menuItem}>
        <Icon name="home-outline" size={22} color="black" />
        <Text style={styles.menuText}>Trang chủ</Text>
      </TouchableOpacity>

      {isLoggedIn ? (
        <>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleProfilePress}>
            <Icon name="account-outline" size={22} color="black" />
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Icon name="logout" size={22} color="black" />
            <Text style={styles.menuText}>Đăng xuất</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.menuItem} onPress={handleLoginPress}>
            <Icon name="login" size={22} color="black" />
            <Text style={styles.menuText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('RegisterScreen')}>
            <Icon name="account-plus" size={22} color="black" />
            <Text style={styles.menuText}>Đăng ký</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.menuItem}>
        <Icon name="cart-outline" size={22} color="black" />
        <Text style={styles.menuText}>Giỏ hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Icon name="history" size={22} color="black" />
        <Text style={styles.menuText}>Lịch sử đơn hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Icon name="heart-outline" size={22} color="black" />
        <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: '#FFD6D6',
    padding: 15,
    borderRadius: 10,
    width: 250,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: 'black',
  },
  searchButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '500',
    color: 'black',
  },
});

export default MenuComponent;
