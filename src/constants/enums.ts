export enum userVerificationStatus {
  Unverified = 'unverified', // Chưa xác minh
  Verified = 'verified', // Đã xác minh
  Expired = 'expired' // Hết hạn
}

export enum tokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  ForgotPasswordToken = 'ForgotPasswordToken',
  EmailVerificationToken = 'EmailVerificationToken'
}
