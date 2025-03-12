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

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemember, setIsRemember] = useState(true);
  const [isDisable, setIsDisable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const emailValidation = Validate.email(email);
    const passwordValidation = Validate.password(password);

    setIsDisable(
      !email || !password || !emailValidation || !passwordValidation,
    );
  }, [email, password]);

  // Xử lý đăng nhập (Giả lập thành công)
  const handleLogin = () => {
    if (isDisable) {
      setErrorMessage('Vui lòng nhập email và mật khẩu hợp lệ.');
      return;
    }

    console.log('Giả lập đăng nhập thành công!');
    navigation.navigate('HomeScreen', {email: email});
  };

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
};

export default LoginScreen;
