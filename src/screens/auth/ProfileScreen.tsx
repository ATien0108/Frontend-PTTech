import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FooterComponent,
  SectionComponent,
  TextComponent,
  InputComponent,
  SpaceComponent,
  RowComponent,
} from '../../components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {appColors} from '../../constants/appColors';
import {launchImageLibrary} from 'react-native-image-picker';
import {PermissionsAndroid, Platform} from 'react-native';
import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';

const ProfileScreen = ({route, navigation}: any) => {
  const {userId} = route.params;

  const [userData, setUserData] = useState<any>(null);
  const [receiveEmail, setReceiveEmail] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setAccessToken(token);
    } catch (error) {
      console.error('Error fetching access token:', error);
      setError('Không thể lấy token. Vui lòng đăng nhập lại.');
      setLoading(false);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const granted = await PermissionsAndroid.request(permission, {
        title: 'Cấp quyền truy cập ảnh',
        message: 'Ứng dụng cần quyền để chọn ảnh avatar.',
        buttonPositive: 'Đồng ý',
        buttonNegative: 'Hủy',
      });

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  };

  const handleChooseAvatar = async () => {
    const hasPermission = await requestStoragePermission();
    console.log('Permission granted:', hasPermission);
    if (!hasPermission) return;

    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 1},
      async (response: any) => {
        console.log('Image picker response:', response);

        if (response.didCancel) {
          console.log('Người dùng hủy chọn ảnh');
          return;
        }

        if (response.errorCode) {
          console.error('Lỗi chọn ảnh:', response.errorMessage);
          Alert.alert('Lỗi', response.errorMessage || 'Không thể chọn ảnh');
          return;
        }

        const image = response.assets?.[0];
        if (!image) {
          Alert.alert('Lỗi', 'Không tìm thấy ảnh được chọn');
          return;
        }

        const formData = new FormData();
        formData.append('file', {
          uri:
            Platform.OS === 'android'
              ? image.uri
              : image.uri.replace('file://', ''),
          name: image.fileName || 'avatar.jpg',
          type: image.type || 'image/jpeg',
        });

        try {
          const res = await axios.post(
            `http://10.0.2.2:8081/api/users/upload-avatar/${userId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
              },
            },
          );

          if (res.status === 200) {
            Alert.alert('Thành công', 'Tải ảnh avatar lên thành công!');
            fetchUserData(); // reload avatar
          } else {
            console.error('Upload failed:', res.status, res.data);
            Alert.alert('Lỗi', 'Không thể tải ảnh avatar lên.');
          }
        } catch (err) {
          console.error('Upload avatar error:', err);
          Alert.alert('Lỗi', 'Đã có lỗi khi tải ảnh avatar.');
        }
      },
    );
  };

  const fetchUserData = async () => {
    if (!accessToken) {
      setError('Không có accessToken. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://10.0.2.2:8081/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        setUserData(response.data);
        setReceiveEmail(response.data.subscribedToEmails);
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu người dùng.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi tải thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken) {
      setError('Không có accessToken. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const updatedUserData = {
        ...userData,
        password: userData.password,
        verified: userData.isVerified,
        deleted: userData.isDeleted,
        blocked: userData.isBlocked,
        subscribedToEmails: receiveEmail,
      };

      const response = await axios.put(
        `http://10.0.2.2:8081/api/users/${userId}`,
        updatedUserData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin người dùng.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi cập nhật thông tin người dùng.');
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  useEffect(() => {
    if (accessToken && userId) {
      fetchUserData();
    }
  }, [accessToken, userId]);

  if (loading) {
    return <Text>Đang tải thông tin người dùng...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
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
      <SectionComponent styles={{alignItems: 'center'}}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <TouchableOpacity onPress={handleChooseAvatar}>
          <Image
            source={
              userData?.avatar
                ? {uri: getValidImageUri(userData.avatar)}
                : {uri: 'https://i.postimg.cc/153KnpPS/avatar-m-c-nh.jpg'}
            }
            style={styles.avatarImage}
            onError={() => console.log('Lỗi khi tải ảnh')}
          />
        </TouchableOpacity>

        <SpaceComponent height={20} />
      </SectionComponent>
      <SectionComponent>
        <TextComponent
          text="Tài khoản"
          font="bold"
          size={16}
          styles={{marginBottom: 10}}
        />
        <InputComponent
          value={userData.username}
          onChange={username => setUserData({...userData, username})}
          placeholder="Tài khoản"
        />

        <TextComponent
          text="Email"
          font="bold"
          size={16}
          styles={{marginBottom: 10}}
        />
        <InputComponent
          value={userData.email}
          onChange={email => setUserData({...userData, email})}
          placeholder="Email"
        />

        <TextComponent
          text="Số điện thoại"
          font="bold"
          size={16}
          styles={{marginBottom: 10}}
        />
        <InputComponent
          value={userData.phoneNumber}
          onChange={phoneNumber => setUserData({...userData, phoneNumber})}
          placeholder="Số điện thoại"
        />
      </SectionComponent>
      <SectionComponent>
        <TextComponent text="Địa chỉ" font="bold" size={20} />
        <SpaceComponent height={10} />

        <InputComponent
          value={userData.address?.street || ''}
          onChange={street =>
            setUserData({
              ...userData,
              address: {...userData.address, street},
            })
          }
          placeholder="Đường / Phố"
        />
        <InputComponent
          value={userData.address?.communes || ''}
          onChange={communes =>
            setUserData({
              ...userData,
              address: {...userData.address, communes},
            })
          }
          placeholder="Xã / Phường"
        />
        <InputComponent
          value={userData.address?.district || ''}
          onChange={district =>
            setUserData({
              ...userData,
              address: {...userData.address, district},
            })
          }
          placeholder="Quận / Huyện"
        />
        <InputComponent
          value={userData.address?.city || ''}
          onChange={city =>
            setUserData({
              ...userData,
              address: {...userData.address, city},
            })
          }
          placeholder="Tỉnh / Thành phố"
        />
        <InputComponent
          value={userData.address?.country || ''}
          onChange={country =>
            setUserData({
              ...userData,
              address: {...userData.address, country},
            })
          }
          placeholder="Quốc gia"
        />
      </SectionComponent>
      <SectionComponent>
        <RowComponent styles={{alignItems: 'center'}}>
          <TouchableOpacity
            style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: appColors.text_black,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: receiveEmail ? 'blue' : 'transparent',
              borderRadius: 4,
              marginRight: 8,
            }}
            onPress={() => setReceiveEmail(!receiveEmail)}>
            {receiveEmail && <Icon name="check" size={14} color="white" />}
          </TouchableOpacity>
          <TextComponent
            text="Nhận thông báo qua email"
            color={appColors.text_red}
          />
        </RowComponent>
      </SectionComponent>
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
      <FooterComponent />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: '#FFCCC9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 24,
    color: '#B30000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
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
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2, // Viền ảnh
    borderColor: '#ccc', // Màu viền
  },
});
