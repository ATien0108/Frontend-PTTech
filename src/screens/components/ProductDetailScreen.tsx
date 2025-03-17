import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import {HeaderComponent, FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  SectionComponent,
  TextComponent,
  SpaceComponent,
} from '../../components';

// Dữ liệu sản phẩm mẫu
const sampleProduct = {
  id: '1',
  name: 'iPhone 14 Pro Max',
  brand: 'Apple',
  price: '29.999.999đ',
  oldPrice: '39.999.999đ',
  discount: '25%',
  rating: 5.0,
  totalReviews: 2500,
  description:
    'iPhone 14 Pro Max features a new 48MP camera, a 6.7-inch display, and the A16 Bionic chip. With its improved battery life and faster performance, it’s perfect for tech enthusiasts and power users.',
  images: [
    require('../../assets/images/demo-event-image.png'),
    require('../../assets/images/demo-event-image.png'),
    require('../../assets/images/demo-event-image.png'),
    require('../../assets/images/demo-event-image.png'),
    require('../../assets/images/demo-event-image.png'),
    require('../../assets/images/demo-event-image.png'),
    require('../../assets/images/demo-event-image.png'),
  ],
  variants: [
    {id: '1', name: 'Đen - 128GB'},
    {id: '2', name: 'Trắng - 128GB'},
    {id: '3', name: 'Đen - 256GB'},
    {id: '4', name: 'Trắng - 256GB'},
  ],
  specifications: {
    RAM: '6GB',
    Storage: '128GB',
    Display: '6.7-inch OLED',
    Camera: '48MP',
    Processor: 'A16 Bionic',
    Battery: '4323mAh',
    Color: 'Space Black',
  },
  blog: {
    title: 'iPhone 14 Pro Max Review',
    description:
      'Read our in-depth review of the iPhone 14 Pro Max, exploring its design, camera quality, and performance.',
    content:
      "The iPhone 14 Pro Max is the latest flagship from Apple. With its new 48MP camera, stunning display, and powerful A16 Bionic chip, it is a great choice for those looking for top-tier performance and functionality. Whether you're a professional photographer or a gamer, this phone can handle it all.",
    date: '1/15/2025',
  },
  warranty: {
    duration: '1 year',
    terms:
      'Apple warranty covering manufacturing defects and malfunctions under normal use.',
  },
  reviews: 'Chưa có đánh giá',
  qna: 'Hỏi đáp về sản phẩm...',
};

const TABS = [
  {id: 'specifications', title: 'Thông số kỹ thuật'},
  {id: 'blog', title: 'Bài viết'},
  {id: 'warranty', title: 'Bảo hành'},
  {id: 'reviews', title: 'Đánh giá'},
  {id: 'qna', title: 'Q&A'},
];

// Component hiển thị hình ảnh sản phẩm
const ProductImageCarousel = ({images}: {images: any[]}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.imageCarousel}>
      {images.map((img, index) => (
        <Image key={index} source={img} style={styles.thumbnail} />
      ))}
    </ScrollView>
  );
};

