import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'
import { Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isApproved, profile, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  const [activeTab, setActiveTab] = useState('google')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [emailForm, setEmailForm] = useState('signin') // signin, signup, reset

  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '' })
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '', confirm: '' })
  const [resetEmail, setResetEmail] = useState('')

  // Handle URL params for messages
  useEffect(() => {
    const msg = searchParams.get('msg')
    if (msg === 'verify') {
      setMessage({ type: 'warning', text: 'Check your email. Click the verification link we sent you, then come back here to sign in.' })
    } else if (msg === 'pending') {
      setMessage({ type: 'warning', text: 'Your account is pending admin approval. Please wait.' })
    } else if (msg === 'reset') {
      setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' })
    }
  }, [searchParams])

  // Redirect if already logged in and approved
  useEffect(() => {
    if (user && isApproved) {
      if (profile?.role === 'admin') navigate('/admin')
      else if (profile?.role === 'analyst') navigate('/analyst')
      else navigate('/researcher')
    }
  }, [user, isApproved, profile, navigate])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setMessage({ type: 'error', text: error.message })
    }
    setIsLoading(false)
  }

  const handleEmailSignIn = async () => {
    if (!signInData.email || !signInData.password) {
      setMessage({ type: 'warning', text: 'Please enter your email and password.' })
      return
    }
    setIsLoading(true)
    const { error } = await signInWithEmail(signInData.email, signInData.password)
    setIsLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message })
    }
  }

  const handleEmailSignUp = async () => {
    const { name, email, password, confirm } = signUpData
    if (!name || !email || !password || !confirm) {
      setMessage({ type: 'warning', text: 'Please fill in all fields.' })
      return
    }
    if (password.length < 8) {
      setMessage({ type: 'warning', text: 'Password must be at least 8 characters.' })
      return
    }
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setIsLoading(true)
    const { error } = await signUpWithEmail(email, password, { full_name: name })
    setIsLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: `Verify your email! We sent a confirmation link to ${email}. Click it to verify your account, then come back here to sign in.` })
      setEmailForm('signin')
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setMessage({ type: 'warning', text: 'Please enter your email address.' })
      return
    }
    setIsLoading(true)
    const { error } = await resetPassword(resetEmail)
    setIsLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Reset link sent! Check your inbox (and spam folder).' })
      setEmailForm('signin')
    }
  }

  const renderMessage = () => {
    if (!message) return null
    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-600" />,
      error: <AlertCircle className="w-5 h-5 text-red-600" />,
      warning: <Clock className="w-5 h-5 text-amber-600" />,
    }
    const colors = {
      success: 'bg-green-50 border-green-300 text-green-800',
      error: 'bg-red-50 border-red-300 text-red-800',
      warning: 'bg-amber-50 border-amber-300 text-amber-800',
    }
    return (
      <div className={cn('p-4 rounded-lg border flex gap-3 mb-6', colors[message.type])}>
        {icons[message.type]}
        <div className="text-sm">{message.text}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-[45%] bg-green-brand flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute w-[400px] h-[400px] bg-gold/10 rounded-full -top-24 -right-24" />
        <div className="absolute w-[300px] h-[300px] bg-gold/5 rounded-full -bottom-20 -left-16" />

        <div className="text-center relative z-10 max-w-sm">
          <div className="w-20 h-20 bg-gold rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-xl mx-auto">
            🎓
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">RPAS</h1>
          <div className="w-12 h-1 bg-gold rounded mx-auto mb-6" />
          <p className="text-white font-semibold mb-1">Research Planning and<br />Analytic Services</p>
          <p className="text-white/65 text-sm">Aldersgate College Inc.</p>

          {/* Features */}
          <div className="mt-12 space-y-5 text-left">
            {[
              { icon: '📊', title: 'Track Your Requests', desc: 'Real-time updates on your research service requests' },
              { icon: '🔬', title: '6 Research Services', desc: 'From data analysis to manuscript review' },
              { icon: '💬', title: 'Direct Communication', desc: 'Message your analyst directly through the platform' },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{feature.title}</div>
                  <div className="text-white/60 text-xs">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-semibold text-green-brand uppercase tracking-wider mb-2">Welcome</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in to RPAS</h2>
            <p className="text-gray-500 text-sm">Access your research service tracker portal</p>
          </div>

          {renderMessage()}

          {/* Tabs */}
          <div className="flex border-b-2 border-gray-200 mb-6">
            {[
              { id: 'google', label: 'Continue with Google' },
              { id: 'email', label: 'Email & Password' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage(null) }}
                className={cn(
                  'flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors -mb-0.5',
                  activeTab === tab.id
                    ? 'text-green-brand border-green-brand'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Google Panel */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-lg bg-white text-gray-800 font-semibold hover:border-green-brand hover:bg-green-light hover:text-green-brand transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div className="p-4 bg-gold-light/50 rounded-lg border-l-4 border-gold">
                <p className="text-sm text-amber-700">
                  ⓘ New accounts require <strong>admin approval</strong> before access is granted.
                </p>
              </div>
            </div>
          )}

          {/* Email Panel */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              {/* Sign In Form */}
              {emailForm === 'signin' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        placeholder="Your password"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none transition-all"
                      />
                    </div>
                    <Button
                      onClick={handleEmailSignIn}
                      loading={isLoading}
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <button
                      onClick={() => { setEmailForm('signup'); setMessage(null) }}
                      className="text-green-brand font-semibold hover:underline"
                    >
                      Create one
                    </button>
                    {' · '}
                    <button
                      onClick={() => { setEmailForm('reset'); setMessage(null) }}
                      className="text-green-brand font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </p>
                </>
              )}

              {/* Sign Up Form */}
              {emailForm === 'signup' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Password <span className="text-xs text-gray-400 font-normal">(min. 8 characters)</span>
                      </label>
                      <input
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        placeholder="Create a password"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        value={signUpData.confirm}
                        onChange={(e) => setSignUpData({ ...signUpData, confirm: e.target.value })}
                        placeholder="Repeat your password"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none transition-all"
                      />
                    </div>
                    <Button
                      onClick={handleEmailSignUp}
                      loading={isLoading}
                      className="w-full"
                    >
                      Create Account
                    </Button>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account?{' '}
                    <button
                      onClick={() => { setEmailForm('signin'); setMessage(null) }}
                      className="text-green-brand font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}

              {/* Reset Form */}
              {emailForm === 'reset' && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 outline-none transition-all"
                      />
                    </div>
                    <Button
                      onClick={handlePasswordReset}
                      loading={isLoading}
                      className="w-full"
                    >
                      Send Reset Link
                    </Button>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    <button
                      onClick={() => { setEmailForm('signin'); setMessage(null) }}
                      className="text-green-brand font-semibold hover:underline"
                    >
                      ← Back to Sign In
                    </button>
                  </p>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              For account issues, contact the RPAS Office<br />
              <a href="mailto:rpas@aldersgate.edu.ph" className="text-green-brand font-medium hover:underline">
                rpas@aldersgate.edu.ph
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}