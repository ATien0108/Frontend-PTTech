import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

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

const banners = [
  require('../../assets/images/banners1.png'),
  require('../../assets/images/banners2.png'),
  require('../../assets/images/banners3.png'),
  require('../../assets/images/banners4.png'),
  require('../../assets/images/banners5.png'),
  require('../../assets/images/banners6.png'),
  require('../../assets/images/banners7.png'),
];

interface AdImages {
  id: string;
  title: string;
}

const handleSeeMore = () => {
  console.log('Xem thêm sản phẩm');
};

const HomeScreen = ({navigation, route}: any) => {
  const {userId, accessToken} = route.params || {};

  const [brandsData, setBrandsData] = useState<Brand[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [adimagesData, setAdImagesData] = useState<AdImages[]>([]);
  const adsFlatListRef = useRef<FlatList>(null);
  const [topSellingProductsData, setTopSellingProductsData] = useState<
    Product[]
  >([]);
  const [topRatedProductsData, setTopRatedProductsData] = useState<Product[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannersFlatListRef = useRef<FlatList>(null);
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= banners.length ? 0 : nextIndex;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (bannersFlatListRef.current) {
      bannersFlatListRef.current.scrollToIndex({
        index: currentIndex,
        animated: true,
      });
    }
  }, [currentIndex]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://10.0.2.2:8081/api/brands');
        const data = await response.json();
        if (response.ok) {
          setBrandsData(data);
        } else {
          setError('Không tải được thương hiệu');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tìm kiếm thương hiệu');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://10.0.2.2:8081/api/categories');
        const data = await response.json();
        if (response.ok) {
          setCategoriesData(data);
        } else {
          setError('Không tải được danh mục');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tìm kiếm danh mục');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAdImages = async () => {
      try {
        const response = await fetch('http://10.0.2.2:8081/api/ad-images');
        const data = await response.json();
        if (response.ok) {
          setAdImagesData(data);
        } else {
          setError('Không tải được quảng cáo');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tìm kiếm quảng cáo');
      } finally {
        setLoading(false);
      }
    };

    fetchAdImages();
  }, []);

  useEffect(() => {
    if (adimagesData.length === 0) return;

    let offset = 0;

    const intervalId = setInterval(() => {
      if (adsFlatListRef.current) {
        offset += 200;

        if (offset >= adimagesData.length * 200) {
          offset = 0;
          const firstItem = adimagesData[0];
          adimagesData.push(firstItem);
          adimagesData.shift();
        }

        adsFlatListRef.current.scrollToOffset({offset, animated: true});
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [adimagesData]);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const response = await fetch(
          'http://10.0.2.2:8081/api/products/top-selling',
        );
        const data = await response.json();
        if (response.ok) {
          setTopSellingProductsData(data);
        } else {
          setError('Không tải được các sản phẩm bán chạy nhất');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tìm kiếm các sản phẩm bán chạy nhất');
      }
    };

    fetchTopSellingProducts();
  }, []);

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        const response = await fetch(
          'http://10.0.2.2:8081/api/products/top-rated',
        );
        const data = await response.json();
        if (response.ok) {
          setTopRatedProductsData(data);
        } else {
          setError('Không tải được các sản phẩm được khuyến mãi');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tìm kiếm các sản phẩm khuyến mãi');
      }
    };

    fetchTopRatedProducts();
  }, []);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PTTechShop</Text>
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

              <TouchableOpacity style={styles.menuItem}>
                <Icon name="heart-outline" size={22} color="black" />
                <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.categoryContainer}>
        {loading ? (
          <Text>Đang tải danh mục...</Text>
        ) : error ? (
          <Text>{error}</Text>
        ) : (
          <FlatList
            horizontal
            data={categoriesData}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CategoryScreen', {
                    categoryId: item.id,
                    categoryName: item.name,
                  })
                }>
                <Text style={styles.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.container}>
        <FlatList
          ref={bannersFlatListRef}
          horizontal
          data={banners}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <Image source={item} style={styles.bannerImage} />
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.bannerList}
        />
      </View>

      <View style={styles.promotionContainer}>
        <Text style={styles.sectionTitle}>Sản phẩm khuyến mãi</Text>
        <Text style={styles.sectionSubtitle}>
          Khám phá những sản phẩm công nghệ được yêu thích nhất!
        </Text>
      </View>

      <FlatList
        horizontal
        data={topRatedProductsData}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ProductCard product={item} navigation={navigation} />
        )}
        showsHorizontalScrollIndicator={false}
        style={{marginBottom: 24}}
      />

      <TouchableOpacity style={styles.seeMoreButton} onPress={handleSeeMore}>
        <Text style={styles.seeMoreText}>Xem thêm</Text>
      </TouchableOpacity>

      <View style={styles.adsContainer}>
        {loading ? (
          <Text>Đang tải quảng cáo...</Text>
        ) : error ? (
          <Text>{error}</Text>
        ) : (
          <FlatList
            ref={adsFlatListRef}
            horizontal
            data={adimagesData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <Text style={styles.adsText}>{item.title}</Text>
            )}
            showsHorizontalScrollIndicator={false}
            onScrollToIndexFailed={() => {}}
          />
        )}
      </View>

      <View style={styles.promotionContainer}>
        <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
        <Text style={styles.sectionSubtitle}>
          Khám phá những sản phẩm công nghệ được yêu thích nhất!
        </Text>
      </View>
      <FlatList
        horizontal
        data={topSellingProductsData}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ProductCard product={item} navigation={navigation} />
        )}
        showsHorizontalScrollIndicator={false}
        style={{marginBottom: 24}}
      />

      <TouchableOpacity style={styles.seeMoreButton} onPress={handleSeeMore}>
        <Text style={styles.seeMoreText}>Xem thêm</Text>
      </TouchableOpacity>

      <View style={styles.brandContainer}>
        {loading ? (
          <Text>Đang tải thương hiệu...</Text>
        ) : error ? (
          <Text>{error}</Text>
        ) : (
          <FlatList
            horizontal
            data={brandsData}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('BrandScreen', {
                    brandId: item.id,
                    brandName: item.name,
                  })
                }>
                <Text style={styles.brandText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      <FooterComponent />
    </ScrollView>
  );
};

const ProductCard: React.FC<{product: Product; navigation: any}> = ({
  product,
  navigation,
}) => {
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
        navigation.navigate('ProductDetailScreen', {productId: product.id})
      }>
      <Image source={{uri: product.images[0]}} style={styles.productImage} />
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

export default HomeScreen;

const styles = StyleSheet.create({
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
  title: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'black',
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
