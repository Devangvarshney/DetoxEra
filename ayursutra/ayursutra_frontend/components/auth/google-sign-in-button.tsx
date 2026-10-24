"use client";

import React, { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { api, getApiErrorMessage } from "@/lib/api/client";
import { Capacitor } from "@capacitor/core";

interface GoogleSignInButtonProps {
  role: "patient" | "practitioner";
  onSuccess: (token: string) => void;
  onError: (errorMessage: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleSignInButton({
  role,
  onSuccess,
  onError,
  text = "continue_with",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isNative = mounted && Capacitor.isNativePlatform();
  const isCustomClientIdConfigured = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes("placeholder")
  );

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError("Google did not return credentials. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
        role: role,
      });
      onSuccess(res.data.access_token);
    } catch (err: any) {
      onError(getApiErrorMessage(err, "Google authentication failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleNativeGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { SocialLogin } = await import("@capgo/capacitor-social-login");
      const res = await SocialLogin.login({
        provider: "google",
        options: {
          style: "bottom",
        },
      });

      const idToken = (res.result as any)?.idToken;
      if (!idToken) {
        throw new Error("No Google ID token received from device.");
      }

      const backendRes = await api.post("/auth/google", {
        credential: idToken,
        role: role,
      });
      onSuccess(backendRes.data.access_token);
    } catch (err: any) {
      console.error("Native Google sign-in error:", err);
      if (err?.message?.includes("cancel") || err?.code === "USER_CANCELLED") {
        return;
      }
      onError(getApiErrorMessage(err, "Native Google sign-in failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleSignIn = async () => {
    setLoading(true);
    try {
      const demoEmail = role === "patient" ? "patient.google@ayursutra.com" : "dr.google@ayursutra.com";
      const demoName = role === "patient" ? "Ayur Patient (Google)" : "Dr. Sharma (Google)";
      const demoCredential = `demo_google_token:${demoEmail}:${demoName}`;

      const res = await api.post("/auth/google", {
        credential: demoCredential,
        role: role,
      });
      onSuccess(res.data.access_token);
    } catch (err: any) {
      onError(getApiErrorMessage(err, "Demo Google sign-in failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {isNative ? (
        <button
          type="button"
          onClick={handleNativeGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-300 shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>
      ) : isCustomClientIdConfigured ? (
        <div className="w-full flex flex-col items-center gap-2">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => onError("Google Sign-In was cancelled or failed. Check Authorized Origins in Google Cloud Console.")}
              theme="outline"
              size="large"
              width="100%"
              text={text}
              shape="rectangular"
            />
          </div>
          <button
            type="button"
            onClick={handleDemoGoogleSignIn}
            disabled={loading}
            className="text-[11px] text-ayur-muted hover:text-ayur-green transition-colors underline decoration-dotted"
          >
            {loading ? "Signing in..." : `⚡ Quick Test with 1-Click Google Sign-In (${role === "patient" ? "Patient" : "Doctor"})`}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDemoGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-300 shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google as {role === "patient" ? "Patient" : "Doctor"}</span>
        </button>
      )}
    </div>
  );
}
