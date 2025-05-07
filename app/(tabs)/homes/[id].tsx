import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, ScrollView, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export default function HomeDetails() {
  const { id } = useLocalSearchParams();
  const [home, setHome] = useState(null);
  const [canUnlock, setCanUnlock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingLocation, setCheckingLocation] = useState(false);

  useEffect(() => {
    fetchHomeDetails();
  }, []);

  const fetchHomeDetails = async () => {
    try {
      const response = await fetch(`https://678f678849875e5a1a91b27f.mockapi.io/houses/${id}`);
      const data = await response.json();
      setHome(data);
      checkDistance(data);
    } catch (error) {
      console.error('Error fetching home details:', error);
      Alert.alert('Error', 'Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  const checkDistance = async (home) => {
    setCheckingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is required to unlock this property.',
          [{ text: 'OK' }]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
      });
      
      const distance = getDistanceFromLatLonInMeters(
        location.coords.latitude,
        location.coords.longitude,
        parseFloat(home.latitude),
        parseFloat(home.longitude)
      );
      
      setCanUnlock(distance <= 30);
    } catch (error) {
      console.error('Error checking location:', error);
      Alert.alert('Location Error', 'Unable to determine your location.');
    } finally {
      setCheckingLocation(false);
    }
  };

  const unlockHome = () => {
    Alert.alert(
      'Confirm Unlock',
      'Are you sure you want to unlock this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unlock', 
          onPress: () => {
            setLoading(true);
            // Simulate unlock API call
            setTimeout(() => {
              setLoading(false);
              Alert.alert('Success', 'Property unlocked successfully!');
            }, 1500);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading property details...</Text>
      </View>
    );
  }

  if (!home) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: home.imagerUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Property Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.price}>${home.price?.toLocaleString() || 'Price on request'}</Text>
          <Text style={styles.address}>{home.location || 'Address unavailable'}</Text>
          
          {/* Property Specs */}
          <View style={styles.specsContainer}>
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={22} color="#555" />
              <Text style={styles.specText}>{home.bedrooms || '—'} beds</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={22} color="#555" />
              <Text style={styles.specText}>{home.bathrooms || '—'} baths</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="resize-outline" size={22} color="#555" />
              <Text style={styles.specText}>{home.squareFeet?.toLocaleString() || '—'} sq ft</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{home.description}</Text>
          </View>

          {/* Location Status */}
          <View style={styles.locationStatusContainer}>
            {checkingLocation ? (
              <View style={styles.checkingLocationContainer}>
                <ActivityIndicator size="small" color="#0066cc" />
                <Text style={styles.checkingLocationText}>Verifying your location...</Text>
              </View>
            ) : canUnlock ? (
              <View style={styles.locationStatusSuccess}>
                <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
                <Text style={styles.locationStatusSuccessText}>
                  You're within range to unlock this property
                </Text>
              </View>
            ) : (
              <View style={styles.locationStatusError}>
                <Ionicons name="alert-circle" size={20} color="#d32f2f" />
                <Text style={styles.locationStatusErrorText}>
                  You must be within 30 meters to unlock this property
                </Text>
              </View>
            )}
          </View>

          {/* Unlock Button */}
          <TouchableOpacity
            style={[
              styles.unlockButton,
              !canUnlock && styles.unlockButtonDisabled
            ]}
            onPress={unlockHome}
            disabled={!canUnlock}
          >
            <Ionicons 
              name={canUnlock ? "lock-open-outline" : "lock-closed-outline"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.unlockButtonText}>Unlock Property</Text>
          </TouchableOpacity>

          {/* Retry Location Check */}
          {!canUnlock && !checkingLocation && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => checkDistance(home)}
            >
              <Text style={styles.retryButtonText}>Check Location Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  const R = 6371000; // Earth's radius in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  address: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 24,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  specText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  locationStatusContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  checkingLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkingLocationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  locationStatusSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationStatusSuccessText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2e7d32',
  },
  locationStatusError: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationStatusErrorText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#d32f2f',
  },
  unlockButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  unlockButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  unlockButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  retryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
  },
});