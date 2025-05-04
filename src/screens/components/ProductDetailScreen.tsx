import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {HeaderComponent, FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import axios from 'axios';
import {
  SectionComponent,
  TextComponent,
  SpaceComponent,
} from '../../components';
import HTML from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8081/api/products';
const REVIEW_API_URL = 'http://10.0.2.2:8081/api/reviews/product';
const USER_API_URL = 'http://10.0.2.2:8081/api/users';
const BRAND_API_URL = 'http://10.0.2.2:8081/api/brands';

const TABS = [
  {id: 'specifications', title: 'Thông số'},
  {id: 'blog', title: 'Bài viết'},
  {id: 'warranty', title: 'Bảo hành'},
  {id: 'reviews', title: 'Đánh giá'},
];

const getValidImageUri = (uri: string) => {
  if (uri.includes('localhost')) {
    return uri.replace('localhost', '10.0.2.2');
  }
  return uri;
};

const ProductImageCarousel = ({images}: {images: string[]}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.imageCarousel}>
      {images.map((img, index) => (
        <Image
          key={index}
          source={{uri: getValidImageUri(img)}}
          style={styles.thumbnail}
        />
      ))}
    </ScrollView>
  );
};

const ProductDetailScreen = ({navigation, route}: any) => {
  const {userId, accessToken} = route.params || {};

  const {productId} = route.params || {};
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [reviews, setReviews] = useState<any[]>([]);
  const [usernames, setUsernames] = useState<any>({});
  const [brandName, setBrandName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchCartId = async () => {
      if (userId) {
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');

          if (!accessToken) {
            Alert.alert('Lỗi', 'Bạn cần đăng nhập để truy cập giỏ hàng.');
            return;
          }

          console.log('Fetching cartId for user:', userId);
          const response = await axios.get(
            `http://10.0.2.2:8081/api/carts/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          if (response.data && response.data.id) {
            console.log('Cart ID fetched:', response.data.id);
            setCartId(response.data.id);
          } else {
            Alert.alert('Lỗi', 'Không tìm thấy giỏ hàng.');
          }
        } catch (error) {
          console.error('Error fetching cartId:', error);
          Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lấy giỏ hàng.');
        }
      }
    };

    fetchCartId();
  }, [userId]);

  useEffect(() => {
    const fetchDiscountCodes = async () => {
      try {
        const response = await axios.get(
          'http://10.0.2.2:8081/api/discount-codes',
        );
        const allDiscountCodes = response.data;

        const applicableDiscountCodes = allDiscountCodes.filter(
          (discountCode: any) =>
            discountCode.applicableProducts.includes(productId),
        );

        setDiscountCodes(applicableDiscountCodes);
      } catch (error) {
        console.error('Error fetching discount codes:', error);
      }
    };

    if (productId) {
      fetchDiscountCodes();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      Alert.alert('Lỗi', 'Vui lòng chọn biến thể sản phẩm.');
      return;
    }

    if (!cartId) {
      Alert.alert('Lỗi', 'Không tìm thấy giỏ hàng.');
      return;
    }

    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }

    const cartItem = {
      productId: productId,
      variantId: selectedVariant.variantId,
      brandId: product.brandId,
      categoryId: product.categoryId,
      quantity: selectedQuantity,
      productName: product.name,
      originalPrice: product.pricing.original,
      discountPrice: product.pricing.current,
      ratingAverage: product.ratings.average,
      totalReviews: product.ratings.totalReviews,
      productImage: product.images[0],
      color: selectedVariant.color,
      hexCode: selectedVariant.hexCode,
      size: selectedVariant.size,
      ram: selectedVariant.ram,
      storage: selectedVariant.storage,
      condition: product.condition,
    };

    try {
      const response = await axios.post(
        `http://10.0.2.2:8081/api/carts/${cartId}/items`,
        cartItem,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng!');
      } else {
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
      }
    } catch (error: any) {
      console.error('Error adding product to cart:', error);

      if (error.response) {
        console.error('Error Response:', error.response.data);
        console.error('Error Status:', error.response.status);
        console.error('Error Headers:', error.response.headers);
        Alert.alert('Lỗi', `Server Error: ${error.response.status}`);
      } else if (error.request) {
        console.error('Error Request:', error.request);
        Alert.alert('Lỗi', 'Không nhận được phản hồi từ server.');
      } else {
        console.error('Error Message:', error.message);
        Alert.alert('Lỗi', `Lỗi trong quá trình gửi yêu cầu: ${error.message}`);
      }
    }

    setIsModalVisible(false);
  };

  const openVariantSelectionModal = () => {
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setSelectedQuantity(1);
      setIsModalVisible(true);
    }
  };

  const handleVariantSelection = (variant: any) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      console.log('Updating quantity to:', value);
      setSelectedQuantity(value);
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
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`${API_URL}/${productId}`);
        setProduct(response.data);
        setSelectedVariant(response.data.variants[0]);

        const reviewsResponse = await axios.get(
          `${REVIEW_API_URL}/${productId}`,
        );
        setReviews(reviewsResponse.data);

        await fetchBrandName(response.data.brandId);

        await fetchUsernames(reviewsResponse.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchBrandName = async (brandId: string) => {
    try {
      const brandResponse = await axios.get(`${BRAND_API_URL}/${brandId}`);
      setBrandName(brandResponse.data.name);
    } catch (error) {
      console.error('Error fetching brand name:', error);
    }
  };

  const fetchUsernames = async (reviews: any[]) => {
    try {
      const userPromises = reviews.map(async (review: any) => {
        console.log('Fetching user for review:', review);

        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Access token not found');
        }

        const userResponse = await axios.get(
          `${USER_API_URL}/${review.userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        console.log('User data fetched:', userResponse.data);
        return {userId: review.userId, username: userResponse.data.username};
      });

      const userResults = await Promise.all(userPromises);

      console.log('Fetched user results:', userResults);

      const usernameMap = userResults.reduce(
        (acc: any, {userId, username}: any) => {
          acc[userId] = username;
          return acc;
        },
        {},
      );

      setUsernames(usernameMap);
    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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

      <SectionComponent styles={{alignItems: 'center'}}>
        <TextComponent
          size={30}
          title
          text="Chi tiết sản phẩm"
          color={appColors.text_red}
        />
        <SpaceComponent height={25} />
      </SectionComponent>

      <Image
        source={{uri: getValidImageUri(product.images[0])}}
        style={styles.productImage}
      />

      <ProductImageCarousel images={product.images} />

      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.brandName}>Thương hiệu: {brandName}</Text>

        <View style={styles.ratingContainer}>
          {product.ratings.totalReviews === 0 ? (
            <Text style={styles.ratingText}>Chưa có đánh giá</Text>
          ) : (
            <Text style={styles.ratingText}>
              {(() => {
                const totalStars = 5;
                const average = product.ratings.average;
                const full = Math.floor(average);
                const hasHalf = average % 1 !== 0;
                const empty = totalStars - full - (hasHalf ? 1 : 0);

                const fullStars = '⭐'.repeat(full);
                const halfStar = hasHalf ? '⯪' : '';
                const emptyStars = '☆'.repeat(empty);

                return `${fullStars}${halfStar}${emptyStars} (${product.ratings.totalReviews} đánh giá)`;
              })()}
            </Text>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.pricing.current)}
          </Text>
          <Text style={styles.oldPrice}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.pricing.original)}
          </Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
      </View>

      <View style={styles.variantContainer}>
        <Text style={styles.sectionTitle}>Biến thể</Text>
        <FlatList
          data={product.variants}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.variantId.toString()}
          renderItem={({item}) => {
            const variantDetails = [];

            if (item.color) variantDetails.push(item.color);
            if (item.size) variantDetails.push(item.size);
            if (item.ram) variantDetails.push(item.ram);
            if (item.storage) variantDetails.push(item.storage);
            if (item.stock) variantDetails.push(item.stock);

            return (
              <TouchableOpacity
                style={[
                  styles.variantButton,
                  selectedVariant.variantId === item.variantId &&
                    styles.variantButtonSelected,
                ]}
                onPress={() => setSelectedVariant(item)}>
                <Text style={styles.variantText}>
                  {variantDetails.join(' - ')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={openVariantSelectionModal}>
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chọn Biến thể và Số lượng</Text>

              {/* Variant Selection */}
              <Text style={styles.selectLabel}>Chọn Biến thể</Text>
              <FlatList
                data={product.variants}
                keyExtractor={item => item.variantId.toString()}
                ItemSeparatorComponent={() => <View style={{height: 10}} />}
                renderItem={({item}) => {
                  const variantDetails = [];

                  if (item.color) variantDetails.push(item.color);
                  if (item.size) variantDetails.push(item.size);
                  if (item.ram) variantDetails.push(item.ram);
                  if (item.storage) variantDetails.push(item.storage);
                  if (item.stock) variantDetails.push(`Kho: ${item.stock}`);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.variantButton,
                        selectedVariant?.variantId === item.variantId &&
                          styles.variantButtonSelected,
                      ]}
                      onPress={() => handleVariantSelection(item)}>
                      <Text style={styles.variantText}>
                        {variantDetails.join(' - ')}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              {/* Quantity Selection */}
              <Text style={styles.selectLabel}>Chọn Số lượng</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  onPress={() => handleQuantityChange(selectedQuantity - 1)}
                  disabled={selectedQuantity <= 1}>
                  <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{selectedQuantity}</Text>
                <TouchableOpacity
                  onPress={() => handleQuantityChange(selectedQuantity + 1)}>
                  <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddToCart}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}>
            <Text style={styles.tabText}>{tab.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'specifications' && (
          <View style={styles.specificationsContainer}>
            {Object.entries(product.specifications).map(
              ([key, value], index) => (
                <View key={index} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{String(value)}</Text>
                </View>
              ),
            )}
          </View>
        )}
        {activeTab === 'blog' && (
          <View style={styles.blogContainer}>
            <Text style={styles.blogTitle}>{product.blog.title}</Text>
            <Text style={styles.blogDescription}>
              {product.blog.description}
            </Text>

            <HTML
              source={{html: product.blog.content}}
              contentWidth={300}
              tagsStyles={{
                h1: {fontSize: 24, fontWeight: 'bold'},
                h3: {fontSize: 18, fontWeight: 'bold'},
                p: {fontSize: 16},
                strong: {fontWeight: 'bold', color: '#363636'},
                span: {color: '#4a4a4a'},
              }}
            />
          </View>
        )}
        {activeTab === 'warranty' && (
          <View style={styles.warrantyContainer}>
            <Text style={styles.warrantyTitle}>Bảo hành</Text>
            <Text style={styles.warrantyContent}>
              {product.warranty.duration} - {product.warranty.terms}
            </Text>
          </View>
        )}
        {activeTab === 'reviews' && (
          <View style={styles.reviewsContainer}>
            <Text style={styles.reviewsTitle}>Đánh giá sản phẩm</Text>
            {reviews.length > 0 ? (
              reviews.map((review: any, index: number) => {
                const username = usernames[review.userId] || 'Unknown User';
                return (
                  <View key={index} style={styles.reviewCard}>
                    <Text style={styles.reviewerName}>{username}</Text>
                    <Text style={styles.reviewText}>{review.review}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noReviewsText}>Chưa có đánh giá nào.</Text>
            )}
          </View>
        )}
      </View>
      {discountCodes.length > 0 && (
        <View style={styles.discountContainer}>
          <Text style={styles.discountTitle}>Thu nhập mã giảm giá</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {discountCodes.map((code, index) => (
              <View key={index} style={styles.discountItem}>
                <Text style={styles.discountText}>{code.code}</Text>
                <Text style={styles.discountText}>{code.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <FooterComponent />
    </ScrollView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  warrantyContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },

  warrantyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },

  warrantyContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },

  blogContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },

  blogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },

  blogDescription: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },

  blogContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },

  blogDate: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },

  specificationsContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
  },

  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  specKey: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  specValue: {
    flex: 2,
    maxWidth: '80%',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    padding: 10,
    backgroundColor: appColors.bg_light_gray,
  },
  tabButton: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {borderBottomColor: appColors.text_red},
  tabText: {fontSize: 16, fontWeight: 'bold', color: appColors.text_black},
  tabContent: {
    padding: 15,
    backgroundColor: appColors.bg_white,
    borderRadius: 8,
    marginVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  imageCarousel: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  detailsContainer: {
    padding: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.text_black,
  },
  brandName: {
    fontSize: 16,
    color: appColors.text_purple,
    marginVertical: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: appColors.text_black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.text_red,
  },
  oldPrice: {
    fontSize: 16,
    color: appColors.text_secondary,
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },

  descriptionContainer: {
    padding: 15,
    backgroundColor: appColors.bg_light_gray,
    borderRadius: 8,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.text_black,
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: appColors.text_black,
  },
  variantContainer: {
    padding: 15,
    gap: 10,
  },

  variantButton: {
    backgroundColor: appColors.bg_btn_dark_blue,
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 5,
  },

  variantButtonSelected: {
    backgroundColor: appColors.bg_btn_dark_blue,
  },
  variantText: {
    color: appColors.text_white,
  },
  addToCartButton: {
    backgroundColor: appColors.bg_btn_dark_green,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    margin: 15,
  },
  addToCartText: {
    color: appColors.text_black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.text_black,
  },
  reviewCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: appColors.bg_light_gray,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.text_black,
  },
  reviewDate: {
    fontSize: 14,
    color: appColors.text_secondary,
    marginTop: 5,
  },
  reviewText: {
    fontSize: 16,
    color: appColors.text_black,
    marginTop: 10,
  },
  noReviewsText: {
    fontSize: 16,
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
  titleHeader: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'black',
  },

  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectLabel: {
    fontSize: 16,
    marginBottom: 10,
  },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityButton: {
    fontSize: 24,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  discountContainer: {
    padding: 20,
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // for Android shadow
  },
  discountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  discountItem: {
    marginRight: 15, // space between each discount code
    backgroundColor: '#eee', // Optional: add background color for each item
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // Optional: round the corners
  },
  discountText: {
    fontSize: 16,
    color: '#333',
  },
});
