import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminScreen = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const renderUser = ({ item }) => (
    <View style={styles.userItem}>
      <Text>{item.email} - Visits: {item.visits}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Registered Users</Text>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        style={styles.userList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 20, textAlign: 'center', margin: 10 },
  userList: { flex: 1 },
  userItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default AdminScreen;