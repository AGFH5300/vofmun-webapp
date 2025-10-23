
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/src/router";
import { useSession } from "../context/sessionContext";
import TypeWriter from "@/components/ui/typewriter";
import supabase from "@/lib/supabase";
import { useMobile } from "@/hooks/use-mobile";
import { Eye, EyeOff, Rocket } from "lucide-react";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const { navigate } = useRouter();
  const { login } = useSession();
  const isMobile = useMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
      const { data: admin, error: adminError } = await supabase
        .from("Admin")
        .select("adminID, firstname, lastname, password")
        .eq("adminID", trimmedEmail)
        .maybeSingle();

      if (!adminError && admin) {
        if (admin.password !== trimmedPassword) {
          setError("Incorrect password");
          setLoading(false);
          return;
        }

        const adminUser = {
          ...admin,
          role: "admin",
        };

        login(adminUser);
        navigate("/home");
        return;
      }

      const { data: chair, error: chairError } = await supabase
        .from("Chair")
        .select("*")
        .eq("chairID", trimmedEmail)
        .maybeSingle();

      if (!chairError && chair) {
        if (chair.password !== trimmedPassword) {
          setError("Incorrect password");
          setLoading(false);
          return;
        }

        const { data: committeeID, error: IDerror } = await supabase
          .from("Committee-Chair")
          .select("chairID, committeeID")
          .eq("chairID", trimmedEmail)
          .single();

        if (IDerror || !committeeID) {
          setError("Committee assignment not found");
          setLoading(false);
          return;
        }

        const { data: committee, error: committeeError } = await supabase
          .from("Committee")
          .select("committeeID, name")
          .eq("committeeID", committeeID.committeeID)
          .single();

        if (committeeError || !committee) {
          setError("Committee not found");
          setLoading(false);
          return;
        }

        const enrichedUser = {
          ...chair,
          committee: {
            committeeID: committee.committeeID,
            name: committee.name,
          },
        };

        login(enrichedUser);
        navigate("/home");
        return;
      }

      const { data: delegate, error: delegateError } = await supabase
        .from("Delegate")
        .select("delegateID, email, password")
        .eq("email", trimmedEmail)
        .maybeSingle();

      if (!delegateError && delegate) {
        if (delegate.password !== trimmedPassword) {
          setError("Incorrect password");
          setLoading(false);
          return;
        }

        const { data: fullDelegate, error: fullDelegateError } = await supabase
          .from("Delegate")
          .select("*")
          .eq("delegateID", delegate.delegateID)
          .single();

        if (fullDelegateError || !fullDelegate) {
          setError("Delegate record not found");
          setLoading(false);
          return;
        }

        const { data: delegation, error: delegationError } = await supabase
          .from("Delegation")
          .select(`*,
            Country:countryID (countryID, name, flag),
            Committee:committeeID (committeeID, name)
          `)
          .eq("delegateID", delegate.delegateID)
          .single();

        if (delegationError || !delegation) {
          setError("Delegation not found");
          setLoading(false);
          return;
        }

        const enrichedUser = {
          ...fullDelegate,
          country: delegation.Country,
          committee: delegation.Committee,
        };

        login(enrichedUser);
        navigate("/home");
        return;
      }

      setError("Account not found");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding */}
        <motion.div
          className="lg:w-1/2 bg-gradient-to-br from-deep-red to-dark-burgundy flex flex-col justify-center items-center p-8 lg:p-12 text-white relative overflow-hidden"
          initial={{ opacity: 0, x: isMobile ? 0 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <img
                width={200}
                height={200}
                className="mx-auto drop-shadow-2xl"
                src="/logo.svg"
                alt="VOFMUN LOGO"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <TypeWriter />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-white/90 leading-relaxed mt-6"
            >
              Empowering the next generation of global leaders through diplomacy, 
              debate, and international cooperation.
            </motion.p>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-12"
          initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="max-w-md mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2" data-testid="text-login-header">
                VOFMUN Portal
              </h1>
              <p className="text-gray-600">Sign in to access your conference tools</p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-deep-red focus:border-transparent transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your Password"
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-deep-red focus:border-transparent transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  data-testid="error-message"
                >
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-deep-red to-dark-burgundy text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loading}
                data-testid="button-login"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center hover:pointer-cursor">
                    <Rocket size={18} className="mr-2" />
                    Enter MUN Hub
                  </div>
                )}
              </button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
