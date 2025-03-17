import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {HeaderComponent} from '../../components';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';

const categories = [
  'Điện thoại',
  'Laptop',
  'Tablet',
  'Phụ kiện',
  'Bàn phím',
  'Tai nghe',
];
const banners = [
  require('../../assets/images/demo-event-image.png'),
  require('../../assets/images/demo-event-image.png'),
];
const products = [
  {
    id: '1',
    name: 'Điện thoại Samsung Galaxy A55 5G 8GB/128GB',
    brand: 'Samsung',
    price: '29.999.999đ',
    oldPrice: '32.999.999đ',
    discount: '-20%',
    rating: '128 đánh giá',
    image: require('../../assets/images/demo-event-image.png'),
  },
  {
    id: '2',
    name: 'Điện thoại Samsung Galaxy A55 5G 8GB/128GB',
    brand: 'Samsung',
    price: '29.999.999đ',
    oldPrice: '32.999.999đ',
    discount: '-20%',
    rating: '128 đánh giá',
    image: require('../../assets/images/demo-event-image.png'),
  },
];
const brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Xiaomi', 'Dell', 'Asus'];

const ads = [
  'QC1',
  'QC2',
  'QC3',
  'QC4',
  'QC5',
  'QC6',
  'QC7',
  'QC8',
  'QC9',
  'QC10',
];

const handleSeeMore = () => {
  console.log('Xem thêm sản phẩm');
};

const HomeScreen = ({navigation, route}: any) => {
  return (
    <ScrollView style={styles.container}>
      <HeaderComponent />

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <Text style={styles.categoryText}>{item}</Text>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        horizontal
        data={banners}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <Image source={item} style={styles.bannerImage} />
        )}
        showsHorizontalScrollIndicator={false}
        style={{marginTop: 24}}
      />

      <View style={styles.promotionContainer}>
        <Text style={styles.sectionTitle}>Sản phẩm khuyến mãi</Text>
        <Text style={styles.sectionSubtitle}>
          Khám phá những sản phẩm công nghệ được yêu thích nhất!
        </Text>
      </View>

      <FlatList
        horizontal
        data={products}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ProductCard product={item} navigation={navigation} />
        )}
        showsHorizontalScrollIndicator={false}
        style={{marginBottom: 24}}
      />

      <TouchableOpacity style={styles.seeMoreButton} onPress={handleSeeMore}>
        <Text style={styles.seeMoreText}>Xem thêm</Text>
      </TouchableOpacity>

      <View style={styles.adsContainer}>
        <FlatList
          horizontal
          data={ads}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => <Text style={styles.adsText}>{item}</Text>}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.promotionContainer}>
        <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
        <Text style={styles.sectionSubtitle}>
          Khám phá những sản phẩm công nghệ được yêu thích nhất!
        </Text>
      </View>
      <FlatList
        horizontal
        data={products}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ProductCard product={item} navigation={navigation} />
        )}
        showsHorizontalScrollIndicator={false}
        style={{marginBottom: 24}}
      />

      <TouchableOpacity style={styles.seeMoreButton} onPress={handleSeeMore}>
        <Text style={styles.seeMoreText}>Xem thêm</Text>
      </TouchableOpacity>

      <View style={styles.brandContainer}>
        <FlatList
          horizontal
          data={brands}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => <Text style={styles.brandText}>{item}</Text>}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FooterComponent />
    </ScrollView>
  );
};

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  oldPrice: string;
  discount: string;
  rating: string;
  image: any;
}

const ProductCard: React.FC<{product: Product; navigation: any}> = ({
  product,
  navigation,
}) => {
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate('ProductDetailScreen', {productId: product.id})
      }>
      <Image source={product.image} style={styles.productImage} />
      <Text style={styles.brandName}>{product.brand}</Text>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price}</Text>
      <Text style={styles.oldPrice}>{product.oldPrice}</Text>
      <TouchableOpacity style={styles.addToCartButton}>
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  seeMoreButton: {
    backgroundColor: '#D1D182',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 24,
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: appColors.text_black,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  categoryContainer: {
    backgroundColor: appColors.bg_btn_light_red,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginHorizontal: 10,
  },
  bannerImage: {
    width: 300,
    height: 150,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  sectionHeader: {
    alignItems: 'center',
    marginVertical: 15,
  },
  promotionContainer: {
    backgroundColor: appColors.bg_btn_light_red,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: appColors.text_black,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: appColors.text_black,
  },
  productCard: {
    width: 180,
    backgroundColor: appColors.bg_white,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    shadowColor: appColors.text_black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  brandContainer: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  adsContainer: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  brandName: {
    fontSize: 14,
    color: appColors.text_purple,
    marginTop: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 16,
    color: appColors.text_red,
    fontWeight: 'bold',
  },
  oldPrice: {
    fontSize: 14,
    color: appColors.text_black,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: appColors.bg_btn_blue,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addToCartText: {
    color: appColors.text_black,
    fontSize: 14,
    fontWeight: 'bold',
  },
  brandText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  adsText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
});
