import { TokenPayload } from '~/models/requests/users.requests'
import { UserDocument } from '~/models/schemas/user.schema'

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument
      decoded_authorization?: TokenPayload
      decoded_refresh_token?: TokenPayload
      decoded_email_verify_token?: TokenPayload
      decoded_forgot_password_token?: TokenPayload
      conversation?: ConversationDocument;
      fileUrl?: string;
      file?: Express.Multer.File;
    }
  }
}
