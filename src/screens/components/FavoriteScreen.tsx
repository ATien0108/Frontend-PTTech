import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';

const FavoriteScreen = ({navigation, route}: any) => {
  const [favorites, setFavorites] = useState([]);
  const {userId, accessToken} = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleProfilePress = () => {
    if (accessToken && userId) {
      console.log('Navigating to ProfileScreen with:', {userId});
      navigation.navigate('ProfileScreen', {userId: userId});
    } else {
      Alert.alert(
        'Thông báo',
        'Bạn cần đăng nhập để truy cập trang cá nhân.',
        [
          {
            text: 'Đăng nhập',
            onPress: () => {
              navigation.navigate('LoginScreen');
            },
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  const handleSearchPress = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchScreen', {query: searchQuery});
    }
  };

  const handleOrderPress = () => {
    if (accessToken && userId) {
      console.log('Navigating to OrderScreen with userId:', userId);
      navigation.navigate('OrderScreen', {userId, accessToken});
    } else {
      Alert.alert('Bạn cần đăng nhập để xem lịch sử đơn hàng.');
      navigation.navigate('LoginScreen');
    }
  };

  const handleCartPress = () => {
    if (accessToken && userId) {
      console.log('Navigating to CartScreen with userId:', userId);
      navigation.navigate('CartScreen', {userId, accessToken});
    } else {
      Alert.alert('Bạn cần đăng nhập để xem giỏ hàng.');
      navigation.navigate('LoginScreen');
    }
  };

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteData = await AsyncStorage.getItem('favorites');
      const favs = favoriteData ? JSON.parse(favoriteData) : [];
      setFavorites(favs);
    };

    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  const removeFavorite = async (productId: string) => {
    const updated = favorites.filter((item: any) => item.id !== productId);
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  const FavoriteProductCard = ({
    product,
    onRemove,
    navigation,
  }: {
    product: any;
    onRemove: (id: string) => void;
    navigation: any;
  }) => {
    const totalStars = 5;
    const averageRating = product?.ratings?.average || 0;
    const fullStars = '⭐'.repeat(Math.floor(averageRating));
    const emptyStars = '☆'.repeat(totalStars - Math.floor(averageRating));
    const starRating = fullStars + emptyStars;

    const [brandName, setBrandName] = useState<string | null>(null);

    useEffect(() => {
      const fetchBrandName = async () => {
        try {
          const response = await fetch(
            `http://10.0.2.2:8081/api/brands/${product.brandId}`,
          );
          const data = await response.json();
          if (response.ok) {
            setBrandName(data.name);
          } else {
            console.error('Không thể tải thông tin thương hiệu');
          }
        } catch (error) {
          console.error('Có lỗi xảy ra khi lấy thông tin thương hiệu:', error);
        }
      };

      if (product.brandId) {
        fetchBrandName();
      }
    }, [product.brandId]);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          navigation.navigate('ProductDetailScreen', {productId: product.id})
        }>
        <Image source={{uri: product.images[0]}} style={styles.productImage} />
        <TouchableOpacity
          onPress={() => onRemove(product.id)}
          style={styles.heartIcon}>
          <Icon name="heart" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.brandName}>
          {brandName || 'Đang tải thương hiệu...'}
        </Text>{' '}
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.ratingsContainer}>
          <Text style={styles.ratingText}>{starRating}</Text>
          <Text style={styles.ratingText}>
            {product.ratings.totalReviews} đánh giá
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.pricing.current)}
          </Text>
          {product.pricing.original !== product.pricing.current && (
            <Text style={styles.oldPrice}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(product.pricing.original)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item}: {item: any}) => (
    <FavoriteProductCard
      product={item}
      navigation={navigation}
      onRemove={removeFavorite}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleHeader}>PTTechShop</Text>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Icon name="menu" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Modal visible={isMenuVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View style={styles.modalOverlay}>
              <View style={styles.menuContainer}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearchPress}>
                    <Icon name="magnify" size={18} color="black" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('HomeScreen')}>
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

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleLogout}>
                      <Icon name="logout" size={22} color="black" />
                      <Text style={styles.menuText}>Đăng xuất</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleOrderPress}>
                      <Icon name="history" size={22} color="black" />
                      <Text style={styles.menuText}>Lịch sử đơn hàng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleCartPress}>
                      <Icon name="cart-outline" size={22} color="black" />
                      <Text style={styles.menuText}>Giỏ hàng</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleLoginPress}>
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
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Text style={styles.title}>Sản phẩm yêu thích</Text>
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
        <FooterComponent />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E99689',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderColor: '#000',
  },
  productCard: {
    flex: 1,
    margin: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  productImage: {
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  productName: {fontSize: 16, fontWeight: '500'},
  productPrice: {
    fontSize: 16,
    color: appColors.text_red,
    fontWeight: 'bold',
    marginRight: 5,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  list: {
    paddingBottom: 80,
  },

  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
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
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
  },
  searchButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    marginBottom: 10,
    color: '#D10000',
    textAlign: 'center',
  },
  titleHeader: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'black',
  },
  brandText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  ratingText: {
    fontSize: 14,
    color: appColors.text_secondary,
  },
  brandName: {
    fontSize: 14,
    color: appColors.text_purple,
    marginTop: 5,
  },
  ratingsContainer: {
    marginVertical: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 10,
    color: appColors.text_black,
    textDecorationLine: 'line-through',
  },
});

export default FavoriteScreen;
