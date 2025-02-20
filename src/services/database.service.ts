import { Collection, Db, MongoClient } from 'mongodb'
import collection from '~/constants/collection'
import { envConfig } from '~/constants/config'
import { ConversationDocument } from '~/models/schemas/conversation.schema'
import { GroupDocument } from '~/models/schemas/group.schema'
import { MessageDocument } from '~/models/schemas/message.schema'
import { MessageAttachmentDocument } from '~/models/schemas/message_attachment.schema'
import { ParticipantDocument } from '~/models/schemas/participants.schema'
import { TaskDocument } from '~/models/schemas/task.schema'
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
    return this.db.collection(collection.USER)
  }

  get tokens(): Collection<TokenDocument> {
    return this.db.collection(collection.TOKEN)
  }

  get conversations(): Collection<ConversationDocument> {
    return this.db.collection(collection.CONVERSATION)
  }

  get groups(): Collection<GroupDocument> {
    return this.db.collection(collection.GROUP)
  }

  get participants(): Collection<any> { // Change any to ParticipantDocument // để tạm any chứ sợ không kịp
    return this.db.collection(collection.PARTICIPANT)
  }

  get messages(): Collection<MessageDocument> {
    return this.db.collection(collection.MESSAGE)
  }

  get attachments(): Collection<any> { // Change any to AttachmentDocument // để tạm any chứ sợ không kịp
    return this.db.collection(collection.ATTACHMENT)
  }

  get messageAttachments(): Collection<MessageAttachmentDocument> {
    return this.db.collection(collection.MESSAGE_ATTACHMENT)
  }

  get tasks(): Collection<TaskDocument> {
    return this.db.collection(collection.TASK)
  }

  get taskAssignments(): Collection<any> { // Change any to TaskAssigneeDocument // để tạm any chứ sợ không kịp
    return this.db.collection(collection.TASK_ASSIGNMENT)
  }
}
const databaseServices = new DatabaseServices()
export default databaseServices
