import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {HeaderComponent} from '../../components';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Product {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  pricing: {
    original: number;
    current: number;
    history: Array<{
      previousPrice: number;
      newPrice: number;
      changedAt: string;
    }>;
  };
  ratings: {
    average: number;
    totalReviews: number;
  };
  images: string[];
}

const SearchScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {query: initialQuery} = route.params;
  const [query, setQuery] = useState<string>(initialQuery || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const {userId, accessToken} = route.params || {};

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getValidImageUri = (uri: string) => {
    if (uri.includes('localhost')) {
      return uri.replace('localhost', '10.0.2.2');
    }
    return uri;
  };

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

  const handleFavoritePress = () => {
    if (accessToken && userId) {
      navigation.navigate('FavoriteScreen', {userId, accessToken});
    } else {
      Alert.alert('Bạn cần đăng nhập để xem sản phẩm yêu thích.');
      navigation.navigate('LoginScreen');
    }
  };

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);
  const handleSearch = async (keyword: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://10.0.2.2:8081/api/products/search?keyword=${keyword}`,
      );
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        console.error('Error fetching products:', data);
      }
    } catch (error) {
      console.error('There was an error!', error);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard: React.FC<{
    product: Product;
    navigation: any;
    userId: string;
    accessToken: string;
  }> = ({product, navigation, userId, accessToken}) => {
    const totalStars = 5;
    const averageRating = product.ratings.average;

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
          navigation.navigate('ProductDetailScreen', {
            productId: product.id,
            userId,
            accessToken,
          })
        }>
        <Image
          source={{uri: getValidImageUri(product.images[0])}}
          style={styles.productImage}
        />
        <Text style={styles.brandName}>
          {brandName || 'Đang tải thương hiệu...'}
        </Text>
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

        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text
          style={styles.titleHeader}
          onPress={() =>
            navigation.navigate('HomeScreen', {userId, accessToken})
          }>
          PTTechShop
        </Text>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Icon name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Modal visible={isMenuVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  navigation.navigate('HomeScreen', {userId, accessToken})
                }>
                <Icon name="home-outline" size={22} color="black" />
                <Text style={styles.menuText}>Trang chủ</Text>
              </TouchableOpacity>

              {isLoggedIn ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      handleProfilePress();
                    }}>
                    <Icon name="account-outline" size={22} color="black" />
                    <Text style={styles.menuText}>Thông tin cá nhân</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      handleLogout();
                    }}>
                    <Icon name="logout" size={22} color="black" />
                    <Text style={styles.menuText}>Đăng xuất</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      handleOrderPress();
                    }}>
                    <Icon name="history" size={22} color="black" />
                    <Text style={styles.menuText}>Lịch sử đơn hàng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      handleCartPress();
                    }}>
                    <Icon name="cart-outline" size={22} color="black" />
                    <Text style={styles.menuText}>Giỏ hàng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      handleFavoritePress();
                    }}>
                    <Icon name="heart-outline" size={22} color="black" />
                    <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      handleLoginPress();
                    }}>
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
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm"
          value={query}
          onChangeText={text => setQuery(text)}
        />

        {loading ? (
          <Text>Đang tải...</Text>
        ) : (
          <FlatList
            horizontal
            data={products}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <ProductCard
                product={item}
                navigation={navigation}
                userId={userId}
                accessToken={accessToken}
              />
            )}
            showsHorizontalScrollIndicator={false}
            style={{marginBottom: 24}}
          />
        )}
      </View>
      <FooterComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: appColors.text_secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeMoreButton: {
    backgroundColor: '#D1D182',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginRight: 10,
  },

  seeMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: appColors.text_black,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  categoryContainer: {
    backgroundColor: appColors.bg_btn_light_red,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginHorizontal: 10,
  },
  bannerList: {
    marginTop: 24,
  },
  bannerImage: {
    width: 390,
    height: 150,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  sectionHeader: {
    alignItems: 'center',
    marginVertical: 15,
  },
  promotionContainer: {
    backgroundColor: appColors.bg_btn_light_red,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: appColors.text_black,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: appColors.text_black,
  },
  productCard: {
    marginTop: 10,
    width: 180,
    backgroundColor: appColors.bg_white,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 15,
    shadowColor: appColors.text_black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    elevation: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  brandContainer: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  adsContainer: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  brandName: {
    fontSize: 14,
    color: appColors.text_purple,
    marginTop: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: appColors.text_red,
    fontWeight: 'bold',
    marginRight: 5,
  },
  oldPrice: {
    fontSize: 10,
    color: appColors.text_black,
    textDecorationLine: 'line-through',
  },

  brandText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  adsText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  ratingsContainer: {
    marginVertical: 5,
  },
  ratingText: {
    fontSize: 14,
    color: appColors.text_secondary,
  },
  footerItem: {
    padding: 10,
    fontWeight: '600',
    color: '#007aff',
  },
  addToCartButton: {
    backgroundColor: appColors.bg_btn_blue,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: appColors.text_black,
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
  },
  searchInput: {
    marginTop: 10,
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  searchButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: appColors.text_secondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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

  title: {
    fontSize: 35,
    marginBottom: 10,
    color: '#D10000',
    textAlign: 'center',
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
  titleHeader: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'black',
  },
});

export default SearchScreen;
