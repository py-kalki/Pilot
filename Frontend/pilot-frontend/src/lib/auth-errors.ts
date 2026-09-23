export function getFirebaseAuthErrorMessage(error: any): string {
  const code = error?.code || "";
  
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was canceled before completing.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for OAuth operations in Firebase.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Console.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please wait a few moments and try again.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    default:
      return error?.message || "An unexpected error occurred. Please try again.";
  }
}
