import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import {appColors} from '../../constants/appColors';
import {FooterComponent} from '../../components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Product {
  id: string;
  productId: string;
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

const getValidImageUri = (uri: string) => {
  if (uri.includes('localhost')) {
    return uri.replace('localhost', '10.0.2.2');
  }
  return uri;
};

const BrandScreen = ({route, navigation}: any) => {
  const {userId, accessToken} = route.params || {};
  const {brandId, brandName} = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const flatListRef = useRef<FlatList>(null);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

  const handlePageChange = (pageNumber: number) => {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const newPageData = products.slice(startIndex, endIndex);
    setPaginatedProducts(newPageData);
    setPage(pageNumber);

    // Scroll lên đầu khi chuyển trang
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
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

  const handleSearchPress = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchScreen', {
        query: searchQuery,
        userId: userId,
        accessToken: accessToken,
      });
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
    navigation.setOptions({titleName: brandName});

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:8081/api/products?sortBy=name&sortOrder=asc`,
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Lỗi từ server khi lấy toàn bộ sản phẩm:', errorText);
          return;
        }
        const text = await response.text();
        const allProducts: Product[] = text ? JSON.parse(text) : [];

        const filtered = allProducts.filter(p => p.brandId === brandId);
        setProducts(filtered);
        setPaginatedProducts(filtered.slice(0, pageSize));
        setPage(1);
      } catch (error: any) {
        console.error('Lỗi khi fetch sản phẩm:', error?.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [brandId, navigation]);

  const totalPages = Math.ceil(products.length / pageSize);

  const ProductCard = ({
    product,
    navigation,
    userId,
    accessToken,
  }: {
    product: Product;
    navigation: any;
    userId: string;
    accessToken: string;
  }) => {
    const totalStars = 5;
    const averageRating = product.ratings?.average || 0;
    const fullStars = '⭐'.repeat(Math.floor(averageRating));
    const emptyStars = '☆'.repeat(totalStars - Math.floor(averageRating));
    const starRating = fullStars + emptyStars;

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
        <Text style={styles.brandName}>{brandName}</Text>
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

  const renderItem = ({item}: {item: Product}) => (
    <ProductCard
      product={item}
      navigation={navigation}
      userId={userId}
      accessToken={accessToken}
    />
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={appColors.text_secondary} />
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={paginatedProducts}
      extraData={page}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={() => (
        <>
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
          <Text style={styles.title}>{brandName}</Text>
        </>
      )}
      ListFooterComponent={() => (
        <>
          <View style={styles.paginationContainer}>
            {Array.from({length: totalPages}, (_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pageButton,
                  page === index + 1 && styles.pageButtonActive,
                ]}
                onPress={() => handlePageChange(index + 1)}>
                <Text
                  style={[
                    styles.pageButtonText,
                    page === index + 1 && styles.pageButtonTextActive,
                  ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FooterComponent />
        </>
      )}
    />
  );
};

export default BrandScreen;

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  titleHeader: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'black',
  },
  listContainer: {
    paddingBottom: 20,
  },
  column: {
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCard: {
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
  ratingsContainer: {
    marginVertical: 5,
  },
  ratingText: {
    fontSize: 14,
    color: appColors.text_secondary,
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

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    flexWrap: 'wrap',
  },

  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },

  pageButtonActive: {
    backgroundColor: '#000',
  },

  pageButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },

  pageButtonTextActive: {
    color: '#fff',
  },
});
