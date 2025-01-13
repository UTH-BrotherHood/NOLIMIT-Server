import { Client, GatewayIntentBits, TextChannel } from 'discord.js'

const { DISCORD_CHANNEL_ID, DISCORD_TOKEN } = process.env

class LoggerService {
  private client: Client
  private channelId: string | undefined

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })

    this.channelId = DISCORD_CHANNEL_ID

    this.client.on('ready', () => {
      if (this.client.user) {
        console.log(`Logged in as ${this.client.user.tag}!`)
      }
    })

    this.client.login(DISCORD_TOKEN).catch((err) => {
      console.error('Failed to login to Discord:', err)
    })
  }

  sendToFormatCode(logData: { code: Record<string, unknown>; message?: string; title?: string }): void {
    const { code, message = 'This is some additional information about the code.', title = 'Code Example' } = logData

    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt('00ff00', 16), // Convert hexadecimal color code to integer
          title,
          description: '```json\n' + JSON.stringify(code, null, 2) + '\n```'
        }
      ]
    }

    const channel = this.client.channels.cache.get(this.channelId || '') as TextChannel
    if (!channel) {
      console.error(`Couldn't find the channel...`, this.channelId)
      return
    }
    channel.send(codeMessage).catch((err) => {
      console.error('Failed to send message to channel:', err)
    })
  }

  sendToMessage(message: string = 'message'): void {
    const channel = this.client.channels.cache.get(this.channelId || '') as TextChannel
    if (!channel) {
      console.error(`Couldn't find the channel...`, this.channelId)
      return
    }
    channel.send(message).catch((err) => {
      console.error('Failed to send message to channel:', err)
    })
  }
}

export default new LoggerService()
