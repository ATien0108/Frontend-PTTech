import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Image,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';

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

const OrderScreen = ({route}: any) => {
  const {userId} = route.params;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
    if (!accessToken) {
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
      setOrders(response.data);
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lịch sử đơn hàng</Text>
      {orders.map(order => (
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
            <View key={index} style={styles.itemRow}>
              <Image
                source={{uri: item.productImage}}
                style={styles.productImage}
              />
              <View style={{flex: 1}}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.productDesc}>
                  {item.color} - {item.storage} - {item.condition}
                </Text>
                <Text>Số lượng: {item.quantity}</Text>
                <Text>
                  Đơn giá:{' '}
                  <Text style={{color: '#E60000'}}>
                    {formatCurrency(item.discountPrice)}
                  </Text>
                </Text>
              </View>
            </View>
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

            {order.discountCode && (
              <>
                <View style={styles.summaryRow}>
                  <Text>Mã giảm giá</Text>
                  <Text style={styles.price}>{order.discountCode}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Số tiền giảm</Text>
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
            {order.shippingAddress.street}, {order.shippingAddress.communes},{' '}
            {order.shippingAddress.district}, {order.shippingAddress.city}
          </Text>
          <Text>Điện thoại: {order.phoneNumber}</Text>
          <Text>Ghi chú: {order.orderNotes}</Text>

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
        </View>
      ))}
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
});

export default OrderScreen;
