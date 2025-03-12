import {useNavigation} from '@react-navigation/native';
import {ArrowLeft} from 'iconsax-react-native';
import React, {ReactNode} from 'react';
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {TextComponent} from '.';
import {appColors} from '../constants/appColors';
import {fontFamilies} from '../constants/fontFamilies';
import {globalStyles} from '../styles/globalStyles';
import RowComponent from './RowComponent';

interface Props {
  isImageBackground?: boolean;
  isScroll?: boolean;
  title?: string;
  children: ReactNode;
  back?: boolean;
  style?: any;
}

const ContainerComponent = (props: Props) => {
  const {children, isScroll, isImageBackground, title, back, style} = props;
  const navigation: any = useNavigation();

  const headerComponent = () => {
    return (
      <View style={styles.header}>
        {(title || back) && (
          <RowComponent
            styles={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              minWidth: 48,
              minHeight: 48,
              justifyContent: 'flex-start',
            }}>
            {back && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{marginRight: 12}}>
                <ArrowLeft size={24} color={appColors.text_black} />
              </TouchableOpacity>
            )}
            {title && (
              <TextComponent
                text={title}
                size={16}
                font={fontFamilies.medium}
                flex={1}
              />
            )}
          </RowComponent>
        )}
      </View>
    );
  };

  const returnContainer = isScroll ? (
    <ScrollView
      style={[styles.scrollContainer, style]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, style]}>{children}</View>
  );

  return isImageBackground ? (
    <ImageBackground
      source={require('../assets/images/splash-img.png')}
      style={styles.imageBackground}
      imageStyle={styles.imageStyle}>
      <SafeAreaView style={styles.safeArea}>
        {headerComponent()}
        {returnContainer}
      </SafeAreaView>
    </ImageBackground>
  ) : (
    <SafeAreaView style={[globalStyles.container, style]}>
      <View>{headerComponent()}</View>
      {returnContainer}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flex: 1,
    padding: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
  },
  imageStyle: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default ContainerComponent;
