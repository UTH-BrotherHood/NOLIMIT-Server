import { ObjectId } from 'mongodb'

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  password: string
  date_of_birth?: Date
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  date_of_birth: Date

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id || new ObjectId()
    this.name = user.name || ''
    this.email = user.email
    this.password = user.password
    this.date_of_birth = user.date_of_birth || new Date()
  }
}