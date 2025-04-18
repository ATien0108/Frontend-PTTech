import {Image, Switch, View} from 'react-native';
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
import {Lock, Sms} from 'iconsax-react-native';
import {Validate} from '../../utils/validate';
import SocialLogin from './components/SocialLogin';
import {fontFamilies} from '../../constants/fontFamilies';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8081/api/users/login';

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemember, setIsRemember] = useState(true);
  const [isDisable, setIsDisable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const emailValidation = Validate.email(email);
    setIsDisable(!email || !emailValidation);
  }, [email]);

  const handleLogin = async () => {
    if (isDisable) {
      setErrorMessage('Vui lòng nhập email và mật khẩu hợp lệ.');
      return;
    }

    try {
      const response = await axios.post(API_URL, null, {
        params: {
          email: email,
          password: password,
        },
      });

      if (response.status === 200) {
        console.log('Đăng nhập thành công:', response.data);
        const {userId, accessToken} = response.data;

        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('accessToken', accessToken);

        navigation.navigate('HomeScreen', {
          userId: userId,
          accessToken: accessToken,
        });
      } else {
        setErrorMessage(
          'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.',
        );
      }
    } catch (error) {
      console.error('Đã xảy ra lỗi khi đăng nhập:', error);
      setErrorMessage('Đã có lỗi xảy ra trong quá trình đăng nhập.');
    }
  };

  if (isLoading) {
    return (
      <ContainerComponent isScroll>
        <SectionComponent styles={{alignItems: 'center'}}>
          <TextComponent
            size={30}
            title
            text="Đăng nhập"
            color={appColors.text_red}
          />
          <SpaceComponent height={25} />
        </SectionComponent>

        <SectionComponent>
          <TextComponent
            text="Tài khoản"
            font="bold"
            styles={{marginBottom: 10}}
            size={16}
          />
          <InputComponent
            value={email}
            placeholder="Nhập tài khoản"
            onChange={val => setEmail(val)}
            allowClear
            affix={<Sms size={22} color={appColors.gray} />}
          />

          <TextComponent
            text="Mật khẩu"
            font="bold"
            styles={{marginBottom: 10}}
            size={16}
          />
          <InputComponent
            value={password}
            placeholder="Nhập mật khẩu"
            onChange={val => setPassword(val)}
            isPassword
            allowClear
            affix={<Lock size={22} color={appColors.gray} />}
          />

          <RowComponent justify="space-between">
            <RowComponent onPress={() => setIsRemember(!isRemember)}>
              <Switch
                trackColor={{true: appColors.text_black}}
                thumbColor={appColors.text_white}
                value={isRemember}
                onChange={() => setIsRemember(!isRemember)}
              />
              <SpaceComponent width={4} />
              <TextComponent text="Ghi nhớ tài khoản" />
            </RowComponent>
            <ButtonComponent
              text="Quên mật khẩu?"
              onPress={() => navigation.navigate('ForgotPasswordScreen')}
              type="link"
              color={appColors.bg_btn_dark_blue}
            />
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
            onPress={handleLogin}
            text="Đăng nhập"
            type="primary"
            color={appColors.bg_red}
            styles={{padding: 12}}
          />
        </SectionComponent>

        <SectionComponent>
          <RowComponent justify="center">
            <TextComponent text="Bạn chưa có tài khoản? " />
            <ButtonComponent
              type="link"
              text="Đăng ký ngay"
              onPress={() => navigation.navigate('RegisterScreen')}
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
  }
};

export default LoginScreen;
