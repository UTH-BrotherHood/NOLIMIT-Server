// ai-logger.js
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js'
import { Configuration, OpenAIApi } from 'openai'

export class AILoggerBot {
  constructor(config) {
    this.config = {
      discordToken: config.discordToken,
      openaiApiKey: config.openaiApiKey,
      allowedChannels: config.allowedChannels ?? [],
      allowedUsers: config.allowedUsers ?? [],
      allowedRoles: config.allowedRoles ?? [],
      ...config
    }

    this.setupDiscord()
    this.setupOpenAI()
  }

  setupOpenAI() {
    const configuration = new Configuration({
      apiKey: this.config.openaiApiKey
    })
    this.openai = new OpenAIApi(configuration)
  }

  setupDiscord() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })

    this.client.on('ready', () => this.handleReady())
    this.client.on('messageCreate', (msg) => this.handleMessage(msg))

    this.client.login(this.config.discordToken)
  }

  handleReady = () => {
    console.log(`Logged in as ${this.client.user.tag}`)
    this.client.user.setActivity('analyzing logs with AI', { type: 'Playing' })
  }

  handleMessage = async (message) => {
    if (message.author.bot) return

    if (!this.hasAccess(message)) return

    const commands = {
      '!ai': (query) => this.handleAIQuery(message, query),
      '!analyze': (logs) => this.analyzeLogsWithAI(message, logs),
      '!report': (timeframe) => this.generateAIReport(message, timeframe),
      '!suggest': (issue) => this.getSuggestions(message, issue)
    }

    for (const [prefix, handler] of Object.entries(commands)) {
      if (message.content.startsWith(prefix)) {
        const content = message.content.slice(prefix.length).trim()
        await handler(content)
        break
      }
    }
  }

  hasAccess = (message) => {
    const hasAllowedRole = message.member?.roles.cache.some((role) => this.config.allowedRoles.includes(role.id))

    const isAllowedUser = this.config.allowedUsers.includes(message.author.id)
    const isAllowedChannel = this.config.allowedChannels.includes(message.channel.id)

    return hasAllowedRole || isAllowedUser || isAllowedChannel
  }

  handleAIQuery = async (message, query) => {
    try {
      const thinking = await message.channel.send('🤔 Đang suy nghĩ...')

      const completion = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Bạn là một chuyên gia phân tích log và giải quyết vấn đề. Hãy giúp người dùng hiểu và xử lý các vấn đề từ log của họ.'
          },
          {
            role: 'user',
            content: query
          }
        ]
      })

      const response = completion.data.choices[0].message.content

      const embed = new EmbedBuilder()
        .setTitle('🤖 AI Response')
        .setDescription(response)
        .setColor('#0099ff')
        .setFooter({ text: 'Powered by GPT-3.5' })

      await thinking.delete()
      await message.reply({ embeds: [embed] })
    } catch (error) {
      console.error('OpenAI Error:', error)
      await message.reply('❌ Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.')
    }
  }

  analyzeLogsWithAI = async (message, logs) => {
    try {
      const thinking = await message.channel.send('🔍 Đang phân tích logs...')

      const completion = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Phân tích log sau và cung cấp insights về các vấn đề, nguyên nhân và đề xuất giải pháp:'
          },
          {
            role: 'user',
            content: logs
          }
        ]
      })

      const analysis = completion.data.choices[0].message.content

      const embed = new EmbedBuilder()
        .setTitle('📊 Log Analysis')
        .setDescription(analysis)
        .setColor('#00ff00')
        .addFields({ name: 'Raw Logs', value: logs.substring(0, 1000) + '...' })
        .setTimestamp()

      await thinking.delete()
      await message.reply({ embeds: [embed] })
    } catch (error) {
      console.error('Analysis Error:', error)
      await message.reply('❌ Không thể phân tích logs.')
    }
  }

  generateAIReport = async (message, timeframe) => {
    try {
      const logs = await this.fetchLogs(timeframe)

      const completion = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tạo báo cáo tổng hợp từ dữ liệu logs sau:'
          },
          {
            role: 'user',
            content: JSON.stringify(logs)
          }
        ]
      })

      const report = completion.data.choices[0].message.content

      const embed = new EmbedBuilder()
        .setTitle(`📑 AI Report - ${timeframe}`)
        .setDescription(report)
        .setColor('#ff9900')
        .setTimestamp()

      await message.reply({ embeds: [embed] })
    } catch (error) {
      console.error('Report Error:', error)
      await message.reply('❌ Không thể tạo báo cáo.')
    }
  }

  getSuggestions = async (message, issue) => {
    try {
      const completion = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Đề xuất các giải pháp cho vấn đề sau trong hệ thống:'
          },
          {
            role: 'user',
            content: issue
          }
        ]
      })

      const suggestions = completion.data.choices[0].message.content

      const embed = new EmbedBuilder()
        .setTitle('💡 AI Suggestions')
        .setDescription(suggestions)
        .setColor('#ff00ff')
        .setTimestamp()

      await message.reply({ embeds: [embed] })
    } catch (error) {
      console.error('Suggestion Error:', error)
      await message.reply('❌ Không thể đưa ra đề xuất.')
    }
  }

  fetchLogs = async (timeframe) => {
    // Implement logic lấy logs theo timeframe
    return []
  }
}

// Tạo instance mặc định (optional)
export const createAILogger = (config) => new AILoggerBot(config)
