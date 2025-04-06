import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ContainerComponent,
  SectionComponent,
  TextComponent,
  InputComponent,
  SpaceComponent,
  RowComponent,
  HeaderComponent,
} from '../../components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {appColors} from '../../constants/appColors';

const ProfileScreen = ({route, navigation}: any) => {
  const {userId} = route.params;

  const [userData, setUserData] = useState<any>(null);
  const [receiveEmail, setReceiveEmail] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <ContainerComponent isScroll>
      <HeaderComponent /> =
      <SectionComponent styles={{alignItems: 'center'}}>
        <TextComponent
          size={30}
          title
          text="Thông tin cá nhân"
          color={appColors.text_red}
        />
        <SpaceComponent height={20} />

        <TouchableOpacity>
          <Image
            source={{
              uri:
                userData.avatar || 'https://i.postimg.cc/05XTj98C/avatar6.jpg',
            }}
            style={{width: 100, height: 100, borderRadius: 50}}
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
    </ContainerComponent>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: '#FFCCC9', // Soft pinkish color
    paddingVertical: 12, // Add padding for better button height
    paddingHorizontal: 20, // Add padding for better width
    borderRadius: 5, // Optional: rounded corners
    alignItems: 'center', // Center the text
    justifyContent: 'center', // Center the text
  },
  saveButtonText: {
    color: 'white', // White text color
    fontSize: 16, // Font size
    fontWeight: 'bold', // Optional: bold text
  },
});
