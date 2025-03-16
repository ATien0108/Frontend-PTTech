import {View, TouchableOpacity, Image, Alert} from 'react-native';
import React, {useState} from 'react';
import {
  ButtonComponent,
  ContainerComponent,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
  HeaderComponent,
  FooterComponent,
} from '../../components';
import {appColors} from '../../constants/appColors';
import {User, Sms, Call, Location} from 'iconsax-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Validate} from '../../utils/validate';

const ProfileScreen = ({navigation}: any) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [receiveEmail, setReceiveEmail] = useState(true);
  const [oldPhoneNumber, setOldPhoneNumber] = useState(phoneNumber);
  const [otp, setOtp] = useState('');
  const [isOtpVisible, setIsOtpVisible] = useState(false);

  const verifyOtp = async (otp: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(otp === '123456');
      }, 1000);
    });
  };

  const handleSave = () => {
    if (!Validate.username(username)) {
      Alert.alert('Lỗi', 'Tên tài khoản không hợp lệ!');
      return;
    }
    if (!Validate.email(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ!');
      return;
    }
    if (!Validate.phoneNumber(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ!');
      return;
    }
    if (
      !Validate.address({
        street,
        communes: ward,
        district,
        city,
        country,
      })
    ) {
      Alert.alert('Lỗi', 'Địa chỉ không hợp lệ!');
      return;
    }

    if (phoneNumber !== oldPhoneNumber) {
      setIsOtpVisible(true);
      return;
    }

    saveProfile();
  };

  const handleConfirmOtp = () => {
    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số!');
      return;
    }

    verifyOtp(otp)
      .then(isValid => {
        if (isValid) {
          saveProfile();
        } else {
          Alert.alert('Lỗi', 'Mã OTP không hợp lệ!');
        }
      })
      .catch(() => {
        Alert.alert('Lỗi', 'Xác thực OTP thất bại!');
      });
  };

  const saveProfile = () => {
    setOldPhoneNumber(phoneNumber);
    setIsOtpVisible(false);
    Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
  };

  return (
    <ContainerComponent isScroll>
      <HeaderComponent />

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
            source={{uri: 'https://i.postimg.cc/05XTj98C/avatar6.jpg'}}
            style={{width: 100, height: 100, borderRadius: 50}}
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
          value={username}
          onChange={setUsername}
          placeholder="Tài khoản"
          affix={<User size={22} color={appColors.gray} />}
        />

        <TextComponent
          text="Email"
          font="bold"
          size={16}
          styles={{marginBottom: 10}}
        />
        <InputComponent
          value={email}
          onChange={setEmail}
          placeholder="Email"
          affix={<Sms size={22} color={appColors.gray} />}
        />

        <TextComponent
          text="Số điện thoại"
          font="bold"
          size={16}
          styles={{marginBottom: 10}}
        />
        <InputComponent
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="Số điện thoại"
          affix={<Call size={22} color={appColors.gray} />}
        />
      </SectionComponent>

      <SectionComponent>
        <TextComponent text="Địa chỉ" font="bold" size={20} />
        <SpaceComponent height={10} />

        <InputComponent
          value={street}
          onChange={setStreet}
          placeholder="Đường / Phố"
          affix={<Location size={22} color={appColors.gray} />}
        />
        <InputComponent
          value={ward}
          onChange={setWard}
          placeholder="Xã / Phường"
          affix={<Location size={22} color={appColors.gray} />}
        />
        <InputComponent
          value={district}
          onChange={setDistrict}
          placeholder="Quận / Huyện"
          affix={<Location size={22} color={appColors.gray} />}
        />
        <InputComponent
          value={city}
          onChange={setCity}
          placeholder="Tỉnh / Thành phố"
          affix={<Location size={22} color={appColors.gray} />}
        />
        <InputComponent
          value={country}
          onChange={setCountry}
          placeholder="Quốc gia"
          affix={<Location size={22} color={appColors.gray} />}
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

      {isOtpVisible && (
        <SectionComponent>
          <TextComponent
            text="Nhập mã OTP"
            font="bold"
            size={16}
            styles={{marginBottom: 10}}
          />
          <InputComponent
            value={otp}
            onChange={setOtp}
            placeholder="Nhập OTP"
            affix={<Icon name="key" size={22} color={appColors.gray} />}
            keyboardType="number-pad"
          />
          <ButtonComponent
            onPress={handleConfirmOtp}
            text="Xác nhận OTP"
            type="primary"
            color={appColors.bg_red}
            styles={{padding: 12}}
          />
        </SectionComponent>
      )}

      <SpaceComponent height={16} />

      <SectionComponent>
        <ButtonComponent
          onPress={handleSave}
          text="Lưu thay đổi"
          type="primary"
          color={appColors.bg_red}
          styles={{padding: 12}}
        />
      </SectionComponent>

      <FooterComponent />
    </ContainerComponent>
  );
};

export default ProfileScreen;
