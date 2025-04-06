import React, {useState} from 'react';
import {
  ContainerComponent,
  SectionComponent,
  InputComponent,
  ButtonComponent,
  TextComponent,
  SpaceComponent,
} from '../../components';
import {appColors} from '../../constants/appColors';
import {Lock} from 'iconsax-react-native';
import {Validate} from '../../utils/validate';
import {TouchableOpacity} from 'react-native';
import {ArrowLeft} from 'iconsax-react-native';
import axios from 'axios';

const ResetPasswordScreen = ({navigation, route}: any) => {
  const email = route.params?.email;
  const token = route.params?.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!Validate.password(password)) {
      setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://10.0.2.2:8081/api/users/reset-password',
        {
          token: token,
          newPassword: password,
        },
      );

      if (response.status === 200) {
        console.log('Mật khẩu đã được thay đổi thành công!');
        navigation.navigate('LoginScreen', {email: email});
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data || 'Đã xảy ra lỗi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerComponent isScroll>
      <SectionComponent styles={{alignItems: 'center'}}>
        <TextComponent
          size={30}
          title
          text="Đặt lại mật khẩu"
          color={appColors.text_red}
        />
        <SpaceComponent height={25} />
      </SectionComponent>

      <SectionComponent>
        <TextComponent
          text="Mật khẩu mới"
          font="bold"
          styles={{marginBottom: 10}}
          size={16}
        />
        <InputComponent
          value={password}
          placeholder="Nhập mật khẩu mới"
          onChange={val => setPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray} />}
        />

        <TextComponent
          text="Xác nhận mật khẩu"
          font="bold"
          styles={{marginBottom: 10, marginTop: 15}}
          size={16}
        />
        <InputComponent
          value={confirmPassword}
          placeholder="Nhập lại mật khẩu"
          onChange={val => setConfirmPassword(val)}
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray} />}
        />
      </SectionComponent>

      {errorMessage && (
        <SectionComponent>
          <TextComponent text={errorMessage} color={appColors.text_red} />
        </SectionComponent>
      )}

      <SpaceComponent height={16} />

      <SectionComponent>
        <ButtonComponent
          onPress={handleResetPassword}
          text={loading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
          type="primary"
          color={appColors.bg_red}
          styles={{padding: 12}}
          disable={loading}
        />
      </SectionComponent>

      <SectionComponent>
        <TouchableOpacity
          onPress={() => navigation.navigate('LoginScreen')}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <ArrowLeft size={20} color={appColors.bg_btn_dark_blue} />
          <SpaceComponent width={6} />
          <TextComponent
            text="Quay về đăng nhập"
            color={appColors.bg_btn_dark_blue}
          />
        </TouchableOpacity>
      </SectionComponent>
    </ContainerComponent>
  );
};

export default ResetPasswordScreen;
