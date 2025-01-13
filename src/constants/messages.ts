export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_REQUIRED: 'Name is required',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH: 'Name must be between 1 and 100 characters long',
  USERNAME_INVALID: 'Username is invalid',
  EMAIL_ALREADY_EXIST: 'Email is already exist',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Email is invalid',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_STRING: 'Password must be a string',
  PASSWORD_LENGTH: 'Password must be at least 6 characters long',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number and one symbol',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_MATCH: 'Confirm password must match with password',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  LOGIN_SUCCESSFULLY: 'Login successfully',
  REGISTER_SUCCESSFULLY: 'Register successfully',
  REGISTER_FAILED: 'Register failed',
  LOGOUT_FAILED: 'Logout failed',
  INVALID_USER: 'Invalid user',
  // verify email
  USER_NOT_VERIFIED: 'User not verified',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  RESEND_VERIFY_EMAIL_SUCCESSFULLY: 'Resend verify email successfully',
  //accessToken
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  //refreshToken
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_MUST_BE_STRING: 'Refresh token must be a string',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
  //logout
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESSFULLY: 'Logout successfully',
  //Email verification
  EMAIL_VERIFICATION_TOKEN_REQUIRED: 'Email verification token is required',
  EMAIL_VERIFICATION_TOKEN_MUST_BE_STRING: 'Email verification token must be a string',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  USER_NOT_FOUND: 'User not found',
  EMAIL_VERIFIED_SUCCESSFULLY: 'Email verified successfully',
  EMAIL_NOT_EXIST: 'Email not exist. Please register',
  // Update me
  BIO_MUST_BE_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio must be between 1 and 110 characters long',
  UPDATE_ME_SUCCESSFULLY: 'Update me successfully',
  // Forgot password , reset password , verify forgot password , change password
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check your email to reset password',
  FORGOT_PASSWORD_TOKEN_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  VERIFY_FORGOT_PASSWORD_SUCCESSFULLY: 'Verify forgot password successfully',
  RESET_PASSWORD_SUCCESSFULLY: 'Reset password successfully',
  OLD_PASSWORD_INCORRECT: 'Old password is incorrect',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  // get me
  GET_ME_SUCCESSFULLY: 'Get me successfully',
  // get user
  GET_USER_SUCCESSFULLY: 'Get user successfully',
  SEARCH_USER_SUCCESSFULLY: 'Search user successfully'
} as const

export const HTTP_MESSAGES = {
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized',
  UNKNOW_ERROR: 'Unknow error',
  INVALID_CODE: 'Invalid code'
} as const

export const CONVERSATION_MESSAGES = {
  CREATE_CONVERSATION_SUCCESSFULLY: 'Create conversation successfully',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  CONVERSATION_ALREADY_EXIST: 'Conversation already exist',
  CONVERSATION_ID_REQUIRED: 'Conversation ID is required',
  CONVERSATION_ID_MUST_BE_STRING: 'Conversation ID must be a string',
  CONVERSATION_ID_INVALID: 'Conversation ID is invalid',
  CONVERSATION_TYPE_REQUIRED: 'Conversation type is required',
  CONVERSATION_TYPE_MUST_BE_STRING: 'Conversation type must be a string',
  CONVERSATION_TYPE_INVALID: 'Conversation type is invalid',
  GET_CONVERSATION_SUCCESSFULLY: 'Get conversation successfully',
  GET_CONVERSATIONS_SUCCESSFULLY: 'Get conversations successfully',
  DELETE_CONVERSATION_SUCCESSFULLY: 'Delete conversation successfully',

  // Messages
  GET_MESSAGES_SUCCESSFULLY: 'Get messages successfully',
  CREATE_MESSAGE_SUCCESSFULLY: 'Create message successfully',
  DELETE_MESSAGE_SUCCESSFULLY: 'Delete message successfully',
  MESSAGE_NOT_FOUND: 'Message not found',
  MARK_MESSAGE_AS_READ_SUCCESSFULLY: 'Mark message as read successfully',
  GET_LAST_MESSAGE_SEEN_STATUS_SUCCESSFULLY: 'Get last message seen status successfully',
  // Participants
  USER_ALREADY_IN_CONVERSATION: 'User already in conversation',
  USER_NOT_IN_CONVERSATION: 'User not in conversation'
} as const

export const GROUP_MESSAGES = {
  CREATE_GROUP_SUCCESSFULLY: 'Create group successfully',
  GROUP_NOT_FOUND: 'Group not found',
  GROUP_ALREADY_EXIST: 'Group already exist',
  GROUP_ID_REQUIRED: 'Group ID is required',
  GROUP_ID_MUST_BE_STRING: 'Group ID must be a string',
  GROUP_ID_INVALID: 'Group ID is invalid',
  GROUP_NAME_REQUIRED: 'Group name is required',
  GROUP_NAME_MUST_BE_STRING: 'Group name must be a string',
  GROUP_NAME_LENGTH: 'Group name must be between 1 and 100 characters long',
  GROUP_NOT_FOUND_OR_USER_NOT_IN_GROUP: 'Group not found or user not in group',
  USER_NOT_IN_GROUP: 'User not in group',
  USER_ALREADY_IN_GROUP: 'User already in group',
  ADD_USER_TO_GROUP_SUCCESSFULLY: 'Add user to group successfully',
  REMOVE_USER_FROM_GROUP_SUCCESSFULLY: 'Remove user from group successfully'
} as const

export const PARTICIPANTS_MESSAGES = {
  CREATE_PARTICIPANT_SUCCESSFULLY: 'Create participant successfully',
  ADD_PARTICIPANT_SUCCESSFULLY: 'Add participant successfully',
  PARTICIPANT_NOT_FOUND: 'Participant not found',
  PARTICIPANT_ALREADY_EXIST: 'Participant already exist',
  PARTICIPANT_ID_REQUIRED: 'Participant ID is required',
  PARTICIPANT_ID_MUST_BE_STRING: 'Participant ID must be a string',
  PARTICIPANT_ID_INVALID: 'Participant ID is invalid',
  PARTICIPANT_ROLE_REQUIRED: 'Participant role is required',
  PARTICIPANT_ROLE_MUST_BE_STRING: 'Participant role must be a string',
  PARTICIPANT_ROLE_INVALID: 'Participant role is invalid'
} as const
