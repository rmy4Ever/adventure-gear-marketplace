import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+1234567890');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    // No need to initialize verifier here; handled by FirebaseRecaptchaVerifierModal
  }, []);

  const handleAuth = async () => {
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), { email, visits: 1 });
        Alert.alert('Success', 'Account created!');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePhoneAuth = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(phone, recaptchaVerifier.current);
      setVerificationId(id);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const confirmCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title={isSignup ? 'Signup' : 'Login'} onPress={handleAuth} />
      <Button title={`Switch to ${isSignup ? 'Login' : 'Signup'}`} onPress={() => setIsSignup(!isSignup)} />
      <TextInput placeholder="Phone (+1234567890)" value={phone} onChangeText={setPhone} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title="Send Code" onPress={handlePhoneAuth} />
      <TextInput placeholder="Enter Code" value={code} onChangeText={setCode} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title="Confirm Code" onPress={confirmCode} />
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseAuth={auth} />
    </View>
  );
};

export default AuthScreen;