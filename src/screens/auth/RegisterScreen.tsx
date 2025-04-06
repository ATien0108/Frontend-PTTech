import {Switch, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  ButtonComponent,
  ContainerComponent,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import {appColors} from '../../constants/appColors';
import {Lock, Sms, Call, User} from 'iconsax-react-native';
import {Validate} from '../../utils/validate';
import {fontFamilies} from '../../constants/fontFamilies';
import SocialLogin from './components/SocialLogin';
import {TouchableOpacity} from 'react-native';
import {Check} from 'iconsax-react-native';
import axios from 'axios';

const RegisterScreen = ({navigation}: any) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgree, setIsAgree] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const emailValidation = Validate.email(email);
    const phoneNumberValidation = Validate.phoneNumber(phoneNumber);
    const passwordValidation = Validate.password(password);
    const confirmPasswordValidation = password === confirmPassword;

    setIsDisable(
      !username ||
        !email ||
        !phoneNumber ||
        !password ||
        !confirmPassword ||
        !emailValidation ||
        !phoneNumberValidation ||
        !passwordValidation ||
        !confirmPasswordValidation ||
        !isAgree,
    );
  }, [username, email, phoneNumber, password, confirmPassword, isAgree]);

  const handleRegister = async () => {
    if (isDisable) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }

    try {
      const userData = {
        username: username || '',
        email: email || '',
        phoneNumber: phoneNumber || '',
        password: password || '',
        avatar: 'https://i.postimg.cc/153KnpPS/avatar-m-c-nh.jpg',
        address: {
          street: '',
          communes: '',
          district: '',
          city: '',
          country: '',
        },
        subscribedToEmails: isAgree,
        roles: [
          {
            roleName: 'CUSTOMER',
            permissions: [''],
          },
        ],
        isVerified: 'true',
      };

      const response = await axios.post(
        'http://10.0.2.2:8081/api/users/register',
        userData,
      );

      console.log('API Response:', response);

      if (response.status === 200) {
        console.log('Đăng ký thành công!');
        navigation.navigate('LoginScreen', {email: email});
      } else {
        if (
          response.data.message ===
          'Email đã tồn tại và chưa bị xóa. Không thể đăng ký tài khoản mới.'
        ) {
          setErrorMessage('Email đã tồn tại. Vui lòng chọn email khác.');
        } else {
          setErrorMessage('Đăng ký không thành công. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);

      if (axios.isAxiosError(error)) {
        console.error(
          'Axios error details:',
          error.response ? error.response.data : error.message,
        );
      }

      setErrorMessage('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <ContainerComponent isScroll>
      <SectionComponent styles={{alignItems: 'center'}}>
        <TextComponent
          size={30}
          title
          text="Đăng ký"
          color={appColors.text_red}
        />
        <SpaceComponent height={25} />
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
          placeholder="Nhập tài khoản"
          onChange={val => setUsername(val)}
          allowClear
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
          placeholder="Nhập email"
          onChange={val => setEmail(val)}
          allowClear
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
          placeholder="Nhập số điện thoại"
          onChange={val => setPhoneNumber(val)}
          allowClear
          affix={<Call size={22} color={appColors.gray} />}
        />

        <TextComponent
          text="Mật khẩu"
          font="bold"
          size={16}
          styles={{marginBottom: 10}}
        />
        <InputComponent
          value={password}
          placeholder="Nhập mật khẩu"
          onChange={val => setPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray} />}
        />

        <TextComponent
          text="Xác nhận mật khẩu"
          font="bold"
          size={16}
          styles={{marginBottom: 10}}
        />
        <InputComponent
          value={confirmPassword}
          placeholder="Nhập lại mật khẩu"
          onChange={val => setConfirmPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray} />}
        />

        <RowComponent onPress={() => setIsAgree(!isAgree)}>
          <TouchableOpacity
            style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: appColors.text_black,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isAgree ? appColors.text_black : 'transparent',
            }}
            onPress={() => setIsAgree(!isAgree)}>
            {isAgree && <Check size={10} color={appColors.text_white} />}
          </TouchableOpacity>
          <SpaceComponent width={4} />
          <TextComponent text="Tôi đồng ý với các điều khoản" />
        </RowComponent>
      </SectionComponent>

      {errorMessage && (
        <SectionComponent>
          <TextComponent text={errorMessage} color={appColors.text_red} />
        </SectionComponent>
      )}

      <SpaceComponent height={16} />

      <SectionComponent>
        <ButtonComponent
          onPress={handleRegister}
          text="Đăng ký"
          type="primary"
          color={appColors.bg_red}
          styles={{padding: 12}}
        />
      </SectionComponent>

      <SectionComponent>
        <RowComponent justify="center">
          <TextComponent text="Bạn đã có tài khoản? " />
          <ButtonComponent
            type="link"
            text="Đăng nhập ngay"
            onPress={() => navigation.navigate('LoginScreen')}
            color={appColors.bg_btn_dark_blue}
          />
        </RowComponent>
      </SectionComponent>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 16,
        }}>
        <View
          style={{
            flex: 1,
            height: 1,
            marginLeft: 40,
            marginRight: 10,
            backgroundColor: appColors.text_secondary,
          }}
        />
        <TextComponent
          styles={{textAlign: 'center'}}
          text="OR"
          color={appColors.gray}
          size={16}
          font={fontFamilies.medium}
        />{' '}
        <View
          style={{
            flex: 1,
            height: 1,
            marginRight: 40,
            marginLeft: 10,
            backgroundColor: appColors.text_secondary,
          }}
        />
      </View>

      <SocialLogin />
    </ContainerComponent>
  );
};

export default RegisterScreen;
