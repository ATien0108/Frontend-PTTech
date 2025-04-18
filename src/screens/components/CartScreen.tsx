import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  brandId: string;
  categoryId: string;
  quantity: number;
  totalPrice: number;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  productImage: string;
  color: string;
  hexCode: string;
  size: string;
  ram: string;
  storage: string;
  condition: string;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  if (value === undefined || value === null || isNaN(value)) {
    return formatter.format(0);
  }

  return formatter.format(value);
};

const CartScreen = ({navigation, route}: any) => {
  const {userId} = route.params;
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [discountCode, setDiscountCode] = useState('');
  const [street, setStreet] = useState('');
  const [communes, setCommunes] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
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

  const handleFavoritePress = () => {
    if (accessToken && userId) {
      navigation.navigate('FavoriteScreen', {userId, accessToken});
    } else {
      Alert.alert('Bạn cần đăng nhập để xem sản phẩm yêu thích.');
      navigation.navigate('LoginScreen');
    }
  };

  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setAccessToken(token);
    } catch (error) {
      console.error('Lỗi khi lấy accessToken:', error);
      setError('Không thể lấy token. Vui lòng đăng nhập lại.');
      setLoading(false);
    }
  };

  const fetchCartData = async () => {
    if (!accessToken) {
      setError('Không có accessToken. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://10.0.2.2:8081/api/carts/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setCart(response.data);
    } catch (error: any) {
      if (error.response) {
        setError(
          `Lỗi từ server: ${error.response.status} - ${error.response.data}`,
        );
      } else if (error.request) {
        setError(
          'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.',
        );
      } else {
        setError(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseQuantity = async (
    productId: string,
    variantId: string,
  ) => {
    try {
      const response = await axios.put(
        `http://10.0.2.2:8081/api/carts/${cart?.id}/increase/${productId}/${variantId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  const handleDecreaseQuantity = async (
    productId: string,
    variantId: string,
  ) => {
    try {
      const response = await axios.put(
        `http://10.0.2.2:8081/api/carts/${cart?.id}/decrease/${productId}/${variantId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  };

  const handleRemoveItem = async (productId: string, variantId: string) => {
    try {
      const response = await axios.delete(
        `http://10.0.2.2:8081/api/carts/${cart?.id}/items/${productId}/${variantId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setCart(response.data);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleOrderSubmission = async () => {
    if (!cart) {
      Alert.alert(
        'Lỗi',
        'Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.',
      );
      return;
    }

    const totalDiscount = calculateTotalDiscount();
    const finalPrice = cart.totalPrice - totalDiscount + 30000;

    console.log('Dữ liệu order đang gửi đi: ', {
      userId,
      discountCode,
      shippingAddress: {
        street,
        communes,
        district,
        city,
        country,
      },
      phoneNumber,
      orderNotes,
      cartId: cart?.id,
      items: cart.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        brandId: item.brandId,
        categoryId: item.categoryId,
        discountPrice: item.discountPrice,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        productName: item.productName,
        color: item.color,
        hexCode: item.hexCode,
        size: item.size,
        ram: item.ram,
        storage: item.storage,
        condition: item.condition,
        productImage: item.productImage,
      })),
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      discountAmount: totalDiscount,
      finalPrice,
      shippingPrice: 30000,
      paymentMethod: 'COD',
      shippingMethod: 'Giao hàng tiết kiệm',
    });

    try {
      const orderData = {
        userId,
        discountCode,
        shippingAddress: {
          street,
          communes,
          district,
          city,
          country,
        },
        phoneNumber,
        orderNotes,
        cartId: cart?.id,
        items: cart.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          brandId: item.brandId,
          categoryId: item.categoryId,
          discountPrice: item.discountPrice,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          productName: item.productName,
          color: item.color,
          hexCode: item.hexCode,
          size: item.size,
          ram: item.ram,
          storage: item.storage,
          condition: item.condition,
          productImage: item.productImage,
        })),
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        discountAmount: totalDiscount,
        finalPrice,
        shippingPrice: 30000,
        paymentMethod: 'COD',
        shippingMethod: 'Giao hàng tiết kiệm',
      };

      const response = await axios.post(
        'http://10.0.2.2:8081/api/orders',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log('Đáp ứng từ server sau khi đặt hàng: ', response.data);
      Alert.alert('Đặt hàng thành công!');

      const updatedCart = {...cart};
      updatedCart.items = [];

      try {
        await axios.delete(`http://10.0.2.2:8081/api/carts/${cart?.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
      }

      setCart(updatedCart);
    } catch (error) {
      console.error('Error submitting order:', error);
      Alert.alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchCartData();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{marginTop: 10}}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Thử lại" onPress={getAccessToken} />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Giỏ hàng của bạn chưa có sản phẩm.</Text>
      </View>
    );
  }

  const calculateTotalDiscount = () => {
    if (discountCode && discountCode.length > 0) {
      const discountPercentage = parseFloat(discountCode);
      if (!isNaN(discountPercentage) && discountPercentage > 0) {
        return (cart.totalPrice * discountPercentage) / 100;
      }
    }
    return 0;
  };

  const calculateFinalPrice = () => {
    const totalDiscount = calculateTotalDiscount();
    const shippingFee = 30000;
    return cart.totalPrice - totalDiscount + shippingFee;
  };

  return (
    <ScrollView style={styles.container}>
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
                    onPress={handleFavoritePress}>
                    <Icon name="heart-outline" size={22} color="black" />
                    <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
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
      <Text style={styles.title}>Giỏ hàng</Text>
      {cart.items.map((item, index) => (
        <View key={index} style={styles.itemCard}>
          <Image
            source={{uri: item.productImage}}
            style={styles.productImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.productDesc}>
              {item.color} - {item.storage} - {item.condition}
            </Text>
            <Text>
              <Text style={styles.discountPrice}>
                {formatCurrency(item.discountPrice)}
              </Text>
            </Text>
            <View style={styles.itemRow}>
              <View style={styles.actionsLeft}>
                <TouchableOpacity
                  onPress={() =>
                    handleDecreaseQuantity(item.productId, item.variantId)
                  }>
                  <Text style={styles.actionButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.actionButton}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleIncreaseQuantity(item.productId, item.variantId)
                  }>
                  <Text style={styles.actionButton}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.productId, item.variantId)}
                style={styles.deleteButton}>
                <Icon name="delete" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Tạm tính:</Text>
          <Text style={styles.summaryText}>
            {formatCurrency(cart.totalPrice)}{' '}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Giảm giá:</Text>
          <Text style={styles.summaryText}>
            {formatCurrency(calculateTotalDiscount())}{' '}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Phí vận chuyển:</Text>
          <Text style={styles.summaryText}>{formatCurrency(30000)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Tổng tiền:</Text>
          <Text style={styles.summaryText}>
            {formatCurrency(calculateFinalPrice())}{' '}
          </Text>
        </View>

        <Text style={styles.inputLabel}>Mã giảm giá:</Text>
        <TextInput
          style={styles.input}
          value={discountCode}
          onChangeText={setDiscountCode}
          placeholder="Nhập mã giảm giá"
        />

        <Text style={styles.inputLabel}>Họ và tên:</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ và tên"
        />

        <Text style={styles.inputLabel}>Số điện thoại:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Địa chỉ:</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
          placeholder="Số nhà, tên đường"
        />
        <TextInput
          style={styles.input}
          value={communes}
          onChangeText={setCommunes}
          placeholder="Xã/phường"
        />
        <TextInput
          style={styles.input}
          value={district}
          onChangeText={setDistrict}
          placeholder="Quận/huyện"
        />
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Thành phố"
        />
        <TextInput
          style={styles.input}
          value={country}
          onChangeText={setCountry}
          placeholder="Quốc gia"
        />

        <TextInput
          style={styles.input}
          value={orderNotes}
          onChangeText={setOrderNotes}
          placeholder="Ghi chú đơn hàng"
        />

        <Button title="Thanh toán" onPress={handleOrderSubmission} />
      </View>

      <FooterComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productDesc: {
    fontSize: 14,
    color: '#777',
  },
  discountPrice: {
    fontSize: 16,
    color: '#B30000',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  deleteButton: {
    padding: 10,
  },
  summary: {
    padding: 15,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
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

export default CartScreen;
