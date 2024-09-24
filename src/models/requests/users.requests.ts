export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
}

export interface LoginReqBody {
  email: string
  password: string
}