const ProductDetailScreen = ({route}: any) => {
  const {productId} = route.params || {};
  const product =
    productId === sampleProduct.id ? sampleProduct : sampleProduct;

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <ScrollView style={styles.container}>
      <HeaderComponent />

      {/* Tiêu đề */}
      <SectionComponent styles={{alignItems: 'center'}}>
        <TextComponent
          size={30}
          title
          text="Chi tiết sản phẩm"
          color={appColors.text_red}
        />
        <SpaceComponent height={25} />
      </SectionComponent>

      {/* Hình ảnh sản phẩm */}
      <Image source={product.images[0]} style={styles.productImage} />
      <ProductImageCarousel images={product.images} />

      {/* Thông tin sản phẩm */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.brandName}>Thương hiệu: {product.brand}</Text>

        {/* Hiển thị đánh giá */}
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="gold" />
          <Icon name="star" size={16} color="gold" />
          <Icon name="star" size={16} color="gold" />
          <Icon name="star" size={16} color="gold" />
          <Icon name="star" size={16} color="gold" />
          <Text style={styles.ratingText}>
            {product.rating} ({product.totalReviews} reviews)
          </Text>
        </View>

        {/* Giá sản phẩm */}
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{product.price}</Text>
          <Text style={styles.oldPrice}>{product.oldPrice}</Text>
        </View>
      </View>

      {/* Mô tả sản phẩm */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
      </View>

      {/* Biến thể sản phẩm */}
      <View style={styles.variantContainer}>
        <Text style={styles.sectionTitle}>Biến thể</Text>
        <FlatList
          data={product.variants}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.variantButton,
                selectedVariant.id === item.id && styles.variantButtonSelected,
              ]}
              onPress={() => setSelectedVariant(item)}>
              <Text style={styles.variantText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Nút thêm vào giỏ hàng */}
      <TouchableOpacity style={styles.addToCartButton}>
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}>
            <Text style={styles.tabText}>{tab.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'specifications' && (
          <View style={styles.specificationsContainer}>
            {Object.entries(product.specifications).map(
              ([key, value], index) => (
                <View key={index} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ),
            )}
          </View>
        )}
        {activeTab === 'blog' && (
          <View style={styles.blogContainer}>
            <Text style={styles.blogTitle}>{product.blog.title}</Text>
            <Text style={styles.blogDescription}>
              {product.blog.description}
            </Text>
            <Text style={styles.blogContent}>{product.blog.content}</Text>
            <Text style={styles.blogDate}>
              Được đăng vào: {product.blog.date}
            </Text>
          </View>
        )}

        {activeTab === 'warranty' && (
          <View style={styles.warrantyContainer}>
            <Text style={styles.warrantyTitle}>Bảo hành</Text>
            <Text style={styles.warrantyContent}>
              {product.warranty.duration} - {product.warranty.terms}
            </Text>
          </View>
        )}

        {activeTab === 'reviews' && <Text>{product.reviews}</Text>}
        {activeTab === 'qna' && <Text>{product.qna}</Text>}
      </View>

      <FooterComponent />
    </ScrollView>
  );
};

export default ProductDetailScreen;

// Style
const styles = StyleSheet.create({
  warrantyContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },

  warrantyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },

  warrantyContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },

  blogContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },

  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },

  blogDescription: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },

  blogContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },

  blogDate: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },

  specificationsContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
  },

  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  specKey: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  specValue: {
    fontSize: 16,
    color: '#000',
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    padding: 10,
    backgroundColor: appColors.bg_light_gray,
  },
  tabButton: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {borderBottomColor: appColors.text_red},
  tabText: {fontSize: 16, fontWeight: 'bold', color: appColors.text_black},
  tabContent: {
    padding: 15,
    backgroundColor: appColors.bg_white,
    borderRadius: 8,
    marginVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.bg_white,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  imageCarousel: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  detailsContainer: {
    padding: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.text_black,
  },
  brandName: {
    fontSize: 16,
    color: appColors.text_purple,
    marginVertical: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: appColors.text_black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.text_red,
  },
  oldPrice: {
    fontSize: 16,
    color: appColors.text_secondary,
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },

  descriptionContainer: {
    padding: 15,
    backgroundColor: appColors.bg_light_gray,
    borderRadius: 8,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.text_black,
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: appColors.text_black,
  },
  variantContainer: {
    padding: 15,
  },
  variantButton: {
    backgroundColor: appColors.bg_btn_dark_blue,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  variantButtonSelected: {
    backgroundColor: appColors.bg_btn_dark_blue,
  },
  variantText: {
    color: appColors.text_white,
  },
  addToCartButton: {
    backgroundColor: appColors.bg_btn_dark_green,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    margin: 15,
  },
  addToCartText: {
    color: appColors.text_black,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
