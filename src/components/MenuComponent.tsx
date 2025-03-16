import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MenuComponent: React.FC = () => {
  return (
    <View style={styles.menuContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="magnify" size={18} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.menuItem}>
        <Icon name="home-outline" size={22} color="black" />
        <Text style={styles.menuText}>Trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Icon name="account-outline" size={22} color="black" />
        <Text style={styles.menuText}>Thông tin cá nhân</Text>
      </TouchableOpacity>

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

      <TouchableOpacity style={styles.menuItem}>
        <Icon name="logout" size={22} color="black" />
        <Text style={styles.menuText}>Đăng xuất</Text>
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
