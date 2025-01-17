import { Client, GatewayIntentBits, TextChannel, Partials, PermissionsBitField, Channel } from 'discord.js'
import { EventEmitter } from 'events'

interface LogData {
  code: Record<string, unknown>
  message?: string
  title?: string
  context?: string
}

export class LoggerService extends EventEmitter {
  // Private instance variables with proper typing
  private readonly client: Client
  private readonly channelId: string
  private static instance: LoggerService | null = null
  private initializationPromise: Promise<void> | null = null
  private channel: TextChannel | null = null

  private constructor() {
    super()

    // Environment variable validation
    if (!process.env.DISCORD_TOKEN) {
      throw new Error('Missing DISCORD_TOKEN environment variable')
    }
    if (!process.env.DISCORD_CHANNEL_ID) {
      throw new Error('Missing DISCORD_CHANNEL_ID environment variable')
    }

    console.log('Initializing with channel ID:', process.env.DISCORD_CHANNEL_ID)
    this.channelId = process.env.DISCORD_CHANNEL_ID

    // Initialize Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ],
      partials: [Partials.Channel]
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.client.on('ready', async () => {
      if (this.client.user) {
        console.log(`Discord Logger: Logged in as ${this.client.user.tag}`)
        console.log('Bot is in following servers:')
        this.client.guilds.cache.forEach(guild => {
          console.log(`- ${guild.name} (${guild.id})`)
          guild.channels.cache.forEach(channel => {
            console.log(`  - ${channel.name} (${channel.id})`)
          })
        })
        await this.initializeChannel()
        this.emit('ready')
      }
    })

    this.client.on('error', (error) => {
      console.error('Discord Logger: Client error:', error)
      this.emit('error', error)
    })
  }

  private async validateChannelAccess(channel: TextChannel): Promise<void> {
    const permissions = channel.permissionsFor(this.client.user!)
    if (!permissions) {
      throw new Error('Cannot get channel permissions')
    }

    const requiredPermissions = [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory
    ]

    const missingPermissions = requiredPermissions.filter(perm => !permissions.has(perm))
    if (missingPermissions.length > 0) {
      throw new Error(`Missing required permissions: ${missingPermissions.join(', ')}`)
    }
  }

  private async initializeChannel(): Promise<void> {
    try {
      console.log('Starting channel initialization...')
      console.log(`Attempting to find channel with ID: ${this.channelId}`)

      // First try to get from cache
      let foundChannel = this.client.channels.cache.get(this.channelId)

      if (!foundChannel) {
        console.log('Channel not found in cache, attempting to fetch...')
        try {
          // Using proper type assertion for fetched channel
          foundChannel = await this.client.channels.fetch(this.channelId) || undefined
          console.log('Channel fetched:', foundChannel?.constructor.name)
        } catch (error: any) {
          console.error('Fetch error details:', {
            error: error.message,
            code: error.code,
            status: error.status
          })
          throw new Error(`Failed to fetch channel: ${error.message}`)
        }
      }

      if (!foundChannel) {
        throw new Error(`Channel ${this.channelId} not found`)
      }

      if (!(foundChannel instanceof TextChannel)) {
        throw new Error(`Channel ${this.channelId} is not a text channel (found ${foundChannel.constructor.name})`)
      }

      // Validate channel access
      await this.validateChannelAccess(foundChannel)

      this.channel = foundChannel
      console.log(`Successfully initialized channel: ${foundChannel.name} in ${foundChannel.guild.name}`)
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      console.error('Channel initialization failed:', {
        error: errorMessage,
        channelId: this.channelId,
        botId: this.client.user?.id
      })
      throw new Error(`Channel initialization failed: ${errorMessage}`)
    }
  }

  // Static method for singleton instance
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  // Rest of the methods remain the same
  public async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = new Promise(async (resolve, reject) => {
      try {
        await this.client.login(process.env.DISCORD_TOKEN)

        await new Promise<void>((resolveChannel) => {
          this.once('ready', () => {
            resolveChannel()
          })
        })

        resolve()
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error'
        this.initializationPromise = null
        reject(new Error(`Initialization failed: ${errorMessage}`))
      }
    })

    return this.initializationPromise
  }

  public async sendToFormatCode(logData: LogData): Promise<void> {
    if (!this.channel) {
      throw new Error('Logger channel is not initialized');
    }

    const embed = {
      title: logData.title || 'Log Message',
      description: logData.message || 'No message provided',
      color: 0x3498db,
      fields: [
        ...(logData.context
          ? [{ name: 'Context', value: logData.context }]
          : []),
        ...Object.entries(logData.code).map(([key, value]) => ({
          name: key,
          value: '```json\n' + JSON.stringify(value, null, 2) + '\n```',
        })),
      ],
      timestamp: new Date().toISOString(),
    };

    try {
      await this.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send formatted log:', error);
    }
  }

  public async sendToMessage(message: string = 'message'): Promise<void> {
    if (!this.channel) {
      throw new Error('Logger channel is not initialized');
    }

    try {
      await this.channel.send(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

}

// Export singleton instance
export const discordLogger = LoggerService.getInstance()