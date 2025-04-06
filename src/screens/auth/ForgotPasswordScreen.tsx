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
import {Sms} from 'iconsax-react-native';
import {Validate} from '../../utils/validate';
import {TouchableOpacity} from 'react-native';
import {ArrowLeft} from 'iconsax-react-native';
import axios from 'axios';

const ForgotPasswordScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!Validate.email(email)) {
      setErrorMessage('Vui lòng nhập email hợp lệ.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://10.0.2.2:8081/api/users/forgot-password',
        null,
        {
          params: {
            email: email,
            isAdmin: false,
            isMobile: true,
          },
        },
      );

      if (response.status === 200) {
        console.log('Yêu cầu gửi thành công:', response.data);
        navigation.navigate('ResetPasswordScreen', {email: email});
      } else {
        console.error('Lỗi gửi yêu cầu:', response);
        setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
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
          text="Quên mật khẩu"
          color={appColors.text_red}
        />
        <SpaceComponent height={25} />
      </SectionComponent>

      <SectionComponent>
        <TextComponent
          text="Email"
          font="bold"
          styles={{marginBottom: 10}}
          size={16}
        />
        <InputComponent
          value={email}
          placeholder="Nhập email"
          onChange={val => setEmail(val)}
          allowClear
          affix={<Sms size={22} color={appColors.gray} />}
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
          onPress={handleForgotPassword}
          text={loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
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

export default ForgotPasswordScreen;
