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

const SocialLogin = () => {
  return (
    <SectionComponent>
      <SpaceComponent height={16} />

      <ButtonComponent
        type="primary"
        // onPress={handleLoginWithGoogle}
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
        color={appColors.bg_btn_light_blue}
        textColor={appColors.text_black}
        text="Login with Facebook"
        textFont={fontFamilies.regular}
        // onPress={handleLoginWithFacebook}
        iconFlex="left"
        icon={<Facebook />}
        styles={{padding: 12}}
      />
    </SectionComponent>
  );
};

export default SocialLogin;
