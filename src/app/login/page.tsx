'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import TelegramLogin from '@/components/TelegramLogin';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/account');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (err: any) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError(language === 'km' ? 'រកមិនឃើញអ្នកប្រើប្រាស់' : 'User not found');
          break;
        case 'auth/wrong-password':
          setError(language === 'km' ? 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវ' : 'Wrong password');
          break;
        default:
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'km' ? 'ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccess(
        language === 'km' 
          ? 'សូមពិនិត្យមើលអ៊ីមែលរបស់អ្នក' 
          : 'Check your email for password reset link'
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (showForgotPassword) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8">
            <h1 className="khmer-text text-2xl font-bold text-center mb-8">
              {language === 'km' ? 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'Reset Password'}
            </h1>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg">{success}</div>}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition"
              >
                {loading ? '...' : (language === 'km' ? 'ផ្ញើ' : 'Send')}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm"
              >
                ← {language === 'km' ? 'ត្រលប់' : 'Back'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h1 className="khmer-text text-2xl font-bold text-center mb-8">
              {isLogin 
                ? (language === 'km' ? 'ចូលប្រើប្រាស់' : 'Welcome Back')
                : (language === 'km' ? 'បង្កើតគណនី' : 'Create Account')
              }
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={isLogin ? handleEmailLogin : handleRegister} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder={language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    />
                  </div>

                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder={language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder={language === 'km' ? 'ពាក្យសម្ងាត់' : 'Password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder={language === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm Password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                  />
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {language === 'km' ? 'ភ្លេចពាក្យសម្ងាត់?' : 'Forgot password?'}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                {loading 
                  ? '...' 
                  : isLogin 
                    ? (language === 'km' ? 'ចូល' : 'Sign In')
                    : (language === 'km' ? 'ចុះឈ្មោះ' : 'Sign Up')
                }
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">
                  {language === 'km' ? 'ឬ' : 'or'}
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{language === 'km' ? 'ចូលជាមួយ Google' : 'Continue with Google'}</span>
            </button>

            {/* Telegram Login Button */}
            <div className="mt-3">
              <TelegramLogin />
            </div>

            {/* Toggle between login/register */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                <span className="text-gray-400">
                  {isLogin
                    ? (language === 'km' ? 'មិនទាន់មានគណនី?' : 'New here?')
                    : (language === 'km' ? 'មានគណនីរួចហើយ?' : 'Already have an account?')
                  }
                </span>{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gray-900 font-medium hover:underline"
                >
                  {isLogin
                    ? (language === 'km' ? 'បង្កើតគណនី' : 'Create account')
                    : (language === 'km' ? 'ចូល' : 'Sign in')
                  }
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}