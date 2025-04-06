import React from 'react';
import {Facebook} from '../../../assets/svgs';
import {Google} from '../../../assets/svgs';
import {
  ButtonComponent,
  SectionComponent,
  SpaceComponent,
} from '../../../components';
import {appColors} from '../../../constants/appColors';
import {fontFamilies} from '../../../constants/fontFamilies';
import axios from 'axios';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next'; // Cần cài đặt thư viện Facebook SDK cho React Native

const API_URL = 'http://10.0.2.2:8081/api/users'; // URL gốc

const SocialLogin = () => {
  const handleLoginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn(); // Sử dụng `any` tạm thời

      const tokenId = userInfo.idToken; // Giờ bạn có thể truy cập idToken
      console.log('Google ID Token:', tokenId);

      const response = await axios.post(`${API_URL}/google-login`, {
        tokenId,
      });

      if (response.status === 200) {
        console.log('Google login success:', response.data);
      } else {
        console.error('Google login failed:', response);
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleLoginWithFacebook = async () => {
    try {
      // Facebook Login
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
      if (result.isCancelled) {
        console.log('Facebook login cancelled');
        return;
      }

      // Lấy accessToken từ Facebook
      const data = await AccessToken.getCurrentAccessToken();
      const accessToken = data?.accessToken;

      if (accessToken) {
        // Gửi yêu cầu API để đăng nhập qua Facebook
        const response = await axios.post(`${API_URL}/facebook-login`, null, {
          params: {
            accessToken,
          },
        });

        if (response.status === 200) {
          // Đăng nhập thành công
          console.log('Facebook login success:', response.data);
        } else {
          console.error('Facebook login failed:', response);
        }
      }
    } catch (error) {
      console.error('Facebook login error:', error);
    }
  };

  return (
    <SectionComponent>
      <SpaceComponent height={16} />

      <ButtonComponent
        type="primary"
        onPress={handleLoginWithGoogle}
        color={appColors.bg_btn_light_gray}
        textColor={appColors.text_black}
        text="Login with Google"
        textFont={fontFamilies.regular}
        iconFlex="left"
        icon={<Google />}
        styles={{padding: 12}}
      />

      <ButtonComponent
        type="primary"
        onPress={handleLoginWithFacebook}
        color={appColors.bg_btn_light_blue}
        textColor={appColors.text_black}
        text="Login with Facebook"
        textFont={fontFamilies.regular}
        iconFlex="left"
        icon={<Facebook />}
        styles={{padding: 12}}
      />
    </SectionComponent>
  );
};

export default SocialLogin;
