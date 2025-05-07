import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function HomeList() {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchHomes();
  }, []);

  const fetchHomes = async () => {
    try {
      const response = await fetch('https://678f678849875e5a1a91b27f.mockapi.io/houses');
      const data = await response.json();
      setHomes(data);
    } catch (error) {
      console.error('Error fetching homes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHomeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/homes/${item.id}`)}
      style={styles.card}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.imagerUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <Text style={styles.price}>${item.price?.toLocaleString() || 'Price on request'}</Text>
        <Text style={styles.location}>{item.location || 'Location unavailable'}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Available Properties</Text>
      <FlatList
        data={homes}
        keyExtractor={item => item.id}
        renderItem={renderHomeItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    height: 220,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    padding: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});