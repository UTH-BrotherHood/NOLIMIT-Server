import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import { TokenDocument } from '~/models/schemas/token.schema'
import { UserDocument } from '~/models/schemas/user.schema'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@cluster0.xvthd.mongodb.net/${envConfig.dbName}?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseServices {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }

  async connect() {
    try {
      await this.client.connect()
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error connecting to the database', error)
      throw error
    }
  }

  get users(): Collection<UserDocument> {
    return this.db.collection(envConfig.dbUsersCollection)
  }

  get tokens(): Collection<TokenDocument> {
    return this.db.collection(envConfig.dbTokensCollection)
  }
}
const databaseServices = new DatabaseServices()
export default databaseServices
