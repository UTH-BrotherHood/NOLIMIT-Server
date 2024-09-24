import { ObjectId } from "mongodb"
import { LoginReqBody, RegisterReqBody } from "~/models/requests/users.requests"
import User from "~/models/schemas/user.chemas"
import databaseServices from "~/services/database.services"

class UsersService {
  async register(payload: RegisterReqBody) {
    const _id = new ObjectId()
    const newUser = new User({...payload, _id})
    const result = await databaseServices.users.insertOne(newUser)
    return result
  }
  
  async login(payload : LoginReqBody) {
    const { email, password } = payload
    const user = await databaseServices.users.findOne({ email })
    if (!user) {
      return null
    }
    if (user.password !== password) {
      return null
    }
    return user
  }
}

const usersService = new UsersService()
export default usersService