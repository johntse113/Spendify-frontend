import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal, 
  TouchableWithoutFeedback, 
  ScrollView as RNScrollView
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../constant';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { API_CONFIG, getFullUrl } from '../config/api';
import AppIcon from '../../assets/images/icon.png';
import Svg, { Path } from 'react-native-svg';
import { TERMS_AND_CONDITIONS } from '../constant/text';

const { width } = Dimensions.get('window');

const registerSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function Register() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    if (!accepted) {
      setError('Please accept the Terms and Conditions to continue');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(getFullUrl(API_CONFIG.endpoints.auth.register), {
        email: data.email,
        password: data.password,
      });
      console.log('Registration response:', response.data);
      const { token, refreshToken } = response.data;
      const userResponse = await axios.get(
        getFullUrl(API_CONFIG.endpoints.auth.me),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const userData = userResponse.data;
      console.log('User profile data after registration:', userData);
      
      await signIn(token, refreshToken, userData);
      
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Email already exists. Please use a different email or login.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const robotoBold = FONTS.primaryBold.family;
  const poppins = FONTS.secondary.family;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.upperBackground}>
          <View style={styles.upperContent}>

            <View style={styles.logoContainer}>
              <Image source={AppIcon} style={styles.appIcon} resizeMode="contain" />
            </View>
            <Text style={[styles.title, { fontFamily: robotoBold }]}>Create Account</Text>
            <Text style={[styles.subtitle, { fontFamily: poppins }]}>Sign up for Spendify</Text>

            <View style={styles.formFieldsContainer}>
              <Text style={[styles.fieldLabel, { fontFamily: robotoBold }]}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    style={[styles.input, { fontFamily: poppins }]}
                    outlineColor={COLORS.secondary}
                    activeOutlineColor={COLORS.primary}
                    textColor={COLORS.text.primary}
                    theme={{
                      colors: { onSurfaceVariant: COLORS.text.secondary },
                      roundness: 10,
                    }}
                    error={!!errors.email}
                    placeholder="Email"
                  />
                )}
              />
              <HelperText type="error" visible={!!errors.email} style={[styles.helperText, { fontFamily: poppins }]}>
                {errors.email?.message}
              </HelperText>

              <Text style={[styles.fieldLabel, { fontFamily: robotoBold }]}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    secureTextEntry
                    style={[styles.input, { fontFamily: poppins }]}
                    outlineColor={COLORS.secondary}
                    activeOutlineColor={COLORS.primary}
                    textColor={COLORS.text.primary}
                    theme={{
                      colors: { onSurfaceVariant: COLORS.text.secondary },
                      roundness: 10,
                    }}
                    error={!!errors.password}
                    placeholder="Password"
                  />
                )}
              />
              <HelperText type="error" visible={!!errors.password} style={[styles.helperText, { fontFamily: poppins }]}>
                {errors.password?.message}
              </HelperText>

              <Text style={[styles.fieldLabel, { fontFamily: robotoBold }]}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    secureTextEntry
                    style={[styles.input, { fontFamily: poppins }]}
                    outlineColor={COLORS.secondary}
                    activeOutlineColor={COLORS.primary}
                    textColor={COLORS.text.primary}
                    theme={{
                      colors: { onSurfaceVariant: COLORS.text.secondary },
                      roundness: 10,
                    }}
                    error={!!errors.confirmPassword}
                    placeholder="Confirm Password"
                  />
                )}
              />
              <HelperText
                type="error"
                visible={!!errors.confirmPassword}
                style={[styles.helperText, { fontFamily: poppins }]}
              >
                {errors.confirmPassword?.message}
              </HelperText>
            </View>
          </View>
        </View>

        <Svg
          height={110}
          width={width}
          viewBox={`0 0 ${width} 110`}
          style={styles.wave}
        >
          <Path
            fill={COLORS.header}
            d={`
              M ${width},0
              L 0,0
              L 0,90
              Q ${width * 0.25},120 ${width * 0.5},90
              Q ${width * 0.75},60 ${width},90
              Z
            `}
          />
        </Svg>


        <View style={styles.lowerSection}>
          {error ? (
            <HelperText type="error" visible style={[styles.bottomHelperText, { fontFamily: poppins }]}>
              {error}
            </HelperText>
          ) : null}

          <TouchableOpacity
            style={styles.termsContainer}
            activeOpacity={0.7}
            onPress={() => setAccepted(!accepted)}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && (
                <Svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Path d="M20 6L9 17l-5-5" />
                </Svg>
              )}
            </View>
            <Text style={[styles.termsText, { fontFamily: poppins }]}>
              By creating an account you agree to our{' '}
              <Text
                style={[styles.termsLink, { fontFamily: robotoBold }]}
                onPress={() => setIsTermsVisible(true)}
              >
                Terms and Conditions
              </Text>
            </Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading || !accepted}
            style={[
              styles.registerButton, 
              styles.bottomLoginButton,
              (!accepted || loading) && styles.disabledButton
            ]}
            labelStyle={[
              styles.buttonLabel, 
              styles.bottomButtonLabel, 
              { fontFamily: robotoBold }
            ]}
            contentStyle={styles.buttonContent}
          >
            REGISTER
          </Button>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, styles.bottomSignupText, { fontFamily: poppins }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.signupLink, styles.bottomSignupLink, { fontFamily: robotoBold }]}>
                LOGIN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isTermsVisible}
        onRequestClose={() => setIsTermsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsTermsVisible(false)}>
            <View style={styles.modalOverlayTouchable} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontFamily: robotoBold }]}>
              Terms and Conditions
            </Text>

            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={[styles.modalText, { fontFamily: poppins }]}>
                {TERMS_AND_CONDITIONS}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsTermsVisible(false)}
            >
              <Text style={[styles.closeButtonText, { fontFamily: robotoBold }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  upperBackground: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
  },
  upperContent: {
    paddingHorizontal: 28,
    paddingBottom: 10,
  },
  wave: {
    marginTop: -45,
    zIndex: 1,
  },
  lowerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 40,
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  appIcon: {
    width: 50,
    height: 50,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    color: COLORS.text.light,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    color: COLORS.text.light,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.light,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  formFieldsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    color: COLORS.text.light,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: '9%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    width: '80%',
    height: 45,
    fontSize: 14,
  },
  helperText: {
    color: '#ff6b6b',
    marginBottom: 8, 
    width: '80%',
    alignSelf: 'center',
    minHeight: 20,
  },
  bottomHelperText: {
    color: '#ff6b6b',
    marginBottom: 12,
    textAlign: 'center',
  },
  registerButton: {
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 24,
    width: '50%',
    alignSelf: 'center',
  },
  bottomLoginButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomButtonLabel: {
    color: '#FFFFFF',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '80%',
    alignSelf: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.text.primary,
    marginRight: 12,
    marginTop: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.text.highlight,
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  bottomSignupText: {
    color: COLORS.text.primary,
  },
  signupLink: {
    fontSize: 14,
  },
  bottomSignupLink: {
    color: COLORS.text.highlight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '86%',
    maxHeight: '82%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    marginVertical: 8,
    maxHeight: '70%',
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});