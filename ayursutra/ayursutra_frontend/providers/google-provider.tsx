"use client";

import React, { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";

const DEFAULT_CLIENT_ID = "612345678901-ayursutra-dev-placeholder.apps.googleusercontent.com";

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;

  useEffect(() => {
    if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
      SocialLogin.initialize({
        google: {
          webClientId: clientId,
          mode: "online"
        }
      }).catch((err) => {
        console.warn("SocialLogin init warning:", err);
      });
    }
  }, [clientId]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

