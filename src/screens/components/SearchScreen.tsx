import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import {HeaderComponent} from '../../components';
import {FooterComponent} from '../../components';
import {appColors} from '../../constants/appColors';

interface Product {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  pricing: {
    original: number;
    current: number;
    history: Array<{
      previousPrice: number;
      newPrice: number;
      changedAt: string;
    }>;
  };
  ratings: {
    average: number;
    totalReviews: number;
  };
  images: string[];
}

const SearchScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {query: initialQuery} = route.params; // Lấy query từ route.params
  const [query, setQuery] = useState<string>(initialQuery || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);
  const handleSearch = async (keyword: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://10.0.2.2:8081/api/products/search?keyword=${keyword}`,
      );
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        console.error('Error fetching products:', data);
      }
    } catch (error) {
      console.error('There was an error!', error);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard: React.FC<{product: Product; navigation: any}> = ({
    product,
    navigation,
  }) => {
    const totalStars = 5;
    const averageRating = product.ratings.average;

    const fullStars = '⭐'.repeat(Math.floor(averageRating));
    const emptyStars = '☆'.repeat(totalStars - Math.floor(averageRating));
    const starRating = fullStars + emptyStars;
    const [brandName, setBrandName] = useState<string | null>(null);

    useEffect(() => {
      const fetchBrandName = async () => {
        try {
          const response = await fetch(
            `http://10.0.2.2:8081/api/brands/${product.brandId}`,
          );
          const data = await response.json();
          if (response.ok) {
            setBrandName(data.name);
          } else {
            console.error('Không thể tải thông tin thương hiệu');
          }
        } catch (error) {
          console.error('Có lỗi xảy ra khi lấy thông tin thương hiệu:', error);
        }
      };

      if (product.brandId) {
        fetchBrandName();
      }
    }, [product.brandId]);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          navigation.navigate('ProductDetailScreen', {productId: product.id})
        }>
        <Image source={{uri: product.images[0]}} style={styles.productImage} />
        <Text style={styles.brandName}>
          {brandName || 'Đang tải thương hiệu...'}
        </Text>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.ratingsContainer}>
          <Text style={styles.ratingText}>{starRating}</Text>
          <Text style={styles.ratingText}>
            {product.ratings.totalReviews} đánh giá
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.pricing.current)}
          </Text>
          {product.pricing.original !== product.pricing.current && (
            <Text style={styles.oldPrice}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(product.pricing.original)}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <HeaderComponent />
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm"
          value={query}
          onChangeText={text => setQuery(text)}
        />

        {loading ? (
          <Text>Đang tải...</Text>
        ) : (
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
        )}
      </View>
      <FooterComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: appColors.text_secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeMoreButton: {
    backgroundColor: '#D1D182',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginRight: 10,
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
  bannerList: {
    marginTop: 24,
  },
  bannerImage: {
    width: 390,
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
    marginTop: 10,
    width: 180,
    backgroundColor: appColors.bg_white,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 15,
    shadowColor: appColors.text_black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    elevation: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: appColors.text_red,
    fontWeight: 'bold',
    marginRight: 5,
  },
  oldPrice: {
    fontSize: 10,
    color: appColors.text_black,
    textDecorationLine: 'line-through',
  },

  brandText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  adsText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  ratingsContainer: {
    marginVertical: 5,
  },
  ratingText: {
    fontSize: 14,
    color: appColors.text_secondary,
  },
  footerItem: {
    padding: 10,
    fontWeight: '600',
    color: '#007aff',
  },
  addToCartButton: {
    backgroundColor: appColors.bg_btn_blue,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: appColors.text_black,
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
  },
  searchInput: {
    marginTop: 10,
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  searchButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: appColors.text_secondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchScreen;
