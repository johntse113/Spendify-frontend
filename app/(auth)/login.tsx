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
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../constant';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG, getFullUrl } from '../config/api';
import AppIcon from '../../assets/images/icon.png';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(
        getFullUrl(API_CONFIG.endpoints.auth.me),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      //debug
      console.log('User profile data:', response.data);
      
      return response.data;
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err.response?.data || err.message);
      return null;
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(getFullUrl(API_CONFIG.endpoints.auth.login), data);
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
      //debug
      console.log('User profile data:', userData);
      console.log('User token:', token);
      
      await signIn(token, refreshToken, userData);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
              <Text style={[styles.appName, { fontFamily: robotoBold }]}>SPENDIFY</Text>
            </View>

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

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.checkboxContainer}>
              <View style={[styles.checkbox, styles.bottomCheckbox]} />
              <Text style={[styles.checkboxLabel, styles.bottomText, { fontFamily: poppins }]}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.forgotText, styles.bottomText, { fontFamily: poppins }]}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={[styles.loginButton, styles.bottomLoginButton]}
            labelStyle={[styles.buttonLabel, styles.bottomButtonLabel, { fontFamily: robotoBold }]}
            contentStyle={styles.buttonContent}
          >
            LOGIN
          </Button>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, styles.bottomSignupText, { fontFamily: poppins }]}>
              Do not have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.signupLink, styles.bottomSignupLink, { fontFamily: robotoBold }]}>
                SIGN UP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    marginTop: -50,
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
    marginBottom: 48,
  },
  appIcon: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    color: COLORS.text.light,
    letterSpacing: 1.2,
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
    marginBottom: 16,
    width: '80%',
    alignSelf: 'center',
  },

  bottomHelperText: {
    color: '#ff6b6b',
    marginBottom: 12,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
  },

  bottomCheckbox: {
    borderColor: COLORS.text.primary,
  },

  checkboxLabel: {
    fontSize: 14,
  },

  bottomText: {
    color: COLORS.text.primary,
  },

  forgotText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  loginButton: {
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 24,
    width: '50%',
    alignSelf: 'center',
  },

  bottomLoginButton: {
    backgroundColor: COLORS.primary,
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
});