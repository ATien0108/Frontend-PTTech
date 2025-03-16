import React from 'react';
import {View, Text, TouchableOpacity, Linking, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const FooterComponent = () => {
  const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);
  const openPhone = (phone: string) => Linking.openURL(`tel:${phone}`);

  return (
    <View style={styles.footer}>
      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.title}>Liên hệ</Text>
          <Text style={styles.text}>Số 1 Võ Văn Ngân</Text>
          <Text style={styles.text}>P. Linh Chiểu</Text>
          <Text style={styles.text}>TP. Thủ Đức, TP. HCM</Text>

          <Text style={styles.text}>Email:</Text>
          <TouchableOpacity
            onPress={() => openEmail('21110270@student.hcmute.edu.vn')}>
            <Text style={styles.link}>21110270@student.hcmute.edu.vn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openEmail('21110318@student.hcmute.edu.vn')}>
            <Text style={styles.link}>21110318@student.hcmute.edu.vn</Text>
          </TouchableOpacity>

          <Text style={styles.text}>Điện thoại:</Text>
          <TouchableOpacity onPress={() => openPhone('0816724726')}>
            <Text style={styles.link}>0816 724 726</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Chính sách</Text>
          {[
            'Chính sách bảo mật',
            'Chính sách bảo hành',
            'Chính sách vận chuyển',
            'Chính sách thanh toán',
            'Chính sách đổi trả',
          ].map((policy, index) => (
            <TouchableOpacity key={index}>
              <Text style={styles.link}>{policy}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.socialSection}>
        <Text style={styles.title}>Kết nối với chúng tôi</Text>
        <View style={styles.iconContainer}>
          <Icon name="facebook" size={24} color="#fff" style={styles.icon} />
          <Icon name="google" size={24} color="#fff" style={styles.icon} />
          <Icon name="twitter" size={24} color="#fff" style={styles.icon} />
          <Icon name="instagram" size={24} color="#fff" style={styles.icon} />
        </View>
      </View>
      <View style={styles.divider} />

      <Text style={styles.copyright}>
        © 2025 Đào Duy Phát & Trần Thị Á Tiên - Xây dựng App kinh doanh sản phẩm
        công nghệ PTTech.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1A1D2B',
    padding: 20,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  section: {
    width: '45%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 24,
  },
  text: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 3,
  },
  link: {
    color: '#4DA8DA',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    width: '100%',
    marginVertical: 15,
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  icon: {
    marginHorizontal: 10,
  },
  copyright: {
    color: '#bbb',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default FooterComponent;
