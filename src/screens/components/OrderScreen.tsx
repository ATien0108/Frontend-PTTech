import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  shippingPrice: number;
  discountCode?: string;
  discountAmount?: number;
  finalPrice: number;
  phoneNumber: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingMethod: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  orderNotes?: string;
  cancellationReason?: string;
  returnReason?: string;
  isReturnApproved?: boolean;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  brandId: string;
  categoryId: string;
  discountPrice: number;
  originalPrice: number;
  quantity: number;
  totalPrice: number;
  productName: string;
  color: string;
  hexCode: string;
  size: string;
  ram: string;
  storage: string;
  condition: string;
  productImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  street: string;
  communes: string;
  district: string;
  city: string;
  country: string;
}

const getValidImageUri = (uri: string) => {
  if (uri.includes('localhost')) {
    return uri.replace('localhost', '10.0.2.2');
  }
  return uri;
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`;
};

const OrderScreen = ({navigation, route}: any) => {
  const {userId} = route.params;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(
    null,
  );
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [reviewImages, setReviewImages] = useState<any[]>([]);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<
    'cancel' | 'return' | null
  >(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState<string>('');
  const waitingOrders = orders.filter(
    order => order.orderStatus === 'Chờ xác nhận',
  );
  const deliveringOrders = orders.filter(
    order => order.orderStatus === 'Đang giao',
  );
  const deliveredOrders = orders.filter(
    order => order.orderStatus === 'Đã giao',
  );

  const totalWaiting = waitingOrders.reduce(
    (sum, order) => sum + order.finalPrice,
    0,
  );
  const totalDelivering = deliveringOrders.reduce(
    (sum, order) => sum + order.finalPrice,
    0,
  );
  const totalDelivered = deliveredOrders.reduce(
    (sum, order) => sum + order.finalPrice,
    0,
  );
  const totalWaitingOrders = waitingOrders.length;
  const totalDeliveringOrders = deliveringOrders.length;
  const totalDeliveredOrders = deliveredOrders.length;
  const totalOrders = orders.length;
  const [page, setPage] = useState(1);
  const pageSize = 2;
  const scrollViewRef = useRef<ScrollView>(null);
  const [reviewedVariantsMap, setReviewedVariantsMap] = useState<
    Record<string, Set<string>> // Sử dụng Set để tránh trùng lặp
  >({});
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const statusOptions = [
    'Chờ xác nhận',
    'Chờ lấy hàng',
    'Đã giao',
    'Đang giao',
    'Đã hủy',
    'Đã trả hàng',
  ];
  const fetchAllReviewedVariants = async () => {
    const reviewedMap: Record<string, Set<string>> = {}; // Dùng Set để lưu trữ các variant đã được đánh giá

    const delivered = orders.filter(order => order.orderStatus === 'Đã giao');

    try {
      for (const order of delivered) {
        const res = await axios.get(
          `http://10.0.2.2:8081/api/reviews/order/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (res && res.data) {
          // Lọc các sản phẩm đã được đánh giá (không bị xóa)
          const reviewedVariants = res.data
            .filter((r: any) => !r.isDeleted)
            .map((r: any) => r.productVariantId);

          reviewedMap[order.id] = new Set(reviewedVariants); // Sử dụng Set để tránh trùng lặp
        }
      }

      setReviewedVariantsMap(reviewedMap);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đánh giá:', err);
    }
  };

  useEffect(() => {
    if (accessToken && orders.length > 0) {
      fetchAllReviewedVariants();
    }
  }, [accessToken, orders]);

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

  const fetchOrdersData = async () => {
    console.log('Gọi fetchOrdersData'); // ✅

    if (!accessToken) {
      console.warn('Không có accessToken');
      setError('Không có accessToken. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://10.0.2.2:8081/api/orders/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log('Response data:', response.data); // ✅

      const data = response.data;
      if (!Array.isArray(data)) {
        console.error('Dữ liệu không phải là mảng:', data);
        setError('Dữ liệu không hợp lệ từ server.');
        setLoading(false);
        return;
      }

      const sortedOrders = data.sort((a: any, b: any) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setOrders(sortedOrders);
    } catch (error: any) {
      console.error('Lỗi khi fetch đơn hàng:', error);
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
      console.log('Kết thúc fetchOrdersData'); // ✅
      setLoading(false);
    }
  };

  const filterOrdersByStatus = (orders: Order[], status: string | null) => {
    if (!status) return orders;
    return orders.filter(order => order.orderStatus === status);
  };

  const filteredOrders = filterOrdersByStatus(orders, filterStatus);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const handleCancelOrReturn = async (
    orderId: string,
    action: 'cancel' | 'return',
    reason: string,
  ) => {
    if (!accessToken) return;

    const url =
      action === 'cancel'
        ? `http://10.0.2.2:8081/api/orders/cancel/${orderId}?cancellationReason=${encodeURIComponent(
            reason,
          )}`
        : `http://10.0.2.2:8081/api/orders/${orderId}/request-return?returnReason=${encodeURIComponent(
            reason,
          )}`;

    try {
      await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      fetchOrdersData();

      Alert.alert(
        'Thành công',
        action === 'cancel'
          ? 'Đơn hàng đã được hủy.'
          : 'Yêu cầu trả hàng đã được gửi.',
      );
    } catch (error: any) {
      console.error('Lỗi khi gửi lý do:', error);
      Alert.alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderItem || rating === 0 || !reviewText) {
      Alert.alert('Vui lòng nhập đủ thông tin đánh giá.');
      setShowReviewModal(false);
      return;
    }

    const order = orders.find(order =>
      order.items.some(item => item.productId === selectedOrderItem.productId),
    );

    if (!order) {
      Alert.alert('Lỗi', 'Không tìm thấy đơn hàng tương ứng.');
      setShowReviewModal(false);
      return;
    }

    const orderId = order.id;

    if (!orderId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID đơn hàng.');
      setShowReviewModal(false);
      return;
    }

    const reviewData = {
      productId: selectedOrderItem.productId,
      productVariantId: selectedOrderItem.variantId,
      userId: userId,
      orderId: orderId,
      rating: rating,
      review: reviewText,
      reviewTitle:
        reviewTitle || `Đánh giá sản phẩm ${selectedOrderItem.productName}`,
      images:
        reviewImages.length > 0 ? reviewImages.map(image => image.uri) : [''],
      isDeleted: false,
    };

    console.log('Dữ liệu đánh giá gửi đi: ', reviewData);

    try {
      const response = await axios.post(
        'http://10.0.2.2:8081/api/reviews',
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response && response.status === 200) {
        Alert.alert('Đánh giá thành công!', 'Cảm ơn bạn đã đánh giá sản phẩm.');
        fetchOrdersData();
      }
    } catch (error) {
      console.log('Lỗi khi gửi đánh giá:', error);
    } finally {
      setShowReviewModal(false);
    }
  };

  const handleImageSelect = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.assets) {
        setReviewImages(response.assets);
      }
    });
  };

  const handleReviewModalClose = () => {
    setSelectedOrderItem(null);
    setReviewTitle('');
    setReviewText('');
    setRating(0);
    setReviewImages([]);
    setShowReviewModal(false);
  };
  useEffect(() => {
    getAccessToken();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchOrdersData();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{marginTop: 10}}>Đang tải lịch sử đơn hàng...</Text>
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

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Chưa có đơn hàng nào.</Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
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

      <Text style={styles.title}>Lịch sử đơn hàng</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setFilterStatus(null)}
          style={styles.filterButton}>
          <Text>Tất cả</Text>
        </TouchableOpacity>
        {[
          'Chờ xác nhận',
          'Chờ lấy hàng',
          'Đã giao',
          'Đang giao',
          'Đã hủy',
          'Đã trả hàng',
        ].map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilterStatus(status)}
            style={styles.filterButton}>
            <Text>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.moneySummaryContainer}>
        <Text style={styles.totalOrderText}>
          Tổng số đơn hàng: {totalOrders} đơn (gồm tất cả trạng thái)
        </Text>

        <View style={styles.moneyItem}>
          <Text style={styles.moneyLabel}>
            Chờ xác nhận: ({totalWaitingOrders} đơn)
          </Text>
          <View>
            <Text style={styles.moneyValue}>
              {formatCurrency(totalWaiting)}
            </Text>
          </View>
        </View>

        <View style={styles.moneyItem}>
          <Text style={styles.moneyLabel}>
            Đang giao: ( {totalDeliveringOrders} đơn)
          </Text>
          <View>
            <Text style={styles.moneyValue}>
              {formatCurrency(totalDelivering)}
            </Text>
          </View>
        </View>

        <View style={styles.moneyItem}>
          <Text style={styles.moneyLabel}>
            Đã giao: ({totalDeliveredOrders} đơn)
          </Text>
          <View>
            <Text style={styles.moneyValue}>
              {formatCurrency(totalDelivered)}
            </Text>
          </View>
        </View>
      </View>

      {paginatedOrders.map(order => (
        <View key={order.id} style={styles.card}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Đơn hàng #{order.orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>

          <Text style={styles.status}>
            Trạng thái:{' '}
            <Text style={{color: '#00C725'}}>{order.orderStatus}</Text>
          </Text>

          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          {order.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.itemRow}
              onPress={() => {
                navigation.navigate('ProductDetailScreen', {
                  productId: item.productId,
                  userId,
                  accessToken,
                });
              }}>
              <Image
                source={{uri: getValidImageUri(item.productImage)}}
                style={styles.productImage}
              />
              <View style={{flex: 1}}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.productDesc}>
                  {[item.color, item.storage, item.condition]
                    .filter(value => value && value.trim() !== '')
                    .join(' - ')}
                </Text>

                <Text>Số lượng: {item.quantity}</Text>
                <Text>
                  Đơn giá:{' '}
                  <Text style={{color: '#E60000'}}>
                    {formatCurrency(item.discountPrice)}
                  </Text>
                </Text>
              </View>

              {order.orderStatus === 'Đã giao' &&
                !reviewedVariantsMap[order.id]?.has(item.variantId) && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedOrderItem(item);
                      setShowReviewModal(true);
                    }}
                    style={styles.reviewButton}>
                    <Text style={styles.reviewButtonText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={{fontWeight: 'bold'}}>Tổng giá trị sản phẩm</Text>
              <Text style={styles.price}>
                {formatCurrency(order.totalPrice)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text>Phí vận chuyển</Text>
              <Text style={styles.price}>
                {formatCurrency(order.shippingPrice)}
              </Text>
            </View>

            {order.discountCode && order.discountCode.trim() !== '' && (
              <>
                <View style={styles.summaryRow}>
                  <Text>Mã giảm giá ({order.discountCode})</Text>
                  <Text style={styles.price}>
                    {formatCurrency(order.discountAmount || 0)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.summaryRow}>
              <Text>Tổng cộng</Text>
              <Text style={[styles.price, {color: 'green'}]}>
                {formatCurrency(order.finalPrice)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <Text>
            Địa chỉ: {order.shippingAddress.street},{' '}
            {order.shippingAddress.communes}, {order.shippingAddress.district},{' '}
            {order.shippingAddress.city}
          </Text>
          <Text>SĐT: {order.phoneNumber}</Text>
          {order.orderNotes && order.orderNotes.trim() !== '' && (
            <Text>Ghi chú: {order.orderNotes}</Text>
          )}
          {showReviewModal && selectedOrderItem && (
            <Modal visible={showReviewModal} animationType="slide">
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  Đánh giá sản phẩm: {selectedOrderItem.productName}
                </Text>
                <TextInput
                  placeholder="Tiêu đề đánh giá"
                  value={reviewTitle}
                  onChangeText={setReviewTitle}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Mô tả đánh giá"
                  value={reviewText}
                  onChangeText={setReviewText}
                  style={[styles.input, {height: 100}]}
                  multiline
                />

                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.star}>
                      <Text
                        style={[
                          {fontSize: 30},
                          rating >= star && {color: '#FFD700'},
                        ]}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button title="Chọn ảnh" onPress={handleImageSelect} />
                <ScrollView horizontal>
                  {reviewImages.map((image, index) => (
                    <Image
                      key={index}
                      source={{uri: image.uri}}
                      style={styles.reviewImage}
                    />
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[styles.button, {marginTop: 10}]}
                  onPress={handleSubmitReview}>
                  <Text style={styles.buttonText}>Gửi đánh giá</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    {marginTop: 10},
                    {backgroundColor: '#808080'},
                  ]}
                  onPress={handleReviewModalClose}>
                  <Text style={styles.buttonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <Text>{order.paymentMethod}</Text>
          <Text>
            Trạng thái thanh toán:{' '}
            <Text
              style={{
                color: '#00C725',
              }}>
              {order.paymentStatus}
            </Text>
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Phương thức giao hàng</Text>
          <Text>{order.shippingMethod}</Text>
          {order.orderStatus === 'Chờ xác nhận' && (
            <>
              <Button
                title="Hủy đơn hàng"
                color="#FF0000"
                onPress={() => {
                  setSelectedAction('cancel');
                  setSelectedOrderId(order.id);
                }}
              />
            </>
          )}

          {order.orderStatus === 'Đã giao' && (
            <>
              <Button
                title="Trả hàng"
                color="#FFA500"
                onPress={() => {
                  setSelectedAction('return');
                  setSelectedOrderId(order.id);
                }}
              />
            </>
          )}

          {selectedOrderId === order.id && (
            <View style={{marginTop: 10}}>
              <TextInput
                placeholder={
                  selectedAction === 'cancel'
                    ? 'Nhập lý do hủy đơn hàng'
                    : 'Nhập lý do trả hàng'
                }
                value={reasonText}
                onChangeText={setReasonText}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  padding: 10,
                  marginBottom: 10,
                }}
                multiline
              />
              <Button
                title="Gửi"
                onPress={() => {
                  if (!reasonText.trim()) {
                    Alert.alert('Vui lòng nhập lý do.');
                    return;
                  }
                  handleCancelOrReturn(order.id, selectedAction!, reasonText);
                  setReasonText('');
                  setSelectedAction(null);
                  setSelectedOrderId(null);
                }}
              />
            </View>
          )}
        </View>
      ))}
      <View style={styles.paginationContainer}>
        {Array.from({length: totalPages}, (_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pageButton,
              page === index + 1 && styles.pageButtonActive,
            ]}
            onPress={() => {
              setPage(index + 1);
              scrollViewRef.current?.scrollTo({y: 0, animated: true});
            }}>
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
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    color: '#B30000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 16,
    color: '#1500FF',
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
  },
  status: {
    fontSize: 14,
    marginVertical: 6,
  },
  sectionTitle: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 15,
  },
  itemRow: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  productDesc: {
    fontSize: 13,
    color: '#555',
  },
  summary: {
    marginTop: 10,
    gap: 2,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    width: '100%',
    marginVertical: 15,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  price: {
    fontWeight: 'bold',
  },
  reviewButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: 120,
    alignSelf: 'flex-start',
  },

  reviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  closeButton: {
    backgroundColor: appColors.bg_btn_light_gray,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: appColors.text_black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectImageButton: {
    backgroundColor: '#FF69B4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  selectImageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  star: {
    fontSize: 30,
    marginHorizontal: 5,
    color: '#ccc',
  },
  reviewImage: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
  moneySummaryContainer: {
    backgroundColor: '#EFEFEF',
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
  },
  moneyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  moneyLabel: {
    fontWeight: '500',
    color: '#444',
  },
  moneyValue: {
    fontWeight: 'bold',
    color: appColors.text_secondary,
  },
  orderCountText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  totalOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    flexWrap: 'wrap',
  },

  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },

  pageButtonActive: {
    backgroundColor: '#333',
  },

  pageButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },

  pageButtonTextActive: {
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  filterButton: {
    backgroundColor: appColors.bg_btn_light_red,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OrderScreen;
